import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    RotateCcw, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, AlertTriangle
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

const DrugPurchaseReturnReport = () => {
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
        total_debit_notes: 0,
        total_returned_value: 0
    });
    const [returnList, setReturnList] = useState([]);

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
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-purchase-return-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setReturnList(list);
                if (payload.summary) setSummary(payload.summary);
                if (payload.vendors && payload.vendors.length > 0) setVendors(payload.vendors);
            } else {
                setReturnList([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Purchase Return report:', err);
            setReturnList([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!returnList || returnList.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(returnList.map((r, i) => ({
            'S.No': i + 1,
            'Debit Note No': r.debit_note_no || '',
            'Date': r.date || '',
            'GRN Number': r.grn_number || '',
            'Drug Supplier': r.vendor_name || '',
            'Medicine Name': r.item_name || '',
            'Returned Quantity': r.returned_qty || 0,
            'Return Reason': r.return_reason || '',
            'Debit Amount (₹)': r.debit_amount || 0,
            'Status': r.status || '',
            'Outlet Scope': r.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'PurchaseReturns');
        XLSX.writeFile(wb, `Drug_Purchase_Returns_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `PURCHASE RETURN & DEBIT NOTES REPORT (${scope})`,
            fromDate,
            toDate,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'debit_note_no', label: 'Debit Note', width: '110px' },
                { key: 'date', label: 'Date', width: '90px' },
                { key: 'grn_number', label: 'GRN No', width: '120px' },
                { key: 'vendor_name', label: 'Drug Supplier' },
                { key: 'item_name', label: 'Returned Medicine' },
                { key: 'returned_qty', label: 'Qty', width: '60px', align: 'center' },
                { key: 'return_reason', label: 'Reason', width: '140px' },
                { key: 'debit_amount', label: 'Debit Value (₹)', width: '110px', align: 'right' },
                { key: 'status', label: 'Status', width: '110px' }
            ],
            data: returnList,
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
                                <RotateCcw size={28} color={colors.primary} /> Purchase Return & Debit Notes
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Track returned pharmaceutical batches, debit notes raised against drug vendors, and adjustment credit vouchers.
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

                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>DRUG SUPPLIER</label>
                        <Select 
                            value={selectedVendor} 
                            onChange={e => setSelectedVendor(e.target.value)} 
                            style={{ width: '100%' }}
                        >
                            <option value="">All Suppliers</option>
                            {vendors.map(v => (
                                <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH</label>
                        <Input 
                            type="text" 
                            placeholder="Debit note / item / GRN..." 
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
                            onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSelectedVendor(''); setSearchTerm(''); setTimeout(fetchReport, 50); }} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL RETURNED VALUE</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {formatCurrency(summary.total_returned_value || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Cumulative debit notes amount
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL DEBIT NOTES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.total_debit_notes || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Dispatched return batches
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Fetching debit note records...</p>
                    </div>
                ) : returnList.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RotateCcw size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Purchase Return Records</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No debit notes found matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '120px', padding: '12px 10px' }}>DEBIT NOTE</Th>
                                    <Th style={{ minWidth: '95px', padding: '12px 10px' }}>DATE</Th>
                                    <Th style={{ minWidth: '130px', padding: '12px 10px' }}>GRN NUMBER</Th>
                                    <Th style={{ minWidth: '200px', padding: '12px 10px' }}>DRUG SUPPLIER</Th>
                                    <Th style={{ minWidth: '180px', padding: '12px 10px' }}>RETURNED MEDICINE</Th>
                                    <Th style={{ minWidth: '70px', textAlign: 'center', padding: '12px 10px' }}>QTY</Th>
                                    <Th style={{ minWidth: '150px', padding: '12px 10px' }}>REASON</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'right', padding: '12px 10px' }}>DEBIT VALUE (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'center', padding: '12px 10px' }}>STATUS</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {returnList.map((r, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{r.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.debit_note_no || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.date || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{r.grn_number || '-'}</code></Td>
                                        <Td style={{ fontWeight: '700', color: '#1e293b' }}>{r.vendor_name || 'N/A'}</Td>
                                        <Td style={{ color: '#0f172a' }}>{r.item_name || 'N/A'}</Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#dc2626' }}>{r.returned_qty || 0}</Td>
                                        <Td style={{ color: '#64748b', fontSize: '0.85rem' }}>{r.return_reason || '-'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                                            {formatCurrency(r.debit_amount || 0)}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: '#ecfdf5', color: '#059669' }}>
                                                {r.status || 'PROCESSED'}
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

export default DrugPurchaseReturnReport;
