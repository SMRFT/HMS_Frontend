import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input, Tooltip, Popover } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, RotateCcw, FileText, CheckCircle } from "lucide-react";
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
    const [billTypeFilter, setBillTypeFilter] = useState("all");
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
            const billTypeParam = billTypeFilter && billTypeFilter !== "all" ? `&bill_type=${encodeURIComponent(billTypeFilter)}` : "";
            const url = `${HmsBaseUrl}master-accounts/sales-return/?from_date=${fDate}&to_date=${tDate}${outletParam}${billTypeParam}`;
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
    }, [dateRange, outlet, billTypeFilter]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        // Display valid return records (Paid / Completed / Approved)
        let list = records.filter(r => !r.status || ["paid", "completed", "approved"].includes(String(r.status).toLowerCase()));
        
        if (billTypeFilter !== "all") {
            const btf = billTypeFilter.toLowerCase();
            if (btf === "pharmacy") {
                list = list.filter(r => String(r.bill_type || r.category || "").toLowerCase().includes("pharmacy"));
            } else if (btf === "investigation") {
                list = list.filter(r => String(r.bill_type || r.category || "").toLowerCase().includes("investigation"));
            }
        }

        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(r =>
            String(r.return_bill_no || "").toLowerCase().includes(q) ||
            String(r.original_bill_no || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.uhid || "").toLowerCase().includes(q) ||
            String(r.bill_type || "").toLowerCase().includes(q) ||
            String(r.requested_by || "").toLowerCase().includes(q) ||
            String(r.approved_by || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm, billTypeFilter]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Return Bill No": r.return_bill_no,
            "Return Date": r.return_bill_date,
            "Original Bill No": r.original_bill_no,
            "Bill Type": r.bill_type || r.category || "Return",
            "UHID": r.uhid,
            "Patient Name": r.patient_name,
            "Requested By": r.requested_by || "-",
            "Approved By": r.approved_by || "-",
            "Return Amount": r.return_amount,
            "Payment Type": r.payment_type,
            "Billing Details": (r.billing_details || []).map(it => `${it.item_name || it.name} (Qty: ${it.quantity || 1}, ₹${it.amount || it.unit_price || 0})`).join("; ") || r.refund_remarks || "-",
            "Status": r.status
        }));
        exportToExcel(rows, "Master_Sales_Return_Report", "SalesReturns");
    };

    const totalReturn = filtered.reduce((a, x) => a + cleanNum(x.return_amount), 0);
    const pharmacyReturnTotal = filtered.filter(r => String(r.bill_type || "").toLowerCase().includes("pharmacy")).reduce((a, x) => a + cleanNum(x.return_amount), 0);
    const investRefundTotal = filtered.filter(r => String(r.bill_type || "").toLowerCase().includes("investigation")).reduce((a, x) => a + cleanNum(x.return_amount), 0);

    const renderBillingDetailsPopover = (r) => {
        const details = r.billing_details || [];
        if (!details || details.length === 0) {
            return <span>{r.refund_remarks || "Standard Return"}</span>;
        }
        const content = (
            <div style={{ maxWidth: 360, maxHeight: 250, overflowY: "auto" }}>
                <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                            <th style={{ padding: "4px" }}>Item / Test</th>
                            <th style={{ padding: "4px", textAlign: "center" }}>Qty</th>
                            <th style={{ padding: "4px", textAlign: "right" }}>Amt (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((it, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "4px", fontWeight: 500 }}>{it.item_name || it.name}</td>
                                <td style={{ padding: "4px", textAlign: "center" }}>{it.quantity || 1}</td>
                                <td style={{ padding: "4px", textAlign: "right", fontFamily: "monospace" }}>{formatINR(it.amount || it.unit_price || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {r.refund_remarks && (
                    <div style={{ marginTop: 6, fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>
                        <strong>Remarks:</strong> {r.refund_remarks}
                    </div>
                )}
            </div>
        );
        return (
            <Popover content={content} title="Billing Item Details" trigger="hover">
                <span style={{ cursor: "pointer", color: "#0284c7", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <FileText size={13} /> {details.length} item{details.length > 1 ? "s" : ""}
                </span>
            </Popover>
        );
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Sales Return &amp; Refund Report
                            <span className="badge">Audited Returns</span>
                        </h1>
                        <p>Medicine sales returns &amp; approved investigation refunds with billing details, requested by &amp; approved by audit trail</p>
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
                            <label>Bill Type:</label>
                            <Select value={billTypeFilter} onChange={setBillTypeFilter} style={{ width: 190 }}>
                                <Option value="all">All Bill Types</Option>
                                <Option value="pharmacy">Pharmacy Returns</Option>
                                <Option value="investigation">Investigation Refunds</Option>
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search return / orig / patient / user..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 250 }}
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
                            typeDesc="Sales returns & approved investigation refunds audit trail"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Total Return Refunds</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(totalReturn)}</span>
                            <span className="kpi-subtitle">{filtered.length} total transactions</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Pharmacy Returns</span>
                            <span className="kpi-value" style={{ color: "#0284c7" }}>₹{formatINR(summary.pharmacy_return_amount || pharmacyReturnTotal)}</span>
                            <span className="kpi-subtitle">Medicine sales returns</span>
                        </KPICard>
                        <KPICard $border="#d97706">
                            <span className="kpi-title">Investigation Refunds</span>
                            <span className="kpi-value" style={{ color: "#d97706" }}>₹{formatINR(summary.investigation_refund_amount || investRefundTotal)}</span>
                            <span className="kpi-subtitle">Approved Lab / Radiology refunds</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Returns Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                            <span className="kpi-subtitle">Cash: ₹{formatINR(summary.cash_returns || totalReturn)}</span>
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
                                    <th>Bill Type</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>Requested By</th>
                                    <th>Approved By</th>
                                    <th>Billing Details</th>
                                    <th>Payment Type</th>
                                    <th>Status</th>
                                    <th className="text-right">Return Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                            No sales returns or approved investigation refunds found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, idx) => {
                                        const isInvest = String(r.bill_type || "").toLowerCase().includes("investigation");
                                        return (
                                            <tr key={idx}>
                                                <td className="font-mono"><strong>{r.return_bill_no}</strong></td>
                                                <td style={{ whiteSpace: "nowrap" }}>{r.return_bill_date}</td>
                                                <td className="font-mono">{r.original_bill_no || "-"}</td>
                                                <td>
                                                    <Tag color={isInvest ? "orange" : "blue"}>
                                                        {r.bill_type || (isInvest ? "Investigation" : "Pharmacy")}
                                                    </Tag>
                                                </td>
                                                <td className="font-mono">{r.uhid || "-"}</td>
                                                <td><strong>{r.patient_name || "General"}</strong></td>
                                                <td><span style={{ fontWeight: 600, color: "#334155" }}>{r.requested_by || "-"}</span></td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                                        <CheckCircle size={13} color="#16a34a" /> {r.approved_by || "-"}
                                                    </span>
                                                </td>
                                                <td>{renderBillingDetailsPopover(r)}</td>
                                                <td>{r.payment_type || "Cash"}</td>
                                                <td><Tag color="green">{r.status || "Paid"}</Tag></td>
                                                <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                                    {formatINR(r.return_amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                <tr className="total-row">
                                    <td colSpan={11}><strong>TOTAL AUDITED SALES RETURNS ({filtered.length} TRANSACTIONS)</strong></td>
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
