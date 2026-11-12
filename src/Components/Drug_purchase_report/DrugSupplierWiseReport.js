import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Building2, RefreshCw, Download, Printer, 
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

const DrugSupplierWiseReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_suppliers: 0,
        total_order_value: 0,
        total_payments_cleared: 0,
        total_outstanding_payable: 0
    });
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        fetchSupplierReport();
    }, [scope]);

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        setStoredScope(newScope);
    };

    const fetchSupplierReport = async () => {
        try {
            setLoading(true);
            const query = [
                `scope=${encodeURIComponent(scope)}`
            ];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-supplier-wise-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setSuppliers(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setSuppliers([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Supplier Wise report:', err);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!suppliers || suppliers.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(suppliers.map((s, i) => ({
            'S.No': i + 1,
            'Vendor Code': s.vendor_id || '',
            'Supplier Name': s.vendor_name || '',
            'City': s.city || '',
            'GSTIN': s.gstin || '',
            'Payment Terms': s.payment_terms || '',
            'Total Orders': s.total_orders || 0,
            'Total Purchases (₹)': s.total_purchases || 0,
            'Paid Amount (₹)': s.paid_amount || 0,
            'Pending Due (₹)': s.pending_due || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'SuppliersLedger');
        XLSX.writeFile(wb, `Drug_Suppliers_Ledger_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `SUPPLIER-WISE LIST & LEDGER (${scope})`,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'vendor_id', label: 'Vendor Code', width: '90px' },
                { key: 'vendor_name', label: 'Supplier Name' },
                { key: 'city', label: 'City', width: '90px' },
                { key: 'gstin', label: 'GSTIN', width: '130px' },
                { key: 'payment_terms', label: 'Terms', width: '90px' },
                { key: 'total_orders', label: 'Orders', width: '70px', align: 'center' },
                { key: 'total_purchases', label: 'Purchases (₹)', width: '120px', align: 'right' },
                { key: 'paid_amount', label: 'Paid (₹)', width: '110px', align: 'right' },
                { key: 'pending_due', label: 'Pending Due (₹)', width: '110px', align: 'right' }
            ],
            data: suppliers,
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
                                <Building2 size={28} color={colors.primary} /> Supplier-Wise List & Ledger
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Comprehensive directory of pharmaceutical suppliers with cumulative purchases, cleared payments, and balance dues from <code>hospital_vendor</code>.
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
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
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

                    <div style={{ flex: '2 1 300px', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH SUPPLIER / CITY / GSTIN</label>
                        <Input 
                            type="text" 
                            placeholder="Type supplier name, city, GSTIN..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            onClick={fetchSupplierReport} 
                            style={{ background: colors.primary, color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={16} /> Search
                        </Button>
                        <Button 
                            onClick={() => { setSearchTerm(''); setTimeout(fetchSupplierReport, 50); }} 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL PURCHASES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(summary.total_order_value || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Cumulative orders value
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>CLEARED PAYMENTS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {formatCurrency(summary.total_payments_cleared || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Disbursed supplier payouts
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>OUTSTANDING PAYABLE</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            {formatCurrency(summary.total_outstanding_payable || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Pending dues to vendors
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL SUPPLIERS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                            {summary.total_suppliers || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Active hospital suppliers
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Fetching Suppliers Directory...</p>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <Building2 size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Suppliers Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No supplier records matched "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>CODE</Th>
                                    <Th style={{ minWidth: '220px', padding: '12px 10px' }}>SUPPLIER NAME</Th>
                                    <Th style={{ minWidth: '110px', padding: '12px 10px' }}>CITY</Th>
                                    <Th style={{ minWidth: '130px', padding: '12px 10px' }}>GSTIN</Th>
                                    <Th style={{ minWidth: '90px', padding: '12px 10px' }}>TERMS</Th>
                                    <Th style={{ minWidth: '70px', textAlign: 'center', padding: '12px 10px' }}>ORDERS</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>TOTAL PURCHASES (₹)</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'right', padding: '12px 10px' }}>PAID (₹)</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'right', padding: '12px 10px' }}>PENDING DUE (₹)</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {suppliers.map((s, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{s.sno || idx + 1}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{s.vendor_id || '-'}</code></Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{s.vendor_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{s.city || '-'}</Td>
                                        <Td style={{ color: '#64748b', fontSize: '0.82rem' }}><code>{s.gstin || '-'}</code></Td>
                                        <Td style={{ color: '#475569', fontSize: '0.82rem' }}>{s.payment_terms || '30 Days'}</Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>{s.total_orders || 0}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                                            {(s.total_purchases || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#0284c7', fontSize: '0.85rem' }}>
                                            {(s.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: (s.pending_due || 0) > 0 ? '#dc2626' : '#059669' }}>
                                            {(s.pending_due || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default DrugSupplierWiseReport;
