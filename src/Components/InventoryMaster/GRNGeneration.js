import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormRow, TextArea, FormContent,
  ControlsContainer, SearchContainer, InputWrapper, ButtonContainer,
  TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Plus, Trash2, X, ShoppingCart, Lock, Camera, Upload, ScanLine, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import styled, { keyframes } from "styled-components"

/* ─── Styled Components ─────────────────────────────────────────────────── */
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 14px 20px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
`
const PageTitle    = styled.h1`margin: 0; font-size: 1.1rem; font-weight: 700;`
const PageSubtitle = styled.p`margin: 2px 0 0; font-size: 0.75rem; opacity: 0.8;`
const Card = styled.div`
  background: white; border: 1px solid ${colors.border}; border-radius: 8px;
  margin-bottom: 12px; overflow: visible; width: 100%; box-sizing: border-box;
`
const CardHeader = styled.div`
  background: ${colors.tabBg}; padding: 8px 14px; border-bottom: 1px solid ${colors.border};
  font-weight: 600; font-size: 0.8rem; color: ${colors.primary};
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`
const CardBody = styled.div`padding: 12px 14px; box-sizing: border-box; width: 100%;`
const GridRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.cols || "repeat(3,1fr)"};
  gap: 8px; align-items: flex-end; margin-bottom: 8px; width: 100%; box-sizing: border-box;
  @media(max-width: 900px){ grid-template-columns: repeat(2, 1fr) !important; }
  @media(max-width: 560px){ grid-template-columns: 1fr !important; }
`
const ReadOnlyInput = styled(Input)`
  background: #f1f5f9 !important; cursor: default; color: ${colors.textMuted}; font-size: 0.8rem;
`
const CalcInput = styled(Input)`
  background: #f1f5f9 !important; color: ${colors.textMuted}; cursor: default; font-size: 0.8rem;
`
const Lbl = styled(Label)`font-size: 0.72rem; margin-bottom: 2px; display: block;`
const ItemPanel = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  width: 100%; box-sizing: border-box;
  @media(max-width: 960px){ grid-template-columns: 1fr; }
`
const Panel = styled.div`
  border: 1px solid ${colors.border}; border-radius: 6px;
  padding: 10px; background: #fafafa; box-sizing: border-box; min-width: 0;
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
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  background: #f8fafc; border: 1px solid ${colors.border}; border-radius: 6px;
  padding: 12px; box-sizing: border-box;
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
  padding: 10px 14px; margin-bottom: 10px; font-size: 0.82rem; color: #166534; font-weight: 600;
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
const ScrollTable = styled.div`
  width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box;
  & table { table-layout: auto; min-width: 900px; width: 100%; }
`
const DisabledOverlay = styled.div`opacity: 0.5; pointer-events: none; user-select: none;`
const DisabledNotice = styled.div`
  background: #fef9c3; border: 1px solid #fde68a; border-radius: 6px;
  padding: 8px 12px; font-size: 0.78rem; color: #92400e; margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
`
const LastHint = styled.div`
  font-size: 0.67rem; color: ${colors.primary}; margin-top: 3px;
  font-weight: 600; min-height: 14px;
`
const ExpiryWarn = styled.div`
  font-size: 0.67rem; color: #dc2626; margin-top: 3px; font-weight: 600;
`
const CheckRow = styled.label`
  display: flex; align-items: center; gap: 5px;
  font-size: 0.72rem; color: ${colors.textMuted}; cursor: pointer; margin-top: 4px;
  font-weight: 600;
  & input { cursor: pointer; }
`
const MrpStrip = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;
`
const MrpCard = styled.div`
  background: #fff; border: 1px solid #e2e8f0; border-radius: 5px;
  padding: 6px 10px;
`
const MrpLabel = styled.div`font-size: 0.62rem; color: ${colors.textMuted}; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;`
const MrpValue = styled.div`font-size: 0.88rem; font-weight: 700; color: ${colors.textMain};`
const LastLine  = styled.div`font-size: 0.62rem; color: ${colors.primary}; font-weight: 600; margin-top: 2px;`

/* ─── OCR-specific styled components ───────────────────────────────────── */
const OcrCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
  border: 2px dashed ${p => p.active ? colors.primary : colors.border};
  border-radius: 10px; padding: 16px; margin-bottom: 14px;
  transition: border-color 0.2s;
`
const OcrCardHeader = styled.div`
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 0.85rem; color: ${colors.primary};
  margin-bottom: 12px;
`
const OcrMethodRow = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
`
const OcrMethodBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 7px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; border: 2px solid;
  border-color: ${p => p.active ? colors.primary : colors.border};
  background:   ${p => p.active ? colors.primary : "white"};
  color:        ${p => p.active ? "white" : colors.textMuted};
  &:hover { border-color: ${colors.primary}; background: ${p => p.active ? colors.primaryDark : "#f0f9ff"}; color: ${p => p.active ? "white" : colors.primary}; }
`
const DropZone = styled.div`
  border: 2px dashed ${p => p.dragging ? colors.primary : "#cbd5e1"};
  border-radius: 8px; padding: 28px 16px; text-align: center;
  background: ${p => p.dragging ? "#f0f9ff" : "white"}; cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${colors.primary}; background: #f0f9ff; }
`
const DropZoneText = styled.div`font-size: 0.82rem; color: ${colors.textMuted}; margin-top: 6px;`
const CameraBox = styled.div`
  position: relative; border-radius: 8px; overflow: hidden;
  background: #000; width: 100%;
`
const CameraVideo = styled.video`
  width: 100%; max-height: 320px; object-fit: cover; display: block;
`
const CameraCanvas = styled.canvas`display: none;`
const PreviewImg = styled.img`
  width: 100%; max-height: 260px; object-fit: contain;
  border-radius: 6px; border: 1px solid ${colors.border};
`
const OcrBadge = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  background: #dcfce7; color: #166534; font-size: 0.68rem; font-weight: 700;
  padding: 2px 7px; border-radius: 20px; margin-left: 6px;
`
const OcrWarnBox = styled.div`
  background: #fef9c3; border: 1px solid #fde68a; border-radius: 6px;
  padding: 8px 12px; font-size: 0.76rem; color: #92400e; margin-bottom: 8px;
`
const OcrSuccessBox = styled.div`
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;
  padding: 8px 12px; font-size: 0.76rem; color: #166534; margin-bottom: 8px;
  display: flex; align-items: flex-start; gap: 6px;
`
const SpinnerSpan = styled.span`
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`
const OcrFieldBadge = styled.span`
  background: #dbeafe; color: #1d4ed8; font-size: 0.62rem; font-weight: 700;
  padding: 1px 5px; border-radius: 10px; margin-left: 4px; vertical-align: middle;
`

/* ─── Edit Reason Modal ─────────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px;
`
const ModalBox = styled.div`
  background: white; border-radius: 10px; padding: 26px 30px;
  max-width: 460px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.18s ease forwards;
`
const ModalTitle = styled.h3`
  margin: 0 0 6px; font-size: 1rem; font-weight: 700; color: #111827;
`
const ModalSubtitle = styled.p`
  margin: 0 0 16px; font-size: 0.82rem; color: #6b7280; line-height: 1.5;
`
const ModalTextarea = styled.textarea`
  width: 100%; padding: 9px 11px;
  border: 1.5px solid ${p => p.error ? "#dc2626" : "#d1d5db"};
  border-radius: 7px; font-size: 0.875rem; color: #374151;
  outline: none; resize: vertical; min-height: 90px;
  font-family: inherit; background: white; box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: ${p => p.error ? "#dc2626" : "#0d9488"};
    box-shadow: 0 0 0 3px ${p => p.error ? "rgba(220,38,38,0.1)" : "rgba(13,148,136,0.1)"};
  }
  &::placeholder { color: #9ca3af; }
`
const ModalLabel = styled.label`
  display: block; font-size: 0.75rem; font-weight: 700;
  color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;
`
const ModalBtns = styled.div`
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;
`
const EditInfoBanner = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  background: #fef9c3; border: 1px solid #fde68a; border-radius: 6px;
  padding: 9px 13px; margin-bottom: 10px; font-size: 0.79rem; color: #92400e;
`

/* ─── Edit Reason Modal Component ───────────────────────────────────────── */
const EditReasonModal = ({ draftNumber, onConfirm, onCancel }) => {
  const [reason, setReason]     = useState("")
  const [touched, setTouched]   = useState(false)

  const handleSave = () => {
    setTouched(true)
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>✏️ Edit Reason Required</ModalTitle>
        <ModalSubtitle>
          You are editing an existing draft (<strong>{draftNumber}</strong>).
          Please provide a reason for this edit before saving.
        </ModalSubtitle>
        <div>
          <ModalLabel>
            Reason for Edit <span style={{ color: "#dc2626" }}>*</span>
          </ModalLabel>
          <ModalTextarea
            error={touched && !reason.trim()}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe why this GRN draft is being modified…"
            autoFocus
          />
          {touched && !reason.trim() && (
            <div style={{ color: "#dc2626", fontSize: "0.74rem", marginTop: 4 }}>
              ⚠ Edit reason is required.
            </div>
          )}
        </div>
        <ModalBtns>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", borderRadius: 7,
              border: "1.5px solid #d1d5db", background: "white",
              cursor: "pointer", fontSize: "0.84rem", fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px", borderRadius: 7, border: "none",
              background: "#0d9488", color: "white",
              cursor: "pointer", fontSize: "0.84rem", fontWeight: 700,
            }}
          >
            Save Changes
          </button>
        </ModalBtns>
      </ModalBox>
    </ModalOverlay>
  )
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PAYMENT_MODES = ["CHEQUE","CASH","DD"]
const TAX_RATES = [
  { label: "EXEMPTED GST", rate: 0  },
  { label: "RATE OF 5%",   rate: 5  },
  { label: "RATE OF 12%",  rate: 12 },
  { label: "RATE OF 18%",  rate: 18 },
  { label: "RATE OF 28%",  rate: 28 },
]
const MONTHS = [
  { value: "01", label: "01 - Jan" }, { value: "02", label: "02 - Feb" },
  { value: "03", label: "03 - Mar" }, { value: "04", label: "04 - Apr" },
  { value: "05", label: "05 - May" }, { value: "06", label: "06 - Jun" },
  { value: "07", label: "07 - Jul" }, { value: "08", label: "08 - Aug" },
  { value: "09", label: "09 - Sep" }, { value: "10", label: "10 - Oct" },
  { value: "11", label: "11 - Nov" }, { value: "12", label: "12 - Dec" },
]
const getYears = () => { const y = new Date().getFullYear(); return Array.from({length:10},(_,i)=>String(y+i)) }
const todayStr = () => new Date().toISOString().split("T")[0]

const FIXED_PURCHASE_CATEGORIES = ["DRUG PURCHASE"]

const EMPTY_GRN = {
  purchase_category:"",vendor_id:"",date:todayStr(),
  invoice_no:"",invoice_date:todayStr(),payment_mode:"CHEQUE",
  grn_type:"INVOICE",remarks:"",
  taxable_amount:"0.00",non_taxable_amount:"0.00",
  cgst:"0.00",sgst:"0.00",igst:"0.00",
  tax_paid_to_supplier:"0.00",total_discount:"0.00",
  round_amount:"0",total_amount:"0.00",net_invoice_amount:"0.00",
  // edit audit fields (read-only, shown in UI when populated)
  edited_by:"", edited_date:"", edited_reason:"",
}

const EMPTY_ITEM = {
  name:"",item_id:"",hsn:"",batch:"",
  expiry_month:"",expiry_year:"",expiry:"",
  packing:"",unit:"",quantity:"0",free:"0",
  item_value:"0.00",packing_price:"",unit_price:"0.00",
  purchase_tax_label:"RATE OF 5%",purchase_tax_rate:"5",
  cgst_percent:"2.50",sgst_percent:"2.50",
  cgst_amt:"0.00",sgst_amt:"0.00",
  purchase_discount:"0",purchase_discount_amt:"0.00",
  deduct_discount_for_tax: true,
  purchase_cost:"0.00",
  mrp:"",
  max_packing_mrp:"0.00",
  selling_discount:"0",
  selling_price:"0.00",
  tax_inclusive: true,
  selling_tax_label:"RATE OF 5%",selling_tax_rate:"5",
  selling_cgst_percent:"2.50",selling_sgst_percent:"2.50",
  selling_cgst_amt:"0.00",selling_sgst_amt:"0.00",
}

/* ─── Recalc helper ────────────────────────────────────────────────────── */
function recalcItem(item) {
  const packing      = parseFloat(item.packing)          || 0
  const unit         = parseFloat(item.unit)             || 0
  const packingPrice = parseFloat(item.packing_price)    || 0
  const taxRate      = parseFloat(item.purchase_tax_rate)|| 0
  const discount     = parseFloat(item.purchase_discount)|| 0
  const deductDisc   = item.deduct_discount_for_tax !== false

  const quantity   = packing * unit
  const item_value = quantity * packingPrice
  const unit_price = quantity > 0 ? item_value / quantity : 0

  const disc_amt     = item_value * (discount / 100)
  const taxable_base = deductDisc ? (item_value - disc_amt) : item_value

  const cgst_pct       = taxRate / 2
  const cgst_amt_total = taxable_base * (cgst_pct / 100)
  const sgst_amt_total = taxable_base * (cgst_pct / 100)

  const cgst_amt_display = quantity > 0 ? cgst_amt_total / quantity : cgst_amt_total
  const sgst_amt_display = quantity > 0 ? sgst_amt_total / quantity : sgst_amt_total

  const purchase_cost_total   = taxable_base + cgst_amt_total + sgst_amt_total
  const purchase_cost_display = quantity > 0 ? purchase_cost_total / quantity : purchase_cost_total

  const sellingTaxRate  = parseFloat(item.selling_tax_rate) || 0
  const sellingCgstPct  = sellingTaxRate / 2
  const mrp             = parseFloat(item.mrp) || 0
  const taxInclusive    = item.tax_inclusive !== false
  const sellingDisc     = parseFloat(item.selling_discount) || 0

  let selling_price = taxInclusive && sellingTaxRate > 0
    ? mrp / (1 + sellingTaxRate / 100)
    : mrp

  selling_price = selling_price * (1 - sellingDisc / 100)

  const selling_cgst_amt = selling_price * (sellingCgstPct / 100)
  const selling_sgst_amt = selling_price * (sellingCgstPct / 100)

  return {
    ...item,
    quantity:              String(quantity),
    item_value:            item_value.toFixed(4),
    unit_price:            unit_price.toFixed(4),
    cgst_percent:          cgst_pct.toFixed(2),
    sgst_percent:          cgst_pct.toFixed(2),
    cgst_amt:              cgst_amt_total.toFixed(2),
    sgst_amt:              sgst_amt_total.toFixed(2),
    cgst_amt_display:      cgst_amt_display.toFixed(3),
    sgst_amt_display:      sgst_amt_display.toFixed(3),
    purchase_discount_amt: disc_amt.toFixed(2),
    purchase_cost:         purchase_cost_total.toFixed(3),
    purchase_cost_display: purchase_cost_display.toFixed(3),
    selling_tax_label:     item.selling_tax_label || item.purchase_tax_label,
    selling_tax_rate:      item.selling_tax_rate  || item.purchase_tax_rate,
    selling_cgst_percent:  sellingCgstPct.toFixed(2),
    selling_sgst_percent:  sellingCgstPct.toFixed(2),
    selling_price:         selling_price.toFixed(2),
    selling_cgst_amt:      selling_cgst_amt.toFixed(4),
    selling_sgst_amt:      selling_sgst_amt.toFixed(4),
  }
}

function isExpiryTooShort(month, year) {
  if (!month || !year) return false
  const expDate = new Date(parseInt(year), parseInt(month) - 1, 1)
  const sixMonthsLater = new Date()
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
  return expDate <= sixMonthsLater
}

/* ─── OCR Panel Component ───────────────────────────────────────────────── */
const OcrPanel = ({ onOcrResult, disabled }) => {
  const [ocrMode,    setOcrMode]    = useState("upload")
  const [dragging,   setDragging]   = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [ocrFile,    setOcrFile]    = useState(null)
  const [scanning,   setScanning]   = useState(false)
  const [camActive,  setCamActive]  = useState(false)
  const [camError,   setCamError]   = useState("")
  const [captured,   setCaptured]   = useState(null)
  const [ocrStatus,  setOcrStatus]  = useState(null)
  const [ocrMsg,     setOcrMsg]     = useState("")
  const [warnings,   setWarnings]   = useState([])

  const fileInputRef  = useRef(null)
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)

  const startCamera = useCallback(async () => {
    setCamError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Camera auto-play was interrupted or prevented:", error)
          })
        }
      }
      setCamActive(true)
    } catch (err) {
      setCamError("Camera access denied or not available on this device.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCamActive(false)
  }, [])

  useEffect(() => {
    if (ocrMode === "camera") startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [ocrMode]) // eslint-disable-line

  const captureFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      if (!blob) { toast.error("Could not capture frame"); return }
      const url = URL.createObjectURL(blob)
      setCaptured(blob)
      setPreviewSrc(url)
      setOcrFile(new File([blob], "camera_capture.png", { type: "image/png" }))
      stopCamera()
    }, "image/png", 0.95)
  }, [stopCamera])

  const retakePhoto = () => {
    setCaptured(null)
    setPreviewSrc(null)
    setOcrFile(null)
    setOcrStatus(null)
    setOcrMsg("")
    setWarnings([])
    startCamera()
  }

  const handleFileSelect = (file) => {
    if (!file) return
    const allowed = ["image/jpeg","image/png","image/jpg","image/webp","application/pdf"]
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported file type. Use JPG, PNG, WEBP or PDF.")
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File too large — max 15 MB.")
      return
    }
    setOcrFile(file)
    setOcrStatus(null); setOcrMsg(""); setWarnings([])
    if (file.type !== "application/pdf") {
      setPreviewSrc(URL.createObjectURL(file))
    } else {
      setPreviewSrc(null)
    }
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const runOcr = async () => {
    if (!ocrFile) { toast.error("No file selected or captured."); return }
    setScanning(true); setOcrStatus(null); setOcrMsg(""); setWarnings([])
    try {
      const formData = new FormData()
      formData.append("file", ocrFile)

      const res = await fetch(`${baseUrl}grn-ocr/`, {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setOcrStatus("error")
        setOcrMsg(json.error || "OCR scan failed. Try a clearer image.")
        return
      }

      const warns = json.warnings || []
      setWarnings(warns)
      setOcrStatus("success")
      setOcrMsg(
        `OCR complete — ${json.data?.items?.length || 0} item(s) detected.` +
        (warns.length ? " See warnings below." : "")
      )
      onOcrResult(json.data)
    } catch (err) {
      setOcrStatus("error")
      setOcrMsg("Network error while scanning. Please try again.")
    } finally {
      setScanning(false)
    }
  }

  const resetOcr = () => {
    setOcrFile(null); setPreviewSrc(null); setCaptured(null)
    setOcrStatus(null); setOcrMsg(""); setWarnings([])
    if (ocrMode === "camera") retakePhoto()
  }

  if (disabled) return null

  return (
    <OcrCard active={dragging}>
      <OcrCardHeader>
        <ScanLine size={16} />
        Auto-Fill via OCR Scan
        <span style={{fontSize:"0.7rem",fontWeight:400,color:colors.textMuted,marginLeft:4}}>
          Upload or scan a hard copy invoice to auto-fill fields (you can edit after)
        </span>
      </OcrCardHeader>

      <OcrMethodRow>
        <OcrMethodBtn
          active={ocrMode === "upload"}
          onClick={() => { setOcrMode("upload"); resetOcr() }}
          type="button"
        >
          <Upload size={14}/> Upload Document
        </OcrMethodBtn>
        <OcrMethodBtn
          active={ocrMode === "camera"}
          onClick={() => { setOcrMode("camera"); resetOcr() }}
          type="button"
        >
          <Camera size={14}/> Use Camera
        </OcrMethodBtn>
      </OcrMethodRow>

      {ocrMode === "upload" && (
        <>
          {!ocrFile ? (
            <DropZone
              dragging={dragging}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <Upload size={28} color={dragging ? colors.primary : "#94a3b8"} />
              <DropZoneText>
                <strong>Click to upload</strong> or drag &amp; drop<br/>
                <span style={{fontSize:"0.72rem"}}>JPG, PNG, WEBP, PDF — max 15 MB</span>
              </DropZoneText>
            </DropZone>
          ) : (
            <div>
              {previewSrc && (
                <div style={{marginBottom:8}}>
                  <PreviewImg src={previewSrc} alt="Invoice preview" />
                </div>
              )}
              {!previewSrc && ocrFile && (
                <div style={{padding:"10px 0",fontSize:"0.8rem",color:colors.textMuted}}>
                  📄 {ocrFile.name} ({(ocrFile.size/1024).toFixed(0)} KB)
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInputRef} type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
            style={{display:"none"}}
            onChange={e => handleFileSelect(e.target.files?.[0])}
          />
        </>
      )}

      {ocrMode === "camera" && (
        <div>
          {camError && (
            <OcrWarnBox style={{marginBottom:8}}>
              <AlertCircle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{camError}
            </OcrWarnBox>
          )}
          {!captured && (
            <CameraBox>
              <CameraVideo ref={videoRef} autoPlay playsInline muted />
              <div style={{
                position:"absolute",bottom:0,left:0,right:0,
                background:"rgba(0,0,0,0.5)",padding:"8px",
                display:"flex",justifyContent:"center",gap:8
              }}>
                {camActive ? (
                  <Button
                    onClick={captureFrame}
                    style={{fontSize:"0.8rem",padding:"6px 16px",background:"white",color:colors.primary}}
                    type="button"
                  >
                    <Camera size={13}/>&nbsp;Capture
                  </Button>
                ) : (
                  <Button
                    onClick={startCamera}
                    style={{fontSize:"0.8rem",padding:"6px 16px"}}
                    type="button"
                  >
                    Start Camera
                  </Button>
                )}
              </div>
            </CameraBox>
          )}
          {captured && previewSrc && (
            <div>
              <PreviewImg src={previewSrc} alt="Captured invoice" />
              <div style={{marginTop:6,display:"flex",gap:6}}>
                <Button secondary onClick={retakePhoto} style={{fontSize:"0.78rem",padding:"5px 12px"}} type="button">
                  <RefreshCw size={12}/>&nbsp;Retake
                </Button>
              </div>
            </div>
          )}
          <CameraCanvas ref={canvasRef} />
        </div>
      )}

      {ocrStatus === "success" && (
        <OcrSuccessBox>
          <CheckCircle size={14} style={{marginTop:1,flexShrink:0}}/>
          <span>{ocrMsg}</span>
        </OcrSuccessBox>
      )}
      {ocrStatus === "error" && (
        <OcrWarnBox>
          <AlertCircle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{ocrMsg}
        </OcrWarnBox>
      )}
      {warnings.length > 0 && (
        <OcrWarnBox>
          <strong>⚠️ Warnings:</strong>
          <ul style={{margin:"4px 0 0 16px",padding:0,fontSize:"0.73rem"}}>
            {warnings.map((w,i) => <li key={i}>{w}</li>)}
          </ul>
        </OcrWarnBox>
      )}

      <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
        {ocrFile && (
          <Button
            onClick={runOcr}
            disabled={scanning}
            style={{fontSize:"0.8rem",padding:"7px 16px"}}
            type="button"
          >
            {scanning
              ? <><SpinnerSpan/>&nbsp; Scanning…</>
              : <><ScanLine size={13}/>&nbsp; Scan &amp; Auto-Fill</>}
          </Button>
        )}
        {(ocrFile || ocrStatus) && (
          <Button secondary onClick={resetOcr} style={{fontSize:"0.8rem",padding:"7px 12px"}} type="button">
            <X size={12}/>&nbsp;Clear
          </Button>
        )}
      </div>

      <div style={{marginTop:8,fontSize:"0.69rem",color:colors.textMuted}}>
        💡 After scanning, all fields are editable. Review and correct any errors before saving.
      </div>
    </OcrCard>
  )
}


/* ─── Main Component ────────────────────────────────────────────────────── */
const GRNGeneration = () => {
  const [vendors,     setVendors]     = useState([])
  const [medicines,   setMedicines]   = useState([])
  const [grnList,     setGrnList]     = useState([])
  const [outlets,     setOutlets]     = useState([])
  const [grnData,     setGrnData]     = useState(EMPTY_GRN)
  const [vendorInfo,  setVendorInfo]  = useState(null)
  const [items,       setItems]       = useState([])
  const [curItem,     setCurItem]     = useState(EMPTY_ITEM)
  const [lastStock,   setLastStock]   = useState(null)
  const [medSearch,   setMedSearch]   = useState("")
  const [showDrop,    setShowDrop]    = useState(false)
  const [activeTab,   setActiveTab]   = useState("create")
  const [editDraftNo, setEditDraftNo] = useState("")
  const [editStatus,  setEditStatus]  = useState("")
  const [search,      setSearch]      = useState("")
  const [loading,     setLoading]     = useState(false)
  const [ocrApplied,  setOcrApplied]  = useState(false)

  // ── NEW: edit reason modal state ──────────────────────────────────────────
  const [showEditReasonModal, setShowEditReasonModal] = useState(false)
  // pendingPayload holds the ready-to-send payload while awaiting the reason
  const pendingPayloadRef = useRef(null)

  /* ── Fetchers ── */
  const fetchVendors   = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}vendors/`,"GET"); if(r.success) setVendors(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchMedicines = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}pharmacy_items/`,"GET"); if(r.success) setMedicines(Array.isArray(r.data)?r.data:[]) } catch {}
  },[])
  const fetchGRNList   = useCallback(async () => {
    try { const r = await apiRequest(`${baseUrl}grn/`,"GET"); if(r.success) setGrnList(Array.isArray(r.data.data)?r.data.data:[]) } catch {}
  },[])

  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${baseUrl}get_active_outlets/`, "GET")
      if (r?.success && Array.isArray(r?.data?.data)) {
        const filtered = r.data.data.filter(
          (o) => (o.outlet_name || "").trim().toLowerCase() !== "drug purchase"
        )
        setOutlets(filtered)
        setGrnData(prev => ({ ...prev, purchase_category: "" }))
      } else {
        setOutlets([])
      }
    } catch (error) {
      console.error("Outlet fetch error:", error)
      setOutlets([])
    }
  }, [])

  useEffect(()=>{ fetchVendors(); fetchMedicines(); fetchGRNList(); fetchOutlets() },
    [fetchVendors, fetchMedicines, fetchGRNList, fetchOutlets])

  const fetchLastStock = useCallback(async (item_id) => {
    if (!item_id) { setLastStock(null); return }
    try {
      const r = await apiRequest(`${baseUrl}pharmacy_stock_history/?item_id=${item_id}`, "GET")
      const list = Array.isArray(r?.data?.data) ? r.data.data
                 : Array.isArray(r?.data)        ? r.data : []
      setLastStock(list.length > 0 ? list[0] : null)
    } catch {
      setLastStock(null)
    }
  }, [])

  /* ── Derived ── */
  const isEdit           = !!editDraftNo
  const isVerified       = editStatus === "Verified"
  const isItemEntryEnabled =
    !!grnData.invoice_no?.trim() &&
    !!grnData.purchase_category?.trim() &&
    !!grnData.vendor_id

  const expiryTooShort = isExpiryTooShort(curItem.expiry_month, curItem.expiry_year)

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

  /* ── OCR result handler ── */
  const handleOcrResult = useCallback((data) => {
    if (!data) return

    setGrnData(prev => {
      const updated = { ...prev }
      if (data.invoice_no)       updated.invoice_no       = data.invoice_no
      if (data.invoice_date)     updated.invoice_date     = data.invoice_date.split("T")[0]
      if (data.payment_mode)     updated.payment_mode     = data.payment_mode
      if (data.taxable_amount && parseFloat(data.taxable_amount) > 0)
        updated.taxable_amount   = parseFloat(data.taxable_amount).toFixed(2)
      if (data.cgst && parseFloat(data.cgst) > 0)
        updated.cgst             = parseFloat(data.cgst).toFixed(2)
      if (data.sgst && parseFloat(data.sgst) > 0)
        updated.sgst             = parseFloat(data.sgst).toFixed(2)
      if (data.total_discount && parseFloat(data.total_discount) > 0)
        updated.total_discount   = parseFloat(data.total_discount).toFixed(2)
      if (data.total_amount && parseFloat(data.total_amount) > 0)
        updated.total_amount     = parseFloat(data.total_amount).toFixed(2)
      if (data.net_invoice_amount && parseFloat(data.net_invoice_amount) > 0)
        updated.net_invoice_amount = parseFloat(data.net_invoice_amount).toFixed(2)
      return updated
    })

    if (data.vendor_name) {
      const nameLower = data.vendor_name.toLowerCase()
      const matched = vendors.find(v =>
        (v.name || "").toLowerCase().includes(nameLower) ||
        nameLower.includes((v.name || "").toLowerCase())
      )
      if (matched) {
        setVendorInfo(matched)
        setGrnData(prev => ({ ...prev, vendor_id: String(matched.vendor_id) }))
        toast.info(`Vendor matched: ${matched.name}`)
      } else {
        toast.warn(`Vendor "${data.vendor_name}" not found in list — please select manually.`)
      }
    }

    if (Array.isArray(data.items) && data.items.length > 0) {
      const ocrItems = data.items.map(it => {
        const nameLower = (it.name || "").toLowerCase()
        const matched = medicines.find(m =>
          `${m.item_name} ${m.item_last_name||""}`.toLowerCase().includes(nameLower) ||
          nameLower.includes(m.item_name?.toLowerCase() || "")
        )
        const resolved = matched
          ? { ...it, item_id: matched.item_id, name: `${matched.item_name} ${matched.item_last_name||""}`.trim(), hsn: matched.hsn || it.hsn }
          : it

        const withPacking = {
          ...resolved,
          packing: resolved.packing || "1",
          unit:    resolved.unit    || resolved.quantity || "1",
        }
        return recalcItem({ ...EMPTY_ITEM, ...withPacking, id: Date.now() + Math.random(), _fromOcr: true })
      })

      setItems(prev => [...prev, ...ocrItems])
      toast.success(`${ocrItems.length} item(s) added from OCR — please review and edit as needed.`)
    }

    setOcrApplied(true)
  }, [vendors, medicines])

  /* ── Handlers ── */
  const handleVendorChange = (e) => {
    if(isVerified) return
    const raw = e.target.value
    const v = vendors.find(x => String(x.vendor_id) === String(raw)) || null
    setVendorInfo(v)
    setGrnData(p => ({ ...p, vendor_id: raw }))
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
    fetchLastStock(med.item_id)
  }

  const handleItemChange = (e) => {
    if(isVerified) return
    const {name, value, type, checked} = e.target
    let u = {...curItem, [name]: type === "checkbox" ? checked : value}
    if(name==="purchase_tax_label"){
      const f = TAX_RATES.find(t=>t.label===value)
      u.purchase_tax_rate = f ? String(f.rate) : "0"
    }
    if(name==="selling_tax_label"){
      const f = TAX_RATES.find(t=>t.label===value)
      u.selling_tax_rate = f ? String(f.rate) : "0"
    }
    if(name==="expiry_month"){ u.expiry = value && u.expiry_year ? `${value}/${u.expiry_year}` : "" }
    if(name==="expiry_year"){  u.expiry = u.expiry_month && value ? `${u.expiry_month}/${value}` : "" }
    setCurItem(recalcItem(u))
  }

  const addItem = () => {
    if(isVerified) return
    if(!curItem.name){ toast.error("Select a medicine"); return }
    if(!curItem.batch?.trim()){ toast.error("Batch number is required"); return }
    if(expiryTooShort){ toast.error("Expiry is too short — items expiring within 6 months cannot be added"); return }
    if(!curItem.packing_price||parseFloat(curItem.packing_price)<=0){ toast.error("Enter packing price"); return }
    setItems(p=>[...p,{...curItem,id:Date.now()}])
    setCurItem(EMPTY_ITEM); setMedSearch(""); setLastStock(null)
  }

  const removeItem = (id) => { if(isVerified) return; setItems(p=>p.filter(i=>i.id!==id)) }

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it
      const updated = { ...it, [field]: value }
      return recalcItem(updated)
    }))
  }

  /* ─── buildPayload (shared between first save and reason-confirmed save) ─── */
  const buildPayload = () => {
    const toDateTime = (d) => d ? (d.includes("T") ? d : `${d}T00:00:00`) : d
    return {
      ...grnData,
      grn_type:     "INVOICE",
      status:       "Draft",
      date:         toDateTime(grnData.date),
      invoice_date: toDateTime(grnData.invoice_date),
      grn_number:   "",
      draft_number: isEdit ? editDraftNo : undefined,
      items:        JSON.stringify(items),
      payment_status: JSON.stringify([{
        status: "Not Paid", amount_paid: 0.0,
        pending_amount: parseFloat(grnData.net_invoice_amount),
        payment_method: null, payment_details: null, paid_by: null,
      }]),
    }
  }

  /* ─── Actual API call (used both on first save and after reason confirmed) ─── */
  const submitGRN = async (payload) => {
    const url    = isEdit ? `${baseUrl}grn/${editDraftNo}/` : `${baseUrl}grn/`
    const method = isEdit ? "PUT" : "POST"

    setLoading(true)
    try {
      const r = await apiRequest(url, method, payload)
      if(r.success){
        const draftNo = r.data?.draft_number || ""
        toast.success(isEdit ? `GRN updated (${draftNo})` : `Draft saved: ${draftNo}`)
        if(!isEdit){
          setEditDraftNo(r.data?.draft_number || "")
          setEditStatus(r.data?.status || "Draft")
          if(r.data?.grn_number !== undefined) setGrnData(p=>({...p, grn_number: r.data.grn_number}))
        } else {
          // Refresh edit audit fields from the response
          if (r.data?.edited_by)     setGrnData(p => ({ ...p, edited_by:     r.data.edited_by }))
          if (r.data?.edited_date)   setGrnData(p => ({ ...p, edited_date:   r.data.edited_date }))
          if (r.data?.edited_reason) setGrnData(p => ({ ...p, edited_reason: r.data.edited_reason }))
        }
        fetchGRNList()
      } else {
        toast.error(r.error || "Failed to save GRN")
      }
    } catch { toast.error("Network error") } finally { setLoading(false) }
  }

  /* ── Save / Update Draft ── */
  const saveGRN = async () => {
    if(isVerified){ toast.warn("Verified GRN cannot be edited."); return }
    if(!grnData.purchase_category){ toast.error("Purchase Category required"); return }
    if(!grnData.vendor_id){ toast.error("Vendor required"); return }
    if(!grnData.invoice_no){ toast.error("Invoice No required"); return }
    if(items.length===0){ toast.error("Add at least one item"); return }

    const payload = buildPayload()

    if (isEdit) {
      // Existing draft — must capture edit reason before submitting
      pendingPayloadRef.current = payload
      setShowEditReasonModal(true)
    } else {
      // Brand-new draft — no reason required
      await submitGRN(payload)
    }
  }

  /* ── Called when user confirms the edit reason modal ── */
  const handleEditReasonConfirm = async (reason) => {
    setShowEditReasonModal(false)
    const payload = {
      ...pendingPayloadRef.current,
      edited_reason: reason,   // backend will set edited_by + edited_date
    }
    pendingPayloadRef.current = null
    await submitGRN(payload)
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
      // ── edit audit fields ──
      edited_by:     grn.edited_by     || "",
      edited_date:   grn.edited_date   || "",
      edited_reason: grn.edited_reason || "",
    })
    setVendorInfo(vendors.find(x => String(x.vendor_id) === String(grn.vendor_id)) || null)
    try{ setItems(JSON.parse(grn.items||"[]")) } catch { setItems([]) }
    setEditDraftNo(grn.draft_number||"")
    setEditStatus(grn.status||"Draft")
    setOcrApplied(false)
    setActiveTab("create")
    window.scrollTo({top:0,behavior:"smooth"})
  }

  const resetForm = () => {
    setGrnData(EMPTY_GRN); setItems([]); setCurItem(EMPTY_ITEM)
    setMedSearch(""); setEditDraftNo(""); setEditStatus(""); setVendorInfo(null); setLastStock(null)
    setOcrApplied(false)
    pendingPayloadRef.current = null
    setShowEditReasonModal(false)
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
  const getVendorAddress = (v) => {
    if (!v) return ""
    return [v.address_line1, v.address_line2, v.city, v.state, v.pincode].filter(Boolean).join(", ")
  }

  const fmtDateTime = (d) => {
    if (!d) return ""
    try {
      return new Date(d).toLocaleString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    } catch { return d }
  }

  const lastPurchasePrice = lastStock ? `₹ ${parseFloat(lastStock.mrp||0).toFixed(2)}` : "—"
  const lastPurchaseCost  = lastStock
    ? `₹ ${(parseFloat(lastStock.CGST_Amt||0) + parseFloat(lastStock.SGST_Amt||0) + parseFloat(lastStock.mrp||0)).toFixed(2)}`
    : "—"
  const lastMRP           = lastStock ? `₹ ${parseFloat(lastStock.mrp||0).toFixed(2)}` : "—"
  const lastSellingPrice  = lastStock
    ? `₹ ${parseFloat(lastStock.selling_price || lastStock.mrp || 0).toFixed(2)}`
    : "—"

  /* ─────────────────────────────────────────────────────── RENDER ── */
  return (
    <PageWrapper>
      <Container style={{maxWidth:"100%", padding:"0 8px", overflowX:"hidden", boxSizing:"border-box", width:"100%"}}>
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

        <FormContent style={{padding:"10px 0", width:"100%", boxSizing:"border-box"}}>
          {activeTab==="create" && (
            <>
              {isVerified && (
                <VerifiedBanner>
                  <Lock size={15}/>
                  This GRN is <strong>Verified</strong> — editing is not allowed.
                  {grnData.grn_number && <GrnBadge style={{marginLeft:6}}>GRN: {grnData.grn_number}</GrnBadge>}
                </VerifiedBanner>
              )}

              {!isVerified && (
                <OcrPanel
                  onOcrResult={handleOcrResult}
                  disabled={isVerified}
                />
              )}

              {ocrApplied && !isVerified && (
                <OcrSuccessBox style={{marginBottom:12}}>
                  <CheckCircle size={14} style={{marginTop:1,flexShrink:0}}/>
                  <span>
                    Fields have been pre-filled from OCR scan.
                    <strong> Review and correct all values before saving.</strong>
                    You can fully edit everything below.
                  </span>
                </OcrSuccessBox>
              )}

              {/* ── NEW: Edit Audit Info Banner ── */}
              {isEdit && !isVerified && grnData.edited_by && (
                <EditInfoBanner>
                  <div>
                    <strong>Last Edited By:</strong> {grnData.edited_by}
                    {grnData.edited_date && (
                      <span style={{marginLeft:10,fontWeight:400}}>
                        on {fmtDateTime(grnData.edited_date)}
                      </span>
                    )}
                  </div>
                  {grnData.edited_reason && (
                    <div><strong>Reason:</strong> {grnData.edited_reason}</div>
                  )}
                </EditInfoBanner>
              )}

              {/* ── Inward Details ── */}
              <Card>
                <CardHeader>
                  📋 Inward Details
                  {ocrApplied && <OcrBadge><ScanLine size={10}/>OCR Auto-filled</OcrBadge>}
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
                      <Select
                        name="purchase_category"
                        value={grnData.purchase_category}
                        onChange={handleGrnChange}
                        disabled={isVerified}
                        style={{fontSize:"0.8rem"}}
                      >
                        <option value="">-- Select Category --</option>
                        <option value="DRUG PURCHASE">DRUG PURCHASE</option>
                        {outlets.map((o, i) => (
                          <option key={o.outlet_id || i} value={o.outlet_name || o.outlet || o.name || ""}>
                            {o.outlet_name || o.outlet || o.name || "Unnamed Outlet"}
                          </option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper style={{margin:0}}>
                      <Lbl>Date</Lbl>
                      <ReadOnlyInput
                        type="date" name="date" value={grnData.date}
                        readOnly disabled style={{fontSize:"0.8rem", background:"#f1f5f9", cursor:"not-allowed"}}
                      />
                    </InputWrapper>

                    <InputWrapper style={{margin:0}}>
                      <Lbl>
                        Vendor *
                        {ocrApplied && grnData.vendor_id && <OcrFieldBadge>OCR</OcrFieldBadge>}
                      </Lbl>
                      <Select name="vendor_id" value={grnData.vendor_id} onChange={handleVendorChange}
                        disabled={isVerified} style={{fontSize:"0.8rem"}}>
                        <option value="">-- Select Vendor --</option>
                        {vendors.map(v=><option key={v.vendor_id} value={String(v.vendor_id)}>{v.name}</option>)}
                      </Select>
                    </InputWrapper>
                  </GridRow>

                  <GridRow cols="repeat(3,1fr)">
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Supplier Address</Lbl>
                      <ReadOnlyInput value={getVendorAddress(vendorInfo)} readOnly placeholder="Auto-filled from vendor" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Contact Person</Lbl>
                      <ReadOnlyInput value={vendorInfo?.contact_person || ""} readOnly placeholder="Auto-filled" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Phone</Lbl>
                      <ReadOnlyInput value={vendorInfo?.phone || ""} readOnly placeholder="Auto-filled" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                  </GridRow>

                  <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Type</Lbl>
                      <ReadOnlyInput value="Invoice" readOnly style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>
                        Invoice No *
                        {ocrApplied && grnData.invoice_no && <OcrFieldBadge>OCR</OcrFieldBadge>}
                      </Lbl>
                      <Input name="invoice_no" value={grnData.invoice_no} onChange={handleGrnChange}
                        disabled={isVerified} placeholder="e.g. INV-52412" style={{fontSize:"0.8rem"}} />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>Invoice Date</Lbl>
                      <ReadOnlyInput
                        type="date" name="invoice_date" value={grnData.invoice_date}
                        readOnly disabled style={{fontSize:"0.8rem", background:"#f1f5f9", cursor:"not-allowed"}}
                      />
                    </InputWrapper>
                    <InputWrapper style={{margin:0}}>
                      <Lbl>
                        Payment Mode
                        {ocrApplied && <OcrFieldBadge>OCR</OcrFieldBadge>}
                      </Lbl>
                      <Select name="payment_mode" value={grnData.payment_mode} onChange={handleGrnChange}
                        disabled={isVerified} style={{fontSize:"0.8rem"}}>
                        {PAYMENT_MODES.map(m=><option key={m} value={m}>{m}</option>)}
                      </Select>
                    </InputWrapper>
                  </GridRow>
                </CardBody>
              </Card>

              {/* ── Item Entry ── */}
              {!isVerified && (
                <Card>
                  <CardHeader>💊 Item Entry <span style={{fontWeight:400,fontSize:"0.72rem",color:colors.textMuted,marginLeft:4}}>(Manual — or edit OCR items in table below)</span></CardHeader>
                  <CardBody>
                    {isItemEntryEnabled ? (
                      <ItemPanel>
                        {/* ── LEFT: Item & Cost ── */}
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
                              <Lbl>Batch No. *</Lbl>
                              <Input
                                name="batch" value={curItem.batch} onChange={handleItemChange}
                                placeholder="Required" style={{fontSize:"0.8rem", borderColor: curItem.name && !curItem.batch ? "#dc2626" : undefined}}
                              />
                              {curItem.name && !curItem.batch && (
                                <ExpiryWarn>Batch is required</ExpiryWarn>
                              )}
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Exp Month</Lbl>
                              <Select name="expiry_month" value={curItem.expiry_month}
                                onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                                <option value="">MM</option>
                                {MONTHS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                              </Select>
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Exp Year</Lbl>
                              <Select name="expiry_year" value={curItem.expiry_year}
                                onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                                <option value="">YYYY</option>
                                {getYears().map(y=><option key={y} value={y}>{y}</option>)}
                              </Select>
                            </InputWrapper>
                          </GridRow>

                          {(curItem.expiry_month || curItem.expiry_year) && (
                            <div style={{marginBottom:6,marginTop:-4}}>
                              <div style={{fontSize:"0.72rem",color:colors.primary}}>
                                Expiry: <strong>{curItem.expiry_month||"MM"}/{curItem.expiry_year||"YYYY"}</strong>
                              </div>
                              {expiryTooShort && (
                                <ExpiryWarn>⚠️ Expiry is too short (within 6 months) — cannot add this item</ExpiryWarn>
                              )}
                            </div>
                          )}

                          <GridRow cols="repeat(4,1fr)" style={{marginBottom:7}}>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Packing</Lbl>
                              <Input type="number" name="packing" value={curItem.packing}
                                onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>No. of Units</Lbl>
                              <Input type="number" name="unit" value={curItem.unit}
                                onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Qty (auto)</Lbl>
                              <CalcInput value={curItem.quantity} readOnly />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Free</Lbl>
                              <Input type="number" name="free" value={curItem.free}
                                onChange={handleItemChange} placeholder="0" min="0" style={{fontSize:"0.8rem"}} />
                            </InputWrapper>
                          </GridRow>

                          <GridRow cols="repeat(4,1fr)" style={{marginBottom:0}}>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Packing Price ₹</Lbl>
                              <Input type="number" name="packing_price" value={curItem.packing_price}
                                onChange={handleItemChange} placeholder="0.0000" min="0" style={{fontSize:"0.8rem"}} />
                              <LastHint>Last Purchase: {lastPurchasePrice}</LastHint>
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Item Value (auto)</Lbl>
                              <CalcInput value={`₹ ${parseFloat(curItem.item_value).toFixed(4)}`} readOnly />
                            </InputWrapper>
                            <InputWrapper style={{margin:0}}>
                              <Lbl>Unit Price (auto)</Lbl>
                              <CalcInput value={`₹ ${parseFloat(curItem.unit_price).toFixed(4)}`} readOnly />
                            </InputWrapper>
                          </GridRow>

                          <TaxBox>
                            <div style={{fontSize:"0.68rem",fontWeight:700,color:"#0369a1",marginBottom:7}}>PURCHASE TAX</div>
                            <GridRow cols="1.4fr 1fr 1fr" style={{marginBottom:7}}>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Tax Rate</Lbl>
                                <Select name="purchase_tax_label" value={curItem.purchase_tax_label}
                                  onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                                  {TAX_RATES.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
                                </Select>
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>CGST ({curItem.cgst_percent}%)</Lbl>
                                <CalcInput value={`₹ ${curItem.cgst_amt_display || curItem.cgst_amt}`} readOnly />
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>SGST ({curItem.sgst_percent}%)</Lbl>
                                <CalcInput value={`₹ ${curItem.sgst_amt_display || curItem.sgst_amt}`} readOnly />
                              </InputWrapper>
                            </GridRow>
                            <GridRow cols="1fr 1fr" style={{marginBottom:4}}>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Purchase Discount (%)</Lbl>
                                <Input type="number" name="purchase_discount" value={curItem.purchase_discount}
                                  onChange={handleItemChange} placeholder="0" min="0" max="100" style={{fontSize:"0.8rem"}} />
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Discount Amt (auto)</Lbl>
                                <CalcInput value={`₹ ${curItem.purchase_discount_amt}`} readOnly />
                              </InputWrapper>
                            </GridRow>
                            <CheckRow>
                              <input
                                type="checkbox"
                                name="deduct_discount_for_tax"
                                checked={curItem.deduct_discount_for_tax !== false}
                                onChange={handleItemChange}
                              />
                              Deduct discount for tax calc
                            </CheckRow>
                            <CostBar>
                              <span>Purchase Cost</span>
                              <strong style={{fontSize:"0.9rem"}}>
                                ₹ {curItem.purchase_cost_display || curItem.purchase_cost}
                              </strong>
                            </CostBar>
                            <LastHint style={{marginTop:4}}>Last Purchase Cost: {lastPurchaseCost}</LastHint>
                          </TaxBox>
                        </Panel>

                        {/* ── RIGHT: Tax Details ── */}
                        <Panel>
                          <PanelTitle>Tax Details</PanelTitle>
                          <InputWrapper style={{margin:0}}>
                            <Lbl>MRP ₹</Lbl>
                            <Input type="number" name="mrp" value={curItem.mrp}
                              onChange={handleItemChange} placeholder="0.00" min="0" style={{fontSize:"0.8rem"}} />
                            <LastHint>Last MRP: {lastMRP}</LastHint>
                          </InputWrapper>

                          <GreenBox>
                            <div style={{fontSize:"0.68rem",fontWeight:700,color:"#15803d",marginBottom:7}}>
                              SELLING TAX
                            </div>
                            <GridRow cols="1.4fr 1fr 1fr" style={{marginBottom:4}}>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Tax Rate</Lbl>
                                <Select name="selling_tax_label" value={curItem.selling_tax_label}
                                  onChange={handleItemChange} style={{fontSize:"0.8rem"}}>
                                  {TAX_RATES.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
                                </Select>
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>CGST ({curItem.selling_cgst_percent||"2.50"}%)</Lbl>
                                <CalcInput value={`₹ ${parseFloat(curItem.selling_cgst_amt||0).toFixed(4)}`} readOnly />
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>SGST ({curItem.selling_sgst_percent||"2.50"}%)</Lbl>
                                <CalcInput value={`₹ ${parseFloat(curItem.selling_sgst_amt||0).toFixed(4)}`} readOnly />
                              </InputWrapper>
                            </GridRow>
                            <CheckRow style={{marginBottom:6}}>
                              <input
                                type="checkbox"
                                name="tax_inclusive"
                                checked={curItem.tax_inclusive !== false}
                                onChange={handleItemChange}
                              />
                              Tax Inclusive
                            </CheckRow>
                            <GridRow cols="1fr 1fr 1fr" style={{marginBottom:0}}>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Selling Discount (%)</Lbl>
                                <Input type="number" name="selling_discount" value={curItem.selling_discount}
                                  onChange={handleItemChange} placeholder="0" min="0" max="100" style={{fontSize:"0.8rem"}} />
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Price (auto)</Lbl>
                                <CalcInput value={`₹ ${curItem.selling_price}`} readOnly />
                                <LastHint>Last Selling Price: {lastSellingPrice}</LastHint>
                              </InputWrapper>
                            </GridRow>
                          </GreenBox>

                          <div style={{marginTop:12}}>
                            <Button
                              onClick={addItem}
                              disabled={expiryTooShort}
                              style={{width:"100%",fontSize:"0.82rem",padding:"8px",
                                opacity: expiryTooShort ? 0.5 : 1,
                                cursor: expiryTooShort ? "not-allowed" : "pointer"}}
                            >
                              <Plus size={13}/> &nbsp; Add Item to GRN
                            </Button>
                            {expiryTooShort && (
                              <ExpiryWarn style={{textAlign:"center",marginTop:4}}>
                                ⚠️ Cannot add — expiry within 6 months
                              </ExpiryWarn>
                            )}
                          </div>
                        </Panel>
                      </ItemPanel>
                    ) : (
                      <DisabledOverlay>
                        <DisabledNotice>
                          ⚠️ Fill Invoice No, Purchase Category and Vendor above to enable item entry.
                        </DisabledNotice>
                        <ItemPanel>
                          <Panel>
                            <PanelTitle>Item &amp; Cost Details</PanelTitle>
                            <GridRow cols="2fr 1fr" style={{marginBottom:7}}>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>Medicine Name *</Lbl>
                                <Input disabled placeholder="Search medicine…" style={{fontSize:"0.8rem"}} />
                              </InputWrapper>
                              <InputWrapper style={{margin:0}}>
                                <Lbl>HSN Code</Lbl>
                                <CalcInput disabled placeholder="Auto-filled" />
                              </InputWrapper>
                            </GridRow>
                            <GridRow cols="repeat(4,1fr)" style={{marginBottom:7}}>
                              {["Batch No. *","Exp Month","Exp Year","Free"].map(l=>(
                                <InputWrapper key={l} style={{margin:0}}><Lbl>{l}</Lbl><Input disabled placeholder="—" style={{fontSize:"0.8rem"}} /></InputWrapper>
                              ))}
                            </GridRow>
                          </Panel>
                          <Panel>
                            <PanelTitle>Tax Details</PanelTitle>
                            <div style={{height:60,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:"0.8rem"}}>
                              Tax details will appear here
                            </div>
                          </Panel>
                        </ItemPanel>
                      </DisabledOverlay>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* ── Items Table ── */}
              {items.length > 0 && (
                <Card>
                  <CardHeader>
                    📦 Items Added ({items.length})
                    {items.some(i => i._fromOcr) && (
                      <OcrBadge><ScanLine size={10}/>Contains OCR items — review editable fields</OcrBadge>
                    )}
                  </CardHeader>
                  <CardBody style={{padding:"8px 6px"}}>
                    {items.some(i => i._fromOcr) && !isVerified && (
                      <OcrWarnBox style={{marginBottom:8}}>
                        <AlertCircle size={13} style={{verticalAlign:"middle",marginRight:4}}/>
                        OCR items below are editable. Click any cell value to update batch, expiry, MRP, prices etc. before saving.
                      </OcrWarnBox>
                    )}
                    <ScrollTable>
                      <Table>
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
                          <Th style={{fontSize:"0.72rem"}}>Cost/Pack</Th>
                          <Th style={{fontSize:"0.72rem"}}>MRP</Th>
                          <Th style={{fontSize:"0.72rem"}}>Price</Th>
                          {!isVerified && <Th style={{fontSize:"0.72rem"}}></Th>}
                        </tr></thead>
                        <tbody>
                          {items.map((it, idx) => {
                            const isOcr = !!it._fromOcr
                            return (
                              <Tr key={it.id} style={isOcr ? {background:"#f0f9ff"} : {}}>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {idx+1}
                                  {isOcr && <OcrBadge style={{marginLeft:3,fontSize:"0.58rem"}}>OCR</OcrBadge>}
                                </Td>
                                <Td style={{fontWeight:600,minWidth:100,fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input
                                      value={it.name}
                                      onChange={e => updateItem(it.id, "name", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",minWidth:120}}
                                    />
                                  ) : it.name}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>{it.hsn||"—"}</Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input
                                      value={it.batch}
                                      onChange={e => updateItem(it.id, "batch", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:80}}
                                      placeholder="Batch"
                                    />
                                  ) : (it.batch||"—")}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input
                                      value={it.expiry}
                                      onChange={e => updateItem(it.id, "expiry", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:70}}
                                      placeholder="MM/YYYY"
                                    />
                                  ) : (it.expiry||"—")}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input type="number" value={it.packing}
                                      onChange={e => updateItem(it.id, "packing", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:55}} min="0"/>
                                  ) : (it.packing||"—")}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input type="number" value={it.unit}
                                      onChange={e => updateItem(it.id, "unit", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:55}} min="0"/>
                                  ) : (it.unit||"—")}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>{it.quantity}</Td>
                                <Td style={{fontSize:"0.75rem"}}>{it.free}</Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input type="number" value={it.packing_price}
                                      onChange={e => updateItem(it.id, "packing_price", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:75}} min="0"/>
                                  ) : `₹${parseFloat(it.packing_price||0).toFixed(2)}`}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>₹{parseFloat(it.item_value||0).toFixed(2)}</Td>
                                <Td style={{fontSize:"0.75rem"}}>{it.purchase_tax_rate}%</Td>
                                <Td style={{fontSize:"0.75rem"}}>₹{it.cgst_amt}</Td>
                                <Td style={{fontSize:"0.75rem"}}>₹{it.sgst_amt}</Td>
                                <Td style={{fontSize:"0.75rem"}}>{it.purchase_discount}%</Td>
                                <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.75rem"}}>
                                  ₹{it.purchase_cost_display || it.purchase_cost}
                                </Td>
                                <Td style={{fontSize:"0.75rem"}}>
                                  {isOcr && !isVerified ? (
                                    <Input type="number" value={it.mrp}
                                      onChange={e => updateItem(it.id, "mrp", e.target.value)}
                                      style={{fontSize:"0.75rem",padding:"2px 5px",width:70}} min="0"/>
                                  ) : `₹${parseFloat(it.mrp||0).toFixed(2)}`}
                                </Td>
                                <Td style={{fontSize:"0.75rem",color:"#15803d",fontWeight:600}}>
                                  ₹{parseFloat(it.selling_price||0).toFixed(2)}
                                </Td>
                                {!isVerified && (
                                  <Td>
                                    <Trash2 size={13} color={colors.danger} style={{cursor:"pointer"}} onClick={()=>removeItem(it.id)} />
                                  </Td>
                                )}
                              </Tr>
                            )
                          })}
                        </tbody>
                      </Table>
                    </ScrollTable>
                  </CardBody>
                </Card>
              )}

              {/* ── Financial Summary ── */}
              {items.length>0&&(
                <Card>
                  <CardHeader>💰 Financial Summary
                    {ocrApplied && <OcrBadge><ScanLine size={10}/>OCR</OcrBadge>}
                  </CardHeader>
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
                        <Input type="number" name="round_amount" value={grnData.round_amount}
                          onChange={handleGrnChange} style={{height:30,fontSize:"0.82rem",width:"100%"}} />
                      </SumCard>
                      <SumCard>
                        <SumLabel>Net Invoice Amount</SumLabel>
                        <SumValue primary>₹ {grnData.net_invoice_amount}</SumValue>
                      </SumCard>
                    </SummaryStrip>
                    {!isVerified && (
                      <div style={{marginTop:10}}>
                        <Lbl>Remarks</Lbl>
                        <TextArea name="remarks" value={grnData.remarks} onChange={handleGrnChange}
                          placeholder="Any remarks…" style={{marginTop:3,fontSize:"0.8rem"}} />
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
                    <Input style={{minWidth:220,fontSize:"0.82rem"}}
                      placeholder="Draft No, GRN No, Vendor, Invoice…"
                      value={search} onChange={e=>setSearch(e.target.value)} />
                  </InputWrapper>
                </SearchContainer>
                <div style={{color:colors.textMuted,fontSize:"0.8rem",alignSelf:"flex-end"}}>
                  {filtered.length} record(s)
                </div>
              </ControlsContainer>
              <ScrollTable>
                <Table>
                  <thead><tr>
                    <Th style={{fontSize:"0.72rem"}}>#</Th>
                    <Th style={{fontSize:"0.72rem"}}>Draft No</Th>
                    <Th style={{fontSize:"0.72rem"}}>GRN No</Th>
                    <Th style={{fontSize:"0.72rem"}}>Date</Th>
                    <Th style={{fontSize:"0.72rem"}}>Vendor</Th>
                    <Th style={{fontSize:"0.72rem"}}>Outlet / Category</Th>
                    <Th style={{fontSize:"0.72rem"}}>Invoice No</Th>
                    <Th style={{fontSize:"0.72rem"}}>Invoice Date</Th>
                    <Th style={{fontSize:"0.72rem"}}>Payment</Th>
                    <Th style={{fontSize:"0.72rem"}}>Net Amount</Th>
                    <Th style={{fontSize:"0.72rem"}}>Status</Th>
                    {/* ── NEW: last edit column ── */}
                    <Th style={{fontSize:"0.72rem"}}>Last Edited</Th>
                    <Th style={{fontSize:"0.72rem"}}>Actions</Th>
                  </tr></thead>
                  <tbody>
                    {filtered.length===0?(
                      <tr>
                        <td colSpan={13}>
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
                        <Td style={{fontSize:"0.72rem"}}>{grn.purchase_category}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.invoice_no}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.invoice_date?.split("T")[0]}</Td>
                        <Td style={{fontSize:"0.75rem"}}>{grn.payment_mode}</Td>
                        <Td style={{fontWeight:700,color:colors.primary,fontSize:"0.8rem"}}>₹{parseFloat(grn.net_invoice_amount||0).toFixed(2)}</Td>
                        <Td><StatusBadge status={grn.status}>{grn.status||"Draft"}</StatusBadge></Td>

                        {/* ── NEW: last edit info ── */}
                        <Td style={{fontSize:"0.72rem",maxWidth:140}}>
                          {grn.edited_by ? (
                            <div style={{display:"flex",flexDirection:"column",gap:1}}>
                              <span style={{fontWeight:700,color:"#92400e"}}>{grn.edited_by}</span>
                              {grn.edited_date && (
                                <span style={{color:"#9ca3af",fontSize:"0.68rem"}}>{fmtDateTime(grn.edited_date)}</span>
                              )}
                              {grn.edited_reason && (
                                <span
                                  title={grn.edited_reason}
                                  style={{
                                    color:"#374151",fontSize:"0.68rem",
                                    display:"-webkit-box",WebkitLineClamp:2,
                                    WebkitBoxOrient:"vertical",overflow:"hidden",
                                  }}
                                >
                                  {grn.edited_reason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{color:"#d1d5db"}}>—</span>
                          )}
                        </Td>

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

      {/* ── Edit Reason Modal ── */}
      {showEditReasonModal && (
        <EditReasonModal
          draftNumber={editDraftNo}
          onConfirm={handleEditReasonConfirm}
          onCancel={() => {
            setShowEditReasonModal(false)
            pendingPayloadRef.current = null
          }}
        />
      )}

    </PageWrapper>
  )
}

export default GRNGeneration