import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    BarChart3, TrendingUp, RefreshCw, Download, Printer, 
    Building2, Package, Search, ArrowLeft, Filter
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

const DrugPurchaseAnalysisReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        active_suppliers: 0,
        total_drug_purchases: 0,
        top_supplier: 'N/A',
        distinct_medicines: 0
    });
    const [reportData, setReportData] = useState([]);
    const [activeTab, setActiveTab] = useState('vendor'); // 'vendor' | 'monthly' | 'items'

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
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor && selectedVendor !== 'all') query.push(`vendor_id=${selectedVendor}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-purchase-analysis-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setReportData(list);
                if (payload.summary) setSummary(payload.summary);
                if (payload.vendors && payload.vendors.length > 0) setVendors(payload.vendors);
            } else {
                setReportData([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Purchase Analysis:', err);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFromDate(oneMonthAgo);
        setToDate(today);
        setSelectedVendor('');
        setSearchTerm('');
        setTimeout(() => fetchReport(), 50);
    };

    const exportToExcel = () => {
        if (!reportData || reportData.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(reportData.map((r, i) => ({
            'S.No': i + 1,
            'Vendor Code': r.vendor_id || '',
            'Drug Supplier (Vendor)': r.vendor_name || '',
            'Total Invoices': r.invoice_count || 0,
            'Total Spend (₹)': r.total_spend || 0,
            'Spend Share (%)': r.spend_share ? `${r.spend_share}%` : '0%',
            'Outlet Scope': r.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'DrugPurchaseAnalysis');
        XLSX.writeFile(wb, `Drug_Purchase_Analysis_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `DRUG PURCHASE ANALYSIS REPORT (${scope})`,
            fromDate,
            toDate,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '50px' },
                { key: 'vendor_name', label: 'Drug Supplier (Vendor)' },
                { key: 'vendor_id', label: 'Vendor Code', width: '100px' },
                { key: 'invoice_count', label: 'Total Invoices', width: '100px', align: 'center' },
                { key: 'total_spend', label: 'Total Spend (₹)', width: '140px', align: 'right' },
                { key: 'spend_share', label: 'Spend Share (%)', width: '120px', align: 'right' }
            ],
            data: reportData,
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
                                <BarChart3 size={28} color={colors.primary} /> Purchase Analysis Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Procurement trend analysis, supplier turnover, and spend share from <code>hospital_grn</code> & <code>hospital_vendor</code>.
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
                    {/* Outlet Scope Selector */}
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

                    {/* From Date */}
                    <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>FROM DATE</label>
                        <Input 
                            type="date" 
                            value={fromDate} 
                            onChange={e => setFromDate(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    {/* To Date */}
                    <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>TO DATE</label>
                        <Input 
                            type="date" 
                            value={toDate} 
                            onChange={e => setToDate(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    {/* Filter Vendor */}
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>DRUG SUPPLIER</label>
                        <Select 
                            value={selectedVendor} 
                            onChange={e => setSelectedVendor(e.target.value)} 
                            style={{ width: '100%' }}
                        >
                            <option value="">All Drug Suppliers</option>
                            {vendors.map(v => (
                                <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>
                            ))}
                        </Select>
                    </div>

                    {/* Search */}
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH</label>
                        <Input 
                            type="text" 
                            placeholder="Supplier name / ID..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            onClick={fetchReport} 
                            style={{ background: colors.primary, color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={16} /> Analyze
                        </Button>
                        <Button 
                            onClick={handleReset} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL PURCHASE SPEND</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(summary.total_drug_purchases || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Across selected date range & {scope}
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>ACTIVE SUPPLIERS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.active_suppliers || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Suppliers with recorded GRNs
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOP SUPPLIER</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={summary.top_supplier || 'N/A'}>
                            {summary.top_supplier || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Highest purchase share
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>DISTINCT MEDICINES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            {summary.distinct_medicines || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Pharmaceutical line items
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Compiling Purchase Analytics for {scope}...</p>
                    </div>
                ) : reportData.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <BarChart3 size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Purchase Records Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No GRN purchases found for {scope} between {fromDate} and {toDate}. Try widening your date range or clearing filters.
                        </p>
                        <Button onClick={handleReset} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '60px', textAlign: 'center', padding: '12px 14px' }}>S.NO</Th>
                                    <Th style={{ padding: '12px 14px' }}>DRUG SUPPLIER (VENDOR)</Th>
                                    <Th style={{ width: '130px', padding: '12px 14px' }}>VENDOR CODE</Th>
                                    <Th style={{ width: '130px', textAlign: 'center', padding: '12px 14px' }}>INVOICES</Th>
                                    <Th style={{ width: '180px', textAlign: 'right', padding: '12px 14px' }}>TOTAL SPEND (₹)</Th>
                                    <Th style={{ width: '150px', textAlign: 'right', padding: '12px 14px' }}>SPEND SHARE (%)</Th>
                                    <Th style={{ width: '130px', textAlign: 'center', padding: '12px 14px' }}>OUTLET</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {reportData.map((r, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{r.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.vendor_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{r.vendor_id || '-'}</code></Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{r.invoice_count || 1}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                            {formatCurrency(r.total_spend || 0)}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#0284c7' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                <span>{r.spend_share ? `${r.spend_share}%` : '0%'}</span>
                                                <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min(100, r.spend_share || 0)}%`, height: '100%', background: '#0284c7' }}></div>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: '#ecfdf5', color: '#059669' }}>
                                                {r.scope || scope}
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

export default DrugPurchaseAnalysisReport;
