import React, { useState, useEffect, useCallback } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes, createGlobalStyle } from "styled-components";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  primary:    "#0f766e",
  primaryDk:  "#0d5f58",
  primaryLt:  "#ccfbf1",
  amber:      "#d97706",
  amberLt:    "#fef3c7",
  danger:     "#dc2626",
  dangerLt:   "#fee2e2",
  success:    "#16a34a",
  successLt:  "#dcfce7",
  blue:       "#2563eb",
  blueLt:     "#dbeafe",
  border:     "#e2e8f0",
  bg:         "#f8fafc",
  surface:    "#ffffff",
  textMain:   "#0f172a",
  textMid:    "#475569",
  textMuted:  "#94a3b8",
  radius:     "8px",
  shadow:     "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:   "0 4px 16px rgba(0,0,0,0.10)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

// ─── Global ───────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: ${T.bg}; color: ${T.textMain}; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageWrap   = styled.div`min-height: 100vh; background: ${T.bg};`;
const AppBar     = styled.header`
  background: ${T.primary}; height: 48px; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;
const AppTitle   = styled.div`color:#fff; font-weight:700; font-size:0.88rem; display:flex; align-items:center; gap:8px;`;
const Crumb      = styled.div`color:rgba(255,255,255,0.7); font-size:0.72rem;`;
const Content    = styled.div`max-width:1300px; margin:0 auto; padding:16px;`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TabBar = styled.div`
  display: flex; gap: 2px; margin-bottom: 14px;
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: ${T.radius}; padding: 4px; width: fit-content;
`;
const Tab = styled.button`
  padding: 7px 18px; border: none; border-radius: 6px; cursor: pointer;
  font-size: 0.81rem; font-weight: 600; transition: all 0.15s; display:flex; align-items:center; gap:6px;
  background: ${p => p.$active ? T.primary : "transparent"};
  color:      ${p => p.$active ? "#fff"    : T.textMid};
  &:hover { background: ${p => p.$active ? T.primary : T.bg}; }
`;

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: ${T.radius}; box-shadow: ${T.shadow};
  margin-bottom: 12px; overflow: hidden;
  animation: ${fadeUp} 0.2s ease;
`;
const CardHead = styled.div`
  background: #f8fafc; border-bottom: 1px solid ${T.border};
  padding: 8px 14px; display: flex; align-items: center; justify-content: space-between;
`;
const CardTitle = styled.span`
  font-size: 0.69rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: ${T.textMuted};
`;

// ─── Badges ───────────────────────────────────────────────────────────────────
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 20px; font-size: 0.66rem; font-weight: 700;
  background: ${p => ({ estimate:"#fef3c7", billed:"#dcfce7", pending:"#dbeafe", manual:"#f1f5f9", converting:"#ede9fe" }[p.$v] || "#f1f5f9")};
  color:      ${p => ({ estimate:T.amber,   billed:T.success, pending:T.blue,   manual:T.textMuted, converting:"#7c3aed" }[p.$v] || T.textMuted)};
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = styled.div`
  position: fixed; top: 14px; right: 16px; z-index: 9999;
  padding: 10px 18px; border-radius: ${T.radius}; color: #fff;
  font-weight: 600; font-size: 0.84rem; max-width: 380px;
  background: ${p => p.$err ? T.danger : T.success};
  box-shadow: ${T.shadowMd}; animation: ${slideDown} 0.2s ease;
`;

// ─── Conversion banner ────────────────────────────────────────────────────────
const ConvertBanner = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; margin-bottom: 12px;
  background: #ede9fe; border: 1.5px solid #7c3aed;
  border-radius: ${T.radius}; font-size: 0.82rem; font-weight: 600; color: #5b21b6;
  animation: ${slideDown} 0.25s ease;
`;

// ─── Form controls ────────────────────────────────────────────────────────────
const SearchBar = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;
  padding: 12px 14px; background: #fafafa; border-bottom: 1px solid ${T.border};
`;
const FG = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  min-width: ${p => p.$w || "150px"}; flex: ${p => p.$flex || "none"};
`;
const FL = styled.label`
  font-size: 0.66rem; font-weight: 700; color: ${T.textMuted};
  text-transform: uppercase; letter-spacing: 0.4px;
`;
const Req = styled.span`color: ${T.danger}; margin-left: 2px;`;
const FInput = styled.input`
  height: 32px; padding: 0 10px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor: pointer; }
  &::placeholder { color: ${T.textMuted}; }
`;
const FSelect = styled.select`
  height: 32px; padding: 0 8px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────
const Btn = styled.button`
  height: ${p => p.$sm ? "30px" : "34px"};
  padding: 0 ${p => p.$sm ? "12px" : "16px"};
  border-radius: 6px; font-size: ${p => p.$sm ? "0.77rem" : "0.81rem"};
  font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.13s;
  ${p => p.$primary   && `background:${T.primary}; color:#fff; border-color:${T.primary};`}
  ${p => p.$amber     && `background:${T.amber};   color:#fff; border-color:${T.amber};`}
  ${p => p.$danger    && `background:${T.danger};  color:#fff; border-color:${T.danger};`}
  ${p => p.$ghost     && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p => p.$outline   && `background:#fff; color:${T.primary}; border-color:${T.primary};`}
  ${p => p.$purple    && `background:#7c3aed; color:#fff; border-color:#7c3aed;`}
  &:hover  { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const IconBtn = styled.button`
  width: 32px; height: 32px; border-radius: 6px; border: none;
  background: ${T.primary}; color: #fff; cursor: pointer; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; transition: opacity 0.12s;
  &:hover { opacity: 0.85; } &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Spinner = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;

// ─── Patient grid ─────────────────────────────────────────────────────────────
const PGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr);
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;
const PCell = styled.div`
  padding: 8px 14px;
  border-right: ${p => p.$nr ? "none" : `1px solid ${T.border}`};
  border-bottom: ${p => p.$nb ? "none" : `1px solid ${T.border}`};
`;
const PLbl = styled.div`font-size:0.62rem; font-weight:700; color:${T.textMuted}; text-transform:uppercase; letter-spacing:0.4px;`;
const PVal = styled.div`font-size:0.83rem; font-weight:600; color:${T.textMain}; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`;

// ─── Items table ──────────────────────────────────────────────────────────────
const TScrollWrap = styled.div`overflow-x: auto;`;
const ITable = styled.table`width:100%; border-collapse:collapse; font-size:0.79rem; min-width:960px;`;
const ITHead = styled.thead`background:#f8fafc;`;
const ITH = styled.th`
  padding: 7px 8px; text-align:left; font-size:0.64rem; font-weight:700;
  text-transform:uppercase; letter-spacing:0.4px; color:${T.textMuted};
  border-bottom:1px solid ${T.border}; white-space:nowrap;
`;
const ITR = styled.tr`
  border-bottom: 1px dashed ${T.border};
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fbff; }
`;
const AddRow = styled.tr`background:#fffbeb; border-bottom:2px solid ${T.amber};`;
const ITD = styled.td`padding:6px 8px; color:${T.textMain}; vertical-align:middle;`;
const TInput = styled.input`
  width: ${p => p.$w || "100%"}; padding: 4px 7px; font-size: 0.78rem;
  border: 1px solid ${T.border}; border-radius: 5px; outline: none;
  background: ${p => p.$ro ? "#f8fafc" : "#fff"};
  color:      ${p => p.$ro ? T.textMuted : T.textMain};
  transition: border 0.12s;
  &:focus { border-color: ${T.primary}; }
`;
const EmptyRow = styled.div`text-align:center; padding:34px; color:${T.textMuted}; font-size:0.84rem;`;

// ─── Financials ───────────────────────────────────────────────────────────────
const FinGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid ${T.border};
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`;
const FinCol = styled.div`padding:10px 12px; border-right:1px solid ${T.border}; display:flex; flex-direction:column; gap:8px; &:last-child{border-right:none;}`;
const FinRow = styled.div`display:flex; align-items:center; gap:6px; font-size:0.78rem;`;
const FinLbl = styled.span`min-width:${p=>p.$w||"90px"}; color:${T.textMid}; font-weight:500; font-size:0.75rem; flex-shrink:0;`;
const FinIn  = styled.input`
  flex:1; padding:4px 8px; font-size:0.78rem; border:1px solid ${T.border};
  border-radius:5px; outline:none; text-align:right; min-width:0;
  background: ${p=>p.$ro?"#f8fafc":"#fff"}; color:${p=>p.$ro?T.textMuted:T.textMain};
  transition: border 0.12s;
  &:focus { border-color: ${T.primary}; }
  ${p=>p.$net && `font-weight:700; color:${T.success}; background:#f0fdf4; border-color:#86efac;`}
`;
const Rupee = styled.span`color:${T.textMuted}; font-size:0.75rem; flex-shrink:0;`;
const FinActions = styled.div`
  display:flex; align-items:center; justify-content:flex-end; gap:8px;
  padding:10px 14px; background:#fafafa; border-top:1px solid ${T.border};
`;

// ─── List table ───────────────────────────────────────────────────────────────
const LTable = styled.table`width:100%; border-collapse:collapse; font-size:0.8rem;`;
const LTH = styled.th`
  padding:8px 10px; text-align:left; font-size:0.65rem; font-weight:700;
  text-transform:uppercase; letter-spacing:0.4px; color:${T.textMuted};
  border-bottom:2px solid ${T.border}; background:#f8fafc; white-space:nowrap;
`;
const LTR = styled.tr`
  border-bottom:1px solid ${T.border};
  &:hover { background:#f8fbff; }
  &:last-child { border-bottom:none; }
`;
const LTD = styled.td`padding:8px 10px; color:${T.textMain}; vertical-align:middle;`;
const Mono = styled.span`font-family:'Courier New',monospace; font-size:0.78rem;`;
const DateBar = styled.div`
  display:flex; align-items:flex-end; gap:10px; flex-wrap:wrap;
  padding:10px 14px; background:#fafafa; border-bottom:1px solid ${T.border};
`;
const ErrMsg = styled.div`
  color:${T.danger}; font-size:0.76rem; padding:6px 14px;
  background:#fee2e2; border-bottom:1px solid #fecaca;
  display:flex; align-items:center; gap:6px;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:500;
  display:flex; align-items:center; justify-content:center; padding:16px;
`;
const ModalWrap = styled.div`
  background:${T.surface}; border-radius:10px; box-shadow:${T.shadowMd};
  width:100%; max-width:1160px; max-height:94vh;
  display:flex; flex-direction:column; overflow:hidden;
  animation: ${slideDown} 0.2s ease;
`;
const ModalHead = styled.div`
  background:${T.primary}; padding:12px 18px;
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
`;
const ModalTitle = styled.div`color:#fff; font-weight:700; font-size:0.88rem; display:flex; align-items:center; gap:10px;`;
const ModalBody  = styled.div`overflow-y:auto; padding:14px; flex:1;`;
const CloseBtn   = styled.button`
  width:30px; height:30px; border-radius:50%; border:none;
  background:rgba(255,255,255,0.15); color:#fff; cursor:pointer; font-size:0.9rem;
  display:flex; align-items:center; justify-content:center; transition:background 0.12s;
  &:hover { background:rgba(255,255,255,0.3); }
`;

// ─── NoResults ────────────────────────────────────────────────────────────────
const NoResults = styled.div`text-align:center; padding:36px; color:${T.textMuted}; font-size:0.84rem;`;

// ═════════════════════════════════════════════════════════════════════════════
// Constants & pure helpers
// ═════════════════════════════════════════════════════════════════════════════

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount:"", sales_return:"", medicines:"", taxable:"", non_tax:"",
  tpa_paid:"", sales_tax:"", gst_amount:"", room_tax:"", cess:"", luxury_tax:"",
  discount_percent:"", discount_amount:"", disc_reason:"", remarks:"",
  bill_upto: new Date().toISOString().split("T")[0],
};

const EMPTY_ITEM = { itemName:"", quantity:1, rate:"", discount:0, amount:0, doctor:"", doctor_fee:"", item_description:"", package_name:"" };

const fmt = v => (parseFloat(v) || 0).toFixed(2);

const calcTotals = (items, f) => {
  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const itemDisc    = items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0);
  const discPct     = parseFloat(f.discount_percent) || 0;
  const discAmt     = parseFloat(f.discount_amount) || (totalAmount * discPct / 100);
  const totalDisc   = discAmt + itemDisc;
  const netAmount   = Math.max(0,
    totalAmount
    + (parseFloat(f.gst_amount)    || 0)
    + (parseFloat(f.room_tax)      || 0)
    + (parseFloat(f.medicines)     || 0)
    + (parseFloat(f.sales_tax)     || 0)
    + (parseFloat(f.cess)          || 0)
    + (parseFloat(f.luxury_tax)    || 0)
    - (parseFloat(f.advance_amount)|| 0)
    - (parseFloat(f.sales_return)  || 0)
    - (parseFloat(f.tpa_paid)      || 0)
    - totalDisc
  );
  return { totalAmount, itemDisc, discAmt, totalDisc, netAmount };
};

const buildPayload = (items, f, totals, billing_status, patient) => ({
  status:           billing_status,
  uhid:             patient?.uhid      || null,
  ip_number:        patient?.ip_number || null,
  items:            items.map(({ _key, _fromInvest, ...r }) => r),
  total_amount:     totals.totalAmount,
  advance_amount:   parseFloat(f.advance_amount)  || 0,
  sales_return:     parseFloat(f.sales_return)    || 0,
  medicines_amount: parseFloat(f.medicines)       || 0,
  taxable_amount:   parseFloat(f.taxable)         || 0,
  non_tax_amount:   parseFloat(f.non_tax)         || 0,
  gst_amount:       parseFloat(f.gst_amount)      || 0,
  room_tax:         parseFloat(f.room_tax)        || 0,
  discount_percent: parseFloat(f.discount_percent)|| 0,
  discount_amount:  totals.discAmt,
  disc_reason:      f.disc_reason || "",
  item_disc:        totals.itemDisc,
  total_disc:       totals.totalDisc,
  net_amount:       totals.netAmount,
  remarks:          f.remarks || "",
});

const recalcItem = (item, field, value) => {
  const u = { ...item, [field]: value };
  const qty  = parseFloat(field === "quantity" ? value : u.quantity) || 0;
  const rate = parseFloat(field === "rate"     ? value : u.rate)     || 0;
  const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
  if (["quantity", "rate", "discount"].includes(field))
    u.amount = Math.max(0, qty * rate - disc);
  return u;
};

const investToRow = it => ({
  itemName:       it.itemName || "",
  quantity:       it.quantity || 1,
  rate:           it.price    || 0,
  discount:       0,
  amount:         (it.quantity || 1) * (it.price || 0),
  doctor:         it.doctor   || "",
  doctor_fee:     "",
  item_description: it.billTypeNo || "",
  package_name:   it.package_name || "",
  invest_bill_no: it.invest_bill_no || "",
  bill_object_id: it.bill_object_id || "",
  payment_status: it.payment_status || "",
  test_id:        it.test_id ?? null,
  _key:           `inv_${it.test_id ?? it.itemName}_${Date.now()}_${Math.random()}`,
  _fromInvest:    true,
});

const parseItems = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const estToForm = e => ({
  advance_amount:   String(parseFloat(e.advance_amount)  || ""),
  sales_return:     String(parseFloat(e.sales_return)    || ""),
  medicines:        String(parseFloat(e.medicines_amount)|| ""),
  taxable:          String(parseFloat(e.taxable_amount)  || ""),
  non_tax:          String(parseFloat(e.non_tax_amount)  || ""),
  tpa_paid: "", sales_tax: "",
  gst_amount:       String(parseFloat(e.gst_amount)      || ""),
  room_tax:         String(parseFloat(e.room_tax)        || ""),
  cess: "", luxury_tax: "",
  discount_percent: String(parseFloat(e.discount_percent)|| ""),
  discount_amount:  String(parseFloat(e.discount_amount) || ""),
  disc_reason:      e.disc_reason || "",
  remarks:          e.remarks     || "",
  bill_upto: e.bill_date
    ? new Date(e.bill_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
});

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════════════

// ── Financial grid ────────────────────────────────────────────────────────────
const FinancialGrid = ({ f, onChange, totals, readOnly }) => (
  <FinGrid>
    <FinCol>
      <FinRow><FinLbl>Total Amount</FinLbl><Rupee>₹</Rupee><FinIn $ro value={fmt(totals.totalAmount)} readOnly /></FinRow>
      <FinRow><FinLbl>Advance</FinLbl>     <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.advance_amount}   onChange={e=>onChange("advance_amount",   e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Sales Return</FinLbl><Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.sales_return}     onChange={e=>onChange("sales_return",     e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Medicines</FinLbl>   <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.medicines}        onChange={e=>onChange("medicines",        e.target.value)} readOnly={readOnly}/></FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLbl>Taxable</FinLbl>  <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.taxable}   onChange={e=>onChange("taxable",   e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Non Tax</FinLbl>  <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.non_tax}   onChange={e=>onChange("non_tax",   e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>TPA Paid</FinLbl> <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.tpa_paid}  onChange={e=>onChange("tpa_paid",  e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Sales Tax</FinLbl><Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.sales_tax} onChange={e=>onChange("sales_tax", e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow>
        <FinLbl style={{fontWeight:700}}>Net Amount</FinLbl><Rupee>₹</Rupee>
        <FinIn $ro $net value={fmt(totals.netAmount)} readOnly />
      </FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLbl>GST</FinLbl>      <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.gst_amount}  onChange={e=>onChange("gst_amount",  e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Room Tax</FinLbl> <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.room_tax}    onChange={e=>onChange("room_tax",    e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Cess</FinLbl>     <Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.cess}        onChange={e=>onChange("cess",        e.target.value)} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Luxury Tax</FinLbl><Rupee>₹</Rupee><FinIn $ro={readOnly} type="number" min={0} value={f.luxury_tax} onChange={e=>onChange("luxury_tax",  e.target.value)} readOnly={readOnly}/></FinRow>
    </FinCol>
    <FinCol>
      <FinRow>
        <FinLbl>Discount</FinLbl>
        <FinIn $ro={readOnly} type="number" min={0} max={100} value={f.discount_percent}
          onChange={e=>onChange("discount_percent", e.target.value)}
          style={{width:48, flexGrow:0, textAlign:"center"}} readOnly={readOnly}/>
        <span style={{fontSize:"0.73rem",color:T.textMuted}}>%</span>
        <FinIn $ro={readOnly} type="number" min={0} value={f.discount_amount}
          onChange={e=>onChange("discount_amount", e.target.value)} readOnly={readOnly}/>
      </FinRow>
      <FinRow><FinLbl>Disc Reason</FinLbl><FinIn $ro={readOnly} value={f.disc_reason} onChange={e=>onChange("disc_reason",e.target.value)} style={{textAlign:"left"}} readOnly={readOnly}/></FinRow>
      <FinRow><FinLbl>Item Disc</FinLbl>  <Rupee>₹</Rupee><FinIn $ro value={fmt(totals.itemDisc)}  readOnly /></FinRow>
      <FinRow><FinLbl>Total Disc</FinLbl> <Rupee>₹</Rupee><FinIn $ro value={fmt(totals.totalDisc)} readOnly /></FinRow>
      <FinRow><FinLbl>Remarks</FinLbl>    <FinIn $ro={readOnly} value={f.remarks||""} onChange={e=>onChange("remarks",e.target.value)} style={{textAlign:"left"}} readOnly={readOnly}/></FinRow>
    </FinCol>
  </FinGrid>
);

// ── Items section ─────────────────────────────────────────────────────────────
const ItemsSection = ({ items, newItem, onNIChange, onAdd, onClear, onEdit, onRemove, disabled }) => (
  <TScrollWrap>
    <ITable>
      <ITHead>
        <tr>
          <ITH style={{width:34}}>#</ITH>
          <ITH>Item Name</ITH>
          <ITH style={{width:72}}>Qty</ITH>
          <ITH style={{width:85}}>Rate</ITH>
          <ITH style={{width:80}}>Discount</ITH>
          <ITH style={{width:92}}>Amount</ITH>
          <ITH>Doctor</ITH>
          <ITH style={{width:72}}>Dr.Fee</ITH>
          <ITH>Description</ITH>
          <ITH style={{width:78}}>Source</ITH>
          <ITH style={{width:40}}></ITH>
        </tr>
      </ITHead>
      <tbody>
        {/* New-item row */}
        <AddRow>
          <ITD style={{color:T.amber,fontWeight:700,fontSize:"0.7rem"}}>+</ITD>
          <ITD><TInput value={newItem.itemName} onChange={e=>onNIChange("itemName",e.target.value)} placeholder="Item name…" disabled={disabled}/></ITD>
          <ITD><TInput $w="64px" type="number" min={1} value={newItem.quantity} onChange={e=>onNIChange("quantity",Number(e.target.value)||1)} disabled={disabled}/></ITD>
          <ITD><TInput $w="72px" type="number" min={0} value={newItem.rate}     onChange={e=>onNIChange("rate",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput $w="64px" type="number" min={0} value={newItem.discount} onChange={e=>onNIChange("discount",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput $w="78px" $ro value={fmt(newItem.amount)} readOnly/></ITD>
          <ITD><TInput value={newItem.doctor} onChange={e=>onNIChange("doctor",e.target.value)} disabled={disabled} placeholder="Doctor"/></ITD>
          <ITD><TInput $w="64px" type="number" min={0} value={newItem.doctor_fee} onChange={e=>onNIChange("doctor_fee",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput value={newItem.item_description} onChange={e=>onNIChange("item_description",e.target.value)} disabled={disabled} placeholder="Notes…"/></ITD>
          <ITD></ITD>
          <ITD>
            <div style={{display:"flex",gap:4}}>
              <button onClick={onAdd} disabled={disabled} style={{width:26,height:26,borderRadius:5,background:disabled?"#94a3b8":T.primary,border:"none",color:"#fff",fontWeight:700,fontSize:"1rem",cursor:disabled?"not-allowed":"pointer"}}>+</button>
              <button onClick={onClear} style={{width:26,height:26,borderRadius:5,background:"#f1f5f9",border:`1px solid ${T.border}`,cursor:"pointer",fontSize:"0.85rem"}}>↺</button>
            </div>
          </ITD>
        </AddRow>

        {items.length === 0 ? (
          <tr><td colSpan={11}><EmptyRow>{disabled ? "Search a patient to load items." : "No items yet — add above."}</EmptyRow></td></tr>
        ) : items.map((item, idx) => (
          <ITR key={item._key}>
            <ITD style={{color:T.textMuted,fontWeight:600,fontSize:"0.75rem"}}>{idx+1}</ITD>
            <ITD style={{fontWeight:600}}>
              {item.itemName}
              {item.package_name && <div style={{fontSize:"0.68rem",color:T.textMuted}}>{item.package_name}</div>}
            </ITD>
            <ITD><TInput $w="64px" type="number" min={1}  value={item.quantity} onChange={e=>onEdit(item._key,"quantity",Number(e.target.value)||1)}/></ITD>
            <ITD><TInput $w="72px" type="number" min={0}  value={item.rate}     onChange={e=>onEdit(item._key,"rate",e.target.value)}/></ITD>
            <ITD><TInput $w="64px" type="number" min={0}  value={item.discount} onChange={e=>onEdit(item._key,"discount",e.target.value)}/></ITD>
            <ITD style={{fontWeight:700}}>₹{fmt(item.amount)}</ITD>
            <ITD style={{fontSize:"0.77rem"}}>{item.doctor||"—"}</ITD>
            <ITD style={{fontSize:"0.77rem"}}>{item.doctor_fee||"—"}</ITD>
            <ITD style={{fontSize:"0.74rem",color:T.textMuted}}>{item.invest_bill_no||item.item_description||"—"}</ITD>
            <ITD>
              {item._fromInvest
                ? <Badge $v="pending">{item.payment_status||"Invest"}</Badge>
                : <Badge $v="manual">Manual</Badge>}
            </ITD>
            <ITD>
              <button onClick={()=>onRemove(item._key)} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:"0.9rem",padding:"2px 4px",borderRadius:4}} title="Remove">🗑</button>
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
  const [tab, setTab] = useState("create");

  // ── Create tab state ───────────────────────────────────────────────────────
  const [uhid,            setUhid]            = useState("");
  const [ipNumber,        setIpNumber]        = useState("");
  const [searching,       setSearching]       = useState(false);
  const [searchErr,       setSearchErr]       = useState("");
  const [patient,         setPatient]         = useState(null);
  const [items,           setItems]           = useState([]);
  const [newItem,         setNewItem]         = useState(EMPTY_ITEM);
  const [form,            setFormRaw]         = useState(EMPTY_FORM);
  const [saving,          setSaving]          = useState(false);
  // Track which estimate is being converted (for the purple banner in Create tab)
  const [convertingFrom,  setConvertingFrom]  = useState(null); // { estimate_number, id }
  const setForm = (k, v) => setFormRaw(p => ({ ...p, [k]: v }));
  const totals = calcTotals(items, form);

  // ── List state ─────────────────────────────────────────────────────────────
  const [estimates,   setEstimates]   = useState([]);
  const [bills,       setBills]       = useState([]);
  const [listBusy,    setListBusy]    = useState(false);
  const today      = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [estFrom,   setEstFrom]   = useState(monthStart);
  const [estTo,     setEstTo]     = useState(today);
  const [estQ,      setEstQ]      = useState("");
  const [billFrom,  setBillFrom]  = useState(monthStart);
  const [billTo,    setBillTo]    = useState(today);
  const [billQ,     setBillQ]     = useState("");

  // ── Edit modal state ───────────────────────────────────────────────────────
  const [editEst,     setEditEst]     = useState(null);
  const [editItems,   setEditItems]   = useState([]);
  const [editNI,      setEditNI]      = useState(EMPTY_ITEM);
  const [editForm,    setEditFormRaw] = useState(EMPTY_FORM);
  const [editSaving,  setEditSaving]  = useState(false);
  const [convSaving,  setConvSaving]  = useState(false);
  const setEditForm = (k, v) => setEditFormRaw(p => ({ ...p, [k]: v }));
  const editTotals = calcTotals(editItems, editForm);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3800);
  };

  // ── Fetch lists ────────────────────────────────────────────────────────────
  const fetchEstimates = useCallback(async () => {
    setListBusy(true);
    try {
      const res  = await apiRequest(`${BASE}discharge-billing/?status=Estimate`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEstimates(list);
    } catch { showToast("Failed to load estimates", true); }
    finally { setListBusy(false); }
  }, []);

  const fetchBills = useCallback(async () => {
    setListBusy(true);
    try {
      const res  = await apiRequest(`${BASE}discharge-billing/?status=Billed`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setBills(list);
    } catch { showToast("Failed to load bills", true); }
    finally { setListBusy(false); }
  }, []);

  useEffect(() => { fetchEstimates(); fetchBills(); }, [fetchEstimates, fetchBills]);

  // ── Patient search ─────────────────────────────────────────────────────────
  const doSearch = async mode => {
    const val = (mode === "uhid" ? uhid : ipNumber).trim();
    if (!val) { setSearchErr("Please enter a value"); return; }
    setSearchErr(""); setSearching(true);
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    try {
      const param = mode === "uhid"
        ? `uhid=${encodeURIComponent(val)}`
        : `ipNumber=${encodeURIComponent(val)}`;
      const raw = await apiRequest(`${BASE}search-discharge-patient/?${param}`, "GET");
      const res = raw?.data !== undefined ? raw.data : raw;
      const p   = res?.patient;
      if (p) {
        const norm = { ...p, ip_number: p.ip_number || p.ipNumber || "" };
        setPatient(norm);
        if (norm.uhid)      setUhid(norm.uhid);
        if (norm.ip_number) setIpNumber(norm.ip_number);
        if (Array.isArray(res.invest_items) && res.invest_items.length)
          setItems(res.invest_items.map(investToRow));
      } else setSearchErr("No record found");
    } catch { setSearchErr("Search failed — check network"); }
    finally { setSearching(false); }
  };

  // ── Create tab item helpers ────────────────────────────────────────────────
  const handleNIChange = (field, value) =>
    setNewItem(p => recalcItem({ ...p, [field]: value }, field, value));

  const handleAddItem = () => {
    if (!newItem.itemName.trim()) { showToast("Enter item name first", true); return; }
    setItems(p => [...p, { ...newItem, _key: `m_${Date.now()}`, _fromInvest: false }]);
    setNewItem(EMPTY_ITEM);
  };

  const handleReset = () => {
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    setUhid(""); setIpNumber(""); setSearchErr(""); setFormRaw(EMPTY_FORM);
    setConvertingFrom(null);
  };

  // ── Flow 1: Save as Direct Bill (status=Billed) ───────────────────────────
  const handleSaveBill = async () => {
    if (!patient)       { showToast("Search a patient first", true); return; }
    if (!items.length)  { showToast("Add at least one item",  true); return; }
    setSaving(true);
    try {
      const t   = calcTotals(items, form);
      const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Billed", patient));
      const d   = res?.id ? res : res?.data;
      if (d?.id) {
        showToast(`✓ Bill saved — ${d.bill_no || ""}`);
        handleReset(); fetchBills(); setTab("bills");
      } else showToast(JSON.stringify(res?.error || res), true);
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // ── Flow 2: Save as Estimate (status=Estimate) ────────────────────────────
  const handleSaveEstimate = async () => {
    if (!patient)       { showToast("Search a patient first", true); return; }
    if (!items.length)  { showToast("Add at least one item",  true); return; }
    setSaving(true);
    try {
      const t   = calcTotals(items, form);
      const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Estimate", patient));
      const d   = res?.id ? res : res?.data;
      if (d?.id) {
        showToast(`✓ Estimate saved — ${d.estimate_number || ""}`);
        handleReset(); fetchEstimates(); setTab("estimates");
      } else showToast(JSON.stringify(res?.error || res), true);
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // ── Flow 3: Open edit modal ────────────────────────────────────────────────
  const openEdit = est => {
    if (!est?.id) { showToast("Estimate ID missing", true); return; }
    setEditItems(
      parseItems(est.items).map((it, idx) => ({
        ...EMPTY_ITEM, ...it,
        amount: parseFloat(it.amount) || (parseFloat(it.quantity||1) * parseFloat(it.rate||0)),
        _key: `e_${idx}_${Date.now()}`, _fromInvest: false,
      }))
    );
    setEditFormRaw(estToForm(est));
    setEditNI(EMPTY_ITEM);
    setEditEst(est);
  };

  // ── Flow 3: Edit item helpers ──────────────────────────────────────────────
  const editNIChange = (field, value) =>
    setEditNI(p => recalcItem({ ...p, [field]: value }, field, value));

  const editAddItem = () => {
    if (!editNI.itemName.trim()) { showToast("Enter item name first", true); return; }
    setEditItems(p => [...p, { ...editNI, _key: `em_${Date.now()}`, _fromInvest: false }]);
    setEditNI(EMPTY_ITEM);
  };

  // ── Flow 3: Save updated estimate (PATCH, status stays Estimate) ──────────
  const handleUpdateEst = async () => {
    if (!editEst?.id)    { showToast("Estimate ID missing", true); return; }
    if (!editItems.length){ showToast("Add at least one item", true); return; }
    setEditSaving(true);
    try {
      const t   = calcTotals(editItems, editForm);
      const payload = buildPayload(editItems, editForm, t, "Estimate", { uhid: editEst.uhid, ip_number: editEst.ip_number });
      const res = await apiRequest(`${BASE}discharge-billing/${editEst.id}/`, "PATCH", payload);
      const d   = res?.id ? res : res?.data;
      if (d?.id) {
        showToast(`✓ Estimate updated — ${d.estimate_number || editEst.estimate_number}`);
        setEditEst(null); fetchEstimates();
      } else showToast(JSON.stringify(res?.error || res), true);
    } catch { showToast("Network error", true); }
    finally { setEditSaving(false); }
  };

  // ── Flow 4: Convert estimate → populate Create Bill tab ───────────────────
  // Closes modal, pre-fills Create tab with all estimate data, switches tab.
  // The user reviews & clicks "Save as Final Bill" to actually commit.
  const handleConvert = () => {
    if (!editEst?.id) { showToast("Estimate ID missing", true); return; }

    // Build patient object from estimate's patient_details
    const pd = editEst.patient_details || {};
    const patientFromEst = {
      patient_name:   pd.patient_name   || "",
      age:            pd.age            || "",
      gender:         pd.gender         || "",
      doctor:         pd.doctor         || "",
      admission_date: pd.admission_date || "",
      uhid:           editEst.uhid      || "",
      ip_number:      editEst.ip_number || "",
      mobile:         pd.mobile         || "",
      room_no:        pd.room_no        || "",
      total_days:     pd.total_days     ?? 0,
      patient_type:   pd.patient_type   || "",
      company:        pd.company        || "",
    };

    // Map estimate items into create-tab item format
    const populatedItems = parseItems(editEst.items).map((it, idx) => ({
      ...EMPTY_ITEM,
      ...it,
      amount: parseFloat(it.amount) || (parseFloat(it.quantity || 1) * parseFloat(it.rate || 0)),
      _key: `conv_${idx}_${Date.now()}`,
      _fromInvest: false,
    }));

    // Populate create tab state
    setPatient(patientFromEst);
    setUhid(editEst.uhid || "");
    setIpNumber(editEst.ip_number || "");
    setItems(populatedItems);
    setNewItem(EMPTY_ITEM);
    setFormRaw(estToForm(editEst));
    setConvertingFrom({
      estimate_number: editEst.estimate_number,
      id: editEst.id,
    });

    // Close modal and switch to create tab
    setEditEst(null);
    setTab("create");

    showToast(`📋 Estimate ${editEst.estimate_number} loaded — review & save as bill`);
  };

  // ── Flow 4 continued: Save converted estimate as bill ─────────────────────
  // Extends handleSaveBill: if converting from an estimate, also calls convert-to-bill
  const handleSaveConvertedBill = async () => {
    if (!patient)       { showToast("Search a patient first", true); return; }
    if (!items.length)  { showToast("Add at least one item",  true); return; }
    setSaving(true);
    try {
      const t = calcTotals(items, form);

      if (convertingFrom?.id) {
        // Step 1 — sync latest edits back to the estimate
        await apiRequest(
          `${BASE}discharge-billing/${convertingFrom.id}/`,
          "PATCH",
          buildPayload(items, form, t, "Estimate", patient)
        );
        // Step 2 — flip status to Billed via dedicated endpoint
        const res = await apiRequest(
          `${BASE}discharge-billing/${convertingFrom.id}/convert-to-bill/`,
          "POST",
          {}
        );
        const d = res?.id ? res : res?.data;
        if (d?.id || d?.bill_no) {
          showToast(`✓ Converted to Bill — ${d.bill_no || ""}`);
          handleReset(); fetchEstimates(); fetchBills(); setTab("bills");
        } else showToast(JSON.stringify(res?.error || res), true);
      } else {
        // Normal direct bill save (no estimate origin)
        const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Billed", patient));
        const d   = res?.id ? res : res?.data;
        if (d?.id) {
          showToast(`✓ Bill saved — ${d.bill_no || ""}`);
          handleReset(); fetchBills(); setTab("bills");
        } else showToast(JSON.stringify(res?.error || res), true);
      }
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredEst = estimates.filter(e => {
    if (estFrom && e.bill_date && new Date(e.bill_date) < new Date(estFrom)) return false;
    if (estTo   && e.bill_date && new Date(e.bill_date) > new Date(estTo+"T23:59:59")) return false;
    if (estQ) {
      const q  = estQ.toLowerCase();
      const pd = e.patient_details || {};
      return [(e.estimate_number||""),(e.uhid||""),(e.ip_number||""),(pd.patient_name||"")]
        .some(v => v.toLowerCase().includes(q));
    }
    return true;
  });

  const filteredBills = bills.filter(b => {
    if (billFrom && b.bill_date && new Date(b.bill_date) < new Date(billFrom)) return false;
    if (billTo   && b.bill_date && new Date(b.bill_date) > new Date(billTo+"T23:59:59")) return false;
    if (billQ) {
      const q  = billQ.toLowerCase();
      const pd = b.patient_details || {};
      return [(b.bill_no||""),(b.uhid||""),(b.ip_number||""),(pd.patient_name||"")]
        .some(v => v.toLowerCase().includes(q));
    }
    return true;
  });

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
        {/* ── Tabs ── */}
        <TabBar>
          <Tab $active={tab==="create"}    onClick={()=>setTab("create")}>🧾 Create Bill</Tab>
          <Tab $active={tab==="estimates"} onClick={()=>{setTab("estimates"); fetchEstimates();}}>
            📋 Estimates
            {estimates.length > 0 && <Badge $v="estimate" style={{marginLeft:4}}>{estimates.length}</Badge>}
          </Tab>
          <Tab $active={tab==="bills"} onClick={()=>{setTab("bills"); fetchBills();}}>
            ✅ Bills
            {bills.length > 0 && <Badge $v="billed" style={{marginLeft:4}}>{bills.length}</Badge>}
          </Tab>
        </TabBar>

        {/* ══════════════════════════════════════════
            CREATE TAB
        ══════════════════════════════════════════ */}
        {tab === "create" && (<>

          {/* Conversion banner — shown when pre-filled from an estimate */}
          {convertingFrom && (
            <ConvertBanner>
              <span style={{fontSize:"1.1rem"}}>🔄</span>
              <span>
                Converting from Estimate&nbsp;
                <strong>{convertingFrom.estimate_number}</strong>
                &nbsp;— all fields pre-filled. Review, adjust if needed, then click&nbsp;
                <strong>"Convert &amp; Save Bill"</strong>.
              </span>
              <Btn $ghost $sm style={{marginLeft:"auto",borderColor:"#7c3aed",color:"#7c3aed"}} onClick={handleReset}>
                ✕ Cancel
              </Btn>
            </ConvertBanner>
          )}

          {/* Patient search */}
          <Card>
            <CardHead>
              <CardTitle>Patient Search</CardTitle>
              {convertingFrom && <Badge $v="converting">From Estimate</Badge>}
            </CardHead>
            <SearchBar>
              <FG $w="200px">
                <FL>UHID <Req>*</Req></FL>
                <div style={{display:"flex",gap:5}}>
                  <FInput style={{flex:1}} value={uhid}
                    onChange={e=>{setUhid(e.target.value); setSearchErr("");}}
                    placeholder="e.g. S025/011667"
                    onKeyDown={e=>e.key==="Enter"&&doSearch("uhid")}
                  />
                  <IconBtn onClick={()=>doSearch("uhid")} disabled={searching}>
                    {searching ? <Spinner/> : "🔍"}
                  </IconBtn>
                </div>
              </FG>
              <FG $w="200px">
                <FL>IP Number <Req>*</Req></FL>
                <div style={{display:"flex",gap:5}}>
                  <FInput style={{flex:1}} value={ipNumber}
                    onChange={e=>{setIpNumber(e.target.value); setSearchErr("");}}
                    placeholder="e.g. S025/012488"
                    onKeyDown={e=>e.key==="Enter"&&doSearch("ipNumber")}
                  />
                  <IconBtn onClick={()=>doSearch("ipNumber")} disabled={searching}>
                    {searching ? <Spinner/> : "🔍"}
                  </IconBtn>
                </div>
              </FG>
              <FG $w="150px">
                <FL>Bill Up To</FL>
                <FInput type="date" value={form.bill_upto} onChange={e=>setForm("bill_upto",e.target.value)}/>
              </FG>
            </SearchBar>
            {searchErr && <ErrMsg>⚠ {searchErr}</ErrMsg>}
          </Card>

          {/* Patient details */}
          {patient && (
            <Card>
              <CardHead>
                <CardTitle>Patient Details</CardTitle>
                <Badge $v={convertingFrom ? "converting" : "billed"}>
                  {convertingFrom ? "📋 From Estimate" : "✓ Loaded"}
                </Badge>
              </CardHead>
              <PGrid>
                <PCell><PLbl>Name</PLbl>             <PVal>{patient.patient_name||"—"}</PVal></PCell>
                <PCell><PLbl>Age / Gender</PLbl>     <PVal>{patient.age||"—"} / {patient.gender||"—"}</PVal></PCell>
                <PCell><PLbl>Doctor</PLbl>            <PVal style={{fontSize:"0.79rem"}}>{patient.doctor||"—"}</PVal></PCell>
                <PCell $nr><PLbl>Admission Date</PLbl><PVal>{patient.admission_date||"—"}</PVal></PCell>
                <PCell $nb><PLbl>UHID / IP No</PLbl>  <PVal style={{fontFamily:"monospace",fontSize:"0.78rem"}}>{patient.uhid} / {patient.ip_number||"—"}</PVal></PCell>
                <PCell $nb><PLbl>Mobile</PLbl>         <PVal>{patient.mobile||"—"}</PVal></PCell>
                <PCell $nb><PLbl>Room / Days</PLbl>    <PVal>{patient.room_no||"—"} / {patient.total_days??0}d</PVal></PCell>
                <PCell $nb $nr><PLbl>Type / Company</PLbl><PVal style={{fontSize:"0.78rem",textTransform:"uppercase"}}>{patient.patient_type||"—"} / {patient.company||"—"}</PVal></PCell>
              </PGrid>
            </Card>
          )}

          {/* Items */}
          <Card>
            <CardHead>
              <CardTitle>Investigation / Billing Items</CardTitle>
              {items.length > 0 && (
                <span style={{fontSize:"0.71rem",color:T.textMuted}}>
                  {items.length} item{items.length!==1?"s":""}
                  {items.filter(i=>i._fromInvest).length > 0 && ` · ${items.filter(i=>i._fromInvest).length} from investigation`}
                </span>
              )}
            </CardHead>
            <ItemsSection
              items={items} newItem={newItem}
              onNIChange={handleNIChange} onAdd={handleAddItem} onClear={()=>setNewItem(EMPTY_ITEM)}
              onEdit={(key,field,val)=>setItems(p=>p.map(i=>i._key===key?recalcItem(i,field,val):i))}
              onRemove={key=>setItems(p=>p.filter(i=>i._key!==key))}
              disabled={!patient}
            />
          </Card>

          {/* Financials */}
          <Card>
            <CardHead><CardTitle>Financial Summary</CardTitle></CardHead>
            <FinancialGrid f={form} onChange={setForm} totals={totals}/>
            <FinActions>
              <Btn $ghost onClick={handleReset}>✕ Reset</Btn>
              {/* Only show "Save as Estimate" when NOT converting */}
              {!convertingFrom && (
                <Btn $amber onClick={handleSaveEstimate} disabled={saving||!patient}>
                  {saving ? <Spinner/> : "📋"} Save as Estimate
                </Btn>
              )}
              {convertingFrom ? (
                <Btn $purple onClick={handleSaveConvertedBill} disabled={saving||!patient}>
                  {saving ? <Spinner/> : "🧾"} Convert &amp; Save Bill
                </Btn>
              ) : (
                <Btn $primary onClick={handleSaveConvertedBill} disabled={saving||!patient}>
                  {saving ? <Spinner/> : "🧾"} Save as Final Bill
                </Btn>
              )}
            </FinActions>
          </Card>
        </>)}

        {/* ══════════════════════════════════════════
            ESTIMATES TAB
        ══════════════════════════════════════════ */}
        {tab === "estimates" && (
          <Card>
            <DateBar>
              <FG $w="135px"><FL>From</FL><FInput type="date" value={estFrom} onChange={e=>setEstFrom(e.target.value)}/></FG>
              <FG $w="135px"><FL>To</FL>  <FInput type="date" value={estTo}   onChange={e=>setEstTo(e.target.value)}/></FG>
              <FG $flex="1" style={{minWidth:210}}>
                <FL>Search</FL>
                <FInput value={estQ} onChange={e=>setEstQ(e.target.value)} placeholder="Name, UHID, IP, Estimate No…"/>
              </FG>
              <Btn $outline onClick={fetchEstimates} disabled={listBusy}>
                {listBusy ? <Spinner/> : "↺"} Refresh
              </Btn>
            </DateBar>
            <TScrollWrap>
              <LTable>
                <thead>
                  <tr>
                    <LTH style={{width:38}}>#</LTH>
                    <LTH>Estimate No.</LTH>
                    <LTH>UHID / IP</LTH>
                    <LTH>Patient</LTH>
                    <LTH>Items</LTH>
                    <LTH>Total</LTH>
                    <LTH>Discount</LTH>
                    <LTH>Net Amount</LTH>
                    <LTH>Date</LTH>
                    <LTH>Status</LTH>
                    <LTH>Action</LTH>
                  </tr>
                </thead>
                <tbody>
                  {filteredEst.length === 0 ? (
                    <tr><td colSpan={11}><NoResults>{listBusy?"Loading…":"No estimates found."}</NoResults></td></tr>
                  ) : filteredEst.map((e, i) => {
                    const pd = e.patient_details || {};
                    return (
                      <LTR key={e.id}>
                        <LTD style={{color:T.textMuted,fontWeight:600,fontSize:"0.74rem"}}>{i+1}</LTD>
                        <LTD><Mono>{e.estimate_number}</Mono></LTD>
                        <LTD style={{fontSize:"0.77rem"}}>{e.uhid||"—"} / {e.ip_number||"—"}</LTD>
                        <LTD style={{fontWeight:600}}>{pd.patient_name||"—"}</LTD>
                        <LTD style={{color:T.textMid}}>{parseItems(e.items).length}</LTD>
                        <LTD>₹{fmt(e.total_amount)}</LTD>
                        <LTD style={{color:T.danger}}>₹{fmt(e.total_disc)}</LTD>
                        <LTD style={{fontWeight:700}}>₹{fmt(e.net_amount)}</LTD>
                        <LTD style={{fontSize:"0.77rem"}}>{e.bill_date?new Date(e.bill_date).toLocaleDateString("en-IN"):"—"}</LTD>
                        <LTD><Badge $v="estimate">Estimate</Badge></LTD>
                        <LTD>
                          <Btn $sm $amber onClick={()=>openEdit(e)}>✏️ Edit / Convert</Btn>
                        </LTD>
                      </LTR>
                    );
                  })}
                </tbody>
              </LTable>
            </TScrollWrap>
          </Card>
        )}

        {/* ══════════════════════════════════════════
            BILLS TAB
        ══════════════════════════════════════════ */}
        {tab === "bills" && (
          <Card>
            <DateBar>
              <FG $w="135px"><FL>From</FL><FInput type="date" value={billFrom} onChange={e=>setBillFrom(e.target.value)}/></FG>
              <FG $w="135px"><FL>To</FL>  <FInput type="date" value={billTo}   onChange={e=>setBillTo(e.target.value)}/></FG>
              <FG $flex="1" style={{minWidth:210}}>
                <FL>Search</FL>
                <FInput value={billQ} onChange={e=>setBillQ(e.target.value)} placeholder="Name, UHID, IP, Bill No…"/>
              </FG>
              <Btn $outline onClick={fetchBills} disabled={listBusy}>
                {listBusy ? <Spinner/> : "↺"} Refresh
              </Btn>
            </DateBar>
            <TScrollWrap>
              <LTable>
                <thead>
                  <tr>
                    <LTH style={{width:38}}>#</LTH>
                    <LTH>Bill No.</LTH>
                    <LTH>Estimate No.</LTH>
                    <LTH>UHID / IP</LTH>
                    <LTH>Patient</LTH>
                    <LTH>Total</LTH>
                    <LTH>Advance</LTH>
                    <LTH>Discount</LTH>
                    <LTH>GST</LTH>
                    <LTH>Net Amount</LTH>
                    <LTH>Bill Date</LTH>
                    <LTH>Status</LTH>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr><td colSpan={12}><NoResults>{listBusy?"Loading…":"No bills found."}</NoResults></td></tr>
                  ) : filteredBills.map((b, i) => {
                    const pd = b.patient_details || {};
                    return (
                      <LTR key={b.id}>
                        <LTD style={{color:T.textMuted,fontWeight:600,fontSize:"0.74rem"}}>{i+1}</LTD>
                        <LTD><Mono style={{color:T.primary,fontWeight:700}}>{b.bill_no}</Mono></LTD>
                        <LTD><Mono style={{fontSize:"0.73rem",color:T.textMuted}}>{b.estimate_number||"—"}</Mono></LTD>
                        <LTD style={{fontSize:"0.77rem"}}>{b.uhid||"—"} / {b.ip_number||"—"}</LTD>
                        <LTD style={{fontWeight:600}}>{pd.patient_name||"—"}</LTD>
                        <LTD>₹{fmt(b.total_amount)}</LTD>
                        <LTD style={{color:T.danger}}>₹{fmt(b.advance_amount)}</LTD>
                        <LTD style={{color:T.danger}}>₹{fmt(b.total_disc)}</LTD>
                        <LTD style={{color:T.blue}}>₹{fmt(b.gst_amount)}</LTD>
                        <LTD style={{fontWeight:700,color:T.success}}>₹{fmt(b.net_amount)}</LTD>
                        <LTD style={{fontSize:"0.77rem"}}>{b.bill_date?new Date(b.bill_date).toLocaleDateString("en-IN"):"—"}</LTD>
                        <LTD><Badge $v="billed">Billed</Badge></LTD>
                      </LTR>
                    );
                  })}
                </tbody>
              </LTable>
            </TScrollWrap>
          </Card>
        )}
      </Content>

      {/* ══════════════════════════════════════════
          EDIT ESTIMATE MODAL  (Flow 3 & 4)
      ══════════════════════════════════════════ */}
      {editEst && (
        <Overlay onClick={()=>!editSaving&&!convSaving&&setEditEst(null)}>
          <ModalWrap onClick={e=>e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>
                📋 {editEst.estimate_number}
                <Badge $v="estimate" style={{background:"rgba(255,255,255,0.15)",color:"#fff"}}>Estimate</Badge>
              </ModalTitle>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn $ghost style={{background:"rgba(255,255,255,0.12)",color:"#fff",borderColor:"rgba(255,255,255,0.2)"}}
                  onClick={handleUpdateEst} disabled={editSaving||convSaving}>
                  {editSaving ? <Spinner/> : "💾"} Save Estimate
                </Btn>
                <Btn $amber onClick={handleConvert} disabled={editSaving||convSaving}>
                  {convSaving ? <Spinner/> : "🧾"} Convert to Bill
                </Btn>
                <CloseBtn onClick={()=>setEditEst(null)}>✕</CloseBtn>
              </div>
            </ModalHead>

            <ModalBody>
              {/* Patient strip */}
              {(() => {
                const pd = editEst.patient_details || {};
                const cells = [
                  ["Patient",    pd.patient_name||"—"],
                  ["UHID",       editEst.uhid||"—"],
                  ["IP Number",  editEst.ip_number||"—"],
                  ["Est. Date",  editEst.bill_date?new Date(editEst.bill_date).toLocaleDateString("en-IN"):"—"],
                  ["Age",        pd.age||"—"],
                  ["Gender",     pd.gender||"—"],
                  ["Mobile",     pd.mobile||"—"],
                  ["Est. No.",   editEst.estimate_number],
                ];
                return (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",border:`1px solid ${T.border}`,borderRadius:8,marginBottom:12,overflow:"hidden"}}>
                    {cells.map(([lbl,val],i)=>(
                      <PCell key={i} $nb={i>=4} $nr={[3,7].includes(i)}>
                        <PLbl>{lbl}</PLbl><PVal>{val}</PVal>
                      </PCell>
                    ))}
                  </div>
                );
              })()}

              {/* Items */}
              <Card style={{marginBottom:10}}>
                <CardHead>
                  <CardTitle>Items</CardTitle>
                  <span style={{fontSize:"0.71rem",color:T.textMuted}}>{editItems.length} item{editItems.length!==1?"s":""}</span>
                </CardHead>
                <ItemsSection
                  items={editItems} newItem={editNI}
                  onNIChange={editNIChange} onAdd={editAddItem} onClear={()=>setEditNI(EMPTY_ITEM)}
                  onEdit={(key,field,val)=>setEditItems(p=>p.map(i=>i._key===key?recalcItem(i,field,val):i))}
                  onRemove={key=>setEditItems(p=>p.filter(i=>i._key!==key))}
                  disabled={false}
                />
              </Card>

              {/* Financials */}
              <Card>
                <CardHead><CardTitle>Financial Summary</CardTitle></CardHead>
                <FinancialGrid f={editForm} onChange={setEditForm} totals={editTotals}/>
                <FinActions>
                  <Btn $ghost onClick={()=>setEditEst(null)} disabled={editSaving||convSaving}>✕ Close</Btn>
                  <Btn $ghost style={{borderColor:T.primary,color:T.primary}} onClick={handleUpdateEst} disabled={editSaving||convSaving}>
                    {editSaving ? <Spinner/> : "💾"} Save Estimate
                  </Btn>
                  <Btn $amber onClick={handleConvert} disabled={editSaving||convSaving}>
                    {convSaving ? <Spinner/> : "🧾"} Convert to Bill
                  </Btn>
                </FinActions>
              </Card>
            </ModalBody>
          </ModalWrap>
        </Overlay>
      )}
    </PageWrap>
  );
};

export default DischargeBilling;