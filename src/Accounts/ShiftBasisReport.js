import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
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
} from "../Components/GlobalStyles";
import styled from "styled-components";

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

const ShiftBasisReport = () => {
    const [fromDate, setFromDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [outlet, setOutlet] = useState("all");
    const [outlets, setOutlets] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_code = localStorage.getItem("hospital_code") || "SH001";
    const branch_code = localStorage.getItem("selected_branch") || "SHB001";
    const user_id = localStorage.getItem("employeeId");

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchOutlets();
            await fetchReport();
        };
        loadInitialData();
    }, []);

    const fetchOutlets = async () => {
        try {
            const response = await axios.get(`${HmsBaseUrl}get-all-outlets/`);
            if (response.data) {
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
                "auth-hospital-code": hospital_code,
                "auth-branch-code": branch_code,
                "auth-user-id": user_id
            };

            const response = await axios.post(`${HmsBaseUrl}pharmacy_sales_report/`, payload);
            if (response.data.success) {
                setReportData(response.data.data);
                setSummary(response.data.summary);
            } else {
                toast.error(response.data.message || "Failed to fetch report");
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

    return (
        <PageWrapper>
            <SectionTitle>
                <h3>Pharmacy Sales Report</h3>
            </SectionTitle>

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Date</Label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Date</Label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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

            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "25px" }}>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Total Sales</SummaryLabel>
                        <SummaryValue>₹{summary.total_sales.toLocaleString()}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.secondary}>
                        <SummaryLabel>Total Discount</SummaryLabel>
                        <SummaryValue>₹{summary.total_discount.toLocaleString()}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.success}>
                        <SummaryLabel>Net Amount</SummaryLabel>
                        <SummaryValue>₹{summary.total_net.toLocaleString()}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#ec4899">
                        <SummaryLabel>Bill Count</SummaryLabel>
                        <SummaryValue>{summary.count}</SummaryValue>
                    </SummaryCard>
                </div>
            )}

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>Bill Info</Th>
                            <Th>Patient</Th>
                            <Th style={{ textAlign: "right" }}>Gross Total</Th>
                            <Th style={{ textAlign: "right" }}>Discount</Th>
                            <Th style={{ textAlign: "right" }}>Net Total</Th>
                            <Th>Status & Mode</Th>
                            <Th>Cashier</Th>
                            <Th style={{ textAlign: "center" }}>Location</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((b, i) => (
                                <Tr key={i}>
                                    <Td>
                                        <div style={{ fontWeight: "600" }}>{b.bill_no}</div>
                                        <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>
                                            {format(new Date(b.bill_date), "dd MMM yyyy, HH:mm")}
                                        </div>
                                    </Td>
                                    <Td>
                                        <div style={{ fontWeight: "600" }}>{b.patient_name || "Unknown"}</div>
                                        <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>{b.uhid}</div>
                                    </Td>
                                    <Td style={{ textAlign: "right" }}>₹{b.total_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>-₹{b.discount_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.success }}>₹{b.net_amount.toFixed(2)}</Td>
                                    <Td>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <span style={{ 
                                                fontSize: "0.65rem", 
                                                fontWeight: "700",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                backgroundColor: b.billing_status === 'Paid' ? "#dcfce7" : "#fef3c7",
                                                color: b.billing_status === 'Paid' ? "#166534" : "#92400e",
                                                width: "fit-content"
                                            }}>
                                                {b.billing_status}
                                            </span>
                                            <span style={{ fontSize: "0.7rem", color: colors.textMuted }}>
                                                {b.payment_mode || 'Credit'}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div style={{ fontWeight: "500", fontSize: "0.8rem" }}>{b.cashier_name}</div>
                                        <div style={{ fontSize: "0.65rem", color: colors.textMuted }}>ID: {b.cashier_id}</div>
                                    </Td>
                                    <Td style={{ textAlign: "center" }}>
                                        <div style={{ fontWeight: "600" }}>{b.outlet_code}</div>
                                        <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>#{b.shiftno}</div>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No records found for the selected criteria.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    ${PageWrapper} { padding: 0 !important; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

export default ShiftBasisReport;
