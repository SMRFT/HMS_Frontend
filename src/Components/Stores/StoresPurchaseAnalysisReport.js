import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    BarChart3, TrendingUp, Calendar, RefreshCw, Download, 
    Building2, Package, DollarSign, PieChart, ArrowUpRight, Search
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

const StoresPurchaseAnalysisReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_spend: 0,
        total_tax: 0,
        total_discount: 0,
        total_grns: 0,
        average_grn_value: 0
    });
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [vendorBreakdown, setVendorBreakdown] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [activeTab, setActiveTab] = useState('monthly'); // 'monthly', 'vendor', 'items'

    useEffect(() => {
        fetchVendors();
        fetchAnalysis();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`);
            if (res && res.success) {
                const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
                setVendors(list);
            }
        } catch (err) {
            console.error("Error fetching vendors:", err);
        }
    };

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            let query = [];
            if (fromDate) query.push(`from_date=${fromDate}`);
            if (toDate) query.push(`to_date=${toDate}`);
            if (selectedVendor) query.push(`vendor_id=${selectedVendor}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-purchase-analysis-report/${queryString}`);
            if (res && res.success) {
                setSummary(res.data.summary || {});
                setMonthlyTrends(res.data.monthly_trends || []);
                setVendorBreakdown(res.data.vendor_breakdown || []);
                setTopItems(res.data.top_items || []);
            }
        } catch (err) {
            console.error("Error fetching purchase analysis:", err);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Monthly Trends
        const wsMonthly = XLSX.utils.json_to_sheet(monthlyTrends.map(m => ({
            'Month': m.month,
            'Total Purchases (₹)': m.total_amount,
            'Tax Amount (₹)': m.tax_amount,
            'GRN Count': m.grn_count
        })));
        XLSX.utils.book_append_sheet(wb, wsMonthly, "MonthlyTrends");

        // Sheet 2: Vendor Breakdown
        const wsVendor = XLSX.utils.json_to_sheet(vendorBreakdown.map(v => ({
            'Vendor ID': v.vendor_id,
            'Vendor Name': v.vendor_name,
            'Total Purchases (₹)': v.total_amount,
            'Share %': v.share_percentage,
            'GRN Count': v.grn_count
        })));
        XLSX.utils.book_append_sheet(wb, wsVendor, "VendorSpend");

        // Sheet 3: Top Items
        const wsItems = XLSX.utils.json_to_sheet(topItems.map(it => ({
            'Item ID': it.item_id,
            'Item Name': it.item_name,
            'Total Quantity': it.total_quantity,
            'Total Spend (₹)': it.total_spend,
            'Avg Rate (₹)': it.avg_rate,
            'Min Rate (₹)': it.min_rate,
            'Max Rate (₹)': it.max_rate
        })));
        XLSX.utils.book_append_sheet(wb, wsItems, "TopItems");

        XLSX.writeFile(wb, `Stores_Purchase_Analysis_${today}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart3 size={28} color={colors.primary} /> Stores Purchase Analysis Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Comprehensive analytical overview of purchase spend trends, vendor distributions, and price variances.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600' }}
                        >
                            <Download size={16} /> Export Analysis
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>From Date</label>
                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>To Date</label>
                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Filter Vendor</label>
                        <Select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Vendors</option>
                            {vendors.map(v => (
                                <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchAnalysis} style={{ background: colors.primary, color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Analyze
                        </Button>
                        <Button onClick={() => { setFromDate(oneMonthAgo); setToDate(today); setSelectedVendor(''); setTimeout(fetchAnalysis, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Key Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL PURCHASE SPEND</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: colors.primary, marginTop: '4px' }}>
                            ₹{(summary.total_spend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL TAX PAID (GST)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            ₹{(summary.total_tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL GRN INVOICES</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                            {summary.total_grns || 0}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>AVERAGE GRN VALUE</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                            ₹{(summary.average_grn_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: `2px solid ${colors.border}`, marginBottom: '20px' }}>
                    <button
                        onClick={() => setActiveTab('monthly')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'monthly' ? `3px solid ${colors.primary}` : '3px solid transparent',
                            color: activeTab === 'monthly' ? colors.primary : colors.textMuted,
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <TrendingUp size={16} /> Monthly Spend Trends ({monthlyTrends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vendor')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'vendor' ? `3px solid ${colors.primary}` : '3px solid transparent',
                            color: activeTab === 'vendor' ? colors.primary : colors.textMuted,
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Building2 size={16} /> Vendor Spend Distribution ({vendorBreakdown.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'items' ? `3px solid ${colors.primary}` : '3px solid transparent',
                            color: activeTab === 'items' ? colors.primary : colors.textMuted,
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Package size={16} /> Top Purchased Items & Rates ({topItems.length})
                    </button>
                </div>

                {/* Tab Contents */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '600', color: colors.textMuted }}>Compiling Purchase Analytics...</p>
                    </div>
                ) : activeTab === 'monthly' ? (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>Month</Th>
                                    <Th style={{ textAlign: 'right' }}>GRN Invoices</Th>
                                    <Th style={{ textAlign: 'right' }}>Tax Amount (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Total Purchase Spend (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Share %</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {monthlyTrends.length === 0 ? (
                                    <Tr><Td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No monthly data available.</Td></Tr>
                                ) : (
                                    monthlyTrends.map((m, idx) => {
                                        const share = summary.total_spend > 0 ? ((m.total_amount / summary.total_spend) * 100).toFixed(1) : 0;
                                        return (
                                            <Tr key={idx}>
                                                <Td style={{ fontWeight: '700', color: colors.primary }}>{m.month}</Td>
                                                <Td style={{ textAlign: 'right' }}>{m.grn_count}</Td>
                                                <Td style={{ textAlign: 'right' }}>₹{m.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                                    ₹{m.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Td>
                                                <Td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <div style={{ width: '80px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${share}%`, height: '100%', background: colors.primary }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{share}%</span>
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : activeTab === 'vendor' ? (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Vendor / Supplier Name</Th>
                                    <Th>Vendor ID</Th>
                                    <Th style={{ textAlign: 'right' }}>GRN Count</Th>
                                    <Th style={{ textAlign: 'right' }}>Total Purchase Spend (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Share of Total Spend</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {vendorBreakdown.length === 0 ? (
                                    <Tr><Td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No vendor data available.</Td></Tr>
                                ) : (
                                    vendorBreakdown.map((v, idx) => (
                                        <Tr key={idx}>
                                            <Td>{idx + 1}</Td>
                                            <Td style={{ fontWeight: '700', color: colors.textMain }}>{v.vendor_name}</Td>
                                            <Td style={{ color: colors.textMuted }}>{v.vendor_id}</Td>
                                            <Td style={{ textAlign: 'right' }}>{v.grn_count}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                                ₹{v.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </Td>
                                            <Td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${Math.min(100, v.share_percentage || 0)}%`, height: '100%', background: '#059669' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{v.share_percentage}%</span>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Item Name</Th>
                                    <Th>Item ID</Th>
                                    <Th style={{ textAlign: 'right' }}>Purchased Qty</Th>
                                    <Th style={{ textAlign: 'right' }}>Avg Rate (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Min Rate (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Max Rate (₹)</Th>
                                    <Th style={{ textAlign: 'right' }}>Total Spend (₹)</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {topItems.length === 0 ? (
                                    <Tr><Td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No items data available.</Td></Tr>
                                ) : (
                                    topItems.map((it, idx) => (
                                        <Tr key={idx}>
                                            <Td>{idx + 1}</Td>
                                            <Td style={{ fontWeight: '700', color: colors.primary }}>{it.item_name}</Td>
                                            <Td style={{ color: colors.textMuted }}>{it.item_id}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '600' }}>{it.total_quantity}</Td>
                                            <Td style={{ textAlign: 'right' }}>₹{it.avg_rate?.toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'right', color: '#059669' }}>₹{it.min_rate?.toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'right', color: '#dc2626' }}>₹{it.max_rate?.toFixed(2)}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                                ₹{it.total_spend?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresPurchaseAnalysisReport;
