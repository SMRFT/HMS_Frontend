import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { fetchMyReportPermissions } from "../../Auth/reportConfigApi";
import { toast } from "react-toastify";
import {
    Users,
    FileText,
    IndianRupee,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    Search,
    Baby,
    LogOut,
    UserPlus,
    UserCheck,
    ArrowRight,
    X,
    Filter,
    BedDouble,
    History,
    ShieldCheck
} from "lucide-react";
import {
    colors,
    PageWrapper,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Select,
    Table,
    Th,
    Td,
    Tr,
    TableWrapper,
} from "../GlobalStyles";
import * as XLSX from 'xlsx';

// ─── DASHBOARD-LEVEL STYLES (mirrors the Accounts Reports dashboard) ────────
const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  animation: ${fadeIn} 0.5s ease-out;

  .title-section {
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: ${colors.textMain};
      margin: 0;
      letter-spacing: -0.025em;
    }
    p {
      color: ${colors.textMuted};
      margin-top: 4px;
      font-size: 0.9rem;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 320px;
  max-width: 100%;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textMuted};
  }

  input {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid ${colors.border};
    background: ${colors.surface};
    padding: 0 14px 0 38px;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${colors.textMain};
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: ${colors.textMuted};
  grid-column: 1 / -1;

  svg { margin-bottom: 12px; opacity: 0.5; }
  .title { font-weight: 700; color: ${colors.textMain}; font-size: 1rem; margin-bottom: 4px; }
  .sub { font-size: 0.82rem; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ReportCard = styled.div`
  background: ${colors.surface};
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid ${colors.border};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.color || colors.primary};
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -4px rgba(0, 0, 0, 0.08), 0 6px 6px -4px rgba(0, 0, 0, 0.03);
    border-color: ${props => props.color || colors.primary};

    &::before { opacity: 1; }
    .icon-wrapper { background: ${colors.tabBg}; color: ${colors.primary}; transform: scale(1.05); }
    .arrow-icon { transform: translateX(3px); opacity: 1; }
  }

  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${colors.background};
    color: ${colors.textMuted};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
  }

  .content {
    h3 {
      font-size: 0.92rem;
      font-weight: 700;
      color: ${colors.textMain};
      margin: 0;
      line-height: 1.3;
    }
    p {
      font-size: 0.76rem;
      color: ${colors.textMuted};
      margin-top: 4px;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px dashed ${colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;

    .view-text {
      font-size: 0.76rem;
      font-weight: 600;
      color: ${props => props.color || colors.primary};
    }
    .arrow-icon {
      color: ${props => props.color || colors.primary};
      opacity: 0.5;
      transition: all 0.25s ease;
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content { border-radius: 24px; overflow: hidden; padding: 0; }
  .ant-modal-header { padding: 24px 32px; border-bottom: 1px solid ${colors.background}; margin: 0; }
  .ant-modal-title { font-size: 1.25rem; font-weight: 800; color: ${colors.textMain}; }
  .ant-modal-body { padding: 32px; }
  .ant-modal-footer { padding: 20px 32px; border-top: 1px solid ${colors.background}; }
`;

const ReportModal = styled(Modal)`
    .ant-modal-content { border-radius: 16px; padding: 0; overflow: hidden; }
    .ant-modal-body { padding: 0; max-height: 85vh; overflow-y: auto; }
    .ant-modal-close {
        top: 20px; right: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 50%; width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
    }
`;

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 0.875rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ant-picker {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid ${colors.border};

    &:hover, &.ant-picker-focused { border-color: ${colors.primary}; }
  }
`;

const ReportContainer = styled.div`
    padding: 20px;
    background: ${colors.background};

    & > div {
        margin-top: 0 !important;
        box-shadow: none !important;
    }
`;

// ─── SINGLE-REPORT VIEW STYLES (rendered inside the report modal) ──────────
const ToolBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  border-left: 4px solid ${props => props.color || colors.primary};

  .label { font-size: 0.7rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 1.3rem; font-weight: 800; color: ${colors.textMain}; margin-top: 2px; }
`;

const ModernTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: #f8fafc;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    padding: 14px 18px;
    border-bottom: 2px solid #f1f5f9;
  }

  tbody td {
    padding: 13px 18px;
    color: #1e293b;
    font-size: 0.88rem;
    font-weight: 500;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr:hover td { background-color: #f8fafc; }
`;

const Badge = styled.span`
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 0.76rem;
  font-weight: 700;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#475569'};
`;

const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 70px 24px; color: #94a3b8; text-align: center;
  .title { font-weight: 700; color: #64748b; font-size: 1rem; margin-bottom: 6px; }
  .sub { font-size: 0.85rem; }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 4px 0;

  .info { font-size: 0.8rem; color: ${colors.textMuted}; font-weight: 600; }
  .controls { display: flex; gap: 8px; }
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.active ? colors.primary : '#e2e8f0'};
  background: ${props => props.active ? colors.primary : 'white'};
  color: ${props => props.active ? 'white' : '#475569'};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) { border-color: ${colors.primary}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── SINGLE REPORT VIEW (one report_type from the shared endpoint) ──────────
const SingleFrontOfficeReport = ({ reportType, startDate, endDate }) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const needsDoctorFilter = ['admission_register', 'doctor_wise_admission', 'doctor_wise_ip_collection'].includes(reportType);

    useEffect(() => {
        if (needsDoctorFilter) fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await apiRequest(`${HMS_BASE_URL}doctor_list_diagnostics/`, "GET");
            if (response.success && Array.isArray(response.data)) setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                doctor_name: selectedDoctor
            };
            const queryString = new URLSearchParams(params).toString();
            const response = await apiRequest(`${HMS_BASE_URL}front-office-reports/?${queryString}`, "GET");
            if (response.success) {
                setReportData(response.data);
            } else {
                setReportData([]);
                toast.error(response.error || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error("An error occurred while fetching the report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, selectedDoctor]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportData, searchTerm]);

    const getFilteredData = () => {
        if (!searchTerm) return reportData;
        const lower = searchTerm.toLowerCase();
        return reportData.filter(item => Object.values(item).some(val => val && val.toString().toLowerCase().includes(lower)));
    };

    const getPaginatedData = () => {
        const data = getFilteredData();
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    };

    const allowedActions = (() => {
        try {
            return JSON.parse(localStorage.getItem("allowedActions") || "[]");
        } catch {
            return [];
        }
    })();
    const canExport = !allowedActions.length ||
        allowedActions.includes("HMS-R-SA") ||
        allowedActions.includes("SUPERADMIN") ||
        allowedActions.some(a => 
            a.startsWith("HMS-P-FOR-RW") || 
            a.startsWith("EXPORT-FOR") || 
            a.startsWith("HMS-P-AIN-RW") ||
            a === "HMS-ADMIN"
        );

    const handleExport = () => {
        const data = getFilteredData();
        if (data.length === 0) {
            toast.warning("No data to export");
            return;
        }
        let exportData = [];
        if (reportType === 'referred_patients' || reportType === 'op_patients') {
            exportData = data.map(r => ({
                "UHID": r.uhid || '',
                "Name": r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A',
                "Age/Gender": `${r.age || '-'}/${r.gender || '-'}`,
                "Mobile": r.mobilePhone || '',
                "Reg Date": r.created_date ? dayjs(r.created_date).format('DD-MM-YYYY') : '',
                "Referred By": r.referredBy || 'Direct',
                "Doctor": r.doctorName || 'N/A'
            }));
        } else if (reportType === 'admission_register' || reportType === 'doctor_wise_admission') {
            exportData = data.map(r => ({
                "IP No": r.ipNumber || '',
                "UHID": r.uhid || '',
                "Patient Name": r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A',
                "Admission Date": r.admissionDateTime ? dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm') : '',
                "Doctor": r.admittingDoctor || 'N/A',
                "Reason": r.reasonForAdmission || ''
            }));
        } else if (reportType === 'discharge_register') {
            exportData = data.map(r => ({
                "IP No": r.ipNo || '',
                "UHID": r.uhid || '',
                "Patient Name": r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A',
                "Admission Date": r.admission_date ? dayjs(r.admission_date).format('DD-MM-YYYY') : '',
                "Discharge Date": r.dod ? dayjs(r.dod).format('DD-MM-YYYY') : '',
                "Doctor": r.admitting_doctor || ''
            }));
        } else if (reportType === 'new_born_babies') {
            exportData = data.map(r => ({
                "Baby UHID": r.uhid || '',
                "Baby Name": `${r.firstName || ''} ${r.lastName || ''}`.trim() || `Baby of ${r.mothers_uhid_no || ''}`,
                "Mother UHID": r.mothers_uhid_no || '',
                "Birth Date": r.created_date ? dayjs(r.created_date).format('DD-MM-YYYY') : '',
                "Birth Time": `${r.birth_time || ''} ${r.birth_time_am_pm || ''}`.trim(),
                "Weight": r.weight ? `${r.weight} kg` : '',
                "Gender": r.gender || '',
                "Pediatrician": r.pediatrician_responsible || ''
            }));
        } else if (reportType === 'doctor_wise_ip_collection') {
            exportData = data.map(r => ({
                "Doctor Name": r.doctor_name || '',
                "Patient Count": r.patient_count || 0,
                "Bill Count": r.bill_count || 0,
                "Total Collection (₹)": Number((r.total_collection || 0).toFixed(2))
            }));
        }
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `FrontOffice_${reportType}_${dayjs().format('YYYYMMDD')}.xlsx`);
        toast.success("Report exported successfully");
    };

    const handlePrint = () => window.print();

    const getStats = () => {
        const data = getFilteredData();
        if (!data || data.length === 0) return [];
        if (reportType === 'referred_patients' || reportType === 'op_patients') {
            return [
                { label: 'Patients', value: data.length, color: colors.primary },
                { label: 'Referred', value: data.filter(r => r.referredBy && r.referredBy.toLowerCase() !== 'direct').length, color: '#2563eb' }
            ];
        }
        if (reportType === 'admission_register' || reportType === 'doctor_wise_admission') {
            return [
                { label: 'Admissions', value: data.length, color: '#2563eb' },
                { label: 'Doctors', value: new Set(data.map(r => r.admittingDoctor)).size, color: colors.primary }
            ];
        }
        if (reportType === 'discharge_register') {
            return [{ label: 'Discharges', value: data.length, color: colors.danger }];
        }
        if (reportType === 'doctor_wise_ip_collection') {
            const total = data.reduce((acc, curr) => acc + (curr.total_collection || 0), 0);
            return [
                { label: 'IP Collection', value: `₹${total.toLocaleString('en-IN')}`, color: '#059669' },
                { label: 'Doctors', value: data.length, color: '#2563eb' }
            ];
        }
        if (reportType === 'new_born_babies') {
            return [{ label: 'New Borns', value: data.length, color: '#db2777' }];
        }
        return [];
    };

    const renderTable = () => {
        const data = getPaginatedData();
        if (getFilteredData().length === 0) return null;

        if (reportType === 'referred_patients' || reportType === 'op_patients') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>UHID</Th><Th>Patient Name</Th><Th>Age/Gender</Th><Th>Mobile</Th>
                            <Th>Reg Date</Th><Th>Referred By</Th><Th>Consulting Doctor</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#f0fdfa" color={colors.primary}>{r.uhid}</Badge></Td>
                                <Td style={{ fontWeight: 600 }}>{r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A'}</Td>
                                <Td>{r.age || '-'}/{r.gender || '-'}</Td>
                                <Td>{r.mobilePhone || '-'}</Td>
                                <Td>{r.created_date ? dayjs(r.created_date).format('DD-MM-YYYY') : '-'}</Td>
                                <Td><Badge bg="#f1f5f9" color="#475569">{r.referredBy || 'Direct'}</Badge></Td>
                                <Td>{r.doctorName || 'N/A'}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
        if (reportType === 'admission_register' || reportType === 'doctor_wise_admission') {
            return (
                <ModernTable>
                    <thead>
                        <Tr><Th>IP No</Th><Th>UHID</Th><Th>Patient Name</Th><Th>Admission Date</Th><Th>Admitting Doctor</Th><Th>Reason</Th></Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#eff6ff" color="#2563eb">{r.ipNumber || 'N/A'}</Badge></Td>
                                <Td>{r.uhid}</Td>
                                <Td style={{ fontWeight: 600 }}>{r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A'}</Td>
                                <Td>{r.admissionDateTime ? dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm') : '-'}</Td>
                                <Td>{r.admittingDoctor || 'N/A'}</Td>
                                <Td style={{ fontSize: '0.85rem' }}>{r.reasonForAdmission || '-'}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
        if (reportType === 'discharge_register') {
            return (
                <ModernTable>
                    <thead>
                        <Tr><Th>IP No</Th><Th>UHID</Th><Th>Patient Name</Th><Th>Admission Date</Th><Th>Discharge Date</Th><Th>Admitting Doctor</Th></Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#fef2f2" color={colors.danger}>{r.ipNo || 'N/A'}</Badge></Td>
                                <Td>{r.uhid}</Td>
                                <Td style={{ fontWeight: 600 }}>{r.patient_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A'}</Td>
                                <Td>{r.admission_date ? dayjs(r.admission_date).format('DD-MM-YYYY') : '-'}</Td>
                                <Td>{r.dod ? dayjs(r.dod).format('DD-MM-YYYY') : '-'}</Td>
                                <Td>{r.admitting_doctor || 'N/A'}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
        if (reportType === 'doctor_wise_ip_collection') {
            return (
                <ModernTable>
                    <thead>
                        <Tr><Th>Doctor Name</Th><Th style={{ textAlign: 'center' }}>Patient Count</Th><Th style={{ textAlign: 'center' }}>Bill Count</Th><Th style={{ textAlign: 'right' }}>Total Collection (₹)</Th></Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td style={{ fontWeight: 600 }}>{r.doctor_name || 'N/A'}</Td>
                                <Td style={{ textAlign: 'center' }}><Badge bg="#f0f9ff" color="#0369a1">{r.patient_count || 0}</Badge></Td>
                                <Td style={{ textAlign: 'center' }}><Badge bg="#f0fdf4" color="#16a34a">{r.bill_count || 0}</Badge></Td>
                                <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(r.total_collection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
        if (reportType === 'new_born_babies') {
            return (
                <ModernTable>
                    <thead>
                        <Tr><Th>Baby UHID</Th><Th>Baby Name</Th><Th>Mother UHID</Th><Th>Birth Date/Time</Th><Th>Weight</Th><Th>Gender</Th><Th>Pediatrician</Th></Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#fdf2f8" color="#db2777">{r.uhid}</Badge></Td>
                                <Td style={{ fontWeight: 600 }}>{`${r.firstName || ''} ${r.lastName || ''}`.trim() || `Baby of ${r.mothers_uhid_no || 'Unknown'}`}</Td>
                                <Td>{r.mothers_uhid_no || 'N/A'}</Td>
                                <Td>{r.created_date ? dayjs(r.created_date).format('DD-MM-YYYY') : ''} {r.birth_time || ''} {r.birth_time_am_pm || ''}</Td>
                                <Td>{r.weight ? `${r.weight} kg` : '-'}</Td>
                                <Td>{r.gender || '-'}</Td>
                                <Td>{r.pediatrician_responsible || 'N/A'}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
        return null;
    };

    return (
        <div>
            <ToolBar className="no-print">
                {needsDoctorFilter && (
                    <InputWrapper style={{ minWidth: 220 }}>
                        <Label><Users size={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Consulting Doctor</Label>
                        <Select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                            <option value="all">All Doctors</option>
                            {doctors.map(doc => (
                                <option key={doc.employeeId} value={doc.employeeName}>{doc.employeeName}</option>
                            ))}
                        </Select>
                    </InputWrapper>
                )}
                <InputWrapper style={{ minWidth: 220, flex: 1 }}>
                    <Label><Search size={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Quick Search</Label>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", height: "38px", borderRadius: "10px", border: `1px solid ${colors.border}`, padding: '0 12px', fontSize: '0.88rem' }}
                    />
                </InputWrapper>
                <div style={{ display: 'flex', gap: 8 }}>
                    {reportData.length > 0 && (
                        <>
                            {canExport && (
                                <Button icon={<Download size={16} />} onClick={handleExport}>Export</Button>
                            )}
                            <Button icon={<Printer size={16} />} onClick={handlePrint}>Print</Button>
                        </>
                    )}
                </div>
            </ToolBar>

            {reportData.length > 0 && (
                <StatsGrid className="no-print">
                    {getStats().map((s, i) => (
                        <StatCard key={i} color={s.color}>
                            <div className="label">{s.label}</div>
                            <div className="value">{s.value}</div>
                        </StatCard>
                    ))}
                </StatsGrid>
            )}

            <TableWrapper>
                {!loading && renderTable()}
                {!loading && reportData.length === 0 && (
                    <EmptyState>
                        <div className="title">No Records Found</div>
                        <div className="sub">No data available for the selected period{needsDoctorFilter ? ' / doctor' : ''}.</div>
                    </EmptyState>
                )}
                {loading && (
                    <EmptyState>
                        <div className="title">Loading...</div>
                        <div className="sub">Fetching the latest data from the system.</div>
                    </EmptyState>
                )}
            </TableWrapper>

            {getFilteredData().length > pageSize && (
                <PaginationBar className="no-print">
                    <div className="info">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, getFilteredData().length)} of {getFilteredData().length} entries
                    </div>
                    <div className="controls">
                        <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft size={14} /> Previous
                        </PageButton>
                        <PageButton active>Page {currentPage}</PageButton>
                        <PageButton onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * pageSize >= getFilteredData().length}>
                            Next <ChevronRight size={14} />
                        </PageButton>
                    </div>
                </PaginationBar>
            )}

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    table { width: 100% !important; border-collapse: collapse; }
                    th { background: #eee !important; color: black !important; border: 1px solid #000 !important; }
                    td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; }
                }
            `}</style>
        </div>
    );
};

// ─── MAIN DASHBOARD (accounts-report-style tile grid + config/report modals) ─
const FrontOfficeReports = () => {
    const navigate = useNavigate();
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userReportPerms, setUserReportPerms] = useState({});
    const [hasCustomConfig, setHasCustomConfig] = useState(false);

    useEffect(() => {
        const loadUserPermissions = async () => {
            const empId = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || localStorage.getItem("auth-user-id");
            if (!empId) return;
            try {
                const res = await fetchMyReportPermissions(empId);
                if (res && res.success) {
                    setUserReportPerms(res.report_permissions || {});
                    setHasCustomConfig(Boolean(res.has_custom_config));
                }
            } catch (err) {
                console.error("Error loading user report permissions:", err);
            }
        };
        loadUserPermissions();
    }, []);

    const closeModal = () => {
        setIsConfigModalVisible(false);
        setIsReportModalVisible(false);
    };

    const reportsList = [
        {
            id: "referred_patients", title: "Referred Patients",
            description: "Patients registered with a referring source, for the selected period",
            icon: <UserPlus size={18} />, reportType: "referred_patients", color: colors.primary,
            route: "/ReferredPatientsReport",
            permission: "HMS-RPT-REFERRED-PATIENTS"
        },
        {
            id: "op_patients", title: "OP Patient Register",
            description: "Full outpatient registration list for the selected period",
            icon: <Users size={18} />, reportType: "op_patients", color: colors.primary,
            route: "/OPPatientRegister",
            permission: "HMS-RPT-OP-PATIENTS"
        },
        {
            id: "admission_register", title: "Admission Register",
            description: "IP admissions with room, doctor, and reason for admission",
            icon: <FileText size={18} />, reportType: "admission_register", color: colors.primary,
            route: "/AdmissionRegister",
            permission: "HMS-RPT-ADMISSION-REGISTER"
        },
        {
            id: "discharge_register", title: "Discharge Register",
            description: "Discharged patients with admission/discharge dates and doctor",
            icon: <LogOut size={18} />, reportType: "discharge_register", color: colors.danger,
            route: "/DischargeRegister",
            permission: "HMS-RPT-DISCHARGE-REGISTER"
        },
        {
            id: "doctor_wise_ip_collection", title: "Doctor wise IP Collection",
            description: "IP billing collection totals grouped by doctor",
            icon: <IndianRupee size={18} />, reportType: "doctor_wise_ip_collection", color: '#059669',
            route: "/DoctorWiseIPCollection",
            permission: "HMS-RPT-DOCTOR-WISE-IP-COLLECTION"
        },
        {
            id: "new_born_babies", title: "New Born Babies List",
            description: "Newborn registrations linked to a mother's UHID",
            icon: <Baby size={18} />, reportType: "new_born_babies", color: '#db2777',
            route: "/NewBornBabiesReport",
            permission: "HMS-RPT-NEWBORN-BABIES"
        },
        {
            id: "doctor_wise_admission", title: "Doctor wise Admission",
            description: "IP admissions grouped and filterable by admitting doctor",
            icon: <UserCheck size={18} />, reportType: "doctor_wise_admission", color: colors.primary,
            route: "/DoctorWiseAdmission",
            permission: "HMS-RPT-DOCTOR-WISE-ADMISSION"
        },
        {
            id: "room_occupancy", title: "Room Occupancy Report",
            description: "Live view of currently occupied rooms and beds",
            icon: <BedDouble size={18} />, path: "/RoomOccupencyReport", color: '#2563eb',
            route: "/RoomOccupencyReport",
            permission: "HMS-RPT-ROOM-OCCUPANCY"
        },
        {
            id: "pre_day_room_occupancy", title: "Previous Day Room Occupancy",
            description: "Room occupancy as it stood at end-of-day for any past date",
            icon: <History size={18} />, path: "/PreDayRoomOccupancyReport", color: '#2563eb',
            route: "/PreDayRoomOccupancyReport",
            permission: "HMS-RPT-PRE-OCCUPANCY"
        },
        {
            id: "insurance_credit_report", title: "Insurance & Credit Billing Report",
            description: "Comprehensive tracking of insurance credit bills, active admissions, room occupancy & lab investigations",
            icon: <ShieldCheck size={18} />, path: "/InsuranceCreditReport", color: '#0d9488',
            route: "/InsuranceCreditReport",
            permission: "HMS-RPT-INSURANCE-CREDIT"
        },
    ];

    const filteredReports = reportsList.filter(report => {
        // Evaluate dynamic report permissions if configured
        if (hasCustomConfig && userReportPerms && typeof userReportPerms === "object") {
            const rRoute = report.route || report.path || report.reportType;
            const norm = rRoute?.startsWith("/") ? rRoute : `/${rRoute}`;
            const isAllowed = Boolean(
                userReportPerms[rRoute] ||
                userReportPerms[norm] ||
                userReportPerms[report.path] ||
                userReportPerms[report.reportType] ||
                userReportPerms[report.title] ||
                userReportPerms[report.id] ||
                userReportPerms[report.permission]
            );
            if (!isAllowed) return false;
        }

        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            report.title.toLowerCase().includes(term) ||
            report.description.toLowerCase().includes(term)
        );
    });

    const handleCardClick = (report) => {
        if (report.path) {
            navigate(report.path);
        } else {
            setSelectedReport(report);
            setIsConfigModalVisible(true);
        }
    };

    const handleGenerateReport = () => {
        setIsConfigModalVisible(false);
        setIsReportModalVisible(true);
    };

    const renderSelectedReport = () => {
        if (!selectedReport) return null;
        return (
            <SingleFrontOfficeReport
                reportType={selectedReport.reportType}
                startDate={dateRange[0].format("YYYY-MM-DD")}
                endDate={dateRange[1].format("YYYY-MM-DD")}
            />
        );
    };

    return (
        <Container>
            <Header>
                <div className="title-section">
                    <h1>Front Office Reports</h1>
                    <p>Registration, admission, discharge, and room occupancy insights</p>
                </div>
                <SearchBox>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search front office reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
            </Header>

            <Grid>
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <ReportCard key={report.id} color={report.color} onClick={() => handleCardClick(report)}>
                            <div className="icon-wrapper">{report.icon}</div>
                            <div className="content">
                                <h3>{report.title}</h3>
                                <p>{report.description}</p>
                            </div>
                            <div className="footer">
                                <span className="view-text">{report.path ? "Open Report" : "Generate Report"}</span>
                                <ArrowRight className="arrow-icon" size={15} />
                            </div>
                        </ReportCard>
                    ))
                ) : (
                    <NoResults>
                        <Search size={36} />
                        <div className="title">No Reports Found</div>
                        <div className="sub">No front office reports match "{searchTerm}"</div>
                    </NoResults>
                )}
            </Grid>

            {/* Date Configuration Modal */}
            <StyledModal
                title={`Configure ${selectedReport?.title}`}
                open={isConfigModalVisible}
                onCancel={closeModal}
                footer={[
                    <Button key="back" onClick={closeModal} style={{ borderRadius: '8px' }}>Cancel</Button>,
                    <Button
                        key="submit" type="primary" onClick={handleGenerateReport}
                        style={{ borderRadius: '8px', background: selectedReport?.color, borderColor: selectedReport?.color }}
                    >
                        View Report
                    </Button>,
                ]}
                centered
                width={500}
                closable={false}
            >
                <DatePickerWrapper>
                    <FormRow>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker
                                value={dateRange[0]}
                                onChange={(date) => setDateRange([date, dateRange[1]])}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={dateRange[1]}
                                onChange={(date) => setDateRange([dateRange[0], date])}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                    </FormRow>
                    <p style={{ color: colors.textMuted, fontSize: '0.75rem', marginTop: '12px' }}>
                        * The report will be generated for the period between {dateRange[0] ? dateRange[0].format('DD/MM/YYYY') : '—'} and {dateRange[1] ? dateRange[1].format('DD/MM/YYYY') : '—'}.
                    </p>
                </DatePickerWrapper>
            </StyledModal>

            {/* Full Report Display Modal */}
            <ReportModal
                title={null}
                open={isReportModalVisible}
                onCancel={closeModal}
                footer={null}
                width="95%"
                centered
                destroyOnHidden
                closable={false}
            >
                <ReportContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: colors.textMain }}>{selectedReport?.title}</h2>
                            <p style={{ margin: 0, color: colors.textMuted }}>Period: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button icon={<Filter size={16} />} onClick={() => { setIsReportModalVisible(false); setIsConfigModalVisible(true); }}>
                                Change Dates
                            </Button>
                            <Button type="primary" danger icon={<X size={16} />} onClick={closeModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                    {renderSelectedReport()}
                </ReportContainer>
            </ReportModal>
        </Container>
    );
};

export default FrontOfficeReports;
