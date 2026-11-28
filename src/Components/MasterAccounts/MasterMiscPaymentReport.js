import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Wallet } from "lucide-react";
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
        padding: 6px 8px !important;
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
        padding: 5px 8px !important;
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
        padding: 5px 8px !important;
    }
`;

const FullWidthWrapper = styled(ReportPageWrapper)`
    max-width: 100% !important;
    width: 100% !important;
    padding-left: ${(p) => (p.$isModal ? "4px" : "16px")} !important;
    padding-right: ${(p) => (p.$isModal ? "4px" : "16px")} !important;
`;

const ResponsiveTableWrapper = styled(DataTableWrapper)`
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    @media print {
        overflow-x: visible !important;
    }
`;

const MiscTable = styled.table`
    width: 100%;
    min-width: 980px;
    border-collapse: collapse !important;
    table-layout: auto;

    @media print {
        min-width: 100% !important;
    }

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 6px !important;
        background: #f8fafc;
        font-size: 0.78rem !important;
        text-align: left;
        color: #1e293b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: normal;
        word-break: break-word;
    }

    td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 8px !important;
        font-size: 0.82rem;
        vertical-align: middle;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .font-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        font-size: 0.86rem !important;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .total-row {
        background: #f8fafc !important;
        font-weight: 800;
        border-top: 2px solid #94a3b8 !important;

        td {
            padding: 8px 8px !important;
            font-size: 0.88rem !important;
        }
    }
`;

// Fallback cleaner ensuring NO raw JSON is ever displayed in Narration / Purpose
const cleanNarrationText = (rawStr, partyName) => {
    if (!rawStr) return "-";
    const str = String(rawStr).trim();
    if (str.startsWith("{") && str.endsWith("}")) {
        try {
            const parsed = JSON.parse(str);
            const pt = String(parsed.patient_name || parsed.name || "").trim();
            const rm = String(parsed.room_no || "").trim();
            const ds = String(parsed.description || parsed.narration || parsed.reason || "").trim();

            if (ds && rm) return `${ds} (${rm.toLowerCase().startsWith("room") ? rm : `Room ${rm}`})`;
            if (ds) return ds;
            if (rm) return rm.toLowerCase().startsWith("room") ? rm : `Room ${rm}`;
            if (pt) return partyName ? "Patient Charge" : pt;

            const vals = Object.values(parsed).map(v => String(v).trim()).filter(Boolean);
            if (vals.length > 0) return vals.join(" - ");
        } catch (e) {
            return str.replace(/[{}"']/g, "").trim();
        }
    }
    return str;
};

const extractVoucherDate = (v) => {
    if (v.voucher_date && String(v.voucher_date).trim()) {
        const vd = String(v.voucher_date).trim();
        if (vd.includes("/")) return vd;
        if (vd.includes("-") && vd.length === 10) {
            const parts = vd.split("-");
            if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return vd;
    }
    const s = String(v.date || "").trim();
    if (!s) return "Unknown Date";
    const firstPart = s.split(" ")[0];
    if (firstPart.includes("/")) return firstPart;
    if (firstPart.includes("-") && firstPart.length === 10) {
        const parts = firstPart.split("-");
        if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return firstPart || "Unknown Date";
};

const extractVoucherTime = (v) => {
    if (v.voucher_time && String(v.voucher_time).trim()) {
        return String(v.voucher_time).trim();
    }
    const s = String(v.date || "").trim();
    if (!s) return "";
    if (s.includes(" ")) {
        return s.split(" ").slice(1).join(" ");
    }
    return "";
};

const MasterMiscPaymentReport = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    billType,
    initialBillType,
    category,
    onLoadOptions
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            const effOutlet = propOutlet || initialOutlet;
            const outletParam = effOutlet && effOutlet !== "all" ? `&outlet_code=${effOutlet}` : "";
            const url = `${HmsBaseUrl}master-accounts/miscellaneous-payment/?from_date=${fDate}&to_date=${tDate}${outletParam}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Misc Payment Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, propOutlet, initialOutlet]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: ["Receipt", "Payment", "Sales Return"]
            });
        }
    }, [onLoadOptions, reportData]);

    const vouchers = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const activeVoucherType = (billType || initialBillType || category || "all").toLowerCase().trim();

    const filtered = useMemo(() => {
        let list = vouchers;
        if (activeVoucherType !== "all") {
            if (activeVoucherType === "receipt" || activeVoucherType === "cash" || activeVoucherType === "bank") {
                list = list.filter(v => String(v.voucher_type || "").toLowerCase() === "receipt");
            } else if (activeVoucherType === "sales return" || activeVoucherType === "sales_return" || activeVoucherType === "return") {
                list = list.filter(v => v.is_sales_return || String(v.voucher_type || "").toLowerCase().includes("return") || String(v.account_head || "").toLowerCase().includes("sales return"));
            } else if (activeVoucherType === "payment") {
                list = list.filter(v => String(v.voucher_type || "").toLowerCase() === "payment" && !v.is_sales_return);
            }
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(v =>
            String(v.voucher_no || "").toLowerCase().includes(q) ||
            String(v.account_head || "").toLowerCase().includes(q) ||
            String(v.paid_to_or_received_from || "").toLowerCase().includes(q) ||
            String(v.narration || "").toLowerCase().includes(q) ||
            String(cleanNarrationText(v.narration, v.paid_to_or_received_from)).toLowerCase().includes(q) ||
            String(v.cashier_name || "").toLowerCase().includes(q)
        );
    }, [vouchers, activeVoucherType, searchTerm]);

    const groupedData = useMemo(() => {
        if (!filtered || filtered.length === 0) return [];

        const dateMap = new Map();

        filtered.forEach(v => {
            const dateKey = extractVoucherDate(v);
            const timeStr = extractVoucherTime(v);
            const isSR = Boolean(v.is_sales_return || String(v.voucher_type || "").toUpperCase().includes("RETURN"));
            const typeKey = isSR ? "SALES RETURN" : String(v.voucher_type || "Receipt").trim().toUpperCase();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const typeSubMap = dateMap.get(dateKey);
            if (!typeSubMap.has(typeKey)) {
                typeSubMap.set(typeKey, []);
            }
            typeSubMap.get(typeKey).push({
                ...v,
                dateKey,
                timeStr,
                isSR
            });
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((typeSubMap, dateKey) => {
            const sections = [];
            let dateReceiptTotal = 0;
            let datePaymentTotal = 0;
            let dateSalesReturnTotal = 0;
            let dateCount = 0;

            // Maintain order: Receipts first, then Payments, then Sales Returns
            const typeOrder = { "RECEIPT": 1, "PAYMENT": 2, "SALES RETURN": 3 };
            const typeKeys = Array.from(typeSubMap.keys()).sort((a, b) => {
                const oA = typeOrder[a] || (a.includes("RECEIPT") ? 1 : a.includes("RETURN") ? 3 : 2);
                const oB = typeOrder[b] || (b.includes("RECEIPT") ? 1 : b.includes("RETURN") ? 3 : 2);
                return oA - oB;
            });

            typeKeys.forEach(typeKey => {
                const items = typeSubMap.get(typeKey) || [];
                let secReceiptTotal = 0;
                let secPaymentTotal = 0;
                let secSalesReturnTotal = 0;

                // Sort items naturally by voucher_no ascending
                const sortedItems = [...items].sort((a, b) => {
                    const s1 = String(a.voucher_no || "").trim();
                    const s2 = String(b.voucher_no || "").trim();
                    return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                });

                const enrichedItems = sortedItems.map(it => {
                    const amt = Number(it.amount || 0);
                    const isRec = String(it.voucher_type || "").toLowerCase().includes("rec");
                    const isSR = Boolean(it.is_sales_return || it.isSR || String(it.voucher_type || "").toUpperCase().includes("RETURN"));

                    if (isRec) {
                        secReceiptTotal += amt;
                    } else if (isSR) {
                        secSalesReturnTotal += amt;
                    } else {
                        secPaymentTotal += amt;
                    }

                    return {
                        ...it,
                        displaySlno: runningSlno++,
                        amt,
                        isRec,
                        isSR
                    };
                });

                sections.push({
                    voucherType: typeKey,
                    isSalesReturn: typeKey === "SALES RETURN",
                    items: enrichedItems,
                    receiptTotal: secReceiptTotal,
                    paymentTotal: secPaymentTotal,
                    salesReturnTotal: secSalesReturnTotal,
                    totalOutflow: secPaymentTotal + secSalesReturnTotal,
                    count: enrichedItems.length
                });

                dateReceiptTotal += secReceiptTotal;
                datePaymentTotal += secPaymentTotal;
                dateSalesReturnTotal += secSalesReturnTotal;
                dateCount += enrichedItems.length;
            });

            result.push({
                date: dateKey,
                sections,
                dateReceiptTotal,
                datePaymentTotal,
                dateSalesReturnTotal,
                dateOutflowTotal: datePaymentTotal + dateSalesReturnTotal,
                dateCount
            });
        });

        return result;
    }, [filtered]);

    const totalReceipts = filtered.filter(v => v.voucher_type === "Receipt").reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const totalPayments = filtered.filter(v => v.voucher_type === "Payment" && !v.is_sales_return).reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const totalSalesReturns = filtered.filter(v => v.is_sales_return || v.voucher_type === "Sales Return").reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const totalOutflow = totalPayments + totalSalesReturns;

    const handleExport = () => {
        const rows = [];
        groupedData.forEach(dg => {
            dg.sections.forEach(sec => {
                sec.items.forEach(v => {
                    rows.push({
                        "SLNO": v.displaySlno,
                        "Date": dg.date,
                        "Time": v.timeStr || "",
                        "Type": sec.voucherType,
                        "Voucher No": v.voucher_no,
                        "Account Head": v.account_head || "Sundry",
                        "Party / Payee": v.paid_to_or_received_from || "-",
                        "Narration / Purpose": cleanNarrationText(v.narration, v.paid_to_or_received_from),
                        "Cashier": v.cashier_name || "Counter Staff",
                        "Receipt (₹)": v.isRec ? v.amount : 0,
                        "Payment (₹)": !v.isRec ? v.amount : 0
                    });
                });
            });
        });
        exportToExcel(rows, "Master_Misc_Payment_Report", "MiscVouchers");
    };

    return (
        <FullWidthWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Miscellaneous Payment Report
                                <span className="badge">Sundry Income & Payouts</span>
                            </h1>
                            <p>Sundry hospital receipts and counter expense vouchers (cash drawer payouts)</p>
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
                            <Input
                                placeholder="Search voucher / head / party / narration..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 280 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="MiscPaymentReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Sundry hospital receipts and counter expense vouchers (cash drawer payouts)"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Sundry Income Receipts</span>
                                <span className="kpi-value" style={{ color: "#059669" }}>₹{formatINR(summary.total_receipts || totalReceipts)}</span>
                                <span className="kpi-subtitle">Non-patient inflows</span>
                            </KPICard>
                            <KPICard $border="#f97316">
                                <span className="kpi-title">Counter Expense Payments</span>
                                <span className="kpi-value" style={{ color: "#c2410c" }}>₹{formatINR(summary.total_expenses || totalPayments)}</span>
                                <span className="kpi-subtitle">Drawer expense payouts</span>
                            </KPICard>
                            <KPICard $border="#ef4444">
                                <span className="kpi-title">Sales Returns</span>
                                <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(summary.total_sales_returns || totalSalesReturns)}</span>
                                <span className="kpi-subtitle">Pharmacy cash refunds</span>
                            </KPICard>
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Net Sundry Position</span>
                                <span className="kpi-value">₹{formatINR((summary.total_receipts || totalReceipts) - (summary.total_expenses || totalPayments) - (summary.total_sales_returns || totalSalesReturns))}</span>
                                <span className="kpi-subtitle">Receipts - (Expenses + Returns)</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <ResponsiveTableWrapper>
                        <MiscTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "4%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "10%" }}>Voucher No</th>
                                    <th style={{ width: "7%" }}>Time</th>
                                    <th style={{ width: "11%" }}>Account Head</th>
                                    <th style={{ width: "15%" }}>Party / Payee</th>
                                    <th style={{ width: "25%" }}>Narration / Purpose</th>
                                    <th style={{ width: "10%" }}>Cashier</th>
                                    <th style={{ width: "9%", textAlign: "right" }}>Receipt (₹)</th>
                                    <th style={{ width: "9%", textAlign: "right" }}>Payment / Return (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                            No miscellaneous vouchers found for the selected date range.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map((dg) => (
                                        <React.Fragment key={dg.date}>
                                            {/* Date as Main Group Header */}
                                            <DateHeaderTr>
                                                <td colSpan={9}>
                                                    Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {dg.sections.map((sec) => (
                                                <React.Fragment key={`${dg.date}-${sec.voucherType}`}>
                                                    {/* Type as Section Sub-Header */}
                                                    <SectionHeaderTr style={{
                                                        background: sec.isSalesReturn ? "#fee2e2" : sec.voucherType === "PAYMENT" ? "#ffedd5" : "#e2e8f0"
                                                    }}>
                                                        <td colSpan={9} style={{
                                                            color: sec.isSalesReturn ? "#991b1b" : sec.voucherType === "PAYMENT" ? "#9a3412" : "#1e293b",
                                                            fontWeight: 800
                                                        }}>
                                                            {sec.isSalesReturn ? "SALES RETURN (COUNTER CASH REFUND)" : sec.voucherType}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {sec.isSalesReturn ? (
                                                        <tr>
                                                            <td colSpan={9} style={{ padding: 0, border: "none" }}>
                                                                <MiscTable style={{ margin: 0 }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ width: "4%", textAlign: "center" }}>SLNO</th>
                                                                            <th style={{ width: "12%" }}>Return Bill No</th>
                                                                            <th style={{ width: "12%" }}>Original Bill No</th>
                                                                            <th style={{ width: "7%", textAlign: "center" }}>Time</th>
                                                                            <th style={{ width: "9%" }}>UHID</th>
                                                                            <th style={{ width: "15%" }}>Patient Name</th>
                                                                            <th style={{ width: "11%" }}>Requested By</th>
                                                                            <th style={{ width: "10%" }}>Approved By</th>
                                                                            <th style={{ width: "6%", textAlign: "center" }}>Details</th>
                                                                            <th style={{ width: "5%", textAlign: "center" }}>Mode</th>
                                                                            <th style={{ width: "9%", textAlign: "right" }}>Amount (₹)</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {sec.items.map((v) => (
                                                                            <tr key={v.voucher_no || v.displaySlno} style={{ background: "#fef2f2" }}>
                                                                                <td className="text-center font-mono">{v.displaySlno}</td>
                                                                                <td className="font-mono" style={{ fontWeight: 700 }}>{v.voucher_no}</td>
                                                                                <td className="font-mono">{v.original_bill_no || "-"}</td>
                                                                                <td className="text-center" style={{ color: "#475569", whiteSpace: "nowrap" }}>{v.timeStr || "-"}</td>
                                                                                <td className="font-mono">{v.uhid || "-"}</td>
                                                                                <td style={{ fontWeight: 700 }}>{v.paid_to_or_received_from || "Walk-in Patient"}</td>
                                                                                <td>{v.requested_by || v.cashier_name || "-"}</td>
                                                                                <td style={{ color: "#15803d", fontWeight: 600 }}>{v.approved_by || "-"}</td>
                                                                                <td className="text-center" style={{ color: "#2563eb", fontSize: "0.78rem" }}>
                                                                                    {v.items_count || 1} {(v.items_count || 1) === 1 ? "Item" : "Items"}
                                                                                </td>
                                                                                <td className="text-center">{v.payment_mode || "Cash"}</td>
                                                                                <td className="text-right font-mono" style={{ color: "#b91c1c", fontWeight: 700, whiteSpace: "nowrap" }}>
                                                                                    {formatINR(v.amount)}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </MiscTable>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        sec.items.map((v) => (
                                                            <tr key={v.voucher_no || v.displaySlno}>
                                                                <td className="text-center font-mono">{v.displaySlno}</td>
                                                                <td className="font-mono" style={{ fontWeight: 700 }}>{v.voucher_no}</td>
                                                                <td style={{ color: "#475569", whiteSpace: "nowrap" }}>{v.timeStr || "-"}</td>
                                                                <td><strong>{v.account_head || "Sundry"}</strong></td>
                                                                <td>{v.paid_to_or_received_from || "-"}</td>
                                                                <td>{cleanNarrationText(v.narration, v.paid_to_or_received_from)}</td>
                                                                <td>{v.cashier_name || "Counter Staff"}</td>
                                                                <td className="text-right font-mono" style={{ color: "#059669", fontWeight: v.isRec ? 700 : 400, whiteSpace: "nowrap" }}>
                                                                    {v.isRec ? formatINR(v.amount) : "-"}
                                                                </td>
                                                                <td className="text-right font-mono" style={{ color: "#dc2626", fontWeight: !v.isRec ? 700 : 400, whiteSpace: "nowrap" }}>
                                                                    {!v.isRec ? formatINR(v.amount) : "-"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}

                                                    {/* Subtotal per Type */}
                                                    <SubtotalTr style={{
                                                        background: sec.isSalesReturn ? "#fef2f2" : "inherit"
                                                    }}>
                                                        <td colSpan={7} className="text-right font-bold" style={{
                                                            color: sec.isSalesReturn ? "#991b1b" : "inherit"
                                                        }}>
                                                            Total ({sec.isSalesReturn ? "SALES RETURN" : sec.voucherType}) -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                            {sec.receiptTotal > 0 ? formatINR(sec.receiptTotal) : "-"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: sec.isSalesReturn ? "#b91c1c" : "#dc2626" }}>
                                                            {sec.totalOutflow > 0 ? formatINR(sec.totalOutflow) : "-"}
                                                        </td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}

                                            {/* Date Subtotal (shown when multiple types exist on that date) */}
                                            {dg.sections.length > 1 && (
                                                <SubtotalTr style={{ background: "#f1f5f9" }}>
                                                    <td colSpan={7} className="text-right font-bold" style={{ color: "#0f172a" }}>
                                                        Date Total ({dg.date}) -&gt;
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                        {dg.dateReceiptTotal > 0 ? formatINR(dg.dateReceiptTotal) : "-"}
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                                        {dg.dateOutflowTotal > 0 ? formatINR(dg.dateOutflowTotal) : "-"}
                                                    </td>
                                                </SubtotalTr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Total Row */}
                                <tr className="total-row">
                                    <td colSpan={7} className="text-right font-bold">
                                        TOTAL VOUCHERS ({filtered.length} TRANSACTIONS) -&gt;
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(totalReceipts)}
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(totalOutflow)}
                                    </td>
                                </tr>
                            </tbody>
                        </MiscTable>
                    </ResponsiveTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </FullWidthWrapper>
    );
};

export default MasterMiscPaymentReport;
