import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaEye, FaPrint, FaSearch } from "react-icons/fa";
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


const DischargeBills = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [billType, setBillType] = useState("all");
    const [insuranceFilter, setInsuranceFilter] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchReport();
        }
    }, [fromDate, toDate, billType, insuranceFilter]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate, status: "Billed" });
            if (billType !== "all") params.set("payment_mode", billType);
            if (insuranceFilter !== "all") params.set("insurance", insuranceFilter);
            const response = await apiRequest(`${HmsBaseUrl}discharge-bills-report/?${params.toString()}`, "GET");
            if (response.success && response.data && Array.isArray(response.data.data)) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.net_amount || 0), 0);

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Discharge Bills Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    View and print discharge bills summary
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
                        <Label>Payment Mode</Label>
                        <Select
                            value={billType}
                            onChange={(e) => setBillType(e.target.value)}
                        >
                            <option value="all">All Modes</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Multiple Payment">Multiple Payment</option>
                        </Select>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Insurance</Label>
                        <Select
                            value={insuranceFilter}
                            onChange={(e) => setInsuranceFilter(e.target.value)}
                        >
                            <option value="all">All Patients</option>
                            <option value="true">Insurance Only</option>
                            <option value="false">Non-Insurance Only</option>
                        </Select>
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                            <FaPrint style={{ marginRight: "8px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Total Patients</SummaryLabel>
                    <SummaryValue>{reportData.length}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <SummaryLabel>Insurance Patients</SummaryLabel>
                    <SummaryValue>{reportData.filter(b => b.has_insurance).length}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Grand Total</SummaryLabel>
                    <SummaryValue>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table id="discharge-bills-table">
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Patient Name</Th>
                            <Th>IP.No</Th>
                            <Th>Branch</Th>
                            <Th>Room</Th>
                            <Th>Admission Date</Th>
                            <Th>Discharge Date</Th>
                            <Th>Bill No</Th>
                            <Th>Payment Mode</Th>
                            <Th>Insurance</Th>
                            <Th style={{ textAlign: "right" }}>Total</Th>
                            <Th className="no-print">Items</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((bill, index) => (
                                <React.Fragment key={index}>
                                    <Tr>
                                        <Td>{index + 1}</Td>
                                        <Td style={{ fontWeight: "600" }}>{bill.patient_details?.patient_name || "N/A"}</Td>
                                        <Td>{bill.ip_number}</Td>
                                        <Td>{bill.branch_code || "N/A"}</Td>
                                        <Td>{bill.patient_details?.room_no || "N/A"}</Td>
                                        <Td>{bill.patient_details?.admission_date ? format(new Date(bill.patient_details.admission_date), "dd/MM/yyyy") : "N/A"}</Td>
                                        <Td>{bill.bill_date ? format(new Date(bill.bill_date), "dd/MM/yyyy") : "N/A"}</Td>
                                        <Td>{bill.bill_no}</Td>
                                        <Td>{bill.payment_mode || "Cash"}</Td>
                                        <Td>{bill.has_insurance ? (bill.insurance_company || "Yes") : "No"}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(bill.net_amount || 0).toFixed(2)}</Td>
                                        <Td className="no-print">
                                            {bill.department_breakdown?.length > 0 && (
                                                <Button
                                                    secondary
                                                    style={{ padding: "4px 10px", fontSize: "0.75rem", height: "auto" }}
                                                    onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                                                >
                                                    {expandedRow === index ? "Hide" : "View"}
                                                </Button>
                                            )}
                                        </Td>
                                    </Tr>
                                    {expandedRow === index && bill.department_breakdown?.length > 0 && (
                                        <Tr className="no-print">
                                            <Td colSpan="12" style={{ background: "#f8fafc", padding: "12px 20px" }}>
                                                <strong style={{ fontSize: "0.8rem", color: colors.textMuted }}>Department-wise breakdown:</strong>
                                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                                                    {bill.department_breakdown.map((d, i) => (
                                                        <span key={i} style={{
                                                            background: "white", border: `1px solid ${colors.border}`,
                                                            borderRadius: "8px", padding: "4px 10px", fontSize: "0.8rem"
                                                        }}>
                                                            {d.category}: <strong>₹{d.amount.toFixed(2)}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            </Td>
                                        </Tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="12" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No records found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="10" style={{ textAlign: "right" }}>Total Patients: {reportData.length}</Td>
                                <Td style={{ textAlign: "right", color: colors.primary }}>₹{grandTotal.toFixed(2)}</Td>
                                <Td className="no-print"></Td>
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
                    <div className="report-title">Discharge Bills Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Bill Type:</strong> {billType === "all" ? "All Types" : billType}</td>
                            <td><strong>Total Patients:</strong> {reportData.length}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Patient Name</th>
                            <th>IP.No</th>
                            <th>Room</th>
                            <th>Admission Date</th>
                            <th>Discharge Date</th>
                            <th>Bill ID</th>
                            <th>Bill No</th>
                            <th style={{ textAlign: "right" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((bill, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{bill.patient_details?.patient_name || "N/A"}</td>
                                    <td>{bill.ip_number}</td>
                                    <td>{bill.patient_details?.room_no || "N/A"}</td>
                                    <td>{bill.patient_details?.admission_date ? dayjs(bill.patient_details.admission_date).format("DD/MM/YYYY") : "N/A"}</td>
                                    <td>{bill.bill_date ? dayjs(bill.bill_date).format("DD/MM/YYYY") : "N/A"}</td>
                                    <td>{bill.discharge_id}</td>
                                    <td>{bill.bill_no}</td>
                                    <td style={{ textAlign: "right" }}>₹{(bill.net_amount || 0).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "15px" }}>No records found.</td>
                            </tr>
                        )}
                        {reportData.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                <td colSpan="7" style={{ textAlign: "right" }}>Total Patients: {reportData.length}</td>
                                <td style={{ textAlign: "right" }}>Grand Total:</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotal.toFixed(2)}</td>
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

export default DischargeBills;

