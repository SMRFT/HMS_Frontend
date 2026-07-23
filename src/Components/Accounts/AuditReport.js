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

const SourceBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => props.bg || "#f1f5f9"};
    color: ${props => props.color || colors.textMuted};
`;

const sourceColors = {
    "Registration Billing": { bg: "#eff6ff", color: "#2563eb" },
    "Pharmacy Billing": { bg: "#f0fdfa", color: colors.primary },
    "Sales Return": { bg: "#fef2f2", color: colors.danger },
    "Investigation Billing": { bg: "#fffbeb", color: "#d97706" },
};

const AuditReport = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [sourceFilter, setSourceFilter] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ count: 0, by_source: {} });
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
            const response = await apiRequest(`${HmsBaseUrl}audit-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { count: 0, by_source: {} });
            }
        } catch (error) {
            console.error("Error fetching audit report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const filteredData = sourceFilter === "all" ? reportData : reportData.filter(r => r.source === sourceFilter);

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Audit Report (Edit View)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Cross-record edit trail: Registration, Pharmacy, Sales Return &amp; Investigation billing
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
                    <InputWrapper>
                        <Label>Source</Label>
                        <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                            <option value="all">All Sources</option>
                            <option value="Registration Billing">Registration Billing</option>
                            <option value="Pharmacy Billing">Pharmacy Billing</option>
                            <option value="Sales Return">Sales Return</option>
                            <option value="Investigation Billing">Investigation Billing</option>
                        </Select>
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
                    <SummaryLabel>Total Edits</SummaryLabel>
                    <SummaryValue>{summary.count}</SummaryValue>
                </SummaryCard>
                {Object.entries(summary.by_source || {}).map(([src, count]) => (
                    <SummaryCard key={src} color={sourceColors[src]?.color || colors.secondary}>
                        <SummaryLabel>{src}</SummaryLabel>
                        <SummaryValue>{count}</SummaryValue>
                    </SummaryCard>
                ))}
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Source</Th>
                            <Th>Record No</Th>
                            <Th>UHID / Patient</Th>
                            <Th>Change</Th>
                            <Th>Old Value</Th>
                            <Th>New Value</Th>
                            <Th>Edited By</Th>
                            <Th>Edited Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td><SourceBadge bg={sourceColors[row.source]?.bg} color={sourceColors[row.source]?.color}>{row.source}</SourceBadge></Td>
                                    <Td>{row.record_no}</Td>
                                    <Td>{row.uhid ? `${row.uhid} (${row.patient_name || "Unknown"})` : "N/A"}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.description}</Td>
                                    <Td>{row.old_value}</Td>
                                    <Td>{row.new_value}</Td>
                                    <Td>{row.edited_by_name}</Td>
                                    <Td>{row.edited_date}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="9" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No edits found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
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

export default AuditReport;
