import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle2,
  Scan,
  Search,
  RefreshCw,
  Printer,
  Hospital,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Lock,
  Edit3,
  Check,
  X,
  UserCheck,
  Stethoscope,
  HeartPulse,
  CheckCheck,
  Upload,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  FileUp,
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens & Theme ───────────────────────────────────────────────────
const theme = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  primaryLight: "rgba(13, 148, 136, 0.08)",
  primaryHover: "rgba(13, 148, 136, 0.15)",
  amber: "#d97706",
  amberLight: "#fef3c7",
  amberBorder: "#fde68a",
  emerald: "#059669",
  emeraldLight: "#d1fae5",
  emeraldBorder: "#a7f3d0",
  sky: "#0284c7",
  skyLight: "#e0f2fe",
  skyBorder: "#bae6fd",
  teal: "#0d9488",
  tealLight: "#ccfbf1",
  tealBorder: "#99f6e4",
  danger: "#e11d48",
  dangerLight: "#ffe4e6",
  dangerBorder: "#fecdd3",
  border: "#e2e8f0",
  bg: "#f8fafc",
  surface: "#ffffff",
  textMain: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  radius: "12px",
  radiusSm: "8px",
  shadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  shadowMd: "0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalFade = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 24px;
  background-color: ${theme.bg};
  min-height: calc(100vh - 70px);
  animation: ${fadeIn} 0.25s ease-out;

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 14px;
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
  }

  h1 {
    font-size: 1.45rem;
    font-weight: 700;
    color: ${theme.textMain};
    margin: 0;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 0.83rem;
    color: ${theme.textMid};
    margin: 2px 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PrintBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: ${theme.primary};
  border: 1px solid ${theme.primaryDark};
  border-radius: ${theme.radiusSm};
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radiusSm};
  color: ${theme.textMid};
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${theme.shadow};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    color: ${theme.primaryDark};
    border-color: #cbd5e1;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 0.8s linear infinite;
  }
`;

// ─── Stats Grid ─────────────────────────────────────────────────────────────
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 22px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${theme.shadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadowMd};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(p) => p.$accentColor || theme.primary};
  }
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;

  .stat-label {
    font-size: 0.74rem;
    font-weight: 600;
    color: ${theme.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-val {
    font-size: 1.5rem;
    font-weight: 800;
    color: ${theme.textMain};
    margin-top: 2px;
    letter-spacing: -0.02em;
  }
`;

const StatIconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$bg || theme.primaryLight};
  color: ${(p) => p.$color || theme.primary};
`;

// ─── Filter Bar ─────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  padding: 16px 18px;
  margin-bottom: 20px;
  box-shadow: ${theme.shadow};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FilterTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const TabGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CapsuleWrapper = styled.div`
  position: relative;
  display: inline-flex;

  &:hover .tooltip-bubble {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const TooltipBubble = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: #0f172a;
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  z-index: 60;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: #0f172a transparent transparent transparent;
  }
`;

const FilterCapsule = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid ${(p) => (p.$active ? p.$cfg.activeBg : p.$cfg.border)};
  background: ${(p) => (p.$active ? p.$cfg.activeBg : p.$cfg.bg)};
  color: ${(p) => (p.$active ? "#ffffff" : p.$cfg.text)};
  box-shadow: ${(p) => (p.$active ? p.$cfg.shadow : "0 1px 3px rgba(0,0,0,0.04)")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) => p.$cfg.hoverShadow};
    border-color: ${(p) => p.$cfg.activeBg};
  }

  &:active {
    transform: translateY(0);
  }

  .capsule-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${(p) => (p.$active ? "#ffffff" : p.$cfg.text)};
    transition: color 0.2s ease;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.74rem;
    font-weight: 800;
    background: ${(p) => (p.$active ? "rgba(255, 255, 255, 0.28)" : p.$cfg.badgeBg)};
    color: ${(p) => (p.$active ? "#ffffff" : p.$cfg.badgeColor)};
    transition: all 0.2s ease;
  }
`;

const QuickDates = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  button {
    padding: 6px 12px;
    border-radius: 9999px;
    border: 1px solid ${theme.border};
    background: ${theme.surface};
    font-size: 0.74rem;
    font-weight: 600;
    color: ${theme.textMid};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #f1f5f9;
      color: ${theme.primary};
      border-color: #cbd5e1;
    }
  }
`;

const FilterControlsRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.textMuted};
  }

  input {
    width: 100%;
    padding: 9px 12px 9px 38px;
    border-radius: ${theme.radiusSm};
    border: 1px solid ${theme.border};
    font-size: 0.83rem;
    background: ${theme.surface};
    color: ${theme.textMain};
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px ${theme.primaryLight};
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const DateInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radiusSm};
  padding: 4px 10px;

  span {
    font-size: 0.76rem;
    font-weight: 600;
    color: ${theme.textMuted};
    white-space: nowrap;
  }

  input {
    border: none;
    outline: none;
    font-size: 0.82rem;
    color: ${theme.textMain};
    width: 100%;
    background: transparent;
  }
`;

// ─── Table & Content ────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius};
  box-shadow: ${theme.shadow};
  overflow: hidden;
`;

const TableScrollWrapper = styled.div`
  overflow-x: auto;
  max-width: 100%;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
`;

const TableHead = styled.thead`
  background: #f8fafc;
  border-bottom: 2px solid ${theme.border};

  th {
    padding: 12px 12px;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${theme.textMid};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.border};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8fafc;
  }

  td {
    padding: 12px 12px;
    color: ${theme.textMain};
    vertical-align: middle;
  }
`;

const MrdIdBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${(p) => (p.$hasId ? "#f1f5f9" : "transparent")};
  color: ${(p) => (p.$hasId ? "#334155" : theme.textMuted)};
  border: 1px solid ${(p) => (p.$hasId ? "#cbd5e1" : "transparent")};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;

  ${(p) => {
    switch (p.$status) {
      case "Received":
        return `
          background: ${theme.skyLight};
          color: ${theme.sky};
          border: 1px solid ${theme.skyBorder};
        `;
      case "Scanned":
        return `
          background: ${theme.emeraldLight};
          color: ${theme.emerald};
          border: 1px solid ${theme.emeraldBorder};
        `;
      case "Pending":
      default:
        return `
          background: ${theme.amberLight};
          color: ${theme.amber};
          border: 1px solid ${theme.amberBorder};
        `;
    }
  }}
`;

const CheckboxContainer = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.45 : 1)};
  user-select: none;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${(p) => (p.$checked ? theme.textMain : theme.textMid)};

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid ${(p) => (p.$checked ? (p.$color || theme.primary) : "#cbd5e1")};
    border-radius: 5px;
    background-color: ${(p) => (p.$checked ? (p.$color || theme.primary) : "#fff")};
    display: grid;
    place-content: center;
    cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
    transition: all 0.15s ease;

    &:checked::before {
      content: "";
      width: 9px;
      height: 5px;
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(-45deg) translate(1px, -1px);
    }
  }

  &:hover input:not(:disabled) {
    border-color: ${(p) => p.$color || theme.primary};
  }
`;

const ErrorButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${(p) => {
    if (!p.$hasError) {
      return `
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: ${theme.textMid};
        &:hover:not(:disabled) { background: #e2e8f0; color: ${theme.textMain}; }
      `;
    }
    if (p.$isResolved) {
      return `
        background: ${theme.emeraldLight};
        border: 1px solid ${theme.emeraldBorder};
        color: ${theme.emerald};
        &:hover:not(:disabled) { background: #a7f3d0; }
      `;
    }
    return `
      background: ${theme.dangerLight};
      border: 1px solid ${theme.dangerBorder};
      color: ${theme.danger};
      &:hover:not(:disabled) { background: #fecdd3; }
    `;
  }}
`;


const ErrorPillBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.7rem;
  max-width: 170px;

  .err-title {
    font-weight: 700;
    color: ${theme.danger};
  }
  .err-resolved-title {
    font-weight: 700;
    color: ${theme.emerald};
  }
  .err-detail {
    color: ${theme.textMid};
    white-space: normal;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ResolveActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid ${theme.emeraldBorder};
  background: ${theme.emeraldLight};
  color: ${theme.emerald};
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 3px;
  transition: all 0.15s ease;

  &:hover {
    background: #a7f3d0;
  }
`;

const AuditGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.72rem;
  line-height: 1.35;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid ${theme.border};
  min-width: 250px;

  .audit-row {
    display: grid;
    grid-template-columns: 110px 10px 1fr;
    align-items: baseline;
    color: ${theme.textMid};

    &.error {
      color: #e11d48;
      .audit-label { font-weight: 700; color: #e11d48; }
    }

    &.resolved {
      color: #059669;
      .audit-label { font-weight: 700; color: #059669; }
    }
  }

  .audit-label {
    font-weight: 600;
    color: ${theme.textMain};
    white-space: nowrap;
  }

  .audit-sep {
    font-weight: 700;
    color: ${theme.textMuted};
    text-align: center;
  }

  .audit-val {
    color: ${theme.textMain};
    font-weight: 500;
    white-space: nowrap;
  }

  .audit-user {
    font-weight: 600;
    color: ${theme.primaryDark};
    margin-left: 3px;
  }

  .audit-empty {
    color: #94a3b8;
  }
`;

const AuditPill = styled.div`
  font-size: 0.7rem;
  color: ${theme.textMuted};
  line-height: 1.35;

  .audit-user {
    font-weight: 600;
    color: ${theme.textMid};
  }
`;


const EmptyBox = styled.div`
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  svg {
    color: #cbd5e1;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: ${theme.textMid};
    margin: 0;
  }

  p {
    font-size: 0.82rem;
    color: ${theme.textMuted};
    margin: 0;
  }
`;

const LoadingOverlay = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${theme.textMid};
  font-size: 0.86rem;
  font-weight: 500;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: ${theme.primary};
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
  }
`;

// ─── PDF Document Elements ──────────────────────────────────────────────────
const UploadPdfButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  background: #f5f3ff;
  border: 1.5px dashed #c4b5fd;
  color: #7c3aed;
  transition: all 0.2s ease;
  user-select: none;
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};

  &:hover:not([disabled]) {
    background: #ede9fe;
    border-color: #8b5cf6;
    color: #6d28d9;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.15);
  }

  .spin {
    animation: ${spin} 0.8s linear infinite;
  }
`;

const PdfDocCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 6px 8px;
  min-width: 148px;
  max-width: 180px;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #c084fc;
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.12);
  }

  .pdf-doc-info {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    color: #6b21a8;
    font-size: 0.72rem;
    font-weight: 700;

    .pdf-icon {
      color: #9333ea;
      flex-shrink: 0;
    }

    .pdf-filename {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }
  }

  .pdf-btn-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .pdf-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 0.68rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;

    &.preview {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
      &:hover { background: #dcfce7; border-color: #86efac; }
    }

    &.download {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
      &:hover { background: #dbeafe; border-color: #93c5fd; }
    }

    &.replace {
      background: #f8fafc;
      border-color: #e2e8f0;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 5px;
      &:hover { background: #f1f5f9; color: #334155; }
    }

    &.delete {
      background: #fff1f2;
      border-color: #fecdd3;
      color: #be123c;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 5px;
      &:hover { background: #ffe4e6; border-color: #fda4af; }
    }
  }

  .pdf-meta {
    font-size: 0.63rem;
    color: #94a3b8;
    line-height: 1.2;
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }
`;

const PdfPreviewModalContent = styled.div`
  background: ${theme.surface};
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 95%;
  max-width: 1050px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${modalFade} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

const PdfModalBody = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  background: #525659;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid ${theme.border};
  color: ${theme.textMain};
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: ${theme.primaryDark};
  }
`;

// ─── Modal Styles ───────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: ${theme.surface};
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  animation: ${modalFade} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ModalHeader = styled.div`
  padding: 18px 22px;
  background: #f8fafc;
  border-bottom: 1px solid ${theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${theme.textMain};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: ${theme.textMuted};
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #e2e8f0;
      color: ${theme.textMain};
    }
  }
`;

const ModalBody = styled.div`
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PatientHeaderCard = styled.div`
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${theme.textMid};

  .bold {
    font-weight: 700;
    color: ${theme.textMain};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: ${theme.textMid};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  textarea {
    width: 100%;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1.5px solid ${theme.border};
    font-size: 0.82rem;
    color: ${theme.textMain};
    min-height: 70px;
    resize: vertical;
    outline: none;
    transition: all 0.18s ease;

    &:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px ${theme.primaryLight};
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${(p) => (p.$disabled ? "#f1f5f9" : "#f8fafc")};
  border: 1px solid ${theme.border};
  border-radius: 10px;
  padding: 10px 14px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.8 : 1)};
  user-select: none;

  .toggle-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: ${theme.textMain};
  }

  .toggle-desc {
    font-size: 0.75rem;
    color: ${theme.textMuted};
    margin-top: 1px;
  }

  input {
    appearance: none;
    width: 44px;
    height: 24px;
    background: #cbd5e1;
    border-radius: 20px;
    position: relative;
    cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
    outline: none;
    transition: background-color 0.2s ease;

    &::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }

    &:checked {
      background: ${(p) => (p.$disabled ? theme.emerald : theme.danger)};
    }

    &:checked::before {
      transform: translateX(20px);
    }
  }
`;


const ModalFooter = styled.div`
  padding: 14px 22px;
  background: #f8fafc;
  border-top: 1px solid ${theme.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cancel-btn {
    background: #ffffff;
    border: 1px solid ${theme.border};
    color: ${theme.textMid};

    &:hover {
      background: #f1f5f9;
      color: ${theme.textMain};
    }
  }

  .save-btn {
    background: ${theme.primary};
    border: 1px solid ${theme.primaryDark};
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);

    &:hover {
      background: ${theme.primaryDark};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

// ═════════════════════════════════════════════════════════════════════════════
// MRD Tracking Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function MRDTracking() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    received: 0,
    scanned: 0,
    has_error: 0,
    resolved_error: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingIp, setUpdatingIp] = useState(null);
  const [uploadingIp, setUploadingIp] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    file: null,
    isError: false,
    nurseError: "",
    doctorError: "",
    isResolved: false,
    saving: false,
  });

  // Confirm Scan / Final Stage Modal State
  const [confirmScanModal, setConfirmScanModal] = useState({
    isOpen: false,
    file: null,
    loading: false,
  });

  // PDF Preview Modal State
  const [pdfPreviewModal, setPdfPreviewModal] = useState({
    isOpen: false,
    file: null,
  });

  // Quick Date presets

  const setQuickDate = (type) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    if (type === "today") {
      const tStr = fmt(today);
      setFromDate(tStr);
      setToDate(tStr);
    } else if (type === "last7") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(fmt(past));
      setToDate(fmt(today));
    } else if (type === "thisMonth") {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(fmt(first));
      setToDate(fmt(today));
    } else if (type === "all") {
      setFromDate("");
      setToDate("");
    }
  };

  // Fetch Discharged Files from API
  const fetchDischargedFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${BASE}mrd/discharged-files/?status=${encodeURIComponent(activeTab)}`;
      if (fromDate) url += `&from_date=${encodeURIComponent(fromDate)}`;
      if (toDate) url += `&to_date=${encodeURIComponent(toDate)}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await apiRequest(url, "GET");
      if (res && res.success) {
        const payload = res.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        setFiles(list);
        if (payload?.stats) {
          setStats(payload.stats);
        }
      } else {
        setFiles([]);
        toast.error(res?.error || "Failed to load discharged files");
      }
    } catch (err) {
      console.error("MRD fetch error:", err);
      setFiles([]);
      toast.error("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate, searchQuery]);

  useEffect(() => {
    fetchDischargedFiles();
  }, [fetchDischargedFiles]);

  // Handle Status Update (Received / Scanned / Pending)
  const handleStatusChange = async (file, targetStatus) => {
    if (updatingIp === file.ip_no) return;

    // Validation guard 1: cannot mark scanned if pending
    if (targetStatus === "Scanned" && file.status === "Pending") {
      toast.warning("File must be Received first before it can be Scanned.");
      return;
    }

    // Validation guard 2: cannot mark scanned if unresolved errors exist
    if (targetStatus === "Scanned" && file.is_error && !file.is_error_resolved) {
      toast.warning("Cannot scan: Please resolve Nurse/Doctor errors first.");
      return;
    }

    setUpdatingIp(file.ip_no);

    const previousFiles = Array.isArray(files) ? [...files] : [];
    setFiles((prev) =>
      (Array.isArray(prev) ? prev : []).map((f) => {
        if (f.ip_no === file.ip_no) {
          return {
            ...f,
            status: targetStatus,
            received_date:
              targetStatus === "Received" || targetStatus === "Scanned"
                ? f.received_date || new Date().toISOString()
                : null,
            scanned_date:
              targetStatus === "Scanned" ? new Date().toISOString() : null,
          };
        }
        return f;
      })
    );

    try {
      const payload = {
        ip_no: file.ip_no,
        uhid: file.uhid,
        status: targetStatus,
      };

      const res = await apiRequest(`${BASE}mrd/update-status/`, "POST", payload);

      if (res && res.success) {
        toast.success(res.message || `File marked as ${targetStatus}`);
        const refreshRes = await apiRequest(
          `${BASE}mrd/discharged-files/?status=${encodeURIComponent(activeTab)}`,
          "GET"
        );
        if (refreshRes && refreshRes.success) {
          const raw = refreshRes.data;
          const list = Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw)
              ? raw
              : [];
          setFiles(list);
          if (raw?.stats) setStats(raw.stats);
        }
      } else {
        setFiles(previousFiles);
        toast.error(res?.error || "Failed to update status");
      }
    } catch (err) {
      setFiles(previousFiles);
      toast.error("Error updating status. Please try again.");
    } finally {
      setUpdatingIp(null);
    }
  };

  // Open Error Modal
  const openErrorModal = (file) => {
    setErrorModal({
      isOpen: true,
      file,
      isError: file.is_error || false,
      nurseError: file.nurse_error || "",
      doctorError: file.doctor_error || "",
      isResolved: file.is_error_resolved || false,
      saving: false,
    });
  };

  // Close Error Modal
  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      file: null,
      isError: false,
      nurseError: "",
      doctorError: "",
      isResolved: false,
      saving: false,
    });
  };

  // Save Error Modal submission
  const handleSaveError = async () => {
    if (!errorModal.file) return;

    if (errorModal.isError && !errorModal.nurseError.trim() && !errorModal.doctorError.trim()) {
      toast.warning("Please provide at least Nurse Error or Doctor Error details.");
      return;
    }

    setErrorModal((prev) => ({ ...prev, saving: true }));

    try {
      const payload = {
        ip_no: errorModal.file.ip_no,
        uhid: errorModal.file.uhid,
        is_error: errorModal.isError,
        nurse_error: errorModal.nurseError.trim(),
        doctor_error: errorModal.doctorError.trim(),
        is_error_resolved: false,
      };

      const res = await apiRequest(`${BASE}mrd/update-status/`, "POST", payload);

      if (res && res.success) {
        toast.success(
          errorModal.isError
            ? "Error details saved successfully!"
            : "Error flag cleared!"
        );
        closeErrorModal();
        await fetchDischargedFiles();
      } else {
        toast.error(res?.error || "Failed to save error details");
      }
    } catch (err) {
      toast.error("Error saving error details. Please try again.");
    } finally {
      setErrorModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Direct resolve from modal handler
  const handleModalDirectResolve = async () => {
    if (!errorModal.file) return;

    setErrorModal((prev) => ({ ...prev, saving: true }));

    try {
      const payload = {
        ip_no: errorModal.file.ip_no,
        uhid: errorModal.file.uhid,
        is_error: true,
        nurse_error: errorModal.nurseError.trim() || errorModal.file.nurse_error || "",
        doctor_error: errorModal.doctorError.trim() || errorModal.file.doctor_error || "",
        is_error_resolved: true,
      };

      const res = await apiRequest(`${BASE}mrd/update-status/`, "POST", payload);

      if (res && res.success) {
        toast.success("Error marked as Resolved! Scanning is now unlocked.");
        closeErrorModal();
      } else {
        toast.error(res?.error || "Failed to resolve error");
      }
    } catch (err) {
      toast.error("Error resolving error. Please try again.");
    } finally {
      setErrorModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Scanning initiation and confirmation handlers

  const handleInitiateScan = (file) => {
    if (file.status === "Pending") {
      toast.warning("File must be Received first before it can be Scanned.");
      return;
    }
    if (file.is_error && !file.is_error_resolved) {
      toast.warning("Cannot scan: Please resolve Nurse/Doctor errors first.");
      return;
    }
    setConfirmScanModal({
      isOpen: true,
      file,
      loading: false,
    });
  };

  const handleConfirmScan = async () => {
    if (!confirmScanModal.file) return;
    const file = confirmScanModal.file;
    setConfirmScanModal((prev) => ({ ...prev, loading: true }));
    await handleStatusChange(file, "Scanned");
    setConfirmScanModal({ isOpen: false, file: null, loading: false });
  };

  const handleCancelScan = () => {
    setConfirmScanModal({ isOpen: false, file: null, loading: false });
  };



  // One-click quick resolve error handler
  const handleQuickResolve = async (file) => {
    if (updatingIp === file.ip_no) return;
    setUpdatingIp(file.ip_no);

    try {
      const payload = {
        ip_no: file.ip_no,
        uhid: file.uhid,
        is_error: true,
        nurse_error: file.nurse_error,
        doctor_error: file.doctor_error,
        is_error_resolved: true,
      };

      const res = await apiRequest(`${BASE}mrd/update-status/`, "POST", payload);

      if (res && res.success) {
        toast.success("Error marked as Resolved. File can now be Scanned!");
        fetchDischargedFiles();
      } else {
        toast.error(res?.error || "Failed to resolve error");
      }
    } catch (err) {
      toast.error("Error resolving error. Please try again.");
    } finally {
      setUpdatingIp(null);
    }
  };

  // PDF Upload handler
  const handleFileUpload = async (fileItem, selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf") && selectedFile.type !== "application/pdf") {
      toast.warning("Only PDF files (.pdf) are allowed.");
      return;
    }

    if (selectedFile.size > 30 * 1024 * 1024) {
      toast.warning("PDF file size exceeds 30 MB limit.");
      return;
    }

    setUploadingIp(fileItem.ip_no);
    const toastId = toast.loading(`Uploading ${selectedFile.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("ip_no", fileItem.ip_no);
      formData.append("uhid", fileItem.uhid || "");

      const res = await apiRequest(`${BASE}mrd/upload-pdf/`, "POST", formData);

      if (res && res.success) {
        toast.update(toastId, {
          render: "PDF document uploaded successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        // Update local file state and auto-fetch fresh data from server
        setFiles((prev) =>
          (Array.isArray(prev) ? prev : []).map((f) => {
            if (f.ip_no === fileItem.ip_no) {
              return {
                ...f,
                pdf_file_id: res.data?.pdf_file_id || "",
                pdf_filename: res.data?.pdf_filename || selectedFile.name,
                pdf_uploaded_by: res.data?.pdf_uploaded_by || "User",
                pdf_uploaded_date: res.data?.pdf_uploaded_date || new Date().toISOString(),
              };
            }
            return f;
          })
        );
        await fetchDischargedFiles();
      } else {
        toast.update(toastId, {
          render: res?.error || "Failed to upload PDF",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: "Error uploading PDF. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setUploadingIp(null);
    }
  };

  // Open PDF Preview Modal (fetches PDF as Blob URL to eliminate iframe cross-origin blocking)
  const handlePreviewPdf = async (fileItem) => {
    if (!fileItem.pdf_file_id) {
      toast.warning("No PDF uploaded for this record.");
      return;
    }

    // Clean up previous blob url if exists
    if (pdfPreviewModal.blobUrl) {
      try {
        window.URL.revokeObjectURL(pdfPreviewModal.blobUrl);
      } catch (e) { }
    }

    setPdfPreviewModal({
      isOpen: true,
      file: fileItem,
      blobUrl: "",
      loading: true,
      error: "",
    });

    try {
      const response = await fetch(`${BASE}mrd/file/${fileItem.pdf_file_id}/`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const rawBlob = await response.blob();
      const pdfBlob = new Blob([rawBlob], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(pdfBlob);

      setPdfPreviewModal((prev) => ({
        ...prev,
        blobUrl: objectUrl,
        loading: false,
        error: "",
      }));
    } catch (err) {
      console.error("PDF Preview fetch error:", err);
      setPdfPreviewModal((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load document preview. You can still download or open it directly.",
      }));
    }
  };

  // Close PDF Preview Modal
  const closePdfPreviewModal = () => {
    if (pdfPreviewModal.blobUrl) {
      try {
        window.URL.revokeObjectURL(pdfPreviewModal.blobUrl);
      } catch (e) { }
    }
    setPdfPreviewModal({
      isOpen: false,
      file: null,
      blobUrl: "",
      loading: false,
      error: "",
    });
  };

  // Download PDF Handler
  const handleDownloadPdf = (fileItem) => {
    if (!fileItem?.pdf_file_id) {
      toast.warning("No PDF uploaded to download.");
      return;
    }

    const downloadUrl = `${BASE}mrd/file/${fileItem.pdf_file_id}/?download=1`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileItem.pdf_filename || `${fileItem.ip_no}_MRD_Document.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info(`Downloading ${fileItem.pdf_filename || "MRD Document.pdf"}...`);
  };

  // Delete PDF Handler
  const handleDeletePdf = async (fileItem) => {
    if (!fileItem?.pdf_file_id) return;

    const confirmDel = window.confirm(`Are you sure you want to delete the uploaded PDF (${fileItem.pdf_filename || "document.pdf"}) for IP ${fileItem.ip_no}?`);
    if (!confirmDel) return;

    setUploadingIp(fileItem.ip_no);

    try {
      const res = await apiRequest(`${BASE}mrd/delete-pdf/`, "POST", { ip_no: fileItem.ip_no });
      if (res && res.success) {
        toast.success("PDF document removed successfully!");
        setFiles((prev) =>
          (Array.isArray(prev) ? prev : []).map((f) => {
            if (f.ip_no === fileItem.ip_no) {
              return {
                ...f,
                pdf_file_id: "",
                pdf_filename: "",
                pdf_uploaded_by: "",
                pdf_uploaded_date: "",
              };
            }
            return f;
          })
        );
        if (pdfPreviewModal.isOpen && pdfPreviewModal.file?.ip_no === fileItem.ip_no) {
          closePdfPreviewModal();
        }
        await fetchDischargedFiles();
      } else {
        toast.error(res?.error || "Failed to delete PDF");
      }
    } catch (err) {
      toast.error("Error deleting PDF. Please try again.");
    } finally {
      setUploadingIp(null);
    }
  };

  // Print Filtered Data Report Handler
  const handlePrintFilteredData = () => {
    const fileList = Array.isArray(files) ? files : [];
    if (fileList.length === 0) {
      toast.warning("No records to print.");
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site to print.");
      return;
    }

    const todayStr = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const rowsHtml = fileList
      .map((row, idx) => {
        let errorTxt = "—";
        if (row.is_error) {
          if (row.is_error_resolved) {
            errorTxt = `<span class="badge resolved">Resolved</span>`;
          } else {
            errorTxt = `<span class="badge error">Pending Error</span>`;
          }
          if (row.nurse_error) {
            errorTxt += `<div style="font-size:12px; color:#333; margin-top:4px;"><strong>Nurse:</strong> ${row.nurse_error}</div>`;
          }
          if (row.doctor_error) {
            errorTxt += `<div style="font-size:12px; color:#333; margin-top:4px;"><strong>Doc:</strong> ${row.doctor_error}</div>`;
          }
        }

        let fileTxt = row.pdf_file_id
          ? `<span class="badge" style="background:#d1fae5; color:#065f46; font-weight:700; border:1px solid #a7f3d0; padding:2px 8px; border-radius:4px;">Yes</span>`
          : `<span class="badge" style="background:#f1f5f9; color:#64748b; font-weight:700; border:1px solid #cbd5e1; padding:2px 8px; border-radius:4px;">No</span>`;

        return `
          <tr>
            <td style="text-align:center; font-weight:600;">${idx + 1}</td>
            <td style="font-weight:700; color:#0f172a;">${row.mrd_id || "—"}</td>
            <td>
              <div style="font-size:12.5px; line-height:1.45;">
                <div style="font-size:13px; font-weight:800; color:#0f766e;"><strong>IP:</strong> ${row.ip_no || "—"}</div>
                <div style="font-size:12px; font-weight:600; color:#475569;"><strong>UHID:</strong> ${row.uhid || "—"}</div>
                <div style="font-size:14px; font-weight:800; color:#0f172a; margin-top:2px;">${row.patient_name || "—"}</div>
                ${(row.age || row.gender || row.mobile) ? `<div style="font-size:12px; color:#475569;">${[row.age ? `${row.age} Yrs` : null, row.gender, row.mobile].filter(Boolean).join(" • ")}</div>` : ""}
                ${row.doctor_name ? `<div style="font-size:12px; color:#334155;"><strong>Doc:</strong> ${row.doctor_name}</div>` : ""}
                ${(row.ward_name || row.room_no) ? `<div style="font-size:12px; color:#334155;"><strong>Ward/Room:</strong> ${row.room_no ? `Room ${row.room_no}` : ""} ${row.ward_name ? `(${row.ward_name})` : "—"}</div>` : ""}
              </div>
            </td>
            <td style="text-align:center;">
              <span class="status-pill status-${(row.status || "Pending").toLowerCase()}">${row.status || "Pending"}</span>
            </td>
            <td>${errorTxt}</td>
            <td style="text-align:center;">${fileTxt}</td>
            <td style="font-size:12px; color:#1e293b; line-height:1.55; font-family:monospace; min-width:360px;">
              <div><strong>Admitted D&T</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${formatDateTime(row.admission_date)}</div>
              <div><strong>Discharged D&T</strong> &nbsp;&nbsp;&nbsp;: ${formatDateTime(row.discharge_date)}</div>
              <div><strong>Received D&T</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${row.received_date ? `${formatDateTime(row.received_date)}${row.received_by ? ` (${row.received_by})` : ""}` : "—"}</div>
              ${row.is_error && row.error_reported_date ? `<div style="color:#e11d48; font-weight:bold;"><strong>Error Flagged D&T</strong> : ${formatDateTime(row.error_reported_date)}${row.error_reported_by ? ` (${row.error_reported_by})` : ""}</div>` : ""}
              ${row.is_error && row.is_error_resolved && row.error_resolved_date ? `<div style="color:#059669; font-weight:bold;"><strong>Error Resolved D&T</strong>: ${formatDateTime(row.error_resolved_date)}${row.error_resolved_by ? ` (${row.error_resolved_by})` : ""}</div>` : ""}
              <div><strong>Scanned D&T</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${row.scanned_date ? `${formatDateTime(row.scanned_date)}${row.scanned_by ? ` (${row.scanned_by})` : ""}` : "—"}</div>
            </td>
          </tr>
        `;
      })
      .join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MRD Discharge Files Tracking Report</title>
        <style>
          @page {
            size: landscape;
            margin: 12mm 10mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13.5px;
            color: #0f172a;
            padding: 14px;
            line-height: 1.45;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #0d9488;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .hospital-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: -0.02em;
          }
          .report-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 3px;
          }
          .meta-box {
            text-align: right;
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
          }
          .filters-summary {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 16px;
            margin-bottom: 14px;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 13.5px;
            font-weight: 600;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: #f8fafc;
            color: #1e293b;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.03em;
            padding: 10px 10px;
            border: 1.5px solid #cbd5e1;
            text-align: left;
          }
          td {
            padding: 10px 10px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .status-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }
          .status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .status-received { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
          .status-scanned { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }
          .badge.error { background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3; }
          .badge.resolved { background: #d1fae5; color: #059669; border: 1px solid #a7f3d0; }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="hospital-title">SHANMUGA HOSPITAL</div>
            <div class="report-title">MRD Discharge File Tracking Report</div>
          </div>
          <div class="meta-box">
            <div><strong>Generated:</strong> ${todayStr}</div>
            <div><strong>Total Records:</strong> ${fileList.length}</div>
          </div>
        </div>

        <div class="filters-summary">
          <div>Status Filter: <strong style="color:#0f766e;">${activeTab}</strong></div>
          ${fromDate ? `<div>From Date: <strong>${fromDate}</strong></div>` : ""}
          ${toDate ? `<div>To Date: <strong>${toDate}</strong></div>` : ""}
          ${searchQuery ? `<div>Search Query: <strong>${searchQuery}</strong></div>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 120px;">MRD ID</th>
              <th>Patient & Admission Details</th>
              <th style="text-align:center; width: 90px;">Status</th>
              <th style="width: 130px;">Error Details</th>
              <th style="width: 70px; text-align: center;">File</th>
              <th style="width: 380px;">Audit Details (D&T)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>




        <div class="footer">
          <div>Shanmuga Hospital — Medical Records Department (MRD)</div>
          <div>Filtered Report (${fileList.length} patient files)</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(printHtml);
    printWin.document.close();
  };


  // Date formatters (Calculated with +5:30 Indian Standard Time)
  const formatDateTime = (val) => {
    if (!val) return "—";
    try {
      const str = String(val).trim();
      let d;
      if (str.includes("T") && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
        d = new Date(str + "Z");
      } else {
        d = new Date(str);
      }
      if (isNaN(d.getTime())) {
        d = new Date(str);
      }
      if (isNaN(d.getTime())) return str;

      return d.toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(val);
    }
  };

  const formatDateOnly = (val) => {
    if (!val) return "—";
    try {
      const str = String(val).trim();
      let d;
      if (str.includes("T") && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
        d = new Date(str + "Z");
      } else {
        d = new Date(str);
      }
      if (isNaN(d.getTime())) {
        d = new Date(str);
      }
      if (isNaN(d.getTime())) return str;

      return d.toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(val);
    }
  };


  return (
    <PageWrapper>
      {/* Header */}
      <PageHeader>
        <HeaderTitleGroup>
          <div className="icon-wrap">
            <FileText size={24} />
          </div>
          <div>
            <h1>MRD Discharge File Tracking</h1>
            <p>
              Track and manage medical record files for discharged patients (Received, Error Resolution & Scanned workflow)
            </p>
          </div>
        </HeaderTitleGroup>

        <HeaderActions>
          <PrintBtn onClick={handlePrintFilteredData} disabled={loading || files.length === 0} title="Print filtered records">
            <Printer size={15} />
            Print Report
          </PrintBtn>

          <RefreshBtn onClick={fetchDischargedFiles} disabled={loading} title="Refresh records list">
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </RefreshBtn>
        </HeaderActions>
      </PageHeader>

      {/* Summary Metrics Cards */}
      <StatsGrid>
        <StatCard $accentColor="#6366f1">
          <StatInfo>
            <span className="stat-label">Total Discharged</span>
            <span className="stat-val">{stats.total}</span>
          </StatInfo>
          <StatIconBox $bg="rgba(99, 102, 241, 0.12)" $color="#6366f1">
            <Hospital size={22} />
          </StatIconBox>
        </StatCard>

        <StatCard $accentColor={theme.amber}>
          <StatInfo>
            <span className="stat-label">Pending Handover</span>
            <span className="stat-val">{stats.pending}</span>
          </StatInfo>
          <StatIconBox $bg={theme.amberLight} $color={theme.amber}>
            <Clock size={22} />
          </StatIconBox>
        </StatCard>

        <StatCard $accentColor={theme.sky}>
          <StatInfo>
            <span className="stat-label">Received in MRD</span>
            <span className="stat-val">{stats.received}</span>
          </StatInfo>
          <StatIconBox $bg={theme.skyLight} $color={theme.sky}>
            <CheckCircle2 size={22} />
          </StatIconBox>
        </StatCard>

        <StatCard $accentColor={theme.danger}>
          <StatInfo>
            <span className="stat-label">Unresolved Errors</span>
            <span className="stat-val">{stats.has_error || 0}</span>
          </StatInfo>
          <StatIconBox $bg={theme.dangerLight} $color={theme.danger}>
            <AlertTriangle size={22} />
          </StatIconBox>
        </StatCard>

        <StatCard $accentColor={theme.teal}>
          <StatInfo>
            <span className="stat-label">Resolved Errors</span>
            <span className="stat-val">{stats.resolved_error || 0}</span>
          </StatInfo>
          <StatIconBox $bg={theme.tealLight} $color={theme.teal}>
            <CheckCheck size={22} />
          </StatIconBox>
        </StatCard>

        <StatCard $accentColor={theme.emerald}>
          <StatInfo>
            <span className="stat-label">Scanned & Digitized</span>
            <span className="stat-val">{stats.scanned}</span>
          </StatInfo>
          <StatIconBox $bg={theme.emeraldLight} $color={theme.emerald}>
            <Scan size={22} />
          </StatIconBox>
        </StatCard>
      </StatsGrid>

      {/* Filter Toolbar */}
      <FilterCard>
        <FilterTopRow>
          {/* Status Filter Capsules with Distinct Colors and Tooltips */}
          <TabGroup>
            {[
              {
                key: "All",
                label: "All Files",
                tooltip: "Click on to filter by All files",
                icon: Hospital,
                cfg: {
                  bg: "#eef2ff",
                  text: "#4338ca",
                  border: "#c7d2fe",
                  activeBg: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  badgeBg: "#e0e7ff",
                  badgeColor: "#3730a3",
                  shadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
                  hoverShadow: "0 4px 12px rgba(79, 70, 229, 0.22)",
                },
              },
              {
                key: "Pending",
                label: "Pending",
                tooltip: "Click on to filter by Pending files",
                icon: Clock,
                cfg: {
                  bg: "#fffbeb",
                  text: "#b45309",
                  border: "#fde68a",
                  activeBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  badgeBg: "#fef3c7",
                  badgeColor: "#92400e",
                  shadow: "0 4px 14px rgba(217, 119, 6, 0.35)",
                  hoverShadow: "0 4px 12px rgba(217, 119, 6, 0.22)",
                },
              },
              {
                key: "Received",
                label: "Received",
                tooltip: "Click on to filter by Received files",
                icon: CheckCircle2,
                cfg: {
                  bg: "#f0f9ff",
                  text: "#0369a1",
                  border: "#bae6fd",
                  activeBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  badgeBg: "#e0f2fe",
                  badgeColor: "#075985",
                  shadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                  hoverShadow: "0 4px 12px rgba(2, 132, 199, 0.22)",
                },
              },
              {
                key: "Error",
                label: "Unresolved Errors",
                tooltip: "Click on to filter files with pending Nurse/Doctor errors",
                icon: AlertTriangle,
                cfg: {
                  bg: "#fff1f2",
                  text: "#be123c",
                  border: "#fecdd3",
                  activeBg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                  badgeBg: "#ffe4e6",
                  badgeColor: "#9f1239",
                  shadow: "0 4px 14px rgba(225, 29, 72, 0.35)",
                  hoverShadow: "0 4px 12px rgba(225, 29, 72, 0.22)",
                },
              },
              {
                key: "Resolved",
                label: "Resolved Errors",
                tooltip: "Click on to filter files with resolved Nurse/Doctor errors",
                icon: CheckCheck,
                cfg: {
                  bg: "#f0fdfa",
                  text: "#0d9488",
                  border: "#99f6e4",
                  activeBg: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
                  badgeBg: "#ccfbf1",
                  badgeColor: "#115e59",
                  shadow: "0 4px 14px rgba(20, 184, 166, 0.35)",
                  hoverShadow: "0 4px 12px rgba(20, 184, 166, 0.22)",
                },
              },
              {
                key: "Scanned",
                label: "Scanned",
                tooltip: "Click on to filter by Scanned files",
                icon: Scan,
                cfg: {
                  bg: "#ecfdf5",
                  text: "#047857",
                  border: "#a7f3d0",
                  activeBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  badgeBg: "#d1fae5",
                  badgeColor: "#065f46",
                  shadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
                  hoverShadow: "0 4px 12px rgba(5, 150, 105, 0.22)",
                },
              },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const count =
                tab.key === "All"
                  ? stats.total
                  : tab.key === "Pending"
                    ? stats.pending
                    : tab.key === "Received"
                      ? stats.received
                      : tab.key === "Error"
                        ? stats.has_error || 0
                        : tab.key === "Resolved"
                          ? stats.resolved_error || 0
                          : stats.scanned;

              return (
                <CapsuleWrapper key={tab.key}>
                  <FilterCapsule
                    type="button"
                    $active={activeTab === tab.key}
                    $cfg={tab.cfg}
                    onClick={() => setActiveTab(tab.key)}
                    title={tab.tooltip}
                  >
                    <span className="capsule-icon">
                      <IconComponent size={15} />
                    </span>
                    <span>{tab.label}</span>
                    <span className="badge">{count}</span>
                  </FilterCapsule>
                  <TooltipBubble className="tooltip-bubble">
                    {tab.tooltip}
                  </TooltipBubble>
                </CapsuleWrapper>
              );
            })}
          </TabGroup>

          {/* Quick Date Presets with Tooltips */}
          <QuickDates>
            {[
              { key: "all", label: "All Time", tip: "Click on to filter all dates" },
              { key: "today", label: "Today", tip: "Click on to filter today's files" },
              { key: "last7", label: "Last 7 Days", tip: "Click on to filter past 7 days" },
              { key: "thisMonth", label: "This Month", tip: "Click on to filter this month" },
            ].map((d) => (
              <CapsuleWrapper key={d.key}>
                <button
                  type="button"
                  onClick={() => setQuickDate(d.key)}
                  title={d.tip}
                >
                  {d.label}
                </button>
                <TooltipBubble className="tooltip-bubble">
                  {d.tip}
                </TooltipBubble>
              </CapsuleWrapper>
            ))}
          </QuickDates>
        </FilterTopRow>

        <FilterControlsRow>
          {/* Search Bar */}
          <SearchBox>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by IP No, UHID, Patient Name, Doctor, MRD ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>

          {/* Date Range: From */}
          <DateInputGroup>
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </DateInputGroup>

          {/* Date Range: To */}
          <DateInputGroup>
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DateInputGroup>

          {(fromDate || toDate || searchQuery) && (
            <button
              type="button"
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer",
                color: theme.danger,
              }}
              onClick={() => {
                setFromDate("");
                setToDate("");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          )}
        </FilterControlsRow>
      </FilterCard>

      {/* Discharged Files Table */}
      <TableCard>
        {(() => {
          const fileList = Array.isArray(files) ? files : [];
          if (loading && fileList.length === 0) {
            return (
              <LoadingOverlay>
                <div className="spinner" />
                <span>Loading discharged files...</span>
              </LoadingOverlay>
            );
          }
          if (fileList.length === 0) {
            return (
              <EmptyBox>
                <FileCheck size={48} />
                <h3>No Discharged Files Found</h3>
                <p>
                  {searchQuery || fromDate || toDate || activeTab !== "All"
                    ? "No records match your selected filters. Try resetting the filters."
                    : "No discharged patient files are currently available."}
                </p>
              </EmptyBox>
            );
          }
          return (
            <TableScrollWrapper>
              <DataTable>
                <TableHead>
                  <tr>
                    <th style={{ width: "110px" }}>MRD ID</th>
                    <th>Patient & Admission Details</th>
                    <th style={{ textAlign: "center", width: "95px" }}>Status</th>
                    <th style={{ textAlign: "center", background: "#f0f9ff" }}>
                      📥 Received
                    </th>
                    <th style={{ textAlign: "center", background: "#fff1f2" }}>
                      ⚠️ Error Status
                    </th>
                    <th style={{ textAlign: "center", background: "#f5f3ff", minWidth: "165px" }}>
                      📑 Scanned PDF
                    </th>
                    <th style={{ textAlign: "center", background: "#ecfdf5" }}>
                      📄 Scanned
                    </th>
                    <th style={{ minWidth: "300px" }}>Audit Trail (D&T)</th>
                  </tr>
                </TableHead>
                <tbody>
                  {fileList.map((row) => {
                    const isReceived =
                      row.status === "Received" || row.status === "Scanned";
                    const isScanned = row.status === "Scanned";
                    const isPending = row.status === "Pending";
                    const isRowUpdating = updatingIp === row.ip_no;

                    // Error logic
                    const hasError = Boolean(row.is_error);
                    const isErrorResolved = Boolean(row.is_error_resolved);
                    const hasUnresolvedError = hasError && !isErrorResolved;

                    // Scanned checkbox enablement:
                    // Must be Received, AND either no error OR error is resolved!
                    const canScan = isReceived && (!hasError || isErrorResolved);

                    return (
                      <TableRow key={row.ip_no}>
                        {/* MRD ID */}
                        <td>
                          <MrdIdBadge $hasId={Boolean(row.mrd_id)}>
                            {row.mrd_id || "#Pending"}
                          </MrdIdBadge>
                        </td>

                        {/* Combined Patient & Admission Details - One by One */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", lineHeight: "1.35" }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: "800", color: theme.primaryDark }}>
                              IP: {row.ip_no}
                            </div>
                            <div style={{ fontSize: "0.74rem", fontWeight: "600", color: theme.textMid }}>
                              UHID: {row.uhid || "—"}
                            </div>
                            <div style={{ fontWeight: "700", fontSize: "0.86rem", color: theme.textMain, marginTop: "1px" }}>
                              {row.patient_name}
                            </div>
                            {(row.age || row.gender || row.mobile) && (
                              <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>
                                {[row.age ? `${row.age} Yrs` : null, row.gender, row.mobile]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            )}
                            {row.doctor_name && (
                              <div style={{ fontSize: "0.74rem", color: theme.textMid }}>
                                <strong>Doc:</strong> {row.doctor_name}
                              </div>
                            )}
                            {(row.ward_name || row.room_no) && (
                              <div style={{ fontSize: "0.74rem", color: theme.textMid }}>
                                <strong>Ward/Room:</strong> {row.room_no ? `Room ${row.room_no}` : ""} {row.ward_name ? `(${row.ward_name})` : ""}
                              </div>
                            )}
                          </div>
                        </td>


                        {/* Status Badge */}
                        <td style={{ textAlign: "center" }}>
                          <StatusBadge $status={row.status}>
                            {row.status === "Received" && <CheckCircle2 size={12} />}
                            {row.status === "Scanned" && <Scan size={12} />}
                            {row.status === "Pending" && <Clock size={12} />}
                            {row.status}
                          </StatusBadge>
                        </td>


                        {/* Received Checkbox */}
                        <td style={{ textAlign: "center", background: "#f8fafc" }}>
                          {(() => {
                            const isReceivedDisabled = hasError || isScanned || isRowUpdating;
                            return (
                              <CheckboxContainer
                                $checked={isReceived}
                                $color={theme.sky}
                                $disabled={isReceivedDisabled}
                                title={
                                  hasError
                                    ? "File has an Error logged (Received status is locked)"
                                    : isScanned
                                      ? "File already Scanned (Received status is locked)"
                                      : isReceived
                                        ? "Marked as Received (Uncheck to revert to Pending)"
                                        : "Click to mark as Received"
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={isReceived}
                                  disabled={isReceivedDisabled}
                                  onChange={(e) => {
                                    if (isReceivedDisabled) return;
                                    if (e.target.checked) {
                                      handleStatusChange(row, "Received");
                                    } else {
                                      handleStatusChange(row, "Pending");
                                    }
                                  }}
                                />
                                <span>Received</span>
                              </CheckboxContainer>
                            );
                          })()}
                        </td>



                        {/* ⚠️ Error Status & Input Trigger */}
                        <td style={{ textAlign: "center", background: "#fffbfb" }}>
                          {!isReceived ? (
                            <span style={{ fontSize: "0.7rem", color: theme.textMuted }}>
                              Awaiting Received
                            </span>
                          ) : (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <ErrorButton
                                type="button"
                                $hasError={hasError}
                                $isResolved={isErrorResolved}
                                disabled={!hasError && isScanned}
                                onClick={() => openErrorModal(row)}
                                title={
                                  hasError
                                    ? isErrorResolved
                                      ? "Click to view resolved error details"
                                      : "Click to view / resolve error details"
                                    : isScanned
                                      ? "File already Scanned (Errors cannot be added)"
                                      : "Click to report error in this file"
                                }
                              >
                                {hasError ? (
                                  isErrorResolved ? (
                                    <>
                                      <Check size={12} />
                                      <span>Resolved</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle size={12} />
                                      <span>Error Flagged</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <Edit3 size={11} />
                                    <span>Add Error</span>
                                  </>
                                )}
                              </ErrorButton>
                            </div>

                          )}
                        </td>


                        {/* 📑 Scanned PDF Document */}
                        <td style={{ textAlign: "center", background: "#faf5ff" }}>
                          {row.pdf_file_id ? (
                            <PdfDocCard>
                              <div className="pdf-doc-info" title={row.pdf_filename || "MRD Scanned Document.pdf"}>
                                <FileText size={14} className="pdf-icon" />
                                <span className="pdf-filename">{row.pdf_filename || "MRD_Scan.pdf"}</span>
                              </div>
                              <div className="pdf-btn-group">
                                <button
                                  type="button"
                                  className="pdf-btn preview"
                                  onClick={() => handlePreviewPdf(row)}
                                  title="Preview PDF"
                                >
                                  <Eye size={12} />
                                  <span>Preview</span>
                                </button>
                                <button
                                  type="button"
                                  className="pdf-btn download"
                                  onClick={() => handleDownloadPdf(row)}
                                  title="Download PDF"
                                >
                                  <Download size={12} />
                                  <span>Download</span>
                                </button>
                                <label className="pdf-btn replace" title="Replace / Re-upload PDF">
                                  <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    style={{ display: "none" }}
                                    disabled={uploadingIp === row.ip_no}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleFileUpload(row, e.target.files[0]);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  <RefreshCw size={11} className={uploadingIp === row.ip_no ? "spin" : ""} />
                                </label>
                                <button
                                  type="button"
                                  className="pdf-btn delete"
                                  onClick={() => handleDeletePdf(row)}
                                  title="Delete PDF"
                                  disabled={uploadingIp === row.ip_no}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                              {row.pdf_uploaded_date && (
                                <div className="pdf-meta" title={`Uploaded: ${formatDateTime(row.pdf_uploaded_date)}${row.pdf_uploaded_by ? ` by ${row.pdf_uploaded_by}` : ""}`}>
                                  {formatDateOnly(row.pdf_uploaded_date)}
                                  {row.pdf_uploaded_by ? ` • ${row.pdf_uploaded_by}` : ""}
                                </div>
                              )}
                            </PdfDocCard>
                          ) : (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <UploadPdfButton
                                as="label"
                                $disabled={uploadingIp === row.ip_no}
                                title="Upload Scanned PDF file for this record"
                              >
                                <input
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  style={{ display: "none" }}
                                  disabled={uploadingIp === row.ip_no}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileUpload(row, e.target.files[0]);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                {uploadingIp === row.ip_no ? (
                                  <>
                                    <RefreshCw size={12} className="spin" />
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload size={12} />
                                    <span>Upload PDF</span>
                                  </>
                                )}
                              </UploadPdfButton>
                            </div>
                          )}
                        </td>


                        {/* Scanned Checkbox */}
                        <td style={{ textAlign: "center", background: "#f8fafc" }}>
                          {(() => {
                            const isScannedDisabled = !canScan || isScanned || isRowUpdating;
                            return (
                              <CheckboxContainer
                                $checked={isScanned}
                                $color={theme.emerald}
                                $disabled={isScannedDisabled}
                                title={
                                  isPending
                                    ? "Must be Received before it can be Scanned"
                                    : hasUnresolvedError
                                      ? "Cannot Scan: Please resolve Nurse/Doctor errors first"
                                      : isScanned
                                        ? "File process completed (Final stage completed)"
                                        : "Click to complete file process & mark as Scanned"
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={isScanned}
                                  disabled={isScannedDisabled}
                                  onChange={(e) => {
                                    if (isScannedDisabled) return;
                                    if (e.target.checked) {
                                      handleInitiateScan(row);
                                    }
                                  }}
                                />
                                <span>
                                  {hasUnresolvedError ? <Lock size={11} style={{ verticalAlign: "middle" }} /> : null} Scanned
                                </span>
                              </CheckboxContainer>
                            );
                          })()}
                        </td>


                        {/* Audit Trail Details (D&T with +5:30) */}
                        <td>
                          <AuditGrid>
                            <div className="audit-row">
                              <span className="audit-label">Admitted D&T</span>
                              <span className="audit-sep">:</span>
                              <span className="audit-val">{formatDateTime(row.admission_date)}</span>
                            </div>
                            <div className="audit-row">
                              <span className="audit-label">Discharged D&T</span>
                              <span className="audit-sep">:</span>
                              <span className="audit-val">{formatDateTime(row.discharge_date)}</span>
                            </div>
                            <div className="audit-row">
                              <span className="audit-label">Received D&T</span>
                              <span className="audit-sep">:</span>
                              <span className="audit-val">
                                {row.received_date ? (
                                  <>
                                    {formatDateTime(row.received_date)}
                                    {row.received_by && <span className="audit-user"> ({row.received_by})</span>}
                                  </>
                                ) : (
                                  <span className="audit-empty">—</span>
                                )}
                              </span>
                            </div>
                            {row.is_error && row.error_reported_date && (
                              <div className="audit-row error">
                                <span className="audit-label">Error Flagged D&T</span>
                                <span className="audit-sep">:</span>
                                <span className="audit-val">
                                  {formatDateTime(row.error_reported_date)}
                                  {row.error_reported_by && <span className="audit-user"> ({row.error_reported_by})</span>}
                                </span>
                              </div>
                            )}
                            {row.is_error && row.is_error_resolved && row.error_resolved_date && (
                              <div className="audit-row resolved">
                                <span className="audit-label">Error Resolved D&T</span>
                                <span className="audit-sep">:</span>
                                <span className="audit-val">
                                  {formatDateTime(row.error_resolved_date)}
                                  {row.error_resolved_by && <span className="audit-user"> ({row.error_resolved_by})</span>}
                                </span>
                              </div>
                            )}
                            <div className="audit-row">
                              <span className="audit-label">Scanned D&T</span>
                              <span className="audit-sep">:</span>
                              <span className="audit-val">
                                {row.scanned_date ? (
                                  <>
                                    {formatDateTime(row.scanned_date)}
                                    {row.scanned_by && <span className="audit-user"> ({row.scanned_by})</span>}
                                  </>
                                ) : (
                                  <span className="audit-empty">—</span>
                                )}
                              </span>
                            </div>
                          </AuditGrid>
                        </td>
                      </TableRow>
                    );
                  })}
                </tbody>

              </DataTable>
            </TableScrollWrapper>
          );
        })()}
      </TableCard>

      {/* ─── Error Entry & Resolution Modal ────────────────────────────────────── */}
      {errorModal.isOpen && (
        <ModalOverlay onClick={closeErrorModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                <AlertTriangle size={18} color={theme.danger} />
                Discharge File Error Tracking
              </h3>
              <button className="close-btn" onClick={closeErrorModal}>
                <X size={18} />
              </button>
            </ModalHeader>

            <ModalBody>
              {errorModal.file && (
                <PatientHeaderCard>
                  <div>
                    IP: <span className="bold">{errorModal.file.ip_no}</span> | UHID: <span className="bold">{errorModal.file.uhid}</span>
                  </div>
                  <div>
                    Patient: <span className="bold">{errorModal.file.patient_name}</span>
                  </div>
                </PatientHeaderCard>
              )}

              {/* Toggle Is Error */}
              <ToggleSwitch $disabled={errorModal.isResolved}>
                <div>
                  <div className="toggle-label">Is there an Error in this file?</div>
                  <div className="toggle-desc">
                    {errorModal.isResolved
                      ? "Error status is resolved and locked."
                      : errorModal.isError
                        ? "Error active: Scanned status will be locked until marked resolved."
                        : "No error: Scanned status is directly available."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={errorModal.isError}
                  disabled={errorModal.isResolved}
                  onChange={(e) => {
                    if (errorModal.isResolved) return;
                    setErrorModal((prev) => ({
                      ...prev,
                      isError: e.target.checked,
                    }));
                  }}
                />
              </ToggleSwitch>


              {/* Conditional Error Inputs */}
              {errorModal.isError && (
                <>
                  <FormGroup>
                    <label>
                      <HeartPulse size={14} color={theme.danger} />
                      Nurse Error Details
                    </label>
                    <textarea
                      placeholder="e.g., Incomplete vitals charting, missing nursing signatures, consumables discrepancy..."
                      value={errorModal.nurseError}
                      readOnly={errorModal.isResolved}
                      disabled={errorModal.isResolved}
                      style={{
                        backgroundColor: errorModal.isResolved ? "#f8fafc" : "#ffffff",
                        cursor: errorModal.isResolved ? "not-allowed" : "text",
                      }}
                      onChange={(e) =>
                        setErrorModal((prev) => ({
                          ...prev,
                          nurseError: e.target.value,
                        }))
                      }
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>
                      <Stethoscope size={14} color={theme.sky} />
                      Doctor Error Details
                    </label>
                    <textarea
                      placeholder="e.g., Discharge summary unsigned, missing final diagnosis, operative notes pending..."
                      value={errorModal.doctorError}
                      readOnly={errorModal.isResolved}
                      disabled={errorModal.isResolved}
                      style={{
                        backgroundColor: errorModal.isResolved ? "#f8fafc" : "#ffffff",
                        cursor: errorModal.isResolved ? "not-allowed" : "text",
                      }}
                      onChange={(e) =>
                        setErrorModal((prev) => ({
                          ...prev,
                          doctorError: e.target.value,
                        }))
                      }
                    />
                  </FormGroup>

                  {/* Resolution Status Card */}
                  <div
                    style={{
                      background: errorModal.isResolved ? theme.emeraldLight : "#f8fafc",
                      border: `1.5px solid ${errorModal.isResolved ? theme.emeraldBorder : theme.border}`,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.84rem", fontWeight: 700, color: errorModal.isResolved ? theme.emerald : theme.textMain }}>
                        {errorModal.isResolved ? "✅ Error Marked as Resolved" : "⏳ Error Pending Resolution"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: errorModal.isResolved ? "#047857" : theme.textMuted, marginTop: "2px" }}>
                        {errorModal.isResolved
                          ? "This error is resolved. Scanning is enabled and editing is locked."
                          : "Click 'Mark as Resolved' below once verified to unlock scanning."}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <button className="cancel-btn" type="button" onClick={closeErrorModal}>
                {errorModal.isResolved ? "Close" : "Cancel"}
              </button>
              {!errorModal.isResolved && (
                <>
                  <button
                    className="save-btn"
                    type="button"
                    disabled={errorModal.saving}
                    onClick={handleSaveError}
                  >
                    {errorModal.saving ? "Saving..." : "Save Error Details"}
                  </button>
                  {errorModal.isError && (
                    <button
                      type="button"
                      disabled={errorModal.saving}
                      onClick={handleModalDirectResolve}
                      style={{
                        background: theme.emerald,
                        border: `1px solid ${theme.emeraldBorder}`,
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                      }}
                    >
                      <Check size={14} />
                      {errorModal.saving ? "Resolving..." : "Mark as Resolved"}
                    </button>
                  )}
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ─── Confirm Scan / Final Completion Modal ────────────────────────────── */}
      {confirmScanModal.isOpen && confirmScanModal.file && (
        <ModalOverlay onClick={handleCancelScan}>
          <ModalContent style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                <Scan size={18} color={theme.emerald} />
                Complete File Process
              </h3>
              <button className="close-btn" onClick={handleCancelScan}>
                <X size={18} />
              </button>
            </ModalHeader>

            <ModalBody>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: theme.emeraldLight,
                    color: theme.emerald,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "1rem", fontWeight: 700, color: theme.textMain }}>
                    Are you sure to complete this file process?
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: theme.textMid, lineHeight: 1.45 }}>
                    This is the <strong>final stage</strong> of MRD file tracking. Once confirmed, this file will be finalized as <strong>Scanned & Digitized</strong> and its status will be locked.
                  </p>
                </div>
              </div>

              <PatientHeaderCard style={{ marginTop: "14px" }}>
                <div>
                  IP: <span className="bold">{confirmScanModal.file.ip_no}</span> | UHID: <span className="bold">{confirmScanModal.file.uhid}</span>
                </div>
                <div>
                  Patient: <span className="bold">{confirmScanModal.file.patient_name}</span>
                </div>
              </PatientHeaderCard>
            </ModalBody>

            <ModalFooter>
              <button
                className="cancel-btn"
                type="button"
                onClick={handleCancelScan}
                disabled={confirmScanModal.loading}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmScanModal.loading}
                onClick={handleConfirmScan}
                style={{
                  background: theme.emerald,
                  border: `1px solid ${theme.emeraldBorder}`,
                  color: "#ffffff",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                }}
              >
                <Check size={14} />
                {confirmScanModal.loading ? "Completing..." : "Yes, Mark as Scanned"}
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ─── PDF Preview Modal ─────────────────────────────────────── */}
      {pdfPreviewModal.isOpen && pdfPreviewModal.file && (
        <ModalOverlay onClick={closePdfPreviewModal}>
          <PdfPreviewModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(13, 148, 136, 0.12)",
                    color: theme.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", color: theme.textMain }}>
                    {pdfPreviewModal.file.pdf_filename || "MRD Scanned Document.pdf"}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: theme.textMid, marginTop: "2px" }}>
                    IP: <strong style={{ color: theme.primaryDark }}>{pdfPreviewModal.file.ip_no}</strong> • UHID: <strong>{pdfPreviewModal.file.uhid || "—"}</strong> • Patient: <strong>{pdfPreviewModal.file.patient_name}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Download button */}
                <HeaderActionBtn
                  type="button"
                  onClick={() => handleDownloadPdf(pdfPreviewModal.file)}
                  title="Download PDF"
                >
                  <Download size={14} />
                  <span>Download</span>
                </HeaderActionBtn>

                {/* Open in new tab button */}
                <HeaderActionBtn
                  type="button"
                  onClick={() => {
                    const openUrl = pdfPreviewModal.blobUrl || `${BASE}mrd/file/${pdfPreviewModal.file.pdf_file_id}/`;
                    window.open(openUrl, "_blank");
                  }}
                  title="Open in new window"
                >
                  <ExternalLink size={14} />
                  <span>New Tab</span>
                </HeaderActionBtn>

                <button className="close-btn" onClick={closePdfPreviewModal} title="Close Preview">
                  <X size={18} />
                </button>
              </div>
            </ModalHeader>

            <PdfModalBody>
              {pdfPreviewModal.loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#ffffff",
                    gap: "12px",
                  }}
                >
                  <RefreshCw size={28} className="spin" />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Loading document preview...</span>
                </div>
              ) : pdfPreviewModal.error ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#ffffff",
                    padding: "24px",
                    textAlign: "center",
                    gap: "14px",
                  }}
                >
                  <AlertTriangle size={36} color="#f87171" />
                  <div style={{ fontSize: "1rem", fontWeight: 700 }}>Unable to render inline preview</div>
                  <p style={{ fontSize: "0.82rem", color: "#cbd5e1", maxWidth: "400px", margin: 0 }}>
                    {pdfPreviewModal.error}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <HeaderActionBtn
                      type="button"
                      onClick={() => handlePreviewPdf(pdfPreviewModal.file)}
                    >
                      <RefreshCw size={14} />
                      Retry
                    </HeaderActionBtn>
                    <HeaderActionBtn
                      type="button"
                      onClick={() => handleDownloadPdf(pdfPreviewModal.file)}
                    >
                      <Download size={14} />
                      Download Instead
                    </HeaderActionBtn>
                  </div>
                </div>
              ) : (
                <iframe
                  src={pdfPreviewModal.blobUrl}
                  title="MRD PDF Preview"
                  width="100%"
                  height="100%"
                  style={{ border: "none", width: "100%", height: "100%", background: "#ffffff" }}
                />
              )}
            </PdfModalBody>
          </PdfPreviewModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

