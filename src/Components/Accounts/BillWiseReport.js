import React, { useState, useEffect } from "react";
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

const ItemsList = styled.div`
    background: #f8fafc;
    padding: 10px;
    border-radius: 8px;
    margin-top: 5px;
    font-size: 0.75rem;
    border: 1px solid #e2e8f0;
`;

const BillWiseReport = () => {
    const [fromDate, setFromDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [billType, setBillType] = useState("All");
    const [uhid, setUhid] = useState("");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_code = localStorage.getItem("hospital_code") || "SH001";
    const branch_code = localStorage.getItem("selected_branch") || "SHB001";
    const user_id = localStorage.getItem("employeeId");

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const payload = {
                from_date: fromDate,
                to_date: toDate,
                bill_type: billType,
                uhid: uhid,
                "auth-hospital-code": hospital_code,
                "auth-branch-code": branch_code,
                "auth-user-id": user_id
            };

            const response = await apiRequest(`${HmsBaseUrl}bill_wise_report/`, "POST", payload);
            if (response.success && response.data.success) {
                setReportData(response.data.data);
                setSummary(response.data.summary);
            } else {
                toast.error(response?.data?.message || "Failed to fetch report");
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

    const toggleRow = (index) => {
        if (expandedRow === index) {
            setExpandedRow(null);
        } else {
            setExpandedRow(index);
        }
    };

    return (
        <PageWrapper>
            <SectionTitle>
                <h3>Bill Wise Accounts Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Range: {format(new Date(fromDate), "dd MMM yyyy")} to {format(new Date(toDate), "dd MMM yyyy")}
                </p>
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
                        <Label>Bill Type</Label>
                        <Select
                            value={billType}
                            onChange={(e) => setBillType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Registration">Registration</option>
                            <option value="Investigation">Investigation</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Discharge">Discharge</option>
                            <option value="Sales Return">Sales Return</option>
                        </Select>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>UHID</Label>
                        <Input
                            type="text"
                            placeholder="Search UHID"
                            value={uhid}
                            onChange={(e) => setUhid(e.target.value)}
                        />
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "35px", minWidth: "100px" }}>
                            {loading ? "..." : "Filter"}
                        </Button>
                        <Button onClick={handlePrint} secondary style={{ height: "35px" }}>
                            Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                    <SummaryCard color={colors.success}>
                        <SummaryLabel>Total Collection</SummaryLabel>
                        <SummaryValue>₹{summary.total_collection.toLocaleString()}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.danger}>
                        <SummaryLabel>Total Return</SummaryLabel>
                        <SummaryValue>₹{summary.total_return.toLocaleString()}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Net Collection</SummaryLabel>
                        <SummaryValue>₹{summary.net_collection.toLocaleString()}</SummaryValue>
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
                            <Th>Type</Th>
                            <Th>Bill Info</Th>
                            <Th>Patient</Th>
                            <Th style={{ textAlign: "right" }}>Amount</Th>
                            <Th>Mode</Th>
                            <Th>Cashier</Th>
                            <Th style={{ textAlign: "center" }}>Action</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((b, i) => (
                                <React.Fragment key={i}>
                                    <Tr onClick={() => toggleRow(i)} style={{ cursor: "pointer" }}>
                                        <Td>
                                            <span style={{
                                                fontSize: "0.65rem",
                                                fontWeight: "700",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                backgroundColor: 
                                                    b.type === 'Pharmacy' ? "#dcfce7" : 
                                                    b.type === 'Investigation' ? "#dbeafe" : 
                                                    b.type === 'Sales Return' ? "#fee2e2" : "#fef3c7",
                                                color: 
                                                    b.type === 'Pharmacy' ? "#166534" : 
                                                    b.type === 'Investigation' ? "#1e40af" : 
                                                    b.type === 'Sales Return' ? "#b91c1c" : "#92400e",
                                                textTransform: "uppercase"
                                            }}>
                                                {b.type}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: "600" }}>{b.bill_no}</div>
                                            <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>
                                                {format(new Date(b.bill_date), "dd MMM yyyy, HH:mm")}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: "600" }}>{b.patient_name}</div>
                                            <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>{b.uhid}</div>
                                        </Td>
                                        <Td style={{ textAlign: "right", fontWeight: "700", color: b.display_amount < 0 ? colors.danger : colors.success }}>
                                            ₹{b.net_amount.toFixed(2)}
                                        </Td>
                                        <Td>
                                            <div style={{ fontSize: "0.7rem", fontWeight: "600" }}>{b.payment_mode}</div>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: "500", fontSize: "0.8rem" }}>{b.cashier_name}</div>
                                        </Td>
                                        <Td style={{ textAlign: "center" }}>
                                            <span style={{ color: colors.primary, fontSize: "0.75rem", fontWeight: "600" }}>
                                                {expandedRow === i ? "Hide Items" : "View Items"}
                                            </span>
                                        </Td>
                                    </Tr>
                                    {expandedRow === i && (
                                        <Tr>
                                            <Td colSpan="7">
                                                <ItemsList>
                                                    <strong>Bill Items:</strong>
                                                    {Array.isArray(b.items) && b.items.length > 0 ? (
                                                        <ul style={{ margin: "5px 0", paddingLeft: "15px" }}>
                                                            {b.items.map((item, idx) => (
                                                                <li key={idx}>
                                                                    {item.item_name || item.itemName || "Item"} | 
                                                                    Qty: {item.qty || item.quantity || item.return_qty || 1} | 
                                                                    Price: ₹{(item.price || item.rate || 0).toFixed(2)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p style={{ margin: "5px 0", color: colors.textMuted }}>No items detailed.</p>
                                                    )}
                                                </ItemsList>
                                            </Td>
                                        </Tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
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

export default BillWiseReport;
