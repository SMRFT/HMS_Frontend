import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';
import IPClinicalNotesPrint from './IPClinicalNotesPrint';
import IPNursingNotesViewerModal from './IPNursingNotesViewerModal';
import IPPatientHistoryModal from './IPPatientHistoryModal';
import {
  User,
  Activity,
  ArrowLeft,
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
  Trash2,
  X,
  Stethoscope,
  Save,
  Printer,
  ChevronRight,
  Filter,
  History,
  ShieldAlert,
  Edit3,
  Check,
  Tag,
  Info,
  Pill,
  Bed,
  Droplet,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// --- Keyframes ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const Container = styled.div`
  width: 100%;
  height: ${props => props.$isModal ? '100%' : 'calc(100vh - 75px)'};
  max-height: ${props => props.$isModal ? '100%' : 'calc(100vh - 75px)'};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: ${props => props.$isModal ? '0' : '10px 14px'};
  background-color: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 8px;
    height: auto;
    max-height: none;
    overflow-y: auto;
  }
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  margin-bottom: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const LeftHeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const SidebarToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? '#0d9488' : '#cbd5e1'};
  background: ${props => props.$active ? '#ccfbf1' : '#ffffff'};
  color: ${props => props.$active ? '#0f766e' : '#334155'};
  transition: all 0.15s ease;

  &:hover {
    background: #f0fdf4;
    border-color: #0d9488;
    color: #0f766e;
  }

  .badge {
    background: #0d9488;
    color: white;
    font-size: 0.68rem;
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 800;
  }
`;

const DeskTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .title-text {
    h1 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .doc-select-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #334155;
  }

  select {
    border: none;
    background: transparent;
    font-weight: 700;
    color: #0f766e;
    outline: none;
    cursor: pointer;
    font-size: 0.8rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  white-space: nowrap;

  ${props => props.$variant === 'primary' && `
    background: #0d9488;
    color: white;
    box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
    &:hover { background: #0f766e; transform: translateY(-1px); }
  `}

  ${props => props.$variant === 'secondary' && `
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    &:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
  `}

  ${props => props.$variant === 'outline' && `
    background: transparent;
    color: #0d9488;
    border: 1px solid #0d9488;
    &:hover { background: #f0fdf4; }
  `}

  ${props => props.$variant === 'dark' && `
    background: #0f172a;
    color: white;
    &:hover { background: #1e293b; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$showSidebar ? '230px minmax(0, 1fr)' : 'minmax(0, 1fr)'};
  gap: 10px;
  flex: 1;
  min-height: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  transition: grid-template-columns 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
`;

// --- Patient Queue Sidebar ---
const PatientSidebar = styled.div`
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    height: auto;
    max-height: 260px;
  }
`;

const SidebarTop = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid #f1f5f9;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .left-title {
      display: flex;
      align-items: center;
      gap: 6px;

      h3 {
        font-size: 0.84rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .badge {
        background: #ccfbf1;
        color: #0f766e;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 6px;
      }
    }

    .collapse-btn {
      background: #f1f5f9;
      border: none;
      border-radius: 6px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
    }
  }

  .search-wrap {
    position: relative;

    input {
      width: 100%;
      padding: 5px 8px 5px 26px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 0.75rem;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: #0d9488;
        box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
      }
    }

    svg {
      position: absolute;
      left: 7px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
  }
`;

const PatientListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const PatientQueueCard = styled.div`
  padding: 7px 9px;
  border-radius: 7px;
  border: 1px solid ${props => props.$selected ? '#0d9488' : '#f1f5f9'};
  background: ${props => props.$selected ? '#f0fdf4' : '#ffffff'};
  border-left: ${props => props.$selected ? '3px solid #0d9488' : '3px solid transparent'};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: #0d9488;
    background: #f8fafc;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;

    .name {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.82rem;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }

    .room-badge {
      font-size: 0.65rem;
      font-weight: 800;
      color: #0d9488;
      background: #ccfbf1;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
    }
  }

  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.68rem;
    color: #64748b;

    .uhid-tag {
      font-weight: 600;
      color: #475569;
    }

    .ip-tag {
      font-weight: 700;
      color: #0f766e;
    }
  }
`;

// --- Clinical Workspace Area ---
const Workspace = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    height: auto;
    overflow: visible;
  }
`;

const CompactPatientRibbon = styled.div`
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  .single-line-patient {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white;
      font-weight: 800;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .p-name {
      font-size: 0.94rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .gender-age-badge {
      font-size: 0.72rem;
      color: #475569;
      font-weight: 600;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 5px;
    }

    .blood-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #dc2626;
      background: #fee2e2;
      padding: 2px 6px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .visual-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 0.72rem;
      color: #334155;
      font-weight: 600;

      strong {
        color: #0f172a;
        font-weight: 700;
      }

      &.room-chip {
        background: #f0fdf4;
        border-color: #bbf7d0;
        color: #166534;
      }

      &.doctor-chip {
        background: #f0fdfa;
        border-color: #99f6e4;
        color: #0f766e;
      }

      &.id-chip {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }
  }

  .note-meta-inline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    select {
      padding: 3px 8px;
      font-size: 0.74rem;
      border-radius: 5px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      font-weight: 600;
      color: #0f172a;
      outline: none;

      &:focus {
        border-color: #0d9488;
        background: white;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 5px;
      background: ${props => props.$isFinal ? '#dcfce7' : '#fef3c7'};
      color: ${props => props.$isFinal ? '#166534' : '#92400e'};
    }
  }
`;

const PatientActionToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;

  .left-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
`;

const SectionNavigationTabs = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 6px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  flex-shrink: 0;
  scrollbar-width: thin;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const TabButton = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.12s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;

  ${props => props.$active ? `
    background: #0d9488;
    color: #ffffff;
    box-shadow: 0 1px 4px rgba(13, 148, 136, 0.25);
  ` : `
    background: transparent;
    color: #475569;
    &:hover { background: #f1f5f9; color: #0f172a; }
  `}
`;

const ScrollableTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  padding: 14px 18px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.15s ease;

  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  @media (max-width: 1024px) {
    overflow-y: visible;
  }
`;

const CardHeaderTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
  flex-wrap: wrap;
  gap: 6px;

  h3 {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sub {
    font-size: 0.72rem;
    color: #64748b;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  label {
    font-size: 0.76rem;
    font-weight: 700;
    color: #334155;
    letter-spacing: 0.1px;
  }

  input, select, textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    font-size: 0.82rem;
    outline: none;
    font-family: inherit;
    background: #ffffff;
    color: #0f172a;
    transition: all 0.15s ease;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
    }
  }

  textarea {
    min-height: 70px;
    resize: vertical;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const ThreeCol = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const FourCol = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
`;

const Chip = styled.button`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid ${props => props.$selected ? '#0d9488' : '#e2e8f0'};
  background: ${props => props.$selected ? '#ccfbf1' : '#f8fafc'};
  color: ${props => props.$selected ? '#0f766e' : '#475569'};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: #0d9488;
    background: #f0fdf4;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 6px;
  box-sizing: border-box;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  min-width: 540px;

  th, td {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    text-align: left;
  }

  th {
    background: #f8fafc;
    font-weight: 700;
    color: #475569;
  }

  input, select {
    width: 100%;
    padding: 5px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.78rem;
    box-sizing: border-box;
  }
`;

const HistoryDrawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 360px;
  background: white;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
    h3 { margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; }
  }

  .drawer-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const HistoryCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: #0d9488;
    background: #f0fdf4;
  }

  .date { font-size: 0.7rem; color: #64748b; font-weight: 600; }
  .type { font-size: 0.82rem; font-weight: 800; color: #0f172a; margin: 2px 0; }
  .doc { font-size: 0.7rem; color: #0d9488; font-weight: 700; }
  .diag { font-size: 0.7rem; color: #334155; margin-top: 3px; }
`;

// Initial default state for clinical note
const initialNoteState = {
  note_type: 'Admission Note',
  note_date: new Date().toISOString().slice(0, 16),
  is_finalized: false,

  // 1. Allergies
  allergies: {
    has_allergies: false,
    drug: '',
    drug_severity: 'Moderate',
    food: '',
    environmental: '',
    reaction: '',
    notes: ''
  },

  // 2. Chief Complaints
  chief_complaints: [
    { complaint: '', duration: '', severity: 'Moderate', description: '' }
  ],

  // 3. Past History
  past_history: {
    medical_conditions: [],
    surgical_history: '',
    family_history: '',
    medical_notes: ''
  },

  // 4. Present Medications
  present_medications: [
    { name: '', dosage: '', frequency: 'BD', route: 'Oral', duration: 'Ongoing', remarks: '' }
  ],

  // 5. Social History
  social_history: {
    diet: 'Mixed',
    smoking: 'Non-smoker',
    smoking_details: '',
    alcohol: 'Non-alcoholic',
    alcohol_details: '',
    occupation: '',
    lifestyle: 'Sedentary',
    sleep: 'Normal',
    notes: ''
  },

  // 6. Menstrual History
  menstrual_history: {
    menarche_age: '',
    lmp: '',
    cycle: 'Regular',
    cycle_duration: '28-30 days',
    flow: 'Normal',
    dysmenorrhea: 'No',
    menopause: 'No',
    notes: ''
  },

  // 7. Vaccination History
  vaccination_history: {
    covid: 'Completed (2 Doses + Booster)',
    tt: 'Up to date',
    hepb: 'Done',
    influenza: 'Not done',
    others: '',
    notes: ''
  },

  // 8. Obstetrics History
  obstetrics_history: {
    gravida: '',
    para: '',
    abortions: '',
    living: '',
    ectopic: '',
    delivery_type: 'Normal Vaginal',
    lscs_indication: '',
    high_risk: false,
    high_risk_details: '',
    notes: ''
  },

  // 9. Investigations Done
  investigations_done: {
    lab_findings: '',
    radiology_findings: '',
    ecg_echo_findings: '',
    summary: ''
  },

  // 10. Physical Examination
  physical_examination: {
    general: 'Conscious, Oriented to time, place, and person. No pallor, icterus, cyanosis, clubbing, lymphadenopathy, or pedal edema.',
    vitals: {
      pulse: '',
      bp: '',
      temp: '',
      rr: '',
      spo2: '',
      grbs: '',
      height: '',
      weight: '',
      bmi: ''
    },
    systemic_cvs: 'S1, S2 heard normally. No murmurs or clicks.',
    systemic_rs: 'Bilateral normal vesicular breath sounds. No wheeze or crepitations.',
    systemic_cns: 'Higher mental functions normal. Pupils reactive. No focal deficits.',
    systemic_pa: 'Soft, non-tender, no organomegaly or palpable mass, bowel sounds present.',
    local_exam: ''
  },

  // 11. Provisional Diagnosis
  provisional_diagnosis: {
    primary: '',
    secondary: '',
    icd_code: '',
    differential: '',
    notes: ''
  },

  // 12. Plan of Care
  plan_of_care: {
    treatment_orders: '',
    investigations_advised: '',
    diet_orders: 'Regular Inpatient Diet',
    nursing_instructions: 'Monitor vitals Q4H. Strict input/output chart.',
    consults: '',
    follow_up: ''
  },

  additional_notes: ''
};

// Common complaint suggestions
const quickComplaints = [
  'Fever', 'Dry Cough', 'Productive Cough', 'Chest Pain', 'Shortness of Breath',
  'Abdominal Pain', 'Vomiting', 'Loose Stools', 'Headache', 'Giddiness',
  'Body Ache', 'Weakness', 'Loss of Appetite', 'Joint Pain', 'Back Pain'
];

// Common medical conditions
const commonPastMedical = [
  'Diabetes Mellitus (DM)', 'Hypertension (HTN)', 'Coronary Artery Disease (CAD)',
  'Bronchial Asthma', 'COPD', 'Hypothyroidism', 'Chronic Kidney Disease (CKD)',
  'Stroke / CVA', 'Epilepsy / Seizure', 'Tuberculosis (TB)', 'Dyslipidemia'
];

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const IPEMRDesk = ({ initialPatient = null, isModal = false, onClose = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(location.state?.patient || initialPatient);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('ALL');
  const [showSidebar, setShowSidebar] = useState(true);

  const [activeTab, setActiveTab] = useState('allergies');
  const [formData, setFormData] = useState(initialNoteState);
  const [saving, setSaving] = useState(false);

  const [noteHistory, setNoteHistory] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printNoteTarget, setPrintNoteTarget] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);

  // Unsaved Changes Prompt State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const lastSavedSnapshotRef = useRef(JSON.stringify(initialNoteState));

  // Check if form has unsaved modifications
  const hasUnsavedChanges = () => {
    if (formData.is_finalized) return false;
    try {
      return JSON.stringify(formData) !== lastSavedSnapshotRef.current;
    } catch (e) {
      return false;
    }
  };

  // Warn on browser reload / tab close if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Nursing Notes State for Doctor View
  const [nursingNotesCount, setNursingNotesCount] = useState(0);
  const [showNursingNotesViewer, setShowNursingNotesViewer] = useState(false);

  // Patient Clinical History State
  const [showPatientHistoryModal, setShowPatientHistoryModal] = useState(false);

  // Fetch Admitted Patients
  const fetchAdmittedPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await apiRequest(`${HmsBaseUrl}IPEMR_get_admitted_patients/`, 'GET');
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res?.data && Array.isArray(res.data.patients)) {
        list = res.data.patients;
      }
      setPatients(list);
      setSelectedPatient(prev => {
        if (!prev) return list[0] || null;
        const match = list.find(p =>
          (p.ip_number && (p.ip_number === prev.ip_number || p.ip_number === prev.ipNo || p.ip_number === prev.ipNumber)) ||
          (p.uhid && (p.uhid === prev.uhid || p.uhid === prev.patient_id))
        );
        return match ? { ...prev, ...match } : prev;
      });
    } catch (err) {
      console.error("Error fetching IP patients:", err);
      toast.error("Failed to load admitted patients list.");
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchAdmittedPatients();
  }, []);

  // Sync incoming route state or props with full patient list
  useEffect(() => {
    const incoming = location.state?.patient || initialPatient;
    if (incoming) {
      const match = patients.find(p =>
        (p.ip_number && (p.ip_number === incoming.ip_number || p.ip_number === incoming.ipNo || p.ip_number === incoming.ipNumber)) ||
        (p.uhid && (p.uhid === incoming.uhid || p.uhid === incoming.patient_id))
      );
      setSelectedPatient(match ? { ...incoming, ...match } : incoming);
    }
  }, [location.state, initialPatient, patients]);

  // When patient selection changes, fetch their notes history
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientNotes(selectedPatient.ip_number || selectedPatient.ipNumber);
    }
  }, [selectedPatient]);

  const fetchPatientNotes = async (ipNo) => {
    if (!ipNo) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}IPEMR_DoctorNotes/?ip_number=${encodeURIComponent(ipNo)}`, 'GET');
      let notes = [];
      if (Array.isArray(res?.data)) {
        notes = res.data;
      } else if (res?.data && Array.isArray(res.data.data)) {
        notes = res.data.data;
      } else if (res?.data && Array.isArray(res.data.notes)) {
        notes = res.data.notes;
      }
      setNoteHistory(notes);
      
      // Initially display empty note, doctor can select through history
      const blank = {
        ...initialNoteState,
        note_date: new Date().toISOString()
      };
      setFormData(blank);
      lastSavedSnapshotRef.current = JSON.stringify(blank);
      setActiveNoteId(null);

      // Also fetch nursing notes count for this patient
      try {
        const nurseRes = await apiRequest(`${HmsBaseUrl}IPEMR_NursingNotes/?ip_number=${encodeURIComponent(ipNo)}`, 'GET');
        let nNotes = [];
        if (Array.isArray(nurseRes?.data)) nNotes = nurseRes.data;
        else if (nurseRes?.data && Array.isArray(nurseRes.data.data)) nNotes = nurseRes.data.data;
        setNursingNotesCount(nNotes.length);
      } catch (err) {
        console.error("Error fetching nursing notes count:", err);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const handleImportNursingVitals = (nurseVitals) => {
    if (!nurseVitals) return;
    setFormData(prev => ({
      ...prev,
      physical_examination: {
        ...prev.physical_examination,
        vitals: {
          ...prev.physical_examination.vitals,
          pulse: nurseVitals.pulse || prev.physical_examination.vitals.pulse,
          bp: nurseVitals.bp || prev.physical_examination.vitals.bp,
          temp: nurseVitals.temp || prev.physical_examination.vitals.temp,
          rr: nurseVitals.rr || prev.physical_examination.vitals.rr,
          spo2: nurseVitals.spo2 || prev.physical_examination.vitals.spo2,
          grbs: nurseVitals.grbs || prev.physical_examination.vitals.grbs,
          gcs: nurseVitals.gcs || prev.physical_examination.vitals.gcs
        }
      }
    }));
    setActiveTab('physical_exam');
  };

  const parseSafeArray = (val, fallback = []) => {
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'string' && item.includes('OrderedDict')) {
          const obj = {};
          const matches = item.matchAll(/\('([^']+)',\s*'([^']*)'\)/g);
          for (const m of matches) obj[m[1]] = m[2];
          return Object.keys(obj).length > 0 ? obj : item;
        }
        return item;
      });
    }
    if (typeof val === 'string') {
      const s = val.trim();
      if (s.includes('OrderedDict')) {
        const blocks = s.match(/OrderedDict\(\[.*?\]\)/g) || [s];
        const results = [];
        for (const blk of blocks) {
          const obj = {};
          const matches = blk.matchAll(/\('([^']+)',\s*'([^']*)'\)/g);
          for (const m of matches) obj[m[1]] = m[2];
          if (Object.keys(obj).length > 0) results.push(obj);
        }
        if (results.length > 0) return results;
      }
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
      if (s) return [{ complaint: s, duration: '', severity: 'Moderate', description: '' }];
    }
    return fallback;
  };

  const loadNoteIntoForm = (note) => {
    const loadedState = {
      note_type: note.note_type || 'Admission Note',
      note_date: note.note_date ? note.note_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
      is_finalized: Boolean(note.is_finalized),
      allergies: typeof note.allergies === 'object' && note.allergies !== null ? { ...initialNoteState.allergies, ...note.allergies } : initialNoteState.allergies,
      chief_complaints: parseSafeArray(note.chief_complaints, initialNoteState.chief_complaints),
      past_history: typeof note.past_history === 'object' && note.past_history !== null ? { ...initialNoteState.past_history, ...note.past_history } : initialNoteState.past_history,
      present_medications: parseSafeArray(note.present_medications, initialNoteState.present_medications),
      social_history: typeof note.social_history === 'object' && note.social_history !== null ? { ...initialNoteState.social_history, ...note.social_history } : initialNoteState.social_history,
      menstrual_history: typeof note.menstrual_history === 'object' && note.menstrual_history !== null ? { ...initialNoteState.menstrual_history, ...note.menstrual_history } : initialNoteState.menstrual_history,
      vaccination_history: typeof note.vaccination_history === 'object' && note.vaccination_history !== null ? { ...initialNoteState.vaccination_history, ...note.vaccination_history } : initialNoteState.vaccination_history,
      obstetrics_history: typeof note.obstetrics_history === 'object' && note.obstetrics_history !== null ? { ...initialNoteState.obstetrics_history, ...note.obstetrics_history } : initialNoteState.obstetrics_history,
      investigations_done: typeof note.investigations_done === 'object' && note.investigations_done !== null ? { ...initialNoteState.investigations_done, ...note.investigations_done } : initialNoteState.investigations_done,
      physical_examination: {
        ...initialNoteState.physical_examination,
        ...(typeof note.physical_examination === 'object' && note.physical_examination !== null ? note.physical_examination : {}),
        vitals: {
          ...initialNoteState.physical_examination.vitals,
          ...(typeof note.physical_examination?.vitals === 'object' && note.physical_examination?.vitals !== null ? note.physical_examination.vitals : {})
        }
      },
      provisional_diagnosis: typeof note.provisional_diagnosis === 'object' && note.provisional_diagnosis !== null ? { ...initialNoteState.provisional_diagnosis, ...note.provisional_diagnosis } : initialNoteState.provisional_diagnosis,
      plan_of_care: typeof note.plan_of_care === 'object' && note.plan_of_care !== null ? { ...initialNoteState.plan_of_care, ...note.plan_of_care } : initialNoteState.plan_of_care,
      additional_notes: note.additional_notes || ''
    };
    setActiveNoteId(note.id);
    setFormData(loadedState);
    lastSavedSnapshotRef.current = JSON.stringify(loadedState);
    toast.info(`Loaded ${note.note_type} dated ${new Date(note.note_date).toLocaleDateString()}`);
  };

  // Doctors list for filter
  const doctorOptions = useMemo(() => {
    const set = new Set();
    const list = Array.isArray(patients) ? patients : [];
    list.forEach(p => {
      if (p.doctor_name) set.add(p.doctor_name);
    });
    return Array.from(set);
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const list = Array.isArray(patients) ? patients : [];
    return list.filter(p => {
      const matchDoc = selectedDoctorFilter === 'ALL' || p.doctor_name === selectedDoctorFilter;
      const q = patientSearch.toLowerCase().trim();
      const matchSearch = !q || (
        (p.patient_name || '').toLowerCase().includes(q) ||
        (p.uhid || '').toLowerCase().includes(q) ||
        (p.ip_number || '').toLowerCase().includes(q) ||
        (p.room_no || '').toLowerCase().includes(q) ||
        (p.bed_no || '').toLowerCase().includes(q)
      );
      return matchDoc && matchSearch;
    });
  }, [patients, selectedDoctorFilter, patientSearch]);

  // Save Note Handler
  const handleSaveNote = async (isFinal = false) => {
    if (!selectedPatient) {
      toast.warning("Please select a patient first.");
      return false;
    }
    if (formData.is_finalized) {
      toast.info("This clinical note is already finalized and locked.");
      return false;
    }

    try {
      setSaving(true);
      const payload = {
        ...(activeNoteId ? { id: activeNoteId } : {}),
        uhid: selectedPatient.uhid || '',
        ip_number: selectedPatient.ip_number || selectedPatient.ipNumber || '',
        doctor_id: selectedPatient.doctor_id || selectedPatient.admittingDoctor || '',
        department: selectedPatient.department || 'Inpatient Medicine',
        note_type: formData.note_type,
        note_date: new Date().toISOString(),
        is_finalized: isFinal,
        allergies: formData.allergies,
        chief_complaints: formData.chief_complaints.filter(c => c.complaint?.trim()),
        past_history: formData.past_history,
        present_medications: formData.present_medications.filter(m => m.name?.trim()),
        social_history: formData.social_history,
        menstrual_history: formData.menstrual_history,
        vaccination_history: formData.vaccination_history,
        obstetrics_history: formData.obstetrics_history,
        investigations_done: formData.investigations_done,
        physical_examination: formData.physical_examination,
        provisional_diagnosis: formData.provisional_diagnosis,
        plan_of_care: formData.plan_of_care,
        additional_notes: formData.additional_notes
      };

      const res = await apiRequest(`${HmsBaseUrl}IPEMR_DoctorNotes/`, 'POST', payload);

      if (res && (res.status === 'success' || res.data)) {
        toast.success(isFinal ? "Clinical Note finalized and saved!" : "Clinical Note saved successfully!");
        if (res.data?.id) setActiveNoteId(res.data.id);
        const updatedState = { ...formData, is_finalized: isFinal };
        setFormData(updatedState);
        lastSavedSnapshotRef.current = JSON.stringify(updatedState);
        fetchPatientNotes(selectedPatient.ip_number || selectedPatient.ipNumber);

        // If finalized and originated from Ward Management, return back smoothly
        if (isFinal && location.state?.from && !pendingAction) {
          setTimeout(() => {
            navigate(location.state.from);
          }, 800);
        }
        return true;
      } else {
        toast.error(res.message || "Failed to save clinical note.");
        return false;
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving doctor note.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewNote = () => {
    setActiveNoteId(null);
    const blank = {
      ...initialNoteState,
      note_type: 'Daily Progress Note',
      note_date: new Date().toISOString()
    };
    setFormData(blank);
    lastSavedSnapshotRef.current = JSON.stringify(blank);
    toast.info("Started a new clinical note draft.");
  };

  // Interceptors for switching patient / creating new note / navigating away
  const executePendingAction = (action) => {
    if (!action) return;
    if (action.type === 'SWITCH_PATIENT') {
      setSelectedPatient(action.payload);
    } else if (action.type === 'NEW_NOTE') {
      handleCreateNewNote();
    } else if (action.type === 'NAVIGATE') {
      navigate(action.payload);
    } else if (action.type === 'LOAD_NOTE') {
      loadNoteIntoForm(action.payload);
      setShowHistoryDrawer(false);
    }
  };

  const handleUnsavedDecision = async (decision) => {
    if (decision === 'FINALIZE') {
      const ok = await handleSaveNote(true);
      if (ok) {
        setShowUnsavedModal(false);
        const action = pendingAction;
        setPendingAction(null);
        executePendingAction(action);
      }
    } else if (decision === 'SAVE_DRAFT') {
      const ok = await handleSaveNote(false);
      if (ok) {
        setShowUnsavedModal(false);
        const action = pendingAction;
        setPendingAction(null);
        executePendingAction(action);
      }
    } else if (decision === 'DISCARD') {
      setShowUnsavedModal(false);
      const action = pendingAction;
      setPendingAction(null);
      lastSavedSnapshotRef.current = JSON.stringify(initialNoteState);
      executePendingAction(action);
    } else if (decision === 'CANCEL') {
      setShowUnsavedModal(false);
      setPendingAction(null);
    }
  };

  const handlePatientSelect = (p) => {
    if (selectedPatient && (selectedPatient.ip_number === p.ip_number || selectedPatient.id === p.id)) return;
    if (hasUnsavedChanges()) {
      setPendingAction({ type: 'SWITCH_PATIENT', payload: p });
      setShowUnsavedModal(true);
    } else {
      setSelectedPatient(p);
    }
  };

  const triggerCreateNewNote = () => {
    if (hasUnsavedChanges()) {
      setPendingAction({ type: 'NEW_NOTE' });
      setShowUnsavedModal(true);
    } else {
      handleCreateNewNote();
    }
  };

  const handleNavigateAway = (targetRoute) => {
    if (hasUnsavedChanges()) {
      setPendingAction({ type: 'NAVIGATE', payload: targetRoute });
      setShowUnsavedModal(true);
    } else {
      navigate(targetRoute);
    }
  };

  const handleSelectHistoricalNote = (note) => {
    if (hasUnsavedChanges()) {
      setPendingAction({ type: 'LOAD_NOTE', payload: note });
      setShowUnsavedModal(true);
    } else {
      loadNoteIntoForm(note);
      setShowHistoryDrawer(false);
    }
  };

  // Helper state updater
  const updateNestedState = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Dynamic row additions
  const addComplaintRow = () => {
    setFormData(prev => ({
      ...prev,
      chief_complaints: [
        ...(Array.isArray(prev.chief_complaints) ? prev.chief_complaints : []),
        { complaint: '', duration: '', severity: 'Moderate', description: '' }
      ]
    }));
  };

  const removeComplaintRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      chief_complaints: (Array.isArray(prev.chief_complaints) ? prev.chief_complaints : []).filter((_, i) => i !== idx)
    }));
  };

  const addMedicationRow = () => {
    setFormData(prev => ({
      ...prev,
      present_medications: [
        ...(Array.isArray(prev.present_medications) ? prev.present_medications : []),
        { name: '', dosage: '', frequency: 'BD', route: 'Oral', duration: 'Ongoing', remarks: '' }
      ]
    }));
  };

  const removeMedicationRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      present_medications: (Array.isArray(prev.present_medications) ? prev.present_medications : []).filter((_, i) => i !== idx)
    }));
  };

  const togglePastCondition = (cond) => {
    setFormData(prev => {
      const current = prev.past_history.medical_conditions || [];
      const updated = current.includes(cond) ? current.filter(c => c !== cond) : [...current, cond];
      return {
        ...prev,
        past_history: {
          ...prev.past_history,
          medical_conditions: updated
        }
      };
    });
  };

  return (
    <Container $isModal={isModal}>
      {/* 1. Top Action & Navigation Bar */}
      {!isModal && (
        <TopActionBar>
          <LeftHeaderGroup>
            <SidebarToggleButton
              $active={showSidebar}
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide Patient Queue" : "Show Patient Queue"}
            >
              {showSidebar ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
              {showSidebar ? 'Hide Queue' : 'Show Queue'}
              {!showSidebar && (
                <span className="badge">{filteredPatients.length}</span>
              )}
            </SidebarToggleButton>

            <DeskTitle>
              <div className="icon-box"><Stethoscope size={18} /></div>
              <div className="title-text">
                <h1>Inpatient Doctor EMR Desk</h1>
              </div>
            </DeskTitle>
          </LeftHeaderGroup>

          <HeaderControls>
            <ActionButton
              $variant="outline"
              style={{
                borderColor: '#99f6e4',
                color: '#0f766e',
                fontWeight: 700,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0fdfa'
              }}
              onClick={() => handleNavigateAway('/IPDoctorDashboard')}
              title="View Doctor Dashboard & Analytics"
            >
              <Activity size={14} /> Doctor Dashboard
            </ActionButton>

            {/* Right side Ward Request Button */}
            <ActionButton
              $variant="primary"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: 'white',
                fontWeight: 800,
                padding: '7px 14px',
                boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => handleNavigateAway(location.state?.from || '/wardrequest')}
              title="Navigate to Ward Request"
            >
              <ArrowLeft size={14} /> Ward Request
            </ActionButton>
          </HeaderControls>
        </TopActionBar>
      )}

      <MainGrid $showSidebar={showSidebar && !isModal}>
        {/* Left Patient Queue Sidebar (Collapsible) */}
        {showSidebar && !isModal && (
          <PatientSidebar>
            <SidebarTop>
              <div className="title-row">
                <div className="left-title">
                  <h3><Bed size={14} /> Queue</h3>
                  <span className="badge">{filteredPatients.length} Active</span>
                </div>
                <button
                  className="collapse-btn"
                  onClick={() => setShowSidebar(false)}
                  title="Hide Queue"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>
              <div className="search-wrap">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search patient, bed, UHID..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
            </SidebarTop>

            <PatientListContainer>
              {filteredPatients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: '0.78rem' }}>
                  No patients found.
                </div>
              ) : (
                filteredPatients.map((p) => {
                  const isSel = selectedPatient && (selectedPatient.ip_number === p.ip_number || selectedPatient.id === p.id);
                  return (
                    <PatientQueueCard
                      key={p.ip_number || p.id}
                      $selected={isSel}
                      onClick={() => handlePatientSelect(p)}
                    >
                      <div className="top">
                        <span className="name">{p.patient_name}</span>
                      </div>
                      <div className="bottom-row">
                        <span className="uhid-tag">UHID: {p.uhid || '-'}</span>
                        <span className="ip-tag">IP: {p.ip_number || p.ipNumber}</span>
                      </div>
                    </PatientQueueCard>
                  );
                })
              )}
            </PatientListContainer>
          </PatientSidebar>
        )}

        {/* Right Workspace Area */}
        <Workspace>
          {/* 2. Compact Patient & Note Header Ribbon with Rich Visuals */}
          {selectedPatient ? (() => {
            const pName = selectedPatient.patient_name || selectedPatient.patientName || selectedPatient.name || 'Patient';
            const cleanName = pName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Master|Baby)\s+/i, '').trim();
            const pInitial = (cleanName[0] || pName[0] || 'P').toUpperCase();
            const pGender = selectedPatient.gender || selectedPatient.Gender || selectedPatient.patient?.gender || '';
            const pAge = selectedPatient.age || selectedPatient.Age || selectedPatient.patient?.age || '';
            const pBlood = selectedPatient.blood_group || selectedPatient.bloodGroup || selectedPatient.bloodgroup || selectedPatient.BloodGroup || selectedPatient.patient?.blood_group || selectedPatient.patient?.bloodGroup || selectedPatient.blood_type || '';
            const pUhid = selectedPatient.uhid || selectedPatient.patient_id || selectedPatient.patientId || selectedPatient.patient?.uhid || '-';
            const pIp = selectedPatient.ip_number || selectedPatient.ipNumber || selectedPatient.ip_no || selectedPatient.admission_id || '-';
            let pRoom = selectedPatient.room_no || selectedPatient.roomNo || selectedPatient.room || '';
            let pBed = selectedPatient.bed_no || selectedPatient.bedNo || selectedPatient.bed || '';
            if ((!pRoom || !pBed) && Array.isArray(selectedPatient.room_details)) {
              for (const rd of selectedPatient.room_details) {
                if (rd && (rd.is_roomActive || rd.status === 'Active' || !pRoom)) {
                  pRoom = rd.roomNo || rd.room_no || pRoom;
                  pBed = rd.bedNo || rd.bed_no || pBed;
                  if (rd.is_roomActive || rd.status === 'Active') break;
                }
              }
            }

            return (
              <>
                <CompactPatientRibbon $isFinal={formData.is_finalized}>
                  <div className="single-line-patient">
                    <div className="avatar">
                      {pInitial}
                    </div>
                    <span className="p-name">{pName}</span>
                    {(pGender || pAge) && (
                      <span className="gender-age-badge">
                        {pGender}{pGender && pAge ? ' · ' : ''}{pAge ? `${pAge} yrs` : ''}
                      </span>
                    )}
                    <span className="blood-badge" title={pBlood ? `Blood Group: ${pBlood}` : "Blood Group not specified"}>
                      <Droplet size={11} fill={pBlood ? "#dc2626" : "none"} color="#dc2626" />
                      {pBlood ? pBlood : '-'}
                    </span>
                    <span className="visual-chip id-chip">
                      UHID: <strong>{pUhid}</strong>
                    </span>
                    <span className="visual-chip id-chip">
                      IP No: <strong>{pIp}</strong>
                    </span>
                    <span className="visual-chip room-chip">
                      <Bed size={12} /> Room <strong>{pRoom || '-'}</strong> · Bed <strong>{pBed || '-'}</strong>
                    </span>
                  </div>

                  <div className="note-meta-inline">
                    <label>Type:</label>
                    <select
                      value={formData.note_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, note_type: e.target.value }))}
                      disabled={formData.is_finalized}
                    >
                      <option value="Admission Note">Admission Note</option>
                      <option value="Daily Progress Note">Daily Progress Note</option>
                      <option value="Consultation Note">Consultation Note</option>
                      <option value="Pre-Op Note">Pre-Op Note</option>
                      <option value="Post-Op Note">Post-Op Note</option>
                      <option value="Emergency Note">Emergency Note</option>
                      <option value="Discharge Note">Discharge Note</option>
                    </select>

                    <span className="status-badge">
                      {formData.is_finalized ? 'Finalized' : 'Draft'}
                    </span>
                  </div>
                </CompactPatientRibbon>

                {/* Patient Specific Action Toolbar */}
                <PatientActionToolbar>
                  <div className="left-actions">
                    <ActionButton
                      $variant="outline"
                      style={{
                        borderColor: '#16a34a',
                        color: '#166534',
                        background: '#f0fdf4',
                        fontWeight: 800
                      }}
                      onClick={() => setShowNursingNotesViewer(true)}
                    >
                      <Activity size={14} color="#16a34a" /> Nursing Notes & Vitals
                      {nursingNotesCount > 0 && (
                        <span style={{
                          background: '#16a34a',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '0.68rem',
                          fontWeight: 800
                        }}>
                          {nursingNotesCount}
                        </span>
                      )}
                    </ActionButton>

                    <ActionButton
                      $variant="outline"
                      style={{
                        borderColor: '#0d9488',
                        color: '#0f766e',
                        background: '#f0fdf4',
                        fontWeight: 800
                      }}
                      onClick={() => setShowPatientHistoryModal(true)}
                      title="View Complete Patient Clinical & Diagnostics History (No Financials)"
                    >
                      <History size={14} color="#0d9488" /> Patient History
                    </ActionButton>

                    <ActionButton $variant="outline" onClick={triggerCreateNewNote}>
                      <Plus size={14} /> New Note
                    </ActionButton>

                    <ActionButton $variant="secondary" onClick={() => setShowHistoryDrawer(true)}>
                      <History size={14} /> History ({noteHistory.length})
                    </ActionButton>
                  </div>

                  <div className="right-actions">
                    <ActionButton
                      $variant="secondary"
                      onClick={() => handleSaveNote(false)}
                      disabled={saving || formData.is_finalized}
                      title={formData.is_finalized ? "This note is finalized and locked" : "Save Draft"}
                    >
                      <Save size={14} /> {saving ? 'Saving...' : activeNoteId ? 'Update Draft' : 'Save Draft'}
                    </ActionButton>

                    <ActionButton
                      $variant="primary"
                      onClick={() => handleSaveNote(true)}
                      disabled={saving || formData.is_finalized}
                      title={formData.is_finalized ? "This note is already finalized" : "Finalize Note"}
                    >
                      <CheckCircle2 size={14} /> Finalize Note
                    </ActionButton>

                    <ActionButton
                      $variant="dark"
                      onClick={() => {
                        setPrintNoteTarget(null);
                        setShowPrintModal(true);
                      }}
                      disabled={!formData.is_finalized}
                      title={!formData.is_finalized ? "Note must be finalized before printing" : "Print Clinical Note"}
                      style={{
                        opacity: !formData.is_finalized ? 0.45 : 1,
                        cursor: !formData.is_finalized ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Printer size={14} /> Print
                    </ActionButton>
                  </div>
                </PatientActionToolbar>
              </>
            );
          })() : (
            <div style={{ background: 'white', padding: '24px', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Please select an admitted patient from the queue to start clinical documentation.
            </div>
          )}

          {/* 3. Section Navigation Tabs */}
          {selectedPatient && (
            <SectionNavigationTabs>
              <TabButton $active={activeTab === 'allergies'} onClick={() => setActiveTab('allergies')}>
                <ShieldAlert size={13} /> 1. Allergies
              </TabButton>
              <TabButton $active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')}>
                <AlertCircle size={13} /> 2. Chief Complaints
              </TabButton>
              <TabButton $active={activeTab === 'past_history'} onClick={() => setActiveTab('past_history')}>
                <History size={13} /> 3. Past History
              </TabButton>
              <TabButton $active={activeTab === 'medications'} onClick={() => setActiveTab('medications')}>
                <Pill size={13} /> 4. Present Medications
              </TabButton>
              <TabButton $active={activeTab === 'social'} onClick={() => setActiveTab('social')}>
                <User size={13} /> 5. Social History
              </TabButton>
              <TabButton $active={activeTab === 'menstrual_obstetrics'} onClick={() => setActiveTab('menstrual_obstetrics')}>
                <Activity size={13} /> 6 & 8. Menstrual & Obstetric
              </TabButton>
              <TabButton $active={activeTab === 'vaccination'} onClick={() => setActiveTab('vaccination')}>
                <CheckCircle2 size={13} /> 7. Vaccination
              </TabButton>
              <TabButton $active={activeTab === 'investigations'} onClick={() => setActiveTab('investigations')}>
                <FileText size={13} /> 9. Investigations Done
              </TabButton>
              <TabButton $active={activeTab === 'physical_exam'} onClick={() => setActiveTab('physical_exam')}>
                <Heart size={13} /> 10. Physical Examination
              </TabButton>
              <TabButton $active={activeTab === 'diagnosis'} onClick={() => setActiveTab('diagnosis')}>
                <Stethoscope size={13} /> 11. Provisional Diagnosis
              </TabButton>
              <TabButton $active={activeTab === 'plan_of_care'} onClick={() => setActiveTab('plan_of_care')}>
                <Check size={13} /> 12. Plan of Care
              </TabButton>
            </SectionNavigationTabs>
          )}

          {/* 4. Single Scrollable Tab Content Container */}
          {selectedPatient && (
            <ScrollableTabContent>
              {/* TAB 1: ALLERGIES */}
              {activeTab === 'allergies' && (
                <div>
                  <CardHeaderTitle>
                    <h3><ShieldAlert size={16} color="#ef4444" /> 1. Known Allergies</h3>
                    <span className="sub">Document drug, food, or environmental hypersensitivities</span>
                  </CardHeaderTitle>

                  <TwoCol>
                    <FormGroup>
                      <label>Drug Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Penicillin, Sulfa drugs, NSAIDs, Cephalosporins"
                        value={formData.allergies.drug || ''}
                        onChange={(e) => updateNestedState('allergies', 'drug', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Drug Allergy Severity</label>
                      <select
                        value={formData.allergies.drug_severity || 'Moderate'}
                        onChange={(e) => updateNestedState('allergies', 'drug_severity', e.target.value)}
                      >
                        <option value="Mild">Mild (Rash / Itching)</option>
                        <option value="Moderate">Moderate (Urticaria / Bronchospasm)</option>
                        <option value="Severe">Severe / Life Threatening (Anaphylaxis / Angioedema)</option>
                      </select>
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Food Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Peanuts, Seafood, Dairy, Eggs, Gluten"
                        value={formData.allergies.food || ''}
                        onChange={(e) => updateNestedState('allergies', 'food', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Environmental / Latex / Contrast Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Dust mites, Pollen, IV Contrast Dye, Latex gloves"
                        value={formData.allergies.environmental || ''}
                        onChange={(e) => updateNestedState('allergies', 'environmental', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Reaction Symptoms Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Facial edema, wheezing, maculopapular rash"
                        value={formData.allergies.reaction || ''}
                        onChange={(e) => updateNestedState('allergies', 'reaction', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Allergy Management Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Carry EpiPen, Red wristband affixed"
                        value={formData.allergies.notes || ''}
                        onChange={(e) => updateNestedState('allergies', 'notes', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 2: CHIEF COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div>
                  <CardHeaderTitle>
                    <h3><AlertCircle size={16} color="#0d9488" /> 2. Chief Complaints</h3>
                    <span className="sub">Reason for hospitalization with duration and severity</span>
                  </CardHeaderTitle>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Quick Add Common Symptoms:</label>
                    <ChipContainer>
                      {quickComplaints.map(sym => (
                        <Chip
                          key={sym}
                          type="button"
                          onClick={() => {
                            const exists = formData.chief_complaints.some(c => c.complaint === sym);
                            if (!exists) {
                              setFormData(prev => ({
                                ...prev,
                                chief_complaints: [...prev.chief_complaints, { complaint: sym, duration: '2 days', severity: 'Moderate', description: '' }]
                              }));
                            }
                          }}
                        >
                          + {sym}
                        </Chip>
                      ))}
                    </ChipContainer>
                  </div>

                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <th style={{ width: '30%' }}>Chief Complaint</th>
                          <th style={{ width: '20%' }}>Duration</th>
                          <th style={{ width: '20%' }}>Severity</th>
                          <th style={{ width: '25%' }}>Details / Onset</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(formData.chief_complaints) ? formData.chief_complaints : []).map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                placeholder="Complaint (e.g. Chest pain)"
                                value={item.complaint || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.chief_complaints) ? prev.chief_complaints : [])];
                                    if (arr[idx]) arr[idx].complaint = val;
                                    return { ...prev, chief_complaints: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="e.g. 3 days, 2 weeks"
                                value={item.duration || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.chief_complaints) ? prev.chief_complaints : [])];
                                    if (arr[idx]) arr[idx].duration = val;
                                    return { ...prev, chief_complaints: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <select
                                value={item.severity || 'Moderate'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.chief_complaints) ? prev.chief_complaints : [])];
                                    if (arr[idx]) arr[idx].severity = val;
                                    return { ...prev, chief_complaints: arr };
                                  });
                                }}
                              >
                                <option value="Mild">Mild</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Severe">Severe</option>
                                <option value="Episodic">Episodic</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Associated symptoms / triggers"
                                value={item.description || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.chief_complaints) ? prev.chief_complaints : [])];
                                    if (arr[idx]) arr[idx].description = val;
                                    return { ...prev, chief_complaints: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeComplaintRow(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>

                  <div style={{ marginTop: '10px' }}>
                    <ActionButton $variant="outline" type="button" onClick={addComplaintRow}>
                      <Plus size={13} /> Add Another Complaint
                    </ActionButton>
                  </div>
                </div>
              )}

              {/* TAB 3: PAST HISTORY */}
              {activeTab === 'past_history' && (
                <div>
                  <CardHeaderTitle>
                    <h3><History size={16} color="#0d9488" /> 3. Past Medical & Surgical History</h3>
                    <span className="sub">Previous medical conditions, surgeries, and family genetics</span>
                  </CardHeaderTitle>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Known Medical Comorbidities (Select all that apply):</label>
                    <ChipContainer>
                      {commonPastMedical.map(cond => {
                        const sel = (formData.past_history.medical_conditions || []).includes(cond);
                        return (
                          <Chip
                            key={cond}
                            type="button"
                            $selected={sel}
                            onClick={() => togglePastCondition(cond)}
                          >
                            {sel ? '✓ ' : '+ '} {cond}
                          </Chip>
                        );
                      })}
                    </ChipContainer>
                  </div>

                  <FormGroup>
                    <label>Past Medical History Notes / Details</label>
                    <textarea
                      placeholder="e.g. Diagnosed with Type 2 DM 5 years ago, on oral hypoglycemics. Hypertension since 2020."
                      value={formData.past_history.medical_notes || ''}
                      onChange={(e) => updateNestedState('past_history', 'medical_notes', e.target.value)}
                    />
                  </FormGroup>

                  <TwoCol>
                    <FormGroup>
                      <label>Past Surgical History</label>
                      <textarea
                        placeholder="e.g. Appendectomy (2018), Cholecystectomy (2021) — no anaesthetic complications."
                        value={formData.past_history.surgical_history || ''}
                        onChange={(e) => updateNestedState('past_history', 'surgical_history', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Family History</label>
                      <textarea
                        placeholder="e.g. Father had premature CAD / MI at age 52. Mother has Type 2 DM and HTN."
                        value={formData.past_history.family_history || ''}
                        onChange={(e) => updateNestedState('past_history', 'family_history', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 4: PRESENT MEDICATIONS */}
              {activeTab === 'medications' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Pill size={16} color="#0d9488" /> 4. Present Medications</h3>
                    <span className="sub">Ongoing prescription, OTC, and pre-admission drugs</span>
                  </CardHeaderTitle>

                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <th style={{ width: '28%' }}>Medication Name</th>
                          <th style={{ width: '16%' }}>Dosage</th>
                          <th style={{ width: '16%' }}>Frequency</th>
                          <th style={{ width: '14%' }}>Route</th>
                          <th style={{ width: '21%' }}>Duration / Indication</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(formData.present_medications) ? formData.present_medications : []).map((med, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                placeholder="e.g. Tab. Metformin"
                                value={med.name || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.present_medications) ? prev.present_medications : [])];
                                    if (arr[idx]) arr[idx].name = val;
                                    return { ...prev, present_medications: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="e.g. 500 mg"
                                value={med.dosage || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.present_medications) ? prev.present_medications : [])];
                                    if (arr[idx]) arr[idx].dosage = val;
                                    return { ...prev, present_medications: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <select
                                value={med.frequency || 'BD'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.present_medications) ? prev.present_medications : [])];
                                    if (arr[idx]) arr[idx].frequency = val;
                                    return { ...prev, present_medications: arr };
                                  });
                                }}
                              >
                                <option value="OD">OD (Once daily)</option>
                                <option value="BD">BD (Twice daily)</option>
                                <option value="TDS">TDS (Thrice daily)</option>
                                <option value="QID">QID (Four times daily)</option>
                                <option value="HS">HS (At bedtime)</option>
                                <option value="SOS">SOS (As needed)</option>
                                <option value="STAT">STAT (Immediately)</option>
                              </select>
                            </td>
                            <td>
                              <select
                                value={med.route || 'Oral'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.present_medications) ? prev.present_medications : [])];
                                    if (arr[idx]) arr[idx].route = val;
                                    return { ...prev, present_medications: arr };
                                  });
                                }}
                              >
                                <option value="Oral">Oral</option>
                                <option value="IV">Intravenous (IV)</option>
                                <option value="IM">Intramuscular (IM)</option>
                                <option value="SC">Subcutaneous (SC)</option>
                                <option value="Inhalation">Inhalation / Neb</option>
                                <option value="Topical">Topical</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="e.g. For DM, 6 months"
                                value={med.duration || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const arr = [...(Array.isArray(prev.present_medications) ? prev.present_medications : [])];
                                    if (arr[idx]) arr[idx].duration = val;
                                    return { ...prev, present_medications: arr };
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeMedicationRow(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>

                  <div style={{ marginTop: '10px' }}>
                    <ActionButton $variant="outline" type="button" onClick={addMedicationRow}>
                      <Plus size={13} /> Add Another Medication
                    </ActionButton>
                  </div>
                </div>
              )}

              {/* TAB 5: SOCIAL HISTORY */}
              {activeTab === 'social' && (
                <div>
                  <CardHeaderTitle>
                    <h3><User size={16} color="#0d9488" /> 5. Social & Lifestyle History</h3>
                    <span className="sub">Habits, diet, occupation, and living environment</span>
                  </CardHeaderTitle>

                  <ThreeCol>
                    <FormGroup>
                      <label>Dietary Habit</label>
                      <select
                        value={formData.social_history.diet || 'Mixed'}
                        onChange={(e) => updateNestedState('social_history', 'diet', e.target.value)}
                      >
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Diabetic Diet">Diabetic Diet</option>
                        <option value="Low Sodium">Low Sodium</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Smoking / Tobacco Status</label>
                      <select
                        value={formData.social_history.smoking || 'Non-smoker'}
                        onChange={(e) => updateNestedState('social_history', 'smoking', e.target.value)}
                      >
                        <option value="Non-smoker">Non-smoker</option>
                        <option value="Current Smoker">Current Smoker</option>
                        <option value="Ex-smoker">Ex-smoker / Quit</option>
                        <option value="Tobacco Chewer">Chewing Tobacco</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Alcohol Consumption</label>
                      <select
                        value={formData.social_history.alcohol || 'Non-alcoholic'}
                        onChange={(e) => updateNestedState('social_history', 'alcohol', e.target.value)}
                      >
                        <option value="Non-alcoholic">Non-alcoholic</option>
                        <option value="Occasional / Social">Occasional / Social</option>
                        <option value="Moderate">Moderate drinker</option>
                        <option value="Heavy / Dependent">Heavy / Chronic drinker</option>
                      </select>
                    </FormGroup>
                  </ThreeCol>

                  <ThreeCol>
                    <FormGroup>
                      <label>Occupation</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer, Farmer, Teacher"
                        value={formData.social_history.occupation || ''}
                        onChange={(e) => updateNestedState('social_history', 'occupation', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Physical Activity / Exercise</label>
                      <select
                        value={formData.social_history.lifestyle || 'Sedentary'}
                        onChange={(e) => updateNestedState('social_history', 'lifestyle', e.target.value)}
                      >
                        <option value="Sedentary">Sedentary</option>
                        <option value="Lightly Active">Lightly Active</option>
                        <option value="Moderately Active">Moderately Active</option>
                        <option value="Very Active">Very Active</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Sleep Quality / Pattern</label>
                      <select
                        value={formData.social_history.sleep || 'Normal'}
                        onChange={(e) => updateNestedState('social_history', 'sleep', e.target.value)}
                      >
                        <option value="Normal">Normal (6-8 hrs)</option>
                        <option value="Insomnia">Insomnia / Disturbed</option>
                        <option value="Snoring / OSA">Snoring / Suspected OSA</option>
                      </select>
                    </FormGroup>
                  </ThreeCol>

                  <FormGroup>
                    <label>Additional Social Notes (Pack-years, home environment, etc.)</label>
                    <textarea
                      placeholder="e.g. Smoked 1 pack/day for 15 years (15 pack-years). Lives with spouse in urban apartment."
                      value={formData.social_history.notes || ''}
                      onChange={(e) => updateNestedState('social_history', 'notes', e.target.value)}
                    />
                  </FormGroup>
                </div>
              )}

              {/* TAB 6 & 8: MENSTRUAL & OBSTETRICS HISTORY */}
              {activeTab === 'menstrual_obstetrics' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Activity size={16} color="#0d9488" /> 6. Menstrual History & 8. Obstetrics History</h3>
                    <span className="sub">For female patients: Gynecological and obstetric records</span>
                  </CardHeaderTitle>

                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0d9488' }}>Menstrual History</h4>
                  <FourCol>
                    <FormGroup>
                      <label>Age at Menarche</label>
                      <input
                        type="number"
                        placeholder="e.g. 13"
                        value={formData.menstrual_history.menarche_age || ''}
                        onChange={(e) => updateNestedState('menstrual_history', 'menarche_age', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Last Menstrual Period (LMP)</label>
                      <input
                        type="date"
                        value={formData.menstrual_history.lmp || ''}
                        onChange={(e) => updateNestedState('menstrual_history', 'lmp', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Cycle Regularity</label>
                      <select
                        value={formData.menstrual_history.cycle || 'Regular'}
                        onChange={(e) => updateNestedState('menstrual_history', 'cycle', e.target.value)}
                      >
                        <option value="Regular">Regular (28-30 days)</option>
                        <option value="Irregular">Irregular</option>
                        <option value="Oligomenorrhea">Oligomenorrhea</option>
                        <option value="Amenorrhea">Amenorrhea</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Flow Intensity / Dysmenorrhea</label>
                      <select
                        value={formData.menstrual_history.flow || 'Normal'}
                        onChange={(e) => updateNestedState('menstrual_history', 'flow', e.target.value)}
                      >
                        <option value="Normal">Normal Flow / No Pain</option>
                        <option value="Heavy (Menorrhagia)">Heavy Flow (Menorrhagia)</option>
                        <option value="Scanty">Scanty Flow</option>
                        <option value="Painful (Dysmenorrhea)">Dysmenorrhea (Painful)</option>
                        <option value="Postmenopausal">Postmenopausal</option>
                      </select>
                    </FormGroup>
                  </FourCol>

                  <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '14px 0' }} />

                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0d9488' }}>Obstetrics History (G P L A E)</h4>
                  <FourCol>
                    <FormGroup>
                      <label>Gravida (G)</label>
                      <input
                        type="number"
                        placeholder="Total pregnancies"
                        value={formData.obstetrics_history.gravida || ''}
                        onChange={(e) => updateNestedState('obstetrics_history', 'gravida', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Para (P)</label>
                      <input
                        type="number"
                        placeholder="Viable births"
                        value={formData.obstetrics_history.para || ''}
                        onChange={(e) => updateNestedState('obstetrics_history', 'para', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Living Children (L)</label>
                      <input
                        type="number"
                        placeholder="Living children"
                        value={formData.obstetrics_history.living || ''}
                        onChange={(e) => updateNestedState('obstetrics_history', 'living', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Abortions / Miscarriages (A)</label>
                      <input
                        type="number"
                        placeholder="Abortions"
                        value={formData.obstetrics_history.abortions || ''}
                        onChange={(e) => updateNestedState('obstetrics_history', 'abortions', e.target.value)}
                      />
                    </FormGroup>
                  </FourCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Previous Delivery Mode</label>
                      <select
                        value={formData.obstetrics_history.delivery_type || 'Normal Vaginal'}
                        onChange={(e) => updateNestedState('obstetrics_history', 'delivery_type', e.target.value)}
                      >
                        <option value="Normal Vaginal">Full Term Normal Delivery (FTND)</option>
                        <option value="LSCS">Lower Segment Cesarean Section (LSCS)</option>
                        <option value="Instrumental">Instrumental (Forceps/Vacuum)</option>
                        <option value="Nulliparous">Nulliparous (No prior births)</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>High Risk Pregnancy Alert / Indication</label>
                      <input
                        type="text"
                        placeholder="e.g. Gestational DM, PIH, Previous LSCS, Placenta previa"
                        value={formData.obstetrics_history.high_risk_details || ''}
                        onChange={(e) => updateNestedState('obstetrics_history', 'high_risk_details', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 7: VACCINATION HISTORY */}
              {activeTab === 'vaccination' && (
                <div>
                  <CardHeaderTitle>
                    <h3><CheckCircle2 size={16} color="#0d9488" /> 7. Vaccination History</h3>
                    <span className="sub">Immunization status against preventable communicable diseases</span>
                  </CardHeaderTitle>

                  <ThreeCol>
                    <FormGroup>
                      <label>COVID-19 Vaccination</label>
                      <select
                        value={formData.vaccination_history.covid || 'Completed (2 Doses + Booster)'}
                        onChange={(e) => updateNestedState('vaccination_history', 'covid', e.target.value)}
                      >
                        <option value="Completed (2 Doses + Booster)">Completed (2 Doses + Precaution Dose)</option>
                        <option value="2 Doses Done">2 Doses Done</option>
                        <option value="1 Dose Done">1 Dose Done</option>
                        <option value="Not Vaccinated">Not Vaccinated</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Tetanus Toxoid (TT)</label>
                      <select
                        value={formData.vaccination_history.tt || 'Up to date'}
                        onChange={(e) => updateNestedState('vaccination_history', 'tt', e.target.value)}
                      >
                        <option value="Up to date">Up to date (&lt; 5 years)</option>
                        <option value="Received on admission">Administered on admission</option>
                        <option value="Overdue">Overdue (&gt; 10 years)</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Hepatitis B Vaccination</label>
                      <select
                        value={formData.vaccination_history.hepb || 'Done'}
                        onChange={(e) => updateNestedState('vaccination_history', 'hepb', e.target.value)}
                      >
                        <option value="Done">Full Course Done (3 Doses)</option>
                        <option value="Partial">Partial</option>
                        <option value="Not Done">Not Done</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </FormGroup>
                  </ThreeCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Influenza / Pneumococcal / Other Vaccines</label>
                      <input
                        type="text"
                        placeholder="e.g. Annual Influenza vaccine taken in Nov 2025"
                        value={formData.vaccination_history.others || ''}
                        onChange={(e) => updateNestedState('vaccination_history', 'others', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Childhood Immunization Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Completed as per National Immunization Schedule (NIS)"
                        value={formData.vaccination_history.notes || ''}
                        onChange={(e) => updateNestedState('vaccination_history', 'notes', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 9: INVESTIGATIONS DONE */}
              {activeTab === 'investigations' && (
                <div>
                  <CardHeaderTitle>
                    <h3><FileText size={16} color="#0d9488" /> 9. Investigations Done (If Any)</h3>
                    <span className="sub">Summarize pathology, microbiology, imaging, and diagnostic findings</span>
                  </CardHeaderTitle>

                  <TwoCol>
                    <FormGroup>
                      <label>Laboratory / Blood Investigation Findings</label>
                      <textarea
                        placeholder="e.g. Hb: 12.4 g/dL, TLC: 11,200/uL, Platelets: 2.4L. Creatinine: 0.9 mg/dL, Urea: 24. SGOT: 32, SGPT: 28. Na: 138, K: 4.2. CRP: 14 mg/L (Elevated)."
                        style={{ minHeight: '100px' }}
                        value={formData.investigations_done.lab_findings || ''}
                        onChange={(e) => updateNestedState('investigations_done', 'lab_findings', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Radiology & Imaging Findings (X-Ray, USG, CT, MRI)</label>
                      <textarea
                        placeholder="e.g. Chest X-Ray PA: Right lower zone haziness suggestive of consolidation. USG Abdomen: Mild fatty liver Grade 1, normal kidneys and gallbladder."
                        style={{ minHeight: '100px' }}
                        value={formData.investigations_done.radiology_findings || ''}
                        onChange={(e) => updateNestedState('investigations_done', 'radiology_findings', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>ECG / 2D Echo / Cardiac Diagnostics</label>
                      <textarea
                        placeholder="e.g. 12-Lead ECG: Normal sinus rhythm, HR 78 bpm, no acute ST-T changes. 2D Echo: LVEF 60%, normal wall motion, no pericardial effusion."
                        value={formData.investigations_done.ecg_echo_findings || ''}
                        onChange={(e) => updateNestedState('investigations_done', 'ecg_echo_findings', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Other Diagnostic Reports / Biopsy / Past Scans</label>
                      <textarea
                        placeholder="e.g. Previous endoscopy report (2024): Mild antral gastritis, H. pylori negative."
                        value={formData.investigations_done.summary || ''}
                        onChange={(e) => updateNestedState('investigations_done', 'summary', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 10: PHYSICAL EXAMINATION */}
              {activeTab === 'physical_exam' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Heart size={16} color="#0d9488" /> 10. Physical Examination</h3>
                    <span className="sub">Bedside clinical findings, vital signs, and systemic evaluation</span>
                  </CardHeaderTitle>

                  {/* Vitals Input Row */}
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                      Current Inpatient Vital Signs:
                    </label>
                    <FourCol>
                      <FormGroup style={{ margin: 0 }}>
                        <label>Pulse Rate (bpm)</label>
                        <input
                          type="text"
                          placeholder="e.g. 78"
                          value={formData.physical_examination.vitals?.pulse || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              physical_examination: {
                                ...prev.physical_examination,
                                vitals: { ...prev.physical_examination.vitals, pulse: val }
                              }
                            }));
                          }}
                        />
                      </FormGroup>

                      <FormGroup style={{ margin: 0 }}>
                        <label>Blood Pressure (mmHg)</label>
                        <input
                          type="text"
                          placeholder="e.g. 120/80"
                          value={formData.physical_examination.vitals?.bp || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              physical_examination: {
                                ...prev.physical_examination,
                                vitals: { ...prev.physical_examination.vitals, bp: val }
                              }
                            }));
                          }}
                        />
                      </FormGroup>

                      <FormGroup style={{ margin: 0 }}>
                        <label>Temperature (°F)</label>
                        <input
                          type="text"
                          placeholder="e.g. 98.6"
                          value={formData.physical_examination.vitals?.temp || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              physical_examination: {
                                ...prev.physical_examination,
                                vitals: { ...prev.physical_examination.vitals, temp: val }
                              }
                            }));
                          }}
                        />
                      </FormGroup>

                      <FormGroup style={{ margin: 0 }}>
                        <label>SpO2 (%) & RR (/min)</label>
                        <input
                          type="text"
                          placeholder="e.g. 99% on RA, RR 18"
                          value={formData.physical_examination.vitals?.spo2 || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              physical_examination: {
                                ...prev.physical_examination,
                                vitals: { ...prev.physical_examination.vitals, spo2: val }
                              }
                            }));
                          }}
                        />
                      </FormGroup>
                    </FourCol>
                  </div>

                  <FormGroup>
                    <label>General Examination (Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema — P/I/C/C/L/E)</label>
                    <textarea
                      placeholder="e.g. Conscious, oriented, afebrile. No pallor, icterus, cyanosis, clubbing, generalized lymphadenopathy, or pedal edema."
                      value={formData.physical_examination.general || ''}
                      onChange={(e) => updateNestedState('physical_examination', 'general', e.target.value)}
                    />
                  </FormGroup>

                  <TwoCol>
                    <FormGroup>
                      <label>Cardiovascular System (CVS)</label>
                      <textarea
                        placeholder="e.g. S1, S2 heard normally. No murmurs, gallop, or pericardial friction rub."
                        value={formData.physical_examination.systemic_cvs || ''}
                        onChange={(e) => updateNestedState('physical_examination', 'systemic_cvs', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Respiratory System (RS)</label>
                      <textarea
                        placeholder="e.g. Bilateral vesicular breath sounds equal. Coarse crackles heard in right basal area. No wheeze."
                        value={formData.physical_examination.systemic_rs || ''}
                        onChange={(e) => updateNestedState('physical_examination', 'systemic_rs', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Abdomen (PA - Per Abdomen)</label>
                      <textarea
                        placeholder="e.g. Soft, non-distended, no tenderness or guarding. No hepatosplenomegaly. Normal bowel sounds."
                        value={formData.physical_examination.systemic_pa || ''}
                        onChange={(e) => updateNestedState('physical_examination', 'systemic_pa', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Central Nervous System (CNS)</label>
                      <textarea
                        placeholder="e.g. Conscious (GCS 15/15). Pupils equal and reactive to light. Motor power 5/5 all 4 limbs, sensory intact, plantars flexor."
                        value={formData.physical_examination.systemic_cns || ''}
                        onChange={(e) => updateNestedState('physical_examination', 'systemic_cns', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <FormGroup>
                    <label>Local / Site Examination (Surgical wound, trauma, musculoskeletal, skin lesion)</label>
                    <textarea
                      placeholder="e.g. Surgical dressing dry and intact. No active bleeding, discharge, or erythema around suture line."
                      value={formData.physical_examination.local_exam || ''}
                      onChange={(e) => updateNestedState('physical_examination', 'local_exam', e.target.value)}
                    />
                  </FormGroup>
                </div>
              )}

              {/* TAB 11: PROVISIONAL DIAGNOSIS */}
              {activeTab === 'diagnosis' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Stethoscope size={16} color="#0d9488" /> 11. Provisional Diagnosis</h3>
                    <span className="sub">Working clinical impression and ICD diagnostic coding</span>
                  </CardHeaderTitle>

                  <FormGroup>
                    <label>Primary Clinical Diagnosis *</label>
                    <input
                      type="text"
                      placeholder="e.g. Community Acquired Pneumonia (Right Lower Lobe) / Acute Appendicitis"
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}
                      value={formData.provisional_diagnosis.primary || ''}
                      onChange={(e) => updateNestedState('provisional_diagnosis', 'primary', e.target.value)}
                    />
                  </FormGroup>

                  <TwoCol>
                    <FormGroup>
                      <label>Secondary Diagnoses / Comorbidities</label>
                      <textarea
                        placeholder="e.g. Type 2 Diabetes Mellitus with Poor Glycemic Control, Essential Hypertension."
                        value={formData.provisional_diagnosis.secondary || ''}
                        onChange={(e) => updateNestedState('provisional_diagnosis', 'secondary', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Differential Diagnoses Considered</label>
                      <textarea
                        placeholder="e.g. 1. Atypical Pneumonia, 2. Pulmonary Embolism, 3. Acute Bronchitis."
                        value={formData.provisional_diagnosis.differential || ''}
                        onChange={(e) => updateNestedState('provisional_diagnosis', 'differential', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>ICD-10 / ICD-11 Diagnostic Code</label>
                      <input
                        type="text"
                        placeholder="e.g. J18.9 (Pneumonia, unspecified) / K35.80"
                        value={formData.provisional_diagnosis.icd_code || ''}
                        onChange={(e) => updateNestedState('provisional_diagnosis', 'icd_code', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Diagnostic Rationale / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Supported by leukocytosis, fever, and right-sided consolidation on X-ray."
                        value={formData.provisional_diagnosis.notes || ''}
                        onChange={(e) => updateNestedState('provisional_diagnosis', 'notes', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 12: PLAN OF CARE */}
              {activeTab === 'plan_of_care' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Check size={16} color="#0d9488" /> 12. Plan of Care & Orders</h3>
                    <span className="sub">Treatment regime, nursing instructions, investigations ordered, and consults</span>
                  </CardHeaderTitle>

                  <FormGroup>
                    <label>Immediate Inpatient Treatment & Medication Orders *</label>
                    <textarea
                      placeholder="e.g. 1. Inj. Ceftriaxone 1g IV BD after test dose
2. Inj. Paracetamol 1g IV SOS for temp > 100 F
3. Nebulization with Duolin TDS + Budecort BD
4. IV Fluids NS 100 mL/hr"
                      style={{ minHeight: '100px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                      value={formData.plan_of_care.treatment_orders || ''}
                      onChange={(e) => updateNestedState('plan_of_care', 'treatment_orders', e.target.value)}
                    />
                  </FormGroup>

                  <TwoCol>
                    <FormGroup>
                      <label>Further Investigations Advised / Ordered</label>
                      <textarea
                        placeholder="e.g. Sputum for Gram stain & culture, Repeat CBC and CRP in 48 hrs, S. Procalcitonin."
                        value={formData.plan_of_care.investigations_advised || ''}
                        onChange={(e) => updateNestedState('plan_of_care', 'investigations_advised', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Diet Orders & Nutrition Plan</label>
                      <textarea
                        placeholder="e.g. Soft diet, Diabetic 1800 kcal diet, Plenty of oral fluids (2.5 L/day)."
                        value={formData.plan_of_care.diet_orders || ''}
                        onChange={(e) => updateNestedState('plan_of_care', 'diet_orders', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>

                  <TwoCol>
                    <FormGroup>
                      <label>Nursing Care & Bedside Monitoring Orders</label>
                      <textarea
                        placeholder="e.g. Hourly vitals monitoring if BP < 100/60. Strict I/O charting. Daily weight measurement. Elevate head of bed 30 degrees."
                        value={formData.plan_of_care.nursing_instructions || ''}
                        onChange={(e) => updateNestedState('plan_of_care', 'nursing_instructions', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Specialist Consultations / Referrals & Discharge Plan</label>
                      <textarea
                        placeholder="e.g. Pulmonologist cross-consultation requested. Planned stay ~4 days, anticipated discharge on oral antibiotics."
                        value={formData.plan_of_care.consults || ''}
                        onChange={(e) => updateNestedState('plan_of_care', 'consults', e.target.value)}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <ActionButton $variant="secondary" onClick={() => handleSaveNote(false)} disabled={saving || formData.is_finalized}>
                  <Save size={14} /> Save Draft
                </ActionButton>
                <ActionButton $variant="primary" onClick={() => handleSaveNote(true)} disabled={saving || formData.is_finalized}>
                  <CheckCircle2 size={14} /> Finalize & Save Clinical Note
                </ActionButton>
              </div>
            </ScrollableTabContent>
          )}
        </Workspace>
      </MainGrid>

      {/* Note History Drawer */}
      {showHistoryDrawer && (
        <HistoryDrawer>
          <div className="drawer-header">
            <h3><History size={18} /> Notes History ({noteHistory.length})</h3>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="drawer-list">
            {(!Array.isArray(noteHistory) || noteHistory.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                No prior clinical notes recorded for this admission stay.
              </div>
            ) : (
              (Array.isArray(noteHistory) ? noteHistory : []).map((note) => (
                <HistoryCard key={note.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      onClick={() => handleSelectHistoricalNote(note)}
                      style={{ flex: 1, cursor: 'pointer' }}
                    >
                      <div className="date">{new Date(note.note_date).toLocaleString()}</div>
                      <div className="type" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{note.note_type || 'Clinical Note'}</span>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: note.is_finalized ? '#dcfce7' : '#fef3c7',
                          color: note.is_finalized ? '#166534' : '#92400e'
                        }}>
                          {note.is_finalized ? 'Finalized' : 'Draft'}
                        </span>
                      </div>
                      <div className="doc">Dr. {note.doctor_name || 'Attending Physician'}</div>
                      <div className="diag">
                        <strong>Diag:</strong> {note.provisional_diagnosis?.primary || 'Clinical evaluation'}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!note.is_finalized}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!note.is_finalized) return;
                        setPrintNoteTarget(note);
                        setShowPrintModal(true);
                      }}
                      title={note.is_finalized ? "Print this finalized clinical note" : "Draft notes cannot be printed"}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        background: note.is_finalized ? '#0f172a' : '#e2e8f0',
                        color: note.is_finalized ? '#ffffff' : '#94a3b8',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: note.is_finalized ? 'pointer' : 'not-allowed',
                        flexShrink: 0,
                        opacity: note.is_finalized ? 1 : 0.6,
                        boxShadow: note.is_finalized ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Printer size={12} color={note.is_finalized ? "#ffffff" : "#94a3b8"} /> Print
                    </button>
                  </div>
                </HistoryCard>
              ))
            )}
          </div>
        </HistoryDrawer>
      )}

      {/* A4 Print Modal */}
      {showPrintModal && selectedPatient && (
        <IPClinicalNotesPrint
          noteData={{
            ...(printNoteTarget || formData),
            doctor_name: (printNoteTarget?.doctor_name) || selectedPatient.doctor_name || 'Attending Physician',
            uhid: selectedPatient.uhid,
            ip_number: selectedPatient.ip_number || selectedPatient.ipNumber,
            patient_name: selectedPatient.patient_name,
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            room_no: selectedPatient.room_no,
            bed_no: selectedPatient.bed_no
          }}
          patient={selectedPatient}
          onClose={() => {
            setShowPrintModal(false);
            setPrintNoteTarget(null);
          }}
        />
      )}

      {/* Nursing Notes & Vitals Viewer Modal for Doctor */}
      {showNursingNotesViewer && selectedPatient && (
        <IPNursingNotesViewerModal
          patient={selectedPatient}
          onClose={() => setShowNursingNotesViewer(false)}
          onImportVitals={handleImportNursingVitals}
        />
      )}

      {/* Patient Clinical & Diagnostics History Modal (No Financials) */}
      {showPatientHistoryModal && selectedPatient && (
        <IPPatientHistoryModal
          isOpen={showPatientHistoryModal}
          patient={selectedPatient}
          uhid={selectedPatient.uhid}
          ipNumber={selectedPatient.ip_number || selectedPatient.ipNumber}
          onClose={() => setShowPatientHistoryModal(false)}
        />
      )}

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedModal && (
        <ModalOverlay style={{ zIndex: 99999 }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertCircle size={28} color="#d97706" />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
              Unsaved Clinical Notes
            </h3>

            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5' }}>
              You have unsaved clinical entries for <strong>{selectedPatient?.patient_name || 'this patient'}</strong>.
              Do you want to finalize or save as draft before switching?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ActionButton
                $variant="primary"
                onClick={() => handleUnsavedDecision('FINALIZE')}
                disabled={saving}
                style={{ justifyContent: 'center', padding: '10px' }}
              >
                <CheckCircle2 size={16} /> Finalize & Continue
              </ActionButton>

              <ActionButton
                $variant="secondary"
                onClick={() => handleUnsavedDecision('SAVE_DRAFT')}
                disabled={saving}
                style={{ justifyContent: 'center', padding: '10px' }}
              >
                <Save size={16} /> Save as Draft & Continue
              </ActionButton>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleUnsavedDecision('DISCARD')}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={() => handleUnsavedDecision('CANCEL')}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Stay on Note
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default IPEMRDesk;
