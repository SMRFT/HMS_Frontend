import React, { useState, useCallback, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes, createGlobalStyle } from "styled-components";

import DischargeViewBills     from "./DischargeViewBills";
import DischargeViewEstimates from "./DischargeViewEstimates";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  primary:   "#0f766e",
  amber:     "#d97706",
  danger:    "#dc2626",
  success:   "#16a34a",
  blue:      "#2563eb",
  border:    "#e2e8f0",
  bg:        "#f8fafc",
  surface:   "#ffffff",
  textMain:  "#0f172a",
  textMid:   "#475569",
  textMuted: "#94a3b8",
  radius:    "8px",
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 16px rgba(0,0,0,0.10)",
};

const slideDown = keyframes`from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}`;
const fadeUp    = keyframes`from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}`;
const spin      = keyframes`to{transform:rotate(360deg);}`;

const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:${T.bg};color:${T.textMain};}
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageWrap = styled.div`min-height:100vh;background:${T.bg};`;
const AppBar   = styled.header`
  background:${T.primary};height:48px;padding:0 20px;
  display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:200;box-shadow:0 2px 8px rgba(0,0,0,0.15);
`;
const AppTitle = styled.div`color:#fff;font-weight:700;font-size:0.88rem;display:flex;align-items:center;gap:8px;`;
const Crumb    = styled.div`color:rgba(255,255,255,0.7);font-size:0.72rem;`;
const Content  = styled.div`max-width:1300px;margin:0 auto;padding:16px;`;

const TabBar = styled.div`
  display:flex;gap:2px;margin-bottom:14px;
  background:${T.surface};border:1px solid ${T.border};
  border-radius:${T.radius};padding:4px;width:fit-content;
`;
const Tab = styled.button`
  padding:7px 18px;border:none;border-radius:6px;cursor:pointer;
  font-size:0.81rem;font-weight:600;transition:all 0.15s;display:flex;align-items:center;gap:6px;
  background:${p=>p.$active?T.primary:"transparent"};
  color:${p=>p.$active?"#fff":T.textMid};
  &:hover{background:${p=>p.$active?T.primary:T.bg};}
`;

const Card      = styled.div`background:${T.surface};border:1px solid ${T.border};border-radius:${T.radius};box-shadow:${T.shadow};margin-bottom:12px;animation:${fadeUp} 0.2s ease;`;
const CardHead  = styled.div`background:#f8fafc;border-bottom:1px solid ${T.border};padding:8px 14px;display:flex;align-items:center;justify-content:space-between;`;
const CardTitle = styled.span`font-size:0.69rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${T.textMuted};`;

const Badge = styled.span`
  display:inline-flex;align-items:center;padding:2px 8px;
  border-radius:20px;font-size:0.66rem;font-weight:700;
  background:${p=>({estimate:"#fef3c7",billed:"#dcfce7",pending:"#dbeafe",manual:"#f1f5f9",converting:"#ede9fe"}[p.$v]||"#f1f5f9")};
  color:${p=>({estimate:T.amber,billed:T.success,pending:T.blue,manual:T.textMuted,converting:"#7c3aed"}[p.$v]||T.textMuted)};
`;

const Toast = styled.div`
  position:fixed;top:14px;right:16px;z-index:9999;
  padding:10px 18px;border-radius:${T.radius};color:#fff;
  font-weight:600;font-size:0.84rem;max-width:380px;
  background:${p=>p.$err?T.danger:T.success};
  box-shadow:${T.shadowMd};animation:${slideDown} 0.2s ease;
`;

const ConvertBanner = styled.div`
  display:flex;align-items:flex-start;gap:12px;
  padding:12px 16px;margin-bottom:12px;
  background:#ede9fe;border:1.5px solid #7c3aed;
  border-radius:${T.radius};color:#5b21b6;
  animation:${slideDown} 0.25s ease;
`;

const SearchBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:12px 14px;background:#fafafa;border-bottom:1px solid ${T.border};`;
const FG        = styled.div`display:flex;flex-direction:column;gap:3px;min-width:${p=>p.$w||"150px"};flex:${p=>p.$flex||"none"};`;
const FL        = styled.label`font-size:0.66rem;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.4px;`;
const Req       = styled.span`color:${T.danger};margin-left:2px;`;
const FInput    = styled.input`
  height:32px;padding:0 10px;font-size:0.82rem;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:#fff;color:${T.textMain};transition:border 0.12s;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
  &[type=date]{cursor:pointer;}
  &::placeholder{color:${T.textMuted};}
`;
const FSelect = styled.select`
  height:32px;padding:0 8px;font-size:0.82rem;
  border:1px solid ${T.border};border-radius:6px;outline:none;
  background:#fff;color:${T.textMain};transition:border 0.12s;cursor:pointer;
  &:focus{border-color:${T.primary};box-shadow:0 0 0 2px rgba(15,118,110,0.12);}
  &:disabled{background:#f8fafc;color:${T.textMuted};cursor:not-allowed;}
`;

const Btn = styled.button`
  height:${p=>p.$sm?"30px":"34px"};padding:0 ${p=>p.$sm?"12px":"16px"};
  border-radius:6px;font-size:${p=>p.$sm?"0.77rem":"0.81rem"};
  font-weight:600;cursor:pointer;border:1.5px solid transparent;
  display:inline-flex;align-items:center;gap:5px;transition:all 0.13s;
  ${p=>p.$primary && `background:${T.primary};color:#fff;border-color:${T.primary};`}
  ${p=>p.$amber   && `background:${T.amber};color:#fff;border-color:${T.amber};`}
  ${p=>p.$ghost   && `background:#f1f5f9;color:${T.textMid};border-color:${T.border};`}
  ${p=>p.$purple  && `background:#7c3aed;color:#fff;border-color:#7c3aed;`}
  &:hover{opacity:0.88;} &:disabled{opacity:0.45;cursor:not-allowed;}
`;
const IconBtn = styled.button`
  width:32px;height:32px;border-radius:6px;border:none;
  background:${T.primary};color:#fff;cursor:pointer;font-size:0.85rem;
  display:flex;align-items:center;justify-content:center;transition:opacity 0.12s;
  &:hover{opacity:0.85;} &:disabled{opacity:0.5;cursor:not-allowed;}
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

// ─── Patient grid ─────────────────────────────────────────────────────────────
const PGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);@media(max-width:768px){grid-template-columns:repeat(2,1fr);}`;
const PCell = styled.div`padding:8px 14px;border-right:${p=>p.$nr?"none":`1px solid ${T.border}`};border-bottom:${p=>p.$nb?"none":`1px solid ${T.border}`};`;
const PLbl  = styled.div`font-size:0.62rem;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.4px;`;
const PVal  = styled.div`font-size:0.83rem;font-weight:600;color:${T.textMain};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;

// ─── Items table ──────────────────────────────────────────────────────────────
const TScrollWrap = styled.div`overflow-x:auto; overflow-y:visible;`;
const ITable      = styled.table`width:100%;border-collapse:collapse;font-size:0.79rem;min-width:1000px;`;
const ITHead      = styled.thead`background:#f8fafc;`;
const ITH         = styled.th`padding:7px 8px;text-align:left;font-size:0.64rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:${T.textMuted};border-bottom:1px solid ${T.border};white-space:nowrap;`;
const ITR         = styled.tr`border-bottom:1px dashed ${T.border};&:last-child{border-bottom:none;}&:hover{background:#f8fbff;}`;
const AddRow      = styled.tr`background:#fffbeb;border-bottom:2px solid ${T.amber};`;
const ITD         = styled.td`padding:6px 8px;color:${T.textMain};vertical-align:middle;overflow:visible;position:relative;`;
const TInput      = styled.input`width:${p=>p.$w||"100%"};padding:4px 7px;font-size:0.78rem;border:1px solid ${T.border};border-radius:5px;outline:none;background:${p=>p.$ro?"#f8fafc":"#fff"};color:${p=>p.$ro?T.textMuted:T.textMain};transition:border 0.12s;&:focus{border-color:${T.primary};}`;
const TSelect     = styled.select`width:${p=>p.$w||"100%"};padding:4px 6px;font-size:0.78rem;border:1px solid ${T.border};border-radius:5px;outline:none;background:#fff;color:${T.textMain};cursor:pointer;&:focus{border-color:${T.primary};}`;
const EmptyRow    = styled.div`text-align:center;padding:34px;color:${T.textMuted};font-size:0.84rem;`;

// ─── Item search autocomplete ─────────────────────────────────────────────────
const SuggestionItem = styled.div`
  padding:7px 10px;font-size:0.8rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid #f1f5f9;
  &:last-child{border-bottom:none;}
  &:hover{background:#e6f7f5;}
`;
const SugName  = styled.span`font-weight:600;color:${T.textMain};`;
const SugPrice = styled.span`font-size:0.74rem;color:${T.success};font-weight:700;`;
const SugEmpty = styled.div`padding:10px;text-align:center;font-size:0.78rem;color:${T.textMuted};`;

// ─── Financials ───────────────────────────────────────────────────────────────
const FinGrid    = styled.div`display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid ${T.border};@media(max-width:900px){grid-template-columns:repeat(2,1fr);}`;
const FinCol     = styled.div`padding:10px 12px;border-right:1px solid ${T.border};display:flex;flex-direction:column;gap:8px;&:last-child{border-right:none;}`;
const FinRow     = styled.div`display:flex;align-items:center;gap:6px;font-size:0.78rem;`;
const FinLbl     = styled.span`min-width:${p=>p.$w||"90px"};color:${T.textMid};font-weight:500;font-size:0.75rem;flex-shrink:0;`;
const FinIn      = styled.input`flex:1;padding:4px 8px;font-size:0.78rem;border:1px solid ${T.border};border-radius:5px;outline:none;text-align:right;min-width:0;background:${p=>p.$ro?"#f8fafc":"#fff"};color:${p=>p.$ro?T.textMuted:T.textMain};transition:border 0.12s;&:focus{border-color:${T.primary};}${p=>p.$net&&`font-weight:700;color:${T.success};background:#f0fdf4;border-color:#86efac;`}`;
const Rupee      = styled.span`color:${T.textMuted};font-size:0.75rem;flex-shrink:0;`;
const FinActions = styled.div`display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 14px;background:#fafafa;border-top:1px solid ${T.border};`;
const ErrMsg     = styled.div`color:${T.danger};font-size:0.76rem;padding:6px 14px;background:#fee2e2;border-bottom:1px solid #fecaca;display:flex;align-items:center;gap:6px;`;

// ─── Bill type bar ────────────────────────────────────────────────────────────
const BillTypeBar = styled.div`
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:10px 14px;background:#f0fdf4;border-bottom:1px solid #bbf7d0;
`;

// ═════════════════════════════════════════════════════════════════════════════
// Constants & Helpers
// ═════════════════════════════════════════════════════════════════════════════

const BASE       = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const DEFAULT_BILL_TYPE_NO  = "DIS01";
const DEFAULT_BILL_TYPE_NUM = 2;

const EMPTY_FORM = {
  advance_amount:"", sales_return:"", medicines:"", taxable:"", non_tax:"",
  tpa_paid:"", sales_tax:"", gst_amount:"", room_tax:"", cess:"", luxury_tax:"",
  discount_percent:"", discount_amount:"", disc_reason:"", remarks:"",
  bill_upto: new Date().toISOString().split("T")[0],
};
const EMPTY_ITEM = {
  itemName:"", quantity:1, rate:"", discount:0, amount:0,
  doctor:"", doctor_fee:"", item_description:"", package_name:""
};

const fmt = v => (parseFloat(v)||0).toFixed(2);

const calcTotals = (items, f) => {
  const totalAmount = items.reduce((s,i)=>s+(parseFloat(i.amount)||0),0);
  const itemDisc    = items.reduce((s,i)=>s+(parseFloat(i.discount)||0),0);
  const discPct     = parseFloat(f.discount_percent)||0;
  const discAmt     = parseFloat(f.discount_amount)||(totalAmount*discPct/100);
  const totalDisc   = discAmt+itemDisc;
  const netAmount   = Math.max(0,
    totalAmount
    +(parseFloat(f.gst_amount)||0)+(parseFloat(f.room_tax)||0)+(parseFloat(f.medicines)||0)
    +(parseFloat(f.sales_tax)||0)+(parseFloat(f.cess)||0)+(parseFloat(f.luxury_tax)||0)
    -(parseFloat(f.advance_amount)||0)-(parseFloat(f.sales_return)||0)-(parseFloat(f.tpa_paid)||0)
    -totalDisc
  );
  return { totalAmount, itemDisc, discAmt, totalDisc, netAmount };
};

const buildPayload = (items, f, totals, status, patient) => ({
  status,
  uhid:             patient?.uhid      || null,
  ip_number:        patient?.ip_number || null,
  items:            items.map(({_key,_fromInvest,...r})=>r),
  total_amount:     totals.totalAmount,
  advance_amount:   parseFloat(f.advance_amount)  ||0,
  sales_return:     parseFloat(f.sales_return)    ||0,
  medicines_amount: parseFloat(f.medicines)       ||0,
  taxable_amount:   parseFloat(f.taxable)         ||0,
  non_tax_amount:   parseFloat(f.non_tax)         ||0,
  gst_amount:       parseFloat(f.gst_amount)      ||0,
  room_tax:         parseFloat(f.room_tax)        ||0,
  discount_percent: parseFloat(f.discount_percent)||0,
  discount_amount:  totals.discAmt,
  disc_reason:      f.disc_reason||"",
  item_disc:        totals.itemDisc,
  total_disc:       totals.totalDisc,
  net_amount:       totals.netAmount,
  remarks:          f.remarks||"",
});

const recalcItem = (item, field, value) => {
  const u    = {...item,[field]:value};
  const qty  = parseFloat(field==="quantity"?value:u.quantity)||0;
  const rate = parseFloat(field==="rate"    ?value:u.rate)    ||0;
  const disc = parseFloat(field==="discount"?value:u.discount)||0;
  if (["quantity","rate","discount"].includes(field)) u.amount = Math.max(0, qty*rate-disc);
  return u;
};

const investToRow = it => ({
  itemName:it.itemName||"", quantity:it.quantity||1, rate:it.price||0, discount:0,
  amount:(it.quantity||1)*(it.price||0), doctor:it.doctor||"", doctor_fee:"",
  item_description:it.billTypeNo||"", package_name:it.package_name||"",
  invest_bill_no:it.invest_bill_no||"", bill_object_id:it.bill_object_id||"",
  payment_status:it.payment_status||"", test_id:it.test_id??null,
  _key:`inv_${it.test_id??it.itemName}_${Date.now()}_${Math.random()}`,
  _fromInvest:true,
});

const parseItems = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const estToForm = e => ({
  advance_amount:  String(parseFloat(e.advance_amount)  ||""),
  sales_return:    String(parseFloat(e.sales_return)    ||""),
  medicines:       String(parseFloat(e.medicines_amount)||""),
  taxable:         String(parseFloat(e.taxable_amount)  ||""),
  non_tax:         String(parseFloat(e.non_tax_amount)  ||""),
  tpa_paid:"", sales_tax:"",
  gst_amount:      String(parseFloat(e.gst_amount)      ||""),
  room_tax:        String(parseFloat(e.room_tax)        ||""),
  cess:"", luxury_tax:"",
  discount_percent:String(parseFloat(e.discount_percent)||""),
  discount_amount: String(parseFloat(e.discount_amount) ||""),
  disc_reason:     e.disc_reason||"",
  remarks:         e.remarks    ||"",
  bill_upto: e.bill_date
    ? new Date(e.bill_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
});

// ─── Normalise items from API ─────────────────────────────────────────────────
// FIX: check price !== undefined (not just != null) to handle string "10000"
const normaliseItems = (list) =>
  (Array.isArray(list) ? list : []).map(it => {
    // If price field already exists (even as string like "10000"), keep it
    if (it.price !== undefined && it.price !== null) return it;
    // Fallback: find a numeric key that isn't a known text field
    const priceKey = Object.keys(it).find(
      k => k !== "itemName" && k !== "_id" && !isNaN(Number(k))
    );
    return { ...it, price: priceKey ? it[priceKey] : "" };
  });

// ═════════════════════════════════════════════════════════════════════════════
// ItemSearchInput — uses pre-fetched allItems, no API calls on keystroke
// ═════════════════════════════════════════════════════════════════════════════

const ItemSearchInput = ({ value, onChange, onSelect, disabled, allItems = [], itemsLoading = false }) => {
  const [showSug, setShowSug] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 280 });
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  // Pure client-side filter — no API calls on keystroke
  const filtered = value.trim()
    ? allItems.filter(it => it.itemName?.toLowerCase().includes(value.trim().toLowerCase()))
    : allItems;

  // Close dropdown when clicking outside
  useEffect(() => {
    const onMouseDown = e => {
      const inInput = inputRef.current?.contains(e.target);
      const inDrop  = dropRef.current?.contains(e.target);
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

  // FIX: guard focus when disabled; otherwise open dropdown
  const handleFocus = () => {
    if (disabled) return;
    measure();
    setShowSug(true);
  };

  const handleSelect = item => {
    onSelect(item);
    setShowSug(false);
  };

  const placeholder = itemsLoading
    ? "Loading items…"
    : allItems.length > 0
    ? `Search ${allItems.length} items…`
    : "No items available";

  return (
    <>
      {/* FIX: pass disabled prop to the actual input element */}
      <TInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        style={{
          width: "100%",
          background: disabled ? "#f8fafc" : itemsLoading ? "#f8fafc" : "#fff",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {/* FIX: only show dropdown when not disabled and showSug is true */}
      {showSug && !disabled && (
        <div
          ref={dropRef}
          style={{
            position:     "fixed",
            top:          dropPos.top,
            left:         dropPos.left,
            width:        Math.max(dropPos.width, 320),
            background:   "#fff",
            border:       `1px solid ${T.border}`,
            borderRadius: "6px",
            boxShadow:    "0 8px 24px rgba(0,0,0,0.14)",
            zIndex:       99999,
            maxHeight:    "280px",
            overflowY:    "auto",
          }}
        >
          {itemsLoading ? (
            <SugEmpty>⏳ Loading items…</SugEmpty>
          ) : filtered.length === 0 ? (
            <SugEmpty>
              {allItems.length === 0
                ? "No items for this bill type"
                : "No match — try different keywords"}
            </SugEmpty>
          ) : (
            <>
              {value.trim() && (
                <div style={{
                  padding: "4px 10px 3px", fontSize: "0.66rem", fontWeight: 700,
                  color: T.textMuted, background: "#f8fafc",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  {filtered.length} of {allItems.length} items
                </div>
              )}
              {filtered.map((s, i) => (
                <SuggestionItem
                  key={`${s.itemName}-${i}`}
                  onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                >
                  <SugName>{s.itemName}</SugName>
                  {/* FIX: show price for string "10000" — use loose check */}
                  {s.price !== undefined && s.price !== null && String(s.price) !== "" && String(s.price) !== "0" && (
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
// Financial grid sub-component
// ═════════════════════════════════════════════════════════════════════════════

const FinancialGrid = ({ f, onChange, totals }) => (
  <FinGrid>
    <FinCol>
      <FinRow><FinLbl>Total Amount</FinLbl><Rupee>₹</Rupee><FinIn $ro value={fmt(totals.totalAmount)} readOnly/></FinRow>
      <FinRow><FinLbl>Advance</FinLbl>     <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.advance_amount}   onChange={e=>onChange("advance_amount",   e.target.value)}/></FinRow>
      <FinRow><FinLbl>Sales Return</FinLbl><Rupee>₹</Rupee><FinIn type="number" min={0} value={f.sales_return}     onChange={e=>onChange("sales_return",     e.target.value)}/></FinRow>
      <FinRow><FinLbl>Medicines</FinLbl>   <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.medicines}        onChange={e=>onChange("medicines",        e.target.value)}/></FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLbl>Taxable</FinLbl>  <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.taxable}   onChange={e=>onChange("taxable",   e.target.value)}/></FinRow>
      <FinRow><FinLbl>Non Tax</FinLbl>  <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.non_tax}   onChange={e=>onChange("non_tax",   e.target.value)}/></FinRow>
      <FinRow><FinLbl>TPA Paid</FinLbl> <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.tpa_paid}  onChange={e=>onChange("tpa_paid",  e.target.value)}/></FinRow>
      <FinRow><FinLbl>Sales Tax</FinLbl><Rupee>₹</Rupee><FinIn type="number" min={0} value={f.sales_tax} onChange={e=>onChange("sales_tax", e.target.value)}/></FinRow>
      <FinRow><FinLbl style={{fontWeight:700}}>Net Amount</FinLbl><Rupee>₹</Rupee><FinIn $ro $net value={fmt(totals.netAmount)} readOnly/></FinRow>
    </FinCol>
    <FinCol>
      <FinRow><FinLbl>GST</FinLbl>       <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.gst_amount}  onChange={e=>onChange("gst_amount",  e.target.value)}/></FinRow>
      <FinRow><FinLbl>Room Tax</FinLbl>  <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.room_tax}    onChange={e=>onChange("room_tax",    e.target.value)}/></FinRow>
      <FinRow><FinLbl>Cess</FinLbl>      <Rupee>₹</Rupee><FinIn type="number" min={0} value={f.cess}        onChange={e=>onChange("cess",        e.target.value)}/></FinRow>
      <FinRow><FinLbl>Luxury Tax</FinLbl><Rupee>₹</Rupee><FinIn type="number" min={0} value={f.luxury_tax}  onChange={e=>onChange("luxury_tax",  e.target.value)}/></FinRow>
    </FinCol>
    <FinCol>
      <FinRow>
        <FinLbl>Discount</FinLbl>
        <FinIn type="number" min={0} max={100} value={f.discount_percent}
          onChange={e=>onChange("discount_percent",e.target.value)}
          style={{width:48,flexGrow:0,textAlign:"center"}}/>
        <span style={{fontSize:"0.73rem",color:T.textMuted}}>%</span>
        <FinIn type="number" min={0} value={f.discount_amount} onChange={e=>onChange("discount_amount",e.target.value)}/>
      </FinRow>
      <FinRow><FinLbl>Disc Reason</FinLbl><FinIn value={f.disc_reason} onChange={e=>onChange("disc_reason",e.target.value)} style={{textAlign:"left"}}/></FinRow>
      <FinRow><FinLbl>Item Disc</FinLbl>  <Rupee>₹</Rupee><FinIn $ro value={fmt(totals.itemDisc)}  readOnly/></FinRow>
      <FinRow><FinLbl>Total Disc</FinLbl> <Rupee>₹</Rupee><FinIn $ro value={fmt(totals.totalDisc)} readOnly/></FinRow>
      <FinRow><FinLbl>Remarks</FinLbl>    <FinIn value={f.remarks||""} onChange={e=>onChange("remarks",e.target.value)} style={{textAlign:"left"}}/></FinRow>
    </FinCol>
  </FinGrid>
);

// ═════════════════════════════════════════════════════════════════════════════
// ItemsSection
// ═════════════════════════════════════════════════════════════════════════════

const ItemsSection = ({
  items, newItem, onNIChange, onItemSelect, onAdd, onClear, onEdit, onRemove, disabled,
  doctors, billTypeNo, allItems, itemsLoading,
}) => (
  <TScrollWrap>
    <ITable>
      <ITHead>
        <tr>
          <ITH style={{width:34}}>#</ITH>
          <ITH style={{minWidth:180}}>Item Name</ITH>
          <ITH style={{width:64}}>Qty</ITH>
          <ITH style={{width:80}}>Rate</ITH>
          <ITH style={{width:72}}>Disc</ITH>
          <ITH style={{width:88}}>Amount</ITH>
          <ITH style={{minWidth:130}}>Doctor</ITH>
          <ITH style={{width:68}}>Dr.Fee</ITH>
          <ITH>Description</ITH>
          <ITH style={{width:72}}>Source</ITH>
          <ITH style={{width:36}}></ITH>
        </tr>
      </ITHead>
      <tbody>
        {/* ── New item add row ── */}
        <AddRow>
          <ITD style={{color:T.amber,fontWeight:700,fontSize:"0.7rem"}}>+</ITD>
          <ITD>
            <ItemSearchInput
              value={newItem.itemName}
              onChange={v => onNIChange("itemName", v)}
              onSelect={onItemSelect}
              disabled={disabled}
              allItems={allItems}
              itemsLoading={itemsLoading}
            />
          </ITD>
          <ITD><TInput $w="58px" type="number" min={1} value={newItem.quantity}      onChange={e=>onNIChange("quantity",Number(e.target.value)||1)} disabled={disabled}/></ITD>
          <ITD><TInput $w="70px" type="number" min={0} value={newItem.rate}          onChange={e=>onNIChange("rate",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput $w="60px" type="number" min={0} value={newItem.discount}      onChange={e=>onNIChange("discount",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput $w="76px" $ro value={fmt(newItem.amount)} readOnly/></ITD>
          <ITD>
            <TSelect value={newItem.doctor} onChange={e=>onNIChange("doctor",e.target.value)} disabled={disabled}>
              <option value="">— Doctor —</option>
              {doctors.map((d,i)=>{
                const name = d.employeeName||d.doctor_name||d.name||(typeof d==="string"?d:"");
                const id   = d.employeeId  ||d.doctor_id  ||d.id  ||i;
                return <option key={id} value={name}>{name}</option>;
              })}
            </TSelect>
          </ITD>
          <ITD><TInput $w="62px" type="number" min={0} value={newItem.doctor_fee}    onChange={e=>onNIChange("doctor_fee",e.target.value)} disabled={disabled}/></ITD>
          <ITD><TInput value={newItem.item_description} onChange={e=>onNIChange("item_description",e.target.value)} disabled={disabled} placeholder="Notes…"/></ITD>
          <ITD></ITD>
          <ITD>
            <div style={{display:"flex",gap:4}}>
              <button onClick={onAdd} disabled={disabled}
                style={{width:26,height:26,borderRadius:5,background:disabled?"#94a3b8":T.primary,border:"none",color:"#fff",fontWeight:700,fontSize:"1rem",cursor:disabled?"not-allowed":"pointer"}}>+</button>
              <button onClick={onClear}
                style={{width:26,height:26,borderRadius:5,background:"#f1f5f9",border:`1px solid ${T.border}`,cursor:"pointer",fontSize:"0.85rem"}}>↺</button>
            </div>
          </ITD>
        </AddRow>

        {/* ── Existing items ── */}
        {items.length===0 ? (
          <tr><td colSpan={11}><EmptyRow>{disabled?"Search a patient to load items.":"No items yet — add above."}</EmptyRow></td></tr>
        ) : items.map((item,idx)=>(
          <ITR key={item._key}>
            <ITD style={{color:T.textMuted,fontWeight:600,fontSize:"0.75rem"}}>{idx+1}</ITD>
            <ITD style={{fontWeight:600}}>
              {item.itemName}
              {item.package_name&&<div style={{fontSize:"0.68rem",color:T.textMuted}}>{item.package_name}</div>}
            </ITD>
            <ITD><TInput $w="58px" type="number" min={1}  value={item.quantity} onChange={e=>onEdit(item._key,"quantity",Number(e.target.value)||1)}/></ITD>
            <ITD><TInput $w="70px" type="number" min={0}  value={item.rate}     onChange={e=>onEdit(item._key,"rate",e.target.value)}/></ITD>
            <ITD><TInput $w="60px" type="number" min={0}  value={item.discount} onChange={e=>onEdit(item._key,"discount",e.target.value)}/></ITD>
            <ITD style={{fontWeight:700}}>₹{fmt(item.amount)}</ITD>
            <ITD>
              <TSelect value={item.doctor||""} onChange={e=>onEdit(item._key,"doctor",e.target.value)}>
                <option value="">— Doctor —</option>
                {doctors.map((d,i)=>{
                  const name = d.employeeName||d.doctor_name||d.name||(typeof d==="string"?d:"");
                  const id   = d.employeeId  ||d.doctor_id  ||d.id  ||i;
                  return <option key={id} value={name}>{name}</option>;
                })}
              </TSelect>
            </ITD>
            <ITD><TInput $w="62px" type="number" min={0} value={item.doctor_fee||""} onChange={e=>onEdit(item._key,"doctor_fee",e.target.value)}/></ITD>
            <ITD style={{fontSize:"0.74rem",color:T.textMuted}}>{item.invest_bill_no||item.item_description||"—"}</ITD>
            <ITD>
              {item._fromInvest
                ?<Badge $v="pending">{item.payment_status||"Invest"}</Badge>
                :<Badge $v="manual">Manual</Badge>}
            </ITD>
            <ITD>
              <button onClick={()=>onRemove(item._key)}
                style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:"0.9rem",padding:"2px 4px",borderRadius:4}}>🗑</button>
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

  // ── Master data ────────────────────────────────────────────────────────────
  const [doctors,       setDoctors]       = useState([]);
  const [billTypes,     setBillTypes]     = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);

  // ── Pre-fetched items for selected bill type ───────────────────────────────
  const [allItems,     setAllItems]     = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // FIX: track whether a bill type has been explicitly selected by the user
  // On mount we only fetch master data; items are fetched only after
  // either: (a) bill types load and we pick the default, or (b) user picks a type
  const [selectedBT, setSelectedBT] = useState(null); // start as null — no fetch yet

  // ── Create tab state ───────────────────────────────────────────────────────
  const [uhid,       setUhid]       = useState("");
  const [ipNumber,   setIpNumber]   = useState("");
  const [searching,  setSearching]  = useState(false);
  const [searchErr,  setSearchErr]  = useState("");
  const [patient,    setPatient]    = useState(null);
  const [items,      setItems]      = useState([]);
  const [newItem,    setNewItem]    = useState(EMPTY_ITEM);
  const [form,       setFormRaw]    = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [editingEst, setEditingEst] = useState(null);

  const setForm = (k,v) => setFormRaw(p=>({...p,[k]:v}));
  const totals  = calcTotals(items, form);

  const [estRefresh,  setEstRefresh]  = useState(0);
  const [billRefresh, setBillRefresh] = useState(0);

  const [toast, setToast] = useState(null);
  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(null),3800); };

  // ── Fetch doctors & bill types on mount ────────────────────────────────────
  useEffect(() => {
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const dRes = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        if (dRes?.success) setDoctors(dRes.data || []);
        else if (Array.isArray(dRes)) setDoctors(dRes);
        else if (Array.isArray(dRes?.data)) setDoctors(dRes.data);
      } catch {}

      try {
        const bRes = await apiRequest(`${BASE}bill-types/`, "GET");
        const list  = Array.isArray(bRes?.billTypes) ? bRes.billTypes : [];
        setBillTypes(list);

        // Auto-select DISCHARGE (DIS01) as default once bill types arrive
        const discharge = list.find(b => b.billTypeNo === DEFAULT_BILL_TYPE_NO)
          || list[0]; // fallback to first if DIS01 not found

        if (discharge) {
          setSelectedBT({
            billTypeNo: discharge.billTypeNo,
            bill_type:  discharge.bill_type ?? DEFAULT_BILL_TYPE_NUM,
            bill_name:  discharge.bill_name,
          });
          // Items will be fetched by the useEffect below reacting to selectedBT
        }
      } catch {}

      setMasterLoading(false);
    };
    fetchMasterData();
  }, []);

  // ── FIX: Fetch items ONLY when selectedBT changes (not on mount with null) ─
  useEffect(() => {
    // Skip if no bill type selected yet
    if (!selectedBT || !selectedBT.billTypeNo || selectedBT.bill_type == null) return;

    let cancelled = false;

    const fetchItems = async () => {
      setItemsLoading(true);
      setAllItems([]); // clear stale items immediately so old list doesn't flash

      try {
        const url = `${BASE}investigation-items/?billTypeNo=${encodeURIComponent(selectedBT.billTypeNo)}&billType=${encodeURIComponent(String(selectedBT.bill_type))}`;
        console.log("[DischargeBilling] Fetching items:", url);

        const res  = await apiRequest(url, "GET");
        console.log("[DischargeBilling] Items response:", res);

        // FIX: handle multiple response shapes from backend
        const list = Array.isArray(res?.items) ? res.items   // { items: [...] }
                   : Array.isArray(res?.data)  ? res.data    // { data: [...] }
                   : Array.isArray(res)         ? res         // [...]
                   : [];

        console.log(`[DischargeBilling] Parsed ${list.length} items for ${selectedBT.billTypeNo}`);

        if (!cancelled) setAllItems(normaliseItems(list));
      } catch (err) {
        console.error("[DischargeBilling] Items fetch error:", err);
        if (!cancelled) setAllItems([]);
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    };

    fetchItems();
    return () => { cancelled = true; };
  }, [selectedBT?.billTypeNo, selectedBT?.bill_type]);

  // ── Bill type change handler ────────────────────────────────────────────────
  const handleBillTypeChange = e => {
    const chosen = billTypes.find(b => b.billTypeNo === e.target.value);
    console.log("[BillType] User selected:", chosen);
    if (chosen) {
      setSelectedBT({
        billTypeNo: chosen.billTypeNo,
        bill_type:  chosen.bill_type ?? DEFAULT_BILL_TYPE_NUM,
        bill_name:  chosen.bill_name,
      });
      // Clear new item row so stale search text is gone when items reload
      setNewItem(EMPTY_ITEM);
      // allItems will be re-fetched automatically by the useEffect above
    }
  };

  // ── Patient search ─────────────────────────────────────────────────────────
  const doSearch = async mode => {
    const val = (mode==="uhid"?uhid:ipNumber).trim();
    if (!val) { setSearchErr("Please enter a value"); return; }
    setSearchErr(""); setSearching(true);
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    try {
      const param = mode==="uhid"
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
    finally   { setSearching(false); }
  };

  // ── New item helpers ───────────────────────────────────────────────────────
  const handleNIChange = (field, value) =>
    setNewItem(p => recalcItem({ ...p, [field]: value }, field, value));

  // When an item is selected from the autocomplete dropdown
  const handleItemSelect = useCallback(item => {
    setNewItem(p => {
      const itemName = item.itemName || "";
      const rate     = item.price    || "";
      const qty      = parseFloat(p.quantity) || 1;
      const rateNum  = parseFloat(rate)       || 0;
      const disc     = parseFloat(p.discount) || 0;
      const amount   = Math.max(0, qty * rateNum - disc);
      return { ...p, itemName, rate, amount };
    });
  }, []);

  const handleAddItem = () => {
    if (!newItem.itemName.trim()) { showToast("Enter item name first", true); return; }
    setItems(p => [...p, { ...newItem, _key: `m_${Date.now()}`, _fromInvest: false }]);
    setNewItem(EMPTY_ITEM);
  };

  const handleReset = () => {
    setPatient(null); setItems([]); setNewItem(EMPTY_ITEM);
    setUhid(""); setIpNumber(""); setSearchErr(""); setFormRaw(EMPTY_FORM);
    setEditingEst(null);
  };

  // ── Edit / Convert from estimates list ─────────────────────────────────────
  const handleEditConvert = useCallback(est => {
    if (!est?.id) return;
    const pd = est.patient_details || {};
    setPatient({
      patient_name:   pd.patient_name   || "",
      age:            pd.age            || "",
      gender:         pd.gender         || "",
      doctor:         pd.doctor         || "",
      admission_date: pd.admission_date || "",
      uhid:           est.uhid          || "",
      ip_number:      est.ip_number     || "",
      mobile:         pd.mobile         || "",
      room_no:        pd.room_no        || "",
      total_days:     pd.total_days     ?? 0,
      patient_type:   pd.patient_type   || "",
      company:        pd.company        || "",
    });
    setUhid(est.uhid        || "");
    setIpNumber(est.ip_number || "");
    setItems(parseItems(est.items).map((it, idx) => ({
      ...EMPTY_ITEM, ...it,
      amount: parseFloat(it.amount) || (parseFloat(it.quantity || 1) * parseFloat(it.rate || 0)),
      _key: `est_${idx}_${Date.now()}`, _fromInvest: false,
    })));
    setNewItem(EMPTY_ITEM);
    setFormRaw(estToForm(est));
    setEditingEst({ id: est.id, estimate_number: est.estimate_number });
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`📋 Estimate ${est.estimate_number} loaded — edit & save`);
  }, []);

  // ── Save / Update Estimate ─────────────────────────────────────────────────
  const handleSaveEstimate = async () => {
    if (!patient)      { showToast("Search a patient first", true); return; }
    if (!items.length) { showToast("Add at least one item",  true); return; }
    setSaving(true);
    try {
      const t   = calcTotals(items, form);
      const res = editingEst?.id
        ? await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient))
        : await apiRequest(`${BASE}discharge-billing/`,                  "POST",  buildPayload(items, form, t, "Estimate", patient));
      const d = res?.id ? res : res?.data;
      if (d?.id) {
        showToast(`✓ Estimate saved — ${d.estimate_number || ""}`);
        handleReset(); setEstRefresh(n => n + 1); setTab("estimates");
      } else showToast(JSON.stringify(res?.error || res), true);
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // ── Save as Final Bill ─────────────────────────────────────────────────────
  const handleSaveBill = async () => {
    if (!patient)      { showToast("Search a patient first", true); return; }
    if (!items.length) { showToast("Add at least one item",  true); return; }
    setSaving(true);
    try {
      const t = calcTotals(items, form);
      if (editingEst?.id) {
        await apiRequest(`${BASE}discharge-billing/${editingEst.id}/`, "PATCH", buildPayload(items, form, t, "Estimate", patient));
        const res = await apiRequest(`${BASE}discharge-billing/${editingEst.id}/convert-to-bill/`, "POST", {});
        const d   = res?.id ? res : res?.data;
        if (d?.id || d?.bill_no) {
          showToast(`✓ Converted to Bill — ${d.bill_no || ""}`);
          handleReset(); setEstRefresh(n => n + 1); setBillRefresh(n => n + 1); setTab("bills");
        } else showToast(JSON.stringify(res?.error || res), true);
      } else {
        const res = await apiRequest(`${BASE}discharge-billing/`, "POST", buildPayload(items, form, t, "Billed", patient));
        const d   = res?.id ? res : res?.data;
        if (d?.id) {
          showToast(`✓ Bill saved — ${d.bill_no || ""}`);
          handleReset(); setBillRefresh(n => n + 1); setTab("bills");
        } else showToast(JSON.stringify(res?.error || res), true);
      }
    } catch { showToast("Network error", true); }
    finally { setSaving(false); }
  };

  // Derive current bill type display value safely
  const currentBillTypeNo = selectedBT?.billTypeNo || DEFAULT_BILL_TYPE_NO;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrap>
      <GlobalStyle/>
      {toast && <Toast $err={toast.err}>{toast.msg}</Toast>}

      <AppBar>
        <AppTitle>🏥 HMS — Discharge Billing</AppTitle>
        <Crumb>Home / Discharge / Billing</Crumb>
      </AppBar>

      <Content>
        <TabBar>
          <Tab $active={tab==="create"}    onClick={()=>setTab("create")}>🧾 Create Bill</Tab>
          <Tab $active={tab==="estimates"} onClick={()=>setTab("estimates")}>📋 Estimates</Tab>
          <Tab $active={tab==="bills"}     onClick={()=>setTab("bills")}>✅ Bills</Tab>
        </TabBar>

        {/* ═══ CREATE / EDIT TAB ═══ */}
        {tab==="create" && (<>

          {/* Editing estimate banner */}
          {editingEst && (
            <ConvertBanner>
              <span style={{fontSize:"1.2rem",marginTop:1}}>✏️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.84rem",fontWeight:700,marginBottom:3}}>
                  Editing Estimate — <span style={{color:"#7c3aed"}}>{editingEst.estimate_number}</span>
                </div>
                <div style={{fontSize:"0.76rem",fontWeight:400,color:"#6d28d9",lineHeight:1.5}}>
                  All fields pre-filled. • Click <strong>Update Estimate</strong> to save changes&nbsp;&nbsp;
                  • Click <strong>Convert &amp; Save Bill</strong> to finalise as a bill
                </div>
              </div>
              <Btn $ghost $sm style={{borderColor:"#7c3aed",color:"#7c3aed",flexShrink:0}} onClick={handleReset}>
                ✕ Cancel
              </Btn>
            </ConvertBanner>
          )}

          {/* Patient search */}
          <Card>
            <CardHead>
              <CardTitle>Patient Search</CardTitle>
              {editingEst && <Badge $v="converting">✏️ Editing Estimate</Badge>}
            </CardHead>
            <SearchBar>
              <FG $w="200px">
                <FL>UHID <Req>*</Req></FL>
                <div style={{display:"flex",gap:5}}>
                  <FInput style={{flex:1}} value={uhid}
                    onChange={e=>{setUhid(e.target.value);setSearchErr("");}}
                    placeholder="e.g. S025/011667"
                    onKeyDown={e=>e.key==="Enter"&&doSearch("uhid")}/>
                  <IconBtn onClick={()=>doSearch("uhid")} disabled={searching}>
                    {searching?<Spinner/>:"🔍"}
                  </IconBtn>
                </div>
              </FG>
              <FG $w="200px">
                <FL>IP Number <Req>*</Req></FL>
                <div style={{display:"flex",gap:5}}>
                  <FInput style={{flex:1}} value={ipNumber}
                    onChange={e=>{setIpNumber(e.target.value);setSearchErr("");}}
                    placeholder="e.g. S025/012488"
                    onKeyDown={e=>e.key==="Enter"&&doSearch("ipNumber")}/>
                  <IconBtn onClick={()=>doSearch("ipNumber")} disabled={searching}>
                    {searching?<Spinner/>:"🔍"}
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
                <Badge $v={editingEst?"converting":"billed"}>
                  {editingEst?"✏️ Editing Estimate":"✓ Loaded"}
                </Badge>
              </CardHead>
              <PGrid>
                <PCell><PLbl>Name</PLbl>              <PVal>{patient.patient_name||"—"}</PVal></PCell>
                <PCell><PLbl>Age / Gender</PLbl>      <PVal>{patient.age||"—"} / {patient.gender||"—"}</PVal></PCell>
                <PCell><PLbl>Doctor</PLbl>             <PVal style={{fontSize:"0.79rem"}}>{patient.doctor||"—"}</PVal></PCell>
                <PCell $nr><PLbl>Admission Date</PLbl> <PVal>{patient.admission_date||"—"}</PVal></PCell>
                <PCell $nb><PLbl>UHID / IP No</PLbl>   <PVal style={{fontFamily:"monospace",fontSize:"0.78rem"}}>{patient.uhid} / {patient.ip_number||"—"}</PVal></PCell>
                <PCell $nb><PLbl>Mobile</PLbl>          <PVal>{patient.mobile||"—"}</PVal></PCell>
                <PCell $nb><PLbl>Room / Days</PLbl>     <PVal>{patient.room_no||"—"} / {patient.total_days??0}d</PVal></PCell>
                <PCell $nb $nr><PLbl>Type / Company</PLbl><PVal style={{fontSize:"0.78rem",textTransform:"uppercase"}}>{patient.patient_type||"—"} / {patient.company||"—"}</PVal></PCell>
              </PGrid>
            </Card>
          )}

          {/* Bill type selector + Items */}
          <Card>
            <CardHead>
              <CardTitle>Investigation / Billing Items</CardTitle>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {itemsLoading && (
                  <span style={{fontSize:"0.71rem",color:T.textMuted,display:"flex",alignItems:"center",gap:5}}>
                    <MiniSpinner/>
                    Loading items…
                  </span>
                )}
                {!itemsLoading && allItems.length > 0 && (
                  <span style={{fontSize:"0.71rem",color:T.success,fontWeight:600}}>
                    ✓ {allItems.length} items ready
                  </span>
                )}
                {!itemsLoading && allItems.length === 0 && selectedBT && (
                  <span style={{fontSize:"0.71rem",color:T.amber,fontWeight:600}}>
                    ⚠ No items for this bill type
                  </span>
                )}
                {items.length > 0 && (
                  <span style={{fontSize:"0.71rem",color:T.textMuted}}>
                    {items.length} item{items.length!==1?"s":""}
                    {items.filter(i=>i._fromInvest).length>0&&` · ${items.filter(i=>i._fromInvest).length} from investigation`}
                  </span>
                )}
              </div>
            </CardHead>

            {/* Bill type selection bar */}
            <BillTypeBar>
              <span style={{fontSize:"0.74rem",fontWeight:700,color:T.textMid,flexShrink:0}}>Bill Type:</span>
              <FSelect
                value={currentBillTypeNo}
                onChange={handleBillTypeChange}
                disabled={masterLoading}
                style={{height:30,fontSize:"0.8rem",minWidth:200}}
              >
                {/* FIX: show placeholder while loading */}
                {masterLoading && (
                  <option value="">Loading bill types…</option>
                )}
                {!masterLoading && billTypes.length === 0 && (
                  <option value={DEFAULT_BILL_TYPE_NO}>DISCHARGE</option>
                )}
                {billTypes.map(b=>(
                  <option key={b.billTypeNo} value={b.billTypeNo}>
                    {b.bill_name}
                  </option>
                ))}
              </FSelect>
              {masterLoading && (
                <span style={{fontSize:"0.73rem",color:T.textMuted,display:"flex",alignItems:"center",gap:5}}>
                  <MiniSpinner/> Loading…
                </span>
              )}
              {/* Show current bill type info */}
              {selectedBT && !masterLoading && (
                <span style={{fontSize:"0.72rem",color:T.textMuted}}>
                  Type No: <strong>{selectedBT.billTypeNo}</strong> · Type ID: <strong>{selectedBT.bill_type}</strong>
                </span>
              )}
            </BillTypeBar>

            <ItemsSection
              items={items}
              newItem={newItem}
              onNIChange={handleNIChange}
              onItemSelect={handleItemSelect}
              onAdd={handleAddItem}
              onClear={()=>setNewItem(EMPTY_ITEM)}
              onEdit={(key,field,val)=>setItems(p=>p.map(i=>i._key===key?recalcItem(i,field,val):i))}
              onRemove={key=>setItems(p=>p.filter(i=>i._key!==key))}
              disabled={!patient}
              doctors={doctors}
              billTypeNo={currentBillTypeNo}
              allItems={allItems}
              itemsLoading={itemsLoading}
            />
          </Card>

          {/* Financials + actions */}
          <Card>
            <CardHead><CardTitle>Financial Summary</CardTitle></CardHead>
            <FinancialGrid f={form} onChange={setForm} totals={totals}/>
            <FinActions>
              <Btn $ghost onClick={handleReset}>✕ Reset</Btn>
              <Btn $amber onClick={handleSaveEstimate} disabled={saving||!patient}>
                {saving?<Spinner/>:"📋"} {editingEst?" Update Estimate":" Save as Estimate"}
              </Btn>
              {editingEst ? (
                <Btn $purple onClick={handleSaveBill} disabled={saving||!patient}>
                  {saving?<Spinner/>:"🧾"} Convert &amp; Save Bill
                </Btn>
              ) : (
                <Btn $primary onClick={handleSaveBill} disabled={saving||!patient}>
                  {saving?<Spinner/>:"🧾"} Save as Final Bill
                </Btn>
              )}
            </FinActions>
          </Card>
        </>)}

        {/* ═══ ESTIMATES TAB ═══ */}
        {tab==="estimates" && (
          <DischargeViewEstimates
            onEditConvert={handleEditConvert}
            onRefreshTrigger={estRefresh}
          />
        )}

        {/* ═══ BILLS TAB ═══ */}
        {tab==="bills" && (
          <DischargeViewBills onRefreshTrigger={billRefresh}/>
        )}
      </Content>
    </PageWrap>
  );
};

export default DischargeBilling;