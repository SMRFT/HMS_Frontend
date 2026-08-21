import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const PageWrapper = styled.div`
    min-height:100vh;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%);
    font-family:'Inter','Segoe UI',sans-serif;
`;
const Header = styled.div`
    background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 40px;
    display:flex;justify-content:space-between;align-items:center;
    box-shadow:0 4px 20px rgba(13,148,136,0.3);
    h1{margin:0;font-size:1.8rem;font-weight:800;color:#fff;}
    p{margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:0.9rem;}
`;
const HeaderActions = styled.div`display:flex;gap:12px;`;
const Btn = styled.button`
    padding:10px 20px;border-radius:10px;font-weight:600;font-size:0.85rem;
    cursor:pointer;border:none;transition:all 0.2s;display:flex;align-items:center;gap:6px;
    ${p => p.primary ? 'background:#fff;color:#0d9488;' : 'background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.4);'}
    &:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15);}
    &:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
`;
const StatsRow = styled.div`
    display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
    gap:18px;padding:24px 32px;animation:${fadeIn} 0.4s ease;
`;
const StatCard = styled.div`
    background:white;border-radius:14px;padding:22px;border:1px solid #e2e8f0;
    box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;
    &:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,0.08);}
    .lbl{font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
    .val{font-size:2rem;font-weight:800;margin-top:6px;}
    .sub{font-size:0.75rem;color:#94a3b8;margin-top:4px;}
`;
const FilterBar = styled.div`
    background:white;margin:0 32px 20px;padding:20px 24px;border-radius:14px;
    border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);
    display:flex;gap:16px;align-items:center;flex-wrap:wrap;
`;
const SearchInput = styled.input`
    flex:1;min-width:220px;padding:10px 16px;border:1.5px solid #e2e8f0;
    border-radius:10px;font-size:0.9rem;outline:none;transition:border 0.2s;
    &:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
`;
const TableCard = styled.div`
    margin:0 32px 32px;background:white;border-radius:16px;border:1px solid #e2e8f0;
    box-shadow:0 4px 16px rgba(0,0,0,0.06);overflow:hidden;animation:${fadeIn} 0.4s ease;
`;
const Th = styled.th`
    padding:14px 16px;font-size:0.75rem;font-weight:700;color:#475569;
    text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #e2e8f0;
    text-align:left;white-space:nowrap;background:linear-gradient(135deg,#f8fafc,#f1f5f9);
`;
const Td = styled.td`
    padding:13px 16px;font-size:0.875rem;color:#334155;
    border-bottom:1px solid #f1f5f9;vertical-align:middle;
`;
const Tr = styled.tr`
    transition:background 0.15s;
    &:hover{background:#f8fffd;}
    &:last-child td{border-bottom:none;}
`;
const ProgressWrap = styled.div`height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden;min-width:100px;`;
const ProgressFill = styled.div`
    height:100%;border-radius:99px;transition:width 0.4s ease;
    width:${p => Math.min(p.pct, 100)}%;
    background:${p => p.pct >= 90 ? '#ef4444' : p.pct >= 70 ? '#f59e0b' : '#10b981'};
`;
const QtyBadge = styled.span`
    display:inline-flex;align-items:center;justify-content:center;
    padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:700;
    background:${p => p.bg || '#e2e8f0'};color:${p => p.fg || '#334155'};
`;
const UsageInput = styled.input`
    width:80px;padding:7px 10px;border:1.5px solid #cbd5e1;border-radius:8px;
    font-size:0.875rem;font-weight:600;text-align:center;outline:none;transition:all 0.2s;
    &:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.12);}
    &:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed;}
`;
const RecordBtn = styled.button`
    padding:7px 14px;border:none;border-radius:8px;font-size:0.8rem;font-weight:700;
    white-space:nowrap;transition:all 0.2s;cursor:${p => p.disabled ? 'not-allowed' : 'pointer'};
    background:${p => p.disabled ? '#e2e8f0' : 'linear-gradient(135deg,#0d9488,#0f766e)'};
    color:${p => p.disabled ? '#94a3b8' : '#fff'};
    &:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 3px 10px rgba(13,148,136,0.3);}
`;
const EmptyState = styled.div`
    text-align:center;padding:60px 20px;color:#94a3b8;
    .icon{font-size:3rem;margin-bottom:12px;}
    .title{font-size:1.1rem;font-weight:600;color:#64748b;}
`;
const CommonSaveBar = styled.div`
    position: sticky;
    bottom: 20px;
    margin: 20px 32px;
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
    color: white;
    padding: 16px 28px;
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(13, 148, 136, 0.4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: ${fadeIn} 0.3s ease;
    z-index: 100;
`;

const LabDailyUsage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [usageMap, setUsageMap] = useState({});
    const [selected, setSelected] = useState({});
    const [savingAll, setSavingAll] = useState(false);

    useEffect(() => { loadItems(); }, []);

    const toggleSelect = (idx) => {
        setSelected(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleSelectAll = () => {
        const availableItems = filteredItems.filter(item => {
            const remaining = item.remaining_qty ?? (item.quantity - (item.used_qty || 0));
            return remaining > 0;
        });

        const selectedIdxs = Object.keys(selected).filter(idx => selected[idx]);
        if (selectedIdxs.length >= availableItems.length && availableItems.length > 0) {
            setSelected({});
        } else {
            const newSel = {};
            filteredItems.forEach((item, idx) => {
                const remaining = item.remaining_qty ?? (item.quantity - (item.used_qty || 0));
                if (remaining > 0) {
                    newSel[idx] = true;
                }
            });
            setSelected(newSel);
        }
    };

    const selectedCount = Object.values(selected).filter(Boolean).length;

    const handleSaveSelected = async () => {
        const selectedIdx = Object.keys(selected).filter(idx => selected[idx]);
        if (!selectedIdx.length) { toast.warning('Please select at least one item'); return; }

        const missingQty = selectedIdx.filter(idx => {
            const qty = parseInt(usageMap[idx] || 0);
            return !qty || qty <= 0;
        });
        if (missingQty.length) { toast.warning('Please enter a valid used quantity for every selected item'); return; }

        const bulkItems = [];
        for (const idx of selectedIdx) {
            const item = filteredItems[idx];
            const qty = parseInt(usageMap[idx] || 0);
            const remaining = item.remaining_qty ?? (item.quantity - (item.used_qty || 0));
            if (qty > remaining) {
                toast.error(`"${item.name}": cannot exceed remaining balance (${remaining})`);
                return;
            }
            bulkItems.push({
                item_id: item.item_id,
                used_qty: qty
            });
        }

        setSavingAll(true);
        const res = await apiRequest(
            `${Hmsbaseurl.replace(/\/$/, '')}/stores-stores_daily_usage_items/`, 'POST',
            { items: bulkItems, used_date: dayjs().format('YYYY-MM-DD') }
        );
        setSavingAll(false);

        if (res.success) {
            toast.success(`Recorded usage for ${bulkItems.length} item(s)`);
            setUsageMap({});
            setSelected({});
            loadItems();
        } else {
            toast.error(res.error || (res.data && res.data.error) || 'Failed to record usage');
        }
    };

    const handleSaveSingle = async (idx) => {
        const item = filteredItems[idx];
        const qty = parseInt(usageMap[idx] || 0);
        if (!qty || qty <= 0) {
            toast.warning('Please enter a valid used quantity');
            return;
        }
        const remaining = item.remaining_qty ?? (item.quantity - (item.used_qty || 0));
        if (qty > remaining) {
            toast.error(`"${item.name}": cannot exceed remaining balance (${remaining})`);
            return;
        }

        setSavingAll(true);
        const res = await apiRequest(
            `${Hmsbaseurl.replace(/\/$/, '')}/stores-stores_daily_usage_items/`, 'POST',
            { item_id: item.item_id, used_qty: qty, used_date: dayjs().format('YYYY-MM-DD') }
        );
        setSavingAll(false);

        if (res.success) {
            toast.success(`Recorded usage for ${item.name}`);
            setUsageMap(prev => {
                const copy = { ...prev };
                delete copy[idx];
                return copy;
            });
            setSelected(prev => {
                const copy = { ...prev };
                delete copy[idx];
                return copy;
            });
            loadItems();
        } else {
            toast.error(`${(res.data && res.data.error) || res.error || 'Failed to record usage'}`);
        }
    };

    const loadItems = async () => {
        setLoading(true);
        const res = await apiRequest(
            `${Hmsbaseurl.replace(/\/$/, '')}/stores-get_stores_lab_approved_items/`, 'GET'
        );
        if (res.success) setItems(res.data || []);
        else toast.error('Failed to load lab approved items');
        setLoading(false);
    };

    const handleExportExcel = () => {
        if (!filteredItems.length) return toast.info('No data to export');
        const rows = filteredItems.map(it => ({
            'Item ID': it.item_id, 'Name': it.name, 'HSN': it.hsn || '-',
            'Approved Qty': it.quantity, 'Used Qty': it.used_qty || 0,
            'Remaining Qty': it.remaining_qty ?? (it.quantity - (it.used_qty || 0)),
            'Created Date': it.created_date ? dayjs(it.created_date).format('DD/MM/YYYY') : '-'
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lab Daily Usage');
        ws['!cols'] = [20, 30, 12, 15, 12, 14, 16].map(wch => ({ wch }));
        XLSX.writeFile(wb, `Lab_Daily_Usage_${dayjs().format('DDMMYYYY')}.xlsx`);
    };

    const filteredItems = items.filter(it => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (it.name || '').toLowerCase().includes(q) ||
            (it.item_id || '').toLowerCase().includes(q) ||
            (it.hsn || '').toLowerCase().includes(q);
    });

    const totalApproved = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const totalUsed = items.reduce((s, i) => s + (i.used_qty || 0), 0);
    const totalRemaining = items.reduce((s, i) => s + (i.remaining_qty ?? 0), 0);
    const pct = (item) => Math.round(((item.used_qty || 0) / (item.quantity || 1)) * 100);

    const availableCount = filteredItems.filter(i => (i.remaining_qty ?? (i.quantity - (i.used_qty || 0))) > 0).length;

    return (
        <PageWrapper>
            <Header>
                <div>
                    <h1>🧪 Lab Daily Usage</h1>
                    <p>Track and record daily consumption of lab-approved store items</p>
                </div>
                <HeaderActions>
                    <Btn onClick={handleExportExcel}>📥 Export Excel</Btn>
                    <Btn primary onClick={loadItems} disabled={loading}>
                        🔄 {loading ? 'Loading...' : 'Refresh'}
                    </Btn>
                    <Btn primary onClick={handleSaveSelected} disabled={savingAll || selectedCount === 0}>
                        💾 {savingAll ? 'Saving...' : `Common Save${selectedCount ? ` (${selectedCount})` : ''}`}
                    </Btn>
                </HeaderActions>
            </Header>

            <StatsRow>
                <StatCard>
                    <div className="lbl">Total Items</div>
                    <div className="val" style={{ color: '#0d9488' }}>{items.length}</div>
                    <div className="sub">Lab approved records</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Total Approved Qty</div>
                    <div className="val" style={{ color: '#1d4ed8' }}>{totalApproved}</div>
                    <div className="sub">Across all items</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Total Used</div>
                    <div className="val" style={{ color: '#f59e0b' }}>{totalUsed}</div>
                    <div className="sub">Consumed so far</div>
                </StatCard>
                <StatCard>
                    <div className="lbl">Remaining Balance</div>
                    <div className="val" style={{ color: '#10b981' }}>{totalRemaining}</div>
                    <div className="sub">Available to use</div>
                </StatCard>
            </StatsRow>

            <FilterBar>
                <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>🔍 Search</span>
                <SearchInput
                    placeholder="Search by name, item ID or HSN..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button onClick={() => setSearch('')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9',
                            border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, color: '#64748b'
                        }}>
                        ✕ Clear
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                    Showing {filteredItems.length} of {items.length} items
                </span>
            </FilterBar>

            <TableCard>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <Th style={{ width: 40, textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={availableCount > 0 && selectedCount >= availableCount}
                                    onChange={toggleSelectAll}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                    title="Select / Deselect All"
                                />
                            </Th>
                            <Th>#</Th><Th>Item Details</Th><Th>HSN</Th>
                            <Th>Approved Qty</Th><Th>Used Qty</Th><Th>Remaining</Th>
                            <Th>Usage Progress</Th><Th>Enter Used Qty</Th><Th>Action</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="10" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic' }}>
                                ⏳ Loading items...
                            </td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="10">
                                <EmptyState>
                                    <div className="icon">🧪</div>
                                    <div className="title">No lab approved items found</div>
                                    <div className="sub">{search ? 'Try clearing the search filter' : 'Items approved from DEPT002 will appear here'}</div>
                                </EmptyState>
                            </td></tr>
                        ) : filteredItems.map((item, idx) => {
                            const used = item.used_qty || 0;
                            const remaining = item.remaining_qty ?? (item.quantity - used);
                            const p = pct(item);
                            const isFull = remaining <= 0;
                            const inputVal = usageMap[idx] !== undefined ? usageMap[idx] : '';
                            const isChecked = !!selected[idx];
                            return (
                                <Tr key={idx}>
                                    <Td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isFull}
                                            onChange={() => toggleSelect(idx)}
                                            style={{ width: 16, height: 16, cursor: isFull ? 'not-allowed' : 'pointer' }}
                                        />
                                    </Td>
                                    <Td style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</Td>
                                    <Td>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{item.item_id}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {item.created_date ? dayjs(item.created_date).format('DD/MM/YYYY') : ''}
                                        </div>
                                    </Td>
                                    <Td><QtyBadge bg="#f1f5f9" fg="#475569">{item.hsn || '—'}</QtyBadge></Td>
                                    <Td><QtyBadge bg="#eff6ff" fg="#1d4ed8">{item.quantity}</QtyBadge></Td>
                                    <Td><QtyBadge bg="#fffbeb" fg="#b45309">{used}</QtyBadge></Td>
                                    <Td>
                                        <QtyBadge bg={isFull ? '#fef2f2' : '#f0fdf4'} fg={isFull ? '#ef4444' : '#16a34a'}>
                                            {remaining}
                                        </QtyBadge>
                                    </Td>
                                    <Td>
                                        <ProgressWrap><ProgressFill pct={p} /></ProgressWrap>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4, display: 'block' }}>{p}% used</span>
                                    </Td>
                                    <Td>
                                        <UsageInput
                                            type="number" min="1" max={remaining} placeholder="Qty"
                                            value={inputVal} disabled={isFull}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setUsageMap(prev => ({ ...prev, [idx]: val }));
                                                if (parseInt(val) > 0) {
                                                    setSelected(prev => ({ ...prev, [idx]: true }));
                                                }
                                            }}
                                        />
                                    </Td>
                                    <Td>
                                        <RecordBtn
                                            disabled={isFull || !inputVal || savingAll}
                                            onClick={() => handleSaveSingle(idx)}
                                        >
                                            {savingAll ? 'Saving...' : 'Save'}
                                        </RecordBtn>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </tbody>
                </table>
            </TableCard>

            {selectedCount > 0 && (
                <CommonSaveBar>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                            💾 Common Save Bar — {selectedCount} item(s) selected
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: 3 }}>
                            Click "Common Save" to record daily usage for all selected rows simultaneously.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => setSelected({})}
                            style={{
                                padding: '9px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={handleSaveSelected}
                            disabled={savingAll}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', background: '#fff', color: '#0d9488',
                                border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: savingAll ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            💾 {savingAll ? 'Saving All...' : `Common Save (${selectedCount})`}
                        </button>
                    </div>
                </CommonSaveBar>
            )}
        </PageWrapper>
    );
};

export default LabDailyUsage;