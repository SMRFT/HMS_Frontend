import React, { useState, useEffect, useCallback } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormRow, TextArea, FormContent,
  ControlsContainer, SearchContainer, InputWrapper, ButtonContainer,
  TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Plus, Trash2, X, ShoppingCart, Lock } from "lucide-react"
import styled from "styled-components"

/* ─── Styled Components ─────────────────────────────────────────────────── */
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 14px 20px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
`
const PageTitle    = styled.h1`margin: 0; font-size: 1.1rem; font-weight: 700;`
const PageSubtitle = styled.p`margin: 2px 0 0; font-size: 0.75rem; opacity: 0.8;`
const Card = styled.div`
  background: white; border: 1px solid ${colors.border};
  border-radius: 8px; margin-bottom: 12px; overflow: visible;
`
const CardHeader = styled.div`
  background: ${colors.tabBg}; padding: 8px 14px; border-bottom: 1px solid ${colors.border};
  font-weight: 600; font-size: 0.8rem; color: ${colors.primary};
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`
const CardBody = styled.div`padding: 12px 14px;`
const GridRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.cols || "repeat(3,1fr)"};
  gap: 8px; align-items: flex-end; margin-bottom: 8px;
  
  /* Responsive breakpoints based on col count */
  @media(max-width: 900px){
    grid-template-columns: repeat(2, 1fr) !important;
  }
  @media(max-width: 560px){
    grid-template-columns: 1fr !important;
  }
`
const ReadOnlyInput = styled(Input)`
  background: #f1f5f9 !important; cursor: default;
  color: ${colors.textMuted}; font-size: 0.8rem;
`
const CalcInput = styled(Input)`
  background: #f1f5f9 !important; color: ${colors.textMuted};
  cursor: default; font-size: 0.8rem;
`
const Lbl = styled(Label)`font-size: 0.72rem; margin-bottom: 2px; display: block;`
const ItemPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media(max-width: 960px){ grid-template-columns: 1fr; }
`
const Panel = styled.div`
  border: 1px solid ${colors.border}; border-radius: 6px;
  padding: 10px; background: #fafafa;
`
const PanelTitle = styled.div`
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.4px; color: ${colors.primary}; margin-bottom: 8px;
  padding-bottom: 4px; border-bottom: 1px solid ${colors.border};
`
const TaxBox   = styled.div`background:#f0f9ff;border:1px solid #bae6fd;border-radius:5px;padding:9px;margin-top:7px;`
const GreenBox = styled.div`background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:9px;margin-top:7px;`
const CostBar  = styled.div`
  margin-top: 7px; padding: 6px 10px; background: #e0f2fe; border-radius: 5px;
  font-size: 0.8rem; color: #0369a1; font-weight: 600;
  display: flex; justify-content: space-between; align-items: center;
`
const SummaryStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8fafc;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 12px;
  @media(max-width: 900px){ grid-template-columns: repeat(3, 1fr); }
  @media(max-width: 600px){ grid-template-columns: repeat(2, 1fr); }
`
const SumCard  = styled.div`display:flex;flex-direction:column;gap:2px;`
const SumLabel = styled.span`font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:${colors.textMuted};`
const SumValue = styled.span`font-size:0.9rem;font-weight:700;color:${p=>p.primary?colors.primary:colors.textMain};`
const ActionBtn = styled.button`
  padding: 3px 9px; border: none; border-radius: 4px; font-size: 0.75rem;
  font-weight: 600; cursor: pointer;
  background: ${p => p.danger ? "#fee2e2" : colors.tabBg};
  color: ${p => p.danger ? colors.danger : colors.primary};
  &:hover { background: ${p => p.danger ? "#fecaca" : "#b2dfdb"}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`
const DraftBadge  = styled.span`background:#fef9c3;color:#854d0e;font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:20px;`
const GrnBadge    = styled.span`background:#dcfce7;color:#166534;font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:20px;`
const PendingText = styled.span`color:#94a3b8;font-size:0.7rem;font-style:italic;`
const StatusBadge = styled.span`
  background: ${p => p.status === "Verified" ? "#dcfce7" : p.status === "Draft" ? "#fef9c3" : "#e0f2fe"};
  color: ${p => p.status === "Verified" ? "#166534" : p.status === "Draft" ? "#854d0e" : "#0369a1"};
  font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 20px;
`
const VerifiedBanner = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;
  padding: 10px 14px; margin-bottom: 10px; font-size: 0.82rem;
  color: #166534; font-weight: 600;
`
const AutoWrap = styled.div`position: relative;`
const DropList = styled.ul`
  position: absolute; top: 100%; left: 0; right: 0; z-index: 9999;
  background: white; border: 1px solid ${colors.border}; border-radius: 0 0 5px 5px;
  max-height: 150px; overflow-y: auto; list-style: none; margin: 0; padding: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
`
const DropItem = styled.li`
  padding: 6px 10px; font-size: 0.8rem; cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  &:hover { background: #f0fdf4; color: ${colors.primary}; }
  &:last-child { border-bottom: none; }
`
// Replace ScrollTable
const ScrollTable = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Prevent table from blowing out parent */
  & table {
    table-layout: fixed;
    min-width: 900px;
  }
`

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE",    label: "Medicine Purchase (OP)" },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)" },
  { value: "OPENING_STOCK_DRUG",   label: "Opening Stock (Drug)"   },
]
const PAYMENT_MODES = ["CHEQUE","CASH","DD"]
const TAX_RATES = [
  { label: "EXEMPTED GST", rate: 0  },
  { label: "RATE OF 5%",   rate: 5  },
  { label: "RATE OF 12%",  rate: 12 },
  { label: "RATE OF 18%",  rate: 18 },
  { label: "RATE OF 28%",  rate: 28 },
]
const MONTHS   = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const getYears = () => { const y = new Date().getFullYear(); return Array.from({length:10},(_,i)=>String(y+i)) }
const todayStr = () => new Date().toISOString().split("T")[0]

const EMPTY_GRN = {
  purchase_category:"",vendor_id:"",date:todayStr(),
  invoice_no:"",invoice_date:todayStr(),payment_mode:"CHEQUE",
  grn_type:"INVOICE",remarks:"",
  taxable_amount:"0.00",non_taxable_amount:"0.00",
  cgst:"0.00",sgst:"0.00",igst:"0.00",
  tax_paid_to_supplier:"0.00",total_discount:"0.00",
  round_amount:"0",total_amount:"0.00",net_invoice_amount:"0.00",
}

const EMPTY_ITEM = {
  name:"",item_id:"",hsn:"",batch:"",
  expiry_month:"",expiry_year:"",
  packing:"",unit:"",quantity:"0",free:"0",
  item_value:"0.00",packing_price:"",unit_price:"0.00",
  purchase_tax_label:"RATE OF 5%",purchase_tax_rate:"5",
  cgst_percent:"2.50",sgst_percent:"2.50",
  cgst_amt:"0.00",sgst_amt:"0.00",
  purchase_discount:"0",purchase_discount_amt:"0.00",
  purchase_cost:"0.00",mrp:"",
  selling_tax_label:"RATE OF 5%",selling_tax_rate:"5",
  selling_cgst:"0.00",selling_sgst:"0.00",
}

/* ─── Recalc helper ──────────────────────────────────────────────────────── */
function recalcItem(item) {
  const packing      = parseFloat(item.packing)          || 0
  const unit         = parseFloat(item.unit)              || 0
  const packingPrice = parseFloat(item.packing_price)     || 0
  const taxRate      = parseFloat(item.purchase_tax_rate) || 0
  const discount     = parseFloat(item.purchase_discount) || 0
  const quantity     = packing * unit
  const item_value   = quantity * packingPrice
  const unit_price   = packing > 0 ? packingPrice / packing : 0
  const cgst_pct     = taxRate / 2
  const cgst_amt     = item_value * (cgst_pct / 100)
  const sgst_amt     = item_value * (cgst_pct / 100)
  const disc_amt     = item_value * (discount / 100)
  const purchase_cost = item_value + cgst_amt + sgst_amt - disc_amt
  return {
    ...item,
    quantity:              String(quantity),
    item_value:            item_value.toFixed(2),
    unit_price:            unit_price.toFixed(4),
    cgst_percent:          cgst_pct.toFixed(2),
    sgst_percent:          cgst_pct.toFixed(2),
    cgst_amt:              cgst_amt.toFixed(2),
    sgst_amt:              sgst_amt.toFixed(2),
    purchase_discount_amt: disc_amt.toFixed(2),
    purchase_cost:         purchase_cost.toFixed(2),
    selling_tax_label:     item.purchase_tax_label,
    selling_tax_rate:      item.purchase_tax_rate,
    selling_cgst:          cgst_amt.toFixed(2),
    selling_sgst:          sgst_amt.toFixed(2),
  }
}

/* ─── Component ─────────────────────────────────────────────────────────── */
const GRNGeneration = () => {
  const [vendors,     setVendors]     = useState([])
  const [medicines,   setMedicines]   = useState([])
  const [grnList,     setGrnList]     = useState([])
  const [grnData,     setGrnData]     = useState(EMPTY_GRN)
  const [vendorInfo,  setVendorInfo]  = useState(null)
  const [items,       setItems]       = useState([])
  const [curItem,     setCurItem]     = useState(EMPTY_ITEM)
  const [medSearch,   setMedSearch]   = useState("")
  const [showDrop,    setShowDrop]    = useState(false)
  const [activeTab,   setActiveTab]   = useState("create")
  const [editDraftNo, setEditDraftNo] = useState("")   // PRIMARY edit key
  const [editStatus,  setEditStatus]  = useState("")
  const [search,      setSearch]      = useState("")
  const [loading,     setLoading]     = useState(false)

  /* ── Fetchers ── */
  const fetchVendors   = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}vendors/`,"GET"); if(r.success) setVendors(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchMedicines = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}pharmacy-items/`,"GET"); if(r.success) setMedicines(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchGRNList   = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}grn/`,"GET"); if(r.success) setGrnList(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  useEffect(()=>{ fetchVendors(); fetchMedicines(); fetchGRNList() },[fetchVendors,fetchMedicines,fetchGRNList])

  /* ── Derived ── */
  const isEdit     = !!editDraftNo
  const isVerified = editStatus === "Verified"

  /* ── GRN totals recalc ── */
  useEffect(()=>{
    if(items.length===0){
      setGrnData(p=>({...p,taxable_amount:"0.00",non_taxable_amount:"0.00",cgst:"0.00",sgst:"0.00",
        tax_paid_to_supplier:"0.00",total_discount:"0.00",total_amount:"0.00",net_invoice_amount:"0.00"}))
      return
    }
    const t = items.reduce((a,i)=>{
      a.tax  += parseFloat(i.item_value)||0
      a.cgst += parseFloat(i.cgst_amt)||0
      a.sgst += parseFloat(i.sgst_amt)||0
      a.disc += parseFloat(i.purchase_discount_amt)||0
      a.tot  += parseFloat(i.purchase_cost)||0
      return a
    },{tax:0,cgst:0,sgst:0,disc:0,tot:0})
    setGrnData(p=>{
      const net = t.tot + (parseFloat(p.round_amount)||0)
      return {
        ...p,
        taxable_amount:      t.tax.toFixed(2),
        non_taxable_amount:  t.tax.toFixed(2),
        cgst:                t.cgst.toFixed(2),
        sgst:                t.sgst.toFixed(2),
        tax_paid_to_supplier:(t.cgst+t.sgst).toFixed(2),
        total_discount:      t.disc.toFixed(2),
        total_amount:        t.tot.toFixed(2),
        net_invoice_amount:  net.toFixed(2),
      }
    })
  },[items])

  useEffect(()=>{
    const tot   = parseFloat(grnData.total_amount)||0
    const round = parseFloat(grnData.round_amount)||0
    setGrnData(p=>({...p, net_invoice_amount:(tot+round).toFixed(2)}))
  },[grnData.round_amount]) // eslint-disable-line

  /* ── Handlers ── */
  const handleVendorChange = (e) => {
    if(isVerified) return
    const raw = e.target.value  // always a string from select
    const v   = vendors.find(x => String(x.vendor_id) === String(raw)) || null
    setVendorInfo(v)
    setGrnData(p => ({ ...p, vendor_id: raw }))  // keep as string, don't parseInt
  }

  const handleGrnChange = (e) => {
    if(isVerified) return
    const {name,value} = e.target
    setGrnData(p=>({...p,[name]:value}))
  }

  const filteredMeds = medicines.filter(m =>
    `${m.item_name} ${m.item_last_name||""}`.toLowerCase().includes(medSearch.toLowerCase())
  )
  const selectMedicine = (med) => {
    if(isVerified) return
    const fullName = `${med.item_name} ${med.item_last_name||""}`.trim()
    setMedSearch(fullName); setShowDrop(false)
    setCurItem(p => recalcItem({...p, name:fullName, item_id:med.item_id, hsn:med.hsn||""}))
  }

  const handleItemChange = (e) => {
    if(isVerified) return
    const {name,value} = e.target
    let u = {...curItem,[name]:value}
    if(name==="purchase_tax_label"){ const f=TAX_RATES.find(t=>t.label===value); u.purchase_tax_rate=f?String(f.rate):"0" }
    setCurItem(recalcItem(u))
  }

  const addItem = () => {
    if(isVerified) return
    if(!curItem.name){ toast.error("Select a medicine"); return }
    if(!curItem.packing_price||parseFloat(curItem.packing_price)<=0){ toast.error("Enter packing price"); return }
    const expiry = curItem.expiry_month&&curItem.expiry_year ? `${curItem.expiry_month}/${curItem.expiry_year}` : ""
    setItems(p=>[...p,{...curItem,expiry,id:Date.now()}])
    setCurItem(EMPTY_ITEM); setMedSearch("")
  }
  const removeItem = (id) => { if(isVerified) return; setItems(p=>p.filter(i=>i.id!==id)) }

  /* ── Save / Update Draft ── */
  const saveGRN = async () => {
    if(isVerified){ toast.warn("Verified GRN cannot be edited."); return }
    if(!grnData.purchase_category){ toast.error("Purchase Category required"); return }
    if(!grnData.vendor_id){ toast.error("Vendor required"); return }
    if(!grnData.invoice_no){ toast.error("Invoice No required"); return }
    if(items.length===0){ toast.error("Add at least one item"); return }

    const toDateTime = (d) => d ? (d.includes("T") ? d : `${d}T00:00:00`) : d

    const payload = {
      ...grnData,
      grn_type:     "INVOICE",
      status:       "Draft",
      date:         toDateTime(grnData.date),
      invoice_date: toDateTime(grnData.invoice_date),
      grn_number:   "",
      // Always send draft_number in body when editing — backend uses this as primary lookup key
      draft_number: isEdit ? editDraftNo : undefined,
      items:        JSON.stringify(items),
      payment_status: JSON.stringify([{
        status: "Not Paid", amount_paid: 0.0,
        pending_amount: parseFloat(grnData.net_invoice_amount),
        payment_method: null, payment_details: null, paid_by: null,
      }]),
    }

    // Use draft_number in URL for PUT — avoids ObjectId routing issues entirely
    const url    = isEdit ? `${baseUrl}grn/${editDraftNo}/` : `${baseUrl}grn/`
    const method = isEdit ? "PUT" : "POST"

    setLoading(true)
    try {
      const r = await apiRequest(url, method, payload)
      if(r.success){
        const draftNo = r.data?.draft_number || ""
        toast.success(isEdit ? `GRN updated (${draftNo})` : `Draft saved: ${draftNo}`)

        if(!isEdit){
          // ✅ First-time save: lock into edit mode so next save uses PUT, not POST
          setEditDraftNo(r.data?.draft_number || "")
          setEditStatus(r.data?.status || "Draft")
          // Also update grn_number in form state if returned
          if(r.data?.grn_number !== undefined){
            setGrnData(p=>({...p, grn_number: r.data.grn_number}))
          }
        }

        fetchGRNList()
      } else {
        toast.error(r.error || "Failed to save GRN")
      }
    } catch { toast.error("Network error") } finally { setLoading(false) }
  }

  /* ── Load GRN for edit / view ── */
  const handleEdit = (grn) => {
    setGrnData({
      purchase_category:    grn.purchase_category||"",
      vendor_id:            grn.vendor_id||"",
      date:                 grn.date?.split("T")[0]||todayStr(),
      invoice_no:           grn.invoice_no||"",
      invoice_date:         grn.invoice_date?.split("T")[0]||todayStr(),
      payment_mode:         grn.payment_mode||"CHEQUE",
      grn_type:             "INVOICE",
      remarks:              grn.remarks||"",
      taxable_amount:       grn.taxable_amount||"0.00",
      non_taxable_amount:   grn.non_taxable_amount||"0.00",
      cgst:                 grn.cgst||"0.00",
      sgst:                 grn.sgst||"0.00",
      igst:                 grn.igst||"0.00",
      tax_paid_to_supplier: grn.tax_paid_to_supplier||"0.00",
      total_discount:       grn.total_discount||"0.00",
      round_amount:         grn.round_amount||"0",
      total_amount:         grn.total_amount||"0.00",
      net_invoice_amount:   grn.net_invoice_amount||"0.00",
      grn_number:           grn.grn_number||"",
    })
    setVendorInfo(vendors.find(x => String(x.vendor_id) === String(grn.vendor_id)) || null)
    try{ setItems(JSON.parse(grn.items||"[]")) } catch { setItems([]) }
    setEditDraftNo(grn.draft_number||"")   // ← PRIMARY key for all subsequent PUTs
    setEditStatus(grn.status||"Draft")
    setActiveTab("create")
    window.scrollTo({top:0,behavior:"smooth"})
  }

  const resetForm = () => {
    setGrnData(EMPTY_GRN); setItems([]); setCurItem(EMPTY_ITEM)
    setMedSearch(""); setEditDraftNo(""); setEditStatus(""); setVendorInfo(null)
  }

  /* ── Helpers ── */
  const getVendorName = (id) => {
    const v = vendors.find(x => String(x.vendor_id) === String(id))
    return v ? v.name : String(id || "")
  }
  const filtered = grnList.filter(g=>{
    const q = search.toLowerCase()
    return g.draft_number?.toLowerCase().includes(q) ||
           g.grn_number?.toLowerCase().includes(q)   ||
           getVendorName(g.vendor_id)?.toLowerCase().includes(q) ||
           g.invoice_no?.toLowerCase().includes(q)
  })

  /* ─────────────────────────────────────────────────────── RENDER ── */
  return (
    <PageWrapper>
      <Container style={{maxWidth:"100%", padding:"0 8px", overflowX:"hidden", boxSizing:"border-box"}}>
        <PageHeader>
          <div>
            <PageTitle>🧾 GRN Generation</PageTitle>
            <PageSubtitle>Goods Receipt Note — Pharmacy Purchase</PageSubtitle>
          </div>
          <div style={{display:"flex",gap:6}}>
            {["create","list"].map(tab=>(
              <Button key={tab} onClick={()=>setActiveTab(tab)}
                style={activeTab===tab
                  ?{background:"white",color:colors.primary,padding:"6px 12px",fontSize:"0.8rem"}
                  :{background:"rgba(255,255,255,0.18)",color:"white",border:"1px solid rgba(255,255,255,0.35)",padding:"6px 12px",fontSize:"0.8rem"}}>
                {tab==="create"?"+ Create GRN":"📋 GRN List"}
              </Button>
            ))}
          </div>
        </PageHeader>

        <FormContent style={{padding:"10px 0"}}>
          {activeTab==="create" && (
            <>
              {/* ── Verified lock banner ── */}
              {isVerified && (
                <VerifiedBanner>
                  <Lock size={15}/>
                  This GRN is <strong>Verified</strong> — editing is not allowed.
                  {grnData.grn_number && <GrnBadge style={{marginLeft:6}}>GRN: {grnData.grn_number}</GrnBadge>}
                </VerifiedBanner>
              )}

              {/* ── Inward Details ── */}
              <Card>
                <CardHeader>
                  📋 Inward Details
                  {isEdit && (
                    <span style={{display:"flex",alignItems:"center",gap:5}}>
                      <DraftBadge>Draft: {editDraftNo}</DraftBadge>
                      {grnData.grn_number && <GrnBadge>GRN: {grnData.grn_number}</GrnBadge>}
                      {editStatus && <StatusBadge status={editStatus}>{editStatus}</StatusBadge>}
                    </span>
                  )}
                </CardHeader>
                <CardBody>
                  <GridRow cols="repeat(3,1fr)">
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Purchase Category *</Lbl>
                      <Select name="purchase_category" value={grnData.purchase_category} onChange={handleGrnChange} disabled={isVerified} style={{fontSize:"0.8rem"}}>
                        <option value="">-- Select --</option>
                        {PURCHASE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                      </Select>
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Date</Lbl>
                      <Input type="date" name="date" value={grnData.date} onChange={handleGrnChange} disabled={isVerified} style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Vendor *</Lbl>
                      <Select name="vendor_id" value={grnData.vendor_id} onChange={handleVendorChange} disabled={isVerified} style={{fontSize:"0.8rem"}}>
                        <option value="">-- Select Vendor --</option>
                        {vendors.map(v=><option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                      </Select>
                    </InputWrapper>
                  </GridRow>

                  <GridRow cols="repeat(3,1fr)">
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Supplier Address</Lbl>
                      <ReadOnlyInput
                        value={vendorInfo
                          ? [vendorInfo.address_line1,vendorInfo.address_line2,vendorInfo.city,vendorInfo.state].filter(Boolean).join(", ")
                          : ""}
                        readOnly placeholder="Auto-filled from vendor" style={{fontSize:"0.8rem"}}
                      />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Contact Person</Lbl>
                      <ReadOnlyInput value={vendorInfo?.contact_person||""} readOnly placeholder="Auto-filled" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Phone</Lbl>
                      <ReadOnlyInput value={vendorInfo?.phone||""} readOnly placeholder="Auto-filled" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                  </GridRow>

                  <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Type</Lbl>
                      <ReadOnlyInput value="Invoice" readOnly style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Invoice No *</Lbl>
                      <Input name="invoice_no" value={grnData.invoice_no} onChange={handleGrnChange} disabled={isVerified} placeholder="e.g. INV-52412" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Invoice Date</Lbl>
                      <Input type="date" name="invoice_date" value={grnData.invoice_date} onChange={handleGrnChange} disabled={isVerified} style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Payment Mode</Lbl>
                      <Select name="payment_mode" value={grnData.payment_mode} onChange={handleGrnChange} disabled={isVerified} style={{fontSize:"0.8rem"}}>
                        {PAYMENT_MODES.map(m=><option key={m} value={m}>{m}</option>)}
                      </Select>
                    </InputWrapper>
                  </GridRow>
                </CardBody>
              </Card>

              {/* ── Item Entry ── */}
              {!isVerified && (
                <Card>
                  <CardHeader>💊 Item Entry</CardHeader>
                  <CardBody>
                    <ItemPanel>
                      <Panel>
                        <PanelTitle>Item &amp; Cost Details</PanelTitle>
                        <GridRow cols="2fr 1fr" style={{marginBottom:7}}>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Medicine Name *</Lbl>
                            <AutoWrap>
                              <Input
                                value={medSearch}
                                onChange={e=>{setMedSearch(e.target.value);setShowDrop(true)}}
                                onFocus={()=>setShowDrop(true)}
                                onBlur={()=>setTimeout(()=>setShowDrop(false),180)}
                                placeholder="Search medicine…" style={{fontSize:"0.8rem"}}
                              />
                              {showDrop&&medSearch&&filteredMeds.length>0&&(
                                <DropList>
                                  {filteredMeds.map(m=>(
                                    <DropItem key={m.item_id} onMouseDown={()=>selectMedicine(m)}>
                                      {m.item_name} {m.item_last_name||""}
                                      <span style={{fontSize:"0.7rem",color:colors.textMuted,marginLeft:5}}>HSN:{m.hsn||"—"}</span>
                                    </DropItem>
                                  ))}
                                </DropList>
                              )}
                            </AutoWrap>
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>HSN Code</Lbl>
                            <CalcInput value={curItem.hsn} readOnly placeholder="Auto-filled" />
                          </InputWrapper>
                        </GridRow>

                        <GridRow cols="1fr 1fr 1fr" style={{marginBottom:7}}>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Batch No.</Lbl>
                            <Input name="batch" value={curItem.batch} onChange={handleItemChange} placeholder="Batch" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Exp Month</Lbl>
                            <Select name="expiry_month" value={curItem.expiry_month} onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                              <option value="">MM</option>
                              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                            </Select>
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Exp Year</Lbl>
                            <Select name="expiry_year" value={curItem.expiry_year} onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                              <option value="">YYYY</option>
                              {getYears().map(y=><option key={y} value={y}>{y}</option>)}
                            </Select>
                          </InputWrapper>
                        </GridRow>

                        <GridRow cols="repeat(4,1fr)" style={{marginBottom:7}}>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Packing</Lbl>
                            <Input type="number" name="packing" value={curItem.packing} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>No. of Units</Lbl>
                            <Input type="number" name="unit" value={curItem.unit} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Qty (auto)</Lbl>
                            <CalcInput value={curItem.quantity} readOnly />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Free</Lbl>
                            <Input type="number" name="free" value={curItem.free} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                        </GridRow>

                        <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Packing Price ₹</Lbl>
                            <Input type="number" name="packing_price" value={curItem.packing_price} onChange={handleItemChange} placeholder="0.00" min="0" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Item Value (auto)</Lbl>
                            <CalcInput value={`₹ ${curItem.item_value}`} readOnly />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Unit Price (auto)</Lbl>
                            <CalcInput value={`₹ ${parseFloat(curItem.unit_price).toFixed(2)}`} readOnly />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>MRP ₹</Lbl>
                            <Input type="number" name="mrp" value={curItem.mrp} onChange={handleItemChange} placeholder="0.00" min="0" style={{fontSize:"0.8rem"}} />
                          </InputWrapper>
                        </GridRow>
                      </Panel>

                      <Panel>
                        <PanelTitle>Tax Details</PanelTitle>
                        <TaxBox>
                          <div style={{fontSize:"0.68rem",fontWeight:700,color:"#0369a1",marginBottom:7}}>PURCHASE TAX</div>
                          <GridRow cols="1.4fr 1fr 1fr" style={{marginBottom:7}}>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Tax Rate</Lbl>
                              <Select name="purchase_tax_label" value={curItem.purchase_tax_label} onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                                {TAX_RATES.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
                              </Select>
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>CGST ({curItem.cgst_percent}%)</Lbl>
                              <CalcInput value={`₹ ${curItem.cgst_amt}`} readOnly />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>SGST ({curItem.sgst_percent}%)</Lbl>
                              <CalcInput value={`₹ ${curItem.sgst_amt}`} readOnly />
                            </InputWrapper>
                          </GridRow>
                          <GridRow cols="1fr 1fr" style={{marginBottom:0}}>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Purchase Discount (%)</Lbl>
                              <Input type="number" name="purchase_discount" value={curItem.purchase_discount} onChange={handleItemChange} placeholder="0" min="0" max="100" style={{fontSize:"0.8rem"}} />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Discount Amt (auto)</Lbl>
                              <CalcInput value={`₹ ${curItem.purchase_discount_amt}`} readOnly />
                            </InputWrapper>
                          </GridRow>
                          <CostBar>
                            <span>Purchase Cost</span>
                            <strong style={{fontSize:"0.9rem"}}>₹ {curItem.purchase_cost}</strong>
                          </CostBar>
                        </TaxBox>

                        <GreenBox>
                          <div style={{fontSize:"0.68rem",fontWeight:700,color:"#15803d",marginBottom:7}}>
                            SELLING TAX <span style={{fontWeight:400}}>(auto from purchase)</span>
                          </div>
                          <GridRow cols="1.4fr 1fr 1fr" style={{marginBottom:0}}>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Tax Rate</Lbl>
                              <ReadOnlyInput value={curItem.selling_tax_label} readOnly />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>CGST</Lbl>
                              <CalcInput value={`₹ ${curItem.selling_cgst}`} readOnly />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>SGST</Lbl>
                              <CalcInput value={`₹ ${curItem.selling_sgst}`} readOnly />
                            </InputWrapper>
                          </GridRow>
                        </GreenBox>

                        <div style={{marginTop:12}}>
                          <Button onClick={addItem} style={{width:"100%",fontSize:"0.82rem",padding:"8px"}}>
                            <Plus size={13}/> &nbsp; Add Item to GRN
                          </Button>
                        </div>
                      </Panel>
                    </ItemPanel>
                  </CardBody>
                </Card>
              )}

              {/* ── Items Table ── */}
              {items.length>0&&(
                <Card>
                  <CardHeader>📦 Items Added ({items.length})</CardHeader>
                  <CardBody style={{padding:"8px 6px"}}>
                    <ScrollTable>
                      <Table style={{minWidth:900}}>
                        <thead><tr>
                          <Th style={{fontSize:"0.72rem"}}>#</Th>
                          <Th style={{fontSize:"0.72rem"}}>Medicine</Th>
                          <Th style={{fontSize:"0.72rem"}}>HSN</Th>
                          <Th style={{fontSize:"0.72rem"}}>Batch</Th>
                          <Th style={{fontSize:"0.72rem"}}>Expiry</Th>
                          <Th style={{fontSize:"0.72rem"}}>Pack</Th>
                          <Th style={{fontSize:"0.72rem"}}>Units</Th>
                          <Th style={{fontSize:"0.72rem"}}>Qty</Th>
                          <Th style={{fontSize:"0.72rem"}}>Free</Th>
                          <Th style={{fontSize:"0.72rem"}}>Pack ₹</Th>
                          <Th style={{fontSize:"0.72rem"}}>Item Val</Th>
                          <Th style={{fontSize:"0.72rem"}}>Tax%</Th>
                          <Th style={{fontSize:"0.72rem"}}>CGST</Th>
                          <Th style={{fontSize:"0.72rem"}}>SGST</Th>
                          <Th style={{fontSize:"0.72rem"}}>Disc%</Th>
                          <Th style={{fontSize:"0.72rem"}}>Cost</Th>
                          <Th style={{fontSize:"0.72rem"}}>MRP</Th>
                          {!isVerified && <Th style={{fontSize:"0.72rem"}}></Th>}
                        </tr></thead>
                        <tbody>
                          {items.map((it,idx)=>(
                            <Tr key={it.id}>
                              <Td style={{fontSize:"0.75rem"}}>{idx+1}</Td>
                              <Td style={{fontWeight:600,minWidth:100,fontSize:"0.75rem"}}>{it.name}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.hsn||"—"}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.batch||"—"}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.expiry||"—"}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.packing||"—"}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.unit||"—"}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.quantity}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.free}</Td>
                              <Td style={{fontSize:"0.75rem"}}>₹{parseFloat(it.packing_price||0).toFixed(2)}</Td>
                              <Td style={{fontSize:"0.75rem"}}>₹{it.item_value}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.purchase_tax_rate}%</Td>
                              <Td style={{fontSize:"0.75rem"}}>₹{it.cgst_amt}</Td>
                              <Td style={{fontSize:"0.75rem"}}>₹{it.sgst_amt}</Td>
                              <Td style={{fontSize:"0.75rem"}}>{it.purchase_discount}%</Td>
                              <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.75rem"}}>₹{it.purchase_cost}</Td>
                              <Td style={{fontSize:"0.75rem"}}>₹{parseFloat(it.mrp||0).toFixed(2)}</Td>
                              {!isVerified && (
                                <Td>
                                  <Trash2 size={13} color={colors.danger} style={{cursor:"pointer"}} onClick={()=>removeItem(it.id)} />
                                </Td>
                              )}
                            </Tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollTable>
                  </CardBody>
                </Card>
              )}

              {/* ── Financial Summary ── */}
              {items.length>0&&(
                <Card>
                  <CardHeader>💰 Financial Summary</CardHeader>
                  <CardBody>
                    <SummaryStrip>
                      {[
                        ["Taxable Amount",  `₹ ${grnData.taxable_amount}`],
                        ["CGST Total",      `₹ ${grnData.cgst}`],
                        ["SGST Total",      `₹ ${grnData.sgst}`],
                        ["Total Discount",  `₹ ${grnData.total_discount}`],
                        ["Non-Taxable Amt", `₹ ${grnData.non_taxable_amount}`],
                        ["Total Amount",    `₹ ${grnData.total_amount}`],
                      ].map(([lbl,val])=>(
                        <SumCard key={lbl}><SumLabel>{lbl}</SumLabel><SumValue>{val}</SumValue></SumCard>
                      ))}
                      <SumCard>
                        <SumLabel>Round Off</SumLabel>
                        <SumValue>₹ {grnData.round_amount}</SumValue>
                        <Input type="number" name="round_amount" value={grnData.round_amount} onChange={handleGrnChange} style={{height:30,fontSize:"0.82rem",width:"100%"}} />
                      </SumCard>
                      <SumCard>
                        <SumLabel>Net Invoice Amount</SumLabel>
                        <SumValue primary>₹ {grnData.net_invoice_amount}</SumValue>
                      </SumCard>
                    </SummaryStrip>
                    {!isVerified && (
                      <div style={{marginTop:10}}>
                        <Lbl>Remarks</Lbl>
                        <TextArea name="remarks" value={grnData.remarks} onChange={handleGrnChange} placeholder="Any remarks…" style={{marginTop:3,fontSize:"0.8rem"}} />
                      </div>
                    )}
                    {isVerified && grnData.remarks && (
                      <div style={{marginTop:10,fontSize:"0.8rem",color:colors.textMuted}}>
                        <strong>Remarks:</strong> {grnData.remarks}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {!isVerified && (
                <ButtonContainer>
                  <Button secondary onClick={resetForm}><X size={13}/> Clear Form</Button>
                  <Button onClick={saveGRN} disabled={loading}>
                    <ShoppingCart size={13}/>&nbsp;{loading?"Saving…":isEdit?"Update Draft":"Save as Draft"}
                  </Button>
                </ButtonContainer>
              )}
              {isVerified && (
                <ButtonContainer>
                  <Button secondary onClick={resetForm}><X size={13}/> Close</Button>
                </ButtonContainer>
              )}
            </>
          )}

          {/* ── GRN List ── */}
          {activeTab==="list"&&(
            <>
              <SectionTitle><h3>GRN Records</h3></SectionTitle>
              <ControlsContainer>
                <SearchContainer>
                  <InputWrapper>
                    <Label>Search</Label>
                    <Input
                      style={{minWidth:220,fontSize:"0.82rem"}}
                      placeholder="Draft No, GRN No, Vendor, Invoice…"
                      value={search}
                      onChange={e=>setSearch(e.target.value)}
                    />
                  </InputWrapper>
                </SearchContainer>
                <div style={{color:colors.textMuted,fontSize:"0.8rem",alignSelf:"flex-end"}}>
                  {filtered.length} record(s)
                </div>
              </ControlsContainer>
              <ScrollTable>
                <Table style={{minWidth:900}}>
                  <thead><tr>
                    <Th style={{fontSize:"0.72rem"}}>#</Th>
                    <Th style={{fontSize:"0.72rem"}}>Draft No</Th>
                    <Th style={{fontSize:"0.72rem"}}>GRN No</Th>
                    <Th style={{fontSize:"0.72rem"}}>Date</Th>
                    <Th style={{fontSize:"0.72rem"}}>Vendor</Th>
                    <Th style={{fontSize:"0.72rem"}}>Category</Th>
                    <Th style={{fontSize:"0.72rem"}}>Invoice No</Th>
                    <Th style={{fontSize:"0.72rem"}}>Invoice Date</Th>
                    <Th style={{fontSize:"0.72rem"}}>Payment</Th>
                    <Th style={{fontSize:"0.72rem"}}>Net Amount</Th>
                    <Th style={{fontSize:"0.72rem"}}>Status</Th>
                    <Th style={{fontSize:"0.72rem"}}>Actions</Th>
                  </tr></thead>
                  <tbody>
                    {filtered.length===0?(
                      <tr>
                        <td colSpan={12}>
                          <div style={{textAlign:"center",padding:"32px",color:colors.textMuted,fontSize:"0.85rem"}}>
                            No GRN records found.
                          </div>
                        </td>
                      </tr>
                    ):filtered.map((grn,idx)=>(
                      <Tr key={grn.grn_id}>
                        <Td style={{fontSize:"0.75rem"}}>{idx+1}</Td>
                        <Td><DraftBadge>{grn.draft_number||"—"}</DraftBadge></Td>
                        <Td>
                          {grn.grn_number
                            ? <GrnBadge>{grn.grn_number}</GrnBadge>
                            : <PendingText>Pending</PendingText>}
                        </Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.date?.split("T")[0]}</Td>
                        <Td style={{fontWeight:600,fontSize:"0.75rem"}}>{getVendorName(grn.vendor_id)}</Td>
                        <Td style={{fontSize:"0.72rem"}}>{PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label||grn.purchase_category}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.invoice_no}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.invoice_date?.split("T")[0]}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.payment_mode}</Td>
                        <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.8rem"}}>₹{parseFloat(grn.net_invoice_amount||0).toFixed(2)}</Td>
                        <Td><StatusBadge status={grn.status}>{grn.status||"Draft"}</StatusBadge></Td>
                        <Td>
                          <div style={{display:"flex",gap:4}}>
                            {grn.status==="Verified" ? (
                              <ActionBtn onClick={()=>handleEdit(grn)} title="View (read-only)">
                                <Lock size={11} style={{marginRight:2}}/>View
                              </ActionBtn>
                            ) : (
                              (!grn.status||grn.status==="Draft") && (
                                <ActionBtn onClick={()=>handleEdit(grn)}>Edit</ActionBtn>
                              )
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollTable>
            </>
          )}
        </FormContent>
      </Container>
    </PageWrapper>
  )
}

export default GRNGeneration