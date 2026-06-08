import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaUser } from "react-icons/fa";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
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
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-top: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    width: 100%;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const InfoLabel = styled.span`
    font-size: 0.7rem;
    color: ${colors.textMuted};
    text-transform: uppercase;
    font-weight: 600;
`;

const InfoValue = styled.span`
    font-size: 0.95rem;
    font-weight: 700;
    color: ${colors.textMain};
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


const CashierWiseDetailedReport = ({ startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [shifts, setShifts] = useState([]);
    const [selectedShiftId, setSelectedShiftId] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchShifts();
        }
    }, [fromDate, toDate]);

    const fetchShifts = async () => {
        try {
            const response = await apiRequest(`${HmsBaseUrl}get_shift_summary_report/`, "POST", {
                from_date: fromDate,
                to_date: toDate
            });
            if (response.success && response.data && Array.isArray(response.data.data)) {
                setShifts(response.data.data);
                if (response.data.data.length === 0) {
                    setSelectedShiftId("all");
                }
            }
        } catch (error) {
            console.error("Error fetching shifts:", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const payload = {
                from_date: fromDate,
                to_date: toDate
            };
            if (selectedShiftId !== "all") {
                payload.shiftno = selectedShiftId;
            }
            const response = await apiRequest(`${HmsBaseUrl}shift_basis_accounts_report/`, "POST", payload);
            if (response.success && response.data && Array.isArray(response.data.data)) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedShiftId, shifts]);

    const handlePrint = () => {
        window.print();
    };

    const selectedShift = shifts.find(sh => sh.shiftno === selectedShiftId);

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Cashier Wise Detailed Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Itemized list of all transactions within a cashier shift
                </p>
            </SectionTitle>

            <FormRow className="no-print">
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
                    <Label>Select Shift</Label>
                    <Select 
                        value={selectedShiftId}
                        onChange={(e) => setSelectedShiftId(e.target.value)}
                    >
                        <option value="all">All Shifts</option>
                        {shifts.map(s => (
                            <option key={s.shiftno} value={s.shiftno}>
                                {s.shiftno} - {s.User} ({s.date ? format(new Date(s.date), "dd/MM/yyyy") : "N/A"})
                            </option>
                        ))}
                    </Select>
                </InputWrapper>
                <Button onClick={handlePrint} secondary style={{ height: "40px", marginTop: "24px" }}>
                    <FaPrint style={{ marginRight: "8px" }} /> Print
                </Button>
            </FormRow>

            {selectedShift && (
                <SummaryCard className="shift-header no-print">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", borderBottom: `1px solid ${colors.border}`, paddingBottom: "10px" }}>
                        <FaUser color={colors.primary} />
                        <h4 style={{ margin: 0 }}>Shift Details: {selectedShift.shiftno}</h4>
                    </div>
                    <InfoGrid>
                        <InfoItem><InfoLabel>Cashier Name</InfoLabel><InfoValue>{selectedShift.User}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Start Time</InfoLabel><InfoValue>{selectedShift.StartTime}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>End Time</InfoLabel><InfoValue>{selectedShift.EndTime || "Active"}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Opening Balance</InfoLabel><InfoValue>₹{parseFloat(selectedShift.OpeningBalance || 0).toFixed(2)}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Closing Balance</InfoLabel><InfoValue>₹{parseFloat(selectedShift.ClosingBalance || 0).toFixed(2)}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Remitted To Bank</InfoLabel><InfoValue>₹{parseFloat(selectedShift.RemittedToBank || 0).toFixed(2)}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Hand Over Amount</InfoLabel><InfoValue>₹{parseFloat(selectedShift.HandOverAmount || 0).toFixed(2)}</InfoValue></InfoItem>
                        <InfoItem><InfoLabel>Total Collection</InfoLabel><InfoValue style={{ color: colors.success }}>₹{parseFloat(selectedShift.collected_Amount || 0).toFixed(2)}</InfoValue></InfoItem>
                    </InfoGrid>
                </SummaryCard>
            )}

            <TableWrapper style={{ marginTop: "20px" }}>
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: "60px" }}>S/no</Th>
                            <Th>Shift No</Th>
                            <Th>Bill No</Th>
                            <Th>O/P No</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ textAlign: "right", width: "120px" }}>Collected</Th>
                            <Th style={{ textAlign: "right", width: "120px" }}>Return</Th>
                            <Th>Type</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
                                    Loading report data...
                                </Td>
                            </Tr>
                        ) : reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "600" }}>{row.shiftno}</Td>
                                    <Td style={{ fontWeight: "700", color: colors.primary }}>{row.bill_no}</Td>
                                    <Td>{row.uhid || "—"}</Td>
                                    <Td style={{ fontWeight: "600" }}>{row.patient_name || "—"}</Td>
                                    <Td style={{ textAlign: "right", color: row.display_amount >= 0 ? colors.success : colors.textMain }}>
                                        {row.display_amount >= 0 ? `₹${row.display_amount.toFixed(2)}` : "—"}
                                    </Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>
                                        {row.display_amount < 0 ? `₹${Math.abs(row.display_amount).toFixed(2)}` : "—"}
                                    </Td>
                                    <Td>
                                        <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "#f1f5f9", color: colors.textMain, fontWeight: "700" }}>
                                            {row.type_name || row.type}
                                        </span>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
                                    No itemized data available for this shift.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {!loading && reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                                <Td colSpan="5" style={{ textAlign: "right" }}>Grand Total:</Td>
                                <Td style={{ textAlign: "right", color: colors.success }}>
                                    ₹{reportData.reduce((a, b) => a + (b.display_amount >= 0 ? b.display_amount : 0), 0).toFixed(2)}
                                </Td>
                                <Td style={{ textAlign: "right", color: colors.danger }}>
                                    ₹{reportData.reduce((a, b) => a + (b.display_amount < 0 ? Math.abs(b.display_amount) : 0), 0).toFixed(2)}
                                </Td>
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
                    <div className="report-title">Cashier Wise Detailed Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Shift:</strong> {selectedShiftId === "all" ? "All Shifts" : selectedShiftId}</td>
                            <td><strong>Cashier:</strong> {selectedShift ? selectedShift.User : "All"}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                        {selectedShift && (
                            <tr>
                                <td colSpan="2">
                                    <strong>Shift Start:</strong> {selectedShift.StartTime} | <strong>Shift End:</strong> {selectedShift.EndTime || "Active"}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <strong>Shift Total Coll:</strong> ₹{parseFloat(selectedShift.collected_Amount || 0).toFixed(2)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Shift No</th>
                            <th>Bill No</th>
                            <th>O/P No</th>
                            <th>Patient Name</th>
                            <th style={{ textAlign: "right" }}>Collected</th>
                            <th style={{ textAlign: "right" }}>Return</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{row.shiftno}</td>
                                    <td>{row.bill_no}</td>
                                    <td>{row.uhid || "—"}</td>
                                    <td>{row.patient_name || "—"}</td>
                                    <td style={{ textAlign: "right" }}>
                                        {row.display_amount >= 0 ? `₹${row.display_amount.toFixed(2)}` : "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        {row.display_amount < 0 ? `₹${Math.abs(row.display_amount).toFixed(2)}` : "—"}
                                    </td>
                                    <td>{row.type_name || row.type}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "15px" }}>No data available.</td>
                            </tr>
                        )}
                        {reportData.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                <td colSpan="5" style={{ textAlign: "right" }}>Grand Total:</td>
                                <td style={{ textAlign: "right" }}>
                                    ₹{reportData.reduce((a, b) => a + (b.display_amount >= 0 ? b.display_amount : 0), 0).toFixed(2)}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    ₹{reportData.reduce((a, b) => a + (b.display_amount < 0 ? Math.abs(b.display_amount) : 0), 0).toFixed(2)}
                                </td>
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

export default CashierWiseDetailedReport;
