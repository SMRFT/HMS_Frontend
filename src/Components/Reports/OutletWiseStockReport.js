import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Package, Search, RefreshCw, Printer, Download, 
    ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle,
    Layers, DollarSign, Box, Store, ChevronDown, ChevronUp
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

const OutletWiseStockReport = () => {
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Filter states
    const [selectedOutlet, setSelectedOutlet] = useState('OLET002'); // OP PHARMACY default matching reference
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState('in_stock'); // 'in_stock', 'all', 'zero_stock'
    const [searchTerm, setSearchTerm] = useState('');

    // Masters & Meta
    const [outlets, setOutlets] = useState([
        { code: 'OLET002', name: 'OP PHARMACY' },
        { code: 'OLET001', name: 'IP PHARMACY' },
        { code: 'OLET006', name: 'DRUG PURCHASE' },
        { code: 'OLET003', name: 'MAIN BLOCK' },
        { code: 'OLET004', name: 'CANCER BLOCK' },
        { code: 'ALL', name: 'ALL OUTLETS' }
    ]);
    const [categories, setCategories] = useState([]);
    const [activeOutletName, setActiveOutletName] = useState('OP PHARMACY');

    // Data states
    const [loading, setLoading] = useState(false);
    const [itemsList, setItemsList] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
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
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOutlet, selectedCategory, stockFilter]);

    const fetchCategories = async () => {
        try {
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/pharmacy-category/`);
            const catPayload = res?.data?.data || res?.data || [];
            if (Array.isArray(catPayload)) {
                const names = catPayload.map(c => typeof c === 'string' ? c : (c.category_name || c.name || '')).filter(Boolean);
                setCategories(names);
            }
        } catch (err) {
            console.error("Error fetching pharmacy categories:", err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const query = [];
            if (selectedOutlet) query.push(`outlet_code=${encodeURIComponent(selectedOutlet)}`);
            if (selectedCategory && selectedCategory !== 'all') query.push(`category=${encodeURIComponent(selectedCategory)}`);
            if (stockFilter) query.push(`stock_filter=${encodeURIComponent(stockFilter)}`);
            if (searchTerm.trim()) query.push(`search=${encodeURIComponent(searchTerm.trim())}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/outlet-wise-stock-report/${queryString}`);

            // Unpack response: apiRequest wraps axios response into { success, data, status }
            const payload = res?.data || {};
            const listData = Array.isArray(payload.data) 
                ? payload.data 
                : (Array.isArray(payload) ? payload : (Array.isArray(res?.data) ? res.data : []));

            const summaryData = payload.summary || res?.summary || {
                total_items: 0,
                total_stock_units: 0,
                total_sales_value: 0,
                total_purchase_value: 0
            };
            const outletName = payload.outlet_name || res?.outlet_name || 'PHARMACY';

            if (res && res.success && Array.isArray(listData)) {
                setItemsList(listData);
                setActiveOutletName(outletName);
                setSummary(summaryData);
            } else {
                setItemsList([]);
                setSummary({ total_items: 0, total_stock_units: 0, total_sales_value: 0, total_purchase_value: 0 });
            }
        } catch (err) {
            console.error("Error fetching outlet-wise stock report:", err);
            setItemsList([]);
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    };

    const toggleRow = (itemId) => {
        setExpandedRows(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Client-side quick filter & sort
    const filteredItems = useMemo(() => {
        let list = Array.isArray(itemsList) ? [...itemsList] : [];
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(item => 
                (item.item_name || '').toLowerCase().includes(term) ||
                (String(item.item_id) || '').toLowerCase().includes(term) ||
                (item.category || '').toLowerCase().includes(term) ||
                (item.batches || []).some(b => (b.batch_number || '').toLowerCase().includes(term))
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
            'CATEGORY': item.category,
            'STOCK': item.stock,
            'MRP (₹)': item.mrp,
            'SALES VALUE (₹)': item.sales_value,
            'PURCHASE VALUE (₹)': item.purchase_value,
            'BATCHES COUNT': (item.batches || []).length
        }));

        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OutletStockListing");
        XLSX.writeFile(wb, `Outlet_Wise_Stock_Listing_${selectedOutlet}_${dayjs().format('YYYY-MM-DD_HHmm')}.xlsx`);
    };

    // Print Document matching the Shanmuga Hospital reference layout exactly
    const handlePrint = () => {
        if (!filteredItems || filteredItems.length === 0) {
            alert("No data to print.");
            return;
        }

        const printDate = dayjs().format('DD/MM/YYYY HH:mm:ss');
        const outletLabel = (outlets.find(o => o.code === selectedOutlet)?.name || activeOutletName || 'PHARMACY').toUpperCase();

        const printHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>OUTLET_WISE_STOCK_LISTING_${selectedOutlet}_${dayjs().format('YYYYMMDD_HHmm')}</title>
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
            color: #004d40;
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
            border-left: 1px solid #cbd5e1;
            border-right: 1px solid #cbd5e1;
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
            Page 1 of 1
        </div>
    </div>

    <div class="title-banner">
        OUTLET WISE STOCK LISTING - ${printDate}
    </div>

    <div class="section-header">
        ${outletLabel}
    </div>

    <table class="stock-table">
        <thead>
            <tr>
                <th style="width: 45px;" class="text-center">SL NO</th>
                <th class="text-left" style="min-width: 220px;">ITEMNAME</th>
                <th style="width: 75px;" class="text-right">STOCK</th>
                <th style="width: 80px;" class="text-right">MRP</th>
                <th style="width: 105px;" class="text-right">SALES VALUE</th>
                <th style="width: 110px;" class="text-right">PURCHASE VALUE</th>
            </tr>
        </thead>
        <tbody>
            ${filteredItems.map((item, idx) => `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td class="text-left" style="font-weight: 600;">${item.item_name}</td>
                    <td class="text-right" style="font-weight: 700;">${item.stock}</td>
                    <td class="text-right">${fmt(item.mrp)}</td>
                    <td class="text-right">${fmt(item.sales_value)}</td>
                    <td class="text-right">${fmt(item.purchase_value)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="2" class="text-left" style="padding-left: 10px;">TOTAL SUMMARY (${filteredItems.length} ITEMS)</td>
                <td class="text-right">${filteredItems.reduce((acc, curr) => acc + curr.stock, 0)}</td>
                <td class="text-right">-</td>
                <td class="text-right">${fmt(filteredItems.reduce((acc, curr) => acc + curr.sales_value, 0))}</td>
                <td class="text-right">${fmt(filteredItems.reduce((acc, curr) => acc + curr.purchase_value, 0))}</td>
            </tr>
        </tbody>
    </table>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() { if (window.frameElement) window.frameElement.remove(); }, 1000);
            }, 500);
        }
    </script>
</body>
</html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const printDoc = iframe.contentWindow.document;
        printDoc.open();
        printDoc.write(printHtml);
        printDoc.close();
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '16px' }}>
            <Container style={{ maxWidth: '1440px', margin: '0 auto' }}>
                
                {/* Header Banner */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: '#e6fffa',
                            color: '#0d9488',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #99f6e4'
                        }}>
                            <Store size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Inventory / Reports
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0' }}>
                                Outlet Wise Stock Listing
                            </h2>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                Current live stock listing with Stock Qty, MRP, Sales Value, and Purchase Value.
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button 
                            onClick={handlePrint}
                            style={{ 
                                background: '#0d9488', 
                                color: '#ffffff', 
                                border: 'none',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                fontWeight: '700',
                                padding: '8px 14px',
                                borderRadius: '6px'
                            }}
                            title="Print Shanmuga Official Stock Sheet"
                        >
                            <Printer size={15} /> Print Listing
                        </Button>
                        <Button 
                            onClick={exportToExcel}
                            style={{ 
                                background: '#10b981', 
                                color: '#ffffff', 
                                border: 'none',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                fontWeight: '700',
                                padding: '8px 14px',
                                borderRadius: '6px'
                            }}
                            title="Export to Excel (.xlsx)"
                        >
                            <Download size={15} /> Export Excel
                        </Button>
                        <Button 
                            onClick={fetchReport}
                            disabled={loading}
                            style={{ 
                                background: '#f1f5f9', 
                                color: '#334155', 
                                border: '1px solid #cbd5e1',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                fontWeight: '700',
                                padding: '8px 12px',
                                borderRadius: '6px'
                            }}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Stocked Items</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{summary.total_items}</div>
                        </div>
                    </div>

                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Stock Units</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>{summary.total_stock_units}</div>
                        </div>
                    </div>

                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Sales Value</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0d9488' }}>₹ {fmt(summary.total_sales_value)}</div>
                        </div>
                    </div>

                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Purchase Value</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#b45309' }}>₹ {fmt(summary.total_purchase_value)}</div>
                        </div>
                    </div>
                </div>

                {/* Filters & Controls */}
                <ControlsContainer style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {/* Outlet Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Outlet</span>
                        <Select 
                            value={selectedOutlet}
                            onChange={(e) => setSelectedOutlet(e.target.value)}
                            style={{ height: '36px', fontSize: '12px', fontWeight: '600' }}
                        >
                            {outlets.map(o => (
                                <option key={o.code} value={o.code}>{o.name} ({o.code})</option>
                            ))}
                        </Select>
                    </div>

                    {/* Category Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Category</span>
                        <Select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map((c, i) => (
                                <option key={c.category_id || i} value={c.category_name || c}>
                                    {c.category_name || c}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Stock Status Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Stock Filter</span>
                        <Select 
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            style={{ height: '36px', fontSize: '12px' }}
                        >
                            <option value="in_stock">In Stock (&gt; 0)</option>
                            <option value="all">All Items</option>
                            <option value="zero_stock">Zero Stock</option>
                        </Select>
                    </div>

                    {/* Search Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 240px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Search Product or Batch</span>
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                            <Input 
                                type="text"
                                placeholder="Search by item name, item ID, batch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ height: '36px', paddingLeft: '32px', fontSize: '12px', width: '100%' }}
                            />
                        </div>
                    </div>
                </ControlsContainer>

                {/* Data Table */}
                <TableWrapper style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                    <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <Tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <Th style={{ width: '50px', textAlign: 'center', fontSize: '11px' }}>SL NO</Th>
                                <Th 
                                    onClick={() => handleSort('item_name')}
                                    style={{ textAlign: 'left', fontSize: '11px', cursor: 'pointer', userSelect: 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        ITEMNAME <ArrowUpDown size={12} color="#94a3b8" />
                                    </div>
                                </Th>
                                <Th style={{ textAlign: 'left', width: '140px', fontSize: '11px' }}>CATEGORY</Th>
                                <Th 
                                    onClick={() => handleSort('stock')}
                                    style={{ textAlign: 'right', width: '90px', fontSize: '11px', cursor: 'pointer', userSelect: 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        STOCK <ArrowUpDown size={12} color="#94a3b8" />
                                    </div>
                                </Th>
                                <Th 
                                    onClick={() => handleSort('mrp')}
                                    style={{ textAlign: 'right', width: '90px', fontSize: '11px', cursor: 'pointer', userSelect: 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        MRP <ArrowUpDown size={12} color="#94a3b8" />
                                    </div>
                                </Th>
                                <Th 
                                    onClick={() => handleSort('sales_value')}
                                    style={{ textAlign: 'right', width: '120px', fontSize: '11px', cursor: 'pointer', userSelect: 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        SALES VALUE <ArrowUpDown size={12} color="#94a3b8" />
                                    </div>
                                </Th>
                                <Th 
                                    onClick={() => handleSort('purchase_value')}
                                    style={{ textAlign: 'right', width: '130px', fontSize: '11px', cursor: 'pointer', userSelect: 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        PURCHASE VALUE <ArrowUpDown size={12} color="#94a3b8" />
                                    </div>
                                </Th>
                                <Th style={{ width: '40px', textAlign: 'center' }}></Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <RefreshCw size={24} className="animate-spin" color="#0d9488" />
                                            <span>Loading outlet stock records...</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ) : paginatedItems.length === 0 ? (
                                <Tr>
                                    <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <AlertCircle size={24} color="#cbd5e1" />
                                            <span>No stock items found for the selected outlet and criteria.</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ) : (
                                paginatedItems.map((item, idx) => {
                                    const serialNo = (currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + idx + 1;
                                    const isExpanded = !!expandedRows[item.item_id];
                                    const batchList = item.batches || [];

                                    return (
                                        <React.Fragment key={item.item_id || idx}>
                                            <Tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                                                <Td style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                                                    {serialNo}
                                                </Td>
                                                <Td style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>{item.item_name}</span>
                                                        {batchList.length > 1 && (
                                                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                                                {batchList.length} batches
                                                            </span>
                                                        )}
                                                    </div>
                                                </Td>
                                                <Td style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {item.category || '-'}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '800', fontSize: '12.5px', color: item.stock > 0 ? '#0f172a' : '#dc2626' }}>
                                                    {item.stock}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontSize: '12px', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.mrp)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', fontSize: '12.5px', color: '#0d9488', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.sales_value)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', fontSize: '12.5px', color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(item.purchase_value)}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    {batchList.length > 0 && (
                                                        <button 
                                                            onClick={() => toggleRow(item.item_id)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                                                            title={isExpanded ? "Collapse batches" : "View batch details"}
                                                        >
                                                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                        </button>
                                                    )}
                                                </Td>
                                            </Tr>

                                            {/* Expandable Batch Details */}
                                            {isExpanded && (
                                                <Tr style={{ background: '#f8fafc' }}>
                                                    <Td colSpan={8} style={{ padding: '8px 16px 12px 48px' }}>
                                                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                                            <div style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                                                Batch-Wise Breakdown ({batchList.length} Batches)
                                                            </div>
                                                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Batch No</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Expiry</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Stock Qty</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>MRP (₹)</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Selling Price (₹)</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Purchase Cost (₹)</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Sales Val (₹)</th>
                                                                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Purchase Val (₹)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {batchList.map((b, bIdx) => (
                                                                        <tr key={bIdx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                                            <td style={{ padding: '5px 10px', fontWeight: '700', color: '#0f172a' }}>{b.batch_number || '-'}</td>
                                                                            <td style={{ padding: '5px 10px', color: '#64748b' }}>{b.expiry_date || '-'}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: '700' }}>{b.stock}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(b.mrp)}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(b.selling_price)}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(b.purchase_cost)}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right', color: '#0d9488', fontWeight: '600' }}>{fmt(b.sales_value)}</td>
                                                                            <td style={{ padding: '5px 10px', textAlign: 'right', color: '#b45309', fontWeight: '600' }}>{fmt(b.purchase_value)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Showing <b>{filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</b> to <b>{Math.min(currentPage * pageSize, filteredItems.length)}</b> of <b>{filteredItems.length}</b> items
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Rows per page:</span>
                            <Select 
                                value={pageSize} 
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                style={{ height: '30px', padding: '2px 8px', fontSize: '12px' }}
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={-1}>All</option>
                            </Select>

                            <Button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ height: '30px', padding: '0 8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ height: '30px', padding: '0 8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </TableWrapper>

            </Container>
        </PageWrapper>
    );
};

export default OutletWiseStockReport;
