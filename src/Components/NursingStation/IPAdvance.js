import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import PatientSearchModal from "../Common/PatientSearchModal";
import { AdmittedPatientsPanel, AdmittedPatientSummaryCard } from "./AdmittedPatientsPanel";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @media print {
    body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .print-container { page-break-inside: avoid; }
  }
`;

const T = {
  teal:      "#0d9488",
  tealDark:  "#0f766e",
  tealLight: "#ccfbf1",
  blue:      "#2563eb",
  blueLight: "#dbeafe",
  violet:    "#7c3aed",
  violetL:   "#ede9fe",
  border:    "#e2e8f0",
  bg:        "#f1f5f9",
  white:     "#ffffff",
  text:      "#0f172a",
  muted:     "#64748b",
  label:     "#334155",
  readBg:    "#f8fafc",
  green:     "#10b981",
  greenLight:"#d1fae5",
  red:       "#ef4444",
  redLight:  "#fee2e2",
  tealGhost: "#f0fdfb",
  amber:     "#f59e0b",
  amberLight:"#fef3c7",
  orange:    "#ea580c",
  orangeLight:"#ffedd5",
  purple:    "#9333ea",
  purpleLight:"#f3e8ff",
  pink:      "#ec4899",
  pinkLight: "#fce7f3",
};

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.3); }
  50%      { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.8rem;
  color: ${T.text};
  background: ${T.bg};
  min-height: 100vh;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;
const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.75rem;
  opacity: 0.85;
  color: #fff;
`;

const Card = styled.div`
  background: ${T.white};
  border: 1px solid ${({ editing }) => editing ? T.teal : T.border};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${({ editing }) => editing
    ? `0 0 0 3px ${T.tealLight}`
    : "0 1px 4px rgba(0,0,0,0.05)"};
  animation: ${({ editing }) => editing ? pulse : "none"} 1.5s ease infinite;
  transition: border-color .2s, box-shadow .2s;
`;

const CardHead = styled.div`
  background: ${({ color }) =>
    color === "blue"   ? "linear-gradient(135deg,#1d4ed8,#2563eb)" :
    color === "violet" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" :
    color === "orange" ? "linear-gradient(135deg,#c2410c,#ea580c)" :
    color === "purple" ? "linear-gradient(135deg,#7e22ce,#9333ea)" :
                         "linear-gradient(135deg,#0f766e,#0d9488)"};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 9px 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
`;

const EditBanner = styled.div`
  background: ${T.amberLight};
  border-bottom: 1px solid #fcd34d;
  padding: 6px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardBody = styled.div`
  padding: 12px 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 6}, 1fr);
  gap: 7px 10px;
  align-items: end;
`;

const StatsWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${(props) => props.borderColor || T.teal};
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.muted};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
`;

const StatVal = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${T.text};
  line-height: 1.2;
`;

const StatSub = styled.div`
  font-size: 0.68rem;
  color: ${T.muted};
  margin-top: 3px;
`;

const F = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  grid-column: span ${({ span }) => span || 1};
`;

const Lbl = styled.label`
  font-size: 0.64rem;
  font-weight: 700;
  color: ${T.label};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const inputBase = `
  height: 34px;
  padding: 0 10px;
  font-size: 0.84rem;
  border: 1px solid ${T.border};
  border-radius: 6px;
  color: ${T.text};
  width: 100%;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  transition: border-color .14s, box-shadow .14s;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Inp = styled.input`
  ${inputBase}
  background: ${({ readOnly }) => readOnly ? T.readBg : T.white};
  color: ${({ readOnly }) => readOnly ? T.muted : T.text};
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
  &:disabled { background: ${T.readBg}; color: ${T.muted}; cursor: not-allowed; }
`;

const Select = styled.select`
  ${inputBase}
  background: ${T.white};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 16px;
  padding-right: 26px;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
`;

const Btn = styled.button`
  height: 34px;
  padding: 0 18px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: opacity .14s, transform .1s;
  background: ${({ v, c }) =>
    v === "reset"   ? "#e2e8f0" :
    v === "cancel"  ? T.red     :
    c === "blue"    ? T.blue    :
    c === "orange"  ? T.orange  :
    c === "violet"  ? T.violet  :
    c === "purple"  ? T.purple  :
    c === "red"     ? T.red     : T.teal};
  color: ${({ v }) => v === "reset" ? T.label : "#fff"};
  &:hover { opacity: .88; }
  &:active { transform: scale(.97); }
  &:disabled { opacity: .45; cursor: not-allowed; transform: none; }
`;

const GroupLabel = styled.div`
  grid-column: 1 / -1;
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: ${({ c }) => c === "blue" ? T.blue : c === "violet" ? T.violet : T.teal};
  border-bottom: 2px solid ${({ c }) =>
    c === "blue" ? T.blueLight : c === "violet" ? T.violetL : T.tealLight};
  padding-bottom: 3px;
  margin-top: 6px;
`;

// ── Kebab Menu ────────────────────────────────────────────────────────────────
const KebabWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const KebabBtn = styled.button`
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid ${T.border};
  background: ${T.white};
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; font-weight: 900; line-height: 1;
  color: ${T.muted};
  transition: background .12s, color .12s;
  letter-spacing: -1px;
  &:hover { background: ${T.bg}; color: ${T.text}; }
`;

const DropMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 99999;
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 170px;
  overflow: hidden;
  display: ${({ open }) => open ? "block" : "none"};
  animation: ${slideDown} 0.12s ease;
`;

const DropItem = styled.button`
  display: flex; align-items: center; gap: 9px;
  padding: 9px 14px; font-size: 0.74rem; font-weight: 600;
  color: ${({ danger }) => danger ? T.red : ({ purple }) => purple ? T.purple : T.text};
  color: ${({ danger, purple }) => danger ? T.red : purple ? T.purple : T.text};
  background: none; border: none; width: 100%; text-align: left;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  opacity: ${({ disabled }) => disabled ? 0.38 : 1};
  font-family: inherit;
  transition: background .1s;
  &:hover:not([disabled]) {
    background: ${({ danger, purple }) => danger ? T.redLight : purple ? T.purpleLight : T.bg};
  }
`;

const DropDivider = styled.div`height: 1px; background: ${T.border}; margin: 2px 0;`;

// ── Split Box ─────────────────────────────────────────────────────────────────
const SplitBox = styled.div`
  grid-column: 1 / -1;
  background: #f8fafc;
  border: 1.5px dashed ${T.tealLight};
  border-radius: 7px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SplitHeader = styled.div`
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: ${T.teal};
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  align-items: end;
`;

const SplitNote = styled.div`
  font-size: 0.67rem;
  font-weight: 700;
  color: ${({ ok }) => ok ? T.green : T.red};
  transition: color .15s;
`;

const BigInp = styled.input`
  height: 36px;
  padding: 0 10px;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid ${T.border};
  border-radius: 6px;
  color: ${T.tealDark};
  width: 100%;
  outline: none;
  font-family: inherit;
  background: ${T.tealGhost};
  transition: border-color .14s, box-shadow .14s;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
  &::placeholder { color: #94a3b8; font-weight: 400; font-size: 0.78rem; }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 9px 14px;
  border-top: 1px solid ${T.border};
  background: #fafafa;
  align-items: center;
  flex-wrap: wrap;
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const TblWrap = styled.div`
  overflow-x: auto;
  overflow-y: visible;
  padding: 0 14px 60px;
  min-height: 240px;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.71rem;
  overflow: visible;
`;

const Th = styled.th`
  background: #f1f5f9;
  padding: 10px 10px;
  text-align: ${({ right }) => right ? "right" : "left"};
  font-weight: 700;
  border-bottom: 2px solid ${T.border};
  white-space: nowrap;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: ${T.muted};
`;

const Tr = styled.tr`
  animation: ${rowIn} 0.2s ease;
  background: ${({ even }) => even ? "#f8fafc" : "#fff"};
  &:hover { background: ${T.tealGhost}; }
`;

const Td = styled.td`
  padding: 9px 10px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  font-size: 0.82rem;
  text-align: ${({ right }) => right ? "right" : "left"};
`;

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.64rem;
  font-weight: 700;
  background: ${({ status }) =>
    status === "Paid"      ? T.greenLight  :
    status === "Cancelled" ? T.redLight    :
    status === "Edited"    ? T.orangeLight :
    status === "Refunded"  ? T.purpleLight : T.amberLight};
  color: ${({ status }) =>
    status === "Paid"      ? T.green   :
    status === "Cancelled" ? T.red     :
    status === "Edited"    ? T.orange  :
    status === "Refunded"  ? T.purple  : T.amber};
  border: 1px solid ${({ status }) =>
    status === "Paid"      ? "#bbf7d0" :
    status === "Cancelled" ? "#fecaca" :
    status === "Edited"    ? "#fed7aa" :
    status === "Refunded"  ? "#d8b4fe" : "#fde68a"};
`;

// ── Table Controls & Pagination ───────────────────────────────────────────────
const TTBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid ${T.border};
  background: #fff;
  flex-wrap: wrap;
  gap: 8px;
`;

const TableSelect = styled.select`
  height: 28px;
  width: 72px;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: ${T.teal};
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #6b7280;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
`;

const PB = styled.button`
  height: 28px;
  padding: 0 13px;
  font-size: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: ${p => p.active ? T.teal : '#fff'};
  color: ${p => p.active ? '#fff' : '#374151'};
  cursor: pointer;
  font-weight: ${p => p.active ? '700' : '500'};
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${p => p.active ? T.teal : '#f3f4f6'};
  }
`;

// ── Modal Base ────────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: ${T.white};
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: ${({ wide }) => wide ? "700px" : "520px"}; width: 95%;
  max-height: 90vh; overflow-y: auto;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalHeader = styled.div`
  background: ${({ color }) =>
    color === "purple" ? "linear-gradient(135deg,#7e22ce,#9333ea)" :
                         "linear-gradient(135deg,#0f766e,#0d9488)"};
  color: #fff;
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
  border-radius: 10px 10px 0 0;
  position: sticky; top: 0; z-index: 1;
`;

const ModalTitle = styled.h3`font-size: 0.9rem; font-weight: 700; margin: 0;`;

const CloseBtn = styled.button`
  background: none; border: none; color: #fff;
  font-size: 1.5rem; cursor: pointer; padding: 0;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  &:hover { opacity: 0.8; }
`;

const ModalBody = styled.div`padding: 16px;`;

const ModalActions = styled.div`
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 12px; border-top: 1px solid ${T.border}; margin-top: 12px;
`;

// ── Refund Modal Specific ─────────────────────────────────────────────────────
const RefundSummaryBox = styled.div`
  background: ${T.purpleLight};
  border: 1.5px solid #d8b4fe;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RefundSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
`;

const RefundSummaryLabel = styled.span`
  color: ${T.muted};
  font-weight: 600;
`;

const RefundSummaryValue = styled.span`
  font-weight: 800;
  color: ${({ color }) => color || T.text};
  font-size: ${({ large }) => large ? "1rem" : "0.75rem"};
`;

const RefundWarning = styled.div`
  background: ${T.redLight};
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.red};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RefundInputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const RefundBigInp = styled.input`
  height: 44px;
  padding: 0 14px;
  font-size: 1.2rem;
  font-weight: 800;
  border: 2px solid ${({ error }) => error ? T.red : "#d8b4fe"};
  border-radius: 8px;
  color: ${T.purple};
  width: 100%;
  outline: none;
  font-family: inherit;
  background: ${T.purpleLight};
  transition: border-color .14s, box-shadow .14s;
  &:focus { border-color: ${T.purple}; box-shadow: 0 0 0 3px #f3e8ff; }
  &::placeholder { color: #c4b5fd; font-weight: 400; font-size: 0.9rem; }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

// ── Refund History Table ──────────────────────────────────────────────────────
const HistorySection = styled.div`
  margin-top: 16px;
  border-top: 2px solid ${T.border};
  padding-top: 14px;
`;

const HistoryTitle = styled.div`
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${T.purple};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: ${T.purpleLight};
    border-radius: 2px;
  }
`;

const HistoryTbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.71rem;
`;

const HTh = styled.th`
  padding: 5px 8px;
  text-align: ${({ right }) => right ? "right" : "left"};
  font-weight: 700;
  border-bottom: 2px solid ${T.purpleLight};
  font-size: 0.63rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: ${T.purple};
  background: #faf5ff;
`;

const HTr = styled.tr`
  animation: ${slideDown} 0.2s ease;
  background: ${({ even }) => even ? "#faf5ff" : "#fff"};
  &:hover { background: ${T.purpleLight}; }
`;

const HTd = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid #f3e8ff;
  text-align: ${({ right }) => right ? "right" : "left"};
`;

const NoHistoryNote = styled.div`
  text-align: center;
  padding: 18px;
  font-size: 0.72rem;
  color: ${T.muted};
  background: #faf5ff;
  border-radius: 6px;
  border: 1px dashed #d8b4fe;
`;

// ── Bill Slip ─────────────────────────────────────────────────────────────────
const BillSlipContainer = styled.div`
  width: 100%; max-width: 330px; margin: 0 auto;
  padding: 12px 14px; border: 1px solid #111;
  font-family: Arial, 'Segoe UI', sans-serif; background: #fff;
  color: #000;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
`;

// ── Refund Badge in table ─────────────────────────────────────────────────────
const RefundTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  background: ${T.purpleLight};
  color: ${T.purple};
  border: 1px solid #d8b4fe;
  margin-left: 4px;
`;

// ─── Searchable Select Component ─────────────────────────────────────────────
function SearchSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Search & select...",
  disabled = false,
  error = false,
  name = "",
  style = {},
  height = "32px",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  const normOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === "string") return { value: opt, label: opt, sub: "" };
      const val = opt.value ?? opt.id ?? opt.bill_type ?? "";
      const lbl = opt.label ?? opt.name ?? opt.bill_name ?? String(val);
      const sub = opt.subLabel ?? opt.billTypeNo ?? "";
      return { value: String(val), label: String(lbl), sub: sub ? String(sub) : "" };
    });
  }, [options]);

  const selectedOpt = useMemo(() => {
    return normOptions.find(o => String(o.value) === String(value));
  }, [normOptions, value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return normOptions;
    const q = query.toLowerCase();
    return normOptions.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      (o.sub && o.sub.toLowerCase().includes(q))
    );
  }, [normOptions, query]);

  useEffect(() => {
    const handleOut = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  const handleChoose = (opt) => {
    if (disabled) return;
    onChange && onChange({ target: { name, value: opt.value } });
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange && onChange({ target: { name, value: "" } });
    setQuery("");
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", ...style }}>
      <div
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setQuery(""); } }}
        style={{
          height: height,
          boxSizing: "border-box",
          padding: "0 10px",
          fontSize: "0.78rem",
          border: error ? "1px solid #ef4444" : isOpen ? "1px solid #0d9488" : "1px solid #e2e8f0",
          borderRadius: "6px",
          background: disabled ? "#f8fafc" : "#fff",
          color: disabled ? "#64748b" : selectedOpt ? "#0f172a" : "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: isOpen ? "0 0 0 2px rgba(13,148,136,0.15)" : "none",
          userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selectedOpt ? (selectedOpt.sub ? `${selectedOpt.label} (${selectedOpt.sub})` : selectedOpt.label) : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          {selectedOpt && !disabled && (
            <span
              onClick={handleClear}
              title="Clear"
              style={{ fontSize: "0.72rem", color: "#94a3b8", cursor: "pointer", padding: "0 2px" }}
            >
              ✕
            </span>
          )}
          <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{isOpen ? "▲" : "▼"}</span>
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 3px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 99999,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "6px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              style={{
                width: "100%",
                height: "28px",
                padding: "0 8px",
                boxSizing: "border-box",
                fontSize: "0.74rem",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px", fontSize: "0.74rem", color: "#94a3b8", textAlign: "center" }}>
              No matches found
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleChoose(opt)}
                style={{
                  padding: "7px 10px",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  background: String(opt.value) === String(value) ? "#f0fdf4" : "transparent",
                  color: String(opt.value) === String(value) ? "#0f766e" : "#0f172a",
                  fontWeight: String(opt.value) === String(value) ? 700 : 400,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #f8fafc",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e6f7f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = String(opt.value) === String(value) ? "#f0fdf4" : "transparent"; }}
              >
                <span>{opt.label}</span>
                {opt.sub && <span style={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 600 }}>{opt.sub}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_COMMON = {
  uhid: "", ipNumber: "", ipSerial: "", name: "", age: "", ageType: "Y", gender: "", mobile: "",
  roomNo: "", bedNo: "", admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "", address: "", totalDays: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const today = () => new Date().toISOString().split("T")[0];

export default function IPAdvance({ patient: propPatient, uhid: propUhid, ipNumber: propIpNumber, onClose, onSaved }) {
  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const location = useLocation();
  const navState = location?.state || {};
  const patient = propPatient || navState.patient || navState.patient_details || navState.patientData || navState.admission || navState.record || (navState.uhid || navState.ipNumber || navState.ip_number ? navState : null);

  // ── Admission ─────────────────────────────────────────────────────────────
  const [common, setCommon]     = useState(EMPTY_COMMON);
  const [admissionId, setAdmId] = useState(null);
  const [searchingAdm, setSearchingAdm] = useState(false);
  const [admittedCount, setAdmittedCount] = useState(0);
  const [admittedRefreshKey, setAdmittedRefreshKey] = useState(0);

  // ── Patient search modal state & handlers ──────────────────────────────────
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearchMode, setPatientSearchMode] = useState("ip");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const openUhidSearch = () => {
    setPatientSearchMode("uhid");
    setPatientSearchQuery(common.uhid || "");
    setShowPatientModal(true);
  };

  const openIpSearch = () => {
    setPatientSearchMode("ip");
    setPatientSearchQuery(common.ipNumber || "");
    setShowPatientModal(true);
  };

  const handlePatientSelect = (data) => {
    const ip = data.ipNumber || data.ip_number || "";
    const uhid = data.uhid || data.UHID || "";
    if (ip) {
      setCommon(p => ({ ...p, ipNumber: ip, uhid: uhid || p.uhid }));
      loadActiveAdmission({ ip_number: ip });
    } else if (uhid) {
      setCommon(p => ({ ...p, uhid: uhid }));
      loadActiveAdmission({ uhid: uhid });
    }
  };

  // ── Entry form ────────────────────────────────────────────────────────────
  const [date, setDate]               = useState(today());
  const [amount, setAmount]           = useState("");
  const [ipAdv, setIpAdv]             = useState("");
  const [billAdv, setBillAdv]         = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving]           = useState(false);
  const [activeTab, setActiveTab]     = useState("create");
  const DEFAULT_BILL_TYPE             = "1";
  const DEFAULT_BILL_TYPE_NO          = "AD01";

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState(null);
  const advanceFormRef = useRef(null);

  // ── Records ───────────────────────────────────────────────────────────────
  const [payments, setPayments]                 = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading]                   = useState(false);

  // ── Filters & Search ──────────────────────────────────────────────────────
  const [filterFromDate, setFilterFromDate]       = useState(today());
  const [filterToDate, setFilterToDate]           = useState(today());
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterStatus, setFilterStatus]           = useState("");
  const [tSearch, setTSearch]                     = useState("");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [perPage, setPerPage]                     = useState(15);
  const [page, setPage]                           = useState(1);

  // ── Print ─────────────────────────────────────────────────────────────────
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord]       = useState(null);
  const printRef = useRef(null);

  // ── Kebab menu ────────────────────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);

  // ── Refund modal ──────────────────────────────────────────────────────────
  const [refundModalOpen, setRefundModalOpen]   = useState(false);
  const [refundRecord, setRefundRecord]         = useState(null);       // advance record being refunded
  const [refundAmount, setRefundAmount]         = useState("");
  const [refundPaymentMode, setRefundPaymentMode] = useState("Cash");
  const [refundRemarks, setRefundRemarks]       = useState("");
  const [refundSaving, setRefundSaving]         = useState(false);
  const [refundAmountError, setRefundAmountError] = useState("");

  // ── Refund List Tab state ──────────────────────────────────────────────────
  const [refunds, setRefunds]                   = useState([]);
  const [filteredRefunds, setFilteredRefunds]   = useState([]);
  const [refundsLoading, setRefundsLoading]     = useState(false);
  const [refundSearch, setRefundSearch]         = useState("");
  const [refundPage, setRefundPage]             = useState(1);
  const [refundPerPage, setRefundPerPage]       = useState(15);

  // ── Print Refund Slip state ────────────────────────────────────────────────
  const [printRefundModalOpen, setPrintRefundModalOpen] = useState(false);
  const [printRefundRecord, setPrintRefundRecord]       = useState(null);
  const printRefundRef = useRef(null);

  const openPrintRefundModal  = async (rec) => {
    let r = { ...rec };
    const creator = r.refunded_by || r.created_by;
    if (!r.created_by_name && !r.refunded_by_name && creator) {
      if (creator === localStorage.getItem("employeeId") && localStorage.getItem("name")) {
        r.created_by_name = localStorage.getItem("name");
        r.refunded_by_name = localStorage.getItem("name");
      } else {
        try {
          const empRes = await apiRequest(`${BASE}get_employee_name/?employee_id=${encodeURIComponent(creator)}`, "GET");
          if (empRes?.success && empRes.name) {
            r.created_by_name = empRes.name;
            r.refunded_by_name = empRes.name;
          }
        } catch {}
      }
    }
    setPrintRefundRecord(r);
    setPrintRefundModalOpen(true);
  };
  const closePrintRefundModal = ()    => { setPrintRefundModalOpen(false); setPrintRefundRecord(null); };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === id ? null : id);
  };

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const total        = parseFloat(amount) || 0;
  const splitIP      = parseFloat(ipAdv)  || 0;
  const splitBill    = parseFloat(billAdv) || 0;
  const splitEntered = ipAdv.trim() !== "" && billAdv.trim() !== "";
  const splitOk      = total > 0 && splitEntered && Math.abs(splitIP + splitBill - total) < 0.01;
  const fmt = (v) => parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const formatSlipAmount = (v) => parseFloat(v || 0).toFixed(2);
  const formatSlipDate = (d) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      const hh = String(dt.getHours()).padStart(2, "0");
      const min = String(dt.getMinutes()).padStart(2, "0");
      const ss = String(dt.getSeconds()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy}:${hh}:${min}:${ss}`;
    } catch {
      return String(d);
    }
  };

  // ── Refund helpers ────────────────────────────────────────────────────────
  const getTotalRefunded = (record) => {
    if (!record?.refund_details || !Array.isArray(record.refund_details)) return 0;
    return record.refund_details.reduce((sum, r) => sum + (parseFloat(r.refunded_amount) || 0), 0);
  };

  const getRefundableAmount = (record) => {
    if (!record) return 0;
    const totalAdvance = parseFloat(record.advance_amount) || 0;
    const alreadyRefunded = getTotalRefunded(record);
    return Math.max(0, totalAdvance - alreadyRefunded);
  };

  // ── Load today on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchAdvancesByDate(today(), today());
    apiRequest(`${BASE}admitted-patients/?date=all`, "GET")
      .then((res) => {
        if (res.success && Array.isArray(res.data?.data)) {
          setAdmittedCount(res.data.data.length);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAdvancesByDate = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const paramObj = {};
      if (fromDate) paramObj.from_date = fromDate;
      if (toDate)   paramObj.to_date   = toDate;
      const selectedOutlet = localStorage.getItem("selected_outlet");
      if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "system") {
        paramObj.outlet_code = selectedOutlet;
      }
      const qs  = new URLSearchParams(paramObj).toString();
      const res = await apiRequest(`${BASE}admission-advance/?${qs}`, "GET");
      if (!res.success) {
        if (res.status === 404) {
          setPayments([]);
          setFilteredPayments([]);
          return;
        }
        throw new Error(res.error || "Failed to fetch advances");
      }
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setPayments(list);
      applyClientFilters(list, filterPaymentMode, filterStatus);
    } catch (e) {
      toast.error(e.message || "Failed to load advances");
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = (data, mode, status) => {
    let filtered = data.filter(p => p.status !== "Edited");
    if (mode)   filtered = filtered.filter(p => p.payment_mode === mode);
    if (status) filtered = filtered.filter(p => p.status === status);
    setFilteredPayments(filtered);
  };

  useEffect(() => {
    applyClientFilters(payments, filterPaymentMode, filterStatus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPaymentMode, filterStatus, payments]);

  const handleSearchFilters = () => {
    setPage(1);
    fetchAdvancesByDate(filterFromDate, filterToDate);
  };

  const handleResetFilters = () => {
    setPage(1);
    setTSearch("");
    setFilterFromDate(today()); setFilterToDate(today());
    setFilterPaymentMode(""); setFilterStatus("");
    fetchAdvancesByDate(today(), today());
  };

  // ── Fetch Refunds ──────────────────────────────────────────────────────────
  const fetchRefunds = useCallback(async (fromDate, toDate) => {
    setRefundsLoading(true);
    try {
      const paramObj = {};
      if (fromDate) paramObj.from_date = fromDate;
      if (toDate)   paramObj.to_date   = toDate;
      const selectedOutlet = localStorage.getItem("selected_outlet");
      if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "system") {
        paramObj.outlet_code = selectedOutlet;
      }
      const qs  = new URLSearchParams(paramObj).toString();
      const res = await apiRequest(`${BASE}ip-advance-refunds/?${qs}`, "GET");
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setRefunds(list);
      setFilteredRefunds(list);
      setRefundPage(1);
    } catch (e) {
      console.error("Error fetching IP advance refunds:", e);
      toast.error("Failed to load advance refunds");
    } finally {
      setRefundsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!refundSearch.trim()) {
      setFilteredRefunds(refunds);
      return;
    }
    const q = refundSearch.toLowerCase().trim();
    const matches = refunds.filter(r => {
      const uhid = String(r.uhid || "").toLowerCase();
      const ip = String(r.ip_number || "").toLowerCase();
      const name = String(r.patient_name || "").toLowerCase();
      const rBill = String(r.refund_bill_no || "").toLowerCase().replace(/\//g, "");
      const rBillOrig = String(r.refund_bill_no || "").toLowerCase();
      const oBill = String(r.bill_no || "").toLowerCase().replace(/\//g, "");
      const oBillOrig = String(r.bill_no || "").toLowerCase();
      return (
        uhid.includes(q) ||
        ip.includes(q) ||
        name.includes(q) ||
        rBill.includes(q) ||
        rBillOrig.includes(q) ||
        oBill.includes(q) ||
        oBillOrig.includes(q)
      );
    });
    setFilteredRefunds(matches);
    setRefundPage(1);
  }, [refundSearch, refunds]);

  const getPaginationItems = (currentPage, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (currentPage >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total];
  };

  const searchedPayments = useMemo(() => {
    if (!tSearch.trim()) return filteredPayments;
    const q = tSearch.toLowerCase().trim();
    return filteredPayments.filter(p => {
      const bNo   = String(p.bill_no || "").toLowerCase();
      const ip    = String(p.ip_number || p.ipNumber || "").toLowerCase();
      const uhid  = String(p.uhid || p.op_number || "").toLowerCase();
      const name  = String(p.patient_name || p.name || p.patientName || "").toLowerCase();
      const mode  = String(p.payment_mode || "").toLowerCase();
      const bType = String(p.bill_type || p.bill_name || p.billTypeNo || "").toLowerCase();
      const room  = String(p.room || p.roomNo || "").toLowerCase();
      const user  = String(p.created_by || "").toLowerCase();
      const stat  = String(p.status || "").toLowerCase();
      return (
        bNo.includes(q) ||
        ip.includes(q) ||
        uhid.includes(q) ||
        name.includes(q) ||
        mode.includes(q) ||
        bType.includes(q) ||
        room.includes(q) ||
        user.includes(q) ||
        stat.includes(q)
      );
    });
  }, [filteredPayments, tSearch]);

  const totalPages = Math.max(1, Math.ceil(searchedPayments.length / perPage));

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * perPage;
    return searchedPayments.slice(start, start + perPage);
  }, [searchedPayments, page, perPage]);

  const prefillFromPatient = (pat) => {
    if (!pat || typeof pat !== "object") return;
    const pt = pat.patient || pat.patient_details || pat.patientData || {};
    const uhid = pat.uhid || pt.uhid || "";
    const ipNumber = pat.ipNumber || pat.ip_number || pt.ipNumber || pt.ip_number || "";
    const name = (
      pat.name || pat.patientname || pat.patient_name || pt.patientname || pt.name ||
      [pat.salutation || pt.salutation, pat.firstName || pt.firstName, pat.middleName || pt.middleName, pat.lastName || pt.lastName].filter(Boolean).join(" ") ||
      ""
    ).trim();
    const age = pat.age || pt.age || "";
    const ageType = pat.age_type || pt.age_type || "Y";
    const gender = pat.gender || pt.gender || "";
    const mobile = pat.mobile || pat.mobilePhone || pt.mobilePhone || pt.phone || "";
    const customer_type = pat.customerType || pat.customer_type || pt.customerType || pt.customer_type || "";
    const company = pat.company || pat.companyName || pat.insuranceCompanyName || pat.company_name || pt.insuranceCompanyName || pt.company || "";
    const address = pat.permanent_address || pat.address || pt.permanent_address || pt.address || [pt.area, pt.city, pt.state, pt.zipcode].filter(Boolean).join(", ") || "";
    const roomNo = pat.roomNo || pat.room_no || pat.newRoomNo || "";
    const bedNo = pat.bedNo || pat.bed_no || pat.newBedNo || "";
    const admittingDate = pat.admissionDateTime || (pat.admissionDate && pat.admissionTime ? `${pat.admissionDate} ${pat.admissionTime}` : pat.admissionDate) || "";
    const admittingDoctor = pat.admittingDoctorName || pat.admittingDoctor || pat.doctor || "";
    const totalDays = pat.total_days || "";
    const ipSerial = pat.ipserial_number ? String(pat.ipserial_number) : "";

    setCommon(prev => ({
      ...prev,
      uhid: uhid || prev.uhid,
      ipNumber: ipNumber || prev.ipNumber,
      ipSerial: ipSerial || prev.ipSerial,
      name: name || prev.name,
      age: age || prev.age,
      ageType: ageType || prev.ageType,
      gender: gender || prev.gender,
      mobile: mobile || prev.mobile,
      customer_type: customer_type || prev.customer_type,
      company: company || prev.company,
      address: address || prev.address,
      roomNo: roomNo || prev.roomNo,
      bedNo: bedNo || prev.bedNo,
      admittingDate: admittingDate || prev.admittingDate,
      admittingDoctor: admittingDoctor || prev.admittingDoctor,
      totalDays: totalDays || prev.totalDays,
    }));
    if (ipNumber) setAdmId(ipNumber);
  };

  useEffect(() => {
    if (patient || propUhid || propIpNumber) {
      const u = propUhid || patient?.uhid || patient?.patient_details?.uhid || patient?.patient?.uhid;
      const ip = propIpNumber || patient?.ipNumber || patient?.ip_number || patient?.patient_details?.ipNumber || patient?.patient_details?.ip_number || patient?.patient?.ipNumber;
      if (patient) {
        prefillFromPatient(patient);
      }
      if (ip) {
        const ipStr = String(ip).trim();
        setCommon(prev => ({ ...prev, ipNumber: ipStr, uhid: u ? String(u).trim() : prev.uhid }));
        loadActiveAdmission({ ip_number: ipStr });
      } else if (u) {
        const uStr = String(u).trim();
        setCommon(prev => ({ ...prev, uhid: uStr }));
        loadActiveAdmission({ uhid: uStr });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, propUhid, propIpNumber]);

  // ── Load admission ─────────────────────────────────────────────────────────
  const loadActiveAdmission = async (params) => {
    setSearchingAdm(true);
    try {
      const qs  = new URLSearchParams(params).toString();
      let adm = null;
      try {
        const res = await apiRequest(`${BASE}get_active_admission/?${qs}`, "GET");
        if (res.success && res.data) {
          adm = res?.data?.data ?? res?.data;
        }
      } catch (e) {
        console.warn("get_active_admission failed:", e);
      }

      // Fallback to admission-list if not found
      if (!adm || (!adm.ipNumber && !adm.uhid)) {
        try {
          const admRes = await apiRequest(`${BASE}admission-list/?${params.ip_number ? `ip_number=${encodeURIComponent(params.ip_number)}` : `uhid=${encodeURIComponent(params.uhid)}`}`, "GET");
          const admList = Array.isArray(admRes.data?.data) ? admRes.data.data : Array.isArray(admRes.data) ? admRes.data : [];
          if (admList.length) {
            adm = admList.find(a => a.is_admitted === true && !a.is_discharged && !a.is_cancelled) || (params.ip_number ? admList[0] : null);
          }
        } catch (e) {
          console.warn("admission-list fallback failed:", e);
        }
      }

      if (!adm || (!adm.ipNumber && !adm.uhid)) {
        setAdmId(null);
        setCommon(prev => ({
          ...EMPTY_COMMON,
          uhid: params.uhid !== undefined ? params.uhid : prev.uhid,
          ipNumber: params.ip_number !== undefined ? params.ip_number : prev.ipNumber,
        }));
        return toast.error("No active admission (is_admitted: true) found");
      }

      // Strictly verify active admission
      if (adm.is_admitted === false || adm.is_discharged === true || adm.is_cancelled === true) {
        setAdmId(null);
        setCommon(prev => ({
          ...EMPTY_COMMON,
          uhid: adm.uhid || (params.uhid !== undefined ? params.uhid : prev.uhid),
          ipNumber: adm.ipNumber || (params.ip_number !== undefined ? params.ip_number : prev.ipNumber),
        }));
        const statDesc = adm.is_cancelled ? "cancelled" : adm.is_discharged ? "discharged" : "not admitted (is_admitted: false)";
        return toast.error(`Admission ${adm.ipNumber || ""} is ${statDesc}. Active admission (is_admitted: true) is required to add or update IP advance.`);
      }

      const patient = adm.patient || {};
      const doctor = adm.admittingDoctorName || adm.admittingDoctor || "";

      let roomNo = adm.roomNo || "";
      let bedNo  = adm.bedNo || "";

      if (!roomNo && adm.room_details) {
        const roomDetails = typeof adm.room_details === 'string'
          ? JSON.parse(adm.room_details)
          : adm.room_details;
        if (Array.isArray(roomDetails)) {
          const active = [...roomDetails].reverse().find(r => r?.is_roomActive);
          roomNo = active?.roomNo || "";
          bedNo  = active?.bedNo  || "";
        }
      }

      const pName = (
        patient.patientname ||
        [adm.salutation || patient.salutation, adm.firstName || patient.firstName, adm.middleName || patient.middleName, adm.lastName || patient.lastName].filter(Boolean).join(" ") ||
        adm.name || adm.patient_name || ""
      ).trim();

      let formattedDateTime = "";
      if (adm.admissionDateTime) {
        formattedDateTime = adm.admissionDateTime;
      } else if (adm.admissionDate && adm.admissionTime) {
        const raw = `${adm.admissionDate} ${adm.admissionTime}`;
        const dt = new Date(raw);
        if (!isNaN(dt)) {
          formattedDateTime = dt.toLocaleString("en-IN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: true,
          });
        } else {
          formattedDateTime = `${adm.admissionDate} ${adm.admissionTime}`;
        }
      }

      setAdmId(adm.ipNumber);
      setCommon((prev) => ({
        ...prev,
        uhid:            adm.uhid || prev.uhid,
        ipNumber:        adm.ipNumber || prev.ipNumber,
        ipSerial:        adm.ipserial_number ? String(adm.ipserial_number) : prev.ipSerial,
        name:            pName || prev.name,
        age:             adm.age || patient.age || prev.age,
        ageType:         patient.age_type || adm.age_type || prev.ageType || "Y",
        gender:          adm.gender || patient.gender || prev.gender,
        mobile:          patient.mobilePhone || patient.phone || adm.mobile || prev.mobile,
        address:
          adm.permanent_address || patient.permanent_address ||
          [patient.area, patient.city, patient.state, patient.zipcode].filter(Boolean).join(", ") ||
          prev.address,
        customer_type:   adm.customerType || adm.customer_type || patient.customerType || prev.customer_type,
        company:         adm.company || adm.companyName || adm.insuranceCompanyName || patient.insuranceCompanyName || adm.insuranceCompany || prev.company,
        roomNo, bedNo,
        admittingDate:   formattedDateTime,
        admittingDoctor: doctor,
        totalDays:       adm.total_days != null ? adm.total_days : prev.totalDays,
        creditLimit:     adm.creditLimit != null ? adm.creditLimit : prev.creditLimit,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "No active admission found");
    } finally {
      setSearchingAdm(false);
    }
  };

  // ── Save (new or edited) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!admissionId)             return toast.warning("Load an active admission first (is_admitted: true required)");
    if (total <= 0)               return toast.warning("Enter a valid advance amount");

    const bType = DEFAULT_BILL_TYPE;
    const bTypeNo = DEFAULT_BILL_TYPE_NO;

    if (!splitEntered)
      return toast.warning("Both IP Advance and Billing Advance must be entered");
    if (!splitOk)
      return toast.warning(`IP Advance (₹${fmt(splitIP)}) + Billing Advance (₹${fmt(splitBill)}) must equal Advance Amount (₹${fmt(total)})`);

    setSaving(true);
    try {
      const payload = {
        date,
        advance_amount: total,
        ip_advance: splitIP,
        billing_advance: splitBill,
        payment_mode: paymentMode,
        bill_type: bType,
        billTypeNo: bTypeNo,
        ipNumber: common.ipNumber,
        ip_number: common.ipNumber,
        uhid: common.uhid,
      };
      let savedRecord = null;
      if (editingRecord) {
        const res = await apiRequest(
          `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
          "PUT",
          {
            ...payload,
            advance_id: editingRecord.advance_id,
          }
        );
        if (!res.success) throw new Error(res.error || "Edit failed");
        toast.success("Advance updated!");
        savedRecord = {
          ...editingRecord,
          ...payload,
          ...(res.data || res.advance || {}),
          ip_number: common.ipNumber,
          uhid: common.uhid,
          room: common.roomNo || "",
          patient_name: common.name,
        };
        cancelEditMode();
      } else {
        const res = await apiRequest(
          `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
          "POST",
          payload
        );
        if (!res.success) throw new Error(res.error || "Save failed");
        toast.success("Advance saved!");
        savedRecord = {
          ...payload,
          ...(res.data || res.advance || {}),
          ip_number: common.ipNumber,
          uhid: common.uhid,
          room: common.roomNo || "",
          patient_name: common.name,
          bill_date: new Date().toISOString(),
          paid_date: new Date().toISOString(),
          created_by: (res.data && res.data.created_by) || localStorage.getItem("employeeId") || "",
          created_by_name: (res.data && res.data.created_by_name) || localStorage.getItem("name") || "",
        };
      }
      setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
      fetchAdvancesByDate(filterFromDate, filterToDate);
      if (savedRecord) {
        openPrintModal(savedRecord);
        if (onSaved && typeof onSaved === "function") {
          onSaved(savedRecord);
        }
      }
    } catch (e) {
      toast.error(e.message || "Failed to save advance");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    const ipNo = record.ip_number || record.ipNumber;
    if (!ipNo || ipNo === "—") return toast.error("Cannot determine IP number for this record");
    setDate(record.date || today());
    setAmount(String(record.advance_amount || ""));
    setIpAdv(String(record.ip_advance || ""));
    setBillAdv(String(record.billing_advance || ""));
    setPaymentMode(record.payment_mode || "Cash");
    setEditingRecord(record);
    loadActiveAdmission({ ip_number: ipNo });
    setActiveTab("create");
    setTimeout(() => {
      advanceFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    toast.info(`Editing advance ${record.advance_id} — modify and click Update`);
  };

  const cancelEditMode = () => {
    setEditingRecord(null);
    setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
  };

  // ── Cancel advance ────────────────────────────────────────────────────────
  const handleCancel = async (advanceId, ipNumber) => {
    if (!window.confirm("Cancel this advance entry?")) return;
    try {
      const res = await apiRequest(
        `${BASE}admission-advance/${encodeURIComponent(ipNumber)}/`,
        "PUT",
        { advance_id: advanceId, action: "cancel" }
      );
      if (!res.success) throw new Error(res.error || "Cancel failed");
      toast.success("Advance cancelled");
      fetchAdvancesByDate(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to cancel");
    }
  };

  // ── Refund Modal ──────────────────────────────────────────────────────────
  const openRefundModal = (record) => {
    const refundable = getRefundableAmount(record);
    if (refundable <= 0) {
      return toast.warning("No refundable amount remaining for this advance");
    }
    setRefundRecord(record);
    setRefundAmount(String(refundable));
    setRefundPaymentMode("Cash");
    setRefundRemarks("");
    setRefundAmountError("");
    setRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setRefundModalOpen(false);
    setRefundRecord(null);
    setRefundAmount("");
    setRefundRemarks("");
    setRefundAmountError("");
  };

  const validateRefundAmount = (val) => {
    const entered = parseFloat(val) || 0;
    const refundable = getRefundableAmount(refundRecord);
    if (Math.abs(entered - refundable) > 0.01) {
      setRefundAmountError(`Refund must equal the full remaining amount of ₹${fmt(refundable)}`);
      return false;
    }
    if (entered <= 0) {
      setRefundAmountError("Refund amount must be greater than 0");
      return false;
    }
    setRefundAmountError("");
    return true;
  };

  const handleRefundAmountChange = (val) => {
    setRefundAmount(val);
    if (val) validateRefundAmount(val);
    else setRefundAmountError("");
  };

  const handleRefundSubmit = async () => {
    if (!validateRefundAmount(refundAmount)) return;

    const ipNo = refundRecord.ip_number || refundRecord.ipNumber;
    if (!ipNo) return toast.error("Cannot determine IP number");

    setRefundSaving(true);
    try {
      const res = await apiRequest(
        `${BASE}admission-advance/${encodeURIComponent(ipNo)}/`,
        "PUT",
        {
          advance_id:     refundRecord.advance_id,
          action:         "refund",
          refund_amount:  parseFloat(refundAmount),
          payment_mode:   refundPaymentMode,
          remarks:        refundRemarks.trim(),
          bill_type:      refundRecord.bill_type || DEFAULT_BILL_TYPE,
          billTypeNo:     refundRecord.billTypeNo || DEFAULT_BILL_TYPE_NO,
        }
      );
      if (!res.success) throw new Error(res.error || "Refund failed");
      toast.success(`Refund of ₹${fmt(refundAmount)} processed successfully!`);
      const refBill = res.data?.refund_bill_no || res.data?.refund_record?.refund_bill_no || "";
      const savedRefund = {
        refund_bill_no: refBill,
        bill_no: refundRecord.bill_no || refundRecord.bill_number,
        uhid: refundRecord.uhid,
        patient_name: refundRecord.patient_name || refundRecord.name,
        room: refundRecord.room || refundRecord.roomNo,
        ip_number: refundRecord.ip_number || refundRecord.ipNumber,
        refund_amount: parseFloat(refundAmount),
        payment_mode: refundPaymentMode,
        remarks: refundRemarks.trim(),
        created_date: new Date(),
        refund_date: new Date(),
        created_by: (res.data && res.data.created_by) || localStorage.getItem("employeeId") || "",
        created_by_name: (res.data && res.data.created_by_name) || localStorage.getItem("name") || "",
        refunded_by_name: (res.data && res.data.refunded_by_name) || (res.data && res.data.created_by_name) || localStorage.getItem("name") || "",
      };
      closeRefundModal();
      openPrintRefundModal(savedRefund);
      fetchAdvancesByDate(filterFromDate, filterToDate);
      fetchRefunds(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to process refund");
    } finally {
      setRefundSaving(false);
    }
  };

  // ── Print Advance Slip ────────────────────────────────────────────────────
  const openPrintModal  = async (record) => {
    let rec = { ...record };
    if (!rec.created_by_name && rec.created_by) {
      if (rec.created_by === localStorage.getItem("employeeId") && localStorage.getItem("name")) {
        rec.created_by_name = localStorage.getItem("name");
      } else {
        try {
          const empRes = await apiRequest(`${BASE}get_employee_name/?employee_id=${encodeURIComponent(rec.created_by)}`, "GET");
          if (empRes?.success && empRes.name) {
            rec.created_by_name = empRes.name;
          }
        } catch {}
      }
    }
    setPrintRecord(rec);
    setPrintModalOpen(true);
  };
  const closePrintModal = ()       => { setPrintModalOpen(false); setPrintRecord(null); };

  const handlePrint = () => {
    if (!printRecord) return;

    const uhidVal = printRecord.uhid || printRecord.op_number || "—";
    const nameVal = (printRecord.patient_name || printRecord.name || "—").toUpperCase();
    const roomVal = printRecord.room || printRecord.roomNo || common.roomNo || "—";
    const billDate = formatSlipDate(printRecord.bill_date || printRecord.created_date || printRecord.date || new Date());
    const billNoVal = (printRecord.bill_no || printRecord.bill_number || "—").replace(/\//g, "");
    const ipNoVal = printRecord.ip_number || printRecord.ipNumber || "—";
    const amountVal = formatSlipAmount(printRecord.advance_amount);
    const preparedByName = (printRecord.created_by_name || "").trim() ||
      ((printRecord.created_by && printRecord.created_by === localStorage.getItem("employeeId")) ? (localStorage.getItem("name") || "").trim() : "") ||
      (localStorage.getItem("name") || "").trim() ||
      printRecord.created_by ||
      "";

    const w = window.open("", "", "height=700,width=450");
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advance Slip</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: Arial, 'Segoe UI', sans-serif;
              background: #fff;
              display: flex;
              justify-content: center;
              padding: 10px;
              color: #000;
            }
            .slip {
              width: 100%;
              max-width: 330px;
              padding: 10px 12px;
              background: #fff;
              font-size: 11px;
            }
            .bill-header {
              text-align: center;
              margin-bottom: 6px;
            }
            .bill-title {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .bill-subtitle {
              font-size: 11px;
              line-height: 1.35;
            }
            .bill-adv {
              font-size: 12px;
              font-weight: 800;
              margin-top: 4px;
            }
            .divider {
              border-top: 1.5px solid #000;
              margin: 6px 0;
            }
            .info-table {
              margin: 4px 0;
            }
            .info-row {
              display: flex;
              align-items: baseline;
              font-size: 11px;
              padding: 1px 0;
            }
            .lbl {
              width: 80px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .colon {
              width: 12px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .val {
              flex: 1;
              font-weight: 500;
              word-break: break-all;
            }
            .items-header {
              display: flex;
              font-weight: 800;
              font-size: 11px;
              padding: 2px 0 4px 0;
            }
            .col-slno {
              width: 38px;
            }
            .col-desc {
              flex: 1;
            }
            .col-amount {
              width: 85px;
              text-align: right;
            }
            .items-row {
              display: flex;
              font-size: 11px;
              padding: 3px 0;
            }
            .items-spacer {
              height: 48px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 11px;
              padding: 3px 0;
            }
            .user-lbl {
              font-size: 11px;
            }
            .total-wrap {
              display: flex;
              gap: 24px;
              align-items: baseline;
            }
            .total-lbl {
              font-weight: 800;
              font-size: 12px;
            }
            .total-val {
              font-size: 11px;
              width: 85px;
              text-align: right;
              font-weight: 600;
            }
            .signature {
              text-align: right;
              margin-top: 36px;
              font-size: 11px;
              font-weight: 600;
              padding-right: 6px;
            }
            @media print {
              body { padding: 0; }
              .slip { width: 100%; max-width: 100%; border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="bill-header">
              <div class="bill-title">SHANMUGA HOSPITAL LIMITED</div>
              <div class="bill-subtitle">51/24.Saradha College Road, Salem - 636007</div>
              <div class="bill-subtitle">04272706666</div>
              <div class="bill-subtitle">GST No : 33ABDCS8326A1ZP</div>
              <div class="bill-adv">Advance Slip</div>
            </div>
            <div class="divider"></div>
            <div class="info-table">
              <div class="info-row"><span class="lbl">UHID</span><span class="colon">:</span><span class="val">${uhidVal}</span></div>
              <div class="info-row"><span class="lbl">Name</span><span class="colon">:</span><span class="val">${nameVal}</span></div>
              <div class="info-row"><span class="lbl">Room</span><span class="colon">:</span><span class="val">${roomVal}</span></div>
              <div class="info-row"><span class="lbl">Bill Date</span><span class="colon">:</span><span class="val">${billDate}</span></div>
              <div class="info-row"><span class="lbl">Bill No</span><span class="colon">:</span><span class="val">${billNoVal}</span></div>
              <div class="info-row"><span class="lbl">IP No</span><span class="colon">:</span><span class="val">${ipNoVal}</span></div>
            </div>
            <div class="divider"></div>
            <div class="items-header">
              <span class="col-slno">Slno</span>
              <span class="col-desc">Description</span>
              <span class="col-amount">Amount</span>
            </div>
            <div class="divider"></div>
            <div class="items-row">
              <span class="col-slno">1</span>
              <span class="col-desc">Advance</span>
              <span class="col-amount">${amountVal}</span>
            </div>
            <div class="items-spacer"></div>
            <div class="divider"></div>
            <div class="total-row">
              <span class="user-lbl">Prepared by : ${preparedByName}</span>
              <div class="total-wrap">
                <span class="total-lbl">Total</span>
                <span class="total-val">${amountVal}</span>
              </div>
            </div>
            <div class="signature">Signature Of Cashier</div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  // ── Print Advance Refund Slip ─────────────────────────────────────────────
  const handlePrintRefund = () => {
    if (!printRefundRecord) return;

    const uhidVal = printRefundRecord.uhid || "—";
    const nameVal = (printRefundRecord.patient_name || printRefundRecord.name || "—").toUpperCase();
    const roomVal = printRefundRecord.room || printRefundRecord.roomNo || "—";
    const refundDate = formatSlipDate(printRefundRecord.refund_date || printRefundRecord.created_date || new Date());
    const refundBillNoVal = String(printRefundRecord.refund_bill_no || "—").replace(/\//g, "");
    const origBillNoVal = String(printRefundRecord.bill_no || printRefundRecord.bill_number || "—").replace(/\//g, "");
    const ipNoVal = printRefundRecord.ip_number || printRefundRecord.ipNumber || "—";
    const amountVal = formatSlipAmount(printRefundRecord.refund_amount || printRefundRecord.refunded_amount);
    const modeVal = printRefundRecord.payment_mode || printRefundRecord.payment_details?.method || "Cash";
    const preparedByName = (printRefundRecord.refunded_by_name || printRefundRecord.created_by_name || "").trim() ||
      (((printRefundRecord.refunded_by || printRefundRecord.created_by) && (printRefundRecord.refunded_by || printRefundRecord.created_by) === localStorage.getItem("employeeId")) ? (localStorage.getItem("name") || "").trim() : "") ||
      (localStorage.getItem("name") || "").trim() ||
      printRefundRecord.refunded_by ||
      printRefundRecord.created_by ||
      "";
    const remarksVal = printRefundRecord.remarks || "";

    const w = window.open("", "", "height=700,width=450");
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advance Refund Slip</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: Arial, 'Segoe UI', sans-serif;
              background: #fff;
              display: flex;
              justify-content: center;
              padding: 10px;
              color: #000;
            }
            .slip {
              width: 100%;
              max-width: 330px;
              padding: 10px 12px;
              background: #fff;
              font-size: 11px;
            }
            .bill-header {
              text-align: center;
              margin-bottom: 6px;
            }
            .bill-title {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .bill-subtitle {
              font-size: 11px;
              line-height: 1.35;
            }
            .bill-adv {
              font-size: 12px;
              font-weight: 800;
              margin-top: 4px;
              color: #b91c1c;
            }
            .divider {
              border-top: 1.5px solid #000;
              margin: 6px 0;
            }
            .info-table {
              margin: 4px 0;
            }
            .info-row {
              display: flex;
              align-items: baseline;
              font-size: 11px;
              padding: 1px 0;
            }
            .lbl {
              width: 95px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .colon {
              width: 12px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .val {
              flex: 1;
              font-weight: 500;
              word-break: break-all;
            }
            .items-header {
              display: flex;
              font-weight: 800;
              font-size: 11px;
              padding: 2px 0 4px 0;
            }
            .col-slno {
              width: 38px;
            }
            .col-desc {
              flex: 1;
            }
            .col-amount {
              width: 85px;
              text-align: right;
            }
            .items-row {
              display: flex;
              font-size: 11px;
              padding: 3px 0;
            }
            .items-spacer {
              height: 48px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 11px;
              padding: 3px 0;
            }
            .user-lbl {
              font-size: 11px;
            }
            .total-wrap {
              display: flex;
              gap: 16px;
              align-items: baseline;
            }
            .total-lbl {
              font-weight: 800;
              font-size: 12px;
              color: #b91c1c;
            }
            .total-val {
              font-size: 11px;
              width: 85px;
              text-align: right;
              font-weight: 700;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 36px;
              font-size: 10px;
              font-weight: 600;
              padding: 0 4px;
            }
            @media print {
              body { padding: 0; }
              .slip { width: 100%; max-width: 100%; border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="bill-header">
              <div class="bill-title">SHANMUGA HOSPITAL LIMITED</div>
              <div class="bill-subtitle">51/24.Saradha College Road, Salem - 636007</div>
              <div class="bill-subtitle">04272706666</div>
              <div class="bill-subtitle">GST No : 33ABDCS8326A1ZP</div>
              <div class="bill-adv">Advance Refund Slip</div>
            </div>
            <div class="divider"></div>
            <div class="info-table">
              <div class="info-row"><span class="lbl">UHID</span><span class="colon">:</span><span class="val">${uhidVal}</span></div>
              <div class="info-row"><span class="lbl">Name</span><span class="colon">:</span><span class="val">${nameVal}</span></div>
              <div class="info-row"><span class="lbl">Room</span><span class="colon">:</span><span class="val">${roomVal}</span></div>
              <div class="info-row"><span class="lbl">Refund Date</span><span class="colon">:</span><span class="val">${refundDate}</span></div>
              <div class="info-row"><span class="lbl">Refund Bill No</span><span class="colon">:</span><span class="val">${refundBillNoVal}</span></div>
              <div class="info-row"><span class="lbl">Original Bill</span><span class="colon">:</span><span class="val">${origBillNoVal}</span></div>
              <div class="info-row"><span class="lbl">IP No</span><span class="colon">:</span><span class="val">${ipNoVal}</span></div>
              <div class="info-row"><span class="lbl">Payment Mode</span><span class="colon">:</span><span class="val">${modeVal}</span></div>
            </div>
            <div class="divider"></div>
            <div class="items-header">
              <span class="col-slno">Slno</span>
              <span class="col-desc">Description</span>
              <span class="col-amount">Amount</span>
            </div>
            <div class="divider"></div>
            <div class="items-row">
              <span class="col-slno">1</span>
              <span class="col-desc">IP Advance Refund ${remarksVal ? `(${remarksVal})` : ""}</span>
              <span class="col-amount">${amountVal}</span>
            </div>
            <div class="items-spacer"></div>
            <div class="divider"></div>
            <div class="total-row">
              <span class="user-lbl">Prepared by : ${preparedByName}</span>
              <div class="total-wrap">
                <span class="total-lbl">Refund Total</span>
                <span class="total-val">${amountVal}</span>
              </div>
            </div>
            <div class="signatures">
              <span>Patient / Attender Signature</span>
              <span>Signature Of Cashier</span>
            </div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const handleResetForm = () => {
    setCommon(EMPTY_COMMON);
    setAdmId(null);
    cancelEditMode();
  };

  const handleAmountChange = (val) => { setAmount(val); setIpAdv(""); setBillAdv(""); };
  const handleIpAdvChange  = (val) => {
    setIpAdv(val);
    const rem = total - (parseFloat(val) || 0);
    setBillAdv(rem >= 0 ? rem.toFixed(2) : "");
  };

  // ── Per-row action permissions ────────────────────────────────────────────
  // Refund is allowed only on Paid advances that still have refundable amount
  const canEdit   = (p) => p.status === "Pending";
  const canCancel = (p) => p.status === "Pending" || p.status === "Paid";
  const canRefund = (p) => p.status === "Paid" && getRefundableAmount(p) > 0;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeAll    = payments.filter(p => p.is_advanceActive);
  const totalActive  = activeAll.reduce((s, p) => s + (parseFloat(p.advance_amount)  || 0), 0);
  const totalIPSum   = activeAll.reduce((s, p) => s + (parseFloat(p.ip_advance)       || 0), 0);
  const totalBillSum = activeAll.reduce((s, p) => s + (parseFloat(p.billing_advance)  || 0), 0);

  return (
    <>
      <GlobalStyle />
      <Page className="no-print">
        {/* ── Header with Tabs ── */}
        <PageHeader>
          <div>
            <PageTitle>💳 IP Advance</PageTitle>
            <PageSubtitle>Inpatient Advance Payment &amp; Collection Management</PageSubtitle>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "create",   label: "+ IP Advance Entry" },
              { id: "admitted", label: "🏥 Admitted Patients", count: admittedCount },
              { id: "list",     label: "📋 Advance List" },
              { id: "refunds",  label: "💸 Advance Refund List" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "list") fetchAdvancesByDate(filterFromDate, filterToDate);
                  if (tab.id === "admitted") setAdmittedRefreshKey(k => k + 1);
                  if (tab.id === "refunds") fetchRefunds(filterFromDate, filterToDate);
                }}
                style={
                  activeTab === tab.id
                    ? {
                        background: "white",
                        color: T.teal,
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }
                    : {
                        background: "rgba(255,255,255,0.18)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.35)",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }
                }
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span style={{
                    background: activeTab === tab.id ? T.teal : "rgba(255,255,255,0.28)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
            {onClose && typeof onClose === "function" && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        </PageHeader>

        {activeTab === "create" && (
          <>
            {/* ── PATIENT LOOKUP & DISCHARGE-STYLE DETAILS ── */}
            <Card>
              <CardHead color="teal">
                <span>🏥 Patient Lookup &amp; Admission Details</span>
                {admissionId ? (
                  <span style={{
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    borderRadius: 999,
                    padding: "2px 10px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}>
                    ✓ Admission Active · {admissionId}
                  </span>
                ) : (
                  <span style={{ fontSize: "0.73rem", opacity: 0.9, fontWeight: 500 }}>
                    Search by UHID or IP Number
                  </span>
                )}
              </CardHead>
              <AdmittedPatientSummaryCard
                uhid={common.uhid}
                onUhidChange={(val) => setCommon(p => ({ ...p, uhid: val }))}
                onUhidSearch={openUhidSearch}
                ipNumber={common.ipNumber}
                onIpChange={(val) => setCommon(p => ({ ...p, ipNumber: val }))}
                onIpSearch={openIpSearch}
                searching={searchingAdm}
                onReset={handleResetForm}
                admittedCount={admittedCount}
                onBrowseAdmitted={() => {
                  setAdmittedRefreshKey(k => k + 1);
                  setActiveTab("admitted");
                }}
                patient={admissionId ? {
                  uhid: common.uhid,
                  ipNumber: common.ipNumber,
                  ipSerial: common.ipSerial,
                  name: common.name,
                  age: common.age,
                  ageType: common.ageType,
                  gender: common.gender,
                  mobile: common.mobile,
                  address: common.address,
                  doctor: common.admittingDoctor,
                  admissionDate: common.admittingDate,
                  roomNo: common.roomNo,
                  bedNo: common.bedNo,
                  totalDays: common.totalDays,
                  customerType: common.customer_type,
                  company: common.company,
                } : null}
              />
            </Card>

            {/* ── ADVANCE INPUT FORM ── */}
            <div ref={advanceFormRef}>
              <Card editing={!!editingRecord}>
                <CardHead color={editingRecord ? "orange" : "teal"}>
                  <span>{editingRecord ? "✏️ Edit Advance" : "💵 Advance Input"}</span>
                  {editingRecord && (
                    <span style={{ fontSize: "0.68rem", opacity: 0.9, fontWeight: 500 }}>
                      Editing: {editingRecord.advance_id} | Bill: {(editingRecord.bill_no || "").replace(/\//g, "")}
                    </span>
                  )}
                </CardHead>

                {editingRecord && (
                  <EditBanner>
                    ⚠️ You are editing an existing advance. The original entry will be marked as
                    <strong style={{ marginLeft: 4 }}>Edited</strong> and a new entry will be created.
                  </EditBanner>
                )}

                <CardBody>
                  <Grid cols={6}>
                    <GroupLabel c="teal">Payment Details</GroupLabel>
                    <F span={2}>
                      <Lbl>Date</Lbl>
                      <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </F>
                    <F span={4}>
                      <Lbl>Advance Amount (₹)</Lbl>
                      <BigInp
                        value={amount} placeholder="Enter total advance amount"
                        onChange={e => handleAmountChange(e.target.value)} />
                    </F>

                    <SplitBox>
                      <SplitHeader>↳ Split Advance</SplitHeader>
                      <SplitGrid>
                        <F>
                          <Lbl>IP Advance (₹)</Lbl>
                          <Inp
                            value={ipAdv} placeholder="0.00"
                            disabled={total <= 0}
                            onChange={e => handleIpAdvChange(e.target.value)} />
                        </F>
                        <F>
                          <Lbl>Billing Advance (₹)</Lbl>
                          <Inp
                            value={billAdv} placeholder="0.00"
                            disabled={total <= 0}
                            onChange={e => setBillAdv(e.target.value)} />
                        </F>
                      </SplitGrid>
                      {total > 0 && (
                        <SplitNote ok={splitOk}>
                          {!splitEntered
                            ? `⚠ Enter both IP Advance & Billing Advance (Total: ₹${fmt(total)})`
                            : splitOk
                              ? `✓ Balanced — ₹${fmt(splitIP)} + ₹${fmt(splitBill)} = ₹${fmt(total)}`
                              : `⚠ Mismatch — ₹${fmt(splitIP)} + ₹${fmt(splitBill)} ≠ ₹${fmt(total)}`}
                        </SplitNote>
                      )}
                    </SplitBox>
                  </Grid>
                </CardBody>

                <ActionBar>
                  {editingRecord ? (
                    <>
                      <Btn v="reset" onClick={cancelEditMode}>✕ Cancel Edit</Btn>
                      <Btn c="orange"
                        onClick={handleSave}
                        disabled={saving || !admissionId || total <= 0 || !splitOk}>
                        {saving ? "Updating…" : "✏️ Update Advance"}
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn v="reset" onClick={() => { setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); }}>
                        ↺ Reset Form
                      </Btn>
                      <Btn onClick={handleSave}
                        disabled={saving || !admissionId || total <= 0 || !splitOk}>
                        {saving ? "Saving…" : "💾 Save Advance"}
                      </Btn>
                    </>
                  )}
                </ActionBar>
              </Card>
            </div>
          </>
        )}

        {activeTab === "admitted" && (
          <AdmittedPatientsPanel
            baseUrl={BASE}
            refreshKey={admittedRefreshKey}
            onCountChange={setAdmittedCount}
            actionTitle="Load patient into IP Advance entry"
            onSelectPatient={(row) => {
              prefillFromPatient(row);
              if (row.ipNumber) loadActiveAdmission({ ip_number: row.ipNumber });
              else if (row.uhid) loadActiveAdmission({ uhid: row.uhid });
              setActiveTab("create");
            }}
          />
        )}

        {activeTab === "list" && (
          <>
            {/* ── FILTERS ── */}
            <Card>
              <CardHead color="blue">🔎 Filters &amp; Search</CardHead>
              <CardBody>
                <Grid cols={6}>
                  <F span={2}>
                    <Lbl>From Date</Lbl>
                    <Inp type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} />
                  </F>
                  <F span={2}>
                    <Lbl>To Date</Lbl>
                    <Inp type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} />
                  </F>
                  <F span={2}>
                    <Lbl>Status</Lbl>
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Fully Refunded</option>
                    </Select>
                  </F>
                  <F span={1}><Lbl>&nbsp;</Lbl>
                    <Btn onClick={handleSearchFilters} disabled={loading}>
                      {loading ? "Loading…" : "🔍 Search"}
                    </Btn>
                  </F>
                  <F span={1}><Lbl>&nbsp;</Lbl>
                    <Btn v="reset" onClick={handleResetFilters}>Reset Filters</Btn>
                  </F>
                </Grid>
              </CardBody>
            </Card>

            {/* ── RECORDS TABLE ── */}
            <Card>
              <CardHead color="violet">📋 Advance Payment Records</CardHead>

              {/* ── Table Controls ── */}
              <TTBar>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#6b7280" }}>
                  Show up to&nbsp;
                  <TableSelect
                    value={perPage}
                    onChange={e => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[10, 15, 20, 25, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </TableSelect>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#6b7280" }}>
                  Search:&nbsp;
                  <input
                    value={tSearch}
                    onChange={e => {
                      setTSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Bill No / IP / UHID / Name / Mode / User…"
                    style={{
                      width: "300px",
                      height: 28,
                      padding: "0 10px",
                      fontSize: ".75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      outline: "none",
                      background: "#fff",
                    }}
                  />
                  {tSearch && (
                    <button
                      onClick={() => { setTSearch(""); setPage(1); }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#dc2626",
                        fontWeight: 800,
                        padding: "0 2px",
                        fontSize: ".75rem",
                      }}
                      title="Clear Search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </TTBar>

              <TblWrap>
                <Tbl>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Bill Date</Th>
                      <Th>Bill No</Th>
                      <Th>IP No</Th>
                      <Th>Patient Name</Th>
                      <Th>Payment Mode</Th>
                      <Th>Paid Date</Th>
                      <Th right>Advance Amount</Th>
                      <Th right>IP Advance</Th>
                      <Th right>Billing Advance</Th>
                      <Th right>Total Refunded</Th>
                      <Th right>Net Balance</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <Td colSpan={14} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                          ⏳ Loading records…
                        </Td>
                      </tr>
                    ) : paginatedPayments.length === 0 ? (
                      <tr>
                        <Td colSpan={14} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                          {tSearch
                            ? `No records matching "${tSearch}"`
                            : "No advance records found for the selected date range / filters"}
                        </Td>
                      </tr>
                    ) : (
                      paginatedPayments.map((p, i) => {
                        const rowIdx      = (page - 1) * perPage + i + 1;
                        const status      = p.status || "Pending";
                        const billDate    = p.bill_date ? new Date(p.bill_date).toLocaleDateString("en-IN") : "—";
                        const patientName = p.patient_name || p.name || p.patientName || "—";
                        const ipNo        = p.ip_number    || p.ipNumber || "—";
                        const menuId      = String(p.bill_no || `${ipNo}_${p.advance_id || i}_${i}`);
                        const totalRefunded = getTotalRefunded(p);
                        const netBalance    = (parseFloat(p.advance_amount) || 0) - totalRefunded;
                        const hasRefunds    = totalRefunded > 0;

                        const allowEdit   = canEdit(p);
                        const allowCancel = canCancel(p);
                        const allowRefund = canRefund(p);

                        return (
                          <Tr key={menuId} even={i % 2 === 0}>
                            <Td style={{ fontWeight: 700, color: T.muted }}>{rowIdx}</Td>
                            <Td>{billDate}</Td>
                            <Td style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700 }}>
                              {(p.bill_no || "—").replace(/\//g, "")}
                            </Td>
                            <Td style={{ fontWeight: 700, color: T.tealDark }}>{ipNo}</Td>
                            <Td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {patientName}
                            </Td>
                            <Td>{p.payment_mode || "-"}</Td>
                            <Td>
                              {p.paid_date ? new Date(p.paid_date).toLocaleString("en-IN") : "-"}
                            </Td>
                            <Td right style={{ fontWeight: 700 }}>₹{fmt(p.advance_amount)}</Td>
                            <Td right>₹{fmt(p.ip_advance)}</Td>
                            <Td right>₹{fmt(p.billing_advance)}</Td>
                            {/* Total Refunded */}
                            <Td right style={{ color: hasRefunds ? T.purple : T.muted, fontWeight: hasRefunds ? 700 : 400 }}>
                              {hasRefunds ? `- ₹${fmt(totalRefunded)}` : "—"}
                              {hasRefunds && (
                                <RefundTag title={`${(p.refund_details || []).length} refund(s)`}>
                                  ×{(p.refund_details || []).length}
                                </RefundTag>
                              )}
                            </Td>
                            {/* Net Balance */}
                            <Td right style={{
                              fontWeight: 700,
                              color: netBalance <= 0 ? T.red : T.green,
                            }}>
                              ₹{fmt(netBalance)}
                            </Td>
                            <Td>
                              <StatusBadge status={status}>{status}</StatusBadge>
                            </Td>
                            <Td style={{ position: "relative", overflow: "visible" }}>
                              <KebabWrap>
                                <KebabBtn onClick={(e) => toggleMenu(menuId, e)} title="Actions">
                                  ⋮
                                </KebabBtn>
                                <DropMenu open={openMenuId === menuId}>

                                  {/* EDIT */}
                                  <DropItem
                                    disabled={!allowEdit}
                                    title={!allowEdit ? `Cannot edit — status is ${status}` : "Edit this advance"}
                                    onClick={() => {
                                      if (!allowEdit) return;
                                      setOpenMenuId(null);
                                      handleEdit(p);
                                    }}
                                  >
                                    ✏️ Edit
                                    {!allowEdit && (
                                      <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.muted }}>{status}</span>
                                    )}
                                  </DropItem>

                                  {/* REFUND */}
                                  <DropItem
                                    purple
                                    disabled={!allowRefund}
                                    title={
                                      !allowRefund
                                        ? status !== "Paid"
                                          ? `Refund only available for Paid advances (status: ${status})`
                                          : "No refundable amount remaining"
                                        : `Refund — ₹${fmt(getRefundableAmount(p))} available`
                                    }
                                    onClick={() => {
                                      if (!allowRefund) return;
                                      setOpenMenuId(null);
                                      openRefundModal(p);
                                    }}
                                  >
                                    💜 Refund
                                    {allowRefund && (
                                      <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.purple, fontWeight: 700 }}>
                                        ₹{fmt(getRefundableAmount(p))}
                                      </span>
                                    )}
                                    {!allowRefund && (
                                      <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.muted }}>{status}</span>
                                    )}
                                  </DropItem>

                                  {/* PRINT ADVANCE SLIP */}
                                  <DropItem onClick={() => { setOpenMenuId(null); openPrintModal(p); }}>
                                    🖨️ Print Slip
                                  </DropItem>

                                  {/* PRINT REFUND SLIP IF REFUNDED */}
                                  {(p.is_refund || (p.refund_details || []).length > 0) && (
                                    <DropItem
                                      purple
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        const refData = (p.refund_details && p.refund_details[0]) || {};
                                        openPrintRefundModal({
                                          ...p,
                                          refund_bill_no: refData.refund_bill_no || p.refund_bill_no,
                                          bill_no: p.bill_no,
                                          refund_amount: refData.refunded_amount || p.advance_amount,
                                          refund_date: refData.refunded_date || p.fully_refunded_date,
                                          remarks: refData.remarks || p.remarks,
                                          payment_mode: refData.payment_mode || p.payment_mode,
                                          refunded_by: refData.refunded_by,
                                        });
                                      }}
                                    >
                                      🧾 Print Refund Slip
                                    </DropItem>
                                  )}

                                  <DropDivider />

                                  {/* CANCEL */}
                                  <DropItem
                                    danger
                                    disabled={!allowCancel}
                                    title={!allowCancel ? `Cannot cancel — status is ${status}` : "Cancel this advance"}
                                    onClick={() => {
                                      if (!allowCancel) return;
                                      setOpenMenuId(null);
                                      handleCancel(p.advance_id, ipNo);
                                    }}
                                  >
                                    {status === "Cancelled" ? "✕ Cancelled" : "✕ Cancel Advance"}
                                    {!allowCancel && (
                                      <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.muted }}>{status}</span>
                                    )}
                                  </DropItem>

                                </DropMenu>
                              </KebabWrap>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </tbody>
                </Tbl>
              </TblWrap>

              {/* ── Pagination Pager ── */}
              <Pager>
                <span>
                  Showing {searchedPayments.length === 0 ? 0 : (page - 1) * perPage + 1} to{" "}
                  {Math.min(page * perPage, searchedPayments.length)} of {searchedPayments.length} entries
                </span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <PB onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </PB>
                  {getPaginationItems(page, totalPages).map((item, idx) => {
                    if (item === "...") {
                      return (
                        <PB key={`ellipsis-${idx}`} disabled style={{ cursor: "default", opacity: 0.8, color: "#6b7280" }}>
                          ...
                        </PB>
                      );
                    }
                    return (
                      <PB key={item} active={item === page} onClick={() => setPage(item)}>
                        {item}
                      </PB>
                    );
                  })}
                  <PB
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Next
                  </PB>
                </div>
              </Pager>

              <CardBody style={{ background: "#f9fafb", padding: "10px 14px", fontSize: "0.72rem", color: T.muted }}>
                Showing <strong>{searchedPayments.length}</strong> records &nbsp;|&nbsp;
                Pending: <strong>{searchedPayments.filter(p => p.status === "Pending").length}</strong> &nbsp;|&nbsp;
                Paid: <strong>{searchedPayments.filter(p => p.status === "Paid").length}</strong> &nbsp;|&nbsp;
                Cancelled: <strong>{searchedPayments.filter(p => p.status === "Cancelled").length}</strong> &nbsp;|&nbsp;
                Refunds processed: <strong>{searchedPayments.filter(p => (p.refund_details || []).length > 0).length}</strong>
              </CardBody>
            </Card>
          </>
        )}

        {/* ── ADVANCE REFUND LIST TAB ── */}
        {activeTab === "refunds" && (
          <>
            {/* ── FILTERS ── */}
            <Card>
              <CardHead color="purple">🔎 Filters &amp; Search Advance Refunds</CardHead>
              <CardBody>
                <Grid cols={6}>
                  <F span={2}>
                    <Lbl>From Date</Lbl>
                    <Inp type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} />
                  </F>
                  <F span={2}>
                    <Lbl>To Date</Lbl>
                    <Inp type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} />
                  </F>
                  <F span={2}>
                    <Lbl>Search (UHID / IP / Bill / Name)</Lbl>
                    <Inp
                      type="text"
                      placeholder="Search patient, UHID, IP, Bill No…"
                      value={refundSearch}
                      onChange={e => setRefundSearch(e.target.value)}
                    />
                  </F>
                  <F span={1}><Lbl>&nbsp;</Lbl>
                    <Btn c="purple" onClick={() => fetchRefunds(filterFromDate, filterToDate)} disabled={refundsLoading}>
                      {refundsLoading ? "Loading…" : "🔍 Search"}
                    </Btn>
                  </F>
                  <F span={1}><Lbl>&nbsp;</Lbl>
                    <Btn v="reset" onClick={() => { setRefundSearch(""); setFilterFromDate(""); setFilterToDate(""); fetchRefunds("", ""); }}>Reset</Btn>
                  </F>
                </Grid>
              </CardBody>
            </Card>

            {/* ── STATS CARDS ── */}
            <StatsWrap>
              <StatCard borderColor={T.purple}>
                <StatTitle>Total Refunds Processed</StatTitle>
                <StatVal>{filteredRefunds.length}</StatVal>
                <StatSub>Records in selected period</StatSub>
              </StatCard>
              <StatCard borderColor={T.red}>
                <StatTitle>Total Refunded Amount</StatTitle>
                <StatVal style={{ color: T.red }}>
                  ₹{fmt(filteredRefunds.reduce((acc, r) => acc + (parseFloat(r.refund_amount || r.refunded_amount) || 0), 0))}
                </StatVal>
                <StatSub>Sum of all processed refunds</StatSub>
              </StatCard>
            </StatsWrap>

            {/* ── REFUND RECORDS TABLE ── */}
            <Card>
              <CardHead color="purple" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>💸 IP Advance Refund Records</span>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 4 }}>
                  {filteredRefunds.length} Refund(s)
                </span>
              </CardHead>

              {/* Table Controls */}
              <TTBar>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#6b7280" }}>
                  Show up to&nbsp;
                  <TableSelect
                    value={refundPerPage}
                    onChange={e => {
                      setRefundPerPage(Number(e.target.value));
                      setRefundPage(1);
                    }}
                  >
                    {[10, 15, 25, 50, 100].map(n => (
                      <option key={n} value={n}>{n} rows</option>
                    ))}
                  </TableSelect>
                  &nbsp;per page
                </div>
              </TTBar>

              <div style={{ overflowX: "auto" }}>
                <Tbl>
                  <thead>
                    <tr>
                      <Th style={{ width: 40 }}>#</Th>
                      <Th>Refund Date</Th>
                      <Th>Refund Bill No</Th>
                      <Th>Original Bill</Th>
                      <Th>UHID</Th>
                      <Th>IP Number</Th>
                      <Th>Patient Name</Th>
                      <Th>Room</Th>
                      <Th style={{ textAlign: "right" }}>Refund Amount</Th>
                      <Th>Payment Mode</Th>
                      <Th>Remarks</Th>
                      <Th>Processed By</Th>
                      <Th style={{ textAlign: "center", width: 120 }}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundsLoading ? (
                      <tr>
                        <Td colSpan={13} style={{ textAlign: "center", padding: "32px", color: T.muted }}>
                          ⏳ Loading refunds…
                        </Td>
                      </tr>
                    ) : filteredRefunds.length === 0 ? (
                      <tr>
                        <Td colSpan={13} style={{ textAlign: "center", padding: "32px", color: T.muted }}>
                          No advance refunds found for the selected criteria.
                        </Td>
                      </tr>
                    ) : (
                      filteredRefunds
                        .slice((refundPage - 1) * refundPerPage, refundPage * refundPerPage)
                        .map((r, idx) => {
                          const slNo = (refundPage - 1) * refundPerPage + idx + 1;
                          const rBill = String(r.refund_bill_no || "—").replace(/\//g, "");
                          const oBill = String(r.bill_no || r.bill_number || "—").replace(/\//g, "");
                          const rAmt = parseFloat(r.refund_amount || r.refunded_amount) || 0;
                          return (
                            <tr key={r._id || r.refund_bill_no || idx}>
                              <Td style={{ fontWeight: 600 }}>{slNo}</Td>
                              <Td style={{ whiteSpace: "nowrap" }}>
                                {r.refund_date ? new Date(r.refund_date).toLocaleDateString("en-IN") : "—"}
                              </Td>
                              <Td style={{ fontWeight: 700, color: T.purple, fontFamily: "monospace" }}>
                                {rBill}
                              </Td>
                              <Td style={{ fontFamily: "monospace", color: "#475569" }}>
                                {oBill}
                              </Td>
                              <Td style={{ fontWeight: 600 }}>{r.uhid || "—"}</Td>
                              <Td style={{ fontWeight: 600 }}>{r.ip_number || "—"}</Td>
                              <Td style={{ fontWeight: 600 }}>{(r.patient_name || "—").toUpperCase()}</Td>
                              <Td>{r.room || "—"}</Td>
                              <Td style={{ textAlign: "right", fontWeight: 700, color: "#b91c1c" }}>
                                ₹{fmt(rAmt)}
                              </Td>
                              <Td>
                                <span style={{
                                  background: "#f1f5f9", padding: "2px 6px", borderRadius: 4,
                                  fontSize: "0.7rem", fontWeight: 600
                                }}>
                                  {r.payment_mode || "Cash"}
                                </span>
                              </Td>
                              <Td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.remarks || ""}>
                                {r.remarks || "—"}
                              </Td>
                              <Td style={{ fontSize: "0.75rem" }}>
                                {r.created_by || r.refunded_by || "—"}
                              </Td>
                              <Td style={{ textAlign: "center" }}>
                                <Btn
                                  v="table"
                                  c="purple"
                                  onClick={() => openPrintRefundModal(r)}
                                  title="Print Refund Bill Slip"
                                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                                >
                                  🖨️ Print Slip
                                </Btn>
                              </Td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </Tbl>
              </div>

              {/* Pagination */}
              {filteredRefunds.length > refundPerPage && (
                <Pager>
                  <div style={{ display: "flex", gap: 4 }}>
                    <PB onClick={() => setRefundPage(p => Math.max(1, p - 1))} disabled={refundPage === 1}>
                      Prev
                    </PB>
                    {Array.from({ length: Math.ceil(filteredRefunds.length / refundPerPage) }, (_, i) => i + 1).map(p => (
                      <PB key={p} active={p === refundPage} onClick={() => setRefundPage(p)}>
                        {p}
                      </PB>
                    ))}
                    <PB
                      onClick={() => setRefundPage(p => Math.min(Math.ceil(filteredRefunds.length / refundPerPage), p + 1))}
                      disabled={refundPage === Math.ceil(filteredRefunds.length / refundPerPage)}
                    >
                      Next
                    </PB>
                  </div>
                </Pager>
              )}
            </Card>
          </>
        )}
      </Page>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── REFUND MODAL ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {refundModalOpen && refundRecord && (() => {
        const totalRefunded  = getTotalRefunded(refundRecord);
        const refundable     = getRefundableAmount(refundRecord);
        const refundHistory  = Array.isArray(refundRecord.refund_details) ? refundRecord.refund_details : [];
        const enteredAmount  = parseFloat(refundAmount) || 0;

        return (
          <ModalOverlay onClick={closeRefundModal}>
            <ModalBox onClick={e => e.stopPropagation()}>
              <ModalHeader color="purple">
                <ModalTitle>💜 Process Refund — {(refundRecord.bill_no || refundRecord.advance_id || "").replace(/\//g, "")}</ModalTitle>
                <CloseBtn onClick={closeRefundModal}>×</CloseBtn>
              </ModalHeader>

              <ModalBody>
                {/* Summary */}
                <RefundSummaryBox>
                  <RefundSummaryRow>
                    <RefundSummaryLabel>IP Number</RefundSummaryLabel>
                    <RefundSummaryValue>{refundRecord.ip_number || "—"}</RefundSummaryValue>
                  </RefundSummaryRow>
                  <RefundSummaryRow>
                    <RefundSummaryLabel>Patient Name</RefundSummaryLabel>
                    <RefundSummaryValue>{refundRecord.patient_name || "—"}</RefundSummaryValue>
                  </RefundSummaryRow>
                  <RefundSummaryRow>
                    <RefundSummaryLabel>Bill No</RefundSummaryLabel>
                    <RefundSummaryValue style={{ fontFamily: "monospace" }}>{(refundRecord.bill_no || "—").replace(/\//g, "")}</RefundSummaryValue>
                  </RefundSummaryRow>
                  <div style={{ height: 1, background: "#d8b4fe", margin: "4px 0" }} />
                  <RefundSummaryRow>
                    <RefundSummaryLabel>Total Advance Amount</RefundSummaryLabel>
                    <RefundSummaryValue color={T.teal}>₹{fmt(refundRecord.advance_amount)}</RefundSummaryValue>
                  </RefundSummaryRow>
                  {totalRefunded > 0 && (
                    <RefundSummaryRow>
                      <RefundSummaryLabel>Already Refunded ({refundHistory.length} time{refundHistory.length > 1 ? "s" : ""})</RefundSummaryLabel>
                      <RefundSummaryValue color={T.red}>- ₹{fmt(totalRefunded)}</RefundSummaryValue>
                    </RefundSummaryRow>
                  )}
                  <RefundSummaryRow>
                    <RefundSummaryLabel>Refundable Balance</RefundSummaryLabel>
                    <RefundSummaryValue color={T.purple} large>₹{fmt(refundable)}</RefundSummaryValue>
                  </RefundSummaryRow>
                </RefundSummaryBox>

                <RefundWarning>⚠ Full amount refund only — partial / split refunds are not allowed.</RefundWarning>

                {/* Refund Amount Input */}
                <RefundInputWrap>
                  <Lbl style={{ fontSize: "0.72rem" }}>Refund Amount (₹) *</Lbl>
                  <RefundBigInp
                    value={refundAmount}
                    readOnly
                    onChange={e => handleRefundAmountChange(e.target.value)}
                  />
                  {refundAmountError && (
                    <RefundWarning>⚠ {refundAmountError}</RefundWarning>
                  )}
                </RefundInputWrap>

                {/* Payment Mode */}
                <Grid cols={2} style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <F>
                    <Lbl>Refund Payment Mode *</Lbl>
                    <Select value={refundPaymentMode} onChange={e => setRefundPaymentMode(e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="NEFT">NEFT</option>
                      <option value="Cheque">Cheque</option>
                    </Select>
                  </F>
                  <F>
                    <Lbl>Remarks (optional)</Lbl>
                    <Inp
                      value={refundRemarks}
                      placeholder="Reason for refund"
                      onChange={e => setRefundRemarks(e.target.value)}
                    />
                  </F>
                </Grid>

                {/* Refund History */}
                {refundHistory.length > 0 && (
                  <HistorySection>
                    <HistoryTitle>📋 Refund History ({refundHistory.length} transaction{refundHistory.length > 1 ? "s" : ""})</HistoryTitle>
                    <HistoryTbl>
                      <thead>
                        <tr>
                          <HTh>#</HTh>
                          <HTh>Date</HTh>
                          <HTh>Payment Mode</HTh>
                          <HTh>Refunded By</HTh>
                          <HTh>Remarks</HTh>
                          <HTh right>Amount</HTh>
                        </tr>
                      </thead>
                      <tbody>
                        {refundHistory.map((r, idx) => (
                          <HTr key={idx} even={idx % 2 === 0}>
                            <HTd>{idx + 1}</HTd>
                            <HTd>
                              {r.refunded_date
                                ? new Date(r.refunded_date).toLocaleString("en-IN")
                                : "—"}
                            </HTd>
                            <HTd>{r.payment_mode || "—"}</HTd>
                            <HTd>{r.refunded_by || "—"}</HTd>
                            <HTd style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.remarks || "—"}
                            </HTd>
                            <HTd right style={{ fontWeight: 700, color: T.purple }}>
                              - ₹{fmt(r.refunded_amount)}
                            </HTd>
                          </HTr>
                        ))}
                        <HTr>
                          <HTd colSpan={5} style={{ fontWeight: 800, textAlign: "right", color: T.purple, fontSize: "0.72rem" }}>
                            Total Refunded
                          </HTd>
                          <HTd right style={{ fontWeight: 800, color: T.purple }}>
                            - ₹{fmt(totalRefunded)}
                          </HTd>
                        </HTr>
                      </tbody>
                    </HistoryTbl>
                  </HistorySection>
                )}

                {refundHistory.length === 0 && (
                  <NoHistoryNote>No refunds processed for this advance yet.</NoHistoryNote>
                )}

                <ModalActions>
                  <Btn v="reset" onClick={closeRefundModal}>Cancel</Btn>
                  <Btn
                    c="purple"
                    onClick={handleRefundSubmit}
                    disabled={refundSaving || !refundAmount || !!refundAmountError || enteredAmount <= 0}
                  >
                    {refundSaving ? "Processing…" : `💜 Process Refund ₹${fmt(enteredAmount || 0)}`}
                  </Btn>
                </ModalActions>
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        );
      })()}

      {/* ── PRINT MODAL ── */}
      {printModalOpen && printRecord && (() => {
        const uhidVal = printRecord.uhid || printRecord.op_number || "—";
        const nameVal = (printRecord.patient_name || printRecord.name || "—").toUpperCase();
        const roomVal = printRecord.room || printRecord.roomNo || common.roomNo || "—";
        const billDate = formatSlipDate(printRecord.bill_date || printRecord.created_date || printRecord.date || new Date());
        const billNoVal = (printRecord.bill_no || printRecord.bill_number || "—").replace(/\//g, "");
        const ipNoVal = printRecord.ip_number || printRecord.ipNumber || "—";
        const amountVal = formatSlipAmount(printRecord.advance_amount);
        const preparedByName = (printRecord.created_by_name || "").trim() ||
          ((printRecord.created_by && printRecord.created_by === localStorage.getItem("employeeId")) ? (localStorage.getItem("name") || "").trim() : "") ||
          (localStorage.getItem("name") || "").trim() ||
          printRecord.created_by ||
          "";

        return (
          <ModalOverlay onClick={closePrintModal}>
            <ModalBox style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Advance Slip</ModalTitle>
                <CloseBtn onClick={closePrintModal}>×</CloseBtn>
              </ModalHeader>
              <ModalBody style={{ background: "#f8fafc", padding: "16px 12px" }}>
                <BillSlipContainer ref={printRef} className="print-container">
                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2px" }}>
                      SHANMUGA HOSPITAL LIMITED
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      51/24.Saradha College Road, Salem - 636007
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      04272706666
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      GST No : 33ABDCS8326A1ZP
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "800", marginTop: "4px" }}>
                      Advance Slip
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Info table */}
                  <div style={{ margin: "4px 0", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>UHID</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{uhidVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>Name</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{nameVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>Room</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{roomVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>Bill Date</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{billDate}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>Bill No</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{billNoVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "80px", fontWeight: "700", flexShrink: 0 }}>IP No</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{ipNoVal}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Items Header */}
                  <div style={{ display: "flex", fontWeight: "800", fontSize: "11px", padding: "2px 0 4px 0" }}>
                    <span style={{ width: "38px" }}>Slno</span>
                    <span style={{ flex: 1 }}>Description</span>
                    <span style={{ width: "85px", textAlign: "right" }}>Amount</span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "2px 0 4px 0" }} />

                  {/* Items Row */}
                  <div style={{ display: "flex", fontSize: "11px", padding: "3px 0" }}>
                    <span style={{ width: "38px" }}>1</span>
                    <span style={{ flex: 1 }}>Advance</span>
                    <span style={{ width: "85px", textAlign: "right" }}>{amountVal}</span>
                  </div>

                  {/* Spacer */}
                  <div style={{ height: "48px" }} />

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Total Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "11px", padding: "3px 0" }}>
                    <span style={{ fontSize: "11px" }}>Prepared by : {preparedByName}</span>
                    <div style={{ display: "flex", gap: "24px", alignItems: "baseline" }}>
                      <span style={{ fontWeight: "800", fontSize: "12px" }}>Total</span>
                      <span style={{ fontSize: "11px", width: "85px", textAlign: "right", fontWeight: "600" }}>{amountVal}</span>
                    </div>
                  </div>

                  {/* Signature */}
                  <div style={{ textAlign: "right", marginTop: "36px", fontSize: "11px", fontWeight: "600", paddingRight: "6px" }}>
                    Signature Of Cashier
                  </div>
                </BillSlipContainer>

                <ModalActions>
                  <Btn v="reset" onClick={closePrintModal}>Close</Btn>
                  <Btn c="blue" onClick={handlePrint}>🖨️ Print</Btn>
                </ModalActions>
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        );
      })()}

      {/* ── REFUND PRINT MODAL ── */}
      {printRefundModalOpen && printRefundRecord && (() => {
        const uhidVal = printRefundRecord.uhid || "—";
        const nameVal = (printRefundRecord.patient_name || printRefundRecord.name || "—").toUpperCase();
        const roomVal = printRefundRecord.room || printRefundRecord.roomNo || "—";
        const refundDate = formatSlipDate(printRefundRecord.refund_date || printRefundRecord.created_date || new Date());
        const refundBillNoVal = String(printRefundRecord.refund_bill_no || "—").replace(/\//g, "");
        const origBillNoVal = String(printRefundRecord.bill_no || printRefundRecord.bill_number || "—").replace(/\//g, "");
        const ipNoVal = printRefundRecord.ip_number || printRefundRecord.ipNumber || "—";
        const amountVal = formatSlipAmount(printRefundRecord.refund_amount || printRefundRecord.refunded_amount);
        const modeVal = printRefundRecord.payment_mode || printRefundRecord.payment_details?.method || "Cash";
        const preparedByName = (printRefundRecord.refunded_by_name || printRefundRecord.created_by_name || "").trim() ||
          (((printRefundRecord.refunded_by || printRefundRecord.created_by) && (printRefundRecord.refunded_by || printRefundRecord.created_by) === localStorage.getItem("employeeId")) ? (localStorage.getItem("name") || "").trim() : "") ||
          (localStorage.getItem("name") || "").trim() ||
          printRefundRecord.refunded_by ||
          printRefundRecord.created_by ||
          "";
        const remarksVal = printRefundRecord.remarks || "";

        return (
          <ModalOverlay onClick={closePrintRefundModal}>
            <ModalBox style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
              <ModalHeader color="purple">
                <ModalTitle>Advance Refund Slip</ModalTitle>
                <CloseBtn onClick={closePrintRefundModal}>×</CloseBtn>
              </ModalHeader>
              <ModalBody style={{ background: "#f8fafc", padding: "16px 12px" }}>
                <BillSlipContainer ref={printRefundRef} className="print-container">
                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2px" }}>
                      SHANMUGA HOSPITAL LIMITED
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      51/24.Saradha College Road, Salem - 636007
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      04272706666
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: "1.35" }}>
                      GST No : 33ABDCS8326A1ZP
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "800", marginTop: "4px", color: "#b91c1c" }}>
                      Advance Refund Slip
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Info table */}
                  <div style={{ margin: "4px 0", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>UHID</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{uhidVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Name</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{nameVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Room</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{roomVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Refund Date</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{refundDate}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Refund Bill No</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "700", color: "#b91c1c" }}>{refundBillNoVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Original Bill</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{origBillNoVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>IP No</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{ipNoVal}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", padding: "1px 0" }}>
                      <span style={{ width: "95px", fontWeight: "700", flexShrink: 0 }}>Payment Mode</span>
                      <span style={{ width: "12px", fontWeight: "700", flexShrink: 0 }}>:</span>
                      <span style={{ flex: 1, fontWeight: "500" }}>{modeVal}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Items Header */}
                  <div style={{ display: "flex", fontWeight: "800", fontSize: "11px", padding: "2px 0 4px 0" }}>
                    <span style={{ width: "38px" }}>Slno</span>
                    <span style={{ flex: 1 }}>Description</span>
                    <span style={{ width: "85px", textAlign: "right" }}>Amount</span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "2px 0 4px 0" }} />

                  {/* Items Row */}
                  <div style={{ display: "flex", fontSize: "11px", padding: "3px 0" }}>
                    <span style={{ width: "38px" }}>1</span>
                    <span style={{ flex: 1 }}>IP Advance Refund {remarksVal ? `(${remarksVal})` : ""}</span>
                    <span style={{ width: "85px", textAlign: "right", fontWeight: "700", color: "#b91c1c" }}>{amountVal}</span>
                  </div>

                  {/* Spacer */}
                  <div style={{ height: "48px" }} />

                  {/* Divider */}
                  <div style={{ borderTop: "1.5px solid #000", margin: "6px 0" }} />

                  {/* Total Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "11px", padding: "3px 0" }}>
                    <span style={{ fontSize: "11px" }}>Prepared by : {preparedByName}</span>
                    <div style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
                      <span style={{ fontWeight: "800", fontSize: "12px", color: "#b91c1c" }}>Refund Total</span>
                      <span style={{ fontSize: "11px", width: "85px", textAlign: "right", fontWeight: "700" }}>{amountVal}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px", fontSize: "10px", fontWeight: "600", padding: "0 4px" }}>
                    <span>Patient / Attender Signature</span>
                    <span>Signature Of Cashier</span>
                  </div>
                </BillSlipContainer>

                <ModalActions>
                  <Btn v="reset" onClick={closePrintRefundModal}>Close</Btn>
                  <Btn c="purple" onClick={handlePrintRefund}>🖨️ Print Refund Slip</Btn>
                </ModalActions>
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        );
      })()}
      {/* ── Patient Search Modal ── */}
      <PatientSearchModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={handlePatientSelect}
        initialQuery={patientSearchQuery}
        mode={patientSearchMode}
      />
    </>
  );
}