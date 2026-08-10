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
            if (reportData.length === 0 && shifts.length === 0) return [];

            // Group reportData by cashier_name / shift
            if (shifts.length > 0) {
                const blocks = shifts.map(s => {
                    const shiftBills = reportData.filter(b => b.shiftno === s.shiftno);
                    const billsToUse = shiftBills.length > 0 ? shiftBills : reportData.filter(b => (b.cashier_name || b.User) === s.User);

                    const grouped = billsToUse.reduce((acc, curr) => {
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
                    const openingBal = parseFloat(s.OpeningBalance || 0);
                    if (openingBal > 0) {
                        categories.unshift({ name: "OPENING BALANCE", receipts: openingBal, payments: 0 });
                    }

                    const totalReceipts = categories.reduce((sum, c) => sum + c.receipts, 0);
                    const totalPayments = categories.reduce((sum, c) => sum + c.payments, 0);
                    const closingBalance = parseFloat(s.ClosingBalance || (totalReceipts - totalPayments));

                    return {
                        shiftno: s.shiftno,
                        cashierName: s.User || s.CashierID || "Cashier",
                        startTime: s.StartTime || "N/A",
                        endTime: s.EndTime || "Active",
                        date: s.date,
                        isAllShifts: false,
                        categories,
                        totalReceipts,
                        totalPayments,
                        closingBalance
                    };
                }).filter(b => b.categories.length > 0);

                // Handle any bills for cashiers not present in shifts array
                const handledShiftnos = new Set(shifts.map(s => s.shiftno));
                const handledCashiers = new Set(shifts.map(s => s.User));
                const unhandledBills = reportData.filter(b => !handledShiftnos.has(b.shiftno) && !handledCashiers.has(b.cashier_name));

                if (unhandledBills.length > 0) {
                    const cashierGroups = unhandledBills.reduce((acc, b) => {
                        const cName = b.cashier_name || "Unassigned Cashier";
                        if (!acc[cName]) acc[cName] = [];
                        acc[cName].push(b);
                        return acc;
                    }, {});

                    Object.entries(cashierGroups).forEach(([cName, cBills]) => {
                        const grouped = cBills.reduce((acc, curr) => {
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

                        blocks.push({
                            shiftno: "General",
                            cashierName: cName,
                            startTime: fromDate,
                            endTime: toDate,
                            date: null,
                            isAllShifts: false,
                            categories,
                            totalReceipts,
                            totalPayments,
                            closingBalance: totalReceipts - totalPayments
                        });
                    });
                }

                return blocks;
            }

            // Fallback if shifts list is empty: Group reportData by cashier_name
            const cashierMap = reportData.reduce((acc, curr) => {
                const cName = curr.cashier_name || "Unassigned Cashier";
                if (!acc[cName]) acc[cName] = [];
                acc[cName].push(curr);
                return acc;
            }, {});

            return Object.entries(cashierMap).map(([cName, cBills]) => {
                const grouped = cBills.reduce((acc, curr) => {
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

                return {
                    shiftno: "Summary",
                    cashierName: cName,
                    startTime: fromDate,
                    endTime: toDate,
                    date: null,
                    isAllShifts: false,
                    categories,
                    totalReceipts,
                    totalPayments,
                    closingBalance: totalReceipts - totalPayments
                };
            });
        }

        // ── SINGLE SHIFT MODE ──
        const activeShifts = shifts.filter(sh => sh.shiftno === selectedShiftId);

        return activeShifts.map(s => {
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
                                    {block.shiftno === "All Shifts"
                                        ? `All Shifts Summary`
                                        : `Cashier: ${block.cashierName} ${block.shiftno !== 'General' && block.shiftno !== 'Summary' ? `(Shift No: ${block.shiftno})` : ''}`}
                                </h4>
                            </div>
                            <InfoGrid>
                                <InfoItem><InfoLabel>Date / Period</InfoLabel><InfoValue>{block.date ? format(new Date(block.date), "dd/MM/yyyy") : `${fromDate} to ${toDate}`}</InfoValue></InfoItem>
                                <InfoItem><InfoLabel>Cashier</InfoLabel><InfoValue style={{ fontWeight: 700, color: colors.primary }}>{block.cashierName}</InfoValue></InfoItem>
                                <InfoItem><InfoLabel>Shift No</InfoLabel><InfoValue>{block.shiftno}</InfoValue></InfoItem>
                                <InfoItem><InfoLabel>Total Collection</InfoLabel><InfoValue style={{ color: colors.success, fontWeight: 700 }}>₹{block.totalReceipts.toFixed(2)}</InfoValue></InfoItem>
                            </InfoGrid>

                            <TableWrapper style={{ boxShadow: "none", border: `1px solid ${colors.border}` }}>
                                <Table>
                                    <thead>
                                        <Tr>
                                            <Th style={{ width: "80px" }}>SlNo.</Th>
                                            <Th>Bill Type / Category</Th>
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

            <style>
                {`
                @media print {
                    @page { size: portrait; margin: 10mm; }
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
                {shiftBlocks.map((block, idx) => (
                    <div key={idx} style={{ pageBreakAfter: idx < shiftBlocks.length - 1 ? "always" : "auto", paddingBottom: "20px" }}>
                        <PrintHeader>
                            <h1>{hospital_name}</h1>
                            <p>{branch_name}</p>
                            <div className="report-title">Cashier Wise Summary Report</div>
                        </PrintHeader>

                        <PrintInfoTable>
                            <tbody>
                                <tr>
                                    <td style={{ width: "35%" }}><strong>Shift No:</strong> {block.shiftno}</td>
                                    <td style={{ width: "35%" }}><strong>Start Time:</strong> {block.startTime}</td>
                                    <td style={{ width: "30%", textAlign: "right" }}><strong>End Time:</strong> {block.endTime}</td>
                                </tr>
                                <tr>
                                    <td><strong>Staff Name:</strong> {block.cashierName}</td>
                                    <td><strong>Date:</strong> {block.date ? dayjs(block.date).format("DD/MM/YYYY") : "All Dates"}</td>
                                    <td style={{ textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                                </tr>
                            </tbody>
                        </PrintInfoTable>

                        <PrintTable>
                            <thead>
                                <tr>
                                    <th>SlNo.</th>
                                    <th>Bill Name</th>
                                    <th style={{ textAlign: "right" }}>Receipts</th>
                                    <th style={{ textAlign: "right" }}>Payments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.categories.map((cat, cIdx) => (
                                    <tr key={cIdx}>
                                        <td>{cIdx + 1}</td>
                                        <td>{cat.name}</td>
                                        <td style={{ textAlign: "right" }}>₹{cat.receipts.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{cat.payments.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                    <td colSpan="2" style={{ textAlign: "right" }}>Total:</td>
                                    <td style={{ textAlign: "right" }}>₹{block.totalReceipts.toFixed(2)}</td>
                                    <td style={{ textAlign: "right" }}>₹{block.totalPayments.toFixed(2)}</td>
                                </tr>
                                <tr style={{ fontWeight: "bold", background: "#e6e6e6" }}>
                                    <td colSpan="2" style={{ textAlign: "right" }}>Closing Balance:</td>
                                    <td colSpan="2" style={{ textAlign: "right" }}>₹{block.closingBalance.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </PrintTable>

                        <PrintSignatures>
                            <div className="sig-box">Prepared By</div>
                            <div className="sig-box">Accounts Officer</div>
                            <div className="sig-box">Authorized Signatory</div>
                        </PrintSignatures>
                    </div>
                ))}
            </PrintTemplate>
        </PageWrapper>
    );
};

export default CashierWiseReport;
