import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

/* ─────────────────────────────────────────────────────────────
   DESIGN: Clean medical-grade utility — teal primary, warm
   neutrals, tight typography, status-driven colour system.
───────────────────────────────────────────────────────────── */

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
`
const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.35); }
  50%      { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
`

/* ── Layout ── */
const Wrap       = styled.div`min-height:100vh;background:#f0f4f8;padding:0 0 40px;font-family:'DM Sans',system-ui,sans-serif;`
const Header     = styled.div`background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);color:white;padding:18px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;box-shadow:0 4px 20px rgba(13,148,136,0.25);`
const HLeft      = styled.div``
const HTitle     = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-0.02em;`
const HSubtitle  = styled.p`margin:3px 0 0;font-size:0.75rem;opacity:0.82;`
const Body       = styled.div`padding:20px 24px;max-width:1200px;margin:0 auto;`

/* ── Card ── */
const Card       = styled.div`background:white;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,0.06);`
const CardHead   = styled.div`background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:12px 18px;font-size:0.82rem;font-weight:700;color:#0d9488;display:flex;align-items:center;gap:8px;`
const CardBody   = styled.div`padding:18px;`

/* ── Grid ── */
const Grid       = styled.div`display:grid;grid-template-columns:${p=>p.cols||"repeat(3,1fr)"};gap:12px;margin-bottom:12px;@media(max-width:800px){grid-template-columns:1fr 1fr!important;}@media(max-width:520px){grid-template-columns:1fr!important;}`

/* ── Form inputs ── */
const FGroup     = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl        = styled.label`font-size:0.72rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.04em;`
const Inp        = styled.input`padding:9px 11px;border:1.5px solid ${p=>p.$err?"#dc2626":"#d1d5db"};border-radius:7px;font-size:0.875rem;color:#111827;outline:none;width:100%;box-sizing:border-box;font-family:inherit;transition:border-color .15s,box-shadow .15s;&:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.1);}&:disabled{background:#f3f4f6;cursor:not-allowed;color:#6b7280;}`
const Sel        = styled.select`padding:9px 11px;border:1.5px solid ${p=>p.$err?"#dc2626":"#d1d5db"};border-radius:7px;font-size:0.875rem;color:#111827;outline:none;width:100%;box-sizing:border-box;font-family:inherit;background:white;transition:border-color .15s;&:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.1);}&:disabled{background:#f3f4f6;cursor:not-allowed;}`
const Txt        = styled.textarea`padding:9px 11px;border:1.5px solid #d1d5db;border-radius:7px;font-size:0.875rem;color:#111827;outline:none;width:100%;box-sizing:border-box;resize:vertical;min-height:68px;font-family:inherit;transition:border-color .15s;&:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.1);}`
const ErrNote    = styled.span`font-size:0.7rem;color:#dc2626;margin-top:2px;`

/* ── Autocomplete ── */
const AutoWrap   = styled.div`position:relative;`
const DropList   = styled.ul`position:absolute;top:100%;left:0;right:0;z-index:9999;background:white;border:1.5px solid #d1d5db;border-radius:0 0 8px 8px;max-height:200px;overflow-y:auto;list-style:none;margin:0;padding:0;box-shadow:0 8px 20px rgba(0,0,0,.12);`
const DropItem   = styled.li`padding:8px 12px;font-size:0.82rem;cursor:pointer;border-bottom:1px solid #f3f4f6;&:last-child{border-bottom:none;}&:hover{background:#f0fdfa;color:#0d9488;}`
const DropSub    = styled.span`font-size:0.7rem;color:#6b7280;margin-left:6px;`

/* ── Buttons ── */
const Btn        = styled.button`display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border:none;border-radius:7px;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s,transform .1s;&:active{transform:translateY(1px);}&:disabled{opacity:.55;cursor:not-allowed;}`
const PrimaryBtn = styled(Btn)`background:#0d9488;color:white;&:hover:not(:disabled){background:#0f766e;}`
const SecondBtn  = styled(Btn)`background:white;color:#374151;border:1.5px solid #d1d5db;&:hover:not(:disabled){background:#f9fafb;}`
const OrangeBtn  = styled(Btn)`background:#f97316;color:white;&:hover:not(:disabled){background:#ea6c0a;}`
const BtnRow     = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Status badge ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;letter-spacing:.02em;
  background:${p=>p.$s==="Approved"?"#dcfce7":p.$s==="Rejected"?"#fee2e2":p.$s==="Verified"?"#dbeafe":"#fef9c3"};
  color:${p=>p.$s==="Approved"?"#166534":p.$s==="Rejected"?"#991b1b":p.$s==="Verified"?"#1d4ed8":"#854d0e"};
  border:1px solid ${p=>p.$s==="Approved"?"#86efac":p.$s==="Rejected"?"#fca5a5":p.$s==="Verified"?"#93c5fd":"#fde047"};
  &::before{content:'';width:5px;height:5px;border-radius:50%;background:${p=>p.$s==="Approved"?"#16a34a":p.$s==="Rejected"?"#dc2626":p.$s==="Verified"?"#2563eb":"#ca8a04"};}
`

/* ── Table ── */
const TblWrap    = styled.div`overflow-x:auto;`
const Tbl        = styled.table`width:100%;border-collapse:collapse;font-size:0.8rem;`
const Th         = styled.th`background:#f8fafc;color:#374151;padding:10px 12px;text-align:left;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #e2e8f0;white-space:nowrap;`
const Td         = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;vertical-align:middle;`
const Tr         = styled.tr`transition:background .1s;&:hover{background:#fafafa;}`

/* ── Info pill ── */
const Pill = styled.span`background:#f0fdfa;color:#0f766e;padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:600;border:1px solid #a7f3d0;`

/* ── Modal ── */
const MOverlay   = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`

/* 
  FIX: Use css`` helper when interpolating a keyframe into a styled-component.
  In styled-components v4+, keyframes are injected on-demand and must be 
  wrapped with css`` to work correctly inside template strings.
*/
const MBox = styled.div`
  background:white;
  border-radius:12px;
  padding:28px 32px;
  max-width:460px;
  width:90%;
  box-shadow:0 20px 60px rgba(0,0,0,.2);
  ${css`animation:${fadeSlide} .18s ease forwards;`}
`

const MTitle     = styled.h3`margin:0 0 8px;font-size:1rem;font-weight:700;color:#111827;`
const MText      = styled.p`margin:0 0 16px;font-size:0.875rem;color:#6b7280;line-height:1.6;`

/* ── Search bar ── */
const SearchWrap = styled.div`display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:14px 18px;`

/* ── Tabs ── */
const TabRow     = styled.div`display:flex;gap:4px;`
const Tab        = styled.button`padding:7px 16px;border:none;border-radius:6px;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;background:${p=>p.$a?"white":"rgba(255,255,255,.18)"};color:${p=>p.$a?colors.primary:"white"};border:${p=>p.$a?"none":"1px solid rgba(255,255,255,.3)"};`

const colors = { primary:"#0d9488", danger:"#dc2626" }

/* 
  FIX: Same issue applied to the animated Card variant used in the form tab.
  Instead of passing the keyframe directly in an inline style (which doesn't
  work at all), we use a proper animated styled-component.
*/
const AnimatedCard = styled(Card)`
  ${css`animation:${fadeSlide} .25s ease;`}
`

/* ── Edit-reason modal ── */
const EditReasonModal = ({ onConfirm, onClose }) => {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const handleConfirm = () => { setTouched(true); if (!reason.trim()) return; onConfirm(reason.trim()) }
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✏️ Edit Requisition</MTitle>
        <MText>Please provide a reason for editing this requisition.</MText>
        <FGroup style={{ marginBottom: 18 }}>
          <Lbl>Reason for Edit <span style={{ color: "#dc2626" }}>*</span></Lbl>
          <Txt
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe what you changed and why…"
            style={{ borderColor: touched && !reason.trim() ? "#dc2626" : undefined }}
          />
          {touched && !reason.trim() && <ErrNote>Reason is required.</ErrNote>}
        </FGroup>
        <BtnRow style={{ justifyContent: "flex-end" }}>
          <SecondBtn onClick={onClose}>Cancel</SecondBtn>
          <PrimaryBtn onClick={handleConfirm}>Confirm &amp; Save</PrimaryBtn>
        </BtnRow>
      </MBox>
    </MOverlay>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const MedicineRequisition = () => {
  const [tab,        setTab]        = useState("form")   // "form" | "list"
  const [prList,     setPrList]     = useState([])
  const [editPr,     setEditPr]     = useState(null)     // null = new, object = editing
  const [saving,     setSaving]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [showReason, setShowReason] = useState(false)    // edit-reason modal
  const [pendingSave,setPendingSave]= useState(null)     // payload waiting for reason

  /* ── Medicine search ── */
  const [medSearch,    setMedSearch]    = useState("")
  const [medResults,   setMedResults]   = useState([])
  const [showMedDrop,  setShowMedDrop]  = useState(false)
  const medSearchRef = useRef(null)

  /* ── Form fields ── */
  const emptyForm = {
    medicine_name:"", item_id:"", chemical_composition:"",
    consultant_name:"", request_date: new Date().toISOString().slice(0,16),
    remarks:"",
  }
  const [form,  setForm]  = useState(emptyForm)
  const [errs,  setErrs]  = useState({})

  /* ── Search / filter ── */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")

  /* ── Close medicine dropdown on outside click ── */
  useEffect(() => {
    const h = e => { if (medSearchRef.current && !medSearchRef.current.contains(e.target)) setShowMedDrop(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  /* ── Fetch PR list ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const r = await apiRequest(`${baseUrl}medicine-requisition/`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch { toast.error("Failed to load requisitions") }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Medicine autocomplete ── */
  const searchMedicines = useCallback(async query => {
    if (!query || query.length < 2) { setMedResults([]); setShowMedDrop(false); return }
    try {
      const r = await apiRequest(`${baseUrl}medicine-requisition-medicine-search/?q=${encodeURIComponent(query)}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setMedResults(Array.isArray(rows) ? rows : [])
      setShowMedDrop(rows.length > 0)
    } catch { setMedResults([]) }
  }, [])

  const handleMedSearch = e => {
    const v = e.target.value
    setMedSearch(v)
    setForm(p => ({ ...p, medicine_name: v, item_id: "", chemical_composition: "" }))
    searchMedicines(v)
  }

  const selectMedicine = med => {
    setMedSearch(`${med.item_name}`)
    setForm(p => ({
      ...p,
      medicine_name:        med.item_name,
      item_id:              med.item_id,
      chemical_composition: med.chemical_composition || "",
    }))
    setShowMedDrop(false)
  }

  /* ── Validate ── */
  const validate = () => {
    const e = {}
    if (!form.medicine_name.trim())   e.medicine_name   = "Required"
    if (!form.consultant_name.trim()) e.consultant_name = "Required"
    if (!form.request_date)           e.request_date    = "Required"
    setErrs(e)
    return Object.keys(e).length === 0
  }

  /* ── Prepare payload ── */
  const buildPayload = (editedReason) => ({
    medicine_name:        form.medicine_name.trim(),
    item_id:              form.item_id || undefined,
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
      // Need edit reason — open modal first
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
      const url    = isEdit
        ? `${baseUrl}medicine-requisition/${editPr.pr_number}/`
        : `${baseUrl}medicine-requisition/`
      const method = isEdit ? "PUT" : "POST"
      const r      = await apiRequest(url, method, payload)
      if (r?.success) {
        toast.success(isEdit ? "Requisition updated" : `Draft created: ${r.data?.pr_number}`)
        resetForm()
        fetchList()
        setTab("list")
      } else {
        const err = r?.error
        toast.error(Array.isArray(err) ? err.join(", ") : (typeof err === "string" ? err : "Save failed"))
      }
    } catch { toast.error("Network error") }
    finally { setSaving(false) }
  }

  /* ── Edit ── */
  const handleEdit = pr => {
    if (pr.status === "Approved" || pr.status === "Rejected") {
      toast.warning(`Cannot edit a ${pr.status} requisition`)
      return
    }
    setEditPr(pr)
    setMedSearch(pr.medicine_name || "")
    setForm({
      medicine_name:        pr.medicine_name        || "",
      item_id:              pr.item_id              || "",
      chemical_composition: pr.chemical_composition || "",
      consultant_name:      pr.consultant_name      || "",
      request_date:         pr.request_date ? pr.request_date.slice(0,16) : "",
      remarks:              pr.remarks || "",
    })
    setErrs({})
    setTab("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Reset ── */
  const resetForm = () => {
    setEditPr(null)
    setForm(emptyForm)
    setMedSearch("")
    setMedResults([])
    setErrs({})
  }

  /* ── Filtered list ── */
  const filtered = prList.filter(r => {
    const q = searchQ.toLowerCase()
    const matchQ = !q ||
      (r.pr_number      || "").toLowerCase().includes(q) ||
      (r.medicine_name  || "").toLowerCase().includes(q) ||
      (r.consultant_name|| "").toLowerCase().includes(q)
    const matchS = !filterStat || r.status === filterStat
    return matchQ && matchS
  })

  /* ── Date formatter ── */
  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—" } catch { return "—" } }

  /* ─────────────────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <HLeft>
          <HTitle>📋 Purchase Requisition</HTitle>
          <HSubtitle>Raise &amp; manage medicine medicine requests</HSubtitle>
        </HLeft>
        <TabRow>
          <Tab $a={tab==="form"} onClick={()=>{ resetForm(); setTab("form") }}>+ New Request</Tab>
          <Tab $a={tab==="list"} onClick={()=>setTab("list")}>📄 My Requisitions</Tab>
        </TabRow>
      </Header>

      <Body>
        {/* ═══ FORM TAB ════════════════════════════════════════════════════ */}
        {tab === "form" && (
          // FIX: replaced inline style animation with AnimatedCard styled-component
          <AnimatedCard>
            <CardHead>
              {editPr ? `✏️ Edit Requisition — ${editPr.pr_number}` : "📝 New Purchase Requisition"}
              {editPr && <Badge $s={editPr.status}>{editPr.status}</Badge>}
            </CardHead>
            <CardBody>

              {/* Medicine */}
              <Grid cols="2fr 1fr">
                <FGroup>
                  <Lbl>Medicine Name <span style={{color:"#dc2626"}}>*</span></Lbl>
                  <AutoWrap ref={medSearchRef}>
                    <Inp
                      $err={!!errs.medicine_name}
                      value={medSearch}
                      onChange={handleMedSearch}
                      onFocus={() => medResults.length && setShowMedDrop(true)}
                      placeholder="Search medicine…"
                    />
                    {showMedDrop && medResults.length > 0 && (
                      <DropList>
                        {medResults.map(m => (
                          <DropItem key={m.item_id} onMouseDown={() => selectMedicine(m)}>
                            <strong>{m.item_name}</strong>
                            {m.chemical_composition && <DropSub>{m.chemical_composition.slice(0,50)}</DropSub>}
                          </DropItem>
                        ))}
                      </DropList>
                    )}
                  </AutoWrap>
                  {errs.medicine_name && <ErrNote>{errs.medicine_name}</ErrNote>}
                </FGroup>

              </Grid>

              {/* Chemical composition — auto-filled or manual */}
              <Grid cols="1fr">
                <FGroup>
                  <Lbl>Chemical Composition</Lbl>
                  <Inp
                    value={form.chemical_composition}
                    onChange={e => setForm(p=>({...p,chemical_composition:e.target.value}))}
                    placeholder="Auto-filled from medicine selection, or enter manually"
                  />
                </FGroup>
              </Grid>

              {/* Consultant & Date */}
              <Grid cols="1fr 1fr">
                <FGroup>
                  <Lbl>Consultant Name <span style={{color:"#dc2626"}}>*</span></Lbl>
                  <Inp
                    $err={!!errs.consultant_name}
                    value={form.consultant_name}
                    onChange={e => setForm(p=>({...p,consultant_name:e.target.value}))}
                    placeholder="Dr. Name"
                  />
                  {errs.consultant_name && <ErrNote>{errs.consultant_name}</ErrNote>}
                </FGroup>

                <FGroup>
                  <Lbl>Request Date &amp; Time <span style={{color:"#dc2626"}}>*</span></Lbl>
                  <Inp
                    $err={!!errs.request_date}
                    type="datetime-local"
                    value={form.request_date}
                    onChange={e => setForm(p=>({...p,request_date:e.target.value}))}
                  />
                  {errs.request_date && <ErrNote>{errs.request_date}</ErrNote>}
                </FGroup>
              </Grid>

              {/* Remarks */}
              <Grid cols="1fr" style={{marginBottom:0}}>
                <FGroup>
                  <Lbl>Remarks</Lbl>
                  <Txt
                    value={form.remarks}
                    onChange={e => setForm(p=>({...p,remarks:e.target.value}))}
                    placeholder="Any additional notes…"
                  />
                </FGroup>
              </Grid>

              <BtnRow style={{marginTop:18}}>
                <SecondBtn onClick={resetForm} disabled={saving}>✕ Clear</SecondBtn>
                <PrimaryBtn onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving…" : editPr ? "💾 Update Requisition" : "💾 Save as Draft"}
                </PrimaryBtn>
              </BtnRow>
            </CardBody>
          </AnimatedCard>
        )}

        {/* ═══ LIST TAB ════════════════════════════════════════════════════ */}
        {tab === "list" && (
          <Card>
            <CardHead>
              📄 Requisition Records
              <span style={{background:"#e5e7eb",color:"#6b7280",fontSize:"0.72rem",padding:"1px 8px",borderRadius:12,fontWeight:600}}>
                {prList.length}
              </span>
            </CardHead>

            {/* Filters */}
            <SearchWrap>
              <FGroup style={{flex:1,minWidth:200,margin:0}}>
                <Lbl>Search</Lbl>
                <Inp value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="PR No, Medicine, Consultant…" />
              </FGroup>
              <FGroup style={{minWidth:160,margin:0}}>
                <Lbl>Status</Lbl>
                <Sel value={filterStat} onChange={e=>setFilterStat(e.target.value)}>
                  <option value="">All Status</option>
                  {["Draft","Verified","Approved","Rejected"].map(s=><option key={s} value={s}>{s}</option>)}
                </Sel>
              </FGroup>
              <Btn onClick={fetchList} style={{background:"#0d9488",color:"white",alignSelf:"flex-end"}}>🔄 Refresh</Btn>
            </SearchWrap>

            <TblWrap>
              {loading ? (
                <div style={{textAlign:"center",padding:"40px",color:"#9ca3af",fontSize:"0.85rem"}}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{textAlign:"center",padding:"40px",color:"#9ca3af",fontSize:"0.85rem"}}>📭 No requisitions found</div>
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
                      <Th>Remarks</Th>
                      <Th style={{textAlign:"center"}}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const canEdit = r.status === "Draft" || r.status === "Verified"
                      return (
                        <Tr key={r.pr_number}>
                          <Td style={{color:"#9ca3af",fontSize:"0.72rem"}}>{idx+1}</Td>
                          <Td><Pill>{r.pr_number}</Pill></Td>
                          <Td style={{fontWeight:600,maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.medicine_name}</Td>
                          <Td style={{maxWidth:140,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#6b7280",fontSize:"0.78rem"}}>{r.chemical_composition||"—"}</Td>
                          <Td style={{whiteSpace:"nowrap"}}>{r.consultant_name||"—"}</Td>
                          <Td style={{whiteSpace:"nowrap",fontSize:"0.78rem"}}>{fmtDT(r.request_date)}</Td>
                          <Td><Badge $s={r.status}>{r.status}</Badge></Td>
                          <Td style={{maxWidth:120,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontSize:"0.78rem",color:"#6b7280"}}>{r.remarks||"—"}</Td>
                          <Td style={{textAlign:"center"}}>
                            {canEdit ? (
                              <OrangeBtn
                                style={{padding:"5px 14px",fontSize:"0.78rem"}}
                                onClick={() => handleEdit(r)}
                              >
                                ✏️ Edit
                              </OrangeBtn>
                            ) : (
                              <span style={{fontSize:"0.72rem",color:"#9ca3af",display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                                🔒 {r.status}
                              </span>
                            )}
                          </Td>
                        </Tr>
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
    </Wrap>
  )
}

export default MedicineRequisition