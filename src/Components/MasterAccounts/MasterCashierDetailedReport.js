import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, ClipboardList } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    DataTableWrapper,
    ReportPrintHeader,
    ReportPrintFooter
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;
const { Option } = Select;

const MasterCashierDetailedReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCashier, setSelectedCashier] = useState("all");

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
                }
            } catch (e) {}
        };
        fetchOutlets();
    }, [HmsBaseUrl]);
    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);
    useEffect(() => {
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);



    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/cashier-wise-detailed/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Cashier Detailed Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const allBills = getSafeArray(reportData?.data);

    const cashierList = useMemo(() => {
        const set = new Set();
        allBills.forEach(b => {
            if (b.cashier_name) set.add(b.cashier_name);
        });
        return Array.from(set);
    }, [allBills]);

    const filteredBills = useMemo(() => {
        let list = allBills;
        if (selectedCashier !== "all") {
            list = list.filter(b => b.cashier_name === selectedCashier);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(b =>
            String(b.bill_no || "").toLowerCase().includes(q) ||
            String(b.patient_name || "").toLowerCase().includes(q) ||
            String(b.mr_no || "").toLowerCase().includes(q) ||
            String(b.cashier_name || "").toLowerCase().includes(q)
        );
    }, [allBills, selectedCashier, searchTerm]);

    const handleExport = () => {
        const rows = filteredBills.map(b => ({
            "Bill No": b.bill_no,
            "Date": b.date,
            "Cashier Name": b.cashier_name,
            "Shift No": b.shift_no,
            "Category": b.category,
            "UHID": b.mr_no,
            "Patient Name": b.patient_name,
            "Cash": b.cash,
            "Card & Bank": b.bank,
            "Credit": b.credit,
            "Total": (b.cash || 0) + (b.bank || 0) + (b.credit || 0)
        }));
        exportToExcel(rows, "Master_Cashier_Detailed_Collection", "Transactions");
    };

    const totalCash = filteredBills.reduce((acc, x) => acc + (x.cash || 0), 0);
    const totalCard = filteredBills.reduce((acc, x) => acc + (x.bank || 0), 0);
    const totalCredit = filteredBills.reduce((acc, x) => acc + (x.credit || 0), 0);
    const grandTotal = totalCash + totalCard + totalCredit;

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Cashier-Wise Detailed Collection
                            <span className="badge">Detailed Audit</span>
                        </h1>
                        <p>Line-by-line itemized collection audit per counter cashier across work shifts</p>
                    </div>
                    <div className="btn-group no-print">
                        <Button icon={<Download size={15} />} onClick={handleExport}>
                            Excel Export
                        </Button>
                        <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-report-area", "landscape")}>
                            Print Report
                        </Button>
                    </div>
                </HeaderBar>

                {!isModalView && (
                    <FilterBar className="no-print">
                        <div className="filter-item">
                            <label>Date Range:</label>
                            <RangePicker
                                value={dateRange}
                                onChange={(val) => val && setDateRange(val)}
                                format="YYYY-MM-DD"
                            />
                        </div>
                        <div className="filter-item">
                            <label>Cashier:</label>
                            <Select value={selectedCashier} onChange={setSelectedCashier} style={{ width: 180 }}>
                                <Option value="all">All Cashiers</Option>
                                {cashierList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / UHID..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                )}
            </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="CashierDetailedReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Line-by-line itemized collection audit per counter cashier across work shifts"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Total Cash</span>
                            <span className="kpi-value">₹{formatINR(totalCash)}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Card / POS</span>
                            <span className="kpi-value">₹{formatINR(totalCard)}</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Total Credit</span>
                            <span className="kpi-value">₹{formatINR(totalCredit)}</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Total Revenue</span>
                            <span className="kpi-value">₹{formatINR(grandTotal)}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Cashier</th>
                                    <th>Shift #</th>
                                    <th>Category</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th className="text-right">Cash (₹)</th>
                                    <th className="text-right">Card (₹)</th>
                                    <th className="text-right">Credit (₹)</th>
                                    <th className="text-right">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((b, idx) => {
                                    const tot = (b.cash || 0) + (b.bank || 0) + (b.credit || 0);
                                    return (
                                        <tr key={idx}>
                                            <td className="font-mono"><strong>{b.bill_no}</strong></td>
                                            <td>{b.date}</td>
                                            <td>{b.cashier_name || "Counter"}</td>
                                            <td>Shift {b.shift_no || 1}</td>
                                            <td><Tag color="blue">{b.category}</Tag></td>
                                            <td className="font-mono">{b.mr_no || "-"}</td>
                                            <td>{b.patient_name || "General"}</td>
                                            <td className="text-right font-mono">{formatINR(b.cash)}</td>
                                            <td className="text-right font-mono">{formatINR(b.bank)}</td>
                                            <td className="text-right font-mono">{formatINR(b.credit)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {formatINR(tot)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="total-row">
                                    <td colSpan={7}><strong>GRAND TOTAL ({filteredBills.length} BILLS)</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(totalCash)}</td>
                                    <td className="text-right font-mono">₹{formatINR(totalCard)}</td>
                                    <td className="text-right font-mono">₹{formatINR(totalCredit)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(grandTotal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterCashierDetailedReport;
