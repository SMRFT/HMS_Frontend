import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    PieChart, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, Layers
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

const DrugAbcVedReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [abcFilter, setAbcFilter] = useState('ALL');
    const [vedFilter, setVedFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        analyzed_medicines: 0,
        class_a_items: 0,
        vital_drugs: 0
    });
    const [itemsList, setItemsList] = useState([]);

    useEffect(() => {
        fetchReport();
    }, [scope]);

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
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-abc-ved-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setItemsList(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setItemsList([]);
            }
        } catch (err) {
            console.error('Error fetching Drug ABC VED report:', err);
            setItemsList([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = itemsList.filter(it => {
        if (abcFilter !== 'ALL' && !it.abc_class?.includes(abcFilter)) return false;
        if (vedFilter !== 'ALL' && !it.ved_class?.toLowerCase().includes(vedFilter.toLowerCase())) return false;
        return true;
    });

    const exportToExcel = () => {
        if (!filteredItems || filteredItems.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(filteredItems.map((it, i) => ({
            'S.No': i + 1,
            'Medicine Name': it.item_name || '',
            'Category': it.category || '',
            'Annual Spend (₹)': it.annual_spend || 0,
            'ABC Class': it.abc_class || '',
            'VED Class': it.ved_class || '',
            'Composite Matrix': it.composite_matrix || '',
            'Control Policy': it.control_policy || '',
            'Outlet Scope': it.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'ABCVEDAnalysis');
        XLSX.writeFile(wb, `Drug_ABC_VED_Analysis_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `DRUG PURCHASE ABC & VED ANALYSIS MATRIX (${scope})`,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'category', label: 'Category', width: '90px' },
                { key: 'annual_spend', label: 'Annual Spend (₹)', width: '130px', align: 'right' },
                { key: 'abc_class', label: 'ABC Class', width: '110px' },
                { key: 'ved_class', label: 'VED Class', width: '90px' },
                { key: 'composite_matrix', label: 'Matrix', width: '80px', align: 'center' },
                { key: 'control_policy', label: 'Control Policy', width: '160px' }
            ],
            data: filteredItems,
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
                                <PieChart size={28} color={colors.primary} /> Drug Purchase ABC & VED Analysis Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Categorizing pharmaceutical items based on ABC expenditure value and VED medical criticality.
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

                    <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>ABC VALUE</label>
                        <Select 
                            value={abcFilter} 
                            onChange={e => setAbcFilter(e.target.value)} 
                            style={{ width: '100%' }}
                        >
                            <option value="ALL">All ABC Classes</option>
                            <option value="A">Class A (Top 70% Value)</option>
                            <option value="B">Class B (Medium 20%)</option>
                            <option value="C">Class C (Low 10%)</option>
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>VED CRITICALITY</label>
                        <Select 
                            value={vedFilter} 
                            onChange={e => setVedFilter(e.target.value)} 
                            style={{ width: '100%' }}
                        >
                            <option value="ALL">All VED</option>
                            <option value="Vital">Vital (Life-Saving)</option>
                            <option value="Essential">Essential</option>
                            <option value="Desirable">Desirable</option>
                        </Select>
                    </div>

                    <div style={{ flex: '2 1 220px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH MEDICINE</label>
                        <Input 
                            type="text" 
                            placeholder="Type medicine name..." 
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
                            onClick={() => { setAbcFilter('ALL'); setVedFilter('ALL'); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
                            title="Reset filters"
                            style={{ background: '#f1f5f9', color: '#475569', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Key Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #059669', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>ANALYZED MEDICINES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {summary.analyzed_medicines || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Total pharmaceuticals analyzed
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>CLASS A MEDICINES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.class_a_items || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            High value expenditure drivers
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>VITAL DRUGS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {summary.vital_drugs || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Critical emergency medications
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Running ABC & VED matrix algorithms...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <PieChart size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Medicines Matched</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            Try adjusting the ABC or VED filters.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '220px', padding: '12px 10px' }}>MEDICINE NAME</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>CATEGORY</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>ANNUAL SPEND (₹)</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'center', padding: '12px 10px' }}>ABC CLASS</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'center', padding: '12px 10px' }}>VED CLASS</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'center', padding: '12px 10px' }}>MATRIX</Th>
                                    <Th style={{ minWidth: '180px', padding: '12px 10px' }}>CONTROL POLICY</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((it, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{it.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{it.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{it.category || '-'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                            {formatCurrency(it.annual_spend || 0)}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '3px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.72rem', 
                                                fontWeight: '800', 
                                                background: it.abc_class?.includes('A') ? '#fef2f2' : (it.abc_class?.includes('B') ? '#eff6ff' : '#f8fafc'), 
                                                color: it.abc_class?.includes('A') ? '#dc2626' : (it.abc_class?.includes('B') ? '#0284c7' : '#64748b') 
                                            }}>
                                                {it.abc_class || 'Class C'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '3px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.72rem', 
                                                fontWeight: '800', 
                                                background: it.ved_class === 'Vital' ? '#fef2f2' : (it.ved_class === 'Essential' ? '#ecfdf5' : '#fffbeb'), 
                                                color: it.ved_class === 'Vital' ? '#dc2626' : (it.ved_class === 'Essential' ? '#059669' : '#d97706') 
                                            }}>
                                                {it.ved_class || 'Desirable'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>
                                            <code>{it.composite_matrix || '-'}</code>
                                        </Td>
                                        <Td style={{ color: '#475569', fontSize: '0.82rem' }}>{it.control_policy || '-'}</Td>
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

export default DrugAbcVedReport;
