import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Clock,
  Calendar,
  UserCheck,
  UserX,
  Users,
  Bed,
  Stethoscope,
  TrendingUp,
  Flame,
  ArrowRight,
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  FileText,
  Building,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ==========================================
// STYLED COMPONENTS (AESTHETIC HEALTHCARE UI)
// ==========================================

const DashboardWrapper = styled.div`
  padding: 16px 20px 40px;
  background: #f8fafc;
  min-height: calc(100vh - 70px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;

  .left-heading {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }

    h1 {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 0.8rem;
      color: #64748b;
      margin: 2px 0 0 0;
      font-weight: 500;
    }
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$variant === 'outline' ? '#ffffff' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'};
  color: ${props => props.$variant === 'outline' ? '#0f766e' : '#ffffff'};
  border: ${props => props.$variant === 'outline' ? '1px solid #99f6e4' : 'none'};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$variant === 'outline' ? 'none' : '0 2px 6px rgba(13, 148, 136, 0.2)'};

  &:hover {
    transform: translateY(-1px);
    background: ${props => props.$variant === 'outline' ? '#f0fdfa' : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'};
    box-shadow: ${props => props.$variant === 'outline' ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.3)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterBar = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .preset-pills {
    display: flex;
    gap: 4px;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
  }

  .date-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 0.78rem;
    color: #334155;

    input[type="date"] {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.78rem;
      font-weight: 600;
      color: #0f172a;
    }
  }

  select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    font-size: 0.78rem;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: #0d9488;
      background: #ffffff;
    }
  }
`;

const PresetBtn = styled.button`
  border: none;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#0d9488' : '#64748b'};
  font-weight: ${props => props.$active ? '800' : '600'};
  font-size: 0.74rem;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'};
  transition: all 0.15s ease;

  &:hover {
    color: #0d9488;
  }
`;

const HeroKpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
`;

const KpiCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  }

  .top-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .label {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: ${props => props.$iconBg || '#f0fdfa'};
      color: ${props => props.$iconColor || '#0d9488'};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .main-metric {
    font-size: 1.65rem;
    font-weight: 900;
    color: ${props => props.$valColor || '#0f172a'};
    line-height: 1.1;
    margin-bottom: 4px;
  }

  .sub-desc {
    font-size: 0.74rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;

    strong {
      color: #0f172a;
      font-weight: 700;
    }
  }

  .card-progress {
    margin-top: 10px;
    height: 4px;
    background: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;

    .bar {
      height: 100%;
      background: ${props => props.$barColor || '#0d9488'};
      width: ${props => props.$pct || '0%'};
    }
  }
`;

const ContentTabsNav = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
`;

const NavTab = styled.button`
  background: transparent;
  border: none;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: ${props => props.$active ? '800' : '600'};
  color: ${props => props.$active ? '#0d9488' : '#64748b'};
  border-bottom: 3px solid ${props => props.$active ? '#0d9488' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  .count-chip {
    background: ${props => props.$active ? '#ccfbf1' : '#f1f5f9'};
    color: ${props => props.$active ? '#0f766e' : '#64748b'};
    font-size: 0.7rem;
    font-weight: 800;
    padding: 1px 7px;
    border-radius: 12px;
  }

  &:hover {
    color: #0d9488;
  }
`;

const VisualAnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title-group {
      h3 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      p {
        margin: 2px 0 0 0;
        font-size: 0.74rem;
        color: #64748b;
      }
    }

    .peak-tag {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #fde68a;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const HourlyBarsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
  padding-top: 20px;
  overflow-x: auto;
  scrollbar-width: thin;
`;

const HourBarColumn = styled.div`
  flex: 1;
  min-width: 22px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;

  .bar-fill {
    width: 100%;
    max-width: 18px;
    border-radius: 4px 4px 0 0;
    background: ${props => props.$isPeak ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : props.$hasNotes ? 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)' : '#e2e8f0'};
    height: ${props => props.$height || '4px'};
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;

    &:hover::after {
      content: '${props => props.$tooltip}';
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: white;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  }

  .hour-text {
    font-size: 0.65rem;
    font-weight: 700;
    color: ${props => props.$isPeak ? '#d97706' : '#94a3b8'};
    writing-mode: ${props => props.$dense ? 'vertical-lr' : 'horizontal-tb'};
    transform: ${props => props.$dense ? 'rotate(180deg)' : 'none'};
    white-space: nowrap;
  }
`;

const LoadListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
`;

const LoadItemCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .doctor-name {
      font-size: 0.82rem;
      font-weight: 800;
      color: #0f172a;
    }

    .count-badge {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #ccfbf1;
      color: #0f766e;
    }
  }

  .row-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 600;

    .stat-seen { color: #166534; }
    .stat-pending { color: #b45309; }
    .stat-tat { color: #0f766e; }
  }

  .prog-track {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;

    .prog-fill {
      height: 100%;
      background: #0d9488;
      width: ${props => props.$pct || '0%'};
    }
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow: hidden;

  .table-top-bar {
    padding: 12px 16px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    .search-input {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      width: 280px;

      input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 0.78rem;
        width: 100%;
      }
    }
  }

  .table-responsive {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    text-align: left;

    thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;

      th {
        padding: 10px 14px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
        font-size: 0.7rem;
        letter-spacing: 0.03em;
        white-space: nowrap;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #f1f5f9;
        transition: background 0.15s ease;

        &:hover {
          background: #f8fafc;
        }

        td {
          padding: 10px 14px;
          color: #1e293b;
          vertical-align: middle;
          white-space: nowrap;
        }
      }
    }
  }
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  background: ${props => props.$seen ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.$seen ? '#166534' : '#92400e'};
  border: 1px solid ${props => props.$seen ? '#bbf7d0' : '#fde68a'};
`;

const PatientGridCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(13, 148, 136, 0.08);
  }

  .top-patient-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .patient-main {
      .name {
        font-size: 0.88rem;
        font-weight: 800;
        color: #0f172a;
      }
      .meta {
        font-size: 0.72rem;
        color: #64748b;
        font-weight: 600;
      }
    }
  }

  .details-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .chip {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 3px;

      &.room {
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
      }

      &.doc {
        background: #f0fdfa;
        color: #0f766e;
        border: 1px solid #99f6e4;
      }
    }
  }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
    margin-top: 2px;

    .time-info {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
    }
  }
`;

// ==========================================
// MAIN COMPONENT
// ==========================================

const IPDoctorDashboard = ({ defaultTab = 'overview' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab state
  const [activeTab, setActiveTab] = useState(defaultTab); // 'overview' | 'live_rounds' | 'report'

  // Filter states
  const todayStr = new Date().toISOString().slice(0, 10);
  const [datePreset, setDatePreset] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Search & Filter for tables
  const [searchQuery, setSearchQuery] = useState('');
  const [liveRoundFilter, setLiveRoundFilter] = useState('all'); // 'all' | 'seen' | 'pending'

  // Data states
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch Dashboard Analytics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedDoctor) params.append('doctor_id', selectedDoctor);
      if (selectedDepartment) params.append('department', selectedDepartment);

      const res = await apiRequest(`${HmsBaseUrl}IPEMR_doctor_dashboard_analytics/?${params.toString()}`, 'GET');
      if (res && (res.status === 'success' || res.data)) {
        setDashboardData(res.data || res);
      } else {
        toast.error(res?.message || 'Failed to load analytics data.');
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      toast.error('An error occurred while loading dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFrom, dateTo, selectedDoctor, selectedDepartment]);

  // Handle Preset Date changes
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'today') {
      const d = now.toISOString().slice(0, 10);
      setDateFrom(d);
      setDateTo(d);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const d = y.toISOString().slice(0, 10);
      setDateFrom(d);
      setDateTo(d);
    } else if (preset === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setDateFrom(w.toISOString().slice(0, 10));
      setDateTo(now.toISOString().slice(0, 10));
    } else if (preset === 'month') {
      const m = new Date(now);
      m.setDate(1);
      setDateFrom(m.toISOString().slice(0, 10));
      setDateTo(now.toISOString().slice(0, 10));
    }
  };

  const kpis = dashboardData?.kpis || {};
  const firstPatient = dashboardData?.first_patient_seen;
  const lastPatient = dashboardData?.last_patient_seen;
  const peakHours = dashboardData?.peak_hours_distribution || [];
  const doctorLoad = dashboardData?.doctor_load_analysis || [];
  const allPatients = dashboardData?.all_patient_report || [];

  // Filtered Patient List for Table / Live Cards
  const filteredPatients = useMemo(() => {
    let list = allPatients;
    if (liveRoundFilter === 'seen') {
      list = list.filter(p => p.is_seen);
    } else if (liveRoundFilter === 'pending') {
      list = list.filter(p => !p.is_seen);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(p =>
      (p.patient_name || '').toLowerCase().includes(q) ||
      (p.uhid || '').toLowerCase().includes(q) ||
      (p.ip_number || '').toLowerCase().includes(q) ||
      (p.doctor_name || '').toLowerCase().includes(q) ||
      (p.room_no || '').toLowerCase().includes(q)
    );
  }, [allPatients, liveRoundFilter, searchQuery]);

  // Navigate to Doctor EMR Desk with specific patient
  const handleOpenPatientEMR = (patient) => {
    navigate('/IPEMRDesk', {
      state: {
        patient: {
          uhid: patient.uhid,
          ip_number: patient.ip_number,
          patient_name: patient.patient_name
        }
      }
    });
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    if (!allPatients.length) {
      toast.info("No data available to export.");
      return;
    }
    const headers = [
      "S.No",
      "Patient Name",
      "UHID",
      "IP Number",
      "Room",
      "Bed",
      "Doctor",
      "Department",
      "Admission Date",
      "Status",
      "First Note Time",
      "Latest Note Time",
      "Note Type",
      "TAT (Mins)"
    ];
    const rows = allPatients.map((p, idx) => [
      idx + 1,
      `"${p.patient_name || ''}"`,
      `"${p.uhid || ''}"`,
      `"${p.ip_number || ''}"`,
      `"${p.room_no || ''}"`,
      `"${p.bed_no || ''}"`,
      `"${p.doctor_name || ''}"`,
      `"${p.department || ''}"`,
      `"${p.admission_date_formatted || ''}"`,
      p.is_seen ? "Seen" : "Pending",
      `"${p.first_note_time_formatted || '-'}"`,
      `"${p.latest_note_time_formatted || '-'}"`,
      `"${p.latest_note_type || '-'}"`,
      p.tat_minutes !== null ? p.tat_minutes : "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IP_Doctor_EMR_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  // Print Table
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <DashboardWrapper>
      {/* ── 1. Top Header ── */}
      <HeaderSection>
        <div className="left-heading">
          <div className="icon-box">
            <Activity size={22} />
          </div>
          <div>
            <h1>Inpatient Doctor EMR Dashboard & Analytics</h1>
            <p>Real-time Turnaround Time (TAT), Patient Rounding Progress & Clinical Performance</p>
          </div>
        </div>

        <div className="right-actions">
          <PrimaryBtn $variant="outline" onClick={() => navigate('/IPEMRDesk')}>
            <Stethoscope size={14} /> Open Doctor EMR Desk <ArrowRight size={13} />
          </PrimaryBtn>
          <PrimaryBtn onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </PrimaryBtn>
        </div>
      </HeaderSection>

      {/* ── 2. Filter Bar ── */}
      <FilterBar>
        <div className="filter-group">
          <div className="preset-pills">
            <PresetBtn $active={datePreset === 'today'} onClick={() => handlePresetChange('today')}>Today</PresetBtn>
            <PresetBtn $active={datePreset === 'yesterday'} onClick={() => handlePresetChange('yesterday')}>Yesterday</PresetBtn>
            <PresetBtn $active={datePreset === 'week'} onClick={() => handlePresetChange('week')}>Past 7 Days</PresetBtn>
            <PresetBtn $active={datePreset === 'month'} onClick={() => handlePresetChange('month')}>This Month</PresetBtn>
            <PresetBtn $active={datePreset === 'custom'} onClick={() => setDatePreset('custom')}>Custom</PresetBtn>
          </div>

          <div className="date-input-wrap">
            <Calendar size={13} color="#0d9488" />
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); }}
            />
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); }}
            />
          </div>
        </div>

        <div className="filter-group">
          <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
            <option value="">All Doctors</option>
            {doctorLoad.map(d => (
              <option key={d.doctor_id || d.doctor_name} value={d.doctor_id || d.doctor_name}>
                {d.doctor_name} ({d.total_patients} Pts)
              </option>
            ))}
          </select>

          <PrimaryBtn $variant="outline" onClick={handleExportCSV}>
            <Download size={13} /> CSV Export
          </PrimaryBtn>
          <PrimaryBtn $variant="outline" onClick={handlePrintReport}>
            <Printer size={13} /> Print
          </PrimaryBtn>
        </div>
      </FilterBar>

      {/* ── 3. Hero KPI Metric Cards ── */}
      <HeroKpiGrid>
        {/* Overall TAT */}
        <KpiCard $iconBg="#f0fdfa" $iconColor="#0d9488" $valColor="#0f766e" $barColor="#0d9488" $pct="85%">
          <div className="top-meta">
            <span className="label">Overall Avg TAT</span>
            <div className="icon-badge"><Clock size={16} /></div>
          </div>
          <div className="main-metric">{kpis.overall_avg_tat_formatted || '-'}</div>
          <div className="sub-desc">
            Admission to First Clinical Note · <strong>Median: {kpis.median_tat_minutes ? `${Math.round(kpis.median_tat_minutes/60)}h` : '-'}</strong>
          </div>
          <div className="card-progress"><div className="bar" /></div>
        </KpiCard>

        {/* First Patient Seen Today */}
        <KpiCard $iconBg="#fef3c7" $iconColor="#d97706" $valColor="#b45309">
          <div className="top-meta">
            <span className="label">First Patient Seen</span>
            <div className="icon-badge"><Sun size={16} /></div>
          </div>
          <div className="main-metric" style={{ fontSize: '1.4rem' }}>
            {firstPatient?.note_time_formatted || 'Not started'}
          </div>
          <div className="sub-desc">
            {firstPatient ? (
              <span><strong>{firstPatient.patient_name}</strong> (R-{firstPatient.room_no || '-'})</span>
            ) : 'No rounds charted yet'}
          </div>
        </KpiCard>

        {/* Last Patient Seen Today */}
        <KpiCard $iconBg="#ede9fe" $iconColor="#7c3aed" $valColor="#6d28d9">
          <div className="top-meta">
            <span className="label">Last Patient Seen</span>
            <div className="icon-badge"><Moon size={16} /></div>
          </div>
          <div className="main-metric" style={{ fontSize: '1.4rem' }}>
            {lastPatient?.note_time_formatted || 'Not recorded'}
          </div>
          <div className="sub-desc">
            {lastPatient ? (
              <span><strong>{lastPatient.patient_name}</strong> · Span: {kpis.rounding_span_formatted}</span>
            ) : 'Awaiting clinical notes'}
          </div>
        </KpiCard>

        {/* Admissions Today */}
        <KpiCard $iconBg="#eff6ff" $iconColor="#2563eb" $valColor="#1d4ed8">
          <div className="top-meta">
            <span className="label">Admissions Today</span>
            <div className="icon-badge"><Bed size={16} /></div>
          </div>
          <div className="main-metric">{kpis.admissions_today ?? 0}</div>
          <div className="sub-desc">
            Total Active Inpatients: <strong>{kpis.total_active_admitted ?? 0}</strong>
          </div>
        </KpiCard>

        {/* Seen vs Pending Live Progress */}
        <KpiCard $iconBg="#dcfce7" $iconColor="#16a34a" $valColor="#15803d" $barColor="#16a34a" $pct={`${kpis.rounding_completion_pct || 0}%`}>
          <div className="top-meta">
            <span className="label">Rounding Progress</span>
            <div className="icon-badge"><UserCheck size={16} /></div>
          </div>
          <div className="main-metric">{kpis.seen_patients_count ?? 0} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {kpis.total_active_admitted ?? 0}</span></div>
          <div className="sub-desc">
            <strong>{kpis.rounding_completion_pct || 0}%</strong> Completed · <strong>{kpis.pending_patients_count ?? 0}</strong> Pending
          </div>
          <div className="card-progress"><div className="bar" /></div>
        </KpiCard>
      </HeroKpiGrid>

      {/* ── 4. Content Navigation Tabs ── */}
      <ContentTabsNav>
        <NavTab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <BarChart2 size={15} /> Analytics & Visual Insights
        </NavTab>
        <NavTab $active={activeTab === 'live_rounds'} onClick={() => setActiveTab('live_rounds')}>
          <Users size={15} /> Seen vs. Pending Patients Live Board
          <span className="count-chip">{kpis.total_active_admitted ?? 0}</span>
        </NavTab>
        <NavTab $active={activeTab === 'report'} onClick={() => setActiveTab('report')}>
          <FileText size={15} /> Comprehensive Clinical Report Table
        </NavTab>
      </ContentTabsNav>

      {/* ── TAB 1: ANALYTICS & VISUAL INSIGHTS ── */}
      {activeTab === 'overview' && (
        <>
          <VisualAnalyticsGrid>
            {/* Peak Hours Distribution Chart */}
            <ChartCard>
              <div className="chart-header">
                <div className="title-group">
                  <h3><Flame size={16} color="#d97706" /> Peak Rounding Hours Distribution</h3>
                  <p>Hourly density of doctor clinical consultation notes written across 24 hours</p>
                </div>
                <div className="peak-tag">
                  <Sparkles size={12} /> Peak: {kpis.peak_hour} ({kpis.peak_hour_count} notes)
                </div>
              </div>

              {/* Hourly Histogram Bars */}
              <HourlyBarsContainer>
                {peakHours.map((hObj) => {
                  const maxCount = Math.max(...peakHours.map(p => p.count), 1);
                  const barHeightPct = hObj.count > 0 ? `${Math.max(12, Math.round((hObj.count / maxCount) * 100))}%` : '4px';
                  const isPeak = hObj.count > 0 && hObj.count === kpis.peak_hour_count;

                  return (
                    <HourBarColumn
                      key={hObj.hour}
                      $isPeak={isPeak}
                      $dense={peakHours.length > 12}
                    >
                      <div
                        className="bar-fill"
                        style={{ height: barHeightPct }}
                        $isPeak={isPeak}
                        $hasNotes={hObj.count > 0}
                        $tooltip={`${hObj.label}: ${hObj.count} notes written`}
                      />
                      <span className="hour-text">{hObj.label}</span>
                    </HourBarColumn>
                  );
                })}
              </HourlyBarsContainer>
            </ChartCard>

            {/* Doctor Load Analysis */}
            <ChartCard>
              <div className="chart-header">
                <div className="title-group">
                  <h3><Stethoscope size={16} color="#0d9488" /> Doctor Patient Load</h3>
                  <p>Inpatient distribution, rounds completion & TAT</p>
                </div>
              </div>

              <LoadListContainer>
                {doctorLoad.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No doctor assignments recorded in this period.
                  </div>
                ) : (
                  doctorLoad.map((doc, idx) => (
                    <LoadItemCard key={doc.doctor_id || idx} $pct={`${doc.completion_rate}%`}>
                      <div className="row-top">
                        <span className="doctor-name">{doc.doctor_name}</span>
                        <span className="count-badge">{doc.total_patients} Patients</span>
                      </div>
                      <div className="row-stats">
                        <span className="stat-seen">✓ {doc.seen_patients} Seen</span>
                        <span className="stat-pending">⏳ {doc.pending_patients} Pending</span>
                        <span className="stat-tat">Avg TAT: {doc.avg_tat_formatted}</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{ width: `${doc.completion_rate}%` }} />
                      </div>
                    </LoadItemCard>
                  ))
                )}
              </LoadListContainer>
            </ChartCard>
          </VisualAnalyticsGrid>

          {/* TAT Buckets & Department Distribution Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* TAT Bucket Distribution */}
            <ChartCard>
              <div className="chart-header">
                <div className="title-group">
                  <h3><Clock size={16} color="#0d9488" /> Turnaround Time (TAT) Brackets</h3>
                  <p>Time from admission to first doctor consultation</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Under 1 Hour (Fast Track)', count: kpis.tat_buckets?.under_1hr || 0, color: '#16a34a' },
                  { label: '1 - 3 Hours (Optimal)', count: kpis.tat_buckets?.['1_to_3hrs'] || 0, color: '#0d9488' },
                  { label: '3 - 6 Hours (Moderate)', count: kpis.tat_buckets?.['3_to_6hrs'] || 0, color: '#eab308' },
                  { label: 'Over 6 Hours (Delayed)', count: kpis.tat_buckets?.over_6hrs || 0, color: '#dc2626' }
                ].map((b, i) => {
                  const total = Object.values(kpis.tat_buckets || {}).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((b.count / total) * 100);

                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: '3px' }}>
                        <span style={{ color: '#334155' }}>{b.label}</span>
                        <span style={{ color: b.color }}>{b.count} Pts ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: b.color, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            {/* Department Breakdown */}
            <ChartCard>
              <div className="chart-header">
                <div className="title-group">
                  <h3><Building size={16} color="#0d9488" /> Department Inpatient Load</h3>
                  <p>Active admissions across specialties</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(dashboardData?.department_load_analysis || []).map((dept, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{dept.department}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#166534', fontWeight: 700 }}>{dept.seen} Seen</span>
                      <span style={{ color: '#b45309', fontWeight: 700 }}>{dept.pending} Pending</span>
                      <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{dept.total} Total</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* ── TAB 2: SEEN VS PENDING LIVE ROUNDS BOARD ── */}
      {activeTab === 'live_rounds' && (
        <div>
          {/* Live Board Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <PrimaryBtn
                $variant={liveRoundFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setLiveRoundFilter('all')}
              >
                All Inpatients ({allPatients.length})
              </PrimaryBtn>
              <PrimaryBtn
                $variant={liveRoundFilter === 'seen' ? 'primary' : 'outline'}
                onClick={() => setLiveRoundFilter('seen')}
                style={{ borderColor: '#86efac', color: liveRoundFilter === 'seen' ? '#ffffff' : '#166534', background: liveRoundFilter === 'seen' ? '#16a34a' : 'white' }}
              >
                <UserCheck size={14} /> Seen Today ({kpis.seen_patients_count || 0})
              </PrimaryBtn>
              <PrimaryBtn
                $variant={liveRoundFilter === 'pending' ? 'primary' : 'outline'}
                onClick={() => setLiveRoundFilter('pending')}
                style={{ borderColor: '#fde68a', color: liveRoundFilter === 'pending' ? '#ffffff' : '#b45309', background: liveRoundFilter === 'pending' ? '#d97706' : 'white' }}
              >
                <UserX size={14} /> Pending Rounds ({kpis.pending_patients_count || 0})
              </PrimaryBtn>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', width: '250px' }}>
              <Search size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Search patient, IP, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.78rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Patient Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {filteredPatients.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '10px', color: '#94a3b8' }}>
                <Users size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <h4>No patients match the selected filter</h4>
              </div>
            ) : (
              filteredPatients.map((p) => (
                <PatientGridCard key={p.id || p.ip_number}>
                  <div className="top-patient-row">
                    <div className="patient-main">
                      <div className="name">{p.patient_name}</div>
                      <div className="meta">
                        {p.gender} {p.age ? `· ${p.age} yrs` : ''} · UHID: <strong>{p.uhid}</strong>
                      </div>
                    </div>
                    <StatusChip $seen={p.is_seen}>
                      {p.is_seen ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {p.is_seen ? 'Seen Today' : 'Pending Round'}
                    </StatusChip>
                  </div>

                  <div className="details-chips">
                    <span className="chip room">
                      <Bed size={11} /> Room {p.room_no || '-'} · Bed {p.bed_no || '-'}
                    </span>
                    <span className="chip doc">
                      <Stethoscope size={11} /> Dr. {p.doctor_name}
                    </span>
                    <span className="chip">
                      IP: <strong>{p.ip_number}</strong>
                    </span>
                  </div>

                  <div className="bottom-actions">
                    <div className="time-info">
                      {p.is_seen ? (
                        <span>Last Note: <strong>{p.latest_note_time_formatted}</strong></span>
                      ) : (
                        <span style={{ color: '#b45309' }}>Admitted: {p.waiting_time_hours}h ago</span>
                      )}
                    </div>
                    <PrimaryBtn
                      $variant="outline"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      onClick={() => handleOpenPatientEMR(p)}
                    >
                      Open Note <ArrowRight size={11} />
                    </PrimaryBtn>
                  </div>
                </PatientGridCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPREHENSIVE CLINICAL REPORT TABLE ── */}
      {activeTab === 'report' && (
        <TableCard>
          <div className="table-top-bar">
            <div className="search-input">
              <Search size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Search report table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <PrimaryBtn $variant="outline" onClick={handleExportCSV}>
                <Download size={13} /> Export to CSV
              </PrimaryBtn>
              <PrimaryBtn $variant="outline" onClick={handlePrintReport}>
                <Printer size={13} /> Print Table
              </PrimaryBtn>
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>UHID</th>
                  <th>IP Number</th>
                  <th>Room / Bed</th>
                  <th>Attending Doctor</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                  <th>First Note Time</th>
                  <th>Latest Note Time</th>
                  <th>Note Type</th>
                  <th>Turnaround Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No inpatient records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td style={{ fontWeight: 800, color: '#64748b' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.patient_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.gender} · {p.age} yrs</div>
                      </td>
                      <td><strong>{p.uhid}</strong></td>
                      <td><strong>{p.ip_number}</strong></td>
                      <td>
                        <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          R-{p.room_no || '-'} / B-{p.bed_no || '-'}
                        </span>
                      </td>
                      <td>Dr. {p.doctor_name}</td>
                      <td>{p.admission_date_formatted}</td>
                      <td>
                        <StatusChip $seen={p.is_seen}>
                          {p.is_seen ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                          {p.is_seen ? 'Seen Today' : 'Pending Round'}
                        </StatusChip>
                      </td>
                      <td>{p.first_note_time_formatted || '-'}</td>
                      <td>{p.latest_note_time_formatted || '-'}</td>
                      <td>
                        <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {p.latest_note_type || '-'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0d9488' }}>{p.tat_formatted || '-'}</strong>
                      </td>
                      <td>
                        <PrimaryBtn
                          $variant="outline"
                          style={{ padding: '3px 7px', fontSize: '0.7rem' }}
                          onClick={() => handleOpenPatientEMR(p)}
                        >
                          Open EMR
                        </PrimaryBtn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableCard>
      )}
    </DashboardWrapper>
  );
};

export default IPDoctorDashboard;
