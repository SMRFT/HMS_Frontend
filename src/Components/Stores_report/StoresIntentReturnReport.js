import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, ClipboardList, RotateCcw, 
    FileText, Download, Printer, Eye, CheckCircle2, Clock, 
    AlertCircle, X, CheckCheck, Ban, Layers, User, ShieldCheck, Tag
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

const StoresIntentReturnReport = ({ department: propDepartment = '', isModalView = false, onClose }) => {
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
    const [selectedDepartment, setSelectedDepartment] = useState(propDepartment || 'ALL');
    const [departments, setDepartments] = useState([]);
    const [selectedIndentForDetails, setSelectedIndentForDetails] = useState(null);
    const [selectedReturnForDetails, setSelectedReturnForDetails] = useState(null);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Synchronize department when prop changes
    useEffect(() => {
        if (propDepartment) {
            setSelectedDepartment(propDepartment);
        }
    }, [propDepartment]);

    // Department synchronization with global helper if not strictly passed as prop
    const activeGlobalDept = useStoresDepartment();
    useEffect(() => {
        if (!propDepartment && activeGlobalDept && activeGlobalDept !== 'ALL') {
            setSelectedDepartment(activeGlobalDept);
        }
    }, [activeGlobalDept, propDepartment]);

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

    // Enrich Indent records with detailed quantities and approval statuses
    const enrichedIndents = useMemo(() => {
        return (indents || []).map(item => {
            const items = item.items || [];
            const totalReq = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
            const totalAppr = items.reduce((sum, it) => sum + Number(it.approved_quantity || 0), 0);
            const totalPend = Math.max(0, totalReq - totalAppr);
            
            const isAllRejected = items.length > 0 && items.every(it => it.status === 'Rejected');
            const isStoreApproved = Boolean(item.is_approved) || (totalReq > 0 && totalAppr >= totalReq);
            const isPartial = totalAppr > 0 && totalAppr < totalReq;

            let storeStatus = 'Pending Store';
            if (isAllRejected) storeStatus = 'Rejected';
            else if (isStoreApproved) storeStatus = 'Approved';
            else if (isPartial) storeStatus = 'Partially Approved';

            const hodStatus = item.hod_status || (item.is_hod_approved ? 'Approved' : 'Pending');

            return {
                ...item,
                totalRequestedQty: totalReq,
                totalApprovedQty: totalAppr,
                totalPendingQty: totalPend,
                storeStatus,
                hodStatus,
                requesterName: item.created_by_name || item.created_by || 'Department User',
                ipNumber: item.ipnumber || ''
            };
        });
    }, [indents]);

    // Filter Indents
    const filteredIndents = useMemo(() => {
        return enrichedIndents.filter(item => {
            const term = searchTerm.toLowerCase().trim();
            const id = (item.intent_id || '').toLowerCase();
            const dept = (item.department_name || item.department || '').toLowerCase();
            const ns = (item.nursing_station_name || item.nursing_station || '').toLowerCase();
            const ip = (item.ipNumber || '').toLowerCase();
            const reqBy = (item.requesterName || '').toLowerCase();
            const itemNames = (item.items || []).map(it => (it.name || it.item_name || '').toLowerCase()).join(' ');

            const matchesSearch = !term || 
                id.includes(term) || 
                dept.includes(term) || 
                ns.includes(term) || 
                ip.includes(term) || 
                reqBy.includes(term) || 
                itemNames.includes(term);

            let matchesStatus = true;
            if (filterStatus === 'STORE_APPROVED') {
                matchesStatus = item.storeStatus === 'Approved';
            } else if (filterStatus === 'STORE_PENDING') {
                matchesStatus = item.storeStatus === 'Pending Store';
            } else if (filterStatus === 'HOD_APPROVED') {
                matchesStatus = item.hodStatus === 'Approved';
            } else if (filterStatus === 'HOD_PENDING') {
                matchesStatus = item.hodStatus === 'Pending';
            } else if (filterStatus === 'PARTIAL') {
                matchesStatus = item.storeStatus === 'Partially Approved';
            } else if (filterStatus === 'REJECTED') {
                matchesStatus = item.storeStatus === 'Rejected' || item.hodStatus === 'Rejected';
            }

            return matchesSearch && matchesStatus;
        });
    }, [enrichedIndents, searchTerm, filterStatus]);

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
            if (filterStatus === 'STORE_APPROVED' || filterStatus === 'APPROVED') {
                matchesStatus = ret.status === 'Approved';
            } else if (filterStatus === 'STORE_PENDING' || filterStatus === 'PENDING') {
                matchesStatus = ret.status === 'Pending' || !ret.status;
            }

            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, filterStatus]);

    // Indents Summary Metrics
    const indentSummary = useMemo(() => {
        let totalReq = 0;
        let totalAppr = 0;
        let totalPend = 0;
        let storeApprovedCount = 0;
        let hodApprovedCount = 0;
        let pendingApprovalCount = 0;

        filteredIndents.forEach(indent => {
            totalReq += indent.totalRequestedQty || 0;
            totalAppr += indent.totalApprovedQty || 0;
            totalPend += indent.totalPendingQty || 0;
            if (indent.storeStatus === 'Approved') storeApprovedCount += 1;
            if (indent.hodStatus === 'Approved') hodApprovedCount += 1;
            if (indent.storeStatus !== 'Approved' && indent.storeStatus !== 'Rejected') pendingApprovalCount += 1;
        });

        return {
            total_indents: filteredIndents.length,
            total_requested_qty: totalReq,
            total_approved_qty: totalAppr,
            total_pending_qty: totalPend,
            store_approved: storeApprovedCount,
            hod_approved: hodApprovedCount,
            pending_approval: pendingApprovalCount
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
    const pagination = usePagination(currentList, 15);
    const paginatedItems = useMemo(() => {
        return (currentList || []).slice(pagination.startIndex, pagination.endIndex);
    }, [currentList, pagination.startIndex, pagination.endIndex]);

    const handlePrint = () => {
        const tableId = activeTab === 'indents' ? 'stores-indents-report-table' : 'stores-returns-report-table';
        const title = activeTab === 'indents' ? 'Stores Intent Approval Report' : 'Stores Indent Return & Debit Notes Report';
        
        const summaryObj = activeTab === 'indents' ? {
            "TOTAL REQUISITIONS": indentSummary.total_indents,
            "TOTAL REQUESTED QTY": indentSummary.total_requested_qty,
            "TOTAL APPROVED QTY": indentSummary.total_approved_qty,
            "TOTAL PENDING QTY": indentSummary.total_pending_qty,
            "HOD APPROVED": indentSummary.hod_approved,
            "STORE APPROVED": indentSummary.store_approved
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
                "IP Number": item.ipNumber || '-',
                "Requested Items Count": (item.items || []).length,
                "Total Requested Qty": item.totalRequestedQty || 0,
                "Total Approved Qty": item.totalApprovedQty || 0,
                "Total Pending Qty": item.totalPendingQty || 0,
                "Requested By": item.requesterName || '-',
                "HOD Approval Status": item.hodStatus || 'Pending',
                "HOD Approved By": item.hod_approved_by_name || '-',
                "Store Approval Status": item.storeStatus || 'Pending'
            }));
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Stores Intent Approval Report");
            XLSX.writeFile(wb, `Stores_Intent_Approval_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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

    const content = (
        <div style={{ width: '100%', padding: isModalView ? '16px 20px' : '24px' }}>
            <Container style={{ maxWidth: '1440px', margin: '0 auto', padding: 0 }}>
                {/* Header Section (compact in modal) */}
                {!isModalView && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ClipboardList size={24} color="#059669" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.textMain, margin: 0 }}>
                                    Stores Intent Approval Report
                                </h1>
                                <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '2px 0 0' }}>
                                    Departmental requisitions, HOD & Store approval tracking, requested vs approved quantities, and item returns log.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Button 
                                onClick={handleExportExcel}
                                style={{ background: '#ffffff', color: '#059669', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                <Download size={16} /> Export Excel
                            </Button>
                            <Button 
                                onClick={handlePrint}
                                style={{ background: '#059669', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                <Printer size={16} /> Print Report
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${colors.border}`, marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => { setActiveTab('indents'); setFilterStatus('ALL'); }}
                            style={{
                                padding: '10px 18px',
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
                            <ClipboardList size={18} /> Intent Requisitions ({indents.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('returns'); setFilterStatus('ALL'); }}
                            style={{
                                padding: '10px 18px',
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

                    {isModalView && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '4px' }}>
                            <Button 
                                onClick={handleExportExcel}
                                style={{ background: '#ffffff', color: '#059669', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                                <Download size={14} /> Export Excel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '18px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>FROM DATE</label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ width: '140px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>TO DATE</label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ width: '140px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>DEPARTMENT</label>
                            <DepartmentFilterControl
                                departments={departments}
                                onDepartmentChange={(dept) => setSelectedDepartment(dept || 'ALL')}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>STATUS</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', background: '#ffffff', minWidth: '150px' }}
                            >
                                <option value="ALL">All Requisitions</option>
                                <option value="STORE_APPROVED">Store Approved</option>
                                <option value="STORE_PENDING">Pending Store Approval</option>
                                <option value="HOD_APPROVED">HOD Approved</option>
                                <option value="HOD_PENDING">Pending HOD Approval</option>
                                <option value="PARTIAL">Partially Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>SEARCH REQUISITIONS</label>
                            <Input
                                type="text"
                                placeholder={activeTab === 'indents' ? "Search Intent ID, IP No, Department, Item..." : "Search Return ID, Debit Note, Intent Ref..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '7px 12px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                onClick={handleApplyFilters}
                                style={{ background: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                            >
                                <Search size={15} /> Filter
                            </Button>
                            <Button 
                                onClick={handleClearFilters}
                                style={{ background: '#e2e8f0', color: colors.textMain, padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                title="Reset Filters"
                            >
                                <RefreshCw size={15} />
                            </Button>
                        </div>
                    </div>
                </ControlsContainer>

                {/* Key Metrics KPI Cards */}
                {activeTab === 'indents' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #059669' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL REQUISITIONS</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>
                                {indentSummary.total_indents}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL REQUESTED QTY</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                                {indentSummary.total_requested_qty}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #10b981' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL APPROVED QTY</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                                {indentSummary.total_approved_qty}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #f59e0b' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL PENDING QTY</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>
                                {indentSummary.total_pending_qty}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #8b5cf6' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>HOD APPROVED</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
                                {indentSummary.hod_approved}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #047857' }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>STORE APPROVED</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#047857', marginTop: '2px' }}>
                                {indentSummary.store_approved}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL RETURN RECORDS</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>
                                {returnSummary.total_return_records}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL RETURN DEBIT VALUE</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                                ₹{returnSummary.total_return_debit_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>TOTAL RETURNED UNITS</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                                {returnSummary.total_returned_units}
                            </div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '0.72rem', fontWeight: '700' }}>PENDING RETURN AUDIT</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>
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
                                        <Th style={{ width: '40px' }}>#</Th>
                                        <Th>INTENT ID</Th>
                                        <Th>DATE</Th>
                                        <Th>DEPARTMENT</Th>
                                        <Th>IP NUMBER</Th>
                                        <Th>REQUESTED ITEMS</Th>
                                        <Th style={{ textAlign: 'right' }}>REQ QTY</Th>
                                        <Th style={{ textAlign: 'right' }}>APPR QTY</Th>
                                        <Th style={{ textAlign: 'right' }}>PENDING</Th>
                                        <Th>REQUESTED BY</Th>
                                        <Th style={{ textAlign: 'center' }}>HOD APPROVAL</Th>
                                        <Th style={{ textAlign: 'center' }}>STORE STATUS</Th>
                                        <Th style={{ textAlign: 'center', width: '60px' }}>VIEW</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading indent approval records...</Td></Tr>
                                    ) : paginatedItems.length === 0 ? (
                                        <Tr><Td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>No stores intent requisitions found for this period.</Td></Tr>
                                    ) : (
                                        paginatedItems.map((item, idx) => {
                                            const items = item.items || [];
                                            const firstItem = items[0]?.name || items[0]?.item_name || 'Item';
                                            const extraCount = items.length - 1;

                                            return (
                                                <Tr key={item._id || item.intent_id || idx}>
                                                    <Td style={{ width: '40px' }}>{pagination.startIndex + idx + 1}</Td>
                                                    <Td style={{ fontWeight: '700', color: colors.primary }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>{item.intent_id || '-'}</span>
                                                            {item.is_cathlab && (
                                                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: '700' }}>
                                                                    CathLab
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Td>
                                                    <Td>{item.date ? dayjs(item.date).format('DD/MM/YYYY') : '-'}</Td>
                                                    <Td>
                                                        <div style={{ fontWeight: '600', color: colors.textMain }}>
                                                            {item.department_name || item.department || '-'}
                                                        </div>
                                                        {(item.nursing_station_name || item.nursing_station) && (
                                                            <div style={{ marginTop: '2px' }}>
                                                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>
                                                                    {item.nursing_station_name || item.nursing_station}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {item.ipNumber ? (
                                                            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <User size={12} color="#059669" /> {item.ipNumber}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: colors.textMuted }}>-</span>
                                                        )}
                                                    </Td>
                                                    <Td style={{ fontSize: '0.84rem' }}>
                                                        {items.length > 0 ? (
                                                            <span>
                                                                <strong>{firstItem}</strong> {extraCount > 0 && <span style={{ color: colors.textMuted, fontSize: '0.76rem' }}>+{extraCount} more</span>}
                                                            </span>
                                                        ) : '-'}
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                        {item.totalRequestedQty ?? 0}
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                                                        {item.totalApprovedQty ?? 0}
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: '700', color: (item.totalPendingQty > 0 ? '#b45309' : '#64748b') }}>
                                                        {item.totalPendingQty ?? 0}
                                                    </Td>
                                                    <Td style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                                        {item.requesterName || '-'}
                                                    </Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        {item.hodStatus === 'Approved' ? (
                                                            <div>
                                                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                                                                    Approved
                                                                </span>
                                                                {item.hod_approved_by_name && (
                                                                    <div style={{ fontSize: '0.68rem', color: '#15803d', marginTop: '2px' }}>
                                                                        {item.hod_approved_by_name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : item.hodStatus === 'Rejected' ? (
                                                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                                                                Rejected
                                                            </span>
                                                        ) : (
                                                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                                                                Pending HOD
                                                            </span>
                                                        )}
                                                    </Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        {item.storeStatus === 'Approved' ? (
                                                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Approved
                                                            </span>
                                                        ) : item.storeStatus === 'Partially Approved' ? (
                                                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Partial
                                                            </span>
                                                        ) : item.storeStatus === 'Rejected' ? (
                                                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Rejected
                                                            </span>
                                                        ) : (
                                                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                                Store Pending
                                                            </span>
                                                        )}
                                                    </Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        <Button
                                                            onClick={() => setSelectedIndentForDetails(item)}
                                                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                                            title="View Indent Approval Details"
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
                    <ModalOverlay style={{ zIndex: 1200, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '900px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ClipboardList size={22} color="#059669" />
                                    <div>
                                        <ModalTitle style={{ fontSize: '1.15rem', color: colors.textMain }}>
                                            Intent Approval Details: {selectedIndentForDetails.intent_id}
                                        </ModalTitle>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '2px' }}>
                                            Department: <strong>{selectedIndentForDetails.department_name || selectedIndentForDetails.department}</strong> 
                                            {selectedIndentForDetails.nursing_station_name ? ` | Nursing: ${selectedIndentForDetails.nursing_station_name}` : ''}
                                            {selectedIndentForDetails.ipNumber ? ` | IP No: ${selectedIndentForDetails.ipNumber}` : ''}
                                            {selectedIndentForDetails.date ? ` | Date: ${dayjs(selectedIndentForDetails.date).format('DD/MM/YYYY')}` : ''}
                                            {selectedIndentForDetails.requesterName ? ` | Requested By: ${selectedIndentForDetails.requesterName}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <CloseButton onClick={() => setSelectedIndentForDetails(null)}>
                                    <X size={20} />
                                </CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px', overflowY: 'auto' }}>
                                {/* Status Summaries */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 200px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>DEPARTMENT HOD STATUS</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: selectedIndentForDetails.hodStatus === 'Approved' ? '#dcfce7' : (selectedIndentForDetails.hodStatus === 'Rejected' ? '#fee2e2' : '#fef3c7'), color: selectedIndentForDetails.hodStatus === 'Approved' ? '#15803d' : (selectedIndentForDetails.hodStatus === 'Rejected' ? '#b91c1c' : '#b45309') }}>
                                                {selectedIndentForDetails.hodStatus || 'Pending'}
                                            </span>
                                            {selectedIndentForDetails.hod_approved_by_name && (
                                                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>by {selectedIndentForDetails.hod_approved_by_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ flex: '1 1 200px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: colors.textMuted }}>STORE APPROVAL STATUS</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: selectedIndentForDetails.storeStatus === 'Approved' ? '#dcfce7' : (selectedIndentForDetails.storeStatus === 'Rejected' ? '#fee2e2' : '#fef3c7'), color: selectedIndentForDetails.storeStatus === 'Approved' ? '#15803d' : (selectedIndentForDetails.storeStatus === 'Rejected' ? '#b91c1c' : '#b45309') }}>
                                                {selectedIndentForDetails.storeStatus || 'Pending Store'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: colors.textMain, marginBottom: '8px' }}>
                                    REQUESTED ITEMS ({(selectedIndentForDetails.items || []).length})
                                </div>
                                <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f1f5f9' }}>
                                                <Th style={{ width: '40px' }}>#</Th>
                                                <Th>ITEM DESCRIPTION</Th>
                                                <Th>HSN</Th>
                                                <Th>BATCH</Th>
                                                <Th style={{ textAlign: 'right' }}>MRP (₹)</Th>
                                                <Th style={{ textAlign: 'right' }}>REQ QTY</Th>
                                                <Th style={{ textAlign: 'right' }}>APPR QTY</Th>
                                                <Th style={{ textAlign: 'right' }}>PENDING</Th>
                                                <Th style={{ textAlign: 'center' }}>STATUS</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {(!selectedIndentForDetails.items || selectedIndentForDetails.items.length === 0) ? (
                                                <Tr><Td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: colors.textMuted }}>No items found in this intent requisition.</Td></Tr>
                                            ) : (
                                                selectedIndentForDetails.items.map((it, idx) => {
                                                    const reqQ = Number(it.quantity || 0);
                                                    const appQ = Number(it.approved_quantity || 0);
                                                    const pendQ = Math.max(0, reqQ - appQ);

                                                    return (
                                                        <Tr key={idx}>
                                                            <Td>{idx + 1}</Td>
                                                            <Td style={{ fontWeight: '600' }}>{it.name || it.item_name || '-'}</Td>
                                                            <Td>{it.hsn || '-'}</Td>
                                                            <Td>{it.batch || '-'}</Td>
                                                            <Td style={{ textAlign: 'right' }}>{it.mrp ? Number(it.mrp).toFixed(2) : '-'}</Td>
                                                            <Td style={{ textAlign: 'right', fontWeight: '700' }}>{reqQ}</Td>
                                                            <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>{appQ}</Td>
                                                            <Td style={{ textAlign: 'right', fontWeight: '700', color: pendQ > 0 ? '#b45309' : '#64748b' }}>{pendQ}</Td>
                                                            <Td style={{ textAlign: 'center' }}>
                                                                <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', background: it.status === 'Approved' ? '#dcfce7' : (it.status === 'Rejected' ? '#fee2e2' : '#fef3c7'), color: it.status === 'Approved' ? '#15803d' : (it.status === 'Rejected' ? '#b91c1c' : '#b45309') }}>
                                                                    {it.status || 'Pending'}
                                                                </span>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })
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
                    <ModalOverlay style={{ zIndex: 1200, padding: '20px' }}>
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
        </div>
    );

    if (isModalView) {
        return content;
    }

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            {content}
        </PageWrapper>
    );
};

export default StoresIntentReturnReport;
