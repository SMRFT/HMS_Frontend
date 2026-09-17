import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import apiRequest from '../../Auth/apiRequest';
import { toast } from 'react-toastify';
import Select, { components } from 'react-select';
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
  Users,
  Save,
  Printer,
  ChevronRight,
  Filter,
  Check,
  Tag,
  Info,
  Pill,
  LayoutGrid,
  List,
  Eye,
  File,
  Image as ImageIcon,
  Lock,
  Play,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningLoader = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
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
  grid-template-columns: 1fr;
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
  background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 50%, #f0fdf4 100%);
  color: #0f172a;
  border: 1.5px solid #ccfbf1;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(13, 148, 136, 0.08);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;

  .info-item {
    display: flex;
    flex-direction: column;

    span.label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      font-weight: 700;
    }

    span.val {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    &.primary-info span.val {
      font-size: 1.3rem;
      color: #0d9488;
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
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.$iconColor || '#cbd5e1'};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: ${props => props.$iconColor || '#cbd5e1'};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
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

// --- Queue View Mode Styled Components ---
const ViewToggleGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 2px;
`;

const ViewToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#0d9488' : '#64748b'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  transition: all 0.2s ease;

  &:hover {
    color: #0d9488;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const PatientTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;

  th {
    background: #f8fafc;
    padding: 14px 18px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 14px 18px;
    font-size: 0.875rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tbody tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f0fdfa;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
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
  align-items: center;
  gap: 12px;
  
  input {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    
    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }
  }
`;



// --- Timeline UI ---
const TimelineBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px 20px 20px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  
  /* Line tracking */
  &::before {
    content: '';
    position: absolute;
    top: 42px; /* 24px padding + 18px (half of 36px icon) */
    left: 80px;
    right: 230px;
    height: 4px;
    background: #cbd5e1;
    z-index: 1;
  }
`;

const TimelineItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 50%; /* Circle for tracking nodes */
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || '#f1f5f9'};
    color: ${props => props.$color || '#64748b'};
    box-shadow: 0 0 0 4px #fff; /* White halo to break the line */
  }

  .details {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .time {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

const WaitTimeBadge = styled.div`
  background: ${props => props.$isLongWait ? '#fef2f2' : '#f0fdf4'};
  color: ${props => props.$isLongWait ? '#b91c1c' : '#15803d'};
  border: 1px solid ${props => props.$isLongWait ? '#fecaca' : '#bbf7d0'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// --- Tabs UI ---
const TabNav = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0px;
  overflow-x: auto;
`;

const TabButton = styled.button`
  background: transparent;
  color: ${props => props.$active ? (props.$iconColor || '#0d9488') : '#64748b'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? (props.$iconColor || '#0d9488') : 'transparent'};
  padding: 12px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-bottom: -2px; 

  &:hover {
    color: ${props => props.$active ? (props.$iconColor || '#0d9488') : '#334155'};
    background: #f1f5f9;
    border-radius: 8px 8px 0 0;
  }
  
  svg {
    color: ${props => props.$active ? (props.$iconColor || '#0d9488') : '#94a3b8'};
    transition: color 0.2s;
  }
`;

const TabContent = styled.div`
  animation: ${fadeIn} 0.3s ease;
`;

// --- Checkbox Grid for Past History ---
const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #334155;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #0d9488;
  }
`;

const PainScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 20px 10px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  gap: 8px;
`;

const PainCircle = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid ${props => props.$active ? '#0d9488' : '#cbd5e1'};
  background: ${props => props.$active ? '#0d9488' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  transition: all 0.2s;
  
  &:hover {
    border-color: #0d9488;
    color: ${props => props.$active ? 'white' : '#0d9488'};
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
const HistorySplitLayout = styled.div`
  display: flex;
  gap: 24px;
  height: 65vh;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const HistorySidebar = styled.div`
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 8px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const HistorySidebarCard = styled.div`
  background: ${props => props.$active ? '#bae6fd' : '#e6f4f6'};
  border: 1.5px solid ${props => props.$active ? '#38bdf8' : '#e2e8f0'};
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border-color: #0d9488;
  }

  .patient-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 0.9rem;
    color: #0f172a;
    font-weight: 600;

    .uhid {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 500;
    }
  }

  .date-info {
    font-size: 0.8rem;
    color: #475569;
    font-weight: 500;
  }
`;

const HistoryDetailPane = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px 8px;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const HistoryDetailHeader = styled.h3`
  font-size: 1.25rem;
  color: #0d9488;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const ThemeSectionBox = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    color: #0f172a;
    margin-bottom: 12px;
    font-weight: 700;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 10px;
    
    svg {
      color: #0d9488;
    }
  }

  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 0.875rem;
    color: #334155;
    li { margin-bottom: 4px; }
  }
`;

const HistoryTableContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const HistoryTableTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #0f172a;
  font-weight: 700;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  svg { color: #0d9488; }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  
  th {
    background: #0d9488;
    color: #ffffff;
    text-align: left;
    padding: 10px 18px;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.3px;
    border: none;
  }
  
  td {
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const HistoryVitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  .vital-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    
    .icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f0fdf4;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .val { 
      font-size: 1.25rem; 
      color: #0f172a; 
      font-weight: 700;
    }
    .lbl { 
      font-size: 0.75rem; 
      color: #64748b; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
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
// --- Custom React-Select MenuList with Done Button ---
const CustomMenuList = (props) => {
  return (
    <components.MenuList {...props}>
      {props.children}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8fafc',
          position: 'sticky',
          bottom: 0,
          zIndex: 1
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (document.activeElement) {
            document.activeElement.blur();
          }
        }}
      >
        <button
          type="button"
          style={{
            background: '#0d9488',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            pointerEvents: 'none'
          }}
        >
          Done <Check size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
        </button>
      </div>
    </components.MenuList>
  );
};


// --- Main OPDoctorlogin Component ---
const OPDoctorlogin = () => {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [queueViewMode, setQueueViewMode] = useState("card"); // 'card' | 'table'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'ready' | 'waiting' | 'completed'

  // Master Data
  const [symptomList, setSymptomList] = useState([]);
  const [testList, setTestList] = useState([]);
  const [ctList, setCtList] = useState([]);
  const [mriList, setMriList] = useState([]);
  const [xrayList, setXrayList] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState("vitals");
  const [consultationStartTimes, setConsultationStartTimes] = useState({});

  useEffect(() => {
    try {
      localStorage.removeItem("consultationStartTimes");
    } catch {}
  }, []);
  const [allergies, setAllergies] = useState("");
  const [allergyOption, setAllergyOption] = useState(""); // 'no_known' | 'if_any'
  const [chiefComplaints, setChiefComplaints] = useState("");
  const [clinicalPastHistory, setClinicalPastHistory] = useState([]);
  const [presentMedications, setPresentMedications] = useState("");
  const [presentMedicationFiles, setPresentMedicationFiles] = useState([]);
  const [uploadingMedFiles, setUploadingMedFiles] = useState(false);
  const [previewModalFile, setPreviewModalFile] = useState(null);
  const medFileInputRef = useRef(null);

  // Clinical Assessment History & Exam State
  const [socialHistory, setSocialHistory] = useState([]);
  const [socialHistoryNotes, setSocialHistoryNotes] = useState("");
  const [menstrualStatus, setMenstrualStatus] = useState("");
  const [menstrualSpecify, setMenstrualSpecify] = useState("");
  const [vaccinationHistory, setVaccinationHistory] = useState("");
  const [obstetricsHistory, setObstetricsHistory] = useState("");
  const [investigationDone, setInvestigationDone] = useState("");
  const [physicalExamination, setPhysicalExamination] = useState("");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [planOfCare, setPlanOfCare] = useState("");
  const [planOfCarePoints, setPlanOfCarePoints] = useState([]);
  const [newPlanPoint, setNewPlanPoint] = useState("");

  const handleAddPlanPoint = () => {
    const trimmed = newPlanPoint.trim();
    if (!trimmed) return;
    const updated = [...planOfCarePoints, trimmed];
    setPlanOfCarePoints(updated);
    setPlanOfCare(updated.map(p => `• ${p}`).join('\n'));
    setNewPlanPoint("");
  };

  const handleRemovePlanPoint = (indexToRemove) => {
    const updated = planOfCarePoints.filter((_, idx) => idx !== indexToRemove);
    setPlanOfCarePoints(updated);
    setPlanOfCare(updated.length > 0 ? updated.map(p => `• ${p}`).join('\n') : "");
  };

  const handleTogglePastHistory = (item) => {
    if (clinicalPastHistory.includes(item)) {
      setClinicalPastHistory(clinicalPastHistory.filter(i => i !== item));
    } else {
      setClinicalPastHistory([...clinicalPastHistory, item]);
    }
  };

  const handleToggleSocialHistory = (item) => {
    if (socialHistory.includes(item)) {
      setSocialHistory(socialHistory.filter(i => i !== item));
    } else {
      setSocialHistory([...socialHistory, item]);
    }
  };
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]); // Stores test_id
  const [selectedCtIds, setSelectedCtIds] = useState([]); // Stores CT test ids
  const [selectedMriIds, setSelectedMriIds] = useState([]); // Stores MRI test ids
  const [selectedXrayIds, setSelectedXrayIds] = useState([]); // Stores X-Ray test ids
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]); // Stores item_id
  const [finding, setFinding] = useState("");
  const [diet, setDiet] = useState("");
  const [referToDoctor, setReferToDoctor] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [referralDoctors, setReferralDoctors] = useState([]);

  // Dropdown UI states and refs
  const [symptomDropdownOpen, setSymptomDropdownOpen] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState("");

  const [prescriptionData, setPrescriptionData] = useState({});

  const handlePrescriptionChange = (itemId, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { dosage: '', frequency: '', duration: '', total_dosage: '' }),
        [field]: value
      }
    }));
  };

  const [testDropdownOpen, setTestDropdownOpen] = useState(false);
  const [testSearch, setTestSearch] = useState("");

  const [medicineDropdownOpen, setMedicineDropdownOpen] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");

  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");

  const symptomDropdownRef = useRef(null);
  const testDropdownRef = useRef(null);
  const medicineDropdownRef = useRef(null);
  const doctorDropdownRef = useRef(null);

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
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target)) {
        setDoctorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to ensure uniform metadata, proper file names, and reliable preview URLs
  const normalizeMedicationFile = (fileItem) => {
    if (!fileItem) return null;
    const fileId = fileItem.file_id || fileItem.id || fileItem._id || '';
    const fileName = fileItem.file_name || fileItem.name || fileItem.title || fileItem.filename || 'Medication Document';
    const fileType = (fileItem.file_type || fileItem.type || fileItem.content_type || '').toLowerCase();
    const fileSize = Number(fileItem.file_size || fileItem.size || 0);

    let viewUrl = fileItem.url || fileItem.previewUrl || '';
    if (!viewUrl && fileId) {
      viewUrl = `${Hmsbaseurl}OPEMR_get_vital_file/${fileId}/`;
    }

    const isImg = fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i.test(fileName);
    const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

    return {
      ...fileItem,
      file_id: fileId,
      file_name: fileName,
      file_type: fileType || (isPdf ? 'application/pdf' : isImg ? 'image/jpeg' : 'application/octet-stream'),
      file_size: fileSize,
      url: viewUrl,
      isImg,
      isPdf,
      category: fileItem.category || 'Present Medication',
      title: fileItem.title || fileName,
      uploaded_at: fileItem.uploaded_at || ''
    };
  };

  // Present Medication File Handlers
  const handleMedicationsFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingMedFiles(true);
      const uploadedList = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("files", file);
        formData.append("category", "Present Medication");
        formData.append("title", file.name);

        const res = await apiRequest(`${Hmsbaseurl}OPEMR_upload_vital_file/`, "POST", formData);
        if (res.success && Array.isArray(res.files) && res.files.length > 0) {
          uploadedList.push(...res.files);
        } else if (res.success && res.data) {
          const item = Array.isArray(res.data) ? res.data[0] : res.data;
          uploadedList.push(item);
        }
      }

      if (uploadedList.length > 0) {
        const normalized = uploadedList.map(normalizeMedicationFile).filter(Boolean);
        setPresentMedicationFiles(prev => [...prev, ...normalized]);
        toast.success(`${normalized.length} medication file(s) uploaded successfully!`);
      } else {
        toast.error("Failed to upload medication file(s).");
      }
    } catch (err) {
      console.error("Error uploading medication files:", err);
      toast.error("Error uploading medication files.");
    } finally {
      setUploadingMedFiles(false);
      if (medFileInputRef.current) {
        medFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveMedicationFile = async (indexToRemove) => {
    const target = presentMedicationFiles[indexToRemove];
    if (!target) return;

    const fileId = target.file_id || target.id;
    const fileName = target.file_name || target.name || 'File';

    // Immediately remove from UI state
    setPresentMedicationFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));

    // Also remove from MongoDB GridFS if fileId exists
    if (fileId) {
      try {
        await apiRequest(`${Hmsbaseurl}OPEMR_delete_vital_file/${fileId}/`, "DELETE");
        toast.success(`"${fileName}" deleted successfully.`);
      } catch (err) {
        console.warn("Could not delete file from server storage:", err);
        toast.info(`Removed "${fileName}" from consultation.`);
      }
    } else {
      toast.success(`Removed "${fileName}" from consultation.`);
    }
  };

  // Modal & History State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printSummaryRef = useRef(null);

  const handlePrintSummary = () => {
    if (!printSummaryRef.current) return;
    const printContent = printSummaryRef.current.innerHTML;
    const patientName = selectedPatient?.patient?.patient_name || 'Patient';
    const patientUhid = selectedPatient?.patient?.uhid || '';

    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      toast.error('Unable to open print preview. Please allow popups.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Consultation_Summary_${patientName.replace(/\\s+/g, '_')}_${patientUhid}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.35;
              padding: 10px;
            }
            .no-print {
              display: none !important;
            }
            .header-wrap {
              border-bottom: 2px solid #0d9488;
              padding-bottom: 8px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .hosp-name {
              font-size: 19px;
              font-weight: 900;
              color: #0d9488;
              letter-spacing: -0.3px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .hosp-sub {
              font-size: 9.5px;
              color: #64748b;
              line-height: 1.3;
            }
            .doc-info {
              text-align: right;
            }
            .doc-name {
              font-size: 12.5px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .doc-sub {
              font-size: 9.5px;
              color: #475569;
            }
            .patient-banner {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 10px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
            }
            .pb-item .lbl {
              display: block;
              font-size: 8px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .pb-item .val {
              font-size: 10.5px;
              font-weight: 700;
              color: #0f172a;
            }
            .sec-card {
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            .sec-title {
              font-size: 10.5px;
              font-weight: 800;
              color: #0d9488;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border-bottom: 1.5px solid #ccfbf1;
              padding-bottom: 2px;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .vitals-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 6px;
              background: #f0fdfa;
              border: 1px solid #ccfbf1;
              border-radius: 6px;
              padding: 6px 10px;
            }
            .vital-cell {
              text-align: center;
            }
            .vital-cell .vlbl {
              font-size: 8px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 600;
            }
            .vital-cell .vval {
              font-size: 11px;
              font-weight: 800;
              color: #0f766e;
              margin-top: 1px;
            }
            .styled-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              font-size: 10px;
            }
            .styled-table th, .styled-table td {
              border: 1px solid #cbd5e1;
              padding: 4px 8px;
              text-align: left;
            }
            .styled-table th {
              background: #f1f5f9;
              font-weight: 700;
              color: #334155;
            }
            .badge-pill {
              display: inline-block;
              padding: 2px 7px;
              border-radius: 4px;
              font-size: 9.5px;
              font-weight: 600;
              background: #f1f5f9;
              color: #334155;
              border: 1px solid #e2e8f0;
              margin-right: 4px;
              margin-bottom: 3px;
            }
            .badge-accent {
              background: #f0fdfa;
              color: #0d9488;
              border-color: #99f6e4;
            }
            .bullet-list {
              padding-left: 18px;
              margin-top: 3px;
            }
            .bullet-list li {
              margin-bottom: 2px;
            }
            .footer-grid {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #cbd5e1;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              page-break-inside: avoid;
            }
            .sig-area {
              text-align: center;
            }
            .sig-line {
              width: 150px;
              border-bottom: 1px solid #0f172a;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 450);
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printSummaryRef.current || downloadingPdf) return;
    setDownloadingPdf(true);
    const toastId = toast.loading ? toast.loading("Generating consultation summary PDF...") : null;
    if (!toastId) {
      toast.info("Generating consultation summary PDF...");
    }
    try {
      const patientName = (selectedPatient?.patient?.patient_name || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const patientUhid = (selectedPatient?.patient?.uhid || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Consultation_Summary_${patientName}${patientUhid ? `_${patientUhid}` : ''}.pdf`;

      const element = printSummaryRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const MARGIN_MM = 8;
      const printableWidth = PAGE_W_MM - (MARGIN_MM * 2);
      const printableHeight = PAGE_H_MM - (MARGIN_MM * 2);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const ratio = printableWidth / canvas.width;
      const renderedH = canvas.height * ratio;

      if (renderedH <= printableHeight) {
        doc.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, printableWidth, renderedH);
      } else {
        let yOffset = 0;
        let pageIndex = 0;
        const slicePixH = Math.round(printableHeight / ratio);

        while (yOffset < canvas.height) {
          const sliceH = Math.min(slicePixH, canvas.height - yOffset);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

          if (pageIndex > 0) doc.addPage();
          const sliceRenderH = sliceH * ratio;
          doc.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', MARGIN_MM, MARGIN_MM, printableWidth, sliceRenderH);

          yOffset += sliceH;
          pageIndex++;
        }
      }

      doc.save(fileName);
      if (toastId && toast.update) {
        toast.update(toastId, {
          render: 'Consultation Summary PDF downloaded successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        toast.success('Consultation Summary PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (toastId && toast.update) {
        toast.update(toastId, {
          render: 'Failed to generate PDF. Opening print preview...',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        toast.error('Failed to generate PDF. Opening print preview...');
      }
      handlePrintSummary();
    } finally {
      setDownloadingPdf(false);
    }
  };
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [savingConsultation, setSavingConsultation] = useState(false);
  const [pastHistory, setPastHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [patientLabTests, setPatientLabTests] = useState([]);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [historyTab, setHistoryTab] = useState('consultations'); // 'consultations' | 'labTests'
  const [labSearch, setLabSearch] = useState('');

  // Fetch Past Consultation History & Diagnostic Test Details (core_testvalue)
  const fetchPastHistory = async (uhid) => {
    if (!uhid) {
      setPastHistory([]);
      setPatientLabTests([]);
      return;
    }
    setLoadingHistory(true);
    setLoadingLabTests(true);

    // 1. Fetch Past Consultations
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/?uhid=${encodeURIComponent(uhid)}`, "GET");
      let historyList = [];
      if (res.success && Array.isArray(res.data)) {
        const seenIds = new Set();
        for (const h of res.data) {
          const idKey = String(h._id || h.id || `${h.uhid}_${h.created_date || h.date}`);
          if (!seenIds.has(idKey)) {
            seenIds.add(idKey);
            historyList.push(h);
          }
        }
      }

      setPastHistory(historyList);
      if (historyList.length > 0) {
        setSelectedHistoryItem(historyList[0]);

        const isTodayDate = (dateVal) => {
          if (!dateVal) return false;
          let d = new Date(dateVal);
          if (isNaN(d.getTime())) {
            const parts = String(dateVal).trim().split(/[-/]/);
            if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
              d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
          if (isNaN(d.getTime())) return false;
          const now = new Date();
          return d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        };

        // Find if any consultation was entered/saved today
        const todayConsult = historyList.find(h => {
          const cDateVal = h.created_date || h.date || h.consultation_start_time || h.consultation_end_time;
          return isTodayDate(cDateVal);
        });

        if (todayConsult && uhid) {
          const tStart = todayConsult.consultation_start_time || todayConsult.created_date || todayConsult.date;
          if (tStart) {
            setConsultationStartTimes(prev => {
              if (!prev[uhid]) {
                return { ...prev, [uhid]: tStart };
              }
              return prev;
            });
          }
        }

        // Only populate form if consultation was saved today and not already populated from selectedPatient.consultation
        if (todayConsult && !selectedPatient?.consultation) {
          setClinicalPastHistory(Array.isArray(todayConsult.past_history) ? todayConsult.past_history : []);
          setSocialHistory(Array.isArray(todayConsult.social_history) ? todayConsult.social_history : []);
          setSocialHistoryNotes(todayConsult.social_history_notes || "");
          setSelectedSymptoms(Array.isArray(todayConsult.symptoms) ? todayConsult.symptoms : []);
          setSelectedTestIds(Array.isArray(todayConsult.investigation_test_ids) ? todayConsult.investigation_test_ids : []);
          setSelectedMedicineIds(Array.isArray(todayConsult.prescription_item_ids) ? todayConsult.prescription_item_ids : []);

          if (Array.isArray(todayConsult.prescription_details) && todayConsult.prescription_details.length > 0) {
            const pData = {};
            todayConsult.prescription_details.forEach(it => {
              if (it && it.item_id) {
                pData[it.item_id] = {
                  dosage: it.dosage || '',
                  frequency: it.frequency || '',
                  duration: it.duration || '',
                  total_dosage: it.total_dosage || ''
                };
              }
            });
            setPrescriptionData(pData);
          } else {
            setPrescriptionData({});
          }

          setFinding(todayConsult.finding || "");
          setDiet(todayConsult.diet || "");
          setReferToDoctor(todayConsult.refer_to_doctor || "");
          setFollowupDate(todayConsult.followup_date ? String(todayConsult.followup_date).split('T')[0] : "");

          const pastAllergies = todayConsult.allergies || "";
          setAllergies(pastAllergies);
          if (pastAllergies.trim().toUpperCase() === "NO KNOWN ALLERGIES") {
            setAllergyOption("no_known");
          } else if (pastAllergies.trim().length > 0) {
            setAllergyOption("if_any");
          } else {
            setAllergyOption("");
          }

          setChiefComplaints(todayConsult.chief_complaints || "");
          setPresentMedications(todayConsult.present_medications || "");
          setPresentMedicationFiles(Array.isArray(todayConsult.present_medications_attachments) ? todayConsult.present_medications_attachments.map(normalizeMedicationFile).filter(Boolean) : []);

          if (Array.isArray(todayConsult.ct_scan_details)) {
            setSelectedCtIds(todayConsult.ct_scan_details.map(x => x.id || x.item_id || x.name));
          } else {
            setSelectedCtIds([]);
          }
          if (Array.isArray(todayConsult.mri_scan_details)) {
            setSelectedMriIds(todayConsult.mri_scan_details.map(x => x.id || x.item_id || x.name));
          } else {
            setSelectedMriIds([]);
          }
          if (Array.isArray(todayConsult.xray_details)) {
            setSelectedXrayIds(todayConsult.xray_details.map(x => x.id || x.item_id || x.name));
          } else {
            setSelectedXrayIds([]);
          }

          const mHist = todayConsult.menstrual_history || {};
          setMenstrualStatus(mHist.status || "");
          setMenstrualSpecify(mHist.specify || "");

          setVaccinationHistory(todayConsult.vaccination_history || "");
          setObstetricsHistory(todayConsult.obstetrics_history || "");
          setInvestigationDone(todayConsult.investigation_done || "");
          setPhysicalExamination(todayConsult.physical_examination || "");
          setProvisionalDiagnosis(todayConsult.provisional_diagnosis || "");
          const loadedPlan = todayConsult.plan_of_care || "";
          setPlanOfCare(loadedPlan);
          if (loadedPlan) {
            const points = loadedPlan
              .split('\n')
              .map(line => line.replace(/^[•\s*-]+/, '').trim())
              .filter(Boolean);
            setPlanOfCarePoints(points);
          } else {
            setPlanOfCarePoints([]);
          }
        }
      } else {
        setSelectedHistoryItem(null);
      }
    } catch (err) {
      console.error("Error fetching past history:", err);
      setPastHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    // 2. Fetch Patient Lab Test Details from core_testvalue (same as discharge summary)
    try {
      const resLab = await apiRequest(`${Hmsbaseurl}OPEMR_get_patient_lab_results/?uhid=${encodeURIComponent(uhid)}`, "GET");
      if (resLab.success && Array.isArray(resLab.data)) {
        setPatientLabTests(resLab.data);
      } else if (Array.isArray(resLab)) {
        setPatientLabTests(resLab);
      } else {
        setPatientLabTests([]);
      }
    } catch (err) {
      console.error("Error fetching lab test history:", err);
      setPatientLabTests([]);
    } finally {
      setLoadingLabTests(false);
    }
  };

  useEffect(() => {
    if (selectedPatient?.patient?.uhid) {
      fetchPastHistory(selectedPatient.patient.uhid);

      const isTodayDate = (dateVal) => {
        if (!dateVal) return false;
        let d = new Date(dateVal);
        if (isNaN(d.getTime())) {
          const parts = String(dateVal).trim().split(/[-/]/);
          if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
            d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        if (isNaN(d.getTime())) return false;
        const now = new Date();
        return d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate();
      };

      // Only load consultation if it was saved TODAY!
      const tc = selectedPatient.consultation;
      const tcDateVal = tc ? (tc.created_date || tc.date || tc.consultation_start_time || tc.consultation_end_time) : null;
      const isTcToday = tc && isTodayDate(tcDateVal);

      if (tc && isTcToday) {
        const uhidKey = selectedPatient.patient?.uhid || selectedPatient.uhid;
        const tcStartTime = tc.consultation_start_time || tc.created_date || tc.date || selectedPatient.consultation_time;
        if (uhidKey && tcStartTime) {
          setConsultationStartTimes(prev => {
            if (!prev[uhidKey]) {
              return { ...prev, [uhidKey]: tcStartTime };
            }
            return prev;
          });
        }

        setSelectedSymptoms(Array.isArray(tc.symptoms) ? tc.symptoms : []);
        setSelectedTestIds(Array.isArray(tc.investigation_test_ids) ? tc.investigation_test_ids : []);
        setSelectedMedicineIds(Array.isArray(tc.prescription_item_ids) ? tc.prescription_item_ids : []);

        if (Array.isArray(tc.prescription_details) && tc.prescription_details.length > 0) {
          const pData = {};
          tc.prescription_details.forEach(it => {
            if (it && it.item_id) {
              pData[it.item_id] = {
                dosage: it.dosage || '',
                frequency: it.frequency || '',
                duration: it.duration || '',
                total_dosage: it.total_dosage || ''
              };
            }
          });
          setPrescriptionData(pData);
        } else {
          setPrescriptionData({});
        }

        setFinding(tc.finding || "");
        setDiet(tc.diet || "");
        setReferToDoctor(tc.refer_to_doctor || "");
        setFollowupDate(tc.followup_date ? String(tc.followup_date).split('T')[0] : "");

        const pastAllergies = tc.allergies || "";
        setAllergies(pastAllergies);
        if (pastAllergies.trim().toUpperCase() === "NO KNOWN ALLERGIES") {
          setAllergyOption("no_known");
        } else if (pastAllergies.trim().length > 0) {
          setAllergyOption("if_any");
        } else {
          setAllergyOption("");
        }

        setChiefComplaints(tc.chief_complaints || "");
        setClinicalPastHistory(Array.isArray(tc.past_history) ? tc.past_history : []);
        setPresentMedications(tc.present_medications || "");
        const consultAttachments = Array.isArray(tc.present_medications_attachments) ? tc.present_medications_attachments : [];
        const triageAttachments = Array.isArray(selectedPatient?.vital_entry?.attachments)
          ? selectedPatient.vital_entry.attachments.filter(a => a.category === "Present Medication")
          : [];
        const combinedAttachments = consultAttachments.length > 0 ? consultAttachments : triageAttachments;
        setPresentMedicationFiles(combinedAttachments.map(normalizeMedicationFile).filter(Boolean));
        setSocialHistory(Array.isArray(tc.social_history) ? tc.social_history : []);
        setSocialHistoryNotes(tc.social_history_notes || "");

        if (Array.isArray(tc.ct_scan_details)) {
          setSelectedCtIds(tc.ct_scan_details.map(x => x.id || x.item_id || x.name));
        } else {
          setSelectedCtIds([]);
        }
        if (Array.isArray(tc.mri_scan_details)) {
          setSelectedMriIds(tc.mri_scan_details.map(x => x.id || x.item_id || x.name));
        } else {
          setSelectedMriIds([]);
        }
        if (Array.isArray(tc.xray_details)) {
          setSelectedXrayIds(tc.xray_details.map(x => x.id || x.item_id || x.name));
        } else {
          setSelectedXrayIds([]);
        }

        const mHist = tc.menstrual_history || {};
        setMenstrualStatus(mHist.status || "");
        setMenstrualSpecify(mHist.specify || "");

        setVaccinationHistory(tc.vaccination_history || "");
        setObstetricsHistory(tc.obstetrics_history || "");
        setInvestigationDone(tc.investigation_done || "");
        setPhysicalExamination(tc.physical_examination || "");
        setProvisionalDiagnosis(tc.provisional_diagnosis || "");
        const loadedPlan = tc.plan_of_care || "";
        setPlanOfCare(loadedPlan);
        if (loadedPlan) {
          const points = loadedPlan
            .split('\n')
            .map(line => line.replace(/^[•\s*-]+/, '').trim())
            .filter(Boolean);
          setPlanOfCarePoints(points);
        } else {
          setPlanOfCarePoints([]);
        }
      } else {
        // Clean fresh form for a new patient consultation
        setSelectedSymptoms([]);
        setSelectedTestIds([]);
        setSelectedCtIds([]);
        setSelectedMriIds([]);
        setSelectedXrayIds([]);
        setSelectedMedicineIds([]);
        setPrescriptionData({});
        setFinding("");
        setDiet("");
        setReferToDoctor("");
        setFollowupDate("");
        setAllergies("");
        setAllergyOption("");
        setChiefComplaints("");
        setClinicalPastHistory([]);
        const isVitalToday = selectedPatient.vital_status === "Completed" ||
          (selectedPatient.vital_entry && (isTodayDate(selectedPatient.vital_entry.created_date) || isTodayDate(selectedPatient.vital_entry.date)));
        const triageMedFiles = isVitalToday && Array.isArray(selectedPatient?.vital_entry?.attachments)
          ? selectedPatient.vital_entry.attachments.filter(a => a.category === "Present Medication")
          : [];
        setPresentMedicationFiles(triageMedFiles.map(normalizeMedicationFile).filter(Boolean));
        setSocialHistory([]);
        setSocialHistoryNotes("");
        setMenstrualStatus("");
        setMenstrualSpecify("");
        setVaccinationHistory("");
        setObstetricsHistory("");
        setInvestigationDone("");
        setPhysicalExamination("");
        setProvisionalDiagnosis("");
        setPlanOfCare("");
        setPlanOfCarePoints([]);
        setNewPlanPoint("");
      }
    }
  }, [selectedPatient]);

  /*
  // Optional convenience: doctor can copy a past consultation to form if explicitly desired
  const handleCopyHistoryToForm = (item) => {
    if (!item) return;
    setSelectedSymptoms(Array.isArray(item.symptoms) ? item.symptoms : []);
    setSelectedTestIds(Array.isArray(item.investigation_test_ids) ? item.investigation_test_ids : []);
    setSelectedMedicineIds(Array.isArray(item.prescription_item_ids) ? item.prescription_item_ids : []);

    if (Array.isArray(item.prescription_details) && item.prescription_details.length > 0) {
      const pData = {};
      item.prescription_details.forEach(it => {
        if (it && it.item_id) {
          pData[it.item_id] = {
            dosage: it.dosage || '',
            frequency: it.frequency || '',
            duration: it.duration || '',
            total_dosage: it.total_dosage || ''
          };
        }
      });
      setPrescriptionData(pData);
    } else {
      setPrescriptionData({});
    }

    setFinding(item.finding || "");
    setDiet(item.diet || "");
    setReferToDoctor(item.refer_to_doctor || "");
    setFollowupDate(item.followup_date || "");
    const pastAllergies = item.allergies || "";
    setAllergies(pastAllergies);
    if (pastAllergies.trim().toUpperCase() === "NO KNOWN ALLERGIES") {
      setAllergyOption("no_known");
    } else if (pastAllergies.trim().length > 0) {
      setAllergyOption("if_any");
    } else {
      setAllergyOption("");
    }
    setChiefComplaints(item.chief_complaints || "");
    setClinicalPastHistory(Array.isArray(item.past_history) ? item.past_history : []);
    setPresentMedications(item.present_medications || "");
    setPresentMedicationFiles(Array.isArray(item.present_medications_attachments) ? item.present_medications_attachments.map(normalizeMedicationFile).filter(Boolean) : []);
    setSocialHistory(Array.isArray(item.social_history) ? item.social_history : []);
    setSocialHistoryNotes(item.social_history_notes || "");

    const mHist = item.menstrual_history || {};
    setMenstrualStatus(mHist.status || "");
    setMenstrualSpecify(mHist.specify || "");

    setVaccinationHistory(item.vaccination_history || "");
    setObstetricsHistory(item.obstetrics_history || "");
    setInvestigationDone(item.investigation_done || "");
    setPhysicalExamination(item.physical_examination || "");
    setProvisionalDiagnosis(item.provisional_diagnosis || "");
    const loadedPlan = item.plan_of_care || "";
    setPlanOfCare(loadedPlan);
    if (loadedPlan) {
      const points = loadedPlan
        .split('\n')
        .map(line => line.replace(/^[•\s*-]+/, '').trim())
        .filter(Boolean);
      setPlanOfCarePoints(points);
    } else {
      setPlanOfCarePoints([]);
    }

    setShowHistoryModal(false);
    toast.success("Past consultation data copied to active form.");
  };
  */

  // 1. Fetch Patients & Masters on mount
  useEffect(() => {
    fetchBilledPatients();
    fetchSymptoms();
    fetchDiagnosticsTests();
    fetchMedicines();
    fetchReferralDoctors();
    fetchRadiologyItems();
  }, []);

  const fetchBilledPatients = async () => {
    setLoadingPatients(true);
    try {
      const loggedInDoctorId = localStorage.getItem("employeeId") || "";
      const url = loggedInDoctorId
        ? `${Hmsbaseurl}OPEMR_get_Doctor_patient/?doctor_id=${encodeURIComponent(loggedInDoctorId)}`
        : `${Hmsbaseurl}OPEMR_get_Doctor_patient/`;
      const res = await apiRequest(url, "GET");
      if (res.success && res.data) {
        setPatients(res.data);
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

  const fetchReferralDoctors = async () => {
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_referral_doctors/`, "GET");
      if (res.success) {
        if (Array.isArray(res.data)) {
          setReferralDoctors(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setReferralDoctors(res.data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching referral doctors:", err);
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

  const fetchRadiologyItems = async () => {
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_radiology_items/`, "GET");
      if (res.success) {
        setCtList(Array.isArray(res.ct) ? res.ct : []);
        setMriList(Array.isArray(res.mri) ? res.mri : []);
        setXrayList(Array.isArray(res.xray) ? res.xray : []);
      }
    } catch (err) {
      console.error("Error fetching radiology items:", err);
    }
  };

  // Patient counts by status
  const counts = useMemo(() => {
    let waiting = 0, ready = 0, completed = 0;
    patients.forEach(p => {
      const isCompleted = Boolean(
        p.is_consultation_completed ||
        p.consultation_status === 'Completed' ||
        p.consultation?.status === 'Completed' ||
        p.consultation?.consultation_end_time
      );
      const isReady = !isCompleted && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');
      if (isCompleted) {
        completed++;
      } else if (isReady) {
        ready++;
      } else {
        waiting++;
      }
    });
    return { all: patients.length, waiting, ready, completed };
  }, [patients]);

  // Filter patients by search query and statusFilter
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || (
        (p.patient?.patient_name || "").toLowerCase().includes(q) ||
        (p.patient?.uhid || "").toLowerCase().includes(q) ||
        (p.bill_number || "").toString().toLowerCase().includes(q)
      );
      if (!matchesSearch) return false;

      const isCompleted = Boolean(
        p.is_consultation_completed ||
        p.consultation_status === 'Completed' ||
        p.consultation?.status === 'Completed' ||
        p.consultation?.consultation_end_time
      );
      const isReady = !isCompleted && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');
      const isWaiting = !isCompleted && !isReady;

      if (statusFilter === 'completed') return isCompleted;
      if (statusFilter === 'ready') return isReady;
      if (statusFilter === 'waiting') return isWaiting;
      return true;
    });
  }, [patients, searchQuery, statusFilter]);

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

  const medicineOptions = useMemo(() => medicineList.map(m => ({ value: m.item_id, label: m.item_name })), [medicineList]);

  const selectedMedicineOptions = useMemo(() => {
    return selectedMedicineIds.map(id => {
      const m = medicineList.find(x => x.item_id === id);
      return { value: id, label: m ? m.item_name : `Item #${id}` };
    });
  }, [selectedMedicineIds, medicineList]);

  const symptomOptions = useMemo(() => symptomList.map(s => ({ value: s, label: s })), [symptomList]);

  const selectedSymptomOptions = useMemo(() => {
    return selectedSymptoms
      .filter(s => s !== 'OTHERS' && (typeof s !== 'string' || !s.startsWith('OTHERS:')))
      .map(s => ({ value: s, label: s }));
  }, [selectedSymptoms]);

  const testOptions = useMemo(() => testList.map(t => {
    const sc = t.shortcut ? ` (${t.shortcut})` : '';
    const dept = t.department ? ` [${t.department}]` : '';
    return {
      value: t.test_id,
      label: `${t.test_name}${sc}${dept}`,
      shortcut: t.shortcut || '',
      test_name: t.test_name,
      department: t.department || ''
    };
  }), [testList]);

  const selectedTestOptions = useMemo(() => {
    return selectedTestIds.map(id => {
      const t = testList.find(x => x.test_id === id);
      if (!t) return { value: id, label: `Test #${id}` };
      const sc = t.shortcut ? ` (${t.shortcut})` : '';
      return { value: id, label: `${t.test_name}${sc}` };
    });
  }, [selectedTestIds, testList]);

  // CT Options
  const ctOptions = useMemo(() => ctList.map(item => ({
    value: item.id || item.item_id || item.name,
    label: item.name,
    data: item
  })), [ctList]);

  const selectedCtOptions = useMemo(() => {
    return selectedCtIds.map(id => {
      const found = ctList.find(x => (x.id === id || x.item_id === id || x.name === id));
      return { value: id, label: found ? found.name : id };
    });
  }, [selectedCtIds, ctList]);

  // MRI Options
  const mriOptions = useMemo(() => mriList.map(item => ({
    value: item.id || item.item_id || item.name,
    label: item.name,
    data: item
  })), [mriList]);

  const selectedMriOptions = useMemo(() => {
    return selectedMriIds.map(id => {
      const found = mriList.find(x => (x.id === id || x.item_id === id || x.name === id));
      return { value: id, label: found ? found.name : id };
    });
  }, [selectedMriIds, mriList]);

  // X-Ray Options
  const xrayOptions = useMemo(() => xrayList.map(item => ({
    value: item.id || item.item_id || item.name,
    label: item.name,
    data: item
  })), [xrayList]);

  const selectedXrayOptions = useMemo(() => {
    return selectedXrayIds.map(id => {
      const found = xrayList.find(x => (x.id === id || x.item_id === id || x.name === id));
      return { value: id, label: found ? found.name : id };
    });
  }, [selectedXrayIds, xrayList]);

  const doctorOptions = useMemo(() => referralDoctors.map(d => ({ value: d.employeeId, label: d.employeeName })), [referralDoctors]);

  const filteredDoctors = useMemo(() => {
    if (!doctorSearch) return referralDoctors;
    return referralDoctors.filter(d => d.employeeName.toLowerCase().includes(doctorSearch.toLowerCase()));
  }, [referralDoctors, doctorSearch]);

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

  const handleStartConsultationAPI = async (startTimeStr, targetPatient = null) => {
    const p = targetPatient || selectedPatient;
    if (!p) return;
    try {
      const patientUhid = p.patient?.uhid || p.uhid;
      const consultId = p.consultation?._id || p.consultation?.id || null;
      const payload = {
        id: consultId,
        uhid: patientUhid,
        doctor_id: p.doctor_id || p.patient?.doctor_id || "",
        consultation_start_time: startTimeStr,
        status: "In Progress"
      };
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/`, "POST", payload);
      if (res.success && res.data) {
        setSelectedPatient(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            consultation: res.data,
            consultation_time: res.data.consultation_start_time || startTimeStr,
            consultation_status: "In Consultation",
          };
        });
        fetchBilledPatients();
      } else {
        console.error("Failed to start consultation in DB");
      }
    } catch (err) {
      console.error(err);
    }
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
      delete cleanVitals._id;
      delete cleanVitals.created_by_name; // Do NOT store created_by name
      // Store employee ID in created_by
      cleanVitals.created_by = String(selectedPatient.vital_entry?.created_by || cleanVitals.created_by || "");
      delete cleanVitals.created_date;
      delete cleanVitals.lastmodified_by;
      delete cleanVitals.lastmodified_date;
      delete cleanVitals['auth-user-id'];

      const loggedInDoctorId = localStorage.getItem("employeeId") || "";
      const currentDoctorId = loggedInDoctorId || selectedPatient.doctor_id || selectedPatient.patient?.doctor_id || "";

      const selectedCtObjects = selectedCtIds.map(id => {
        const found = ctList.find(x => x.id === id || x.item_id === id || x.name === id);
        return found ? { id: found.id, item_id: found.item_id, name: found.name, category: 'CT' } : { id, name: id, category: 'CT' };
      });
      const selectedMriObjects = selectedMriIds.map(id => {
        const found = mriList.find(x => x.id === id || x.item_id === id || x.name === id);
        return found ? { id: found.id, item_id: found.item_id, name: found.name, category: 'MRI' } : { id, name: id, category: 'MRI' };
      });
      const selectedXrayObjects = selectedXrayIds.map(id => {
        const found = xrayList.find(x => x.id === id || x.item_id === id || x.name === id);
        return found ? { id: found.id, item_id: found.item_id, name: found.name, category: 'X-Ray' } : { id, name: id, category: 'X-Ray' };
      });

      const patientUhid = selectedPatient.patient?.uhid || selectedPatient.uhid || "";
      const consultId = selectedPatient.consultation?._id || selectedPatient.consultation?.id || null;
      const resolvedStartTime = consultationStartTimes[patientUhid] ||
        selectedPatient?.consultation?.consultation_start_time ||
        selectedPatient?.consultation_time ||
        selectedPatient?.consultation?.created_date ||
        selectedPatient?.consultation?.date ||
        new Date().toISOString();

      const payload = {
        id: consultId,
        uhid: patientUhid,
        doctor_id: currentDoctorId,
        vitals: cleanVitals, // id removed!
        symptoms: selectedSymptoms,
        investigation_test_ids: selectedTestIds, // Stored test_id array!
        investigation_details: [
          ...testList.filter(t => selectedTestIds.includes(t.test_id)),
          ...selectedCtObjects.map(c => ({ test_id: c.id, test_name: c.name, department: 'CT' })),
          ...selectedMriObjects.map(m => ({ test_id: m.id, test_name: m.name, department: 'MRI' })),
          ...selectedXrayObjects.map(x => ({ test_id: x.id, test_name: x.name, department: 'X-Ray' }))
        ],
        ct_scan_details: selectedCtObjects,
        mri_scan_details: selectedMriObjects,
        xray_details: selectedXrayObjects,
        prescription_item_ids: selectedMedicineIds, // Stored item_id array!
        prescription_details: selectedMedicineIds.map(id => {
          const m = medicineList.find(x => x.item_id === id);
          if (!m) return null;
          const pd = prescriptionData[id] || {};
          return {
            item_id: id,
            item_name: m.item_name,
            dosage: pd.dosage || 'N/A',
            frequency: pd.frequency || 'N/A',
            duration: pd.duration || 'N/A',
            total_dosage: pd.total_dosage || '0'
          };
        }).filter(Boolean),
        finding: finding,
        diet: diet,
        refer_to_doctor: referToDoctor,
        followup_date: followupDate,
        consultation_start_time: resolvedStartTime,
        consultation_end_time: new Date().toISOString(),
        status: "Completed",
        allergies: allergies,
        chief_complaints: chiefComplaints,
        past_history: clinicalPastHistory,
        present_medications: presentMedications,
        present_medications_attachments: presentMedicationFiles,
        social_history: socialHistory,
        social_history_notes: socialHistoryNotes,
        menstrual_history: isFemale ? {
          status: menstrualStatus,
          specify: menstrualSpecify
        } : {},
        vaccination_history: vaccinationHistory,
        obstetrics_history: obstetricsHistory,
        investigation_done: investigationDone,
        physical_examination: physicalExamination,
        provisional_diagnosis: provisionalDiagnosis,
        plan_of_care: planOfCarePoints.length > 0 ? planOfCarePoints.map(p => `• ${p}`).join('\n') : planOfCare
      };

      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/`, "POST", payload);
      if (res.success) {
        toast.success("Consultation saved successfully!");
        setConsultationStartTimes(prev => {
          const newTimes = { ...prev };
          delete newTimes[selectedPatient?.patient?.uhid];
          return newTimes;
        });
        if (res.data) {
          setSelectedPatient(prev => prev ? ({ ...prev, consultation: res.data, consultation_status: "Completed" }) : null);
        } else {
          setSelectedPatient(null);
        }
        fetchBilledPatients();
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

  // Check if selected patient is female (strict check on patient.gender)
  const isFemale = useMemo(() => {
    if (!selectedPatient) return false;
    const p = selectedPatient.patient || {};
    const g = (p.gender || selectedPatient.gender || "").toLowerCase().trim();
    return g === "female" || g === "f";
  }, [selectedPatient]);

  // Vital entry data extracted from selectedPatient (VitalEntrySerializer)
  // Only display vitals if they were recorded for the current visit (vital_status === "Completed")
  const vitals = selectedPatient?.vital_status === "Completed" ? selectedPatient?.vital_entry : null;

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

      </PageHeader>

      <MainGrid>
        {/* Doctor Consultation Workspace */}
        <Workspace>
          {/* === Patient Queue Cards === */}
          {!selectedPatient && (
            <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
              {/* Simple Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#0d9488,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Patient Queue</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Total {patients.length} Patient{patients.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: statusFilter === 'all' ? '#0d9488' : 'transparent',
                      color: statusFilter === 'all' ? '#fff' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({counts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ready')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: statusFilter === 'ready' ? '#16a34a' : 'transparent',
                      color: statusFilter === 'ready' ? '#fff' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Ready ({counts.ready})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('waiting')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: statusFilter === 'waiting' ? '#d97706' : 'transparent',
                      color: statusFilter === 'waiting' ? '#fff' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Waiting ({counts.waiting})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('completed')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: statusFilter === 'completed' ? '#7c3aed' : 'transparent',
                      color: statusFilter === 'completed' ? '#fff' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Completed ({counts.completed})
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* View Mode Toggle */}
                  <ViewToggleGroup>
                    <ViewToggleButton
                      type="button"
                      $active={queueViewMode === 'card'}
                      onClick={() => setQueueViewMode('card')}
                      title="Card View"
                    >
                      <LayoutGrid size={15} /> Card
                    </ViewToggleButton>
                    <ViewToggleButton
                      type="button"
                      $active={queueViewMode === 'table'}
                      onClick={() => setQueueViewMode('table')}
                      title="Table View"
                    >
                      <List size={15} /> Table
                    </ViewToggleButton>
                  </ViewToggleGroup>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px' }}>
                    <Search size={14} color="#94a3b8" />
                    <input type="text" placeholder="Search name / UHID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155', width: '180px' }} />
                  </div>
                  <button
                    type="button"
                    onClick={fetchBilledPatients}
                    title="Refresh Queue"
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '9px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#0d9488',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* Patient List (Cards or Table) */}
              {loadingPatients ? (
                <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div style={{ padding: '80px 40px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                  <Users size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#475569' }}>No patients in queue</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Refresh to check for new arrivals</p>
                </div>
              ) : queueViewMode === 'table' ? (
                <TableWrapper>
                  <PatientTable>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>UHID</th>
                        <th>Patient Name</th>
                        <th>Age / Gender</th>
                        <th>Contact</th>
                        <th>Bill No</th>
                        <th>Billed Time</th>
                        <th>Vital Status</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p, idx) => {
                        const isSelected = selectedPatient?.patient?.uhid === p.patient?.uhid;
                        const name = p.patient?.patient_name || 'Unknown Patient';
                        const billedTime = p.billed_date ? new Date(p.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                        const isConsultDone = Boolean(
                          p.is_consultation_completed ||
                          p.consultation_status === 'Completed' ||
                          p.consultation?.status === 'Completed' ||
                          p.consultation?.consultation_end_time
                        );
                        const isReady = !isConsultDone && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');
                        const vDate = p.vital_entry?.vital_entry_date || p.vital_entry?.created_date;
                        const vitalTime = vDate ? new Date(vDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

                        return (
                          <tr key={p.bill_number || p.patient?.uhid || idx} style={{ background: isSelected ? '#f0fdfa' : 'transparent' }}>
                            <td style={{ fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccfbf1', fontSize: '0.82rem' }}>
                                {p.patient?.uhid || '--'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {name}
                                {p.is_referred && (
                                  <span style={{
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    Referred {p.referred_from ? `(Dr. ${p.referred_from})` : ''}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{ color: '#475569' }}>
                                {p.patient?.age ? `${p.patient.age} Yrs` : '--'} • {p.patient?.gender || '--'}
                              </span>
                            </td>
                            <td>
                              {p.patient?.mobilePhone ? (
                                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📞</span> {p.patient.mobilePhone}
                                </span>
                              ) : '--'}
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
                                {p.bill_number || '--'}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} color="#94a3b8" /> {billedTime}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                background: isConsultDone ? '#f5f3ff' : (isReady ? '#f0fdf4' : '#fffbeb'),
                                color: isConsultDone ? '#7c3aed' : (isReady ? '#16a34a' : '#d97706'),
                                border: `1px solid ${isConsultDone ? '#ddd6fe' : (isReady ? '#bbf7d0' : '#fde68a')}`,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {isConsultDone ? (
                                  <>
                                    <CheckCircle2 size={12} /> Completed
                                    {p.consultation_time && <span style={{ fontSize: '0.7rem', color: '#6d28d9' }}>({new Date(p.consultation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                                  </>
                                ) : isReady ? (
                                  <>
                                    <CheckCircle2 size={12} /> Ready
                                    {vitalTime && <span style={{ fontSize: '0.7rem', color: '#15803d' }}>({vitalTime})</span>}
                                  </>
                                ) : (
                                  <>
                                    <Clock size={12} /> Waiting
                                  </>
                                )}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setActiveTab('vitals');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                style={{
                                  padding: '7px 14px',
                                  background: isConsultDone ? '#f5f3ff' : '#0d9488',
                                  color: isConsultDone ? '#7c3aed' : '#ffffff',
                                  border: isConsultDone ? '1.5px solid #8b5cf6' : 'none',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: isConsultDone ? 'none' : '0 2px 6px rgba(13,148,136,0.25)',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = isConsultDone ? '#7c3aed' : '#0f766e';
                                  e.currentTarget.style.color = '#ffffff';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = isConsultDone ? '#f5f3ff' : '#0d9488';
                                  e.currentTarget.style.color = isConsultDone ? '#7c3aed' : '#ffffff';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                {isConsultDone ? 'View / Edit Consultation →' : 'Start Consultation →'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </PatientTable>
                </TableWrapper>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
                  {filteredPatients.map((p, idx) => {
                    const isSelected = selectedPatient?.patient?.uhid === p.patient?.uhid;
                    const name = p.patient?.patient_name || 'Unknown Patient';
                    const initials = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
                    const avatarStyles = [
                      { bg: '#e0f2fe', color: '#0284c7', grad: 'linear-gradient(135deg,#0284c7,#0891b2)' },
                      { bg: '#dcfce7', color: '#16a34a', grad: 'linear-gradient(135deg,#16a34a,#059669)' },
                      { bg: '#fef3c7', color: '#d97706', grad: 'linear-gradient(135deg,#d97706,#f59e0b)' },
                      { bg: '#f3e8ff', color: '#9333ea', grad: 'linear-gradient(135deg,#9333ea,#7c3aed)' },
                      { bg: '#fee2e2', color: '#dc2626', grad: 'linear-gradient(135deg,#dc2626,#e11d48)' },
                      { bg: '#e0e7ff', color: '#4f46e5', grad: 'linear-gradient(135deg,#4f46e5,#6366f1)' },
                      { bg: '#fce7f3', color: '#db2777', grad: 'linear-gradient(135deg,#db2777,#ec4899)' },
                      { bg: '#f0fdf4', color: '#15803d', grad: 'linear-gradient(135deg,#15803d,#16a34a)' },
                    ];
                    const av = avatarStyles[idx % avatarStyles.length];
                    const billedTime = p.billed_date ? new Date(p.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                    const vDate = p.vital_entry?.vital_entry_date || p.vital_entry?.created_date;
                    const vitalTime = vDate ? new Date(vDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                    const isConsultDone = Boolean(
                      p.is_consultation_completed ||
                      p.consultation_status === 'Completed' ||
                      p.consultation?.status === 'Completed' ||
                      p.consultation?.consultation_end_time
                    );
                    const isReady = !isConsultDone && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');
                    return (
                      <div key={p.patient?.uhid} style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: `1.5px solid ${isSelected ? '#0d9488' : (isConsultDone ? '#ddd6fe' : '#e2e8f0')}`,
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 0 0 3px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.22s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: '260px'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = isSelected ? '#0d9488' : (isConsultDone ? '#ddd6fe' : '#e2e8f0'); e.currentTarget.style.boxShadow = isSelected ? '0 0 0 3px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {/* Time slot header */}
                        <div style={{
                          background: av.grad,
                          padding: '8px 14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          fontWeight: 700, fontSize: '0.84rem', color: '#fff', letterSpacing: '0.3px',
                          height: '38px', boxSizing: 'border-box', whiteSpace: 'nowrap'
                        }}>
                          <Clock size={14} color="rgba(255,255,255,0.9)" />
                          {billedTime}
                          {vitalTime && (
                            <>
                              <span style={{ opacity: 0.7, fontWeight: 400 }}> → </span>
                              <Heart size={14} color="rgba(255,255,255,0.9)" />
                              {vitalTime}
                            </>
                          )}
                        </div>

                        {/* Card Content */}
                        <div style={{
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'space-between',
                          boxSizing: 'border-box'
                        }}>
                          {/* Top Row: Avatar + Name/UHID + Status Badge */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              {/* Icon Badge */}
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: av.bg || '#f0fdfa',
                                border: `1.5px solid ${av.color}35`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: av.color || '#0d9488',
                                flexShrink: 0,
                                boxShadow: `0 2px 6px ${av.color}20`,
                                position: 'relative',
                              }}>
                                <Stethoscope size={20} strokeWidth={2.2} />
                                <span style={{
                                  position: 'absolute',
                                  bottom: '-2px',
                                  right: '-2px',
                                  width: '13px',
                                  height: '13px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                }}>
                                  <Heart size={8} fill="#ef4444" stroke="#ef4444" />
                                </span>
                              </div>

                              {/* Name + UHID */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  title={name}
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.94rem',
                                    color: '#0f172a',
                                    lineHeight: 1.25,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {name}
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0d9488', marginTop: '2px', whiteSpace: 'nowrap' }}>
                                  UHID: {p.patient?.uhid || '--'}
                                </div>
                                {p.is_referred && (
                                  <span style={{
                                    display: 'inline-block',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    marginTop: '2px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%'
                                  }}>
                                    Referred {p.referred_from ? `(Dr. ${p.referred_from})` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span style={{
                              flexShrink: 0,
                              background: isConsultDone ? '#f5f3ff' : (isReady ? '#f0fdf4' : '#fffbeb'),
                              color: isConsultDone ? '#7c3aed' : (isReady ? '#16a34a' : '#d97706'),
                              border: `1px solid ${isConsultDone ? '#ddd6fe' : (isReady ? '#bbf7d0' : '#fde68a')}`,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '4px 9px',
                              borderRadius: '20px',
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isConsultDone ? (
                                <>
                                  <CheckCircle2 size={11} /> Completed
                                </>
                              ) : isReady ? (
                                <>
                                  <CheckCircle2 size={11} /> Ready
                                </>
                              ) : (
                                <>
                                  <Clock size={11} /> Waiting
                                </>
                              )}
                            </span>
                          </div>

                          {/* Info Section (Consistent Fixed Height) */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            margin: '12px 0 16px 0',
                            minHeight: '44px',
                            justifyContent: 'center'
                          }}>
                            <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                              {p.patient?.age ? `${p.patient.age} Yrs` : '--'} • {p.patient?.gender || '--'}
                            </div>
                            <div style={{
                              fontSize: '0.82rem',
                              color: p.patient?.mobilePhone ? '#475569' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 500
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={av.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z" /></svg>
                              {p.patient?.mobilePhone || 'No contact number'}
                            </div>
                          </div>

                          {/* Pinned Bottom CTA Button */}
                          <button
                            onClick={() => { setSelectedPatient(p); setActiveTab('vitals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{
                              width: '100%',
                              height: '40px',
                              padding: '0 12px',
                              marginTop: 'auto',
                              background: isConsultDone ? '#f5f3ff' : '#fff',
                              color: isConsultDone ? '#7c3aed' : av.color,
                              border: `1.5px solid ${isConsultDone ? '#8b5cf6' : av.color}`,
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.18s ease',
                              boxSizing: 'border-box'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = isConsultDone ? '#7c3aed' : av.color;
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = isConsultDone ? '#f5f3ff' : '#fff';
                              e.currentTarget.style.color = isConsultDone ? '#7c3aed' : av.color;
                            }}
                          >
                            {isConsultDone ? 'View / Edit Consultation →' : 'Start Consultation →'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* ===== CONSULTATION WORKSPACE (two-panel) ===== */}
          {selectedPatient && (() => {
            const sp = selectedPatient;
            const name = sp.patient?.patient_name || 'Unknown';
            const initials = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
            const billedTime = sp.billed_date ? new Date(sp.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const vDate = sp.vital_entry?.vital_entry_date || sp.vital_entry?.created_date;
            const vitalsTime = vDate ? new Date(vDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
            const isConsultDone = Boolean(
              (sp.consultation && (sp.consultation.status === 'Completed' || sp.consultation.consultation_end_time)) ||
              (sp.is_consultation_completed && sp.consultation)
            );
            const consultStart = sp.consultation?.consultation_start_time || sp.consultation_time || consultationStartTimes[sp.patient?.uhid];
            const isConsultationStarted = Boolean(consultStart || isConsultDone);
            const consultTime = consultStart ? new Date(consultStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
            const waitMins = sp.billed_date ? Math.floor((Date.now() - new Date(sp.billed_date).getTime()) / 60000) : 0;
            const waitText = waitMins >= 60 ? `${Math.floor(waitMins / 60)} hr ${waitMins % 60} min` : `${waitMins} min`;
            return (
              <div style={{ display: 'flex', gap: '0', borderRadius: '18px', overflow: 'hidden', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', minHeight: '500px' }}>

                {/* ── LEFT SIDEBAR (Patient Details Panel with mild color background) ── */}
                <div style={{
                  width: '240px',
                  flexShrink: 0,
                  background: 'linear-gradient(180deg, #f0fdfa 0%, #f7fcfb 50%, #f8fafc 100%)',
                  borderRight: '1.5px solid #ccfbf1',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '18px 16px',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}>
                  <div>
                    {/* ← Back to queue */}
                    <button
                      onClick={() => setSelectedPatient(null)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#ffffff',
                        border: '1.5px solid #ccfbf1',
                        borderRadius: '9px',
                        color: '#0f766e',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '16px',
                        boxShadow: '0 1px 3px rgba(13,148,136,0.06)',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#e6fffa';
                        e.currentTarget.style.borderColor = '#0d9488';
                        e.currentTarget.style.color = '#0d9488';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#ccfbf1';
                        e.currentTarget.style.color = '#0f766e';
                      }}
                    >
                      ← Back to queue
                    </button>

                    {/* Avatar & Patient Info Card */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginBottom: '14px',
                      background: '#ffffff',
                      border: '1px solid #ccfbf1',
                      borderRadius: '12px',
                      padding: '14px 10px',
                      boxShadow: '0 1px 3px rgba(13,148,136,0.04)'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f172a', textAlign: 'center', lineHeight: 1.3 }}>
                        {name}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: '#0d9488',
                        fontWeight: 700,
                        marginTop: '4px',
                        background: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {sp.patient?.uhid}
                      </div>
                      {sp.is_referred && (
                        <div style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          marginTop: '6px',
                          textAlign: 'center'
                        }}>
                          🔄 Referred {sp.referred_from ? `from Dr. ${sp.referred_from}` : ''}
                        </div>
                      )}
                    </div>

                    {/* Demographics Card */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '16px',
                      background: '#ffffff',
                      border: '1px solid #ccfbf1',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      boxShadow: '0 1px 3px rgba(13,148,136,0.04)'
                    }}>
                      {[
                        ['Age / Gender', `${sp.patient?.age || '--'} Yrs / ${sp.patient?.gender || '--'}`],
                        ['Mobile', sp.patient?.mobilePhone || '--'],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontSize: '0.68rem', color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{lbl}</div>
                          <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600, marginTop: '1px' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Start Consultation button or Completed badge */}
                    {/* Status badge when Completed or In Consultation */}
                    {isConsultDone && (
                      <div style={{
                        width: '100%',
                        padding: '8px',
                        background: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        color: '#16a34a',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(22,163,74,0.08)'
                      }}>
                        <CheckCircle2 size={15} /> Consultation Completed
                      </div>
                    )}

                    {!isConsultDone && consultStart && (
                      <div style={{
                        width: '100%',
                        padding: '8px',
                        background: '#f0fdfa',
                        border: '1.5px solid #99f6e4',
                        color: '#0d9488',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(13,148,136,0.08)'
                      }}>
                        <Activity size={15} /> In Consultation
                      </div>
                    )}

                    {/* Always display Start Consultation button (for initial consultation or review after investigation) */}
                    <button
                      onClick={() => {
                        const patientUhid = sp.patient?.uhid || sp.uhid;
                        const startTime = new Date().toISOString();
                        if (patientUhid) {
                          setConsultationStartTimes(prev => ({ ...prev, [patientUhid]: startTime }));
                        }
                        handleStartConsultationAPI(startTime, sp);
                        toast.success(isConsultDone ? "Consultation started for investigation review." : "Consultation started successfully.");
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Start Consultation
                    </button>

                    {/* Visit Timeline */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '12px' }}>
                        Visit Timeline
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Billed', time: billedTime, done: true, color: '#16a34a' },
                          { label: 'Vitals taken', time: vitalsTime || 'Pending', done: !!vitalsTime, color: vitalsTime ? '#16a34a' : '#f59e0b' },
                          {
                            label: 'Consultation',
                            time: consultTime || (sp.consultation_time ? new Date(sp.consultation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ((sp.is_consultation_completed || sp.consultation_status === 'Completed') ? 'Completed' : 'Pending')),
                            done: !!consultTime || sp.is_consultation_completed || sp.consultation_status === 'Completed',
                            color: (consultTime || sp.is_consultation_completed || sp.consultation_status === 'Completed') ? '#16a34a' : '#f97316'
                          },
                        ].map(({ label, time, done, color }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '4px', flexShrink: 0, boxShadow: `0 0 4px ${color}80` }} />
                            <div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
                              <div style={{ fontSize: '0.82rem', color: done ? '#0f172a' : '#d97706', fontWeight: 700 }}>{time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Wait */}
                    <div style={{
                      marginTop: '16px',
                      background: waitMins > 60 ? '#fef2f2' : '#f0fdfa',
                      border: `1px solid ${waitMins > 60 ? '#fee2e2' : '#ccfbf1'}`,
                      borderRadius: '10px',
                      padding: '9px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Wait</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: waitMins > 60 ? '#dc2626' : '#0d9488' }}>{waitText}</span>
                    </div>
                  </div>

                  {/* Past History in Sidebar */}
                  <div
                    onClick={() => setShowHistoryModal(true)}
                    style={{
                      marginTop: '18px',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f0fdfa';
                      e.currentTarget.style.borderColor = '#0d9488';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={15} color="#0d9488" />
                      Past History
                    </span>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      background: '#f0fdfa',
                      border: '1px solid #ccfbf1',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {pastHistory.length}
                    </span>
                  </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                  {/* Lock Shield when consultation has not been started (Button is ONLY on sidebar) */}
                  {!isConsultationStarted && (
                    <div
                      onClick={() => {
                        toast.info("Please click 'Start Consultation' on the left sidebar to unlock and edit fields.");
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        background: 'rgba(248, 250, 252, 0.65)',
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        cursor: 'not-allowed',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: '20px'
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Please click 'Start Consultation' on the left sidebar to unlock and edit fields.");
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #ccfbf1',
                          borderRadius: '12px',
                          padding: '10px 22px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 18px rgba(13, 148, 136, 0.12)',
                          color: '#0f766e',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'not-allowed'
                        }}
                      >
                        <Lock size={16} color="#0d9488" />
                        <span>Consultation Locked — Click <strong>&quot;Start Consultation&quot;</strong> on the left sidebar to edit fields</span>
                      </div>
                    </div>
                  )}
                  {/* Tab bar */}
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', padding: '0 24px', gap: '0' }}>
                    {[
                      { key: 'vitals', label: 'Vitals & Exam' },
                      { key: 'clinical', label: 'Clinical Assessment' },
                      { key: 'diagnostics', label: 'Diagnosis' },
                      { key: 'plan', label: 'Plan & Prescriptions' },
                    ].map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '14px 20px', background: 'none', border: 'none', borderBottom: activeTab === t.key ? '2px solid #0d9488' : '2px solid transparent', color: activeTab === t.key ? '#0d9488' : '#64748b', fontWeight: activeTab === t.key ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px' }}>
                        {t.label}
                      </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    {/* Status & Past History shortcut */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {selectedPatient.consultation && (
                        <span style={{ fontSize: '0.78rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Your Saved Consultation
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedPatient) {
                            toast.warning("Please select a patient first.");
                            return;
                          }
                          setShowPrintModal(true);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #0d9488',
                          color: '#0d9488',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 2px rgba(13, 148, 136, 0.08)',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#0f766e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#0d9488'; }}
                        title="Print Summary / View PDF of today's consultation"
                      >
                        <Printer size={14} color="#0d9488" /> Print Summary
                      </button>
                      {pastHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowHistoryModal(true)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#0d9488',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#0d9488'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                          <FileText size={14} /> Past History ({pastHistory.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab content area */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {activeTab === 'clinical' && (
                      <TabContent>
                        <Card>
                          <CardTitle><AlertCircle size={20} /> Allergies</CardTitle>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '12px', marginBottom: allergyOption === 'if_any' ? '12px' : '4px', flexWrap: 'wrap' }}>
                            <CheckboxLabel style={{ fontWeight: allergyOption === 'no_known' ? '600' : 'normal', color: allergyOption === 'no_known' ? '#0f766e' : '#334155' }}>
                              <input
                                type="checkbox"
                                checked={allergyOption === 'no_known'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAllergyOption('no_known');
                                    setAllergies('NO Known Allergies');
                                  } else {
                                    setAllergyOption('');
                                    setAllergies('');
                                  }
                                }}
                              />
                              NO Known Allergies
                            </CheckboxLabel>

                            <CheckboxLabel style={{ fontWeight: allergyOption === 'if_any' ? '600' : 'normal', color: allergyOption === 'if_any' ? '#0f766e' : '#334155' }}>
                              <input
                                type="checkbox"
                                checked={allergyOption === 'if_any'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAllergyOption('if_any');
                                    if (allergies.trim().toUpperCase() === 'NO KNOWN ALLERGIES') {
                                      setAllergies('');
                                    }
                                  } else {
                                    setAllergyOption('');
                                    setAllergies('');
                                  }
                                }}
                              />
                              If any
                            </CheckboxLabel>
                          </div>

                          {allergyOption === 'if_any' && (
                            <TextArea
                              placeholder="Enter allergy details (e.g. Drug allergies, Food allergies, etc.)..."
                              value={allergies}
                              onChange={(e) => setAllergies(e.target.value)}
                              style={{ minHeight: '60px', marginTop: '6px' }}
                              autoFocus
                            />
                          )}
                        </Card>

                        <Card>
                          <CardTitle><FileText size={20} /> Chief Complaints</CardTitle>
                          <TextArea placeholder="Enter chief complaints..." value={chiefComplaints} onChange={e => setChiefComplaints(e.target.value)} style={{ minHeight: '80px' }} />
                        </Card>

                        <Card>
                          <CardTitle><FileText size={20} /> Past History</CardTitle>
                          <CheckboxGrid>
                            {['HTN', 'CAD', 'DM', 'PTB', 'COPD', 'APD', 'THYROID DISEASE', 'JAUNDICE', 'SURGICAL ILLNESS', 'SEIZURE DISORDERS'].map(item => (
                              <CheckboxLabel key={item}>
                                <input type="checkbox" checked={clinicalPastHistory.includes(item)} onChange={() => handleTogglePastHistory(item)} />
                                {item}
                              </CheckboxLabel>
                            ))}
                            <CheckboxLabel style={{ gridColumn: '1 / -1' }}>
                              <input type="checkbox" checked={clinicalPastHistory.some(h => typeof h === 'string' && h.startsWith('OTHERS:'))} onChange={(e) => {
                                if (e.target.checked) setClinicalPastHistory([...clinicalPastHistory, 'OTHERS: ']);
                                else setClinicalPastHistory(clinicalPastHistory.filter(h => typeof h !== 'string' || !h.startsWith('OTHERS:')));
                              }} />
                              OTHERS
                              <input type="text" style={{ marginLeft: '8px', borderBottom: '1px solid #cbd5e1', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }} placeholder="Specify"
                                value={clinicalPastHistory.find(h => typeof h === 'string' && h.startsWith('OTHERS:'))?.replace('OTHERS: ', '') || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClinicalPastHistory(prev => {
                                    const filtered = prev.filter(h => typeof h !== 'string' || !h.startsWith('OTHERS:'));
                                    return val ? [...filtered, `OTHERS: ${val}`] : filtered;
                                  });
                                }}
                              />
                            </CheckboxLabel>
                          </CheckboxGrid>
                        </Card>

                        <Card>
                          <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Activity size={20} /> Present Medications
                            </span>
                            {presentMedicationFiles.length > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                {presentMedicationFiles.length} file{presentMedicationFiles.length > 1 ? 's' : ''} attached
                              </span>
                            )}
                          </CardTitle>
                          <TextArea
                            placeholder="Enter present medications notes, ongoing prescriptions, dosages..."
                            value={presentMedications}
                            onChange={e => setPresentMedications(e.target.value)}
                            style={{ minHeight: '80px', marginBottom: '12px' }}
                          />

                          {/* File Upload Action Bar */}
                          <div style={{
                            border: '1.5px dashed #cbd5e1',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: '#e0f2fe',
                                color: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Upload size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                                  Upload Prescription / Medicine Files
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Attach photos of old medicine strips, prescription slips, or bills (Images or PDF)
                                </div>
                              </div>
                            </div>

                            <div>
                              <input
                                type="file"
                                ref={medFileInputRef}
                                multiple
                                accept="image/*,application/pdf"
                                style={{ display: 'none' }}
                                onChange={handleMedicationsFileUpload}
                              />
                              <button
                                type="button"
                                disabled={uploadingMedFiles}
                                onClick={() => medFileInputRef.current && medFileInputRef.current.click()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  background: uploadingMedFiles ? '#94a3b8' : '#0d9488',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: uploadingMedFiles ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                              >
                                {uploadingMedFiles ? (
                                  <>
                                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload Files
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Uploaded Medication Files Gallery & Previews */}
                          {presentMedicationFiles.length > 0 && (
                            <div style={{ marginTop: '14px' }}>
                              <div style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <span>Attached Prescriptions &amp; Strips ({presentMedicationFiles.length})</span>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, textTransform: 'none' }}>
                                  Click any image thumbnail to preview full size
                                </span>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '12px'
                              }}>
                                {presentMedicationFiles.map((fileItem, idx) => {
                                  const norm = normalizeMedicationFile(fileItem) || fileItem;
                                  const isImg = norm.isImg || (norm.file_type || '').startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i.test(norm.file_name);
                                  const isPdf = norm.isPdf || norm.file_type === 'application/pdf' || (norm.file_name || '').toLowerCase().endsWith('.pdf');
                                  const viewUrl = norm.url || (norm.file_id ? `${Hmsbaseurl}OPEMR_get_vital_file/${norm.file_id}/` : '');
                                  const formattedSize = norm.file_size ? (norm.file_size > 1024 * 1024 ? `${(norm.file_size / (1024 * 1024)).toFixed(1)} MB` : `${(norm.file_size / 1024).toFixed(1)} KB`) : 'Attached Document';

                                  return (
                                    <div
                                      key={norm.file_id || idx}
                                      style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      {/* Top Row: Thumbnail + Details */}
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        {/* Visual Thumbnail */}
                                        <div
                                          onClick={() => {
                                            if (isImg && viewUrl) {
                                              setPreviewModalFile({ ...norm, url: viewUrl });
                                            } else if (viewUrl) {
                                              window.open(viewUrl, '_blank');
                                            }
                                          }}
                                          title={isImg ? "Click to enlarge photo" : "Click to view file"}
                                          style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '8px',
                                            background: isImg ? '#f8fafc' : isPdf ? '#fef2f2' : '#f1f5f9',
                                            border: `1.5px solid ${isImg ? '#0d9488' : isPdf ? '#ef4444' : '#cbd5e1'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            cursor: viewUrl ? 'pointer' : 'default',
                                            flexShrink: 0,
                                            position: 'relative'
                                          }}
                                        >
                                          {isImg && viewUrl ? (
                                            <img
                                              src={viewUrl}
                                              alt={norm.file_name}
                                              style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                              }}
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.innerHTML = '<span style="font-size:10px;color:#0d9488;font-weight:700">IMAGE</span>';
                                              }}
                                            />
                                          ) : isPdf ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                              <FileText size={22} color="#dc2626" />
                                              <span style={{ fontSize: '8px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>PDF</span>
                                            </div>
                                          ) : (
                                            <File size={22} color="#64748b" />
                                          )}
                                        </div>

                                        {/* Name & Metadata */}
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                                          <div
                                            style={{
                                              fontSize: '0.825rem',
                                              fontWeight: 600,
                                              color: '#0f172a',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              marginBottom: '3px'
                                            }}
                                            title={norm.file_name}
                                          >
                                            {norm.file_name}
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{
                                              fontSize: '0.68rem',
                                              fontWeight: 700,
                                              padding: '1px 6px',
                                              borderRadius: '4px',
                                              background: isImg ? '#f0fdfa' : isPdf ? '#fef2f2' : '#f1f5f9',
                                              color: isImg ? '#0d9488' : isPdf ? '#dc2626' : '#64748b',
                                              border: `1px solid ${isImg ? '#99f6e4' : isPdf ? '#fecaca' : '#e2e8f0'}`
                                            }}>
                                              {isImg ? 'IMAGE' : isPdf ? 'PDF' : 'DOC'}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                                              {formattedSize}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Bottom Row: Action Buttons */}
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '8px',
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: '8px'
                                      }}>
                                        {viewUrl && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (isImg) {
                                                setPreviewModalFile({ ...norm, url: viewUrl });
                                              } else {
                                                window.open(viewUrl, '_blank');
                                              }
                                            }}
                                            style={{
                                              padding: '5px 10px',
                                              borderRadius: '6px',
                                              background: '#f0fdfa',
                                              color: '#0d9488',
                                              border: '1px solid #99f6e4',
                                              fontSize: '0.75rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              transition: 'all 0.15s ease'
                                            }}
                                          >
                                            <Eye size={12} /> Preview
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMedicationFile(idx)}
                                          title="Delete this uploaded file"
                                          style={{
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            border: '1px solid #fecaca',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.15s ease'
                                          }}
                                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                        >
                                          <Trash2 size={12} /> Delete
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </Card>

                        {/* 1. Social History */}
                        <Card>
                          <CardTitle><Users size={20} /> Social History</CardTitle>
                          <CheckboxGrid>
                            {['Smoking', 'Tobacco', 'Alcohol', 'Drug Abuse'].map(item => (
                              <CheckboxLabel key={item}>
                                <input
                                  type="checkbox"
                                  checked={socialHistory.includes(item)}
                                  onChange={() => handleToggleSocialHistory(item)}
                                />
                                {item}
                              </CheckboxLabel>
                            ))}
                            <CheckboxLabel style={{ gridColumn: '1 / -1' }}>
                              <input
                                type="checkbox"
                                checked={socialHistory.some(h => typeof h === 'string' && h.startsWith('OTHERS:'))}
                                onChange={(e) => {
                                  if (e.target.checked) setSocialHistory([...socialHistory, 'OTHERS: ']);
                                  else setSocialHistory(socialHistory.filter(h => typeof h !== 'string' || !h.startsWith('OTHERS:')));
                                }}
                              />
                              OTHERS
                              <input
                                type="text"
                                style={{ marginLeft: '8px', borderBottom: '1px solid #cbd5e1', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', flex: 1, padding: '2px 6px' }}
                                placeholder="Specify other habits"
                                value={socialHistory.find(h => typeof h === 'string' && h.startsWith('OTHERS:'))?.replace('OTHERS: ', '') || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSocialHistory(prev => {
                                    const filtered = prev.filter(h => typeof h !== 'string' || !h.startsWith('OTHERS:'));
                                    return val ? [...filtered, `OTHERS: ${val}`] : filtered;
                                  });
                                }}
                              />
                            </CheckboxLabel>
                          </CheckboxGrid>
                          <TextArea
                            placeholder="Additional social history notes (e.g. quantity/day, duration, cessation)..."
                            value={socialHistoryNotes}
                            onChange={e => setSocialHistoryNotes(e.target.value)}
                            style={{ minHeight: '60px', marginTop: '12px' }}
                          />
                        </Card>

                        {/* 2. Menstrual History (Displayed if female patient) */}
                        {isFemale && (
                          <Card>
                            <CardTitle><Heart size={20} /> Menstrual History</CardTitle>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                                <input
                                  type="radio"
                                  name="menstrualStatus"
                                  value="Normal"
                                  checked={menstrualStatus === 'Normal'}
                                  onChange={() => setMenstrualStatus('Normal')}
                                  style={{ accentColor: '#0d9488', width: '17px', height: '17px', cursor: 'pointer' }}
                                />
                                Normal
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                                <input
                                  type="radio"
                                  name="menstrualStatus"
                                  value="Abnormal"
                                  checked={menstrualStatus === 'Abnormal'}
                                  onChange={() => setMenstrualStatus('Abnormal')}
                                  style={{ accentColor: '#ef4444', width: '17px', height: '17px', cursor: 'pointer' }}
                                />
                                Abnormal
                              </label>
                              {menstrualStatus && (
                                <button
                                  type="button"
                                  onClick={() => { setMenstrualStatus(''); setMenstrualSpecify(''); }}
                                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            {menstrualStatus === 'Abnormal' && (
                              <div style={{ marginTop: '14px' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
                                  Specify Abnormal Details:
                                </div>
                                <TextArea
                                  placeholder="Specify abnormal menstrual details (e.g. irregular cycles, menorrhagia, dysmenorrhea, LMP, cycle length, flow)..."
                                  value={menstrualSpecify}
                                  onChange={e => setMenstrualSpecify(e.target.value)}
                                  style={{ minHeight: '65px', borderColor: '#fca5a5' }}
                                />
                              </div>
                            )}
                          </Card>
                        )}

                        {/* 3. Vaccination History */}
                        <Card>
                          <CardTitle><FileText size={20} /> Vaccination History</CardTitle>
                          <TextArea
                            placeholder="Enter vaccination history (e.g. COVID-19, Hepatitis B, Tetanus/TT, Influenza, etc.)..."
                            value={vaccinationHistory}
                            onChange={e => setVaccinationHistory(e.target.value)}
                            style={{ minHeight: '70px' }}
                          />
                        </Card>

                        {/* 4. Obstetrics History */}
                        <Card>
                          <CardTitle>
                            <Activity size={20} /> Obstetrics History {isFemale ? '' : <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Applicable for Female Patients)</span>}
                          </CardTitle>
                          <TextArea
                            placeholder="Enter obstetrics history (e.g. Gravida, Para, Living children, Abortions, past delivery mode, complications, etc.)..."
                            value={obstetricsHistory}
                            onChange={e => setObstetricsHistory(e.target.value)}
                            style={{ minHeight: '70px' }}
                          />
                        </Card>

                        {/* 5. Investigation done if any */}
                        <Card>
                          <CardTitle><FileText size={20} /> Investigation Done (If any)</CardTitle>
                          <TextArea
                            placeholder="Enter details of previous/prior investigations done (e.g. Blood investigations, X-Ray, USG, CT, MRI, ECG, Biopsy, etc.)..."
                            value={investigationDone}
                            onChange={e => setInvestigationDone(e.target.value)}
                            style={{ minHeight: '70px' }}
                          />
                        </Card>

                        {/* 6. Physical Examination */}
                        <Card>
                          <CardTitle><Stethoscope size={20} /> Physical Examination</CardTitle>
                          <TextArea
                            placeholder="Enter physical examination details (General examination: Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema; Systemic examination: CVS, RS, P/A, CNS, Local examination)..."
                            value={physicalExamination}
                            onChange={e => setPhysicalExamination(e.target.value)}
                            style={{ minHeight: '80px' }}
                          />
                        </Card>

                        {/* 7. Provisional Diagnosis */}
                        <Card>
                          <CardTitle><FileText size={20} /> Provisional Diagnosis</CardTitle>
                          <TextArea
                            placeholder="Enter provisional / working diagnosis..."
                            value={provisionalDiagnosis}
                            onChange={e => setProvisionalDiagnosis(e.target.value)}
                            style={{ minHeight: '70px' }}
                          />
                        </Card>

                        {/* 8. Plan of Care (Bullet Point List) */}
                        <Card>
                          <CardTitle><List size={20} /> Plan of Care</CardTitle>

                          {/* Bullet points display list */}
                          {planOfCarePoints.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              marginTop: '12px',
                              marginBottom: '14px'
                            }}>
                              {planOfCarePoints.map((point, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#f0fdfa';
                                    e.currentTarget.style.borderColor = '#ccfbf1';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  {/* Bullet Dot */}
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#0d9488',
                                    flexShrink: 0,
                                    boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.15)'
                                  }} />

                                  {/* Point text */}
                                  <div style={{
                                    flex: 1,
                                    fontSize: '0.9rem',
                                    color: '#1e293b',
                                    fontWeight: 500,
                                    lineHeight: 1.4,
                                    wordBreak: 'break-word'
                                  }}>
                                    {point}
                                  </div>

                                  {/* Remove point button */}
                                  <button
                                    type="button"
                                    title="Remove point"
                                    onClick={() => handleRemovePlanPoint(idx)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#94a3b8',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.color = '#ef4444';
                                      e.currentTarget.style.background = '#fee2e2';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.color = '#94a3b8';
                                      e.currentTarget.style.background = 'none';
                                    }}
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Input to type and add bullet point */}
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            marginTop: planOfCarePoints.length > 0 ? '4px' : '10px'
                          }}>
                            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                position: 'absolute',
                                left: '14px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#0d9488',
                                pointerEvents: 'none'
                              }} />
                              <input
                                type="text"
                                placeholder="Type a plan of care point and press Enter..."
                                value={newPlanPoint}
                                onChange={e => setNewPlanPoint(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddPlanPoint();
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px 10px 32px',
                                  border: '1.5px solid #cbd5e1',
                                  borderRadius: '10px',
                                  fontSize: '0.88rem',
                                  color: '#1e293b',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                  transition: 'all 0.15s ease'
                                }}
                                onFocus={e => {
                                  e.currentTarget.style.borderColor = '#0d9488';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.12)';
                                }}
                                onBlur={e => {
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleAddPlanPoint}
                              disabled={!newPlanPoint.trim()}
                              style={{
                                padding: '10px 18px',
                                background: newPlanPoint.trim() ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#e2e8f0',
                                color: newPlanPoint.trim() ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: newPlanPoint.trim() ? 'pointer' : 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0,
                                boxShadow: newPlanPoint.trim() ? '0 2px 8px rgba(13, 148, 136, 0.25)' : 'none',
                                transition: 'all 0.18s ease'
                              }}
                            >
                              <Plus size={16} /> Add Point
                            </button>
                          </div>

                          {planOfCarePoints.length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
                              Type a care instruction and press Enter or click "+ Add Point" to create bulleted care points.
                            </div>
                          )}
                        </Card>
                      </TabContent>
                    )}

                    {activeTab === 'vitals' && (
                      <TabContent>
                        {/* 1. Vital Entry Display */}
                        <div style={{ marginTop: '16px' }}>
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

                                <VitalItem $iconColor="#f43f5e">
                                  <div className="header">
                                    <Activity size={16} /> Pain Score
                                  </div>
                                  <div className="value">
                                    {vitals.pain_score != null ? vitals.pain_score : '--'} <span className="unit">/ 10</span>
                                  </div>
                                </VitalItem>
                              </VitalsGrid>

                              <VitalDateBadge>
                                <Clock size={16} /> Vital Recorded Date: {vitals.vital_entry_date ? new Date(vitals.vital_entry_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : 'N/A'}
                              </VitalDateBadge>

                              {/* Attached Old Hospital Documents & Files */}
                              {vitals.attachments && Array.isArray(vitals.attachments) && vitals.attachments.length > 0 && (
                                <div style={{ marginTop: '20px', background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <FileText size={18} color="#0d9488" /> Old Hospital Records & Patient Documents ({vitals.attachments.length})
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                      Uploaded by: {vitals.created_by_name || vitals.created_by || 'Staff'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                                    {vitals.attachments.map((att, attIdx) => {
                                      const isImg = (att.file_type || '').startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(att.file_name);
                                      const isPdf = att.file_type === 'application/pdf' || (att.file_name || '').toLowerCase().endsWith('.pdf');
                                      const fileUrl = att.url || (att.file_id ? `${Hmsbaseurl}OPEMR_get_vital_file/${att.file_id}/` : '');

                                      return (
                                        <div
                                          key={attIdx}
                                          style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '10px'
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                                              {isImg ? <ImageIcon size={16} color="#0d9488" /> : isPdf ? <FileText size={16} color="#dc2626" /> : <File size={16} color="#64748b" />}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={att.file_name}>
                                                {att.file_name}
                                              </span>
                                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                {att.category || 'Document'}{att.title ? ` • ${att.title}` : ''}
                                              </span>
                                            </div>
                                          </div>
                                          {fileUrl && (
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                background: '#f0fdfa',
                                                color: '#0d9488',
                                                border: '1px solid #99f6e4',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                flexShrink: 0
                                              }}
                                            >
                                              <Eye size={12} /> View
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                              No vitals recorded for this visit yet.
                            </div>
                          )}
                        </div>
                      </TabContent>
                    )}

                    {activeTab === 'diagnostics' && (
                      <TabContent>
                        {/* 2. Diagnostics Dropdown (HMS_Symptoms_list) */}
                        <Card>
                          <CardTitle>
                            <Stethoscope size={20} />Symptoms
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select symptoms..."
                              options={symptomOptions}
                              value={selectedSymptomOptions}
                              onChange={(selected) => {
                                const newVals = selected ? selected.map(s => s.value) : [];
                                const otherItem = selectedSymptoms.find(s => s === 'OTHERS' || (typeof s === 'string' && s.startsWith('OTHERS:')));
                                setSelectedSymptoms(otherItem ? [...newVals, otherItem] : newVals);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>

                          {/* Others Option for Symptoms / Diagnosis */}
                          <div style={{ marginTop: '14px' }}>
                            <CheckboxLabel style={{ fontWeight: selectedSymptoms.some(s => s === 'OTHERS' || (typeof s === 'string' && s.startsWith('OTHERS:'))) ? 600 : 500, color: selectedSymptoms.some(s => s === 'OTHERS' || (typeof s === 'string' && s.startsWith('OTHERS:'))) ? '#0f766e' : '#334155' }}>
                              <input
                                type="checkbox"
                                checked={selectedSymptoms.some(s => s === 'OTHERS' || (typeof s === 'string' && s.startsWith('OTHERS:')))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSymptoms(prev => [...prev.filter(s => s !== 'OTHERS' && (typeof s !== 'string' || !s.startsWith('OTHERS:'))), 'OTHERS: ']);
                                  } else {
                                    setSelectedSymptoms(prev => prev.filter(s => s !== 'OTHERS' && (typeof s !== 'string' || !s.startsWith('OTHERS:'))));
                                  }
                                }}
                              />
                              Others
                            </CheckboxLabel>

                            {selectedSymptoms.some(s => s === 'OTHERS' || (typeof s === 'string' && s.startsWith('OTHERS:'))) && (
                              <div style={{ marginTop: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Specify other symptoms / diagnosis..."
                                  value={selectedSymptoms.find(s => typeof s === 'string' && s.startsWith('OTHERS:'))?.replace(/^OTHERS:\s*/, '') || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedSymptoms(prev => {
                                      const filtered = prev.filter(s => s !== 'OTHERS' && (typeof s !== 'string' || !s.startsWith('OTHERS:')));
                                      return [...filtered, `OTHERS: ${val}`];
                                    });
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1.5px solid #0d9488',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    color: '#1e293b',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.12)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* 3. Investigation Dropdown (Diagnostics_test_details) */}
                        <Card>
                          <CardTitle>
                            <FileText size={20} /> Investigation Tests
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select investigation tests (by name, shortcut, or department)..."
                              options={testOptions}
                              value={selectedTestOptions}
                              filterOption={(candidate, input) => {
                                if (!input) return true;
                                const q = input.toLowerCase().trim();
                                const label = (candidate.label || '').toLowerCase();
                                const shortcut = (candidate.data?.shortcut || '').toLowerCase();
                                const testName = (candidate.data?.test_name || '').toLowerCase();
                                const dept = (candidate.data?.department || '').toLowerCase();
                                return label.includes(q) || shortcut.includes(q) || testName.includes(q) || dept.includes(q);
                              }}
                              onChange={(selected) => {
                                setSelectedTestIds(selected ? selected.map(s => s.value) : []);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>
                        </Card>

                        {/* 4. CT Scan Dropdown */}
                        <Card>
                          <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Activity size={20} color="#0284c7" /> CT Scan
                            </span>
                            {selectedCtIds.length > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                {selectedCtIds.length} CT scan{selectedCtIds.length > 1 ? 's' : ''} selected
                              </span>
                            )}
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select CT scans (e.g. CT Brain Plain, CT Chest HRCT, CT Abdomen)..."
                              options={ctOptions}
                              value={selectedCtOptions}
                              filterOption={(candidate, input) => {
                                if (!input) return true;
                                const q = input.toLowerCase().trim();
                                const label = (candidate.label || '').toLowerCase();
                                return label.includes(q);
                              }}
                              onChange={(selected) => {
                                setSelectedCtIds(selected ? selected.map(s => s.value) : []);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>
                        </Card>

                        {/* 5. MRI Scan Dropdown */}
                        <Card>
                          <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Activity size={20} color="#7c3aed" /> MRI Scan
                            </span>
                            {selectedMriIds.length > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                {selectedMriIds.length} MRI scan{selectedMriIds.length > 1 ? 's' : ''} selected
                              </span>
                            )}
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select MRI scans (e.g. MRI Brain Plain, MRI Lumbar Spine, MRI Knee)..."
                              options={mriOptions}
                              value={selectedMriOptions}
                              filterOption={(candidate, input) => {
                                if (!input) return true;
                                const q = input.toLowerCase().trim();
                                const label = (candidate.label || '').toLowerCase();
                                return label.includes(q);
                              }}
                              onChange={(selected) => {
                                setSelectedMriIds(selected ? selected.map(s => s.value) : []);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>
                        </Card>

                        {/* 6. X-Ray Dropdown */}
                        <Card>
                          <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={20} color="#ea580c" /> X-Ray
                            </span>
                            {selectedXrayIds.length > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                {selectedXrayIds.length} X-Ray{selectedXrayIds.length > 1 ? 's' : ''} selected
                              </span>
                            )}
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select X-Ray procedures (e.g. Chest X-Ray PA, X-Ray KUB, X-Ray Spine)..."
                              options={xrayOptions}
                              value={selectedXrayOptions}
                              filterOption={(candidate, input) => {
                                if (!input) return true;
                                const q = input.toLowerCase().trim();
                                const label = (candidate.label || '').toLowerCase();
                                return label.includes(q);
                              }}
                              onChange={(selected) => {
                                setSelectedXrayIds(selected ? selected.map(s => s.value) : []);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>
                        </Card>
                      </TabContent>
                    )}

                    {activeTab === 'plan' && (
                      <TabContent>
                        {/* 4. Prescription Dropdown (hospital_pharmacyitem) */}
                        <Card>
                          <CardTitle>
                            <Pill size={20} /> Prescription / Medicines (from hospital_pharmacyitem)
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isMulti
                              closeMenuOnSelect={false}
                              components={{ MenuList: CustomMenuList }}
                              placeholder="Search and select medicines..."
                              options={medicineOptions}
                              value={selectedMedicineOptions}
                              onChange={(selected) => {
                                setSelectedMedicineIds(selected ? selected.map(s => s.value) : []);
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>

                          {selectedMedicineIds.length > 0 && (
                            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                              <HistoryTable>
                                <thead>
                                  <tr>
                                    <th>Medication</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                    <th>Duration</th>
                                    <th>Total Dosage</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedMedicineIds.map(id => {
                                    const m = medicineList.find(x => x.item_id === id);
                                    const pd = prescriptionData[id] || {};
                                    return (
                                      <tr key={id}>
                                        <td style={{ fontWeight: 500 }}>{m ? m.item_name : `Item #${id}`}</td>
                                        <td>
                                          <input
                                            type="text"
                                            style={{ width: '90%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8125rem' }}
                                            value={pd.dosage || ''}
                                            onChange={e => handlePrescriptionChange(id, 'dosage', e.target.value)}
                                            placeholder="e.g. 500mg"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            style={{ width: '90%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8125rem' }}
                                            value={pd.frequency || ''}
                                            onChange={e => handlePrescriptionChange(id, 'frequency', e.target.value)}
                                            placeholder="e.g. 1-0-1"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            style={{ width: '90%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8125rem' }}
                                            value={pd.duration || ''}
                                            onChange={e => handlePrescriptionChange(id, 'duration', e.target.value)}
                                            placeholder="e.g. 5 days"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            style={{ width: '80%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8125rem' }}
                                            value={pd.total_dosage || ''}
                                            onChange={e => handlePrescriptionChange(id, 'total_dosage', e.target.value)}
                                            placeholder="e.g. 10"
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </HistoryTable>
                            </div>
                          )}
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

                        {/* Diet Instructions - Input Box */}
                        <Card>
                          <CardTitle>
                            <FileText size={20} /> Diet Instructions
                          </CardTitle>
                          <TextArea
                            placeholder="Enter diet recommendations for the patient..."
                            value={diet}
                            onChange={e => setDiet(e.target.value)}
                            style={{ minHeight: '80px' }}
                          />
                        </Card>

                        {/* Referral Doctor Dropdown */}
                        <Card>
                          <CardTitle>
                            <Activity size={20} /> Refer to Doctor
                          </CardTitle>
                          <div style={{ marginTop: '12px' }}>
                            <Select
                              isClearable
                              placeholder="Search and select a doctor..."
                              options={doctorOptions}
                              value={doctorOptions.find(d => d.value === referToDoctor) || null}
                              onChange={(selected) => {
                                setReferToDoctor(selected ? selected.value : "");
                              }}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    borderColor: '#cbd5e1'
                                  }
                                })
                              }}
                            />
                          </div>
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
                      </TabContent>
                    )}

                    <BottomActionBar style={{ justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid #f1f5f9', marginTop: 0, gap: '10px' }}>
                      <Button
                        $variant="secondary"
                        onClick={() => {
                          if (!selectedPatient) {
                            toast.warning("Please select a patient first.");
                            return;
                          }
                          setShowPrintModal(true);
                        }}
                        style={{ padding: '10px 18px', fontSize: '0.92rem' }}
                        title="Preview full consultation summary and print/save as PDF before saving"
                      >
                        <Printer size={17} color="#0d9488" />
                        Print Summary / View PDF
                      </Button>
                      <Button
                        $variant="primary"
                        onClick={handleSaveConsultation}
                        disabled={savingConsultation}
                        style={{ padding: '10px 24px', fontSize: '0.92rem' }}
                      >
                        <Save size={18} />
                        {savingConsultation ? "Saving..." : "Save Consultation"}
                      </Button>
                    </BottomActionBar>
                  </div>
                </div>
              </div>
            );
          })()}
        </Workspace>
      </MainGrid>

      {/* Past History Modal */}
      {showHistoryModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowHistoryModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95%' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📋</span> Patient Past History
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                  {selectedPatient.patient?.patient_name} • UHID: <strong style={{ color: '#0d9488' }}>{selectedPatient.patient?.uhid}</strong>
                </div>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowHistoryModal(false)} />
            </div>

            {/* Top Navigation Tabs: Consultations vs Lab Investigation Results */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setHistoryTab('consultations')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  background: historyTab === 'consultations' ? '#0d9488' : '#f1f5f9',
                  color: historyTab === 'consultations' ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: historyTab === 'consultations' ? '0 2px 8px rgba(13,148,136,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={16} /> Past Consultations ({pastHistory.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('labTests')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  background: historyTab === 'labTests' ? '#0d9488' : '#f1f5f9',
                  color: historyTab === 'labTests' ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: historyTab === 'labTests' ? '0 2px 8px rgba(13,148,136,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Activity size={16} /> Lab Investigation Results ({patientLabTests.length})
              </button>
            </div>

            {/* ── TAB 1: PAST CONSULTATIONS ── */}
            {historyTab === 'consultations' && (
              loadingHistory ? (
                <div style={{ padding: '36px', color: '#64748b', textAlign: 'center' }}>Loading past consultations...</div>
              ) : pastHistory.length === 0 ? (
                <div style={{ padding: '36px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  No prior consultation records found for this patient.
                </div>
              ) : (
                <HistorySplitLayout>
                  <HistorySidebar>
                    {pastHistory.map((item, idx) => {
                      const isActive = selectedHistoryItem?._id === item._id || selectedHistoryItem === item;
                      return (
                        <HistorySidebarCard
                          key={item._id || item.id || idx}
                          $active={isActive}
                          onClick={() => setSelectedHistoryItem(item)}
                          style={{
                            borderLeft: isActive ? '4px solid #0d9488' : undefined
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: isActive ? '#0d9488' : '#0f172a' }}>
                            UHID: {selectedPatient?.patient?.uhid || item.uhid || ''}
                          </div>
                          <div className="date-info" style={{ marginTop: '2px', fontSize: '0.76rem', color: '#64748b' }}>
                            {item.created_date ? new Date(item.created_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                          </div>
                        </HistorySidebarCard>
                      );
                    })}
                  </HistorySidebar>

                  <HistoryDetailPane>
                    {selectedHistoryItem ? (
                      <>
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <h3 style={{ color: '#0d9488', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                                Consultation Record
                              </h3>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                Recorded on: {selectedHistoryItem.created_date ? new Date(selectedHistoryItem.created_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent Consultation'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                color: '#334155',
                                border: '1px solid #e2e8f0'
                              }}>
                                {(() => {
                                  const raw = (selectedHistoryItem.doctor_name || '').trim();
                                  if (raw && raw.toLowerCase() !== 'doctor') {
                                    return raw.toLowerCase().startsWith('dr') ? raw : `Dr. ${raw}`;
                                  }
                                  const dId = selectedHistoryItem.doctor_id || selectedHistoryItem.created_by;
                                  if (dId) {
                                    return `Dr. (${dId})`;
                                  }
                                  return 'Consulting Doctor';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 1. Diagnosis Box */}
                        <div style={{ marginBottom: '22px' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Diagnosis</div>
                          <div style={{
                            background: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            borderRadius: '8px',
                            padding: '16px 20px',
                            minHeight: '60px',
                          }}>
                            {selectedHistoryItem.finding ? (
                              <ul style={{ margin: 0, paddingLeft: '18px', color: '#0f172a', fontSize: '0.92rem' }}>
                                <li>{selectedHistoryItem.finding}</li>
                              </ul>
                            ) : (
                              <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No diagnosis recorded.</div>
                            )}
                          </div>
                        </div>

                        {/* 2. Complaints Table */}
                        <div style={{ marginBottom: '22px' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Complaints</div>
                          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#0d9488', color: '#ffffff' }}>
                                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Complaints</th>
                                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Duration</th>
                                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Duration Unit</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr style={{ background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', color: '#334155' }}>{selectedHistoryItem.chief_complaints || 'N/A'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', color: '#334155' }}>N/A</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', color: '#334155' }}>N/A</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Present Medications & Attachments */}
                        {(selectedHistoryItem.present_medications || (Array.isArray(selectedHistoryItem.present_medications_attachments) && selectedHistoryItem.present_medications_attachments.length > 0)) && (
                          <div style={{ marginBottom: '22px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Activity size={16} color="#0d9488" /> Present Medications &amp; Attachments
                            </div>
                            {selectedHistoryItem.present_medications && (
                              <div style={{ fontSize: '0.88rem', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' }}>
                                {selectedHistoryItem.present_medications}
                              </div>
                            )}
                            {Array.isArray(selectedHistoryItem.present_medications_attachments) && selectedHistoryItem.present_medications_attachments.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                                {selectedHistoryItem.present_medications_attachments.map((att, attIdx) => {
                                  const isImg = (att.file_type || '').startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(att.file_name);
                                  const isPdf = att.file_type === 'application/pdf' || (att.file_name || '').toLowerCase().endsWith('.pdf');
                                  const fileUrl = att.url || (att.file_id ? `${Hmsbaseurl}OPEMR_get_vital_file/${att.file_id}/` : '');
                                  return (
                                    <div key={attIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                                          {isImg ? <ImageIcon size={14} color="#0d9488" /> : isPdf ? <FileText size={14} color="#dc2626" /> : <File size={14} color="#64748b" />}
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={att.file_name}>
                                          {att.file_name}
                                        </span>
                                      </div>
                                      {fileUrl && (
                                        <a href={fileUrl} target="_blank" rel="noreferrer" style={{ padding: '3px 8px', borderRadius: '4px', background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                                          <Eye size={11} /> View
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. Next Visit */}
                        <div style={{ marginBottom: '22px' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Next Visit:</div>
                          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                            {selectedHistoryItem.followup_date ? new Date(selectedHistoryItem.followup_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        {/* 4. Vitals Horizontal Row */}
                        <div style={{ marginBottom: '26px' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Vitals</div>
                          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {selectedHistoryItem.vitals?.height || '--'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>height (cm)</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {selectedHistoryItem.vitals?.weight || '--'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>weight (kg)</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {selectedHistoryItem.vitals?.pulse_rate || '--'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>pulseRate</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {selectedHistoryItem.vitals?.bp || '--'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>bloodPressure</div>
                            </div>
                          </div>
                        </div>

                        {/* Investigations Ordered */}
                        <HistoryTableContainer>
                          <HistoryTableTitle><Activity size={18} /> Investigations Ordered</HistoryTableTitle>
                          <HistoryTable>
                            <thead>
                              <tr>
                                <th>Test Name</th>
                                <th>Department</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedHistoryItem.investigation_details?.length > 0 ? (
                                selectedHistoryItem.investigation_details.map(t => (
                                  <tr key={t.test_id}>
                                    <td>{t.test_name}</td>
                                    <td>{t.department || 'N/A'}</td>
                                    <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Ordered</span></td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No investigations ordered.</td>
                                </tr>
                              )}
                            </tbody>
                          </HistoryTable>
                        </HistoryTableContainer>

                        {/* Prescriptions */}
                        <HistoryTableContainer>
                          <HistoryTableTitle><Pill size={18} /> Prescriptions</HistoryTableTitle>
                          <HistoryTable>
                            <thead>
                              <tr>
                                <th>Medication</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Total Dosage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedHistoryItem.prescription_details?.length > 0 ? (
                                selectedHistoryItem.prescription_details.map(m => (
                                  <tr key={m.item_id}>
                                    <td style={{ fontWeight: 600 }}>{m.item_name}</td>
                                    <td>{m.dosage || 'N/A'}</td>
                                    <td>{m.frequency || 'N/A'}</td>
                                    <td>{m.duration || 'N/A'}</td>
                                    <td>{m.total_dosage || '0'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No prescriptions recorded.</td>
                                </tr>
                              )}
                            </tbody>
                          </HistoryTable>
                        </HistoryTableContainer>

                        <ThemeSectionBox>
                          <div className="title"><Calendar size={18} /> Plans &amp; Follow-up</div>
                          <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedHistoryItem.allergies && <li><span style={{ fontWeight: 600, color: '#475569' }}>Allergies:</span> {selectedHistoryItem.allergies}</li>}
                            {selectedHistoryItem.plan_of_care && (
                              <li>
                                <span style={{ fontWeight: 600, color: '#475569' }}>Plan of Care:</span>
                                {selectedHistoryItem.plan_of_care.includes('\n') ? (
                                  <ul style={{ paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {selectedHistoryItem.plan_of_care.split('\n').map((pt, pIdx) => (
                                      <li key={pIdx} style={{ listStyleType: 'disc' }}>
                                        {pt.replace(/^[•\s*-]+/, '').trim()}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  ` ${selectedHistoryItem.plan_of_care}`
                                )}
                              </li>
                            )}
                            {selectedHistoryItem.provisional_diagnosis && <li><span style={{ fontWeight: 600, color: '#475569' }}>Provisional Diagnosis:</span> {selectedHistoryItem.provisional_diagnosis}</li>}
                            {selectedHistoryItem.physical_examination && <li><span style={{ fontWeight: 600, color: '#475569' }}>Physical Exam:</span> {selectedHistoryItem.physical_examination}</li>}
                            {selectedHistoryItem.investigation_done && <li><span style={{ fontWeight: 600, color: '#475569' }}>Investigation Done:</span> {selectedHistoryItem.investigation_done}</li>}
                            {selectedHistoryItem.vaccination_history && <li><span style={{ fontWeight: 600, color: '#475569' }}>Vaccination:</span> {selectedHistoryItem.vaccination_history}</li>}
                            {selectedHistoryItem.obstetrics_history && <li><span style={{ fontWeight: 600, color: '#475569' }}>Obstetrics:</span> {selectedHistoryItem.obstetrics_history}</li>}
                            {isFemale && selectedHistoryItem.menstrual_history?.status && (
                              <li><span style={{ fontWeight: 600, color: '#475569' }}>Menstrual History:</span> {selectedHistoryItem.menstrual_history.status} {selectedHistoryItem.menstrual_history.specify ? `(${selectedHistoryItem.menstrual_history.specify})` : ''}</li>
                            )}
                            {Array.isArray(selectedHistoryItem.social_history) && selectedHistoryItem.social_history.length > 0 && (
                              <li><span style={{ fontWeight: 600, color: '#475569' }}>Social History:</span> {selectedHistoryItem.social_history.join(', ')}</li>
                            )}
                            {selectedHistoryItem.diet && <li><span style={{ fontWeight: 600, color: '#475569' }}>Diet:</span> {selectedHistoryItem.diet}</li>}
                            {selectedHistoryItem.refer_to_doctor && <li><span style={{ fontWeight: 600, color: '#475569' }}>Referred To:</span> Dr. {(referralDoctors.find(d => String(d.employeeId) === String(selectedHistoryItem.refer_to_doctor))?.employeeName) || selectedHistoryItem.refer_to_doctor}</li>}
                            {selectedHistoryItem.followup_date && <li><span style={{ fontWeight: 600, color: '#475569' }}>Follow-up Date:</span> {new Date(selectedHistoryItem.followup_date).toLocaleDateString()}</li>}
                            {(!selectedHistoryItem.diet && !selectedHistoryItem.refer_to_doctor && !selectedHistoryItem.followup_date && !selectedHistoryItem.plan_of_care) && <li style={{ color: '#94a3b8' }}>No follow-up plans recorded.</li>}
                          </ul>
                        </ThemeSectionBox>
                      </>
                    ) : (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        Select a consultation from the left to view details.
                      </div>
                    )}
                  </HistoryDetailPane>
                </HistorySplitLayout>
              )
            )}

            {/* ── TAB 2: DIAGNOSTIC & LAB TEST DETAILS (from core_testvalue) ── */}
            {historyTab === 'labTests' && (
              <div>
                {/* Search Bar & Filter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search test name or department..."
                      value={labSearch}
                      onChange={e => setLabSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Showing <strong>{
                      patientLabTests.filter(t => !labSearch || (t.testname || '').toLowerCase().includes(labSearch.toLowerCase()) || (t.department || '').toLowerCase().includes(labSearch.toLowerCase())).length
                    }</strong> of {patientLabTests.length} tests from Lab (core_testvalue)
                  </div>
                </div>

                {loadingLabTests ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    <Activity size={24} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
                    <div style={{ marginTop: '8px' }}>Fetching lab investigation results...</div>
                  </div>
                ) : patientLabTests.length === 0 ? (
                  <div style={{ padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧪</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>No Lab Test Results Found</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                      No diagnostic records found in core_testvalue matching UHID <strong>{selectedPatient.patient?.uhid}</strong>.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                    {patientLabTests
                      .filter(t => !labSearch || (t.testname || '').toLowerCase().includes(labSearch.toLowerCase()) || (t.department || '').toLowerCase().includes(labSearch.toLowerCase()))
                      .map((test, tIdx) => {
                        const isApproved = test.is_approved;
                        return (
                          <div
                            key={test.test_id ? `${test.test_id}-${tIdx}` : tIdx}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* Card Top Header */}
                            <div style={{
                              background: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              padding: '12px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#f0fdfa',
                                  color: '#0d9488',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800
                                }}>
                                  🔬
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                                    {test.testname}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '0.74rem', color: '#64748b' }}>
                                    <span>Dept: <strong style={{ color: '#334155' }}>{test.department || 'General'}</strong></span>
                                    {test.specimen_type && <span>• Specimen: <strong>{test.specimen_type}</strong></span>}
                                    {test.barcode && <span>• Barcode: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>{test.barcode}</code></span>}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {isApproved ? (
                                  <span style={{
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    border: '1px solid #bbf7d0',
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <CheckCircle2 size={12} /> Approved
                                  </span>
                                ) : (
                                  <span style={{
                                    background: '#fffbeb',
                                    color: '#d97706',
                                    border: '1px solid #fde68a',
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700
                                  }}>
                                    Pending
                                  </span>
                                )}
                                {test.approve_time && test.approve_time !== 'N/A' && (
                                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                    {test.approve_time}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Parameters Table (Same as discharge summary) */}
                            {Array.isArray(test.parameters) && test.parameters.length > 0 ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                      <th style={{ padding: '9px 16px', fontWeight: 600 }}>Parameter</th>
                                      <th style={{ padding: '9px 16px', fontWeight: 600 }}>Result Value</th>
                                      <th style={{ padding: '9px 16px', fontWeight: 600 }}>Unit</th>
                                      <th style={{ padding: '9px 16px', fontWeight: 600 }}>Reference Range</th>
                                      <th style={{ padding: '9px 16px', fontWeight: 600 }}>Method</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {test.parameters.map((p, pIdx) => (
                                      <tr
                                        key={pIdx}
                                        style={{
                                          borderBottom: '1px solid #f1f5f9',
                                          background: pIdx % 2 === 0 ? '#ffffff' : '#fcfdfe'
                                        }}
                                      >
                                        <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1e293b' }}>
                                          {p.name || p.test_name || p.test_code || `Parameter ${pIdx + 1}`}
                                        </td>
                                        <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0d9488', fontSize: '0.92rem' }}>
                                          {p.value !== undefined && p.value !== null && p.value !== '' ? String(p.value) : '—'}
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#64748b' }}>
                                          {p.unit || '—'}
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#475569', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                          {p.reference_range || p.referenceRange || '—'}
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '0.78rem' }}>
                                          {p.method || '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.84rem' }}>
                                No specific parameter breakdown recorded for this test.
                              </div>
                            )}

                            {/* Remarks / Comments Footer */}
                            {(test.comment || test.remarks || test.approve_by) && (
                              <div style={{
                                padding: '8px 18px',
                                background: '#fafcfc',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                fontSize: '0.76rem',
                                color: '#64748b'
                              }}>
                                <div>
                                  {test.comment && <span>Comment: <em>{test.comment}</em></span>}
                                  {test.remarks && <span style={{ marginLeft: test.comment ? '14px' : 0 }}>Remarks: <em>{test.remarks}</em></span>}
                                </div>
                                {test.approve_by && (
                                  <span>Verified &amp; Approved by: <strong>{test.approve_by}</strong></span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <Button $variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── PRINT SUMMARY / VIEW AS PDF MODAL (CURRENT CONSULTATION: TODAY'S SAVED & IN-PROGRESS DATA) ── */}
      {showPrintModal && selectedPatient && (() => {
        const pat = selectedPatient.patient || {};

        // 1. Identify today's consultation record (if already saved today)
        const isTodayDate = (dateVal) => {
          if (!dateVal) return false;
          let d = new Date(dateVal);
          if (isNaN(d.getTime())) {
            const parts = String(dateVal).trim().split(/[-/]/);
            if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
              d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
          if (isNaN(d.getTime())) return false;
          const now = new Date();
          return d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        };

        const todayConsult = (() => {
          if (selectedPatient?.consultation) {
            const cDateVal = selectedPatient.consultation.created_date ||
              selectedPatient.consultation.date ||
              selectedPatient.consultation.consultation_start_time ||
              selectedPatient.consultation.consultation_end_time;
            if (isTodayDate(cDateVal)) {
              return selectedPatient.consultation;
            }
          }
          if (Array.isArray(pastHistory) && pastHistory.length > 0) {
            const todayItem = pastHistory.find(h => {
              const cDateVal = h.created_date || h.date || h.consultation_start_time || h.consultation_end_time;
              return isTodayDate(cDateVal);
            });
            if (todayItem) {
              return todayItem;
            }
          }
          return null;
        })();

        const hasTodaySaved = !!todayConsult;
        const isCompleted = selectedPatient.is_consultation_completed ||
          selectedPatient.consultation_status === 'Completed' ||
          todayConsult?.status === 'Completed';

        const doctorName = pat.DoctorName || selectedPatient.doctor_name || (localStorage.getItem("employeeName") ? `Dr. ${localStorage.getItem("employeeName")}` : "Consulting Physician");

        const consultDate = todayConsult?.created_date && isTodayDate(todayConsult.created_date)
          ? new Date(todayConsult.created_date).toLocaleDateString('en-GB')
          : new Date().toLocaleDateString('en-GB');

        const consultTime = todayConsult?.created_date && isTodayDate(todayConsult.created_date)
          ? new Date(todayConsult.created_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        // Vitals: ONLY display vitals completed/recorded TODAY. Never show old vitals from previous visits.
        const isVitalToday = selectedPatient.vital_status === 'Completed' ||
          (selectedPatient.vital_entry && (isTodayDate(selectedPatient.vital_entry.created_date) || isTodayDate(selectedPatient.vital_entry.date))) ||
          (todayConsult?.vitals && (isTodayDate(todayConsult.vitals.created_date) || isTodayDate(todayConsult.created_date)));

        const pVitals = isVitalToday
          ? (selectedPatient.vital_entry && Object.keys(selectedPatient.vital_entry).length > 0 ? selectedPatient.vital_entry : (todayConsult?.vitals || {}))
          : (todayConsult?.vitals || {});

        const vHeight = pVitals.height ? `${pVitals.height} cm` : (todayConsult?.vitals?.height ? `${todayConsult.vitals.height} cm` : '--');
        const vWeight = pVitals.weight ? `${pVitals.weight} kg` : (todayConsult?.vitals?.weight ? `${todayConsult.vitals.weight} kg` : '--');
        const vBmi = pVitals.bmi || todayConsult?.vitals?.bmi || '--';
        const vBp = (pVitals.bp_systolic && pVitals.bp_diastolic)
          ? `${pVitals.bp_systolic}/${pVitals.bp_diastolic} mmHg`
          : (pVitals.bp || todayConsult?.vitals?.bp || (todayConsult?.vitals?.bp_systolic && todayConsult?.vitals?.bp_diastolic ? `${todayConsult.vitals.bp_systolic}/${todayConsult.vitals.bp_diastolic} mmHg` : '--'));
        const vPulse = pVitals.pulse_rate ? `${pVitals.pulse_rate} bpm` : (todayConsult?.vitals?.pulse_rate ? `${todayConsult.vitals.pulse_rate} bpm` : '--');
        const vTemp = (pVitals.temperature || pVitals.temp) ? `${pVitals.temperature || pVitals.temp} °F` : ((todayConsult?.vitals?.temperature || todayConsult?.vitals?.temp) ? `${todayConsult.vitals.temperature || todayConsult.vitals.temp} °F` : '--');
        const vSpo2 = pVitals.spo2 ? `${pVitals.spo2}%` : (todayConsult?.vitals?.spo2 ? `${todayConsult.vitals.spo2}%` : '--');
        const vRr = pVitals.respiratory_rate ? `${pVitals.respiratory_rate} /min` : (todayConsult?.vitals?.respiratory_rate ? `${todayConsult.vitals.respiratory_rate} /min` : '--');
        const vSugar = pVitals.blood_sugar ? `${pVitals.blood_sugar} mg/dL` : (todayConsult?.vitals?.blood_sugar ? `${todayConsult.vitals.blood_sugar} mg/dL` : '--');
        const vPain = (pVitals.pain_score !== undefined && pVitals.pain_score !== null && pVitals.pain_score !== '')
          ? `${pVitals.pain_score}/10`
          : ((todayConsult?.pain_score !== undefined && todayConsult?.pain_score !== null && todayConsult?.pain_score !== '') ? `${todayConsult.pain_score}/10` : '--');

        // Chief Complaints & Allergies
        const displayChiefComplaints = chiefComplaints.trim() || todayConsult?.chief_complaints || 'None reported';
        const displayAllergies = allergyOption === 'no_known'
          ? 'NO KNOWN ALLERGIES'
          : (allergies.trim() || todayConsult?.allergies || 'None recorded');

        // Diagnosis & Findings
        const displayProvisionalDiagnosis = provisionalDiagnosis.trim() || todayConsult?.provisional_diagnosis || 'None specified';
        const displayFindings = (finding || physicalExamination || '').trim() || todayConsult?.finding || todayConsult?.physical_examination || 'None recorded';
        const currentSymptoms = selectedSymptoms.length > 0
          ? selectedSymptoms
          : (Array.isArray(todayConsult?.symptoms) ? todayConsult.symptoms : []);

        // Medical History & Present Medications
        const currentPastHistory = clinicalPastHistory.length > 0
          ? clinicalPastHistory
          : (Array.isArray(todayConsult?.past_history) ? todayConsult.past_history : []);

        const currentSocialHistory = socialHistory.length > 0
          ? socialHistory
          : (Array.isArray(todayConsult?.social_history) ? todayConsult.social_history : []);

        const currentSocialNotes = socialHistoryNotes || todayConsult?.social_history_notes || '';
        const displayPresentMeds = presentMedications.trim() || todayConsult?.present_medications || 'None reported';
        const currentMedFiles = (Array.isArray(presentMedicationFiles) && presentMedicationFiles.length > 0)
          ? presentMedicationFiles
          : (Array.isArray(todayConsult?.present_medications_attachments) ? todayConsult.present_medications_attachments : []);

        const currentMenstrualStatus = menstrualStatus || todayConsult?.menstrual_history?.status || '';
        const currentMenstrualSpecify = menstrualSpecify || todayConsult?.menstrual_history?.specify || '';
        const currentObstetrics = obstetricsHistory || todayConsult?.obstetrics_history || '';

        // Ordered Diagnostic Tests (Lab)
        let currentTests = [];
        if (selectedTestIds.length > 0) {
          currentTests = selectedTestIds.map(id => {
            const t = testList.find(x => x.test_id === id);
            return t ? { id, name: t.test_name, dept: t.department || 'Diagnostics', mrp: t.MRP } : { id, name: `Test #${id}`, dept: 'Diagnostics', mrp: null };
          });
        } else if (Array.isArray(todayConsult?.investigation_details) && todayConsult.investigation_details.length > 0) {
          currentTests = todayConsult.investigation_details
            .filter(d => d.department !== 'CT' && d.department !== 'MRI' && d.department !== 'X-Ray')
            .map(d => ({ id: d.test_id || d.id, name: d.test_name || d.name, dept: d.department || 'Diagnostics', mrp: d.MRP }));
        } else if (Array.isArray(todayConsult?.investigation_test_ids) && todayConsult.investigation_test_ids.length > 0) {
          currentTests = todayConsult.investigation_test_ids.map(id => {
            const t = testList.find(x => x.test_id === id);
            return t ? { id, name: t.test_name, dept: t.department || 'Diagnostics', mrp: t.MRP } : { id, name: `Test #${id}`, dept: 'Diagnostics', mrp: null };
          });
        }

        // Radiology (CT, MRI, X-Ray)
        let currentCts = [];
        if (selectedCtIds.length > 0) {
          currentCts = selectedCtIds.map(id => {
            const found = ctList.find(x => x.id === id || x.item_id === id || x.name === id);
            return found ? found.name : id;
          });
        } else if (Array.isArray(todayConsult?.ct_scan_details) && todayConsult.ct_scan_details.length > 0) {
          currentCts = todayConsult.ct_scan_details.map(c => c.name || c.test_name || c.id);
        }

        let currentMris = [];
        if (selectedMriIds.length > 0) {
          currentMris = selectedMriIds.map(id => {
            const found = mriList.find(x => x.id === id || x.item_id === id || x.name === id);
            return found ? found.name : id;
          });
        } else if (Array.isArray(todayConsult?.mri_scan_details) && todayConsult.mri_scan_details.length > 0) {
          currentMris = todayConsult.mri_scan_details.map(m => m.name || m.test_name || m.id);
        }

        let currentXrays = [];
        if (selectedXrayIds.length > 0) {
          currentXrays = selectedXrayIds.map(id => {
            const found = xrayList.find(x => x.id === id || x.item_id === id || x.name === id);
            return found ? found.name : id;
          });
        } else if (Array.isArray(todayConsult?.xray_details) && todayConsult.xray_details.length > 0) {
          currentXrays = todayConsult.xray_details.map(x => x.name || x.test_name || x.id);
        }

        // Prescriptions (Rx Table)
        let currentPrescriptions = [];
        if (selectedMedicineIds.length > 0) {
          currentPrescriptions = selectedMedicineIds.map((id, idx) => {
            const m = medicineList.find(x => x.item_id === id);
            const pd = prescriptionData[id] || {};
            return {
              sn: idx + 1,
              name: m?.item_name || `Medicine #${id}`,
              dosage: pd.dosage || 'N/A',
              frequency: pd.frequency || 'N/A',
              duration: pd.duration ? (String(pd.duration).includes('Day') ? pd.duration : `${pd.duration} Days`) : 'N/A',
              total_dosage: pd.total_dosage || '0'
            };
          });
        } else if (Array.isArray(todayConsult?.prescription_details) && todayConsult.prescription_details.length > 0) {
          currentPrescriptions = todayConsult.prescription_details.map((rx, idx) => ({
            sn: idx + 1,
            name: rx.item_name || rx.medicine_name || `Medicine #${rx.item_id || idx + 1}`,
            dosage: rx.dosage || 'N/A',
            frequency: rx.frequency || 'N/A',
            duration: rx.duration ? (String(rx.duration).includes('Day') ? rx.duration : `${rx.duration} Days`) : 'N/A',
            total_dosage: rx.total_dosage || '0'
          }));
        } else if (Array.isArray(todayConsult?.prescription_item_ids) && todayConsult.prescription_item_ids.length > 0) {
          currentPrescriptions = todayConsult.prescription_item_ids.map((id, idx) => {
            const m = medicineList.find(x => x.item_id === id);
            return {
              sn: idx + 1,
              name: m?.item_name || `Medicine #${id}`,
              dosage: 'N/A',
              frequency: 'N/A',
              duration: 'N/A',
              total_dosage: '0'
            };
          });
        }

        // Plan of Care, Diet & Follow-up
        let currentPlanPoints = [];
        if (planOfCarePoints.length > 0) {
          currentPlanPoints = [...planOfCarePoints];
          if (newPlanPoint && newPlanPoint.trim() && !currentPlanPoints.includes(newPlanPoint.trim())) {
            currentPlanPoints.push(newPlanPoint.trim());
          }
        } else if (newPlanPoint && newPlanPoint.trim()) {
          currentPlanPoints = [newPlanPoint.trim()];
        } else if (planOfCare.trim()) {
          currentPlanPoints = planOfCare.split('\n').map(l => l.replace(/^[•\s*-]+/, '').trim()).filter(Boolean);
        } else if (todayConsult?.plan_of_care) {
          currentPlanPoints = todayConsult.plan_of_care.split('\n').map(l => l.replace(/^[•\s*-]+/, '').trim()).filter(Boolean);
        }

        const displayDiet = diet.trim() || todayConsult?.diet || 'Normal diet';
        const displayReferral = (() => {
          const docVal = referToDoctor || todayConsult?.refer_to_doctor || '';
          if (!docVal) return '';
          const match = referralDoctors.find(d => d.employeeId === docVal || d.employeeName === docVal);
          return match ? match.employeeName : docVal;
        })();
        const displayFollowup = followupDate || todayConsult?.followup_date || '';

        const opNumber = pat.billing_id || pat.op_number || selectedPatient.billing_id || '--';

        return (
          <ModalOverlay onClick={() => setShowPrintModal(false)} style={{ zIndex: 10001 }}>
            <ModalContent
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '960px',
                width: '95vw',
                maxHeight: '94vh',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                background: '#f1f5f9'
              }}
            >
              {/* Modal Top Header Bar */}
              <div style={{
                padding: '16px 24px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                borderBottom: '1px solid #1e293b'
              }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#14b8a6" />
                    <span>Outpatient Consultation Summary Preview</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Current Consultation Data (Today's Saved &amp; In-Progress Data) • Ready to Download as PDF or Print
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={downloadingPdf}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                      opacity: downloadingPdf ? 0.8 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { if (!downloadingPdf) e.currentTarget.style.background = '#0369a1'; }}
                    onMouseLeave={e => { if (!downloadingPdf) e.currentTarget.style.background = '#0284c7'; }}
                    title="Download consultation summary directly as a PDF file"
                  >
                    {downloadingPdf ? <SpinningLoader size={16} /> : <Download size={16} />}
                    {downloadingPdf ? 'Generating PDF...' : 'Download as PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSummary}
                    style={{
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(13,148,136,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
                    title="Open browser print dialog"
                  >
                    <Printer size={16} /> Print / Save as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    style={{
                      background: '#334155',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.background = '#334155'}
                  >
                    <X size={16} /> Close
                  </button>
                </div>
              </div>

              {/* Scrollable Document Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', background: '#f8fafc' }}>
                {/* Printable A4 Sheet Paper */}
                <div
                  ref={printSummaryRef}
                  style={{
                    maxWidth: '850px',
                    margin: '0 auto',
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    padding: '28px 32px',
                    color: '#0f172a',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '11px',
                    lineHeight: 1.4
                  }}
                >
                  {/* Hospital & Doctor Header */}
                  <div className="header-wrap" style={{ borderBottom: '2.5px solid #0d9488', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="hosp-name" style={{ fontSize: '20px', fontWeight: 900, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
                        SHANMUGA HOSPITAL
                      </div>
                      <div className="hosp-sub" style={{ fontSize: '9.5px', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
                        Multi-Speciality Healthcare Centre · Outpatient Care<br />
                        Phone: 0427-2345678 · Salem, Tamil Nadu
                      </div>
                    </div>
                    <div className="doc-info" style={{ textAlign: 'right' }}>
                      <div className="doc-name" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {doctorName}
                      </div>
                      <div className="doc-sub" style={{ fontSize: '9.5px', color: '#475569', marginTop: '2px' }}>
                        Date &amp; Time: <strong>{consultDate} {consultTime}</strong>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: hasTodaySaved ? '#16a34a' : '#0d9488', background: hasTodaySaved ? '#f0fdf4' : '#f0fdfa', border: `1px solid ${hasTodaySaved ? '#bbf7d0' : '#ccfbf1'}`, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {isCompleted ? "Today's Consultation (Completed)" : hasTodaySaved ? "Today's Consultation (Saved)" : "Current Consultation (Draft / Pre-Save)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Demographic Banner */}
                  <div className="patient-banner" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <div className="pb-item">
                      <span className="lbl" style={{ display: 'block', fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Patient Name</span>
                      <strong className="val" style={{ fontSize: '11.5px', color: '#0f172a' }}>{pat.patient_name || '--'}</strong>
                    </div>
                    <div className="pb-item">
                      <span className="lbl" style={{ display: 'block', fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>UHID / Bill No</span>
                      <strong className="val" style={{ fontSize: '11.5px', color: '#0d9488' }}>{pat.uhid || '--'} {opNumber !== '--' ? `(${opNumber})` : ''}</strong>
                    </div>
                    <div className="pb-item">
                      <span className="lbl" style={{ display: 'block', fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Age / Gender</span>
                      <strong className="val" style={{ fontSize: '11px', color: '#0f172a' }}>{pat.age ? `${pat.age} Yrs` : '--'} / {pat.gender || '--'}</strong>
                    </div>
                    <div className="pb-item">
                      <span className="lbl" style={{ display: 'block', fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact No</span>
                      <strong className="val" style={{ fontSize: '11px', color: '#0f172a' }}>{pat.mobilePhone || '--'}</strong>
                    </div>
                  </div>

                  {/* Vital Signs Grid */}
                  <div className="sec-card" style={{ marginBottom: '14px' }}>
                    <div className="sec-title" style={{ fontSize: '10.5px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1.5px solid #ccfbf1', paddingBottom: '3px', marginBottom: '6px' }}>
                      Vital Signs
                    </div>
                    <div className="vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '8px 10px' }}>
                      <div className="vital-cell" style={{ textAlign: 'center' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Height</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vHeight}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Weight</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vWeight}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>BMI</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vBmi}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Blood Pressure</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vBp}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pulse Rate</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vPulse}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center', marginTop: '4px' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Temperature</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vTemp}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center', marginTop: '4px' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>SpO2</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vSpo2}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center', marginTop: '4px' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Resp. Rate</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vRr}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center', marginTop: '4px' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Blood Sugar</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vSugar}</div>
                      </div>
                      <div className="vital-cell" style={{ textAlign: 'center', marginTop: '4px' }}>
                        <div className="vlbl" style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pain Score</div>
                        <div className="vval" style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>{vPain}</div>
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaints & Allergies */}
                  <div className="sec-card" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>Chief Complaints</div>
                      <div style={{ fontSize: '11px', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                        {displayChiefComplaints}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>Allergies</div>
                      <div>
                        {displayAllergies.toUpperCase().includes('NO KNOWN') ? (
                          <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                            ✓ {displayAllergies}
                          </span>
                        ) : displayAllergies !== 'None recorded' ? (
                          <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px' }}>
                            ⚠️ {displayAllergies}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>None recorded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis, Symptoms & Findings */}
                  <div className="sec-card" style={{ marginBottom: '14px' }}>
                    <div className="sec-title" style={{ fontSize: '10.5px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1.5px solid #ccfbf1', paddingBottom: '3px', marginBottom: '6px' }}>
                      Clinical Assessment &amp; Diagnosis
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Provisional Diagnosis</div>
                        <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                          {displayProvisionalDiagnosis}
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Clinical Findings / Notes</div>
                        <div style={{ fontSize: '11px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                          {displayFindings}
                        </div>
                      </div>
                    </div>
                    {currentSymptoms.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>Symptoms:</span>
                        {currentSymptoms.map((sym, i) => (
                          <span key={i} className="badge-pill" style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', marginRight: '4px', marginBottom: '3px' }}>
                            {sym}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medical History & Present Medications */}
                  <div className="sec-card" style={{ marginBottom: '14px' }}>
                    <div className="sec-title" style={{ fontSize: '10.5px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1.5px solid #ccfbf1', paddingBottom: '3px', marginBottom: '6px' }}>
                      Medical History &amp; Medications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10.5px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Past Medical / Surgical History</div>
                        <div>
                          {currentPastHistory.length > 0 ? currentPastHistory.map((h, idx) => (
                            <span key={idx} className="badge-pill" style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', marginRight: '4px', marginBottom: '3px' }}>
                              {h}
                            </span>
                          )) : <span style={{ color: '#64748b' }}>None recorded</span>}
                        </div>
                        {currentSocialHistory.length > 0 && (
                          <div style={{ marginTop: '6px' }}>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Social History: </span>
                            <span style={{ color: '#334155' }}>{currentSocialHistory.join(', ')} {currentSocialNotes ? `(${currentSocialNotes})` : ''}</span>
                          </div>
                        )}
                        {isFemale && (currentMenstrualStatus || currentObstetrics) && (
                          <div style={{ marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                            {currentMenstrualStatus && <div><strong>Menstrual:</strong> {currentMenstrualStatus} {currentMenstrualSpecify ? `(${currentMenstrualSpecify})` : ''}</div>}
                            {currentObstetrics && <div><strong>Obstetrics:</strong> {currentObstetrics}</div>}
                          </div>
                        )}
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Present Medications</div>
                        <div style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>
                          {displayPresentMeds}
                        </div>
                        {Array.isArray(currentMedFiles) && currentMedFiles.length > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '9px', color: '#0d9488', fontWeight: 600 }}>
                            📎 Attached {currentMedFiles.length} file(s): {currentMedFiles.map(f => f.file_name || f.title).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Investigations & Radiology Orders */}
                  {(currentTests.length > 0 || currentCts.length > 0 || currentMris.length > 0 || currentXrays.length > 0) && (
                    <div className="sec-card" style={{ marginBottom: '14px' }}>
                      <div className="sec-title" style={{ fontSize: '10.5px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1.5px solid #ccfbf1', paddingBottom: '3px', marginBottom: '6px' }}>
                        Ordered Investigations &amp; Imaging
                      </div>
                      {currentTests.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Diagnostic Lab Tests:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {currentTests.map((t, i) => (
                              <span key={i} className="badge-pill badge-accent" style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4' }}>
                                • {t.name} <span style={{ fontSize: '8px', color: '#64748b' }}>({t.dept})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentCts.length > 0 || currentMris.length > 0 || currentXrays.length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                          {currentCts.length > 0 && (
                            <div>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CT Scan: </span>
                              <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 600 }}>{currentCts.join(', ')}</span>
                            </div>
                          )}
                          {currentMris.length > 0 && (
                            <div>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>MRI Scan: </span>
                              <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 600 }}>{currentMris.join(', ')}</span>
                            </div>
                          )}
                          {currentXrays.length > 0 && (
                            <div>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>X-Ray: </span>
                              <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 600 }}>{currentXrays.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prescription (Rx) Table */}
                  <div className="sec-card" style={{ marginBottom: '14px' }}>
                    <div className="sec-title" style={{ fontSize: '10.5px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1.5px solid #ccfbf1', paddingBottom: '3px', marginBottom: '6px' }}>
                      Rx - Prescribed Medications ({currentPrescriptions.length})
                    </div>
                    {currentPrescriptions.length === 0 ? (
                      <div style={{ padding: '8px 12px', color: '#64748b', background: '#f8fafc', borderRadius: '6px', fontSize: '10.5px' }}>
                        No medications prescribed.
                      </div>
                    ) : (
                      <table className="styled-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px', fontSize: '10.5px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', width: '36px', textAlign: 'center' }}>#</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px' }}>Medicine / Drug Name</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', width: '90px' }}>Dosage</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', width: '90px' }}>Frequency</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', width: '80px' }}>Duration</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', width: '60px', textAlign: 'center' }}>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPrescriptions.map((rx) => (
                            <tr key={rx.sn} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{rx.sn}</td>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: '#0f172a' }}>{rx.name}</td>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', color: '#334155' }}>{rx.dosage}</td>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', color: '#334155' }}>{rx.frequency}</td>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', color: '#334155' }}>{rx.duration}</td>
                              <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#0d9488' }}>{rx.total_dosage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Plan of Care, Diet & Follow-up */}
                  <div className="sec-card" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>Plan of Care</div>
                      {currentPlanPoints.length === 0 ? (
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>None recorded</div>
                      ) : (
                        <ul className="bullet-list" style={{ margin: 0, paddingLeft: '18px', fontSize: '10.5px', color: '#1e293b' }}>
                          {currentPlanPoints.map((pt, i) => (
                            <li key={i} style={{ marginBottom: '2px' }}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Diet Advice: </span>
                        <span style={{ fontSize: '10.5px', color: '#1e293b' }}>{displayDiet}</span>
                      </div>
                      {displayReferral && (
                        <div>
                          <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Referral: </span>
                          <span style={{ fontSize: '10.5px', color: '#0d9488', fontWeight: 700 }}>{displayReferral}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Next Follow-up: </span>
                        <strong style={{ fontSize: '11px', color: displayFollowup ? '#0d9488' : '#64748b' }}>
                          {displayFollowup ? new Date(displayFollowup).toLocaleDateString('en-GB') : 'SOS / As needed'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Print & Sign-off Footer */}
                  <div className="footer-grid" style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>
                      <div>Entered / Updated: <strong>{consultDate} {consultTime}</strong></div>
                      <div style={{ marginTop: '2px' }}>Hospital EMR System · Current Consultation Summary</div>
                    </div>
                    <div className="sig-area" style={{ textAlign: 'center' }}>
                      <div className="sig-line" style={{ width: '160px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0f172a' }}>{doctorName}</div>
                      <div style={{ fontSize: '8.5px', color: '#64748b' }}>Attending Physician Signature</div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalContent>
          </ModalOverlay>
        );
      })()}

      {showWaitingModal && (
        <ModalOverlay onClick={() => setShowWaitingModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>Waiting Patients</h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Total {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowWaitingModal(false)} />
            </div>

            {/* Search & Toggle */}
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <SearchBox style={{ margin: 0, flex: 1 }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name or UHID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </SearchBox>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === 'all' ? '#0d9488' : 'transparent',
                    color: statusFilter === 'all' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  All ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ready')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === 'ready' ? '#16a34a' : 'transparent',
                    color: statusFilter === 'ready' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Ready ({counts.ready})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('waiting')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === 'waiting' ? '#d97706' : 'transparent',
                    color: statusFilter === 'waiting' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Waiting ({counts.waiting})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === 'completed' ? '#7c3aed' : 'transparent',
                    color: statusFilter === 'completed' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Completed ({counts.completed})
                </button>
              </div>

              <ViewToggleGroup>
                <ViewToggleButton
                  type="button"
                  $active={queueViewMode === 'card'}
                  onClick={() => setQueueViewMode('card')}
                  title="Card View"
                >
                  <LayoutGrid size={15} /> Card
                </ViewToggleButton>
                <ViewToggleButton
                  type="button"
                  $active={queueViewMode === 'table'}
                  onClick={() => setQueueViewMode('table')}
                  title="Table View"
                >
                  <List size={15} /> Table
                </ViewToggleButton>
              </ViewToggleGroup>
            </div>

            {/* Content (Cards or Table) */}
            {loadingPatients ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>No patients matching filter.</div>
            ) : queueViewMode === 'table' ? (
              <TableWrapper>
                <PatientTable>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>UHID</th>
                      <th>Patient Name</th>
                      <th>Age / Gender</th>
                      <th>Contact</th>
                      <th>Billed Time</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p, idx) => {
                      const isSelected = selectedPatient?.patient?.uhid === p.patient?.uhid;
                      const name = p.patient?.patient_name || 'Unknown Patient';
                      const billedTime = p.billed_date ? new Date(p.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                      const isConsultDone = p.is_consultation_completed || p.consultation_status === 'Completed';
                      const isReady = !isConsultDone && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');

                      return (
                        <tr key={p.bill_number || p.patient?.uhid || idx} style={{ background: isSelected ? '#f0fdfa' : 'transparent' }}>
                          <td style={{ fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccfbf1', fontSize: '0.82rem' }}>
                              {p.patient?.uhid || '--'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{name}</div>
                          </td>
                          <td>
                            <span style={{ color: '#475569' }}>
                              {p.patient?.age ? `${p.patient.age} Yrs` : '--'} • {p.patient?.gender || '--'}
                            </span>
                          </td>
                          <td>
                            {p.patient?.mobilePhone ? (
                              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>📞</span> {p.patient.mobilePhone}
                              </span>
                            ) : '--'}
                          </td>
                          <td>
                            <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={13} color="#94a3b8" /> {billedTime}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: isConsultDone ? '#f5f3ff' : (isReady ? '#f0fdf4' : '#fffbeb'),
                              color: isConsultDone ? '#7c3aed' : (isReady ? '#16a34a' : '#d97706'),
                              border: `1px solid ${isConsultDone ? '#ddd6fe' : (isReady ? '#bbf7d0' : '#fde68a')}`,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isConsultDone ? (
                                <>
                                  <CheckCircle2 size={12} /> Completed
                                </>
                              ) : isReady ? (
                                <>
                                  <CheckCircle2 size={12} /> Ready
                                </>
                              ) : (
                                <>
                                  <Clock size={12} /> Waiting
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectPatientAndStart(p);
                                setShowWaitingModal(false);
                              }}
                              style={{
                                padding: '7px 14px',
                                background: isSelected ? '#0d9488' : (isConsultDone ? '#f5f3ff' : 'transparent'),
                                color: isSelected ? '#fff' : (isConsultDone ? '#7c3aed' : '#0d9488'),
                                border: `1.5px solid ${isSelected ? '#0d9488' : (isConsultDone ? '#8b5cf6' : '#6ee7b7')}`,
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = isConsultDone ? '#7c3aed' : '#0d9488'; e.currentTarget.style.color = '#fff'; } }}
                              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = isConsultDone ? '#f5f3ff' : 'transparent'; e.currentTarget.style.color = isConsultDone ? '#7c3aed' : '#0d9488'; } }}
                            >
                              {isSelected ? '✓ Selected' : (isConsultDone ? 'View / Edit →' : 'Consult →')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </PatientTable>
              </TableWrapper>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
                {filteredPatients.map((p, idx) => {
                  const isSelected = selectedPatient?.patient?.uhid === p.patient?.uhid;
                  const name = p.patient?.patient_name || 'Unknown Patient';
                  const initials = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
                  const avatarPalette = [
                    ['#e0f2fe', '#0284c7'], ['#dcfce7', '#16a34a'], ['#fef3c7', '#d97706'],
                    ['#f3e8ff', '#9333ea'], ['#fee2e2', '#dc2626'], ['#e0e7ff', '#4f46e5'],
                    ['#fce7f3', '#db2777'], ['#f0fdf4', '#15803d'],
                  ];
                  const [avBg, avTxt] = avatarPalette[idx % avatarPalette.length];
                  const billedTime = p.billed_date ? new Date(p.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                  const isConsultDone = p.is_consultation_completed || p.consultation_status === 'Completed';
                  const isReady = !isConsultDone && (p.vital_status === 'Completed' || p.consultation_status === 'Ready');

                  return (
                    <div key={p.patient?.uhid} style={{
                      background: '#fff',
                      borderRadius: '16px',
                      border: `1.5px solid ${isSelected ? '#0d9488' : (isConsultDone ? '#ddd6fe' : '#e2e8f0')}`,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '230px',
                      height: '100%',
                      boxSizing: 'border-box',
                      boxShadow: isSelected ? '0 0 0 3px rgba(13,148,136,0.12)' : '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}>
                      <div>
                        {/* Top row: Name/UHID & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              title={name}
                              style={{
                                fontWeight: 700,
                                fontSize: '0.94rem',
                                color: '#0f172a',
                                lineHeight: 1.25,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {name}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0d9488', marginTop: '2px', whiteSpace: 'nowrap' }}>
                              UHID: {p.patient?.uhid || '--'}
                            </div>
                          </div>

                          {/* Status badge */}
                          <span style={{
                            flexShrink: 0,
                            background: isConsultDone ? '#f5f3ff' : (isReady ? '#dcfce7' : '#fef9c3'),
                            color: isConsultDone ? '#7c3aed' : (isReady ? '#16a34a' : '#ca8a04'),
                            border: `1px solid ${isConsultDone ? '#ddd6fe' : (isReady ? '#bbf7d0' : '#fde68a')}`,
                            fontSize: '0.68rem', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.3px',
                            display: 'inline-flex', alignItems: 'center', gap: '3px'
                          }}>
                            {isConsultDone ? (
                              <>
                                <CheckCircle2 size={11} /> Completed
                              </>
                            ) : isReady ? (
                              'Ready'
                            ) : (
                              'Waiting'
                            )}
                          </span>
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', color: '#475569', minHeight: '42px' }}>
                          <div>{p.patient?.age ? `${p.patient.age} Yrs` : '--'} • {p.patient?.gender || '--'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📞</span> {p.patient?.mobilePhone || 'No contact'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                            <Clock size={13} /> {billedTime}
                          </div>
                        </div>
                      </div>

                      {/* Pinned Bottom CTA */}
                      <button
                        onClick={() => {
                          handleSelectPatientAndStart(p);
                          setShowWaitingModal(false);
                        }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = isConsultDone ? '#7c3aed' : '#0d9488'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = isConsultDone ? '#f5f3ff' : 'transparent'; e.currentTarget.style.color = isConsultDone ? '#7c3aed' : '#0d9488'; } }}
                        style={{
                          marginTop: '14px', width: '100%', height: '38px', padding: '0 12px',
                          background: isSelected ? '#0d9488' : (isConsultDone ? '#f5f3ff' : 'transparent'),
                          color: isSelected ? '#fff' : (isConsultDone ? '#7c3aed' : '#0d9488'),
                          border: `1.5px solid ${isSelected ? '#0d9488' : (isConsultDone ? '#8b5cf6' : '#6ee7b7')}`,
                          borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '8px', transition: 'all 0.2s ease', boxSizing: 'border-box'
                        }}
                      >
                        {isSelected ? '✓ Currently Selected' : (isConsultDone ? 'View / Edit Consultation →' : 'Start Consultation →')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Lightbox / Full-Screen Preview Modal for Present Medication Files */}
      {previewModalFile && (
        <ModalOverlay onClick={() => setPreviewModalFile(null)} style={{ zIndex: 10002 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '92%',
              maxWidth: '850px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ImageIcon size={18} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '520px'
                  }}>
                    {previewModalFile.file_name || 'Prescription / Medication Image'}
                  </h4>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {previewModalFile.file_size ? `${(previewModalFile.file_size / 1024).toFixed(1)} KB` : 'Prescription Attachment'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {previewModalFile.url && (
                  <a
                    href={previewModalFile.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    <ExternalLink size={13} /> Open Full Size
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalFile(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body with Preview */}
            <div style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f172a',
              overflow: 'auto',
              maxHeight: 'calc(92vh - 75px)'
            }}>
              {previewModalFile.isPdf ? (
                <iframe
                  src={previewModalFile.url}
                  title="PDF Document Preview"
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px', background: '#fff' }}
                />
              ) : (
                <img
                  src={previewModalFile.url}
                  alt={previewModalFile.file_name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                />
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default OPDoctorlogin;