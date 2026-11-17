import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, RotateCcw } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    cleanNum,
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

const MasterSalesReturnReport = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all"
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (propOutlet !== undefined && propOutlet !== outlet) {
            setOutlet(propOutlet);
        } else if (initialOutlet !== undefined && initialOutlet !== outlet && !propOutlet) {
            setOutlet(initialOutlet);
        }
    }, [propOutlet, initialOutlet]);

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

    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const url = `${HmsBaseUrl}master-accounts/sales-return/?from_date=${fDate}&to_date=${tDate}${outletParam}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Sales Return Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        // Only display records with status "Paid"
        let list = records.filter(r => String(r.status || "").toLowerCase() === "paid");
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(r =>
            String(r.return_bill_no || "").toLowerCase().includes(q) ||
            String(r.original_bill_no || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.uhid || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Return Bill No": r.return_bill_no,
            "Return Date": r.return_bill_date,
            "Original Bill No": r.original_bill_no,
            "UHID": r.uhid,
            "Patient Name": r.patient_name,
            "Return Amount": r.return_amount,
            "Payment Type": r.payment_type,
            "Pharmacist": r.pharmacist_id,
            "Status": r.status
        }));
        exportToExcel(rows, "Master_Sales_Return_Report", "SalesReturns");
    };

    const totalReturn = filtered.reduce((a, x) => a + cleanNum(x.return_amount), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Sales Return Report
                            <span className="badge">Pharmacy Returns</span>
                        </h1>
                        <p>Medicine sales returns, refunds, credit adjustments, and restocking audit trail</p>
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
                            <Input
                                placeholder="Search return bill / orig bill / patient..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 240 }}
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
                            title="SalesReturnReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Medicine sales returns, refunds, credit adjustments, and restocking audit trail"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Total Return Refunds</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(totalReturn)}</span>
                            <span className="kpi-subtitle">Value of restocked items</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Cash Refunds</span>
                            <span className="kpi-value">₹{formatINR(summary.cash_returns)}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Card / Online Refunds</span>
                            <span className="kpi-value">₹{formatINR(summary.card_returns)}</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Total Returns Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Return Bill No</th>
                                    <th>Return Date</th>
                                    <th>Original Bill No</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>Payment Type</th>
                                    <th>Pharmacist</th>
                                    <th>Status</th>
                                    <th className="text-right">Return Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{r.return_bill_no}</strong></td>
                                        <td>{r.return_bill_date}</td>
                                        <td className="font-mono">{r.original_bill_no || "-"}</td>
                                        <td className="font-mono">{r.uhid || "-"}</td>
                                        <td><strong>{r.patient_name || "General"}</strong></td>
                                        <td>{r.payment_type || "Cash"}</td>
                                        <td>{r.pharmacist_id || "Pharmacy"}</td>
                                        <td><Tag color="green">{r.status || "Paid"}</Tag></td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                            {formatINR(r.return_amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={8}><strong>TOTAL SALES RETURNS ({filtered.length} TRANSACTIONS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(summary.total_return_amount || totalReturn)}
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

export default MasterSalesReturnReport;
