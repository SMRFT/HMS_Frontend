import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SourceBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => props.bg || "#f1f5f9"};
    color: ${props => props.color || colors.textMuted};
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

const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10px;
    th, td {
        border: 1px solid #000 !important;
        padding: 5px 6px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-transform: uppercase;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
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

const AuditReport = ({ 
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
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";
    const user_id = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "Staff";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, outlet, initialOutlet]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const selectedOutlet = outlet || initialOutlet;
            let url = `${HmsBaseUrl}audit-report/?from_date=${fromDate}&to_date=${toDate}`;
            if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "All") {
                url += `&outlet_code=${encodeURIComponent(selectedOutlet)}`;
            }
            const response = await apiRequest(url, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { count: 0, by_source: {} });
            }
        } catch (error) {
            console.error("Error fetching audit report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const filteredData = sourceFilter === "all" ? reportData : reportData.filter(r => r.source === sourceFilter);

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = filteredData.map((row, index) => ({
                "S.No": index + 1,
                "Source": row.source || "",
                "Record No": row.record_no || "",
                "UHID": row.uhid || "",
                "Patient Name": row.patient_name || "",
                "Field / Change": row.description || "",
                "Old Value": row.old_value !== undefined ? String(row.old_value) : "",
                "New Value": row.new_value !== undefined ? String(row.new_value) : "",
                "Edited By": row.edited_by_name || "",
                "Edited Date": row.edited_date || ""
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
            XLSX.writeFile(wb, `Audit_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>
            {isModalView && (
                <div style={{ textAlign: "center", marginBottom: "16px", padding: "10px 0" }}>
                    <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000" }}>
                        {hospital_name}
                    </h2>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111" }}>
                        Audit Report (Edit View) From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}.
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "2px" }}>
                        Printed As On {dayjs().format("DD/MM/YYYY HH:mm:ss")}.
                    </div>
                </div>
            )}

            {!isModalView && (
                <SectionTitle className="no-print">
                    <h3>Audit Report (Edit View)</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        Cross-record edit trail: Registration, Pharmacy, Sales Return &amp; Investigation billing
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
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Source</Label>
                            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                                <option value="all">All Sources</option>
                                <option value="Registration Billing">Registration Billing</option>
                                <option value="Pharmacy Billing">Pharmacy Billing</option>
                                <option value="Sales Return">Sales Return</option>
                                <option value="Investigation Billing">Investigation Billing</option>
                            </Select>
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                                <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                            </Button>
                            <Button 
                                onClick={handleExportExcel} 
                                disabled={loading || filteredData.length === 0} 
                                style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                            >
                                <FaFileExcel style={{ marginRight: "8px" }} /> Export Excel
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                                <FaPrint style={{ marginRight: "8px" }} /> Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>
            )}

            {!isModalView && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Total Edits</SummaryLabel>
                        <SummaryValue>{summary.count}</SummaryValue>
                    </SummaryCard>
                    {Object.entries(summary.by_source || {}).map(([src, count]) => (
                        <SummaryCard key={src} color={sourceColors[src]?.color || colors.secondary}>
                            <SummaryLabel>{src}</SummaryLabel>
                            <SummaryValue>{count}</SummaryValue>
                        </SummaryCard>
                    ))}
                </div>
            )}

            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Source</Th>
                            <Th>Record No</Th>
                            <Th>UHID / Patient</Th>
                            <Th>Change</Th>
                            <Th>Old Value</Th>
                            <Th>New Value</Th>
                            <Th>Edited By</Th>
                            <Th>Edited Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td><SourceBadge bg={sourceColors[row.source]?.bg} color={sourceColors[row.source]?.color}>{row.source}</SourceBadge></Td>
                                    <Td>{row.record_no}</Td>
                                    <Td>{row.uhid ? `${row.uhid} (${row.patient_name || "Unknown"})` : "N/A"}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.description}</Td>
                                    <Td>{row.old_value}</Td>
                                    <Td>{row.new_value}</Td>
                                    <Td>{row.edited_by_name}</Td>
                                    <Td>{row.edited_date}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="9" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No edits found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
            `}</style>

            <PrintTemplate id="printable-report-area">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p>{branch_name}</p>
                    <div className="report-title">Audit Trail &amp; Edit History Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "35%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "35%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Edits:</strong> {summary.count}</td>
                            <td><strong>Source Filter:</strong> {sourceFilter === "all" ? "All Sources" : sourceFilter}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>S.No</th>
                            <th>Source</th>
                            <th>Record No</th>
                            <th>UHID / Patient</th>
                            <th>Change Details</th>
                            <th>Old Value</th>
                            <th>New Value</th>
                            <th>Edited By</th>
                            <th>Edited Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.source}</td>
                                <td>{row.record_no}</td>
                                <td>{row.uhid ? `${row.uhid} (${row.patient_name || "Unknown"})` : "N/A"}</td>
                                <td>{row.description}</td>
                                <td>{row.old_value}</td>
                                <td>{row.new_value}</td>
                                <td>{row.edited_by_name}</td>
                                <td>{row.edited_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </PrintTable>

                <PrintSignatures>
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </PrintSignatures>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default AuditReport;
