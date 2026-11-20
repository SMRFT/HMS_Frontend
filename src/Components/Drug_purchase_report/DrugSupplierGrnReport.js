import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    ShieldCheck, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, ChevronDown, ChevronRight, FileText
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
import SearchSelect from '../Common/SearchSelect';
import { SCOPE_OPTIONS, getStoredScope, setStoredScope, printDrugReport } from './drugReportHelper';

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
    const [expandedSupplier, setExpandedSupplier] = useState(null);
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_suppliers: 0,
        total_grns: 0,
        grand_taxable_amount: 0,
        grand_tax_amount: 0,
        grand_total_amount: 0
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

    const toggleExpandSupplier = (vendorId) => {
        if (expandedSupplier === vendorId) {
            setExpandedSupplier(null);
        } else {
            setExpandedSupplier(vendorId);
        }
    };

    const exportToExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const supplierRows = reportData.map(s => ({
            "Vendor ID": s.vendor_id,
            "Supplier Name": s.vendor_name,
            "GSTIN": s.vendor_gstin || '',
            "Total GRNs": s.total_grns,
            "Taxable Amount (₹)": s.taxable_amount,
            "Tax Paid (₹)": s.tax_amount,
            "Total Invoice Amount (₹)": s.total_amount,
            "Items Received Qty": s.total_items_qty
        }));

        const grnRows = [];
        reportData.forEach(s => {
            if (Array.isArray(s.grns)) {
                s.grns.forEach(g => {
                    grnRows.push({
                        "Vendor ID": s.vendor_id,
                        "Supplier Name": s.vendor_name,
                        "GRN Number": g.grn_number,
                        "GRN Date": g.date || '',
                        "Invoice No": g.invoice_no || '',
                        "Invoice Date": g.invoice_date || '',
                        "Taxable Value (₹)": g.taxable_amount,
                        "CGST (₹)": g.cgst,
                        "SGST (₹)": g.sgst,
                        "Total Amount (₹)": g.total_amount,
                        "Payment Mode": g.payment_mode || 'Credit',
                        "Approval Status": g.is_approved ? 'Approved' : 'Pending',
                        "Items Summary": Array.isArray(g.items) ? g.items.map(it => `${it.name || it.itemName || 'Item'} (${it.quantity || 0} Qty)`).join(', ') : ''
                    });
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);
        const wsGrns = XLSX.utils.json_to_sheet(grnRows);

        XLSX.utils.book_append_sheet(wb, wsSupplier, "Supplier Summary");
        XLSX.utils.book_append_sheet(wb, wsGrns, "Detailed GRN Invoices");

        XLSX.writeFile(wb, `Drug_Supplier_GRN_Report_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `SUPPLIER-BASED DRUG GRN REPORT (${scope})`,
            fromDate,
            toDate,
            scope,
            columns: [
                { key: 'vendor_name', label: 'Supplier / Vendor', width: '220px' },
                { key: 'total_grns', label: 'Total GRNs', width: '90px', align: 'center' },
                { key: 'taxable_amount', label: 'Taxable (₹)', width: '120px', align: 'right' },
                { key: 'tax_amount', label: 'Tax Paid (₹)', width: '110px', align: 'right' },
                { key: 'total_amount', label: 'Net Total (₹)', width: '130px', align: 'right' },
                { key: 'total_items_qty', label: 'Units Recd', width: '90px', align: 'center' }
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
                                <ShieldCheck size={28} color={colors.primary} /> Supplier-Based Drug GRN Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Comprehensive Drug GRN report categorized by Supplier / Vendor, including tax breakdown, invoices, and received medicines.
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

                {/* Key Metrics Cards - 3 cards without Total Paid / Pending Balance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0891b2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL SUPPLIERS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#0891b2', fontWeight: '700' }}>{summary.total_suppliers || reportData.length || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Drug Suppliers</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL GRNS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#2563eb', fontWeight: '700' }}>{summary.total_grns || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Invoices Received</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #059669', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>GRAND TOTAL GRN VALUE</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#059669', fontWeight: '700' }}>
                            ₹{Number(summary.grand_total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Taxable + Taxes</span>
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

                    <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>DRUG SUPPLIER</label>
                        <SearchSelect 
                            options={[
                                { value: "", label: "All Drug Suppliers" },
                                ...vendors.map(v => ({
                                    value: String(v.vendor_id),
                                    label: `${v.name} (${v.vendor_id})`
                                }))
                            ]}
                            value={selectedVendor || ""} 
                            onChange={e => setSelectedVendor(e.target.value)} 
                            placeholder="All Drug Suppliers"
                            height="40px"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH</label>
                        <Input 
                            type="text" 
                            placeholder="Supplier / GRN No / Inv..." 
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

                {/* Expandable Table Matching StoresSupplierGrnReport */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Drug Supplier GRN Report...
                        </div>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th style={{ width: '40px' }}></Th>
                                        <Th>Drug Supplier / Vendor</Th>
                                        <Th style={{ textAlign: 'center' }}>Total GRNs</Th>
                                        <Th style={{ textAlign: 'right' }}>Taxable Amount</Th>
                                        <Th style={{ textAlign: 'right' }}>Tax Paid</Th>
                                        <Th style={{ textAlign: 'right' }}>Total Invoice Amount</Th>
                                        <Th style={{ textAlign: 'center' }}>Items Recd</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {!Array.isArray(reportData) || reportData.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No Drug Supplier GRN records found for the selected period.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        reportData.map((supplier) => {
                                            const isExpanded = expandedSupplier === supplier.vendor_id;
                                            return (
                                                <React.Fragment key={supplier.vendor_id}>
                                                    <Tr
                                                        onClick={() => toggleExpandSupplier(supplier.vendor_id)}
                                                        style={{ cursor: 'pointer', background: isExpanded ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}
                                                    >
                                                        <Td style={{ textAlign: 'center' }}>
                                                            {isExpanded ? <ChevronDown size={18} color={colors.primary} /> : <ChevronRight size={18} color={colors.textMuted} />}
                                                        </Td>
                                                        <Td style={{ fontWeight: '700' }}>
                                                            <div style={{ color: colors.primary, fontSize: '0.95rem' }}>{supplier.vendor_name}</div>
                                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                                                ID: {supplier.vendor_id} {supplier.vendor_gstin ? `| GSTIN: ${supplier.vendor_gstin}` : ''}
                                                            </span>
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                            {supplier.total_grns}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                            ₹{Number(supplier.taxable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', color: '#d97706', fontWeight: '600' }}>
                                                            ₹{Number(supplier.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                            ₹{Number(supplier.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                            {supplier.total_items_qty} units
                                                        </Td>
                                                    </Tr>

                                                    {/* Expanded Sub-Table for GRNs */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={7} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: colors.primary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FileText size={16} /> GRNs from {supplier.vendor_name} ({supplier.grns?.length || 0} Invoices)
                                                                </div>

                                                                <Table style={{ background: '#ffffff', borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                                                                    <thead>
                                                                        <Tr style={{ background: '#e2e8f0' }}>
                                                                            <Th style={{ fontSize: '0.8rem' }}>GRN Number</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>GRN Date</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Invoice No & Date</Th>
                                                                            <Th style={{ fontSize: '0.8rem', textAlign: 'right' }}>Total Amount</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Items Summary</Th>
                                                                        </Tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {Array.isArray(supplier.grns) && supplier.grns.map((g, gIdx) => (
                                                                            <Tr key={gIdx}>
                                                                                <Td style={{ fontWeight: '600', color: colors.primary, fontSize: '0.85rem' }}>
                                                                                    {g.grn_number}
                                                                                </Td>
                                                                                <Td style={{ fontSize: '0.85rem' }}>{g.date || '-'}</Td>
                                                                                <Td style={{ fontSize: '0.85rem' }}>
                                                                                    <div>{g.invoice_no || '-'}</div>
                                                                                    <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{g.invoice_date || '-'}</span>
                                                                                </Td>
                                                                                <Td style={{ textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                    ₹{Number(g.total_amount || 0).toFixed(2)}
                                                                                </Td>
                                                                                <Td style={{ fontSize: '0.8rem' }}>
                                                                                    {Array.isArray(g.items) && g.items.length > 0 ? (
                                                                                        <div>
                                                                                            {g.items.slice(0, 3).map((it, itIdx) => (
                                                                                                <span key={itIdx} style={{ display: 'block', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', margin: '4px 0', fontSize: '0.75rem' }}>
                                                                                                    <div style={{ fontWeight: '700', color: colors.textMain }}>{it.name || it.itemName || 'Medicine Item'}</div>
                                                                                                    <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '2px' }}>
                                                                                                        Qty: <span style={{ fontWeight: 600, color: '#16a34a' }}>{it.quantity || 0}</span>
                                                                                                        {it.free ? <> (Free: <span style={{ fontWeight: 600 }}>{it.free}</span>)</> : null}
                                                                                                        {it.batch ? <> | Batch: <span style={{ fontWeight: 600 }}>{it.batch}</span></> : null}
                                                                                                        {it.expiry ? <> | Exp: <span style={{ fontWeight: 600 }}>{it.expiry}</span></> : null}
                                                                                                        {it.purchase_cost ? <> | Cost: <span style={{ fontWeight: 600 }}>₹{it.purchase_cost}</span></> : null}
                                                                                                    </div>
                                                                                                </span>
                                                                                            ))}
                                                                                            {g.items.length > 3 && (
                                                                                                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}> +{g.items.length - 3} more</span>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : '-'}
                                                                                </Td>
                                                                            </Tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            </Td>
                                                        </Tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    )}
                </div>
            </Container>
        </PageWrapper>
    );
};

export default DrugSupplierGrnReport;
