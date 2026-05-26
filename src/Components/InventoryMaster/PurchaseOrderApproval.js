import React, { useState, useEffect, useCallback } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}`
const spin      = keyframes`to{transform:rotate(360deg)}`

/* ── Tokens (teal medical) ── */
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
const Body   = styled.div`max-width:1300px;margin:0 auto;padding:22px 20px;`

/* ── Stats ── */
const Stats = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;@media(max-width:680px){grid-template-columns:1fr 1fr;}`
const Stat  = styled.div`
  background:${C.surface};border-radius:10px;padding:16px 18px;
  border-left:4px solid ${p=>p.$c||C.primary};
  box-shadow:0 1px 6px rgba(0,0,0,.06);
`
const SNum = styled.div`font-size:1.8rem;font-weight:900;color:${p=>p.$c||C.primary};line-height:1;`
const SLbl = styled.div`font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${C.muted};margin-top:5px;`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.06);${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`

/* ── Filter bar ── */
const FBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:13px 18px;background:${C.faint};border-bottom:1px solid ${C.border};`
const FG   = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl  = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp  = styled.input`padding:9px 12px;border:1.5px solid ${p=>p.$err?C.danger:C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;font-family:inherit;width:100%;box-sizing:border-box;transition:border-color .13s;&:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}`
const Sel  = styled.select`padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;background:#fff;font-family:inherit;width:100%;box-sizing:border-box;transition:border-color .13s;&:focus{border-color:${C.primary};}`
const Txta = styled.textarea`padding:9px 12px;border:1.5px solid ${p=>p.$err?C.danger:C.border};border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;box-sizing:border-box;resize:vertical;min-height:88px;font-family:inherit;transition:border-color .13s;&:focus{border-color:${C.danger};box-shadow:0 0 0 3px rgba(220,38,38,.1);}`
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
  background:${p=>p.$s==="Approved"?"#dcfce7":p.$s==="Rejected"?"#fee2e2":p.$s==="Verified"?"#dbeafe":"#fef9c3"};
  color:${p=>p.$s==="Approved"?"#166534":p.$s==="Rejected"?"#991b1b":p.$s==="Verified"?"#1d4ed8":"#92400e"};
  border:1px solid ${p=>p.$s==="Approved"?"#86efac":p.$s==="Rejected"?"#fca5a5":p.$s==="Verified"?"#93c5fd":"#fde68a"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;
    background:${p=>p.$s==="Approved"?"#16a34a":p.$s==="Rejected"?"#dc2626":p.$s==="Verified"?"#2563eb":"#d97706"};}
`
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── Action buttons ── */
const Btn     = styled.button`display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:6px;font-size:.75rem;font-weight:800;cursor:pointer;font-family:inherit;transition:background .13s;&:disabled{opacity:.4;cursor:not-allowed;}`
const ApprBtn = styled(Btn)`background:${C.sLight};color:${C.success};border:1px solid #86efac;&:hover:not(:disabled){background:#bbf7d0;}`
const RejBtn  = styled(Btn)`background:${C.dLight};color:${C.danger};border:1px solid #fca5a5;&:hover:not(:disabled){background:#fecaca;}`
const ViewBtn = styled(Btn)`background:${C.faint};color:${C.muted};border:1px solid ${C.border};&:hover:not(:disabled){background:#eef2f7;}`
const PrimBtn = styled(Btn)`background:${C.primary};color:#fff;border:none;padding:9px 20px;&:hover:not(:disabled){background:${C.pDark};}`
const SecBtn  = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};padding:8px 18px;&:hover:not(:disabled){background:${C.faint};}`
const RefBtn  = styled(Btn)`background:${C.primary};color:#fff;border:none;padding:8px 16px;font-size:.82rem;&:hover:not(:disabled){background:${C.pDark};}`

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
  background:${p=>p.$danger?C.danger:C.primary};color:#fff;
  cursor:pointer;font-size:.85rem;font-weight:800;font-family:inherit;
  display:inline-flex;align-items:center;gap:6px;
  &:disabled{opacity:.55;cursor:not-allowed;}
`

/* ── Detail drawer ── */
const DOverlay = styled(MOverlay)``
const DBox = styled.div`
  background:#fff;border-radius:12px;max-width:680px;width:90%;
  max-height:92vh;overflow-y:auto;
  box-shadow:0 24px 64px rgba(0,0,0,.22);
  ${css`animation:${fadeSlide} .18s ease forwards;`}
`
const DHead    = styled.div`background:linear-gradient(135deg,${C.primary},${C.pDark});color:#fff;padding:16px 22px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;`
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
   MODALS
════════════════════════════════════════════════════ */
const ApproveModal = ({ po, onConfirm, onClose, loading }) => (
  <MOverlay onClick={onClose}>
    <MBox onClick={e => e.stopPropagation()}>
      <MTitle>✔ Approve Purchase Order</MTitle>
      <MSub>
        Approve <strong>{po.po_number}</strong>?<br />
        Vendor: <strong>{po.vendor_name || po.vendor_id}</strong>&nbsp;|&nbsp;
        {(po.items || []).length} item{(po.items || []).length !== 1 ? "s" : ""}
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

  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState(() => new Date().toISOString().slice(0, 10))
  const [toDate,     setToDate]     = useState(() => new Date().toISOString().slice(0, 10))

  const [approvePo, setApprovePo] = useState(null)
  const [rejectPo,  setRejectPo]  = useState(null)
  const [viewPo,    setViewPo]    = useState(null)

  /* ── fetch ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStat) params.append("status",    filterStat)
      if (fromDate)   params.append("from_date", fromDate)
      if (toDate)     params.append("to_date",   toDate)
      const qs = params.toString()
      const r  = await apiRequest(`${BASE}purchase-order/${qs ? "?" + qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPoList(Array.isArray(rows) ? rows : [])
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
        setApprovePo(null); fetchList()
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
        setRejectPo(null); fetchList()
      } else {
        const err = r?.error
        toast.error(typeof err === "string" ? err : JSON.stringify(err))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── filtered ── */
  const filtered = poList.filter(r => {
    const q = searchQ.toLowerCase()
    return !q ||
      (r.po_number   || "").toLowerCase().includes(q) ||
      (r.supplier    || "").toLowerCase().includes(q) ||
      (r.vendor_name || "").toLowerCase().includes(q)
  })

  /* ── stats (from full unfiltered list) ── */
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

  /* ─── RENDER ─── */
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
          <Stat $c={C.muted}>
            <SNum $c={C.muted}>{stats.total}</SNum>
            <SLbl>Total</SLbl>
          </Stat>
          <Stat $c={C.amber}>
            <SNum $c={C.amber}>{stats.pending}</SNum>
            <SLbl>Pending</SLbl>
          </Stat>
          <Stat $c={C.success}>
            <SNum $c={C.success}>{stats.approved}</SNum>
            <SLbl>Approved</SLbl>
          </Stat>
          <Stat $c={C.danger}>
            <SNum $c={C.danger}>{stats.rejected}</SNum>
            <SLbl>Rejected</SLbl>
          </Stat>
        </Stats>

        <Card>
          <CardHead>
            📋 Purchase Orders
            <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".7rem", padding: "1px 8px", borderRadius: 12, fontWeight: 700 }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardHead>

          <FBar>
            <FG style={{ flex: 1, minWidth: 200 }}>
              <Lbl>Search</Lbl>
              <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="PO No, Vendor, Supplier…" />
            </FG>
            <FG style={{ minWidth: 150 }}>
              <Lbl>Status</Lbl>
              <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                <option value="">All Status</option>
                {["Draft", "Approved", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
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
                <SpinEl style={{ borderTopColor: C.primary, borderColor: "rgba(13,148,136,.2)" }} /> Loading purchase orders…
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
                    return (
                      <Trow key={po.po_number}>
                        <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                        <Td><Pill>{po.po_number}</Pill></Td>
                        <Td style={{ fontWeight: 700 }}>{po.vendor_name || po.vendor_id || "—"}</Td>
                        <Td>
                          <span style={{ background: C.bLight, color: C.blue, padding: "2px 8px", borderRadius: 10, fontSize: ".68rem", fontWeight: 800 }}>
                            {(po.items || []).length} item{(po.items || []).length !== 1 ? "s" : ""}
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

                        {/* Actions */}
                        <Td>
                          <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "nowrap" }}>
                            <ViewBtn onClick={() => setViewPo(po)}>👁 View</ViewBtn>
                            {canAct && (
                              <>
                                <ApprBtn onClick={() => setApprovePo(po)}>✔ Approve</ApprBtn>
                                <RejBtn  onClick={() => setRejectPo(po)}>✕ Reject</RejBtn>
                              </>
                            )}
                            {!canAct && (
                              <span style={{ fontSize: ".72rem", color: C.muted }}>🔒 {po.status}</span>
                            )}
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

      {/* ── Detail Drawer ── */}
      {viewPo && (
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

              <DSec>💊 Medicine Items</DSec>
              <ITable>
                <thead>
                  <tr>
                    <ITh>#</ITh>
                    <ITh>Medicine Name</ITh>
                    <ITh>Quantity</ITh>
                  </tr>
                </thead>
                <tbody>
                  {(viewPo.items || []).length === 0 ? (
                    <tr><ITd colSpan={3} style={{ textAlign: "center", color: C.muted }}>No items</ITd></tr>
                  ) : (viewPo.items || []).map((it, i) => (
                    <tr key={i}>
                      <ITd style={{ color: C.muted, fontSize: ".7rem" }}>{i + 1}</ITd>
                      <ITd style={{ fontWeight: 600 }}>{it.medicine_name}</ITd>
                      <ITd style={{ fontWeight: 700, color: C.primary }}>{it.quantity}</ITd>
                    </tr>
                  ))}
                </tbody>
              </ITable>

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

              {/* Quick actions from drawer */}
              {(viewPo.status === "Draft" || viewPo.status === "Verified") && (
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <ApprBtn style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: ".82rem" }}
                    onClick={() => { setViewPo(null); setApprovePo(viewPo) }}>
                    ✔ Approve this PO
                  </ApprBtn>
                  <RejBtn style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: ".82rem" }}
                    onClick={() => { setViewPo(null); setRejectPo(viewPo) }}>
                    ✕ Reject this PO
                  </RejBtn>
                </div>
              )}
            </DBody>
          </DBox>
        </DOverlay>
      )}
    </Wrap>
  )
}