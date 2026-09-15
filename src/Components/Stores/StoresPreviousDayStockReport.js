import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Calendar, RefreshCw, Download, Search, 
    Layers, ArrowDownRight, ArrowUpRight, RotateCcw, Package
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

const StoresPreviousDayStockReport = () => {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [selectedDate, setSelectedDate] = useState(yesterday);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [summary, setSummary] = useState({
        total_items: 0,
        total_opening_qty: 0,
        total_inward_qty: 0,
        total_outward_qty: 0,
        total_returns_qty: 0,
        total_closing_qty: 0,
        total_closing_value: 0
    });

    useEffect(() => {
        fetchStockReport();
    }, []);

    const fetchStockReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (selectedDate) query.push(`date=${selectedDate}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-previous-day-stock-report/${queryString}`);
            if (res && res.success) {
                setStockData(res.data.data || []);
                setSummary(res.data.summary || {});
            } else {
                setStockData([]);
            }
        } catch (err) {
            console.error("Error fetching stock report:", err);
            setStockData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!stockData || stockData.length === 0) return;
        const excelData = stockData.map(item => ({
            'Item ID': item.item_id,
            'Item Name': item.item_name,
            'Department': item.department,
            'Group': item.group,
            'Rack / Shelf': `${item.rack_no || '-'} / ${item.shelf_no || '-'}`,
            'Opening Stock': item.opening_stock,
            'Inward Qty (GRN)': item.inward_qty,
            'Outward Qty (Indent)': item.outward_qty,
            'Return Qty': item.return_qty,
            'Closing Stock': item.closing_stock,
            'Unit Price (₹)': item.unit_price,
            'Stock Valuation (₹)': item.stock_valuation
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StockReport");
        XLSX.writeFile(wb, `Stores_Stock_Report_${selectedDate}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layers size={28} color={colors.primary} /> Previous Day / Daily Stock Movement Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Opening balance, inward receipts (GRN), outward issues (Indents), returns, and closing valuation per date.
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
                    <div style={{ flex: '1 1 200px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Select Stock Date</label>
                        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '100%' }} />
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
                        <Button onClick={fetchStockReport} style={{ background: colors.primary, color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Generate Report
                        </Button>
                        <Button onClick={() => { setSelectedDate(yesterday); setSearchTerm(''); setTimeout(fetchStockReport, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL ITEMS</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>{summary.total_items || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>OPENING STOCK</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>{(summary.total_opening_qty || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>INWARD (GRN)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>+{(summary.total_inward_qty || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>OUTWARD (INDENT)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>-{(summary.total_outward_qty || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>CLOSING STOCK</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.primary, marginTop: '2px' }}>{(summary.total_closing_qty || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>STOCK VALUATION</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>₹{(summary.total_closing_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {/* Stock Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Item Details</Th>
                                <Th>Group / Category</Th>
                                <Th>Rack / Shelf</Th>
                                <Th style={{ textAlign: 'right' }}>Opening Stock</Th>
                                <Th style={{ textAlign: 'right', color: '#059669' }}>Inward (+)</Th>
                                <Th style={{ textAlign: 'right', color: '#d97706' }}>Outward (-)</Th>
                                <Th style={{ textAlign: 'right', color: '#dc2626' }}>Returns (-)</Th>
                                <Th style={{ textAlign: 'right', fontWeight: '800' }}>Closing Stock</Th>
                                <Th style={{ textAlign: 'right' }}>Unit Rate</Th>
                                <Th style={{ textAlign: 'right' }}>Valuation (₹)</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Compiling Stock Movement Report...</p>
                                    </Td>
                                </Tr>
                            ) : stockData.length === 0 ? (
                                <Tr>
                                    <Td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No inventory records found for the selected date.
                                    </Td>
                                </Tr>
                            ) : (
                                stockData.map((item, idx) => (
                                    <Tr key={item.item_id}>
                                        <Td>{idx + 1}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>{item.item_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {item.item_id}</div>
                                        </Td>
                                        <Td>
                                            <div>{item.group || '-'}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{item.category || ''}</div>
                                        </Td>
                                        <Td>
                                            {item.rack_no ? `${item.rack_no}${item.shelf_no ? ' - ' + item.shelf_no : ''}` : '-'}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600' }}>{item.opening_stock}</Td>
                                        <Td style={{ textAlign: 'right', color: '#059669', fontWeight: '600' }}>
                                            {item.inward_qty > 0 ? `+${item.inward_qty}` : '0'}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#d97706', fontWeight: '600' }}>
                                            {item.outward_qty > 0 ? `-${item.outward_qty}` : '0'}
                                        </Td>
                                        <Td style={{ textAlign: 'right', color: '#dc2626' }}>
                                            {item.return_qty > 0 ? `-${item.return_qty}` : '0'}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: colors.primary, fontSize: '0.95rem' }}>
                                            {item.closing_stock}
                                        </Td>
                                        <Td style={{ textAlign: 'right' }}>₹{item.unit_price?.toFixed(2)}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                            ₹{item.stock_valuation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default StoresPreviousDayStockReport;
