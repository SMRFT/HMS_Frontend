import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 15px;
    margin-bottom: 15px;
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

const ClosingSection = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 15px;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${colors.primary};
`;

// Print-only components
const PrintContainer = styled.div`
    display: none;
    @media print {
        display: block;
        width: 100%;
        color: #000;
        font-family: 'Times New Roman', Times, serif;
        background: #fff;
    }
`;

const PrintBlock = styled.div`
    page-break-inside: avoid;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 1px dashed #000;
`;

const PrintTitle = styled.h2`
    text-align: center;
    margin: 0 0 5px 0;
    font-size: 20px;
    text-transform: uppercase;
`;

const PrintSubtitle = styled.p`
    text-align: center;
    margin: 0 0 20px 0;
    font-size: 12px;
    font-weight: bold;
`;

const PrintHeaderTable = styled.table`
    width: 100%;
    margin-bottom: 15px;
    border-collapse: collapse;
    font-size: 13px;
    td {
        padding: 4px 0;
    }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12px;
    th, td {
        border: 1px solid #000;
        padding: 6px 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
`;

const PrintClosing = styled.div`
    text-align: right;
    margin-top: 15px;
    font-size: 14px;
    font-weight: bold;
`;

const CashierWiseReport = ({ startDate, endDate }) => {
    const location = useLocation();
    const [fromDate, setFromDate] = useState(startDate || location.state?.startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || location.state?.endDate || format(new Date(), "yyyy-MM-dd"));
    const [shifts, setShifts] = useState([]);
    const [selectedShiftId, setSelectedShiftId] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";

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
                // Keep "all" or reset to all if no shifts found
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

            // When a specific shift is selected, add shiftno filter
            // (backend ignores date range when shiftno is provided)
            if (selectedShiftId !== "all") {
                payload.shiftno = selectedShiftId;
            }

            // shift_basis_accounts_report handles both cases:
            //   - with shiftno → returns bills for that shift only
            //   - without shiftno → returns all bills in the date range
            const response = await apiRequest(`${HmsBaseUrl}shift_basis_accounts_report/`, "POST", payload);

            if (response.success && response.data) {
                const rows = response.data.data || response.data || [];
                setReportData(Array.isArray(rows) ? rows : []);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            setReportData([]);
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

    // Grouping helper to process shift blocks
    const getShiftBlocks = () => {
        if (selectedShiftId === "all") {
            // ── ALL SHIFTS MODE ──
            // Aggregate ALL reportData by type_name (don't filter by shiftno;
            // many bills have empty/null shiftno and would be lost otherwise)
            if (reportData.length === 0) return [];

            const grouped = reportData.reduce((acc, curr) => {
                const name = curr.type_name || curr.type || "Other";
                if (!acc[name]) acc[name] = { name, receipts: 0, payments: 0 };
                const amt = parseFloat(curr.display_amount || 0);
                if (amt < 0) {
                    acc[name].payments += Math.abs(amt);
                } else {
                    acc[name].receipts += amt;
                }
                return acc;
            }, {});

            const categories = Object.values(grouped);
            const totalReceipts = categories.reduce((sum, c) => sum + c.receipts, 0);
            const totalPayments = categories.reduce((sum, c) => sum + c.payments, 0);

            return [{
                shiftno: "All Shifts",
                cashierName: reportData[0]?.cashier_name || "—",
                startTime: fromDate,
                endTime: toDate,
                date: null,
                isAllShifts: true,
                categories,
                totalReceipts,
                totalPayments,
                closingBalance: totalReceipts - totalPayments
            }];
        }

        // ── SINGLE SHIFT MODE ──
        const activeShifts = shifts.filter(sh => sh.shiftno === selectedShiftId);

        return activeShifts.map(s => {
            // Include bills that exactly match shiftno OR have no shiftno (fallback)
            const shiftBills = reportData.filter(
                b => b.shiftno === s.shiftno || (!b.shiftno && reportData.length > 0)
            );

            const grouped = shiftBills.reduce((acc, curr) => {
                const name = curr.type_name || curr.type || "Other";
                if (!acc[name]) acc[name] = { name, receipts: 0, payments: 0 };
                const amt = parseFloat(curr.display_amount || 0);
                if (amt < 0) {
                    acc[name].payments += Math.abs(amt);
                } else {
                    acc[name].receipts += amt;
                }
                return acc;
            }, {});

            const categories = Object.values(grouped);

            // Opening Balance at top
            const openingBal = parseFloat(s.OpeningBalance || 0);
            if (openingBal > 0) {
                categories.unshift({ name: "OPENING BALANCE", receipts: openingBal, payments: 0 });
            }

            const totalReceipts = categories.reduce((sum, c) => sum + c.receipts, 0);
            const totalPayments = categories.reduce((sum, c) => sum + c.payments, 0);
            const closingBalance = parseFloat(s.ClosingBalance || (totalReceipts - totalPayments));

            return {
                shiftno: s.shiftno,
                cashierName: s.User || s.CashierID,
                startTime: s.StartTime || "N/A",
                endTime: s.EndTime || "Active",
                date: s.date,
                isAllShifts: false,
                categories,
                totalReceipts,
                totalPayments,
                closingBalance
            };
        });
    };

    const shiftBlocks = getShiftBlocks();

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Cashier Wise Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Summary of collections and returns by cashier shift
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

            {/* SCREEN VIEW */}
            <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "25px", marginTop: "20px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>Loading report data...</div>
                ) : shiftBlocks.length > 0 ? (
                    shiftBlocks.map((block, idx) => (
                        <SummaryCard key={idx}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", borderBottom: `1px solid ${colors.border}`, paddingBottom: "10px" }}>
                                <FaUser color={colors.primary} />
                                <h4 style={{ margin: 0, color: colors.primary }}>
                                    {block.isAllShifts ? `All Shifts — ${fromDate} to ${toDate}` : `Shift No: ${block.shiftno}`}
                                </h4>
                            </div>
                            <InfoGrid>
                                {block.isAllShifts ? (
                                    <>
                                        <InfoItem><InfoLabel>From Date</InfoLabel><InfoValue>{fromDate}</InfoValue></InfoItem>
                                        <InfoItem><InfoLabel>To Date</InfoLabel><InfoValue>{toDate}</InfoValue></InfoItem>
                                        <InfoItem><InfoLabel>Total Bills</InfoLabel><InfoValue>{reportData.length}</InfoValue></InfoItem>
                                    </>
                                ) : (
                                    <>
                                        <InfoItem><InfoLabel>Cashier Name</InfoLabel><InfoValue>{block.cashierName}</InfoValue></InfoItem>
                                        <InfoItem><InfoLabel>Start Time</InfoLabel><InfoValue>{block.startTime}</InfoValue></InfoItem>
                                        <InfoItem><InfoLabel>End Time</InfoLabel><InfoValue>{block.endTime}</InfoValue></InfoItem>
                                        <InfoItem><InfoLabel>Date</InfoLabel><InfoValue>{block.date ? format(new Date(block.date), "dd/MM/yyyy") : "N/A"}</InfoValue></InfoItem>
                                    </>
                                )}
                            </InfoGrid>

                            <TableWrapper style={{ boxShadow: "none", border: `1px solid ${colors.border}` }}>
                                <Table>
                                    <thead>
                                        <Tr>
                                            <Th style={{ width: "80px" }}>SlNo.</Th>
                                            <Th>Bill Name</Th>
                                            <Th style={{ textAlign: "right", width: "150px" }}>Receipts</Th>
                                            <Th style={{ textAlign: "right", width: "150px" }}>Payments</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {block.categories.map((cat, cIdx) => (
                                            <Tr key={cIdx}>
                                                <Td>{cIdx + 1}</Td>
                                                <Td style={{ fontWeight: "600" }}>{cat.name}</Td>
                                                <Td style={{ textAlign: "right", color: colors.success }}>₹{cat.receipts.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", color: colors.danger }}>₹{cat.payments.toFixed(2)}</Td>
                                            </Tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <Tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                                            <Td colSpan="2" style={{ textAlign: "right" }}>Total:</Td>
                                            <Td style={{ textAlign: "right", color: colors.success }}>₹{block.totalReceipts.toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", color: colors.danger }}>₹{block.totalPayments.toFixed(2)}</Td>
                                        </Tr>
                                    </tfoot>
                                </Table>
                            </TableWrapper>

                            <ClosingSection>
                                Closing Balance : ₹{block.closingBalance.toFixed(2)}
                            </ClosingSection>
                        </SummaryCard>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted, background: colors.surface, borderRadius: "12px" }}>
                        No shift data available for this range.
                    </div>
                )}
            </div>

            {/* PRINT VIEW */}
            <PrintContainer>
                {shiftBlocks.map((block, idx) => (
                    <PrintBlock key={idx}>
                        <PrintTitle>{hospital_name}</PrintTitle>
                        <PrintSubtitle>{branch_name}</PrintSubtitle>
                        
                        <PrintHeaderTable>
                            <tbody>
                                <tr>
                                    <td style={{ width: "50%" }}><strong>Shift No :</strong> {block.shiftno}</td>
                                    <td style={{ width: "50%", textAlign: "right" }}><strong>Start Time :</strong> {block.startTime}</td>
                                </tr>
                                <tr>
                                    <td><strong>Staff Name :</strong> {block.cashierName}</td>
                                    <td style={{ textAlign: "right" }}><strong>End Time :</strong> {block.endTime}</td>
                                </tr>
                            </tbody>
                        </PrintHeaderTable>

                        <PrintTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>SlNo.</th>
                                    <th>Bill Name</th>
                                    <th style={{ textAlign: "right", width: "120px" }}>Receipts</th>
                                    <th style={{ textAlign: "right", width: "120px" }}>Payments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.categories.map((cat, cIdx) => (
                                    <tr key={cIdx}>
                                        <td>{cIdx + 1}</td>
                                        <td>{cat.name}</td>
                                        <td style={{ textAlign: "right" }}>{cat.receipts.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>{cat.payments.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: "bold" }}>
                                    <td colSpan="2" style={{ textAlign: "right" }}>Total</td>
                                    <td style={{ textAlign: "right" }}>{block.totalReceipts.toFixed(2)}</td>
                                    <td style={{ textAlign: "right" }}>{block.totalPayments.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </PrintTable>

                        <PrintClosing>
                            Closing Balance : {block.closingBalance.toFixed(2)}
                        </PrintClosing>
                    </PrintBlock>
                ))}
            </PrintContainer>

            <style>
                {`
                @media print {
                    @page { size: portrait; margin: 15mm 10mm; }
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    /* Hide parent containers that shouldn't show in print */
                    #root > div, main, header, nav, aside { box-shadow: none !important; border: none !important; background: transparent !important; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

export default CashierWiseReport;
