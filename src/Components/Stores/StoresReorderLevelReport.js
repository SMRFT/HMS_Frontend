import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    AlertCircle, Download, Search, RefreshCw, 
    CheckCircle, Package, ArrowUpRight, DollarSign, ShoppingCart
} from 'lucide-react';
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

const StoresReorderLevelReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [reorderItems, setReorderItems] = useState([]);
    const [summary, setSummary] = useState({
        total_items_tracked: 0,
        out_of_stock_count: 0,
        low_stock_count: 0,
        adequate_count: 0,
        total_estimated_reorder_cost: 0
    });

    useEffect(() => {
        fetchReport();
    }, [statusFilter]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (statusFilter) query.push(`status=${statusFilter}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-reorder-level-report/${queryString}`);
            if (res && res.success) {
                setReorderItems(res.data.data || []);
                setSummary(res.data.summary || {});
            } else {
                setReorderItems([]);
            }
        } catch (err) {
            console.error("Error fetching reorder level report:", err);
            setReorderItems([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!reorderItems || reorderItems.length === 0) return;
        const excelData = reorderItems.map(item => ({
            'Item ID': item.item_id,
            'Item Name': item.item_name,
            'Department': item.department,
            'Group': item.group,
            'VED Category': item.ved_category,
            'Current Stock': item.current_stock,
            'Reorder Level': item.reorder_level,
            'Status': item.stock_status,
            'Suggested Reorder Qty': item.suggested_reorder_qty,
            'Unit Price (₹)': item.unit_price,
            'Estimated Reorder Cost (₹)': item.estimated_reorder_cost,
            'Rack / Shelf': `${item.rack_no || '-'} / ${item.shelf_no || '-'}`
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ReorderLevels");
        XLSX.writeFile(wb, `Stores_Reorder_Level_Report_${today}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#2563eb', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertCircle size={28} color="#2563eb" /> Stores Reorder Level Indication Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Monitor minimum stock thresholds, detect low stock / out of stock items, and calculate replenishment orders.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Filter Stock Status</label>
                        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Stock Statuses</option>
                            <option value="OUT_OF_STOCK">🚨 Out of Stock (Stock &le; 0)</option>
                            <option value="LOW_STOCK">⚠️ Below Reorder Level (Low Stock)</option>
                            <option value="ADEQUATE">✅ Adequate Stock</option>
                        </Select>
                    </div>
                    <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Item Name / Code</label>
                        <Input 
                            type="text" 
                            placeholder="Item name, ID..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchReport} style={{ background: '#2563eb', color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setStatusFilter(''); setSearchTerm(''); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL TRACKED ITEMS</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: colors.textMain, marginTop: '4px' }}>{summary.total_items_tracked || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '700' }}>OUT OF STOCK</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{summary.out_of_stock_count || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: '700' }}>LOW STOCK (BELOW REORDER)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{summary.low_stock_count || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>ADEQUATE STOCK</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{summary.adequate_count || 0}</div>
                    </div>
                </div>

                {/* Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Item Details</Th>
                                <Th>Group / VED</Th>
                                <Th>Rack Location</Th>
                                <Th style={{ textAlign: 'right' }}>Current Stock</Th>
                                <Th style={{ textAlign: 'right' }}>Reorder Level</Th>
                                <Th style={{ textAlign: 'center' }}>Stock Status</Th>
                                <Th style={{ textAlign: 'right', color: colors.primary }}>Suggested Order</Th>
                                <Th style={{ textAlign: 'right' }}>Unit Price (₹)</Th>
                                <Th style={{ textAlign: 'right' }}>Est. Reorder Cost (₹)</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Checking reorder thresholds...</p>
                                    </Td>
                                </Tr>
                            ) : reorderItems.length === 0 ? (
                                <Tr>
                                    <Td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No items found matching the filter criteria.
                                    </Td>
                                </Tr>
                            ) : (
                                reorderItems.map((item, idx) => (
                                    <Tr key={item.item_id}>
                                        <Td>{idx + 1}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>{item.item_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {item.item_id}</div>
                                        </Td>
                                        <Td>
                                            <div>{item.group || '-'}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: item.ved_category === 'V' ? '#dc2626' : (item.ved_category === 'E' ? '#d97706' : '#059669') }}>
                                                VED: {item.ved_category || 'D'}
                                            </div>
                                        </Td>
                                        <Td>{item.rack_no ? `${item.rack_no}${item.shelf_no ? ' - ' + item.shelf_no : ''}` : '-'}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: item.current_stock <= 0 ? '#dc2626' : (item.current_stock <= item.reorder_level ? '#d97706' : '#059669') }}>
                                            {item.current_stock}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600' }}>{item.reorder_level}</Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                background: item.stock_status === 'OUT_OF_STOCK' ? '#fee2e2' : (item.stock_status === 'LOW_STOCK' ? '#fef3c7' : '#ecfdf5'),
                                                color: item.stock_status === 'OUT_OF_STOCK' ? '#dc2626' : (item.stock_status === 'LOW_STOCK' ? '#d97706' : '#059669')
                                            }}>
                                                {item.stock_status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : (item.stock_status === 'LOW_STOCK' ? 'LOW STOCK' : 'ADEQUATE')}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: colors.primary }}>
                                            {item.suggested_reorder_qty > 0 ? `+${item.suggested_reorder_qty}` : '0'}
                                        </Td>
                                        <Td style={{ textAlign: 'right' }}>₹{item.unit_price?.toFixed(2)}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                            ₹{item.estimated_reorder_cost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </Container>
        </PageWrapper>
    );
};

export default StoresReorderLevelReport;
