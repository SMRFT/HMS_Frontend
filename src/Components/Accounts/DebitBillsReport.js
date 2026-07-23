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

const fieldLabels = {
    consulting_fee: "Consulting Fee",
    registration_fee: "Registration Fee",
    total_fees: "Total Fees",
};

const DebitBillsReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ count: 0, total_debit_amount: 0 });
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
            const response = await apiRequest(`${HmsBaseUrl}debit-bills-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { count: 0, total_debit_amount: 0 });
            }
        } catch (error) {
            console.error("Error fetching debit bills report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Debit Bills Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Bill edits that increased the billed amount (registration/consulting/total fee revisions)
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
                    <SummaryLabel>Debit Entries</SummaryLabel>
                    <SummaryValue>{summary.count}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.danger}>
                    <SummaryLabel>Total Debit Amount</SummaryLabel>
                    <SummaryValue>₹{(summary.total_debit_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Bill No</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Field Revised</Th>
                            <Th style={{ textAlign: "right" }}>Old Amount</Th>
                            <Th style={{ textAlign: "right" }}>New Amount</Th>
                            <Th style={{ textAlign: "right" }}>Debit</Th>
                            <Th>Edited By</Th>
                            <Th>Edited Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td>{row.bill_number}</Td>
                                    <Td>{row.uhid}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.patient_name}</Td>
                                    <Td>{fieldLabels[row.field] || row.field}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.old_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.new_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700, color: colors.danger }}>+₹{(row.debit_amount || 0).toFixed(2)}</Td>
                                    <Td>{row.edited_by_name}</Td>
                                    <Td>{row.edited_date}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="10" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No debit edits found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="7" style={{ textAlign: "right" }}>Total Debit:</Td>
                                <Td style={{ textAlign: "right", color: colors.danger }}>+₹{(summary.total_debit_amount || 0).toFixed(2)}</Td>
                                <Td colSpan="2"></Td>
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

export default DebitBillsReport;
