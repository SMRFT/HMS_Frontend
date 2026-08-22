import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Button, Select, Input, Space, message, Row, Col, Card, Checkbox
} from "antd";
import {
    FaSearch, FaShieldAlt, FaCheck, FaSync, FaPrint, FaSave, FaUserMd, FaEdit
} from "react-icons/fa";
import styled from "styled-components";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import apiRequest from "../../Auth/apiRequest";
import {
    PageWrapper, Container, SectionTitle, colors, fadeIn
} from "../GlobalStyles";

const { Option } = Select;

// Styled Components
const FilterSection = styled.div`
    background: #fff;
    padding: 16px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    margin-bottom: 20px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const FormLabel = styled.label`
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: ${colors.textMain};
    font-size: 0.85rem;
`;

const ActionButton = styled(Button)`
    border-radius: 6px;
    font-weight: 600;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const StatusBadge = styled.span`
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${props =>
        props.$status === "Approved" ? "#dcfce7" :
            props.$status === "Requested" ? "#dbeafe" : "#fef3c7"};
    color: ${props =>
        props.$status === "Approved" ? "#15803d" :
            props.$status === "Requested" ? "#1d4ed8" : "#b45309"};
    border: 1px solid ${props =>
        props.$status === "Approved" ? "#86efac" :
            props.$status === "Requested" ? "#bfdbfe" : "#fde68a"};
`;

const DoctorBreakdownBox = styled.div`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
`;

const DoctorFeeCuts = () => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // State
    const [admittedPatients, setAdmittedPatients] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingIp, setSavingIp] = useState(null);
    const [approvingIp, setApprovingIp] = useState(null);

    // Filters
    const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [filterCustomerType, setFilterCustomerType] = useState("ALL");
    const [filterCompany, setFilterCompany] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Providers Master
    const fetchProviders = useCallback(async () => {
        try {
            const provRes = await apiRequest(`${HmsBaseUrl}insurance-providers/`, "GET");
            if (provRes.success) {
                setProviders(provRes.data.data || provRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching insurance providers:", error);
        }
    }, [HmsBaseUrl]);

    // Fetch Admitted Patients (is_admitted = True)
    const fetchAdmittedPatients = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}doctor-fee-admitted-patients/?from_date=${fromDate}&to_date=${toDate}&customer_type=${encodeURIComponent(filterCustomerType)}&company=${encodeURIComponent(filterCompany)}&status=${encodeURIComponent(filterStatus)}&search=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest(url, "GET");
            let rawData = [];
            if (res.success && Array.isArray(res.data)) {
                rawData = res.data;
            } else if (res.success && Array.isArray(res.data?.data)) {
                rawData = res.data.data;
            }

            // Map row defaults (e.g., same_as_requested checkbox state)
            const mapped = rawData.map(p => {
                const req = parseFloat(p.doctor_fee_requested || 0);
                const app = parseFloat(p.doctor_fee_approved || 0);
                const same = app === req && req > 0;
                return { ...p, same_as_requested: same };
            });
            setAdmittedPatients(mapped);
        } catch (error) {
            message.error("Failed to fetch admitted patients");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [HmsBaseUrl, fromDate, toDate, filterCustomerType, filterCompany, filterStatus, searchQuery]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        fetchAdmittedPatients();
    }, [fetchAdmittedPatients]);

    // Update global row input state
    const handleAmountChange = (ipNumber, field, value) => {
        const numVal = value === "" ? "" : parseFloat(value) || 0;
        setAdmittedPatients(prev =>
            prev.map(p => {
                if (p.ipNumber === ipNumber) {
                    const updated = { ...p, [field]: numVal };
                    if (field === "doctor_fee_requested" && p.same_as_requested) {
                        updated.doctor_fee_approved = numVal;
                    }
                    return updated;
                }
                return p;
            })
        );
    };

    // Update per-doctor input state
    const handleDoctorAmountChange = (ipNumber, doctorId, role, field, value) => {
        const numVal = value === "" ? "" : parseFloat(value) || 0;
        setAdmittedPatients(prev =>
            prev.map(p => {
                if (p.ipNumber === ipNumber) {
                    const breakdown = (p.doctor_breakdown && p.doctor_breakdown.length > 0) ? p.doctor_breakdown : [];
                    const updatedBreakdown = breakdown.map(doc => {
                        if (doc.doctor_id === doctorId && doc.role === role) {
                            const updatedDoc = { ...doc, [field]: numVal };
                            if (field === "requested_amount" && p.same_as_requested) {
                                updatedDoc.approved_amount = numVal;
                            }
                            return updatedDoc;
                        }
                        return doc;
                    });

                    const sumReq = updatedBreakdown.reduce((sum, d) => sum + (parseFloat(d.requested_amount || 0)), 0);
                    const sumApp = updatedBreakdown.reduce((sum, d) => sum + (parseFloat(d.approved_amount || 0)), 0);

                    return {
                        ...p,
                        doctor_breakdown: updatedBreakdown,
                        doctor_fee_requested: sumReq,
                        doctor_fee_approved: sumApp
                    };
                }
                return p;
            })
        );
    };

    // Toggle Same as Requested Checkbox
    const handleSameAsRequestedToggle = (ipNumber, checked) => {
        setAdmittedPatients(prev =>
            prev.map(p => {
                if (p.ipNumber === ipNumber) {
                    const breakdown = p.doctor_breakdown || [];
                    const updatedBreakdown = breakdown.map(doc => ({
                        ...doc,
                        approved_amount: checked ? doc.requested_amount : doc.approved_amount
                    }));
                    const sumApp = updatedBreakdown.reduce((sum, d) => sum + (parseFloat(d.approved_amount || 0)), 0);

                    return {
                        ...p,
                        same_as_requested: checked,
                        doctor_breakdown: updatedBreakdown,
                        doctor_fee_approved: checked ? p.doctor_fee_requested : sumApp
                    };
                }
                return p;
            })
        );
    };

    // Save Requested Doctor Fee
    const handleSaveRequested = async (record) => {
        setSavingIp(record.ipNumber);
        try {
            const payload = {
                ipNumber: record.ipNumber,
                uhid: record.uhid,
                doctor_breakdown: record.doctor_breakdown || [],
                doctor_fee_requested: parseFloat(record.doctor_fee_requested || 0),
                doctor_fee_approved: parseFloat(record.doctor_fee_approved || 0),
                company_code: record.company_code || "",
                company_name: record.company_name || "",
                customer_type: record.customer_type || "",
                hospital_code: localStorage.getItem("hospital_code") || localStorage.getItem("hospitalCode") || "SH001",
                branch_code: localStorage.getItem("branch_code") || localStorage.getItem("branchCode") || "SHB001",
                "auth-user-id": localStorage.getItem("employee_id") || localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "system",
                action: "save_requested",
                status: "Requested"
            };

            const url = `${HmsBaseUrl}doctor-fee-cuts/approve-doctor-fee/`;
            const res = await apiRequest(url, "POST", payload);

            if (res.success) {
                Swal.fire({
                    icon: "success",
                    title: "Requested Amount Saved!",
                    text: `Requested doctor fee stored for management approval.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                setAdmittedPatients(prev =>
                    prev.map(p => p.ipNumber === record.ipNumber ? { ...p, status: "Requested" } : p)
                );
            } else {
                Swal.fire("Error", res.error || "Failed to save requested amount", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server error while saving requested doctor fee", "error");
            console.error(error);
        } finally {
            setSavingIp(null);
        }
    };

    // Approve Doctor Fee Cut
    const handleApprove = async (record) => {
        // Validation: Ensure approved amounts are entered and > 0 for each doctor
        const breakdown = record.doctor_breakdown || [];
        let invalidApproved = false;

        if (breakdown.length > 0) {
            for (const doc of breakdown) {
                const val = parseFloat(doc.approved_amount);
                if (doc.approved_amount === undefined || doc.approved_amount === null || doc.approved_amount === "" || isNaN(val) || val <= 0) {
                    invalidApproved = true;
                    break;
                }
            }
        } else {
            const val = parseFloat(record.doctor_fee_approved);
            if (record.doctor_fee_approved === undefined || record.doctor_fee_approved === null || record.doctor_fee_approved === "" || isNaN(val) || val <= 0) {
                invalidApproved = true;
            }
        }

        if (invalidApproved) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Approved Amount",
                text: "Approved amount must be greater than 0 for each doctor. Please enter approved amounts or check 'Sanction Same as Requested' before approving.",
                confirmButtonColor: "#0284c7"
            });
            return;
        }

        setApprovingIp(record.ipNumber);
        try {
            const payload = {
                ipNumber: record.ipNumber,
                uhid: record.uhid,
                doctor_breakdown: record.doctor_breakdown || [],
                doctor_fee_requested: parseFloat(record.doctor_fee_requested || 0),
                doctor_fee_approved: parseFloat(record.doctor_fee_approved || 0),
                company_code: record.company_code || "",
                company_name: record.company_name || "",
                customer_type: record.customer_type || "",
                hospital_code: localStorage.getItem("hospital_code") || localStorage.getItem("hospitalCode") || "SH001",
                branch_code: localStorage.getItem("branch_code") || localStorage.getItem("branchCode") || "SHB001",
                "auth-user-id": localStorage.getItem("employee_id") || localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "system",
                action: "approve",
                status: "Approved"
            };

            const url = `${HmsBaseUrl}doctor-fee-cuts/approve-doctor-fee/`;
            const res = await apiRequest(url, "POST", payload);

            if (res.success) {
                Swal.fire({
                    icon: "success",
                    title: "Fee Approved!",
                    text: `Doctor Fee Cut for IP ${record.ipNumber} approved successfully with ₹${parseFloat(record.doctor_fee_approved || 0).toFixed(2)}.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                setAdmittedPatients(prev =>
                    prev.map(p => p.ipNumber === record.ipNumber ? { ...p, status: "Approved" } : p)
                );
            } else {
                Swal.fire("Error", res.error || "Failed to approve fee cut", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server error while approving doctor fee cut", "error");
            console.error(error);
        } finally {
            setApprovingIp(null);
        }
    };

    const handlePrint = (record) => {
        const printWindow = window.open('', '_blank');

        const doctorsHtml = (record.doctor_breakdown && record.doctor_breakdown.length > 0)
            ? `
                <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:13px;">
                    <thead>
                        <tr style="background:#f1f5f9; text-align:left;">
                            <th style="padding:6px; border:1px solid #cbd5e1;">Doctor Name</th>
                            <th style="padding:6px; border:1px solid #cbd5e1;">Role</th>
                            <th style="padding:6px; border:1px solid #cbd5e1; text-align:right;">Billed Fee</th>
                            <th style="padding:6px; border:1px solid #cbd5e1; text-align:right;">Requested Fee</th>
                            <th style="padding:6px; border:1px solid #cbd5e1; text-align:right;">Approved Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${record.doctor_breakdown.map(d => `
                            <tr>
                                <td style="padding:6px; border:1px solid #e2e8f0; font-weight:600;">${d.doctor_name}</td>
                                <td style="padding:6px; border:1px solid #e2e8f0;">${d.role}</td>
                                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right;">₹${parseFloat(d.doctor_fee || 0).toFixed(2)}</td>
                                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right;">₹${parseFloat(d.requested_amount || 0).toFixed(2)}</td>
                                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right; font-weight:700; color:#166534;">₹${parseFloat(d.approved_amount || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
            : '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Doctor Fee Cuts Summary - ${record.ipNumber}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #0d9488; margin-bottom: 30px; padding-bottom: 10px; }
                        .row { display: flex; margin-bottom: 12px; font-size: 14px; }
                        .label { width: 220px; font-weight: bold; color: #475569; }
                        .value { flex: 1; font-weight: 600; }
                        .section-title { background: #f1f5f9; padding: 8px 12px; font-weight: bold; margin: 25px 0 15px 0; border-left: 4px solid #0d9488; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>SHANMUGA HOSPITAL</h2>
                        <p style="margin:0;">DOCTOR FEE CUTS SUMMARY</p>
                    </div>
                    
                    <div class="section-title">PATIENT & ADMISSION DETAILS</div>
                    <div class="row"><div class="label">Patient Name:</div><div class="value">${record.patient_name || '-'}</div></div>
                    <div class="row"><div class="label">UHID:</div><div class="value">${record.uhid || '-'}</div></div>
                    <div class="row"><div class="label">IP Number:</div><div class="value">${record.ipNumber}</div></div>
                    <div class="row"><div class="label">Customer Type:</div><div class="value">${record.customer_type || '-'}</div></div>
                    <div class="row"><div class="label">Insurance Company:</div><div class="value">${record.company_name || '-'} (Code: ${record.company_code || 'N/A'})</div></div>
                    
                    <div class="section-title">BILLING & EXPENSE DETAILS</div>
                    <div class="row"><div class="label">Total Amount:</div><div class="value">₹${parseFloat(record.total_amount || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Discount Amount:</div><div class="value">₹${parseFloat(record.discount_amount || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Medicines Expense:</div><div class="value" style="color:#6d28d9;">₹${parseFloat(record.medicines_amount || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Implant Expense:</div><div class="value" style="color:#b45309;">₹${parseFloat(record.implant_amount || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Net Amount:</div><div class="value" style="color:#1d4ed8;">₹${parseFloat(record.net_amount || 0).toFixed(2)}</div></div>
                    
                    <div class="section-title">DOCTORS FEE BREAKDOWN</div>
                    ${doctorsHtml || '<div class="row"><div class="value">No individual doctor fee breakdown recorded</div></div>'}

                    <div class="section-title">MANAGEMENT APPROVAL SUMMARY</div>
                    <div class="row"><div class="label">Total Doctor Fee Requested:</div><div class="value">₹${parseFloat(record.doctor_fee_requested || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Total Doctor Fee Approved:</div><div class="value" style="color:#166534;">₹${parseFloat(record.doctor_fee_approved || 0).toFixed(2)}</div></div>
                    <div class="row"><div class="label">Status:</div><div class="value">${record.status || 'Pending'}</div></div>
                    
                    <div style="margin-top: 80px; display: flex; justify-content: space-between;">
                        <div>Prepared By</div>
                        <div>Authorized Signatory</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Permission checks for HMS-P-DFCA (Approve) and HMS-P-DFCE (Edit)
    const allowedActions = JSON.parse(
        localStorage.getItem("allowedActions") || "[]"
    );
    const canApprove = allowedActions.includes("HMS-P-DFCA") ||
        allowedActions.includes("HMS-P-DFCA-RW") ||
        allowedActions.includes("HMS-P-DFCA-R") ||
        allowedActions.some(a => typeof a === 'string' && a.startsWith("HMS-P-DFCA"));

    const canEdit = allowedActions.includes("HMS-P-DFCE") ||
        allowedActions.includes("HMS-P-DFCE-RW") ||
        allowedActions.includes("HMS-P-DFCE-R") ||
        allowedActions.some(a => typeof a === 'string' && a.startsWith("HMS-P-DFCE"));

    const columns = [
        {
            title: "Patient Details",
            key: "patient",
            width: 190,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 700, color: colors.primary, fontSize: '0.92rem' }}>
                        {record.patient_name || "N/A"}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                        UHID: <strong>{record.uhid}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.textMain }}>
                        IP No: <strong>{record.ipNumber}</strong>
                    </div>
                    {record.company_name ? (
                        <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600, marginTop: 2 }}>
                            🏢 {record.company_name}
                        </div>
                    ) : record.customer_type ? (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            {record.customer_type}
                        </div>
                    ) : null}
                    {(record.bill_date || record.admission_date) && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                            Date: {dayjs(record.bill_date || record.admission_date).format('DD/MM/YYYY')}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: "Billing & Expense Details",
            key: "billing_expenses",
            width: 270,
            render: (text, record) => {
                const totalBilledDoctorFee = (record.discharge_doctor_fees || []).reduce((sum, d) => sum + (parseFloat(d.doctor_fee) || 0), 0);
                return (
                    <div style={{ fontSize: '0.82rem', background: '#fafafa', padding: '8px 10px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ color: colors.textMuted }}>Total Bill:</span>
                            <span style={{ fontWeight: 600, textAlign: 'right' }}>₹{parseFloat(record.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ color: colors.textMuted }}>Discount:</span>
                            <span style={{ fontWeight: 600, color: '#dc2626', textAlign: 'right' }}>₹{parseFloat(record.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, background: '#f5f3ff', padding: '2px 6px', borderRadius: 4 }}>
                            <span style={{ color: '#6d28d9', fontWeight: 600 }}>💊 Medicines:</span>
                            <span style={{ fontWeight: 700, color: '#6d28d9', textAlign: 'right' }}>₹{parseFloat(record.medicines_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, background: '#fffbeb', padding: '2px 6px', borderRadius: 4 }}>
                            <span style={{ color: '#b45309', fontWeight: 600 }}>⚙️ Implants:</span>
                            <span style={{ fontWeight: 700, color: '#b45309', textAlign: 'right' }}>₹{parseFloat(record.implant_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTop: '1px dashed #cbd5e1' }}>
                            <span style={{ fontWeight: 700, color: colors.textMain }}>Net Bill:</span>
                            <span style={{ fontWeight: 700, color: '#2563eb', textAlign: 'right' }}>₹{parseFloat(record.net_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        {record.discharge_doctor_fees && record.discharge_doctor_fees.length > 0 && (
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f766e', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span><FaUserMd color="#0f766e" /> Billed Doctor Fees:</span>
                                    <strong style={{ color: '#0f766e', fontSize: '0.76rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Total: ₹{totalBilledDoctorFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                </div>
                                {record.discharge_doctor_fees.map((doc, idx) => (
                                    <div key={idx} style={{ fontSize: '0.73rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3, gap: 8 }}>
                                        <span style={{ flex: 1, paddingRight: 4 }}>{doc.doctor_name} <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>({doc.role})</span></span>
                                        <strong style={{ color: '#0f766e', textAlign: 'right', whiteSpace: 'nowrap' }}>₹{parseFloat(doc.doctor_fee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: "Doctor Fee Requested (₹)",
            key: "doctor_fee_requested",
            width: 320,
            render: (text, record) => (
                <div>
                    {record.doctor_breakdown && record.doctor_breakdown.length > 0 ? (
                        <DoctorBreakdownBox style={{ borderColor: '#bae6fd', background: '#f0f9ff' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FaUserMd color="#0284c7" /> Per-Doctor Requested Fees:
                            </div>
                            {record.doctor_breakdown.map((doc, idx) => (
                                <div key={idx} style={{ marginBottom: 6, background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #bae6fd' }}>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span>{doc.doctor_name} <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({doc.role})</span></span>
                                        <span style={{ color: '#0284c7', fontSize: '0.7rem', fontWeight: 700 }}>Bill: ₹{parseFloat(doc.doctor_fee || 0).toFixed(0)}</span>
                                    </div>
                                    <Input
                                        type="number"
                                        prefix={<span style={{ color: '#0284c7', fontWeight: 700 }}>₹</span>}
                                        min={0}
                                        placeholder="0.00"
                                        disabled={!canEdit || record.status === "Approved"}
                                        value={doc.requested_amount !== undefined ? doc.requested_amount : ""}
                                        onChange={e => handleDoctorAmountChange(record.ipNumber, doc.doctor_id, doc.role, "requested_amount", e.target.value)}
                                        style={{
                                            borderRadius: 4,
                                            height: 32,
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: '#0284c7',
                                            WebkitTextFillColor: '#0284c7',
                                            opacity: 1,
                                            background: '#f0f9ff',
                                            borderColor: '#93c5fd'
                                        }}
                                    />
                                </div>
                            ))}
                        </DoctorBreakdownBox>
                    ) : (
                        <Input
                            type="number"
                            prefix={<span style={{ color: '#0284c7', fontWeight: 700 }}>₹</span>}
                            min={0}
                            placeholder="0.00"
                            disabled={!canEdit || record.status === "Approved"}
                            value={record.doctor_fee_requested !== undefined ? record.doctor_fee_requested : ""}
                            onChange={e => handleAmountChange(record.ipNumber, "doctor_fee_requested", e.target.value)}
                            style={{
                                borderRadius: 6,
                                fontWeight: 700,
                                marginBottom: 6,
                                color: '#0284c7',
                                WebkitTextFillColor: '#0284c7',
                                opacity: 1,
                                background: '#f0f9ff',
                                borderColor: '#93c5fd'
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                            Total Req: ₹{parseFloat(record.doctor_fee_requested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {canEdit && (
                            record.status === "Approved" ? (
                                <Button
                                    disabled
                                    icon={<FaEdit />}
                                    style={{
                                        borderRadius: 6,
                                        background: '#e2e8f0',
                                        borderColor: '#cbd5e1',
                                        color: '#94a3b8',
                                        fontWeight: 600,
                                        height: 32
                                    }}
                                >
                                    Edit
                                </Button>
                            ) : record.status === "Requested" ? (
                                <Button
                                    icon={<FaEdit />}
                                    loading={savingIp === record.ipNumber}
                                    onClick={() => handleSaveRequested(record)}
                                    style={{
                                        borderRadius: 6,
                                        background: '#d97706',
                                        borderColor: '#d97706',
                                        color: '#fff',
                                        fontWeight: 600,
                                        height: 32
                                    }}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <Button
                                    icon={<FaSave />}
                                    loading={savingIp === record.ipNumber}
                                    onClick={() => handleSaveRequested(record)}
                                    style={{
                                        borderRadius: 6,
                                        background: '#0284c7',
                                        borderColor: '#0284c7',
                                        color: '#fff',
                                        fontWeight: 600,
                                        height: 32
                                    }}
                                >
                                    Save
                                </Button>
                            )
                        )}
                    </div>
                </div>
            )
        },
        ...(canApprove ? [{
            title: "Doctor Fee Approved (₹)",
            key: "doctor_fee_approved",
            width: 320,
            render: (text, record) => (
                <div>
                    <div style={{ marginBottom: 6 }}>
                        <Checkbox
                            checked={record.same_as_requested}
                            onChange={e => handleSameAsRequestedToggle(record.ipNumber, e.target.checked)}
                            style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d' }}
                        >
                            Sanction Same as Requested
                        </Checkbox>
                    </div>

                    {record.doctor_breakdown && record.doctor_breakdown.length > 0 ? (
                        <DoctorBreakdownBox style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FaUserMd color="#15803d" /> Per-Doctor Approved Fees:
                            </div>
                            {record.doctor_breakdown.map((doc, idx) => (
                                <div key={idx} style={{ marginBottom: 6, background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span>{doc.doctor_name} <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({doc.role})</span></span>
                                        <span style={{ color: '#0284c7', fontSize: '0.7rem', fontWeight: 700 }}>Req: ₹{parseFloat(doc.requested_amount || 0).toFixed(0)}</span>
                                    </div>
                                    <Input
                                        type="number"
                                        prefix={<span style={{ color: '#15803d', fontWeight: 700 }}>₹</span>}
                                        min={0}
                                        placeholder="0.00"
                                        disabled={record.same_as_requested}
                                        value={doc.approved_amount !== undefined ? doc.approved_amount : ""}
                                        onChange={e => handleDoctorAmountChange(record.ipNumber, doc.doctor_id, doc.role, "approved_amount", e.target.value)}
                                        style={{
                                            borderRadius: 4,
                                            height: 32,
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: '#15803d',
                                            WebkitTextFillColor: '#15803d',
                                            opacity: 1,
                                            background: '#f0fdf4',
                                            borderColor: '#86efac'
                                        }}
                                    />
                                </div>
                            ))}
                        </DoctorBreakdownBox>
                    ) : (
                        <Input
                            type="number"
                            prefix={<span style={{ color: '#15803d', fontWeight: 700 }}>₹</span>}
                            min={0}
                            placeholder="0.00"
                            disabled={record.same_as_requested}
                            value={record.doctor_fee_approved !== undefined ? record.doctor_fee_approved : ""}
                            onChange={e => handleAmountChange(record.ipNumber, "doctor_fee_approved", e.target.value)}
                            style={{
                                borderRadius: 6,
                                fontWeight: 700,
                                color: '#15803d',
                                WebkitTextFillColor: '#15803d',
                                opacity: 1,
                                background: '#f0fdf4',
                                borderColor: '#86efac'
                            }}
                        />
                    )}

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', marginTop: 4 }}>
                        Total Approved: ₹{parseFloat(record.doctor_fee_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            )
        }] : []),
        {
            title: "Status",
            key: "status",
            align: 'center',
            width: 110,
            render: (text, record) => (
                <StatusBadge $status={record.status}>
                    {record.status || "Pending"}
                </StatusBadge>
            )
        },
        {
            title: "Action",
            key: "action",
            align: 'center',
            width: 160,
            render: (text, record) => (
                <Space>
                    {canApprove && (
                        <Button
                            type="primary"
                            icon={<FaCheck />}
                            loading={approvingIp === record.ipNumber}
                            onClick={() => handleApprove(record)}
                            style={{
                                background: record.status === "Approved" ? '#16a34a' : colors.primary,
                                borderColor: record.status === "Approved" ? '#16a34a' : colors.primary,
                                borderRadius: 6,
                                fontWeight: 600
                            }}
                        >
                            {record.status === "Approved" ? "Approved" : "Approve"}
                        </Button>
                    )}
                    <Button
                        icon={<FaPrint />}
                        onClick={() => handlePrint(record)}
                        style={{ borderRadius: 6, color: '#64748b' }}
                        title="Print Summary"
                    />
                </Space>
            )
        }
    ];

    return (
        <PageWrapper>
            <Container>
                <SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaShieldAlt size={26} color={colors.primary} />
                        <div>
                            <h3 style={{ margin: 0 }}>Doctor Fee Cuts Management</h3>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: colors.textMuted }}>
                                Fix & Approve Admitted Patients Doctor Fee Cuts
                            </p>
                        </div>
                    </div>
                </SectionTitle>

                {/* Top Filter Section */}
                <FilterSection className="no-print">
                    <Row gutter={[12, 12]} align="bottom">
                        <Col xs={24} sm={12} md={3}>
                            <FormLabel>From Date</FormLabel>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                style={{ height: 38, borderRadius: 6 }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={3}>
                            <FormLabel>To Date</FormLabel>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                style={{ height: 38, borderRadius: 6 }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={filterCustomerType === "Insurance" ? 3 : 4}>
                            <FormLabel>Customer Type</FormLabel>
                            <Select
                                style={{ width: '100%', height: 38 }}
                                value={filterCustomerType}
                                onChange={(val) => {
                                    setFilterCustomerType(val);
                                    if (val !== "Insurance") {
                                        setFilterCompany("ALL");
                                    }
                                }}
                            >
                                <Option value="ALL">ALL TYPES</Option>
                                <Option value="General">General</Option>
                                <Option value="Insurance">Insurance</Option>
                                <Option value="Corporate">Corporate</Option>
                            </Select>
                        </Col>
                        {filterCustomerType === "Insurance" && (
                            <Col xs={24} sm={12} md={4}>
                                <FormLabel>Insurance Company</FormLabel>
                                <Select
                                    style={{ width: '100%', height: 38 }}
                                    value={filterCompany}
                                    onChange={setFilterCompany}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    <Option value="ALL">ALL COMPANIES</Option>
                                    {providers.map(p => (
                                        <Option key={p.company_code || p.id} value={p.company_name}>
                                            {p.company_name} ({p.company_code})
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        )}
                        <Col xs={24} sm={12} md={filterCustomerType === "Insurance" ? 3 : 4}>
                            <FormLabel>Status</FormLabel>
                            <Select
                                style={{ width: '100%', height: 38 }}
                                value={filterStatus}
                                onChange={setFilterStatus}
                            >
                                <Option value="ALL">ALL STATUSES</Option>
                                <Option value="Pending">Pending</Option>
                                <Option value="Requested">Requested</Option>
                                <Option value="Approved">Approved</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={16} md={filterCustomerType === "Insurance" ? 5 : 6}>
                            <FormLabel>Search Patient</FormLabel>
                            <Input
                                placeholder="Search by IP Number, UHID, Name…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onPressEnter={fetchAdmittedPatients}
                                prefix={<FaSearch style={{ color: '#94a3b8' }} />}
                                allowClear
                                style={{ height: 38, borderRadius: 6 }}
                            />
                        </Col>
                        <Col xs={24} sm={8} md={filterCustomerType === "Insurance" ? 3 : 3} style={{ textAlign: 'right' }}>
                            <ActionButton
                                type="primary"
                                icon={<FaSync />}
                                onClick={fetchAdmittedPatients}
                                loading={loading}
                                style={{ width: '100%', background: colors.primary }}
                            >
                                Refresh
                            </ActionButton>
                        </Col>
                    </Row>
                </FilterSection>

                {/* Admitted Patients Table */}
                <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: colors.textMain }}>
                            Admitted Patients List ({admittedPatients.length})
                        </span>
                    </div>
                    <Table
                        dataSource={admittedPatients}
                        columns={columns}
                        rowKey="ipNumber"
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 1550 }}
                    />
                </Card>
            </Container>
        </PageWrapper>
    );
};

export default DoctorFeeCuts;
