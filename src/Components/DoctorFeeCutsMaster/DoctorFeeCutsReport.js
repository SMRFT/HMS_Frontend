import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Button, Select, Input, Space, message, Row, Col, Card, Tag, DatePicker, Collapse
} from "antd";
import {
    FaSearch, FaShieldAlt, FaSync, FaPrint, FaUserMd, FaCalendarAlt, FaFileExcel, FaMedkit, FaEnvelope
} from "react-icons/fa";
import Swal from "sweetalert2";
import styled from "styled-components";
import dayjs from "dayjs";
import apiRequest from "../../Auth/apiRequest";
import {
    PageWrapper, Container, SectionTitle, colors, fadeIn
} from "../GlobalStyles";

const { Option } = Select;
const { Panel } = Collapse;

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
    font-size: 0.82rem;
    color: #475569;
`;

const StatCard = styled.div`
    background: #fff;
    border-radius: 10px;
    padding: 14px 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border-left: 4px solid ${props => props.$color || colors.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const DoctorCard = styled(Card)`
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
    .ant-card-head {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
    }
`;

const DoctorFeeCutsReport = () => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // Dates default: current date (today) for both fromDate and toDate, default status ALL
    const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedDoctor, setSelectedDoctor] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [loading, setLoading] = useState(false);

    // Report Data
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [doctorwiseReports, setDoctorwiseReports] = useState([]);
    const [grandTotals, setGrandTotals] = useState({
        total_billed: 0,
        total_requested: 0,
        total_approved: 0,
        total_patients: 0,
        total_doctors: 0
    });

    // Fetch Doctor Fee Cuts Report
    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}doctor-fee-cuts-report/?from_date=${fromDate}&to_date=${toDate}&doctor_id=${encodeURIComponent(selectedDoctor)}&status=${encodeURIComponent(selectedStatus)}`;
            const res = await apiRequest(url, "GET");

            let reportPayload = null;
            if (res && res.success && res.data) {
                if (res.data.available_doctors || res.data.doctorwise_reports) {
                    reportPayload = res.data;
                } else if (res.data.data && (res.data.data.available_doctors || res.data.data.doctorwise_reports)) {
                    reportPayload = res.data.data;
                }
            } else if (res && (res.available_doctors || res.doctorwise_reports)) {
                reportPayload = res;
            } else if (res && res.data && (res.data.available_doctors || res.data.doctorwise_reports)) {
                reportPayload = res.data;
            }

            if (reportPayload) {
                setAvailableDoctors(reportPayload.available_doctors || []);
                setDoctorwiseReports(reportPayload.doctorwise_reports || []);
                setGrandTotals(reportPayload.grand_totals || {
                    total_billed: 0,
                    total_requested: 0,
                    total_approved: 0,
                    total_patients: 0,
                    total_doctors: 0
                });
            } else {
                setAvailableDoctors([]);
                setDoctorwiseReports([]);
                setGrandTotals({
                    total_billed: 0,
                    total_requested: 0,
                    total_approved: 0,
                    total_patients: 0,
                    total_doctors: 0
                });
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            message.error("Server error while fetching report");
        } finally {
            setLoading(false);
        }
    }, [HmsBaseUrl, fromDate, toDate, selectedDoctor, selectedStatus]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Handle Print Summary
    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        
        const doctorSectionsHtml = doctorwiseReports.map(doc => `
            <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <div style="background: #f1f5f9; padding: 10px 14px; border-left: 5px solid #0f766e; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold; margin-bottom: 10px;">
                    <div>
                        <span>👨‍⚕️ ${doc.doctor_name}</span> 
                        <span style="color: #64748b; font-size: 12px; font-weight: normal; margin-left: 8px;">(ID: ${doc.doctor_id})</span>
                    </div>
                    <div>
                        <span style="margin-right: 15px; font-size: 12px; color: #475569;">Patients: ${doc.patient_count}</span>
                        <span style="color: #166534; font-weight: bold;">Total Approved: ₹${parseFloat(doc.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left; color: #334155;">
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Date</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Patient Name & UHID</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">IP Number</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Company / Insurance</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Role</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">Billed Fee</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">Requested Fee</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">Approved Fee</th>
                            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${doc.patients.map(p => `
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${p.date || '-'}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;"><strong>${p.patient_name}</strong><br/><span style="color:#64748b; font-size:10px;">UHID: ${p.uhid}</span></td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${p.ip_number}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${p.company_name}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${p.role}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">₹${parseFloat(p.billed_fee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">₹${parseFloat(p.requested_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #166534;">₹${parseFloat(p.approved_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">
                                    <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${p.status === 'Approved' ? '#dcfce7' : '#fef3c7'}; color: ${p.status === 'Approved' ? '#166534' : '#92400e'};">
                                        ${p.status || 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
                            <td colspan="5" style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">Doctor Subtotal:</td>
                            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">₹${parseFloat(doc.total_billed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right;">₹${parseFloat(doc.total_requested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; color: #166534;">₹${parseFloat(doc.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 6px 8px; border: 1px solid #cbd5e1;"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Doctor Fee Cuts Report (${fromDate} to ${toDate})</title>
                    <style>
                        body { font-family: sans-serif; padding: 30px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #0f766e; margin-bottom: 20px; padding-bottom: 10px; }
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #475569; background: #f8fafc; padding: 10px; border-radius: 6px; }
                        .summary-box { display: flex; justify-content: space-around; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 25px; }
                        .sum-item { text-align: center; }
                        .sum-val { font-size: 16px; font-weight: bold; color: #166534; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin: 0; color: #0f766e;">SHANMUGA HOSPITAL</h2>
                        <h3 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #334155;">DOCTORWISE FEE CUTS REPORT</h3>
                    </div>
                    
                    <div class="meta-info">
                        <div><strong>Date Range:</strong> ${fromDate} to ${toDate}</div>
                        <div><strong>Status Filter:</strong> ${selectedStatus}</div>
                        <div><strong>Total Doctors:</strong> ${grandTotals.total_doctors}</div>
                    </div>

                    <div class="summary-box">
                        <div class="sum-item">
                            <div style="font-size:11px; color:#475569;">Total Patients</div>
                            <div class="sum-val" style="color:#0f766e;">${grandTotals.total_patients}</div>
                        </div>
                        <div class="sum-item">
                            <div style="font-size:11px; color:#475569;">Total Billed Fee</div>
                            <div class="sum-val" style="color:#2563eb;">₹${parseFloat(grandTotals.total_billed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="sum-item">
                            <div style="font-size:11px; color:#475569;">Total Requested Fee</div>
                            <div class="sum-val" style="color:#d97706;">₹${parseFloat(grandTotals.total_requested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="sum-item">
                            <div style="font-size:11px; color:#475569;">Total Approved Fee</div>
                            <div class="sum-val" style="color:#166534;">₹${parseFloat(grandTotals.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    ${doctorSectionsHtml || '<p style="text-align:center; color:#94a3b8;">No doctor fee cuts records found for selected criteria.</p>'}

                    <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b;">
                        <div>Prepared By: ____________</div>
                        <div>Verified By: ____________</div>
                        <div>Authorized Signatory: ____________</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Handle Send Monthly Statement Emails to Doctors with Input Box
    const handleSendMonthlyEmails = async () => {
        const selectedDocObj = availableDoctors.find(d => String(d.doctor_id) === String(selectedDoctor));
        const targetDoctorReport = doctorwiseReports.find(d => String(d.doctor_id) === String(selectedDoctor));

        const defaultEmail = selectedDocObj?.email || targetDoctorReport?.email || targetDoctorReport?.patients?.[0]?.email || "";
        const docLabel = selectedDocObj?.doctor_name || targetDoctorReport?.doctor_name || (selectedDoctor !== "ALL" ? `Doctor #${selectedDoctor}` : "All Doctors");

        const { value: typedEmail, isConfirmed } = await Swal.fire({
            title: `Send Doctor Fee Cut Statement`,
            html: `
                <div style="text-align: left; font-size: 13px; margin-bottom: 8px;">
                    <p style="margin: 0 0 6px 0; color: #334155;">Sending filtered statement for: <strong>${docLabel}</strong> (${fromDate} to ${toDate})</p>
                    <p style="margin: 0; color: #64748b;">Enter or confirm recipient email ID below:</p>
                </div>
            `,
            input: 'email',
            inputValue: defaultEmail,
            inputPlaceholder: "doctor.email@example.com",
            showCancelButton: true,
            confirmButtonText: "Send Statement Email",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#0284c7",
            inputValidator: (val) => {
                if (!val || !val.trim()) {
                    return 'Please enter a valid email address!';
                }
            }
        });

        if (isConfirmed && typedEmail) {
            try {
                message.loading({ content: `Sending email to ${typedEmail}...`, key: "send_email" });
                const url = `${HmsBaseUrl}send-doctor-fee-cut-monthly-emails/?from_date=${fromDate}&to_date=${toDate}&doctor_id=${encodeURIComponent(selectedDoctor)}&status=${encodeURIComponent(selectedStatus)}&custom_email=${encodeURIComponent(typedEmail)}&force=1`;
                const res = await apiRequest(url, "GET");

                if (res.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Email Sent Successfully!",
                        text: res.message || `Fee Cut Statement sent to ${typedEmail}.`,
                        confirmButtonColor: "#0284c7"
                    });
                } else {
                    Swal.fire("Error", res.error || "Failed to send statement email", "error");
                }
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Server error while sending statement email", "error");
            } finally {
                message.destroy("send_email");
            }
        }
    };

    // Columns for per-doctor patient table
    const patientColumns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: 110,
            render: text => <span style={{ fontWeight: 600, color: '#334155' }}>{text || '-'}</span>
        },
        {
            title: "Patient Details",
            key: "patient_name",
            width: 200,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 700, color: colors.primary, fontSize: '0.88rem' }}>
                        {record.patient_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>
                        UHID: <strong>{record.uhid}</strong> | IP: <strong>{record.ip_number}</strong>
                    </div>
                </div>
            )
        },
        {
            title: "Customer / Insurance",
            key: "company_name",
            width: 180,
            render: (text, record) => (
                <div>
                    <Tag color="blue" style={{ fontSize: '0.7rem', fontWeight: 600 }}>{record.customer_type || 'General'}</Tag>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{record.company_name}</div>
                </div>
            )
        },
        {
            title: "Doctor Role",
            dataIndex: "role",
            key: "role",
            width: 130,
            render: text => <Tag color="cyan" style={{ fontWeight: 600 }}>{text}</Tag>
        },
        {
            title: "Billed Fee (₹)",
            dataIndex: "billed_fee",
            key: "billed_fee",
            align: 'right',
            width: 130,
            render: val => <span style={{ fontWeight: 600, color: '#475569' }}>₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        },
        {
            title: "Requested Amount (₹)",
            dataIndex: "requested_amount",
            key: "requested_amount",
            align: 'right',
            width: 150,
            render: val => <span style={{ fontWeight: 600, color: '#0284c7' }}>₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        },
        {
            title: "Approved Amount (₹)",
            dataIndex: "approved_amount",
            key: "approved_amount",
            align: 'right',
            width: 150,
            render: val => <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: 'center',
            width: 110,
            render: status => (
                <Tag color={status === 'Approved' ? 'green' : status === 'Requested' ? 'orange' : 'default'} style={{ fontWeight: 700 }}>
                    {status || 'Pending'}
                </Tag>
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
                            <h3 style={{ margin: 0 }}>Doctorwise Fee Cuts Report</h3>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: colors.textMuted }}>
                                View Doctorwise Approved & Billed Fee Cuts Breakdown
                            </p>
                        </div>
                    </div>
                </SectionTitle>

                {/* Top Filter Section */}
                <FilterSection className="no-print">
                    <Row gutter={[16, 16]} align="bottom">
                        <Col xs={24} sm={12} md={4}>
                            <FormLabel>From Date</FormLabel>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                style={{ height: 38, borderRadius: 6 }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <FormLabel>To Date</FormLabel>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                style={{ height: 38, borderRadius: 6 }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <FormLabel>Doctor Filter</FormLabel>
                            <Select
                                style={{ width: '100%', height: 38 }}
                                value={selectedDoctor}
                                onChange={setSelectedDoctor}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option value="ALL">ALL DOCTORS</Option>
                                {availableDoctors.map(doc => (
                                    <Option key={doc.doctor_id} value={doc.doctor_id}>
                                        {doc.doctor_name} (ID: {doc.doctor_id})
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={3}>
                            <FormLabel>Status</FormLabel>
                            <Select
                                style={{ width: '100%', height: 38 }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="ALL">ALL STATUSES</Option>
                                <Option value="Approved">Approved Only</Option>
                                <Option value="Requested">Requested Only</Option>
                                <Option value="Pending">Pending Only</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={8} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                                type="primary"
                                icon={<FaSync />}
                                onClick={fetchReport}
                                loading={loading}
                                style={{ height: 38, background: colors.primary, borderRadius: 6, fontWeight: 600 }}
                            >
                                Filter
                            </Button>
                            <Button
                                icon={<FaPrint />}
                                onClick={handlePrintReport}
                                style={{ height: 38, borderRadius: 6, color: '#475569' }}
                                title="Print Report"
                            >
                                Print
                            </Button>
                            <Button
                                type="primary"
                                icon={<FaEnvelope />}
                                onClick={handleSendMonthlyEmails}
                                style={{ height: 38, borderRadius: 6, background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
                                title="Send Monthly Statement Emails to Doctors"
                            >
                                Send Emails
                            </Button>
                        </Col>
                    </Row>
                </FilterSection>

                {/* Summary Metrics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={6} md={4.8}>
                        <StatCard $color="#0f766e">
                            <div>
                                <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>Total Doctors</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f766e' }}>{grandTotals.total_doctors}</div>
                            </div>
                            <FaUserMd size={24} color="#0f766e" />
                        </StatCard>
                    </Col>
                    <Col xs={12} sm={6} md={4.8}>
                        <StatCard $color="#0284c7">
                            <div>
                                <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>Total Patients</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0284c7' }}>{grandTotals.total_patients}</div>
                            </div>
                            <FaCalendarAlt size={22} color="#0284c7" />
                        </StatCard>
                    </Col>
                    <Col xs={12} sm={6} md={4.8}>
                        <StatCard $color="#2563eb">
                            <div>
                                <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>Total Billed Fee</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2563eb' }}>
                                    ₹{parseFloat(grandTotals.total_billed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </StatCard>
                    </Col>
                    <Col xs={12} sm={6} md={4.8}>
                        <StatCard $color="#d97706">
                            <div>
                                <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>Total Requested Fee</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d97706' }}>
                                    ₹{parseFloat(grandTotals.total_requested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </StatCard>
                    </Col>
                    <Col xs={12} sm={6} md={4.8}>
                        <StatCard $color="#166534">
                            <div>
                                <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>Total Approved Fee</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534' }}>
                                    ₹{parseFloat(grandTotals.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </StatCard>
                    </Col>
                </Row>

                {/* Doctorwise List */}
                {doctorwiseReports && doctorwiseReports.length > 0 ? (
                    doctorwiseReports.map(doc => (
                        <DoctorCard
                            key={doc.doctor_id}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <FaUserMd size={20} color="#0f766e" />
                                        <div>
                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f766e' }}>
                                                {doc.doctor_name}
                                            </span>
                                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 8 }}>
                                                (ID: {doc.doctor_id})
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <Tag color="cyan" style={{ fontWeight: 600, padding: '4px 10px', borderRadius: 4 }}>
                                            Patients: {doc.patient_count}
                                        </Tag>
                                        <Tag color="green" style={{ fontWeight: 700, padding: '4px 12px', borderRadius: 4, fontSize: '0.85rem' }}>
                                            Approved Total: ₹{parseFloat(doc.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Tag>
                                    </div>
                                </div>
                            }
                        >
                            <Table
                                dataSource={doc.patients}
                                columns={patientColumns}
                                rowKey={(r, idx) => `${r.ip_number}_${r.role}_${idx}`}
                                pagination={false}
                                size="small"
                                summary={() => (
                                    <Table.Summary.Row style={{ background: '#f8fafc', fontWeight: 700 }}>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <span style={{ color: '#475569' }}>Doctor Total ({doc.doctor_name}):</span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>
                                            <Tag color="cyan" style={{ fontWeight: 700 }}>{doc.patient_count} Records</Tag>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} align="right">
                                            <span style={{ color: '#2563eb' }}>₹{parseFloat(doc.total_billed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={6} align="right">
                                            <span style={{ color: '#0284c7' }}>₹{parseFloat(doc.total_requested || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={7} align="right">
                                            <span style={{ color: '#166534', fontSize: '0.95rem' }}>₹{parseFloat(doc.total_approved || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={8} />
                                    </Table.Summary.Row>
                                )}
                            />
                        </DoctorCard>
                    ))
                ) : (
                    <Card style={{ textAlign: 'center', padding: 40, borderRadius: 10 }}>
                        <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0 }}>
                            No doctor fee cuts records found for the selected date range and filters.
                        </p>
                    </Card>
                )}
            </Container>
        </PageWrapper>
    );
};

export default DoctorFeeCutsReport;
