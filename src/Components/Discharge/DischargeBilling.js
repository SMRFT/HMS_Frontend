import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes, createGlobalStyle } from "styled-components";

import DischargeViewBills from "./DischargeViewBills";
import DischargeViewEstimates from "./DischargeViewEstimates";

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
const PageWrap = styled.div`min-height:100vh;background:${T.bg};`;
const AppBar = styled.header`
  background:${T.primary};height:50px;padding:0 24px;
  display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:200;box-shadow:0 2px 8px rgba(0,0,0,0.15);
`;
const AppTitle = styled.div`color:#fff;font-weight:700;font-size:0.92rem;display:flex;align-items:center;gap:8px;`;
const Crumb = styled.div`color:rgba(255,255,255,0.75);font-size:0.75rem;`;
const Content = styled.div`
  max-width:1400px;margin:0 auto;padding:16px;
  @media (max-width:600px){padding:8px;}
`;

const TabBar = styled.div`
  display:flex;gap:4px;margin-bottom:16px;
  background:${T.surface};border:1px solid ${T.border};
  border-radius:${T.radius};padding:4px;width:fit-content;
  box-shadow:${T.shadow};
`;
const Tab = styled.button`
  padding:8px 20px;border:none;border-radius:6px;cursor:pointer;
  font-size:0.83rem;font-weight:600;transition:all 0.15s;display:flex;align-items:center;gap:6px;
  background:${p => p.$active ? T.primary : "transparent"};
  color:${p => p.$active ? "#fff" : T.textMid};
  &:hover{background:${p => p.$active ? T.primary : T.bg};}
`;

const Card = styled.div`
  background:${T.surface}; border:1px solid ${T.border};
  border-radius:10px; box-shadow:${T.shadow};
  margin-bottom:16px; overflow:hidden; animation:${fadeUp} 0.2s ease;
  transition: box-shadow 0.2s ease;
  &:hover { box-shadow: ${T.shadowMd}; }
`;
const CardHead = styled.div`
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom:1px solid ${T.border}; padding:12px 18px;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;
`;
const CardTitle = styled.span`
  font-size:0.75rem; font-weight:800; text-transform:uppercase;
  letter-spacing:0.7px; color:${T.primary};
  display:flex; align-items:center; gap:8px;
  &::before {
    content:''; display:inline-block; width:4px; height:14px;
    background:${T.primary}; border-radius:2px;
  }
`;

const Badge = styled.span`
  display:inline-flex;align-items:center;padding:3px 10px;
  border-radius:20px;font-size:0.68rem;font-weight:700;
  background:${p => ({ estimate: "#fef3c7", billed: "#dcfce7", pending: "#dbeafe", manual: "#f1f5f9", converting: "#ede9fe" }[p.$v] || "#f1f5f9")};
  color:${p => ({ estimate: T.amber, billed: T.success, pending: T.blue, manual: T.textMuted, converting: "#7c3aed" }[p.$v] || T.textMuted)};
`;

const Toast = styled.div`
  position:fixed;top:14px;right:16px;z-index:9999;
  padding:10px 18px;border-radius:${T.radius};color:#fff;
  font-weight:600;font-size:0.84rem;max-width:380px;
  background:${p => p.$err ? T.danger : T.success};
  box-shadow:${T.shadowMd};animation:${slideDown} 0.2s ease;
`;

const ConvertBanner = styled.div`
  display:flex;align-items:flex-start;gap:12px;
  padding:12px 16px;margin-bottom:12px;
  background:#ede9fe;border:1.5px solid #7c3aed;
  border-radius:${T.radius};color:#5b21b6;
  animation:${slideDown} 0.25s ease;
`;

const SearchBar = styled.div`
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;
  padding:16px;background:#fafafa;border-bottom:1px solid ${T.border};align-items:flex-end;
`;
const FG = styled.div`display:flex;flex-direction:column;gap:4px;width:100%;`;
const FL = styled.label`font-size:0.68rem;font-weight:700;color:${T.textMid};text-transform:uppercase;letter-spacing:0.4px;`;
const Req = styled.span`color:${T.danger};margin-left:2px;`;
const FInput = styled.input`
  height:34px;padding:0 10px;font-size:0.83rem;box-sizing:border-box;width:100%;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:#fff;color:${T.textMain};transition:border 0.12s,box-shadow 0.12s;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
  &[type=date]{cursor:pointer;}
  &::placeholder{color:${T.textMuted};}
`;
const FSelect = styled.select`
  height:34px;padding:0 10px;font-size:0.83rem;box-sizing:border-box;width:100%;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:#fff;color:${T.textMain};transition:border 0.12s;cursor:pointer;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
  &:disabled{background:#f8fafc;color:${T.textMuted};cursor:not-allowed;}
`;

const Btn = styled.button`
  height:${p => p.$sm ? "32px" : "38px"};padding:0 ${p => p.$sm ? "14px" : "20px"};
  border-radius:6px;font-size:${p => p.$sm ? "0.78rem" : "0.84rem"};
  font-weight:700;cursor:pointer;border:1.5px solid transparent;
  display:inline-flex;align-items:center;gap:6px;transition:all 0.13s;
  ${p => p.$primary && `background:${T.primary};color:#fff;border-color:${T.primary};`}
  ${p => p.$amber && `background:${T.amber};color:#fff;border-color:${T.amber};`}
  ${p => p.$ghost && `background:#f1f5f9;color:${T.textMid};border-color:${T.border};`}
  ${p => p.$purple && `background:#7c3aed;color:#fff;border-color:#7c3aed;`}
  &:hover{opacity:0.9;} &:disabled{opacity:0.45;cursor:not-allowed;}
`;
const IconBtn = styled.button`
  width:36px;height:34px;border-radius:6px;border:none;flex-shrink:0;
  background:${T.primary};color:#fff;cursor:pointer;font-size:0.9rem;
  display:flex;align-items:center;justify-content:center;transition:opacity 0.12s;
  &:hover{opacity:0.88;} &:disabled{opacity:0.5;cursor:not-allowed;}
`;
const Spinner = styled.div`
  width:14px;height:14px;border:2px solid rgba(255,255,255,0.35);
  border-top-color:#fff;border-radius:50%;animation:${spin} 0.6s linear infinite;
`;
const MiniSpinner = styled.div`
  width:10px;height:10px;border:2px solid #94a3b8;
  border-top-color:${T.primary};border-radius:50%;
  animation:${spin} 0.6s linear infinite;display:inline-block;
`;

const SearchDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 16px;
  align-items: start;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 12px;
  }
`;

// ─── Patient grid ─────────────────────────────────────────────────────────────
const PGrid = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
  background:${T.border}; border-radius: 8px; overflow: hidden;
  @media(max-width:1200px){grid-template-columns:repeat(2,1fr);}
  @media(max-width:520px){grid-template-columns:1fr;}
`;
const PCell = styled.div`
  background:#fff;padding:10px 14px;display:flex;flex-direction:column;justify-content:center;
`;
const PLbl = styled.div`font-size:0.65rem;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.5px;`;
const PVal = styled.div`font-size:0.85rem;font-weight:600;color:${T.textMain};margin-top:3px;word-break:break-word;`;

// ─── Items table ──────────────────────────────────────────────────────────────
const TScrollWrap = styled.div`
  overflow-x:auto; overflow-y:visible; width:100%;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
const ITable = styled.table`width:100%;border-collapse:collapse;font-size:0.8rem;min-width:1080px;table-layout:fixed;`;
const ITHead = styled.thead`background:#f8fafc;`;
const ITH = styled.th`
  padding:10px 10px;text-align:${p => p.$align || "left"};font-size:0.66rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.5px;color:${T.textMid};
  border-bottom:2px solid ${T.border};white-space:nowrap;box-sizing:border-box;
`;
const ITR = styled.tr`border-bottom:1px solid ${T.border};&:hover{background:#f8fafc;}`;
const AddRow = styled.tr`background:#fffdf5;border-bottom:2px solid ${T.amber};`;
const ITD = styled.td`padding:8px 10px;color:${T.textMain};vertical-align:middle;overflow:visible;position:relative;text-align:${p => p.$align || "left"};box-sizing:border-box;`;
const TInput = styled.input`
  width:100%;box-sizing:border-box;height:32px;padding:4px 8px;font-size:0.8rem;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:${p => p.$ro ? "#f8fafc" : "#fff"};color:${p => p.$ro ? T.textMuted : T.textMain};
  text-align:${p => p.$align || "left"};transition:border 0.12s;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
`;
const TSelect = styled.select`
  width:100%;box-sizing:border-box;height:32px;padding:4px 6px;font-size:0.8rem;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:#fff;color:${T.textMain};cursor:pointer;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
`;
const EmptyRow = styled.div`text-align:center;padding:36px;color:${T.textMuted};font-size:0.86rem;`;

// ─── Item search autocomplete ─────────────────────────────────────────────────
const SuggestionItem = styled.div`
  padding:7px 10px;font-size:0.8rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid #f1f5f9;
  &:last-child{border-bottom:none;}
  &:hover{background:#e6f7f5;}
`;
const SugName = styled.span`font-weight:600;color:${T.textMain};`;
const SugPrice = styled.span`font-size:0.74rem;color:${T.success};font-weight:700;`;
const SugEmpty = styled.div`padding:10px;text-align:center;font-size:0.78rem;color:${T.textMuted};`;

// ─── Bill type bar ────────────────────────────────────────────────────────────
const BillTypeBar = styled.div`
  display:flex;align-items:center;gap:12px;flex-wrap:wrap;
  padding:10px 16px;background:#f0fdf4;border-bottom:1px solid #bbf7d0;
`;

// ─── Financials ───────────────────────────────────────────────────────────────
const FinGrid = styled.div`
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:${T.border};border-top:1px solid ${T.border};
  @media(max-width:960px){grid-template-columns:repeat(2,1fr);}
  @media(max-width:600px){grid-template-columns:1fr;}
`;
const FinCol = styled.div`
  background:#fff;padding:14px 16px;display:flex;flex-direction:column;gap:10px;
`;
const FinRow = styled.div`display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.8rem;`;
const FinLbl = styled.span`min-width:100px;color:${T.textMid};font-weight:600;font-size:0.76rem;flex-shrink:0;`;
const FinIn = styled.input`
  flex:1;height:32px;padding:0 10px;font-size:0.82rem;box-sizing:border-box;
  border:1px solid ${T.border};border-radius:6px;outline:none;text-align:right;min-width:0;
  background:${p => p.$ro ? "#f8fafc" : "#fff"};color:${T.textMain};
  font-weight:${p => p.$ro ? 600 : 400};transition:border 0.12s;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
  ${p => p.$net && `font-weight:700;color:${T.success};background:#f0fdf4;border-color:#86efac;font-size:0.92rem;`}
`;
const Rupee = styled.span`color:${T.textMuted};font-size:0.75rem;flex-shrink:0;`;
const FinActions = styled.div`
  display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 18px;
  background:#fafafa;border-top:1px solid ${T.border};flex-wrap:wrap;
  @media(max-width:600px){
    justify-content:stretch;
    & > button { flex:1; }
  }
`;
const ErrMsg = styled.div`color:${T.danger};font-size:0.78rem;padding:8px 16px;background:#fee2e2;border-bottom:1px solid #fecaca;display:flex;align-items:center;gap:6px;font-weight:600;`;

// ═════════════════════════════════════════════════════════════════════════════
// Constants & Helpers
// ═════════════════════════════════════════════════════════════════════════════

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount: "", sales_return: "", medicines: "", taxable: "", non_tax: "",
  gst_amount: "", discount_percent: "", discount_amount: "", disc_reason: "", remarks: "",
  bill_upto: new Date().toISOString().split("T")[0],
};
const EMPTY_ITEM = {
  itemName: "", quantity: 1, rate: "", discount: 0, amount: 0,
  doctor: "", doctor_fee: "", item_description: "", package_name: ""
};

const fmt = v => (parseFloat(v) || 0).toFixed(2);

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

const calcTotals = (items, f) => {
  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const itemDisc = items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0);
  const discPct = parseFloat(f.discount_percent) || 0;
  const discAmt = parseFloat(f.discount_amount) || (totalAmount * discPct / 100);
  const totalDisc = discAmt + itemDisc;
  const netAmount = Math.max(0,
    totalAmount
    + (parseFloat(f.gst_amount) || 0) + (parseFloat(f.medicines) || 0)
    - (parseFloat(f.advance_amount) || 0) - (parseFloat(f.sales_return) || 0)
    - totalDisc
  );
  return { totalAmount, itemDisc, discAmt, totalDisc, netAmount };
};

const buildPayload = (items, f, totals, status, patient, editReason = "") => ({
  status,
  uhid: patient?.uhid || null,
  ip_number: patient?.ip_number || null,
  items: items.map(({ _key, _fromInvest, ...r }) => r),
  total_amount: totals.totalAmount,
  advance_amount: parseFloat(f.advance_amount) || 0,
  sales_return: parseFloat(f.sales_return) || 0,
  medicines_amount: parseFloat(f.medicines) || 0,
  taxable_amount: parseFloat(f.taxable) || 0,
  non_tax_amount: parseFloat(f.non_tax) || 0,
  gst_amount: parseFloat(f.gst_amount) || 0,
  room_tax: parseFloat(f.room_tax) || 0,
  discount_percent: parseFloat(f.discount_percent) || 0,
  discount_amount: totals.discAmt,
  disc_reason: f.disc_reason || "",
  item_disc: totals.itemDisc,
  total_disc: totals.totalDisc,
  net_amount: totals.netAmount,
  remarks: f.remarks || "",
  edit_reason: editReason || "",
});

const recalcItem = (item, field, value) => {
  const u = { ...item, [field]: value };
  const qty = parseFloat(field === "quantity" ? value : u.quantity) || 0;
  const rate = parseFloat(field === "rate" ? value : u.rate) || 0;
  const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
  if (["quantity", "rate", "discount"].includes(field)) u.amount = Math.max(0, qty * rate - disc);
  return u;
};

const investToRow = it => {
  const qty = parseFloat(it.quantity) || 1;
  const rate = parseFloat(it.rate != null ? it.rate : (it.price || 0)) || 0;
  const disc = parseFloat(it.discount) || 0;
  const amt = it.amount != null ? parseFloat(it.amount) : Math.max(0, qty * rate - disc);
  return {
    itemName: it.itemName || "",
    quantity: qty,
    rate: rate,
    discount: disc,
    amount: amt,
    doctor: it.doctor || "",
    doctor_fee: it.doctor_fee || "",
    doctors: Array.isArray(it.doctors) ? it.doctors : [],
    surgeon_id: it.surgeon_id || "",
    anaesthetist_id: it.anaesthetist_id || "",
    anesthesia_id: it.anesthesia_id || "",
    additional_anaesthetists: it.additional_anaesthetists || null,
    additional_doctors: it.additional_doctors || null,
    bill_type: it.bill_type != null ? it.bill_type : "",
    billTypeNo: it.billTypeNo || "",
    item_description: it.billTypeNo || it.source || "",
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
  taxable: String(parseFloat(e.taxable_amount) || ""),
  non_tax: String(parseFloat(e.non_tax_amount) || ""),
  tpa_paid: "", sales_tax: "",
  gst_amount: String(parseFloat(e.gst_amount) || ""),
  room_tax: String(parseFloat(e.room_tax) || ""),
  cess: "", luxury_tax: "",
  discount_percent: String(parseFloat(e.discount_percent) || ""),
  discount_amount: String(parseFloat(e.discount_amount) || ""),
  disc_reason: e.disc_reason || "",
  remarks: e.remarks || "",
  bill_upto: e.bill_date
    ? new Date(e.bill_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
});

// ─── Normalise items from API ─────────────────────────────────────────────────
const normaliseItems = (list) =>
  (Array.isArray(list) ? list : []).map(it => {
    if (it.price != null) return it;
    const priceKey = Object.keys(it).find(
      k => k !== "itemName" && k !== "_id" && !isNaN(Number(k))
    );
    return { ...it, price: priceKey ? it[priceKey] : "" };
  });

// ═════════════════════════════════════════════════════════════════════════════
// ItemSearchInput
// ═════════════════════════════════════════════════════════════════════════════

const ItemSearchInput = ({ value, onChange, onSelect, disabled, allItems = [], itemsLoading = false, billTypeName = "" }) => {
  const [showSug, setShowSug] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 280 });
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const filtered = value.trim()
    ? allItems.filter(it => it.itemName?.toLowerCase().includes(value.trim().toLowerCase()))
    : allItems;

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

  const placeholder = itemsLoading ? "Loading items…" : allItems.length > 0 ? `Search ${allItems.length} items…` : "No items";

  return (
    <>
      <TInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
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
            width: Math.max(dropPos.width, 380),
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: "6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            zIndex: 99999,
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {!itemsLoading && allItems.length > 0 && (
            <div style={{
              padding: "5px 10px 4px", fontSize: "0.65rem", fontWeight: 700,
              color: T.surface, background: T.primary, borderRadius: "6px 6px 0 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>📋 {billTypeName || "Items"}</span>
              <span style={{ opacity: 0.8 }}>{value.trim() ? `${filtered.length} / ${allItems.length}` : `${allItems.length} items`}</span>
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
            <SugEmpty>{allItems.length === 0 ? `No items found` : `No match — try different keywords`}</SugEmpty>
          ) : (
            <>
              {value.trim() && filtered.length < allItems.length && (
                <div style={{ padding: "3px 10px", fontSize: "0.65rem", fontWeight: 600, color: T.textMuted, background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                  Showing {filtered.length} of {allItems.length} items
                </div>
              )}
              {filtered.map((s, i) => (
                <SuggestionItem
                  key={`${s.itemName}-${i}`}
                  onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <SugName>{s.itemName}</SugName>
                    {s.package_name && <span style={{ fontSize: "0.67rem", color: T.textMuted }}>{s.package_name}</span>}
                  </div>
                  {s.price != null && String(s.price) !== "0" && String(s.price) !== "" && (
                    <SugPrice>₹{parseFloat(s.price).toLocaleString("en-IN")}</SugPrice>
                  )}
                </SuggestionItem>
              ))}
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

const FinancialGrid = ({ f, onChange, totals }) => (
  <FinGrid>
    <FinCol>
      <FinRow><FinLbl>Total Amount</FinLbl><Rupee>₹</Rupee><FinIn $ro value={fmt(totals.totalAmount)} readOnly /></FinRow>
      <FinRow><FinLbl>Advance</FinLbl>     <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.advance_amount} onChange={e => onChange("advance_amount", e.target.value)} /></FinRow>
      <FinRow><FinLbl>Sales Return</FinLbl><Rupee>₹</Rupee><FinIn type="number" min={0} value={f.sales_return} onChange={e => onChange("sales_return", e.target.value)} /></FinRow>
      <FinRow><FinLbl>Medicines</FinLbl>   <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.medicines} onChange={e => onChange("medicines", e.target.value)} /></FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLbl>Taxable</FinLbl>  <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.taxable} onChange={e => onChange("taxable", e.target.value)} /></FinRow>
      <FinRow><FinLbl>Non Tax</FinLbl>  <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.non_tax} onChange={e => onChange("non_tax", e.target.value)} /></FinRow>
      <FinRow><FinLbl>GST</FinLbl>      <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.gst_amount} onChange={e => onChange("gst_amount", e.target.value)} /></FinRow>
      <FinRow><FinLbl>Remarks</FinLbl>  <FinIn value={f.remarks} onChange={e => onChange("remarks", e.target.value)} style={{ textAlign: "left" }} /></FinRow>
    </FinCol>
    <FinCol>
      <FinRow>
        <FinLbl>Discount %</FinLbl>
        <FinIn type="number" min={0} max={100} value={f.discount_percent}
          onChange={e => onChange("discount_percent", e.target.value)}
          placeholder="0%" style={{ textAlign: "right" }} />
      </FinRow>
      <FinRow>
        <FinLbl>Discount Amount</FinLbl>
        <Rupee>₹</Rupee>
        <FinIn type="number" min={0} value={f.discount_amount}
          onChange={e => onChange("discount_amount", e.target.value)}
          placeholder="0.00" />
      </FinRow>
      <FinRow><FinLbl>Disc Reason</FinLbl><FinIn value={f.disc_reason} onChange={e => onChange("disc_reason", e.target.value)} style={{ textAlign: "left" }} /></FinRow>
      <FinRow style={{ marginTop: 4, paddingTop: 6, borderTop: `1px dashed ${T.border}` }}>
        <FinLbl style={{ fontWeight: 700, color: T.primary, fontSize: "0.88rem" }}>Net Amount</FinLbl>
        <Rupee style={{ fontWeight: 700, color: T.success }}>₹</Rupee>
        <FinIn $ro $net value={fmt(totals.netAmount)} readOnly />
      </FinRow>
    </FinCol>
  </FinGrid>
);

// ═════════════════════════════════════════════════════════════════════════════
// ItemsSection
// ═════════════════════════════════════════════════════════════════════════════

const ItemsSection = ({
  items, newItem, onNIChange, onItemSelect, onAdd, onClear, onEdit, onRemove, disabled,
  doctors, billTypeNo, billTypeName, allItems, itemsLoading,
}) => (
  <TScrollWrap>
    <ITable>
      <ITHead>
        <tr>
          <ITH style={{ width: "40px" }} $align="center">#</ITH>
          <ITH style={{ width: "240px" }}>Item Name</ITH>
          <ITH style={{ width: "70px" }} $align="right">Qty</ITH>
          <ITH style={{ width: "95px" }} $align="right">Rate</ITH>
          <ITH style={{ width: "80px" }} $align="right">Disc</ITH>
          <ITH style={{ width: "105px" }} $align="right">Amount</ITH>
          <ITH style={{ width: "150px" }}>Doctor</ITH>
          <ITH style={{ width: "85px" }} $align="right">Dr.Fee</ITH>
          <ITH style={{ width: "140px" }}>Description</ITH>
          <ITH style={{ width: "100px" }} $align="center">Source</ITH>
          <ITH style={{ width: "60px" }} $align="center">Action</ITH>
        </tr>
      </ITHead>
      <tbody>
        <AddRow>
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
            />
          </ITD>
          <ITD><TInput $align="right" type="number" min={1} value={newItem.quantity} onChange={e => onNIChange("quantity", Number(e.target.value) || 1)} disabled={disabled} /></ITD>
          <ITD><TInput $align="right" type="number" min={0} value={newItem.rate} onChange={e => onNIChange("rate", e.target.value)} disabled={disabled} /></ITD>
          <ITD><TInput $align="right" type="number" min={0} value={newItem.discount} onChange={e => onNIChange("discount", e.target.value)} disabled={disabled} /></ITD>
          <ITD><TInput $align="right" $ro value={fmt(newItem.amount)} readOnly /></ITD>
          <ITD>
            <TSelect value={newItem.doctor} onChange={e => onNIChange("doctor", e.target.value)} disabled={disabled}>
              <option value="">— Doctor —</option>
              {doctors.map((d, i) => {
                const name = d.employeeName || d.doctor_name || d.name || (typeof d === "string" ? d : "");
                const id = d.employeeId || d.doctor_id || d.id || i;
                return <option key={id} value={name}>{name}</option>;
              })}
            </TSelect>
          </ITD>
          <ITD><TInput $align="right" type="number" min={0} value={newItem.doctor_fee} onChange={e => onNIChange("doctor_fee", e.target.value)} disabled={disabled} /></ITD>
          <ITD><TInput value={newItem.item_description} onChange={e => onNIChange("item_description", e.target.value)} disabled={disabled} placeholder="Notes…" /></ITD>
          <ITD $align="center"></ITD>
          <ITD $align="center">
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              <button onClick={onAdd} disabled={disabled}
                style={{ width: 28, height: 28, borderRadius: 6, background: disabled ? "#94a3b8" : T.primary, border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              <button onClick={onClear}
                style={{ width: 28, height: 28, borderRadius: 6, background: "#f1f5f9", border: `1px solid ${T.border}`, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
            </div>
          </ITD>
        </AddRow>

        {items.length === 0 ? (
          <tr><td colSpan={11}><EmptyRow>{disabled ? "Search a patient to load items." : "No items yet — add above."}</EmptyRow></td></tr>
        ) : items.map((item, idx) => (
          <ITR key={item._key}>
            <ITD $align="center" style={{ color: T.textMuted, fontWeight: 600, fontSize: "0.76rem" }}>{idx + 1}</ITD>
            <ITD style={{ fontWeight: 600 }}>
              <TInput
                value={item.itemName}
                onChange={e => onEdit(item._key, "itemName", e.target.value)}
                style={{ fontWeight: 600 }}
              />
              {item.package_name && <div style={{ fontSize: "0.68rem", color: T.textMuted, fontWeight: 400 }}>{item.package_name}</div>}
            </ITD>
            <ITD><TInput $align="right" type="number" min={1} value={item.quantity} onChange={e => onEdit(item._key, "quantity", Number(e.target.value) || 1)} /></ITD>
            <ITD><TInput $align="right" type="number" min={0} value={item.rate} onChange={e => onEdit(item._key, "rate", e.target.value)} /></ITD>
            <ITD><TInput $align="right" type="number" min={0} value={item.discount} onChange={e => onEdit(item._key, "discount", e.target.value)} /></ITD>
            <ITD $align="right" style={{ fontWeight: 700, fontSize: "0.82rem" }}>₹{fmt(item.amount)}</ITD>
            <ITD>
              <TSelect value={item.doctor || ""} onChange={e => onEdit(item._key, "doctor", e.target.value)}>
                <option value="">— Doctor —</option>
                {doctors.map((d, i) => {
                  const name = d.employeeName || d.doctor_name || d.name || (typeof d === "string" ? d : "");
                  const id = d.employeeId || d.doctor_id || d.id || i;
                  return <option key={id} value={name}>{name}</option>;
                })}
              </TSelect>
            </ITD>
            <ITD><TInput $align="right" type="number" min={0} value={item.doctor_fee || ""} onChange={e => onEdit(item._key, "doctor_fee", e.target.value)} /></ITD>
            <ITD>
              <TInput
                value={item.item_description || item.invest_bill_no || ""}
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
                style={{ background: "none", border: "none", cursor: "pointer", color: T.danger, fontSize: "0.95rem", padding: "4px", borderRadius: 4 }}>🗑</button>
            </ITD>
          </ITR>
        ))}
      </tbody>
    </ITable>
  </TScrollWrap>
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
  });

  const [patientWard, setPatientWard] = useState("GENERAL WARD");
  const [uhid, setUhid] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [patient, setPatient] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [form, setFormRaw] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingEst, setEditingEst] = useState(null);
  const [editReasonModal, setEditReasonModal] = useState(null);
  const [editReasonText, setEditReasonText] = useState("");

  const setForm = (k, v) => setFormRaw(p => ({ ...p, [k]: v }));
  const totals = calcTotals(items, form);

  const [estRefresh, setEstRefresh] = useState(0);
  const [billRefresh, setBillRefresh] = useState(0);

  const [toast, setToast] = useState(null);
  const showToast = (msg, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3800); };

  // ── Fetch doctors & bill types on mount ────────────────────────────────────
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
          setSelectedBT({
            billTypeNo: list[0].billTypeNo || list[0].bill_type_no || "",
            bill_type: list[0].bill_type,
            bill_name: list[0].bill_name,
          });
        }
      } catch { }

      setMasterLoading(false);
    };
    fetchMasterData();
  }, []);

  // ── Fetch items whenever selected bill type changes ────────────────────────
  // Items are loaded ONCE per bill-type change, not on every keystroke.
  // API call: GET /investigation-items/?billTypeNo=DIS01&billType=2
  useEffect(() => {
    if (selectedBT.bill_type == null) return;
    let cancelled = false;

    const fetchItems = async () => {
      setItemsLoading(true);
      setAllItems([]); // clear stale items immediately so dropdown shows loading
      try {
        const btNoParam = selectedBT.billTypeNo ? `billTypeNo=${encodeURIComponent(selectedBT.billTypeNo)}&` : "";
        const url = `${BASE}investigation-items/?${btNoParam}billType=${encodeURIComponent(String(selectedBT.bill_type))}`;
        const res = await apiRequest(url, "GET");

        const list =
          Array.isArray(res?.data?.items) ? res.data.items :
            Array.isArray(res?.items) ? res.items :
              Array.isArray(res?.data) ? res.data :
                Array.isArray(res) ? res :
                  [];

        if (!cancelled) setAllItems(normaliseItems(list));
      } catch {
        if (!cancelled) setAllItems([]);
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    };

    fetchItems();
    return () => { cancelled = true; };
  }, [selectedBT.billTypeNo, selectedBT.bill_type]);

  // ── Bill type change handler ────────────────────────────────────────────────
  const handleBillTypeChange = e => {
    const selectedVal = e.target.value;
    const chosen = billTypes.find(b => String(b.bill_type) === String(selectedVal));
    if (!chosen) return;
    setSelectedBT({
      billTypeNo: chosen.billTypeNo || "",
      bill_type: chosen.bill_type,
      bill_name: chosen.bill_name,
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
      rate: adjRate,
      amount: adjAmount,
    };
  }, [getWardMultiplier]);

  const handleWardChange = (e) => {
    const newWard = e.target.value;
    setPatientWard(newWard);
    setItems(prevItems => prevItems.map(it => applyWardToItem(it, newWard)));
  };

  const investToRow = useCallback((inv, idx) => {
    const baseRate = parseFloat(inv.rate) || parseFloat(inv.price) || 0;
    const qty = parseFloat(inv.quantity) || 1;
    const disc = parseFloat(inv.discount) || 0;
    const mult = getWardMultiplier(patientWard);
    const adjRate = parseFloat((baseRate * mult).toFixed(2));
    const adjAmount = Math.max(0, parseFloat((adjRate * qty - disc).toFixed(2)));
    return {
      ...EMPTY_ITEM,
      ...inv,
      _baseRate: baseRate,
      rate: adjRate,
      amount: adjAmount,
      _key: `inv_${idx}_${Date.now()}`,
      _fromInvest: true,
    };
  }, [patientWard, getWardMultiplier]);

  // ── Patient search ─────────────────────────────────────────────────────────
  const doSearch = async (mode, explicitVal = null) => {
    const val = (explicitVal || (mode === "uhid" ? uhid : ipNumber)).trim();
    if (!val) { setSearchErr("Please enter a value"); return; }
    setSearchErr(""); setSearching(true);
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
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
        if (norm.uhid) setUhid(norm.uhid);
        if (norm.ip_number) setIpNumber(norm.ip_number);
        if (Array.isArray(res.invest_items) && res.invest_items.length)
          setItems(res.invest_items.map(investToRow));
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
      const itemName = item.itemName || "";
      const baseRate = parseFloat(item.price) || 0;
      const mult = getWardMultiplier(patientWard);
      const rate = parseFloat((baseRate * mult).toFixed(2));
      const qty = parseFloat(p.quantity) || 1;
      const disc = parseFloat(p.discount) || 0;
      const amount = Math.max(0, parseFloat((rate * qty - disc).toFixed(2)));
      return { ...p, itemName, _baseRate: baseRate, rate, amount };
    });
  }, [patientWard, getWardMultiplier]);

  const handleAddItem = () => {
    if (!newItem.itemName.trim()) { showToast("Enter item name first", true); return; }
    const added = applyWardToItem(newItem, patientWard);
    setItems(p => [...p, { ...added, _key: `m_${Date.now()}`, _fromInvest: false }]);
    setNewItem(EMPTY_ITEM);
  };

  const handleReset = () => {
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    setUhid(""); setIpNumber(""); setSearchErr(""); setFormRaw(EMPTY_FORM);
    setEditingEst(null);
  };

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
    setItems(parseItems(est.items).map((it, idx) => ({
      ...EMPTY_ITEM, ...it,
      amount: parseFloat(it.amount) || (parseFloat(it.quantity || 1) * parseFloat(it.rate || 0)),
      _key: `est_${idx}_${Date.now()}`, _fromInvest: false,
    })));
    setNewItem(EMPTY_ITEM);
    setFormRaw(estToForm(est));
    setEditingEst({ id: est.id, estimate_number: est.estimate_number, bill_no: est.bill_no, status: est.status });
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
    if (!items.length) { showToast("Add at least one item", true); return; }
    if (editingEst?.id && editingEst.status === "Billed") {
      setEditReasonText("");
      setEditReasonModal({ actionType: "bill" });
    } else {
      executeSave("bill", "");
    }
  };

  const executeSave = async (actionType, reason) => {
    setSaving(true);
    setEditReasonModal(null);
    try {
      const t = calcTotals(items, form);
      if (actionType === "estimate") {
        const res = editingEst?.id
          ? await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient, reason))
          : await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Estimate", patient));
        const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
        if (d?.id) {
          showToast(`✓ Estimate saved — ${d.estimate_number || ""}`);
          handleReset(); setEstRefresh(n => n + 1); setTab("estimates");
        } else showToast(JSON.stringify(res?.error || res), true);
      } else {
        if (editingEst?.id && editingEst.status === "Billed") {
          const res = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Billed", patient, reason));
          const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id || d?.bill_no) {
            showToast(`✓ Bill updated — ${d.bill_no || ""}`);
            handleReset(); setBillRefresh(n => n + 1); setTab("bills");
          } else showToast(JSON.stringify(res?.error || res), true);
        } else if (editingEst?.id) {
          await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient, reason));
          const res = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/convert-to-bill/`, "POST", {});
          const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id || d?.bill_no) {
            showToast(`✓ Converted to Bill — ${d.bill_no || ""}`);
            handleReset(); setEstRefresh(n => n + 1); setBillRefresh(n => n + 1); setTab("bills");
          } else showToast(JSON.stringify(res?.error || res), true);
        } else {
          const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Billed", patient));
          const d = res.success && res.data && res.data.success ? res.data.data : (res.success ? res.data : null);
          if (d?.id) {
            showToast(`✓ Bill saved — ${d.bill_no || ""}`);
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
        <Crumb>Home / Discharge / Billing</Crumb>
      </AppBar>

      <Content>
        <TabBar>
          <Tab $active={tab === "create"} onClick={() => setTab("create")}>🧾 Create Bill</Tab>
          <Tab $active={tab === "estimates"} onClick={() => setTab("estimates")}>📋 Estimates</Tab>
          <Tab $active={tab === "bills"} onClick={() => setTab("bills")}>✅ Bills</Tab>
        </TabBar>

        {/* ═══ CREATE / EDIT TAB ═══ */}
        {tab === "create" && (<>

          {/* Patient search & details */}
          <Card>
            <CardHead>
              <CardTitle>Patient Search &amp; Details</CardTitle>
              {patient && (
                <Badge $v={editingEst ? "converting" : "billed"}>
                  {editingEst ? `✏️ Editing ${editingEst.bill_no || editingEst.estimate_number || "Record"}` : "✓ Patient Loaded"}
                </Badge>
              )}
            </CardHead>

            <SearchDetailsGrid>
              {/* Left Column: Search Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <FG style={{ flex: 1, minWidth: "150px" }}>
                    <FL>UHID <Req>*</Req></FL>
                    <div style={{ display: "flex", gap: 5 }}>
                      <FInput
                        style={{ flex: 1 }}
                        value={uhid}
                        onChange={e => { setUhid(e.target.value); setSearchErr(""); }}
                        placeholder="e.g. S025/011667"
                        onKeyDown={e => e.key === "Enter" && doSearch("uhid")}
                      />
                      <IconBtn onClick={() => doSearch("uhid")} disabled={searching}>
                        {searching ? <Spinner /> : "🔍"}
                      </IconBtn>
                    </div>
                  </FG>
                  <FG style={{ flex: 1, minWidth: "150px" }}>
                    <FL>IP Number <Req>*</Req></FL>
                    <div style={{ display: "flex", gap: 5 }}>
                      <FInput
                        style={{ flex: 1 }}
                        value={ipNumber}
                        onChange={e => { setIpNumber(e.target.value); setSearchErr(""); }}
                        placeholder="e.g. S025/012488"
                        onKeyDown={e => e.key === "Enter" && doSearch("ip")}
                      />
                      <IconBtn onClick={() => doSearch("ip")} disabled={searching}>
                        {searching ? <Spinner /> : "🔍"}
                      </IconBtn>
                    </div>
                  </FG>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {/* Patient Ward Select Dropdown */}
                  <FG style={{ flex: 1, minWidth: "150px" }}>
                    <FL>Patient Ward</FL>
                    <FSelect
                      value={patientWard}
                      onChange={handleWardChange}
                    >
                      <option value="GENERAL WARD">GENERAL WARD (-5%)</option>
                      <option value="SEMI-PRIVATE WARD">SEMI-PRIVATE WARD (Normal)</option>
                      <option value="PRIVATE WARD">PRIVATE WARD (+5%)</option>
                    </FSelect>
                  </FG>

                  {/* Discharge Date (Current Date, Disabled) */}
                  <FG style={{ flex: 1, minWidth: "150px" }}>
                    <FL>Discharge Date</FL>
                    <FInput
                      type="date"
                      value={form.bill_upto || new Date().toISOString().split("T")[0]}
                      disabled
                      readOnly
                      style={{ background: "#f1f5f9", color: T.textMid, cursor: "not-allowed" }}
                    />
                  </FG>
                </div>
                {searchErr && <span style={{ color: T.danger, fontSize: "0.76rem", fontWeight: "600" }}>⚠ {searchErr}</span>}
              </div>

              {/* Right Column: Patient Details Grid (Always visible; shows dashes if not searched) */}
              <div style={{
                background: "#ffffff", border: `1px solid ${T.border}`, borderRadius: "8px",
                padding: "8px", opacity: patient ? 1 : 0.6, pointerEvents: patient ? "auto" : "none"
              }}>
                <PGrid>
                  <PCell><PLbl>Name</PLbl> <PVal>{patient?.patient_name || "—"}</PVal></PCell>
                  <PCell><PLbl>Age / Gender</PLbl> <PVal>{patient ? `${patient.age || "—"} / ${patient.gender || "—"}` : "—"}</PVal></PCell>
                  <PCell><PLbl>Doctor</PLbl> <PVal style={{ fontSize: "0.79rem" }}>{patient?.doctor || "—"}</PVal></PCell>
                  <PCell $nr><PLbl>Admission Date</PLbl> <PVal style={{ fontSize: "0.78rem" }}>{formatAdmissionDate(patient?.admission_date)}</PVal></PCell>
                  <PCell $nb><PLbl>UHID / IP No</PLbl> <PVal style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{patient ? `${patient.uhid || "—"} / ${patient.ip_number || "—"}` : "—"}</PVal></PCell>
                  <PCell $nb><PLbl>Mobile</PLbl> <PVal>{patient?.mobile || "—"}</PVal></PCell>
                  <PCell $nb><PLbl>Room / Days</PLbl> <PVal>{patient ? `${patient.room_no || "—"} / ${patient.total_days ?? 0}d` : "—"}</PVal></PCell>
                  <PCell $nb $nr><PLbl>Type / Company</PLbl><PVal style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>{patient ? `${patient.patient_type || "—"} / ${patient.company || "—"}` : "—"}</PVal></PCell>
                </PGrid>
              </div>
            </SearchDetailsGrid>
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
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: T.textMid, flexShrink: 0 }}>
                Bill Type:
              </span>
              <FSelect
                value={selectedBT.bill_type != null ? String(selectedBT.bill_type) : ""}
                onChange={handleBillTypeChange}
                disabled={masterLoading}
                style={{ height: 32, fontSize: "0.82rem", maxWidth: 320, flex: "0 1 320px" }}
              >
                {billTypes.length === 0 ? (
                  <option value="">Select Bill Type</option>
                ) : (
                  billTypes.map(b => (
                    <option key={b.bill_type} value={String(b.bill_type)}>
                      {b.bill_name}
                    </option>
                  ))
                )}
              </FSelect>

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
              onRemove={key => setItems(p => p.filter(i => i._key !== key))}
              disabled={!patient}
              doctors={doctors}
              billTypeNo={selectedBT.billTypeNo}
              billTypeName={selectedBT.bill_name}
              allItems={allItems}
              itemsLoading={itemsLoading}
            />
          </Card>

          {/* Financials + actions */}
          <Card>
            <CardHead><CardTitle>Financial Summary</CardTitle></CardHead>
            <FinancialGrid f={form} onChange={setForm} totals={totals} />
            <FinActions>
              <Btn $ghost onClick={handleReset}>✕ Reset</Btn>
              <Btn $amber onClick={handleSaveEstimate} disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing")}>
                {saving ? <Spinner /> : "📋"} {editingEst ? " Update Estimate" : " Save as Estimate"}
              </Btn>
              {editingEst && editingEst.status !== "Billed" ? (
                <Btn $purple onClick={handleSaveBill} disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing")}>
                  {saving ? <Spinner /> : "🧾"} Convert &amp; Save Bill
                </Btn>
              ) : (
                <Btn $primary onClick={handleSaveBill} disabled={saving || !patient || (patient && patient.ward_status !== "Sent for billing")}>
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
              <Btn $amber onClick={() => executeSave(editReasonModal.actionType, editReasonText)} disabled={saving || !editReasonText.trim()}>
                {saving ? <Spinner /> : "✓ Confirm & Save"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </PageWrap>
  );
};

export default DischargeBilling;