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
    font-size: 1.4rem;
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

const TypeBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 700;
    background: ${props => props.bg || "#f1f5f9"};
    color: ${props => props.color || colors.textMuted};
`;

const typeColors = {
    "Registration (OP)": { bg: "#eff6ff", color: "#2563eb" },
    "Pharmacy": { bg: "#f0fdfa", color: colors.primary },
    "Discharge": { bg: "#fef2f2", color: colors.danger },
};

const CreditCardReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ total_transactions: 0, total_amount: 0, by_type: {} });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}credit-card-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { total_transactions: 0, total_amount: 0, by_type: {} });
            }
        } catch (error) {
            console.error("Error fetching credit card report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Credit Card Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Card-mode collections across Registration (OP), Pharmacy, and Discharge billing
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
                    <SummaryLabel>Transactions</SummaryLabel>
                    <SummaryValue>{summary.total_transactions}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Total Card Collection</SummaryLabel>
                    <SummaryValue>₹{(summary.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                {Object.entries(summary.by_type || {}).map(([type, amt]) => (
                    <SummaryCard key={type} color={typeColors[type]?.color || colors.secondary}>
                        <SummaryLabel>{type}</SummaryLabel>
                        <SummaryValue>₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                    </SummaryCard>
                ))}
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Type</Th>
                            <Th>Bill No</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Bill Date</Th>
                            <Th style={{ textAlign: "right" }}>Card Amount</Th>
                            <Th>Note</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td><TypeBadge bg={typeColors[row.type]?.bg} color={typeColors[row.type]?.color}>{row.type}</TypeBadge></Td>
                                    <Td>{row.bill_no}</Td>
                                    <Td>{row.uhid}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.patient_name}</Td>
                                    <Td>{row.bill_date ? dayjs(row.bill_date).format("DD/MM/YYYY") : "N/A"}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{(row.amount || 0).toFixed(2)}</Td>
                                    <Td style={{ fontSize: "0.8rem", color: colors.textMuted }}>
                                        {row.is_partial ? "Part of Multiple Payment" : ""}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No card transactions found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="6" style={{ textAlign: "right" }}>Total:</Td>
                                <Td style={{ textAlign: "right", color: colors.primary }}>₹{(summary.total_amount || 0).toFixed(2)}</Td>
                                <Td></Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </PageWrapper>
    );
};

export default CreditCardReport;
