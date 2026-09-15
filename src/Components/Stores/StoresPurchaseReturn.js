import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import ReactSelect from 'react-select';
import { 
    RotateCcw, Plus, Search, Calendar, RefreshCw, Printer, 
    CheckCircle, X, Download, Trash2, Building2, Eye, AlertTriangle, FileText
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
        borderColor: state.isFocused ? '#dc2626' : '#c0dbff',
        boxShadow: state.isFocused ? '0 0 0 1px #dc2626' : 'none',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        '&:hover': {
            borderColor: '#dc2626'
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
            ? '#dc2626'
            : state.isFocused
            ? '#fee2e2'
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

const StoresPurchaseReturn = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [returnsList, setReturnsList] = useState([]);
    const [grnList, setGrnList] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [totalReturnValue, setTotalReturnValue] = useState(0);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewReturn, setPreviewReturn] = useState(null);

    // New Return Form state
    const [formData, setFormData] = useState({
        grn_number: '',
        vendor_id: '',
        vendor_name: '',
        return_date: today,
        return_reason: 'DAMAGED',
        remarks: '',
        items: []
    });

    const [availableGrnItems, setAvailableGrnItems] = useState([]);

    useEffect(() => {
        fetchVendors();
        fetchGrns();
        fetchReturns();
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

    const fetchGrns = async () => {
        try {
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-grn/`);
            if (res && res.success && res.data) {
                setGrnList(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("Error fetching GRNs:", err);
        }
    };

    const fetchReturns = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor) query.push(`vendor_id=${selectedVendor}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-purchase-returns/${queryString}`);
            if (res && res.success && res.data) {
                setReturnsList(res.data.data || []);
                setTotalReturnValue(res.data.total_return_value || 0);
            } else {
                setReturnsList([]);
            }
        } catch (err) {
            console.error("Error fetching returns:", err);
            setReturnsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGrnSelect = (grnNo) => {
        const selectedGrn = grnList.find(g => g.grn_number === grnNo);
        if (!selectedGrn) {
            setAvailableGrnItems([]);
            return;
        }

        const vId = selectedGrn.vendor_id;
        const vObj = vendors.find(v => v.vendor_id === vId);

        let items = selectedGrn.items || [];
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch(e) { items = []; }
        }

        setAvailableGrnItems(items);
        setFormData(prev => ({
            ...prev,
            grn_number: grnNo,
            vendor_id: vId,
            vendor_name: vObj ? vObj.name : vId,
            items: items.map(it => ({
                item_id: it.item_id || it.id,
                itemName: it.itemName || it.name,
                batch_no: it.batch_no || it.batch || 'N/A',
                original_qty: parseFloat(it.quantity || 0),
                return_qty: 0,
                unit_price: parseFloat(it.rate || it.purchase_price || it.unit_price || 0),
                total_return_amount: 0,
                reason: 'Damaged'
            }))
        }));
    };

    const handleItemReturnQtyChange = (idx, qtyVal) => {
        const qty = parseFloat(qtyVal) || 0;
        setFormData(prev => {
            const updated = [...prev.items];
            const it = updated[idx];
            const validQty = Math.min(Math.max(0, qty), it.original_qty);
            it.return_qty = validQty;
            it.total_return_amount = Math.round((validQty * it.unit_price) * 100) / 100;
            return { ...prev, items: updated };
        });
    };

    const handleCreateReturn = async (e) => {
        e.preventDefault();
        const activeReturnItems = formData.items.filter(it => it.return_qty > 0);
        if (activeReturnItems.length === 0) {
            alert("Please enter a return quantity > 0 for at least one item.");
            return;
        }

        const totalAmt = activeReturnItems.reduce((sum, it) => sum + it.total_return_amount, 0);
        const payload = {
            ...formData,
            items: activeReturnItems,
            total_return_amount: Math.round(totalAmt * 100) / 100
        };

        try {
            setLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-purchase-returns/`, 'POST', payload);
            if (res && res.success) {
                alert("Purchase Return & Debit Note created successfully! Stock has been automatically deducted.");
                setShowCreateModal(false);
                setFormData({
                    grn_number: '',
                    vendor_id: '',
                    vendor_name: '',
                    return_date: today,
                    return_reason: 'DAMAGED',
                    remarks: '',
                    items: []
                });
                fetchReturns();
            } else {
                alert(res.error || "Failed to process Purchase Return.");
            }
        } catch (err) {
            console.error("Error creating return:", err);
            alert("Error creating Purchase Return.");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!returnsList || returnsList.length === 0) return;
        const excelData = returnsList.map(ret => ({
            'Return ID': ret.return_id,
            'Debit Note No': ret.debit_note_no,
            'GRN Number': ret.grn_number,
            'Return Date': ret.return_date,
            'Vendor ID': ret.vendor_id,
            'Vendor Name': ret.vendor_name,
            'Reason': ret.return_reason,
            'Items Count': (ret.items || []).length,
            'Total Return Value (₹)': ret.total_return_amount,
            'Status': ret.status
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PurchaseReturns");
        XLSX.writeFile(wb, `Stores_Purchase_Returns_${today}.xlsx`);
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

    const handlePrintDebitNote = (ret) => {
        if (!ret) return;
        let items = ret.items || [];
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        const totalVal = parseFloat(ret.total_return_amount || 0);
        const words = numberToWords(totalVal);

        const vendorObj = vendors.find(v => v.vendor_id === ret.vendor_id) || {};
        const vendorAddress = vendorObj.address || vendorObj.city ? `${vendorObj.address || ''} ${vendorObj.city || ''} ${vendorObj.state || ''} ${vendorObj.pincode || ''}`.trim() : 'Registered Supplier Address';
        const vendorGst = vendorObj.gst_number || vendorObj.gstin || 'N/A';

        const itemsRowsHtml = items.map((it, idx) => {
            const qty = parseFloat(it.return_qty || it.quantity || 0);
            const rate = parseFloat(it.unit_price || it.rate || 0);
            const lineTotal = parseFloat(it.total_return_amount || (qty * rate) || 0);

            return `
                <tr>
                    <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
                    <td>
                        <div style="font-weight: 700; color: #0f172a; font-size: 11.5px;">${it.itemName || it.item_id}</div>
                        <div style="font-size: 9.5px; color: #64748b;">Item Code: ${it.item_id || '-'}</div>
                    </td>
                    <td style="text-align: center; font-family: monospace; font-size: 10.5px;">${it.batch_no || 'N/A'}</td>
                    <td style="text-align: right; font-weight: 700; color: #dc2626;">${qty}</td>
                    <td style="text-align: right;">₹${rate.toFixed(2)}</td>
                    <td style="text-align: right; font-weight: 800; color: #dc2626;">₹${lineTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank', 'width=950,height=800');
        if (!printWindow) {
            alert("Please allow popups to print the Debit Note.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Debit_Note_${ret.debit_note_no || ret.return_id}</title>
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
                    .note-sheet {
                        width: 100%;
                        max-width: 780px;
                        margin: 0 auto;
                        border: 1.5px solid #dc2626;
                        background: #ffffff;
                    }
                    .header-wrapper {
                        padding: 14px 18px 10px 18px;
                        background: #fef2f2;
                        border-bottom: 2px solid #dc2626;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    .hospital-title {
                        font-size: 20px;
                        font-weight: 900;
                        color: #991b1b;
                        letter-spacing: 0.5px;
                        margin: 0 0 2px 0;
                        text-transform: uppercase;
                    }
                    .hospital-subtitle {
                        font-size: 11px;
                        font-weight: 700;
                        color: #b91c1c;
                        margin: 0 0 3px 0;
                        text-transform: uppercase;
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
                    .badge-box {
                        text-align: right;
                    }
                    .title-tag {
                        display: inline-block;
                        background: #dc2626;
                        color: #ffffff;
                        font-weight: 900;
                        font-size: 13px;
                        padding: 4px 12px;
                        border-radius: 4px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    .note-num {
                        font-size: 13px;
                        font-weight: 800;
                        color: #dc2626;
                    }
                    .note-date {
                        font-size: 10.5px;
                        font-weight: 600;
                        color: #475569;
                    }
                    .info-strip {
                        display: grid;
                        grid-template-columns: 1.2fr 1fr;
                        border-bottom: 1.5px solid #dc2626;
                        background: #ffffff;
                    }
                    .info-block {
                        padding: 10px 14px;
                    }
                    .info-block:first-child {
                        border-right: 1px solid #fee2e2;
                    }
                    .block-title {
                        font-size: 9px;
                        font-weight: 800;
                        color: #dc2626;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        border-bottom: 1px solid #fecaca;
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
                        width: 100px;
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
                        background: #dc2626;
                        color: #ffffff;
                        padding: 6px 8px;
                        font-size: 9.5px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border: 1px solid #dc2626;
                    }
                    .items-table td {
                        padding: 6px 8px;
                        font-size: 10px;
                        border: 1px solid #e2e8f0;
                        vertical-align: middle;
                    }
                    .items-table tr:nth-child(even) {
                        background: #fef2f2;
                    }
                    .words-strip {
                        background: #fff1f2;
                        border-top: 1px dashed #dc2626;
                        border-bottom: 1px dashed #dc2626;
                        padding: 6px 14px;
                        font-size: 10px;
                    }
                    .words-title {
                        font-weight: 700;
                        color: #dc2626;
                        text-transform: uppercase;
                        margin-right: 4px;
                    }
                    .words-text {
                        font-weight: 800;
                        color: #0f172a;
                        font-style: italic;
                    }
                    .totals-section {
                        display: flex;
                        justify-content: flex-end;
                        padding: 12px 16px;
                        border-top: 1.5px solid #dc2626;
                        background: #f8fafc;
                    }
                    .total-badge {
                        background: #fef2f2;
                        border: 1px solid #fecaca;
                        padding: 8px 16px;
                        border-radius: 6px;
                        display: flex;
                        gap: 20px;
                        font-size: 13px;
                        font-weight: 900;
                        color: #dc2626;
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
                        .note-sheet { border: 1.5px solid #dc2626 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="note-sheet">
                    <div class="header-wrapper">
                        <div>
                            <div class="hospital-title">SHANMUGA HOSPITAL LIMITED</div>
                            <div class="hospital-subtitle">CENTRAL STORES & PHARMACY DIVISION</div>
                            <div class="hospital-address">51/24, Saradha College Road, Salem - 636007, Tamil Nadu, India</div>
                            <div class="hospital-tax">Ph: +91 427 270 6666 | GSTIN: 33AAAAA0000A1Z5 | CIN: U85110TZ1995PLC006321</div>
                        </div>
                        <div class="badge-box">
                            <div class="title-tag">DEBIT NOTE</div>
                            <div class="note-num">NOTE NO: ${ret.debit_note_no || ret.return_id}</div>
                            <div class="note-date">Date: <strong>${ret.return_date}</strong></div>
                            <div style="font-size: 9px; color: #dc2626; font-weight: 700; margin-top: 2px;">STATUS: ISSUED</div>
                        </div>
                    </div>

                    <div class="info-strip">
                        <div class="info-block">
                            <div class="block-title">DEBIT TO SUPPLIER / VENDOR</div>
                            <div class="vendor-name">${ret.vendor_name || ret.vendor_id}</div>
                            <div class="meta-row"><span class="meta-label">Vendor ID:</span><span class="meta-val">${ret.vendor_id}</span></div>
                            <div class="meta-row"><span class="meta-label">GSTIN:</span><span class="meta-val">${vendorGst}</span></div>
                            <div class="meta-row"><span class="meta-label">Address:</span><span class="meta-val">${vendorAddress}</span></div>
                        </div>

                        <div class="info-block">
                            <div class="block-title">RETURN REFERENCE & REASON</div>
                            <div class="meta-row"><span class="meta-label">Against GRN:</span><span class="meta-val">${ret.grn_number || 'N/A'}</span></div>
                            <div class="meta-row"><span class="meta-label">Return Reason:</span><span class="meta-val" style="color:#dc2626; font-weight:800;">${ret.return_reason || 'DAMAGED'}</span></div>
                            <div class="meta-row"><span class="meta-label">Return Date:</span><span class="meta-val">${ret.return_date}</span></div>
                            ${ret.remarks ? `<div class="meta-row"><span class="meta-label">Remarks:</span><span class="meta-val">${ret.remarks}</span></div>` : ''}
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 32px; text-align: center;">#</th>
                                <th style="text-align: left;">Item Description</th>
                                <th style="width: 90px; text-align: center;">Batch No</th>
                                <th style="width: 70px; text-align: right;">Return Qty</th>
                                <th style="width: 85px; text-align: right;">Unit Rate (₹)</th>
                                <th style="width: 100px; text-align: right;">Total Debit (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml || '<tr><td colspan="6" style="text-align:center; padding:15px;">No item records in this debit note</td></tr>'}
                        </tbody>
                    </table>

                    <div class="words-strip">
                        <span class="words-title">Total Debit in Words:</span>
                        <span class="words-text">${words}</span>
                    </div>

                    <div class="totals-section">
                        <div class="total-badge">
                            <span>TOTAL DEBIT AMOUNT:</span>
                            <span>₹${totalVal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="sig-section">
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Prepared By</div>
                            <div class="sig-sub">Stores In-charge</div>
                        </div>
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Verified By</div>
                            <div class="sig-sub">Accounts Department</div>
                        </div>
                        <div>
                            <div class="sig-line"></div>
                            <div class="sig-role">Authorized Signatory</div>
                            <div class="sig-sub">Medical Superintendent / Director</div>
                        </div>
                    </div>

                    <div class="footer-notice">
                        This is an official Debit Note issued by Shanmuga Hospital Central Stores for supplier accounting and adjustment.
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
                        <h1 style={{ margin: 0, color: '#dc2626', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <RotateCcw size={28} color="#dc2626" /> Stores Purchase Return & Debit Note
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Return goods to suppliers with automatic inventory deduction and printable Debit Notes.
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
                            style={{ background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '700' }}
                        >
                            <Plus size={18} /> New Purchase Return
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
                    <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Return / Debit Note</label>
                        <Input 
                            type="text" 
                            placeholder="Return ID, Debit Note, GRN..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchReturns} style={{ background: '#dc2626', color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSelectedVendor(''); setSearchTerm(''); setTimeout(fetchReturns, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL RETURN RECORDS</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{returnsList.length}</div>
                        </div>
                        <RotateCcw size={32} color="#dc2626" opacity={0.3} />
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL RETURN VALUE</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>₹{totalReturnValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <AlertTriangle size={32} color="#dc2626" opacity={0.3} />
                    </div>
                </div>

                {/* Returns Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>Return ID</Th>
                                <Th>Debit Note No</Th>
                                <Th>GRN Number</Th>
                                <Th>Return Date</Th>
                                <Th>Vendor / Supplier</Th>
                                <Th>Reason</Th>
                                <Th style={{ textAlign: 'right' }}>Return Value</Th>
                                <Th style={{ textAlign: 'center' }}>Actions</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#dc2626' }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Loading Purchase Returns...</p>
                                    </Td>
                                </Tr>
                            ) : returnsList.length === 0 ? (
                                <Tr>
                                    <Td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No purchase returns found matching the filter criteria.
                                    </Td>
                                </Tr>
                            ) : (
                                returnsList.map(ret => (
                                    <Tr key={ret.return_id}>
                                        <Td style={{ fontWeight: '700', color: '#dc2626' }}>{ret.return_id}</Td>
                                        <Td style={{ fontWeight: '600', color: colors.primary }}>{ret.debit_note_no || 'N/A'}</Td>
                                        <Td>{ret.grn_number || 'N/A'}</Td>
                                        <Td>{ret.return_date}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '600' }}>{ret.vendor_name || ret.vendor_id}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {ret.vendor_id}</div>
                                        </Td>
                                        <Td>
                                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: '#fee2e2', color: '#dc2626' }}>
                                                {ret.return_reason || 'DAMAGED'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>
                                            ₹{parseFloat(ret.total_return_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <Button
                                                    onClick={() => setPreviewReturn(ret)}
                                                    style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Preview Debit Note"
                                                >
                                                    <Eye size={14} /> View
                                                </Button>
                                                <Button
                                                    onClick={() => handlePrintDebitNote(ret)}
                                                    style={{ padding: '6px 10px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                    title="Print Debit Note Template"
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

                {/* Create Return Modal */}
                {showCreateModal && (
                    <ModalOverlay style={{ zIndex: 1050 }}>
                        <ModalContainer style={{ maxWidth: '1000px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                                    <RotateCcw size={20} color="#dc2626" /> Create Return to Vendor (Debit Note)
                                </ModalTitle>
                                <CloseButton onClick={() => setShowCreateModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '24px', overflowY: 'auto' }}>
                                <form onSubmit={handleCreateReturn}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Select GRN to Return Against *</label>
                                            <ReactSelect 
                                                options={grnList.map(g => ({
                                                    value: g.grn_number,
                                                    label: `${g.grn_number} | Inv: ${g.invoice_no || 'N/A'} | Date: ${g.date || 'N/A'}`
                                                }))}
                                                value={grnList.map(g => ({
                                                    value: g.grn_number,
                                                    label: `${g.grn_number} | Inv: ${g.invoice_no || 'N/A'} | Date: ${g.date || 'N/A'}`
                                                })).find(opt => opt.value === formData.grn_number) || null}
                                                onChange={opt => handleGrnSelect(opt ? opt.value : '')}
                                                styles={customSelectStyles}
                                                menuPortalTarget={document.body}
                                                isSearchable
                                                isClearable
                                                placeholder="-- Choose GRN --"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Vendor</label>
                                            <Input type="text" readOnly value={formData.vendor_name || 'Select GRN'} style={{ width: '100%', background: '#f1f5f9' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Return Date *</label>
                                            <Input type="date" required value={formData.return_date} onChange={e => setFormData(prev => ({ ...prev, return_date: e.target.value }))} style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Primary Reason *</label>
                                            <Select value={formData.return_reason} onChange={e => setFormData(prev => ({ ...prev, return_reason: e.target.value }))} style={{ width: '100%' }}>
                                                <option value="DAMAGED">Damaged / Broken Goods</option>
                                                <option value="EXPIRED">Short Expiry / Expired</option>
                                                <option value="EXCESS">Excess Quantity Received</option>
                                                <option value="QUALITY_REJECTED">Quality Specification Rejected</option>
                                                <option value="OTHER">Other Reason</option>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* GRN Items Return Selection */}
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: `1px solid ${colors.border}`, marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700', color: '#dc2626' }}>Items in Selected GRN</h4>
                                        {formData.items.length === 0 ? (
                                            <p style={{ color: colors.textMuted, fontSize: '0.85rem', margin: 0 }}>Please select a GRN above to load items.</p>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <Table style={{ fontSize: '0.85rem' }}>
                                                    <thead>
                                                        <Tr>
                                                            <Th>#</Th>
                                                            <Th>Item Description</Th>
                                                            <Th>Batch</Th>
                                                            <Th style={{ textAlign: 'right' }}>Received Qty</Th>
                                                            <Th style={{ textAlign: 'right' }}>Unit Rate (₹)</Th>
                                                            <Th style={{ textAlign: 'right', width: '130px' }}>Return Qty</Th>
                                                            <Th style={{ textAlign: 'right' }}>Debit Amount (₹)</Th>
                                                        </Tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.items.map((it, idx) => (
                                                            <Tr key={idx}>
                                                                <Td>{idx + 1}</Td>
                                                                <Td style={{ fontWeight: '600' }}>{it.itemName}</Td>
                                                                <Td>{it.batch_no}</Td>
                                                                <Td style={{ textAlign: 'right' }}>{it.original_qty}</Td>
                                                                <Td style={{ textAlign: 'right' }}>₹{it.unit_price.toFixed(2)}</Td>
                                                                <Td style={{ textAlign: 'right' }}>
                                                                    <Input 
                                                                        type="number" 
                                                                        min="0" 
                                                                        max={it.original_qty}
                                                                        value={it.return_qty} 
                                                                        onChange={e => handleItemReturnQtyChange(idx, e.target.value)}
                                                                        style={{ width: '90px', textAlign: 'right', padding: '4px 8px' }}
                                                                    />
                                                                </Td>
                                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: it.total_return_amount > 0 ? '#dc2626' : colors.textMuted }}>
                                                                    ₹{it.total_return_amount.toFixed(2)}
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Remarks & Reason */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, display: 'block', marginBottom: '6px' }}>Return Notes / Remarks</label>
                                        <Input 
                                            type="text" 
                                            placeholder="e.g. Broken packaging / Leaking bottles observed upon inspection" 
                                            value={formData.remarks} 
                                            onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))} 
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <Button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#e2e8f0', color: colors.textMain, padding: '10px 20px', borderRadius: '8px', border: 'none' }}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} style={{ background: '#dc2626', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700' }}>
                                            {loading ? 'Processing...' : 'Submit Return & Issue Debit Note'}
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Printable Debit Note Preview Modal */}
                {previewReturn && (
                    <ModalOverlay style={{ zIndex: 1100 }}>
                        <ModalContainer style={{ maxWidth: '850px', width: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                                    <FileText size={20} color="#dc2626" /> Debit Note (Purchase Return) Preview
                                </ModalTitle>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Button onClick={() => handlePrintDebitNote(previewReturn)} style={{ background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                                        <Printer size={16} /> Print Debit Note
                                    </Button>
                                    <CloseButton onClick={() => setPreviewReturn(null)}><X size={20} /></CloseButton>
                                </div>
                            </ModalHeader>

                            <ModalBody style={{ padding: '32px', overflowY: 'auto', background: '#ffffff' }}>
                                <div id="printable-debit-note-document" style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '8px' }}>
                                    {/* Hospital Letterhead Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #dc2626', paddingBottom: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px 0', color: colors.primary, fontSize: '1.5rem', fontWeight: '800' }}>SHANMUGA HOSPITAL</h2>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textMuted }}>Central Stores & Pharmacy Division</p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: colors.textMuted }}>Salem - 636004, Tamil Nadu, India | Ph: +91 427 270 6666</p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: colors.textMuted }}>GSTIN: 33AAAAA0000A1Z5</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#dc2626' }}>DEBIT NOTE</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: colors.textMain, marginTop: '4px' }}>NO: {previewReturn.debit_note_no || previewReturn.return_id}</div>
                                            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '2px' }}>Date: {previewReturn.return_date}</div>
                                            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '2px' }}>Against GRN: <strong>{previewReturn.grn_number || 'N/A'}</strong></div>
                                        </div>
                                    </div>

                                    {/* Vendor Details */}
                                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>DEBIT TO SUPPLIER / VENDOR:</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '800', color: colors.textMain }}>{previewReturn.vendor_name || previewReturn.vendor_id}</div>
                                        <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Vendor ID: {previewReturn.vendor_id} | Reason: <strong>{previewReturn.return_reason}</strong></div>
                                    </div>

                                    {/* Returned Items Table */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ background: '#dc2626', color: '#ffffff' }}>
                                                <th style={{ padding: '8px 10px', textAlign: 'left' }}>#</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Description</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Batch No</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Returned Qty</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Rate (₹)</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Debit (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(previewReturn.items || []).map((it, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '8px 10px' }}>{idx + 1}</td>
                                                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{it.itemName || it.item_id}</td>
                                                    <td style={{ padding: '8px 10px' }}>{it.batch_no || '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>{it.return_qty || it.quantity}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{parseFloat(it.unit_price || it.rate || 0).toFixed(2)}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>₹{parseFloat(it.total_return_amount || (it.return_qty * it.unit_price) || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Total Summary */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                                        <div style={{ background: '#fef2f2', padding: '14px 20px', borderRadius: '8px', border: '1px solid #fecaca', minWidth: '280px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#dc2626' }}>
                                                <span>Total Debit Value:</span>
                                                <span>₹{parseFloat(previewReturn.total_return_amount || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                                        <div style={{ textAlign: 'center', width: '200px' }}>
                                            <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '4px' }}></div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>Stores Incharge</div>
                                        </div>
                                        <div style={{ textAlign: 'center', width: '200px' }}>
                                            <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '4px' }}></div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>Accounts Department</div>
                                        </div>
                                        <div style={{ textAlign: 'center', width: '200px' }}>
                                            <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '4px' }}></div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>Authorized Signatory</div>
                                        </div>
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

export default StoresPurchaseReturn;
