import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileCsv } from "react-icons/fa";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
    PageWrapper,
    colors,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Input,
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
    font-size: 1.5rem;
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

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        background: white;
        width: 100%;
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
    font-size: 9px;
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


const BillCancelReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [billType, setBillType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchReport();
        }
    }, [fromDate, toDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}bill-cancel-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data && Array.isArray(response.data.data)) {
                setReportData(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setReportData(response.data);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching bill cancel report:", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Filter by type and search query
    const filteredData = reportData.filter(item => {
        const matchesType = billType === "all" || 
            (billType === "discharge" && item.bill_type === "Discharge Bill") ||
            (billType === "advance" && item.bill_type === "IP Advance") ||
            (billType === "admission" && item.bill_type === "IP Admission");

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || 
            (item.patient_name || "").toLowerCase().includes(q) ||
            (item.uhid || "").toLowerCase().includes(q) ||
            (item.bill_no || "").toLowerCase().includes(q) ||
            (item.cancelled_by || "").toLowerCase().includes(q) ||
            (item.created_by || "").toLowerCase().includes(q);

        return matchesType && matchesSearch;
    });

    const grandTotal = filteredData.reduce((acc, curr) => acc + (curr.net_amount || 0), 0);

    const escapeCSV = (val) => {
        if (val === undefined || val === null) return '""';
        let str = String(val);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    };

    const handleExportCSV = () => {
        if (filteredData.length === 0) {
            alert("No data available to export");
            return;
        }

        const headers = [
            "S.No",
            "Patient Name",
            "UHID",
            "Bill Type",
            "Bill No",
            "Bill Date",
            "Cancelled Date",
            "Created By",
            "Cancelled By",
            "Amount (Rs)",
            "Remarks"
        ];

        const rows = filteredData.map((item, index) => [
            escapeCSV(index + 1),
            escapeCSV(item.patient_name || ""),
            escapeCSV(item.uhid || ""),
            escapeCSV(item.bill_type || ""),
            escapeCSV(item.bill_no || ""),
            escapeCSV(item.bill_date || ""),
            escapeCSV(item.cancelled_date || ""),
            escapeCSV(item.created_by || ""),
            escapeCSV(item.cancelled_by || ""),
            escapeCSV((item.net_amount || 0).toFixed(2)),
            escapeCSV(item.remarks || "")
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bill_cancel_report_${dayjs().format("YYYY-MM-DD")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Bill Cancellation Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    List of cancelled discharge bills and IP advances with patient details
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
                        <Label>Bill Category</Label>
                        <Select
                            value={billType}
                            onChange={(e) => setBillType(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="discharge">Discharge Bills</option>
                            <option value="advance">IP Advances</option>
                            <option value="admission">IP Admissions</option>
                        </Select>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Search</Label>
                        <Input
                            placeholder="Search Patient, UHID, Bill No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button onClick={handleExportCSV} style={{ height: "40px", background: colors.success, borderColor: colors.success }}>
                            <FaFileCsv style={{ marginRight: "8px" }} /> CSV
                        </Button>
                        <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                            <FaPrint style={{ marginRight: "8px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Total Cancelled Bills</SummaryLabel>
                    <SummaryValue>{filteredData.length}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.danger}>
                    <SummaryLabel>Total Cancelled Amount</SummaryLabel>
                    <SummaryValue>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table id="bill-cancel-table">
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Patient Name</Th>
                            <Th>UHID</Th>
                            <Th>Bill Type</Th>
                            <Th>Bill No</Th>
                            <Th>Bill Date</Th>
                            <Th>Cancelled Date</Th>
                            <Th>Created By</Th>
                            <Th>Cancelled By</Th>
                            <Th style={{ textAlign: "right" }}>Amount</Th>
                            <Th>Remarks</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "600" }}>{item.patient_name}</Td>
                                    <Td>{item.uhid}</Td>
                                    <Td style={{ fontWeight: "500", color: item.bill_type === "Discharge Bill" ? colors.primary : (item.bill_type === "IP Advance" ? colors.secondary : colors.textMuted) }}>
                                        {item.bill_type}
                                    </Td>
                                    <Td style={{ fontFamily: "monospace" }}>{item.bill_no}</Td>
                                    <Td>{item.bill_date ? dayjs(item.bill_date).format("DD/MM/YYYY HH:mm") : "N/A"}</Td>
                                    <Td>{item.cancelled_date ? dayjs(item.cancelled_date).format("DD/MM/YYYY HH:mm") : "N/A"}</Td>
                                    <Td>{item.created_by || "N/A"}</Td>
                                    <Td>{item.cancelled_by || "N/A"}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.danger }}>₹{(item.net_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ fontSize: "0.85rem", color: colors.textMuted }}>{item.remarks || "N/A"}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="11" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No records found for the selected filter criteria.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {filteredData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="9" style={{ textAlign: "right" }}>Grand Total ({filteredData.length} Bills):</Td>
                                <Td style={{ textAlign: "right", color: colors.danger }}>₹{grandTotal.toFixed(2)}</Td>
                                <Td></Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; }
                }
                `}
            </style>

            <PrintTemplate id="printable-report-area">
                <PrintHeader>
                    <h1>{localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL"}</h1>
                    <p>{localStorage.getItem("branch_name") || "Main Branch"}</p>
                    <div className="report-title">Bill Cancellation Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Category:</strong> {billType === "all" ? "All Categories" : billType}</td>
                            <td><strong>Search:</strong> {searchQuery || "None"}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Patient Name</th>
                            <th>UHID</th>
                            <th>Bill Type</th>
                            <th>Bill No</th>
                            <th>Bill Date</th>
                            <th>Cancelled Date</th>
                            <th>Created By</th>
                            <th>Cancelled By</th>
                            <th style={{ textAlign: "right" }}>Amount</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.patient_name}</td>
                                    <td>{item.uhid}</td>
                                    <td>{item.bill_type}</td>
                                    <td>{item.bill_no}</td>
                                    <td>{item.bill_date ? dayjs(item.bill_date).format("DD/MM/YYYY HH:mm") : "N/A"}</td>
                                    <td>{item.cancelled_date ? dayjs(item.cancelled_date).format("DD/MM/YYYY HH:mm") : "N/A"}</td>
                                    <td>{item.created_by || "N/A"}</td>
                                    <td>{item.cancelled_by || "N/A"}</td>
                                    <td style={{ textAlign: "right" }}>₹{(item.net_amount || 0).toFixed(2)}</td>
                                    <td>{item.remarks || "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" style={{ textAlign: "center", padding: "15px" }}>No records found.</td>
                            </tr>
                        )}
                        {filteredData.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                <td colSpan="9" style={{ textAlign: "right" }}>Grand Total ({filteredData.length} Bills):</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotal.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        )}
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

export default BillCancelReport;

