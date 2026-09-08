import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  Activity,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  PlusCircle,
  Eye,
  Edit,
  Phone,
  Calendar,
  FileText
} from "lucide-react";
import { colors } from "../GlobalStyles";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL ;

// --- Styled Components ---

const PageWrapper = styled.div`
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const PainScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
`;

const PainCircle = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
  border: 2px solid ${props => props.$active ? (props.children > 7 ? '#ef4444' : props.children > 3 ? '#eab308' : '#22c55e') : '#cbd5e1'};
  background: ${props => props.$active ? (props.children > 7 ? '#fef2f2' : props.children > 3 ? '#fefce8' : '#f0fdf4') : 'white'};
  color: ${props => props.$active ? (props.children > 7 ? '#b91c1c' : props.children > 3 ? '#a16207' : '#15803d') : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    border-color: ${props => props.children > 7 ? '#ef4444' : props.children > 3 ? '#eab308' : '#22c55e'};
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      color: #0d9488;
    }
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
    color: #0f172a;
  }

  svg {
    transition: transform 0.4s ease;
    ${props => props.$spinning && `transform: rotate(360deg);`}
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  }
`;

const StatIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$bg || 'rgba(13, 148, 136, 0.1)'};
  color: ${props => props.$color || '#0d9488'};
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;

  span:first-child {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span:last-child {
    font-size: 1.6rem;
    font-weight: 700;
    color: #0f172a;
  }
`;

const ControlBar = styled.div`
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    width: 100%;
    padding: 10px 14px 10px 42px;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterPill = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid ${props => props.$active ? '#0d9488' : '#e2e8f0'};
  background: ${props => props.$active ? '#0d9488' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#0f766e' : '#f8fafc'};
  }
`;

const DateFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const DateInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
  }

  input[type="date"] {
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.8125rem;
    color: #0f172a;
    outline: none;
    background: #ffffff;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
    }
  }
`;

const DateQuickButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: #f8fafc;
    padding: 14px 18px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 16px 18px;
    font-size: 0.875rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f8fafc;
    }
  }
`;

const PatientCell = styled.div`
  display: flex;
  flex-direction: column;

  .name {
    font-weight: 600;
    color: #0f172a;
  }

  .meta {
    font-size: 0.775rem;
    color: #64748b;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;

  ${props => {
    if (props.$type === "Completed") {
      return `
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
      `;
    }
    if (props.$type === "Paid") {
      return `
        background: #e0f2fe;
        color: #0369a1;
        border: 1px solid #bae6fd;
      `;
    }
    return `
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    `;
  }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$completed ? `
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    &:hover { background: #e2e8f0; }
  ` : `
    background: #0d9488;
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(13, 148, 136, 0.25);
    &:hover { background: #0f766e; }
  `}
`;

// --- Modal Overlay & Form Components ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 680px;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  background: #0d9488;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover { background: rgba(255, 255, 255, 0.3); }
  }
`;

const PatientBanner = styled.div`
  background: #f0fdf4;
  border-bottom: 1px solid #bbf7d0;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;

  .item {
    display: flex;
    flex-direction: column;
    span:first-child {
      font-size: 0.725rem;
      color: #166534;
      text-transform: uppercase;
      font-weight: 600;
    }
    span:last-child {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

const ModalBody = styled.form`
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f8fafc;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;

    svg { color: #0d9488; }
  }

  input {
    padding: 12px 16px;
    border: 1px solid transparent;
    background: #f8fafc;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    outline: none;
    transition: all 0.25s ease;

    &:focus {
      background: #ffffff;
      border-color: #0d9488;
      box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
    }
    
    &::placeholder {
      color: #94a3b8;
    }
  }

  .unit {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover { background: #0f766e; }
  &:disabled { background: #94a3b8; cursor: not-allowed; }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: #f1f5f9; }
`;

const EmptyState = styled.div`
  padding: 48px;
  text-align: center;
  color: #64748b;

  svg {
    margin-bottom: 12px;
    color: #cbd5e1;
  }

  h3 {
    margin: 0 0 4px 0;
    color: #334155;
    font-size: 1.1rem;
  }
`;

const HistorySection = styled.div`
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  max-height: 250px;
  overflow-y: auto;
  padding: 20px;
  
  h3 {
    font-size: 1.1rem;
    color: #0f172a;
    font-weight: 700;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: #0d9488;
    }
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.8125rem;

  th {
    background: transparent;
    padding: 12px 16px;
    text-align: left;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #f1f5f9;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid #f8fafc;
    color: #334155;
    font-weight: 500;
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
  
  tbody tr {
    transition: background-color 0.2s ease;
  }

  tbody tr:hover {
    background-color: #f8fafc;
    border-radius: 8px;
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  padding: 24px;
  margin: 0 24px 24px 24px;
  
  h3 {
    font-size: 1.1rem;
    color: #0f172a;
    font-weight: 700;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: #0d9488;
    }
  }
`;

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Main Component ---

const VitalWaitingList = () => {
  const todayStr = getTodayDateString();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [vitalHistory, setVitalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Vital Form Data
  const [vitalData, setVitalData] = useState({
    height: "",
    weight: "",
    bp: "",
    bmi: "",
    temp: "",
    pulse_rate: "",
    spo2: "",
    respiratory_rate: "",
    blood_sugar: ""
  });

  const fetchBilledPatients = async () => {
    try {
      setRefreshing(true);
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_billing_patient/`, "GET");
      if (res.success && res.data && Array.isArray(res.data)) {
        setPatients(res.data);
      } else {
        setPatients([]);
        if (!res.success) {
          toast.error(res.error || "Failed to load billed patient list.");
        }
      }
    } catch (err) {
      console.error("Error fetching billed patients:", err);
      toast.error("Failed to load billed patient list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBilledPatients();
  }, []);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const patient = p.patient || {};
      const matchesSearch =
        (patient.uhid || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.patient_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.mobilePhone || "").includes(searchTerm) ||
        (p.bill_number || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || p.vital_status === statusFilter;

      // Date range filter using billed_date / billdate / bill_date / created_date
      let matchesDate = true;
      const rawBillDate = p.billed_date || p.billdate || p.bill_date || p.created_date;
      if (fromDate || toDate) {
        if (!rawBillDate) {
          matchesDate = false;
        } else {
          const billDateObj = new Date(rawBillDate);
          if (isNaN(billDateObj.getTime())) {
            matchesDate = false;
          } else {
            if (fromDate) {
              const from = new Date(fromDate);
              from.setHours(0, 0, 0, 0);
              if (billDateObj < from) matchesDate = false;
            }
            if (toDate) {
              const to = new Date(toDate);
              to.setHours(23, 59, 59, 999);
              if (billDateObj > to) matchesDate = false;
            }
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [patients, searchTerm, statusFilter, fromDate, toDate]);

  // Compute stats based on date-filtered patients
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const completed = filteredPatients.filter(p => p.vital_status === "Completed").length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [filteredPatients]);

  // Auto-calculate BMI when height and weight change
  const handleVitalChange = (field, value) => {
    const updated = { ...vitalData, [field]: value };

    if (field === "height" || field === "weight") {
      const h = parseFloat(field === "height" ? value : updated.height);
      const w = parseFloat(field === "weight" ? value : updated.weight);
      if (h > 0 && w > 0) {
        const heightInMeters = h / 100;
        const computedBmi = (w / (heightInMeters * heightInMeters)).toFixed(2);
        updated.bmi = computedBmi;
      }
    }

    setVitalData(updated);
  };

  const handleOpenModal = async (record) => {
    setSelectedRecord(record);
    setVitalData({
      height: "",
      weight: "",
      bp: "",
      bmi: "",
      temp: "",
      pulse_rate: "",
      spo2: "",
      respiratory_rate: "",
      blood_sugar: "",
      pain_score: ""
    });
    setIsModalOpen(true);

    if (record.patient?.uhid) {
      setLoadingHistory(true);
      try {
        const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_vital_history/?uhid=${record.patient.uhid}`, "GET");
        if (res.success) {
          if (Array.isArray(res.data)) {
            setVitalHistory(res.data);
          } else if (res.data && Array.isArray(res.data.data)) {
            setVitalHistory(res.data.data);
          } else {
            setVitalHistory([]);
          }
        } else {
          setVitalHistory([]);
        }
      } catch (err) {
        console.error("Error fetching vital history:", err);
        setVitalHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    if (!selectedRecord || !selectedRecord.patient?.uhid) {
      toast.error("Invalid patient data.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        uhid: selectedRecord.patient.uhid,
        doctor_id: selectedRecord.doctor_id || selectedRecord.patient?.doctor_id || null,
        height: vitalData.height !== "" ? parseFloat(vitalData.height) : null,
        weight: vitalData.weight !== "" ? parseFloat(vitalData.weight) : null,
        bp: vitalData.bp || null,
        bmi: vitalData.bmi !== "" ? parseFloat(vitalData.bmi) : null,
        temp: vitalData.temp !== "" ? parseFloat(vitalData.temp) : null,
        pulse_rate: vitalData.pulse_rate !== "" ? parseInt(vitalData.pulse_rate, 10) : null,
        spo2: vitalData.spo2 !== "" ? parseFloat(vitalData.spo2) : null,
        respiratory_rate: vitalData.respiratory_rate !== "" ? parseInt(vitalData.respiratory_rate, 10) : null,
        blood_sugar: vitalData.blood_sugar !== "" ? parseFloat(vitalData.blood_sugar) : null,
        pain_score: vitalData.pain_score !== "" ? parseInt(vitalData.pain_score, 10) : null,
        created_by: localStorage.getItem("employee_id") || "Staff"
      };

      const res = await apiRequest(`${Hmsbaseurl}OPEMR_VitalEntry/`, "POST", payload);
      if (res.success) {
        toast.success("Vital details recorded successfully!");
        handleCloseModal();
        fetchBilledPatients();
      } else {
        toast.error(res.error || "Failed to save vital entry.");
      }
    } catch (err) {
      console.error("Error saving vital entry:", err);
      toast.error("Failed to save vital entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <HeaderSection>
        <TitleGroup>
          <h1>
            <Activity size={26} /> OP EMR - Vital Entry Waiting List
          </h1>
          <p>Track billed patients and capture their clinical vital signs</p>
        </TitleGroup>

        <RefreshButton onClick={fetchBilledPatients} $spinning={refreshing}>
          <RefreshCw size={16} /> Refresh List
        </RefreshButton>
      </HeaderSection>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon $bg="rgba(13, 148, 136, 0.1)" $color="#0d9488">
            <User size={24} />
          </StatIcon>
          <StatInfo>
            <span>Total Billed</span>
            <span>{stats.total}</span>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg="rgba(245, 158, 11, 0.1)" $color="#b45309">
            <Clock size={24} />
          </StatIcon>
          <StatInfo>
            <span>Vitals Pending</span>
            <span>{stats.pending}</span>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg="rgba(34, 197, 94, 0.1)" $color="#15803d">
            <CheckCircle2 size={24} />
          </StatIcon>
          <StatInfo>
            <span>Vitals Captured</span>
            <span>{stats.completed}</span>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Control Bar: Search, Date Filter & Status Filters */}
      <ControlBar>
        <SearchBox>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by UHID, Patient Name, Mobile or Bill No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <DateFilterGroup>
          <DateInputWrapper>
            <label>From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </DateInputWrapper>

          <DateInputWrapper>
            <label>To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DateInputWrapper>

          <DateQuickButton onClick={() => {
            const today = getTodayDateString();
            setFromDate(today);
            setToDate(today);
          }}>
            Today
          </DateQuickButton>

          {(fromDate || toDate) && (
            <DateQuickButton onClick={() => {
              setFromDate("");
              setToDate("");
            }}>
              Clear Dates
            </DateQuickButton>
          )}
        </DateFilterGroup>

        <FilterGroup>
          {["All", "Pending", "Completed"].map(status => (
            <FilterPill
              key={status}
              $active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </FilterPill>
          ))}
        </FilterGroup>
      </ControlBar>

      {/* Billed Patients Table */}
      <TableContainer>
        {loading ? (
          <EmptyState>
            <RefreshCw size={32} className="spin" />
            <h3>Loading Billed Patients...</h3>
          </EmptyState>
        ) : filteredPatients.length === 0 ? (
          <EmptyState>
            <AlertCircle size={36} />
            <h3>No Patients Found</h3>
            <p>No billed patients match your current search/filter parameters.</p>
          </EmptyState>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Billed Date</th>
                <th>Bill No</th>
                <th>UHID</th>
                <th>Patient Details</th>
                <th>Doctor</th>
                <th>Contact</th>
                <th>Payment</th>
                <th>Vital Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((item, index) => {
                const p = item.patient || {};
                const isCompleted = item.vital_status === "Completed";
                const billedDateStr = item.billed_date ? new Date(item.billed_date).toLocaleString('en-IN', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : "-";

                const uhidVal = p.uhid || item.uhid || item.patient_uhid || "-";
                const patientNameVal = p.patient_name || (p.firstName ? `${p.salutation || ''} ${p.firstName} ${p.lastName || ''}`.trim() : "") || item.patient_name || "N/A";
                const doctorVal = p.doctorName || item.doctor_name || item.doctorName || item.doctor_id || "General";
                const mobileVal = p.mobilePhone || p.mobile || item.mobilePhone || item.mobile || "-";

                return (
                  <tr key={item.bill_number || index}>
                    <td>{index + 1}</td>
                    <td>{billedDateStr}</td>
                    <td><strong>{item.bill_number}</strong></td>
                    <td><strong style={{ color: "#0d9488" }}>{uhidVal}</strong></td>
                    <td>
                      <PatientCell>
                        <span className="name">{patientNameVal}</span>
                        <span className="meta">{p.age ? `${p.age} Yrs` : ""} {p.gender ? `/ ${p.gender}` : ""}</span>
                      </PatientCell>
                    </td>
                    <td>{doctorVal}</td>
                    <td>{mobileVal}</td>
                    <td>
                      <StatusBadge $type={item.payment_status}>
                        {item.payment_status || "Pending"}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge $type={item.vital_status}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.vital_status}
                      </StatusBadge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionButton
                        $completed={isCompleted}
                        onClick={() => handleOpenModal(item)}
                      >
                        {isCompleted ? (
                          <>
                            <Edit size={14} /> Edit Vitals
                          </>
                        ) : (
                          <>
                            <PlusCircle size={14} /> Enter Vitals
                          </>
                        )}
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        )}
      </TableContainer>

      {/* Vital Entry Modal Drawer */}
      {isModalOpen && selectedRecord && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>
                <Activity size={20} />
                Vital Details
              </h2>
              <button onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </ModalHeader>

            <PatientBanner>
              <div className="item">
                <span>UHID</span>
                <span>{selectedRecord.patient?.uhid || "-"}</span>
              </div>
              <div className="item">
                <span>Patient Name</span>
                <span>{selectedRecord.patient?.patient_name || "N/A"}</span>
              </div>
              <div className="item">
                <span>Age / Gender</span>
                <span>{selectedRecord.patient?.age || "-"} Yrs / {selectedRecord.patient?.gender || "-"}</span>
              </div>
              <div className="item">
                <span>Bill Number</span>
                <span>{selectedRecord.bill_number}</span>
              </div>
            </PatientBanner>

            <ModalBody onSubmit={handleSubmitVitals} style={{ padding: "0" }}>
              <div style={{ padding: "24px 24px 0 24px" }}>
                {loadingHistory ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>Loading history...</div>
                ) : vitalHistory.length > 0 ? (
                  <HistorySection>
                    <h3><Clock size={16} /> Past Vitals</h3>
                    <HistoryTable>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Ht/Wt (BMI)</th>
                          <th>BP/Pain</th>
                          <th>Temp/Pulse</th>
                          <th>SpO2/Resp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vitalHistory.map((v, i) => {
                          const dateStr = v.vital_entry_date ? new Date(v.vital_entry_date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : "-";
                          return (
                            <tr key={v.id || i}>
                              <td>{dateStr}</td>
                              <td>{v.height || "-"}cm / {v.weight || "-"}kg ({v.bmi || "-"})</td>
                              <td>{v.bp || "-"} / {v.pain_score != null ? `PS: ${v.pain_score}` : "-"}</td>
                              <td>{v.temp ? `${v.temp}°F` : "-" } / {v.pulse_rate || "-"}bpm</td>
                              <td>{v.spo2 ? `${v.spo2}%` : "-"} / {v.respiratory_rate || "-"}bpm</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </HistoryTable>
                  </HistorySection>
                ) : (
                  <HistorySection>
                    <h3><Clock size={16} /> Past Vitals</h3>
                    <div style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "16px" }}>No past vital entries found.</div>
                  </HistorySection>
                )}
              </div>

              <FormCard>
                <h3>
                  <PlusCircle size={18} /> Record New Entry
                </h3>
                <FormGrid>
                  <FormGroup>
                  <label><Ruler size={16} /> Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 170"
                    value={vitalData.height}
                    onChange={(e) => handleVitalChange("height", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Scale size={16} /> Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70"
                    value={vitalData.weight}
                    onChange={(e) => handleVitalChange("weight", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Activity size={16} /> BMI (kg/m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    value={vitalData.bmi}
                    onChange={(e) => handleVitalChange("bmi", e.target.value)}
                  />
                  <span className="unit">Auto calculated from Height & Weight</span>
                </FormGroup>

                <FormGroup>
                  <label><Heart size={16} /> Blood Pressure (BP)</label>
                  <input
                    type="text"
                    placeholder="e.g. 120/80 mmHg"
                    value={vitalData.bp}
                    onChange={(e) => handleVitalChange("bp", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Thermometer size={16} /> Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98.6"
                    value={vitalData.temp}
                    onChange={(e) => handleVitalChange("temp", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Activity size={16} /> Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    value={vitalData.pulse_rate}
                    onChange={(e) => handleVitalChange("pulse_rate", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Droplets size={16} /> SpO2 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98"
                    value={vitalData.spo2}
                    onChange={(e) => handleVitalChange("spo2", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Wind size={16} /> Respiratory Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 16"
                    value={vitalData.respiratory_rate}
                    onChange={(e) => handleVitalChange("respiratory_rate", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label><Droplets size={16} /> Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 110"
                    value={vitalData.blood_sugar}
                    onChange={(e) => handleVitalChange("blood_sugar", e.target.value)}
                  />
                </FormGroup>

                <FormGroup style={{ gridColumn: "span 2" }}>
                  <label><Activity size={16} /> Pain Score (0-10)</label>
                  <PainScaleContainer>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(score => (
                      <PainCircle 
                        key={score} 
                        type="button"
                        $active={vitalData.pain_score === score || vitalData.pain_score === score.toString()} 
                        onClick={() => handleVitalChange("pain_score", score)}
                      >
                        {score}
                      </PainCircle>
                    ))}
                  </PainScaleContainer>
                </FormGroup>
              </FormGrid>
            </FormCard>

            <ModalFooter>
                <CancelButton type="button" onClick={handleCloseModal}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Vital Entry"}
                </SubmitButton>
              </ModalFooter>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default VitalWaitingList;
