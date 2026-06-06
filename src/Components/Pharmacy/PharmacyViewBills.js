import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import HospitalHeader from "../Images/Header.png";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ────────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f0f4f8;
    color: #2d3748;
    font-size: 13px;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; }`;
const spin    = keyframes`to { transform:rotate(360deg); }`;

// ─── Toast Animations ──────────────────────────────────────────────────────────
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(110%); }
  to   { opacity: 1; transform: translateX(0); }
`;
const slideOutRight = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(110%); }
`;
const shrinkProgress = keyframes`
  from { width: 100%; }
  to   { width: 0%; }
`;

// ─── Toast Container ───────────────────────────────────────────────────────────
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 380px;
  width: 100%;
`;

const ToastItem = styled.div`
  pointer-events: all;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  animation: ${({ exiting }) => exiting ? slideOutRight : slideInRight} 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
  border-left: 4px solid ${({ type }) =>
    type === "success" ? "#22c55e" :
    type === "error"   ? "#ef4444" :
    type === "warning" ? "#f59e0b" : "#3b82f6"};
`;

const ToastInner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px 11px;
`;

const ToastIconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${({ type }) =>
    type === "success" ? "#dcfce7" :
    type === "error"   ? "#fee2e2" :
    type === "warning" ? "#fef3c7" : "#dbeafe"};
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ type }) =>
    type === "success" ? "#15803d" :
    type === "error"   ? "#dc2626" :
    type === "warning" ? "#b45309" : "#1d4ed8"};
  margin-bottom: 2px;
`;

const ToastMessage = styled.div`
  font-size: 12px;
  color: #4b5563;
  line-height: 1.45;
  word-break: break-word;
`;

const ToastCode = styled.span`
  font-size: 10px;
  color: #9ca3af;
  font-family: monospace;
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 6px;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 15px;
  line-height: 1;
  padding: 0;
  margin-top: 1px;
  flex-shrink: 0;
  &:hover { color: #6b7280; }
`;

const ToastProgress = styled.div`
  height: 3px;
  background: ${({ type }) =>
    type === "success" ? "#22c55e" :
    type === "error"   ? "#ef4444" :
    type === "warning" ? "#f59e0b" : "#3b82f6"};
  animation: ${shrinkProgress} ${({ duration }) => duration}ms linear forwards;
  transform-origin: left;
`;

// ─── Toast hook ────────────────────────────────────────────────────────────────
const TOAST_DURATION = 4500;

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 370);
  }, []);

  const show = useCallback(({ type = "info", title, message, code }) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, title, message, code, exiting: false }]);
    setTimeout(() => dismiss(id), TOAST_DURATION);
    return id;
  }, [dismiss]);

  return { toasts, show, dismiss };
}

const TOAST_ICONS = {
  success: "✅",
  error:   "❌",
  warning: "⚠️",
  info:    "ℹ️",
};

const TOAST_TITLES = {
  success: "Success",
  error:   "Error",
  warning: "Warning",
  info:    "Info",
};

function ToastRenderer({ toasts, dismiss }) {
  return (
    <ToastContainer>
      {toasts.map((t) => (
        <ToastItem key={t.id} type={t.type} exiting={t.exiting}>
          <ToastInner>
            <ToastIconWrap type={t.type}>{TOAST_ICONS[t.type]}</ToastIconWrap>
            <ToastContent>
              <ToastTitle type={t.type}>
                {t.title || TOAST_TITLES[t.type]}
                {t.code && <ToastCode>{t.code}</ToastCode>}
              </ToastTitle>
              <ToastMessage>{t.message}</ToastMessage>
            </ToastContent>
            <ToastClose onClick={() => dismiss(t.id)}>✕</ToastClose>
          </ToastInner>
          <ToastProgress type={t.type} duration={TOAST_DURATION} />
        </ToastItem>
      ))}
    </ToastContainer>
  );
}

// ─── Tab System ────────────────────────────────────────────────────────────────
const TabBar = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 9px 22px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ active }) => (active ? "#10A596" : "#718096")};
  border-bottom: 2px solid ${({ active }) => (active ? "#10A596" : "transparent")};
  margin-bottom: -2px;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 7px;

  &:hover { color: #10A596; background: #f0faf9; }
`;

const TabCount = styled.span`
  background: ${({ active }) => (active ? "#10A596" : "#e2e8f0")};
  color: ${({ active }) => (active ? "#fff" : "#718096")};
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  transition: all 0.18s;
`;

// ─── Layout ────────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 18px 24px;
  min-height: 100vh;
  background: #f0f4f8;
`;

const PageTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 14px;
  letter-spacing: 0.3px;
`;

const FilterCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const Select = styled.select`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 28px 0 9px;
  font-size: 13px;
  color: #2d3748;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23718096'/%3E%3C/svg%3E") no-repeat right 9px center;
  appearance: none;
  cursor: pointer;
  outline: none;
  &:focus { border-color:#10A596; box-shadow:0 0 0 2px rgba(16,165,150,0.15); }
`;

const Input = styled.input`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 9px;
  font-size: 13px;
  color: #2d3748;
  outline: none;
  &:focus { border-color:#10A596; box-shadow:0 0 0 2px rgba(16,165,150,0.15); }
`;

const SearchBtn = styled.button`
  height: 34px;
  padding: 0 20px;
  background: #10A596;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.18s;
  &:hover  { background: #0d8f82; }
  &:active { background: #0b7a70; }
`;

const TableCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
`;

const ShowEntries = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  select { width: 64px; }
`;

const SelectedBadge = styled.div`
  background: #e6f7f5;
  border: 1px solid #b3e8e4;
  color: #10A596;
  font-size: 12px;
  font-weight: 600;
  border-radius: 5px;
  padding: 4px 12px;
`;

const TableSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  input { width: 180px; }
`;

const TableWrapper = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
`;

// Sales Return table is narrower
const ReturnTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
`;

const Thead = styled.thead`background: #edf2f7;`;

const Th = styled.th`
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  &:hover { color: #10A596; }
`;

// Sales return thead with different accent
const ReturnTh = styled(Th)`
  background: #fdf2f8;
  color: #702459;
  &:hover { color: #b83280; }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #edf2f7;
  transition: background 0.12s;
  &:hover { background: #f7fafc; }
  &:last-child { border-bottom: none; }
`;

const ReturnTr = styled(Tr)`
  &:hover { background: #fdf2f8; }
`;

const Td = styled.td`
  padding: 9px 12px;
  font-size: 13px;
  color: #2d3748;
  white-space: nowrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  ${({ variant }) => {
    switch (variant) {
      case "cash":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "multiple": return "background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;";
      case "card":     return "background:#dbeafe; color:#1e40af; border:1px solid #93c5fd;";
      case "upi":      return "background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd;";
      case "ip":       return "background:#fef3c7; color:#92400e; border:1px solid #fcd34d;";
      case "notpaid":  return "background:#fff1f2; color:#9f1239; border:1px solid #fecdd3; font-style:italic;";
      case "paid":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "billed":   return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
      case "deleted":  return "background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;";
      case "pending":  return "background:#fef3c7; color:#92400e; border:1px solid #fcd34d;";
      case "refund":   return "background:#fce7f3; color:#9d174d; border:1px solid #f9a8d4;";
      case "sales-returned": return "background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd; font-weight:700;";
      default:         return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
    }
  }}
`;

const ActionGroup = styled.div`display:flex; gap:5px; align-items:center;`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  background: none;
  ${({ variant }) => {
    switch (variant) {
      case "edit":   return "background:#ebf8ff; border-color:#bee3f8; color:#2b6cb0; &:hover{background:#bee3f8;}";
      case "delete": return "background:#fff5f5; border-color:#fed7d7; color:#c53030; &:hover{background:#fed7d7;}";
      case "print":  return "background:#f0fff4; border-color:#c6f6d5; color:#276749; &:hover{background:#c6f6d5;}";
      case "copy":   return "background:#faf5ff; border-color:#e9d8fd; color:#6b46c1; &:hover{background:#e9d8fd;}";
      case "view":   return "background:#fdf2f8; border-color:#fbcfe8; color:#9d174d; &:hover{background:#fbcfe8;}";
      default:       return "background:#f7fafc; border-color:#e2e8f0; color:#4a5568;";
    }
  }}
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-wrap: wrap;
  gap: 8px;
`;

const PaginationInfo = styled.span`font-size:12px; color:#718096;`;
const PaginationBtns = styled.div`display:flex; gap:4px;`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid ${({ active }) => (active ? "#2b6cb0" : "#e2e8f0")};
  background: ${({ active }) => (active ? "#2b6cb0" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#4a5568")};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "700" : "400")};
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { background:${({ active }) => (active ? "#2c5282" : "#edf2f7")}; }
  &:disabled { opacity:0.45; cursor:not-allowed; }
`;

const Spinner = styled.div`
  width:32px; height:32px;
  border:3px solid #e2e8f0; border-top-color:#2b6cb0;
  border-radius:50%; animation:${spin} 0.7s linear infinite;
  margin:40px auto;
`;

const EmptyMsg = styled.div`
  text-align:center; padding:40px; color:#a0aec0; font-size:14px;
`;

const AmountCell = styled.span`font-variant-numeric:tabular-nums; font-weight:500;`;

const StatPill = styled.span`
  display:inline-flex; align-items:center;
  padding:4px 12px; border-radius:20px;
  font-size:12px; font-weight:700;
  background:${({ bg }) => bg};
  color:${({ color }) => color};
  border:1px solid ${({ border }) => border};
`;

// ─── Sales Return Detail Modal ─────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
  animation: ${fadeIn} 0.25s cubic-bezier(0.22,1,0.36,1);
  padding: 32px 28px 24px;
  text-align: center;
`;

const ModalTopBar = styled.div``;

const ModalIcon = styled.div`
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 2.5px solid ${({ variant }) => variant === "delete" ? "#ef4444" : variant === "return" ? "#b83280" : "#f59e0b"};
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
  color: ${({ variant }) => variant === "delete" ? "#ef4444" : variant === "return" ? "#b83280" : "#f59e0b"};
  background: ${({ variant }) => variant === "delete" ? "#fff5f5" : variant === "return" ? "#fdf2f8" : "#fffbeb"};
`;

const ModalHeading = styled.div`
  color: #1a202c;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ModalSubHeading = styled.div`
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 18px;
  line-height: 1.5;
`;

const ModalBody = styled.div`padding: 0;`;

const ConfirmText = styled.p`
  font-size: 13.5px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 6px;
  text-align: left;
`;

const BillRef = styled.span`
  font-weight: 700;
  color: #10A596;
  font-family: monospace;
  background: #e6f7f5;
  padding: 1px 7px;
  border-radius: 5px;
  border: 1px solid #b3e8e4;
`;

const ReasonSection = styled.div`
  margin-top: 14px;
  animation: ${fadeIn} 0.2s ease;
  text-align: left;
`;

const ReasonLabel = styled.label`
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 7px;
  span { color: #dc2626; margin-left: 2px; }
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #1f2937;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background: #f9fafb;
  &:focus {
    border-color: #10A596;
    box-shadow: 0 0 0 3px rgba(16,165,150,0.12);
    background: #fff;
  }
  &::placeholder { color: #9ca3af; font-style: italic; }
`;

const ReasonError = styled.div`
  margin-top: 5px;
  font-size: 11.5px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ModalFooter = styled.div`
  padding: 20px 0 0;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const ModalBtn = styled.button`
  height: 38px;
  padding: 0 28px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 90px;
  justify-content: center;

  ${({ variant }) => variant === "cancel" ? `
    background: #e2e8f0;
    color: #475569;
    border: 1px solid #cbd5e0;
    &:hover { background: #cbd5e0; }
  ` : variant === "confirm" ? `
    background: #10A596;
    color: #fff;
    box-shadow: 0 2px 8px rgba(16,165,150,0.25);
    &:hover { background: #0d8f82; }
    &:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  ` : variant === "danger" ? `
    background: #ef4444;
    color: #fff;
    box-shadow: 0 2px 8px rgba(239,68,68,0.25);
    &:hover { background: #dc2626; }
    &:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  ` : `
    background: #f1f5f9;
    color: #374151;
  `}
`;

const StepDots = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
`;

const StepDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: ${({ active }) => active ? "#2563eb" : "#e2e8f0"};
  transition: background 0.2s;
`;

const StepLine = styled.div`
  flex: 1;
  height: 2px;
  background: ${({ active }) => active ? "#2563eb" : "#e2e8f0"};
  transition: background 0.2s;
`;

const DeleteWarningBox = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 12px;
  font-size: 12.5px;
  color: #c53030;
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

// ─── Return Detail Modal (wide) ────────────────────────────────────────────────
const ReturnDetailOverlay = styled(ModalOverlay)``;

const ReturnDetailBox = styled.div`
  background: #fff;
  border-radius: 14px;
  width: 95%;
  max-width: 700px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  animation: ${fadeIn} 0.25s cubic-bezier(0.22,1,0.36,1);
  display: flex;
  flex-direction: column;
`;

const ReturnDetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  background: linear-gradient(130deg, #9d174d, #b83280);
  border-radius: 14px 14px 0 0;
`;

const ReturnDetailBody = styled.div`
  padding: 22px 24px;
  flex: 1;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
  margin-bottom: 18px;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const InfoValue = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

// ─── Pure helpers ──────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const hours24 = d.getHours();
  const minutes  = d.getMinutes();
  const seconds  = d.getSeconds();
  const ampm     = hours24 >= 12 ? "PM" : "AM";
  const hours12  = hours24 % 12 || 12;
  return `${String(hours12).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")} ${ampm}`;
};

const parsePaymentMethod = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object" && raw !== null) {
    return raw.method || null;
  }
  const allMethods = [];
  const re = /['"]method['"]\s*[,:\s]+['"]([^'"]+)['"]/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    allMethods.push(m[1]);
  }
  if (allMethods.length > 1) return "Multiple (" + allMethods.join(", ") + ")";
  if (allMethods.length === 1) return allMethods[0];
  return null;
};

const parsePaymentEntries = (raw) => {
  if (!raw) return [];
  // Handle object (JSON from MongoDB)
  if (typeof raw === "object" && !Array.isArray(raw)) {
    if (raw.method) {
      return [{ method: raw.method, amount: raw.Paid_amount || null }];
    }
    return [];
  }
  const entries = [];
  const blocks = raw.match(/OrderedDict\(\[([^\]]+)\]\)/gi) || [raw];
  for (const block of blocks) {
    const method = block.match(/['"]method['"]\s*[,:\s]+['"]([^'"]+)['"]/i);
    const amount = block.match(/['"]Paid_amount['"]\s*[,:\s]+([0-9.]+)/i);
    if (method) {
      entries.push({
        method: method[1],
        amount: amount ? parseFloat(amount[1]) : null,
      });
    }
  }
  return entries;
};

const parseMedicineParticulars = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch (_) {}
  try {
    let s = raw
      .replace(/OrderedDict\(/g, "")
      .replace(/\)\]/g, "]")
      .replace(/\)\)/g, ")")
      .replace(/\(/g, "[")
      .replace(/\)/g, "]")
      .replace(/'/g, '"');
    const tupleArrayToObj = (arr) => {
      if (!Array.isArray(arr)) return arr;
      if (arr.length > 0 && Array.isArray(arr[0]) && arr[0].length === 2 && typeof arr[0][0] === "string") {
        const obj = {};
        arr.forEach(([k, v]) => { obj[k] = v; });
        return obj;
      }
      return arr.map(tupleArrayToObj);
    };
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(tupleArrayToObj);
    return [tupleArrayToObj(parsed)];
  } catch (e) {
    console.warn("parseMedicineParticulars failed:", e, raw);
    return [];
  }
};

const paymentVariant = (method) => {
  if (!method) return "default";
  const m = method.toLowerCase();
  if (m.includes("multiple")) return "multiple";
  if (m.includes("cash"))     return "cash";
  if (m.includes("card"))     return "card";
  if (m.includes("upi"))      return "upi";
  if (m.includes("ip") || m.includes("credit")) return "ip";
  return "default";
};

const BILL_TYPE_LABELS = {
  "42": "PHARMACY OP BILL",
  "43": "PHARMACY IP BILL",
  "44": "PHARMACY OTC BILL",
};

const billTypeLabel = (code) => BILL_TYPE_LABELS[code] || `Bill Type ${code}`;

const SEARCH_BY_OPTIONS = [
  { label: "Patient Name", value: "patient_name" },
  { label: "UHID",         value: "uhid"         },
  { label: "Bill Number",  value: "bill_no"      },
];

const ENTRIES_OPTIONS = [10, 25, 50, 100];

// ─── Extract sales return rows from edit_history inside medicine_particulars ──
// Each item in a bill can carry multiple edit_history entries with action="sales_return".
// We synthesise one return row per unique return_bill_no per original bill.
const extractReturnRows = (bill, employeeName) => {
  const meds = parseMedicineParticulars(bill.medicine_particulars);
  // Collect all sales_return edit_history entries across all items
  const returnMap = {}; // keyed by return_bill_no
  meds.forEach((item) => {
    (item.edit_history || []).forEach((h) => {
      if (h.action !== "sales_return") return;
      const key = h.return_bill_no || `${bill.bill_no}_ret`;
      if (!returnMap[key]) {
        returnMap[key] = {
          return_bill_no:  h.return_bill_no || "",
          return_date:     h.return_date    || "",
          edited_by:       h.edited_by      || "",
          items:           [],
        };
      }
      returnMap[key].items.push({
        item_name:   item.item_name   || `Item #${item.item_id}`,
        batch_number: item.batch_number || "",
        old_qty:     h.old_qty    ?? 0,
        return_qty:  h.return_qty ?? 0,
        price:       parseFloat(item.price ?? 0),
        return_amount: parseFloat(h.return_qty ?? 0) * parseFloat(item.price ?? 0),
      });
    });
  });

  // Resolve parent bill's payment info once — return rows inherit it
  const parentPaymentMethod  = parsePaymentMethod(bill.payment_details) || null;
  const parentPaymentEntries = parsePaymentEntries(bill.payment_details);
  const parentBillingStatus  = bill.billing_status || "Sales Returned";

  return Object.values(returnMap).map((ret) => {
    const totalReturnAmt = ret.items.reduce((s, i) => s + i.return_amount, 0);
    return {
      // Mark as a return row so the table can render differently
      _isReturn:      true,
      id:             `ret_${bill.Bill_id}_${ret.return_bill_no}`,
      Bill_id:        bill.Bill_id,
      // Use the return date as bill_date so it sorts/filters properly
      bill_date:      ret.return_date || bill.bill_date || bill.created_date || "",
      uhid:           bill.uhid           || "",
      patient_name:   bill.patient_name   || "",
      // Inherit parent bill's payment so Payment Mode column shows correctly
      payment_method:  parentPaymentMethod,
      payment_details: bill.payment_details || null,
      payment_entries: parentPaymentEntries,
      billing_mode:   bill.billing_mode    || "",
      // Show parent status (e.g. "Paid") alongside "Sales Returned" badge
      billing_status:      "Sales Returned",
      parent_billing_status: parentBillingStatus,
      is_deleted:     false,
      delete_reason:  "",
      bill_number:    ret.return_bill_no  || "",
      bill_no:        ret.return_bill_no  || "",
      original_bill_no: bill.bill_no      || "",
      bill_type:      bill.bill_type      || "",
      estimate_no:    null,
      total_amount:   totalReturnAmt,
      net_amount:     totalReturnAmt,
      discount:       0,
      overall_discount_type:   null,
      overall_discount_value:  0,
      overall_discount_amount: 0,
      doctor_id:      bill.doctor_id      || "",
      doctor_name:    bill.doctor_name    || "",
      inpatient_number: bill.inpatient_number || "",
      ip_serial_number: "",
      room_no:        bill.room_no        || "",
      employee_name:  employeeName         || ret.edited_by || "",
      cashier_id:     ret.edited_by       || "",
      medicine_particulars: ret.items,
    };
  });
};

const formatBillData = (bills, employeeName = "") => {
  const rows = [];
  bills.forEach((b) => {
    // Main bill row
    rows.push({
      id:             b.Bill_id,
      Bill_id:        b.Bill_id,
      _isReturn:      false,
      bill_date:      b.bill_date      || b.created_date || "",
      uhid:           b.uhid           || "",
      patient_name:   b.patient_name   || "",
      payment_method: parsePaymentMethod(b.payment_details) || null,
      payment_details: b.payment_details || null,
      payment_entries: parsePaymentEntries(b.payment_details),
      billing_mode:   b.billing_mode    || "",
      billing_status: b.billing_status || "",
      is_deleted:     b.is_deleted     || false,
      delete_reason:  b.delete_reason  || "",
      bill_number:    b.bill_no        || "",
      bill_no:        b.bill_no        || "",
      original_bill_no: "",
      bill_type:      b.bill_type      || "",
      estimate_no:    b.estimate_no    || null,
      total_amount:   parseFloat(b.total_amount ?? 0),
      net_amount:     parseFloat(b.net_amount   ?? 0),
      discount:       parseFloat(b.overall_discount_amount ?? 0),
      overall_discount_type:   b.overall_discount_type  || "percent",
      overall_discount_value:  b.overall_discount_value ?? 0,
      overall_discount_amount: parseFloat(b.overall_discount_amount ?? 0),
      doctor_id:      b.doctor_id      || "",
      doctor_name:    b.doctor_name    || "",
      inpatient_number: b.inpatient_number || "",
      ip_serial_number: b.shiftno || b.ip_serial_number || "",
      room_no:        b.room_no        || "",
      employee_name:  b.employee_name  || employeeName || "",
      cashier_id:     b.cashier_id     || "",
      medicine_particulars: parseMedicineParticulars(b.medicine_particulars),
    });
    // Inline return rows derived from edit_history
    extractReturnRows(b, b.employee_name || employeeName).forEach((r) => rows.push(r));
  });
  return rows;
};

const thStyle = {
  padding: "7px 8px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 11.5,
  color: "#4a5568",
  border: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px 8px",
  fontSize: 12,
  border: "1px solid #e2e8f0",
  color: "#2d3748",
};

// ─── Return Status Badge helper ────────────────────────────────────────────────
const returnStatusVariant = (status) => {
  if (!status) return "default";
  const s = status.toLowerCase();
  if (s === "paid")    return "paid";
  if (s === "pending") return "pending";
  if (s === "refund")  return "refund";
  return "default";
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function OPPharmacyViewBills({ onEditBill, onSwitchToPharmacy }) {
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  // ── Bills State ───────────────────────────────────────────────────────────
  const [fromDate,       setFromDate]       = useState(today());
  const [toDate,         setToDate]         = useState(today());
  const [searchBy,       setSearchBy]       = useState("patient_name");
  const [searchText,     setSearchText]     = useState("");
  const [billTypeFilter, setBillTypeFilter] = useState("ALL");
  const [billTypeCodes,  setBillTypeCodes]  = useState([]);
  const [allBills,       setAllBills]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [tableSearch,    setTableSearch]    = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [sortKey,        setSortKey]        = useState("bill_date");
  const [sortDir,        setSortDir]        = useState("desc");

  // ── Returns State (removed — returns merged into bills table) ───────────

  // ── Bill Modals ───────────────────────────────────────────────────────────
  const [editModalBill,  setEditModalBill]  = useState(null);
  const [editStep,       setEditStep]       = useState(1);
  const [editReason,     setEditReason]     = useState("");
  const [reasonError,    setReasonError]    = useState(false);

  const [deleteModalBill,   setDeleteModalBill]   = useState(null);
  const [deleteReason,      setDeleteReason]      = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState(false);
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [deleteError,       setDeleteError]       = useState("");

  const [printBill, setPrintBill] = useState(null);

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = (bill) => setPrintBill(bill);

  const handlePrintNow = () => {
    const content = document.getElementById("print-area").innerHTML;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Pharmacy Medicine Invoice</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12.5px; color: #111; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ccc; padding: 5px 8px; font-size: 12px; }
            th { background: #eee; font-weight: 700; }
            hr { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
            @media print {
              @page { margin: 15mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  // ── Edit Modal ────────────────────────────────────────────────────────────
  const openEditModal = (bill) => { setEditModalBill(bill); setEditStep(1); setEditReason(""); setReasonError(false); };
  const closeEditModal = () => { setEditModalBill(null); setEditStep(1); setEditReason(""); setReasonError(false); };
  const handleEditConfirm = () => { setEditStep(2); setReasonError(false); };
  const handleEditProceed = () => {
    if (!editReason.trim()) { setReasonError(true); return; }
    if (onEditBill) onEditBill({ ...editModalBill, editReason: editReason.trim() });
    if (onSwitchToPharmacy) onSwitchToPharmacy();
    closeEditModal();
  };

  // ── Delete Modal ──────────────────────────────────────────────────────────
  const openDeleteModal = (bill) => { setDeleteModalBill(bill); setDeleteReason(""); setDeleteReasonError(false); setDeleteError(""); };
  const closeDeleteModal = () => { setDeleteModalBill(null); setDeleteReason(""); setDeleteReasonError(false); setDeleteError(""); };

  const handleDeleteConfirm = async () => {
    if (!deleteReason.trim()) { setDeleteReasonError(true); return; }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy_deletebill/`,
        "POST",
        { bill_id: deleteModalBill.Bill_id, delete_reason: deleteReason.trim() }
      );
      const body = response?.data ?? response;
      if (body.status === "success") {
        setAllBills((prev) => prev.filter((b) => b.Bill_id !== deleteModalBill.Bill_id));
        closeDeleteModal();
        showToast({ type: "success", message: body.message, code: body.code });
      } else {
        setDeleteError(body.message || "Delete failed. Please try again.");
        showToast({ type: "error", message: body.message, code: body.code });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Something went wrong while deleting. Please try again.";
      const errCode = err?.response?.data?.code || "NETWORK_ERROR";
      setDeleteError(errMsg);
      showToast({ type: "error", message: errMsg, code: errCode });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Fetch bills (returns are embedded via edit_history) ──────────────────
  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`${HmsBaseUrl}pharmacy_view_bills/`, "GET");
      const body = response?.data ?? response;

      const billsArray  = Array.isArray(body?.data) ? body.data : [];
      const employeeName = body?.employee_name || "";
      // formatBillData now inlines return rows derived from edit_history
      const formatted = formatBillData(billsArray, employeeName);
      setAllBills(formatted);
      setCurrentPage(1);
      const codes = [...new Set(billsArray.map((b) => String(b.bill_type)).filter(Boolean))];
      setBillTypeCodes(codes);

      console.log("View bills data:", body);
    } catch (err) {
      console.error("View bills error:", err);
      setError("Unable to connect to HMS server");
      setAllBills([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, searchBy, searchText]);

  useEffect(() => { fetchBills(); }, []); // eslint-disable-line

  // ── Bills filtering/sorting/pagination ────────────────────────────────────
  const filtered = allBills.filter((b) => {
    if (billTypeFilter !== "ALL" && b.bill_type !== billTypeFilter) return false;
    if (fromDate || toDate) {
      const billDay = b.bill_date ? b.bill_date.split("T")[0] : null;
      if (billDay) {
        if (fromDate && billDay < fromDate) return false;
        if (toDate   && billDay > toDate)   return false;
      }
    }
    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const fieldMap = {
        bill_date:    (b.bill_date    || "").slice(0, 10),
        patient_name: (b.patient_name || "").toLowerCase(),
        uhid:         (b.uhid         || "").toLowerCase(),
        bill_no:      (b.bill_number  || "").toLowerCase(),
      };
      const val = fieldMap[searchBy] ?? "";
      if (!val.includes(q)) return false;
    }
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return (
        (b.patient_name   || "").toLowerCase().includes(q) ||
        (b.uhid           || "").toLowerCase().includes(q) ||
        (b.bill_number    || "").toLowerCase().includes(q) ||
        (b.payment_method || "").toLowerCase().includes(q) ||
        (b.billing_status || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] ?? ""; let bv = b[sortKey] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / entriesPerPage));
  const paginated  = sorted.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const dateFiltered = allBills.filter((b) => {
    if (fromDate || toDate) {
      const billDay = b.bill_date ? b.bill_date.split("T")[0] : null;
      if (billDay) {
        if (fromDate && billDay < fromDate) return false;
        if (toDate   && billDay > toDate)   return false;
      }
    }
    return true;
  });

  const paidCount         = dateFiltered.filter((b) => !b._isReturn && b.billing_status === "Paid").length;
  const billedCount       = dateFiltered.filter((b) => !b._isReturn && b.billing_status === "Billed").length;
  const deletedCount      = dateFiltered.filter((b) => !b._isReturn && (b.is_deleted === true || (b.billing_status || "").toLowerCase() === "deleted")).length;
  const salesReturnCount  = dateFiltered.filter((b) => b._isReturn).length;

  const getPageNums = (current, total) => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - current) <= delta)
        pages.push(i);
      else if (pages[pages.length - 1] !== "...")
        pages.push("...");
    }
    return pages;
  };

  const isPaid    = (bill) => (bill.billing_status || "").toLowerCase() === "paid";
  const isDeleted = (bill) => (bill.billing_status || "").toLowerCase() === "deleted" || bill.is_deleted === true;

  const SortIcon = ({ col, currentKey, dir }) =>
    currentKey !== col
      ? <span style={{ opacity:0.3 }}> ↕</span>
      : <span style={{ color:"#10A596" }}>{dir === "asc" ? " ↑" : " ↓"}</span>;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <ToastRenderer toasts={toasts} dismiss={dismissToast} />

      <PageWrapper>
        <PageTitle>Pharmacy OP Bills — View Bills</PageTitle>

        {/* ── Summary Stats ── */}
        {!loading && allBills.length > 0 && (
          <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <StatPill color="#276749" bg="#c6f6d5" border="#9ae6b4">✅ Paid: {paidCount}</StatPill>
            <StatPill color="#744210" bg="#fefcbf" border="#f6e05e">🧾 Billed: {billedCount}</StatPill>
            <StatPill color="#991b1b" bg="#fee2e2" border="#fca5a5">🗑️ Deleted: {deletedCount}</StatPill>
            <StatPill color="#5b21b6" bg="#ede9fe" border="#c4b5fd">🔄 Sales Returned: {salesReturnCount}</StatPill>
            <StatPill color="#2b6cb0" bg="#ebf8ff" border="#bee3f8">📋 Total: {dateFiltered.length}</StatPill>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            BILLS TABLE (includes inline Sales Returned rows)
        ════════════════════════════════════════════════════════════════ */}
            {/* Filter Bar */}
            <FilterCard>
              <FieldGroup>
                <Label>From</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label>To</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label>Search By</Label>
                <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} style={{ minWidth: 150 }}>
                  {SEARCH_BY_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup style={{ flex:1, minWidth:180 }}>
                <Label>Search Value</Label>
                <Input
                  type="text"
                  placeholder={`Search by ${SEARCH_BY_OPTIONS.find(s => s.value === searchBy)?.label}...`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchBills()}
                />
              </FieldGroup>
              <SearchBtn onClick={fetchBills}><span>🔍</span> Search</SearchBtn>
            </FilterCard>

            {/* Table */}
            <TableCard>
              <TableToolbar>
                <ShowEntries>
                  Show
                  <Select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ width:64 }}>
                    {ENTRIES_OPTIONS.map((n) => <option key={n}>{n}</option>)}
                  </Select>
                  entries
                </ShowEntries>
                <SelectedBadge>{filtered.length} SELECTED</SelectedBadge>
                <TableSearch>
                  Search:
                  <Input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Filter table..."
                  />
                </TableSearch>
              </TableToolbar>

              {error && (
                <div style={{ padding:"12px 16px", background:"#fff5f5", color:"#c53030", fontSize:13 }}>
                  ⚠ {error}
                </div>
              )}

              {loading ? (
                <Spinner />
              ) : filtered.length === 0 ? (
                <EmptyMsg>No bills found for the selected criteria.</EmptyMsg>
              ) : (
                <TableWrapper>
                  <Table>
                    <Thead>
                      <tr>
                        <Th onClick={() => handleSort("bill_date")}>Bill Date <SortIcon col="bill_date" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("bill_date")}>Bill Time <SortIcon col="bill_date" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("uhid")}>UHID No <SortIcon col="uhid" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("patient_name")}>Patient Name <SortIcon col="patient_name" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("payment_method")}>Payment Mode <SortIcon col="payment_method" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("billing_status")}>Status <SortIcon col="billing_status" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("bill_number")}>Bill Number <SortIcon col="bill_number" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("net_amount")}>Bill Amount <SortIcon col="net_amount" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("net_amount")}>Amount Collected <SortIcon col="net_amount" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("inpatient_number")}>IP Number <SortIcon col="inpatient_number" currentKey={sortKey} dir={sortDir} /></Th>

                        <Th onClick={() => handleSort("total_amount")}>Total Amount <SortIcon col="total_amount" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th onClick={() => handleSort("employee_name")}>Username <SortIcon col="employee_name" currentKey={sortKey} dir={sortDir} /></Th>
                        <Th>Actions</Th>
                      </tr>
                    </Thead>
                    <tbody>
                      {paginated.map((bill, idx) => {
                        const status      = (bill.billing_status || "").toLowerCase();
                        const isPaidBill  = status === "paid";
                        return (
                          <Tr key={bill.id ?? idx}>
                            <Td>{formatDate(bill.bill_date)}</Td>
                            <Td>{formatTime(bill.bill_date)}</Td>
                            <Td style={{ color:"#10A596", fontWeight:500 }}>{bill.uhid || "—"}</Td>
                            <Td style={{ fontWeight:500 }}>{bill.patient_name || "—"}</Td>
                            <Td>
                              {bill.payment_entries && bill.payment_entries.length > 0 ? (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                  {bill.payment_entries.map((e, i) => (
                                    <Badge key={i} variant={paymentVariant(e.method)}>{e.method}</Badge>
                                  ))}
                                </div>
                              ) : bill.payment_method ? (
                                <Badge variant={paymentVariant(bill.payment_method)}>{bill.payment_method}</Badge>
                              ) : (
                                <Badge variant="notpaid">⏳ Not Yet Paid</Badge>
                              )}
                            </Td>
                            <Td>
                              {bill._isReturn ? (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignItems:"center" }}>
                                  {bill.parent_billing_status && (
                                    <Badge variant={
                                      bill.parent_billing_status.toLowerCase() === "paid"    ? "paid"    :
                                      bill.parent_billing_status.toLowerCase() === "billed"  ? "billed"  :
                                      bill.parent_billing_status.toLowerCase() === "deleted" ? "deleted" : "default"
                                    }>
                                      {bill.parent_billing_status}
                                    </Badge>
                                  )}
                                  <Badge variant="sales-returned">🔄 Sales Returned</Badge>
                                </div>
                              ) : (
                                <Badge variant={
                                  isDeleted(bill) ? "deleted" :
                                  isPaid(bill)    ? "paid"    : "billed"
                                }>
                                  {isDeleted(bill) ? "🗑️ Deleted" : bill.billing_status || "—"}
                                </Badge>
                              )}
                            </Td>
                            <Td style={{ fontFamily:"monospace", fontSize:12 }}>
                              {bill.bill_number || "—"}
                              {bill._isReturn && bill.original_bill_no && (
                                <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>
                                  Orig: {bill.original_bill_no}
                                </div>
                              )}
                            </Td>
                            <Td><AmountCell style={{ color: "#2d3748" }}>₹ {bill.net_amount.toFixed(2)}</AmountCell></Td>
                            <Td>
                              {bill._isReturn ? (
                                <AmountCell style={{ color:"#9d174d", fontWeight:600 }}>
                                  − ₹ {bill.net_amount.toFixed(2)}
                                </AmountCell>
                              ) : (
                                <AmountCell style={{ color: isPaidBill ? "#276749" : "#a0aec0", fontWeight: isPaidBill ? 600 : 400 }}>
                                  {isPaidBill ? `₹ ${bill.net_amount.toFixed(2)}` : "—"}
                                </AmountCell>
                              )}
                            </Td>
                            <Td style={{ color:"#744210", fontWeight: bill.inpatient_number ? 500 : 400 }}>{bill.inpatient_number || "—"}</Td>

                            <Td><AmountCell>₹ {bill.total_amount.toFixed(2)}</AmountCell></Td>
                            <Td style={{ color:"#4a5568", fontSize:12 }}>{bill.employee_name || "—"}</Td>
                            <Td>
                              <ActionGroup>
                                {bill._isReturn ? (
                                  <IconBtn variant="print" title="Print" onClick={() => handlePrint(bill)}>🖨️</IconBtn>
                                ) : (
                                  <>
                                    {!isDeleted(bill) && !isPaid(bill) && (
                                      <IconBtn variant="edit" title="Edit" onClick={() => openEditModal(bill)}>✏️</IconBtn>
                                    )}
                                    {!isDeleted(bill) && (
                                      <IconBtn variant="delete" title="Delete" onClick={() => openDeleteModal(bill)}>🗑️</IconBtn>
                                    )}
                                    <IconBtn variant="print" title="Print" onClick={() => handlePrint(bill)}>🖨️</IconBtn>
                                  </>
                                )}
                              </ActionGroup>
                            </Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrapper>
              )}

              {!loading && filtered.length > 0 && (
                <PaginationBar>
                  <PaginationInfo>
                    Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)} to{" "}
                    {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
                    {filtered.length < allBills.length && ` (filtered from ${allBills.length} total)`}
                  </PaginationInfo>
                  <PaginationBtns>
                    <PageBtn onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</PageBtn>
                    {getPageNums(currentPage, totalPages).map((p, i) =>
                      p === "..." ? (
                        <PageBtn key={`e${i}`} disabled>…</PageBtn>
                      ) : (
                        <PageBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</PageBtn>
                      )
                    )}
                    <PageBtn onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</PageBtn>
                  </PaginationBtns>
                </PaginationBar>
              )}
            </TableCard>

      </PageWrapper>

      {/* ── Edit Confirmation Modal ── */}
      {editModalBill && (
        <ModalOverlay onClick={closeEditModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalIcon variant="edit">!</ModalIcon>
            <ModalHeading>Edit Bill Confirmation</ModalHeading>
            <ModalSubHeading>Please provide a valid reason for editing this bill</ModalSubHeading>
            <ModalBody>
              <ReasonSection>
                <ReasonTextarea
                  autoFocus
                  placeholder="Reason for Edit"
                  value={editReason}
                  onChange={(e) => { setEditReason(e.target.value); if (e.target.value.trim()) setReasonError(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleEditProceed(); }}
                  style={{ minHeight: 56, resize: "none" }}
                />
                {reasonError && <ReasonError>⚠ Reason is required to proceed with the edit.</ReasonError>}
              </ReasonSection>
            </ModalBody>
            <ModalFooter>
              <ModalBtn variant="confirm" onClick={handleEditProceed} disabled={!editReason.trim()}>OK</ModalBtn>
              <ModalBtn variant="cancel" onClick={closeEditModal}>Cancel</ModalBtn>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalBill && (
        <ModalOverlay onClick={!deleteLoading ? closeDeleteModal : undefined}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalIcon variant="delete">!</ModalIcon>
            <ModalHeading>Delete Bill Confirmation</ModalHeading>
            <ModalSubHeading>Please provide a valid reason for deleting this bill</ModalSubHeading>
            <ModalBody>
              <ReasonSection>
                <ReasonTextarea
                  autoFocus
                  placeholder="Reason for Deletion"
                  value={deleteReason}
                  onChange={(e) => { setDeleteReason(e.target.value); if (e.target.value.trim()) setDeleteReasonError(false); setDeleteError(""); }}
                  disabled={deleteLoading}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleDeleteConfirm(); }}
                  style={{ minHeight: 56, resize: "none" }}
                />
                {deleteReasonError && <ReasonError>⚠ Reason is required to proceed with the deletion.</ReasonError>}
                {deleteError && <ReasonError style={{ marginTop: 8, fontSize: 12.5 }}>⚠ {deleteError}</ReasonError>}
              </ReasonSection>
            </ModalBody>
            <ModalFooter>
              <ModalBtn variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading || !deleteReason.trim()}>
                {deleteLoading ? "Deleting…" : "OK"}
              </ModalBtn>
              <ModalBtn variant="cancel" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</ModalBtn>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Print Modal ── */}
      {printBill && (
        <ModalOverlay onClick={() => setPrintBill(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 10, width: "90%", maxWidth: 720,
              maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 20px", background: "linear-gradient(130deg,#0d8f82,#10A596)",
              borderRadius: "10px 10px 0 0",
            }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>🖨️ Print Preview — GST Invoice</span>
              <button onClick={() => setPrintBill(null)} style={{
                background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 6,
                color: "#fff", fontSize: 16, cursor: "pointer", width: 30, height: 30,
              }}>✕</button>
            </div>

            <div id="print-area" style={{ padding: "24px 32px", fontFamily: "Arial, sans-serif", fontSize: 12.5, color: "#111" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <img
                  src={HospitalHeader}
                  alt="Shanmuga Hospital Limited"
                  style={{ height: 64, objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                />
                <div style={{ display: "none" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#005b8e", letterSpacing: 0.5 }}>SHANMUGA HOSPITAL LIMITED</div>
                  <div style={{ fontSize: 11.5, color: "#444", marginTop: 2 }}>51/24, Saradha College Road, Salem - 636007</div>
                  <div style={{ fontSize: 11.5, color: "#444" }}>Ph No: 04272706666</div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ color: "#000000", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 4, letterSpacing: 0.5 }}>
                  PHARMACY MEDICINE INVOICE
                </div>
              </div>

              <hr style={{ borderColor: "#cbd5e0", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 2 }}>
                <span>SLS 7788 20,21 3993 20B 3848 21B </span>
                <span>GST NO: 33ABDCS8326A1ZP &nbsp;&nbsp; No. RM/3G/012</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 10 }}>
                <span> CIN: L85110TZ2020PLC033974</span>
              </div>

              <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "90px 1fr", rowGap: 4, fontSize: 12.5 }}>
                  <span style={{ color: "#555" }}>Patient</span>
                  <span style={{ fontWeight: 600 }}>: {printBill.patient_name || "—"}</span>
                  <span style={{ color: "#555" }}>UHID No</span>
                  <span>: {printBill.uhid || "—"}</span>
                  <span style={{ color: "#555" }}>Doctor</span>
                  <span>: {printBill.doctor_name || "—"}</span>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "80px 1fr", rowGap: 4, fontSize: 12.5 }}>
                  <span style={{ color: "#555" }}>Bill No</span>
                  <span style={{ fontWeight: 600 }}>: {printBill.bill_number || printBill.bill_no || "—"}</span>
                  <span style={{ color: "#555" }}>Date</span>
                  <span>: {formatDate(printBill.bill_date)}</span>
                  <span style={{ color: "#555" }}>Time</span>
                  <span>: {formatTime(printBill.bill_date)}</span>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
                <thead>
                  <tr style={{ background: "#edf2f7" }}>
                    <th style={thStyle}>Particulars</th>
                    <th style={thStyle}>HSN Code</th>
                    <th style={thStyle}>Batch</th>
                    <th style={thStyle}>Expiry</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>CGST %</th>
                    <th style={thStyle}>CGST Amt</th>
                    <th style={thStyle}>SGST %</th>
                    <th style={thStyle}>SGST Amt</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printBill.medicine_particulars && printBill.medicine_particulars.length > 0 ? (
                    printBill.medicine_particulars.map((med, i) => {
                      const qty      = parseFloat(med.qty   ?? med.quantity ?? 0);
                      const price    = parseFloat(med.price ?? med.rate     ?? 0);
                      const amt      = qty * price;
                      const cgstPct  = parseFloat(med.CGST_Percentage ?? med.cgst_percentage ?? med.cgst_pct ?? 2.5);
                      const sgstPct  = parseFloat(med.SGST_Percentage ?? med.sgst_percentage ?? med.sgst_pct ?? 2.5);
                      const cgstAmt  = parseFloat(med.CGST_Amt ?? med.cgst_amount ?? (amt * cgstPct / 100).toFixed(2));
                      const sgstAmt  = parseFloat(med.SGST_Amt ?? med.sgst_amount ?? (amt * sgstPct / 100).toFixed(2));
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tdStyle}>{med.item_name ?? med.medicine_name ?? `Item #${med.item_id ?? i + 1}`}</td>
                          <td style={tdStyle}>{med.hsn_code ?? "—"}</td>
                          <td style={tdStyle}>{med.batch_number ?? med.batch ?? "—"}</td>
                          <td style={tdStyle}>{med.expiry_date ?? med.expiry ?? "—"}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{qty}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{price.toFixed(2)}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{cgstPct}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{cgstAmt.toFixed(2)}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{sgstPct}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{sgstAmt.toFixed(2)}</td>
                          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{amt.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} style={{ ...tdStyle, textAlign: "center", color: "#999" }}>No medicine details available</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
                <div style={{ fontSize: 12.5, alignSelf: "flex-end", paddingBottom: 2 }}>
                  <span style={{ fontWeight: 600 }}>Payment Mode :</span>{" "}
                  {printBill.payment_method || "—"}
                </div>
                <table style={{ borderCollapse: "collapse", minWidth: 260 }}>
                  <tbody>
                    {[
                      ["Total :", printBill.total_amount?.toFixed(2)],
                      ["Discount Amt:", printBill.overall_discount_amount?.toFixed(2) ?? "0.00"],
                      ["Net Amount (Payable) :", printBill.net_amount?.toFixed(2)],
                      ["Amount Collected :", "0.00"],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td style={{ padding: "2px 12px 2px 0", textAlign: "right", fontWeight: label.includes("Net") ? 700 : 500, fontSize: 12.5, color: "#333", whiteSpace: "nowrap" }}>{label}</td>
                        <td style={{ padding: "2px 0", textAlign: "right", fontWeight: label.includes("Net") ? 700 : 500, fontSize: 12.5, minWidth: 70 }}>{val ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr style={{ borderColor: "#cbd5e0", margin: "12px 0 8px" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
                <span>Prepared by : {printBill.prepared_by || "—"}</span>
                <span style={{ fontStyle: "italic" }}>"Goods once sold will not taken back"</span>
                <span>(Sign-pharmacist)</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "12px 20px 16px", borderTop: "1px solid #e2e8f0" }}>
              <ModalBtn variant="cancel" onClick={() => setPrintBill(null)}>✕ Close</ModalBtn>
              <ModalBtn variant="confirm" onClick={handlePrintNow}>🖨️ Print</ModalBtn>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}