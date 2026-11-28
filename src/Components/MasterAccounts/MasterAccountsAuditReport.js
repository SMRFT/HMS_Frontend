import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker, Spin, Tag, Popover } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "../Accounts/printAccountsReport";
import { cleanNum, formatINR, matchCategoryOrBillType } from "./masterAccountsHelper";
import {
    PageWrapper,
    colors,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Select,
    Button,
    TableWrapper,
    SectionTitle,
} from "../GlobalStyles";

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const SummaryValue = styled.h3`
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: ${colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

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
        padding: 6px 10px !important;
    }
`;

const SourceHeaderTr = styled.tr`
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
        padding: 5px 10px 5px 22px !important;
    }
`;

const BillTypeHeaderTr = styled.tr`
    background: #f8fafc !important;
    td {
        background: #f8fafc !important;
        font-weight: 700 !important;
        color: #0369a1 !important;
        font-size: 0.82rem !important;
        letter-spacing: 0.02em;
        border-top: 1px dashed #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 4px 10px 4px 38px !important;
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

const AuditTable = styled.table`
    width: 100%;
    border-collapse: collapse !important;
    table-layout: fixed;

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 6px !important;
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
        white-space: normal;
        word-break: break-word;
        overflow-wrap: break-word;
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
        background: #0f172a !important;
        color: #ffffff !important;
        font-weight: 800;
        border-top: 2px solid #0284c7 !important;

        td {
            padding: 8px 8px !important;
            font-size: 0.88rem !important;
            color: #ffffff !important;
        }
    }
`;

const sourceColors = {
    "Registration Billing": { bg: "#eff6ff", color: "#2563eb" },
    "Pharmacy Billing": { bg: "#f0fdfa", color: colors.primary },
    "Sales Return": { bg: "#fef2f2", color: colors.danger },
    "Investigation Billing": { bg: "#fffbeb", color: "#d97706" },
};

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        width: 100%;
        background: white;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
    p { margin: 2px 0; font-size: 11px; }
    .report-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-transform: uppercase; text-decoration: underline; }
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;
    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

const extractEditedDate = (val) => {
    if (!val) return "Unknown Date";
    const s = String(val).trim();
    const firstPart = s.split(" ")[0];
    if (firstPart.includes("/")) return firstPart;
    if (firstPart.includes("-") && firstPart.length === 10) {
        const parts = firstPart.split("-");
        if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return firstPart;
    }
    return firstPart || "Unknown Date";
};

const extractEditedTime = (val) => {
    if (!val) return "-";
    const s = String(val).trim();
    if (s.includes(" ")) {
        return s.split(" ").slice(1).join(" ");
    }
    return "-";
};

const MasterAccountsAuditReport = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    initialOutlet,
    outlet,
    billType,
    initialBillType,
    category,
    onLoadOptions
}) => {
    const effectiveCategory = billType || initialBillType || category || "all";
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [sourceFilter, setSourceFilter] = useState(effectiveCategory);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ count: 0, by_source: {} });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        const c = billType || initialBillType || category;
        if (c !== undefined && c !== sourceFilter) {
            setSourceFilter(c);
        }
    }, [billType, initialBillType, category, sourceFilter]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const selectedOutlet = outlet || initialOutlet;
            let url = `${HmsBaseUrl}master-accounts/accounts-audit/?from_date=${fromDate}&to_date=${toDate}`;
            if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "All") {
                url += `&outlet_code=${encodeURIComponent(selectedOutlet)}`;
            }
            const response = await apiRequest(url, "GET");
            if (response && response.success) {
                const resData = response.data || response;
                setReportData(Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []));
                setSummary(resData.summary || { count: (resData.data || []).length, by_source: {} });
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching audit report:", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, initialOutlet, HmsBaseUrl]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
    }, [fromDate, toDate, outlet, initialOutlet, fetchReport]);

    const categoriesList = useMemo(() => {
        const set = new Set();
        (reportData || []).forEach(r => {
            if (r.source) set.add(r.source);
            if (r.bill_type) set.add(r.bill_type);
        });
        return Array.from(set).sort();
    }, [reportData]);

    useEffect(() => {
        if (onLoadOptions && reportData && reportData.length > 0) {
            onLoadOptions({
                categories: categoriesList
            });
        }
    }, [onLoadOptions, categoriesList, reportData]);

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const filteredData = useMemo(() => {
        if (!sourceFilter || sourceFilter.toLowerCase() === "all") return reportData;
        return (reportData || []).filter(r => 
            matchCategoryOrBillType(r.source, sourceFilter) || 
            matchCategoryOrBillType(r.bill_type, sourceFilter)
        );
    }, [reportData, sourceFilter]);

    // 3-Level Grouping: Edited Date -> Source -> Bill Type
    const groupedData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        const dateMap = new Map();

        filteredData.forEach(row => {
            const dateKey = extractEditedDate(row.edited_date);
            const sourceKey = String(row.source || "Other Billing").trim();
            const billTypeKey = String(row.bill_type || row.source || "Standard").trim();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const srcMap = dateMap.get(dateKey);
            if (!srcMap.has(sourceKey)) {
                srcMap.set(sourceKey, new Map());
            }
            const btMap = srcMap.get(sourceKey);
            if (!btMap.has(billTypeKey)) {
                btMap.set(billTypeKey, []);
            }
            btMap.get(billTypeKey).push(row);
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((srcMap, dateKey) => {
            const sources = [];
            let dateOldTotal = 0;
            let dateNewTotal = 0;
            let dateCount = 0;

            srcMap.forEach((btMap, sourceKey) => {
                const billTypes = [];
                let srcOldTotal = 0;
                let srcNewTotal = 0;
                let srcCount = 0;

                btMap.forEach((items, billTypeKey) => {
                    let btOldTotal = 0;
                    let btNewTotal = 0;

                    // Sort items naturally by record_no ascending
                    const sortedItems = [...items].sort((a, b) => {
                        const s1 = String(a.record_no || "").trim();
                        const s2 = String(b.record_no || "").trim();
                        return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    const enrichedItems = sortedItems.map(it => {
                        const oldVal = cleanNum(it.old_value);
                        const newVal = cleanNum(it.new_value);
                        btOldTotal += oldVal;
                        btNewTotal += newVal;

                        return {
                            ...it,
                            displaySlno: runningSlno++,
                            oldVal,
                            newVal,
                            timeStr: extractEditedTime(it.edited_date)
                        };
                    });

                    billTypes.push({
                        billType: billTypeKey,
                        items: enrichedItems,
                        oldTotal: btOldTotal,
                        newTotal: btNewTotal,
                        count: enrichedItems.length
                    });

                    srcOldTotal += btOldTotal;
                    srcNewTotal += btNewTotal;
                    srcCount += enrichedItems.length;
                });

                sources.push({
                    source: sourceKey,
                    billTypes,
                    oldTotal: srcOldTotal,
                    newTotal: srcNewTotal,
                    count: srcCount
                });

                dateOldTotal += srcOldTotal;
                dateNewTotal += srcNewTotal;
                dateCount += srcCount;
            });

            result.push({
                date: dateKey,
                sources,
                oldTotal: dateOldTotal,
                newTotal: dateNewTotal,
                count: dateCount
            });
        });

        return result;
    }, [filteredData]);

    const grandOldTotal = filteredData.reduce((a, r) => a + cleanNum(r.old_value), 0);
    const grandNewTotal = filteredData.reduce((a, r) => a + cleanNum(r.new_value), 0);

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = [];
            groupedData.forEach(dg => {
                dg.sources.forEach(src => {
                    src.billTypes.forEach(bt => {
                        bt.items.forEach(row => {
                            rows.push({
                                "S.No": row.displaySlno,
                                "Edited Date": dg.date,
                                "Time": row.timeStr || "",
                                "Source": src.source,
                                "Bill Type": bt.billType,
                                "Record No": row.record_no || "",
                                "Original Bill No": row.original_bill_no || row.record_no || "",
                                "UHID": row.uhid || "",
                                "Patient Name": row.patient_name || "",
                                "Billing Details / Change": row.description || "",
                                "Old Value (₹)": row.oldVal > 0 ? row.oldVal : (row.old_value || "-"),
                                "New Value (₹)": row.newVal > 0 ? row.newVal : (row.new_value || "-"),
                                "Requested By": row.requested_by || row.edited_by_name || "-",
                                "Approved By": row.approved_by || row.edited_by_name || "-"
                            });
                        });
                    });
                });
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
            XLSX.writeFile(wb, `Master_Audit_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>
            {!isModalView && (
                <SectionTitle className="no-print">
                    <h3>Accounts Audit Report (Audit Trail)</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        Transactional audit trail with Edited Date, Source &amp; Bill Type grouping
                    </p>
                </SectionTitle>
            )}

            {!isModalView && (
                <FilterSection className="no-print">
                    <FormRow>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker
                                value={fromDate ? dayjs(fromDate) : null}
                                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : fromDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Billing Source</Label>
                            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ height: "38px" }}>
                                <option value="all">All Sources</option>
                                <option value="Registration Billing">Registration Billing</option>
                                <option value="Pharmacy Billing">Pharmacy Billing</option>
                                <option value="Sales Return">Sales Return</option>
                                <option value="Investigation Billing">Investigation Billing</option>
                            </Select>
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "38px" }}>
                                <FaSearch style={{ marginRight: "6px" }} /> {loading ? "Searching..." : "Search"}
                            </Button>
                            <Button 
                                onClick={handleExportExcel} 
                                disabled={loading || filteredData.length === 0} 
                                style={{ height: "38px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                            >
                                <FaFileExcel style={{ marginRight: "6px" }} /> Export Excel
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "38px" }}>
                                <FaPrint style={{ marginRight: "6px" }} /> Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>
            )}

            {!isModalView && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Total Audited Logs</SummaryLabel>
                        <SummaryValue>{summary.count || filteredData.length}</SummaryValue>
                    </SummaryCard>
                    {Object.entries(summary.by_source || {}).map(([src, count]) => (
                        <SummaryCard key={src} color={sourceColors[src]?.color || colors.secondary}>
                            <SummaryLabel>{src}</SummaryLabel>
                            <SummaryValue>{count}</SummaryValue>
                        </SummaryCard>
                    ))}
                </div>
            )}

            {/* PRINTABLE AREA */}
            <div id="printable-report-area">
                <PrintTemplate>
                    <PrintHeader>
                        <h1>{hospital_name}</h1>
                        <p>{branch_name}</p>
                        <div className="report-title">ACCOUNTS AUDIT REPORT</div>
                        <p style={{ marginTop: "4px" }}>
                            <strong>Period:</strong> {dayjs(fromDate).format("DD/MM/YYYY")} to {dayjs(toDate).format("DD/MM/YYYY")} | <strong>Source:</strong> {sourceFilter === "all" ? "All Sources" : sourceFilter} | <strong>Printed On:</strong> {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                        </p>
                    </PrintHeader>
                </PrintTemplate>

                <TableWrapper>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Spin size="large" />
                            <p style={{ marginTop: "12px", color: colors.textMuted }}>Loading audit records...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "50px", color: colors.textMuted }}>
                            No audit modifications found for the selected period and billing source.
                        </div>
                    ) : (
                        <AuditTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "4%", textAlign: "center" }}>S.No</th>
                                    <th style={{ width: "12%" }}>Record No</th>
                                    <th style={{ width: "7%" }}>Time</th>
                                    <th style={{ width: "9%" }}>UHID</th>
                                    <th style={{ width: "14%" }}>Patient Name</th>
                                    <th style={{ width: "24%" }}>Billing Details / Change</th>
                                    <th style={{ width: "7.5%", textAlign: "right" }}>Old Value (₹)</th>
                                    <th style={{ width: "7.5%", textAlign: "right" }}>New Value (₹)</th>
                                    <th style={{ width: "7.5%" }}>Requested By</th>
                                    <th style={{ width: "7.5%" }}>Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.map((dg) => (
                                    <React.Fragment key={dg.date}>
                                        {/* Level 1: Edited Date Header */}
                                        <DateHeaderTr>
                                            <td colSpan={10}>
                                                Edited Date : {dg.date}
                                            </td>
                                        </DateHeaderTr>

                                        {dg.sources.map((src) => (
                                            <React.Fragment key={`${dg.date}-${src.source}`}>
                                                {/* Level 2: Source Sub-Header */}
                                                <SourceHeaderTr>
                                                    <td colSpan={10}>
                                                        Source : {src.source}
                                                    </td>
                                                </SourceHeaderTr>

                                                {src.billTypes.map((bt) => (
                                                    <React.Fragment key={`${dg.date}-${src.source}-${bt.billType}`}>
                                                        {/* Level 3: Bill Type Sub-Header */}
                                                        <BillTypeHeaderTr>
                                                            <td colSpan={10}>
                                                                Bill Type : {bt.billType}
                                                            </td>
                                                        </BillTypeHeaderTr>

                                                        {/* Item rows inside this Bill Type */}
                                                        {bt.items.map((row) => {
                                                            const details = Array.isArray(row.billing_details) ? row.billing_details : [];
                                                            const hasDetails = details.length > 0;
                                                            
                                                            const detailsPopoverContent = hasDetails ? (
                                                                <div style={{ maxWidth: 320, maxHeight: 220, overflowY: "auto" }}>
                                                                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
                                                                        Itemized Breakdown
                                                                    </div>
                                                                    {details.map((it, idx) => {
                                                                        const itemName = it.name || it.item_name || it.itemName || it.particular || (it.item_id ? `Item #${it.item_id}` : "Item");
                                                                        const itemQty = it.quantity ?? it.qty ?? 1;
                                                                        const itemAmt = it.amount ?? it.total ?? it.calculated_price ?? it.price ?? 0;
                                                                        return (
                                                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", padding: "3px 0", borderBottom: "1px dashed #f1f5f9" }}>
                                                                                <span style={{ maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                                    {itemName} {itemQty ? `x${itemQty}` : ""}
                                                                                </span>
                                                                                <span style={{ fontWeight: 600, fontFamily: "monospace", marginLeft: 8 }}>₹{formatINR(itemAmt)}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : null;

                                                            return (
                                                                <tr key={row.id || row.displaySlno}>
                                                                    <td className="text-center font-mono">{row.displaySlno}</td>
                                                                    <td className="font-mono" style={{ fontWeight: 700 }}>
                                                                        {row.record_no}
                                                                        {row.original_bill_no && row.original_bill_no !== row.record_no && (
                                                                            <div style={{ fontSize: "10px", color: colors.textMuted }}>Orig: {row.original_bill_no}</div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ color: "#475569" }}>{row.timeStr}</td>
                                                                    <td className="font-mono" style={{ color: "#64748b" }}>{row.uhid || "-"}</td>
                                                                    <td><strong>{row.patient_name || "-"}</strong></td>
                                                                    <td style={{ fontSize: "0.85rem" }}>
                                                                        <div>{row.description}</div>
                                                                        {hasDetails && (
                                                                            <Popover content={detailsPopoverContent} trigger="hover">
                                                                                <span style={{ fontSize: "11px", color: "#0284c7", cursor: "pointer", textDecoration: "underline" }}>
                                                                                    View {details.length} item{details.length > 1 ? "s" : ""}
                                                                                </span>
                                                                            </Popover>
                                                                        )}
                                                                    </td>
                                                                    <td className="text-right font-mono" style={{ color: colors.danger }}>
                                                                        {row.oldVal > 0 ? `₹${formatINR(row.oldVal)}` : (row.old_value !== "-" ? row.old_value : "-")}
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ color: colors.success }}>
                                                                        {row.newVal > 0 ? `₹${formatINR(row.newVal)}` : (row.new_value || "-")}
                                                                    </td>
                                                                    <td style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                                                                        {row.requested_by || row.edited_by_name || "-"}
                                                                    </td>
                                                                    <td style={{ fontSize: "0.85rem", fontWeight: 600, color: "#16a34a" }}>
                                                                        {row.approved_by || row.edited_by_name || "-"}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {/* Bill Type Subtotal Row */}
                                                        <SubtotalTr>
                                                            <td colSpan={6} className="text-right font-bold">
                                                                Total ({bt.billType}) -&gt;
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: colors.danger }}>
                                                                {bt.oldTotal > 0 ? `₹${formatINR(bt.oldTotal)}` : "-"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: colors.success }}>
                                                                {bt.newTotal > 0 ? `₹${formatINR(bt.newTotal)}` : "-"}
                                                            </td>
                                                            <td colSpan={2} className="text-center" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                                {bt.count} records
                                                            </td>
                                                        </SubtotalTr>
                                                    </React.Fragment>
                                                ))}

                                                {/* Source Subtotal Row (shown when multiple bill types exist) */}
                                                {src.billTypes.length > 1 && (
                                                    <SubtotalTr style={{ background: "#f1f5f9" }}>
                                                        <td colSpan={6} className="text-right font-bold" style={{ color: "#1e293b" }}>
                                                            Total ({src.source}) -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: colors.danger }}>
                                                            {src.oldTotal > 0 ? `₹${formatINR(src.oldTotal)}` : "-"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: colors.success }}>
                                                            {src.newTotal > 0 ? `₹${formatINR(src.newTotal)}` : "-"}
                                                        </td>
                                                        <td colSpan={2} className="text-center" style={{ fontSize: "0.75rem", color: "#1e293b", fontWeight: 700 }}>
                                                            {src.count} records
                                                        </td>
                                                    </SubtotalTr>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        {/* Date Subtotal Row (shown when multiple sources exist on that date) */}
                                        {dg.sources.length > 1 && (
                                            <SubtotalTr style={{ background: "#e2e8f0" }}>
                                                <td colSpan={6} className="text-right font-bold" style={{ color: "#0f172a" }}>
                                                    Date Total ({dg.date}) -&gt;
                                                </td>
                                                <td className="text-right font-mono font-bold" style={{ color: colors.danger }}>
                                                    {dg.oldTotal > 0 ? `₹${formatINR(dg.oldTotal)}` : "-"}
                                                </td>
                                                <td className="text-right font-mono font-bold" style={{ color: colors.success }}>
                                                    {dg.newTotal > 0 ? `₹${formatINR(dg.newTotal)}` : "-"}
                                                </td>
                                                <td colSpan={2} className="text-center" style={{ fontSize: "0.75rem", color: "#0f172a", fontWeight: 700 }}>
                                                    {dg.count} records
                                                </td>
                                            </SubtotalTr>
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Grand Total Summary Row */}
                                {filteredData.length > 0 && (
                                    <tr className="total-row">
                                        <td colSpan={6} className="text-right font-bold">
                                            TOTAL AUDIT LOGS ({filteredData.length} RECORDS) -&gt;
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#fca5a5" }}>
                                            ₹{formatINR(grandOldTotal)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#4ade80" }}>
                                            ₹{formatINR(grandNewTotal)}
                                        </td>
                                        <td colSpan={2} style={{ color: "#cbd5e1", textAlign: "center", fontSize: "0.75rem" }}>
                                            Approved Audit Trail
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </AuditTable>
                    )}
                </TableWrapper>

                <PrintTemplate>
                    <PrintSignatures
                        className="print-signatures"
                        style={{
                            marginTop: "48px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            width: "100%",
                            padding: "0 20px",
                            boxSizing: "border-box",
                            pageBreakInside: "avoid",
                        }}
                    >
                        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Prepared By (Auditor)</div>
                        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Finance Manager</div>
                        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Hospital Administrator</div>
                    </PrintSignatures>
                </PrintTemplate>
            </div>
        </PageWrapper>
    );
};

export default MasterAccountsAuditReport;
