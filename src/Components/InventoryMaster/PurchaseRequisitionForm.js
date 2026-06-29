import React, { useState, useEffect, useCallback, useRef } from "react"
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
}

/* ── Layout ── */
const Wrap   = styled.div`min-height:100vh;background:${C.bg};padding-bottom:48px;font-family:'DM Sans',system-ui,sans-serif;`
const Header = styled.div`
  background:linear-gradient(135deg,${C.primary} 0%,${C.pDark} 100%);
  color:#fff;padding:18px 28px;
  box-shadow:0 4px 20px rgba(13,148,136,.25);
`
const HTitle = styled.h1`margin:0;font-size:1.2rem;font-weight:800;letter-spacing:-.02em;`
const HSub   = styled.p`margin:3px 0 0;font-size:.75rem;opacity:.82;`
const Body   = styled.div`max-width:900px;margin:0 auto;padding:22px 20px;`

/* ── Card ── */
const Card     = styled.div`background:${C.surface};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.06);`
const AniCard  = styled(Card)`${css`animation:${fadeSlide} .22s ease;`}`
const CardHead = styled.div`background:${C.faint};border-bottom:1px solid ${C.border};padding:12px 18px;font-size:.82rem;font-weight:800;color:${C.primary};display:flex;align-items:center;justify-content:space-between;`
const CardBody = styled.div`padding:18px 20px;`

/* ── Form controls ── */
const FG     = styled.div`display:flex;flex-direction:column;gap:4px;position:relative;`
const Lbl    = styled.label`font-size:.7rem;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.05em;`
const Inp    = styled.input`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
  &:disabled{background:${C.faint};color:${C.muted};cursor:not-allowed;}
`
const Textarea = styled.textarea`
  padding:9px 12px;border:1.5px solid ${p => p.$err ? C.danger : C.border};
  border-radius:7px;font-size:.875rem;color:${C.text};outline:none;width:100%;
  box-sizing:border-box;font-family:inherit;background:#fff;transition:border-color .14s,box-shadow .14s;
  resize:vertical;min-height:70px;
  &:focus{border-color:${C.primary};box-shadow:0 0 0 3px rgba(13,148,136,.1);}
`
const ErrMsg = styled.span`font-size:.68rem;color:${C.danger};margin-top:2px;`

/* ── Medicine dropdown ── */
const DropList = styled.ul`
  position:absolute;top:calc(100% + 2px);left:0;right:0;z-index:200;
  background:#fff;border:1.5px solid ${C.primary};border-radius:8px;
  list-style:none;margin:0;padding:4px;
  max-height:220px;overflow-y:auto;
  box-shadow:0 8px 24px rgba(0,0,0,.12);
  ${css`animation:${fadeSlide} .13s ease;`}
`
const DropItem = styled.li`
  padding:8px 12px;border-radius:6px;cursor:pointer;font-size:.82rem;
  transition:background .1s;
  &:hover{background:${C.pLight};color:${C.pDark};}
`
const DropName = styled.div`font-weight:700;color:${C.text};`
const DropSub  = styled.div`font-size:.7rem;color:${C.muted};margin-top:1px;`

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
const DangerBtn = styled(Btn)`background:#fff;color:${C.danger};border:1.5px solid #fca5a5;&:hover:not(:disabled){background:#fee2e2;}`
const BtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:20px;border-top:1px solid ${C.border};padding-top:16px;`

/* ── Badge / Pill ── */
const Badge = styled.span`
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:800;
  background:${p =>
    p.$s==="Approved"?"#dcfce7":
    p.$s==="Rejected"?"#fee2e2":
    p.$s==="Verified"?"#dbeafe":
    p.$s==="Purchase Order Initiated"?"#ede9fe":
    p.$s==="Purchased"?"#fef3c7":
    p.$s==="Stock Restocked"?"#d1fae5":"#fef9c3"
  };
  color:${p =>
    p.$s==="Approved"?"#166534":
    p.$s==="Rejected"?"#991b1b":
    p.$s==="Verified"?"#1d4ed8":
    p.$s==="Purchase Order Initiated"?"#5b21b6":
    p.$s==="Purchased"?"#92400e":
    p.$s==="Stock Restocked"?"#065f46":"#92400e"
  };
  border:1px solid ${p =>
    p.$s==="Approved"?"#86efac":
    p.$s==="Rejected"?"#fca5a5":
    p.$s==="Verified"?"#93c5fd":
    p.$s==="Purchase Order Initiated"?"#c4b5fd":
    p.$s==="Purchased"?"#fde68a":
    p.$s==="Stock Restocked"?"#6ee7b7":"#fde68a"
  };
  &::before{content:'';width:5px;height:5px;border-radius:50%;
    background:${p =>
      p.$s==="Approved"?"#16a34a":
      p.$s==="Rejected"?"#dc2626":
      p.$s==="Verified"?"#2563eb":
      p.$s==="Purchase Order Initiated"?"#7c3aed":
      p.$s==="Purchased"?"#d97706":
      p.$s==="Stock Restocked"?"#059669":"#d97706"
    };}
`
const Pill = styled.span`background:${C.pLight};color:${C.pDark};padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;border:1px solid ${C.pBorder};font-family:monospace;`

/* ── Items table ── */
const TblWrap = styled.div`overflow-x:auto;border-radius:8px;border:1px solid ${C.border};`
const Tbl     = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`
const Th      = styled.th`background:${C.faint};color:${C.muted};padding:10px 12px;text-align:left;font-size:.69rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid ${C.border};white-space:nowrap;`
const Td      = styled.td`padding:10px 12px;border-bottom:1px solid #f1f5f9;color:${C.text};vertical-align:middle;`
const Trow    = styled.tr`transition:background .1s;&:hover{background:#fafafa;}&:last-child td{border-bottom:none;}`

/* ── Spin ── */
const Spin = styled.span`display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;${css`animation:${spin} .6s linear infinite;`}`

/* ── Add-item row ── */
const AddRow = styled.div`display:flex;gap:10px;align-items:flex-end;padding:14px 16px;background:${C.pLight};border-top:1px solid ${C.pBorder};`

/* ── Modal ── */
const MOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;`
const MBox     = styled.div`background:#fff;border-radius:12px;padding:28px 32px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.22);${css`animation:${fadeSlide} .18s ease forwards;`}`
const MTitle   = styled.h3`margin:0 0 14px;font-size:1rem;font-weight:800;color:${C.text};`

/* ── List table ── */
const ListTblWrap = styled.div`overflow-x:auto;`
const ListTbl = styled.table`width:100%;border-collapse:collapse;font-size:.8rem;`

/* ══════════════════════════════════════════════════════
   MEDICINE SEARCH FIELD
══════════════════════════════════════════════════════ */
const MedicineSearchField = ({ value, onChange, fromOutlet, err, placeholder }) => {
  const [inputVal, setInputVal]   = useState(value || "")
  const [results,  setResults]    = useState([])
  const [showDrop, setShowDrop]   = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const debounce  = useRef(null)
  const wrapRef   = useRef(null)

  useEffect(() => { setInputVal(value || "") }, [value])

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setShowDrop(false); return }
    try {
      const params = new URLSearchParams({ search: q })
      if (fromOutlet) params.append("outlet_code", fromOutlet)
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET")
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      const seen = new Set()
      const unique = raw.filter(s => { if (seen.has(s.item_id)) return false; seen.add(s.item_id); return true })
      setResults(unique)
      setShowDrop(unique.length > 0)
    } catch {
      setResults([]); setShowDrop(false)
    }
  }, [fromOutlet])

  const handleChange = (val) => {
    setInputVal(val)
    setSelectedItem(null)
    onChange({ name: val, item: null })
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(val), 280)
  }

  const handleSelect = (stock) => {
    const name = stock.item_name || stock.medicine_name || stock.name || ""
    setInputVal(name)
    setShowDrop(false)
    setResults([])
    setSelectedItem(stock)
    onChange({ name, item: stock })
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1 }}>
      <Inp
        $err={!!err}
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { if (results.length) setShowDrop(true) }}
        placeholder={placeholder || "Type to search medicine…"}
        autoComplete="off"
      />
      {showDrop && (
        <DropList>
          {results.map((s, i) => (
            <DropItem key={s.item_id || i} onMouseDown={() => handleSelect(s)}>
              <DropName>{s.item_name || s.medicine_name || s.name}</DropName>
              <DropSub>{[s.item_code || s.code, s.strength, s.category].filter(Boolean).join(" · ")}</DropSub>
            </DropItem>
          ))}
        </DropList>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   VIEW DETAIL MODAL
══════════════════════════════════════════════════════ */
const ViewModal = ({ pr, onClose }) => {
  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  const items = Array.isArray(pr.items) ? pr.items : []

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: "95%", padding: 0, overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.pDark})`, color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>{pr.pr_number}</div>
            <div style={{ fontSize: ".75rem", opacity: .82, marginTop: 2 }}>Created {fmtDT(pr.created_date)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge $s={pr.status}>{pr.status}</Badge>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "20px 22px", maxHeight: "75vh", overflowY: "auto" }}>

          {/* Items */}
          <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>💊 Medicine Items</div>
          {items.length === 0 ? (
            <div style={{ color: C.muted, fontSize: ".82rem", padding: "10px 0" }}>No items</div>
          ) : (
            <TblWrap style={{ marginBottom: 16 }}>
              <Tbl>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Medicine Name</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <Trow key={idx}>
                      <Td style={{ color: C.muted, fontSize: ".72rem", width: 40 }}>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{item.medicine_name || "—"}</Td>
                    </Trow>
                  ))}
                </tbody>
              </Tbl>
            </TblWrap>
          )}

          {/* Approval */}
          {pr.status === "Approved" && (
            <>
              <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, margin: "14px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>✔ Approval</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Approved By</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600, color: "#166534" }}>{pr.approved_by_name || pr.approved_by || "—"}</div>
                </div>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Approved Date</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{fmtDT(pr.approved_date)}</div>
                </div>
              </div>
            </>
          )}

          {/* Rejection */}
          {pr.status === "Rejected" && (
            <>
              <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, margin: "14px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>✕ Rejection</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Rejected By</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600, color: C.danger }}>{pr.rejected_by_name || pr.rejected_by || "—"}</div>
                </div>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Rejected Date</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{fmtDT(pr.rejected_date)}</div>
                </div>
              </div>
              <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Reason</div>
                <div style={{ fontSize: ".85rem", fontWeight: 400, color: C.danger }}>{pr.rejected_reason || "—"}</div>
              </div>
            </>
          )}

          {/* Edit audit */}
          {pr.edited_by && (
            <>
              <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, margin: "14px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>✏️ Last Edit</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Edited By</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{pr.edited_by_name || pr.edited_by}</div>
                </div>
                <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Edited Date</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{fmtDT(pr.edited_date)}</div>
                </div>
              </div>
              <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Edit Reason</div>
                <div style={{ fontSize: ".85rem", fontWeight: 400, color: C.muted }}>{pr.edited_reason || "—"}</div>
              </div>
            </>
          )}

          {/* Audit */}
          <div style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, margin: "14px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>📅 Audit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Created By</div>
              <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{pr.created_by_name || pr.created_by || "—"}</div>
            </div>
            <div style={{ background: C.faint, borderRadius: 7, padding: "9px 12px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>Created Date</div>
              <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{fmtDT(pr.created_date)}</div>
            </div>
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
   EDIT REASON MODAL (required on PUT)
══════════════════════════════════════════════════════ */
const EditReasonModal = ({ onConfirm, onClose, saving }) => {
  const [reason, setReason] = useState("")
  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        <MTitle>✏️ Edit Reason</MTitle>
        <p style={{ margin: "0 0 12px", fontSize: ".83rem", color: C.muted }}>Please provide a reason for editing this requisition.</p>
        <FG>
          <Lbl>Reason <span style={{ color: C.danger }}>*</span></Lbl>
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe what changed and why…"
          />
        </FG>
        <BtnRow>
          <SecBtn onClick={onClose} disabled={saving}>Cancel</SecBtn>
          <PrimBtn onClick={() => onConfirm(reason)} disabled={saving || !reason.trim()}>
            {saving ? <><Spin /> Saving…</> : "💾 Save Changes"}
          </PrimBtn>
        </BtnRow>
      </MBox>
    </MOverlay>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function PurchaseRequisition() {
  const [tab,         setTab]         = useState("form")
  const [prList,      setPrList]      = useState([])
  const [editPr,      setEditPr]      = useState(null)
  const [items,       setItems]       = useState([])          // [{ item_id, medicine_name }]
  const [addInput,    setAddInput]    = useState({ name: "", item: null })
  const [addErr,      setAddErr]      = useState("")
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [viewPr,      setViewPr]      = useState(null)
  const [showEditReason, setShowEditReason] = useState(false)
  const [itemsErr,    setItemsErr]    = useState("")
  const addFieldKey = useRef(0)         // force-reset the medicine search input

  const fromOutlet = localStorage.getItem("outlet_code") || null

  /* ── Fetch list ── */
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const r = await apiRequest(`${HmsBaseUrl}purchase-requisition/`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch {
      toast.error("Failed to load requisitions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Add item to staging list ── */
  const handleAddItem = () => {
    const name = addInput.name.trim()
    if (!name) { setAddErr("Please select or type a medicine name"); return }
    setAddErr("")
    setItems(prev => [...prev, { item_id: addInput.item?.item_id || null, medicine_name: name }])
    setAddInput({ name: "", item: null })
    addFieldKey.current += 1
    setItemsErr("")
  }

  /* ── Remove item from staging list ── */
  const handleRemoveItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  /* ── Perform save (POST or PUT) ── */
  const doSave = async (editedReason) => {
    if (items.length === 0) { setItemsErr("Add at least one medicine"); return }
    setItemsErr("")
    setSaving(true)
    try {
      const isEdit = !!editPr
      const url    = isEdit ? `${HmsBaseUrl}purchase-requisition/${editPr.pr_number}/` : `${HmsBaseUrl}purchase-requisition/`
      const method = isEdit ? "PUT" : "POST"
      const payload = { items }
      if (isEdit) payload.edited_reason = editedReason

      const r = await apiRequest(url, method, payload)
      if (r?.success) {
        toast.success(isEdit ? "Requisition updated" : `Created: ${r.data?.pr_number}`)
        resetForm()
        fetchList()
        setTab("list")
        setShowEditReason(false)
      } else {
        const errMsg = r?.error
        toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : typeof errMsg === "string" ? errMsg : "Save failed")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  /* ── Submit handler ── */
  const handleSubmit = () => {
    if (items.length === 0) { setItemsErr("Add at least one medicine"); return }
    if (editPr) {
      setShowEditReason(true)
    } else {
      doSave(null)
    }
  }

  /* ── Load into edit ── */
  const handleEdit = pr => {
    if (pr.status !== "Draft") {
      toast.warning(`Cannot edit a ${pr.status} requisition`)
      return
    }
    setEditPr(pr)
    setItems(Array.isArray(pr.items) ? pr.items : [])
    setItemsErr("")
    setAddErr("")
    setAddInput({ name: "", item: null })
    addFieldKey.current += 1
    setTab("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Reset ── */
  const resetForm = () => {
    setEditPr(null)
    setItems([])
    setAddInput({ name: "", item: null })
    setAddErr("")
    setItemsErr("")
    addFieldKey.current += 1
  }

  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  /* ─────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <HTitle>💊 Purchase Requisition</HTitle>
        <HSub>Request medicines for pharmacy stock</HSub>
      </Header>

      <Body>
        {/* ═══ FORM TAB ═══════════════════════════════════════════ */}
        {tab === "form" && (
          <AniCard>
            <CardHead>
              <span>{editPr ? `✏️ Edit — ${editPr.pr_number}` : "📝 New Requisition"}</span>
              {editPr && <Badge $s={editPr.status}>{editPr.status}</Badge>}
            </CardHead>
            <CardBody>

              {/* ── Items table ── */}
              <div style={{ marginBottom: 16 }}>
                <Lbl style={{ display: "block", marginBottom: 8 }}>
                  Medicine Items <span style={{ color: C.danger }}>*</span>
                  <span style={{ marginLeft: 8, background: C.pLight, color: C.pDark, padding: "1px 8px", borderRadius: 12, fontSize: ".68rem", fontWeight: 700, border: `1px solid ${C.pBorder}` }}>
                    {items.length} added
                  </span>
                </Lbl>

                <TblWrap>
                  {items.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "28px 16px", color: C.muted, fontSize: ".82rem" }}>
                      No medicines added yet. Use the field below to add.
                    </div>
                  ) : (
                    <Tbl>
                      <thead>
                        <tr>
                          <Th style={{ width: 40 }}>#</Th>
                          <Th>Medicine Name</Th>
                          <Th style={{ width: 80, textAlign: "center" }}>Remove</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <Trow key={idx}>
                            <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                            <Td style={{ fontWeight: 600 }}>{item.medicine_name}</Td>
                            <Td style={{ textAlign: "center" }}>
                              <DangerBtn
                                style={{ padding: "4px 10px", fontSize: ".72rem" }}
                                onClick={() => handleRemoveItem(idx)}
                              >
                                ✕
                              </DangerBtn>
                            </Td>
                          </Trow>
                        ))}
                      </tbody>
                    </Tbl>
                  )}

                  {/* Add item row */}
                  <AddRow>
                    <MedicineSearchField
                      key={addFieldKey.current}
                      value={addInput.name}
                      fromOutlet={fromOutlet}
                      err={addErr}
                      placeholder="Search and select medicine…"
                      onChange={val => setAddInput({ name: val.name, item: val.item })}
                    />
                    <PrimBtn
                      style={{ padding: "9px 18px", whiteSpace: "nowrap", flexShrink: 0 }}
                      onClick={handleAddItem}
                    >
                      + Add
                    </PrimBtn>
                  </AddRow>
                  {addErr && <div style={{ padding: "4px 16px 8px", fontSize: ".68rem", color: C.danger }}>{addErr}</div>}
                </TblWrap>
                {itemsErr && <ErrMsg style={{ display: "block", marginTop: 6 }}>{itemsErr}</ErrMsg>}
              </div>

              <BtnRow>
                <SecBtn onClick={resetForm} disabled={saving}>✕ Clear</SecBtn>
                <PrimBtn onClick={handleSubmit} disabled={saving}>
                  {saving ? <><Spin /> Saving…</> : editPr ? "💾 Update" : "💾 Create"}
                </PrimBtn>
              </BtnRow>
            </CardBody>
          </AniCard>
        )}

        {/* ═══ LIST TAB ════════════════════════════════════════════ */}
        {tab === "list" && (
          <Card>
            <CardHead>
              <span>📄 My Requisitions</span>
              <span style={{ background: "#e5e7eb", color: C.muted, fontSize: ".72rem", padding: "1px 8px", borderRadius: 12, fontWeight: 600 }}>
                {prList.length}
              </span>
            </CardHead>

            <ListTblWrap>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: ".85rem" }}>Loading…</div>
              ) : prList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: ".85rem" }}>📭 No requisitions found</div>
              ) : (
                <ListTbl>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>PR No</Th>
                      <Th>Items</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th style={{ textAlign: "center" }}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {prList.map((r, idx) => {
                      const itemList  = Array.isArray(r.items) ? r.items : []
                      const canEdit   = r.status === "Draft"
                      const firstItem = itemList[0]?.medicine_name || "—"
                      const more      = itemList.length > 1 ? ` +${itemList.length - 1} more` : ""
                      return (
                        <Trow key={r.pr_number}>
                          <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                          <Td><Pill>{r.pr_number}</Pill></Td>
                          <Td style={{ fontWeight: 600, fontSize: ".82rem" }}>
                            {firstItem}
                            {more && <span style={{ color: C.muted, fontWeight: 400 }}>{more}</span>}
                          </Td>
                          <Td><Badge $s={r.status}>{r.status}</Badge></Td>
                          <Td style={{ fontSize: ".78rem" }}>{fmtDT(r.created_date)}</Td>
                          <Td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            <SecBtn
                              style={{ padding: "5px 12px", fontSize: ".75rem" }}
                              onClick={() => setViewPr(r)}
                            >
                              👁 View
                            </SecBtn>
                            {canEdit && (
                              <SecBtn
                                style={{ padding: "5px 12px", fontSize: ".75rem", marginLeft: 4 }}
                                onClick={() => handleEdit(r)}
                              >
                                ✏️ Edit
                              </SecBtn>
                            )}
                          </Td>
                        </Trow>
                      )
                    })}
                  </tbody>
                </ListTbl>
              )}
            </ListTblWrap>
          </Card>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <PrimBtn
            onClick={() => { resetForm(); setTab("form") }}
            style={{ padding: "7px 18px", fontSize: ".8rem", background: tab === "form" ? C.primary : C.pLight, color: tab === "form" ? "#fff" : C.primary }}
          >
            {tab === "form" ? "✓ Form" : "+ New"}
          </PrimBtn>
          <PrimBtn
            onClick={() => setTab("list")}
            style={{ padding: "7px 18px", fontSize: ".8rem", background: tab === "list" ? C.primary : C.pLight, color: tab === "list" ? "#fff" : C.primary }}
          >
            {tab === "list" ? "✓ List" : "📄 My List"}
          </PrimBtn>
        </div>
      </Body>

      {/* View detail modal */}
      {viewPr && <ViewModal pr={viewPr} onClose={() => setViewPr(null)} />}

      {/* Edit reason modal */}
      {showEditReason && (
        <EditReasonModal
          saving={saving}
          onClose={() => setShowEditReason(false)}
          onConfirm={(reason) => doSave(reason)}
        />
      )}
    </Wrap>
  )
}