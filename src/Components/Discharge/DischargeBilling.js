import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes, createGlobalStyle } from "styled-components";

import DischargeViewBills from "./DischargeViewBills";
import DischargeViewEstimates from "./DischargeViewEstimates";
import PatientSearchModal from "../Common/PatientSearchModal";
import DischargeBillPrintModal from "./DischargeBillPrintModal";
import SearchSelect from "../Common/SearchSelect";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#0f766e",
  amber: "#d97706",
  danger: "#dc2626",
  success: "#16a34a",
  blue: "#2563eb",
  border: "#e2e8f0",
  bg: "#f8fafc",
  surface: "#ffffff",
  textMain: "#0f172a",
  textMid: "#475569",
  textMuted: "#94a3b8",
  radius: "8px",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.10)",
};

const slideDown = keyframes`from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}`;
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}`;
const spin = keyframes`to{transform:rotate(360deg);}`;

const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:${T.bg};color:${T.textMain};}
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageWrap = styled.div`min-height: 100vh; background: #f8fafc;`;
const AppBar = styled.header`
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  height: 52px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 2px 10px rgba(15, 118, 110, 0.2);
`;
const AppTitle = styled.div`color: #fff; font-weight: 700; font-size: 0.94rem; display: flex; align-items: center; gap: 8px;`;
const Content = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 14px 18px 48px;
  box-sizing: border-box;
  @media (max-width: 1366px) {
    padding: 10px 12px 36px;
  }
  @media (max-width: 768px) { padding: 8px; }
`;

const TabBar = styled.div`
  display: flex; gap: 6px; margin-bottom: 16px;
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: 10px; padding: 5px; width: fit-content;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;
const Tab = styled.button`
  padding: 8px 20px; border: none; border-radius: 7px; cursor: pointer;
  font-size: 0.84rem; font-weight: 600; transition: all 0.18s ease; display: flex; align-items: center; gap: 7px;
  background: ${p => p.$active ? "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" : "transparent"};
  color: ${p => p.$active ? "#fff" : T.textMid};
  box-shadow: ${p => p.$active ? "0 2px 6px rgba(15,118,110,0.3)" : "none"};
  &:hover {
    background: ${p => p.$active ? "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" : "#f1f5f9"};
    color: ${p => p.$active ? "#fff" : T.textMain};
  }
`;

const Card = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: 12px; box-shadow: 0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03);
  margin-bottom: 16px; overflow: hidden; animation: ${fadeUp} 0.2s ease;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  &:hover { box-shadow: 0 4px 16px rgba(15,23,42,0.08); border-color: #cbd5e1; }
`;
const CardHead = styled.div`
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid ${T.border}; padding: 11px 18px;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
`;
const CardTitle = styled.span`
  font-size: 0.76rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.7px; color: ${T.primary};
  display: flex; align-items: center; gap: 8px;
  &::before {
    content: ''; display: inline-block; width: 4px; height: 14px;
    background: ${T.primary}; border-radius: 2px;
  }
`;

const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 4px 11px;
  border-radius: 20px; font-size: 0.7rem; font-weight: 700;
  background: ${p => ({ estimate: "#fef3c7", billed: "#dcfce7", pending: "#dbeafe", manual: "#f1f5f9", converting: "#ede9fe" }[p.$v] || "#f1f5f9")};
  color: ${p => ({ estimate: T.amber, billed: T.success, pending: T.blue, manual: T.textMuted, converting: "#7c3aed" }[p.$v] || T.textMuted)};
`;

const ReqCountBadge = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 800;
  background: ${p => (p.$active ? "rgba(255,255,255,0.24)" : "#dcfce7")};
  color: ${p => (p.$active ? "#fff" : "#15803d")};
`;

const TTBar = styled.div`
  padding: 12px 18px; background: #fff; border-bottom: 1px solid ${T.border};
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
`;

const TableSelect = styled.select`
  height: 32px; padding: 0 8px; border: 1px solid ${T.border};
  border-radius: 6px; font-size: 0.82rem; font-weight: 600;
  color: ${T.textMain}; background: #fff; outline: none; cursor: pointer;
  &:focus { border-color: ${T.primary}; }
`;

const TWrap = styled.div`overflow-x: auto; width: 100%;`;

const Tbl = styled.table`width: 100%; border-collapse: collapse; font-size: 0.83rem;`;

const Thead = styled.thead`background: #f8fafc; border-bottom: 1.5px solid ${T.border};`;

const SortTh = styled.th`
  padding: 10px 14px; text-align: left; font-size: 0.72rem; font-weight: 800;
  color: ${T.textMid}; text-transform: uppercase; letter-spacing: 0.5px;
  white-space: nowrap; cursor: pointer; user-select: none;
  &:hover { color: ${T.primary}; }
`;

const Th = styled.th`
  padding: 10px 14px; text-align: left; font-size: 0.72rem; font-weight: 800;
  color: ${T.textMid}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f1f5f9; transition: background 0.12s;
  &:hover { background: #f8fafc; }
`;

const Td = styled.td`padding: 11px 14px; color: ${T.textMain}; vertical-align: middle;`;

const ConvertActionBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 7px;
  border: 1px solid #bbf7d0; background: #f0fdf4; color: #16a34a;
  cursor: pointer; transition: all 0.15s ease;
  &:hover {
    background: #16a34a; color: #fff; border-color: #16a34a;
    transform: translateY(-1px); box-shadow: 0 2px 6px rgba(22,163,74,0.28);
  }
  &:active { transform: translateY(0); }
`;

const Pager = styled.div`
  padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px; background: #f8fafc; border-top: 1px solid ${T.border};
  font-size: 0.78rem; color: ${T.textMid};
`;

const PB = styled.button`
  padding: 5px 10px; min-width: 30px; border-radius: 6px;
  border: 1px solid ${p => (p.$active ? T.primary : T.border)};
  background: ${p => (p.$active ? T.primary : "#fff")};
  color: ${p => (p.$active ? "#fff" : T.textMain)};
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const Toast = styled.div`
  position: fixed; top: 14px; right: 16px; z-index: 9999;
  padding: 10px 18px; border-radius: ${T.radius}; color: #fff;
  font-weight: 600; font-size: 0.84rem; max-width: 380px;
  background: ${p => p.$err ? T.danger : T.success};
  box-shadow: ${T.shadowMd}; animation: ${slideDown} 0.2s ease;
`;

const FG = styled.div`display: flex; flex-direction: column; gap: 4px; width: 100%; min-width: 0;`;
const FL = styled.label`font-size: 0.68rem; font-weight: 700; color: ${T.textMid}; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;`;
const Req = styled.span`color: ${T.danger}; margin-left: 2px;`;
const FInput = styled.input`
  height: 34px; padding: 0 10px; font-size: 0.84rem; box-sizing: border-box; width: 100%; min-width: 0;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s, box-shadow 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor: pointer; }
  &::placeholder { color: ${T.textMuted}; }
`;
const FSelect = styled.select`
  height: 34px; padding: 0 10px; font-size: 0.84rem; box-sizing: border-box; width: 100%; min-width: 0;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s; cursor: pointer;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &:disabled { background: #f8fafc; color: ${T.textMuted}; cursor: not-allowed; }
`;

const Btn = styled.button`
  height: ${p => p.$sm ? "32px" : "38px"}; padding: 0 ${p => p.$sm ? "14px" : "20px"};
  border-radius: 7px; font-size: ${p => p.$sm ? "0.78rem" : "0.84rem"};
  font-weight: 700; cursor: pointer; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.15s ease;
  ${p => p.$primary && `background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color:#fff; border-color:transparent; box-shadow: 0 2px 6px rgba(15,118,110,0.25);`}
  ${p => p.$amber && `background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color:#fff; border-color:transparent; box-shadow: 0 2px 6px rgba(217,119,6,0.25);`}
  ${p => p.$ghost && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p => p.$purple && `background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color:#fff; border-color:transparent; box-shadow: 0 2px 6px rgba(124,58,237,0.25);`}
  &:hover { opacity: 0.92; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
`;
const IconBtn = styled.button`
  width: 34px; height: 34px; border-radius: 6px; border: none; flex-shrink: 0;
  background: ${T.primary}; color: #fff; cursor: pointer; font-size: 0.88rem;
  display: flex; align-items: center; justify-content: center; transition: opacity 0.12s;
  &:hover { opacity: 0.88; } &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Spinner = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const MiniSpinner = styled.div`
  width: 10px; height: 10px; border: 2px solid #94a3b8;
  border-top-color: ${T.primary}; border-radius: 50%;
  animation: ${spin} 0.6s linear infinite; display: inline-block;
`;

const SearchSectionWrap = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TopSearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const SearchInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const SearchActionBtn = styled.button`
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 32px;
  border-radius: 5px;
  border: none;
  background: ${T.primary};
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  transition: all 0.15s ease;
  &:hover { background: #0d9488; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PatientProfileCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%);
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(15, 118, 110, 0.04);
  min-width: 0;
  box-sizing: border-box;
`;

const PatientAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);
`;

const PatientMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 220px;
`;

const PatientNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PatientNameText = styled.span`
  font-size: 1.02rem;
  font-weight: 800;
  color: ${T.textMain};
  letter-spacing: -0.2px;
`;

const PatientMetaPills = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: ${T.textMid};
  flex-wrap: wrap;
`;

const MetaChip = styled.span`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2px 7px;
  border-radius: 5px;
  font-family: ${p => p.$mono ? "monospace" : "inherit"};
  font-size: 0.74rem;
  font-weight: 600;
  color: ${T.textMain};
`;

const PatientMetrics2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const MetricBox = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const MetricLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
`;

const MetricVal = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${T.textMain};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const PatientEmptyState = styled.div`
  padding: 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  color: ${T.textMid};
  font-size: 0.83rem;
  font-weight: 500;
  min-height: 140px;
`;

const WardWarningPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fef9c3;
  border: 1px solid #fde047;
  color: #854d0e;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
`;

// ─── Items table ──────────────────────────────────────────────────────────────
const TScrollWrap = styled.div`
  overflow-x: auto; overflow-y: visible; width: 100%; box-sizing: border-box;
  &::-webkit-scrollbar { height: 5px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
const ITable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  table-layout: fixed;
  box-sizing: border-box;
`;
const ITHead = styled.thead`background: #f8fafc;`;
const ITH = styled.th`
  padding: 8px 4px; text-align: ${p => p.$align || "left"}; font-size: 0.67rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px; color: ${T.textMid};
  border-bottom: 2px solid ${T.border}; white-space: nowrap; box-sizing: border-box;
  overflow: hidden; text-overflow: ellipsis;
`;
const ITR = styled.tr`border-bottom: 1px solid ${T.border}; &:hover { background: #f8fafc; }`;
const AddRow = styled.tr`background: #fffdf5; border-bottom: 2px solid ${T.amber};`;
const ITD = styled.td`
  padding: 5px 3px; color: ${T.textMain}; vertical-align: middle; overflow: visible; position: relative;
  text-align: ${p => p.$align || "left"}; box-sizing: border-box;
`;
const TInput = styled.input`
  width: 100%; min-width: 0; box-sizing: border-box; height: 29px; padding: 3px 5px; font-size: 0.78rem;
  border: 1px solid ${T.border}; border-radius: 5px; outline: none;
  background: ${p => p.$ro ? "#f8fafc" : "#fff"}; color: ${p => p.$ro ? T.textMuted : T.textMain};
  text-align: ${p => p.$align || "left"}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;
const EmptyRow = styled.div`text-align: center; padding: 30px; color: ${T.textMuted}; font-size: 0.84rem;`;

// ─── Item search autocomplete ─────────────────────────────────────────────────
const SuggestionItem = styled.div`
  padding: 7px 10px; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  &:hover { background: #e6f7f5; }
`;
const SugName = styled.span`font-weight: 600; color: ${T.textMain};`;
const SugPrice = styled.span`font-size: 0.74rem; color: ${T.success}; font-weight: 700;`;
const SugEmpty = styled.div`padding: 10px; text-align: center; font-size: 0.78rem; color: ${T.textMuted};`;

// ─── Bill type bar ────────────────────────────────────────────────────────────
const BillTypeBar = styled.div`
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
  padding: 10px 16px; background: #f0fdf4; border-bottom: 1px solid #bbf7d0;
`;

// ─── Financials ───────────────────────────────────────────────────────────────
const FinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid ${T.border};
  box-sizing: border-box;
  width: 100%;
  @media(max-width: 1140px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media(max-width: 640px) { grid-template-columns: 1fr; gap: 10px; padding: 10px; }
`;
const FinCol = styled.div`
  background: #fff;
  border: 1px solid ${T.border};
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  min-width: 0;
  box-sizing: border-box;
`;
const FinCardTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${T.textMid};
  padding-bottom: 6px;
  border-bottom: 1px solid ${T.border};
  display: flex;
  align-items: center;
  gap: 6px;
`;
const FinRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;
const FinLbl = styled.span`
  min-width: 100px;
  color: ${T.textMid};
  font-weight: 600;
  font-size: 0.74rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;
const FinIn = styled.input`
  flex: 1;
  height: 32px;
  padding: 0 8px;
  font-size: 0.83rem;
  box-sizing: border-box;
  border: 1px solid ${T.border};
  border-radius: 6px;
  outline: none;
  text-align: ${p => p.$align || "right"};
  min-width: 0;
  width: 100%;
  background: ${p => p.$ro ? "#f8fafc" : "#fff"};
  color: ${T.textMain};
  font-weight: ${p => p.$ro ? 600 : 400};
  transition: border 0.12s, box-shadow 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
  ${p => p.$net && `
    font-weight: 700;
    font-size: 0.92rem;
    color: ${p.$refund ? T.danger : T.success};
    background: ${p.$refund ? "#fef2f2" : "#f0fdf4"};
    border-color: ${p.$refund ? "#fecaca" : "#86efac"};
  `}
`;
const Rupee = styled.span`color: ${T.textMuted}; font-size: 0.75rem; flex-shrink: 0; font-weight: 600;`;
const NetBadgeBox = styled.div`
  margin-top: auto;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${p => p.$refund ? "#fff1f2" : "#f0fdf4"};
  border: 1.5px solid ${p => p.$refund ? "#fecdd3" : "#bbf7d0"};
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  text-align: center;
`;
const FinActions = styled.div`
  display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 14px 18px;
  background: #fafafa; border-top: 1px solid ${T.border}; flex-wrap: wrap; width: 100%; box-sizing: border-box;
  @media(max-width: 600px) {
    justify-content: stretch;
    & > button { flex: 1; }
  }
`;
const ActiveBanner = styled.div`
  background: #fef9c3;
  border: 1.5px solid #fde047;
  border-radius: 7px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: #713f12;
  font-weight: 500;
  margin-bottom: 12px;
`;

// ═════════════════════════════════════════════════════════════════════════════
// Constants & Helpers
// ═════════════════════════════════════════════════════════════════════════════

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount: "", sales_return: "", medicines: "", implant_amount: "", taxable: "", non_tax: "",
  gst_amount: "", room_tax: "",
  discount_percent: "", discount_amount: "", disc_reason: "", remarks: "",
  next_visit_date: "",
  bill_upto: new Date().toISOString().split("T")[0],
};
const EMPTY_ITEM = {
  itemName: "", code: "", nabh_code: "", nabh_rate: null, non_nabh_rate: null,
  rate_category: "NABH", quantity: 1, rate: "", discount: 0, amount: 0,
  doctor: "", doctor_fee: "", item_description: "", package_name: "",
  billTypeNo: "DIS01", bill_type: 2
};

const fmt = v => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const formatAdmissionDate = str => {
  if (!str) return "—";
  if (/^\d{2}-\d{2}-\d{4}/.test(str)) return str;
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hrsStr = String(hours).padStart(2, "0");
    return `${day}-${month}-${year} ${hrsStr}:${minutes} ${ampm}`;
  } catch {
    return str;
  }
};

const getInitials = name => {
  if (!name) return "PT";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const calcTotals = (items, f) => {
  const itemsTotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const medicines = parseFloat(f.medicines) || 0;
  const implantAmount = parseFloat(f.implant_amount) || 0;
  const gstAmount = parseFloat(f.gst_amount) || 0;
  const roomTax = parseFloat(f.room_tax) || 0;
  const taxable = parseFloat(f.taxable) || 0;

  // Gross Bill Total = Items + Medicines + Implants + GST + Room Tax + Taxable
  const grossTotal = itemsTotal + medicines + implantAmount + gstAmount + roomTax + taxable;

  const discPct = parseFloat(f.discount_percent) || 0;
  const discAmt = parseFloat(f.discount_amount) || (itemsTotal * discPct / 100);
  const totalDisc = discAmt;

  const advanceAmount = parseFloat(f.advance_amount) || 0;
  const salesReturn = parseFloat(f.sales_return) || 0;

  // Total Charges after discount = grossTotal - totalDisc
  const totalCharges = grossTotal - totalDisc;

  // Net Amount = Total Charges - Advance Amount - Sales Return
  // (If advance > totalCharges, netAmount will be negative -> Net Amount(Refund))
  const netAmount = totalCharges - advanceAmount - salesReturn;

  return { itemsTotal, totalAmount: grossTotal, grossTotal, discAmt, totalDisc, netAmount, totalCharges };
};

const buildPayload = (items, f, totals, status, patient, editReason = "", insurance = null, paymentMethod = "Cash") => ({
  status,
  billTypeNo: "DIS01",
  bill_type: 2,
  uhid: patient?.uhid || null,
  ip_number: patient?.ip_number || null,
  is_insurance_bill: Boolean(insurance?.isInsuranceBill),
  claim_number: insurance?.claimNumber || "",
  id_card_number: insurance?.idCardNumber || "",
  insurance_bill_number: insurance?.insuranceBillNumber || "",
  company_name: insurance?.companyName || patient?.company || "",
  items: items.map(({ _key, _fromInvest, _baseRate, _appliedWard, _rateCategory, ...r }) => ({
    ...r,
    billTypeNo: r.billTypeNo || "DIS01",
    bill_type: (r.bill_type != null && r.bill_type !== "") ? r.bill_type : 2,
    nabh_code: r.nabh_code || "",
    nabh_rate: r.nabh_rate != null ? r.nabh_rate : null,
    non_nabh_rate: r.non_nabh_rate != null ? r.non_nabh_rate : null,
    rate_category: r.rate_category || _rateCategory || "NABH",
  })),
  total_amount: totals.totalAmount,
  advance_amount: parseFloat(f.advance_amount) || 0,
  sales_return: parseFloat(f.sales_return) || 0,
  medicines_amount: parseFloat(f.medicines) || 0,
  implant_amount: parseFloat(f.implant_amount) || 0,
  taxable_amount: parseFloat(f.taxable) || 0,
  non_tax_amount: parseFloat(f.non_tax) || totals.totalAmount,
  gst_amount: parseFloat(f.gst_amount) || 0,
  room_tax: parseFloat(f.room_tax) || 0,
  discount_percent: parseFloat(f.discount_percent) || 0,
  discount_amount: totals.discAmt,
  disc_reason: f.disc_reason || "",
  total_disc: totals.totalDisc,
  net_amount: totals.netAmount,
  remarks: f.remarks || "",
  next_visit_date: f.next_visit_date || null,
  edit_reason: editReason || "",
  payment_method: status === "Estimate" ? null : (paymentMethod || f.payment_method || "Cash"),
});

const recalcItem = (item, field, value) => {
  const u = { ...item, [field]: value };
  const qty = parseFloat(field === "quantity" ? value : u.quantity) || 0;
  const rate = parseFloat(field === "rate" ? value : u.rate) || 0;
  const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
  if (field === "rate") {
    u._baseRate = rate;
    u._appliedWard = "CUSTOM";
  }
  if (["quantity", "rate", "discount"].includes(field)) u.amount = Math.max(0, qty * rate - disc);
  return u;
};

const investToRow = it => {
  const qty = parseFloat(it.quantity) || 1;
  const rate = parseFloat(it.rate != null ? it.rate : (it.price || 0)) || 0;
  const disc = parseFloat(it.discount) || 0;
  const amt = it.amount != null ? parseFloat(it.amount) : Math.max(0, qty * rate - disc);
  const isAccom = Boolean(
    (it.source && (it.source.includes("room_services") || it.source.includes("room_kits"))) ||
    (it.invest_bill_no && (it.invest_bill_no.startsWith("ROOM-") || it.invest_bill_no.startsWith("KIT-"))) ||
    /room|ward|nursing|maintenance|accommodation|bed|icu|ccu|day care|stay|admission fee/i.test(`${it.itemName || ""} ${it.item_description || ""}`)
  );
  return {
    itemName: it.itemName || "",
    code: it.code || it.item_code || (it.test_id != null ? String(it.test_id) : "") || (it.sl_no != null ? String(it.sl_no) : "") || "",
    nabh_code: it.nabh_code || it.nabhCode || "",
    quantity: qty,
    rate: rate,
    discount: disc,
    amount: amt,
    doctor: isAccom ? "" : (it.doctor || ""),
    doctor_fee: it.doctor_fee || "",
    doctors: Array.isArray(it.doctors) ? it.doctors : [],
    surgeon_id: it.surgeon_id || "",
    anaesthetist_id: it.anaesthetist_id || "",
    anesthesia_id: it.anesthesia_id || "",
    additional_anaesthetists: it.additional_anaesthetists || null,
    additional_doctors: it.additional_doctors || null,
    bill_type: it.bill_type != null ? it.bill_type : "",
    billTypeNo: it.billTypeNo || "",
    item_description: (it.item_description && it.item_description !== it.billTypeNo && it.item_description !== "DIS01" && !String(it.item_description).startsWith("DIS0")) ? it.item_description : "",
    package_name: it.package_name || "",
    invest_bill_no: it.invest_bill_no || "",
    bill_object_id: it.bill_object_id || "",
    payment_status: it.payment_status || "",
    test_id: it.test_id ?? null,
    source: it.source || "investbilling",
    _key: `inv_${it.test_id || it.itemName}_${Date.now()}_${Math.random()}`,
    _fromInvest: true,
  };
};

const parseItems = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const estToForm = e => ({
  advance_amount: String(parseFloat(e.advance_amount) || ""),
  sales_return: String(parseFloat(e.sales_return) || ""),
  medicines: String(parseFloat(e.medicines_amount) || ""),
  implant_amount: String(parseFloat(e.implant_amount) || ""),
  taxable: String(parseFloat(e.taxable_amount) || ""),
  non_tax: String(parseFloat(e.non_tax_amount) || ""),
  gst_amount: String(parseFloat(e.gst_amount) || ""),
  room_tax: String(parseFloat(e.room_tax) || ""),
  discount_percent: String(parseFloat(e.discount_percent) || ""),
  discount_amount: String(parseFloat(e.discount_amount) || ""),
  disc_reason: e.disc_reason || "",
  remarks: e.remarks || "",
  next_visit_date: e.next_visit_date
    ? new Date(e.next_visit_date).toISOString().split("T")[0]
    : "",
  bill_upto: e.bill_date
    ? new Date(e.bill_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
});

// ─── Normalise items from API ─────────────────────────────────────────────────
const normaliseItems = (list) =>
  (Array.isArray(list) ? list : []).filter(it => it && it.is_active !== false).map(it => {
    if (it.price != null) return it;
    const priceKey = Object.keys(it).find(
      k => k !== "itemName" && k !== "_id" && !isNaN(Number(k))
    );
    return { ...it, price: priceKey ? it[priceKey] : "" };
  });

// ═════════════════════════════════════════════════════════════════════════════
// ItemSearchInput
// ═════════════════════════════════════════════════════════════════════════════

const ItemSearchInput = ({ value, onChange, onSelect, disabled, allItems = [], itemsLoading = false, billTypeName = "", rateCategory = "NABH" }) => {
  const [showSug, setShowSug] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 280 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const itemRefs = useRef([]);
  const isKeyboardNav = useRef(false);
  const lastMousePos = useRef({ x: -1, y: -1 });

  const filtered = useMemo(() => {
    if (!value.trim()) return allItems;
    const q = value.trim().toLowerCase();
    return allItems.filter(it => {
      const name = (it.itemName || it.name || "").toLowerCase();
      const nabh = (it.nabh_code || "").toLowerCase();
      const cat = (it.category || "").toLowerCase();
      const dept = (it.department || "").toLowerCase();
      return name.includes(q) || nabh.includes(q) || cat.includes(q) || dept.includes(q);
    });
  }, [allItems, value]);

  useEffect(() => {
    itemRefs.current = [];
    if (showSug && filtered.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [filtered, showSug]);

  // Precise scrolling on highlight change for Up and Down arrows
  useEffect(() => {
    if (showSug && highlightedIndex >= 0 && dropRef.current && itemRefs.current[highlightedIndex]) {
      const container = dropRef.current;
      const el = itemRefs.current[highlightedIndex];
      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
      } catch (e) {}
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      const cTop = container.scrollTop;
      const cBottom = cTop + container.clientHeight;
      if (elTop < cTop) {
        container.scrollTop = elTop;
      } else if (elBottom > cBottom) {
        container.scrollTop = elBottom - container.clientHeight;
      }
    }
  }, [highlightedIndex, showSug]);

  useEffect(() => {
    const onMouseDown = e => {
      const inInput = inputRef.current?.contains(e.target);
      const inDrop = dropRef.current?.contains(e.target);
      if (!inInput && !inDrop) setShowSug(false);
    };
    const onScroll = () => {
      if (inputRef.current) {
        const r = inputRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 3, left: r.left, width: r.width });
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const measure = () => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 3, left: r.left, width: r.width });
  };

  const handleChange = e => {
    onChange(e.target.value);
    measure();
    setShowSug(true);
  };

  const handleFocus = () => {
    measure();
    setShowSug(true);
  };

  const handleSelect = item => {
    onSelect(item);
    setShowSug(false);
  };

  const handleKeyDown = e => {
    if (!showSug && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setShowSug(true);
      measure();
      setHighlightedIndex(0);
      return;
    }

    if (showSug) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filtered.length === 0) return;
        isKeyboardNav.current = true;
        setHighlightedIndex(p => (p < 0 ? 0 : Math.min(filtered.length - 1, p + 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filtered.length === 0) return;
        isKeyboardNav.current = true;
        setHighlightedIndex(p => (p <= 0 ? 0 : p - 1));
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          e.preventDefault();
          handleSelect(filtered[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowSug(false);
      }
    }
  };

  const handleItemMouseMove = (idx, e) => {
    const dx = Math.abs(e.clientX - lastMousePos.current.x);
    const dy = Math.abs(e.clientY - lastMousePos.current.y);
    if (dx > 3 || dy > 3) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      isKeyboardNav.current = false;
      setHighlightedIndex(idx);
    }
  };

  const placeholder = itemsLoading ? "Loading items…" : allItems.length > 0 ? `Search ${allItems.length} items…` : "No items";

  return (
    <>
      <TInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSug && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: Math.max(dropPos.width, 440),
            background: "#fff",
            border: `1.5px solid #0d9488`,
            borderRadius: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            zIndex: 99999,
            maxHeight: "340px",
            overflowY: "auto",
          }}
        >
          {!itemsLoading && allItems.length > 0 && (
            <div style={{
              padding: "6px 12px", fontSize: "0.68rem", fontWeight: 700,
              color: T.surface, background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
              borderRadius: "5px 5px 0 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>📋 {billTypeName || "Items"} · Active Rate: {rateCategory === "NON_NABH" ? "🔹 Non-NABH" : "⭐ NABH"}</span>
              <span style={{ opacity: 0.85 }}>{value.trim() ? `${filtered.length} / ${allItems.length} matches` : `${allItems.length} items total`}</span>
            </div>
          )}

          {itemsLoading ? (
            <SugEmpty style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MiniSpinner />
                <span>Loading {billTypeName} items…</span>
              </div>
            </SugEmpty>
          ) : filtered.length === 0 ? (
            <SugEmpty>{allItems.length === 0 ? `No items found for ${billTypeName}` : `No match for "${value}" — try different keywords`}</SugEmpty>
          ) : (
            <>
              {value.trim() && filtered.length < allItems.length && (
                <div style={{ padding: "4px 12px", fontSize: "0.66rem", fontWeight: 600, color: T.textMuted, background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                  Showing top {filtered.length} of {allItems.length} items (Use ↑ / ↓ to navigate, Enter to choose)
                </div>
              )}
              {filtered.map((s, i) => {
                const sName = s.itemName || s.name || "";
                const hasNabh = s.nabh_rate != null && !isNaN(Number(s.nabh_rate)) && Number(s.nabh_rate) > 0;
                const hasNonNabh = s.non_nabh_rate != null && !isNaN(Number(s.non_nabh_rate)) && Number(s.non_nabh_rate) > 0;
                const isHigh = i === highlightedIndex;

                let sRate = s.price;
                if (rateCategory === "NON_NABH" && hasNonNabh) {
                  sRate = s.non_nabh_rate;
                } else if (hasNabh) {
                  sRate = s.nabh_rate;
                } else if (s.price != null && s.price !== "") {
                  sRate = s.price;
                } else {
                  sRate = s.rate || 0;
                }

                return (
                  <SuggestionItem
                    key={`${sName}-${s.nabh_code || ""}-${i}`}
                    ref={el => { itemRefs.current[i] = el; }}
                    onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                    onMouseMove={e => handleItemMouseMove(i, e)}
                    style={{
                      padding: "8px 12px",
                      background: isHigh ? "#0d9488" : "transparent",
                      color: isHigh ? "#ffffff" : T.textMain,
                      cursor: "pointer",
                      transition: "background .05s ease"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <SugName style={{ fontSize: "0.82rem", lineHeight: 1.3, color: isHigh ? "#ffffff" : T.textMain, fontWeight: isHigh ? 700 : 600 }}>{sName}</SugName>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                        {s.nabh_code && (
                          <span style={{
                            fontSize: "0.64rem", fontWeight: 700, padding: "1px 6px",
                            background: isHigh ? "#0f766e" : "#ecfdf5", color: isHigh ? "#ccfbf1" : "#065f46", border: `1px solid ${isHigh ? "#14b8a6" : "#a7f3d0"}`,
                            borderRadius: "4px", fontFamily: "monospace"
                          }}>
                            NABH: {s.nabh_code}
                          </span>
                        )}
                        {hasNabh && (
                          <span style={{
                            fontSize: "0.64rem", fontWeight: rateCategory === "NABH" ? 800 : 500, padding: "1px 6px",
                            background: isHigh ? "rgba(255,255,255,0.2)" : (rateCategory === "NABH" ? "#ccfbf1" : "#f0fdfa"),
                            color: isHigh ? "#ffffff" : "#0f766e", border: `1px solid ${isHigh ? "#ffffff" : (rateCategory === "NABH" ? "#0f766e" : "#99f6e4")}`,
                            borderRadius: "4px"
                          }}>
                            ⭐ NABH: ₹{parseFloat(s.nabh_rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        {hasNonNabh && (
                          <span style={{
                            fontSize: "0.64rem", fontWeight: rateCategory === "NON_NABH" ? 800 : 500, padding: "1px 6px",
                            background: isHigh ? "rgba(255,255,255,0.2)" : (rateCategory === "NON_NABH" ? "#dbeafe" : "#eff6ff"),
                            color: isHigh ? "#ffffff" : "#1d4ed8", border: `1px solid ${isHigh ? "#ffffff" : (rateCategory === "NON_NABH" ? "#2563eb" : "#bfdbfe")}`,
                            borderRadius: "4px"
                          }}>
                            🔹 Non-NABH: ₹{parseFloat(s.non_nabh_rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        {s.category && (
                          <span style={{
                            fontSize: "0.64rem", fontWeight: 600, padding: "1px 6px",
                            background: isHigh ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: isHigh ? "#e2e8f0" : "#475569", border: `1px solid ${isHigh ? "transparent" : "#e2e8f0"}`,
                            borderRadius: "4px"
                          }}>
                            {s.category}
                          </span>
                        )}
                        {s.package_name && (
                          <span style={{ fontSize: "0.64rem", color: isHigh ? "#ccfbf1" : T.primary, fontWeight: 700 }}>
                            {s.package_name}
                          </span>
                        )}
                        {isHigh && (
                          <span style={{ fontSize: "0.62rem", color: "#ccfbf1", fontWeight: 700, textTransform: "uppercase" }}>
                            ↵ Enter
                          </span>
                        )}
                      </div>
                    </div>
                    {sRate != null && String(sRate) !== "0" && String(sRate) !== "" && (
                      <SugPrice style={{ marginLeft: 10, fontSize: "0.82rem", flexShrink: 0, color: isHigh ? "#ffffff" : T.primary, fontWeight: 700 }}>
                        ₹{parseFloat(sRate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </SugPrice>
                    )}
                  </SuggestionItem>
                );
              })}
            </>
          )}
        </div>
      )}
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// FinancialGrid
// ═════════════════════════════════════════════════════════════════════════════

const FinancialGrid = ({ f, onChange, totals }) => {
  const isRefund = totals.netAmount < 0;

  return (
    <FinGrid>
      {/* Column 1: Charges & Advances */}
      <FinCol>
        <FinCardTitle>💳 Charges &amp; Credits</FinCardTitle>
        <FinRow>
          <FinLbl title="Sum of all procedure and service items">Items Total</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn $ro value={fmt(totals.itemsTotal != null ? totals.itemsTotal : totals.totalAmount)} readOnly />
        </FinRow>
        <FinRow>
          <FinLbl title="Pharmacy medicines charges to be added (+)">Medicines (+)</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.medicines}
            onChange={e => onChange("medicines", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl title="Surgery implant charges to be added (+)">Implants (+)</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.implant_amount}
            onChange={e => onChange("implant_amount", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl title="Advance amount received from patient to be subtracted (-)">
            Advance Amount (-) <span style={{ cursor: "help", fontSize: "0.75rem" }}>ℹ️</span>
          </FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.advance_amount}
            onChange={e => onChange("advance_amount", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl title="Sales return from pharmacy to be subtracted (-)">
            Sales Return (-) <span style={{ cursor: "help", fontSize: "0.75rem" }}>ℹ️</span>
          </FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.sales_return}
            onChange={e => onChange("sales_return", e.target.value)}
            placeholder="0"
          />
        </FinRow>
      </FinCol>

      {/* Column 2: Tax Breakdown */}
      <FinCol>
        <FinCardTitle>⚖️ Tax Breakdown</FinCardTitle>
        <FinRow>
          <FinLbl>Taxable</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.taxable}
            onChange={e => onChange("taxable", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl>Non Tax</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.non_tax !== "" ? f.non_tax : fmt(totals.totalAmount)}
            onChange={e => onChange("non_tax", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl>GST</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.gst_amount}
            onChange={e => onChange("gst_amount", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl>Room Tax</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.room_tax}
            onChange={e => onChange("room_tax", e.target.value)}
            placeholder="0.00"
          />
        </FinRow>
      </FinCol>

      {/* Column 3: Discounts & Remarks */}
      <FinCol>
        <FinCardTitle>🏷️ Discounts &amp; Remarks</FinCardTitle>
        <FinRow>
          <FinLbl>Discount (%)</FinLbl>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
            <FinIn
              value={f.discount_percent}
              onChange={e => {
                const pctVal = e.target.value;
                onChange("discount_percent", pctVal);
                if (pctVal !== "" && totals.totalAmount > 0) {
                  const amt = ((parseFloat(totals.totalAmount) || 0) * (parseFloat(pctVal) || 0)) / 100;
                  onChange("discount_amount", amt ? amt.toFixed(2) : "");
                } else if (pctVal === "") {
                  onChange("discount_amount", "");
                }
              }}
              placeholder="0"
              style={{ textAlign: "right" }}
            />
            <span style={{ fontSize: "0.76rem", color: T.textMuted, fontWeight: 700 }}>%</span>
          </div>
        </FinRow>
        <FinRow>
          <FinLbl>Discount (₹)</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn
            value={f.discount_amount}
            onChange={e => {
              const amtVal = e.target.value;
              onChange("discount_amount", amtVal);
              if (amtVal !== "" && totals.totalAmount > 0) {
                const pct = ((parseFloat(amtVal) || 0) / parseFloat(totals.totalAmount)) * 100;
                onChange("discount_percent", pct ? pct.toFixed(2) : "");
              } else if (amtVal === "") {
                onChange("discount_percent", "");
              }
            }}
            placeholder="0.00"
          />
        </FinRow>
        <FinRow>
          <FinLbl>Disc Reason</FinLbl>
          <FinIn
            $align="left"
            value={f.disc_reason}
            onChange={e => onChange("disc_reason", e.target.value)}
            placeholder="Reason for discount…"
          />
        </FinRow>
        <FinRow>
          <FinLbl>Remarks</FinLbl>
          <FinIn
            $align="left"
            value={f.remarks || ""}
            onChange={e => onChange("remarks", e.target.value)}
            placeholder="General remarks…"
          />
        </FinRow>
      </FinCol>

      {/* Column 4: Settlement Summary */}
      <FinCol style={{ background: isRefund ? "#fffafb" : "#fafffd", borderColor: isRefund ? "#fecdd3" : "#bbf7d0" }}>
        <FinCardTitle style={{ color: isRefund ? T.danger : T.primary }}>
          {isRefund ? "🛑 Settlement (Refund)" : "✅ Settlement Summary"}
        </FinCardTitle>
        <FinRow>
          <FinLbl>Bill Total</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn $ro value={fmt(totals.grossTotal || totals.totalAmount)} readOnly />
        </FinRow>
        <FinRow>
          <FinLbl>Total Disc (-)</FinLbl>
          <Rupee>₹</Rupee>
          <FinIn $ro value={fmt(totals.totalDisc)} readOnly />
        </FinRow>

        <NetBadgeBox $refund={isRefund}>
          <span style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: isRefund ? T.danger : T.primary }}>
            {isRefund ? "⚠️ Patient Refund Amount" : "💵 Final Net Payable"}
          </span>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: isRefund ? T.danger : T.success, letterSpacing: "-0.5px" }}>
            ₹{fmt(totals.netAmount)}
          </div>
        </NetBadgeBox>
      </FinCol>
    </FinGrid>
  );
};

// ItemsSection
// ═════════════════════════════════════════════════════════════════════════════

const ItemsSection = ({
  items, newItem, onNIChange, onItemSelect, onAdd, onClear, onEdit, onRemove, disabled,
  doctors, billTypeNo, billTypeName, allItems, itemsLoading,
  selectedKeys = [], onToggleSelect, onToggleSelectAll, onApplyWard,
  patientWard = "SEMI-PRIVATE WARD",
  rateCategory = "NABH", onApplyRateCategory,
}) => (
  <div>
    {/* ── Selection, Rate Category & Ward Concept Bar ── */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 14px", background: "#f8fafc", borderBottom: `1px solid ${T.border}`,
      flexWrap: "wrap", gap: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 700, color: T.textMain, cursor: disabled || items.length === 0 ? "default" : "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={items.length > 0 && selectedKeys.length === items.length}
            onChange={onToggleSelectAll}
            disabled={disabled || items.length === 0}
            style={{ cursor: disabled || items.length === 0 ? "default" : "pointer", width: 16, height: 16, accentColor: T.primary }}
          />
          <span>Select All ({items.length})</span>
        </label>
        {selectedKeys.length > 0 && (
          <span style={{ fontSize: "0.74rem", background: T.primaryLt, color: T.primary, padding: "2px 10px", borderRadius: 12, fontWeight: 700 }}>
            {selectedKeys.length} of {items.length} selected
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {/* Insurance Rate Selection Checkboxes: NABH Rate vs Non-NABH Rate */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: T.textMid }}>
            🛡️ Insurance Rate:
          </span>
          <label
            title="Apply NABH Rate to items"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", fontSize: "0.74rem", fontWeight: 700, borderRadius: 6,
              border: `1px solid ${rateCategory === "NABH" ? "#0f766e" : "#ccfbf1"}`,
              background: rateCategory === "NABH" ? "#ccfbf1" : "#f0fdfa",
              color: "#0f766e",
              cursor: disabled ? "not-allowed" : "pointer",
              userSelect: "none", transition: "all 0.15s ease",
              boxShadow: rateCategory === "NABH" ? "0 1px 3px rgba(15, 118, 110, 0.2)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={rateCategory === "NABH"}
              onChange={() => onApplyRateCategory && onApplyRateCategory("NABH")}
              disabled={disabled}
              style={{ cursor: disabled ? "default" : "pointer", accentColor: "#0f766e", width: 15, height: 15 }}
            />
            <span>⭐ NABH Rate</span>
          </label>
          <label
            title="Apply Non-NABH Rate to items"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", fontSize: "0.74rem", fontWeight: 700, borderRadius: 6,
              border: `1px solid ${rateCategory === "NON_NABH" ? "#2563eb" : "#dbeafe"}`,
              background: rateCategory === "NON_NABH" ? "#dbeafe" : "#eff6ff",
              color: "#1d4ed8",
              cursor: disabled ? "not-allowed" : "pointer",
              userSelect: "none", transition: "all 0.15s ease",
              boxShadow: rateCategory === "NON_NABH" ? "0 1px 3px rgba(37, 99, 235, 0.2)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={rateCategory === "NON_NABH"}
              onChange={() => onApplyRateCategory && onApplyRateCategory("NON_NABH")}
              disabled={disabled}
              style={{ cursor: disabled ? "default" : "pointer", accentColor: "#2563eb", width: 15, height: 15 }}
            />
            <span>🔹 Non-NABH Rate</span>
          </label>
        </div>

        {/* Ward Concept Multiplier Checkboxes */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: T.textMid }}>
            🛏️ Ward Concept ({selectedKeys.length > 0 ? `${selectedKeys.length} Selected` : "All"}):
          </span>
          <label
            title="Apply +5% Private Ward markup to selected items"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", fontSize: "0.74rem", fontWeight: 700, borderRadius: 6,
              border: `1px solid ${patientWard === "PRIVATE WARD" ? "#16a34a" : "#bbf7d0"}`,
              background: patientWard === "PRIVATE WARD" ? "#dcfce7" : "#f0fdf4",
              color: "#15803d",
              cursor: disabled || items.length === 0 ? "not-allowed" : "pointer",
              userSelect: "none", transition: "all 0.15s ease",
              boxShadow: patientWard === "PRIVATE WARD" ? "0 1px 3px rgba(22, 163, 74, 0.2)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={patientWard === "PRIVATE WARD"}
              onChange={() => onApplyWard(patientWard === "PRIVATE WARD" ? "SEMI-PRIVATE WARD" : "PRIVATE WARD")}
              disabled={disabled || items.length === 0}
              style={{ cursor: disabled || items.length === 0 ? "default" : "pointer", accentColor: "#16a34a", width: 15, height: 15 }}
            />
            <span>⬆️ +5% Private</span>
          </label>
          <label
            title="Apply -5% General Ward discount to selected items"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", fontSize: "0.74rem", fontWeight: 700, borderRadius: 6,
              border: `1px solid ${patientWard === "GENERAL WARD" ? "#d97706" : "#fde68a"}`,
              background: patientWard === "GENERAL WARD" ? "#fef3c7" : "#fffbeb",
              color: "#b45309",
              cursor: disabled || items.length === 0 ? "not-allowed" : "pointer",
              userSelect: "none", transition: "all 0.15s ease",
              boxShadow: patientWard === "GENERAL WARD" ? "0 1px 3px rgba(217, 119, 6, 0.2)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={patientWard === "GENERAL WARD"}
              onChange={() => onApplyWard(patientWard === "GENERAL WARD" ? "SEMI-PRIVATE WARD" : "GENERAL WARD")}
              disabled={disabled || items.length === 0}
              style={{ cursor: disabled || items.length === 0 ? "default" : "pointer", accentColor: "#d97706", width: 15, height: 15 }}
            />
            <span>⬇️ -5% General</span>
          </label>
          <label
            title="Reset selected items to Normal Rate (0%)"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", fontSize: "0.74rem", fontWeight: 600, borderRadius: 6,
              border: `1px solid ${patientWard === "SEMI-PRIVATE WARD" ? T.primary : T.border}`,
              background: patientWard === "SEMI-PRIVATE WARD" ? "#f0fdfa" : "#fff",
              color: patientWard === "SEMI-PRIVATE WARD" ? T.primary : T.textMid,
              cursor: disabled || items.length === 0 ? "not-allowed" : "pointer",
              userSelect: "none", transition: "all 0.15s ease",
              boxShadow: patientWard === "SEMI-PRIVATE WARD" ? "0 1px 3px rgba(15, 118, 110, 0.15)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={patientWard === "SEMI-PRIVATE WARD"}
              onChange={() => onApplyWard("SEMI-PRIVATE WARD")}
              disabled={disabled || items.length === 0}
              style={{ cursor: disabled || items.length === 0 ? "default" : "pointer", accentColor: T.primary, width: 15, height: 15 }}
            />
            <span>⚖️ Normal (0%)</span>
          </label>
        </div>
      </div>
    </div>

    <TScrollWrap>
      <ITable>
        <ITHead>
          <tr>
            <ITH style={{ width: "28px" }} $align="center"></ITH>
            <ITH style={{ width: "26px" }} $align="center">#</ITH>
            <ITH style={{ width: "22%" }}>Item Name</ITH>
            <ITH style={{ width: "5%" }} $align="right">Qty</ITH>
            <ITH style={{ width: "7.5%" }} $align="right">Rate</ITH>
            <ITH style={{ width: "5.5%" }} $align="right">Disc</ITH>
            <ITH style={{ width: "8.5%" }} $align="right">Amount</ITH>
            <ITH style={{ width: "14%" }}>Doctor</ITH>
            <ITH style={{ width: "6.5%" }} $align="right">Dr.Fee</ITH>
            <ITH style={{ width: "14%" }}>Description</ITH>
            <ITH style={{ width: "7%" }} $align="center">Source</ITH>
            <ITH style={{ width: "48px" }} $align="center">Action</ITH>
          </tr>
        </ITHead>
        <tbody>
          <AddRow>
            <ITD $align="center"></ITD>
            <ITD $align="center" style={{ color: T.amber, fontWeight: 700, fontSize: "0.85rem" }}>+</ITD>
            <ITD>
              <ItemSearchInput
                value={newItem.itemName}
                onChange={v => onNIChange("itemName", v)}
                onSelect={onItemSelect}
                disabled={disabled}
                allItems={allItems}
                itemsLoading={itemsLoading}
                billTypeName={billTypeName}
                rateCategory={rateCategory}
              />
            </ITD>
            <ITD><TInput $align="right" value={newItem.quantity} onChange={e => onNIChange("quantity", e.target.value)} disabled={disabled} /></ITD>
            <ITD><TInput $align="right" value={newItem.rate} onChange={e => onNIChange("rate", e.target.value)} disabled={disabled} /></ITD>
            <ITD><TInput $align="right" value={newItem.discount} onChange={e => onNIChange("discount", e.target.value)} disabled={disabled} /></ITD>
            <ITD><TInput $align="right" $ro value={fmt(newItem.amount)} readOnly /></ITD>
            <ITD>
              <SearchSelect
                options={doctors.map(d => {
                  const name = d.employeeName || d.doctor_name || d.name || (typeof d === "string" ? d : "");
                  return { value: name, label: name };
                })}
                value={newItem.doctor}
                onChange={e => onNIChange("doctor", e.target.value)}
                placeholder="— Doctor —"
                disabled={disabled}
                height="29px"
                style={{ width: "100%", minWidth: 0 }}
              />
            </ITD>
            <ITD><TInput $align="right" value={newItem.doctor_fee} onChange={e => onNIChange("doctor_fee", e.target.value)} disabled={disabled} /></ITD>
            <ITD>
              <TInput value={newItem.item_description} onChange={e => onNIChange("item_description", e.target.value)} disabled={disabled} placeholder="Notes…" />
            </ITD>
            <ITD $align="center"></ITD>
            <ITD $align="center">
              <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                <button onClick={onAdd} disabled={disabled}
                  title="Add item"
                  style={{ width: 20, height: 26, borderRadius: 4, background: disabled ? "#94a3b8" : T.primary, border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                <button onClick={onClear}
                  title="Reset item"
                  style={{ width: 20, height: 26, borderRadius: 4, background: "#f1f5f9", border: `1px solid ${T.border}`, cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
              </div>
            </ITD>
          </AddRow>

          {items.length === 0 ? (
            <tr><td colSpan={12}><EmptyRow>{disabled ? "Search a patient to load items." : "No items yet — add above."}</EmptyRow></td></tr>
          ) : items.map((item, idx) => {
            const isSelected = selectedKeys.includes(item._key);
            return (
              <ITR key={item._key} style={{ background: isSelected ? "#f0fdfa" : "inherit" }}>
                <ITD $align="center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item._key)}
                    style={{ cursor: "pointer", accentColor: T.primary, width: 14, height: 14 }}
                  />
                </ITD>
                <ITD $align="center" style={{ color: T.textMuted, fontWeight: 600, fontSize: "0.74rem" }}>{idx + 1}</ITD>
                <ITD style={{ fontWeight: 600 }}>
                  <TInput
                    value={item.itemName}
                    onChange={e => onEdit(item._key, "itemName", e.target.value)}
                    style={{ fontWeight: 600 }}
                  />
                </ITD>
                <ITD><TInput $align="right" value={item.quantity} onChange={e => onEdit(item._key, "quantity", e.target.value)} /></ITD>
                <ITD><TInput $align="right" value={item.rate} onChange={e => onEdit(item._key, "rate", e.target.value)} /></ITD>
                <ITD><TInput $align="right" value={item.discount} onChange={e => onEdit(item._key, "discount", e.target.value)} /></ITD>
                <ITD $align="right" style={{ fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>₹{fmt(item.amount)}</ITD>
                <ITD>
                  <SearchSelect
                    options={doctors.map(d => {
                      const name = d.employeeName || d.doctor_name || d.name || (typeof d === "string" ? d : "");
                      return { value: name, label: name };
                    })}
                    value={item.doctor || ""}
                    onChange={e => onEdit(item._key, "doctor", e.target.value)}
                    placeholder="— Doctor —"
                    height="29px"
                    style={{ width: "100%", minWidth: 0 }}
                  />
                </ITD>
                <ITD><TInput $align="right" value={item.doctor_fee || ""} onChange={e => onEdit(item._key, "doctor_fee", e.target.value)} /></ITD>
                <ITD>
                  <TInput
                    value={(item.item_description && item.item_description !== item.billTypeNo && item.item_description !== "DIS01" && !String(item.item_description).startsWith("DIS0")) ? item.item_description : ""}
                    onChange={e => onEdit(item._key, "item_description", e.target.value)}
                    placeholder="Description…"
                  />
                </ITD>
                <ITD $align="center">
                  {item._fromInvest
                    ? <Badge $v="pending">{item.payment_status || "Pending"}</Badge>
                    : <Badge $v="manual">Manual</Badge>}
                </ITD>
                <ITD $align="center">
                  <button onClick={() => onRemove(item._key)}
                    title="Remove item"
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.danger, fontSize: "0.88rem", padding: "2px", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                </ITD>
              </ITR>
            );
          })}
        </tbody>
      </ITable>
    </TScrollWrap>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

const DischargeBilling = () => {
  const location = useLocation();

  const [tab, setTab] = useState("create");

  // ── Master data ────────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);

  // ── Pre-fetched items for selected bill type ───────────────────────────────
  const [allItems, setAllItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Selected bill type (loaded dynamically from API)
  const [selectedBT, setSelectedBT] = useState({
    billTypeNo: "",
    bill_type: null,
    bill_name: "",
    isInsurance: false,
  });

  // Insurance Packages Schemes & active selection
  const [insuranceSchemes, setInsuranceSchemes] = useState([]);
  const [selectedInsuranceScheme, setSelectedInsuranceScheme] = useState("");

  const [patientWard, setPatientWard] = useState("SEMI-PRIVATE WARD");
  const [rateCategory, setRateCategory] = useState("NABH"); // "NABH" | "NON_NABH"
  const [uhid, setUhid] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  // ── Patient search modal state & handlers ──────────────────────────────────
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearchMode, setPatientSearchMode] = useState("uhid");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const openUhidSearch = () => {
    setPatientSearchMode("uhid");
    setPatientSearchQuery(uhid || "");
    setShowPatientModal(true);
  };

  const openIpSearch = () => {
    setPatientSearchMode("ip");
    setPatientSearchQuery(ipNumber || "");
    setShowPatientModal(true);
  };

  const handlePatientSelect = (data) => {
    const selectedIp = data.ipNumber || data.ip_number || "";
    const selectedUhid = data.uhid || data.UHID || "";
    if (selectedIp) {
      setIpNumber(selectedIp);
      if (selectedUhid) setUhid(selectedUhid);
      doSearch("ip", selectedIp);
    } else if (selectedUhid) {
      setUhid(selectedUhid);
      doSearch("uhid", selectedUhid);
    }
  };
  const [patient, setPatient] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [form, setFormRaw] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingEst, setEditingEst] = useState(null);
  const [printBillModal, setPrintBillModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash");
  const [pendingSaveIntent, setPendingSaveIntent] = useState(null);

  // Insurance Bill State
  const [insuranceData, setInsuranceData] = useState({
    isInsuranceBill: false,
    claimNumber: "",
    idCardNumber: "",
    insuranceBillNumber: "",
    companyName: "",
  });

  const isInsurancePatient = Boolean(
    patient && (
      (patient.patient_type && String(patient.patient_type).trim().toUpperCase().includes("INSURANCE")) ||
      (patient.customer_type && String(patient.customer_type).trim().toUpperCase().includes("INSURANCE")) ||
      (patient.company && String(patient.company).trim()) ||
      (patient.company_code && String(patient.company_code).trim()) ||
      (patient.insurance_company && String(patient.insurance_company).trim()) ||
      (patient.claim_number && String(patient.claim_number).trim()) ||
      Boolean(insuranceData?.isInsuranceBill) ||
      Boolean(editingEst?.is_insurance_bill) ||
      Boolean(editingEst?.insurance_bill_number)
    )
  );

  const handleConvertToInsuranceBill = () => {
    if (!patient) { showToast("Search a patient first", true); return; }
    if (!isInsurancePatient) {
      showToast("Convert to Insurance Bill is only available for Insurance patients", true);
      return;
    }
    if (!items.length) { showToast("Add at least one item", true); return; }

    const updated = {
      ...insuranceData,
      isInsuranceBill: true,
      companyName: insuranceData.companyName || patient.company || patient.company_code || patient.insurance_company || "",
      claimNumber: insuranceData.claimNumber || patient.claim_number || patient.referral_number || "",
      idCardNumber: insuranceData.idCardNumber || patient.id_card_number || patient.card_no || "",
    };
    setInsuranceData(updated);

    if (editingEst?.id && editingEst.status === "Billed") {
      setEditReasonText("");
      setEditReasonModal({ actionType: "insurance_bill", insurance: updated });
    } else {
      setSelectedPaymentMode("Credit");
      setPendingSaveIntent({ actionType: "insurance_bill", reason: "", customInsurance: updated });
      setShowPaymentModal(true);
    }
  };

  const handleToggleSelect = useCallback((key) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedKeys(prev => prev.length === items.length ? [] : items.map(i => i._key));
  }, [items]);
  const [editReasonModal, setEditReasonModal] = useState(null);
  const [editReasonText, setEditReasonText] = useState("");

  const setForm = (k, v) => setFormRaw(p => ({ ...p, [k]: v }));
  const totals = calcTotals(items, form);

  const [estRefresh, setEstRefresh] = useState(0);
  const [billRefresh, setBillRefresh] = useState(0);

  // ── Discharge Requests ("Sent for billing" & is_admitted: true) ──────────
  const [dischargeRequests, setDischargeRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqDateFilter, setReqDateFilter] = useState("all"); // "all" | YYYY-MM-DD
  const [reqSearch, setReqSearch] = useState("");
  const [reqPageSize, setReqPageSize] = useState(10);
  const [reqPage, setReqPage] = useState(1);
  const [reqSortField, setReqSortField] = useState("uhid");
  const [reqSortDir, setReqSortDir] = useState("desc");

  const getLocalTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchDischargeRequests = useCallback(async (dateOverride) => {
    const activeDate = dateOverride !== undefined ? dateOverride : reqDateFilter;
    setReqLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeDate && activeDate !== "all") qs.set("date", activeDate);
      else qs.set("date", "all");
      const res = await apiRequest(`${BASE}discharge-billing/requests/?${qs.toString()}`, "GET");
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setDischargeRequests(list);
    } catch {
      setDischargeRequests([]);
    } finally {
      setReqLoading(false);
    }
  }, [reqDateFilter]);

  useEffect(() => {
    fetchDischargeRequests();
  }, [fetchDischargeRequests, billRefresh, estRefresh]);

  const handleReqSort = (field) => {
    if (reqSortField === field) {
      setReqSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setReqSortField(field);
      setReqSortDir("asc");
    }
    setReqPage(1);
  };

  const filteredRequests = useMemo(() => {
    const q = reqSearch.trim().toLowerCase();
    const filtered = q
      ? dischargeRequests.filter(r =>
          [
            r.uhid,
            r.ipNumber,
            r.patientName,
            r.doctorName,
            r.roomNo,
            r.customerType,
            r.insuranceCompany,
          ]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(q))
        )
      : dischargeRequests;

    return [...filtered].sort((a, b) => {
      const av = String(a[reqSortField] || "").toLowerCase();
      const bv = String(b[reqSortField] || "").toLowerCase();
      if (av < bv) return reqSortDir === "asc" ? -1 : 1;
      if (av > bv) return reqSortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [dischargeRequests, reqSearch, reqSortField, reqSortDir]);

  const reqTotalPages = Math.max(1, Math.ceil(filteredRequests.length / reqPageSize));
  const paginatedRequests = useMemo(() => {
    const start = (reqPage - 1) * reqPageSize;
    return filteredRequests.slice(start, start + reqPageSize);
  }, [filteredRequests, reqPage, reqPageSize]);

  useEffect(() => {
    if (reqPage > reqTotalPages) setReqPage(1);
  }, [reqPage, reqTotalPages]);

  const [toast, setToast] = useState(null);
  const showToast = (msg, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3800); };

  // ── Fetch doctors, bill types & insurance schemes on mount ────────────────
  useEffect(() => {
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const dRes = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        if (dRes?.success) setDoctors(dRes.data || []);
        else if (Array.isArray(dRes)) setDoctors(dRes);
        else if (Array.isArray(dRes?.data)) setDoctors(dRes.data);
      } catch { }

      try {
        const bRes = await apiRequest(`${BASE}bill-types/`, "GET");
        const list =
          Array.isArray(bRes?.billTypes) ? bRes.billTypes :
            Array.isArray(bRes?.records) ? bRes.records :
              Array.isArray(bRes?.data?.billTypes) ? bRes.data.billTypes :
                Array.isArray(bRes?.data?.records) ? bRes.data.records :
                  Array.isArray(bRes?.data) ? bRes.data :
                    Array.isArray(bRes) ? bRes :
                      [];
        setBillTypes(list);
        if (list.length > 0) {
          const defaultBt = list.find(b =>
            !["AD01", "DIS01", "REG01"].includes(b.billTypeNo) &&
            !["ADVANCE", "DISCHARGE", "REGISTRATION"].includes(String(b.bill_name || "").toUpperCase())
          ) || list[0];
          setSelectedBT({
            billTypeNo: defaultBt.billTypeNo || defaultBt.bill_type_no || "",
            bill_type: defaultBt.bill_type,
            bill_name: defaultBt.bill_name,
            isInsurance: false,
          });
        }
      } catch { }

      // Fetch 7 Insurance Package Schemes
      try {
        const sRes = await apiRequest(`${BASE}insurance-packages/schemes/`, "GET");
        const sList =
          Array.isArray(sRes?.schemes) ? sRes.schemes :
            Array.isArray(sRes?.data?.schemes) ? sRes.data.schemes :
              Array.isArray(sRes?.data) ? sRes.data :
                Array.isArray(sRes) ? sRes :
                  [];
        setInsuranceSchemes(sList);
        if (sList.length > 0) {
          setSelectedInsuranceScheme(sList[0].id);
        }
      } catch (err) {
        console.error("Failed to load insurance schemes:", err);
      }

      setMasterLoading(false);
    };
    fetchMasterData();
  }, []);

  // ── Options for Bill Type dropdown (including Insurance Packages) ──────────
  const billTypeOptions = useMemo(() => {
    const opts = billTypes.map(b => ({
      value: String(b.bill_type),
      label: b.bill_name,
      subLabel: b.billTypeNo,
    }));
    // Add Insurance Packages option at top of list
    opts.unshift({
      value: "INSURANCE_PACKAGES",
      label: "🛡️ INSURANCE PACKAGES",
      subLabel: `${insuranceSchemes.length || 7} Schemes`,
    });
    return opts;
  }, [billTypes, insuranceSchemes]);

  // ── Fetch items whenever selected bill type or insurance scheme changes ────
  useEffect(() => {
    if (selectedBT.bill_type == null) return;
    let cancelled = false;

    const fetchItems = async () => {
      setItemsLoading(true);
      setAllItems([]); // clear stale items immediately
      try {
        if (selectedBT.bill_type === "INSURANCE_PACKAGES" || selectedBT.isInsurance) {
          const scheme = selectedInsuranceScheme || "cghs";
          const res = await apiRequest(`${BASE}insurance-packages/items/?scheme=${encodeURIComponent(scheme)}&status=active`, "GET");
          const list =
            Array.isArray(res?.items) ? res.items :
              Array.isArray(res?.data?.items) ? res.data.items :
                Array.isArray(res?.data) ? res.data :
                  Array.isArray(res) ? res :
                    [];
          if (!cancelled) setAllItems(normaliseItems(list));
        } else {
          const btNoParam = selectedBT.billTypeNo ? `billTypeNo=${encodeURIComponent(selectedBT.billTypeNo)}&` : "";
          const custType = (patient?.patient_type || patient?.customer_type || "").trim();
          const custParam = custType ? `&customer_type=${encodeURIComponent(custType)}` : "";
          const url = `${BASE}discharge-billing/?action=investigation_items&${btNoParam}billType=${encodeURIComponent(String(selectedBT.bill_type))}${custParam}`;
          const res = await apiRequest(url, "GET");

          const list =
            Array.isArray(res?.data?.items) ? res.data.items :
              Array.isArray(res?.items) ? res.items :
                Array.isArray(res?.data) ? res.data :
                  Array.isArray(res) ? res :
                    [];

          if (!cancelled) setAllItems(normaliseItems(list));
        }
      } catch {
        if (!cancelled) setAllItems([]);
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    };

    fetchItems();
    return () => { cancelled = true; };
  }, [selectedBT.billTypeNo, selectedBT.bill_type, selectedBT.isInsurance, selectedInsuranceScheme, patient?.patient_type, patient?.customer_type]);

  // ── Bill type change handler ────────────────────────────────────────────────
  const handleBillTypeChange = e => {
    const selectedVal = e.target.value;
    if (selectedVal === "INSURANCE_PACKAGES") {
      setSelectedBT({
        billTypeNo: "INSPKG",
        bill_type: "INSURANCE_PACKAGES",
        bill_name: "INSURANCE PACKAGES",
        isInsurance: true,
      });
      setNewItem(EMPTY_ITEM);
      return;
    }
    const chosen = billTypes.find(b => String(b.bill_type) === String(selectedVal));
    if (!chosen) return;
    setSelectedBT({
      billTypeNo: chosen.billTypeNo || "",
      bill_type: chosen.bill_type,
      bill_name: chosen.bill_name,
      isInsurance: false,
    });
    // Reset new item row so name input is blank (stale item from old type removed)
    setNewItem(EMPTY_ITEM);
  };

  // ── Ward Price Multiplier (+5% Private Ward, -5% General Ward, Normal Semi-Private) ─────
  const getWardMultiplier = useCallback((ward) => {
    if (ward === "PRIVATE WARD") return 1.05; // +5%
    if (ward === "GENERAL WARD") return 0.95; // -5%
    return 1.0; // SEMI-PRIVATE WARD / default is normal rate
  }, []);

  const applyWardToItem = useCallback((it, ward) => {
    const mult = getWardMultiplier(ward);
    const baseRate = it._baseRate !== undefined ? it._baseRate : (parseFloat(it.rate) || 0);
    const adjRate = parseFloat((baseRate * mult).toFixed(2));
    const qty = parseFloat(it.quantity) || 1;
    const disc = parseFloat(it.discount) || 0;
    const adjAmount = Math.max(0, parseFloat((adjRate * qty - disc).toFixed(2)));
    return {
      ...it,
      _baseRate: baseRate,
      _appliedWard: ward,
      rate: adjRate,
      amount: adjAmount,
    };
  }, [getWardMultiplier]);

  const applyWardMultiplier = useCallback((wardType) => {
    setPatientWard(wardType);
    setItems(prevItems => {
      const targetKeys = selectedKeys.length > 0 ? selectedKeys : prevItems.map(i => i._key);
      if (targetKeys.length === 0) return prevItems;
      return prevItems.map(it => {
        if (targetKeys.includes(it._key)) {
          return applyWardToItem(it, wardType);
        }
        return it;
      });
    });
    const count = selectedKeys.length > 0 ? selectedKeys.length : items.length;
    const label = wardType === "PRIVATE WARD" ? "+5% (Private Ward)" : wardType === "GENERAL WARD" ? "-5% (General Ward)" : "Normal Rate (0%)";
    if (count > 0) {
      showToast(`Applied ${label} to ${count} item(s)`);
    }
  }, [selectedKeys, items.length, applyWardToItem, showToast]);

  const handleWardChange = (e) => {
    const newWard = e.target.value;
    applyWardMultiplier(newWard);
  };

  // ── Apply NABH Rate vs Non-NABH Rate ──────────────────────────────────────
  const applyRateCategory = useCallback((cat) => {
    setRateCategory(cat);
    // Update newly entered item if present
    setNewItem(prev => {
      if (!prev.itemName) return prev;
      let newBase = prev._baseRate !== undefined ? prev._baseRate : (parseFloat(prev.rate) || 0);
      if (cat === "NON_NABH" && prev.non_nabh_rate != null && !isNaN(Number(prev.non_nabh_rate)) && Number(prev.non_nabh_rate) > 0) {
        newBase = parseFloat(prev.non_nabh_rate);
      } else if (cat === "NABH" && prev.nabh_rate != null && !isNaN(Number(prev.nabh_rate)) && Number(prev.nabh_rate) > 0) {
        newBase = parseFloat(prev.nabh_rate);
      }
      const mult = getWardMultiplier(patientWard);
      const adjRate = parseFloat((newBase * mult).toFixed(2));
      const qty = parseFloat(prev.quantity) || 1;
      const disc = parseFloat(prev.discount) || 0;
      const adjAmount = Math.max(0, parseFloat((adjRate * qty - disc).toFixed(2)));
      return {
        ...prev,
        _baseRate: newBase,
        _rateCategory: cat,
        rate_category: cat,
        rate: adjRate,
        amount: adjAmount,
      };
    });

    setItems(prevItems => {
      const targetKeys = selectedKeys.length > 0 ? selectedKeys : prevItems.map(i => i._key);
      if (targetKeys.length === 0) return prevItems;
      return prevItems.map(it => {
        if (!targetKeys.includes(it._key)) return it;
        let newBase = it._baseRate !== undefined ? it._baseRate : (parseFloat(it.rate) || 0);
        if (cat === "NON_NABH") {
          if (it.non_nabh_rate != null && it.non_nabh_rate !== "" && !isNaN(Number(it.non_nabh_rate)) && Number(it.non_nabh_rate) > 0) {
            newBase = parseFloat(it.non_nabh_rate);
          }
        } else {
          if (it.nabh_rate != null && it.nabh_rate !== "" && !isNaN(Number(it.nabh_rate)) && Number(it.nabh_rate) > 0) {
            newBase = parseFloat(it.nabh_rate);
          }
        }
        const mult = getWardMultiplier(it._appliedWard || patientWard);
        const adjRate = parseFloat((newBase * mult).toFixed(2));
        const qty = parseFloat(it.quantity) || 1;
        const disc = parseFloat(it.discount) || 0;
        const adjAmount = Math.max(0, parseFloat((adjRate * qty - disc).toFixed(2)));
        return {
          ...it,
          _baseRate: newBase,
          _rateCategory: cat,
          rate_category: cat,
          rate: adjRate,
          amount: adjAmount,
        };
      });
    });
    const count = selectedKeys.length > 0 ? selectedKeys.length : items.length;
    const label = cat === "NON_NABH" ? "Non-NABH Rate" : "NABH Rate";
    if (count > 0) {
      showToast(`Switched to ${label} for ${count} item(s)`);
    }
  }, [selectedKeys, items.length, patientWard, getWardMultiplier, showToast]);

  const investToRow = useCallback((inv, idx, ward = "SEMI-PRIVATE WARD") => {
    let baseRate = 0;
    if (rateCategory === "NON_NABH" && inv.non_nabh_rate != null && !isNaN(Number(inv.non_nabh_rate)) && Number(inv.non_nabh_rate) > 0) {
      baseRate = parseFloat(inv.non_nabh_rate);
    } else if (inv.nabh_rate != null && !isNaN(Number(inv.nabh_rate)) && Number(inv.nabh_rate) > 0) {
      baseRate = parseFloat(inv.nabh_rate);
    } else {
      baseRate = parseFloat(inv.rate != null ? inv.rate : (inv.price || 0)) || 0;
    }
    const qty = parseFloat(inv.quantity) || 1;
    const disc = parseFloat(inv.discount) || 0;
    const effectiveWard = ward || patientWard || "SEMI-PRIVATE WARD";
    const mult = getWardMultiplier(effectiveWard);
    const adjRate = parseFloat((baseRate * mult).toFixed(2));
    const adjAmount = Math.max(0, parseFloat((adjRate * qty - disc).toFixed(2)));
    const cleanPkg = (inv.package_name && !String(inv.package_name).toLowerCase().startsWith("room") && !String(inv.package_name).toLowerCase().includes("general ward") && !String(inv.package_name).toLowerCase().includes("private ward")) ? inv.package_name : "";
    const isAccom = Boolean(
      (inv.source && (inv.source.includes("room_services") || inv.source.includes("room_kits"))) ||
      (inv.invest_bill_no && (inv.invest_bill_no.startsWith("ROOM-") || inv.invest_bill_no.startsWith("KIT-"))) ||
      /room|ward|nursing|maintenance|accommodation|bed|icu|ccu|day care|stay|admission fee/i.test(`${inv.itemName || ""} ${inv.item_description || ""}`)
    );
    return {
      ...EMPTY_ITEM,
      ...inv,
      doctor: isAccom ? "" : (inv.doctor || ""),
      package_name: cleanPkg,
      code: inv.code || inv.item_code || (inv.test_id != null ? String(inv.test_id) : "") || (inv.sl_no != null ? String(inv.sl_no) : "") || "",
      nabh_code: inv.nabh_code || inv.nabhCode || "",
      nabh_rate: inv.nabh_rate != null ? inv.nabh_rate : null,
      non_nabh_rate: inv.non_nabh_rate != null ? inv.non_nabh_rate : null,
      rate_category: rateCategory,
      _rateCategory: rateCategory,
      _baseRate: baseRate,
      _appliedWard: effectiveWard,
      rate: adjRate,
      amount: adjAmount,
      _key: `inv_${idx}_${Date.now()}`,
      _fromInvest: true,
    };
  }, [patientWard, getWardMultiplier, rateCategory]);

  // ── Patient search ─────────────────────────────────────────────────────────
  const doSearch = async (mode, explicitVal = null) => {
    const val = (explicitVal || (mode === "uhid" ? uhid : ipNumber)).trim();
    if (!val) { setSearchErr("Please enter a value"); return; }
    setSearchErr(""); setSearching(true);
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM); setSelectedKeys([]);
    try {
      const param = mode === "uhid"
        ? `uhid=${encodeURIComponent(val)}`
        : `ipNumber=${encodeURIComponent(val)}`;
      const raw = await apiRequest(`${BASE}search-discharge-patient/?${param}`, "GET");

      const err = raw?.error || raw?.data?.error || raw?.message;
      if (err) {
        if (err === "Already Discharged" || raw?.message === "Patient is already discharged") {
          setSearchErr("Patient is Already Discharged!");
          showToast("Patient is Already Discharged!", true);
        } else {
          setSearchErr(err === "Not Admitted" ? "Not Admitted" : err);
        }
        return;
      }

      const res = raw.success && raw.data && raw.data.success ? raw.data.data : (raw.success ? raw.data : raw);
      const p = res?.patient;
      if (p) {
        const norm = { ...p, ip_number: p.ip_number || p.ipNumber || "" };
        setPatient(norm);
        const isIns = Boolean(
          (norm.customer_type && String(norm.customer_type).trim().toUpperCase().includes("INSURANCE")) ||
          (norm.patient_type && String(norm.patient_type).trim().toUpperCase().includes("INSURANCE")) ||
          (norm.company && String(norm.company).trim()) ||
          (norm.company_code && String(norm.company_code).trim()) ||
          (norm.insurance_company && String(norm.insurance_company).trim()) ||
          (norm.claim_number && String(norm.claim_number).trim())
        );
        setInsuranceData(prev => ({
          ...prev,
          isInsuranceBill: isIns,
          companyName: norm.company || norm.company_code || norm.insurance_company || prev.companyName || "",
          claimNumber: norm.claim_number || norm.referral_number || prev.claimNumber || "",
          idCardNumber: norm.id_card_number || norm.card_no || prev.idCardNumber || "",
        }));
        if (norm.uhid) setUhid(norm.uhid);
        if (norm.ip_number) setIpNumber(norm.ip_number);
        setPatientWard("SEMI-PRIVATE WARD");
        if (norm.advance_amount != null && norm.advance_amount !== "") {
          setForm("advance_amount", String(norm.advance_amount));
        }
        if (norm.sales_return != null && norm.sales_return !== "") {
          setForm("sales_return", String(norm.sales_return));
        }
        if (norm.medicines_amount != null && norm.medicines_amount !== "") {
          setForm("medicines", String(norm.medicines_amount));
        }
        if (norm.implant_amount != null && norm.implant_amount !== "") {
          setForm("implant_amount", String(norm.implant_amount));
        }
        if (Array.isArray(res.invest_items) && res.invest_items.length)
          setItems(res.invest_items.map((it, idx) => investToRow(it, idx, "SEMI-PRIVATE WARD")));
      } else {
        setSearchErr("Not Admitted");
      }
    } catch { setSearchErr("Search failed — check network"); }
    finally { setSearching(false); }
  };

  useEffect(() => {
    if (location.state?.ipNo) {
      setIpNumber(location.state.ipNo);
      doSearch("ipNumber", location.state.ipNo);
    }
  }, [location.state?.ipNo]);

  // ── New item helpers ───────────────────────────────────────────────────────
  const handleNIChange = (field, value) =>
    setNewItem(p => recalcItem({ ...p, [field]: value }, field, value));

  const handleItemSelect = useCallback(item => {
    setNewItem(p => {
      const itemName = item.itemName || item.name || "";
      let baseRate = 0;
      if (rateCategory === "NON_NABH" && item.non_nabh_rate != null && !isNaN(Number(item.non_nabh_rate)) && Number(item.non_nabh_rate) > 0) {
        baseRate = parseFloat(item.non_nabh_rate);
      } else if (item.nabh_rate != null && !isNaN(Number(item.nabh_rate)) && Number(item.nabh_rate) > 0) {
        baseRate = parseFloat(item.nabh_rate);
      } else {
        baseRate = parseFloat(item.price != null && item.price !== "" ? item.price : (item.rate || 0)) || 0;
      }
      const mult = getWardMultiplier(patientWard);
      const rate = parseFloat((baseRate * mult).toFixed(2));
      const qty = parseFloat(p.quantity) || 1;
      const disc = parseFloat(p.discount) || 0;
      const amount = Math.max(0, parseFloat((rate * qty - disc).toFixed(2)));
      const desc = item.nabh_code
        ? `NABH: ${item.nabh_code}${item.category ? ` · ${item.category}` : ""}`
        : (item.category || p.item_description || "");
      const itemCode = item.code || item.item_code || (item.test_id != null ? String(item.test_id) : "") || (item.sl_no != null ? String(item.sl_no) : "");
      const nabhCode = item.nabh_code || item.nabhCode || "";
      return {
        ...p,
        itemName,
        code: itemCode,
        nabh_code: nabhCode,
        nabh_rate: item.nabh_rate != null ? item.nabh_rate : null,
        non_nabh_rate: item.non_nabh_rate != null ? item.non_nabh_rate : null,
        rate_category: rateCategory,
        _rateCategory: rateCategory,
        _baseRate: baseRate,
        rate,
        amount,
        package_name: item.package_name || (selectedBT.isInsurance ? selectedBT.bill_name : p.package_name || ""),
        item_description: desc || p.item_description,
      };
    });
  }, [patientWard, getWardMultiplier, selectedBT, rateCategory]);

  const handleAddItem = () => {
    if (!newItem.itemName.trim()) { showToast("Enter item name first", true); return; }
    const added = applyWardToItem(newItem, patientWard);
    setItems(p => [...p, {
      ...added,
      _rateCategory: rateCategory,
      rate_category: rateCategory,
      _key: `m_${Date.now()}`,
      _fromInvest: false
    }]);
    setNewItem(EMPTY_ITEM);
  };

  const handleReset = () => {
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    setSelectedKeys([]);
    setPatientWard("SEMI-PRIVATE WARD");
    setUhid(""); setIpNumber(""); setSearchErr(""); setFormRaw(EMPTY_FORM);
    setEditingEst(null);
    setPatientWard("SEMI-PRIVATE WARD");
    setRateCategory("NABH");
    setInsuranceData({
      isInsuranceBill: false,
      claimNumber: "",
      idCardNumber: "",
      insuranceBillNumber: "",
      companyName: "",
    });
  };

  const handleProceedToBilling = useCallback(async (req) => {
    if (!req) return;
    handleReset();
    const targetIp = String(req.ipNumber || "").trim();
    const targetUhid = String(req.uhid || "").trim();
    setUhid(targetUhid);
    setIpNumber(targetIp);
    setTab("create");
    await doSearch(targetIp ? "ipNumber" : "uhid", targetIp || targetUhid);
  }, [doSearch]);

  // ── Edit / Convert from estimates list ─────────────────────────────────────
  const handleEditConvert = useCallback(async est => {
    if (!est?.id) return;
    const pd = est.patient_details || {};
    const initialPatient = {
      patient_name: pd.patient_name || "",
      age: pd.age || "",
      gender: pd.gender || "",
      doctor: pd.doctor || "",
      admission_date: pd.admission_date || "",
      uhid: est.uhid || "",
      ip_number: est.ip_number || "",
      mobile: pd.mobile || "",
      room_no: pd.room_no || "",
      total_days: pd.total_days ?? 0,
      patient_type: pd.patient_type || "",
      company: pd.company || "",
      ward_status: "Sent for billing"
    };
    setPatient(initialPatient);
    setUhid(est.uhid || "");
    setIpNumber(est.ip_number || "");
    setSelectedKeys([]);
    setPatientWard("SEMI-PRIVATE WARD");
    setItems(parseItems(est.items).map((it, idx) => ({
      ...EMPTY_ITEM, ...it,
      _baseRate: parseFloat(it.rate) || 0,
      amount: parseFloat(it.amount) || (parseFloat(it.quantity || 1) * parseFloat(it.rate || 0)),
      _key: `est_${idx}_${Date.now()}`, _fromInvest: false,
    })));
    setNewItem(EMPTY_ITEM);
    setFormRaw(estToForm(est));
    setEditingEst({ id: est.id, estimate_number: est.estimate_number, bill_no: est.bill_no, status: est.status });
    setInsuranceData({
      isInsuranceBill: Boolean(est.is_insurance_bill),
      claimNumber: est.claim_number || pd.claim_number || pd.referral_number || "",
      idCardNumber: est.id_card_number || pd.id_card_number || pd.card_no || "",
      insuranceBillNumber: est.insurance_bill_number || "",
      companyName: est.company_name || pd.company || pd.company_code || "",
    });
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch full patient & admission details from search API to populate card fields
    const searchVal = est.uhid || est.ip_number;
    if (searchVal) {
      try {
        const param = est.uhid ? `uhid=${encodeURIComponent(est.uhid)}` : `ipNumber=${encodeURIComponent(est.ip_number)}`;
        const raw = await apiRequest(`${BASE}search-discharge-patient/?${param}`, "GET");
        const res = raw?.success && raw?.data?.success ? raw.data.data : (raw?.success ? raw.data : raw);
        const p = res?.patient;
        if (p) {
          setPatient(prev => ({
            ...prev,
            ...p,
            patient_name: p.patient_name || prev?.patient_name,
            doctor: p.doctor || prev?.doctor,
            admission_date: p.admission_date || prev?.admission_date,
            room_no: p.room_no || prev?.room_no,
            total_days: p.total_days ?? prev?.total_days,
            mobile: p.mobile || prev?.mobile,
            patient_type: p.patient_type || prev?.patient_type,
            company: p.company || prev?.company,
            address: p.address || prev?.address,
            guardian: p.guardian || prev?.guardian,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch full patient details on edit:", err);
      }
    }

    const refStr = est.bill_no || est.estimate_number || "";
    showToast(`✏️ Record ${refStr} loaded — edit & save`);
  }, []);

  // ── Save / Update Estimate ─────────────────────────────────────────────────
  const handleSaveEstimate = () => {
    if (!patient) { showToast("Search a patient first", true); return; }
    if (!items.length) { showToast("Add at least one item", true); return; }
    if (editingEst?.id && editingEst.status === "Billed") {
      setEditReasonText("");
      setEditReasonModal({ actionType: "estimate" });
    } else {
      executeSave("estimate", "");
    }
  };

  // ── Save as Final Bill / Update Bill / Convert Estimate ────────────────────
  const handleSaveBill = () => {
    if (!patient) { showToast("Search a patient first", true); return; }
    if (isInsurancePatient) {
      showToast("Save as Final Bill is only available for Non-Insurance patients", true);
      return;
    }
    if (!items.length) { showToast("Add at least one item", true); return; }
    if (editingEst?.id && editingEst.status === "Billed") {
      setEditReasonText("");
      setEditReasonModal({ actionType: "bill" });
    } else {
      setSelectedPaymentMode("Cash");
      setPendingSaveIntent({ actionType: "bill", reason: "", customInsurance: null });
      setShowPaymentModal(true);
    }
  };

  const executeSave = async (actionType, reason, customInsurance = null, paymentMethod = "Cash") => {
    setSaving(true);
    setEditReasonModal(null);
    setShowPaymentModal(false);
    setPendingSaveIntent(null);
    const activeInsurance = customInsurance || insuranceData;
    const isIns = actionType === "insurance_bill" || Boolean(activeInsurance.isInsuranceBill);
    const insPayload = { ...activeInsurance, isInsuranceBill: isIns };

    try {
      const t = calcTotals(items, form);
      if (actionType === "estimate") {
        const res = editingEst?.id
          ? await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient, reason, insPayload, null))
          : await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Estimate", patient, "", insPayload, null));
        const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
        if (d?.id) {
          showToast(`✓ Estimate saved — ${d.estimate_number || ""}`);
          handleReset(); setEstRefresh(n => n + 1); setTab("estimates");
        } else showToast(JSON.stringify(res?.error || res), true);
      } else {
        if (editingEst?.id && editingEst.status === "Billed") {
          const res = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Billed", patient, reason, insPayload, paymentMethod));
          const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id || d?.bill_no) {
            showToast(isIns ? `✓ Insurance Bill updated — ${d.insurance_bill_number || d.bill_no || ""}` : `✓ Bill updated — ${d.bill_no || ""}`);
            setPrintBillModal({ ...d, patient_details: { ...(patient || {}), ...(d.patient_details || {}) } });
            handleReset(); setBillRefresh(n => n + 1); setTab("bills");
          } else showToast(JSON.stringify(res?.error || res), true);
        } else if (editingEst?.id) {
          await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient, reason, insPayload, paymentMethod));
          const res = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/convert-to-bill/`, "POST", { payment_method: paymentMethod });
          let d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id || d?.bill_no) {
            if (isIns) {
              const insRes = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/convert-to-insurance/`, "POST", {
                claim_number: insPayload.claimNumber,
                id_card_number: insPayload.idCardNumber,
                insurance_bill_number: insPayload.insuranceBillNumber,
                company_name: insPayload.companyName,
              });
              if (insRes && (insRes.data?.data || insRes.data)) {
                d = { ...d, ...(insRes.data?.data || insRes.data) };
              }
            }
            showToast(isIns ? `✓ Converted to Insurance Bill — ${d.insurance_bill_number || d.bill_no || ""}` : `✓ Converted to Bill — ${d.bill_no || ""}`);
            setPrintBillModal({ ...d, patient_details: { ...(patient || {}), ...(d.patient_details || {}) } });
            handleReset(); setEstRefresh(n => n + 1); setBillRefresh(n => n + 1); setTab("bills");
          } else showToast(JSON.stringify(res?.error || res), true);
        } else {
          const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Billed", patient, "", insPayload, paymentMethod));
          const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id) {
            showToast(isIns ? `✓ Insurance Bill saved — ${d.insurance_bill_number || d.bill_no || ""}` : `✓ Bill saved — ${d.bill_no || ""}`);
            setPrintBillModal({ ...d, patient_details: { ...(patient || {}), ...(d.patient_details || {}) } });
            handleReset(); setBillRefresh(n => n + 1); setTab("bills");
          } else showToast(JSON.stringify(res?.error || res), true);
        }
      }
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrap>
      <GlobalStyle />
      {toast && <Toast $err={toast.err}>{toast.msg}</Toast>}

      <AppBar>
        <AppTitle>🏥 HMS — Discharge Billing</AppTitle>
      </AppBar>

      <Content>
        <TabBar>
          <Tab $active={tab === "create"} onClick={() => setTab("create")}>CREATE BILL</Tab>
          <Tab $active={tab === "requests"} onClick={() => setTab("requests")}>
            DISCHARGE REQUESTS
            <ReqCountBadge $active={tab === "requests"}>{dischargeRequests.length}</ReqCountBadge>
          </Tab>
          <Tab $active={tab === "estimates"} onClick={() => setTab("estimates")}>VIEW ESTIMATE</Tab>
          <Tab $active={tab === "bills"} onClick={() => setTab("bills")}>VIEW BILLS</Tab>
        </TabBar>

        {/* ═══ DISCHARGE REQUESTS TAB ═══ */}
        {tab === "requests" && (
          <Card>
            <CardHead>
              <CardTitle>Discharge Requests (Sent for Billing)</CardTitle>
              <Badge $v="billed">{filteredRequests.length} Pending Request{filteredRequests.length === 1 ? "" : "s"}</Badge>
            </CardHead>

            <TTBar>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", color: T.textMid, fontWeight: 600 }}>Show up to</span>
                <TableSelect
                  value={reqPageSize}
                  onChange={e => { setReqPageSize(Number(e.target.value)); setReqPage(1); }}
                >
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </TableSelect>
                <span style={{ fontSize: "0.82rem", color: T.textMid, fontWeight: 600, marginLeft: 4 }}>Date:</span>
                <input
                  type="date"
                  value={reqDateFilter === "all" ? "" : reqDateFilter}
                  onChange={e => {
                    const val = e.target.value || "all";
                    setReqDateFilter(val);
                    setReqPage(1);
                  }}
                  style={{
                    height: 32, padding: "0 10px", fontSize: "0.82rem",
                    border: `1px solid ${T.border}`, borderRadius: 6,
                    color: T.textMain, background: "#fff", cursor: "pointer",
                  }}
                />
                <Btn
                  $ghost
                  $sm
                  type="button"
                  onClick={() => { setReqDateFilter(getLocalTodayStr()); setReqPage(1); }}
                  style={{
                    height: 32,
                    borderColor: reqDateFilter === getLocalTodayStr() ? T.primary : T.border,
                    color: reqDateFilter === getLocalTodayStr() ? T.primary : T.textMid,
                    background: reqDateFilter === getLocalTodayStr() ? "#f0fdfa" : "#fff",
                  }}
                >
                  Today
                </Btn>
                <Btn
                  $ghost
                  $sm
                  type="button"
                  onClick={() => { setReqDateFilter("all"); setReqPage(1); }}
                  style={{
                    height: 32,
                    borderColor: reqDateFilter === "all" ? T.primary : T.border,
                    color: reqDateFilter === "all" ? T.primary : T.textMid,
                    background: reqDateFilter === "all" ? "#f0fdfa" : "#fff",
                  }}
                >
                  All Dates
                </Btn>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", color: T.textMid, fontWeight: 600 }}>Search:</span>
                <FInput
                  type="text"
                  placeholder="Search UHID / IP No / Patient Name / Doctor..."
                  value={reqSearch}
                  onChange={e => { setReqSearch(e.target.value); setReqPage(1); }}
                  style={{ width: 280, height: 32 }}
                />
                <Btn
                  $ghost
                  $sm
                  type="button"
                  onClick={() => fetchDischargeRequests()}
                  disabled={reqLoading}
                  title="Refresh Discharge Requests"
                  style={{ height: 32, padding: "0 10px" }}
                >
                  {reqLoading ? <MiniSpinner /> : "🔄"}
                </Btn>
              </div>
            </TTBar>

            <TWrap>
              <Tbl>
                <Thead>
                  <tr>
                    <SortTh onClick={() => handleReqSort("uhid")}>
                      UHID {reqSortField === "uhid" ? (reqSortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </SortTh>
                    <SortTh onClick={() => handleReqSort("patientName")}>
                      PATIENT NAME {reqSortField === "patientName" ? (reqSortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </SortTh>
                    <SortTh onClick={() => handleReqSort("doctorName")}>
                      DOCTOR {reqSortField === "doctorName" ? (reqSortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </SortTh>
                    <Th>ACTIONS</Th>
                  </tr>
                </Thead>
                <tbody>
                  {reqLoading ? (
                    <tr>
                      <Td colSpan={4} style={{ textAlign: "center", padding: "36px 14px", color: T.textMuted }}>
                        <MiniSpinner /> Loading discharge requests...
                      </Td>
                    </tr>
                  ) : paginatedRequests.length === 0 ? (
                    <tr>
                      <Td colSpan={4} style={{ textAlign: "center", padding: "36px 14px", color: T.textMuted }}>
                        No pending discharge requests found
                      </Td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req, idx) => (
                      <Tr key={req.id || req.ipNumber || idx}>
                        <Td style={{ fontWeight: 700, color: T.primary, whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span>{req.uhid || "—"}</span>
                            <span style={{
                              fontSize: "0.7rem", fontWeight: 700, padding: "2px 9px",
                              borderRadius: "12px", background: "#dcfce7", color: "#15803d",
                              border: "1px solid #bbf7d0"
                            }}>
                              Sent for billing (IP: {req.ipNumber || "—"})
                            </span>
                            {req.roomNo && (
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
                                borderRadius: "10px", background: "#f1f5f9", color: T.textMid,
                                border: `1px solid ${T.border}`
                              }}>
                                Room: {req.roomNo}{req.bedNo ? ` / Bed ${req.bedNo}` : ""}
                              </span>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <span style={{ fontWeight: 700, color: T.textMain }}>{req.patientName || "—"}</span>
                          <span style={{ fontSize: "0.78rem", color: T.textMid, marginLeft: 8 }}>
                            ({req.age || "—"} {req.age_type || "Y"}, {req.gender || "—"})
                          </span>
                          {(req.requestTime || req.requestDateDisplay) && (
                            <span style={{ fontSize: "0.74rem", color: T.textMuted, marginLeft: 10 }}>
                              🕒 {req.requestDateDisplay ? `${req.requestDateDisplay} ` : ""}{req.requestTime || ""}
                            </span>
                          )}
                        </Td>
                        <Td style={{ fontWeight: 600, color: T.textMid }}>
                          {req.doctorName || "—"}
                        </Td>
                        <Td>
                          <ConvertActionBtn
                            type="button"
                            onClick={() => handleProceedToBilling(req)}
                            title="Proceed to Discharge Billing — Loads patient into Create Bill"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </ConvertActionBtn>
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Tbl>
            </TWrap>

            {filteredRequests.length > 0 && (
              <Pager>
                <div>
                  Showing {((reqPage - 1) * reqPageSize) + 1} to {Math.min(reqPage * reqPageSize, filteredRequests.length)} of {filteredRequests.length} discharge requests
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <PB type="button" onClick={() => setReqPage(p => Math.max(1, p - 1))} disabled={reqPage === 1}>Prev</PB>
                  {Array.from({ length: Math.min(reqTotalPages, 5) }, (_, i) => i + 1).map(n => (
                    <PB key={n} type="button" $active={reqPage === n} onClick={() => setReqPage(n)}>{n}</PB>
                  ))}
                  <PB type="button" onClick={() => setReqPage(p => Math.min(reqTotalPages, p + 1))} disabled={reqPage === reqTotalPages}>Next</PB>
                </div>
              </Pager>
            )}
          </Card>
        )}

        {/* ═══ CREATE / EDIT TAB ═══ */}
        {tab === "create" && (<>

          {/* Patient search & details */}
          <Card>
            <CardHead>
              <CardTitle>Patient Lookup &amp; Admission Information</CardTitle>
              {patient ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!patient.is_ready_for_billing && (
                    <WardWarningPill>
                      ⚠️ Ward Status: {patient.ward_status || "Not Sent for billing"}
                    </WardWarningPill>
                  )}
                  <Badge $v={editingEst ? "converting" : "billed"}>
                    {editingEst ? `✏️ Editing ${editingEst.bill_no || editingEst.estimate_number || "Record"}` : "✓ Active Admission"}
                  </Badge>
                </div>
              ) : (
                <span style={{ fontSize: "0.74rem", color: T.textMuted }}>Enter UHID or IP to search</span>
              )}
            </CardHead>

            <SearchSectionWrap>
              {/* Top Row: Search by UHID and IP Number */}
              <TopSearchRow>
                {/* UHID Search */}
                <FG>
                  <FL>UHID <Req>*</Req></FL>
                  <SearchInputWrap>
                    <FInput
                      value={uhid}
                      onChange={e => { setUhid(e.target.value); setSearchErr(""); }}
                      placeholder="e.g. S026/00548"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          openUhidSearch();
                        }
                      }}
                      style={{ paddingRight: 38 }}
                    />
                    <SearchActionBtn onClick={openUhidSearch} disabled={searching} title="Search UHID">
                      {searching ? <MiniSpinner /> : "🔍"}
                    </SearchActionBtn>
                  </SearchInputWrap>
                </FG>

                {/* IP Number Search */}
                <FG>
                  <FL>IP Number <Req>*</Req></FL>
                  <SearchInputWrap>
                    <FInput
                      value={ipNumber}
                      onChange={e => { setIpNumber(e.target.value); setSearchErr(""); }}
                      placeholder="e.g. S026/500017"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          openIpSearch();
                        }
                      }}
                      style={{ paddingRight: 38 }}
                    />
                    <SearchActionBtn onClick={openIpSearch} disabled={searching} title="Search IP Number">
                      {searching ? <MiniSpinner /> : "🔍"}
                    </SearchActionBtn>
                  </SearchInputWrap>
                </FG>
              </TopSearchRow>

              {searchErr && (
                <div style={{ color: T.danger, fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  ⚠️ {searchErr}
                </div>
              )}

              {/* Patient Profile Card */}
              {patient ? (
                <PatientProfileCard>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <PatientAvatar>{getInitials(patient.patient_name)}</PatientAvatar>
                    <PatientMainInfo>
                      <PatientNameRow>
                        <PatientNameText>{patient.patient_name}</PatientNameText>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: T.textMid }}>
                          {patient.age || "—"} yrs / {patient.gender || "—"}
                        </span>
                      </PatientNameRow>
                      <PatientMetaPills>
                        <MetaChip $mono>UHID: {patient.uhid}</MetaChip>
                        <MetaChip $mono>IP: {patient.ip_number}</MetaChip>
                        {patient.mobile && <span>📞 {patient.mobile}</span>}
                      </PatientMetaPills>
                    </PatientMainInfo>
                  </div>

                  <PatientMetrics2Col>
                    {/* Left Column: Doctor & Admission Date */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                      <MetricBox>
                        <MetricLabel>👨‍⚕️ Attending Doctor</MetricLabel>
                        <MetricVal title={patient.doctor}>{patient.doctor || "—"}</MetricVal>
                      </MetricBox>
                      <MetricBox>
                        <MetricLabel>📅 Admission Date</MetricLabel>
                        <MetricVal>{formatAdmissionDate(patient.admission_date)}</MetricVal>
                      </MetricBox>
                    </div>

                    {/* Right Column: Room & Stay and Billing Type */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                      <MetricBox>
                        <MetricLabel>🛏️ Room &amp; Stay</MetricLabel>
                        <MetricVal>{patient.room_no ? `Room ${patient.room_no}` : "—"} · {patient.total_days ?? 0} Days</MetricVal>
                      </MetricBox>
                      <MetricBox>
                        <MetricLabel>🏢 Billing Type</MetricLabel>
                        <MetricVal style={{ color: T.primary, textTransform: "uppercase" }} title={patient.company || patient.company_code}>
                          {patient.patient_type || "General"}
                          {patient.company ? ` / ${patient.company}` : patient.company_code ? ` / ${patient.company_code}` : ""}
                        </MetricVal>
                      </MetricBox>
                    </div>
                  </PatientMetrics2Col>
                  {insuranceData.isInsuranceBill && (
                    <div style={{
                      marginTop: 10, padding: "8px 12px", background: "#ecfdf5",
                      border: "1px solid #a7f3d0", borderRadius: 6, display: "flex",
                      alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
                      gap: 10, fontSize: "0.76rem", color: "#065f46"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                        <span>🛡️ Insurance Bill:</span>
                        <span>{insuranceData.companyName || patient.company || "Insurance"}</span>
                      </div>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span><strong>Claim No:</strong> {insuranceData.claimNumber || "—"}</span>
                        <span><strong>ID Card No:</strong> {insuranceData.idCardNumber || "—"}</span>
                        <span><strong>Ins Bill No:</strong> {insuranceData.insuranceBillNumber || "—"}</span>
                      </div>
                    </div>
                  )}
                </PatientProfileCard>
              ) : (
                <PatientEmptyState>
                  <span>🔍 Enter a <strong>UHID</strong> or <strong>IP Number</strong> above and click Search to load patient records &amp; stay details.</span>
                </PatientEmptyState>
              )}
            </SearchSectionWrap>
          </Card>

          {/* Bill type selector + Items */}
          <Card>
            <CardHead>
              <CardTitle>Investigation / Billing Items</CardTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {itemsLoading && (
                  <span style={{ fontSize: "0.71rem", color: T.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                    <MiniSpinner />
                    Loading items…
                  </span>
                )}
                {!itemsLoading && allItems.length === 0 && selectedBT.billTypeNo && (
                  <span style={{ fontSize: "0.71rem", color: T.amber, fontWeight: 600 }}>
                    ⚠ No items for {selectedBT.bill_name}
                  </span>
                )}
                {items.length > 0 && (
                  <span style={{ fontSize: "0.71rem", color: T.textMuted }}>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                    {items.filter(i => i._fromInvest).length > 0 && ` · ${items.filter(i => i._fromInvest).length} from investigation`}
                  </span>
                )}
              </div>
            </CardHead>

            {/* ── Bill type selection bar ── */}
            <BillTypeBar>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: T.textMid, flexShrink: 0, whiteSpace: "nowrap" }}>
                  Bill Type:
                </span>
                <div style={{ width: 300, minWidth: 220 }}>
                  <SearchSelect
                    options={billTypeOptions}
                    value={selectedBT.bill_type != null ? String(selectedBT.bill_type) : ""}
                    onChange={e => handleBillTypeChange({ target: { value: e.target.value } })}
                    placeholder="Search Bill Type..."
                    disabled={masterLoading}
                    height="32px"
                  />
                </div>
              </div>

              {(selectedBT.bill_type === "INSURANCE_PACKAGES" || selectedBT.isInsurance) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: T.textMid, flexShrink: 0, whiteSpace: "nowrap" }}>
                    Insurance Scheme:
                  </span>
                  <div style={{ width: 300, minWidth: 220 }}>
                    <SearchSelect
                      options={insuranceSchemes.map(s => ({
                        value: s.id,
                        label: s.name,
                        subLabel: `${s.total_items} items`,
                      }))}
                      value={selectedInsuranceScheme}
                      onChange={e => setSelectedInsuranceScheme(e.target.value)}
                      placeholder="Select Insurance Scheme..."
                      height="32px"
                    />
                  </div>
                </div>
              )}

              {masterLoading && (
                <span style={{ fontSize: "0.73rem", color: T.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                  <MiniSpinner /> Loading bill types…
                </span>
              )}
            </BillTypeBar>

            <ItemsSection
              items={items}
              newItem={newItem}
              onNIChange={handleNIChange}
              onItemSelect={handleItemSelect}
              onAdd={handleAddItem}
              onClear={() => setNewItem(EMPTY_ITEM)}
              onEdit={(key, field, val) => setItems(p => p.map(i => i._key === key ? recalcItem(i, field, val) : i))}
              onRemove={key => {
                setItems(p => p.filter(i => i._key !== key));
                setSelectedKeys(p => p.filter(k => k !== key));
              }}
              disabled={!patient}
              doctors={doctors}
              billTypeNo={selectedBT.billTypeNo}
              billTypeName={selectedBT.bill_name}
              allItems={allItems}
              itemsLoading={itemsLoading}
              selectedKeys={selectedKeys}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onApplyWard={applyWardMultiplier}
              patientWard={patientWard}
              rateCategory={rateCategory}
              onApplyRateCategory={applyRateCategory}
            />
          </Card>

          {/* Financials + actions */}
          <Card>
            <CardHead><CardTitle>Financial Assessment &amp; Settlement</CardTitle></CardHead>
            <FinancialGrid f={form} onChange={setForm} totals={totals} />
            <FinActions>
              <Btn $ghost onClick={handleReset}>✕ Reset</Btn>
              <Btn
                $amber
                onClick={handleSaveEstimate}
                disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing")}
                title={!patient ? "Search a patient first" : patient.ward_status !== "Sent for billing" ? "Ward status is not Sent for billing" : (editingEst ? "Update Estimate" : "Save as Estimate")}
              >
                {saving ? <Spinner /> : "📋"} {editingEst ? " Update Estimate" : " Save as Estimate"}
              </Btn>
              <Btn
                $primary
                onClick={handleConvertToInsuranceBill}
                disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing") || !isInsurancePatient}
                style={{
                  background: !isInsurancePatient
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                  boxShadow: !isInsurancePatient ? "none" : "0 2px 6px rgba(15,118,110,0.3)",
                  cursor: !isInsurancePatient || !patient || patient.ward_status !== "Sent for billing" ? "not-allowed" : "pointer",
                  opacity: !isInsurancePatient ? 0.55 : 1
                }}
                title={
                  !patient
                    ? "Search a patient first"
                    : !isInsurancePatient
                    ? "Only available for Insurance patients"
                    : patient.ward_status !== "Sent for billing"
                    ? "Patient ward status is not Sent for billing"
                    : "Directly convert and save as Insurance Bill"
                }
              >
                {saving ? <Spinner /> : "🛡️"} Convert to Insurance Bill
              </Btn>
              {editingEst && editingEst.status !== "Billed" ? (
                <Btn
                  $purple
                  onClick={handleSaveBill}
                  disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing") || isInsurancePatient}
                  style={{
                    background: isInsurancePatient ? "#94a3b8" : undefined,
                    boxShadow: isInsurancePatient ? "none" : undefined,
                    cursor: isInsurancePatient || !patient || patient.ward_status !== "Sent for billing" ? "not-allowed" : "pointer",
                    opacity: isInsurancePatient ? 0.55 : 1
                  }}
                  title={
                    !patient
                      ? "Search a patient first"
                      : isInsurancePatient
                      ? "Only available for Non-Insurance patients"
                      : patient.ward_status !== "Sent for billing"
                      ? "Patient ward status is not Sent for billing"
                      : "Convert & Save Bill"
                  }
                >
                  {saving ? <Spinner /> : "🧾"} Convert &amp; Save Bill
                </Btn>
              ) : (
                <Btn
                  $primary
                  onClick={handleSaveBill}
                  disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing") || isInsurancePatient}
                  style={{
                    background: isInsurancePatient ? "#94a3b8" : undefined,
                    boxShadow: isInsurancePatient ? "none" : undefined,
                    cursor: isInsurancePatient || !patient || patient.ward_status !== "Sent for billing" ? "not-allowed" : "pointer",
                    opacity: isInsurancePatient ? 0.55 : 1
                  }}
                  title={
                    !patient
                      ? "Search a patient first"
                      : isInsurancePatient
                      ? "Only available for Non-Insurance patients"
                      : patient.ward_status !== "Sent for billing"
                      ? "Patient ward status is not Sent for billing"
                      : "Save as Final Bill"
                  }
                >
                  {saving ? <Spinner /> : "🧾"} Save as Final Bill
                </Btn>
              )}
            </FinActions>
          </Card>
        </>)}

        {/* ═══ ESTIMATES TAB ═══ */}
        {tab === "estimates" && (
          <DischargeViewEstimates
            onEditConvert={handleEditConvert}
            onRefreshTrigger={estRefresh}
          />
        )}

        {/* ═══ BILLS TAB ═══ */}
        {tab === "bills" && (
          <DischargeViewBills onEditBill={handleEditConvert} onRefreshTrigger={billRefresh} />
        )}
      </Content>

      {/* ── Edit Reason Modal ── */}
      {editReasonModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(2px)", zIndex: 10000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, width: "100%", maxWidth: 460,
            overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.22)"
          }}>
            <div style={{ padding: "14px 20px", background: "#f8fafc", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: T.textMain }}>
                ✏️ Reason for Edit — #{editingEst?.bill_no || editingEst?.estimate_number || ""}
              </h3>
              <button style={{ border: "none", background: "transparent", fontSize: "1.2rem", cursor: "pointer", color: T.textMuted }} onClick={() => setEditReasonModal(null)}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: "0.82rem", color: T.textMid, marginBottom: 12 }}>
                Please specify the reason for updating this billing record:
              </p>
              <FG>
                <FL>Edit Reason *</FL>
                <textarea
                  rows={3}
                  value={editReasonText}
                  onChange={e => setEditReasonText(e.target.value)}
                  placeholder="e.g. Added new investigation item, updated discount, etc."
                  style={{
                    width: "100%", padding: "8px 10px", fontSize: "0.83rem",
                    borderRadius: 6, border: `1px solid ${T.border}`, outline: "none"
                  }}
                />
              </FG>
            </div>
            <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn $ghost onClick={() => setEditReasonModal(null)}>Cancel</Btn>
              <Btn $amber onClick={() => {
                const aType = editReasonModal.actionType;
                const rText = editReasonText;
                const cIns = editReasonModal.insurance || null;
                setEditReasonModal(null);
                if (aType === "estimate") {
                  executeSave("estimate", rText, cIns);
                } else {
                  setSelectedPaymentMode(aType === "insurance_bill" ? "Credit" : "Cash");
                  setPendingSaveIntent({ actionType: aType, reason: rText, customInsurance: cIns });
                  setShowPaymentModal(true);
                }
              }} disabled={saving || !editReasonText.trim()}>
                {saving ? <Spinner /> : "✓ Confirm & Proceed"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Mode Modal (Pay Now / Pay Later - same as Pharmacy) ── */}
      {showPaymentModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(2px)", zIndex: 10000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16
        }} onClick={() => setShowPaymentModal(false)}>
          <div style={{
            background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440,
            overflow: "hidden", boxShadow: "0 20px 45px rgba(0,0,0,0.22)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: "linear-gradient(135deg, #0f766e, #0d9488)",
              color: "#fff", padding: "14px 20px", display: "flex",
              alignItems: "center", justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                Select Payment Mode
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "24px 26px" }}>
              <div style={{ marginBottom: 18, color: "#475569", fontSize: "0.92rem", fontWeight: 500 }}>
                Choose how the patient will settle this discharge bill:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { value: "Cash", label: "Pay Now", desc: "Patient pays immediately (Cash / Card / UPI)" },
                  { value: "Credit", label: "Pay Later", desc: "Bill on credit — patient pays at a later date" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    onClick={() => setSelectedPaymentMode(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `2px solid ${selectedPaymentMode === opt.value ? "#0f766e" : "#e2e8f0"}`,
                      background: selectedPaymentMode === opt.value ? "#f0fdfa" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    <input
                      type="radio"
                      name="dischargePaymentMode"
                      value={opt.value}
                      checked={selectedPaymentMode === opt.value}
                      onChange={() => setSelectedPaymentMode(opt.value)}
                      style={{ accentColor: "#0f766e", marginTop: 3, width: 17, height: 17 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.97rem" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 3 }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div style={{
              padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0",
              display: "flex", justifyContent: "flex-end", gap: 10
            }}>
              <Btn $ghost onClick={() => setShowPaymentModal(false)}>Cancel</Btn>
              <Btn
                $primary
                disabled={saving}
                onClick={async () => {
                  const mode = selectedPaymentMode;
                  const intent = pendingSaveIntent || { actionType: "bill", reason: "", customInsurance: null };
                  setShowPaymentModal(false);
                  setPendingSaveIntent(null);
                  await executeSave(intent.actionType, intent.reason, intent.customInsurance, mode);
                }}
              >
                {saving ? <Spinner /> : "Proceed"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Patient Search Modal ── */}
      <PatientSearchModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={handlePatientSelect}
        initialQuery={patientSearchQuery}
        mode={patientSearchMode}
      />

      {/* ── Auto Print Modal after Saving ── */}
      <DischargeBillPrintModal
        isOpen={Boolean(printBillModal)}
        bill={printBillModal}
        onClose={() => setPrintBillModal(null)}
        doctors={doctors}
      />
    </PageWrap>
  );
};

export default DischargeBilling;