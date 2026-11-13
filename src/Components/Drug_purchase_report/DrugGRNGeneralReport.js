import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    FileText, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, Building2
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

const DrugGRNGeneralReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_line_items: 0,
        total_received_qty: 0,
        total_grn_value: 0
    });
    const [records, setRecords] = useState([]);

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
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-grn-general-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setRecords(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setRecords([]);
            }
        } catch (err) {
            console.error('Error fetching Drug GRN General report:', err);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!records || records.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(records.map((r, i) => ({
            'S.No': i + 1,
            'GRN Number': r.grn_number || '',
            'Invoice No': r.invoice_no || '',
            'GRN Date': r.date || '',
            'Drug Supplier': r.vendor_name || '',
            'Medicine Name': r.item_name || '',
            'Batch': r.batch || '',
            'Expiry': r.expiry || '',
            'Received Qty': r.quantity || 0,
            'Free Qty': r.free_qty || 0,
            'Unit Rate (₹)': r.unit_rate || 0,
            'Total Cost (₹)': r.total_cost || 0,
            'Outlet Scope': r.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'GRNGeneral');
        XLSX.writeFile(wb, `Drug_GRN_General_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `DRUG PURCHASE GRN GENERAL REPORT (${scope})`,
            fromDate,
            toDate,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'grn_number', label: 'GRN No', width: '120px' },
                { key: 'invoice_no', label: 'Inv No', width: '90px' },
                { key: 'date', label: 'Date', width: '90px' },
                { key: 'vendor_name', label: 'Drug Supplier' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'batch', label: 'Batch', width: '80px' },
                { key: 'quantity', label: 'Qty', width: '70px', align: 'right' },
                { key: 'unit_rate', label: 'Rate (₹)', width: '80px', align: 'right' },
                { key: 'total_cost', label: 'Total (₹)', width: '110px', align: 'right' }
            ],
            data: records,
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
                                <FileText size={28} color={colors.primary} /> Drug Purchase GRN General Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Comprehensive general GRN ledger with itemized medicine lines, invoice details, batch expiries, and purchase costs from <code>hospital_grn</code>.
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

                    <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>FROM DATE</label>
                        <Input 
                            type="date" 
                            value={fromDate} 
                            onChange={e => setFromDate(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>TO DATE</label>
                        <Input 
                            type="date" 
                            value={toDate} 
                            onChange={e => setToDate(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ flex: '2 1 240px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH GRN / MEDICINE</label>
                        <Input 
                            type="text" 
                            placeholder="GRN No, invoice, medicine, supplier..." 
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
                            onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL GRN VALUE</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(summary.total_grn_value || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Itemized cost across purchases
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>RECEIVED QUANTITY</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {(summary.total_received_qty || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Total units checked into stock
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>LINE ITEMS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                            {summary.total_line_items || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Detailed GRN entries
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Compiling General GRN Detail...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <FileText size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No GRN Records Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No GRN items found between {fromDate} and {toDate}.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '120px', padding: '12px 10px' }}>GRN NO</Th>
                                    <Th style={{ minWidth: '95px', padding: '12px 10px' }}>INV NO</Th>
                                    <Th style={{ minWidth: '90px', padding: '12px 10px' }}>DATE</Th>
                                    <Th style={{ minWidth: '180px', padding: '12px 10px' }}>DRUG SUPPLIER</Th>
                                    <Th style={{ minWidth: '200px', padding: '12px 10px' }}>MEDICINE NAME</Th>
                                    <Th style={{ minWidth: '90px', padding: '12px 10px' }}>BATCH</Th>
                                    <Th style={{ minWidth: '85px', padding: '12px 10px' }}>EXPIRY</Th>
                                    <Th style={{ minWidth: '80px', textAlign: 'right', padding: '12px 10px' }}>QTY</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>RATE (₹)</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'right', padding: '12px 10px' }}>TOTAL COST (₹)</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {records.map((r, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{r.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.grn_number || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.invoice_no || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.date || '-'}</Td>
                                        <Td style={{ fontWeight: '600', color: '#1e293b' }}>{r.vendor_name || 'N/A'}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{r.batch || '-'}</code></Td>
                                        <Td style={{ color: '#64748b', fontSize: '0.85rem' }}>{r.expiry || '-'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{(r.quantity || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(r.unit_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                            {formatCurrency(r.total_cost || 0)}
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

export default DrugGRNGeneralReport;
