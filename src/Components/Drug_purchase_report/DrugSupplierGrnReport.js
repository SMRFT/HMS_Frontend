import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    ShieldCheck, RefreshCw, Download, Printer, 
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

const DrugSupplierGrnReport = () => {
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
        total_grns: 0,
        total_taxable_amount: 0,
        total_tax_itc: 0,
        total_net_purchases: 0
    });
    const [reportData, setReportData] = useState([]);

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
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-supplier-grn-report/${queryString}`);
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
            console.error('Error fetching Drug Supplier GRN report:', err);
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
            'GRN Number': r.grn_number || '',
            'Invoice No': r.invoice_no || '',
            'Invoice Date': r.invoice_date || '',
            'Drug Supplier': r.vendor_name || '',
            'GSTIN': r.vendor_gstin || '',
            'Payment Mode': r.payment_mode || '',
            'Taxable Value (₹)': r.taxable_amount || 0,
            'CGST (₹)': r.cgst || 0,
            'SGST (₹)': r.sgst || 0,
            'Discount (₹)': r.total_discount || 0,
            'Net Invoice Amount (₹)': r.net_amount || 0,
            'Outlet': r.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'SupplierGRN');
        XLSX.writeFile(wb, `Drug_Supplier_GRN_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `SUPPLIER-BASED GRN REPORT (${scope})`,
            fromDate,
            toDate,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'grn_number', label: 'GRN No', width: '120px' },
                { key: 'invoice_no', label: 'Inv No', width: '100px' },
                { key: 'invoice_date', label: 'Date', width: '90px' },
                { key: 'vendor_name', label: 'Drug Supplier' },
                { key: 'vendor_gstin', label: 'GSTIN', width: '120px' },
                { key: 'taxable_amount', label: 'Taxable (₹)', width: '100px', align: 'right' },
                { key: 'cgst', label: 'CGST', width: '70px', align: 'right' },
                { key: 'sgst', label: 'SGST', width: '70px', align: 'right' },
                { key: 'net_amount', label: 'Net Amount (₹)', width: '110px', align: 'right' }
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
                                <ShieldCheck size={28} color={colors.primary} /> Supplier-Based GRN Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Goods Received Note (GRN) report categorized by Drug Supplier / Vendor with tax breakdowns from <code>hospital_grn</code>.
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
                            <option value="">All Drug Suppliers</option>
                            {vendors.map(v => (
                                <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH</label>
                        <Input 
                            type="text" 
                            placeholder="GRN No / Inv / Supplier..." 
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
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL NET PURCHASES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(summary.total_net_purchases || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Net bill amounts across GRNs
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL GRNS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {summary.total_grns || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Inward consignments recorded
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TAXABLE VALUE</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                            {formatCurrency(summary.total_taxable_amount || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Base assessable value
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL GST (ITC)</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            {formatCurrency(summary.total_tax_itc || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            CGST + SGST Input Tax Credit
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Loading Supplier GRN Data...</p>
                    </div>
                ) : reportData.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <ShieldCheck size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Supplier GRN Records Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No GRN invoices matched your current filters for {scope}.
                        </p>
                        <Button onClick={handleReset} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '50px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '130px', padding: '12px 10px' }}>GRN NUMBER</Th>
                                    <Th style={{ minWidth: '110px', padding: '12px 10px' }}>INVOICE NO</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>INV DATE</Th>
                                    <Th style={{ minWidth: '220px', padding: '12px 10px' }}>DRUG SUPPLIER (VENDOR)</Th>
                                    <Th style={{ minWidth: '130px', padding: '12px 10px' }}>GSTIN</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>PAY MODE</Th>
                                    <Th style={{ minWidth: '120px', textAlign: 'right', padding: '12px 10px' }}>TAXABLE (₹)</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>CGST (₹)</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>SGST (₹)</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>DISC (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>NET AMOUNT (₹)</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {reportData.map((r, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{r.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{r.grn_number || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.invoice_no || '-'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}>{r.invoice_date || '-'}</Td>
                                        <Td style={{ fontWeight: '700', color: '#1e293b' }}>{r.vendor_name || 'N/A'}</Td>
                                        <Td style={{ color: '#64748b', fontSize: '0.82rem' }}><code>{r.vendor_gstin || '-'}</code></Td>
                                        <Td style={{ color: '#475569', fontSize: '0.82rem' }}>{r.payment_mode || 'CREDIT'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>
                                            {(r.taxable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#059669', fontSize: '0.85rem' }}>
                                            {(r.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#059669', fontSize: '0.85rem' }}>
                                            {(r.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#dc2626', fontSize: '0.85rem' }}>
                                            {(r.total_discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                            {formatCurrency(r.net_amount || 0)}
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

export default DrugSupplierGrnReport;
