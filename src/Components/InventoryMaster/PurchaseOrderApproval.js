import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}`
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

/* ── Filter bar ── */
const FBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:13px 18px;background:${C.faint};border-bottom:1px solid ${C.border};`
const FG   = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl  = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp  = styled.input`padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;font-family:inherit;width:100%;box-sizing:border-box;transition:border-color .13s;&:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}`
const Sel  = styled.select`padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;background:#fff;font-family:inherit;width:100%;box-sizing:border-box;transition:border-color .13s;&:focus{border-color:${C.primary};}`
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
const ViewBtn = styled(Btn)`background:${C.faint};color:${C.muted};border:1px solid ${C.border};&:hover:not(:disabled){background:#eef2f7;}`
const MailBtn = styled(Btn)`background:${C.mailL};color:${C.mail};border:1px solid ${C.mailB};&:hover:not(:disabled){background:#ddd6fe;}`
const SecBtn  = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};padding:8px 18px;&:hover:not(:disabled){background:${C.faint};}`
const RefBtn  = styled(Btn)`background:${C.primary};color:#fff;border:none;padding:8px 16px;font-size:.82rem;&:hover:not(:disabled){background:${C.pDark};}`

/* ── Three-dot action menu ── */
const MenuWrap = styled.div`position:relative;display:inline-block;`
const DotBtn   = styled.button`
  width:32px;height:32px;border-radius:7px;border:1.5px solid ${C.border};
  background:#fff;color:${C.muted};font-size:1.1rem;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;
  transition:background .13s,border-color .13s;
  &:hover{background:${C.faint};border-color:${C.primary};color:${C.primary};}
`
const MenuList = styled.ul`
  position:absolute;right:0;top:calc(100% + 4px);z-index:9999;
  min-width:170px;background:#fff;border:1.5px solid ${C.border};
  border-radius:9px;box-shadow:0 8px 28px rgba(0,0,0,.13);
  list-style:none;margin:0;padding:5px;
  ${css`animation:${fadeSlide} .14s ease;`}
`
const MenuItem = styled.li`
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;border-radius:6px;font-size:.8rem;font-weight:700;
  cursor:pointer;
  color:${p => p.$danger ? C.danger : p.$mail ? C.mail : p.$success ? C.success : C.text};
  transition:background .1s;
  &:hover{
    background:${p => p.$danger ? "#fff1f2" : p.$mail ? C.mailL : p.$success ? C.sLight : C.pLight};
    color:${p => p.$danger ? C.danger : p.$mail ? C.mail : p.$success ? C.success : C.primary};
  }
`

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

/* ── Send Email Modal ── */
const SendEmailModal = ({ po, onConfirm, onClose, loading }) => {
  const [toEmail, setToEmail] = useState(po.vendor_email || "")
  const [touched, setTouched] = useState(false)

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const go = () => {
    setTouched(true)
    if (!toEmail.trim() || !isValidEmail(toEmail.trim())) return
    onConfirm(toEmail.trim())
  }

  const items    = safeItems(po.items)
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, background: C.mailL, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
          }}>
            ✉️
          </div>
          <MTitle style={{ margin: 0 }}>Send PO to Vendor</MTitle>
        </div>

        {/* PO Summary */}
        <div style={{
          background: C.faint, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "10px 14px", marginBottom: 16, fontSize: ".82rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: C.primary, fontFamily: "monospace" }}>{po.po_number}</span>
            <Badge $s={po.status}>{po.status}</Badge>
          </div>
          <div style={{ color: C.muted, fontSize: ".78rem" }}>
            <strong style={{ color: C.text }}>{po.vendor_name || po.vendor_id}</strong>
            &nbsp;·&nbsp;{items.length} item{items.length !== 1 ? "s" : ""}
            &nbsp;·&nbsp;Total Qty: <strong>{totalQty}</strong>
          </div>
        </div>

        {/* Medicine items preview */}
        {items.length > 0 && (
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 7, overflow: "hidden", marginBottom: 16,
            maxHeight: 160, overflowY: "auto"
          }}>
            <ITable style={{ fontSize: ".76rem" }}>
              <thead>
                <tr>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1 }}>#</ITh>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1 }}>Medicine Name</ITh>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1, textAlign: "right" }}>Qty</ITh>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : C.faint }}>
                    <ITd style={{ color: C.muted, fontSize: ".7rem", fontWeight: 700 }}>{i + 1}</ITd>
                    <ITd style={{ fontWeight: 600 }}>{it.medicine_name || "—"}</ITd>
                    <ITd style={{ fontWeight: 700, color: C.primary, textAlign: "right" }}>{it.quantity}</ITd>
                  </tr>
                ))}
              </tbody>
            </ITable>
          </div>
        )}

        {/* Email field */}
        <div style={{ marginBottom: 4 }}>
          <MLbl>Recipient Email <span style={{ color: C.danger }}>*</span></MLbl>
          <Inp
            type="email"
            $err={touched && (!toEmail.trim() || !isValidEmail(toEmail.trim()))}
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            placeholder="vendor@example.com"
          />
          {touched && !toEmail.trim() && <Err>Email is required.</Err>}
          {touched && toEmail.trim() && !isValidEmail(toEmail.trim()) && (
            <Err>Enter a valid email address.</Err>
          )}
        </div>
        <div style={{ fontSize: ".72rem", color: C.muted, marginBottom: 16 }}>
          A styled HTML purchase order will be sent to this address.
        </div>

        <MBtnRow>
          <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
          <MConfB $mail onClick={go} disabled={loading} style={{ background: C.mail }}>
            {loading
              ? <><SpinEl /> Sending…</>
              : <><span>✉️</span> Send PO</>
            }
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

  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState(() => new Date().toISOString().slice(0, 10))
  const [toDate,     setToDate]     = useState(() => new Date().toISOString().slice(0, 10))

  const [approvePo, setApprovePo] = useState(null)
  const [rejectPo,  setRejectPo]  = useState(null)
  const [viewPo,    setViewPo]    = useState(null)
  const [emailPo,   setEmailPo]   = useState(null)   // ← new: PO selected for email
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  /* close menu on outside click */
  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  /* ── fetch PO list ──
     items arrives as a native array from MongoDB — safeItems() guards the edge case. */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStat) params.append("status",    filterStat)
      if (fromDate)   params.append("from_date", fromDate)
      if (toDate)     params.append("to_date",   toDate)
      const qs = params.toString()

      const r    = await apiRequest(`${BASE}purchase-order/${qs ? "?" + qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])

      // Guarantee items is always a plain array on each record
      const normalized = (Array.isArray(rows) ? rows : []).map(po => ({
        ...po,
        items: safeItems(po.items),
      }))

      setPoList(normalized)
    } catch { toast.error("Failed to load purchase orders") }
    finally  { setLoading(false) }
  }, [filterStat, fromDate, toDate])

  useEffect(() => { fetchList() }, [fetchList])

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

  /* ── client-side text search ── */
  const filtered = poList.filter(r => {
    const q = searchQ.toLowerCase()
    return !q ||
      (r.po_number   || "").toLowerCase().includes(q) ||
      (r.supplier    || "").toLowerCase().includes(q) ||
      (r.vendor_name || "").toLowerCase().includes(q)
  })

  /* ── stat counts ── */
  const stats = {
    total:    poList.length,
    pending:  poList.filter(r => r.status === "Draft" || r.status === "Verified").length,
    approved: poList.filter(r => r.status === "Approved").length,
    rejected: poList.filter(r => r.status === "Rejected").length,
  }

  const fmtDT = d => {
    try { return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—" }
    catch { return "—" }
  }
  const fmtD = d => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—" } catch { return "—" } }

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Wrap>
      <Header>
        <div>
          <HTitle>🏢 PO Approval Dashboard</HTitle>
          <HSub>Review, approve and reject purchase orders</HSub>
        </div>
        <RefBtn onClick={fetchList} disabled={loading}>
          {loading ? <SpinEl /> : "🔄"} Refresh
        </RefBtn>
      </Header>

      <Body>

        {/* ── Stats ── */}
        <Stats>
          <Stat $c={C.muted}><SNum $c={C.muted}>{stats.total}</SNum><SLbl>Total</SLbl></Stat>
          <Stat $c={C.amber}><SNum $c={C.amber}>{stats.pending}</SNum><SLbl>Pending</SLbl></Stat>
          <Stat $c={C.success}><SNum $c={C.success}>{stats.approved}</SNum><SLbl>Approved</SLbl></Stat>
          <Stat $c={C.danger}><SNum $c={C.danger}>{stats.rejected}</SNum><SLbl>Rejected</SLbl></Stat>
        </Stats>

        <Card>
          <CardHead>
            📋 Purchase Orders
            <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".7rem", padding: "1px 8px", borderRadius: 12, fontWeight: 700 }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardHead>

          {/* Filters */}
          <FBar>
            <FG style={{ flex: 1, minWidth: 200 }}>
              <Lbl>Search</Lbl>
              <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="PO No, Vendor, Supplier…" />
            </FG>
            <FG style={{ minWidth: 150 }}>
              <Lbl>Status</Lbl>
              <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                <option value="">All Status</option>
                {["Draft", "Verified", "Approved", "Rejected"].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </Sel>
            </FG>
            <FG>
              <Lbl>From Date</Lbl>
              <Inp type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: "auto" }} />
            </FG>
            <FG>
              <Lbl>To Date</Lbl>
              <Inp type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: "auto" }} />
            </FG>
            <RefBtn onClick={fetchList} disabled={loading} style={{ alignSelf: "flex-end" }}>
              🔍 Search
            </RefBtn>
          </FBar>

          <TblWrap>
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <SpinEl style={{ borderTopColor: C.primary, borderColor: "rgba(13,148,136,.2)" }} />
                Loading purchase orders…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: ".85rem" }}>
                📭 No purchase orders for the selected filters
              </div>
            ) : (
              <Tbl>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>PO No</Th>
                    <Th>Vendor</Th>
                    <Th>Items</Th>
                    <Th>Order Date</Th>
                    <Th>Status</Th>
                    <Th>Approved / Rejected Info</Th>
                    <Th style={{ textAlign: "center" }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((po, idx) => {
                    const canAct = po.status === "Draft" || po.status === "Verified"
                    const items  = safeItems(po.items)
                    return (
                      <Trow key={po.po_number}>
                        <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                        <Td><Pill>{po.po_number}</Pill></Td>
                        <Td style={{ fontWeight: 700 }}>{po.vendor_name || po.vendor_id || "—"}</Td>

                        {/* Item count — safeItems already applied above */}
                        <Td>
                          <span style={{ background: C.bLight, color: C.blue, padding: "2px 8px", borderRadius: 10, fontSize: ".68rem", fontWeight: 800 }}>
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </Td>

                        <Td style={{ fontSize: ".76rem", color: C.muted, whiteSpace: "nowrap" }}>{fmtDT(po.created_date)}</Td>
                        <Td><Badge $s={po.status}>{po.status}</Badge></Td>

                        {/* Approved / Rejected info */}
                        <Td style={{ minWidth: 180 }}>
                          {po.status === "Approved" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ background: C.sLight, color: C.success, padding: "2px 8px", borderRadius: 4, fontSize: ".7rem", fontWeight: 800 }}>
                                ✔ {po.approved_by_name || po.approved_by || "—"}
                              </span>
                              <span style={{ fontSize: ".67rem", color: C.muted }}>{fmtDT(po.approved_date)}</span>
                            </div>
                          )}
                          {po.status === "Rejected" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ background: C.dLight, color: C.danger, padding: "2px 8px", borderRadius: 4, fontSize: ".7rem", fontWeight: 800 }}>
                                ✕ {po.rejected_by_name || po.rejected_by || "—"}
                              </span>
                              <span style={{ fontSize: ".67rem", color: C.muted }}>{fmtDT(po.rejected_date)}</span>
                              {po.rejected_reason && (
                                <span
                                  title={po.rejected_reason}
                                  style={{ fontSize: ".7rem", color: C.danger, background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 6px", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
                                >
                                  {po.rejected_reason}
                                </span>
                              )}
                            </div>
                          )}
                          {canAct && <span style={{ color: "#d1d5db", fontSize: ".74rem" }}>—</span>}
                        </Td>

                        {/* Actions — three-dot menu */}
                        <Td>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <MenuWrap ref={openMenuId === po.po_number ? menuRef : null}>
                              <DotBtn
                                title="Actions"
                                onClick={() => setOpenMenuId(prev => prev === po.po_number ? null : po.po_number)}
                              >
                                ⋯
                              </DotBtn>
                              {openMenuId === po.po_number && (
                                <MenuList>
                                  <MenuItem onClick={() => { setViewPo(po); setOpenMenuId(null) }}>
                                    👁 View
                                  </MenuItem>
                                  <MenuItem $mail onClick={() => { setEmailPo(po); setOpenMenuId(null) }}>
                                    ✉️ Send Mail
                                  </MenuItem>
                                  {canAct ? (
                                    <>
                                      <MenuItem $success onClick={() => { setApprovePo(po); setOpenMenuId(null) }}>
                                        ✔ Approve
                                      </MenuItem>
                                      <MenuItem $danger onClick={() => { setRejectPo(po); setOpenMenuId(null) }}>
                                        ✕ Reject
                                      </MenuItem>
                                    </>
                                  ) : (
                                    <MenuItem style={{ opacity: 0.45, cursor: "not-allowed" }}>
                                      🔒 {po.status}
                                    </MenuItem>
                                  )}
                                </MenuList>
                              )}
                            </MenuWrap>
                          </div>
                        </Td>
                      </Trow>
                    )
                  })}
                </tbody>
              </Tbl>
            )}
          </TblWrap>
        </Card>
      </Body>

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