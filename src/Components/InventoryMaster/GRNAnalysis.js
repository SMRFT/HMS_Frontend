import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormContent, ControlsContainer,
  SearchContainer, InputWrapper, TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Eye, CheckCircle, X, Printer } from "lucide-react"
import styled from "styled-components"

/* ─── Styled Components ─────────────────────────────────────────────────── */
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 14px 20px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
`
const PageTitle    = styled.h1`margin: 0; font-size: 1.1rem; font-weight: 700;`
const PageSubtitle = styled.p`margin: 2px 0 0; font-size: 0.75rem; opacity: 0.8;`

const FilterBar = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;
  background: #f8fafc; border: 1px solid ${colors.border};
  border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;
`
const Lbl  = styled(Label)`font-size: 0.72rem; margin-bottom: 2px; display: block;`
const FInp = styled(Input)`font-size: 0.8rem; height: 34px; min-width: 140px;`

const ScrollTable = styled.div`width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;`

const ActionBtn = styled.button`
  padding: 3px 10px; border: none; border-radius: 4px; font-size: 0.75rem;
  font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
  background: ${p => p.variant==="green" ? "#dcfce7" : p.variant==="blue" ? "#dbeafe" : colors.tabBg};
  color:       ${p => p.variant==="green" ? "#166534" : p.variant==="blue" ? "#1d4ed8" : colors.primary};
  &:hover { background: ${p => p.variant==="green" ? "#bbf7d0" : p.variant==="blue" ? "#bfdbfe" : "#b2dfdb"}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`
const DraftBadge  = styled.span`background:#fef9c3;color:#854d0e;font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:20px;`
const GrnBadge    = styled.span`background:#dcfce7;color:#166534;font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:20px;`
const PendingText = styled.span`color:#94a3b8;font-size:0.68rem;font-style:italic;`
const StatusBadge = styled.span`
  background: ${p => p.status==="Verified" ? "#dcfce7" : p.status==="Draft" ? "#fef9c3" : "#e0f2fe"};
  color:       ${p => p.status==="Verified" ? "#166534" : p.status==="Draft" ? "#854d0e" : "#0369a1"};
  font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 20px;
`

/* ── Modal ── */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 12px;
`
const ModalBox = styled.div`
  background: white; border-radius: 8px; width: 100%; max-width: 1100px;
  max-height: 96vh; display: flex; flex-direction: column;
  box-shadow: 0 16px 50px rgba(0,0,0,0.22);
`
const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 10px 16px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between;
`
const ModalTitle  = styled.h2`margin: 0; font-size: 0.95rem; font-weight: 700;`
const ModalBody   = styled.div`flex: 1; overflow-y: auto; padding: 14px;`
const ModalFooter = styled.div`
  padding: 8px 14px; border-top: 1px solid ${colors.border};
  display: flex; justify-content: flex-end; gap: 8px;
`
const CloseBtn = styled.button`
  background: rgba(255,255,255,0.2); border: none; color: white;
  border-radius: 50%; width: 26px; height: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.35); }
`

/* ══════════════════════════════════════════════════════════════════════════
   GRN PRINT DOCUMENT — matches screenshot layout exactly
   ══════════════════════════════════════════════════════════════════════════ */

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE",    label: "Medicine Purchase (OP)" },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)" },
  { value: "OPENING_STOCK_DRUG",   label: "Opening Stock (Drug)"   },
]

const todayStr = () => new Date().toISOString().split("T")[0]
const fmtDate  = (d) => d ? d.split("T")[0] : "—"
const fmt2     = (v) => parseFloat(v || 0).toFixed(2)

/* ── Number to words ── */
function numberToWords(num) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"]
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]
  const n = Math.floor(Math.abs(num))
  if (n === 0) return "Zero"
  const inW = (x) => {
    if (x < 20) return a[x]
    if (x < 100) return b[Math.floor(x/10)] + (x%10 ? " "+a[x%10] : "")
    return a[Math.floor(x/100)] + " Hundred" + (x%100 ? " "+inW(x%100) : "")
  }
  let r = ""
  if (n >= 10000000) r += inW(Math.floor(n/10000000)) + " Crore "
  if (n >= 100000)   r += inW(Math.floor((n%10000000)/100000)) + " Lakh "
  if (n >= 1000)     r += inW(Math.floor((n%100000)/1000)) + " Thousand "
  if (n >= 100)      r += inW(Math.floor((n%1000)/100)) + " Hundred "
  r += inW(n % 100)
  return r.trim() + " Only /-"
}

/* ══════════════════════════════════════════════════════════════════════════
   GRN DOCUMENT COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const GRNDocument = ({ grn, vendorInfo, items }) => {
  const v   = vendorInfo || {}
  const addr = [v.address_line1, v.address_line2, v.city, v.state].filter(Boolean).join(", ")

  /* totals */
  const totalTaxable  = items.reduce((s,i) => s + parseFloat(i.item_value || 0), 0)
  const totalCgst     = items.reduce((s,i) => s + parseFloat(i.cgst_amt   || 0), 0)
  const totalSgst     = items.reduce((s,i) => s + parseFloat(i.sgst_amt   || 0), 0)
  const totalDisc     = items.reduce((s,i) => s + parseFloat(i.purchase_discount_amt || 0), 0)
  const igst          = parseFloat(grn.igst || 0)
  const totalGst      = totalCgst + totalSgst + igst
  const netAmt        = parseFloat(grn.net_invoice_amount || 0)
  const roundOff      = parseFloat(grn.round_amount || 0)

  /* shared cell style */
  const th = (extra = {}) => ({
    background: "#dbeafe",          // light blue instead of grey
    color: "#0c4a6e",               // dark blue text
    border: "1px solid #7dd3fc",    // blue border
    padding: "2px 3px",
    fontSize: 7.5,
    fontWeight: 700,
    whiteSpace: "nowrap",
    textAlign: "center",
    verticalAlign: "middle",
    ...extra,
  })
  const td  = (extra = {}) => ({ border: "1px solid #ddd", padding: "2px 3px", fontSize: 8, whiteSpace: "nowrap", verticalAlign: "middle", ...extra })
  const tdr = (extra = {}) => td({ textAlign: "right", ...extra })
  const tdc = (extra = {}) => td({ textAlign: "center", ...extra })

  return (
    <div id="grn-print-area" style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: "#000", border: "1px solid #999" }}>

    <div
      style={{
        textAlign: "center",
        fontSize: 11,
        fontWeight: 700,
        borderBottom: "1px solid #c0dbff",
        padding: "4px 6px",
        textTransform: "uppercase",
        letterSpacing: 0.3,
        background: "#dbeafe",      // light blue background
        color: "#0c4a6e",           // dark blue text for contrast
      }}
    >
      GOODS RECEIPT NOTE - MEDICINE PURCHASE
    </div>

      {/* ── 3-column info strip ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #c0dbff" }}>
        <tbody>
          <tr>
            {/* Left */}
            <td style={{ verticalAlign: "top", padding: "4px 7px", fontSize: 8.5, borderRight: "1px solid #c0dbff", width: "33%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                {[
                  ["Invoice No",    grn.invoice_no],
                  ["Invoice Date",  fmtDate(grn.invoice_date)],
                  ["Purchase No",   grn.draft_number],
                  ["Purchase Date", fmtDate(grn.date)],
                ].map(([k,val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 82 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>

            {/* Centre */}
            <td style={{ verticalAlign: "top", padding: "4px 7px", fontSize: 8.5, borderRight: "1px solid #c0dbff", width: "34%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                <tr>
                  <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 82 }}>Supplier Name</td>
                  <td style={{ fontSize: 8.5, fontWeight: 700, verticalAlign: "top" }}>: {v.name || "—"}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, fontSize: 8.5, verticalAlign: "top" }}></td>
                  <td style={{ fontSize: 8.5, verticalAlign: "top" }}>{addr}</td>
                </tr>
                {[
                  ["State",      v.state],
                  ["Phone",      v.phone],
                  ["GST Number", v.gstin || "******"],
                ].map(([k,val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 82 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>

            {/* Right */}
            <td style={{ verticalAlign: "top", padding: "4px 7px", fontSize: 8.5, borderRight: "1px solid #c0dbff", width: "33%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                {[
                  ["Order Number",  grn.order_number || ""],
                  ["Payment Mode",  grn.payment_mode],
                  ["Approved Date", fmtDate(grn.date)],
                  ...(grn.grn_number ? [["GRN No", grn.grn_number]] : []),
                ].map(([k,val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 82 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Items + right totals ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #c0dbff" }}>

        {/* Items table */}
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={th({ width: 22 })}>Sl.</th>
                <th rowSpan={2} style={th({ minWidth: 90, textAlign: "left" })}>Product</th>
                <th rowSpan={2} style={th()}>HSN</th>
                <th rowSpan={2} style={th()}>Batch</th>
                <th rowSpan={2} style={th()}>Expiry</th>
                <th rowSpan={2} style={th()}>Pack</th>
                <th rowSpan={2} style={th()}>QTY</th>
                <th rowSpan={2} style={th()}>Free</th>
                <th rowSpan={2} style={th()}>P Rate</th>
                <th rowSpan={2} style={th()}>P.cost</th>
                <th rowSpan={2} style={th()}>MRP</th>
                <th rowSpan={2} style={th()}>Discount</th>
                <th rowSpan={2} style={th()}>Taxable<br/>Amount</th>
                <th colSpan={2} style={th()}>CGST</th>
                <th colSpan={2} style={th()}>SGST</th>
                <th rowSpan={2} style={th()}>Total<br/>Amount</th>
              </tr>
              <tr>
                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                <th style={th()}>Rate</th><th style={th()}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={tdc()}>{i+1}</td>
                  <td style={td({ fontWeight: 600, maxWidth: 120, whiteSpace: "normal", textAlign: "left" })}>{it.name}</td>
                  <td style={tdc()}>{it.hsn || "—"}</td>
                  <td style={tdc()}>{it.batch || "—"}</td>
                  <td style={tdc()}>{it.expiry || "—"}</td>
                  <td style={tdc()}>{it.packing || "—"}</td>
                  <td style={tdc()}>{it.quantity}</td>
                  <td style={tdc()}>{it.free || 0}</td>
                  <td style={tdr()}>{fmt2(it.packing_price)}</td>
                  <td style={tdr()}>{fmt2(it.purchase_cost_display || it.purchase_cost)}</td>
                  <td style={tdr()}>{fmt2(it.mrp)}</td>
                  <td style={tdr()}>{fmt2(it.purchase_discount_amt)}</td>
                  <td style={tdr()}>{fmt2(it.item_value)}</td>
                  <td style={tdc()}>{it.cgst_percent}%</td>
                  <td style={tdr()}>{fmt2(it.cgst_amt)}</td>
                  <td style={tdc()}>{it.sgst_percent}%</td>
                  <td style={tdr()}>{fmt2(it.sgst_amt)}</td>
                  <td style={tdr({ fontWeight: 700 })}>{fmt2(it.purchase_cost)}</td>
                </tr>
              ))}

              <tr style={{ background: "#dbeafe" }}>
                <td
                  colSpan={12}
                  style={td({
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  Total
                </td>

                <td
                  style={tdr({
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  {fmt2(totalTaxable)}
                </td>

                <td style={td({ background: "#dbeafe" })} />

                <td
                  style={tdr({
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  {fmt2(totalCgst)}
                </td>

                <td style={td({ background: "#dbeafe" })} />

                <td
                  style={tdr({
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  {fmt2(totalSgst)}
                </td>

                <td
                  style={tdr({
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  {fmt2(netAmt)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right totals panel */}
        <table style={{ borderLeft: "1px solid #c0dbff", borderCollapse: "collapse", fontSize: 8.5, minWidth: 130, alignSelf: "stretch" }}>
          <tbody>
            {[
              ["Total",     fmt2(totalTaxable), false],
              ["Discount",  fmt2(totalDisc),    false],
              ["Tax On Free","0.00",            false],
              ["Round off.",fmt2(roundOff),     false],
              ["Total GST", fmt2(totalGst),     true ],
              ["Net Amount",fmt2(netAmt),       true, "#e8f5e9", "#0f766e"],
            ].map(([lbl, val, bold, bg, col]) => (
              <tr key={lbl} style={{ background: bg || "transparent" }}>
                <td style={{ padding: "2px 6px", borderBottom: "1px solid #eee", fontWeight: bold ? 800 : 600, color: col || "#333", whiteSpace: "nowrap" }}>{lbl}</td>
                <td style={{ padding: "2px 6px", borderBottom: "1px solid #eee", textAlign: "right", fontWeight: bold ? 800 : 700, color: col || "#000", whiteSpace: "nowrap" }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom strip: GST | Amount in Words | Net Amount ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #999" }}>
        <tbody>
          <tr>
            <td style={{ padding: "3px 6px", fontSize: 8, borderRight: "1px solid #c0dbff", whiteSpace: "nowrap", width: "45%" }}>
              <strong>GST Amount</strong>&nbsp;&nbsp;
              CGST Amount : {fmt2(totalCgst)}&nbsp;&nbsp;
              SGST Amount : {fmt2(totalSgst)}&nbsp;&nbsp;
              IGST Amount : {fmt2(igst)}
            </td>
            <td style={{ padding: "3px 6px", fontSize: 8, borderRight: "1px solid #c0dbff" }}>
              <strong>Amount In Words</strong>&nbsp;&nbsp;
              Rupee(s) {numberToWords(netAmt)}
            </td>
            <td style={{ padding: "3px 8px", fontSize: 8, textAlign: "right", whiteSpace: "nowrap", minWidth: 100 }}>
              <strong>Net Amount</strong>&nbsp;
              <span style={{ fontWeight: 800, color: "#0f766e" }}>{fmt2(netAmt)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Signature strip ── */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 8 }}>
        <span>Entered By : {grn.entered_by || "USER"}</span>
        <span>Checked By : —</span>
        <span>Verified By : —</span>
      </div>

    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */
const GRNAnalysis = () => {
  const [grnList,   setGrnList]   = useState([])
  const [vendors,   setVendors]   = useState([])
  const [fromDate,  setFromDate]  = useState(todayStr())
  const [toDate,    setToDate]    = useState(todayStr())
  const [search,    setSearch]    = useState("")
  const [viewGrn,   setViewGrn]   = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [confirmId, setConfirmId] = useState(null)
  const printRef = useRef()

  const fetchVendors = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}vendors/`,"GET"); if(r.success) setVendors(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchGRNList = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}grn/`,"GET"); if(r.success) setGrnList(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  useEffect(()=>{ fetchVendors(); fetchGRNList() },[fetchVendors,fetchGRNList])

  const getVendor     = (id) => vendors.find(x=>Number(x.vendor_id)===Number(id))||null
  const getVendorName = (id) => { const v=getVendor(id); return v?v.name:String(id||"") }

  const filtered = grnList.filter(g => {
    const d = g.date?.split("T")[0] || ""
    const inRange = (!fromDate||d>=fromDate)&&(!toDate||d<=toDate)
    const q = search.toLowerCase()
    return inRange && (!q ||
      g.draft_number?.toLowerCase().includes(q) ||
      g.grn_number?.toLowerCase().includes(q)   ||
      getVendorName(g.vendor_id)?.toLowerCase().includes(q) ||
      g.invoice_no?.toLowerCase().includes(q))
  })

  const openView = (grn) => {
    try { setViewItems(JSON.parse(grn.items||"[]")) } catch { setViewItems([]) }
    setViewGrn(grn)
  }
  const closeView = () => { setViewGrn(null); setViewItems([]) }

  const handlePrint = () => {
    const content = document.getElementById("grn-print-area")
    if(!content) return
    const win = window.open("","_blank","width=1100,height=750")
    win.document.write(`<!DOCTYPE html><html><head>
      <title>GRN - ${viewGrn?.grn_number||viewGrn?.draft_number}</title>
      <style>
        *{box-sizing:border-box;}
        body{font-family:Arial,sans-serif;font-size:9px;color:#000;margin:0;padding:8px;}
        table{border-collapse:collapse;}
        @media print{@page{margin:6mm;} body{padding:0;}}
      </style>
    </head><body>${content.outerHTML}</body></html>`)
    win.document.close()
    setTimeout(()=>win.print(),400)
  }

  const handleGenerateGRN = async (grn) => {
    if(grn.status==="Verified"){ toast.info("GRN already verified."); return }
    setConfirmId(grn.grn_id)
    try {
      const payload = {
        ...grn, status:"Verified", draft_number:grn.draft_number,
        items:          typeof grn.items==="string"?grn.items:JSON.stringify(grn.items||[]),
        payment_status: typeof grn.payment_status==="string"?grn.payment_status:JSON.stringify(grn.payment_status||[]),
      }
      const r = await apiRequest(`${baseUrl}grn/${grn.draft_number}/`,"PUT",payload)
      if(!r.success){ toast.error(r.error||"Failed to verify GRN"); return }
      toast.success(`GRN Verified & stock updated! GRN: ${r.data?.grn_number}`)
      fetchGRNList()
    } catch { toast.error("Network error") }
    finally { setConfirmId(null) }
  }

  return (
    <PageWrapper>
      <Container style={{maxWidth:"100%",padding:"0 8px"}}>
        <PageHeader>
          <div>
            <PageTitle>📊 GRN Analysis</PageTitle>
            <PageSubtitle>View, Generate &amp; Manage Goods Receipt Notes</PageSubtitle>
          </div>
        </PageHeader>

        <FormContent style={{padding:"10px 0"}}>
          <FilterBar>
            <div><Lbl>From Date</Lbl><FInp type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></div>
            <div><Lbl>To Date</Lbl>  <FInp type="date" value={toDate}   onChange={e=>setToDate(e.target.value)}/></div>
            <div style={{flex:1,minWidth:200}}>
              <Lbl>Search</Lbl>
              <FInp placeholder="Draft No, GRN No, Vendor, Invoice…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%"}}/>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
              <Button onClick={fetchGRNList} style={{height:34,fontSize:"0.8rem",padding:"0 14px"}}>🔄 Refresh</Button>
              <span style={{color:colors.textMuted,fontSize:"0.78rem",alignSelf:"center"}}>{filtered.length} record(s)</span>
            </div>
          </FilterBar>

          <ScrollTable>
            <Table style={{minWidth:1000}}>
              <thead>
                <tr>
                  {["#","Draft No","GRN No","Date","Vendor","Category","Invoice No","Invoice Date","Payment","Net Amount","Status","Actions"].map(h=>(
                    <Th key={h} style={{fontSize:"0.7rem"}}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={12}><div style={{textAlign:"center",padding:"36px",color:colors.textMuted,fontSize:"0.85rem"}}>No GRN records found for the selected date range.</div></td></tr>
                ) : filtered.map((grn,idx)=>(
                  <Tr key={grn.grn_id}>
                    <Td style={{fontSize:"0.73rem"}}>{idx+1}</Td>
                    <Td><DraftBadge>{grn.draft_number||"—"}</DraftBadge></Td>
                    <Td>{grn.grn_number?<GrnBadge>{grn.grn_number}</GrnBadge>:<PendingText>Pending</PendingText>}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{fmtDate(grn.date)}</Td>
                    <Td style={{fontWeight:600,fontSize:"0.73rem"}}>{getVendorName(grn.vendor_id)}</Td>
                    <Td style={{fontSize:"0.7rem"}}>{PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label||grn.purchase_category}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{grn.invoice_no}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{fmtDate(grn.invoice_date)}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{grn.payment_mode}</Td>
                    <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.78rem"}}>₹{fmt2(grn.net_invoice_amount)}</Td>
                    <Td><StatusBadge status={grn.status}>{grn.status||"Draft"}</StatusBadge></Td>
                    <Td>
                      <div style={{display:"flex",gap:4,flexWrap:"nowrap"}}>
                        <ActionBtn variant="green" onClick={()=>handleGenerateGRN(grn)}
                          disabled={grn.status==="Verified"||confirmId===grn.grn_id}
                          title={grn.status==="Verified"?"Already Verified":"Generate GRN & Update Stock"}>
                          <CheckCircle size={12}/>
                          {confirmId===grn.grn_id?"…":grn.status==="Verified"?"Verified":"Generate GRN"}
                        </ActionBtn>
                        <ActionBtn variant="blue" onClick={()=>openView(grn)} title="View GRN Report">
                          <Eye size={12}/> View GRN
                        </ActionBtn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </ScrollTable>
        </FormContent>
      </Container>

      {viewGrn && (
        <Overlay onClick={e=>{ if(e.target===e.currentTarget) closeView() }}>
          <ModalBox>
            <ModalHeader>
              <ModalTitle>🧾 {viewGrn.grn_number||viewGrn.draft_number}</ModalTitle>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <ActionBtn onClick={handlePrint}
                  style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1px solid rgba(255,255,255,0.35)",fontSize:"0.73rem",padding:"3px 10px"}}>
                  <Printer size={12}/> Print
                </ActionBtn>
                <CloseBtn onClick={closeView}><X size={14}/></CloseBtn>
              </div>
            </ModalHeader>

            <ModalBody ref={printRef}>
              <GRNDocument grn={viewGrn} vendorInfo={getVendor(viewGrn.vendor_id)} items={viewItems}/>
            </ModalBody>

            <ModalFooter>
              <Button secondary onClick={closeView} style={{fontSize:"0.8rem",padding:"5px 14px"}}><X size={12}/>&nbsp;Close</Button>
              <Button onClick={handlePrint} style={{fontSize:"0.8rem",padding:"5px 14px"}}><Printer size={12}/>&nbsp;Print / PDF</Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  )
}

export default GRNAnalysis