import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Tooltip, Modal } from "antd";
import dayjs from "dayjs";
import styled, { keyframes } from "styled-components";
import { fetchInsuranceCreditReport } from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    Users,
    Calendar,
    FileText,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    Activity,
    Search,
    Filter,
    BedDouble,
    ShieldCheck,
    IndianRupee,
    Eye,
    X,
    AlertCircle
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
} from "../GlobalStyles";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModernPageContainer = styled(PageWrapper)`
  animation: ${fadeIn} 0.35s ease-out;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 18px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 1.85rem;
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
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.15);
    }
  }

  p {
    color: #64748b;
    margin: 6px 0 0 0;
    font-size: 0.95rem;
    font-weight: 500;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const SecondaryButton = styled.button`
  background: white;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    color: #1e293b;
    background: #f8fafc;
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border-left: 4px solid ${props => props.color || '#0d9488'};

  .icon-box {
    background: ${props => props.lightBg || '#f0fdfa'};
    color: ${props => props.color || '#0d9488'};
    padding: 10px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content-box {
    .label {
        font-size: 0.72rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .value {
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f172a;
        margin-top: 2px;
    }
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: grid;
  grid-template-columns: 1.8fr 1.4fr 1.2fr 1fr;
  gap: 14px;
  align-items: flex-end;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBarWrapper = styled.div`
  background: white;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;

  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    color: #1e293b;
    background: transparent;
  }
`;

const ScrollableTableWrapper = styled(TableWrapper)`
  max-height: 65vh;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;

  thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #004d40;
    color: #ffffff;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 14px;
  }

  tbody td {
    padding: 12px 14px;
    font-size: 0.85rem;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr:hover td {
    background-color: #f8fafc;
  }
`;

const CareStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;

  ${props => {
        if (props.$status === 'IP Admitted') {
            return `background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;`;
        }
        if (props.$status === 'Discharged') {
            return `background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`;
        }
        return `background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`;
    }}
`;

const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;

  ${props => {
        if (props.$status === 'Paid') {
            return `background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;`;
        }
        return `background: #fef3c7; color: #b45309; border: 1px solid #fde68a;`;
    }}
`;

const ViewBtn = styled.button`
  background: #f0fdfa;
  color: #0d9488;
  border: 1px solid #ccfbf1;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;

  &:hover {
    background: #0d9488;
    color: white;
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;

  .info { font-size: 0.85rem; color: #64748b; font-weight: 600; }
  .controls { display: flex; gap: 6px; }
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.$active ? '#0d9488' : '#e2e8f0'};
  background: ${props => props.$active ? '#0d9488' : 'white'};
  color: ${props => props.$active ? 'white' : '#475569'};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) { border-color: #0d9488; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ModalDetailCard = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 14px;

  h4 {
    margin: 0 0 10px 0;
    font-size: 0.82rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    font-size: 0.85rem;

    .item {
      .label { color: #64748b; font-size: 0.75rem; font-weight: 600; }
      .val { color: #0f172a; font-weight: 700; margin-top: 2px; }
    }
  }
`;

const PrintTemplate = styled.div`
  display: none;
  @media print {
    display: block !important;
    background: white;
    width: 100%;
    color: black;
    font-family: Arial, sans-serif;
  }
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const InsuranceCreditReport = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({});
    const [companies, setCompanies] = useState([]);

    // Filters
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [selectedCareStatus, setSelectedCareStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Detail Modal State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
                company_code: selectedCompany !== "all" ? selectedCompany : "",
                care_status: selectedCareStatus !== "all" ? selectedCareStatus : "",
                search: (searchTerm || "").trim()
            };

            const response = await fetchInsuranceCreditReport(params);

            if (response.success) {
                const list = Array.isArray(response.data) ? response.data : [];
                setReportData(list);
                setSummary(response.summary || {});
                if (Array.isArray(response.companies) && response.companies.length > 0) {
                    setCompanies(response.companies);
                }
            } else {
                setReportData([]);
                setSummary({});
                toast.error(response.error || "Failed to fetch report data");
            }
        } catch (error) {
            console.error("Error fetching insurance credit report:", error);
            toast.error("An error occurred while loading the report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, selectedCompany, selectedCareStatus]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportData, searchTerm]);

    const filteredData = useMemo(() => {
        if (!Array.isArray(reportData)) return [];
        if (!searchTerm) return reportData;
        const q = searchTerm.toLowerCase();
        return reportData.filter(item => {
            return (
                (item.uhid || "").toLowerCase().includes(q) ||
                (item.ip_number || "").toLowerCase().includes(q) ||
                (item.patient_name || "").toLowerCase().includes(q) ||
                (item.mobile || "").toLowerCase().includes(q) ||
                (item.company_name || "").toLowerCase().includes(q) ||
                (item.op_bill_number || "").toLowerCase().includes(q) ||
                (item.room_no || "").toString().includes(q)
            );
        });
    }, [reportData, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleExportExcel = () => {
        if (filteredData.length === 0) {
            toast.warning("No data available to export");
            return;
        }

        const fileName = `Insurance_Credit_Report_${dayjs().format('YYYYMMDD')}.xlsx`;
        const exportData = filteredData.map((r, idx) => ({
            "Sl No": idx + 1,
            "UHID": r.uhid,
            "Patient Name": r.patient_name,
            "Age/Gender": r.age_gender,
            "Mobile": r.mobile,
            "Insurance Company": r.company_name,
            "Care Status": r.care_status,
            "IP Number": r.ip_number !== '-' ? r.ip_number : '',
            "Room No": r.room_no !== '-' ? r.room_no : '',
            "Bed No": r.bed_no !== '-' ? r.bed_no : '',
            "Room Category": r.room_category !== '-' ? r.room_category : '',
            "Admission Date": r.admission_date !== '-' ? r.admission_date : '',
            "Admitting Doctor": r.admitting_doctor !== 'N/A' ? r.admitting_doctor : '',
            "OP Bill No": r.op_bill_number !== '-' ? r.op_bill_number : '',
            "Consulting Doctor": r.consulting_doctor,
            "OP / Reg Fee (₹)": r.op_total_fees,
            "Investigation Count": r.investigation_count,
            "Investigation Total (₹)": r.investigation_total,
            "Total Credit Amount (₹)": r.total_credit_amount,
            "Payment Status": r.payment_status,
            "Payment Method": r.payment_method || 'Insurance Credit'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Insurance & Credit Report");
        XLSX.writeFile(wb, fileName);
        toast.success("Excel report exported successfully");
    };

    const handlePrint = () => {
        window.print();
    };

    const openDetailModal = (patient) => {
        setSelectedPatient(patient);
        setIsDetailModalOpen(true);
    };

    return (
        <ModernPageContainer>
            {/* Screen View */}
            <div className="no-print">
                <PageHeader>
                    <TitleGroup>
                        <h1>
                            <span className="icon-wrapper"><ShieldCheck size={26} /></span>
                            Insurance & Credit Billing Report
                        </h1>
                        <p>Track insurance credit bills, active inpatient room occupancy, and lab investigations</p>
                    </TitleGroup>

                    <ActionButtons>
                        <SecondaryButton onClick={handleExportExcel}>
                            <Download size={15} /> Export Excel
                        </SecondaryButton>
                        <SecondaryButton onClick={handlePrint}>
                            <Printer size={15} /> Print Report
                        </SecondaryButton>
                    </ActionButtons>
                </PageHeader>

                {/* Top Statistics Cards */}
                <StatsGrid>
                    <StatCard color="#0284c7" lightBg="#e0f2fe">
                        <div className="icon-box"><Users size={20} /></div>
                        <div className="content-box">
                            <div className="label">Credit Patients</div>
                            <div className="value">{summary.total_patients || 0}</div>
                        </div>
                    </StatCard>

                    <StatCard color="#7c3aed" lightBg="#ede9fe">
                        <div className="icon-box"><BedDouble size={20} /></div>
                        <div className="content-box">
                            <div className="label">Active Inpatients (Beds)</div>
                            <div className="value">{summary.active_inpatients || 0}</div>
                        </div>
                    </StatCard>

                    <StatCard color="#059669" lightBg="#d1fae5">
                        <div className="icon-box"><FileText size={20} /></div>
                        <div className="content-box">
                            <div className="label">OP / Reg Credit</div>
                            <div className="value">₹{(summary.total_op_credit || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </StatCard>

                    <StatCard color="#ea580c" lightBg="#ffedd5">
                        <div className="icon-box"><Activity size={20} /></div>
                        <div className="content-box">
                            <div className="label">Investigation Credit</div>
                            <div className="value">₹{(summary.total_investigation_credit || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </StatCard>

                    <StatCard color="#047857" lightBg="#ecfdf5">
                        <div className="icon-box"><IndianRupee size={20} /></div>
                        <div className="content-box">
                            <div className="label">Total Credit Value</div>
                            <div className="value">₹{(summary.total_credit_exposure || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </StatCard>
                </StatsGrid>

                {/* Filter Toolbar */}
                <FilterSection style={{ marginTop: '14px' }}>
                    <InputWrapper>
                        <Label><Calendar size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Date Range</Label>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => { if (dates) setDateRange(dates); }}
                            style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                            format="DD-MM-YYYY"
                        />
                    </InputWrapper>

                    <InputWrapper>
                        <Label><ShieldCheck size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Insurance Company / TPA</Label>
                        <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                            <option value="all">All Insurance / TPA Companies</option>
                            {companies.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </Select>
                    </InputWrapper>

                    <InputWrapper>
                        <Label><Filter size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Care Status</Label>
                        <Select value={selectedCareStatus} onChange={(e) => setSelectedCareStatus(e.target.value)}>
                            <option value="all">All Care Types</option>
                            <option value="ip_admitted">IP Admitted (Occupying Beds)</option>
                            <option value="op_visit">OP Outpatient Visits</option>
                            <option value="discharged">Discharged Patients</option>
                        </Select>
                    </InputWrapper>

                    <InputWrapper>
                        <Label><Search size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> Search Patient / Bill</Label>
                        <SearchBarWrapper>
                            <Search size={15} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="UHID, IP, Name, Phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm("")} />
                            )}
                        </SearchBarWrapper>
                    </InputWrapper>
                </FilterSection>

                {/* Data Table */}
                <ScrollableTableWrapper style={{ marginTop: '16px' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th style={{ width: 45 }}>#</Th>
                                <Th>Patient Details</Th>
                                <Th>Insurance / TPA</Th>
                                <Th style={{ textAlign: 'center' }}>Care Status</Th>
                                <Th>Room & Bed Occupancy</Th>
                                <Th style={{ textAlign: 'right' }}>OP / Reg (₹)</Th>
                                <Th style={{ textAlign: 'right' }}>Investigations (₹)</Th>
                                <Th style={{ textAlign: 'right' }}>Total Credit (₹)</Th>
                                <Th style={{ textAlign: 'center' }}>Status</Th>
                                <Th style={{ textAlign: 'center' }}>Action</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        <Activity size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                                        Loading insurance and credit billing records...
                                    </Td>
                                </Tr>
                            ) : paginatedData.length === 0 ? (
                                <Tr>
                                    <Td colSpan={10} style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                        <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                                        No insurance or credit records found for the selected filters.
                                    </Td>
                                </Tr>
                            ) : (
                                paginatedData.map((row, idx) => (
                                    <Tr key={row.uhid || idx}>
                                        <Td style={{ color: '#94a3b8', fontWeight: 600 }}>
                                            {(currentPage - 1) * pageSize + idx + 1}
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.patient_name}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                                                <span style={{ fontWeight: 600, color: '#0d9488' }}>{row.uhid}</span> · {row.age_gender} · {row.mobile}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{row.company_name}</div>
                                            {row.company_code && (
                                                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Code: {row.company_code}</div>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <CareStatusBadge $status={row.care_status}>
                                                {row.care_status === 'IP Admitted' && <BedDouble size={12} />}
                                                {row.care_status}
                                            </CareStatusBadge>
                                        </Td>
                                        <Td>
                                            {row.is_currently_admitted || row.room_no !== '-' ? (
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        Room {row.room_no} · Bed {row.bed_no}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                        {row.room_category} · {row.block}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                        IP: {row.ip_number} · Dr. {row.admitting_doctor}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1' }}>—</span>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                                ₹{row.op_total_fees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            {row.op_bill_number !== '-' && (
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bill: {row.op_bill_number}</div>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#ea580c' }}>
                                                ₹{row.investigation_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            {row.investigation_count > 0 && (
                                                <Tooltip title={row.investigation_tests.join(', ')}>
                                                    <span style={{ fontSize: '0.72rem', color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>
                                                        {row.investigation_count} tests
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#047857' }}>
                                                ₹{row.total_credit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <PaymentBadge $status={row.payment_status}>
                                                {row.payment_status}
                                            </PaymentBadge>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <ViewBtn onClick={() => openDetailModal(row)} title="View Itemized Breakdown">
                                                <Eye size={13} /> View
                                            </ViewBtn>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </ScrollableTableWrapper>

                {/* Pagination */}
                {filteredData.length > pageSize && (
                    <PaginationBar style={{ marginTop: '14px' }}>
                        <div className="info">
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                        </div>
                        <div className="controls">
                            <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft size={14} /> Prev
                            </PageButton>
                            <PageButton $active>{currentPage}</PageButton>
                            <PageButton onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * pageSize >= filteredData.length}>
                                Next <ChevronRight size={14} />
                            </PageButton>
                        </div>
                    </PaginationBar>
                )}
            </div>

            {/* DETAIL BREAKDOWN MODAL */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={20} color="#0d9488" />
                        <span>Insurance Patient Billing Breakdown</span>
                    </div>
                }
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                {selectedPatient && (
                    <div style={{ paddingTop: '8px' }}>
                        {/* Patient & Insurance Header Card */}
                        <ModalDetailCard>
                            <h4><Users size={14} /> Patient & Insurance Information</h4>
                            <div className="grid">
                                <div className="item">
                                    <div className="label">Patient Name</div>
                                    <div className="val">{selectedPatient.patient_name}</div>
                                </div>
                                <div className="item">
                                    <div className="label">UHID</div>
                                    <div className="val" style={{ color: '#0d9488' }}>{selectedPatient.uhid}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Age / Gender</div>
                                    <div className="val">{selectedPatient.age_gender}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Mobile</div>
                                    <div className="val">{selectedPatient.mobile}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Insurance / TPA Company</div>
                                    <div className="val" style={{ color: '#0284c7' }}>{selectedPatient.company_name}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Payment / Claim Status</div>
                                    <div className="val">
                                        <PaymentBadge $status={selectedPatient.payment_status}>
                                            {selectedPatient.payment_status}
                                        </PaymentBadge>
                                    </div>
                                </div>
                            </div>
                        </ModalDetailCard>

                        {/* Room Occupancy Card (if IP) */}
                        {selectedPatient.room_no !== '-' && (
                            <ModalDetailCard>
                                <h4><BedDouble size={14} /> Inpatient Room Occupancy Details</h4>
                                <div className="grid">
                                    <div className="item">
                                        <div className="label">IP Number</div>
                                        <div className="val">{selectedPatient.ip_number}</div>
                                    </div>
                                    <div className="item">
                                        <div className="label">Room / Bed</div>
                                        <div className="val" style={{ color: '#7c3aed' }}>
                                            Room {selectedPatient.room_no} · Bed {selectedPatient.bed_no}
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="label">Ward / Category</div>
                                        <div className="val">{selectedPatient.room_category} ({selectedPatient.block})</div>
                                    </div>
                                    <div className="item">
                                        <div className="label">Admission Date</div>
                                        <div className="val">{selectedPatient.admission_date}</div>
                                    </div>
                                    <div className="item">
                                        <div className="label">Admitting Doctor</div>
                                        <div className="val">{selectedPatient.admitting_doctor}</div>
                                    </div>
                                    <div className="item">
                                        <div className="label">Current Status</div>
                                        <div className="val">
                                            <CareStatusBadge $status={selectedPatient.care_status}>
                                                {selectedPatient.care_status}
                                            </CareStatusBadge>
                                        </div>
                                    </div>
                                </div>
                            </ModalDetailCard>
                        )}

                        {/* Financial Summary Breakdown */}
                        <ModalDetailCard>
                            <h4><IndianRupee size={14} /> Charge Summary Breakdown</h4>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                <div className="item">
                                    <div className="label">OP / Registration Fee</div>
                                    <div className="val">₹{selectedPatient.op_total_fees.toFixed(2)}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Investigation Charges</div>
                                    <div className="val" style={{ color: '#ea580c' }}>₹{selectedPatient.investigation_total.toFixed(2)}</div>
                                </div>
                                <div className="item">
                                    <div className="label">Total Credit / Claim</div>
                                    <div className="val" style={{ color: '#047857', fontSize: '1.1rem' }}>
                                        ₹{selectedPatient.total_credit_amount.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </ModalDetailCard>

                        {/* List of Investigations if any */}
                        {selectedPatient.investigation_tests && selectedPatient.investigation_tests.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                    ORDERED INVESTIGATION TESTS ({selectedPatient.investigation_count})
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {selectedPatient.investigation_tests.map((t, i) => (
                                        <span key={i} style={{ background: '#f1f5f9', color: '#1e293b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', border: '1px solid #e2e8f0' }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* PRINT TEMPLATE (Auto-rendered during window.print()) */}
            <PrintTemplate>
                <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>SHANMUGA HOSPITAL LIMITED</h2>
                    <p style={{ margin: '4px 0', fontSize: '12px' }}>51/24, Saradha College Road, Salem - 636007</p>
                    <p style={{ margin: '2px 0', fontSize: '11px' }}>CIN: L85110TZ2020PLC033974 | GST No: 33ABDCS8326A1ZP</p>
                    <h3 style={{ margin: '10px 0 0 0', textDecoration: 'underline', textTransform: 'uppercase' }}>
                        INSURANCE & CREDIT BILLING STATEMENT
                    </h3>
                    <p style={{ margin: '4px 0', fontSize: '11px', color: '#555' }}>
                        Period: {dateRange[0].format("DD-MM-YYYY")} to {dateRange[1].format("DD-MM-YYYY")} | Generated on: {dayjs().format("DD-MM-YYYY HH:mm")}
                    </p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '14px' }}>
                    <tbody>
                        <tr>
                            <td><b>Total Credit Patients:</b> {summary.total_patients || 0}</td>
                            <td><b>Active Inpatients (Beds):</b> {summary.active_inpatients || 0}</td>
                            <td><b>Total OP Credit:</b> ₹{(summary.total_op_credit || 0).toFixed(2)}</td>
                            <td><b>Total Investigation Credit:</b> ₹{(summary.total_investigation_credit || 0).toFixed(2)}</td>
                            <td><b>Total Claim Value:</b> ₹{(summary.total_credit_exposure || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }} border="1">
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '4px' }}>#</th>
                            <th style={{ padding: '4px' }}>UHID</th>
                            <th style={{ padding: '4px' }}>Patient Name</th>
                            <th style={{ padding: '4px' }}>Insurance / TPA</th>
                            <th style={{ padding: '4px' }}>Status</th>
                            <th style={{ padding: '4px' }}>Room/Bed</th>
                            <th style={{ padding: '4px', textAlign: 'right' }}>OP (₹)</th>
                            <th style={{ padding: '4px', textAlign: 'right' }}>Invest (₹)</th>
                            <th style={{ padding: '4px', textAlign: 'right' }}>Total (₹)</th>
                            <th style={{ padding: '4px' }}>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '4px', textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ padding: '4px' }}>{row.uhid}</td>
                                <td style={{ padding: '4px' }}>{row.patient_name}</td>
                                <td style={{ padding: '4px' }}>{row.company_name}</td>
                                <td style={{ padding: '4px', textAlign: 'center' }}>{row.care_status}</td>
                                <td style={{ padding: '4px' }}>{row.room_no !== '-' ? `${row.room_no}/${row.bed_no}` : '-'}</td>
                                <td style={{ padding: '4px', textAlign: 'right' }}>{row.op_total_fees.toFixed(2)}</td>
                                <td style={{ padding: '4px', textAlign: 'right' }}>{row.investigation_total.toFixed(2)}</td>
                                <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{row.total_credit_amount.toFixed(2)}</td>
                                <td style={{ padding: '4px', textAlign: 'center' }}>{row.payment_status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <div style={{ borderTop: '1px solid black', width: '180px', textAlign: 'center', paddingTop: '4px' }}>
                        TPA Desk / Billing Executive
                    </div>
                    <div style={{ borderTop: '1px solid black', width: '180px', textAlign: 'center', paddingTop: '4px' }}>
                        Accounts Manager
                    </div>
                </div>
            </PrintTemplate>
        </ModernPageContainer>
    );
};

export default InsuranceCreditReport;
