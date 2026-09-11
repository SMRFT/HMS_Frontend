import { useState, useEffect, useRef, useMemo } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";

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
  width: 100%; max-width: 400px; margin: 0 auto;
  padding: 16px; border: 2px solid ${T.text};
  font-family: 'Courier New', monospace; background: ${T.white};
`;
const BillHeader   = styled.div`text-align:center; border-bottom:1px solid ${T.text}; padding-bottom:8px; margin-bottom:12px;`;
const BillTitle    = styled.div`font-size:14px; font-weight:bold; margin-bottom:2px;`;
const BillSubtitle = styled.div`font-size:11px; color:${T.muted}; margin-bottom:4px;`;
const BillSection  = styled.div`margin-bottom:10px; font-size:12px;`;
const BillRow      = styled.div`display:flex; justify-content:space-between; padding:3px 0; border-bottom:${({ divider }) => divider ? `1px dotted ${T.border}` : "none"};`;
const BillLabel    = styled.span`font-weight:bold;`;
const BillValue    = styled.span`text-align:right;`;

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
  uhid: "", ipNumber: "", name: "", age: "", gender: "",
  roomNo: "", bedNo: "", admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "", address: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const today = () => new Date().toISOString().split("T")[0];

export default function IPAdvance() {
  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Admission ─────────────────────────────────────────────────────────────
  const [common, setCommon]     = useState(EMPTY_COMMON);
  const [admissionId, setAdmId] = useState(null);

  // ── Entry form ────────────────────────────────────────────────────────────
  const [date, setDate]               = useState(today());
  const [amount, setAmount]           = useState("");
  const [ipAdv, setIpAdv]             = useState("");
  const [billAdv, setBillAdv]         = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving]           = useState(false);
  const [billTypes, setBillTypes]     = useState([]);
  const [selectedBillType, setSelectedBillType] = useState("");
  const [activeTab, setActiveTab]                   = useState("create");
  const [selectedBillTypeNo, setSelectedBillTypeNo] = useState("");
  const [loadingBillTypes, setLoadingBillTypes]     = useState(false);

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState(null);
  const advanceFormRef = useRef(null);

  // ── Records ───────────────────────────────────────────────────────────────
  const [payments, setPayments]                 = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading]                   = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterFromDate, setFilterFromDate]       = useState(today());
  const [filterToDate, setFilterToDate]           = useState(today());
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterStatus, setFilterStatus]           = useState("");

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
    fetchBillTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAdvancesByDate = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const paramObj = {};
      if (fromDate) paramObj.from_date = fromDate;
      if (toDate)   paramObj.to_date   = toDate;
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

  const fetchBillTypes = async () => {
    setLoadingBillTypes(true);
    try {
      const res = await apiRequest(`${BASE}bill-types/`, "GET");
      if (!res.success) throw new Error(res.error || "Failed to fetch bill types");
      const list = Array.isArray(res.data?.billTypes) ? res.data.billTypes : [];
      setBillTypes(list);
    } catch (e) {
      console.error("Failed to load bill types:", e);
      setBillTypes([]);
    } finally {
      setLoadingBillTypes(false);
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

  const handleSearchFilters = () => fetchAdvancesByDate(filterFromDate, filterToDate);

  const handleResetFilters = () => {
    setFilterFromDate(today()); setFilterToDate(today());
    setFilterPaymentMode(""); setFilterStatus("");
    fetchAdvancesByDate(today(), today());
  };

  // ── Load admission ─────────────────────────────────────────────────────────
  const loadActiveAdmission = async (params) => {
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await apiRequest(`${BASE}get_active_admission/?${qs}`, "GET");
      if (!res.success) {
        setAdmId(null);
        setCommon(prev => ({
          ...EMPTY_COMMON,
          uhid: params.uhid !== undefined ? params.uhid : prev.uhid,
          ipNumber: params.ip_number !== undefined ? params.ip_number : prev.ipNumber,
        }));
        return toast.error(res.error || res.message || "No active admission found");
      }
      const adm = res?.data?.data ?? res?.data ?? res;

      if (!adm?.ipNumber && !adm?.uhid) {
        setAdmId(null);
        setCommon(prev => ({
          ...EMPTY_COMMON,
          uhid: params.uhid !== undefined ? params.uhid : prev.uhid,
          ipNumber: params.ip_number !== undefined ? params.ip_number : prev.ipNumber,
        }));
        return toast.error("No active admission found");
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

      const nameParts = [
        adm.salutation  || patient.salutation,
        adm.firstName   || patient.firstName || patient.patientname,
        adm.middleName  || patient.middleName,
        adm.lastName    || patient.lastName,
      ].filter(Boolean);

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
        name:            nameParts.join(" ") || prev.name,
        age:             adm.age || patient.age || prev.age,
        gender:          adm.gender || patient.gender || prev.gender,
        address:
          adm.permanent_address || patient.permanent_address ||
          [patient.area, patient.city, patient.state, patient.zipcode].filter(Boolean).join(", ") ||
          prev.address,
        customer_type:   adm.customerType || adm.customer_type || patient.customerType || prev.customer_type,
        company:         adm.insuranceCompanyName || patient.insuranceCompanyName || adm.insuranceCompany || prev.company,
        roomNo, bedNo,
        admittingDate:   formattedDateTime,
        admittingDoctor: doctor,
        creditLimit:     adm.creditLimit != null ? adm.creditLimit : prev.creditLimit,
      }));

      toast.success(`Admission loaded: ${adm.ipNumber}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "No active admission found");
    }
  };

  const searchByUHID = () => {
    const u = common.uhid.trim();
    if (!u) return toast.warning("Enter UHID");
    loadActiveAdmission({ uhid: u });
  };

  const searchByIP = () => {
    const ip = common.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    loadActiveAdmission({ ip_number: ip });
  };

  const handleSearch = () => {
    const ip = common.ipNumber.trim();
    const u = common.uhid.trim();
    if (ip) searchByIP();
    else if (u) searchByUHID();
    else toast.warning("Enter UHID or IP Number to search");
  };

  // ── Save (new or edited) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!admissionId)             return toast.warning("Load an admission first");
    if (total <= 0)               return toast.warning("Enter a valid advance amount");
    if (!selectedBillType || !selectedBillTypeNo)
      return toast.warning("Select a Bill Type");
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
        bill_type: selectedBillType,
        billTypeNo: selectedBillTypeNo,
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
          patient_name: common.name,
          bill_date: new Date().toISOString(),
          paid_date: new Date().toISOString(),
        };
      }
      setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
      setSelectedBillType(""); setSelectedBillTypeNo("");
      fetchAdvancesByDate(filterFromDate, filterToDate);
      if (savedRecord) {
        openPrintModal(savedRecord);
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
    setSelectedBillType(String(record.bill_type || ""));
    setSelectedBillTypeNo(record.billTypeNo || "");
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
    setSelectedBillType(""); setSelectedBillTypeNo("");
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
          bill_type:      refundRecord.bill_type,
          billTypeNo:     refundRecord.billTypeNo,
        }
      );
      if (!res.success) throw new Error(res.error || "Refund failed");
      toast.success(`Refund of ₹${fmt(refundAmount)} processed successfully!`);
      closeRefundModal();
      fetchAdvancesByDate(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to process refund");
    } finally {
      setRefundSaving(false);
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const openPrintModal  = (record) => { setPrintRecord(record); setPrintModalOpen(true); };
  const closePrintModal = ()       => { setPrintModalOpen(false); setPrintRecord(null); };

  const handlePrint = () => {
    if (!printRecord) return;

    const payMode = printRecord.payment_mode || printRecord.payment_details?.method || "—";
    const paidDateRaw = printRecord.paid_date || printRecord.paid_datetime;
    const paidDate = paidDateRaw ? new Date(paidDateRaw).toLocaleString("en-IN") : "—";
    const billDate = printRecord.bill_date ? new Date(printRecord.bill_date).toLocaleString("en-IN") : "—";

    const refundHistory = Array.isArray(printRecord.refund_details) ? printRecord.refund_details : [];
    const totalRefunded = getTotalRefunded(printRecord);

    const refundRows = refundHistory.map((r, idx) => `
      <div class="row">
        <span>${idx + 1}. Refund — ${r.refunded_date ? new Date(r.refunded_date).toLocaleDateString("en-IN") : "—"} (${r.payment_mode || "—"})</span>
        <span class="val" style="color:#9333ea;">- ₹${parseFloat(r.refunded_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
    `).join("");

    const w = window.open("", "", "height=700,width=750");
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advance Slip</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Courier New', monospace; background: #fff; display: flex; justify-content: center; padding: 20px; }
            .slip { width: 100%; max-width: 400px; padding: 16px; border: 2px solid #0f172a; background: #fff; }
            .bill-header { text-align: center; border-bottom: 1px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
            .bill-title { font-size: 14px; font-weight: bold; }
            .bill-subtitle { font-size: 11px; color: #64748b; }
            .bill-adv { font-weight: bold; margin-top: 4px; }
            .section { margin-bottom: 10px; font-size: 12px; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; }
            .row.divider { border-bottom: 1px dotted #e2e8f0; }
            .row.bold { font-weight: bold; }
            .lbl { font-weight: bold; }
            .val { text-align: right; }
            .refund-section { background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 4px; padding: 8px; margin: 8px 0; }
            .refund-title { font-weight: bold; color: #7e22ce; margin-bottom: 6px; }
            .signature { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #0f172a; font-size: 11px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="bill-header">
              <div class="bill-title">SHANMUGA HOSPITAL LIMITED</div>
              <div class="bill-subtitle">Sh2/1-1, Sardar Patel Road, Salem - 636007</div>
              <div class="bill-subtitle">Ph: 04272706666</div>
              <div class="bill-adv">Advance Slip</div>
            </div>
             <div class="section">
               <div class="row"><span class="lbl">IP Number</span><span class="val">${printRecord.ip_number || "—"}</span></div>
               <div class="row"><span class="lbl">Name</span><span class="val">${printRecord.patient_name || "—"}</span></div>
               <div class="row"><span class="lbl">Bill Date</span><span class="val">${billDate}</span></div>
               <div class="row"><span class="lbl">Bill No</span><span class="val" style="font-weight:bold">${printRecord.bill_no || "—"}</span></div>
               <div class="row"><span class="lbl">Bill Type</span><span class="val">${printRecord.bill_type || "—"} ${printRecord.billTypeNo ? `(${printRecord.billTypeNo})` : ""}</span></div>
               <div class="row"><span class="lbl">Payment Mode</span><span class="val">${payMode}</span></div>
               <div class="row"><span class="lbl">Paid Date</span><span class="val">${paidDate}</span></div>
             </div>
            <div class="section">
              <div class="row divider"><span class="lbl">Description</span><span class="val">Amount</span></div>
              <div class="row"><span>1. IP Advance</span><span class="val bold">₹${fmt(printRecord.ip_advance)}</span></div>
              <div class="row"><span>2. Billing Advance</span><span class="val bold">₹${fmt(printRecord.billing_advance)}</span></div>
            </div>
            ${refundHistory.length > 0 ? `
            <div class="refund-section">
              <div class="refund-title">Refund History</div>
              ${refundRows}
              <div class="row" style="font-weight:bold;margin-top:6px;border-top:1px dotted #d8b4fe;padding-top:4px;">
                <span>Total Refunded</span><span class="val" style="color:#7e22ce;">- ₹${fmt(totalRefunded)}</span>
              </div>
            </div>` : ""}
            <div class="section">
              <div class="row divider bold">
                <span class="lbl">User: ${printRecord.created_by || "—"}</span>
                <span class="val">Total ₹${fmt(printRecord.advance_amount)}</span>
              </div>
              ${totalRefunded > 0 ? `
              <div class="row" style="font-weight:bold;color:#7e22ce;">
                <span>Net Amount</span>
                <span class="val">₹${fmt((parseFloat(printRecord.advance_amount) || 0) - totalRefunded)}</span>
              </div>` : ""}
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

  const handleResetForm = () => {
    setCommon(EMPTY_COMMON);
    setAdmId(null);
    cancelEditMode();
    setSelectedBillType(""); setSelectedBillTypeNo("");
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
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "create", label: "+ Create Advance" },
              { id: "list", label: "📋 Advance List" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "list") fetchAdvancesByDate(filterFromDate, filterToDate);
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
                        gap: 5,
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
                        gap: 5,
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </PageHeader>

        {activeTab === "create" && (
          <>
            {/* ── PATIENT & ADMISSION ── */}
            <Card>
              <CardHead color="teal">
                <span>🏥 Patient &amp; Admission Details</span>
              </CardHead>
              <CardBody>
                <Grid cols={6}>
                  <GroupLabel c="teal">Search Admission</GroupLabel>
                  <F span={2}>
                    <Lbl>UHID</Lbl>
                    <Inp value={common.uhid} placeholder="Enter UHID"
                      onChange={e => setCommon(p => ({ ...p, uhid: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && searchByUHID()} />
                  </F>
                  <F span={2}>
                    <Lbl>IP No</Lbl>
                    <Inp value={common.ipNumber} placeholder="Enter IP No"
                      onChange={e => setCommon(p => ({ ...p, ipNumber: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && searchByIP()} />
                  </F>
                  <F span={1}><Lbl>&nbsp;</Lbl><Btn onClick={handleSearch}>🔍 Search</Btn></F>
                  <F span={1}><Lbl>&nbsp;</Lbl><Btn v="reset" onClick={handleResetForm}>↺ Reset</Btn></F>

                  <GroupLabel c="teal">Patient Info</GroupLabel>
                  <F span={3}><Lbl>Patient Name</Lbl><Inp value={common.name} readOnly /></F>
                  <F><Lbl>Age</Lbl><Inp value={common.age} readOnly /></F>
                  <F><Lbl>Gender</Lbl><Inp value={common.gender} readOnly /></F>
                  <F><Lbl>Customer Type</Lbl><Inp value={common.customer_type} readOnly /></F>
                  <F span={4}><Lbl>Address</Lbl><Inp value={common.address} readOnly /></F>
                  <F span={2}><Lbl>Company</Lbl><Inp value={common.company} readOnly /></F>

                  <GroupLabel c="teal">Admission Details</GroupLabel>
                  <F><Lbl>Room No</Lbl><Inp value={common.roomNo} readOnly /></F>
                  <F><Lbl>Bed No</Lbl><Inp value={common.bedNo} readOnly /></F>
                  <F span={2}><Lbl>Admitting Date</Lbl><Inp value={common.admittingDate} readOnly /></F>
                  <F span={2}><Lbl>Admitting Doctor</Lbl><Inp value={common.admittingDoctor} readOnly /></F>
                  <F span={2} />
                </Grid>
              </CardBody>
            </Card>

            {/* ── ADVANCE INPUT FORM ── */}
            <div ref={advanceFormRef}>
              <Card editing={!!editingRecord}>
                <CardHead color={editingRecord ? "orange" : "teal"}>
                  <span>{editingRecord ? "✏️ Edit Advance" : "💵 Advance Input"}</span>
                  {editingRecord && (
                    <span style={{ fontSize: "0.68rem", opacity: 0.9, fontWeight: 500 }}>
                      Editing: {editingRecord.advance_id} | Bill: {editingRecord.bill_no}
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
                    <F span={1}>
                      <Lbl>Date</Lbl>
                      <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </F>
                    <F span={2}>
                      <Lbl>Advance Amount (₹)</Lbl>
                      <BigInp type="number" min="0" step="0.01"
                        value={amount} placeholder="Enter total advance amount"
                        onChange={e => handleAmountChange(e.target.value)} />
                    </F>
                    <F span={2}>
                      <Lbl>Bill Type *</Lbl>
                      <SearchSelect
                        options={billTypes.map(bt => ({
                          value: String(bt.bill_type),
                          label: bt.bill_name,
                          subLabel: bt.billTypeNo,
                        }))}
                        value={selectedBillType}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedBillType(val);
                          const found = billTypes.find(b => String(b.bill_type) === val);
                          setSelectedBillTypeNo(found ? found.billTypeNo : "");
                        }}
                        placeholder="Search Bill Type..."
                        disabled={!!editingRecord}
                        height="32px"
                      />
                    </F>

                    <SplitBox>
                      <SplitHeader>↳ Split Advance</SplitHeader>
                      <SplitGrid>
                        <F>
                          <Lbl>IP Advance (₹)</Lbl>
                          <Inp type="number" min="0" step="0.01"
                            value={ipAdv} placeholder="0.00"
                            disabled={total <= 0}
                            onChange={e => handleIpAdvChange(e.target.value)} />
                        </F>
                        <F>
                          <Lbl>Billing Advance (₹)</Lbl>
                          <Inp type="number" min="0" step="0.01"
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
              <TblWrap>
                <Tbl>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Bill Date</Th>
                      <Th>Bill No</Th>
                      <Th>IP No</Th>
                      <Th>Patient Name</Th>
                      <Th>Bill Type</Th>
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
                        <Td colSpan={15} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                          ⏳ Loading records…
                        </Td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <Td colSpan={15} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                          No advance records found for the selected date range / filters
                        </Td>
                      </tr>
                    ) : (
                      filteredPayments.map((p, i) => {
                        const status      = p.status || "Pending";
                        const billDate    = p.bill_date ? new Date(p.bill_date).toLocaleDateString("en-IN") : "—";
                        const patientName = p.patient_name || p.name || p.patientName || "—";
                        const ipNo        = p.ip_number    || p.ipNumber || "—";
                        const billTypeStr = p.bill_type ? `${p.bill_type} (${p.billTypeNo || ""})` : "—";
                        const menuId      = String(p.bill_no || `${ipNo}_${p.advance_id || i}_${i}`);
                        const totalRefunded = getTotalRefunded(p);
                        const netBalance    = (parseFloat(p.advance_amount) || 0) - totalRefunded;
                        const hasRefunds    = totalRefunded > 0;

                        const allowEdit   = canEdit(p);
                        const allowCancel = canCancel(p);
                        const allowRefund = canRefund(p);

                        return (
                          <Tr key={menuId} even={i % 2 === 0}>
                            <Td style={{ fontWeight: 700, color: T.muted }}>{i + 1}</Td>
                            <Td>{billDate}</Td>
                            <Td style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700 }}>
                              {p.bill_no || "—"}
                            </Td>
                            <Td style={{ fontWeight: 700, color: T.tealDark }}>{ipNo}</Td>
                            <Td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {patientName}
                            </Td>
                            <Td style={{ fontSize: "0.68rem" }}>{billTypeStr}</Td>
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

                                  {/* PRINT */}
                                  <DropItem onClick={() => { setOpenMenuId(null); openPrintModal(p); }}>
                                    🖨️ Print Slip
                                  </DropItem>

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

              <CardBody style={{ background: "#f9fafb", padding: "10px 14px", fontSize: "0.72rem", color: T.muted }}>
                Showing <strong>{filteredPayments.length}</strong> records &nbsp;|&nbsp;
                Pending: <strong>{filteredPayments.filter(p => p.status === "Pending").length}</strong> &nbsp;|&nbsp;
                Paid: <strong>{filteredPayments.filter(p => p.status === "Paid").length}</strong> &nbsp;|&nbsp;
                Cancelled: <strong>{filteredPayments.filter(p => p.status === "Cancelled").length}</strong> &nbsp;|&nbsp;
                Refunds processed: <strong>{filteredPayments.filter(p => (p.refund_details || []).length > 0).length}</strong>
              </CardBody>
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
                <ModalTitle>💜 Process Refund — {refundRecord.bill_no || refundRecord.advance_id}</ModalTitle>
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
                    <RefundSummaryValue style={{ fontFamily: "monospace" }}>{refundRecord.bill_no || "—"}</RefundSummaryValue>
                  </RefundSummaryRow>
                  <RefundSummaryRow>
                    <RefundSummaryLabel>Bill Type</RefundSummaryLabel>
                    <RefundSummaryValue>{`${refundRecord.bill_type || "-"} (${refundRecord.billTypeNo || "-"})`}</RefundSummaryValue>
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
                    type="number"
                    min="0.01"
                    step="0.01"
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
      {printModalOpen && printRecord && (
        <ModalOverlay onClick={closePrintModal}>
          <ModalBox wide onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Advance Payment Slip</ModalTitle>
              <CloseBtn onClick={closePrintModal}>×</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <BillSlipContainer ref={printRef} className="print-container">
                <BillHeader>
                  <BillTitle>SHANMUGA HOSPITAL LIMITED</BillTitle>
                  <BillSubtitle>Sh2/1-1, Sardar Patel Road, Salem - 636007</BillSubtitle>
                  <BillSubtitle>Ph: 04272706666</BillSubtitle>
                  <div style={{ fontWeight: "bold", marginTop: "4px" }}>Advance Slip</div>
                </BillHeader>

                {(() => {
                  const payMode = printRecord.payment_mode || printRecord.payment_details?.method || "—";
                  const paidDate = printRecord.paid_date || printRecord.paid_datetime;
                  const refundHistory = Array.isArray(printRecord.refund_details) ? printRecord.refund_details : [];
                  const totalRefunded = getTotalRefunded(printRecord);
                  const netBalance = (parseFloat(printRecord.advance_amount) || 0) - totalRefunded;

                  return (
                    <>
                      <BillSection>
                        <BillRow><BillLabel>IP Number</BillLabel><BillValue>{printRecord.ip_number || "—"}</BillValue></BillRow>
                        <BillRow><BillLabel>Name</BillLabel><BillValue>{printRecord.patient_name || "—"}</BillValue></BillRow>
                        <BillRow>
                          <BillLabel>Bill Date</BillLabel>
                          <BillValue>{printRecord.bill_date ? new Date(printRecord.bill_date).toLocaleString("en-IN") : "—"}</BillValue>
                        </BillRow>
                        <BillRow><BillLabel>Bill No</BillLabel><BillValue style={{ fontWeight: "bold" }}>{printRecord.bill_no || "—"}</BillValue></BillRow>
                        <BillRow>
                          <BillLabel>Bill Type</BillLabel>
                          <BillValue>{printRecord.bill_type || "—"} {printRecord.billTypeNo ? `(${printRecord.billTypeNo})` : ""}</BillValue>
                        </BillRow>
                        <BillRow><BillLabel>Payment Mode</BillLabel><BillValue>{payMode}</BillValue></BillRow>
                        <BillRow>
                          <BillLabel>Paid Date</BillLabel>
                          <BillValue>{paidDate ? new Date(paidDate).toLocaleString("en-IN") : "—"}</BillValue>
                        </BillRow>
                      </BillSection>

                      <BillSection>
                        <BillRow divider><BillLabel>Description</BillLabel><BillValue>Amount</BillValue></BillRow>
                        <BillRow><span>Advance Amount</span><BillValue style={{ fontWeight: "bold" }}>₹{fmt(printRecord.advance_amount)}</BillValue></BillRow>
                      </BillSection>

                      {refundHistory.length > 0 && (
                        <BillSection style={{ background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 4, padding: 8 }}>
                          <div style={{ fontWeight: "bold", color: "#7e22ce", marginBottom: 6, fontSize: 11 }}>
                            Refund History
                          </div>
                          {refundHistory.map((r, idx) => (
                            <BillRow key={idx}>
                              <span style={{ fontSize: 11 }}>
                                {idx + 1}. {r.refunded_date ? new Date(r.refunded_date).toLocaleDateString("en-IN") : "—"} ({r.payment_mode || "—"})
                              </span>
                              <BillValue style={{ color: "#7e22ce", fontWeight: "bold" }}>
                                - ₹{fmt(r.refunded_amount)}
                              </BillValue>
                            </BillRow>
                          ))}
                          <BillRow divider style={{ fontWeight: "bold", color: "#7e22ce", marginTop: 4 }}>
                            <span>Total Refunded</span>
                            <BillValue>- ₹{fmt(totalRefunded)}</BillValue>
                          </BillRow>
                        </BillSection>
                      )}

                      <BillSection>
                        <BillRow divider style={{ fontWeight: "bold" }}>
                          <BillLabel>User: {printRecord.created_by || "—"}</BillLabel>
                          <BillValue>Total ₹{fmt(printRecord.advance_amount)}</BillValue>
                        </BillRow>
                        {totalRefunded > 0 && (
                          <BillRow style={{ fontWeight: "bold", color: "#7e22ce" }}>
                            <span>Net Balance</span>
                            <BillValue>₹{fmt(netBalance)}</BillValue>
                          </BillRow>
                        )}
                      </BillSection>

                      <BillSection style={{ textAlign: "center", marginTop: 20, paddingTop: 10, borderTop: `1px solid ${T.text}` }}>
                        <div style={{ fontSize: 11, marginBottom: 20 }}>Signature Of Cashier</div>
                      </BillSection>
                    </>
                  );
                })()}
              </BillSlipContainer>

              <ModalActions>
                <Btn v="reset" onClick={closePrintModal}>Close</Btn>
                <Btn c="blue" onClick={handlePrint}>🖨️ Print</Btn>
              </ModalActions>
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
}