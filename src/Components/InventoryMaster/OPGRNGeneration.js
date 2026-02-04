"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaCheck } from "react-icons/fa"
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
  CheckboxWrapper,
  Checkbox,
  colors
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Plus, Trash2, Save, X } from "lucide-react"
// No local styled components here anymore.
const OPGRNGeneration = () => {
  const [vendors, setVendors] = useState([])
  const [stocks, setStocks] = useState([])
  const [grnData, setGrnData] = useState({
    date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    invoice_no: "",
    invoice_date: new Date().toISOString().split("T")[0],
    purchase_category: "OP PHARMACY",
    credit_period: "",
    due_date: new Date().toISOString().split("T")[0],
    payment_mode: "CHEQUE",
    remarks: "",
    non_taxable_amount: 0,
    taxable_amount: 0,
    tax_paid_to_supplier: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    central_sales_tax: 0,
    local_tax: 0,
    round_amount: 0,
    total_amount: 0,
    net_invoice_amount: 0,
    total_discount: 0,
    tax_on_free_items: 0,
    quotation_rate: 0,
    courier_transport_charge: 0,
  })

  const [items, setItems] = useState([])
  const [currentItem, setCurrentItem] = useState({
    name: "",
    hsn: "",
    batch: "",
    expiry: "",
    packing: "1",
    noOfUnit: "1",
    quantity: "0",
    itemValue: "0",
    packingPrice: "0",
    unitPrice: "0",
    free: "0",
    totalstock: "0",
    pRate: "0",
    tax: "0",
    cgstPercent: "0",
    cgstAmt: "0",
    sgstPercent: "0",
    sgstAmt: "0",
    purchaseDiscountPercent: "0",
    discountedAmt: "0",
    purchaseCost: "0",
    unitCostWithGst: "0",
    mrp: "0",
  })

  const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

  useEffect(() => {
    fetchVendors()
    fetchStocks()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await apiRequest(`${baseUrl}vendor/`, "GET")
      if (response.success) {
        setVendors(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const fetchStocks = async () => {
    try {
      const response = await apiRequest(`${baseUrl}op-pharmacy-stock/`, "GET")
      if (response.success) {
        setStocks(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("Error fetching stocks:", error)
    }
  }

  const handleGrnChange = (e) => {
    const { name, value } = e.target
    setGrnData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (e) => {
    const { name, value } = e.target
    let updated = { ...currentItem, [name]: value }

    if (name === "name" && value !== "") {
      const selectedStock = stocks.find(s => s.medicine_name === value)
      if (selectedStock) {
        updated = {
          ...updated,
          hsn: selectedStock.hsn_code || updated.hsn,
          mrp: selectedStock.mrp || updated.mrp,
          tax: (parseFloat(selectedStock.cgst_rate || 0) + parseFloat(selectedStock.sgst_rate || 0)).toString()
        }
      }
    }

    if (["quantity", "unitPrice", "tax", "free"].includes(name)) {
      const qty = parseFloat(updated.quantity) || 0
      const price = parseFloat(updated.unitPrice) || 0
      const taxRate = parseFloat(updated.tax) || 0
      const free = parseFloat(updated.free) || 0

      const baseValue = qty * price
      const cgstRate = taxRate / 2
      const sgstRate = taxRate / 2

      const cgstAmt = (baseValue * (cgstRate / 100))
      const sgstAmt = (baseValue * (sgstRate / 100))
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

  const addItemToGrn = () => {
    if (!currentItem.name || !currentItem.quantity || currentItem.quantity === "0") {
      toast.error("Item Name and Quantity are required")
      return
    }
    setItems([...items, { ...currentItem, id: Date.now() }])
    resetCurrentItem()
  }

  const resetCurrentItem = () => {
    setCurrentItem({
      name: "",
      hsn: "",
      batch: "",
      expiry: "",
      packing: "1",
      noOfUnit: "1",
      quantity: "0",
      itemValue: "0",
      packingPrice: "0",
      unitPrice: "0",
      free: "0",
      totalstock: "0",
      pRate: "0",
      tax: "0",
      cgstPercent: "0",
      cgstAmt: "0",
      sgstPercent: "0",
      sgstAmt: "0",
      purchaseDiscountPercent: "0",
      discountedAmt: "0",
      purchaseCost: "0",
      unitCostWithGst: "0",
      mrp: "0",
    })
  }

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  useEffect(() => {
    const summary = items.reduce((acc, item) => {
      acc.taxable_amount += parseFloat(item.itemValue) || 0
      acc.cgst += parseFloat(item.cgstAmt) || 0
      acc.sgst += parseFloat(item.sgstAmt) || 0
      acc.total_amount += parseFloat(item.purchaseCost) || 0
      return acc
    }, { taxable_amount: 0, cgst: 0, sgst: 0, total_amount: 0 })

    setGrnData(prev => ({
      ...prev,
      taxable_amount: summary.taxable_amount.toFixed(2),
      non_taxable_amount: summary.taxable_amount.toFixed(2),
      cgst: summary.cgst.toFixed(2),
      sgst: summary.sgst.toFixed(2),
      tax_paid_to_supplier: (summary.cgst + summary.sgst).toFixed(2),
      total_amount: summary.total_amount.toFixed(2),
      net_invoice_amount: summary.total_amount.toFixed(2)
    }))
  }, [items])

  const saveGRN = async () => {
    if (!grnData.vendor_id || !grnData.invoice_no || items.length === 0) {
      toast.error("Please fill Vendor, Invoice No and add at least one item")
      return
    }

    const payload = {
      ...grnData,
      items: JSON.stringify(items),
      payment_status: JSON.stringify([{
        status: "Not Paid",
        amount_paid: 0.0,
        pending_amount: parseFloat(grnData.net_invoice_amount),
        payment_method: null,
        payment_details: null,
        paid_by: null
      }])
    }

    try {
      const response = await apiRequest(`${baseUrl}op-grn/`, "POST", payload)
      if (response.success) {
        toast.success("GRN Saved Successfully! Number: " + response.data.grn_number)
        resetForm()
      } else {
        toast.error(response.error || "Failed to save GRN")
      }
    } catch (error) {
      console.error("Error saving GRN:", error)
      toast.error("Internal Server Error")
    }
  }

  const resetForm = () => {
    setGrnData({
      date: new Date().toISOString().split("T")[0],
      vendor_id: "",
      invoice_no: "",
      invoice_date: new Date().toISOString().split("T")[0],
      purchase_category: "OP PHARMACY",
      credit_period: "",
      due_date: new Date().toISOString().split("T")[0],
      payment_mode: "CHEQUE",
      remarks: "",
      non_taxable_amount: 0,
      taxable_amount: 0,
      tax_paid_to_supplier: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      central_sales_tax: 0,
      local_tax: 0,
      round_amount: 0,
      total_amount: 0,
      net_invoice_amount: 0,
      total_discount: 0,
      tax_on_free_items: 0,
      quotation_rate: 0,
      courier_transport_charge: 0,
    })
    setItems([])
  }

  return (
    <PageWrapper>
      <Container>
        <FormContent>
          <SectionTitle><h3>OP Pharmacy GRN Generation</h3></SectionTitle>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <SectionTitle><h4>Inward Details</h4></SectionTitle>
            <FormRow>
              <InputWrapper>
                <Label>Vendor *</Label>
                <Select name="vendor_id" value={grnData.vendor_id} onChange={handleGrnChange}>
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>
                  ))}
                </Select>
              </InputWrapper>
              <InputWrapper>
                <Label>GRN Date *</Label>
                <Input type="date" name="date" value={grnData.date} onChange={handleGrnChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>Invoice No *</Label>
                <Input type="text" name="invoice_no" value={grnData.invoice_no} onChange={handleGrnChange} placeholder="Invoice Number" />
              </InputWrapper>
              <InputWrapper>
                <Label>Invoice Date</Label>
                <Input type="date" name="invoice_date" value={grnData.invoice_date} onChange={handleGrnChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>Payment Mode</Label>
                <Select name="payment_mode" value={grnData.payment_mode} onChange={handleGrnChange}>
                  <option value="CASH">CASH</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="CREDIT">CREDIT</option>
                  <option value="UPI">UPI</option>
                </Select>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <InputWrapper>
                <Label>Credit Period</Label>
                <Input type="text" name="credit_period" value={grnData.credit_period} onChange={handleGrnChange} placeholder="e.g. 30 days" />
              </InputWrapper>
              <InputWrapper>
                <Label>Due Date</Label>
                <Input type="date" name="due_date" value={grnData.due_date} onChange={handleGrnChange} />
              </InputWrapper>
              <InputWrapper style={{ flex: 2 }}>
                <Label>Purchase Category</Label>
                <Input type="text" value={grnData.purchase_category} readOnly style={{ backgroundColor: '#f1f5f9' }} />
              </InputWrapper>
            </FormRow>

            <SectionTitle style={{ marginTop: '20px' }}><h4>Add Items</h4></SectionTitle>
            <FormRow style={{ alignItems: 'flex-end', backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <InputWrapper style={{ minWidth: '200px' }}>
                <Label>Medicine Name *</Label>
                <Input list="op-medicines" name="name" value={currentItem.name} onChange={handleItemChange} placeholder="Select or Type Name" />
                <datalist id="op-medicines">
                  {stocks.map((s, idx) => (
                    <option key={idx} value={s.medicine_name}>{s.batch_number ? `Batch: ${s.batch_number}` : ''}</option>
                  ))}
                </datalist>
              </InputWrapper>
              <InputWrapper>
                <Label>HSN</Label>
                <Input name="hsn" value={currentItem.hsn} onChange={handleItemChange} placeholder="HSN" />
              </InputWrapper>
              <InputWrapper>
                <Label>Batch</Label>
                <Input name="batch" value={currentItem.batch} onChange={handleItemChange} placeholder="Batch" />
              </InputWrapper>
              <InputWrapper>
                <Label>Expiry</Label>
                <Input type="date" name="expiry" value={currentItem.expiry} onChange={handleItemChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>Qty *</Label>
                <Input type="number" name="quantity" value={currentItem.quantity} onChange={handleItemChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>Unit Price</Label>
                <Input type="number" name="unitPrice" value={currentItem.unitPrice} onChange={handleItemChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>Tax %</Label>
                <Input type="number" name="tax" value={currentItem.tax} onChange={handleItemChange} />
              </InputWrapper>
              <InputWrapper>
                <Label>MRP</Label>
                <Input type="number" name="mrp" value={currentItem.mrp} onChange={handleItemChange} />
              </InputWrapper>
              <Button style={{ marginBottom: '8px' }} onClick={addItemToGrn}>
                <Plus size={18} /> Add
              </Button>
            </FormRow>

            {items.length > 0 && (
              <TableWrapper style={{ marginTop: '24px' }}>
                <Table>
                  <thead>
                    <tr>
                      <Th>Item Name</Th>
                      <Th>HSN</Th>
                      <Th>Batch</Th>
                      <Th>Expiry</Th>
                      <Th>Qty</Th>
                      <Th>Base Val</Th>
                      <Th>Tax %</Th>
                      <Th>CGST/SGST Amt</Th>
                      <Th>Total</Th>
                      <Th>MRP</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <Tr key={item.id}>
                        <Td>{item.name}</Td>
                        <Td>{item.hsn}</Td>
                        <Td>{item.batch}</Td>
                        <Td>{item.expiry}</Td>
                        <Td>{item.quantity}</Td>
                        <Td>₹{item.itemValue}</Td>
                        <Td>{item.tax}%</Td>
                        <Td>₹{item.cgstAmt} / ₹{item.sgstAmt}</Td>
                        <Td style={{ fontWeight: 600 }}>₹{item.purchaseCost}</Td>
                        <Td>₹{item.mrp}</Td>
                        <Td>
                          <Trash2 size={16} color="#ef4444" cursor="pointer" onClick={() => removeItem(item.id)} />
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginTop: '24px',
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Base Value</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textMain }}>₹{grnData.taxable_amount}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>CGST Total</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textMain }}>₹{grnData.cgst}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>SGST Total</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textMain }}>₹{grnData.sgst}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: colors.primary }}>₹{grnData.total_amount}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Round Off</span>
                <Input type="number" name="round_amount" value={grnData.round_amount} onChange={handleGrnChange} style={{ height: '30px', width: '80px' }} />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <Label>Remarks</Label>
              <TextArea name="remarks" value={grnData.remarks} onChange={handleGrnChange} placeholder="Enter any specific remarks about this delivery..." />
            </div>

            <ButtonContainer style={{ marginTop: '30px' }}>
              <Button secondary onClick={resetForm}><X size={18} /> Clear Form</Button>
              <Button onClick={saveGRN}><Save size={18} /> Save & Generate GRN</Button>
            </ButtonContainer>
          </div>
        </FormContent>
      </Container>
    </PageWrapper>
  )
}

export default OPGRNGeneration
