import React, { useState, useEffect } from "react";
import { DatePicker, Tabs, Tooltip, Modal } from "antd";
import dayjs from "dayjs";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    Users,
    Calendar,
    FileText,
    IndianRupee,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Activity,
    Search,
    Filter,
    Baby,
    LogOut,
    UserPlus,
    UserCheck
} from "lucide-react";
import {
    PageWrapper,
    InputWrapper,
    Label,
    Select,
    Button,
    Table,
    Th,
    Td,
    Tr,
    TableWrapper,
    colors,
} from "../GlobalStyles";
import * as XLSX from 'xlsx';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModernPageContainer = styled(PageWrapper)`
  background: #f1f5f9;
  padding: 12px 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  font-family: 'Inter', -apple-system, sans-serif;

  @media (max-width: 768px) {
    padding: 8px;
    height: auto;
    overflow: auto;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    flex: none;
    height: 500px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 10px 16px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    border-color: ${props => props.color || colors.primary};
  }

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.lightBg || '#f0fdfa'};
    color: ${props => props.color || colors.primary};
    flex-shrink: 0;
    
    svg {
        width: 16px;
        height: 16px;
    }
  }

  .content-box {
      display: flex;
      flex-direction: column;
  }

  .label {
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .value {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    margin: 0;
    line-height: 1;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  
  .info {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
  }
  
  .controls {
    display: flex;
    gap: 8px;
  }
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.active ? colors.primary : '#e2e8f0'};
  background: ${props => props.active ? colors.primary : 'white'};
  color: ${props => props.active ? 'white' : '#475569'};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    color: ${props => props.active ? 'white' : colors.primary};
    background: ${props => props.active ? colors.primary : '#f0fdfa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background: white;
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 900;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;

    .icon-wrapper {
        background: linear-gradient(135deg, ${colors.primary}, #0d9488);
        padding: 6px;
        border-radius: 8px;
        display: flex;
        color: white;
        
        svg {
            width: 18px;
            height: 18px;
        }
    }
  }
  
  p {
    color: #64748b;
    margin: 2px 0 0 0;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ModernButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: auto;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.1);
  background: linear-gradient(135deg, ${colors.primary}, #0d9488);
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(13, 148, 136, 0.2);
  }
`;

const SecondaryButton = styled(ModernButton)`
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01);

  &:hover {
    background: #f8fafc;
    color: #1e293b;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  }
`;

const FilterSection = styled(GlassCard)`
  padding: 12px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
  flex: none;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const ModernInputWrapper = styled(InputWrapper)`
  label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const StyledSelect = styled(Select)`
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #fff;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.primary};
  }
`;

const ModernTableWrapper = styled(TableWrapper)`
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  background: white;
  flex: 1;
  overflow-y: auto;
  position: relative;
  border-top: 1px solid #f1f5f9;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8fafc;
  }
`;

const ModernTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: #f8fafc;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    padding: 20px 24px;
    border-bottom: 2px solid #f1f5f9;
  }

  tbody td {
    padding: 20px 24px;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 500;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
  }

  tbody tr:hover td {
    background-color: #f8fafc;
    color: ${colors.primary};
  }
`;

const TileGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background: #cbd5e1;
  }
`;

const ReportTile = styled.div`
  background: ${props => props.active ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 16px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? 'transparent' : '#f1f5f9'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  box-shadow: ${props => props.active ? '0 8px 16px rgba(13, 148, 136, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.01)'};
  flex: 0 0 180px;

  &:hover {
    transform: translateY(-3px);
    border-color: ${props => props.active ? 'transparent' : '#0d9488'};
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04);
  }

  .icon-box {
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.15)' : '#f0fdfa'};
    color: ${props => props.active ? 'white' : '#0d9488'};
    padding: 8px;
    border-radius: 10px;
    display: flex;
    flex-shrink: 0;
    
    svg {
        width: 18px;
        height: 18px;
    }
  }

  span {
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Badge = styled.span`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#475569'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  background: #fff;

  .icon-container {
      background: #f8fafc;
      padding: 40px;
      border-radius: 50%;
      margin-bottom: 24px;
      color: #cbd5e1;
  }

  h3 {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }

  p {
    color: #64748b;
    max-width: 450px;
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

const FrontOfficeReports = () => {
    const [activeTab, setActiveTab] = useState("referred_patients");
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("all");

    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await apiRequest(`${HMS_BASE_URL}doctor_list_diagnostics/`, "GET");
            if (response.success && Array.isArray(response.data)) {
                setDoctors(response.data);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                report_type: activeTab,
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
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
        setReportData([]);
    }, [activeTab]);

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }

        let exportData = [];
        let fileName = `FrontOffice_${activeTab}_${dayjs().format('YYYYMMDD')}.xlsx`;

        if (activeTab === 'referred_patients' || activeTab === 'op_patients') {
            exportData = reportData.map(r => ({
                "UHID": r.uhid,
                "Name": `${r.firstName} ${r.lastName}`,
                "Age/Gender": `${r.age}/${r.gender}`,
                "Mobile": r.mobilePhone,
                "Reg Date": dayjs(r.created_date).format('DD-MM-YYYY'),
                "Referred By": r.referredBy || 'Direct',
                "Doctor": r.doctorName || 'N/A'
            }));
        } else if (activeTab === 'admission_register' || activeTab === 'doctor_wise_admission') {
            exportData = reportData.map(r => ({
                "IP No": r.ipNumber,
                "UHID": r.uhid,
                "Patient Name": r.patient_name,
                "Admission Date": dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm'),
                "Doctor": r.admittingDoctor,
                "Reason": r.reasonForAdmission || ''
            }));
        } else if (activeTab === 'discharge_register') {
            exportData = reportData.map(r => ({
                "IP No": r.ipNo,
                "UHID": r.uhid,
                "Patient Name": r.patient_name,
                "Discharge Date": r.dod,
                "Doctor": r.admitting_doctor || ''
            }));
        } else if (activeTab === 'new_born_babies') {
            exportData = reportData.map(r => ({
                "Baby UHID": r.uhid,
                "Baby Name": `${r.firstName} ${r.lastName}`,
                "Mother UHID": r.mothers_uhid_no,
                "Birth Time": `${r.birth_time} ${r.birth_time_am_pm}`,
                "Weight": r.weight,
                "Gender": r.gender,
                "Pediatrician": r.pediatrician_responsible
            }));
        } else if (activeTab === 'doctor_wise_ip_collection') {
            exportData = reportData.map(r => ({
                "Doctor Name": r.doctor_name,
                "Patient Count": r.patient_count,
                "Bill Count": r.bill_count,
                "Total Collection (₹)": r.total_collection
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, fileName);
        toast.success("Report exported successfully");
    };

    const handlePrint = () => {
        window.print();
    };

    const items = [
        { key: "referred_patients", label: "Referred Patients", icon: <UserPlus size={16} /> },
        { key: "op_patients", label: "OP Patient Register", icon: <Users size={16} /> },
        { key: "admission_register", label: "Admission Register", icon: <Activity size={16} /> },
        { key: "discharge_register", label: "Discharge Register", icon: <LogOut size={16} /> },
        { key: "doctor_wise_ip_collection", label: "Doctor wise IP Collection", icon: <IndianRupee size={16} /> },
        { key: "new_born_babies", label: "New Born Babies List", icon: <Baby size={16} /> },
        { key: "doctor_wise_admission", label: "Doctor wise Admission", icon: <UserCheck size={16} /> },
    ];

    const renderTable = () => {
        const data = getPaginatedData();
        const totalRecords = getFilteredData().length;
        if (totalRecords === 0) return null;

        if (activeTab === 'referred_patients' || activeTab === 'op_patients') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Age/Gender</Th>
                            <Th>Mobile</Th>
                            <Th>Reg Date</Th>
                            <Th>Referred By</Th>
                            <Th>Consulting Doctor</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#f0fdfa" color="#0d9488">{r.uhid}</Badge></Td>
                                <Td style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</Td>
                                <Td>{r.age}/{r.gender}</Td>
                                <Td>{r.mobilePhone}</Td>
                                <Td>{dayjs(r.created_date).format('DD-MM-YYYY')}</Td>
                                <Td><Badge bg="#f1f5f9" color="#475569">{r.referredBy || 'Direct'}</Badge></Td>
                                <Td>{r.doctorName}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }

        if (activeTab === 'admission_register' || activeTab === 'doctor_wise_admission') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>IP No</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Admission Date</Th>
                            <Th>Admitting Doctor</Th>
                            <Th>Reason</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#eff6ff" color="#2563eb">{r.ipNumber}</Badge></Td>
                                <Td>{r.uhid}</Td>
                                <Td style={{ fontWeight: 600 }}>{r.patient_name}</Td>
                                <Td>{dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm')}</Td>
                                <Td>{r.admittingDoctor}</Td>
                                <Td style={{ fontSize: '0.85rem' }}>{r.reasonForAdmission}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }

        if (activeTab === 'discharge_register') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>IP No</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Admission Date</Th>
                            <Th>Discharge Date</Th>
                            <Th>Admitting Doctor</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#fef2f2" color="#dc2626">{r.ipNo}</Badge></Td>
                                <Td>{r.uhid}</Td>
                                <Td style={{ fontWeight: 600 }}>{r.patient_name}</Td>
                                <Td>{dayjs(r.admission_date).format('DD-MM-YYYY')}</Td>
                                <Td>{dayjs(r.dod).format('DD-MM-YYYY')}</Td>
                                <Td>{r.admitting_doctor}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }

        if (activeTab === 'doctor_wise_ip_collection') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>Doctor Name</Th>
                            <Th style={{ textAlign: 'center' }}>Patient Count</Th>
                            <Th style={{ textAlign: 'center' }}>Bill Count</Th>
                            <Th style={{ textAlign: 'right' }}>Total Collection (₹)</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {data.map((r, idx) => (
                            <Tr key={idx}>
                                <Td style={{ fontWeight: 600 }}>{r.doctor_name}</Td>
                                <Td style={{ textAlign: 'center' }}><Badge bg="#f0f9ff" color="#0369a1">{r.patient_count}</Badge></Td>
                                <Td style={{ textAlign: 'center' }}><Badge bg="#f0fdf4" color="#16a34a">{r.bill_count}</Badge></Td>
                                <Td style={{ textAlign: 'right', fontWeight: 700 }}>{(r.total_collection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }

        if (activeTab === 'new_born_babies') {
            return (
                <ModernTable>
                    <thead>
                        <Tr>
                            <Th>Baby UHID</Th>
                            <Th>Baby Name</Th>
                            <Th>Mother UHID</Th>
                            <Th>Birth Date/Time</Th>
                            <Th>Weight</Th>
                            <Th>Gender</Th>
                            <Th>Pediatrician</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.map((r, idx) => (
                            <Tr key={idx}>
                                <Td><Badge bg="#fdf2f8" color="#db2777">{r.uhid}</Badge></Td>
                                <Td style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</Td>
                                <Td>{r.mothers_uhid_no}</Td>
                                <Td>{dayjs(r.created_date).format('DD-MM-YYYY')} {r.birth_time} {r.birth_time_am_pm}</Td>
                                <Td>{r.weight} kg</Td>
                                <Td>{r.gender}</Td>
                                <Td>{r.pediatrician_responsible}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </ModernTable>
            );
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, reportData, searchTerm]);

    const getFilteredData = () => {
        if (!searchTerm) return reportData;
        const lowerSearch = searchTerm.toLowerCase();
        return reportData.filter(item => {
            return Object.values(item).some(val => 
                val && val.toString().toLowerCase().includes(lowerSearch)
            );
        });
    };

    const getPaginatedData = () => {
        const data = getFilteredData();
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    };

    const getStats = () => {
        const data = getFilteredData();
        if (!data || data.length === 0) return [];
        
        if (activeTab === 'referred_patients' || activeTab === 'op_patients') {
            return [
                { label: 'Patients', value: data.length, icon: <Users size={16} />, color: '#0d9488', bg: '#f0fdfa' },
                { label: 'Referred', value: data.filter(r => r.referredBy && r.referredBy.toLowerCase() !== 'direct').length, icon: <UserPlus size={16} />, color: '#2563eb', bg: '#eff6ff' }
            ];
        }
        if (activeTab === 'admission_register' || activeTab === 'doctor_wise_admission') {
             return [
                { label: 'Admissions', value: data.length, icon: <Activity size={16} />, color: '#2563eb', bg: '#eff6ff' },
                { label: 'Doctors', value: new Set(data.map(r => r.admittingDoctor)).size, icon: <UserCheck size={16} />, color: '#0d9488', bg: '#f0fdfa' }
            ];
        }
        if (activeTab === 'discharge_register') {
            return [
                { label: 'Discharges', value: data.length, icon: <LogOut size={16} />, color: '#dc2626', bg: '#fef2f2' }
            ];
        }
        if (activeTab === 'doctor_wise_ip_collection') {
            const total = data.reduce((acc, curr) => acc + (curr.total_collection || 0), 0);
            return [
                { label: 'IP Collection', value: `₹${total.toLocaleString('en-IN')}`, icon: <IndianRupee size={16} />, color: '#059669', bg: '#ecfdf5' },
                { label: 'Doctors', value: data.length, icon: <Users size={16} />, color: '#2563eb', bg: '#eff6ff' }
            ];
        }
        if (activeTab === 'new_born_babies') {
            return [
                { label: 'New Borns', value: data.length, icon: <Baby size={16} />, color: '#db2777', bg: '#fdf2f8' }
            ];
        }
        return [];
    };

    return (
        <ModernPageContainer>
            <PageHeader>
                <TitleGroup>
                    <h1>
                        <div className="icon-wrapper">
                            <FileText size={24} />
                        </div>
                        Front Office Reports
                    </h1>
                    <p>Insights and records for hospital administration and clinical operations.</p>
                </TitleGroup>
                <ActionButtons className="no-print">
                    {reportData.length > 0 && (
                        <>
                            <SecondaryButton onClick={handleExport}>
                                <Download size={20} /> Export
                            </SecondaryButton>
                            <SecondaryButton onClick={handlePrint}>
                                <Printer size={20} /> Print
                            </SecondaryButton>
                        </>
                    )}
                </ActionButtons>
            </PageHeader>

            <FilterSection className="no-print">
                <ModernInputWrapper>
                    <Label><Calendar size={18} /> Date Range Selection</Label>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: "100%", height: "48px", borderRadius: "14px", border: '2px solid #f1f5f9' }}
                        format="DD-MM-YYYY"
                        allowClear={false}
                    />
                </ModernInputWrapper>

                {(activeTab === 'admission_register' || activeTab === 'doctor_wise_admission' || activeTab === 'doctor_wise_ip_collection') && (
                    <ModernInputWrapper>
                        <Label><Users size={18} /> Consulting Doctor</Label>
                        <StyledSelect
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                            <option value="all">All Doctors</option>
                            {doctors.map(doc => (
                                <option key={doc.employeeId} value={doc.employeeName}>
                                    {doc.employeeName}
                                </option>
                            ))}
                        </StyledSelect>
                    </ModernInputWrapper>
                )}
                
                <ModernInputWrapper>
                    <Label><Search size={18} /> Quick Search</Label>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: "100%", 
                            height: "38px", 
                            borderRadius: "10px", 
                            border: '1px solid #e2e8f0',
                            padding: '0 12px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    />
                </ModernInputWrapper>
                
                <ModernButton onClick={fetchReport} disabled={loading} style={{ marginBottom: '2px' }}>
                    {loading ? <Activity className="animate-spin" size={18} /> : <TrendingUp size={18} />}
                    {loading ? "Processing..." : "Generate Insights"}
                </ModernButton>
            </FilterSection>

            {reportData.length > 0 && (
                <StatsGrid className="no-print">
                    {getStats().map((stat, idx) => (
                        <StatCard key={idx} color={stat.color} lightBg={stat.bg}>
                            <div className="icon-box">
                                {stat.icon}
                            </div>
                            <div className="content-box">
                                <div className="label">{stat.label}</div>
                                <div className="value">{stat.value}</div>
                            </div>
                        </StatCard>
                    ))}
                </StatsGrid>
            )}

            <TileGrid className="no-print">
                {items.map(item => (
                    <ReportTile 
                        key={item.key} 
                        active={activeTab === item.key}
                        onClick={() => setActiveTab(item.key)}
                    >
                        <div className="icon-box">
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </ReportTile>
                ))}
            </TileGrid>

            <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                <ModernTableWrapper>
                    {renderTable()}
                    {!loading && reportData.length === 0 && (
                        <EmptyContainer>
                            <div className="icon-container">
                                <Search size={64} />
                            </div>
                            <h3>No Records Found</h3>
                            <p>Adjust your filters and click "Generate Insights" to retrieve the latest data from the system.</p>
                        </EmptyContainer>
                    )}
                    {loading && (
                        <EmptyContainer>
                            <div className="icon-container">
                                <Activity className="animate-spin" size={64} />
                            </div>
                            <h3>Analyzing Data...</h3>
                            <p>Please wait while our system compiles the requested report for you.</p>
                        </EmptyContainer>
                    )}
                </ModernTableWrapper>

                {getFilteredData().length > pageSize && (
                    <PaginationContainer className="no-print">
                        <div className="info">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, getFilteredData().length)} of {getFilteredData().length} entries
                        </div>
                        <div className="controls">
                            <PageButton 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={14} /> Previous
                            </PageButton>
                            <PageButton active>
                                Page {currentPage}
                            </PageButton>
                            <PageButton 
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * pageSize >= getFilteredData().length}
                            >
                                Next <ChevronRight size={14} />
                            </PageButton>
                        </div>
                    </PaginationContainer>
                )}
            </GlassCard>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    ${ModernPageContainer} { padding: 0; background: white; }
                    ${GlassCard} { box-shadow: none; border: none; padding: 0; transform: none !important; }
                    body { font-size: 11pt; color: black; }
                    table { width: 100% !important; border-collapse: collapse; margin-top: 20px; }
                    th { background: #eee !important; color: black !important; border: 1px solid #000 !important; }
                    td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; }
                    h1 { margin-bottom: 20px; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </ModernPageContainer>
    );
};

export default FrontOfficeReports;
