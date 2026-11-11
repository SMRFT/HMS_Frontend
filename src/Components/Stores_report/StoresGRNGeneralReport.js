import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, FileText, Download, Printer, 
    Eye, Building2, CheckCircle2, Clock, AlertCircle, X, ShieldCheck
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

const StoresGRNGeneralReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [selectedGrnForDetails, setSelectedGrnForDetails] = useState(null);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Department helper synchronization
    const activeGlobalDept = useStoresDepartment();
    useEffect(() => {
        if (activeGlobalDept && activeGlobalDept !== 'ALL') {
            setSelectedDepartment(activeGlobalDept);
        }
    }, [activeGlobalDept]);

    // Fetch department list
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

    // Fetch GRNs
    const fetchGRNs = async () => {
        setLoading(true);
        try {
            let url = `${getBaseUrl.replace(/\/$/, '')}/stores-grn/`;
            let method = 'GET';
            let data = null;

            if (fromDate || toDate || (selectedDepartment && selectedDepartment !== 'ALL')) {
                method = 'POST';
                data = {
                    from_date: fromDate,
                    to_date: toDate,
                    ...(selectedDepartment && selectedDepartment !== 'ALL' ? { department: selectedDepartment } : {})
                };
            }

            const response = await apiRequest(url, method, data);
            if (response && response.success && Array.isArray(response.data)) {
                setGrns(response.data);
            } else if (Array.isArray(response)) {
                setGrns(response);
            } else {
                setGrns([]);
            }
        } catch (error) {
            console.error("Error fetching GRNs:", error);
            setGrns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGRNs();
    }, [selectedDepartment]);

    // Filter GRNs based on search and status
    const filteredGrns = useMemo(() => {
        return grns.filter((g) => {
            const term = searchTerm.toLowerCase().trim();
            const grnNo = (g.grn_number || '').toLowerCase();
            const vendor = (g.vendor_name || '').toLowerCase();
            const invNo = (g.invoice_no || '').toLowerCase();
            const dept = (g.department || '').toLowerCase();

            const matchesSearch = !term || grnNo.includes(term) || vendor.includes(term) || invNo.includes(term) || dept.includes(term);

            const isCancelled = Boolean(g.is_cancelled);
            const isApproved = Boolean(g.is_approved);

            let matchesStatus = true;
            if (filterStatus === 'VERIFIED') matchesStatus = isApproved && !isCancelled;
            else if (filterStatus === 'PENDING') matchesStatus = !isApproved && !isCancelled;
            else if (filterStatus === 'CANCELLED') matchesStatus = isCancelled;

            return matchesSearch && matchesStatus;
        });
    }, [grns, searchTerm, filterStatus]);

    // Calculate Summary Metrics
    const summary = useMemo(() => {
        let totalSpend = 0;
        let totalTax = 0;
        let approvedCount = 0;

        filteredGrns.forEach((g) => {
            if (!g.is_cancelled) {
                totalSpend += Number(g.net_amount || 0);
                totalTax += Number(g.tax_amount || 0);
                if (g.is_approved) approvedCount += 1;
            }
        });

        const count = filteredGrns.length;
        const avgValue = count > 0 ? (totalSpend / count) : 0;

        return {
            total_grns: count,
            total_spend: totalSpend,
            total_tax: totalTax,
            average_grn_value: avgValue,
            approved_count: approvedCount
        };
    }, [filteredGrns]);

    // Pagination
    const pagination = usePagination(filteredGrns.length, 15);
    const paginatedGrns = useMemo(() => {
        return filteredGrns.slice(pagination.startIndex, pagination.endIndex);
    }, [filteredGrns, pagination.startIndex, pagination.endIndex]);

    const handleClearFilters = () => {
        setFromDate(oneMonthAgo);
        setToDate(today);
        setSearchTerm('');
        setFilterStatus('ALL');
        setSelectedDepartment('ALL');
        setSelectedStoreDepartment('');
        setTimeout(fetchGRNs, 50);
    };

    const handlePrint = () => {
        printStoresReport("stores-grn-general-report-table", {
            reportTitle: "Stores Goods Received Note (GRN) Report",
            department: selectedDepartment !== 'ALL' ? selectedDepartment : 'ALL DEPARTMENTS',
            fromDate,
            toDate,
            summary: {
                "TOTAL PURCHASE SPEND": `₹${summary.total_spend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "TOTAL TAX PAID (GST)": `₹${summary.total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "TOTAL GRN INVOICES": summary.total_grns,
                "AVERAGE GRN VALUE": `₹${summary.average_grn_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "APPROVED GRNS": summary.approved_count
            }
        });
    };

    const handleExportExcel = () => {
        if (!filteredGrns.length) return;

        const excelData = filteredGrns.map((g, idx) => ({
            "Sl No": idx + 1,
            "GRN Number": g.grn_number || '-',
            "GRN Date": g.date ? dayjs(g.date).format('DD/MM/YYYY') : '-',
            "Vendor / Supplier": g.vendor_name || '-',
            "Department": g.department || '-',
            "Invoice No": g.invoice_no || '-',
            "Invoice Date": g.invoice_date ? dayjs(g.invoice_date).format('DD/MM/YYYY') : '-',
            "Payment Mode": g.payment_mode || '-',
            "Tax Amount": Number(g.tax_amount || 0),
            "Net Amount": Number(g.net_amount || 0),
            "Status": g.is_cancelled ? 'Cancelled' : (g.is_approved ? 'Verified' : 'Pending'),
            "Entered By": g.created_by || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stores GRN Report");
        XLSX.writeFile(wb, `Stores_GRN_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} color="#059669" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.textMain, margin: 0 }}>
                                Stores GRN General Report
                            </h1>
                            <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '2px 0 0' }}>
                                Comprehensive Goods Received Note ledger, invoice verification, and supplier purchase audit.
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
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>STORE DEPARTMENT</label>
                            <DepartmentFilterControl
                                departments={departments}
                                onDepartmentChange={(dept) => setSelectedDepartment(dept || 'ALL')}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>GRN STATUS</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', background: '#ffffff', minWidth: '140px' }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="VERIFIED">Verified / Approved</option>
                                <option value="PENDING">Pending Verification</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>SEARCH GRN / VENDOR / INVOICE</label>
                            <Input
                                type="text"
                                placeholder="Search GRN No, Vendor Name, Invoice No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '7px 12px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                onClick={fetchGRNs}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL PURCHASE SPEND</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.primary, marginTop: '2px' }}>
                            ₹{summary.total_spend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL TAX PAID (GST)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                            ₹{summary.total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL GRN INVOICES</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
                            {summary.total_grns}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>AVERAGE GRN VALUE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>
                            ₹{summary.average_grn_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>APPROVED GRNS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                            {summary.approved_count}
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div id="stores-grn-general-report-table">
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc' }}>
                                    <Th style={{ width: '45px' }}>#</Th>
                                    <Th>GRN NO</Th>
                                    <Th>DATE</Th>
                                    <Th>VENDOR / SUPPLIER</Th>
                                    <Th>DEPARTMENT</Th>
                                    <Th>INVOICE NO</Th>
                                    <Th>INVOICE DATE</Th>
                                    <Th>PAYMENT MODE</Th>
                                    <Th style={{ textAlign: 'right' }}>TAX AMOUNT (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>NET AMOUNT (₹)</Th>
                                    <Th style={{ textAlign: 'center' }}>STATUS</Th>
                                    <Th>ENTERED BY</Th>
                                    <Th style={{ textAlign: 'center', width: '70px' }}>VIEW</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <Tr><Td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading GRN records...</Td></Tr>
                                ) : paginatedGrns.length === 0 ? (
                                    <Tr><Td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>No Goods Received Notes found for this period.</Td></Tr>
                                ) : (
                                    paginatedGrns.map((g, idx) => {
                                        const isCancelled = Boolean(g.is_cancelled);
                                        const isApproved = Boolean(g.is_approved);

                                        return (
                                            <Tr key={g._id || g.grn_number || idx}>
                                                <Td style={{ width: '45px' }}>{pagination.startIndex + idx + 1}</Td>
                                                <Td style={{ fontWeight: '700', color: colors.primary }}>
                                                    {g.grn_number || '-'}
                                                </Td>
                                                <Td>{g.date ? dayjs(g.date).format('DD/MM/YYYY') : '-'}</Td>
                                                <Td style={{ fontWeight: '600', color: colors.textMain }}>
                                                    {g.vendor_name || '-'}
                                                </Td>
                                                <Td>{g.department || '-'}</Td>
                                                <Td>{g.invoice_no || '-'}</Td>
                                                <Td>{g.invoice_date ? dayjs(g.invoice_date).format('DD/MM/YYYY') : '-'}</Td>
                                                <Td>
                                                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: '600' }}>
                                                        {g.payment_mode || 'CREDIT'}
                                                    </span>
                                                </Td>
                                                <Td style={{ textAlign: 'right' }}>
                                                    {Number(g.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                                    ₹{Number(g.net_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    {isCancelled ? (
                                                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            Cancelled
                                                        </span>
                                                    ) : isApproved ? (
                                                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            Pending
                                                        </span>
                                                    )}
                                                </Td>
                                                <Td style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                                    {g.created_by || '-'}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <Button
                                                        onClick={() => setSelectedGrnForDetails(g)}
                                                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                                        title="View GRN Line Items"
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

                {/* Pagination */}
                <div style={{ marginTop: '16px' }}>
                    <TablePagination {...pagination} />
                </div>

                {/* Read-Only GRN Details Modal */}
                {selectedGrnForDetails && (
                    <ModalOverlay style={{ zIndex: 1100, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '950px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={22} color="#059669" />
                                    <div>
                                        <ModalTitle style={{ fontSize: '1.15rem', color: colors.textMain }}>
                                            GRN Details: {selectedGrnForDetails.grn_number}
                                        </ModalTitle>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                            Vendor: {selectedGrnForDetails.vendor_name} | Invoice No: {selectedGrnForDetails.invoice_no || '-'} ({selectedGrnForDetails.invoice_date ? dayjs(selectedGrnForDetails.invoice_date).format('DD/MM/YYYY') : '-'})
                                        </div>
                                    </div>
                                </div>
                                <CloseButton onClick={() => setSelectedGrnForDetails(null)}>
                                    <X size={20} />
                                </CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px', overflowY: 'auto' }}>
                                {/* Header Details Summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700' }}>DEPARTMENT</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>{selectedGrnForDetails.department || '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700' }}>DATE</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>{selectedGrnForDetails.date ? dayjs(selectedGrnForDetails.date).format('DD/MM/YYYY') : '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700' }}>PAYMENT MODE</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>{selectedGrnForDetails.payment_mode || 'CREDIT'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: '700' }}>STATUS</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: selectedGrnForDetails.is_cancelled ? '#b91c1c' : (selectedGrnForDetails.is_approved ? '#15803d' : '#b45309') }}>
                                            {selectedGrnForDetails.is_cancelled ? 'Cancelled' : (selectedGrnForDetails.is_approved ? 'Verified' : 'Pending')}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Breakdown Table */}
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: colors.textMain, marginBottom: '8px' }}>
                                    RECEIVED LINE ITEMS ({selectedGrnForDetails.items?.length || 0})
                                </div>
                                <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f1f5f9' }}>
                                                <Th style={{ width: '40px' }}>#</Th>
                                                <Th>ITEM NAME</Th>
                                                <Th>HSN</Th>
                                                <Th>BATCH</Th>
                                                <Th>EXPIRY</Th>
                                                <Th style={{ textAlign: 'right' }}>QTY</Th>
                                                <Th style={{ textAlign: 'right' }}>RATE (₹)</Th>
                                                <Th style={{ textAlign: 'right' }}>TAX %</Th>
                                                <Th style={{ textAlign: 'right' }}>TOTAL (₹)</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {(!selectedGrnForDetails.items || selectedGrnForDetails.items.length === 0) ? (
                                                <Tr><Td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: colors.textMuted }}>No items found in this GRN.</Td></Tr>
                                            ) : (
                                                selectedGrnForDetails.items.map((it, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td style={{ fontWeight: '600' }}>{it.item_name || it.name || '-'}</Td>
                                                        <Td>{it.hsn || '-'}</Td>
                                                        <Td>{it.batch_no || '-'}</Td>
                                                        <Td>{it.expiry_date ? dayjs(it.expiry_date).format('MM/YYYY') : '-'}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '600' }}>{it.quantity || it.qty || 0}</Td>
                                                        <Td style={{ textAlign: 'right' }}>{Number(it.rate || it.unit_rate || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: 'right' }}>{it.tax_percent || it.tax || 0}%</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: '700' }}>
                                                            {Number(it.net_total || it.total_amount || (it.quantity * it.rate) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </TableWrapper>

                                {/* Totals Summary */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <div style={{ width: '280px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span style={{ color: colors.textMuted }}>Tax Amount:</span>
                                            <span style={{ fontWeight: '600' }}>₹{Number(selectedGrnForDetails.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '800', borderTop: `1px solid ${colors.border}`, paddingTop: '6px', color: colors.primary }}>
                                            <span>Net Total Amount:</span>
                                            <span>₹{Number(selectedGrnForDetails.net_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresGRNGeneralReport;

