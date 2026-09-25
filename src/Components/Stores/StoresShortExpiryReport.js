import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import {
    AlertTriangle, Download, Search, RefreshCw,
    Calendar, Package, Building2, CheckCircle, Clock
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

const StoresShortExpiryReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [daysThreshold, setDaysThreshold] = useState(90);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [expiryItems, setExpiryItems] = useState([]);
    const [summary, setSummary] = useState({
        total_items: 0,
        expired_count: 0,
        critical_count: 0,
        total_quantity: 0,
        total_value: 0
    });

    useEffect(() => {
        fetchReport();
    }, [daysThreshold]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = [`days=${daysThreshold}`];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-short-expiry-report/${queryString}`);
            if (res && res.success) {
                setExpiryItems(res.data.data || []);
                setSummary(res.data.summary || {});
            } else {
                setExpiryItems([]);
            }
        } catch (err) {
            console.error("Error fetching short expiry report:", err);
            setExpiryItems([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!expiryItems || expiryItems.length === 0) return;
        const excelData = expiryItems.map(item => ({
            'GRN No': item.grn_number,
            'Item ID': item.item_id,
            'Item Name': item.item_name,
            'Batch No': item.batch_no,
            'Supplier': item.vendor_name,
            'Expiry Date': item.expiry_date,
            'Days Remaining': item.days_remaining,
            'Status': item.status,
            'Quantity': item.quantity,
            'Unit Rate (₹)': item.rate,
            'Total Value (₹)': item.total_value,
            'Rack': item.rack_no || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ShortExpiry");
        XLSX.writeFile(wb, `Stores_Short_Expiry_${daysThreshold}Days_${today}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#e11d48', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={28} color="#e11d48" /> Stores Short Expiry & Expired Items Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Proactive expiration tracking to prevent pharmaceutical & medical store stock write-offs.
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
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Expiry Threshold Window</label>
                        <Select value={daysThreshold} onChange={e => setDaysThreshold(Number(e.target.value))} style={{ width: '100%' }}>
                            <option value={30}>Expiring within 30 Days (Critical)</option>
                            <option value={60}>Expiring within 60 Days</option>
                            <option value={90}>Expiring within 90 Days (Quarter)</option>
                            <option value={180}>Expiring within 180 Days (6 Months)</option>
                            <option value={365}>Expiring within 1 Year</option>
                        </Select>
                    </div>
                    <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Item Name / Batch / Code</label>
                        <Input
                            type="text"
                            placeholder="Item name, batch number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchReport} style={{ background: '#e11d48', color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setDaysThreshold(90); setSearchTerm(''); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL EXPIRY BATCHES</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: colors.textMain, marginTop: '4px' }}>{summary.total_items || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>EXPIRED ALREADY</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{summary.expired_count || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>CRITICAL (&lt; 30 DAYS)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e11d48', marginTop: '4px' }}>{summary.critical_count || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL AT-RISK VALUE</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                            ₹{(summary.total_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Item Details</Th>
                                <Th>Batch Number</Th>
                                <Th>Supplier / Vendor</Th>
                                <Th>Expiry Date</Th>
                                <Th style={{ textAlign: 'center' }}>Days Remaining</Th>
                                <Th style={{ textAlign: 'center' }}>Status</Th>
                                <Th style={{ textAlign: 'right' }}>Stock Qty</Th>
                                <Th style={{ textAlign: 'right' }}>Rate (₹)</Th>
                                <Th style={{ textAlign: 'right' }}>Total Value (₹)</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#e11d48' }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Scanning batch expiry dates...</p>
                                    </Td>
                                </Tr>
                            ) : expiryItems.length === 0 ? (
                                <Tr>
                                    <Td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        Excellent! No items found nearing expiry within {daysThreshold} days.
                                    </Td>
                                </Tr>
                            ) : (
                                expiryItems.map((item, idx) => (
                                    <Tr key={idx}>
                                        <Td>{idx + 1}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>{item.item_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {item.item_id} | GRN: {item.grn_number}</div>
                                        </Td>
                                        <Td style={{ fontWeight: '600' }}>{item.batch_no}</Td>
                                        <Td>{item.vendor_name}</Td>
                                        <Td style={{ fontWeight: '700', color: item.days_remaining <= 30 ? '#dc2626' : colors.textMain }}>
                                            {item.expiry_date}
                                        </Td>
                                        <Td style={{ textAlign: 'center', fontWeight: '800' }}>
                                            {item.days_remaining < 0 ? (
                                                <span style={{ color: '#dc2626' }}>Expired ({Math.abs(item.days_remaining)}d ago)</span>
                                            ) : (
                                                <span>{item.days_remaining} days</span>
                                            )}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                background: item.status === 'EXPIRED' ? '#fee2e2' : (item.status === 'CRITICAL' ? '#ffe4e6' : '#fef3c7'),
                                                color: item.status === 'EXPIRED' ? '#dc2626' : (item.status === 'CRITICAL' ? '#e11d48' : '#d97706')
                                            }}>
                                                {item.status}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700' }}>{item.quantity}</Td>
                                        <Td style={{ textAlign: 'right' }}>₹{item.rate?.toFixed(2)}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                            ₹{item.total_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default StoresShortExpiryReport;
