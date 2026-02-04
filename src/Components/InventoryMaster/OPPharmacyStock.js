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
    FormContent,
    ControlsContainer,
    SearchContainer,
    InputWrapper,
    ButtonContainer,
    TableWrapper
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"

const OPPharmacyStock = () => {
    const [stocks, setStocks] = useState([])
    const [formData, setFormData] = useState({
        medicine_name: "",
        batch_number: "",
        hsn_code: "",
        expiry_date: "",
        purchase_rate: 0,
        purchase_cost: 0,
        mrp: 0,
        taxable_amount: 0,
        cgst_rate: 0,
        cgst_amount: 0,
        sgst_rate: 0,
        sgst_amount: 0,
        total_quantity: 0,
    })

    const [search, setSearch] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

    useEffect(() => {
        fetchStocks()
    }, [])

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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        const updatedData = { ...formData, [name]: value }

        if (["purchase_rate", "total_quantity", "cgst_rate", "sgst_rate"].includes(name)) {
            const rate = parseFloat(updatedData.purchase_rate) || 0
            const qty = parseInt(updatedData.total_quantity) || 0
            const cost = rate * qty
            updatedData.purchase_cost = cost.toFixed(2)

            const cgstRate = parseFloat(updatedData.cgst_rate) || 0
            const sgstRate = parseFloat(updatedData.sgst_rate) || 0

            const taxable = parseFloat(updatedData.taxable_amount) || cost
            updatedData.cgst_amount = (taxable * (cgstRate / 100)).toFixed(2)
            updatedData.sgst_amount = (taxable * (sgstRate / 100)).toFixed(2)
        }

        if (name === "taxable_amount") {
            const taxable = parseFloat(value) || 0
            const cgstRate = parseFloat(updatedData.cgst_rate) || 0
            const sgstRate = parseFloat(updatedData.sgst_rate) || 0
            updatedData.cgst_amount = (taxable * (cgstRate / 100)).toFixed(2)
            updatedData.sgst_amount = (taxable * (sgstRate / 100)).toFixed(2)
        }

        setFormData(updatedData)
    }

    const handleSave = async () => {
        try {
            if (!formData.medicine_name || !formData.batch_number) {
                toast.error("Medicine Name and Batch Number are required")
                return
            }

            let response
            if (isEditing && editingId) {
                response = await apiRequest(`${baseUrl}op-pharmacy-stock/${editingId}/`, "PATCH", formData)
            } else {
                response = await apiRequest(`${baseUrl}op-pharmacy-stock/`, "POST", formData)
            }

            if (response.success) {
                toast.success(isEditing ? "Stock updated successfully!" : "Stock added successfully!")
                resetForm()
                fetchStocks()
            } else {
                toast.error(response.error || "Failed to save stock")
            }
        } catch (error) {
            console.error("Error saving stock:", error)
            toast.error("An unexpected error occurred")
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this stock record?")) return
        try {
            const response = await apiRequest(`${baseUrl}op-pharmacy-stock/${id}/`, "DELETE")
            if (response.success) {
                toast.success("Stock deleted successfully")
                fetchStocks()
            } else {
                toast.error(response.error || "Failed to delete stock")
            }
        } catch (error) {
            console.error("Error deleting stock:", error)
        }
    }

    const handleEdit = (stock) => {
        setFormData({ ...stock })
        setIsEditing(true)
        setEditingId(stock.id || stock.op_stock_id || stock._id?.$oid)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const resetForm = () => {
        setFormData({
            medicine_name: "",
            batch_number: "",
            hsn_code: "",
            expiry_date: "",
            purchase_rate: 0,
            purchase_cost: 0,
            mrp: 0,
            taxable_amount: 0,
            cgst_rate: 0,
            cgst_amount: 0,
            sgst_rate: 0,
            sgst_amount: 0,
            total_quantity: 0,
        })
        setIsEditing(false)
        setEditingId(null)
    }

    const filteredStocks = stocks.filter(
        (stock) =>
            stock.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
            stock.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
            stock.op_stock_id?.includes(search),
    )

    return (
        <PageWrapper>
            <Container>
                <SectionTitle><h3>OP Pharmacy Stock Management</h3></SectionTitle>

                <FormContent>
                    <FormRow>
                        <InputWrapper>
                            <Label required>Medicine Name</Label>
                            <Input
                                type="text"
                                name="medicine_name"
                                value={formData.medicine_name}
                                onChange={handleInputChange}
                                placeholder="Enter medicine name"
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label required>Batch Number</Label>
                            <Input
                                type="text"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={handleInputChange}
                                placeholder="Enter batch number"
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>HSN Code</Label>
                            <Input
                                type="text"
                                name="hsn_code"
                                value={formData.hsn_code}
                                onChange={handleInputChange}
                                placeholder="Enter HSN code"
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Expiry Date</Label>
                            <Input
                                type="date"
                                name="expiry_date"
                                value={formData.expiry_date}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                    </FormRow>

                    <FormRow>
                        <InputWrapper>
                            <Label>Total Quantity</Label>
                            <Input
                                type="number"
                                name="total_quantity"
                                value={formData.total_quantity}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Purchase Rate</Label>
                            <Input
                                type="number"
                                name="purchase_rate"
                                value={formData.purchase_rate}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Purchase Cost</Label>
                            <Input
                                type="number"
                                name="purchase_cost"
                                value={formData.purchase_cost}
                                readOnly
                                style={{ backgroundColor: '#f9f9f9' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>MRP</Label>
                            <Input
                                type="number"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                    </FormRow>

                    <FormRow>
                        <InputWrapper>
                            <Label>Taxable Amount</Label>
                            <Input
                                type="number"
                                name="taxable_amount"
                                value={formData.taxable_amount}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>CGST Rate (%)</Label>
                            <Input
                                type="number"
                                name="cgst_rate"
                                value={formData.cgst_rate}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>CGST Amount</Label>
                            <Input
                                type="number"
                                name="cgst_amount"
                                value={formData.cgst_amount}
                                readOnly
                                style={{ backgroundColor: '#f9f9f9' }}
                            />
                        </InputWrapper>
                    </FormRow>

                    <FormRow>
                        <InputWrapper />
                        <InputWrapper>
                            <Label>SGST Rate (%)</Label>
                            <Input
                                type="number"
                                name="sgst_rate"
                                value={formData.sgst_rate}
                                onChange={handleInputChange}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>SGST Amount</Label>
                            <Input
                                type="number"
                                name="sgst_amount"
                                value={formData.sgst_amount}
                                readOnly
                                style={{ backgroundColor: '#f9f9f9' }}
                            />
                        </InputWrapper>
                    </FormRow>

                    <ButtonContainer>
                        <Button secondary onClick={resetForm}>
                            <FaTimes /> Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {isEditing ? <FaCheck /> : <FaPlus />}
                            {isEditing ? "Update Stock" : "Save Stock"}
                        </Button>
                    </ButtonContainer>
                </FormContent>

                <SectionTitle><h3>OP Stock List</h3></SectionTitle>

                <ControlsContainer>
                    <SearchContainer>
                        <Input
                            type="text"
                            placeholder="Search by Medicine, Batch, or ID"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button title="Search"><FaSearch /></Button>
                    </SearchContainer>
                </ControlsContainer>

                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Stock ID</Th>
                                <Th>Medicine Name</Th>
                                <Th>Batch</Th>
                                <Th>Expiry</Th>
                                <Th>Qty</Th>
                                <Th>MRP</Th>
                                <Th>Cost</Th>
                                <Th>Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.length === 0 ? (
                                <Tr>
                                    <Td colSpan="8" style={{ textAlign: "center", color: "#999" }}>
                                        No stock records found
                                    </Td>
                                </Tr>
                            ) : (
                                filteredStocks.map((stock) => (
                                    <Tr key={stock.id || stock.op_stock_id || stock._id?.$oid}>
                                        <Td>{stock.op_stock_id || '-'}</Td>
                                        <Td>{stock.medicine_name}</Td>
                                        <Td>{stock.batch_number}</Td>
                                        <Td>{stock.expiry_date || '-'}</Td>
                                        <Td>{stock.total_quantity}</Td>
                                        <Td>₹{stock.mrp}</Td>
                                        <Td>₹{stock.purchase_cost}</Td>
                                        <Td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <FaEdit
                                                    style={{ cursor: 'pointer', color: '#0d9488' }}
                                                    onClick={() => handleEdit(stock)}
                                                    title="Edit"
                                                />
                                                <FaTrash
                                                    style={{ cursor: 'pointer', color: '#ef4444' }}
                                                    onClick={() => handleDelete(stock.id || stock.op_stock_id || stock._id?.$oid)}
                                                    title="Delete"
                                                />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </Container>
        </PageWrapper>
    )
}

export default OPPharmacyStock
