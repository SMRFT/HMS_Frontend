import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, ClipboardList, RotateCcw, 
    FileText, Download, Printer, Eye, CheckCircle2, Clock, 
    AlertCircle, X, CheckCheck, Ban, Layers
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { printStoresReport } from '../Stores/printStoresReport';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';
import DepartmentSelectionModal, { DepartmentFilterControl } from '../Stores/DepartmentSelectionModal';
import TablePagination, { usePagination } from '../Stores/TablePagination';
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
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors
} from '../GlobalStyles';

const StoresIntentReturnReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [activeTab, setActiveTab] = useState('indents'); // 'indents' | 'returns'
    const [indents, setIndents] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [selectedIndentForDetails, setSelectedIndentForDetails] = useState(null);
    const [selectedReturnForDetails, setSelectedReturnForDetails] = useState(null);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Department synchronization
    const activeGlobalDept = useStoresDepartment();
    useEffect(() => {
        if (activeGlobalDept && activeGlobalDept !== 'ALL') {
            setSelectedDepartment(activeGlobalDept);
        }
    }, [activeGlobalDept]);

    // Fetch department master
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`);
                if (res && res.success && Array.isArray(res.data)) {
                    setDepartments(res.data);
                }
            } catch (err) {
                console.error("Error fetching departments:", err);
            }
        };
        fetchDepts();
    }, [getBaseUrl]);

    // Load Indents
    const fetchIndents = async () => {
        setLoading(true);
        try {
            const filterPayload = {
                from_date: fromDate,
                to_date: toDate,
                ...(selectedDepartment && selectedDepartment !== 'ALL' ? { department: selectedDepartment } : {})
            };
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-intent/`, "POST", filterPayload);
            const intentData = Array.isArray(res?.data) 
                ? res.data 
                : (Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res) ? res : []));
            setIndents(intentData);
        } catch (err) {
            console.error("Error fetching indents:", err);
            setIndents([]);
        } finally {
            setLoading(false);
        }
    };

    // Load Returns
    const fetchReturns = async () => {
        setLoading(true);
        try {
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedDepartment && selectedDepartment !== 'ALL') query.push(`department=${selectedDepartment}`);
            const qStr = query.length > 0 ? `?${query.join('&')}` : '';

            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-indent-returns/${qStr}`);
            const returnData = Array.isArray(res?.data) 
                ? res.data 
                : (Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res) ? res : []));
            setReturns(returnData);
        } catch (err) {
            console.error("Error fetching returns:", err);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'indents') {
            fetchIndents();
        } else {
            fetchReturns();
        }
    }, [activeTab, selectedDepartment]);

    const handleApplyFilters = () => {
        if (activeTab === 'indents') fetchIndents();
        else fetchReturns();
    };

    const handleClearFilters = () => {
        setFromDate(oneMonthAgo);
        setToDate(today);
        setSearchTerm('');
        setFilterStatus('ALL');
        setSelectedDepartment('ALL');
        setSelectedStoreDepartment('');
        setTimeout(() => {
            if (activeTab === 'indents') fetchIndents();
            else fetchReturns();
        }, 50);
    };

    // Filter Indents
    const filteredIndents = useMemo(() => {
        return indents.filter(item => {
            const term = searchTerm.toLowerCase().trim();
            const id = (item.intent_id || '').toLowerCase();
            const dept = (item.department || item.department_name || '').toLowerCase();
            const ns = (item.nursing_station_name || item.nursing_station || '').toLowerCase();
            const matchesSearch = !term || id.includes(term) || dept.includes(term) || ns.includes(term);

            const isAppr = Boolean(item.is_approved);
            const isPart = (item.items || []).some(it => it.status === 'Partially Approved');
            const isRej = (item.items || []).every(it => it.status === 'Rejected') && (item.items || []).length > 0;

            let matchesStatus = true;
            if (filterStatus === 'APPROVED') matchesStatus = isAppr;
            else if (filterStatus === 'PENDING') matchesStatus = !isAppr && !isRej;
            else if (filterStatus === 'REJECTED') matchesStatus = isRej;

            return matchesSearch && matchesStatus;
        });
    }, [indents, searchTerm, filterStatus]);

    // Filter Returns
    const filteredReturns = useMemo(() => {
        return returns.filter(ret => {
            const term = searchTerm.toLowerCase().trim();
            const id = (ret.return_id || '').toLowerCase();
            const debit = (ret.debit_note_no || '').toLowerCase();
            const dept = (ret.department_name || ret.department || '').toLowerCase();
            const intentId = (ret.intent_id || '').toLowerCase();
            const matchesSearch = !term || id.includes(term) || debit.includes(term) || dept.includes(term) || intentId.includes(term);

            let matchesStatus = true;
            if (filterStatus === 'APPROVED') matchesStatus = ret.status === 'Approved';
            else if (filterStatus === 'PENDING') matchesStatus = ret.status === 'Pending' || !ret.status;

            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, filterStatus]);

    // Indents Summary Metrics
    const indentSummary = useMemo(() => {
        let totalItems = 0;
        let approved = 0;
        let pending = 0;

        filteredIndents.forEach(indent => {
            const items = indent.items || [];
            totalItems += items.length;
            if (indent.is_approved) approved += 1;
            else pending += 1;
        });

        return {
            total_indents: filteredIndents.length,
            approved_requests: approved,
            pending_review: pending,
            total_items_demanded: totalItems
        };
    }, [filteredIndents]);

    // Returns Summary Metrics
    const returnSummary = useMemo(() => {
        let totalVal = 0;
        let totalUnits = 0;
        let pendingReturns = 0;

        filteredReturns.forEach(ret => {
            totalVal += Number(ret.total_debit_amount || ret.total_amount || 0);
            (ret.items || []).forEach(it => {
                totalUnits += Number(it.returned_quantity || it.quantity || 0);
            });
            if (ret.status !== 'Approved') pendingReturns += 1;
        });

        return {
            total_return_records: filteredReturns.length,
            total_return_debit_value: totalVal,
            total_returned_units: totalUnits,
            pending_return_audit: pendingReturns
        };
    }, [filteredReturns]);

    // Pagination
    const currentList = activeTab === 'indents' ? filteredIndents : filteredReturns;
    const pagination = usePagination(currentList.length, 15);
    const paginatedItems = useMemo(() => {
        return currentList.slice(pagination.startIndex, pagination.endIndex);
    }, [currentList, pagination.startIndex, pagination.endIndex]);

    const handlePrint = () => {
        const tableId = activeTab === 'indents' ? 'stores-indents-report-table' : 'stores-returns-report-table';
        const title = activeTab === 'indents' ? 'Stores Department Indent Requisitions Report' : 'Stores Indent Return & Debit Notes Report';
        
        const summaryObj = activeTab === 'indents' ? {
            "TOTAL INTENTS": indentSummary.total_indents,
            "APPROVED REQUESTS": indentSummary.approved_requests,
            "PENDING REVIEW": indentSummary.pending_review,
            "TOTAL REQUESTED ITEMS": indentSummary.total_items_demanded
        } : {
            "Total Return Records": returnSummary.total_return_records,
            "Total Return Debit Value": `₹${returnSummary.total_return_debit_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            "Total Returned Units": returnSummary.total_returned_units,
            "Pending Return Audit": returnSummary.pending_return_audit
        };

        printStoresReport(tableId, {
            reportTitle: title,
            department: selectedDepartment !== 'ALL' ? selectedDepartment : 'ALL DEPARTMENTS',
            fromDate,
            toDate,
            summary: summaryObj
        });
    };

    const handleExportExcel = () => {
        if (activeTab === 'indents') {
            if (!filteredIndents.length) return;
            const excelData = filteredIndents.map((item, idx) => ({
                "Sl No": idx + 1,
                "Intent ID": item.intent_id || '-',
                "Date": item.date ? dayjs(item.date).format('DD/MM/YYYY') : '-',
                "Department": item.department_name || item.department || '-',
                "Nursing Station": item.nursing_station_name || item.nursing_station || '-',
                "Requested By": item.created_by || '-',
                "Total Items": (item.items || []).length,
                "Status": item.is_approved ? 'Approved' : 'Pending'
            }));
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Stores Indents Report");
            XLSX.writeFile(wb, `Stores_Indents_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        } else {
            if (!filteredReturns.length) return;
            const excelData = filteredReturns.map((ret, idx) => ({
                "Sl No": idx + 1,
                "Return ID": ret.return_id || '-',
                "Debit Note No": ret.debit_note_no || '-',
                "Intent Ref": ret.intent_id || '-',
                "Return Date": ret.created_date ? dayjs(ret.created_date).format('DD/MM/YYYY') : '-',
                "Department": ret.department_name || ret.department || '-',
                "Total Debit Value": Number(ret.total_debit_amount || ret.total_amount || 0),
                "Reason": ret.reason || '-',
                "Status": ret.status || 'Pending'
            }));
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Stores Returns Report");
            XLSX.writeFile(wb, `Stores_Indent_Returns_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        }
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ClipboardList size={24} color="#059669" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.textMain, margin: 0 }}>
                                Stores Intent & Return Report
                            </h1>
                            <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '2px 0 0' }}>
                                Departmental requisitions, issue approvals log, and inventory return reconciliations.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={handleExportExcel}
                            style={{ background: '#ffffff', color: '#059669', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            style={{ background: '#059669', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', borderBottom: `2px solid ${colors.border}`, marginBottom: '20px' }}>
                    <button
                        onClick={() => { setActiveTab('indents'); setFilterStatus('ALL'); }}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'indents' ? '3px solid #059669' : '3px solid transparent',
                            color: activeTab === 'indents' ? '#059669' : colors.textMuted,
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <ClipboardList size={18} /> Indent Requisitions ({indents.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('returns'); setFilterStatus('ALL'); }}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'returns' ? '3px solid #059669' : '3px solid transparent',
                            color: activeTab === 'returns' ? '#059669' : colors.textMuted,
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <RotateCcw size={18} /> Indent Returns ({returns.length})
                    </button>
                </div>

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>FROM DATE</label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ width: '150px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>TO DATE</label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ width: '150px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>DEPARTMENT</label>
                            <DepartmentFilterControl
                                departments={departments}
                                onDepartmentChange={(dept) => setSelectedDepartment(dept || 'ALL')}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>STATUS</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', background: '#ffffff', minWidth: '130px' }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="APPROVED">Approved</option>
                                <option value="PENDING">Pending Review</option>
                                {activeTab === 'indents' && <option value="REJECTED">Rejected</option>}
                            </select>
                        </div>

                        <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>SEARCH REQUISITIONS</label>
                            <Input
                                type="text"
                                placeholder={activeTab === 'indents' ? "Search Intent ID, Department, Item Name..." : "Search Return ID, Debit Note, Intent Ref..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '7px 12px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                onClick={handleApplyFilters}
                                style={{ background: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: '600' }}
                            >
                                <Search size={15} /> Filter
                            </Button>
                            <Button 
                                onClick={handleClearFilters}
                                style={{ background: '#e2e8f0', color: colors.textMain, padding: '8px 12px', borderRadius: '6px', border: 'none' }}
                                title="Reset Filters"
                            >
                                <RefreshCw size={15} />
                            </Button>
                        </div>
                    </div>
                </ControlsContainer>

                {/* Key Metrics Cards (relocated to end of printed report automatically by printStoresReport) */}
                {activeTab === 'indents' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL INTENTS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>
                                {indentSummary.total_indents}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>APPROVED REQUESTS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                                {indentSummary.approved_requests}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>PENDING REVIEW</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                                {indentSummary.pending_review}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL REQUESTED ITEMS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
                                {indentSummary.total_items_demanded}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>Total Return Records</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                                {returnSummary.total_return_records}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>Total Return Debit Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                                ₹{returnSummary.total_return_debit_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>Total Returned Units</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                                {returnSummary.total_returned_units}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>Pending Return Audit</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                                {returnSummary.pending_return_audit}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Content */}
                {activeTab === 'indents' ? (
                    <div id="stores-indents-report-table">
                        <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                            <Table>
                                <thead>
                                    <Tr style={{ background: '#f8fafc' }}>
                                        <Th style={{ width: '45px' }}>#</Th>
                                        <Th>INTENT NO</Th>
                                        <Th>DATE</Th>
                                        <Th>DEPARTMENT</Th>
                                        <Th>NURSING STATION</Th>
                                        <Th>ITEMS BREAKDOWN</Th>
                                        <Th>REQUESTED BY</Th>
                                        <Th style={{ textAlign: 'center' }}>STATUS</Th>
                                        <Th style={{ textAlign: 'center', width: '70px' }}>VIEW</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading indent records...</Td></Tr>
                                    ) : paginatedItems.length === 0 ? (
                                        <Tr><Td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>No department indents found for this period.</Td></Tr>
                                    ) : (
                                        paginatedItems.map((item, idx) => {
                                            const items = item.items || [];
                                            const firstItem = items[0]?.name || items[0]?.item_name || 'Item';
                                            const extraCount = items.length - 1;

                                            return (
                                                <Tr key={item._id || item.intent_id || idx}>
                                                    <Td style={{ width: '45px' }}>{pagination.startIndex + idx + 1}</Td>
                                                    <Td style={{ fontWeight: '700', color: colors.primary }}>
                                                        {item.intent_id || '-'}
                                                    </Td>
                                                    <Td>{item.date ? dayjs(item.date).format('DD/MM/YYYY') : '-'}</Td>
                                                    <Td style={{ fontWeight: '600', color: colors.textMain }}>
                                                        {item.department_name || item.department || '-'}
                                                    </Td>
                                                    <Td>
                                                        {(item.nursing_station_name || item.nursing_station) ? (
                                                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                                                                {item.nursing_station_name || item.nursing_station}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: colors.textMuted }}>-</span>
                                                        )}
                                                    </Td>
                                                    <Td style={{ fontSize: '0.85rem' }}>
                                                        {items.length > 0 ? (
                                                            <span>
                                                                <strong>{firstItem}</strong> {extraCount > 0 && <span style={{ color: colors.textMuted }}>+{extraCount} more</span>}
                                                            </span>
                                                        ) : '-'}
                                                    </Td>
                                                    <Td style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                                        {item.created_by || '-'}
                                                    </Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        {item.is_approved ? (
                                                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Approved
                                                            </span>
                                                        ) : (
                                                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        <Button
                                                            onClick={() => setSelectedIndentForDetails(item)}
                                                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                                            title="View Indent Items"
                                                        >
                                                            <Eye size={15} />
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    </div>
                ) : (
                    <div id="stores-returns-report-table">
                        <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                            <Table>
                                <thead>
                                    <Tr style={{ background: '#f8fafc' }}>
                                        <Th style={{ width: '45px' }}>#</Th>
                                        <Th>RETURN ID</Th>
                                        <Th>DEBIT NOTE NO</Th>
                                        <Th>INTENT REF</Th>
                                        <Th>RETURN DATE</Th>
                                        <Th>DEPARTMENT</Th>
                                        <Th style={{ textAlign: 'right' }}>DEBIT AMOUNT (₹)</Th>
                                        <Th>RETURN REASON</Th>
                                        <Th style={{ textAlign: 'center' }}>STATUS</Th>
                                        <Th style={{ textAlign: 'center', width: '70px' }}>VIEW</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading return records...</Td></Tr>
                                    ) : paginatedItems.length === 0 ? (
                                        <Tr><Td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>No store indent returns found for this period.</Td></Tr>
                                    ) : (
                                        paginatedItems.map((ret, idx) => (
                                            <Tr key={ret._id || ret.return_id || idx}>
                                                <Td style={{ width: '45px' }}>{pagination.startIndex + idx + 1}</Td>
                                                <Td style={{ fontWeight: '700', color: colors.primary }}>
                                                    {ret.return_id || '-'}
                                                </Td>
                                                <Td style={{ fontWeight: '600' }}>{ret.debit_note_no || '-'}</Td>
                                                <Td>{ret.intent_id || '-'}</Td>
                                                <Td>{ret.created_date ? dayjs(ret.created_date).format('DD/MM/YYYY') : '-'}</Td>
                                                <Td>{ret.department_name || ret.department || '-'}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                    ₹{Number(ret.total_debit_amount || ret.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ fontSize: '0.82rem', color: colors.textMuted }}>{ret.reason || '-'}</Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    {ret.status === 'Approved' ? (
                                                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            Pending
                                                        </span>
                                                    )}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <Button
                                                        onClick={() => setSelectedReturnForDetails(ret)}
                                                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                                        title="View Return Items"
                                                    >
                                                        <Eye size={15} />
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    </div>
                )}

                {/* Pagination */}
                <div style={{ marginTop: '16px' }}>
                    <TablePagination {...pagination} />
                </div>

                {/* Read-Only Indent Details Modal */}
                {selectedIndentForDetails && (
                    <ModalOverlay style={{ zIndex: 1100, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '850px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ClipboardList size={22} color="#059669" />
                                    <div>
                                        <ModalTitle style={{ fontSize: '1.15rem', color: colors.textMain }}>
                                            Indent Details: {selectedIndentForDetails.intent_id}
                                        </ModalTitle>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                            Department: {selectedIndentForDetails.department_name || selectedIndentForDetails.department} {selectedIndentForDetails.nursing_station_name ? `| Nursing Station: ${selectedIndentForDetails.nursing_station_name}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <CloseButton onClick={() => setSelectedIndentForDetails(null)}>
                                    <X size={20} />
                                </CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px', overflowY: 'auto' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: colors.textMain, marginBottom: '8px' }}>
                                    REQUESTED ITEMS ({(selectedIndentForDetails.items || []).length})
                                </div>
                                <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f1f5f9' }}>
                                                <Th style={{ width: '40px' }}>#</Th>
                                                <Th>ITEM NAME</Th>
                                                <Th>HSN</Th>
                                                <Th style={{ textAlign: 'right' }}>REQUESTED QTY</Th>
                                                <Th style={{ textAlign: 'right' }}>APPROVED QTY</Th>
                                                <Th style={{ textAlign: 'center' }}>ITEM STATUS</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {(!selectedIndentForDetails.items || selectedIndentForDetails.items.length === 0) ? (
                                                <Tr><Td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: colors.textMuted }}>No items found in this indent.</Td></Tr>
                                            ) : (
                                                selectedIndentForDetails.items.map((it, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td style={{ fontWeight: '600' }}>{it.name || it.item_name || '-'}</Td>
                                                        <Td>{it.hsn || '-'}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700' }}>{it.quantity || 0}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>{it.approved_quantity ?? 0}</Td>
                                                        <Td style={{ textAlign: 'center' }}>
                                                            <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', background: it.status === 'Approved' ? '#dcfce7' : (it.status === 'Rejected' ? '#fee2e2' : '#fef3c7'), color: it.status === 'Approved' ? '#15803d' : (it.status === 'Rejected' ? '#b91c1c' : '#b45309') }}>
                                                                {it.status || 'Pending'}
                                                            </span>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </TableWrapper>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Read-Only Return Details Modal */}
                {selectedReturnForDetails && (
                    <ModalOverlay style={{ zIndex: 1100, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '850px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <RotateCcw size={22} color="#059669" />
                                    <div>
                                        <ModalTitle style={{ fontSize: '1.15rem', color: colors.textMain }}>
                                            Indent Return Details: {selectedReturnForDetails.return_id}
                                        </ModalTitle>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                            Debit Note: {selectedReturnForDetails.debit_note_no || '-'} | Reason: {selectedReturnForDetails.reason || '-'}
                                        </div>
                                    </div>
                                </div>
                                <CloseButton onClick={() => setSelectedReturnForDetails(null)}>
                                    <X size={20} />
                                </CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px', overflowY: 'auto' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: colors.textMain, marginBottom: '8px' }}>
                                    RETURNED ITEMS ({(selectedReturnForDetails.items || []).length})
                                </div>
                                <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f1f5f9' }}>
                                                <Th style={{ width: '40px' }}>#</Th>
                                                <Th>ITEM NAME</Th>
                                                <Th>BATCH</Th>
                                                <Th style={{ textAlign: 'right' }}>RETURN QTY</Th>
                                                <Th style={{ textAlign: 'right' }}>UNIT RATE (₹)</Th>
                                                <Th style={{ textAlign: 'right' }}>DEBIT TOTAL (₹)</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {(!selectedReturnForDetails.items || selectedReturnForDetails.items.length === 0) ? (
                                                <Tr><Td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: colors.textMuted }}>No item records found.</Td></Tr>
                                            ) : (
                                                selectedReturnForDetails.items.map((it, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td style={{ fontWeight: '600' }}>{it.item_name || it.name || '-'}</Td>
                                                        <Td>{it.batch_no || '-'}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700' }}>{it.returned_quantity || it.quantity || 0}</Td>
                                                        <Td style={{ textAlign: 'right' }}>{Number(it.unit_rate || it.rate || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.primary }}>
                                                            ₹{Number(it.total_amount || (it.returned_quantity * it.unit_rate) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </TableWrapper>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresIntentReturnReport;

