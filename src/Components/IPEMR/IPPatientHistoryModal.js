import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';
import {
  X,
  History,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Search,
  RefreshCw,
  User,
  Calendar,
  Bed,
  FileText,
  Stethoscope,
  ShieldCheck,
  Flame,
  Pill,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FlaskConical,
  Building2,
  Check,
  Filter
} from 'lucide-react';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Helper Date Formatters
const formatDate = (d) => {
  if (!d || d === 'null' || d === 'N/A') return '-';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return String(d);
  }
};

const formatDateTime = (d) => {
  if (!d || d === 'null' || d === 'N/A') return '-';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return String(d);
  }
};

// --- Styled Components (Shanmuga Hospital Teal & Slate Theme) ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 1240px;
  height: 94vh;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.2);

  .left {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .sub {
      font-size: 0.78rem;
      opacity: 0.9;
      margin-top: 1px;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }
`;

const TopPatientRibbon = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 6px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;

  .patient-main-block {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 7px;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white;
      font-weight: 800;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(13, 148, 136, 0.25);
    }

    .patient-meta-rows {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .top-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .p-name {
          font-size: 0.94rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .gender-age-badge {
          font-size: 0.68rem;
          color: #475569;
          font-weight: 600;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .blood-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .location-chip {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
      }

      .bottom-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .visual-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          color: #475569;
          font-weight: 600;

          strong {
            color: #0f172a;
            font-weight: 700;
          }

          &.id-chip {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          &.ip-chip {
            background: #eff6ff;
            border-color: #bfdbfe;
            color: #1d4ed8;
          }

          &.phone-chip {
            background: #faf5ff;
            border-color: #e9d5ff;
            color: #7e22ce;
          }
        }
      }
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 5px;

    input {
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 0.76rem;
      outline: none;
      width: 170px;
      background: #f8fafc;

      &:focus {
        border-color: #0d9488;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
      }
    }

    button {
      padding: 4px 10px;
      border-radius: 6px;
      border: none;
      background: #0d9488;
      color: white;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s;

      &:hover {
        background: #0f766e;
      }
    }
  }
`;

const KPIOverviewStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 6px;
  padding: 6px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;

  .kpi-chip {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: #0d9488;
      box-shadow: 0 1px 4px rgba(13, 148, 136, 0.12);
    }

    .icon-wrap {
      width: 24px;
      height: 24px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      flex-shrink: 0;
    }

    .kpi-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;

      .val {
        font-size: 0.88rem;
        font-weight: 800;
        color: #0f172a;
      }

      .lbl {
        font-size: 0.62rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
    }
  }
`;

const TabNavigation = styled.div`
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 4px 14px;
  gap: 4px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: thin;
`;

const NavTab = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid ${props => props.$active ? '#0d9488' : 'transparent'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  ${props => props.$active ? `
    background: #0d9488;
    color: white;
    box-shadow: 0 1px 3px rgba(13, 148, 136, 0.2);
  ` : `
    background: transparent;
    color: #475569;
    &:hover { background: #f1f5f9; color: #0f172a; }
  `}

  .badge-count {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.28)' : '#e2e8f0'};
    color: ${props => props.$active ? 'white' : '#334155'};
    padding: 1px 5px;
    border-radius: 8px;
    font-size: 0.68rem;
    font-weight: 800;
  }
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f8fafc;
  box-sizing: border-box;

  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;

  h4 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meta {
    font-size: 0.76rem;
    color: #64748b;
  }
`;

const FilterStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;

  .chip-btn {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid ${props => props.$active ? '#0d9488' : '#cbd5e1'};
    background: ${props => props.$active ? '#ccfbf1' : '#ffffff'};
    color: ${props => props.$active ? '#0f766e' : '#475569'};
    white-space: nowrap;

    &:hover {
      background: #f0fdf4;
      border-color: #0d9488;
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const LabTestCardHeader = styled.div`
  padding: 12px 16px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: ${props => props.$expanded ? '1px solid #f1f5f9' : 'none'};

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .dept-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: #ccfbf1;
      color: #0f766e;
      text-transform: uppercase;
    }

    .title {
      font-size: 0.92rem;
      font-weight: 800;
      color: #0f172a;
    }

    .barcode {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 600;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;

    .status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #dcfce7;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .date {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }
  }
`;

// Helper to parse reference ranges and evaluate clinical status
const parseLabResult = (valStr, rangeStr) => {
  if (valStr === null || valStr === undefined || valStr === '' || valStr === '-' || valStr === 'null') {
    return { status: 'UNKNOWN', label: '-', color: '#64748b', bg: '#f1f5f9', isNumeric: false };
  }

  const cleanVal = String(valStr).trim();
  const cleanRange = rangeStr ? String(rangeStr).trim() : '';

  // 1. Qualitative Evaluation
  const lowerVal = cleanVal.toLowerCase();
  if (
    lowerVal.includes('non reactive') ||
    lowerVal.includes('non-reactive') ||
    lowerVal.includes('negative') ||
    lowerVal === 'normal' ||
    lowerVal === 'nil' ||
    lowerVal.includes('not detected')
  ) {
    return { status: 'NORMAL', label: 'NORMAL', color: '#16a34a', bg: '#dcfce7', isNumeric: false, isAbnormal: false };
  }
  if (
    lowerVal.includes('reactive') ||
    lowerVal.includes('positive') ||
    lowerVal.includes('abnormal') ||
    lowerVal.includes('detected')
  ) {
    return { status: 'CRITICAL', label: 'REACTIVE', color: '#dc2626', bg: '#fee2e2', isNumeric: false, isAbnormal: true };
  }

  // 2. Numeric Evaluation
  const numVal = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
  if (isNaN(numVal)) {
    return { status: 'TEXT', label: '', color: '#0f172a', bg: '#f1f5f9', isNumeric: false, isAbnormal: false };
  }

  let min = null;
  let max = null;

  if (cleanRange) {
    // Range format: "80 - 120" or "80.0 - 120.0" or "80 to 120"
    const rangeMatch = cleanRange.match(/([0-9.]+)\s*(?:-|to)\s*([0-9.]+)/i);
    if (rangeMatch) {
      min = parseFloat(rangeMatch[1]);
      max = parseFloat(rangeMatch[2]);
    } else {
      // "< 0.05"
      const lessMatch = cleanRange.match(/(?:<|<=|less than)\s*([0-9.]+)/i);
      if (lessMatch) {
        min = 0;
        max = parseFloat(lessMatch[1]);
      } else {
        // "> 60"
        const greaterMatch = cleanRange.match(/(?:>|>=|greater than)\s*([0-9.]+)/i);
        if (greaterMatch) {
          min = parseFloat(greaterMatch[1]);
          max = min * 2;
        }
      }
    }
  }

  if (min !== null && max !== null && max > min) {
    const span = max - min;
    const padding = Math.max(span * 0.25, 1);
    const graphMin = Math.max(0, min - padding);
    const graphMax = max + padding;

    let percent = ((numVal - graphMin) / (graphMax - graphMin)) * 100;
    percent = Math.max(4, Math.min(96, percent));

    const normalStartPct = Math.max(0, Math.min(100, ((min - graphMin) / (graphMax - graphMin)) * 100));
    const normalWidthPct = Math.max(5, Math.min(100 - normalStartPct, ((max - min) / (graphMax - graphMin)) * 100));

    if (numVal < min) {
      return {
        status: 'LOW',
        label: 'LOW ▼',
        color: '#0284c7',
        bg: '#e0f2fe',
        borderColor: '#bae6fd',
        numVal,
        min,
        max,
        percent,
        normalStartPct,
        normalWidthPct,
        isNumeric: true,
        isAbnormal: true
      };
    } else if (numVal > max) {
      return {
        status: 'HIGH',
        label: 'HIGH ▲',
        color: '#dc2626',
        bg: '#fee2e2',
        borderColor: '#fecaca',
        numVal,
        min,
        max,
        percent,
        normalStartPct,
        normalWidthPct,
        isNumeric: true,
        isAbnormal: true
      };
    } else {
      return {
        status: 'NORMAL',
        label: 'NORMAL',
        color: '#16a34a',
        bg: '#dcfce7',
        borderColor: '#bbf7d0',
        numVal,
        min,
        max,
        percent,
        normalStartPct,
        normalWidthPct,
        isNumeric: true,
        isAbnormal: false
      };
    }
  }

  return {
    status: 'NUMERIC_NO_RANGE',
    label: '',
    color: '#0f172a',
    bg: '#f1f5f9',
    numVal,
    min: null,
    max: null,
    percent: null,
    isNumeric: true,
    isAbnormal: false
  };
};

const ClinicalStatusBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: ${props => props.$bg || '#f1f5f9'};
  color: ${props => props.$color || '#334155'};
  border: 1px solid ${props => props.$borderColor || 'transparent'};
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const VisualRangeMeter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 140px;
  max-width: 190px;

  .track-wrapper {
    position: relative;
    height: 7px;
    background: #e2e8f0;
    border-radius: 4px;
    margin: 4px 0 2px 0;
  }

  .normal-zone {
    position: absolute;
    top: 0;
    bottom: 0;
    background: #86efac;
    border-radius: 2px;
  }

  .pointer-dot {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: ${props => props.$color || '#0d9488'};
    border: 2px solid #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    z-index: 2;
    transition: left 0.2s ease;
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.66rem;
    color: #64748b;
    font-weight: 700;
  }
`;

const ParameterTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  background: white;

  th {
    background: #f8fafc;
    padding: 8px 12px;
    text-align: left;
    font-size: 0.74rem;
    font-weight: 700;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.abnormal-row {
    background: #fff8f8;
  }

  tr:hover {
    background: #f1f5f9;
  }

  .value-cell {
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .unit-cell {
    color: #64748b;
    font-size: 0.74rem;
  }

  .range-cell {
    color: #475569;
    font-size: 0.76rem;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: #64748b;

  .icon {
    font-size: 2rem;
    margin-bottom: 8px;
    color: #94a3b8;
  }

  h5 {
    margin: 0 0 4px 0;
    font-size: 0.95rem;
    color: #0f172a;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
  }
`;

const IPPatientHistoryModal = ({ patient = null, uhid = null, ipNumber = null, isOpen = true, onClose }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchUHID, setSearchUHID] = useState('');
  const [activeTab, setActiveTab] = useState('lab_results');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [testSearchFilter, setTestSearchFilter] = useState('');
  const [expandedTests, setExpandedTests] = useState({});

  const targetUHID = uhid || patient?.uhid || searchUHID;
  const targetIP = ipNumber || patient?.ip_number || patient?.ipNumber || '';

  const fetchHistory = useCallback(async (customQuery = null) => {
    const qUHID = customQuery !== null ? customQuery : (targetUHID || targetIP);
    if (!qUHID) return;

    try {
      setLoading(true);
      const url = `${HmsBaseUrl}IPEMR_patient_history/?uhid=${encodeURIComponent(qUHID)}&ip_number=${encodeURIComponent(targetIP)}`;
      const res = await apiRequest(url, 'GET');

      const responseData = res?.data?.data || res?.data;
      if (res?.success || res?.status === 200 || res?.data?.status === 'success' || responseData?.lab_investigations || responseData?.admissions) {
        setHistoryData(responseData);
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to load clinical history.");
        setHistoryData(null);
      }
    } catch (err) {
      console.error("Error loading patient history:", err);
      toast.error("An error occurred while loading patient clinical history.");
    } finally {
      setLoading(false);
    }
  }, [targetUHID, targetIP]);

  useEffect(() => {
    if (isOpen) {
      if (uhid || patient?.uhid || targetIP) {
        fetchHistory();
      }
    }
  }, [isOpen, uhid, patient, targetIP, fetchHistory]);

  const toggleExpandTest = (index) => {
    setExpandedTests(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const patientProfile = historyData?.patient || patient || {};
  const labInvestigations = historyData?.lab_investigations || [];
  const admissions = historyData?.admissions || [];
  const opVisits = historyData?.op_visits || [];
  const doctorNotes = historyData?.doctor_notes || [];
  const nursingNotes = historyData?.nursing_notes || [];
  const dischargeSummaries = historyData?.discharge_summaries || [];
  const medications = historyData?.medications || [];

  // Available Diagnostic Departments
  const departmentsList = useMemo(() => {
    const depts = new Set(['ALL']);
    labInvestigations.forEach(t => {
      if (t.department) depts.add(t.department);
    });
    return Array.from(depts);
  }, [labInvestigations]);

  // Filtered Lab Tests
  const filteredLabTests = useMemo(() => {
    return labInvestigations.filter(t => {
      const matchDept = selectedDeptFilter === 'ALL' || t.department === selectedDeptFilter;
      const matchSearch = !testSearchFilter || (
        (t.test_name || '').toLowerCase().includes(testSearchFilter.toLowerCase()) ||
        (t.department || '').toLowerCase().includes(testSearchFilter.toLowerCase()) ||
        (t.barcode || '').toLowerCase().includes(testSearchFilter.toLowerCase())
      );
      return matchDept && matchSearch;
    });
  }, [labInvestigations, selectedDeptFilter, testSearchFilter]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 1. Modal Header */}
        <ModalHeader>
          <div className="left">
            <div className="icon-box"><History size={20} /></div>
            <div>
              <h3>Patient Clinical & Diagnostic History</h3>
              <div className="sub">
                Medical timeline, diagnostics test results, past admissions & treatment history (No Financials)
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <Printer size={14} /> Print History
            </button>

            <button className="close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </ModalHeader>

        {/* 2. Top Patient Demographics Ribbon */}
        <TopPatientRibbon>
          <div className="patient-main-block">
            <div className="avatar">
              {patientProfile.patient_name ? patientProfile.patient_name[0].toUpperCase() : 'P'}
            </div>

            <div className="patient-meta-rows">
              {/* TOP ROW: Name, Gender & Age, Blood Group, Location */}
              <div className="top-row">
                <span className="p-name">{patientProfile.patient_name || 'Patient'}</span>
                {(patientProfile.gender || patientProfile.age) && (
                  <span className="gender-age-badge">
                    {patientProfile.gender ? (patientProfile.gender.toLowerCase().startsWith('m') ? '♂ Male' : patientProfile.gender.toLowerCase().startsWith('f') ? '♀ Female' : patientProfile.gender) : ''}
                    {patientProfile.gender && patientProfile.age ? ' · ' : ''}
                    {patientProfile.age ? `${patientProfile.age}Y` : ''}
                  </span>
                )}
                {patientProfile.blood_group && (
                  <span className="blood-badge" title={`Blood Group: ${patientProfile.blood_group}`}>
                    🩸 {patientProfile.blood_group}
                  </span>
                )}
                {patientProfile.address && (
                  <span className="location-chip" title="Location / Area">
                    📍 {patientProfile.address}
                  </span>
                )}
              </div>

              {/* BOTTOM ROW: UHID, IP Number, Mobile (Clean visual icons) */}
              <div className="bottom-row">
                <span className="visual-chip id-chip" title="UHID">
                  🪪 <strong>{patientProfile.uhid || targetUHID || '-'}</strong>
                </span>
                {targetIP && (
                  <span className="visual-chip ip-chip" title="IP Admission Number">
                    🏥 <strong>{targetIP}</strong>
                  </span>
                )}
                {patientProfile.mobile && (
                  <span className="visual-chip phone-chip" title="Contact Mobile">
                    📱 <strong>{patientProfile.mobile}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search UHID / IP..."
              value={searchUHID}
              onChange={(e) => setSearchUHID(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchHistory(searchUHID); }}
            />
            <button onClick={() => fetchHistory(searchUHID)} disabled={loading}>
              <Search size={13} /> Search
            </button>
          </div>
        </TopPatientRibbon>

        {/* 3. Clinical Overview KPI Summary Strip */}
        <KPIOverviewStrip>
          <div className="kpi-chip" onClick={() => setActiveTab('lab_results')}>
            <div className="icon-wrap" style={{ background: '#ccfbf1', color: '#0f766e' }}>🔬</div>
            <div className="kpi-text">
              <span className="val">{labInvestigations.length}</span>
              <span className="lbl">Diagnostics</span>
            </div>
          </div>

          <div className="kpi-chip" onClick={() => setActiveTab('admissions')}>
            <div className="icon-wrap" style={{ background: '#dcfce7', color: '#166534' }}>🏥</div>
            <div className="kpi-text">
              <span className="val">{admissions.length}</span>
              <span className="lbl">Admissions</span>
            </div>
          </div>

          <div className="kpi-chip" onClick={() => setActiveTab('doctor_notes')}>
            <div className="icon-wrap" style={{ background: '#e0e7ff', color: '#3730a3' }}>🩺</div>
            <div className="kpi-text">
              <span className="val">{doctorNotes.length}</span>
              <span className="lbl">Doctor Notes</span>
            </div>
          </div>

          <div className="kpi-chip" onClick={() => setActiveTab('nursing_notes')}>
            <div className="icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>🌡️</div>
            <div className="kpi-text">
              <span className="val">{nursingNotes.length}</span>
              <span className="lbl">Vitals & Rounds</span>
            </div>
          </div>

          <div className="kpi-chip" onClick={() => setActiveTab('discharge_summaries')}>
            <div className="icon-wrap" style={{ background: '#dbeafe', color: '#1e40af' }}>📋</div>
            <div className="kpi-text">
              <span className="val">{dischargeSummaries.length}</span>
              <span className="lbl">Discharges</span>
            </div>
          </div>

          <div className="kpi-chip" onClick={() => setActiveTab('medications')}>
            <div className="icon-wrap" style={{ background: '#f3e8ff', color: '#6b21a8' }}>💊</div>
            <div className="kpi-text">
              <span className="val">{medications.length}</span>
              <span className="lbl">Medications</span>
            </div>
          </div>
        </KPIOverviewStrip>

        {/* 4. Tab Navigation */}
        <TabNavigation>
          <NavTab
            $active={activeTab === 'lab_results'}
            onClick={() => setActiveTab('lab_results')}
          >
            <FlaskConical size={13} /> Diagnostics
            <span className="badge-count">{labInvestigations.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'admissions'}
            onClick={() => setActiveTab('admissions')}
          >
            <Bed size={13} /> IP Admissions
            <span className="badge-count">{admissions.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'doctor_notes'}
            onClick={() => setActiveTab('doctor_notes')}
          >
            <Stethoscope size={13} /> Doctor Notes
            <span className="badge-count">{doctorNotes.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'nursing_notes'}
            onClick={() => setActiveTab('nursing_notes')}
          >
            <Heart size={13} /> Nursing & Vitals
            <span className="badge-count">{nursingNotes.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'discharge_summaries'}
            onClick={() => setActiveTab('discharge_summaries')}
          >
            <FileText size={13} /> Discharge Summaries
            <span className="badge-count">{dischargeSummaries.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'medications'}
            onClick={() => setActiveTab('medications')}
          >
            <Pill size={13} /> Medications
            <span className="badge-count">{medications.length}</span>
          </NavTab>

          <NavTab
            $active={activeTab === 'op_visits'}
            onClick={() => setActiveTab('op_visits')}
          >
            <Building2 size={13} /> OP Consultations
            <span className="badge-count">{opVisits.length}</span>
          </NavTab>
        </TabNavigation>

        {/* 4. Content Body */}
        <ContentBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0d9488' }}>
              <RefreshCw size={28} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '0.9rem' }}>Loading Patient Clinical History...</div>
            </div>
          ) : (
            <>
              {/* TAB 1: DIAGNOSTICS & LAB RESULTS */}
              {activeTab === 'lab_results' && (
                <div>
                  <SectionHeader>
                    <h4><FlaskConical size={16} color="#0d9488" /> Laboratory & Diagnostics Investigations</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Search test name or barcode..."
                        value={testSearchFilter}
                        onChange={(e) => setTestSearchFilter(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.76rem',
                          outline: 'none'
                        }}
                      />
                      <span className="meta">{filteredLabTests.length} of {labInvestigations.length} Tests</span>
                    </div>
                  </SectionHeader>

                  {/* Department Filter Chips */}
                  {departmentsList.length > 2 && (
                    <FilterStrip>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Department:</span>
                      {departmentsList.map(dept => (
                        <button
                          key={dept}
                          type="button"
                          className="chip-btn"
                          style={{
                            borderColor: selectedDeptFilter === dept ? '#0d9488' : '#cbd5e1',
                            background: selectedDeptFilter === dept ? '#ccfbf1' : '#ffffff',
                            color: selectedDeptFilter === dept ? '#0f766e' : '#475569'
                          }}
                          onClick={() => setSelectedDeptFilter(dept)}
                        >
                          {dept}
                        </button>
                      ))}
                    </FilterStrip>
                  )}

                  {filteredLabTests.length === 0 ? (
                    <EmptyState>
                      <div className="icon">🧪</div>
                      <h5>No Diagnostics Results Found</h5>
                      <p>No lab or diagnostic test values recorded for UHID: {patientProfile.uhid || targetUHID}.</p>
                    </EmptyState>
                  ) : (
                    filteredLabTests.map((test, idx) => {
                      const isExpanded = expandedTests[idx] !== false; // expanded by default
                      return (
                        <Card key={idx}>
                          <LabTestCardHeader
                            $expanded={isExpanded}
                            onClick={() => toggleExpandTest(idx)}
                          >
                            <div className="left">
                              <span className="dept-badge">{test.department || 'Lab'}</span>
                              <span className="title">{test.test_name}</span>
                              {test.barcode && <span className="barcode">Barcode: {test.barcode}</span>}
                              {test.specimen_type && <span className="barcode">({test.specimen_type})</span>}
                            </div>

                            <div className="right">
                              <span className="status-badge">
                                <CheckCircle2 size={12} /> {test.is_approved ? 'Approved' : 'Verified'}
                              </span>
                              <span className="date">
                                {formatDateTime(test.date)}
                              </span>
                              {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                            </div>
                          </LabTestCardHeader>

                          {isExpanded && (
                            <div>
                              {test.is_microbiology ? (
                                <div style={{ padding: '12px 16px', background: '#ffffff' }}>
                                  <div style={{ display: 'flex', gap: '20px', marginBottom: '8px', fontSize: '0.8rem' }}>
                                    <div><strong>Organism Isolated:</strong> {test.organism || 'No growth / Sterile'}</div>
                                    <div><strong>Colony Count:</strong> {test.colony_count || 'N/A'}</div>
                                  </div>

                                  {Array.isArray(test.sensitivity) && test.sensitivity.length > 0 && (
                                    <ParameterTable>
                                      <thead>
                                        <tr>
                                          <th>Antibiotic</th>
                                          <th>Zone / MIC</th>
                                          <th>Interpretation</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {test.sensitivity.map((sens, sIdx) => (
                                          <tr key={sIdx}>
                                            <td style={{ fontWeight: 700 }}>{sens.antibiotic || sens.name}</td>
                                            <td>{sens.zone || sens.mic || '-'}</td>
                                            <td>
                                              <span style={{
                                                fontWeight: 800,
                                                color: sens.interpretation === 'Sensitive' ? '#166534' : sens.interpretation === 'Resistant' ? '#991b1b' : '#334155'
                                              }}>
                                                {sens.interpretation || 'Sensitive'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </ParameterTable>
                                  )}
                                </div>
                              ) : (
                                <ParameterTable>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '28%' }}>Investigation / Parameter</th>
                                      <th style={{ width: '24%' }}>Observed Result</th>
                                      <th style={{ width: '10%' }}>Unit</th>
                                      <th style={{ width: '18%' }}>Reference Range</th>
                                      <th style={{ width: '20%' }}>Range Indicator</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(test.parameters || []).map((param, pIdx) => {
                                      const evalResult = parseLabResult(param.value, param.reference_range);
                                      return (
                                        <tr key={pIdx} className={evalResult.isAbnormal ? 'abnormal-row' : ''}>
                                          <td style={{ fontWeight: 600 }}>
                                            <div>{param.name}</div>
                                            {param.test_code && param.test_code !== param.name && (
                                              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>Code: {param.test_code}</span>
                                            )}
                                          </td>
                                          <td>
                                            <div className="value-cell">
                                              <span>{param.value !== null && param.value !== undefined && param.value !== '' ? param.value : '-'}</span>
                                              {evalResult.label && (
                                                <ClinicalStatusBadge
                                                  $color={evalResult.color}
                                                  $bg={evalResult.bg}
                                                  $borderColor={evalResult.borderColor}
                                                >
                                                  {evalResult.label}
                                                </ClinicalStatusBadge>
                                              )}
                                            </div>
                                          </td>
                                          <td className="unit-cell">{param.unit || '-'}</td>
                                          <td className="range-cell">{param.reference_range || '-'}</td>
                                          <td>
                                            {evalResult.isNumeric && evalResult.min !== null && evalResult.max !== null ? (
                                              <VisualRangeMeter $color={evalResult.color}>
                                                <div className="track-wrapper">
                                                  <div
                                                    className="normal-zone"
                                                    style={{
                                                      left: `${evalResult.normalStartPct}%`,
                                                      width: `${evalResult.normalWidthPct}%`
                                                    }}
                                                    title={`Normal: ${evalResult.min} - ${evalResult.max}`}
                                                  />
                                                  <div
                                                    className="pointer-dot"
                                                    style={{ left: `${evalResult.percent}%` }}
                                                    title={`Observed: ${param.value} (Normal: ${evalResult.min} - ${evalResult.max})`}
                                                  />
                                                </div>
                                                <div className="range-labels">
                                                  <span>{evalResult.min}</span>
                                                  <span style={{ color: '#16a34a', fontSize: '0.64rem' }}>Normal Zone</span>
                                                  <span>{evalResult.max}</span>
                                                </div>
                                              </VisualRangeMeter>
                                            ) : evalResult.status === 'NORMAL' || evalResult.status === 'CRITICAL' ? (
                                              <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                color: evalResult.color
                                              }}>
                                                {evalResult.label}
                                              </span>
                                            ) : (
                                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>-</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </ParameterTable>
                              )}

                              {(test.remarks || test.comment) && (
                                <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#475569' }}>
                                  <strong>Remarks:</strong> {test.remarks || test.comment}
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: ADMISSIONS */}
              {activeTab === 'admissions' && (
                <div>
                  <SectionHeader>
                    <h4><Bed size={16} color="#0d9488" /> Inpatient Admissions & Hospital Stays</h4>
                    <span className="meta">{admissions.length} Admission Records</span>
                  </SectionHeader>

                  {admissions.length === 0 ? (
                    <EmptyState>
                      <div className="icon">🏥</div>
                      <h5>No Prior Admissions Found</h5>
                      <p>No past hospital admissions recorded for this patient.</p>
                    </EmptyState>
                  ) : (
                    admissions.map((adm, idx) => (
                      <Card key={idx} style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                              IP No: {adm.ip_number} · Room {adm.room_no || '-'} (Bed {adm.bed_no || '-'})
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              Admitting Doctor: <strong>Dr. {adm.doctor_name}</strong> · Ward: {adm.ward_name || '-'}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: adm.is_discharged ? '#f1f5f9' : '#dcfce7',
                              color: adm.is_discharged ? '#475569' : '#166534'
                            }}>
                              {adm.is_discharged ? 'Discharged' : 'Currently Admitted'}
                            </span>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                              Admitted: {formatDate(adm.admission_date)}
                              {adm.discharge_date && ` → ${formatDate(adm.discharge_date)}`}
                            </div>
                          </div>
                        </div>

                        {(adm.provisional_diagnosis || adm.final_diagnosis || adm.reason_for_admission) && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {adm.reason_for_admission && <div><strong>Reason for Admission:</strong> {adm.reason_for_admission}</div>}
                            {adm.provisional_diagnosis && <div><strong>Provisional Diagnosis:</strong> {adm.provisional_diagnosis}</div>}
                            {adm.final_diagnosis && <div><strong>Final Diagnosis:</strong> {adm.final_diagnosis}</div>}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: DOCTOR CLINICAL NOTES */}
              {activeTab === 'doctor_notes' && (
                <div>
                  <SectionHeader>
                    <h4><Stethoscope size={16} color="#0d9488" /> Doctor Round & Clinical Progress Notes</h4>
                    <span className="meta">{doctorNotes.length} Saved Clinical Notes</span>
                  </SectionHeader>

                  {doctorNotes.length === 0 ? (
                    <EmptyState>
                      <div className="icon">🩺</div>
                      <h5>No Doctor Notes Found</h5>
                      <p>No physician clinical notes recorded for this patient.</p>
                    </EmptyState>
                  ) : (
                    doctorNotes.map((dn, idx) => (
                      <Card key={idx} style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{dn.note_type}</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '8px' }}>by Dr. {dn.doctor_name}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDateTime(dn.note_date)}
                          </span>
                        </div>

                        {/* Chief Complaints */}
                        {Array.isArray(dn.chief_complaints) && dn.chief_complaints.length > 0 && (
                          <div style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                            <strong>Chief Complaints:</strong>{' '}
                            {dn.chief_complaints.map((c, cIdx) => (
                              <span key={cIdx} style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', marginRight: '4px' }}>
                                {typeof c === 'string' ? c : `${c.complaint || ''} (${c.duration || ''})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Diagnosis */}
                        {dn.provisional_diagnosis && (
                          <div style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                            <strong>Diagnosis:</strong> {typeof dn.provisional_diagnosis === 'string' ? dn.provisional_diagnosis : (dn.provisional_diagnosis.primary_diagnosis || JSON.stringify(dn.provisional_diagnosis))}
                          </div>
                        )}

                        {/* Plan of Care */}
                        {dn.plan_of_care && (
                          <div style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                            <strong>Plan of Care:</strong> {typeof dn.plan_of_care === 'string' ? dn.plan_of_care : (dn.plan_of_care.treatment_plan || dn.plan_of_care.special_instructions || 'Follow order')}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: NURSING NOTES & VITALS */}
              {activeTab === 'nursing_notes' && (
                <div>
                  <SectionHeader>
                    <h4><Heart size={16} color="#0d9488" /> Bedside Nursing Rounds & Vitals History</h4>
                    <span className="meta">{nursingNotes.length} Shift Records</span>
                  </SectionHeader>

                  {nursingNotes.length === 0 ? (
                    <EmptyState>
                      <div className="icon">🌡️</div>
                      <h5>No Nursing Notes Recorded</h5>
                      <p>No nursing shift records or vitals charted for this patient.</p>
                    </EmptyState>
                  ) : (
                    nursingNotes.map((nn, idx) => (
                      <Card key={idx} style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>{nn.shift} Shift</span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: '#fff7ed',
                              color: '#c2410c',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #ffedd5'
                            }}>
                              Pain Score: {nn.pain_score}/10 ({nn.pain_severity})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDateTime(nn.note_date)}
                          </span>
                        </div>

                        {/* Vitals Summary Row */}
                        {nn.vitals && Object.keys(nn.vitals).length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {nn.vitals.bp && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>BP: <strong>{nn.vitals.bp}</strong></span>}
                            {nn.vitals.pulse && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>Pulse: <strong>{nn.vitals.pulse} bpm</strong></span>}
                            {nn.vitals.temp && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>Temp: <strong>{nn.vitals.temp}</strong></span>}
                            {nn.vitals.spo2 && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>SpO2: <strong>{nn.vitals.spo2}</strong></span>}
                            {nn.vitals.grbs && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>GRBS: <strong>{nn.vitals.grbs} mg/dL</strong></span>}
                            {nn.vitals.consciousness && <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>Consciousness: <strong>{nn.vitals.consciousness}</strong></span>}
                          </div>
                        )}

                        {nn.handover_notes && (
                          <div style={{ fontSize: '0.78rem', color: '#334155', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                            <strong>Nursing Observation:</strong> {nn.handover_notes}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: DISCHARGE SUMMARIES */}
              {activeTab === 'discharge_summaries' && (
                <div>
                  <SectionHeader>
                    <h4><FileText size={16} color="#0d9488" /> Past Hospital Discharge Summaries</h4>
                    <span className="meta">{dischargeSummaries.length} Summaries</span>
                  </SectionHeader>

                  {dischargeSummaries.length === 0 ? (
                    <EmptyState>
                      <div className="icon">📋</div>
                      <h5>No Discharge Summaries</h5>
                      <p>No past hospital discharge summaries generated for this patient.</p>
                    </EmptyState>
                  ) : (
                    dischargeSummaries.map((ds, idx) => (
                      <Card key={idx} style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{ds.heading || ds.summary_type}</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '8px' }}>IP No: {ds.ip_number}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDate(ds.created_date)}
                          </span>
                        </div>

                        {ds.primary_diagnosis && (
                          <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                            <strong>Primary Diagnosis:</strong> {ds.primary_diagnosis}
                          </div>
                        )}

                        {ds.condition_at_discharge && (
                          <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                            <strong>Condition at Discharge:</strong> {ds.condition_at_discharge}
                          </div>
                        )}

                        {ds.hospital_course && (
                          <div style={{ fontSize: '0.78rem', color: '#334155', background: '#f8fafc', padding: '8px', borderRadius: '6px', marginTop: '6px' }}>
                            <strong>Course in Hospital:</strong> {ds.hospital_course}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: MEDICATIONS */}
              {activeTab === 'medications' && (
                <div>
                  <SectionHeader>
                    <h4><Pill size={16} color="#0d9488" /> Prescribed & Administered Medications Timeline</h4>
                    <span className="meta">{medications.length} Prescriptions (Clinical View)</span>
                  </SectionHeader>

                  {medications.length === 0 ? (
                    <EmptyState>
                      <div className="icon">💊</div>
                      <h5>No Medications History</h5>
                      <p>No medication orders found for this patient.</p>
                    </EmptyState>
                  ) : (
                    <ParameterTable>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Medicine / Drug Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Route</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((med, idx) => (
                          <tr key={idx}>
                            <td>{formatDate(med.date)}</td>
                            <td style={{ fontWeight: 800, color: '#0f172a' }}>{med.medicine_name}</td>
                            <td>{med.dosage || '-'}</td>
                            <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{med.frequency || '-'}</span></td>
                            <td>{med.route || 'Oral'}</td>
                            <td>{med.duration || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </ParameterTable>
                  )}
                </div>
              )}

              {/* TAB 7: OP VISITS */}
              {activeTab === 'op_visits' && (
                <div>
                  <SectionHeader>
                    <h4><Building2 size={16} color="#0d9488" /> Outpatient Consultation Visits</h4>
                    <span className="meta">{opVisits.length} Visits</span>
                  </SectionHeader>

                  {opVisits.length === 0 ? (
                    <EmptyState>
                      <div className="icon">🏥</div>
                      <h5>No OP Visits Found</h5>
                      <p>No outpatient registration records found for this patient.</p>
                    </EmptyState>
                  ) : (
                    <ParameterTable>
                      <thead>
                        <tr>
                          <th>Visit Date</th>
                          <th>OP Number</th>
                          <th>Consulting Doctor</th>
                          <th>Department</th>
                          <th>Visit Type</th>
                          <th>Chief Complaint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opVisits.map((op, idx) => (
                          <tr key={idx}>
                            <td>{formatDate(op.registration_date)}</td>
                            <td style={{ fontWeight: 700 }}>{op.op_number || '-'}</td>
                            <td>Dr. {op.doctor_name || 'Consultant'}</td>
                            <td>{op.department || '-'}</td>
                            <td><span style={{ background: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{op.visit_type}</span></td>
                            <td>{op.chief_complaint || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </ParameterTable>
                  )}
                </div>
              )}
            </>
          )}
        </ContentBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default IPPatientHistoryModal;
