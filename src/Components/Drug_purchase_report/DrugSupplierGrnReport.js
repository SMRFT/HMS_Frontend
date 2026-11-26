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
import { printStoresReport } from '../Stores/printStoresReport';

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
        total_returns: 0,
        grand_taxable_amount: 0,
        grand_tax_amount: 0,
        grand_total_amount: 0,
        grand_return_amount: 0,
        grand_net_amount: 0
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
                list.forEach(s => {
                    if (Array.isArray(s.grns)) {
                        s.grns.sort((a, b) => {
                            const invDiff = dayjs(a.invoice_date || a.date).valueOf() - dayjs(b.invoice_date || b.date).valueOf();
                            if (invDiff !== 0) return invDiff;
                            return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
                        });
                    }
                    if (Array.isArray(s.returns)) {
                        s.returns.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
                    }
                });
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
            "Total Purchases (₹)": s.total_amount,
            "Total Returns": s.total_returns || (s.returns ? s.returns.length : 0),
            "Return Amount (₹)": s.return_amount || 0,
            "Net Purchases (₹)": s.net_amount != null ? s.net_amount : (s.total_amount || 0) - (s.return_amount || 0),
            "Taxable Amount (₹)": s.taxable_amount,
            "Tax Paid (₹)": s.tax_amount,
            "Items Received Qty": s.total_items_qty
        }));

        const grnRows = [];
        const returnRows = [];
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
            if (Array.isArray(s.returns)) {
                s.returns.forEach(r => {
                    returnRows.push({
                        "Vendor ID": s.vendor_id,
                        "Supplier Name": s.vendor_name,
                        "Debit Note No": r.debit_note_no || '',
                        "Return ID": r.return_id || '',
                        "Return Date": r.return_date || '',
                        "Against GRN": r.grn_number || '',
                        "Return Amount (₹)": r.total_amount || 0,
                        "Reason": r.reason_for_return || '',
                        "Status": r.status || ''
                    });
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);
        const wsGrns = XLSX.utils.json_to_sheet(grnRows);

        XLSX.utils.book_append_sheet(wb, wsSupplier, "Supplier Summary");
        XLSX.utils.book_append_sheet(wb, wsGrns, "Detailed GRN Invoices");
        if (returnRows.length > 0) {
            const wsReturns = XLSX.utils.json_to_sheet(returnRows);
            XLSX.utils.book_append_sheet(wb, wsReturns, "Purchase Returns (Debit Notes)");
        }

        XLSX.writeFile(wb, `Drug_Supplier_GRN_Report_${scope.replace(/\s+/g, '_')}_${today}.xlsx`);
    };

    const handlePrint = () => {
        printStoresReport(reportData, {
            isSupplierPurchaseFormat: true,
            fromDate,
            toDate,
            summary,
            hospitalName: 'SHANMUGA HOSPITAL LIMITED',
            department: scope || 'ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)'
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
                                <ShieldCheck size={28} color={colors.primary} /> Supplier-Based GRN Report ({scope})
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

                {/* SCOPE TOGGLE BUTTONS: ALL / IP / OP / DRUG */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Filter size={16} color="#059669" /> Scope Filter:
                    </span>
                    {[
                        { id: 'ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)', label: 'ALL (IP, OP, DRUG)' },
                        { id: 'IP PHARMACY', label: 'IP PHARMACY' },
                        { id: 'OP PHARMACY', label: 'OP PHARMACY' },
                        { id: 'DRUG PURCHASE', label: 'DRUG PURCHASE' }
                    ].map(btn => {
                        const isActive = scope === btn.id || (btn.id.includes('ALL') && (scope?.includes('ALL') || scope?.includes('CONSOLIDATED')));
                        return (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => handleScopeChange(btn.id)}
                                style={{
                                    padding: '7px 18px',
                                    borderRadius: '20px',
                                    border: isActive ? '2px solid #059669' : '1.5px solid #cbd5e1',
                                    background: isActive ? '#059669' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#334155',
                                    fontWeight: isActive ? '800' : '600',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none'
                                }}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>

                {/* Key Metrics Cards - 5 cards with Purchases, Returns, and Net */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
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

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PURCHASES (GRN)</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: '#1e293b', fontWeight: '700' }}>
                            ₹{Number(summary.grand_total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gross Invoiced Amount</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL RETURNS (DEBIT NOTES)</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: '#dc2626', fontWeight: '700' }}>
                            -₹{Number(summary.grand_return_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>{summary.total_returns || 0} Debit Notes</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #059669', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>NET PURCHASES</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#059669', fontWeight: '800' }}>
                            ₹{Number(summary.grand_net_amount != null ? summary.grand_net_amount : (summary.grand_total_amount || 0) - (summary.grand_return_amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>Purchases Minus Returns</span>
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
                                        <Th style={{ textAlign: 'right' }}>Total Purchases</Th>
                                        <Th style={{ textAlign: 'center' }}>Returns</Th>
                                        <Th style={{ textAlign: 'right' }}>Return Amount</Th>
                                        <Th style={{ textAlign: 'right' }}>Net Purchases</Th>
                                        <Th style={{ textAlign: 'center' }}>Items Recd</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {!Array.isArray(reportData) || reportData.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No Drug Supplier GRN records found for the selected period.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        reportData.map((supplier) => {
                                            const isExpanded = expandedSupplier === supplier.vendor_id;
                                            const returnCount = supplier.total_returns || (supplier.returns ? supplier.returns.length : 0);
                                            const returnAmount = Number(supplier.return_amount || 0);
                                            const netAmount = Number(supplier.net_amount != null ? supplier.net_amount : (supplier.total_amount || 0) - returnAmount);

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
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                            ₹{Number(supplier.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: returnCount > 0 ? '#dc2626' : colors.textMuted }}>
                                                            {returnCount > 0 ? `${returnCount} DBN` : '0'}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '600', color: returnAmount > 0 ? '#dc2626' : colors.textMuted }}>
                                                            {returnAmount > 0 ? `-₹${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                                            ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                            {supplier.total_items_qty} units
                                                        </Td>
                                                    </Tr>

                                                    {/* Expanded Sub-Table for GRNs and Returns */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={8} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: colors.primary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FileText size={16} /> GRNs from {supplier.vendor_name} ({supplier.grns?.length || 0} Invoices)
                                                                </div>

                                                                <Table style={{ background: '#ffffff', borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: (supplier.returns && supplier.returns.length > 0) ? '18px' : '0' }}>
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

                                                                {/* Purchase Returns / Debit Notes Sub-table */}
                                                                {Array.isArray(supplier.returns) && supplier.returns.length > 0 && (
                                                                    <div>
                                                                        <div style={{ marginBottom: '10px', fontWeight: '700', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <FileText size={16} /> Purchase Returns (Debit Notes) from {supplier.vendor_name} ({supplier.returns.length} Returns)
                                                                        </div>
                                                                        <Table style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca', overflow: 'hidden' }}>
                                                                            <thead>
                                                                                <Tr style={{ background: '#fee2e2' }}>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b' }}>Debit Note / Return ID</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b' }}>Return Date</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b' }}>Against GRN</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b' }}>Reason</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b', textAlign: 'center' }}>Items Count</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b', textAlign: 'right' }}>Return Value</Th>
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b', textAlign: 'center' }}>Status</Th>
                                                                                </Tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {supplier.returns.map((ret, rIdx) => (
                                                                                    <Tr key={rIdx}>
                                                                                        <Td style={{ fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                            <div>{ret.debit_note_no || ret.return_id}</div>
                                                                                            {ret.debit_note_no && ret.return_id && ret.debit_note_no !== ret.return_id && (
                                                                                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({ret.return_id})</span>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td style={{ fontSize: '0.85rem' }}>{ret.return_date || '-'}</Td>
                                                                                        <Td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2563eb' }}>{ret.grn_number || '-'}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem' }}>
                                                                                            <div>{ret.reason_for_return || ret.return_type || '-'}</div>
                                                                                        </Td>
                                                                                        <Td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                                                            {ret.items_count || 0}
                                                                                        </Td>
                                                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                            -₹{Number(ret.total_amount || 0).toFixed(2)}
                                                                                        </Td>
                                                                                        <Td style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                                                                                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: ret.status === 'Completed' || ret.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: ret.status === 'Completed' || ret.status === 'Approved' ? '#166534' : '#92400e', fontWeight: '600' }}>
                                                                                                {ret.status || 'Processed'}
                                                                                            </span>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                )}
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
