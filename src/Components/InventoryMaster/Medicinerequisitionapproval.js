import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`
const spin      = keyframes`to{transform:rotate(360deg)}`

/* ── Tokens — same as MedicineRequisition ── */
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
  success : "#16a34a",
  sLight  : "#dcfce7",
}

/* ── Layout ── */
const Wrap    = styled.div`min-height:100vh;background:${C.bg};padding-bottom:48px;font-family:'DM Sans',system-ui,sans-serif;`
const Header  = styled.div`
  background:linear-gradient(135deg,${C.primary} 0%,${C.pDark} 100%);
  color:#fff;padding:18px 28px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
  box-shadow:0 4px 20px rgba(13,148,136,.25);
`
const HTitle  = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSub    = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body    = styled.div`max-width:1200px;margin:0 auto;padding:22px 20px;`

/* ── Stats strip ── */
const StatsRow = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;@media(max-width:700px){grid-template-columns:repeat(2,1fr);}`
const StatCard = styled.div`background:#fff;border-radius:10px;padding:16px 18px;border-left:4px solid ${p=>p.$color||C.primary};box-shadow:0 1px 6px rgba(0,0,0,.06);`
const StatNum  = styled.div`font-size:1.7rem;font-weight:800;color:${p=>p.$color||C.primary};line-height:1;`
const StatLbl  = styled.div`font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${C.muted};margin-top:4px;`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`

/* ── Form controls ── */
const FG  = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp = styled.input`
  padding:9px 12px;border:1.5px solid ${C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const Sel = styled.select`
  padding:9px 12px;border:1.5px solid ${C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`

/* ── Buttons ── */
const Btn     = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:9px 22px;border:none;border-radius:7px;
  font-size:.85rem;font-weight:800;cursor:pointer;font-family:inherit;
  transition:background .13s,transform .1s;
  &:active{transform:translateY(1px);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`
const PrimBtn = styled(Btn)`background:${C.primary};color:#fff;&:hover:not(:disabled){background:${C.pDark};}`
const SecBtn  = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};&:hover:not(:disabled){background:${C.faint};}`
const BtnRow  = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Spinner ── */
const Spin = styled.span`
  display:inline-block;width:13px;height:13px;
  border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
  border-radius:50%;${css`animation:${spin} .6s linear infinite;`}
`

/* ── Three-dot menu ── */
const MenuWrap = styled.div`position:relative;display:inline-block;`
const DotBtn   = styled.button`
  width:32px;height:32px;border-radius:7px;border:1.5px solid ${C.border};
  background:#fff;color:${C.muted};font-size:1.1rem;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;
  transition:background .13s,border-color .13s;
  &:hover{background:${C.pLight};border-color:${C.primary};color:${C.primary};}
`
const MenuList = styled.ul`
  position:absolute;right:0;top:calc(100% + 4px);z-index:9999;
  min-width:155px;background:#fff;border:1.5px solid ${C.border};
  border-radius:9px;box-shadow:0 8px 28px rgba(0,0,0,.13);
  list-style:none;margin:0;padding:5px;
  ${css`animation:${fadeSlide} .14s ease;`}
`
const MenuItem = styled.li`
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;border-radius:6px;font-size:.8rem;font-weight:700;cursor:pointer;
  color:${p => p.$danger ? C.danger : p.$success ? C.success : C.text};
  transition:background .1s;
  &:hover{
    background:${p => p.$danger ? "#fff1f2" : p.$success ? C.sLight : C.pLight};
    color:${p => p.$danger ? C.danger : p.$success ? C.success : C.primary};
  }
`

/* ── Badge / Pill ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:800;
  background:${p=>p.$s==="Approved"?"#dcfce7":p.$s==="Rejected"?"#fee2e2":"#fef9c3"};
  color:${p=>p.$s==="Approved"?"#166534":p.$s==="Rejected"?"#991b1b":"#92400e"};
  border:1px solid ${p=>p.$s==="Approved"?"#86efac":p.$s==="Rejected"?"#fca5a5":"#fde68a"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;
    background:${p=>p.$s==="Approved"?"#16a34a":p.$s==="Rejected"?"#dc2626":"#d97706"};}
`
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── Table ── */
const TblWrap = styled.div`overflow-x:auto;`
const Tbl     = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th      = styled.th`background:${C.faint};color:${C.muted};padding:10px 12px;text-align:left;font-size:.69rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;`
const Td      = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:${C.text};vertical-align:middle;`
const Trow    = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Filter bar ── */
const FBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:13px 18px;background:${C.faint};border-bottom:1px solid ${C.border};`

/* ── Modal base ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;padding:28px 32px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const MTitle   = styled.h3`margin:0 0 7px;font-size:1rem;font-weight:800;color:${C.text};`
const MSub     = styled.p`margin:0 0 16px;font-size:.875rem;color:${C.muted};line-height:1.55;`
const ErrMsg   = styled.span`font-size:.68rem;color:${C.danger};margin-top:2px;`
const Txta     = styled.textarea`
  padding:9px 12px;border:1.5px solid ${p=>p.$err?C.danger:C.border};border-radius:7px;
  font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;resize:vertical;min-height:72px;font-family:inherit;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`

/* ── Detail view modal styled ── */
const DRow   = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;`
const DField = styled.div`background:${C.faint};border-radius:7px;padding:9px 12px;border:1px solid ${C.border};`
const DLbl   = styled.div`font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:${C.muted};margin-bottom:3px;`
const DVal   = styled.div`font-size:.85rem;font-weight:600;color:${C.text};word-break:break-word;`
const DSec   = styled.div`font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${C.primary};margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid ${C.border};`

/* ─── Sub-components ─── */

const RejectModal = ({ pr, onConfirm, onClose, loading }) => {
  const [reason,  setReason]  = useState("")
  const [touched, setTouched] = useState(false)
  const go = () => { setTouched(true); if (!reason.trim()) return; onConfirm(reason.trim()) }
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✕ Reject Requisition</MTitle>
        <MSub>Reject <strong>{pr.mr_number}</strong> — <strong>{pr.medicine_name}</strong>?<br />This action cannot be undone.</MSub>
        <FG style={{ marginBottom: 18 }}>
          <Lbl>Rejection Reason <span style={{ color: C.danger }}>*</span></Lbl>
          <Txta $err={touched && !reason.trim()} value={reason} onChange={e => setReason(e.target.value)} placeholder="State the reason for rejection…" />
          {touched && !reason.trim() && <ErrMsg>Rejection reason is required.</ErrMsg>}
        </FG>
        <BtnRow>
          <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
          <Btn style={{ background: C.danger, color: "#fff" }} onClick={go} disabled={loading}>
            {loading ? <Spin /> : "✕ Confirm Reject"}
          </Btn>
        </BtnRow>
      </MBox>
    </MOverlay>
  )
}

const ApproveModal = ({ pr, onConfirm, onClose, loading }) => (
  <MOverlay onClick={onClose}>
    <MBox onClick={e => e.stopPropagation()}>
      <MTitle>✔ Approve Requisition</MTitle>
      <MSub>Approve <strong>{pr.mr_number}</strong> — <strong>{pr.medicine_name}</strong>?<br />This will mark the requisition as Approved.</MSub>
      <BtnRow>
        <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
        <PrimBtn onClick={onConfirm} disabled={loading}>
          {loading ? <Spin /> : "✔ Confirm Approve"}
        </PrimBtn>
      </BtnRow>
    </MBox>
  </MOverlay>
)

const ViewModal = ({ pr, onClose, fmtDT }) => (
  <MOverlay onClick={onClose}>
    <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: "95%", padding: "0", overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg,${C.primary},${C.pDark})`, color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>{pr.mr_number}</div>
          <div style={{ fontSize: ".75rem", opacity: .82, marginTop: 2 }}>{pr.medicine_name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge $s={pr.status}>{pr.status}</Badge>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>
      <div style={{ padding: "20px 22px", maxHeight: "75vh", overflowY: "auto" }}>
        <DSec>📋 Requisition Details</DSec>
        <DRow>
          <DField><DLbl>MR Number</DLbl><DVal><Pill>{pr.mr_number}</Pill></DVal></DField>
          <DField><DLbl>Status</DLbl><DVal><Badge $s={pr.status}>{pr.status}</Badge></DVal></DField>
        </DRow>
        <DRow>
          <DField style={{ gridColumn: "1/-1" }}><DLbl>Medicine Name</DLbl><DVal>{pr.medicine_name || "—"}</DVal></DField>
        </DRow>
        <DRow>
          <DField style={{ gridColumn: "1/-1" }}><DLbl>Chemical Composition</DLbl><DVal>{pr.chemical_composition || "—"}</DVal></DField>
        </DRow>
        <DRow>
          <DField><DLbl>Consultant Name</DLbl><DVal>{pr.consultant_name || "—"}</DVal></DField>
          <DField><DLbl>Request Date</DLbl><DVal>{fmtDT(pr.request_date)}</DVal></DField>
        </DRow>
        {pr.remarks && (
          <DRow>
            <DField style={{ gridColumn: "1/-1" }}><DLbl>Remarks</DLbl><DVal style={{ fontWeight: 400, color: C.muted }}>{pr.remarks}</DVal></DField>
          </DRow>
        )}
        {pr.status === "Approved" && (
          <>
            <DSec>✔ Approval Info</DSec>
            <DRow>
              <DField><DLbl>Approved By</DLbl><DVal style={{ color: C.success }}>{pr.approved_by || "—"}</DVal></DField>
              <DField><DLbl>Approved Date</DLbl><DVal>{fmtDT(pr.approved_date)}</DVal></DField>
            </DRow>
          </>
        )}
        {pr.status === "Rejected" && (
          <>
            <DSec>✕ Rejection Info</DSec>
            <DRow>
              <DField><DLbl>Rejected By</DLbl><DVal style={{ color: C.danger }}>{pr.rejected_by || "—"}</DVal></DField>
              <DField><DLbl>Rejected Date</DLbl><DVal>{fmtDT(pr.rejected_date)}</DVal></DField>
            </DRow>
            <DRow>
              <DField style={{ gridColumn: "1/-1" }}><DLbl>Rejection Reason</DLbl><DVal style={{ color: C.danger, fontWeight: 400 }}>{pr.rejected_reason || "—"}</DVal></DField>
            </DRow>
          </>
        )}
        {pr.edited_by && (
          <>
            <DSec>✏️ Last Edit</DSec>
            <DRow>
              <DField><DLbl>Edited By</DLbl><DVal>{pr.edited_by}</DVal></DField>
              <DField><DLbl>Edited Date</DLbl><DVal>{fmtDT(pr.edited_date)}</DVal></DField>
            </DRow>
            <DRow>
              <DField style={{ gridColumn: "1/-1" }}><DLbl>Edit Reason</DLbl><DVal style={{ fontWeight: 400, color: C.muted }}>{pr.edited_reason || "—"}</DVal></DField>
            </DRow>
          </>
        )}
        <DSec>📅 Audit Trail</DSec>
        <DRow>
          <DField><DLbl>Created By</DLbl><DVal>{pr.created_by || "—"}</DVal></DField>
          <DField><DLbl>Created Date</DLbl><DVal>{fmtDT(pr.created_date)}</DVal></DField>
        </DRow>
        <DRow>
          <DField><DLbl>Modified By</DLbl><DVal>{pr.lastmodified_by || "—"}</DVal></DField>
          <DField><DLbl>Modified Date</DLbl><DVal>{fmtDT(pr.lastmodified_date)}</DVal></DField>
        </DRow>
        <BtnRow style={{ marginTop: 14 }}>
          <SecBtn onClick={onClose}>Close</SecBtn>
        </BtnRow>
      </div>
    </MBox>
  </MOverlay>
)

/* ── Today's date helper ── */
const todayStr = () => new Date().toISOString().slice(0, 10)   // "YYYY-MM-DD"

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const MedicineRequisitionApproval = () => {
  const [prList,        setPrList]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  /* Filters — default from/to = today */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("Draft")
  const [fromDate,   setFromDate]   = useState(todayStr)
  const [toDate,     setToDate]     = useState(todayStr)

  /* Modals */
  const [approvePr, setApprovePr] = useState(null)
  const [rejectPr,  setRejectPr]  = useState(null)
  const [viewPr,    setViewPr]    = useState(null)

  /* Three-dot menu */
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  /* ── Fetch — called whenever filters change ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStat) params.append("status",    filterStat)
      if (fromDate)   params.append("from_date", fromDate)
      if (toDate)     params.append("to_date",   toDate)
      const qs = params.toString()
      const r  = await apiRequest(`${BASE}medicine-requisition/${qs ? "?" + qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch { toast.error("Failed to load requisitions") }
    finally { setLoading(false) }
  }, [filterStat, fromDate, toDate])

  /* Auto-fetch whenever date/status filter changes */
  useEffect(() => { fetchList() }, [fetchList])

  /* ── Approve ── */
  const handleApproveConfirm = async () => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${BASE}medicine-requisition-action/`, "POST", {
        mr_number: approvePr.mr_number,
        action:    "approve",
      })
      if (r?.success) {
        toast.success(`${approvePr.mr_number} approved successfully`)
        setApprovePr(null); fetchList()
      } else {
        toast.error(typeof r?.error === "string" ? r.error : JSON.stringify(r?.error))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── Reject ── */
  const handleRejectConfirm = async reason => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${BASE}medicine-requisition-action/`, "POST", {
        mr_number:       rejectPr.mr_number,
        action:          "reject",
        rejected_reason: reason,
      })
      if (r?.success) {
        toast.success(`${rejectPr.mr_number} rejected`)
        setRejectPr(null); fetchList()
      } else {
        toast.error(typeof r?.error === "string" ? r.error : JSON.stringify(r?.error))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── Client-side text search ── */
  const filtered = prList.filter(r => {
    const q = searchQ.toLowerCase()
    return !q ||
      (r.mr_number       || "").toLowerCase().includes(q) ||
      (r.medicine_name   || "").toLowerCase().includes(q) ||
      (r.consultant_name || "").toLowerCase().includes(q)
  })

  /* ── Stats ── */
  const stats = {
    total:    prList.length,
    draft:    prList.filter(r => r.status === "Draft").length,
    approved: prList.filter(r => r.status === "Approved").length,
    rejected: prList.filter(r => r.status === "Rejected").length,
  }

  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  /* ─────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <div>
          <HTitle>🏥 MR Approval Dashboard</HTitle>
          <HSub>Review, approve and reject medicine requisitions</HSub>
        </div>
        <PrimBtn onClick={fetchList} disabled={loading} style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#fff" }}>
          {loading ? <Spin /> : "🔄"} Refresh
        </PrimBtn>
      </Header>

      <Body>
        {/* Stats */}
        <StatsRow>
          <StatCard $color="#6b7280"><StatNum $color="#6b7280">{stats.total}</StatNum><StatLbl>Total</StatLbl></StatCard>
          <StatCard $color="#ca8a04"><StatNum $color="#ca8a04">{stats.draft}</StatNum><StatLbl>Pending</StatLbl></StatCard>
          <StatCard $color={C.success}><StatNum $color={C.success}>{stats.approved}</StatNum><StatLbl>Approved</StatLbl></StatCard>
          <StatCard $color={C.danger}><StatNum $color={C.danger}>{stats.rejected}</StatNum><StatLbl>Rejected</StatLbl></StatCard>
        </StatsRow>

        {/* Main card */}
        <Card>
          <CardHead>
            📋 Requisition Records
            <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".72rem", padding: "1px 8px", borderRadius: 12, fontWeight: 600 }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardHead>

          {/* Filters */}
          <FBar>
            <FG style={{ flex: 1, minWidth: 200, margin: 0 }}>
              <Lbl>Search</Lbl>
              <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="MR No, Medicine, Consultant…" />
            </FG>
            <FG style={{ minWidth: 150, margin: 0 }}>
              <Lbl>Status</Lbl>
              <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                <option value="">All Status</option>
                {["Draft", "Approved", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </FG>
            <FG style={{ margin: 0 }}>
              <Lbl>From Date</Lbl>
              <Inp type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </FG>
            <FG style={{ margin: 0 }}>
              <Lbl>To Date</Lbl>
              <Inp type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </FG>
            <PrimBtn onClick={fetchList} disabled={loading} style={{ alignSelf: "flex-end" }}>
              {loading ? <Spin /> : "🔍"} Search
            </PrimBtn>
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
                    <Th>MR No</Th>
                    <Th>Medicine</Th>
                    <Th>Composition</Th>
                    <Th>Consultant</Th>
                    <Th>Req Date</Th>
                    <Th>Status</Th>
                    <Th>Approved / Rejected Info</Th>
                    <Th style={{ textAlign: "center" }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const canAct = r.status === "Draft"
                    return (
                      <Trow key={r.mr_number}>
                        <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                        <Td><Pill>{r.mr_number}</Pill></Td>
                        <Td style={{ fontWeight: 700, maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.medicine_name}>{r.medicine_name}</Td>
                        <Td style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.muted, fontSize: ".78rem" }} title={r.chemical_composition}>{r.chemical_composition || "—"}</Td>
                        <Td style={{ whiteSpace: "nowrap" }}>{r.consultant_name || "—"}</Td>
                        <Td style={{ whiteSpace: "nowrap", fontSize: ".78rem" }}>{fmtDT(r.request_date)}</Td>
                        <Td><Badge $s={r.status}>{r.status}</Badge></Td>

                        {/* Approved / Rejected info */}
                        <Td style={{ minWidth: 170 }}>
                          {r.status === "Approved" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ background: C.sLight, color: "#166534", padding: "2px 8px", borderRadius: 4, fontSize: ".7rem", fontWeight: 700 }}>✔ {r.approved_by || "—"}</span>
                              <span style={{ fontSize: ".68rem", color: C.muted }}>{fmtDT(r.approved_date)}</span>
                            </div>
                          )}
                          {r.status === "Rejected" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: 4, fontSize: ".7rem", fontWeight: 700 }}>✕ {r.rejected_by || "—"}</span>
                              <span style={{ fontSize: ".68rem", color: C.muted }}>{fmtDT(r.rejected_date)}</span>
                              {r.rejected_reason && (
                                <span title={r.rejected_reason} style={{ fontSize: ".7rem", color: "#991b1b", background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 6px", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                  {r.rejected_reason}
                                </span>
                              )}
                            </div>
                          )}
                          {canAct && <span style={{ color: "#d1d5db", fontSize: ".75rem" }}>—</span>}
                        </Td>

                        {/* Three-dot menu */}
                        <Td style={{ textAlign: "center" }}>
                          <MenuWrap ref={openMenuId === r.mr_number ? menuRef : null}>
                            <DotBtn
                              title="Actions"
                              onClick={() => setOpenMenuId(prev => prev === r.mr_number ? null : r.mr_number)}
                            >
                              ⋯
                            </DotBtn>
                            {openMenuId === r.mr_number && (
                              <MenuList>
                                {r.status === "Approved" ? (
                                  <MenuItem onClick={() => { setViewPr(r); setOpenMenuId(null) }}>
                                    👁 View
                                  </MenuItem>
                                ) : (
                                  <>
                                    <MenuItem onClick={() => { setViewPr(r); setOpenMenuId(null) }}>
                                      👁 View
                                    </MenuItem>
                                    {canAct ? (
                                      <>
                                        <MenuItem $success onClick={() => { setApprovePr(r); setOpenMenuId(null) }}>
                                          ✔ Approve
                                        </MenuItem>
                                        <MenuItem $danger onClick={() => { setRejectPr(r); setOpenMenuId(null) }}>
                                          ✕ Reject
                                        </MenuItem>
                                      </>
                                    ) : (
                                      <MenuItem style={{ opacity: 0.45, cursor: "not-allowed" }}>
                                        🔒 {r.status}
                                      </MenuItem>
                                    )}
                                  </>
                                )}
                              </MenuList>
                            )}
                          </MenuWrap>
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

      {/* Modals */}
      {approvePr && <ApproveModal pr={approvePr} onConfirm={handleApproveConfirm} onClose={() => setApprovePr(null)} loading={actionLoading} />}
      {rejectPr  && <RejectModal  pr={rejectPr}  onConfirm={handleRejectConfirm}  onClose={() => setRejectPr(null)}  loading={actionLoading} />}
      {viewPr    && <ViewModal    pr={viewPr}    onClose={() => setViewPr(null)}   fmtDT={fmtDT} />}
    </Wrap>
  )
}

export default MedicineRequisitionApproval