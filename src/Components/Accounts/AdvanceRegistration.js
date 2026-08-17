import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaMoneyBillWave } from "react-icons/fa";
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${colors.success};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const AdvanceRegistration = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}advance-registration-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                const rows = Array.isArray(response.data.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                    ? response.data
                    : [];
                const mappedData = rows.map(item => ({
                    ...item,
                    advance_amount: item.amount || item.advance_amount,
                    created_by: item.cashier_id || item.created_by
                }));
                setReportData(mappedData);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handlePrint = () => {
        window.print();
    };

    const totals = reportData.reduce((acc, curr) => {
        const amt = Number(curr.advance_amount || curr.amount || 0);
        if ((curr.payment_mode || "").toLowerCase() === "cash") {
            acc.cash += amt;
        } else {
            acc.credit += amt;
        }
        acc.total += amt;
        return acc;
    }, { cash: 0, credit: 0, total: 0 });

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Advance Registration Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Tracking IP advances and registrations
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.success}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Cash</span>
                    <h3 style={{ margin: 0 }}>₹{totals.cash.toLocaleString("en-IN")}</h3>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Credit/Other</span>
                    <h3 style={{ margin: 0 }}>₹{totals.credit.toLocaleString("en-IN")}</h3>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Grand Total</span>
                    <h3 style={{ margin: 0 }}>₹{totals.total.toLocaleString("en-IN")}</h3>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>IP No</Th>
                            <Th>Bill No</Th>
                            <Th>Patient Details</Th>
                            <Th style={{ textAlign: "right" }}>Cash Amount</Th>
                            <Th style={{ textAlign: "right" }}>Credit Amount</Th>
                            <Th>Cashier</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((adv, index) => {
                                const amt = Number(adv.advance_amount || adv.amount || 0);
                                const isCash = (adv.payment_mode || "").toLowerCase() === "cash";
                                return (
                                    <Tr key={index}>
                                        <Td>{index + 1}</Td>
                                        <Td style={{ fontWeight: "700" }}>{adv.ip_number || adv.ipno || "—"}</Td>
                                        <Td>{adv.bill_no || adv.billno || "—"}</Td>
                                        <Td>
                                            <div style={{ fontWeight: "600" }}>{adv.patient_name || adv.patientName || "—"}</div>
                                            <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>{adv.uhid}</div>
                                        </Td>
                                        <Td style={{ textAlign: "right", color: colors.success }}>
                                            {isCash ? `₹${amt.toFixed(2)}` : "—"}
                                        </Td>
                                        <Td style={{ textAlign: "right", color: colors.primary }}>
                                            {!isCash ? `₹${amt.toFixed(2)}` : "—"}
                                        </Td>
                                        <Td>{adv.created_by || adv.cashier_id || "Staff"}</Td>
                                    </Tr>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No advances found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="4" style={{ textAlign: "right" }}>Totals:</Td>
                                <Td style={{ textAlign: "right", color: colors.success }}>₹{totals.cash.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right", color: colors.primary }}>₹{totals.credit.toFixed(2)}</Td>
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
                    <div className="report-title">Advance Registration Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td colSpan="2"><strong>Type:</strong> Advance Registration Payments</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>IP No</th>
                            <th>Bill No</th>
                            <th>Patient Details</th>
                            <th style={{ textAlign: "right" }}>Cash Amount</th>
                            <th style={{ textAlign: "right" }}>Credit Amount</th>
                            <th>Cashier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => {
                                const amt = Number(row.advance_amount || row.amount || 0);
                                const isCash = (row.payment_mode || "").toLowerCase() === "cash";
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{row.ip_number || row.ipno || "—"}</td>
                                        <td>{row.bill_no || row.billno || "—"}</td>
                                        <td>
                                            <div><strong>{row.patient_name || row.patientName || "—"}</strong></div>
                                            <div style={{ fontSize: "8px", color: "#666" }}>UHID: {row.uhid}</div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>₹{(isCash ? amt : 0).toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{(!isCash ? amt : 0).toFixed(2)}</td>
                                        <td>{row.created_by || row.cashierName || "Staff"}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "15px" }}>No records found.</td>
                            </tr>
                        )}
                        {reportData.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                <td colSpan="4" style={{ textAlign: "right" }}>Total:</td>
                                <td style={{ textAlign: "right" }}>₹{totals.cash.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{totals.credit.toFixed(2)}</td>
                                <td>Grand Total: ₹{totals.total.toFixed(2)}</td>
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


export default AdvanceRegistration;
