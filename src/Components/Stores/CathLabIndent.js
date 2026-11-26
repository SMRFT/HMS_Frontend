import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker, Select, ConfigProvider, Spin, Pagination } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../Auth/apiRequest';
import * as S from '../GlobalStyles';
import PatientSearchModal from '../Common/PatientSearchModal';
import { printCathLabIntentsLog, printCathLabSingleIntent } from './printCathLabReport';
import {
    Plus,
    Search,
    FileText,
    CheckCircle,
    Clock,
    X,
    Trash2,
    RefreshCw,
    Download,
    User,
    Bed,
    Building2,
    Tag,
    ChevronDown,
    ChevronUp,
    Layers,
    DollarSign,
    Eye,
    Printer,
    AlertCircle,
    Edit3,
    Package,
    Lock
} from 'lucide-react';

const { Option } = Select;

const CalendarGlobalStyles = createGlobalStyle`
    .ant-picker-dropdown { z-index: 10000 !important; }
    .ant-picker-header {
        background: #0d9488 !important;
        color: white !important;
    }
    .ant-picker-header button, .ant-picker-header-view button { color: white !important; }
`;

const ModernContainer = styled.div`
    background: #f8fafc;
    min-height: 100vh;
    padding: 24px;
`;

const SectionFrame = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
`;

const SectionHeader = styled.div`
    background: #ffffff;
    padding: 16px 24px;
    border-bottom: 1px solid #edf2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    h3 { 
        margin: 0; 
        font-size: 1rem; 
        color: #0f172a; 
        font-weight: 700; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 24px;
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    thead {
        background: #0d9488;
        th { 
            color: white; 
            padding: 12px 14px; 
            text-align: left; 
            font-size: 0.85rem; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.03em;
        }
    }
    tbody tr {
        border-bottom: 1px solid #edf2f7;
        transition: background 0.15s ease;
        &:hover { background: #f8fafc; }
        td { 
            padding: 12px 14px; 
            font-size: 0.9rem; 
            color: #334155; 
            vertical-align: middle;
        }
    }
`;

const EmptyState = styled.div`
    padding: 60px;
    text-align: center;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    .icon { font-size: 3rem; opacity: 0.5; }
`;

const PatientInfoCard = styled.div`
    background: #f0fdfa;
    border: 1px solid #99f6e4;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
`;

const PatientDetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: #0f766e;
    strong {
        color: #115e59;
        font-weight: 700;
    }
`;

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const CathLabIndent = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'report' | 'stock'
    const [editingIntentId, setEditingIntentId] = useState(null);

    // Form state
    const [intentForm, setIntentForm] = useState({
        date: dayjs().format('YYYY-MM-DD'),
        department: 'DEPT027',
        department_name: 'Cath lab',
        ipnumber: '',
        patient: null,
        items: []
    });

    // Masters
    const [itemsMaster, setItemsMaster] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [batchCache, setBatchCache] = useState({}); // item_id -> list of batches
    const [loadingBatches, setLoadingBatches] = useState({}); // item_id -> bool

    // Patient search modal
    const [showPatientModal, setShowPatientModal] = useState(false);

    // Submission & Loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reports / Logs Tab State
    const [intentsList, setIntentsList] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportFilter, setReportFilter] = useState({
        from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD'),
        search: ''
    });
    const [selectedIntentForModal, setSelectedIntentForModal] = useState(null);

    // Stock Report State
    const [stockReportData, setStockReportData] = useState([]);
    const [loadingStockReport, setLoadingStockReport] = useState(false);
    const [stockSearch, setStockSearch] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [multiBatchOnly, setMultiBatchOnly] = useState(false);
    const [expandedItemIds, setExpandedItemIds] = useState(new Set());
    const [stockPage, setStockPage] = useState(1);
    const [stockPageSize, setStockPageSize] = useState(25);

    useEffect(() => {
        setStockPage(1);
    }, [stockSearch, inStockOnly, multiBatchOnly]);

    const toggleExpandItem = (itemId) => {
        setExpandedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    // Load Cath Lab Items (department == 'DEPT027' or 'Cath lab')
    const loadCathLabItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            const res = await apiRequest(`${Hmsbaseurl}cathlab-items/`, 'GET');
            if (res && res.data && Array.isArray(res.data.data)) {
                setItemsMaster(res.data.data);
            } else if (Array.isArray(res.data)) {
                setItemsMaster(res.data);
            }
        } catch (err) {
            console.error('Error fetching Cath Lab items:', err);
            toast.error('Failed to load Cath Lab items master.');
        } finally {
            setLoadingItems(false);
        }
    }, []);

    useEffect(() => {
        loadCathLabItems();
    }, [loadCathLabItems]);

    // Fetch batches from GRN for a specific item
    const fetchItemBatches = async (itemId) => {
        if (!itemId || batchCache[itemId]) return;
        setLoadingBatches(prev => ({ ...prev, [itemId]: true }));
        try {
            const res = await apiRequest(`${Hmsbaseurl}cathlab-item-batches/${itemId}/`, 'GET');
            const batches = (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];
            setBatchCache(prev => ({ ...prev, [itemId]: batches }));

            // If item in current form doesn't have batch and batches exist, auto-select first
            setIntentForm(prev => {
                const updatedItems = prev.items.map(it => {
                    if (it.item_id === itemId && (!it.batch || it.batch === '') && batches.length > 0) {
                        return {
                            ...it,
                            batch: batches[0].batch,
                            mrp: batches[0].mrp !== undefined && batches[0].mrp !== null ? batches[0].mrp : it.mrp
                        };
                    }
                    return it;
                });
                return { ...prev, items: updatedItems };
            });
        } catch (err) {
            console.error(`Error fetching batches for ${itemId}:`, err);
        } finally {
            setLoadingBatches(prev => ({ ...prev, [itemId]: false }));
        }
    };

    // Add Item to table
    const handleAddItem = (itemId) => {
        if (!itemId) return;
        const exists = intentForm.items.some(i => i.item_id === itemId);
        if (exists) {
            toast.warning('Item already added to requisition table!');
            return;
        }

        const master = itemsMaster.find(i => i.item_id === itemId);
        if (!master) return;

        const newItem = {
            item_id: master.item_id,
            name: master.itemName || master.name,
            hsn: master.hsn || '-',
            batch: '',
            mrp: '',
            quantity: 1,
            status: 'Pending',
            approved_quantity: 0
        };

        setIntentForm(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        // Fetch batches for this item from GRN
        fetchItemBatches(master.item_id);
    };

    // Change batch for an item
    const handleBatchChange = (itemId, selectedBatch) => {
        const batches = batchCache[itemId] || [];
        const found = batches.find(b => b.batch === selectedBatch);
        const autoMrp = found ? (found.mrp !== undefined && found.mrp !== null ? found.mrp : '') : '';

        setIntentForm(prev => ({
            ...prev,
            items: prev.items.map(it => {
                if (it.item_id === itemId) {
                    return {
                        ...it,
                        batch: selectedBatch,
                        mrp: autoMrp
                    };
                }
                return it;
            })
        }));
    };

    // Change quantity
    const handleQuantityChange = (itemId, newQty) => {
        const val = parseInt(newQty, 10);
        setIntentForm(prev => ({
            ...prev,
            items: prev.items.map(it => {
                if (it.item_id === itemId) {
                    return { ...it, quantity: isNaN(val) ? '' : Math.max(1, val) };
                }
                return it;
            })
        }));
    };

    // Remove Item
    const handleRemoveItem = (itemId) => {
        setIntentForm(prev => ({
            ...prev,
            items: prev.items.filter(it => it.item_id !== itemId)
        }));
    };

    // Handle patient selection from PatientSearchModal
    const handlePatientSelect = (patient) => {
        if (!patient) return;
        const ipNo = patient.ip_number || patient.inpatient_number || patient.ipnumber || '';
        let roomLabel = '—';
        const activeRoom = Array.isArray(patient.room_details)
            ? patient.room_details.find(r => r.is_roomActive)
            : null;
        const activeShift = Array.isArray(patient.roomShitingDetails)
            ? patient.roomShitingDetails.find(r => r.is_roomActive)
            : null;
        roomLabel = activeRoom
            ? `${activeRoom.roomNo} / Bed ${activeRoom.bedNo}`
            : activeShift
                ? `${activeShift.newRoomNo} / Bed ${activeShift.newBedNo}`
                : patient.room_no || '—';

        const patName = patient.patient_name || [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.name || '—';

        setIntentForm(prev => ({
            ...prev,
            ipnumber: ipNo,
            patient: {
                ...patient,
                displayName: patName,
                displayRoom: roomLabel,
                displayUhid: patient.uhid || patient.patient_id || '—'
            }
        }));

        setShowPatientModal(false);
        toast.success(`Selected patient: ${patName} (IP: ${ipNo})`);
    };

    // Clear All
    const handleClearAll = () => {
        setEditingIntentId(null);
        setIntentForm({
            date: dayjs().format('YYYY-MM-DD'),
            department: 'DEPT027',
            department_name: 'Cath lab',
            ipnumber: '',
            patient: null,
            items: []
        });
    };

    // Edit an existing intent
    const handleEditIntent = (intent) => {
        if (!intent) return;
        if (intent.is_billed) {
            toast.error('Cannot edit requisition: It has already been billed.');
            return;
        }

        setEditingIntentId(intent.intent_id);
        const mappedItems = (intent.items || []).map(it => ({
            item_id: it.item_id,
            name: it.name || it.itemName || '',
            hsn: it.hsn || '-',
            batch: it.batch || '',
            mrp: it.mrp !== undefined && it.mrp !== null ? it.mrp : '',
            quantity: Number(it.quantity) || 1,
            status: it.status || 'Pending',
            approved_quantity: Number(it.approved_quantity) || 0
        }));

        setIntentForm({
            date: intent.date ? dayjs(intent.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
            department: intent.department || 'DEPT027',
            department_name: 'Cath lab',
            ipnumber: intent.ipnumber || '',
            patient: intent.ipnumber ? {
                displayName: intent.patient_name || `IP: ${intent.ipnumber}`,
                displayUhid: intent.uhid || '—',
                displayRoom: '—',
                ip_number: intent.ipnumber
            } : null,
            items: mappedItems
        });

        // Preload batches for items
        mappedItems.forEach(it => {
            if (it.item_id) {
                fetchItemBatches(it.item_id);
            }
        });

        if (selectedIntentForModal) {
            setSelectedIntentForModal(null);
        }

        setActiveTab('create');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editing Cath Lab Intent ${intent.intent_id}. You can modify items, quantities, or patient.`);
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditingIntentId(null);
        handleClearAll();
        toast.info('Requisition edit cancelled.');
    };

    // Delete an existing intent (soft delete)
    const handleDeleteIntent = async (intent) => {
        if (!intent) return;
        if (intent.is_billed) {
            toast.error('Cannot delete requisition: It has already been billed.');
            return;
        }

        const confirm = window.confirm(`Are you sure you want to delete Cath Lab Intent Requisition "${intent.intent_id}"?`);
        if (!confirm) return;

        try {
            const res = await apiRequest(`${Hmsbaseurl}cathlab-intent/delete/${intent.intent_id}/`, 'POST');
            if (res && (res.status === 200 || res.data?.status === 'success')) {
                toast.success(`Cath Lab Intent requisition ${intent.intent_id} deleted successfully!`);
                loadCathLabIntents();
            } else {
                toast.error(res?.data?.error || res?.data?.message || 'Failed to delete requisition');
            }
        } catch (err) {
            console.error('Error deleting Cath Lab Intent:', err);
            toast.error(err.response?.data?.error || err.message || 'Error deleting requisition');
        }
    };

    // Raise / Update Intent Request (POST)
    const handleRaiseIntent = async () => {
        if (!intentForm.date) {
            toast.error('Please select an intent date.');
            return;
        }
        if (intentForm.items.length === 0) {
            toast.error('Please add at least one stock item to request.');
            return;
        }

        // Validate items have quantity
        for (let i = 0; i < intentForm.items.length; i++) {
            const it = intentForm.items[i];
            if (!it.quantity || it.quantity <= 0) {
                toast.error(`Please enter a valid quantity for "${it.name}"`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const currentEmployeeId =
                sessionStorage.getItem('employeeId') ||
                localStorage.getItem('employeeId') ||
                localStorage.getItem('userId') ||
                localStorage.getItem('user_id') ||
                sessionStorage.getItem('userId') ||
                '';

            const payload = {
                date: intentForm.date,
                department: intentForm.department || 'DEPT027',
                ipnumber: intentForm.ipnumber || '',
                patient_name: intentForm.patient?.displayName || '',
                uhid: intentForm.patient?.displayUhid || intentForm.patient?.uhid || '',
                created_by: currentEmployeeId || undefined,
                is_approved: true,
                items: intentForm.items.map(it => ({
                    item_id: it.item_id,
                    name: it.name,
                    hsn: it.hsn || '-',
                    batch: it.batch || '',
                    mrp: it.mrp !== undefined && it.mrp !== null ? it.mrp : '',
                    quantity: Number(it.quantity) || 1,
                    status: it.status || 'Pending',
                    approved_quantity: Number(it.approved_quantity) || 0
                }))
            };

            if (editingIntentId) {
                // Update existing intent
                const res = await apiRequest(`${Hmsbaseurl}cathlab-intent/update/${editingIntentId}/`, 'POST', payload);
                if (res && (res.status === 200 || res.data?.status === 'success')) {
                    toast.success(`Cath Lab Intent requisition ${editingIntentId} updated successfully!`);
                    setEditingIntentId(null);
                    handleClearAll();
                    loadCathLabIntents();
                    setActiveTab('report');
                } else {
                    toast.error(res?.data?.error || res?.data?.message || 'Failed to update Cath Lab intent');
                }
            } else {
                // Create new intent
                const res = await apiRequest(`${Hmsbaseurl}cathlab-intent/create/`, 'POST', payload);
                if (res && (res.status === 201 || res.data?.status === 'success' || res.data?.intent_id)) {
                    const newId = res.data?.intent_id || res.data?.data?.intent_id || '';
                    toast.success(`Cath Lab Intent requisition ${newId} created successfully!`);
                    handleClearAll();
                    loadCathLabIntents();
                    setActiveTab('report');
                } else {
                    toast.error(res?.data?.error || res?.data?.message || 'Failed to create Cath Lab intent');
                }
            }
        } catch (err) {
            console.error('Error submitting Cath Lab Intent:', err);
            toast.error(err.response?.data?.error || err.message || 'Error submitting requisition');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch reports
    const loadCathLabIntents = async () => {
        setLoadingReports(true);
        try {
            const res = await apiRequest(`${Hmsbaseurl}cathlab-intent/`, 'POST', {
                from_date: reportFilter.from_date,
                to_date: reportFilter.to_date,
                search: reportFilter.search
            });
            const data = (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];
            setIntentsList(data);
        } catch (err) {
            console.error('Error fetching Cath Lab intents history:', err);
        } finally {
            setLoadingReports(false);
        }
    };

    // Stock Report Loader
    const loadCathLabStockReport = useCallback(async () => {
        setLoadingStockReport(true);
        try {
            const res = await apiRequest(`${Hmsbaseurl}cathlab-stock-report/`, 'POST', {
                search: stockSearch,
                in_stock_only: inStockOnly
            });
            const data = (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];
            setStockReportData(data);
        } catch (err) {
            console.error('Error loading Cath Lab stock report:', err);
            toast.error('Failed to load Cath Lab stock report.');
        } finally {
            setLoadingStockReport(false);
        }
    }, [stockSearch, inStockOnly]);

    useEffect(() => {
        if (activeTab === 'report') {
            loadCathLabIntents();
        } else if (activeTab === 'stock') {
            loadCathLabStockReport();
        }
    }, [activeTab, loadCathLabStockReport]);

    // Export Stock Report to Excel
    const handleExportStockExcel = () => {
        if (!stockReportData || stockReportData.length === 0) {
            toast.info('No stock data to export');
            return;
        }

        const rows = [];
        stockReportData.forEach((row, idx) => {
            const batches = Array.isArray(row.batches) && row.batches.length > 0 ? row.batches : [{
                batch: row.batch || '-',
                grn_number: row.grn_number || '-',
                grn_date: row.grn_date || '-',
                mrp: row.mrp || 0,
                purchase_rate: row.purchase_rate || 0,
                expiry: row.expiry || '-'
            }];

            batches.forEach((b, bIdx) => {
                rows.push({
                    'Sl No': idx + 1,
                    'Item Code': row.item_id,
                    'Item Name': row.item_name,
                    'HSN': row.hsn || '-',
                    'Available Stock': row.stock || 0,
                    'Batch Index': `${bIdx + 1} of ${batches.length}`,
                    'Batch No': b.batch || '-',
                    'GRN Date': b.grn_date && b.grn_date !== '-' ? dayjs(b.grn_date).format('DD/MM/YYYY') : '-',
                    'GRN Number': b.grn_number || '-',
                    'MRP (₹)': Number(b.mrp) || Number(row.mrp) || 0,
                    'Expiry': b.expiry || '-'
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CathLab_Stock_Report');
        XLSX.writeFile(wb, `CathLab_Stock_Report_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (!intentsList || intentsList.length === 0) {
            toast.info('No records to export');
            return;
        }

        const rows = [];
        intentsList.forEach((intent, idx) => {
            const items = intent.items || [];
            if (items.length === 0) {
                rows.push({
                    'Sl No': idx + 1,
                    'Intent ID': intent.intent_id,
                    'Date': intent.date ? dayjs(intent.date).format('DD/MM/YYYY') : '',
                    'Department': intent.department || 'DEPT027',
                    'Patient Name': intent.patient_name || '-',
                    'UHID': intent.uhid || '-',
                    'IP Number': intent.ipnumber || '-',
                    'Item ID': '-',
                    'Item Name': '-',
                    'HSN': '-',
                    'Batch': '-',
                    'MRP': '-',
                    'For Bill Qty': 0,
                    'Total Amount (₹)': 0
                });
            } else {
                items.forEach((it, itIdx) => {
                    const rowQty = Number(it.quantity) || 0;
                    const rowMrp = Number(it.mrp) || 0;
                    rows.push({
                        'Sl No': `${idx + 1}.${itIdx + 1}`,
                        'Intent ID': intent.intent_id,
                        'Date': intent.date ? dayjs(intent.date).format('DD/MM/YYYY') : '',
                        'Department': intent.department || 'DEPT027',
                        'Patient Name': intent.patient_name || '-',
                        'UHID': intent.uhid || '-',
                        'IP Number': intent.ipnumber || '-',
                        'Item ID': it.item_id,
                        'Item Name': it.name,
                        'HSN': it.hsn || '-',
                        'Batch': it.batch || '-',
                        'MRP': it.mrp || '-',
                        'For Bill Qty': rowQty,
                        'Total Amount (₹)': rowQty * rowMrp
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CathLabIntents');
        XLSX.writeFile(wb, `CathLab_Intents_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
    };

    // Print Cath Lab Intents Log
    const handlePrintLog = () => {
        if (!intentsList || intentsList.length === 0) {
            toast.info('No Cath Lab requisitions to print for this period.');
            return;
        }
        printCathLabIntentsLog(intentsList, {
            fromDate: reportFilter.from_date,
            toDate: reportFilter.to_date,
            search: reportFilter.search
        });
    };

    // Print Single Cath Lab Intent Requisition Slip
    const handlePrintSingleIntent = (intent) => {
        if (!intent) return;
        printCathLabSingleIntent(intent);
    };

    const filteredStockReportData = useMemo(() => {
        return stockReportData.filter(
            r => !multiBatchOnly || (r.batch_count || (r.batches?.length || 0)) > 1
        );
    }, [stockReportData, multiBatchOnly]);

    const paginatedStockReportData = useMemo(() => {
        const start = (stockPage - 1) * stockPageSize;
        return filteredStockReportData.slice(start, start + stockPageSize);
    }, [filteredStockReportData, stockPage, stockPageSize]);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#0d9488' } }}>
            <CalendarGlobalStyles />
            <ModernContainer>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#ccfbf1', padding: '8px', borderRadius: '10px', color: '#0d9488' }}>
                                <FileText size={26} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                                    Cath Lab Intent Requisition
                                </h1>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                                    Raise material requisitions for Cath Lab patients with batch & MRP selection from GRN
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                        <S.Tab
                            active={activeTab === 'create'}
                            onClick={() => setActiveTab('create')}
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                            <Plus size={16} /> {editingIntentId ? `Edit Intent (${editingIntentId})` : 'Raise Cath Lab Intent'}
                        </S.Tab>
                        <S.Tab
                            active={activeTab === 'report'}
                            onClick={() => setActiveTab('report')}
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                            <FileText size={16} /> Reports & Logs
                        </S.Tab>
                        <S.Tab
                            active={activeTab === 'stock'}
                            onClick={() => setActiveTab('stock')}
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                            <Package size={16} /> Stock Report
                        </S.Tab>
                    </div>
                </div>

                {/* 1. Raise / Edit Intent Tab */}
                {activeTab === 'create' && (
                    <>
                        <SectionFrame>
                            <SectionHeader>
                                <h3>{editingIntentId ? `EDIT CATH LAB REQUISITION (${editingIntentId})` : 'NEW CATH LAB REQUISITION'}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {editingIntentId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            style={{
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                color: '#b91c1c',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✕ Cancel Edit
                                        </button>
                                    )}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: '#ccfbf1',
                                        color: '#0f766e',
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        border: '1px solid #99f6e4'
                                    }}>
                                        DEPARTMENT: DEPT027
                                    </span>
                                </div>
                            </SectionHeader>
                            <FormGrid>
                                {/* Intent Date */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Intent Date</S.Label>
                                    <DatePicker
                                        value={dayjs(intentForm.date)}
                                        onChange={d => setIntentForm({ ...intentForm, date: d ? d.format('YYYY-MM-DD') : '' })}
                                        format="DD/MM/YYYY"
                                        style={{ height: '42px', borderRadius: '8px' }}
                                    />
                                </div>

                                {/* Requesting Department */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Requesting Department</S.Label>
                                    <div style={{
                                        height: '42px',
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 14px',
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        fontSize: '0.92rem',
                                        gap: '8px'
                                    }}>
                                        <Building2 size={16} color="#0d9488" />
                                        <span>Cath lab (DEPT027)</span>
                                    </div>
                                </div>

                                {/* IP Number with Patient Search */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>IP Number (Inpatient)</span>
                                        <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>Optional / Recommended</span>
                                    </S.Label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <S.Input
                                            placeholder="Enter or Search IP Number (e.g. S026/007800)"
                                            value={intentForm.ipnumber}
                                            onChange={e => setIntentForm({ ...intentForm, ipnumber: e.target.value })}
                                            style={{ height: '42px', borderRadius: '8px' }}
                                        />
                                        <S.Button
                                            type="button"
                                            onClick={() => setShowPatientModal(true)}
                                            style={{
                                                background: '#0d9488',
                                                color: '#ffffff',
                                                height: '42px',
                                                padding: '0 16px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap'
                                            }}
                                            title="Search Inpatient by Name, IP Number or UHID"
                                        >
                                            <Search size={15} /> Search IP
                                        </S.Button>
                                        {intentForm.ipnumber && (
                                            <S.Button
                                                type="button"
                                                onClick={() => setIntentForm(prev => ({ ...prev, ipnumber: '', patient: null }))}
                                                style={{
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    border: '1px solid #fecaca',
                                                    height: '42px',
                                                    padding: '0 12px',
                                                    borderRadius: '8px'
                                                }}
                                                title="Clear selected patient"
                                            >
                                                <X size={15} />
                                            </S.Button>
                                        )}
                                    </div>

                                    {/* Patient Info Tag if selected */}
                                    {intentForm.patient && (
                                        <PatientInfoCard>
                                            <PatientDetailItem>
                                                <User size={14} />
                                                <span>Patient: <strong>{intentForm.patient.displayName}</strong></span>
                                            </PatientDetailItem>
                                            <PatientDetailItem>
                                                <Tag size={14} />
                                                <span>UHID: <strong>{intentForm.patient.displayUhid}</strong></span>
                                            </PatientDetailItem>
                                            <PatientDetailItem>
                                                <Bed size={14} />
                                                <span>Room/Bed: <strong>{intentForm.patient.displayRoom}</strong></span>
                                            </PatientDetailItem>
                                        </PatientInfoCard>
                                    )}
                                </div>
                            </FormGrid>
                        </SectionFrame>

                        {/* Items Collection Section */}
                        <SectionFrame>
                            <SectionHeader>
                                <h3>ITEMS COLLECTION ({intentForm.items.length})</h3>
                                <div style={{ width: '480px', maxWidth: '100%' }}>
                                    <Select
                                        showSearch
                                        placeholder={loadingItems ? 'Loading Cath Lab items...' : '+ Add Cath Lab Stock Item...'}
                                        value={null}
                                        onSelect={handleAddItem}
                                        loading={loadingItems}
                                        style={{ width: '100%', height: '40px' }}
                                        filterOption={(input, option) => {
                                            const searchStr = `${option?.data_name || ''} ${option?.data_id || ''} ${option?.data_hsn || ''}`.toLowerCase();
                                            return searchStr.includes(input.toLowerCase());
                                        }}
                                    >
                                        {itemsMaster.map(i => {
                                            const stockVal = Number(i.available_stock ?? i.stock) || 0;
                                            const hasStock = stockVal > 0;
                                            return (
                                                <Option
                                                    key={i.item_id}
                                                    value={i.item_id}
                                                    data_name={i.itemName || i.name}
                                                    data_id={i.item_id}
                                                    data_hsn={i.hsn}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                            <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {i.itemName || i.name}
                                                            </span>
                                                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                {i.item_id} {i.hsn && i.hsn !== '-' ? `• HSN: ${i.hsn}` : ''}
                                                            </span>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: hasStock ? '#ecfdf5' : '#fef2f2',
                                                            color: hasStock ? '#047857' : '#b91c1c',
                                                            border: `1px solid ${hasStock ? '#a7f3d0' : '#fecaca'}`,
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        }}>
                                                            Available: {stockVal}
                                                        </span>
                                                    </div>
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </div>
                            </SectionHeader>

                            <div style={{ padding: '0 0 24px 0', overflowX: 'auto' }}>
                                {intentForm.items.length > 0 ? (
                                    <ItemsTable>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '60px', textAlign: 'center' }}>SL.NO</th>
                                                <th>ITEM DESCRIPTION</th>
                                                <th style={{ width: '110px' }}>HSN</th>
                                                <th style={{ width: '220px' }}>BATCH (FROM GRN)</th>
                                                <th style={{ width: '130px', textAlign: 'right' }}>MRP (₹)</th>
                                                <th style={{ width: '140px', textAlign: 'center' }}>QUANTITY (TO REQUEST)</th>
                                                <th style={{ width: '70px', textAlign: 'center' }}>DEL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {intentForm.items.map((it, idx) => {
                                                const batches = batchCache[it.item_id] || [];
                                                const isBatchLoading = loadingBatches[it.item_id];

                                                return (
                                                    <tr key={it.item_id}>
                                                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                                {it.item_id}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                                                {it.hsn || '-'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {isBatchLoading ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0d9488' }}>
                                                                    <Spin size="small" /> Loading GRN batches...
                                                                </div>
                                                            ) : batches.length > 0 ? (
                                                                <Select
                                                                    value={it.batch || undefined}
                                                                    placeholder="Select Batch"
                                                                    onChange={val => handleBatchChange(it.item_id, val)}
                                                                    style={{ width: '100%', height: '36px' }}
                                                                >
                                                                    {batches.map((b, bIdx) => (
                                                                        <Option key={bIdx} value={b.batch}>
                                                                            {b.batch} {b.mrp ? `(₹${b.mrp})` : ''} {b.expiry ? `[Exp: ${b.expiry}]` : ''}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            ) : (
                                                                <S.Input
                                                                    placeholder="No GRN batch / Type batch"
                                                                    value={it.batch}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        setIntentForm(prev => ({
                                                                            ...prev,
                                                                            items: prev.items.map(x => x.item_id === it.item_id ? { ...x, batch: val } : x)
                                                                        }));
                                                                    }}
                                                                    style={{ height: '36px', fontSize: '0.85rem' }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{
                                                                fontWeight: 700,
                                                                color: it.mrp ? '#0d9488' : '#94a3b8',
                                                                fontSize: '0.95rem'
                                                            }}>
                                                                {it.mrp ? `₹${Number(it.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <S.Input
                                                                type="number"
                                                                min="1"
                                                                value={it.quantity}
                                                                onChange={e => handleQuantityChange(it.item_id, e.target.value)}
                                                                style={{
                                                                    width: '90px',
                                                                    height: '36px',
                                                                    textAlign: 'center',
                                                                    fontWeight: 700,
                                                                    borderRadius: '6px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(it.item_id)}
                                                                style={{
                                                                    background: '#fee2e2',
                                                                    border: '1px solid #fecaca',
                                                                    color: '#ef4444',
                                                                    borderRadius: '6px',
                                                                    padding: '6px 8px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                                title="Remove item"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </ItemsTable>
                                ) : (
                                    <EmptyState>
                                        <div className="icon">📦</div>
                                        <h4 style={{ margin: 0, color: '#334155' }}>Your Cath Lab Requisition bucket is empty</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                            Use the item search above to select materials and assign GRN batches.
                                        </p>
                                    </EmptyState>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 24px',
                                background: '#f8fafc',
                                borderTop: '1px solid #e2e8f0',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                                    Total Items: <strong>{intentForm.items.length}</strong> | Total Requested Qty: <strong>{intentForm.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <S.Button
                                        type="button"
                                        onClick={editingIntentId ? handleCancelEdit : handleClearAll}
                                        style={{
                                            background: '#64748b',
                                            color: '#ffffff',
                                            padding: '8px 20px',
                                            borderRadius: '8px',
                                            fontWeight: 600
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {editingIntentId ? 'Cancel Edit' : 'Clear All'}
                                    </S.Button>
                                    <S.Button
                                        type="button"
                                        onClick={handleRaiseIntent}
                                        style={{
                                            background: editingIntentId ? '#2563eb' : '#0d9488',
                                            color: '#ffffff',
                                            padding: '8px 24px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            boxShadow: editingIntentId ? '0 2px 4px rgba(37,99,235,0.2)' : '0 2px 4px rgba(13,148,136,0.2)'
                                        }}
                                        disabled={isSubmitting || intentForm.items.length === 0}
                                    >
                                        {isSubmitting ? (editingIntentId ? 'Updating Requisition...' : 'Raising Request...') : (editingIntentId ? 'Update Intent Requisition' : 'Raise Intent Request')}
                                    </S.Button>
                                </div>
                            </div>
                        </SectionFrame>
                    </>
                )}

                {/* 2. Reports & Logs Tab */}
                {activeTab === 'report' && (
                    <SectionFrame>
                        <SectionHeader>
                            <h3>CATH LAB INTENT REQUISITIONS LOG</h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <S.Button
                                    onClick={handleExportExcel}
                                    style={{
                                        background: '#10b981',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                >
                                    <Download size={14} /> Export Excel
                                </S.Button>
                                <S.Button
                                    onClick={handlePrintLog}
                                    style={{
                                        background: '#4f46e5',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                    title="Print Cath Lab Intent Requisitions Log"
                                >
                                    <Printer size={14} /> Print Log
                                </S.Button>
                                <S.Button
                                    onClick={loadCathLabIntents}
                                    style={{
                                        background: '#0d9488',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                >
                                    <RefreshCw size={14} /> Refresh
                                </S.Button>
                            </div>
                        </SectionHeader>

                        {/* Filter Bar */}
                        <div style={{
                            padding: '16px 24px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>From:</span>
                                <DatePicker
                                    value={dayjs(reportFilter.from_date)}
                                    onChange={d => setReportFilter({ ...reportFilter, from_date: d ? d.format('YYYY-MM-DD') : '' })}
                                    format="DD/MM/YYYY"
                                    style={{ height: '36px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>To:</span>
                                <DatePicker
                                    value={dayjs(reportFilter.to_date)}
                                    onChange={d => setReportFilter({ ...reportFilter, to_date: d ? d.format('YYYY-MM-DD') : '' })}
                                    format="DD/MM/YYYY"
                                    style={{ height: '36px' }}
                                />
                            </div>
                            <div style={{ flex: '1 1 240px' }}>
                                <S.Input
                                    placeholder="Filter by Intent ID, Patient Name, UHID, IP Number, Item..."
                                    value={reportFilter.search}
                                    onChange={e => setReportFilter({ ...reportFilter, search: e.target.value })}
                                    style={{ height: '36px' }}
                                />
                            </div>
                            <S.Button
                                onClick={loadCathLabIntents}
                                style={{
                                    background: '#0d9488',
                                    color: '#ffffff',
                                    height: '36px',
                                    padding: '0 16px',
                                    fontWeight: 600,
                                    borderRadius: '6px'
                                }}
                            >
                                <Search size={14} /> Apply Filter
                            </S.Button>
                        </div>

                        {/* Reports Table */}
                        <div style={{ padding: '0 0 24px 0', overflowX: 'auto' }}>
                            {loadingReports ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: '#0d9488' }}>
                                    <Spin size="large" />
                                    <div style={{ marginTop: '12px', fontWeight: 600 }}>Loading Cath Lab intents...</div>
                                </div>
                            ) : intentsList.length === 0 ? (
                                <EmptyState>
                                    <div className="icon">📄</div>
                                    <h4 style={{ margin: 0, color: '#334155' }}>No Cath Lab intents found</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Try adjusting your date or search filters.</p>
                                </EmptyState>
                            ) : (
                                <ItemsTable>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                            <th style={{ minWidth: '105px' }}>DATE</th>
                                            <th style={{ minWidth: '125px' }}>INTENT ID</th>
                                            <th style={{ minWidth: '150px' }}>PATIENT NAME</th>
                                            <th style={{ minWidth: '110px' }}>UHID</th>
                                            <th style={{ minWidth: '115px' }}>IP NUMBER</th>
                                            <th>ITEMS</th>
                                            <th style={{ textAlign: 'center', width: '90px' }}>FOR BILL</th>
                                            <th style={{ textAlign: 'right', width: '130px' }}>TOTAL AMOUNT</th>
                                            <th style={{ textAlign: 'center', minWidth: '180px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {intentsList.map((intent, idx) => {
                                            const items = intent.items || [];
                                            const totalReq = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
                                            const totalAmount = items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.mrp) || 0)), 0);
                                            const isBilled = !!intent.is_billed;
                                            const canModify = !isBilled;

                                            return (
                                                <tr key={intent.intent_id || idx}>
                                                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                                            {intent.date ? dayjs(intent.date).format('DD/MM/YYYY') : '-'}
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={11} />
                                                            {intent.created_date ? dayjs(intent.created_date).format('hh:mm A') : ''}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontWeight: 800,
                                                            color: '#0d9488',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.95rem'
                                                        }}>
                                                            {intent.intent_id}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                                                            {intent.patient_name || '—'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontWeight: 600,
                                                            color: '#475569',
                                                            fontSize: '0.84rem'
                                                        }}>
                                                            {intent.uhid || '—'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {intent.ipnumber ? (
                                                            <span style={{
                                                                background: '#dbeafe',
                                                                color: '#1e40af',
                                                                padding: '3px 8px',
                                                                borderRadius: '6px',
                                                                fontWeight: 700,
                                                                fontSize: '0.82rem',
                                                                border: '1px solid #bfdbfe'
                                                            }}>
                                                                👤 {intent.ipnumber}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                            {items.length} {items.length === 1 ? 'item' : 'items'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {items.map(it => it.name).filter(Boolean).join(', ') || '-'}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                                        <span style={{
                                                            background: '#f1f5f9',
                                                            padding: '3px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            color: '#334155',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            {totalReq}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0d9488', fontSize: '0.92rem' }}>
                                                        {totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedIntentForModal(intent)}
                                                                style={{
                                                                    background: '#f0fdfa',
                                                                    border: '1px solid #99f6e4',
                                                                    color: '#0d9488',
                                                                    borderRadius: '6px',
                                                                    padding: '5px 8px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 600
                                                                }}
                                                                title="View requisition details"
                                                            >
                                                                <Eye size={13} /> View
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handlePrintSingleIntent(intent)}
                                                                style={{
                                                                    background: '#f8fafc',
                                                                    border: '1px solid #cbd5e1',
                                                                    color: '#334155',
                                                                    borderRadius: '6px',
                                                                    padding: '5px 8px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 600
                                                                }}
                                                                title="Print this requisition slip"
                                                            >
                                                                <Printer size={13} /> Print
                                                            </button>

                                                            {canModify ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditIntent(intent)}
                                                                        style={{
                                                                            background: '#eff6ff',
                                                                            border: '1px solid #bfdbfe',
                                                                            color: '#2563eb',
                                                                            borderRadius: '6px',
                                                                            padding: '5px 8px',
                                                                            cursor: 'pointer',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            fontSize: '0.78rem',
                                                                            fontWeight: 600
                                                                        }}
                                                                        title="Edit this requisition"
                                                                    >
                                                                        <Edit3 size={13} /> Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteIntent(intent)}
                                                                        style={{
                                                                            background: '#fef2f2',
                                                                            border: '1px solid #fecaca',
                                                                            color: '#dc2626',
                                                                            borderRadius: '6px',
                                                                            padding: '5px 8px',
                                                                            cursor: 'pointer',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            fontSize: '0.78rem',
                                                                            fontWeight: 600
                                                                        }}
                                                                        title="Delete (deactivate) this requisition"
                                                                    >
                                                                        <Trash2 size={13} /> Delete
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span
                                                                    title="Billed requisition (Locked)"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px',
                                                                        fontSize: '0.72rem',
                                                                        color: '#94a3b8',
                                                                        background: '#f1f5f9',
                                                                        border: '1px solid #e2e8f0',
                                                                        padding: '4px 6px',
                                                                        borderRadius: '4px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    <Lock size={11} /> Billed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </ItemsTable>
                            )}
                        </div>
                    </SectionFrame>
                )}

                {/* 3. Cath Lab Stock Report Tab */}
                {activeTab === 'stock' && (
                    <SectionFrame>
                        <SectionHeader>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={20} color="#0d9488" />
                                <h3 style={{ margin: 0 }}>CATH LAB DEPARTMENT STOCK REPORT</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <S.Button
                                    onClick={handleExportStockExcel}
                                    style={{
                                        background: '#10b981',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                >
                                    <Download size={14} /> Export Excel
                                </S.Button>
                                <S.Button
                                    onClick={() => window.print()}
                                    style={{
                                        background: '#3b82f6',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                >
                                    <Printer size={14} /> Print
                                </S.Button>
                                <S.Button
                                    onClick={loadCathLabStockReport}
                                    style={{
                                        background: '#0d9488',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600
                                    }}
                                >
                                    <RefreshCw size={14} /> Refresh
                                </S.Button>
                            </div>
                        </SectionHeader>

                        {/* Filter Bar */}
                        <div style={{
                            padding: '16px 24px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', gap: '12px', flex: '1 1 350px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <S.Input
                                        placeholder="Search by Item Name, Item Code, Batch, GRN No..."
                                        value={stockSearch}
                                        onChange={e => setStockSearch(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') loadCathLabStockReport(); }}
                                        style={{ height: '38px', width: '100%' }}
                                    />
                                </div>
                                <S.Button
                                    onClick={loadCathLabStockReport}
                                    style={{
                                        background: '#0d9488',
                                        color: '#ffffff',
                                        height: '38px',
                                        padding: '0 18px',
                                        fontWeight: 600,
                                        borderRadius: '6px'
                                    }}
                                >
                                    <Search size={14} /> Search
                                </S.Button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                                    <input
                                        type="checkbox"
                                        checked={inStockOnly}
                                        onChange={e => setInStockOnly(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#0d9488', cursor: 'pointer' }}
                                    />
                                    <span>Show In-Stock Only</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#0f766e' }}>
                                    <input
                                        type="checkbox"
                                        checked={multiBatchOnly}
                                        onChange={e => setMultiBatchOnly(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#0f766e', cursor: 'pointer' }}
                                    />
                                    <span>Show Multiple Batches Only ({stockReportData.filter(r => (r.batch_count || (r.batches?.length || 0)) > 1).length})</span>
                                </label>
                            </div>
                        </div>

                        {/* Summary Badges */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '14px',
                            padding: '16px 24px',
                            background: '#ffffff',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>Total Department Items</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#115e59', marginTop: '4px' }}>
                                    {stockReportData.length}
                                </div>
                            </div>
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Items In Stock</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
                                    {stockReportData.filter(r => (Number(r.stock) || 0) > 0).length}
                                </div>
                            </div>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Available Stock Units</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
                                    {stockReportData.reduce((a, b) => a + (Number(b.stock) || 0), 0)}
                                </div>
                            </div>
                            <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '8px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a21caf', textTransform: 'uppercase' }}>Multiple Batch Items</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#86198f', marginTop: '4px' }}>
                                    {stockReportData.filter(r => (r.batch_count || (r.batches?.length || 0)) > 1).length}
                                </div>
                            </div>
                            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>Total Stock Valuation</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#854d0e', marginTop: '4px' }}>
                                    ₹{stockReportData.reduce((a, b) => a + ((Number(b.stock) || 0) * (Number(b.mrp) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        {/* Stock Report Table */}
                        <div style={{ padding: '0 0 24px 0', overflowX: 'auto' }}>
                            {loadingStockReport ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: '#0d9488' }}>
                                    <Spin size="large" />
                                    <div style={{ marginTop: '12px', fontWeight: 600 }}>Loading Cath Lab Stock Report...</div>
                                </div>
                            ) : stockReportData.length === 0 ? (
                                <EmptyState>
                                    <div className="icon">📦</div>
                                    <h4 style={{ margin: 0, color: '#334155' }}>No Cath Lab Stock items found</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Try clearing filters or search term.</p>
                                </EmptyState>
                            ) : (
                                <>
                                    <ItemsTable>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                                            <th style={{ width: '130px' }}>ITEM CODE</th>
                                            <th>ITEM NAME</th>
                                            <th style={{ width: '80px' }}>HSN</th>
                                            <th style={{ textAlign: 'center', width: '140px' }}>AVAILABLE STOCK</th>
                                            <th style={{ width: '150px' }}>BATCH DETAILS</th>
                                            <th style={{ width: '110px' }}>GRN DATE</th>
                                            <th style={{ textAlign: 'right', width: '130px' }}>MRP (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStockReportData.map((row, pageIdx) => {
                                            const globalIdx = (stockPage - 1) * stockPageSize + pageIdx;
                                            const isPositive = (Number(row.stock) || 0) > 0;
                                            const batches = Array.isArray(row.batches) && row.batches.length > 0 ? row.batches : (row.batch && row.batch !== '-' ? [{ batch: row.batch, grn_number: row.grn_number, grn_date: row.grn_date, mrp: row.mrp, expiry: row.expiry }] : []);
                                            const hasMultiBatch = batches.length > 1;
                                            const isExpanded = expandedItemIds.has(row.item_id);

                                            return (
                                                <React.Fragment key={`${row.item_id}_${globalIdx}`}>
                                                    <tr style={{ background: isExpanded ? '#f0fdfa' : 'transparent', transition: 'background 0.2s' }}>
                                                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                                                            {globalIdx + 1}
                                                        </td>
                                                            <td>
                                                                <span style={{
                                                                    fontFamily: 'monospace',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.82rem',
                                                                    color: '#0d9488',
                                                                    background: '#f0fdfa',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ccfbf1'
                                                                }}>
                                                                    {row.item_id}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.item_name}</div>
                                                            </td>
                                                            <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                                {row.hsn || '-'}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '3px 10px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 800,
                                                                    background: isPositive ? '#ecfdf5' : '#fef2f2',
                                                                    color: isPositive ? '#047857' : '#b91c1c',
                                                                    border: `1px solid ${isPositive ? '#a7f3d0' : '#fecaca'}`
                                                                }}>
                                                                    {row.stock} units
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {hasMultiBatch ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleExpandItem(row.item_id)}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            background: isExpanded ? '#0d9488' : '#e0f2fe',
                                                                            color: isExpanded ? '#ffffff' : '#0369a1',
                                                                            border: `1px solid ${isExpanded ? '#0d9488' : '#bae6fd'}`,
                                                                            padding: '3px 9px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.78rem',
                                                                            fontWeight: 700,
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s ease'
                                                                        }}
                                                                        title="Click to view all batches"
                                                                    >
                                                                        <Layers size={13} />
                                                                        <span>{batches.length} Batches</span>
                                                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                                    </button>
                                                                ) : batches.length === 1 ? (
                                                                    <span style={{
                                                                        fontFamily: 'monospace',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.82rem',
                                                                        background: '#fef3c7',
                                                                        color: '#92400e',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid #fde68a'
                                                                    }}>
                                                                        {batches[0].batch}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Opening Stock</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontSize: '0.82rem', color: row.grn_date !== '-' ? '#0f172a' : '#94a3b8', fontWeight: row.grn_date !== '-' ? 600 : 400 }}>
                                                                    {row.grn_date && row.grn_date !== '-' ? dayjs(row.grn_date).format('DD/MM/YYYY') : '—'}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0d9488' }}>
                                                                {Number(row.mrp) > 0 ? `₹${Number(row.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Batches Sub-Table */}
                                                        {isExpanded && hasMultiBatch && (
                                                            <tr style={{ background: '#f8fafc' }}>
                                                                <td colSpan="8" style={{ padding: '12px 20px', borderBottom: '2px solid #0d9488' }}>
                                                                    <div style={{
                                                                        background: '#ffffff',
                                                                        border: '1px solid #cbd5e1',
                                                                        borderRadius: '8px',
                                                                        padding: '12px 16px',
                                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                                                    }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f766e', fontSize: '0.85rem' }}>
                                                                                <Layers size={15} /> All Batches for {row.item_name} ({batches.length} Batches Tracked)
                                                                            </div>
                                                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                                                Item Code: <strong style={{ color: '#0f172a' }}>{row.item_id}</strong> | Available Stock: <strong style={{ color: '#047857' }}>{row.stock} units</strong>
                                                                            </div>
                                                                        </div>
                                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                                            <thead>
                                                                                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                                                                    <th style={{ padding: '6px 10px', width: '30px' }}>#</th>
                                                                                    <th style={{ padding: '6px 10px', width: '140px' }}>BATCH NO</th>
                                                                                    <th style={{ padding: '6px 10px', width: '160px' }}>GRN NUMBER</th>
                                                                                    <th style={{ padding: '6px 10px', width: '110px' }}>GRN DATE</th>
                                                                                    <th style={{ padding: '6px 10px', width: '100px' }}>EXPIRY</th>
                                                                                    <th style={{ padding: '6px 10px', textAlign: 'right', width: '130px' }}>MRP (₹)</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {batches.map((b, bIdx) => (
                                                                                    <tr key={bIdx} style={{ borderBottom: '1px solid #f8fafc', background: bIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                                                                        <td style={{ padding: '6px 10px', color: '#94a3b8', fontWeight: 600 }}>{bIdx + 1}</td>
                                                                                        <td style={{ padding: '6px 10px' }}>
                                                                                            <span style={{
                                                                                                fontFamily: 'monospace',
                                                                                                fontWeight: 700,
                                                                                                background: '#fef3c7',
                                                                                                color: '#92400e',
                                                                                                padding: '2px 8px',
                                                                                                borderRadius: '4px',
                                                                                                border: '1px solid #fde68a'
                                                                                            }}>
                                                                                                {b.batch}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#475569' }}>
                                                                                            {b.grn_number || '—'}
                                                                                        </td>
                                                                                        <td style={{ padding: '6px 10px', color: '#334155', fontWeight: 500 }}>
                                                                                            {b.grn_date && b.grn_date !== '-' ? dayjs(b.grn_date).format('DD/MM/YYYY') : '—'}
                                                                                        </td>
                                                                                        <td style={{ padding: '6px 10px', color: '#64748b' }}>
                                                                                            {b.expiry || '—'}
                                                                                        </td>
                                                                                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0d9488' }}>
                                                                                            {Number(b.mrp) > 0 ? `₹${Number(b.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                    </tbody>
                                </ItemsTable>
                                {filteredStockReportData.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 24px',
                                        background: '#ffffff',
                                        borderTop: '1px solid #e2e8f0',
                                        flexWrap: 'wrap',
                                        gap: '14px'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                                            Showing <strong>{(stockPage - 1) * stockPageSize + 1}</strong> to{' '}
                                            <strong>{Math.min(stockPage * stockPageSize, filteredStockReportData.length)}</strong> of{' '}
                                            <strong>{filteredStockReportData.length}</strong> items
                                            {multiBatchOnly ? ' (Filtered: Multiple Batches Only)' : ''}
                                        </div>
                                        <Pagination
                                            current={stockPage}
                                            pageSize={stockPageSize}
                                            total={filteredStockReportData.length}
                                            showSizeChanger
                                            pageSizeOptions={['10', '25', '50', '100']}
                                            showQuickJumper
                                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                                            onChange={(page, size) => {
                                                setStockPage(page);
                                                setStockPageSize(size);
                                            }}
                                        />
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </SectionFrame>
                )}

                {/* Patient Search Modal */}
                {showPatientModal && (
                    <PatientSearchModal
                        isOpen={showPatientModal}
                        onClose={() => setShowPatientModal(false)}
                        onSelect={handlePatientSelect}
                        mode="ip"
                        title="Search Inpatient for Cath Lab Intent"
                    />
                )}

                {/* Details View Modal */}
                {selectedIntentForModal && (
                    <S.ModalOverlay onClick={() => setSelectedIntentForModal(null)}>
                        <S.ModalContainer style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
                            <S.ModalHeader style={{ background: '#0d9488', color: '#ffffff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} />
                                    <h3 style={{ margin: 0, color: '#ffffff' }}>Cath Lab Intent: {selectedIntentForModal.intent_id}</h3>
                                </div>
                                <S.CloseButton onClick={() => setSelectedIntentForModal(null)}>✕</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody style={{ padding: '24px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '16px',
                                    background: '#f8fafc',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department</div>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>Cath lab (DEPT027)</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Date</div>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedIntentForModal.date ? dayjs(selectedIntentForModal.date).format('DD/MM/YYYY') : '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Patient Name</div>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedIntentForModal.patient_name || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>UHID</div>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedIntentForModal.uhid || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>IP Number</div>
                                        <div style={{ fontWeight: 700, color: '#1e40af' }}>{selectedIntentForModal.ipnumber || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Amount</div>
                                        <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '1.05rem' }}>
                                            ₹{(selectedIntentForModal.items || []).reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.mrp) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
                                    REQUESTED ITEMS ({selectedIntentForModal.items?.length || 0})
                                </h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <thead style={{ background: '#0d9488', color: '#ffffff' }}>
                                        <tr>
                                            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem' }}>#</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem' }}>ITEM</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem' }}>HSN</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem' }}>BATCH</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem' }}>MRP</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem' }}>FOR BILL</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem' }}>AMOUNT (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedIntentForModal.items || []).map((it, idx) => {
                                            const itemTotal = (Number(it.quantity) || 0) * (Number(it.mrp) || 0);
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{it.name}</td>
                                                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{it.hsn || '-'}</td>
                                                    <td style={{ padding: '8px 12px', color: '#0d9488', fontWeight: 600 }}>{it.batch || '-'}</td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{it.mrp ? `₹${Number(it.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0d9488' }}>
                                                        {itemTotal > 0 ? `₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                                            <td colSpan="5" style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>TOTAL:</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0f172a' }}>
                                                {(selectedIntentForModal.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0d9488', fontSize: '0.95rem' }}>
                                                ₹{(selectedIntentForModal.items || []).reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.mrp) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </S.ModalBody>
                            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <S.Button
                                    onClick={() => handlePrintSingleIntent(selectedIntentForModal)}
                                    style={{ background: '#0d9488', color: '#ffffff', padding: '6px 16px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                    title="Print this requisition slip"
                                >
                                    <Printer size={14} /> Print Slip
                                </S.Button>
                                {!selectedIntentForModal.is_billed && (
                                    <S.Button
                                        onClick={() => handleEditIntent(selectedIntentForModal)}
                                        style={{ background: '#2563eb', color: '#ffffff', padding: '6px 16px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                    >
                                        <Edit3 size={14} /> Edit Requisition
                                    </S.Button>
                                )}
                                <S.Button
                                    onClick={() => setSelectedIntentForModal(null)}
                                    style={{ background: '#64748b', color: '#ffffff', padding: '6px 16px', borderRadius: '6px' }}
                                >
                                    Close
                                </S.Button>
                            </div>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}
            </ModernContainer>
        </ConfigProvider>
    );
};

export default CathLabIndent;

