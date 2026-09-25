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

const fieldLabels = {
    consulting_fee: "Consulting Fee",
    registration_fee: "Registration Fee",
    total_fees: "Total Fees",
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

const DebitBillsReport = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    initialOutlet,
    outlet
}) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ count: 0, total_debit_amount: 0 });
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
            let url = `${HmsBaseUrl}debit-bills-report/?from_date=${fromDate}&to_date=${toDate}`;
            if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "All") {
                url += `&outlet_code=${encodeURIComponent(selectedOutlet)}`;
            }
            const response = await apiRequest(url, "GET");
            if (response.success && response.data) {
                const rows = Array.isArray(response.data.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                    ? response.data
                    : [];
                setReportData(rows);
                setSummary(response.data.summary || {
                    count: rows.length,
                    total_debit_amount: rows.reduce((s, r) => s + (r.debit_amount || 0), 0)
                });
            }
        } catch (error) {
            console.error("Error fetching debit bills report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = reportData.map((row, index) => ({
                "S.No": index + 1,
                "Bill No": row.bill_number || "",
                "UHID": row.uhid || "",
                "Patient Name": row.patient_name || "",
                "Field Revised": fieldLabels[row.field] || row.field || "",
                "Old Amount (₹)": Number((row.old_amount || 0).toFixed(2)),
                "New Amount (₹)": Number((row.new_amount || 0).toFixed(2)),
                "Debit Amount (₹)": Number((row.debit_amount || 0).toFixed(2)),
                "Edited By": row.edited_by_name || "",
                "Edited Date": row.edited_date || ""
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Debit Bills");
            XLSX.writeFile(wb, `Debit_Bills_Report_${fromDate}_to_${toDate}.xlsx`);
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
                        Debit Bills Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}.
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "2px" }}>
                        Printed As On {dayjs().format("DD/MM/YYYY HH:mm:ss")}.
                    </div>
                </div>
            )}

            {!isModalView && (
                <SectionTitle className="no-print">
                    <h3>Debit Bills Report</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        Bill edits that increased the billed amount (registration/consulting/total fee revisions)
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
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                                <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                            </Button>
                            <Button 
                                onClick={handleExportExcel} 
                                disabled={loading || reportData.length === 0} 
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
                        <SummaryLabel>Debit Entries</SummaryLabel>
                        <SummaryValue>{summary.count}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.danger}>
                        <SummaryLabel>Total Debit Amount</SummaryLabel>
                        <SummaryValue>₹{(summary.total_debit_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                    </SummaryCard>
                </div>
            )}

            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Bill No</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Field Revised</Th>
                            <Th style={{ textAlign: "right" }}>Old Amount</Th>
                            <Th style={{ textAlign: "right" }}>New Amount</Th>
                            <Th style={{ textAlign: "right" }}>Debit</Th>
                            <Th>Edited By</Th>
                            <Th>Edited Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td>{row.bill_number}</Td>
                                    <Td>{row.uhid}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.patient_name}</Td>
                                    <Td>{fieldLabels[row.field] || row.field}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.old_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.new_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700, color: colors.danger }}>+₹{(row.debit_amount || 0).toFixed(2)}</Td>
                                    <Td>{row.edited_by_name}</Td>
                                    <Td>{row.edited_date}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="10" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No debit edits found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="7" style={{ textAlign: "right" }}>Total Debit:</Td>
                                <Td style={{ textAlign: "right", color: colors.danger }}>+₹{(summary.total_debit_amount || 0).toFixed(2)}</Td>
                                <Td colSpan="2"></Td>
                            </Tr>
                        </tfoot>
                    )}
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
                    <div className="report-title">Debit Bills Revision Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "35%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "35%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Debit Entries:</strong> {summary.count}</td>
                            <td><strong>Total Debit Amount:</strong> ₹{(summary.total_debit_amount || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>S.No</th>
                            <th>Bill No</th>
                            <th>UHID</th>
                            <th>Patient Name</th>
                            <th>Field Revised</th>
                            <th style={{ textAlign: "right" }}>Old Amount (₹)</th>
                            <th style={{ textAlign: "right" }}>New Amount (₹)</th>
                            <th style={{ textAlign: "right" }}>Debit (+₹)</th>
                            <th>Edited By</th>
                            <th>Edited Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.bill_number}</td>
                                <td>{row.uhid}</td>
                                <td>{row.patient_name}</td>
                                <td>{fieldLabels[row.field] || row.field}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.old_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.new_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>+₹{(row.debit_amount || 0).toFixed(2)}</td>
                                <td>{row.edited_by_name}</td>
                                <td>{row.edited_date}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                            <td colSpan="7" style={{ textAlign: "right" }}>TOTAL DEBIT:</td>
                            <td style={{ textAlign: "right" }}>+₹{(summary.total_debit_amount || 0).toFixed(2)}</td>
                            <td colSpan="2"></td>
                        </tr>
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

export default DebitBillsReport;
