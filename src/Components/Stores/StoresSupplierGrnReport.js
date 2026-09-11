import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, FileText, ChevronDown, ChevronRight, 
    Building2, DollarSign, CreditCard, Clock, CheckCircle, Package, Download
} from 'lucide-react';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    Input,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    colors
} from '../GlobalStyles';

const StoresSupplierGrnReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_suppliers: 0,
        total_grns: 0,
        grand_tax_amount: 0,
        grand_total_amount: 0,
        grand_total_paid: 0,
        grand_pending_amount: 0
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [expandedSupplier, setExpandedSupplier] = useState(null);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor) query.push(`vendor_id=${selectedVendor}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-grn-supplier-report/${queryString}`);
            if (response && response.success && response.data) {
                const resPayload = response.data;
                const reportList = Array.isArray(resPayload.data) ? resPayload.data : (Array.isArray(resPayload) ? resPayload : []);
                setReportData(reportList);
                if (resPayload.summary) setSummary(resPayload.summary);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching Supplier GRN report:", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        setSelectedVendor('');
        setSearchTerm('');
        setTimeout(() => fetchReport(), 100);
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
            "Total GRNs": s.total_grns,
            "Taxable Amount (₹)": s.taxable_amount,
            "Tax Paid (₹)": s.tax_amount,
            "Total Invoice Amount (₹)": s.total_amount,
            "Total Paid (₹)": s.total_paid,
            "Pending Balance (₹)": s.pending_amount,
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
                        "Total Amount (₹)": g.total_amount,
                        "Total Paid (₹)": g.total_paid,
                        "Pending Balance (₹)": g.pending_amount,
                        "Approval Status": g.is_approved ? 'Approved' : 'Pending',
                        "Items Summary": Array.isArray(g.items) ? g.items.map(it => `${it.itemName || it.name || 'Item'} (${it.quantity || 0} Qty)`).join(', ') : ''
                    });
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);
        const wsGrns = XLSX.utils.json_to_sheet(grnRows);

        XLSX.utils.book_append_sheet(wb, wsSupplier, "Supplier Summary");
        XLSX.utils.book_append_sheet(wb, wsGrns, "Detailed GRN Invoices");

        XLSX.writeFile(wb, `Stores_Supplier_GRN_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Title */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building2 size={28} color={colors.primary} /> Supplier-Based Stores GRN Report
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                        Comprehensive Goods Received Note (GRN) report categorized by Supplier / Vendor, including tax breakdown, payment status, and items received.
                    </p>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL SUPPLIERS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: colors.textMain, fontWeight: '700' }}>{summary.total_suppliers || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Vendors</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL GRNS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#2563eb', fontWeight: '700' }}>{summary.total_grns || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Invoices Received</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>GRAND TOTAL GRN VALUE</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#059669', fontWeight: '700' }}>
                            ₹{Number(summary.grand_total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Taxable + Taxes</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PAID</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#16a34a', fontWeight: '700' }}>
                            ₹{Number(summary.grand_total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cleared Payments</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>PENDING BALANCE</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: (summary.grand_pending_amount > 0 ? '#dc2626' : '#16a34a'), fontWeight: '700' }}>
                            ₹{Number(summary.grand_pending_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Outstanding Supplier Balance</span>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                    <form onSubmit={handleFilterSubmit} style={{ width: '100%', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                            <Input
                                placeholder="Search by Supplier Name, ID, GRN No, or Invoice No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px', height: '42px', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} color={colors.textMuted} />
                            <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '600' }}>From:</span>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ height: '42px', width: '150px', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '600' }}>To:</span>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ height: '42px', width: '150px', borderRadius: '8px' }}
                            />
                        </div>

                        <Button type="submit" style={{ height: '42px', padding: '0 20px', borderRadius: '8px' }}>
                            Apply Filter
                        </Button>
                        <Button secondary type="button" onClick={clearFilters} style={{ height: '42px', padding: '0 16px', borderRadius: '8px' }}>
                            <RefreshCw size={16} /> Reset
                        </Button>
                        <Button type="button" onClick={exportToExcel} style={{ background: '#16a34a', color: '#ffffff', height: '42px', padding: '0 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Download size={16} /> Export Excel
                        </Button>
                    </form>
                </ControlsContainer>

                {/* Report Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Supplier GRN Report...
                        </div>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th style={{ width: '40px' }}></Th>
                                        <Th>Supplier / Vendor</Th>
                                        <Th style={{ textAlign: 'center' }}>Total GRNs</Th>
                                        <Th style={{ textAlign: 'right' }}>Taxable Amount</Th>
                                        <Th style={{ textAlign: 'right' }}>Tax Paid</Th>
                                        <Th style={{ textAlign: 'right' }}>Total Invoice Amount</Th>
                                        <Th style={{ textAlign: 'right' }}>Total Paid</Th>
                                        <Th style={{ textAlign: 'right' }}>Pending Balance</Th>
                                        <Th style={{ textAlign: 'center' }}>Items Recd</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {!Array.isArray(reportData) || reportData.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No Supplier GRN records found for the selected period.
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
                                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {supplier.vendor_id}</span>
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
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                                                            ₹{Number(supplier.total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: supplier.pending_amount > 0 ? '#dc2626' : '#16a34a' }}>
                                                            ₹{Number(supplier.pending_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                            {supplier.total_items_qty} units
                                                        </Td>
                                                    </Tr>

                                                    {/* Expanded Sub-Table for GRNs */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={9} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: colors.primary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FileText size={16} /> GRNs from {supplier.vendor_name} ({supplier.grns?.length} Invoices)
                                                                </div>

                                                                <Table style={{ background: '#ffffff', borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                                                                    <thead>
                                                                        <Tr style={{ background: '#e2e8f0' }}>
                                                                            <Th style={{ fontSize: '0.8rem' }}>GRN Number</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>GRN Date</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Invoice No & Date</Th>
                                                                            <Th style={{ fontSize: '0.8rem', textAlign: 'right' }}>Total Amount</Th>
                                                                            <Th style={{ fontSize: '0.8rem', textAlign: 'right' }}>Amount Paid</Th>
                                                                            <Th style={{ fontSize: '0.8rem', textAlign: 'right' }}>Pending</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Items Summary</Th>
                                                                        </Tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {supplier.grns.map((g, gIdx) => (
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
                                                                                <Td style={{ textAlign: 'right', color: '#16a34a', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                    ₹{Number(g.total_paid || 0).toFixed(2)}
                                                                                </Td>
                                                                                <Td style={{ textAlign: 'right', color: g.pending_amount > 0 ? '#dc2626' : '#16a34a', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                    ₹{Number(g.pending_amount || 0).toFixed(2)}
                                                                                </Td>
                                                                                <Td style={{ fontSize: '0.8rem' }}>
                                                                                    {Array.isArray(g.items) && g.items.length > 0 ? (
                                                                                        <div>
                                                                                            {g.items.slice(0, 3).map((it, itIdx) => (
                                                                                                <span key={itIdx} style={{ display: 'block', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', margin: '4px 0', fontSize: '0.75rem' }}>
                                                                                                    <div style={{ fontWeight: '700', color: colors.textMain }}>{it.itemName || it.name}</div>
                                                                                                    <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '2px' }}>
                                                                                                        Pre-Approval: <span style={{ fontWeight: 600 }}>{it.quantity_before_approval ?? (it.previous_stock ?? '-')}</span> | 
                                                                                                        Added: <span style={{ fontWeight: 600, color: '#16a34a' }}>+{it.added_quantity ?? (it.quantity || 0)}</span> | 
                                                                                                        Post-Approval: <span style={{ fontWeight: 600, color: '#0284c7' }}>{it.quantity_after_approval ?? (it.new_stock ?? '-')}</span>
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

export default StoresSupplierGrnReport;
