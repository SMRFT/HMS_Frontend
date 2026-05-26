import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL

/* ── Animations ── */
const fadeSlide = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`
const spin      = keyframes`to{transform:rotate(360deg)}`

/* ── Tokens (teal medical — matches PharmacyCategory) ── */
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
const HTitle  = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSub    = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body    = styled.div`max-width:1180px;margin:0 auto;padding:22px 20px;`

/* ── Tabs ── */
const TabRow = styled.div`display:flex;gap:4px;`
const Tab    = styled.button`
  padding:7px 18px;border-radius:6px;font-size:.82rem;font-weight:700;
  cursor:pointer;font-family:inherit;border:none;transition:all .14s;
  background:${p=>p.$a?"#fff":"rgba(255,255,255,.18)"};
  color:${p=>p.$a?C.primary:"#fff"};
  border:1px solid ${p=>p.$a?"transparent":"rgba(255,255,255,.3)"};
`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);`
const AniCard  = styled(Card)`${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;`
const CardBody = styled.div`padding:18px 20px;`

/* ── Grid ── */
const Grid = styled.div`
  display:grid;grid-template-columns:${p=>p.$cols||"repeat(2,1fr)"};gap:12px;margin-bottom:14px;
  @media(max-width:760px){grid-template-columns:1fr 1fr!important;}
  @media(max-width:500px){grid-template-columns:1fr!important;}
`

/* ── Form controls ── */
const FG  = styled.div`display:flex;flex-direction:column;gap:4px;`
const Lbl = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp = styled.input`
  padding:9px 12px;border:1.5px solid ${p=>p.$err?C.danger:C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
`
const Sel = styled.select`
  padding:9px 12px;border:1.5px solid ${p=>p.$err?C.danger:C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
`
const Txta = styled.textarea`
  padding:9px 12px;border:1.5px solid ${C.border};border-radius:7px;
  font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;resize:vertical;min-height:64px;font-family:inherit;
  transition:border-color .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const Err = styled.span`font-size:.68rem;color:${C.danger};margin-top:2px;`

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
const AmberBtn = styled(Btn)`background:${C.amber};color:#fff;&:hover:not(:disabled){background:${C.amberD};}`
const BtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Badge ── */
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
            placeholder="e.g. Updated quantity per revised indent…"
            style={{ borderColor: t && !r.trim() ? C.danger : undefined }}
          />
          {t && !r.trim() && <Err>Reason is required.</Err>}
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
const EMPTY_LINE = () => ({ _id: Date.now() + Math.random(), item_id: "", medicine_name: "", quantity: "1" })

export default function PurchaseOrder() {
  const [tab,         setTab]         = useState("form")
  const [vendors,     setVendors]     = useState([])
  const [poList,      setPoList]      = useState([])
  const [editPo,      setEditPo]      = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [showReason,  setShowReason]  = useState(false)
  const [pendingSave, setPendingSave] = useState(null)

  /* form */
  const [vendorId,  setVendorId]  = useState("")
  const [orderDate, setOrderDate] = useState("")          // read-only, server-set
  const [lines,     setLines]     = useState([EMPTY_LINE()])
  const [errs,      setErrs]      = useState({})

  /* list filters */
  const [searchQ,    setSearchQ]    = useState("")
  const [filterStat, setFilterStat] = useState("")
  const [fromDate,   setFromDate]   = useState("")
  const [toDate,     setToDate]     = useState("")

  /* view modal */
  const [viewPo, setViewPo] = useState(null)

  /* medicine autocomplete per row */
  const [medSearch,  setMedSearch]  = useState({})
  const [medResults, setMedResults] = useState({})
  const [showDrop,   setShowDrop]   = useState({})
  const dropRef = useRef(null)

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop({}) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  /* ── fetch vendors ── */
  const fetchVendors = useCallback(async () => {
    try {
      const r = await apiRequest(`${BASE}vendors/`, "GET")
      const list = Array.isArray(r?.data) ? r.data
        : Array.isArray(r?.data?.data) ? r.data.data
        : Array.isArray(r) ? r : []
      setVendors(list)
    } catch { toast.error("Failed to load vendors") }
  }, [])

  /* ── fetch PO list ── */
/* ── fetch PO list ── */
const fetchList = useCallback(async () => {
  setLoading(true)

  try {
    const params = new URLSearchParams()

    if (fromDate) params.append("from_date", fromDate)
    if (toDate) params.append("to_date", toDate)

    const qs = params.toString()

    const r = await apiRequest(
      `${BASE}purchase-order/${qs ? "?" + qs : ""}`,
      "GET"
    )

    const rows =
      r?.data?.data ??
      (Array.isArray(r?.data) ? r.data : [])

    /* ✅ normalize items safely */
    const normalized = (Array.isArray(rows) ? rows : []).map(po => {
      let parsedItems = []

      if (Array.isArray(po.items)) {
        parsedItems = po.items
      } else if (typeof po.items === "string") {
        try {
          const parsed = JSON.parse(po.items)
          parsedItems = Array.isArray(parsed) ? parsed : []
        } catch {
          parsedItems = []
        }
      }

      return {
        ...po,
        items: parsedItems,
      }
    })

    /* ✅ ONLY this */
    setPoList(normalized)

  } catch (err) {
    console.error(err)
    toast.error("Failed to load purchase orders")
  } finally {
    setLoading(false)
  }
}, [fromDate, toDate])

  useEffect(() => { fetchVendors(); fetchList() }, [fetchVendors, fetchList])

  /* ── medicine search for a line ── */
  const searchMeds = useCallback(async (lineId, query) => {
    if (!query || query.length < 2) {
      setMedResults(p => ({ ...p, [lineId]: [] }))
      setShowDrop(p   => ({ ...p, [lineId]: false }))
      return
    }
    try {
      const r    = await apiRequest(`${BASE}pharmacy-items/?q=${encodeURIComponent(query)}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setMedResults(p => ({ ...p, [lineId]: Array.isArray(rows) ? rows : [] }))
      setShowDrop(p   => ({ ...p, [lineId]: rows.length > 0 }))
    } catch { setMedResults(p => ({ ...p, [lineId]: [] })) }
  }, [])

  /* ── line handlers ── */
  const updateLine = (id, field, value) => {
    setLines(prev => prev.map(l => l._id !== id ? l : { ...l, [field]: value }))
  }

  const handleMedInput = (lineId, val) => {
    setMedSearch(p => ({ ...p, [lineId]: val }))
    updateLine(lineId, "medicine_name", val)
    updateLine(lineId, "item_id", "")
    searchMeds(lineId, val)
  }

  const selectMed = (lineId, med) => {
    const fullName = `${med.item_name || ""} ${med.item_last_name || ""}`.trim()
    setMedSearch(p => ({ ...p, [lineId]: fullName }))
    setLines(prev => prev.map(l => l._id === lineId
      ? { ...l, item_id: med.item_id, medicine_name: fullName }
      : l
    ))
    setShowDrop(p => ({ ...p, [lineId]: false }))
  }

  const addLine = () => {
    const nl = EMPTY_LINE()
    setLines(p => [...p, nl])
  }

  const removeLine = id => {
    if (lines.length === 1) { toast.warning("At least one item is required"); return }
    setLines(p => p.filter(l => l._id !== id))
    setMedSearch(p  => { const n = { ...p }; delete n[id]; return n })
    setMedResults(p => { const n = { ...p }; delete n[id]; return n })
    setShowDrop(p   => { const n = { ...p }; delete n[id]; return n })
  }

  /* ── validate ── */
  const validate = () => {
    const e = {}
    if (!vendorId) e.vendorId = "Required"
    lines.forEach((l, i) => {
      if (!l.medicine_name.trim()) e[`med_${i}`] = "Required"
      if (!l.quantity || Number(l.quantity) < 1) e[`qty_${i}`] = "Min 1"
    })
    setErrs(e)
    return Object.keys(e).length === 0
  }

  /* ── payload ── */
  const buildPayload = (editedReason) => {
    const vendorObj = vendors.find(v => String(v.vendor_id) === String(vendorId))
    return {
      vendor_id:   vendorId,
      vendor_name: vendorObj?.name || "",
      supplier:    vendorObj?.name || "",
      items: lines.map(l => ({
        item_id:       l.item_id || undefined,
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

  /* ── edit ── */
const handleEdit = po => {
  if (po.status === "Approved" || po.status === "Rejected") {
    toast.warning(`Cannot edit a ${po.status} Purchase Order`)
    return
  }

  // Ensure items is always array
  let items = []

  if (Array.isArray(po.items)) {
    items = po.items
  } else if (typeof po.items === "string") {
    try {
      items = JSON.parse(po.items)
    } catch {
      items = []
    }
  }

  setEditPo(po)
  setVendorId(String(po.vendor_id || ""))
  setOrderDate(po.order_date || po.created_date || "")

  const loadedLines = items.map(it => ({
    _id: Date.now() + Math.random(),
    item_id: it.item_id || "",
    medicine_name: it.medicine_name || "",
    quantity: String(it.quantity || 1),
  }))

  setLines(loadedLines.length ? loadedLines : [EMPTY_LINE()])

  const ms = {}
  loadedLines.forEach(l => {
    ms[l._id] = l.medicine_name
  })

  setMedSearch(ms)
  setErrs({})
  setTab("form")

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

  /* ── reset ── */
  const resetForm = () => {
    setEditPo(null)
    setVendorId(""); setOrderDate("")
    setLines([EMPTY_LINE()])
    setMedSearch({}); setMedResults({}); setShowDrop({})
    setErrs({})
  }

  /* ── filtered ── */
  const filtered = poList.filter(r => {
    const q  = searchQ.toLowerCase()
    const ok = !q ||
      (r.po_number   || "").toLowerCase().includes(q) ||
      (r.vendor_name || "").toLowerCase().includes(q) ||
      (r.supplier    || "").toLowerCase().includes(q)
    return ok && (!filterStat || r.status === filterStat)
  })

  const fmtDT = d => {
    try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" }
    catch { return "—" }
  }
  const fmtD = d => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—" } catch { return "—" } }

  /* ── current datetime string for display (disabled field) ── */
  const nowDisplay = new Date().toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })

  /* ─── RENDER ─── */
  return (
    <Wrap>
      {/* Header */}
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

        {/* ═══ FORM ═══════════════════════════════════════════════════════ */}
        {tab === "form" && (
          <>
            {/* ── Header info card ── */}
            <AniCard>
              <CardHead>
                {editPo ? `✏️ Edit Purchase Order — ${editPo.po_number}` : "📝 New Purchase Order"}
                {editPo && <Badge $s={editPo.status}>{editPo.status}</Badge>}
              </CardHead>
              <CardBody>

                {/* Vendor (common for whole PO) */}
                <Grid $cols="1fr 1fr">
                  <FG>
                    <Lbl>Vendor <span style={{ color: C.danger }}>*</span></Lbl>
                    <Sel
                      $err={!!errs.vendorId}
                      value={vendorId}
                      onChange={e => setVendorId(e.target.value)}
                    >
                      <option value="">— Select Vendor —</option>
                      {vendors.map(v => (
                        <option key={v.vendor_id} value={String(v.vendor_id)}>
                          {v.name}
                        </option>
                      ))}
                    </Sel>
                    {errs.vendorId && <Err>{errs.vendorId}</Err>}
                  </FG>

                  {/* Order date — server-side datetime, shown read-only */}
                  <FG>
                    <Lbl>Order Date &amp; Time</Lbl>
                    <Inp
                      value={editPo ? fmtDT(editPo.created_date) : nowDisplay}
                      disabled
                      style={{ background: C.faint, color: C.muted, cursor: "not-allowed" }}
                    />
                  </FG>
                </Grid>

              </CardBody>
            </AniCard>

            {/* ── Medicine line items card ── */}
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
                                onFocus={() => (medResults[line._id] || []).length && setShowDrop(p => ({ ...p, [line._id]: true }))}
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
                                        {m.hsn && <span style={{ color: C.muted, marginLeft: 6, fontSize: ".72rem" }}>HSN: {m.hsn}</span>}
                                      </DropRow>
                                    )
                                  })}
                                </Drop>
                              )}
                            </AutoWrap>
                            {errs[`med_${idx}`] && <Err>{errs[`med_${idx}`]}</Err>}
                          </LTd>

                          {/* Quantity */}
                          <LTd>
                            <Inp
                              $err={!!errs[`qty_${idx}`]}
                              type="number" min="1"
                              value={line.quantity}
                              onChange={e => updateLine(line._id, "quantity", e.target.value)}
                              style={{ width: "100%" }}
                            />
                            {errs[`qty_${idx}`] && <Err>{errs[`qty_${idx}`]}</Err>}
                          </LTd>

                          <LTd>
                            <DelB onClick={() => removeLine(line._id)} title="Remove line">✕</DelB>
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

        {/* ═══ LIST ═══════════════════════════════════════════════════════ */}
        {tab === "list" && (
          <Card>
            <CardHead>
              📄 Purchase Orders
              <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".7rem", padding: "1px 8px", borderRadius: 12, fontWeight: 700 }}>
                {poList.length}
              </span>
            </CardHead>

            <FBar>
              <FG style={{ flex: 1, minWidth: 200, margin: 0 }}>
                <Lbl>Search</Lbl>
                <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="PO No, Vendor…" />
              </FG>
              <FG style={{ minWidth: 155, margin: 0 }}>
                <Lbl>Status</Lbl>
                <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                  <option value="">All Status</option>
                  {["Draft", "Verified", "Approved", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                </Sel>
              </FG>
              <FG style={{ margin: 0 }}>
                <Lbl>From Date</Lbl>
                <Inp type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: "auto" }} />
              </FG>
              <FG style={{ margin: 0 }}>
                <Lbl>To Date</Lbl>
                <Inp type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: "auto" }} />
              </FG>
              <Btn
                onClick={fetchList}
                style={{ background: C.primary, color: "#fff", alignSelf: "flex-end", padding: "9px 16px", fontSize: ".82rem", border: "none" }}
              >
                🔍 Search
              </Btn>
            </FBar>

            <TblWrap>
              {loading ? (
                <div style={{ textAlign: "center", padding: "44px", color: C.muted, fontSize: ".85rem" }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "44px", color: C.muted, fontSize: ".85rem" }}>📭 No purchase orders found</div>
              ) : (
                <Tbl>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>PO No</Th>
                      <Th>Vendor</Th>
                      <Th>Medicines</Th>
                      <Th>Order Date</Th>
                      <Th>Status</Th>
                      <Th>Approved By</Th>
                      <Th>Rejected By</Th>
                      <Th style={{ textAlign: "center" }}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((po, idx) => {
                      const canEdit = po.status === "Draft" || po.status === "Verified"
                      return (
                        <Trow key={po.po_number}>
                          <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                          <Td><Pill>{po.po_number}</Pill></Td>
                          <Td style={{ fontWeight: 700 }}>{po.vendor_name || po.vendor_id || "—"}</Td>
                          <Td>
                            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 9px", borderRadius: 10, fontSize: ".7rem", fontWeight: 800 }}>
                              {(Array.isArray(po.items) ? po.items : []).length} item{(Array.isArray(po.items) ? po.items : []).length !== 1 ? "s" : ""}
                            </span>
                          </Td>
                          <Td style={{ fontSize: ".78rem", color: C.muted, whiteSpace: "nowrap" }}>{fmtDT(po.created_date)}</Td>
                          <Td><Badge $s={po.status}>{po.status}</Badge></Td>
                          <Td style={{ fontSize: ".78rem" }}>
                            {po.status === "Approved" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "#166534" }}>✔ {po.approved_by_name || po.approved_by || "—"}</span>
                                <span style={{ color: C.muted, fontSize: ".72rem" }}>{fmtDT(po.approved_date)}</span>
                              </div>
                            ) : "—"}
                          </Td>
                          <Td style={{ fontSize: ".78rem" }}>
                            {po.status === "Rejected" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: C.danger }}>✕ {po.rejected_by_name || po.rejected_by || "—"}</span>
                                <span style={{ color: C.muted, fontSize: ".72rem" }}>{fmtDT(po.rejected_date)}</span>
                                {po.rejected_reason && (
                                  <span
                                    title={po.rejected_reason}
                                    style={{ fontSize: ".7rem", color: C.danger, background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 6px", maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
                                  >
                                    {po.rejected_reason}
                                  </span>
                                )}
                              </div>
                            ) : "—"}
                          </Td>
                          <Td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "nowrap" }}>
                              <SecBtn style={{ padding: "5px 12px", fontSize: ".78rem" }} onClick={() => setViewPo(po)}>
                                👁 View
                              </SecBtn>
                              {canEdit ? (
                                <AmberBtn style={{ padding: "5px 14px", fontSize: ".78rem" }} onClick={() => handleEdit(po)}>
                                  ✏️ Edit
                                </AmberBtn>
                              ) : (
                                <span style={{ fontSize: ".72rem", color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                                  🔒 {po.status}
                                </span>
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
        )}
      </Body>

      {showReason && (
        <EditReasonModal
          onConfirm={handleReasonConfirm}
          onClose={() => { setShowReason(false); setPendingSave(null) }}
        />
      )}

      {/* ── View Medicine Items Modal ── */}
      {viewPo && (
        <MOverlay onClick={() => setViewPo(null)}>
          <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 580, width: "95%" }}>
            {/* Header */}
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

            {/* Items table */}
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
                  {(Array.isArray(viewPo.items) ? viewPo.items : []).length === 0 ? (
                    <LTr>
                      <LTd colSpan={3} style={{ textAlign: "center", color: C.muted, padding: "20px" }}>No items found</LTd>
                    </LTr>
                  ) : (Array.isArray(viewPo.items) ? viewPo.items : []).map((it, i) => (
                    <LTr key={i}>
                      <LTd style={{ color: C.muted, fontSize: ".72rem", fontWeight: 700 }}>{i + 1}</LTd>
                      <LTd style={{ fontWeight: 600 }}>{it.medicine_name || "—"}</LTd>
                      <LTd style={{ fontWeight: 800, color: C.primary, textAlign: "right" }}>{it.quantity}</LTd>
                    </LTr>
                  ))}
                </tbody>
              </LineTable>
            </div>

            {/* Summary */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "8px 12px", background: C.pLight, borderRadius: 7, border: `1px solid ${C.pBorder}` }}>
              <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                Total Items: {(Array.isArray(viewPo.items) ? viewPo.items : []).length}
              </span>
              <span style={{ fontSize: ".78rem", color: C.pDark, fontWeight: 700 }}>
                Total Qty: {(Array.isArray(viewPo.items) ? viewPo.items : []).reduce(
                (s, it) => s + (Number(it.quantity) || 0),
                0
                )}
              </span>
            </div>

            <BtnRow style={{ marginTop: 14 }}>
              <SecBtn onClick={() => setViewPo(null)}>Close</SecBtn>
            </BtnRow>
          </MBox>
        </MOverlay>
      )}
    </Wrap>
  )
}