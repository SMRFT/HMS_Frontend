import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Package, Search, RefreshCw, Printer, Download, 
    ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle,
    Layers, DollarSign, Box
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { getSelectedStoreDepartment, getSelectedStoreDepartmentName, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';
import { DepartmentFilterControl } from '../Stores/DepartmentSelectionModal';
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

const StoresItemMasterStockReport = ({ department: propDepartment = '', departmentName: propDepartmentName = '', isModalView = false, onClose }) => {
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(propDepartment || getSelectedStoreDepartment());
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [stockFilter, setStockFilter] = useState('in_stock'); // 'in_stock', 'all', 'zero_stock'

    useEffect(() => {
        setSelectedDepartment(propDepartment || '');
    }, [propDepartment]);

    useStoresDepartment((newDept) => {
        setSelectedDepartment(newDept || '');
    });

    // Masters for dropdowns
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    // Data states
    const [loading, setLoading] = useState(false);
    const [itemsList, setItemsList] = useState([]);
    const [summary, setSummary] = useState({
        total_items: 0,
        total_stock_units: 0,
        total_sales_value: 0,
        total_purchase_value: 0
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    // Sorting
    const [sortField, setSortField] = useState('item_name');
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        fetchMasters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment, selectedCategory, selectedGroup, stockFilter]);

    const fetchMasters = async () => {
        try {
            const [deptRes, catRes, grpRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`)
            ]);
            if (deptRes?.success && Array.isArray(deptRes.data)) setDepartments(deptRes.data);
            if (catRes?.success && Array.isArray(catRes.data)) setCategories(catRes.data);
            if (grpRes?.success && Array.isArray(grpRes.data)) setGroups(grpRes.data);
        } catch (err) {
            console.error("Error fetching masters:", err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const query = [];
            if (selectedDepartment) query.push(`department=${encodeURIComponent(selectedDepartment)}`);
            if (selectedCategory) query.push(`category=${encodeURIComponent(selectedCategory)}`);
            if (selectedGroup) query.push(`group=${encodeURIComponent(selectedGroup)}`);
            if (stockFilter) query.push(`stock_filter=${encodeURIComponent(stockFilter)}`);
            if (searchTerm.trim()) query.push(`search=${encodeURIComponent(searchTerm.trim())}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-item-master-stock-report/${queryString}`);

            if (res && res.success) {
                setItemsList(res.data || []);
                setSummary(res.summary || {
                    total_items: 0,
                    total_stock_units: 0,
                    total_sales_value: 0,
                    total_purchase_value: 0
                });
            } else {
                setItemsList([]);
                setSummary({ total_items: 0, total_stock_units: 0, total_sales_value: 0, total_purchase_value: 0 });
            }
        } catch (err) {
            console.error("Error fetching Stores item master stock report:", err);
            setItemsList([]);
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    };

    // Client-side quick filter & sort
    const filteredItems = useMemo(() => {
        let list = [...itemsList];
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(item => 
                (item.item_name || '').toLowerCase().includes(term) ||
                (item.item_id || '').toLowerCase().includes(term) ||
                (item.department || '').toLowerCase().includes(term) ||
                (item.hsn || '').toLowerCase().includes(term)
            );
        }

        list.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [itemsList, searchTerm, sortField, sortAsc]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const paginatedItems = useMemo(() => {
        if (pageSize === -1) return filteredItems;
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    };

    // Format currency
    const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Export to Excel
    const exportToExcel = () => {
        if (!filteredItems || filteredItems.length === 0) {
            alert("No data available to export.");
            return;
        }

        const excelRows = filteredItems.map((item, idx) => ({
            'SL NO': idx + 1,
            'ITEM ID': item.item_id,
            'ITEM NAME': item.item_name,
            'DEPARTMENT': item.department,
            'CATEGORY': item.category,
            'GROUP': item.group,
            'HSN': item.hsn,
            'STOCK': item.stock,
            'MRP (₹)': item.mrp,
            'PURCHASE RATE (₹)': item.purchase_rate,
            'SALES VALUE (₹)': item.sales_value,
            'PURCHASE VALUE (₹)': item.purchase_value
        }));

        // Summary row
        excelRows.push({
            'SL NO': '',
            'ITEM ID': '',
            'ITEM NAME': 'TOTAL',
            'DEPARTMENT': '',
            'CATEGORY': '',
            'GROUP': '',
            'HSN': '',
            'STOCK': summary.total_stock_units,
            'MRP (₹)': '',
            'PURCHASE RATE (₹)': '',
            'SALES VALUE (₹)': summary.total_sales_value,
            'PURCHASE VALUE (₹)': summary.total_purchase_value
        });

        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StockListing");
        XLSX.writeFile(wb, `Stores_Item_Stock_Listing_${dayjs().format('YYYY-MM-DD_HHmm')}.xlsx`);
    };

    // Print Document matching the user's attached format
    const handlePrint = () => {
        if (!filteredItems || filteredItems.length === 0) {
            alert("No data to print.");
            return;
        }

        const printDate = dayjs().format('DD/MM/YYYY HH:mm:ss');
        const deptLabel = selectedDepartment ? selectedDepartment.toUpperCase() : 'ALL DEPARTMENTS / OUTLETS';

        const printHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>OUTLET_WISE_STOCK_LISTING_${dayjs().format('YYYYMMDD_HHmm')}</title>
    <style>
        @page {
            size: portrait;
            margin: 6mm 8mm 8mm 8mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.5pt;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
        }
        .hospital-title {
            font-size: 14pt;
            font-weight: 800;
            color: #0c4a6e;
            letter-spacing: 0.3px;
        }
        .hospital-sub {
            font-size: 9pt;
            color: #1e293b;
            margin-top: 1.5px;
        }
        .page-badge {
            font-size: 8pt;
            color: #334155;
            font-weight: 600;
            text-align: right;
        }
        .title-banner {
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            text-align: center;
            font-size: 9.5pt;
            font-weight: 800;
            padding: 3px 0;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }
        .section-header {
            font-size: 9pt;
            font-weight: 800;
            color: #000;
            padding: 4px 2px 2px;
            margin-top: 4px;
            text-transform: uppercase;
        }
        table.stock-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-top: 2px;
        }
        table.stock-table th {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 3.5px 5px;
            font-weight: 800;
            font-size: 8pt;
            background: #f8fafc;
            text-transform: uppercase;
        }
        table.stock-table th:first-child { border-left: none; }
        table.stock-table th:last-child { border-right: none; }
        table.stock-table td {
            border-bottom: 1px solid #cbd5e1;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 3px 5px;
            vertical-align: middle;
            white-space: nowrap;
        }
        table.stock-table td:first-child { border-left: none; }
        table.stock-table td:last-child { border-right: none; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; font-variant-numeric: tabular-nums; }
        tr.total-row td {
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            font-weight: 800;
            font-size: 8.5pt;
            background: #f1f5f9;
        }
    </style>
</head>
<body>
    <div class="header-top">
        <div>
            <div class="hospital-title">SHANMUGA HOSPITAL LIMITED</div>
            <div class="hospital-sub">51/24.Saradha College Road, Salem - 636007</div>
            <div class="hospital-sub">Ph No: 04272706666</div>
        </div>
        <div class="page-badge">
            Printed As On: ${printDate}
        </div>
    </div>

    <div class="title-banner">
        OUTLET WISE STOCK LISTING - ${printDate}
    </div>

    <div class="section-header">
        ${deptLabel}
    </div>

    <table class="stock-table">
        <thead>
            <tr>
                <th style="width: 45px;" class="text-center">SL NO</th>
                <th class="text-left" style="min-width: 200px;">ITEMNAME</th>
                <th style="width: 75px;" class="text-right">STOCK</th>
                <th style="width: 80px;" class="text-right">MRP</th>
                <th style="width: 100px;" class="text-right">SALES VALUE</th>
                <th style="width: 105px;" class="text-right">PURCHASE VALUE</th>
            </tr>
        </thead>
        <tbody>
            ${filteredItems.map((it, idx) => `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td class="text-left" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${it.item_name}</td>
                    <td class="text-right">${it.stock}</td>
                    <td class="text-right">${fmt(it.mrp)}</td>
                    <td class="text-right">${fmt(it.sales_value)}</td>
                    <td class="text-right">${fmt(it.purchase_value)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="2" class="text-right" style="padding-right: 12px;">TOTAL:</td>
                <td class="text-right">${summary.total_stock_units}</td>
                <td></td>
                <td class="text-right">${fmt(summary.total_sales_value)}</td>
                <td class="text-right">${fmt(summary.total_purchase_value)}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printHtml);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 300);
        } else {
            alert("Popup blocked! Please allow popups to print report.");
        }
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0c4a6e', fontSize: '1.75rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={28} color="#0284c7" /> Stores Item Master Stock Listing
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.88rem' }}>
                            Comprehensive store stock inventory listing with Stock Qty, MRP, Sales Value, and Purchase Value.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <DepartmentFilterControl
                            departments={departments}
                            onDepartmentChange={(dept, name) => {
                                setSelectedDepartment(dept || '');
                            }}
                        />
                        <Button 
                            onClick={exportToExcel}
                            disabled={loading || filteredItems.length === 0}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            disabled={loading || filteredItems.length === 0}
                            style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                        <Button 
                            onClick={fetchReport}
                            disabled={loading}
                            style={{ background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <RefreshCw size={15} className={loading ? 'spin' : ''} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Item / ID / HSN</label>
                        <div style={{ position: 'relative' }}>
                            <Input 
                                type="text"
                                placeholder="Type item name..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') fetchReport();
                                }}
                                style={{ width: '100%', paddingLeft: '32px' }}
                            />
                            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                    </div>

                    {/* Department */}
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Department</label>
                        <Select 
                            value={selectedDepartment} 
                            onChange={e => setSelectedDepartment(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.department_id || d.id} value={d.department_code || d.department_id || d.department_name}>
                                    {d.department_name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Category */}
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Category</label>
                        <Select 
                            value={selectedCategory} 
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.category_id || c.id} value={c.category_id || c.category_name}>
                                    {c.category_name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Group */}
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Group</label>
                        <Select 
                            value={selectedGroup} 
                            onChange={e => setSelectedGroup(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">All Groups</option>
                            {groups.map(g => (
                                <option key={g.group_id || g.id} value={g.group_id || g.group_name}>
                                    {g.group_name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Stock Status */}
                    <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Stock Status</label>
                        <Select 
                            value={stockFilter} 
                            onChange={e => setStockFilter(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="in_stock">In-Stock Only (Qty &gt; 0)</option>
                            <option value="all">All Items (Including Zero)</option>
                            <option value="zero_stock">Zero Stock Only</option>
                        </Select>
                    </div>

                    {/* Clear Button */}
                    <div>
                        <Button 
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedDepartment('');
                                setSelectedCategory('');
                                setSelectedGroup('');
                                setStockFilter('in_stock');
                            }}
                            style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Reset
                        </Button>
                    </div>
                </ControlsContainer>

                {/* KPI Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>TOTAL ITEMS</span>
                            <Box size={20} color="#0284c7" />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                            {summary.total_items.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: '600' }}>
                            {filteredItems.length !== summary.total_items ? `Showing ${filteredItems.length} filtered` : 'Active Item Master Records'}
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>TOTAL STOCK UNITS</span>
                            <Layers size={20} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>
                            {summary.total_stock_units.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Units currently in inventory
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>TOTAL SALES VALUE (MRP)</span>
                            <DollarSign size={20} color="#8b5cf6" />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6', marginTop: '6px' }}>
                            ₹{fmt(summary.total_sales_value)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Stock Qty × MRP
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>TOTAL PURCHASE VALUE</span>
                            <DollarSign size={20} color="#f59e0b" />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b', marginTop: '6px' }}>
                            ₹{fmt(summary.total_purchase_value)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Stock Qty × Purchase Cost
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                            Stock Listing Records ({filteredItems.length})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Rows per page:</span>
                            <select 
                                value={pageSize} 
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={250}>250</option>
                                <option value={-1}>All ({filteredItems.length})</option>
                            </select>
                        </div>
                    </div>

                    <TableWrapper style={{ overflowX: 'auto', maxHeight: '650px' }}>
                        <Table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <Th style={{ width: '60px', textAlign: 'center', padding: '10px 8px' }}>SL NO</Th>
                                    <Th 
                                        onClick={() => handleSort('item_name')}
                                        style={{ textAlign: 'left', padding: '10px 12px', cursor: 'pointer', minWidth: '220px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            ITEM NAME <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                    <Th 
                                        onClick={() => handleSort('department')}
                                        style={{ textAlign: 'left', padding: '10px 12px', cursor: 'pointer', minWidth: '130px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            DEPARTMENT <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                    <Th 
                                        onClick={() => handleSort('stock')}
                                        style={{ textAlign: 'right', padding: '10px 14px', cursor: 'pointer', width: '100px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            STOCK <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                    <Th 
                                        onClick={() => handleSort('mrp')}
                                        style={{ textAlign: 'right', padding: '10px 14px', cursor: 'pointer', width: '110px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            MRP (₹) <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                    <Th 
                                        onClick={() => handleSort('sales_value')}
                                        style={{ textAlign: 'right', padding: '10px 14px', cursor: 'pointer', width: '130px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            SALES VALUE (₹) <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                    <Th 
                                        onClick={() => handleSort('purchase_value')}
                                        style={{ textAlign: 'right', padding: '10px 14px', cursor: 'pointer', width: '140px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            PURCHASE VALUE (₹) <ArrowUpDown size={13} color="#94a3b8" />
                                        </div>
                                    </Th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <RefreshCw size={24} className="spin" color="#0284c7" />
                                                <span>Loading Stores Stock Listing...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                <AlertCircle size={26} color="#cbd5e1" />
                                                <span style={{ fontWeight: '600' }}>No records found matching filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((item, idx) => {
                                        const globalIndex = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <Tr key={item.item_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <Td style={{ textAlign: 'center', color: '#64748b', fontWeight: '600', padding: '9px 8px' }}>
                                                    {globalIndex}
                                                </Td>
                                                <Td style={{ padding: '9px 12px' }}>
                                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                                        {item.item_name}
                                                    </div>
                                                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                                                        ID: {item.item_id} {item.hsn && item.hsn !== '—' ? `| HSN: ${item.hsn}` : ''}
                                                    </div>
                                                </Td>
                                                <Td style={{ padding: '9px 12px', color: '#334155' }}>
                                                    {item.department}
                                                </Td>
                                                <Td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: '800', color: item.stock > 0 ? '#059669' : '#dc2626' }}>
                                                    {item.stock}
                                                </Td>
                                                <Td style={{ textAlign: 'right', padding: '9px 14px', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.mrp)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: '600', color: '#6d28d9', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.sales_value)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: '600', color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.purchase_value)}
                                                </Td>
                                            </Tr>
                                        );
                                    })
                                )}
                            </tbody>
                            {!loading && filteredItems.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: '800' }}>
                                        <td colSpan={3} style={{ textAlign: 'right', padding: '12px 14px', color: '#0f172a', fontSize: '0.9rem' }}>
                                            TOTAL:
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '12px 14px', color: '#059669', fontSize: '0.95rem' }}>
                                            {summary.total_stock_units.toLocaleString()}
                                        </td>
                                        <td></td>
                                        <td style={{ textAlign: 'right', padding: '12px 14px', color: '#6d28d9', fontSize: '0.95rem' }}>
                                            ₹{fmt(summary.total_sales_value)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '12px 14px', color: '#b45309', fontSize: '0.95rem' }}>
                                            ₹{fmt(summary.total_purchase_value)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </Table>
                    </TableWrapper>

                    {/* Pagination Footer */}
                    {!loading && filteredItems.length > 0 && pageSize !== -1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid #e2e8f0', background: '#fafafa', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} items
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '6px 12px', background: currentPage === 1 ? '#f1f5f9' : '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
                                >
                                    <ChevronLeft size={15} /> Prev
                                </Button>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', padding: '0 8px', color: '#334155' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '6px 12px', background: currentPage === totalPages ? '#f1f5f9' : '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
                                >
                                    Next <ChevronRight size={15} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </PageWrapper>
    );
};

export default StoresItemMasterStockReport;

