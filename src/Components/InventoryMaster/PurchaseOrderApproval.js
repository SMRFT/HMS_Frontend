import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"
import {  InvTopToolbar, getTodayDateString, InvSelect , InvPagination } from "./InventoryUIHelper"
import SendEmailModal from "./SendEmailModal"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}`
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
  dLight  : "#fee2e2",
  success : "#166534",
  sLight  : "#dcfce7",
  amber   : "#d97706",
  blue    : "#1d4ed8",
  bLight  : "#dbeafe",
  mail    : "#7c3aed",
  mailL   : "#ede9fe",
  mailB   : "#c4b5fd",
}

/* ── Helper: guarantee items is always a plain array ──
   Items are stored as a native MongoDB array — no JSON.parse required.
   This guard only catches edge-cases where the field is absent. */
const safeItems = (raw) => (Array.isArray(raw) ? raw : [])

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
const Body   = styled.div`max-width:1300px;margin:0 auto;padding:22px 20px;`

/* ── Stats ── */
const Stats = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;@media(max-width:680px){grid-template-columns:1fr 1fr;}`
const Stat  = styled.div`background:${C.surface};border-radius:10px;padding:16px 18px;border-left:4px solid ${p => p.$c || C.primary};box-shadow:0 1px 6px rgba(0,0,0,.06);`
const SNum  = styled.div`font-size:1.8rem;font-weight:900;color:${p => p.$c || C.primary};line-height:1;`
const SLbl  = styled.div`font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${C.muted};margin-top:5px;`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.06);${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`

const Txta = styled.textarea`padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;box-sizing:border-box;resize:vertical;min-height:88px;font-family:inherit;transition:border-color .13s;&:focus{border-color:${C.danger};box-shadow:0 0 0 3px rgba(220,38,38,.1);}`
const Err  = styled.div`font-size:.7rem;color:${C.danger};margin-top:4px;`

/* ── Table ── */
const TblWrap = styled.div`overflow-x:auto;`
const Tbl     = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th      = styled.th`background:${C.faint};color:${C.muted};padding:10px 12px;text-align:left;font-size:.69rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;`
const Td      = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:${C.text};vertical-align:middle;`
const Trow    = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Badges ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:800;
  background:${p => p.$s === "Approved" ? "#dcfce7" : p.$s === "Rejected" ? "#fee2e2" : p.$s === "Verified" ? "#dbeafe" : "#fef9c3"};
  color:${p => p.$s === "Approved" ? "#166534" : p.$s === "Rejected" ? "#991b1b" : p.$s === "Verified" ? "#1d4ed8" : "#92400e"};
  border:1px solid ${p => p.$s === "Approved" ? "#86efac" : p.$s === "Rejected" ? "#fca5a5" : p.$s === "Verified" ? "#93c5fd" : "#fde68a"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;
    background:${p => p.$s === "Approved" ? "#16a34a" : p.$s === "Rejected" ? "#dc2626" : p.$s === "Verified" ? "#2563eb" : "#d97706"};}
`
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── Buttons ── */
const Btn     = styled.button`display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:6px;font-size:.75rem;font-weight:800;cursor:pointer;font-family:inherit;transition:background .13s;&:disabled{opacity:.4;cursor:not-allowed;}`
const ApprBtn = styled(Btn)`background:${C.sLight};color:${C.success};border:1px solid #86efac;&:hover:not(:disabled){background:#bbf7d0;}`
const RejBtn  = styled(Btn)`background:${C.dLight};color:${C.danger};border:1px solid #fca5a5;&:hover:not(:disabled){background:#fecaca;}`
const MailBtn = styled(Btn)`background:${C.mailL};color:${C.mail};border:1px solid ${C.mailB};&:hover:not(:disabled){background:#ddd6fe;}`
const SecBtn  = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};padding:8px 18px;&:hover:not(:disabled){background:${C.faint};}`
const RefBtn  = styled(Btn)`background:${C.primary};color:#fff;border:none;padding:8px 16px;font-size:.82rem;&:hover:not(:disabled){background:${C.pDark};}`

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

const Thead = styled.thead`
  background: #f9fafb;
`;

/* ── Spinner ── */
const SpinEl = styled.span`display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;${css`animation:${spin} .65s linear infinite;`}`

/* ── Modals ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;padding:28px 32px;max-width:500px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const MTitle   = styled.h3`margin:0 0 7px;font-size:1rem;font-weight:800;color:${C.text};`
const MSub     = styled.p`margin:0 0 16px;font-size:.875rem;color:${C.muted};line-height:1.55;`
const MLbl     = styled.label`display:block;font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;`
const MBtnRow  = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:20px;`
const MConfB   = styled.button`
  padding:9px 22px;border-radius:7px;border:none;
  background:${p => p.$danger ? C.danger : p.$mail ? C.mail : C.primary};color:#fff;
  cursor:pointer;font-size:.85rem;font-weight:800;font-family:inherit;
  display:inline-flex;align-items:center;gap:6px;
  &:disabled{opacity:.55;cursor:not-allowed;}
`

/* ── Detail drawer ── */
const DOverlay = styled(MOverlay)``
const DBox     = styled.div`background:#fff;border-radius:12px;max-width:680px;width:90%;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const DHead    = styled.div`background:linear-gradient(135deg,${C.primary},${C.pDark});color:#fff;padding:16px 22px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;`
const DBody    = styled.div`padding:20px 24px;`
const DSec     = styled.div`font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${C.primary};margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid ${C.border};`
const DGrid    = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;@media(max-width:480px){grid-template-columns:1fr;}`
const DField   = styled.div`background:${C.faint};border-radius:7px;padding:10px 12px;border:1px solid ${C.border};`
const DLbl     = styled.div`font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:${C.muted};margin-bottom:3px;`
const DVal     = styled.div`font-size:.85rem;font-weight:600;color:${C.text};word-break:break-word;`

/* ── Items mini-table ── */
const ITable = styled.table`width:100%;border-collapse:collapse;font-size:.78rem;`
const ITh    = styled.th`background:${C.faint};color:${C.muted};padding:7px 9px;text-align:left;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid ${C.border};`
const ITd    = styled.td`padding:7px 9px;border-bottom:1px solid #f0f5f0;color:${C.text};`

/* ════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════ */

const ApproveModal = ({ po, onConfirm, onClose, loading }) => {
  const items = safeItems(po.items)
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✔ Approve Purchase Order</MTitle>
        <MSub>
          Approve <strong>{po.po_number}</strong>?<br />
          Vendor: <strong>{po.vendor_name || po.vendor_id}</strong>&nbsp;|&nbsp;
          {items.length} item{items.length !== 1 ? "s" : ""}
          <br />This will mark the PO as <strong>Approved</strong>.
        </MSub>
        <MBtnRow>
          <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
          <MConfB onClick={onConfirm} disabled={loading}>
            {loading ? <SpinEl /> : "✔ Confirm Approve"}
          </MConfB>
        </MBtnRow>
      </MBox>
    </MOverlay>
  )
}

const RejectModal = ({ po, onConfirm, onClose, loading }) => {
  const [reason,  setReason]  = useState("")
  const [touched, setTouched] = useState(false)
  const go = () => { setTouched(true); if (!reason.trim()) return; onConfirm(reason.trim()) }
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✕ Reject Purchase Order</MTitle>
        <MSub>Reject <strong>{po.po_number}</strong>? This cannot be undone.</MSub>
        <MLbl>Rejection Reason <span style={{ color: C.danger }}>*</span></MLbl>
        <Txta
          $err={touched && !reason.trim()}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="State the reason for rejection…"
        />
        {touched && !reason.trim() && <Err>Rejection reason is required.</Err>}
        <MBtnRow>
          <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
          <MConfB $danger onClick={go} disabled={loading}>
            {loading ? <SpinEl /> : "✕ Confirm Reject"}
          </MConfB>
        </MBtnRow>
      </MBox>
    </MOverlay>
  )
}



/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function PurchaseOrderApproval() {
  const [poList,        setPoList]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [emailLoading,  setEmailLoading]  = useState(false)

  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState(() => new Date().toISOString().slice(0, 10))
  const [toDate,     setToDate]     = useState(() => new Date().toISOString().slice(0, 10))

  const [approvePo, setApprovePo] = useState(null)
  const [rejectPo,  setRejectPo]  = useState(null)
  const [viewPo,    setViewPo]    = useState(null)
  const [emailPo,   setEmailPo]   = useState(null)
  const [openMenu,  setOpenMenu]  = useState(null)
  const [menuPos,   setMenuPos]   = useState({ top: 0, bottom: 0, left: 0, placement: "bottom", maxHeight: 280 })
  const menuRef = useRef(null)

  /* close menu on outside click, scroll, resize */
  useEffect(() => {
    const handleClickOutside = e => {
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
    const menuEstimatedHeight = 220

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

  /* ── fetch PO list with server-side pagination ── */
  const fetchList = useCallback(async (p = page, size = pageSize, q = searchQ, stat = filterStat, from = fromDate, to = toDate) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: p,
        page_size: size,
      })
      if (q && q.trim()) params.append("search", q.trim())
      if (stat) params.append("status",    stat)
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
    } catch { toast.error("Failed to load purchase orders") }
    finally  { setLoading(false) }
  }, [page, pageSize, searchQ, filterStat, fromDate, toDate])

  useEffect(() => {
    fetchList(page, pageSize, searchQ, filterStat, fromDate, toDate)
  }, [page, pageSize, searchQ, filterStat, fromDate, toDate, fetchList])

  /* ── approve ── */
  const handleApproveConfirm = async () => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${BASE}purchase-order-action/`, "POST", {
        po_number: approvePo.po_number,
        action:    "approve",
      })
      if (r?.success) {
        toast.success(`${approvePo.po_number} approved successfully`)
        setApprovePo(null)
        fetchList()
      } else {
        const err = r?.error
        toast.error(typeof err === "string" ? err : JSON.stringify(err))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── reject ── */
  const handleRejectConfirm = async reason => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${BASE}purchase-order-action/`, "POST", {
        po_number:       rejectPo.po_number,
        action:          "reject",
        rejected_reason: reason,
      })
      if (r?.success) {
        toast.success(`${rejectPo.po_number} rejected`)
        setRejectPo(null)
        fetchList()
      } else {
        const err = r?.error
        toast.error(typeof err === "string" ? err : JSON.stringify(err))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── send email ── */
  const handleEmailConfirm = async (toEmail) => {
    setEmailLoading(true)
    try {
      const r = await apiRequest(`${BASE}purchase-order-email/`, "POST", {
        po_number: emailPo.po_number,
        to_email:  toEmail,
      })
      if (r?.success) {
        toast.success(`PO ${emailPo.po_number} sent to ${r?.data?.sent_to || toEmail}`)
        setEmailPo(null)
      } else {
        const err = r?.error || r?.data?.error
        toast.error(typeof err === "string" ? err : "Failed to send email")
      }
    } catch { toast.error("Network error while sending email") }
    finally { setEmailLoading(false) }
  }

  /* ── stat counts ── */
  const stats = {
    total:    totalCount,
    pending:  poList.filter(r => r.status === "Draft" || r.status === "Verified").length,
    approved: poList.filter(r => r.status === "Approved").length,
    rejected: poList.filter(r => r.status === "Rejected").length,
  }

  const fmtDT = d => {
    try { return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—" }
    catch { return "—" }
  }

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Wrap>
      <Header>
        <div>
          <HTitle>🏢 PO Approval Dashboard</HTitle>
          <HSub>Review, approve and reject purchase orders</HSub>
        </div>
        <RefBtn onClick={() => fetchList(page, pageSize, searchQ, filterStat, fromDate, toDate)} disabled={loading}>
          {loading ? <SpinEl /> : "🔄"} Refresh
        </RefBtn>
      </Header>

      <Body>

        {/* ── Stats ── */}
        <Stats>
          <Stat $c={C.muted}><SNum $c={C.muted}>{stats.total}</SNum><SLbl>Total</SLbl></Stat>
          <Stat $c={C.amber}><SNum $c={C.amber}>{stats.pending}</SNum><SLbl>Pending (Page)</SLbl></Stat>
          <Stat $c={C.success}><SNum $c={C.success}>{stats.approved}</SNum><SLbl>Approved (Page)</SLbl></Stat>
          <Stat $c={C.danger}><SNum $c={C.danger}>{stats.rejected}</SNum><SLbl>Rejected (Page)</SLbl></Stat>
        </Stats>

        <Card>
          <CardHead>
            📋 Purchase Orders
            <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".7rem", padding: "1px 8px", borderRadius: 12, fontWeight: 700 }}>
              {totalCount} record{totalCount !== 1 ? "s" : ""}
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
            searchPlaceholder="Search PO No, Vendor, Supplier…"
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
              <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <SpinEl style={{ borderTopColor: C.primary, borderColor: "rgba(13,148,136,.2)" }} />
                Loading purchase orders…
              </div>
            ) : poList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem" }}>
                📭 No purchase orders for the selected filters
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
                    <Th>Approved / Rejected Info</Th>
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

                        {/* Item count */}
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

                        {/* Approved / Rejected info */}
                        <Td style={{ minWidth: 180 }}>
                          {po.status === "Approved" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: 4 }}>
                                <span>✔</span> {po.approved_by_name || po.approved_by || "—"}
                              </span>
                              <span style={{ color: "#94a3b8", fontSize: ".7rem" }}>
                                {fmtD(po.approved_date)} {fmtT(po.approved_date)}
                              </span>
                            </div>
                          )}
                          {po.status === "Rejected" && (
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
                                    maxWidth: 160,
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
                          )}
                          {(po.status === "Draft" || po.status === "Verified") && (
                            <span style={{ color: "#9ca3af", fontSize: ".75rem" }}>Pending Decision</span>
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
      </Body>

      {/* ══ ACTION DROPDOWN (Admission Style) ══ */}
      {openMenu !== null && (() => {
        const po = poList.find(p => p.po_number === openMenu)
        if (!po) return null
        const canAct = po.status === "Draft" || po.status === "Verified"
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
            {canAct ? (
              <>
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <DI $success onClick={() => { setApprovePo(po); setOpenMenu(null) }}>
                  <span style={{ fontSize: "1rem" }}>✔</span> Approve PO
                </DI>
                <DI danger onClick={() => { setRejectPo(po); setOpenMenu(null) }}>
                  <span style={{ fontSize: "1rem" }}>✕</span> Reject PO
                </DI>
              </>
            ) : (
              <DI disabled title={`PO is already ${po.status}`}>
                <span style={{ fontSize: "1rem" }}>🔒</span> {po.status}
              </DI>
            )}
          </DropMenu>
        )
      })()}

      {/* ── Approve Modal ── */}
      {approvePo && (
        <ApproveModal
          po={approvePo}
          onConfirm={handleApproveConfirm}
          onClose={() => setApprovePo(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Reject Modal ── */}
      {rejectPo && (
        <RejectModal
          po={rejectPo}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectPo(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Send Email Modal ── */}
      {emailPo && (
        <SendEmailModal
          po={emailPo}
          onConfirm={handleEmailConfirm}
          onClose={() => setEmailPo(null)}
          loading={emailLoading}
        />
      )}

      {/* ── Detail Drawer ── */}
      {viewPo && (() => {
        const items = safeItems(viewPo.items)
        return (
          <DOverlay onClick={() => setViewPo(null)}>
            <DBox onClick={e => e.stopPropagation()}>
              <DHead>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1rem" }}>{viewPo.po_number}</div>
                  <div style={{ fontSize: ".74rem", opacity: .82, marginTop: 2 }}>
                    {viewPo.vendor_name || viewPo.vendor_id}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Mail button in drawer header */}
                  <button
                    onClick={() => { setViewPo(null); setEmailPo(viewPo) }}
                    title="Send PO to vendor"
                    style={{
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.35)",
                      color: "#fff", borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                      fontSize: ".74rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "inherit"
                    }}
                  >
                    ✉️ Send Mail
                  </button>
                  <Badge $s={viewPo.status}>{viewPo.status}</Badge>
                  <button
                    onClick={() => setViewPo(null)}
                    style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >✕</button>
                </div>
              </DHead>

              <DBody>
                <DSec>📋 Order Details</DSec>
                <DGrid>
                  <DField><DLbl>PO Number</DLbl><DVal><Pill>{viewPo.po_number}</Pill></DVal></DField>
                  <DField><DLbl>Status</DLbl><DVal><Badge $s={viewPo.status}>{viewPo.status}</Badge></DVal></DField>
                  <DField><DLbl>Vendor</DLbl><DVal>{viewPo.vendor_name || viewPo.vendor_id || "—"}</DVal></DField>
                  <DField><DLbl>Order Date</DLbl><DVal>{fmtDT(viewPo.created_date)}</DVal></DField>
                </DGrid>

                {/* Medicine items — native array, no parsing */}
                <DSec>💊 Medicine Items ({items.length})</DSec>
                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px", color: C.muted, fontSize: ".82rem", background: C.faint, borderRadius: 7, border: `1px solid ${C.border}` }}>
                    No items found
                  </div>
                ) : (
                  <>
                    <ITable>
                      <thead>
                        <tr>
                          <ITh>#</ITh>
                          <ITh>Medicine Name</ITh>
                          <ITh style={{ textAlign: "right" }}>Quantity</ITh>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : C.faint }}>
                            <ITd style={{ color: C.muted, fontSize: ".7rem" }}>{i + 1}</ITd>
                            <ITd style={{ fontWeight: 600 }}>{it.medicine_name || "—"}</ITd>
                            <ITd style={{ fontWeight: 700, color: C.primary, textAlign: "right" }}>{it.quantity}</ITd>
                          </tr>
                        ))}
                      </tbody>
                    </ITable>

                    {/* Total summary */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 8, padding: "8px 12px", background: C.pLight, borderRadius: 7, border: `1px solid ${C.pBorder}` }}>
                      <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                        Lines: {items.length}
                      </span>
                      <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                        Total Qty: {items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}
                      </span>
                    </div>
                  </>
                )}

                {/* Approval info */}
                {viewPo.status === "Approved" && (
                  <>
                    <DSec>✔ Approval Info</DSec>
                    <DGrid>
                      <DField><DLbl>Approved By</DLbl><DVal style={{ color: C.success }}>{viewPo.approved_by_name || viewPo.approved_by || "—"}</DVal></DField>
                      <DField><DLbl>Approved Date</DLbl><DVal>{fmtDT(viewPo.approved_date)}</DVal></DField>
                    </DGrid>
                  </>
                )}

                {/* Rejection info */}
                {viewPo.status === "Rejected" && (
                  <>
                    <DSec>✕ Rejection Info</DSec>
                    <DGrid>
                      <DField><DLbl>Rejected By</DLbl><DVal style={{ color: C.danger }}>{viewPo.rejected_by_name || viewPo.rejected_by || "—"}</DVal></DField>
                      <DField><DLbl>Rejected Date</DLbl><DVal>{fmtDT(viewPo.rejected_date)}</DVal></DField>
                    </DGrid>
                    <DField style={{ marginBottom: 10 }}>
                      <DLbl>Rejection Reason</DLbl>
                      <DVal style={{ fontWeight: 400, color: C.danger }}>{viewPo.rejected_reason || "—"}</DVal>
                    </DField>
                  </>
                )}

                {/* Audit */}
                <DSec>📅 Audit</DSec>
                <DGrid>
                  <DField><DLbl>Created By</DLbl><DVal>{viewPo.created_by || "—"}</DVal></DField>
                  <DField><DLbl>Created Date</DLbl><DVal>{fmtD(viewPo.created_date)}</DVal></DField>
                  <DField><DLbl>Modified By</DLbl><DVal>{viewPo.lastmodified_by || "—"}</DVal></DField>
                  <DField><DLbl>Modified Date</DLbl><DVal>{fmtD(viewPo.lastmodified_date)}</DVal></DField>
                </DGrid>

                {/* Quick actions from drawer */}
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                  {/* Send Mail — always shown */}
                  <MailBtn
                    style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: ".82rem" }}
                    onClick={() => { setViewPo(null); setEmailPo(viewPo) }}
                  >
                    ✉️ Send PO to Vendor
                  </MailBtn>

                  {(viewPo.status === "Draft" || viewPo.status === "Verified") && (
                    <>
                      <ApprBtn
                        style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: ".82rem" }}
                        onClick={() => { setViewPo(null); setApprovePo(viewPo) }}
                      >
                        ✔ Approve
                      </ApprBtn>
                      <RejBtn
                        style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: ".82rem" }}
                        onClick={() => { setViewPo(null); setRejectPo(viewPo) }}
                      >
                        ✕ Reject
                      </RejBtn>
                    </>
                  )}
                </div>
              </DBody>
            </DBox>
          </DOverlay>
        )
      })()}
    </Wrap>
  )
}