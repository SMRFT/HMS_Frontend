import React, { useState, useEffect, useCallback } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormRow, TextArea, FormContent,
  ControlsContainer, SearchContainer, InputWrapper, ButtonContainer,
  TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Plus, Trash2, X, ShoppingCart } from "lucide-react"
import styled from "styled-components"

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between;
`
const PageTitle    = styled.h1`margin: 0; font-size: 1.2rem; font-weight: 700;`
const PageSubtitle = styled.p`margin: 2px 0 0; font-size: 0.78rem; opacity: 0.8;`
const Card = styled.div`
  background: white; border: 1px solid ${colors.border};
  border-radius: 8px; margin-bottom: 14px; overflow: visible;
`
const CardHeader = styled.div`
  background: ${colors.tabBg}; padding: 9px 16px; border-bottom: 1px solid ${colors.border};
  font-weight: 600; font-size: 0.82rem; color: ${colors.primary};
  display: flex; align-items: center; gap: 8px;
`
const CardBody = styled.div`padding: 14px 16px;`
const GridRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.cols || "repeat(4,1fr)"};
  gap: 10px; align-items: flex-end; margin-bottom: 10px;
  @media(max-width:960px){grid-template-columns:repeat(3,1fr);}
  @media(max-width:640px){grid-template-columns:repeat(2,1fr);}
`
const ReadOnlyInput = styled(Input)`background:#f1f5f9!important;cursor:default;color:${colors.textMuted};font-size:0.82rem;`
const CalcInput     = styled(Input)`background:#f1f5f9!important;color:${colors.textMuted};cursor:default;font-size:0.82rem;`
const Lbl = styled(Label)`font-size:0.75rem;margin-bottom:3px;`

const ItemPanel = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  @media(max-width:860px){grid-template-columns:1fr;}
`
const Panel = styled.div`
  border:1px solid ${colors.border}; border-radius:6px; padding:12px; background:#fafafa;
`
const PanelTitle = styled.div`
  font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;
  color:${colors.primary}; margin-bottom:10px; padding-bottom:5px;
  border-bottom:1px solid ${colors.border};
`
const TaxBox  = styled.div`background:#f0f9ff;border:1px solid #bae6fd;border-radius:5px;padding:10px;margin-top:8px;`
const GreenBox= styled.div`background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:10px;margin-top:8px;`
const CostBar = styled.div`
  margin-top:8px; padding:7px 12px; background:#e0f2fe; border-radius:5px;
  font-size:0.82rem; color:#0369a1; font-weight:600;
  display:flex; justify-content:space-between; align-items:center;
`
const SummaryStrip = styled.div`
  display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
  gap:10px; background:#f8fafc; border:1px solid ${colors.border};
  border-radius:6px; padding:14px;
`
const SumCard  = styled.div`display:flex;flex-direction:column;gap:3px;`
const SumLabel = styled.span`font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:${colors.textMuted};`
const SumValue = styled.span`font-size:0.95rem;font-weight:700;color:${p=>p.primary?colors.primary:colors.textMain};`
const ActionBtn = styled.button`
  padding:4px 10px;border:none;border-radius:4px;font-size:0.78rem;font-weight:600;cursor:pointer;
  background:${p=>p.danger?"#fee2e2":colors.tabBg};color:${p=>p.danger?colors.danger:colors.primary};
  &:hover{background:${p=>p.danger?"#fecaca":"#b2dfdb"};}
`
const GrnBadge    = styled.span`background:#dcfce7;color:#166534;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:20px;`
const StatusBadge = styled.span`
  background:${p=>p.status==="Draft"?"#fef9c3":"#dcfce7"};
  color:${p=>p.status==="Draft"?"#854d0e":"#166534"};
  font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:20px;
`
const AutoWrap = styled.div`position:relative;`
const DropList = styled.ul`
  position:absolute;top:100%;left:0;right:0;z-index:999;
  background:white;border:1px solid ${colors.border};border-radius:0 0 5px 5px;
  max-height:160px;overflow-y:auto;list-style:none;margin:0;padding:0;
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
`
const DropItem = styled.li`
  padding:7px 11px;font-size:0.82rem;cursor:pointer;border-bottom:1px solid #f1f5f9;
  &:hover{background:#f0fdf4;color:${colors.primary};}
  &:last-child{border-bottom:none;}
`

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value:"MEDICINE_PURCHASE",    label:"Medicine Purchase (OP)" },
  { value:"MEDICINE_PURCHASE_IP", label:"Medicine Purchase (IP)" },
  { value:"OPENING_STOCK_DRUG",   label:"Opening Stock (Drug)"   },
]
const PAYMENT_MODES = ["CHEQUE","CASH","DD"]
const TAX_RATES = [
  { label:"EXEMPTED GST", rate:0  },
  { label:"RATE OF 5%",   rate:5  },
  { label:"RATE OF 12%",  rate:12 },
  { label:"RATE OF 18%",  rate:18 },
  { label:"RATE OF 28%",  rate:28 },
]
const MONTHS   = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const getYears = () => { const y=new Date().getFullYear(); return Array.from({length:10},(_,i)=>String(y+i)) }
const todayStr = () => new Date().toISOString().split("T")[0]

const CATEGORY_PREFIX = { MEDICINE_PURCHASE:"OP", MEDICINE_PURCHASE_IP:"IP", OPENING_STOCK_DRUG:"OSD" }
const fyStr = () => {
  const m=new Date().getMonth()+1, y=new Date().getFullYear()
  const s=m>=4?y:y-1
  return `${String(s).slice(-2)}${String(s+1).slice(-2)}`
}

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
  const purchase_cost= item_value + cgst_amt + sgst_amt - disc_amt
  return {
    ...item,
    quantity:             String(quantity),
    item_value:           item_value.toFixed(2),
    unit_price:           unit_price.toFixed(4),
    cgst_percent:         cgst_pct.toFixed(2),
    sgst_percent:         cgst_pct.toFixed(2),
    cgst_amt:             cgst_amt.toFixed(2),
    sgst_amt:             sgst_amt.toFixed(2),
    purchase_discount_amt:disc_amt.toFixed(2),
    purchase_cost:        purchase_cost.toFixed(2),
    selling_tax_label:    item.purchase_tax_label,
    selling_tax_rate:     item.purchase_tax_rate,
    selling_cgst:         cgst_amt.toFixed(2),
    selling_sgst:         sgst_amt.toFixed(2),
  }
}

const GRNGeneration = () => {
  const [vendors,   setVendors]   = useState([])
  const [medicines, setMedicines] = useState([])
  const [grnList,   setGrnList]   = useState([])
  const [grnData,   setGrnData]   = useState(EMPTY_GRN)
  const [vendorInfo,setVendorInfo]= useState(null)
  const [items,     setItems]     = useState([])
  const [curItem,   setCurItem]   = useState(EMPTY_ITEM)
  const [medSearch, setMedSearch] = useState("")
  const [showDrop,  setShowDrop]  = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [editId,    setEditId]    = useState(null)
  const [editGrnNo, setEditGrnNo] = useState("")
  const [search,    setSearch]    = useState("")
  const [loading,   setLoading]   = useState(false)

  const fetchVendors   = useCallback(async()=>{ try{ const r=await apiRequest(`${baseUrl}vendors/`,"GET"); if(r.success)setVendors(Array.isArray(r.data)?r.data:[]) }catch{} },[])
  const fetchMedicines = useCallback(async()=>{ try{ const r=await apiRequest(`${baseUrl}pharmacy-items/`,"GET"); if(r.success)setMedicines(Array.isArray(r.data)?r.data:[]) }catch{} },[])
  const fetchGRNList   = useCallback(async()=>{ try{ const r=await apiRequest(`${baseUrl}grn/`,"GET"); if(r.success)setGrnList(Array.isArray(r.data)?r.data:[]) }catch{} },[])
  useEffect(()=>{ fetchVendors();fetchMedicines();fetchGRNList() },[fetchVendors,fetchMedicines,fetchGRNList])

  useEffect(()=>{
    if(items.length===0){ setGrnData(p=>({...p,taxable_amount:"0.00",non_taxable_amount:"0.00",cgst:"0.00",sgst:"0.00",tax_paid_to_supplier:"0.00",total_discount:"0.00",total_amount:"0.00",net_invoice_amount:"0.00"})); return }
    const t=items.reduce((a,i)=>{ a.tax+=parseFloat(i.item_value)||0; a.cgst+=parseFloat(i.cgst_amt)||0; a.sgst+=parseFloat(i.sgst_amt)||0; a.disc+=parseFloat(i.purchase_discount_amt)||0; a.tot+=parseFloat(i.purchase_cost)||0; return a },{tax:0,cgst:0,sgst:0,disc:0,tot:0})
    setGrnData(p=>{ const net=t.tot+(parseFloat(p.round_amount)||0); return{...p,taxable_amount:t.tax.toFixed(2),non_taxable_amount:t.tax.toFixed(2),cgst:t.cgst.toFixed(2),sgst:t.sgst.toFixed(2),tax_paid_to_supplier:(t.cgst+t.sgst).toFixed(2),total_discount:t.disc.toFixed(2),total_amount:t.tot.toFixed(2),net_invoice_amount:net.toFixed(2)} })
  },[items])

  useEffect(()=>{ const tot=parseFloat(grnData.total_amount)||0; const round=parseFloat(grnData.round_amount)||0; setGrnData(p=>({...p,net_invoice_amount:(tot+round).toFixed(2)})) },[grnData.round_amount]) // eslint-disable-line

  // KEY FIX: cast both sides to Number so string/int mismatch doesn't break vendor lookup
  const handleVendorChange = (e) => {
    const raw = e.target.value
    const id  = raw === "" ? "" : parseInt(raw, 10)
    const v   = vendors.find(x => Number(x.vendor_id) === Number(id)) || null
    setVendorInfo(v)
    setGrnData(p => ({ ...p, vendor_id: id }))
  }

  const handleCategoryChange = (cat) => {
    // Just update state — grn_number regeneration is handled server-side on save
    setGrnData(p=>({...p,purchase_category:cat}))
    if(editId && cat){
      toast.info("Category changed — GRN number will update on save.",{autoClose:3000})
    }
  }

  const handleGrnChange = (e) => {
    const {name,value}=e.target
    if(name==="purchase_category"){handleCategoryChange(value);return}
    setGrnData(p=>({...p,[name]:value}))
  }

  const filteredMeds = medicines.filter(m=>`${m.item_name} ${m.item_last_name||""}`.toLowerCase().includes(medSearch.toLowerCase()))

  const selectMedicine = (med) => {
    const fullName=`${med.item_name} ${med.item_last_name||""}`.trim()
    setMedSearch(fullName); setShowDrop(false)
    setCurItem(p=>recalcItem({...p,name:fullName,item_id:med.item_id,hsn:med.hsn||""}))
  }

  const handleItemChange = (e) => {
    const {name,value}=e.target; let u={...curItem,[name]:value}
    if(name==="purchase_tax_label"){ const f=TAX_RATES.find(t=>t.label===value); u.purchase_tax_rate=f?String(f.rate):"0" }
    setCurItem(recalcItem(u))
  }

  const addItem = () => {
    if(!curItem.name){toast.error("Select a medicine");return}
    if(!curItem.packing_price||parseFloat(curItem.packing_price)<=0){toast.error("Enter packing price");return}
    const expiry=curItem.expiry_month&&curItem.expiry_year?`${curItem.expiry_month}/${curItem.expiry_year}`:""
    setItems(p=>[...p,{...curItem,expiry,id:Date.now()}]); setCurItem(EMPTY_ITEM); setMedSearch("")
  }
  const removeItem = (id) => setItems(p=>p.filter(i=>i.id!==id))

  const saveGRN = async () => {
    if(!grnData.purchase_category){toast.error("Purchase Category required");return}
    if(!grnData.vendor_id){toast.error("Vendor required");return}
    if(!grnData.invoice_no){toast.error("Invoice No required");return}
    if(items.length===0){toast.error("Add at least one item");return}
    const toDateTime = (d) => d ? (d.includes("T") ? d : `${d}T00:00:00`) : d
    // grn_number is never sent — backend always generates/preserves it
    const payload={...grnData,grn_type:"INVOICE",status:"Draft",
      date: toDateTime(grnData.date),
      invoice_date: toDateTime(grnData.invoice_date),
      grn_number: undefined,
      items:JSON.stringify(items),
      payment_status:JSON.stringify([{status:"Not Paid",amount_paid:0.0,pending_amount:parseFloat(grnData.net_invoice_amount),payment_method:null,payment_details:null,paid_by:null}]),
    }
    setLoading(true)
    try{
      const r=await apiRequest(editId?`${baseUrl}grn/${editId}/`:`${baseUrl}grn/`,editId?"PUT":"POST",payload)
      if(r.success){ toast.success(editId?"GRN updated":`GRN saved: ${r.data?.grn_number||""}`); resetForm();fetchGRNList();setActiveTab("list") }
      else toast.error(r.error||"Failed to save GRN")
    }catch{toast.error("Network error")}finally{setLoading(false)}
  }

  const handleEdit = (grn) => {
    setGrnData({
      purchase_category:grn.purchase_category||"",vendor_id:grn.vendor_id||"",
      date:grn.date?.split("T")[0]||todayStr(),invoice_no:grn.invoice_no||"",
      invoice_date:grn.invoice_date?.split("T")[0]||todayStr(),payment_mode:grn.payment_mode||"CHEQUE",
      grn_type:"INVOICE",remarks:grn.remarks||"",
      taxable_amount:grn.taxable_amount||"0.00",non_taxable_amount:grn.non_taxable_amount||"0.00",
      cgst:grn.cgst||"0.00",sgst:grn.sgst||"0.00",igst:grn.igst||"0.00",
      tax_paid_to_supplier:grn.tax_paid_to_supplier||"0.00",total_discount:grn.total_discount||"0.00",
      round_amount:grn.round_amount||"0",total_amount:grn.total_amount||"0.00",
      net_invoice_amount:grn.net_invoice_amount||"0.00",
    })
    // KEY FIX: number cast for vendor auto-fill on edit
    const v=vendors.find(x=>Number(x.vendor_id)===Number(grn.vendor_id))||null
    setVendorInfo(v)
    try{setItems(JSON.parse(grn.items||"[]"))}catch{setItems([])}
    setEditId(grn.grn_id); setEditGrnNo(""); setActiveTab("create")
    window.scrollTo({top:0,behavior:"smooth"})
  }

  const resetForm=()=>{ setGrnData(EMPTY_GRN);setItems([]);setCurItem(EMPTY_ITEM);setMedSearch("");setEditId(null);setEditGrnNo("");setVendorInfo(null) }

  const vendorAddr = vendorInfo ? [vendorInfo.address_line1,vendorInfo.address_line2,vendorInfo.city,vendorInfo.state].filter(Boolean).join(", ") : ""
  const getVendorName = (id) => { const v=vendors.find(x=>Number(x.vendor_id)===Number(id)); return v?v.name:String(id||"") }
  const filtered = grnList.filter(g=>{ const q=search.toLowerCase(); return g.grn_number?.toLowerCase().includes(q)||getVendorName(g.vendor_id)?.toLowerCase().includes(q)||g.invoice_no?.toLowerCase().includes(q) })

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <div>
            <PageTitle>🧾 GRN Generation</PageTitle>
            <PageSubtitle>Goods Receipt Note — Pharmacy Purchase</PageSubtitle>
          </div>
          <div style={{display:"flex",gap:8}}>
            {["create","list"].map(tab=>(
              <Button key={tab} onClick={()=>setActiveTab(tab)}
                style={activeTab===tab
                  ?{background:"white",color:colors.primary,padding:"7px 14px",fontSize:"0.82rem"}
                  :{background:"rgba(255,255,255,0.18)",color:"white",border:"1px solid rgba(255,255,255,0.35)",padding:"7px 14px",fontSize:"0.82rem"}}>
                {tab==="create"?"+ Create GRN":"📋 GRN List"}
              </Button>
            ))}
          </div>
        </PageHeader>

        <FormContent>
          {activeTab==="create" && (
            <>
              {/* Inward Details */}
              <Card>
                <CardHeader>
                  📋 Inward Details
                  {editId && <span style={{background:"#dcfce7",color:"#166534",fontSize:"0.7rem",fontWeight:700,padding:"2px 8px",borderRadius:20}}>
                    Editing GRN{editGrnNo?` → ${editGrnNo}`:""}
                  </span>}
                </CardHeader>
                <CardBody>
                  {/* Row 1: Category | Date | Vendor | Addr | Contact | Phone */}
                  <GridRow cols="repeat(6,1fr)">
                    <InputWrapper style={{margin:0}}>
                      <Lbl required>Purchase Category</Lbl>
                      <Select name="purchase_category" value={grnData.purchase_category} onChange={handleGrnChange} style={{fontSize:"0.82rem"}}>
                        <option value="">-- Select --</option>
                        {PURCHASE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                      </Select>
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Date</Lbl>
                      <Input type="date" name="date" value={grnData.date} onChange={handleGrnChange} style={{fontSize:"0.82rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl required>Vendor</Lbl>
                      <Select name="vendor_id" value={grnData.vendor_id} onChange={handleVendorChange} style={{fontSize:"0.82rem"}}>
                        <option value="">-- Select Vendor --</option>
                        {vendors.map(v=><option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                      </Select>
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Supplier Address</Lbl>
                      <ReadOnlyInput value={vendorAddr} readOnly placeholder="Auto-filled from vendor" />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Contact Person</Lbl>
                      <ReadOnlyInput value={vendorInfo?.contact_person||""} readOnly placeholder="Auto-filled" />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Phone</Lbl>
                      <ReadOnlyInput value={vendorInfo?.phone||""} readOnly placeholder="Auto-filled" />
                    </InputWrapper>
                  </GridRow>

                  {/* Row 2: Type | Invoice No | Invoice Date | Payment Mode */}
                  <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Type</Lbl>
                      <ReadOnlyInput value="Invoice" readOnly />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl required>Invoice No</Lbl>
                      <Input name="invoice_no" value={grnData.invoice_no} onChange={handleGrnChange} placeholder="e.g. INV-52412" style={{fontSize:"0.82rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Invoice Date</Lbl>
                      <Input type="date" name="invoice_date" value={grnData.invoice_date} onChange={handleGrnChange} style={{fontSize:"0.82rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Payment Mode</Lbl>
                      <Select name="payment_mode" value={grnData.payment_mode} onChange={handleGrnChange} style={{fontSize:"0.82rem"}}>
                        {PAYMENT_MODES.map(m=><option key={m} value={m}>{m}</option>)}
                      </Select>
                    </InputWrapper>
                  </GridRow>
                </CardBody>
              </Card>

              {/* Item Entry */}
              <Card>
                <CardHeader>💊 Item Entry</CardHeader>
                <CardBody>
                  <ItemPanel>
                    {/* LEFT — Item & Cost */}
                    <Panel>
                      <PanelTitle>Item &amp; Cost Details</PanelTitle>
                      <GridRow cols="2fr 1fr" style={{marginBottom:8}}>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Medicine Name *</Lbl>
                          <AutoWrap>
                            <Input value={medSearch} onChange={e=>{setMedSearch(e.target.value);setShowDrop(true)}} onFocus={()=>setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),180)} placeholder="Search medicine…" style={{fontSize:"0.82rem"}} />
                            {showDrop&&medSearch&&filteredMeds.length>0&&(
                              <DropList>
                                {filteredMeds.map(m=>(
                                  <DropItem key={m.item_id} onMouseDown={()=>selectMedicine(m)}>
                                    {m.item_name} {m.item_last_name||""}
                                    <span style={{fontSize:"0.72rem",color:colors.textMuted,marginLeft:6}}>HSN:{m.hsn||"—"}</span>
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

                      <GridRow cols="1fr 1fr 1fr" style={{marginBottom:8}}>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Batch No.</Lbl>
                          <Input name="batch" value={curItem.batch} onChange={handleItemChange} placeholder="Batch" style={{fontSize:"0.82rem"}} />
                        </InputWrapper>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Exp Month</Lbl>
                          <Select name="expiry_month" value={curItem.expiry_month} onChange={handleItemChange} style={{fontSize:"0.82rem"}}>
                            <option value="">MM</option>
                            {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                          </Select>
                        </InputWrapper>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Exp Year</Lbl>
                          <Select name="expiry_year" value={curItem.expiry_year} onChange={handleItemChange} style={{fontSize:"0.82rem"}}>
                            <option value="">YYYY</option>
                            {getYears().map(y=><option key={y} value={y}>{y}</option>)}
                          </Select>
                        </InputWrapper>
                      </GridRow>

                      <GridRow cols="repeat(4,1fr)" style={{marginBottom:8}}>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Packing</Lbl>
                          <Input type="number" name="packing" value={curItem.packing} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.82rem"}} />
                        </InputWrapper>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>No. of Units</Lbl>
                          <Input type="number" name="unit" value={curItem.unit} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.82rem"}} />
                        </InputWrapper>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Qty (auto)</Lbl>
                          <CalcInput value={curItem.quantity} readOnly />
                        </InputWrapper>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Free</Lbl>
                          <Input type="number" name="free" value={curItem.free} onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.82rem"}} />
                        </InputWrapper>
                      </GridRow>

                      <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                        <InputWrapper style={{margin:0}}>
                          <Lbl>Packing Price ₹</Lbl>
                          <Input type="number" name="packing_price" value={curItem.packing_price} onChange={handleItemChange} placeholder="0.00" min="0" style={{fontSize:"0.82rem"}} />
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
                          <Input type="number" name="mrp" value={curItem.mrp} onChange={handleItemChange} placeholder="0.00" min="0" style={{fontSize:"0.82rem"}} />
                        </InputWrapper>
                      </GridRow>
                    </Panel>

                    {/* RIGHT — Tax Details */}
                    <Panel>
                      <PanelTitle>Tax Details</PanelTitle>
                      <TaxBox>
                        <div style={{fontSize:"0.7rem",fontWeight:700,color:"#0369a1",marginBottom:8}}>PURCHASE TAX</div>
                        <GridRow cols="1.4fr 1fr 1fr" style={{marginBottom:8}}>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Tax Rate</Lbl>
                            <Select name="purchase_tax_label" value={curItem.purchase_tax_label} onChange={handleItemChange} style={{fontSize:"0.82rem"}}>
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
                            <Input type="number" name="purchase_discount" value={curItem.purchase_discount} onChange={handleItemChange} placeholder="0" min="0" max="100" style={{fontSize:"0.82rem"}} />
                          </InputWrapper>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>Discount Amt (auto)</Lbl>
                            <CalcInput value={`₹ ${curItem.purchase_discount_amt}`} readOnly />
                          </InputWrapper>
                        </GridRow>
                        <CostBar>
                          <span>Purchase Cost</span>
                          <strong style={{fontSize:"0.95rem"}}>₹ {curItem.purchase_cost}</strong>
                        </CostBar>
                      </TaxBox>

                      <GreenBox>
                        <div style={{fontSize:"0.7rem",fontWeight:700,color:"#15803d",marginBottom:8}}>
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

                      <div style={{marginTop:14}}>
                        <Button onClick={addItem} style={{width:"100%",fontSize:"0.85rem",padding:"9px"}}>
                          <Plus size={14} /> &nbsp; Add Item to GRN
                        </Button>
                      </div>
                    </Panel>
                  </ItemPanel>

                  {items.length>0&&(
                    <TableWrapper style={{marginTop:14}}>
                      <Table>
                        <thead><tr>
                          <Th>#</Th><Th>Medicine</Th><Th>HSN</Th><Th>Batch</Th>
                          <Th>Expiry</Th><Th>Pack</Th><Th>Units</Th><Th>Qty</Th>
                          <Th>Free</Th><Th>Pack Price</Th><Th>Item Val</Th>
                          <Th>Tax%</Th><Th>CGST</Th><Th>SGST</Th>
                          <Th>Disc%</Th><Th>Cost</Th><Th>MRP</Th><Th></Th>
                        </tr></thead>
                        <tbody>
                          {items.map((it,idx)=>(
                            <Tr key={it.id}>
                              <Td style={{fontSize:"0.78rem"}}>{idx+1}</Td>
                              <Td style={{fontWeight:600,minWidth:110,fontSize:"0.78rem"}}>{it.name}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.hsn||"—"}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.batch||"—"}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.expiry||"—"}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.packing||"—"}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.unit||"—"}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.quantity}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.free}</Td>
                              <Td style={{fontSize:"0.78rem"}}>₹{parseFloat(it.packing_price||0).toFixed(2)}</Td>
                              <Td style={{fontSize:"0.78rem"}}>₹{it.item_value}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.purchase_tax_rate}%</Td>
                              <Td style={{fontSize:"0.78rem"}}>₹{it.cgst_amt}</Td>
                              <Td style={{fontSize:"0.78rem"}}>₹{it.sgst_amt}</Td>
                              <Td style={{fontSize:"0.78rem"}}>{it.purchase_discount}%</Td>
                              <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.78rem"}}>₹{it.purchase_cost}</Td>
                              <Td style={{fontSize:"0.78rem"}}>₹{parseFloat(it.mrp||0).toFixed(2)}</Td>
                              <Td><Trash2 size={14} color={colors.danger} style={{cursor:"pointer"}} onClick={()=>removeItem(it.id)} /></Td>
                            </Tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  )}
                </CardBody>
              </Card>

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
                        <Input type="number" name="round_amount" value={grnData.round_amount} onChange={handleGrnChange} style={{height:32,fontSize:"0.85rem",width:"100%"}} />
                      </SumCard>
                      <SumCard>
                        <SumLabel>Net Invoice Amount</SumLabel>
                        <SumValue primary>₹ {grnData.net_invoice_amount}</SumValue>
                      </SumCard>
                    </SummaryStrip>
                    <div style={{marginTop:12}}>
                      <Lbl>Remarks</Lbl>
                      <TextArea name="remarks" value={grnData.remarks} onChange={handleGrnChange} placeholder="Any remarks…" style={{marginTop:4,fontSize:"0.82rem"}} />
                    </div>
                  </CardBody>
                </Card>
              )}

              <ButtonContainer>
                <Button secondary onClick={resetForm}><X size={14}/> Clear Form</Button>
                <Button onClick={saveGRN} disabled={loading}>
                  <ShoppingCart size={14}/>&nbsp;{loading?"Saving…":editId?"Update GRN":"Save as Draft"}
                </Button>
              </ButtonContainer>
            </>
          )}

          {activeTab==="list"&&(
            <>
              <SectionTitle><h3>GRN Records</h3></SectionTitle>
              <ControlsContainer>
                <SearchContainer>
                  <InputWrapper>
                    <Label>Search</Label>
                    <Input style={{minWidth:240,fontSize:"0.85rem"}} placeholder="GRN No, Vendor, Invoice…" value={search} onChange={e=>setSearch(e.target.value)} />
                  </InputWrapper>
                </SearchContainer>
                <div style={{color:colors.textMuted,fontSize:"0.82rem",alignSelf:"flex-end"}}>{filtered.length} record(s)</div>
              </ControlsContainer>
              <TableWrapper>
                <Table>
                  <thead><tr>
                    <Th>#</Th><Th>GRN No</Th><Th>Date</Th><Th>Vendor</Th>
                    <Th>Category</Th><Th>Invoice No</Th><Th>Invoice Date</Th>
                    <Th>Payment</Th><Th>Net Amount</Th><Th>Status</Th><Th>Actions</Th>
                  </tr></thead>
                  <tbody>
                    {filtered.length===0?(
                      <tr><td colSpan={11}><div style={{textAlign:"center",padding:"36px",color:colors.textMuted,fontSize:"0.88rem"}}>No GRN records found.</div></td></tr>
                    ):filtered.map((grn,idx)=>(
                      <Tr key={grn.grn_id}>
                        <Td style={{fontSize:"0.78rem"}}>{idx+1}</Td>
                        <Td><GrnBadge>{grn.grn_number}</GrnBadge></Td>
                        <Td style={{fontSize:"0.78rem"}}>{grn.date?.split("T")[0]}</Td>
                        <Td style={{fontWeight:600,fontSize:"0.78rem"}}>{getVendorName(grn.vendor_id)}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{PURCHASE_CATEGORIES.find(c=>c.value===grn.purchase_category)?.label||grn.purchase_category}</Td>
                        <Td style={{fontSize:"0.78rem"}}>{grn.invoice_no}</Td>
                        <Td style={{fontSize:"0.78rem"}}>{grn.invoice_date?.split("T")[0]}</Td>
                        <Td style={{fontSize:"0.78rem"}}>{grn.payment_mode}</Td>
                        <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.82rem"}}>₹{parseFloat(grn.net_invoice_amount||0).toFixed(2)}</Td>
                        <Td><StatusBadge status={grn.status}>{grn.status||"Draft"}</StatusBadge></Td>
                        <Td><div style={{display:"flex",gap:5}}>
                          <ActionBtn onClick={()=>handleEdit(grn)}>Edit</ActionBtn>
                        </div></Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </>
          )}
        </FormContent>
      </Container>
    </PageWrapper>
  )
}

export default GRNGeneration