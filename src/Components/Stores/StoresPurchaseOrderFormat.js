import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import ReactSelect from 'react-select';
import { 
    FileText, Plus, Search, Calendar, RefreshCw, Printer, 
    CheckCircle, X, Download, Trash2, Building2, ShoppingBag, Eye, MapPin, CreditCard, Hash
} from 'lucide-react';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    Input,
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors
} from '../GlobalStyles';
import { PO_LOGO_BASE64, PO_SIGN_BASE64 } from './poAssets';

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '38px',
        height: '38px',
        borderRadius: '8px',
        borderColor: state.isFocused ? colors.primary : '#c0dbff',
        boxShadow: state.isFocused ? `0 0 0 1px ${colors.primary}` : 'none',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        '&:hover': {
            borderColor: colors.primary
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '38px',
        padding: '0 8px'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        fontSize: '0.85rem'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '38px'
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        fontSize: '0.85rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? colors.primary
            : state.isFocused
            ? '#e6fffa'
            : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.85rem',
        padding: '8px 12px'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#94a3b8',
        fontSize: '0.85rem'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1e293b',
        fontSize: '0.85rem'
    })
};

const DEFAULT_SHIPPING_ADDRESS = `M/s. SHANMUGA HOSPITAL LTD,
Reg. Off.: 51/24, SHANMUGA HOSPITAL BUILDING,
SARADHA COLLEGE ROAD, SALEM – 636007.
GSTIN: 33ABDCS8326A1ZP
STATE: TAMILNADU STATE CODE: 33
CONTACT: 63745 99385.`;

const DEFAULT_BILLING_ADDRESS = `SHANMUGA MEDICAL RESEARCH FOUNDATION TRUST
FLAT NO: 2, SARADHA COLLEGE ROAD,
SALEM – 636007.
GSTIN: 33AACTS1080N2ZC`;

const DEFAULT_PAYMENT_TERMS = '50% Advance with PO and remaining 50% will be done after dispatch';
const DEFAULT_TERMS = `1. Goods must be strictly according to specifications.\n2. Invoices must mention this PO number.\n3. Damaged goods will be rejected and returned.`;

const StoresPurchaseOrderFormat = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [poList, setPoList] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [itemsMaster, setItemsMaster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewPo, setPreviewPo] = useState(null);

    // New PO Form state
    const [formData, setFormData] = useState({
        vendor_id: '',
        vendor_name: '',
        po_date: today,
        expected_delivery_date: dayjs().add(7, 'day').format('YYYY-MM-DD'),
        quotation_ref_no: '',
        subject: '',
        payment_terms: DEFAULT_PAYMENT_TERMS,
        shipping_address: DEFAULT_SHIPPING_ADDRESS,
        billing_address: DEFAULT_BILLING_ADDRESS,
        terms_and_conditions: DEFAULT_TERMS,
        items: [],
        remarks: ''
    });

    // Item line item in modal
    const [selectedItem, setSelectedItem] = useState('');
    const [itemQty, setItemQty] = useState(1);
    const [itemRate, setItemRate] = useState(0);
    const [itemGst, setItemGst] = useState(18);
    const [itemDiscount, setItemDiscount] = useState(0);

    useEffect(() => {
        fetchVendors();
        fetchItemsMaster();
        fetchPOs();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`);
            if (res && res.success) {
                const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
                setVendors(list);
            }
        } catch (err) {
            console.error("Error fetching vendors:", err);
        }
    };

    const fetchItemsMaster = async () => {
        try {
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`);
            if (res && res.success && res.data) {
                setItemsMaster(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("Error fetching item master:", err);
        }
    };

    const fetchPOs = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor) query.push(`vendor_id=${selectedVendor}`);
            if (statusFilter) query.push(`status=${statusFilter}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-purchase-orders/${queryString}`);
            if (res && res.success && res.data) {
                setPoList(res.data.data || []);
                setTotalAmount(res.data.total_amount || 0);
            } else {
                setPoList([]);
            }
        } catch (err) {
            console.error("Error fetching POs:", err);
            setPoList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItemLine = () => {
        if (!selectedItem) return;
        const itmObj = itemsMaster.find(i => i.item_id === selectedItem);
        if (!itmObj) return;

        const rate = parseFloat(itemRate) || parseFloat(itmObj.unit_price) || 0;
        const qty = parseFloat(itemQty) || 1;
        const disc = parseFloat(itemDiscount) || 0;
        const gst = parseFloat(itemGst) || 0;

        const lineSubtotal = qty * rate;
        const lineDiscVal = (lineSubtotal * disc) / 100;
        const taxableVal = lineSubtotal - lineDiscVal;
        const gstVal = (taxableVal * gst) / 100;
        const lineTotal = taxableVal + gstVal;

        const newItem = {
            item_id: itmObj.item_id,
            itemName: itmObj.itemName,
            hsn: itmObj.hsn || '',
            quantity: qty,
            rate: rate,
            discount_percent: disc,
            gst_percent: gst,
            taxable_amount: round(taxableVal),
            tax_amount: round(gstVal),
            total_amount: round(lineTotal)
        };

        const updatedItems = [...formData.items, newItem];
        const autoSubject = updatedItems.map(it => `${it.itemName} (Qty: ${it.quantity})`).join(', ');

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            subject: prev.subject ? prev.subject : autoSubject
        }));

        setSelectedItem('');
        setItemQty(1);
        setItemRate(0);
        setItemDiscount(0);
    };

    const handleRemoveItemLine = (idx) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx)
        }));
    };

    const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const calcTotals = () => {
        let subtotal = 0;
        let tax = 0;
        let disc = 0;
        let total = 0;

        formData.items.forEach(it => {
            subtotal += (it.quantity * it.rate);
            const dVal = (it.quantity * it.rate * it.discount_percent) / 100;
            disc += dVal;
            tax += it.tax_amount;
            total += it.total_amount;
        });

        return {
            subtotal: round(subtotal),
            discount_amount: round(disc),
            tax_amount: round(tax),
            total_amount: round(total)
        };
    };

    const handleCreatePo = async (e) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            alert("Please add at least one item to the Purchase Order.");
            return;
        }

        const totals = calcTotals();
        const payload = {
            ...formData,
            ...totals
        };

        try {
            setLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-purchase-orders/`, 'POST', payload);
            if (res && res.success) {
                alert("Purchase Order created successfully!");
                setShowCreateModal(false);
                setFormData({
                    vendor_id: '',
                    vendor_name: '',
                    po_date: today,
                    expected_delivery_date: dayjs().add(7, 'day').format('YYYY-MM-DD'),
                    quotation_ref_no: '',
                    subject: '',
                    payment_terms: DEFAULT_PAYMENT_TERMS,
                    shipping_address: DEFAULT_SHIPPING_ADDRESS,
                    billing_address: DEFAULT_BILLING_ADDRESS,
                    terms_and_conditions: DEFAULT_TERMS,
                    items: [],
                    remarks: ''
                });
                fetchPOs();
            } else {
                alert(res.error || "Failed to create Purchase Order.");
            }
        } catch (err) {
            console.error("Error creating PO:", err);
            alert("Error creating Purchase Order.");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!poList || poList.length === 0) return;
        const excelData = poList.map(po => ({
            'PO Number': po.po_number,
            'PO Date': po.po_date,
            'Vendor ID': po.vendor_id,
            'Vendor Name': po.vendor_name,
            'Quotation Ref': po.quotation_ref_no || '',
            'Payment Terms': po.payment_terms,
            'Delivery Date': po.expected_delivery_date,
            'Items Count': (po.items || []).length,
            'Subtotal (₹)': po.subtotal,
            'Tax (₹)': po.tax_amount,
            'Total Amount (₹)': po.total_amount,
            'Status': po.status
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PurchaseOrders");
        XLSX.writeFile(wb, `Stores_Purchase_Orders_${today}.xlsx`);
    };

    const parsePoItems = (items) => {
        if (!items) return [];
        if (Array.isArray(items)) return items;
        if (typeof items === 'string') {
            try {
                return JSON.parse(items);
            } catch (e) {
                try {
                    const cleaned = items.replace(/OrderedDict\(/g, '').replace(/\)/g, '').replace(/'/g, '"');
                    return JSON.parse(cleaned);
                } catch (e2) {
                    return [];
                }
            }
        }
        return [];
    };

    const numberToWords = (num) => {
        if (num === null || num === undefined || isNaN(num)) return 'Zero Only';
        num = Math.round(Number(num));
        if (num === 0) return 'Rupees Zero Only';

        const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const formatTenth = (n) => {
            if (n < 10) return single[n];
            if (n >= 10 && n < 20) return double[n - 10];
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
        };

        const formatHundred = (n) => {
            if (n > 99) {
                const h = single[Math.floor(n / 100)] + ' Hundred';
                const rem = n % 100;
                return rem !== 0 ? h + ' and ' + formatTenth(rem) : h;
            }
            return formatTenth(n);
        };

        let words = '';
        if (num >= 10000000) { words += formatHundred(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
        if (num >= 100000) { words += formatHundred(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
        if (num >= 1000) { words += formatHundred(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
        if (num > 0) words += formatHundred(num);
        return 'Rupees ' + words.trim() + ' Only';
    };

    const formatVendorAddress = (vendorObj) => {
        if (!vendorObj) return ['Registered Supplier Address'];
        const lines = [];
        if (vendorObj.address_line1) lines.push(vendorObj.address_line1);
        if (vendorObj.address_line2) lines.push(vendorObj.address_line2);
        if (vendorObj.address && !vendorObj.address_line1) lines.push(vendorObj.address);
        
        const cityStatePin = [
            vendorObj.city,
            vendorObj.state ? `${vendorObj.state}${vendorObj.pincode ? ` - ${vendorObj.pincode}` : ''}` : vendorObj.pincode
        ].filter(Boolean).join(', ');
        
        if (cityStatePin) lines.push(cityStatePin);
        if (lines.length === 0) lines.push('Registered Supplier Address');
        return lines;
    };

    const handlePrintPo = (po) => {
        if (!po) return;
        const items = parsePoItems(po.items);
        const subtotal = parseFloat(po.subtotal || 0);
        const discount = parseFloat(po.discount_amount || 0);
        const taxAmount = parseFloat(po.tax_amount || 0);
        const cgst = taxAmount / 2;
        const sgst = taxAmount / 2;
        const totalAmount = parseFloat(po.total_amount || (subtotal - discount + taxAmount));
        const words = numberToWords(totalAmount);

        const vendorObj = vendors.find(v => v.vendor_id === po.vendor_id) || {};
        const vendorAddressLines = formatVendorAddress(vendorObj);
        const vendorGst = vendorObj.gstin || vendorObj.gst_number || po.vendor_gstin || '';
        const vendorPhone = vendorObj.phone || vendorObj.mobile || vendorObj.contact_no || '';

        const autoSubject = items.map(it => `${it.itemName || it.item_id}${it.quantity ? ' Qty : ' + it.quantity : ''}`).join(' & ');
        const displaySubject = po.subject || autoSubject || 'Hospital Consumables / Store Supplies';

        const itemsRowsHtml = items.map((it, idx) => {
            const qty = parseFloat(it.quantity || 0);
            const rate = parseFloat(it.rate || it.unit_price || 0);
            const discPct = parseFloat(it.discount_percent || 0);
            const gstPct = parseFloat(it.gst_percent || 0);
            const lineTaxable = it.taxable_amount ? parseFloat(it.taxable_amount) : (qty * rate * (1 - discPct / 100));
            const lineTax = it.tax_amount ? parseFloat(it.tax_amount) : (lineTaxable * gstPct / 100);
            const lineTotal = it.total_amount ? parseFloat(it.total_amount) : (lineTaxable + lineTax);

            return `
                <tr>
                    <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
                    <td>
                        <div style="font-weight: 700; color: #0f172a; font-size: 11.5px;">${it.itemName || it.item_id}</div>
                        <div style="font-size: 9.5px; color: #64748b;">Code: ${it.item_id || '-'}</div>
                    </td>
                    <td style="text-align: center; font-family: monospace; font-size: 10.5px;">${it.hsn || '-'}</td>
                    <td style="text-align: right; font-weight: 700;">${qty}</td>
                    <td style="text-align: right;">₹${rate.toFixed(2)}</td>
                    <td style="text-align: right;">${discPct > 0 ? `${discPct}%` : '-'}</td>
                    <td style="text-align: right; font-weight: 600;">₹${lineTaxable.toFixed(2)}</td>
                    <td style="text-align: right;">${gstPct}% <span style="font-size: 9.5px; color: #64748b;">(₹${lineTax.toFixed(2)})</span></td>
                    <td style="text-align: right; font-weight: 800; color: #0f172a;">₹${lineTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank', 'width=950,height=850');
        if (!printWindow) {
            alert("Please allow popups to print the Purchase Order.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Purchase_Order_${po.po_number || 'Official'}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm 12mm 12mm;
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #0f172a;
                        background: #fff;
                        font-size: 11.5px;
                        line-height: 1.4;
                    }
                    .po-container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 12px 16px;
                    }
                    .header-table {
                        width: 100%;
                        border-collapse: collapse;
                        border-bottom: 2px solid #0f766e;
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                    }
                    .header-logo-cell {
                        text-align: left;
                        vertical-align: middle;
                        width: 50%;
                    }
                    .header-logo-cell img {
                        height: 58px;
                        max-width: 250px;
                        object-fit: contain;
                    }
                    .header-title-cell {
                        text-align: right;
                        vertical-align: middle;
                        width: 50%;
                    }
                    .dept-title {
                        font-size: 15px;
                        font-weight: 800;
                        color: #1e3a8a;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    }
                    .po-title {
                        font-size: 14px;
                        font-weight: 800;
                        color: #0f766e;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                    }
                    .metadata-strip {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 12px;
                        font-weight: 700;
                        color: #0f172a;
                        margin: 10px 0 14px 0;
                    }
                    .vendor-block {
                        margin-bottom: 12px;
                        font-size: 11.5px;
                        line-height: 1.5;
                    }
                    .vendor-to {
                        font-weight: 800;
                        color: #0f172a;
                        margin-bottom: 2px;
                    }
                    .vendor-details {
                        padding-left: 28px;
                    }
                    .vendor-name {
                        font-weight: 800;
                        color: #0f172a;
                        font-size: 12px;
                        text-transform: uppercase;
                    }
                    .subject-strip {
                        margin: 14px 0 10px 0;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .subject-label {
                        font-weight: 800;
                        color: #0f172a;
                        text-decoration: underline;
                    }
                    .subject-text {
                        font-weight: 700;
                        color: #1e293b;
                        margin-left: 4px;
                    }
                    .ref-paragraph {
                        margin: 10px 0 14px 0;
                        font-size: 11.5px;
                        line-height: 1.6;
                        color: #1e293b;
                        text-align: justify;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    .items-table th {
                        background: #f1f5f9;
                        color: #0f172a;
                        padding: 7px 8px;
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border: 1px solid #cbd5e1;
                    }
                    .items-table td {
                        padding: 6px 8px;
                        font-size: 10.5px;
                        border: 1px solid #cbd5e1;
                        vertical-align: middle;
                    }
                    .items-table tr:nth-child(even) {
                        background: #fafafa;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: 1.4fr 1fr;
                        border: 1px solid #cbd5e1;
                        border-top: none;
                        background: #ffffff;
                    }
                    .words-box {
                        padding: 10px 14px;
                        border-right: 1px solid #cbd5e1;
                        font-size: 10.5px;
                        background: #fafafa;
                    }
                    .totals-box {
                        padding: 10px 14px;
                        background: #ffffff;
                        font-size: 11px;
                    }
                    .calc-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 3px;
                    }
                    .calc-row.grand-total {
                        border-top: 1.5px solid #0f766e;
                        margin-top: 5px;
                        padding-top: 5px;
                        font-size: 12.5px;
                        font-weight: 900;
                        color: #0f766e;
                    }
                    .payment-terms-box {
                        margin: 12px 0 6px 0;
                        font-size: 11.5px;
                        line-height: 1.5;
                        color: #0f172a;
                    }
                    .signatory-section {
                        display: flex;
                        justify-content: flex-end;
                        margin: 16px 0 18px 0;
                        padding-right: 15px;
                    }
                    .signatory-box {
                        text-align: center;
                        min-width: 190px;
                    }
                    .signatory-box img {
                        max-height: 55px;
                        max-width: 150px;
                        object-fit: contain;
                        display: block;
                        margin: 0 auto 3px auto;
                    }
                    .signatory-label {
                        font-weight: 800;
                        font-size: 11.5px;
                        color: #0f172a;
                        border-top: 1px solid #334155;
                        padding-top: 4px;
                    }
                    .address-table {
                        width: 100%;
                        border: 1.5px solid #0f172a;
                        border-collapse: collapse;
                        margin-top: 14px;
                        font-size: 10px;
                        line-height: 1.45;
                    }
                    .address-table td {
                        padding: 8px 12px;
                        vertical-align: top;
                    }
                    .address-col-left {
                        width: 50%;
                        border-right: 1.5px solid #0f172a;
                    }
                    .address-header {
                        font-weight: 800;
                        text-decoration: underline;
                        margin-bottom: 4px;
                        color: #0f172a;
                        font-size: 10.5px;
                    }
                    .footer-section {
                        margin-top: 18px;
                        padding-top: 8px;
                        border-top: 1.5px solid #0f766e;
                        font-size: 9.5px;
                        color: #334155;
                        line-height: 1.35;
                    }
                    .footer-top-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-weight: 800;
                        color: #0f766e;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="po-container">
                    <!-- Top Letterhead Header -->
                    <table class="header-table">
                        <tr>
                            <td class="header-logo-cell">
                                <img src="${PO_LOGO_BASE64}" alt="Shanmuga Hospital Logo" />
                            </td>
                            <td class="header-title-cell">
                                <div class="dept-title">PURCHASE DEPARTMENT</div>
                                <div class="po-title">PURCHASE ORDER</div>
                            </td>
                        </tr>
                    </table>

                    <!-- PO NO & DATE Strip -->
                    <div class="metadata-strip">
                        <div>PO NO: <strong>${po.po_number || 'PENDING'}</strong></div>
                        <div>DATE: <strong>${po.po_date || today}</strong></div>
                    </div>

                    <!-- Vendor Details -->
                    <div class="vendor-block">
                        <div class="vendor-to">TO,</div>
                        <div class="vendor-details">
                            <div class="vendor-name">${po.vendor_name || po.vendor_id || 'SUPPLIER'}</div>
                            ${vendorAddressLines.map(line => `<div>${line}</div>`).join('')}
                            ${vendorGst ? `<div><strong>GSTIN:</strong> ${vendorGst}</div>` : ''}
                            ${vendorPhone ? `<div><strong>Phone:</strong> ${vendorPhone}</div>` : ''}
                        </div>
                    </div>

                    <!-- Subject Line -->
                    <div class="subject-strip">
                        <span class="subject-label">SUB: PURCHASE  ORDER  FOR;</span>
                        <div class="subject-text" style="padding-left: 28px; margin-top: 2px;">
                            ${displaySubject}
                        </div>
                    </div>

                    <!-- Quotation Reference Paragraph -->
                    <div class="ref-paragraph">
                        With reference to your revised Proforma Invoice no <strong>${po.quotation_ref_no || po.po_number || 'N/A'}</strong>, after discussion and acceptance of the quote rate as <strong>Rs.${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/- (Including tax)</strong>, we are raising purchase order for with the mentioned specifications which you have mentioned in quotation.
                    </div>

                    <!-- Items Table -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 30px; text-align: center;">#</th>
                                <th style="text-align: left;">Item Description & Specifications</th>
                                <th style="width: 75px; text-align: center;">HSN</th>
                                <th style="width: 45px; text-align: right;">Qty</th>
                                <th style="width: 75px; text-align: right;">Rate (₹)</th>
                                <th style="width: 45px; text-align: right;">Disc %</th>
                                <th style="width: 80px; text-align: right;">Taxable (₹)</th>
                                <th style="width: 85px; text-align: right;">GST Rate</th>
                                <th style="width: 90px; text-align: right;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml || '<tr><td colspan="9" style="text-align:center; padding:12px;">No item rows</td></tr>'}
                        </tbody>
                    </table>

                    <!-- Totals & Words -->
                    <div class="summary-grid">
                        <div class="words-box">
                            <div style="font-weight: 700; color: #0f766e; text-transform: uppercase; margin-bottom: 2px; font-size: 9.5px;">Amount in Words:</div>
                            <div style="font-weight: 800; color: #0f172a; font-style: italic;">${words}</div>
                            ${po.terms_and_conditions ? `
                                <div style="margin-top: 8px; font-size: 9.5px; color: #475569;">
                                    <strong>Terms & Conditions:</strong>
                                    <div style="white-space: pre-line; line-height: 1.35;">${po.terms_and_conditions}</div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="totals-box">
                            <div class="calc-row">
                                <span style="color: #64748b;">Subtotal:</span>
                                <span style="font-weight: 600;">₹${subtotal.toFixed(2)}</span>
                            </div>
                            ${discount > 0 ? `
                                <div class="calc-row" style="color: #dc2626;">
                                    <span>Discount:</span>
                                    <span>- ₹${discount.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div class="calc-row">
                                <span style="color: #64748b;">Taxable Value:</span>
                                <span style="font-weight: 600;">₹${(subtotal - discount).toFixed(2)}</span>
                            </div>
                            <div class="calc-row" style="color: #475569;">
                                <span>CGST:</span>
                                <span>₹${cgst.toFixed(2)}</span>
                            </div>
                            <div class="calc-row" style="color: #475569;">
                                <span>SGST:</span>
                                <span>₹${sgst.toFixed(2)}</span>
                            </div>
                            <div class="calc-row grand-total">
                                <span>NET TOTAL:</span>
                                <span>₹${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Terms -->
                    <div class="payment-terms-box">
                        <strong>Payment terms:</strong> ${po.payment_terms || DEFAULT_PAYMENT_TERMS}
                    </div>

                    <!-- Authorized Signatory -->
                    <div class="signatory-section">
                        <div class="signatory-box">
                            <img src="${PO_SIGN_BASE64}" alt="Authorized Signatory" />
                            <div class="signatory-label">Authorized Signatory</div>
                        </div>
                    </div>

                    <!-- Two-column Box for Shipping & Billing Address -->
                    <table class="address-table">
                        <tr>
                            <td class="address-col-left">
                                <div class="address-header">SHIPPING ADDRESS:</div>
                                <div style="white-space: pre-line;">${po.shipping_address || DEFAULT_SHIPPING_ADDRESS}</div>
                            </td>
                            <td>
                                <div class="address-header">BILLING ADDRESS:</div>
                                <div style="white-space: pre-line;">${po.billing_address || DEFAULT_BILLING_ADDRESS}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Official Footer -->
                    <div class="footer-section">
                        <div class="footer-top-row">
                            <span>SHANMUGA HOSPITAL LTD</span>
                            <span>https://shanmugahospital.com/</span>
                        </div>
                        <div>51/24, Saradha College Road, Salem – 636007.</div>
                        <div>PH: 0427-2706630 / 8248456660 &nbsp;|&nbsp; Email: purchase@smrft.org</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingBag size={28} color={colors.primary} /> Stores Purchase Order (PO) Format
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Create, manage, and print official Stores Purchase Orders standardized with hospital letterhead.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={() => setShowCreateModal(true)}
                            style={{ background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >
                            <Plus size={18} /> New Purchase Order
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>From Date</label>
                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>To Date</label>
                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: '190px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Supplier / Vendor</label>
                        <ReactSelect
                            options={[
                                { value: '', label: 'All Suppliers' },
                                ...vendors.map(v => ({ value: v.vendor_id, label: `${v.name} (${v.vendor_id})` }))
                            ]}
                            value={[
                                { value: '', label: 'All Suppliers' },
                                ...vendors.map(v => ({ value: v.vendor_id, label: `${v.name} (${v.vendor_id})` }))
                            ].find(opt => opt.value === selectedVendor) || { value: '', label: 'All Suppliers' }}
                            onChange={opt => setSelectedVendor(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                            isSearchable
                            placeholder="Search Supplier..."
                        />
                    </div>
                    <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Status</label>
                        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Statuses</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="SENT">SENT</option>
                            <option value="RECEIVED">RECEIVED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </Select>
                    </div>
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search PO / Vendor</label>
                        <Input 
                            type="text" 
                            placeholder="PO No, Vendor Name..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchPOs} style={{ background: colors.primary, color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSelectedVendor(''); setStatusFilter(''); setSearchTerm(''); setTimeout(fetchPOs, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PURCHASE ORDERS</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: colors.primary, marginTop: '4px' }}>{poList.length}</div>
                        </div>
                        <FileText size={32} color={colors.primary} opacity={0.3} />
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PO VALUE</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <CheckCircle size={32} color="#059669" opacity={0.3} />
                    </div>
                </div>

                {/* PO Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>PO Number</Th>
                                <Th>PO Date</Th>
                                <Th>Vendor / Supplier</Th>
                                <Th>Quotation Ref</Th>
                                <Th>Delivery Date</Th>
                                <Th>Items</Th>
                                <Th style={{ textAlign: 'right' }}>Total Amount</Th>
                                <Th>Status</Th>
                                <Th style={{ textAlign: 'center' }}>Actions</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Loading Purchase Orders...</p>
                                    </Td>
                                </Tr>
                            ) : poList.length === 0 ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No purchase orders found matching the filter criteria.
                                    </Td>
                                </Tr>
                            ) : (
                                poList.map(po => (
                                    <Tr key={po.po_number}>
                                        <Td style={{ fontWeight: '700', color: colors.primary }}>{po.po_number}</Td>
                                        <Td>{po.po_date}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '600' }}>{po.vendor_name || po.vendor_id}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {po.vendor_id}</div>
                                        </Td>
                                        <Td>
                                            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>
                                                {po.quotation_ref_no || '-'}
                                            </span>
                                        </Td>
                                        <Td>{po.expected_delivery_date || 'N/A'}</Td>
                                        <Td>{(po.items || []).length} items</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                                            ₹{parseFloat(po.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                background: po.status === 'RECEIVED' ? '#ecfdf5' : (po.status === 'APPROVED' ? '#eff6ff' : '#fef3c7'),
                                                color: po.status === 'RECEIVED' ? '#059669' : (po.status === 'APPROVED' ? '#2563eb' : '#d97706')
                                            }}>
                                                {po.status || 'APPROVED'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <Button 
                                                    onClick={() => setPreviewPo(po)}
                                                    style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Preview Hospital Format PO"
                                                >
                                                    <Eye size={14} /> View
                                                </Button>
                                                <Button 
                                                    onClick={() => handlePrintPo(po)}
                                                    style={{ padding: '6px 10px', background: colors.primary, color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Print Official Template"
                                                >
                                                    <Printer size={14} /> Print
                                                </Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>

                {/* Create PO Modal */}
                {showCreateModal && (
                    <ModalOverlay style={{ zIndex: 1050 }}>
                        <ModalContainer style={{ maxWidth: '1050px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShoppingBag size={20} color={colors.primary} /> Create Purchase Order (Official Hospital Format)
                                </ModalTitle>
                                <CloseButton onClick={() => setShowCreateModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '24px', overflowY: 'auto' }}>
                                <form onSubmit={handleCreatePo}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Select Supplier / Vendor *</label>
                                            <ReactSelect 
                                                options={vendors.map(v => ({ value: v.vendor_id, label: `${v.name} (${v.vendor_id})` }))}
                                                value={vendors.map(v => ({ value: v.vendor_id, label: `${v.name} (${v.vendor_id})` })).find(opt => opt.value === formData.vendor_id) || null}
                                                onChange={opt => {
                                                    const vId = opt ? opt.value : '';
                                                    const v = vendors.find(vend => vend.vendor_id === vId);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        vendor_id: vId,
                                                        vendor_name: v ? v.name : '',
                                                        payment_terms: (v && v.payment_terms) ? v.payment_terms : prev.payment_terms
                                                    }));
                                                }}
                                                styles={customSelectStyles}
                                                menuPortalTarget={document.body}
                                                isSearchable
                                                isClearable
                                                placeholder="-- Choose Vendor --"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>PO Date *</label>
                                            <Input type="date" required value={formData.po_date} onChange={e => setFormData(prev => ({ ...prev, po_date: e.target.value }))} style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Expected Delivery Date</label>
                                            <Input type="date" value={formData.expected_delivery_date} onChange={e => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))} style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Proforma Invoice / Quotation Ref No</label>
                                            <Input 
                                                type="text" 
                                                placeholder="e.g. RES/26-27/01 or Quote #"
                                                value={formData.quotation_ref_no} 
                                                onChange={e => setFormData(prev => ({ ...prev, quotation_ref_no: e.target.value }))} 
                                                style={{ width: '100%' }} 
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Subject Line (SUB: PURCHASE ORDER FOR;)</label>
                                            <Input 
                                                type="text" 
                                                placeholder="Auto-generated or custom subject line..."
                                                value={formData.subject} 
                                                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} 
                                                style={{ width: '100%' }} 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Payment Terms</label>
                                            <Input 
                                                type="text" 
                                                value={formData.payment_terms} 
                                                onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} 
                                                style={{ width: '100%' }} 
                                            />
                                        </div>
                                    </div>

                                    {/* Item Addition Section */}
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: `1px solid ${colors.border}`, marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700', color: colors.primary }}>Add Line Items to PO</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Item</label>
                                                <ReactSelect 
                                                    options={itemsMaster.map(it => ({ value: it.item_id, label: `${it.itemName} (${it.item_id})` }))}
                                                    value={itemsMaster.map(it => ({ value: it.item_id, label: `${it.itemName} (${it.item_id})` })).find(opt => opt.value === selectedItem) || null}
                                                    onChange={opt => {
                                                        const itmId = opt ? opt.value : '';
                                                        setSelectedItem(itmId);
                                                        const it = itemsMaster.find(i => i.item_id === itmId);
                                                        if (it) setItemRate(it.unit_price || 0);
                                                    }}
                                                    styles={customSelectStyles}
                                                    menuPortalTarget={document.body}
                                                    isSearchable
                                                    isClearable
                                                    placeholder="-- Choose Item --"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Qty</label>
                                                <Input value={itemQty} onChange={e => setItemQty(e.target.value)} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Unit Rate (₹)</label>
                                                <Input value={itemRate} onChange={e => setItemRate(e.target.value)} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Disc %</label>
                                                <Input value={itemDiscount} onChange={e => setItemDiscount(e.target.value)} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>GST %</label>
                                                <Select value={itemGst} onChange={e => setItemGst(e.target.value)} style={{ width: '100%' }}>
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="12">12%</option>
                                                    <option value="18">18%</option>
                                                    <option value="28">28%</option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Button type="button" onClick={handleAddItemLine} style={{ background: '#059669', color: '#fff', padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: '600', height: '38px', cursor: 'pointer' }}>
                                                    + Add
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Added Items Table */}
                                    {formData.items.length > 0 && (
                                        <div style={{ marginBottom: '20px', border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                            <Table style={{ fontSize: '0.85rem' }}>
                                                <thead>
                                                    <Tr style={{ background: '#f1f5f9' }}>
                                                        <Th style={{ width: '40px' }}>#</Th>
                                                        <Th>Item</Th>
                                                        <Th>HSN</Th>
                                                        <Th style={{ textAlign: 'right' }}>Qty</Th>
                                                        <Th style={{ textAlign: 'right' }}>Rate</Th>
                                                        <Th style={{ textAlign: 'right' }}>Disc%</Th>
                                                        <Th style={{ textAlign: 'right' }}>Taxable</Th>
                                                        <Th style={{ textAlign: 'right' }}>GST</Th>
                                                        <Th style={{ textAlign: 'right' }}>Total</Th>
                                                        <Th style={{ width: '50px' }}></Th>
                                                    </Tr>
                                                </thead>
                                                <tbody>
                                                    {formData.items.map((it, idx) => (
                                                        <Tr key={idx}>
                                                            <Td>{idx + 1}</Td>
                                                            <Td style={{ fontWeight: '600' }}>{it.itemName}</Td>
                                                            <Td>{it.hsn || '-'}</Td>
                                                            <Td style={{ textAlign: 'right' }}>{it.quantity}</Td>
                                                            <Td style={{ textAlign: 'right' }}>₹{it.rate}</Td>
                                                            <Td style={{ textAlign: 'right' }}>{it.discount_percent}%</Td>
                                                            <Td style={{ textAlign: 'right' }}>₹{it.taxable_amount}</Td>
                                                            <Td style={{ textAlign: 'right' }}>{it.gst_percent}%</Td>
                                                            <Td style={{ textAlign: 'right', fontWeight: '700' }}>₹{it.total_amount}</Td>
                                                            <Td style={{ textAlign: 'center' }}>
                                                                <button type="button" onClick={() => handleRemoveItemLine(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            {/* Totals Preview */}
                                            <div style={{ padding: '12px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '24px', fontWeight: '700', fontSize: '0.9rem', borderTop: `1px solid ${colors.border}` }}>
                                                <div>Subtotal: <span style={{ color: colors.textMain }}>₹{calcTotals().subtotal}</span></div>
                                                <div>Discount: <span style={{ color: '#ef4444' }}>-₹{calcTotals().discount_amount}</span></div>
                                                <div>Tax (GST): <span style={{ color: colors.textMain }}>₹{calcTotals().tax_amount}</span></div>
                                                <div style={{ color: colors.primary, fontSize: '1rem' }}>Net Total: ₹{calcTotals().total_amount}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Addresses & Additional Information */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Shipping Address (Shanmuga Hospital Ltd)</label>
                                            <textarea
                                                rows="4"
                                                value={formData.shipping_address}
                                                onChange={e => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))}
                                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'inherit', fontSize: '0.82rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Billing Address (SMRFT)</label>
                                            <textarea
                                                rows="4"
                                                value={formData.billing_address}
                                                onChange={e => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'inherit', fontSize: '0.82rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Terms & Conditions</label>
                                            <textarea
                                                rows="3"
                                                value={formData.terms_and_conditions}
                                                onChange={e => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'inherit', fontSize: '0.82rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Remarks / Special Instructions</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Optional notes..."
                                                value={formData.remarks}
                                                onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'inherit', fontSize: '0.82rem' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <Button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#e2e8f0', color: colors.textMain, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} style={{ background: colors.primary, color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                                            {loading ? 'Creating...' : 'Generate Purchase Order'}
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Printable PO Preview Modal (Matches Word Doc Layout) */}
                {previewPo && (() => {
                    const items = parsePoItems(previewPo.items);
                    const subtotal = parseFloat(previewPo.subtotal || 0);
                    const discount = parseFloat(previewPo.discount_amount || 0);
                    const taxAmount = parseFloat(previewPo.tax_amount || 0);
                    const cgst = taxAmount / 2;
                    const sgst = taxAmount / 2;
                    const totalAmount = parseFloat(previewPo.total_amount || (subtotal - discount + taxAmount));
                    const words = numberToWords(totalAmount);

                    const vendorObj = vendors.find(v => v.vendor_id === previewPo.vendor_id) || {};
                    const vendorAddressLines = formatVendorAddress(vendorObj);
                    const vendorGst = vendorObj.gstin || vendorObj.gst_number || previewPo.vendor_gstin || '';
                    const vendorPhone = vendorObj.phone || vendorObj.mobile || vendorObj.contact_no || '';

                    const autoSubject = items.map(it => `${it.itemName || it.item_id}${it.quantity ? ' Qty : ' + it.quantity : ''}`).join(' & ');
                    const displaySubject = previewPo.subject || autoSubject || 'Hospital Consumables / Store Supplies';

                    return (
                        <ModalOverlay style={{ zIndex: 1100 }}>
                            <ModalContainer style={{ maxWidth: '920px', width: '95vw', maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}>
                                <ModalHeader style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
                                    <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={20} color={colors.primary} /> Purchase Order Format — {previewPo.po_number}
                                    </ModalTitle>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <Button onClick={() => handlePrintPo(previewPo)} style={{ background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '6px', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                                            <Printer size={16} /> Print Official PO
                                        </Button>
                                        <CloseButton onClick={() => setPreviewPo(null)}><X size={20} /></CloseButton>
                                    </div>
                                </ModalHeader>

                                <ModalBody style={{ padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
                                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', padding: '24px 30px', maxWidth: '820px', margin: '0 auto' }}>
                                        
                                        {/* Top Letterhead Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '10px', marginBottom: '14px' }}>
                                            <div>
                                                <img src={PO_LOGO_BASE64} alt="Shanmuga Hospital Logo" style={{ height: '56px', maxWidth: '250px', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '0.8px', textTransform: 'uppercase' }}>PURCHASE DEPARTMENT</div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f766e', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '2px' }}>PURCHASE ORDER</div>
                                            </div>
                                        </div>

                                        {/* PO NO & DATE */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                            <div>PO NO: <strong>{previewPo.po_number}</strong></div>
                                            <div>DATE: <strong>{previewPo.po_date || today}</strong></div>
                                        </div>

                                        {/* Vendor Details */}
                                        <div style={{ marginBottom: '14px', fontSize: '11.5px', lineHeight: '1.5' }}>
                                            <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>TO,</div>
                                            <div style={{ paddingLeft: '28px' }}>
                                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '12px', textTransform: 'uppercase' }}>
                                                    {previewPo.vendor_name || previewPo.vendor_id || 'SUPPLIER'}
                                                </div>
                                                {vendorAddressLines.map((line, i) => (
                                                    <div key={i} style={{ color: '#334155' }}>{line}</div>
                                                ))}
                                                {vendorGst && <div style={{ color: '#334155' }}><strong>GSTIN:</strong> {vendorGst}</div>}
                                                {vendorPhone && <div style={{ color: '#334155' }}><strong>Phone:</strong> {vendorPhone}</div>}
                                            </div>
                                        </div>

                                        {/* Subject Line */}
                                        <div style={{ margin: '14px 0 10px 0', fontSize: '12px', lineHeight: '1.5' }}>
                                            <span style={{ fontWeight: '800', color: '#0f172a', textDecoration: 'underline' }}>SUB: PURCHASE  ORDER  FOR;</span>
                                            <div style={{ paddingLeft: '28px', marginTop: '2px', fontWeight: '700', color: '#1e293b' }}>
                                                {displaySubject}
                                            </div>
                                        </div>

                                        {/* Quotation Reference Paragraph */}
                                        <div style={{ margin: '12px 0 14px 0', fontSize: '11.5px', lineHeight: '1.6', color: '#1e293b', textAlign: 'justify' }}>
                                            With reference to your revised Proforma Invoice no <strong>{previewPo.quotation_ref_no || previewPo.po_number || 'N/A'}</strong>, after discussion and acceptance of the quote rate as <strong>Rs.{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/- (Including tax)</strong>, we are raising purchase order for with the mentioned specifications which you have mentioned in quotation.
                                        </div>

                                        {/* Items Table */}
                                        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: '11px' }}>
                                            <thead>
                                                <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '30px' }}>#</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Item Description & Specifications</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '75px' }}>HSN</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '45px' }}>Qty</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '75px' }}>Rate (₹)</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '45px' }}>Disc %</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '80px' }}>Taxable (₹)</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '85px' }}>GST Rate</th>
                                                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'right', width: '90px' }}>Total (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length === 0 ? (
                                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '12px', border: '1px solid #cbd5e1' }}>No item rows</td></tr>
                                                ) : (
                                                    items.map((it, idx) => {
                                                        const qty = parseFloat(it.quantity || 0);
                                                        const rate = parseFloat(it.rate || it.unit_price || 0);
                                                        const discPct = parseFloat(it.discount_percent || 0);
                                                        const gstPct = parseFloat(it.gst_percent || 0);
                                                        const lineTaxable = it.taxable_amount ? parseFloat(it.taxable_amount) : (qty * rate * (1 - discPct / 100));
                                                        const lineTax = it.tax_amount ? parseFloat(it.tax_amount) : (lineTaxable * gstPct / 100);
                                                        const lineTotal = it.total_amount ? parseFloat(it.total_amount) : (lineTaxable + lineTax);

                                                        return (
                                                            <tr key={idx} style={{ background: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', padding: '6px 8px', fontWeight: '600' }}>{idx + 1}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>
                                                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{it.itemName || it.item_id}</div>
                                                                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Code: {it.item_id || '-'}</div>
                                                                </td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', padding: '6px 8px', fontFamily: 'monospace' }}>{it.hsn || '-'}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px', fontWeight: '700' }}>{qty}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px' }}>₹{rate.toFixed(2)}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px' }}>{discPct > 0 ? `${discPct}%` : '-'}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px', fontWeight: '600' }}>₹{lineTaxable.toFixed(2)}</td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px' }}>{gstPct}% <span style={{ fontSize: '9.5px', color: '#64748b' }}>(₹{lineTax.toFixed(2)})</span></td>
                                                                <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', padding: '6px 8px', fontWeight: '800', color: '#0f172a' }}>₹{lineTotal.toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Totals & Words Box */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', border: '1px solid #cbd5e1', borderTop: 'none', background: '#ffffff', marginBottom: '12px' }}>
                                            <div style={{ padding: '10px 14px', borderRight: '1px solid #cbd5e1', fontSize: '10.5px', background: '#fafafa' }}>
                                                <div style={{ fontWeight: '700', color: '#0f766e', textTransform: 'uppercase', marginBottom: '2px', fontSize: '9.5px' }}>Amount in Words:</div>
                                                <div style={{ fontWeight: '800', color: '#0f172a', fontStyle: 'italic' }}>{words}</div>
                                                {previewPo.terms_and_conditions && (
                                                    <div style={{ marginTop: '8px', fontSize: '9.5px', color: '#475569' }}>
                                                        <strong>Terms & Conditions:</strong>
                                                        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.35' }}>{previewPo.terms_and_conditions}</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '10px 14px', background: '#ffffff', fontSize: '11px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <span style={{ color: '#64748b' }}>Subtotal:</span>
                                                    <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#dc2626' }}>
                                                        <span>Discount:</span>
                                                        <span>- ₹{discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <span style={{ color: '#64748b' }}>Taxable Value:</span>
                                                    <span style={{ fontWeight: '600' }}>₹{(subtotal - discount).toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#475569' }}>
                                                    <span>CGST:</span>
                                                    <span>₹{cgst.toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#475569' }}>
                                                    <span>SGST:</span>
                                                    <span>₹{sgst.toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #0f766e', marginTop: '5px', paddingTop: '5px', fontSize: '12.5px', fontWeight: '900', color: '#0f766e' }}>
                                                    <span>NET TOTAL:</span>
                                                    <span>₹{totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Terms */}
                                        <div style={{ margin: '12px 0 6px 0', fontSize: '11.5px', lineHeight: '1.5', color: '#0f172a' }}>
                                            <strong>Payment terms:</strong> {previewPo.payment_terms || DEFAULT_PAYMENT_TERMS}
                                        </div>

                                        {/* Authorized Signatory */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0 18px 0', paddingRight: '15px' }}>
                                            <div style={{ textAlign: 'center', minWidth: '190px' }}>
                                                <img src={PO_SIGN_BASE64} alt="Authorized Signatory" style={{ maxHeight: '55px', maxWidth: '150px', objectFit: 'contain', display: 'block', margin: '0 auto 3px auto' }} />
                                                <div style={{ fontWeight: '800', fontSize: '11.5px', color: '#0f172a', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                                                    Authorized Signatory
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping & Billing Box */}
                                        <table style={{ width: '100%', border: '1.5px solid #0f172a', borderCollapse: 'collapse', marginTop: '14px', fontSize: '10px', lineHeight: '1.45' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '50%', borderRight: '1.5px solid #0f172a', padding: '8px 12px', verticalAlign: 'top' }}>
                                                        <div style={{ fontWeight: '800', textDecoration: 'underline', marginBottom: '4px', color: '#0f172a', fontSize: '10.5px' }}>SHIPPING ADDRESS:</div>
                                                        <div style={{ whiteSpace: 'pre-line' }}>{previewPo.shipping_address || DEFAULT_SHIPPING_ADDRESS}</div>
                                                    </td>
                                                    <td style={{ width: '50%', padding: '8px 12px', verticalAlign: 'top' }}>
                                                        <div style={{ fontWeight: '800', textDecoration: 'underline', marginBottom: '4px', color: '#0f172a', fontSize: '10.5px' }}>BILLING ADDRESS:</div>
                                                        <div style={{ whiteSpace: 'pre-line' }}>{previewPo.billing_address || DEFAULT_BILLING_ADDRESS}</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Official Footer */}
                                        <div style={{ marginTop: '18px', paddingTop: '8px', borderTop: '1.5px solid #0f766e', fontSize: '9.5px', color: '#334155', lineHeight: '1.35' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', color: '#0f766e', fontSize: '10px' }}>
                                                <span>SHANMUGA HOSPITAL LTD</span>
                                                <a href="https://shanmugahospital.com/" target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'none' }}>https://shanmugahospital.com/</a>
                                            </div>
                                            <div>51/24, Saradha College Road, Salem – 636007.</div>
                                            <div>PH: 0427-2706630 / 8248456660 &nbsp;|&nbsp; Email: purchase@smrft.org</div>
                                        </div>
                                    </div>
                                </ModalBody>
                            </ModalContainer>
                        </ModalOverlay>
                    );
                })()}
            </Container>
        </PageWrapper>
    );
};

export default StoresPurchaseOrderFormat;
