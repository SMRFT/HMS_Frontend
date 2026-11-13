import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { 
    Layers, RefreshCw, Download, Printer, 
    Search, ArrowLeft, Filter, Package
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
import { SCOPE_OPTIONS, getStoredScope, setStoredScope, formatCurrency, printDrugReport } from './drugReportHelper';

const DrugPreviousDayStockReport = () => {
    const navigate = useNavigate();
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [scope, setScope] = useState(getStoredScope() || 'IP PHARMACY');
    const [selectedDate, setSelectedDate] = useState(yesterday);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState({
        total_active_batches: 0,
        total_stock_units: 0,
        total_stock_valuation: 0
    });
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        fetchStockReport();
    }, [scope, selectedDate]);

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        setStoredScope(newScope);
    };

    const fetchStockReport = async () => {
        try {
            setLoading(true);
            const query = [
                `scope=${encodeURIComponent(scope)}`,
                `date=${selectedDate}`
            ];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = `?${query.join('&')}`;
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/drug-previous-day-stock-report/${queryString}`);
            if (res && res.success) {
                const payload = res.data?.data ? res.data : (res.data ? res : {});
                const list = Array.isArray(payload.data) ? payload.data : [];
                setStockData(list);
                if (payload.summary) setSummary(payload.summary);
            } else {
                setStockData([]);
            }
        } catch (err) {
            console.error('Error fetching Drug Stock report:', err);
            setStockData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!stockData || stockData.length === 0) return;
        const wb = XLSX.utils.book_new();
        const wsData = XLSX.utils.json_to_sheet(stockData.map((s, i) => ({
            'S.No': i + 1,
            'Medicine Name': s.item_name || '',
            'Batch Number': s.batch_number || '',
            'Expiry Date': s.expiry_date || '',
            'Opening Stock': s.opening_stock || 0,
            'Inward (GRN)': s.inward_grn || 0,
            'Outward (Dispensed)': s.outward_dispensed || 0,
            'Closing Stock': s.closing_stock || 0,
            'Unit Cost (₹)': s.unit_cost || 0,
            'Total Valuation (₹)': s.total_valuation || 0,
            'Outlet Scope': s.scope || scope
        })));
        XLSX.utils.book_append_sheet(wb, wsData, 'DailyStockReport');
        XLSX.writeFile(wb, `Drug_Daily_Stock_${scope.replace(/\s+/g, '_')}_${selectedDate}.xlsx`);
    };

    const handlePrint = () => {
        printDrugReport({
            title: `DAILY / PREVIOUS DAY STOCK REPORT (${scope})`,
            fromDate: selectedDate,
            toDate: selectedDate,
            scope,
            columns: [
                { key: 'sno', label: 'S/No', width: '45px' },
                { key: 'item_name', label: 'Medicine Name' },
                { key: 'batch_number', label: 'Batch No', width: '100px' },
                { key: 'expiry_date', label: 'Expiry', width: '90px' },
                { key: 'opening_stock', label: 'Opening', width: '80px', align: 'right' },
                { key: 'inward_grn', label: 'Inward', width: '80px', align: 'right' },
                { key: 'outward_dispensed', label: 'Outward', width: '80px', align: 'right' },
                { key: 'closing_stock', label: 'Closing', width: '80px', align: 'right' },
                { key: 'unit_cost', label: 'Unit Cost (₹)', width: '95px', align: 'right' },
                { key: 'total_valuation', label: 'Valuation (₹)', width: '110px', align: 'right' }
            ],
            data: stockData,
            summary
        });
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button 
                                onClick={() => navigate('/DrugPurchaseReportsDashboard')}
                                style={{ background: '#ffffff', color: '#334155', border: '1.5px solid #cbd5e1', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <ArrowLeft size={16} /> Back
                            </Button>
                            <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Layers size={28} color={colors.primary} /> Previous Day / Daily Stock Report
                            </h1>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Daily inventory ledger balance tracking opening stock, goods received, patient dispensations, and closing valuations.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Filter size={14} color="#059669" /> OUTLET SCOPE
                        </label>
                        <Select 
                            value={scope} 
                            onChange={e => handleScopeChange(e.target.value)} 
                            style={{ width: '100%', fontWeight: '700', color: '#059669', borderColor: '#059669' }}
                        >
                            {SCOPE_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ flex: '1 1 170px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>LEDGER DATE</label>
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SEARCH MEDICINE / BATCH</label>
                        <Input 
                            type="text" 
                            placeholder="Medicine name, batch no..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }} 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            onClick={fetchStockReport} 
                            style={{ background: colors.primary, color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={16} /> Filter
                        </Button>
                        <Button 
                            onClick={() => { setSelectedDate(yesterday); setSearchTerm(''); setTimeout(fetchStockReport, 50); }} 
                            title="Reset filters"
                            style={{ background: '#f1f5f9', color: '#475569', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Key Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #059669', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL STOCK VALUATION</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(summary.total_stock_valuation || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Active batch inventory value
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL STOCK UNITS</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                            {(summary.total_stock_units || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Units in stock
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>ACTIVE BATCHES</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                            {summary.total_active_batches || 0}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: '4px' }}>
                            Distinct pharmaceutical batches
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ background: '#ffffff', padding: '60px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                        <p style={{ marginTop: '12px', fontWeight: '700', color: colors.textMuted }}>Compiling Stock Ledger for {selectedDate}...</p>
                    </div>
                ) : stockData.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <Package size={44} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: '700' }}>No Stock Records Found</h3>
                        <p style={{ margin: '6px 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
                            No stock balances recorded for date {selectedDate}.
                        </p>
                    </div>
                ) : (
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>
                                    <Th style={{ width: '45px', textAlign: 'center', padding: '12px 10px' }}>S.NO</Th>
                                    <Th style={{ minWidth: '220px', padding: '12px 10px' }}>MEDICINE NAME</Th>
                                    <Th style={{ minWidth: '120px', padding: '12px 10px' }}>BATCH NO</Th>
                                    <Th style={{ minWidth: '100px', padding: '12px 10px' }}>EXPIRY</Th>
                                    <Th style={{ minWidth: '95px', textAlign: 'right', padding: '12px 10px' }}>OPENING</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>INWARD</Th>
                                    <Th style={{ minWidth: '90px', textAlign: 'right', padding: '12px 10px' }}>OUTWARD</Th>
                                    <Th style={{ minWidth: '95px', textAlign: 'right', padding: '12px 10px' }}>CLOSING</Th>
                                    <Th style={{ minWidth: '110px', textAlign: 'right', padding: '12px 10px' }}>UNIT COST (₹)</Th>
                                    <Th style={{ minWidth: '130px', textAlign: 'right', padding: '12px 10px' }}>VALUATION (₹)</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {stockData.map((s, idx) => (
                                    <Tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfcfd' : '#ffffff' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{s.sno || idx + 1}</Td>
                                        <Td style={{ fontWeight: '700', color: '#0f172a' }}>{s.item_name || 'N/A'}</Td>
                                        <Td style={{ color: '#475569', fontSize: '0.85rem' }}><code>{s.batch_number || '-'}</code></Td>
                                        <Td style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.expiry_date || '-'}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(s.opening_stock || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#059669', fontWeight: '600' }}>+{(s.inward_grn || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#dc2626', fontWeight: '600' }}>-{(s.outward_dispensed || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{(s.closing_stock || 0).toLocaleString()}</Td>
                                        <Td style={{ textAlign: 'right', color: '#475569' }}>{(s.unit_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                            {formatCurrency(s.total_valuation || 0)}
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                )}
            </Container>
        </PageWrapper>
    );
};

export default DrugPreviousDayStockReport;
