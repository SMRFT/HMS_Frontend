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
  Pill
} from 'lucide-react';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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
  background: ${props => props.$active ? '#bae6fd' : '#f0fdf4'};
  border: 1px solid ${props => props.$active ? '#7dd3fc' : '#bbf7d0'};
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transform: translateY(-1px);
  }

  .patient-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 500;
  }

  .date-info {
    font-size: 0.8125rem;
    color: #475569;
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
    background: #ffffff;
    color: #64748b;
    text-align: left;
    padding: 12px 20px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
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

  // Master Data
  const [symptomList, setSymptomList] = useState([]);
  const [testList, setTestList] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState("vitals");
  const [consultationStartTimes, setConsultationStartTimes] = useState(() => {
    try {
      const saved = localStorage.getItem("consultationStartTimes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("consultationStartTimes", JSON.stringify(consultationStartTimes));
  }, [consultationStartTimes]);
  const [allergies, setAllergies] = useState("");
  const [chiefComplaints, setChiefComplaints] = useState("");
  const [clinicalPastHistory, setClinicalPastHistory] = useState([]);
  const [presentMedications, setPresentMedications] = useState("");

  const handleTogglePastHistory = (item) => {
    if (clinicalPastHistory.includes(item)) {
      setClinicalPastHistory(clinicalPastHistory.filter(i => i !== item));
    } else {
      setClinicalPastHistory([...clinicalPastHistory, item]);
    }
  };
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]); // Stores test_id
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

  // Modal & History State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
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
        if (res.data.length > 0) {
          setSelectedHistoryItem(res.data[0]);
        } else {
          setSelectedHistoryItem(null);
        }
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

      // Reset form state for new patient
      setSelectedSymptoms([]);
      setSelectedTestIds([]);
      setSelectedMedicineIds([]);
      setFinding("");
      setDiet("");
      setReferToDoctor("");
      setFollowupDate("");
    }
  }, [selectedPatient]);

  // 1. Fetch Patients & Masters on mount
  useEffect(() => {
    fetchBilledPatients();
    fetchSymptoms();
    fetchDiagnosticsTests();
    fetchMedicines();
    fetchReferralDoctors();
  }, []);

  const fetchBilledPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_get_billing_patient/`, "GET");
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

  const medicineOptions = useMemo(() => medicineList.map(m => ({ value: m.item_id, label: m.item_name })), [medicineList]);

  const selectedMedicineOptions = useMemo(() => {
    return selectedMedicineIds.map(id => {
      const m = medicineList.find(x => x.item_id === id);
      return { value: id, label: m ? m.item_name : `Item #${id}` };
    });
  }, [selectedMedicineIds, medicineList]);

  const symptomOptions = useMemo(() => symptomList.map(s => ({ value: s, label: s })), [symptomList]);

  const selectedSymptomOptions = useMemo(() => {
    return selectedSymptoms.map(s => ({ value: s, label: s }));
  }, [selectedSymptoms]);

  const testOptions = useMemo(() => testList.map(t => ({
    value: t.test_id,
    label: t.department ? `${t.test_name} [${t.department}]` : t.test_name
  })), [testList]);

  const selectedTestOptions = useMemo(() => {
    return selectedTestIds.map(id => {
      const t = testList.find(x => x.test_id === id);
      return { value: id, label: t ? t.test_name : `Test #${id}` };
    });
  }, [selectedTestIds, testList]);

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

  const handleStartConsultationAPI = async (startTimeStr) => {
    if (!selectedPatient) return;
    try {
      const payload = {
        uhid: selectedPatient.patient?.uhid,
        doctor_id: selectedPatient.doctor_id || selectedPatient.patient?.doctor_id || "",
        consultation_start_time: startTimeStr,
      };
      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/`, "POST", payload);
      if (!res.success) {
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
      delete cleanVitals.created_by;
      delete cleanVitals.created_date;
      delete cleanVitals.lastmodified_by;
      delete cleanVitals.lastmodified_date;
      delete cleanVitals['auth-user-id'];

      const payload = {
        uhid: selectedPatient.patient?.uhid,
        doctor_id: selectedPatient.doctor_id || selectedPatient.patient?.doctor_id || "",
        vitals: cleanVitals, // id removed!
        symptoms: selectedSymptoms,
        investigation_test_ids: selectedTestIds, // Stored test_id array!
        investigation_details: testList.filter(t => selectedTestIds.includes(t.test_id)),
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
        consultation_start_time: consultationStartTimes[selectedPatient?.patient?.uhid] || null,
        consultation_end_time: new Date().toISOString(),
        allergies: allergies,
        chief_complaints: chiefComplaints,
        past_history: clinicalPastHistory,
        present_medications: presentMedications
      };

      const res = await apiRequest(`${Hmsbaseurl}OPEMR_DoctorConsultation/`, "POST", payload);
      if (res.success) {
        toast.success("Consultation saved successfully!");
        setConsultationStartTimes(prev => {
          const newTimes = { ...prev };
          delete newTimes[selectedPatient?.patient?.uhid];
          return newTimes;
        });
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

        <HeaderActions>
          {selectedPatient && !consultationStartTimes[selectedPatient?.patient?.uhid] && (
            <Button
              style={{ background: '#ea580c', color: '#fff', borderColor: '#ea580c' }}
              onClick={() => {
                const startTime = new Date().toISOString();
                setConsultationStartTimes(prev => ({
                  ...prev,
                  [selectedPatient.patient.uhid]: startTime
                }));
                handleStartConsultationAPI(startTime);
              }}
            >
              Start Consultation
            </Button>
          )}
          <Button $variant="secondary" onClick={fetchBilledPatients} disabled={loadingPatients}>
            <RefreshCw size={16} className={loadingPatients ? "spin" : ""} />
            Refresh Queue
          </Button>
          <Button $variant="secondary" onClick={() => setShowWaitingModal(true)}>
            <Users size={16} />
            Waiting Patients ({filteredPatients.length})
          </Button>
          <Button $variant="outline" onClick={() => setShowHistoryModal(true)} disabled={!selectedPatient}>
            <Clock size={16} />
            Past History ({pastHistory.length})
          </Button>
        </HeaderActions>
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
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Waiting Patients</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Total {filteredPatients.length} Patients</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input type="text" placeholder="Search name / UHID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#334155', width: '180px' }} />
                </div>
              </div>

              {/* Cards Grid */}
              {loadingPatients ? (
                <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div style={{ padding: '80px 40px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                  <Users size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#475569' }}>No patients in queue</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Refresh to check for new arrivals</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {filteredPatients.map((p, idx) => {
                    const name = p.patient?.patient_name || 'Unknown Patient';
                    const initials = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
                    const avatarStyles = [
                      { bg: '#e0f2fe', color: '#0284c7' }, { bg: '#dcfce7', color: '#16a34a' },
                      { bg: '#fef3c7', color: '#d97706' }, { bg: '#f3e8ff', color: '#9333ea' },
                      { bg: '#fee2e2', color: '#dc2626' }, { bg: '#e0e7ff', color: '#4f46e5' },
                      { bg: '#fce7f3', color: '#db2777' }, { bg: '#f0fdf4', color: '#15803d' },
                    ];
                    const av = avatarStyles[idx % avatarStyles.length];
                    const billedTime = p.billed_date ? new Date(p.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                    const vitalsDone = p.vital_status === 'Completed';
                    return (
                      <div key={p.patient?.uhid} style={{
                        background: '#fff', borderRadius: '16px',
                        border: '1.5px solid #e8edf3',
                        overflow: 'hidden',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.22s ease',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf3'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ padding: '18px 18px 16px' }}>
                          {/* Avatar + Badge row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: av.bg, color: av.color, fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${av.color}30` }}>{initials}</div>
                            <span style={{ background: vitalsDone ? '#f0fdf4' : '#fffbeb', color: vitalsDone ? '#16a34a' : '#d97706', border: `1px solid ${vitalsDone ? '#bbf7d0' : '#fde68a'}`, fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{vitalsDone ? 'Ready' : 'Waiting'}</span>
                          </div>
                          {/* Name + UHID */}
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1px' }}>{name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>UHID</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>{p.patient?.uhid || '--'}</div>
                          {/* Info */}
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '5px' }}>{p.patient?.age ? `${p.patient.age} Yrs` : '--'} &bull; {p.patient?.gender || '--'}</div>
                          {p.patient?.mobilePhone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '5px' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={av.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z"/></svg>
                              {p.patient.mobilePhone}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                            <Clock size={13} color={av.color} />{billedTime}
                          </div>
                          {/* CTA */}
                          <button
                            onClick={() => { setSelectedPatient(p); setActiveTab('vitals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{ width: '100%', padding: '10px 0', background: '#fff', color: '#0d9488', border: '1.5px solid #0d9488', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.18s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0d9488'; }}
                          >
                            Start Consultation →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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

          {selectedPatient && (
            <>
              {/* Back to queue */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    color: '#475569', fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', padding: '6px 14px', borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  ← Back to Patient Queue
                </button>
              </div>
            </>
          )}

          {selectedPatient && (
            <>
              <TabNav>
                <TabButton $active={activeTab === 'vitals'} $iconColor="#e11d48" onClick={() => setActiveTab('vitals')}>
                  <Heart size={18} /> Vitals & Exam
                </TabButton>
                <TabButton $active={activeTab === 'clinical'} $iconColor="#4f46e5" onClick={() => setActiveTab('clinical')}>
                  <Stethoscope size={18} /> Clinical Assessment
                </TabButton>
                <TabButton $active={activeTab === 'diagnostics'} $iconColor="#d97706" onClick={() => setActiveTab('diagnostics')}>
                  <Activity size={18} /> Diagnostics
                </TabButton>
                <TabButton $active={activeTab === 'plan'} $iconColor="#ef4444" onClick={() => setActiveTab('plan')}>
                  <Pill size={18} /> Plan & Prescriptions
                </TabButton>
              </TabNav>

              {/* Wait Time Timeline */}
              <TimelineBar>
                <TimelineItem $bg="#f0fdf4" $color="#16a34a">
                  <div className="icon-box"><Clock size={18} /></div>
                  <div className="details">
                    <span className="label">Billed Time</span>
                    <span className="time">
                      {selectedPatient.billed_date ? new Date(selectedPatient.billed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </TimelineItem>

                <TimelineItem $bg="#eff6ff" $color="#2563eb">
                  <div className="icon-box"><Heart size={18} /></div>
                  <div className="details">
                    <span className="label">Vitals Taken</span>
                    <span className="time">
                      {selectedPatient.vital_entry?.vital_entry_date ? new Date(selectedPatient.vital_entry.vital_entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </span>
                  </div>
                </TimelineItem>

                <TimelineItem $bg="#fff7ed" $color="#ea580c">
                  <div className="icon-box"><Stethoscope size={18} /></div>
                  <div className="details">
                    <span className="label">Consultation Started</span>
                    <span className="time">
                      {consultationStartTimes[selectedPatient?.patient?.uhid] ?
                        new Date(consultationStartTimes[selectedPatient.patient.uhid]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Pending'
                      }
                    </span>
                  </div>
                </TimelineItem>

                {(() => {
                  if (!selectedPatient.billed_date) return null;
                  const billedTime = new Date(selectedPatient.billed_date).getTime();
                  const now = new Date().getTime();
                  const diffMs = now - billedTime;
                  const diffMins = Math.floor(diffMs / 60000);
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  const waitText = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
                  return (
                    <WaitTimeBadge $isLongWait={diffMins > 60}>
                      <Clock size={16} /> Total Wait: {waitText}
                    </WaitTimeBadge>
                  );
                })()}
              </TimelineBar>


              {activeTab === 'clinical' && (
                <TabContent>
                  <Card>
                    <CardTitle><AlertCircle size={20} /> Allergies</CardTitle>
                    <TextArea placeholder="Enter any known allergies..." value={allergies} onChange={e => setAllergies(e.target.value)} style={{ minHeight: '60px' }} />
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
                    <CardTitle><Activity size={20} /> Present Medications</CardTitle>
                    <TextArea placeholder="Enter present medications..." value={presentMedications} onChange={e => setPresentMedications(e.target.value)} style={{ minHeight: '80px' }} />
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
                      <Stethoscope size={20} /> Diagnostics / Symptoms (from HMS_Symptoms_list)
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
                          setSelectedSymptoms(selected ? selected.map(s => s.value) : []);
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

                  {/* 3. Investigation Dropdown (Diagnostics_test_details) */}
                  <Card>
                    <CardTitle>
                      <FileText size={20} /> Investigation Tests (from Diagnostics_test_details)
                    </CardTitle>
                    <div style={{ marginTop: '12px' }}>
                      <Select
                        isMulti
                        closeMenuOnSelect={false}
                        components={{ MenuList: CustomMenuList }}
                        placeholder="Search and select investigation tests..."
                        options={testOptions}
                        value={selectedTestOptions}
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
            </>
          )}
        </Workspace>
      </MainGrid>

      {/* Past History Modal */}
      {showHistoryModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowHistoryModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
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
              <HistorySplitLayout>
                <HistorySidebar>
                  {pastHistory.map((item, idx) => {
                    const isActive = selectedHistoryItem?._id === item._id || selectedHistoryItem === item;
                    return (
                      <HistorySidebarCard
                        key={item._id || idx}
                        $active={isActive}
                        onClick={() => setSelectedHistoryItem(item)}
                      >
                        <div className="patient-info">
                          <span>{selectedPatient?.patient?.patient_name || item.patient_name || 'Patient'}</span>
                          <span>{selectedPatient?.patient?.uhid || item.uhid || ''}</span>
                        </div>
                        <div className="date-info">
                          {item.created_date ? new Date(item.created_date).toLocaleDateString() : ''}
                        </div>
                      </HistorySidebarCard>
                    );
                  })}
                </HistorySidebar>

                <HistoryDetailPane>
                  {selectedHistoryItem ? (
                    <>
                      <HistoryDetailHeader>
                        Medical History - {selectedHistoryItem.created_date ? new Date(selectedHistoryItem.created_date).toLocaleDateString() : ''}
                      </HistoryDetailHeader>


                      {/* Vitals Grid */}
                      {selectedHistoryItem.vitals && Object.keys(selectedHistoryItem.vitals).length > 0 && (
                        <HistoryVitalsGrid>
                          <div className="vital-card">
                            <div className="icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}><Heart size={16} /></div>
                            <div className="val">{selectedHistoryItem.vitals.pulse_rate || '--'}</div>
                            <div className="lbl">Pulse Rate</div>
                          </div>
                          <div className="vital-card">
                            <div className="icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Activity size={16} /></div>
                            <div className="val">{selectedHistoryItem.vitals.bp || '--'}</div>
                            <div className="lbl">Blood Pressure</div>
                          </div>
                          <div className="vital-card">
                            <div className="icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}><Thermometer size={16} /></div>
                            <div className="val">{selectedHistoryItem.vitals.temp || '--'}</div>
                            <div className="lbl">Temperature</div>
                          </div>
                          <div className="vital-card">
                            <div className="icon-wrapper" style={{ background: '#f0fdf4', color: '#22c55e' }}><Scale size={16} /></div>
                            <div className="val">{selectedHistoryItem.vitals.weight || '--'} kg</div>
                            <div className="lbl">Weight</div>
                          </div>
                        </HistoryVitalsGrid>
                      )}

                      <ThemeSectionBox>
                        <div className="title"><Stethoscope size={18} /> Clinical Assessment</div>
                        <ul style={{ listStyleType: 'disc' }}>
                          {selectedHistoryItem.allergies && <li><span style={{ fontWeight: 600 }}>Allergies:</span> {selectedHistoryItem.allergies}</li>}
                          {selectedHistoryItem.chief_complaints && <li><span style={{ fontWeight: 600 }}>Chief Complaints:</span> {selectedHistoryItem.chief_complaints}</li>}
                          {selectedHistoryItem.symptoms?.map(s => <li key={s}><span style={{ fontWeight: 600 }}>Symptom:</span> {s}</li>)}
                          {(!selectedHistoryItem.allergies && !selectedHistoryItem.chief_complaints && !selectedHistoryItem.symptoms?.length) && <li style={{ color: '#94a3b8' }}>No clinical assessment recorded.</li>}
                        </ul>
                      </ThemeSectionBox>

                      <ThemeSectionBox>
                        <div className="title"><FileText size={18} /> Diagnosis & Findings</div>
                        <ul style={{ listStyleType: 'disc' }}>
                          {selectedHistoryItem.finding && <li>{selectedHistoryItem.finding}</li>}
                          {!selectedHistoryItem.finding && <li style={{ color: '#94a3b8' }}>No diagnosis or findings recorded.</li>}
                        </ul>
                      </ThemeSectionBox>

                      {/* Investigations */}
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
                        <div className="title"><Calendar size={18} /> Plans & Follow-up</div>
                        <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedHistoryItem.diet && <li><span style={{ fontWeight: 600, color: '#475569' }}>Diet:</span> {selectedHistoryItem.diet}</li>}
                          {selectedHistoryItem.refer_to_doctor && <li><span style={{ fontWeight: 600, color: '#475569' }}>Referred To:</span> Dr. {(referralDoctors.find(d => String(d.employeeId) === String(selectedHistoryItem.refer_to_doctor))?.employeeName) || selectedHistoryItem.refer_to_doctor}</li>}
                          {selectedHistoryItem.followup_date && <li><span style={{ fontWeight: 600, color: '#475569' }}>Follow-up Date:</span> {new Date(selectedHistoryItem.followup_date).toLocaleDateString()}</li>}
                          {(!selectedHistoryItem.diet && !selectedHistoryItem.refer_to_doctor && !selectedHistoryItem.followup_date) && <li style={{ color: '#94a3b8' }}>No follow-up plans recorded.</li>}
                        </ul>
                      </ThemeSectionBox>
                    </>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      Select a date from the left to view details.
                    </div>
                  )}
                </HistoryDetailPane>
              </HistorySplitLayout>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button $variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
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

            {/* Search */}
            <div style={{ margin: '20px 0' }}>
              <SearchBox style={{ margin: 0 }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name or UHID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </SearchBox>
            </div>

            {/* Cards */}
            {loadingPatients ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>No patients waiting.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '16px' }}>
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
                  const vitalsDone = p.vital_status === 'Completed';

                  return (
                    <div key={p.patient?.uhid} style={{
                      background: '#fff',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? '#0d9488' : '#e2e8f0'}`,
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: isSelected ? '0 0 0 3px rgba(13,148,136,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}>
                      {/* Status badge */}
                      <span style={{
                        position: 'absolute', top: '14px', right: '14px',
                        background: vitalsDone ? '#dcfce7' : '#fef9c3',
                        color: vitalsDone ? '#16a34a' : '#ca8a04',
                        fontSize: '0.68rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.3px'
                      }}>
                        {vitalsDone ? 'Ready' : 'Waiting'}
                      </span>

                      {/* Avatar + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '46px', height: '46px', borderRadius: '12px',
                          background: avBg, color: avTxt,
                          fontWeight: 800, fontSize: '1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2, paddingRight: '52px' }}>{name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>UHID</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d9488' }}>{p.patient?.uhid || '--'}</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', color: '#475569' }}>
                        <div>{p.patient?.age ? `${p.patient.age} Yrs` : '--'} • {p.patient?.gender || '--'}</div>
                        {p.patient?.mobilePhone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📞</span> {p.patient.mobilePhone}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} /> {billedTime}
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setShowWaitingModal(false);
                          setActiveTab('vitals');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0d9488'; } }}
                        style={{
                          marginTop: '4px', width: '100%', padding: '10px',
                          background: isSelected ? '#0d9488' : 'transparent',
                          color: isSelected ? '#fff' : '#0d9488',
                          border: `1.5px solid ${isSelected ? '#0d9488' : '#6ee7b7'}`,
                          borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '8px', transition: 'all 0.2s ease',
                        }}
                      >
                        {isSelected ? '✓ Currently Selected' : 'Start Consultation →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default OPDoctorlogin;