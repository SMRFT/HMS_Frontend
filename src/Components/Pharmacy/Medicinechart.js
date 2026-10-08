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
  AlertTriangle
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

// ─── Stats Overview Grid ──────────────────────────────────────────────────────
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${T.surface};
  border-radius: 16px;
  border: 1px solid ${T.border};
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02), 0 8px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $color }) => $color || T.accent};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  }
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const StatLabel = styled.span`
  font-size: 0.73rem;
  font-weight: 700;
  color: ${T.slateMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const StatValue = styled.span`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${T.slateDark};
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.02em;
`;

const StatSubtext = styled.span`
  font-size: 0.72rem;
  color: ${T.slateMuted};
  font-weight: 500;
`;

const StatIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg || "#f0fdfa"};
  color: ${({ $color }) => $color || "#0d9488"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "Pending":
        return css`
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        `;
      case "Processing":
        return css`
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        `;
      case "Billed":
        return css`
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        `;
      case "Approved":
        return css`
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        `;
      case "Cancelled":
        return css`
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        `;
      default:
        return css`
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        `;
    }
  }}
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
const MedicineChart = ({ onConvertToBill }) => {
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
  // Default to today's date initially as requested
  const [fromDate, setFromDate]               = useState(todayStr);
  const [toDate, setToDate]                   = useState(todayStr);
  const [searchQuery, setSearchQuery]         = useState("");
  const [activeFilter, setActiveFilter]       = useState("All"); // All, Pending, Processing, Insurance, General
  const [printPatient, setPrintPatient]       = useState(null);

  // Substitute modal
  const [substituteModal, setSubstituteModal] = useState(null);
  const [substSearch, setSubstSearch]         = useState("");
  const [substSelected, setSubstSelected]     = useState(null);
  const [substDropOpen, setSubstDropOpen]     = useState(false);
  const [medicines, setMedicines]             = useState([]);

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
  const fetchMedicineChart = async () => {
    try {
      setLoading(true);
      setError(null);

      const activeOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
      const activeBranch = localStorage.getItem("selected_branch") || localStorage.getItem("branch_code") || "";
      const activeHospital = localStorage.getItem("selected_hospital") || localStorage.getItem("hospital_code") || "";

      const response = await apiRequest(
        `${Hmsbaseurl}pharmacy_medicinechart/`,
        "POST",
        {
          outlet_code: activeOutlet,
          branch_code: activeBranch,
          hospital_code: activeHospital,
        }
      );

      if (!response.success) {
        setError(response.error || "Failed to load data.");
        return;
      }

      const rawList = response.data?.data || [];

      const enriched = await Promise.all(
        rawList.map(async (patient) => {
          const uhid = patient.uhid;
          if (!uhid) return patient;

          const [pd, adm] = await Promise.all([
            fetchPatientDetails(uhid),
            fetchAdmissionDetails(uhid),
          ]);

          const pdName = (() => {
            const f = (pd?.firstName || "").trim();
            const l = (pd?.lastName || "").trim();
            const n = (f && l && (f.toLowerCase() === l.toLowerCase() || f.toLowerCase().endsWith(l.toLowerCase()))) ? f : `${f} ${l}`.trim();
            return `${pd?.salutation || ""} ${n}`.trim();
          })();

          const pdMerge = pd ? {
            patient_details: {
              patient_name: pdName,
              address:      pd.permanent_address || pd.area || "",
              mobile:       pd.mobilePhone || pd.mobile || "",
            },
            patient_name:  pdName,
            address:       pd.permanent_address || "",
            place:         pd.area              || "",
            mobile:        pd.mobilePhone       || pd.mobile || "",
            customer_type: pd.customer_type     || "",
            age:           pd.dob ? calcAge(pd.dob) : pd.age ? String(pd.age) : "",
            doctor_id: (() => {
              if (!Array.isArray(pd.billing) || pd.billing.length === 0)
                return patient.doctor_id || "";
              const withDoc = pd.billing.filter(b => b.doctor_id);
              if (!withDoc.length) return patient.doctor_id || "";
              const sorted = [...withDoc].sort((a, b) => new Date(b.billed_date) - new Date(a.billed_date));
              return sorted[0].doctor_id;
            })(),
          } : {};

          const admMerge = adm ? {
            admission_status:   adm.admitted ? "ADMITTED" : "NOT ADMITTED",
            inpatient_number:   adm.ipNumber          || patient.inpatient_number || "",
            admission_datetime: adm.admissionDateTime || "",
            room_no:            adm.roomLabel         || patient.room_no || patient.ward_name || "",
            ward_name:          adm.roomLabel         || patient.ward_name || patient.room_no || "",
            customer_type:      adm.customer_type     || patient.customer_type || "General",
            is_insurance:       adm.is_insurance      ?? patient.is_insurance ?? (String(patient.customer_type || '').toLowerCase() === 'insurance'),
            insurance_company:  adm.insurance_company || patient.insurance_company || "",
            advance_payments:   adm.advance_payments  || patient.advance_payments || [],
            total_ip_advance:   adm.total_ip_advance  ?? patient.total_ip_advance ?? 0,
          } : {};

          return { ...patient, ...pdMerge, ...admMerge };
        })
      );

      setMedicineData(enriched);
    } catch (err) {
      console.error("Error fetching medicine chart:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicineChart(); }, []);

  // ─── Fetch stocks for replacement ─────────────────────────────────────────
  useEffect(() => {
    if (!HmsBaseUrl) return;
    const fetchMedicines = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_stock/`, "POST");
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
        }
      } catch (err) {
        console.error("Error fetching medicines for substitute:", err);
      }
    };
    fetchMedicines();
  }, [HmsBaseUrl]);

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
      return {
        ...it,
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

  const substSuggestions = substSearch.length >= 2
    ? medicines.filter(m => m.name.toLowerCase().includes(substSearch.toLowerCase()))
    : [];

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        {/* ── Top Header ── */}
        <HeaderContainer>
          <HeaderLeft>
            <HeaderIconBox>
              <Pill size={28} />
            </HeaderIconBox>
            <HeaderTitleGroup>
              <HeaderTitle>
                Medicine Chart
                <HeaderBadge>Ward Prescriptions</HeaderBadge>
              </HeaderTitle>
              <HeaderSubtitle>
                Inpatient prescription tracking, insurance consumable separation &amp; dispensing workflow
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
                Last 7 Days
              </DatePresetBtn>
              <DatePresetBtn
                type="button"
                $active={!fromDate && !toDate}
                onClick={() => handleSetDatePreset("all")}
                title="Show all requests across all dates"
              >
                All Dates
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
              <DateSep>→</DateSep>
              <DateInput
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                placeholder="To"
                title="To Ward Request Date"
              />
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

        {/* ── Top Statistics Overview Cards ── */}
        <StatsGrid>
          <StatCard $color="#0d9488">
            <StatInfo>
              <StatLabel>Total Prescriptions</StatLabel>
              <StatValue>{stats.total}</StatValue>
              <StatSubtext>Active ward requests</StatSubtext>
            </StatInfo>
            <StatIconWrapper $bg="#f0fdfa" $color="#0d9488">
              <Layers size={22} />
            </StatIconWrapper>
          </StatCard>

          <StatCard $color="#f59e0b">
            <StatInfo>
              <StatLabel>Pending Dispense</StatLabel>
              <StatValue>{stats.pending}</StatValue>
              <StatSubtext>Awaiting pharmacy action</StatSubtext>
            </StatInfo>
            <StatIconWrapper $bg="#fffbeb" $color="#d97706">
              <Clock size={22} />
            </StatIconWrapper>
          </StatCard>

          <StatCard $color="#8b5cf6">
            <StatInfo>
              <StatLabel>Processing</StatLabel>
              <StatValue>{stats.processing}</StatValue>
              <StatSubtext>In billing queue</StatSubtext>
            </StatInfo>
            <StatIconWrapper $bg="#f5f3ff" $color="#7c3aed">
              <Activity size={22} />
            </StatIconWrapper>
          </StatCard>

          <StatCard $color="#10b981">
            <StatInfo>
              <StatLabel>Insurance Cases</StatLabel>
              <StatValue>{stats.insuranceCount}</StatValue>
              <StatSubtext>Consumable payable rules applied</StatSubtext>
            </StatInfo>
            <StatIconWrapper $bg="#ecfdf5" $color="#059669">
              <Shield size={22} />
            </StatIconWrapper>
          </StatCard>

        </StatsGrid>

        {/* ── Filter & Search Toolbar ── */}
        <FilterToolbar>
          <FilterTopRow>
            <SearchBox>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search by UHID, Patient Name, Room/Ward, IP Number, or Doctor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <ClearSearchBtn onClick={() => setSearchQuery("")}>
                  <X size={15} />
                </ClearSearchBtn>
              )}
            </SearchBox>
          </FilterTopRow>

          <FilterPillsRow>
            <FilterPillsGroup>
              {[
                { id: "All", label: "All Requests", count: stats.total },
                { id: "Pending", label: "Pending", count: stats.pending },
                { id: "Processing", label: "Processing", count: stats.processing },
                { id: "Insurance", label: "Insurance", count: stats.insuranceCount },
                { id: "General", label: "General", count: stats.total - stats.insuranceCount },
              ].map(f => (
                <FilterPill
                  key={f.id}
                  $active={activeFilter === f.id}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                  <PillCount $active={activeFilter === f.id}>{f.count}</PillCount>
                </FilterPill>
              ))}
            </FilterPillsGroup>

            <span style={{ fontSize: "0.76rem", color: T.slateMuted, fontWeight: 600 }}>
              Showing {filteredData.length} of {medicineData.length} prescriptions
            </span>
          </FilterPillsRow>
        </FilterToolbar>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem" }}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* ── Main Prescriptions Table Card ── */}
        <TableCard>
          <TableWrapper>
            <StyledTable>
              <Thead>
                <tr>
                  <th style={{ width: 44, textAlign: "center" }}>Print</th>
                  <th>UHID</th>
                  <th>Patient Details</th>
                  <th>Ward &amp; Room</th>
                  <th>IP Number</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Billing Action</th>
                  <th>Prescribed Medicines</th>
                </tr>
              </Thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: T.primary }}>
                        <SpinIcon size={26} />
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Loading medicine charts…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "52px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: T.slateLight }}>
                        <Pill size={38} color={T.slateLight} />
                        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: T.slateDark }}>
                          {fromDate || toDate
                            ? `No ward prescriptions found for ${fromDate === toDate ? fromDate : `${fromDate || 'Start'} to ${toDate || 'End'}`}`
                            : "No prescriptions found"}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: T.slateMuted, maxWidth: 440 }}>
                          {medicineData.length > 0
                            ? `There are ${medicineData.length} total ward prescriptions on other dates. You can change the date filter or view all records.`
                            : "No ward request prescriptions are currently awaiting dispense."}
                        </span>
                        {medicineData.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleSetDatePreset("all")}
                              style={{
                                background: "#0f766e",
                                color: "#fff",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              View All Dates ({medicineData.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDatePreset("yesterday")}
                              style={{
                                background: "#f1f5f9",
                                color: T.slateMid,
                                border: `1px solid ${T.border}`,
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Check Yesterday
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDatePreset("last7")}
                              style={{
                                background: "#f1f5f9",
                                color: T.slateMid,
                                border: `1px solid ${T.border}`,
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Last 7 Days
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((patient, idx) => {
                    const patientKey = `${getBillKey(patient)}-${idx}`;
                    const isExpanded = expandedKey === patientKey;
                    const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];
                    const pName = patient.patient_details?.patient_name || patient.patient_name || `Patient (${patient.uhid})`;
                    const initials = pName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "PT";
                    const wardRawDate = patient.ward_request_date || patient.created_date;

                    return (
                      <React.Fragment key={patientKey}>
                        <PatientRow
                          $active={isExpanded}
                          onClick={() => handleToggleMedicines(patientKey)}
                        >
                          {/* Print Icon Button */}
                          <td style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                            <PrintBtnIcon
                              title="Print Ward Prescription"
                              onClick={() => setPrintPatient(patient)}
                            >
                              <Printer size={16} />
                            </PrintBtnIcon>
                          </td>

                          {/* UHID */}
                          <td>
                            <UHIDBadge>{patient.uhid}</UHIDBadge>
                          </td>

                          {/* Patient Name & Tags */}
                          <td>
                            <PatientInfoCell>
                              <PatientAvatar $isInsurance={patient.is_insurance}>
                                {initials}
                              </PatientAvatar>
                              <PatientMeta>
                                <PatientName>{pName}</PatientName>
                                <PatientSubPills>
                                  <TypeTag $isInsurance={patient.is_insurance}>
                                    {patient.is_insurance ? (
                                      <>
                                        <Shield size={10} />
                                        <span>Insurance {patient.insurance_company ? `(${patient.insurance_company})` : ""}</span>
                                      </>
                                    ) : (
                                      <>
                                        <User size={10} />
                                        <span>General</span>
                                      </>
                                    )}
                                  </TypeTag>
                                  {Number(patient.total_ip_advance || 0) > 0 && (
                                    <AdvanceTag>
                                      Adv: ₹{Number(patient.total_ip_advance).toLocaleString("en-IN")}
                                    </AdvanceTag>
                                  )}
                                </PatientSubPills>
                              </PatientMeta>
                            </PatientInfoCell>
                          </td>

                          {/* Ward & Room + Ward Request Date */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                              <Bed size={15} color={T.primary} />
                              <span>{patient.ward_name || patient.room_no || "General Ward"}</span>
                            </div>
                            {wardRawDate && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.71rem", color: T.slateMuted, marginTop: 3 }}>
                                <Clock size={11} />
                                <span>
                                  {new Date(wardRawDate).toLocaleDateString("en-GB")}
                                  {" "}
                                  {new Date(wardRawDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* IP Number */}
                          <td>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", fontWeight: 700, color: T.slateMid }}>
                              {patient.inpatient_number || patient.ip_number || "—"}
                            </span>
                          </td>

                          {/* Mobile */}
                          <td>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: T.slateMuted }}>
                              {patient.patient_details?.mobile || patient.mobile || "—"}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <StatusPill $status={patient.billing_status || "Pending"}>
                              <StatusDotAnim />
                              {patient.billing_status || "Pending"}
                            </StatusPill>
                          </td>

                          {/* To Bill action */}
                          <td onClick={e => e.stopPropagation()}>
                            <ActionBtnToBill
                              title="Convert entire prescription to a single pharmacy bill"
                              onClick={(e) => handleConvertToBillSafe(patient, e)}
                            >
                              <Receipt size={14} />
                              Convert to Bill
                            </ActionBtnToBill>
                          </td>

                          {/* Medicines pill button */}
                          <td onClick={e => e.stopPropagation()}>
                            <ActionBtnMedicines
                              $active={isExpanded}
                              onClick={() => handleToggleMedicines(patientKey)}
                            >
                              <Pill size={14} />
                              <span>{items.length} Items</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </ActionBtnMedicines>
                          </td>
                        </PatientRow>

                        {/* ── Expanded Detail Drawer ── */}
                        {isExpanded && (() => {
                          const isInsurance = Boolean(patient.is_insurance);
                          const totalPrescriptionAmount = items.reduce((acc, it) => {
                            const q = Number(it.qty ?? it.quantity ?? 0);
                            const p = getUnitPrice(it);
                            return acc + (q * p);
                          }, 0);

                          const consumablePayableAmount = items.reduce((acc, it) => {
                            if (Boolean(it.is_consumable_items)) {
                              const q = Number(it.qty ?? it.quantity ?? 0);
                              const p = getUnitPrice(it);
                              return acc + (q * p);
                            }
                            return acc;
                          }, 0);

                          const insuranceCoveredAmount = totalPrescriptionAmount - consumablePayableAmount;
                          const availableIpAdvance = Number(patient.total_ip_advance || 0);
                          const amountDeducted = isInsurance
                            ? Math.min(consumablePayableAmount, availableIpAdvance)
                            : Math.min(totalPrescriptionAmount, availableIpAdvance);
                          const remainingIpAdvance = isInsurance
                            ? Math.max(0, availableIpAdvance - consumablePayableAmount)
                            : Math.max(0, availableIpAdvance - totalPrescriptionAmount);
                          const excessPayable = isInsurance
                            ? Math.max(0, consumablePayableAmount - availableIpAdvance)
                            : Math.max(0, totalPrescriptionAmount - availableIpAdvance);

                          return (
                            <DetailDrawerRow onClick={e => e.stopPropagation()}>
                              <DetailDrawerCell colSpan="9">
                                <DetailDrawerInner>
                                  {/* 1. Context Information Strip */}
                                  <ContextStrip>
                                    <ContextItem>
                                      <ContextIconBox><User size={16} /></ContextIconBox>
                                      <ContextText>
                                        <ContextKey>Patient UHID</ContextKey>
                                        <ContextVal>{patient.uhid}</ContextVal>
                                      </ContextText>
                                    </ContextItem>

                                    <ContextItem>
                                      <ContextIconBox><Building2 size={16} /></ContextIconBox>
                                      <ContextText>
                                        <ContextKey>IP Number</ContextKey>
                                        <ContextVal>{patient.inpatient_number || "—"}</ContextVal>
                                      </ContextText>
                                    </ContextItem>

                                    <ContextItem>
                                      <ContextIconBox><Bed size={16} /></ContextIconBox>
                                      <ContextText>
                                        <ContextKey>Ward / Bed</ContextKey>
                                        <ContextVal>{patient.ward_name || patient.room_no || "—"}</ContextVal>
                                      </ContextText>
                                    </ContextItem>

                                    <ContextItem>
                                      <ContextIconBox><Activity size={16} /></ContextIconBox>
                                      <ContextText>
                                        <ContextKey>Admitting Doctor</ContextKey>
                                        <ContextVal>Dr. {patient.doctor_name || "Assigned Doctor"}</ContextVal>
                                      </ContextText>
                                    </ContextItem>

                                    <ContextItem>
                                      <ContextIconBox><Phone size={16} /></ContextIconBox>
                                      <ContextText>
                                        <ContextKey>Contact</ContextKey>
                                        <ContextVal>{patient.patient_details?.mobile || patient.mobile || "—"}</ContextVal>
                                      </ContextText>
                                    </ContextItem>
                                  </ContextStrip>

                                  {/* 2. Advance & Consumable Financial Summary Card */}
                                  <FinancialSummaryCard>
                                    <FinCardHeader>
                                      <FinCardTitle>
                                        {isInsurance ? <Shield size={16} /> : <DollarSign size={16} />}
                                        {isInsurance ? "Insurance & IP Advance Breakdown" : "IP Advance Settlement Summary"}
                                      </FinCardTitle>
                                      <TypeTag $isInsurance={isInsurance}>
                                        {isInsurance ? `🛡️ Insurance: ${patient.insurance_company || "Approved"}` : "👤 General Patient"}
                                      </TypeTag>
                                    </FinCardHeader>

                                    <FinGrid>
                                      <FinStat>
                                        <FinLabel>Total Prescription</FinLabel>
                                        <FinValue>₹{totalPrescriptionAmount.toFixed(2)}</FinValue>
                                      </FinStat>

                                      {isInsurance && (
                                        <>
                                          <FinStat>
                                            <FinLabel>Insurance Covered</FinLabel>
                                            <FinValue $color="#16a34a">₹{insuranceCoveredAmount.toFixed(2)}</FinValue>
                                          </FinStat>

                                          <FinStat>
                                            <FinLabel>Payable (Consumables)</FinLabel>
                                            <FinValue $color="#ea580c">₹{consumablePayableAmount.toFixed(2)}</FinValue>
                                          </FinStat>
                                        </>
                                      )}

                                      <FinStat>
                                        <FinLabel>Available IP Advance</FinLabel>
                                        <FinValue $color="#0d9488">₹{availableIpAdvance.toFixed(2)}</FinValue>
                                      </FinStat>

                                      <FinStat>
                                        <FinLabel>{isInsurance ? "Deducted for Consumables" : "Deducted from Advance"}</FinLabel>
                                        <FinValue $color="#0284c7">- ₹{amountDeducted.toFixed(2)}</FinValue>
                                      </FinStat>

                                      <FinStat>
                                        <FinLabel>Remaining IP Advance</FinLabel>
                                        <FinValue $color={remainingIpAdvance > 0 ? "#16a34a" : "#dc2626"}>
                                          ₹{remainingIpAdvance.toFixed(2)}
                                        </FinValue>
                                      </FinStat>

                                      {excessPayable > 0 && (
                                        <FinStat>
                                          <FinLabel style={{ color: "#dc2626" }}>Excess Payable by Patient</FinLabel>
                                          <FinValue $color="#dc2626">₹{excessPayable.toFixed(2)}</FinValue>
                                        </FinStat>
                                      )}
                                    </FinGrid>
                                  </FinancialSummaryCard>

                                  {/* 3. Medicine Items Table */}
                                  <MedicineTableCard>
                                    <StyledTable>
                                      <SubThead>
                                        <tr>
                                          <th>Medicine Item</th>
                                          <th>Type / Payable</th>
                                          <th>Qty</th>
                                          <th>Unit Price (₹)</th>
                                          <th>Amount (₹)</th>
                                          <th>Stock Status</th>
                                          <th>Dosage</th>
                                          <th>Ward Request Date &amp; Time</th>
                                          <th>Action</th>
                                        </tr>
                                      </SubThead>
                                      <tbody>
                                        {items.length > 0 ? (
                                          items.map((item, i) => {
                                            if (!item) return null;

                                            const wardReqRaw = patient.ward_request_date || patient.created_date;
                                            let wardDateStr = "—", wardTimeStr = "—";
                                            if (wardReqRaw) {
                                              const d = new Date(wardReqRaw);
                                              wardDateStr = d.toLocaleDateString("en-GB");
                                              wardTimeStr = d.toLocaleTimeString("en-IN", {
                                                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
                                              });
                                            }

                                            const stockLow = item.available_stock !== undefined && item.available_stock < 10;
                                            const isSubstituted = item.is_substitute || item.substituted;
                                            const dotType =
                                              isSubstituted     ? "substitute" :
                                              item.is_emergency ? "emergency"  :
                                              item.is_insurance ? "insurance"  :
                                              "regular";

                                            const q = Number(item.qty ?? item.quantity ?? 0);
                                            // Displays Selling_Price in place of Unit Price
                                            const unitPrice = getUnitPrice(item);
                                            const lineAmt = (q * unitPrice).toFixed(2);
                                            const isConsumable = Boolean(item.is_consumable_items);

                                            return (
                                              <SubRow key={`${item.item_id ?? i}-${i}`}>
                                                <td>
                                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <ItemDot $type={dotType} />
                                                    <span style={{ fontWeight: 700, color: T.slateDark }}>
                                                      {item.item_name || item.medicine_name || "—"}
                                                    </span>
                                                    {isSubstituted && (
                                                      <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 6px", fontSize: "0.66rem", fontWeight: 700 }}>
                                                        Substituted
                                                      </span>
                                                    )}
                                                  </div>
                                                </td>

                                                <td>
                                                  {isConsumable ? (
                                                    <ConsumableTag title="Consumable item — Payable by patient from IP Advance">
                                                      🟠 Consumable (Payable)
                                                    </ConsumableTag>
                                                  ) : isInsurance ? (
                                                    <CoveredTag title="Covered under insurance claim">
                                                      🛡️ Insurance Covered
                                                    </CoveredTag>
                                                  ) : (
                                                    <span style={{ fontSize: "0.74rem", color: T.slateMuted, fontWeight: 600 }}>Regular</span>
                                                  )}
                                                </td>

                                                <td>
                                                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem" }}>
                                                    {q}
                                                  </span>
                                                </td>

                                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: T.slateMid }}>
                                                  ₹{unitPrice.toFixed(2)}
                                                </td>

                                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", fontWeight: 800, color: T.slateDark }}>
                                                  ₹{lineAmt}
                                                </td>

                                                <td>
                                                  {item.available_stock !== undefined && item.available_stock !== null ? (
                                                    <StockIndicator $low={stockLow}>
                                                      {stockLow ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
                                                      {item.available_stock} in stock
                                                    </StockIndicator>
                                                  ) : (
                                                    <span style={{ color: T.slateLight }}>—</span>
                                                  )}
                                                </td>

                                                <td style={{ fontSize: "0.77rem", color: T.slateMid, fontWeight: 500 }}>
                                                  {item.dosage || item.dose || "—"}
                                                </td>

                                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", color: T.slateMuted }}>
                                                  {wardDateStr} {wardTimeStr !== "—" ? `• ${wardTimeStr}` : ""}
                                                </td>

                                                <td>
                                                  <SubstituteActionBtn
                                                    title={`Substitute ${item.item_name || "this item"}`}
                                                    onClick={(e) => openSubstituteModal(patient, item, e)}
                                                  >
                                                    <Repeat size={12} />
                                                    Substitute
                                                  </SubstituteActionBtn>
                                                </td>
                                              </SubRow>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: T.slateLight }}>
                                              No prescribed medicine items.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </StyledTable>
                                  </MedicineTableCard>
                                </DetailDrawerInner>
                              </DetailDrawerCell>
                            </DetailDrawerRow>
                          );
                        })()}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </StyledTable>
          </TableWrapper>
        </TableCard>

        {/* ── Legend ── */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", padding: "12px 18px", marginTop: 16, background: "#ffffff", borderRadius: 12, border: `1px solid ${T.border}`, fontSize: "0.76rem", color: T.slateMid }}>
          <span style={{ fontWeight: 800, color: T.slateDark, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>Legend</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ItemDot $type="substitute" /> Substitute Given
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ItemDot $type="emergency" /> Emergency
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ItemDot $type="insurance" /> Insurance Covered
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ItemDot $type="regular" /> Regular
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} /> Consumable (Patient Payable)
          </span>
        </div>
      </PageContainer>

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
              </label>
              <div style={{ position: "relative" }}>
                <SearchInput
                  type="text"
                  autoComplete="off"
                  placeholder="Type at least 2 letters to search pharmacy stock…"
                  value={substSearch}
                  onChange={e => {
                    setSubstSearch(e.target.value);
                    setSubstDropOpen(true);
                    if (!e.target.value) setSubstSelected(null);
                  }}
                  onFocus={() => substSearch.length >= 2 && setSubstDropOpen(true)}
                  style={{ background: "#fff", paddingLeft: 14 }}
                />
                {substDropOpen && substSuggestions.length > 0 && (
                  <DropdownList>
                    {substSuggestions.map((med, idx) => (
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
                    ))}
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