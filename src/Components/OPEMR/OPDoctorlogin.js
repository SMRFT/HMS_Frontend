import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import apiRequest from '../../Auth/apiRequest';
import { toast } from 'react-toastify';
import {
  User,
  Activity,
  Search,
  RefreshCw,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  X,
  Stethoscope,
  Save,
  Printer,
  ChevronRight,
  Filter,
  Check,
  Tag,
  Info,
  Pill
} from 'lucide-react';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL ;

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const Container = styled.div`
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e293b;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 4px 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
    &:hover {
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      transform: translateY(-1px);
    }
  `}

  ${props => props.$variant === 'secondary' && `
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  `}

  ${props => props.$variant === 'outline' && `
    background: transparent;
    color: #0284c7;
    border: 1px solid #0284c7;
    &:hover {
      background: #f0f9ff;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  animation: ${fadeIn} 0.4s ease;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// --- Patient Queue Sidebar ---
const SidebarCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  position: sticky;
  top: 24px;
`;

const SidebarHeader = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .badge {
      background: #ccfbf1;
      color: #0f766e;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 10px 14px 10px 38px;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
`;

const PatientList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PatientItem = styled.div`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${props => props.$selected ? '#0d9488' : '#f1f5f9'};
  background: ${props => props.$selected ? '#f0fdf4' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
    background: #f8fafc;
  }

  .top-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;

    .name {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .uhid {
      font-size: 0.75rem;
      font-weight: 600;
      color: #0d9488;
      background: #e6fffa;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }

  .meta-info {
    font-size: 0.8125rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-row {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;

    .vital-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: ${props => props.$hasVitals ? '#16a34a' : '#d97706'};
    }
  }
`;

// --- Workspace / Main Panel ---
const Workspace = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// --- Patient Banner ---
const PatientBanner = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;

  .info-item {
    display: flex;
    flex-direction: column;

    span.label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    span.val {
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
    }

    &.primary-info span.val {
      font-size: 1.3rem;
      color: #2dd4bf;
    }
  }
`;

// --- Section Card ---
const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #0d9488;
  }
`;

// --- 1. Vital Entry Serializer Display Grid ---
const VitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
`;

const VitalItem = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;

    svg {
      color: ${props => props.$iconColor || '#0d9488'};
    }
  }

  .value {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0f172a;

    span.unit {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      margin-left: 4px;
    }
  }

  .sub {
    font-size: 0.75rem;
    color: #0d9488;
    margin-top: 4px;
    font-weight: 600;
  }
`;

const VitalDateBadge = styled.div`
  margin-top: 14px;
  padding: 8px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: #15803d;
  font-weight: 600;
`;

// --- Custom Multi-Select Dropdown Component ---
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownTrigger = styled.div`
  min-height: 48px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
  }

  ${props => props.$isOpen && `
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  `}
`;

const SelectedBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const BadgeTag = styled.span`
  background: #e6fffa;
  color: #0f766e;
  border: 1px solid #99f6e4;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  svg {
    cursor: pointer;
    &:hover {
      color: #042f2e;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
  padding: 8px;
  animation: ${fadeIn} 0.2s ease;
`;

const DropdownMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;

  .count {
    font-size: 0.75rem;
    font-weight: 700;
    color: #0d9488;
  }

  .close-btn {
    background: #0d9488;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: #0f766e;
    }
  }
`;

const DropdownSearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  margin-bottom: 8px;
  box-sizing: border-box;

  &:focus {
    border-color: #0d9488;
  }
`;

const DropdownItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.$isSelected ? '#f0fdf4' : 'transparent'};
  color: ${props => props.$isSelected ? '#0f766e' : '#334155'};
  font-weight: ${props => props.$isSelected ? '600' : 'normal'};

  &:hover {
    background: #f8fafc;
    color: #0f172a;
  }
`;

// --- Finding & Followup Fields ---
const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
`;

const DatePickerWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  input[type="date"] {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }
  }
`;

const ShortcutButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

// --- Modal for Printing / Summary ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 650px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

// --- Past History & Bottom Action Components ---
const HistoryTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
`;

const HistoryCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.08);
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 14px;
    border-bottom: 1px dashed #cbd5e1;

    .date {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .doctor {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0d9488;
      background: #e6fffa;
      padding: 4px 10px;
      border-radius: 6px;
    }
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 10px;
  }

  .history-section {
    .label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .content {
      font-size: 0.875rem;
      color: #1e293b;
    }
  }
`;

const BottomActionBar = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  padding: 18px 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  position: sticky;
  bottom: 20px;
  z-index: 90;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 14px;
    align-items: stretch;
  }
`;

// --- Main OPDoctorlogin Component ---
const OPDoctorlogin = () => {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Master Data
  const [symptomList, setSymptomList] = useState([]);
  const [testList, setTestList] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]); // Stores test_id
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]); // Stores item_id
  const [finding, setFinding] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  // Dropdown UI states and refs
  const [symptomDropdownOpen, setSymptomDropdownOpen] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState("");

  const [testDropdownOpen, setTestDropdownOpen] = useState(false);
  const [testSearch, setTestSearch] = useState("");

  const [medicineDropdownOpen, setMedicineDropdownOpen] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");

  const symptomDropdownRef = useRef(null);
  const testDropdownRef = useRef(null);
  const medicineDropdownRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (symptomDropdownRef.current && !symptomDropdownRef.current.contains(event.target)) {
        setSymptomDropdownOpen(false);
      }
      if (testDropdownRef.current && !testDropdownRef.current.contains(event.target)) {
        setTestDropdownOpen(false);
      }
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(event.target)) {
        setMedicineDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Modal & History State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);
  const [pastHistory, setPastHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch Past Consultation History
  const fetchPastHistory = async (uhid) => {
    if (!uhid) {
      setPastHistory([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/?uhid=${encodeURIComponent(uhid)}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setPastHistory(res.data);
      }
    } catch (err) {
      console.error("Error fetching past history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedPatient?.patient?.uhid) {
      fetchPastHistory(selectedPatient.patient.uhid);
    }
  }, [selectedPatient]);

  // 1. Fetch Patients & Masters on mount
  useEffect(() => {
    fetchBilledPatients();
    fetchSymptoms();
    fetchDiagnosticsTests();
    fetchMedicines();
  }, []);

  const fetchBilledPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_VitalEntry/`, "GET");
      if (res.success && res.data) {
        setPatients(res.data);
        if (res.data.length > 0) {
          setSelectedPatient(res.data[0]);
        }
      } else {
        toast.error(res.error || "Failed to load patient queue.");
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      toast.error("Failed to load patient queue.");
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchSymptoms = async () => {
    setLoadingMasters(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_symptoms/`, "GET");
      if (res.success && res.data && res.data.symptoms) {
        setSymptomList(res.data.symptoms);
      }
    } catch (err) {
      console.error("Error fetching symptoms:", err);
    } finally {
      setLoadingMasters(false);
    }
  };

  const fetchDiagnosticsTests = async () => {
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_diagnostics_tests/`, "GET");
      if (res.success && res.data && Array.isArray(res.data)) {
        setTestList(res.data);
      }
    } catch (err) {
      console.error("Error fetching diagnostics tests:", err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_medicines/`, "GET");
      if (res.success && res.data && Array.isArray(res.data)) {
        setMedicineList(res.data);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
    }
  };

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(p =>
      (p.patient?.patient_name || "").toLowerCase().includes(q) ||
      (p.patient?.uhid || "").toLowerCase().includes(q) ||
      (p.bill_number || "").toString().toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  // Filtered Symptoms for dropdown
  const filteredSymptoms = useMemo(() => {
    if (!symptomSearch) return symptomList;
    return symptomList.filter(s => s.toLowerCase().includes(symptomSearch.toLowerCase()));
  }, [symptomList, symptomSearch]);

  // Filtered Tests for dropdown
  const filteredTests = useMemo(() => {
    if (!testSearch) return testList;
    return testList.filter(t => t.test_name.toLowerCase().includes(testSearch.toLowerCase()));
  }, [testList, testSearch]);

  // Filtered Medicines for dropdown
  const filteredMedicines = useMemo(() => {
    if (!medicineSearch) return medicineList;
    return medicineList.filter(m => m.item_name.toLowerCase().includes(medicineSearch.toLowerCase()));
  }, [medicineList, medicineSearch]);

  // Toggle symptom selection
  const handleToggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  // Toggle test selection (storing test_id!)
  const handleToggleTest = (testId) => {
    if (selectedTestIds.includes(testId)) {
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  // Toggle medicine selection (storing item_id!)
  const handleToggleMedicine = (itemId) => {
    if (selectedMedicineIds.includes(itemId)) {
      setSelectedMedicineIds(selectedMedicineIds.filter(id => id !== itemId));
    } else {
      setSelectedMedicineIds([...selectedMedicineIds, itemId]);
    }
  };

  // Shortcut for Followup date
  const handleAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowupDate(d.toISOString().split('T')[0]);
  };

  // Save Doctor Consultation
  const handleSaveConsultation = async () => {
    if (!selectedPatient) {
      toast.warning("Please select a patient first.");
      return;
    }

    setSavingConsultation(true);
    try {
      const cleanVitals = { ...(selectedPatient.vital_entry || {}) };
      delete cleanVitals.id;

      const payload = {
        uhid: selectedPatient.patient?.uhid,
        patient_name: selectedPatient.patient?.patient_name,
        doctor_name: selectedPatient.patient?.doctorName || "Dr. Consultation",
        vitals: cleanVitals, // id removed!
        symptoms: selectedSymptoms,
        investigation_test_ids: selectedTestIds, // Stored test_id array!
        investigation_details: testList.filter(t => selectedTestIds.includes(t.test_id)),
        prescription_item_ids: selectedMedicineIds, // Stored item_id array!
        prescription_details: medicineList.filter(m => selectedMedicineIds.includes(m.item_id)),
        finding: finding,
        followup_date: followupDate
      };

      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/`, "POST", payload);
      if (res.success) {
        toast.success("Consultation saved successfully!");
        fetchPastHistory(selectedPatient.patient?.uhid);
      } else {
        toast.error(res.error || "Failed to save consultation.");
      }
    } catch (err) {
      console.error("Error saving consultation:", err);
      toast.error("Failed to save consultation.");
    } finally {
      setSavingConsultation(false);
    }
  };

  // Vital entry data extracted from selectedPatient (VitalEntrySerializer)
  const vitals = selectedPatient?.vital_entry;

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <HeaderTitle>
          <div className="icon-wrapper">
            <Stethoscope size={26} />
          </div>
          <div>
            <h1>OP Doctor EMR & Consultation Desk</h1>
            <p>Clinical Examination, Diagnostics & Investigation Orders</p>
          </div>
        </HeaderTitle>

        <HeaderActions>
          <Button $variant="secondary" onClick={fetchBilledPatients} disabled={loadingPatients}>
            <RefreshCw size={16} className={loadingPatients ? "spin" : ""} />
            Refresh Queue
          </Button>
          <Button $variant="outline" onClick={() => setShowHistoryModal(true)} disabled={!selectedPatient}>
            <Clock size={16} />
            Past History ({pastHistory.length})
          </Button>
        </HeaderActions>
      </PageHeader>

      <MainGrid>
        {/* Patient Queue Sidebar */}
        <SidebarCard>
          <SidebarHeader>
            <div className="title-row">
              <h3>OP Patient Queue</h3>
              <span className="badge">{filteredPatients.length} Billed</span>
            </div>
            <SearchBox>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search UHID / Patient Name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </SearchBox>
          </SidebarHeader>

          <PatientList>
            {loadingPatients ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Loading patient queue...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                No OP billed patients found.
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = selectedPatient?.patient?.uhid === p.patient?.uhid;
                const hasVitals = !!p.vital_entry;
                return (
                  <PatientItem
                    key={p.bill_number || p.patient?.uhid}
                    $selected={isSelected}
                    $hasVitals={hasVitals}
                    onClick={() => setSelectedPatient(p)}
                  >
                    <div className="top-info">
                      <span className="name">{p.patient?.patient_name || "Unknown Patient"}</span>
                      <span className="uhid">{p.patient?.uhid || "No UHID"}</span>
                    </div>
                    <div className="meta-info">
                      <span>{p.patient?.age ? `${p.patient.age} Yrs` : ''} {p.patient?.gender}</span>
                      <span>• Doctor: {p.patient?.doctorName || 'General'}</span>
                    </div>
                    <div className="status-row">
                      <div className="vital-status">
                        {hasVitals ? (
                          <>
                            <CheckCircle2 size={14} /> Vitals Recorded
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} /> Vitals Pending
                          </>
                        )}
                      </div>
                      <span style={{ color: '#0f766e', fontWeight: 700 }}>₹{p.total_fees || 0}</span>
                    </div>
                  </PatientItem>
                );
              })
            )}
          </PatientList>
        </SidebarCard>

        {/* Doctor Consultation Workspace */}
        <Workspace>
          {/* Patient Details Banner */}
          {selectedPatient && (
            <PatientBanner>
              <div className="info-item primary-info">
                <span className="label">Patient Name</span>
                <span className="val">{selectedPatient.patient?.patient_name}</span>
              </div>
              <div className="info-item">
                <span className="label">UHID</span>
                <span className="val">{selectedPatient.patient?.uhid}</span>
              </div>
              <div className="info-item">
                <span className="label">Age / Gender</span>
                <span className="val">
                  {selectedPatient.patient?.age || 'N/A'} Yrs / {selectedPatient.patient?.gender || 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Mobile</span>
                <span className="val">{selectedPatient.patient?.mobilePhone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Consulting Doctor</span>
                <span className="val">{selectedPatient.patient?.doctorName || 'OP Doctor'}</span>
              </div>
            </PatientBanner>
          )}

          {/* 1. Vital Entry Serializer Display */}
          <Card>
            <CardTitle>
              <Activity size={20} /> Patient Vital Signs (VitalEntrySerializer Data)
            </CardTitle>

            {vitals ? (
              <>
                <VitalsGrid>
                  <VitalItem $iconColor="#0284c7">
                    <div className="header">
                      <Ruler size={16} /> Height
                    </div>
                    <div className="value">
                      {vitals.height || '--'} <span className="unit">cm</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#0d9488">
                    <div className="header">
                      <Scale size={16} /> Weight
                    </div>
                    <div className="value">
                      {vitals.weight || '--'} <span className="unit">kg</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#e11d48">
                    <div className="header">
                      <Heart size={16} /> Blood Pressure
                    </div>
                    <div className="value">
                      {vitals.bp || '--'} <span className="unit">mmHg</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#8b5cf6">
                    <div className="header">
                      <Activity size={16} /> BMI
                    </div>
                    <div className="value">
                      {vitals.bmi || '--'} <span className="unit">kg/m²</span>
                    </div>
                    <div className="sub">
                      {vitals.bmi ? (vitals.bmi < 18.5 ? 'Underweight' : vitals.bmi < 25 ? 'Normal' : 'Overweight') : ''}
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#f59e0b">
                    <div className="header">
                      <Thermometer size={16} /> Temperature
                    </div>
                    <div className="value">
                      {vitals.temp || '--'} <span className="unit">°F</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#ef4444">
                    <div className="header">
                      <Activity size={16} /> Pulse Rate
                    </div>
                    <div className="value">
                      {vitals.pulse_rate || '--'} <span className="unit">bpm</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#06b6d4">
                    <div className="header">
                      <Droplets size={16} /> SpO2
                    </div>
                    <div className="value">
                      {vitals.spo2 || '--'} <span className="unit">%</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#6366f1">
                    <div className="header">
                      <Wind size={16} /> Resp. Rate
                    </div>
                    <div className="value">
                      {vitals.respiratory_rate || '--'} <span className="unit">/min</span>
                    </div>
                  </VitalItem>

                  <VitalItem $iconColor="#10b981">
                    <div className="header">
                      <Droplets size={16} /> Blood Sugar
                    </div>
                    <div className="value">
                      {vitals.blood_sugar || '--'} <span className="unit">mg/dL</span>
                    </div>
                  </VitalItem>
                </VitalsGrid>

                <VitalDateBadge>
                  <Clock size={16} /> Vital Recorded Date: {vitals.vital_entry_date ? new Date(vitals.vital_entry_date).toLocaleString() : 'N/A'}
                </VitalDateBadge>
              </>
            ) : (
              <div style={{ padding: '24px', background: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f', color: '#d48806', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Info size={20} />
                <span>No vitals recorded for this patient yet. Vitals can be entered at the triage node.</span>
              </div>
            )}
          </Card>

          {/* 2. Diagnostics Dropdown (HMS_Symptoms_list) */}
          <Card>
            <CardTitle>
              <Stethoscope size={20} /> Diagnostics / Symptoms (from HMS_Symptoms_list)
            </CardTitle>

            <DropdownContainer ref={symptomDropdownRef}>
              <DropdownTrigger
                $isOpen={symptomDropdownOpen}
                onClick={() => setSymptomDropdownOpen(!symptomDropdownOpen)}
              >
                {selectedSymptoms.length > 0 ? (
                  <SelectedBadges>
                    {selectedSymptoms.map(sym => (
                      <BadgeTag key={sym} onClick={(e) => { e.stopPropagation(); handleToggleSymptom(sym); }}>
                        {sym} <X size={14} />
                      </BadgeTag>
                    ))}
                  </SelectedBadges>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Select symptoms from HMS_Symptoms_list...</span>
                )}
                <ChevronRight size={18} style={{ transform: symptomDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </DropdownTrigger>

              {symptomDropdownOpen && (
                <DropdownMenu>
                  <DropdownMenuHeader>
                    <span className="count">{selectedSymptoms.length} Symptoms Selected</span>
                    <button type="button" className="close-btn" onClick={() => setSymptomDropdownOpen(false)}>
                      Done <Check size={12} />
                    </button>
                  </DropdownMenuHeader>
                  <DropdownSearchInput
                    type="text"
                    placeholder="Search symptoms (Fever, Cold, Cough...)"
                    value={symptomSearch}
                    onChange={e => setSymptomSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  {filteredSymptoms.length === 0 ? (
                    <div style={{ padding: '10px', fontSize: '0.875rem', color: '#94a3b8' }}>No symptoms found</div>
                  ) : (
                    filteredSymptoms.map(sym => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <DropdownItem
                          key={sym}
                          $isSelected={isSelected}
                          onClick={() => handleToggleSymptom(sym)}
                        >
                          <span>{sym}</span>
                          {isSelected && <Check size={16} />}
                        </DropdownItem>
                      );
                    })
                  )}
                </DropdownMenu>
              )}
            </DropdownContainer>
          </Card>

          {/* 3. Investigation Dropdown (Diagnostics_test_details) */}
          <Card>
            <CardTitle>
              <FileText size={20} /> Investigation Tests (from Diagnostics_test_details)
            </CardTitle>

            <DropdownContainer ref={testDropdownRef}>
              <DropdownTrigger
                $isOpen={testDropdownOpen}
                onClick={() => setTestDropdownOpen(!testDropdownOpen)}
              >
                {selectedTestIds.length > 0 ? (
                  <SelectedBadges>
                    {selectedTestIds.map(tId => {
                      const testObj = testList.find(t => t.test_id === tId);
                      return (
                        <BadgeTag key={tId} onClick={(e) => { e.stopPropagation(); handleToggleTest(tId); }}>
                          {testObj ? testObj.test_name : `Test #${tId}`} <X size={14} />
                        </BadgeTag>
                      );
                    })}
                  </SelectedBadges>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Select investigation tests...</span>
                )}
                <ChevronRight size={18} style={{ transform: testDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </DropdownTrigger>

              {testDropdownOpen && (
                <DropdownMenu>
                  <DropdownMenuHeader>
                    <span className="count">{selectedTestIds.length} Tests Selected</span>
                    <button type="button" className="close-btn" onClick={() => setTestDropdownOpen(false)}>
                      Done <Check size={12} />
                    </button>
                  </DropdownMenuHeader>
                  <DropdownSearchInput
                    type="text"
                    placeholder="Search investigation tests..."
                    value={testSearch}
                    onChange={e => setTestSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  {filteredTests.length === 0 ? (
                    <div style={{ padding: '10px', fontSize: '0.875rem', color: '#94a3b8' }}>No tests found</div>
                  ) : (
                    filteredTests.map(t => {
                      const isSelected = selectedTestIds.includes(t.test_id);
                      return (
                        <DropdownItem
                          key={t.test_id}
                          $isSelected={isSelected}
                          onClick={() => handleToggleTest(t.test_id)}
                        >
                          <div>
                            <span>{t.test_name}</span>
                            {t.department && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                [{t.department}]
                              </span>
                            )}
                          </div>
                          <div>
                            {isSelected && <Check size={16} />}
                          </div>
                        </DropdownItem>
                      );
                    })
                  )}
                </DropdownMenu>
              )}
            </DropdownContainer>
          </Card>

          {/* 4. Prescription Dropdown (hospital_pharmacyitem / medicine_package) */}
          <Card>
            <CardTitle>
              <Pill size={20} /> Prescription / Medicines (from hospital_pharmacyitem)
            </CardTitle>

            <DropdownContainer ref={medicineDropdownRef}>
              <DropdownTrigger
                $isOpen={medicineDropdownOpen}
                onClick={() => setMedicineDropdownOpen(!medicineDropdownOpen)}
              >
                {selectedMedicineIds.length > 0 ? (
                  <SelectedBadges>
                    {selectedMedicineIds.map(mId => {
                      const medObj = medicineList.find(m => m.item_id === mId);
                      return (
                        <BadgeTag key={mId} style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }} onClick={(e) => { e.stopPropagation(); handleToggleMedicine(mId); }}>
                          {medObj ? medObj.item_name : `Item #${mId}`} <X size={14} />
                        </BadgeTag>
                      );
                    })}
                  </SelectedBadges>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Select medicines...</span>
                )}
                <ChevronRight size={18} style={{ transform: medicineDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </DropdownTrigger>

              {medicineDropdownOpen && (
                <DropdownMenu>
                  <DropdownMenuHeader>
                    <span className="count">{selectedMedicineIds.length} Medicines Selected</span>
                    <button type="button" className="close-btn" onClick={() => setMedicineDropdownOpen(false)}>
                      Done <Check size={12} />
                    </button>
                  </DropdownMenuHeader>
                  <DropdownSearchInput
                    type="text"
                    placeholder="Search medicines by item_name..."
                    value={medicineSearch}
                    onChange={e => setMedicineSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  {filteredMedicines.length === 0 ? (
                    <div style={{ padding: '10px', fontSize: '0.875rem', color: '#94a3b8' }}>No medicines found</div>
                  ) : (
                    filteredMedicines.map(m => {
                      const isSelected = selectedMedicineIds.includes(m.item_id);
                      return (
                        <DropdownItem
                          key={m.item_id}
                          $isSelected={isSelected}
                          onClick={() => handleToggleMedicine(m.item_id)}
                        >
                          <div>
                            <span>{m.item_name}</span>
                          </div>
                          <div>
                            {isSelected && <Check size={16} />}
                          </div>
                        </DropdownItem>
                      );
                    })
                  )}
                </DropdownMenu>
              )}
            </DropdownContainer>
          </Card>

          {/* 5. Finding - Input Box */}
          <Card>
            <CardTitle>
              <FileText size={20} /> Clinical Findings & Diagnosis Notes
            </CardTitle>
            <TextArea
              placeholder="Enter doctor's clinical findings, physical examination, and diagnosis notes here..."
              value={finding}
              onChange={e => setFinding(e.target.value)}
            />
          </Card>

          {/* 6. Followup Date Picker */}
          <Card>
            <CardTitle>
              <Calendar size={20} /> Follow-up Date Scheduling
            </CardTitle>
            <DatePickerWrapper>
              <input
                type="date"
                value={followupDate}
                onChange={e => setFollowupDate(e.target.value)}
              />
              <ShortcutButton onClick={() => handleAddDays(3)}>+3 Days</ShortcutButton>
              <ShortcutButton onClick={() => handleAddDays(7)}>+1 Week</ShortcutButton>
              <ShortcutButton onClick={() => handleAddDays(14)}>+2 Weeks</ShortcutButton>
              <ShortcutButton onClick={() => handleAddDays(30)}>+1 Month</ShortcutButton>
              {followupDate && (
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d9488' }}>
                  Selected: {new Date(followupDate).toLocaleDateString()}
                </span>
              )}
            </DatePickerWrapper>
          </Card>

          {/* Bottom Action Bar: Only Save Consultation at Bottom of Page */}
          <BottomActionBar style={{ justifyContent: 'flex-end' }}>
            <Button
              $variant="primary"
              onClick={handleSaveConsultation}
              disabled={savingConsultation}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <Save size={18} />
              {savingConsultation ? "Saving..." : "Save Consultation"}
            </Button>
          </BottomActionBar>
        </Workspace>
      </MainGrid>

      {/* Past History Modal */}
      {showHistoryModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowHistoryModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={22} style={{ color: '#0d9488' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Past Consultation History - {selectedPatient.patient?.patient_name} ({selectedPatient.patient?.uhid})
                </h2>
              </div>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowHistoryModal(false)} />
            </div>

            {loadingHistory ? (
              <div style={{ padding: '24px', color: '#64748b', textAlign: 'center' }}>Loading past history...</div>
            ) : pastHistory.length === 0 ? (
              <div style={{ padding: '24px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                No prior consultation records found for this patient.
              </div>
            ) : (
              <HistoryTimeline>
                {pastHistory.map((item, idx) => (
                  <HistoryCard key={item._id || idx}>
                    <div className="history-header">
                      <div className="date">
                        <Calendar size={16} />
                        {item.created_date ? new Date(item.created_date).toLocaleString() : 'Past Record'}
                      </div>
                      <div className="doctor">
                        Dr. {item.doctor_name || 'Consultant'}
                      </div>
                    </div>

                    <div className="history-grid">
                      {item.symptoms && item.symptoms.length > 0 && (
                        <div className="history-section">
                          <div className="label">Symptoms</div>
                          <div className="content" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {item.symptoms.map(s => (
                              <BadgeTag key={s} style={{ fontSize: '0.75rem' }}>{s}</BadgeTag>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.investigation_details && item.investigation_details.length > 0 && (
                        <div className="history-section">
                          <div className="label">Investigations Ordered</div>
                          <div className="content" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {item.investigation_details.map(t => (
                              <BadgeTag key={t.test_id} style={{ fontSize: '0.75rem', background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                                {t.test_name} (ID: {t.test_id})
                              </BadgeTag>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.prescription_details && item.prescription_details.length > 0 && (
                        <div className="history-section">
                          <div className="label">Prescriptions / Medicines</div>
                          <div className="content" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {item.prescription_details.map(m => (
                              <BadgeTag key={m.item_id} style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                                {m.item_name} (ID: {m.item_id})
                              </BadgeTag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {item.vitals && Object.keys(item.vitals).length > 0 && (
                      <div className="history-section" style={{ marginBottom: '10px' }}>
                        <div className="label">Vitals Snapshot</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8125rem', color: '#334155', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                          {item.vitals.bp && <span><strong>BP:</strong> {item.vitals.bp} mmHg</span>}
                          {item.vitals.pulse_rate && <span><strong>Pulse:</strong> {item.vitals.pulse_rate} bpm</span>}
                          {item.vitals.temp && <span><strong>Temp:</strong> {item.vitals.temp} °F</span>}
                          {item.vitals.bmi && <span><strong>BMI:</strong> {item.vitals.bmi}</span>}
                          {item.vitals.blood_sugar && <span><strong>Sugar:</strong> {item.vitals.blood_sugar} mg/dL</span>}
                        </div>
                      </div>
                    )}

                    {item.finding && (
                      <div className="history-section">
                        <div className="label">Clinical Findings</div>
                        <div className="content" style={{ whiteSpace: 'pre-wrap', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {item.finding}
                        </div>
                      </div>
                    )}

                    {item.followup_date && (
                      <div className="history-section" style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                          Follow-up Date: {new Date(item.followup_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </HistoryCard>
                ))}
              </HistoryTimeline>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button $variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default OPDoctorlogin;
