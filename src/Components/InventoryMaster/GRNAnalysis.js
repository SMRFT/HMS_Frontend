import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormContent, ControlsContainer,
  SearchContainer, InputWrapper, TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Eye, CheckCircle, X, Printer } from "lucide-react"
import styled, { keyframes } from "styled-components"

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
const Lbl = styled(Label)`font-size: 0.72rem; margin-bottom: 2px; display: block;`
const FInp = styled(Input)`font-size: 0.8rem; height: 34px; min-width: 140px;`

const ScrollTable = styled.div`
  width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;
`

const ActionBtn = styled.button`
  padding: 3px 10px; border: none; border-radius: 4px; font-size: 0.75rem;
  font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
  background: ${p => p.variant === "green" ? "#dcfce7" : p.variant === "blue" ? "#dbeafe" : colors.tabBg};
  color:       ${p => p.variant === "green" ? "#166534" : p.variant === "blue" ? "#1d4ed8" : colors.primary};
  &:hover {
    background: ${p => p.variant === "green" ? "#bbf7d0" : p.variant === "blue" ? "#bfdbfe" : "#b2dfdb"};
  }
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
  background: white; border-radius: 8px; width: 100%; max-width: 760px;
  max-height: 94vh; display: flex; flex-direction: column;
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

/* ─── Compact GRN Document ───────────────────────────────────────────────── */
/* Mirrors the screenshot layout: hospital header, two-col info, items table,
   financial summary — but kept tight so it doesn't waste screen real estate. */

const GrnDoc = styled.div`
  font-family: Arial, sans-serif; font-size: 10.5px; color: #111;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 5px;
`
/* ── Hospital header (matches screenshot) ── */
const HospHeader = styled.div`
  text-align: center; padding-bottom: 8px; margin-bottom: 8px;
  border-bottom: 2px solid #0f766e;
`
const HospName    = styled.div`font-size: 15px; font-weight: 800; color: #0f766e; letter-spacing: 0.5px;`
const HospAddr    = styled.div`font-size: 9px; color: #64748b; margin-top: 2px;`
const DocTypeRow  = styled.div`
  margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  text-decoration: underline; text-transform: uppercase;
`

/* ── Meta row (Invoice No, Date, etc.) right-aligned ── */
const MetaGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;
`
const MetaBox  = styled.div`
  border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px;
`
const MetaTitle = styled.div`
  font-size: 9px; font-weight: 800; text-transform: uppercase;
  color: #0f766e; margin-bottom: 4px; padding-bottom: 3px;
  border-bottom: 1px solid #e2e8f0;
`
const MRow  = styled.div`display: flex; gap: 4px; margin-bottom: 2px;`
const MKey  = styled.span`font-weight: 700; color: #475569; min-width: 90px; font-size: 9.5px;`
const MVal  = styled.span`color: #0f172a; font-size: 9.5px;`

/* ── Items table ── */
const DocTable = styled.table`width: 100%; border-collapse: collapse; margin-bottom: 8px;`
const DTh = styled.th`
  background: #0f766e; color: white; padding: 4px 5px;
  text-align: left; font-size: 8.5px; font-weight: 700; white-space: nowrap;
`
const DTd = styled.td`
  padding: 3px 5px; border-bottom: 1px solid #e2e8f0; font-size: 9px; vertical-align: middle;
`
const DTr = styled.tr`&:nth-child(even){ background: #f8fafc; }`

/* ── Financial summary bottom ── */
const FinGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
`
const FinTable = styled.table`width: 100%; font-size: 9.5px; border-collapse: collapse;`
const SigRow  = styled.div`
  display: flex; justify-content: space-between; margin-top: 20px; font-size: 9px;
`
const SigCol  = styled.div`
  text-align: center; border-top: 1px solid #94a3b8;
  padding-top: 3px; min-width: 100px;
`

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE",    label: "Medicine Purchase (OP)", prefix: "GRN/OP"  },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)", prefix: "GRN/IP"  },
  { value: "OPENING_STOCK_DRUG",   label: "Opening Stock (Drug)",   prefix: "GRN/OS"  },
]

/* GRN number prefix by category */
const grnPrefix = (category) =>
  PURCHASE_CATEGORIES.find(c => c.value === category)?.prefix || "GRN"

const todayStr = () => new Date().toISOString().split("T")[0]
const fmtDate  = (d) => d ? d.split("T")[0] : "—"
const fmtAmt   = (v) => `₹ ${parseFloat(v||0).toFixed(2)}`

/* ─── Compact GRN Document Component ────────────────────────────────────── */
const GRNDocument = ({ grn, vendorInfo, items }) => {
  const v = vendorInfo || {}
  const addr = [v.address_line1, v.address_line2, v.city, v.state].filter(Boolean).join(", ")
  const catLabel = PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label || grn.purchase_category

  return (
    <GrnDoc id="grn-print-area">
      {/* Hospital Header */}
      <HospHeader>
        <HospName>SHANMUGA HOSPITAL LIMITED</HospName>
        <HospAddr>31/24, Seetha College Road, Salem – 636007 | Phone: 04152-ddddd</HospAddr>
        <DocTypeRow>Goods Receipt Note — Medicine Purchase</DocTypeRow>
      </HospHeader>

      {/* Meta grid */}
      <MetaGrid>
        {/* Left: GRN details */}
        <MetaBox>
          <MetaTitle>GRN Details</MetaTitle>
          <MRow><MKey>Invoice No :</MKey>    <MVal>{grn.invoice_no}</MVal></MRow>
          <MRow><MKey>Invoice Date :</MKey>  <MVal>{fmtDate(grn.invoice_date)}</MVal></MRow>
          <MRow><MKey>Purchase Date :</MKey> <MVal>{fmtDate(grn.date)}</MVal></MRow>
          <MRow><MKey>Purchase No :</MKey>   <MVal>{grn.draft_number||"—"}</MVal></MRow>
          <MRow><MKey>GRN No :</MKey>        <MVal style={{fontWeight:700}}>{grn.grn_number||"—"}</MVal></MRow>
          <MRow><MKey>GST Number :</MKey>    <MVal>{v.gstin||"*******"}</MVal></MRow>
          <MRow><MKey>Payment Mode :</MKey>  <MVal>{grn.payment_mode}</MVal></MRow>
          <MRow><MKey>Approved Date :</MKey> <MVal>{fmtDate(grn.date)}</MVal></MRow>
        </MetaBox>

        {/* Right: Supplier details */}
        <MetaBox>
          <MetaTitle>Supplier Details</MetaTitle>
          <MRow><MKey>Supplier Name :</MKey><MVal style={{fontWeight:700}}>{v.name||"—"}</MVal></MRow>
          <MRow><MKey>Address :</MKey>      <MVal>{addr||"—"}</MVal></MRow>
          <MRow><MKey>State :</MKey>        <MVal>{v.state||"—"}</MVal></MRow>
          <MRow><MKey>Phone :</MKey>        <MVal>{v.phone||"—"}</MVal></MRow>
          <MRow><MKey>GSTIN :</MKey>        <MVal>{v.gstin||"—"}</MVal></MRow>
        </MetaBox>
      </MetaGrid>

      {/* Items Table */}
      <DocTable>
        <thead>
          <tr>
            <DTh>S.No</DTh>
            <DTh>Product</DTh>
            <DTh>HDC</DTh>
            <DTh>Batch</DTh>
            <DTh>Expiry</DTh>
            <DTh>Pack</DTh>
            <DTh>QTY</DTh>
            <DTh>Free</DTh>
            <DTh>P-Rate</DTh>
            <DTh>P-Amt</DTh>
            <DTh>MRP</DTh>
            <DTh>Taxable</DTh>
            <DTh>CGST%</DTh>
            <DTh>CGST</DTh>
            <DTh>SGST%</DTh>
            <DTh>SGST</DTh>
            <DTh>Disc%</DTh>
            <DTh>Total Amount</DTh>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <DTr key={i}>
              <DTd>{i+1}</DTd>
              <DTd style={{fontWeight:600,maxWidth:120}}>{it.name}</DTd>
              <DTd>{it.hsn||"—"}</DTd>
              <DTd>{it.batch||"—"}</DTd>
              <DTd>{it.expiry||"—"}</DTd>
              <DTd>{it.packing||"—"}</DTd>
              <DTd>{it.quantity}</DTd>
              <DTd>{it.free}</DTd>
              <DTd>₹{parseFloat(it.packing_price||0).toFixed(2)}</DTd>
              <DTd>₹{it.item_value}</DTd>
              <DTd>₹{parseFloat(it.mrp||0).toFixed(2)}</DTd>
              <DTd>₹{it.item_value}</DTd>
              <DTd>{it.cgst_percent}%</DTd>
              <DTd>₹{it.cgst_amt}</DTd>
              <DTd>{it.sgst_percent}%</DTd>
              <DTd>₹{it.sgst_amt}</DTd>
              <DTd>{it.purchase_discount}%</DTd>
              <DTd style={{fontWeight:700}}>₹{it.purchase_cost}</DTd>
            </DTr>
          ))}
        </tbody>
      </DocTable>

      {/* Financial Summary */}
      <FinGrid>
        <div>
          {grn.remarks && (
            <MetaBox>
              <MetaTitle>Remarks</MetaTitle>
              <div style={{fontSize:9.5,color:"#475569"}}>{grn.remarks}</div>
            </MetaBox>
          )}
          <div style={{marginTop:6,fontSize:9.5}}>
            <strong>Amount in Words:</strong>{" "}
            {/* Server can provide this; showing net amount placeholder */}
            {fmtAmt(grn.net_invoice_amount)}
          </div>
        </div>
        <MetaBox>
          <MetaTitle>Financial Summary</MetaTitle>
          <FinTable>
            <tbody>
              {[
                ["GST Amount",    grn.cgst||"0"],
                ["CGST Amount",   grn.cgst],
                ["SGST Amount",   grn.sgst],
                ["IGST Amount",   grn.igst||"0"],
              ].map(([k,v])=>(
                <tr key={k}>
                  <td style={{padding:"1px 0",color:"#64748b"}}>{k}</td>
                  <td style={{padding:"1px 0",textAlign:"right",fontWeight:600}}>₹{parseFloat(v||0).toFixed(2)}</td>
                </tr>
              ))}
              <tr><td colSpan={2}><hr style={{border:"none",borderTop:"1px solid #e2e8f0",margin:"4px 0"}}/></td></tr>
              {[
                ["Total GST",     (parseFloat(grn.cgst||0)+parseFloat(grn.sgst||0)).toFixed(2)],
                ["Tax On Disc",   "0.00"],
                ["Total Disc",    grn.total_discount],
                ["Round Off",     grn.round_amount],
              ].map(([k,v])=>(
                <tr key={k}>
                  <td style={{padding:"1px 0",color:"#64748b"}}>{k}</td>
                  <td style={{padding:"1px 0",textAlign:"right",fontWeight:600}}>₹{parseFloat(v||0).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{borderTop:"2px solid #0f766e"}}>
                <td style={{padding:"3px 0",fontWeight:800,color:"#0f766e",fontSize:10.5}}>Total Bill</td>
                <td style={{padding:"3px 0",textAlign:"right",fontWeight:800,color:"#0f766e",fontSize:10.5}}>
                  ₹{parseFloat(grn.net_invoice_amount||0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </FinTable>
        </MetaBox>
      </FinGrid>

      <SigRow>
        <SigCol>Entered By</SigCol>
        <SigCol>Checked By</SigCol>
        <SigCol>Verified By</SigCol>
      </SigRow>
    </GrnDoc>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */
const GRNAnalysis = () => {
  const [grnList,    setGrnList]    = useState([])
  const [vendors,    setVendors]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [fromDate,   setFromDate]   = useState(todayStr())
  const [toDate,     setToDate]     = useState(todayStr())
  const [search,     setSearch]     = useState("")
  const [viewGrn,    setViewGrn]    = useState(null)
  const [viewItems,  setViewItems]  = useState([])
  const [confirmId,  setConfirmId]  = useState(null)
  const printRef = useRef()

  /* ── Fetchers ── */
  const fetchVendors = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}vendors/`,"GET"); if(r.success) setVendors(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchGRNList = useCallback(async () => {
    try {
      const r = await apiRequest(`${baseUrl}grn/`,"GET")
      if(r.success) setGrnList(Array.isArray(r.data)?r.data:[])
    } catch {}
  },[])
  useEffect(()=>{ fetchVendors(); fetchGRNList() },[fetchVendors,fetchGRNList])

  const getVendor     = (id) => vendors.find(x=>Number(x.vendor_id)===Number(id))||null
  const getVendorName = (id) => { const v=getVendor(id); return v?v.name:String(id||"") }

  /* ── Filter ── */
  const filtered = grnList.filter(g => {
    const d = g.date?.split("T")[0] || ""
    const inRange = (!fromDate || d >= fromDate) && (!toDate || d <= toDate)
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      g.draft_number?.toLowerCase().includes(q) ||
      g.grn_number?.toLowerCase().includes(q)   ||
      getVendorName(g.vendor_id)?.toLowerCase().includes(q) ||
      g.invoice_no?.toLowerCase().includes(q)
    return inRange && matchSearch
  })

  /* ── View GRN Modal ── */
  const openView = (grn) => {
    try { setViewItems(JSON.parse(grn.items||"[]")) } catch { setViewItems([]) }
    setViewGrn(grn)
  }
  const closeView = () => { setViewGrn(null); setViewItems([]) }

  /* ── Print ── */
  const handlePrint = () => {
    const content = document.getElementById("grn-print-area")
    if(!content) return
    const win = window.open("","_blank","width=900,height=700")
    win.document.write(`
      <html><head><title>GRN - ${viewGrn?.grn_number||viewGrn?.draft_number}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10.5px; color: #111; margin: 0; padding: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f766e; color: white; padding: 4px 5px; text-align: left; font-size: 8.5px; }
        td { padding: 3px 5px; border-bottom: 1px solid #e2e8f0; font-size: 9px; }
        tr:nth-child(even) { background: #f8fafc; }
        @media print { button { display: none; } }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `)
    win.document.close()
    setTimeout(()=>win.print(), 400)
  }

  /* ── Generate GRN ── */
  /* 
    1. Sets status = "Verified"
    2. Assigns grn_number based on purchase_category prefix
    3. Creates PharmacyStock records per item via POST hospital-pharmacy-stock/
  */
const handleGenerateGRN = async (grn) => {
  if(grn.status === "Verified"){ toast.info("GRN already verified."); return }
  setConfirmId(grn.grn_id)
  try {
    const updatePayload = {
      ...grn,
      status:         "Verified",
      draft_number:   grn.draft_number,
      items:          typeof grn.items === "string" ? grn.items : JSON.stringify(grn.items||[]),
      payment_status: typeof grn.payment_status === "string" ? grn.payment_status : JSON.stringify(grn.payment_status||[]),
    }

    // Backend handles both: GRN verification + PharmacyStock creation
    const r = await apiRequest(`${baseUrl}grn/${grn.draft_number}/`, "PUT", updatePayload)

    if(!r.success){
      toast.error(r.error || "Failed to verify GRN")
      return
    }

    toast.success(`GRN Verified & stock updated! GRN: ${r.data?.grn_number}`)
    fetchGRNList()

  } catch {
    toast.error("Network error during GRN generation")
  } finally {
    setConfirmId(null)
  }
}

  /* ─────────────────────────────────────────────────────── RENDER ── */
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
          {/* ── Filter Bar ── */}
          <FilterBar>
            <div>
              <Lbl>From Date</Lbl>
              <FInp type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
            </div>
            <div>
              <Lbl>To Date</Lbl>
              <FInp type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
            </div>
            <div style={{flex:1,minWidth:200}}>
              <Lbl>Search</Lbl>
              <FInp
                placeholder="Draft No, GRN No, Vendor, Invoice…"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{width:"100%"}}
              />
            </div>
            <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
              <Button onClick={fetchGRNList} style={{height:34,fontSize:"0.8rem",padding:"0 14px"}}>
                🔄 Refresh
              </Button>
              <span style={{color:colors.textMuted,fontSize:"0.78rem",alignSelf:"center"}}>
                {filtered.length} record(s)
              </span>
            </div>
          </FilterBar>

          {/* ── Table ── */}
          <ScrollTable>
            <Table style={{minWidth:1000}}>
              <thead>
                <tr>
                  <Th style={{fontSize:"0.7rem"}}>#</Th>
                  <Th style={{fontSize:"0.7rem"}}>Draft No</Th>
                  <Th style={{fontSize:"0.7rem"}}>GRN No</Th>
                  <Th style={{fontSize:"0.7rem"}}>Date</Th>
                  <Th style={{fontSize:"0.7rem"}}>Vendor</Th>
                  <Th style={{fontSize:"0.7rem"}}>Category</Th>
                  <Th style={{fontSize:"0.7rem"}}>Invoice No</Th>
                  <Th style={{fontSize:"0.7rem"}}>Invoice Date</Th>
                  <Th style={{fontSize:"0.7rem"}}>Payment</Th>
                  <Th style={{fontSize:"0.7rem"}}>Net Amount</Th>
                  <Th style={{fontSize:"0.7rem"}}>Status</Th>
                  <Th style={{fontSize:"0.7rem"}}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr>
                    <td colSpan={12}>
                      <div style={{textAlign:"center",padding:"36px",color:colors.textMuted,fontSize:"0.85rem"}}>
                        No GRN records found for the selected date range.
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((grn,idx)=>(
                  <Tr key={grn.grn_id}>
                    <Td style={{fontSize:"0.73rem"}}>{idx+1}</Td>
                    <Td><DraftBadge>{grn.draft_number||"—"}</DraftBadge></Td>
                    <Td>
                      {grn.grn_number
                        ? <GrnBadge>{grn.grn_number}</GrnBadge>
                        : <PendingText>Pending</PendingText>}
                    </Td>
                    <Td style={{fontSize:"0.73rem"}}>{fmtDate(grn.date)}</Td>
                    <Td style={{fontWeight:600,fontSize:"0.73rem"}}>{getVendorName(grn.vendor_id)}</Td>
                    <Td style={{fontSize:"0.7rem"}}>
                      {PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label||grn.purchase_category}
                    </Td>
                    <Td style={{fontSize:"0.73rem"}}>{grn.invoice_no}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{fmtDate(grn.invoice_date)}</Td>
                    <Td style={{fontSize:"0.73rem"}}>{grn.payment_mode}</Td>
                    <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.78rem"}}>
                      {fmtAmt(grn.net_invoice_amount)}
                    </Td>
                    <Td><StatusBadge status={grn.status}>{grn.status||"Draft"}</StatusBadge></Td>
                    <Td>
                      <div style={{display:"flex",gap:4,flexWrap:"nowrap"}}>
                        {/* Generate GRN — disabled once Verified */}
                        <ActionBtn
                          variant="green"
                          onClick={()=>handleGenerateGRN(grn)}
                          disabled={grn.status==="Verified" || confirmId===grn.grn_id}
                          title={grn.status==="Verified" ? "Already Verified" : "Generate GRN & Update Stock"}
                        >
                          <CheckCircle size={12}/>
                          {confirmId===grn.grn_id ? "…" : grn.status==="Verified" ? "Verified" : "Generate GRN"}
                        </ActionBtn>

                        {/* View GRN */}
                        <ActionBtn
                          variant="blue"
                          onClick={()=>openView(grn)}
                          title="View GRN Report"
                        >
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

      {/* ── View GRN Modal ── */}
      {viewGrn && (
        <Overlay onClick={e=>{ if(e.target===e.currentTarget) closeView() }}>
          <ModalBox>
            <ModalHeader>
              <ModalTitle>
                🧾 {viewGrn.grn_number || viewGrn.draft_number}
              </ModalTitle>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <ActionBtn
                  onClick={handlePrint}
                  style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1px solid rgba(255,255,255,0.35)",fontSize:"0.73rem",padding:"3px 10px"}}
                >
                  <Printer size={12}/> Print
                </ActionBtn>
                <CloseBtn onClick={closeView}><X size={14}/></CloseBtn>
              </div>
            </ModalHeader>

            <ModalBody ref={printRef}>
              <GRNDocument
                grn={viewGrn}
                vendorInfo={getVendor(viewGrn.vendor_id)}
                items={viewItems}
              />
            </ModalBody>

            <ModalFooter>
              <Button secondary onClick={closeView} style={{fontSize:"0.8rem",padding:"5px 14px"}}>
                <X size={12}/>&nbsp;Close
              </Button>
              <Button onClick={handlePrint} style={{fontSize:"0.8rem",padding:"5px 14px"}}>
                <Printer size={12}/>&nbsp;Print / PDF
              </Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  )
}

export default GRNAnalysis