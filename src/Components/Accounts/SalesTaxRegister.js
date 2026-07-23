import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaExclamationTriangle } from "react-icons/fa";
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

const ApproxNotice = styled.div`
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
`;

const TypeBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => props.type === "Return" ? "#fef2f2" : "#f0fdfa"};
    color: ${props => props.type === "Return" ? colors.danger : colors.primary};
`;

const SalesTaxRegister = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [patientType, setPatientType] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ total_taxable_value: 0, total_tax: 0, total_gross: 0, rate_wise: [] });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, patientType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
            if (patientType !== "all") params.set("patient_type", patientType);
            const response = await apiRequest(`${HmsBaseUrl}sales-tax-register/?${params.toString()}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { total_taxable_value: 0, total_tax: 0, total_gross: 0, rate_wise: [] });
            }
        } catch (error) {
            console.error("Error fetching sales tax register:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Sales Tax Register (GST)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Pharmacy OP/IP sales and sales returns, rate-wise
                </p>
            </SectionTitle>

            <ApproxNotice className="no-print">
                <FaExclamationTriangle />
                Approximate: sale/return lines don't store a tax-rate split at billing time. Rates are re-joined from each item's
                <strong>&nbsp;current&nbsp;</strong> stock batch — bills on batches whose GST rate has since changed may be inaccurate.
            </ApproxNotice>

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
                        <Label>Patient Type</Label>
                        <Select value={patientType} onChange={(e) => setPatientType(e.target.value)}>
                            <option value="all">OP + IP</option>
                            <option value="op">OP Only</option>
                            <option value="ip">IP Only</option>
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
                    <SummaryLabel>Taxable Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_taxable_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <SummaryLabel>Total Tax (CGST+SGST)</SummaryLabel>
                    <SummaryValue>₹{(summary.total_tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Gross Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_gross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            {summary.rate_wise?.length > 0 && (
                <TableWrapper style={{ marginBottom: 20 }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>Rate</Th>
                                <Th style={{ textAlign: "right" }}>Taxable Value</Th>
                                <Th style={{ textAlign: "right" }}>CGST</Th>
                                <Th style={{ textAlign: "right" }}>SGST</Th>
                                <Th style={{ textAlign: "right" }}>Total Tax</Th>
                                <Th style={{ textAlign: "right" }}>Gross</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {summary.rate_wise.map((r, i) => (
                                <Tr key={i}>
                                    <Td style={{ fontWeight: 600 }}>{r.rate}%</Td>
                                    <Td style={{ textAlign: "right" }}>₹{r.taxable_value.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{r.cgst_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{r.sgst_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{r.total_tax.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{r.gross_amount.toFixed(2)}</Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                </TableWrapper>
            )}

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Type</Th>
                            <Th>Patient Type</Th>
                            <Th>Bill No</Th>
                            <Th>Date</Th>
                            <Th>Item</Th>
                            <Th style={{ textAlign: "right" }}>Rate</Th>
                            <Th style={{ textAlign: "right" }}>Taxable</Th>
                            <Th style={{ textAlign: "right" }}>CGST</Th>
                            <Th style={{ textAlign: "right" }}>SGST</Th>
                            <Th style={{ textAlign: "right" }}>Gross</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td><TypeBadge type={row.type}>{row.type}</TypeBadge></Td>
                                    <Td>{row.patient_type}</Td>
                                    <Td>{row.bill_no}</Td>
                                    <Td>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "N/A"}</Td>
                                    <Td>{row.item_name || "N/A"}</Td>
                                    <Td style={{ textAlign: "right" }}>{row.rate}%</Td>
                                    <Td style={{ textAlign: "right" }}>₹{row.taxable_value.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{row.cgst_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{row.sgst_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{row.gross_amount.toFixed(2)}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="11" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No sales or returns found for the selected period.
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

export default SalesTaxRegister;
