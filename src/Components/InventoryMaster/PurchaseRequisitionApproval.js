import React, { useState, useEffect, useCallback } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`
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
  amber   : "#d97706",
  violet  : "#7c3aed",
  blue    : "#2563eb",
}

/* ── Status config ── */
const STATUS_META = {
  "Draft":                    { bg: "#fef9c3", color: "#92400e", border: "#fde68a", dot: "#d97706",  label: "Draft" },
  "Approved":                 { bg: "#dcfce7", color: "#166534", border: "#86efac", dot: "#16a34a",  label: "Approved" },
  "Rejected":                 { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", dot: "#dc2626",  label: "Rejected" },
  "Purchase Order Initiated": { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd", dot: "#7c3aed",  label: "PO Initiated" },
  "Purchased":                { bg: "#fef3c7", color: "#92400e", border: "#fde68a", dot: "#d97706",  label: "Purchased" },
  "Stock Restocked":          { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7", dot: "#059669",  label: "Restocked" },
}

/* ── Action config — what button is shown for each status ── */
const ACTION_CONFIG = {
  "Draft": [
    { action: "approve", label: "✔ Approve", color: "#16a34a", bg: "#dcfce7", border: "#86efac", hoverBg: "#bbf7d0", needsReason: false },
    { action: "reject",  label: "✕ Reject",  color: C.danger,  bg: "#fee2e2", border: "#fca5a5", hoverBg: "#fecaca", needsReason: true },
  ],
  "Approved": [
    { action: "po_initiated", label: "📋 Initiate PO", color: "#5b21b6", bg: "#ede9fe", border: "#c4b5fd", hoverBg: "#ddd6fe", needsReason: false },
  ],
  "Purchase Order Initiated": [
    { action: "purchased", label: "🛒 Mark Purchased", color: C.amber, bg: "#fef3c7", border: "#fde68a", hoverBg: "#fef08a", needsReason: false },
  ],
  "Purchased": [
    { action: "stock_restocked", label: "📦 Restock Stock", color: "#059669", bg: "#d1fae5", border: "#6ee7b7", hoverBg: "#a7f3d0", needsReason: false },
  ],
  "Rejected": [],
  "Stock Restocked": [],
}

/* ── Layout ── */
const Wrap   = styled.div`min-height:100vh;background:${C.bg};padding-bottom:48px;font-family:'DM Sans',system-ui,sans-serif;`
const Header = styled.div`
  background:linear-gradient(135deg,#1e3a5f 0%,#0f2744 100%);
  color:#fff;padding:18px 28px;
  box-shadow:0 4px 20px rgba(15,39,68,.3);
`
const HTitle = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSub   = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body   = styled.div`max-width:1000px;margin:0 auto;padding:22px 20px;`

/* ── Card ── */
const Card    = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:#1e3a5f;display:flex;align-items:center;justify-content:space-between;`

/* ── Form controls ── */
const FG  = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Sel = styled.select`
  padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;font-size:.875rem;color:${C.text};
  outline:none;width:100%;box-sizing:border-box;font-family:inherit;background:#fff;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const Inp = styled.input`
  padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;font-size:.875rem;color:${C.text};
  outline:none;width:100%;box-sizing:border-box;font-family:inherit;background:#fff;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const Textarea = styled.textarea`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};border-radius:7px;font-size:.875rem;
  color:${C.text};outline:none;width:100%;box-sizing:border-box;font-family:inherit;background:#fff;
  transition:border-color .14s;resize:vertical;min-height:70px;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`

/* ── Buttons ── */
const Btn     = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:7px;
  font-size:.78rem;font-weight:800;cursor:pointer;font-family:inherit;border:1.5px solid;
  transition:background .13s,transform .1s;
  &:active{transform:translateY(1px);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`
const PrimBtn = styled(Btn)`background:#1e3a5f;color:#fff;border-color:#1e3a5f;&:hover:not(:disabled){background:#0f2744;border-color:#0f2744;}`
const SecBtn  = styled(Btn)`background:#fff;color:#374151;border-color:${C.border};&:hover:not(:disabled){background:${C.faint};}`
const BtnRow  = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:20px;border-top:1px solid ${C.border};padding-top:16px;`

/* ── Badge / Pill ── */
const Badge = ({ $s, children }) => {
  const m = STATUS_META[$s] || STATUS_META["Draft"]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: ".68rem", fontWeight: 800,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label || children}
    </span>
  )
}
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── Table ── */
const TblWrap = styled.div`overflow-x:auto;`
const Tbl   = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th    = styled.th`background:${C.faint};color:${C.muted};padding:10px 12px;text-align:left;font-size:.69rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;`
const Td    = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:${C.text};vertical-align:middle;`
const Trow  = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Filter bar ── */
const FBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:13px 18px;background:${C.faint};border-bottom:1px solid ${C.border};`
const FItem = styled.div`display:flex;flex-direction:column;gap:3px;min-width:150px;`

/* ── Stats row ── */
const StatsRow = styled.div`display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;`
const StatCard = styled.div`
  flex:1;min-width:110px;background:${C.surface};border:1px solid ${C.border};border-radius:10px;
  padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,.05);border-top:3px solid ${p => p.$color || C.primary};
`
const StatNum = styled.div`font-size:1.5rem;font-weight:800;color:${p => p.$color || C.primary};line-height:1;`
const StatLbl = styled.div`font-size:.7rem;color:${C.muted};margin-top:4px;font-weight:600;`

/* ── Modal ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;max-width:500px;width:95%;box-shadow:0 20px 60px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}overflow:hidden;`
const MHead    = styled.div`background:linear-gradient(135deg,#1e3a5f,#0f2744);color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;`
const MBody    = styled.div`padding:22px 24px;`
const MTitle   = styled.h3`margin:0;font-size:1rem;font-weight:800;`

/* ── Spin ── */
const Spin = styled.span`display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;${css`animation:${spin} .6s linear infinite;`}`

/* ══════════════════════════════════════════════════════
   ACTION MODAL  (confirm + optional reason)
══════════════════════════════════════════════════════ */
const ActionModal = ({ pr, actionCfg, onConfirm, onClose, acting }) => {
  const [reason, setReason] = useState("")
  const [err,    setErr]    = useState("")

  const handleConfirm = () => {
    if (actionCfg.needsReason && !reason.trim()) {
      setErr("Reason is required")
      return
    }
    onConfirm(reason.trim())
  }

  const items = Array.isArray(pr.items) ? pr.items : []

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MHead>
          <MTitle>{actionCfg.label} — {pr.pr_number}</MTitle>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </MHead>
        <MBody>
          <div style={{ marginBottom: 14, background: C.faint, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Medicine Items</div>
            {items.length === 0 ? (
              <div style={{ color: C.muted, fontSize: ".82rem" }}>No items</div>
            ) : (
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {items.map((item, i) => (
                  <li key={i} style={{ fontSize: ".82rem", fontWeight: 600, color: C.text, marginBottom: 2 }}>{item.medicine_name}</li>
                ))}
              </ul>
            )}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: ".85rem", color: C.muted }}>
            Are you sure you want to <strong style={{ color: actionCfg.color }}>{actionCfg.label}</strong> this requisition?
          </p>

          {actionCfg.needsReason && (
            <FG style={{ marginBottom: 14 }}>
              <Lbl>Rejection Reason <span style={{ color: C.danger }}>*</span></Lbl>
              <Textarea
                $err={!!err}
                value={reason}
                onChange={e => { setReason(e.target.value); setErr("") }}
                placeholder="Provide a clear reason for rejection…"
              />
              {err && <span style={{ fontSize: ".68rem", color: C.danger }}>{err}</span>}
            </FG>
          )}

          <BtnRow>
            <SecBtn onClick={onClose} disabled={acting}>Cancel</SecBtn>
            <Btn
              style={{ background: actionCfg.bg, color: actionCfg.color, borderColor: actionCfg.border }}
              onClick={handleConfirm}
              disabled={acting}
            >
              {acting ? <><Spin /> Processing…</> : actionCfg.label}
            </Btn>
          </BtnRow>
        </MBody>
      </MBox>
    </MOverlay>
  )
}

/* ══════════════════════════════════════════════════════
   VIEW DETAIL MODAL
══════════════════════════════════════════════════════ */
const ViewModal = ({ pr, onClose }) => {
  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }
  const items = Array.isArray(pr.items) ? pr.items : []

  const AuditField = ({ label, value }) => (
    <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: ".85rem", fontWeight: 600, color: C.text, wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  )
  const Sec = ({ label }) => (
    <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: "#1e3a5f", margin: "14px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>{label}</div>
  )

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <MHead>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>{pr.pr_number}</div>
            <div style={{ fontSize: ".75rem", opacity: .82, marginTop: 2 }}>Created by {pr.created_by_name || pr.created_by || "—"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge $s={pr.status}>{pr.status}</Badge>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </MHead>
        <div style={{ padding: "20px 24px", maxHeight: "75vh", overflowY: "auto" }}>

          <Sec label="💊 Medicine Items" />
          {items.length === 0 ? (
            <div style={{ color: C.muted, fontSize: ".82rem", padding: "6px 0 12px" }}>No items</div>
          ) : (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
                <thead>
                  <tr>
                    <th style={{ background: C.faint, padding: "8px 12px", textAlign: "left", fontSize: ".68rem", fontWeight: 800, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, width: 40 }}>#</th>
                    <th style={{ background: C.faint, padding: "8px 12px", textAlign: "left", fontSize: ".68rem", fontWeight: 800, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Medicine Name</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? `1px solid #f1f5f9` : "none" }}>
                      <td style={{ padding: "8px 12px", color: C.muted, fontSize: ".72rem" }}>{idx + 1}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{item.medicine_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Approval */}
          {pr.approved_by && (
            <>
              <Sec label="✔ Approval" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Approved By"   value={pr.approved_by_name || pr.approved_by} />
                <AuditField label="Approved Date" value={fmtDT(pr.approved_date)} />
              </div>
            </>
          )}

          {/* Rejection */}
          {pr.rejected_by && (
            <>
              <Sec label="✕ Rejection" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Rejected By"   value={pr.rejected_by_name || pr.rejected_by} />
                <AuditField label="Rejected Date" value={fmtDT(pr.rejected_date)} />
              </div>
              <AuditField label="Reason" value={pr.rejected_reason} />
            </>
          )}

          {/* PO Initiated */}
          {pr.po_initiated_by && (
            <>
              <Sec label="📋 PO Initiated" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Initiated By"   value={pr.po_initiated_by_name || pr.po_initiated_by} />
                <AuditField label="Initiated Date" value={fmtDT(pr.po_initiated_date)} />
              </div>
            </>
          )}

          {/* Purchased */}
          {pr.purchased_by && (
            <>
              <Sec label="🛒 Purchased" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Purchased By"   value={pr.purchased_by_name || pr.purchased_by} />
                <AuditField label="Purchased Date" value={fmtDT(pr.purchased_date)} />
              </div>
            </>
          )}

          {/* Stock Restocked */}
          {pr.stock_restocked_by && (
            <>
              <Sec label="📦 Stock Restocked" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Restocked By"   value={pr.stock_restocked_by_name || pr.stock_restocked_by} />
                <AuditField label="Restocked Date" value={fmtDT(pr.stock_restocked_date)} />
              </div>
            </>
          )}

          {/* Edit audit */}
          {pr.edited_by && (
            <>
              <Sec label="✏️ Last Edit" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <AuditField label="Edited By"   value={pr.edited_by_name || pr.edited_by} />
                <AuditField label="Edited Date" value={fmtDT(pr.edited_date)} />
              </div>
              <AuditField label="Edit Reason" value={pr.edited_reason} />
            </>
          )}

          <Sec label="📅 Audit" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <AuditField label="Created By"   value={pr.created_by_name || pr.created_by} />
            <AuditField label="Created Date" value={fmtDT(pr.created_date)} />
          </div>

          <BtnRow style={{ marginTop: 14, border: "none", paddingTop: 10 }}>
            <SecBtn onClick={onClose}>Close</SecBtn>
          </BtnRow>
        </div>
      </MBox>
    </MOverlay>
  )
}

/* ══════════════════════════════════════════════════════
   ADMIN MAIN COMPONENT
══════════════════════════════════════════════════════ */
const ALL_STATUSES = ["Draft", "Approved", "Rejected", "Purchase Order Initiated", "Purchased", "Stock Restocked"]

export default function PurchaseRequisitionAdmin() {
  const [prList,      setPrList]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [acting,      setActing]      = useState(false)
  const [viewPr,      setViewPr]      = useState(null)
  const [actionModal, setActionModal] = useState(null)  // { pr, actionCfg }
  const [filterStatus, setFilterStatus] = useState("")
  const [filterSearch, setFilterSearch] = useState("")
  const [filterFrom,   setFilterFrom]   = useState("")
  const [filterTo,     setFilterTo]     = useState("")

  /* ── Fetch list ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append("status", filterStatus)
      if (filterFrom)   params.append("from_date", filterFrom)
      if (filterTo)     params.append("to_date", filterTo)
      const qs  = params.toString() ? `?${params}` : ""
      const r   = await apiRequest(`${HmsBaseUrl}purchase-requisition/${qs}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch {
      toast.error("Failed to load requisitions")
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterFrom, filterTo])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Perform action ── */
  const handleAction = async (reason) => {
    if (!actionModal) return
    const { pr, actionCfg } = actionModal
    setActing(true)
    try {
      const payload = { pr_number: pr.pr_number, action: actionCfg.action }
      if (actionCfg.needsReason) payload.rejected_reason = reason

      const r = await apiRequest(`${HmsBaseUrl}purchase-requisition-action/`, "POST", payload)
      if (r?.success) {
        toast.success(`${pr.pr_number} → ${r.data?.status || "updated"}`)
        setActionModal(null)
        fetchList()
        // Update viewPr if open
        if (viewPr && viewPr.pr_number === pr.pr_number && r.data) {
          setViewPr(r.data)
        }
      } else {
        const errMsg = r?.error
        toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : typeof errMsg === "string" ? errMsg : "Action failed")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setActing(false)
    }
  }

  /* ── Filter locally by search ── */
  const filtered = prList.filter(pr => {
    if (!filterSearch.trim()) return true
    const q = filterSearch.toLowerCase()
    const items = Array.isArray(pr.items) ? pr.items : []
    return (
      pr.pr_number?.toLowerCase().includes(q) ||
      items.some(i => i.medicine_name?.toLowerCase().includes(q))
    )
  })

  /* ── Stats ── */
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = prList.filter(p => p.status === s).length
    return acc
  }, {})

  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  /* ─────────────────────── RENDER ── */
  return (
    <Wrap>
      <Header>
        <HTitle>🏥 Purchase Requisition — Admin</HTitle>
        <HSub>Review, approve and track requisitions through fulfilment</HSub>
      </Header>

      <Body>
        {/* ── Stats ── */}
        <StatsRow>
          {[
            { key: "Draft",                    color: "#d97706",  icon: "📝" },
            { key: "Approved",                 color: "#16a34a",  icon: "✔" },
            { key: "Rejected",                 color: C.danger,   icon: "✕" },
            { key: "Purchase Order Initiated", color: C.violet,   icon: "📋" },
            { key: "Purchased",                color: C.amber,    icon: "🛒" },
            { key: "Stock Restocked",          color: "#059669",  icon: "📦" },
          ].map(s => (
            <StatCard key={s.key} $color={s.color}
              style={{ cursor: "pointer" }}
              onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key)}
            >
              <StatNum $color={s.color}>{counts[s.key] || 0}</StatNum>
              <StatLbl>{s.icon} {STATUS_META[s.key]?.label || s.key}</StatLbl>
            </StatCard>
          ))}
        </StatsRow>

        {/* ── Main table card ── */}
        <Card>
          <CardHead>
            <span>📄 All Requisitions</span>
            <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".72rem", padding: "1px 8px", borderRadius: 12, fontWeight: 600 }}>
              {filtered.length} {filtered.length !== prList.length ? `/ ${prList.length}` : ""}
            </span>
          </CardHead>

          {/* Filter bar */}
          <FBar>
            <FItem style={{ flex: 2, minWidth: 200 }}>
              <Lbl>Search</Lbl>
              <Inp
                placeholder="PR number or medicine name…"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </FItem>
            <FItem>
              <Lbl>Status</Lbl>
              <Sel value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
              </Sel>
            </FItem>
            <FItem>
              <Lbl>From Date</Lbl>
              <Inp type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </FItem>
            <FItem>
              <Lbl>To Date</Lbl>
              <Inp type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </FItem>
            <SecBtn onClick={fetchList} style={{ padding: "9px 16px", alignSelf: "flex-end" }}>🔄 Refresh</SecBtn>
            <SecBtn
              onClick={() => { setFilterStatus(""); setFilterSearch(""); setFilterFrom(""); setFilterTo("") }}
              style={{ padding: "9px 16px", alignSelf: "flex-end" }}
            >
              ✕ Clear
            </SecBtn>
          </FBar>

          <TblWrap>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: ".85rem" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: ".85rem" }}>📭 No requisitions found</div>
            ) : (
              <Tbl>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>PR No</Th>
                    <Th>Medicines</Th>
                    <Th>Status</Th>
                    <Th>Requested By</Th>
                    <Th>Created</Th>
                    <Th style={{ textAlign: "center", minWidth: 200 }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pr, idx) => {
                    const items      = Array.isArray(pr.items) ? pr.items : []
                    const firstItem  = items[0]?.medicine_name || "—"
                    const more       = items.length > 1 ? ` +${items.length - 1}` : ""
                    const actionList = ACTION_CONFIG[pr.status] || []

                    return (
                      <Trow key={pr.pr_number}>
                        <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                        <Td><Pill>{pr.pr_number}</Pill></Td>
                        <Td style={{ maxWidth: 200 }}>
                          <div style={{ fontWeight: 600, fontSize: ".82rem" }}>{firstItem}</div>
                          {more && <div style={{ color: C.muted, fontSize: ".72rem" }}>{more} more</div>}
                        </Td>
                        <Td><Badge $s={pr.status}>{pr.status}</Badge></Td>
                        <Td style={{ fontSize: ".78rem" }}>{pr.created_by_name || pr.created_by || "—"}</Td>
                        <Td style={{ fontSize: ".78rem" }}>{fmtDT(pr.created_date)}</Td>
                        <Td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <SecBtn
                            style={{ padding: "5px 10px", fontSize: ".72rem", marginRight: 4 }}
                            onClick={() => setViewPr(pr)}
                          >
                            👁 View
                          </SecBtn>
                          {actionList.map(actionCfg => (
                            <Btn
                              key={actionCfg.action}
                              style={{
                                padding: "5px 10px",
                                fontSize: ".72rem",
                                marginRight: 4,
                                background: actionCfg.bg,
                                color: actionCfg.color,
                                borderColor: actionCfg.border,
                              }}
                              onClick={() => setActionModal({ pr, actionCfg })}
                            >
                              {actionCfg.label}
                            </Btn>
                          ))}
                          {actionList.length === 0 && pr.status !== "Draft" && (
                            <span style={{ fontSize: ".72rem", color: C.muted }}>—</span>
                          )}
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

      {/* View modal */}
      {viewPr && <ViewModal pr={viewPr} onClose={() => setViewPr(null)} />}

      {/* Action confirm modal */}
      {actionModal && (
        <ActionModal
          pr={actionModal.pr}
          actionCfg={actionModal.actionCfg}
          acting={acting}
          onClose={() => setActionModal(null)}
          onConfirm={handleAction}
        />
      )}
    </Wrap>
  )
}