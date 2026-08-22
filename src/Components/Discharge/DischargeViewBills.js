import React, { useState, useEffect, useCallback, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes } from "styled-components";
import headerImg from "../Images/Header.png";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   "#0f766e",
  primaryDk: "#0d5f58",
  primaryLt: "#ccfbf1",
  amber:     "#d97706",
  amberLt:   "#fef3c7",
  danger:    "#dc2626",
  dangerLt:  "#fee2e2",
  success:   "#16a34a",
  successLt: "#dcfce7",
  blue:      "#2563eb",
  blueLt:    "#dbeafe",
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

const spin   = keyframes`to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); }`;

// ─── Styled components ──────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: 10px; box-shadow: ${T.shadow};
  overflow: hidden; animation: ${fadeUp} 0.2s ease;
  transition: box-shadow 0.2s ease;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
`;
const CardHead = styled.div`
  background: #f8fafc; border-bottom: 1px solid ${T.border};
  padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
`;
const CardTitle = styled.span`
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.5px; color: ${T.primary}; display: flex; align-items: center; gap: 6px;
`;

const TScrollWrap = styled.div`
  overflow-x: auto; width: 100%;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
const LTable = styled.table`width: 100%; border-collapse: collapse; font-size: 0.8rem;`;
const LTH = styled.th`
  padding: 9px 12px; text-align: left; font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px; color: ${T.textMuted};
  border-bottom: 2px solid ${T.border}; background: #f8fafc; white-space: nowrap;
`;
const LTR = styled.tr`
  border-bottom: 1px solid ${T.border};
  background: ${p => p.$cancelled ? "#fff5f5" : "inherit"};
  opacity: ${p => p.$cancelled ? 0.75 : 1};
  &:hover { background: ${p => p.$cancelled ? "#ffebeb" : "#f8fbff"}; }
  &:last-child { border-bottom: none; }
`;
const LTD = styled.td`padding: 9px 12px; color: ${T.textMain}; vertical-align: middle; white-space: nowrap;`;
const Mono = styled.span`font-family: 'Courier New', monospace; font-size: 0.78rem;`;

const DateBar = styled.div`
  display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
  padding: 10px 14px; background: #fafafa; border-bottom: 1px solid ${T.border};
`;
const FG = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  min-width: ${p => p.$w || "140px"}; flex: ${p => p.$flex || "none"};
  @media (max-width: 600px) { min-width: 100%; flex: 1 1 100%; }
`;
const FL = styled.label`
  font-size: 0.66rem; font-weight: 700; color: ${T.textMuted};
  text-transform: uppercase; letter-spacing: 0.4px;
`;
const FInput = styled.input`
  height: 32px; padding: 0 10px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor: pointer; }
  &::placeholder { color: ${T.textMuted}; }
`;
const Btn = styled.button`
  height: ${p => p.$sm ? "28px" : "34px"};
  padding: 0 ${p => p.$sm ? "10px" : "14px"};
  border-radius: 6px; font-size: ${p => p.$sm ? "0.74rem" : "0.81rem"};
  font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.13s;
  ${p => p.$primary && `background:${T.primary}; color:#fff; border-color:${T.primary};`}
  ${p => p.$amber   && `background:${T.amber};   color:#fff; border-color:${T.amber};`}
  ${p => p.$danger  && `background:${T.danger};  color:#fff; border-color:${T.danger};`}
  ${p => p.$outline && `background:#fff; color:${T.primary}; border-color:${T.primary};`}
  ${p => p.$ghost   && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p => p.$pag     && `background:${p.$active ? T.primary : "#fff"}; color:${p.$active ? "#fff" : T.textMid}; border-color:${p.$active ? T.primary : T.border}; min-width:32px; height:30px; padding:0 8px;`}
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 20px; font-size: 0.66rem; font-weight: 700;
  background: ${p => ({ estimate: "#fef3c7", billed: "#dcfce7", cancelled: "#fee2e2" }[p.$v] || "#f1f5f9")};
  color:      ${p => ({ estimate: T.amber,   billed: T.success, cancelled: T.danger  }[p.$v] || T.textMuted)};
`;
const Spinner = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const NoResults = styled.div`text-align: center; padding: 36px; color: ${T.textMuted}; font-size: 0.84rem;`;
const LoadSpinner = styled.div`
  width: 16px; height: 16px;
  border: 2px solid ${T.primary}; border-top-color: transparent;
  border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const PaginationBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: #fafafa; border-top: 1px solid ${T.border};
  flex-wrap: wrap; gap: 8px;
`;
const PaginationInfo = styled.span`font-size: 0.76rem; color: ${T.textMuted};`;
const PaginationBtns = styled.div`display: flex; gap: 4px; align-items: center; flex-wrap: wrap;`;
const PerPageSelect = styled.select`
  height: 30px; padding: 0 8px; font-size: 0.78rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain};
  &:focus { border-color: ${T.primary}; }
`;

// Summary cards
const SummaryRow = styled.div`
  display: flex; gap: 10px; padding: 10px 14px; background: #f0fdf4;
  border-bottom: 1px solid ${T.border}; flex-wrap: wrap;
`;
const SummaryCard = styled.div`
  flex: 1; min-width: 120px; background: #fff; border: 1px solid ${T.border};
  border-radius: 8px; padding: 8px 12px;
`;
const SummaryLabel = styled.div`font-size: 0.62rem; font-weight: 700; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.4px;`;
const SummaryValue = styled.div`font-size: 0.9rem; font-weight: 700; color: ${p => p.$color || T.textMain}; margin-top: 2px;`;

// Modals
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px); z-index: 10000; display: flex;
  align-items: center; justify-content: center; padding: 16px;
`;
const ModalBox = styled.div`
  background: #fff; border-radius: 12px; width: 100%;
  max-width: ${p => p.$w || "600px"}; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.22); animation: ${fadeUp} 0.2s ease;
`;
const ModalHead = styled.div`
  padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid ${T.border};
  display: flex; align-items: center; justify-content: space-between;
`;
const ModalTitle = styled.h3`font-size: 0.95rem; font-weight: 700; color: ${T.textMain};`;
const ModalClose = styled.button`
  border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: ${T.textMuted};
  &:hover { color: ${T.danger}; }
`;
const ModalBody = styled.div`padding: 20px; overflow-y: auto; flex: 1;`;
const ModalFoot = styled.div`
  padding: 12px 20px; background: #f8fafc; border-top: 1px solid ${T.border};
  display: flex; justify-content: flex-end; gap: 10px;
`;

// ─── 3-Dots Action Dropdown ────────────────────────────────────────────────────
const AW   = styled.div`position: relative; display: inline-block;`;
const DotB = styled.button`
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid ${T.border};
  background: #fff; cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 1.1rem; color: ${T.textMid}; font-weight: bold;
  transition: all 0.15s ease;
  &:hover { background: #f1f5f9; color: ${T.primary}; border-color: ${T.primary}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
`;
const Drop = styled.div`
  position: fixed;
  ${p => p.placement === "top" ? `bottom: ${p.bottom}px;` : `top: ${p.top}px;`}
  left: ${p => p.left}px;
  background: #fff; border: 1px solid ${T.border}; border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18); z-index: 99999;
  min-width: 170px; max-height: ${p => p.maxHeight || 280}px;
  overflow-y: auto; animation: ${fadeUp} 0.14s ease;
`;
const DI   = styled.button`
  width: 100%; padding: 9px 14px; text-align: left; font-size: 0.78rem; font-weight: 600;
  background: none; border: none; display: flex; align-items: center; gap: 8px;
  color: ${p => p.disabled ? '#9ca3af' : p.danger ? T.danger : T.textMain};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  &:hover:not(:disabled) { background: ${p => p.danger ? '#fff1f2' : '#f0fdf4'}; color: ${p => p.danger ? T.danger : T.primary}; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const fmt  = v => (parseFloat(v) || 0).toFixed(2);
const fmtCurrency = v => `₹${Number(parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split("T")[0];

const parseItems = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

// ═════════════════════════════════════════════════════════════════════════════
// ViewBills Component
// ═════════════════════════════════════════════════════════════════════════════

const ViewBills = ({ onEditBill, onRefreshTrigger }) => {
  const [bills,    setBills]    = useState([]);
  const [listBusy, setListBusy] = useState(false);
  const [listErr,  setListErr]  = useState("");

  // Filters — default to today
  const [from, setFrom] = useState(today());
  const [to,   setTo]   = useState(today());
  const [q,    setQ]    = useState("");

  // Pagination
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [printBill,  setPrintBill]  = useState(null);
  const [cancelBill, setCancelBill] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const [auditBill,  setAuditBill]  = useState(null);

  // 3-dots Menu State
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos]   = useState({ top: 0, bottom: 0, left: 0, placement: "bottom", maxHeight: 280 });
  const menuRef = useRef(null);
  const printRef = useRef(null);

  const fetchBills = useCallback(async () => {
    setListBusy(true);
    setListErr("");
    try {
      const res  = await apiRequest(`${BASE}discharge-billing/?status=Billed`, "GET");
      const list = res.success && res.data && Array.isArray(res.data.data) ? res.data.data : [];
      setBills(list);
    } catch {
      setListErr("Failed to load bills. Please try again.");
    } finally {
      setListBusy(false);
    }
  }, []);

  const handleOpenPrint = async (b) => {
    let updatedBill = { ...b };
    const searchVal = b.uhid || b.ip_number;
    if (searchVal) {
      try {
        const param = b.uhid ? `uhid=${encodeURIComponent(b.uhid)}` : `ipNumber=${encodeURIComponent(b.ip_number)}`;
        const raw = await apiRequest(`${BASE}search-discharge-patient/?${param}`, "GET");
        const res = raw?.success && raw?.data?.success ? raw.data.data : (raw?.success ? raw.data : raw);
        if (res?.patient) {
          updatedBill.patient_details = {
            ...(b.patient_details || {}),
            ...res.patient,
          };
        }
      } catch (err) {
        console.error("Print patient details fetch error:", err);
      }
    }
    setPrintBill(updatedBill);
  };

  const handleDownloadWord = () => {
    if (!printRef.current || !printBill) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Discharge Bill</title><style>body{font-family:'Courier New',monospace;font-size:11pt;}table{width:100%;border-collapse:collapse;}th,td{padding:6px;border:1px solid #000;}</style></head><body>";
    const footer = "</body></html>";
    const html = header + printRef.current.innerHTML + footer;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Discharge_Bill_${(printBill.bill_no || printBill.estimate_number || "Bill").replace(/\//g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!printRef.current || !printBill) return;
    const element = printRef.current;
    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     `Discharge_Bill_${(printBill.bill_no || printBill.estimate_number || "Bill").replace(/\//g, "_")}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        if (window.html2pdf) {
          window.html2pdf().set(opt).from(element).save();
        } else {
          window.print();
        }
      };
      document.body.appendChild(script);
    }
  };

  useEffect(() => { fetchBills(); }, [fetchBills, onRefreshTrigger]);
  useEffect(() => { setPage(1); }, [from, to, q]);

  // ── 3-dots Menu positioning & toggle ─────────────────────────────────────────
  const handleMenuToggle = (id, e) => {
    e.stopPropagation();
    if (openMenu === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuEstWidth = 180;
    const menuEstHeight = 160;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = rect.left - menuEstWidth + rect.width;
    if (left < 10) left = rect.left;
    if (left + menuEstWidth > windowWidth - 10) left = windowWidth - menuEstWidth - 10;

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement = "bottom";
    let top = rect.bottom + 4;
    let bottom = 0;
    let maxHeight = Math.min(280, spaceBelow - 12);

    if (spaceBelow < menuEstHeight && spaceAbove > spaceBelow) {
      placement = "top";
      bottom = windowHeight - rect.top + 4;
      maxHeight = Math.min(280, spaceAbove - 12);
    } else {
      maxHeight = Math.max(120, maxHeight);
    }

    setMenuPos({ top, bottom, left, placement, maxHeight });
    setOpenMenu(id);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const handleScroll = () => { if (openMenu !== null) setOpenMenu(null); };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openMenu]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = bills.filter(b => {
    if (from && b.bill_date && new Date(b.bill_date) < new Date(from)) return false;
    if (to   && b.bill_date && new Date(b.bill_date) > new Date(to + "T23:59:59")) return false;
    if (q) {
      const lq = q.toLowerCase();
      const pd = b.patient_details || {};
      return [b.bill_no || "", b.uhid || "", b.ip_number || "", pd.patient_name || ""]
        .some(v => v.toLowerCase().includes(lq));
    }
    return true;
  });

  // ── Summary totals ─────────────────────────────────────────────────────────
  const summary = filtered.reduce((acc, b) => {
    if (b.is_cancelled) return acc;
    return {
      total:    acc.total    + (parseFloat(b.total_amount)  || 0),
      advance:  acc.advance  + (parseFloat(b.advance_amount)|| 0),
      discount: acc.discount + (parseFloat(b.discount_amount)|| 0),
      net:      acc.net      + (parseFloat(b.net_amount)    || 0),
      gst:      acc.gst      + (parseFloat(b.gst_amount)    || 0),
    };
  }, { total: 0, advance: 0, discount: 0, net: 0, gst: 0 });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * perPage;
  const paginated  = filtered.slice(pageStart, pageStart + perPage);

  const goPage = p => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageButtons = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    if (left > 1)          { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages){ if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  // ── Cancel Action ──────────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancelBill || !cancelReason.trim()) return;
    setCancelBusy(true);
    try {
      const res = await apiRequest(`${BASE}discharge-billing/${cancelBill.id}/cancel/`, "POST", {
        cancelled_reason: cancelReason.trim(),
      });
      if (res.success) {
        setCancelBill(null);
        setCancelReason("");
        fetchBills();
      } else {
        alert(res.error || "Failed to cancel bill");
      }
    } catch {
      alert("Error cancelling bill");
    } finally {
      setCancelBusy(false);
    }
  };

  // ── Print Trigger ──────────────────────────────────────────────────────────
  const triggerPrint = () => {
    window.print();
  };

  return (
    <Card>
      {/* Header */}
      <CardHead>
        <CardTitle>
          ✅ Final Bills
          {bills.length > 0 && (
            <Badge $v="billed" style={{ marginLeft: 8 }}>{bills.length}</Badge>
          )}
        </CardTitle>
        <span style={{ fontSize: "0.72rem", color: T.textMuted }}>
          Showing {filtered.length} of {bills.length} records
        </span>
      </CardHead>

      {/* Filter bar */}
      <DateBar>
        <FG $w="135px">
          <FL>From</FL>
          <FInput type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </FG>
        <FG $w="135px">
          <FL>To</FL>
          <FInput type="date" value={to} onChange={e => setTo(e.target.value)} />
        </FG>
        <FG $flex="1" style={{ minWidth: 210 }}>
          <FL>Search</FL>
          <FInput
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Name, UHID, IP, Bill No…"
          />
        </FG>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn $ghost $sm onClick={() => { setFrom(today()); setTo(today()); setQ(""); }}>
            ↺ Reset
          </Btn>
          <Btn $outline onClick={fetchBills} disabled={listBusy}>
            {listBusy ? <Spinner /> : "↻"} Refresh
          </Btn>
        </div>
      </DateBar>

      {/* Error */}
      {listErr && (
        <div style={{ color: T.danger, fontSize: "0.76rem", padding: "8px 14px", background: "#fee2e2", borderBottom: `1px solid #fecaca` }}>
          ⚠ {listErr}
        </div>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <SummaryRow>
          <SummaryCard>
            <SummaryLabel>Total Amount</SummaryLabel>
            <SummaryValue>{fmtCurrency(summary.total)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Advance</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.advance)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Discount</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.discount)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total GST</SummaryLabel>
            <SummaryValue $color={T.blue}>{fmtCurrency(summary.gst)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Net Collected</SummaryLabel>
            <SummaryValue $color={T.success}>{fmtCurrency(summary.net)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Bill Count</SummaryLabel>
            <SummaryValue $color={T.primary}>{filtered.length}</SummaryValue>
          </SummaryCard>
        </SummaryRow>
      )}

      {/* Table */}
      <TScrollWrap>
        <LTable>
          <thead>
            <tr>
              <LTH style={{ width: 42 }}>#</LTH>
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
              <LTH style={{ textAlign: "center", width: 60 }}>Action</LTH>
            </tr>
          </thead>
          <tbody>
            {listBusy ? (
              <tr>
                <td colSpan={13}>
                  <NoResults>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <LoadSpinner />
                      Loading bills…
                    </div>
                  </NoResults>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={13}>
                  <NoResults>
                    {filtered.length === 0 && bills.length > 0
                      ? "No bills match your filters."
                      : "No bills found."}
                  </NoResults>
                </td>
              </tr>
            ) : paginated.map((b, i) => {
              const pd = b.patient_details || {};
              const isCanc = b.is_cancelled || b.status === "Cancelled";
              return (
                <LTR key={b.id} $cancelled={isCanc}>
                  <LTD style={{ color: T.textMuted, fontWeight: 600, fontSize: "0.74rem" }}>
                    {pageStart + i + 1}
                  </LTD>
                  <LTD>
                    <Mono style={{ color: isCanc ? T.textMuted : T.primary, fontWeight: 700 }}>
                      {b.bill_no}
                    </Mono>
                  </LTD>
                  <LTD>
                    <Mono style={{ fontSize: "0.73rem", color: T.textMuted }}>
                      {b.estimate_number || "—"}
                    </Mono>
                  </LTD>
                  <LTD style={{ fontSize: "0.77rem" }}>
                    {b.uhid || "—"} / {b.ip_number || "—"}
                  </LTD>
                  <LTD style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</LTD>
                  <LTD>₹{fmt(b.total_amount)}</LTD>
                  <LTD style={{ color: T.danger }}>₹{fmt(b.advance_amount)}</LTD>
                  <LTD style={{ color: T.danger }}>₹{fmt(b.discount_amount)}</LTD>
                  <LTD style={{ color: T.blue }}>₹{fmt(b.gst_amount)}</LTD>
                  <LTD style={{ fontWeight: 700, color: isCanc ? T.textMuted : T.success }}>
                    ₹{fmt(b.net_amount)}
                  </LTD>
                  <LTD style={{ fontSize: "0.77rem" }}>
                    {b.bill_date ? new Date(b.bill_date).toLocaleDateString("en-IN") : "—"}
                  </LTD>
                  <LTD>
                    <Badge $v={isCanc ? "cancelled" : "billed"}>
                      {isCanc ? "Cancelled" : "Billed"}
                    </Badge>
                  </LTD>
                  <LTD style={{ textAlign: "center" }}>
                    <AW>
                      <DotB onClick={e => handleMenuToggle(b.id, e)} title="Actions">⋮</DotB>
                    </AW>
                  </LTD>
                </LTR>
              );
            })}
          </tbody>
        </LTable>
      </TScrollWrap>

      {/* Pagination */}
      {filtered.length > 0 && (
        <PaginationBar>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PaginationInfo>
              Showing {pageStart + 1}–{Math.min(pageStart + perPage, filtered.length)} of {filtered.length}
            </PaginationInfo>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.72rem", color: T.textMuted }}>Per page:</span>
              <PerPageSelect
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </PerPageSelect>
            </div>
          </div>
          <PaginationBtns>
            <Btn $pag onClick={() => goPage(1)}            disabled={safePage === 1}>«</Btn>
            <Btn $pag onClick={() => goPage(safePage - 1)} disabled={safePage === 1}>‹</Btn>
            {pageButtons().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: T.textMuted, fontSize: "0.8rem" }}>…</span>
              ) : (
                <Btn $pag $active={p === safePage} key={p} onClick={() => goPage(p)}>{p}</Btn>
              )
            )}
            <Btn $pag onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}>›</Btn>
            <Btn $pag onClick={() => goPage(totalPages)}   disabled={safePage === totalPages}>»</Btn>
          </PaginationBtns>
        </PaginationBar>
      )}

      {/* ── 3-Dots Action Dropdown Menu ── */}
      {openMenu !== null && (() => {
        const b = paginated.find(x => x.id === openMenu);
        if (!b) return null;
        const isCanc = b.is_cancelled || b.status === "Cancelled";
        return (
          <Drop
            ref={menuRef}
            top={menuPos.top}
            bottom={menuPos.bottom}
            left={menuPos.left}
            placement={menuPos.placement}
            maxHeight={menuPos.maxHeight}
          >
            {!isCanc && onEditBill && (
              <DI onClick={() => { setOpenMenu(null); onEditBill(b); }}>
                ✏️ Edit Bill
              </DI>
            )}
            <DI onClick={() => { setOpenMenu(null); handleOpenPrint(b); }}>
              🖨️ Print Bill
            </DI>
            <DI onClick={() => { setOpenMenu(null); setAuditBill(b); }}>
              📜 Audit History
            </DI>
            {!isCanc && (
              <DI danger onClick={() => { setOpenMenu(null); setCancelBill(b); }}>
                🚫 Cancel Bill
              </DI>
            )}
          </Drop>
        );
      })()}

      {/* ── Cancel Modal ── */}
      {cancelBill && (
        <ModalOverlay onClick={() => setCancelBill(null)}>
          <ModalBox $w="460px" onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>🚫 Cancel Bill — #{cancelBill.bill_no}</ModalTitle>
              <ModalClose onClick={() => setCancelBill(null)}>✕</ModalClose>
            </ModalHead>
            <ModalBody>
              <p style={{ fontSize: "0.82rem", color: T.textMid, marginBottom: 12 }}>
                Are you sure you want to cancel this bill? Please enter the reason for cancellation:
              </p>
              <FG>
                <FL>Reason for Cancellation *</FL>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Enter detailed reason for cancellation…"
                  style={{
                    width: "100%", padding: "8px 10px", fontSize: "0.83rem",
                    borderRadius: 6, border: `1px solid ${T.border}`, outline: "none"
                  }}
                />
              </FG>
            </ModalBody>
            <ModalFoot>
              <Btn $ghost onClick={() => setCancelBill(null)}>Cancel</Btn>
              <Btn $danger onClick={handleConfirmCancel} disabled={cancelBusy || !cancelReason.trim()}>
                {cancelBusy ? <Spinner /> : "Confirm Cancel"}
              </Btn>
            </ModalFoot>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Edit History Modal ── */}
      {auditBill && (
        <ModalOverlay onClick={() => setAuditBill(null)}>
          <ModalBox $w="740px" onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>📜 Edit History — #{auditBill.bill_no || auditBill.estimate_number}</ModalTitle>
              <ModalClose onClick={() => setAuditBill(null)}>✕</ModalClose>
            </ModalHead>
            <ModalBody>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 12, color: T.primary }}>
                Edit History Log ({auditBill.edit_history ? auditBill.edit_history.length : 0})
              </h4>
              {(!auditBill.edit_history || auditBill.edit_history.length === 0) ? (
                <div style={{ fontSize: "0.78rem", color: T.textMuted, fontStyle: "italic", textAlign: "center", padding: 16 }}>
                  No edits recorded for this document yet.
                </div>
              ) : (
                <LTable>
                  <thead>
                    <tr>
                      <LTH>#</LTH>
                      <LTH>Edited By</LTH>
                      <LTH>Edited Date</LTH>
                      <LTH>Reason for Edit</LTH>
                      <LTH>Field</LTH>
                      <LTH>Before</LTH>
                      <LTH>After</LTH>
                    </tr>
                  </thead>
                  <tbody>
                    {auditBill.edit_history.map((h, idx) => (
                      <LTR key={idx}>
                        <LTD>{idx + 1}</LTD>
                        <LTD style={{ fontWeight: 600 }}>{h.edited_by || "—"}</LTD>
                        <LTD style={{ fontSize: "0.75rem" }}>{h.edited_date ? new Date(h.edited_date).toLocaleString() : "—"}</LTD>
                        <LTD style={{ fontWeight: 600, color: T.amber }}>{h.edit_reason || "—"}</LTD>
                        <LTD style={{ fontWeight: 600, color: T.primary }}>{h.field_name || "—"}</LTD>
                        <LTD style={{ color: T.danger }}>{h.before_value || "—"}</LTD>
                        <LTD style={{ color: T.success }}>{h.after_value || "—"}</LTD>
                      </LTR>
                    ))}
                  </tbody>
                </LTable>
              )}
            </ModalBody>
            <ModalFoot>
              <Btn $ghost onClick={() => setAuditBill(null)}>Close</Btn>
            </ModalFoot>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Discharge Bill Print Modal ── */}
      {printBill && (
        <ModalOverlay onClick={() => setPrintBill(null)}>
          <ModalBox $w="860px" onClick={e => e.stopPropagation()}>
            <ModalHead className="no-print">
              <ModalTitle>🖨️ Discharge Bill Print Preview</ModalTitle>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn $outline $sm onClick={handleDownloadWord}>📄 Download Word</Btn>
                <Btn $amber $sm onClick={handleDownloadPDF}>📑 Download PDF</Btn>
                <Btn $primary $sm onClick={triggerPrint}>🖨️ Print</Btn>
                <ModalClose onClick={() => setPrintBill(null)}>✕</ModalClose>
              </div>
            </ModalHead>
            <ModalBody style={{ padding: 0 }}>
              <PrintSheet ref={printRef} bill={printBill} />
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </Card>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Printable Discharge Bill Component
// ═════════════════════════════════════════════════════════════════════════════

const PrintSheet = React.forwardRef(({ bill }, ref) => {
  const pd = bill?.patient_details || {};
  const items = parseItems(bill?.items);

  const fmtDateStr = (str) => {
    if (!str) return "—";
    if (typeof str === "string" && str.trim()) {
      const s = str.trim();
      const ddmmyyyy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (ddmmyyyy) {
        const day = ddmmyyyy[1].padStart(2, "0");
        const month = ddmmyyyy[2].padStart(2, "0");
        const year = ddmmyyyy[3];
        return `${day}/${month}/${year}`;
      }
      const yyyymmdd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (yyyymmdd) {
        const year = yyyymmdd[1];
        const month = yyyymmdd[2].padStart(2, "0");
        const day = yyyymmdd[3].padStart(2, "0");
        return `${day}/${month}/${year}`;
      }
    }
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return "—";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  return (
    <div ref={ref} className="print-area" style={{
      width: "100%", background: "#fff", color: "#000",
      fontFamily: "'Courier New', Courier, monospace, sans-serif", padding: "20px 24px", boxSizing: "border-box"
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 10px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Image */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <img src={headerImg} alt="Hospital Header" style={{ maxWidth: "100%", height: "auto", maxHeight: "85px" }} />
      </div>

      {/* Title & Banner */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "2px solid #000", borderBottom: "2px solid #000",
        padding: "4px 8px", fontWeight: "bold", fontSize: "0.85rem", marginBottom: 10
      }}>
        <span>DISCHARGE BILL &nbsp;-&nbsp; GST EXEMPT</span>
        <span>CREDIT BILL</span>
      </div>

      {/* Patient & Bill Info Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3px 16px",
        fontSize: "0.78rem", lineHeight: "1.4", borderBottom: "1.5px solid #000", paddingBottom: 8, marginBottom: 10
      }}>
        <div><strong>OP Number</strong> &nbsp;&nbsp;: {bill.uhid || pd.uhid || "—"}</div>
        <div><strong>SH-Bill No</strong> &nbsp;: {bill.bill_no || bill.estimate_number || "—"}</div>

        <div><strong>Name</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {(pd.patient_name || "—").toUpperCase()}, {pd.gender || ""}, {pd.age ? `${pd.age} YEARS` : ""}</div>
        <div><strong>IP Number</strong> &nbsp;&nbsp;: {bill.ip_number || pd.ip_number || "—"}</div>

        <div><strong>Address</strong> &nbsp;&nbsp;&nbsp;: {pd.address || pd.permanent_address || "—"}</div>
        <div><strong>Billdate</strong> &nbsp;&nbsp;&nbsp;: {fmtDateStr(bill.bill_date)}</div>

        <div><strong>Doctor</strong> &nbsp;&nbsp;&nbsp;&nbsp;: {pd.doctor || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN"}</div>
        <div><strong>DOA</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {fmtDateStr(pd.admission_date || pd.admissionDateTime)}</div>

        <div><strong>Room Details</strong>: {pd.room_no || pd.roomNo || "GENERAL WARD"}</div>
        <div><strong>DOD</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {fmtDateStr(bill.bill_date)}</div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", marginBottom: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #000", borderTop: "1.5px solid #000" }}>
            <th style={{ textAlign: "left", padding: "6px 4px", width: "40px" }}>SlNo</th>
            <th style={{ textAlign: "left", padding: "6px 4px" }}>Description</th>
            <th style={{ textAlign: "right", padding: "6px 4px", width: "80px" }}>Quantity</th>
            <th style={{ textAlign: "right", padding: "6px 4px", width: "100px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td style={{ padding: "5px 4px", verticalAlign: "top" }}>{idx + 1}</td>
              <td style={{ padding: "5px 4px", verticalAlign: "top" }}>{it.itemName}</td>
              <td style={{ padding: "5px 4px", textAlign: "right", verticalAlign: "top" }}>{it.quantity || 1}</td>
              <td style={{ padding: "5px 4px", textAlign: "right", verticalAlign: "top" }}>{fmt(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Totals */}
      <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", paddingTop: 8, paddingBottom: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, fontSize: "0.88rem", fontWeight: "bold" }}>
          <span>Total :</span>
          <span style={{ width: "100px", textAlign: "right" }}>{fmt(bill.total_amount)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, fontSize: "0.92rem", fontWeight: "bold", marginTop: 6 }}>
          <span>Net Amount :</span>
          <span style={{ width: "100px", textAlign: "right" }}>{fmt(bill.net_amount)}</span>
        </div>
      </div>

      {/* Footer Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30, fontSize: "0.82rem" }}>
        <div>
          <strong>Prepared By :</strong> {bill.created_by_name || bill.created_by || "CASHIER"}
        </div>
        <div>
          <strong>Signature</strong>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: "0.68rem", fontStyle: "italic", marginTop: 24, borderTop: "1px solid #ccc", paddingTop: 6 }}>
        Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate). This is a GST Exempt Invoice.
      </div>
    </div>
  );
});

export default ViewBills;