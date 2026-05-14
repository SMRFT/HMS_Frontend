import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaEye, FaTimes } from "react-icons/fa";
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
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100px;
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
        display: block;
        background: white;
        width: 100%;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 20px;
    h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
    p { margin: 2px 0; font-size: 12px; }
`;

const ShiftBasisReport = ({ isModalView = false, startDate, endDate }) => {
    const location = useLocation();
    const [fromDate, setFromDate] = useState(startDate || location.state?.startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || location.state?.endDate || format(new Date(), "yyyy-MM-dd"));
    const [outlet, setOutlet] = useState("all");
    const [outlets, setOutlets] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [viewType, setViewType] = useState("summary"); // "summary", "grouped"
    const [summary, setSummary] = useState(null);
    const [shiftNo, setShiftNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedShiftBills, setSelectedShiftBills] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_code = localStorage.getItem("hospital_code") || "SH001";
    const branch_code = localStorage.getItem("selected_branch") || "SHB001";
    const user_id = localStorage.getItem("employeeId");
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) {
            const loadInitialData = async () => {
                await fetchOutlets();
                await fetchReport();
            };
            loadInitialData();
        }
    }, [fromDate, toDate, outlet, shiftNo, viewType]);

    const fetchOutlets = async () => {
        try {
            const response = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
            if (response.success && response.data) {
                setOutlets(response.data);
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const payload = {
                from_date: fromDate,
                to_date: toDate,
                outlet_code: outlet,
                shiftno: shiftNo,
                "auth-hospital-code": hospital_code,
                "auth-branch-code": branch_code,
                "auth-user-id": user_id
            };

            // Fetch Detailed Report
            const detailedRes = await apiRequest(`${HmsBaseUrl}shift_basis_accounts_report/`, "POST", payload);
            if (detailedRes.success && detailedRes.data.success) {
                setReportData(detailedRes.data.data);
                setSummary(detailedRes.data.summary);
            }

            // Fetch Summary Report
            const summaryRes = await apiRequest(`${HmsBaseUrl}get_shift_summary_report/`, "POST", payload);
            if (summaryRes.success && summaryRes.data.success) {
                setSummaryData(summaryRes.data.data);
            }

        } catch (error) {
            toast.error("Error fetching report");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to group reportData by shiftno
    const groupedData = summaryData.map(s => {
        return {
            ...s,
            bills: reportData.filter(b => b.shiftno === s.shiftno)
        };
    }).filter(group => group.bills.length > 0 || !shiftNo); // Show all shifts or only filtered

    return (
        <>
            <PageWrapper>
                <SectionTitle>
                    <h3>Shift Basis Accounts Report</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        {shiftNo ? `Report for Shift: ${shiftNo}` : `Range: ${format(new Date(fromDate), "dd MMM yyyy")} to ${format(new Date(toDate), "dd MMM yyyy")}`}
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
                                style={{ width: '100%', height: '35px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker 
                                value={toDate ? dayjs(toDate) : null} 
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', height: '35px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Outlet</Label>
                            <Select
                                value={outlet}
                                onChange={(e) => setOutlet(e.target.value)}
                            >
                                <option value="all">All Outlets</option>
                                {outlets.map((o) => (
                                    <option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name}
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Shift No</Label>
                            <Input
                                type="text"
                                placeholder="e.g. 2627/000001"
                                value={shiftNo}
                                onChange={(e) => setShiftNo(e.target.value)}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>View Mode</Label>
                            <Select
                                value={viewType}
                                onChange={(e) => setViewType(e.target.value)}
                            >
                                <option value="grouped">Shift Wise Report</option>
                                <option value="summary">Summary Table</option>
                            </Select>
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "35px", flex: 1 }}>
                                {loading ? "..." : "Filter"}
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "35px", flex: 1 }}>
                                Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>

                {viewType === "grouped" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        {groupedData.length > 0 ? (
                            groupedData.map((group, idx) => (
                                <div key={idx} className="grouped-shift-item" style={{ background: "white", borderRadius: "12px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                                    {/* SHIFT HEADER */}
                                    <div style={{ background: colors.surface, padding: "20px", borderBottom: `2px solid ${colors.primary}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "15px" }}>
                                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                            <h4 style={{ margin: 0, color: colors.primary }}>SHIFT: {group.shiftno}</h4>
                                            <span style={{ fontSize: "0.8rem", fontWeight: "700", padding: "4px 12px", borderRadius: "15px", background: group.ShiftStatus === 'active' ? "#dcfce7" : "#f1f5f9", color: group.ShiftStatus === 'active' ? "#166534" : "#475569" }}>
                                                {group.ShiftStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <SummaryLabel>Date</SummaryLabel>
                                            <div style={{ fontWeight: "700" }}>{group.date}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Opening Bal</SummaryLabel>
                                            <div style={{ fontWeight: "700" }}>₹{(group.OpeningBalance || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Collection</SummaryLabel>
                                            <div style={{ fontWeight: "700", color: colors.success }}>₹{(group.collected_Amount || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Closing Bal</SummaryLabel>
                                            <div style={{ fontWeight: "700" }}>₹{(group.ClosingBalance || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Remitted</SummaryLabel>
                                            <div style={{ fontWeight: "700", color: "#6366f1" }}>₹{(group.RemittedToBank || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Handover</SummaryLabel>
                                            <div style={{ fontWeight: "700", color: "#8b5cf6" }}>₹{(group.SubmittedToAccount || group.HandOverAmount || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Counter</SummaryLabel>
                                            <div style={{ fontWeight: "700" }}>{group.SelectedOutlet}</div>
                                        </div>
                                        <div>
                                            <SummaryLabel>Duration</SummaryLabel>
                                            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>{group.StartTime} - {group.EndTime || "Active"}</div>
                                        </div>
                                    </div>

                                    {/* BILLS TABLE */}
                                    <div style={{ padding: "10px" }}>
                                        <Table style={{ border: "none", boxShadow: "none" }}>
                                            <thead>
                                                <Tr style={{ background: "#f8fafc" }}>
                                                    <Th style={{ padding: "8px" }}>Type</Th>
                                                    <Th style={{ padding: "8px" }}>Bill No</Th>
                                                    <Th style={{ padding: "8px" }}>Patient</Th>
                                                    <Th style={{ padding: "8px", textAlign: "right" }}>Amount</Th>
                                                    <Th style={{ padding: "8px" }}>Mode</Th>
                                                    <Th style={{ padding: "8px" }}>Cashier</Th>
                                                    <Th style={{ padding: "8px", textAlign: "center" }}>View</Th>
                                                </Tr>
                                            </thead>
                                            <tbody>
                                                {group.bills.map((b, bi) => (
                                                    <Tr key={bi}>
                                                        <Td style={{ padding: "8px" }}>
                                                            <span style={{ fontSize: "0.6rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: b.type === 'Pharmacy' ? "#dcfce7" : b.type === 'Investigation' ? "#dbeafe" : "#fef3c7", color: b.type === 'Pharmacy' ? "#166534" : b.type === 'Investigation' ? "#1e40af" : "#92400e" }}>{b.type}</span>
                                                        </Td>
                                                        <Td style={{ padding: "8px" }}>{b.bill_no}</Td>
                                                        <Td style={{ padding: "8px" }}>
                                                            <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{b.patient_name}</div>
                                                            <div style={{ fontSize: "0.65rem", color: colors.textMuted }}>{b.uhid}</div>
                                                        </Td>
                                                        <Td style={{ padding: "8px", textAlign: "right", fontWeight: "700", color: b.display_amount < 0 ? colors.danger : colors.textMain }}>₹{(b.net_amount || 0).toFixed(2)}</Td>
                                                        <Td style={{ padding: "8px", fontSize: "0.75rem" }}>{b.payment_mode}</Td>
                                                        <Td style={{ padding: "8px", fontSize: "0.75rem" }}>{b.cashier_name}</Td>
                                                        <Td style={{ padding: "8px", textAlign: "center" }}>
                                                            <FaEye
                                                                style={{ cursor: "pointer", color: colors.primary, fontSize: "1.1rem" }}
                                                                onClick={() => setSelectedBill(b)}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}
                                                {group.bills.length === 0 && (
                                                    <Tr><Td colSpan="6" style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>No transactions recorded in this shift.</Td></Tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px", background: colors.surface, borderRadius: "12px", color: colors.textMuted }}>No shift data found for the selected criteria.</div>
                        )}
                    </div>
                ) : (
                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>Counter</Th>
                                    <Th>Date</Th>
                                    <Th>Shift No</Th>
                                    <Th>Cashier Name</Th>
                                    <Th>Start Time</Th>
                                    <Th>End Time</Th>
                                    <Th style={{ textAlign: "right" }}>Opening Bal</Th>
                                    <Th style={{ textAlign: "right" }}>Closing Bal</Th>
                                    <Th style={{ textAlign: "right" }}>Collection</Th>
                                    <Th style={{ textAlign: "right" }}>Return</Th>
                                    <Th style={{ textAlign: "right" }}>Remitted</Th>
                                    <Th style={{ textAlign: "right" }}>Handover</Th>
                                    <Th style={{ textAlign: "right" }}>Total Coll.</Th>
                                    <Th style={{ textAlign: "center" }} className="hide-on-print">Action</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {summaryData.length > 0 ? (
                                    summaryData.map((s, i) => (
                                        <Tr key={i}>
                                            <Td>{s.SelectedOutlet}</Td>
                                            <Td>{s.date ? format(new Date(s.date), "dd/MM/yyyy") : "N/A"}</Td>
                                            <Td style={{ fontWeight: "700", color: colors.primary }}>{s.shiftno}</Td>
                                            <Td>{s.User}</Td>
                                            <Td style={{ fontSize: "0.75rem" }}>{s.StartTime}</Td>
                                            <Td style={{ fontSize: "0.75rem" }}>{s.EndTime || "Active"}</Td>
                                            <Td style={{ textAlign: "right" }}>₹{(parseFloat(s.OpeningBalance || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(parseFloat(s.ClosingBalance || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", color: colors.success, fontWeight: "600" }}>₹{(parseFloat(s.collected_Amount || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", color: colors.danger }}>₹{(parseFloat(s.SalesReturnAmount || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", color: "#6366f1" }}>₹{(parseFloat(s.RemittedToBank || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", color: "#8b5cf6" }}>₹{(parseFloat(s.SubmittedToAccount || s.HandOverAmount || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(parseFloat(s.collected_Amount || 0)).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "center" }} className="hide-on-print">
                                                <FaEye
                                                    style={{ cursor: "pointer", color: colors.primary, fontSize: "1.1rem" }}
                                                    onClick={() => {
                                                        const bills = reportData.filter(b => b.shiftno === s.shiftno);
                                                        setSelectedShiftBills({ shiftno: s.shiftno, bills });
                                                    }}
                                                />
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan="14" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                            No shift records found.
                                        </Td>
                                    </Tr>
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>
                )}

                <style>
                    {`
                @media print {
                    /* Hide everything by default */
                    body * { visibility: hidden; }
                    /* Show only our print template and its children */
                    #printable-shift-report, #printable-shift-report * { visibility: visible; }
                    #printable-shift-report { 
                        display: block !important;
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                        visibility: visible !important;
                    }
                    /* Ensure no background colors or extra spacing from parent elements */
                    body { background: white !important; margin: 0; padding: 0; }
                }
                `}
                </style>

                {/* PROFESSIONAL PRINT TEMPLATE */}
                <PrintTemplate>
                    <PrintHeader>
                        <h1>{hospital_name}</h1>
                        <p>{branch_name}</p>
                        <p style={{ marginTop: "10px", fontSize: "16px", fontWeight: "bold" }}>SHIFT BASIS ACCOUNTS REPORT</p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "11px" }}>
                            <span>Report Range: {format(new Date(fromDate), "dd/MM/yyyy")} to {format(new Date(toDate), "dd/MM/yyyy")}</span>
                            <span>Printed On: {format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                    </PrintHeader>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                        <thead>
                            <tr style={{ background: "#f0f0f0" }}>
                                <th style={{ border: "1px solid black", padding: "5px" }}>Shift No</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Opening Bal</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Collection</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Closing Bal</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Remitted</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Handover</th>
                                <th style={{ border: "1px solid black", padding: "5px" }}>Counter</th>
                                <th style={{ border: "1px solid black", padding: "5px" }}>Start Time</th>
                                <th style={{ border: "1px solid black", padding: "5px" }}>Close Time</th>
                                <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Total Coll.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryData.map((s, i) => (
                                <tr key={i}>
                                    <td style={{ border: "1px solid black", padding: "5px" }}>{s.shiftno}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{(s.OpeningBalance || 0).toFixed(2)}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{(s.collected_Amount || 0).toFixed(2)}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{(s.ClosingBalance || 0).toFixed(2)}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{(s.RemittedToBank || 0).toFixed(2)}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{(s.SubmittedToAccount || s.HandOverAmount || 0).toFixed(2)}</td>
                                    <td style={{ border: "1px solid black", padding: "5px" }}>{s.SelectedOutlet}</td>
                                    <td style={{ border: "1px solid black", padding: "5px" }}>{s.StartTime}</td>
                                    <td style={{ border: "1px solid black", padding: "5px" }}>{s.EndTime || "Active"}</td>
                                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "right", fontWeight: "bold" }}>{(s.collected_Amount || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ textAlign: "center", width: "200px" }}>
                            <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}>Cashier Signature</div>
                        </div>
                        <div style={{ textAlign: "center", width: "200px" }}>
                            <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}>Accounts Officer</div>
                        </div>
                        <div style={{ textAlign: "center", width: "200px" }}>
                            <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}>Authorized Signatory</div>
                        </div>
                    </div>

                    <div style={{ position: "fixed", bottom: "0", width: "100%", textAlign: "center", fontSize: "9px", borderTop: "1px solid #ddd", paddingTop: "5px" }}>
                        {hospital_name} - Shift Basis Accounts Report. Page 1 of 1
                    </div>
                </PrintTemplate>

                {selectedShiftBills && (
                    <ModalOverlay onClick={() => setSelectedShiftBills(null)}>
                        <ModalContainer style={{ maxWidth: "900px" }} onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Transactions for Shift: {selectedShiftBills.shiftno}</ModalTitle>
                                <CloseButton onClick={() => setSelectedShiftBills(null)}>×</CloseButton>
                            </ModalHeader>
                            <ModalBody>

                            <TableWrapper style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                <Table>
                                    <thead>
                                        <Tr style={{ background: "#f8fafc" }}>
                                            <Th>Type</Th>
                                            <Th>Bill No</Th>
                                            <Th>Patient</Th>
                                            <Th style={{ textAlign: "right" }}>Amount</Th>
                                            <Th>Mode</Th>
                                            <Th>Cashier</Th>
                                            <Th style={{ textAlign: "center" }}>Details</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {selectedShiftBills.bills.length > 0 ? (
                                            selectedShiftBills.bills.map((b, bi) => (
                                                <Tr key={bi}>
                                                    <Td>
                                                        <span style={{ fontSize: "0.6rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: b.type === 'Pharmacy' ? "#dcfce7" : b.type === 'Investigation' ? "#dbeafe" : "#fef3c7", color: b.type === 'Pharmacy' ? "#166534" : b.type === 'Investigation' ? "#1e40af" : "#92400e" }}>{b.type}</span>
                                                    </Td>
                                                    <Td style={{ fontSize: "0.85rem" }}>{b.bill_no}</Td>
                                                    <Td>
                                                        <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{b.patient_name}</div>
                                                        <div style={{ fontSize: "0.65rem", color: colors.textMuted }}>{b.uhid}</div>
                                                    </Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(b.net_amount || 0).toFixed(2)}</Td>
                                                    <Td style={{ fontSize: "0.75rem" }}>{b.payment_mode}</Td>
                                                    <Td style={{ fontSize: "0.75rem" }}>{b.cashier_name}</Td>
                                                    <Td style={{ textAlign: "center" }}>
                                                        <FaEye
                                                            style={{ cursor: "pointer", color: colors.secondary, fontSize: "1rem" }}
                                                            onClick={() => setSelectedBill(b)}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan="7" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>No transactions found for this shift.</Td></Tr>
                                        )}
                                    </tbody>
                                </Table>
                            </TableWrapper>
                            </ModalBody>
                            <div style={{ padding: "15px", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${colors.border}` }}>
                                <Button secondary onClick={() => setSelectedShiftBills(null)}>Close</Button>
                            </div>
                            
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {selectedBill && (
                    <ModalOverlay style={{ zIndex: 3000 }} onClick={() => setSelectedBill(null)}>
                        <ModalContainer onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Bill Details: {selectedBill.bill_no}</ModalTitle>
                                <CloseButton onClick={() => setSelectedBill(null)}>×</CloseButton>
                            </ModalHeader>
                            <ModalBody>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                                <div>
                                    <SummaryLabel>Patient Information</SummaryLabel>
                                    <div style={{ fontWeight: "700", fontSize: "1.1rem", marginTop: "5px" }}>{selectedBill.patient_name}</div>
                                    <div style={{ color: colors.textMuted }}>UHID: {selectedBill.uhid}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <SummaryLabel>Transaction Info</SummaryLabel>
                                    <div style={{ fontWeight: "600", marginTop: "5px" }}>{selectedBill.type}</div>
                                    <div style={{ color: colors.textMuted }}>{format(new Date(selectedBill.bill_date), "dd MMM yyyy, HH:mm")}</div>
                                </div>
                                <div>
                                    <SummaryLabel>Payment Details</SummaryLabel>
                                    <div style={{ fontWeight: "600", marginTop: "5px" }}>Mode: {selectedBill.payment_mode}</div>
                                    <div style={{ fontWeight: "700", color: colors.success }}>Total: ₹{(selectedBill.net_amount || 0).toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <SummaryLabel>Billing Station</SummaryLabel>
                                    <div style={{ fontWeight: "600", marginTop: "5px" }}>Outlet: {selectedBill.outlet_code}</div>
                                    <div style={{ color: colors.textMuted }}>Cashier: {selectedBill.cashier_name}</div>
                                </div>
                            </div>

                            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "15px" }}>
                                <SummaryLabel style={{ marginBottom: "10px", display: "block" }}>Items / Services</SummaryLabel>
                                <Table style={{ border: "none", boxShadow: "none", background: "transparent" }}>
                                    <thead>
                                        <Tr style={{ background: "rgba(0,0,0,0.03)" }}>
                                            <Th style={{ padding: "8px", fontSize: "0.75rem" }}>Item Name</Th>
                                            <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "center" }}>Qty</Th>
                                            <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "right" }}>Price</Th>
                                            <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "right" }}>Amount</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(selectedBill.items) && selectedBill.items.length > 0 ? (
                                            selectedBill.items.map((item, idx) => (
                                                <Tr key={idx}>
                                                    <Td style={{ padding: "8px", fontSize: "0.8rem" }}>{item.itemName || item.item_name || item.name || "N/A"}</Td>
                                                    <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "center" }}>{item.quantity || 1}</Td>
                                                    <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "right" }}>₹{parseFloat(item.price || item.rate || 0).toFixed(2)}</Td>
                                                    <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "right", fontWeight: "600" }}>₹{parseFloat(item.amount || (parseFloat(item.price || item.rate || 0) * (item.quantity || 1))).toFixed(2)}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan="4" style={{ textAlign: "center", padding: "15px", color: colors.textMuted, fontSize: "0.8rem" }}>No item breakdown available.</Td>
                                            </Tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            </ModalBody>
                            <div style={{ padding: "15px", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${colors.border}` }}>
                                <Button onClick={() => setSelectedBill(null)}>Close</Button>
                            </div>
                        </ModalContainer>
                    </ModalOverlay>
                    
                )}
            </PageWrapper>

            {/* PROFESSIONAL PRINT TEMPLATE - MOVED OUTSIDE PAGEWRAPPER */}
            <PrintTemplate id="printable-shift-report">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p style={{ marginTop: "10px", fontSize: "16px", fontWeight: "bold" }}>SHIFT BASIS ACCOUNTS REPORT</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "11px" }}>
                        <span>Report Range: {format(new Date(fromDate), "dd-MM-yyyy")} to {format(new Date(toDate), "dd-MM-yyyy")}</span>
                        <span>Printed On: {format(new Date(), "dd-MM-yyyy HH:mm")}</span>
                    </div>
                </PrintHeader>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th style={{ border: "1px solid black", padding: "5px" }}>Counter</th>
                            <th style={{ border: "1px solid black", padding: "5px" }}>Date</th>
                            <th style={{ border: "1px solid black", padding: "5px" }}>Shift No</th>
                            <th style={{ border: "1px solid black", padding: "5px" }}>Cashier Name</th>
                            <th style={{ border: "1px solid black", padding: "5px" }}>Start Time</th>
                            <th style={{ border: "1px solid black", padding: "5px" }}>End Time</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Opening Bal</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Closing Bal</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Collection</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Return</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Remitted</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Handover</th>
                            <th style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>Total Coll.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData && summaryData.length > 0 ? summaryData.map((s, i) => (
                            <tr key={i}>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.SelectedOutlet}</td>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.date}</td>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.shiftno}</td>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.User}</td>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.StartTime}</td>
                                <td style={{ border: "1px solid black", padding: "5px" }}>{s.EndTime || "Active"}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.OpeningBalance || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.ClosingBalance || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.collected_Amount || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.SalesReturnAmount || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.RemittedToBank || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>{parseFloat(s.SubmittedToAccount || s.HandOverAmount || 0).toFixed(2)}</td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right", fontWeight: "bold" }}>{parseFloat(s.collected_Amount || 0).toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="13" style={{ textAlign: "center", padding: "10px" }}>No data available for print.</td></tr>
                        )}
                    </tbody>
                    {summaryData && summaryData.length > 0 && (
                        <tfoot>
                            <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <td style={{ border: "1px solid black", padding: "5px" }}>GRAND TOTAL</td>
                                <td colSpan="5" style={{ border: "1px solid black", padding: "5px" }}></td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.OpeningBalance || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.ClosingBalance || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.collected_Amount || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.SalesReturnAmount || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.RemittedToBank || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.SubmittedToAccount || s.HandOverAmount || 0), 0).toFixed(2)}
                                </td>
                                <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                                    {summaryData.reduce((acc, s) => acc + parseFloat(s.collected_Amount || 0), 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>

                <div style={{ position: "fixed", bottom: "0", width: "100%", textAlign: "center", fontSize: "9px", borderTop: "1px solid #ddd", paddingTop: "5px" }}>
                    {hospital_name} - Shift Basis Accounts Report. Printed by {user_id}
                </div>
            </PrintTemplate>
        </>
    );
};

export default ShiftBasisReport;
