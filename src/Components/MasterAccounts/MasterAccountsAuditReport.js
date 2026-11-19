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
import { cleanNum, formatINR } from "./masterAccountsHelper";
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
    Table,
    Th,
    Td,
    Tr,
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

const SourceBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => props.bg || "#f1f5f9"};
    color: ${props => props.color || colors.textMuted};
    display: inline-block;
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

const MasterAccountsAuditReport = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    initialOutlet,
    outlet
}) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [sourceFilter, setSourceFilter] = useState("all");
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

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const selectedOutlet = outlet || initialOutlet;
            let url = `${HmsBaseUrl}master-accounts/accounts-audit/?from_date=${fromDate}&to_date=${toDate}`;
            if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "All") {
                url += `&outlet_code=${encodeURIComponent(selectedOutlet)}`;
            }
            if (sourceFilter && sourceFilter !== "all") {
                url += `&source=${encodeURIComponent(sourceFilter)}`;
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
    }, [fromDate, toDate, outlet, initialOutlet, sourceFilter, HmsBaseUrl]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
    }, [fromDate, toDate, outlet, initialOutlet, fetchReport]);

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const filteredData = useMemo(() => {
        if (sourceFilter === "all") return reportData;
        return reportData.filter(r => r.source === sourceFilter);
    }, [reportData, sourceFilter]);

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = filteredData.map((row, index) => ({
                "S.No": index + 1,
                "Source": row.source || "",
                "Bill Type": row.bill_type || row.source || "",
                "Record No": row.record_no || "",
                "Original Bill No": row.original_bill_no || row.record_no || "",
                "UHID": row.uhid || "",
                "Patient Name": row.patient_name || "",
                "Billing Details / Change": row.description || "",
                "Old Value": row.old_value !== undefined ? String(row.old_value) : "",
                "New Value": row.new_value !== undefined ? String(row.new_value) : "",
                "Requested By": row.requested_by || row.edited_by_name || "",
                "Approved By": row.approved_by || row.edited_by_name || "",
                "Date": row.edited_date || ""
            }));

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
                        Comprehensive transactional audit across Registration, Pharmacy, Sales Return &amp; Investigation billing
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
                        <Table>
                            <thead>
                                <Tr>
                                    <Th style={{ width: "45px" }}>S.No</Th>
                                    <Th style={{ width: "150px" }}>Source</Th>
                                    <Th style={{ width: "130px" }}>Bill Type</Th>
                                    <Th style={{ width: "120px" }}>Record No</Th>
                                    <Th style={{ width: "110px" }}>UHID</Th>
                                    <Th style={{ minWidth: "150px" }}>Patient Name</Th>
                                    <Th style={{ minWidth: "180px" }}>Billing Details / Change</Th>
                                    <Th style={{ width: "100px", textAlign: "right" }}>Old Value</Th>
                                    <Th style={{ width: "100px", textAlign: "right" }}>New Value</Th>
                                    <Th style={{ width: "130px" }}>Requested By</Th>
                                    <Th style={{ width: "130px" }}>Approved By</Th>
                                    <Th style={{ width: "130px" }}>Edited Date</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => {
                                    const badgeStyle = sourceColors[row.source] || { bg: "#f1f5f9", color: "#475569" };
                                    const details = Array.isArray(row.billing_details) ? row.billing_details : [];
                                    const hasDetails = details.length > 0;
                                    
                                    const detailsPopoverContent = hasDetails ? (
                                        <div style={{ maxWidth: 320, maxHeight: 220, overflowY: "auto" }}>
                                            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
                                                Itemized Breakdown
                                            </div>
                                            {details.map((it, idx) => (
                                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", padding: "3px 0", borderBottom: "1px dashed #f1f5f9" }}>
                                                    <span>{it.name || it.itemName || it.item_name || "Item"} {it.quantity ? `x${it.quantity}` : ""}</span>
                                                    <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{formatINR(it.amount || it.price || it.total_fees || 0)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;

                                    return (
                                        <Tr key={row.id || index}>
                                            <Td>{index + 1}</Td>
                                            <Td>
                                                <SourceBadge bg={badgeStyle.bg} color={badgeStyle.color}>
                                                    {row.source}
                                                </SourceBadge>
                                            </Td>
                                            <Td>
                                                <Tag color={row.source === "Investigation Billing" ? "orange" : row.source === "Pharmacy Billing" ? "cyan" : row.source === "Sales Return" ? "red" : "blue"}>
                                                    {row.bill_type || row.source}
                                                </Tag>
                                            </Td>
                                            <Td style={{ fontWeight: "700", fontFamily: "monospace" }}>
                                                {row.record_no}
                                                {row.original_bill_no && row.original_bill_no !== row.record_no && (
                                                    <div style={{ fontSize: "10px", color: colors.textMuted }}>Orig: {row.original_bill_no}</div>
                                                )}
                                            </Td>
                                            <Td style={{ fontFamily: "monospace" }}>{row.uhid || "-"}</Td>
                                            <Td><strong>{row.patient_name || "-"}</strong></Td>
                                            <Td style={{ fontSize: "0.85rem" }}>
                                                <div>{row.description}</div>
                                                {hasDetails && (
                                                    <Popover content={detailsPopoverContent} trigger="hover">
                                                        <span style={{ fontSize: "11px", color: "#0284c7", cursor: "pointer", textDecoration: "underline" }}>
                                                            View {details.length} item{details.length > 1 ? "s" : ""}
                                                        </span>
                                                    </Popover>
                                                )}
                                            </Td>
                                            <Td style={{ textAlign: "right", color: colors.danger, fontFamily: "monospace" }}>
                                                {row.old_value !== undefined && row.old_value !== null && row.old_value !== "-" 
                                                    ? (!isNaN(Number(row.old_value)) && Number(row.old_value) !== 0 ? formatINR(row.old_value) : String(row.old_value))
                                                    : (row.new_value && !isNaN(Number(row.new_value)) ? formatINR(row.new_value) : "-")}
                                            </Td>
                                            <Td style={{ textAlign: "right", color: colors.success, fontWeight: "700", fontFamily: "monospace" }}>
                                                {row.new_value !== undefined && row.new_value !== null && row.new_value !== "-" 
                                                    ? (!isNaN(Number(row.new_value)) ? formatINR(row.new_value) : String(row.new_value))
                                                    : "-"}
                                            </Td>
                                            <Td style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                                                {row.requested_by || row.edited_by_name || "-"}
                                            </Td>
                                            <Td style={{ fontSize: "0.85rem", fontWeight: 600, color: "#16a34a" }}>
                                                {row.approved_by || row.edited_by_name || "-"}
                                            </Td>
                                            <Td style={{ fontSize: "0.8rem", color: colors.textMuted }}>{row.edited_date}</Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </TableWrapper>

                <PrintTemplate>
                    <PrintSignatures>
                        <div className="sig-box">Prepared By (Auditor)</div>
                        <div className="sig-box">Finance Manager</div>
                        <div className="sig-box">Hospital Administrator</div>
                    </PrintSignatures>
                </PrintTemplate>
            </div>
        </PageWrapper>
    );
};

export default MasterAccountsAuditReport;
