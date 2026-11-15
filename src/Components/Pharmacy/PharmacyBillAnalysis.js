import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaFileInvoiceDollar,
  FaUndoAlt,
  FaUserInjured,
  FaBed,
  FaMoneyBillWave,
  FaPills,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaSyncAlt,
  FaDownload,
  FaPrint,
  FaEye,
  FaStore,
  FaHospitalUser,
  FaReceipt,
  FaArrowRight,
  FaInfoCircle,
  FaUsers,
  FaPhoneAlt,
  FaBoxes,
  FaListAlt,
  FaLayerGroup,
  FaHashtag,
} from "react-icons/fa";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  if (envUrl && envUrl.startsWith("http")) return envUrl;
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";
  }
  return envUrl || "/_b_a_c_k_e_n_d/HMS/";
};
const HmsBaseUrl = getBaseUrl();

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────
const Container = styled.div`
  padding: 20px 24px;
  background: #f4f7fb;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;
  animation: ${fadeIn} 0.25s ease-out;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 2px 0 0;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;


// ─── Filter Bar ─────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
`;

const DateInput = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;

  svg {
    color: #64748b;
  }

  input[type="date"] {
    border: none;
    background: transparent;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    font-family: inherit;
    cursor: pointer;
  }
`;

const QuickDateButtons = styled.div`
  display: flex;
  gap: 6px;

  button {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    &.active {
      background: #2563eb;
      color: #fff;
      border-color: #2563eb;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;

  input {
    width: 100%;
    padding: 7px 12px 7px 34px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: #fff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
  }

  svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 13px;
  }
`;

const SelectBox = styled.select`
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  font-weight: 500;

  &:focus {
    background: #fff;
    border-color: #2563eb;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &.primary {
    background: #2563eb;
    color: #fff;
    &:hover { background: #1d4ed8; }
  }

  &.secondary {
    background: #fff;
    border-color: #cbd5e1;
    color: #334155;
    &:hover { background: #f1f5f9; }
  }

  &.refresh {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }

  svg {
    font-size: 13px;
  }
`;

// ─── Summary KPI Cards ───────────────────────────────────────────────────────
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ color }) => color || "#2563eb"};
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .stat-val {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }

  .stat-sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`;

// ─── Main Table Container ───────────────────────────────────────────────────
const TableWrapper = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  background: #fcfdfe;
  flex-wrap: wrap;
  gap: 10px;

  .left-info {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .view-toggles {
    display: inline-flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    gap: 4px;

    button {
      border: none;
      background: transparent;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;

      &.active {
        background: #fff;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }
    }
  }
`;

const TableScroll = styled.div`
  overflow-x: auto;
  max-width: 100%;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;

  thead {
    background: #f1f5f9;
    border-bottom: 2px solid #e2e8f0;

    th {
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
      user-select: none;

      &.sortable {
        cursor: pointer;
        &:hover {
          background: #e2e8f0;
        }
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;

      &:hover {
        background: #f8fafc;
      }

      &.highlighted {
        background: #eff6ff;
      }
    }

    td {
      padding: 12px 14px;
      color: #1e293b;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
`;

// ─── Status Badges (matching Screenshot 1 & 2) ──────────────────────────────
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case "Ip Credit Bills":
        return `
          background: #fff3e0;
          color: #d97706;
          border: 1px solid #fde68a;
        `;
      case "Cash Bill":
        return `
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        `;
      case "Cancelled":
        return `
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        `;
    }
  }}
`;

const IndicatorPill = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ val }) => (val === "Yes" ? "#e0f2fe" : "#f1f5f9")};
  color: ${({ val }) => (val === "Yes" ? "#0284c7" : "#94a3b8")};
  border: 1px solid ${({ val }) => (val === "Yes" ? "#bae6fd" : "#e2e8f0")};
`;

const PillBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $bg }) => $bg || "#f1f5f9"};
  color: ${({ $color }) => $color || "#334155"};
  white-space: nowrap;
`;

const ActionIconButton = styled.button`
  border: none;
  background: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;

  &:hover {
    background: #2563eb;
    color: #fff;
    transform: scale(1.05);
  }
`;

// ─── Pagination ─────────────────────────────────────────────────────────────
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fcfdfe;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;

  .entry-info {
    font-size: 13px;
    color: #64748b;
  }

  .page-controls {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      min-width: 32px;
      height: 32px;
      padding: 0 6px;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #334155;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      &.active {
        background: #0f766e;
        color: #fff;
        border-color: #0f766e;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
`;

// ─── Modal / Drawer for Bill Travel Details ──────────────────────────────────
const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DrawerContent = styled.div`
  background: #fff;
  width: 100%;
  max-width: 860px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.25s ease-out;
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  padding: 20px 24px;
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .title-group {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
  }

  button.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const DetailCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
  flex-shrink: 0;
  min-height: fit-content;

  .card-header {
    background: #f8fafc;
    padding: 12px 18px;
    border-bottom: 1px solid #e2e8f0;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;

    svg {
      color: #2563eb;
    }
  }

  .card-body {
    padding: 16px 18px;
  }
`;

const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px 16px;

  .field-item {
    .label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
      word-break: break-word;
      line-height: 1.4;
    }
  }
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead {
    background: #f1f5f9;
    th {
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      color: #475569;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      &:hover {
        background: #f8fafc;
      }
    }
    td {
      padding: 8px 12px;
      color: #1e293b;
    }
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #64748b;

  svg {
    font-size: 36px;
    color: #cbd5e1;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: ${spin} 0.8s ease-in-out infinite;
`;

const SpinIcon = styled(FaSyncAlt)`
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${spin} 1s linear infinite;
    `}
`;


// ─── Item-wise Patient Purchase Analysis Styled Components ──────────────────
const ModuleTabNav = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
  flex-wrap: wrap;
`;

const ModuleTabBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;

  &:hover {
    background: #f8fafc;
    color: #0f172a;
    border-color: #cbd5e1;
  }

  &.active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  svg {
    font-size: 15px;
  }
`;

const ItemSearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;

  input {
    width: 100%;
    padding: 8px 36px 8px 36px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 13px;
    pointer-events: none;
  }

  .clear-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    cursor: pointer;
    font-size: 13px;
    padding: 2px;

    &:hover {
      color: #ef4444;
    }
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  padding: 6px 0;
  margin: 0;
  list-style: none;
`;

const SuggestionItem = styled.li`
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;

  &:hover {
    background: #eff6ff;
    color: #2563eb;
  }

  .item-name {
    font-weight: 600;
  }

  .item-badge {
    font-size: 11px;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const DetailBanner = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);

  .item-info {
    h3 {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }
  }

  .stats-summary {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const PillStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg || "#f1f5f9"};
  color: ${({ $color }) => $color || "#334155"};
  font-size: 12px;
  font-weight: 600;

  strong {
    font-size: 14px;
    font-weight: 700;
  }
`;

const GroupToggleBar = styled.div`
  display: inline-flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 4px;

  button {
    border: none;
    background: transparent;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;

    &.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }
`;


// ─── Format Date & Time in IST ───────────────────────────────────────────────
const formatDateTime = (raw) => {
  if (!raw || raw === "—" || raw === "N/A") return "—";
  const s = String(raw).trim();
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s;
  try {
    const iso = s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s) ? s + "Z" : s;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
      const timePart = d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      return `${datePart} ${timePart}`;
    }
  } catch (e) {}
  return s;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function PharmacyBillAnalysis() {
  // Default to today in IST
  const todayStr = useMemo(() => {
    try {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);

  // Filter states
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("standard"); // "standard" or "audit"

  // Authenticated outlet (automatically retrieved from auth/session)
  const [serverOutlet, setServerOutlet] = useState("");
  const outletCode = serverOutlet || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

  // Data states
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    total_bills: 0,
    total_gross: 0,
    total_discount: 0,
    total_advance: 0,
    total_ip_return: 0,
    total_sales_return: 0,
    total_net: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected Bill Travel Modal
  const [selectedBill, setSelectedBill] = useState(null);

  // ─── Module Tab: "bills" (Bill Travel & Financial Analysis) or "item_patient" (Item-wise Patient Purchase Analysis)
  const [activeModuleTab, setActiveModuleTab] = useState("bills");

  // ─── Item-wise Patient Purchase Analysis States ───
  const [itemFromDate, setItemFromDate] = useState(todayStr);
  const [itemToDate, setItemToDate] = useState(todayStr);
  const [itemActivePreset, setItemActivePreset] = useState("today");
  const [itemSearchInput, setItemSearchInput] = useState("");
  const [selectedItemObj, setSelectedItemObj] = useState(null); // { item_id, item_name }
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const [itemAnalysisData, setItemAnalysisData] = useState([]);
  const [itemSummary, setItemSummary] = useState({
    total_items: 0,
    total_quantity: 0,
    total_unique_uhids: 0,
    total_unique_ips: 0,
    total_bills: 0,
  });
  const [itemLoading, setItemLoading] = useState(false);
  const [itemErrorMsg, setItemErrorMsg] = useState("");

  // Patient detail view for a selected item
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [patientListSearch, setPatientListSearch] = useState("");
  const [patientViewMode, setPatientViewMode] = useState("all_bills"); // "all_bills" or "grouped_patients"

  // Item table local search and pagination
  const [itemTableSearch, setItemTableSearch] = useState("");
  const [itemCurrentPage, setItemCurrentPage] = useState(1);
  const [itemPageSize, setItemPageSize] = useState(10);

  // Fetch Item-wise Patient Purchase Analysis
  const fetchItemAnalysis = useCallback(
    async (overrideSearch, overrideId) => {
      setItemLoading(true);
      setItemErrorMsg("");
      setIsSuggestionsOpen(false);

      const searchVal =
        overrideSearch !== undefined ? overrideSearch : itemSearchInput.trim();
      const idVal =
        overrideId !== undefined ? overrideId : (selectedItemObj?.item_id || null);

      const payload = {
        from_date: itemFromDate,
        to_date: itemToDate,
        search_item: searchVal,
        item_id: idVal,
      };

      try {
        const res = await apiRequest(
          `${HmsBaseUrl}PharmacyItemPatientAnalysis/`,
          "POST",
          payload
        );

        if (res.success && res.data) {
          const body = res.data;
          if (body.success) {
            const dataList = body.data || [];
            setItemAnalysisData(dataList);
            if (body.summary) {
              setItemSummary(body.summary);
            }
            setItemCurrentPage(1);

            // If exactly one item returned or specific search made, select it
            if (dataList.length === 1) {
              setSelectedItemForDetail(dataList[0]);
            } else if (selectedItemForDetail) {
              const matched = dataList.find(
                (x) =>
                  x.item_id === selectedItemForDetail.item_id ||
                  x.item_name === selectedItemForDetail.item_name
              );
              if (matched) {
                setSelectedItemForDetail(matched);
              }
            }
          } else {
            setItemErrorMsg(body.error || "Failed to load item purchase analysis.");
          }
        } else {
          setItemErrorMsg(
            res.error || "Server error while fetching item purchase analysis."
          );
        }
      } catch (err) {
        console.error("fetchItemAnalysis error:", err);
        setItemErrorMsg("Network error. Please try again.");
      } finally {
        setItemLoading(false);
      }
    },
    [itemFromDate, itemToDate, itemSearchInput, selectedItemObj, selectedItemForDetail]
  );

  // Apply Quick Date Preset for Item Analysis
  const applyItemPreset = (preset) => {
    setItemActivePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().slice(0, 10);

    if (preset === "today") {
      setItemFromDate(todayStr);
      setItemToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      setItemFromDate(formatDate(y));
      setItemToDate(formatDate(y));
    } else if (preset === "thisweek") {
      const l7 = new Date();
      l7.setDate(today.getDate() - 6);
      setItemFromDate(formatDate(l7));
      setItemToDate(todayStr);
    } else if (preset === "thismonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setItemFromDate(formatDate(startOfMonth));
      setItemToDate(todayStr);
    } else if (preset === "all") {
      setItemFromDate("all");
      setItemToDate("all");
    }
  };

  // Autocomplete live suggestion effect
  useEffect(() => {
    const q = itemSearchInput.trim();
    if (q.length < 2) {
      setItemSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}search_pharmacy_items/?q=${encodeURIComponent(q)}`,
          "GET"
        );
        if (res.success && res.data && res.data.success) {
          setItemSuggestions(res.data.data || []);
        }
      } catch (e) {
        // ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [itemSearchInput]);

  // Initial load when item_patient tab is active
  useEffect(() => {
    if (activeModuleTab === "item_patient" && itemAnalysisData.length === 0) {
      fetchItemAnalysis();
    }
  }, [activeModuleTab, fetchItemAnalysis, itemAnalysisData.length]);

  const handleSelectItemSuggestion = (item) => {
    setItemSearchInput(item.item_name);
    setSelectedItemObj(item);
    setIsSuggestionsOpen(false);
    fetchItemAnalysis(item.item_name, item.item_id);
  };

  const handleClearItemSearch = () => {
    setItemSearchInput("");
    setSelectedItemObj(null);
    setIsSuggestionsOpen(false);
    setSelectedItemForDetail(null);
    fetchItemAnalysis("", null);
  };

  // Export Items Summary to CSV
  const handleExportItemSummaryCSV = () => {
    if (!itemAnalysisData.length) return;
    const headers = [
      "Item ID",
      "Item Name",
      "Total Quantity Sold",
      "Total Unique UHIDs (Patients)",
      "Total Unique IP Numbers",
      "Total Bills",
    ];

    const rows = itemAnalysisData.map((it) => [
      it.item_id || "",
      `"${(it.item_name || "").replace(/"/g, '""')}"`,
      it.total_quantity || 0,
      it.unique_uhid_count || 0,
      it.unique_ip_count || 0,
      it.total_bills_count || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Pharmacy_Item_Purchase_Summary_${itemFromDate}_to_${itemToDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Patient Details for Selected Item to CSV
  const handleExportPatientListCSV = () => {
    if (!selectedItemForDetail || !selectedItemForDetail.patients?.length) return;
    const headers = [
      "Patient Name",
      "UHID",
      "IP Number",
      "Mobile Number",
      "Bill Number",
      "Bill Date & Time",
      "Purchased Quantity",
      "Batch Number",
    ];

    const rows = selectedItemForDetail.patients.map((p) => [
      `"${(p.patient_name || "").replace(/"/g, '""')}"`,
      `"${p.uhid || ""}"`,
      `"${
        p.inpatient_number &&
        p.inpatient_number !== "—" &&
        !String(p.inpatient_number).trim().toUpperCase().startsWith("OP") &&
        String(p.inpatient_number).trim().toLowerCase() !== "none"
          ? p.inpatient_number
          : ""
      }"`,
      `"${p.mobile_number || ""}"`,
      `"${p.bill_number || ""}"`,
      `"${p.bill_date || ""}"`,
      p.purchased_quantity || 0,
      `"${p.batch_number || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const cleanName = (selectedItemForDetail.item_name || "Item").replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    link.setAttribute(
      "download",
      `Patient_Purchases_${cleanName}_${itemFromDate}_to_${itemToDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered patients for the currently selected item
  const filteredPatients = useMemo(() => {
    if (!selectedItemForDetail?.patients) return [];
    if (!patientListSearch.trim()) return selectedItemForDetail.patients;
    const term = patientListSearch.toLowerCase().trim();
    return selectedItemForDetail.patients.filter((p) => {
      return (
        (p.patient_name && p.patient_name.toLowerCase().includes(term)) ||
        (p.uhid && p.uhid.toLowerCase().includes(term)) ||
        (p.inpatient_number && p.inpatient_number.toLowerCase().includes(term)) ||
        (p.mobile_number && p.mobile_number.toLowerCase().includes(term)) ||
        (p.bill_number && p.bill_number.toLowerCase().includes(term))
      );
    });
  }, [selectedItemForDetail, patientListSearch]);

  // Grouped patients (deduplicated by UHID, consolidating multiple bills & total qty)
  const groupedPatients = useMemo(() => {
    if (!filteredPatients.length) return [];
    const map = new Map();
    filteredPatients.forEach((p) => {
      const key = p.uhid && p.uhid !== "—" ? p.uhid : `anon_${p.bill_number}`;
      if (!map.has(key)) {
        map.set(key, {
          uhid: p.uhid,
          patient_name: p.patient_name,
          mobile_number: p.mobile_number,
          ip_numbers: new Set(),
          bills: new Set(),
          total_qty: 0,
          latest_date: p.bill_date,
        });
      }
      const entry = map.get(key);
      entry.total_qty += Number(p.purchased_quantity || 0);
      const validIp =
        p.inpatient_number &&
        p.inpatient_number !== "—" &&
        !String(p.inpatient_number).trim().toUpperCase().startsWith("OP") &&
        String(p.inpatient_number).trim().toLowerCase() !== "none"
          ? String(p.inpatient_number).trim()
          : null;
      if (validIp) {
        entry.ip_numbers.add(validIp);
      }
      if (p.bill_number && p.bill_number !== "—") {
        entry.bills.add(p.bill_number);
      }
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      total_qty: Math.round(entry.total_qty * 100) / 100,
      ip_display: Array.from(entry.ip_numbers).filter(Boolean).join(", ") || "",
      bills_display: Array.from(entry.bills),
      bills_count: entry.bills.size,
    }));
  }, [filteredPatients]);

  // Filtered and paginated items for Items Overview Table
  const filteredItemAnalysis = useMemo(() => {
    if (!itemTableSearch.trim()) return itemAnalysisData;
    const term = itemTableSearch.toLowerCase().trim();
    return itemAnalysisData.filter(
      (it) =>
        (it.item_name && it.item_name.toLowerCase().includes(term)) ||
        (it.item_id && String(it.item_id).toLowerCase().includes(term))
    );
  }, [itemAnalysisData, itemTableSearch]);

  const paginatedItems = useMemo(() => {
    const start = (itemCurrentPage - 1) * itemPageSize;
    return filteredItemAnalysis.slice(start, start + itemPageSize);
  }, [filteredItemAnalysis, itemCurrentPage, itemPageSize]);

  const totalItemPages = Math.max(
    1,
    Math.ceil(filteredItemAnalysis.length / itemPageSize)
  );

  // Fetch Bills from backend
  const fetchBillAnalysis = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    const payload = {
      from_date: fromDate,
      to_date: toDate,
      search: searchTerm.trim(),
      status: statusFilter,
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}PharmacyBillanalysis/`, "POST", payload);

      if (res.success && res.data) {
        const body = res.data;
        if (body.success) {
          setBills(body.data || []);
          if (body.summary) {
            setSummary(body.summary);
          }
          if (body.filters?.outlet_code) {
            setServerOutlet(body.filters.outlet_code);
          }
          setCurrentPage(1);
        } else {
          setErrorMsg(body.error || "Failed to load bills.");
        }
      } else {
        setErrorMsg(res.error || "Server error while fetching pharmacy bill analysis.");
      }
    } catch (err) {
      console.error("fetchBillAnalysis error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchBillAnalysis();
  }, [fetchBillAnalysis]);

  // Handle Preset Quick Date Buttons
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().slice(0, 10);

    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      setFromDate(formatDate(y));
      setToDate(formatDate(y));
    } else if (preset === "last7") {
      const l7 = new Date();
      l7.setDate(today.getDate() - 7);
      setFromDate(formatDate(l7));
      setToDate(todayStr);
    } else if (preset === "thismonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDate(startOfMonth));
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("all");
      setToDate("all");
    }
  };

  // Filtered bills in memory (for immediate sub-filtering)
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (b.bill_number && b.bill_number.toLowerCase().includes(term)) ||
        (b.uhid && b.uhid.toLowerCase().includes(term)) ||
        (b.patient_name && b.patient_name.toLowerCase().includes(term)) ||
        (b.inpatient_number && b.inpatient_number.toLowerCase().includes(term))
      );
    });
  }, [bills, searchTerm]);

  // Paginated Bills
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredBills.length) return;
    const headers = [
      "Status",
      "Date & Time",
      "Bill Type",
      "Bill Number",
      "UHID No",
      "Patient Name",
      "Inpatient No",
      "Gross Amount",
      "Discount",
      "Advance",
      "IP Return",
      "Sales Return",
      "Net Amount",
      "Bill Cancelled",
      "Cash Bill",
      "Sales Return Entered",
      "IP Cleared",
    ];

    const rows = filteredBills.map((b) => [
      `"${b.status || ""}"`,
      `"${b.date_time || ""}"`,
      `"${b.bill_type || ""}"`,
      `"${b.bill_number || ""}"`,
      `"${b.uhid || ""}"`,
      `"${(b.patient_name || "").replace(/"/g, '""')}"`,
      `"${b.inpatient_number || ""}"`,
      b.gross_amount || 0,
      b.discount || 0,
      b.advance || 0,
      b.ip_return || 0,
      b.sales_return_amount || 0,
      b.net_amount || 0,
      `"${b.bill_cancelled || "No"}"`,
      `"${b.is_cash_bill || "No"}"`,
      `"${b.sales_return_entered || "No"}"`,
      `"${b.ip_cleared || "No"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pharmacy_Bill_Analysis_${outletCode}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      {/* ── Header ── */}
            {/* ── Header ── */}
      <HeaderSection>
        <TitleArea>
          <div
            className="icon-wrapper"
            style={{
              background:
                activeModuleTab === "item_patient"
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            }}
          >
            {activeModuleTab === "item_patient" ? (
              <FaPills />
            ) : (
              <FaFileInvoiceDollar />
            )}
          </div>
          <div>
            <h1>
              {activeModuleTab === "item_patient"
                ? "Item-wise Patient Purchase Analysis"
                : "Pharmacy Bill Analysis"}
            </h1>
            <p>
              {activeModuleTab === "item_patient"
                ? "Identify unique patients (UHIDs & IP Numbers) purchasing specific medicines or items across date ranges"
                : "Comprehensive billing audit, returns tracking, inpatient travel, and advance reconciliation"}
            </p>
          </div>
        </TitleArea>

        <HeaderControls>
          {activeModuleTab === "bills" ? (
            <>
              <ActionBtn
                type="button"
                className="secondary"
                onClick={handleExportCSV}
                title="Export current list to CSV"
              >
                <FaDownload /> Export CSV
              </ActionBtn>

              <ActionBtn
                type="button"
                className="refresh"
                onClick={fetchBillAnalysis}
                disabled={loading}
                title="Reload data"
              >
                <SpinIcon $spinning={loading} /> Refresh
              </ActionBtn>
            </>
          ) : (
            <>
              <ActionBtn
                type="button"
                className="secondary"
                onClick={handleExportItemSummaryCSV}
                disabled={!itemAnalysisData.length}
                title="Export item summary list to CSV"
              >
                <FaDownload /> Export Items CSV
              </ActionBtn>

              <ActionBtn
                type="button"
                className="refresh"
                onClick={() => fetchItemAnalysis()}
                disabled={itemLoading}
                title="Reload item purchase data"
              >
                <SpinIcon $spinning={itemLoading} /> Refresh
              </ActionBtn>
            </>
          )}
        </HeaderControls>
      </HeaderSection>

      {/* ── Module Tabs Navigation ── */}
      <ModuleTabNav>
        <ModuleTabBtn
          type="button"
          className={activeModuleTab === "bills" ? "active" : ""}
          onClick={() => setActiveModuleTab("bills")}
        >
          <FaFileInvoiceDollar /> Bill Travel & Financial Analysis
        </ModuleTabBtn>
        <ModuleTabBtn
          type="button"
          className={activeModuleTab === "item_patient" ? "active" : ""}
          onClick={() => setActiveModuleTab("item_patient")}
        >
          <FaPills /> Item-wise Patient Purchase Analysis
        </ModuleTabBtn>
      </ModuleTabNav>

      {activeModuleTab === "bills" && (
        <>
          {/* ── Filters Bar ── */}
      <FilterCard>
        <FilterGroup>
          <label>From:</label>
          <DateInput>
            <FaCalendarAlt />
            <input
              type={fromDate === "all" ? "text" : "date"}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActivePreset("custom");
              }}
            />
          </DateInput>
        </FilterGroup>

        <FilterGroup>
          <label>To:</label>
          <DateInput>
            <FaCalendarAlt />
            <input
              type={toDate === "all" ? "text" : "date"}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActivePreset("custom");
              }}
            />
          </DateInput>
        </FilterGroup>

        <QuickDateButtons>
          <button className={activePreset === "today" ? "active" : ""} onClick={() => applyPreset("today")}>
            Today
          </button>
          <button className={activePreset === "yesterday" ? "active" : ""} onClick={() => applyPreset("yesterday")}>
            Yesterday
          </button>
          <button className={activePreset === "last7" ? "active" : ""} onClick={() => applyPreset("last7")}>
            Last 7 Days
          </button>
          <button className={activePreset === "thismonth" ? "active" : ""} onClick={() => applyPreset("thismonth")}>
            This Month
          </button>
          <button className={activePreset === "all" ? "active" : ""} onClick={() => applyPreset("all")}>
            All Dates
          </button>
        </QuickDateButtons>

        <SelectBox value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="ip credit bills">IP Credit Bills</option>
          <option value="cash bill">Cash Bills</option>
          <option value="sales return">Has Sales Return</option>
          <option value="ip return">Has IP Return</option>
          <option value="cancelled">Cancelled</option>
        </SelectBox>

        <SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Search Bill No, UHID, Patient Name, IP No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ActionBtn className="primary" onClick={fetchBillAnalysis} disabled={loading}>
          {loading ? <LoadingSpinner /> : <FaFilter />} Apply Filter
        </ActionBtn>
      </FilterCard>

      {/* ── KPI Metric Summary Cards ── */}
      <StatsGrid>
        <StatCard color="#2563eb">
          <div className="stat-label">Total Bills</div>
          <div className="stat-val">{summary.total_bills || 0}</div>
          <div className="stat-sub">Billed in selected period</div>
        </StatCard>

        <StatCard color="#0284c7">
          <div className="stat-label">Gross Amount</div>
          <div className="stat-val">₹ {(summary.total_gross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Before discounts</div>
        </StatCard>

        <StatCard color="#dc2626">
          <div className="stat-label">Discount Given</div>
          <div className="stat-val">₹ {(summary.total_discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Overall savings</div>
        </StatCard>

        <StatCard color="#059669">
          <div className="stat-label">IP Advance Total</div>
          <div className="stat-val">₹ {(summary.total_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Hospital admission deposits</div>
        </StatCard>

        <StatCard color="#d97706">
          <div className="stat-label">IP / Ward Return</div>
          <div className="stat-val">₹ {(summary.total_ip_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Ward returns tracked</div>
        </StatCard>

        <StatCard color="#7c3aed">
          <div className="stat-label">Sales Return</div>
          <div className="stat-val">₹ {(summary.total_sales_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Returned medicines</div>
        </StatCard>

        <StatCard color="#0f766e">
          <div className="stat-label">Net Amount</div>
          <div className="stat-val">₹ {(summary.total_net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Net revenue realized</div>
        </StatCard>
      </StatsGrid>

      {/* ── Table Area ── */}
      <TableWrapper>
        <TableToolbar>
          <div className="left-info">
            Showing <strong>{filteredBills.length}</strong> bills
          </div>

          <div className="view-toggles">
            <button
              className={viewMode === "standard" ? "active" : ""}
              onClick={() => setViewMode("standard")}
              title="Screenshot 1: Financial view (Gross, Discount, Advance, IP Return, Net)"
            >
              Financial View
            </button>
            <button
              className={viewMode === "audit" ? "active" : ""}
              onClick={() => setViewMode("audit")}
              title="Screenshot 2: Audit Indicators (Bill Cancelled, Cash Bill, Sales Return, IP Cleared)"
            >
              Audit View
            </button>
            <button
              className={viewMode === "all" ? "active" : ""}
              onClick={() => setViewMode("all")}
              title="Show all columns"
            >
              Full Columns View
            </button>
          </div>
        </TableToolbar>

        {errorMsg && (
          <div style={{ padding: "16px 20px", background: "#fef2f2", color: "#b91c1c", fontSize: "13px", fontWeight: "600" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <EmptyState>
            <LoadingSpinner style={{ width: 36, height: 36, borderColor: "#2563eb", borderTopColor: "transparent" }} />
            <h3>Fetching bill travel records...</h3>
            <p>Correlating hospital billing, patient demographics, and inpatient admissions.</p>
          </EmptyState>
        ) : filteredBills.length === 0 ? (
          <EmptyState>
            <FaFileInvoiceDollar />
            <h3>No pharmacy bills found</h3>
            <p>Try expanding the date range (e.g. click "All Dates") or selecting a different outlet.</p>
          </EmptyState>
        ) : (
          <TableScroll>
            <StyledTable>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Bill Type</th>
                  <th>Bill Number</th>
                  <th>UHID No</th>
                  <th>Patient Name</th>

                  {(viewMode === "standard" || viewMode === "all") && (
                    <>
                      <th style={{ textAlign: "right" }}>Gross Amount</th>
                      <th style={{ textAlign: "right" }}>Discount</th>
                      <th style={{ textAlign: "right" }}>Advance</th>
                      <th style={{ textAlign: "right" }}>Ip Return</th>
                      <th style={{ textAlign: "right" }}>Net Amount</th>
                    </>
                  )}

                  {(viewMode === "audit" || viewMode === "all") && (
                    <>
                      <th style={{ textAlign: "center" }}>Bill Cancelled</th>
                      <th style={{ textAlign: "center" }}>Cash Bill</th>
                      <th style={{ textAlign: "center" }}>Sales Return Entered</th>
                      <th style={{ textAlign: "center" }}>IP Cleared</th>
                    </>
                  )}

                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((b) => (
                  <tr key={b.id || b.bill_number}>
                    <td>
                      <StatusBadge status={b.status}>{b.status}</StatusBadge>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(b.date_time)}</td>
                    <td>
                      <strong>{b.bill_type}</strong>
                    </td>
                    <td>
                      <span
                        style={{ color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                        onClick={() => setSelectedBill(b)}
                        title="Click to view complete bill travel journey"
                      >
                        {b.bill_number}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#475569", fontWeight: 600 }}>{b.uhid}</span>
                    </td>
                    <td>
                      <strong>{b.patient_name}</strong>
                    </td>

                    {(viewMode === "standard" || viewMode === "all") && (
                      <>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          ₹ {(b.gross_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b" }}>
                          ₹ {(b.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#059669", fontWeight: 600 }}>
                          ₹ {(b.advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#d97706" }}>
                          ₹ {(b.ip_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ₹ {(b.net_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </>
                    )}

                    {(viewMode === "audit" || viewMode === "all") && (
                      <>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.bill_cancelled}>{b.bill_cancelled}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.is_cash_bill}>{b.is_cash_bill}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.sales_return_entered}>{b.sales_return_entered}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.ip_cleared}>{b.ip_cleared}</IndicatorPill>
                        </td>
                      </>
                    )}

                    <td style={{ textAlign: "center" }}>
                      <ActionIconButton onClick={() => setSelectedBill(b)} title="View complete A-to-Z Bill Travel">
                        <FaEye />
                      </ActionIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableScroll>
        )}

        {/* ── Pagination Footer ── */}
        {!loading && filteredBills.length > 0 && (
          <PaginationContainer>
            <div className="entry-info">
              Showing{" "}
              <strong>
                {Math.min(filteredBills.length, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(filteredBills.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong>{filteredBills.length}</strong> entries
            </div>

            <div className="page-controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    className={currentPage === pageNum ? "active" : ""}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span>...</span>
                  <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                </>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </PaginationContainer>
        )}
      </TableWrapper>
        </>
      )}

      {activeModuleTab === "item_patient" && (
        <>
          {/* ── Item Analysis Filters Bar ── */}
          <FilterCard>
            <FilterGroup style={{ flex: 1, minWidth: 280 }}>
              <label>Item / Medicine:</label>
              <ItemSearchContainer>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search item name (e.g. SEAGATE SATA HDD 1 TB, DOLIPRANE)..."
                  value={itemSearchInput}
                  onChange={(e) => {
                    setItemSearchInput(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (itemSuggestions.length > 0) setIsSuggestionsOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsSuggestionsOpen(false);
                      fetchItemAnalysis();
                    }
                  }}
                />
                {itemSearchInput && (
                  <FaTimes
                    className="clear-icon"
                    onClick={handleClearItemSearch}
                    title="Clear search"
                  />
                )}

                {isSuggestionsOpen && itemSuggestions.length > 0 && (
                  <SuggestionsList>
                    {itemSuggestions.map((sug) => (
                      <SuggestionItem
                        key={sug.item_id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectItemSuggestion(sug);
                        }}
                      >
                        <div className="item-name">
                          <FaPills style={{ marginRight: 6, color: "#2563eb", fontSize: 11 }} />
                          {sug.item_name}
                        </div>
                      </SuggestionItem>
                    ))}
                  </SuggestionsList>
                )}
              </ItemSearchContainer>
            </FilterGroup>

            <FilterGroup>
              <label>From:</label>
              <DateInput>
                <FaCalendarAlt />
                <input
                  type={itemFromDate === "all" ? "text" : "date"}
                  value={itemFromDate}
                  onChange={(e) => {
                    setItemFromDate(e.target.value);
                    setItemActivePreset("custom");
                  }}
                />
              </DateInput>
            </FilterGroup>

            <FilterGroup>
              <label>To:</label>
              <DateInput>
                <FaCalendarAlt />
                <input
                  type={itemToDate === "all" ? "text" : "date"}
                  value={itemToDate}
                  onChange={(e) => {
                    setItemToDate(e.target.value);
                    setItemActivePreset("custom");
                  }}
                />
              </DateInput>
            </FilterGroup>

            <QuickDateButtons>
              <button
                type="button"
                className={itemActivePreset === "today" ? "active" : ""}
                onClick={() => applyItemPreset("today")}
              >
                Today
              </button>
              <button
                type="button"
                className={itemActivePreset === "yesterday" ? "active" : ""}
                onClick={() => applyItemPreset("yesterday")}
              >
                Yesterday
              </button>
              <button
                type="button"
                className={itemActivePreset === "thisweek" ? "active" : ""}
                onClick={() => applyItemPreset("thisweek")}
              >
                This Week
              </button>
              <button
                type="button"
                className={itemActivePreset === "thismonth" ? "active" : ""}
                onClick={() => applyItemPreset("thismonth")}
              >
                This Month
              </button>
              <button
                type="button"
                className={itemActivePreset === "all" ? "active" : ""}
                onClick={() => applyItemPreset("all")}
              >
                All Dates
              </button>
            </QuickDateButtons>

            <ActionBtn
              type="button"
              className="primary"
              onClick={() => fetchItemAnalysis()}
              disabled={itemLoading}
            >
              {itemLoading ? <LoadingSpinner /> : <FaFilter />} Apply Filter
            </ActionBtn>

            {(itemSearchInput || itemActivePreset !== "today") && (
              <ActionBtn
                type="button"
                className="secondary"
                onClick={handleClearItemSearch}
                disabled={itemLoading}
                title="Reset filters"
              >
                <FaUndoAlt /> Reset
              </ActionBtn>
            )}
          </FilterCard>

          {itemErrorMsg && (
            <div
              style={{
                padding: "16px 20px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "600",
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              {itemErrorMsg}
            </div>
          )}

          {/* ── KPI Metric Summary Cards for Item Analysis ── */}
          <StatsGrid>
            <StatCard color="#2563eb">
              <div className="stat-label">Items Analyzed</div>
              <div className="stat-val">
                {selectedItemObj ? 1 : itemSummary.total_items || 0}
              </div>
              <div className="stat-sub">
                {selectedItemObj ? selectedItemObj.item_name : "Medicines in period"}
              </div>
            </StatCard>

            <StatCard color="#059669">
              <div className="stat-label">Total Quantity Sold</div>
              <div className="stat-val">
                {(itemSummary.total_quantity || 0).toLocaleString()}
              </div>
              <div className="stat-sub">Units dispensed across bills</div>
            </StatCard>

            <StatCard color="#7c3aed">
              <div className="stat-label">Unique Patients (UHID)</div>
              <div className="stat-val" style={{ color: "#7c3aed" }}>
                {itemSummary.total_unique_uhids || 0}
              </div>
              <div className="stat-sub">Distinct UHIDs (Deduplicated)</div>
            </StatCard>

            <StatCard color="#d97706">
              <div className="stat-label">Unique Inpatients (IP)</div>
              <div className="stat-val" style={{ color: "#d97706" }}>
                {itemSummary.total_unique_ips || 0}
              </div>
              <div className="stat-sub">Distinct admission IP numbers</div>
            </StatCard>

            <StatCard color="#0f766e">
              <div className="stat-label">Total Bills</div>
              <div className="stat-val">
                {itemSummary.total_bills || 0}
              </div>
              <div className="stat-sub">Bills containing selected item(s)</div>
            </StatCard>
          </StatsGrid>

          {/* ── Items Table Wrapper ── */}
          <TableWrapper>
            <TableToolbar>
              <div className="left-info">
                Showing <strong>{filteredItemAnalysis.length}</strong> items in selected period ({itemActivePreset})
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SearchBox style={{ minWidth: 200 }}>
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Filter items table..."
                    value={itemTableSearch}
                    onChange={(e) => {
                      setItemTableSearch(e.target.value);
                      setItemCurrentPage(1);
                    }}
                  />
                </SearchBox>

                <ActionBtn
                  className="secondary"
                  onClick={handleExportItemSummaryCSV}
                  disabled={!itemAnalysisData.length}
                  title="Export item summary to CSV"
                >
                  <FaDownload /> Export CSV
                </ActionBtn>
              </div>
            </TableToolbar>

            {itemLoading ? (
              <EmptyState>
                <LoadingSpinner
                  style={{
                    width: 36,
                    height: 36,
                    borderColor: "#2563eb",
                    borderTopColor: "transparent",
                  }}
                />
                <h3>Fetching item purchase records...</h3>
                <p>Calculating unique UHIDs and IP numbers across pharmacy billing data.</p>
              </EmptyState>
            ) : filteredItemAnalysis.length === 0 ? (
              <EmptyState>
                <FaPills />
                <h3>No item purchase records found</h3>
                <p>
                  {itemSearchInput
                    ? `No sales found for "${itemSearchInput}" in the selected date range (${itemActivePreset}).`
                    : "No pharmacy items were billed in the selected date range."}
                </p>
                <div style={{ marginTop: 14 }}>
                  <QuickDateButtons style={{ justifyContent: "center" }}>
                    <button type="button" onClick={() => applyItemPreset("yesterday")}>
                      Try Yesterday
                    </button>
                    <button type="button" onClick={() => applyItemPreset("thisweek")}>
                      Try This Week
                    </button>
                    <button type="button" onClick={() => applyItemPreset("all")}>
                      View All Dates
                    </button>
                  </QuickDateButtons>
                </div>
              </EmptyState>
            ) : (
              <TableScroll>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Item / Medicine Name</th>
                      <th style={{ textAlign: "right" }}>Total Quantity Sold</th>
                      <th style={{ textAlign: "center" }}>Unique UHIDs (Patients)</th>
                      <th style={{ textAlign: "center" }}>Unique IP Numbers</th>
                      <th style={{ textAlign: "center" }}>Total Bills</th>
                      <th style={{ textAlign: "center", width: 140 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr key={item.item_id || item.item_name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FaPills style={{ color: "#2563eb", fontSize: 13, flexShrink: 0 }} />
                            <strong
                              style={{
                                color: "#0f172a",
                                cursor: "pointer",
                                textDecoration: "underline",
                                textDecorationColor: "transparent",
                                transition: "all 0.15s",
                              }}
                              onClick={() => setSelectedItemForDetail(item)}
                              title="Click to view detailed patient purchase list"
                            >
                              {item.item_name}
                            </strong>
                          </div>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                          {item.total_quantity.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <PillStat
                            $bg="#f3e8ff"
                            $color="#7c3aed"
                            style={{ display: "inline-flex", padding: "3px 10px" }}
                          >
                            <FaUsers style={{ fontSize: 11 }} />
                            <strong>{item.unique_uhid_count}</strong> patients
                          </PillStat>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <PillStat
                            $bg="#fef3c7"
                            $color="#b45309"
                            style={{ display: "inline-flex", padding: "3px 10px" }}
                          >
                            <FaBed style={{ fontSize: 11 }} />
                            <strong>{item.unique_ip_count}</strong> IP
                          </PillStat>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <PillStat
                            $bg="#f1f5f9"
                            $color="#334155"
                            style={{ display: "inline-flex", padding: "3px 10px" }}
                          >
                            <FaReceipt style={{ fontSize: 11 }} />
                            <strong>{item.total_bills_count}</strong> bills
                          </PillStat>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <ActionBtn
                            className="primary"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            onClick={() => setSelectedItemForDetail(item)}
                            title="View patient list for this item"
                          >
                            <FaEye /> Patients ({item.unique_uhid_count})
                          </ActionBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableScroll>
            )}

            {/* Pagination for Items Table */}
            {!itemLoading && filteredItemAnalysis.length > 0 && (
              <PaginationContainer>
                <div className="entry-info">
                  Showing{" "}
                  <strong>
                    {Math.min(
                      filteredItemAnalysis.length,
                      (itemCurrentPage - 1) * itemPageSize + 1
                    )}{" "}
                    to{" "}
                    {Math.min(
                      filteredItemAnalysis.length,
                      itemCurrentPage * itemPageSize
                    )}
                  </strong>{" "}
                  of <strong>{filteredItemAnalysis.length}</strong> items
                </div>

                <div className="page-controls">
                  <button
                    onClick={() => setItemCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={itemCurrentPage === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalItemPages }, (_, idx) => idx + 1)
                    .slice(
                      Math.max(0, itemCurrentPage - 3),
                      Math.min(totalItemPages, itemCurrentPage + 2)
                    )
                    .map((pageNum) => (
                      <button
                        key={pageNum}
                        className={itemCurrentPage === pageNum ? "active" : ""}
                        onClick={() => setItemCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                  <button
                    onClick={() =>
                      setItemCurrentPage((p) => Math.min(totalItemPages, p + 1))
                    }
                    disabled={itemCurrentPage === totalItemPages}
                  >
                    Next
                  </button>
                </div>
              </PaginationContainer>
            )}
          </TableWrapper>
        </>
      )}

      {/* ── Bill Travel Journey Modal / Drawer ── */}
      {selectedBill && (
        <DrawerOverlay onClick={() => setSelectedBill(null)}>
          <DrawerContent onClick={(e) => e.stopPropagation()}>
            <DrawerHeader>
              <div className="title-group">
                <h2>
                  <FaReceipt /> Bill Travel Analysis: {selectedBill.bill_number}
                </h2>
                <p>Complete A-to-Z audit trail, patient comparison, inpatient journey & return transactions</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedBill(null)} title="Close">
                <FaTimes />
              </button>
            </DrawerHeader>

            <DrawerBody>
              {/* 1. Bill Metadata */}
              <DetailCard>
                <div className="card-header">
                  <FaFileInvoiceDollar /> Billing Summary & Operational Details
                </div>
                <div className="card-body">
                  <GridList>
                    <div className="field-item">
                      <div className="label">Bill Number</div>
                      <div className="value">{selectedBill.bill_number}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Date & Time</div>
                      <div className="value">{formatDateTime(selectedBill.date_time)}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Bill Type</div>
                      <div className="value">{selectedBill.bill_type}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Billing Mode</div>
                      <div className="value">
                        {selectedBill.travel?.bill_info?.billing_mode || selectedBill.billing_mode || "DIRECT"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Status</div>
                      <div className="value">
                        <StatusBadge status={selectedBill.status}>{selectedBill.status}</StatusBadge>
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Outlet Code</div>
                      <div className="value">
                        {selectedBill.travel?.bill_info?.outlet_code || selectedBill.outlet_code || outletCode || "—"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Shift / Doctor</div>
                      <div className="value">
                        Shift: {selectedBill.travel?.bill_info?.shift_no || selectedBill.shift_no || selectedBill.shiftno || "—"} | Dr: {selectedBill.travel?.bill_info?.doctor_id || selectedBill.doctor_id || "—"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Net Amount</div>
                      <div className="value" style={{ color: "#0f766e", fontSize: 16 }}>
                        ₹ {(selectedBill.net_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </GridList>
                </div>
              </DetailCard>

              {/* 2. Patient Profile Comparison */}
              <DetailCard>
                <div className="card-header">
                  <FaHospitalUser /> Patient Profile (Linked via UHID {selectedBill.uhid || selectedBill.travel?.patient?.uhid || "—"})
                </div>
                <div className="card-body">
                  <GridList>
                    <div className="field-item">
                      <div className="label">UHID Number</div>
                      <div className="value">{selectedBill.uhid || selectedBill.travel?.patient?.uhid || "—"}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Full Name</div>
                      <div className="value">{selectedBill.patient_name || selectedBill.travel?.patient?.name || "—"}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Age & Gender</div>
                      <div className="value">
                        {selectedBill.patient_age
                          ? `${selectedBill.patient_age} yrs`
                          : (selectedBill.travel?.patient?.age ? `${selectedBill.travel.patient.age} yrs` : "—")}{" "}
                        / {selectedBill.patient_gender || selectedBill.travel?.patient?.gender || "—"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Contact Mobile</div>
                      <div className="value">{selectedBill.patient_phone || selectedBill.travel?.patient?.phone || "—"}</div>
                    </div>
                    <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="label">Address / Location</div>
                      <div className="value">{selectedBill.patient_address || selectedBill.travel?.patient?.address || "—"}</div>
                    </div>
                  </GridList>
                </div>
              </DetailCard>

              {/* 3. Inpatient Admission & Advance Paid */}
              <DetailCard>
                <div className="card-header">
                  <FaBed /> Inpatient Admission & IP Advance Journey
                </div>
                <div className="card-body">
                  {selectedBill.inpatient_number && selectedBill.inpatient_number !== "—" ? (
                    <>
                      <GridList style={{ marginBottom: 16 }}>
                        <div className="field-item">
                          <div className="label">IP Number</div>
                          <div className="value">{selectedBill.inpatient_number || selectedBill.travel?.admission?.ipNumber || "—"}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Total IP Advance Paid</div>
                          <div className="value" style={{ color: "#059669", fontSize: 15 }}>
                            ₹ {((selectedBill.advance != null ? selectedBill.advance : selectedBill.travel?.admission?.total_ip_advance) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="field-item">
                          <div className="label">Room / Bed Allocation</div>
                          <div className="value">{selectedBill.travel?.admission?.room_label || selectedBill.room_no || "—"}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Discharge / Clearance Status</div>
                          <div className="value">
                            <IndicatorPill val={selectedBill.ip_cleared || (selectedBill.travel?.admission?.is_discharged ? "Yes" : "No")}>
                              {selectedBill.ip_cleared === "Yes" || selectedBill.travel?.admission?.is_discharged ? "Discharged / Cleared" : "Currently Admitted"}
                            </IndicatorPill>
                          </div>
                        </div>
                        <div className="field-item">
                          <div className="label">Admitting Doctor</div>
                          <div className="value">{selectedBill.travel?.admission?.admittingDoctor || "—"}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Payer Category / Insurance</div>
                          <div className="value">
                            {selectedBill.travel?.admission?.customer_type || selectedBill.customer_type || "Cash"}{" "}
                            {selectedBill.travel?.admission?.insurance_company ? `(${selectedBill.travel.admission.insurance_company})` : ""}
                          </div>
                        </div>
                      </GridList>

                      {/* Advance receipt items list if present */}
                      {selectedBill.travel?.admission?.advance_records?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
                            IP Advance Receipts Breakdown:
                          </div>
                          <SubTable>
                            <thead>
                              <tr>
                                <th>Receipt / Bill No</th>
                                <th>Payment Mode</th>
                                <th>Date</th>
                                <th style={{ textAlign: "right" }}>Advance Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedBill.travel.admission.advance_records.map((ar, idx) => (
                                <tr key={idx}>
                                  <td>{ar.bill_no || "—"}</td>
                                  <td>{ar.mode}</td>
                                  <td>{ar.date ? String(ar.date).slice(0, 10) : "—"}</td>
                                  <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                                    ₹ {(ar.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </SubTable>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                      This is an Outpatient (OP) direct pharmacy bill. No inpatient admission or IP advance records attached.
                    </div>
                  )}
                </div>
              </DetailCard>

              {/* 4. Medicine Particulars & Edit History */}
              <DetailCard>
                <div className="card-header">
                  <FaPills /> Billed Medicines & Item Edit History
                </div>
                <div className="card-body">
                  {(() => {
                    const medicinesList =
                      selectedBill.travel?.medicines && selectedBill.travel.medicines.length > 0
                        ? selectedBill.travel.medicines
                        : (selectedBill.medicine_particulars || selectedBill.items || []);
                    if (!medicinesList || medicinesList.length === 0) {
                      return <div style={{ color: "#64748b", fontSize: 13 }}>No medicines listed for this bill.</div>;
                    }
                    return (
                      <SubTable>
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Batch No</th>
                            <th style={{ textAlign: "center" }}>Qty</th>
                            <th style={{ textAlign: "right" }}>Unit Price</th>
                            <th style={{ textAlign: "right" }}>Calculated Price</th>
                            <th>Edit History / Return Travel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicinesList.map((m, idx) => {
                            const itemName = m.item_name || m.itemName || "—";
                            const itemId = m.item_id || m.itemId || "";
                            const batchNo = m.batch_number || m.batch_no || m.batchNo || "—";
                            const qty = m.qty != null ? m.qty : (m.quantity != null ? m.quantity : 0);
                            const price = m.price != null ? m.price : (m.rate != null ? m.rate : 0);
                            const calcPrice =
                              m.calculated_price != null
                                ? m.calculated_price
                                : (m.amount != null ? m.amount : qty * price);
                            return (
                              <tr key={idx}>
                                <td>
                                  <strong style={{ color: "#0f172a" }}>{itemName}</strong>
                                  {itemId && <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {itemId}</div>}
                                </td>
                                <td>{batchNo}</td>
                                <td style={{ textAlign: "center", fontWeight: 600 }}>{qty}</td>
                                <td style={{ textAlign: "right" }}>
                                  ₹ {(price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#0f766e" }}>
                                  ₹ {(calcPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td>
                                  {m.edit_history && m.edit_history.length > 0 ? (
                                    m.edit_history.map((eh, eidx) => (
                                      <div
                                        key={eidx}
                                        style={{
                                          fontSize: 11,
                                          background: "#fef3c7",
                                          color: "#92400e",
                                          padding: "3px 6px",
                                          borderRadius: 4,
                                          marginBottom: 2,
                                        }}
                                      >
                                        <strong>{eh.action}</strong>: Ret Qty {eh.return_qty} | Bill: {eh.return_bill_no} (
                                        {eh.return_date ? String(eh.return_date).slice(0, 10) : ""})
                                      </div>
                                    ))
                                  ) : (
                                    <span style={{ color: "#94a3b8", fontSize: 11 }}>No edits</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </SubTable>
                    );
                  })()}
                </div>
              </DetailCard>

              {/* 5. Returns Breakdown (Sales Return + Ward IP Return) */}
              <DetailCard>
                <div className="card-header">
                  <FaUndoAlt /> Returns Travel (Sales Return & Ward Return)
                </div>
                <div className="card-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Sales Return Section */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Sales Return Records ({selectedBill.travel?.sales_returns?.length || 0}):
                      </div>
                      {selectedBill.travel?.sales_returns?.length > 0 ? (
                        <SubTable>
                          <thead>
                            <tr>
                              <th>Return Bill No</th>
                              <th>Date</th>
                              <th>Payment Type</th>
                              <th>Status</th>
                              <th style={{ textAlign: "right" }}>Return Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.travel.sales_returns.map((sr, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{sr.return_bill_no}</strong>
                                </td>
                                <td>{sr.return_date ? String(sr.return_date).slice(0, 19).replace("T", " ") : "—"}</td>
                                <td>{sr.payment_type}</td>
                                <td>
                                  <IndicatorPill val="Yes">{sr.status}</IndicatorPill>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                                  ₹ {(sr.return_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </SubTable>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                          No sales return recorded in hospital_salesreturn collection for this bill.
                        </div>
                      )}
                    </div>

                    {/* Ward Return Section */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Ward / IP Return Records ({selectedBill.travel?.ward_returns?.length || 0}):
                      </div>
                      {selectedBill.travel?.ward_returns?.length > 0 ? (
                        <SubTable>
                          <thead>
                            <tr>
                              <th>Ward Return Bill No</th>
                              <th>Date</th>
                              <th>IP Number</th>
                              <th>Status</th>
                              <th style={{ textAlign: "right" }}>Return Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.travel.ward_returns.map((wr, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{wr.ward_return_bill_no}</strong>
                                </td>
                                <td>{wr.ward_return_date ? String(wr.ward_return_date).slice(0, 19).replace("T", " ") : "—"}</td>
                                <td>{wr.inpatient_number || "—"}</td>
                                <td>
                                  <IndicatorPill val="Yes">{wr.status}</IndicatorPill>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#d97706" }}>
                                  ₹ {(wr.return_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </SubTable>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                          No ward returns recorded in hospital_wardreturndetails collection.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DetailCard>

              {/* 6. Cash Counter Collections */}
              <DetailCard>
                <div className="card-header">
                  <FaMoneyBillWave /> Cash Counter Collections
                </div>
                <div className="card-body">
                  {selectedBill.travel?.cash_collections?.length > 0 ? (
                    <SubTable>
                      <thead>
                        <tr>
                          <th>Bill Number</th>
                          <th>Counter Code</th>
                          <th>Shift</th>
                          <th>Collection Date</th>
                          <th style={{ textAlign: "right" }}>Collected Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.travel.cash_collections.map((cc, idx) => (
                          <tr key={idx}>
                            <td>{cc.bill_number}</td>
                            <td>{cc.counter_code}</td>
                            <td>{cc.shift_no || "—"}</td>
                            <td>{formatDateTime(cc.created_date)}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                              ₹ {(cc.collected_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </SubTable>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 12, fontStyle: "italic" }}>
                      Direct pharmacy counter payment or settled in credit billing.
                    </div>
                  )}
                </div>
              </DetailCard>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      )}
    
      {/* ── Item Patient Details Drawer / Modal ── */}
      {selectedItemForDetail && (
        <DrawerOverlay onClick={() => setSelectedItemForDetail(null)}>
          <DrawerContent
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900 }}
          >
            <DrawerHeader>
              <div className="title-group">
                <h2>
                  <FaHospitalUser /> Patient Purchase Analysis: {selectedItemForDetail.item_name}
                </h2>
                <p>
                  Unique Patients:{" "}
                  <strong>{selectedItemForDetail.unique_uhid_count}</strong> | Unique Inpatients:{" "}
                  <strong>{selectedItemForDetail.unique_ip_count}</strong> | Total Quantity Sold:{" "}
                  <strong>{selectedItemForDetail.total_quantity}</strong>
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedItemForDetail(null)}
                title="Close"
              >
                <FaTimes />
              </button>
            </DrawerHeader>

            <DrawerBody>
              {/* Summary Metric Banner */}
              <DetailBanner>
                <div className="item-info">
                  <h3>
                    <FaPills style={{ color: "#2563eb" }} />
                    {selectedItemForDetail.item_name}
                  </h3>
                  <p>
                    Purchases recorded between <strong>{itemFromDate}</strong> and{" "}
                    <strong>{itemToDate}</strong>
                  </p>
                </div>

                <div className="stats-summary">
                  <PillStat $bg="#dcfce7" $color="#15803d">
                    <span>Sold:</span>
                    <strong>{selectedItemForDetail.total_quantity}</strong> units
                  </PillStat>
                  <PillStat $bg="#f3e8ff" $color="#7c3aed">
                    <span>Unique UHIDs:</span>
                    <strong>{selectedItemForDetail.unique_uhid_count}</strong>
                  </PillStat>
                  <PillStat $bg="#fef3c7" $color="#b45309">
                    <span>Unique IPs:</span>
                    <strong>{selectedItemForDetail.unique_ip_count}</strong>
                  </PillStat>
                  <PillStat $bg="#f1f5f9" $color="#334155">
                    <span>Total Bills:</span>
                    <strong>{selectedItemForDetail.total_bills_count}</strong>
                  </PillStat>
                </div>
              </DetailBanner>

              {/* Patient List Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <GroupToggleBar>
                  <button
                    type="button"
                    className={patientViewMode === "all_bills" ? "active" : ""}
                    onClick={() => setPatientViewMode("all_bills")}
                    title="View individual billing transactions"
                  >
                    <FaListAlt /> All Purchase Records ({filteredPatients.length})
                  </button>
                  <button
                    type="button"
                    className={patientViewMode === "grouped_patients" ? "active" : ""}
                    onClick={() => setPatientViewMode("grouped_patients")}
                    title="View deduplicated patients consolidated by UHID"
                  >
                    <FaLayerGroup /> Grouped by Patient ({groupedPatients.length})
                  </button>
                </GroupToggleBar>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SearchBox style={{ minWidth: 220 }}>
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Filter patients, UHID, IP, bill..."
                      value={patientListSearch}
                      onChange={(e) => setPatientListSearch(e.target.value)}
                    />
                  </SearchBox>

                  <ActionBtn
                    className="secondary"
                    onClick={handleExportPatientListCSV}
                    disabled={!selectedItemForDetail.patients?.length}
                    title="Export patient purchase list to CSV"
                  >
                    <FaDownload /> Export CSV
                  </ActionBtn>
                </div>
              </div>

              {/* Patient Details Table */}
              {selectedItemForDetail.patients?.length === 0 ? (
                <EmptyState>
                  <FaUserInjured style={{ fontSize: 34, color: "#cbd5e1" }} />
                  <h3>No patient purchases found</h3>
                  <p>
                    No patients have purchased "{selectedItemForDetail.item_name}" during the
                    selected period ({itemActivePreset}).
                  </p>
                </EmptyState>
              ) : patientViewMode === "all_bills" ? (
                /* All Bills View */
                <TableScroll>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>#</th>
                        <th>Patient Name</th>
                        <th>UHID</th>
                        <th>IP Number</th>
                        <th>Mobile Number</th>
                        <th>Bill Number</th>
                        <th>Bill Date & Time</th>
                        <th style={{ textAlign: "right" }}>Purchased Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p, idx) => (
                        <tr key={`${p.bill_number}_${p.uhid}_${idx}`}>
                          <td style={{ color: "#94a3b8" }}>{idx + 1}</td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>
                              {p.patient_name || "—"}
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: "#2563eb", fontWeight: 700 }}>
                              {p.uhid || "—"}
                            </span>
                          </td>
                          <td>
                            {p.inpatient_number &&
                            p.inpatient_number !== "—" &&
                            !String(p.inpatient_number).trim().toUpperCase().startsWith("OP") &&
                            String(p.inpatient_number).trim().toLowerCase() !== "none" ? (
                              <PillBadge $bg="#fef3c7" $color="#b45309">
                                {p.inpatient_number}
                              </PillBadge>
                            ) : null}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <FaPhoneAlt style={{ color: "#94a3b8", fontSize: 10 }} />
                              <span>{p.mobile_number || "—"}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                color: "#0284c7",
                                fontWeight: 700,
                                background: "#f0f9ff",
                                padding: "2px 8px",
                                borderRadius: 4,
                                border: "1px solid #bae6fd",
                              }}
                            >
                              {p.bill_number || "—"}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap", color: "#475569" }}>
                            {formatDateTime(p.bill_date)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#059669",
                              fontSize: 14,
                            }}
                          >
                            {p.purchased_quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                </TableScroll>
              ) : (
                /* Grouped by Unique Patient View */
                <TableScroll>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>#</th>
                        <th>Patient Name</th>
                        <th>UHID</th>
                        <th>Mobile Number</th>
                        <th>Inpatient No(s)</th>
                        <th style={{ textAlign: "center" }}>Bills Count</th>
                        <th>Bill Numbers</th>
                        <th style={{ textAlign: "right" }}>Total Purchased Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedPatients.map((g, idx) => (
                        <tr key={g.uhid || idx}>
                          <td style={{ color: "#94a3b8" }}>{idx + 1}</td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>
                              {g.patient_name || "—"}
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: "#2563eb", fontWeight: 700 }}>
                              {g.uhid || "—"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <FaPhoneAlt style={{ color: "#94a3b8", fontSize: 10 }} />
                              <span>{g.mobile_number || "—"}</span>
                            </div>
                          </td>
                          <td>
                            {g.ip_display ? (
                              <PillBadge $bg="#fef3c7" $color="#b45309">
                                {g.ip_display}
                              </PillBadge>
                            ) : null}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <PillBadge $bg="#f1f5f9" $color="#334155">
                              {g.bills_count} {g.bills_count === 1 ? "bill" : "bills"}
                            </PillBadge>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {g.bills_display.map((bno) => (
                                <span
                                  key={bno}
                                  style={{
                                    fontSize: 11,
                                    background: "#f0f9ff",
                                    color: "#0284c7",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    border: "1px solid #bae6fd",
                                    fontWeight: 600,
                                  }}
                                >
                                  {bno}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#059669",
                              fontSize: 14,
                            }}
                          >
                            {g.total_qty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                </TableScroll>
              )}
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      )}

    </Container>
  );
}
