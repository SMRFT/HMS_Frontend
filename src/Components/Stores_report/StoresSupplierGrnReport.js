import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Search, Calendar, RefreshCw, FileText, ChevronDown, ChevronRight, 
    Building2, Download, Printer
} from 'lucide-react';
import { printStoresReport } from '../Stores/printStoresReport';
import SearchSelect from '../Common/SearchSelect';
import { getSelectedStoreDepartment, getSelectedStoreDepartmentName, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';
import { DepartmentFilterControl } from '../Stores/DepartmentSelectionModal';
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

const StoresSupplierGrnReport = ({ department: propDepartment = '', departmentName: propDepartmentName = '', isModalView = false, onClose }) => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [reportData, setReportData] = useState([]);
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
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [vendors, setVendors] = useState([]);
    const [expandedSupplier, setExpandedSupplier] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(propDepartment || getSelectedStoreDepartment());
    const [selectedDepartmentName, setSelectedDepartmentName] = useState(propDepartmentName || getSelectedStoreDepartmentName());

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useEffect(() => {
        setSelectedDepartment(propDepartment || '');
        setSelectedDepartmentName(propDepartmentName || '');
    }, [propDepartment, propDepartmentName]);

    useStoresDepartment((newDept, newName) => {
        setSelectedDepartment(newDept || '');
        setSelectedDepartmentName(newName || '');
    });

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

    useEffect(() => {
        fetchReport();
    }, [selectedDepartment]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor) query.push(`vendor_id=${selectedVendor}`);
            if (selectedDepartment && selectedDepartment !== 'ALL') query.push(`department=${encodeURIComponent(selectedDepartment)}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-grn-supplier-report/${queryString}`);
            if (response && response.success && response.data) {
                const resPayload = response.data;
                const reportList = Array.isArray(resPayload.data) ? resPayload.data : (Array.isArray(resPayload) ? resPayload : []);
                const sortedList = [...reportList].sort((a, b) => String(a.vendor_name || '').localeCompare(String(b.vendor_name || ''), undefined, { sensitivity: 'base' }));
                setReportData(sortedList);
                setTimeout(() => {
                    const printContainer = document.getElementById("stores-supplier-grn-printable");
                    if (printContainer) printContainer._reportData = sortedList;
                }, 50);
                if (resPayload.summary) setSummary(resPayload.summary);
                if (resPayload.vendors) setVendors(resPayload.vendors);
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
                        "Total Amount (₹)": g.total_amount,
                        "Approval Status": g.is_approved ? 'Approved' : 'Pending',
                        "Items Summary": Array.isArray(g.items) ? g.items.map(it => `${it.itemName || it.name || 'Item'} (${it.quantity || 0} Qty)`).join(', ') : ''
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
                        "Department": r.department || '',
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
                        Comprehensive Goods Received Note (GRN) report categorized by Supplier / Vendor, including purchase returns (debit notes), net purchases, tax breakdown, and items received.
                    </p>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0891b2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL SUPPLIERS</span>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#0891b2', fontWeight: '700' }}>{summary.total_suppliers || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Vendors</span>
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
                                    { value: "", label: "All Store Suppliers" },
                                    ...vendors.map((v) => ({
                                        value: String(v.vendor_id),
                                        label: `${v.name} (${v.vendor_id})`
                                    }))
                                ]}
                                value={selectedVendor || ""}
                                onChange={(e) => {
                                    setSelectedVendor(e.target.value);
                                }}
                                placeholder="All Store Suppliers"
                                height="42px"
                                style={{ width: "100%" }}
                            />
                        </div>

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

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <DepartmentFilterControl
                                departments={departments}
                                onDepartmentChange={(dept, name) => {
                                    setSelectedDepartment(dept || '');
                                    setSelectedDepartmentName(name || '');
                                }}
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
                        <Button type="button" onClick={() => printStoresReport(reportData, { isSupplierPurchaseFormat: true, fromDate, toDate, summary, hospitalName: 'SHANMUGA HOSPITAL LIMITED', department: selectedDepartmentName || selectedDepartment || 'ALL DEPARTMENTS' })} style={{ background: '#0284c7', color: '#ffffff', height: '42px', padding: '0 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Printer size={16} /> Print
                        </Button>
                    </form>
                </ControlsContainer>

                {/* Report Table */}
                <div id="stores-supplier-grn-printable" style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
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
                                                No Supplier GRN records found for the selected period.
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
                                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {supplier.vendor_id}</span>
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

                                                    {/* Expanded Sub-Tables */}
                                                    {isExpanded && (
                                                        <Tr>
                                                            <Td colSpan={8} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                                                                {/* GRN Invoices Sub-table */}
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
                                                                                    <Th style={{ fontSize: '0.8rem', color: '#991b1b' }}>Reason / Department</Th>
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
                                                                                            {ret.department && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Dept: {ret.department}</span>}
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

export default StoresSupplierGrnReport;
