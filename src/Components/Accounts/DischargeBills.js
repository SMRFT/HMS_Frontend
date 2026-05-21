import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaEye, FaPrint, FaSearch } from "react-icons/fa";
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

const DischargeBills = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [billType, setBillType] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchReport();
        }
    }, [fromDate, toDate, billType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}discharge-bills-report/?from_date=${fromDate}&to_date=${toDate}&status=Billed`, "GET");
            if (response.success && response.data && Array.isArray(response.data.data)) {
                let filteredData = response.data.data;
                if (billType !== "all") {
                    filteredData = response.data.data.filter(b => b.payment_mode?.toLowerCase() === billType.toLowerCase());
                }
                setReportData(filteredData);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.net_amount || 0), 0);

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Discharge Bills Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    View and print discharge bills summary
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
                        <Label>Bill Type</Label>
                        <Select
                            value={billType}
                            onChange={(e) => setBillType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit">Credit</option>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Total Patients</SummaryLabel>
                    <SummaryValue>{reportData.length}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <SummaryLabel>Grand Total</SummaryLabel>
                    <SummaryValue>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper>
                <Table id="discharge-bills-table">
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Patient Name</Th>
                            <Th>IP.No</Th>
                            <Th>Room</Th>
                            <Th>Admission Date</Th>
                            <Th>Discharge Date</Th>
                            <Th>Bill ID</Th>
                            <Th>Bill No</Th>
                            <Th style={{ textAlign: "right" }}>Total</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((bill, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "600" }}>{bill.patient_details?.patient_name || "N/A"}</Td>
                                    <Td>{bill.ip_number}</Td>
                                    <Td>{bill.patient_details?.room_no || "N/A"}</Td>
                                    <Td>{bill.patient_details?.admission_date ? format(new Date(bill.patient_details.admission_date), "dd/MM/yyyy") : "N/A"}</Td>
                                    <Td>{bill.bill_date ? format(new Date(bill.bill_date), "dd/MM/yyyy") : "N/A"}</Td>
                                    <Td>{bill.discharge_id}</Td>
                                    <Td>{bill.bill_no}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(bill.net_amount || 0).toFixed(2)}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="9" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No records found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="7" style={{ textAlign: "right" }}>Total Patients: {reportData.length}</Td>
                                <Td style={{ textAlign: "right" }}>Grand Total:</Td>
                                <Td style={{ textAlign: "right", color: colors.primary }}>₹{grandTotal.toFixed(2)}</Td>
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
                    ${Th}, ${Td} { border: 1px solid #000; padding: 6px; font-size: 10px; }
                    ${Th} { background: #f0f0f0 !important; color: black !important; }
                    h3 { margin-bottom: 5px; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

export default DischargeBills;
