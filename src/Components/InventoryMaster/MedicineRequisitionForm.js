import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

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
const Body   = styled.div`max-width:1000px;margin:0 auto;padding:22px 20px;`

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
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);`
const AniCard  = styled(Card)`${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`
const CardBody = styled.div`padding:18px 20px;`

/* ── Grid ── */
const Grid = styled.div`
  display:grid;grid-template-columns:${p => p.$cols || "repeat(2,1fr)"};gap:12px;margin-bottom:14px;
  @media(max-width:760px){grid-template-columns:1fr 1fr!important;}
  @media(max-width:500px){grid-template-columns:1fr!important;}
`

/* ── Form controls ── */
const FG     = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl    = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp    = styled.input`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
`
const Sel    = styled.select`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
`
const Txta   = styled.textarea`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};border-radius:7px;
  font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;resize:vertical;min-height:64px;font-family:inherit;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const ErrMsg = styled.span`font-size:.68rem;color:${C.danger};margin-top:2px;`

/* ── Buttons ── */
const Btn      = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:9px 22px;border:none;border-radius:7px;
  font-size:.85rem;font-weight:800;cursor:pointer;font-family:inherit;
  transition:background .13s,transform .1s;
  &:active{transform:translateY(1px);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`
const PrimBtn  = styled(Btn)`background:${C.primary};color:#fff;&:hover:not(:disabled){background:${C.pDark};}`
const SecBtn   = styled(Btn)`background:#fff;color:#374151;border:1.5px solid ${C.border};&:hover:not(:disabled){background:${C.faint};}`
const AmberBtn = styled(Btn)`background:${C.amber};color:#fff;&:hover:not(:disabled){background:${C.amberD};}`
const BtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Three-dot action menu ── */
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
  min-width:150px;background:#fff;border:1.5px solid ${C.border};
  border-radius:9px;box-shadow:0 8px 28px rgba(0,0,0,.13);
  list-style:none;margin:0;padding:5px;
  ${css`animation:${fadeSlide} .14s ease;`}
`
const MenuItem = styled.li`
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;border-radius:6px;font-size:.8rem;font-weight:700;
  cursor:pointer;color:${p => p.$danger ? C.danger : C.text};
  transition:background .1s;
  &:hover{background:${p => p.$danger ? "#fff1f2" : C.pLight};color:${p => p.$danger ? C.danger : C.primary};}
`

/* ── Badge ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:800;
  background:${p => p.$s==="Approved"?"#dcfce7":p.$s==="Rejected"?"#fee2e2":p.$s==="Verified"?"#dbeafe":"#fef9c3"};
  color:${p => p.$s==="Approved"?"#166534":p.$s==="Rejected"?"#991b1b":p.$s==="Verified"?"#1d4ed8":"#92400e"};
  border:1px solid ${p => p.$s==="Approved"?"#86efac":p.$s==="Rejected"?"#fca5a5":p.$s==="Verified"?"#93c5fd":"#fde68a"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;
    background:${p => p.$s==="Approved"?"#16a34a":p.$s==="Rejected"?"#dc2626":p.$s==="Verified"?"#2563eb":"#d97706"};}
`
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── List table ── */
const TblWrap = styled.div`overflow-x:auto;`
const Tbl     = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th      = styled.th`background:${C.faint};color:${C.muted};padding:10px 12px;text-align:left;font-size:.69rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;`
const Td      = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:${C.text};vertical-align:middle;`
const Trow    = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Filter bar ── */
const FBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;padding:13px 18px;background:${C.faint};border-bottom:1px solid ${C.border};`

/* ── Modal ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;padding:28px 32px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const MTitle   = styled.h3`margin:0 0 7px;font-size:1rem;font-weight:800;color:${C.text};`
const MSub     = styled.p`margin:0 0 16px;font-size:.875rem;color:${C.muted};line-height:1.55;`
const Spin     = styled.span`display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;${css`animation:${spin} .6s linear infinite;`}`

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
            value={r} onChange={e => setR(e.target.value)}
            placeholder="e.g. Updated dosage per revised prescription…"
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

/* ── View detail modal ── */
const ViewModal = ({ pr, onClose }) => {
  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }
  const DRow   = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;`
  const DField = styled.div`background:${C.faint};border-radius:7px;padding:9px 12px;border:1px solid ${C.border};`
  const DLbl   = styled.div`font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:${C.muted};margin-bottom:3px;`
  const DVal   = styled.div`font-size:.85rem;font-weight:600;color:${C.text};word-break:break-word;`
  const DSec   = styled.div`font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${C.primary};margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid ${C.border};`
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: "95%", padding: "0", overflow: "hidden" }}>
        {/* header */}
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
            <DField><DLbl>PR Number</DLbl><DVal><Pill>{pr.mr_number}</Pill></DVal></DField>
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
                <DField><DLbl>Approved By</DLbl><DVal style={{ color: "#166534" }}>{pr.approved_by || "—"}</DVal></DField>
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
          <BtnRow style={{ marginTop: 14 }}>
            <SecBtn onClick={onClose}>Close</SecBtn>
          </BtnRow>
        </div>
      </MBox>
    </MOverlay>
  )
}

/* ── Today's date helper ── */
const todayStr = () => new Date().toISOString().slice(0, 10)

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function MedicineRequisition() {
  const [tab,         setTab]         = useState("form")
  const [prList,      setPrList]      = useState([])
  const [editPr,      setEditPr]      = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [showReason,  setShowReason]  = useState(false)
  const [pendingSave, setPendingSave] = useState(null)
  const [viewPr,      setViewPr]      = useState(null)
  const [openMenuId,  setOpenMenuId]  = useState(null)
  const menuRef = useRef(null)

  /* ── Form fields ── */
  const emptyForm = {
    medicine_name:        "",
    chemical_composition: "",
    consultant_name:      "",
    request_date:         new Date().toISOString().slice(0, 16),
    remarks:              "",
  }
  const [form, setForm] = useState(emptyForm)
  const [errs, setErrs] = useState({})

  /* ── List filters ── */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState(todayStr)
  const [toDate,     setToDate]     = useState(todayStr)

  /* ── Close menu on outside click ── */
  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  /* ── Fetch list ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fromDate) params.append("from_date", fromDate)
      if (toDate)   params.append("to_date",   toDate)
      const qs = params.toString()
      const r  = await apiRequest(`${BASE}medicine-requisition/${qs ? "?" + qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch { toast.error("Failed to load requisitions") }
    finally { setLoading(false) }
  }, [fromDate, toDate])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Validate ── */
  const validate = () => {
    const e = {}
    if (!form.medicine_name.trim())   e.medicine_name   = "Required"
    if (!form.consultant_name.trim()) e.consultant_name = "Required"
    if (!form.request_date)           e.request_date    = "Required"
    setErrs(e)
    return Object.keys(e).length === 0
  }

  /* ── Build payload ── */
  const buildPayload = (editedReason) => ({
    medicine_name:        form.medicine_name.trim(),
    chemical_composition: form.chemical_composition.trim(),
    consultant_name:      form.consultant_name.trim(),
    request_date:         form.request_date,
    remarks:              form.remarks.trim(),
    ...(editPr ? { edited_reason: editedReason } : {}),
  })

  /* ── Submit ── */
  const handleSubmit = () => {
    if (!validate()) { toast.error("Please fill all required fields"); return }
    if (editPr) {
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
      const isEdit = !!editPr
      const url    = isEdit ? `${BASE}medicine-requisition/${editPr.mr_number}/` : `${BASE}medicine-requisition/`
      const method = isEdit ? "PUT" : "POST"
      const r      = await apiRequest(url, method, payload)
      if (r?.success) {
        toast.success(isEdit ? "Requisition updated" : `Draft created: ${r.data?.mr_number}`)
        resetForm(); fetchList(); setTab("list")
      } else {
        const err = r?.error
        toast.error(Array.isArray(err) ? err.join(", ") : typeof err === "string" ? err : "Save failed")
      }
    } catch { toast.error("Network error") }
    finally { setSaving(false) }
  }

  /* ── Load into edit form ── */
  const handleEdit = pr => {
    if (pr.status === "Approved" || pr.status === "Rejected") {
      toast.warning(`Cannot edit a ${pr.status} requisition`)
      return
    }
    setEditPr(pr)
    setForm({
      medicine_name:        pr.medicine_name        || "",
      chemical_composition: pr.chemical_composition || "",
      consultant_name:      pr.consultant_name      || "",
      request_date:         pr.request_date ? pr.request_date.slice(0, 16) : "",
      remarks:              pr.remarks              || "",
    })
    setErrs({})
    setTab("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Reset ── */
  const resetForm = () => {
    setEditPr(null)
    setForm(emptyForm)
    setErrs({})
  }

  /* ── Filtered list ── */
  const filtered = prList.filter(r => {
    const q = searchQ.toLowerCase()
    const okQ = !q ||
      (r.mr_number       || "").toLowerCase().includes(q) ||
      (r.medicine_name   || "").toLowerCase().includes(q) ||
      (r.consultant_name || "").toLowerCase().includes(q)
    return okQ && (!filterStat || r.status === filterStat)
  })

  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  /* ─────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <div>
          <HTitle>📋 Medicine Requisition</HTitle>
          <HSub>Raise &amp; manage medicine purchase requests</HSub>
        </div>
        <TabRow>
          <Tab $a={tab === "form"} onClick={() => { resetForm(); setTab("form") }}>+ New Request</Tab>
          <Tab $a={tab === "list"} onClick={() => setTab("list")}>📄 My Requisitions</Tab>
        </TabRow>
      </Header>

      <Body>
        {/* ═══ FORM TAB ═══════════════════════════════════════════ */}
        {tab === "form" && (
          <AniCard>
            <CardHead>
              {editPr ? `✏️ Edit Requisition — ${editPr.mr_number}` : "📝 New Purchase Requisition"}
              {editPr && <Badge $s={editPr.status}>{editPr.status}</Badge>}
            </CardHead>
            <CardBody>

              {/* Medicine Name */}
              <Grid $cols="1fr">
                <FG>
                  <Lbl>Medicine Name <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.medicine_name}
                    value={form.medicine_name}
                    onChange={e => setForm(p => ({ ...p, medicine_name: e.target.value }))}
                    placeholder="Enter medicine name"
                  />
                  {errs.medicine_name && <ErrMsg>{errs.medicine_name}</ErrMsg>}
                </FG>
              </Grid>

              {/* Chemical Composition */}
              <Grid $cols="1fr">
                <FG>
                  <Lbl>Chemical Composition</Lbl>
                  <Inp
                    value={form.chemical_composition}
                    onChange={e => setForm(p => ({ ...p, chemical_composition: e.target.value }))}
                    placeholder="Enter chemical composition (optional)"
                  />
                </FG>
              </Grid>

              {/* Consultant & Date */}
              <Grid $cols="1fr 1fr">
                <FG>
                  <Lbl>Consultant Name <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.consultant_name}
                    value={form.consultant_name}
                    onChange={e => setForm(p => ({ ...p, consultant_name: e.target.value }))}
                    placeholder="Dr. Name"
                  />
                  {errs.consultant_name && <ErrMsg>{errs.consultant_name}</ErrMsg>}
                </FG>
                <FG>
                  <Lbl>Request Date &amp; Time <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.request_date}
                    type="datetime-local"
                    value={form.request_date}
                    onChange={e => setForm(p => ({ ...p, request_date: e.target.value }))}
                  />
                  {errs.request_date && <ErrMsg>{errs.request_date}</ErrMsg>}
                </FG>
              </Grid>

              {/* Remarks */}
              <Grid $cols="1fr" style={{ marginBottom: 0 }}>
                <FG>
                  <Lbl>Remarks</Lbl>
                  <Txta
                    value={form.remarks}
                    onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
                    placeholder="Any additional notes…"
                  />
                </FG>
              </Grid>

              <BtnRow style={{ marginTop: 18 }}>
                <SecBtn onClick={resetForm} disabled={saving}>✕ Clear</SecBtn>
                <PrimBtn onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving…" : editPr ? "💾 Update Requisition" : "💾 Save as Draft"}
                </PrimBtn>
              </BtnRow>
            </CardBody>
          </AniCard>
        )}

        {/* ═══ LIST TAB ════════════════════════════════════════════ */}
        {tab === "list" && (
          <Card>
            <CardHead>
              📄 Requisition Records
              <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".72rem", padding: "1px 8px", borderRadius: 12, fontWeight: 600 }}>
                {prList.length}
              </span>
            </CardHead>

            {/* Filters */}
            <FBar>
              <FG style={{ flex: 1, minWidth: 200, margin: 0 }}>
                <Lbl>Search</Lbl>
                <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="PR No, Medicine, Consultant…" />
              </FG>
              <FG style={{ minWidth: 150, margin: 0 }}>
                <Lbl>Status</Lbl>
                <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                  <option value="">All Status</option>
                  {["Draft", "Verified", "Approved", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
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
              <PrimBtn onClick={fetchList} style={{ alignSelf: "flex-end" }}>🔄 Refresh</PrimBtn>
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
                      <Th>Medicine</Th>
                      <Th>Composition</Th>
                      <Th>Consultant</Th>
                      <Th>Req Date</Th>
                      <Th>Status</Th>
                      <Th>Remarks</Th>
                      <Th style={{ textAlign: "center" }}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const canEdit = r.status === "Draft" || r.status === "Verified"
                      return (
                        <Trow key={r.mr_number}>
                          <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                          <Td><Pill>{r.mr_number}</Pill></Td>
                          <Td style={{ fontWeight: 700, maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.medicine_name}</Td>
                          <Td style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.muted, fontSize: ".78rem" }}>{r.chemical_composition || "—"}</Td>
                          <Td style={{ whiteSpace: "nowrap" }}>{r.consultant_name || "—"}</Td>
                          <Td style={{ whiteSpace: "nowrap", fontSize: ".78rem" }}>{fmtDT(r.request_date)}</Td>
                          <Td><Badge $s={r.status}>{r.status}</Badge></Td>
                          <Td style={{ maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: ".78rem", color: C.muted }}>{r.remarks || "—"}</Td>

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
                                  <MenuItem onClick={() => { setViewPr(r); setOpenMenuId(null) }}>
                                    👁 View
                                  </MenuItem>
                                  {canEdit ? (
                                    <MenuItem onClick={() => { handleEdit(r); setOpenMenuId(null) }}>
                                      ✏️ Edit
                                    </MenuItem>
                                  ) : (
                                    <MenuItem style={{ opacity: 0.45, cursor: "not-allowed" }}>
                                      🔒 {r.status}
                                    </MenuItem>
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
        )}
      </Body>

      {/* Edit-reason modal */}
      {showReason && (
        <EditReasonModal
          onConfirm={handleReasonConfirm}
          onClose={() => { setShowReason(false); setPendingSave(null) }}
        />
      )}

      {/* View detail modal */}
      {viewPr && <ViewModal pr={viewPr} onClose={() => setViewPr(null)} />}
    </Wrap>
  )
}