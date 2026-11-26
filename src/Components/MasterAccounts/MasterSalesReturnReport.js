import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
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
    fetchCachedOutlets,
    cachedApiRequest,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    DataTableWrapper,
    ReportPrintHeader,
    ReportPrintFooter,
    matchCategoryOrBillType
} from "./masterAccountsHelper";

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    td {
        background: #f1f5f9 !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        font-size: 0.90rem !important;
        letter-spacing: 0.03em;
        border-top: 2px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 5px 8px !important;
    }
`;

const SectionHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        background: #e2e8f0 !important;
        font-weight: 700 !important;
        color: #1e293b !important;
        font-size: 0.85rem !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 4px 8px !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    font-weight: 700 !important;
    td {
        background: #f8fafc !important;
        border-top: 1px dashed #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        font-size: 0.85rem !important;
        padding: 4px 8px !important;
    }
`;

const SalesReturnTable = styled.table`
    width: 100%;
    border-collapse: collapse !important;
    table-layout: fixed;

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 5px !important;
        background: #f8fafc;
        font-size: 0.78rem !important;
        text-align: left;
        color: #1e293b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    td {
        border: 1px solid #cbd5e1 !important;
        padding: 5px 6px !important;
        font-size: 0.82rem;
        vertical-align: middle;
        color: #0f172a;
    }

    td.wrap-text {
        white-space: normal !important;
        word-break: break-word !important;
        line-height: 1.25;
    }

    td.no-wrap {
        white-space: nowrap !important;
    }
`;

const { RangePicker } = DatePicker;
const { Option } = Select;

const MasterSalesReturnReport = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    billType,
    category,
    initialBillType = "all",
    onLoadOptions
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [billTypeFilter, setBillTypeFilter] = useState(billType || category || initialBillType || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const c = billType || category || initialBillType;
        if (c !== undefined && c !== billTypeFilter) {
            setBillTypeFilter(c);
        }
    }, [billType, category, initialBillType, billTypeFilter]);

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
                const data = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(data)) {
                    setOutletsList(data);
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

    const fetchReport = async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const billTypeParam = billTypeFilter && billTypeFilter !== "all" ? `&bill_type=${encodeURIComponent(billTypeFilter)}` : "";
            const url = `${HmsBaseUrl}master-accounts/sales-return/?from_date=${fDate}&to_date=${tDate}${outletParam}${billTypeParam}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
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

    const categoriesList = useMemo(() => {
        const set = new Set();
        records.forEach(r => {
            const bt = r.bill_type || r.category;
            if (bt) set.add(String(bt).trim());
        });
        return Array.from(set).sort();
    }, [records]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoriesList.length > 0 ? categoriesList : ["Pharmacy", "Investigation"]
            });
        }
    }, [onLoadOptions, categoriesList, reportData]);

    const filtered = useMemo(() => {
        // Display valid return records (Paid / Completed / Approved)
        let list = records.filter(r => !r.status || ["paid", "completed", "approved"].includes(String(r.status).toLowerCase()));
        
        if (billTypeFilter && billTypeFilter.toLowerCase() !== "all") {
            list = list.filter(r => matchCategoryOrBillType(r.bill_type || r.category, billTypeFilter));
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

    const extractReturnDate = (dateVal) => {
        if (!dateVal) return "Unknown Date";
        const s = String(dateVal).trim();
        const firstPart = s.split(" ")[0];
        if (firstPart.includes("/")) {
            return firstPart;
        }
        if (firstPart.includes("-") && firstPart.length === 10) {
            const parts = firstPart.split("-");
            if (parts[0].length === 4) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return firstPart;
        }
        return firstPart || "Unknown Date";
    };

    const extractReturnTime = (dateVal) => {
        if (!dateVal) return "";
        const s = String(dateVal).trim();
        if (s.includes(" ")) {
            return s.split(" ").slice(1).join(" ");
        }
        return "";
    };

    const groupedData = useMemo(() => {
        if (!filtered || filtered.length === 0) return [];

        const dateMap = new Map();

        filtered.forEach(r => {
            const dateKey = extractReturnDate(r.return_bill_date);
            const timeStr = extractReturnTime(r.return_bill_date);
            const billType = String(r.bill_type || r.category || "Pharmacy Return").trim();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const catMap = dateMap.get(dateKey);
            if (!catMap.has(billType)) {
                catMap.set(billType, []);
            }
            catMap.get(billType).push({
                ...r,
                dateKey,
                timeStr
            });
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((catMap, dateKey) => {
            const sections = [];
            let dateTotalAmt = 0;
            let dateCount = 0;

            catMap.forEach((items, billType) => {
                let secTotalAmt = 0;
                const enrichedItems = items.map(it => {
                    const amt = cleanNum(it.return_amount);
                    secTotalAmt += amt;
                    return {
                        ...it,
                        displaySlno: runningSlno++,
                        amt
                    };
                });

                sections.push({
                    billType,
                    items: enrichedItems,
                    totalAmt: secTotalAmt,
                    count: enrichedItems.length
                });

                dateTotalAmt += secTotalAmt;
                dateCount += enrichedItems.length;
            });

            result.push({
                date: dateKey,
                sections,
                dateTotalAmt,
                dateCount
            });
        });

        return result;
    }, [filtered]);

    const handleExport = () => {
        if (!groupedData || groupedData.length === 0) return;

        const excelRows = [];
        groupedData.forEach(dg => {
            excelRows.push({
                "SLNO": `Return Date: ${dg.date}`,
                "Return Bill No": "",
                "Original Bill No": "",
                "Return Time": "",
                "Bill Type": "",
                "UHID": "",
                "Patient Name": "",
                "Requested By": "",
                "Approved By": "",
                "Payment Type": "",
                "Status": "",
                "Return Amount (₹)": ""
            });

            dg.sections.forEach(sec => {
                excelRows.push({
                    "SLNO": sec.billType,
                    "Return Bill No": "",
                    "Original Bill No": "",
                    "Return Time": "",
                    "Bill Type": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Requested By": "",
                    "Approved By": "",
                    "Payment Type": "",
                    "Status": "",
                    "Return Amount (₹)": ""
                });

                sec.items.forEach(it => {
                    excelRows.push({
                        "SLNO": it.displaySlno,
                        "Return Bill No": it.return_bill_no,
                        "Original Bill No": it.original_bill_no || "-",
                        "Return Time": it.timeStr || "",
                        "Bill Type": sec.billType,
                        "UHID": it.uhid || "-",
                        "Patient Name": it.patient_name || "General",
                        "Requested By": it.requested_by || "-",
                        "Approved By": it.approved_by || "-",
                        "Payment Type": it.payment_type || "Cash",
                        "Status": it.status || "Paid",
                        "Return Amount (₹)": it.amt
                    });
                });

                excelRows.push({
                    "SLNO": "",
                    "Return Bill No": "",
                    "Original Bill No": "",
                    "Return Time": "",
                    "Bill Type": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Requested By": "",
                    "Approved By": "",
                    "Payment Type": "",
                    "Status": `Total (${sec.billType}) ->`,
                    "Return Amount (₹)": sec.totalAmt
                });
            });

            if (dg.sections.length > 1) {
                excelRows.push({
                    "SLNO": "",
                    "Return Bill No": "",
                    "Original Bill No": "",
                    "Return Time": "",
                    "Bill Type": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Requested By": "",
                    "Approved By": "",
                    "Payment Type": "",
                    "Status": `Date Total (${dg.date}) ->`,
                    "Return Amount (₹)": dg.dateTotalAmt
                });
            }
        });

        excelRows.push({
            "SLNO": "",
            "Return Bill No": "",
            "Original Bill No": "",
            "Return Time": "",
            "Bill Type": "",
            "UHID": "",
            "Patient Name": "",
            "Requested By": "",
            "Approved By": "",
            "Payment Type": "",
            "Status": `GRAND TOTAL ->`,
            "Return Amount (₹)": totalReturn
        });

        exportToExcel(excelRows, "Master_Sales_Return_Report", "SalesReturns");
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
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
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
                        <SalesReturnTable className="sales-return-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "3.5%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "13%" }}>Return Bill No</th>
                                    <th style={{ width: "10.5%" }}>Original Bill No</th>
                                    <th style={{ width: "6.5%", textAlign: "center" }}>Time</th>
                                    <th style={{ width: "8%" }}>UHID</th>
                                    <th style={{ width: "15%" }}>Patient Name</th>
                                    <th style={{ width: "11.5%" }}>Requested By</th>
                                    <th style={{ width: "11.5%" }}>Approved By</th>
                                    <th style={{ width: "5%", textAlign: "center" }}>Details</th>
                                    <th style={{ width: "4%", textAlign: "center" }}>Mode</th>
                                    <th style={{ width: "4%", textAlign: "center" }}>Status</th>
                                    <th style={{ width: "7.5%" }} className="text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                            No sales returns or approved investigation refunds found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            {/* Return Date Header Row */}
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={12}>
                                                    Return Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {/* Bill Type Sub-Headings */}
                                            {dg.sections.map(sec => (
                                                <React.Fragment key={`${dg.date}-${sec.billType}`}>
                                                    <SectionHeaderTr className="SectionHeader section-header">
                                                        <td colSpan={12}>
                                                            {sec.billType}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {/* Items within Bill Type */}
                                                    {sec.items.map(it => (
                                                        <tr key={it.return_bill_no + "-" + it.displaySlno}>
                                                            <td className="text-center" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                                {it.displaySlno}
                                                            </td>
                                                            <td className="font-mono no-wrap" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                                                <strong>{it.return_bill_no}</strong>
                                                            </td>
                                                            <td className="font-mono no-wrap" style={{ fontSize: "0.82rem" }}>
                                                                {it.original_bill_no || "-"}
                                                            </td>
                                                            <td className="text-center no-wrap" style={{ fontSize: "0.80rem", color: "#334155" }}>
                                                                {it.timeStr || "—"}
                                                            </td>
                                                            <td className="font-mono no-wrap" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                                                                {it.uhid || "-"}
                                                            </td>
                                                            <td className="wrap-text">
                                                                <strong style={{ fontSize: "0.86rem", color: "#0f172a" }}>
                                                                    {it.patient_name || "General"}
                                                                </strong>
                                                            </td>
                                                            <td className="wrap-text">
                                                                <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.82rem" }}>
                                                                    {it.requested_by || "-"}
                                                                </span>
                                                            </td>
                                                            <td className="wrap-text">
                                                                <span style={{ fontWeight: 600, color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.82rem" }}>
                                                                    <CheckCircle size={13} color="#16a34a" /> {it.approved_by || "-"}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                {renderBillingDetailsPopover(it)}
                                                            </td>
                                                            <td className="text-center no-wrap" style={{ fontSize: "0.82rem" }}>
                                                                {it.payment_type || "Cash"}
                                                            </td>
                                                            <td className="text-center">
                                                                <Tag color="green" style={{ margin: 0, fontSize: "0.75rem" }}>
                                                                    {it.status || "Paid"}
                                                                </Tag>
                                                            </td>
                                                            <td className="text-right font-mono font-bold no-wrap" style={{ color: "#dc2626", fontSize: "0.92rem" }}>
                                                                {formatINR(it.amt)}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Category / Bill Type Subtotal */}
                                                    <SubtotalTr className="SubtotalRow subtotal-row">
                                                        <td colSpan={11} className="text-right font-bold" style={{ color: "#475569" }}>
                                                            Total ({sec.billType}) -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626", fontSize: "0.94rem" }}>
                                                            ₹{formatINR(sec.totalAmt)}
                                                        </td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}

                                            {/* Date Subtotal if multiple categories */}
                                            {dg.sections.length > 1 && (
                                                <SubtotalTr style={{ background: "#e2e8f0 !important", fontWeight: 800 }}>
                                                    <td colSpan={11} className="text-right font-bold" style={{ color: "#1e293b" }}>
                                                        Date Total ({dg.date}) -&gt;
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626", fontSize: "0.96rem" }}>
                                                        ₹{formatINR(dg.dateTotalAmt)}
                                                    </td>
                                                </SubtotalTr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Total Row */}
                                <tr className="total-row" style={{ background: "#0f172a", color: "#ffffff" }}>
                                    <td colSpan={11} style={{ color: "#ffffff", padding: "10px" }}>
                                        <strong>GRAND TOTAL AUDITED SALES RETURNS ({filtered.length} TRANSACTIONS)</strong>
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#fca5a5", fontSize: "1.05rem", padding: "10px" }}>
                                        ₹{formatINR(summary.total_return_amount || totalReturn)}
                                    </td>
                                </tr>
                            </tbody>
                        </SalesReturnTable>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterSalesReturnReport;
