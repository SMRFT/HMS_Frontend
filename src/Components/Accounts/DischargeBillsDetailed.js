import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch } from "react-icons/fa";
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
    font-size: 1.2rem;
    font-weight: 700;
    color: ${colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.7rem;
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


const DischargeBillsDetailed = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
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
            const response = await apiRequest(`${HmsBaseUrl}discharge-bills-report/?from_date=${fromDate}&to_date=${toDate}&status=Billed`, "GET");
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

    const totals = reportData.reduce((acc, curr) => {
        acc.amount += (curr.total_amount || 0);
        acc.discount += (curr.total_disc || curr.discount_amount || 0);
        acc.net += (curr.net_amount || 0);
        return acc;
    }, { amount: 0, discount: 0, net: 0 });

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Discharge Bills (Detailed)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Itemized list of discharge bills with discounts and cashier info
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Total Amount</SummaryLabel>
                    <SummaryValue>₹{totals.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.danger}>
                    <SummaryLabel>Total Discount</SummaryLabel>
                    <SummaryValue>₹{totals.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Grand Total</SummaryLabel>
                    <SummaryValue>₹{totals.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Patient Name</Th>
                            <Th>OP.No / UHID</Th>
                            <Th>Bill No</Th>
                            <Th>Bill Type</Th>
                            <Th style={{ textAlign: "right" }}>Bill Amount</Th>
                            <Th style={{ textAlign: "right" }}>Bill Discount</Th>
                            <Th>Cashier</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((bill, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "600" }}>{bill.patient_details?.patient_name || "N/A"}</Td>
                                    <Td>{bill.uhid}</Td>
                                    <Td>{bill.bill_no}</Td>
                                    <Td>{bill.payment_mode || "Cash"}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(bill.total_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>₹{(bill.total_disc || bill.discount_amount || 0).toFixed(2)}</Td>
                                    <Td>{bill.cashier_id || "N/A"}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No records found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="5" style={{ textAlign: "right" }}>Total Amount:</Td>
                                <Td style={{ textAlign: "right" }}>₹{totals.amount.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>Total Discount:</Td>
                                <Td style={{ textAlign: "right", color: colors.danger }}>₹{totals.discount.toFixed(2)}</Td>
                            </Tr>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="5" style={{ textAlign: "right" }}>Grand Total:</Td>
                                <Td style={{ textAlign: "right", color: colors.success }}>₹{totals.net.toFixed(2)}</Td>
                                <Td colSpan="2"></Td>
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
                    <div className="report-title">Discharge Bills (Detailed) Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td colSpan="2"><strong>Type:</strong> Billed Discharge Accounts</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Patient Name</th>
                            <th>OP.No / UHID</th>
                            <th>Bill No</th>
                            <th>Bill Type</th>
                            <th style={{ textAlign: "right" }}>Bill Amount</th>
                            <th style={{ textAlign: "right" }}>Bill Discount</th>
                            <th>Cashier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((bill, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{bill.patient_details?.patient_name || "N/A"}</td>
                                    <td>{bill.uhid}</td>
                                    <td>{bill.bill_no}</td>
                                    <td>{bill.payment_mode || "Cash"}</td>
                                    <td style={{ textAlign: "right" }}>₹{(bill.total_amount || 0).toFixed(2)}</td>
                                    <td style={{ textAlign: "right" }}>₹{(bill.total_disc || bill.discount_amount || 0).toFixed(2)}</td>
                                    <td>{bill.cashier_id || "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "15px" }}>No records found.</td>
                            </tr>
                        )}
                        {reportData.length > 0 && (
                            <>
                                <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                    <td colSpan="5" style={{ textAlign: "right" }}>Total Amount:</td>
                                    <td style={{ textAlign: "right" }}>₹{totals.amount.toFixed(2)}</td>
                                    <td style={{ textAlign: "right" }}>Total Discount:</td>
                                    <td style={{ textAlign: "right" }}>₹{totals.discount.toFixed(2)}</td>
                                </tr>
                                <tr style={{ fontWeight: "bold", background: "#e6e6e6" }}>
                                    <td colSpan="5" style={{ textAlign: "right" }}>Grand Total:</td>
                                    <td style={{ textAlign: "right" }}>₹{totals.net.toFixed(2)}</td>
                                    <td colSpan="2"></td>
                                </tr>
                            </>
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

export default DischargeBillsDetailed;

