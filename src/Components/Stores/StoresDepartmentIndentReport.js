import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, FileText, ChevronDown, ChevronRight, 
    Building2, ClipboardList, CheckCircle, Clock, PackageCheck, AlertCircle, Download
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

const StoresDepartmentIndentReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_departments: 0,
        total_indents: 0,
        total_approved: 0,
        total_pending: 0,
        total_requested_quantity: 0
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [expandedDept, setExpandedDept] = useState(null);

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
            if (selectedDepartment) query.push(`department=${selectedDepartment}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-indent-department-report/${queryString}`);
            if (response && response.success && response.data) {
                const resPayload = response.data;
                const reportList = Array.isArray(resPayload.data) ? resPayload.data : (Array.isArray(resPayload) ? resPayload : []);
                setReportData(reportList);
                if (resPayload.summary) setSummary(resPayload.summary);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching Department Indent report:", error);
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
        setSelectedDepartment('');
        setSearchTerm('');
        setTimeout(() => fetchReport(), 100);
    };

    const toggleExpandDept = (deptId) => {
        if (expandedDept === deptId) {
            setExpandedDept(null);
        } else {
            setExpandedDept(deptId);
        }
    };

    const exportToExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const deptRows = reportData.map(d => ({
            "Department ID": d.department_id,
            "Department Name": d.department_name,
            "Total Indents": d.total_indents,
            "Approved Indents": d.approved_indents,
            "Pending Indents": d.pending_indents,
            "Total Distinct Items": d.total_items_count,
            "Total Requested Qty": d.total_requested_qty
        }));

        const indentRows = [];
        reportData.forEach(d => {
            if (Array.isArray(d.intents)) {
                d.intents.forEach(indent => {
                    indentRows.push({
                        "Department ID": d.department_id,
                        "Department Name": d.department_name,
                        "Intent ID": indent.intent_id,
                        "Date": indent.date || '',
                        "Approval Status": indent.is_approved ? 'Approved' : 'Pending',
                        "Requested Items Summary": Array.isArray(indent.items) ? indent.items.map(it => `${it.itemName || it.name || it.item_name || 'Item'} (${it.quantity || it.intent_qty || 0} Qty)`).join(', ') : ''
                    });
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const wsDept = XLSX.utils.json_to_sheet(deptRows);
        const wsIndents = XLSX.utils.json_to_sheet(indentRows);

        XLSX.utils.book_append_sheet(wb, wsDept, "Department Summary");
        XLSX.utils.book_append_sheet(wb, wsIndents, "Detailed Indents");

        XLSX.writeFile(wb, `Stores_Department_Indent_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Title */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ClipboardList size={28} color={colors.primary} /> Department-Based Stores Indent Report
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                        Track stores item requisitions (indents) grouped by Department, showing intent approval status, item counts, and requested quantities.
                    </p>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL DEPARTMENTS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: colors.textMain, fontWeight: '700' }}>{summary.total_departments || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Requisition Units</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL INDENTS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#2563eb', fontWeight: '700' }}>{summary.total_indents || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Requisitions Raised</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>APPROVED INDENTS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#16a34a', fontWeight: '700' }}>{summary.total_approved || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Issued / Approved</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>PENDING INDENTS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#d97706', fontWeight: '700' }}>{summary.total_pending || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting Approval</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL REQUESTED QTY</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#4f46e5', fontWeight: '700' }}>{summary.total_requested_quantity || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Item Units Demanded</span>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                    <form onSubmit={handleFilterSubmit} style={{ width: '100%', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                            <Input
                                placeholder="Search by Department Name, ID, or Intent ID..."
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

                {/* Main Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Department Indent Report...
                        </div>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th style={{ width: '40px' }}></Th>
                                        <Th>Department Name</Th>
                                        <Th style={{ textAlign: 'center' }}>Total Indents</Th>
                                        <Th style={{ textAlign: 'center' }}>Approved</Th>
                                        <Th style={{ textAlign: 'center' }}>Pending</Th>
                                        <Th style={{ textAlign: 'center' }}>Total Distinct Items</Th>
                                        <Th style={{ textAlign: 'center' }}>Total Requested Qty</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {!Array.isArray(reportData) || reportData.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No Department Indent records found for the selected period.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        reportData.map((dept) => {
                                            const isExpanded = expandedDept === dept.department_id;
                                            return (
                                                <React.Fragment key={dept.department_id}>
                                                    <Tr
                                                        onClick={() => toggleExpandDept(dept.department_id)}
                                                        style={{ cursor: 'pointer', background: isExpanded ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}
                                                    >
                                                        <Td style={{ textAlign: 'center' }}>
                                                            {isExpanded ? <ChevronDown size={18} color={colors.primary} /> : <ChevronRight size={18} color={colors.textMuted} />}
                                                        </Td>
                                                        <Td style={{ fontWeight: '700' }}>
                                                            <div style={{ color: colors.primary, fontSize: '0.95rem' }}>{dept.department_name}</div>
                                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {dept.department_id}</span>
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                            {dept.total_indents}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#16a34a' }}>
                                                            {dept.approved_indents}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: dept.pending_indents > 0 ? '#d97706' : '#64748b' }}>
                                                            {dept.pending_indents}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                            {dept.total_items_count}
                                                        </Td>
                                                        <Td style={{ textAlign: 'center', fontWeight: '700', color: '#4f46e5' }}>
                                                            {dept.total_requested_qty} units
                                                        </Td>
                                                    </Tr>

                                                    {/* Expanded Sub-Table for Department Indents */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={7} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: colors.primary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FileText size={16} /> Indents from {dept.department_name} ({dept.intents?.length} Requisitions)
                                                                </div>

                                                                <Table style={{ background: '#ffffff', borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                                                                    <thead>
                                                                        <Tr style={{ background: '#e2e8f0' }}>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Intent ID</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Date</Th>
                                                                            <Th style={{ fontSize: '0.8rem', textAlign: 'center' }}>Approval Status</Th>
                                                                            <Th style={{ fontSize: '0.8rem' }}>Requested Items Details</Th>
                                                                        </Tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {dept.intents.map((indent, iIdx) => (
                                                                            <Tr key={iIdx}>
                                                                                <Td style={{ fontWeight: '600', color: colors.primary, fontSize: '0.85rem' }}>
                                                                                    {indent.intent_id}
                                                                                </Td>
                                                                                <Td style={{ fontSize: '0.85rem' }}>{indent.date || '-'}</Td>
                                                                                <Td style={{ textAlign: 'center' }}>
                                                                                    <span style={{
                                                                                        background: indent.is_approved ? '#dcfce7' : '#fef3c7',
                                                                                        color: indent.is_approved ? '#15803d' : '#b45309',
                                                                                        padding: '4px 10px',
                                                                                        borderRadius: '12px',
                                                                                        fontSize: '0.75rem',
                                                                                        fontWeight: '700'
                                                                                    }}>
                                                                                        {indent.is_approved ? 'Approved' : 'Pending Approval'}
                                                                                    </span>
                                                                                </Td>
                                                                                <Td style={{ fontSize: '0.8rem' }}>
                                                                                    {Array.isArray(indent.items) && indent.items.length > 0 ? (
                                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                                            {indent.items.map((it, itIdx) => (
                                                                                                <span key={itIdx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                                                                    <strong>{it.itemName || it.name || it.item_name}</strong>: {it.quantity || it.intent_qty || 0} Qty
                                                                                                </span>
                                                                                            ))}
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

export default StoresDepartmentIndentReport;
