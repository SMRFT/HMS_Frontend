import React, { useState, useEffect, useCallback } from "react"
import {
  PageWrapper,
  Container,
  SectionTitle,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Label,
  FormRow,
  TextArea,
  FormContent,
  ControlsContainer,
  SearchContainer,
  InputWrapper,
  ButtonContainer,
  TableWrapper,
  colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Plus, Trash2, Save, X, ShoppingCart } from "lucide-react"
import styled from "styled-components"

// ─── Styled Helpers ────────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
`
const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.85;
`
const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
`
const CardHeader = styled.div`
  background: ${colors.tabBg};
  padding: 12px 20px;
  border-bottom: 1px solid ${colors.border};
  font-weight: 600;
  font-size: 0.9rem;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`
const CardBody = styled.div`
  padding: 20px;
`
const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 10px 0;
`
const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.textMain};
  cursor: pointer;

  input[type="radio"] {
    accent-color: ${colors.primary};
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`
const ReadOnlyInput = styled(Input)`
  background: #f1f5f9 !important;
  cursor: not-allowed;
  color: ${colors.textMuted};
`
const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: flex-end;
  background: #fafafa;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px dashed ${colors.border};
  margin-bottom: 14px;
`
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  background: #f8fafc;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 20px;
`
const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const SummaryLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textMuted};
`
const SummaryValue = styled.span`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${(p) => (p.primary ? colors.primary : colors.textMain)};
`
const ActionBtn = styled.button`
  padding: 5px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.danger ? "#fee2e2" : colors.tabBg)};
  color: ${(p) => (p.danger ? colors.danger : colors.primary)};
  &:hover {
    background: ${(p) => (p.danger ? "#fecaca" : "#b2dfdb")};
  }
`
const EmptyItems = styled.div`
  text-align: center;
  padding: 30px;
  color: ${colors.textMuted};
  font-size: 0.9rem;
  border: 2px dashed ${colors.border};
  border-radius: 8px;
  margin-top: 14px;
`
const AddItemBtn = styled(Button)`
  white-space: nowrap;
  padding: 10px 16px;
  align-self: flex-end;
  margin-bottom: 0;
`
const GrnBadge = styled.span`
  background: #dcfce7;
  color: #166534;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
`

// ─── Constants ─────────────────────────────────────────────────────────────────
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE", label: "Medicine Purchase" },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)" },
  { value: "OPENING_STOCK_DRUG", label: "Opening Stock (Drug)" },
]
const PAYMENT_MODES = ["CHEQUE", "CASH", "DD"]

const today = () => new Date().toISOString().split("T")[0]

const EMPTY_GRN = {
  purchase_category: "",
  vendor_id: "",
  vendor_name: "",
  supplier_address: "",
  contact_person: "",
  phone: "",
  grn_type: "INVOICE",
  invoice_no: "",
  invoice_date: today(),
  date: today(),
  credit_period: "",
  due_date: today(),
  reference: "New",
  purchase_order: "",
  payment_mode: "CHEQUE",
  remarks: "",
  taxable_amount: 0,
  non_taxable_amount: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  tax_paid_to_supplier: 0,
  total_discount: 0,
  round_amount: 0,
  total_amount: 0,
  net_invoice_amount: 0,
}

const EMPTY_ITEM = {
  name: "",
  hsn: "",
  batch: "",
  expiry: "",
  quantity: "",
  unitPrice: "",
  free: "0",
  tax: "0",
  mrp: "",
  // computed
  itemValue: "0",
  cgstPercent: "0",
  cgstAmt: "0",
  sgstPercent: "0",
  sgstAmt: "0",
  purchaseCost: "0",
  unitCostWithGst: "0",
  totalstock: "0",
}

// ─── Main Component ─────────────────────────────────────────────────────────────
const GRNGeneration = () => {
  const [vendors, setVendors] = useState([])
  const [medicines, setMedicines] = useState([])
  const [grnList, setGrnList] = useState([])

  const [grnData, setGrnData] = useState(EMPTY_GRN)
  const [items, setItems] = useState([])
  const [currentItem, setCurrentItem] = useState(EMPTY_ITEM)

  const [activeTab, setActiveTab] = useState("create") // "create" | "list"
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      const response = await apiRequest(`${baseUrl}vendors/`, "GET")
      if (response.success) setVendors(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Error fetching vendors:", err)
    }
  }, [])

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await apiRequest(`${baseUrl}pharmacy-items/`, "GET")
      if (response.success) setMedicines(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Error fetching medicines:", err)
    }
  }, [])

  const fetchGRNList = useCallback(async () => {
    try {
      const response = await apiRequest(`${baseUrl}grn/`, "GET")
      if (response.success) setGrnList(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Error fetching GRN list:", err)
    }
  }, [])

  useEffect(() => {
    fetchVendors()
    fetchMedicines()
    fetchGRNList()
  }, [fetchVendors, fetchMedicines, fetchGRNList])

  // ── Auto-calculate summary when items change ──────────────────────────────
  useEffect(() => {
    const summary = items.reduce(
      (acc, item) => {
        acc.taxable_amount += parseFloat(item.itemValue) || 0
        acc.cgst += parseFloat(item.cgstAmt) || 0
        acc.sgst += parseFloat(item.sgstAmt) || 0
        acc.total_amount += parseFloat(item.purchaseCost) || 0
        return acc
      },
      { taxable_amount: 0, cgst: 0, sgst: 0, total_amount: 0 }
    )

    setGrnData((prev) => ({
      ...prev,
      taxable_amount: summary.taxable_amount.toFixed(2),
      non_taxable_amount: summary.taxable_amount.toFixed(2),
      cgst: summary.cgst.toFixed(2),
      sgst: summary.sgst.toFixed(2),
      tax_paid_to_supplier: (summary.cgst + summary.sgst).toFixed(2),
      total_amount: summary.total_amount.toFixed(2),
      net_invoice_amount: (summary.total_amount + parseFloat(prev.round_amount || 0)).toFixed(2),
    }))
  }, [items])

  // ── Vendor auto-fill ─────────────────────────────────────────────────────
  const handleVendorChange = (e) => {
    const selectedId = parseInt(e.target.value)
    const vendor = vendors.find((v) => v.vendor_id === selectedId)
    if (vendor) {
      const addr = [vendor.address_line1, vendor.address_line2, vendor.city, vendor.state]
        .filter(Boolean)
        .join(", ")
      setGrnData((prev) => ({
        ...prev,
        vendor_id: selectedId,
        vendor_name: vendor.name || "",
        supplier_address: addr,
        contact_person: vendor.contact_person || "",
        phone: vendor.phone || "",
      }))
    } else {
      setGrnData((prev) => ({
        ...prev,
        vendor_id: "",
        vendor_name: "",
        supplier_address: "",
        contact_person: "",
        phone: "",
      }))
    }
  }

  const handleGrnChange = (e) => {
    const { name, value } = e.target
    setGrnData((prev) => ({ ...prev, [name]: value }))
  }

  // ── Item entry ───────────────────────────────────────────────────────────
  const handleItemChange = (e) => {
    const { name, value } = e.target
    let updated = { ...currentItem, [name]: value }

    // Auto-fill from medicine master
    if (name === "name" && value) {
      const med = medicines.find(
        (m) => `${m.item_first_name} ${m.item_last_name || ""}`.trim() === value
      )
      if (med) {
        updated.hsn = med.hsn || ""
        updated.mrp = med.mrp || ""
      }
    }

    // Recalculate on numeric field changes
    if (["quantity", "unitPrice", "tax", "free"].includes(name)) {
      const qty = parseFloat(updated.quantity) || 0
      const price = parseFloat(updated.unitPrice) || 0
      const taxRate = parseFloat(updated.tax) || 0
      const free = parseFloat(updated.free) || 0

      const baseValue = qty * price
      const cgstRate = taxRate / 2
      const sgstRate = taxRate / 2
      const cgstAmt = baseValue * (cgstRate / 100)
      const sgstAmt = baseValue * (sgstRate / 100)
      const totalCost = baseValue + cgstAmt + sgstAmt

      updated.itemValue = baseValue.toFixed(2)
      updated.cgstPercent = cgstRate.toFixed(2)
      updated.sgstPercent = sgstRate.toFixed(2)
      updated.cgstAmt = cgstAmt.toFixed(2)
      updated.sgstAmt = sgstAmt.toFixed(2)
      updated.purchaseCost = totalCost.toFixed(2)
      updated.unitCostWithGst = (totalCost / (qty + free || 1)).toFixed(2)
      updated.totalstock = (qty + free).toString()
    }

    setCurrentItem(updated)
  }

  const addItem = () => {
    if (!currentItem.name || !currentItem.quantity || parseFloat(currentItem.quantity) <= 0) {
      toast.error("Medicine name and quantity are required")
      return
    }
    setItems((prev) => [...prev, { ...currentItem, id: Date.now() }])
    setCurrentItem(EMPTY_ITEM)
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  // ── Save GRN ─────────────────────────────────────────────────────────────
  const saveGRN = async () => {
    if (!grnData.purchase_category) { toast.error("Purchase Category is required"); return }
    if (!grnData.vendor_id) { toast.error("Vendor is required"); return }
    if (!grnData.invoice_no) { toast.error("Invoice No is required"); return }
    if (items.length === 0) { toast.error("Add at least one medicine item"); return }

    const payload = {
      ...grnData,
      items: JSON.stringify(items),
      payment_status: JSON.stringify([{
        status: "Not Paid",
        amount_paid: 0.0,
        pending_amount: parseFloat(grnData.net_invoice_amount),
        payment_method: null,
        payment_details: null,
        paid_by: null,
      }]),
    }

    setLoading(true)
    try {
      const url = editId ? `${baseUrl}grn/${editId}/` : `${baseUrl}grn/`
      const method = editId ? "PUT" : "POST"
      const response = await apiRequest(url, method, payload)
      if (response.success) {
        toast.success(
          editId
            ? "GRN updated successfully"
            : `GRN created! Number: ${response.data.grn_number}`
        )
        resetForm()
        fetchGRNList()
        setActiveTab("list")
      } else {
        toast.error(response.error || "Failed to save GRN")
      }
    } catch (err) {
      console.error("Error saving GRN:", err)
      toast.error("Internal Server Error")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (grn) => {
    setGrnData({
      purchase_category: grn.purchase_category || "",
      vendor_id: grn.vendor_id || "",
      vendor_name: grn.vendor_name || "",
      supplier_address: grn.supplier_address || "",
      contact_person: grn.contact_person || "",
      phone: grn.phone || "",
      grn_type: grn.grn_type || "INVOICE",
      invoice_no: grn.invoice_no || "",
      invoice_date: grn.invoice_date || today(),
      date: grn.date || today(),
      credit_period: grn.credit_period || "",
      due_date: grn.due_date || today(),
      reference: grn.reference || "",
      purchase_order: grn.purchase_order || "",
      payment_mode: grn.payment_mode || "CHEQUE",
      remarks: grn.remarks || "",
      taxable_amount: grn.taxable_amount || 0,
      non_taxable_amount: grn.non_taxable_amount || 0,
      cgst: grn.cgst || 0,
      sgst: grn.sgst || 0,
      igst: grn.igst || 0,
      tax_paid_to_supplier: grn.tax_paid_to_supplier || 0,
      total_discount: grn.total_discount || 0,
      round_amount: grn.round_amount || 0,
      total_amount: grn.total_amount || 0,
      net_invoice_amount: grn.net_invoice_amount || 0,
    })
    try {
      setItems(JSON.parse(grn.items || "[]"))
    } catch {
      setItems([])
    }
    setEditId(grn.grn_id)
    setActiveTab("create")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this GRN?")) return
    try {
      const response = await apiRequest(`${baseUrl}grn/${id}/`, "DELETE")
      if (response.success) {
        toast.success("GRN deleted successfully")
        fetchGRNList()
      } else {
        toast.error("Delete failed")
      }
    } catch (err) {
      toast.error("Delete failed")
    }
  }

  const resetForm = () => {
    setGrnData(EMPTY_GRN)
    setItems([])
    setCurrentItem(EMPTY_ITEM)
    setEditId(null)
  }

  const filtered = grnList.filter((g) => {
    const q = search.toLowerCase()
    return (
      g.grn_number?.toLowerCase().includes(q) ||
      g.vendor_name?.toLowerCase().includes(q) ||
      g.invoice_no?.toLowerCase().includes(q)
    )
  })

  const medicineSuggestions = medicines.map((m) =>
    `${m.item_first_name} ${m.item_last_name || ""}`.trim()
  )

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        {/* Page Header */}
        <PageHeader>
          <div>
            <PageTitle>🧾 GRN Generation</PageTitle>
            <PageSubtitle>Goods Receipt Note — Pharmacy Purchase</PageSubtitle>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              onClick={() => setActiveTab("create")}
              style={
                activeTab === "create"
                  ? { background: "white", color: colors.primary }
                  : { background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }
              }
            >
              + Create GRN
            </Button>
            <Button
              onClick={() => setActiveTab("list")}
              style={
                activeTab === "list"
                  ? { background: "white", color: colors.primary }
                  : { background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }
              }
            >
              📋 GRN List
            </Button>
          </div>
        </PageHeader>

        <FormContent>
          {/* ══════════════ CREATE / EDIT FORM ══════════════ */}
          {activeTab === "create" && (
            <>
              {/* ── Section 1: Header ── */}
              <Card>
                <CardHeader>📋 Inward Details {editId && <GrnBadge>Editing GRN</GrnBadge>}</CardHeader>
                <CardBody>
                  {/* Row 1: Category, Vendor, Date, Supplier Address */}
                  <FormRow>
                    <InputWrapper>
                      <Label required>Purchase Category</Label>
                      <Select
                        name="purchase_category"
                        value={grnData.purchase_category}
                        onChange={handleGrnChange}
                      >
                        <option value="">-- Select Category --</option>
                        {PURCHASE_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label required>Vendor</Label>
                      <Select
                        name="vendor_id"
                        value={grnData.vendor_id}
                        onChange={handleVendorChange}
                      >
                        <option value="">-- Select Vendor --</option>
                        {vendors.map((v) => (
                          <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Date</Label>
                      <Input type="date" name="date" value={grnData.date} onChange={handleGrnChange} />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Supplier Address</Label>
                      <ReadOnlyInput
                        value={grnData.supplier_address}
                        readOnly
                        placeholder="Auto-filled from vendor"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Contact Person</Label>
                      <ReadOnlyInput
                        value={grnData.contact_person}
                        readOnly
                        placeholder="Auto-filled from vendor"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Phone</Label>
                      <ReadOnlyInput
                        value={grnData.phone}
                        readOnly
                        placeholder="Auto-filled from vendor"
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Row 2: Type, Invoice No, Invoice Date, Credit, Due Date, Reference */}
                  <FormRow style={{ marginTop: 10 }}>
                    <InputWrapper>
                      <Label required>Type</Label>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="grn_type"
                            value="INVOICE"
                            checked={grnData.grn_type === "INVOICE"}
                            onChange={handleGrnChange}
                          />
                          Invoice
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            name="grn_type"
                            value="PACKING_SLIP"
                            checked={grnData.grn_type === "PACKING_SLIP"}
                            onChange={handleGrnChange}
                          />
                          Packing Slip
                        </RadioLabel>
                      </RadioGroup>
                    </InputWrapper>

                    <InputWrapper>
                      <Label required>Invoice No</Label>
                      <Input
                        name="invoice_no"
                        value={grnData.invoice_no}
                        onChange={handleGrnChange}
                        placeholder="e.g. INV-52412"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label required>Invoice Date</Label>
                      <Input
                        type="date"
                        name="invoice_date"
                        value={grnData.invoice_date}
                        onChange={handleGrnChange}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Credit Period</Label>
                      <Input
                        name="credit_period"
                        value={grnData.credit_period}
                        onChange={handleGrnChange}
                        placeholder="e.g. 30 days"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        name="due_date"
                        value={grnData.due_date}
                        onChange={handleGrnChange}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Reference</Label>
                      <Input
                        name="reference"
                        value={grnData.reference}
                        onChange={handleGrnChange}
                        placeholder="Reference"
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Row 3: Purchase Order, Payment Mode */}
                  <FormRow style={{ marginTop: 10 }}>
                    <InputWrapper>
                      <Label>Purchase Order</Label>
                      <Input
                        name="purchase_order"
                        value={grnData.purchase_order}
                        onChange={handleGrnChange}
                        placeholder="PO Number (optional)"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Payment Mode</Label>
                      <Select
                        name="payment_mode"
                        value={grnData.payment_mode}
                        onChange={handleGrnChange}
                      >
                        {PAYMENT_MODES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Select>
                    </InputWrapper>
                  </FormRow>
                </CardBody>
              </Card>

              {/* ── Section 2: Medicine Items ── */}
              <Card>
                <CardHeader>💊 Add Medicine Items</CardHeader>
                <CardBody>
                  {/* Item entry row */}
                  <div style={{ overflowX: "auto" }}>
                    <ItemRow>
                      <InputWrapper>
                        <Label>Medicine Name *</Label>
                        <Input
                          list="medicine-list"
                          name="name"
                          value={currentItem.name}
                          onChange={handleItemChange}
                          placeholder="Search medicine..."
                        />
                        <datalist id="medicine-list">
                          {medicineSuggestions.map((m, i) => (
                            <option key={i} value={m} />
                          ))}
                        </datalist>
                      </InputWrapper>

                      <InputWrapper>
                        <Label>HSN</Label>
                        <Input
                          name="hsn"
                          value={currentItem.hsn}
                          onChange={handleItemChange}
                          placeholder="HSN"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Batch</Label>
                        <Input
                          name="batch"
                          value={currentItem.batch}
                          onChange={handleItemChange}
                          placeholder="Batch No."
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Expiry</Label>
                        <Input
                          type="date"
                          name="expiry"
                          value={currentItem.expiry}
                          onChange={handleItemChange}
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Qty *</Label>
                        <Input
                          type="number"
                          name="quantity"
                          value={currentItem.quantity}
                          onChange={handleItemChange}
                          placeholder="0"
                          min="0"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          name="unitPrice"
                          value={currentItem.unitPrice}
                          onChange={handleItemChange}
                          placeholder="0.00"
                          min="0"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Free</Label>
                        <Input
                          type="number"
                          name="free"
                          value={currentItem.free}
                          onChange={handleItemChange}
                          placeholder="0"
                          min="0"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Tax %</Label>
                        <Input
                          type="number"
                          name="tax"
                          value={currentItem.tax}
                          onChange={handleItemChange}
                          placeholder="0"
                          min="0"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>MRP</Label>
                        <Input
                          type="number"
                          name="mrp"
                          value={currentItem.mrp}
                          onChange={handleItemChange}
                          placeholder="0.00"
                          min="0"
                        />
                      </InputWrapper>

                      <AddItemBtn onClick={addItem} title="Add item">
                        <Plus size={16} /> Add
                      </AddItemBtn>
                    </ItemRow>
                  </div>

                  {/* Computed preview */}
                  {(parseFloat(currentItem.itemValue) > 0) && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 6,
                        padding: "10px 16px",
                        fontSize: "0.82rem",
                        color: "#15803d",
                        display: "flex",
                        gap: 20,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <span>Base Value: <strong>₹{currentItem.itemValue}</strong></span>
                      <span>CGST ({currentItem.cgstPercent}%): <strong>₹{currentItem.cgstAmt}</strong></span>
                      <span>SGST ({currentItem.sgstPercent}%): <strong>₹{currentItem.sgstAmt}</strong></span>
                      <span>Total Cost: <strong>₹{currentItem.purchaseCost}</strong></span>
                      <span>Unit Cost w/ GST: <strong>₹{currentItem.unitCostWithGst}</strong></span>
                    </div>
                  )}

                  {/* Added items table */}
                  {items.length === 0 ? (
                    <EmptyItems>No medicines added yet. Fill in the form above and click "Add".</EmptyItems>
                  ) : (
                    <TableWrapper style={{ marginTop: 10 }}>
                      <Table>
                        <thead>
                          <tr>
                            <Th>#</Th>
                            <Th>Medicine</Th>
                            <Th>HSN</Th>
                            <Th>Batch</Th>
                            <Th>Expiry</Th>
                            <Th>Qty</Th>
                            <Th>Free</Th>
                            <Th>Unit Price</Th>
                            <Th>Base Val</Th>
                            <Th>Tax %</Th>
                            <Th>CGST ₹</Th>
                            <Th>SGST ₹</Th>
                            <Th>Total ₹</Th>
                            <Th>MRP</Th>
                            <Th>Action</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <Tr key={item.id}>
                              <Td>{idx + 1}</Td>
                              <Td style={{ fontWeight: 600, minWidth: 140 }}>{item.name}</Td>
                              <Td>{item.hsn || "—"}</Td>
                              <Td>{item.batch || "—"}</Td>
                              <Td>{item.expiry || "—"}</Td>
                              <Td>{item.quantity}</Td>
                              <Td>{item.free}</Td>
                              <Td>₹{parseFloat(item.unitPrice || 0).toFixed(2)}</Td>
                              <Td>₹{item.itemValue}</Td>
                              <Td>{item.tax}%</Td>
                              <Td>₹{item.cgstAmt}</Td>
                              <Td>₹{item.sgstAmt}</Td>
                              <Td style={{ fontWeight: 700, color: colors.primary }}>₹{item.purchaseCost}</Td>
                              <Td>₹{parseFloat(item.mrp || 0).toFixed(2)}</Td>
                              <Td>
                                <Trash2
                                  size={16}
                                  color={colors.danger}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => removeItem(item.id)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  )}
                </CardBody>
              </Card>

              {/* ── Section 3: Financial Summary ── */}
              {items.length > 0 && (
                <Card>
                  <CardHeader>💰 Financial Summary</CardHeader>
                  <CardBody>
                    <SummaryGrid>
                      <SummaryCard>
                        <SummaryLabel>Taxable Amount</SummaryLabel>
                        <SummaryValue>₹{grnData.taxable_amount}</SummaryValue>
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>CGST Total</SummaryLabel>
                        <SummaryValue>₹{grnData.cgst}</SummaryValue>
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>SGST Total</SummaryLabel>
                        <SummaryValue>₹{grnData.sgst}</SummaryValue>
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>Tax Paid to Supplier</SummaryLabel>
                        <SummaryValue>₹{grnData.tax_paid_to_supplier}</SummaryValue>
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>Round Off</SummaryLabel>
                        <Input
                          type="number"
                          name="round_amount"
                          value={grnData.round_amount}
                          onChange={handleGrnChange}
                          style={{ height: 32, width: 90, fontSize: "0.85rem" }}
                        />
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>Total Amount</SummaryLabel>
                        <SummaryValue>₹{grnData.total_amount}</SummaryValue>
                      </SummaryCard>
                      <SummaryCard>
                        <SummaryLabel>Net Invoice Amount</SummaryLabel>
                        <SummaryValue primary>₹{grnData.net_invoice_amount}</SummaryValue>
                      </SummaryCard>
                    </SummaryGrid>

                    <div style={{ marginTop: 20 }}>
                      <Label>Remarks</Label>
                      <TextArea
                        name="remarks"
                        value={grnData.remarks}
                        onChange={handleGrnChange}
                        placeholder="Any specific remarks about this delivery..."
                        style={{ marginTop: 6 }}
                      />
                    </div>
                  </CardBody>
                </Card>
              )}

              <ButtonContainer>
                <Button secondary onClick={resetForm}>
                  <X size={16} /> Clear Form
                </Button>
                <Button onClick={saveGRN} disabled={loading}>
                  <ShoppingCart size={16} />
                  {loading ? "Saving..." : editId ? "Update GRN" : "Create GRN"}
                </Button>
              </ButtonContainer>
            </>
          )}

          {/* ══════════════ GRN LIST ══════════════ */}
          {activeTab === "list" && (
            <>
              <SectionTitle><h3>GRN Records</h3></SectionTitle>

              <ControlsContainer>
                <SearchContainer>
                  <InputWrapper>
                    <Label>Search</Label>
                    <Input
                      style={{ minWidth: 260 }}
                      placeholder="Search GRN No, Vendor, Invoice..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputWrapper>
                </SearchContainer>
                <div style={{ color: colors.textMuted, fontSize: "0.85rem", alignSelf: "flex-end" }}>
                  {filtered.length} record(s)
                </div>
              </ControlsContainer>

              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>GRN No</Th>
                      <Th>Date</Th>
                      <Th>Vendor</Th>
                      <Th>Category</Th>
                      <Th>Invoice No</Th>
                      <Th>Invoice Date</Th>
                      <Th>Payment Mode</Th>
                      <Th>Net Amount</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10}>
                          <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textMuted }}>
                            No GRN records found.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((grn, idx) => (
                        <Tr key={grn.grn_id}>
                          <Td>{idx + 1}</Td>
                          <Td>
                            <GrnBadge>{grn.grn_number}</GrnBadge>
                          </Td>
                          <Td>{grn.date}</Td>
                          <Td style={{ fontWeight: 600 }}>{grn.vendor_name}</Td>
                          <Td style={{ fontSize: "0.8rem" }}>
                            {PURCHASE_CATEGORIES.find((c) => c.value === grn.purchase_category)?.label || grn.purchase_category}
                          </Td>
                          <Td>{grn.invoice_no}</Td>
                          <Td>{grn.invoice_date}</Td>
                          <Td>{grn.payment_mode}</Td>
                          <Td style={{ fontWeight: 700, color: colors.primary }}>
                            ₹{parseFloat(grn.net_invoice_amount || 0).toFixed(2)}
                          </Td>
                          <Td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <ActionBtn onClick={() => handleEdit(grn)}>Edit</ActionBtn>
                              <ActionBtn danger onClick={() => handleDelete(grn.grn_id)}>Delete</ActionBtn>
                            </div>
                          </Td>
                        </Tr>
                      ))
                    )}
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