import React, { useState, useEffect } from "react";
import { DatePicker, Tooltip } from "antd";
import dayjs from "dayjs";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    Users,
    Calendar,
    FileText,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Activity,
    Search,
    Filter,
    Home,
    Clock
} from "lucide-react";
import {
    PageWrapper,
    InputWrapper,
    Label,
    Input,
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
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModernPageContainer = styled(PageWrapper)`
  animation: ${fadeIn} 0.4s ease-out;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    letter-spacing: -0.5px;

    .icon-wrapper {
        background: #f0fdfa;
        color: #0d9488;
        padding: 10px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.1);
    }
  }

  p {
    color: #64748b;
    margin: 6px 0 0 0;
    font-size: 1rem;
    font-weight: 500;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const SecondaryButton = styled.button`
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    color: #1e293b;
    background: #f8fafc;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  align-items: flex-end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScrollableTableWrapper = styled(TableWrapper)`
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  border-radius: 0 0 20px 20px;
  background: white;
  border-top: 1px solid #f1f5f9;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: ${colors.tabBg};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);

  .icon-box {
    background: ${props => props.lightBg || '#f1f5f9'};
    color: ${props => props.color || '#475569'};
    padding: 12px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content-box {
    .label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .value {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        margin-top: 4px;
    }
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
  padding: 0;
  overflow: hidden;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#475569'};
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #f1f5f9;

  .info {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 8px;
  }
`;

const PageButton = styled.button`
  background: ${props => props.active ? '#0d9488' : 'white'};
  color: ${props => props.active ? 'white' : '#475569'};
  border: 1px solid ${props => props.active ? '#0d9488' : '#e2e8f0'};
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#0d9488' : '#f8fafc'};
    border-color: ${props => props.active ? '#0d9488' : '#cbd5e1'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreDayRoomOccupancyReport = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [targetDate, setTargetDate] = useState(dayjs().subtract(1, 'day'));
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        fetchDoctors();
        fetchReport();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportData, searchTerm]);

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
            const params = {};
            if (selectedCategory) params.room_category = selectedCategory;
            if (selectedDoctor && selectedDoctor !== "all") params.admitting_doctor = selectedDoctor;
            if (targetDate) params.target_date = targetDate.format('YYYY-MM-DD');

            const queryString = new URLSearchParams(params).toString();
            const url = `${HMS_BASE_URL}PreDayRoomOccupancyReport/?${queryString}`;
            const response = await apiRequest(url, "GET");

            if (response.success) {
                setReportData(response.data || []);
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

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const fileName = `PreDayOccupancyReport_${targetDate.format('YYYYMMDD')}.xlsx`;
        const exportData = reportData.map(r => ({
            "Room No": r.roomNo,
            "Bed No": r.bedNo,
            "Room Category": r.roomCategory,
            "Room Type": r.roomType,
            "Block": r.block,
            "Floor": r.floor,
            "IP No": r.ipNumber,
            "UHID": r.uhid,
            "Patient Name": r.patientName,
            "Age/Gender": `${r.age}/${r.gender}`,
            "Mobile": r.mobile,
            "Admission Date": r.admissionDateTime ? dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm') : "N/A",
            "Discharge Date": r.dischargeDateTime ? dayjs(r.dischargeDateTime).format('DD-MM-YYYY HH:mm') : "N/A",
            "Admitting Doctor": r.admittingDoctor,
            "Status": r.status,
            "Package": r.packageName
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Previous Day Occupancy");
        XLSX.writeFile(wb, fileName);
        toast.success("Report exported successfully");
    };

    const handlePrint = () => {
        window.print();
    };

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
        return [
            { label: 'Occupied Rooms', value: new Set(data.map(r => r.roomNo)).size, icon: <Home size={16} />, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Total Occupying Patients', value: data.length, icon: <Users size={16} />, color: '#0d9488', bg: '#f0fdfa' }
        ];
    };

    const getStatusBadgeColor = (status) => {
        switch(status) {
            case "Still Active": return { bg: "#f0fdf4", color: "#16a34a" };
            case "Active on Date": return { bg: "#eff6ff", color: "#2563eb" };
            case "Discharged on this Date": return { bg: "#fef2f2", color: "#dc2626" };
            default: return { bg: "#f1f5f9", color: "#475569" };
        }
    }

    const renderTable = () => {
        const data = getPaginatedData();
        const totalRecords = getFilteredData().length;
        if (totalRecords === 0) return null;

        return (
            <Table>
                <thead>
                    <Tr>
                        <Th style={{ whiteSpace: 'nowrap' }}>Room/Bed</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Category/Block</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Patient Details</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Admission Date</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Discharge Date</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Admitting Doctor</Th>
                        <Th style={{ whiteSpace: 'nowrap' }}>Status</Th>
                    </Tr>
                </thead>
                <tbody>
                    {data.map((r, idx) => {
                        const statusColors = getStatusBadgeColor(r.status);
                        return (
                            <Tr key={idx}>
                                <Td style={{ whiteSpace: 'nowrap' }}>
                                    <Badge bg="#eff6ff" color="#2563eb" style={{ marginRight: '6px' }}>Room {r.roomNo}</Badge>
                                    <Badge bg="#f0fdf4" color="#16a34a">Bed {r.bedNo}</Badge>
                                </Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>
                                    <div style={{ fontWeight: 600 }}>{r.roomCategory}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {r.block} {r.floor !== 'N/A' && `(Floor ${r.floor})`}
                                    </div>
                                </Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>
                                    <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '4px', marginTop: '2px' }}>
                                        <span>{r.ipNumber}</span> | <span>{r.age}/{r.gender}</span>
                                    </div>
                                </Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>{r.admissionDateTime ? dayjs(r.admissionDateTime).format('DD-MM-YYYY HH:mm') : 'N/A'}</Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>{r.dischargeDateTime ? dayjs(r.dischargeDateTime).format('DD-MM-YYYY HH:mm') : 'N/A'}</Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>{r.admittingDoctor}</Td>
                                <Td style={{ whiteSpace: 'nowrap' }}>
                                    <Badge bg={statusColors.bg} color={statusColors.color}>{r.status}</Badge>
                                </Td>
                            </Tr>
                        )
                    })}
                </tbody>
            </Table>
        );
    };

    return (
        <PageWrapper>
            <PageHeader className="no-print">
                <TitleGroup>
                    <h1>
                        <div className="icon-wrapper">
                            <Clock size={24} />
                        </div>
                        Previous Day Occupancy Report
                    </h1>
                    <p>Historical view of occupied rooms and beds for a specific date at end-of-day.</p>
                </TitleGroup>
                <ActionButtons>
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
                <InputWrapper>
                    <Label><Calendar size={18} style={{ marginRight: '6px' }} /> Target Date</Label>
                    <DatePicker 
                        value={targetDate} 
                        onChange={(date) => setTargetDate(date)} 
                        format="DD-MM-YYYY"
                        allowClear={false}
                        style={{ height: '38px', borderRadius: '8px' }}
                    />
                </InputWrapper>

                <InputWrapper>
                    <Label><Users size={18} style={{ marginRight: '6px' }} /> Admitting Doctor</Label>
                    <Select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="all">All Doctors</option>
                        {doctors.map(doc => (
                            <option key={doc.employeeId} value={doc.employeeName}>
                                {doc.employeeName}
                            </option>
                        ))}
                    </Select>
                </InputWrapper>
 
                <InputWrapper>
                    <Label><Home size={18} style={{ marginRight: '6px' }} /> Room Category</Label>
                    <Input
                        type="text"
                        placeholder="e.g. General, Deluxe"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                </InputWrapper>
                
                <InputWrapper>
                    <Label><Search size={18} style={{ marginRight: '6px' }} /> Quick Search</Label>
                    <Input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputWrapper>
                
                <Button onClick={fetchReport} disabled={loading} style={{ height: '32px' }}>
                    {loading ? <Activity className="animate-spin" size={18} /> : <TrendingUp size={18} />}
                    {loading ? "Processing..." : "Generate Insights"}
                </Button>
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
 
            <GlassCard>
                <ScrollableTableWrapper>
                    {renderTable()}
                    {!loading && reportData.length === 0 && (
                        <EmptyContainer>
                            <div className="icon-container">
                                <Search size={64} />
                            </div>
                            <h3>No Records Found</h3>
                            <p>Adjust your filters and click "Generate Insights" to retrieve the historical data for the selected date.</p>
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
                </ScrollableTableWrapper>
 
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
                    ${PageWrapper} { padding: 0; background: white; }
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
        </PageWrapper>
    );
};

export default PreDayRoomOccupancyReport;
