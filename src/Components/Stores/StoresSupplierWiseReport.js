import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import { 
    Building2, Phone, Mail, MapPin, Search, RefreshCw, 
    Download, CheckCircle, Clock, Package, DollarSign
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
    colors
} from '../GlobalStyles';

const StoresSupplierWiseReport = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [supplierData, setSupplierData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState({
        total_suppliers: 0,
        grand_total_purchases: 0,
        grand_total_paid: 0,
        grand_total_pending: 0
    });

    useEffect(() => {
        fetchSupplierReport();
    }, []);

    const fetchSupplierReport = async () => {
        try {
            setLoading(true);
            let query = [];
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-supplier-wise-report/${queryString}`);
            if (res && res.success) {
                setSupplierData(res.data.data || []);
                setSummary(res.data.summary || {});
            } else {
                setSupplierData([]);
            }
        } catch (err) {
            console.error("Error fetching supplier report:", err);
            setSupplierData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!supplierData || supplierData.length === 0) return;
        const excelData = supplierData.map(s => ({
            'Vendor ID': s.vendor_id,
            'Vendor Name': s.vendor_name,
            'Type': s.vendor_type,
            'Contact Person': s.contact_person,
            'Phone': s.phone,
            'Email': s.email,
            'City': s.city,
            'GSTIN': s.gstin,
            'Payment Terms': s.payment_terms,
            'Total GRNs': s.total_grns,
            'Total Purchases (₹)': s.total_purchase_amount,
            'Total Paid (₹)': s.total_paid,
            'Pending Balance (₹)': s.pending_amount,
            'Last Purchase Date': s.last_purchase_date || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
        XLSX.writeFile(wb, `Stores_Supplier_Wise_List_${today}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Building2 size={28} color={colors.primary} /> Supplier Wise List & Purchase Report
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Complete directory of vendors, contact details, total purchases, payments, and outstanding balances.
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
                    <div style={{ flex: '1 1 300px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search Supplier Name, Phone, Email, GSTIN</label>
                        <Input 
                            type="text" 
                            placeholder="Supplier name, contact, GSTIN..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchSupplierReport} style={{ background: colors.primary, color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Filter
                        </Button>
                        <Button onClick={() => { setSearchTerm(''); setTimeout(fetchSupplierReport, 50); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Summary Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL REGISTERED SUPPLIERS</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: colors.primary, marginTop: '4px' }}>{summary.total_suppliers || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL PURCHASES</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                            ₹{(summary.grand_total_purchases || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>TOTAL PAID</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                            ₹{(summary.grand_total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: '700' }}>PENDING OUTSTANDING</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>
                            ₹{(summary.grand_total_pending || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Suppliers Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Supplier Profile</Th>
                                <Th>Contact Info</Th>
                                <Th>GSTIN / Terms</Th>
                                <Th style={{ textAlign: 'right' }}>GRNs</Th>
                                <Th style={{ textAlign: 'right' }}>Total Purchases</Th>
                                <Th style={{ textAlign: 'right', color: '#059669' }}>Total Paid</Th>
                                <Th style={{ textAlign: 'right', color: '#dc2626' }}>Pending Balance</Th>
                                <Th>Last Purchase</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Loading Supplier Directory & Ledger...</p>
                                    </Td>
                                </Tr>
                            ) : supplierData.length === 0 ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No suppliers found matching the filter criteria.
                                    </Td>
                                </Tr>
                            ) : (
                                supplierData.map((s, idx) => (
                                    <Tr key={s.vendor_id}>
                                        <Td>{idx + 1}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '700', color: colors.textMain, fontSize: '0.95rem' }}>{s.vendor_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {s.vendor_id} | Type: {s.vendor_type}</div>
                                            {s.city && <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>City: {s.city}, {s.state}</div>}
                                        </Td>
                                        <Td>
                                            {s.phone && <div style={{ fontSize: '0.8rem' }}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> {s.phone}</div>}
                                            {s.email && <div style={{ fontSize: '0.8rem', color: colors.textMuted }}><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> {s.email}</div>}
                                            {s.contact_person && <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Contact: {s.contact_person}</div>}
                                        </Td>
                                        <Td>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{s.gstin || '-'}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Terms: {s.payment_terms || 'Standard'}</div>
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '600' }}>{s.total_grns}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.textMain }}>
                                            ₹{s.total_purchase_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                                            ₹{s.total_paid?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: s.pending_amount > 0 ? '#dc2626' : '#059669' }}>
                                            ₹{s.pending_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </Td>
                                        <Td style={{ fontSize: '0.85rem' }}>{s.last_purchase_date || 'No Orders'}</Td>
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

export default StoresSupplierWiseReport;
