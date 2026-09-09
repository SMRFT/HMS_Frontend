import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';
import {
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  User,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Save,
  Printer,
  History,
  ShieldAlert,
  Bed,
  Flame,
  Droplet,
  FileText,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  Stethoscope
} from 'lucide-react';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components (Teal & Slate Modern Theme) ---
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

  .shift-selector {
    display: flex;
    align-items: center;
    gap: 3px;
    background: #f8fafc;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  }
`;

const ShiftPill = styled.button`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.12s ease;

  ${props => props.$active ? `
    background: #0d9488;
    color: white;
    box-shadow: 0 1px 3px rgba(13, 148, 136, 0.25);
  ` : `
    background: transparent;
    color: #475569;
    &:hover { background: #f1f5f9; color: #0f172a; }
  `}
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
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .patient-main-block {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 7px;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white;
      font-weight: 800;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(13, 148, 136, 0.25);
    }

    .patient-meta-rows {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .top-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .p-name {
          font-size: 0.92rem;
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
          padding: 1px 5px;
          border-radius: 4px;
        }

        .blood-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1px 5px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .room-chip {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
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
          padding: 1px 5px;
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

          &.doctor-chip {
            background: #f0fdfa;
            border-color: #99f6e4;
            color: #0f766e;
          }
        }
      }
    }
  }

  .note-meta-inline {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    .status-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: ${props => props.$isFinal ? '#dcfce7' : '#fef3c7'};
      color: ${props => props.$isFinal ? '#166534' : '#92400e'};
      border: 1px solid ${props => props.$isFinal ? '#bbf7d0' : '#fde68a'};

      .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: ${props => props.$isFinal ? '#16a34a' : '#d97706'};
      }
    }
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

// --- Pain Scale Styled Elements ---
const PainScaleContainer = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 12px 14px;
  margin-bottom: 12px;
`;

const PainScaleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;

  .active-score-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: ${props => props.$color || '#0d9488'};
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-weight: 800;
    font-size: 0.825rem;
    box-shadow: 0 2px 6px ${props => props.$shadow || 'rgba(13, 148, 136, 0.25)'};
  }
`;

const PainButtonsTrack = styled.div`
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 4px;
  margin-bottom: 10px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const PainPillButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 2px;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? props.$tierColor : '#e2e8f0'};
  background: ${props => props.$active ? props.$tierBg : '#ffffff'};
  color: ${props => props.$active ? props.$tierColor : '#475569'};
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$tierColor};
  }

  .emoji {
    font-size: 1.1rem;
    margin-bottom: 2px;
  }

  .score-num {
    font-size: 0.85rem;
  }

  .tier-desc {
    font-size: 0.6rem;
    font-weight: 600;
    text-align: center;
    line-height: 1;
    margin-top: 2px;
  }
`;

const PainSliderInput = styled.input`
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 4px;
  background: linear-gradient(to right, #10b981 0%, #eab308 40%, #f97316 70%, #ef4444 100%);
  outline: none;
  margin: 6px 0;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0f172a;
    border: 2px solid white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
`;

// Helper pain color & emoji metadata
const painTiers = [
  { score: 0, label: 'No Pain', color: '#10b981', bgColor: '#ecfdf5', emoji: '😄', shadow: 'rgba(16, 185, 129, 0.3)' },
  { score: 1, label: 'Mild Pain', color: '#84cc16', bgColor: '#f7fee7', emoji: '🙂', shadow: 'rgba(132, 204, 22, 0.3)' },
  { score: 2, label: 'Mild Pain', color: '#84cc16', bgColor: '#f7fee7', emoji: '🙂', shadow: 'rgba(132, 204, 22, 0.3)' },
  { score: 3, label: 'Moderate', color: '#eab308', bgColor: '#fefce8', emoji: '😐', shadow: 'rgba(234, 179, 8, 0.3)' },
  { score: 4, label: 'Moderate', color: '#eab308', bgColor: '#fefce8', emoji: '😐', shadow: 'rgba(234, 179, 8, 0.3)' },
  { score: 5, label: 'Severe', color: '#f97316', bgColor: '#fff7ed', emoji: '🙁', shadow: 'rgba(249, 115, 22, 0.3)' },
  { score: 6, label: 'Severe', color: '#f97316', bgColor: '#fff7ed', emoji: '🙁', shadow: 'rgba(249, 115, 22, 0.3)' },
  { score: 7, label: 'Very Severe', color: '#ef4444', bgColor: '#fef2f2', emoji: '😢', shadow: 'rgba(239, 68, 68, 0.3)' },
  { score: 8, label: 'Very Severe', color: '#ef4444', bgColor: '#fef2f2', emoji: '😢', shadow: 'rgba(239, 68, 68, 0.3)' },
  { score: 9, label: 'Worst Pain', color: '#991b1b', bgColor: '#fef2f2', emoji: '😭', shadow: 'rgba(153, 27, 27, 0.4)' },
  { score: 10, label: 'Worst Pain', color: '#7f1d1d', bgColor: '#450a0a', emoji: '😭', shadow: 'rgba(127, 29, 29, 0.5)' }
];

const initialNursingState = {
  shift: 'Morning',
  note_date: new Date().toISOString().slice(0, 16),
  is_finalized: false,

  vitals: {
    pulse: '',
    bp: '',
    temp: '',
    rr: '',
    spo2: '',
    grbs: '',
    gcs: '15/15',
    consciousness: 'Alert & Oriented'
  },

  pain_score: 0,
  pain_severity: 'No Pain',
  pain_location: '',
  pain_characteristics: '',

  intake_output: {
    oral_fluid: '',
    iv_fluid: '',
    rt_feed: '',
    total_intake: '',
    urine_output: '',
    drain_output: '',
    vomitus: '',
    stool: 'Normal',
    total_output: '',
    fluid_balance: ''
  },

  nursing_assessment: {
    cannula_site: 'Right Forearm (Patent, clean & intact)',
    cannula_date: '',
    skin_integrity: 'Intact, No pressure ulcers',
    fall_risk: 'Low Risk',
    mobility: 'Ambulatory with assist',
    rbs_insulin_given: '',
    catheter_care: 'N/A'
  },

  nursing_interventions: {
    meds_administered: 'All scheduled IV and Oral medications administered as per doctor orders.',
    hygiene_care: 'Bed bath given, oral care done, linen changed.',
    positioning: 'Position changed Q2H.',
    oxygen_support: 'Room Air (SpO2 > 96%)',
    special_care: ''
  },

  handover_notes: ''
};

const IPNursingDesk = ({ initialPatient = null, isModal = false, onClose = null }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(initialPatient);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const [activeTab, setActiveTab] = useState('vitals');
  const [formData, setFormData] = useState(initialNursingState);
  const [saving, setSaving] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);

  // Fetch Admitted Patients
  const fetchAdmittedPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await apiRequest(`${HmsBaseUrl}IPEMR_get_admitted_patients/`, 'GET');
      let list = [];
      if (Array.isArray(res?.data)) list = res.data;
      else if (res?.data && Array.isArray(res.data.data)) list = res.data.data;
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
      console.error("Error fetching admitted patients:", err);
      toast.error("Failed to load admitted patients list.");
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchAdmittedPatients();
  }, []);

  useEffect(() => {
    if (initialPatient) {
      const match = patients.find(p =>
        (p.ip_number && (p.ip_number === initialPatient.ip_number || p.ip_number === initialPatient.ipNo || p.ip_number === initialPatient.ipNumber)) ||
        (p.uhid && (p.uhid === initialPatient.uhid || p.uhid === initialPatient.patient_id))
      );
      setSelectedPatient(match ? { ...initialPatient, ...match } : initialPatient);
    }
  }, [initialPatient, patients]);

  // Fetch patient nursing notes history
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientNursingNotes(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatientNursingNotes = async (patientObj) => {
    if (!patientObj) return;
    const ipNo = patientObj.ip_number || patientObj.ipNumber || '';
    const uhid = patientObj.uhid || '';
    if (!ipNo && !uhid) return;

    try {
      const url = ipNo
        ? `${HmsBaseUrl}IPEMR_NursingNotes/?ip_number=${encodeURIComponent(ipNo)}`
        : `${HmsBaseUrl}IPEMR_NursingNotes/?uhid=${encodeURIComponent(uhid)}`;
      const res = await apiRequest(url, 'GET');
      let notes = [];
      if (Array.isArray(res?.data)) notes = res.data;
      else if (res?.data && Array.isArray(res.data.data)) notes = res.data.data;
      setNoteHistory(notes);
      setFormData({
        ...initialNursingState,
        note_date: new Date().toISOString()
      });
      setActiveNoteId(null);
    } catch (err) {
      console.error("Error fetching nursing notes:", err);
    }
  };

  const loadNoteIntoForm = (note) => {
    setActiveNoteId(note.id);
    setFormData({
      shift: note.shift || 'Morning',
      note_date: note.note_date ? note.note_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
      is_finalized: note.is_finalized || false,
      vitals: { ...initialNursingState.vitals, ...(note.vitals || {}) },
      pain_score: note.pain_score !== undefined ? note.pain_score : 0,
      pain_severity: note.pain_severity || 'No Pain',
      pain_location: note.pain_location || '',
      pain_characteristics: note.pain_characteristics || '',
      intake_output: { ...initialNursingState.intake_output, ...(note.intake_output || {}) },
      nursing_assessment: { ...initialNursingState.nursing_assessment, ...(note.nursing_assessment || {}) },
      nursing_interventions: { ...initialNursingState.nursing_interventions, ...(note.nursing_interventions || {}) },
      handover_notes: note.handover_notes || ''
    });
    toast.info(`Loaded ${note.shift} Shift Nursing Note (${new Date(note.note_date).toLocaleDateString()})`);
  };

  const filteredPatients = useMemo(() => {
    const list = Array.isArray(patients) ? patients : [];
    const q = patientSearch.toLowerCase().trim();
    if (!q) return list;
    return list.filter(p =>
      (p.patient_name || '').toLowerCase().includes(q) ||
      (p.uhid || '').toLowerCase().includes(q) ||
      (p.ip_number || '').toLowerCase().includes(q) ||
      (p.room_no || '').toLowerCase().includes(q) ||
      (p.bed_no || '').toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const handlePainScoreChange = (score) => {
    const tier = painTiers[score] || painTiers[0];
    setFormData(prev => ({
      ...prev,
      pain_score: score,
      pain_severity: tier.label
    }));
  };

  const updateNestedState = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Calculate Intake/Output Fluid Balance
  useEffect(() => {
    const oral = parseFloat(formData.intake_output.oral_fluid) || 0;
    const iv = parseFloat(formData.intake_output.iv_fluid) || 0;
    const rt = parseFloat(formData.intake_output.rt_feed) || 0;
    const totalIn = oral + iv + rt;

    const urine = parseFloat(formData.intake_output.urine_output) || 0;
    const drain = parseFloat(formData.intake_output.drain_output) || 0;
    const vomitus = parseFloat(formData.intake_output.vomitus) || 0;
    const totalOut = urine + drain + vomitus;

    const diff = totalIn - totalOut;
    const balSign = diff > 0 ? `+${diff} mL` : `${diff} mL`;

    setFormData(prev => ({
      ...prev,
      intake_output: {
        ...prev.intake_output,
        total_intake: totalIn ? `${totalIn} mL` : '',
        total_output: totalOut ? `${totalOut} mL` : '',
        fluid_balance: totalIn || totalOut ? balSign : ''
      }
    }));
  }, [
    formData.intake_output.oral_fluid,
    formData.intake_output.iv_fluid,
    formData.intake_output.rt_feed,
    formData.intake_output.urine_output,
    formData.intake_output.drain_output,
    formData.intake_output.vomitus
  ]);

  const handleSaveNursingNote = async (isFinal = false) => {
    if (!selectedPatient) {
      toast.warning("Please select an admitted patient first.");
      return;
    }
    if (formData.is_finalized) {
      toast.info("This nursing note is already finalized and locked.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...(activeNoteId ? { id: activeNoteId } : {}),
        uhid: selectedPatient.uhid || '',
        ip_number: selectedPatient.ip_number || selectedPatient.ipNumber || '',
        shift: formData.shift,
        note_date: new Date().toISOString(),
        is_finalized: isFinal,
        vitals: formData.vitals,
        pain_score: formData.pain_score,
        pain_severity: formData.pain_severity,
        pain_location: formData.pain_location,
        pain_characteristics: formData.pain_characteristics,
        intake_output: formData.intake_output,
        nursing_assessment: formData.nursing_assessment,
        nursing_interventions: formData.nursing_interventions,
        handover_notes: formData.handover_notes
      };

      const res = await apiRequest(`${HmsBaseUrl}IPEMR_NursingNotes/`, 'POST', payload);

      if (res && (res.status === 'success' || res.data)) {
        toast.success(isFinal ? "Nursing Note finalized and saved!" : "Nursing Note saved successfully!");
        if (res.data?.id) setActiveNoteId(res.data.id);
        fetchPatientNursingNotes(selectedPatient);
        if (isFinal && isModal && onClose) {
          onClose();
        }
      } else {
        toast.error(res.message || "Failed to save nursing note.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving nursing note.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewNote = () => {
    setActiveNoteId(null);
    setFormData({
      ...initialNursingState,
      note_date: new Date().toISOString()
    });
    toast.info("Started a new nursing round entry.");
  };

  const currentPainTier = painTiers[formData.pain_score] || painTiers[0];

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
              <div className="icon-box"><Activity size={18} /></div>
              <div className="title-text">
                <h1>Inpatient Nursing & Vitals Desk</h1>
              </div>
            </DeskTitle>
          </LeftHeaderGroup>

          <HeaderControls>
            <ActionButton $variant="outline" onClick={handleCreateNewNote}>
              <Plus size={14} /> New Round
            </ActionButton>

            <ActionButton $variant="secondary" onClick={() => setShowHistoryDrawer(true)}>
              <History size={14} /> History ({noteHistory.length})
            </ActionButton>

            <ActionButton
              $variant="secondary"
              onClick={() => handleSaveNursingNote(false)}
              disabled={saving || formData.is_finalized}
              title={formData.is_finalized ? "This note is finalized and locked" : "Save Draft"}
            >
              <Save size={14} /> {saving ? 'Saving...' : activeNoteId ? 'Update Draft' : 'Save Draft'}
            </ActionButton>

            <ActionButton
              $variant="primary"
              onClick={() => handleSaveNursingNote(true)}
              disabled={saving || formData.is_finalized}
              title={formData.is_finalized ? "This note is already finalized" : "Finalize Note"}
            >
              <CheckCircle2 size={14} /> Finalize Note
            </ActionButton>
          </HeaderControls>
        </TopActionBar>
      )}

      <MainGrid $showSidebar={showSidebar && !isModal}>
        {/* Left Patient Queue Sidebar (Collapsible in full desk mode) */}
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
                      onClick={() => setSelectedPatient(p)}
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

        {/* Right Nursing Workspace Area */}
        <Workspace>
          {/* 2. Compact Patient & Shift Ribbon with Rich Visuals */}
          {selectedPatient ? (() => {
            const pName = selectedPatient.patient_name || selectedPatient.patientName || selectedPatient.name || 'Patient';
            const cleanName = pName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Master|Baby)\s+/i, '').trim();
            const pInitial = (cleanName[0] || pName[0] || 'P').toUpperCase();
            const pGender = selectedPatient.gender || selectedPatient.Gender || selectedPatient.patient?.gender || '';
            const pAge = selectedPatient.age || selectedPatient.Age || selectedPatient.patient?.age || '';
            const pBlood = selectedPatient.blood_group || selectedPatient.bloodGroup || selectedPatient.bloodgroup || selectedPatient.BloodGroup || selectedPatient.patient?.blood_group || selectedPatient.patient?.bloodGroup || selectedPatient.blood_type || '';
            const pUhid = selectedPatient.uhid || selectedPatient.patient_id || selectedPatient.patientId || selectedPatient.patient?.uhid || '-';
            const pIp = selectedPatient.ip_number || selectedPatient.ipNumber || selectedPatient.ip_no || selectedPatient.admission_id || '-';
            const pRoom = selectedPatient.room_no || selectedPatient.roomNo || selectedPatient.room || '';
            const pBed = selectedPatient.bed_no || selectedPatient.bedNo || selectedPatient.bed || '';
            const pDoc = selectedPatient.doctor_name || selectedPatient.doctorName || selectedPatient.doctor || selectedPatient.admittingDoctor || '';

            return (
              <CompactPatientRibbon $isFinal={formData.is_finalized}>
                <div className="patient-main-block">
                  <div className="avatar">
                    {pInitial}
                  </div>

                  <div className="patient-meta-rows">
                    {/* TOP ROW: Name, Gender & Age, Blood Group, Room Details */}
                    <div className="top-row">
                      <span className="p-name">{pName}</span>
                      {(pGender || pAge) && (
                        <span className="gender-age-badge">
                          {pGender ? (pGender.toLowerCase().startsWith('m') ? '♂ Male' : pGender.toLowerCase().startsWith('f') ? '♀ Female' : pGender) : ''}
                          {pGender && pAge ? ' · ' : ''}
                          {pAge ? `${pAge}Y` : ''}
                        </span>
                      )}
                      {pBlood && (
                        <span className="blood-badge" title={`Blood Group: ${pBlood}`}>
                          🩸 {pBlood}
                        </span>
                      )}
                      {(pRoom || pBed) && (
                        <span className="room-chip" title="Room / Bed Location">
                          🛏️ {pRoom || '-'}{pBed ? ` · Bed ${pBed}` : ''}
                        </span>
                      )}
                    </div>

                    {/* BOTTOM ROW: UHID, IP Number, Doctor (Icon-driven) */}
                    <div className="bottom-row">
                      <span className="visual-chip id-chip" title="UHID">
                        🪪 <strong>{pUhid}</strong>
                      </span>
                      <span className="visual-chip ip-chip" title="IP Admission Number">
                        🏥 <strong>{pIp}</strong>
                      </span>
                      {pDoc && (
                        <span className="visual-chip doctor-chip" title="Attending Doctor">
                          👨‍⚕️ <strong>{pDoc.replace(/^Dr\.?\s+/i, 'Dr. ')}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="note-meta-inline">
                  <div className="shift-selector" style={{ marginRight: '4px' }}>
                    {['Morning', 'Evening', 'Night'].map(sh => (
                      <ShiftPill
                        key={sh}
                        $active={formData.shift === sh}
                        onClick={() => !formData.is_finalized && setFormData(prev => ({ ...prev, shift: sh }))}
                        style={{
                          cursor: formData.is_finalized ? 'not-allowed' : 'pointer',
                          opacity: formData.is_finalized && formData.shift !== sh ? 0.4 : 1
                        }}
                      >
                        {sh}
                      </ShiftPill>
                    ))}
                  </div>

                  <span className="status-badge">
                    <span className="dot" /> {formData.is_finalized ? 'Finalized' : 'Draft'}
                  </span>

                  {isModal && (
                    <>
                      <ActionButton
                        $variant="secondary"
                        onClick={() => handleSaveNursingNote(false)}
                        disabled={saving || formData.is_finalized}
                        title={formData.is_finalized ? "This note is finalized and locked" : "Save Draft"}
                      >
                        <Save size={13} /> Save Draft
                      </ActionButton>
                      <ActionButton
                        $variant="primary"
                        onClick={() => handleSaveNursingNote(true)}
                        disabled={saving || formData.is_finalized}
                        title={formData.is_finalized ? "This note is already finalized" : "Finalize"}
                      >
                        <CheckCircle2 size={13} /> Finalize
                      </ActionButton>
                    </>
                  )}
                </div>
              </CompactPatientRibbon>
            );
          })() : (
            <div style={{ background: 'white', padding: '24px', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Please select an admitted patient from the queue to start nursing documentation.
            </div>
          )}

          {/* Stored Rounds History Quick Switcher */}
          {selectedPatient && noteHistory.length > 0 && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={13} color="#0d9488" /> Stored Rounds ({noteHistory.length}):
                </span>
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '500px', padding: '1px 0' }}>
                  {noteHistory.map((nh, idx) => (
                    <button
                      key={nh.id || idx}
                      type="button"
                      onClick={() => loadNoteIntoForm(nh)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: activeNoteId === nh.id ? '1px solid #0d9488' : '1px solid #cbd5e1',
                        background: activeNoteId === nh.id ? '#ccfbf1' : '#f8fafc',
                        color: activeNoteId === nh.id ? '#0f766e' : '#475569',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {nh.shift} ({new Date(nh.note_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}) · Pain {nh.pain_score}/10
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ActionButton $variant="outline" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={handleCreateNewNote}>
                  <Plus size={11} /> New Entry
                </ActionButton>
              </div>
            </div>
          )}

          {/* 3. Section Navigation Tabs */}
          {selectedPatient && (
            <SectionNavigationTabs>
              <TabButton $active={activeTab === 'vitals'} onClick={() => setActiveTab('vitals')}>
                <Heart size={13} /> 1. Vitals & Neurological
              </TabButton>
              <TabButton $active={activeTab === 'pain_scale'} onClick={() => setActiveTab('pain_scale')}>
                <Flame size={13} /> 2. Pain Scale (0 - 10)
              </TabButton>
              <TabButton $active={activeTab === 'intake_output'} onClick={() => setActiveTab('intake_output')}>
                <Droplets size={13} /> 3. Intake & Output Chart
              </TabButton>
              <TabButton $active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')}>
                <ShieldAlert size={13} /> 4. Assessment & Care Plan
              </TabButton>
              <TabButton $active={activeTab === 'handover'} onClick={() => setActiveTab('handover')}>
                <FileText size={13} /> 5. Handover & Remarks
              </TabButton>
            </SectionNavigationTabs>
          )}

          {/* 4. Single Scrollable Tab Content Container */}
          {selectedPatient && (
            <ScrollableTabContent>
              {/* TAB 1: VITALS & NEUROLOGICAL */}
              {activeTab === 'vitals' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Heart size={16} color="#0d9488" /> 1. Bedside Vitals & Neurological Status</h3>
                    <span className="sub">Routine shift vitals measurement and consciousness score</span>
                  </CardHeaderTitle>

                  <FourCol>
                    <FormGroup>
                      <label>Pulse Rate (bpm)</label>
                      <input
                        type="text"
                        placeholder="e.g. 85"
                        value={formData.vitals.pulse || ''}
                        onChange={(e) => updateNestedState('vitals', 'pulse', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        placeholder="e.g. 145/80"
                        value={formData.vitals.bp || ''}
                        onChange={(e) => updateNestedState('vitals', 'bp', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Temperature (°F)</label>
                      <input
                        type="text"
                        placeholder="e.g. 98.4"
                        value={formData.vitals.temp || ''}
                        onChange={(e) => updateNestedState('vitals', 'temp', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Respiratory Rate (/min)</label>
                      <input
                        type="text"
                        placeholder="e.g. 18"
                        value={formData.vitals.rr || ''}
                        onChange={(e) => updateNestedState('vitals', 'rr', e.target.value)}
                      />
                    </FormGroup>
                  </FourCol>

                  <FourCol>
                    <FormGroup>
                      <label>SpO2 (% Saturation)</label>
                      <input
                        type="text"
                        placeholder="e.g. 98%"
                        value={formData.vitals.spo2 || ''}
                        onChange={(e) => updateNestedState('vitals', 'spo2', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>GRBS (mg/dL)</label>
                      <input
                        type="text"
                        placeholder="e.g. 132"
                        value={formData.vitals.grbs || ''}
                        onChange={(e) => updateNestedState('vitals', 'grbs', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>GCS Score (/15)</label>
                      <input
                        type="text"
                        placeholder="e.g. 15/15 (E4V5M6)"
                        value={formData.vitals.gcs || ''}
                        onChange={(e) => updateNestedState('vitals', 'gcs', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Consciousness Level</label>
                      <select
                        value={formData.vitals.consciousness || 'Alert & Oriented'}
                        onChange={(e) => updateNestedState('vitals', 'consciousness', e.target.value)}
                      >
                        <option value="Alert & Oriented">Alert & Oriented</option>
                        <option value="Drowsy / Lethargic">Drowsy / Lethargic</option>
                        <option value="Stuporous">Stuporous</option>
                        <option value="Comatose">Comatose</option>
                        <option value="Disoriented / Confused">Disoriented / Confused</option>
                        <option value="Sedated">Sedated</option>
                      </select>
                    </FormGroup>
                  </FourCol>
                </div>
              )}

              {/* TAB 2: PAIN SCALE (0 - 10) */}
              {activeTab === 'pain_scale' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Flame size={16} color="#ef4444" /> 2. Patient Pain Assessment (Wong-Baker Scale: 0 – 10)</h3>
                    <span className="sub">Numeric rating and visual emoji severity scale</span>
                  </CardHeaderTitle>

                  <PainScaleContainer>
                    <PainScaleHeader $color={currentPainTier.color} $shadow={currentPainTier.shadow}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Selected Pain Severity:</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Rate pain from 0 (no pain) to 10 (worst pain imaginable)</div>
                      </div>
                      <div className="active-score-badge">
                        <span style={{ fontSize: '1.2rem' }}>{currentPainTier.emoji}</span>
                        <span className="num">{formData.pain_score} / 10</span>
                        <span className="label">({currentPainTier.label})</span>
                      </div>
                    </PainScaleHeader>

                    <PainButtonsTrack>
                      {painTiers.map((tier) => (
                        <PainPillButton
                          key={tier.score}
                          type="button"
                          $active={formData.pain_score === tier.score}
                          $tierColor={tier.color}
                          $tierBg={tier.bgColor}
                          onClick={() => handlePainScoreChange(tier.score)}
                        >
                          <span className="emoji">{tier.emoji}</span>
                          <span className="score-num">{tier.score}</span>
                          <span className="tier-desc">{tier.label.split(' ')[0]}</span>
                        </PainPillButton>
                      ))}
                    </PainButtonsTrack>

                    <PainSliderInput
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={formData.pain_score}
                      onChange={(e) => handlePainScoreChange(parseInt(e.target.value, 10))}
                    />
                  </PainScaleContainer>

                  <TwoCol>
                    <FormGroup>
                      <label>Pain Site / Anatomical Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Right lower abdomen / Surgical wound / Epigastric"
                        value={formData.pain_location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pain_location: e.target.value }))}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Pain Characteristics / Interventions Given</label>
                      <input
                        type="text"
                        placeholder="e.g. Throbbing, intermittent. Inj. Paracetamol administered at 10:30 AM."
                        value={formData.pain_characteristics || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pain_characteristics: e.target.value }))}
                      />
                    </FormGroup>
                  </TwoCol>
                </div>
              )}

              {/* TAB 3: INTAKE & OUTPUT */}
              {activeTab === 'intake_output' && (
                <div>
                  <CardHeaderTitle>
                    <h3><Droplets size={16} color="#0d9488" /> 3. Shift Intake & Output Fluid Balance Chart</h3>
                    <span className="sub">Record fluids administered and bodily drainage</span>
                  </CardHeaderTitle>

                  <TwoCol>
                    {/* Fluid Intake */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#0d9488', fontWeight: 800 }}>
                        Fluid Intake (mL)
                      </h4>
                      <ThreeCol>
                        <FormGroup>
                          <label>Oral Fluids</label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={formData.intake_output.oral_fluid || ''}
                            onChange={(e) => updateNestedState('intake_output', 'oral_fluid', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup>
                          <label>IV Infusions</label>
                          <input
                            type="number"
                            placeholder="e.g. 1000"
                            value={formData.intake_output.iv_fluid || ''}
                            onChange={(e) => updateNestedState('intake_output', 'iv_fluid', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup>
                          <label>Ryle's Tube / Feed</label>
                          <input
                            type="number"
                            placeholder="e.g. 200"
                            value={formData.intake_output.rt_feed || ''}
                            onChange={(e) => updateNestedState('intake_output', 'rt_feed', e.target.value)}
                          />
                        </FormGroup>
                      </ThreeCol>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                        Total Intake: <span style={{ color: '#0d9488' }}>{formData.intake_output.total_intake || '0 mL'}</span>
                      </div>
                    </div>

                    {/* Fluid Output */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#d97706', fontWeight: 800 }}>
                        Fluid Output & Excretion (mL)
                      </h4>
                      <ThreeCol>
                        <FormGroup>
                          <label>Urine Output</label>
                          <input
                            type="number"
                            placeholder="e.g. 800"
                            value={formData.intake_output.urine_output || ''}
                            onChange={(e) => updateNestedState('intake_output', 'urine_output', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup>
                          <label>Surgical Drain</label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            value={formData.intake_output.drain_output || ''}
                            onChange={(e) => updateNestedState('intake_output', 'drain_output', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup>
                          <label>Vomitus / NG Aspirate</label>
                          <input
                            type="number"
                            placeholder="e.g. 0"
                            value={formData.intake_output.vomitus || ''}
                            onChange={(e) => updateNestedState('intake_output', 'vomitus', e.target.value)}
                          />
                        </FormGroup>
                      </ThreeCol>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                        Total Output: <span style={{ color: '#d97706' }}>{formData.intake_output.total_output || '0 mL'}</span>
                      </div>
                    </div>
                  </TwoCol>

                  <div style={{ marginTop: '10px', padding: '10px', background: '#ccfbf1', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e' }}>
                      Shift Net Fluid Balance:
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f766e' }}>
                      {formData.intake_output.fluid_balance || '0 mL'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: NURSING ASSESSMENT & CARE PLAN */}
              {activeTab === 'assessment' && (
                <div>
                  <CardHeaderTitle>
                    <h3><ShieldAlert size={16} color="#0d9488" /> 4. Nursing Assessment & Clinical Status</h3>
                    <span className="sub">IV cannula, skin integrity, fall risk, and mobility status</span>
                  </CardHeaderTitle>

                  <ThreeCol>
                    <FormGroup>
                      <label>IV Cannula Site & Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Right forearm / Patent, no phlebitis"
                        value={formData.nursing_assessment.cannula_site || ''}
                        onChange={(e) => updateNestedState('nursing_assessment', 'cannula_site', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Skin Integrity / Pressure Ulcer Stage</label>
                      <input
                        type="text"
                        placeholder="e.g. Intact, No bed sores"
                        value={formData.nursing_assessment.skin_integrity || ''}
                        onChange={(e) => updateNestedState('nursing_assessment', 'skin_integrity', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Fall Risk Assessment</label>
                      <select
                        value={formData.nursing_assessment.fall_risk || 'Low Risk'}
                        onChange={(e) => updateNestedState('nursing_assessment', 'fall_risk', e.target.value)}
                      >
                        <option value="Low Risk">Low Risk (Bed rails up)</option>
                        <option value="Moderate Risk">Moderate Risk (Assist for ambulation)</option>
                        <option value="High Risk">High Risk (Fall alert band, constant supervision)</option>
                      </select>
                    </FormGroup>
                  </ThreeCol>

                  <ThreeCol>
                    <FormGroup>
                      <label>Patient Mobility</label>
                      <select
                        value={formData.nursing_assessment.mobility || 'Ambulatory with assist'}
                        onChange={(e) => updateNestedState('nursing_assessment', 'mobility', e.target.value)}
                      >
                        <option value="Full Mobility">Full Mobility / Independent</option>
                        <option value="Ambulatory with assist">Ambulatory with Assist</option>
                        <option value="Wheelchair Bound">Wheelchair Bound</option>
                        <option value="Strict Bed Rest">Strict Bed Rest</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Oxygen Support & Delivery</label>
                      <input
                        type="text"
                        placeholder="e.g. Room Air / 2L via Nasal Prongs"
                        value={formData.nursing_interventions.oxygen_support || ''}
                        onChange={(e) => updateNestedState('nursing_interventions', 'oxygen_support', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Catheter / Tube Care</label>
                      <input
                        type="text"
                        placeholder="e.g. Foley's catheter draining clear urine / N/A"
                        value={formData.nursing_assessment.catheter_care || ''}
                        onChange={(e) => updateNestedState('nursing_assessment', 'catheter_care', e.target.value)}
                      />
                    </FormGroup>
                  </ThreeCol>
                </div>
              )}

              {/* TAB 5: HANDOVER NOTES */}
              {activeTab === 'handover' && (
                <div>
                  <CardHeaderTitle>
                    <h3><FileText size={16} color="#0d9488" /> 5. Nursing Shift Handover & Clinical Observations</h3>
                    <span className="sub">Document patient status, physician rounds noted, and pending instructions</span>
                  </CardHeaderTitle>

                  <FormGroup>
                    <label>Shift Nursing Observations & Interventions *</label>
                    <textarea
                      placeholder="e.g. Patient conscious and oriented. All scheduled medications given. Dressing checked and dry. Blood sample collected for morning CBC. Diet tolerated well."
                      style={{ minHeight: '120px' }}
                      value={formData.handover_notes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, handover_notes: e.target.value }))}
                    />
                  </FormGroup>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <ActionButton $variant="secondary" onClick={() => handleSaveNursingNote(false)} disabled={saving || formData.is_finalized}>
                  <Save size={14} /> Save Draft
                </ActionButton>
                <ActionButton $variant="primary" onClick={() => handleSaveNursingNote(true)} disabled={saving || formData.is_finalized}>
                  <CheckCircle2 size={14} /> Finalize Nursing Note
                </ActionButton>
              </div>
            </ScrollableTabContent>
          )}
        </Workspace>
      </MainGrid>

      {/* Note History Drawer */}
      {showHistoryDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '360px',
          background: 'white',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              <History size={16} /> Nursing History ({noteHistory.length})
            </h3>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!Array.isArray(noteHistory) || noteHistory.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                No prior nursing notes found for this admission stay.
              </div>
            ) : (
              noteHistory.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { loadNoteIntoForm(note); setShowHistoryDrawer(false); }}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.12s'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    {new Date(note.note_date).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                    {note.shift} Shift · Pain {note.pain_score}/10 ({note.pain_severity})
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 700 }}>
                    BP: {note.vitals?.bp || '-'} · Pulse: {note.vitals?.pulse || '-'} bpm
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export default IPNursingDesk;
