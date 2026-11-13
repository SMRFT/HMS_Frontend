import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
    Search,
    Printer,
    Download,
    RefreshCw,
    Filter,
    Pill,
    ShoppingBag,
    Truck,
    ArrowLeft,
    TrendingUp,
    ChevronLeft,
    ChevronRight
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
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';

const DrugPurchaseReportPageTemplate = ({
    reportKey,
    title,
    description,
    icon: IconComponent = Pill,
    themeColor = '#059669',
    category = 'Drug Purchase Reports'
}) => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    // Scope: IP PHARMACY / OP PHARMACY / DRUG PURCHASE
    const [selectedScope, setSelectedScope] = useState(() => {
        const stored = getSelectedStoreDepartment();
        if (stored === 'IP PHARMACY' || stored === 'OP PHARMACY' || stored === 'DRUG PURCHASE') {
            return stored;
        }
        return 'DRUG PURCHASE';
    });

    // Filter states matching Stores_report
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Report data states
    const [reportData, setReportData] = useState({
        columns: [],
        data: [],
        summary: {},
        vendors: [],
        departments: [],
        title: ''
    });

    // Synchronize stores department helper
    useStoresDepartment((newDept) => {
        if (newDept && (newDept === 'IP PHARMACY' || newDept === 'OP PHARMACY' || newDept === 'DRUG PURCHASE')) {
            setSelectedScope(newDept);
        }
    });

    const handleScopeChange = (scope) => {
        setSelectedScope(scope);
        setSelectedStoreDepartment(scope, scope);
        setCurrentPage(1);
    };

    // Load data from backend API
    const loadReportData = useCallback(async (scopeVal = selectedScope, fDate = fromDate, tDate = toDate, vend = selectedVendor, search = searchTerm) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const queryParams = new URLSearchParams({
                report_key: reportKey,
                scope: scopeVal,
                from_date: fDate || '',
                to_date: tDate || '',
                vendor_id: vend || 'all',
                search: search || ''
            });

            const url = `${getBaseUrl.replace(/\/$/, '')}/drug-purchase-reports-dashboard/?${queryParams.toString()}`;
            const res = await apiRequest(url, 'GET');

            // CRITICAL FIX: apiRequest returns { success: true, data: response.data }
            // So the actual backend payload is inside res.data!
            if (res && res.success) {
                const payload = res.data || res;
                const results = payload.data || payload.results || (Array.isArray(payload) ? payload : []);
                const cols = payload.columns || [];
                const summ = payload.summary || {};
                const vends = payload.vendors || [];
                const depts = payload.departments || [];

                setReportData({
                    columns: cols,
                    data: results,
                    summary: summ,
                    vendors: vends,
                    departments: depts,
                    title: payload.title || `${title} (${scopeVal})`
                });
            } else {
                setReportData({
                    columns: [],
                    data: [],
                    summary: {},
                    vendors: [],
                    departments: [],
                    title: `${title} (${scopeVal})`
                });
            }
        } catch (err) {
            console.error(`Error loading drug purchase report [${reportKey}]:`, err);
            setReportData({
                columns: [],
                data: [],
                summary: {},
                vendors: [],
                departments: [],
                title: `${title} (${scopeVal})`
            });
        } finally {
            setLoading(false);
        }
    }, [reportKey, selectedScope, fromDate, toDate, selectedVendor, searchTerm, title]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(1);
        loadReportData(selectedScope, fromDate, toDate, selectedVendor, searchTerm);
    };

    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setSelectedVendor('');
        setSearchTerm('');
        setCurrentPage(1);
        loadReportData(selectedScope, '', '', '', '');
    };

    // Client-side search across loaded rows
    const filteredRows = useMemo(() => {
        if (!reportData.data || !Array.isArray(reportData.data)) return [];
        let rows = reportData.data;

        if (searchTerm && searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            rows = rows.filter(r => 
                Object.values(r).some(val => String(val || '').toLowerCase().includes(q))
            );
        }

        return rows;
    }, [reportData.data, searchTerm]);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

    // Excel Export matching Stores_report style
    const handleExportExcel = () => {
        if (!filteredRows || filteredRows.length === 0) {
            alert('No records available to export.');
            return;
        }
        try {
            const exportData = filteredRows.map((row, idx) => {
                const cleanRow = { 'S.No': idx + 1 };
                (reportData.columns || []).forEach((col) => {
                    if (col.key !== 'sno') {
                        cleanRow[col.label] = row[col.key] != null ? row[col.key] : '';
                    }
                });
                return cleanRow;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "DrugPurchase");
            const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedScope.replace(/\s+/g, '_')}_${today}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error('Failed to export excel:', err);
        }
    };

    // Single Hospital Header Print
    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=1100,height=850');
        if (!printWindow) return;

        const tableHeaders = (reportData.columns || []).map(col => `
            <th style="padding: 8px 10px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; text-align: ${col.align || 'left'}; font-size: 8.5pt;">
                ${col.label}
            </th>
        `).join('');

        const tableBody = filteredRows.map(row => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                ${(reportData.columns || []).map(col => {
                    const val = row[col.key];
                    const isNum = typeof val === 'number';
                    const isCur = isNum && (col.key.includes('amount') || col.key.includes('net') || col.key.includes('taxable') || col.key.includes('cost') || col.key.includes('rate') || col.key.includes('valuation') || col.key.includes('spend'));
                    const formatted = isCur ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (val != null ? String(val) : '—');
                    return `<td style="padding: 6px 10px; text-align: ${col.align || 'left'}; font-size: 8pt;">${formatted}</td>`;
                }).join('')}
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportData.title || title}</title>
                <style>
                    @page { size: landscape; margin: 8mm; }
                    body { font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #000; }
                    .header { text-align: center; margin-bottom: 14px; border-bottom: 1.5px solid #000; padding-bottom: 8px; }
                    .header h1 { margin: 0 0 4px 0; font-size: 14pt; letter-spacing: 0.5px; }
                    .header h2 { margin: 0 0 4px 0; font-size: 11pt; color: #333; }
                    .meta { display: flex; justify-content: space-between; font-size: 8pt; margin-top: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SHANMUGA HOSPITAL</h1>
                    <h2>${reportData.title || title}</h2>
                    <div class="meta">
                        <span>Scope: <strong>${selectedScope}</strong></span>
                        <span>Total Records: <strong>${filteredRows.length}</strong></span>
                        <span>Printed As On: <strong>${dayjs().format('DD/MM/YYYY HH:mm:ss')}</strong></span>
                    </div>
                </div>
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableBody}</tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Top Scope Switcher & Back Button Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <Button
                        type="button"
                        onClick={() => navigate('/DrugPurchaseReportsDashboard')}
                        style={{
                            background: '#ffffff',
                            color: '#334155',
                            border: '1.5px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.88rem'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Drug Purchase Dashboard
                    </Button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 10px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginRight: '4px' }}>
                            Scope:
                        </span>
                        <Button
                            type="button"
                            onClick={() => handleScopeChange('IP PHARMACY')}
                            style={{
                                background: selectedScope === 'IP PHARMACY' ? '#059669' : '#ffffff',
                                color: selectedScope === 'IP PHARMACY' ? '#ffffff' : '#475569',
                                border: '1px solid ' + (selectedScope === 'IP PHARMACY' ? '#059669' : '#cbd5e1'),
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Pill size={14} /> IP PHARMACY
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleScopeChange('OP PHARMACY')}
                            style={{
                                background: selectedScope === 'OP PHARMACY' ? '#059669' : '#ffffff',
                                color: selectedScope === 'OP PHARMACY' ? '#ffffff' : '#475569',
                                border: '1px solid ' + (selectedScope === 'OP PHARMACY' ? '#059669' : '#cbd5e1'),
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <ShoppingBag size={14} /> OP PHARMACY
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleScopeChange('DRUG PURCHASE')}
                            style={{
                                background: selectedScope === 'DRUG PURCHASE' ? '#059669' : '#ffffff',
                                color: selectedScope === 'DRUG PURCHASE' ? '#ffffff' : '#475569',
                                border: '1px solid ' + (selectedScope === 'DRUG PURCHASE' ? '#059669' : '#cbd5e1'),
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Truck size={14} /> DRUG PURCHASE
                        </Button>
                    </div>
                </div>

                {/* Header Title & Actions Card */}
                <div style={{ background: '#ffffff', borderRadius: '14px', border: `1px solid ${colors.border}`, borderLeft: `5px solid ${themeColor}`, padding: '20px 24px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconComponent size={26} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, color: colors.textMain, fontSize: '1.65rem', fontWeight: '800' }}>
                                {title}
                            </h1>
                            <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.88rem' }}>
                                {description}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            type="button"
                            onClick={handleExportExcel}
                            style={{ background: '#16a34a', color: '#ffffff', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button
                            type="button"
                            onClick={handlePrint}
                            style={{ background: '#0284c7', color: '#ffffff', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                        <Button
                            type="button"
                            onClick={() => loadReportData()}
                            style={{ background: '#f1f5f9', color: '#334155', padding: '9px 14px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <RefreshCw size={15} /> Refresh
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics Cards (matching Stores_report style) */}
                {reportData.summary && Object.keys(reportData.summary).length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                        {Object.entries(reportData.summary).map(([key, val]) => {
                            const label = key.replace(/_/g, ' ').replace('total', '').trim().toUpperCase();
                            const isCurrency = typeof val === 'number' && (key.includes('amount') || key.includes('cost') || key.includes('valuation') || key.includes('spend') || key.includes('taxable') || key.includes('dues'));
                            return (
                                <div
                                    key={key}
                                    style={{
                                        background: '#ffffff',
                                        padding: '16px 20px',
                                        borderRadius: '12px',
                                        border: `1px solid ${colors.border}`,
                                        borderLeft: `4px solid ${themeColor}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <div>
                                        <div style={{ color: colors.textMuted, fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                                            {label}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                                            {isCurrency ? `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : val}
                                        </div>
                                    </div>
                                    <TrendingUp size={28} color={themeColor} opacity={0.35} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Filters Bar (ControlsContainer matching Stores_report exactly) */}
                <ControlsContainer style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={handleFilterSubmit} style={{ width: '100%', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        
                        {/* From Date */}
                        <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
                                From Date
                            </label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            />
                        </div>

                        {/* To Date */}
                        <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
                                To Date
                            </label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            />
                        </div>

                        {/* Drug Supplier Select Dropdown */}
                        <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
                                Drug Supplier / Vendor
                            </label>
                            <Select
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            >
                                <option value="">All Drug Suppliers ({reportData.vendors?.length || 837})</option>
                                {(reportData.vendors || []).map(v => (
                                    <option key={v.vendor_id} value={v.vendor_id}>
                                        {v.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Search Input */}
                        <div style={{ flex: '2 1 260px', minWidth: '220px', position: 'relative' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
                                Search Text
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                                <Input
                                    type="text"
                                    placeholder="Filter by drug name, batch, GRN, or invoice..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', height: '40px', paddingLeft: '38px', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        {/* Filter & Reset Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                                type="submit"
                                style={{ height: '40px', padding: '0 20px', borderRadius: '8px', background: '#059669', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Filter size={15} /> Apply Filter
                            </Button>
                            <Button
                                type="button"
                                secondary
                                onClick={handleResetFilters}
                                style={{ height: '40px', padding: '0 16px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <RefreshCw size={15} /> Reset
                            </Button>
                        </div>
                    </form>
                </ControlsContainer>

                {/* Report Table Card */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#059669', fontWeight: '700' }}>
                            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                            <div>Loading {title} from hospital_grn and hospital_vendor...</div>
                        </div>
                    ) : (
                        <>
                            <TableWrapper>
                                <Table>
                                    <thead>
                                        <Tr>
                                            {(reportData.columns || []).map((col) => (
                                                <Th
                                                    key={col.key}
                                                    style={{ width: col.width, textAlign: col.align || 'left', background: '#f1f5f9', whiteSpace: 'nowrap', padding: '12px 14px' }}
                                                >
                                                    {col.label}
                                                </Th>
                                            ))}
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRows.map((row, idx) => (
                                            <Tr key={idx}>
                                                {(reportData.columns || []).map((col) => {
                                                    const val = row[col.key];
                                                    const isNum = typeof val === 'number';
                                                    const isCur = isNum && (col.key.includes('amount') || col.key.includes('cost') || col.key.includes('taxable') || col.key.includes('total') || col.key.includes('net') || col.key.includes('rate') || col.key.includes('valuation') || col.key.includes('spend'));
                                                    return (
                                                        <Td
                                                            key={col.key}
                                                            style={{
                                                                textAlign: col.align || 'left',
                                                                fontWeight: (col.key === 'item_name' || col.key === 'vendor_name' || col.key === 'name') ? 600 : 'normal',
                                                                padding: '10px 14px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {isCur ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (val != null ? String(val) : '—')}
                                                        </Td>
                                                    );
                                                })}
                                            </Tr>
                                        ))}
                                        {paginatedRows.length === 0 && (
                                            <Tr>
                                                <Td colSpan={(reportData.columns || []).length || 6} style={{ textAlign: 'center', padding: '50px 20px', color: colors.textMuted }}>
                                                    No records found for the selected filter criteria in {selectedScope}.
                                                </Td>
                                            </Tr>
                                        )}
                                    </tbody>
                                </Table>
                            </TableWrapper>

                            {/* Pagination Controls Footer */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#ffffff', borderTop: `1px solid ${colors.border}`, fontSize: '0.85rem', color: colors.textMuted, flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>
                                        Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} entries
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>Show:</span>
                                        <Select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            style={{ height: '32px', padding: '0 8px', borderRadius: '6px', fontSize: '0.82rem' }}
                                        >
                                            <option value={15}>15</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <Button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155' }}
                                    >
                                        <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Prev
                                    </Button>
                                    <span style={{ padding: '4px 10px', fontWeight: '700', color: colors.textMain }}>
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        type="button"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155' }}
                                    >
                                        Next <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Container>
        </PageWrapper>
    );
};

export default DrugPurchaseReportPageTemplate;
