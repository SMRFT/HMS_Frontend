import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker, Select, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../Auth/apiRequest'; 
import * as S from '../GlobalStyles';
import { RotateCcw, Plus, Search, FileText, CheckCircle, Clock, X, ArrowLeft, RefreshCw, Download } from 'lucide-react';

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
    h3 { margin: 0; font-size: 1rem; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
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
        th { color: white; padding: 12px 16px; text-align: left; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    }
    tbody tr {
        border-bottom: 1px solid #edf2f7;
        &:hover { background: #f1f5f9; }
        td { padding: 12px 16px; font-size: 0.9rem; color: #334155; }
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

const ReturnBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => props.bg || '#f1f5f9'};
    color: ${props => props.color || '#334155'};
    border: 1px solid ${props => props.border || '#cbd5e1'};
`;

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const StoresIntentManager = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'return', 'report'
    const [reportViewMode, setReportViewMode] = useState('intents'); // 'intents' or 'returns'
    const [itemsMaster, setItemsMaster] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Intent Creation State
    const [isEditMode, setIsEditMode] = useState(false);
    const [intentForm, setIntentForm] = useState({
        intent_id: `SINT${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: dayjs().format('YYYY-MM-DD'),
        department: '',
        items: []
    });

    // Indent Return State
    const [returnIntentList, setReturnIntentList] = useState([]);
    const [selectedReturnIntent, setSelectedReturnIntent] = useState(null);
    const [returnForm, setReturnForm] = useState({
        return_id: `INRET${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        intent_id: '',
        department: '',
        department_name: '',
        return_date: dayjs().format('YYYY-MM-DD'),
        return_reason: 'EXCESS',
        remarks: '',
        items: []
    });

    // Modal quick-return state
    const [showQuickReturnModal, setShowQuickReturnModal] = useState(false);

    // Report State
    const [intents, setIntents] = useState([]);
    const [indentReturns, setIndentReturns] = useState([]);
    const [filter, setFilter] = useState({
        from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD')
    });

    const getIntentStatus = (item) => {
        if (item.is_approved) return 'Approved';
        const items = item.items || [];
        if (items.some(it => it.status === 'Approved')) return 'Partially Approved';
        if (items.every(it => it.status === 'Rejected')) return 'Rejected';
        return 'Pending';
    };

    useEffect(() => {
        fetchMasters();
        if (activeTab === 'report') {
            if (reportViewMode === 'intents') loadIntents();
            else loadIndentReturns();
        }
        if (activeTab === 'return') {
            loadApprovedIntentsForReturn();
        }
    }, [activeTab, reportViewMode]);

    const fetchMasters = async () => {
        try {
            const [itms, depts] = await Promise.all([
                apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/item-master/`),
                apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/department-master/`)
            ]);
            const nonVmItems = (itms.data || []).filter(i => !i.is_VM);
            setItemsMaster(nonVmItems);
            setDepartments(depts.data || []);
        } catch (err) {
            toast.error("Failed to load master data");
        }
    };

    const loadIntents = async () => {
        setLoading(true);
        try {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", {
                from_date: filter.from_date,
                to_date: filter.to_date
            });
            const data = Array.isArray(res?.data) 
                ? res.data 
                : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setIntents(data);
        } catch (err) {
            console.error("Error loading intents:", err);
            setIntents([]);
        } finally {
            setLoading(false);
        }
    };

    const loadIndentReturns = async () => {
        setLoading(true);
        try {
            let query = [];
            if (filter.from_date) query.push(`from_date=${filter.from_date}`);
            if (filter.to_date) query.push(`to_date=${filter.to_date}`);
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

    const loadApprovedIntentsForReturn = async () => {
        try {
            setLoading(true);
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", {});
            if (res.success && Array.isArray(res.data)) {
                // Filter intents that have at least one approved item with approved_quantity > 0
                const approvedIntents = res.data.filter(intent => {
                    const status = getIntentStatus(intent);
                    const hasApprovedItems = (intent.items || []).some(it => {
                        const apprv = Number(it.approved_quantity || 0);
                        const ret = Number(it.returned_quantity || 0);
                        return apprv > ret;
                    });
                    return (status === 'Approved' || status === 'Partially Approved' || intent.is_approved) && hasApprovedItems;
                });
                setReturnIntentList(approvedIntents);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectIntentForReturn = (intentId) => {
        const intent = returnIntentList.find(i => i.intent_id === intentId) || intents.find(i => i.intent_id === intentId);
        if (!intent) return;

        setSelectedReturnIntent(intent);
        const returnableItems = (intent.items || [])
            .filter(it => {
                const apprv = Number(it.approved_quantity || 0);
                const ret = Number(it.returned_quantity || 0);
                return apprv > 0 && apprv > ret;
            })
            .map(it => {
                const apprv = Number(it.approved_quantity || 0);
                const ret = Number(it.returned_quantity || 0);
                const maxReturn = apprv - ret;
                return {
                    item_id: it.item_id,
                    name: it.name,
                    hsn: it.hsn || '-',
                    approved_quantity: apprv,
                    already_returned_quantity: ret,
                    max_returnable: maxReturn,
                    return_quantity: 0,
                    reason: 'EXCESS',
                    unit_price: Number(it.unit_price || 0),
                    remarks: ''
                };
            });

        setReturnForm({
            return_id: `INRET${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            intent_id: intent.intent_id,
            department: intent.department,
            department_name: intent.department_name || intent.department,
            return_date: dayjs().format('YYYY-MM-DD'),
            return_reason: 'EXCESS',
            remarks: '',
            items: returnableItems
        });
    };

    const openQuickReturnModalForIntent = (intent) => {
        handleSelectIntentForReturn(intent.intent_id);
        setShowQuickReturnModal(true);
    };

    const handleAddItem = (itemId) => {
        const item = itemsMaster.find(i => i.item_id === itemId && !i.is_VM);
        if (!item) return;
        if (intentForm.items.some(i => i.item_id === itemId)) return toast.info("Item already added");

        setIntentForm({
            ...intentForm,
            items: [...intentForm.items, { 
                item_id: item.item_id, 
                name: item.itemName, 
                hsn: item.hsn || '-', 
                quantity: 1, 
                status: 'Pending', 
                approved_quantity: 0 
            }]
        });
    };

    const handleRemoveItem = (idx) => {
        const newItems = intentForm.items.filter((_, i) => i !== idx);
        setIntentForm({ ...intentForm, items: newItems });
    };

    const submitIntent = async () => {
        if (!intentForm.department || intentForm.items.length === 0) return toast.warning("Provide department and at least one item");
        
        setLoading(true);
        const url = isEditMode 
            ? `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${intentForm.intent_id}/`
            : `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/create/`;
        
        const method = isEditMode ? "PATCH" : "POST";

        const payload = {
            intent_id: intentForm.intent_id,
            date: dayjs(intentForm.date).format('YYYY-MM-DD'),
            department: intentForm.department,
            items: intentForm.items.map(it => ({
                item_id: it.item_id,
                name: it.name,
                hsn: it.hsn,
                quantity: it.quantity,
                status: it.status || 'Pending',
                approved_quantity: it.approved_quantity || 0
            })),
            is_active: true,
            is_approved: false
        };

        const res = await apiRequest(url, method, payload);

        if (res.success) {
            toast.success(isEditMode ? "Intent Updated Successfully" : "Intent Raised Successfully");
            setIntentForm({ 
                intent_id: `SINT${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                date: dayjs().format('YYYY-MM-DD'), 
                department: '', 
                items: [] 
            });
            setIsEditMode(false);
            setActiveTab('report');
            setReportViewMode('intents');
        }
        setLoading(false);
    };

    const submitIndentReturn = async () => {
        if (!returnForm.intent_id) {
            toast.warning("Please select an approved indent");
            return;
        }

        const validItemsToReturn = returnForm.items.filter(it => Number(it.return_quantity) > 0);
        if (validItemsToReturn.length === 0) {
            toast.warning("Please enter a return quantity (> 0) for at least one item");
            return;
        }

        for (const it of validItemsToReturn) {
            if (Number(it.return_quantity) > Number(it.max_returnable)) {
                toast.error(`Return quantity for "${it.name}" cannot exceed available returnable quantity (${it.max_returnable})`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                return_id: returnForm.return_id,
                intent_id: returnForm.intent_id,
                department: returnForm.department,
                department_name: returnForm.department_name,
                return_date: dayjs(returnForm.return_date).format('YYYY-MM-DD'),
                return_reason: returnForm.return_reason,
                remarks: returnForm.remarks,
                items: validItemsToReturn.map(it => ({
                    item_id: it.item_id,
                    name: it.name,
                    hsn: it.hsn,
                    approved_quantity: it.approved_quantity,
                    return_quantity: Number(it.return_quantity),
                    reason: it.reason || returnForm.return_reason,
                    unit_price: it.unit_price || 0,
                    remarks: it.remarks || ''
                }))
            };

            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/`, "POST", payload);
            if (res && res.success) {
                toast.success("Indent Return submitted successfully! Waiting for Stores Approval.");
                setShowQuickReturnModal(false);
                setSelectedReturnIntent(null);
                setReturnForm({
                    return_id: `INRET${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                    intent_id: '',
                    department: '',
                    department_name: '',
                    return_date: dayjs().format('YYYY-MM-DD'),
                    return_reason: 'EXCESS',
                    remarks: '',
                    items: []
                });
                setActiveTab('report');
                setReportViewMode('returns');
                loadIndentReturns();
            } else {
                toast.error(res?.error || "Error submitting Indent Return");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReturn = async (returnId) => {
        if (window.confirm(`Are you sure you want to delete Indent Return ${returnId}?`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-indent-returns/delete/${returnId}/`, "DELETE");
            if (res.success) {
                toast.success("Indent Return deleted successfully");
                loadIndentReturns();
            } else {
                toast.error(res.error || "Error deleting return");
            }
        }
    };

    const handleEditIntent = (intent) => {
        setIntentForm({ 
            ...intent,
            date: dayjs(intent.date).format('YYYY-MM-DD')
        });
        setIsEditMode(true);
        setActiveTab('create');
    };

    const handleExportExcel = () => {
        if (reportViewMode === 'intents') {
            if (intents.length === 0) return toast.info("No data to export");
            const flattenedData = [];
            intents.forEach(intent => {
                intent.items.forEach(item => {
                    flattenedData.push({
                        'Date': dayjs(intent.date).format('DD/MM/YYYY'),
                        'Intent ID': intent.intent_id,
                        'Department': intent.department_name,
                        'Item Name': item.name,
                        'HSN': item.hsn || '-',
                        'Requested Qty': item.quantity,
                        'Approved Qty': item.approved_quantity || 0,
                        'Returned Qty': item.returned_quantity || 0,
                        'Status': item.status || getIntentStatus(intent)
                    });
                });
            });
            const ws = XLSX.utils.json_to_sheet(flattenedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Intents Report");
            XLSX.writeFile(wb, `Stores_Intents_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
        } else {
            if (indentReturns.length === 0) return toast.info("No returns data to export");
            const flattenedReturns = [];
            indentReturns.forEach(ret => {
                (ret.items || []).forEach(it => {
                    flattenedReturns.push({
                        'Return ID': ret.return_id,
                        'Return Date': dayjs(ret.return_date).format('DD/MM/YYYY'),
                        'Intent ID': ret.intent_id,
                        'Department': ret.department_name || ret.department,
                        'Item Name': it.name,
                        'HSN': it.hsn || '-',
                        'Return Qty': it.return_quantity || it.quantity,
                        'Reason': it.reason || ret.return_reason,
                        'Status': ret.status,
                        'Approved By': ret.approved_by || '-',
                        'Remarks': ret.remarks || '-'
                    });
                });
            });
            const ws = XLSX.utils.json_to_sheet(flattenedReturns);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Indent Returns");
            XLSX.writeFile(wb, `Stores_Indent_Returns_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
        }
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#0d9488' } }}>
            <CalendarGlobalStyles />
            <ModernContainer>
                {/* Header & Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={28} color="#0d9488" /> Stores Intent Management
                        </h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Raise material requests, submit returns for approved indents, and track approvals</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', background: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <S.Tab 
                            active={activeTab === 'create'} 
                            onClick={() => { setActiveTab('create'); setIsEditMode(false); }} 
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={16} /> Raise Intent
                        </S.Tab>
                        <S.Tab 
                            active={activeTab === 'return'} 
                            onClick={() => { setActiveTab('return'); loadApprovedIntentsForReturn(); }} 
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <RotateCcw size={16} /> Raise Indent Return
                        </S.Tab>
                        <S.Tab 
                            active={activeTab === 'report'} 
                            onClick={() => { setActiveTab('report'); loadIntents(); }} 
                            style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
                                <h3>{isEditMode ? 'Edit Intent Request' : 'New Intent Requisition'}</h3>
                                {isEditMode && (
                                    <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 'bold' }}>Editing: {intentForm.intent_id}</span>
                                )}
                            </SectionHeader>
                            <FormGrid>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Intent Date</S.Label>
                                    <DatePicker 
                                        value={dayjs(intentForm.date)} 
                                        onChange={d => setIntentForm({...intentForm, date: d ? d.format('YYYY-MM-DD') : ''})} 
                                        format="DD/MM/YYYY"
                                        style={{ height: '42px', borderRadius: '8px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Requesting Department</S.Label>
                                    <Select
                                        showSearch
                                        placeholder="Select Department"
                                        value={intentForm.department || undefined}
                                        onChange={v => setIntentForm({...intentForm, department: v})}
                                        style={{ height: '42px' }}
                                        optionFilterProp="children"
                                    >
                                        {departments.map(d => (
                                            <Option key={d.department_code || d.department_id} value={d.department_code || d.department_id}>
                                                {d.department_name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </FormGrid>
                        </SectionFrame>

                        <SectionFrame>
                            <SectionHeader>
                                <h3>Items Collection ({intentForm.items.length})</h3>
                                <div style={{ width: '320px' }}>
                                    <Select
                                        showSearch
                                        placeholder="+ Add Stock Item"
                                        value={null}
                                        onSelect={handleAddItem}
                                        style={{ width: '100%', height: '38px' }}
                                        optionFilterProp="children"
                                    >
                                        {itemsMaster.filter(i => !i.is_VM).map(i => (
                                            <Option key={i.item_id} value={i.item_id}>
                                                {i.itemName} {i.hsn ? `(HSN: ${i.hsn})` : ''}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </SectionHeader>
                            <div style={{ padding: '0 0 24px 0' }}>
                                {intentForm.items.length > 0 ? (
                                    <ItemsTable>
                                        <thead>
                                            <tr>
                                                <th width="80">SL.NO</th>
                                                <th>ITEM DESCRIPTION</th>
                                                <th>HSN</th>
                                                <th width="160" style={{textAlign: 'center'}}>QUANTITY (to request)</th>
                                                <th width="80" style={{textAlign: 'center'}}>DEL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {intentForm.items.map((it, idx) => (
                                                <tr key={it.item_id}>
                                                    <td>{String(idx + 1).padStart(2, '0')}</td>
                                                    <td style={{ fontWeight: 600 }}>{it.name}</td>
                                                    <td>{it.hsn}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <S.Input 
                                                            type="number" 
                                                            min="1"
                                                            value={it.quantity} 
                                                            onChange={e => {
                                                                const copy = [...intentForm.items];
                                                                copy[idx].quantity = e.target.value;
                                                                setIntentForm({...intentForm, items: copy});
                                                            }}
                                                            style={{ width: '90px', textAlign: 'center', margin: '0 auto' }}
                                                        />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button 
                                                            onClick={() => handleRemoveItem(idx)}
                                                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                        >🗑</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </ItemsTable>
                                ) : (
                                    <EmptyState>
                                        <div className="icon">📦</div>
                                        <div>Your inventory bucket is empty</div>
                                        <div style={{ fontSize: '0.8rem' }}>Search and add stock items to populate this intent request</div>
                                    </EmptyState>
                                )}
                            </div>
                        </SectionFrame>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <S.Button secondary onClick={() => {
                                setIntentForm({ 
                                    intent_id: `SINT${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                                    date: dayjs().format('YYYY-MM-DD'), 
                                    department: '', 
                                    items: [] 
                                });
                                setIsEditMode(false);
                            }}>
                                {isEditMode ? 'Cancel Edit' : 'Clear All'}
                            </S.Button>
                            <S.Button onClick={submitIntent} disabled={loading} style={{ background: '#0d9488', padding: '12px 32px', fontSize: '1rem', fontWeight: '700' }}>
                                {loading ? 'Processing...' : (isEditMode ? 'Update Intent Request' : 'Raise Intent Request')}
                            </S.Button>
                        </div>
                    </>
                )}

                {/* 2. Raise Indent Return Tab */}
                {activeTab === 'return' && (
                    <>
                        <SectionFrame>
                            <SectionHeader>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                                    <RotateCcw size={18} color="#dc2626" /> Raise Indent Return for Approved Intent
                                </h3>
                            </SectionHeader>
                            <FormGrid>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Select Approved Indent</S.Label>
                                    <Select
                                        showSearch
                                        placeholder="Search and select approved intent..."
                                        value={returnForm.intent_id || undefined}
                                        onChange={handleSelectIntentForReturn}
                                        style={{ height: '42px' }}
                                        optionFilterProp="children"
                                    >
                                        {returnIntentList.map(ind => (
                                            <Option key={ind.intent_id} value={ind.intent_id}>
                                                {ind.intent_id} — {ind.department_name || ind.department} ({dayjs(ind.date).format('DD/MM/YYYY')})
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Return Date</S.Label>
                                    <DatePicker 
                                        value={dayjs(returnForm.return_date)} 
                                        onChange={d => setReturnForm({...returnForm, return_date: d ? d.format('YYYY-MM-DD') : ''})} 
                                        format="DD/MM/YYYY"
                                        style={{ height: '42px', borderRadius: '8px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label required>Default Return Reason</S.Label>
                                    <S.Select 
                                        value={returnForm.return_reason} 
                                        onChange={e => setReturnForm({...returnForm, return_reason: e.target.value})}
                                        style={{ height: '42px' }}
                                    >
                                        <option value="EXCESS">Excess Stock / Unused Items</option>
                                        <option value="DAMAGED">Damaged / Defective Stock</option>
                                        <option value="EXPIRED">Near Expiry / Expired Goods</option>
                                        <option value="NOT_REQUIRED">Project Completed / Not Required</option>
                                        <option value="WRONG_ITEM">Wrong Item Issued</option>
                                        <option value="OTHER">Other Reason</option>
                                    </S.Select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label>Return Remarks</S.Label>
                                    <S.Input 
                                        placeholder="Optional notes or return justification..."
                                        value={returnForm.remarks}
                                        onChange={e => setReturnForm({...returnForm, remarks: e.target.value})}
                                        style={{ height: '42px' }}
                                    />
                                </div>
                            </FormGrid>
                        </SectionFrame>

                        {returnForm.intent_id && (
                            <SectionFrame>
                                <SectionHeader>
                                    <h3>Approved Items in Intent ({returnForm.items.length})</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Department: <b>{returnForm.department_name}</b> | Intent: <b>{returnForm.intent_id}</b>
                                    </span>
                                </SectionHeader>
                                <div style={{ padding: '0 0 24px 0' }}>
                                    {returnForm.items.length > 0 ? (
                                        <ItemsTable>
                                            <thead>
                                                <tr>
                                                    <th width="60">SL.NO</th>
                                                    <th>ITEM NAME</th>
                                                    <th>HSN</th>
                                                    <th style={{ textAlign: 'center' }}>APPROVED QTY</th>
                                                    <th style={{ textAlign: 'center' }}>PREVIOUSLY RETURNED</th>
                                                    <th style={{ textAlign: 'center' }}>MAX RETURNABLE</th>
                                                    <th width="160" style={{ textAlign: 'center', background: '#dc2626' }}>RETURN QTY</th>
                                                    <th width="180">REASON</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {returnForm.items.map((it, idx) => (
                                                    <tr key={it.item_id}>
                                                        <td>{idx + 1}</td>
                                                        <td style={{ fontWeight: 600 }}>{it.name}</td>
                                                        <td>{it.hsn}</td>
                                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#0d9488' }}>{it.approved_quantity}</td>
                                                        <td style={{ textAlign: 'center', color: '#64748b' }}>{it.already_returned_quantity || 0}</td>
                                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{it.max_returnable}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <S.Input 
                                                                type="number"
                                                                min="0"
                                                                max={it.max_returnable}
                                                                value={it.return_quantity}
                                                                onChange={e => {
                                                                    const val = Math.min(Number(e.target.value), it.max_returnable);
                                                                    const copy = [...returnForm.items];
                                                                    copy[idx].return_quantity = Math.max(0, val);
                                                                    setReturnForm({...returnForm, items: copy});
                                                                }}
                                                                style={{ width: '90px', textAlign: 'center', margin: '0 auto', borderColor: it.return_quantity > 0 ? '#dc2626' : undefined, fontWeight: '700' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <S.Select 
                                                                value={it.reason || returnForm.return_reason} 
                                                                onChange={e => {
                                                                    const copy = [...returnForm.items];
                                                                    copy[idx].reason = e.target.value;
                                                                    setReturnForm({...returnForm, items: copy});
                                                                }}
                                                                style={{ height: '34px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="EXCESS">Excess / Unused</option>
                                                                <option value="DAMAGED">Damaged Goods</option>
                                                                <option value="EXPIRED">Expired Stock</option>
                                                                <option value="NOT_REQUIRED">Not Required</option>
                                                                <option value="OTHER">Other</option>
                                                            </S.Select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </ItemsTable>
                                    ) : (
                                        <EmptyState>
                                            <div>No returnable approved items found for this intent</div>
                                        </EmptyState>
                                    )}
                                </div>
                            </SectionFrame>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <S.Button secondary onClick={() => {
                                setSelectedReturnIntent(null);
                                setReturnForm({
                                    return_id: `INRET${dayjs().format('YYMM')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                                    intent_id: '',
                                    department: '',
                                    department_name: '',
                                    return_date: dayjs().format('YYYY-MM-DD'),
                                    return_reason: 'EXCESS',
                                    remarks: '',
                                    items: []
                                });
                            }}>
                                Clear
                            </S.Button>
                            <S.Button 
                                onClick={submitIndentReturn} 
                                disabled={loading || !returnForm.intent_id} 
                                style={{ background: '#dc2626', color: '#fff', padding: '12px 32px', fontSize: '1rem', fontWeight: '700' }}
                            >
                                <RotateCcw size={18} /> {loading ? 'Submitting Return...' : 'Submit Indent Return'}
                            </S.Button>
                        </div>
                    </>
                )}

                {/* 3. Reports & Logs Tab */}
                {activeTab === 'report' && (
                    <>
                        <SectionFrame>
                            <SectionHeader>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => { setReportViewMode('intents'); loadIntents(); }}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            border: `1px solid ${reportViewMode === 'intents' ? '#0d9488' : '#cbd5e1'}`,
                                            background: reportViewMode === 'intents' ? '#0d9488' : '#ffffff',
                                            color: reportViewMode === 'intents' ? '#ffffff' : '#334155',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📑 Indent Requests ({intents.length})
                                    </button>
                                    <button 
                                        onClick={() => { setReportViewMode('returns'); loadIndentReturns(); }}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            border: `1px solid ${reportViewMode === 'returns' ? '#dc2626' : '#cbd5e1'}`,
                                            background: reportViewMode === 'returns' ? '#dc2626' : '#ffffff',
                                            color: reportViewMode === 'returns' ? '#ffffff' : '#334155',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ↩ Indent Returns ({indentReturns.length})
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <S.Button secondary onClick={handleExportExcel} style={{ background: '#f8fafc', color: '#0d9488', border: '1px solid #0d9488' }}>
                                        <Download size={16} /> Export Excel
                                    </S.Button>
                                </div>
                            </SectionHeader>

                            {/* Filter Bar */}
                            <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid #edf2f7', flexWrap: 'wrap' }}>
                                <DatePicker.RangePicker 
                                    value={[dayjs(filter.from_date), dayjs(filter.to_date)]}
                                    onChange={(dates) => setFilter({
                                        from_date: dates ? dates[0].format('YYYY-MM-DD') : '',
                                        to_date: dates ? dates[1].format('YYYY-MM-DD') : ''
                                    })}
                                    style={{ height: '42px', borderRadius: '8px' }}
                                />
                                <S.Button onClick={reportViewMode === 'intents' ? loadIntents : loadIndentReturns} style={{ background: '#0d9488' }}>
                                    <Search size={16} /> Filter Results
                                </S.Button>
                                <S.Button secondary onClick={() => {
                                    const defaultF = { from_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), to_date: dayjs().format('YYYY-MM-DD') };
                                    setFilter(defaultF);
                                    if (reportViewMode === 'intents') loadIntents();
                                    else loadIndentReturns();
                                }}>
                                    <RefreshCw size={16} />
                                </S.Button>
                            </div>

                            {/* Table view based on reportViewMode */}
                            <S.TableWrapper>
                                {reportViewMode === 'intents' ? (
                                    <ItemsTable>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Intent ID</th>
                                                <th>Department</th>
                                                <th>Items Details</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {intents.length > 0 ? intents.map((intent) => {
                                                const status = getIntentStatus(intent);
                                                const statusColors = {
                                                    'Approved': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                                                    'Partially Approved': { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
                                                    'Rejected': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                                                    'Pending': { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' }
                                                };
                                                const color = statusColors[status] || statusColors['Pending'];
                                                const hasApprovedQty = (intent.items || []).some(it => Number(it.approved_quantity || 0) > Number(it.returned_quantity || 0));

                                                return (
                                                    <tr key={intent.intent_id}>
                                                        <td>{dayjs(intent.date).format('DD/MM/YYYY')}</td>
                                                        <td style={{ fontWeight: 700, color: '#0d9488' }}>{intent.intent_id}</td>
                                                        <td>{intent.department_name || intent.department}</td>
                                                        <td>
                                                            <div style={{ fontSize: '0.8rem' }}>
                                                                {intent.items.map((it, idx) => (
                                                                    <div key={idx} style={{ 
                                                                        padding: '4px 0', 
                                                                        borderBottom: idx === intent.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                        color: '#334155'
                                                                    }}>
                                                                        <span style={{ fontWeight: '600' }}>{it.name}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                                                            ({it.quantity} Req {it.approved_quantity > 0 ? `| ${it.approved_quantity} Apprv` : ''}{it.returned_quantity > 0 ? ` | ↩ ${it.returned_quantity} Ret` : ''})
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ 
                                                                padding: '4px 12px', 
                                                                borderRadius: '20px', 
                                                                fontSize: '0.75rem', 
                                                                fontWeight: 700,
                                                                background: color.bg,
                                                                color: color.text,
                                                                border: `1px solid ${color.border}`
                                                            }}>
                                                                {status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                                {status === 'Pending' && (
                                                                    <button 
                                                                        onClick={() => handleEditIntent(intent)}
                                                                        style={{ 
                                                                            background: '#f1f5f9', 
                                                                            color: '#0d9488', 
                                                                            border: '1px solid #cbd5e1', 
                                                                            padding: '6px 12px', 
                                                                            borderRadius: '6px', 
                                                                            cursor: 'pointer', 
                                                                            fontSize: '0.8rem', 
                                                                            fontWeight: 600 
                                                                        }}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                )}
                                                                {(status === 'Approved' || status === 'Partially Approved' || intent.is_approved) && hasApprovedQty && (
                                                                    <button 
                                                                        onClick={() => openQuickReturnModalForIntent(intent)}
                                                                        style={{ 
                                                                            background: '#fef2f2', 
                                                                            color: '#dc2626', 
                                                                            border: '1px solid #fecaca', 
                                                                            padding: '6px 12px', 
                                                                            borderRadius: '6px', 
                                                                            cursor: 'pointer', 
                                                                            fontSize: '0.8rem', 
                                                                            fontWeight: 700,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px'
                                                                        }}
                                                                        title="Return items from this approved indent"
                                                                    >
                                                                        <RotateCcw size={13} /> Return Items
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No intent records found</td></tr>
                                            )}
                                        </tbody>
                                    </ItemsTable>
                                ) : (
                                    <ItemsTable>
                                        <thead>
                                            <tr>
                                                <th>Return Date</th>
                                                <th>Return ID</th>
                                                <th>Original Intent ID</th>
                                                <th>Department</th>
                                                <th>Returned Items</th>
                                                <th style={{ textAlign: 'center' }}>Total Return Qty</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {indentReturns.length > 0 ? indentReturns.map((ret) => {
                                                const retColors = {
                                                    'Approved': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                                                    'Rejected': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                                                    'Pending': { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' }
                                                };
                                                const color = retColors[ret.status] || retColors['Pending'];

                                                return (
                                                    <tr key={ret.return_id}>
                                                        <td>{dayjs(ret.return_date).format('DD/MM/YYYY')}</td>
                                                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{ret.return_id}</td>
                                                        <td style={{ fontWeight: 600, color: '#0d9488' }}>{ret.intent_id}</td>
                                                        <td>{ret.department_name || ret.department}</td>
                                                        <td>
                                                            <div style={{ fontSize: '0.8rem' }}>
                                                                {(ret.items || []).map((it, idx) => (
                                                                    <div key={idx} style={{ padding: '2px 0', color: '#334155' }}>
                                                                        <b>{it.name}</b>: {it.return_quantity || it.quantity} units ({it.reason || ret.return_reason})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{ret.total_returned_qty}</td>
                                                        <td>
                                                            <ReturnBadge bg={color.bg} color={color.text} border={color.border}>
                                                                {ret.status.toUpperCase()}
                                                            </ReturnBadge>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {ret.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleDeleteReturn(ret.return_id)}
                                                                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                                    title="Cancel Return"
                                                                >
                                                                    🗑 Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No indent return records found</td></tr>
                                            )}
                                        </tbody>
                                    </ItemsTable>
                                )}
                            </S.TableWrapper>
                        </SectionFrame>
                    </>
                )}

                {/* Quick Modal for Raising Indent Return directly from table */}
                {showQuickReturnModal && selectedReturnIntent && (
                    <S.ModalOverlay>
                        <S.ModalContainer style={{ maxWidth: '900px', width: '90vw' }}>
                            <S.ModalHeader style={{ background: '#dc2626', color: '#fff' }}>
                                <S.ModalTitle style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RotateCcw size={20} /> Raise Return for Intent: {selectedReturnIntent.intent_id} ({selectedReturnIntent.department_name || selectedReturnIntent.department})
                                </S.ModalTitle>
                                <S.CloseButton style={{ color: '#fff' }} onClick={() => setShowQuickReturnModal(false)}>&times;</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                                    <div>
                                        <S.Label>Return Date</S.Label>
                                        <DatePicker 
                                            value={dayjs(returnForm.return_date)} 
                                            onChange={d => setReturnForm({...returnForm, return_date: d ? d.format('YYYY-MM-DD') : ''})} 
                                            format="DD/MM/YYYY"
                                            style={{ width: '100%', height: '38px', borderRadius: '6px' }}
                                        />
                                    </div>
                                    <div>
                                        <S.Label>Return Reason</S.Label>
                                        <S.Select 
                                            value={returnForm.return_reason} 
                                            onChange={e => setReturnForm({...returnForm, return_reason: e.target.value})}
                                            style={{ height: '38px' }}
                                        >
                                            <option value="EXCESS">Excess Stock / Unused Items</option>
                                            <option value="DAMAGED">Damaged / Defective Stock</option>
                                            <option value="EXPIRED">Near Expiry / Expired Goods</option>
                                            <option value="NOT_REQUIRED">Not Required</option>
                                            <option value="OTHER">Other</option>
                                        </S.Select>
                                    </div>
                                    <div>
                                        <S.Label>Remarks</S.Label>
                                        <S.Input 
                                            placeholder="Notes..."
                                            value={returnForm.remarks}
                                            onChange={e => setReturnForm({...returnForm, remarks: e.target.value})}
                                            style={{ height: '38px' }}
                                        />
                                    </div>
                                </div>

                                <ItemsTable>
                                    <thead>
                                        <tr>
                                            <th>ITEM NAME</th>
                                            <th style={{ textAlign: 'center' }}>APPROVED</th>
                                            <th style={{ textAlign: 'center' }}>ALREADY RETURNED</th>
                                            <th style={{ textAlign: 'center' }}>AVAILABLE TO RETURN</th>
                                            <th width="140" style={{ textAlign: 'center', background: '#dc2626' }}>RETURN QTY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnForm.items.map((it, idx) => (
                                            <tr key={it.item_id}>
                                                <td style={{ fontWeight: 600 }}>{it.name}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#0d9488' }}>{it.approved_quantity}</td>
                                                <td style={{ textAlign: 'center', color: '#64748b' }}>{it.already_returned_quantity || 0}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{it.max_returnable}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <S.Input 
                                                        type="number"
                                                        min="0"
                                                        max={it.max_returnable}
                                                        value={it.return_quantity}
                                                        onChange={e => {
                                                            const val = Math.min(Number(e.target.value), it.max_returnable);
                                                            const copy = [...returnForm.items];
                                                            copy[idx].return_quantity = Math.max(0, val);
                                                            setReturnForm({...returnForm, items: copy});
                                                        }}
                                                        style={{ width: '85px', textAlign: 'center', margin: '0 auto', borderColor: it.return_quantity > 0 ? '#dc2626' : undefined, fontWeight: '700' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </ItemsTable>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <S.Button secondary onClick={() => setShowQuickReturnModal(false)}>
                                        Cancel
                                    </S.Button>
                                    <S.Button 
                                        onClick={submitIndentReturn} 
                                        disabled={loading} 
                                        style={{ background: '#dc2626', color: '#fff', padding: '10px 24px', fontWeight: '700' }}
                                    >
                                        <RotateCcw size={16} /> Confirm & Submit Return
                                    </S.Button>
                                </div>
                            </S.ModalBody>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}
            </ModernContainer>
        </ConfigProvider>
    );
};

export default StoresIntentManager;