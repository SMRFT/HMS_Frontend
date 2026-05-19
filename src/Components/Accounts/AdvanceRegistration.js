import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaMoneyBillWave } from "react-icons/fa";
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${colors.success};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const AdvanceRegistration = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}advance-registration-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data && Array.isArray(response.data.data)) {
                const mappedData = response.data.data.map(item => ({
                    ...item,
                    advance_amount: item.amount,
                    created_by: item.cashier_id || item.created_by
                }));
                setReportData(mappedData);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handlePrint = () => {
        window.print();
    };

    const totals = reportData.reduce((acc, curr) => {
        const amt = curr.advance_amount || 0;
        if (curr.payment_mode?.toLowerCase() === "cash") {
            acc.cash += amt;
        } else {
            acc.credit += amt;
        }
        acc.total += amt;
        return acc;
    }, { cash: 0, credit: 0, total: 0 });

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Advance Registration Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Tracking IP advances and registrations
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.success}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Cash</span>
                    <h3 style={{ margin: 0 }}>₹{totals.cash.toLocaleString("en-IN")}</h3>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Credit/Other</span>
                    <h3 style={{ margin: 0 }}>₹{totals.credit.toLocaleString("en-IN")}</h3>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Grand Total</span>
                    <h3 style={{ margin: 0 }}>₹{totals.total.toLocaleString("en-IN")}</h3>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>IP No</Th>
                            <Th>Bill No</Th>
                            <Th>Patient Details</Th>
                            <Th style={{ textAlign: "right" }}>Cash Amount</Th>
                            <Th style={{ textAlign: "right" }}>Credit Amount</Th>
                            <Th>Cashier</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((adv, index) => {
                                const isCash = adv.payment_mode?.toLowerCase() === "cash";
                                return (
                                    <Tr key={index}>
                                        <Td>{index + 1}</Td>
                                        <Td style={{ fontWeight: "700" }}>{adv.ip_number}</Td>
                                        <Td>{adv.bill_no}</Td>
                                        <Td>
                                            <div style={{ fontWeight: "600" }}>{adv.patient_name}</div>
                                            <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>{adv.uhid}</div>
                                        </Td>
                                        <Td style={{ textAlign: "right", color: colors.success }}>
                                            {isCash ? `₹${adv.advance_amount.toFixed(2)}` : "—"}
                                        </Td>
                                        <Td style={{ textAlign: "right", color: colors.primary }}>
                                            {!isCash ? `₹${adv.advance_amount.toFixed(2)}` : "—"}
                                        </Td>
                                        <Td>{adv.created_by}</Td>
                                    </Tr>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No advances found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="4" style={{ textAlign: "right" }}>Totals:</Td>
                                <Td style={{ textAlign: "right", color: colors.success }}>₹{totals.cash.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right", color: colors.primary }}>₹{totals.credit.toFixed(2)}</Td>
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
                    ${TableWrapper} { box-shadow: none; border: 1px solid #000; }
                    ${Table} { width: 100%; border-collapse: collapse; }
                    ${Th}, ${Td} { border: 1px solid #000; padding: 8px; font-size: 10px; }
                    ${Th} { background: #f0f0f0 !important; color: black !important; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export default AdvanceRegistration;
