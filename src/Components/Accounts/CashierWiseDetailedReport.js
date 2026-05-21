import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaUser, FaFileInvoice } from "react-icons/fa";
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
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-top: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
    font-size: 0.9rem;
    font-weight: 700;
    color: ${colors.textMain};
`;

const CashierWiseDetailedReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
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
                if (response.data.data.length > 0 && !selectedShift) {
                    setSelectedShift(response.data.data[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching shifts:", error);
        }
    };

    const fetchReport = async () => {
        if (!selectedShift) return;
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}shift_basis_accounts_report/`, "POST", {
                shiftno: selectedShift.shiftno
            });
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
        if (selectedShift) fetchReport();
    }, [selectedShift]);

    const handlePrint = () => {
        window.print();
    };

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
                        value={selectedShift?.shiftno || ""}
                        onChange={(e) => {
                            const s = shifts.find(sh => sh.shiftno === e.target.value);
                            setSelectedShift(s);
                        }}
                    >
                        <option value="">Select a shift</option>
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
                <SummaryCard className="shift-header">
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
                            <Th>S/no</Th>
                            <Th>Bill No</Th>
                            <Th>O/P No</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ textAlign: "right" }}>Collected</Th>
                            <Th style={{ textAlign: "right" }}>Return</Th>
                            <Th>Type</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "700", color: colors.primary }}>{row.bill_no}</Td>
                                    <Td>{row.uhid}</Td>
                                    <Td style={{ fontWeight: "600" }}>{row.patient_name}</Td>
                                    <Td style={{ textAlign: "right", color: row.display_amount >= 0 ? colors.success : colors.textMain }}>
                                        {row.display_amount >= 0 ? `₹${row.display_amount.toFixed(2)}` : "—"}
                                    </Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>
                                        {row.display_amount < 0 ? `₹${Math.abs(row.display_amount).toFixed(2)}` : "—"}
                                    </Td>
                                    <Td>
                                        <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "#f1f5f9", fontWeight: "700" }}>{row.type}</span>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
                                    {loading ? "Loading data..." : "No itemized data available for this shift."}
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                                <Td colSpan="4" style={{ textAlign: "right" }}>Grand Total:</Td>
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
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .shift-header { box-shadow: none; border: 1px solid #eee; margin-bottom: 20px; }
                    ${TableWrapper} { box-shadow: none; border: 1px solid #000; }
                    ${Table} { width: 100%; border-collapse: collapse; }
                    ${Th}, ${Td} { border: 1px solid #000; padding: 6px; font-size: 10px; }
                    ${Th} { background: #f0f0f0 !important; color: black !important; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

export default CashierWiseDetailedReport;
