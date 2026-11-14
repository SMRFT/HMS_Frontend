import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  FaTrashAlt,
  FaPills,
  FaSearch,
  FaPrint,
  FaSave,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import SummaryHead from "../Images/Header.png";
import styled, { keyframes } from "styled-components";
import SearchSelect from "../Common/SearchSelect";
import {
  PageWrapper,
  colors,
  fadeIn,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  SearchRow,
  SearchInput,
  NoResults,
  ButtonContainer,
} from "../GlobalStyles";

// ─── Local Styled Components ─────────────────────────────────────────────────

const blinkDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(0.7); }
`;

const BlinkDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
  display: inline-block;
  flex-shrink: 0;
  animation: ${blinkDot} 1s ease-in-out infinite;
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 3px solid #cbd5e1;
  border-top-color: #0f766e;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

// Helper to format patient full name without repeating identical first/last names
const formatPatientName = (salutation, firstName, lastName) => {
  const s = (salutation || "").trim();
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();

  let name = "";
  if (f && l) {
    if (
      f.toLowerCase() === l.toLowerCase() ||
      f.toLowerCase().endsWith(l.toLowerCase()) ||
      f.toLowerCase().replace(/\s+/g, "") === l.toLowerCase().replace(/\s+/g, "")
    ) {
      name = f;
    } else if (l.toLowerCase().startsWith(f.toLowerCase())) {
      name = l;
    } else {
      name = `${f} ${l}`;
    }
  } else {
    name = f || l || "";
  }

  return s ? `${s} ${name}`.trim() : name;
};

// Helper to format expiry date as YYYY/MM matching pharmacy invoice standard (e.g. 2031/07)
const formatExpiryDate = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "N/A") return "—";
  const raw = String(dateStr).split("T")[0].trim();
  const parts = raw.split(/[-/]/);
  if (parts.length >= 2) {
    if (parts[0].length === 4) {
      return `${parts[0]}/${parts[1].padStart(2, "0")}`;
    }
    if (parts[2] && parts[2].length === 4) {
      return `${parts[2]}/${parts[1].padStart(2, "0")}`;
    }
  }
  return raw;
};

// Helper to format bill date & time (e.g., "2026-10-30 08:49:15 AM")
const formatBillDateTime = (rawDate) => {
  if (!rawDate || rawDate === "—" || rawDate === "N/A") return "—";
  let s = String(rawDate).trim();

  // If already formatted with AM/PM, return as is
  if (/\b(AM|PM|am|pm)\b/.test(s)) return s;

  // If missing timezone offset or 'Z' on an ISO string, append 'Z' so UTC converts to local
  if (s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s)) {
    s += "Z";
  }

  // If only a date string like "2026-10-30" was provided, append current local time
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = String(hours24 % 12 || 12).padStart(2, "0");
    return `${s} ${hours12}:${minutes}:${seconds} ${ampm}`;
  }

  const d = new Date(s);
  if (isNaN(d.getTime())) return rawDate;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");

  return `${year}-${month}-${day} ${hours12}:${minutes}:${seconds} ${ampm}`;
};

// Helper to calculate compact windowed pagination for modal
const getModalPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(15, 118, 110, 0.06),
    0 8px 32px rgba(15, 118, 110, 0.10),
    0 0 0 1px rgba(15, 118, 110, 0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px 10px 32px;
  background: #ffffff;
  border-bottom: 1px solid #f0fdfa;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f766e;
  letter-spacing: -0.01em;

  svg {
    background: #f0fdfa;
    padding: 7px;
    border-radius: 10px;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: #0f766e;
  }
`;

const LastBilledBadge = styled.div`
  font-size: 0.82rem;
  font-weight: 500;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 24px;
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f766e;
  transition: background 0.2s;

  &:hover {
    background: #ccfbf1;
  }

  span.link {
    color: #0f766e;
    cursor: pointer;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px dashed #0f766e;
    transition: color 0.15s, border-color 0.15s;
    &:hover {
      color: #0d9488;
      border-color: #0d9488;
    }
  }
`;

const FormSection = styled.div`
  padding: 22px 32px;
  border-bottom: 1px solid #f0fdfa;
  background: #ffffff;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #0f766e, #14b8a6);
    border-radius: 0 2px 2px 0;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0f766e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #ccfbf1, transparent);
  }
`;

const MedicineSearchWrapper = styled.div`
  padding: 18px 32px 22px;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #0f766e, #14b8a6, transparent);
  }
`;

const SearchHint = styled.p`
  font-size: 0.77rem;
  color: #64748b;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: #0f766e;
    opacity: 0.7;
  }

  strong {
    color: #0f766e;
    font-weight: 700;
  }
`;

const SearchInputStyled = styled(Input)`
  width: 100%;
  padding-left: 16px;
  padding-right: 14px;
  cursor: ${props => props.disabled ? "not-allowed" : "text"};
  background-color: ${props => props.disabled ? "#f8fafc" : "#ffffff"};
  border-right: none;
  border-radius: 10px 0 0 10px;
  flex: 1;
  border-color: #cbd5e1;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    box-shadow: none;
    border-color: #0f766e;
    background-color: #ffffff;
    z-index: 1;
  }

  &::placeholder {
    color: #94a3b8;
    font-style: italic;
  }
`;

const SearchInputRow = styled.div`
  display: flex;
  align-items: stretch;
  max-width: 500px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.10), 0 0 0 1px #e2e8f0;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 2px 12px rgba(15, 118, 110, 0.18), 0 0 0 2px #0f766e;
  }
`;

const SearchIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  gap: 8px;
  background: ${props => props.disabled
    ? "linear-gradient(135deg, #e2e8f0, #f1f5f9)"
    : "linear-gradient(135deg, #0f766e, #0d9488)"};
  color: ${props => props.disabled ? "#94a3b8" : "white"};
  border: 1px solid ${props => props.disabled ? "#cbd5e1" : "#0f766e"};
  border-left: none;
  border-radius: 0 10px 10px 0;
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.2s;

  svg {
    font-size: 0.9rem;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
    transform: translateX(1px);
  }

  &:active:not(:disabled) {
    transform: translateX(0);
  }
`;

const MedicinesTableSection = styled.div`
  padding: 22px 32px 32px;
  background: #fafafa;
`;

const NetAmountRow = styled.tr`
  background: linear-gradient(135deg, #f0fdfa, #f8fafc);
  td {
    font-weight: 700;
    font-size: 0.93rem;
    color: #0f766e;
    padding: 14px 12px;
  }
`;

const QtyInput = styled(Input)`
  width: 82px;
  padding: 6px 8px;
  text-align: center;
  font-size: 0.88rem;
  border-radius: 7px;
  border-color: #d1fae5;
  background: #f0fdfa;
  color: #0f766e;
  font-weight: 600;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    outline: none;
    background: #fff;
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  padding: 7px;
  border-radius: 8px;
  transition: background 0.18s, color 0.18s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fef2f2;
    color: #dc2626;
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${props => props.low ? "#fef2f2" : "#f0fdf4"};
  color: ${props => props.low ? "#dc2626" : "#15803d"};
  border: 1px solid ${props => props.low ? "#fecaca" : "#bbf7d0"};
`;

const ModalResultCount = styled.p`
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 12px;
  font-style: italic;
`;

const ModalCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #0f766e;
  border-radius: 4px;
`;

const ModalFooterBar = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #f0fdfa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: linear-gradient(135deg, #f0fdfa, #f8fafc);
`;

const ModalPaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  min-width: ${({ $isNav }) => ($isNav ? "auto" : "34px")};
  padding: ${({ $isNav }) => ($isNav ? "0 12px" : "0 6px")};
  border-radius: 6px;
  border: ${({ $active }) => ($active ? "none" : "1px solid #cbd5e1")};
  background: ${({ $active, disabled }) =>
    disabled
      ? "#f8fafc"
      : $active
      ? "linear-gradient(135deg, #0f766e, #0d9488)"
      : "#ffffff"};
  color: ${({ $active, disabled }) =>
    disabled
      ? "#94a3b8"
      : $active
      ? "#ffffff"
      : "#374151"};
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  font-size: 0.85rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 8px rgba(15, 118, 110, 0.25)" : "none"};
  transition: all 0.15s ease;
  user-select: none;

  &:hover:not(:disabled) {
    background: ${({ $active }) =>
      $active
        ? "linear-gradient(135deg, #0f766e, #0d9488)"
        : "#f0fdfa"};
    border-color: #0d9488;
    color: ${({ $active }) => ($active ? "#ffffff" : "#0f766e")};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ConfirmModalOverlay = styled(ModalOverlay)``;

const ConfirmBox = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(15, 118, 110, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  h4 {
    margin: 0 0 10px;
    font-size: 1.15rem;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  p {
    color: #64748b;
    font-size: 0.93rem;
    margin-bottom: 28px;
    line-height: 1.6;
  }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

// ── Estimate banner (shown when loaded from estimate) ─────────────────────────
const EstimateBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0;

  button {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #b45309;
    font-size: 1rem;
    padding: 0 4px;
    &:hover { color: #92400e; }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    border-radius: 10px;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 14px 18px;
    min-height: unset;
  }
  .Toastify__toast--success {
    background: #f0fdf4;
    color: #166534;
    border-left: 5px solid #22c55e;
  }
  .Toastify__toast--success .Toastify__toast-icon svg { fill: #22c55e; }
  .Toastify__toast--success .Toastify__progress-bar { background: #22c55e; }
  .Toastify__toast--success .Toastify__close-button { color: #166534; }
  .Toastify__toast--error {
    background: #fef2f2;
    color: #991b1b;
    border-left: 5px solid #ef4444;
  }
  .Toastify__toast--error .Toastify__toast-icon svg { fill: #ef4444; }
  .Toastify__toast--error .Toastify__progress-bar { background: #ef4444; }
  .Toastify__toast--error .Toastify__close-button { color: #991b1b; }
  .Toastify__toast--warning {
    background: #fffbeb;
    color: #92400e;
    border-left: 5px solid #f59e0b;
  }
  .Toastify__toast--warning .Toastify__toast-icon svg { fill: #f59e0b; }
  .Toastify__toast--warning .Toastify__progress-bar { background: #f59e0b; }
`;

// ── Helper to Paginate Medicines for Print Layout (A5 Landscape) ──
const chunkMedicinesForPrint = (items) => {
  const list = items || [];
  // If 7 or fewer, fits comfortably on a single A5 landscape page along with header, totals & footer
  if (list.length <= 7) {
    return [list];
  }

  const pages = [];
  let remaining = [...list];

  while (remaining.length > 0) {
    // If remaining fits on the final page (with totals & signature)
    if (remaining.length <= 7) {
      pages.push(remaining);
      break;
    }
    // If remaining is 8 to 14, distribute evenly so final page has a balanced set
    if (remaining.length <= 14) {
      const take = Math.ceil(remaining.length / 2);
      pages.push(remaining.slice(0, take));
      remaining = remaining.slice(take);
    } else {
      // Continuation pages without totals/signature can hold up to 10 rows safely
      const take = 10;
      pages.push(remaining.slice(0, take));
      remaining = remaining.slice(take);
    }
  }

  return pages;
};

// ── Reliable Cross-Browser Print Execution (Uses hidden iframe to prevent popup blockers & premature close) ──
const executeBillPrint = (html) => {
  if (!html) return;
  try {
    let iframe = document.getElementById("hms-pharmacy-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "hms-pharmacy-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Iframe print error, falling back to window.open", err);
        fallbackWindowPrint(html);
      }
    }, 250);
  } catch (e) {
    console.warn("Iframe print initialization failed, falling back to window.open", e);
    fallbackWindowPrint(html);
  }
};

const fallbackWindowPrint = (html) => {
  const pw = window.open("", "_blank", "width=960,height=700");
  if (pw) {
    pw.document.open();
    pw.document.write(html);
    pw.document.close();
    pw.focus();
    setTimeout(() => {
      pw.print();
    }, 350);
  } else {
    toast.error("Print popup was blocked by browser. Please allow popups for this site.");
  }
};

const numberToWords = (num) => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Rupees Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (val) => {
    let str = "";
    if (val > 9999999) {
      str += inWords(Math.floor(val / 10000000)) + " Crore ";
      val %= 10000000;
    }
    if (val > 99999) {
      str += inWords(Math.floor(val / 100000)) + " Lakh ";
      val %= 100000;
    }
    if (val > 999) {
      str += inWords(Math.floor(val / 1000)) + " Thousand ";
      val %= 1000;
    }
    if (val > 99) {
      str += inWords(Math.floor(val / 100)) + " Hundred ";
      val %= 100;
    }
    if (val > 0) {
      if (str !== "") str += "and ";
      if (val < 20) str += a[val];
      else str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
    }
    return str.trim();
  };

  const words = inWords(n);
  const paise = Math.round((Math.abs(Number(num) || 0) - n) * 100);
  if (paise > 0) {
    return `Rupees ${words} and ${inWords(paise)} Paise Only`;
  }
  return `Rupees ${words} Only`;
};

// ── Reverse GST Pharmacy Pricing Calculation Helper ────────────────────────
// Reverse-calculates Tax-Exclusive Product Value from GST-inclusive MRP:
// Product Value = (Qty * MRP) / (1 + GST% / 100)
// Discount @ D% on Product Value = Product Value * (D / 100)
// Taxable Value = Product Value - Discount
// GST @ Rate% on Taxable Value = Taxable Value * (Rate / 100)
// Line Total = Taxable Value + GST
export const calculateMedicinePricing = (item, customQty = null, customDiscVal = null) => {
  const qty = customQty !== null ? (parseFloat(customQty) || 0) : (parseFloat(item?.quantity ?? item?.qty ?? 0) || 0);
  const mrp = parseFloat(item?.mrp || item?.price || item?.Selling_Price || item?.selling_price || 0);
  const gross = parseFloat((qty * mrp).toFixed(2));

  const cgstRate = parseFloat(item?.cgst_rate ?? item?.CGST_Percentage ?? item?.cgst_percentage ?? item?.cgst_pct ?? 2.5);
  const sgstRate = parseFloat(item?.sgst_rate ?? item?.SGST_Percentage ?? item?.sgst_percentage ?? item?.sgst_pct ?? 2.5);
  const totalGstRate = cgstRate + sgstRate;

  // Product Value = undiscounted base value without GST (Gross MRP / (1 + GST% / 100))
  const productValue = totalGstRate > 0 ? (gross / (1 + totalGstRate / 100)) : gross;

  const discVal = customDiscVal !== null
    ? (parseFloat(customDiscVal) || 0)
    : parseFloat(item?.discount_value ?? item?.discount_percent ?? item?.discount ?? 0);
  const discType = item?.discount_type || "percent";

  // Discount is calculated on Product Value (without GST amount)
  let discAmtOnBase = 0;
  if (discType === "amount") {
    discAmtOnBase = totalGstRate > 0 ? (discVal / (1 + totalGstRate / 100)) : discVal;
  } else {
    discAmtOnBase = productValue * (discVal / 100);
  }
  discAmtOnBase = Math.min(productValue, Math.max(0, discAmtOnBase));

  const taxableValue = productValue - discAmtOnBase;

  // GST calculated on discounted taxable value
  const cgstAmt = (taxableValue * cgstRate) / 100;
  const sgstAmt = (taxableValue * sgstRate) / 100;
  const totalGstAmt = cgstAmt + sgstAmt;

  // Total bill value = Taxable Value + GST Amount
  const lineTotal = parseFloat((taxableValue + totalGstAmt).toFixed(2));

  // Total discount on MRP (including GST savings)
  const totalDiscountOnMrp = parseFloat(Math.max(0, gross - lineTotal).toFixed(2));

  return {
    qty,
    mrp,
    gross,
    cgstRate,
    sgstRate,
    totalGstRate,
    productValue: parseFloat(productValue.toFixed(4)),
    discVal,
    discType,
    discAmtOnBase: parseFloat(discAmtOnBase.toFixed(4)),
    taxableValue: parseFloat(taxableValue.toFixed(4)),
    cgstAmt: parseFloat(cgstAmt.toFixed(2)),
    sgstAmt: parseFloat(sgstAmt.toFixed(2)),
    totalGstAmt: parseFloat(totalGstAmt.toFixed(2)),
    lineTotal,
    totalDiscountOnMrp,
  };
};

// ── Elegant Pharmacy Tax Invoice Generator (A5 Alignment Sheet Layout with Multi-Page Support) ──
const buildPrintBillHtml = (data) => {
  const {
    billNo = "—",
    billDate = "—",
    patientName = "—",
    uhid = "—",
    patientAge = "—",
    doctorName = "—",
    roomNo = "",
    inpatientNumber = "",
    inpatient_number = "",
    insuranceName = "",
    insurance_company = "",
    billTypeName = "OP Pharmacy",
    paymentMode = "Cash",
    employeeName = "Pharmacist",
    medicines = [],
    totalAmount = 0,
    totalItemDiscount = 0,
    overallDiscountType = "percent",
    overallDiscountValue = 0,
    netAmount = 0,
    round_off = 0,
    isDuplicate = false,
  } = (data || {});

  const inpatientNo = inpatientNumber || inpatient_number || (data && (data.ipNumber || data.ip_number)) || "";
  const resolvedRoom = roomNo || (data && (data.room || data.room_no)) || "";
  const resolvedInsurance = insuranceName || insurance_company || (data && (data.insurance_name || data.customer_type)) || "";

  const resolvedPaymentMode = String(
    (data && (data.payment_mode || data.paymentMode || data.payment_method)) ||
    paymentMode ||
    "Cash"
  ).trim();
  const resolvedBillingMode = String(
    (data && (data.billing_mode || data.billingMode)) ||
    billingMode ||
    ""
  ).trim().toUpperCase();
  const isCreditBill = resolvedPaymentMode.toLowerCase().includes("credit") ||
    resolvedBillingMode.includes("CREDIT") ||
    resolvedBillingMode.includes("REQUEST") ||
    resolvedBillingMode.includes("WARD") ||
    resolvedBillingMode.includes("OT");
  const billTypeHeader = isCreditBill ? "CREDIT BILL" : "CASH BILL";

  const resolvedOutlet = String(
    (data && (data.outlet_code || data.outletCode || data.outlet)) ||
    localStorage.getItem("selected_outlet") ||
    localStorage.getItem("outlet_code") ||
    ""
  ).trim().toUpperCase();
  const isIpBill = resolvedOutlet === "OLET001" || resolvedOutlet === "1" || resolvedOutlet.includes("OLET001") ||
    Boolean(inpatientNo) ||
    Boolean(data && (data.inpatient_number || data.inpatientNumber || data.ip_number || data.ipNumber)) ||
    String(billTypeName || "").toLowerCase().includes("ip") ||
    resolvedBillingMode.includes("REQUEST") ||
    resolvedBillingMode.includes("WARD") ||
    resolvedBillingMode.includes("OT");
  const invoiceHeaderTitle = isIpBill ? "PHARMACY IP GST INVOICE" : "PHARMACY OP GST INVOICE";
  const dlNumber = (resolvedOutlet === "OLET001" || resolvedOutlet === "1" || resolvedOutlet.includes("OLET001"))
    ? "DL NO : TN/SLE/20/01107"
    : "DL NO : TN/SLE/20/01109";

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const extractDate = (raw) => {
    if (!raw || raw === "—" || raw === "N/A") return "—";
    try {
      const s = String(raw).trim();
      const iso = s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s) ? s + "Z" : s;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
      }
    } catch (e) {}
    return String(raw).split(" ")[0];
  };

  const extractTime = (raw) => {
    if (!raw || raw === "—" || raw === "N/A") return "—";
    try {
      const s = String(raw).trim();
      if (/^\d{1,2}:\d{2}(?::\d{2})?(\s*[AaPp][Mm])?$/.test(s)) {
        return s;
      }
      const iso = s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s) ? s + "Z" : s;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
      }
    } catch (e) {}
    const now = new Date();
    return now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  // Calculate Gross Total (actual amount before any discount)
  const computedGross = (medicines || []).reduce((sum, m) => {
    const q = Number(m.quantity || m.qty || 0);
    const p = Number(m.mrp || m.price || m.Selling_Price || m.selling_price || 0);
    return sum + (q * p);
  }, 0);
  const grossTotal = computedGross > 0 ? computedGross : Number(totalAmount || 0);

  // Total CGST and SGST using reverse-calculated pricing on base
  const totalCgstAmt = (medicines || []).reduce((sum, m) => {
    const pricing = calculateMedicinePricing(m);
    return sum + (isNaN(pricing.cgstAmt) ? 0 : pricing.cgstAmt);
  }, 0);

  const totalSgstAmt = (medicines || []).reduce((sum, m) => {
    const pricing = calculateMedicinePricing(m);
    return sum + (isNaN(pricing.sgstAmt) ? 0 : pricing.sgstAmt);
  }, 0);

  const totalTaxAmt = totalCgstAmt + totalSgstAmt;

  // Item discount sum (product discount + GST savings on MRP)
  const computedItemDisc = (medicines || []).reduce((sum, m) => {
    const pricing = calculateMedicinePricing(m);
    return sum + pricing.totalDiscountOnMrp;
  }, 0);

  const itemDiscountSum = Number(totalItemDiscount) || computedItemDisc;
  const baseForOverall = Math.max(0, grossTotal - itemDiscountSum);
  const overallDiscAmt = overallDiscountType === "amount"
    ? parseFloat(overallDiscountValue || 0)
    : baseForOverall * (parseFloat(overallDiscountValue || 0) / 100);

  const totalDiscount = Math.max(
    0,
    itemDiscountSum + overallDiscAmt,
    Number(data?.totalDiscount || 0),
    Number(data?.discount_amount || 0),
    Number(data?.discount || 0)
  );

  // Show percentage label ONLY if explicit overall percentage discount was given
  const isOverallPercent = overallDiscountType === "percent" && parseFloat(overallDiscountValue || 0) > 0;
  const pctLabel = isOverallPercent
    ? ` (${parseFloat(overallDiscountValue)}%)`
    : "";

  const medicinePages = chunkMedicinesForPrint(medicines);
  const totalPages = medicinePages.length;

  const renderMedicineRow = (m) => {
    const pricing = calculateMedicinePricing(m);
    const rate = pricing.mrp;

    return `
      <tr>
        <td style="font-weight: 500; text-align: left; padding: 2.5px 4px; max-width: 185px; word-break: break-word; line-height: 1.25;">${m.name || m.item_name || "—"}</td>
        <td style="text-align: center; padding: 2.5px 3px; white-space: nowrap;">${m.hsn_code || "—"}</td>
        <td style="text-align: center; padding: 2.5px 3px; white-space: nowrap;">${m.batch_number || m.batch || "—"}</td>
        <td style="text-align: center; padding: 2.5px 3px; white-space: nowrap;">${formatExpiryDate(m.expiry_date || m.expiry)}</td>
        <td style="text-align: center; font-weight: 700; padding: 2.5px 3px;">${pricing.qty}</td>
        <td style="text-align: right; padding: 2.5px 4px; white-space: nowrap;">${rate.toFixed(2)}</td>
        <td style="text-align: center; padding: 2.5px 3px;">${pricing.cgstRate}</td>
        <td style="text-align: right; padding: 2.5px 3px; white-space: nowrap;">${pricing.cgstAmt.toFixed(2)}</td>
        <td style="text-align: center; padding: 2.5px 3px;">${pricing.sgstRate}</td>
        <td style="text-align: right; padding: 2.5px 3px; white-space: nowrap;">${pricing.sgstAmt.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700; color: #111; padding: 2.5px 4px; white-space: nowrap;">${pricing.lineTotal.toFixed(2)}</td>
      </tr>
    `;
  };

  const pagesHtml = medicinePages.map((pageMeds, pageIdx) => {
    const isLastPage = pageIdx === totalPages - 1;
    const pageRowsHtml = pageMeds.map(renderMedicineRow).join("");

    return `
    <div class="bill-page">
      <!-- Top Header: Logo on left, Hospital details directly next to it -->
      <div style="display: flex; align-items: center; gap: 14px; padding-bottom: 3px;">
        <img src="${SummaryHead}" alt="Shanmuga Hospital Limited" style="max-height: 48px; object-fit: contain;" onerror="this.style.display='none'" />
        <div style="flex: 1;">
          <div style="font-size: 15px; font-weight: 800; color: #005b8e; letter-spacing: 0.5px; text-transform: uppercase;">
            SHANMUGA HOSPITAL LIMITED
          </div>
          <div style="font-size: 11px; color: #222; margin-top: 1px;">
            51/24.Saradha College Road, Salem - 636007
          </div>
          <div style="font-size: 11px; color: #222;">
            Ph No: 04272706666
          </div>
        </div>
        ${totalPages > 1 ? `
        <div style="text-align: right;">
          <span style="display: inline-block; font-size: 10.5px; font-weight: 700; color: #005b8e; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">
            Page ${pageIdx + 1} of ${totalPages}
          </span>
        </div>` : ""}
      </div>

      <!-- Divider Line -->
      <div class="divider"></div>

      <!-- DL NO, CIN on left | Duplicate & Bill Type in Center | GST NO, Invoice Type on Right -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; font-weight: 600; line-height: 1.35; padding: 2px 0;">
        <div>
          <div>${dlNumber}</div>
          <div>CIN : L85110TZ2020PLC033974</div>
        </div>
        <div style="text-align: center;">
          ${isDuplicate ? `<div style="font-size: 11px; font-style: italic; color: #333; font-weight: 700;">*** Duplicate ***</div>` : ""}
          <div style="font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">${billTypeHeader}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 12.5px; color: #111;">${invoiceHeaderTitle}</div>
          <div style="display: flex; justify-content: flex-end;">
            <span>GST NO : 33ABDCS8326A1ZP</span>
          </div>
        </div>
      </div>

      <!-- Divider Line -->
      <div class="divider"></div>

      <!-- Patient & Bill Details -->
      <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 11.5px; padding: 2px 0 3px 0;">
        <div style="flex: 1.15; display: grid; grid-template-columns: 82px 10px 1fr; row-gap: 2px; align-items: baseline;">
          <span style="color: #222;">Patient</span><span>:</span><span style="font-weight: 700;">${patientName}</span>
          <span style="color: #222;">UHID No</span><span>:</span><span>${uhid}</span>
          ${inpatientNo ? `<span style="color: #222;">IP Number</span><span>:</span><span>${inpatientNo}</span>` : ""}
          <span style="color: #222;">Doctor</span><span>:</span><span>${doctorName}</span>
        </div>

        <div style="flex: 0.85; display: grid; grid-template-columns: 72px 10px 1fr; row-gap: 2px; align-items: baseline;">
          <span style="color: #222;">Bill No</span><span>:</span><span style="font-weight: 700;">${billNo}</span>
          <span style="color: #222;">Date</span><span>:</span><span>${extractDate(billDate)} &nbsp;&nbsp; ${extractTime(billDate)}</span>
          ${resolvedRoom ? `<span style="color: #222;">Room</span><span>:</span><span>${resolvedRoom}</span>` : ""}
          ${resolvedInsurance ? `<span style="color: #222;">Insurance</span><span>:</span><span>${resolvedInsurance}</span>` : ""}
        </div>
      </div>

      <!-- Medicines Table -->
      <table class="bill-table">
        <thead>
          <tr style="border-top: 1px solid #111;">
            <th rowspan="2" style="text-align: left; padding: 3px 4px; width: 180px;">Particulars</th>
            <th rowspan="2" style="width: 70px; text-align: center; padding: 3px;">HSN Code</th>
            <th rowspan="2" style="width: 75px; text-align: center; padding: 3px;">Batch</th>
            <th rowspan="2" style="width: 60px; text-align: center; padding: 3px;">Expiry</th>
            <th rowspan="2" style="width: 35px; text-align: center; padding: 3px;">Qty</th>
            <th rowspan="2" style="width: 55px; text-align: right; padding: 3px 4px;">Rate</th>
            <th colspan="2" style="text-align: center; padding: 2px 3px; border-bottom: 1px solid #888;">CGST</th>
            <th colspan="2" style="text-align: center; padding: 2px 3px; border-bottom: 1px solid #888;">SGST</th>
            <th rowspan="2" style="width: 70px; text-align: right; padding: 3px 4px;">Amount</th>
          </tr>
          <tr style="border-bottom: 1px solid #111;">
            <th style="width: 30px; text-align: center; padding: 2px 3px;">%</th>
            <th style="width: 45px; text-align: right; padding: 2px 3px;">Amt</th>
            <th style="width: 30px; text-align: center; padding: 2px 3px;">%</th>
            <th style="width: 45px; text-align: right; padding: 2px 3px;">Amt</th>
          </tr>
        </thead>
        <tbody style="border-bottom: 1px solid #111;">
          ${pageRowsHtml}
        </tbody>
      </table>

      <!-- Continuation indicator OR Totals & Footer -->
      ${!isLastPage ? `
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #111; padding: 4px 2px; margin-top: auto; font-size: 11px; font-style: italic; color: #444;">
        <span>Continued on Page ${pageIdx + 2}...</span>
        <span style="font-weight: 700; font-style: normal; color: #005b8e;">Page ${pageIdx + 1} of ${totalPages}</span>
      </div>
      ` : `
      <!-- Totals & Payment -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
        <div style="font-size: 11px; color: #111; line-height: 1.35; max-width: 360px; padding-top: 2px;">
          <span style="font-weight: 700;">Rupees in Words:</span>
          <div style="font-style: italic; font-weight: 600; color: #1e293b; text-transform: capitalize; margin-top: 1px;">
            ${numberToWords(netAmount)}
          </div>
        </div>

        <table style="border-collapse: collapse; margin-left: auto; font-size: 11.5px;">
          <tbody>
            <tr>
              <td style="padding: 1.5px 12px 1.5px 0; text-align: right; font-weight: 700; white-space: nowrap;">Total CGST Amt :</td>
              <td style="padding: 1.5px 0; text-align: right; font-weight: 700; min-width: 72px;">${formatCurrency(totalCgstAmt)}</td>
            </tr>
            <tr>
              <td style="padding: 1.5px 12px 1.5px 0; text-align: right; font-weight: 700; white-space: nowrap;">Total SGST Amt :</td>
              <td style="padding: 1.5px 0; text-align: right; font-weight: 700; min-width: 72px;">${formatCurrency(totalSgstAmt)}</td>
            </tr>
            <tr>
              <td style="padding: 1.5px 12px 1.5px 0; text-align: right; font-weight: 700; white-space: nowrap;">Total :</td>
              <td style="padding: 1.5px 0; text-align: right; font-weight: 700; min-width: 72px;">${formatCurrency(grossTotal)}</td>
            </tr>
            <tr>
              <td style="padding: 1.5px 12px 1.5px 0; text-align: right; font-weight: 700; white-space: nowrap;">
                ${totalDiscount > 0 ? `Discount Amt${pctLabel}:` : "Discount :"}
              </td>
              <td style="padding: 1.5px 0; text-align: right; font-weight: 700; min-width: 72px;">${formatCurrency(totalDiscount || 0)}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 12px 2.5px 0; text-align: right; font-weight: 800; font-size: 12.5px; white-space: nowrap;">Net Amount (Payable) :</td>
              <td style="padding: 2.5px 0; text-align: right; font-weight: 800; font-size: 12.5px; min-width: 72px;">${formatCurrency(netAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Divider Line Above Footer -->
      <div class="divider" style="margin-top: 4px; margin-bottom: 3px;"></div>

      <!-- Footer: E & OE on left, Prepared by, Goods once sold in center, Sign on right -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; padding: 2px 0;">
        <div style="font-weight: 700; width: 75px;">E &amp; OE</div>
        <div style="text-align: left; width: 180px;">Prepared by : ${employeeName || "—"}</div>
        <div style="text-align: center; flex: 1; font-style: italic; color: #222;">"Goods once sold will not taken back"</div>
        <div style="text-align: right; width: 140px;">(Sign-pharmacist)</div>
      </div>
      `}
    </div>
    `;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pharmacy Bill - ${billNo}</title>
  <style>
    @page {
      size: A5 landscape;
      margin: 4mm 6mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .bill-page {
      width: 100%;
      max-width: 198mm;
      margin: 0 auto;
      padding: 3mm 4mm;
      background: #ffffff;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
    }
    .bill-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .divider {
      border-top: 1px solid #111;
      margin: 3px 0;
    }
    .bill-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2px 0;
      font-size: 11px;
    }
    .bill-table th {
      color: #111;
      font-weight: 700;
      font-size: 10.5px;
      padding: 3px 4px;
      background: #fff;
    }
    .bill-table td {
      padding: 2.5px 4px;
      vertical-align: middle;
      font-size: 11px;
      border: none;
    }
    .bill-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      html, body {
        width: 210mm;
        margin: 0;
        padding: 0;
        background: #fff;
      }
      .bill-page {
        border: none;
        padding: 0;
        margin: 0 auto;
        width: 100%;
        page-break-after: always;
        break-after: page;
      }
      .bill-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
};

const Pharmacy = ({ estimateToLoad, onEstimateLoaded, billToEdit, onBillEditLoaded, wardRequestToLoad, onWardRequestLoaded, prescriptionToLoad, onPrescriptionLoaded, onEstimateSaved, onBillSaved }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const selectedBranch = localStorage.getItem("selected_branch") || "";
 

  const [medicines, setMedicines] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billTypes, setBillTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [filteredModalMedicines, setFilteredModalMedicines] = useState([]);
  const [doctor_names, setdoctor_names] = useState([]);
  const [lastBilled, setLastBilled] = useState(null);
  const [modalSearch, setModalSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [qtyErrors, setQtyErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(() => {
    const currentOutlet = String(
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      ""
    ).trim().toUpperCase();
    return (currentOutlet === "OLET001" || currentOutlet === "1") ? "credit" : "cash";
  });
  const [pendingBillIntent, setPendingBillIntent] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBillData, setPrintBillData] = useState(null);
  const [showNilStock, setShowNilStock] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const MODAL_PAGE_SIZE = 9;

  // Active highlighted row index in Medicine Selection Window
  const [highlightedModalIndex, setHighlightedModalIndex] = useState(0);

  // Refs for Step sequence navigation:
  // Step 2: Medicine Search Box -> Step 3: Medicine Selection Window -> Step 4: Quantity Selection Area
  const medicineSearchInputRef = useRef(null);
  const modalSearchInputRef = useRef(null);
  const modalRowRefs = useRef([]);
  const qtyInputRefs = useRef({});
  const pendingFocusIndexRef = useRef(null);
  const modalOpenedAtRef = useRef(0);
  // Automatically focus the Medicine Search Box
  const focusMedicineSearch = useCallback(() => {
    const doFocus = () => {
      if (medicineSearchInputRef.current) {
        medicineSearchInputRef.current.focus();
        if (typeof medicineSearchInputRef.current.select === "function") {
          medicineSearchInputRef.current.select();
        }
      }
    };
    doFocus();
    const t1 = setTimeout(doFocus, 30);
    const t2 = setTimeout(doFocus, 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Initial cursor focus in Medicine Search Box on mount
  useEffect(() => {
    focusMedicineSearch();
  }, [focusMedicineSearch]);



  // Modal medicine data calculations (memoized so handlers can access safely)
  const modalSourceList = medicines;
  const nilStockCount = useMemo(() => {
    return (modalSourceList || []).filter((m) => m.is_nil_stock).length;
  }, [modalSourceList]);

  const visibleModalMedicines = useMemo(() => {
    const list = modalSourceList || [];
    const stockFiltered = list.filter((m) => !m.is_nil_stock || showNilStock);

    const q = modalSearch.trim().toLowerCase();
    if (!q) {
      return stockFiltered;
    }

    // Helper to clean common medicine dose-form prefixes (e.g., "TAB DOLO" -> "DOLO")
    const cleanFormPrefix = (str) =>
      str.replace(/^(tab\.|tab|inj\.|inj|syp\.|syp|cap\.|cap|drop\.|drops|oint\.|cream|susp\.|susp|gel)\s+/i, "");

    // 1. First, filter items whose medicine name starts with q (or clean name / any word in name starts with q)
    const startsWithMatches = stockFiltered.filter((m) => {
      const rawName = (m.name || "").trim().toLowerCase();
      if (!rawName) return false;
      if (rawName.startsWith(q)) return true;

      const cleaned = cleanFormPrefix(rawName);
      if (cleaned.startsWith(q)) return true;

      // Also match if any individual word in the medicine name starts with q (e.g. "DOLO 650" or "TAB DOLO")
      const words = rawName.split(/[\s\-_/]+/);
      return words.some((w) => w.startsWith(q));
    });

    // If items starting with q are present, return them with direct name matches first
    if (startsWithMatches.length > 0) {
      return startsWithMatches.sort((a, b) => {
        const nameA = (a.name || "").trim().toLowerCase();
        const nameB = (b.name || "").trim().toLowerCase();

        const aStartsDirect = nameA.startsWith(q);
        const bStartsDirect = nameB.startsWith(q);
        if (aStartsDirect && !bStartsDirect) return -1;
        if (!aStartsDirect && bStartsDirect) return 1;

        const cleanAStarts = cleanFormPrefix(nameA).startsWith(q);
        const cleanBStarts = cleanFormPrefix(nameB).startsWith(q);
        if (cleanAStarts && !cleanBStarts) return -1;
        if (!cleanAStarts && cleanBStarts) return 1;

        return nameA.localeCompare(nameB);
      });
    }

    // Fallback: If no medicine names start with q, check if composition or batch starts with q
    const fallbackMatches = stockFiltered.filter((m) => {
      const comp = (m.chemical_composition || m.composition_name || "").trim().toLowerCase();
      const batch = (m.batch_number || "").trim().toLowerCase();
      return comp.startsWith(q) || comp.split(/[\s\-_/]+/).some((w) => w.startsWith(q)) || batch.startsWith(q);
    });

    return fallbackMatches.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [modalSourceList, showNilStock, modalSearch]);

  const modalTotalPages = Math.max(1, Math.ceil(visibleModalMedicines.length / MODAL_PAGE_SIZE));
  const safeModalPage = Math.min(modalPage, modalTotalPages);
  const displayedModalMedicines = useMemo(() => {
    return visibleModalMedicines.slice(
      (safeModalPage - 1) * MODAL_PAGE_SIZE,
      safeModalPage * MODAL_PAGE_SIZE
    );
  }, [visibleModalMedicines, safeModalPage, MODAL_PAGE_SIZE]);

  // billingType is set internally based on which button is clicked:
  // "Estimate" when Save Estimate is clicked, "Direct" when Save Bill is clicked
  const [billingType, setBillingType] = useState("Direct");

  // loaded estimate tracking (for convert flow)
  const [loadedEstimateNo, setLoadedEstimateNo] = useState(null);

  // UHID Search Modal
  const [showUHIDModal, setShowUHIDModal] = useState(false);
  const [uhidModalTitle, setUhidModalTitle] = useState("Select Patient");
  const [uhidSearchInput, setUhidSearchInput] = useState("");
  const [uhidNamePhone, setUhidNamePhone] = useState("");
  const [uhidSearchResults, setUhidSearchResults] = useState([]);
  const [uhidSearchLoading, setUhidSearchLoading] = useState(false);
  const [admissionStatusMap, setAdmissionStatusMap] = useState({});

  // Live filter results inside modal by Name / Phone
  const displayedUhidResults = useMemo(() => {
    let list = uhidSearchResults || [];
    const np = (uhidNamePhone || "").trim().toLowerCase();
    if (np) {
      const npDigits = np.replace(/\D/g, "");
      list = list.filter(p => {
        const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
        const rawPhone = String(p.mobilePhone || p.mobile || p.phone || p.mobileNumber || "");
        const phoneLower = rawPhone.toLowerCase();
        const phoneDigits = rawPhone.replace(/\D/g, "");
        const matchPhone = phoneLower.includes(np) || (npDigits.length >= 6 && phoneDigits.includes(npDigits));
        return fullName.includes(np) || matchPhone;
      });
    }
    return list;
  }, [uhidSearchResults, uhidNamePhone]);

  // IP Number Search Modal
  const [showIPModal, setShowIPModal] = useState(false);
  const [ipSearchInput, setIpSearchInput] = useState("");
  const [ipSearchResults, setIpSearchResults] = useState([]);
  const [ipSearchLoading, setIpSearchLoading] = useState(false);

  // Overall discount state
  const [overallDiscountType, setOverallDiscountType] = useState("percent");
  const [overallDiscountValue, setOverallDiscountValue] = useState("");

  const [patientType, setPatientType] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("NOT ADMITTED");
  const [admissionRoomNo, setAdmissionRoomNo] = useState("");
  const [admissionDateTime, setAdmissionDateTime] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [isWardRequest, setIsWardRequest] = useState(false);

   const branch_code = localStorage.getItem("selected_branch");
   const outlet_code = localStorage.getItem("outlet_code");
   console.log(outlet_code);

  const [formData, setFormData] = useState({
    uhid: "",
    inpatientNo: "",
    name: "",
    doctor_id: "",
    doctor_name: "",
    roomNo: "",
    insuranceName: "",
    billDate: "",
    billType: "",
    billTypeName: "",
    dob: "",
    cashier_id: localStorage.getItem("employeeId") || "",
  });

  // Auto-focus Medicine Search Box whenever patient details are autofilled/ready
  const prevAutofillKeyRef = useRef("");
  useEffect(() => {
    const key = `${formData.uhid || ""}_${formData.inpatientNo || ""}_${formData.name || ""}_${formData.doctor_id || ""}`;
    if (key && key !== prevAutofillKeyRef.current) {
      prevAutofillKeyRef.current = key;
      if (formData.doctor_id && (formData.uhid || formData.name || formData.inpatientNo)) {
        focusMedicineSearch();
      }
    }
  }, [formData.uhid, formData.inpatientNo, formData.name, formData.doctor_id, focusMedicineSearch]);


  const resolveDoctorIdAndName = useCallback((docInput) => {
    if (!docInput) return { doctor_id: "", doctor_name: "" };
    const strVal = String(docInput).trim();
    if (!strVal) return { doctor_id: "", doctor_name: "" };

    // 1. Direct match on employeeId in doctor_names
    const matchById = doctor_names.find(d => String(d.employeeId) === strVal);
    if (matchById) {
      return { doctor_id: String(matchById.employeeId), doctor_name: matchById.employeeName };
    }

    // 2. Numeric ID check
    if (/^\d+$/.test(strVal)) {
      const matchNum = doctor_names.find(d => Number(d.employeeId) === Number(strVal));
      if (matchNum) {
        return { doctor_id: String(matchNum.employeeId), doctor_name: matchNum.employeeName };
      }
      return { doctor_id: strVal, doctor_name: "" };
    }

    // 3. Match by doctor name (robust token/clean matching)
    const getTokens = (name) => {
      if (!name) return [];
      const DEGREE_REGEX = /\b(dr|doctor|m\.?s\.?|m\.?d\.?|m\.?c\.?h\.?|m\.?b\.?b\.?s\.?|dnb|frcs|mrcp|facs|dm|da|dgo|dmrd|dch|ortho|cardio|neuro|gastro|surg|general|physician|surgeon|consultant|fellow|phd|bams|bhms)\b/gi;
      const withoutParens = String(name).replace(/\(.*?\)/g, " ");
      const withoutDegrees = withoutParens.replace(DEGREE_REGEX, " ");
      const cleaned = withoutDegrees.replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase();
      return cleaned.split(/\s+/).filter(t => t.length > 0);
    };

    const inputTokens = getTokens(strVal);
    const inputSig = inputTokens.filter(t => t.length > 1);

    if (inputTokens.length > 0) {
      let bestMatch = null;
      let bestScore = 0;

      for (const d of doctor_names) {
        const empName = d.employeeName || "";
        const empTokens = getTokens(empName);
        const empSig = empTokens.filter(t => t.length > 1);

        // Exact match of clean tokens
        if (empTokens.join(" ") === inputTokens.join(" ")) {
          return { doctor_id: String(d.employeeId), doctor_name: d.employeeName };
        }

        // Substring check
        const cleanEmpStr = empTokens.join("");
        const cleanInputStr = inputTokens.join("");
        if (cleanEmpStr && cleanInputStr && (cleanEmpStr.includes(cleanInputStr) || cleanInputStr.includes(cleanEmpStr))) {
          return { doctor_id: String(d.employeeId), doctor_name: d.employeeName };
        }

        // Token overlap check
        if (inputSig.length > 0 && empSig.length > 0) {
          const common = inputSig.filter(t => empSig.includes(t));
          if (common.length > 0) {
            const score = common.length / Math.max(inputSig.length, empSig.length);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = d;
            }
          }
        }
      }

      if (bestMatch && bestScore >= 0.5) {
        return { doctor_id: String(bestMatch.employeeId), doctor_name: bestMatch.employeeName };
      }
    }

    return { doctor_id: strVal, doctor_name: strVal };
  }, [doctor_names]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "doctor_id") {
      const match = doctor_names.find((d) => String(d.employeeId) === String(value));
      const docName = match ? match.employeeName : "";
      setFormData((prev) => ({ ...prev, doctor_id: value, doctor_name: docName }));
      if (value) {
        focusMedicineSearch();
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelConfirm = () => {
    resetForm();
    setTodayBillDate();
    setShowCancelModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const activeOutlet =
          localStorage.getItem("selected_outlet") ||
          localStorage.getItem("outlet_code") ||
          "";
        const outletParam = activeOutlet
          ? `?outlet_code=${encodeURIComponent(activeOutlet)}`
          : "";
        const response = await apiRequest(
          `${HmsBaseUrl}get_pharmacy_BillType/${outletParam}`,
          "GET"
        );

        if (response.success && Array.isArray(response.data?.data)) {
          const data = response.data.data;
          setBillTypes(data);

          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billName: data[0].bill_name,
              billTypeName: data[0].bill_name
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
  }, [formData.uhid, isEditMode]);

  // UHID Modal: fetch all patients then filter client-side for partial UHID match
  const handleUHIDSearch = async (directUhidVal) => {
    const uhidVal = (directUhidVal !== undefined ? directUhidVal : uhidSearchInput).trim();
    const nameVal = uhidNamePhone.trim();

    // ✅ Require at least one search param
    if (!uhidVal && !nameVal) {
      toast.warning("Please enter a UHID or name to search.");
      return;
    }

    setUhidSearchLoading(true);
    try {
      let url = `${HmsBaseUrl}patient_details/`;
      const params = [];

      if (uhidVal) params.push(`uhid=${encodeURIComponent(uhidVal)}`);
      if (nameVal)  params.push(`name=${encodeURIComponent(nameVal)}`);
      if (nameVal)  params.push(`mobile=${encodeURIComponent(nameVal)}`);

      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await apiRequest(url, "GET");
      const resBody = res.data || res;
      let results = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
          ? resBody
          : [];

      setUhidSearchResults(results);

      // Always show results in modal — let user pick, even if only 1 result
      if (results.length === 0) {
        toast.info("No patients found for the given UHID.");
      }
    } catch (err) {
      console.error("UHID search failed", err);
      setUhidSearchResults([]);
      toast.error("Search failed. Please try again.");
    } finally {
      setUhidSearchLoading(false);
    }
  };

  // Live trigger admissionstatus API for all patients in modal search results
  useEffect(() => {
    if (!showUHIDModal || !uhidSearchResults || uhidSearchResults.length === 0) return;

    // Pre-populate with values already provided by backend patient_details
    const initialMap = {};
    uhidSearchResults.forEach(p => {
      const u = p.uhid || p.UHID;
      if (u && typeof p.is_admitted === "boolean") {
        initialMap[u] = {
          admitted: p.is_admitted,
          consultingDoctor: p.consulting_doctor || "",
          ipNumber: p.ip_number || ""
        };
      }
    });
    if (Object.keys(initialMap).length > 0) {
      setAdmissionStatusMap(prev => ({ ...prev, ...initialMap }));
    }

    // Call admissionstatus API for each patient displayed in the modal to guarantee live status
    uhidSearchResults.forEach(async (p) => {
      const u = p.uhid || p.UHID;
      if (!u) return;
      try {
        const res = await apiRequest(`${HmsBaseUrl}admissionstatus/?uhid=${encodeURIComponent(u)}`, "GET");
        const body = res?.data || res;
        const isAdm = body?.admitted === true || body?.data?.is_admitted === true;
        const admData = body?.data || {};
        setAdmissionStatusMap(prev => ({
          ...prev,
          [u]: {
            admitted: isAdm,
            consultingDoctor: admData.consultingDoctor || admData.admittingDoctor || p.consulting_doctor || "",
            ipNumber: admData.ipNumber || admData.inpatient_number || p.ip_number || "",
            data: admData
          }
        }));
      } catch (err) {
        // preserve pre-populated state
      }
    });
  }, [showUHIDModal, uhidSearchResults, HmsBaseUrl]);

  // Search patient by UHID (from form UHID field or Enter key)
  const handleSearchByUhid = async (directVal) => {
    const val = (directVal !== undefined ? directVal : formData.uhid || "").trim();
    if (!val) {
      openUHIDModal();
      return;
    }

    setUhidSearchLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(val)}`,
        "GET"
      );
      const resBody = res?.data || res;
      let results = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
          ? resBody
          : [];

      if (results.length === 0) {
        toast.info("No patient found for the given UHID.", { autoClose: 2000, pauseOnHover: false });
      } else if (results.length === 1) {
        handleUHIDSelect(results[0]);
        const pName = formatPatientName(results[0].salutation, results[0].firstName, results[0].lastName);
        toast.success(`Patient details loaded for ${pName || results[0].uhid}`, { autoClose: 2000, pauseOnHover: false });
      } else {
        setUhidModalTitle(`Select Patient (UHID: ${val})`);
        setUhidSearchInput(val);
        setUhidNamePhone("");
        setUhidSearchResults(results);
        setShowUHIDModal(true);
      }
    } catch (err) {
      console.error("UHID search error:", err);
      toast.error("Failed to search patient by UHID.", { autoClose: 2000, pauseOnHover: false });
    } finally {
      setUhidSearchLoading(false);
    }
  };

  // Search patient by Mobile Number (from form Mobile field or Enter key)
  const handleSearchByMobile = async (directVal) => {
    const val = (directVal !== undefined ? directVal : mobilePhone || "").trim();
    if (!val) {
      toast.warning("Please enter a mobile number to search.", { autoClose: 2000, pauseOnHover: false });
      return;
    }

    setUhidSearchLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}patient_details/?mobile=${encodeURIComponent(val)}`,
        "GET"
      );
      const resBody = res?.data || res;
      let results = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
          ? resBody
          : [];

      if (results.length === 0) {
        toast.info("No patient found for the given mobile number.", { autoClose: 2000, pauseOnHover: false });
      } else if (results.length === 1) {
        handleUHIDSelect(results[0]);
        const pName = formatPatientName(results[0].salutation, results[0].firstName, results[0].lastName);
        toast.success(`Patient details loaded for ${pName || results[0].uhid}`, { autoClose: 2000, pauseOnHover: false });
      } else {
        setUhidModalTitle(`Select Patient (Mobile: ${val})`);
        setUhidSearchInput("");
        setUhidNamePhone("");
        setUhidSearchResults(results);
        setShowUHIDModal(true);
        toast.info(`Found ${results.length} patients sharing this mobile number. Please select one.`, { autoClose: 2500, pauseOnHover: false });
      }
    } catch (err) {
      console.error("Mobile search error:", err);
      toast.error("Failed to search patient by mobile number.", { autoClose: 2000, pauseOnHover: false });
    } finally {
      setUhidSearchLoading(false);
    }
  };



  const fetchAdmissionStatus = async (uhid, patientFallback = null) => {
    if (!uhid) return { isAdmitted: false, data: null };
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}admissionstatus/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );

      const body = res?.data || res;
      const admData = body?.data || {};
      const isAdmitted = body?.admitted === true || admData?.is_admitted === true || Boolean(admData?.ipNumber);

      if (isAdmitted) {
        setAdmissionStatus("ADMITTED");

        // ✅ IP Number
        const ipNum = admData?.ipNumber || admData?.inpatient_number || admData?.base_ip_number || patientFallback?.ip_number || "";
        if (ipNum) {
          setFormData(prev => ({
            ...prev,
            inpatientNo: ipNum,
          }));
        }

        // ── Admission Date & Time ──────────────────────────────────────
        if (admData?.admissionDateTime) {
          const dt = new Date(admData.admissionDateTime);
          const formatted = dt.toLocaleString("en-IN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: true
          });
          setAdmissionDateTime(formatted);
        } else {
          setAdmissionDateTime("");
        }

        // ── Active Room No / Bed Details ───────────────────────────────
        const roomDetails     = admData?.room_details;
        const shiftingDetails = admData?.roomShitingDetails;
        const activeFromRoom  = Array.isArray(roomDetails)
          ? (roomDetails.find(r => r.is_roomActive === true) || roomDetails[0]) : null;
        const activeFromShift = Array.isArray(shiftingDetails)
          ? (shiftingDetails.find(r => r.is_roomActive === true) || shiftingDetails[0]) : null;

        let resolvedRoom = "";
        if (activeFromRoom) {
          resolvedRoom = activeFromRoom.bedNo
            ? `${activeFromRoom.roomNo} / Bed ${activeFromRoom.bedNo}`
            : `${activeFromRoom.roomNo}`;
          setAdmissionRoomNo(resolvedRoom);
          setFormData(prev => ({ ...prev, roomNo: resolvedRoom }));
        } else if (activeFromShift) {
          resolvedRoom = activeFromShift.newBedNo
            ? `${activeFromShift.newRoomNo} / Bed ${activeFromShift.newBedNo}`
            : `${activeFromShift.newRoomNo}`;
          setAdmissionRoomNo(resolvedRoom);
          setFormData(prev => ({ ...prev, roomNo: resolvedRoom }));
        } else {
          setAdmissionRoomNo("");
        }

        // ── Insurance Name & Customer Type ─────────────────────────────
        const insName = admData?.insurance_company || admData?.company_code || (String(admData?.customer_type || "").toLowerCase() === "insurance" ? "INSURANCE" : "") || "";
        setInsuranceName(insName || "");
        setFormData(prev => ({
          ...prev,
          insuranceName: insName || "",
          is_insurance: Boolean(insName),
          customer_type: admData?.customer_type || "General",
        }));
        if (admData?.customer_type) {
          setPatientType(admData.customer_type);
        }

        // ── Admitted: ALWAYS populate Doctor Name with Consulting Doctor ──
        const admDoc = admData?.consultingDoctor || admData?.admittingDoctor || patientFallback?.consulting_doctor || patientFallback?.consulting_doctor_name || "";
        if (admDoc) {
          const resDoc = resolveDoctorIdAndName(admDoc);
          setFormData(prev => ({
            ...prev,
            doctor_id: resDoc.doctor_id || admDoc,
            doctor_name: resDoc.doctor_name || admDoc,
          }));
        }

        return { isAdmitted: true, data: admData };
      } else {
        setAdmissionStatus("NOT ADMITTED");
        setAdmissionRoomNo("");
        setAdmissionDateTime("");
        const fallbackIns = patientFallback?.insurance_company || patientFallback?.company_code || (String(patientFallback?.customer_type || "").toLowerCase() === "insurance" ? "INSURANCE" : "") || "";
        setInsuranceName(fallbackIns || "");
        setFormData(prev => ({
          ...prev,
          insuranceName: fallbackIns || "",
          is_insurance: Boolean(fallbackIns),
        }));
        return { isAdmitted: false, data: null };
      }
    } catch (error) {
      console.error("Error fetching admission status:", error);
      return { isAdmitted: false, data: null };
    }
  };

  const handleUHIDSelect = async (p) => {
    const fullName = formatPatientName(p.salutation, p.firstName, p.lastName);

    // ── 1. Resolve doctor for Non-Admitted patient: from current date / latest billing ──────
    let resolvedDoctorId = "";
    if (Array.isArray(p.billing) && p.billing.length > 0) {
      const todayIso = new Date().toISOString().slice(0, 10);
      const todayLocal = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

      // Check for bill on today's date first
      const todayBill = p.billing.find(b => {
        const bDate = String(b.billed_date || "");
        return (bDate.startsWith(todayIso) || bDate.startsWith(todayLocal)) && (b.doctor_id || b.doctor_name || b.raw_doctor_id);
      });

      if (todayBill) {
        resolvedDoctorId = todayBill.doctor_id || todayBill.doctor_name || todayBill.raw_doctor_id;
      } else {
        // Otherwise sort descending by billed_date and pick latest
        const billingsWithDoctor = p.billing.filter(b => b.doctor_id || b.doctor_name || b.raw_doctor_id);
        if (billingsWithDoctor.length > 0) {
          const sorted = [...billingsWithDoctor].sort(
            (a, b) => new Date(b.billed_date) - new Date(a.billed_date)
          );
          resolvedDoctorId = sorted[0].doctor_id || sorted[0].doctor_name || sorted[0].raw_doctor_id;
        }
      }
    }
    if (!resolvedDoctorId) {
      resolvedDoctorId = p.doctor_id || p.doctorName || p.doctor_name || "";
    }

    const { doctor_id: finalDocId, doctor_name: finalDocName } = resolveDoctorIdAndName(resolvedDoctorId);

    setFormData(prev => ({
      ...prev,
      uhid: p.uhid || "",
      name: fullName,
      inpatientNo: p.ip_number || "",
      doctor_id: finalDocId,
      doctor_name: finalDocName,
      roomNo: p.room_no || "",
      dob: p.dob || "",
    }));

    setPatientType(p.customer_type || "");
    setAddress(p.permanent_address || "");
    setPlace(p.area || "");
    setMobilePhone(p.mobilePhone || p.mobile || "");

    // Calculate age from dob
    if (p.dob) {
      const dob = new Date(p.dob);
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();
      if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
      if (months < 0) { years -= 1; months += 12; }
      setPatientAge(`${years}Y ${months}M ${days}D`);
    } else {
      setPatientAge("");
    }

    // ── 2. Live admission check: if admitted, consulting doctor overrides; if not admitted, latest visit doctor stays ──
    await fetchAdmissionStatus(p.uhid, p);

    setShowUHIDModal(false);
    focusMedicineSearch();
  };

  const openUHIDModal = () => {
    const currentUhid = formData.uhid || "";
    setUhidModalTitle("Select Patient");
    setUhidSearchInput(currentUhid);
    setUhidNamePhone("");
    setUhidSearchResults([]);
    setShowUHIDModal(true);

    // Auto-search if UHID already typed in form — pass value directly to avoid stale closure
    if (currentUhid.trim()) {
      setTimeout(() => handleUHIDSearch(currentUhid.trim()), 0);
    }
  };
  // ── IP Number Search ─────────────────────────────────────────────────────
  const handleIPSearch = async (directIPVal) => {
    const ipVal = (directIPVal !== undefined ? directIPVal : ipSearchInput).trim();
    if (!ipVal) {
      toast.warning("Please enter an IP number to search.");
      return;
    }

    setIpSearchLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}searchby_ip/?ip_number=${encodeURIComponent(ipVal)}`,
        "GET"
      );

      const resBody = res?.data || res;
      let allAdmissions = [];
      try {
        const arr = resBody?.data;
        if (Array.isArray(arr)) {
          allAdmissions = arr;
        } else if (Array.isArray(resBody)) {
          allAdmissions = resBody;
        }
      } catch (_) { allAdmissions = []; }

      // ── Client-side filter ─────────────────────────────────────────────────
      const query = ipVal.toLowerCase().trim();
      const isFullIP = query.includes("/");

      const filtered = allAdmissions.filter((adm) => {
        const ip = (adm.ipNumber || "").toLowerCase().trim();
        if (!ip) return false;
        if (isFullIP) {
          return ip === query;
        } else {
          const slashIdx = ip.lastIndexOf("/");
          const suffix = slashIdx !== -1 ? ip.slice(slashIdx + 1) : ip;
          return suffix.includes(query);
        }
      });

      if (filtered.length === 0) {
        setIpSearchResults([]);
        toast.info("No admissions found for the given IP number.");
      } else if (filtered.length === 1) {
        // ✅ Exactly 1 admission found -> Auto-fill immediately!
        handleIPSelect(filtered[0]);
        setShowIPModal(false);
        const pName = formatPatientName(filtered[0].salutation, filtered[0].firstName, filtered[0].lastName);
        toast.success(`Patient details loaded for ${pName || filtered[0].ipNumber}`, { autoClose: 2000, pauseOnHover: false });
      } else {
        // Multiple admissions found: check if only one is currently active (admitted and not discharged)
        const activeOnly = filtered.filter(a => a.is_admitted && !a.is_discharged);
        if (activeOnly.length === 1 && isFullIP) {
          // Exactly 1 active admission matches full IP -> Auto-fill immediately!
          handleIPSelect(activeOnly[0]);
          setShowIPModal(false);
          const pName = formatPatientName(activeOnly[0].salutation, activeOnly[0].firstName, activeOnly[0].lastName);
          toast.success(`Patient details loaded for ${pName || activeOnly[0].ipNumber}`, { autoClose: 2000, pauseOnHover: false });
        } else {
          // Show selection modal with results
          setIpSearchResults(filtered);
          setIpSearchInput(ipVal);
          setShowIPModal(true);
        }
      }
    } catch (err) {
      console.error("IP search failed", err);
      setIpSearchResults([]);
      toast.error("IP search failed. Please try again.");
    } finally {
      setIpSearchLoading(false);
    }
  };

  const handleSearchByIP = (directIPVal) => {
    const val = (directIPVal !== undefined ? directIPVal : formData.inpatientNo || "").trim();
    if (!val) {
      openIPModal();
      return;
    }
    handleIPSearch(val);
  };

  const handleIPSelect = (adm) => {
    const salutation = adm.salutation || "";
    const firstName  = adm.firstName  || "";
    const lastName   = adm.lastName   || "";
    const fullName   = formatPatientName(salutation, firstName, lastName);

    const activeRoom  = Array.isArray(adm.room_details)
      ? adm.room_details.find(r => r.is_roomActive === true) : null;
    const activeShift = Array.isArray(adm.roomShitingDetails)
      ? adm.roomShitingDetails.find(r => r.is_roomActive === true) : null;
    const roomDisplay = activeRoom
      ? `${activeRoom.roomNo} / Bed ${activeRoom.bedNo}`
      : activeShift
        ? `${activeShift.newRoomNo} / Bed ${activeShift.newBedNo}`
        : "";
    const roomNo = roomDisplay || activeRoom?.roomNo || activeShift?.newRoomNo || adm.room_no || "";

    const rawIPDoc = adm.consultingDoctor || adm.admittingDoctor || "";
    const resolvedIPDoc = resolveDoctorIdAndName(rawIPDoc);

    const admIns = adm.insurance_company || adm.company_code || (String(adm.customer_type || adm.customerType || "").toLowerCase() === "insurance" ? "INSURANCE" : "") || "";
    setInsuranceName(admIns || "");

    setFormData(prev => ({
      ...prev,
      inpatientNo: adm.ipNumber || prev.inpatientNo,
      uhid:        adm.uhid     || prev.uhid,
      name:        fullName     || prev.name,
      doctor_id:   resolvedIPDoc.doctor_id || prev.doctor_id,
      doctor_name: resolvedIPDoc.doctor_name || rawIPDoc,
      roomNo,
      dob:         adm.dob      || prev.dob,
      customer_type: adm.customerType || adm.customer_type || prev.customer_type,
      insuranceName: admIns || prev.insuranceName || "",
    }));

    if (adm.mobilePhone || adm.mobile) setMobilePhone(adm.mobilePhone || adm.mobile || "");
    if (adm.permanent_address)         setAddress(adm.permanent_address);
    if (adm.area || adm.city)          setPlace(adm.area || adm.city || "");
    if (adm.customerType || adm.customer_type) setPatientType(adm.customerType || adm.customer_type);
    if (adm.age)                       setPatientAge(`${adm.age}Y`);

    const isAdmitted = Boolean(adm.is_admitted && !adm.is_discharged);
    setAdmissionStatus(isAdmitted ? "ADMITTED" : "NOT ADMITTED");
    if (roomDisplay) setAdmissionRoomNo(roomDisplay);
    if (adm.admissionDateTime) {
      const dt = new Date(adm.admissionDateTime);
      setAdmissionDateTime(dt.toLocaleString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
      }));
    }
    if (adm.uhid) fetchAdmissionStatus(adm.uhid, adm);
    setShowIPModal(false);
    focusMedicineSearch();
  };

  const openIPModal = () => {
    const currentIP = formData.inpatientNo || "";
    setIpSearchInput(currentIP);
    setIpSearchResults([]);
    setShowIPModal(true);
    // If IP is already typed in the field, kick off search automatically
    // so user sees results immediately without pressing Search again
    if (currentIP.trim()) {
      setTimeout(() => handleIPSearch(currentIP.trim()), 0);
    }
  };

  const handleLastUHIDClick = () => {
    if (formData.uhid) {
      const ok = window.confirm("Replace current UHID with last billed UHID?");
      if (!ok) return;
    }
    const resolvedLastDoc = resolveDoctorIdAndName(lastBilled?.doctor_id);
    setFormData(prev => ({
      ...prev,
      uhid: lastBilled.uhid,
      name: lastBilled.patient_name,
      inpatientNo: lastBilled.inpatient_number || "",
      doctor_id: resolvedLastDoc.doctor_id || lastBilled.doctor_id || "",
      doctor_name: resolvedLastDoc.doctor_name || lastBilled.doctor_name || "",
      roomNo: lastBilled.room_no || "",
      billType: lastBilled.bill_type || "",
      billNo: lastBilled.bill_no || "",
      billTypeName: lastBilled.bill_name || ""
    }));
    setAddedMedicines([]);
    focusMedicineSearch();
  };

  useEffect(() => {
    const fetchLastBilledUHID = async () => {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}get_last_billed_uhid/`,
          "GET"
        );

        if (res.success && res.data?.data) {
          setLastBilled(res.data.data);
        }
      } catch (err) {
        console.error("Last billed UHID fetch failed", err);
      }
    };

    fetchLastBilledUHID();
  }, []);

  useEffect(() => {
    console.log("LAST BILLED STATE =>", lastBilled);
  }, [lastBilled]);

  const isMedicineSearchEnabled = Boolean(formData.doctor_id);

  // Focus Medicine Search Box whenever doctor is selected or search becomes enabled
  useEffect(() => {
    if (isMedicineSearchEnabled) {
      focusMedicineSearch();
    }
  }, [isMedicineSearchEnabled, focusMedicineSearch]);

  // Helper to format doctor name for display and print
  const formatDoctorDisplay = useCallback((docId, rawDocName) => {
    let name = (rawDocName || formData.doctor_name || "").trim();
    if (!name && docId) {
      const match = doctor_names.find((d) => String(d.employeeId) === String(docId));
      if (match?.employeeName) name = match.employeeName.trim();
    }
    if (!name && docId) name = String(docId).trim();
    if (!name) return "—";
    if (name.toLowerCase().startsWith("dr")) return name;
    if (/^\d+$/.test(name)) return `Dr. (${name})`;
    return `Dr. ${name}`;
  }, [formData.doctor_name, doctor_names]);

  // Memoized options list for Searchable Doctor dropdown
  const doctorOptions = useMemo(() => {
    const list = (doctor_names || []).map((doc) => ({
      value: String(doc.employeeId),
      label: doc.employeeName,
      sub: doc.employeeId ? `ID: ${doc.employeeId}` : "",
    }));

    if (
      formData.doctor_id &&
      !list.some((d) => String(d.value) === String(formData.doctor_id))
    ) {
      list.unshift({
        value: String(formData.doctor_id),
        label: formatDoctorDisplay(formData.doctor_id, formData.doctor_name),
        sub: `ID: ${formData.doctor_id}`,
      });
    }

    return list;
  }, [doctor_names, formData.doctor_id, formData.doctor_name, formatDoctorDisplay]);

  // Helper to format employee name for signature
  const getSignatureEmployeeName = useCallback((createdByName, createdById) => {
    if (createdByName && createdByName.trim() && createdByName !== "Unknown") {
      return createdByName.trim();
    }
    const loggedName = localStorage.getItem("name");
    const loggedEmpId = localStorage.getItem("employeeId");
    if (createdById && String(createdById) === String(loggedEmpId) && loggedName) {
      return loggedName;
    }
    if (loggedName) return loggedName;
    return createdById || "Authorized Pharmacist";
  }, []);

  // Dynamically resolve doctor name when doctor_id is present but not in doctor_names
  useEffect(() => {
    const docId = formData.doctor_id;
    if (!docId) return;

    // If docId is accidentally a non-digit name string, resolve it to an ID immediately
    if (isNaN(Number(docId)) && !/^\d+$/.test(docId)) {
      const match = resolveDoctorIdAndName(docId);
      if (match.doctor_id && match.doctor_id !== docId) {
        setFormData((prev) => ({ ...prev, doctor_id: match.doctor_id, doctor_name: match.doctor_name }));
        return;
      }
    }

    const existing = doctor_names.find((d) => String(d.employeeId) === String(docId));
    if (existing && existing.employeeName) {
      if (!formData.doctor_name || formData.doctor_name !== existing.employeeName) {
        setFormData((prev) => ({ ...prev, doctor_name: existing.employeeName }));
      }
    } else {
      apiRequest(`${HmsBaseUrl}get_employee_name/?employee_id=${encodeURIComponent(docId)}`, "GET")
        .then((res) => {
          const resolvedName = res?.name || res?.data?.name;
          const resolvedId = res?.doctor_id || res?.employee_id || docId;
          if (res?.success && resolvedName) {
            setdoctor_names((prev) => {
              if (prev.some((d) => String(d.employeeId) === String(resolvedId))) return prev;
              return [...prev, { employeeId: String(resolvedId), employeeName: resolvedName }];
            });
            setFormData((prev) => ({ ...prev, doctor_id: String(resolvedId), doctor_name: resolvedName }));
          }
        })
        .catch((err) => {
          console.warn("Could not resolve employee name for doctor ID", docId, err);
        });
    }
  }, [formData.doctor_id, doctor_names, HmsBaseUrl, formData.doctor_name, resolveDoctorIdAndName]);

  const fetchMedicines = useCallback(async (query = "") => {
    if (!HmsBaseUrl) return [];
    try {
      setStockLoading(true);
      const payload = query ? { search: query } : {};
      const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_stock/`, "POST", payload);
      const medicineArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (response.success) {
        const formattedMedicines = medicineArray.map((item) => {
          const rate = (() => {
            const sp = item.Selling_Price !== undefined ? item.Selling_Price : item.selling_price;
            if (sp !== undefined && sp !== null && sp !== "" && !isNaN(Number(sp)) && Number(sp) > 0) return Number(sp);
            if (item.price !== undefined && item.price !== null && item.price !== "" && !isNaN(Number(item.price)) && Number(item.price) > 0) return Number(item.price);
            if (item.mrp !== undefined && item.mrp !== null && item.mrp !== "" && !isNaN(Number(item.mrp)) && Number(item.mrp) > 0) return Number(item.mrp);
            return Number(sp || item.price || item.mrp || 0);
          })();

          return {
            name: item.item_name || `${item.item_first_name || ""} ${item.item_last_name || ""}`.trim(),
            item_id: item.item_id,
            batch_number: item.batch_number || "N/A",
            grn_number: item.grn_number || "",
            expiry_date: item.expiry_date || "N/A",
            mrp: rate,
            price: rate,
            Selling_Price: rate,
            selling_price: rate,
            hsn_code: item.hsn_code || "—",
            cgst_rate: item.CGST_Percentage || 0,
            cgst_amount: item.CGST_Amt || 0,
            sgst_rate: item.SGST_Percentage || 0,
            sgst_amount: item.SGST_Amt || 0,
            category: item.category || "",
            reorder_level: item.reorder_level || 0,
            total_stock: Number(item.total_stock ?? 0),
            available_stock: item.available_stock != null ? Number(item.available_stock) : 0,
            is_low_stock: item.is_low_stock === true,
            is_nil_stock: item.available_stock != null ? Number(item.available_stock) <= 0 : false,
            high_risk: item.high_risk === true,
            look_alike: item.look_alike === true,
            sound_alike: item.sound_alike === true,
            chemical_composition: item.chemical_composition || "—",
            composition_name: item.composition_name || "—",
            shelf_no: item.shelf_no || "—",
            rack_no: item.rack_no || "—",
            quantity: 1,
            total: rate,
          };
        });
        setMedicines(formattedMedicines);
        return formattedMedicines;
      } else {
        console.error("API failed:", response.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      return [];
    } finally {
      setStockLoading(false);
    }
  }, [HmsBaseUrl]);



  // Unique key per medicine row
  const getMedicineKey = (m) => `${m.item_id}_${m.batch_number}`;

  const handleMedicineInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const openMedicineModal = async (term) => {
    const rawTerm = term !== undefined ? term : searchTerm;

    modalOpenedAtRef.current = Date.now();

    // 1. Immediately open modal with search query (ZERO DELAY)
    setSelectedMedicines([]);
    setModalSearch(rawTerm || "");
    setModalPage(1);
    setShowNilStock(false);
    setShowModal(true);
    setFilteredModalMedicines([]);
    setHighlightedModalIndex(0);

    // 2. Fetch stock for searched item only
    fetchMedicines(rawTerm || "");
  };

  // Debounced search when typing inside the modal
  useEffect(() => {
    if (!showModal) return;
    const q = (modalSearch || "").trim();
    if (q.length >= 2) {
      const timer = setTimeout(() => {
        fetchMedicines(q);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modalSearch, showModal, fetchMedicines]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      if (!isMedicineSearchEnabled) {
        toast.warning("Please select a Doctor first before searching medicines.", { autoClose: 2000 });
        return;
      }
      openMedicineModal(searchTerm);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMedicines([]);
    setModalSearch("");
    focusMedicineSearch();
  };

  const handleModalCloseAndClear = () => {
    setShowModal(false);
    setSelectedMedicines([]);
    setSearchTerm("");
    setModalSearch("");
    setShowNilStock(false);
    setModalPage(1);
    setTimeout(() => {
      medicineSearchInputRef.current?.focus();
    }, 50);
  };

  const handleMedicineSelect = (medicine) => {
    const key = getMedicineKey(medicine);

    const alreadyInBill = addedMedicines.some((m) => getMedicineKey(m) === key);
    if (alreadyInBill) {
      toast.warning(`"${medicine.name}" is already added to the bill!`, { autoClose: 2000 });
      return;
    }

    const isSelected = selectedMedicines.some((m) => getMedicineKey(m) === key);
    if (isSelected) {
      setSelectedMedicines(selectedMedicines.filter((m) => getMedicineKey(m) !== key));
    } else {
      setSelectedMedicines([...selectedMedicines, medicine]);
    }
  };

  // Helper to add a list of medicines to the bill and trigger cursor focus on Quantity field
  const addMedicinesToBill = useCallback((meds) => {
    if (!meds || meds.length === 0) return;

    const medicinesToAdd = meds.filter(
      (medicine) => !addedMedicines.some((m) => getMedicineKey(m) === getMedicineKey(medicine))
    );

    if (medicinesToAdd.length === 0) {
      toast.warning("Selected medicine(s) are already added to the bill!", { autoClose: 2000 });
      return;
    }

    const medicinesWithQuantity = medicinesToAdd.map((medicine) => {
      const rate = parseFloat(medicine.mrp || medicine.price || medicine.Selling_Price || medicine.selling_price || 0);
      const qty = 1;
      const pricing = calculateMedicinePricing({ ...medicine, mrp: rate, price: rate }, qty, 0);
      return {
        ...medicine,
        quantity: qty,
        mrp: rate,
        price: rate,
        Selling_Price: rate,
        selling_price: rate,
        product_value: pricing.productValue,
        taxable_value: pricing.taxableValue,
        cgst_rate: pricing.cgstRate,
        cgst_amount: pricing.cgstAmt,
        sgst_rate: pricing.sgstRate,
        sgst_amount: pricing.sgstAmt,
        discount_type: "percent",
        discount_value: 0,
        discount_percent: 0,
        discount_amount: 0,
        discount: 0,
        total: pricing.lineTotal,
      };
    });

    const targetFocusIndex = addedMedicines.length;
    pendingFocusIndexRef.current = targetFocusIndex;

    setAddedMedicines((prev) => [...prev, ...medicinesWithQuantity]);
    setSearchTerm("");
    setShowModal(false);
    setSelectedMedicines([]);
    setModalSearch("");
  }, [addedMedicines]);

  // Select single medicine and advance to quantity
  const handleSelectMedicineAndClose = useCallback((medicine) => {
    if (!medicine) return;
    if (medicine.is_nil_stock) {
      toast.warning(`"${medicine.name}" has NIL stock and cannot be billed!`, { autoClose: 2000 });
      return;
    }
    const key = getMedicineKey(medicine);
    const alreadyInBill = addedMedicines.some((m) => getMedicineKey(m) === key);
    if (alreadyInBill) {
      toast.warning(`"${medicine.name}" is already added to the bill!`, { autoClose: 2000 });
      return;
    }
    addMedicinesToBill([medicine]);
  }, [addedMedicines, addMedicinesToBill]);

  // Keep refs up-to-date for stable keyboard event handlers
  const displayedModalMedicinesRef = useRef(displayedModalMedicines);
  displayedModalMedicinesRef.current = displayedModalMedicines;

  const highlightedModalIndexRef = useRef(highlightedModalIndex);
  highlightedModalIndexRef.current = highlightedModalIndex;

  const selectedMedicinesRef = useRef(selectedMedicines);
  selectedMedicinesRef.current = selectedMedicines;

  // Add selected medicines (or currently highlighted medicine if none checked)
  const handleAddSelected = useCallback(() => {
    const sel = selectedMedicinesRef.current || [];
    if (sel.length > 0) {
      addMedicinesToBill(sel);
      return;
    }
    const displayed = displayedModalMedicinesRef.current || [];
    if (displayed.length > 0) {
      const idx = highlightedModalIndexRef.current >= 0 && highlightedModalIndexRef.current < displayed.length
        ? highlightedModalIndexRef.current
        : 0;
      const targetMed = displayed[idx] || displayed[0];
      handleSelectMedicineAndClose(targetMed);
    }
  }, [addMedicinesToBill, handleSelectMedicineAndClose]);

  const handleAddSelectedRef = useRef(handleAddSelected);
  handleAddSelectedRef.current = handleAddSelected;

  const handleModalCloseAndClearRef = useRef(handleModalCloseAndClear);
  handleModalCloseAndClearRef.current = handleModalCloseAndClear;

  // Keep highlighted index within bounds when filter or page changes
  useEffect(() => {
    if (displayedModalMedicines.length > 0) {
      const firstAvailable = displayedModalMedicines.findIndex((m) => !m.is_nil_stock);
      setHighlightedModalIndex(firstAvailable >= 0 ? firstAvailable : 0);
    } else {
      setHighlightedModalIndex(0);
    }
  }, [modalSearch, modalPage, showNilStock, displayedModalMedicines.length]);

  // Step 3: Automatically move cursor/focus to medicine selection list when modal opens
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        const targetIdx = Math.min(displayedModalMedicines.length - 1, Math.max(0, highlightedModalIndex));
        const row = modalRowRefs.current[targetIdx];
        if (row) {
          row.focus();
        } else if (modalSearchInputRef.current) {
          modalSearchInputRef.current.focus();
        }
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [showModal, displayedModalMedicines.length]);

  // Keyboard navigation inside Medicine Selection Window (stable listener attached on modal open)
  useEffect(() => {
    if (!showModal) return;

    const handleModalKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleModalCloseAndClearRef.current?.();
        return;
      }

      if (e.key === "ArrowDown") {
        const list = displayedModalMedicinesRef.current || [];
        if (list.length > 0) {
          e.preventDefault();
          setHighlightedModalIndex((prev) => {
            const nextIdx = Math.min(list.length - 1, prev + 1);
            modalRowRefs.current[nextIdx]?.focus();
            modalRowRefs.current[nextIdx]?.scrollIntoView({ block: "nearest" });
            return nextIdx;
          });
        }
      } else if (e.key === "ArrowUp") {
        const list = displayedModalMedicinesRef.current || [];
        if (list.length > 0) {
          e.preventDefault();
          setHighlightedModalIndex((prev) => {
            if (prev <= 0) {
              modalSearchInputRef.current?.focus();
              return 0;
            }
            const prevIdx = prev - 1;
            modalRowRefs.current[prevIdx]?.focus();
            modalRowRefs.current[prevIdx]?.scrollIntoView({ block: "nearest" });
            return prevIdx;
          });
        }
      } else if (e.key === "Enter") {
        // Prevent accidental trigger from the initial Enter press that opened the modal
        if (Date.now() - modalOpenedAtRef.current < 150) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        handleAddSelectedRef.current?.();
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleModalKeyDown);
    };
  }, [showModal]);

  // Step 4: Automatically move cursor to quantity field after medicine is selected
  useEffect(() => {
    if (pendingFocusIndexRef.current !== null) {
      const idx = pendingFocusIndexRef.current;
      pendingFocusIndexRef.current = null;
      const timer = setTimeout(() => {
        const inputEl = qtyInputRefs.current[idx];
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [addedMedicines]);

 const handleQuantityChange = (index, value) => {
  const updatedMedicines = [...addedMedicines];
  const quantity = Math.max(0, parseInt(value, 10) || 0);
  const medicine = updatedMedicines[index];
 
  if (
    medicine.available_stock !== 9999 &&
    medicine.available_stock != null &&
    quantity > medicine.available_stock
  ) {
    toast.warning(
      `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
      { toastId: `stock-excess-${index}`, autoClose: 2000 }
    );
  }
 
  // ✅ Recalculate row total whenever qty changes using reverse GST pricing
  const pricing = calculateMedicinePricing(medicine, quantity);
  updatedMedicines[index] = {
    ...medicine,
    quantity,
    product_value: pricing.productValue,
    taxable_value: pricing.taxableValue,
    cgst_rate: pricing.cgstRate,
    cgst_amount: pricing.cgstAmt,
    sgst_rate: pricing.sgstRate,
    sgst_amount: pricing.sgstAmt,
    discount_amount: pricing.discAmtOnBase,
    total: pricing.lineTotal
  };
  setAddedMedicines(updatedMedicines);
};
  useEffect(() => {
    const fetchdoctor_names = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        if (response.success) {
          setdoctor_names(response.data || []);
        } else {
          throw new Error(response.error || "Failed to fetch doctor_names");
        }
      } catch (error) {
        console.error("Error fetching doctor_names:", error.message);
        toast.error("Error fetching doctor_names", { autoClose: 2000 });
      }
    };
    fetchdoctor_names();
  }, []);

  const resetForm = () => {
    setFormData({
      uhid: "",
      inpatientNo: "",
      name: "",
      doctor_id: "",
      doctor_name: "",
      roomNo: "",
      insuranceName: "",
      billNo: "",
      billDate: "",
      billType: "",
      billTypeName: "",
      dob: "",
      cashier_id: localStorage.getItem("employeeId") || "",
    });
    setAddedMedicines([]);
    setSearchTerm("");
    setSelectedMedicines([]);
    setFilteredModalMedicines([]);
    setOverallDiscountType("percent");
    setOverallDiscountValue("");
    setPatientType("");
    setInsuranceName("");
    setAddress("");
    setPlace("");
    setMobilePhone("");
    setPatientAge("");
    setAdmissionStatus("NOT ADMITTED");
    setAdmissionRoomNo("");
    setAdmissionDateTime("");
    setBillingType("Direct");
    setLoadedEstimateNo(null);
    setRecordId(null);
    setIsEditMode(false);
    setEditReason("");
    setIsWardRequest(false);
    setQtyErrors({});
    focusMedicineSearch();
  };

  // Load estimate passed in from ViewEstimate tab
  useEffect(() => {
    if (!estimateToLoad) return;
    convertEstimate(estimateToLoad);
    if (typeof onEstimateLoaded === "function") onEstimateLoaded();
  }, [estimateToLoad]);

  const handleSave = async (intentStatus) => {
    if (saving) return;

    if (!formData.billType) {
      toast.error("Bill Type is mandatory!", { autoClose: 2000 });
      return;
    }

    if (addedMedicines.length === 0) {
      toast.error("Please add at least one medicine!", { autoClose: 2000 });
      return;
    }

    const errorMap = {};
    addedMedicines.forEach((m, i) => {
      if (!m.quantity || m.quantity <= 0) errorMap[i] = true;
    });

    if (Object.keys(errorMap).length > 0) {
      setQtyErrors(errorMap);
      const first = addedMedicines.find((m) => !m.quantity || m.quantity <= 0);
      toast.error(`Quantity is required for "${first.name}".`, { autoClose: 2000 });
      return;
    }

    setQtyErrors({});

    const stockErrorMap = {};
    const invalidStockItems = [];
    addedMedicines.forEach((m, idx) => {
      if (
        m.available_stock !== 9999 &&
        m.available_stock != null &&
        Number(m.quantity) > Number(m.available_stock)
      ) {
        stockErrorMap[idx] = true;
        invalidStockItems.push(m);
      }
    });

    if (invalidStockItems.length > 0) {
      setQtyErrors(stockErrorMap);
      if (invalidStockItems.length === 1) {
        const item = invalidStockItems[0];
        const itemName = item.name || item.item_name || "Medicine";
        const avail = item.available_stock != null ? item.available_stock : 0;
        const req = item.quantity;
        toast.error(
          `Quantity exceeds available stock for "${itemName}"! (Available: ${avail}, Requested: ${req})`,
          { autoClose: 3500 }
        );
      } else {
        const itemDetails = invalidStockItems
          .map(
            (m) =>
              `"${m.name || m.item_name}" (Available: ${
                m.available_stock != null ? m.available_stock : 0
              }, Requested: ${m.quantity})`
          )
          .join(", ");
        toast.error(`Quantity exceeds available stock for: ${itemDetails}`, {
          autoClose: 4000,
        });
      }
      return;
    }

    // For Direct bill → show payment mode modal first
    if (intentStatus !== "Estimate") {
      setPendingBillIntent(intentStatus);
      const currentOutlet = String(
        localStorage.getItem("selected_outlet") ||
        localStorage.getItem("outlet_code") ||
        ""
      ).trim().toUpperCase();

      // Outlet-based default selection:
      // OLET001 / 1 (IP Pharmacy) defaults to "credit" (Pay Later)
      // OLET002 / 2 (OP Pharmacy) or standard retail defaults to "cash" (Pay Now) by default
      if (currentOutlet === "OLET001" || currentOutlet === "1") {
        setSelectedPaymentMode("credit");
      } else {
        setSelectedPaymentMode("cash");
      }
      setShowPaymentModal(true);
      return;
    }

    // For Estimate → save directly (no payment mode needed)
    await executeSave(intentStatus, null);
  };

  const executeSave = async (intentStatus, paymentMode) => {
    setSaving(true);
    const isCredit = String(paymentMode || "").toLowerCase() === "credit";
    const resolvedPaymentMode = intentStatus === "Estimate" ? null : (isCredit ? "Credit" : "Cash");

    try {
      // ── Ward Request → Convert to Bill ────────────────────────────────────
      // When the bill originates from MedicineChart ("Convert to Bill"), the
      // record already exists in the DB with its own Bill_id.
      // We skip save_oppharmacy_bill entirely and call finalize_bill directly.
      // finalize_bill handles: bill_no generation, stock update (blocked_quantity),
      // and setting billing_status → "Billed".
      if (isWardRequest && intentStatus !== "Estimate") {
        const hasBillId =
          recordId !== undefined &&
          recordId !== null &&
          recordId !== "" &&
          recordId !== 0;

        if (!hasBillId) {
          toast.error("Cannot finalize: Bill_id is missing for this ward request.", {
            autoClose: 3000,
          });
          setSaving(false);
          return;
        }

        // ── Build updated medicine list from current addedMedicines state ─────
        // The user may have changed quantities on the Pharmacy page before clicking
        // "Bill", so we always use the live frontend state rather than DB values.
        const finalMedicines = addedMedicines.map((m) => {
          const pricing = calculateMedicinePricing(m);
          return {
            item_id:          Number(m.item_id),
            item_name:        m.name || m.item_name || "",
            batch_number:     String(m.batch_number || ""),
            qty:              pricing.qty,
            quantity:         pricing.qty,
            requested_qty:    Number(m.requested_qty || m.qty || pricing.qty),
            dispatched_qty:   Number(m.dispatched_qty || 0),
            pending_qty:      Number(m.pending_qty ?? pricing.qty),
            price:            pricing.mrp,
            mrp:              pricing.mrp,
            Selling_Price:    pricing.mrp,
            selling_price:    pricing.mrp,
            product_value:    pricing.productValue,
            taxable_value:    pricing.taxableValue,
            calculated_price: pricing.gross,
            edit_history:     m.edit_history || [],
            CGST_Percentage:  pricing.cgstRate,
            SGST_Percentage:  pricing.sgstRate,
            cgst_rate:        pricing.cgstRate,
            sgst_rate:        pricing.sgstRate,
            CGST_Amt:         pricing.cgstAmt,
            SGST_Amt:         pricing.sgstAmt,
            cgst_amount:      pricing.cgstAmt,
            sgst_amount:      pricing.sgstAmt,
            discount:         pricing.discVal,
            discount_type:    pricing.discType,
            discount_value:   pricing.discVal,
            discount_percent: pricing.discType === "percent" ? pricing.discVal : 0,
            discount_amount:  pricing.discAmtOnBase,
            total:            pricing.lineTotal,
            dosage:           m.dosage       || "",
            noOfDays:         m.noOfDays     || m.no_of_days || "",
            dose:             m.dose         || "",
            doseunit:         m.doseunit     || m.doseUnit   || "",
            instruction:      m.instruction  || "",
            route:            m.route        || "",
            ...(m.is_consumable_items ? { is_consumable_items: true } : {}),
          };
        });

        // ── Recalculate totals from live frontend state ───────────────────────
        const updatedTotalAmount = parseFloat(
          finalMedicines.reduce((s, m) => s + m.calculated_price, 0).toFixed(2)
        );

        const updatedItemDiscount = addedMedicines.reduce((sum, m) => {
          const pricing = calculateMedicinePricing(m);
          return sum + pricing.totalDiscountOnMrp;
        }, 0);

        const baseForOverall = Math.max(0, updatedTotalAmount - updatedItemDiscount);
        const overallDiscAmtFinal =
          overallDiscountType === "amount"
            ? parseFloat(overallDiscountValue || 0)
            : baseForOverall * (parseFloat(overallDiscountValue || 0) / 100);

        const updatedTotalDiscount = updatedItemDiscount + overallDiscAmtFinal;
        const updatedNetAmount = Math.round(
          Math.max(0, updatedTotalAmount - updatedTotalDiscount)
        );

        console.log(
          "🏥 Ward request → calling finalize_bill | Bill_id:", recordId,
          "| updatedTotalAmount:", updatedTotalAmount,
          "| updatedNetAmount:", updatedNetAmount
        );

        const isInsuranceFinal =
          String(patientType || "").toLowerCase() === "insurance" ||
          Boolean(formData.is_insurance) ||
          String(formData.customer_type || "").toLowerCase() === "insurance";

        const finalizeRes = await apiRequest(`${HmsBaseUrl}finalize_bill/`, "POST", {
          Bill_id:              parseInt(recordId),

          // ── Send updated medicine list & amounts so backend uses them ──
          medicine_particulars:      finalMedicines,
          total_amount:              updatedTotalAmount,
          net_amount:                updatedNetAmount,
          overall_discount_type:     overallDiscountValue && parseFloat(overallDiscountValue) > 0
                                       ? overallDiscountType : null,
          overall_discount_value:    parseFloat(overallDiscountValue || 0),
          overall_discount_amount:   parseFloat(overallDiscAmtFinal.toFixed(2)),
          payment_mode:              isInsuranceFinal ? "Credit" : resolvedPaymentMode,
          customer_type:             isInsuranceFinal ? "Insurance" : (patientType || formData.customer_type || "General"),
          is_insurance:              Boolean(isInsuranceFinal),
          inpatient_number:          formData.inpatientNo || formData.inpatient_number || "",
          room_no:                   formData.roomNo || admissionRoomNo || "",
          insurance_company:         insuranceName || formData.insuranceName || "",
        });

        console.log("finalize_bill RESPONSE:", finalizeRes);

        if (finalizeRes.success) {
          const savedBillNo = finalizeRes.data?.bill_no || finalizeRes.bill_no || "";
          const backendMsg  = finalizeRes.data?.message || finalizeRes.message;
          toast.success(backendMsg || `Bill finalized successfully! #${savedBillNo}`, {
            autoClose: 2000,
          });
          try {
            localStorage.setItem("hms_last_billing_update", Date.now().toString());
            localStorage.setItem("hms_last_medichart_update", Date.now().toString());
            if (typeof BroadcastChannel !== "undefined") {
              new BroadcastChannel("hms_billing_channel").postMessage({
                type: "BILL_SAVED",
                billNo: savedBillNo,
                billId: recordId,
                isWardRequest: true,
              });
            }
          } catch (e) {}
          if (typeof onBillSaved === "function") {
            onBillSaved({ billNo: savedBillNo, billId: recordId, isWardRequest: true });
          }

          const rawDocName = finalizeRes.data?.doctor_name || finalizeRes.doctor_name || formData.doctor_name;
          const doctorName = formatDoctorDisplay(formData.doctor_id, rawDocName);
          const rawEmpName = finalizeRes.data?.billed_name || finalizeRes.data?.employee_name || finalizeRes.data?.created_by_name || finalizeRes.created_by_name || finalizeRes.employee_name;
          const employeeName = getSignatureEmployeeName(rawEmpName, finalizeRes.data?.billed_id || formData.cashier_id);

          const savedBillDate =
            finalizeRes.data?.bill_date ||
            finalizeRes.bill_date ||
            finalizeRes.data?.created_date ||
            finalizeRes.created_date ||
            new Date().toISOString();

          setPrintBillData({
            billNo:               savedBillNo,
            billDate:             savedBillDate,
            patientName:          formData.name,
            uhid:                 formData.uhid,
            doctorName,
            employeeName,
            patientAge:           patientAge || "",
            cashierId:            formData.cashier_id || "",
            roomNo:               formData.roomNo || admissionRoomNo || "",
            inpatientNumber:      formData.inpatientNo || formData.inpatient_number || formData.inpatientNumber || "",
            insuranceName:        insuranceName || formData.insuranceName || (String(patientType || "").toLowerCase() === "insurance" ? "INSURANCE" : patientType) || "",
            billTypeName:         formData.billTypeName || "OP Pharmacy",
            medicines:            [...addedMedicines],
            totalAmount:          updatedTotalAmount,
            totalItemDiscount:    updatedItemDiscount,
            discount_amount:      updatedTotalDiscount,
            overallDiscountType,
            overallDiscountValue,
            overallDiscountAmount: overallDiscAmtFinal,
            totalDiscount:        updatedTotalDiscount,
            round_off:            parseFloat((updatedNetAmount - (updatedTotalAmount - updatedTotalDiscount)).toFixed(2)),
            netAmount:            updatedNetAmount,
            payment_mode:         isInsuranceFinal ? "Credit" : resolvedPaymentMode,
            paymentMode:          isInsuranceFinal ? "Credit" : resolvedPaymentMode,
          });
          setShowPrintModal(true);

          // Deduct billed stock in memory immediately for 0ms instant UI update
          const billedItems = [...addedMedicines];
          setMedicines((prevMeds) => {
            if (!Array.isArray(prevMeds) || prevMeds.length === 0) return prevMeds;
            const deductionMap = {};
            billedItems.forEach((it) => {
              const key = `${it.item_id}_${it.batch_number}`;
              deductionMap[key] = (deductionMap[key] || 0) + Number(it.quantity || it.qty || 0);
            });
            return prevMeds.map((med) => {
              const key = `${med.item_id}_${med.batch_number}`;
              if (deductionMap[key]) {
                const newAvail = Math.max(0, (Number(med.available_stock) || 0) - deductionMap[key]);
                return {
                  ...med,
                  available_stock: newAvail,
                  is_nil_stock: newAvail <= 0,
                };
              }
              return med;
            });
          });
          setFilteredModalMedicines([]);
          fetchMedicines();

          resetForm();
          setTodayBillDate();
        } else {
          // ── Surface ip_advance exceed error prominently ───────────────────
          const backendErr =
            finalizeRes.data?.error ||
            finalizeRes.error ||
            "Finalize bill failed.";

          if (
            backendErr === "Billing Exceeds From IP Advance" ||
            (finalizeRes.data?.ip_advance !== undefined)
          ) {
            const ipAdv  = parseFloat(finalizeRes.data?.ip_advance)       || 0;
            const cumul  = parseFloat(finalizeRes.data?.cumulative_total) || 0;
            const exist  = parseFloat(finalizeRes.data?.existing_billed)  || 0;

            toast.error(
              `⚠️ Billing Exceeds From IP Advance\n` +
              `IP Advance: ₹${ipAdv.toFixed(2)} | ` +
              `Already Billed: ₹${exist.toFixed(2)} | ` +
              `Current Bill: ₹${(cumul - exist).toFixed(2)} | ` +
              `Total: ₹${cumul.toFixed(2)}`,
              { autoClose: 6000 }
            );
          } else {
            toast.error(backendErr, { autoClose: 3000 });
          }
        }

        return; // ← done; skip the normal save_oppharmacy_bill path below
      }

      // ── Normal save path (Direct bill / Estimate / Edit bill) ─────────────
      const finalItems = addedMedicines.map((m) => {
        const pricing = calculateMedicinePricing(m);

        return {
          item_id: Number(m.item_id),
          batch_number: String(m.batch_number || ""),
          qty: pricing.qty,
          price: pricing.mrp,
          mrp: pricing.mrp,
          calculated_price: pricing.gross,
          item_name: m.name || m.item_name || "",
          dosage: m.dosage || "",
          noOfDays: m.noOfDays || m.no_of_days || "",
          dose: m.dose || "",
          doseunit: m.doseunit || m.doseUnit || "",
          instruction: m.instruction || "",
          route: m.route || "",
          product_value: pricing.productValue,
          taxable_value: pricing.taxableValue,
          cgst_rate: pricing.cgstRate,
          sgst_rate: pricing.sgstRate,
          CGST_Percentage: pricing.cgstRate,
          SGST_Percentage: pricing.sgstRate,
          cgst_amount: pricing.cgstAmt,
          sgst_amount: pricing.sgstAmt,
          CGST_Amt: pricing.cgstAmt,
          SGST_Amt: pricing.sgstAmt,
          discount_type: pricing.discType,
          discount_value: pricing.discVal,
          discount_percent: pricing.discType === "percent" ? pricing.discVal : 0,
          discount_amount: pricing.discAmtOnBase,
          discount: pricing.discVal,
          total: pricing.lineTotal,
        };
      });

      const baseForOverallFinal = Math.max(0, grossTotalAmount - totalItemDiscount);
      const overallDiscAmtFinal =
        overallDiscountType === "amount"
          ? parseFloat(overallDiscountValue || 0)
          : baseForOverallFinal * (parseFloat(overallDiscountValue || 0) / 100);

      const totalDiscAmtFinal = totalItemDiscount + overallDiscAmtFinal;
      const rawNetAmount = Math.max(0, grossTotalAmount - totalDiscAmtFinal);
      const roundedNet = Math.round(rawNetAmount);
      const roundOffValue = parseFloat((roundedNet - rawNetAmount).toFixed(2));

      let status = "";
      let billing_mode = "";

      if (intentStatus === "Estimate") {
        status = "Estimate";
        billing_mode = "ESTIMATE";
      } else {
        status = "Billed";
        if (loadedEstimateNo) {
          billing_mode = "ESTIMATE";
        } else {
          billing_mode = isCredit ? "IP CREDIT" : "DIRECT";
        }
      }

      // ✅ Calculate age from dob (stored in formData when patient was selected)
      let ageYears = 0;
      if (formData.dob) {
        const dob = new Date(formData.dob);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        const months = today.getMonth() - dob.getMonth();
        const days = today.getDate() - dob.getDate();
        if (months < 0 || (months === 0 && days < 0)) years -= 1;
        ageYears = years;
      } else {
        ageYears = patientAge ? parseInt(patientAge, 10) || 0 : 0;
      }

      const activeOutletCode = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

      const basePayload = {
        outlet_code: activeOutletCode || undefined,
        bill_date: formData.billDate,
        bill_type: formData.billType,
        uhid: formData.uhid,
        inpatient_number: formData.inpatientNo || formData.inpatient_number || "",
        age: ageYears,   
        dob: formData.dob || "",    
        doctor_id: formData.doctor_id,
        room_no: formData.roomNo || admissionRoomNo || "",
        insurance_company: insuranceName || formData.insuranceName || "",
        customer_type: patientType || formData.customer_type || "",
        is_insurance: Boolean(formData.is_insurance || String(patientType || "").toLowerCase() === "insurance"),
        medicine_particulars: finalItems,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        total_item_discount: parseFloat(totalItemDiscount.toFixed(2)),
        discount_amount: parseFloat(totalDiscAmtFinal.toFixed(2)),
        overall_discount_type: overallDiscountValue && parseFloat(overallDiscountValue) > 0
          ? overallDiscountType
          : null,
        overall_discount_value: parseFloat(overallDiscountValue || 0),
        overall_discount_amount: parseFloat(overallDiscAmtFinal.toFixed(2)),
        actual_net_amount: parseFloat(rawNetAmount.toFixed(2)),
        round_off: roundOffValue,
        net_amount: roundedNet,
        status,
        billing_mode,
        payment_mode: resolvedPaymentMode,
        // ✅ Send patientname ONLY when no uhid (walk-in / unregistered patient)
        ...(!formData.uhid && { patientname: formData.name }),
      };

      let response;

      const hasBillId = recordId !== undefined && recordId !== null && recordId !== "" && recordId !== 0;

      console.log(
        "💾 executeSave | intent:", intentStatus,
        "| paymentMode:", paymentMode,
        "| recordId:", recordId,
        "| hasBillId:", hasBillId,
        "| loadedEstimateNo:", loadedEstimateNo
      );

      if (hasBillId) {
        const patchPayload = {
          ...basePayload,
          Bill_id: parseInt(recordId),
          edit_reason: editReason.trim() || undefined,
        };
        response = await apiRequest(`${HmsBaseUrl}save_pharmacy_bill/`, "PATCH", patchPayload);
      } else {
        response = await apiRequest(`${HmsBaseUrl}save_pharmacy_bill/`, "POST", basePayload);
      }

      console.log("API RESPONSE:", response);

      if (!hasBillId) {
        const newBillId = response?.data?.Bill_id ?? response?.Bill_id ?? null;
        if (newBillId) {
          setRecordId(newBillId);
        }
      }

      if (response.success) {
        // Deduct billed stock in memory immediately for 0ms instant UI update
        const billedItems = [...addedMedicines];
        setMedicines((prevMeds) => {
          if (!Array.isArray(prevMeds) || prevMeds.length === 0) return prevMeds;
          const deductionMap = {};
          billedItems.forEach((it) => {
            const key = `${it.item_id}_${it.batch_number}`;
            deductionMap[key] = (deductionMap[key] || 0) + Number(it.quantity || it.qty || 0);
          });
          return prevMeds.map((med) => {
            const key = `${med.item_id}_${med.batch_number}`;
            if (deductionMap[key]) {
              const newAvail = Math.max(0, (Number(med.available_stock) || 0) - deductionMap[key]);
              return {
                ...med,
                available_stock: newAvail,
                is_nil_stock: newAvail <= 0,
              };
            }
            return med;
          });
        });
        setFilteredModalMedicines([]);
        fetchMedicines();

        const backendMsg = response.data?.message || response.message;
        if (status === "Estimate") {
          const estNo = response.data?.estimate_no || response.estimate_no || "";
          toast.success(backendMsg || `Estimate saved! #${estNo}`, { autoClose: 2000 });
          try {
            localStorage.setItem("hms_last_billing_update", Date.now().toString());
            localStorage.setItem("hms_last_medichart_update", Date.now().toString());
            if (typeof BroadcastChannel !== "undefined") {
              new BroadcastChannel("hms_billing_channel").postMessage({
                type: "ESTIMATE_SAVED",
                estimateNo: estNo,
                billId: recordId,
              });
            }
          } catch (e) {}
          if (typeof onEstimateSaved === "function") onEstimateSaved();
          resetForm();
          setTodayBillDate();
        } else {
          toast.success(backendMsg || `Bill saved successfully! #${response.data?.bill_no || ""}`, { autoClose: 2000 });
          const savedBillNo = response.data?.bill_no || response.bill_no || "";
          try {
            localStorage.setItem("hms_last_billing_update", Date.now().toString());
            localStorage.setItem("hms_last_medichart_update", Date.now().toString());
            if (typeof BroadcastChannel !== "undefined") {
              new BroadcastChannel("hms_billing_channel").postMessage({
                type: "BILL_SAVED",
                billNo: savedBillNo,
                billId: recordId,
                isWardRequest: Boolean(isWardRequest),
              });
            }
          } catch (e) {}
          if (typeof onBillSaved === "function") {
            onBillSaved({ billNo: savedBillNo, billId: recordId, isWardRequest: Boolean(isWardRequest) });
          }
          const rawDocName = response.data?.doctor_name || response.doctor_name || formData.doctor_name;
          const doctorName = formatDoctorDisplay(formData.doctor_id, rawDocName);
          const rawEmpName = response.data?.billed_name || response.data?.employee_name || response.data?.created_by_name || response.created_by_name || response.employee_name;
          const employeeName = getSignatureEmployeeName(rawEmpName, response.data?.billed_id || formData.cashier_id);

          const savedBillDate =
            response.data?.bill_date ||
            response.bill_date ||
            response.data?.created_date ||
            response.created_date ||
            new Date().toISOString();

          setPrintBillData({
            billNo: savedBillNo,
            billDate: savedBillDate,
            patientName: formData.name,
            uhid: formData.uhid,
            doctorName,
            employeeName,
            patientAge: patientAge || "",
            cashierId: formData.cashier_id || "",
            roomNo: formData.roomNo || admissionRoomNo || "",
            inpatientNumber: formData.inpatientNo || formData.inpatient_number || formData.inpatientNumber || "",
            insuranceName: insuranceName || formData.insuranceName || (String(patientType || "").toLowerCase() === "insurance" ? "INSURANCE" : patientType) || "",
            billTypeName: formData.billTypeName || "OP Pharmacy",
            medicines: [...addedMedicines],
            totalAmount: grossTotalAmount,
            totalItemDiscount,
            discount_amount: totalDiscAmtFinal,
            overallDiscountType,
            overallDiscountValue,
            overallDiscountAmount: overallDiscAmtFinal,
            totalDiscount: totalDiscAmtFinal,
            actual_net_amount: rawNetAmount,
            round_off: roundOffValue,
            netAmount: roundedNet,
            payment_mode: resolvedPaymentMode,
            paymentMode: resolvedPaymentMode,
          });
          setShowPrintModal(true);
          resetForm();
          setTodayBillDate();
        }
      } else {
        const backendErr = response.data?.error || response.error;
        toast.error(backendErr || "Save failed.", { autoClose: 2000 });
      }

    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save.", { autoClose: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const setTodayBillDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, billDate: today }));
  };

  useEffect(() => {
    setTodayBillDate();
  }, []);

  const parseOrderedDictMeds = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    try { return JSON.parse(raw); } catch { /* fall through */ }

    const results = [];
    const dictPattern = /OrderedDict\(\[([^\]]*(?:\[[^\]]*\][^\]]*)*)\]\)/g;
    let dictMatch;
    while ((dictMatch = dictPattern.exec(raw)) !== null) {
      const inner = dictMatch[1];
      const obj = {};
      const pairPattern = /\('([^']+)',\s*([^)]+?)\s*\)(?=\s*(?:,|\]))/g;
      let pairMatch;
      while ((pairMatch = pairPattern.exec(inner)) !== null) {
        const key = pairMatch[1];
        let val = pairMatch[2].trim();
        if      (val === "None")            val = null;
        else if (val === "True")            val = true;
        else if (val === "False")           val = false;
        else if (/^\[/.test(val))           val = [];
        else if (/^'(.*)'$/.test(val))      val = val.slice(1, -1);
        else if (!isNaN(Number(val)))       val = Number(val);
        obj[key] = val;
      }
      if (Object.keys(obj).length > 0) results.push(obj);
    }

    if (results.length > 0) return results;

    try {
      const jsonLike = raw
        .replace(/OrderedDict\(\[/g, "[")
        .replace(/\]\)/g, "]")
        .replace(/'/g, '"')
        .replace(/True/g, "true")
        .replace(/False/g, "false")
        .replace(/None/g, "null");
      return JSON.parse(jsonLike);
    } catch { /* give up */ }

    console.warn("parseOrderedDictMeds: failed to parse", raw);
    return [];
  };

  const convertEstimate = async (estimate) => {
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.", { autoClose: 2000 });
      return;
    }

    const resolvedEstimateBillTypeName =
      estimate.bill_type_name ||
      estimate.bill_name ||
      billTypes.find(bt => String(bt.bill_type) === String(estimate.bill_type))?.bill_name ||
      "";

    // ── Step 1: Set the bill/form header fields first ─────────────────────────
    setFormData((prev) => ({
      ...prev,
      name:        estimate.patient_name      || "",
      uhid:        estimate.uhid              || "",
      inpatientNo: estimate.inpatient_number  || "",
      doctor_id:   estimate.doctor_id         || "",
      doctor_name: estimate.doctor_name       || "",
      roomNo:      estimate.room_no           || "",
      billType:    estimate.bill_type         || "",
      billTypeName: resolvedEstimateBillTypeName,
    }));

    // ── Step 2: Fetch full patient record to populate Additional Details ──────
    // This mirrors what handleUHIDSelect does after picking a patient from the
    // UHID modal — we need address, mobile, age, customer_type, etc.
    if (estimate.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(estimate.uhid)}`,
          "GET"
        );

        // API returns { success, data: [...] }; apiRequest may wrap it one level deeper
        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // ✅ Save dob into formData for age calculation at save time
          setFormData((prev) => ({
            ...prev,
            dob: p.dob || "",
          }));

          // ✅ Age calculation
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();

            let years = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth() - dob.getMonth();
            let days = today.getDate() - dob.getDate();

            if (days < 0) {
              months -= 1;
              days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            }

            if (months < 0) {
              years -= 1;
              months += 12;
            }

            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }
        }

      } catch (err) {
        console.warn("convertEstimate: could not fetch patient details —", err);
      }

      // ✅ Admission status
      fetchAdmissionStatus(estimate.uhid);
    }

    // ── Step 4: Resolve medicine rows ─────────────────────────────────────────
    const rawMeds = parseOrderedDictMeds(estimate.medicine_particulars);

    // ── Fix: in convertWardRequest, replace the loadedMedicines map ──────────
const loadedMedicines = rawMeds.map((item) => {
  const stockMatch =
    medicines.find(
      (s) =>
        (String(s.item_id) === String(item.item_id) ||
         (s.stock_id != null && String(s.stock_id) === String(item.item_id)) ||
         (s.id != null && String(s.id) === String(item.item_id))) &&
        String(s.batch_number) === String(item.batch_number)
    ) ||
    medicines.find(
      (s) =>
        String(s.item_id) === String(item.item_id) ||
        (s.stock_id != null && String(s.stock_id) === String(item.item_id)) ||
        (s.id != null && String(s.id) === String(item.item_id))
    );

  const resolvedItemName =
    (item.item_name && !String(item.item_name).startsWith("Item #") ? item.item_name : null) ||
    (item.medicine_name && !String(item.medicine_name).startsWith("Item #") ? item.medicine_name : null) ||
    (item.name && !String(item.name).startsWith("Item #") ? item.name : null) ||
    stockMatch?.name ||
    stockMatch?.item_name ||
    item.item_name ||
    item.medicine_name ||
    item.name ||
    (item.item_id ? `Item #${item.item_id}` : "");

  // MRP: prefer item directly (API already enriched it), fallback to price or stock
  const mrp = parseFloat(item.mrp ?? item.price ?? stockMatch?.mrp ?? stockMatch?.price ?? 0);
  // Price for total calculation: use price or mrp
  const price = parseFloat(item.price ?? stockMatch?.price ?? mrp);
  const qty   = Number(item.qty ?? item.quantity ?? 0);

  // Per-unit GST amounts from API; scale by qty for display
  const cgstRatePerUnit   = parseFloat(item.CGST_Percentage ?? stockMatch?.cgst_rate   ?? 0);
  const sgstRatePerUnit   = parseFloat(item.SGST_Percentage ?? stockMatch?.sgst_rate   ?? 0);
  const cgstAmtPerUnit    = parseFloat(item.CGST_Amt        ?? stockMatch?.cgst_amount ?? 0);
  const sgstAmtPerUnit    = parseFloat(item.SGST_Amt        ?? stockMatch?.sgst_amount ?? 0);

  return {
    item_id:         item.item_id,
    name:            resolvedItemName,
    batch_number:    item.batch_number || stockMatch?.batch_number || "",
    quantity:        qty,
    price:           price,
    mrp:             mrp,
    hsn_code:        stockMatch?.hsn_code  || "—",
    cgst_rate:       cgstRatePerUnit,
    cgst_amount:     parseFloat((cgstAmtPerUnit * qty).toFixed(2)),   // ← scaled by qty
    sgst_rate:       sgstRatePerUnit,
    sgst_amount:     parseFloat((sgstAmtPerUnit * qty).toFixed(2)),   // ← scaled by qty
    expiry_date:     stockMatch?.expiry_date || "—",
    available_stock: item.available_stock    ?? stockMatch?.available_stock ?? 9999,
    dosage:          item.dosage             || "",
    noOfDays:        item.noOfDays           || "",
    discount_type:   item.discount_type      || "percent",
    discount_value:  parseFloat(item.discount_value ?? item.discount_percent ?? item.discount ?? 0),
    discount_percent:parseFloat(item.discount_percent ?? item.discount_value ?? item.discount ?? 0),
    discount_amount: parseFloat(item.discount_amount ?? 0),
    discount:        parseFloat(item.discount ?? item.discount_value ?? 0),
    total:           parseFloat((item.total != null ? item.total : (qty * mrp)).toFixed(2)),
    edit_history:    [],
  };
});

    setAddedMedicines(loadedMedicines);
    setOverallDiscountType(estimate.overall_discount_type || "percent");
    setOverallDiscountValue(
      estimate.overall_discount_value != null ? String(estimate.overall_discount_value) : ""
    );

    setRecordId(estimate.Bill_id);
    setLoadedEstimateNo(estimate.estimate_no);
    setBillingType("Estimate");
    setIsEditMode(true);

    console.log(
      "✅ Estimate loaded | Bill_id:", estimate.Bill_id,
      "| estimate_no:", estimate.estimate_no,
      "| uhid:", estimate.uhid
    );
  };

  // ── Convert Ward Request → Bill ────────────────────────────────────────────
  const convertWardRequest = async (wardReq) => {
    if (!wardReq) return;

    // ── 1. Fill header fields immediately so the form is not blank ────────
    const billDateStr = wardReq.bill_date
      ? wardReq.bill_date.split("T")[0]
      : new Date().toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      uhid:         wardReq.uhid             || "",
      inpatientNo:  wardReq.inpatient_number || "",
      name:         wardReq.patient_name || wardReq.patient_details?.patient_name || "",
      doctor_id:    wardReq.doctor_id        || "",
      doctor_name:  wardReq.doctor_name      || wardReq.patient_details?.doctor_name || "",
      roomNo:       wardReq.room_no          || wardReq.ward_name || "",
      billType:     wardReq.bill_type        || "",
      billTypeName: wardReq.bill_name        || "",
      billDate:     billDateStr,
      is_insurance: Boolean(wardReq.is_insurance),
      customer_type: wardReq.customer_type   || "",
    }));

    if (wardReq.customer_type) {
      setPatientType(wardReq.customer_type);
    } else if (wardReq.is_insurance) {
      setPatientType("Insurance");
    }

    // ── 2. Fetch full patient details from API (same as convertEstimate) ──
    // This guarantees all Additional-Details fields are populated from the
    // live API response — not from pre-enriched data that may be partial.
    if (wardReq.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(wardReq.uhid)}`,
          "GET"
        );

        // API returns { success, data: [...] }
        // apiRequest may wrap it one level deeper: res = { success, data: { success, data: [...] } }
        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          // Update name in formData with fully resolved name from API
          const fullName = formatPatientName(p.salutation, p.firstName, p.lastName);
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
            dob: p.dob || "",
          }));

          setPatientType(p.customer_type || wardReq.customer_type || (wardReq.is_insurance ? "Insurance" : ""));
          setAddress(p.permanent_address || p.area || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // Calculate age from dob
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();
            let years  = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth()    - dob.getMonth();
            let days   = today.getDate()     - dob.getDate();
            if (days   < 0) { months -= 1; days   += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years  -= 1; months += 12; }
            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }
        }
      } catch (err) {
        console.warn("convertWardRequest: could not fetch patient details —", err);
      }

      // ── Fetch admission status (same as convertEstimate) ─────────────────
      fetchAdmissionStatus(wardReq.uhid);
    }

    // ── 2. Map medicine_items to addedMedicines format ─────────────────────
    // ✅ FIX: Always default to [] and filter out any null/undefined entries
    const items = (Array.isArray(wardReq.medicine_items) && wardReq.medicine_items.length > 0)
      ? wardReq.medicine_items.filter(Boolean)
      : (Array.isArray(wardReq.medicine_particulars) && wardReq.medicine_particulars.length > 0)
        ? wardReq.medicine_particulars.filter(Boolean)
        : [];

    const loadedMedicines = items.map((item) => {
      // ✅ FIX: item is guaranteed non-null due to .filter(Boolean) above
      const rawPartMatch = Array.isArray(wardReq.medicine_particulars)
        ? wardReq.medicine_particulars.find(p => String(p.item_id) === String(item.item_id))
        : null;

      // Try to find full stock info from already-fetched medicines list
      const stockMatch =
        medicines.find(
          (s) =>
            (String(s.item_id) === String(item.item_id) ||
             (s.stock_id != null && String(s.stock_id) === String(item.item_id)) ||
             (s.id != null && String(s.id) === String(item.item_id))) &&
            String(s.batch_number) === String(item.batch_number)
        ) ||
        medicines.find(
          (s) =>
            String(s.item_id) === String(item.item_id) ||
            (s.stock_id != null && String(s.stock_id) === String(item.item_id)) ||
            (s.id != null && String(s.id) === String(item.item_id))
        );

      const resolvedItemName =
        (item.item_name && !String(item.item_name).startsWith("Item #") ? item.item_name : null) ||
        (item.medicine_name && !String(item.medicine_name).startsWith("Item #") ? item.medicine_name : null) ||
        (item.name && !String(item.name).startsWith("Item #") ? item.name : null) ||
        stockMatch?.name ||
        stockMatch?.item_name ||
        item.item_name ||
        item.medicine_name ||
        item.name ||
        (item.item_id ? `Item #${item.item_id}` : "");

      // Resolve unit price / rate:
      // Prioritize item's explicit selling price/price/mrp sent from MedicineChart/Ward Request, then stockMatch
      const resolveRate = () => {
        const candidates = [
          item?.Selling_Price,
          item?.selling_price,
          item?.price,
          item?.mrp,
          stockMatch?.Selling_Price,
          stockMatch?.selling_price,
          stockMatch?.price,
          stockMatch?.mrp,
        ];
        for (const c of candidates) {
          if (c !== undefined && c !== null && c !== "") {
            const num = parseFloat(c);
            if (!isNaN(num) && num > 0) return num;
          }
        }
        return 0;
      };

      const resolvedRate = resolveRate();
      const pendingQ = Number(item.pending_qty ?? item.qty ?? item.quantity ?? 0);
      const reqQ = Number(item.requested_qty ?? item.qty ?? pendingQ);
      const dispQ = Number(item.dispatched_qty ?? 0);
      const qty = pendingQ;
      const gross = parseFloat((qty * resolvedRate).toFixed(2));

      // Resolve GST rates
      const cgstRate = parseFloat(item.CGST_Percentage ?? stockMatch?.cgst_rate ?? 0);
      const sgstRate = parseFloat(item.SGST_Percentage ?? stockMatch?.sgst_rate ?? 0);

      // Resolve GST amounts: compute from gross or scale per-unit amount by qty
      const cgstAmt = (cgstRate > 0 && gross > 0)
        ? parseFloat(((gross * cgstRate) / 100).toFixed(2))
        : (item.CGST_Amt != null && !isNaN(parseFloat(item.CGST_Amt)) && parseFloat(item.CGST_Amt) > 0)
          ? parseFloat((parseFloat(item.CGST_Amt) * (parseFloat(item.CGST_Amt) > gross ? 1 : qty)).toFixed(2))
          : parseFloat(stockMatch?.cgst_amount || 0);

      const sgstAmt = (sgstRate > 0 && gross > 0)
        ? parseFloat(((gross * sgstRate) / 100).toFixed(2))
        : (item.SGST_Amt != null && !isNaN(parseFloat(item.SGST_Amt)) && parseFloat(item.SGST_Amt) > 0)
          ? parseFloat((parseFloat(item.SGST_Amt) * (parseFloat(item.SGST_Amt) > gross ? 1 : qty)).toFixed(2))
          : parseFloat(stockMatch?.sgst_amount || 0);

      return {
        item_id:             item.item_id,
        name:                resolvedItemName,
        batch_number:        item.batch_number || stockMatch?.batch_number || "",
        quantity:            qty,
        qty:                 qty,
        requested_qty:       reqQ,
        dispatched_qty:      dispQ,
        pending_qty:         pendingQ,
        price:               resolvedRate,
        mrp:                 resolvedRate,
        selling_price:       resolvedRate,
        Selling_Price:       resolvedRate,
        hsn_code:            stockMatch?.hsn_code    || item.hsn_code || "—",
        cgst_rate:           cgstRate,
        cgst_amount:         cgstAmt,
        sgst_rate:           sgstRate,
        sgst_amount:         sgstAmt,
        expiry_date:         stockMatch?.expiry_date  || item.expiry_date || "—",
        available_stock:     item.available_stock != null ? Number(item.available_stock) : (stockMatch?.available_stock ?? 0),
        dosage:              item.dosage              || rawPartMatch?.dosage || stockMatch?.dosage || "",
        noOfDays:            item.noOfDays            || item.no_of_days || rawPartMatch?.noOfDays || rawPartMatch?.no_of_days || "",
        dose:                item.dose                || rawPartMatch?.dose || "",
        doseunit:            item.doseunit            || item.doseUnit || rawPartMatch?.doseunit || rawPartMatch?.doseUnit || "",
        instruction:         item.instruction         || rawPartMatch?.instruction || "",
        route:               item.route               || rawPartMatch?.route || "",
        total:               gross,
        discount_type:       item.discount_type || "percent",
        discount_value:      item.discount_value || 0,
        is_consumable_items: Boolean(item.is_consumable_items),
        high_risk:           Boolean(item.high_risk || stockMatch?.high_risk),
        look_alike:          Boolean(item.look_alike || stockMatch?.look_alike),
        sound_alike:         Boolean(item.sound_alike || stockMatch?.sound_alike),
        is_low_stock:        Boolean(item.is_low_stock || stockMatch?.is_low_stock),
        edit_history:        [],
      };
    });

    setAddedMedicines(loadedMedicines);

    // ── 3. Carry over discount if present ─────────────────────────────────
    setOverallDiscountType(wardReq.overall_discount_type || "percent");
    setOverallDiscountValue(
      wardReq.overall_discount_value != null
        ? String(wardReq.overall_discount_value)
        : ""
    );

    // ── 4. If the ward/medicine-chart record already has a Bill_id, wire up
    //       PATCH so we update the existing record instead of creating a duplicate.
    //       If there is no Bill_id this is a genuinely new bill → POST.
    const existingBillId = wardReq.Bill_id || wardReq.bill_id || null;

    if (existingBillId) {
      // ✅ MedicineChart → Convert to Bill: existing record → PATCH
      setRecordId(existingBillId);
      setIsEditMode(true);
      console.log("🔁 Ward request has Bill_id:", existingBillId, "— will PATCH on save.");
    } else {
      // Fresh ward request with no prior bill → POST
      setRecordId(null);
      setIsEditMode(false);
      console.log("🆕 Ward request has no Bill_id — will POST on save.");
    }

    setLoadedEstimateNo(null);
    setBillingType("Direct");
    setIsWardRequest(true);

    toast.info(`Ward request loaded for ${wardReq.patient_name || wardReq.patient_details?.patient_name || wardReq.uhid}. Review and save as bill.`, { autoClose: 2000 });

    console.log("✅ Ward request loaded for billing | uhid:", wardReq.uhid, "| Bill_id:", existingBillId);
  };

  // Trigger convertWardRequest when wardRequestToLoad prop changes
  useEffect(() => {
    if (!wardRequestToLoad) return;
    convertWardRequest(wardRequestToLoad).then(() => {
      if (typeof onWardRequestLoaded === "function") onWardRequestLoaded();
    });
  }, [wardRequestToLoad]);

  // ── Convert Doctor Prescription → Pharmacy Bill ───────────────────────────
  const convertPrescription = async (presc) => {
    if (!presc) return;

    const billDateStr = presc.created_date
      ? presc.created_date.split("T")[0]
      : new Date().toISOString().split("T")[0];

    // 1. Fill basic header fields
    setFormData((prev) => ({
      ...prev,
      uhid:         presc.uhid         || "",
      name:         presc.patient_name || "",
      doctor_id:    presc.doctor_id    || "",
      billDate:     billDateStr,
      inpatientNo:  "",
      roomNo:       "",
    }));

    // 2. Fetch full patient details from API
    if (presc.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(presc.uhid)}`,
          "GET"
        );
        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          const fullName = formatPatientName(p.salutation, p.firstName, p.lastName);
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
            dob:  p.dob || "",
          }));

          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || p.area || presc.address || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || presc.mobile || "");

          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();
            let years  = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth()    - dob.getMonth();
            let days   = today.getDate()     - dob.getDate();
            if (days   < 0) { months -= 1; days   += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years  -= 1; months += 12; }
            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else if (presc.age) {
            setPatientAge(String(presc.age));
          } else {
            setPatientAge("");
          }
        } else {
          if (presc.address) setAddress(presc.address);
          if (presc.mobile) setMobilePhone(presc.mobile);
          if (presc.age) setPatientAge(String(presc.age));
        }
      } catch (err) {
        console.warn("convertPrescription: could not fetch patient details —", err);
        if (presc.address) setAddress(presc.address);
        if (presc.mobile) setMobilePhone(presc.mobile);
        if (presc.age) setPatientAge(String(presc.age));
      }

      fetchAdmissionStatus(presc.uhid);
    }

    // 3. Map prescription_details to addedMedicines format matching inventory stock
    const items = Array.isArray(presc.prescription_details)
      ? presc.prescription_details.filter(Boolean)
      : [];

    const loadedMedicines = items.map((item) => {
      const stockMatch =
        medicines.find(
          (s) =>
            String(s.item_id) === String(item.item_id) ||
            (s.stock_id != null && String(s.stock_id) === String(item.item_id)) ||
            (s.id != null && String(s.id) === String(item.item_id))
        ) ||
        medicines.find(
          (s) =>
            item.item_name &&
            s.name &&
            s.name.trim().toLowerCase() === item.item_name.trim().toLowerCase()
        );

      const resolvedItemName =
        (item.item_name && !String(item.item_name).startsWith("Item #") ? item.item_name : null) ||
        (item.medicine_name && !String(item.medicine_name).startsWith("Item #") ? item.medicine_name : null) ||
        (item.name && !String(item.name).startsWith("Item #") ? item.name : null) ||
        stockMatch?.name ||
        stockMatch?.item_name ||
        item.item_name ||
        item.medicine_name ||
        item.name ||
        (item.item_id ? `Item #${item.item_id}` : "");

      // ── Price / MRP: item enriched by backend first, then stockMatch, then 0 ──
      const price = parseFloat(item.price || item.mrp || stockMatch?.price || stockMatch?.mrp || 0);
      const mrp   = parseFloat(item.mrp   || item.price || stockMatch?.mrp || stockMatch?.price || 0);
      const qty   = Number(item.total_dosage || item.quantity || item.qty || 1);

      // ── Tax rates: item enriched → stockMatch → 0 ──
      const cgstRate    = parseFloat(item.cgst_rate   ?? stockMatch?.cgst_rate   ?? 0);
      const sgstRate    = parseFloat(item.sgst_rate   ?? stockMatch?.sgst_rate   ?? 0);
      const cgstAmtUnit = parseFloat(item.cgst_amount ?? stockMatch?.cgst_amount ?? 0);
      const sgstAmtUnit = parseFloat(item.sgst_amount ?? stockMatch?.sgst_amount ?? 0);

      return {
        item_id:         item.item_id || stockMatch?.item_id,
        name:            resolvedItemName,
        batch_number:    item.batch_number || item.batch_no || stockMatch?.batch_number || "",
        quantity:        qty,
        price:           price,
        mrp:             mrp,
        hsn_code:        item.hsn_code    || stockMatch?.hsn_code    || "—",
        cgst_rate:       cgstRate,
        cgst_amount:     parseFloat((cgstAmtUnit * qty).toFixed(2)),
        sgst_rate:       sgstRate,
        sgst_amount:     parseFloat((sgstAmtUnit * qty).toFixed(2)),
        expiry_date:     item.expiry_date || stockMatch?.expiry_date || "—",
        available_stock: stockMatch?.available_stock ?? 9999,
        dosage:          item.dosage      || stockMatch?.dosage || "",
        noOfDays:        item.duration    || item.noOfDays || "",
        total:           parseFloat((qty * mrp).toFixed(2)),
        edit_history:    [],
      };
    });


    setAddedMedicines(loadedMedicines);
    setOverallDiscountType("percent");
    setOverallDiscountValue("");
    setRecordId(null);
    setIsEditMode(false);
    setLoadedEstimateNo(null);
    setBillingType("Direct");
    setIsWardRequest(false);

    toast.info(
      `Prescription loaded for ${presc.patient_name || presc.uhid} (${loadedMedicines.length} items). Review and save bill.`,
      { autoClose: 2500 }
    );
  };

  // Trigger convertPrescription when prescriptionToLoad prop changes
  useEffect(() => {
    if (!prescriptionToLoad) return;
    convertPrescription(prescriptionToLoad).then(() => {
      if (typeof onPrescriptionLoaded === "function") onPrescriptionLoaded();
    });
  }, [prescriptionToLoad]);

  const loadBillForEdit = async (bill) => {
    if (!bill.Bill_id) {
      toast.error("Bill is missing Bill_id — cannot load for edit.", { autoClose: 2000 });
      return;
    }

    // Resolve bill type name: prefer bill_type_name from API, then bill_name,
    // then look up from already-fetched billTypes list by bill_type code.
    const resolvedBillTypeName =
      bill.bill_type_name ||
      bill.bill_name ||
      billTypes.find(bt => String(bt.bill_type) === String(bill.bill_type))?.bill_name ||
      "";

    setFormData((prev) => ({
      ...prev,
      name:         bill.patient_name     || "",
      uhid:         bill.uhid             || "",
      inpatientNo:  bill.inpatient_number || "",
      doctor_id:    bill.doctor_id        || "",
      roomNo:       bill.room_no          || "",
      billType:     bill.bill_type        || "",
      billTypeName: resolvedBillTypeName,
      billNo:       bill.bill_no          || bill.bill_number || "",
      billDate: bill.bill_date
        ? bill.bill_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      fullBillDate: bill.bill_date || bill.created_date || "",
    }));

    // ── Fetch full patient record to populate Patient Information &
    //    Patient Additional Details (address, mobile, age, patientType, etc.)
    //    Mirrors the same pattern used in convertEstimate / convertWardRequest.
    if (bill.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(bill.uhid)}`,
          "GET"
        );

        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          // Build full patient name from API (salutation + firstName + lastName)
          const fullName = formatPatientName(p.salutation, p.firstName, p.lastName);
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
            dob: p.dob || "",
          }));

          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // Age from dob
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();
            let years  = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth()    - dob.getMonth();
            let days   = today.getDate()     - dob.getDate();
            if (days   < 0) { months -= 1; days   += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years  -= 1; months += 12; }
            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }

          // ── Resolve doctor_id from most recent billing entry with a doctor_id
          //    (use bill.doctor_id from ViewBills if already set; otherwise derive)
          if (!bill.doctor_id && Array.isArray(p.billing) && p.billing.length > 0) {
            const billingsWithDoctor = p.billing.filter(b => b.doctor_id);
            if (billingsWithDoctor.length > 0) {
              const sorted = [...billingsWithDoctor].sort(
                (a, b) => new Date(b.billed_date) - new Date(a.billed_date)
              );
              setFormData((prev) => ({
                ...prev,
                doctor_id: sorted[0].doctor_id,
              }));
            }
          }
        }
      } catch (err) {
        console.warn("loadBillForEdit: could not fetch patient details —", err);
      }

      // ── Fetch admission status (same as convertEstimate) ──────────────────
      fetchAdmissionStatus(bill.uhid);
    }

    const rawMeds = parseOrderedDictMeds(bill.medicine_particulars);

    const loadedMedicines = rawMeds.map((m) => {
      const price = parseFloat(m.price || m.Price || m.mrp || 0);
      const qty   = parseFloat(m.qty   || m.quantity || 0);

      const stockMatch = medicines.find(
        (s) =>
          (String(s.item_id) === String(m.item_id) ||
           (s.stock_id != null && String(s.stock_id) === String(m.item_id)) ||
           (s.id != null && String(s.id) === String(m.item_id))) &&
          String(s.batch_number) === String(m.batch_number)
      ) || medicines.find(
        (s) =>
          String(s.item_id) === String(m.item_id) ||
          (s.stock_id != null && String(s.stock_id) === String(m.item_id)) ||
          (s.id != null && String(s.id) === String(m.item_id))
      );

      const resolvedItemName =
        (m.item_name && !String(m.item_name).startsWith("Item #") ? m.item_name : null) ||
        (m.medicine_name && !String(m.medicine_name).startsWith("Item #") ? m.medicine_name : null) ||
        (m.name && !String(m.name).startsWith("Item #") ? m.name : null) ||
        stockMatch?.name ||
        stockMatch?.item_name ||
        m.item_name ||
        m.medicine_name ||
        m.name ||
        (m.item_id ? `Item #${m.item_id}` : "");

      return {
        item_id:         m.item_id,
        name:            resolvedItemName,
        batch_number:    m.batch_number || "",
        quantity:        qty,
        price:           price,
        mrp:             stockMatch?.mrp ?? price,
        hsn_code:        stockMatch?.hsn_code || "—",
        cgst_rate:       stockMatch?.cgst_rate || 0,
        cgst_amount:     stockMatch?.cgst_amount || 0,
        sgst_rate:       stockMatch?.sgst_rate || 0,
        sgst_amount:     stockMatch?.sgst_amount || 0,
        expiry_date:     stockMatch?.expiry_date || "—",
        discount_type:   m.discount_type      || "percent",
        discount_value:  parseFloat(m.discount_value ?? m.discount_percent ?? m.discount ?? 0),
        discount_percent:parseFloat(m.discount_percent ?? m.discount_value ?? m.discount ?? 0),
        discount_amount: parseFloat(m.discount_amount ?? 0),
        discount:        parseFloat(m.discount ?? m.discount_value ?? 0),
        total:           parseFloat((m.total != null ? m.total : (qty * price)).toFixed(2)),
        available_stock: 9999,
        edit_history:    m.edit_history || [],
      };
    });

    setAddedMedicines(loadedMedicines);

    setOverallDiscountType(bill.overall_discount_type || "percent");
    setOverallDiscountValue(
      bill.overall_discount_value != null
        ? String(bill.overall_discount_value)
        : ""
    );

    setRecordId(bill.Bill_id);

    // ── Store the edit reason typed in ViewBills confirmation modal ──────────
    if (bill.editReason) setEditReason(bill.editReason);

    if (bill.billing_mode === "ESTIMATE" && bill.estimate_no) {
      setLoadedEstimateNo(bill.estimate_no);
      setBillingType("Estimate");
    } else {
      setLoadedEstimateNo(null);
      setBillingType("Direct");
    }

    setIsEditMode(true);

    console.log(
      "✅ Bill loaded for edit | Bill_id:", bill.Bill_id,
      "| bill_no:", bill.bill_no || bill.bill_number,
      "| billing_mode:", bill.billing_mode,
      "| editReason:", bill.editReason || "(none)",
      "| medicines resolved:", loadedMedicines.map(m => ({ id: m.item_id, name: m.name, qty: m.quantity }))
    );
  };

  useEffect(() => {
    if (!billToEdit) return;
    loadBillForEdit(billToEdit).then(() => {
      if (typeof onBillEditLoaded === "function") onBillEditLoaded();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billToEdit]);

  const handlePrint = () => {
    const rawDocName = formData.doctor_name;
    const docName = formatDoctorDisplay(formData.doctor_id, rawDocName);
    const empName = getSignatureEmployeeName("", formData.cashier_id);

    const printableContent = buildPrintBillHtml({
      billNo:               formData.billNo || "DRAFT",
      billDate:             formData.fullBillDate || formData.billDate || new Date().toISOString(),
      patientName:          formData.name || "—",
      uhid:                 formData.uhid || "—",
      patientAge:           patientAge || "—",
      doctorName:           docName,
      roomNo:               formData.roomNo || admissionRoomNo || "",
      inpatientNumber:      formData.inpatientNo || formData.inpatient_number || formData.inpatientNumber || "",
      insuranceName:        insuranceName || formData.insuranceName || (String(patientType || "").toLowerCase() === "insurance" ? "INSURANCE" : patientType) || "",
      isDuplicate:          true,
      billTypeName:         formData.billTypeName || "OP Pharmacy",
      paymentMode:          selectedPaymentMode || "Cash",
      employeeName:         empName,
      medicines:            addedMedicines,
      totalAmount:          totalAmount,
      totalItemDiscount:    totalItemDiscount,
      overallDiscountType:  overallDiscountType,
      overallDiscountValue: overallDiscountValue,
      netAmount:            netAmount,
    });

    executeBillPrint(printableContent);
  };

  const handleDelete = (key) => {
    setAddedMedicines(prev => prev.filter((m) => getMedicineKey(m) !== key));
  };

  // Gross Total: actual undiscounted amount (quantity * price/mrp)
  const grossTotalAmount = addedMedicines.reduce((sum, m) => {
    const qty = Number(m.quantity || m.qty || 0);
    const price = Number(m.mrp || m.price || m.Selling_Price || m.selling_price || 0);
    return sum + (qty * price);
  }, 0);

  const totalItemDiscount = addedMedicines.reduce((sum, m) => {
    const pricing = calculateMedicinePricing(m);
    return sum + pricing.totalDiscountOnMrp;
  }, 0);

  const baseForOverall = Math.max(0, grossTotalAmount - totalItemDiscount);
  const overallDiscAmt = overallDiscountType === "amount"
    ? parseFloat(overallDiscountValue || 0)
    : baseForOverall * (parseFloat(overallDiscountValue || 0) / 100);

  const totalDiscount = totalItemDiscount + overallDiscAmt;
  const netAmount = Math.max(0, grossTotalAmount - totalDiscount);
  const totalAmount = grossTotalAmount;



  return (
    <PageWrapper>
      <StyledToastContainer position="top-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover={false} limit={3} />
      <Card>

        {/* ── Top Bar: Title + Last Billed UHID ── */}
        <TopBar>
          {lastBilled && (
            <LastBilledBadge>
              Last Billed UHID:&nbsp;
              <span
                className="link"
                onClick={handleLastUHIDClick}
              >
                {lastBilled.uhid}
              </span>
            </LastBilledBadge>
          )}
        </TopBar>

        {/* ── Estimate Banner + Edit Mode Banner ── */}
        <FormSection>
          {loadedEstimateNo && (
            <EstimateBanner>
              📋 Loaded from Estimate <strong>#{loadedEstimateNo}</strong> — edit medicines if needed, then click <strong>Convert to Bill</strong>
              <button
                title="Clear estimate and start fresh"
                onClick={() => {
                  setLoadedEstimateNo(null);
                  setAddedMedicines([]);
                }}
              >
                ×
              </button>
            </EstimateBanner>
          )}

          {/* Edit Mode Banner */}
          {isEditMode && formData.billNo && (
            <div style={{
              marginTop: loadedEstimateNo ? 14 : 0,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              borderRadius: 10,
              padding: "11px 16px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 4,
                background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
                borderRadius: "4px 0 0 4px"
              }} />
              <span style={{ fontSize: 20, marginLeft: 4, flexShrink: 0 }}>✏️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af" }}>
                  Editing Bill{" "}
                  <span style={{
                    fontFamily: "monospace", background: "#dbeafe",
                    padding: "1px 8px", borderRadius: 5,
                    border: "1px solid #93c5fd", fontSize: 12.5
                  }}>
                    {formData.billNo}
                  </span>
                </div>
                {editReason && (
                  <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: "#1e40af" }}>Reason: </span>
                    {editReason}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 4 }}>
                  Modify the details below and click <strong>Update Bill</strong> to save changes.
                </div>
              </div>
              <button
                title="Cancel edit and reset form"
                onClick={() => { resetForm(); setTodayBillDate(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#93c5fd", fontSize: 18, padding: "0 2px",
                  lineHeight: 1, flexShrink: 0,
                  transition: "color 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.color = "#93c5fd"}
              >
                ×
              </button>
            </div>
          )}

          {/* Show empty state placeholder if neither banner is visible */}
          {!loadedEstimateNo && !(isEditMode && formData.billNo) && (
            <div style={{ height: 0 }} />
          )}
        </FormSection>

        {/* ── Patient Details Form ── */}
        <FormSection>
          <SectionLabel>Patient Information</SectionLabel>
          <FormRow>
            <InputWrapper>
              <Label>UHID Number</Label>
              <div style={{ display: "flex", gap: 0 }}>
                <Input
                  type="text"
                  name="uhid"
                  placeholder="Type UHID and press Enter"
                  value={formData.uhid}
                  onChange={handleChange}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchByUhid();
                    }
                  }}
                  style={{ borderRadius: "10px 0 0 10px", borderRight: "none", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleSearchByUhid()}
                  title="Search patient by UHID"
                  style={{
                    padding: "0 14px",
                    background: "linear-gradient(135deg, #0f766e, #0d9488)",
                    color: "#fff",
                    border: "1px solid #0f766e",
                    borderRadius: "0 10px 10px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <FaSearch />
                </button>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Inpatient No</Label>
              <div style={{ display: "flex", gap: 0 }}>
                <Input
                  type="text"
                  name="inpatientNo"
                  placeholder="Type IP No, press Enter to search"
                  value={formData.inpatientNo}
                  onChange={handleChange}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); handleSearchByIP(); }
                  }}
                  onBlur={() => {
                    // Auto-search when user leaves the field if an IP is typed
                    if (formData.inpatientNo?.trim() && !formData.name) handleSearchByIP();
                  }}
                  style={{ borderRadius: "10px 0 0 10px", borderRight: "none", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleSearchByIP()}
                  title="Search admissions by IP number"
                  style={{
                    padding: "0 14px",
                    background: "linear-gradient(135deg, #0f766e, #0d9488)",
                    color: "#fff",
                    border: "1px solid #0f766e",
                    borderRadius: "0 10px 10px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <FaSearch />
                </button>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Patient name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    focusMedicineSearch();
                  }
                }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Mobile</Label>
              <div style={{ display: "flex", gap: 0 }}>
                <Input
                  type="text"
                  name="mobilePhone"
                  placeholder="Type Mobile and press Enter"
                  value={mobilePhone}
                  onChange={e => setMobilePhone(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchByMobile();
                    }
                  }}
                  style={{ borderRadius: "10px 0 0 10px", borderRight: "none", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleSearchByMobile()}
                  title="Search patient by Mobile Number"
                  style={{
                    padding: "0 14px",
                    background: "linear-gradient(135deg, #0f766e, #0d9488)",
                    color: "#fff",
                    border: "1px solid #0f766e",
                    borderRadius: "0 10px 10px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <FaSearch />
                </button>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Age</Label>
              <Input value={patientAge} disabled />
            </InputWrapper>

           
            <InputWrapper>
              <Label>Bill Date</Label>
              <Input
                type="date"
                name="billDate"
                value={formData.billDate}
                disabled
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Bill Type</Label>
              <Input
                type="text"
                name="billTypeName"
                value={
                  // Prefer live lookup from billTypes list so it always shows
                  // correct name even if billTypeName was missing in API response
                  billTypes.find(bt => String(bt.bill_type) === String(formData.billType))?.bill_name ||
                  formData.billTypeName ||
                  ""
                }
                disabled
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Doctor Name</Label>
              <SearchSelect
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                placeholder="Select Doctor"
                height="34px"
                style={{
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  borderColor: "#cbd5e1",
                }}
                options={doctorOptions}
              />
            </InputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionLabel>Patient Additional Details</SectionLabel>

          <FormRow>
            <InputWrapper>
              <Label>Patient Type</Label>
              <Input value={patientType} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Insurance</Label>
              <Input
                value={insuranceName || "—"}
                disabled
                readOnly
                style={{
                  color: insuranceName ? "#0f766e" : "#64748b",
                  fontWeight: insuranceName ? "600" : "normal",
                  background: "#f8fafc"
                }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Address</Label>
              <Input value={address} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Place</Label>
              <Input value={place} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Admission Status</Label>
              <Input
                value={admissionStatus}
                disabled
                style={{
                  color: admissionStatus === "ADMITTED" ? "green" : "red",
                  fontWeight: "bold"
                }}
              />
            </InputWrapper>

            {admissionRoomNo && (
              <InputWrapper>
                <Label>Room No / Bed</Label>
                <Input
                  value={admissionRoomNo}
                  disabled
                  style={{ color: "#0f766e", fontWeight: "bold" }}
                />
              </InputWrapper>
            )}

            {admissionDateTime && (
              <InputWrapper>
                <Label>Admission Date &amp; Time</Label>
                <Input
                  value={admissionDateTime}
                  disabled
                  style={{ color: "#0f766e", fontWeight: "600" }}
                />
              </InputWrapper>
            )}
          </FormRow>
        </FormSection>

        {/* ── Medicine Search ── */}
        <MedicineSearchWrapper>
          <SearchHint>
            <FaSearch style={{ marginRight: 5 }} />
            Type medicine name (e.g. <strong>do</strong>, <strong>dol</strong>), then press <strong>Enter</strong> to open selection modal
            {!isMedicineSearchEnabled && <span style={{ color: "#ef4444" }}> — Select Doctor first</span>}
          </SearchHint>
          <SearchInputRow>
            <SearchInputStyled
              ref={medicineSearchInputRef}
              type="text"
              placeholder={
                isMedicineSearchEnabled
                  ? "Type medicine name (e.g. do, dol) and press Enter..."
                  : "Type medicine name (or select Doctor first)..."
              }
              value={searchTerm}
              onChange={handleMedicineInput}
              onKeyDown={handleKeyPress}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); setShowModal(false); setFilteredModalMedicines([]); focusMedicineSearch(); }}
                style={{
                  background: "none", border: "1px solid #cbd5e1", borderLeft: "none", borderRight: "none",
                  color: "#94a3b8", cursor: "pointer", padding: "0 10px", fontSize: "1rem",
                  display: "flex", alignItems: "center"
                }}
                title="Clear search"
              >×</button>
            )}
            <SearchIconBtn
              type="button"
              onClick={() => {
                if (!isMedicineSearchEnabled) {
                  toast.warning("Please select a Doctor first before searching medicines.", { autoClose: 2000 });
                  return;
                }
                openMedicineModal(searchTerm);
              }}
              title="Search medicines"
            >
              <FaSearch />
            </SearchIconBtn>
          </SearchInputRow>
        </MedicineSearchWrapper>

        {/* ── Added Medicines Table ── */}
        <MedicinesTableSection>
          <SectionLabel>Added Medicines</SectionLabel>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Particulars</Th>
                  <Th>Batch</Th>
                  <Th>Qty</Th>
                  <Th>MRP</Th>
                  <Th>Price</Th>
                  <Th>Disc Type</Th>
                  <Th>Disc Value</Th>
                  <Th>CGST%</Th>
                  <Th>CGST Amt</Th>
                  <Th>SGST%</Th>
                  <Th>SGST Amt</Th>
                  <Th>Total</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {addedMedicines.map((medicine, index) => {

                  const isNilStock = Number(medicine.available_stock) <= 0;
                  const isLowStock = medicine.is_low_stock;

                  const itemGross = (medicine.quantity || 0) * (medicine.mrp || 0);
                  const discVal = parseFloat(medicine.discount_value || 0);
                  const discAmt = medicine.discount_type === "amount"
                    ? discVal
                    : itemGross * (discVal / 100);
                  const addedNameColor = isNilStock
                    ? "#b91c1c"
                    : medicine.high_risk
                      ? "#b91c1c"
                      : medicine.look_alike
                        ? "#92400e"
                        : medicine.sound_alike
                          ? "#166534"
                          : isLowStock
                            ? "#c2410c"
                            : undefined;
                  return (
                    <Tr key={index}>
                      <Td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                            <span style={{ color: addedNameColor, fontWeight: addedNameColor ? 700 : 500 }}>{medicine.name}</span>
                            {Number(medicine.available_stock) <= 0 && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b91c1c" }}>(NIL)</span>
                            )}
                            {medicine.is_low_stock && Number(medicine.available_stock) > 0 && (
                              <>
                                <BlinkDot />
                                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b45309" }}>(LOW)</span>
                              </>
                            )}
                          </div>
                          {(medicine.dosage || medicine.dose || medicine.instruction) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                              {medicine.dosage && (
                                <span style={{
                                  background: "#f0fdf4",
                                  color: "#15803d",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  border: "1px solid #bbf7d0",
                                  letterSpacing: "0.02em"
                                }}>
                                  Dosage: {medicine.dosage}
                                </span>
                              )}
                              {medicine.noOfDays && (
                                <span style={{
                                  background: "#f8fafc",
                                  color: "#475569",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  border: "1px solid #e2e8f0"
                                }}>
                                  {medicine.noOfDays} Days
                                </span>
                              )}
                              {medicine.instruction && (
                                <span style={{ fontSize: "0.68rem", color: "#64748b", fontStyle: "italic" }}>
                                  ({medicine.instruction})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td>{medicine.batch_number}</Td>
                      <Td>
                        <QtyInput
                          ref={(el) => (qtyInputRefs.current[index] = el)}
                          type="number"
                          min="0"
                          value={medicine.quantity || ""}
                          style={qtyErrors[index] ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.18)", background: "#fff5f5" } : {}}
                          onChange={(e) => {
                            const newQty = parseFloat(e.target.value) || 0;

                            if (
                              medicine.available_stock !== 9999 &&
                              medicine.available_stock != null &&
                              newQty > medicine.available_stock
                            ) {
                              toast.warning(
                                `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
                                { toastId: `stock-excess-${index}`, autoClose: 2000 }
                              );
                            }

                            const dVal = parseFloat(medicine.discount_value ?? medicine.discount_percent ?? medicine.discount ?? 0);
                            const pricing = calculateMedicinePricing(medicine, newQty, dVal);
                            setAddedMedicines((prev) =>
                              prev.map((m, i) =>
                                i === index ? {
                                  ...m,
                                  quantity: newQty,
                                  total: pricing.lineTotal,
                                  product_value: pricing.productValue,
                                  taxable_value: pricing.taxableValue,
                                  discount_type: m.discount_type || "percent",
                                  discount_value: dVal,
                                  discount_percent: (m.discount_type || "percent") === "percent" ? dVal : 0,
                                  discount_amount: pricing.discAmtOnBase,
                                  discount: dVal,
                                  cgst_rate: pricing.cgstRate,
                                  cgst_amount: pricing.cgstAmt,
                                  sgst_rate: pricing.sgstRate,
                                  sgst_amount: pricing.sgstAmt,
                                } : m
                              )
                            );
                            if (newQty > 0) setQtyErrors(prev => { const n = { ...prev }; delete n[index]; return n; });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
                              e.preventDefault();
                              focusMedicineSearch();
                            }
                          }}
                        />
                      </Td>
                      <Td>₹{(parseFloat(medicine.mrp) || 0).toFixed(2)}</Td>
                      <Td>
                        <div>₹{(itemGross || 0).toFixed(2)}</div>
                        {medicine.discount_value > 0 && medicine.product_value ? (
                          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                            Base: ₹{(parseFloat(medicine.product_value) || 0).toFixed(2)}
                          </div>
                        ) : null}
                      </Td>
                      <Td>
                        <Select
                          style={{ width: 68, padding: "4px 6px", fontSize: "0.82rem" }}
                          value="percent"
                          onChange={() => {}}
                        >
                          <option value="percent">%</option>
                        </Select>
                      </Td>
                      <Td>
                        <QtyInput
                          type="number"
                          min="0"
                          max="100"
                          value={medicine.discount_value ?? medicine.discount_percent ?? ""}
                          placeholder="0"
                          onChange={(e) => {
                            let dVal = parseFloat(e.target.value) || 0;
                            if (dVal < 0) dVal = 0;
                            if (dVal > 100) dVal = 100;
                            const pricing = calculateMedicinePricing(medicine, medicine.quantity || 0, dVal);
                            setAddedMedicines((prev) =>
                              prev.map((m, i) =>
                                i === index ? {
                                  ...m,
                                  discount_type: "percent",
                                  discount_value: dVal,
                                  discount_percent: dVal,
                                  discount_amount: pricing.discAmtOnBase,
                                  discount: dVal,
                                  product_value: pricing.productValue,
                                  taxable_value: pricing.taxableValue,
                                  cgst_rate: pricing.cgstRate,
                                  cgst_amount: pricing.cgstAmt,
                                  sgst_rate: pricing.sgstRate,
                                  sgst_amount: pricing.sgstAmt,
                                  total: pricing.lineTotal
                                } : m
                              )
                            );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
                              e.preventDefault();
                              focusMedicineSearch();
                            }
                          }}
                        />
                        {medicine.discount_value > 0 && (
                          <div style={{ fontSize: "0.66rem", color: "#059669", fontWeight: 600, marginTop: 2 }}>
                            -₹{(parseFloat(medicine.discount_amount) || 0).toFixed(2)}
                          </div>
                        )}
                      </Td>
                      <Td>{(parseFloat(medicine.cgst_rate) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.cgst_amount) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.sgst_rate) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.sgst_amount) || 0).toFixed(2)}</Td>
                      <Td style={{ fontWeight: 600 }}>₹{(parseFloat(medicine.total) || 0).toFixed(2)}</Td>
                      <Td>
                        <DeleteBtn onClick={() => handleDelete(getMedicineKey(medicine))}>
                          <FaTrashAlt />
                        </DeleteBtn>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
              <tfoot>
                <NetAmountRow>
                  <Td colSpan="12" style={{ textAlign: "right", color: "#64748b", fontSize: "0.85rem" }}>
                    {addedMedicines.length === 0 ? "No medicines added yet." : `${addedMedicines.length} item(s)`}
                  </Td>
                  <Td />
                </NetAmountRow>
              </tfoot>
            </Table>
          </TableWrapper>

          {/* ── Summary Panel ── */}
          {addedMedicines.length > 0 && (
            <div style={{
              marginTop: 20,
              background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "16px 24px",
              display: "flex",
              flexWrap: "wrap",
              gap: "0 40px",
              alignItems: "center",
              justifyContent: "flex-end",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Total</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f766e" }}>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Item Disc</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#dc2626" }}>₹{totalItemDiscount.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Overall Discount</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Select
                    style={{ width: 55, padding: "4px 4px", fontSize: "0.82rem", borderRadius: 6, border: "1px solid #cbd5e1" }}
                    value="percent"
                    onChange={() => {}}
                  >
                    <option value="percent">%</option>
                  </Select>
                  <QtyInput
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={overallDiscountValue}
                    onChange={e => {
                      let val = parseFloat(e.target.value) || 0;
                      if (val < 0) val = 0;
                      if (val > 100) val = 100;
                      setOverallDiscountValue(e.target.value === "" ? "" : val);
                    }}
                    style={{ width: 90 }}
                  />
                </div>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Overall Disc Amt</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#dc2626" }}>₹{overallDiscAmt.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Net Amount (Payable)</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f766e" }}>₹{netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <ButtonContainer>
            {(addedMedicines.length > 0 || formData.name) && (
              <Button danger onClick={() => setShowCancelModal(true)}>
                <FaTimes /> Cancel
              </Button>
            )}

            {/* Save Estimate button — sets billingType = "Estimate" internally */}
            <Button
              primary
              onClick={() => handleSave("Estimate")}
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Estimate"}
            </Button>

            {/* Save Bill button — sets billingType = "Direct" internally */}
            <Button
              success
              onClick={() => handleSave("Billed")}
              disabled={saving}
              style={
                loadedEstimateNo
                  ? { background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", border: "none" }
                  : {}
              }
            >
              <FaSave /> {saving ? "Saving..." : loadedEstimateNo ? "Convert to Bill" : "Save Bill"}
            </Button>

          </ButtonContainer>
        </MedicinesTableSection>

      </Card>

      {/* ── Medicine Selection Modal ── */}
      {showModal && (
        <ModalOverlay onClick={handleModalCloseAndClear}>
          <ModalContainer style={{ maxWidth: 1120, width: "95%" }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Items Query — Select Medicines</ModalTitle>
              <CloseButton onClick={handleModalCloseAndClear}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                <SearchRow style={{ flex: 1, margin: 0 }}>
                  <SearchInput
                    ref={modalSearchInputRef}
                    placeholder="Filter results... (Press Enter to select, ↓ to browse list)"
                    value={modalSearch}
                    onChange={e => { setModalSearch(e.target.value); setModalPage(1); }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        const targetIdx = Math.min(displayedModalMedicines.length - 1, Math.max(0, highlightedModalIndex));
                        modalRowRefs.current[targetIdx]?.focus();
                        modalRowRefs.current[targetIdx]?.scrollIntoView({ block: "nearest" });
                      } else if (e.key === "Enter") {
                        if (Date.now() - modalOpenedAtRef.current < 150) {
                          e.preventDefault();
                          return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSelected();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleModalCloseAndClear();
                      }
                    }}
                    style={{ width: "100%" }}
                  />
                </SearchRow>
                <label style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  color: showNilStock ? "#dc2626" : "#64748b",
                  background: showNilStock ? "#fef2f2" : "#f1f5f9",
                  border: `1.5px solid ${showNilStock ? "#fca5a5" : "#cbd5e1"}`,
                  borderRadius: 8, padding: "6px 14px", userSelect: "none",
                  transition: "all 0.2s", whiteSpace: "nowrap", minWidth: 190,
                  boxShadow: showNilStock ? "0 0 0 3px rgba(220,38,38,0.08)" : "none"
                }}>
                  <input
                    type="checkbox"
                    checked={showNilStock}
                    onChange={e => { setShowNilStock(e.target.checked); setModalPage(1); }}
                    style={{ accentColor: "#dc2626", width: 15, height: 15, cursor: "pointer" }}
                  />
                  <span>
                    List the Nil Stock
                    {nilStockCount > 0 && (
                      <span style={{
                        marginLeft: 6,
                        background: showNilStock ? "#dc2626" : "#94a3b8",
                        color: "#fff", borderRadius: 10,
                        padding: "1px 7px", fontSize: "0.72rem", fontWeight: 700,
                      }}>{nilStockCount}</span>
                    )}
                  </span>
                </label>
              </div>

              <ModalResultCount>
                Showing {visibleModalMedicines.length === 0 ? 0 : (safeModalPage - 1) * MODAL_PAGE_SIZE + 1}–{Math.min(safeModalPage * MODAL_PAGE_SIZE, visibleModalMedicines.length)} of {visibleModalMedicines.length} entries
                {!showNilStock && nilStockCount > 0 && (
                  <span style={{ marginLeft: 8, color: "#dc2626", fontSize: "0.78rem" }}>
                    · {nilStockCount} nil-stock item{nilStockCount > 1 ? "s" : ""} hidden — tick <strong>List the Nil Stock</strong> to show
                  </span>
                )}
              </ModalResultCount>

              {stockLoading ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#0f766e", fontWeight: 600 }}>
                  <Spinner />
                  <div style={{ marginTop: 12, fontSize: "0.95rem" }}>Loading medicines stock...</div>
                </div>
              ) : visibleModalMedicines.length === 0 ? (
                <NoResults>
                  {nilStockCount === modalSourceList.length && !showNilStock
                    ? 'All matching medicines have nil stock. Tick "List the Nil Stock" to view them.'
                    : "No medicines found matching your search."}
                </NoResults>
              ) : (
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ width: 48, textAlign: "center", whiteSpace: "nowrap" }}>Select</Th>
                        <Th style={{ minWidth: 170 }}>Item Name</Th>
                        <Th style={{ whiteSpace: "nowrap" }}>Batch No</Th>
                        <Th style={{ whiteSpace: "nowrap", minWidth: 105 }}>Expiry</Th>
                        <Th style={{ whiteSpace: "nowrap" }}>MRP</Th>
                        <Th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Avail. Stock</Th>
                        <Th style={{ whiteSpace: "nowrap" }}>HSN Code</Th>
                        <Th style={{ minWidth: 160 }}>Chemical Composition</Th>
                        <Th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Shelf No</Th>
                        <Th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Rack No</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedModalMedicines.map((medicine, index) => {
                        const isNilStock = medicine.is_nil_stock;
                        const isLowStock = !isNilStock && medicine.is_low_stock;
                        const isHighlighted = index === highlightedModalIndex;
                        const isSelected = selectedMedicines.some((m) => getMedicineKey(m) === getMedicineKey(medicine));

                        // Determine item name text color from risk flags (priority: high_risk > look_alike > sound_alike)
                        const nameColor = isNilStock
                          ? "#b91c1c"
                          : medicine.high_risk
                            ? "#b91c1c"
                            : medicine.look_alike
                              ? "#92400e"
                              : medicine.sound_alike
                                ? "#166534"
                                : isLowStock
                                  ? "#c2410c"
                                  : undefined;
                        return (
                          <Tr
                            key={getMedicineKey(medicine) || index}
                            ref={(el) => (modalRowRefs.current[index] = el)}
                            tabIndex={0}
                            style={{
                              cursor: isNilStock ? "not-allowed" : "pointer",
                              opacity: isNilStock ? 0.55 : 1,
                              backgroundColor: isHighlighted ? "#ecfdf5" : isSelected ? "#f0fdfa" : undefined,
                              borderLeft: isHighlighted ? "4px solid #0f766e" : "4px solid transparent",
                              outline: "none",
                              boxShadow: isHighlighted ? "inset 0 0 0 1px #0f766e, 0 1px 3px rgba(15,118,110,0.15)" : undefined,
                              transition: "background-color 0.1s ease, border-left 0.1s ease",
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isNilStock) {
                                  handleSelectMedicineAndClose(medicine);
                                }
                              } else if (e.key === "ArrowDown") {
                                e.preventDefault();
                                e.stopPropagation();
                                const nextIdx = Math.min(displayedModalMedicines.length - 1, index + 1);
                                setHighlightedModalIndex(nextIdx);
                                modalRowRefs.current[nextIdx]?.focus();
                                modalRowRefs.current[nextIdx]?.scrollIntoView({ block: "nearest" });
                              } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                e.stopPropagation();
                                if (index === 0) {
                                  modalSearchInputRef.current?.focus();
                                } else {
                                  const prevIdx = index - 1;
                                  setHighlightedModalIndex(prevIdx);
                                  modalRowRefs.current[prevIdx]?.focus();
                                  modalRowRefs.current[prevIdx]?.scrollIntoView({ block: "nearest" });
                                }
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleModalCloseAndClear();
                              }
                            }}
                            onClick={() => {
                              setHighlightedModalIndex(index);
                              if (!isNilStock) handleMedicineSelect(medicine);
                            }}
                            onDoubleClick={() => {
                              if (!isNilStock) {
                                handleSelectMedicineAndClose(medicine);
                              }
                            }}
                            onMouseEnter={() => setHighlightedModalIndex(index)}
                          >
                            <Td style={{ textAlign: "center", verticalAlign: "middle" }} onClick={e => e.stopPropagation()}>
                              <ModalCheckbox
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => { if (!isNilStock) handleMedicineSelect(medicine); }}
                                disabled={isNilStock}
                                title={isNilStock ? "Out of stock — cannot select" : ""}
                                style={{ cursor: isNilStock ? "not-allowed" : "pointer", verticalAlign: "middle" }}
                              />
                            </Td>
                            <Td style={{ fontWeight: 500, verticalAlign: "middle" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ color: nameColor, fontWeight: nameColor ? 700 : 500 }}>{medicine.name}</span>
                                {medicine.dosage && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({medicine.dosage})</span>}
                                {isHighlighted && !isNilStock && (
                                  <span style={{
                                    fontSize: "0.68rem",
                                    background: "#0f766e",
                                    color: "#fff",
                                    borderRadius: 4,
                                    padding: "1px 6px",
                                    fontWeight: 700,
                                    letterSpacing: "0.02em",
                                    marginLeft: 6
                                  }}>
                                    ↵ Enter to select
                                  </span>
                                )}
                                {!isNilStock && isLowStock && (
                                  <>
                                    <BlinkDot />
                                    <span style={{
                                      fontSize: "0.7rem", fontWeight: 700, color: "#b45309",
                                      background: "#fff7ed", border: "1px solid #fdba74",
                                      borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap"
                                    }}>LOW STOCK</span>
                                  </>
                                )}
                                {!isNilStock && isLowStock && medicine.reorder_level != null && (
                                  <span style={{
                                    fontSize: "0.7rem", fontWeight: 700, color: "#0f766e",
                                    background: "#f0fdfa", border: "1px solid #99f6e4",
                                    borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap"
                                  }}>RL{medicine.reorder_level}</span>
                                )}
                              </div>
                            </Td>
                            <Td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>{medicine.batch_number || "—"}</Td>
                            <Td style={{ fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                              {formatExpiryDate(medicine.expiry_date)}
                            </Td>
                            <Td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>₹{Number(medicine.mrp || 0).toFixed(2)}</Td>
                            <Td style={{ textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                              <StockBadge
                                low={isNilStock}
                                style={
                                  isNilStock
                                    ? { background: "#fef2f2", color: "#dc2626", fontWeight: 700, border: "1px solid #fecaca" }
                                    : isLowStock
                                      ? { background: "#fff7ed", color: "#b45309", fontWeight: 700, border: "1px solid #fdba74" }
                                      : {}
                                }
                              >
                                {isNilStock ? "0 (Nil)" : medicine.available_stock ?? "—"}
                              </StockBadge>
                            </Td>
                            <Td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>{medicine.hsn_code || "—"}</Td>
                            <Td style={{ verticalAlign: "middle" }}>{medicine.composition_name || "—"}</Td>
                            <Td style={{ textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle" }}>{medicine.shelf_no || "—"}</Td>
                            <Td style={{ textAlign: "center", whiteSpace: "nowrap", verticalAlign: "middle" }}>{medicine.rack_no || "—"}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrapper>
              )}
            </ModalBody>
            <ModalFooterBar style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              {/* ── Legend ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {[
                  { color: "#b91c1c", label: "High Risk Medicine" },
                  { color: "#92400e", label: "LA (Look-Alike Medicine)" },
                  { color: "#166534", label: "SA (Sound-Alike Medicine)" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: "0.75rem", color, fontWeight: 700 }}>A</span>
                    <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
              {/* ── Pagination ── */}
              {modalTotalPages > 1 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
                  <ModalPaginationBtn
                    $isNav
                    onClick={() => setModalPage(1)}
                    disabled={safeModalPage === 1}
                    title="First Page"
                  >
                    <FaAngleDoubleLeft style={{ fontSize: "0.8rem" }} />
                  </ModalPaginationBtn>

                  <ModalPaginationBtn
                    $isNav
                    onClick={() => setModalPage(p => Math.max(1, p - 1))}
                    disabled={safeModalPage === 1}
                    title="Previous Page"
                  >
                    <FaChevronLeft style={{ fontSize: "0.72rem" }} />
                    <span>Previous</span>
                  </ModalPaginationBtn>

                  {getModalPageNumbers(safeModalPage, modalTotalPages).map((pg, idx) =>
                    pg === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{
                          width: 28,
                          height: 34,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          userSelect: "none"
                        }}
                      >
                        …
                      </span>
                    ) : (
                      <ModalPaginationBtn
                        key={pg}
                        $active={pg === safeModalPage}
                        onClick={() => setModalPage(pg)}
                        title={`Page ${pg}`}
                      >
                        {pg}
                      </ModalPaginationBtn>
                    )
                  )}

                  <ModalPaginationBtn
                    $isNav
                    onClick={() => setModalPage(p => Math.min(modalTotalPages, p + 1))}
                    disabled={safeModalPage === modalTotalPages}
                    title="Next Page"
                  >
                    <span>Next</span>
                    <FaChevronRight style={{ fontSize: "0.72rem" }} />
                  </ModalPaginationBtn>

                  <ModalPaginationBtn
                    $isNav
                    onClick={() => setModalPage(modalTotalPages)}
                    disabled={safeModalPage === modalTotalPages}
                    title="Last Page"
                  >
                    <FaAngleDoubleRight style={{ fontSize: "0.8rem" }} />
                  </ModalPaginationBtn>
                </div>
              ) : <div />}
              {/* ── Action Buttons ── */}
              <div style={{ display: "flex", gap: 10 }}>
                <Button secondary onClick={handleModalCloseAndClear}>
                  <FaTimes /> Close
                </Button>
                <Button
                  onClick={handleAddSelected}
                  disabled={selectedMedicines.length === 0}
                >
                  Add Selected ({selectedMedicines.length})
                </Button>
              </div>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelModal && (
        <ConfirmModalOverlay>
          <ConfirmBox>
            <h4>⚠ Cancel Entries?</h4>
            <p>Current entries will be cancelled. Are you sure you want to continue?</p>
            <ConfirmBtns>
              <Button success onClick={handleCancelConfirm}>Yes, Cancel</Button>
              <Button secondary onClick={() => setShowCancelModal(false)}>Go Back</Button>
            </ConfirmBtns>
          </ConfirmBox>
        </ConfirmModalOverlay>
      )}

      {/* ── IP Number Search Modal ── */}
      {showIPModal && (
        <ModalOverlay onClick={() => setShowIPModal(false)}>
          <ModalContainer style={{ maxWidth: 980, width: "95%" }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Search by IP Number</ModalTitle>
              <CloseButton onClick={() => setShowIPModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 220px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                    IP Number <span style={{ fontWeight: 400, color: "#94a3b8" }}>(full e.g. S026/500009 or partial e.g. 500009)</span>
                  </label>
                  <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", boxShadow: "0 0 0 1px #e2e8f0" }}>
                    <Input
                      type="text"
                      placeholder="e.g. 500009 or S026/500009"
                      value={ipSearchInput}
                      onChange={e => setIpSearchInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleIPSearch()}
                      autoFocus
                      style={{ borderRadius: "10px 0 0 10px", borderRight: "none", flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleIPSearch()}
                      style={{
                        padding: "0 20px", background: "linear-gradient(135deg, #0f766e, #0d9488)",
                        color: "#fff", border: "1px solid #0f766e", borderRadius: "0 10px 10px 0",
                        cursor: "pointer", fontWeight: 600, fontSize: "0.88rem",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <FaSearch /> Search
                    </button>
                  </div>
                </div>
              </div>

              {ipSearchLoading ? (
                <NoResults style={{ color: "#0f766e" }}>
                  🔍 Searching admissions for "<strong>{ipSearchInput}</strong>"…
                </NoResults>
              ) : ipSearchResults.length === 0 ? (
                <NoResults>No admissions found. Enter an IP number above and press Search.</NoResults>
              ) : (
                <>
                  <ModalResultCount>
                    {ipSearchResults.length} admission{ipSearchResults.length !== 1 ? "s" : ""} found — click a row to select
                  </ModalResultCount>
                  <TableWrapper style={{ overflowX: "auto" }}>
                    <Table style={{ minWidth: 860, width: "100%" }}>
                      <thead>
                        <tr>
                          <Th style={{ width: 60, textAlign: "center" }}>Select</Th>
                          <Th style={{ minWidth: 120 }}>IP Number</Th>
                          <Th style={{ minWidth: 110 }}>UHID</Th>
                          <Th style={{ minWidth: 160 }}>Patient Name</Th>
                          <Th style={{ minWidth: 110 }}>Mobile</Th>
                          <Th style={{ minWidth: 130 }}>Room / Bed</Th>
                          <Th style={{ minWidth: 110, textAlign: "center" }}>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {ipSearchResults.map((adm, i) => {
                          const salutation = adm.salutation || "";
                          const fullName   = formatPatientName(salutation, adm.firstName, adm.lastName);
                          const mobile     = adm.mobilePhone || adm.mobile || "—";
                          const activeRoom = Array.isArray(adm.room_details)
                            ? adm.room_details.find(r => r.is_roomActive) : null;
                          const activeShift = Array.isArray(adm.roomShitingDetails)
                            ? adm.roomShitingDetails.find(r => r.is_roomActive) : null;
                          const roomLabel = activeRoom
                            ? `${activeRoom.roomNo} / Bed ${activeRoom.bedNo}`
                            : activeShift
                              ? `${activeShift.newRoomNo} / Bed ${activeShift.newBedNo}`
                              : "—";
                          const isAdmitted = adm.is_admitted && !adm.is_discharged;
                          return (
                            <Tr
                              key={i}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleIPSelect(adm)}
                            >
                              <Td style={{ textAlign: "center" }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: "50%",
                                  background: isAdmitted ? "#0f766e" : "#94a3b8",
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontSize: "0.9rem",
                                }} title={isAdmitted ? "Admitted" : "Discharged"}>✓</div>
                              </Td>
                              <Td style={{ fontWeight: 700, color: "#0f766e", fontFamily: "monospace", whiteSpace: "nowrap" }}>{adm.ipNumber || "—"}</Td>
                              <Td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{adm.uhid || "—"}</Td>
                              <Td>{fullName || "—"}</Td>
                              <Td style={{ whiteSpace: "nowrap" }}>{mobile}</Td>
                              <Td style={{ fontSize: "0.83rem", whiteSpace: "nowrap" }}>{roomLabel}</Td>
                              <Td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                <span style={{
                                  fontSize: "0.75rem", fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                                  background: isAdmitted ? "#f0fdf4" : "#fef2f2",
                                  color: isAdmitted ? "#15803d" : "#dc2626",
                                  border: `1px solid ${isAdmitted ? "#bbf7d0" : "#fecaca"}`,
                                  display: "inline-block",
                                  whiteSpace: "nowrap"
                                }}>
                                  {isAdmitted ? "Admitted" : "Discharged"}
                                </span>
                              </Td>
                            </Tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrapper>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#0f766e" }} />
                    <span style={{ fontSize: "0.8rem", color: "#475569" }}>Admitted</span>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#94a3b8", marginLeft: 12 }} />
                    <span style={{ fontSize: "0.8rem", color: "#475569" }}>Discharged</span>
                  </div>
                </>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── UHID Search Modal ── */}
      {showUHIDModal && (
        <ModalOverlay onClick={() => setShowUHIDModal(false)}>
          <ModalContainer style={{ maxWidth: 920, width: "95%" }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{uhidModalTitle || "Select Patient"}</ModalTitle>
              <CloseButton onClick={() => setShowUHIDModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>UHID</label>
                  <Input
                    type="text"
                    placeholder="e.g. 7987"
                    value={uhidSearchInput}
                    onChange={e => {
                      setUhidSearchInput(e.target.value);
                    }}
                    onKeyDown={e => e.key === "Enter" && handleUHIDSearch()}
                    autoFocus
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Name / Phone</label>
                  <Input
                    type="text"
                    placeholder="Name or phone"
                    value={uhidNamePhone}
                    onChange={e => setUhidNamePhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleUHIDSearch()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUHIDSearch()}
                  disabled={uhidSearchLoading}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    background: "#0f766e",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaSearch size={12} /> Search
                </button>
              </div>

              {uhidSearchLoading ? (
                <NoResults>Searching...</NoResults>
              ) : displayedUhidResults.length === 0 ? (
                <NoResults>No patients found. Try a different UHID or name.</NoResults>
              ) : (
                <>
                  <ModalResultCount>
                    Showing 1 to {displayedUhidResults.length} of {displayedUhidResults.length} entries
                  </ModalResultCount>
                  <TableWrapper style={{ overflowX: "auto" }}>
                    <Table style={{ minWidth: 800, width: "100%" }}>
                      <thead>
                        <tr>
                          <Th style={{ width: 60, textAlign: "center" }}>Action</Th>
                          <Th style={{ minWidth: 120 }}>UHID No</Th>
                          <Th style={{ minWidth: 160 }}>Patient</Th>
                          <Th style={{ minWidth: 120 }}>Mobile</Th>
                          <Th style={{ minWidth: 130, textAlign: "center" }}>Admission Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedUhidResults.map((p, i) => {
                          const fullName = formatPatientName(p.salutation, p.firstName, p.lastName);
                          const uhidNo = p.uhid || p.UHID || "";
                          const mobile = p.mobilePhone || p.mobile || p.phone || p.mobileNumber || "";
                          const admInfo = admissionStatusMap[uhidNo];
                          const isAdmitted = admInfo !== undefined
                            ? admInfo.admitted
                            : (typeof p.is_admitted === "boolean" ? p.is_admitted : Boolean(p.ip_number));

                          return (
                            <Tr
                              key={i}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleUHIDSelect(p)}
                            >
                              <Td style={{ textAlign: "center" }}>
                                <div
                                  style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: isAdmitted ? "#0f766e" : "#64748b",
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontSize: "0.85rem", cursor: "pointer"
                                  }}
                                  title={isAdmitted ? "Admitted - Select" : "Not Admitted - Select"}
                                >
                                  ✓
                                </div>
                              </Td>
                              <Td style={{ fontWeight: 600 }}>{uhidNo}</Td>
                              <Td>{fullName || "—"}</Td>
                              <Td>{mobile || "—"}</Td>
                              <Td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 12px",
                                    borderRadius: "14px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    background: isAdmitted ? "#dcfce7" : "#f1f5f9",
                                    color: isAdmitted ? "#15803d" : "#64748b",
                                    border: `1px solid ${isAdmitted ? "#86efac" : "#cbd5e1"}`,
                                  }}
                                >
                                  {isAdmitted ? "Admitted" : "Not Admitted"}
                                </span>
                              </Td>
                            </Tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrapper>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#15803d" }} />
                      <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>Admitted</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#64748b" }} />
                      <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>Not Admitted</span>
                    </div>
                  </div>
                </>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Payment Mode Modal ── */}
      {showPaymentModal && (() => {
        const activeOutlet = String(
          localStorage.getItem("selected_outlet") ||
          localStorage.getItem("outlet_code") ||
          ""
        ).trim().toUpperCase();

        const paymentOptions = [
          { value: "cash", label: "Pay Now", desc: "Patient pays immediately (Cash / Card / UPI)" },
          { value: "credit", label: "Pay Later", desc: "Bill on credit — patient pays at a later date" },
        ].filter(opt => {
          // If selected_outlet is OLET001 / 1: display only Pay Later
          if (activeOutlet === "OLET001" || activeOutlet === "1") {
            return opt.value === "credit";
          }
          // If selected_outlet is OLET002 / 2: display Pay Now and Pay Later
          return true;
        });

        return (
          <ModalOverlay onClick={() => setShowPaymentModal(false)}>
            <ModalContainer style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <ModalHeader style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
                <ModalTitle style={{ color: "#fff" }}>Select Payment Mode</ModalTitle>
                <CloseButton onClick={() => setShowPaymentModal(false)} style={{ color: "#fff" }}>×</CloseButton>
              </ModalHeader>
              <ModalBody style={{ padding: "32px 36px" }}>
                <div style={{ marginBottom: 24, color: "#475569", fontSize: "0.93rem" }}>
                  {(activeOutlet === "OLET001" || activeOutlet === "1")
                    ? "IP Pharmacy billing mode (Pay Later):"
                    : "Choose how the patient will pay for this bill:"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {paymentOptions.map(opt => (
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
                        name="paymentMode"
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
              </ModalBody>
              <ModalFooterBar style={{ justifyContent: "flex-end", gap: 10 }}>
                <Button secondary onClick={() => setShowPaymentModal(false)}>
                  <FaTimes /> Cancel
                </Button>
                <Button
                  disabled={saving}
                  onClick={async () => {
                    const finalMode = (activeOutlet === "OLET001" || activeOutlet === "1") ? "credit" : (selectedPaymentMode || "cash");
                    setShowPaymentModal(false);
                    await executeSave(pendingBillIntent, finalMode);
                  }}
                  style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff", border: "none", opacity: saving ? 0.7 : 1 }}
                >
                  <FaSave /> {saving ? "Saving…" : "Confirm & Save Bill"}
                </Button>
              </ModalFooterBar>
            </ModalContainer>
          </ModalOverlay>
        );
      })()}

      {/* ── Print Modal ── */}
      {showPrintModal && printBillData && (
        <ModalOverlay onClick={() => { setShowPrintModal(false); focusMedicineSearch(); }}>
          <ModalContainer style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
            <ModalHeader style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
              <ModalTitle style={{ color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <FaPrint /> Bill Saved — Ready to Print
              </ModalTitle>
              <CloseButton onClick={() => { setShowPrintModal(false); focusMedicineSearch(); }} style={{ color: "#fff" }}>×</CloseButton>
            </ModalHeader>
            <ModalBody style={{ padding: "0" }}>
              {/* Bill Preview (A5 Alignment Sheet Layout with Multi-Page Support) */}
              {(() => {
                const previewPages = chunkMedicinesForPrint(printBillData.medicines);
                const totalPreviewPages = previewPages.length;

                return (
                  <div style={{ padding: "16px 20px", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11.5, color: "#111", background: "#f8fafc", lineHeight: 1.35 }}>
                    {previewPages.map((pageMeds, pageIdx) => {
                      const isLastPage = pageIdx === totalPreviewPages - 1;

                      return (
                        <div
                          key={pageIdx}
                          style={{
                            background: "#ffffff",
                            padding: "14px 18px",
                            marginBottom: isLastPage ? 0 : 20,
                            borderRadius: 6,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          {/* Top Header: Logo on left, Hospital details directly next to it */}
                          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 3 }}>
                            <img
                              src={SummaryHead}
                              alt="Shanmuga Hospital Limited"
                              style={{ maxHeight: 48, objectFit: "contain", display: "block" }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "#005b8e", letterSpacing: 0.5, textTransform: "uppercase" }}>
                                SHANMUGA HOSPITAL LIMITED
                              </div>
                              <div style={{ fontSize: 11, color: "#222", marginTop: 1 }}>
                                51/24.Saradha College Road, Salem - 636007
                              </div>
                              <div style={{ fontSize: 11, color: "#222" }}>
                                Ph No: 04272706666
                              </div>
                            </div>
                            {totalPreviewPages > 1 && (
                              <div style={{ textAlign: "right" }}>
                                <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, color: "#005b8e", background: "#e0f2fe", padding: "2px 8px", borderRadius: 4, border: "1px solid #bae6fd" }}>
                                  Page {pageIdx + 1} of {totalPreviewPages}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Divider Line */}
                          <div style={{ borderTop: "1px solid #111", margin: "3px 0" }} />

                          {/* DL NO, CIN on left | Duplicate & Bill Type in Center | GST NO, Invoice Type on Right */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11, fontWeight: 600, lineHeight: 1.35, padding: "2px 0" }}>
                            <div>
                              <div>
                                {(() => {
                                  const billOut = String(printBillData.outlet_code || printBillData.outletCode || printBillData.outlet || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "").trim().toUpperCase();
                                  return (billOut === "OLET001" || billOut === "1" || billOut.includes("OLET001"))
                                    ? "DL NO : TN/SLE/20/01107"
                                    : "DL NO : TN/SLE/20/01109";
                                })()}
                              </div>
                              <div>CIN : L85110TZ2020PLC033974</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              {printBillData.isDuplicate && (
                                <div style={{ fontSize: 11, fontStyle: "italic", color: "#333", fontWeight: 700 }}>*** Duplicate ***</div>
                              )}
                              <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>
                                {(() => {
                                  const pm = String(printBillData.payment_mode || printBillData.paymentMode || printBillData.payment_method || "").toLowerCase();
                                  const bm = String(printBillData.billing_mode || printBillData.billingMode || "").toUpperCase();
                                  const isCredit = pm.includes("credit") || bm.includes("CREDIT") || bm.includes("REQUEST") || bm.includes("WARD") || bm.includes("OT");
                                  return isCredit ? "CREDIT BILL" : "CASH BILL";
                                })()}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 800, fontSize: 12.5, color: "#111" }}>
                                {(() => {
                                  const billOut = String(printBillData.outlet_code || printBillData.outletCode || printBillData.outlet || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "").trim().toUpperCase();
                                  if (billOut === "OLET001" || billOut === "1" || billOut.includes("OLET001")) return "PHARMACY IP GST INVOICE";
                                  if (billOut === "OLET002" || billOut === "2" || billOut.includes("OLET002")) return "PHARMACY OP GST INVOICE";
                                  if (Boolean(printBillData.inpatientNumber || printBillData.inpatient_number || printBillData.ipNumber || printBillData.ip_number)) return "PHARMACY IP GST INVOICE";
                                  const btn = String(printBillData.billTypeName || printBillData.bill_type_name || "").toUpperCase();
                                  const bm = String(printBillData.billing_mode || printBillData.billingMode || "").toUpperCase();
                                  if (btn.includes("IP") || bm.includes("REQUEST") || bm.includes("WARD") || bm.includes("OT")) return "PHARMACY IP GST INVOICE";
                                  return "PHARMACY OP GST INVOICE";
                                })()}
                              </div>
                              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <span>GST NO : 33ABDCS8326A1ZP</span>
                              </div>
                            </div>
                          </div>

                          {/* Divider Line */}
                          <div style={{ borderTop: "1px solid #111", margin: "3px 0" }} />

                          {/* Patient & Bill Details */}
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 11.5, padding: "2px 0 3px 0" }}>
                            <div style={{ flex: 1.15, display: "grid", gridTemplateColumns: "82px 10px 1fr", rowGap: 2, alignItems: "baseline" }}>
                              <span style={{ color: "#222" }}>Patient</span><span>:</span><span style={{ fontWeight: 700 }}>{printBillData.patientName || "—"}</span>
                              <span style={{ color: "#222" }}>UHID No</span><span>:</span><span>{printBillData.uhid || "—"}</span>
                              {(printBillData.inpatientNumber || printBillData.inpatient_number || printBillData.ipNumber) && (
                                <>
                                  <span style={{ color: "#222" }}>IP Number</span><span>:</span><span>{printBillData.inpatientNumber || printBillData.inpatient_number || printBillData.ipNumber}</span>
                                </>
                              )}
                              <span style={{ color: "#222" }}>Doctor</span><span>:</span><span>{printBillData.doctorName || "—"}</span>
                            </div>
                            <div style={{ flex: 0.85, display: "grid", gridTemplateColumns: "72px 10px 1fr", rowGap: 2, alignItems: "baseline" }}>
                              <span style={{ color: "#222" }}>Bill No</span><span>:</span><span style={{ fontWeight: 700 }}>{printBillData.billNo || "—"}</span>
                              <span style={{ color: "#222" }}>Date</span><span>:</span><span>
                                {(() => {
                                  const raw = printBillData.billDate;
                                  if (!raw || raw === "—") return "—";
                                  try {
                                    const s = String(raw).trim();
                                    const iso = s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s) ? s + "Z" : s;
                                    const d = new Date(iso);
                                    if (!isNaN(d.getTime())) {
                                      return d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
                                    }
                                  } catch (e) {}
                                  return String(raw).split(" ")[0];
                                })()}
                                &nbsp;&nbsp;
                                {(() => {
                                  const raw = printBillData.billDate;
                                  if (!raw || raw === "—") return "—";
                                  try {
                                    const s = String(raw).trim();
                                    if (/^\d{1,2}:\d{2}(?::\d{2})?(\s*[AaPp][Mm])?$/.test(s)) return s;
                                    const iso = s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s) ? s + "Z" : s;
                                    const d = new Date(iso);
                                    if (!isNaN(d.getTime())) {
                                      return d.toLocaleTimeString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: false
                                      });
                                    }
                                  } catch (e) {}
                                  return new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
                                })()}
                              </span>
                              {(printBillData.roomNo || printBillData.room || printBillData.room_no) && (
                                <>
                                  <span style={{ color: "#222" }}>Room</span><span>:</span><span>{printBillData.roomNo || printBillData.room || printBillData.room_no}</span>
                                </>
                              )}
                              {(printBillData.insuranceName || printBillData.insurance_company || printBillData.insurance_name) && (
                                <>
                                  <span style={{ color: "#222" }}>Insurance</span><span>:</span><span>{printBillData.insuranceName || printBillData.insurance_company || printBillData.insurance_name}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Medicines Table */}
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, margin: "2px 0" }}>
                            <thead>
                              <tr style={{ borderTop: "1px solid #111" }}>
                                <th rowSpan={2} style={{ textAlign: "left", padding: "3px 4px", color: "#111", fontWeight: 700, fontSize: 10.5, width: 180 }}>Particulars</th>
                                <th rowSpan={2} style={{ width: 70, textAlign: "center", padding: 3, color: "#111", fontWeight: 700, fontSize: 10.5 }}>HSN Code</th>
                                <th rowSpan={2} style={{ width: 75, textAlign: "center", padding: 3, color: "#111", fontWeight: 700, fontSize: 10.5 }}>Batch</th>
                                <th rowSpan={2} style={{ width: 60, textAlign: "center", padding: 3, color: "#111", fontWeight: 700, fontSize: 10.5 }}>Expiry</th>
                                <th rowSpan={2} style={{ width: 35, textAlign: "center", padding: 3, color: "#111", fontWeight: 700, fontSize: 10.5 }}>Qty</th>
                                <th rowSpan={2} style={{ width: 55, textAlign: "right", padding: "3px 4px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>Rate</th>
                                <th colSpan={2} style={{ textAlign: "center", padding: "2px 3px", borderBottom: "1px solid #888", color: "#111", fontWeight: 700, fontSize: 10.5 }}>CGST</th>
                                <th colSpan={2} style={{ textAlign: "center", padding: "2px 3px", borderBottom: "1px solid #888", color: "#111", fontWeight: 700, fontSize: 10.5 }}>SGST</th>
                                <th rowSpan={2} style={{ width: 70, textAlign: "right", padding: "3px 4px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>Amount</th>
                              </tr>
                              <tr style={{ borderBottom: "1px solid #111" }}>
                                <th style={{ width: 30, textAlign: "center", padding: "2px 3px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>%</th>
                                <th style={{ width: 45, textAlign: "right", padding: "2px 3px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>Amt</th>
                                <th style={{ width: 30, textAlign: "center", padding: "2px 3px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>%</th>
                                <th style={{ width: 45, textAlign: "right", padding: "2px 3px", color: "#111", fontWeight: 700, fontSize: 10.5 }}>Amt</th>
                              </tr>
                            </thead>
                            <tbody style={{ borderBottom: "1px solid #111" }}>
                              {pageMeds.map((m, i) => {
                                const pricing = calculateMedicinePricing(m);
                                const rate = pricing.mrp;
                                return (
                                  <tr key={i}>
                                    <td style={{ padding: "2.5px 4px", fontWeight: 500, maxWidth: 185, wordBreak: "break-word", lineHeight: 1.25 }}>{m.name || m.item_name || "—"}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center", whiteSpace: "nowrap" }}>{m.hsn_code || "—"}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center", whiteSpace: "nowrap" }}>{m.batch_number || m.batch || "—"}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center", whiteSpace: "nowrap" }}>{formatExpiryDate(m.expiry_date || m.expiry)}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center", fontWeight: 700 }}>{pricing.qty}</td>
                                    <td style={{ padding: "2.5px 4px", textAlign: "right", whiteSpace: "nowrap" }}>{rate.toFixed(2)}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center" }}>{pricing.cgstRate}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "right", whiteSpace: "nowrap" }}>{pricing.cgstAmt.toFixed(2)}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "center" }}>{pricing.sgstRate}</td>
                                    <td style={{ padding: "2.5px 3px", textAlign: "right", whiteSpace: "nowrap" }}>{pricing.sgstAmt.toFixed(2)}</td>
                                    <td style={{ padding: "2.5px 4px", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{pricing.lineTotal.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Continuation indicator OR Totals & Footer */}
                          {!isLastPage ? (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #111", padding: "4px 2px", marginTop: 4, fontSize: 11, fontStyle: "italic", color: "#444" }}>
                              <span>Continued on Page {pageIdx + 2}...</span>
                              <span style={{ fontWeight: 700, fontStyle: "normal", color: "#005b8e" }}>Page {pageIdx + 1} of {totalPreviewPages}</span>
                            </div>
                          ) : (
                            <>
                              {/* Totals & Payment */}
                              {(() => {
                                const previewGross = (printBillData.medicines || []).reduce((sum, m) => {
                                  const qty = Number(m.quantity || m.qty || 0);
                                  const price = Number(m.mrp || m.price || m.Selling_Price || m.selling_price || 0);
                                  return sum + (qty * price);
                                }, 0) || Number(printBillData.totalAmount || 0);

                                const previewItemDisc = (printBillData.medicines || []).reduce((sum, m) => {
                                  const pricing = calculateMedicinePricing(m);
                                  return sum + pricing.totalDiscountOnMrp;
                                }, 0);

                                const itemDiscSum = Number(printBillData.totalItemDiscount) || previewItemDisc;
                                const baseForOverall = Math.max(0, previewGross - itemDiscSum);
                                const previewOverallDisc = printBillData.overallDiscountType === "amount"
                                  ? parseFloat(printBillData.overallDiscountValue || 0)
                                  : baseForOverall * (parseFloat(printBillData.overallDiscountValue || 0) / 100);

                                const previewTotalDisc = Math.max(
                                  0,
                                  itemDiscSum + previewOverallDisc,
                                  Number(printBillData.totalDiscount || 0),
                                  Number(printBillData.discount_amount || 0),
                                  Number(printBillData.discount || 0)
                                );

                                const isPreviewOverallPct = printBillData.overallDiscountType === "percent" && parseFloat(printBillData.overallDiscountValue || 0) > 0;
                                const previewPctLabel = isPreviewOverallPct
                                  ? ` (${parseFloat(printBillData.overallDiscountValue)}%)`
                                  : "";

                                const previewCgst = (printBillData.medicines || []).reduce((sum, m) => {
                                  const pricing = calculateMedicinePricing(m);
                                  return sum + (isNaN(pricing.cgstAmt) ? 0 : pricing.cgstAmt);
                                }, 0);

                                const previewSgst = (printBillData.medicines || []).reduce((sum, m) => {
                                  const pricing = calculateMedicinePricing(m);
                                  return sum + (isNaN(pricing.sgstAmt) ? 0 : pricing.sgstAmt);
                                }, 0);

                                const previewTax = previewCgst + previewSgst;

                                const netPayable = Number(printBillData.netAmount || 0) > 0
                                  ? Number(printBillData.netAmount)
                                  : Math.max(0, previewGross - previewTotalDisc);

                                return (
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 }}>
                                    <div style={{ fontSize: 11, color: "#111", lineHeight: 1.35, maxWidth: 360, paddingTop: 2 }}>
                                      <span style={{ fontWeight: 700 }}>Rupees in Words:</span>
                                      <div style={{ fontStyle: "italic", fontWeight: 600, color: "#1e293b", textTransform: "capitalize", marginTop: 1 }}>
                                        {numberToWords(netPayable)}
                                      </div>
                                    </div>

                                    <table style={{ borderCollapse: "collapse", marginLeft: "auto", fontSize: 11.5 }}>
                                      <tbody>
                                        <tr>
                                          <td style={{ padding: "1.5px 12px 1.5px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>Total CGST Amt :</td>
                                          <td style={{ padding: "1.5px 0", textAlign: "right", fontWeight: 700, minWidth: 72 }}>
                                            {previewCgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style={{ padding: "1.5px 12px 1.5px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>Total SGST Amt :</td>
                                          <td style={{ padding: "1.5px 0", textAlign: "right", fontWeight: 700, minWidth: 72 }}>
                                            {previewSgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style={{ padding: "1.5px 12px 1.5px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>Total :</td>
                                          <td style={{ padding: "1.5px 0", textAlign: "right", fontWeight: 700, minWidth: 72 }}>
                                            {previewGross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style={{ padding: "1.5px 12px 1.5px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                                            {previewTotalDisc > 0 ? `Discount Amt${previewPctLabel}:` : "Discount :"}
                                          </td>
                                          <td style={{ padding: "1.5px 0", textAlign: "right", fontWeight: 700, minWidth: 72 }}>
                                            {previewTotalDisc.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style={{ padding: "2.5px 12px 2.5px 0", textAlign: "right", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" }}>Net Amount (Payable) :</td>
                                          <td style={{ padding: "2.5px 0", textAlign: "right", fontWeight: 800, fontSize: 12.5, minWidth: 72 }}>
                                            {netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })()}

                              {/* Divider Line Above Footer */}
                              <div style={{ borderTop: "1px solid #111", margin: "4px 0 3px 0" }} />

                              {/* Footer: E & OE on left, Prepared by, Goods once sold in center, Sign on right */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: 11, padding: "2px 0" }}>
                                <div style={{ fontWeight: 700, width: 75 }}>E &amp; OE</div>
                                <div style={{ textAlign: "left", width: 180 }}>Prepared by : {printBillData.employeeName || printBillData.cashierId || "—"}</div>
                                <div style={{ textAlign: "center", flex: 1, fontStyle: "italic", color: "#222" }}>"Goods once sold will not taken back"</div>
                                <div style={{ textAlign: "right", width: 140 }}>(Sign-pharmacist)</div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </ModalBody>
            {/* Modal Footer Actions */}
            <ModalFooterBar style={{ justifyContent: "flex-end", gap: 10 }}>
              <Button secondary onClick={() => { setShowPrintModal(false); focusMedicineSearch(); }}>
                <FaTimes /> Close
              </Button>
              <Button
                onClick={() => {
                  const html = buildPrintBillHtml(printBillData);
                  executeBillPrint(html);
                }}
                style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff", border: "none" }}
              >
                <FaPrint /> Print Bill
              </Button>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
};

export default Pharmacy;