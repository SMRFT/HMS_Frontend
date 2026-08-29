import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Search, Plus, Upload, Calendar, RefreshCw, FileSpreadsheet, 
    TrendingUp, PackageCheck, ShoppingCart, DollarSign, X, Download
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
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors
} from '../GlobalStyles';

const VendingMachineReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_vm_products: 0,
        total_sales_quantity: 0,
        total_sales_value: 0,
        total_grn_quantity: 0,
        total_grn_value: 0,
        net_margin: 0
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);

    // Modal states
    const [showAddSaleModal, setShowAddSaleModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState('');

    // Form state for manual sale
    const [vmItemsList, setVmItemsList] = useState([]);
    const [saleFormData, setSaleFormData] = useState({
        item_id: '',
        product_name: '',
        unit_price: '',
        quantity_sold: 1,
        date: new Date().toISOString().split('T')[0]
    });

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useEffect(() => {
        fetchReport();
        fetchVMItemMasters();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/vending-machine-report/${queryString}`);
            if (response && response.success && response.data) {
                const resPayload = response.data;
                const reportList = Array.isArray(resPayload.data) ? resPayload.data : (Array.isArray(resPayload) ? resPayload : []);
                setReportData(reportList);
                if (resPayload.summary) setSummary(resPayload.summary);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching VM report:", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchVMItemMasters = async () => {
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`);
            if (response.success && Array.isArray(response.data)) {
                setVmItemsList(response.data);
            }
        } catch (error) {
            console.error("Error fetching items master:", error);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const clearFilters = () => {
        setFromDate(oneMonthAgo);
        setToDate(today);
        setSearchTerm('');
        setTimeout(() => fetchReport(), 100);
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                item_id: saleFormData.item_id,
                product_name: saleFormData.product_name,
                unit_price: parseFloat(saleFormData.unit_price || 0),
                quantity_sold: parseInt(saleFormData.quantity_sold || 1),
                total_sales_amount: parseFloat(saleFormData.unit_price || 0) * parseInt(saleFormData.quantity_sold || 1),
                date: saleFormData.date,
                source: 'MANUAL'
            };

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/vending-machine-sales/`, 'POST', payload);
            if (response.success) {
                alert("Sales entry added successfully!");
                setShowAddSaleModal(false);
                setSaleFormData({
                    item_id: '',
                    product_name: '',
                    unit_price: '',
                    quantity_sold: 1,
                    date: new Date().toISOString().split('T')[0]
                });
                fetchReport();
            } else {
                alert("Error adding sales entry: " + (response.error || "Failed"));
            }
        } catch (error) {
            console.error("Error adding sale:", error);
            alert("Error adding sales entry");
        }
    };

    const handleExcelImportSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select an Excel file to import!");
            return;
        }

        try {
            setImportLoading(true);
            setImportMessage("Parsing Excel file and importing sales records...");
            
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const branch = localStorage.getItem('selected_branch') || 'system';
            const outlet = localStorage.getItem('selected_outlet') || 'system';

            const response = await fetch(`${getBaseUrl.replace(/\/$/, '')}/vending-machine-sales/import-excel/`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': token } : {}),
                    'Branch-Code': branch,
                    'Outlet-Code': outlet
                },
                body: formData
            });

            const resData = await response.json();
            if (response.ok && resData.success) {
                setImportMessage(`Success! ${resData.message || "Import completed."}`);
                setTimeout(() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setImportMessage('');
                    fetchReport();
                }, 1500);
            } else {
                setImportMessage(`Error: ${resData.error || resData.detail || "Import failed"}`);
            }
        } catch (error) {
            console.error("Error importing excel:", error);
            setImportMessage("Error importing Excel file.");
        } finally {
            setImportLoading(false);
        }
    };

    const filteredReport = Array.isArray(reportData) ? reportData.filter(item => {
        const query = searchTerm.toLowerCase();
        return (
            (item.product_name && item.product_name.toLowerCase().includes(query)) ||
            (item.item_id && item.item_id.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
        );
    }) : [];

    const exportToExcel = () => {
        if (!filteredReport || filteredReport.length === 0) return;

        const exportRows = filteredReport.map(item => ({
            "Product ID": item.item_id,
            "Product Name": item.product_name,
            "Category": item.category,
            "Supplier": item.supplier,
            "Unit Price (₹)": item.unit_price,
            "Sales Quantity": item.sales_qty,
            "Total Sales Value (₹)": item.sales_value,
            "GRN Received Qty": item.grn_received_qty,
            "GRN Total Cost (₹)": item.grn_total_value,
            "Avg GRN Cost (₹)": item.avg_grn_unit_cost,
            "Current Stock Balance": item.stock_balance,
            "Estimated Profit Margin (₹)": item.estimated_margin
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportRows);
        XLSX.utils.book_append_sheet(wb, ws, "Vending Machine Report");

        XLSX.writeFile(wb, `Vending_Machine_Sales_Reconciliation_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Title Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingCart size={28} color={colors.primary} /> Vending Machine Sales & Stock Reconciliation Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Track Vending Machine sales, compare total sales value against GRN costs, and reconcile stock balance in real-time.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button success onClick={() => setShowAddSaleModal(true)} style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={18} /> Add Sales Entry
                        </Button>
                        <Button style={{ background: '#4f46e5', color: '#fff', padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowImportModal(true)}>
                            <Upload size={18} /> Import Excel Sales
                        </Button>
                        <Button style={{ background: '#16a34a', color: '#fff', padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={exportToExcel}>
                            <Download size={18} /> Export Excel
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>VM PRODUCTS</span>
                            <PackageCheck size={20} color="#2563eb" />
                        </div>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '1.6rem', color: colors.textMain, fontWeight: '700' }}>{summary.total_vm_products || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active VM Catalog Items</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL SALES QTY</span>
                            <ShoppingCart size={20} color="#16a34a" />
                        </div>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '1.6rem', color: '#16a34a', fontWeight: '700' }}>{summary.total_sales_quantity || 0}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Units Sold in Period</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>TOTAL SALES VALUE</span>
                            <DollarSign size={20} color="#059669" />
                        </div>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '1.6rem', color: '#059669', fontWeight: '700' }}>₹{Number(summary.total_sales_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Revenue Generated</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>GRN TOTAL VALUE</span>
                            <FileSpreadsheet size={20} color="#d97706" />
                        </div>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '1.6rem', color: '#d97706', fontWeight: '700' }}>₹{Number(summary.total_grn_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.total_grn_quantity || 0} Units Received from GRN</span>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>ESTIMATED MARGIN</span>
                            <TrendingUp size={20} color="#4f46e5" />
                        </div>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '1.6rem', color: (summary.net_margin >= 0 ? '#4f46e5' : '#dc2626'), fontWeight: '700' }}>
                            ₹{Number(summary.net_margin || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sales Revenue - Cost of Goods Sold</span>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <ControlsContainer style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                    <form onSubmit={handleFilterSubmit} style={{ width: '100%', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                            <Input
                                placeholder="Search by Product Name, ID, or Category..."
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
                    </form>
                </ControlsContainer>

                {/* Main Reconciliation & Stock Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Vending Machine Report...
                        </div>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th>Product Details</Th>
                                        <Th>Category / Supplier</Th>
                                        <Th style={{ textAlign: 'right' }}>Selling Price</Th>
                                        <Th style={{ textAlign: 'center' }}>Sales Qty</Th>
                                        <Th style={{ textAlign: 'right' }}>Sales Revenue</Th>
                                        <Th style={{ textAlign: 'center' }}>GRN Qty Recd</Th>
                                        <Th style={{ textAlign: 'right' }}>GRN Total Cost</Th>
                                        <Th style={{ textAlign: 'right' }}>Avg GRN Unit Cost</Th>
                                        <Th style={{ textAlign: 'center' }}>Current Stock Balance</Th>
                                        <Th style={{ textAlign: 'right' }}>Est. Margin</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {filteredReport.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>
                                                No Vending Machine products or sales records found for the selected period.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        filteredReport.map((item, idx) => (
                                            <Tr key={idx}>
                                                <Td style={{ fontWeight: '600' }}>
                                                    <div style={{ color: colors.primary, fontSize: '0.95rem' }}>{item.product_name}</div>
                                                    <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {item.item_id || '-'}</span>
                                                </Td>
                                                <Td style={{ fontSize: '0.85rem' }}>
                                                    <div>{item.category || '-'}</div>
                                                    <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{item.supplier || '-'}</span>
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '600' }}>₹{Number(item.unit_price || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'center', fontWeight: '700', color: '#16a34a' }}>
                                                    {item.sales_qty}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                                                    ₹{Number(item.sales_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ textAlign: 'center', fontWeight: '700', color: '#d97706' }}>
                                                    {item.grn_received_qty}
                                                </Td>
                                                <Td style={{ textAlign: 'right', color: '#d97706', fontWeight: '600' }}>
                                                    ₹{Number(item.grn_total_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ textAlign: 'right', color: colors.textMuted }}>
                                                    ₹{Number(item.avg_grn_unit_cost || 0).toFixed(2)}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        background: item.stock_balance <= 5 ? '#fee2e2' : '#dcfce7',
                                                        color: item.stock_balance <= 5 ? '#dc2626' : '#15803d',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontWeight: '700',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {item.stock_balance} units
                                                    </span>
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: item.estimated_margin >= 0 ? '#4f46e5' : '#dc2626' }}>
                                                    ₹{Number(item.estimated_margin || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    )}
                </div>

                {/* Modal for Manual Sales Entry */}
                {showAddSaleModal && (
                    <ModalOverlay>
                        <ModalContainer style={{ maxWidth: '550px' }}>
                            <ModalHeader>
                                <ModalTitle>Add Vending Machine Sale Entry</ModalTitle>
                                <CloseButton onClick={() => setShowAddSaleModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <form onSubmit={handleManualSaleSubmit}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: colors.textMain }}>
                                                Select Item from Master (or enter custom)
                                            </label>
                                            <select
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}` }}
                                                value={saleFormData.item_id}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const matched = vmItemsList.find(i => i.item_id === selectedId);
                                                    setSaleFormData({
                                                        ...saleFormData,
                                                        item_id: selectedId,
                                                        product_name: matched ? matched.itemName : saleFormData.product_name,
                                                        unit_price: matched ? matched.unit_price : saleFormData.unit_price
                                                    });
                                                }}
                                            >
                                                <option value="">-- Select Store Item --</option>
                                                {vmItemsList.map(item => (
                                                    <option key={item.item_id} value={item.item_id}>
                                                        {item.itemName} ({item.item_id}) {item.is_VM ? '[VM Item]' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: colors.textMain }}>
                                                Product Name *
                                            </label>
                                            <Input
                                                required
                                                placeholder="e.g. KitKat 20 / Lays Salted"
                                                value={saleFormData.product_name}
                                                onChange={(e) => setSaleFormData({ ...saleFormData, product_name: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: colors.textMain }}>
                                                    Selling Unit Price (₹) *
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    placeholder="20.00"
                                                    value={saleFormData.unit_price}
                                                    onChange={(e) => setSaleFormData({ ...saleFormData, unit_price: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: colors.textMain }}>
                                                    Sales Quantity Sold *
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={saleFormData.quantity_sold}
                                                    onChange={(e) => setSaleFormData({ ...saleFormData, quantity_sold: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: colors.textMain }}>
                                                Sale Date *
                                            </label>
                                            <Input
                                                type="date"
                                                required
                                                value={saleFormData.date}
                                                onChange={(e) => setSaleFormData({ ...saleFormData, date: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e40af' }}>
                                            Total Calculated Sales Amount: <strong>₹{(parseFloat(saleFormData.unit_price || 0) * parseInt(saleFormData.quantity_sold || 1)).toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                        <Button secondary type="button" onClick={() => setShowAddSaleModal(false)}>Cancel</Button>
                                        <Button success type="submit">Save Sales Entry</Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Modal for Excel Import */}
                {showImportModal && (
                    <ModalOverlay>
                        <ModalContainer style={{ maxWidth: '550px' }}>
                            <ModalHeader>
                                <ModalTitle>Import Vending Machine Sales Excel</ModalTitle>
                                <CloseButton onClick={() => setShowImportModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <form onSubmit={handleExcelImportSubmit}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textMuted }}>
                                            Upload an Excel file (e.g. <code>Products VENDING SALE (1).xlsx</code>) containing Vending Machine product sales history. The system will automatically parse Product IDs, Names, Prices, and Dates, and generate sales & stock reconciliation reports.
                                        </p>

                                        <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
                                            <FileSpreadsheet size={40} color="#4f46e5" style={{ marginBottom: '10px' }} />
                                            <input
                                                type="file"
                                                accept=".xlsx, .xls"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                                style={{ display: 'block', margin: '10px auto' }}
                                            />
                                            {selectedFile && (
                                                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', marginTop: '8px' }}>
                                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                </div>
                                            )}
                                        </div>

                                        {importMessage && (
                                            <div style={{ padding: '12px', borderRadius: '8px', background: importMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: importMessage.includes('Error') ? '#dc2626' : '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {importMessage}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                        <Button secondary type="button" onClick={() => setShowImportModal(false)}>Cancel</Button>
                                        <Button type="submit" disabled={importLoading} style={{ background: '#4f46e5', color: '#fff' }}>
                                            {importLoading ? 'Importing...' : 'Upload & Process Excel'}
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default VendingMachineReport;
