import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, createGlobalStyle, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  Search,
  Calendar,
  RefreshCw,
  Printer,
  Receipt,
  Pill,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Repeat,
  Bed,
  Phone,
  DollarSign,
  Layers,
  Building2,
  Activity,
  AlertTriangle,
  Eye
} from "lucide-react";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global Font ──────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
`;

// ─── Keyframe Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 2500px; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulseDot = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(13, 148, 136, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
`;

const pulseRingOrange = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 138, 0, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(230, 138, 0, 0.25);
  }
  70% {
    transform: scale(1.08);
    box-shadow: 0 0 0 12px rgba(230, 138, 0, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 138, 0, 0);
  }
`;

const softGlowHalo = keyframes`
  0%, 100% {
    opacity: 0.45;
    transform: scale(0.92);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.3);
  }
`;

const HeaderBlinkBadgeWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0) 70%);
    animation: ${softGlowHalo} 1.8s ease-in-out infinite;
    pointer-events: none;
  }
`;

const HeaderBlinkBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e68a00;
  color: #1a1a1a;
  font-size: 0.88rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(230, 138, 0, 0.5);
  animation: ${pulseRingOrange} 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  position: relative;
  z-index: 2;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:     "#0f766e",
  primaryHover:"#115e59",
  primaryLight:"#ccfbf1",
  primaryBg:   "#f0fdfa",
  accent:      "#0d9488",
  slateDark:   "#0f172a",
  slateMid:    "#334155",
  slateMuted:  "#64748b",
  slateLight:  "#94a3b8",
  border:      "#e2e8f0",
  borderLight: "#f1f5f9",
  surface:     "#ffffff",
  surfaceAlt:  "#f8fafc",
  bg:          "#f4f7fa",
};

// ─── Outer Layout ─────────────────────────────────────────────────────────────
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${T.bg};
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 24px 28px 48px;
  color: ${T.slateDark};

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

// ─── Hero Header ──────────────────────────────────────────────────────────────
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderIconBox = styled.div`
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 18px -4px rgba(13, 148, 136, 0.4);
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${T.slateDark};
  margin: 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderBadge = styled.span`
  background: #ccfbf1;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #99f6e4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${T.slateMuted};
  font-weight: 500;
`;

// ─── Search & Segment Filter Bar (matching Screenshot 2) ──────────────────────
const FilterBarCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 280px;
`;

const CleanSearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.82rem;
  color: #0f172a;
  background: transparent;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
    font-size: 0.82rem;
  }
`;

const SegmentPillsWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8fafc;
  padding: 3px 4px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
`;

const SegmentPillBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? "700" : "600")};
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${({ $active }) => ($active ? "#0f172a" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};

  &:hover {
    color: ${({ $active }) => ($active ? "#ffffff" : "#0f172a")};
    background: ${({ $active }) => ($active ? "#0f172a" : "#e2e8f0")};
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 5px;
    border-radius: 9999px;
    font-size: 0.68rem;
    font-weight: 700;
    background: ${({ $active }) => ($active ? "#334155" : "#e2e8f0")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  }
`;

const PrescriptionMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 500;
`;

// ─── Prescription Cards List (matching Screenshot 2) ──────────────────────────
const PrescriptionCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const PrescriptionCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
`;

const AvatarInitialsBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #ccfbf1;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardPatientName = styled.div`
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
`;

const CardPatientSubtext = styled.div`
  font-size: 0.73rem;
  color: #64748b;
  margin-top: 3px;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const CardRoomTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
`;

const CardDateSubtext = styled.div`
  font-size: 0.73rem;
  color: #64748b;
  margin-top: 3px;
`;

const CardItemsTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
`;

const CardAdvanceSubtext = styled.div`
  font-size: 0.73rem;
  color: #64748b;
  margin-top: 3px;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  background: ${({ $status }) => ($status === "Processing" ? "#f5f3ff" : "#fff7ed")};
  color: ${({ $status }) => ($status === "Processing" ? "#7c3aed" : "#c2410c")};
  border: 1px solid ${({ $status }) => ($status === "Processing" ? "#ede9fe" : "#ffedd5")};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $status }) => ($status === "Processing" ? "#8b5cf6" : "#f97316")};
  }
`;

const CardPrintBtn = styled.button`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f8fafc;
    color: #0f172a;
    border-color: #cbd5e1;
  }
`;

const CardViewBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f766e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #115e59;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
  }
`;

const CardConvertBtn = CardViewBtn;

// ─── Bottom Legend ────────────────────────────────────────────────────────────
const BottomLegendWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 6px;
  flex-wrap: wrap;
`;

const LegendEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
`;

// ─── Detail Modal (matching Screenshot 1) ─────────────────────────────────────
const DetailModalBox = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 1040px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${fadeIn} 0.2s ease;
`;

const DetailModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 14px;
`;

const PatientSummaryStrip = styled.div`
  margin: 0 24px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 20px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const StripCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 16px;
  border-right: 1px solid #e2e8f0;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: none;
    padding-right: 0;
  }

  @media (max-width: 900px) {
    border-right: none;
    padding: 0;
  }
`;

const StripLabel = styled.span`
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
`;

const StripVal = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ $color }) => $color || "#0f172a"};
  letter-spacing: -0.01em;
`;

const ModalTableContainer = styled.div`
  margin: 0 24px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  max-height: 50vh;
  overflow-y: auto;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;

  thead {
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 2;

    th {
      padding: 10px 14px;
      text-align: left;
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      &:hover {
        background: #f8fafc;
      }

      td {
        padding: 10px 14px;
        color: #1e293b;
        vertical-align: middle;
      }
    }
  }
`;

const DetailModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
`;



// ─── Filter & Search Bar ──────────────────────────────────────────────────────
const FilterToolbar = styled.div`
  background: ${T.surface};
  border-radius: 16px;
  border: 1px solid ${T.border};
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02), 0 6px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FilterTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${T.slateMuted};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 38px 10px 42px;
  background: ${T.surfaceAlt};
  border: 1.5px solid ${T.border};
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: inherit;
  color: ${T.slateDark};
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:focus {
    background: #fff;
    border-color: ${T.accent};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }

  &::placeholder {
    color: ${T.slateLight};
  }
`;

const ClearSearchBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${T.slateMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  &:hover { color: ${T.slateDark}; }
`;

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const DatePresetGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${T.surfaceAlt};
  padding: 3px 4px;
  border-radius: 10px;
  border: 1.5px solid ${T.border};
`;

const DatePresetBtn = styled.button`
  background: ${({ $active }) => ($active ? "#0f766e" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : T.slateMid)};
  border: none;
  padding: 4px 9px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => ($active ? "#0f766e" : "#e2e8f0")};
    color: ${({ $active }) => ($active ? "#ffffff" : T.slateDark)};
  }
`;

const DateRangePill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${T.surfaceAlt};
  border: 1.5px solid ${T.border};
  border-radius: 10px;
  padding: 6px 12px;
`;

const DateInput = styled.input`
  border: none;
  background: transparent;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: ${T.slateDark};
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding: 2px 0;
`;

const DateSep = styled.span`
  color: ${T.slateLight};
  font-size: 0.8rem;
  font-weight: 600;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, ${T.primary} 0%, ${T.accent} 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(13, 148, 136, 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpinIcon = styled(RefreshCw)`
  animation: ${spin} 0.8s linear infinite;
`;

const FilterPillsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid ${T.borderLight};
  padding-top: 12px;
`;

const FilterPillsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  padding: 6px 13px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  border: 1px solid ${({ $active }) => ($active ? T.accent : T.border)};
  background: ${({ $active }) => ($active ? T.primaryBg : T.surfaceAlt)};
  color: ${({ $active }) => ($active ? T.primary : T.slateMid)};

  &:hover {
    border-color: ${T.accent};
    color: ${T.primary};
  }
`;

const PillCount = styled.span`
  background: ${({ $active }) => ($active ? T.primary : "#e2e8f0")};
  color: ${({ $active }) => ($active ? "#fff" : T.slateMid)};
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
`;

// ─── Table Card Container ─────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${T.surface};
  border-radius: 18px;
  border: 1px solid ${T.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02), 0 12px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.83rem;
`;

const Thead = styled.thead`
  background: #0f172a;
  color: #f8fafc;

  th {
    padding: 14px 16px;
    text-align: left;
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    border-bottom: 1px solid #1e293b;
  }
`;

const PatientRow = styled.tr`
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#f0fdfa" : T.surface)};
  border-bottom: 1px solid ${({ $active }) => ($active ? "#99f6e4" : T.borderLight)};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#e6fffa" : "#f8fafc")};
  }

  td {
    padding: 13px 16px;
    color: ${T.slateDark};
    vertical-align: middle;
    border-bottom: 1px solid ${T.borderLight};
  }
`;

const UHIDBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  font-weight: 700;
  color: ${T.primary};
  background: #ccfbf1;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #99f6e4;
  display: inline-block;
  white-space: nowrap;
`;

const IPNumberBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  font-weight: 700;
  color: #1e40af;
  background: #dbeafe;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
  display: inline-block;
  white-space: nowrap;
`;

const PatientInfoCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $isInsurance }) => ($isInsurance ? "#ecfdf5" : "#f1f5f9")};
  color: ${({ $isInsurance }) => ($isInsurance ? "#059669" : "#475569")};
  border: 1.5px solid ${({ $isInsurance }) => ($isInsurance ? "#a7f3d0" : "#cbd5e1")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const PatientMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const PatientName = styled.span`
  font-weight: 700;
  color: ${T.slateDark};
  font-size: 0.86rem;
`;

const PatientSubPills = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const TypeTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  background: ${({ $isInsurance }) => ($isInsurance ? "#ecfdf5" : "#f1f5f9")};
  color: ${({ $isInsurance }) => ($isInsurance ? "#047857" : "#475569")};
  border: 1px solid ${({ $isInsurance }) => ($isInsurance ? "#a7f3d0" : "#cbd5e1")};
`;

const AdvanceTag = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0d9488;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  padding: 1px 7px;
  border-radius: 6px;
`;



const StatusDotAnim = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
  animation: ${pulseDot} 2s infinite;
`;

const ActionBtnToBill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionBtnMedicines = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  background: ${({ $active }) => ($active ? "#0f766e" : "#f0fdfa")};
  color: ${({ $active }) => ($active ? "#fff" : "#0f766e")};
  border: 1.5px solid ${({ $active }) => ($active ? "#0f766e" : "#99f6e4")};
  border-radius: 20px;
  font-family: inherit;
  font-size: 0.77rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #0f766e;
    color: #fff;
    border-color: #0f766e;
  }
`;

const PrintBtnIcon = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid ${T.border};
  background: ${T.surface};
  color: ${T.slateMid};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f0fdfa;
    border-color: #99f6e4;
    color: #0f766e;
    transform: scale(1.05);
  }
`;

// ─── Expandable Medicine Detail Drawer ────────────────────────────────────────
const DetailDrawerRow = styled.tr`
  background: #f8fafc;
`;

const DetailDrawerCell = styled.td`
  padding: 0 !important;
  border-bottom: 2px solid #99f6e4 !important;
`;

const DetailDrawerInner = styled.div`
  animation: ${slideDown} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Patient Context Card Strip
const ContextStrip = styled.div`
  background: #ffffff;
  border: 1px solid ${T.border};
  border-radius: 14px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const ContextItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const ContextIconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0fdfa;
  color: #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ContextText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ContextKey = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${T.slateMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContextVal = styled.span`
  font-size: 0.84rem;
  font-weight: 700;
  color: ${T.slateDark};
`;

// Advance Financial Card
const FinancialSummaryCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
  border: 1.5px solid #99f6e4;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.06);
`;

const FinCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #99f6e4;
`;

const FinCardTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
`;

const FinStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FinLabel = styled.span`
  font-size: 0.67rem;
  font-weight: 700;
  color: ${T.slateMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FinValue = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ $color }) => $color || T.slateDark};
  font-family: 'JetBrains Mono', monospace;
`;

// Medicine Items Table inside Drawer
const MedicineTableCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${T.border};
  overflow: hidden;
`;

const SubThead = styled.thead`
  background: #f8fafc;
  th {
    padding: 10px 14px;
    font-size: 0.7rem;
    font-weight: 700;
    color: ${T.slateMuted};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid ${T.border};
  }
`;

const SubRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #f0fdfa; }

  td {
    padding: 10px 14px;
    font-size: 0.81rem;
    vertical-align: middle;
  }
`;

const ItemDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ $type }) =>
    $type === "substitute" ? "#3b82f6" :
    $type === "emergency"  ? "#ef4444" :
    $type === "insurance"  ? "#10b981" :
    "#94a3b8"};
`;

const ConsumableTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
`;

const CoveredTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
`;

const StockIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: ${({ $low }) => ($low ? "#fef2f2" : "#f0fdf4")};
  color: ${({ $low }) => ($low ? "#dc2626" : "#16a34a")};
  border: 1px solid ${({ $low }) => ($low ? "#fecaca" : "#bbf7d0")};
`;

const SubstituteActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #f0fdfa;
  color: #0f766e;
  border: 1.5px solid #99f6e4;
  border-radius: 7px;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #0f766e;
    color: #fff;
    border-color: #0f766e;
  }
`;

// ─── Modals (Substitute & Print) ─────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.3);
  width: 540px;
  max-width: 100%;
  animation: ${fadeIn} 0.2s ease;
  overflow: hidden;
  border: 1px solid ${T.border};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  color: #fff;
`;

const ModalTitle = styled.div`
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalCloseBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const ModalBody = styled.div`
  padding: 22px 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid ${T.border};
  background: ${T.surfaceAlt};
`;

const PrimaryBtn = styled.button`
  padding: 9px 20px;
  background: linear-gradient(135deg, ${T.primary} 0%, ${T.accent} 100%);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover { opacity: 0.92; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecondaryBtn = styled.button`
  padding: 9px 18px;
  background: ${T.surface};
  color: ${T.slateMid};
  border: 1.5px solid ${T.border};
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

// Autocomplete Dropdown in Substitute Modal
const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #99f6e4;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(13, 148, 136, 0.18);
  max-height: 220px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 6px 0;
  list-style: none;
`;

const DropdownItem = styled.li`
  padding: 10px 14px;
  font-size: 0.83rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.1s;

  &:hover {
    background: #f0fdfa;
    color: #0f766e;
    font-weight: 600;
  }
`;

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const getBillKey = (patient) =>
  `bill-${patient?.Bill_id ?? patient?.bill_id ?? patient?.uhid}`;

// Safely extracts YYYY-MM-DD from ISO datetime or local string
const extractWardDate = (dateVal) => {
  if (!dateVal) return "";
  if (typeof dateVal === "string" && dateVal.includes("T")) {
    return dateVal.split("T")[0];
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-CA");
  } catch {
    return "";
  }
};

// Returns Selling_Price in place of Unit Price, with fallbacks to price and mrp
const getUnitPrice = (item) => {
  if (!item) return 0;
  // 1. Selling_Price or selling_price
  const sp = item.Selling_Price !== undefined ? item.Selling_Price : item.selling_price;
  if (sp !== undefined && sp !== null && sp !== "") {
    const num = Number(sp);
    if (!isNaN(num) && num > 0) return num;
  }
  // 2. Direct price
  if (item.price !== undefined && item.price !== null && item.price !== "") {
    const num = Number(item.price);
    if (!isNaN(num) && num > 0) return num;
  }
  // 3. MRP
  if (item.mrp !== undefined && item.mrp !== null && item.mrp !== "") {
    const num = Number(item.mrp);
    if (!isNaN(num) && num > 0) return num;
  }
  // 4. Zero value if explicitly numeric
  if (sp !== undefined && sp !== null && !isNaN(Number(sp))) {
    return Number(sp);
  }
  return 0;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const MedicineChart = ({ onConvertToBill, onCountChange }) => {
  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-CA");
  }, []);
  const last7Str = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toLocaleDateString("en-CA");
  }, []);

  const [medicineData, setMedicineData]       = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [expandedKey, setExpandedKey]         = useState(null);
  // Initially set to current date (today)
  const [fromDate, setFromDate]               = useState(todayStr);
  const [toDate, setToDate]                   = useState(todayStr);
  const [searchQuery, setSearchQuery]         = useState("");
  const [activeFilter, setActiveFilter]       = useState("All"); // All, Pending, Processing, Insurance, General
  const [printPatient, setPrintPatient]       = useState(null);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // ── Format & Calculation Helpers (matching screenshots) ──
  const formatDateTime = (dateVal) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, "0");
      return `${day}/${month}/${year} · ${strHours}:${minutes} ${ampm}`;
    } catch {
      return String(dateVal);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPatientInitials = (patient) => {
    const name = patient?.patient_details?.patient_name || patient?.patient_name || "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "PT";
    const titles = ["mr", "mr.", "mrs", "mrs.", "ms", "ms.", "dr", "dr.", "master", "baby"];
    const nonTitleParts = titles.includes(parts[0].toLowerCase()) ? parts.slice(1) : parts;
    if (nonTitleParts.length === 0) return parts[0].slice(0, 2).toUpperCase();
    if (nonTitleParts.length === 1) return nonTitleParts[0][0].toUpperCase();
    return (nonTitleParts[0][0] + nonTitleParts[nonTitleParts.length - 1][0]).toUpperCase();
  };

  const getPatientFinancials = (patient) => {
    const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];
    const prescriptionTotal = items.reduce((sum, it) => {
      const rate = getUnitPrice(it);
      const q = Number(it.qty ?? it.quantity ?? 1) || 1;
      return sum + rate * q;
    }, 0);

    const advance = Number(patient?.total_ip_advance || 0);
    const remaining = advance - prescriptionTotal;

    return {
      itemsCount: items.length,
      prescriptionTotal,
      advance,
      remaining,
    };
  };

  const getItemDotColor = (item) => {
    if (item?.is_substitute) return "#2563eb";
    if (item?.is_emergency) return "#dc2626";
    if (item?.is_consumable_items) return "#ea580c";
    if (item?.is_insurance_covered) return "#16a34a";
    return "#6b7280";
  };

  const getItemTypeName = (item) => {
    if (item?.is_substitute) return "Substitute";
    if (item?.is_emergency) return "Emergency";
    if (item?.is_consumable_items) return "Consumable";
    return "Regular";
  };

  // Substitute modal
  const [substituteModal, setSubstituteModal] = useState(null);
  const [substSearch, setSubstSearch]         = useState("");
  const [substSelected, setSubstSelected]     = useState(null);
  const [substDropOpen, setSubstDropOpen]     = useState(false);
  const [medicines, setMedicines]             = useState([]);
  const [substLoading, setSubstLoading]       = useState(false);

  const HmsBaseUrl = Hmsbaseurl;

  // ─── Patient details fetcher ──────────────────────────────────────────────
  const fetchPatientDetails = async (uhid) => {
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}patient_details/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );
      const resBody = res.data ?? res;
      const list = res.success
        ? Array.isArray(resBody?.data) ? resBody.data
          : Array.isArray(resBody) ? resBody : []
        : [];
      return list.length > 0 ? list[0] : null;
    } catch { return null; }
  };

  // ─── Admission details fetcher ────────────────────────────────────────────
  const fetchAdmissionDetails = async (uhid) => {
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}admissionstatus/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );
      if (!res.success) return null;
      const admitted = res.data?.admitted ?? res.admitted ?? false;
      if (!admitted) return { admitted: false };

      const admData         = res.data?.data ?? res.data ?? {};
      const roomDetails     = admData?.room_details;
      const shiftingDetails = admData?.roomShitingDetails;
      const activeFromRoom  = Array.isArray(roomDetails)
        ? roomDetails.find(r => r.is_roomActive === true) : null;
      const activeFromShift = Array.isArray(shiftingDetails)
        ? shiftingDetails.find(r => r.is_roomActive === true) : null;

      let roomLabel = "";
      if (activeFromRoom) {
        roomLabel = `${activeFromRoom.roomNo} / Bed ${activeFromRoom.bedNo}`;
      } else if (activeFromShift) {
        roomLabel = `${activeFromShift.newRoomNo} / Bed ${activeFromShift.newBedNo}`;
      }

      const rawCustType = admData?.customer_type || "General";
      const is_insurance = String(rawCustType).trim().toLowerCase() === "insurance";
      const advance_payments = Array.isArray(admData?.advance_payments) ? admData.advance_payments : [];
      const total_ip_advance = advance_payments.reduce((sum, ap) => {
        if (
          ap &&
          ap.is_advanceActive !== false &&
          String(ap.status || "").toLowerCase() !== "cancelled" &&
          !ap.is_refund
        ) {
          return sum + (Number(ap.ip_advance) || 0);
        }
        return sum;
      }, 0);

      return {
        admitted:          true,
        ipNumber:          admData?.ipNumber         || "",
        admissionDateTime: admData?.admissionDateTime || "",
        admittingDoctor:   admData?.admittingDoctor   || "",
        consultingDoctor:  admData?.consultingDoctor  || "",
        customer_type:     rawCustType,
        is_insurance,
        insurance_company: admData?.insurance_company || "",
        advance_payments,
        total_ip_advance,
        roomLabel,
      };
    } catch { return null; }
  };

  const calcAge = (dob) => {
    if (!dob) return "";
    const d = new Date(dob);
    const today = new Date();
    let years  = today.getFullYear() - d.getFullYear();
    let months = today.getMonth()    - d.getMonth();
    let days   = today.getDate()     - d.getDate();
    if (days   < 0) { months -= 1; days  += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years  -= 1; months += 12; }
    return `${years}Y ${months}M ${days}D`;
  };

  // ─── Fetch main chart data ────────────────────────────────────────────────
  // ─── Fetch main chart data (instantly loaded from pre-enriched backend API) ─
  const fetchMedicineChart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {};
      if (fromDate) payload.from_date = fromDate;
      if (toDate) payload.to_date = toDate;

      const response = await apiRequest(
        `${Hmsbaseurl}pharmacy_medicinechart/`,
        "POST",
        payload
      );

      if (!response.success) {
        setError(response.error || "Failed to load data.");
        return;
      }

      const rawList = response.data?.data || [];
      setMedicineData(rawList);
      if (typeof onCountChange === "function") {
        onCountChange(rawList.length);
      }
    } catch (err) {
      console.error("Error fetching medicine chart:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [Hmsbaseurl, fromDate, toDate, onCountChange]);

  useEffect(() => {
    fetchMedicineChart();
  }, [fetchMedicineChart]);

  // ─── Fast search-as-you-type stock lookup for substitute modal (>= 2 chars) ──
  const fetchMedicines = useCallback(async (query) => {
    const q = (query || "").trim();
    if (!HmsBaseUrl || q.length < 2) {
      setMedicines([]);
      setSubstLoading(false);
      return;
    }
    try {
      setSubstLoading(true);
      const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_stock/`, "POST", { search: q });
      const medicineArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data) ? response.data.data : [];
      if (response.success) {
        const formatted = medicineArray.map((item) => ({
          name:            item.item_name || "",
          item_id:         item.item_id,
          batch_number:    item.batch_number  || "N/A",
          expiry_date:     item.expiry_date   || "N/A",
          mrp:             parseFloat(item.Selling_Price ?? item.selling_price ?? item.price ?? item.mrp ?? 0),
          price:           parseFloat(item.Selling_Price ?? item.selling_price ?? item.price ?? item.mrp ?? 0),
          available_stock: item.available_stock != null ? Number(item.available_stock) : 0,
          category:        item.category || "",
        }));
        const seen = new Set();
        const unique = formatted.filter(m => {
          if (seen.has(m.item_id)) return false;
          seen.add(m.item_id);
          return true;
        });
        setMedicines(unique);
      } else {
        setMedicines([]);
      }
    } catch (err) {
      console.error("Error fetching medicines for substitute:", err);
      setMedicines([]);
    } finally {
      setSubstLoading(false);
    }
  }, [HmsBaseUrl]);

  // Debounced search when typing at least 2 characters in substitute modal
  useEffect(() => {
    const q = substSearch.trim();
    if (q.length >= 2) {
      const timer = setTimeout(() => {
        fetchMedicines(q);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setMedicines([]);
    }
  }, [substSearch, fetchMedicines]);

  // ─── Filter based strictly on ward_request_date ───────────────────────────
  const dateFilteredData = useMemo(() => {
    return medicineData.filter((patient) => {
      if (!fromDate && !toDate) return true;
      const raw = patient.ward_request_date || patient.created_date;
      const wardDate = extractWardDate(raw);
      if (fromDate && (!wardDate || wardDate < fromDate)) return false;
      if (toDate   && (!wardDate || wardDate > toDate))   return false;
      return true;
    });
  }, [medicineData, fromDate, toDate]);

  // ─── Computed Statistics for KPI cards (reflecting active date range) ──────
  const stats = useMemo(() => {
    const total = dateFilteredData.length;
    let pending = 0;
    let processing = 0;
    let insuranceCount = 0;
    let totalAdvance = 0;

    dateFilteredData.forEach((p) => {
      if (p.billing_status === "Pending") pending += 1;
      if (p.billing_status === "Processing") processing += 1;
      if (p.is_insurance) insuranceCount += 1;
      totalAdvance += Number(p.total_ip_advance || 0);
    });

    return { total, pending, processing, insuranceCount, totalAdvance };
  }, [dateFilteredData]);

  // ─── Filtered Data (by status tabs and search query) ──────────────────────
  const filteredData = useMemo(() => {
    return dateFilteredData.filter((patient) => {
      // 1. Active Tab Filter
      if (activeFilter === "Pending" && patient.billing_status !== "Pending") return false;
      if (activeFilter === "Processing" && patient.billing_status !== "Processing") return false;
      if (activeFilter === "Insurance" && !patient.is_insurance) return false;
      if (activeFilter === "General" && patient.is_insurance) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pName   = (patient.patient_details?.patient_name || patient.patient_name || "").toLowerCase();
        const uhid    = String(patient.uhid || "").toLowerCase();
        const ipNo    = String(patient.inpatient_number || patient.ip_number || "").toLowerCase();
        const ward    = String(patient.ward_name || patient.room_no || "").toLowerCase();
        const doc     = String(patient.doctor_name || "").toLowerCase();
        const mobile  = String(patient.patient_details?.mobile || patient.mobile || "").toLowerCase();
        const company = String(patient.insurance_company || "").toLowerCase();

        return (
          pName.includes(q) ||
          uhid.includes(q) ||
          ipNo.includes(q) ||
          ward.includes(q) ||
          doc.includes(q) ||
          mobile.includes(q) ||
          company.includes(q)
        );
      }

      return true;
    });
  }, [dateFilteredData, activeFilter, searchQuery]);

  // Date range presets helper
  const handleSetDatePreset = (preset) => {
    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      setFromDate(yesterdayStr);
      setToDate(yesterdayStr);
    } else if (preset === "last7") {
      setFromDate(last7Str);
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("");
      setToDate("");
    }
  };

  const handleToggleMedicines = (key) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  // ─── Convert to Bill action ────────────────────────────────────────────────
  const handleConvertToBillSafe = useCallback(async (patient, e) => {
    if (e) e.stopPropagation();
    if (typeof onConvertToBill !== "function") return;

    const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];
    if (items.length === 0) {
      alert(`No medicine items found for ${patient?.patient_details?.patient_name || patient?.uhid || "this patient"}.`);
      return;
    }

    const billId = patient.Bill_id ?? patient.bill_id ?? null;

    try {
      const res = await apiRequest(`${HmsBaseUrl}convert_to_bill/`, "POST", { Bill_id: billId });
      if (!res.success) console.error("convert_to_bill API error:", res.error);
    } catch (err) {
      console.error("convert_to_bill API failed:", err);
    }

    setMedicineData(prev =>
      prev.map(p =>
        (p.Bill_id ?? p.bill_id) === billId
          ? { ...p, billing_status: "Processing" }
          : p
      )
    );

    // Ensure selling price is provided in place of unit price & mrp for the billing screen
    const normalizedItems = items.map(it => {
      const up = getUnitPrice(it);
      const resName =
        (it.item_name && !String(it.item_name).startsWith("Item #") ? it.item_name : null) ||
        (it.medicine_name && !String(it.medicine_name).startsWith("Item #") ? it.medicine_name : null) ||
        (it.name && !String(it.name).startsWith("Item #") ? it.name : null) ||
        it.item_name || it.medicine_name || it.name || "";
      return {
        ...it,
        item_name: resName,
        medicine_name: resName,
        price: up,
        mrp: up > 0 ? up : (Number(it.mrp) || 0),
        selling_price: up,
        Selling_Price: up,
      };
    });

    onConvertToBill({ ...patient, medicine_items: normalizedItems });
  }, [onConvertToBill, HmsBaseUrl]);

  // ─── Substitute Medicine Modal Handlers ────────────────────────────────────
  const openSubstituteModal = (patient, item, e) => {
    if (e) e.stopPropagation();
    setSubstituteModal({
      billId:           patient.Bill_id ?? patient.bill_id,
      originalItemId:   item.item_id,
      originalItemName: item.item_name || item.medicine_name || "",
      originalItem:     item,
    });
    setSubstSearch("");
    setSubstSelected(null);
    setSubstDropOpen(false);
    setMedicines([]);
  };

  const handleSubstituteConfirm = async () => {
    if (!substSelected || !substituteModal) return;

    const { billId, originalItemId, originalItem } = substituteModal;
    if (!originalItem) {
      setSubstituteModal(null);
      return;
    }

    const substituteItemPayload = {
      item_id:         substSelected.item_id,
      item_name:       substSelected.name,
      batch_number:    substSelected.batch_number || originalItem.batch_number || "",
      qty:             originalItem.qty      ?? originalItem.quantity ?? 0,
      quantity:        originalItem.qty      ?? originalItem.quantity ?? 0,
      noOfDays:        originalItem.noOfDays  || "",
      dosage:          originalItem.dosage    || "",
      dose:            originalItem.dose      || "",
      doseUnit:        originalItem.doseUnit  || "",
      route:           originalItem.route     || "",
      remark:          originalItem.remark    || "",
      is_substitute:   true,
      available_stock: substSelected.available_stock ?? 9999,
      mrp:             substSelected.mrp ?? originalItem.mrp ?? 0,
      price:           substSelected.mrp ?? originalItem.price ?? 0,
      CGST_Percentage: originalItem.CGST_Percentage ?? 0,
      SGST_Percentage: originalItem.SGST_Percentage ?? 0,
      CGST_Amt:        originalItem.CGST_Amt ?? 0,
      SGST_Amt:        originalItem.SGST_Amt ?? 0,
    };

    setMedicineData(prev =>
      prev.map(patient => {
        if ((patient.Bill_id ?? patient.bill_id) !== billId) return patient;
        const updatedItems = (patient.medicine_items || []).map(item =>
          item.item_id === originalItemId ? substituteItemPayload : item
        );
        return { ...patient, medicine_items: updatedItems };
      })
    );

    setSelectedPatientModal(prev => {
      if (!prev || (prev.Bill_id ?? prev.bill_id) !== billId) return prev;
      const updatedItems = (prev.medicine_items || []).map(item =>
        item.item_id === originalItemId ? substituteItemPayload : item
      );
      return { ...prev, medicine_items: updatedItems };
    });

    try {
      const res = await apiRequest(`${HmsBaseUrl}substitute_medicine/`, "POST", {
        Bill_id:         billId,
        item_id:         originalItemId,
        batch_number:    originalItem.batch_number || "",
        substitute_item: substituteItemPayload,
      });
      if (!res.success) console.error("Substitute API error:", res.error);
    } catch (err) {
      console.error("Substitute API failed:", err);
    }

    setSubstituteModal(null);
  };

  const substSuggestions = useMemo(() => {
    const q = substSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    const startsWith = [];
    const others = [];
    for (const med of medicines) {
      const name = (med.name || "").toLowerCase();
      if (name.startsWith(q)) {
        startsWith.push(med);
      } else if (name.includes(` ${q}`) || name.includes(`-${q}`)) {
        others.push(med);
      }
    }
    return startsWith.length > 0 ? startsWith : others;
  }, [substSearch, medicines]);

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        {/* ── Top Header (matching Screenshot 2) ── */}
        <HeaderContainer>
          <HeaderLeft>
            <HeaderTitleGroup>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <HeaderTitle style={{ fontSize: "1.35rem" }}>Medicine Chart</HeaderTitle>
                <HeaderBadge style={{ background: "#dcfce7", color: "#0f766e", border: "1px solid #bbf7d0", textTransform: "none", fontSize: "0.74rem", padding: "3px 10px", borderRadius: 9999 }}>
                  Ward prescriptions
                </HeaderBadge>
              </div>
              <HeaderSubtitle style={{ marginTop: 3, fontSize: "0.82rem", color: "#64748b" }}>
                Review ward requests, check IP advance and convert to bill.
              </HeaderSubtitle>
            </HeaderTitleGroup>
          </HeaderLeft>

          <ControlsRight>
            <DatePresetGroup>
              <DatePresetBtn
                type="button"
                $active={fromDate === todayStr && toDate === todayStr}
                onClick={() => handleSetDatePreset("today")}
                title="Show only today's ward requests"
              >
                Today
              </DatePresetBtn>
              <DatePresetBtn
                type="button"
                $active={fromDate === yesterdayStr && toDate === yesterdayStr}
                onClick={() => handleSetDatePreset("yesterday")}
                title="Show yesterday's ward requests"
              >
                Yesterday
              </DatePresetBtn>
              <DatePresetBtn
                type="button"
                $active={fromDate === last7Str && toDate === todayStr}
                onClick={() => handleSetDatePreset("last7")}
                title="Show last 7 days ward requests"
              >
                Last 7 days
              </DatePresetBtn>
              <DatePresetBtn
                type="button"
                $active={!fromDate && !toDate}
                onClick={() => handleSetDatePreset("all")}
                title="Show all requests across all dates"
              >
                All dates
              </DatePresetBtn>
            </DatePresetGroup>

            <DateRangePill>
              <Calendar size={15} color={T.slateMuted} />
              <DateInput
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                placeholder="From"
                title="From Ward Request Date"
              />
              <DateSep>to</DateSep>
              <DateInput
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                placeholder="To"
                title="To Ward Request Date"
              />
              <Calendar size={15} color={T.slateMuted} />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => { setFromDate(""); setToDate(""); }}
                  title="Clear date filter (show all dates)"
                  style={{ background: "none", border: "none", color: T.slateMuted, cursor: "pointer", padding: "0 2px", display: "flex", alignItems: "center" }}
                >
                  <X size={14} />
                </button>
              )}
            </DateRangePill>

            <RefreshButton onClick={fetchMedicineChart} disabled={loading}>
              {loading ? <SpinIcon size={15} /> : <RefreshCw size={15} />}
              Refresh
            </RefreshButton>
          </ControlsRight>
        </HeaderContainer>

        {/* ── Search & Segment Filter Bar (matching Screenshot 2) ── */}
        <FilterBarCard>
          <SearchInputWrap>
            <Search size={16} color="#94a3b8" />
            <CleanSearchInput
              type="text"
              placeholder="Search patient, UHID, IP number, room or doctor"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 4px" }}
              >
                <X size={14} />
              </button>
            )}
          </SearchInputWrap>

          <SegmentPillsWrap>
            {[
              { id: "All", label: "All", count: stats.total },
              { id: "Pending", label: "Pending", count: stats.pending },
              { id: "Processing", label: "Processing", count: stats.processing },
              { id: "Insurance", label: "Insurance", count: stats.insuranceCount },
              { id: "General", label: "General", count: stats.total - stats.insuranceCount },
            ].map(tab => (
              <SegmentPillBtn
                key={tab.id}
                type="button"
                $active={activeFilter === tab.id}
                onClick={() => setActiveFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="badge">{tab.count}</span>
              </SegmentPillBtn>
            ))}
          </SegmentPillsWrap>
        </FilterBarCard>

        {/* ── Prescription Meta Row ── */}
        <PrescriptionMetaRow>
          <span>Showing {filteredData.length} of {medicineData.length} prescriptions</span>
          <span>Click a patient to see medicines</span>
        </PrescriptionMetaRow>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem" }}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

                {/* ── Prescription Cards List (matching Screenshot 2) ── */}
        <PrescriptionCardsList>
          {loading ? (
            <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "48px 20px", textAlign: "center", color: "#0f766e" }}>
              <SpinIcon size={24} />
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: "0.85rem" }}>Loading medicine charts…</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "48px 20px", textAlign: "center", color: "#64748b" }}>
              <Pill size={36} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>No prescriptions found</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 4 }}>
                {medicineData.length > 0 ? "Try adjusting your search or filters" : "No ward prescriptions awaiting dispense"}
              </div>
            </div>
          ) : (
            filteredData.map(patient => {
              const billKey = getBillKey(patient);
              const { itemsCount, prescriptionTotal, advance } = getPatientFinancials(patient);
              const initials = getPatientInitials(patient);
              const pName = patient.patient_details?.patient_name || patient.patient_name || "—";
              const uhid = patient.uhid || "—";
              const ipNo = patient.inpatient_number || patient.ip_number || "—";
              const ward = patient.ward_name || patient.room_no || "—";
              const dateFormatted = formatDateTime(patient.ward_request_date || patient.created_date);
              const isInsurance = Boolean(
                patient.is_insurance ||
                String(patient.customer_type || "").toLowerCase() === "insurance" ||
                patient.insurance_company
              );
              const insCompany = patient.insurance_company || patient.patient_details?.insurance_company || "";
              const custType = isInsurance
                ? (insCompany ? `Insurance (${insCompany})` : "Insurance")
                : (patient.customer_type || "General");

              return (
                <PrescriptionCard
                  key={billKey}
                  onClick={() => setSelectedPatientModal(patient)}
                >
                  <div style={{ minWidth: 260 }}>
                    <CardPatientName>{pName}</CardPatientName>
                    <CardPatientSubtext>
                      UHID {uhid} &nbsp; IP {ipNo}
                    </CardPatientSubtext>
                  </div>

                  <div style={{ minWidth: 150 }}>
                    <CardRoomTitle>Room {ward}</CardRoomTitle>
                    <CardDateSubtext>{dateFormatted}</CardDateSubtext>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <CardItemsTitle>
                      {itemsCount} {itemsCount === 1 ? "item" : "items"} · ₹{formatCurrency(prescriptionTotal)}
                    </CardItemsTitle>
                    <CardAdvanceSubtext>
                      {custType} · Adv ₹{formatCurrency(advance)}
                    </CardAdvanceSubtext>
                  </div>

                  <StatusPill $status={patient.billing_status || "Pending"}>
                    <span className="dot" />
                    {patient.billing_status || "Pending"}
                  </StatusPill>

                  <CardPrintBtn
                    type="button"
                    title="Print Prescription"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrintPatient(patient);
                    }}
                  >
                    <Printer size={15} />
                  </CardPrintBtn>

                  <CardViewBtn
                    type="button"
                    title="View Items"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatientModal(patient);
                    }}
                  >
                    <Eye size={14} />
                    View Items
                  </CardViewBtn>

                  <div style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
                    <ChevronDown size={16} />
                  </div>
                </PrescriptionCard>
              );
            })
          )}
        </PrescriptionCardsList>

        {/* ── Bottom Legend (matching Screenshot 2) ── */}
        <BottomLegendWrap>
          <LegendEntry>
            <span className="dot" style={{ background: "#6b7280" }} /> Regular
          </LegendEntry>
          <LegendEntry>
            <span className="dot" style={{ background: "#2563eb" }} /> Substitute given
          </LegendEntry>
          <LegendEntry>
            <span className="dot" style={{ background: "#dc2626" }} /> Emergency
          </LegendEntry>
          <LegendEntry>
            <span className="dot" style={{ background: "#16a34a" }} /> Insurance covered
          </LegendEntry>
          <LegendEntry>
            <span className="dot" style={{ background: "#ea580c" }} /> Consumable (patient payable)
          </LegendEntry>
        </BottomLegendWrap>
      </PageContainer>

      
      {/* ── Patient Detail Modal (matching Screenshot 1) ── */}
      {selectedPatientModal && createPortal(
        <ModalOverlay onClick={() => setSelectedPatientModal(null)}>
          <DetailModalBox onClick={e => e.stopPropagation()}>
            {(() => {
              const patient = selectedPatientModal;
              const { itemsCount, prescriptionTotal, advance, remaining } = getPatientFinancials(patient);
              const initials = getPatientInitials(patient);
              const pName = patient.patient_details?.patient_name || patient.patient_name || "—";
              const uhid = patient.uhid || "—";
              const ipNo = patient.inpatient_number || patient.ip_number || "—";
              const ward = patient.ward_name || patient.room_no || "—";
              const dateFormatted = formatDateTime(patient.ward_request_date || patient.created_date);
              const doctorName = patient.doctor_name
                ? (patient.doctor_name.toLowerCase().startsWith("dr") ? patient.doctor_name : `Dr. ${patient.doctor_name}`)
                : "Dr. Murugavel R";
              const contact = patient.patient_details?.mobile || patient.mobile || patient.contact || "—";
              const items = Array.isArray(patient.medicine_items) ? patient.medicine_items : [];
              const isModalInsurance = Boolean(
                patient.is_insurance ||
                String(patient.customer_type || "").toLowerCase() === "insurance" ||
                patient.insurance_company
              );
              const modalInsCompany = patient.insurance_company || patient.patient_details?.insurance_company || "";

              return (
                <>
                  <DetailModalHeader>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                          {pName}
                        </span>
                        <StatusPill $status={patient.billing_status || "Pending"}>
                          <span className="dot" />
                          {patient.billing_status || "Pending"}
                        </StatusPill>
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap", letterSpacing: "0.01em" }}>
                        <span>UHID {uhid}</span>
                        <span>IP {ipNo}</span>
                        <span>Room {ward}</span>
                        <span>{dateFormatted}</span>
                        {isModalInsurance && modalInsCompany && (
                          <span style={{ color: "#047857", fontWeight: 700 }}>
                            🛡️ {modalInsCompany}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatientModal(null)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </DetailModalHeader>

                  <PatientSummaryStrip>
                    <StripCell>
                      <StripLabel>Admitting doctor</StripLabel>
                      <StripVal>{doctorName}</StripVal>
                    </StripCell>
                    <StripCell>
                      <StripLabel>Contact</StripLabel>
                      <StripVal>{contact}</StripVal>
                    </StripCell>
                    <StripCell>
                      <StripLabel>Prescription total</StripLabel>
                      <StripVal>₹{formatCurrency(prescriptionTotal)}</StripVal>
                    </StripCell>
                    <StripCell>
                      <StripLabel>Available IP advance</StripLabel>
                      <StripVal>₹{formatCurrency(advance)}</StripVal>
                    </StripCell>
                    <StripCell>
                      <StripLabel style={{ color: "#0f766e" }}>Remaining after deduction</StripLabel>
                      <StripVal $color="#0f766e">₹{formatCurrency(remaining)}</StripVal>
                    </StripCell>
                  </PatientSummaryStrip>

                  <ModalTableContainer>
                    <DetailTable>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Type</th>
                          <th style={{ textAlign: "center" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Unit ₹</th>
                          <th style={{ textAlign: "right" }}>Amount ₹</th>
                          <th>Stock</th>
                          <th>Dosage</th>
                          <th>Requested</th>
                          <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: "center", padding: "28px", color: "#94a3b8" }}>
                              No medicine items in this prescription.
                            </td>
                          </tr>
                        ) : (
                          items.map((item, idx) => {
                            const q = Number(item.qty ?? item.quantity ?? 1) || 1;
                            const unitPrice = getUnitPrice(item);
                            const amount = q * unitPrice;
                            const stock = item.available_stock;
                            const isOutOfStock = stock !== undefined && stock !== null && Number(stock) <= 0;
                            const dotColor = getItemDotColor(item);
                            const typeName = getItemTypeName(item);
                            const requestedTime = formatDateTime(item.ward_request_date || patient.ward_request_date || patient.created_date);

                            return (
                              <tr key={item.item_id || idx}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                                    <span style={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
                                      {item.item_name || item.medicine_name || `Item #${idx + 1}`}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ color: "#475569" }}>{typeName}</td>
                                <td style={{ textAlign: "center", fontWeight: 600 }}>{q}</td>
                                <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                                  {formatCurrency(unitPrice)}
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                  {formatCurrency(amount)}
                                </td>
                                <td>
                                  {stock !== undefined && stock !== null ? (
                                    <span style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      color: isOutOfStock ? "#dc2626" : "#0f766e"
                                    }}>
                                      {isOutOfStock ? "Out of stock" : `${stock} in stock`}
                                    </span>
                                  ) : (
                                    <span style={{ color: "#94a3b8" }}>—</span>
                                  )}
                                </td>
                                <td style={{ color: "#475569" }}>{item.dosage || item.dose || "—"}</td>
                                <td style={{ fontSize: "0.73rem", color: "#64748b" }}>{requestedTime}</td>
                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => openSubstituteModal(patient, item, e)}
                                    style={{
                                      background: "#ffffff",
                                      border: "1px solid #e2e8f0",
                                      color: "#334155",
                                      borderRadius: 6,
                                      padding: "4px 12px",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                      cursor: "pointer"
                                    }}
                                  >
                                    Substitute
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </DetailTable>
                  </ModalTableContainer>

                  <DetailModalFooter>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                      {itemsCount} {itemsCount === 1 ? "item" : "items"} · Total ₹{formatCurrency(prescriptionTotal)}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientModal(null);
                          setPrintPatient(patient);
                        }}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "8px 18px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#334155",
                          cursor: "pointer"
                        }}
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          setSelectedPatientModal(null);
                          handleConvertToBillSafe(patient, e);
                        }}
                        style={{
                          background: "#0f766e",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 20px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Convert to bill
                      </button>
                    </div>
                  </DetailModalFooter>
                </>
              );
            })()}
          </DetailModalBox>
        </ModalOverlay>,
        document.body
      )}

      {/* ── Substitute Medicine Modal ── */}
      {substituteModal && createPortal(
        <ModalOverlay onClick={() => setSubstituteModal(null)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Repeat size={18} />
                Substitute Medicine
              </ModalTitle>
              <ModalCloseBtn onClick={() => setSubstituteModal(null)}>✕</ModalCloseBtn>
            </ModalHeader>
            <ModalBody>
              <div style={{ background: "#f8fafc", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: "0.83rem", color: T.slateMid }}>
                <span style={{ color: T.slateMuted, fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 3 }}>
                  Replacing Prescription Item
                </span>
                <span style={{ fontWeight: 800, color: T.slateDark, fontSize: "0.95rem" }}>
                  {substituteModal.originalItemName || `Item ID ${substituteModal.originalItemId}`}
                </span>
              </div>

              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: T.slateMid, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Search Available Replacement
                {substLoading && (
                  <span style={{ marginLeft: 8, fontSize: "0.72rem", color: T.primary, textTransform: "none", fontWeight: 600 }}>
                    (Searching pharmacy stock...)
                  </span>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <SearchInput
                  type="text"
                  autoComplete="off"
                  placeholder="Type at least 2 letters to search pharmacy stock…"
                  value={substSearch}
                  onChange={e => {
                    const val = e.target.value;
                    setSubstSearch(val);
                    setSubstDropOpen(true);
                    if (!val) setSubstSelected(null);
                  }}
                  onFocus={() => substSearch.trim().length >= 2 && setSubstDropOpen(true)}
                  style={{ background: "#fff", paddingLeft: 14 }}
                />
                {substDropOpen && substSearch.trim().length >= 2 && (
                  <DropdownList>
                    {substLoading ? (
                      <div style={{ padding: "12px 14px", fontSize: "0.82rem", color: T.slateMuted, display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" style={{ width: 14, height: 14 }}></span>
                        <span>Searching available stock...</span>
                      </div>
                    ) : substSuggestions.length > 0 ? (
                      substSuggestions.map((med, idx) => (
                        <DropdownItem
                          key={`${med.item_id}-${idx}`}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setSubstSelected(med);
                            setSubstSearch(med.name);
                            setSubstDropOpen(false);
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{med.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.primary }}>
                            Stock: {med.available_stock}
                          </span>
                        </DropdownItem>
                      ))
                    ) : (
                      <div style={{ padding: "12px 14px", fontSize: "0.82rem", color: T.slateMuted }}>
                        No medicines in stock matching &quot;{substSearch.trim()}&quot;
                      </div>
                    )}
                  </DropdownList>
                )}
              </div>

              {substSelected && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, padding: "8px 16px", background: "#f0fdfa", border: "1.5px solid #99f6e4", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, color: "#0f766e" }}>
                  <Pill size={15} />
                  <span>{substSelected.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.slateMuted }}>
                    (₹{substSelected.mrp} • Stock {substSelected.available_stock})
                  </span>
                  <button
                    onClick={() => { setSubstSelected(null); setSubstSearch(""); }}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", marginLeft: 4, display: "flex", alignItems: "center" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <SecondaryBtn onClick={() => setSubstituteModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn disabled={!substSelected} onClick={handleSubstituteConfirm}>
                <Repeat size={15} />
                Confirm Substitute
              </PrimaryBtn>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>,
        document.body
      )}

      {/* ── Print Prescription Modal ── */}
      {printPatient && (() => {
        const p = printPatient;
        const items = Array.isArray(p?.medicine_items) ? p.medicine_items : [];
        const wardReqRaw = p.ward_request_date || p.created_date;
        let wardDateStr = "—", wardTimeStr = "—";
        if (wardReqRaw) {
          const d = new Date(wardReqRaw);
          wardDateStr = d.toLocaleDateString("en-GB");
          wardTimeStr = d.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
          });
        }

        const isInsurance = Boolean(p.is_insurance || String(p.customer_type || '').toLowerCase() === 'insurance');
        const custTypeLabel = isInsurance
          ? `INSURANCE${p.insurance_company ? ` - ${p.insurance_company}` : ""}`
          : "GENERAL";

        const totalPrescriptionAmount = items.reduce((acc, it) => {
          const q = Number(it.qty ?? it.quantity ?? 0);
          const pr = getUnitPrice(it);
          return acc + (q * pr);
        }, 0);

        const consumablePayableAmount = items.reduce((acc, it) => {
          if (Boolean(it.is_consumable_items)) {
            const q = Number(it.qty ?? it.quantity ?? 0);
            const pr = getUnitPrice(it);
            return acc + (q * pr);
          }
          return acc;
        }, 0);

        const insuranceCoveredAmount = totalPrescriptionAmount - consumablePayableAmount;
        const availableIpAdvance = Number(p.total_ip_advance || 0);
        const amountDeductedFromAdvance = isInsurance
          ? Math.min(consumablePayableAmount, availableIpAdvance)
          : Math.min(totalPrescriptionAmount, availableIpAdvance);

        const remainingIpAdvance = isInsurance
          ? Math.max(0, availableIpAdvance - consumablePayableAmount)
          : Math.max(0, availableIpAdvance - totalPrescriptionAmount);

        const patientExcessToPay = isInsurance
          ? Math.max(0, consumablePayableAmount - availableIpAdvance)
          : Math.max(0, totalPrescriptionAmount - availableIpAdvance);

        const handlePrint = () => {
          const printWindow = window.open("", "_blank", "width=850,height=700");
          const html = `
            <html><head><title>Ward Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 24px; }
              .hosp-header { display: flex; align-items: flex-start; gap: 14px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 10px; }
              .hosp-name { font-size: 18px; font-weight: 800; color: #0f766e; }
              .hosp-sub { font-size: 12px; color: #666; }
              .section-title { background: #e5e7eb; text-align: right; padding: 4px 10px; font-weight: 700; font-size: 12px; margin-bottom: 10px; border-radius: 4px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-bottom: 10px; }
              .meta-row { display: flex; gap: 6px; font-size: 12px; }
              .meta-key { color: #666; min-width: 90px; }
              .meta-val { font-weight: 600; }
              .bold { font-weight: 700; margin-bottom: 4px; }
              .doctor { font-weight: 700; color: #0f766e; margin-bottom: 14px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { border: 1px solid #ccc; padding: 6px 8px; background: #f3f4f6; text-align: left; }
              td { border: 1px solid #e5e7eb; padding: 6px 8px; }
              .badge-payable { background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; border: 1px solid #fde68a; display: inline-block; }
              .badge-covered { background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; border: 1px solid #a7f3d0; display: inline-block; }
            </style></head><body>
            <div class="hosp-header">
              <div>
                <div class="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                <div class="hosp-sub">51/24, Saradha College Road, Salem - 636007</div>
                <div class="hosp-sub">Ph: 04272706666</div>
              </div>
            </div>
            <div class="section-title">** Ward Prescription Details</div>
            <div class="meta-grid">
              <div class="meta-row"><span class="meta-key">UHID</span><span>:</span><span class="meta-val">${p.uhid || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Age/Gender</span><span>:</span><span class="meta-val">${p.age || "—"} / ${p.gender || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Name</span><span>:</span><span class="meta-val">${p.patient_details?.patient_name || p.patient_name || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Req Ref</span><span>:</span><span class="meta-val">${p.Bill_id || p.bill_no || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Address</span><span>:</span><span class="meta-val">${p.patient_details?.address || p.address || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Ward Name</span><span>:</span><span class="meta-val">${p.ward_name || p.room_no || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Customer Type</span><span>:</span><span class="meta-val" style="color: ${isInsurance ? '#047857' : '#1e293b'}">${custTypeLabel}</span></div>
              <div class="meta-row"><span class="meta-key">IP Advance</span><span>:</span><span class="meta-val">₹${availableIpAdvance.toFixed(2)}</span></div>
            </div>
            <div class="bold">Ward Request Date: ${wardDateStr} &nbsp; ${wardTimeStr}</div>
            <div class="doctor">Dr. ${p.doctor_name || "—"}</div>
            <table>
              <thead>
                <tr>
                  <th>Sl</th>
                  <th>Brand / Item Name</th>
                  <th>Category / Payable</th>
                  <th>Dosage</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, i) => {
                  const isConsumable = Boolean(item.is_consumable_items);
                  const q = Number(item.qty ?? item.quantity ?? 0);
                  const unitPrice = getUnitPrice(item);
                  const lineAmt = (q * unitPrice).toFixed(2);
                  let badgeHtml = "";
                  if (isConsumable) {
                    badgeHtml = `<span class="badge-payable">PAYABLE (Consumable)</span>`;
                  } else if (isInsurance) {
                    badgeHtml = `<span class="badge-covered">Covered (Insurance)</span>`;
                  } else {
                    badgeHtml = `<span style="color: #64748b;">Regular</span>`;
                  }

                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${item.item_name || item.medicine_name || "—"}${item.is_substitute || item.substituted ? " (Substituted)" : ""}</td>
                      <td>${badgeHtml}</td>
                      <td>${item.dosage || item.dose || "—"}</td>
                      <td>${q}</td>
                      <td>₹${unitPrice.toFixed(2)}</td>
                      <td style="font-weight: 600;">₹${lineAmt}</td>
                      <td>${item.remark || ""}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>

            <div style="margin-top: 16px; border: 1.5px solid #0d9488; border-radius: 6px; padding: 12px 16px; background: #f0fdfa;">
              <div style="font-weight: 700; font-size: 12px; color: #0f766e; margin-bottom: 8px; border-bottom: 1px dashed #99f6e4; padding-bottom: 4px;">
                ${isInsurance ? "INSURANCE & IP ADVANCE BILLING BREAKDOWN" : "IP ADVANCE BILLING SUMMARY"}
              </div>
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="border: none; padding: 3px 0; color: #334155;">Total Prescription Amount:</td>
                  <td style="border: none; padding: 3px 0; text-align: right; font-weight: 700;">₹${totalPrescriptionAmount.toFixed(2)}</td>
                </tr>
                ${isInsurance ? `
                <tr>
                  <td style="border: none; padding: 3px 0; color: #047857;">Insurance Covered Amount (Non-Payable):</td>
                  <td style="border: none; padding: 3px 0; text-align: right; font-weight: 600; color: #047857;">₹${insuranceCoveredAmount.toFixed(2)}</td>
                </tr>
                <tr style="font-weight: 700; color: #b45309;">
                  <td style="border: none; padding: 3px 0;">Patient Payable Amount (Consumable Items):</td>
                  <td style="border: none; padding: 3px 0; text-align: right;">₹${consumablePayableAmount.toFixed(2)}</td>
                </tr>
                ` : ""}
                <tr style="border-top: 1px solid #cbd5e1;">
                  <td style="border: none; padding: 3px 0; color: #334155;">Available IP Advance:</td>
                  <td style="border: none; padding: 3px 0; text-align: right; font-weight: 600;">₹${availableIpAdvance.toFixed(2)}</td>
                </tr>
                <tr style="color: #0284c7; font-weight: 700;">
                  <td style="border: none; padding: 3px 0;">${isInsurance ? "Deducted for Consumable Items:" : "Deducted from IP Advance:"}</td>
                  <td style="border: none; padding: 3px 0; text-align: right;">- ₹${amountDeductedFromAdvance.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1.5px solid #0f766e; font-weight: 700; font-size: 13px;">
                  <td style="border: none; padding: 5px 0; color: #0f766e;">Remaining IP Advance Balance:</td>
                  <td style="border: none; padding: 5px 0; text-align: right; color: #0f766e;">₹${remainingIpAdvance.toFixed(2)}</td>
                </tr>
                ${patientExcessToPay > 0 ? `
                <tr style="color: #dc2626; font-weight: 700;">
                  <td style="border: none; padding: 3px 0;">Excess Payable by Patient (Advance Exceeded):</td>
                  <td style="border: none; padding: 3px 0; text-align: right;">₹${patientExcessToPay.toFixed(2)}</td>
                </tr>
                ` : ""}
              </table>
            </div>
          </body></html>`;
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        };

        return createPortal(
          <ModalOverlay onClick={() => setPrintPatient(null)}>
            <ModalBox style={{ width: 720 }} onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Printer size={18} />
                  Ward Prescription Details
                </ModalTitle>
                <ModalCloseBtn onClick={() => setPrintPatient(null)}>✕</ModalCloseBtn>
              </ModalHeader>
              <ModalBody style={{ maxHeight: "78vh", overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: `2px solid ${T.border}`, paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem" }}>
                    SH
                  </div>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f766e" }}>SHANMUGA HOSPITAL LIMITED</div>
                    <div style={{ fontSize: "0.76rem", color: T.slateMuted }}>51/24, Saradha College Road, Salem - 636007 • Ph: 04272706666</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: "0.82rem", marginBottom: 16 }}>
                  <div><strong style={{ color: T.slateMuted }}>UHID:</strong> {p.uhid || "—"}</div>
                  <div><strong style={{ color: T.slateMuted }}>Patient Name:</strong> {p.patient_details?.patient_name || p.patient_name || "—"}</div>
                  <div><strong style={{ color: T.slateMuted }}>Ward / Room:</strong> {p.ward_name || p.room_no || "—"}</div>
                  <div><strong style={{ color: T.slateMuted }}>IP Number:</strong> {p.inpatient_number || p.ip_number || "—"}</div>
                  <div><strong style={{ color: T.slateMuted }}>Customer Type:</strong> <span style={{ color: isInsurance ? "#047857" : T.slateDark, fontWeight: 700 }}>{custTypeLabel}</span></div>
                  <div><strong style={{ color: T.slateMuted }}>IP Advance:</strong> ₹{availableIpAdvance.toFixed(2)}</div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px", border: `1px solid ${T.border}` }}>Item Name</th>
                      <th style={{ padding: "8px 10px", border: `1px solid ${T.border}` }}>Type</th>
                      <th style={{ padding: "8px 10px", border: `1px solid ${T.border}` }}>Qty</th>
                      <th style={{ padding: "8px 10px", border: `1px solid ${T.border}` }}>Unit Price</th>
                      <th style={{ padding: "8px 10px", border: `1px solid ${T.border}` }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const isCons = Boolean(it.is_consumable_items);
                      const q = Number(it.qty ?? it.quantity ?? 0);
                      const unitPrice = getUnitPrice(it);
                      return (
                        <tr key={idx}>
                          <td style={{ padding: "7px 10px", border: `1px solid ${T.border}`, fontWeight: 600 }}>{it.item_name || it.medicine_name}</td>
                          <td style={{ padding: "7px 10px", border: `1px solid ${T.border}` }}>
                            {isCons ? <span style={{ color: "#c2410c", fontWeight: 700 }}>Consumable</span> : isInsurance ? <span style={{ color: "#15803d", fontWeight: 700 }}>Insurance</span> : "Regular"}
                          </td>
                          <td style={{ padding: "7px 10px", border: `1px solid ${T.border}` }}>{q}</td>
                          <td style={{ padding: "7px 10px", border: `1px solid ${T.border}` }}>₹{unitPrice.toFixed(2)}</td>
                          <td style={{ padding: "7px 10px", border: `1px solid ${T.border}`, fontWeight: 700 }}>₹{(q * unitPrice).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ background: "#f0fdfa", border: "1.5px solid #99f6e4", borderRadius: 8, padding: "12px 16px", fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: 800, color: "#0f766e", marginBottom: 6 }}>
                    {isInsurance ? "INSURANCE & IP ADVANCE BREAKDOWN" : "IP ADVANCE SUMMARY"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span>Total Prescription Amount:</span>
                    <strong>₹{totalPrescriptionAmount.toFixed(2)}</strong>
                  </div>
                  {isInsurance && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: "#15803d" }}>
                        <span>Insurance Covered (Non-Payable):</span>
                        <strong>₹{insuranceCoveredAmount.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: "#c2410c", fontWeight: 700 }}>
                        <span>Payable Consumable Amount:</span>
                        <strong>₹{consumablePayableAmount.toFixed(2)}</strong>
                      </div>
                    </>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, borderTop: "1px solid #cbd5e1", paddingTop: 4 }}>
                    <span>Available IP Advance:</span>
                    <span>₹{availableIpAdvance.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: "#0284c7", fontWeight: 700 }}>
                    <span>{isInsurance ? "Deducted for Consumables:" : "Deducted from IP Advance:"}</span>
                    <span>- ₹{amountDeductedFromAdvance.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#0f766e", borderTop: "1.5px solid #0f766e", paddingTop: 4 }}>
                    <span>Remaining IP Advance:</span>
                    <span>₹{remainingIpAdvance.toFixed(2)}</span>
                  </div>
                  {patientExcessToPay > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626", fontWeight: 800, marginTop: 4 }}>
                      <span>Excess Payable by Patient:</span>
                      <span>₹{patientExcessToPay.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <SecondaryBtn onClick={() => setPrintPatient(null)}>Close</SecondaryBtn>
                <PrimaryBtn onClick={handlePrint}>
                  <Printer size={15} />
                  Print Now
                </PrimaryBtn>
              </ModalFooter>
            </ModalBox>
          </ModalOverlay>,
          document.body
        );
      })()}
    </>
  );
};

export default MedicineChart;