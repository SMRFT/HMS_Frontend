import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    AlertTriangle, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter
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

const DrugShortExpiryReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [daysThreshold, setDaysThreshold] = useState(90);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_at_risk_batches: 0,
        expired_batches: 0,
        critical_near_expiry: 0,
        total_loss_exposure: 0
    });
    const [expiryItems, setExpiryItems] = useState([]);

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
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-short-expiry-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setExpiryItems(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setExpiryItems([]);
            }
        } catch (err) {
            console.error('Error fetching Short Expiry report:', err);
            setExpiryItems([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!expiryItems || expiryItems.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(expiryItems.map((item, i) => ({
            'S.No': i + 1,
            'Medicine Name': item.item_name || '',
            'Batch Number': item.batch_number || '',
            'Expiry Date': item.expiry_date || '',
            'Days Remaining': item.days_left || 0,
            'Remaining Units': item.remaining_qty || 0,
            'Unit Cost (₹)': item.unit_cost || 0,
            'Loss Exposure (₹)': item.loss_exposure || 0,
            'Expiry Status': item.status || '',
            'Outlet Scope': item.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'ShortExpiry');
        XLSX.writeFile(wb, `Drug_Short_Expiry_${daysThreshold}Days_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `SHORT EXPIRY & EXPIRED DRUG REPORT (< ${daysThreshold} DAYS) - ${scope}`,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'batch_number', label: 'Batch No', width: '100px' },
                { key: 'expiry_date', label: 'Expiry Date', width: '90px' },
                { key: 'days_left', label: 'Days Left', width: '75px', align: 'center' },
                { key: 'remaining_qty', label: 'Units', width: '75px', align: 'right' },
                { key: 'unit_cost', label: 'Unit Cost (₹)', width: '90px', align: 'right' },
                { key: 'loss_exposure', label: 'Loss Exposure (₹)', width: '120px', align: 'right' },
                { key: 'status', label: 'Status', width: '110px' }
            ],
            data: expiryItems,
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
                                <AlertTriangle size={28} color="#dc2626" /> Short Expiry & Expired List
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Early warning alert report tracking pharmaceutical batches nearing expiry within 30, 60, or 90 days from <code>hospital_pharmacystock</code>.
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
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>EXPIRY WINDOW</label>
                        <Select 
                            value={daysThreshold} 
                            onChange={e => setDaysThreshold(Number(e.target.value))} 
                            style={{ width: '100%' }}
                        >
                            <option value={30}>&lt; 30 Days (Critical)</option>
                            <option value={60}>&lt; 60 Days (Urgent)</option>
                            <option value={90}>&lt; 90 Days (Watchlist)</option>
                            <option value={180}>&lt; 180 Days (Advance Warning)</option>
                        </Select>
                    </div>

                    <div style={{ flex: '2 1 260px', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH MEDICINE / BATCH</label>
                        <Input 
                            type="text" 
                            placeholder="Type medicine name, batch number..." 
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
                            onClick={() => { setDaysThreshold(90); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL LOSS EXPOSURE</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {formatCurrency(summary.total_loss_exposure || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Cost valuation of near-expiry stocks
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>CRITICAL (&lt;30 DAYS)</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            {summary.critical_near_expiry || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Immediate return or swap needed
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL AT-RISK BATCHES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.total_at_risk_batches || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Batches expiring within {daysThreshold} days
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Scanning batches for expiry risk...</p>
                    </div>
                ) : expiryItems.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <AlertTriangle size={44} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Expiry Alerts</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            All batches in {scope} have safe expiry dates beyond {daysThreshold} days.
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
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>EXPIRY DATE</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'center', padding: '12px 10px' }}>DAYS LEFT</Th>
                                    <Th style={{ minWidth: '85px', textAlign: 'right', padding: '12px 10px' }}>REMAINING</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'right', padding: '12px 10px' }}>UNIT COST (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>LOSS EXPOSURE (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'center', padding: '12px 10px' }}>RISK STATUS</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {expiryItems.map((item, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{item.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{item.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{item.batch_number || '-'}</code></Td>
                                        <Td style={{ color: '#dc2626', fontWeight: '600' }}>{item.expiry_date || '-'}</Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '800', color: item.days_left < 30 ? '#dc2626' : '#d97706' }}>
                                            {item.days_left || 0}d
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{(item.remaining_qty || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(item.unit_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                                            {formatCurrency(item.loss_exposure || 0)}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '3px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.72rem', 
                                                fontWeight: '700', 
                                                background: item.status?.includes('CRITICAL') ? '#fef2f2' : '#fffbeb', 
                                                color: item.status?.includes('CRITICAL') ? '#dc2626' : '#b45309' 
                                            }}>
                                                {item.status || 'EXPIRING SOON'}
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

export default DrugShortExpiryReport;
