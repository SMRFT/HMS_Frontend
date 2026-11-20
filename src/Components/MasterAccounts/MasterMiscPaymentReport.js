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

const MiscTable = styled.table`
    width: 100%;
    border-collapse: collapse !important;
    table-layout: fixed;

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 5px !important;
        background: #f8fafc;
        font-size: 0.80rem !important;
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
        padding: 6px 8px !important;
        font-size: 0.84rem;
        vertical-align: middle;
        overflow-wrap: break-word;
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

const MasterMiscPaymentReport = ({ isModalView = false, startDate, endDate }) => {
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
            const url = `${HmsBaseUrl}master-accounts/miscellaneous-payment/?from_date=${fDate}&to_date=${tDate}`;
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
    }, [dateRange]);

    const vouchers = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        let list = vouchers;
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
    }, [vouchers, searchTerm]);

    const groupedData = useMemo(() => {
        if (!filtered || filtered.length === 0) return [];

        const dateMap = new Map();

        filtered.forEach(v => {
            const dateKey = extractVoucherDate(v);
            const timeStr = extractVoucherTime(v);
            const typeKey = String(v.voucher_type || "Receipt").trim().toUpperCase();

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
                timeStr
            });
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((typeSubMap, dateKey) => {
            const sections = [];
            let dateReceiptTotal = 0;
            let datePaymentTotal = 0;
            let dateCount = 0;

            // Maintain order: Receipts first, then Payments
            const typeKeys = Array.from(typeSubMap.keys()).sort((a, b) => {
                if (a.includes("RECEIPT") && !b.includes("RECEIPT")) return -1;
                if (!a.includes("RECEIPT") && b.includes("RECEIPT")) return 1;
                return a.localeCompare(b);
            });

            typeKeys.forEach(typeKey => {
                const items = typeSubMap.get(typeKey) || [];
                let secReceiptTotal = 0;
                let secPaymentTotal = 0;

                // Sort items naturally by voucher_no ascending
                const sortedItems = [...items].sort((a, b) => {
                    const s1 = String(a.voucher_no || "").trim();
                    const s2 = String(b.voucher_no || "").trim();
                    return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                });

                const enrichedItems = sortedItems.map(it => {
                    const amt = Number(it.amount || 0);
                    const isRec = String(it.voucher_type || "").toLowerCase().includes("rec");
                    if (isRec) {
                        secReceiptTotal += amt;
                    } else {
                        secPaymentTotal += amt;
                    }

                    return {
                        ...it,
                        displaySlno: runningSlno++,
                        amt,
                        isRec
                    };
                });

                sections.push({
                    voucherType: typeKey,
                    items: enrichedItems,
                    receiptTotal: secReceiptTotal,
                    paymentTotal: secPaymentTotal,
                    count: enrichedItems.length
                });

                dateReceiptTotal += secReceiptTotal;
                datePaymentTotal += secPaymentTotal;
                dateCount += enrichedItems.length;
            });

            result.push({
                date: dateKey,
                sections,
                dateReceiptTotal,
                datePaymentTotal,
                dateCount
            });
        });

        return result;
    }, [filtered]);

    const totalReceipts = filtered.filter(v => v.voucher_type === "Receipt").reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const totalPayments = filtered.filter(v => v.voucher_type === "Payment").reduce((a, x) => a + (Number(x.amount) || 0), 0);

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
        <ReportPageWrapper $isModal={isModalView}>
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
                            <KPICard $border="#ef4444">
                                <span className="kpi-title">Counter Expense Payments</span>
                                <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(summary.total_payments || totalPayments)}</span>
                                <span className="kpi-subtitle">Drawer expense payouts</span>
                            </KPICard>
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Net Sundry Position</span>
                                <span className="kpi-value">₹{formatINR((summary.total_receipts || totalReceipts) - (summary.total_payments || totalPayments))}</span>
                                <span className="kpi-subtitle">Receipts - Payments</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <MiscTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "45px", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "110px" }}>Voucher No</th>
                                    <th style={{ width: "85px" }}>Time</th>
                                    <th style={{ width: "120px" }}>Account Head</th>
                                    <th style={{ width: "160px" }}>Party / Payee</th>
                                    <th>Narration / Purpose</th>
                                    <th style={{ width: "120px" }}>Cashier</th>
                                    <th style={{ width: "110px", textAlign: "right" }}>Receipt (₹)</th>
                                    <th style={{ width: "110px", textAlign: "right" }}>Payment (₹)</th>
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
                                                    <SectionHeaderTr>
                                                        <td colSpan={9}>
                                                            {sec.voucherType}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {/* Vouchers inside this Type */}
                                                    {sec.items.map((v) => (
                                                        <tr key={v.voucher_no || v.displaySlno}>
                                                            <td className="text-center font-mono">{v.displaySlno}</td>
                                                            <td className="font-mono" style={{ fontWeight: 700 }}>{v.voucher_no}</td>
                                                            <td style={{ color: "#475569" }}>{v.timeStr || "-"}</td>
                                                            <td><strong>{v.account_head || "Sundry"}</strong></td>
                                                            <td style={{ wordBreak: "break-word" }}>{v.paid_to_or_received_from || "-"}</td>
                                                            <td style={{ wordBreak: "break-word" }}>{cleanNarrationText(v.narration, v.paid_to_or_received_from)}</td>
                                                            <td>{v.cashier_name || "Counter Staff"}</td>
                                                            <td className="text-right font-mono" style={{ color: "#059669", fontWeight: v.isRec ? 700 : 400 }}>
                                                                {v.isRec ? formatINR(v.amount) : "-"}
                                                            </td>
                                                            <td className="text-right font-mono" style={{ color: "#dc2626", fontWeight: !v.isRec ? 700 : 400 }}>
                                                                {!v.isRec ? formatINR(v.amount) : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Subtotal per Type */}
                                                    <SubtotalTr>
                                                        <td colSpan={7} className="text-right font-bold">
                                                            Total ({sec.voucherType}) -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                            {sec.receiptTotal > 0 ? formatINR(sec.receiptTotal) : "-"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                                            {sec.paymentTotal > 0 ? formatINR(sec.paymentTotal) : "-"}
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
                                                        {dg.datePaymentTotal > 0 ? formatINR(dg.datePaymentTotal) : "-"}
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
                                        ₹{formatINR(totalPayments)}
                                    </td>
                                </tr>
                            </tbody>
                        </MiscTable>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterMiscPaymentReport;
