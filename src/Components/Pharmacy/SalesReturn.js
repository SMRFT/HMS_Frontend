import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { FaPrint, FaSearch, FaTimes } from "react-icons/fa";
import { Maximize2, Minimize2, RotateCw, Download, Printer, X } from "lucide-react";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ─────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; }
`;

// ─── Animations ──────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Toast Notification ───────────────────────────────────────────────────────
const ToastContainer = styled.div`
  position: fixed;
  top: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: ${p => p.$type === "success" ? "#1b5e20" : p.$type === "error" ? "#b71c1c" : "#e65100"};
  color: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  min-width: 280px;
  max-width: 380px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  animation: ${slideUp} 0.25s ease;
  pointer-events: all;
  line-height: 1.45;
`;

const ToastIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const ToastMsg = styled.span`
  flex: 1;
`;

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 3500) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  const ToastPortal = () => (
    <ToastContainer>
      {toasts.map(t => (
        <ToastItem key={t.id} $type={t.type}>
          <ToastIcon>
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "⚠️"}
          </ToastIcon>
          <ToastMsg>{t.message}</ToastMsg>
        </ToastItem>
      ))}
    </ToastContainer>
  );

  return { showToast, ToastPortal };
}

// ─── Page Layout ─────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 0;
  min-height: 100vh;
  background: #f4f6f9;
`;

const Breadcrumb = styled.div`
  background: #fff;
  padding: 10px 20px;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
  span { color: #999; margin: 0 5px; }
  a { color: #007bff; text-decoration: none; }
`;

const ContentArea = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-wrap: wrap;
`;

const DateGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const FieldWrap = styled.div``;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #555;
  display: block;
  margin-bottom: 4px;
`;

const DateInput = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  color: #333;
  outline: none;
  &:focus { border-color: #2e7d32; }
`;

const SearchBtn = styled.button`
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  transition: background 0.2s;
  &:hover { background: #1b5e20; }
`;

// Donut
const DonutWrapper = styled.div`
  width: 90px;
  height: 90px;
  flex-shrink: 0;
`;

const DonutSvg = styled.svg`
  transform: rotate(-90deg);
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const Dot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

const LegendLabel = styled.span`
  flex: 1;
  color: #444;
`;

const LegendCount = styled.span`
  font-weight: 700;
  color: #222;
  min-width: 18px;
  text-align: right;
`;

// New Return Button
const NewReturnBtn = styled.button`
  margin-left: auto;
  background: ${p => p.$open ? '#bf360c' : '#f57c00'};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: ${p => p.$open ? '#9a1e05' : '#e65100'}; }
`;

// ─── Inline Form Card ─────────────────────────────────────────────────────────
const FormCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  animation: ${slideDown} 0.25s ease;
`;

const FormBody = styled.div`
  padding: 20px 24px 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const BillRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const BillTypeOnlyRow = styled.div`
  display: grid;
  grid-template-columns: minmax(170px, 220px);
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const FormGroup = styled.div``;

const InputRow = styled.div`
  display: flex;
  gap: 4px;
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: ${p => p.readOnly ? '#f5f5f5' : '#fff'};
  color: #333;
  &:focus { border-color: #00796b; }
`;

const IconBtn = styled.button`
  padding: 0 9px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: #f5f5f5;
  font-size: 13px;
  flex-shrink: 0;
  &:hover { background: #e0e0e0; }
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #333;
  &:focus { border-color: #00796b; }
`;

const AgeRow = styled.div`
  display: flex;
  gap: 5px;
  input { width: 52px; text-align: center; }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 6px;
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    cursor: pointer;
  }
  input[type="radio"] { accent-color: #00796b; cursor: pointer; }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

const ResetBtn = styled.button`
  background: #616161;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #424242; }
`;

const FormSearchBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #004d40; }
`;

const SaveBtn = styled.button`
  background: #1565c0;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #0d47a1; }
  &:disabled { background: #90a4ae; cursor: not-allowed; }
`;

const BillItemsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
`;

// ─── Table Card ───────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 16px 10px;
  gap: 10px;
  flex-wrap: wrap;
`;

const ModeBtn = styled.button`
  border: 2px solid ${p => p.color};
  background: ${p => p.$active ? p.color : '#fff'};
  color: ${p => p.$active ? '#fff' : p.color};
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.color}; color: #fff; }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  input {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    min-width: 160px;
    &:focus { border-color: #007bff; }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  background: #fafafa;
  border-top: 1px solid #ebebeb;
  border-bottom: 1px solid #ebebeb;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
  vertical-align: middle;
`;

const CashBadge = styled.span`
  background: ${p =>
    p.$mode === "IP Credit" ? "#f9a825" :
    p.$mode === "Other Mode" ? "#5c6bc0" :
    "#00796b"};
  color: #fff;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  min-width: 80px;
  text-align: center;
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 32px;
  color: #999;
  font-size: 13px;
`;

const ShowingText = styled.div`
  padding: 10px 16px;
  font-size: 12px;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px 14px;
  gap: 4px;
`;

const PageBtn = styled.button`
  border: 1px solid #ddd;
  background: ${p => p.$active ? '#007bff' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#333'};
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  opacity: ${p => p.disabled ? 0.5 : 1};
`;

// ─── Bill Items Table ─────────────────────────────────────────────────────────
const BillItemsSection = styled.div`
  margin-top: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const BillItemsTitle = styled.div`
  background: #f5f5f5;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  border-bottom: 1px solid #e0e0e0;
`;

const PartialReturnBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff8e1;
  border-left: 4px solid #f9a825;
  padding: 9px 14px;
  font-size: 12.5px;
  color: #5d4037;
  border-bottom: 1px solid #ffe082;
`;

/* Small inline badge shown next to item name when partially returned */
const PartialBadge = styled.span`
  display: inline-block;
  margin-left: 6px;
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 700;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

/* Shows how many units were already returned, in a muted red chip */
const AlreadyReturnedBadge = styled.span`
  display: inline-block;
  background: #fbe9e7;
  color: #bf360c;
  border: 1px solid #ffab91;
  border-radius: 10px;
  padding: 1px 9px;
  font-size: 12px;
  font-weight: 700;
`;

const BillItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const BillItemsTh = styled.th`
  background: #fafafa;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
`;

const BillItemsTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
  vertical-align: middle;
`;

const ReturnQtyInput = styled.input`
  width: 80px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 13px;
  outline: none;
  text-align: center;
  &:focus { border-color: #00796b; }
`;

// ─── UHID Modal ───────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 680px;
  max-width: 96vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.22);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: #00695c;
  color: #fff;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  &:hover { opacity: 0.75; }
`;

const ModalBody = styled.div`
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
`;

const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const ModalTh = styled.th`
  background: #f5f5f5;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  color: #444;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
`;

const ModalTd = styled.td`
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  vertical-align: middle;
`;

const SelectBillBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #004d40; }
`;

const ModalFooter = styled.div`
  padding: 10px 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #888;
  background: #fafafa;
`;

// ─── Donut Component ──────────────────────────────────────────────────────────
function DonutChart({ cashCount, ipCount, otherCount }) {
  const r = 36, cx = 45, cy = 45;
  const circumference = 2 * Math.PI * r;
  const total = cashCount + ipCount + otherCount;

  if (!total) {
    return (
      <DonutWrapper>
        <DonutSvg width="90" height="90" viewBox="0 0 90 90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        </DonutSvg>
      </DonutWrapper>
    );
  }

  const segments = [
    { count: cashCount,  color: "#00796b" },
    { count: ipCount,    color: "#f9a825" },
    { count: otherCount, color: "#4dd0e1" },
  ];

  let accumulated = 0;
  return (
    <DonutWrapper>
      <DonutSvg width="90" height="90" viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        {segments.map((seg, i) => {
          if (!seg.count) return null;
          const len = (seg.count / total) * circumference;
          const offset = -accumulated;
          accumulated += len;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </DonutSvg>
    </DonutWrapper>
  );
}

// Helper to format patient name and deduplicate repeated names (e.g. "B B JOHN B B JOHN" -> "B B JOHN", "RANI RANI" -> "RANI", "SAMY SAMY P" -> "SAMY P")
const cleanPatientName = (name) => {
  if (!name || name === "—") return "—";
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "—";

  // Check if entire phrase is duplicated: e.g. "B B JOHN B B JOHN" -> "B B JOHN"
  if (words.length >= 2 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).map((w) => w.toLowerCase()).join(" ");
    const secondHalf = words.slice(half).map((w) => w.toLowerCase()).join(" ");
    if (firstHalf === secondHalf) {
      return words.slice(0, half).join(" ");
    }
  }

  // Deduplicate consecutive identical words if length > 1 (e.g. "SAMY SAMY P" -> "SAMY P")
  const cleanWords = [];
  for (let idx = 0; idx < words.length; idx++) {
    const w = words[idx];
    if (idx > 0 && w.length > 1 && w.toLowerCase() === words[idx - 1].toLowerCase()) {
      continue;
    }
    cleanWords.push(w);
  }
  return cleanWords.join(" ");
};

// ─── Sales Return Slip HTML Builder (Thermal Monospace Layout) ────────────────
const buildPrintSlipHtml = (data) => {
  const {
    hospital_name = "SHANMUGA HOSPITAL LIMITED",
    hospital_address = "51/24.Saradha College Road, Salem - 636007,,",
    hospital_phone = "04272706666",
    return_bill_no = "—",
    patient_name = "—",
    op_number = "—",
    uhid = "—",
    bill_no = "—",
    formatted_datetime = "—",
    total_amount = 0,
    pharmacist_name = "Pharmacist",
    items = [],
  } = (data || {});

  const totalNum = parseFloat(total_amount || 0).toFixed(2);
  const patientUhid = op_number || uhid || "—";

  const rowsHtml = (items || []).map((it) => {
    const qty = it.billed_qty ?? it.qty ?? 1;
    const name = (it.item_name || it.name || "ITEM").toUpperCase();
    const cost = parseFloat(it.re_cost ?? it.return_cost ?? it.price ?? 0).toFixed(2);
    const reQty = it.re_qty ?? it.return_qty ?? 1;
    const gst = it.gst ? (String(it.gst).includes("%") ? it.gst : `${it.gst}%`) : "5%";
    const batch = it.batch_number || it.batch || "—";
    const expiry = it.expiry_date || it.expiry || "—";
    const amt = parseFloat(it.amount ?? it.return_amount ?? 0).toFixed(2);

    return `
      <tr>
        <td style="text-align: left; padding: 2.5px 4px; vertical-align: top; width: 35px;">${qty}</td>
        <td style="text-align: left; padding: 2.5px 4px; vertical-align: top; max-width: 220px; word-break: break-word;">${name}</td>
        <td style="text-align: right; padding: 2.5px 4px; vertical-align: top; width: 65px;">${cost}</td>
        <td style="text-align: right; padding: 2.5px 4px; vertical-align: top; width: 55px;">${reQty}</td>
        <td style="text-align: center; padding: 2.5px 4px; vertical-align: top; width: 45px;">${gst}</td>
        <td style="text-align: left; padding: 2.5px 4px; vertical-align: top; width: 95px;">${batch}</td>
        <td style="text-align: center; padding: 2.5px 4px; vertical-align: top; width: 75px;">${expiry}</td>
        <td style="text-align: right; padding: 2.5px 4px; vertical-align: top; width: 75px;">${amt}</td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sales Return Slip - ${return_bill_no}</title>
  <style>
    @page {
      size: auto;
      margin: 4mm 6mm;
    }
    body {
      margin: 0;
      padding: 10px;
      font-family: 'Courier New', Courier, Consolas, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slip-container {
      width: 100%;
      max-width: 660px;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider-dash {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .divider-double {
      border-top: 2px double #000;
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: inherit;
      font-size: inherit;
    }
    th {
      font-weight: bold;
      padding: 3px 4px;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
    }
    @media print {
      body { padding: 0; background: #fff; }
      .no-print { display: none !important; }
      .slip-container { width: 100%; max-width: 100%; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="text-center bold" style="font-size: 14px; letter-spacing: 0.5px;">${hospital_name}</div>
    <div class="text-center" style="font-size: 11px; margin-top: 2px;">${hospital_address}</div>
    <div class="text-center" style="font-size: 11px;">${hospital_phone}</div>
    <div class="text-center bold" style="margin-top: 6px; font-size: 13px;">SALES RETURN SLIP</div>
    <br/>
    <div style="line-height: 1.5; font-size: 12px;">
      <div><span class="bold">SALES Refund Order No. :</span> ${return_bill_no}</div>
      <div><span class="bold">Patient   :</span> ${patient_name || "—"}</div>
      <div><span class="bold">UHID :</span> ${patientUhid}</div>
      <div style="display: flex; justify-content: space-between;">
        <div><span class="bold">Date&amp;Time :</span> ${formatted_datetime}</div>
        <div><span class="bold">Bill Number:</span> ${bill_no}</div>
      </div>
    </div>

    <table style="margin-top: 8px;">
      <thead>
        <tr>
          <th style="text-align: left; width: 35px;">Qty</th>
          <th style="text-align: left;">Particulars</th>
          <th style="text-align: right; width: 65px;">Re.cost</th>
          <th style="text-align: right; width: 55px;">Re.Qty</th>
          <th style="text-align: center; width: 45px;">Gst</th>
          <th style="text-align: left; width: 95px;">Batch</th>
          <th style="text-align: center; width: 75px;">Expiry</th>
          <th style="text-align: right; width: 75px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="divider-dash"></div>
    <div style="display: flex; justify-content: flex-end; padding: 2px 4px; font-size: 12px;">
      <span class="bold" style="margin-right: 40px;">Total :</span>
      <span class="bold" style="width: 75px; text-align: right;">${totalNum}</span>
    </div>

    <div class="divider-double"></div>
    <div style="padding: 2px 0; font-size: 12px;">
      <div><span class="bold">Refund   :</span> ${totalNum}</div>
      <div>Rupee(s) Only</div>
    </div>

    <div class="divider-double"></div>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 12px; font-size: 12px;">
      <div><span class="bold">Prepared By :</span> ${pharmacist_name || "Pharmacist"}</div>
      <div class="bold">Pharmacist</div>
    </div>
    <div style="margin-top: 4px; font-size: 11px; font-weight: bold;">E &amp; OE</div>
  </div>
</body>
</html>`;
};

// ─── Print Slip Modal Styled Components ──────────────────────────────────────
const PrintActionBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #004d40;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 105, 92, 0.3);
  }
`;

const PrintModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: ${slideDown} 0.2s ease;
`;

const PrintModalBox = styled.div`
  background: #202224;
  border-radius: 8px;
  width: ${p => p.$isMaximized ? "98vw" : "880px"};
  max-width: 98vw;
  height: ${p => p.$isMaximized ? "96vh" : "88vh"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
`;

const PrintModalTopHeader = styled.div`
  background: #00767a;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  height: 44px;
  user-select: none;
  flex-shrink: 0;
`;

const HeaderIconBtn = styled.button`
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border-radius: 4px;
  height: 28px;
  min-width: 28px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }
`;

const PrintViewerToolbar = styled.div`
  background: #2d3033;
  color: #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  height: 42px;
  border-bottom: 1px solid #3c3f42;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 10px;
`;

const ZoomBtn = styled.button`
  background: #3c3f42;
  border: 1px solid #505559;
  color: #e2e8f0;
  border-radius: 4px;
  height: 26px;
  min-width: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;

  &:hover {
    background: #505559;
    color: #fff;
  }
`;

const ToolbarActionBtn = styled.button`
  background: ${p => p.$primary ? "#00796b" : "rgba(255, 255, 255, 0.08)"};
  border: 1px solid ${p => p.$primary ? "#00897b" : "rgba(255, 255, 255, 0.18)"};
  color: #ffffff;
  border-radius: 4px;
  height: 28px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    background: ${p => p.$primary ? "#00695c" : "rgba(255, 255, 255, 0.18)"};
  }
`;

const PrintViewerCanvas = styled.div`
  flex: 1;
  background: #333639;
  overflow-y: auto;
  overflow-x: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const SlipSheetContainer = styled.div`
  background: #ffffff;
  color: #000000;
  width: 100%;
  max-width: 660px;
  padding: 28px 34px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  font-family: 'Courier New', Courier, Consolas, monospace;
  font-size: 12px;
  line-height: 1.42;
  box-sizing: border-box;
  transition: transform 0.15s ease;
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesReturn = () => {
  const today        = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");

  const [fromDate, setFromDate]         = useState(today);
  const [toDate, setToDate]             = useState(today);
  const [returnList, setReturnList]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const formRef = useRef(null);

  const [fetchingPatient, setFetchingPatient]     = useState(false);
  const [fetchingBill, setFetchingBill]           = useState(false);
  const [billTypes, setBillTypes]                 = useState([]);
  const [billItems, setBillItems]                 = useState([]);
  const [partialReturnWarning, setPartialReturnWarning] = useState("");

  // ── UHID Bills Modal State ──────────────────────────────────────────────────
  const [showUhidModal, setShowUhidModal]     = useState(false);
  const [uhidBills, setUhidBills]             = useState([]);
  const [loadingUhidBills, setLoadingUhidBills] = useState(false);

  // ── Patient Selection Modal State (Multiple Matches) ────────────────────────
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [matchingPatients, setMatchingPatients] = useState([]);

  // ── Print Modal State (Thermal Receipt Preview) ─────────────────────────────
  const [showPrintModal, setShowPrintModal]       = useState(false);
  const [printSlipData, setPrintSlipData]         = useState(null);
  const [isPrintMaximized, setIsPrintMaximized]   = useState(false);
  const [printZoom, setPrintZoom]                 = useState(100);

  const { showToast, ToastPortal } = useToast();

  const [form, setForm] = useState({
    uhidNo: "", ipNumber: "", name: "",
    ageY: "", ageM: "", ageD: "",
    gender: "", requestNo: "", paymentType: "Cash",
    billType: "", billName: "", billNumber: "", billAmount: "",
  });

  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_BillType/`, "GET");
        if (response.success && Array.isArray(response.data?.data)) {
          const data = response.data.data;
          setBillTypes(data);
          if (data.length > 0) {
            setForm((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billName: data[0].bill_name,
            }));
          }
        } else {
          setBillTypes([]);
        }
      } catch (error) {
        console.error("Error fetching bill types:", error);
        setBillTypes([]);
      }
    };
    fetchBillTypes();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(
        `${HmsBaseUrl}get_salesreturn_details/?from_date=${fromDate}&to_date=${toDate}`,
        "GET"
      );
      const data = res.data;
      const rawList = Array.isArray(data?.data) ? data.data : [];
      setReturnList(rawList.map((r) => ({
        ...r,
        patient_name: cleanPatientName(r.patient_name),
      })));
    } catch (err) {
      console.error("Sales return fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── FIX #2: normalise partial UHID/bill — support typing after slash ─────────
  // Accepts: "7878" → searches as-is (partial match on backend)
  // Accepts: "S025/007878" → searches full string
  // Accepts: "007878" (after slash part only) → backend handles partial match
  const normalizeSearchValue = (val) => val?.trim() ?? "";

  // ── Step 1: fetch patient info + open bill-selection modal ───────────────────
  const fetchPatientDetails = async (uhid) => {
    const uhidVal = normalizeSearchValue(uhid);
    if (!uhidVal) {
      showToast("Please enter a UHID to search.", "warning");
      return;
    }

    try {
      setFetchingPatient(true);

      // Fetch patient basic info with smart matching
      const res = await apiRequest(
        `${HmsBaseUrl}salesreturn_get_patientdetails/?uhid=${encodeURIComponent(uhidVal)}`,
        "GET"
      );
      const data = res.data;

      let patientsList = [];
      if (data?.status === "success") {
        if (Array.isArray(data.patients) && data.patients.length > 0) {
          patientsList = data.patients;
        } else if (data.data) {
          patientsList = [data.data];
        }
      }

      // If backend returned nothing or failed, try patient_details fallback (same as Pharmacy billing)
      if (patientsList.length === 0) {
        try {
          const pRes = await apiRequest(`${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(uhidVal)}`, "GET");
          const pData = pRes.data?.data || pRes.data || pRes;
          if (Array.isArray(pData) && pData.length > 0) {
            patientsList = pData.map(p => ({
              uhid: p.uhid,
              name: `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim(),
              gender: p.gender || "",
              ip_number: p.ip_number || "",
              mobile: p.mobilePhone || p.mobile || "",
              age: { years: p.age || 0, months: 0, days: 0 },
            }));
          }
        } catch (_) {}
      }

      if (patientsList.length === 0) {
        showToast("No patient found for the given UHID.", "warning");
        return;
      }

      if (patientsList.length > 1) {
        // Multiple patients match (e.g. partial search with multiple results) -> show patient selection modal
        setMatchingPatients(patientsList);
        setShowPatientModal(true);
      } else {
        // Exactly 1 patient matched — select and fetch bills
        await selectPatient(patientsList[0]);
      }

    } catch (err) {
      console.error("Fetch patient error:", err);
      showToast("Server error while fetching patient details.", "error");
    } finally {
      setFetchingPatient(false);
    }
  };

  const selectPatient = async (p) => {
    setShowPatientModal(false);
    const resolvedUhid = p.uhid || "";
    setForm(prev => ({
      ...prev,
      uhidNo:   resolvedUhid,
      ipNumber: p.ip_number || "",
      name:     cleanPatientName(p.name) || "",
      gender:   p.gender   || "",
      ageY:     p.age?.years  ?? (typeof p.age === "number" ? p.age : ""),
      ageM:     p.age?.months ?? "",
      ageD:     p.age?.days   ?? "",
    }));

    // Step 2: fetch all bills within 30 days for this UHID and show bill modal
    await fetchUhidBills(resolvedUhid);
  };

  // ── Fetch all bills for UHID within 30 days ──────────────────────────────────
  const fetchUhidBills = async (uhidVal) => {
    try {
      setLoadingUhidBills(true);
      setUhidBills([]);
      setShowUhidModal(true);

      const res = await apiRequest(
        `${HmsBaseUrl}salesreturn_get_uhid_bills/?uhid=${encodeURIComponent(uhidVal)}`,
        "GET"
      );
      const data = res.data;

      if (data?.status === "success" && Array.isArray(data.data)) {
        setUhidBills(data.data);
        if (data.data.length === 0) {
          showToast("No bills found within the last 30 days for this UHID / IP number.", "warning");
        }
      } else {
        showToast(data?.message || "No bills found for this UHID / IP number.", "warning");
        setUhidBills([]);
      }
    } catch (err) {
      console.error("Fetch UHID bills error:", err);
      showToast("Server error while fetching bills for this UHID.", "error");
    } finally {
      setLoadingUhidBills(false);
    }
  };

  // ── User selects a bill from the modal ───────────────────────────────────────
  const handleSelectBill = async (bill) => {
    setShowUhidModal(false);
    setForm(prev => ({
      ...prev,
      billNumber: bill.bill_no,
      uhidNo:     bill.uhid || prev.uhidNo,
    }));
    // Auto-fetch bill details
    await fetchBillDetails(bill.bill_no);
  };

  // ─── Fetch Bill Details from hospital_pharmacybilling ────────────────────────
  const fetchBillDetails = async (billNo) => {
    const billVal = normalizeSearchValue(billNo);
    if (!billVal) {
      showToast("Please enter a Bill Number to search.", "warning");
      return;
    }
    try {
      setFetchingBill(true);
      setBillItems([]);
      setPartialReturnWarning("");
      const res = await apiRequest(
        `${HmsBaseUrl}get_salesreturn_billdetails/`,
        "POST",
        { bill_no: billVal }
      );
      const data = res.data;

      if (data?.status === "success") {
        const d = data.data;
        setForm(prev => ({
          ...prev,
          billAmount:  d.net_amount  ?? d.total_amount ?? "",
          billType:    d.bill_type   ?? prev.billType,
          billName:    d.bill_name   ?? prev.billName,
          uhidNo:      prev.uhidNo   || d.uhid             || "",
          ipNumber:    prev.ipNumber || d.inpatient_number  || "",
        }));
        const items = (d.items || []).map(item => ({ ...item, returnQty: "" }));
        setBillItems(items);

        // ⚠️ Some items were already returned — show info banner
        if (d.partially_returned) {
          setPartialReturnWarning(
            data.message || "Some items in this bill have already been returned and are excluded below."
          );
        }
      } else {
        // All errors from backend (30-day, fully returned, not found) shown as toast
        showToast(data?.message || "Bill not found or not eligible for return.", "error");
      }
    } catch (err) {
      console.error("Fetch bill error:", err);
      showToast("Server error while fetching bill details.", "error");
    } finally {
      setFetchingBill(false);
    }
  };

  const handleReturnQtyChange = (index, value) => {
    const enteredQty = parseFloat(value);
    const item       = billItems[index];

    if (!item) return;

    const returnableQty = parseFloat(item.qty || 0); // remaining returnable qty from API

    // ❌ Exceeds returnable qty → toast ONCE (outside setState) then clamp
    if (!isNaN(enteredQty) && enteredQty > returnableQty) {
      showToast(
        `Return quantity cannot exceed ${returnableQty} for "${item.item_name || "this item"}" (Batch: ${item.batch_number || "—"}).`,
        "error"
      );
      setBillItems(prev =>
        prev.map((it, i) => i === index ? { ...it, returnQty: String(returnableQty) } : it)
      );
      return;
    }

    // ❌ Negative → silently reset to 0
    if (!isNaN(enteredQty) && enteredQty < 0) {
      setBillItems(prev =>
        prev.map((it, i) => i === index ? { ...it, returnQty: "0" } : it)
      );
      return;
    }

    // ✅ Valid value
    setBillItems(prev =>
      prev.map((it, i) => i === index ? { ...it, returnQty: value } : it)
    );
  };

  useEffect(() => { handleSearch(); }, []);

  // Smooth scroll to form on open
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 60);
    }
  }, [showForm]);

  const cashCount  = returnList.filter(r => r.mode === "Cash Return").length;
  const ipCount    = returnList.filter(r => r.mode === "IP Credit").length;
  const otherCount = returnList.filter(r => r.mode === "Other Mode").length;

  const filtered = returnList.filter(r =>
    !searchFilter ||
    (r.patient_name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.uhid || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleFormChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleFormReset = () => {
    setBillItems([]);
    setUhidBills([]);
    setShowUhidModal(false);
    setPartialReturnWarning("");
    setForm({
      uhidNo: "", ipNumber: "", name: "",
      ageY: "", ageM: "", ageD: "",
      gender: "", requestNo: "", paymentType: "Cash",
      billType: billTypes.length > 0 ? billTypes[0].bill_type : "",
      billName: billTypes.length > 0 ? billTypes[0].bill_name : "",
      billNumber: "", billAmount: "",
    });
  };

  const handleFormSearch = async () => {
    try {
      const params = new URLSearchParams({
        uhid_no:      form.uhidNo,
        ip_number:    form.ipNumber,
        name:         form.name,
        age_y:        form.ageY,
        age_m:        form.ageM,
        age_d:        form.ageD,
        gender:       form.gender,
        request_no:   form.requestNo,
        payment_type: form.paymentType,
      });
      const data = await apiRequest(
        `${HmsBaseUrl}sales_return_medicine/new_return/?${params}`,
        "GET"
      );
      console.log("New return search result:", data);
    } catch (err) {
      console.error("New return search error:", err);
    }
  };

  const handlePrintReturnBill = async (row) => {
    try {
      // Immediate view if row already has items
      if (Array.isArray(row.items) && row.items.length > 0) {
        setPrintSlipData({
          hospital_name: "SHANMUGA HOSPITAL LIMITED",
          hospital_address: "51/24.Saradha College Road, Salem - 636007,,",
          hospital_phone: "04272706666",
          return_bill_no: row.return_bill_no,
          bill_no: row.bill_no,
          uhid: row.uhid,
          op_number: row.uhid,
          patient_name: cleanPatientName(row.patient_name),
          formatted_datetime: formatDate(row.return_bill_date),
          pharmacist_name: row.pharmacist_name || row.created_by || row.user || "Pharmacist",
          total_amount: parseFloat(row.return_amount || 0),
          refund_amount: parseFloat(row.return_amount || 0).toFixed(2),
          items: row.items,
        });
        setShowPrintModal(true);
      }

      // Fetch complete print details from backend endpoint
      const res = await apiRequest(
        `${HmsBaseUrl}get_salesreturn_print_details/?return_bill_no=${encodeURIComponent(row.return_bill_no)}`,
        "GET"
      );
      if (res?.data?.status === "success" && res.data.data) {
        setPrintSlipData(res.data.data);
        setShowPrintModal(true);
      } else if (!Array.isArray(row.items) || row.items.length === 0) {
        setPrintSlipData({
          hospital_name: "SHANMUGA HOSPITAL LIMITED",
          hospital_address: "51/24.Saradha College Road, Salem - 636007,,",
          hospital_phone: "04272706666",
          return_bill_no: row.return_bill_no,
          bill_no: row.bill_no,
          uhid: row.uhid,
          op_number: row.uhid,
          patient_name: cleanPatientName(row.patient_name),
          formatted_datetime: formatDate(row.return_bill_date),
          pharmacist_name: row.pharmacist_name || row.created_by || row.user || "Pharmacist",
          total_amount: parseFloat(row.return_amount || 0),
          refund_amount: parseFloat(row.return_amount || 0).toFixed(2),
          items: row.items || [],
        });
        setShowPrintModal(true);
      }
    } catch (err) {
      console.error("Print slip fetch error:", err);
      if (row.return_bill_no) {
        setPrintSlipData({
          hospital_name: "SHANMUGA HOSPITAL LIMITED",
          hospital_address: "51/24.Saradha College Road, Salem - 636007,,",
          hospital_phone: "04272706666",
          return_bill_no: row.return_bill_no,
          bill_no: row.bill_no,
          uhid: row.uhid,
          op_number: row.uhid,
          patient_name: cleanPatientName(row.patient_name),
          formatted_datetime: formatDate(row.return_bill_date),
          pharmacist_name: row.pharmacist_name || row.created_by || row.user || "Pharmacist",
          total_amount: parseFloat(row.return_amount || 0),
          refund_amount: parseFloat(row.return_amount || 0).toFixed(2),
          items: row.items || [],
        });
        setShowPrintModal(true);
      }
    }
  };

  const handleTriggerPrint = () => {
    if (!printSlipData) return;
    const html = buildPrintSlipHtml(printSlipData);
    const pw = window.open("", "_blank", "width=850,height=750");
    if (pw) {
      pw.document.write(html);
      pw.document.close();
      pw.focus();
      setTimeout(() => {
        pw.print();
        pw.close();
      }, 350);
    }
  };

  const handleExportWord = () => {
    if (!printSlipData) return;
    const html = buildPrintSlipHtml(printSlipData);
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sales Return Slip - ${printSlipData.return_bill_no}</title>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", content], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cleanBillNo = (printSlipData.return_bill_no || "Slip").replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `SalesReturn_${cleanBillNo}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!printSlipData) return;
    try {
      const XLSX = await import("xlsx");
      const metaRows = [
        ["SHANMUGA HOSPITAL LIMITED"],
        ["51/24.Saradha College Road, Salem - 636007,,"],
        ["04272706666"],
        ["SALES RETURN SLIP"],
        [],
        ["SALES Refund Order No.:", printSlipData.return_bill_no || "—"],
        ["Patient Name:", printSlipData.patient_name || "—"],
        ["UHID:", printSlipData.uhid || printSlipData.op_number || "—"],
        ["Date & Time:", printSlipData.formatted_datetime || "—", "Bill Number:", printSlipData.bill_no || "—"],
        [],
        ["Qty", "Particulars", "Re.cost", "Re.Qty", "Gst", "Batch", "Expiry", "Amount"]
      ];

      const itemRows = (printSlipData.items || []).map(it => [
        it.billed_qty ?? it.qty ?? 1,
        it.item_name || "—",
        parseFloat(it.re_cost ?? it.return_cost ?? 0).toFixed(2),
        it.re_qty ?? it.return_qty ?? 1,
        it.gst || "5%",
        it.batch_number || "—",
        it.expiry_date || "—",
        parseFloat(it.amount ?? it.return_amount ?? 0).toFixed(2)
      ]);

      const footerRows = [
        [],
        ["", "", "", "", "", "", "Total:", parseFloat(printSlipData.total_amount || 0).toFixed(2)],
        ["Refund:", parseFloat(printSlipData.total_amount || 0).toFixed(2), "Rupee(s) Only"],
        [],
        ["Prepared By:", printSlipData.pharmacist_name || "Pharmacist", "", "", "", "", "Pharmacist:"]
      ];

      const allRows = [...metaRows, ...itemRows, ...footerRows];
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SalesReturnSlip");
      const cleanBillNo = (printSlipData.return_bill_no || "Slip").replace(/[^a-zA-Z0-9]/g, "_");
      XLSX.writeFile(wb, `SalesReturn_${cleanBillNo}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
    }
  };

  const handleSave = async () => {
    if (!form.billNumber?.trim()) {
      showToast("Please enter a Bill Number before saving.", "warning");
      return;
    }
    if (!billItems.length) {
      showToast("No bill items to save.", "warning");
      return;
    }
    const hasReturn = billItems.some(item => Number(item.returnQty) > 0);
    if (!hasReturn) {
      showToast("Please enter return quantity for at least one item.", "warning");
      return;
    }

    // return_amount per line = return_qty × per-unit price
    // item.billed_qty  = original qty on the bill (e.g. 5)   — from get_salesreturn_billdetails API
    // item.qty         = remaining returnable qty (e.g. 4)    — after previous returns deducted
    // item.calculated_price = pro-rated price for remaining qty (from API)
    const medicine_particulars = billItems
      .filter(item => Number(item.returnQty) > 0)
      .map(item => {
        const returnableQty     = parseFloat(item.qty ?? item.quantity ?? 0);               // remaining qty (for price calc)
        const originalBilledQty = parseFloat(item.billed_qty ?? item.qty ?? item.quantity ?? 1); // original bill qty
        const calculatedPrice   = parseFloat(item.calculated_price ?? 0);  // pro-rated to remaining qty
        const perUnitPrice      = returnableQty > 0 ? calculatedPrice / returnableQty : 0;
        const returnQty         = Number(item.returnQty);
        const returnAmount      = parseFloat((returnQty * perUnitPrice).toFixed(2));
        const cgstPct           = parseFloat(item.cgst ?? 2.5);
        const sgstPct           = parseFloat(item.sgst ?? 2.5);
        const totGst            = (cgstPct + sgstPct) || 5;

        // Clean expiry date to YYYY/MM
        let expClean = "—";
        if (item.expiry_date) {
          const s = String(item.expiry_date).split("T")[0];
          if (s.includes("-")) {
            const p = s.split("-");
            if (p.length >= 2) expClean = `${p[0]}/${p[1]}`;
          } else {
            expClean = s;
          }
        }

        return {
          item_id:        item.item_id      ?? item.id ?? "",
          item_name:      item.item_name    ?? "",
          batch_number:   item.batch_number ?? "",
          billed_qty:     originalBilledQty,
          return_qty:     returnQty,
          return_cost:    perUnitPrice.toFixed(2),
          gst:            `${totGst}%`,
          expiry_date:    expClean,
          return_amount:  returnAmount,
        };
      });

    const totalReturnAmount = medicine_particulars.reduce(
      (sum, item) => sum + item.return_amount, 0
    );

    const activeOutlet =
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "OLET002";

    const payload = {
      bill_no:               form.billNumber,
      uhid:                  form.uhidNo,
      outlet_code:           activeOutlet,
      bill_type:             form.billType, 
      return_amount:         totalReturnAmount.toFixed(2),
      medicine_particulars,
      payment_type:          form.paymentType, 
    };

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}OP_salesreturn_billdetails/`,
        "POST",
        payload
      );
      const data = res.data;
      if (data?.status === "success" || res.status === 200 || res.status === 201) {
        showToast(data?.message || "Sales return saved successfully.", "success");

        const savedSlipData = data?.print_data || {
          hospital_name: "SHANMUGA HOSPITAL LIMITED",
          hospital_address: "51/24.Saradha College Road, Salem - 636007,,",
          hospital_phone: "04272706666",
          return_bill_no: data?.data?.return_bill_no || "—",
          bill_no: form.billNumber,
          uhid: form.uhidNo,
          op_number: form.uhidNo,
          patient_name: form.name,
          formatted_datetime: new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }).replace(",", " &"),
          pharmacist_name: localStorage.getItem("username") || "Pharmacist",
          total_amount: totalReturnAmount,
          refund_amount: totalReturnAmount.toFixed(2),
          items: medicine_particulars.map(it => ({
            ...it,
            re_cost: it.return_cost,
            re_qty: it.return_qty,
            amount: it.return_amount,
          })),
        };

        handleFormReset();
        setShowForm(false);
        handleSearch();

        // Automatically open the print modal for the newly processed return!
        setPrintSlipData(savedSlipData);
        setShowPrintModal(true);
      } else {
        showToast(data?.message || "Failed to save sales return.", "error");
      }
    } catch (err) {
      console.error("Save sales return error:", err);
      const errMsg = err?.response?.data?.message || "Server error while saving.";
      showToast(errMsg, "error");
    }
  };

  const formatDate = iso => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (isNaN(date)) return iso;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <>
      <GlobalStyle />
      <ToastPortal />

      {/* ── Patient Selection Modal (when multiple patients match partial UHID) ── */}
      {showPatientModal && (
        <ModalOverlay onClick={() => setShowPatientModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <ModalHeader>
              Select Patient — {matchingPatients.length} Patients Found
              <ModalCloseBtn onClick={() => setShowPatientModal(false)}>✕</ModalCloseBtn>
            </ModalHeader>
            <ModalBody>
              <ModalTable>
                <thead>
                  <tr>
                    <ModalTh>#</ModalTh>
                    <ModalTh>UHID No</ModalTh>
                    <ModalTh>Patient Name</ModalTh>
                    <ModalTh>Gender / Age</ModalTh>
                    <ModalTh>Mobile / IP</ModalTh>
                    <ModalTh>Action</ModalTh>
                  </tr>
                </thead>
                <tbody>
                  {matchingPatients.map((p, idx) => (
                    <tr key={idx} style={{ cursor: "pointer" }} onClick={() => selectPatient(p)}>
                      <ModalTd>{idx + 1}</ModalTd>
                      <ModalTd style={{ fontWeight: 600 }}>{p.uhid}</ModalTd>
                      <ModalTd>{cleanPatientName(p.name) || "—"}</ModalTd>
                      <ModalTd>{p.gender || "—"}{p.age?.years ? ` / ${p.age.years}Y` : ""}</ModalTd>
                      <ModalTd>{p.mobile || p.ip_number || "—"}</ModalTd>
                      <ModalTd>
                        <SelectBillBtn type="button" onClick={() => selectPatient(p)}>
                          Select
                        </SelectBillBtn>
                      </ModalTd>
                    </tr>
                  ))}
                </tbody>
              </ModalTable>
            </ModalBody>
            <ModalFooter>
              Showing {matchingPatients.length} patient(s) matching your search. Click <strong>Select</strong> to choose patient.
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── UHID Bills Selection Modal ────────────────────────────────────────── */}
      {showUhidModal && (
        <ModalOverlay onClick={() => setShowUhidModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHeader>
              Select Bill — {form.uhidNo || form.name || "UHID Bills (Last 30 Days)"}
              <ModalCloseBtn onClick={() => setShowUhidModal(false)}>✕</ModalCloseBtn>
            </ModalHeader>
            <ModalBody>
              {loadingUhidBills ? (
                <NoRecords>Loading bills…</NoRecords>
              ) : uhidBills.length === 0 ? (
                <NoRecords>No paid bills found within the last 30 days.</NoRecords>
              ) : (
                <ModalTable>
                  <thead>
                    <tr>
                      <ModalTh>#</ModalTh>
                      <ModalTh>Bill No</ModalTh>
                      <ModalTh>Bill Date</ModalTh>
                      <ModalTh>Billing Mode</ModalTh>
                      <ModalTh>Net Amount (₹)</ModalTh>
                      <ModalTh>Action</ModalTh>
                    </tr>
                  </thead>
                  <tbody>
                    {uhidBills.map((bill, idx) => (
                      <tr key={idx}>
                        <ModalTd>{idx + 1}</ModalTd>
                        <ModalTd>{bill.bill_no}</ModalTd>
                        <ModalTd>{formatDate(bill.bill_date)}</ModalTd>
                        <ModalTd>{bill.billing_mode || "—"}</ModalTd>
                        <ModalTd>₹ {parseFloat(bill.net_amount || 0).toFixed(2)}</ModalTd>
                        <ModalTd>
                          <SelectBillBtn onClick={() => handleSelectBill(bill)}>
                            Select
                          </SelectBillBtn>
                        </ModalTd>
                      </tr>
                    ))}
                  </tbody>
                </ModalTable>
              )}
            </ModalBody>
            <ModalFooter>
              Showing {uhidBills.length} bill(s) within the last 30 days &nbsp;·&nbsp;
              Only <strong>Paid</strong> bills are eligible for return.
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      <PageWrapper>

        {/* Breadcrumb */}
        <Breadcrumb>
          <a href="/">Home</a>
          <span>/</span>
          Sales Return
        </Breadcrumb>

        <ContentArea>

          {/* ── Summary Card ── */}
          <SummaryCard>
            <DateGroup>
              <FieldWrap>
                <Label>From Date</Label>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </FieldWrap>
              <FieldWrap>
                <Label>To Date</Label>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </FieldWrap>
              <SearchBtn onClick={handleSearch}>
                🔍 Search
              </SearchBtn>
            </DateGroup>

            <DonutChart
              cashCount={cashCount}
              ipCount={ipCount}
              otherCount={otherCount}
            />

            <LegendList>
              <LegendItem>
                <Dot color="#00796b" />
                <LegendLabel>Cash Return</LegendLabel>
                <LegendCount>{cashCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#f9a825" />
                <LegendLabel>IP Credit</LegendLabel>
                <LegendCount>{ipCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#4dd0e1" />
                <LegendLabel>Other Mode</LegendLabel>
                <LegendCount>{otherCount}</LegendCount>
              </LegendItem>
            </LegendList>

            <NewReturnBtn
              $open={showForm}
              onClick={() => setShowForm(prev => !prev)}
            >
              {showForm ? "− New Return" : "+ New Return"}
            </NewReturnBtn>
          </SummaryCard>

          {/* ── Inline New Return Form ── */}
          {showForm && (
            <FormCard ref={formRef}>
              <FormBody>
                <FormGrid>

                  {/* UHID — triggers patient fetch + bill modal */}
                  <FormGroup>
                    <Label>UHID No</Label>
                    <InputRow>
                      <FormInput
                        value={form.uhidNo}
                        onChange={e => handleFormChange("uhidNo", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchPatientDetails(form.uhidNo);
                          }
                        }}
                        placeholder="Enter UHID & press Enter"
                      />
                      <IconBtn
                        type="button"
                        onClick={() => fetchPatientDetails(form.uhidNo)}
                        disabled={fetchingPatient}
                        title="Fetch patient details & bills"
                      >
                        {fetchingPatient ? "⏳" : "🔍"}
                      </IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>IP Number</Label>
                    <InputRow>
                      <FormInput
                        value={form.ipNumber}
                        onChange={e => handleFormChange("ipNumber", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                      <IconBtn
                        type="button"
                        style={{ background: "#bdbdbd", color: "#fff" }}
                      >
                        ⊞
                      </IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Name</Label>
                    <FormInput
                      value={form.name}
                      onChange={e => handleFormChange("name", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Age</Label>
                    <AgeRow>
                      <FormInput
                        value={form.ageY}
                        placeholder="Y"
                        onChange={e => handleFormChange("ageY", e.target.value)}
                      />
                      <FormInput
                        value={form.ageM}
                        placeholder="M"
                        onChange={e => handleFormChange("ageM", e.target.value)}
                      />
                      <FormInput
                        value={form.ageD}
                        placeholder="D"
                        onChange={e => handleFormChange("ageD", e.target.value)}
                      />
                    </AgeRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Gender</Label>
                    <FormSelect
                      value={form.gender}
                      onChange={e => handleFormChange("gender", e.target.value)}
                    >
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <Label>Date</Label>
                    <FormInput value={todayDisplay} readOnly />
                  </FormGroup>

                  <FormGroup>
                    <Label>Request No</Label>
                    <InputRow>
                      <FormInput
                        value={form.requestNo}
                        onChange={e => handleFormChange("requestNo", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup style={{ gridColumn: "span 2" }}>
                    <Label>Payment Type</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                      <RadioGroup>
                        <label>
                          <input
                            type="radio"
                            name="paymentType"
                            value="Cash"
                            checked={form.paymentType === "Cash"}
                            onChange={() => handleFormChange("paymentType", "Cash")}
                          />
                          Cash
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="paymentType"
                            value="Credit"
                            checked={form.paymentType === "Other"}
                            onChange={() => handleFormChange("paymentType", "Credit")}
                          />
                          Credit
                        </label>
                      </RadioGroup>
                      <ResetBtn type="button" onClick={handleFormReset}>
                        ↺ Reset
                      </ResetBtn>
                      <FormSearchBtn type="button" onClick={handleFormSearch}>
                        🔍 Search
                      </FormSearchBtn>
                    </div>
                  </FormGroup>

                </FormGrid>

                {/* ── Bill Type | Bill Number | Bill Amount ── */}
                <BillRow>
                  <FormGroup>
                    <Label>Bill Type</Label>
                    <FormInput
                      value={form.billName || form.billType || ""}
                      readOnly
                      placeholder="—"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Bill Number</Label>
                    <InputRow>
                      <FormInput
                        value={form.billNumber}
                        onChange={e => handleFormChange("billNumber", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchBillDetails(form.billNumber);
                          }
                        }}
                        onBlur={() => {
                          if (form.billNumber.trim()) fetchBillDetails(form.billNumber);
                        }}
                        placeholder="Enter Bill No & press Enter"
                      />
                      <IconBtn
                        type="button"
                        title="Search Bill"
                        onClick={() => fetchBillDetails(form.billNumber)}
                        disabled={fetchingBill}
                      >
                        {fetchingBill ? "⏳" : "🔍"}
                      </IconBtn>
                    </InputRow>
                  </FormGroup>
                  <FormGroup>
                    <Label>Bill Amount</Label>
                    <FormInput
                      value={form.billAmount}
                      onChange={e => handleFormChange("billAmount", e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>
                </BillRow>

                {/* ── Bill Items Table ── */}
                {billItems.length > 0 && (
                  <BillItemsSection>
                    <BillItemsTitle>Bill Items</BillItemsTitle>
                    {/* ⚠️ Partial return warning — shown when some items were already returned */}
                    {partialReturnWarning && (
                      <PartialReturnBanner>
                        ⚠️ {partialReturnWarning}
                      </PartialReturnBanner>
                    )}
                    <BillItemsTable>
                      <thead>
                        <tr>
                          <BillItemsTh>#</BillItemsTh>
                          <BillItemsTh>Item Name</BillItemsTh>
                          <BillItemsTh>Batch No</BillItemsTh>
                          <BillItemsTh>Billed Qty</BillItemsTh>
                          <BillItemsTh>Already Returned</BillItemsTh>
                          <BillItemsTh>Returnable Qty</BillItemsTh>
                          <BillItemsTh>Calculated Price (₹)</BillItemsTh>
                          <BillItemsTh>Return Qty</BillItemsTh>
                          <BillItemsTh>Return Amount (₹)</BillItemsTh>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let totalRetQty = 0;
                          let totalRetAmt = 0;
                          const rows = billItems.map((item, index) => {
                            const retQty         = parseFloat(item.returnQty || 0);
                            const returnableQty  = parseFloat(item.qty ?? item.quantity ?? 0);          // remaining qty from API
                            const billedQty      = parseFloat(item.billed_qty ?? item.qty ?? item.quantity ?? 0);
                            const alreadyRet     = parseFloat(item.already_returned || 0);
                            const calcPrice      = parseFloat(item.calculated_price ?? 0); // already pro-rated
                            const perUnitPrice   = returnableQty > 0 ? calcPrice / returnableQty : 0;
                            const retAmount      = retQty * perUnitPrice;
                            totalRetQty += retQty;
                            totalRetAmt += retAmount;
                            const isPartial      = item.is_partial_return;
                            return (
                              <tr key={index} style={isPartial ? { background: "#fffde7" } : {}}>
                                <BillItemsTd>{index + 1}</BillItemsTd>
                                <BillItemsTd>
                                  {item.item_name || "—"}
                                  {isPartial && (
                                    <PartialBadge>partial</PartialBadge>
                                  )}
                                </BillItemsTd>
                                <BillItemsTd>{item.batch_number || "—"}</BillItemsTd>
                                {/* Original billed qty */}
                                <BillItemsTd>{billedQty > 0 ? billedQty : (item.quantity ? parseFloat(item.quantity) : "—")}</BillItemsTd>
                                {/* How many already returned */}
                                <BillItemsTd>
                                  {alreadyRet > 0
                                    ? <AlreadyReturnedBadge>{alreadyRet}</AlreadyReturnedBadge>
                                    : <span style={{ color: "#aaa" }}>—</span>
                                  }
                                </BillItemsTd>
                                {/* Remaining qty available for return */}
                                <BillItemsTd style={{ fontWeight: 600, color: "#00695c" }}>
                                  {returnableQty}
                                </BillItemsTd>
                                {/* Pro-rated calculated price for the remaining qty */}
                                <BillItemsTd>{calcPrice.toFixed(2)}</BillItemsTd>
                                <BillItemsTd>
                                  <ReturnQtyInput
                                    type="number"
                                    min="0"
                                    max={returnableQty}
                                    value={item.returnQty}
                                    placeholder="0"
                                    onChange={e => handleReturnQtyChange(index, e.target.value)}
                                  />
                                </BillItemsTd>
                                <BillItemsTd>
                                  {retQty > 0 ? retAmount.toFixed(2) : "—"}
                                </BillItemsTd>
                              </tr>
                            );
                          });
                          return (
                            <>
                              {rows}
                              {totalRetQty > 0 && (
                                <tr style={{ background: "#f0faf8", fontWeight: 700 }}>
                                  <BillItemsTd colSpan={6} style={{ textAlign: "right", color: "#00695c" }}>
                                    Total Return
                                  </BillItemsTd>
                                  <BillItemsTd />
                                  <BillItemsTd style={{ color: "#00695c" }}>
                                    {totalRetQty}
                                  </BillItemsTd>
                                  <BillItemsTd style={{ color: "#00695c" }}>
                                    ₹ {totalRetAmt.toFixed(2)}
                                  </BillItemsTd>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </BillItemsTable>
                    <BillItemsFooter>
                      <SaveBtn type="button" onClick={handleSave}>
                        💾 Save
                      </SaveBtn>
                    </BillItemsFooter>
                  </BillItemsSection>
                )}
              </FormBody>
            </FormCard>
          )}

          {/* ── Table Card ── */}
          <TableCard>
            <TableToolbar>
              <ModeBtn color="#00796b" $active>■ Cash Return</ModeBtn>
              <ModeBtn color="#f9a825">■ IP Credit</ModeBtn>
              <ModeBtn color="#4dd0e1">■ Other Mode</ModeBtn>
              <SearchBox>
                Search:
                <input
                  placeholder="Search By Patient"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                />
              </SearchBox>
            </TableToolbar>

            <Table>
              <thead>
                <tr>
                  <Th>Mode</Th>
                  <Th>Return Date</Th>
                  <Th>Return NO</Th>
                  <Th>Patient</Th>
                  <Th>UHID</Th>
                  <Th>IP No/SL No</Th>
                  <Th>Return Amount</Th>
                  <Th>User</Th>
                  <Th style={{ textAlign: "center", width: 90 }}>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={9}><NoRecords>Loading…</NoRecords></Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={9}><NoRecords>No records found</NoRecords></Td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={i}>
                      <Td><CashBadge $mode={row.mode || "Cash Return"}>{row.mode || "Cash Return"}</CashBadge></Td>
                      <Td>{formatDate(row.return_bill_date)}</Td>
                      <Td>{row.return_bill_no}</Td>
                      <Td>{cleanPatientName(row.patient_name)}</Td>
                      <Td>{row.uhid || "—"}</Td>
                      <Td>{row.bill_no || "—"}</Td>
                      <Td>₹ {parseFloat(row.return_amount || 0).toFixed(2)}</Td>
                      <Td>{row.pharmacist_name || row.created_by || "—"}</Td>
                      <Td style={{ textAlign: "center" }}>
                        <PrintActionBtn
                          type="button"
                          onClick={() => handlePrintReturnBill(row)}
                          title="Print Sales Return Slip"
                        >
                          <FaPrint size={11} /> Print
                        </PrintActionBtn>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <ShowingText>
              Showing 1 to {filtered.length} of {filtered.length} entries
            </ShowingText>
            <Pagination>
              <PageBtn disabled>Previous</PageBtn>
              <PageBtn $active>1</PageBtn>
              <PageBtn disabled>Next</PageBtn>
            </Pagination>
          </TableCard>

        </ContentArea>
      </PageWrapper>

      {/* ── Print Preview Modal (Matches Hospital SALES RETURN SLIP Format) ── */}
      {showPrintModal && printSlipData && (
        <PrintModalOverlay onClick={() => setShowPrintModal(false)}>
          <PrintModalBox $isMaximized={isPrintMaximized} onClick={e => e.stopPropagation()}>
            {/* Top Bar Header */}
            <PrintModalTopHeader>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.02em" }}>Print</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.85, borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: 8 }}>
                  SALES RETURN SLIP — {printSlipData.return_bill_no || "Preview"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HeaderIconBtn title="Export to Word (.doc)" onClick={handleExportWord}>
                  W
                </HeaderIconBtn>
                <HeaderIconBtn title="Export to Excel (.xlsx)" onClick={handleExportExcel}>
                  X
                </HeaderIconBtn>
                <HeaderIconBtn
                  title={isPrintMaximized ? "Restore Size" : "Maximize"}
                  onClick={() => setIsPrintMaximized(prev => !prev)}
                >
                  {isPrintMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </HeaderIconBtn>
                <HeaderIconBtn
                  title="Close"
                  onClick={() => setShowPrintModal(false)}
                  style={{ background: "rgba(220, 38, 38, 0.4)", borderColor: "rgba(239, 68, 68, 0.6)" }}
                >
                  <X size={14} />
                </HeaderIconBtn>
              </div>
            </PrintModalTopHeader>

            {/* Viewer Toolbar */}
            <PrintViewerToolbar>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
                  Order: {printSlipData.return_bill_no || "—"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ZoomBtn onClick={() => setPrintZoom(z => Math.max(z - 10, 50))} title="Zoom Out">-</ZoomBtn>
                <span style={{ fontSize: "0.8rem", color: "#e2e8f0", minWidth: 42, textAlign: "center" }}>{printZoom}%</span>
                <ZoomBtn onClick={() => setPrintZoom(z => Math.min(z + 10, 160))} title="Zoom In">+</ZoomBtn>
                <ZoomBtn onClick={() => setPrintZoom(100)} title="Reset Zoom">
                  <RotateCw size={12} />
                </ZoomBtn>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ToolbarActionBtn onClick={handleExportExcel} title="Download Excel Sheet">
                  <Download size={13} /> Excel
                </ToolbarActionBtn>
                <ToolbarActionBtn onClick={handleExportWord} title="Download Word Document">
                  <Download size={13} /> Word
                </ToolbarActionBtn>
                <ToolbarActionBtn
                  $primary
                  onClick={handleTriggerPrint}
                  title="Print Sales Return Slip"
                >
                  <Printer size={13} /> Print Slip
                </ToolbarActionBtn>
              </div>
            </PrintViewerToolbar>

            {/* Viewer Canvas */}
            <PrintViewerCanvas>
              <SlipSheetContainer style={{ transform: `scale(${printZoom / 100})`, transformOrigin: "top center" }}>
                {/* Header */}
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", letterSpacing: "0.5px" }}>
                  {printSlipData.hospital_name || "SHANMUGA HOSPITAL LIMITED"}
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", marginTop: "2px" }}>
                  {printSlipData.hospital_address || "51/24.Saradha College Road, Salem - 636007,,"}
                </div>
                <div style={{ textAlign: "center", fontSize: "11px" }}>
                  {printSlipData.hospital_phone || "04272706666"}
                </div>
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", marginTop: "6px" }}>
                  SALES RETURN SLIP
                </div>

                {/* Metadata */}
                <div style={{ marginTop: "16px", lineHeight: 1.5, fontSize: "12px" }}>
                  <div><span style={{ fontWeight: "bold" }}>SALES Refund Order No. :</span>{printSlipData.return_bill_no}</div>
                  <div><span style={{ fontWeight: "bold" }}>Patient   :</span> {cleanPatientName(printSlipData.patient_name) || "—"}</div>
                  <div><span style={{ fontWeight: "bold" }}>UHID :</span> {printSlipData.uhid || printSlipData.op_number || "—"}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><span style={{ fontWeight: "bold" }}>Date&amp;Time :</span> {printSlipData.formatted_datetime || formatDate(printSlipData.return_bill_date)}</div>
                    <div><span style={{ fontWeight: "bold" }}>Bill Number:</span> {printSlipData.bill_no}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0 6px 0" }} />

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "inherit" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px dashed #000" }}>
                      <th style={{ textAlign: "left", padding: "3px 4px", width: "35px", fontWeight: "bold" }}>Qty</th>
                      <th style={{ textAlign: "left", padding: "3px 4px", fontWeight: "bold" }}>Particulars</th>
                      <th style={{ textAlign: "right", padding: "3px 4px", width: "65px", fontWeight: "bold" }}>Re.cost</th>
                      <th style={{ textAlign: "right", padding: "3px 4px", width: "55px", fontWeight: "bold" }}>Re.Qty</th>
                      <th style={{ textAlign: "center", padding: "3px 4px", width: "45px", fontWeight: "bold" }}>Gst</th>
                      <th style={{ textAlign: "left", padding: "3px 4px", width: "95px", fontWeight: "bold" }}>Batch</th>
                      <th style={{ textAlign: "center", padding: "3px 4px", width: "75px", fontWeight: "bold" }}>Expiry</th>
                      <th style={{ textAlign: "right", padding: "3px 4px", width: "75px", fontWeight: "bold" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printSlipData.items || []).map((it, idx) => {
                      const qty = it.billed_qty ?? it.qty ?? 1;
                      const name = (it.item_name || it.name || "Item").toUpperCase();
                      const cost = parseFloat(it.re_cost ?? it.return_cost ?? 0).toFixed(2);
                      const reQty = it.re_qty ?? it.return_qty ?? 1;
                      const gst = it.gst ? (String(it.gst).includes("%") ? it.gst : `${it.gst}%`) : "5%";
                      const batch = it.batch_number || it.batch || "—";
                      const expiry = it.expiry_date || it.expiry || "—";
                      const amt = parseFloat(it.amount ?? it.return_amount ?? 0).toFixed(2);

                      return (
                        <tr key={idx}>
                          <td style={{ textAlign: "left", padding: "3px 4px", verticalAlign: "top" }}>{qty}</td>
                          <td style={{ textAlign: "left", padding: "3px 4px", verticalAlign: "top", wordBreak: "break-word" }}>{name}</td>
                          <td style={{ textAlign: "right", padding: "3px 4px", verticalAlign: "top" }}>{cost}</td>
                          <td style={{ textAlign: "right", padding: "3px 4px", verticalAlign: "top" }}>{reQty}</td>
                          <td style={{ textAlign: "center", padding: "3px 4px", verticalAlign: "top" }}>{gst}</td>
                          <td style={{ textAlign: "left", padding: "3px 4px", verticalAlign: "top" }}>{batch}</td>
                          <td style={{ textAlign: "center", padding: "3px 4px", verticalAlign: "top" }}>{expiry}</td>
                          <td style={{ textAlign: "right", padding: "3px 4px", verticalAlign: "top" }}>{amt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "2px 4px", fontSize: "12px", fontWeight: "bold" }}>
                  <span style={{ marginRight: 40 }}>Total :</span>
                  <span style={{ width: 75, textAlign: "right" }}>{parseFloat(printSlipData.total_amount || 0).toFixed(2)}</span>
                </div>

                <div style={{ borderTop: "2px double #000", margin: "6px 0" }} />

                {/* Refund */}
                <div style={{ padding: "2px 0", fontSize: "12px" }}>
                  <div><span style={{ fontWeight: "bold" }}>Refund   :</span> {parseFloat(printSlipData.total_amount || 0).toFixed(2)}</div>
                  <div>Rupee(s) Only</div>
                </div>

                <div style={{ borderTop: "2px double #000", margin: "6px 0" }} />

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "14px", fontSize: "12px" }}>
                  <div><span style={{ fontWeight: "bold" }}>Prepared By :</span> {printSlipData.pharmacist_name || printSlipData.created_by || "Pharmacist"}</div>
                  <div style={{ fontWeight: "bold" }}>Pharmacist</div>
                </div>
                <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: "bold" }}>E &amp; OE</div>
              </SlipSheetContainer>
            </PrintViewerCanvas>
          </PrintModalBox>
        </PrintModalOverlay>
      )}
    </>
  );
};

export default SalesReturn;