import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    AlertCircle, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, ShoppingCart
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
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
    colors
} from '../GlobalStyles';
import { SCOPE_OPTIONS, getStoredScope, setStoredScope, printDrugReport } from './drugReportHelper';

const DrugReorderLevelReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        low_stock_items: 0,
        critical_reorders: 0
    });
    const [reorderItems, setReorderItems] = useState([]);

    useEffect(() => {
        fetchReport();
    }, [scope, statusFilter]);

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        setStoredScope(newScope);
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const query = [
                `scope=${encodeURIComponent(scope)}`
            ];
            if (statusFilter && statusFilter !== 'ALL') query.push(`status=${statusFilter}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-reorder-level-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setReorderItems(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setReorderItems([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Reorder Level report:', err);
            setReorderItems([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!reorderItems || reorderItems.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(reorderItems.map((r, i) => ({
            'S.No': i + 1,
            'Medicine Name': r.item_name || '',
            'Category': r.category || '',
            'Current Stock Units': r.current_stock || 0,
            'Reorder Threshold': r.reorder_threshold || 0,
            'Shortage Units': r.shortage || 0,
            'Suggested Order Qty': r.suggested_order || 0,
            'Urgency Level': r.urgency || '',
            'Outlet Scope': r.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'DrugReorderLevel');
        XLSX.writeFile(wb, `Drug_Reorder_Level_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `DRUG REORDER LEVEL & BUFFER INDICATION (${scope})`,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'category', label: 'Category', width: '90px' },
                { key: 'current_stock', label: 'In-Stock', width: '85px', align: 'right' },
                { key: 'reorder_threshold', label: 'Min Level', width: '85px', align: 'right' },
                { key: 'shortage', label: 'Shortage', width: '85px', align: 'right' },
                { key: 'suggested_order', label: 'Suggested Order', width: '110px', align: 'right' },
                { key: 'urgency', label: 'Urgency', width: '100px' }
            ],
            data: reorderItems,
            summary
        });
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button 
                                onClick={() => navigate('/DrugPurchaseReportsDashboard')}
                                style={{ background: '#ffffff', color: '#334155', border: '1.5px solid #cbd5e1', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <ArrowLeft size={16} /> Back
                            </Button>
                            <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertCircle size={28} color="#d97706" /> Reorder Level Indication
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Real-time threshold monitoring identifying out-of-stock and low-stock medicines with automated reorder quantity recommendations.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Filter size={14} color="#059669" /> OUTLET SCOPE
                        </label>
                        <Select 
                            value={scope} 
                            onChange={e => handleScopeChange(e.target.value)} 
                            style={{ width: '100%', fontWeight: '700', color: '#059669', borderColor: '#059669' }}
                        >
                            {SCOPE_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>STOCK URGENCY</label>
                        <Select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)} 
                            style={{ width: '100%' }}
                        >
                            <option value="ALL">All Items</option>
                            <option value="CRITICAL">Critical Shortage</option>
                            <option value="LOW">Low Stock</option>
                        </Select>
                    </div>

                    <div style={{ flex: '2 1 260px', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH MEDICINE</label>
                        <Input 
                            type="text" 
                            placeholder="Type medicine name or category..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            onClick={fetchReport} 
                            style={{ background: colors.primary, color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={16} /> Filter
                        </Button>
                        <Button 
                            onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
                            title="Reset filters"
                            style={{ background: '#f1f5f9', color: '#475569', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Key Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>CRITICAL REORDERS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {summary.critical_reorders || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Below safe threshold buffer
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>LOW STOCK ITEMS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            {summary.low_stock_items || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Reorder procurement advised
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Checking reorder thresholds for {scope}...</p>
                    </div>
                ) : reorderItems.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <ShoppingCart size={44} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>Stock Levels are Healthy</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No critical shortages found in {scope}.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '240px', padding: '12px 10px' }}>MEDICINE NAME</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>CATEGORY</Th>
                                    <Th style={{ minWidth: '100px', textAlign: 'right', padding: '12px 10px' }}>IN-STOCK</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'right', padding: '12px 10px' }}>MIN THRESHOLD</Th>
                                    <Th style={{ minWidth: '100px', textAlign: 'right', padding: '12px 10px' }}>SHORTAGE</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>SUGGESTED REORDER</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'center', padding: '12px 10px' }}>URGENCY</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {reorderItems.map((r, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{r.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.category || '-'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>{(r.current_stock || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(r.reorder_threshold || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#d97706' }}>{(r.shortage || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>+{(r.suggested_order || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '3px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.72rem', 
                                                fontWeight: '700', 
                                                background: r.urgency === 'CRITICAL' ? '#fef2f2' : '#fffbeb', 
                                                color: r.urgency === 'CRITICAL' ? '#dc2626' : '#b45309' 
                                            }}>
                                                {r.urgency || 'REORDER'}
                                            </span>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                )}
            </Container>
        </PageWrapper>
    );
};

export default DrugReorderLevelReport;
