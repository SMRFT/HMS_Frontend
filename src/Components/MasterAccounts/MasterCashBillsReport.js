import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input, Tabs } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Banknote } from "lucide-react";
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

const MasterCashBillsReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
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
    const [activeCategory, setActiveCategory] = useState("all");

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
            const url = `${HmsBaseUrl}master-accounts/cash-bills-summary/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Cash Bills Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const filteredBills = useMemo(() => {
        let list = getSafeArray(reportData?.data);
        if (activeCategory !== "all") {
            list = list.filter(b => b.category === activeCategory);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(b =>
            String(b.bill_no || "").toLowerCase().includes(q) ||
            String(b.patient_name || "").toLowerCase().includes(q) ||
            String(b.mr_no || "").toLowerCase().includes(q) ||
            String(b.ip_number || "").toLowerCase().includes(q)
        );
    }, [reportData, activeCategory, searchTerm]);

    const summary = reportData?.summary || {};
    const categorySummary = reportData?.category_summary || {};

    const handleExport = () => {
        const rows = (filteredBills || []).map(b => ({
            "Bill No": b.bill_no,
            "Date": b.date,
            "Category": b.category,
            "UHID (MR No)": b.mr_no,
            "IP No": b.ip_number,
            "Patient Name": b.patient_name,
            "Cash Amount": b.cash,
            "Payment Mode": b.payment_mode,
            "Shift No": b.shift_no
        }));
        exportToExcel(rows, "Master_Cash_Bills_Summary", "CashBills");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Cash Bills Summary Report
                            <span className="badge">Direct Receipts</span>
                        </h1>
                        <p>Complete register of direct cash receipts categorized by hospital billing heads</p>
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
                            <label>Outlet:</label>
                            <Select value={outlet} onChange={setOutlet} style={{ width: 180 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Category:</label>
                            <Select value={activeCategory} onChange={setActiveCategory} style={{ width: 180 }}>
                                <Option value="all">All Categories</Option>
                                {Object.keys(categorySummary).map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
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
                            title="CashBillsReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Complete register of direct cash receipts categorized by hospital billing heads"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Gross Cash Bills</span>
                            <span className="kpi-value">₹{formatINR(summary.total_cash_bills)}</span>
                            <span className="kpi-subtitle">Total receipts collected</span>
                        </KPICard>
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Counter Expenses Paid</span>
                            <span className="kpi-value">₹{formatINR(summary.total_expenses)}</span>
                            <span className="kpi-subtitle">Petty expense payouts</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Net Cash Receipts</span>
                            <span className="kpi-value">₹{formatINR(summary.net_cash_receipts)}</span>
                            <span className="kpi-subtitle">Net available cash</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Cash Bills Count</span>
                            <span className="kpi-value">{summary.total_bills_count || 0}</span>
                            <span className="kpi-subtitle">Vouchers & invoices</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>UHID (MR No)</th>
                                    <th>IP No</th>
                                    <th>Patient Name</th>
                                    <th>Payment Mode</th>
                                    <th>Shift #</th>
                                    <th className="text-right">Cash Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((b, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{b.bill_no}</strong></td>
                                        <td>{b.date}</td>
                                        <td><Tag color="geekblue">{b.category}</Tag></td>
                                        <td className="font-mono">{b.mr_no || "-"}</td>
                                        <td className="font-mono">{b.ip_number || "-"}</td>
                                        <td>{b.patient_name || "General"}</td>
                                        <td>{b.payment_mode || "Cash"}</td>
                                        <td>Shift {b.shift_no || 1}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                            {formatINR(b.cash)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={8}><strong>TOTAL CASH BILLS ({filteredBills.length} RECORDS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(filteredBills.reduce((acc, x) => acc + (x.cash || 0), 0))}
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

export default MasterCashBillsReport;
