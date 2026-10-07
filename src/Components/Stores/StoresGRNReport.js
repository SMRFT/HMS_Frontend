import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { 
    Pencil, CheckCheck, CreditCard, Printer, Trash2, 
    MoreVertical, Eye
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import TablePagination, { usePagination } from './TablePagination';
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

const GRNActionPopover = ({
    grn,
    anchorEl,
    onClose,
    onView,
    onEdit,
    onApprove,
    onPayment,
    onPrint,
    onDelete
}) => {
    const isApproved = !!grn.is_approved;
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const popoverWidth = 320;
            let targetLeft = rect.right - popoverWidth + window.scrollX;
            if (targetLeft < 10) {
                targetLeft = Math.max(10, rect.left + window.scrollX);
            }
            setPos({
                top: rect.bottom + window.scrollY + 6,
                left: targetLeft,
            });
        }
    }, [anchorEl]);

    const items = [
        {
            icon: <Eye size={18} strokeWidth={1.8} />,
            label: "View",
            color: "#0284c7",
            disabled: false,
            title: "View GRN Details",
            onClick: onView,
        },
        {
            icon: <Pencil size={18} strokeWidth={1.8} />,
            label: "Edit",
            color: "#0d9488",
            disabled: isApproved,
            title: isApproved ? "Cannot edit verified GRN" : "Edit GRN",
            onClick: onEdit,
        },
        {
            icon: <Trash2 size={18} strokeWidth={1.8} />,
            label: "Cancel",
            color: "#ef4444",
            disabled: isApproved,
            title: isApproved ? "Cannot delete verified GRN" : "Delete GRN",
            onClick: onDelete,
        },
        {
            icon: <CreditCard size={18} strokeWidth={1.8} />,
            label: "Payment",
            color: "#0284c7",
            disabled: false,
            title: "Record Payment",
            onClick: onPayment,
        },
        {
            icon: <Printer size={18} strokeWidth={1.8} />,
            label: "Print",
            color: "#7c3aed",
            disabled: false,
            title: "Print GRN Voucher",
            onClick: onPrint,
        },
        {
            icon: <CheckCheck size={18} strokeWidth={1.8} />,
            label: isApproved ? "Verified" : "Confirm",
            color: isApproved ? "#10b981" : "#ea580c",
            disabled: isApproved,
            title: isApproved ? "Already Approved" : "Approve GRN",
            onClick: onApprove,
        },
    ];

    const popover = (
        <div
            className="grn-action-popover"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "8px 10px",
                zIndex: 99999,
                minWidth: 320,
                boxShadow: "0 12px 35px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.04)",
                animation: "fadeIn 0.15s ease-out"
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 3,
                }}
            >
                {items.map((item, ii) => (
                    <button
                        key={ii}
                        disabled={item.disabled}
                        title={item.title || item.label}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            if (!item.disabled) {
                                item.onClick();
                            }
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 5,
                            padding: "8px 2px",
                            border: "1px solid transparent",
                            borderRadius: 8,
                            background: "none",
                            cursor: item.disabled ? "not-allowed" : "pointer",
                            opacity: item.disabled ? 0.35 : 1,
                            transition: "all 0.12s ease",
                            color: item.color,
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled) {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.borderColor = "transparent";
                        }}
                    >
                        {item.icon}
                        <span
                            style={{
                                fontSize: "0.72rem",
                                fontWeight: "500",
                                color: item.disabled ? "#94a3b8" : "#475569",
                                lineHeight: 1.2,
                                textAlign: "center",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return createPortal(popover, document.body);
};

const StoresGRNReport = () => {
    const navigate = useNavigate();
    const [grns, setGrns] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [openPopover, setOpenPopover] = useState(null);
    const [popoverData, setPopoverData] = useState(null);
    const anchorRefs = useRef({});

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState(null);
    const [selectedGrnForApproval, setSelectedGrnForApproval] = useState(null);
    const [selectedGrnForView, setSelectedGrnForView] = useState(null);
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

    useEffect(() => {
        const handleDocClick = (e) => {
            if (e.target.closest('.grn-action-popover-wrap') || e.target.closest('.grn-action-popover')) {
                return;
            }
            setOpenPopover(null);
            setPopoverData(null);
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
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
        setFromDate(oneMonthAgo);
        setToDate(today);
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
            String(v.id) === String(vendorId) ||
            String(v.vendor_code) === String(vendorId) ||
            String(v.code) === String(vendorId)
        );
        return vendor ? (vendor.vendor_name || vendor.name || vendor.vendorName || vendor.vendor_id || vendorId) : vendorId;
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

    const filteredGrns = grns.filter(grn => {
        const vName = getVendorName(grn.vendor_id)?.toLowerCase() || '';
        const grnNo = (grn.grn_number || '').toLowerCase();
        const invNo = (grn.invoice_no || '').toLowerCase();
        const cat = (grn.purchase_category || '').toLowerCase();
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || vName.includes(q) || grnNo.includes(q) || invNo.includes(q) || cat.includes(q);

        if (!matchesSearch) return false;
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'APPROVED') return !!grn.is_approved;
        if (filterStatus === 'UNAPPROVED') return !grn.is_approved;
        const { latest } = getPaymentInfo(grn);
        if (filterStatus === 'PAID') return latest.status === 'Paid';
        if (filterStatus === 'PENDING') return latest.status !== 'Paid';
        return true;
    });

    const {
        currentPage,
        pageSize,
        totalPages,
        pageData,
        goTo,
        handlePageSizeChange,
        startIdx,
        totalItems
    } = usePagination(filteredGrns, 15);

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
                                        value={fromDate ? dayjs(fromDate) : dayjs(oneMonthAgo)}
                                        onChange={(d) => d && setFromDate(d.format('YYYY-MM-DD'))}
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
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: colors.textMuted, fontWeight: '700', pointerEvents: 'none', fontSize: '0.85rem' }}>To</span>
                                    <DatePicker 
                                        value={toDate ? dayjs(toDate) : dayjs(today)}
                                        onChange={(d) => d && setToDate(d.format('YYYY-MM-DD'))}
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
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="Search GRN, Vendor, Invoice..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        border: `1.5px solid ${colors.border}`,
                                        height: '48px',
                                        minWidth: '220px',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                                <Button 
                                    onClick={fetchGRNs} 
                                    style={{ padding: '10px 20px', borderRadius: '8px', height: '48px' }}
                                >
                                    🔍 Search
                                </Button>
                                <Button 
                                    secondary 
                                    onClick={clearFilter} 
                                    style={{ padding: '10px 18px', borderRadius: '8px', height: '48px' }}
                                >
                                    ✕ Reset
                                </Button>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Total / Filtered</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.primary }}>{filteredGrns.length} / {grns.length}</div>
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
                                    <Tr style={{ background: '#e6f4f1' }}>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>#</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>GRN NO</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>DATE</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>VENDOR</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>CATEGORY</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>INVOICE NO</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>INVOICE DATE</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>PAYMENT</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>NET AMOUNT</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>STATUS</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px', textAlign: 'center' }}>ACTIONS</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="11" style={{ textAlign: 'center', padding: '100px' }}>
                                            <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</div>
                                            <div style={{ color: colors.textMuted, marginTop: '20px', fontWeight: '700', fontSize: '1.1rem' }}>Updating Records...</div>
                                        </Td></Tr>
                                    ) : filteredGrns.length === 0 ? (
                                        <Tr><Td colSpan="11" style={{ textAlign: 'center', padding: '120px' }}>
                                            <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '20px' }}>📦</div>
                                            <div style={{ color: colors.textMuted, fontSize: '1.4rem', fontWeight: '800' }}>No GRNs found</div>
                                            <div style={{ color: colors.textMuted, marginTop: '8px', fontSize: '0.9rem' }}>Try adjusting your search or date filters</div>
                                            <Button secondary onClick={clearFilter} style={{ marginTop: '30px', borderRadius: '12px', padding: '12px 30px' }}>Reset Filters</Button>
                                        </Td></Tr>
                                    ) : pageData.map((grn, idx) => {
                                        const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
                                        const serialNo = startIdx + idx + 1;
                                        return (
                                            <Tr key={grn.grn_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <Td style={{ color: '#64748b', fontWeight: '600', fontSize: '0.84rem', padding: '12px 10px' }}>
                                                    {serialNo}
                                                </Td>
                                                <Td style={{ padding: '12px 10px' }}>
                                                    <span style={{ 
                                                        background: '#dcfce7', 
                                                        color: '#15803d', 
                                                        fontWeight: '700', 
                                                        fontSize: '0.78rem', 
                                                        padding: '3px 10px', 
                                                        borderRadius: '16px', 
                                                        display: 'inline-block', 
                                                        letterSpacing: '0.02em',
                                                        border: '1px solid #bbf7d0'
                                                    }}>
                                                        {grn.grn_number}
                                                    </span>
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    {grn.date ? dayjs(grn.date).format('YYYY-MM-DD') : '-'}
                                                </Td>
                                                <Td style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.82rem', padding: '12px 10px' }}>
                                                    {getVendorName(grn.vendor_id)}
                                                </Td>
                                                <Td style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', padding: '12px 10px' }}>
                                                    {grn.purchase_category || '-'}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '500', padding: '12px 10px' }}>
                                                    {grn.invoice_no || grn.invoice_number || '-'}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    {grn.invoice_date ? dayjs(grn.invoice_date).format('YYYY-MM-DD') : (grn.date ? dayjs(grn.date).format('YYYY-MM-DD') : '-')}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', padding: '12px 10px' }}>
                                                    {grn.payment_mode || (latest && latest.payment_method) || 'CHEQUE'}
                                                </Td>
                                                <Td style={{ color: '#0f766e', fontWeight: '800', fontSize: '0.85rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    ₹{netAmt.toFixed(2)}
                                                </Td>
                                                <Td style={{ padding: '12px 10px' }}>
                                                    <span style={{ 
                                                        background: grn.is_approved ? '#ecfdf5' : '#fffbeb', 
                                                        color: grn.is_approved ? '#059669' : '#d97706', 
                                                        border: `1px solid ${grn.is_approved ? '#a7f3d0' : '#fde68a'}`, 
                                                        padding: '3px 9px', 
                                                        borderRadius: '6px', 
                                                        fontWeight: '700', 
                                                        fontSize: '0.74rem',
                                                        display: 'inline-block'
                                                    }}>
                                                        {grn.is_approved ? 'Verified' : 'Pending'}
                                                    </span>
                                                </Td>
                                                <Td style={{ textAlign: 'center', padding: '12px 10px' }}>
                                                    <div className="grn-action-popover-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                                                        <button
                                                            ref={(el) => { anchorRefs.current[grn.grn_number] = el; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (openPopover === grn.grn_number) {
                                                                    setOpenPopover(null);
                                                                    setPopoverData(null);
                                                                } else {
                                                                    setOpenPopover(grn.grn_number);
                                                                    setPopoverData(grn);
                                                                }
                                                            }}
                                                            style={{
                                                                background: openPopover === grn.grn_number ? '#f0fdfa' : '#ffffff',
                                                                border: openPopover === grn.grn_number ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                                                                borderRadius: '8px',
                                                                padding: '5px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: openPopover === grn.grn_number ? '#0d9488' : '#334155',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            <span>Action</span>
                                                            <MoreVertical size={13} style={{ opacity: 0.7 }} />
                                                        </button>

                                                        {openPopover === grn.grn_number && popoverData && (
                                                            <GRNActionPopover
                                                                grn={popoverData}
                                                                anchorEl={anchorRefs.current[grn.grn_number]}
                                                                onClose={() => { setOpenPopover(null); setPopoverData(null); }}
                                                                onView={() => { setOpenPopover(null); setSelectedGrnForView(popoverData); setShowViewModal(true); }}
                                                                onApprove={() => { setOpenPopover(null); handleApprove(popoverData); }}
                                                                onPayment={() => { setOpenPopover(null); setSelectedGrn(popoverData); setShowPaymentModal(true); }}
                                                                onEdit={() => { setOpenPopover(null); navigate('/StoresGRNGeneration', { state: { editGrn: popoverData, fromAnalysis: true } }); }}
                                                                onPrint={() => { setOpenPopover(null); handlePrintRow(popoverData); }}
                                                                onDelete={() => { setOpenPopover(null); handleDelete(popoverData.grn_number, popoverData); }}
                                                            />
                                                        )}
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                startIdx={startIdx}
                                goTo={goTo}
                                onPageSizeChange={handlePageSizeChange}
                                itemName="GRN"
                                themeColor={colors.primary}
                            />
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

            {/* View GRN Modal */}
            {showViewModal && selectedGrnForView && (() => {
                let itemsList = [];
                if (Array.isArray(selectedGrnForView.items)) {
                    itemsList = selectedGrnForView.items;
                } else if (typeof selectedGrnForView.items === 'string') {
                    try { itemsList = JSON.parse(selectedGrnForView.items); } catch(e) { itemsList = []; }
                }

                const { totalPaid, netAmt, pending, latest } = getPaymentInfo(selectedGrnForView);
                const totalQty = itemsList.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0);

                return (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && setShowViewModal(false)}>
                        <ModalContainer style={{ maxWidth: '1000px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <ModalHeader style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <ModalTitle style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Eye size={20} color={colors.primary} />
                                        <span>GRN Details:</span>
                                        <span style={{ color: colors.primary, fontWeight: '800' }}>{selectedGrnForView.grn_number}</span>
                                    </ModalTitle>
                                    <span style={{ 
                                        background: selectedGrnForView.is_approved ? '#ecfdf5' : '#fffbeb', 
                                        color: selectedGrnForView.is_approved ? '#059669' : '#d97706', 
                                        border: `1px solid ${selectedGrnForView.is_approved ? '#a7f3d0' : '#fde68a'}`, 
                                        padding: '3px 10px', 
                                        borderRadius: '6px', 
                                        fontWeight: '700', 
                                        fontSize: '0.75rem' 
                                    }}>
                                        {selectedGrnForView.is_approved ? 'VERIFIED' : 'PENDING APPROVAL'}
                                    </span>
                                </div>
                                <CloseButton onClick={() => setShowViewModal(false)}>✕</CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px' }}>
                                {/* Header Info Banner */}
                                <div style={{
                                    background: '#f8fafc',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    marginBottom: '20px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '14px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Vendor</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: colors.textMain, marginTop: '2px' }}>
                                            {getVendorName(selectedGrnForView.vendor_id)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {selectedGrnForView.vendor_id || '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>GRN Date</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: colors.textMain, marginTop: '2px' }}>
                                            {selectedGrnForView.date ? dayjs(selectedGrnForView.date).format('DD MMM, YYYY') : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Invoice No & Date</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: colors.textMain, marginTop: '2px' }}>
                                            {selectedGrnForView.invoice_no || selectedGrnForView.invoice_number || '-'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                            {selectedGrnForView.invoice_date ? dayjs(selectedGrnForView.invoice_date).format('DD/MM/YYYY') : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Purchase Category</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: colors.primary, marginTop: '2px' }}>
                                            {selectedGrnForView.purchase_category || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Payment Mode</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: colors.textMain, marginTop: '2px' }}>
                                            {selectedGrnForView.payment_mode || (latest && latest.payment_method) || 'CHEQUE'}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Summary Cards */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '14px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: '700', textTransform: 'uppercase' }}>Net Amount</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f766e', marginTop: '4px' }}>₹{netAmt.toFixed(2)}</div>
                                    </div>
                                    <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '14px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Paid</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>₹{totalPaid.toFixed(2)}</div>
                                    </div>
                                    <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', padding: '14px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: '700', textTransform: 'uppercase' }}>Outstanding</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>₹{pending.toFixed(2)}</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', border: `1px solid ${colors.border}`, padding: '14px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Total Items / Qty</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: colors.textMain, marginTop: '4px' }}>
                                            {itemsList.length} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: colors.textMuted }}>({totalQty} units)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: colors.textMain, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        📦 Items Received ({itemsList.length})
                                    </div>
                                    <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '10px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                            <thead>
                                                <tr style={{ background: '#e6f4f1', color: '#1e293b' }}>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>#</th>
                                                    <th style={{ padding: '10px 10px', textAlign: 'left', borderBottom: `1px solid ${colors.border}` }}>Item Name</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>HSN</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>Batch</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>Expiry</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>Packing</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>Qty</th>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${colors.border}` }}>Free</th>
                                                    <th style={{ padding: '10px 10px', textAlign: 'right', borderBottom: `1px solid ${colors.border}` }}>Rate</th>
                                                    <th style={{ padding: '10px 10px', textAlign: 'right', borderBottom: `1px solid ${colors.border}` }}>MRP</th>
                                                    <th style={{ padding: '10px 10px', textAlign: 'right', borderBottom: `1px solid ${colors.border}` }}>Tax %</th>
                                                    <th style={{ padding: '10px 10px', textAlign: 'right', borderBottom: `1px solid ${colors.border}` }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>No items data available</td>
                                                    </tr>
                                                ) : itemsList.map((item, idx) => {
                                                    const qty = parseFloat(item.quantity) || 0;
                                                    const rate = parseFloat(item.itemValue || item.rate || item.purchase_rate || 0);
                                                    const totalAmt = parseFloat(item.total_amount || item.amount || (qty * rate));
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: `1px solid #f1f5f9`, background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: colors.textMuted }}>{idx + 1}</td>
                                                            <td style={{ padding: '10px 10px', fontWeight: '600', color: colors.primary }}>
                                                                {item.name || item.itemName || item.item_name || '-'}
                                                            </td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: colors.textMuted }}>{item.hsn || '-'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600' }}>{item.batch || item.batch_no || '-'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: colors.textMuted }}>{item.expiry || item.expDate || '-'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>{item.packing || '1'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700', color: colors.textMain }}>{qty}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: colors.textMuted }}>{item.free || 0}</td>
                                                            <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{rate.toFixed(2)}</td>
                                                            <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{(parseFloat(item.mrp) || 0).toFixed(2)}</td>
                                                            <td style={{ padding: '10px 10px', textAlign: 'right', color: colors.textMuted }}>{item.tax_percentage || (item.cgst ? `${(parseFloat(item.cgst||0) + parseFloat(item.sgst||0) + parseFloat(item.igst||0))}%` : '-')}</td>
                                                            <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: '700', color: '#0f766e' }}>₹{totalAmt.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tax and Additional Info Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ background: '#f8fafc', border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: colors.textMuted, marginBottom: '10px', textTransform: 'uppercase' }}>Tax Breakdown</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>CGST</span>
                                            <span style={{ fontWeight: '600' }}>₹{(parseFloat(selectedGrnForView.cgst) || 0).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>SGST</span>
                                            <span style={{ fontWeight: '600' }}>₹{(parseFloat(selectedGrnForView.sgst) || 0).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>IGST</span>
                                            <span style={{ fontWeight: '600' }}>₹{(parseFloat(selectedGrnForView.igst) || 0).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: `1px dashed ${colors.border}`, fontSize: '0.85rem', fontWeight: '700' }}>
                                            <span>Total Tax</span>
                                            <span style={{ color: colors.primary }}>₹{((parseFloat(selectedGrnForView.cgst) || 0) + (parseFloat(selectedGrnForView.sgst) || 0) + (parseFloat(selectedGrnForView.igst) || 0)).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: colors.textMuted, marginBottom: '10px', textTransform: 'uppercase' }}>Additional Adjustments</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>Total Discount</span>
                                            <span style={{ color: colors.danger, fontWeight: '600' }}>-₹{(parseFloat(selectedGrnForView.total_discount) || 0).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>Transport / Courier</span>
                                            <span style={{ fontWeight: '600' }}>₹{(parseFloat(selectedGrnForView.courier_transport_charge) || 0).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: colors.textMuted }}>Round Off</span>
                                            <span style={{ fontWeight: '600' }}>₹{(parseFloat(selectedGrnForView.round_amount) || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                    <Button secondary onClick={() => setShowViewModal(false)} style={{ padding: '8px 22px' }}>
                                        Close
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            handlePrintRow(selectedGrnForView);
                                        }}
                                        style={{ padding: '8px 22px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Printer size={16} />
                                        <span>Print Voucher</span>
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
