import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Select from 'react-select';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import {
    PageWrapper,
    Container,
    Input,
    Button,
    Table,
    Th, Td, Tr,
    Label,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors,
    fadeIn
} from '../GlobalStyles';


const DateInput = styled(Input)`
    &[type="date"] {
        cursor: pointer;
        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            filter: invert(47%) sepia(82%) saturate(445%) hue-rotate(130deg) brightness(95%) contrast(92%);
            &:hover { transform: scale(1.1); }
        }
    }
`;

const GlassHeader = styled.div`
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    padding: 24px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        pointer-events: none;
    }
`;

const FormCard = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
`;

const SectionTitleCard = styled.div`
    padding: 12px 20px;
    background: ${props => props.$bg || '#f8fafc'};
    border-bottom: 1px solid ${colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: ${props => props.$color || colors.primary};
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(${props => props.$minWidth || '180px'}, 1fr));
    gap: 15px 20px;
    padding: 20px;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const NetPayableCard = styled.div`
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    color: white;
    padding: 30px 25px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    box-shadow: 0 10px 20px rgba(13, 148, 136, 0.2);
    animation: ${fadeIn} 0.5s ease-out;

    .label { font-size: 0.9rem; opacity: 0.9; margin-bottom: 4px; font-weight: 500; }
    .value { font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em; }
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    padding-bottom: 8px;
    border-bottom: 1px dashed ${colors.border};
    
    &:last-child { border-bottom: none; }

    .label { color: ${colors.textMuted}; font-weight: 500; }
    .value { color: ${colors.textMain}; font-weight: 700; }
    .value.danger { color: ${colors.danger}; }
`;

const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 25px;
    background: white;
    border-top: 1px solid ${colors.border};
    border-radius: 0 0 12px 12px;
`;

const ModalContainerAnimated = styled(ModalContainer)`
    animation: ${fadeIn} 0.3s ease-out;
`;

const ItemTableWrapper = styled.div`
    overflow-x: auto;
    background: white;
    
    table {
        min-width: 1000px;
        border-collapse: collapse;
        
        th {
            background: linear-gradient(90deg, ${colors.primaryDark} 0%, ${colors.primary} 100%) !important;
            color: white !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 15px !important;
            font-size: 0.75rem !important;
            border: none !important;
            text-align: left;
        }
    }
`;

const CalendarGlobalStyles = createGlobalStyle`
    .ant-picker-dropdown {
        z-index: 10000 !important;
    }
    .ant-picker-header {
        display: flex !important;
        align-items: center;
        background: #0d9488 !important;
        padding: 8px 12px !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
    }
    .ant-picker-header button,
    .ant-picker-header-view,
    .ant-picker-header-view button {
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    .ant-picker-header button:hover,
    .ant-picker-header-view button:hover {
        color: #ccfbf1 !important;
    }
    .ant-picker-header .ant-picker-action {
        color: white !important;
    }
    .ant-picker-content th {
        color: #1e3a8a !important;
        font-weight: 600 !important;
    }
    .ant-picker-year-panel, .ant-picker-month-panel {
        .ant-picker-header {
            background: #1e3a8a !important;
            color: white !important;
        }
    }
`;

const StoresGRNGeneration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editGrn = location.state?.editGrn || null;
    const isVerified = editGrn?.is_approved || false;
    const [loading, setLoading] = useState(false);
    
    const [items, setItems] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groupTypes, setGroupTypes] = useState([]);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        purchase_category: '',
        vendor_id: '',
        supplier_address: '',
        contact_person: '',
        phone: '',
        invoice_no: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_mode: 'CHEQUE',
        credit_period: '',
        due_date: '',
        remarks: '',
        quotation_rate: 0,
        courier_transport_charge: 0,
        igst: 0,
        cess: 0,
        local_tax: 0,
        tax_paid_to_supplier: 0,
        central_sales_tax: 0,
        round_type: 'add', // NEW: tracks whether we are adding or subtracting
        round_amount: 0
    });

    const paymentModes = [
        { value: 'CHEQUE', label: 'CHEQUE' },
        { value: 'CASH', label: 'CASH' },
        { value: 'NEFT', label: 'NEFT' },
        { value: 'RTGS', label: 'RTGS' },
        { value: 'UPI', label: 'UPI' }
    ];

    const purchaseCategories = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Credit', label: 'Credit' }
    ];

    const months = [
        { value: '01', label: 'Jan (01)' },
        { value: '02', label: 'Feb (02)' },
        { value: '03', label: 'Mar (03)' },
        { value: '04', label: 'Apr (04)' },
        { value: '05', label: 'May (05)' },
        { value: '06', label: 'Jun (06)' },
        { value: '07', label: 'Jul (07)' },
        { value: '08', label: 'Aug (08)' },
        { value: '09', label: 'Sep (09)' },
        { value: '10', label: 'Oct (10)' },
        { value: '11', label: 'Nov (11)' },
        { value: '12', label: 'Dec (12)' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => ({
        value: (currentYear + i).toString(),
        label: (currentYear + i).toString()
    }));

    const [grnItems, setGrnItems] = useState([]);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showAddItemMasterModal, setShowAddItemMasterModal] = useState(false);
    
    const [newItemMasterData, setNewItemMasterData] = useState({
        itemName: '',
        department: '',
        category: '',
        group: '',
        group_type: '',
        hsn: '',
        stockReorderLevel: '',
        total_quantity: 0,
        approved_quantity: 0
    });

    const [currentItem, setCurrentItem] = useState({
        item_id: '',
        name: '',
        hsn: '',
        batch: '',
        expMonth: '',
        expYear: '',
        expiry: '',
        packing: 1,
        no_of_unit: 1,
        quantity: 1,
        free: 0,
        itemValue: 0,
        tax: 0,
        purchaseDiscountPercent: 0,
        mrp: 0
    });

    useEffect(() => {
        fetchMasters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (editGrn) {
            // Retrieve raw round value from backend
            const rawRoundAmount = editGrn.round_amount?.$numberDecimal || editGrn.round_amount || 0;
            const parsedRoundAmount = parseFloat(rawRoundAmount);

            setFormData(prev => ({
                ...prev,
                date: editGrn.date || new Date().toISOString().split('T')[0],
                purchase_category: editGrn.purchase_category || '',
                vendor_id: editGrn.vendor_id || '',
                invoice_no: editGrn.invoice_no || '',
                invoice_date: editGrn.invoice_date || new Date().toISOString().split('T')[0],
                payment_mode: editGrn.payment_mode || 'CHEQUE',
                credit_period: editGrn.credit_period || '',
                due_date: editGrn.due_date || '',
                remarks: editGrn.remarks || '',
                quotation_rate: editGrn.quotation_rate?.$numberDecimal || editGrn.quotation_rate || 0,
                courier_transport_charge: editGrn.courier_transport_charge?.$numberDecimal || editGrn.courier_transport_charge || 0,
                igst: editGrn.igst?.$numberDecimal || editGrn.igst || 0,
                cess: editGrn.cess?.$numberDecimal || editGrn.cess || 0,
                local_tax: editGrn.local_tax?.$numberDecimal || editGrn.local_tax || 0,
                tax_paid_to_supplier: editGrn.tax_paid_to_supplier?.$numberDecimal || editGrn.tax_paid_to_supplier || 0,
                central_sales_tax: editGrn.central_sales_tax?.$numberDecimal || editGrn.central_sales_tax || 0,
                
                // NEW: Set toggle type based on negative/positive, and store absolute amount
                round_type: parsedRoundAmount < 0 ? 'subtract' : 'add',
                round_amount: Math.abs(parsedRoundAmount) 
            }));

            let itemsArray = editGrn.items;
            if (typeof itemsArray === 'string') {
                try {
                    itemsArray = JSON.parse(itemsArray);
                } catch (e) {
                    itemsArray = [];
                }
            }
            
            const normalizedItems = (itemsArray || []).map((item, index) => {
                let normId = item.id;
                if (normId && typeof normId === 'object') {
                    normId = normId.$numberLong || normId.$oid || Date.now() + index;
                } else if (!normId) {
                    normId = Date.now() + index;
                }
                return {
                    ...item,
                    id: normId
                };
            });
            
            setGrnItems(normalizedItems);
        }
    }, [editGrn]);

    useEffect(() => {
        if (editGrn && vendors.length > 0 && editGrn.vendor_id) {
            const vendor = vendors.find(v => v.vendor_id === editGrn.vendor_id);
            if (vendor) {
                setFormData(prev => ({
                    ...prev,
                    supplier_address: vendor.addressLine1 || vendor.address_line_1 || '',
                    contact_person: vendor.contactPerson || vendor.contact_person || '',
                    phone: vendor.phone || ''
                }));
            }
        }
    }, [editGrn, vendors]);

    const fetchMasters = async () => {
        try {
            const [itemsRes, vendorsRes, deptsRes, groupsRes, catsRes, groupTypesRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/vendors/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-type-master/`)
            ]);
            if (itemsRes.success) setItems(itemsRes.data);
            if (vendorsRes.success) setVendors(vendorsRes.data);
            if (deptsRes.success) setDepartments(deptsRes.data);
            if (groupsRes.success) setGroups(groupsRes.data);
            if (catsRes.success) setCategories(catsRes.data);
            if (groupTypesRes.success) setGroupTypes(groupTypesRes.data);
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleVendorChange = (option) => {
        if (option) {
            const vendor = vendors.find(v => v.vendor_id === option.value);
            setFormData({
                ...formData,
                vendor_id: vendor.vendor_id,
                supplier_address: vendor.addressLine1 || vendor.address_line_1 || '',
                contact_person: vendor.contactPerson || vendor.contact_person || '',
                phone: vendor.phone || ''
            });
        } else {
            setFormData({
                ...formData,
                vendor_id: '',
                supplier_address: '',
                contact_person: '',
                phone: ''
            });
        }
    };

    const handleCurrentItemChange = (e) => {
        let { name, value } = e.target;
        
        const newCurrentItem = { ...currentItem, [name]: value };
        if (name === 'packing' || name === 'no_of_unit') {
            const p = parseFloat(newCurrentItem.packing) || 0;
            const n = parseFloat(newCurrentItem.no_of_unit) || 0;
            newCurrentItem.quantity = p * n;
        }
        setCurrentItem(newCurrentItem);
    };

    const handleItemSelect = (option) => {
        if (option) {
            const selectedItem = items.find(i => i.item_id === option.value);
            setCurrentItem({
                ...currentItem,
                item_id: selectedItem.item_id,
                name: selectedItem.itemName,
                hsn: selectedItem.hsn || ''
            });
        } else {
            setCurrentItem({ ...currentItem, item_id: '', name: '', hsn: '' });
        }
    };

    const currQty = parseFloat(currentItem.quantity) || 1;
    const currItemValue = parseFloat(currentItem.itemValue) || 0;
    const currPacking = parseFloat(currentItem.packing) || 1;
    const currTaxPercent = parseFloat(currentItem.tax) || 0;
    const currDiscountPercent = parseFloat(currentItem.purchaseDiscountPercent) || 0;

    const currUnitPrice = currQty ? currItemValue / currQty : 0;
    
    const currDiscountedAmt = currItemValue * (currDiscountPercent / 100);
    const netValueBeforeTax = currItemValue - currDiscountedAmt;
    const currTotalTax = netValueBeforeTax * (currTaxPercent / 100);
    
    const currCgstAmt = currTotalTax / 2;
    const currSgstAmt = currTotalTax / 2;
    
    const currPurchaseCost = netValueBeforeTax + currTotalTax;
    const currUnitCost = currQty ? currPurchaseCost / currQty : 0;

    const addItemToGrn = () => {
        if (!currentItem.item_id || !currQty || !currItemValue) {
            alert("Please fill required item details (Item, Quantity, Item Value)");
            return;
        }

        let formattedExpiry = "";
        if (currentItem.expMonth && currentItem.expYear) {
            const year = parseInt(currentItem.expYear);
            const month = parseInt(currentItem.expMonth);
            const lastDay = new Date(year, month, 0).getDate();
            formattedExpiry = `${year}-${currentItem.expMonth}-${lastDay.toString().padStart(2, '0')}`;
        }

        const newItem = {
            ...currentItem,
            id: Date.now(),
            expiry: formattedExpiry || currentItem.expiry,
            unitPrice: Number(currUnitPrice.toFixed(2)),
            cgstPercent: currTaxPercent / 2,
            sgstPercent: currTaxPercent / 2,
            cgstAmt: Number(currCgstAmt.toFixed(2)),
            sgstAmt: Number(currSgstAmt.toFixed(2)),
            discountedAmt: Number(currDiscountedAmt.toFixed(2)),
            itemValue: Number(currItemValue.toFixed(2)),
            purchaseCost: Number(currPurchaseCost.toFixed(2)),
            baseAmount: Number(currItemValue.toFixed(2)),
            purchaseDiscountPercent: currDiscountPercent
        };

        setGrnItems([...grnItems, newItem]);
        setCurrentItem({
            item_id: '', name: '', hsn: '', batch: '', 
            expMonth: '', expYear: '', expiry: '', 
            packing: 1, no_of_unit: 1, quantity: 1, free: 0, 
            itemValue: 0, tax: 0, purchaseDiscountPercent: 0, mrp: 0
        });
    };

    const removeItem = (id) => {
        setGrnItems(grnItems.filter(item => item.id !== id));
    };

    const totals = React.useMemo(() => {
        let taxable = 0;
        let nonTaxable = 0;
        let cgst = 0;
        let sgst = 0;
        let totalDiscount = 0;
        let taxOnFreeItems = 0;

        grnItems.forEach(item => {
            const baseValue = item.itemValue || 0;
            const taxPercent = parseFloat(item.tax) || 0;
            const discount = parseFloat(item.discountedAmt) || 0;
            
            const netValue = baseValue - discount;

            totalDiscount += discount;

            if (taxPercent > 0) {
                taxable += netValue;
                cgst += item.cgstAmt;
                sgst += item.sgstAmt;
            } else {
                nonTaxable += netValue;
            }

            const freeQty = parseFloat(item.free) || 0;
            if (freeQty > 0 && taxPercent > 0) {
                const freeBase = freeQty * (item.unitPrice || 0);
                taxOnFreeItems += (freeBase * taxPercent) / 100;
            }
        });

        const igst = parseFloat(formData.igst) || 0;
        const cess = parseFloat(formData.cess) || 0;
        const cst = parseFloat(formData.central_sales_tax) || 0;
        const transport = parseFloat(formData.courier_transport_charge) || 0;
        
        // NEW: Calculate true signed amount based on dropdown type
        const rawRoundAmount = Math.abs(parseFloat(formData.round_amount) || 0);
        const signedRoundAmount = formData.round_type === 'subtract' ? -rawRoundAmount : rawRoundAmount;
        
        let totalAmountObj = taxable + nonTaxable + cgst + sgst + igst + cess + cst + transport;
        
        const netInvoiceAmount = Number((totalAmountObj + signedRoundAmount).toFixed(2));

        return {
            taxable_amount: Number(taxable.toFixed(2)),
            non_taxable_amount: Number(nonTaxable.toFixed(2)),
            cgst: Number(cgst.toFixed(2)),
            sgst: Number(sgst.toFixed(2)),
            tax_on_free_items: Number(taxOnFreeItems.toFixed(2)),
            total_discount: Number(totalDiscount.toFixed(2)),
            total_amount: Number(totalAmountObj.toFixed(2)),
            round_amount: signedRoundAmount, // Export the properly signed amount to backend payload
            net_invoice_amount: netInvoiceAmount
        };
    }, [grnItems, formData.igst, formData.cess, formData.central_sales_tax, formData.courier_transport_charge, formData.round_amount, formData.round_type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (grnItems.length === 0) {
            alert("Please add at least one item to generate GRN");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                items: grnItems,
                // The totals export contains the true signed round_amount which safely overwrites formData.round_amount
                ...totals 
            };
            
            // Optional: Delete round_type since the backend doesn't expect it
            delete payload.round_type;

            if (editGrn) {
                let existingPayments = editGrn.payment_status;
                if (typeof existingPayments === 'string') {
                    try { existingPayments = JSON.parse(existingPayments); } catch(e) { existingPayments = []; }
                }

                const totalPaid = editGrn.total_amount_paid?.$numberDecimal || editGrn.total_amount_paid || 0;
                payload.total_amount_paid = totalPaid;
                
                let paymentArray = existingPayments || [];
                
                if (paymentArray.length > 0) {
                    const latestRecord = { ...paymentArray[paymentArray.length - 1] };
                    const newPending = totals.net_invoice_amount - parseFloat(totalPaid);
                    
                    latestRecord.pending_amount = newPending > 0 ? newPending : 0;
                    
                    if (newPending <= 0 && totalPaid > 0) {
                        latestRecord.status = "Paid";
                    } else if (totalPaid > 0) {
                        latestRecord.status = "Partially Paid";
                    } else {
                        latestRecord.status = "Not Paid";
                    }
                    
                    paymentArray[paymentArray.length - 1] = latestRecord;
                }
                
                payload.payment_status = paymentArray;
            }

            if (payload.due_date === '') payload.due_date = null;
            if (payload.invoice_date === '') payload.invoice_date = null;
            if (payload.date === '') payload.date = null;

            const method = editGrn ? 'PATCH' : 'POST';
            const endpoint = editGrn 
                ? `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${editGrn.grn_number}/`
                : `${getBaseUrl.replace(/\/$/, '')}/stores-grn/`;

            const response = await apiRequest(endpoint, method, payload);
            
            if (response.success) {
                alert(`GRN ${editGrn ? 'Updated' : 'Generated'} Successfully! GRN Number: ${response.data.grn_number}`);
                
                if (editGrn) {
                    navigate('/StoresGRNReport');
                    return;
                }
                setFormData({
                    ...formData,
                    invoice_no: '',
                    remarks: '',
                    round_type: 'add',
                    round_amount: 0 
                });
                setGrnItems([]);
            } else {
                alert("Error generating GRN: " + JSON.stringify(response.error));
            }
        } catch (error) {
            console.error("Error saving GRN:", error);
            alert("Error saving GRN");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItemMaster = async () => {
        if (!newItemMasterData.itemName || !newItemMasterData.department || !newItemMasterData.category || !newItemMasterData.group || !newItemMasterData.group_type || !newItemMasterData.stockReorderLevel) {
            alert("Please fill all required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`, 'POST', newItemMasterData);
            if (response.success) {
                alert("New Item Master Added Successfully!");
                setShowAddItemMasterModal(false);
                // Refresh items list
                fetchMasters();
                // Optionally auto-select the new item
                setCurrentItem(prev => ({
                    ...prev,
                    item_id: response.data.item_id,
                    name: response.data.itemName,
                    hsn: response.data.hsn || ''
                }));
                // Reset new item data
                setNewItemMasterData({
                    itemName: '',
                    department: '',
                    category: '',
                    group: '',
                    group_type: '',
                    hsn: '',
                    stockReorderLevel: '',
                    total_quantity: 0,
                    approved_quantity: 0
                });
            } else {
                alert("Error adding item: " + JSON.stringify(response.error));
            }
        } catch (error) {
            console.error("Error saving Item Master:", error);
            alert("Error saving Item Master");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1e3a8a',
                    borderRadius: 12,
                    colorLink: '#1e3a8a',
                    colorLinkHover: '#2563eb',
                },
                components: {
                    DatePicker: {
                        headerBg: '#1e3a8a',
                        colorTextHeading: '#ffffff',
                        colorIcon: '#ffffff',
                        colorIconHover: 'rgba(255, 255, 255, 0.8)',
                    }
                }
            }}
        >
            <CalendarGlobalStyles />
            <PageWrapper>
                <Container style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                {/* 1. Glass Header */}
                <GlassHeader>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                            {editGrn ? `Edit GRN: ${editGrn.grn_number}` : 'New GRN Generation'}
                        </h2>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: '500' }}>
                            {editGrn ? 'Update the Goods Receipt Note details below' : 'Streamline your inventory intake process'}
                        </p>
                    </div>
                    <Button 
                        secondary 
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', fontWeight: '600' }} 
                        onClick={() => navigate('/StoresGRNReport')}
                    >
                        ← Back to Report
                    </Button>
                </GlassHeader>

                {/* 2. Main Form Content */}
                <form onSubmit={handleSubmit} style={{ background: colors.background, padding: '24px' }}>
                    
                    {/* Purchase & Supplier Info Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '20px' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <FormCard>
                                <SectionTitleCard>
                                    <h3>Purchase Information</h3>
                                </SectionTitleCard>
                                <FormGrid>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                            <div>
                                                <Label required>Category</Label>
                                                <Select 
                                                    options={purchaseCategories} 
                                                    value={purchaseCategories.find(c => c.value === formData.purchase_category)} 
                                                    onChange={(opt) => handleInputChange({ target: { name: 'purchase_category', value: opt ? opt.value : '' } })} 
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div>
                                                <Label required>Vendor</Label>
                                                <Select 
                                                    options={vendors.map(v => ({ value: v.vendor_id, label: v.name }))} 
                                                    value={vendors.find(v => v.vendor_id === formData.vendor_id) ? { value: formData.vendor_id, label: vendors.find(v => v.vendor_id === formData.vendor_id).name } : null} 
                                                    onChange={handleVendorChange} 
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                             <div style={{ position: 'relative' }}>
                                                <Label required>GRN Date</Label>
                                                <DatePicker 
                                                    value={formData.date ? dayjs(formData.date) : null}
                                                    onChange={(d) => handleInputChange({ target: { name: 'date', value: d ? d.format('YYYY-MM-DD') : '' } })}
                                                    format="DD/MM/YYYY"
                                                    placeholder="Select Date"
                                                    allowClear={false}
                                                    disabled={isVerified}
                                                    style={{ width: '100%', borderRadius: '6px', border: `1px solid ${colors.border}`, height: '34px' }}
                                                />
                                                {formData.date && !isVerified && (
                                                    <span 
                                                        onClick={() => handleInputChange({ target: { name: 'date', value: '' } })} 
                                                        style={{ cursor: 'pointer', position: 'absolute', right: '8px', top: '28px', background: '#1e3a8a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                                    >✕</span>
                                                )}
                                             </div>

                                            <div><Label>Vendor ID</Label><Input value={formData.vendor_id} readOnly style={{ backgroundColor: '#f8fafc', fontWeight: '600' }} /></div>
                                        </div>
                                </FormGrid>
                            </FormCard>

                            <FormCard>
                                <SectionTitleCard $color="#6366f1">
                                    <h3>Invoice & Payment Details</h3>
                                </SectionTitleCard>
                                <FormGrid $minWidth="160px">
                                    <div><Label required>Invoice No</Label><Input placeholder="EX: INV-1001" name="invoice_no" value={formData.invoice_no} onChange={handleInputChange} disabled={isVerified} /></div>
                                    <div style={{ position: 'relative' }}>
                                        <Label required>Invoice Date</Label>
                                        <DatePicker 
                                            value={formData.invoice_date ? dayjs(formData.invoice_date) : null}
                                            onChange={(d) => handleInputChange({ target: { name: 'invoice_date', value: d ? d.format('YYYY-MM-DD') : '' } })}
                                            format="DD/MM/YYYY"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            disabled={isVerified}
                                            style={{ width: '100%', borderRadius: '6px', border: `1px solid ${colors.border}`, height: '34px' }}
                                        />
                                        {formData.invoice_date && !isVerified && (
                                            <span 
                                                onClick={() => handleInputChange({ target: { name: 'invoice_date', value: '' } })} 
                                                style={{ cursor: 'pointer', position: 'absolute', right: '8px', top: '28px', background: '#1e3a8a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                            >✕</span>
                                        )}
                                    </div>

                                    <div><Label>Credit (Days)</Label><Input type="number" name="credit_period" value={formData.credit_period} onChange={handleInputChange} disabled={isVerified} /></div>
                                            <div><Label>Payment Mode</Label>
                                                <Select 
                                                    options={paymentModes} 
                                                    value={paymentModes.find(m => m.value === formData.payment_mode)} 
                                                    onChange={(opt) => handleInputChange({ target: { name: 'payment_mode', value: opt ? opt.value : '' } })} 
                                                    menuPortalTarget={document.body}
                                                    isDisabled={isVerified}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                </FormGrid>
                            </FormCard>
                        </div>

                        <FormCard style={{ height: 'fit-content' }}>
                            <SectionTitleCard $color="#b45309">
                                <h3>Supplier Snapshot</h3>
                            </SectionTitleCard>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div><Label>Vendor ID</Label><Input value={formData.vendor_id} readOnly style={{ backgroundColor: '#f8fafc', fontWeight: '600' }} /></div>
                                <div><Label>Contact Person</Label><Input value={formData.contact_person} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                                <div><Label>Phone Number</Label><Input value={formData.phone} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                                <div><Label>Office Address</Label><Input value={formData.supplier_address} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                            </div>
                        </FormCard>
                    </div>

                    {/* 3. Items Management Section */}
                    <FormCard style={{ marginTop: '5px' }}>
                        <SectionTitleCard $bg="linear-gradient(to right, #f0fdfa, white)">
                            <h3>Items Collection ({grnItems.length})</h3>
                            <Button type="button" onClick={() => setShowAddItemModal(true)} disabled={isVerified} style={{ padding: '6px 16px', boxShadow: '0 4px 6px rgba(13, 148, 136, 0.2)', opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'not-allowed' : 'pointer' }}>
                                + Add Stock Item
                            </Button>
                        </SectionTitleCard>
                        
                        <ItemTableWrapper>
                            <Table>
                                <thead>
                                    <Tr style={{ background: `linear-gradient(90deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)` }}>
                                        {['Sl.No','Description','Batch','Packing','Qty','Free','Expiry','MRP','S.Rate','CGST%','CGST₹','SGST%','SGST₹','Total Value','Del'].map(h => (
                                            <Th key={h} style={{ 
                                                color: 'white', 
                                                background: 'transparent', 
                                                border: 'none', 
                                                padding: '12px 10px', 
                                                fontWeight: '700', 
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase'
                                            }}>{h}</Th>
                                        ))}
                                    </Tr>
                                </thead>
                                <tbody>
                                    {grnItems.map((item, index) => (
                                        <Tr key={item.id} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                                            <Td style={{ textAlign: 'center', width: '50px' }}>{index + 1}</Td>
                                            <Td style={{ fontWeight: '600', color: colors.primaryDark }}>{item.name}</Td>
                                            <Td>{item.batch || '-'}</Td>
                                            <Td>{item.packing}</Td>
                                            <Td style={{ textAlign: 'center', fontWeight: '500' }}>{item.quantity}</Td>
                                            <Td style={{ textAlign: 'center' }}>{item.free}</Td>
                                            <Td>{item.expiry || '-'}</Td>
                                            <Td style={{ textAlign: 'right', color: '#64748b' }}>₹{parseFloat(item.mrp || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '500' }}>₹{parseFloat(item.unitPrice || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'center' }}>{item.cgstPercent}%</Td>
                                            <Td style={{ textAlign: 'right' }}>₹{parseFloat(item.cgstAmt || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'center' }}>{item.sgstPercent}%</Td>
                                            <Td style={{ textAlign: 'right' }}>₹{parseFloat(item.sgstAmt || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.primary }}>₹{parseFloat(item.itemValue || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'center', width: '40px' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => !isVerified && removeItem(item.id)} 
                                                    disabled={isVerified}
                                                    style={{ color: colors.danger, background: 'none', border: 'none', cursor: isVerified ? 'not-allowed' : 'pointer', transition: 'transform 0.2s', opacity: isVerified ? 0.3 : 1 }}
                                                    onMouseOver={e => !isVerified && (e.currentTarget.style.transform = 'scale(1.2)')}
                                                    onMouseOut={e => !isVerified && (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>✕</span>
                                                </button>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {grnItems.length === 0 && (
                                        <Tr>
                                            <Td colSpan={15} style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                                                <div style={{ opacity: 0.5, marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '3rem' }}>📦</span>
                                                </div>
                                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>Your inventory bucket is empty</div>
                                                <div style={{ fontSize: '0.85rem' }}>Click "Add Stock Item" to populate this GRN</div>
                                            </Td>
                                        </Tr>
                                    )}
                                </tbody>
                            </Table>
                        </ItemTableWrapper>
                    </FormCard>

                    {/* 4. Financial Summary Grid */}
                    <SummaryGrid>
                        <StatsCard>
                            <SectionTitleCard $bg="transparent" style={{ padding: '0 0 10px 0', marginBottom: '8px' }}>
                                <h3>Total Calculations</h3>
                            </SectionTitleCard>
                            <SummaryRow>
                                <span className="label">Non Taxable Base</span>
                                <span className="value">₹{totals.non_taxable_amount.toFixed(2)}</span>
                            </SummaryRow>
                            <SummaryRow>
                                <span className="label">Taxable Base</span>
                                <span className="value">₹{totals.taxable_amount.toFixed(2)}</span>
                            </SummaryRow>
                            <SummaryRow>
                                <span className="label">Applied Discount</span>
                                <span className="value danger">- ₹{totals.total_discount.toFixed(2)}</span>
                            </SummaryRow>
                        </StatsCard>

                        <StatsCard>
                            <SectionTitleCard $bg="transparent" style={{ padding: '0 0 10px 0', marginBottom: '8px' }}>
                                <h3>Tax Component Breakdown</h3>
                            </SectionTitleCard>
                            <SummaryRow>
                                <span className="label">Total CGST (A)</span>
                                <span className="value">₹{totals.cgst.toFixed(2)}</span>
                            </SummaryRow>
                            <SummaryRow>
                                <span className="label">Total SGST (B)</span>
                                <span className="value">₹{totals.sgst.toFixed(2)}</span>
                            </SummaryRow>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                <div>
                                    <Label style={{ fontSize: '0.7rem' }}>IGST OFFSET</Label>
                                    <Input 
                                        type="number" 
                                        name="igst" 
                                        value={formData.igst} 
                                        onChange={handleInputChange} 
                                        style={{ padding: '4px 8px', fontSize: '0.85rem' }} 
                                    />
                                </div>
                                <div>
                                    <Label style={{ fontSize: '0.7rem' }}>CESS / OTHER</Label>
                                    <Input 
                                        type="number" 
                                        name="cess" 
                                        value={formData.cess} 
                                        onChange={handleInputChange} 
                                        style={{ padding: '4px 8px', fontSize: '0.85rem' }} 
                                    />
                                </div>
                            </div>
                        </StatsCard>

                        <NetPayableCard>
                            <span className="label">Final Invoice Value</span>
                            <span className="value">₹{totals.net_invoice_amount.toFixed(2)}</span>
                            
                            {/* UPDATED: Added Dropdown (+/-) to allow manual round off without sign typing */}
                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>MANUAL ROUND OFF:</span>
                                
                                <select 
                                    name="round_type" 
                                    value={formData.round_type} 
                                    onChange={handleInputChange} 
                                    disabled={isVerified}
                                    style={{ 
                                        padding: '4px', 
                                        fontSize: '0.85rem', 
                                        borderRadius: '6px', 
                                        border: '1px solid white', 
                                        color: 'black',
                                        background: 'white',
                                        cursor: isVerified ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="add">(+) Add</option>
                                    <option value="subtract">(-) Subtract</option>
                                </select>

                                <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0" // Prevent typing negative signs
                                    name="round_amount" 
                                    value={formData.round_amount} 
                                    onChange={handleInputChange} 
                                    disabled={isVerified}
                                    style={{ 
                                        width: '80px', 
                                        padding: '4px 8px', 
                                        fontSize: '0.85rem', 
                                        color: 'black', 
                                        borderRadius: '6px', 
                                        border: '1px solid white' 
                                    }} 
                                />
                            </div>
                        </NetPayableCard>
                    </SummaryGrid>

                    {/* Remarks & Completion */}
                    <FormCard style={{ marginBottom: 0 }}>
                        <div style={{ padding: '20px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1rem' }}>📝</span> Operational Internal Remarks
                            </Label>
                            <textarea 
                                name="remarks" 
                                value={formData.remarks} 
                                onChange={handleInputChange} 
                                disabled={isVerified}
                                placeholder={isVerified ? "Remarks are locked for verified GRNs" : "Add specific notes about this shipment, quality checks, or vendor comments..."} 
                                style={{ 
                                    width: '100%', 
                                    padding: '15px', 
                                    borderRadius: '8px', 
                                    border: `1px solid ${colors.border}`, 
                                    fontFamily: 'inherit',
                                    fontSize: '0.9rem',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    backgroundColor: isVerified ? '#f8fafc' : 'white'
                                }} 
                            />
                        </div>
                        <ActionFooter>
                            <Button 
                                type="button" 
                                secondary 
                                onClick={() => editGrn ? navigate('/StoresGRNReport') : setGrnItems([])}
                                style={{ padding: '10px 25px' }}
                            >
                                {editGrn ? 'Discard Changes' : 'Reset Form'}
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading || isVerified}
                                style={{ padding: '10px 40px', fontSize: '1rem', boxShadow: isVerified ? 'none' : `0 10px 15px -3px rgba(13, 148, 136, 0.3)`, opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Processing...' : (isVerified ? 'Record Verified (Read Only)' : (editGrn ? 'Update GRN Record' : 'Finalize & Post GRN'))}
                            </Button>
                        </ActionFooter>
                    </FormCard>
                </form>
            </Container>

            {/* 7. Enhanced Add Item Modal */}
            {showAddItemModal && (
                <ModalOverlay onClick={e => e.target === e.currentTarget && setShowAddItemModal(false)}>
                    <ModalContainerAnimated style={{ maxWidth: '850px', borderRadius: '16px' }}>
                        <ModalHeader style={{ background: colors.primary, color: 'white', padding: '20px 25px' }}>
                            <ModalTitle style={{ color: 'white' }}>Catalog Item Entry</ModalTitle>
                            <CloseButton style={{ color: 'white' }} onClick={() => setShowAddItemModal(false)}>✕</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ padding: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '25px' }}>
                                <div style={{ gridColumn: 'span 3' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <Label required style={{ margin: 0 }}>Search Catalog Item</Label>
                                        <span 
                                            onClick={() => setShowAddItemMasterModal(true)} 
                                            style={{ 
                                                color: colors.primary, 
                                                fontSize: '0.85rem', 
                                                fontWeight: '700', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                background: '#f0fdfa',
                                                border: `1px solid ${colors.primary}40`
                                            }}
                                        >
                                            ➕ Add New Item
                                        </span>
                                    </div>
                                    <Select 
                                        options={items.map(i => ({ value: i.item_id, label: i.itemName }))} 
                                        value={currentItem.item_id ? { value: currentItem.item_id, label: currentItem.name } : null} 
                                        onChange={handleItemSelect}
                                        placeholder="Type item name to search..."
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            control: (base) => ({
                                                ...base,
                                                padding: '5px',
                                                borderRadius: '10px',
                                                border: `1px solid ${colors.border}`
                                            })
                                        }}
                                    />
                                </div>
                                <div><Label>HSN Code</Label><Input value={currentItem.hsn} readOnly style={{ background: '#f8fafc' }} /></div>
                                <div><Label>Batch Number</Label><Input placeholder="EX: BT-001" name="batch" value={currentItem.batch} onChange={handleCurrentItemChange} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                    <div>
                                        <Label>Expiry Month</Label>
                                        <Select 
                                            options={months} 
                                            value={months.find(m => m.value === currentItem.expMonth)} 
                                            onChange={(opt) => handleCurrentItemChange({ target: { name: 'expMonth', value: opt ? opt.value : '' } })} 
                                            placeholder="MM"
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label>Expiry Year</Label>
                                        <Select 
                                            options={years} 
                                            value={years.find(y => y.value === currentItem.expYear)} 
                                            onChange={(opt) => handleCurrentItemChange({ target: { name: 'expYear', value: opt ? opt.value : '' } })} 
                                            placeholder="YYYY"
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px', padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                <div><Label>Packing (Units)</Label><Input type="number" name="packing" value={currentItem.packing} onChange={handleCurrentItemChange} /></div>
                                <div><Label>No. of Units</Label><Input type="number" name="no_of_unit" value={currentItem.no_of_unit} onChange={handleCurrentItemChange} /></div>
                                <div><Label>Total Qty</Label><Input type="number" value={currentItem.quantity} readOnly style={{ fontWeight: '700', color: colors.primaryDark, background: 'rgba(255,255,255,0.7)' }} /></div>
                                <div><Label>Free Units</Label><Input type="number" name="free" value={currentItem.free} onChange={handleCurrentItemChange} /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '10px', padding: '20px', background: '#fefce8', borderRadius: '12px', border: '1px solid #fef08a' }}>
                                <div><Label required>Base Value (Net)</Label><Input type="number" placeholder="0.00" name="itemValue" value={currentItem.itemValue} onChange={handleCurrentItemChange} style={{ fontWeight: '700' }} /></div>
                                <div><Label>MRP (Per Unit)</Label><Input type="number" placeholder="0.00" name="mrp" value={currentItem.mrp} onChange={handleCurrentItemChange} /></div>
                                <div>
                                    <Label>GST Bracket</Label>
                                    <Select 
                                        options={[{ value: 0, label: '0% (Exempt)' }, { value: 5, label: '5%' }, { value: 12, label: '12%' }, { value: 18, label: '18%' }, { value: 28, label: '28%' }]} 
                                        value={{ value: currentItem.tax, label: `${currentItem.tax}%` }} 
                                        onChange={(o) => handleCurrentItemChange({ target: { name: 'tax', value: o.value } })} 
                                        menuPlacement="top"
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </div>
                                <div><Label>Discount %</Label><Input type="number" placeholder="0%" name="purchaseDiscountPercent" value={currentItem.purchaseDiscountPercent} onChange={handleCurrentItemChange} /></div>
                            </div>
                            
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Unit Buying Cost</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>₹{currUnitCost.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Total Buying Cost</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: colors.primary }}>₹{currPurchaseCost.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button secondary onClick={() => setShowAddItemModal(false)} style={{ padding: '10px 25px' }}>Discard</Button>
                                    <Button onClick={() => { addItemToGrn(); setShowAddItemModal(false); }} style={{ padding: '10px 30px', fontWeight: '700', boxShadow: `0 4px 6px rgba(13, 148, 136, 0.2)` }}>Add to Grn</Button>
                                </div>
                            </div>
                        </ModalBody>
                    </ModalContainerAnimated>
                </ModalOverlay>
            )}
            {/* 8. Add New Item Master Modal */}
            {showAddItemMasterModal && (
                <ModalOverlay onClick={e => e.target === e.currentTarget && setShowAddItemMasterModal(false)} style={{ zIndex: 10000 }}>
                    <ModalContainerAnimated style={{ maxWidth: '900px', borderRadius: '16px' }}>
                        <ModalHeader style={{ background: colors.primary, color: 'white', padding: '15px 25px' }}>
                            <ModalTitle style={{ color: 'white' }}>Add New Item Master</ModalTitle>
                            <CloseButton style={{ color: 'white' }} onClick={() => setShowAddItemMasterModal(false)}>✕</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ padding: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ gridColumn: 'span 1' }}>
                                    <Label required>Item Name</Label>
                                    <Input 
                                        placeholder="Item Name" 
                                        value={newItemMasterData.itemName} 
                                        onChange={(e) => setNewItemMasterData({ ...newItemMasterData, itemName: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <Label required>Department</Label>
                                    <Select 
                                        options={departments.map(d => ({ value: d.department_id, label: d.department_name }))} 
                                        placeholder="Select Department"
                                        value={departments.find(d => d.department_id === newItemMasterData.department) ? { value: newItemMasterData.department, label: departments.find(d => d.department_id === newItemMasterData.department).department_name } : null}
                                        onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, department: opt ? opt.value : '' })}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                    />
                                </div>
                                <div>
                                    <Label required>Category</Label>
                                    <Select 
                                        options={categories.map(c => ({ value: c.category_id, label: c.category_name }))} 
                                        placeholder="Select Category"
                                        value={categories.find(c => c.category_id === newItemMasterData.category) ? { value: newItemMasterData.category, label: categories.find(c => c.category_id === newItemMasterData.category).category_name } : null}
                                        onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, category: opt ? opt.value : '' })}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                    />
                                </div>
                                <div>
                                    <Label required>Group</Label>
                                    <Select 
                                        options={groups.map(g => ({ value: g.group_id, label: g.group_name }))} 
                                        placeholder="Select Group"
                                        value={groups.find(g => g.group_id === newItemMasterData.group) ? { value: newItemMasterData.group, label: groups.find(g => g.group_id === newItemMasterData.group).group_name } : null}
                                        onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, group: opt ? opt.value : '' })}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                    />
                                </div>
                                <div>
                                    <Label required>Group Type</Label>
                                    <Select 
                                        options={groupTypes.map(gt => ({ value: gt.group_type_id, label: gt.group_type_name }))} 
                                        placeholder="Select Group Type"
                                        value={groupTypes.find(gt => gt.group_type_id === newItemMasterData.group_type) ? { value: newItemMasterData.group_type, label: groupTypes.find(gt => gt.group_type_id === newItemMasterData.group_type).group_type_name } : null}
                                        onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, group_type: opt ? opt.value : '' })}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                    />
                                </div>
                                <div>
                                    <Label>HSN</Label>
                                    <Input 
                                        placeholder="HSN" 
                                        value={newItemMasterData.hsn} 
                                        onChange={(e) => setNewItemMasterData({ ...newItemMasterData, hsn: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <Label required>Stock Reorder Level</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Stock Reorder Level" 
                                        value={newItemMasterData.stockReorderLevel} 
                                        onChange={(e) => setNewItemMasterData({ ...newItemMasterData, stockReorderLevel: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <Label>Total Quantity</Label>
                                    <Input value={newItemMasterData.total_quantity} readOnly style={{ background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <Label>Approved Quantity</Label>
                                    <Input value={newItemMasterData.approved_quantity} readOnly style={{ background: '#f8fafc' }} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                                <Button onClick={handleSaveItemMaster} disabled={loading} style={{ background: colors.primary, color: 'white', padding: '10px 30px', minWidth: '120px' }}>
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                                <Button secondary onClick={() => setShowAddItemMasterModal(false)} style={{ background: '#64748b', color: 'white', padding: '10px 30px', minWidth: '120px' }}>
                                    Cancel
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContainerAnimated>
                </ModalOverlay>
            )}
            </PageWrapper>
        </ConfigProvider>
    );
};

export default StoresGRNGeneration;