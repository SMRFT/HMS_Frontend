import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"
import { InvTopToolbar, getTodayDateString, InvSelect, SearchSelect, InvPagination, InvDeleteBtn } from "./InventoryUIHelper"
import SendEmailModal from "./SendEmailModal"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`
const fadeIn    = keyframes`from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}`
const spin      = keyframes`to{transform:rotate(360deg)}`

/* ── Tokens ── */
const C = {
  primary : "#0d9488",
  pDark   : "#0f766e",
  pLight  : "#f0fdfa",
  pBorder : "#a7f3d0",
  bg      : "#f0f4f8",
  surface : "#ffffff",
  border  : "#e2e8f0",
  faint   : "#f8fafc",
  text    : "#111827",
  muted   : "#6b7280",
  danger  : "#dc2626",
  amber   : "#f97316",
  amberD  : "#ea6c0a",
}

/* ── Layout ── */
const Wrap   = styled.div`min-height:100vh;background:${C.bg};padding-bottom:48px;font-family:'DM Sans',system-ui,sans-serif;`
const Header = styled.div`
  background:linear-gradient(135deg,${C.primary} 0%,${C.pDark} 100%);
  color:#fff;padding:18px 28px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
  box-shadow:0 4px 20px rgba(13,148,136,.25);
`
const HTitle = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSub   = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body   = styled.div`max-width:1180px;margin:0 auto;padding:22px 20px;`

/* ── Tabs ── */
const TabRow = styled.div`display:flex;gap:4px;`
const Tab    = styled.button`
  padding:7px 18px;border-radius:6px;font-size:.82rem;font-weight:700;
  cursor:pointer;font-family:inherit;border:none;transition:all .14s;
  background:${p => p.$a ? "#fff" : "rgba(255,255,255,.18)"};
  color:${p => p.$a ? C.primary : "#fff"};
  border:1px solid ${p => p.$a ? "transparent" : "rgba(255,255,255,.3)"};
`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);`
const AniCard  = styled(Card)`${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};border-radius:9px 9px 0 0;padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`
const CardBody = styled.div`padding:18px 20px;`

/* ── Grid ── */
const Grid = styled.div`
  display:grid;grid-template-columns:${p => p.$cols || "repeat(2,1fr)"};gap:12px;margin-bottom:14px;
  @media(max-width:760px){grid-template-columns:1fr 1fr!important;}
  @media(max-width:500px){grid-template-columns:1fr!important;}
`

/* ── Form controls ── */
const FG  = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp = styled.input`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`
const Sel = SearchSelect;
const Txta = styled.textarea`
  padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;
  font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;resize:vertical;min-height:64px;font-family:inherit;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const ErrMsg = styled.span`font-size:.68rem;color:${C.danger};margin-top:2px;`

/* ── Autocomplete ── */
const AutoWrap = styled.div`position:relative;`
const Drop     = styled.ul`
  position:absolute;top:100%;left:0;right:0;z-index:9999;
  background:#fff;border:1.5px solid ${C.border};border-top:none;
  border-radius:0 0 8px 8px;max-height:190px;overflow-y:auto;
  list-style:none;margin:0;padding:0;box-shadow:0 8px 24px rgba(0,0,0,.12);
`
const DropRow = styled.li`
  padding:8px 12px;font-size:.82rem;cursor:pointer;border-bottom:1px solid #f3f3f0;
  &:last-child{border-bottom:none;}
  &:hover{background:${C.pLight};color:${C.primary};}
`

/* ── Line-item table ── */
const LineTable = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const LTh = styled.th`
  background:${C.faint};color:${C.muted};padding:8px 10px;
  text-align:left;font-size:.68rem;font-weight:800;text-transform:uppercase;
  letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;
`
const LTd  = styled.td`padding:7px 8px;border-bottom:1px solid #f0ede8;vertical-align:middle;`
const LTr  = styled.tr`&:hover{background:#fafaf8;}`
const DelB = styled.button`
  display:inline-flex;align-items:center;justify-content:center;
  width:26px;height:26px;border:none;border-radius:5px;
  background:#fee2e2;color:${C.danger};cursor:pointer;font-size:.9rem;
  &:hover{background:#fecaca;}
`
const AddLineBtn = styled.button`
  display:inline-flex;align-items:center;gap:6px;
  padding:7px 14px;border:1.5px dashed ${C.primary};
  border-radius:7px;background:rgba(13,148,136,.04);
  color:${C.primary};font-size:.8rem;font-weight:700;
  cursor:pointer;font-family:inherit;margin-top:8px;transition:background .13s;
  &:hover{background:rgba(13,148,136,.1);}
`

/* ── Buttons ── */
const Btn     = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:9px 22px;border:none;border-radius:7px;
  font-size:.85rem;font-weight:800;cursor:pointer;font-family:inherit;
  transition:background .13s,transform .1s;
  &:active{transform:translateY(1px);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`
const PrimBtn  = styled(Btn)`background:${C.primary};color:#fff;&:hover:not(:disabled){background:${C.pDark};}`
const SecBtn   = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};&:hover:not(:disabled){background:${C.faint};}`
const BtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Dropdown Action Menu (Matching Admission List) ── */
const AW = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const DotB = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  line-height: 1;
  color: #6b7280;
  transition: all .15s ease;
  &:hover {
    background: #f3f4f6;
    color: #111827;
    border-color: #cbd5e1;
  }
`;

const DropMenu = styled.div`
  position: fixed;
  ${p => p.placement === "top" ? `bottom: ${p.bottom}px;` : `top: ${p.top}px;`}
  left: ${p => p.left}px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .16);
  z-index: 9999;
  min-width: 190px;
  max-height: ${p => p.maxHeight || 280}px;
  overflow-y: auto;
  overflow-x: hidden;
  animation: ${fadeIn} .14s ease;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const DI = styled.button`
  width: 100%;
  padding: 9px 14px;
  text-align: left;
  font-size: .78rem;
  font-weight: 500;
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${p => p.disabled ? '#9ca3af' : p.danger ? '#dc2626' : p.$mail ? '#7c3aed' : p.$success ? '#166534' : '#374151'};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: background .12s, color .12s;
  &:hover:not(:disabled), &:focus:not(:disabled) {
    background: ${p => p.danger ? '#fff1f2' : p.$mail ? '#f5f3ff' : p.$success ? '#f0fdf4' : '#f0fdf4'};
    color: ${p => p.danger ? '#dc2626' : p.$mail ? '#6d28d9' : p.$success ? '#166534' : '#0d9488'};
    box-shadow: inset 3px 0 0 ${p => p.danger ? '#dc2626' : p.$mail ? '#7c3aed' : p.$success ? '#16a34a' : '#0d9488'};
  }
`;

/* ── Badge ── */
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: .68rem;
  font-weight: 700;
  background: ${p => p.$s === "Approved" ? "#dcfce7" : p.$s === "Rejected" ? "#fee2e2" : p.$s === "Verified" ? "#dbeafe" : "#fef9c3"};
  color: ${p => p.$s === "Approved" ? "#166534" : p.$s === "Rejected" ? "#991b1b" : p.$s === "Verified" ? "#1d4ed8" : "#92400e"};
  border: 1px solid ${p => p.$s === "Approved" ? "#86efac" : p.$s === "Rejected" ? "#fca5a5" : p.$s === "Verified" ? "#93c5fd" : "#fde68a"};
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => p.$s === "Approved" ? "#16a34a" : p.$s === "Rejected" ? "#dc2626" : p.$s === "Verified" ? "#2563eb" : "#d97706"};
  }
`;

const Pill = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #0d9488;
  font-weight: 700;
  font-size: .78rem;
  font-family: monospace;
  border: 1px solid #99f6e4;
`;

/* ── List table ── */
const TblWrap = styled.div`
  overflow-x: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;
const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: .82rem;
`;
const Thead = styled.thead`
  background: #f9fafb;
`;
const Th = styled.th`
  padding: 10px 14px;
  text-align: left;
  font-size: .72rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: .05em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
`;
const Td = styled.td`
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
  font-size: .8rem;
`;
const Trow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
  &:hover {
    background-color: #f8fafc;
  }
`;

/* ── Modal ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;padding:28px 32px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const MTitle   = styled.h3`margin:0 0 7px;font-size:1rem;font-weight:800;color:${C.text};`
const MSub     = styled.p`margin:0 0 16px;font-size:.875rem;color:${C.muted};line-height:1.55;`
const Spin     = styled.span`display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;${css`animation:${spin} .6s linear infinite;`}`

/* ── Helper: guarantee items is always a plain array ── */
// Items come from MongoDB as a native array — no JSON.parse needed.
// This guard only handles edge-cases where the field is unexpectedly absent.
const safeItems = (raw) => (Array.isArray(raw) ? raw : [])

/* ── Edit-reason modal ── */
const EditReasonModal = ({ onConfirm, onClose }) => {
  const [r, setR] = useState("")
  const [t, setT] = useState(false)
  const go = () => { setT(true); if (!r.trim()) return; onConfirm(r.trim()) }
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✏️ Reason for Edit</MTitle>
        <MSub>Describe what changed and why — recorded for audit.</MSub>
        <FG style={{ marginBottom: 18 }}>
          <Lbl>Reason <span style={{ color: C.danger }}>*</span></Lbl>
          <Txta
            value={r}
            onChange={e => setR(e.target.value)}
            placeholder="e.g. Updated quantity per revised indent…"
            style={{ borderColor: t && !r.trim() ? C.danger : undefined }}
          />
          {t && !r.trim() && <ErrMsg>Reason is required.</ErrMsg>}
        </FG>
        <BtnRow>
          <SecBtn onClick={onClose}>Cancel</SecBtn>
          <PrimBtn onClick={go}>Confirm &amp; Save</PrimBtn>
        </BtnRow>
      </MBox>
    </MOverlay>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

// Each line item has a local _id (for React keys) that is never sent to backend.
const EMPTY_LINE = () => ({
  _id:           Date.now() + Math.random(),
  item_id:       null,
  medicine_name: "",
  quantity:      "1",
})

export default function PurchaseOrder() {
  const [tab,         setTab]         = useState("form")
  const [vendors,     setVendors]     = useState([])
  const [poList,      setPoList]      = useState([])
  const [editPo,      setEditPo]      = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [showReason,  setShowReason]  = useState(false)
  const [pendingSave, setPendingSave] = useState(null)
  const [viewPo,      setViewPo]      = useState(null)
  const [openMenu,    setOpenMenu]    = useState(null)
  const [menuPos,     setMenuPos]     = useState({ top: 0, bottom: 0, left: 0, placement: "bottom", maxHeight: 280 })
  const menuRef = useRef(null)

  const [emailPo,      setEmailPo]      = useState(null)
  const [emailLoading, setEmailLoading] = useState(false)

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* form state */
  const [vendorId, setVendorId] = useState("")
  const [lines,    setLines]    = useState([EMPTY_LINE()])
  const [errs,     setErrs]     = useState({})

  /* list filters */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState(getTodayDateString())
  const [toDate,     setToDate]     = useState(getTodayDateString())

  /* per-row medicine autocomplete */
  const [medSearch,  setMedSearch]  = useState({})   // { [lineId]: inputText }
  const [medResults, setMedResults] = useState({})   // { [lineId]: [...items] }
  const [showDrop,   setShowDrop]   = useState({})   // { [lineId]: bool }
  const dropRef = useRef(null)

  /* close dropdowns on outside click / scroll / resize */
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop({})
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null)
    }
    const handleScrollOrResize = () => {
      if (openMenu !== null) setOpenMenu(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [openMenu])

  const handleMenuToggle = (poNumber, e) => {
    if (openMenu === poNumber) {
      setOpenMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const mw = 190
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    const menuEstimatedHeight = 180

    let left = rect.right - mw
    if (left < 8) left = 8
    if (left + mw > windowWidth - 8) left = windowWidth - mw - 8

    const spaceBelow = windowHeight - rect.bottom
    const spaceAbove = rect.top

    let placement = "bottom"
    let top = rect.bottom + 4
    let bottom = 0
    let maxHeight = Math.min(280, spaceBelow - 12)

    if (spaceBelow < menuEstimatedHeight && spaceAbove > spaceBelow) {
      placement = "top"
      bottom = windowHeight - rect.top + 4
      maxHeight = Math.min(280, spaceAbove - 12)
    } else {
      maxHeight = Math.max(120, maxHeight)
    }

    setMenuPos({ top, bottom, left, placement, maxHeight })
    setOpenMenu(poNumber)
  }

  const handleEmailConfirm = async toEmail => {
    setEmailLoading(true)
    try {
      const r = await apiRequest(`${BASE}purchase-order-email/`, "POST", {
        po_number: emailPo.po_number,
        to_email: toEmail,
      })
      if (r?.success) {
        toast.success(`PO ${emailPo.po_number} sent to ${r?.data?.sent_to || toEmail}`)
        setEmailPo(null)
      } else {
        const err = r?.error || r?.data?.error
        toast.error(typeof err === "string" ? err : "Failed to send email")
      }
    } catch {
      toast.error("Network error while sending email")
    } finally {
      setEmailLoading(false)
    }
  }

  const fmtD = d => {
    try {
      if (!d) return "—"
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch { return "—" }
  }

  const fmtT = d => {
    try {
      if (!d) return ""
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? "" : dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    } catch { return "" }
  }

  /* ── fetch vendors ── */
  const fetchVendors = useCallback(async () => {
    try {
      const r    = await apiRequest(`${BASE}vendors/`, "GET")
      const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      const sorted = (Array.isArray(list) ? list : []).map(v => ({
        ...v,
        name: v.name ? String(v.name).toUpperCase() : v.name
      })).sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }))
      setVendors(sorted)
    } catch { toast.error("Failed to load vendors") }
  }, [])

  /* ── fetch PO list with server-side pagination ── */
  const fetchList = useCallback(async (p = page, size = pageSize, q = searchQ, stat = filterStat, from = fromDate, to = toDate) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: p,
        page_size: size,
      })
      if (q && q.trim()) params.append("search", q.trim())
      if (stat) params.append("status", stat)
      if (from) params.append("from_date", from)
      if (to)   params.append("to_date",   to)

      const r    = await apiRequest(`${BASE}purchase-order/?${params.toString()}`, "GET")
      const payload = r?.data
      const rows = payload?.data ?? (Array.isArray(payload) ? payload : [])

      const normalized = (Array.isArray(rows) ? rows : []).map(po => ({
        ...po,
        items: safeItems(po.items),
      }))

      setPoList(normalized)
      setTotalCount(payload?.count !== undefined ? payload.count : (r?.count !== undefined ? r.count : normalized.length))
      setTotalPages(payload?.total_pages || Math.ceil((payload?.count || normalized.length) / size) || 1)
      setPage(payload?.current_page || p)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load purchase orders")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQ, filterStat, fromDate, toDate])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    if (tab === "list") {
      fetchList(page, pageSize, searchQ, filterStat, fromDate, toDate)
    }
  }, [tab, page, pageSize, searchQ, filterStat, fromDate, toDate, fetchList])

  /* ── medicine autocomplete ── */
  const searchMeds = useCallback(async (lineId, query) => {
    if (!query || query.length < 2) {
      setMedResults(p => ({ ...p, [lineId]: [] }))
      setShowDrop(p   => ({ ...p, [lineId]: false }))
      return
    }
    try {
      const cleanQ = query.trim().toUpperCase()
      const r    = await apiRequest(`${BASE}pharmacy_items/?q=${encodeURIComponent(query.trim())}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      const filtered = (Array.isArray(rows) ? rows : []).filter(m =>
        String(m.item_name || "").toUpperCase().startsWith(cleanQ)
      )
      setMedResults(p => ({ ...p, [lineId]: filtered }))
      setShowDrop(p   => ({ ...p, [lineId]: filtered.length > 0 }))
    } catch { setMedResults(p => ({ ...p, [lineId]: [] })) }
  }, [])

  /* ── line item handlers ── */
  const updateLine = (id, field, value) =>
    setLines(prev => prev.map(l => l._id !== id ? l : { ...l, [field]: value }))

  const handleMedInput = (lineId, val) => {
    setMedSearch(p  => ({ ...p, [lineId]: val }))
    updateLine(lineId, "medicine_name", val)
    updateLine(lineId, "item_id", null)
    searchMeds(lineId, val)
  }

  const selectMed = (lineId, med) => {
    const fullName = `${med.item_name || ""} ${med.item_last_name || ""}`.trim()
    setMedSearch(p => ({ ...p, [lineId]: fullName }))
    setLines(prev => prev.map(l =>
      l._id === lineId ? { ...l, item_id: med.item_id, medicine_name: fullName } : l
    ))
    setShowDrop(p => ({ ...p, [lineId]: false }))
  }

  const addLine = () => setLines(p => [...p, EMPTY_LINE()])

  const removeLine = id => {
    if (lines.length === 1) { toast.warning("At least one item is required"); return }
    setLines(p      => p.filter(l => l._id !== id))
    setMedSearch(p  => { const n = { ...p }; delete n[id]; return n })
    setMedResults(p => { const n = { ...p }; delete n[id]; return n })
    setShowDrop(p   => { const n = { ...p }; delete n[id]; return n })
  }

  /* ── validate ── */
  const validate = () => {
    const e = {}
    if (!vendorId) e.vendorId = "Required"
    lines.forEach((l, i) => {
      if (!l.medicine_name.trim())                e[`med_${i}`] = "Required"
      if (!l.quantity || Number(l.quantity) < 1)  e[`qty_${i}`] = "Min 1"
    })
    setErrs(e)
    return Object.keys(e).length === 0
  }

  /* ── build payload ── */
  const buildPayload = (editedReason) => {
    const vendorObj = vendors.find(v => String(v.vendor_id) === String(vendorId))
    return {
      vendor_id:   vendorId,
      vendor_name: vendorObj?.name || "",
      supplier:    vendorObj?.name || "",
      items: lines.map(l => ({
        item_id:       l.item_id || null,
        medicine_name: l.medicine_name.trim(),
        quantity:      Number(l.quantity) || 1,
      })),
      ...(editPo ? { edited_reason: editedReason } : {}),
    }
  }

  const handleSubmit = () => {
    if (!validate()) { toast.error("Please fix highlighted fields"); return }
    if (editPo) {
      setPendingSave(buildPayload(null))
      setShowReason(true)
    } else {
      doSave(buildPayload())
    }
  }

  const handleReasonConfirm = reason => {
    setShowReason(false)
    doSave({ ...pendingSave, edited_reason: reason })
    setPendingSave(null)
  }

  const doSave = async payload => {
    setSaving(true)
    try {
      const isEdit = !!editPo
      const url    = isEdit ? `${BASE}purchase-order/${editPo.po_number}/` : `${BASE}purchase-order/`
      const method = isEdit ? "PUT" : "POST"
      const r      = await apiRequest(url, method, payload)
      if (r?.success) {
        toast.success(isEdit ? "Purchase Order updated" : `Draft created: ${r.data?.po_number}`)
        resetForm(); fetchList(); setTab("list")
      } else {
        const err = r?.error
        toast.error(Array.isArray(err) ? err.join(", ") : typeof err === "string" ? err : "Save failed")
      }
    } catch { toast.error("Network error") }
    finally { setSaving(false) }
  }

  /* ── load PO into edit form ── */
  const handleEdit = po => {
    if (po.status === "Approved" || po.status === "Rejected") {
      toast.warning(`Cannot edit a ${po.status} Purchase Order`)
      return
    }

    const items = safeItems(po.items)

    setEditPo(po)
    setVendorId(String(po.vendor_id || ""))

    const loadedLines = items.map(it => ({
      _id:           Date.now() + Math.random(),
      item_id:       it.item_id || null,
      medicine_name: it.medicine_name || "",
      quantity:      String(it.quantity || 1),
    }))

    setLines(loadedLines.length ? loadedLines : [EMPTY_LINE()])

    const ms = {}
    loadedLines.forEach(l => { ms[l._id] = l.medicine_name })
    setMedSearch(ms)

    setErrs({})
    setTab("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── reset ── */
  const resetForm = () => {
    setEditPo(null)
    setVendorId("")
    setLines([EMPTY_LINE()])
    setMedSearch({}); setMedResults({}); setShowDrop({})
    setErrs({})
  }

  /* ── date formatters ── */
  const fmtDT = d => {
    try { return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—" }
    catch { return "—" }
  }

  const nowDisplay = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Wrap>

      {/* ── Header ── */}
      <Header>
        <div>
          <HTitle>🛒 Purchase Order</HTitle>
          <HSub>Create &amp; manage medicine purchase orders</HSub>
        </div>
        <TabRow>
          <Tab $a={tab === "form"} onClick={() => { resetForm(); setTab("form") }}>+ New PO</Tab>
          <Tab $a={tab === "list"} onClick={() => setTab("list")}>📄 PO List</Tab>
        </TabRow>
      </Header>

      <Body>

        {/* ══════════ FORM TAB ══════════ */}
        {tab === "form" && (
          <>
            {/* Vendor + Order date */}
            <AniCard>
              <CardHead>
                {editPo ? `✏️ Edit Purchase Order — ${editPo.po_number}` : "📝 New Purchase Order"}
                {editPo && <Badge $s={editPo.status}>{editPo.status}</Badge>}
              </CardHead>
              <CardBody>
                <Grid $cols="1fr 1fr">
                  {/* Vendor — single selection for the whole PO */}
                  <FG>
                    <Lbl>Vendor <span style={{ color: C.danger }}>*</span></Lbl>
                    <Sel $err={!!errs.vendorId} value={vendorId} onChange={e => setVendorId(e.target.value)}>
                      <option value="">— Select Vendor —</option>
                      {vendors.map(v => (
                        <option key={v.vendor_id} value={String(v.vendor_id)}>{String(v.name || "").toUpperCase()}</option>
                      ))}
                    </Sel>
                    {errs.vendorId && <ErrMsg>{errs.vendorId}</ErrMsg>}
                  </FG>

                  {/* Order date — server-stamped, displayed read-only */}
                  <FG>
                    <Lbl>Order Date &amp; Time</Lbl>
                    <Inp
                      value={editPo ? fmtDT(editPo.created_date) : nowDisplay}
                      disabled
                    />
                  </FG>
                </Grid>
              </CardBody>
            </AniCard>

            {/* Medicine line items */}
            <AniCard>
              <CardHead>
                💊 Medicine Items
                <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 9px", borderRadius: 12, fontSize: ".7rem", fontWeight: 800 }}>
                  {lines.length} line{lines.length !== 1 ? "s" : ""}
                </span>
              </CardHead>
              <CardBody style={{ padding: "14px 16px" }}>
                <div ref={dropRef}>
                  <LineTable>
                    <thead>
                      <tr>
                        <LTh style={{ width: 32 }}>#</LTh>
                        <LTh>Medicine Name</LTh>
                        <LTh style={{ width: 130 }}>Quantity</LTh>
                        <LTh style={{ width: 44 }}></LTh>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <LTr key={line._id}>
                          <LTd style={{ color: C.muted, fontSize: ".72rem", fontWeight: 700 }}>{idx + 1}</LTd>

                          {/* Medicine autocomplete */}
                          <LTd>
                            <AutoWrap>
                              <Inp
                                $err={!!errs[`med_${idx}`]}
                                value={medSearch[line._id] ?? line.medicine_name}
                                onChange={e => handleMedInput(line._id, e.target.value)}
                                onFocus={() =>
                                  (medResults[line._id] || []).length &&
                                  setShowDrop(p => ({ ...p, [line._id]: true }))
                                }
                                placeholder="Search medicine…"
                                style={{ minWidth: 200 }}
                              />
                              {showDrop[line._id] && (medResults[line._id] || []).length > 0 && (
                                <Drop>
                                  {(medResults[line._id] || []).map(m => {
                                    const fullName = `${m.item_name || ""} ${m.item_last_name || ""}`.trim()
                                    return (
                                      <DropRow key={m.item_id} onMouseDown={() => selectMed(line._id, m)}>
                                        <strong>{fullName}</strong>
                                        {m.hsn && (
                                          <span style={{ color: C.muted, marginLeft: 6, fontSize: ".72rem" }}>
                                            HSN: {m.hsn}
                                          </span>
                                        )}
                                      </DropRow>
                                    )
                                  })}
                                </Drop>
                              )}
                            </AutoWrap>
                            {errs[`med_${idx}`] && <ErrMsg>{errs[`med_${idx}`]}</ErrMsg>}
                          </LTd>

                          {/* Quantity */}
                          <LTd>
                            <Inp
                              $err={!!errs[`qty_${idx}`]}
                              value={line.quantity}
                              onChange={e => updateLine(line._id, "quantity", e.target.value)}
                              style={{ width: "100%" }}
                            />
                            {errs[`qty_${idx}`] && <ErrMsg>{errs[`qty_${idx}`]}</ErrMsg>}
                          </LTd>

                          <LTd style={{ textAlign: "center" }}>
                            <InvDeleteBtn size={16} onClick={() => removeLine(line._id)} title="Remove line" />
                          </LTd>
                        </LTr>
                      ))}
                    </tbody>
                  </LineTable>
                </div>

                <AddLineBtn onClick={addLine} type="button">＋ Add Medicine Line</AddLineBtn>

                <BtnRow style={{ marginTop: 20 }}>
                  <SecBtn onClick={resetForm} disabled={saving}>✕ Clear</SecBtn>
                  <PrimBtn onClick={handleSubmit} disabled={saving}>
                    {saving ? <><Spin /> Saving…</> : editPo ? "💾 Update PO" : "💾 Save as Draft"}
                  </PrimBtn>
                </BtnRow>
              </CardBody>
            </AniCard>
          </>
        )}

        {/* ══════════ LIST TAB ══════════ */}
        {tab === "list" && (
          <Card>
            <CardHead>
              📄 Purchase Orders
              <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".7rem", padding: "1px 8px", borderRadius: 12, fontWeight: 700 }}>
                {totalCount}
              </span>
            </CardHead>

            {/* Filters & Show Upto Toolbar */}
            <InvTopToolbar
              pageSize={pageSize}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={(d) => {
                setFromDate(d);
                setPage(1);
              }}
              onToDateChange={(d) => {
                setToDate(d);
                setPage(1);
              }}
              onSetToday={() => {
                setFromDate(getTodayDateString());
                setToDate(getTodayDateString());
                setPage(1);
              }}
              onClearDate={() => {
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
              search={searchQ}
              onSearchChange={(val) => {
                setSearchQ(val);
                setPage(1);
              }}
              searchPlaceholder="Search PO No, Vendor…"
              totalRecords={totalCount}
              customFilters={
                <InvSelect
                  style={{ width: 130, minWidth: 110, height: 30, fontSize: "0.78rem" }}
                  value={filterStat}
                  onChange={(e) => {
                    setFilterStat(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  {["Draft", "Verified", "Approved", "Rejected"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </InvSelect>
              }
            />

            <TblWrap>
              {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem" }}>
                  <span style={{ display: "inline-block", marginRight: 8 }}>⏳</span> Loading purchase orders…
                </div>
              ) : poList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem" }}>
                  📭 No purchase orders found
                </div>
              ) : (
                <Tbl>
                  <Thead>
                    <tr>
                      <Th style={{ width: 45 }}>#</Th>
                      <Th style={{ width: 130 }}>PO No</Th>
                      <Th>Vendor</Th>
                      <Th style={{ width: 110 }}>Medicines</Th>
                      <Th style={{ width: 130 }}>Order Date</Th>
                      <Th style={{ width: 110 }}>Status</Th>
                      <Th>Approved By</Th>
                      <Th>Rejected By</Th>
                      <Th style={{ textAlign: "center", width: 60 }}>Action</Th>
                    </tr>
                  </Thead>
                  <tbody>
                    {poList.map((po, idx) => {
                      const items = safeItems(po.items)
                      return (
                        <Trow key={po.po_number || idx}>
                          <Td style={{ color: "#64748b", fontSize: ".75rem", fontWeight: 600 }}>
                            {(page - 1) * pageSize + idx + 1}
                          </Td>
                          <Td>
                            <Pill>{po.po_number}</Pill>
                          </Td>
                          <Td>
                            <div style={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
                              {String(po.vendor_name || po.vendor_id || "—").toUpperCase()}
                            </div>
                            {po.vendor_email && (
                              <div style={{ fontSize: ".7rem", color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                                <span>✉️</span> {po.vendor_email}
                              </div>
                            )}
                          </Td>

                          {/* Item count badge */}
                          <Td>
                            <span style={{
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              padding: "3px 9px",
                              borderRadius: 12,
                              fontSize: ".72rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              💊 {items.length} item{items.length !== 1 ? "s" : ""}
                            </span>
                          </Td>

                          <Td style={{ whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 600, color: "#334155" }}>{fmtD(po.created_date)}</span>
                              <span style={{ fontSize: ".7rem", color: "#94a3b8" }}>{fmtT(po.created_date)}</span>
                            </div>
                          </Td>

                          <Td>
                            <Badge $s={po.status}>{po.status}</Badge>
                          </Td>

                          {/* Approved by */}
                          <Td style={{ fontSize: ".78rem" }}>
                            {po.status === "Approved" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: 4 }}>
                                  <span>✔</span> {po.approved_by_name || po.approved_by || "—"}
                                </span>
                                <span style={{ color: "#94a3b8", fontSize: ".7rem" }}>
                                  {fmtD(po.approved_date)} {fmtT(po.approved_date)}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: "#9ca3af", fontSize: ".75rem" }}>—</span>
                            )}
                          </Td>

                          {/* Rejected by */}
                          <Td style={{ fontSize: ".78rem" }}>
                            {po.status === "Rejected" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                                  <span>✕</span> {po.rejected_by_name || po.rejected_by || "—"}
                                </span>
                                <span style={{ color: "#94a3b8", fontSize: ".7rem" }}>
                                  {fmtD(po.rejected_date)} {fmtT(po.rejected_date)}
                                </span>
                                {po.rejected_reason && (
                                  <span
                                    title={po.rejected_reason}
                                    style={{
                                      fontSize: ".7rem",
                                      color: "#dc2626",
                                      background: "#fff1f2",
                                      border: "1px solid #fecaca",
                                      borderRadius: 4,
                                      padding: "2px 6px",
                                      maxWidth: 150,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block"
                                    }}
                                  >
                                    {po.rejected_reason}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#9ca3af", fontSize: ".75rem" }}>—</span>
                            )}
                          </Td>

                          {/* Actions — three-dot menu */}
                          <Td style={{ textAlign: "center", width: 60 }}>
                            <AW>
                              <DotB
                                type="button"
                                title="Actions"
                                onClick={e => handleMenuToggle(po.po_number, e)}
                              >
                                ⋮
                              </DotB>
                            </AW>
                          </Td>
                        </Trow>
                      )
                    })}
                  </tbody>
                </Tbl>
              )}
            </TblWrap>

            <InvPagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={totalCount}
              onPageChange={setPage}
            />
          </Card>
        )}
      </Body>

      {/* Edit-reason modal */}
      {showReason && (
        <EditReasonModal
          onConfirm={handleReasonConfirm}
          onClose={() => { setShowReason(false); setPendingSave(null) }}
        />
      )}

      {/* ══ ACTION DROPDOWN (Admission Style) ══ */}
      {openMenu !== null && (() => {
        const po = poList.find(p => p.po_number === openMenu)
        if (!po) return null
        const canEdit = po.status === "Draft" || po.status === "Verified"
        return (
          <DropMenu
            ref={menuRef}
            top={menuPos.top}
            bottom={menuPos.bottom}
            left={menuPos.left}
            placement={menuPos.placement}
            maxHeight={menuPos.maxHeight}
          >
            <DI onClick={() => { setViewPo(po); setOpenMenu(null) }}>
              <span style={{ fontSize: "1rem" }}>👁️</span> View Details
            </DI>
            {po.status === "Approved" ? (
              <DI $mail onClick={() => { setEmailPo(po); setOpenMenu(null) }}>
                <span style={{ fontSize: "1rem" }}>✉️</span> Send Mail
              </DI>
            ) : (
              <DI disabled title="Email is available only after PO is Approved">
                <span style={{ fontSize: "1rem" }}>🔒</span> Send Mail (Approval Required)
              </DI>
            )}
            {canEdit ? (
              <DI onClick={() => { handleEdit(po); setOpenMenu(null) }}>
                <span style={{ fontSize: "1rem" }}>✏️</span> Edit PO
              </DI>
            ) : (
              <DI disabled title={`Cannot edit ${po.status} PO`}>
                <span style={{ fontSize: "1rem" }}>🔒</span> Edit (Locked - {po.status})
              </DI>
            )}
          </DropMenu>
        )
      })()}

      {/* Send Email Modal */}
      {emailPo && (
        <SendEmailModal
          po={emailPo}
          vendors={vendors}
          onConfirm={handleEmailConfirm}
          onClose={() => setEmailPo(null)}
          loading={emailLoading}
        />
      )}

      {/* View items modal */}
      {viewPo && (
        <MOverlay onClick={() => setViewPo(null)}>
          <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 580, width: "95%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <MTitle style={{ marginBottom: 2 }}>💊 Medicine Items</MTitle>
                <MSub style={{ margin: 0 }}>
                  <Pill>{viewPo.po_number}</Pill>&nbsp;&nbsp;
                  <span style={{ color: C.muted, fontSize: ".78rem" }}>{viewPo.vendor_name || viewPo.vendor_id || "—"}</span>
                </MSub>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge $s={viewPo.status}>{viewPo.status}</Badge>
                <SecBtn style={{ padding: "4px 10px", fontSize: ".78rem" }} onClick={() => setViewPo(null)}>✕</SecBtn>
              </div>
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <LineTable style={{ fontSize: ".82rem" }}>
                <thead>
                  <tr>
                    <LTh style={{ position: "sticky", top: 0, zIndex: 1, width: 36 }}>#</LTh>
                    <LTh style={{ position: "sticky", top: 0, zIndex: 1 }}>Medicine Name</LTh>
                    <LTh style={{ position: "sticky", top: 0, zIndex: 1, width: 100, textAlign: "right" }}>Quantity</LTh>
                  </tr>
                </thead>
                <tbody>
                  {safeItems(viewPo.items).length === 0 ? (
                    <LTr>
                      <LTd colSpan={3} style={{ textAlign: "center", color: C.muted, padding: "20px" }}>No items found</LTd>
                    </LTr>
                  ) : safeItems(viewPo.items).map((it, i) => (
                    <LTr key={i}>
                      <LTd style={{ color: C.muted, fontSize: ".72rem", fontWeight: 700 }}>{i + 1}</LTd>
                      <LTd style={{ fontWeight: 600 }}>{it.medicine_name || "—"}</LTd>
                      <LTd style={{ fontWeight: 800, color: C.primary, textAlign: "right" }}>{it.quantity}</LTd>
                    </LTr>
                  ))}
                </tbody>
              </LineTable>
            </div>

            {/* Summary footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "8px 12px", background: C.pLight, borderRadius: 7, border: `1px solid ${C.pBorder}` }}>
              <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                Total Lines: {safeItems(viewPo.items).length}
              </span>
              <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                Total Qty: {safeItems(viewPo.items).reduce((s, it) => s + (Number(it.quantity) || 0), 0)}
              </span>
            </div>

            <BtnRow style={{ marginTop: 14 }}>
              <SecBtn onClick={() => setViewPo(null)}>Close</SecBtn>
            </BtnRow>
          </MBox>
        </MOverlay>
      )}
    </Wrap>
  );
}