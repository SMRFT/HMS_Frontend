import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    SearchContainer,
    Input,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    InputWrapper,
    Label,
    FormRow,
    ButtonContainer,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors,
    SectionHeader
} from '../GlobalStyles';

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
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin: 20px 22px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${colors.primary};
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .label {
        font-size: 0.8rem;
        color: ${colors.textMuted};
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .value {
        font-size: 1.6rem;
        font-weight: 700;
        color: ${colors.textMain};
    }

    .sub-value {
        font-size: 0.75rem;
        color: ${colors.textMuted};
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const SummaryRow = ({ label, value, color }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px 15px', 
        borderBottom: `1px solid ${colors.primary}10`,
        fontSize: '0.9rem',
        fontWeight: '600'
    }}>
        <span style={{ color: colors.textMuted }}>{label}</span>
        <span style={{ color: color || colors.textMain }}>₹{(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
);

const StoresGRNReport = () => {
    const navigate = useNavigate();
    const [grns, setGrns] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const today = dayjs().format('YYYY-MM-DD');
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState(null);
    const [selectedGrnForApproval, setSelectedGrnForApproval] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_method: 'Cash',
        payment_details: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { 
        fetchGRNs(); 
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`, 'GET');
            if (response?.success) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
                setVendors(list);
            }
        } catch (error) {
            console.error("Error fetching general store vendors:", error);
        }
    };

    const fetchGRNs = async () => {
        setLoading(true);
        try {
            let url = `${getBaseUrl.replace(/\/$/, '')}/stores-grn/`;
            let method = 'GET';
            let data = null;

            if (fromDate || toDate) {
                // Now using the same main endpoint, but with POST
                method = 'POST';
                data = { from_date: fromDate, to_date: toDate };
            }

            const response = await apiRequest(url, method, data);
            if (response.success) setGrns(response.data);
        } finally {
            setLoading(false);
        }
    };

    const clearFilter = () => {
        setFromDate('');
        setToDate('');
        setTimeout(() => fetchGRNs(), 0);
    };

    const handleDelete = async (grnNumber, grn) => {
        if (grn?.is_approved) {
            alert("Approved GRNs cannot be deleted.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete GRN ${grnNumber}?`)) {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-grn/${grnNumber}/`, 'DELETE');
            if (response.success) fetchGRNs();
            else alert("Error deleting GRN");
        }
    };
    
    const handleApprove = (grn) => {
        setSelectedGrnForApproval(grn);
        setShowApproveModal(true);
    };

    const confirmFinalApproval = async () => {
        if (!selectedGrnForApproval) return;
        
        const payload = { 
            is_approved: true
        };

        // Frontend fix for Djongo JSON validation issues
        // We ensure JSON fields are actual arrays/objects, not strings
        // HEURISTIC: Only include them in payload if we detect they are "bad" (i.e. strings)
        // OR if they lack timestamps (which causes backend duplication)
        
        let needsItemsFix = typeof selectedGrnForApproval.items === 'string';
        if (needsItemsFix) {
            try { payload.items = JSON.parse(selectedGrnForApproval.items); } catch(e) { payload.items = []; }
        }

        let ps = selectedGrnForApproval.payment_status;
        if (typeof ps === 'string') {
            try { ps = JSON.parse(ps); } catch(e) { ps = []; }
        }
        
        // Fix for backend duplication: assign timestamps to any entries that lack them
        if (Array.isArray(ps)) {
            const hasNoTimestamps = ps.some(p => !p.timestamp);
            if (hasNoTimestamps || typeof selectedGrnForApproval.payment_status === 'string') {
                payload.payment_status = ps.map((p, idx) => ({
                    ...p,
                    timestamp: p.timestamp || new Date(Date.now() + idx).toISOString()
                }));
            }
        }

        setSubmitting(true);
        try {
            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${selectedGrnForApproval.grn_number}/`, 
                'PATCH', 
                payload
            );
            if (response.success) {
                alert(`GRN ${selectedGrnForApproval.grn_number} approved successfully.`);
                setShowApproveModal(false);
                fetchGRNs();
            } else {
                alert("Error approving GRN: " + (response.error?.message || "Unknown error"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportExcel = () => {
        const dataToExport = grns.map(grn => {
            const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
            return {
                "GRN Number": grn.grn_number,
                "Date": grn.date ? new Date(grn.date).toLocaleDateString('en-IN') : '-',
                "Category": grn.purchase_category,
                "Invoice No": grn.invoice_no,
                "Net Amount": netAmt.toFixed(2),
                "Total Paid": totalPaid.toFixed(2),
                "Pending Amount": pending.toFixed(2),
                "Status": latest.status,
                "Approved": grn.is_approved ? "Yes" : "No"
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GRN Report");
        XLSX.writeFile(workbook, `GRN_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrintTable = () => {
        const printContent = `
            <html>
                <head>
                    <title>GRN Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h2 { text-align: center; color: #333; }
                        .footer { margin-top: 20px; text-align: right; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Stores GRN Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>GRN No</th>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Invoice No</th>
                                <th>Net Amt</th>
                                <th>Paid</th>
                                <th>Pending</th>
                                <th>Status</th>
                                <th>Approved</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${grns.map(grn => {
                                const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
                                return `
                                    <tr>
                                        <td>${grn.grn_number}</td>
                                        <td>${grn.date ? new Date(grn.date).toLocaleDateString('en-IN') : '-'}</td>
                                        <td>${grn.purchase_category}</td>
                                        <td>${grn.invoice_no}</td>
                                        <td>₹${netAmt.toFixed(2)}</td>
                                        <td>₹${totalPaid.toFixed(2)}</td>
                                        <td>₹${pending.toFixed(2)}</td>
                                        <td>${latest.status}</td>
                                        <td>${grn.is_approved ? "Yes" : "No"}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div class="footer">Generated on: ${new Date().toLocaleString()}</div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const numberToWords = (num) => {
        const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const formatTenth = (n) => {
            if (n < 10) return single[n];
            if (n >= 10 && n < 20) return double[n - 10];
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
        };
        const formatHundred = (n) => {
            if (n > 99) return single[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + formatTenth(n % 100) : '');
            return formatTenth(n % 100);
        };
        if (num === 0) return 'Zero';
        let words = '';
        if (num >= 10000000) { words += formatHundred(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
        if (num >= 100000) { words += formatHundred(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
        if (num >= 1000) { words += formatHundred(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
        if (num > 0) words += formatHundred(num);
        return words.trim() + ' Only';
    };

    const handlePrintRow = (grn) => {
        const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
        
        let itemsArray = grn.items;
        if (typeof itemsArray === 'string') {
            try {
                // Try standard JSON parse
                itemsArray = JSON.parse(itemsArray);
            } catch (e) {
                // Fallback for Python-style OrderedDict string representations if they leak from backend
                try {
                    const cleaned = itemsArray.replace(/OrderedDict\(/g, '').replace(/\)/g, '');
                    itemsArray = JSON.parse(cleaned);
                } catch (e2) {
                    itemsArray = [];
                }
            }
        }
        if (!Array.isArray(itemsArray)) itemsArray = [];

        const printContent = `
            <html>
                <head>
                    <title>GRN Details - ${grn.grn_number}</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; font-size: 11px; }
                        .report-container { width: 100%; max-width: 800px; margin: 0 auto; }
                        
                        /* Header Styles */
                        .hospital-header { text-align: center; margin-bottom: 5px; }
                        .hospital-name { color: #1e3a8a; font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; }
                        .hospital-info { font-size: 11px; color: #4b5563; margin: 2px 0; }
                        
                        .report-title-box { 
                            border: 2px solid #38bdf8; 
                            background-color: #f0f9ff; 
                            text-align: center; 
                            padding: 8px; 
                            margin: 15px 0;
                            color: #1e3a8a;
                            font-weight: 800;
                            font-size: 14px;
                            letter-spacing: 1px;
                        }

                        /* Green Grid Sections */
                        .info-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr 1fr; 
                            border: 1.5px solid #38bdf8; 
                            margin-bottom: 20px;
                        }
                        .info-col { border-right: 1.5px solid #38bdf8; }
                        .info-col:last-child { border-right: none; }
                        .col-header { 
                            background-color: #f0f9ff; 
                            color: #1e3a8a; 
                            text-align: center; 
                            padding: 6px; 
                            font-weight: 700; 
                            border-bottom: 1.5px solid #38bdf8;
                            font-size: 12px;
                        }
                        .col-content { padding: 8px 12px; min-height: 80px; }
                        .info-row { display: flex; margin-bottom: 5px; line-height: 1.4; }
                        .info-label { font-weight: 600; width: 110px; color: #374151; }
                        .info-value { flex: 1; color: #111827; }

                        /* Table Styles */
                        .items-table { width: 100%; border-collapse: collapse; border: 1.5px solid #38bdf8; margin-bottom: 20px; }
                        .items-table th { 
                            background-color: #f0f9ff; 
                            color: #1e3a8a; 
                            border: 1px solid #38bdf8; 
                            padding: 8px 4px; 
                            font-weight: 800; 
                            text-align: center;
                            font-size: 10px;
                            text-transform: uppercase;
                        }
                        .items-table td { border: 1px solid #38bdf8; padding: 6px 4px; font-size: 10.5px; vertical-align: middle; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .item-name { font-weight: 700; color: #1e3a8a; }

                        /* Footer Layout */
                        .summary-container { display: flex; gap: 15px; margin-bottom: 15px; }
                        .gst-box { flex: 1.5; border: 1.5px solid #38bdf8; background-color: #f0f9ff; padding: 12px; }
                        .totals-box { flex: 1; border: 1.5px solid #38bdf8; }
                        
                        .gst-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 700; color: #1e3a8a; font-size: 12px; }
                        
                        .totals-row { display: flex; border-bottom: 1.5px solid #38bdf8; }
                        .totals-row:last-child { border-bottom: none; }
                        .totals-label { flex: 1; padding: 6px 10px; font-weight: 700; border-right: 1.5px solid #38bdf8; }
                        .totals-value { width: 100px; padding: 6px 10px; text-align: right; font-weight: 800; }
                        .net-amount { background-color: #f0f9ff; color: #1e3a8a; font-size: 13px; }

                        .words-box { border: 1.5px solid #38bdf8; background-color: #f0f9ff; padding: 8px 12px; margin-bottom: 60px; }
                        .words-label { color: #1e3a8a; font-weight: 700; margin-bottom: 4px; border-bottom: 1px solid #38bdf8; display: inline-block; padding-bottom: 2px; font-size: 12px; }
                        .words-value { font-weight: 800; font-size: 11px; }

                        .signature-section { display: flex; justify-content: space-between; padding: 0 20px; margin-top: 50px; }
                        .sig-box { text-align: center; width: 180px; }
                        .sig-line { border-top: 1px solid #94a3b8; margin-bottom: 6px; }
                        .sig-text { font-weight: 600; font-size: 11px; color: #475569; }

                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 5px;">
                            <span>${new Date().toLocaleDateString('en-IN')}, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>GRN Details - ${grn.grn_number}</span>
                        </div>

                        <div class="hospital-header">
                            <h1 class="hospital-name">SHANMUGA HOSPITAL LIMITED</h1>
                            <div class="hospital-info">51/24.Saradha College Road, Salem - 636007,,</div>
                            <div class="hospital-info">Phone : 04272706666, info@smrft.org</div>
                            <div class="hospital-info">GST Number : </div>
                        </div>

                        <div class="report-title-box">
                            GOODS RECEIPT NOTE - ${grn.grn_number}
                        </div>

                        <div class="info-grid">
                            <div class="info-col">
                                <div class="col-header">Basic Information</div>
                                <div class="col-content">
                                    <div class="info-row"><span class="info-label">Purchase Category :</span><span class="info-value">${grn.purchase_category || '-'}</span></div>
                                    <div class="info-row"><span class="info-label">Vendor :</span><span class="info-value">${getVendorName(grn.vendor_id)}</span></div>
                                    <div class="info-row"><span class="info-label">Date :</span><span class="info-value">${grn.date ? new Date(grn.date).toLocaleDateString('en-IN') : '-'}</span></div>
                                    <div class="info-row"><span class="info-label">Contact Person :</span><span class="info-value">${grn.contact_person || 'N/A'}</span></div>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="col-header">Invoice Information</div>
                                <div class="col-content">
                                    <div class="info-row"><span class="info-label">Invoice No :</span><span class="info-value">${grn.invoice_no || '-'}</span></div>
                                    <div class="info-row"><span class="info-label">Invoice Date :</span><span class="info-value">${grn.invoice_date ? new Date(grn.invoice_date).toLocaleDateString('en-IN') : '-'}</span></div>
                                    <div class="info-row"><span class="info-label">Payment Method :</span><span class="info-value">${grn.payment_mode || 'N/A'}</span></div>
                                    <div class="info-row"><span class="info-label">Payment Status :</span><span class="info-value">${latest.status || 'Not Paid'}</span></div>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="col-header">Order Details</div>
                                <div class="col-content">
                                    <div class="info-row"><span class="info-label">GRN Number :</span><span class="info-value">${grn.grn_number}</span></div>
                                    <div class="info-row"><span class="info-label">Phone :</span><span class="info-value">0427 2334807</span></div>
                                    <div class="info-row"><span class="info-label">Total Amount :</span><span class="info-value">₹${netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div class="info-row"><span class="info-label">Approved Date :</span><span class="info-value">${grn.is_approved ? new Date(grn.date).toLocaleDateString('en-IN') : '-'}</span></div>
                                </div>
                            </div>
                        </div>

                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th style="width: 30px;">Sl.</th>
                                    <th>Product</th>
                                    <th style="width: 50px;">HSN</th>
                                    <th style="width: 70px;">Batch</th>
                                    <th style="width: 40px;">Pack</th>
                                    <th style="width: 50px;">QTY</th>
                                    <th style="width: 60px;">P Rate</th>
                                    <th style="width: 60px;">P.cost</th>
                                    <th style="width: 60px;">MRP</th>
                                    <th style="width: 60px;">Discount</th>
                                    <th style="width: 70px;">Taxable Amount</th>
                                    <th style="width: 70px;">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsArray.map((item, idx) => {
                                    const qty = parseFloat(item.quantity || 0);
                                    const rate = parseFloat(item.unitPrice || item.purchaseRate || 0);
                                    const taxableAmt = parseFloat(item.taxableAmt || (rate * qty) - (item.discountedAmt || 0));
                                    const totalAmt = parseFloat(item.purchaseCost || item.itemValue || 0);
                                    return `
                                        <tr>
                                            <td class="text-center">${idx + 1}.</td>
                                            <td class="item-name">${item.name || item.itemName}</td>
                                            <td class="text-center">${item.hsn || '-'}</td>
                                            <td class="text-center">${item.batch || '-'}</td>
                                            <td class="text-center">${item.packing || '1'}</td>
                                            <td class="text-center">${item.quantity}</td>
                                            <td class="text-right">₹${rate.toFixed(2)}</td>
                                            <td class="text-right">₹${(rate * qty).toFixed(2)}</td>
                                            <td class="text-right">₹${(parseFloat(item.mrp) || 0).toFixed(2)}</td>
                                            <td class="text-right">₹${(parseFloat(item.discountedAmt) || 0).toFixed(2)}</td>
                                            <td class="text-right">₹${taxableAmt.toFixed(2)}</td>
                                            <td class="text-right">₹${totalAmt.toFixed(2)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr>
                                    <td colspan="10" class="text-right" style="font-weight: 800; background-color: #f8fafc; padding: 8px;">Total</td>
                                    <td colspan="2" class="text-right" style="font-weight: 800; background-color: #f8fafc; padding: 8px;">₹${netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="summary-container">
                            <div class="gst-box">
                                <div class="gst-row"><span>CGST Amount</span><span>: ₹${(parseFloat(grn.cgst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                <div class="gst-row"><span>SGST Amount</span><span>: ₹${(parseFloat(grn.sgst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                <div class="gst-row"><span>IGST Amount</span><span>: ₹${(parseFloat(grn.igst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            </div>
                            <div class="totals-box">
                                <div class="totals-row">
                                    <div class="totals-label">Total</div>
                                    <div class="totals-value">₹${(parseFloat(grn.total_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="totals-label">Discount</div>
                                    <div class="totals-value">₹${(parseFloat(grn.total_discount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="totals-label">Tax On Free</div>
                                    <div class="totals-value">₹${(parseFloat(grn.tax_on_free_items) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="totals-label">Round off</div>
                                    <div class="totals-value">₹${(parseFloat(grn.round_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div class="totals-row">
                                    <div class="totals-label">Total GST</div>
                                    <div class="totals-value">₹${(parseFloat(grn.cgst || 0) + parseFloat(grn.sgst || 0) + parseFloat(grn.igst || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div class="totals-row net-amount">
                                    <div class="totals-label">Net Amount</div>
                                    <div class="totals-value">₹${netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        <div class="words-box">
                            <div class="words-label">Amount In Words</div>
                            <div class="words-value">Rupees ${numberToWords(Math.round(netAmt))}</div>
                        </div>

                        <div class="signature-section">
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-text">Prepared By</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-text">Verified By</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-text">Authorized Signatory</div>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8;">
                            This is a computer-generated document.| ${new Date().toLocaleString('en-IN')}
                        </div>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const openPaymentModal = (grn) => {
        setSelectedGrn(grn);
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: grn.net_invoice_amount };
        setPaymentData({
            amount_paid: '',
            payment_method: 'Cash',
            payment_details: ''
        });
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const amountPaid = parseFloat(paymentData.amount_paid);
        if (isNaN(amountPaid) || amountPaid <= 0) { alert("Please enter a valid amount"); return; }

        let paymentArray = selectedGrn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }

        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: selectedGrn.net_invoice_amount };

        const currentPending = parseFloat(lastStatus.pending_amount) || 0;
        if (amountPaid > currentPending) {
            alert(`Amount (₹${amountPaid}) exceeds pending amount (₹${currentPending})!`);
            return;
        }

        const newPending = currentPending - amountPaid;
        const newRecord = {
            status: newPending <= 0 ? "Paid" : "Partially Paid",
            amount_paid: amountPaid,
            pending_amount: newPending,
            payment_method: paymentData.payment_method,
            payment_details: paymentData.payment_details,
            payment_date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        const updatedPaymentStatus = [...(paymentArray || []), newRecord];
        const currentTotalPaid = parseFloat(selectedGrn.total_amount_paid?.$numberDecimal || selectedGrn.total_amount_paid || 0);
        const updatedTotalPaid = currentTotalPaid + amountPaid;

        setSubmitting(true);
        try {
            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${selectedGrn.grn_number}/`,
                'PATCH',
                { payment_status: updatedPaymentStatus, total_amount_paid: updatedTotalPaid }
            );
            if (response.success) {
                setShowPaymentModal(false);
                fetchGRNs();
            } else {
                alert("Error updating payment: " + JSON.stringify(response.error));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getPaymentInfo = (grn) => {
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const latest = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { status: 'Not Paid', pending_amount: grn.net_invoice_amount };
        const totalPaid = parseFloat(grn.total_amount_paid?.$numberDecimal || grn.total_amount_paid || 0);
        const netAmt = parseFloat(grn.net_invoice_amount?.$numberDecimal || grn.net_invoice_amount || 0);
        const pending = parseFloat(latest.pending_amount) || 0;
        return { latest, totalPaid, netAmt, pending, paymentArray };
    };

    const getVendorName = (vendorId) => {
        if (!vendorId) return '-';
        if (!vendors || vendors.length === 0) return vendorId;
        const vendor = vendors.find(v => 
            String(v.vendor_id) === String(vendorId) || 
            String(v.id) === String(vendorId)
        );
        return vendor ? (vendor.name || vendor.vendorName || vendor.vendor_name || vendorId) : vendorId;
    };

    const getStatusBadge = (status) => {
        const colorMap = {
            'Paid': { bg: '#f0fdf4', color: '#166534' },
            'Partially Paid': { bg: '#fffbeb', color: '#92400e' },
            'Not Paid': { bg: '#fff5f5', color: '#b91c1c' },
        };
        const style = colorMap[status] || colorMap['Not Paid'];
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                backgroundColor: style.bg, color: style.color, border: `1px solid ${style.bg}`,
                whiteSpace: 'nowrap', textTransform: 'uppercase'
            }}>{status}</span>
        );
    };

    const getPendingInfo = (grn) => {
        const { latest } = getPaymentInfo(grn);
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: grn.net_invoice_amount };
        return parseFloat(lastStatus.pending_amount) || 0;
    };

    const getTotalStats = () => {
        const stats = grns.reduce((acc, grn) => {
            const { netAmt, pending } = getPaymentInfo(grn);
            acc.totalNet += netAmt;
            acc.totalPending += pending;
            return acc;
        }, { totalNet: 0, totalPending: 0 });
        
        return stats;
    };

    const stats = getTotalStats();

    return (
        <PageWrapper>
            <Container>
                {/* Header Section */}
                <div style={{
                    background: '#ffffff',
                    padding: '24px 40px',
                    borderBottom: `2px solid ${colors.primary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: colors.textMain }}>Stores GRN Report</h1>
                        <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>Comprehensive view of your goods receipt inventory</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button 
                            secondary
                            onClick={handleExportExcel}
                            style={{ 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            📊 Export Excel
                        </Button>
                        <Button
                            onClick={() => navigate('/StoresGRNGeneration', { state: { fromAnalysis: true } })}
                            style={{ 
                                background: colors.primary,
                                color: 'white', 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            + New GRN
                        </Button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <StatsGrid>
                    <StatsCard>
                        <div className="label">Total Invoices</div>
                        <div className="value">{grns.length}</div>
                        <div className="sub-value">Current Period</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Net Total Value</div>
                        <div className="value">₹{stats.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div className="sub-value" style={{ color: colors.primary }}>Across all categories</div>
                    </StatsCard>
                    <StatsCard trend="down">
                        <div className="label">Total Outstanding</div>
                        <div className="value" style={{ color: stats.totalPending > 0 ? '#dc2626' : '#16a34a' }}>
                            ₹{stats.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="sub-value">Pending Payments</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Approved GRNs</div>
                        <div className="value">{grns.filter(g => g.is_approved).length}</div>
                        <div className="sub-value" style={{ color: '#0d9488' }}>🛡️ Verified Records</div>
                    </StatsCard>
                </StatsGrid>

                {/* Filter Card */}
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#1e3a8a', // Dark blue selection circle
                            borderRadius: 12,
                            colorLink: '#1e3a8a',
                            colorLinkHover: '#2563eb',
                        },
                        components: {
                            DatePicker: {
                                headerBg: '#1e3a8a', // Matching image header
                                headerColor: '#ffffff',
                                colorIcon: '#ffffff', // For arrows in header
                                colorTextHeading: '#ffffff', // For month/year text
                                colorPrimary: '#1e3a8a', // For selection circle
                            }
                        }
                    }}
                >
                    <CalendarGlobalStyles />
                    <div style={{
                        background: 'white', 
                        margin: '20px 22px 0', 
                        padding: '24px', 
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: colors.textMuted, fontWeight: '700', pointerEvents: 'none', fontSize: '0.85rem' }}>From</span>
                                    <DatePicker 
                                        value={fromDate ? dayjs(fromDate) : null}
                                        onChange={(d) => setFromDate(d ? d.format('YYYY-MM-DD') : '')}
                                        format="DD/MM/YYYY"
                                        placeholder="17/03/2026"
                                        suffixIcon={null}
                                        allowClear={false}
                                        style={{ 
                                            width: '210px', 
                                            padding: '10px 15px 10px 68px', 
                                            borderRadius: '12px', 
                                            border: `1.5px solid ${colors.border}`,
                                            height: '48px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}
                                    />
                                    {fromDate && (
                                        <span 
                                            onClick={() => setFromDate('')} 
                                            style={{ 
                                                cursor: 'pointer', 
                                                position: 'absolute', 
                                                right: '12px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)', 
                                                background: colors.primary, 
                                                color: 'white', 
                                                borderRadius: '50%', 
                                                width: '18px', 
                                                height: '18px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '10px'
                                            }}
                                        >
                                            ✕
                                        </span>
                                    )}
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: colors.textMuted, fontWeight: '700', pointerEvents: 'none', fontSize: '0.85rem' }}>To</span>
                                    <DatePicker 
                                        value={toDate ? dayjs(toDate) : null}
                                        onChange={(d) => setToDate(d ? d.format('YYYY-MM-DD') : '')}
                                        format="DD/MM/YYYY"
                                        placeholder="17/03/2026"
                                        suffixIcon={null}
                                        allowClear={false}
                                        style={{ 
                                            width: '210px', 
                                            padding: '10px 15px 10px 48px', 
                                            borderRadius: '12px', 
                                            border: `1.5px solid ${colors.border}`,
                                            height: '48px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}
                                    />
                                    {toDate && (
                                        <span 
                                            onClick={() => setToDate('')} 
                                            style={{ 
                                                cursor: 'pointer', 
                                                position: 'absolute', 
                                                right: '12px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)', 
                                                background: colors.primary, 
                                                color: 'white', 
                                                borderRadius: '50%', 
                                                width: '18px', 
                                                height: '18px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '10px'
                                            }}
                                        >
                                            ✕
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button 
                                    onClick={fetchGRNs} 
                                    style={{ padding: '10px 24px', borderRadius: '8px', height: '48px' }}
                                >
                                    🔍 Search
                                </Button>
                                <Button 
                                    secondary 
                                    onClick={clearFilter} 
                                    style={{ padding: '10px 24px', borderRadius: '8px', height: '48px' }}
                                >
                                    ✕ Clear
                                </Button>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Total Documents</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.primary }}>{grns.length}</div>
                            </div>
                        </div>
                    </div>
                </ConfigProvider>

                {/* Table Section */}
                <div style={{ padding: '0 22px 40px' }}>
                    <div style={{ 
                        background: 'white',
                        borderRadius: '20px', 
                        overflow: 'hidden', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th style={{ background: colors.tabBg, color: colors.textMain }}>GRN Details</Th>
                                        <Th style={{ background: colors.tabBg, color: colors.textMain }}>Vendor & Category</Th>
                                        <Th style={{ background: colors.tabBg, color: colors.textMain }}>Financials</Th>
                                        <Th style={{ background: colors.tabBg, color: colors.textMain }}>Status</Th>
                                        <Th style={{ background: colors.tabBg, color: colors.textMain, textAlign: 'center' }}>Actions</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>
                                            <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</div>
                                            <div style={{ color: colors.textMuted, marginTop: '20px', fontWeight: '700', fontSize: '1.1rem' }}>Updating Records...</div>
                                        </Td></Tr>
                                    ) : grns.length === 0 ? (
                                        <Tr><Td colSpan="5" style={{ textAlign: 'center', padding: '120px' }}>
                                            <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '20px' }}>📦</div>
                                            <div style={{ color: colors.textMuted, fontSize: '1.4rem', fontWeight: '800' }}>No GRNs found</div>
                                            <div style={{ color: colors.textMuted, marginTop: '8px', fontSize: '0.9rem' }}>Try adjusting your date filters</div>
                                            <Button secondary onClick={clearFilter} style={{ marginTop: '30px', borderRadius: '12px', padding: '12px 30px' }}>Reset Filters</Button>
                                        </Td></Tr>
                                    ) : grns.map(grn => {
                                        const { latest, totalPaid, netAmt, pending } = getPaymentInfo(grn);
                                        return (
                                            <Tr key={grn.grn_number}>
                                                <Td style={{ fontWeight: '600', color: colors.primary }}>{grn.grn_number}</Td>
                                                <Td>
                                                    <div style={{ fontWeight: '600', color: colors.textMain }}>{getVendorName(grn.vendor_id)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{grn.purchase_category} • {grn.date ? dayjs(grn.date).format('DD MMM, YYYY') : '-'}</div>
                                                </Td>
                                                <Td>
                                                    <div style={{ fontWeight: '700', color: colors.textMain }}>₹{netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                                    {pending > 0 && <div style={{ fontSize: '0.8rem', color: colors.danger, fontWeight: '600' }}>Outstanding: ₹{pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>}
                                                </Td>
                                                <Td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {getStatusBadge(latest.status)}
                                                        {grn.is_approved && <span style={{ fontSize: '0.65rem', color: colors.primary, fontWeight: '700' }}>VERIFIED</span>}
                                                    </div>
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <Button 
                                                            small 
                                                            onClick={() => !grn.is_approved && handleApprove(grn)} 
                                                            title={grn.is_approved ? "Already Approved" : "Approve"}
                                                            disabled={grn.is_approved}
                                                            style={{ opacity: grn.is_approved ? 0.4 : 1, cursor: grn.is_approved ? 'not-allowed' : 'pointer' }}
                                                        >✅</Button>
                                                        <Button small secondary onClick={() => { setSelectedGrn(grn); setShowPaymentModal(true); }} title="Payment">💳</Button>
                                                        <Button 
                                                            small 
                                                            secondary 
                                                            onClick={() => !grn.is_approved && navigate('/StoresGRNGeneration', { state: { editGrn: grn, fromAnalysis: true } })} 
                                                            title={grn.is_approved ? "Cannot edit verified GRN" : "Edit"}
                                                            disabled={grn.is_approved}
                                                            style={{ opacity: grn.is_approved ? 0.4 : 1, cursor: grn.is_approved ? 'not-allowed' : 'pointer' }}
                                                        >✏️</Button>
                                                        <Button small secondary onClick={() => handlePrintRow(grn)} title="Print">🖨️</Button>
                                                        <Button 
                                                            small 
                                                            danger 
                                                            onClick={() => !grn.is_approved && handleDelete(grn.grn_number, grn)} 
                                                            title={grn.is_approved ? "Cannot delete verified GRN" : "Delete"}
                                                            disabled={grn.is_approved}
                                                            style={{ opacity: grn.is_approved ? 0.4 : 1, cursor: grn.is_approved ? 'not-allowed' : 'pointer' }}
                                                        >🗑️</Button>
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Payment Modal */}
            {showPaymentModal && selectedGrn && (() => {
                let paymentArray = selectedGrn.payment_status;
                if (typeof paymentArray === 'string') {
                    try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
                }
                const lastStatus = paymentArray && paymentArray.length > 0
                    ? paymentArray[paymentArray.length - 1]
                    : { pending_amount: selectedGrn.net_invoice_amount };
                const pendingAmt = parseFloat(lastStatus.pending_amount) || 0;
                const totalPaid = parseFloat(selectedGrn.total_amount_paid?.$numberDecimal || selectedGrn.total_amount_paid || 0);
                const netAmt = parseFloat(selectedGrn.net_invoice_amount?.$numberDecimal || selectedGrn.net_invoice_amount || 0);

                return (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && setShowPaymentModal(false)}>
                        <ModalContainer style={{ maxWidth: '500px' }}>
                            <ModalHeader>
                                <ModalTitle>💳 Make Payment</ModalTitle>
                                <CloseButton onClick={() => setShowPaymentModal(false)}>✕</CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                {/* GRN Summary */}
                                <div style={{
                                    background: `linear-gradient(135deg, #f0fdfa, #e0f2fe)`,
                                    borderRadius: '8px', padding: '14px', marginBottom: '18px',
                                    border: `1px solid ${colors.border}`
                                }}>
                                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '10px', color: colors.primary }}>
                                        {selectedGrn.grn_number}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Net Amount</div>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>₹{netAmt.toFixed(2)}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Total Paid</div>
                                            <div style={{ fontWeight: '700', color: '#16a34a' }}>₹{totalPaid.toFixed(2)}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Pending</div>
                                            <div style={{ fontWeight: '700', color: '#dc2626' }}>₹{pendingAmt.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment History */}
                                {paymentArray && paymentArray.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
                                            Payment History ({paymentArray.filter(p => (parseFloat(p.amount_paid) || 0) > 0).length} entries)
                                        </div>
                                        <div style={{ maxHeight: '100px', overflowY: 'auto', border: `1px solid ${colors.border}`, borderRadius: '6px' }}>
                                            {paymentArray.filter(p => (parseFloat(p.amount_paid) || 0) > 0).map((p, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    padding: '5px 10px', fontSize: '0.78rem',
                                                    borderBottom: i < paymentArray.length - 1 ? `1px solid ${colors.border}` : 'none',
                                                    background: i % 2 === 0 ? '#f8fafc' : 'white'
                                                }}>
                                                    <span>{p.payment_date || 'N/A'}</span>
                                                    <span style={{ color: '#16a34a', fontWeight: '600' }}>+₹{p.amount_paid}</span>
                                                    <span style={{ color: '#dc2626' }}>Pending: ₹{p.pending_amount}</span>
                                                    <span style={{ color: colors.textMuted }}>{p.payment_method}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Form */}
                                <form onSubmit={handlePaymentSubmit}>
                                    <FormRow style={{ flexDirection: 'column', gap: '12px' }}>
                                        <InputWrapper>
                                            <Label required>Amount to Pay (Max: ₹{pendingAmt.toFixed(2)})</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={pendingAmt}
                                                value={paymentData.amount_paid}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val > pendingAmt) {
                                                        setPaymentData({ ...paymentData, amount_paid: pendingAmt.toString() });
                                                    } else {
                                                        setPaymentData({ ...paymentData, amount_paid: e.target.value });
                                                    }
                                                }}
                                                required
                                                placeholder={`Enter amount (max ₹${pendingAmt.toFixed(2)})`}
                                            />
                                        </InputWrapper>
                                        <InputWrapper>
                                            <Label required>Payment Method</Label>
                                            <select
                                                style={{
                                                    padding: '5px 10px', border: `1px solid ${colors.border}`,
                                                    borderRadius: '6px', fontSize: '0.82rem', outline: 'none'
                                                }}
                                                value={paymentData.payment_method}
                                                onChange={e => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="UPI">UPI</option>
                                            </select>
                                        </InputWrapper>
                                        <InputWrapper>
                                            <Label>Reference / Cheque No</Label>
                                            <Input
                                                value={paymentData.payment_details}
                                                onChange={e => setPaymentData({ ...paymentData, payment_details: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </InputWrapper>
                                    </FormRow>

                                    <ButtonContainer style={{ paddingTop: '14px', gap: '10px', justifyContent: 'flex-end' }}>
                                        <Button type="button" secondary onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                                        <Button type="submit" success disabled={submitting}>
                                            {submitting ? 'Processing...' : '✅ Submit Payment'}
                                        </Button>
                                    </ButtonContainer>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                );
            })()}

            {/* Approval Modal */}
            {showApproveModal && selectedGrnForApproval && (() => {
                let itemsArray = selectedGrnForApproval.items;
                if (typeof itemsArray === 'string') {
                    try { itemsArray = JSON.parse(itemsArray); } catch(e) { itemsArray = []; }
                }
                if (!Array.isArray(itemsArray)) itemsArray = [];

                const netAmt = parseFloat(selectedGrnForApproval.net_invoice_amount?.$numberDecimal || selectedGrnForApproval.net_invoice_amount || 0);
                
                return (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && setShowApproveModal(false)}>
                        <ModalContainer style={{ maxWidth: '1000px', width: '95%' }}>
                            <ModalHeader style={{ background: colors.primary }}>
                                <ModalTitle style={{ color: 'white' }}>📋 Verify & Approve GRN: {selectedGrnForApproval.grn_number}</ModalTitle>
                                <CloseButton style={{ color: 'white' }} onClick={() => setShowApproveModal(false)}>✕</CloseButton>
                            </ModalHeader>
                            <ModalBody style={{ padding: '20px' }}>
                                {/* Items Table */}
                                <div style={{ border: `1.5px solid ${colors.primary}40`, borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f0fdfa', borderBottom: `2px solid ${colors.primary}40` }}>
                                                <th style={{ padding: '10px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}20` }}>SL.</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'left', borderRight: `1px solid ${colors.primary}20` }}>PRODUCT</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}20` }}>HSN</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}20` }}>BATCH</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}20` }}>PACK</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}20` }}>QTY</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>P RATE</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>P.COST</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>MRP</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>DISCOUNT</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>TAXABLE</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right' }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemsArray.map((item, idx) => {
                                                const qty = parseFloat(item.quantity || 0);
                                                const rate = parseFloat(item.unitPrice || item.purchaseRate || 0);
                                                const taxableAmt = parseFloat(item.taxableAmt || (rate * qty) - (item.discountedAmt || 0));
                                                const totalAmt = parseFloat(item.purchaseCost || item.itemValue || 0);
                                                return (
                                                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.primary}10`, background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}10` }}>{idx + 1}.</td>
                                                        <td style={{ padding: '8px 5px', fontWeight: '600', color: colors.primary, borderRight: `1px solid ${colors.primary}10` }}>{item.name || item.itemName}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}10` }}>{item.hsn || '-'}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}10` }}>{item.batch || '-'}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center', borderRight: `1px solid ${colors.primary}10` }}>{item.packing || '1'}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center', fontWeight: '700', borderRight: `1px solid ${colors.primary}10` }}>{item.quantity}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}10` }}>₹{rate.toFixed(2)}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}10` }}>₹{(rate * qty).toFixed(2)}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}10` }}>₹{(parseFloat(item.mrp) || 0).toFixed(2)}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', color: colors.danger, borderRight: `1px solid ${colors.primary}10` }}>₹{(parseFloat(item.discountedAmt) || 0).toFixed(2)}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', borderRight: `1px solid ${colors.primary}10` }}>₹{taxableAmt.toFixed(2)}</td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'right', fontWeight: '700' }}>₹{totalAmt.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#f0fdfa', fontWeight: '800' }}>
                                                <td colSpan="11" style={{ padding: '10px 15px', textAlign: 'right', borderRight: `1px solid ${colors.primary}20` }}>Total</td>
                                                <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    {/* Left: GST Summary */}
                                    <div style={{ flex: '1.2', background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: `1.5px solid ${colors.primary}20` }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: colors.primary }}>
                                                <span>CGST Amount</span>
                                                <span>: ₹{(parseFloat(selectedGrnForApproval.cgst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: colors.primary }}>
                                                <span>SGST Amount</span>
                                                <span>: ₹{(parseFloat(selectedGrnForApproval.sgst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: colors.primary }}>
                                                <span>IGST Amount</span>
                                                <span>: ₹{(parseFloat(selectedGrnForApproval.igst) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Net Summary */}
                                    <div style={{ flex: '1', border: `1.5px solid ${colors.primary}20`, borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <SummaryRow label="Total" value={parseFloat(selectedGrnForApproval.total_amount) || 0} />
                                            <SummaryRow label="Discount" value={parseFloat(selectedGrnForApproval.total_discount) || 0} color={colors.danger} />
                                            <SummaryRow label="Tax On Free" value={parseFloat(selectedGrnForApproval.tax_on_free_items) || 0} />
                                            <SummaryRow label="Round off" value={parseFloat(selectedGrnForApproval.round_amount) || 0} />
                                            <SummaryRow 
                                                label="Total GST" 
                                                value={parseFloat(selectedGrnForApproval.cgst || 0) + parseFloat(selectedGrnForApproval.sgst || 0) + parseFloat(selectedGrnForApproval.igst || 0)} 
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f0fdfa', fontWeight: '800', fontSize: '1.2rem', color: colors.primary }}>
                                                <span>Net Amount</span>
                                                <span>₹{netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '25px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                                    <Button secondary onClick={() => setShowApproveModal(false)} style={{ padding: '10px 25px' }}>Cancel</Button>
                                    <Button 
                                        onClick={confirmFinalApproval} 
                                        disabled={submitting}
                                        style={{ background: '#16a34a', color: 'white', padding: '10px 35px', fontSize: '1rem' }}
                                    >
                                        {submitting ? 'Approving...' : '🚀 Confirm & Approve'}
                                    </Button>
                                </div>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                );
            })()}
        </PageWrapper>
    );
};

export default StoresGRNReport;
