import React, { useState, useEffect, useCallback, useRef } from "react"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import styled, { keyframes, css } from "styled-components"

const BASE     = process.env.REACT_APP_BACKEND_HMS_BASE_URL
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
const Body   = styled.div`max-width:1100px;margin:0 auto;padding:22px 20px;`

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
const FG     = styled.div`display:flex;flex-direction:column;gap:4px;position:relative;`
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
const DangerBtn= styled(Btn)`background:#fee2e2;color:${C.danger};border:1px solid #fca5a5;&:hover:not(:disabled){background:#fecaca;}`
const BtnRow   = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:6px;`

/* ── Item card ── */
const ItemCard  = styled.div`
  border:1.5px solid ${C.border};border-radius:8px;padding:16px;margin-bottom:12px;
  background:${C.faint};position:relative;
  transition:border-color .14s;
  &:hover{border-color:${C.pBorder};}
`
const ItemBadge = styled.div`
  position:absolute;top:-10px;left:14px;background:${C.primary};color:#fff;
  font-size:.65rem;font-weight:800;padding:2px 8px;border-radius:10px;letter-spacing:.04em;
`

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

/* ── Badge / Pill ── */
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

/* ── Section divider ── */
const SecDiv = styled.div`
  font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;
  color:${C.primary};margin:18px 0 10px;padding-bottom:5px;
  border-bottom:1.5px solid ${C.border};display:flex;align-items:center;gap:6px;
`

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
            placeholder="e.g. Corrected quantity per updated stock count…"
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

  const items = Array.isArray(pr.items) ? pr.items : []

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: "95%", padding: 0, overflow: "hidden" }}>
        {/* header */}
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.pDark})`, color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>{pr.pr_number}</div>
            <div style={{ fontSize: ".75rem", opacity: .82, marginTop: 2 }}>{pr.department} — {pr.requested_by}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge $s={pr.status}>{pr.status}</Badge>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "20px 22px", maxHeight: "75vh", overflowY: "auto" }}>
          <DSec>📋 Requisition Details</DSec>
          <DRow>
            <DField><DLbl>PR Number</DLbl><DVal><Pill>{pr.pr_number}</Pill></DVal></DField>
            <DField><DLbl>Status</DLbl><DVal><Badge $s={pr.status}>{pr.status}</Badge></DVal></DField>
          </DRow>
          <DRow>
            <DField><DLbl>Department</DLbl><DVal>{pr.department || "—"}</DVal></DField>
            <DField><DLbl>Requested By</DLbl><DVal>{pr.requested_by || "—"}</DVal></DField>
          </DRow>
          <DRow>
            <DField><DLbl>Request Date</DLbl><DVal>{fmtDT(pr.request_date)}</DVal></DField>
            <DField><DLbl>Purpose</DLbl><DVal style={{ fontWeight: 400, color: C.muted }}>{pr.purpose || "—"}</DVal></DField>
          </DRow>

          <DSec>💊 Medicine Items ({items.length})</DSec>
          {items.length === 0 ? (
            <div style={{ color: C.muted, fontSize: ".82rem", padding: "8px 0" }}>No items.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((it, i) => (
                <DField key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, alignItems: "start" }}>
                  <div>
                    <DLbl>Medicine</DLbl>
                    <DVal>{it.medicine_name || "—"}</DVal>
                    {it.item_code && <div style={{ fontSize: ".68rem", color: C.muted, marginTop: 1 }}>#{it.item_code}</div>}
                  </div>
                  <div>
                    <DLbl>Qty / Unit</DLbl>
                    <DVal>{it.quantity} {it.unit}</DVal>
                  </div>
                  <div>
                    <DLbl>Remarks</DLbl>
                    <DVal style={{ fontWeight: 400, color: C.muted, fontSize: ".78rem" }}>{it.remarks || "—"}</DVal>
                  </div>
                </DField>
              ))}
            </div>
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

/* ══════════════════════════════════════════════════════
   MEDICINE SEARCH HOOK
══════════════════════════════════════════════════════ */
function useMedicineSearch(fromOutlet) {
  const [query,          setQuery]          = useState("")
  const [results,        setResults]        = useState([])
  const [showDropdown,   setShowDropdown]   = useState(false)
  const debounceRef = useRef(null)

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setShowDropdown(false); return }
    if (fromOutlet === null || fromOutlet === undefined) { setResults([]); setShowDropdown(false); return }
    try {
      const params = new URLSearchParams({ search: q })
      params.append("outlet_code", fromOutlet)
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET")
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      const seen = new Set()
      const unique = raw.filter(s => { if (seen.has(s.item_id)) return false; seen.add(s.item_id); return true })
      setResults(unique)
      setShowDropdown(unique.length > 0)
    } catch {
      setResults([])
      setShowDropdown(false)
    }
  }, [fromOutlet])

  const handleInput = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const clear = () => { setQuery(""); setResults([]); setShowDropdown(false) }

  return { query, setQuery, results, showDropdown, setShowDropdown, handleInput, clear }
}

/* ── Medicine search field per item ── */
const MedicineSearchField = ({ value, onChange, fromOutlet, err }) => {
  const [inputVal, setInputVal]   = useState(value?.medicine_name || "")
  const [results,  setResults]    = useState([])
  const [showDrop, setShowDrop]   = useState(false)
  const debounce  = useRef(null)
  const wrapRef   = useRef(null)

  // Close dropdown on outside click
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
    // Clear selection if user edits
    onChange({ medicine_name: val, item_id: "", item_code: "" })
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(val), 280)
  }

  const handleSelect = (stock) => {
    const name = stock.item_name || stock.medicine_name || stock.name || ""
    setInputVal(name)
    setShowDrop(false)
    setResults([])
    onChange({
      medicine_name: name,
      item_id:       stock.item_id   || "",
      item_code:     stock.item_code || stock.code || "",
    })
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <Inp
        $err={!!err}
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { if (results.length) setShowDrop(true) }}
        placeholder="Type to search medicine…"
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
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const UNITS = ["Tablet", "Capsule", "Bottle", "Vial", "Pack", "Ampoule", "Sachet", "Strip"]

const emptyItem = () => ({
  medicine_name: "",
  item_id:       "",
  item_code:     "",
  quantity:      "",
  unit:          "Tablet",
  remarks:       "",
})

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function PurchaseRequisition() {
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

  // fromOutlet: adapt to your auth context / redux / localStorage
  const fromOutlet = localStorage.getItem("outlet_code") || null

  /* ── Header form ── */
  const emptyHeader = {
    department:    "",
    requested_by:  "",
    request_date:  new Date().toISOString().slice(0, 16),
    purpose:       "",
  }
  const [header, setHeader] = useState(emptyHeader)
  const [items,  setItems]  = useState([emptyItem()])
  const [errs,   setErrs]   = useState({})

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
      const r  = await apiRequest(`${BASE}purchase-requisition/${qs ? "?" + qs : ""}`, "GET")
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : [])
      setPrList(Array.isArray(rows) ? rows : [])
    } catch { toast.error("Failed to load requisitions") }
    finally  { setLoading(false) }
  }, [fromDate, toDate])

  useEffect(() => { fetchList() }, [fetchList])

  /* ── Validate ── */
  const validate = () => {
    const e = {}
    if (!header.department.trim())   e.department   = "Required"
    if (!header.requested_by.trim()) e.requested_by = "Required"
    if (!header.request_date)        e.request_date = "Required"
    items.forEach((it, i) => {
      if (!it.medicine_name.trim()) e[`item_${i}_medicine`] = "Required"
      if (!it.quantity || Number(it.quantity) < 1) e[`item_${i}_qty`] = "Enter valid qty"
    })
    setErrs(e)
    return Object.keys(e).length === 0
  }

  /* ── Build payload ── */
  const buildPayload = (editedReason) => ({
    department:    header.department.trim(),
    requested_by:  header.requested_by.trim(),
    request_date:  header.request_date,
    purpose:       header.purpose.trim(),
    items: items.map(it => ({
      medicine_name: it.medicine_name.trim(),
      item_id:       it.item_id  || "",
      item_code:     it.item_code || "",
      quantity:      Number(it.quantity),
      unit:          it.unit,
      remarks:       it.remarks.trim(),
    })),
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
      const url    = isEdit ? `${BASE}purchase-requisition/${editPr.pr_number}/` : `${BASE}purchase-requisition/`
      const method = isEdit ? "PUT" : "POST"
      const r      = await apiRequest(url, method, payload)
      if (r?.success) {
        toast.success(isEdit ? "Requisition updated" : `Draft created: ${r.data?.pr_number}`)
        resetForm(); fetchList(); setTab("list")
      } else {
        const err = r?.error
        toast.error(Array.isArray(err) ? err.join(", ") : typeof err === "string" ? err : "Save failed")
      }
    } catch { toast.error("Network error") }
    finally  { setSaving(false) }
  }

  /* ── Load into edit form ── */
  const handleEdit = pr => {
    if (pr.status === "Approved" || pr.status === "Rejected") {
      toast.warning(`Cannot edit a ${pr.status} requisition`)
      return
    }
    setEditPr(pr)
    setHeader({
      department:   pr.department   || "",
      requested_by: pr.requested_by || "",
      request_date: pr.request_date ? pr.request_date.slice(0, 16) : "",
      purpose:      pr.purpose      || "",
    })
    setItems(
      Array.isArray(pr.items) && pr.items.length > 0
        ? pr.items.map(it => ({
            medicine_name: it.medicine_name || "",
            item_id:       it.item_id       || "",
            item_code:     it.item_code     || "",
            quantity:      it.quantity      || "",
            unit:          it.unit          || "Tablet",
            remarks:       it.remarks       || "",
          }))
        : [emptyItem()]
    )
    setErrs({})
    setTab("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Reset ── */
  const resetForm = () => {
    setEditPr(null)
    setHeader(emptyHeader)
    setItems([emptyItem()])
    setErrs({})
  }

  /* ── Item helpers ── */
  const addItem    = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = idx => { if (items.length === 1) return; setItems(prev => prev.filter((_, i) => i !== idx)) }
  const updateItem = (idx, patch) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it))

  /* ── Filtered list ── */
  const filtered = prList.filter(r => {
    const q = searchQ.toLowerCase()
    const okQ = !q ||
      (r.pr_number     || "").toLowerCase().includes(q) ||
      (r.department    || "").toLowerCase().includes(q) ||
      (r.requested_by  || "").toLowerCase().includes(q)
    return okQ && (!filterStat || r.status === filterStat)
  })

  const fmtDT = d => { try { return d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—" } catch { return "—" } }

  /* ─────────────────────── RENDER ── */
  return (
    <Wrap>
      {/* Header */}
      <Header>
        <div>
          <HTitle>🛒 Purchase Requisition</HTitle>
          <HSub>Raise &amp; manage medicine purchase requests</HSub>
        </div>
        <TabRow>
          <Tab $a={tab === "form"} onClick={() => { resetForm(); setTab("form") }}>+ New Request</Tab>
          <Tab $a={tab === "list"} onClick={() => setTab("list")}>📄 Requisitions</Tab>
        </TabRow>
      </Header>

      <Body>
        {/* ═══ FORM TAB ═══════════════════════════════════════════ */}
        {tab === "form" && (
          <AniCard>
            <CardHead>
              {editPr ? `✏️ Edit Requisition — ${editPr.pr_number}` : "📝 New Purchase Requisition"}
              {editPr && <Badge $s={editPr.status}>{editPr.status}</Badge>}
            </CardHead>
            <CardBody>

              <SecDiv>📋 Requisition Header</SecDiv>

              {/* Department & Requested By */}
              <Grid $cols="1fr 1fr">
                <FG>
                  <Lbl>Department <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.department}
                    value={header.department}
                    onChange={e => setHeader(p => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Pharmacy, Ward 3"
                  />
                  {errs.department && <ErrMsg>{errs.department}</ErrMsg>}
                </FG>
                <FG>
                  <Lbl>Requested By <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.requested_by}
                    value={header.requested_by}
                    onChange={e => setHeader(p => ({ ...p, requested_by: e.target.value }))}
                    placeholder="Staff name / ID"
                  />
                  {errs.requested_by && <ErrMsg>{errs.requested_by}</ErrMsg>}
                </FG>
              </Grid>

              {/* Request Date */}
              <Grid $cols="1fr 1fr">
                <FG>
                  <Lbl>Request Date &amp; Time <span style={{ color: C.danger }}>*</span></Lbl>
                  <Inp
                    $err={!!errs.request_date}
                    type="datetime-local"
                    value={header.request_date}
                    onChange={e => setHeader(p => ({ ...p, request_date: e.target.value }))}
                  />
                  {errs.request_date && <ErrMsg>{errs.request_date}</ErrMsg>}
                </FG>
                <FG>
                  <Lbl>Purpose / Notes</Lbl>
                  <Inp
                    value={header.purpose}
                    onChange={e => setHeader(p => ({ ...p, purpose: e.target.value }))}
                    placeholder="Reason or additional context (optional)"
                  />
                </FG>
              </Grid>

              {/* Medicine Items */}
              <SecDiv style={{ marginTop: 22 }}>💊 Medicine Items</SecDiv>

              {items.map((item, idx) => (
                <ItemCard key={idx}>
                  <ItemBadge>Item {idx + 1}</ItemBadge>
                  <Grid $cols="2fr 1fr 1fr" style={{ marginTop: 6 }}>
                    {/* Medicine name — searchable */}
                    <FG>
                      <Lbl>Medicine Name <span style={{ color: C.danger }}>*</span></Lbl>
                      <MedicineSearchField
                        value={item}
                        fromOutlet={fromOutlet}
                        err={errs[`item_${idx}_medicine`]}
                        onChange={patch => updateItem(idx, patch)}
                      />
                      {item.item_code && (
                        <span style={{ fontSize: ".68rem", color: C.muted, marginTop: 2 }}>
                          Code: {item.item_code}
                        </span>
                      )}
                      {errs[`item_${idx}_medicine`] && <ErrMsg>{errs[`item_${idx}_medicine`]}</ErrMsg>}
                    </FG>

                    {/* Quantity */}
                    <FG>
                      <Lbl>Quantity <span style={{ color: C.danger }}>*</span></Lbl>
                      <Inp
                        $err={!!errs[`item_${idx}_qty`]}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(idx, { quantity: e.target.value })}
                        placeholder="0"
                      />
                      {errs[`item_${idx}_qty`] && <ErrMsg>{errs[`item_${idx}_qty`]}</ErrMsg>}
                    </FG>

                    {/* Unit */}
                    <FG>
                      <Lbl>Unit</Lbl>
                      <Sel value={item.unit} onChange={e => updateItem(idx, { unit: e.target.value })}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </Sel>
                    </FG>
                  </Grid>

                  {/* Remarks */}
                  <Grid $cols="1fr" style={{ marginBottom: 0, marginTop: 4 }}>
                    <FG>
                      <Lbl>Remarks</Lbl>
                      <Inp
                        value={item.remarks}
                        onChange={e => updateItem(idx, { remarks: e.target.value })}
                        placeholder="Any notes for this item…"
                      />
                    </FG>
                  </Grid>

                  {items.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <DangerBtn onClick={() => removeItem(idx)}>✕ Remove Item</DangerBtn>
                    </div>
                  )}
                </ItemCard>
              ))}

              <div style={{ marginBottom: 18 }}>
                <SecBtn onClick={addItem}>＋ Add Medicine Item</SecBtn>
              </div>

              <BtnRow style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <SecBtn onClick={resetForm} disabled={saving}>✕ Clear</SecBtn>
                <PrimBtn onClick={handleSubmit} disabled={saving}>
                  {saving ? <><Spin /> Saving…</> : editPr ? "💾 Update Requisition" : "💾 Save as Draft"}
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
                <Inp value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="PR No, Department, Requested By…" />
              </FG>
              <FG style={{ minWidth: 150, margin: 0 }}>
                <Lbl>Status</Lbl>
                <Sel value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                  <option value="">All Status</option>
                  {["Draft", "Verified", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
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
                      <Th>Department</Th>
                      <Th>Requested By</Th>
                      <Th>Req Date</Th>
                      <Th>Items</Th>
                      <Th>Status</Th>
                      <Th>Purpose</Th>
                      <Th style={{ textAlign: "center" }}>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const canEdit = r.status === "Draft" || r.status === "Verified"
                      const itemCount = Array.isArray(r.items) ? r.items.length : 0
                      return (
                        <Trow key={r.pr_number}>
                          <Td style={{ color: C.muted, fontSize: ".72rem" }}>{idx + 1}</Td>
                          <Td><Pill>{r.pr_number}</Pill></Td>
                          <Td style={{ fontWeight: 700 }}>{r.department || "—"}</Td>
                          <Td style={{ whiteSpace: "nowrap" }}>{r.requested_by || "—"}</Td>
                          <Td style={{ whiteSpace: "nowrap", fontSize: ".78rem" }}>{fmtDT(r.request_date)}</Td>
                          <Td>
                            <span style={{ background: C.pLight, color: C.pDark, padding: "2px 8px", borderRadius: 4, fontSize: ".72rem", fontWeight: 700 }}>
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                          </Td>
                          <Td><Badge $s={r.status}>{r.status}</Badge></Td>
                          <Td style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: ".78rem", color: C.muted }}>{r.purpose || "—"}</Td>
                          {/* Three-dot menu */}
                          <Td style={{ textAlign: "center" }}>
                            <MenuWrap ref={openMenuId === r.pr_number ? menuRef : null}>
                              <DotBtn
                                title="Actions"
                                onClick={() => setOpenMenuId(prev => prev === r.pr_number ? null : r.pr_number)}
                              >⋯</DotBtn>
                              {openMenuId === r.pr_number && (
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