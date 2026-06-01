import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
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
    ButtonContainer
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

const PatientInfoBar = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid ${colors.border};
`;

const InfoGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const StatusBadge = styled.span`
    background: ${props => props.bg || "#f1f5f9"};
    color: ${props => props.color || colors.textMain};
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const IPAdvanceReport = ({ isModalView = false, startDate, endDate }) => {
    const [filterMode, setFilterMode] = useState("ip");
    const [ipNumber, setIpNumber] = useState("");
    const [uhid, setUhid] = useState("");
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'cancel', entry: {} }

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let query = "";
            if (filterMode === "ip" && ipNumber) query = `ip_number=${ipNumber}`;
            else if (filterMode === "uhid" && uhid) query = `uhid=${uhid}`;
            else if (filterMode === "date") query = `from_date=${fromDate}&to_date=${toDate}`;

            if (!query) {
                toast.warning("Please provide search criteria");
                setLoading(false);
                return;
            }

            const response = await apiRequest(`${HmsBaseUrl}admission-advance/?${query}`, "GET");
            if (response.success) {
                const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
                setData(list);
            } else {
                toast.error(response.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching IP advance:", error);
            toast.error("An error occurred while fetching data");
        } finally {
            setLoading(false);
            setSearched(true);
        }
    }, [filterMode, ipNumber, uhid, fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        // Auto-fetch if enough criteria is met
        if (filterMode === "date" && fromDate && toDate) {
            fetchData();
        } else if (filterMode === "ip" && ipNumber) {
            fetchData();
        } else if (filterMode === "uhid" && uhid) {
            fetchData();
        }
    }, [fromDate, toDate, filterMode, ipNumber, uhid]);

    const handleSuccess = () => {
        setModal(null);
        fetchData();
    };

    const handleCancel = async (entry) => {
        setLoading(true);
        try {
            const res = await apiRequest(`${HmsBaseUrl}admission-advance/${entry.ip_number}/`, "PATCH", {
                advance_id: entry.advance_id
            });
            if (res.success) {
                toast.success("Advance cancelled successfully");
                handleSuccess();
            } else {
                toast.error(res.message || "Cancellation failed");
            }
        } catch (error) {
            toast.error("Error cancelling advance");
        } finally {
            setLoading(false);
        }
    };

    const totals = (Array.isArray(data) ? data : []).reduce((acc, curr) => {
        if (curr.status !== 'Cancelled') {
            acc.total += (curr.advance_amount || 0);
            acc.ip += (curr.ip_advance || 0);
            acc.billing += (curr.billing_advance || 0);
        }
        return acc;
    }, { total: 0, ip: 0, billing: 0 });

    return (
        <PageWrapper>
            <SectionTitle>
                <h3>IP Advance Report</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Manage and track patient advances and deposits
                </p>
            </SectionTitle>

            <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }} className="no-print">
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                    {["ip", "uhid", "date"].map(mode => (
                        <Button 
                            key={mode} 
                            secondary={filterMode !== mode} 
                            onClick={() => setFilterMode(mode)}
                            style={{ fontSize: "0.75rem", padding: "4px 12px" }}
                        >
                            By {mode.toUpperCase()}
                        </Button>
                    ))}
                </div>

                <FormRow>
                    {filterMode === "ip" && (
                        <InputWrapper>
                            <Label>IP Number</Label>
                            <Input placeholder="Search IP Number" value={ipNumber} onChange={e => setIpNumber(e.target.value)} />
                        </InputWrapper>
                    )}
                    {filterMode === "uhid" && (
                        <InputWrapper>
                            <Label>UHID</Label>
                            <Input placeholder="Search UHID" value={uhid} onChange={e => setUhid(e.target.value)} />
                        </InputWrapper>
                    )}
                    {filterMode === "date" && (
                        <>
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
                        </>
                    )}
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                        <Button onClick={fetchData} disabled={loading} style={{ height: "35px", minWidth: "100px" }}>
                            {loading ? "..." : "Search"}
                        </Button>
                    </div>
                </FormRow>
            </div>

            {searched && data.length > 0 && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                        <SummaryCard color={colors.primary}>
                            <SummaryLabel>Total Advance</SummaryLabel>
                            <SummaryValue>₹{totals.total.toLocaleString("en-IN")}</SummaryValue>
                        </SummaryCard>
                        <SummaryCard color={colors.success}>
                            <SummaryLabel>IP Advance</SummaryLabel>
                            <SummaryValue>₹{totals.ip.toLocaleString("en-IN")}</SummaryValue>
                        </SummaryCard>
                        <SummaryCard color="#8b5cf6">
                            <SummaryLabel>Billing Advance</SummaryLabel>
                            <SummaryValue>₹{totals.billing.toLocaleString("en-IN")}</SummaryValue>
                        </SummaryCard>
                    </div>

                    <PatientInfoBar>
                        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                            <InfoGroup>
                                <SummaryLabel>Patient Name</SummaryLabel>
                                <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{data[0]?.patient_name || "N/A"}</div>
                            </InfoGroup>
                            <InfoGroup>
                                <SummaryLabel>UHID</SummaryLabel>
                                <div style={{ fontWeight: "600", color: colors.primary }}>{data[0]?.uhid || "N/A"}</div>
                            </InfoGroup>
                            <InfoGroup>
                                <SummaryLabel>IP Number</SummaryLabel>
                                <div style={{ fontWeight: "600", color: colors.primary }}>{data[0]?.ip_number || "N/A"}</div>
                            </InfoGroup>
                        </div>
                        {/* <Button onClick={() => setModal({ type: "create" })} style={{ height: "35px" }} success>
                            + New Advance
                        </Button> */}
                    </PatientInfoBar>

                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Bill No</Th>
                                    <Th>Type</Th>
                                    <Th style={{ textAlign: "right" }}>Total Amount</Th>
                                    <Th style={{ textAlign: "right" }}>IP Adv</Th>
                                    <Th style={{ textAlign: "right" }}>Bill Adv</Th>
                                    <Th>Mode</Th>
                                    <Th>Status</Th>
                                    {/* <Th style={{ textAlign: "center" }}>Actions</Th> */}
                                </Tr>
                            </thead>
                            <tbody>
                                {data.map((entry, idx) => (
                                    <Tr key={idx}>
                                        <Td>{format(new Date(entry.bill_date), "dd/MM/yyyy")}</Td>
                                        <Td style={{ fontWeight: "600" }}>{entry.bill_no}</Td>
                                        <Td>{entry.advance_id}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(entry.advance_amount || 0).toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right" }}>₹{(entry.ip_advance || 0).toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right" }}>₹{(entry.billing_advance || 0).toFixed(2)}</Td>
                                        <Td style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>{entry.payment_mode}</Td>
                                        <Td>
                                            <StatusBadge 
                                                bg={entry.status === 'Paid' ? "#dcfce7" : entry.status === 'Cancelled' ? "#fee2e2" : "#fef3c7"}
                                                color={entry.status === 'Paid' ? "#166534" : entry.status === 'Cancelled' ? "#b91c1c" : "#92400e"}
                                            >
                                                {entry.status}
                                            </StatusBadge>
                                        </Td>
                                        {/* <Td style={{ textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                {entry.status !== 'Cancelled' && (
                                                    <Button secondary style={{ padding: "2px 8px", fontSize: "0.7rem" }} onClick={() => setModal({ type: 'cancel', entry })}>Cancel</Button>
                                                )}
                                            </div> 
                                        </Td>*/}
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </>
            )}

            {/* MODALS */}
            {modal && (
                <ModalOverlay onClick={() => setModal(null)}>
                    <ModalContainer onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{modal.type === 'create' ? 'New Advance' : modal.type === 'cancel' ? 'Cancel Advance' : 'Edit Advance'}</ModalTitle>
                            <CloseButton onClick={() => setModal(null)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            {modal.type === 'create' && (
                                <AdvanceForm mode="create" ipNumber={data[0]?.ip_number || ipNumber} onCancel={() => setModal(null)} onSuccess={handleSuccess} />
                            )}
                            {modal.type === 'cancel' && (
                                <div style={{ padding: "10px" }}>
                                    <p>Are you sure you want to cancel advance <strong>{modal.entry.bill_no}</strong> for <strong>₹{modal.entry.advance_amount}</strong>?</p>
                                    <p style={{ color: colors.danger, fontSize: "0.85rem", marginTop: "10px" }}>* This action cannot be undone.</p>
                                    <ButtonContainer>
                                        <Button secondary onClick={() => setModal(null)}>Go Back</Button>
                                        <Button danger onClick={() => handleCancel(modal.entry)}>Yes, Cancel</Button>
                                    </ButtonContainer>
                                </div>
                            )}
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}

        </PageWrapper>
    );
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
const AdvanceForm = ({ mode, ipNumber, onCancel, onSuccess }) => {
    const [form, setForm] = useState({
        advance_amount: "",
        ip_advance: "",
        billing_advance: "",
        payment_method: "cash",
        date: format(new Date(), "yyyy-MM-dd")
    });
    const [loading, setLoading] = useState(false);
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const handleSubmit = async () => {
        if (!form.advance_amount) return toast.error("Advance amount is required");
        setLoading(true);
        try {
            const res = await apiRequest(`${HmsBaseUrl}admission-advance/${ipNumber}/`, "POST", {
                ...form,
                advance_amount: parseFloat(form.advance_amount),
                ip_advance: parseFloat(form.ip_advance || 0),
                billing_advance: parseFloat(form.billing_advance || 0)
            });
            if (res.success) {
                toast.success("Advance saved successfully");
                onSuccess();
            } else {
                toast.error(res.message || "Failed to save");
            }
        } catch (error) {
            toast.error("Error saving advance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "10px" }}>
            <FormRow>
                <InputWrapper>
                    <Label required>Total Advance Amount</Label>
                    <Input type="number" value={form.advance_amount} onChange={e => setForm((f) => ({ ...f, advance_amount: e.target.value }))} />
                </InputWrapper>
            </FormRow>
            <FormRow>
                <InputWrapper>
                    <Label>IP Advance Portion</Label>
                    <Input type="number" value={form.ip_advance} onChange={e => setForm((f) => ({ ...f, ip_advance: e.target.value }))} />
                </InputWrapper>
                <InputWrapper>
                    <Label>Billing Advance Portion</Label>
                    <Input type="number" value={form.billing_advance} onChange={e => setForm((f) => ({ ...f, billing_advance: e.target.value }))} />
                </InputWrapper>
            </FormRow>
            <FormRow>
                <InputWrapper>
                    <Label>Payment Mode</Label>
                    <Select value={form.payment_method} onChange={e => setForm((f) => ({ ...f, payment_method: e.target.value }))}>
                        <option value="cash">CASH</option>
                        <option value="upi">UPI</option>
                        <option value="card">CARD</option>
                        <option value="neft">NEFT</option>
                    </Select>
                </InputWrapper>
                <InputWrapper>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={e => setForm((f) => ({ ...f, date: e.target.value }))} />
                </InputWrapper>
            </FormRow>
            <ButtonContainer>
                <Button secondary onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save Advance"}</Button>
            </ButtonContainer>
        </div>
    );
};

export default IPAdvanceReport;