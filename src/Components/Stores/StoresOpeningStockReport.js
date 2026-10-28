import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Download, Search, RefreshCw, 
    Package, FileText, 
    AlertCircle, Printer,
    TrendingUp, ShieldCheck, ArrowLeft
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import TablePagination, { usePagination } from './TablePagination';
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

const StoresOpeningStockReport = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    // Masters for filter dropdowns
    const [allDepartments, setAllDepartments] = useState([]);
    const [allGroups, setAllGroups] = useState([]);

    // Data states
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState({
        total_logs: 0,
        unique_items: 0,
        total_opening_stock: 0
    });

    useEffect(() => {
        fetchMasters();
        fetchReport();
    }, []);

    const fetchMasters = async () => {
        try {
            const [deptRes, groupRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`)
            ]);
            if (deptRes?.success) setAllDepartments(deptRes.data || []);
            if (groupRes?.success) setAllGroups(groupRes.data || []);
        } catch (err) {
            console.error("Error loading masters for opening stock report:", err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const query = [];
            if (fromDate) query.push(`from_date=${encodeURIComponent(fromDate)}`);
            if (toDate) query.push(`to_date=${encodeURIComponent(toDate)}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
            if (departmentFilter) query.push(`department=${encodeURIComponent(departmentFilter)}`);
            if (groupFilter) query.push(`group=${encodeURIComponent(groupFilter)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-opening-stock-report/${queryString}`);
            if (res && res.success) {
                const results = res.data?.results || res.data?.data || (Array.isArray(res.data) ? res.data : []);
                const summ = res.data?.summary || { total_logs: results.length, unique_items: 0, total_opening_stock: 0 };
                setLogs(results);
                setSummary(summ);
            } else {
                setLogs([]);
                setSummary({ total_logs: 0, unique_items: 0, total_opening_stock: 0 });
            }
        } catch (err) {
            console.error("Error fetching opening stock audit report:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setSearchTerm('');
        setDepartmentFilter('');
        setGroupFilter('');
        setTimeout(() => {
            fetchReportWithParams('', '', '', '', '');
        }, 0);
    };

    const fetchReportWithParams = async (fDate, tDate, sTerm, dept, grp) => {
        try {
            setLoading(true);
            const query = [];
            if (fDate) query.push(`from_date=${encodeURIComponent(fDate)}`);
            if (tDate) query.push(`to_date=${encodeURIComponent(tDate)}`);
            if (sTerm) query.push(`search=${encodeURIComponent(sTerm)}`);
            if (dept) query.push(`department=${encodeURIComponent(dept)}`);
            if (grp) query.push(`group=${encodeURIComponent(grp)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-opening-stock-report/${queryString}`);
            if (res && res.success) {
                const results = res.data?.results || res.data?.data || (Array.isArray(res.data) ? res.data : []);
                const summ = res.data?.summary || { total_logs: results.length, unique_items: 0, total_opening_stock: 0 };
                setLogs(results);
                setSummary(summ);
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Error fetching opening stock audit report:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side pagination
    const {
        currentPage,
        pageSize,
        totalPages,
        pageData,
        goTo,
        handlePageSizeChange,
        startIdx,
        totalItems
    } = usePagination(logs, 20);

    const exportToExcel = () => {
        if (!logs || logs.length === 0) {
            alert("No opening stock logs to export.");
            return;
        }

        const excelData = logs.map((log, idx) => ({
            'S.No': idx + 1,
            'Log ID': log.log_id || '',
            'Date & Time': log.created_date ? dayjs(log.created_date).format('YYYY-MM-DD HH:mm') : '',
            'Item ID': log.item_id || '',
            'Item Name': log.item_name || '',
            'Department': log.department_name || log.department || '-',
            'Group': log.group_name || log.group || '-',
            'Category': log.category_name || log.category || '-',
            'Action Type': log.action_type || 'INITIAL',
            'Previous Opening Stock': Number(log.previous_opening_stock || 0).toFixed(2),
            'New Opening Stock': Number(log.opening_stock || 0).toFixed(2),
            'Stock Change': (Number(log.opening_stock || 0) - Number(log.previous_opening_stock || 0)).toFixed(2),
            'Remark / Audit Reason': log.remark || '-',
            'Logged By': log.created_by_name || log.created_by || 'System',
            'Branch Code': log.branch_code || '-',
            'Outlet Code': log.outlet_code || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OpeningStockAudit");
        XLSX.writeFile(wb, `Stores_Opening_Stock_Audit_Report_${today}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0284c7', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={28} color="#0284c7" /> Stores Item Opening Stock Audit Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Permanent audit trail of Item Master opening stock values, updates, audit remarks, and timestamped user history.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={() => navigate('/Items')}
                            style={{ 
                                background: '#ffffff', 
                                color: '#475569', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '9px 14px', 
                                borderRadius: '8px', 
                                border: '1px solid #cbd5e1', 
                                fontWeight: '600' 
                            }}
                        >
                            <ArrowLeft size={16} /> Back to Item Master
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            style={{ 
                                background: '#f1f5f9', 
                                color: '#334155', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '9px 14px', 
                                borderRadius: '8px', 
                                border: '1px solid #cbd5e1', 
                                fontWeight: '600' 
                            }}
                        >
                            <Printer size={16} /> Print
                        </Button>
                        <Button 
                            onClick={exportToExcel}
                            style={{ 
                                background: '#10b981', 
                                color: '#fff', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '9px 14px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontWeight: '600',
                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                            }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Audit Records
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                                {summary.total_logs || 0}
                            </div>
                        </div>
                        <FileText size={32} color="#0284c7" opacity={0.35} />
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Distinct Items Tracked
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                                {summary.unique_items || 0}
                            </div>
                        </div>
                        <Package size={32} color="#7c3aed" opacity={0.35} />
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div>
                            <div style={{ color: colors.textMuted, fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Opening Stock Logged
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                                {Number(summary.total_opening_stock || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <TrendingUp size={32} color="#059669" opacity={0.35} />
                    </div>
                </div>

                {/* Filters Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>From Date</label>
                        <Input 
                            type="date" 
                            value={fromDate} 
                            onChange={e => setFromDate(e.target.value)} 
                            style={{ width: '100%', height: '38px' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>To Date</label>
                        <Input 
                            type="date" 
                            value={toDate} 
                            onChange={e => setToDate(e.target.value)} 
                            style={{ width: '100%', height: '38px' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Department</label>
                        <Select 
                            value={departmentFilter} 
                            onChange={e => setDepartmentFilter(e.target.value)} 
                            style={{ width: '100%', height: '38px' }}
                        >
                            <option value="">All Departments</option>
                            {allDepartments.map(d => (
                                <option key={d.department_id || d.id} value={d.department_id || d.department_name}>
                                    {d.department_name || d.department_id}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Group</label>
                        <Select 
                            value={groupFilter} 
                            onChange={e => setGroupFilter(e.target.value)} 
                            style={{ width: '100%', height: '38px' }}
                        >
                            <option value="">All Groups</option>
                            {allGroups.map(g => (
                                <option key={g.group_id} value={g.group_id}>
                                    {g.group_name || g.groupName || g.group_id}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '2 1 240px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Item, Log ID or Remark</label>
                        <Input 
                            type="text" 
                            placeholder="Search by Item name, code, remark..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%', height: '38px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            onClick={fetchReport} 
                            style={{ background: '#0284c7', color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '600', height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={16} /> Filter
                        </Button>
                        <Button 
                            onClick={handleResetFilters} 
                            style={{ background: '#f1f5f9', color: '#475569', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '38px', display: 'flex', alignItems: 'center' }}
                            title="Reset Filters"
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Audit Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: `3px solid #0284c7`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '12px', fontWeight: '600', fontSize: '0.95rem' }}>Loading Opening Stock Audit Trail...</p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc' }}>
                                    <Th style={{ width: '50px', textAlign: 'center' }}>#</Th>
                                    <Th style={{ minWidth: '130px' }}>Log ID & Date</Th>
                                    <Th style={{ minWidth: '220px' }}>Item ID & Name</Th>
                                    <Th style={{ minWidth: '160px' }}>Department & Group</Th>
                                    <Th style={{ textAlign: 'center', width: '100px' }}>Action</Th>
                                    <Th style={{ textAlign: 'right', minWidth: '120px' }}>Prev Stock</Th>
                                    <Th style={{ textAlign: 'right', minWidth: '130px' }}>Opening Stock</Th>
                                    <Th style={{ textAlign: 'right', minWidth: '110px' }}>Net Diff</Th>
                                    <Th style={{ minWidth: '200px' }}>Remark / Audit Reason</Th>
                                    <Th style={{ minWidth: '140px' }}>Logged By</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {pageData.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <AlertCircle size={32} color="#94a3b8" />
                                                <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>No opening stock audit logs found for the selected criteria.</span>
                                                <span style={{ fontSize: '0.82rem' }}>Entries are created whenever items with opening stock are saved or adjusted in Item Master.</span>
                                            </div>
                                        </Td>
                                    </Tr>
                                ) : (
                                    pageData.map((log, idx) => {
                                        const prevQty = Number(log.previous_opening_stock || 0);
                                        const currentQty = Number(log.opening_stock || 0);
                                        const diff = currentQty - prevQty;
                                        const isInitial = log.action_type === 'INITIAL' || prevQty === 0;

                                        return (
                                            <Tr key={log.log_id || idx} style={{ transition: 'background-color 0.15s ease' }}>
                                                <Td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600' }}>
                                                    {startIdx + idx + 1}
                                                </Td>
                                                <Td>
                                                    <div style={{ fontWeight: '700', color: '#0284c7', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                                        {log.log_id}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                                        {log.created_date ? dayjs(log.created_date).format('DD MMM YYYY, hh:mm A') : '-'}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.92rem' }}>
                                                        {log.item_name || '-'}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                                        ID: {log.item_id}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>
                                                        {log.department_name || log.department || '-'}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                                        {log.group_name || log.group || '-'} {log.category_name ? `• ${log.category_name}` : ''}
                                                    </div>
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.3px',
                                                        background: isInitial ? '#ecfdf5' : '#eff6ff',
                                                        color: isInitial ? '#059669' : '#2563eb',
                                                        border: `1px solid ${isInitial ? '#a7f3d0' : '#bfdbfe'}`
                                                    }}>
                                                        {isInitial ? 'Initial' : 'Updated'}
                                                    </span>
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.88rem', color: '#64748b' }}>
                                                    {prevQty.toFixed(2)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                                                    {currentQty.toFixed(2)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', fontSize: '0.88rem', color: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#64748b' }}>
                                                    {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                                                </Td>
                                                <Td>
                                                    <div style={{ fontSize: '0.84rem', color: log.remark ? '#334155' : '#94a3b8', fontStyle: log.remark ? 'normal' : 'italic' }}>
                                                        {log.remark || 'No remark entered'}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.82rem' }}>
                                                        {log.created_by_name || log.created_by || 'System'}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                        {log.created_by ? `ID: ${log.created_by}` : ''}
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination Bar */}
                        {totalItems > 0 && (
                            <TablePagination
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                startIdx={startIdx}
                                goTo={goTo}
                                onPageSizeChange={handlePageSizeChange}
                                itemName="audit log"
                                themeColor="#0284c7"
                            />
                        )}
                    </TableWrapper>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresOpeningStockReport;
