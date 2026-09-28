import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import ReactSelect from 'react-select';
import { 
    FileText, Plus, Search, Calendar, RefreshCw, Printer, 
    CheckCircle, X, Download, Trash2, Building2, ShoppingBag, Eye
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
        payment_terms: 'Within 30 Days',
        shipping_address: 'Central Stores Department, Shanmuga Hospital, Salem - 636004',
        terms_and_conditions: '1. Goods must be strictly according to specifications.\n2. Invoices must mention this PO number.\n3. Damaged goods will be rejected and returned.',
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

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
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
                    payment_terms: 'Within 30 Days',
                    shipping_address: 'Central Stores Department, Shanmuga Hospital, Salem - 636004',
                    terms_and_conditions: '1. Goods must be strictly according to specifications.\n2. Invoices must mention this PO number.\n3. Damaged goods will be rejected and returned.',
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
        const vendorAddress = vendorObj.address || vendorObj.city ? `${vendorObj.address || ''} ${vendorObj.city || ''} ${vendorObj.state || ''} ${vendorObj.pincode || ''}`.trim() : 'Registered Supplier Address';
        const vendorPhone = vendorObj.phone || vendorObj.mobile || vendorObj.contact_no || 'N/A';
        const vendorGst = vendorObj.gst_number || vendorObj.gstin || 'N/A';

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
                        <div style="font-size: 9.5px; color: #64748b;">Item Code: ${it.item_id || '-'}</div>
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

        const printWindow = window.open('', '_blank', 'width=950,height=800');
        if (!printWindow) {
            alert("Please allow popups to print the Purchase Order.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Purchase_Order_${po.po_number || 'Format'}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 10mm 12mm 10mm;
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
                        font-size: 11px;
                        line-height: 1.35;
                    }
                    .po-sheet {
                        width: 100%;
                        max-width: 780px;
                        margin: 0 auto;
                        border: 1.5px solid #0f766e;
                        background: #ffffff;
                    }
                    .header-wrapper {
                        padding: 14px 18px 10px 18px;
                        background: #f0fdfa;
                        border-bottom: 2px solid #0d9488;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    .hospital-title {
                        font-size: 20px;
                        font-weight: 900;
                        color: #0f766e;
                        letter-spacing: 0.5px;
                        margin: 0 0 2px 0;
                        text-transform: uppercase;
                    }
                    .hospital-subtitle {
                        font-size: 11px;
                        font-weight: 700;
                        color: #134e4a;
                        margin: 0 0 3px 0;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .hospital-address {
                        font-size: 10px;
                        color: #334155;
                        margin: 0 0 2px 0;
                    }
                    .hospital-tax {
                        font-size: 9.5px;
                        color: #475569;
                        font-weight: 600;
                    }
                    .po-badge-box {
                        text-align: right;
                    }
                    .po-title-tag {
                        display: inline-block;
                        background: #0d9488;
                        color: #ffffff;
                        font-weight: 900;
                        font-size: 13px;
                        padding: 4px 12px;
                        border-radius: 4px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    .po-num {
                        font-size: 13px;
                        font-weight: 800;
                        color: #0f766e;
                    }
                    .po-date {
                        font-size: 10.5px;
                        font-weight: 600;
                        color: #475569;
                    }
                    .info-strip {
                        display: grid;
                        grid-template-columns: 1.2fr 0.9fr 0.9fr;
                        border-bottom: 1.5px solid #0d9488;
                        background: #ffffff;
                    }
                    .info-block {
                        padding: 10px 12px;
                        border-right: 1px solid #ccfbf1;
                    }
                    .info-block:last-child {
                        border-right: none;
                    }
                    .block-title {
                        font-size: 9px;
                        font-weight: 800;
                        color: #0d9488;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        border-bottom: 1px solid #99f6e4;
                        padding-bottom: 2px;
                        margin-bottom: 6px;
                    }
                    .vendor-name {
                        font-size: 12px;
                        font-weight: 800;
                        color: #0f172a;
                        margin-bottom: 2px;
                    }
                    .meta-row {
                        display: flex;
                        font-size: 10px;
                        margin-bottom: 2px;
                    }
                    .meta-label {
                        color: #64748b;
                        font-weight: 600;
                        width: 90px;
                        flex-shrink: 0;
                    }
                    .meta-val {
                        color: #0f172a;
                        font-weight: 600;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .items-table th {
                        background: #0f766e;
                        color: #ffffff;
                        padding: 6px 8px;
                        font-size: 9.5px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border: 1px solid #0f766e;
                    }
                    .items-table td {
                        padding: 6px 8px;
                        font-size: 10px;
                        border: 1px solid #e2e8f0;
                        vertical-align: middle;
                    }
                    .items-table tr:nth-child(even) {
                        background: #f8fafc;
                    }
                    .bottom-section {
                        display: grid;
                        grid-template-columns: 1.3fr 1fr;
                        border-top: 1.5px solid #0d9488;
                    }
                    .terms-block {
                        padding: 10px 14px;
                        border-right: 1px solid #ccfbf1;
                        font-size: 9.5px;
                    }
                    .totals-block {
                        padding: 10px 14px;
                        background: #f8fafc;
                    }
                    .calc-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 10.5px;
                        margin-bottom: 4px;
                    }
                    .calc-row.taxable {
                        font-weight: 600;
                        color: #334155;
                    }
                    .calc-row.discount {
                        color: #dc2626;
                    }
                    .calc-row.tax {
                        color: #475569;
                    }
                    .calc-row.grand-total {
                        border-top: 2px solid #0f766e;
                        margin-top: 6px;
                        padding-top: 6px;
                        font-size: 13px;
                        font-weight: 900;
                        color: #0f766e;
                    }
                    .words-strip {
                        background: #f0fdfa;
                        border-top: 1px dashed #0d9488;
                        border-bottom: 1px dashed #0d9488;
                        padding: 6px 14px;
                        font-size: 10px;
                    }
                    .words-title {
                        font-weight: 700;
                        color: #0f766e;
                        text-transform: uppercase;
                        margin-right: 4px;
                    }
                    .words-text {
                        font-weight: 800;
                        color: #0f172a;
                        font-style: italic;
                    }
                    .sig-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        padding: 24px 18px 12px 18px;
                        text-align: center;
                    }
                    .sig-line {
                        border-top: 1px solid #94a3b8;
                        width: 75%;
                        margin: 0 auto 5px auto;
                    }
                    .sig-role {
                        font-weight: 700;
                        font-size: 10px;
                        color: #1e293b;
                    }
                    .sig-sub {
                        font-size: 8.5px;
                        color: #64748b;
                    }
                    .footer-notice {
                        border-top: 1px solid #e2e8f0;
                        background: #f8fafc;
                        text-align: center;
                        padding: 6px;
                        font-size: 8.5px;
                        color: #64748b;
                    }
                    @media print {
                        body { padding: 0; }
                        .po-sheet { border: 1.5px solid #0f766e !important; }
                    }
                </style>
            </head>
            <body>
                <div class="po-sheet">
                    <div class="header-wrapper">
                        <div>
                            <div class="hospital-title">SHANMUGA HOSPITAL LIMITED</div>
                            <div class="hospital-subtitle">CENTRAL STORES & PHARMACY DIVISION</div>
                            <div class="hospital-address">51/24, Saradha College Road, Salem - 636007, Tamil Nadu, India</div>
                            <div class="hospital-tax">Ph: +91 427 270 6666 | GSTIN: 33AAAAA0000A1Z5 | CIN: U85110TZ1995PLC006321</div>
                        </div>
                        <div class="po-badge-box">
                            <div class="po-title-tag">PURCHASE ORDER</div>
                            <div class="po-num">PO NO: ${po.po_number}</div>
                            <div class="po-date">Date: <strong>${po.po_date}</strong></div>
                            <div style="font-size: 9px; color: #0d9488; font-weight: 700; margin-top: 2px;">STATUS: ${po.status || 'APPROVED'}</div>
                        </div>
                    </div>

                    <div class="info-strip">
                        <div class="info-block">
                            <div class="block-title">VENDOR / SUPPLIER DETAILS</div>
                            <div class="vendor-name">${po.vendor_name || po.vendor_id}</div>
                            <div class="meta-row"><span class="meta-label">Vendor Code:</span><span class="meta-val">${po.vendor_id}</span></div>
                            <div class="meta-row"><span class="meta-label">GSTIN:</span><span class="meta-val">${vendorGst}</span></div>
                            <div class="meta-row"><span class="meta-label">Contact:</span><span class="meta-val">${vendorPhone}</span></div>
                            <div class="meta-row"><span class="meta-label">Address:</span><span class="meta-val">${vendorAddress}</span></div>
                        </div>

                        <div class="info-block">
                            <div class="block-title">PURCHASE & PAYMENT TERMS</div>
                            <div class="meta-row"><span class="meta-label">Payment Terms:</span><span class="meta-val">${po.payment_terms || 'Within 30 Days'}</span></div>
                            <div class="meta-row"><span class="meta-label">Delivery Date:</span><span class="meta-val">${po.expected_delivery_date || 'Within 7 Days'}</span></div>
                            <div class="meta-row"><span class="meta-label">Currency:</span><span class="meta-val">INR (₹)</span></div>
                            <div class="meta-row"><span class="meta-label">Dispatch Mode:</span><span class="meta-val">Road / Direct Supply</span></div>
                        </div>

                        <div class="info-block">
                            <div class="block-title">SHIP TO / BILL TO</div>
                            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Central Stores Department</div>
                            <div style="font-size: 9.5px; color: #334155; line-height: 1.3;">${po.shipping_address || 'Shanmuga Hospital Ltd, 51/24 Saradha College Road, Salem - 636007'}</div>
                            <div class="meta-row" style="margin-top: 4px;"><span class="meta-label">Attn:</span><span class="meta-val">Stores Officer (Ext: 2609)</span></div>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 32px; text-align: center;">#</th>
                                <th style="text-align: left;">Item Description</th>
                                <th style="width: 75px; text-align: center;">HSN Code</th>
                                <th style="width: 45px; text-align: right;">Qty</th>
                                <th style="width: 75px; text-align: right;">Rate (₹)</th>
                                <th style="width: 50px; text-align: right;">Disc %</th>
                                <th style="width: 80px; text-align: right;">Taxable (₹)</th>
                                <th style="width: 85px; text-align: right;">GST Rate</th>
                                <th style="width: 90px; text-align: right;">Net Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml || '<tr><td colspan="9" style="text-align:center; padding:15px;">No item rows in this Purchase Order</td></tr>'}
                        </tbody>
                    </table>

                    <div class="words-strip">
                        <span class="words-title">Amount in Words:</span>
                        <span class="words-text">${words}</span>
                    </div>

                    <div class="bottom-section">
                        <div class="terms-block">
                            <div style="font-weight: 800; color: #0f766e; text-transform: uppercase; margin-bottom: 4px; font-size: 9px; letter-spacing: 0.5px;">Terms & Conditions of Purchase:</div>
                            <div style="color: #334155; line-height: 1.4; white-space: pre-line;">${po.terms_and_conditions || '1. Goods must strictly match approved hospital specifications.\n2. Invoice and Delivery Challan must mention this PO Number.\n3. Damaged, short-expiry, or defective goods will be rejected immediately.\n4. Standard warranty and replacement terms apply.'}</div>
                            ${po.remarks ? `<div style="margin-top: 6px; font-style: italic; color: #475569;"><strong>Special Remarks:</strong> ${po.remarks}</div>` : ''}
                        </div>

                        <div class="totals-block">
                            <div class="calc-row">
                                <span class="meta-label">Gross Subtotal:</span>
                                <span class="meta-val">₹${subtotal.toFixed(2)}</span>
                            </div>
                            ${discount > 0 ? `
                            <div class="calc-row discount">
                                <span class="meta-label" style="color:#dc2626;">Total Discount:</span>
                                <span class="meta-val" style="color:#dc2626;">- ₹${discount.toFixed(2)}</span>
                            </div>` : ''}
                            <div class="calc-row taxable">
                                <span class="meta-label">Taxable Value:</span>
                                <span class="meta-val">₹${(subtotal - discount).toFixed(2)}</span>
                            </div>
                            <div class="calc-row tax">
                                <span class="meta-label">CGST Amount:</span>
                                <span class="meta-val">₹${cgst.toFixed(2)}</span>
                            </div>
                            <div class="calc-row tax">
                                <span class="meta-label">SGST Amount:</span>
                                <span class="meta-val">₹${sgst.toFixed(2)}</span>
                            </div>
                            <div class="calc-row grand-total">
                                <span>NET PO TOTAL:</span>
                                <span>₹${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="sig-section">
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Prepared By</div>
                            <div class="sig-sub">Stores In-charge / Pharmacist</div>
                        </div>
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Verified By</div>
                            <div class="sig-sub">Accounts / Purchase Manager</div>
                        </div>
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Authorized Signatory</div>
                            <div class="sig-sub">Medical Superintendent / Director</div>
                        </div>
                    </div>

                    <div class="footer-notice">
                        This is an officially generated computer Purchase Order from Shanmuga Hospital Central Stores Management System.
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
                            Create, manage, and print official Stores Purchase Orders with standardized hospital formats.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={() => setShowCreateModal(true)}
                            style={{ background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '700' }}
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
                        <Button onClick={fetchPOs} style={{ background: colors.primary, color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSelectedVendor(''); setStatusFilter(''); setSearchTerm(''); setTimeout(fetchPOs, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
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
                                    <Td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Loading Purchase Orders...</p>
                                    </Td>
                                </Tr>
                            ) : poList.length === 0 ? (
                                <Tr>
                                    <Td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
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
                                                    style={{ padding: '6px 10px', background: '#eff6ff', color: colors.primary, border: `1px solid ${colors.primary}`, borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Preview Purchase Order"
                                                >
                                                    <Eye size={14} /> View
                                                </Button>
                                                <Button
                                                    onClick={() => handlePrintPo(po)}
                                                    style={{ padding: '6px 10px', background: colors.primary, color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Print Official PO Template"
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
                        <ModalContainer style={{ maxWidth: '1000px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShoppingBag size={20} color={colors.primary} /> Create New Purchase Order (Stores PO)
                                </ModalTitle>
                                <CloseButton onClick={() => setShowCreateModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '24px', overflowY: 'auto' }}>
                                <form onSubmit={handleCreatePo}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
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
                                                        vendor_name: v ? v.name : ''
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
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Payment Terms</label>
                                            <Input type="text" value={formData.payment_terms} onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))} style={{ width: '100%' }} />
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
                                                <Input type="number" min="1" value={itemQty} onChange={e => setItemQty(e.target.value)} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Unit Rate (₹)</label>
                                                <Input type="number" step="0.01" value={itemRate} onChange={e => setItemRate(e.target.value)} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.textMuted }}>Disc %</label>
                                                <Input type="number" min="0" max="100" value={itemDiscount} onChange={e => setItemDiscount(e.target.value)} style={{ width: '100%' }} />
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
                                                <Button type="button" onClick={handleAddItemLine} style={{ background: '#059669', color: '#fff', padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: '600', height: '38px' }}>
                                                    + Add
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Added Items Table */}
                                        {formData.items.length > 0 && (
                                            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                                                <Table style={{ fontSize: '0.85rem' }}>
                                                    <thead>
                                                        <Tr>
                                                            <Th>#</Th>
                                                            <Th>Item Name</Th>
                                                            <Th>HSN</Th>
                                                            <Th style={{ textAlign: 'right' }}>Qty</Th>
                                                            <Th style={{ textAlign: 'right' }}>Rate</Th>
                                                            <Th style={{ textAlign: 'right' }}>Disc %</Th>
                                                            <Th style={{ textAlign: 'right' }}>GST %</Th>
                                                            <Th style={{ textAlign: 'right' }}>Total (₹)</Th>
                                                            <Th style={{ textAlign: 'center' }}>Action</Th>
                                                        </Tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.items.map((it, idx) => (
                                                            <Tr key={idx}>
                                                                <Td>{idx + 1}</Td>
                                                                <Td style={{ fontWeight: '600' }}>{it.itemName}</Td>
                                                                <Td>{it.hsn || '-'}</Td>
                                                                <Td style={{ textAlign: 'right' }}>{it.quantity}</Td>
                                                                <Td style={{ textAlign: 'right' }}>₹{it.rate.toFixed(2)}</Td>
                                                                <Td style={{ textAlign: 'right' }}>{it.discount_percent}%</Td>
                                                                <Td style={{ textAlign: 'right' }}>{it.gst_percent}%</Td>
                                                                <Td style={{ textAlign: 'right', fontWeight: '700' }}>₹{it.total_amount.toFixed(2)}</Td>
                                                                <Td style={{ textAlign: 'center' }}>
                                                                    <button type="button" onClick={() => handleRemoveItemLine(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Shipping & Terms */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Delivery / Shipping Address</label>
                                            <Input type="text" value={formData.shipping_address} onChange={e => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))} style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Special Remarks</label>
                                            <Input type="text" placeholder="e.g. Urgent requirement for OT" value={formData.remarks} onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))} style={{ width: '100%' }} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Terms & Conditions</label>
                                        <textarea
                                            rows="3"
                                            value={formData.terms_and_conditions}
                                            onChange={e => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: 'inherit', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    {/* Form Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <Button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#e2e8f0', color: colors.textMain, padding: '10px 20px', borderRadius: '8px', border: 'none' }}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} style={{ background: colors.primary, color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700' }}>
                                            {loading ? 'Creating...' : 'Generate Purchase Order'}
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Printable PO Preview Modal */}
                {previewPo && (
                    <ModalOverlay style={{ zIndex: 1100 }}>
                        <ModalContainer style={{ maxWidth: '900px', width: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} color={colors.primary} /> Purchase Order Template — {previewPo.po_number}
                                </ModalTitle>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Button onClick={() => handlePrintPo(previewPo)} style={{ background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '6px', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        <Printer size={16} /> Print Official PO
                                    </Button>
                                    <CloseButton onClick={() => setPreviewPo(null)}><X size={20} /></CloseButton>
                                </div>
                            </ModalHeader>

                            <ModalBody style={{ padding: '24px', overflowY: 'auto', background: '#f1f5f9' }}>
                                <div style={{ background: '#ffffff', border: '1.5px solid #0f766e', borderRadius: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '820px', margin: '0 auto' }}>
                                    {/* Letterhead Header */}
                                    <div style={{ padding: '16px 20px 12px 20px', background: '#f0fdfa', borderBottom: '2px solid #0d9488', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 2px 0', color: '#0f766e', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px' }}>SHANMUGA HOSPITAL LIMITED</h2>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#134e4a', textTransform: 'uppercase' }}>CENTRAL STORES & PHARMACY DIVISION</div>
                                            <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '2px' }}>51/24, Saradha College Road, Salem - 636007, Tamil Nadu, India</div>
                                            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600', marginTop: '1px' }}>Ph: +91 427 270 6666 | GSTIN: 33AAAAA0000A1Z5 | CIN: U85110TZ1995PLC006321</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'inline-block', background: '#0d9488', color: '#ffffff', fontWeight: '900', fontSize: '0.85rem', padding: '4px 12px', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                PURCHASE ORDER
                                            </span>
                                            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f766e' }}>PO NO: {previewPo.po_number}</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Date: <strong>{previewPo.po_date}</strong></div>
                                            <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: '700', marginTop: '2px' }}>STATUS: {previewPo.status || 'APPROVED'}</div>
                                        </div>
                                    </div>

                                    {/* 3 Information Blocks */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', borderBottom: '1.5px solid #0d9488', background: '#ffffff' }}>
                                        <div style={{ padding: '10px 14px', borderRight: '1px solid #ccfbf1' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #99f6e4', paddingBottom: '2px', marginBottom: '6px' }}>VENDOR / SUPPLIER DETAILS</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{previewPo.vendor_name || previewPo.vendor_id}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>Vendor Code: <strong style={{ color: '#0f172a' }}>{previewPo.vendor_id}</strong></div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>Payment Terms: <strong>{previewPo.payment_terms || 'Within 30 Days'}</strong></div>
                                        </div>

                                        <div style={{ padding: '10px 14px', borderRight: '1px solid #ccfbf1' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #99f6e4', paddingBottom: '2px', marginBottom: '6px' }}>PURCHASE & TERMS</div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '2px' }}>Delivery Date: <strong style={{ color: '#0f172a' }}>{previewPo.expected_delivery_date || 'Immediate'}</strong></div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '2px' }}>Currency: <strong>INR (₹)</strong></div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>Dispatch Mode: <strong>Road / Direct Supply</strong></div>
                                        </div>

                                        <div style={{ padding: '10px 14px' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #99f6e4', paddingBottom: '2px', marginBottom: '6px' }}>SHIP TO / BILL TO</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Central Stores Dept</div>
                                            <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: '1.3' }}>{previewPo.shipping_address || 'Shanmuga Hospital Ltd, Salem - 636007'}</div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                        <thead>
                                            <tr style={{ background: '#0f766e', color: '#ffffff' }}>
                                                <th style={{ padding: '7px 10px', textAlign: 'center', width: '32px' }}>#</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Item Description</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'center', width: '75px' }}>HSN</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '50px' }}>Qty</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '80px' }}>Rate (₹)</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '55px' }}>Disc %</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '85px' }}>Taxable (₹)</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '70px' }}>GST %</th>
                                                <th style={{ padding: '7px 10px', textAlign: 'right', width: '95px' }}>Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsePoItems(previewPo.items).map((it, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: '600' }}>{idx + 1}</td>
                                                    <td style={{ padding: '7px 10px' }}>
                                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{it.itemName || it.item_id}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Item ID: {it.item_id || '-'}</div>
                                                    </td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace' }}>{it.hsn || '-'}</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: '700' }}>{it.quantity}</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>₹{parseFloat(it.rate || 0).toFixed(2)}</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{it.discount_percent ? `${it.discount_percent}%` : '-'}</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: '600' }}>₹{parseFloat(it.taxable_amount || (it.quantity * it.rate * (1 - (it.discount_percent || 0)/100))).toFixed(2)}</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{it.gst_percent || 0}%</td>
                                                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>₹{parseFloat(it.total_amount || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Amount in Words */}
                                    <div style={{ background: '#f0fdfa', borderTop: '1px dashed #0d9488', borderBottom: '1px dashed #0d9488', padding: '7px 16px', fontSize: '0.8rem' }}>
                                        <span style={{ fontWeight: '700', color: '#0f766e', textTransform: 'uppercase', marginRight: '6px' }}>Amount in Words:</span>
                                        <span style={{ fontWeight: '800', color: '#0f172a', fontStyle: 'italic' }}>{numberToWords(previewPo.total_amount)}</span>
                                    </div>

                                    {/* Terms & Conditions and Totals */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', borderTop: '1.5px solid #0d9488' }}>
                                        <div style={{ padding: '12px 16px', borderRight: '1px solid #ccfbf1', fontSize: '0.78rem' }}>
                                            <div style={{ fontWeight: '800', color: '#0f766e', textTransform: 'uppercase', marginBottom: '4px', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Terms & Conditions of Purchase:</div>
                                            <div style={{ color: '#334155', lineHeight: '1.4', whiteSpace: 'pre-line' }}>{previewPo.terms_and_conditions || '1. Goods must strictly match approved hospital specifications.\n2. Invoice and Delivery Challan must mention this PO Number.\n3. Damaged or defective goods will be rejected immediately.'}</div>
                                            {previewPo.remarks && (
                                                <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#475569' }}>
                                                    <strong>Remarks:</strong> {previewPo.remarks}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: '12px 16px', background: '#f8fafc', fontSize: '0.82rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#64748b' }}>Gross Subtotal:</span>
                                                <span style={{ fontWeight: '600' }}>₹{parseFloat(previewPo.subtotal || 0).toFixed(2)}</span>
                                            </div>
                                            {parseFloat(previewPo.discount_amount || 0) > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#dc2626' }}>
                                                    <span>Total Discount:</span>
                                                    <span>- ₹{parseFloat(previewPo.discount_amount || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#475569' }}>
                                                <span>Tax Amount (GST):</span>
                                                <span style={{ fontWeight: '600' }}>+ ₹{parseFloat(previewPo.tax_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div style={{ borderTop: '2px solid #0f766e', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '900', color: '#0f766e' }}>
                                                <span>NET PO TOTAL:</span>
                                                <span>₹{parseFloat(previewPo.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '28px 20px 14px 20px', textAlign: 'center', background: '#ffffff' }}>
                                        <div>
                                            <div style={{ borderTop: '1px solid #94a3b8', width: '75%', margin: '0 auto 6px auto' }}></div>
                                            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1e293b' }}>Prepared By</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stores Incharge / Pharmacist</div>
                                        </div>
                                        <div>
                                            <div style={{ borderTop: '1px solid #94a3b8', width: '75%', margin: '0 auto 6px auto' }}></div>
                                            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1e293b' }}>Verified By</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Accounts / Purchase Manager</div>
                                        </div>
                                        <div>
                                            <div style={{ borderTop: '1px solid #94a3b8', width: '75%', margin: '0 auto 6px auto' }}></div>
                                            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1e293b' }}>Authorized Signatory</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Medical Superintendent / Director</div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', padding: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                                        This is an officially generated computer Purchase Order from Shanmuga Hospital Central Stores Management System.
                                    </div>
                                </div>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresPurchaseOrderFormat;
