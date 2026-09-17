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

const TypeBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 700;
    background: ${props => props.receiptType === "Payment" ? "#fef2f2" : "#f0fdfa"};
    color: ${props => props.receiptType === "Payment" ? colors.danger : colors.primary};
`;

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

const MiscellaneousPaymentReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [receiptType, setReceiptType] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ count: 0, total_receipts: 0, total_payments: 0, net: 0 });
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
    }, [fromDate, toDate, receiptType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
            if (receiptType !== "all") params.set("receipt_type", receiptType);
            const response = await apiRequest(`${HmsBaseUrl}miscellaneous-payment-report/?${params.toString()}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { count: 0, total_receipts: 0, total_payments: 0, net: 0 });
            }
        } catch (error) {
            console.error("Error fetching miscellaneous payment report:", error);
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
                "Voucher No": row.voucher_no || "",
                "Date": row.voucher_date ? dayjs(row.voucher_date).format("DD/MM/YYYY") : "N/A",
                "Type": row.receipt_type || "",
                "Account Head": row.account_head || "",
                "Description": row.description || "",
                "Cashier": row.cashier_name || "",
                "Amount (₹)": Number((row.amount || 0).toFixed(2))
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Misc Payments");
            XLSX.writeFile(wb, `Miscellaneous_Payment_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Miscellaneous Payment Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Receipt &amp; Payment vouchers posted against any account head (e.g. Miscellaneous Income)
                </p>
            </SectionTitle>

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Date</Label>
                        <DatePicker
                            value={fromDate ? dayjs(fromDate) : null}
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Date</Label>
                        <DatePicker
                            value={toDate ? dayjs(toDate) : null}
                            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Voucher Type</Label>
                        <Select value={receiptType} onChange={(e) => setReceiptType(e.target.value)}>
                            <option value="all">All</option>
                            <option value="Receipt">Receipt (Income)</option>
                            <option value="Payment">Payment (Expense)</option>
                        </Select>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Vouchers</SummaryLabel>
                    <SummaryValue>{summary.count}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Total Receipts</SummaryLabel>
                    <SummaryValue>₹{(summary.total_receipts || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.danger}>
                    <SummaryLabel>Total Payments</SummaryLabel>
                    <SummaryValue>₹{(summary.total_payments || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <SummaryLabel>Net</SummaryLabel>
                    <SummaryValue>₹{(summary.net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Voucher No</Th>
                            <Th>Date</Th>
                            <Th>Type</Th>
                            <Th>Account Head</Th>
                            <Th>Description</Th>
                            <Th>Cashier</Th>
                            <Th style={{ textAlign: "right" }}>Amount</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td>{row.voucher_no}</Td>
                                    <Td>{row.voucher_date ? dayjs(row.voucher_date).format("DD/MM/YYYY") : "N/A"}</Td>
                                    <Td><TypeBadge receiptType={row.receipt_type}>{row.receipt_type}</TypeBadge></Td>
                                    <Td style={{ fontWeight: 600 }}>{row.account_head}</Td>
                                    <Td style={{ fontSize: "0.85rem" }}>{row.description}</Td>
                                    <Td>{row.cashier_name}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700, color: row.receipt_type === "Payment" ? colors.danger : colors.textMain }}>
                                        {row.receipt_type === "Payment" ? "-" : ""}₹{(row.amount || 0).toFixed(2)}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No vouchers found for the selected period.
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
                    <div className="report-title">Miscellaneous Payment / Receipt Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "35%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "35%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Receipts:</strong> ₹{(summary.total_receipts || 0).toFixed(2)}</td>
                            <td><strong>Total Payments:</strong> ₹{(summary.total_payments || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}><strong>Net Amount:</strong> ₹{(summary.net || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>S.No</th>
                            <th>Voucher No</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Account Head</th>
                            <th>Description</th>
                            <th>Cashier</th>
                            <th style={{ textAlign: "right" }}>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.voucher_no}</td>
                                <td>{row.voucher_date ? dayjs(row.voucher_date).format("DD/MM/YYYY") : "N/A"}</td>
                                <td>{row.receipt_type}</td>
                                <td>{row.account_head}</td>
                                <td>{row.description}</td>
                                <td>{row.cashier_name}</td>
                                <td style={{ textAlign: "right" }}>
                                    {row.receipt_type === "Payment" ? "-" : ""}₹{(row.amount || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                            <td colSpan="7" style={{ textAlign: "right" }}>NET BALANCE:</td>
                            <td style={{ textAlign: "right" }}>₹{(summary.net || 0).toFixed(2)}</td>
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

export default MiscellaneousPaymentReport;
