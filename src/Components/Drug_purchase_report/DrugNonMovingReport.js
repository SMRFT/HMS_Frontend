import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Clock, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, AlertOctagon
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
import { SCOPE_OPTIONS, getStoredScope, setStoredScope, formatCurrency, printDrugReport } from './drugReportHelper';

const DrugNonMovingReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [daysThreshold, setDaysThreshold] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        non_moving_batches: 0,
        total_dead_stock_units: 0,
        total_idle_capital: 0
    });
    const [itemsList, setItemsList] = useState([]);

    useEffect(() => {
        fetchReport();
    }, [scope, daysThreshold]);

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        setStoredScope(newScope);
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const query = [
                `scope=${encodeURIComponent(scope)}`,
                `days=${daysThreshold}`
            ];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-non-moving-items-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setItemsList(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setItemsList([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Non-Moving report:', err);
            setItemsList([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!itemsList || itemsList.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(itemsList.map((it, i) => ({
            'S.No': i + 1,
            'Medicine Name': it.item_name || '',
            'Batch Number': it.batch_number || '',
            'Idle Days': it.idle_days || 0,
            'In-Stock Quantity': it.stock_quantity || 0,
            'Unit Price (₹)': it.unit_price || 0,
            'Idle Capital Locked (₹)': it.idle_capital || 0,
            'Movement Category': it.category || 'SLOW MOVING',
            'Outlet Scope': it.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'NonMovingDrugs');
        XLSX.writeFile(wb, `Drug_Non_Moving_${daysThreshold}Days_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `NON-MOVING ITEMS REPORT (DEAD STOCK > ${daysThreshold} DAYS) - ${scope}`,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'batch_number', label: 'Batch No', width: '100px' },
                { key: 'idle_days', label: 'Idle Days', width: '80px', align: 'center' },
                { key: 'stock_quantity', label: 'Stock Qty', width: '90px', align: 'right' },
                { key: 'unit_price', label: 'Unit Rate (₹)', width: '95px', align: 'right' },
                { key: 'idle_capital', label: 'Idle Capital (₹)', width: '120px', align: 'right' },
                { key: 'category', label: 'Category', width: '110px' }
            ],
            data: itemsList,
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
                                <Clock size={28} color={colors.primary} /> Non-Moving Items Report (Dead Stock)
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Identify slow-moving and idle pharmaceutical batches with zero consumption over 30, 60, 90, or 180+ days to prevent dead capital.
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
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>AGING THRESHOLD</label>
                        <Select 
                            value={daysThreshold} 
                            onChange={e => setDaysThreshold(Number(e.target.value))} 
                            style={{ width: '100%' }}
                        >
                            <option value={30}>&gt; 30 Days (Slow Moving)</option>
                            <option value={60}>&gt; 60 Days (Dormant)</option>
                            <option value={90}>&gt; 90 Days (Stagnant)</option>
                            <option value={180}>&gt; 180 Days (Dead Stock)</option>
                        </Select>
                    </div>

                    <div style={{ flex: '2 1 260px', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH MEDICINE / BATCH</label>
                        <Input 
                            type="text" 
                            placeholder="Type medicine name or batch..." 
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
                            onClick={() => { setDaysThreshold(30); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>IDLE CAPITAL LOCKED</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {formatCurrency(summary.total_idle_capital || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Tied-up working capital
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>DEAD STOCK UNITS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            {(summary.total_dead_stock_units || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Units with zero issues
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>NON-MOVING BATCHES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.non_moving_batches || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Batches idle &gt; {daysThreshold} days
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Scanning inventory for non-moving batches...</p>
                    </div>
                ) : itemsList.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <AlertOctagon size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Dead Stock Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No items found with idle duration &gt; {daysThreshold} days.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '220px', padding: '12px 10px' }}>MEDICINE NAME</Th>
                                    <Th style={{ minWidth: '120px', padding: '12px 10px' }}>BATCH NO</Th>
                                    <Th style={{ minWidth: '100px', textAlign: 'center', padding: '12px 10px' }}>IDLE DAYS</Th>
                                    <Th style={{ minWidth: '100px', textAlign: 'right', padding: '12px 10px' }}>STOCK UNITS</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'right', padding: '12px 10px' }}>UNIT PRICE (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>IDLE CAPITAL (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'center', padding: '12px 10px' }}>STATUS</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {itemsList.map((it, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{it.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{it.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{it.batch_number || '-'}</code></Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: it.idle_days >= 120 ? '#dc2626' : '#d97706' }}>
                                            {it.idle_days || 0} days
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{(it.stock_quantity || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(it.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                                            {formatCurrency(it.idle_capital || 0)}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '3px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.72rem', 
                                                fontWeight: '700', 
                                                background: it.category === 'DEAD STOCK' ? '#fef2f2' : '#fffbeb', 
                                                color: it.category === 'DEAD STOCK' ? '#dc2626' : '#b45309' 
                                            }}>
                                                {it.category || 'SLOW MOVING'}
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

export default DrugNonMovingReport;
