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

/* Modal */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  padding: 16px;
`
const ModalBox = styled.div`
  background: white; border-radius: 10px; width: 100%; max-width: 860px;
  max-height: 92vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
`
const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 12px 18px; border-radius: 10px 10px 0 0;
  display: flex; align-items: center; justify-content: space-between;
`
const ModalTitle  = styled.h2`margin: 0; font-size: 1rem; font-weight: 700;`
const ModalBody   = styled.div`flex: 1; overflow-y: auto; padding: 18px;`
const ModalFooter = styled.div`
  padding: 10px 18px; border-top: 1px solid ${colors.border};
  display: flex; justify-content: flex-end; gap: 8px;
`
const CloseBtn = styled.button`
  background: rgba(255,255,255,0.2); border: none; color: white;
  border-radius: 50%; width: 28px; height: 28px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.35); }
`

/* ─── GRN PDF Print area ─────────────────────────────────────────────────── */
const GrnDoc = styled.div`
  font-family: Arial, sans-serif; font-size: 11px; color: #111;
  padding: 16px; border: 1px solid #e2e8f0; border-radius: 6px;
`
const DocHeader = styled.div`
  text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px;
`
const DocTitle = styled.div`font-size: 16px; font-weight: 800; color: #0f766e; letter-spacing: 1px;`
const DocSub   = styled.div`font-size: 10px; color: #64748b; margin-top: 2px;`
const TwoCol   = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;`
const InfoBox  = styled.div`background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 10px;`
const InfoRow  = styled.div`display: flex; gap: 4px; margin-bottom: 3px; font-size: 10px;`
const InfoKey  = styled.span`font-weight: 700; color: #475569; min-width: 100px;`
const InfoVal  = styled.span`color: #0f172a;`
const DocTable = styled.table`width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px;`
const DocTh    = styled.th`
  background: #0f766e; color: white; padding: 5px 7px;
  text-align: left; font-size: 9px; font-weight: 700;
`
const DocTd    = styled.td`
  padding: 4px 7px; border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
`
const DocTr    = styled.tr`&:nth-child(even){ background: #f8fafc; }`
const TotBox   = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;
`
const TotTable = styled.table`width: 100%; font-size: 10px; border-collapse: collapse;`
const SigRow   = styled.div`
  display: flex; justify-content: space-between; margin-top: 28px; font-size: 10px;
`
const SigCol   = styled.div`text-align: center; border-top: 1px solid #94a3b8; padding-top: 4px; min-width: 120px;`

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE",    label: "Medicine Purchase (OP)" },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)" },
  { value: "OPENING_STOCK_DRUG",   label: "Opening Stock (Drug)"   },
]

const todayStr = () => new Date().toISOString().split("T")[0]
const fmtDate  = (d) => d ? d.split("T")[0] : "—"
const fmtAmt   = (v) => `₹ ${parseFloat(v||0).toFixed(2)}`

/* ─── GRN Document Component (used for view + print) ─────────────────────── */
const GRNDocument = ({ grn, vendorInfo, items }) => {
  const vendor = vendorInfo || {}
  const vendorAddr = [vendor.address_line1, vendor.address_line2, vendor.city, vendor.state]
    .filter(Boolean).join(", ")

  return (
    <GrnDoc id="grn-print-area">
      <DocHeader>
        <DocTitle>GOODS RECEIPT NOTE</DocTitle>
        <DocSub>Pharmacy Purchase — {PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label||grn.purchase_category}</DocSub>
      </DocHeader>

      <TwoCol>
        <InfoBox>
          <div style={{fontWeight:700,color:"#0f766e",marginBottom:6,fontSize:10}}>GRN DETAILS</div>
          <InfoRow><InfoKey>Draft No:</InfoKey><InfoVal>{grn.draft_number||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>GRN No:</InfoKey><InfoVal style={{fontWeight:700}}>{grn.grn_number||"Pending"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Date:</InfoKey><InfoVal>{fmtDate(grn.date)}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Invoice No:</InfoKey><InfoVal>{grn.invoice_no}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Invoice Date:</InfoKey><InfoVal>{fmtDate(grn.invoice_date)}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Payment Mode:</InfoKey><InfoVal>{grn.payment_mode}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Status:</InfoKey><InfoVal style={{fontWeight:700,color:grn.status==="Verified"?"#166534":"#854d0e"}}>{grn.status}</InfoVal></InfoRow>
        </InfoBox>
        <InfoBox>
          <div style={{fontWeight:700,color:"#0f766e",marginBottom:6,fontSize:10}}>SUPPLIER DETAILS</div>
          <InfoRow><InfoKey>Vendor Name:</InfoKey><InfoVal style={{fontWeight:700}}>{vendor.name||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Address:</InfoKey><InfoVal>{vendorAddr||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Contact:</InfoKey><InfoVal>{vendor.contact_person||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Phone:</InfoKey><InfoVal>{vendor.phone||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>Email:</InfoKey><InfoVal>{vendor.email||"—"}</InfoVal></InfoRow>
          <InfoRow><InfoKey>GSTIN:</InfoKey><InfoVal>{vendor.gstin||"—"}</InfoVal></InfoRow>
        </InfoBox>
      </TwoCol>

      <div style={{fontWeight:700,color:"#0f766e",marginBottom:6,fontSize:10}}>ITEM DETAILS</div>
      <DocTable>
        <thead>
          <tr>
            <DocTh>#</DocTh>
            <DocTh>Medicine Name</DocTh>
            <DocTh>HSN</DocTh>
            <DocTh>Batch</DocTh>
            <DocTh>Expiry</DocTh>
            <DocTh>Pack</DocTh>
            <DocTh>Units</DocTh>
            <DocTh>Qty</DocTh>
            <DocTh>Free</DocTh>
            <DocTh>Pack Price</DocTh>
            <DocTh>Item Value</DocTh>
            <DocTh>Tax%</DocTh>
            <DocTh>CGST</DocTh>
            <DocTh>SGST</DocTh>
            <DocTh>Disc%</DocTh>
            <DocTh>Purchase Cost</DocTh>
            <DocTh>MRP</DocTh>
          </tr>
        </thead>
        <tbody>
          {items.map((it,i)=>(
            <DocTr key={i}>
              <DocTd>{i+1}</DocTd>
              <DocTd style={{fontWeight:600}}>{it.name}</DocTd>
              <DocTd>{it.hsn||"—"}</DocTd>
              <DocTd>{it.batch||"—"}</DocTd>
              <DocTd>{it.expiry||"—"}</DocTd>
              <DocTd>{it.packing||"—"}</DocTd>
              <DocTd>{it.unit||"—"}</DocTd>
              <DocTd>{it.quantity}</DocTd>
              <DocTd>{it.free}</DocTd>
              <DocTd>₹{parseFloat(it.packing_price||0).toFixed(2)}</DocTd>
              <DocTd>₹{it.item_value}</DocTd>
              <DocTd>{it.purchase_tax_rate}%</DocTd>
              <DocTd>₹{it.cgst_amt}</DocTd>
              <DocTd>₹{it.sgst_amt}</DocTd>
              <DocTd>{it.purchase_discount}%</DocTd>
              <DocTd style={{fontWeight:700}}>₹{it.purchase_cost}</DocTd>
              <DocTd>₹{parseFloat(it.mrp||0).toFixed(2)}</DocTd>
            </DocTr>
          ))}
        </tbody>
      </DocTable>

      <TotBox>
        <InfoBox>
          {grn.remarks && (
            <>
              <div style={{fontWeight:700,color:"#0f766e",marginBottom:4,fontSize:10}}>REMARKS</div>
              <div style={{fontSize:10,color:"#475569"}}>{grn.remarks}</div>
            </>
          )}
        </InfoBox>
        <InfoBox>
          <div style={{fontWeight:700,color:"#0f766e",marginBottom:6,fontSize:10}}>FINANCIAL SUMMARY</div>
          <TotTable>
            <tbody>
              {[
                ["Taxable Amount",    grn.taxable_amount],
                ["CGST Total",        grn.cgst],
                ["SGST Total",        grn.sgst],
                ["Total Discount",    grn.total_discount],
                ["Total Amount",      grn.total_amount],
                ["Round Off",         grn.round_amount],
              ].map(([k,v])=>(
                <tr key={k}>
                  <td style={{padding:"2px 0",color:"#64748b"}}>{k}</td>
                  <td style={{padding:"2px 0",textAlign:"right",fontWeight:600}}>₹{parseFloat(v||0).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{borderTop:"2px solid #0f766e"}}>
                <td style={{padding:"4px 0",fontWeight:800,color:"#0f766e",fontSize:11}}>Net Invoice Amount</td>
                <td style={{padding:"4px 0",textAlign:"right",fontWeight:800,color:"#0f766e",fontSize:11}}>
                  ₹{parseFloat(grn.net_invoice_amount||0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </TotTable>
        </InfoBox>
      </TotBox>

      <SigRow>
        <SigCol>Prepared By</SigCol>
        <SigCol>Checked By</SigCol>
        <SigCol>Authorised By</SigCol>
        <SigCol>Supplier Signature</SigCol>
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
  const [viewGrn,    setViewGrn]    = useState(null)   // GRN being viewed
  const [viewItems,  setViewItems]  = useState([])
  const [confirmId,  setConfirmId]  = useState(null)   // grn_id being confirmed
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

  /* ── Filter: date range + search ── */
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
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f766e; color: white; padding: 5px 7px; text-align: left; font-size: 9px; }
        td { padding: 4px 7px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        @media print { button { display: none; } }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `)
    win.document.close()
    setTimeout(()=>win.print(), 400)
  }

  /* ── Generate GRN (status → Verified, create pharmacy stock) ── */
  const handleGenerateGRN = async (grn) => {
    if(grn.status === "Verified"){
      toast.info("GRN already verified.")
      return
    }
    setConfirmId(grn.grn_id)
    try {
      // 1. Update GRN status to Verified + assign grn_number
      const payload = {
        ...grn,
        status:      "Verified",
        grn_number:  grn.grn_number || "",   // server generates if blank (Confirmed flow)
        draft_number: grn.draft_number,
      }
      const r = await apiRequest(`${baseUrl}grn/${grn.grn_id}/`,"PUT",{
        ...payload,
        status: "Verified",
      })
      if(!r.success){ toast.error(r.error||"Failed to verify GRN"); return }

      // 2. Create pharmacy stock records for each item
      let items = []
      try { items = JSON.parse(grn.items||"[]") } catch {}

      const stockPayload = {
        grn_id:            grn.grn_id,
        grn_number:        r.data?.grn_number || grn.grn_number || "",
        draft_number:      grn.draft_number,
        purchase_category: grn.purchase_category,
        vendor_id:         grn.vendor_id,
        invoice_no:        grn.invoice_no,
        invoice_date:      grn.invoice_date,
        date:              grn.date,
        net_invoice_amount:grn.net_invoice_amount,
        payment_mode:      grn.payment_mode,
        items:             JSON.stringify(items),
        // Per-item stock detail
        stock_items: JSON.stringify(items.map(it => ({
          item_id:           it.item_id,
          item_name:         it.name,
          hsn:               it.hsn,
          batch:             it.batch,
          expiry:            it.expiry,
          packing:           it.packing,
          unit:              it.unit,
          quantity:          it.quantity,
          free:              it.free,
          packing_price:     it.packing_price,
          unit_price:        it.unit_price,
          mrp:               it.mrp,
          purchase_tax_rate: it.purchase_tax_rate,
          cgst_percent:      it.cgst_percent,
          sgst_percent:      it.sgst_percent,
          cgst_amt:          it.cgst_amt,
          sgst_amt:          it.sgst_amt,
          purchase_discount: it.purchase_discount,
          purchase_discount_amt: it.purchase_discount_amt,
          purchase_cost:     it.purchase_cost,
          selling_tax_rate:  it.selling_tax_rate,
          selling_cgst:      it.selling_cgst,
          selling_sgst:      it.selling_sgst,
          item_value:        it.item_value,
        }))),
      }

      const sr = await apiRequest(`${baseUrl}hospital-pharmacy-stock/`,"POST",stockPayload)
      if(sr.success){
        toast.success(`GRN Verified & stock updated! GRN: ${r.data?.grn_number||""}`)
      } else {
        toast.warn("GRN verified but stock entry failed: " + (sr.error||""))
      }

      fetchGRNList()
    } catch(e){
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
            <PageTitle>📊 GRN Report</PageTitle>
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
                          disabled={grn.status==="Verified"||confirmId===grn.grn_id}
                          title={grn.status==="Verified"?"Already Verified":"Generate GRN & Update Stock"}
                        >
                          <CheckCircle size={12}/>
                          {confirmId===grn.grn_id?"…":"Generate GRN"}
                        </ActionBtn>

                        {/* View GRN */}
                        <ActionBtn
                          variant="blue"
                          onClick={()=>openView(grn)}
                          title="View GRN Details"
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
                🧾 GRN Details — {viewGrn.grn_number || viewGrn.draft_number}
              </ModalTitle>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <ActionBtn
                  variant="blue"
                  onClick={handlePrint}
                  style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1px solid rgba(255,255,255,0.4)"}}
                >
                  <Printer size={13}/> Print / PDF
                </ActionBtn>
                <CloseBtn onClick={closeView}><X size={15}/></CloseBtn>
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
              <Button secondary onClick={closeView}><X size={13}/>&nbsp;Close</Button>
              <Button onClick={handlePrint}><Printer size={13}/>&nbsp;Print / Download PDF</Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  )
}

export default GRNAnalysis