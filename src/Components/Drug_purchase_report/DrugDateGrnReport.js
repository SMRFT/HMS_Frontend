import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    CalendarDays, Calendar, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, ChevronDown, ChevronRight, FileText, RotateCcw
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
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
import SearchSelect from '../Common/SearchSelect';
import { SCOPE_OPTIONS, getStoredScope, setStoredScope } from './drugReportHelper';
import { printStoresReport } from '../Stores/printStoresReport';

const DrugDateGrnReport = () => {
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
    const [expandedDate, setExpandedDate] = useState(null);
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_dates: 0,
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
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-date-grn-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                const sortedList = [...list].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
                sortedList.forEach(d => {
                    if (Array.isArray(d.grns)) {
                        d.grns.sort((a, b) => {
                            const invDiff = dayjs(a.invoice_date || a.date).valueOf() - dayjs(b.invoice_date || b.date).valueOf();
                            if (invDiff !== 0) return invDiff;
                            return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
                        });
                    }
                    if (Array.isArray(d.returns)) {
                        d.returns.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
                    }
                });
                setReportData(sortedList);
                if (payload.summary) setSummary(payload.summary);
                if (payload.vendors) setVendors(payload.vendors);
            } else {
                setReportData([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Date GRN report:', err);
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
        setSearchTerm('');
        setSelectedVendor('');
        setFromDate(oneMonthAgo);
        setToDate(today);
        setExpandedDate(null);
        setTimeout(() => fetchReport(), 50);
    };

    const toggleExpandDate = (dateKey) => {
        setExpandedDate(prev => prev === dateKey ? null : dateKey);
    };

    const exportToExcel = () => {
        if (!reportData || reportData.length === 0) return;

        // Sheet 1: Date Summary
        const dateRows = reportData.map(d => ({
            "Date": d.date,
            "Day of Week": d.day_of_week || '',
            "Scope": scope,
            "Total GRNs": d.total_grns,
            "Suppliers Count": d.suppliers_count || 0,
            "Suppliers List": Array.isArray(d.suppliers) ? d.suppliers.join(', ') : '',
            "Taxable Amount (Rs.)": d.taxable_amount,
            "Tax Amount (Rs.)": d.tax_amount,
            "Total Purchases (GRN) (Rs.)": d.total_amount,
            "Total Returns (Debit Notes)": d.total_returns || 0,
            "Return Amount (Rs.)": d.return_amount || 0,
            "Net Purchases (Rs.)": d.net_amount != null ? d.net_amount : (d.total_amount - (d.return_amount || 0)),
            "Items Received (Units)": d.total_items_qty
        }));

        // Sheet 2: Detailed GRN Invoices
        const grnRows = [];
        reportData.forEach(d => {
            if (Array.isArray(d.grns)) {
                d.grns.forEach(g => {
                    grnRows.push({
                        "GRN Date": d.date,
                        "Day": d.day_of_week || '',
                        "GRN Number": g.grn_number,
                        "Invoice Number": g.invoice_no || '',
                        "Invoice Date": g.invoice_date || '',
                        "Supplier Name": g.vendor_name || '',
                        "Supplier ID": g.vendor_id || '',
                        "GSTIN": g.vendor_gstin || '',
                        "Taxable Amount (Rs.)": g.taxable_amount || 0,
                        "CGST (Rs.)": g.cgst || 0,
                        "SGST (Rs.)": g.sgst || 0,
                        "Tax Amount (Rs.)": g.tax_amount || 0,
                        "Total Amount (Rs.)": g.total_amount,
                        "Items Count": g.items_count || (g.items?.length || 0),
                        "Payment Mode": g.payment_mode || 'Credit',
                        "Status": g.is_approved ? 'Approved' : 'Pending'
                    });
                });
            }
        });

        // Sheet 3: Purchase Returns (Debit Notes)
        const returnRows = [];
        reportData.forEach(d => {
            if (Array.isArray(d.returns)) {
                d.returns.forEach(r => {
                    returnRows.push({
                        "Return Date": d.date,
                        "Day": d.day_of_week || '',
                        "Debit Note No": r.debit_note_no || r.return_id,
                        "Supplier Name": r.vendor_name || '',
                        "Supplier ID": r.vendor_id || '',
                        "Against GRN": r.grn_number || '-',
                        "Return Reason": r.reason || '',
                        "Items Count": r.items_count || (r.items?.length || 0),
                        "Return Amount (Rs.)": r.total_amount
                    });
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(dateRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Date Summary");

        if (grnRows.length > 0) {
            const wsGrns = XLSX.utils.json_to_sheet(grnRows);
            XLSX.utils.book_append_sheet(wb, wsGrns, "GRN Invoices");
        }

        if (returnRows.length > 0) {
            const wsReturns = XLSX.utils.json_to_sheet(returnRows);
            XLSX.utils.book_append_sheet(wb, wsReturns, "Purchase Returns (Debit Notes)");
        }

        XLSX.writeFile(wb, `Drug_Date_GRN_Report_${scope.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Button 
                        secondary 
                        onClick={() => navigate('/DrugPurchaseReportsDashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                </div>

                {/* Header Title */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: '#059669', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CalendarDays size={28} color="#059669" /> Date-Based GRN Report
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                        Chronological Goods Received Note (GRN) report categorized by Date with day of week, supplier count, gross purchases, returns (debit notes), net purchases, and item units from hospital_grn and hospital_vendor.
                    </p>
                </div>

                {/* Scope Selection Tabs */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} color="#059669" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Outlet / Scope:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SCOPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleScopeChange(opt.value)}
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${scope === opt.value ? '#059669' : '#e2e8f0'}`,
                                    background: scope === opt.value ? '#ecfdf5' : '#ffffff',
                                    color: scope === opt.value ? '#059669' : '#64748b',
                                    fontWeight: '700',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0891b2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL ACTIVE DAYS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#0891b2', fontWeight: '700' }}>{summary.total_dates || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Days with GRN activity</span>
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

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                    <form onSubmit={handleFilterSubmit} style={{ width: '100%', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ minWidth: '240px', flex: '1 1 220px' }}>
                            <SearchSelect
                                options={[
                                    { value: "", label: "All Drug Suppliers" },
                                    ...vendors.map((v) => ({
                                        value: String(v.vendor_id),
                                        label: `${v.name} (${v.vendor_id})`
                                    }))
                                ]}
                                value={selectedVendor || ""}
                                onChange={(e) => {
                                    setSelectedVendor(e.target.value);
                                }}
                                placeholder="All Drug Suppliers"
                                height="42px"
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                            <Input
                                placeholder="Search by Date, Day, Supplier, GRN No, Invoice No, or DBN..."
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

                        <Button type="submit" style={{ height: '42px', padding: '0 20px', borderRadius: '8px', background: '#059669' }}>
                            Apply Filter
                        </Button>
                        <Button secondary type="button" onClick={clearFilters} style={{ height: '42px', padding: '0 16px', borderRadius: '8px' }}>
                            <RefreshCw size={16} /> Reset
                        </Button>
                        <Button type="button" onClick={exportToExcel} style={{ background: '#16a34a', color: '#ffffff', height: '42px', padding: '0 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button type="button" onClick={() => printStoresReport(reportData, { isDatePurchaseFormat: true, fromDate, toDate, summary, hospitalName: 'SHANMUGA HOSPITAL LIMITED', department: scope })} style={{ background: '#0284c7', color: '#ffffff', height: '42px', padding: '0 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Printer size={16} /> Print
                        </Button>
                    </form>
                </ControlsContainer>

                {/* Report Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Date-Based GRN Report...
                        </div>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th style={{ width: '40px' }}></Th>
                                        <Th>Invoice Date & Day</Th>
                                        <Th style={{ textAlign: 'center' }}>Total GRNs</Th>
                                        <Th style={{ textAlign: 'center' }}>Suppliers</Th>
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
                                            <Td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No GRN records found for the selected period.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        reportData.map((d) => {
                                            const isExpanded = expandedDate === d.date;
                                            const returnCount = d.total_returns || (d.returns ? d.returns.length : 0);
                                            const returnAmount = Number(d.return_amount || 0);
                                            const netAmount = Number(d.net_amount != null ? d.net_amount : (d.total_amount || 0) - returnAmount);

                                            return (
                                                <React.Fragment key={d.date}>
                                                    <Tr
                                                        onClick={() => toggleExpandDate(d.date)}
                                                        style={{ cursor: 'pointer', background: isExpanded ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}
                                                    >
                                                        <Td style={{ textAlign: 'center' }}>
                                                            {isExpanded ? <ChevronDown size={18} color="#059669" /> : <ChevronRight size={18} color={colors.textMuted} />}
                                                        </Td>
                                                        <Td style={{ fontWeight: '700' }}>
                                                            <div style={{ color: '#059669', fontSize: '0.95rem' }}>
                                                                {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                                                {d.day_of_week || (dayjs(d.date).isValid() ? dayjs(d.date).format('dddd') : '')}
                                                            </span>
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                            {d.total_grns}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#475569' }}>
                                                            {d.suppliers_count || (d.suppliers ? d.suppliers.length : 0)} Vendors
                                                        </Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                            ₹{Number(d.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                                                            {d.total_items_qty} units
                                                        </Td>
                                                    </Tr>

                                                    {/* Expanded Sub-Tables */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={9} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                {/* GRN Invoices Sub-table */}
                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FileText size={16} /> Invoices Dated {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date} ({d.grns?.length || 0} Invoices)
                                                                </div>
                                                                <div style={{ background: '#ffffff', borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: returnCount > 0 ? '16px' : '0' }}>
                                                                    <Table>
                                                                        <thead>
                                                                            <Tr style={{ background: '#f1f5f9' }}>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px' }}>#</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px' }}>GRN Number</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px' }}>Invoice No & Date</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px' }}>Supplier / Vendor</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center' }}>Items</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right' }}>Tax Amount</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right' }}>Total Amount</Th>
                                                                                <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center' }}>Status</Th>
                                                                            </Tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {d.grns && d.grns.length > 0 ? (
                                                                                d.grns.map((g, gIdx) => (
                                                                                    <Tr key={g.grn_number || gIdx}>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px' }}>{gIdx + 1}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', fontWeight: '600', color: '#059669' }}>{g.grn_number}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                                                                                            <div style={{ fontWeight: '600' }}>{g.invoice_no || '-'}</div>
                                                                                            {g.invoice_date && (
                                                                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                                                    {dayjs(g.invoice_date).isValid() ? dayjs(g.invoice_date).format('DD/MM/YYYY') : g.invoice_date}
                                                                                                </div>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', fontWeight: '600' }}>{g.vendor_name || g.vendor_id || '-'}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center' }}>{g.items_count || (g.items ? g.items.length : 0)}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right' }}>₹{Number(g.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>₹{Number(g.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                                                                        <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center' }}>
                                                                                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: g.is_approved ? '#dcfce7' : '#fef3c7', color: g.is_approved ? '#166534' : '#92400e', fontWeight: '600' }}>
                                                                                                {g.is_approved ? 'Approved' : 'Pending'}
                                                                                            </span>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                ))
                                                                            ) : (
                                                                                <Tr>
                                                                                    <Td colSpan={8} style={{ textAlign: 'center', padding: '12px', color: colors.textMuted }}>No GRN records</Td>
                                                                                </Tr>
                                                                            )}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>

                                                                {/* Purchase Returns Sub-table if any */}
                                                                {returnCount > 0 && (
                                                                    <>
                                                                        <div style={{ marginBottom: '10px', fontWeight: '700', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <RotateCcw size={16} /> Purchase Returns (Debit Notes) on {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date} ({returnCount} Debit Notes)
                                                                        </div>
                                                                        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca', overflow: 'hidden' }}>
                                                                            <Table>
                                                                                <thead>
                                                                                    <Tr style={{ background: '#fef2f2' }}>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#991b1b' }}>#</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#991b1b' }}>Debit Note No</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#991b1b' }}>Supplier / Vendor</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#991b1b' }}>Against GRN</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#991b1b' }}>Return Reason</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center', color: '#991b1b' }}>Items</Th>
                                                                                        <Th style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right', color: '#991b1b' }}>Return Amount</Th>
                                                                                    </Tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {d.returns.map((ret, rIdx) => (
                                                                                        <Tr key={ret.return_id || rIdx}>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px' }}>{rIdx + 1}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px', fontWeight: '600', color: '#dc2626' }}>{ret.debit_note_no || ret.return_id}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px', fontWeight: '600' }}>{ret.vendor_name || ret.vendor_id || '-'}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px', color: '#64748b' }}>{ret.grn_number || '-'}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px' }}>{ret.reason || 'Drug Purchase Return'}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'center' }}>{ret.items_count || (ret.items ? ret.items.length : 0)}</Td>
                                                                                            <Td style={{ fontSize: '0.8rem', padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>
                                                                                                -₹{Number(ret.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                                            </Td>
                                                                                        </Tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </>
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

export default DrugDateGrnReport;
