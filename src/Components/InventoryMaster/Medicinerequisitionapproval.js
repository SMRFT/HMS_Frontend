import React, { useState, useEffect, useCallback } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes } from "styled-components"

/* ─────────────────────────────────────────────────────────────
   DESIGN: Clinical authority panel — deep navy accent, crisp
   white cards, red/green action palette. Approval workflows
   deserve gravitas.
───────────────────────────────────────────────────────────── */

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
`
const spin = keyframes`to { transform:rotate(360deg); }`

/* ── Layout ── */
const Wrap    = styled.div`min-height:100vh;background:#f0f4f8;padding:0 0 48px;font-family:'DM Sans',system-ui,sans-serif;`
const Header  = styled.div`
  background: linear-gradient(135deg,#1e3a5f 0%,#0d9488 100%);
  color:white;padding:18px 28px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
  box-shadow:0 4px 24px rgba(15,40,80,.22);
`
const HTitle    = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSubtitle = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body      = styled.div`padding:20px 24px;max-width:1300px;margin:0 auto;`

/* ── Stats strip ── */
const StatsRow  = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;@media(max-width:700px){grid-template-columns:repeat(2,1fr);}`
const StatCard  = styled.div`
  background:white;border-radius:10px;padding:16px 18px;
  border-left:4px solid ${p=>p.$color||"#0d9488"};
  box-shadow:0 1px 6px rgba(0,0,0,.06);
`
const StatNum   = styled.div`font-size:1.7rem;font-weight:800;color:${p=>p.$color||"#0d9488"};line-height:1;`
const StatLbl   = styled.div`font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-top:4px;`

/* ── Card ── */
const Card      = styled.div`background:white;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.06);animation:${fadeUp} .25s ease;`
const CardHead  = styled.div`background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:12px 18px;font-size:.82rem;font-weight:700;color:#1e3a5f;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;`

/* ── Filter bar ── */
const FilterBar = styled.div`display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;`
const Lbl       = styled.label`font-size:.72rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:3px;`
const Inp       = styled.input`padding:8px 11px;border:1.5px solid #d1d5db;border-radius:7px;font-size:.85rem;color:#111827;outline:none;font-family:inherit;transition:border-color .15s;&:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.1);}`
const Sel       = styled.select`padding:8px 11px;border:1.5px solid #d1d5db;border-radius:7px;font-size:.85rem;color:#111827;outline:none;background:white;font-family:inherit;transition:border-color .15s;&:focus{border-color:#0d9488;}`

/* ── Table ── */
const TblWrap   = styled.div`overflow-x:auto;`
const Tbl       = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th        = styled.th`background:#f8fafc;color:#374151;padding:10px 12px;text-align:left;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #e2e8f0;white-space:nowrap;`
const Td        = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;vertical-align:middle;`
const Tr        = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Badge ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;
  background:${p=>p.$s==="Approved"?"#dcfce7":p.$s==="Rejected"?"#fee2e2":p.$s==="Verified"?"#dbeafe":"#fef9c3"};
  color:${p=>p.$s==="Approved"?"#166534":p.$s==="Rejected"?"#991b1b":p.$s==="Verified"?"#1d4ed8":"#854d0e"};
  border:1px solid ${p=>p.$s==="Approved"?"#86efac":p.$s==="Rejected"?"#fca5a5":p.$s==="Verified"?"#93c5fd":"#fde047"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;background:${p=>p.$s==="Approved"?"#16a34a":p.$s==="Rejected"?"#dc2626":p.$s==="Verified"?"#2563eb":"#ca8a04"};}
`
const Pill = styled.span`background:#f0fdfa;color:#0f766e;padding:2px 8px;border-radius:4px;font-size:.72rem;font-weight:600;border:1px solid #a7f3d0;font-family:monospace;`

/* ── Action buttons ── */
const ApproveBtn = styled.button`
  display:inline-flex;align-items:center;gap:5px;padding:6px 14px;
  background:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:6px;
  font-size:.76rem;font-weight:700;cursor:pointer;font-family:inherit;
  transition:background .14s;
  &:hover{background:#bbf7d0;}
  &:disabled{opacity:.4;cursor:not-allowed;}
`
const RejectBtn = styled.button`
  display:inline-flex;align-items:center;gap:5px;padding:6px 14px;
  background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;border-radius:6px;
  font-size:.76rem;font-weight:700;cursor:pointer;font-family:inherit;
  transition:background .14s;
  &:hover{background:#fecaca;}
  &:disabled{opacity:.4;cursor:not-allowed;}
`
const ViewBtn = styled.button`
  display:inline-flex;align-items:center;gap:4px;padding:6px 12px;
  background:#f8fafc;color:#374151;border:1px solid #e2e8f0;border-radius:6px;
  font-size:.76rem;font-weight:600;cursor:pointer;font-family:inherit;
  transition:background .14s;
  &:hover{background:#f1f5f9;}
`
const RefreshBtn = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
  background:#1e3a5f;color:white;border:none;border-radius:7px;
  font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;
  transition:background .14s;
  &:hover{background:#15304f;}
`

/* ── Spinner ── */
const Spinner = styled.span`
  display:inline-block;width:14px;height:14px;
  border:2px solid rgba(0,0,0,.15);border-top-color:#0d9488;
  border-radius:50%;animation:${spin} .7s linear infinite;
`

/* ── Modal ── */
const MOverlay  = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox      = styled.div`background:white;border-radius:12px;padding:28px 32px;max-width:500px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.22);animation:${fadeUp} .18s ease;`
const MTitle    = styled.h3`margin:0 0 6px;font-size:1.05rem;font-weight:800;color:#111827;`
const MSubtitle = styled.p`margin:0 0 18px;font-size:.85rem;color:#6b7280;line-height:1.5;`
const MLabel    = styled.label`display:block;font-size:.72rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;`
const MTextarea = styled.textarea`
  width:100%;padding:9px 11px;border:1.5px solid ${p=>p.$err?"#dc2626":"#d1d5db"};
  border-radius:7px;font-size:.875rem;color:#374151;outline:none;resize:vertical;
  min-height:88px;font-family:inherit;box-sizing:border-box;
  transition:border-color .15s;
  &:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,.1);}
`
const MErrNote  = styled.div`font-size:.7rem;color:#dc2626;margin-top:4px;`
const MBtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:20px;`
const MCancelBtn= styled.button`padding:8px 20px;border-radius:7px;border:1.5px solid #d1d5db;background:white;cursor:pointer;font-size:.85rem;font-weight:600;font-family:inherit;`
const MConfBtn  = styled.button`
  padding:8px 20px;border-radius:7px;border:none;
  background:${p=>p.$danger?"#dc2626":"#16a34a"};
  color:white;cursor:pointer;font-size:.85rem;font-weight:700;font-family:inherit;
  &:disabled{opacity:.6;cursor:not-allowed;}
`

/* ── Detail drawer ── */
const DrawerOverlay = styled(MOverlay)``
const DrawerBox = styled.div`
  background:white;border-radius:12px;max-width:620px;width:90%;max-height:90vh;
  overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.22);animation:${fadeUp} .18s ease;
`
const DrawerHead = styled.div`
  background:linear-gradient(135deg,#1e3a5f,#0d9488);color:white;
  padding:14px 20px;border-radius:12px 12px 0 0;
  display:flex;align-items:center;justify-content:space-between;
`
const DrawerBody = styled.div`padding:20px 22px;`
const DRow = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;`
const DField = styled.div`background:#f8fafc;border-radius:7px;padding:10px 12px;border:1px solid #e2e8f0;`
const DLabel = styled.div`font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#9ca3af;margin-bottom:3px;`
const DValue = styled.div`font-size:.85rem;font-weight:600;color:#111827;word-break:break-word;`
const DSection = styled.div`font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0d9488;margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;`

/* ─────────────────────────────────────────────────────────── */

/* Reject modal */
const RejectModal = ({ pr, onConfirm, onClose, loading }) => {
  const [reason,  setReason]  = useState("")
  const [touched, setTouched] = useState(false)
  const handleConfirm = () => { setTouched(true); if (!reason.trim()) return; onConfirm(reason.trim()) }
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✕ Reject Requisition</MTitle>
        <MSubtitle>
          Reject <strong>{pr.pr_number}</strong> for <strong>{pr.medicine_name}</strong>?
          <br />This action cannot be undone.
        </MSubtitle>
        <MLabel>Rejection Reason <span style={{color:"#dc2626"}}>*</span></MLabel>
        <MTextarea
          $err={touched && !reason.trim()}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="State the reason for rejection…"
        />
        {touched && !reason.trim() && <MErrNote>Rejection reason is required.</MErrNote>}
        <MBtnRow>
          <MCancelBtn onClick={onClose} disabled={loading}>Cancel</MCancelBtn>
          <MConfBtn $danger onClick={handleConfirm} disabled={loading}>
            {loading ? <Spinner/> : "✕ Confirm Reject"}
          </MConfBtn>
        </MBtnRow>
      </MBox>
    </MOverlay>
  )
}

/* Approve modal */
const ApproveModal = ({ pr, onConfirm, onClose, loading }) => (
  <MOverlay onClick={onClose}>
    <MBox onClick={e => e.stopPropagation()}>
      <MTitle>✔ Approve Requisition</MTitle>
      <MSubtitle>
        Approve <strong>{pr.pr_number}</strong> for <strong>{pr.medicine_name}</strong>
        <br />This will mark the requisition as Approved.
      </MSubtitle>
      <MBtnRow>
        <MCancelBtn onClick={onClose} disabled={loading}>Cancel</MCancelBtn>
        <MConfBtn onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner/> : "✔ Confirm Approve"}
        </MConfBtn>
      </MBtnRow>
    </MBox>
  </MOverlay>
)

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const MedicineRequisitionApproval = () => {
  const [prList,       setPrList]       = useState([])
  const [loading,      setLoading]      = useState(false)
  const [actionLoading,setActionLoading]= useState(false)

  /* Filters */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("Draft")
  const [fromDate,   setFromDate]   = useState("")
  const [toDate,     setToDate]     = useState("")

  /* Modals */
  const [approvePr, setApprovePr]  = useState(null)
  const [rejectPr,  setRejectPr]   = useState(null)
  const [viewPr,    setViewPr]     = useState(null)

  /* ── Fetch ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStat) params.append("status", filterStat)
      if (fromDate)   params.append("from_date", fromDate)
      if (toDate)     params.append("to_date",   toDate)
      const qs = params.toString()
      const r  = await apiRequest(`${baseUrl}medicine-requisition/${qs ? "?"+qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch { toast.error("Failed to load requisitions") }
    finally { setLoading(false) }
  }, [filterStat, fromDate, toDate])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Approve ── */
  const handleApproveConfirm = async () => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${baseUrl}medicine-requisition-action/`, "POST", {
        pr_number: approvePr.pr_number,
        action:    "approve",
      })
      if (r?.success) {
        toast.success(`${approvePr.pr_number} approved successfully`)
        setApprovePr(null)
        fetchList()
      } else {
        const err = r?.error
        toast.error(typeof err === "string" ? err : JSON.stringify(err))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── Reject ── */
  const handleRejectConfirm = async (reason) => {
    setActionLoading(true)
    try {
      const r = await apiRequest(`${baseUrl}medicine-requisition-action/`, "POST", {
        pr_number:       rejectPr.pr_number,
        action:          "reject",
        rejected_reason: reason,
      })
      if (r?.success) {
        toast.success(`${rejectPr.pr_number} rejected`)
        setRejectPr(null)
        fetchList()
      } else {
        const err = r?.error
        toast.error(typeof err === "string" ? err : JSON.stringify(err))
      }
    } catch { toast.error("Network error") }
    finally { setActionLoading(false) }
  }

  /* ── Filtered list ── */
  const filtered = prList.filter(r => {
    const q = searchQ.toLowerCase()
    return !q ||
      (r.pr_number       || "").toLowerCase().includes(q) ||
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

  /* ── Formatters ── */
  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—" } catch { return "—" } }
  const fmtD  = d => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—" } catch { return "—" } }

  /* ─────────────────────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <div>
          <HTitle>🏥 PR Approval Dashboard</HTitle>
          <HSubtitle>Review, approve and reject medicine requisitions</HSubtitle>
        </div>
        <RefreshBtn onClick={fetchList} disabled={loading}>
          {loading ? <Spinner/> : "🔄"} Refresh
        </RefreshBtn>
      </Header>

      <Body>
        {/* Stats strip */}
        <StatsRow>
          <StatCard $color="#6b7280"><StatNum $color="#6b7280">{stats.total}</StatNum><StatLbl>Total</StatLbl></StatCard>
          <StatCard $color="#ca8a04"><StatNum $color="#ca8a04">{stats.draft}</StatNum><StatLbl>Pending</StatLbl></StatCard>
          <StatCard $color="#16a34a"><StatNum $color="#16a34a">{stats.approved}</StatNum><StatLbl>Approved</StatLbl></StatCard>
          <StatCard $color="#dc2626"><StatNum $color="#dc2626">{stats.rejected}</StatNum><StatLbl>Rejected</StatLbl></StatCard>
        </StatsRow>

        {/* Main list */}
        <Card>
          <CardHead>
            <span>📋 Purchase Requisitions</span>
            <span style={{background:"#e5e7eb",color:"#6b7280",fontSize:".72rem",padding:"1px 8px",borderRadius:12,fontWeight:600}}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardHead>

          {/* Filters */}
          <FilterBar>
            <div style={{flex:1,minWidth:200}}>
              <Lbl>Search</Lbl>
              <Inp
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="PR No, Medicine, Consultant…"
                style={{width:"100%"}}
              />
            </div>
            <div style={{minWidth:150}}>
              <Lbl>Status</Lbl>
              <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                <option value="">All Status</option>
                {["Draft","Verified","Approved","Rejected"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Sel>
            </div>
            <div>
              <Lbl>From Date</Lbl>
              <Inp type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <Lbl>To Date</Lbl>
              <Inp type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div style={{alignSelf:"flex-end"}}>
              <RefreshBtn onClick={fetchList} disabled={loading} style={{fontSize:".8rem",padding:"8px 14px"}}>
                🔍 Search
              </RefreshBtn>
            </div>
          </FilterBar>

          <TblWrap>
            {loading ? (
              <div style={{textAlign:"center",padding:"48px",color:"#9ca3af",fontSize:".85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                <Spinner/> Loading requisitions…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{textAlign:"center",padding:"48px",color:"#9ca3af",fontSize:".85rem"}}>
                📭 No requisitions found for the selected filters
              </div>
            ) : (
              <Tbl>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>PR No</Th>
                    <Th>Medicine</Th>
                    <Th>Composition</Th>
                    <Th>Consultant</Th>
                    <Th>Req Date</Th>
                    <Th>Qty</Th>
                    <Th>Status</Th>
                    <Th>Approved / Rejected Info</Th>
                    <Th style={{textAlign:"center"}}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const canApprove = r.status === "Draft" || r.status === "Verified"
                    const canReject  = r.status === "Draft" || r.status === "Verified"
                    return (
                      <Tr key={r.pr_number}>
                        <Td style={{color:"#9ca3af",fontSize:".72rem"}}>{idx+1}</Td>
                        <Td><Pill>{r.pr_number}</Pill></Td>
                        <Td style={{fontWeight:600,maxWidth:150,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={r.medicine_name}>
                          {r.medicine_name}
                        </Td>
                        <Td style={{maxWidth:130,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#6b7280",fontSize:".76rem"}} title={r.chemical_composition}>
                          {r.chemical_composition || "—"}
                        </Td>
                        <Td style={{whiteSpace:"nowrap"}}>{r.consultant_name || "—"}</Td>
                        <Td style={{whiteSpace:"nowrap",fontSize:".76rem"}}>{fmtDT(r.request_date)}</Td>
                        <Td><Badge $s={r.status}>{r.status}</Badge></Td>

                        {/* Approved / Rejected info */}
                        <Td style={{minWidth:170}}>
                          {r.status === "Approved" && (
                            <div style={{display:"flex",flexDirection:"column",gap:3}}>
                              <span style={{background:"#dcfce7",color:"#166534",padding:"2px 8px",borderRadius:4,fontSize:".7rem",fontWeight:700}}>
                                ✔ {r.approved_by || "—"}
                              </span>
                              <span style={{fontSize:".68rem",color:"#6b7280"}}>{fmtDT(r.approved_date)}</span>
                            </div>
                          )}
                          {r.status === "Rejected" && (
                            <div style={{display:"flex",flexDirection:"column",gap:3}}>
                              <span style={{background:"#fee2e2",color:"#991b1b",padding:"2px 8px",borderRadius:4,fontSize:".7rem",fontWeight:700}}>
                                ✕ {r.rejected_by || "—"}
                              </span>
                              <span style={{fontSize:".68rem",color:"#6b7280"}}>{fmtDT(r.rejected_date)}</span>
                              {r.rejected_reason && (
                                <span
                                  title={r.rejected_reason}
                                  style={{
                                    fontSize:".7rem",color:"#991b1b",
                                    background:"#fff1f2",border:"1px solid #fecaca",
                                    borderRadius:4,padding:"2px 6px",
                                    maxWidth:160,whiteSpace:"nowrap",
                                    overflow:"hidden",textOverflow:"ellipsis",
                                    display:"block"
                                  }}
                                >
                                  {r.rejected_reason}
                                </span>
                              )}
                            </div>
                          )}
                          {(r.status === "Draft" || r.status === "Verified") && (
                            <span style={{color:"#d1d5db",fontSize:".75rem"}}>—</span>
                          )}
                        </Td>

                        {/* Actions */}
                        <Td>
                          <div style={{display:"flex",gap:5,flexWrap:"nowrap",justifyContent:"center"}}>
                            <ViewBtn onClick={() => setViewPr(r)} title="View Details">
                              👁 View
                            </ViewBtn>
                            {canApprove && (
                              <ApproveBtn onClick={() => setApprovePr(r)} title="Approve">
                                ✔ Approve
                              </ApproveBtn>
                            )}
                            {canReject && (
                              <RejectBtn onClick={() => setRejectPr(r)} title="Reject">
                                ✕ Reject
                              </RejectBtn>
                            )}
                            {!canApprove && !canReject && (
                              <span style={{fontSize:".72rem",color:"#9ca3af"}}>🔒 {r.status}</span>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Tbl>
            )}
          </TblWrap>
        </Card>
      </Body>

      {/* ── Approve Modal ── */}
      {approvePr && (
        <ApproveModal
          pr={approvePr}
          onConfirm={handleApproveConfirm}
          onClose={() => setApprovePr(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Reject Modal ── */}
      {rejectPr && (
        <RejectModal
          pr={rejectPr}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectPr(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Detail Drawer ── */}
      {viewPr && (
        <DrawerOverlay onClick={() => setViewPr(null)}>
          <DrawerBox onClick={e => e.stopPropagation()}>
            <DrawerHead>
              <div>
                <div style={{fontWeight:800,fontSize:"1rem"}}>{viewPr.pr_number}</div>
                <div style={{fontSize:".75rem",opacity:.82,marginTop:2}}>{viewPr.medicine_name}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Badge $s={viewPr.status}>{viewPr.status}</Badge>
                <button
                  onClick={() => setViewPr(null)}
                  style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}
                >✕</button>
              </div>
            </DrawerHead>
            <DrawerBody>

              <DSection>📋 Requisition Details</DSection>
              <DRow>
                <DField><DLabel>PR Number</DLabel><DValue><Pill>{viewPr.pr_number}</Pill></DValue></DField>
                <DField><DLabel>Status</DLabel><DValue><Badge $s={viewPr.status}>{viewPr.status}</Badge></DValue></DField>
              </DRow>
              <DRow>
                <DField><DLabel>Medicine</DLabel><DValue>{viewPr.medicine_name}</DValue></DField>
              </DRow>
              <DRow>
                <DField style={{gridColumn:"1/-1"}}><DLabel>Chemical Composition</DLabel><DValue>{viewPr.chemical_composition || "—"}</DValue></DField>
              </DRow>
              <DRow>
                <DField><DLabel>Consultant</DLabel><DValue>{viewPr.consultant_name || "—"}</DValue></DField>
                <DField><DLabel>Request Date</DLabel><DValue>{fmtDT(viewPr.request_date)}</DValue></DField>
              </DRow>
              {viewPr.remarks && (
                <DRow>
                  <DField style={{gridColumn:"1/-1"}}><DLabel>Remarks</DLabel><DValue style={{fontWeight:400,color:"#6b7280"}}>{viewPr.remarks}</DValue></DField>
                </DRow>
              )}

              {/* Approval info */}
              {viewPr.status === "Approved" && (
                <>
                  <DSection>✔ Approval Info</DSection>
                  <DRow>
                    <DField><DLabel>Approved By</DLabel><DValue style={{color:"#166534"}}>{viewPr.approved_by || "—"}</DValue></DField>
                    <DField><DLabel>Approved Date</DLabel><DValue>{fmtDT(viewPr.approved_date)}</DValue></DField>
                  </DRow>
                </>
              )}

              {/* Rejection info */}
              {viewPr.status === "Rejected" && (
                <>
                  <DSection>✕ Rejection Info</DSection>
                  <DRow>
                    <DField><DLabel>Rejected By</DLabel><DValue style={{color:"#991b1b"}}>{viewPr.rejected_by || "—"}</DValue></DField>
                    <DField><DLabel>Rejected Date</DLabel><DValue>{fmtDT(viewPr.rejected_date)}</DValue></DField>
                  </DRow>
                  <DRow>
                    <DField style={{gridColumn:"1/-1"}}><DLabel>Rejection Reason</DLabel><DValue style={{color:"#991b1b",fontWeight:400}}>{viewPr.rejected_reason || "—"}</DValue></DField>
                  </DRow>
                </>
              )}

              {/* Edit audit */}
              {viewPr.edited_by && (
                <>
                  <DSection>✏️ Last Edit</DSection>
                  <DRow>
                    <DField><DLabel>Edited By</DLabel><DValue>{viewPr.edited_by}</DValue></DField>
                    <DField><DLabel>Edited Date</DLabel><DValue>{fmtDT(viewPr.edited_date)}</DValue></DField>
                  </DRow>
                  <DRow>
                    <DField style={{gridColumn:"1/-1"}}><DLabel>Edit Reason</DLabel><DValue style={{fontWeight:400,color:"#6b7280"}}>{viewPr.edited_reason || "—"}</DValue></DField>
                  </DRow>
                </>
              )}

              {/* Created / modified */}
              <DSection>📅 Audit Trail</DSection>
              <DRow>
                <DField><DLabel>Created By</DLabel><DValue>{viewPr.created_by || "—"}</DValue></DField>
                <DField><DLabel>Created Date</DLabel><DValue>{fmtD(viewPr.created_date)}</DValue></DField>
              </DRow>
              <DRow>
                <DField><DLabel>Modified By</DLabel><DValue>{viewPr.lastmodified_by || "—"}</DValue></DField>
                <DField><DLabel>Modified Date</DLabel><DValue>{fmtD(viewPr.lastmodified_date)}</DValue></DField>
              </DRow>

              {/* Actions inside drawer */}
              {(viewPr.status === "Draft" || viewPr.status === "Verified") && (
                <div style={{display:"flex",gap:10,marginTop:18}}>
                  <ApproveBtn style={{flex:1,justifyContent:"center",padding:"10px"}} onClick={() => { setViewPr(null); setApprovePr(viewPr) }}>
                    ✔ Approve
                  </ApproveBtn>
                  <RejectBtn style={{flex:1,justifyContent:"center",padding:"10px"}} onClick={() => { setViewPr(null); setRejectPr(viewPr) }}>
                    ✕ Reject
                  </RejectBtn>
                </div>
              )}
            </DrawerBody>
          </DrawerBox>
        </DrawerOverlay>
      )}
    </Wrap>
  )
}

export default MedicineRequisitionApproval