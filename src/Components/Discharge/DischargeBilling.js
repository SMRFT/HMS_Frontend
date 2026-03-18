import React, { useState, useEffect, useCallback } from "react";
import {
  PageWrapper,
  Container,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Label,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── Styled Components ────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 10px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
`;
const Breadcrumb = styled.div`
  font-size: 0.78rem; color: ${colors.textMuted};
  span { color: ${colors.primary}; font-weight: 600; }
`;
const HeaderActions = styled.div`display: flex; gap: 8px;`;
const HeaderBtn = styled.button`
  display: flex; align-items: center; gap: 5px;
  padding: 5px 13px; border-radius: 5px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1.5px solid;
  transition: all 0.15s;
  background: ${(p) => p.primary ? colors.primary : p.amber ? "#f59e0b" : "white"};
  color: ${(p) => (p.primary || p.amber) ? "white" : colors.primary};
  border-color: ${(p) => p.amber ? "#f59e0b" : colors.primary};
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const TopBar = styled.div`
  background: white; border: 1px solid ${colors.border}; border-radius: 7px;
  padding: 10px 14px; display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 10px;
`;
const FieldGroup = styled.div`
  display: flex; flex-direction: column; gap: 3px; min-width: ${(p) => p.w || "160px"};
`;
const FieldLabel = styled.label`
  font-size: 0.7rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.3px;
`;
const Required = styled.span`color: #dc2626; margin-left: 2px;`;
const CompactInput = styled(Input)`padding: 5px 9px; font-size: 0.82rem; height: 30px;`;
const CompactSelect = styled(Select)`padding: 5px 9px; font-size: 0.82rem; height: 30px;`;
const SearchBtn = styled.button`
  height: 30px; width: 30px; border-radius: 50%;
  border: 1.5px solid ${colors.primary}; background: ${colors.primary}; color: white;
  cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  &:hover { opacity: 0.85; } &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const InputWithSearch = styled.div`display: flex; align-items: center; gap: 5px;`;

const PatientCard = styled.div`
  display: grid; grid-template-columns: 1fr auto;
  border: 1px solid ${colors.border}; border-radius: 7px; overflow: hidden; margin-bottom: 10px;
`;
const PatientLeft  = styled.div`display: grid; grid-template-columns: repeat(3, 1fr);`;
const PatientRight = styled.div`width: 280px; border-left: 1px solid ${colors.border}; display: grid; grid-template-columns: 1fr 1fr;`;
const PCell = styled.div`
  padding: 5px 12px;
  border-right:  ${(p) => p.noBorderRight  ? "none" : `1px solid ${colors.border}`};
  border-bottom: ${(p) => p.noBorderBottom ? "none" : `1px solid ${colors.border}`};
`;
const PCellLabel = styled.div`
  font-size: 0.65rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.3px;
`;
const PCellValue = styled.div`
  font-size: 0.82rem; font-weight: 600; color: ${colors.textMain};
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const SectionCard  = styled.div`border: 1px solid ${colors.border}; border-radius: 7px; overflow: hidden; margin-bottom: 10px;`;
const SectionHead  = styled.div`
  background: #f1f5f9; border-bottom: 1px solid ${colors.border};
  padding: 6px 12px; display: flex; align-items: center; gap: 8px;
`;
const SectionTitle = styled.span`font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: ${colors.textMain};`;

const ItemInputRow = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 0.8fr 0.8fr 0.9fr 1.4fr 1fr 1.8fr 60px;
  gap: 6px; align-items: flex-end; padding: 8px 12px;
  border-bottom: 1px solid ${colors.border}; background: #fafafa;
`;
const ItemTableHead = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1fr 0.7fr 0.8fr 0.8fr 1fr 1.5fr 1.5fr 1fr 60px;
  gap: 4px; padding: 5px 12px; background: #f8fafc; border-bottom: 1px solid ${colors.border};
`;
const ItemTableRow = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1fr 0.7fr 0.8fr 0.8fr 1fr 1.5fr 1.5fr 1fr 60px;
  gap: 4px; padding: 5px 12px; border-bottom: 1px dashed ${colors.border}; align-items: center;
  &:last-child { border-bottom: none; } &:hover { background: #f8fafc; }
`;
const ColHead = styled.span`font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: ${colors.textMuted};`;
const ColCell = styled.span`font-size: 0.82rem; color: ${colors.textMain};`;
const TinyInput = styled.input`
  width: 100%; padding: 3px 6px; font-size: 0.8rem;
  border: 1px solid ${colors.border}; border-radius: 4px; outline: none;
  &:focus { border-color: ${colors.primary}; }
  &:read-only { background: #f1f5f9; color: ${colors.textMuted}; }
`;
const IconBtn = styled.button`
  background: none; border: none; cursor: pointer; padding: 3px 5px; border-radius: 4px; font-size: 0.9rem;
  color: ${(p) => p.danger ? "#dc2626" : colors.primary};
  &:hover { background: ${(p) => p.danger ? "#fee2e2" : "#e0f2fe"}; }
`;

const FinancialGrid = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid ${colors.border};`;
const FinCol = styled.div`
  padding: 8px 12px; border-right: 1px solid ${colors.border};
  &:last-child { border-right: none; } display: flex; flex-direction: column; gap: 7px;
`;
const FinRow   = styled.div`display: flex; align-items: center; gap: 6px; font-size: 0.8rem;`;
const FinLabel = styled.span`min-width: ${(p) => p.w || "96px"}; color: ${colors.textMain}; font-weight: 500; flex-shrink: 0; font-size: 0.78rem;`;
const FinInput = styled.input`
  flex: 1; padding: 3px 7px; font-size: 0.8rem; border: 1px solid ${colors.border};
  border-radius: 4px; outline: none; text-align: right; min-width: 0;
  &:focus { border-color: ${colors.primary}; }
  &[readOnly] { background: #f1f5f9; color: ${colors.textMuted}; }
`;
const RupeeIcon    = styled.span`color: ${colors.textMuted}; font-size: 0.78rem; flex-shrink: 0;`;
const FinActionsRow = styled.div`
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  padding: 8px 12px; border-top: 1px solid ${colors.border}; background: #fafafa;
`;

const CheckRow  = styled.div`display: flex; gap: 14px; align-items: center; flex-wrap: wrap;`;
const CheckLabel = styled.label`
  display: flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 600;
  color: ${colors.textMain}; cursor: pointer; user-select: none;
  input { accent-color: ${colors.primary}; }
`;

const TabBar = styled.div`
  display: flex; background: ${colors.tabBg || "#f8fafc"};
  border-bottom: 2px solid ${colors.border}; margin-bottom: 12px;
`;
const Tab = styled.button`
  padding: 9px 20px; border: none;
  background: ${(p) => p.active ? "white" : "transparent"};
  color: ${(p) => p.active ? colors.primary : colors.textMuted};
  font-weight: ${(p) => p.active ? 700 : 500}; font-size: 0.85rem; cursor: pointer;
  border-bottom: ${(p) => p.active ? `2px solid ${colors.primary}` : "2px solid transparent"};
  margin-bottom: -2px; transition: all 0.15s;
  &:hover { color: ${colors.primary}; }
`;
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 20px; font-size: 0.68rem; font-weight: 700;
  background: ${(p) => p.v==="green" ? "#dcfce7" : p.v==="orange" ? "#ffedd5" : p.v==="blue" ? "#dbeafe" : "#f1f5f9"};
  color:      ${(p) => p.v==="green" ? "#16a34a" : p.v==="orange" ? "#c2410c" : p.v==="blue" ? "#1d4ed8" : colors.textMuted};
`;
const ActionBtn = styled.button`
  padding: 3px 10px; border: none; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;
  background: ${(p) => p.success ? "#dcfce7" : p.amber ? "#fef3c7" : "#dbeafe"};
  color:      ${(p) => p.success ? "#16a34a" : p.amber ? "#92400e" : "#1d4ed8"};
  &:hover { opacity: 0.8; } &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const ErrText    = styled.div`color: #dc2626; font-size: 0.72rem; margin-top: 2px; padding-left: 2px;`;
const EmptyState = styled.div`text-align: center; padding: 30px; color: ${colors.textMuted}; font-size: 0.85rem;`;

const Overlay  = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
`;
const ModalBox = styled.div`
  background: white; border-radius: 10px; width: 97%; max-width: 1100px;
  max-height: 95vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
`;
const ModalHead = styled.div`
  padding: 13px 20px; border-bottom: 1px solid ${colors.border};
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; background: white; z-index: 10;
`;
const ModalTitle = styled.h3`margin: 0; font-size: 0.95rem; font-weight: 700; color: ${colors.primary};`;

// Status pill inside modal header
const StatusPill = styled.span`
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: 20px; font-size: 0.72rem; font-weight: 700;
  background: ${(p) => p.billed ? "#dcfce7" : "#ffedd5"};
  color:      ${(p) => p.billed ? "#16a34a" : "#c2410c"};
  border: 1px solid ${(p) => p.billed ? "#86efac" : "#fdba74"};
`;

// ─── Constants / Helpers ─────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount:"", sales_return:"", medicines:"", taxable:"", non_tax:"",
  tpa_paid:"", sales_tax:"", gst_amount:"", room_tax:"", cess:"", luxury_tax:"",
  clerk:"", discount_percent:"", discount_amount:"", disc_reason:"",
  bill_upto: new Date().toISOString().split("T")[0],
  staff_id:"", charity_type:"",
  is_discharge:true, show_advances:false, group_items:true, part_bill:false,
};
const EMPTY_ITEM = {
  itemName:"", description:"", quantity:1, rate:"", discount:0,
  amount:"", doctor:"", doctor_fee:"", item_description:"", package_name:"",
};

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);
const fc  = (setF) => (field, value) => setF((p) => ({ ...p, [field]: value }));

const investItemToRow = (it) => {
  const qty = it.quantity || 1;
  const price = it.price || 0;
  return {
    itemName: it.itemName || "", description: it.billTypeNo || "",
    quantity: qty, rate: price, discount: 0, amount: qty * price,
    doctor: it.doctor || "", doctor_fee: "", item_description: "",
    package_name: it.package_name || "", invest_bill_no: it.invest_bill_no || "",
    bill_object_id: it.bill_object_id || "", payment_status: it.payment_status || "",
    test_id: it.test_id ?? null,
    _key: `inv_${it.test_id ?? it.itemName}_${Date.now()}_${Math.random()}`,
    _fromBackend: true,
  };
};

const parseItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

// FIX: include ip_number in the form derived from estimate
const estimateToForm = (est) => ({
  advance_amount:   String(parseFloat(est.advance_amount)   || ""),
  sales_return:     String(parseFloat(est.sales_return)     || ""),
  medicines:        String(parseFloat(est.medicines_amount) || ""),
  taxable:          String(parseFloat(est.taxable_amount)   || ""),
  non_tax:          String(parseFloat(est.non_tax_amount)   || ""),
  tpa_paid:         "",
  sales_tax:        "",
  gst_amount:       String(parseFloat(est.gst_amount)       || ""),
  room_tax:         String(parseFloat(est.room_tax)         || ""),
  cess:             "",
  luxury_tax:       "",
  clerk:            est.clerk         || "",
  discount_percent: String(parseFloat(est.discount_percent) || ""),
  discount_amount:  String(parseFloat(est.discount_amount)  || ""),
  disc_reason:      est.disc_reason   || "",
  bill_upto:        est.bill_date
    ? new Date(est.bill_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  staff_id:         est.staff_id      || "",
  charity_type:     est.charity_type  || "",
  remarks:          est.remarks       || "",
  is_discharge: true, show_advances: false, group_items: true, part_bill: false,
});

const calcFinancials = (its, f) => {
  const totalAmount = its.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const itemDisc    = its.reduce((a, i) => a + (parseFloat(i.discount) || 0), 0);
  const discPercent = parseFloat(f.discount_percent) || 0;
  const discAmt     = parseFloat(f.discount_amount) || (totalAmount * discPercent) / 100;
  const totalDisc   = discAmt + itemDisc;
  const netAmount   = Math.max(0,
    totalAmount
    + (parseFloat(f.gst_amount)     || 0)
    + (parseFloat(f.room_tax)       || 0)
    + (parseFloat(f.medicines)      || 0)
    + (parseFloat(f.sales_tax)      || 0)
    + (parseFloat(f.cess)           || 0)
    + (parseFloat(f.luxury_tax)     || 0)
    - (parseFloat(f.advance_amount) || 0)
    - (parseFloat(f.sales_return)   || 0)
    - totalDisc
    - (parseFloat(f.tpa_paid)       || 0)
  );
  return { totalAmount, itemDisc, discAmt, totalDisc, netAmount };
};

const buildPatchPayload = (its, f, totals) => ({
  items:            its.map(({ _key, _fromBackend, ...rest }) => rest),
  total_amount:     totals.totalAmount,
  advance_amount:   parseFloat(f.advance_amount)   || 0,
  sales_return:     parseFloat(f.sales_return)     || 0,
  medicines_amount: parseFloat(f.medicines)        || 0,
  taxable_amount:   parseFloat(f.taxable)          || 0,
  non_tax_amount:   parseFloat(f.non_tax)          || 0,
  gst_amount:       parseFloat(f.gst_amount)       || 0,
  room_tax:         parseFloat(f.room_tax)         || 0,
  discount_percent: parseFloat(f.discount_percent) || 0,
  discount_amount:  totals.discAmt,
  disc_reason:      f.disc_reason,
  item_disc:        totals.itemDisc,
  total_disc:       totals.totalDisc,
  net_amount:       totals.netAmount,
  remarks:          f.remarks || "",
  staff_id:         f.staff_id,
  charity_type:     f.charity_type,
});

// ─── Item-row edit helper ─────────────────────────────────────────────────────

const applyItemEdit = (items, key, field, value) =>
  items.map((item) => {
    if (item._key !== key) return item;
    const u = { ...item, [field]: value };
    if (["quantity","rate","discount"].includes(field)) {
      const qty  = parseFloat(field === "quantity" ? value : u.quantity) || 0;
      const rate = parseFloat(field === "rate"     ? value : u.rate)     || 0;
      const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
      u.amount   = Math.max(0, qty * rate - disc);
    }
    return u;
  });

// ─── Shared Item Input Row ────────────────────────────────────────────────────

const ItemAddRow = ({ newItem, onChange, onAdd, onClear, disabled }) => (
  <ItemInputRow>
    <FieldGroup w="100%">
      <FieldLabel>Item Name <Required>*</Required></FieldLabel>
      <TinyInput value={newItem.itemName} onChange={(e) => onChange("itemName", e.target.value)} placeholder="Type item name…" disabled={disabled} />
    </FieldGroup>
    <FieldGroup><FieldLabel>Qty</FieldLabel><TinyInput type="number" min={1} value={newItem.quantity} onChange={(e) => onChange("quantity", Number(e.target.value)||1)} disabled={disabled} /></FieldGroup>
    <FieldGroup><FieldLabel>Price</FieldLabel><TinyInput type="number" min={0} value={newItem.rate} onChange={(e) => onChange("rate", e.target.value)} disabled={disabled} /></FieldGroup>
    <FieldGroup><FieldLabel>Discount</FieldLabel><TinyInput type="number" min={0} value={newItem.discount} onChange={(e) => onChange("discount", e.target.value)} disabled={disabled} /></FieldGroup>
    <FieldGroup><FieldLabel>Amount</FieldLabel><TinyInput readOnly value={fmt(newItem.amount)} /></FieldGroup>
    <FieldGroup><FieldLabel>Doctor</FieldLabel><TinyInput value={newItem.doctor} onChange={(e) => onChange("doctor", e.target.value)} disabled={disabled} /></FieldGroup>
    <FieldGroup><FieldLabel>Doctor Fee</FieldLabel><TinyInput type="number" min={0} value={newItem.doctor_fee} onChange={(e) => onChange("doctor_fee", e.target.value)} disabled={disabled} /></FieldGroup>
    <FieldGroup><FieldLabel>Description</FieldLabel><TinyInput value={newItem.item_description} onChange={(e) => onChange("item_description", e.target.value)} disabled={disabled} /></FieldGroup>
    <div style={{ display:"flex", gap:5, alignItems:"flex-end" }}>
      <button onClick={onAdd} disabled={disabled} style={{ width:28,height:28,borderRadius:4,background:colors.primary,border:"none",color:"white",fontWeight:700,fontSize:"1.1rem",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1 }}>+</button>
      <button onClick={onClear} style={{ width:28,height:28,borderRadius:4,background:"#f1f5f9",border:`1px solid ${colors.border}`,cursor:"pointer",fontSize:"0.9rem" }}>↺</button>
    </div>
  </ItemInputRow>
);

// ─── Shared Financial Grid ────────────────────────────────────────────────────

const FinGrid = ({ f, setF, totals, readOnly = false }) => (
  <FinancialGrid>
    <FinCol>
      <FinRow><FinLabel>Total Amount</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly value={fmt(totals.totalAmount)} /></FinRow>
      <FinRow><FinLabel>Advance</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.advance_amount} onChange={(e) => setF("advance_amount", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Sales Return</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.sales_return} onChange={(e) => setF("sales_return", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Medicines</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.medicines} onChange={(e) => setF("medicines", e.target.value)} /></FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLabel>Taxable</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.taxable} onChange={(e) => setF("taxable", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Non Tax</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.non_tax} onChange={(e) => setF("non_tax", e.target.value)} /></FinRow>
      <FinRow><FinLabel>TPA Paid</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.tpa_paid} onChange={(e) => setF("tpa_paid", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Sales Tax</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.sales_tax} onChange={(e) => setF("sales_tax", e.target.value)} /></FinRow>
      <FinRow style={{ fontWeight:700 }}>
        <FinLabel style={{ fontWeight:700 }}>Net Amount</FinLabel><RupeeIcon>₹</RupeeIcon>
        <FinInput readOnly value={fmt(totals.netAmount)} style={{ fontWeight:700, color:colors.primary, background:"#f0fdf4", border:"1px solid #86efac" }} />
      </FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLabel>GST</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.gst_amount} onChange={(e) => setF("gst_amount", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Room Tax</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.room_tax} onChange={(e) => setF("room_tax", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Cess</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.cess} onChange={(e) => setF("cess", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Luxury Tax</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly={readOnly} type="number" min={0} value={f.luxury_tax} onChange={(e) => setF("luxury_tax", e.target.value)} /></FinRow>
      <FinRow><FinLabel>Clerk</FinLabel><FinInput readOnly={readOnly} value={f.clerk} onChange={(e) => setF("clerk", e.target.value)} style={{ textAlign:"left" }} /></FinRow>
    </FinCol>
    <FinCol>
      <FinRow>
        <FinLabel>Discount</FinLabel>
        <FinInput readOnly={readOnly} type="number" min={0} max={100} value={f.discount_percent} onChange={(e) => setF("discount_percent", e.target.value)} style={{ width:52, flexGrow:0, textAlign:"center" }} />
        <span style={{ fontSize:"0.78rem", color:colors.textMuted }}>%</span>
        <FinInput readOnly={readOnly} type="number" min={0} value={f.discount_amount} onChange={(e) => setF("discount_amount", e.target.value)} />
      </FinRow>
      <FinRow><FinLabel>Disc Reason</FinLabel><FinInput readOnly={readOnly} value={f.disc_reason} onChange={(e) => setF("disc_reason", e.target.value)} style={{ textAlign:"left" }} /></FinRow>
      <FinRow><FinLabel>Item Disc</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly value={fmt(totals.itemDisc)} /></FinRow>
      <FinRow><FinLabel>Total Disc</FinLabel><RupeeIcon>₹</RupeeIcon><FinInput readOnly value={fmt(totals.totalDisc)} /></FinRow>
      <FinRow>
        <FinLabel>Remarks</FinLabel>
        <FinInput readOnly={readOnly} value={f.remarks || ""} onChange={(e) => setF("remarks", e.target.value)} style={{ textAlign:"left" }} />
      </FinRow>
    </FinCol>
  </FinancialGrid>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DischargeBilling = () => {
  const [activeTab, setActiveTab] = useState("create");

  // ── Create tab ──────────────────────────────────────────────────────────────
  const [uhid,           setUhid]           = useState("");
  const [ipNumber,       setIpNumber]       = useState("");
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [searchError,    setSearchError]    = useState("");
  const [patientInfo,    setPatientInfo]    = useState(null);
  const [investItems,    setInvestItems]    = useState([]);
  const [items,          setItems]          = useState([]);
  const [newItem,        setNewItem]        = useState(EMPTY_ITEM);
  const [form,           setFormRaw]        = useState(EMPTY_FORM);
  const setField = fc(setFormRaw);

  // ── Lists ───────────────────────────────────────────────────────────────────
  const [estimates, setEstimates] = useState([]);
  const [bills,     setBills]     = useState([]);

  // ── Edit estimate modal ─────────────────────────────────────────────────────
  const [editEst,       setEditEst]       = useState(null);
  const [editItems,     setEditItems]     = useState([]);
  const [editNewItem,   setEditNewItem]   = useState(EMPTY_ITEM);
  const [editForm,      setEditFormRaw]   = useState(EMPTY_FORM);
  const setEditField = fc(setEditFormRaw);
  const [editLoading,   setEditLoading]   = useState(false);
  const [convLoading,   setConvLoading]   = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchEstimates = useCallback(async () => {
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/?status=Estimate`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEstimates(list);
    } catch { showToast("Failed to fetch estimates", "error"); }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/?status=Billed`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setBills(list);
    } catch { showToast("Failed to fetch bills", "error"); }
  }, []);

  useEffect(() => { fetchEstimates(); fetchBills(); }, [fetchEstimates, fetchBills]);

  // ── Patient Search ──────────────────────────────────────────────────────────

  const handleSearch = async (mode) => {
    const val = mode === "uhid" ? uhid.trim() : ipNumber.trim();
    if (!val) { setSearchError("Please enter a value"); return; }
    setSearchError(""); setSearchLoading(true);
    setPatientInfo(null); setInvestItems([]); setItems([]); setNewItem(EMPTY_ITEM);
    try {
      const param = mode === "uhid"
        ? `uhid=${encodeURIComponent(val)}`
        : `ipNumber=${encodeURIComponent(val)}`;
      const raw     = await apiRequest(`${baseUrl}search-discharge-patient/?${param}`, "GET");
      const res     = raw?.data !== undefined ? raw.data : raw;
      const patient = res?.patient;
      if (patient) {
        const norm = { ...patient, ip_number: patient.ip_number || patient.ipNumber || "" };
        setPatientInfo(norm);
        const bi = Array.isArray(res.invest_items) ? res.invest_items : [];
        setInvestItems(bi);
        if (bi.length) setItems(bi.map(investItemToRow));
        if (norm.uhid)      setUhid(norm.uhid);
        if (norm.ip_number) setIpNumber(norm.ip_number);
      } else { setSearchError("No record found"); }
    } catch (err) { console.error(err); setSearchError("Error searching — check network"); }
    finally { setSearchLoading(false); }
  };

  // ── Create-tab item helpers ─────────────────────────────────────────────────

  const handleNewItemChange = (field, value) =>
    setNewItem((p) => {
      const u = { ...p, [field]: value };
      if (["quantity","rate","discount"].includes(field)) {
        const qty = parseFloat(field==="quantity"?value:u.quantity)||0;
        const rate= parseFloat(field==="rate"    ?value:u.rate    )||0;
        const disc= parseFloat(field==="discount"?value:u.discount)||0;
        u.amount  = Math.max(0, qty*rate-disc);
      }
      return u;
    });

  const handleAddItem = () => {
    if (!newItem.itemName) { showToast("Enter item name first","error"); return; }
    setItems((p) => [...p, { ...newItem, _key:`m_${Date.now()}`, _fromBackend:false }]);
    setNewItem(EMPTY_ITEM);
  };
  const handleRemoveItem = (key) => setItems((p) => p.filter((i) => i._key !== key));
  const handleEditItem   = (key, field, value) => setItems((p) => applyItemEdit(p, key, field, value));

  // ── Create-tab financials ───────────────────────────────────────────────────

  const totals = calcFinancials(items, form);

  // ── Save (create) ───────────────────────────────────────────────────────────

  const saveNew = async (billStatus) => {
    if (!patientInfo)  { showToast("Search a patient first", "error"); return; }
    if (!items.length) { showToast("Add at least one item",  "error"); return; }
    setLoading(true);
    try {
      const t = calcFinancials(items, form);
      const payload = {
        status:    billStatus,
        uhid:      patientInfo.uhid      || null,
        ip_number: patientInfo.ip_number || null,
        ...buildPatchPayload(items, form, t),
      };
      const res  = await apiRequest(`${baseUrl}discharge-billing/`, "POST", payload);
      const data = res?.id ? res : res?.data;
      if (data?.id) {
        showToast(billStatus === "Estimate"
          ? `Estimate saved — ${data.estimate_number || ""}`
          : `Bill saved — ${data.bill_no || ""}`);
        handleReset();
        if (billStatus === "Estimate") { fetchEstimates(); setActiveTab("estimates"); }
        else                           { fetchBills();     setActiveTab("bills"); }
      } else { showToast(JSON.stringify(res?.data || res), "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setPatientInfo(null); setInvestItems([]); setItems([]);
    setNewItem(EMPTY_ITEM); setUhid(""); setIpNumber("");
    setSearchError(""); setFormRaw(EMPTY_FORM);
  };

  // ── Open estimate modal ─────────────────────────────────────────────────────

  const openEdit = (est) => {
    // FIX: parse items from saved JSON string or array, hydrate with _key
    const parsedItems = parseItems(est.items).map((it, idx) => ({
      ...EMPTY_ITEM,
      ...it,
      // ensure amount is numeric
      amount: parseFloat(it.amount) || (parseFloat(it.quantity || 1) * parseFloat(it.rate || 0)),
      _key: `e_${idx}_${Date.now()}`,
      _fromBackend: false,
    }));
    setEditItems(parsedItems);
    setEditFormRaw(estimateToForm(est));
    setEditNewItem(EMPTY_ITEM);
    setEditEst(est);
  };

  // ── Modal item helpers ──────────────────────────────────────────────────────

  const handleEditModalItemChange = (key, field, value) =>
    setEditItems((p) => applyItemEdit(p, key, field, value));

  const handleEditModalRemoveItem = (key) =>
    setEditItems((p) => p.filter((i) => i._key !== key));

  const handleEditModalNewItemChange = (field, value) =>
    setEditNewItem((p) => {
      const u = { ...p, [field]: value };
      if (["quantity","rate","discount"].includes(field)) {
        const qty = parseFloat(field==="quantity"?value:u.quantity)||0;
        const rate= parseFloat(field==="rate"    ?value:u.rate    )||0;
        const disc= parseFloat(field==="discount"?value:u.discount)||0;
        u.amount  = Math.max(0, qty*rate-disc);
      }
      return u;
    });

  const handleEditModalAddItem = () => {
    if (!editNewItem.itemName) { showToast("Enter item name first","error"); return; }
    setEditItems((p) => [...p, { ...editNewItem, _key:`em_${Date.now()}`, _fromBackend:false }]);
    setEditNewItem(EMPTY_ITEM);
  };

  // ── Modal financials ────────────────────────────────────────────────────────

  const editTotals = calcFinancials(editItems, editForm);

  // ── Save estimate update (PATCH — status stays Estimate) ───────────────────

  const handleUpdateEstimate = async () => {
    if (!editItems.length) { showToast("Add at least one item","error"); return; }
    setEditLoading(true);
    try {
      const t       = calcFinancials(editItems, editForm);
      const payload = { status: "Estimate", ...buildPatchPayload(editItems, editForm, t) };
      const res     = await apiRequest(`${baseUrl}discharge-billing/${editEst.id}/`, "PATCH", payload);
      // Accept either shape: { id, ... } or { data: { id, ... } }
      const data    = res?.id ? res : res?.data;
      if (data?.id) {
        showToast(`Estimate updated — ${data.estimate_number || editEst.estimate_number}`);
        setEditEst(null);
        fetchEstimates();
      } else {
        showToast(JSON.stringify(res?.data || res), "error");
      }
    } catch { showToast("Network error","error"); }
    finally { setEditLoading(false); }
  };

  // ── Convert to final bill ───────────────────────────────────────────────────
  // Flow:
  //   1. PATCH the estimate with latest items + financials (keeps status=Estimate)
  //   2. POST to convert-to-bill  →  backend sets status=Billed, generates bill_no

  const handleConvertToBill = async () => {
    if (!editItems.length) { showToast("Add at least one item","error"); return; }
    setConvLoading(true);
    try {
      // Step 1 — persist latest edits
      const t     = calcFinancials(editItems, editForm);
      const patch = { status: "Estimate", ...buildPatchPayload(editItems, editForm, t) };
      await apiRequest(`${baseUrl}discharge-billing/${editEst.id}/`, "PATCH", patch);

      // Step 2 — convert (sets status=Billed + generates bill_no in same document)
      const res  = await apiRequest(
        `${baseUrl}discharge-billing/${editEst.id}/convert-to-bill/`,
        "POST",
        {}
      );
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.bill_no) {
        showToast(`Converted to Bill — ${data.bill_no || ""}`);
        setEditEst(null);
        fetchEstimates();
        fetchBills();
        setActiveTab("bills");
      } else {
        showToast(JSON.stringify(res?.error || res), "error");
      }
    } catch { showToast("Network error","error"); }
    finally { setConvLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {toast && (
        <div style={{
          position:"fixed", top:16, right:16, zIndex:9999,
          padding:"10px 18px", borderRadius:6, color:"white", fontWeight:600, fontSize:"0.875rem",
          background: toast.type==="error" ? "#dc2626" : "#16a34a",
          boxShadow:"0 4px 12px rgba(0,0,0,0.18)",
        }}>{toast.msg}</div>
      )}

      <Container>
        <PageHeader>
          <Breadcrumb>Home / <span>Discharge Bill</span></Breadcrumb>
          <HeaderActions>
            <HeaderBtn onClick={() => { setActiveTab("estimates"); fetchEstimates(); }}>📋 View Estimates</HeaderBtn>
            <HeaderBtn onClick={() => {}}>🔔 Pending Discharge Request</HeaderBtn>
            <HeaderBtn primary onClick={() => { setActiveTab("bills"); fetchBills(); }}>🧾 View Bills</HeaderBtn>
          </HeaderActions>
        </PageHeader>

        <TabBar>
          <Tab active={activeTab==="create"}    onClick={() => setActiveTab("create")}>Create Bill / Estimate</Tab>
          <Tab active={activeTab==="estimates"} onClick={() => { setActiveTab("estimates"); fetchEstimates(); }}>Estimates ({estimates.length})</Tab>
          <Tab active={activeTab==="bills"}     onClick={() => { setActiveTab("bills"); fetchBills(); }}>Bills ({bills.length})</Tab>
        </TabBar>

        {/* ══════════════════════════════════════════════════════════
            CREATE TAB
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <>
            {/* Search bar */}
            <TopBar>
              <FieldGroup w="170px">
                <FieldLabel>UHID No <Required>*</Required></FieldLabel>
                <InputWithSearch>
                  <CompactInput value={uhid} onChange={(e) => { setUhid(e.target.value); setSearchError(""); }} placeholder="S025/011667" onKeyDown={(e) => e.key==="Enter" && handleSearch("uhid")} />
                  <SearchBtn onClick={() => handleSearch("uhid")} disabled={searchLoading}>{searchLoading?"…":"🔍"}</SearchBtn>
                </InputWithSearch>
              </FieldGroup>

              <FieldGroup w="170px">
                <FieldLabel>IP Number <Required>*</Required></FieldLabel>
                <InputWithSearch>
                  <CompactInput value={ipNumber} onChange={(e) => { setIpNumber(e.target.value); setSearchError(""); }} placeholder="S025/012488" onKeyDown={(e) => e.key==="Enter" && handleSearch("ipNumber")} />
                  <SearchBtn onClick={() => handleSearch("ipNumber")} disabled={searchLoading}>{searchLoading?"…":"🔍"}</SearchBtn>
                </InputWithSearch>
              </FieldGroup>

              <FieldGroup w="140px">
                <FieldLabel>Bill up to</FieldLabel>
                <CompactInput type="date" value={form.bill_upto} onChange={(e) => setField("bill_upto", e.target.value)} />
              </FieldGroup>

              <FieldGroup w="130px">
                <FieldLabel>Staff ID</FieldLabel>
                <CompactInput value={form.staff_id} onChange={(e) => setField("staff_id", e.target.value)} />
              </FieldGroup>

              <FieldGroup w="140px">
                <FieldLabel>Charity Type</FieldLabel>
                <CompactSelect value={form.charity_type} onChange={(e) => setField("charity_type", e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="full">Full Charity</option>
                  <option value="partial">Partial Charity</option>
                </CompactSelect>
              </FieldGroup>

              <FieldGroup w="auto">
                <FieldLabel>&nbsp;</FieldLabel>
                <CheckRow>
                  {[["is_discharge","Discharge"],["show_advances","Show Advances"],["group_items","Group Items"],["part_bill","Part Bill"]].map(([k,label]) => (
                    <CheckLabel key={k}><input type="checkbox" checked={form[k]} onChange={(e) => setField(k, e.target.checked)} />{label}</CheckLabel>
                  ))}
                </CheckRow>
              </FieldGroup>
            </TopBar>

            {searchError && <ErrText>⚠ {searchError}</ErrText>}

            {/* Patient card */}
            {patientInfo && (
              <PatientCard>
                <PatientLeft>
                  <PCell><PCellLabel>Name</PCellLabel><PCellValue>{patientInfo.patient_name||"—"}</PCellValue></PCell>
                  <PCell><PCellLabel>Age / Gender</PCellLabel><PCellValue>{patientInfo.age} Yrs / {patientInfo.gender}</PCellValue></PCell>
                  <PCell noBorderRight><PCellLabel>Doctor</PCellLabel><PCellValue style={{fontSize:"0.78rem"}}>{patientInfo.doctor||"—"}</PCellValue></PCell>
                  <PCell noBorderBottom><PCellLabel>Admission Date</PCellLabel><PCellValue>{patientInfo.admission_date||"—"}</PCellValue></PCell>
                  <PCell noBorderBottom><PCellLabel>UHID / IP No</PCellLabel><PCellValue style={{fontSize:"0.76rem"}}>{patientInfo.uhid} / {patientInfo.ip_number||"—"}</PCellValue></PCell>
                  <PCell noBorderRight noBorderBottom><PCellLabel>Mobile</PCellLabel><PCellValue>{patientInfo.mobile||"—"}</PCellValue></PCell>
                </PatientLeft>
                <PatientRight>
                  <PCell><PCellLabel>Patient Type</PCellLabel><PCellValue style={{textTransform:"uppercase"}}>{patientInfo.patient_type||"—"}</PCellValue></PCell>
                  <PCell noBorderRight><PCellLabel>Company</PCellLabel><PCellValue>{patientInfo.company||"—"}</PCellValue></PCell>
                  <PCell noBorderBottom><PCellLabel>Room No</PCellLabel><PCellValue>{patientInfo.room_no||"—"}</PCellValue></PCell>
                  <PCell noBorderRight noBorderBottom><PCellLabel>Total Days</PCellLabel><PCellValue>{patientInfo.total_days??0}</PCellValue></PCell>
                </PatientRight>
              </PatientCard>
            )}

            {/* Items section */}
            <SectionCard>
              <SectionHead>
                <SectionTitle>Investigation Items</SectionTitle>
                {items.length > 0 && (
                  <span style={{fontSize:"0.7rem",color:colors.textMuted}}>
                    {items.length} item{items.length!==1?"s":""}
                    {items.filter(i=>i._fromBackend).length>0 && ` (${items.filter(i=>i._fromBackend).length} from investigation)`}
                  </span>
                )}
              </SectionHead>

              <ItemAddRow newItem={newItem} onChange={handleNewItemChange} onAdd={handleAddItem} onClear={() => setNewItem(EMPTY_ITEM)} disabled={!patientInfo} />

              <ItemTableHead>
                <ColHead>Sl</ColHead><ColHead>Product</ColHead><ColHead>Bill No</ColHead>
                <ColHead>Qty</ColHead><ColHead>Rate</ColHead><ColHead>Disc</ColHead>
                <ColHead>Amount</ColHead><ColHead>Package</ColHead><ColHead>Doctor</ColHead>
                <ColHead>Status</ColHead><ColHead></ColHead>
              </ItemTableHead>

              {items.length === 0 ? (
                <EmptyState>{patientInfo ? "No pending items. Add manually above." : "Search a patient to load items."}</EmptyState>
              ) : items.map((item, idx) => (
                <ItemTableRow key={item._key}>
                  <ColCell>{idx+1}</ColCell>
                  <ColCell style={{fontWeight:600}}>{item.itemName}</ColCell>
                  <ColCell style={{color:colors.textMuted,fontSize:"0.78rem"}}>{item.invest_bill_no||item.description||"—"}</ColCell>
                  <ColCell><TinyInput type="number" min={1} value={item.quantity} onChange={(e)=>handleEditItem(item._key,"quantity",Number(e.target.value)||1)} style={{width:55}} /></ColCell>
                  <ColCell><TinyInput type="number" min={0} value={item.rate} onChange={(e)=>handleEditItem(item._key,"rate",e.target.value)} style={{width:70}} /></ColCell>
                  <ColCell><TinyInput type="number" min={0} value={item.discount} onChange={(e)=>handleEditItem(item._key,"discount",e.target.value)} style={{width:65}} /></ColCell>
                  <ColCell style={{fontWeight:700}}>₹ {fmt(item.amount)}</ColCell>
                  <ColCell style={{fontSize:"0.78rem"}}>{item.package_name||"—"}</ColCell>
                  <ColCell style={{fontSize:"0.78rem"}}>{item.doctor||"—"}</ColCell>
                  <ColCell>{item._fromBackend ? <Badge v="blue">{item.payment_status||"Pending"}</Badge> : <Badge>Manual</Badge>}</ColCell>
                  <ColCell><IconBtn danger onClick={()=>handleRemoveItem(item._key)}>🗑</IconBtn></ColCell>
                </ItemTableRow>
              ))}
            </SectionCard>

            {/* Financials */}
            <SectionCard>
              <FinGrid f={form} setF={setField} totals={totals} />
              <FinActionsRow>
                <HeaderBtn onClick={handleReset}>✕ Cancel</HeaderBtn>
                <HeaderBtn amber onClick={() => saveNew("Estimate")} disabled={loading}>{loading?"Saving…":"📋 Save as Estimate"}</HeaderBtn>
                <HeaderBtn primary onClick={() => saveNew("Billed")} disabled={loading}>{loading?"Saving…":"🧾 Save as Final Bill"}</HeaderBtn>
              </FinActionsRow>
            </SectionCard>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            ESTIMATES TAB
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "estimates" && (
          <div style={{overflowX:"auto"}}>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Estimate No.</Th>
                  <Th>UHID / IP No.</Th>
                  <Th>Patient</Th>
                  <Th>Total Amt</Th>
                  <Th>Disc</Th>
                  <Th>Net Amt</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {estimates.length === 0 ? (
                  <tr><td colSpan={10}><EmptyState>No estimates found.</EmptyState></td></tr>
                ) : estimates.map((est, idx) => {
                  const pd = est.patient_details || {};
                  return (
                    <Tr key={est.id}>
                      <Td>{idx+1}</Td>
                      <Td style={{fontWeight:700,fontFamily:"monospace",fontSize:"0.8rem"}}>{est.estimate_number}</Td>
                      <Td style={{fontSize:"0.8rem"}}>{est.uhid||"—"} / {est.ip_number||"—"}</Td>
                      <Td style={{fontWeight:600}}>{pd.patient_name||"—"}</Td>
                      <Td>₹ {fmt(est.total_amount)}</Td>
                      <Td style={{color:"#dc2626"}}>₹ {fmt(est.total_disc)}</Td>
                      <Td style={{fontWeight:700}}>₹ {fmt(est.net_amount)}</Td>
                      <Td style={{fontSize:"0.8rem"}}>
                        {est.bill_date ? new Date(est.bill_date).toLocaleDateString("en-IN") : "—"}
                      </Td>
                      <Td><Badge v="orange">Estimate</Badge></Td>
                      <Td style={{display:"flex",gap:6}}>
                        {/* FIX: single clear button opens the full edit+convert modal */}
                        <ActionBtn amber onClick={() => openEdit(est)}>✏️ Edit / Convert</ActionBtn>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            BILLS TAB
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "bills" && (
          <div style={{overflowX:"auto"}}>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Bill No.</Th><Th>UHID / IP No.</Th><Th>Patient</Th>
                  <Th>Total Amt</Th><Th>Advance</Th><Th>Disc</Th><Th>GST</Th>
                  <Th>Net Amt</Th><Th>Bill Date</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr><td colSpan={11}><EmptyState>No bills found.</EmptyState></td></tr>
                ) : bills.map((bill, idx) => {
                  const pd = bill.patient_details || {};
                  return (
                    <Tr key={bill.id}>
                      <Td>{idx+1}</Td>
                      <Td style={{fontWeight:700,fontFamily:"monospace",fontSize:"0.8rem"}}>{bill.bill_no}</Td>
                      <Td style={{fontSize:"0.8rem"}}>{bill.uhid||"—"} / {bill.ip_number||"—"}</Td>
                      <Td style={{fontWeight:600}}>{pd.patient_name||"—"}</Td>
                      <Td>₹ {fmt(bill.total_amount)}</Td>
                      <Td style={{color:"#dc2626"}}>₹ {fmt(bill.advance_amount)}</Td>
                      <Td style={{color:"#dc2626"}}>₹ {fmt(bill.total_disc)}</Td>
                      <Td style={{color:"#2563eb"}}>₹ {fmt(bill.gst_amount)}</Td>
                      <Td style={{fontWeight:700}}>₹ {fmt(bill.net_amount)}</Td>
                      <Td style={{fontSize:"0.8rem"}}>
                        {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN") : "—"}
                      </Td>
                      <Td><Badge v="green">Billed</Badge></Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* ══════════════════════════════════════════════════════════
          EDIT / CONVERT ESTIMATE MODAL
      ══════════════════════════════════════════════════════════ */}
      {editEst && (
        <Overlay onClick={() => setEditEst(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>

            {/* ── Sticky header ── */}
            <ModalHead>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <ModalTitle>📋 {editEst.estimate_number}</ModalTitle>
                <StatusPill billed={editEst.status === "Billed"}>
                  {editEst.status === "Billed" ? "✅ Billed" : "🕐 Estimate"}
                </StatusPill>
              </div>
              <div style={{display:"flex",gap:8}}>
                <HeaderBtn
                  amber
                  onClick={handleUpdateEstimate}
                  disabled={editLoading || convLoading}
                >
                  {editLoading ? "Saving…" : "💾 Save as Estimate"}
                </HeaderBtn>
                <HeaderBtn
                  primary
                  onClick={handleConvertToBill}
                  disabled={editLoading || convLoading}
                >
                  {convLoading ? "Converting…" : "🧾 Convert to Final Bill"}
                </HeaderBtn>
                <HeaderBtn onClick={() => setEditEst(null)}>✕ Close</HeaderBtn>
              </div>
            </ModalHead>

            <div style={{padding:"14px 20px"}}>

              {/* ── Patient strip ── */}
              {(() => {
                const pd = editEst.patient_details || {};
                // 8 cells in a 4-col grid → 2 rows
                // row 0: indices 0-3  (border-bottom shown)
                // row 1: indices 4-7  (noBorderBottom)
                // right-most of each row: [3, 7] → noBorderRight
                const cells = [
                  ["Patient",    pd.patient_name || "—"],
                  ["UHID",       editEst.uhid    || "—"],
                  ["IP Number",  editEst.ip_number || "—"],
                  ["Est. Date",  editEst.bill_date
                    ? new Date(editEst.bill_date).toLocaleDateString("en-IN")
                    : "—"],
                  ["Age",        pd.age    || "—"],
                  ["Gender",     pd.gender || "—"],
                  ["Mobile",     pd.mobile || "—"],
                  ["Est. No.",   editEst.estimate_number],
                ];
                return (
                  <div style={{
                    display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                    border:`1px solid ${colors.border}`, borderRadius:6,
                    marginBottom:12, overflow:"hidden",
                  }}>
                    {cells.map(([label, val], i) => (
                      <PCell
                        key={i}
                        noBorderBottom={i >= 4}
                        noBorderRight={[3, 7].includes(i)}
                      >
                        <PCellLabel>{label}</PCellLabel>
                        <PCellValue>{val}</PCellValue>
                      </PCell>
                    ))}
                  </div>
                );
              })()}

              {/* ── Items ── */}
              <SectionCard style={{marginBottom:10}}>
                <SectionHead>
                  <SectionTitle>Items</SectionTitle>
                  <span style={{fontSize:"0.7rem",color:colors.textMuted}}>
                    {editItems.length} item{editItems.length!==1?"s":""}
                  </span>
                </SectionHead>

                {/* Add-item row — always enabled in modal */}
                <ItemAddRow
                  newItem={editNewItem}
                  onChange={handleEditModalNewItemChange}
                  onAdd={handleEditModalAddItem}
                  onClear={() => setEditNewItem(EMPTY_ITEM)}
                  disabled={false}
                />

                {/* Column headers */}
                <ItemTableHead>
                  <ColHead>Sl</ColHead>
                  <ColHead>Product</ColHead>
                  <ColHead>Bill No</ColHead>
                  <ColHead>Qty</ColHead>
                  <ColHead>Rate</ColHead>
                  <ColHead>Disc</ColHead>
                  <ColHead>Amount</ColHead>
                  <ColHead>Package</ColHead>
                  <ColHead>Doctor</ColHead>
                  <ColHead>Status</ColHead>
                  <ColHead></ColHead>
                </ItemTableHead>

                {editItems.length === 0 ? (
                  <EmptyState>No items. Add above.</EmptyState>
                ) : editItems.map((item, idx) => (
                  <ItemTableRow key={item._key}>
                    <ColCell>{idx+1}</ColCell>
                    <ColCell style={{fontWeight:600}}>{item.itemName}</ColCell>
                    <ColCell style={{color:colors.textMuted,fontSize:"0.78rem"}}>
                      {item.invest_bill_no||item.description||"—"}
                    </ColCell>
                    <ColCell>
                      <TinyInput
                        type="number" min={1} value={item.quantity}
                        onChange={(e) => handleEditModalItemChange(item._key,"quantity",Number(e.target.value)||1)}
                        style={{width:55}}
                      />
                    </ColCell>
                    <ColCell>
                      <TinyInput
                        type="number" min={0} value={item.rate}
                        onChange={(e) => handleEditModalItemChange(item._key,"rate",e.target.value)}
                        style={{width:70}}
                      />
                    </ColCell>
                    <ColCell>
                      <TinyInput
                        type="number" min={0} value={item.discount}
                        onChange={(e) => handleEditModalItemChange(item._key,"discount",e.target.value)}
                        style={{width:65}}
                      />
                    </ColCell>
                    <ColCell style={{fontWeight:700}}>₹ {fmt(item.amount)}</ColCell>
                    <ColCell style={{fontSize:"0.78rem"}}>{item.package_name||"—"}</ColCell>
                    <ColCell style={{fontSize:"0.78rem"}}>{item.doctor||"—"}</ColCell>
                    {/* FIX: show a badge so the Status column isn't blank */}
                    <ColCell>
                      {item.payment_status
                        ? <Badge v="blue">{item.payment_status}</Badge>
                        : <Badge>Manual</Badge>
                      }
                    </ColCell>
                    <ColCell>
                      <IconBtn danger onClick={() => handleEditModalRemoveItem(item._key)}>🗑</IconBtn>
                    </ColCell>
                  </ItemTableRow>
                ))}
              </SectionCard>

              {/* ── Financials ── */}
              <SectionCard>
                <FinGrid f={editForm} setF={setEditField} totals={editTotals} />
                <FinActionsRow>
                  <HeaderBtn onClick={() => setEditEst(null)}>✕ Close</HeaderBtn>
                  <HeaderBtn
                    amber
                    onClick={handleUpdateEstimate}
                    disabled={editLoading || convLoading}
                  >
                    {editLoading ? "Saving…" : "💾 Save as Estimate"}
                  </HeaderBtn>
                  <HeaderBtn
                    primary
                    onClick={handleConvertToBill}
                    disabled={editLoading || convLoading}
                  >
                    {convLoading ? "Converting…" : "🧾 Convert to Final Bill"}
                  </HeaderBtn>
                </FinActionsRow>
              </SectionCard>

            </div>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  );
};

export default DischargeBilling;