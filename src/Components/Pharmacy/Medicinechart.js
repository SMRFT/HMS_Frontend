import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global Font ──────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 2000px; }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  teal:      "#0d9488",
  tealDark:  "#0f766e",
  tealLight: "#ccfbf1",
  tealBg:    "#f0fdfa",
  slate:     "#0f172a",
  slateMid:  "#475569",
  slateLight:"#94a3b8",
  border:    "#e2e8f0",
  surface:   "#ffffff",
  bg:        "#f8fafc",
};

// ─── Styled Components ────────────────────────────────────────────────────────
const Wrapper = styled.div`
  padding: 28px 24px;
  font-family: 'Inter', sans-serif;
  background: ${T.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleBlock = styled.div``;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${T.slate};
  margin: 0 0 2px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.02em;
`;

const TitleIcon = styled.span`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${T.slateLight};
`;

const Controls = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const DateGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: ${T.surface};
  border: 1.5px solid ${T.border};
  border-radius: 10px;
  padding: 8px 12px;
`;

const DateLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${T.slateLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateInput = styled.input`
  padding: 5px 8px;
  border: 1.5px solid ${T.border};
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: ${T.slate};
  background: ${T.bg};
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${T.teal}; }
`;

const DateSep = styled.span`
  color: ${T.slateLight};
  font-size: 0.85rem;
  padding-bottom: 4px;
  align-self: flex-end;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: 'Inter', sans-serif;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  box-shadow: 0 2px 8px rgba(13,148,136,0.3);
  &:hover  { opacity: 0.9; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spin} 0.7s linear infinite;
`;

// ─── Table Card ───────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${T.surface};
  border-radius: 14px;
  border: 1px solid ${T.border};
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
`;

const Thead = styled.thead`
  background: linear-gradient(to right, ${T.tealDark}, #0d9488);
  color: #fff;
  th {
    padding: 13px 14px;
    text-align: left;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

const PatientRow = styled.tr`
  cursor: pointer;
  background: ${({ $active }) => ($active ? T.tealBg : T.surface)};
  border-bottom: 1px solid ${({ $active }) => ($active ? "#a7f3d0" : T.border)};
  transition: background 0.12s;
  &:hover { background: ${({ $active }) => ($active ? T.tealBg : "#f8fafc")}; }
  td {
    padding: 11px 14px;
    color: ${T.slate};
    font-size: 0.84rem;
    white-space: nowrap;
  }
`;

const UHIDCell = styled.td`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.77rem !important;
  color: ${T.tealDark} !important;
  font-weight: 600;
`;

const PrintIcon = styled.td`
  width: 44px;
  text-align: center;
`;

const PrintIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px 7px;
  border-radius: 7px;
  color: ${T.tealDark};
  transition: background 0.12s, transform 0.1s;
  &:hover { background: ${T.tealLight}; transform: scale(1.1); }
`;

const MedicinesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: ${({ $active }) => ($active ? T.tealDark : T.tealBg)};
  color: ${({ $active }) => ($active ? "#fff" : T.tealDark)};
  border: 1.5px solid ${({ $active }) => ($active ? T.tealDark : "#99f6e4")};
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  &:hover { background: ${T.tealDark}; color: #fff; border-color: ${T.tealDark}; }
`;

// ─── Convert to Bill — one per patient row (bill-level) ──────────────────────
const ConvertBillBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(13,148,136,0.25);
  &:hover  { opacity: 0.88; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

// ─── Expandable Detail Panel ──────────────────────────────────────────────────
const DetailPanel = styled.tr`background: #fafffe;`;

const DetailCell = styled.td`
  padding: 0 !important;
  border-bottom: 2px solid #99f6e4;
`;

const DetailInner = styled.div`
  animation: ${slideDown} 0.25s ease;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 8px;
  background: linear-gradient(to right, #f0fdfa, #ecfdf5);
  border-bottom: 1px solid #d1fae5;
`;

const DetailLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.tealDark};
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const ItemCount = styled.span`
  font-size: 0.7rem;
  background: ${T.tealDark};
  color: #fff;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const ItemThead = styled.thead`
  background: #f8fffe;
  th {
    padding: 8px 14px;
    text-align: left;
    font-weight: 600;
    color: ${T.slateMid};
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid #e4f5f2;
    white-space: nowrap;
  }
`;

const ItemRow = styled.tr`
  border-bottom: 1px solid #f0f9f8;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #f0fdfa; }
  td {
    padding: 10px 14px;
    color: ${T.slate};
    vertical-align: middle;
  }
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  background: ${({ $type }) =>
    $type === "substitute" ? "#3b82f6" :
    $type === "emergency"  ? "#ef4444" :
    $type === "insurance"  ? "#22c55e" :
    "#cbd5e1"};
`;

const QtyBadge = styled.span`
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.77rem;
`;

const StockBadge = styled.span`
  background: ${({ $low }) => ($low ? "#fee2e2" : "#dcfce7")};
  color: ${({ $low }) => ($low ? "#dc2626" : "#16a34a")};
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.74rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
`;

const BillingStatusBadge = styled.span`
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: ${({ $status }) =>
    $status === "Pending"    ? "#fef3c7" :
    $status === "Processing" ? "#ede9fe" :
    $status === "Approved"   ? "#dcfce7" :
    $status === "Cancelled"  ? "#fee2e2" :
    $status === "Billed"     ? "#dbeafe" :
    "#f1f5f9"};
  color: ${({ $status }) =>
    $status === "Pending"    ? "#b45309" :
    $status === "Processing" ? "#7c3aed" :
    $status === "Approved"   ? "#16a34a" :
    $status === "Cancelled"  ? "#dc2626" :
    $status === "Billed"     ? "#1d4ed8" :
    "#64748b"};
  border: 1px solid ${({ $status }) =>
    $status === "Pending"    ? "#fcd34d" :
    $status === "Processing" ? "#c4b5fd" :
    $status === "Approved"   ? "#86efac" :
    $status === "Cancelled"  ? "#fca5a5" :
    $status === "Billed"     ? "#93c5fd" :
    "#e2e8f0"};
`;

const SubstituteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  padding: 1px 6px;
  font-size: 0.66rem;
  font-weight: 700;
  margin-left: 6px;
  letter-spacing: 0.02em;
`;

// ─── Per-item Substitute button (standalone in its own column) ────────────────
const SubstBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff;
  border: none;
  border-radius: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.13s;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(13,148,136,0.25);
  &:hover  { opacity: 0.88; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
  padding: 11px 18px;
  margin-top: 14px;
  background: ${T.surface};
  border-radius: 10px;
  border: 1px solid ${T.border};
  font-size: 0.78rem;
  color: ${T.slateMid};
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 52px 20px;
  color: ${T.slateLight};
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  &::before { content: '🫙'; font-size: 2rem; }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 52px 20px;
  color: ${T.teal};
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

const ErrorMsg = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 9px;
  border: 1px solid #fecaca;
  margin-bottom: 16px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before { content: '⚠'; }
`;

// ─── Print Modal ──────────────────────────────────────────────────────────────
const PrintOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const PrintModalBox = styled.div`
  background: ${T.surface};
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  width: 700px;
  max-width: 96vw;
  max-height: 92vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.22s ease;
`;

const PrintModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid ${T.border};
  background: linear-gradient(to right, ${T.tealBg}, #f0fdf4);
`;

const PrintModalTitle = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${T.tealDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrintCloseBtn = styled.button`
  width: 30px; height: 30px;
  border-radius: 8px;
  background: none;
  border: 1.5px solid ${T.border};
  font-size: 1rem;
  cursor: pointer;
  color: ${T.slateMid};
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
`;

const PrintContent = styled.div`
  padding: 24px 28px;
  font-family: Arial, sans-serif;
  font-size: 0.85rem;
  color: #1e293b;
`;

const PrintHospitalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  border-bottom: 2px solid ${T.border};
  padding-bottom: 12px;
`;

const PrintHospitalLogo = styled.div`
  width: 56px; height: 56px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.4rem; flex-shrink: 0;
`;

const PrintHospitalInfo = styled.div`flex: 1;`;
const PrintHospitalName = styled.div`font-size: 1.05rem; font-weight: 800; color: ${T.tealDark};`;
const PrintHospitalSub  = styled.div`font-size: 0.76rem; color: #64748b; margin-top: 2px;`;
const PrintSectionTitle = styled.div`
  background: #f1f5f9;
  text-align: right;
  padding: 5px 12px;
  font-weight: 700;
  font-size: 0.8rem;
  color: ${T.slate};
  margin-bottom: 12px;
  border-radius: 5px;
`;

const PrintMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 24px;
  margin-bottom: 14px;
  font-size: 0.82rem;
`;

const PrintMetaRow  = styled.div`display: flex; gap: 6px;`;
const PrintMetaKey  = styled.span`color: #64748b; white-space: nowrap; min-width: 80px;`;
const PrintMetaVal  = styled.span`font-weight: 600; color: #1e293b;`;
const PrintDateRow  = styled.div`font-weight: 700; font-size: 0.8rem; margin-bottom: 2px;`;
const PrintDoctorRow = styled.div`font-weight: 700; font-size: 0.82rem; color: ${T.tealDark}; margin-bottom: 14px;`;

const PrintItemTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-bottom: 12px;
`;
const PrintItemTh = styled.th`
  border: 1px solid #d1d5db; padding: 7px 10px;
  background: #f8fafc; text-align: left; font-weight: 700; font-size: 0.75rem;
`;
const PrintItemTd = styled.td`border: 1px solid ${T.border}; padding: 6px 10px;`;

const PrintFooterBtns = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid ${T.border};
`;

const PrintBtn = styled.button`
  padding: 9px 22px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff; border: none; border-radius: 9px;
  font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 2px 8px rgba(13,148,136,0.25);
  &:hover { opacity: 0.9; }
`;

const CancelBtn = styled.button`
  padding: 9px 20px;
  background: ${T.bg}; color: ${T.slateMid};
  border: 1.5px solid ${T.border}; border-radius: 9px;
  font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  &:hover { background: ${T.border}; }
`;

// ─── Substitute Modal ─────────────────────────────────────────────────────────
const SubstOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
  z-index: 999999; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
`;

const SubstModalBox = styled.div`
  background: ${T.surface}; border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  width: 520px; max-width: 96vw;
  animation: ${fadeIn} 0.2s ease; overflow: hidden;
`;

const SubstModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff;
`;

const SubstModalTitle = styled.span`
  font-weight: 700; font-size: 0.95rem;
  display: flex; align-items: center; gap: 8px;
`;

const SubstCloseX = styled.button`
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(255,255,255,0.2); border: none; color: #fff;
  font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.3); }
`;

const SubstBody = styled.div`padding: 22px 24px 18px;`;

const SubstFieldLabel = styled.label`
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.slateMid};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 7px;
`;

const SubstOriginalInfo = styled.div`
  background: #f8fafc;
  border: 1.5px solid ${T.border};
  border-radius: 9px;
  padding: 10px 14px;
  margin-bottom: 18px;
  font-size: 0.82rem;
  color: ${T.slateMid};
  display: flex; align-items: center; gap: 8px;
  span { font-weight: 700; color: ${T.slate}; }
`;

const SubstInputWrapper = styled.div`position: relative;`;

const SubstInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${T.border};
  border-radius: 9px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: ${T.slate};
  background: ${T.surface};
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
`;

const SubstDropList = styled.ul`
  position: absolute;
  top: calc(100% + 4px); left: 0; right: 0;
  background: ${T.surface};
  border: 1.5px solid #99f6e4;
  border-radius: 9px;
  box-shadow: 0 8px 28px rgba(13,148,136,0.15);
  max-height: 220px; overflow-y: auto;
  z-index: 1000; margin: 0; padding: 4px 0; list-style: none;
`;

const SubstDropItem = styled.li`
  padding: 9px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: ${T.slate};
  font-weight: 500;
  transition: background 0.1s;
  &:hover { background: ${T.tealBg}; color: ${T.tealDark}; }
`;

const SubstSelectedTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 7px 14px;
  background: ${T.tealBg};
  border: 1.5px solid #99f6e4;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${T.tealDark};
`;

const SubstTagClose = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${T.teal}; font-size: 0.95rem; line-height: 1; padding: 0;
  display: flex; align-items: center;
  &:hover { color: #dc2626; }
`;

const SubstFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid ${T.border};
  background: ${T.bg};
`;

const SubstCloseBtn = styled.button`
  padding: 9px 20px;
  background: ${T.bg}; color: ${T.slateMid};
  border: 1.5px solid ${T.border}; border-radius: 9px;
  font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  &:hover { background: ${T.border}; }
`;

const SubstConfirmBtn = styled.button`
  padding: 9px 22px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: #fff; border: none; border-radius: 9px;
  font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  box-shadow: 0 2px 8px rgba(13,148,136,0.25);
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
`;

// ─── Helper ───────────────────────────────────────────────────────────────────
const getBillKey = (patient) =>
  `bill-${patient?.Bill_id ?? patient?.bill_id ?? patient?.uhid}`;

// ─── Main Component ───────────────────────────────────────────────────────────
const MedicineChart = ({ onConvertToBill }) => {
  const todayStr = new Date().toLocaleDateString("en-CA");

  const [medicineData, setMedicineData]       = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [expandedKey, setExpandedKey]         = useState(null);
  const [fromDate, setFromDate]               = useState(todayStr);
  const [toDate, setToDate]                   = useState(todayStr);
  const [printPatient, setPrintPatient]       = useState(null);

  // Substitute modal — per individual item
  const [substituteModal, setSubstituteModal] = useState(null);
  const [substSearch, setSubstSearch]         = useState("");
  const [substSelected, setSubstSelected]     = useState(null);
  const [substDropOpen, setSubstDropOpen]     = useState(false);
  const [medicines, setMedicines]             = useState([]);

  const HmsBaseUrl = Hmsbaseurl;

  // ─── Helper: fetch patient_details ─────────────────────────────────────────
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

  // ─── Helper: fetch admissionstatus ─────────────────────────────────────────
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

      return {
        admitted:          true,
        ipNumber:          admData?.ipNumber         || "",
        admissionDateTime: admData?.admissionDateTime || "",
        admittingDoctor:   admData?.admittingDoctor   || "",
        consultingDoctor:  admData?.consultingDoctor  || "",
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

  // ─── Fetch + enrich medicine chart ─────────────────────────────────────────
  const fetchMedicineChart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(
        `${Hmsbaseurl}pharmacy_medicinechart/`,
        "POST",
        {}
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

          const pdMerge = pd ? {
            patient_details: {
              patient_name: `${pd.salutation || ""} ${pd.firstName || ""} ${pd.lastName || ""}`.trim(),
              address:      pd.permanent_address || pd.area || "",
              mobile:       pd.mobilePhone || pd.mobile || "",
            },
            patient_name:  `${pd.salutation || ""} ${pd.firstName || ""} ${pd.lastName || ""}`.trim(),
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

  // ─── Date filter ───────────────────────────────────────────────────────────
  const filteredData = medicineData.filter((patient) => {
    const raw = patient.ward_request_date || patient.created_date;
    if (!raw) return true;
    const wardDate = new Date(raw).toLocaleDateString("en-CA");
    if (fromDate && wardDate < fromDate) return false;
    if (toDate   && wardDate > toDate)   return false;
    return true;
  });

  const handleToggleMedicines = (key) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  // ─── Convert to Bill — ONE per bill (patient-level action) ─────────────────
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

    onConvertToBill({ ...patient, medicine_items: items });
  }, [onConvertToBill, HmsBaseUrl]);

  // ─── Fetch pharmacy stock ──────────────────────────────────────────────────
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
            mrp:             parseFloat(item.mrp || 0),
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

  // ─── Open substitute modal — per individual item ──────────────────────────
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

  // ─── Confirm substitution ─────────────────────────────────────────────────
  const handleSubstituteConfirm = async () => {
    if (!substSelected || !substituteModal) return;

    const { billId, originalItemId, originalItem } = substituteModal;

    if (!originalItem) {
      console.error("Substitute: original item snapshot missing");
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <Wrapper>
        {/* ── Header ── */}
        <Header>
          <TitleBlock>
            <Title>
              <TitleIcon>💊</TitleIcon>
              Pharmacy Medicine Chart
            </Title>
            <Subtitle>Ward prescriptions &amp; dispensing tracker</Subtitle>
          </TitleBlock>

          <Controls>
            <DateGroup>
              <DateLabel>
                From
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </DateLabel>
              <DateSep>→</DateSep>
              <DateLabel>
                To
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </DateLabel>
            </DateGroup>

            <RefreshBtn onClick={fetchMedicineChart} disabled={loading}>
              {loading ? <SpinIcon>↻</SpinIcon> : "↻"} Refresh
            </RefreshBtn>
          </Controls>
        </Header>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <TableCard>
          <StyledTable>
            <Thead>
              <tr>
                <th>Print</th>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Address</th>
                <th>Ward / Room</th>
                <th>IP Number</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Bill</th>
                <th>Medicines</th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10">
                    <LoadingState>Loading medicine chart…</LoadingState>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10">
                    <EmptyState>No records found for the selected date range</EmptyState>
                  </td>
                </tr>
              ) : (
                filteredData.map((patient) => {
                  const patientKey = getBillKey(patient);
                  const isExpanded = expandedKey === patientKey;
                  const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];

                  return (
                    <React.Fragment key={patientKey}>
                      {/* ── Patient Row ── */}
                      <PatientRow
                        $active={isExpanded}
                        onClick={() => handleToggleMedicines(patientKey)}
                      >
                        <PrintIcon>
                          <PrintIconBtn
                            title="Print prescription"
                            onClick={(e) => { e.stopPropagation(); setPrintPatient(patient); }}
                          >
                            🖨
                          </PrintIconBtn>
                        </PrintIcon>

                        <UHIDCell>{patient.uhid}</UHIDCell>

                        <td style={{ fontWeight: isExpanded ? 700 : 500 }}>
                          {patient.patient_details?.patient_name || patient.patient_name || `Patient (${patient.uhid})`}
                        </td>

                        <td style={{ color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {patient.patient_details?.address || patient.address || "—"}
                        </td>

                        <td>{patient.ward_name || patient.room_no || "—"}</td>

                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.77rem" }}>
                          {patient.inpatient_number || patient.ip_number || "—"}
                        </td>

                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.77rem" }}>
                          {patient.patient_details?.mobile || patient.mobile || "—"}
                        </td>

                        <td>
                          {patient.billing_status ? (
                            <BillingStatusBadge $status={patient.billing_status}>
                              {patient.billing_status}
                            </BillingStatusBadge>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>

                        {/* Convert to Bill — ONE button per bill (patient row) */}
                        <td>
                          <ConvertBillBtn
                            title="Convert entire prescription to a single bill"
                            onClick={(e) => handleConvertToBillSafe(patient, e)}
                          >
                            🧾 To Bill
                          </ConvertBillBtn>
                        </td>

                        <td>
                          <MedicinesBtn
                            $active={isExpanded}
                            onClick={(e) => { e.stopPropagation(); handleToggleMedicines(patientKey); }}
                          >
                            💊 {items.length} {isExpanded ? "▲" : "▼"}
                          </MedicinesBtn>
                        </td>
                      </PatientRow>

                      {/* ── Expandable Medicine Detail Panel ── */}
                      {isExpanded && (
                        <DetailPanel onClick={(e) => e.stopPropagation()}>
                          <DetailCell colSpan="10">
                            <DetailInner>
                              <DetailHeader>
                                <DetailLabel>Medicine Items</DetailLabel>
                                <ItemCount>{items.length} item{items.length !== 1 ? "s" : ""}</ItemCount>
                              </DetailHeader>

                              <ItemTable>
                                <ItemThead>
                                  <tr>
                                    <th>Item Name</th>
                                    <th>Qty</th>
                                    <th>Stock</th>
                                    <th>Dosage</th>
                                    <th>Ward Request Date</th>
                                    <th>Time</th>
                                    {/* Substitute is per-item — standalone column */}
                                    <th>Substitute</th>
                                  </tr>
                                </ItemThead>
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

                                      const stockLow      = item.available_stock !== undefined && item.available_stock < 10;
                                      const isSubstituted = item.is_substitute || item.substituted;
                                      const dotType =
                                        isSubstituted     ? "substitute" :
                                        item.is_emergency ? "emergency"  :
                                        item.is_insurance ? "insurance"  :
                                        "regular";

                                      return (
                                        <ItemRow key={`${item.item_id ?? i}-${i}`}>
                                          <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                              <StatusDot $type={dotType} />
                                              <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                                {item.item_name || item.medicine_name || "—"}
                                              </span>
                                              {isSubstituted && (
                                                <SubstituteBadge>⇄ Subst.</SubstituteBadge>
                                              )}
                                            </div>
                                          </td>

                                          <td><QtyBadge>{item.qty ?? item.quantity ?? "—"}</QtyBadge></td>

                                          <td>
                                            {item.available_stock !== undefined && item.available_stock !== null ? (
                                              <StockBadge $low={stockLow}>{item.available_stock}</StockBadge>
                                            ) : (
                                              <span style={{ color: "#cbd5e1" }}>—</span>
                                            )}
                                          </td>

                                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.77rem", color: "#475569" }}>
                                            {item.dosage || item.dose || <span style={{ color: "#cbd5e1" }}>—</span>}
                                          </td>

                                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.77rem", color: "#64748b" }}>
                                            {wardDateStr}
                                          </td>

                                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.77rem", color: "#64748b" }}>
                                            {wardTimeStr}
                                          </td>

                                          {/* Substitute — per item, standalone button */}
                                          <td>
                                            <SubstBtn
                                              title={`Substitute ${item.item_name || "this item"}`}
                                              onClick={(e) => openSubstituteModal(patient, item, e)}
                                            >
                                              ⇄ Substitute
                                            </SubstBtn>
                                          </td>
                                        </ItemRow>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan="7">
                                        <EmptyState style={{ padding: "24px" }}>
                                          No medicine items found.
                                        </EmptyState>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </ItemTable>
                            </DetailInner>
                          </DetailCell>
                        </DetailPanel>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </TableCard>

        {/* Legend */}
        <Legend>
          <span style={{ fontWeight: 700, color: T.slate, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Legend</span>
          <LegendItem><StatusDot $type="substitute" /> Substitute Given</LegendItem>
          <LegendItem><StatusDot $type="emergency"  /> Emergency</LegendItem>
          <LegendItem><StatusDot $type="insurance"  /> Insurance</LegendItem>
          <LegendItem><StatusDot $type="regular"    /> Regular</LegendItem>
        </Legend>
      </Wrapper>

      {/* ── Substitute Modal (per individual item) ── */}
      {substituteModal && createPortal(
        <SubstOverlay onClick={() => setSubstituteModal(null)}>
          <SubstModalBox onClick={e => e.stopPropagation()}>
            <SubstModalHeader>
              <SubstModalTitle>⇄ Substitute Medicine</SubstModalTitle>
              <SubstCloseX onClick={() => setSubstituteModal(null)}>✕</SubstCloseX>
            </SubstModalHeader>
            <SubstBody>
              <SubstOriginalInfo>
                <span style={{ fontSize: "1rem" }}>🔁</span>
                Replacing: <span>{substituteModal.originalItemName || `Item ID ${substituteModal.originalItemId}`}</span>
              </SubstOriginalInfo>

              <SubstFieldLabel>Search Replacement</SubstFieldLabel>
              <SubstInputWrapper>
                <SubstInput
                  type="text"
                  autoComplete="off"
                  placeholder="Type at least 2 letters to search…"
                  value={substSearch}
                  onChange={e => {
                    setSubstSearch(e.target.value);
                    setSubstDropOpen(true);
                    if (!e.target.value) setSubstSelected(null);
                  }}
                  onFocus={() => substSearch.length >= 2 && setSubstDropOpen(true)}
                />
                {substDropOpen && substSuggestions.length > 0 && (
                  <SubstDropList>
                    {substSuggestions.map((med, idx) => (
                      <SubstDropItem
                        key={`${med.item_id}-${idx}`}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSubstSelected(med);
                          setSubstSearch(med.name);
                          setSubstDropOpen(false);
                        }}
                      >
                        {med.name}
                      </SubstDropItem>
                    ))}
                  </SubstDropList>
                )}
              </SubstInputWrapper>

              {substSelected && (
                <SubstSelectedTag>
                  💊 {substSelected.name}
                  <SubstTagClose
                    title="Remove"
                    onClick={() => { setSubstSelected(null); setSubstSearch(""); }}
                  >
                    ✕
                  </SubstTagClose>
                </SubstSelectedTag>
              )}
            </SubstBody>
            <SubstFooter>
              <SubstCloseBtn onClick={() => setSubstituteModal(null)}>Cancel</SubstCloseBtn>
              <SubstConfirmBtn disabled={!substSelected} onClick={handleSubstituteConfirm}>
                ⇄ Confirm Substitute
              </SubstConfirmBtn>
            </SubstFooter>
          </SubstModalBox>
        </SubstOverlay>,
        document.body
      )}

      {/* ── Print Modal ── */}
      {printPatient && (() => {
        const p     = printPatient;
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

        const handlePrint = () => {
          const printWindow = window.open("", "_blank", "width=800,height=600");
          const html = `
            <html><head><title>Ward Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 24px; }
              .hosp-header { display: flex; align-items: flex-start; gap: 14px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 10px; }
              .hosp-name { font-size: 18px; font-weight: 800; color: #0f766e; }
              .hosp-sub { font-size: 12px; color: #666; }
              .section-title { background: #e5e7eb; text-align: right; padding: 3px 10px; font-weight: 700; font-size: 12px; margin-bottom: 10px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-bottom: 10px; }
              .meta-row { display: flex; gap: 6px; font-size: 12px; }
              .meta-key { color: #666; min-width: 80px; }
              .meta-val { font-weight: 600; }
              .bold { font-weight: 700; margin-bottom: 4px; }
              .doctor { font-weight: 700; color: #0f766e; margin-bottom: 14px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { border: 1px solid #ccc; padding: 6px 8px; background: #f3f4f6; text-align: left; }
              td { border: 1px solid #e5e7eb; padding: 6px 8px; }
            </style></head><body>
            <div class="hosp-header">
              <div>
                <div class="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                <div class="hosp-sub">51/24, Saradha College Road, Salem - 636007</div>
                <div class="hosp-sub">Ph: 04272706666</div>
              </div>
            </div>
            <div class="section-title">**Ward Prescription Details</div>
            <div class="meta-grid">
              <div class="meta-row"><span class="meta-key">UHID</span><span>:</span><span class="meta-val">${p.uhid || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Age/Gender</span><span>:</span><span class="meta-val">${p.age || "—"} / ${p.gender || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Name</span><span>:</span><span class="meta-val">${p.patient_details?.patient_name || p.patient_name || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Req Ref</span><span>:</span><span class="meta-val">${p.Bill_id || p.bill_no || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Address</span><span>:</span><span class="meta-val">${p.patient_details?.address || p.address || "—"}</span></div>
              <div class="meta-row"><span class="meta-key">Ward Name</span><span>:</span><span class="meta-val">${p.ward_name || p.room_no || "—"}</span></div>
            </div>
            <div class="bold">${wardDateStr} &nbsp; ${wardTimeStr}</div>
            <div class="doctor">Dr. ${p.doctor_name || "—"}</div>
            <table>
              <thead><tr><th>Sl</th><th>Brand Name</th><th>Dosage</th><th>Qty</th><th>Remarks</th></tr></thead>
              <tbody>
                ${items.map((item, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${item.item_name || item.medicine_name || "—"}${item.is_substitute || item.substituted ? " (Substituted)" : ""}</td>
                    <td>${item.dosage || item.dose || "—"}</td>
                    <td>${item.qty ?? item.quantity ?? "—"}</td>
                    <td>${item.remark || ""}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body></html>`;
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        };

        return createPortal(
          <PrintOverlay onClick={() => setPrintPatient(null)}>
            <PrintModalBox onClick={e => e.stopPropagation()}>
              <PrintModalHeader>
                <PrintModalTitle>🖨 Ward Prescription</PrintModalTitle>
                <PrintCloseBtn onClick={() => setPrintPatient(null)}>✕</PrintCloseBtn>
              </PrintModalHeader>
              <PrintContent>
                <PrintHospitalHeader>
                  <PrintHospitalLogo>🏥</PrintHospitalLogo>
                  <PrintHospitalInfo>
                    <PrintHospitalName>SHANMUGA HOSPITAL LIMITED</PrintHospitalName>
                    <PrintHospitalSub>51/24, Saradha College Road, Salem - 636007</PrintHospitalSub>
                    <PrintHospitalSub>Ph: 04272706666</PrintHospitalSub>
                  </PrintHospitalInfo>
                </PrintHospitalHeader>

                <PrintSectionTitle>** Ward Prescription Details</PrintSectionTitle>

                <PrintMetaGrid>
                  <PrintMetaRow>
                    <PrintMetaKey>UHID</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.uhid || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Age/Gender</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.age || "—"} / {p.gender || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Name</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.patient_details?.patient_name || p.patient_name || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Req Ref</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.Bill_id || p.bill_no || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Address</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.patient_details?.address || p.address || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Ward Name</PrintMetaKey><span>:</span>
                    <PrintMetaVal>{p.ward_name || p.room_no || "—"}</PrintMetaVal>
                  </PrintMetaRow>
                </PrintMetaGrid>

                <PrintDateRow>{wardDateStr} &nbsp; {wardTimeStr}</PrintDateRow>
                <PrintDoctorRow>Dr. {p.doctor_name || "—"}</PrintDoctorRow>

                <PrintItemTable>
                  <thead>
                    <tr>
                      <PrintItemTh>Sl</PrintItemTh>
                      <PrintItemTh>Brand Name</PrintItemTh>
                      <PrintItemTh>Dosage</PrintItemTh>
                      <PrintItemTh>Qty</PrintItemTh>
                      <PrintItemTh>Remarks</PrintItemTh>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <PrintItemTd>{i + 1}</PrintItemTd>
                        <PrintItemTd style={{ fontWeight: 600 }}>
                          {item.item_name || item.medicine_name || "—"}
                          {(item.is_substitute || item.substituted) && (
                            <span style={{ marginLeft: 6, color: "#4f46e5", fontSize: "0.75rem" }}>(Substituted)</span>
                          )}
                        </PrintItemTd>
                        <PrintItemTd>{item.dosage || item.dose || "—"}</PrintItemTd>
                        <PrintItemTd>{item.qty ?? item.quantity ?? "—"}</PrintItemTd>
                        <PrintItemTd>{item.remark || ""}</PrintItemTd>
                      </tr>
                    ))}
                  </tbody>
                </PrintItemTable>
              </PrintContent>
              <PrintFooterBtns>
                <CancelBtn onClick={() => setPrintPatient(null)}>Cancel</CancelBtn>
                <PrintBtn onClick={handlePrint}>🖨 Print</PrintBtn>
              </PrintFooterBtns>
            </PrintModalBox>
          </PrintOverlay>,
          document.body
        );
      })()}
    </>
  );
};

export default MedicineChart;