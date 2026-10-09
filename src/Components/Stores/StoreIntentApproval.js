import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Table, Modal, Button as AntButton, Select, Card, Statistic, Tag, ConfigProvider, Checkbox, Input } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import * as S from '../GlobalStyles';
import { RotateCcw, CheckCircle, Clock, X, Download, RefreshCw, Search, ShieldCheck, FileText, AlertCircle, MoreVertical, Eye, CheckCheck, Printer, Trash2, Ban } from 'lucide-react';
import TablePagination, { usePagination } from './TablePagination';

const { Option } = Select;
const { TextArea } = Input;

const IntentActionPopover = ({
    item,
    anchorEl,
    onClose,
    onView,
    onApprove,
    onPrint,
    onReject,
    onDelete,
    status
}) => {
    const isApproved = status === 'Approved';
    const isRejected = status === 'Rejected';
    const isPending = status === 'Pending';
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const popoverWidth = 280;
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
            title: "View Intent Details",
            onClick: onView,
        },
        {
            icon: <CheckCheck size={18} strokeWidth={1.8} />,
            label: isApproved ? "Verified" : "Approve",
            color: isApproved ? "#10b981" : "#10b981",
            disabled: isRejected || isApproved,
            title: isApproved ? "Already fully approved" : isRejected ? "Cannot approve rejected intent" : "Approve Intent",
            onClick: onApprove,
        },
        {
            icon: <Printer size={18} strokeWidth={1.8} />,
            label: "Print",
            color: "#7c3aed",
            disabled: false,
            title: "Print Intent Document",
            onClick: onPrint,
        },
        {
            icon: <Ban size={18} strokeWidth={1.8} />,
            label: "Reject",
            color: "#ef4444",
            disabled: !isPending,
            title: !isPending ? "Can only reject pending intents" : "Reject Intent",
            onClick: onReject,
        },
        {
            icon: <Trash2 size={18} strokeWidth={1.8} />,
            label: "Delete",
            color: "#64748b",
            disabled: isApproved,
            title: isApproved ? "Cannot delete approved intent" : "Delete Intent",
            onClick: onDelete,
        },
    ];

    const popover = (
        <div
            className="intent-action-popover"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "8px 10px",
                zIndex: 99999,
                minWidth: 280,
                boxShadow: "0 12px 35px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.04)",
                animation: "fadeIn 0.15s ease-out"
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${items.length}, 1fr)`,
                    gap: 4,
                }}
            >
                {items.map((itemObj, ii) => (
                    <button
                        key={ii}
                        disabled={itemObj.disabled}
                        title={itemObj.title || itemObj.label}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            if (!itemObj.disabled) {
                                itemObj.onClick();
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
                            cursor: itemObj.disabled ? "not-allowed" : "pointer",
                            opacity: itemObj.disabled ? 0.35 : 1,
                            transition: "all 0.12s ease",
                            color: itemObj.color,
                        }}
                        onMouseEnter={(e) => {
                            if (!itemObj.disabled) {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.borderColor = "transparent";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {itemObj.icon}
                        </div>
                        <span
                            style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {itemObj.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return createPortal(popover, document.body);
};

const ReturnActionPopover = ({
    ret,
    anchorEl,
    onClose,
    onView,
    onApprove,
    onPrint,
    onReject,
    onDelete,
    status
}) => {
    const isApproved = status === 'Approved';
    const isRejected = status === 'Rejected';
    const isPending = status === 'Pending';
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const popoverWidth = 280;
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
            title: "View Indent Return Details",
            onClick: onView,
        },
        {
            icon: <CheckCheck size={18} strokeWidth={1.8} />,
            label: isApproved ? "Approved" : "Approve",
            color: isApproved ? "#10b981" : "#10b981",
            disabled: isApproved || isRejected,
            title: isApproved ? "Already Approved" : isRejected ? "Cannot approve rejected return" : "Approve Indent Return",
            onClick: onApprove,
        },
        {
            icon: <Printer size={18} strokeWidth={1.8} />,
            label: "Print",
            color: "#7c3aed",
            disabled: false,
            title: "Print Return Voucher",
            onClick: onPrint,
        },
        {
            icon: <Ban size={18} strokeWidth={1.8} />,
            label: "Reject",
            color: "#ef4444",
            disabled: !isPending,
            title: !isPending ? "Can only reject pending returns" : "Reject Indent Return",
            onClick: onReject,
        },
        {
            icon: <Trash2 size={18} strokeWidth={1.8} />,
            label: "Delete",
            color: "#64748b",
            disabled: isApproved,
            title: isApproved ? "Cannot delete approved return" : "Delete Indent Return",
            onClick: onDelete,
        },
    ];

    const popover = (
        <div
            className="return-action-popover"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "8px 10px",
                zIndex: 99999,
                minWidth: 280,
                boxShadow: "0 12px 35px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.04)",
                animation: "fadeIn 0.15s ease-out"
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${items.length}, 1fr)`,
                    gap: 4,
                }}
            >
                {items.map((itemObj, ii) => (
                    <button
                        key={ii}
                        disabled={itemObj.disabled}
                        title={itemObj.title || itemObj.label}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            if (!itemObj.disabled) {
                                itemObj.onClick();
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
                            cursor: itemObj.disabled ? "not-allowed" : "pointer",
                            opacity: itemObj.disabled ? 0.35 : 1,
                            transition: "all 0.12s ease",
                            color: itemObj.color,
                        }}
                        onMouseEnter={(e) => {
                            if (!itemObj.disabled) {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.borderColor = "transparent";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {itemObj.icon}
                        </div>
                        <span
                            style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {itemObj.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return createPortal(popover, document.body);
};

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

const TabBar = styled.div`
    display: flex;
    gap: 12px;
    background: #f1f5f9;
    padding: 6px;
    border-radius: 12px;
    margin: 20px 22px 0;
    width: fit-content;
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.active ? '#ffffff' : 'transparent'};
    color: ${props => props.active ? '#0d9488' : '#64748b'};
    box-shadow: ${props => props.active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};

    &:hover {
        color: #0d9488;
    }

    .counter {
        background: ${props => props.active ? '#0d9488' : '#cbd5e1'};
        color: white;
        font-size: 0.72rem;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 700;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
    margin: 20px 22px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 22px;
    border-radius: 12px;
    border: 1px solid ${S.colors.border};
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${S.colors.primary};
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .label {
        font-size: 0.8rem;
        color: ${S.colors.textMuted};
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .value {
        font-size: 1.6rem;
        font-weight: 800;
        color: ${S.colors.textMain};
    }

    .sub-value {
        font-size: 0.75rem;
        color: ${S.colors.textMuted};
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  background: ${props => props.type === 'SUCCESS' ? '#f0fdf4' : props.type === 'WARNING' ? '#fffbeb' : '#fff1f2'};
  color: ${props => props.type === 'SUCCESS' ? '#16a34a' : props.type === 'WARNING' ? '#b45309' : '#e11d48'};
  border: 1px solid ${props => props.type === 'SUCCESS' ? '#bbf7d0' : props.type === 'WARNING' ? '#fef3c7' : '#fecdd3'};
`;

const ActionSquare = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.05rem;
  transition: all 0.2s;
  background: ${props => props.bg || S.colors.primary};
  &:hover { opacity: 0.85; transform: translateY(-1px); }
  &:disabled { background: #e2e8f0; cursor: not-allowed; opacity: 0.6; }
`;

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const StoresApprovalManager = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('intents'); // 'intents' or 'returns'

    // Intent Approval State
    const [intents, setIntents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [intentSearch, setIntentSearch] = useState('');
    const [filter, setFilter] = useState({
        from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD')
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [approvalItems, setApprovalItems] = useState([]);

    // Indent Return Approval State
    const [indentReturns, setIndentReturns] = useState([]);
    const [returnFilter, setReturnFilter] = useState({
        from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD'),
        status: 'ALL',
        search: ''
    });
    const [showReturnApproveModal, setShowReturnApproveModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [returnApprovalItems, setReturnApprovalItems] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingReturnId, setRejectingReturnId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Action Popover States
    const [openPopover, setOpenPopover] = useState(null);
    const [popoverData, setPopoverData] = useState(null);
    const anchorRefs = useRef({});

    const [openReturnPopover, setOpenReturnPopover] = useState(null);
    const [returnPopoverData, setReturnPopoverData] = useState(null);
    const returnAnchorRefs = useRef({});

    // View Modals State
    const [showViewIntentModal, setShowViewIntentModal] = useState(false);
    const [selectedIntentForView, setSelectedIntentForView] = useState(null);

    const [showViewReturnModal, setShowViewReturnModal] = useState(false);
    const [selectedReturnForView, setSelectedReturnForView] = useState(null);

    useEffect(() => {
        loadPendingIntents();
        loadIndentReturns();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.intent-action-popover') && !e.target.closest('.intent-action-popover-wrap')) {
                setOpenPopover(null);
                setPopoverData(null);
            }
            if (!e.target.closest('.return-action-popover') && !e.target.closest('.return-action-popover-wrap')) {
                setOpenReturnPopover(null);
                setReturnPopoverData(null);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // -------------------------------------------------------------
    // INTENT APPROVAL LOGIC
    // -------------------------------------------------------------
    const loadPendingIntents = async (customFilter = filter) => {
        setLoading(true);
        try {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", customFilter);
            const intentData = Array.isArray(res?.data) 
                ? res.data 
                : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setIntents(intentData);
        } catch (err) {
            console.error("Error loading intents:", err);
            setIntents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilter = () => {
        const defaultFilter = {
            from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
            to_date: dayjs().format('YYYY-MM-DD')
        };
        setFilter(defaultFilter);
        loadPendingIntents(defaultFilter);
    };

    const handleDeleteIntent = async (intent_id) => {
        if (window.confirm(`Are you sure you want to DELETE Intent ${intent_id}?`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/delete/${intent_id}/`, "DELETE");
            if (res.success) {
                toast.success("Intent deleted successfully");
                loadPendingIntents();
            } else {
                toast.error("Error deleting intent");
            }
        }
    };

    const getIntentStatus = (intent) => {
        if (intent.items && intent.items.some(it => it.status === 'Rejected')) return 'Rejected';
        if (intent.is_approved) return 'Approved';
        if (intent.items && intent.items.some(it => it.status === 'Approved')) return 'Partially Approved';
        return 'Pending';
    };

    const handleRejectIntent = async (intent) => {
        if (window.confirm(`Are you sure you want to REJECT Intent ${intent.intent_id}? This will mark all items as rejected.`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${intent.intent_id}/`, "PATCH", {
                items: (intent.items || []).map(it => ({
                    ...it,
                    status: 'Rejected',
                    approval: { approved: false, rejected_at: new Date(), rejected_by: 'Admin' }
                })),
                is_approved: false
            });
            if (res.success) {
                toast.success("Intent rejected successfully");
                loadPendingIntents();
            } else {
                toast.error("Error rejecting intent");
            }
        }
    };

    const handlePrintIntent = (intent) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = (intent.items || []).map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.hsn || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.approved_quantity || '0'}</td>
                <td>${item.status}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Intent Report - ${intent.intent_id}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px; }
                        .hospital-name { font-size: 24px; font-weight: 800; color: #0d9488; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; line-height: 1.6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f8fafc; text-align: left; padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
                        td { padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div>51/24. Saradha College Road, Salem - 636007</div>
                    </div>
                    <h3>STORES INTENT REPORT</h3>
                    <div class="info-grid">
                        <div><strong>Intent No:</strong> ${intent.intent_id}</div>
                        <div><strong>Date:</strong> ${new Date(intent.date).toLocaleDateString()}</div>
                        <div><strong>Department:</strong> ${intent.department_name}</div>
                        <div><strong>Status:</strong> ${intent.is_approved ? 'Verified' : 'Pending'}</div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>SL</th><th>Product Name</th><th>HSN</th><th>Req Qty</th><th>Apprv Qty</th><th>Status</th></tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <div class="footer">
                        <div>Prepared By</div>
                        <div>Verified By</div>
                        <div>Authorized Signatory</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const openApprovalModal = (intent) => {
        setSelectedIntent(intent);
        setApprovalItems((intent.items || []).map(it => ({
            ...it,
            original_approved_qty: Number(it.approved_quantity || 0),
            new_approval_qty: 0
        })));
        setShowModal(true);
    };

    const submitFinalApproval = async () => {
        setLoading(true);

        const finalItems = approvalItems.map(it => {
            if (Number(it.new_approval_qty) === 0) return it;

            const totalApproved = Number(it.original_approved_qty) + Number(it.new_approval_qty);
            const currentApprovals = it.approval?.approvals || [];

            if (it.approval?.approved_at && currentApprovals.length === 0) {
                currentApprovals.push({
                    approved_at: it.approval.approved_at,
                    approved_by: it.approval.approved_by || 'System',
                    quantity: it.original_approved_qty
                });
            }

            const newHistoryEntry = {
                approved_at: new Date(),
                approved_by: 'Admin',
                quantity: Number(it.new_approval_qty)
            };

            return {
                ...it,
                approved_quantity: totalApproved,
                status: 'Approved',
                approval: {
                    approved: true,
                    approvals: [...currentApprovals, newHistoryEntry]
                }
            };
        });

        const allApproved = finalItems.every(it => Number(it.approved_quantity) === Number(it.quantity));

        const payload = {
            items: finalItems,
            is_approved: allApproved
        };

        const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${selectedIntent.intent_id}/`, "PATCH", payload);

        if (res.success) {
            toast.success("Intent processed successfully");
            setShowModal(false);
            loadPendingIntents();
        } else {
            toast.error(res.error || "Failed to process intent. Check console.");
        }
        setLoading(false);
    };

    const handleExportIntentExcel = () => {
        const safeIntents = Array.isArray(intents) ? intents : [];
        if (safeIntents.length === 0) return toast.info("No data to export");

        const flattenedData = [];
        safeIntents.forEach(intent => {
            (intent.items || []).forEach(item => {
                flattenedData.push({
                    'Date': dayjs(intent.date).format('DD/MM/YYYY'),
                    'Intent ID': intent.intent_id,
                    'Department': intent.department_name,
                    'Item Name': item.name,
                    'Requested Qty': item.quantity,
                    'Approved Qty': item.approved_quantity,
                    'Status': item.status
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Approval Report");

        const wscols = [
            { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Store_Approval_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
    };

    // -------------------------------------------------------------
    // INDENT RETURN APPROVAL LOGIC
    // -------------------------------------------------------------
    const loadIndentReturns = async (customFilter = returnFilter) => {
        setLoading(true);
        try {
            let query = [];
            if (customFilter.from_date) query.push(`from_date=${customFilter.from_date}`);
            if (customFilter.to_date) query.push(`to_date=${customFilter.to_date}`);
            if (customFilter.status && customFilter.status !== 'ALL') query.push(`status=${customFilter.status}`);
            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/${queryString}`);
            const returnData = Array.isArray(res?.data) 
                ? res.data 
                : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setIndentReturns(returnData);
        } catch (err) {
            console.error("Error loading indent returns:", err);
            setIndentReturns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearReturnFilter = () => {
        const defaultFilter = {
            from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
            to_date: dayjs().format('YYYY-MM-DD'),
            status: 'ALL',
            search: ''
        };
        setReturnFilter(defaultFilter);
        loadIndentReturns(defaultFilter);
    };

    const openReturnApprovalModal = (ret) => {
        setSelectedReturn(ret);
        const items = (ret.items || []).map(it => ({
            ...it,
            approved_return_qty: Number(it.return_quantity || it.quantity || 0)
        }));
        setReturnApprovalItems(items);
        setShowReturnApproveModal(true);
    };

    const submitReturnApproval = async () => {
        if (!selectedReturn) return;
        setLoading(true);

        const payload = {
            items: returnApprovalItems.map(it => ({
                ...it,
                return_quantity: Number(it.approved_return_qty)
            }))
        };

        const res = await apiRequest(
            `${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/approve/${selectedReturn.return_id}/`,
            "POST",
            payload
        );

        if (res && res.success) {
            toast.success(res.message || `Indent Return ${selectedReturn.return_id} approved and stock restored!`);
            setShowReturnApproveModal(false);
            loadIndentReturns();
            loadPendingIntents();
        } else {
            toast.error(res?.error || "Failed to approve return request");
        }
        setLoading(false);
    };

    const handleOpenRejectModal = (returnId) => {
        setRejectingReturnId(returnId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const submitReturnRejection = async () => {
        if (!rejectingReturnId) return;
        if (!rejectionReason.trim()) {
            toast.warning("Please provide a reason for rejection");
            return;
        }

        setLoading(true);
        const res = await apiRequest(
            `${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/reject/${rejectingReturnId}/`,
            "POST",
            { rejection_reason: rejectionReason }
        );

        if (res && res.success) {
            toast.success(`Indent Return ${rejectingReturnId} rejected.`);
            setShowRejectModal(false);
            loadIndentReturns();
        } else {
            toast.error(res?.error || "Failed to reject indent return");
        }
        setLoading(false);
    };

    const handleDeleteReturn = async (returnId) => {
        if (window.confirm(`Are you sure you want to DELETE Indent Return ${returnId}?`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/delete/${returnId}/`, "DELETE");
            if (res && res.success) {
                toast.success("Indent Return deleted successfully");
                loadIndentReturns();
            } else {
                toast.error(res?.error || "Failed to delete return record");
            }
        }
    };

    const handlePrintReturn = (ret) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = (ret.items || []).map((item, index) => {
            const qty = Number(item.return_quantity || item.quantity || 0);
            const price = Number(item.unit_price || 0);
            const amount = qty * price;
            return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.name || item.item_name}</strong></td>
                <td>${item.hsn || '-'}</td>
                <td>${item.reason || ret.return_reason || 'EXCESS'}</td>
                <td style="text-align: right;">${qty}</td>
                <td style="text-align: right;">₹${price.toFixed(2)}</td>
                <td style="text-align: right;">₹${amount.toFixed(2)}</td>
            </tr>
        `}).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Stores Indent Return Voucher - ${ret.return_id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; font-size: 13px; }
                        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
                        .hospital-name { font-size: 22px; font-weight: 800; color: #0d9488; margin-bottom: 4px; }
                        .hospital-addr { font-size: 12px; color: #64748b; }
                        .voucher-title { text-align: center; font-size: 16px; font-weight: 700; color: #0f172a; margin: 15px 0; letter-spacing: 0.05em; text-transform: uppercase; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 25px; line-height: 1.7; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th { background: #0d9488; color: #ffffff; text-align: left; padding: 10px; border: 1px solid #0d9488; font-size: 11px; text-transform: uppercase; }
                        td { padding: 9px 10px; border: 1px solid #e2e8f0; }
                        .total-row { font-weight: bold; background: #f1f5f9; }
                        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: 600; }
                        .sign-box { border-top: 1px dashed #64748b; padding-top: 6px; width: 160px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div class="hospital-addr">51/24. Saradha College Road, Salem - 636007</div>
                    </div>
                    <div class="voucher-title">Stores Indent Return & Stock Credit Voucher</div>
                    <div class="info-grid">
                        <div><strong>Return ID:</strong> ${ret.return_id}</div>
                        <div><strong>Return Date:</strong> ${dayjs(ret.return_date).format('DD/MM/YYYY')}</div>
                        <div><strong>Original Intent ID:</strong> ${ret.intent_id}</div>
                        <div><strong>Department:</strong> ${ret.department_name || ret.department}</div>
                        <div><strong>Status:</strong> ${ret.status}</div>
                        <div><strong>Approved By:</strong> ${ret.approved_by || '-'}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 30px;">#</th>
                                <th>Item Description</th>
                                <th style="width: 80px;">HSN</th>
                                <th>Return Reason</th>
                                <th style="text-align: right; width: 80px;">Ret Qty</th>
                                <th style="text-align: right; width: 90px;">Unit Rate</th>
                                <th style="text-align: right; width: 100px;">Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;">Total Return Summary:</td>
                                <td style="text-align: right;">${ret.total_returned_qty || 0}</td>
                                <td></td>
                                <td style="text-align: right;">₹${Number(ret.total_returned_value || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    ${ret.remarks ? `<p style="margin-top: 15px;"><strong>Remarks:</strong> ${ret.remarks}</p>` : ''}
                    <div class="footer">
                        <div class="sign-box">Returned By<br/><small style="font-weight: normal; color: #64748b;">(Department)</small></div>
                        <div class="sign-box">Verified & Received By<br/><small style="font-weight: normal; color: #64748b;">(Stores Incharge)</small></div>
                        <div class="sign-box">Authorized Signatory<br/><small style="font-weight: normal; color: #64748b;">(Hospital Management)</small></div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportReturnExcel = () => {
        if (indentReturns.length === 0) return toast.info("No return data to export");

        const flattenedData = [];
        indentReturns.forEach(ret => {
            (ret.items || []).forEach(item => {
                const qty = Number(item.return_quantity || item.quantity || 0);
                const price = Number(item.unit_price || 0);
                flattenedData.push({
                    'Return Date': dayjs(ret.return_date).format('DD/MM/YYYY'),
                    'Return ID': ret.return_id,
                    'Intent ID': ret.intent_id,
                    'Department': ret.department_name || ret.department,
                    'Item Name': item.name || item.item_name,
                    'Returned Qty': qty,
                    'Unit Price (₹)': price,
                    'Total Value (₹)': qty * price,
                    'Item Reason': item.reason || ret.return_reason || 'EXCESS',
                    'Overall Reason': ret.return_reason,
                    'Status': ret.status,
                    'Approved By': ret.approved_by || '-',
                    'Approved Date': ret.approved_date ? dayjs(ret.approved_date).format('DD/MM/YYYY') : '-',
                    'Rejection Reason': ret.rejection_reason || '-'
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Indent Returns");

        const wscols = [
            { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 32 }, { wch: 14 },
            { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 25 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Stores_Indent_Returns_${dayjs().format('DDMMYYYY')}.xlsx`);
    };

    const safeIndentReturns = Array.isArray(indentReturns) ? indentReturns : [];
    const safeIntents = Array.isArray(intents) ? intents : [];

    // Filtered intents based on search
    const filteredIntents = safeIntents.filter(item => {
        if (!intentSearch) return true;
        const q = intentSearch.toLowerCase().trim();
        const id = (item.intent_id || '').toLowerCase();
        const dept = (item.department_name || item.department || '').toLowerCase();
        const itemNames = (item.items || []).map(i => (i.name || i.item_name || '').toLowerCase()).join(' ');
        return id.includes(q) || dept.includes(q) || itemNames.includes(q);
    });

    // Filtered returns based on text search
    const filteredReturns = safeIndentReturns.filter(item => {
        if (!returnFilter.search) return true;
        const q = returnFilter.search.toLowerCase();
        const retId = (item.return_id || '').toLowerCase();
        const intId = (item.intent_id || '').toLowerCase();
        const dept = (item.department_name || item.department || '').toLowerCase();
        const itemNames = (item.items || []).map(i => (i.name || i.item_name || '').toLowerCase()).join(' ');
        return retId.includes(q) || intId.includes(q) || dept.includes(q) || itemNames.includes(q);
    });

    const intentPagination = usePagination(filteredIntents, 15);
    const returnPagination = usePagination(filteredReturns, 15);

    const pendingIntentsCount = safeIntents.filter(i => !i.is_approved).length;
    const pendingReturnsCount = safeIndentReturns.filter(r => r.status === 'Pending').length;

    return (
        <S.PageWrapper>
            <CalendarGlobalStyles />
            <S.Container style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                {/* Header Section */}
                <div style={{
                    background: '#ffffff',
                    padding: '24px 40px',
                    borderBottom: `2px solid ${S.colors.primary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: S.colors.textMain }}>
                            Stores Intent & Return Approval
                        </h1>
                        <p style={{ margin: '4px 0 0', color: S.colors.textMuted, fontSize: '0.9rem' }}>
                            Verify departmental intent requests and approve stock returns
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <S.Button
                            secondary
                            onClick={activeTab === 'intents' ? handleExportIntentExcel : handleExportReturnExcel}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            <Download size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Export Excel
                        </S.Button>
                        <S.Button
                            onClick={() => navigate('/StoresIntent')}
                            style={{
                                background: S.colors.primary,
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            + Stores Intent Management
                        </S.Button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <TabBar>
                    <TabButton
                        active={activeTab === 'intents'}
                        onClick={() => setActiveTab('intents')}
                    >
                        <ShieldCheck size={18} />
                        Pending Intent Approvals
                        {pendingIntentsCount > 0 && <span className="counter">{pendingIntentsCount}</span>}
                    </TabButton>
                    <TabButton
                        active={activeTab === 'returns'}
                        onClick={() => setActiveTab('returns')}
                    >
                        <RotateCcw size={18} />
                        Indent Return Approvals
                        {pendingReturnsCount > 0 && <span className="counter" style={{ background: '#f59e0b' }}>{pendingReturnsCount}</span>}
                    </TabButton>
                </TabBar>

                {/* ========================================================= */}
                {/* TAB 1: INTENT APPROVALS */}
                {/* ========================================================= */}
                {activeTab === 'intents' && (
                    <>
                        {/* Quick Stats Grid */}
                        <StatsGrid>
                            <StatsCard>
                                <div className="label">Total Intents</div>
                                <div className="value">{intents.length}</div>
                                <div className="sub-value">Current Period</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Pending Review</div>
                                <div className="value" style={{ color: '#f59e0b' }}>
                                    {pendingIntentsCount}
                                </div>
                                <div className="sub-value">Needs Verification</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Approved Requests</div>
                                <div className="value" style={{ color: '#10b981' }}>
                                    {intents.filter(i => i.is_approved).length}
                                </div>
                                <div className="sub-value" style={{ color: '#0d9488' }}>🛡️ Verified Records</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Partial / Rejected</div>
                                <div className="value" style={{ color: '#64748b' }}>
                                    {intents.filter(i => !i.is_approved && i.items?.some(it => it.status === 'Approved' || it.status === 'Rejected')).length}
                                </div>
                                <div className="sub-value">Actioned Items</div>
                            </StatsCard>
                        </StatsGrid>

                        {/* Filter Section */}
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#0d9488',
                                    borderRadius: 12,
                                    colorLink: '#0d9488',
                                    colorLinkHover: '#0f766e',
                                },
                                components: {
                                    DatePicker: {
                                        headerBg: '#0d9488',
                                        headerColor: '#ffffff',
                                        colorIcon: '#ffffff',
                                        colorTextHeading: '#ffffff',
                                        colorPrimary: '#0d9488',
                                    }
                                }
                            }}
                        >
                            <div style={{
                                background: 'white',
                                margin: '20px 22px 0',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                border: `1px solid ${S.colors.border}`
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <S.Label style={{ margin: 0 }}>From</S.Label>
                                        <DatePicker
                                            value={filter.from_date ? dayjs(filter.from_date) : null}
                                            onChange={(d) => setFilter({ ...filter, from_date: d ? d.format('YYYY-MM-DD') : '' })}
                                            format="DD/MM/YYYY"
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <S.Label style={{ margin: 0 }}>To</S.Label>
                                        <DatePicker
                                            value={filter.to_date ? dayjs(filter.to_date) : null}
                                            onChange={(d) => setFilter({ ...filter, to_date: d ? d.format('YYYY-MM-DD') : '' })}
                                            format="DD/MM/YYYY"
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ minWidth: '220px', flex: '1 1 200px' }}>
                                        <Input
                                            prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: '6px' }} />}
                                            placeholder="Search Intent ID, Department, Item..."
                                            value={intentSearch}
                                            onChange={(e) => setIntentSearch(e.target.value)}
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <S.Button onClick={() => loadPendingIntents()} style={{ background: '#0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>🔍 Search</S.Button>
                                    <S.Button secondary style={{ background: '#64748b', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }} onClick={() => { setIntentSearch(''); handleClearFilter(); }}>✕ Clear</S.Button>
                                    <S.Button secondary onClick={handleExportIntentExcel} style={{ background: '#f8fafc', color: '#0d9488', border: '1px solid #0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>
                                        📥 Export Excel
                                    </S.Button>
                                </div>
                            </div>
                        </ConfigProvider>

                        {/* Intent Table Section */}
                        <S.TableWrapper style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${S.colors.border}`, margin: '20px 22px' }}>
                            <S.Table>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <S.Th style={{ padding: '15px' }}>Intent Details</S.Th>
                                        <S.Th>Department</S.Th>
                                        <S.Th>Items Summary</S.Th>
                                        <S.Th>Status</S.Th>
                                        <S.Th style={{ textAlign: 'center' }}>Actions</S.Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIntents.length === 0 ? (
                                        <S.Tr>
                                            <S.Td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                                No intent records found for the selected period
                                            </S.Td>
                                        </S.Tr>
                                    ) : (
                                        intentPagination.pageData.map((item) => (
                                            <S.Tr key={item.intent_id}>
                                                <S.Td style={{ padding: '15px' }}>
                                                    <div style={{ color: S.colors.primary, fontWeight: '800', fontSize: '0.95rem' }}>{item.intent_id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{new Date(item.date).toLocaleDateString()}</div>
                                                </S.Td>
                                                <S.Td style={{ fontWeight: '700', color: '#334155' }}>{item.department_name}</S.Td>
                                                <S.Td>
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        {(item.items || []).map((it, idx) => (
                                                            <div key={idx} style={{
                                                                padding: '4px 0',
                                                                borderBottom: idx === item.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                color: '#334155'
                                                            }}>
                                                                <span style={{ fontWeight: '600' }}>{it.name}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                                                    ({it.quantity} Req {it.approved_quantity > 0 ? `| ${it.approved_quantity} Apprv` : ''} {it.returned_quantity > 0 ? `| ↩ ${it.returned_quantity} Ret` : ''})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </S.Td>
                                                <S.Td>
                                                    <Badge
                                                        type={
                                                            getIntentStatus(item) === 'Approved' ? 'SUCCESS' :
                                                                (getIntentStatus(item) === 'Rejected' ? 'DANGER' : 'WARNING')
                                                        }
                                                        style={
                                                            getIntentStatus(item) === 'Approved' ? {} :
                                                                (getIntentStatus(item) === 'Rejected' ? {} :
                                                                    (getIntentStatus(item) === 'Partially Approved' ? { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' } :
                                                                        { background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7' }))
                                                        }
                                                    >
                                                        {getIntentStatus(item)}
                                                    </Badge>
                                                </S.Td>
                                                <S.Td style={{ textAlign: 'center', padding: '12px 10px' }}>
                                                    <div className="intent-action-popover-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                                                        <button
                                                            ref={(el) => { anchorRefs.current[item.intent_id] = el; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (openPopover === item.intent_id) {
                                                                    setOpenPopover(null);
                                                                    setPopoverData(null);
                                                                } else {
                                                                    setOpenPopover(item.intent_id);
                                                                    setPopoverData(item);
                                                                }
                                                            }}
                                                            style={{
                                                                background: openPopover === item.intent_id ? '#f0fdfa' : '#ffffff',
                                                                border: openPopover === item.intent_id ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                                                                borderRadius: '8px',
                                                                padding: '5px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: openPopover === item.intent_id ? '#0d9488' : '#334155',
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

                                                        {openPopover === item.intent_id && popoverData && (
                                                            <IntentActionPopover
                                                                item={popoverData}
                                                                status={getIntentStatus(popoverData)}
                                                                anchorEl={anchorRefs.current[item.intent_id]}
                                                                onClose={() => { setOpenPopover(null); setPopoverData(null); }}
                                                                onView={() => { setOpenPopover(null); setSelectedIntentForView(popoverData); setShowViewIntentModal(true); }}
                                                                onApprove={() => { setOpenPopover(null); openApprovalModal(popoverData); }}
                                                                onPrint={() => { setOpenPopover(null); handlePrintIntent(popoverData); }}
                                                                onReject={() => { setOpenPopover(null); handleRejectIntent(popoverData); }}
                                                                onDelete={() => { setOpenPopover(null); handleDeleteIntent(popoverData.intent_id); }}
                                                            />
                                                        )}
                                                    </div>
                                                </S.Td>
                                            </S.Tr>
                                        ))
                                    )}
                                </tbody>
                            </S.Table>
                            <TablePagination
                                currentPage={intentPagination.currentPage}
                                totalPages={intentPagination.totalPages}
                                pageSize={intentPagination.pageSize}
                                totalItems={intentPagination.totalItems}
                                startIdx={intentPagination.startIdx}
                                goTo={intentPagination.goTo}
                                onPageSizeChange={intentPagination.handlePageSizeChange}
                                itemName="intent"
                                themeColor="#0d9488"
                            />
                        </S.TableWrapper>
                    </>
                )}

                {/* ========================================================= */}
                {/* TAB 2: INDENT RETURN APPROVALS */}
                {/* ========================================================= */}
                {activeTab === 'returns' && (
                    <>
                        {/* Returns Stats Grid */}
                        <StatsGrid>
                            <StatsCard>
                                <div className="label">Total Return Requests</div>
                                <div className="value">{indentReturns.length}</div>
                                <div className="sub-value">Current Period</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Pending Verification</div>
                                <div className="value" style={{ color: '#f59e0b' }}>
                                    {pendingReturnsCount}
                                </div>
                                <div className="sub-value" style={{ color: '#b45309' }}>⏳ Needs Approval</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Approved Returns</div>
                                <div className="value" style={{ color: '#10b981' }}>
                                    {indentReturns.filter(r => r.status === 'Approved').length}
                                </div>
                                <div className="sub-value" style={{ color: '#0d9488' }}>✅ Restored to Stock</div>
                            </StatsCard>
                            <StatsCard>
                                <div className="label">Total Returned Value</div>
                                <div className="value" style={{ color: '#0d9488' }}>
                                    ₹{indentReturns.reduce((sum, r) => sum + Number(r.total_returned_value || 0), 0).toFixed(0)}
                                </div>
                                <div className="sub-value">Stock Credit Value</div>
                            </StatsCard>
                        </StatsGrid>

                        {/* Return Filters */}
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#0d9488',
                                    borderRadius: 12
                                }
                            }}
                        >
                            <div style={{
                                background: 'white',
                                margin: '20px 22px 0',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                border: `1px solid ${S.colors.border}`
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <S.Label style={{ margin: 0 }}>From</S.Label>
                                        <DatePicker
                                            value={returnFilter.from_date ? dayjs(returnFilter.from_date) : null}
                                            onChange={(d) => setReturnFilter({ ...returnFilter, from_date: d ? d.format('YYYY-MM-DD') : '' })}
                                            format="DD/MM/YYYY"
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <S.Label style={{ margin: 0 }}>To</S.Label>
                                        <DatePicker
                                            value={returnFilter.to_date ? dayjs(returnFilter.to_date) : null}
                                            onChange={(d) => setReturnFilter({ ...returnFilter, to_date: d ? d.format('YYYY-MM-DD') : '' })}
                                            format="DD/MM/YYYY"
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <S.Label style={{ margin: 0 }}>Status</S.Label>
                                        <Select
                                            value={returnFilter.status}
                                            onChange={(val) => setReturnFilter({ ...returnFilter, status: val })}
                                            style={{ width: '130px', height: '38px' }}
                                        >
                                            <Option value="ALL">All Status</Option>
                                            <Option value="Pending">Pending</Option>
                                            <Option value="Approved">Approved</Option>
                                            <Option value="Rejected">Rejected</Option>
                                        </Select>
                                    </div>
                                    <div style={{ minWidth: '220px', flex: '1 1 200px' }}>
                                        <Input
                                            prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: '6px' }} />}
                                            placeholder="Search Return ID, Intent, Dept..."
                                            value={returnFilter.search}
                                            onChange={(e) => setReturnFilter({ ...returnFilter, search: e.target.value })}
                                            style={{ height: '38px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <S.Button onClick={() => loadIndentReturns()} style={{ background: '#0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>🔍 Filter</S.Button>
                                    <S.Button secondary style={{ background: '#64748b', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }} onClick={handleClearReturnFilter}>✕ Clear</S.Button>
                                    <S.Button secondary onClick={handleExportReturnExcel} style={{ background: '#f8fafc', color: '#0d9488', border: '1px solid #0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>
                                        📥 Export Excel
                                    </S.Button>
                                </div>
                            </div>
                        </ConfigProvider>

                        {/* Indent Returns Table */}
                        <S.TableWrapper style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${S.colors.border}`, margin: '20px 22px' }}>
                            <S.Table>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <S.Th style={{ padding: '15px' }}>Return Details</S.Th>
                                        <S.Th>Original Intent & Dept</S.Th>
                                        <S.Th>Returned Items Breakdown</S.Th>
                                        <S.Th style={{ textAlign: 'right' }}>Total Value</S.Th>
                                        <S.Th>Status</S.Th>
                                        <S.Th style={{ textAlign: 'center' }}>Approval Actions</S.Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReturns.length === 0 ? (
                                        <S.Tr>
                                            <S.Td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                                <RotateCcw size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                                <div>No indent return records found matching the filters</div>
                                            </S.Td>
                                        </S.Tr>
                                    ) : (
                                        returnPagination.pageData.map((ret) => (
                                            <S.Tr key={ret.return_id}>
                                                <S.Td style={{ padding: '15px' }}>
                                                    <div style={{ color: '#0d9488', fontWeight: '800', fontSize: '0.95rem' }}>{ret.return_id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                                        {dayjs(ret.return_date).format('DD/MM/YYYY')}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', fontWeight: '600' }}>
                                                        Reason: {ret.return_reason || 'EXCESS'}
                                                    </div>
                                                </S.Td>
                                                <S.Td>
                                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{ret.department_name || ret.department}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px' }}>
                                                        Intent: <strong style={{ color: S.colors.primary }}>{ret.intent_id}</strong>
                                                    </div>
                                                    {ret.remarks && (
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                                                            "{ret.remarks}"
                                                        </div>
                                                    )}
                                                </S.Td>
                                                <S.Td>
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        {(ret.items || []).map((it, idx) => (
                                                            <div key={idx} style={{
                                                                padding: '4px 0',
                                                                borderBottom: idx === ret.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                gap: '12px'
                                                            }}>
                                                                <div>
                                                                    <span style={{ fontWeight: '600', color: '#334155' }}>{it.name || it.item_name}</span>
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>
                                                                        ({it.reason || 'EXCESS'})
                                                                    </span>
                                                                </div>
                                                                <div style={{ fontWeight: '700', color: '#0d9488', whiteSpace: 'nowrap' }}>
                                                                    {it.return_quantity || it.quantity} Units
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </S.Td>
                                                <S.Td style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                                                        ₹{Number(ret.total_returned_value || 0).toFixed(2)}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {ret.total_returned_qty || 0} Total Qty
                                                    </div>
                                                </S.Td>
                                                <S.Td>
                                                    <Badge
                                                        type={
                                                            ret.status === 'Approved' ? 'SUCCESS' :
                                                                (ret.status === 'Rejected' ? 'DANGER' : 'WARNING')
                                                        }
                                                    >
                                                        {ret.status}
                                                    </Badge>
                                                    {ret.approved_by && (
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                                            By: {ret.approved_by}
                                                        </div>
                                                    )}
                                                    {ret.rejection_reason && (
                                                        <div style={{ fontSize: '0.7rem', color: '#e11d48', marginTop: '3px' }}>
                                                            {ret.rejection_reason}
                                                        </div>
                                                    )}
                                                </S.Td>
                                                <S.Td style={{ textAlign: 'center', padding: '12px 10px' }}>
                                                    <div className="return-action-popover-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                                                        <button
                                                            ref={(el) => { returnAnchorRefs.current[ret.return_id] = el; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (openReturnPopover === ret.return_id) {
                                                                    setOpenReturnPopover(null);
                                                                    setReturnPopoverData(null);
                                                                } else {
                                                                    setOpenReturnPopover(ret.return_id);
                                                                    setReturnPopoverData(ret);
                                                                }
                                                            }}
                                                            style={{
                                                                background: openReturnPopover === ret.return_id ? '#f0fdfa' : '#ffffff',
                                                                border: openReturnPopover === ret.return_id ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                                                                borderRadius: '8px',
                                                                padding: '5px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: openReturnPopover === ret.return_id ? '#0d9488' : '#334155',
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

                                                        {openReturnPopover === ret.return_id && returnPopoverData && (
                                                            <ReturnActionPopover
                                                                ret={returnPopoverData}
                                                                status={returnPopoverData.status}
                                                                anchorEl={returnAnchorRefs.current[ret.return_id]}
                                                                onClose={() => { setOpenReturnPopover(null); setReturnPopoverData(null); }}
                                                                onView={() => { setOpenReturnPopover(null); setSelectedReturnForView(returnPopoverData); setShowViewReturnModal(true); }}
                                                                onApprove={() => { setOpenReturnPopover(null); openReturnApprovalModal(returnPopoverData); }}
                                                                onPrint={() => { setOpenReturnPopover(null); handlePrintReturn(returnPopoverData); }}
                                                                onReject={() => { setOpenReturnPopover(null); handleOpenRejectModal(returnPopoverData.return_id); }}
                                                                onDelete={() => { setOpenReturnPopover(null); handleDeleteReturn(returnPopoverData.return_id); }}
                                                            />
                                                        )}
                                                    </div>
                                                </S.Td>
                                            </S.Tr>
                                        ))
                                    )}
                                </tbody>
                            </S.Table>
                            <TablePagination
                                currentPage={returnPagination.currentPage}
                                totalPages={returnPagination.totalPages}
                                pageSize={returnPagination.pageSize}
                                totalItems={returnPagination.totalItems}
                                startIdx={returnPagination.startIdx}
                                goTo={returnPagination.goTo}
                                onPageSizeChange={returnPagination.handlePageSizeChange}
                                itemName="indent returns"
                                themeColor="#0d9488"
                            />
                        </S.TableWrapper>
                    </>
                )}

                {/* ========================================================= */}
                {/* MODAL 1: INTENT APPROVAL */}
                {/* ========================================================= */}
                {showModal && (
                    <S.ModalOverlay>
                        <S.ModalContainer style={{ maxWidth: '800px' }}>
                            <S.ModalHeader style={{ background: S.colors.primary, color: '#fff' }}>
                                <S.ModalTitle style={{ color: '#fff' }}>Approve Intent: {selectedIntent?.intent_id}</S.ModalTitle>
                                <S.CloseButton style={{ color: '#fff' }} onClick={() => setShowModal(false)}>&times;</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody>
                                <S.TableWrapper>
                                    <S.Table>
                                        <thead>
                                            <tr>
                                                <S.Th width="50">
                                                    <Checkbox
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            const copy = approvalItems.map(it => {
                                                                const isFullyApproved = Number(it.original_approved_qty) >= Number(it.quantity);
                                                                if (isFullyApproved) return it;
                                                                return {
                                                                    ...it,
                                                                    new_approval_qty: checked ? (Number(it.quantity) - Number(it.original_approved_qty)) : 0
                                                                };
                                                            });
                                                            setApprovalItems(copy);
                                                        }}
                                                        checked={
                                                            approvalItems.length > 0 &&
                                                            approvalItems.filter(it => Number(it.original_approved_qty) < Number(it.quantity))
                                                                .every(it => it.new_approval_qty === (Number(it.quantity) - Number(it.original_approved_qty)))
                                                        }
                                                    />
                                                </S.Th>
                                                <S.Th>Available Qty</S.Th>
                                                <S.Th>Item</S.Th>
                                                <S.Th>Request</S.Th>
                                                <S.Th>Already Apprv</S.Th>
                                                <S.Th>Currently Apprv</S.Th>
                                                <S.Th>Total Apprv</S.Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {approvalItems.map((it, idx) => (
                                                <S.Tr key={idx}>
                                                    <S.Td>
                                                        <Checkbox
                                                            disabled={Number(it.original_approved_qty) >= Number(it.quantity)}
                                                            checked={
                                                                Number(it.original_approved_qty) >= Number(it.quantity) ||
                                                                it.new_approval_qty === (Number(it.quantity) - Number(it.original_approved_qty))
                                                            }
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const copy = [...approvalItems];
                                                                copy[idx].new_approval_qty = checked ? (Number(it.quantity) - Number(it.original_approved_qty)) : 0;
                                                                setApprovalItems(copy);
                                                            }}
                                                        />
                                                    </S.Td>
                                                    <S.Td>{it.available_stock}</S.Td>
                                                    <S.Td style={{ fontWeight: '700' }}>{it.name}</S.Td>
                                                    <S.Td>{it.quantity}</S.Td>
                                                    <S.Td style={{ color: '#64748b' }}>{it.original_approved_qty}</S.Td>
                                                    <S.Td>
                                                        <S.Input
                                                            type="number"
                                                            min="0"
                                                            disabled={Number(it.original_approved_qty) >= Number(it.quantity)}
                                                            max={Number(it.quantity) - Number(it.original_approved_qty)}
                                                            value={it.new_approval_qty}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                const remaining = Number(it.quantity) - Number(it.original_approved_qty);
                                                                if (val > remaining) {
                                                                    toast.warning(`Cannot exceed remaining quantity (${remaining})`);
                                                                    return;
                                                                }
                                                                if (val < 0) return;
                                                                const copy = [...approvalItems];
                                                                copy[idx].new_approval_qty = val;
                                                                setApprovalItems(copy);
                                                            }}
                                                        />
                                                    </S.Td>
                                                    <S.Td style={{ fontWeight: '800', color: S.colors.primary }}>
                                                        {Number(it.original_approved_qty) + Number(it.new_approval_qty)}
                                                    </S.Td>
                                                </S.Tr>
                                            ))}
                                        </tbody>
                                    </S.Table>
                                </S.TableWrapper>
                                <S.ButtonContainer>
                                    <S.Button onClick={submitFinalApproval} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>Verify & Approve Intent</S.Button>
                                </S.ButtonContainer>
                            </S.ModalBody>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}

                {/* ========================================================= */}
                {/* MODAL 2: INDENT RETURN APPROVAL MODAL */}
                {/* ========================================================= */}
                {showReturnApproveModal && selectedReturn && (
                    <S.ModalOverlay>
                        <S.ModalContainer style={{ maxWidth: '850px' }}>
                            <S.ModalHeader style={{ background: '#0d9488', color: '#fff' }}>
                                <S.ModalTitle style={{ color: '#fff' }}>
                                    Approve Indent Return: {selectedReturn.return_id}
                                </S.ModalTitle>
                                <S.CloseButton style={{ color: '#fff' }} onClick={() => setShowReturnApproveModal(false)}>&times;</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody style={{ padding: '24px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px',
                                    background: '#f8fafc',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Department</div>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedReturn.department_name || selectedReturn.department}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Original Intent ID</div>
                                        <div style={{ fontWeight: '700', color: '#0d9488' }}>{selectedReturn.intent_id}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Return Date</div>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{dayjs(selectedReturn.return_date).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Return Reason</div>
                                        <div style={{ fontWeight: '700', color: '#0284c7' }}>{selectedReturn.return_reason || 'EXCESS'}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
                                    Review Returned Items to Credit Back to Central Stores Inventory:
                                </div>

                                <S.TableWrapper>
                                    <S.Table>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9' }}>
                                                <S.Th>Item Name</S.Th>
                                                <S.Th>Reason</S.Th>
                                                <S.Th style={{ textAlign: 'right' }}>Req Return Qty</S.Th>
                                                <S.Th style={{ width: '130px', textAlign: 'center' }}>Approve Ret Qty</S.Th>
                                                <S.Th style={{ textAlign: 'right' }}>Unit Price</S.Th>
                                                <S.Th style={{ textAlign: 'right' }}>Credit Amount</S.Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returnApprovalItems.map((it, idx) => {
                                                const price = Number(it.unit_price || 0);
                                                const apprvQty = Number(it.approved_return_qty || 0);
                                                const creditAmount = apprvQty * price;

                                                return (
                                                    <S.Tr key={idx}>
                                                        <S.Td style={{ fontWeight: '700', color: '#334155' }}>
                                                            {it.name || it.item_name}
                                                        </S.Td>
                                                        <S.Td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {it.reason || selectedReturn.return_reason || 'EXCESS'}
                                                        </S.Td>
                                                        <S.Td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                            {it.return_quantity || it.quantity}
                                                        </S.Td>
                                                        <S.Td style={{ textAlign: 'center' }}>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={Number(it.return_quantity || it.quantity || 9999)}
                                                                value={it.approved_return_qty}
                                                                onChange={(e) => {
                                                                    const val = Math.max(0, Number(e.target.value));
                                                                    const copy = [...returnApprovalItems];
                                                                    copy[idx].approved_return_qty = val;
                                                                    setReturnApprovalItems(copy);
                                                                }}
                                                                style={{ textAlign: 'center', fontWeight: '700', color: '#0d9488' }}
                                                            />
                                                        </S.Td>
                                                        <S.Td style={{ textAlign: 'right', color: '#64748b' }}>
                                                            ₹{price.toFixed(2)}
                                                        </S.Td>
                                                        <S.Td style={{ textAlign: 'right', fontWeight: '800', color: '#0d9488' }}>
                                                            ₹{creditAmount.toFixed(2)}
                                                        </S.Td>
                                                    </S.Tr>
                                                );
                                            })}
                                        </tbody>
                                    </S.Table>
                                </S.TableWrapper>

                                <div style={{
                                    marginTop: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: '#f0fdf4',
                                    borderRadius: '8px',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                                        🛡️ <strong>Note:</strong> Approving this return will automatically restore the returned items into central stores available stock and deduct from department inventory.
                                    </div>
                                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Value to Credit</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>
                                            ₹{returnApprovalItems.reduce((acc, it) => acc + (Number(it.approved_return_qty || 0) * Number(it.unit_price || 0)), 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <S.Button
                                        secondary
                                        onClick={() => setShowReturnApproveModal(false)}
                                        style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569' }}
                                    >
                                        Cancel
                                    </S.Button>
                                    <S.Button
                                        onClick={submitReturnApproval}
                                        style={{ flex: 2, padding: '12px', background: '#0d9488', fontSize: '1rem', fontWeight: '700' }}
                                    >
                                        ✔ Confirm & Approve Return
                                    </S.Button>
                                </div>
                            </S.ModalBody>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}

                {/* ========================================================= */}
                {/* MODAL 3: REJECT INDENT RETURN MODAL */}
                {/* ========================================================= */}
                {showRejectModal && (
                    <S.ModalOverlay>
                        <S.ModalContainer style={{ maxWidth: '500px' }}>
                            <S.ModalHeader style={{ background: '#ef4444', color: '#fff' }}>
                                <S.ModalTitle style={{ color: '#fff' }}>
                                    Reject Indent Return: {rejectingReturnId}
                                </S.ModalTitle>
                                <S.CloseButton style={{ color: '#fff' }} onClick={() => setShowRejectModal(false)}>&times;</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c', marginBottom: '16px' }}>
                                    <AlertCircle size={24} />
                                    <div style={{ fontSize: '0.9rem' }}>
                                        Please specify the reason for rejecting this indent return request.
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <S.Label>Rejection Reason *</S.Label>
                                    <TextArea
                                        rows={4}
                                        placeholder="Enter reason e.g., Items not received in good condition, incorrect batch returned, etc."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <S.Button
                                        secondary
                                        onClick={() => setShowRejectModal(false)}
                                        style={{ flex: 1, padding: '10px' }}
                                    >
                                        Cancel
                                    </S.Button>
                                    <S.Button
                                        onClick={submitReturnRejection}
                                        style={{ flex: 2, padding: '10px', background: '#ef4444', fontWeight: '700' }}
                                    >
                                        ✖ Confirm Rejection
                                    </S.Button>
                                </div>
                            </S.ModalBody>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}

                {/* ========================================================= */}
                {/* MODAL 4: VIEW INTENT DETAILS MODAL */}
                {/* ========================================================= */}
                {showViewIntentModal && selectedIntentForView && (() => {
                    const itemsList = Array.isArray(selectedIntentForView.items) ? selectedIntentForView.items : [];
                    const status = getIntentStatus(selectedIntentForView);
                    const totalReq = itemsList.reduce((acc, it) => acc + (parseFloat(it.quantity) || 0), 0);
                    const totalApprv = itemsList.reduce((acc, it) => acc + (parseFloat(it.approved_quantity) || 0), 0);

                    return (
                        <S.ModalOverlay onClick={e => e.target === e.currentTarget && setShowViewIntentModal(false)}>
                            <S.ModalContainer style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                                <S.ModalHeader style={{ borderBottom: `1px solid ${S.colors.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <S.ModalTitle style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Eye size={20} color="#0d9488" />
                                            <span>Intent Details:</span>
                                            <span style={{ color: '#0d9488', fontWeight: '800' }}>{selectedIntentForView.intent_id}</span>
                                        </S.ModalTitle>
                                        <Badge
                                            type={
                                                status === 'Approved' ? 'SUCCESS' :
                                                    (status === 'Rejected' ? 'DANGER' : 'WARNING')
                                            }
                                        >
                                            {status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <S.CloseButton onClick={() => setShowViewIntentModal(false)}>✕</S.CloseButton>
                                </S.ModalHeader>

                                <S.ModalBody style={{ padding: '20px' }}>
                                    {/* Header Info Banner */}
                                    <div style={{
                                        background: '#f8fafc',
                                        border: `1px solid ${S.colors.border}`,
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '14px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Department</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: S.colors.textMain, marginTop: '2px' }}>
                                                {selectedIntentForView.department_name || selectedIntentForView.department || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Intent Date</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: S.colors.textMain, marginTop: '2px' }}>
                                                {selectedIntentForView.date ? dayjs(selectedIntentForView.date).format('DD MMM, YYYY') : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Created By</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: S.colors.textMain, marginTop: '2px' }}>
                                                {selectedIntentForView.created_by || selectedIntentForView.user || 'Department User'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Highlights */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: '700', textTransform: 'uppercase' }}>Total Items</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f766e', marginTop: '4px' }}>{itemsList.length}</div>
                                        </div>
                                        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Requested Qty</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{totalReq}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', border: `1px solid ${S.colors.border}`, padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Total Approved Qty</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: S.colors.primary, marginTop: '4px' }}>{totalApprv}</div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: S.colors.textMain, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            📦 Requested Items List ({itemsList.length})
                                        </div>
                                        <div style={{ overflowX: 'auto', border: `1px solid ${S.colors.border}`, borderRadius: '10px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f0fdfa', color: '#1e293b', borderBottom: `1px solid ${S.colors.border}` }}>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>#</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Item Name</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>HSN</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Available Stock</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Req Qty</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Apprv Qty</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Returned Qty</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'center' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itemsList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: S.colors.textMuted }}>No items data available</td>
                                                        </tr>
                                                    ) : itemsList.map((it, idx) => (
                                                        <tr key={idx} style={{ borderBottom: `1px solid #f1f5f9`, background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: S.colors.textMuted }}>{idx + 1}</td>
                                                            <td style={{ padding: '10px 10px', fontWeight: '600', color: '#0d9488' }}>
                                                                {it.name || it.item_name}
                                                            </td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: S.colors.textMuted }}>{it.hsn || '-'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: S.colors.textMuted }}>{it.available_stock !== undefined ? it.available_stock : '-'}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700', color: S.colors.textMain }}>{it.quantity}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700', color: '#16a34a' }}>{it.approved_quantity || 0}</td>
                                                            <td style={{ padding: '10px 8px', textAlign: 'center', color: it.returned_quantity > 0 ? '#f59e0b' : S.colors.textMuted }}>{it.returned_quantity || 0}</td>
                                                            <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                                                                <Badge
                                                                    type={
                                                                        it.status === 'Approved' ? 'SUCCESS' :
                                                                            (it.status === 'Rejected' ? 'DANGER' : 'WARNING')
                                                                    }
                                                                >
                                                                    {it.status || 'Pending'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Modal Footer Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${S.colors.border}`, paddingTop: '16px' }}>
                                        <S.Button secondary onClick={() => setShowViewIntentModal(false)} style={{ padding: '8px 22px' }}>
                                            Close
                                        </S.Button>
                                        <S.Button 
                                            onClick={() => {
                                                handlePrintIntent(selectedIntentForView);
                                            }}
                                            style={{ padding: '8px 22px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0d9488', color: 'white' }}
                                        >
                                            <Printer size={16} />
                                            <span>Print Intent Document</span>
                                        </S.Button>
                                    </div>
                                </S.ModalBody>
                            </S.ModalContainer>
                        </S.ModalOverlay>
                    );
                })()}

                {/* ========================================================= */}
                {/* MODAL 5: VIEW RETURN DETAILS MODAL */}
                {/* ========================================================= */}
                {showViewReturnModal && selectedReturnForView && (() => {
                    const itemsList = Array.isArray(selectedReturnForView.items) ? selectedReturnForView.items : [];
                    const totalQty = Number(selectedReturnForView.total_returned_qty || 0);
                    const totalVal = Number(selectedReturnForView.total_returned_value || 0);

                    return (
                        <S.ModalOverlay onClick={e => e.target === e.currentTarget && setShowViewReturnModal(false)}>
                            <S.ModalContainer style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                                <S.ModalHeader style={{ borderBottom: `1px solid ${S.colors.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <S.ModalTitle style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Eye size={20} color="#0d9488" />
                                            <span>Indent Return Details:</span>
                                            <span style={{ color: '#0d9488', fontWeight: '800' }}>{selectedReturnForView.return_id}</span>
                                        </S.ModalTitle>
                                        <Badge
                                            type={
                                                selectedReturnForView.status === 'Approved' ? 'SUCCESS' :
                                                    (selectedReturnForView.status === 'Rejected' ? 'DANGER' : 'WARNING')
                                            }
                                        >
                                            {selectedReturnForView.status}
                                        </Badge>
                                    </div>
                                    <S.CloseButton onClick={() => setShowViewReturnModal(false)}>✕</S.CloseButton>
                                </S.ModalHeader>

                                <S.ModalBody style={{ padding: '20px' }}>
                                    {/* Header Info Banner */}
                                    <div style={{
                                        background: '#f8fafc',
                                        border: `1px solid ${S.colors.border}`,
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '14px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Department</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: S.colors.textMain, marginTop: '2px' }}>
                                                {selectedReturnForView.department_name || selectedReturnForView.department || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Original Intent ID</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0d9488', marginTop: '2px' }}>
                                                {selectedReturnForView.intent_id}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Return Date</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: S.colors.textMain, marginTop: '2px' }}>
                                                {selectedReturnForView.return_date ? dayjs(selectedReturnForView.return_date).format('DD MMM, YYYY') : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Return Reason</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0284c7', marginTop: '2px' }}>
                                                {selectedReturnForView.return_reason || 'EXCESS'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial & Quantity Highlights */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: '700', textTransform: 'uppercase' }}>Total Return Value</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f766e', marginTop: '4px' }}>₹{totalVal.toFixed(2)}</div>
                                        </div>
                                        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Returned Qty</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{totalQty} Units</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', border: `1px solid ${S.colors.border}`, padding: '14px', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '0.72rem', color: S.colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Total Items</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: S.colors.textMain, marginTop: '4px' }}>{itemsList.length}</div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: S.colors.textMain, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            📦 Returned Items List ({itemsList.length})
                                        </div>
                                        <div style={{ overflowX: 'auto', border: `1px solid ${S.colors.border}`, borderRadius: '10px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f0fdfa', color: '#1e293b', borderBottom: `1px solid ${S.colors.border}` }}>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>#</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Item Name</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>HSN</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'left' }}>Reason</th>
                                                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Returned Qty</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'right' }}>Unit Rate</th>
                                                        <th style={{ padding: '10px 10px', textAlign: 'right' }}>Total Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itemsList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: S.colors.textMuted }}>No return items data</td>
                                                        </tr>
                                                    ) : itemsList.map((it, idx) => {
                                                        const qty = Number(it.return_quantity || it.quantity || 0);
                                                        const price = Number(it.unit_price || 0);
                                                        const totalAmt = qty * price;
                                                        return (
                                                            <tr key={idx} style={{ borderBottom: `1px solid #f1f5f9`, background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                                <td style={{ padding: '10px 8px', textAlign: 'center', color: S.colors.textMuted }}>{idx + 1}</td>
                                                                <td style={{ padding: '10px 10px', fontWeight: '600', color: '#0d9488' }}>
                                                                    {it.name || it.item_name}
                                                                </td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'center', color: S.colors.textMuted }}>{it.hsn || '-'}</td>
                                                                <td style={{ padding: '10px 10px', color: S.colors.textMuted }}>{it.reason || selectedReturnForView.return_reason || 'EXCESS'}</td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700', color: S.colors.textMain }}>{qty}</td>
                                                                <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{price.toFixed(2)}</td>
                                                                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: '700', color: '#0f766e' }}>₹{totalAmt.toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Remarks or Rejection info */}
                                    {selectedReturnForView.rejection_reason && (
                                        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#e11d48', fontSize: '0.85rem' }}>
                                            <strong>Rejection Reason:</strong> {selectedReturnForView.rejection_reason}
                                        </div>
                                    )}

                                    {/* Modal Footer Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${S.colors.border}`, paddingTop: '16px' }}>
                                        <S.Button secondary onClick={() => setShowViewReturnModal(false)} style={{ padding: '8px 22px' }}>
                                            Close
                                        </S.Button>
                                        <S.Button 
                                            onClick={() => {
                                                handlePrintReturn(selectedReturnForView);
                                            }}
                                            style={{ padding: '8px 22px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0d9488', color: 'white' }}
                                        >
                                            <Printer size={16} />
                                            <span>Print Voucher</span>
                                        </S.Button>
                                    </div>
                                </S.ModalBody>
                            </S.ModalContainer>
                        </S.ModalOverlay>
                    );
                })()}

            </S.Container>
        </S.PageWrapper>
    );
};

export default StoresApprovalManager;