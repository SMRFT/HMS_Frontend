import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const PageWrapper = styled.div`
    min-height:100vh;
    background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%);
    font-family:'Inter','Segoe UI',sans-serif;
    padding-bottom: 40px;
`;

const Header = styled.div`
    background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);
    padding:28px 40px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    box-shadow:0 4px 20px rgba(13,148,136,0.3);
    flex-wrap: wrap;
    gap: 16px;
    h1{margin:0;font-size:1.8rem;font-weight:800;color:#fff;}
    p{margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;}
`;

const HeaderActions = styled.div`
    display:flex;
    gap:12px;
    align-items: center;
    flex-wrap: wrap;
`;

const Btn = styled.button`
    padding:10px 20px;
    border-radius:10px;
    font-weight:600;
    font-size:0.85rem;
    cursor:pointer;
    border:none;
    transition:all 0.2s;
    display:flex;
    align-items:center;
    gap:6px;
    ${p => p.primary
        ? 'background:#fff;color:#0d9488;'
        : p.secondary
            ? 'background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;'
            : 'background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.4);'}
    &:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15);}
    &:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
`;

const StatsRow = styled.div`
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:18px;
    padding:24px 32px;
    animation:${fadeIn} 0.4s ease;
`;

const StatCard = styled.div`
    background:white;
    border-radius:14px;
    padding:22px;
    border:1px solid #e2e8f0;
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
    transition:all 0.2s;
    &:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,0.08);}
    .lbl{font-size:0.75rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;}
    .val{font-size:2rem;font-weight:800;margin-top:6px;}
    .sub{font-size:0.75rem;color:#94a3b8;margin-top:4px;}
`;

const FilterCard = styled.div`
    background:white;
    margin:0 32px 20px;
    padding:20px 24px;
    border-radius:14px;
    border:1px solid #e2e8f0;
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
    display:flex;
    flex-direction: column;
    gap:16px;
`;

const FilterRow = styled.div`
    display:flex;
    gap:16px;
    align-items:center;
    flex-wrap:wrap;
`;

const FormGroup = styled.div`
    display:flex;
    flex-direction:column;
    gap:6px;
    label{font-size:0.8rem;font-weight:700;color:#475569;}
`;

const DateInput = styled.input`
    padding:9px 14px;
    border:1.5px solid #cbd5e1;
    border-radius:10px;
    font-size:0.875rem;
    font-weight:600;
    color:#1e293b;
    outline:none;
    transition:border 0.2s;
    &:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.12);}
`;

const SearchInput = styled.input`
    flex:1;
    min-width:240px;
    padding:10px 16px;
    border:1.5px solid #cbd5e1;
    border-radius:10px;
    font-size:0.9rem;
    outline:none;
    transition:border 0.2s;
    &:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.12);}
`;

const PresetBtn = styled.button`
    padding:7px 14px;
    border-radius:8px;
    font-size:0.78rem;
    font-weight:600;
    cursor:pointer;
    border:1px solid ${p => p.active ? '#0d9488' : '#e2e8f0'};
    background:${p => p.active ? '#f0fdf4' : '#ffffff'};
    color:${p => p.active ? '#0d9488' : '#475569'};
    transition:all 0.15s;
    &:hover{border-color:#0d9488;color:#0d9488;}
`;

const ViewToggleBtn = styled.button`
    padding:8px 16px;
    border-radius:8px;
    font-size:0.82rem;
    font-weight:700;
    cursor:pointer;
    border:1.5px solid ${p => p.active ? '#0d9488' : '#cbd5e1'};
    background:${p => p.active ? '#0d9488' : '#fff'};
    color:${p => p.active ? '#fff' : '#475569'};
    transition:all 0.2s;
`;

const TableCard = styled.div`
    margin:0 32px 32px;
    background:white;
    border-radius:16px;
    border:1px solid #e2e8f0;
    box-shadow:0 4px 16px rgba(0,0,0,0.06);
    overflow:hidden;
    animation:${fadeIn} 0.4s ease;
`;

const Th = styled.th`
    padding:14px 16px;
    font-size:0.75rem;
    font-weight:700;
    color:#475569;
    text-transform:uppercase;
    letter-spacing:0.06em;
    border-bottom:2px solid #e2e8f0;
    text-align:left;
    white-space:nowrap;
    background:linear-gradient(135deg,#f8fafc,#f1f5f9);
`;

const Td = styled.td`
    padding:13px 16px;
    font-size:0.875rem;
    color:#334155;
    border-bottom:1px solid #f1f5f9;
    vertical-align:middle;
`;

const Tr = styled.tr`
    transition:background 0.15s;
    &:hover{background:#f8fffd;}
    &:last-child td{border-bottom:none;}
`;

const Badge = styled.span`
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:4px 12px;
    border-radius:20px;
    font-size:0.78rem;
    font-weight:700;
    background:${p => p.bg || '#f1f5f9'};
    color:${p => p.fg || '#334155'};
`;

const UserTag = styled.div`
    display:inline-flex;
    flex-direction:column;
    .name{font-weight:700;color:#0d9488;font-size:0.85rem;}
    .id{font-size:0.72rem;color:#64748b;}
`;

const GroupedDateCard = styled.div`
    margin:0 32px 20px;
    background:white;
    border-radius:14px;
    border:1px solid #e2e8f0;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    overflow:hidden;
    animation:${fadeIn} 0.3s ease;
`;

const GroupHeader = styled.div`
    padding:16px 24px;
    background:linear-gradient(135deg,#f8fafc,#f1f5f9);
    border-bottom:1px solid #e2e8f0;
    display:flex;
    justify-content:space-between;
    align-items:center;
    cursor:pointer;
    .date-title{font-weight:800;font-size:1.05rem;color:#0f766e;display:flex;align-items:center;gap:8px;}
    .meta{font-size:0.82rem;color:#64748b;font-weight:600;}
`;

const EmptyState = styled.div`
    text-align:center;
    padding:60px 20px;
    color:#94a3b8;
    .icon{font-size:3.5rem;margin-bottom:12px;}
    .title{font-size:1.15rem;font-weight:700;color:#64748b;}
    .sub{font-size:0.85rem;margin-top:6px;}
`;

const LabInventoryReport = () => {
    const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [flattenedItems, setFlattenedItems] = useState([]);
    const [activePreset, setActivePreset] = useState('7days');
    const [viewMode, setViewMode] = useState('flat'); // 'flat' or 'grouped'
    const [expandedDates, setExpandedDates] = useState({});

    const fetchReport = async (fDate = fromDate, tDate = toDate) => {
        setLoading(true);
        try {
            let url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-stores_daily_usage_report/`;
            const params = [];
            if (fDate) params.push(`from_date=${fDate}`);
            if (tDate) params.push(`to_date=${tDate}`);
            if (params.length) url += `?${params.join('&')}`;

            const res = await apiRequest(url, 'GET');
            if (res.success) {
                const reports = res.data?.reports || res.reports || [];
                const items = res.data?.flattened_items || res.flattened_items || [];
                setReportData(reports);
                setFlattenedItems(items);
            } else {
                toast.error(res.error || (res.data && (res.data.details || res.data.message || res.data.error)) || 'Failed to fetch usage report');
            }
        } catch (err) {
            toast.error('An error occurred while fetching report data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(fromDate, toDate);
    }, []);

    const handlePresetChange = (preset) => {
        setActivePreset(preset);
        let fDate = '';
        let tDate = dayjs().format('YYYY-MM-DD');

        if (preset === 'today') {
            fDate = dayjs().format('YYYY-MM-DD');
        } else if (preset === 'yesterday') {
            fDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
            tDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        } else if (preset === '7days') {
            fDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        } else if (preset === 'month') {
            fDate = dayjs().startOf('month').format('YYYY-MM-DD');
        } else if (preset === 'all') {
            fDate = '';
            tDate = '';
        }

        setFromDate(fDate);
        setToDate(tDate);
        fetchReport(fDate, tDate);
    };

    const handleSearchClick = () => {
        fetchReport(fromDate, toDate);
    };

    const toggleExpandDate = (idx) => {
        setExpandedDates(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const filteredItems = flattenedItems.filter(it => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (it.name || '').toLowerCase().includes(q) ||
            (it.item_id || '').toLowerCase().includes(q) ||
            (it.hsn || '').toLowerCase().includes(q) ||
            (it.created_by_name || '').toLowerCase().includes(q) ||
            (it.created_by || '').toLowerCase().includes(q) ||
            (it.date || '').toLowerCase().includes(q);
    });

    const totalUsedQty = filteredItems.reduce((s, i) => s + (parseInt(i.used_qty) || 0), 0);
    const uniqueEmployees = Array.from(new Set(filteredItems.map(i => i.created_by_name || i.created_by))).filter(Boolean);
    const uniqueDates = Array.from(new Set(filteredItems.map(i => i.date))).filter(Boolean);

    const handleExportExcel = () => {
        if (!filteredItems.length) {
            toast.info('No usage records to export');
            return;
        }
        const rows = filteredItems.map((it, idx) => ({
            'S.No': idx + 1,
            'Usage Date': it.date || '-',
            'Item ID': it.item_id || '-',
            'Item Name': it.name || '-',
            'HSN Code': it.hsn || '-',
            'Used Quantity': it.used_qty || 0,
            'Recorded By (Name)': it.created_by_name || '-',
            'Employee ID': it.created_by || '-',
            'Branch Code': it.branch_code || '-',
            'Hospital Code': it.hospital_code || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lab Daily Usage Report');
        ws['!cols'] = [8, 14, 20, 30, 12, 15, 25, 15, 15, 15].map(wch => ({ wch }));

        const fileName = `Lab_Usage_Report_${fromDate || 'All'}_to_${toDate || 'All'}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <PageWrapper>
            <Header>
                <div>
                    <h1>📊 Lab Inventory Usage Report</h1>
                    <p>Date-wise daily item consumption records & recorded user tracking</p>
                </div>
                <HeaderActions>
                    <Btn onClick={handleExportExcel}>📥 Export Excel</Btn>
                    <Btn primary onClick={() => fetchReport(fromDate, toDate)} disabled={loading}>
                        🔄 {loading ? 'Loading...' : 'Refresh Report'}
                    </Btn>
                </HeaderActions>
            </Header>

            <StatsRow>
                <StatCard>
                    <div className="lbl">Total Items Used</div>
                    <div className="val" style={{ color: '#0d9488' }}>{filteredItems.length}</div>
                    <div className="sub">Recorded usage entries</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Total Quantity Consumed</div>
                    <div className="val" style={{ color: '#1d4ed8' }}>{totalUsedQty}</div>
                    <div className="sub">Units used in selected period</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Recorded Staff Members</div>
                    <div className="val" style={{ color: '#f59e0b' }}>{uniqueEmployees.length}</div>
                    <div className="sub">Unique employees recorded</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Active Usage Days</div>
                    <div className="val" style={{ color: '#10b981' }}>{uniqueDates.length}</div>
                    <div className="sub">Days with consumption data</div>
                </StatCard>
            </StatsRow>

            <FilterCard>
                <FilterRow>
                    <FormGroup>
                        <label>📅 From Date</label>
                        <DateInput
                            type="date"
                            value={fromDate}
                            onChange={e => { setFromDate(e.target.value); setActivePreset('custom'); }}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>📅 To Date</label>
                        <DateInput
                            type="date"
                            value={toDate}
                            onChange={e => { setToDate(e.target.value); setActivePreset('custom'); }}
                        />
                    </FormGroup>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Btn secondary onClick={handleSearchClick} disabled={loading}>
                            🔍 Apply Filter
                        </Btn>
                    </div>
                </FilterRow>

                <FilterRow>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>⚡ Quick Presets:</span>
                    <PresetBtn active={activePreset === 'today'} onClick={() => handlePresetChange('today')}>Today</PresetBtn>
                    <PresetBtn active={activePreset === 'yesterday'} onClick={() => handlePresetChange('yesterday')}>Yesterday</PresetBtn>
                    <PresetBtn active={activePreset === '7days'} onClick={() => handlePresetChange('7days')}>Last 7 Days</PresetBtn>
                    <PresetBtn active={activePreset === 'month'} onClick={() => handlePresetChange('month')}>This Month</PresetBtn>
                    <PresetBtn active={activePreset === 'all'} onClick={() => handlePresetChange('all')}>All Time</PresetBtn>
                </FilterRow>

                <FilterRow>
                    <SearchInput
                        placeholder="Search by item name, item ID, HSN, or employee name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9',
                                border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, color: '#64748b'
                            }}
                        >
                            ✕ Clear Search
                        </button>
                    )}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <ViewToggleBtn active={viewMode === 'flat'} onClick={() => setViewMode('flat')}>
                            📋 Detailed List View
                        </ViewToggleBtn>
                        <ViewToggleBtn active={viewMode === 'grouped'} onClick={() => setViewMode('grouped')}>
                            📂 Grouped Date View
                        </ViewToggleBtn>
                    </div>
                </FilterRow>
            </FilterCard>

            {viewMode === 'flat' ? (
                <TableCard>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <Th>#</Th>
                                <Th>Date</Th>
                                <Th>Item Details</Th>
                                <Th>HSN</Th>
                                <Th>Used Qty</Th>
                                <Th>Recorded By (Employee Name)</Th>

                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
                                        ⏳ Loading lab usage report...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <EmptyState>
                                            <div className="icon">📊</div>
                                            <div className="title">No daily lab usage records found</div>
                                            <div className="sub">Try adjusting date filters or search terms</div>
                                        </EmptyState>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <Tr key={idx}>
                                        <Td style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</Td>
                                        <Td style={{ fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap' }}>
                                            🗓️ {item.date}
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>ID: {item.item_id}</div>
                                        </Td>
                                        <Td>
                                            <Badge bg="#f1f5f9" fg="#475569">{item.hsn || '—'}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge bg="#fffbeb" fg="#b45309" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                                                📦 {item.used_qty}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <UserTag>
                                                <div className="name">👤 {item.created_by_name || item.created_by || 'System'}</div>
                                                <div className="id">Employee ID: {item.created_by || 'N/A'}</div>
                                            </UserTag>
                                        </Td>

                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </TableCard>
            ) : (
                <div>
                    {loading ? (
                        <TableCard style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
                            ⏳ Loading grouped date report...
                        </TableCard>
                    ) : reportData.length === 0 ? (
                        <TableCard>
                            <EmptyState>
                                <div className="icon">📊</div>
                                <div className="title">No daily lab usage records found</div>
                                <div className="sub">Try adjusting date filters or search terms</div>
                            </EmptyState>
                        </TableCard>
                    ) : (
                        reportData.map((group, gIdx) => {
                            const isExpanded = expandedDates[gIdx] !== false; // Default expanded
                            const items = group.items || [];
                            const totalQty = items.reduce((s, i) => s + (parseInt(i.used_qty) || 0), 0);

                            return (
                                <GroupedDateCard key={gIdx}>
                                    <GroupHeader onClick={() => toggleExpandDate(gIdx)}>
                                        <div className="date-title">
                                            <span>{isExpanded ? '🔽' : '▶️'}</span>
                                            <span>🗓️ Usage Date: {group.record_date}</span>
                                        </div>
                                        <div className="meta" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <span>🏢 Branch: <strong>{group.branch_code || 'SHB001'}</strong></span>
                                            <span>📦 {items.length} Item(s) Used</span>
                                            <span>Total Qty: <strong>{totalQty}</strong></span>
                                            <span style={{ color: '#0d9488' }}>
                                                👤 Recorded By: <strong>{group.created_by_name || group.created_by}</strong>
                                            </span>
                                        </div>
                                    </GroupHeader>

                                    {isExpanded && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <Th>#</Th>
                                                    <Th>Item Details</Th>
                                                    <Th>HSN</Th>
                                                    <Th>Used Qty</Th>
                                                    <Th>Recorded By (Employee Name)</Th>
                                                    <Th>Branch / Hospital</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => (
                                                    <Tr key={idx}>
                                                        <Td style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</Td>
                                                        <Td>
                                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>ID: {item.item_id}</div>
                                                        </Td>
                                                        <Td><Badge bg="#f1f5f9" fg="#475569">{item.hsn || '—'}</Badge></Td>
                                                        <Td><Badge bg="#fffbeb" fg="#b45309">📦 {item.used_qty}</Badge></Td>
                                                        <Td>
                                                            <UserTag>
                                                                <div className="name">👤 {item.created_by_name || item.created_by}</div>
                                                                <div className="id">Employee ID: {item.created_by}</div>
                                                            </UserTag>
                                                        </Td>
                                                        <Td>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <Badge bg="#e0f2fe" fg="#0369a1" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                                                                    🏢 {item.branch_code || group.branch_code || localStorage.getItem('selected_branch') || 'SHB001'}
                                                                </Badge>
                                                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, paddingLeft: '2px' }}>
                                                                    🏥 {item.hospital_code || group.hospital_code || 'SH001'}
                                                                </span>
                                                            </div>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </GroupedDateCard>
                            );
                        })
                    )}
                </div>
            )}
        </PageWrapper>
    );
};

export default LabInventoryReport;
