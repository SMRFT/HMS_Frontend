import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaInfoCircle } from "react-icons/fa";
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

const InfoNotice = styled.div`
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e3a8a;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
`;

const StockReportIpOp = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ total_ip_qty: 0, total_ip_amount: 0, total_op_qty: 0, total_op_amount: 0 });
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
            const response = await apiRequest(`${HmsBaseUrl}stock-report-ip-op/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { total_ip_qty: 0, total_ip_amount: 0, total_op_qty: 0, total_op_amount: 0 });
            }
        } catch (error) {
            console.error("Error fetching stock report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Pharmacy Stock Report — IP vs OP</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Item-wise quantity and value sold, split by IP and OP bills
                </p>
            </SectionTitle>

            <InfoNotice className="no-print">
                <FaInfoCircle />
                This is a consumption report (sold via IP vs OP bills), not a stock-balance split — stock quantities
                aren't tracked per-transaction in this system, only as a running balance.
            </InfoNotice>

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
                <SummaryCard color={"#2563eb"}>
                    <SummaryLabel>IP Qty Consumed</SummaryLabel>
                    <SummaryValue>{(summary.total_ip_qty || 0).toLocaleString("en-IN")}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={"#2563eb"}>
                    <SummaryLabel>IP Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_ip_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>OP Qty Sold</SummaryLabel>
                    <SummaryValue>{(summary.total_op_qty || 0).toLocaleString("en-IN")}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>OP Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_op_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Item</Th>
                            <Th style={{ textAlign: "right" }}>IP Qty</Th>
                            <Th style={{ textAlign: "right" }}>IP Value</Th>
                            <Th style={{ textAlign: "right" }}>OP Qty</Th>
                            <Th style={{ textAlign: "right" }}>OP Value</Th>
                            <Th style={{ textAlign: "right" }}>Total Qty</Th>
                            <Th style={{ textAlign: "right" }}>Total Value</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.item_name}</Td>
                                    <Td style={{ textAlign: "right" }}>{row.ip_qty}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{row.ip_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>{row.op_qty}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{row.op_amount.toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>{row.total_qty}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{row.total_amount.toFixed(2)}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No pharmacy sales found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="2" style={{ textAlign: "right" }}>Total:</Td>
                                <Td style={{ textAlign: "right" }}>{summary.total_ip_qty}</Td>
                                <Td style={{ textAlign: "right" }}>₹{(summary.total_ip_amount || 0).toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{summary.total_op_qty}</Td>
                                <Td style={{ textAlign: "right" }}>₹{(summary.total_op_amount || 0).toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{summary.total_ip_qty + summary.total_op_qty}</Td>
                                <Td style={{ textAlign: "right" }}>₹{((summary.total_ip_amount || 0) + (summary.total_op_amount || 0)).toFixed(2)}</Td>
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

export default StockReportIpOp;
