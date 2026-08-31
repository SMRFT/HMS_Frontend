import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import JsBarcode from "jsbarcode";
import { format } from "date-fns";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import headerImage from "../Images/SummaryHead.png";
import FooterImage from "../Images/Footer.png";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Label,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";
import RDPrint from "./RDPrint";

// ─── Animations ───────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ─── Table Helpers ────────────────────────────────────────────────────────────

const isTableEntry = (entry) => !!entry?.table_id;

const parseTableDimensions = (tableId) => {
  const parts = (tableId || "").toUpperCase().split("X");
  const r = parseInt(parts[0], 10);
  const c = parseInt(parts[1], 10);
  return { rows: isNaN(r) ? 0 : r, cols: isNaN(c) ? 0 : c };
};

const extractTableCells = (entry, rows, cols) => {
  const grid = [];
  for (let r = 1; r <= rows; r++) {
    const row = [];
    for (let c = 1; c <= cols; c++) {
      row.push(entry[`row${r}col${c}`] || "");
    }
    grid.push(row);
  }
  return grid;
};

const serializeTableCells = (grid) => {
  const out = {};
  grid.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      out[`row${ri + 1}col${ci + 1}`] = cell;
    });
  });
  return out;
};

const buildInitialHTML = (text) => {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  const tmp = document.createElement("div");
  tmp.textContent = text;
  const safeHTML = tmp.innerHTML;
  return safeHTML.replace(
    /\/\/\//g,
    `<mark class="ph" style="background:#fff3e0;color:#e65100;font-weight:700;border-radius:3px;padding:0 2px;cursor:text;">///</mark>`,
  );
};

const stripHTML = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

// ─── Page Layout ──────────────────────────────────────────────────────────────

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🔬";
    font-size: 1.3rem;
  }
`;

// ─── Stat Cards ───────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1.1rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 90px;
  background: ${(p) => p.bg || "#f8f8f8"};
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-left: 3px solid ${(p) => p.accent || "#ccc"};
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
`;

const StatIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
`;
const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;
const StatCount = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${(p) => p.color || "#333"};
  line-height: 1.1;
`;
const StatLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterContainer = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;
const FilterLabel = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;
const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.1);
  }
`;
const BillTypeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;
const BillTypeSelect = styled.select`
  padding: 0.4rem 2rem 0.4rem 0.75rem;
  border: 2px solid #00897b;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #00695c;
  background: linear-gradient(135deg, #f0faf8 0%, #e8f5e9 100%);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300897b' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  min-width: 100px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 137, 123, 0.15);
  &:focus {
    outline: none;
    border-color: #00695c;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.2);
  }
  &:hover {
    background: linear-gradient(135deg, #e0f2f1 0%, #e8f5e9 100%);
    border-color: #00695c;
  }
  option {
    font-weight: 700;
    color: #333;
    background: white;
  }
`;
const ResetButton = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 0.4rem 1rem;
  font-size: 0.78rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-1px);
  }
`;

// ─── Column Search ────────────────────────────────────────────────────────────

const SearchInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
  &::placeholder {
    color: #bbb;
    font-style: italic;
  }
`;
const SearchSelect = styled.select`
  width: max-content;
  min-width: max-content;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
`;
const ScrollableTableWrapper = styled(TableWrapper)`
  max-height: calc(100vh - 230px);
  overflow: auto;
  position: relative;
  border-radius: 10px;
  border: 1px solid #e0f2f1;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    max-height: calc(100vh - 180px);
    overflow-x: auto;
  }
`;

const StickyTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 1400px;
`;

const StickyTh = styled(Th)`
  position: sticky;
  top: 0;
  height: 34px;
  max-height: 34px;
  line-height: 20px;
  padding: 6px 10px;
  background-color: #e0f2f1;
  color: #004d40;
  border-bottom: 1px solid #b2dfdb;
  z-index: ${(p) => (p.sticky ? 30 : 10)};
  ${(p) => p.stickyLeft !== undefined && `left: ${p.stickyLeft}px;`}
  ${(p) => p.stickyShadow && `box-shadow: 3px 0 5px -1px rgba(0,0,0,0.12);`}
  white-space: nowrap;
  box-sizing: border-box;

  @media (max-width: 768px) {
    position: static !important;
    left: auto !important;
    box-shadow: none !important;
    z-index: 1 !important;
  }
`;

const SearchTh = styled.th`
  padding: 4px 6px;
  background-color: #f8fffe;
  border-bottom: 2px solid #b2dfdb;
  position: sticky;
  top: 33px;
  z-index: ${(p) => (p.sticky ? 30 : 10)};
  ${(p) => p.stickyLeft !== undefined && `left: ${p.stickyLeft}px;`}
  ${(p) => p.stickyShadow && `box-shadow: 3px 0 5px -1px rgba(0,0,0,0.12);`}
  box-sizing: border-box;

  @media (max-width: 768px) {
    position: static !important;
    left: auto !important;
    box-shadow: none !important;
    z-index: 1 !important;
  }
`;

const StickyTd = styled(Td)`
  position: sticky;
  z-index: 5;
  background-color: inherit;
  ${(p) => p.stickyLeft !== undefined && `left: ${p.stickyLeft}px;`}
  ${(p) => p.stickyShadow && `box-shadow: 3px 0 5px -1px rgba(0,0,0,0.12);`}
  white-space: nowrap;

  @media (max-width: 768px) {
    position: static !important;
    left: auto !important;
    box-shadow: none !important;
    z-index: 1 !important;
  }
`;


// ─── Icon Action Buttons ──────────────────────────────────────────────────────

const IconBtn = styled.button`
  position: relative;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition:
    transform 0.15s,
    opacity 0.15s;
  flex-shrink: 0;
  background: transparent;
  box-shadow: none;
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.15);
    opacity: 0.8;
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }
  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    transform: none;
  }
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.9);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
  }
  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20, 20, 20, 0.9);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
  }
  &:hover:not(:disabled)::after,
  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;
const ActionRow = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-wrap: nowrap;
`;

// ─── Print Dropdown ───────────────────────────────────────────────────────────

const PrintDropdownWrapper = styled.div`
  position: relative;
`;
const PortalDropdownMenu = styled.div`
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  min-width: 200px;
  z-index: 9999;
  overflow: hidden;
  border: 1px solid #e9ecef;
  padding-top: 6px;
  margin-top: -6px;
`;
const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background-color: white;
  color: black;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #e9ecef;
  }
`;

// ─── Status Badges ────────────────────────────────────────────────────────────

const StatusBadge = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  white-space: nowrap;
  ${(props) => {
    if (!props.hasReport)
      return `background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#1565c0;`;
    if (props.dispatched)
      return `background:linear-gradient(135deg,#b3e5fc,#81d4fa);color:#01579b;`;
    if (props.approved)
      return `background:linear-gradient(135deg,#c8e6c9,#a5d6a7);color:#2e7d32;`;
    return `background:linear-gradient(135deg,#fff9c4,#fff59d);color:#f57f17;`;
  }}
`;
const SlotBadge = styled.span`
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  background: linear-gradient(135deg, #ede7f6, #d1c4e9);
  color: #4527a0;
  white-space: nowrap;
`;
const ReferredByBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0277bd;
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;
`;
const CustomerTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  white-space: nowrap;
  ${(p) => {
    const t = (p.type || "").toUpperCase();
    if (t.includes("INSURANCE")) {
      return `background: #fef3c7; color: #92400e; border: 1px solid #fde68a;`;
    }
    if (t.includes("CORPORATE")) {
      return `background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff;`;
    }
    if (t.includes("CAMP") || t.includes("SCHEME")) {
      return `background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;`;
    }
    return `background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;`;
  }}
`;

const IpOpBadge = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  ${(p) => {
    const t = (p.type || "").toUpperCase();
    if (t === "IP") {
      return `background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;`;
    }
    return `background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;`;
  }}
`;

const ScanTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0.35rem;
  vertical-align: middle;
  ${(p) => {
    switch (p.type) {
      case "DOPPLER":
        return `background:#e3f2fd; color:#1565c0;`;
      case "ANC":
        return `background:#fce4ec; color:#880e4f;`;
      case "OBSTETRIC":
        return `background:#f3e5f5; color:#6a1b9a;`;
      case "GENERAL":
      default:
        return `background:#e8f5e9; color:#2e7d32;`;
    }
  }}
`;

const TATBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  white-space: nowrap;
  ${(p) => {
    switch (p.status) {
      case "completed":
        return `background:linear-gradient(135deg,#c8e6c9,#a5d6a7); color:#1b5e20;`;
      case "completed_late":
        return `background:linear-gradient(135deg,#ffe0b2,#ffcc80); color:#bf360c;`;
      case "overdue":
        return `background:linear-gradient(135deg,#ffcdd2,#ef9a9a); color:#b71c1c;`;
      case "on_track":
        return `background:linear-gradient(135deg,#e3f2fd,#bbdefb); color:#0d47a1;`;
      case "waiting":
        return `background:linear-gradient(135deg,#f5f5f5,#eeeeee); color:#9e9e9e;`;
      default:
        return `background:#f5f5f5; color:#9e9e9e;`;
    }
  }}
`;
const SlotPunctualityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  white-space: nowrap;
  ${(p) =>
    p.status === "on_time"
      ? `background:linear-gradient(135deg,#c8e6c9,#a5d6a7);color:#1b5e20;`
      : p.status === "late"
        ? `background:linear-gradient(135deg,#ffcdd2,#ef9a9a);color:#b71c1c;`
        : `background:#f5f5f5;color:#9e9e9e;`}
`;

const tatIcon = (status) => {
  switch (status) {
    case "completed":
      return "✅";
    case "completed_late":
      return "⚠️";
    case "overdue":
      return "🔴";
    case "on_track":
      return "🟢";
    case "waiting":
      return "⏳";
    default:
      return "—";
  }
};

// ─── ANC Info Row ─────────────────────────────────────────────────────────────
const ANCInfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.65rem;
  background: linear-gradient(135deg, #e8f5e9, #f1f8f4);
  border: 1.5px solid #b2dfdb;
  border-left: 4px solid #00897b;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  @media (max-width: 700px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const ANCInfoChip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
`;
const ANCInfoLabel = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const ANCInfoValue = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
  p {
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    margin-top: 0.75rem;
  }
`;

// ─── Modal Base ───────────────────────────────────────────────────────────────

const StyledModalOverlay = styled(ModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(0, 137, 123, 0.9),
    rgba(0, 105, 92, 0.9)
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
`;
const StyledModalContent = styled(ModalContainer)`
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 820px;
  width: 100%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: auto;
  position: relative;
  animation: ${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;
const StyledModalHeader = styled(ModalHeader)`
  border-bottom: 2px solid #f0f0f0;
  background: transparent;
  padding: 0 0 1rem 0;
  margin-bottom: 1.5rem;
`;
const ModalIcon = styled.span`
  font-size: 2rem;
`;
const InfoBanner = styled.div`
  background: linear-gradient(135deg, #e8f5e9, #f1f8f4);
  border: 1.5px solid #b2dfdb;
  border-left: 5px solid #00897b;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1rem;
`;
const InfoChip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;
const InfoChipLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const InfoChipValue = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

// ─── Section Cards ────────────────────────────────────────────────────────────

const SectionCard = styled.div`
  border: 2px solid ${(p) => (p.expanded ? "#b2dfdb" : "#f0f0f0")};
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s;
  margin-bottom: 0.6rem;
`;
const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  background: ${(p) =>
    p.expanded ? "linear-gradient(135deg,#e8f5e9,#f1f8f4)" : "#fafafa"};
  &:hover {
    background: linear-gradient(135deg, #e0f2f1, #e8f5e9);
  }
`;
const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;
const SectionNumber = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const SectionName = styled.span`
  font-weight: 700;
  font-size: 0.82rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;
const ChevronIcon = styled.span`
  font-size: 0.8rem;
  color: #00897b;
  transition: transform 0.2s;
  transform: ${(p) => (p.expanded ? "rotate(180deg)" : "rotate(0deg)")};
`;
const SectionCardBody = styled.div`
  padding: ${(p) => (p.expanded ? "0.875rem 1rem" : "0")};
  max-height: ${(p) => (p.expanded ? "600px" : "0")};
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  background: white;
`;
const PreviewContent = styled.div`
  font-size: 0.875rem;
  color: #444;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  b,
  strong {
    color: #00695c;
    font-weight: 800;
  }
`;

// ─── Table Styled Components ──────────────────────────────────────────────────

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.25rem;
  font-size: 0.82rem;
  border-radius: 8px;
  overflow: hidden;
`;
const ReportTh = styled.th`
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.4px;
  border: 1px solid #00695c;
`;
const ReportTd = styled.td`
  padding: 0.45rem 0.65rem;
  border: 1px solid #d0e8e5;
  vertical-align: middle;
  text-align: center;
  color: #333;
  font-size: 0.8rem;
  background: ${(p) => (p.isHeader ? "#e8f5e9" : p.alt ? "#f8fffe" : "white")};
  font-weight: ${(p) => (p.isHeader ? "700" : "400")};
`;
const EditableCell = styled.div`
  min-width: 80px;
  min-height: 28px;
  padding: 0.2rem 0.4rem;
  border: 1.5px solid transparent;
  border-radius: 6px;
  outline: none;
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  transition:
    border-color 0.15s,
    background 0.15s;
  &:focus {
    border-color: #00897b;
    background: #f0faf8;
  }
  b,
  strong {
    color: #00695c;
    font-weight: 800;
  }
  mark.ph {
    background: #fff3e0;
    color: #e65100;
    font-weight: 700;
    border-radius: 3px;
    padding: 0 2px;
    cursor: text;
  }
  &:empty::before {
    content: "///";
    color: #e65100;
    font-weight: 700;
  }
`;

// ─── Rich Editor Components ───────────────────────────────────────────────────

const RichEditor = styled.div`
  width: 100%;
  min-height: 90px;
  padding: 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #444;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.8;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  background: white;
  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  b,
  strong {
    color: #00695c;
    font-weight: 800;
  }
  &:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    font-style: italic;
    pointer-events: none;
  }
  mark.ph {
    background: #fff3e0;
    color: #e65100;
    font-weight: 700;
    border-radius: 3px;
    padding: 0 2px;
    cursor: text;
  }
`;
const FinalRichEditor = styled.div`
  width: 100%;
  min-height: 160px;
  padding: 0.875rem 1rem;
  border: 2px solid #ce93d8;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #333;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.7;
  overflow-y: auto;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  background: white;
  &:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.12);
  }
  b,
  strong {
    color: #6a1b9a;
    font-weight: 800;
  }
  &:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    font-style: italic;
    pointer-events: none;
  }
  mark.ph {
    background: #fff3e0;
    color: #6a1b9a;
    font-weight: 800;
    border-radius: 3px;
    padding: 0 2px;
    cursor: text;
  }
`;

// ─── Impression & Edit Components ─────────────────────────────────────────────

const ImpressionBox = styled.div`
  background: linear-gradient(135deg, #f3e5f5, #ede7f6);
  border: 2px solid #ce93d8;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  margin-top: 1.25rem;
`;
const ImpressionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #6a1b9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &::before {
    content: "📝";
  }
`;
const ImpressionText = styled.div`
  font-size: 0.938rem;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  b,
  strong {
    color: #6a1b9a;
    font-weight: 800;
  }
  mark.ph {
    background: transparent;
    color: #6a1b9a;
    font-weight: 800;
    border-radius: 3px;
    padding: 0 2px;
  }
`;
const EditImpressionSection = styled.div`
  background: linear-gradient(135deg, #f3e5f5, #ede7f6);
  border: 2px solid #ce93d8;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  margin-top: 1.25rem;
`;
const EditImpressionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #6a1b9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &::before {
    content: "📝";
  }
`;
const SectionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;
const SectionsTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 800;
  color: #00695c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🏥";
  }
`;
const SmallBtn = styled.button`
  padding: 0.28rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: all 0.15s;
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;
const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 2px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
`;
const ModalActionButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    filter: brightness(1.08);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;
const ApprovalBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  ${(p) =>
    p.approved
      ? `background:linear-gradient(135deg,#c8e6c9,#a5d6a7);color:#2e7d32;`
      : `background:linear-gradient(135deg,#fff9c4,#fff59d);color:#f57f17;`}
`;

// ─── Slot Modal ───────────────────────────────────────────────────────────────

const SlotModalContent = styled(StyledModalContent)`
  max-width: 580px;
`;
const SlotModalOverlay = styled(StyledModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(124, 77, 255, 0.88),
    rgba(101, 31, 255, 0.88)
  );
`;
const SlotFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;
const SlotLabel = styled.label`
  color: #4527a0;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;
const SlotInput = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #d1c4e9;
  border-radius: 12px;
  font-size: 1rem;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.15);
  }
`;
const SlotDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 1rem 0 1.5rem 0;
`;
const SlotSectionTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 700;
  color: #7c4dff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const SlotInfoRow = styled.div`
  display: flex;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;
const SlotInfoLabel = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 130px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const SlotInfoValue = styled.span`
  color: #555;
  font-size: 0.938rem;
  flex: 1;
`;

const WfPillBase = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 9px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition:
    opacity 0.15s,
    filter 0.15s;
  font-family: inherit;
  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    filter: none;
  }
  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
`;

export const WfIcon = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  background: ${(p) => p.bg || "rgba(0,0,0,0.12)"};
  color: white;
`;

export const WfTime = styled.span`
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
  margin-left: auto;
  letter-spacing: 0.2px;
`;

export const WfIdleBtn = styled.button`
  ${WfPillBase}
  background: white;
  border-color: #e0e0e0;
  color: #9e9e9e;
  ${WfIcon} {
    background: #e0e0e0;
    color: #9e9e9e;
  }
  &:hover:not(:disabled) {
    border-color: #bdbdbd;
    background: #fafafa;
    color: #616161;
    filter: none;
  }
`;

export const WfCheckedInBtn = styled.button`
  ${WfPillBase}
  background: #f1f8e9;
  border-color: #c5e1a5;
  color: #33691e;
  ${WfIcon} {
    background: #558b2f;
  }
  &:active:not(:disabled) {
    filter: brightness(0.92);
  }
`;

export const WfScanActiveBtn = styled.button`
  ${WfPillBase}
  background: #fff8e1;
  border-color: #ffe082;
  color: #e65100;
  ${WfIcon} {
    background: #f57c00;
  }
  &:active:not(:disabled) {
    filter: brightness(0.92);
  }
`;

export const WfDispatchReadyBtn = styled.button`
  ${WfPillBase}
  background: #e3f2fd;
  border-color: #90caf9;
  color: #0d47a1;
  ${WfIcon} {
    background: #1976d2;
  }
  &:hover:not(:disabled) {
    background: #bbdefb;
    border-color: #64b5f6;
    filter: none;
  }
`;

export const WfDispatchedPill = styled.div`
  ${WfPillBase}
  cursor: default;
  background: #e0f2f1;
  border-color: #80cbc4;
  color: #004d40;
  ${WfIcon} {
    background: #00796b;
  }
`;

export const WfLockedPill = styled.div`
  ${WfPillBase}
  cursor: default;
  opacity: 0.55;
  background: ${(p) => p.bg || "#f5f5f5"};
  border-color: ${(p) => p.borderColor || "#e0e0e0"};
  color: ${(p) => p.color || "#757575"};
  ${WfIcon} {
    background: ${(p) => p.iconBg || "#bdbdbd"};
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.split("T")[0];
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return "";
};
const getToday = () => new Date().toISOString().split("T")[0];
const formatSlotDisplay = (slotDateTime) => {
  if (!slotDateTime) return null;
  try {
    const [datePart, timePart] = slotDateTime.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}, ${String(h12).padStart(2, "0")}:${minute} ${ampm}`;
  } catch {
    return slotDateTime;
  }
};
const calcGAFromLMP = (lmpDateStr) => {
  if (!lmpDateStr) return "";
  try {
    const lmp = new Date(lmpDateStr);
    const today = new Date();
    const diffMs = today - lmp;
    if (diffMs < 0) return "";
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    return `${weeks}W${days}D`;
  } catch {
    return "";
  }
};

const getANCFields = (row) => row?.report?.valuedetails?.anc_fields || null;
const isANCRow = (row) => row.radiology_type === "ANC" || !!getANCFields(row);
const formatLMPDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
};
const useLiveTime = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
};

const ANCDisplayBlock = ({ row }) => {
  const anc = getANCFields(row) || {};
  return (
    <ANCInfoRow>
      <ANCInfoChip>
        <ANCInfoLabel>GUH</ANCInfoLabel>
        <ANCInfoValue>{anc.guh || "—"}</ANCInfoValue>
      </ANCInfoChip>
      <ANCInfoChip>
        <ANCInfoLabel>LMP</ANCInfoLabel>
        <ANCInfoValue>{formatLMPDate(anc.lmp)}</ANCInfoValue>
      </ANCInfoChip>
      <ANCInfoChip>
        <ANCInfoLabel>GA (By LMP)</ANCInfoLabel>
        <ANCInfoValue>{anc.ga_lmp || "—"}</ANCInfoValue>
      </ANCInfoChip>
      <ANCInfoChip>
        <ANCInfoLabel>GA (By USG)</ANCInfoLabel>
        <ANCInfoValue>{anc.ga_usg || "—"}</ANCInfoValue>
      </ANCInfoChip>
      <ANCInfoChip>
        <ANCInfoLabel>EDD (By USG)</ANCInfoLabel>
        <ANCInfoValue>{formatLMPDate(anc.edd_usg)}</ANCInfoValue>
      </ANCInfoChip>
    </ANCInfoRow>
  );
};
const ANCEditBlock = ({ row, ancFields, onChange }) => (
  <ANCInfoRow style={{ marginBottom: "1rem" }}>
    <ANCInfoChip>
      <ANCInfoLabel>GUH</ANCInfoLabel>
      <input
        style={{
          padding: "0.4rem 0.6rem",
          border: "1.5px solid #b2dfdb",
          borderRadius: "8px",
          fontSize: "0.875rem",
          width: "100%",
          boxSizing: "border-box",
        }}
        placeholder="///"
        value={ancFields.guh || ""}
        onChange={(e) => onChange((p) => ({ ...p, guh: e.target.value }))}
      />
    </ANCInfoChip>
    <ANCInfoChip>
      <ANCInfoLabel>LMP</ANCInfoLabel>
      <input
        type="date"
        style={{
          padding: "0.4rem 0.6rem",
          border: "1.5px solid #b2dfdb",
          borderRadius: "8px",
          fontSize: "0.875rem",
          width: "100%",
          boxSizing: "border-box",
        }}
        value={ancFields.lmp || ""}
        onChange={(e) => {
          const lmp = e.target.value;
          const ga_lmp = calcGAFromLMP(lmp);
          onChange((p) => ({ ...p, lmp, ga_lmp }));
        }}
      />
    </ANCInfoChip>
    <ANCInfoChip>
      <ANCInfoLabel>GA (By LMP)</ANCInfoLabel>
      <input
        style={{
          padding: "0.4rem 0.6rem",
          border: "1.5px solid #b2dfdb",
          borderRadius: "8px",
          fontSize: "0.875rem",
          width: "100%",
          boxSizing: "border-box",
        }}
        placeholder="e.g. 12W3D"
        value={ancFields.ga_lmp || ""}
        onChange={(e) => onChange((p) => ({ ...p, ga_lmp: e.target.value }))}
      />
    </ANCInfoChip>
    <ANCInfoChip>
      <ANCInfoLabel>GA (By USG)</ANCInfoLabel>
      <input
        style={{
          padding: "0.4rem 0.6rem",
          border: "1.5px solid #b2dfdb",
          borderRadius: "8px",
          fontSize: "0.875rem",
          width: "100%",
          boxSizing: "border-box",
        }}
        placeholder="e.g. 12W4D"
        value={ancFields.ga_usg || ""}
        onChange={(e) => onChange((p) => ({ ...p, ga_usg: e.target.value }))}
      />
    </ANCInfoChip>
    <ANCInfoChip>
      <ANCInfoLabel>EDD (By USG)</ANCInfoLabel>
      <input
        type="date"
        style={{
          padding: "0.4rem 0.6rem",
          border: "1.5px solid #b2dfdb",
          borderRadius: "8px",
          fontSize: "0.875rem",
          width: "100%",
          boxSizing: "border-box",
        }}
        value={ancFields.edd_usg || ""}
        onChange={(e) => onChange((p) => ({ ...p, edd_usg: e.target.value }))}
      />
    </ANCInfoChip>
  </ANCInfoRow>
);

// ─── Rich Editor Ref Helper ───────────────────────────────────────────────────

const getCaretInsideMark = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const node = sel.getRangeAt(0).startContainer;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (el && el.classList && el.classList.contains("ph")) return el;
  return null;
};

// ─── SectionRichEditor ────────────────────────────────────────────────────────

const SectionRichEditor = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  const lastRef = useRef("");
  const suppressRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
    lastRef.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (value !== lastRef.current) {
      ref.current.innerHTML = value || "";
      lastRef.current = value || "";
    }
  }, [value]);

  const handleKeyDown = (e) => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const markEl = getCaretInsideMark();
    if (markEl && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const boldNode = document.createElement("b");
      boldNode.textContent = e.key;
      markEl.replaceWith(boldNode);
      const range = document.createRange();
      range.setStartAfter(boldNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      suppressRef.current = true;
      const html = el.innerHTML;
      lastRef.current = html;
      onChange(html);
      return;
    }
    if (markEl && e.key === "Backspace") {
      e.preventDefault();
      const range = document.createRange();
      range.setStartBefore(markEl);
      range.collapse(true);
      markEl.remove();
      sel.removeAllRanges();
      sel.addRange(range);
      suppressRef.current = true;
      const html = el.innerHTML;
      lastRef.current = html;
      onChange(html);
      return;
    }
  };

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastRef.current = html;
    suppressRef.current = true;
    onChange(html);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    document.execCommand(
      "insertText",
      false,
      e.clipboardData.getData("text/plain"),
    );
  };

  const handleClick = (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains("ph")) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  return (
    <RichEditor
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onPaste={handlePaste}
      onClick={handleClick}
      spellCheck={false}
    />
  );
};

// ─── ImpressionRichEditor ─────────────────────────────────────────────────────

const ImpressionRichEditor = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  const lastRef = useRef("");
  const suppressRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
    lastRef.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (value !== lastRef.current) {
      ref.current.innerHTML = value || "";
      lastRef.current = value || "";
    }
  }, [value]);

  const handleKeyDown = (e) => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const markEl = getCaretInsideMark();
    if (markEl && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const boldNode = document.createElement("b");
      boldNode.textContent = e.key;
      markEl.replaceWith(boldNode);
      const range = document.createRange();
      range.setStartAfter(boldNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      suppressRef.current = true;
      const html = el.innerHTML;
      lastRef.current = html;
      onChange(html);
      return;
    }
    if (markEl && e.key === "Backspace") {
      e.preventDefault();
      const range = document.createRange();
      range.setStartBefore(markEl);
      range.collapse(true);
      markEl.remove();
      sel.removeAllRanges();
      sel.addRange(range);
      suppressRef.current = true;
      const html = el.innerHTML;
      lastRef.current = html;
      onChange(html);
      return;
    }
  };

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastRef.current = html;
    suppressRef.current = true;
    onChange(html);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    document.execCommand(
      "insertText",
      false,
      e.clipboardData.getData("text/plain"),
    );
  };

  const handleClick = (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains("ph")) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  return (
    <FinalRichEditor
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onPaste={handlePaste}
      onClick={handleClick}
      spellCheck={false}
    />
  );
};

// ─── TablePreview (read-only) — ALL rows as data rows ─────────────────────────

const TablePreview = ({ entry }) => {
  const { rows, cols } = parseTableDimensions(entry.table_id);
  const grid = extractTableCells(entry, rows, cols);
  if (!grid.length) return null;
  return (
    <ReportTable>
      <tbody>
        {grid.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <ReportTd
                key={ci}
                isHeader={ci === 0}
                alt={ri % 2 === 1}
                style={
                  ri === 0
                    ? {
                      background: "linear-gradient(135deg,#e0f2f1,#b2dfdb)",
                      fontWeight: 700,
                    }
                    : {}
                }
              >
                <span
                  dangerouslySetInnerHTML={{ __html: buildInitialHTML(cell) }}
                />
              </ReportTd>
            ))}
          </tr>
        ))}
      </tbody>
    </ReportTable>
  );
};

// ─── Sanitize ─────────────────────────────────────────────────────────────────
const sanitizeCellHTML = (html) => {
  if (!html) return "";
  return html
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<(?!\/?b(?:\s|>))[^>]+>/gi, "")
    .trim();
};

// ─── TableEditor — ALL rows editable ─────────────────────────────────────────

const TableEditor = ({ entry, onChange }) => {
  const { rows, cols } = parseTableDimensions(entry.table_id);
  const [grid, setGrid] = useState(() => extractTableCells(entry, rows, cols));
  const cellRefs = useRef({});

  useEffect(() => {
    // Set initial HTML for ALL rows (including row 0)
    grid.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const el = cellRefs.current[`${ri}-${ci}`];
        if (el) {
          el.innerHTML = buildInitialHTML(sanitizeCellHTML(cell));
        }
      });
    });
    const sanitizedGrid = grid.map((row) =>
      row.map((cell) => sanitizeCellHTML(cell)),
    );
    const serialized = serializeTableCells(sanitizedGrid);
    onChange({ ...serialized, table_id: entry.table_id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitCell = (ri, ci, html) => {
    const clean = sanitizeCellHTML(html);
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      newGrid[ri][ci] = clean;
      const serialized = serializeTableCells(newGrid);
      onChange({ ...serialized, table_id: entry.table_id });
      return newGrid;
    });
  };

  const handleCellKeyDown = (e, ri, ci, el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const markEl = getCaretInsideMark();
    if (markEl && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const boldNode = document.createElement("b");
      boldNode.textContent = e.key;
      markEl.replaceWith(boldNode);
      const range = document.createRange();
      range.setStartAfter(boldNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      commitCell(ri, ci, el.innerHTML);
      return;
    }
    if (markEl && e.key === "Backspace") {
      e.preventDefault();
      const range = document.createRange();
      range.setStartBefore(markEl);
      range.collapse(true);
      markEl.remove();
      sel.removeAllRanges();
      sel.addRange(range);
      commitCell(ri, ci, el.innerHTML);
      return;
    }
  };

  const handleCellInput = (ri, ci, el) => {
    commitCell(ri, ci, el.innerHTML);
  };

  const handleCellClick = (e) => {
    const t = e.target;
    if (t.classList?.contains("ph")) {
      const range = document.createRange();
      range.selectNodeContents(t);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  return (
    <ReportTable>
      <tbody>
        {grid.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <ReportTd
                key={ci}
                isHeader={ci === 0}
                alt={ri % 2 === 1}
                style={
                  ri === 0
                    ? {
                      background: "linear-gradient(135deg,#e0f2f1,#b2dfdb)",
                      fontWeight: 700,
                    }
                    : {}
                }
              >
                <EditableCell
                  ref={(el) => {
                    cellRefs.current[`${ri}-${ci}`] = el;
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={(e) =>
                    handleCellKeyDown(e, ri, ci, e.currentTarget)
                  }
                  onInput={(e) => handleCellInput(ri, ci, e.currentTarget)}
                  onPaste={(e) => {
                    e.preventDefault();
                    document.execCommand(
                      "insertText",
                      false,
                      e.clipboardData.getData("text/plain"),
                    );
                  }}
                  onClick={handleCellClick}
                  spellCheck={false}
                />
              </ReportTd>
            ))}
          </tr>
        ))}
      </tbody>
    </ReportTable>
  );
};

// ─── buildSectionsFromValueDetails ───────────────────────────────────────────

// This function already does this correctly — verify the tableNameMap logic:
const buildSectionsFromValueDetails = (
  valuedetails,
  titleMap = null,
  formatTitles = null,
) => {
  if (!valuedetails || !Array.isArray(valuedetails.value)) return [];

  const tableNameMap = {};
  if (formatTitles) {
    formatTitles.forEach((f) => {
      // table entries in format_titles have table_id + table_name
      if (f.table_id && f.table_name) {
        tableNameMap[f.table_id] = f.table_name;
      }
    });
  }

  return valuedetails.value.map((v) => {
    if (isTableEntry(v)) {
      // Prefer table_name on the saved entry, fall back to format lookup
      const tableName = v.table_name || tableNameMap[v.table_id] || "";
      return {
        title_id: v.title_id || v.table_id,
        title: tableName || "Study Table",
        tableName,
        value: v,
        isTable: true,
      };
    }
    return {
      title_id: v.title_id,
      title: (titleMap && titleMap[v.title_id]) || v.title_id || "",
      tableName: "",
      value: v.title_value || "",
      isTable: false,
    };
  });
};
// ─── PreviewSectionItem ───────────────────────────────────────────────────────

const PreviewSectionItem = ({ section, index }) => {
  const [expanded, setExpanded] = useState(true);
  const displayTitle = section.isTable
    ? section.tableName || "Study Table"
    : section.title;
  return (
    <SectionCard expanded={expanded}>
      <SectionCardHeader
        expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        <SectionTitleRow>
          <SectionNumber>{index + 1}</SectionNumber>
          <SectionName>{displayTitle}</SectionName>
        </SectionTitleRow>
        <ChevronIcon expanded={expanded}>▼</ChevronIcon>
      </SectionCardHeader>
      <SectionCardBody expanded={expanded}>
        {section.isTable ? (
          <TablePreview entry={section.value} />
        ) : (
          <PreviewContent
            dangerouslySetInnerHTML={{
              __html:
                section.value ||
                "<em style='color:#bbb'>No findings entered.</em>",
            }}
          />
        )}
      </SectionCardBody>
    </SectionCard>
  );
};

// ─── EditSectionItem ──────────────────────────────────────────────────────────

const EditSectionItem = ({ section, index, onChange }) => {
  const [expanded, setExpanded] = useState(true);
  const displayTitle = section.isTable
    ? section.tableName || "Study Table"
    : section.title;
  return (
    <SectionCard expanded={expanded}>
      <SectionCardHeader
        expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        <SectionTitleRow>
          <SectionNumber>{index + 1}</SectionNumber>
          <SectionName>{displayTitle}</SectionName>
        </SectionTitleRow>
        <ChevronIcon expanded={expanded}>▼</ChevronIcon>
      </SectionCardHeader>
      <SectionCardBody expanded={expanded}>
        {section.isTable ? (
          <TableEditor
            entry={section.value}
            onChange={(updatedEntry) => onChange(index, updatedEntry, true)}
          />
        ) : (
          <SectionRichEditor
            value={section.value}
            onChange={(html) => onChange(index, html, false)}
            placeholder={`Enter findings for ${section.title}…`}
          />
        )}
      </SectionCardBody>
    </SectionCard>
  );
};

// ─── PDF Print Helper ─────────────────────────────────────────────────────────

const handlePrintReport = async (row, withLetterpad = true) => {
  try {
    const report = row.report;
    if (!report) {
      toast.error("No report available to print.");
      return;
    }

    let signatureData = null;
    const approvedBy = report.approved_by;
    if (approvedBy) {
      try {
        const result = await apiRequest(
          `${process.env.REACT_APP_BACKEND_HMS_BASE_URL}employee-signature/?employee_id=${approvedBy}`,
          "GET",
        );
        if (result.success && result.data) signatureData = result.data;
      } catch (e) {
        console.warn("Could not fetch signature:", e);
      }
    }

    const sections = buildSectionsFromValueDetails(
      report.valuedetails,
      row._titleMap,
      row.radiology_format?.format_titles, // ← add this
    );
    const impression = report.impression || "";
    const pnaDetails = row._pnaDetails || [];
    const disclaimerList = row._desclaimer || [];

    const doc = new jsPDF();
    let pageCount = 1;

    const leftMargin = 10;
    const rightMargin = leftMargin + 190;
    const contentWidth = rightMargin - leftMargin;
    const headerHeight = 25;
    const footerHeight = 20;
    const contentYStart = headerHeight + 15;


    const billDateFormatted = row.investBillDate
      ? format(new Date(row.investBillDate), "dd MMM yy / HH:mm")
      : "N/A";
    const slotFormatted = report.slot_DateTime
      ? format(new Date(report.slot_DateTime), "dd MMM yy / HH:mm")
      : null;
    const approvedFormatted = report.approved_date
      ? format(new Date(report.approved_date), "dd MMM yy / HH:mm")
      : null;

    const custType = row.customer_type || row.customerType || "General";
    const isIns = custType.toUpperCase().includes("INSURANCE");
    const compName = row.company_name || row.insurance_company || "";

    const leftDetails = [
      { label: "Bill No", value: row.investBillNo || "N/A" },
      ...(row.uhid && row.uhid !== "na"
        ? [{ label: "UHID", value: row.uhid }]
        : []),
      { label: "Patient Name", value: row.patientName || "N/A" },
      {
        label: "Age / Gender",
        value: `${row.age}${row.age_type} / ${row.gender || "N/A"}`,
      },
      { label: "Referred By", value: row.referredByName || "SELF" },
    ];
    const rightDetails = [
      { label: "Billed On", value: billDateFormatted },
      ...(slotFormatted ? [{ label: "Slot Date", value: slotFormatted }] : []),
      ...(approvedFormatted
        ? [{ label: "Approved On", value: approvedFormatted }]
        : []),
      { label: "Printed On", value: format(new Date(), "dd MMM yy / HH:mm") },
      { label: "Customer Type", value: custType },
      ...((isIns || compName) && compName
        ? [{ label: "Company Name", value: compName }]
        : []),
      ...(row.ipNumber
        ? [{ label: "IP Number", value: row.ipNumber || "N/A" }]
        : []),
    ];

    const wrapText = (text, maxWidth) => {
      if (!text) return [];
      return doc.splitTextToSize(text, maxWidth);
    };

    const htmlToPlainText = (html) => {
      if (!html) return "";
      return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .trim();
    };

    const parseHtmlSegments = (html) => {
      if (!html) return [];
      const normalized = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'");
      const segments = [];
      const regex = /<b>(.*?)<\/b>|([^<]+)/gis;
      let match;
      while ((match = regex.exec(normalized)) !== null) {
        if (match[1] !== undefined)
          segments.push({ text: match[1], bold: true });
        else if (match[2] !== undefined) {
          const plain = match[2].replace(/<[^>]*>/g, "");
          if (plain) segments.push({ text: plain, bold: false });
        }
      }
      return segments;
    };

    const addHeaderFooter = () => {
      if (withLetterpad) {
        doc.addImage(
          headerImage,
          "PNG",
          0,
          10,
          doc.internal.pageSize.width,
          headerHeight,
        );
        doc.addImage(
          FooterImage,
          "PNG",
          0,
          doc.internal.pageSize.height - footerHeight,
          doc.internal.pageSize.width,
          footerHeight,
        );
      }
    };


    const calculateMaxLabelWidth = (details) => {
      const tempDoc = new jsPDF();
      tempDoc.setFont("helvetica", "bold");
      tempDoc.setFontSize(10);
      return Math.max(...details.map((d) => tempDoc.getTextWidth(d.label)));
    };

    const addPatientInfo = (yPos) => {
      const leftMaxW = calculateMaxLabelWidth(leftDetails);
      const rightMaxW = calculateMaxLabelWidth(rightDetails);
      const leftLabelX = leftMargin;
      const leftColonX = leftLabelX + leftMaxW + 2;
      const leftValueX = leftColonX + 3;
      const rightLabelX = 133;
      const rightColonX = rightLabelX + rightMaxW + 2;
      const rightValueX = rightColonX + 3;

      doc.setFontSize(10);
      let infoY = yPos;
      const maxLen = Math.max(leftDetails.length, rightDetails.length);
      for (let i = 0; i < maxLen; i++) {
        const left = leftDetails[i];
        const right = rightDetails[i];
        let leftRowH = 5;
        if (left) {
          doc.setFont("helvetica", "bold");
          doc.text(left.label, leftLabelX, infoY);
          doc.text(":", leftColonX, infoY);
          doc.setFont("helvetica", "normal");
          const maxLeftW = rightLabelX - 4 - leftValueX;
          const leftLines = wrapText(String(left.value || ""), maxLeftW);
          leftLines.forEach((line, li) =>
            doc.text(line, leftValueX, infoY + li * 4),
          );
          leftRowH = leftLines.length * 4;
        }
        let rightRowH = 5;
        if (right) {
          doc.setFont("helvetica", "bold");
          doc.text(right.label, rightLabelX, infoY);
          doc.text(":", rightColonX, infoY);
          doc.setFont("helvetica", "normal");
          const maxRightW = rightMargin - rightValueX;
          const rightLines = wrapText(String(right.value || ""), maxRightW);
          rightLines.forEach((line, li) =>
            doc.text(line, rightValueX, infoY + li * 4),
          );
          rightRowH = rightLines.length * 4;
        }
        infoY += Math.max(leftRowH, rightRowH, 5);
      }
      return infoY;
    };

    const addSignatures = (yPos) => {
      if (!signatureData) return yPos;
      const sigX = rightMargin - 68;
      let sy = yPos + 3;
      if (signatureData.signatureBase64) {
        try {
          doc.addImage(
            `data:image/png;base64,${signatureData.signatureBase64}`,
            "PNG",
            sigX,
            sy,
            52,
            14,
          );
        } catch (e) {
          console.warn("Could not render signature image:", e);
        }
      }
      sy += 16;
      doc.setDrawColor(100, 100, 100);
      doc.line(sigX, sy, sigX + 52, sy);
      doc.setDrawColor(0, 0, 0);
      sy += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(signatureData.employeeName || "", sigX + 29, sy, {
        align: "center",
      });
      sy += 3;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(signatureData.designation || "", sigX + 29, sy, {
        align: "center",
      });
      sy += 3;
      if (signatureData.registrationNumber) {
        doc.setFontSize(7);
        doc.text(
          `Reg. No: ${signatureData.registrationNumber}`,
          sigX + 29,
          sy,
          { align: "center" },
        );
        sy += 3;
      }
      doc.setFont("helvetica", "normal");
      return sy;
    };

    const checkNewPage = (yPos, needed = 0) => {
      const pageH = doc.internal.pageSize.height;
      const footerStart = pageH - footerHeight - 12; // extra 12px safety margin
      if (yPos + needed > footerStart) {
        // Redraw footer over any content bleed on current page
        if (withLetterpad) {
          doc.addImage(
            FooterImage,
            "PNG",
            0,
            pageH - footerHeight,
            doc.internal.pageSize.width,
            footerHeight,
          );
        }
        doc.addPage();
        pageCount++;
        addHeaderFooter();
        let ny = contentYStart;
        ny = addPatientInfo(ny);
        ny += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, ny - 4, rightMargin, ny - 4);
        doc.setDrawColor(0, 0, 0);
        return ny;
      }
      return yPos;
    };

    // ── BUILD PDF ──────────────────────────────────────────────────────────────

    addHeaderFooter();
    let yPos = addPatientInfo(contentYStart);

    doc.setDrawColor(180, 180, 180);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    doc.setDrawColor(0, 0, 0);
    yPos += 6;

    const centerX = leftMargin + contentWidth / 2;
    const department = row.department ? row.department.toUpperCase() : "";
    const headingStr = row.heading ? row.heading.toUpperCase() : "";
    const subHeading = row.sub_heading || "";

    // ── Department ────────────────────────────────────────────────────────────
    if (department) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(department, centerX, yPos, { align: "center" });
      yPos += 7;
    }

    // ── PNA Details (centered, between department and heading) ────────────────
    if (pnaDetails && pnaDetails.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      pnaDetails.forEach((pna) => {
        const pnaText = `PNA: ${pna.pna}   Registration date: ${pna.registration_date}`;
        doc.text(pnaText, centerX, yPos, { align: "center" });
        yPos += 4.5;
      });
      doc.setTextColor(0, 0, 0);
    }

    // ── Heading with underline ─────────────────────────────────────────────────
    if (headingStr) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const headingLines = doc.splitTextToSize(headingStr, contentWidth - 10);
      headingLines.forEach((line, li) => {
        doc.text(line, centerX, yPos + li * 6, { align: "center" });
        const lineW = doc.getTextWidth(line);
        doc.line(
          centerX - lineW / 2,
          yPos + li * 6 + 1.5,
          centerX + lineW / 2,
          yPos + li * 6 + 1.5,
        );
      });
      yPos += headingLines.length * 6 + 1;
    }

    // ── Sub heading ────────────────────────────────────────────────────────────
    if (subHeading) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(subHeading, centerX, yPos, { align: "center" });
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      yPos += 5;
    }
    yPos += 2;

    // ── ANC Fields Row ─────────────────────────────────────────────────────────
    const ancData = row.report?.valuedetails?.anc_fields;
    if (
      ancData &&
      (ancData.guh || ancData.lmp || ancData.ga_weeks || ancData.edd_usg)
    ) {
      const ancRowH = 16;
      const ancCellW = contentWidth / 5;
      const ancLabels = [
        "NO OF CHILDREN",
        "LMP",
        "GA (By LMP)",
        "GA (By USG)",
        "EDD (By USG)",
      ];
      const ancVals = [
        ancData.guh || "—",
        ancData.lmp
          ? (() => {
            try {
              return new Date(ancData.lmp).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            } catch {
              return ancData.lmp;
            }
          })()
          : "—",
        ancData.ga_lmp || "—",
        ancData.ga_usg || "—",
        ancData.edd_usg
          ? (() => {
            try {
              return new Date(ancData.edd_usg).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            } catch {
              return ancData.edd_usg;
            }
          })()
          : "—",
      ];

      doc.setFillColor(232, 245, 233);
      doc.rect(leftMargin, yPos, contentWidth, ancRowH, "F");
      doc.setDrawColor(178, 223, 219);
      doc.rect(leftMargin, yPos, contentWidth, ancRowH, "S");
      doc.setDrawColor(0, 105, 92);
      doc.setLineWidth(1.2);
      doc.line(leftMargin, yPos, leftMargin, yPos + ancRowH);
      doc.setLineWidth(0.2);
      doc.setDrawColor(178, 223, 219);

      ancLabels.forEach((label, i) => {
        const cellX = leftMargin + i * ancCellW;
        if (i > 0) doc.line(cellX, yPos, cellX, yPos + ancRowH);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(0, 105, 92);
        doc.text(label, cellX + ancCellW / 2, yPos + 5, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(40, 40, 40);
        doc.text(ancVals[i], cellX + ancCellW / 2, yPos + 11.5, {
          align: "center",
        });
      });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      yPos += ancRowH + 4;
    }

    // ── Sections ───────────────────────────────────────────────────────────────

    if (sections.length > 0) {
      sections.forEach((section, idx) => {
        if (section.isTable) {
          // ── TABLE SECTION — ALL rows as data rows ─────────────────────────
          const entry = section.value;
          const { rows: tRows, cols } = parseTableDimensions(entry.table_id);
          const grid = extractTableCells(entry, tRows, cols);
          if (!grid.length) return;

          const cellPadX = 3;
          const cellPadY = 2.5;
          const lineH = 5;
          const minRowH = 9;
          const fontSize = 8.5;

          doc.setFontSize(fontSize);
          const colWidth = contentWidth / cols;

          // Pre-calculate row heights
          const rowHeights = grid.map((row) => {
            let maxLines = 1;
            row.forEach((cell) => {
              const plain = htmlToPlainText(cell).replace(/\/\/\//g, "");
              const wrapped = doc.splitTextToSize(
                plain,
                colWidth - cellPadX * 2,
              );
              if (wrapped.length > maxLines) maxLines = wrapped.length;
            });
            return Math.max(minRowH, maxLines * lineH + cellPadY * 2);
          });

          // ── Table name heading ─────────────────────────────────────────────
          const tableName = section.tableName || "";
          const tableNameHeight = tableName ? 10 : 0;

          const totalTableHeight =
            rowHeights.reduce((a, b) => a + b, 0) + tableNameHeight + 6;
          yPos = checkNewPage(yPos, totalTableHeight);

          // Render table name if present
          if (tableName) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(0, 105, 92);
            doc.text(tableName.toUpperCase(), leftMargin, yPos);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            yPos += 6;
          }

          grid.forEach((row, ri) => {
            const rowH = rowHeights[ri];
            yPos = checkNewPage(yPos, rowH + 2);

            // ALL rows get the same mild alternating background
            doc.setFillColor(
              ri % 2 === 0 ? 240 : 248,
              ri % 2 === 0 ? 248 : 252,
              ri % 2 === 0 ? 245 : 250,
            );
            doc.rect(leftMargin, yPos, contentWidth, rowH, "F");

            row.forEach((cell, ci) => {
              const x = leftMargin + ci * colWidth;
              doc.setDrawColor(200, 225, 220);
              doc.rect(x, yPos, colWidth, rowH, "S");

              doc.setFontSize(fontSize);
              const maxW = colWidth - cellPadX * 2;
              const segments = parseHtmlSegments(cell);

              const words = [];
              segments.forEach(({ text, bold }) => {
                const parts = text.split("\n");
                parts.forEach((part, pi) => {
                  if (pi > 0) words.push({ text: "\n", bold: false });
                  part.split(" ").forEach((w) => {
                    if (w) words.push({ text: w, bold });
                  });
                });
              });

              const wrappedLines = [];
              let curLine = [];
              let curLineW = 0;
              const pushLine = () => {
                wrappedLines.push(curLine);
                curLine = [];
                curLineW = 0;
              };

              words.forEach((word) => {
                if (word.text === "\n") {
                  pushLine();
                  return;
                }
                doc.setFont("helvetica", word.bold ? "bold" : "normal");
                const spaceW = curLine.length > 0 ? doc.getTextWidth(" ") : 0;
                const wordW = doc.getTextWidth(word.text);
                if (curLineW + spaceW + wordW > maxW && curLine.length > 0)
                  pushLine();
                const spacedText =
                  curLine.length > 0 ? " " + word.text : word.text;
                const last = curLine[curLine.length - 1];
                if (last && last.bold === word.bold) {
                  last.text += curLine.length > 0 ? " " + word.text : word.text;
                  last.w += doc.getTextWidth(spacedText);
                } else {
                  curLine.push({
                    text: spacedText,
                    bold: word.bold,
                    w: doc.getTextWidth(spacedText),
                  });
                }
                curLineW += doc.getTextWidth(spacedText);
              });
              if (curLine.length > 0) pushLine();

              const nonEmpty = wrappedLines.filter(
                (l) => l.length > 0 && l.some((s) => s.text.trim()),
              );
              const blockH = nonEmpty.length * lineH;
              const startY = yPos + (rowH - blockH) / 2 + lineH * 0.75;

              nonEmpty.forEach((lineSegs, li) => {
                const totalW = lineSegs.reduce((acc, s) => acc + s.w, 0);
                let cx = x + (colWidth - totalW) / 2;
                lineSegs.forEach(({ text, bold }) => {
                  doc.setFont("helvetica", bold ? "bold" : "normal");
                  doc.setTextColor(40, 40, 40);
                  doc.text(text, cx, startY + li * lineH);
                  cx += doc.getTextWidth(text);
                });
              });
            });

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            yPos += rowH;
          });

          doc.setDrawColor(0, 0, 0);
          yPos += 5;
        } else {
          // ── TEXT SECTION ──────────────────────────────────────────────────
          if (!section.value) return;

          const lineH = 4.8;
          const segments = (() => {
            // Parse HTML into bold/normal segments line by line
            const html = section.value;
            if (!html) return [];
            const normalized = html
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<\/p>/gi, "\n")
              .replace(/<\/div>/gi, "\n")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&nbsp;/g, " ")
              .replace(/&#39;/g, "'");
            const segs = [];
            const regex = /<b>(.*?)<\/b>|([^<]+)/gis;
            let match;
            while ((match = regex.exec(normalized)) !== null) {
              if (match[1] !== undefined)
                segs.push({ text: match[1], bold: true });
              else if (match[2] !== undefined) {
                const plain = match[2].replace(/<[^>]*>/g, "");
                if (plain) segs.push({ text: plain, bold: false });
              }
            }
            return segs;
          })();

          // Build all lines first (same word-wrap logic as renderRichText)
          const maxW = contentWidth - 6;
          const allLines = [];
          let currentLine = [];
          let currentLineWidth = 0;
          const pushLine = () => {
            allLines.push(currentLine);
            currentLine = [];
            currentLineWidth = 0;
          };
          doc.setFontSize(9);
          segments.forEach(({ text, bold }) => {
            const parts = text.split("\n");
            parts.forEach((part, partIdx) => {
              if (partIdx > 0) pushLine();
              const words = part.split(" ");
              words.forEach((word, wi) => {
                if (word === "" && wi === 0 && currentLine.length === 0) return;
                doc.setFont("helvetica", bold ? "bold" : "normal");
                const spaceW =
                  currentLine.length > 0 ? doc.getTextWidth(" ") : 0;
                const wordW = doc.getTextWidth(word);
                if (
                  currentLineWidth + spaceW + wordW > maxW &&
                  currentLine.length > 0
                )
                  pushLine();
                const space = currentLine.length > 0 ? " " : "";
                const last = currentLine[currentLine.length - 1];
                if (last && last.bold === bold) {
                  last.text += space + word;
                  last.width += doc.getTextWidth(space + word);
                } else {
                  const segText = space + word;
                  currentLine.push({
                    text: segText,
                    bold,
                    width: doc.getTextWidth(segText),
                  });
                }
                currentLineWidth += doc.getTextWidth(space + word);
              });
            });
          });
          if (currentLine.length > 0) pushLine();

          const nonEmptyLines = allLines.filter(
            (l) => l.length > 0 && l.some((s) => s.text.trim()),
          );

          if (nonEmptyLines.length === 0) return;

          // Always check for new page before title
          yPos = checkNewPage(yPos, 6 + lineH);

          // Section title
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(0, 105, 92);
          doc.text(section.title.toUpperCase(), leftMargin, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;

          // Render each line individually, checking for page break each time
          doc.setFontSize(9);
          nonEmptyLines.forEach((line) => {
            yPos = checkNewPage(yPos, lineH);
            let cx = leftMargin + 3;
            line.forEach(({ text, bold }) => {
              doc.setFont("helvetica", bold ? "bold" : "normal");
              doc.text(text, cx, yPos);
              cx += doc.getTextWidth(text);
            });
            yPos += lineH;
          });
          doc.setFont("helvetica", "normal");
          yPos += 3;
        }
      });
    }

    // ── Impression ─────────────────────────────────────────────────────────────

    const getAvailableSpace = (currentY) => {
      return doc.internal.pageSize.height - footerHeight - 5 - currentY;
    };

    yPos = checkNewPage(yPos, 12);
    if (impression) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 105, 92);
      doc.text("IMPRESSION:", leftMargin + 3, yPos + 3);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      const impressionLines = impression
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .split("\n")
        .map((line) =>
          line
            .replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
            .trim(),
        )
        .filter(Boolean);

      const bulletX = leftMargin + 3;
      const textX = leftMargin + 9;
      const bulletMaxWidth = contentWidth - 9;

      impressionLines.forEach((line) => {
        doc.setFont("helvetica", "bold");
        const wrapped = doc.splitTextToSize(line, bulletMaxWidth);
        yPos = checkNewPage(yPos, 5.2);
        doc.setTextColor(0, 105, 92);
        doc.text("•", bulletX, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        wrapped.forEach((wline, wi) => {
          if (wi > 0) {
            yPos += 5.2;
            yPos = checkNewPage(yPos, 5.2);
          }
          doc.text(wline, textX, yPos);
        });
        yPos += 5.2 + 0.2;
      });
      doc.setFont("helvetica", "normal");
      yPos += 0.5;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("**End of the Report**", leftMargin + contentWidth / 2, yPos, {
      align: "center",
    });
    yPos += 6;

    // ── Signatures ─────────────────────────────────────────────────────────────
    const afterSigY = addSignatures(yPos);
    yPos = afterSigY + 8;

    // ── Disclaimer — after signature ──────────────────────────────────────────
    if (disclaimerList && disclaimerList.length > 0) {
      disclaimerList.forEach((disc) => {
        const titleText = disc.title || "DISCLAIMER";
        const rawText = htmlToPlainText(disc.title_value || "");
        const bodyText = rawText
          .replace(/\r?\n+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (!bodyText) return;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        const bodyLines = doc.splitTextToSize(bodyText, contentWidth);
        const discH = 6 + 5 + bodyLines.length * 4.5 + 6;
        yPos = checkNewPage(yPos, discH + 10);

        // Separator
        doc.setDrawColor(180, 180, 180);
        doc.line(leftMargin, yPos, rightMargin, yPos);
        doc.setDrawColor(0, 0, 0);
        yPos += 5;

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        doc.text(titleText, leftMargin, yPos);
        const titleW = doc.getTextWidth(titleText);
        doc.line(leftMargin, yPos + 1, leftMargin + titleW, yPos + 1);
        yPos += 6;

        // ── Justified body text ───────────────────────────────────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);

        bodyLines.forEach((line, lineIdx) => {
          yPos = checkNewPage(yPos, 5);

          const isLastLine = lineIdx === bodyLines.length - 1;

          // Last line or very short line — left align, no justification
          if (isLastLine || doc.getTextWidth(line) < contentWidth * 0.6) {
            doc.text(line, leftMargin, yPos);
          } else {
            // Justify: distribute extra space evenly between words
            const words = line.split(" ").filter((w) => w.length > 0);
            if (words.length <= 1) {
              doc.text(line, leftMargin, yPos);
            } else {
              const totalWordsWidth = words.reduce(
                (sum, w) => sum + doc.getTextWidth(w),
                0,
              );
              const totalSpace = contentWidth - totalWordsWidth;
              const spacePerGap = totalSpace / (words.length - 1);
              let x = leftMargin;
              words.forEach((word, wi) => {
                doc.text(word, x, yPos);
                x += doc.getTextWidth(word) + spacePerGap;
              });
            }
          }
          yPos += 4.5;
        });

        doc.setTextColor(0, 0, 0);
        yPos += 4;
      });
    }
    // ── Page numbers ───────────────────────────────────────────────────────────
    const finalPageCount = pageCount;
    for (let i = 1; i <= finalPageCount; i++) {
      doc.setPage(i);
      const pageH = doc.internal.pageSize.height;

      if (withLetterpad) {
        // Redraw footer image on EVERY page to cover any content overflow
        doc.addImage(
          FooterImage,
          "PNG",
          0,
          pageH - footerHeight,
          doc.internal.pageSize.width,
          footerHeight,
        );
      }

      // Draw page number ABOVE the footer (not inside it)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${finalPageCount}`,
        leftMargin + contentWidth / 2,
        pageH - footerHeight - 3, // sits just above footer
        { align: "center" },
      );
      doc.setTextColor(0, 0, 0);
    }

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (err) {
    console.error("Print error:", err);
    toast.error("An unexpected error occurred while generating the PDF.");
  }
};

// ─── Preview Modal ────────────────────────────────────────────────────────────

const Modal = ({ row, onClose }) => {
  const report = row.report;
  const sections = useMemo(
    () =>
      buildSectionsFromValueDetails(
        report?.valuedetails,
        report?._titleMap,
        row.radiology_format?.format_titles, // ← add this
      ),
    [report, row.radiology_format],
  );
  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🏥</ModalIcon>
          <ModalTitle>USG Report Preview</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <ApprovalBadge approved={report?.is_approved}>
            {report?.is_approved ? "✓ Approved" : "⏱ Pending Approval"}
          </ApprovalBadge>
          <InfoBanner>
            <InfoChip>
              <InfoChipLabel>Bill No</InfoChipLabel>
              <InfoChipValue>{row.investBillNo}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Patient</InfoChipLabel>
              <InfoChipValue>{row.patientName}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>UHID</InfoChipLabel>
              <InfoChipValue>{row.uhid}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>IP Number</InfoChipLabel>
              <InfoChipValue>{row.ipNumber || "—"}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Age / Gender</InfoChipLabel>
              <InfoChipValue>
                {row.age} {row.age_type} / {row.gender || "N/A"}
              </InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Referred By</InfoChipLabel>
              <InfoChipValue>{row.referredBy || "—"}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Report Date</InfoChipLabel>
              <InfoChipValue>
                {report?.date ? formatDate(report.date) : "N/A"}
              </InfoChipValue>
            </InfoChip>
            {report?.slot_DateTime && (
              <InfoChip>
                <InfoChipLabel>Slot</InfoChipLabel>
                <InfoChipValue>
                  {formatSlotDisplay(report.slot_DateTime)}
                </InfoChipValue>
              </InfoChip>
            )}
            {report?.valuedetails?.device_id?.length > 0 && (
              <InfoChip>
                <InfoChipLabel>Device</InfoChipLabel>
                <InfoChipValue>
                  {report.valuedetails.device_id.join(", ")}
                </InfoChipValue>
              </InfoChip>
            )}
          </InfoBanner>
          {isANCRow(row) && <ANCDisplayBlock row={row} />}
          {sections.length > 0 && (
            <>
              <SectionsHeader>
                <SectionsTitle>Scan Findings</SectionsTitle>
              </SectionsHeader>
              {sections.map((section, idx) => (
                <PreviewSectionItem
                  key={`${section.title_id}-${idx}`}
                  section={section}
                  index={idx}
                />
              ))}
            </>
          )}
          <ImpressionBox>
            <ImpressionTitle>Final Impression / Findings</ImpressionTitle>
            <ImpressionText
              dangerouslySetInnerHTML={{
                __html:
                  report?.impression ||
                  "<em style='color:#bbb'>No impression recorded.</em>",
              }}
            />
          </ImpressionBox>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#00897b,#00695c)"
            color="white"
            onClick={onClose}
          >
            Close
          </ModalActionButton>
        </ModalFooter>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ row, onClose, onSave }) => {
  const report = row.report;
  const [sections, setSections] = useState(() =>
    buildSectionsFromValueDetails(
      report?.valuedetails,
      report?._titleMap,
      row.radiology_format?.format_titles, // ← add this
    ),
  );
  const [impression, setImpression] = useState(report?.impression || "");
  const [saving, setSaving] = useState(false);
  const [editAncFields, setEditAncFields] = useState(
    () =>
      row.report?.valuedetails?.anc_fields || {
        guh: "",
        lmp: "",
        ga_lmp: "",
        ga_usg: "",
        edd_usg: "",
      },
  );

  const handleSectionChange = (index, value, isTableUpdate = false) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleCompileImpression = () => {
    const compiled = sections
      .filter((s) => {
        if (s.isTable) return false;
        return stripHTML(s.value);
      })
      .map((s) => `<b>${s.title}:</b>\n${s.value.trim()}`)
      .join("\n\n");
    if (compiled) setImpression(compiled);
    toast.info("Sections compiled into impression ✓");
  };

  const handleSave = async () => {
    if (!stripHTML(impression)) {
      toast.error("Impression cannot be empty.");
      return;
    }
    setSaving(true);
    const apiSections = sections.map((s) => ({
      title_id: s.title_id,
      value: s.isTable ? s.value : s.value,
      isTable: s.isTable,
    }));
    await onSave(impression, apiSections, isANCRow(row) ? editAncFields : null);
    setSaving(false);
  };

  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>✏️</ModalIcon>
          <ModalTitle>Edit Report</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoBanner>
            <InfoChip>
              <InfoChipLabel>Bill No</InfoChipLabel>
              <InfoChipValue>{row.investBillNo}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Patient</InfoChipLabel>
              <InfoChipValue>{row.patientName}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>UHID</InfoChipLabel>
              <InfoChipValue>{row.uhid}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Age / Gender</InfoChipLabel>
              <InfoChipValue>
                {row.age} {row.age_type}/ {row.gender || "N/A"}
              </InfoChipValue>
            </InfoChip>
          </InfoBanner>
          {isANCRow(row) && (
            <ANCEditBlock
              row={row}
              ancFields={editAncFields}
              onChange={setEditAncFields}
            />
          )}
          {sections.length > 0 && (
            <>
              <SectionsHeader>
                <SectionsTitle>Scan Findings</SectionsTitle>
                <SmallBtn
                  type="button"
                  bg="linear-gradient(135deg,#00897b,#00695c)"
                  color="white"
                  onClick={handleCompileImpression}
                >
                  ↓ Compile to Impression
                </SmallBtn>
              </SectionsHeader>
              {sections.map((section, idx) => (
                <EditSectionItem
                  key={`${section.title_id}-${idx}`}
                  section={section}
                  index={idx}
                  onChange={handleSectionChange}
                />
              ))}
            </>
          )}
          <EditImpressionSection>
            <EditImpressionTitle>
              Final Impression / Findings
            </EditImpressionTitle>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {sections.some((s) => !s.isTable) && (
                <SmallBtn
                  type="button"
                  bg="linear-gradient(135deg,#00897b,#00695c)"
                  color="white"
                  onClick={handleCompileImpression}
                >
                  ↓ Compile from Sections
                </SmallBtn>
              )}
              <SmallBtn
                type="button"
                bg="#f5f5f5"
                color="#888"
                onClick={() => setImpression("")}
              >
                ✕ Clear
              </SmallBtn>
            </div>
            <ImpressionRichEditor
              value={impression}
              onChange={setImpression}
              placeholder="Enter impression / findings…"
            />
          </EditImpressionSection>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#66bb6a,#43a047)"
            color="white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "✓ Save Changes"}
          </ModalActionButton>
          <ModalActionButton
            bg="linear-gradient(135deg,#757575,#616161)"
            color="white"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </ModalActionButton>
        </ModalFooter>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Slot Modal ───────────────────────────────────────────────────────────────

const SlotModal = ({ row, onClose, onSaved, HMSURL, activeBillTypeNo }) => {
  const recordExists = !!row.report;

  const initSlotDate = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toISOString().slice(0, 10);
      } catch { }
    }
    return getToday();
  };
  const initSlotTime = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toTimeString().slice(0, 5);
      } catch { }
    }
    return new Date().toTimeString().slice(0, 5);
  };

  const [slotDate, setSlotDate] = useState(initSlotDate);
  const [slotTime, setSlotTime] = useState(initSlotTime);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!slotDate || !slotTime) {
      toast.error("Please select both slot date and time.");
      return;
    }
    if (!row.item_id) {
      toast.error("Item ID is missing. Please refresh and try again.");
      return;
    }
    const slotDateTime = `${slotDate}T${slotTime}:00`;
    setSaving(true);
    try {
      const encodedBill = encodeURIComponent(row.investBillNo);
      const encodedItem = encodeURIComponent(row.item_id);
      let result;
      if (!recordExists) {
        result = await apiRequest(`${HMSURL}scan-reports/`, "POST", {
          investBillNo: row.investBillNo,
          investBillDate: row.investBillDate,
          billTypeNo: activeBillTypeNo,
          itemName: row.itemName,
          item_id: row.item_id,
          slot_DateTime: slotDateTime,
          impression: "",
        });
        if (!result.success) {
          toast.error(result.error || "Failed to create slot");
          return;
        }
        toast.success("Slot scheduled! ✓");
      } else {
        result = await apiRequest(
          `${HMSURL}scan-reports/slot/${encodedBill}/${encodedItem}/`,
          "PATCH",
          { slot_DateTime: slotDateTime },
        );
        if (!result.success) {
          toast.error(result.error || "Failed to update slot");
          return;
        }
        toast.success("Slot updated! ✓");
      }
      onSaved({
        investBillNo: row.investBillNo,
        itemName: row.itemName,
        item_id: row.item_id,
        slot_DateTime: slotDateTime,
        wasCreated: !recordExists,
      });
      onClose();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlotModalOverlay onClick={onClose}>
      <SlotModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🕐</ModalIcon>
          <ModalTitle>
            {row.report?.slot_DateTime ? "Update Slot" : "Schedule Slot"}
          </ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <SlotInfoRow>
            <SlotInfoLabel>Patient</SlotInfoLabel>
            <SlotInfoValue>{row.patientName}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>Bill No</SlotInfoLabel>
            <SlotInfoValue>{row.investBillNo}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>IP Number</SlotInfoLabel>
            <SlotInfoValue>{row.ipNumber || "—"}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>Item</SlotInfoLabel>
            <SlotInfoValue>{row.itemName || "—"}</SlotInfoValue>
          </SlotInfoRow>
          <div style={{ marginTop: "1.75rem" }}>
            <SlotSectionTitle>📅 Slot Date &amp; Time</SlotSectionTitle>
            <SlotFormGroup>
              <SlotLabel>📅 Slot Date</SlotLabel>
              <SlotInput
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </SlotFormGroup>
            <SlotFormGroup>
              <SlotLabel>⏰ Slot Time</SlotLabel>
              <SlotInput
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              />
            </SlotFormGroup>
            <SlotDivider />
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#7c4dff,#651fff)"
            color="white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : row.report?.slot_DateTime
                ? "Update Slot"
                : "Schedule & Create"}
          </ModalActionButton>
          <ModalActionButton
            bg="linear-gradient(135deg,#757575,#616161)"
            color="white"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </ModalActionButton>
        </ModalFooter>
      </SlotModalContent>
    </SlotModalOverlay>
  );
};

// ─── DICOM OHIF Viewer Modal ──────────────────────────────────────────────────

const DicomModalOverlay = styled(ModalOverlay)`
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
`;

const DicomModalContent = styled.div`
  background: #0f172a;
  color: #f8fafc;
  border-radius: 14px;
  width: 98vw;
  max-width: 1550px;
  height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  border: 1px solid #334155;
`;

const DicomModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const DicomModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #38bdf8;
`;

const DicomPatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.82rem;
  color: #94a3b8;
  flex-wrap: wrap;
`;

const DicomInfoBadge = styled.span`
  background: #334155;
  color: #f1f5f9;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DicomModalBody = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
`;

const DicomIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const DicomModal = ({ row, viewerUrl, onClose }) => {
  if (!viewerUrl) return null;
  return (
    <DicomModalOverlay onClick={onClose}>
      <DicomModalContent onClick={(e) => e.stopPropagation()}>
        <DicomModalHeader>
          <DicomModalTitle>
            <span>🩻</span>
            <span>OHIF DICOM Medical Viewer</span>
          </DicomModalTitle>
          <DicomPatientInfo>
            <span>👤 <strong style={{ color: "#f8fafc" }}>{row?.patientName || "Unknown"}</strong></span>
            <DicomInfoBadge>UHID: {row?.uhid || "—"}</DicomInfoBadge>
            <DicomInfoBadge>Bill: {row?.investBillNo || "—"}</DicomInfoBadge>
            {row?.itemName && <DicomInfoBadge>{row.itemName}</DicomInfoBadge>}
          </DicomPatientInfo>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.35rem 0.75rem",
                background: "#0284c7",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              ↗️ Open in New Tab
            </a>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "1.3rem",
                cursor: "pointer",
                padding: "0 0.4rem",
              }}
            >
              ✕
            </button>
          </div>
        </DicomModalHeader>
        <DicomModalBody>
          <DicomIframe
            src={viewerUrl}
            title="OHIF DICOM Viewer"
            allow="fullscreen"
          />
        </DicomModalBody>
      </DicomModalContent>
    </DicomModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RDList = ({ investBillNo: investBillNoFilter }) => {
  useLiveTime();
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotRow, setSlotRow] = useState(null);
  const [dicomModalOpen, setDicomModalOpen] = useState(false);
  const [dicomViewerUrl, setDicomViewerUrl] = useState("");
  const [dicomLoading, setDicomLoading] = useState(false);
  const [dicomRow, setDicomRow] = useState(null);
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [activePrintRowId, setActivePrintRowId] = useState(null);
  const [printDropdownPos, setPrintDropdownPos] = useState({ top: 0, left: 0 });

  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);
  const [selectedBillType, setSelectedBillType] = useState(
    () => localStorage.getItem("rdlist_billType") || "USG01",
  );

  const [searchBillNo, setSearchBillNo] = useState("");
  const [searchUhid, setSearchUhid] = useState("");
  const [searchPatientType, setSearchPatientType] = useState("");
  const [searchIpNumber, setSearchIpNumber] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchReferredBy, setSearchReferredBy] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [searchScanType, setSearchScanType] = useState("");
  const [searchCustomerType, setSearchCustomerType] = useState("");
  const [billTypes, setBillTypes] = useState([]);

  const [searchSlotStatus, setSearchSlotStatus] = useState("");

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-API-RDE-RW");
  const canApprove = allowedActions.includes("HMS-API-RDA-RW");
  const canDelete = allowedActions.includes("HMS-API-RDD-RW");

  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const result = await apiRequest(`${HMSURL}hard-bill-types/`, "GET");
        if (result.success && Array.isArray(result.data)) {
          setBillTypes(result.data);
          const saved = localStorage.getItem("rdlist_billType");
          if (!saved && result.data.length > 0) {
            setSelectedBillType(result.data[0].value);
          }
        }
      } catch {
        toast.error("Failed to load bill types");
      }
    };
    fetchBillTypes();
  }, [HMSURL]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        billTypeNo: selectedBillType,
        from_date: fromDate,
        to_date: toDate,
      });
      if (investBillNoFilter) params.append("investBillNo", investBillNoFilter);
      const result = await apiRequest(
        `${HMSURL}investigations/?${params.toString()}`,
        "GET",
      );
      if (!result.success) {
        toast.error(result.error || "Failed to fetch data");
        return;
      }
      const merged = (result.data || []).map((row) => ({
        ...row,
        investBillNo: row.investBillNo,
        uhid: row.uhid,
        ipNumber: row.ipNumber,
        investBillDate: row.investBillDate,
        item_id: row.item_id ?? "",
        itemName: row.itemName || "",
        paymentMethod: row.paymentMethod || "Cash",
        paymentStatus: row.paymentStatus || "",
        total: row.total,
        finalPrice: row.finalPrice,
        customer_type: row.customer_type || row.customerType || "General",
        customerType: row.customer_type || row.customerType || "General",
        company_code: row.company_code || "",
        company_name: row.company_name || row.insurance_company || "",
        insurance_company: row.company_name || row.insurance_company || "",
        billTypeNo: selectedBillType,
        patientName:
          `${row.salutation || ""} ${row.firstName || ""} ${row.middleName ? row.middleName + " " : ""}${row.lastName || ""}`.trim(),
        age: row.age,
        age_type: row.age_type,
        gender: row.gender,
        address: row.address || "",
        patientType:
          row.ipNumber &&
            String(row.ipNumber).trim() !== "" &&
            String(row.ipNumber).trim() !== "—" &&
            String(row.ipNumber).trim().toLowerCase() !== "na"
            ? "IP"
            : (row.patientType || row.patient_type || "").toUpperCase() === "IP"
              ? "IP"
              : "OP",
        referredBy: row.referredBy || "",
        referredByName: row.referredByName || "",
        report: row.report || null,
        hasReport: !!row.hasReport,
        radiology_type: (row.radiology_format?.type || "").toUpperCase(),
        scan_type: (row.scan_type || "").toUpperCase(),
        tat_info: row.tat_info || null,
        radiology_format: row.radiology_format || null,
      }));
      setRows(merged);
    } catch {
      toast.error("An unexpected error occurred");
    }
  }, [HMSURL, selectedBillType, investBillNoFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchFormatAndBuildSections = async (row, HMSURL) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/format/?billTypeNo=${encodeURIComponent(row.billTypeNo)}&test_id=${encodeURIComponent(row.item_id)}&gender=${encodeURIComponent(row.gender)}`,
        "GET",
      );
      if (result.success && result.data?.format) {
        const titleMap = {};
        result.data.format.forEach((f) => {
          if (f.title_id) titleMap[f.title_id] = f.title;
        });
        return {
          titleMap,
          pnaDetails: result.data.pna_details || [],
          desclaimer: result.data.desclaimer || [],
          department: result.data.department || "",
          heading: result.data.heading || "",
          sub_heading: result.data.sub_heading || "",
        };
      }
    } catch (e) {
      console.warn("Could not fetch format titles:", e);
    }
    return null;
  };

  const handleOpenPrint = () => {
    navigate("/RDPrint", {
      state: {
        rows: filteredRows,
        fromDate,
        toDate,
        billTypeLabel:
          billTypes.find((b) => b.value === selectedBillType)?.label ||
          selectedBillType,
      },
    });
  };
  const buildTitleMapFromRow = (row) => {
    const rf = row.radiology_format || {};
    const titleMap = {};
    (rf.format_titles || []).forEach((f) => {
      if (f.title_id) titleMap[f.title_id] = f.title;
    });
    return {
      titleMap: Object.keys(titleMap).length ? titleMap : null,
      pnaDetails: rf.pna_details || [],
      desclaimer: rf.desclaimer || [],
      department: rf.department || "",
      heading: rf.heading || "",
      sub_heading: rf.sub_heading || "",
    };
  };

  const handlePrintWithTitleMap = useCallback((row, withLetterpad) => {
    const formatData = buildTitleMapFromRow(row);
    handlePrintReport(
      {
        ...row,
        _titleMap: formatData.titleMap,
        _pnaDetails: formatData.pnaDetails,
        _desclaimer: formatData.desclaimer,
        department: formatData.department,
        heading: formatData.heading,
        sub_heading: formatData.sub_heading,
      },
      withLetterpad,
    );
  }, []);

  // ── Filters ────────────────────────────────────────────────────────────────

  const handleResetFilter = () => {
    setFromDate(getToday());
    setToDate(getToday());
    const defaultType = billTypes[0]?.value || "";
    setSelectedBillType(defaultType);
    localStorage.setItem("rdlist_billType", defaultType);
    setSearchBillNo("");
    setSearchUhid("");
    setSearchPatientType("");
    setSearchIpNumber("");
    setSearchPatient("");
    setSearchPaymentStatus("");
    setSearchPaymentMethod("");
    setSearchStatus("");
    setSearchReferredBy("");
    setSearchScanType("");
    setSearchCustomerType("");
  };

  const customerTypeOptions = useMemo(() => {
    const types = rows
      .map((r) => r.customer_type || r.customerType || "General")
      .filter(Boolean);
    return [...new Set(types)].sort();
  }, [rows]);

  const scanTypeOptions = useMemo(() => {

    const types = rows.map((r) => r.scan_type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [rows]);

  const paymentMethodOptions = useMemo(() => {
    const methods = rows.map((r) => r.paymentMethod).filter(Boolean);
    return [...new Set(methods)].sort();
  }, [rows]);

  const referredByOptions = useMemo(() => {
    const names = rows.map((r) => r.referredByName).filter(Boolean);
    return [...new Set(names)].sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusLabel = !row.hasReport
        ? "pending"
        : row.report?.is_Dispatched
          ? "dispatched"
          : row.report?.is_approved
            ? "approved"
            : "reported";
      const patientType =
        row.patientType ||
        (row.ipNumber &&
          String(row.ipNumber).trim() !== "" &&
          String(row.ipNumber).trim() !== "—" &&
          String(row.ipNumber).trim().toLowerCase() !== "na"
          ? "IP"
          : "OP");

      return (
        (!searchBillNo ||
          (row.investBillNo || "")
            .toLowerCase()
            .includes(searchBillNo.toLowerCase())) &&
        (!searchUhid ||
          (row.uhid || "").toLowerCase().includes(searchUhid.toLowerCase())) &&
        (!searchPatientType || patientType === searchPatientType) &&
        (!searchIpNumber ||
          (row.ipNumber || "")
            .toLowerCase()
            .includes(searchIpNumber.toLowerCase())) &&
        (!searchPatient ||
          (row.patientName || "")
            .toLowerCase()
            .includes(searchPatient.toLowerCase())) &&
        (!searchStatus || statusLabel === searchStatus) &&
        (!searchPaymentStatus || row.paymentStatus === searchPaymentStatus) &&
        (!searchPaymentMethod || row.paymentMethod === searchPaymentMethod) &&
        (!searchCustomerType ||
          (row.customer_type || row.customerType || "General") ===
          searchCustomerType) &&
        (!searchScanType || (row.scan_type || "") === searchScanType) &&
        (!searchSlotStatus ||

          (() => {
            const s = row.tat_info?.slot_info?.status;
            return searchSlotStatus === "no_slot"
              ? !row.report?.slot_DateTime
              : s === searchSlotStatus;
          })()) &&
        (!searchReferredBy || row.referredByName === searchReferredBy)
      );
    });
  }, [
    rows,
    searchBillNo,
    searchUhid,
    searchPatientType,
    searchIpNumber,
    searchPatient,
    searchStatus,
    searchReferredBy,
    searchPaymentStatus,
    searchPaymentMethod,
    searchCustomerType,
    searchScanType,
    searchSlotStatus,
  ]);

  // ── Print dropdown ─────────────────────────────────────────────────────────

  const showPrintDropdown = (row, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrintDropdownPos({ top: rect.bottom - 2, left: rect.right - 200 });
    setActivePrintRowId(`${row.investBillNo}__${row.item_id}`);
  };
  const hidePrintDropdown = () => {
    setActivePrintRowId(null);
  };
  const activePrintRow = useMemo(
    () =>
      rows.find(
        (r) => `${r.investBillNo}__${r.item_id}` === activePrintRowId,
      ) || null,
    [rows, activePrintRowId],
  );

  // ── Action Handlers ────────────────────────────────────────────────────────

  const handleGoToReport = (row) => {
    const uhidFull = row.uhid || "";
    const parts = uhidFull.split("/");
    const uhidBase = parts[0] || "na";
    const subUhid = parts[1] || "na";
    navigate(`/RDReportForm/${uhidBase}/${subUhid}`, {
      state: {
        uhid: uhidFull,
        subUhid: "",
        itemName: row.itemName,
        item_id: row.item_id,
        ipNumber: row.ipNumber,
        investBillNo: row.investBillNo,
        billTypeNo: row.billTypeNo || selectedBillType,
        salutation: row.salutation || "",
        firstName: row.firstName || "",
        middleName: row.middleName || "",
        lastName: row.lastName || "",
        age: row.age,
        age_type: row.age_type,
        gender: row.gender,
        investBillDate: row.investBillDate,
        referredBy: row.referredBy || "",
      },
    });
  };

  const handlePatientCheckIn = async (row) => {
    const alreadyIn = !!row.report?.patientIn_DateTime;
    const patientIn_DateTime = alreadyIn ? null : new Date().toISOString();
    try {
      if (!row.report) {
        const result = await apiRequest(
          `${HMSURL}scan-reports/checkin/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
          "PATCH",
          {
            patientIn_DateTime,
            investBillDate: row.investBillDate,
            itemName: row.itemName,
            billTypeNo: row.billTypeNo || selectedBillType,
          },
        );
        if (!result.success) {
          toast.error(result.error || "Failed to check in");
          return;
        }
        toast.success(
          alreadyIn ? "Check-in cleared." : "Patient checked in! ✓",
        );
        setRows((prev) =>
          prev.map((r) =>
            r.investBillNo === row.investBillNo && r.item_id === row.item_id
              ? {
                ...r,
                tat_info: result.data?.tat_info ?? r.tat_info,
                report: { ...(r.report || {}), ...result.data },
              }
              : r,
          ),
        );
      } else {
        const result = await apiRequest(
          `${HMSURL}scan-reports/checkin/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
          "PATCH",
          { patientIn_DateTime },
        );
        if (!result.success) {
          toast.error(result.error || "Failed to check in");
          return;
        }
        toast.success(
          alreadyIn ? "Check-in cleared." : "Patient checked in! ✓",
        );
        setRows((prev) =>
          prev.map((r) =>
            r.investBillNo === row.investBillNo && r.item_id === row.item_id
              ? {
                ...r,
                tat_info: result.data?.tat_info ?? r.tat_info,
                report: { ...r.report, ...result.data },
              }
              : r,
          ),
        );
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleScanStarted = async (row) => {
    const alreadyStarted = !!row.report?.scan_started_DateTime;
    const scan_started_DateTime = alreadyStarted
      ? null
      : new Date().toISOString();
    try {
      if (!row.report) {
        const result = await apiRequest(
          `${HMSURL}scan-reports/scan-started/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
          "PATCH",
          {
            scan_started_DateTime,
            investBillDate: row.investBillDate,
            itemName: row.itemName,
            billTypeNo: row.billTypeNo || selectedBillType,
          },
        );
        if (!result.success) {
          toast.error(result.error || "Failed to mark scan start");
          return;
        }
        toast.success(
          alreadyStarted ? "Scan start cleared." : "Scan started! 🔬",
        );
        setRows((prev) =>
          prev.map((r) =>
            r.investBillNo === row.investBillNo && r.item_id === row.item_id
              ? {
                ...r,
                tat_info: result.data?.tat_info ?? r.tat_info,
                report: { ...(r.report || {}), ...result.data },
              }
              : r,
          ),
        );
      } else {
        const result = await apiRequest(
          `${HMSURL}scan-reports/scan-started/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
          "PATCH",
          { scan_started_DateTime },
        );
        if (!result.success) {
          toast.error(result.error || "Failed to update scan start");
          return;
        }
        toast.success(
          alreadyStarted ? "Scan start cleared." : "Scan started! 🔬",
        );
        setRows((prev) =>
          prev.map((r) =>
            r.investBillNo === row.investBillNo && r.item_id === row.item_id
              ? {
                ...r,
                tat_info: result.data?.tat_info ?? r.tat_info,
                report: { ...r.report, ...result.data },
              }
              : r,
          ),
        );
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDispatch = async (row) => {
    if (!row.report?.is_approved) {
      toast.warning("Only approved reports can be dispatched.");
      return;
    }
    if (row.report?.is_Dispatched) {
      toast.info("Already dispatched.");
      return;
    }
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/dispatch/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
        "PATCH",
        {},
      );
      if (!result.success) {
        toast.error(result.error || "Dispatch failed");
        return;
      }
      toast.success("Report dispatched! 📤");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.item_id === row.item_id
            ? {
              ...r,
              tat_info: result.data?.tat_info ?? r.tat_info,
              report: {
                ...r.report,
                is_Dispatched: true,
                dispatch_DateTime:
                  result.data?.dispatch_DateTime || new Date().toISOString(),
              },
            }
            : r,
        ),
      );
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleOpenSlot = (row) => {
    setSlotRow(row);
    setIsSlotModalOpen(true);
  };

  const handleSlotSaved = ({
    investBillNo,
    itemName,
    item_id,
    slot_DateTime,
    wasCreated,
  }) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.investBillNo !== investBillNo || r.item_id !== item_id) return r;
        const updatedReport = wasCreated
          ? {
            slot_DateTime,
            impression: "",
            is_approved: false,
            is_active: true,
            has_report: false,
          }
          : { ...r.report, slot_DateTime };
        return { ...r, report: updatedReport };
      }),
    );
  };

  const handlePreview = (row) => {
    const formatData = buildTitleMapFromRow(row);
    setSelectedRow({
      ...row,
      report: row.report
        ? { ...row.report, _titleMap: formatData.titleMap }
        : row.report,
    });
    setIsModalOpen(true);
  };

  const handleViewDicom = async (row) => {
    setDicomLoading(true);
    try {
      const result = await apiRequest(
        `${HMSURL}radiology/dicom-study/?investBillNo=${encodeURIComponent(row.investBillNo || "")}`,
        "GET",
      );
      const resData = result?.data || result || {};
      const viewerUrl = resData.viewerUrl || result?.viewerUrl;
      const isSuccess = resData.success ?? result?.success;

      if (isSuccess && viewerUrl) {
        setDicomViewerUrl(viewerUrl);
        setDicomRow(row);
        setDicomModalOpen(true);
      } else {
        toast.info(
          resData.message ||
          result?.message ||
          "No DICOM studies found in Orthanc for this investigation.",
        );
      }
    } catch {
      toast.error("Failed to connect to DICOM PACS service");
    } finally {
      setDicomLoading(false);
    }
  };

  const handleEdit = (row) => {
    const formatData = buildTitleMapFromRow(row);
    setEditingRow({
      ...row,
      report: row.report
        ? { ...row.report, _titleMap: formatData.titleMap }
        : row.report,
    });
    setIsEditModalOpen(true);
  };

  const handleApprove = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/approve/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report approved successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.item_id === row.item_id
            ? {
              ...r,
              report: {
                ...r.report,
                is_approved: true,
                approved_by:
                  result.data?.approved_by ?? r.report?.approved_by,
                approved_date:
                  result.data?.approved_date ?? r.report?.approved_date,
              },
            }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while approving. Please try again.");
    }
  };

  const handleSaveEdit = async (newImpression, newSections, newAncFields) => {
    try {
      const apiSections = newSections.map((s) => {
        if (s.isTable) {
          const { table_name, title, ...rowData } = s.value;
          return rowData;
        }
        return {
          title_id: s.title_id,
          title_value: s.value,
        };
      });
      const result = await apiRequest(
        `${HMSURL}scan-reports/edit/${encodeURIComponent(editingRow.investBillNo)}/${encodeURIComponent(editingRow.item_id)}/`,
        "PATCH",
        {
          impression: newImpression,
          sections: apiSections,
          ...(newAncFields && { anc_fields: newAncFields }),
        },
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report updated successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === editingRow.investBillNo &&
            r.item_id === editingRow.item_id
            ? {
              ...r,
              report: {
                ...r.report,
                impression: newImpression,
                valuedetails: {
                  ...r.report?.valuedetails,
                  value: apiSections,
                  ...(newAncFields && { anc_fields: newAncFields }),
                },
              },
            }
            : r,
        ),
      );
      setIsEditModalOpen(false);
      setEditingRow(null);
    } catch {
      toast.error("An error occurred while updating. Please try again.");
    }
  };

  const handleDelete = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/delete/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.item_id)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report deleted successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.item_id === row.item_id
            ? { ...r, report: null, hasReport: false }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while deleting. Please try again.");
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => !r.hasReport).length;
    const reported = rows.filter(
      (r) => r.hasReport && !r.report?.is_approved,
    ).length;
    const approved = rows.filter((r) => r.report?.is_approved).length;
    const dispatched = rows.filter(
      (r) => r.report?.is_Dispatched || r.report?.dispatch_DateTime,
    ).length;
    return { total, pending, reported, approved, dispatched };
  }, [rows]);

  const pageLabel =
    billTypes.find((b) => b.value === selectedBillType)?.label || "Radiology";

  const formatTATDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "—";
    const total = Math.abs(Math.round(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getLiveTAT = (row) => {
    const tat = row.tat_info;
    if (!tat || tat.status === "unknown") return tat;
    if (tat.status === "completed" || tat.status === "completed_late")
      return tat;
    if (!row.report?.patientIn_DateTime)
      return { ...tat, status: "waiting", label: "Awaiting check-in" };
    if (!row.report?.scan_started_DateTime)
      return { ...tat, status: "waiting", label: "Awaiting scan start" };

    const startTime = new Date(row.report.scan_started_DateTime).getTime();
    const nowTime = Date.now();
    const elapsed_seconds = Math.floor((nowTime - startTime) / 1000);
    const tat_seconds = tat.tat_seconds || 0;
    const remaining = tat_seconds - elapsed_seconds;

    const fmtDuration = (s) => {
      const abs = Math.abs(Math.round(s));
      const h = Math.floor(abs / 3600);
      const m = Math.floor((abs % 3600) / 60);
      const sec = abs % 60;
      const parts = [];
      if (h) parts.push(`${h}h`);
      if (m || h) parts.push(`${m}m`);
      parts.push(`${sec}s`);
      return parts.join(" ");
    };

    const status = remaining > 0 ? "on_track" : "overdue";
    const label =
      status === "on_track"
        ? `${fmtDuration(remaining)} left`
        : `Overdue by ${fmtDuration(-remaining)}`;
    return { ...tat, elapsed_seconds, status, label };
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return "";
    try {
      const timePart = isoString.split("T")[1];
      if (!timePart) return "";
      const timeOnly = timePart.split("+")[0].split("-")[0];
      const [hour, minute, second] = timeOnly.split(":");
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? "pm" : "am";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const sec = second ? second.split(".")[0] : "00";
      return `${String(h12).padStart(2, "0")}:${minute}:${sec} ${ampm}`;
    } catch {
      return "";
    }
  };

  const isPaymentAllowed = (paymentMethod, paymentStatus) => {
    const method = (paymentMethod || "").trim().toLowerCase();
    const status = (paymentStatus || "").trim().toLowerCase();
    if (method === "credit") return true;
    return status === "paid";
  };

  const PatientInCell = ({ row, handlePatientCheckIn }) => {
    const checkedIn = !!row.report?.patientIn_DateTime;
    const scanStarted = !!row.report?.scan_started_DateTime;
    const paymentPending = !isPaymentAllowed(row.paymentMethod, row.paymentStatus);
    const isApproved = !!row.report?.is_approved;

    if (isApproved && checkedIn) {
      return (
        <Td>
          <WfLockedPill
            bg="#f1f8e9"
            borderColor="#c5e1a5"
            color="#558b2f"
            iconBg="#558b2f"
          >
            <WfIcon bg="#558b2f">✓</WfIcon>
            Arrived
            <WfTime>{formatTimeOnly(row.report.patientIn_DateTime)}</WfTime>
          </WfLockedPill>
        </Td>
      );
    }
    if (checkedIn) {
      return (
        <Td>
          <WfCheckedInBtn
            onClick={() => handlePatientCheckIn(row)}
            disabled={scanStarted}
            title={
              scanStarted
                ? "Locked — scan already started"
                : "Click to undo check-in"
            }
          >
            <WfIcon bg="#558b2f">✓</WfIcon>
            Arrived
            <WfTime>{formatTimeOnly(row.report.patientIn_DateTime)}</WfTime>
          </WfCheckedInBtn>
        </Td>
      );
    }
    return (
      <Td>
        <WfIdleBtn
          onClick={() => handlePatientCheckIn(row)}
          disabled={paymentPending}
          title={paymentPending ? "Payment pending" : "Mark patient as arrived"}
        >
          <WfIcon>☐</WfIcon>
          Check in
        </WfIdleBtn>
      </Td>
    );
  };

  const ScanStartedCell = ({ row, handleScanStarted }) => {
    const scanStarted = !!row.report?.scan_started_DateTime;
    const checkedIn = !!row.report?.patientIn_DateTime;
    const isApproved = !!row.report?.is_approved;

    if (isApproved && scanStarted) {
      return (
        <Td>
          <WfLockedPill
            bg="#fff8e1"
            borderColor="#ffe082"
            color="#e65100"
            iconBg="#f57c00"
          >
            <WfIcon bg="#f57c00">🔬</WfIcon>
            Scanned
            <WfTime>{formatTimeOnly(row.report.scan_started_DateTime)}</WfTime>
          </WfLockedPill>
        </Td>
      );
    }
    if (scanStarted) {
      return (
        <Td>
          <WfScanActiveBtn
            onClick={() => handleScanStarted(row)}
            disabled={
              !checkedIn || (row.hasReport && row.report?.impression?.trim())
            }
            title={
              !checkedIn
                ? "Check in patient first"
                : row.hasReport && row.report?.impression?.trim()
                  ? "Report already submitted"
                  : "Click to clear scan start"
            }
          >
            <WfIcon bg="#f57c00">🔬</WfIcon>
            Scanning
            <WfTime>{formatTimeOnly(row.report.scan_started_DateTime)}</WfTime>
          </WfScanActiveBtn>
        </Td>
      );
    }
    return (
      <Td>
        <WfIdleBtn
          onClick={() => handleScanStarted(row)}
          disabled={!checkedIn}
          title={!checkedIn ? "Check in patient first" : "Mark scan as started"}
        >
          <WfIcon>☐</WfIcon>
          Start scan
        </WfIdleBtn>
      </Td>
    );
  };

  const DispatchCell = ({ row, handleDispatch }) => {
    const isApproved = !!row.report?.is_approved;
    const isDispatched = !!row.report?.is_Dispatched;

    if (isDispatched) {
      return (
        <Td>
          <WfDispatchedPill>
            <WfIcon bg="#00796b">✓</WfIcon>
            Dispatched
            <WfTime>{formatTimeOnly(row.report.dispatch_DateTime)}</WfTime>
          </WfDispatchedPill>
        </Td>
      );
    }
    if (isApproved) {
      return (
        <Td>
          <WfDispatchReadyBtn
            onClick={() => handleDispatch(row)}
            title="Dispatch report"
          >
            <WfIcon bg="#1976d2">📤</WfIcon>
            Dispatch
          </WfDispatchReadyBtn>
        </Td>
      );
    }
    return (
      <Td>
        <WfIdleBtn
          disabled
          title={!row.hasReport ? "No report yet" : "Approve report first"}
        >
          <WfIcon>☐</WfIcon>
          Dispatch
        </WfIdleBtn>
      </Td>
    );
  };

  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          <TopBar>
            <PageTitle>{pageLabel} Investigations</PageTitle>
            <FilterContainer>
              <BillTypeWrapper>
                <FilterLabel>Bill Type</FilterLabel>
                <BillTypeSelect
                  value={selectedBillType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBillType(val);
                    localStorage.setItem("rdlist_billType", val);
                    setRows([]);
                    setSearchBillNo("");
                    setSearchStatus("");
                    setSearchReferredBy("");
                  }}
                >
                  {billTypes.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </BillTypeSelect>
              </BillTypeWrapper>
              <FilterGroup>
                <FilterLabel>From</FilterLabel>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>To</FilterLabel>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FilterGroup>
              <ResetButton onClick={handleResetFilter}>↺ Reset</ResetButton>
            </FilterContainer>
            <Button
              onClick={handleOpenPrint}
              style={{
                background: "linear-gradient(135deg,#ff7043,#e64a19)",
                padding: "0.4rem 1rem",
                fontSize: "0.82rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              🖨️ Print
            </Button>
          </TopBar>

          <StatsRow>
            <StatCard bg="#f0faf8" accent="#00897b">
              <StatIcon>📋</StatIcon>
              <StatInfo>
                <StatCount color="#00695c">{stats.total}</StatCount>
                <StatLabel>Total</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e3f2fd" accent="#1e88e5">
              <StatIcon>⏳</StatIcon>
              <StatInfo>
                <StatCount color="#1565c0">{stats.pending}</StatCount>
                <StatLabel>Pending</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#fffde7" accent="#f9a825">
              <StatIcon>⏱</StatIcon>
              <StatInfo>
                <StatCount color="#f57f17">{stats.reported}</StatCount>
                <StatLabel>Reported</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e8f5e9" accent="#43a047">
              <StatIcon>✅</StatIcon>
              <StatInfo>
                <StatCount color="#2e7d32">{stats.approved}</StatCount>
                <StatLabel>Approved</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e0f2f1" accent="#00897b">
              <StatIcon>📤</StatIcon>
              <StatInfo>
                <StatCount color="#004d40">{stats.dispatched}</StatCount>
                <StatLabel>Dispatched</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsRow>

          <ScrollableTableWrapper>
            <StickyTable>
              <thead>
                <tr>
                  <StickyTh sticky stickyLeft={0} style={{ width: "50px", minWidth: "50px", textAlign: "center" }}>Sl.No</StickyTh>
                  <StickyTh sticky stickyLeft={50} style={{ width: "130px", minWidth: "130px" }}>Bill No</StickyTh>
                  <StickyTh sticky stickyLeft={180} style={{ width: "105px", minWidth: "105px" }}>UHID</StickyTh>
                  <StickyTh sticky stickyLeft={285} style={{ width: "75px", minWidth: "75px" }}>IP / OP</StickyTh>
                  <StickyTh sticky stickyLeft={360} style={{ width: "105px", minWidth: "105px" }}>IP Number</StickyTh>
                  <StickyTh sticky stickyLeft={465} stickyShadow style={{ width: "160px", minWidth: "160px" }}>Patient Name</StickyTh>
                  <StickyTh>Age</StickyTh>
                  <StickyTh>Gender</StickyTh>
                  <StickyTh>Customer Type</StickyTh>
                  <StickyTh>Item</StickyTh>
                  <StickyTh>TAT</StickyTh>
                  <StickyTh>Bill Date</StickyTh>
                  <StickyTh>Referred By</StickyTh>
                  <StickyTh>Payment Method</StickyTh>
                  <StickyTh>Payment Status</StickyTh>
                  <StickyTh>Slot</StickyTh>
                  <StickyTh>Patient In</StickyTh>
                  <StickyTh>Scan Started</StickyTh>
                  <StickyTh>Dispatch</StickyTh>
                  <StickyTh>Status</StickyTh>
                  <StickyTh>Actions</StickyTh>
                </tr>
                <tr>
                  <SearchTh sticky stickyLeft={0} style={{ width: "50px", minWidth: "50px" }} />
                  <SearchTh sticky stickyLeft={50} style={{ width: "130px", minWidth: "130px" }}>
                    <SearchInput
                      placeholder="🔍 Bill No"
                      value={searchBillNo}
                      onChange={(e) => setSearchBillNo(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh sticky stickyLeft={180} style={{ width: "105px", minWidth: "105px" }}>
                    <SearchInput
                      placeholder="🔍 UHID"
                      value={searchUhid}
                      onChange={(e) => setSearchUhid(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh sticky stickyLeft={285} style={{ width: "75px", minWidth: "75px" }}>
                    <SearchSelect
                      value={searchPatientType}
                      onChange={(e) => setSearchPatientType(e.target.value)}
                      style={{ width: "100%", minWidth: "60px" }}
                    >
                      <option value="">All</option>
                      <option value="OP">OP</option>
                      <option value="IP">IP</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh sticky stickyLeft={360} style={{ width: "105px", minWidth: "105px" }}>
                    <SearchInput
                      placeholder="🔍 IP No"
                      value={searchIpNumber}
                      onChange={(e) => setSearchIpNumber(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh sticky stickyLeft={465} stickyShadow style={{ width: "160px", minWidth: "160px" }}>
                    <SearchInput
                      placeholder="🔍 Patient"
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh />
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchCustomerType}
                      onChange={(e) => setSearchCustomerType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      {customerTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh>
                    <SearchSelect
                      value={searchScanType}
                      onChange={(e) => setSearchScanType(e.target.value)}
                    >

                      <option value="">All Types</option>
                      {scanTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchReferredBy}
                      onChange={(e) => setSearchReferredBy(e.target.value)}
                    >
                      <option value="">All Doctors</option>
                      <option value="SELF">SELF</option>
                      {referredByOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh>
                    <SearchSelect
                      value={searchPaymentMethod}
                      onChange={(e) => setSearchPaymentMethod(e.target.value)}
                    >
                      <option value="">All Methods</option>
                      {paymentMethodOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh>
                    <SearchSelect
                      value={searchPaymentStatus}
                      onChange={(e) => setSearchPaymentStatus(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="Paid">✅ Paid</option>
                      <option value="Pending">⏳ Pending</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh>
                    <SearchSelect
                      value={searchSlotStatus}
                      onChange={(e) => setSearchSlotStatus(e.target.value)}
                      style={{ width: "auto", minWidth: "max-content" }}
                    >
                      <option value="">All Arrivals</option>
                      <option value="on_time">✅ On Time</option>
                      <option value="late">🔴 Late</option>
                      <option value="not_arrived">⏳ Not Arrived</option>
                      <option value="no_slot">— No Slot</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="reported">⏱ Reported</option>
                      <option value="approved">✓ Approved</option>
                      <option value="dispatched">📤 Dispatched</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <Tr
                      key={`${row.investBillNo}-${row.itemName}-${index}`}
                      style={{
                        backgroundColor: row.hasReport ? "#f1f8f4" : "#ffffff",
                      }}
                    >
                      <StickyTd
                        stickyLeft={0}
                        style={{
                          width: "50px",
                          minWidth: "50px",
                          textAlign: "center",
                          fontWeight: 700,
                          color: "#00897b",
                          fontSize: "0.85rem",
                        }}
                      >
                        {index + 1}
                      </StickyTd>
                      <StickyTd stickyLeft={50} style={{ width: "130px", minWidth: "130px" }}>{row.investBillNo}</StickyTd>
                      <StickyTd stickyLeft={180} style={{ width: "105px", minWidth: "105px" }}>{row.uhid}</StickyTd>
                      <StickyTd stickyLeft={285} style={{ width: "75px", minWidth: "75px" }}>
                        <IpOpBadge type={row.patientType || "OP"}>
                          {row.patientType || "OP"}
                        </IpOpBadge>
                      </StickyTd>
                      <StickyTd stickyLeft={360} style={{ width: "105px", minWidth: "105px" }}>{row.ipNumber || "—"}</StickyTd>
                      <StickyTd stickyLeft={465} stickyShadow style={{ width: "160px", minWidth: "160px", fontWeight: 600 }}>{row.patientName}</StickyTd>
                      <Td>
                        {row.age} {row.age_type}
                      </Td>
                      <Td>{row.gender || "N/A"}</Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                            alignItems: "flex-start",
                          }}
                        >
                          <CustomerTypeBadge
                            type={row.customer_type || row.customerType || "General"}
                          >
                            {row.customer_type || row.customerType || "General"}
                          </CustomerTypeBadge>
                          {(((row.customer_type || row.customerType || "")
                            .toUpperCase()
                            .includes("INSURANCE") ||
                            row.company_name) &&
                            row.company_name) && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#92400e",
                                  lineHeight: "1.2",
                                  maxWidth: "140px",
                                  wordBreak: "break-word",
                                }}
                              >
                                🏢 {row.company_name}
                              </span>
                            )}
                        </div>
                      </Td>
                      <Td>
                        <span>{row.itemName || "—"}</span>
                        {row.scan_type && (
                          <ScanTypeBadge type={row.scan_type}>
                            {row.scan_type}
                          </ScanTypeBadge>
                        )}
                      </Td>
                      <Td>
                        {(() => {
                          const liveTat = getLiveTAT(row);
                          if (!liveTat || liveTat.status === "unknown")
                            return (
                              <span
                                style={{ color: "#bbb", fontSize: "0.8rem" }}
                              >
                                —
                              </span>
                            );
                          return (
                            <TATBadge status={liveTat.status}>
                              {tatIcon(liveTat.status)} {liveTat.label}
                            </TATBadge>
                          );
                        })()}
                      </Td>
                      <Td>{formatDate(row.investBillDate)}</Td>
                      <Td>
                        {row.referredByName ? (
                          <ReferredByBadge>
                            👨‍⚕️ {row.referredByName}
                          </ReferredByBadge>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background:
                              (row.paymentMethod || "").toLowerCase() === "credit"
                                ? "#ede9fe"
                                : "#e0f2fe",
                            color:
                              (row.paymentMethod || "").toLowerCase() === "credit"
                                ? "#6d28d9"
                                : "#0369a1",
                            border: `1px solid ${(row.paymentMethod || "").toLowerCase() === "credit"
                              ? "#ddd6fe"
                              : "#bae6fd"
                              }`,
                          }}
                        >
                          💳 {row.paymentMethod || "Cash"}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          hasReport={row.paymentStatus === "Paid"}
                          approved={row.paymentStatus === "Paid"}
                        >
                          {row.paymentStatus === "Paid"
                            ? "✅ Paid"
                            : "⏳ Pending"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        {row.report?.slot_DateTime ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                            }}
                          >
                            <SlotBadge>
                              🕐 {formatSlotDisplay(row.report.slot_DateTime)}
                            </SlotBadge>
                            {row.tat_info?.slot_info && (
                              <SlotPunctualityBadge
                                status={row.tat_info.slot_info.status}
                              >
                                {row.tat_info.slot_info.status === "on_time"
                                  ? "✅"
                                  : row.tat_info.slot_info.status === "late"
                                    ? "🔴"
                                    : "⏳"}{" "}
                                {row.tat_info.slot_info.label}
                              </SlotPunctualityBadge>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </Td>
                      <PatientInCell
                        row={row}
                        handlePatientCheckIn={handlePatientCheckIn}
                      />
                      <ScanStartedCell
                        row={row}
                        handleScanStarted={handleScanStarted}
                      />
                      <DispatchCell row={row} handleDispatch={handleDispatch} />
                      <Td>
                        {!row.hasReport ? (
                          <StatusBadge hasReport={false}>
                            ⏳ Pending
                          </StatusBadge>
                        ) : row.report?.is_Dispatched ? (
                          <StatusBadge hasReport approved dispatched>
                            📤 Dispatched
                          </StatusBadge>
                        ) : row.report?.is_approved ? (
                          <StatusBadge hasReport approved>
                            ✓ Approved
                          </StatusBadge>
                        ) : (
                          <StatusBadge hasReport>⏱ Reported</StatusBadge>
                        )}
                      </Td>
                      <Td>
                        <ActionRow>
                          {row.ipNumber && (
                            <IconBtn
                              onClick={() => handleOpenSlot(row)}
                              disabled={
                                row.report?.is_approved ||
                                !!row.report?.scan_started_DateTime
                              }
                              data-tip={
                                row.report?.is_approved
                                  ? "Slot locked (approved)"
                                  : row.report?.scan_started_DateTime
                                    ? "Slot locked (scan started)"
                                    : row.report?.slot_DateTime
                                      ? "Update Slot"
                                      : "Set Slot"
                              }
                            >
                              🕐
                            </IconBtn>
                          )}
                          <IconBtn
                            onClick={() => handleGoToReport(row)}
                            disabled={
                              !isPaymentAllowed(row.paymentMethod, row.paymentStatus) ||
                              row.report?.is_approved ||
                              !row.report?.patientIn_DateTime ||
                              !row.report?.scan_started_DateTime ||
                              (row.hasReport && !row.ipNumber) ||
                              (row.hasReport &&
                                row.ipNumber &&
                                row.report?.impression?.trim())
                            }
                            data-tip={
                              !isPaymentAllowed(row.paymentMethod, row.paymentStatus)
                                ? "Payment Pending"
                                : !row.report?.patientIn_DateTime
                                  ? "Patient not checked in yet"
                                  : !row.report?.scan_started_DateTime
                                    ? "Scan not started yet"
                                    : row.report?.is_approved
                                      ? "Already Approved"
                                      : row.hasReport &&
                                        row.report?.impression?.trim()
                                        ? "Already Submitted"
                                        : "Go to Report"
                            }
                          >
                            📋
                          </IconBtn>
                          <IconBtn
                            onClick={() => handlePreview(row)}
                            disabled={!row.hasReport}
                            data-tip="Preview Report"
                          >
                            👁
                          </IconBtn>
                          <IconBtn
                            onClick={() => handleViewDicom(row)}
                            data-tip="View DICOM Images"
                            style={{ color: "#0284c7" }}
                          >
                            🩻
                          </IconBtn>
                          {canApprove && (
                            <IconBtn
                              onClick={() => handleApprove(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip={
                                row.report?.is_approved
                                  ? "Already Approved"
                                  : "Approve Report"
                              }
                            >
                              ✅
                            </IconBtn>
                          )}
                          {canEdit && (
                            <IconBtn
                              onClick={() => handleEdit(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip="Edit Report"
                            >
                              ✏️
                            </IconBtn>
                          )}
                          <PrintDropdownWrapper
                            onMouseEnter={(e) =>
                              row.report?.is_approved &&
                              showPrintDropdown(row, e)
                            }
                            onMouseLeave={hidePrintDropdown}
                          >
                            <IconBtn
                              disabled={!row.report?.is_approved}
                              data-tip={
                                row.report?.is_approved
                                  ? "Print Options"
                                  : !row.hasReport
                                    ? "No Report"
                                    : "Not Yet Approved"
                              }
                            >
                              🖨️
                            </IconBtn>
                          </PrintDropdownWrapper>
                          {canDelete && (
                            <IconBtn
                              onClick={() => handleDelete(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip="Delete Report"
                            >
                              🗑️
                            </IconBtn>
                          )}
                        </ActionRow>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="18" style={{ padding: 0, border: "none" }}>
                      <EmptyState>
                        <div
                          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
                        >
                          📭
                        </div>
                        <p>
                          {rows.length > 0
                            ? "No results match your search criteria"
                            : "No investigations found for selected date range"}
                        </p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </StickyTable>
          </ScrollableTableWrapper>
        </ContentCard>
      </Container>

      {activePrintRowId &&
        activePrintRow &&
        createPortal(
          <PortalDropdownMenu
            style={{ top: printDropdownPos.top, left: printDropdownPos.left }}
            onMouseEnter={() => setActivePrintRowId(activePrintRowId)}
            onMouseLeave={hidePrintDropdown}
          >
            <DropdownItem
              onClick={() => {
                handlePrintWithTitleMap(activePrintRow, true);
                hidePrintDropdown();
              }}
            >
              🖨️ Print with Letterpad
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                handlePrintWithTitleMap(activePrintRow, false);
                hidePrintDropdown();
              }}
            >
              📄 Print without Letterpad
            </DropdownItem>
          </PortalDropdownMenu>,
          document.body,
        )}

      {isModalOpen && selectedRow && (
        <Modal
          row={selectedRow}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}
      {isEditModalOpen && editingRow && (
        <EditModal
          row={editingRow}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRow(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
      {isSlotModalOpen && slotRow && (
        <SlotModal
          row={slotRow}
          HMSURL={HMSURL}
          activeBillTypeNo={selectedBillType}
          onClose={() => {
            setIsSlotModalOpen(false);
            setSlotRow(null);
          }}
          onSaved={handleSlotSaved}
        />
      )}
      {dicomModalOpen && dicomRow && (
        <DicomModal
          row={dicomRow}
          viewerUrl={dicomViewerUrl}
          onClose={() => {
            setDicomModalOpen(false);
            setDicomViewerUrl("");
            setDicomRow(null);
          }}
        />
      )}
    </PageWrapper>
  );
};

export default RDList;
