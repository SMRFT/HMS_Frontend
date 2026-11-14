import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker, Select, ConfigProvider, Spin } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../Auth/apiRequest';
import * as S from '../GlobalStyles';
import PatientSearchModal from '../Common/PatientSearchModal';
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
    Eye,
    Printer,
    AlertCircle
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
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'report'

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
        setIntentForm({
            date: dayjs().format('YYYY-MM-DD'),
            department: 'DEPT027',
            department_name: 'Cath lab',
            ipnumber: '',
            patient: null,
            items: []
        });
    };

    // Raise Intent Request (POST)
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
                created_by: currentEmployeeId || undefined,
                items: intentForm.items.map(it => ({
                    item_id: it.item_id,
                    name: it.name,
                    hsn: it.hsn || '-',
                    batch: it.batch || '',
                    mrp: it.mrp !== undefined && it.mrp !== null ? it.mrp : '',
                    quantity: Number(it.quantity) || 1,
                    status: 'Pending',
                    approved_quantity: 0
                }))
            };

            const res = await apiRequest(`${Hmsbaseurl}cathlab-intent/create/`, 'POST', payload);
            if (res && (res.status === 201 || res.data?.status === 'success' || res.data?.intent_id)) {
                const newId = res.data?.intent_id || res.data?.data?.intent_id || '';
                toast.success(`Cath Lab Intent requisition ${newId} created successfully!`);
                handleClearAll();
                // Switch to report tab to show newly created intent
                loadCathLabIntents();
                setActiveTab('report');
            } else {
                toast.error(res?.data?.error || res?.data?.message || 'Failed to create Cath Lab intent');
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

    useEffect(() => {
        if (activeTab === 'report') {
            loadCathLabIntents();
        }
    }, [activeTab]);

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
                    'IP Number': intent.ipnumber || '-',
                    'Status': intent.is_approved ? 'Approved' : 'Pending',
                    'Item ID': '-',
                    'Item Name': '-',
                    'HSN': '-',
                    'Batch': '-',
                    'MRP': '-',
                    'Req Qty': 0,
                    'Approved Qty': 0
                });
            } else {
                items.forEach((it, itIdx) => {
                    rows.push({
                        'Sl No': `${idx + 1}.${itIdx + 1}`,
                        'Intent ID': intent.intent_id,
                        'Date': intent.date ? dayjs(intent.date).format('DD/MM/YYYY') : '',
                        'Department': intent.department || 'DEPT027',
                        'IP Number': intent.ipnumber || '-',
                        'Status': intent.is_approved ? 'Approved' : (it.status || 'Pending'),
                        'Item ID': it.item_id,
                        'Item Name': it.name,
                        'HSN': it.hsn || '-',
                        'Batch': it.batch || '-',
                        'MRP': it.mrp || '-',
                        'Req Qty': it.quantity || 0,
                        'Approved Qty': it.approved_quantity || 0
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CathLabIntents');
        XLSX.writeFile(wb, `CathLab_Intents_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
    };

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
                    <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <S.Tab
                            active={activeTab === 'create'}
                            onClick={() => setActiveTab('create')}
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                            <Plus size={16} /> Raise Cath Lab Intent
                        </S.Tab>
                        <S.Tab
                            active={activeTab === 'report'}
                            onClick={() => setActiveTab('report')}
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                            <FileText size={16} /> Reports & Logs
                        </S.Tab>
                    </div>
                </div>

                {/* 1. Raise Intent Tab */}
                {activeTab === 'create' && (
                    <>
                        <SectionFrame>
                            <SectionHeader>
                                <h3>NEW CATH LAB REQUISITION</h3>
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
                                <div style={{ width: '380px', maxWidth: '100%' }}>
                                    <Select
                                        showSearch
                                        placeholder={loadingItems ? 'Loading Cath Lab items...' : '+ Add Cath Lab Stock Item...'}
                                        value={null}
                                        onSelect={handleAddItem}
                                        loading={loadingItems}
                                        style={{ width: '100%', height: '40px' }}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {itemsMaster.map(i => (
                                            <Option key={i.item_id} value={i.item_id}>
                                                {i.itemName || i.name} {i.hsn && i.hsn !== '-' ? `(HSN: ${i.hsn})` : ''}
                                            </Option>
                                        ))}
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
                                        onClick={handleClearAll}
                                        style={{
                                            background: '#64748b',
                                            color: '#ffffff',
                                            padding: '8px 20px',
                                            borderRadius: '8px',
                                            fontWeight: 600
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Clear All
                                    </S.Button>
                                    <S.Button
                                        type="button"
                                        onClick={handleRaiseIntent}
                                        style={{
                                            background: '#0d9488',
                                            color: '#ffffff',
                                            padding: '8px 24px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            boxShadow: '0 2px 4px rgba(13,148,136,0.2)'
                                        }}
                                        disabled={isSubmitting || intentForm.items.length === 0}
                                    >
                                        {isSubmitting ? 'Raising Request...' : 'Raise Intent Request'}
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
                                    placeholder="Filter by Intent ID, IP Number, Item..."
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
                                            <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                                            <th>DATE</th>
                                            <th>INTENT ID</th>
                                            <th>IP NUMBER</th>
                                            <th>ITEMS</th>
                                            <th style={{ textAlign: 'center' }}>TOTAL REQ</th>
                                            <th style={{ textAlign: 'center' }}>APPROVED</th>
                                            <th style={{ textAlign: 'center' }}>STATUS</th>
                                            <th style={{ textAlign: 'center', width: '90px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {intentsList.map((intent, idx) => {
                                            const items = intent.items || [];
                                            const totalReq = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
                                            const totalApprv = items.reduce((acc, it) => acc + (Number(it.approved_quantity) || 0), 0);
                                            const isApproved = intent.is_approved || (totalApprv >= totalReq && totalReq > 0);
                                            const isPartial = totalApprv > 0 && totalApprv < totalReq;

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
                                                        {totalReq}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 700, color: totalApprv > 0 ? '#10b981' : '#94a3b8' }}>
                                                        {totalApprv}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 700,
                                                            background: isApproved ? '#ecfdf5' : isPartial ? '#eff6ff' : '#fffbeb',
                                                            color: isApproved ? '#059669' : isPartial ? '#1d4ed8' : '#b45309',
                                                            border: `1px solid ${isApproved ? '#a7f3d0' : isPartial ? '#bfdbfe' : '#fde68a'}`
                                                        }}>
                                                            {isApproved ? 'Approved' : isPartial ? 'Partially Approved' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedIntentForModal(intent)}
                                                            style={{
                                                                background: '#f0fdfa',
                                                                border: '1px solid #99f6e4',
                                                                color: '#0d9488',
                                                                borderRadius: '6px',
                                                                padding: '6px 10px',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600
                                                            }}
                                                            title="View requisition details"
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
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
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>IP Number</div>
                                        <div style={{ fontWeight: 700, color: '#1e40af' }}>{selectedIntentForModal.ipnumber || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
                                        <div style={{ fontWeight: 700, color: selectedIntentForModal.is_approved ? '#059669' : '#b45309' }}>
                                            {selectedIntentForModal.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
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
                                            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem' }}>REQ QTY</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem' }}>APPRV QTY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedIntentForModal.items || []).map((it, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{it.name}</td>
                                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{it.hsn || '-'}</td>
                                                <td style={{ padding: '8px 12px', color: '#0d9488', fontWeight: 600 }}>{it.batch || '-'}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{it.mrp ? `₹${it.mrp}` : '-'}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: it.approved_quantity > 0 ? '#10b981' : '#64748b' }}>
                                                    {it.approved_quantity || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </S.ModalBody>
                            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
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

