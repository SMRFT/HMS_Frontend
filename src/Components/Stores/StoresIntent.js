import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker, Select, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../Auth/apiRequest'; 
import * as S from '../GlobalStyles';

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

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const StoresIntentManager = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
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

    const getIntentStatus = (item) => {
        if (item.is_approved) return 'Approved';
        const items = item.items || [];
        if (items.some(it => it.status === 'Approved')) return 'Partially Approved';
        if (items.every(it => it.status === 'Rejected')) return 'Rejected';
        return 'Pending';
    };

    // Report State
    const [intents, setIntents] = useState([]);
    const [filter, setFilter] = useState({
        from_date: dayjs().format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD')
    });

    useEffect(() => {
        fetchMasters();
        if (activeTab === 'report') loadIntents();
    }, [activeTab]);

    const fetchMasters = async () => {
        try {
            const [itms, depts] = await Promise.all([
                axios.get(`${Hmsbaseurl.replace(/\/$/, '')}/item-master/`),
                axios.get(`${Hmsbaseurl.replace(/\/$/, '')}/department-master/`)
            ]);
            setItemsMaster(itms.data || []);
            setDepartments(depts.data || []);
        } catch (err) {
            toast.error("Failed to load master data");
        }
    };

    const loadIntents = async () => {
        setLoading(true);
        const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", {
            from_date: filter.from_date,
            to_date: filter.to_date
        });
        if (res.success) setIntents(res.data || []);
        setLoading(false);
    };

    const handleAddItem = (itemId) => {
        const item = itemsMaster.find(i => i.item_id === itemId);
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

    const handleExportExcel = () => {
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
                    'Approved Qty': item.approved_quantity,
                    'Status': item.status
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Intents Report");

        // Column widths
        const wscols = [
            {wch: 15}, {wch: 20}, {wch: 25}, {wch: 35}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Stores_Intents_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
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
        }
        setLoading(false);
    };

    const handleEditIntent = (intent) => {
        setIntentForm({ 
            ...intent,
            date: dayjs(intent.date).format('YYYY-MM-DD')
        });
        setIsEditMode(true);
        setActiveTab('create');
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#0d9488' } }}>
            <CalendarGlobalStyles />
            <ModernContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Stores Intent Management</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Raise and track inter-departmental material requests</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <S.Tab active={activeTab === 'create'} onClick={() => setActiveTab('create')} style={{ padding: '8px 24px', borderRadius: '8px' }}>Raise Intent</S.Tab>
                        <S.Tab active={activeTab === 'report'} onClick={() => setActiveTab('report')} style={{ padding: '8px 24px', borderRadius: '8px' }}>Report</S.Tab>
                    </div>
                </div>

                {activeTab === 'create' ? (
                    <>
                        <SectionFrame>
                            <SectionHeader><h3>Intent Details</h3></SectionHeader>
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
                                        value={intentForm.department}
                                        onChange={v => setIntentForm({...intentForm, department: v})}
                                        style={{ height: '42px' }}
                                        optionFilterProp="children"
                                    >
                                        {departments.map(d => <Option key={d.department_id} value={d.department_id}>{d.department_name}</Option>)}
                                    </Select>
                                </div>
                                {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <S.Label>Intent Number (Auto)</S.Label>
                                    <S.Input value={intentForm.intent_id} disabled style={{ background: '#f8fafc', fontWeight: 700, color: '#0d9488' }} />
                                </div> */}
                            </FormGrid>
                        </SectionFrame>

                        <SectionFrame>
                            <SectionHeader>
                                <h3>Items Collection ({intentForm.items.length})</h3>
                                <div style={{ width: '300px' }}>
                                    <Select
                                        showSearch
                                        placeholder="+ Add Stock Item"
                                        value={null}
                                        onSelect={handleAddItem}
                                        style={{ width: '100%', height: '36px' }}
                                        optionFilterProp="children"
                                    >
                                        {itemsMaster.map(i => <Option key={i.item_id} value={i.item_id}>{i.itemName}</Option>)}
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
                                                <th width="150" style={{textAlign: 'center'}}>QUANTITY (to request)</th>
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
                                                            style={{ width: '80px', textAlign: 'center', margin: '0 auto' }}
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
                            <S.Button onClick={submitIntent} disabled={loading} style={{ background: '#0d9488', padding: '12px 32px', fontSize: '1rem' }}>
                                {loading ? 'Processing...' : (isEditMode ? 'Update Intent Request' : 'Raise Intent Request')}
                            </S.Button>
                        </div>
                    </>
                ) : (
                    <>
                        <SectionFrame>
                            <SectionHeader><h3>Recent Intent Reports</h3></SectionHeader>
                            <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid #edf2f7' }}>
                                <DatePicker.RangePicker 
                                    value={[dayjs(filter.from_date), dayjs(filter.to_date)]}
                                    onChange={(dates) => setFilter({
                                        from_date: dates ? dates[0].format('YYYY-MM-DD') : '',
                                        to_date: dates ? dates[1].format('YYYY-MM-DD') : ''
                                    })}
                                    style={{ height: '42px', borderRadius: '8px' }}
                                />
                                <S.Button onClick={loadIntents}>🔍 Filter Results</S.Button>
                                <S.Button secondary onClick={handleExportExcel} style={{ background: '#f8fafc', color: '#0d9488', border: '1px solid #0d9488' }}>
                                    📥 Export Excel
                                </S.Button>
                            </div>
                            <S.TableWrapper>
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
                                            
                                            return (
                                                <tr key={intent.intent_id}>
                                                    <td>{dayjs(intent.date).format('DD/MM/YYYY')}</td>
                                                    <td style={{ fontWeight: 700, color: '#0d9488' }}>{intent.intent_id}</td>
                                                    <td>{intent.department_name}</td>
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
                                                                        ({it.quantity} Req {it.approved_quantity > 0 ? `| ${it.approved_quantity} Apprv` : ''})
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
                                                        <button 
                                                            onClick={() => handleEditIntent(intent)}
                                                            disabled={status !== 'Pending'}
                                                            style={{ 
                                                                background: status === 'Pending' ? '#f1f5f9' : '#f8fafc',
                                                                color: status === 'Pending' ? '#0d9488' : '#cbd5e1',
                                                                border: 'none', 
                                                                padding: '6px 12px', 
                                                                borderRadius: '6px', 
                                                                cursor: status === 'Pending' ? 'pointer' : 'not-allowed',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {status === 'Pending' ? '✏️ Edit' : '🔒 Edit'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No records found for the selected period</td></tr>
                                        )}
                                    </tbody>
                                </ItemsTable>
                            </S.TableWrapper>
                        </SectionFrame>
                    </>
                )}
            </ModernContainer>
        </ConfigProvider>
    );
};

export default StoresIntentManager;