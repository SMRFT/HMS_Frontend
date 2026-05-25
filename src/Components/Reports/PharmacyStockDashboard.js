import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import {
    Package, AlertTriangle, ShieldAlert, TrendingDown, TrendingUp,
    RefreshCw, ExternalLink, ArrowRight, Activity, Pill,
    Boxes, BarChart2, Clock, Truck
} from "lucide-react";

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(145deg, #f0f4ff 0%, #f8fafc 50%, #f0fdf4 100%);
  padding: 28px 28px 60px;
  font-family: 'Inter', -apple-system, sans-serif;
  @media (max-width: 768px) { padding: 16px 12px 40px; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;

  .title-block h1 {
    font-size: 1.75rem;
    font-weight: 850;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.5px;
  }
  .title-block p {
    margin: 4px 0 0 0;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .actions { display: flex; gap: 12px; align-items: center; }
`;

const OutletBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0d9488;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .dot {
    width: 8px; height: 8px;
    background: #0d9488;
    border-radius: 50%;
    animation: ${pulse} 2s infinite;
  }
`;

const RefreshBtn = styled.button`
  padding: 9px 18px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:hover { background: #0d9488; color: white; border-color: #0d9488; }
  ${props => props.$loading && css`svg { animation: ${spin} 1s linear infinite; }`}
`;

const NavigateBtn = styled.button`
  padding: 9px 18px;
  border-radius: 12px;
  background: #0f172a;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { background: #1e293b; transform: translateY(-1px); }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
`;

const KpiCard = styled.div`
  background: ${props => props.$gradient || 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)'};
  border-radius: 20px;
  padding: 22px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  box-shadow: 0 10px 20px -5px ${props => props.$shadow || 'rgba(13,148,136,0.3)'};
  transition: all 0.3s;
  animation: ${fadeUp} 0.5s ease-out backwards;
  animation-delay: ${props => props.$delay || 0}s;

  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-6px)' : 'translateY(-3px)'};
    box-shadow: 0 20px 30px -8px ${props => props.$shadow || 'rgba(13,148,136,0.4)'};
  }

  .label {
    font-size: 0.72rem;
    font-weight: 700;
    opacity: 0.85;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .value {
    font-size: 2.1rem;
    font-weight: 850;
    line-height: 1;
    margin-bottom: 4px;
  }
  .sub {
    font-size: 0.75rem;
    opacity: 0.8;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .bg-icon {
    position: absolute;
    right: -12px;
    bottom: -12px;
    opacity: 0.12;
    transform: rotate(-15deg);
    svg { width: 80px; height: 80px; }
  }
  .click-hint {
    position: absolute;
    top: 12px;
    right: 12px;
    opacity: 0.6;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 3px;
  }
`;

// ─── GLASS CHART CARDS ───────────────────────────────────────────────────────
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const TriGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  @media (max-width: 1100px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
  animation: ${fadeUp} 0.5s ease-out backwards;
  animation-delay: ${props => props.$delay || 0}s;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  h3 {
    margin: 0;
    color: #0f172a;
    font-weight: 800;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }
`;

// ─── CRITICAL LIST ────────────────────────────────────────────────────────────
const CriticalItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${props => props.$bg || '#fef2f2'};
  border: 1px solid ${props => props.$border || '#fee2e2'};
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateX(4px); }

  .item-name {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-meta {
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
  }
  .item-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 8px;
    white-space: nowrap;
  }
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  svg { width: 36px; height: 36px; margin-bottom: 10px; opacity: 0.4; }
  p { margin: 0; font-size: 0.85rem; font-weight: 600; }
`;

const LoadingSkeleton = styled.div`
  height: ${props => props.$h || '200px'};
  border-radius: 12px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '14px', padding: '12px 16px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.06)', fontSize: '0.8rem'
        }}>
            {label && <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.fill || p.stroke, flexShrink: 0 }} />
                    <span style={{ color: '#475569', fontWeight: 600 }}>{p.name}:</span>
                    <span style={{ color: '#0f172a', fontWeight: 800 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
const AnimCounter = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const num = Number(value) || 0;
        if (num === 0) { setDisplay(0); return; }
        let start = 0;
        const step = num / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= num) { setDisplay(num); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 20);
        return () => clearInterval(timer);
    }, [value]);
    return <>{display.toLocaleString()}</>;
};

// ─── COLORS ──────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#0d9488', '#3b82f6', '#8b5cf6'];
const CATEGORY_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#10b981'];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const PharmacyStockDashboard = () => {
    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [outletName, setOutletName] = useState("All Outlets");

    // All data states
    const [allTimeData, setAllTimeData] = useState([]);
    const [expiryData, setExpiryData] = useState([]);
    const [reorderData, setReorderData] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const outlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

        // Fetch outlet name
        try {
            const outletRes = await apiRequest(`${HMS_BASE_URL}get-all-outlets/`, "GET");
            if (outletRes.success && Array.isArray(outletRes.data) && outlet) {
                const found = outletRes.data.find(o => o.outlet_code === outlet);
                if (found) setOutletName(found.outlet_name);
            }
        } catch (_) {}

        // Fetch all-time stock (all items)
        try {
            const res = await apiRequest(`${HMS_BASE_URL}pharmacy_expiry_report/`, "POST", {
                outlet_code: outlet,
                all_time: true,
                report_type: "expiry",
                start_date: "", end_date: "", search_query: ""
            });
            const d = res.data?.data || res.data;
            setAllTimeData(Array.isArray(d) ? d : []);
        } catch (_) { setAllTimeData([]); }

        // Fetch nearby expiry (within 6 months)
        try {
            const res = await apiRequest(`${HMS_BASE_URL}pharmacy_expiry_report/`, "POST", {
                outlet_code: outlet,
                all_time: false,
                report_type: "expiry",
                start_date: dayjs().format("YYYY-MM-DD"),
                end_date: dayjs().add(6, "month").format("YYYY-MM-DD"),
                search_query: ""
            });
            const d = res.data?.data || res.data;
            setExpiryData(Array.isArray(d) ? d : []);
        } catch (_) { setExpiryData([]); }

        // Fetch reorder level items
        try {
            const res = await apiRequest(`${HMS_BASE_URL}pharmacy_expiry_report/`, "POST", {
                outlet_code: outlet,
                all_time: true,
                report_type: "reorder_level",
                start_date: "", end_date: "", search_query: ""
            });
            const d = res.data?.data || res.data;
            setReorderData(Array.isArray(d) ? d : []);
        } catch (_) { setReorderData([]); }

        setLoading(false);
    }, [HMS_BASE_URL]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ─── COMPUTED ANALYTICS ─────────────────────────────────────────────────
    const today = dayjs();

    // KPI counts
    const totalItems = new Set(allTimeData.map(i => i.item_id)).size;
    const totalBatches = allTimeData.length;
    const expiredBatches = allTimeData.filter(i => i.expiry_date && dayjs(i.expiry_date).isBefore(today, 'day')).length;
    const expiringSoon = expiryData.length;
    const belowReorder = reorderData.length;
    const zeroStock = allTimeData.filter(i => (i.available_stock ?? 0) <= 0).length;

    // Category breakdown pie
    const categoryMap = {};
    allTimeData.forEach(item => {
        const cat = item.category || "Uncategorized";
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat]++;
    });
    const categoryData = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));

    // Expiry timeline: group by month
    const monthlyExpiry = {};
    allTimeData.forEach(item => {
        if (!item.expiry_date) return;
        const exp = dayjs(item.expiry_date);
        if (exp.isAfter(today.subtract(1, 'month')) && exp.isBefore(today.add(12, 'month'))) {
            const key = exp.format("MMM YY");
            if (!monthlyExpiry[key]) monthlyExpiry[key] = { month: key, expiring: 0, expired: 0 };
            if (exp.isBefore(today, 'day')) monthlyExpiry[key].expired++;
            else monthlyExpiry[key].expiring++;
        }
    });
    const expiryTimeline = Object.values(monthlyExpiry).slice(0, 10);

    // Stock status donut
    const stockStatusData = [
        { name: "Already Expired", value: expiredBatches, fill: "#ef4444" },
        { name: "Expiring < 1M", value: allTimeData.filter(i => { if (!i.expiry_date) return false; const d = dayjs(i.expiry_date); return d.isAfter(today) && d.isBefore(today.add(30, 'day')); }).length, fill: "#f97316" },
        { name: "Expiring < 6M", value: allTimeData.filter(i => { if (!i.expiry_date) return false; const d = dayjs(i.expiry_date); return d.isAfter(today.add(30, 'day')) && d.isBefore(today.add(180, 'day')); }).length, fill: "#eab308" },
        { name: "Healthy", value: allTimeData.filter(i => !i.expiry_date || dayjs(i.expiry_date).isAfter(today.add(180, 'day'))).length, fill: "#0d9488" },
    ].filter(d => d.value > 0);

    // Top 8 fast-moving by sold_quantity
    const fastMovingTop = [...allTimeData]
        .filter(i => (i.sold_quantity || 0) > 0)
        .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
        .slice(0, 8)
        .map(i => ({ name: i.item_name?.slice(0, 20), sold: i.sold_quantity || 0 }));

    // Top 5 most critical reorder items
    const criticalReorder = [...reorderData]
        .sort((a, b) => (a.available_stock ?? 0) - (b.available_stock ?? 0))
        .slice(0, 5);

    // Top 5 nearest expiry
    const criticalExpiry = [...expiryData]
        .filter(i => i.expiry_date)
        .sort((a, b) => dayjs(a.expiry_date).diff(dayjs(b.expiry_date)))
        .slice(0, 5);

    // Navigate to detail report with preset
    const goToReport = (preset) => navigate(`/PharmacyExpiryReport?filter=${preset}`);

    return (
        <Container>
            {/* ── HEADER ── */}
            <Header>
                <div className="title-block">
                    <h1>
                        <BarChart2 size={28} style={{ color: '#0d9488' }} />
                        Pharmacy Stock Dashboard
                    </h1>
                    <p>Visual analytics for stock, expiry & inventory health</p>
                </div>
                <div className="actions">
                    <OutletBadge>
                        <div className="dot" />
                        {outletName}
                    </OutletBadge>
                    <RefreshBtn onClick={fetchAll} $loading={loading} disabled={loading}>
                        <RefreshCw size={15} /> Refresh
                    </RefreshBtn>
                    <NavigateBtn onClick={() => navigate('/PharmacyExpiryReport')}>
                        <ExternalLink size={15} /> Detailed Report
                    </NavigateBtn>
                </div>
            </Header>

            {/* ── KPI CARDS ── */}
            <KpiGrid>
                <KpiCard $gradient="linear-gradient(135deg,#0d9488 0%,#0891b2 100%)" $shadow="rgba(13,148,136,0.3)" $delay={0} $clickable onClick={() => goToReport('all_time')}>
                    <div className="label"><Package size={13} /> Total Unique Items</div>
                    <div className="value"><AnimCounter value={loading ? 0 : totalItems} /></div>
                    <div className="sub">across {totalBatches} batches</div>
                    <div className="bg-icon"><Package /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View All</div>
                </KpiCard>
                <KpiCard $gradient="linear-gradient(135deg,#f97316 0%,#ea580c 100%)" $shadow="rgba(249,115,22,0.3)" $delay={0.07} $clickable onClick={() => goToReport('6months')}>
                    <div className="label"><Clock size={13} /> Expiring Soon</div>
                    <div className="value"><AnimCounter value={loading ? 0 : expiringSoon} /></div>
                    <div className="sub">within next 6 months</div>
                    <div className="bg-icon"><Clock /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View</div>
                </KpiCard>
                <KpiCard $gradient="linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" $shadow="rgba(239,68,68,0.3)" $delay={0.14} $clickable onClick={() => goToReport('expired')}>
                    <div className="label"><ShieldAlert size={13} /> Already Expired</div>
                    <div className="value"><AnimCounter value={loading ? 0 : expiredBatches} /></div>
                    <div className="sub">batches past expiry</div>
                    <div className="bg-icon"><ShieldAlert /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View</div>
                </KpiCard>
                <KpiCard $gradient="linear-gradient(135deg,#b45309 0%,#92400e 100%)" $shadow="rgba(180,83,9,0.3)" $delay={0.21} $clickable onClick={() => goToReport('reorder_level')}>
                    <div className="label"><TrendingDown size={13} /> Below Reorder Level</div>
                    <div className="value"><AnimCounter value={loading ? 0 : belowReorder} /></div>
                    <div className="sub">items need replenishment</div>
                    <div className="bg-icon"><TrendingDown /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View</div>
                </KpiCard>
                <KpiCard $gradient="linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)" $shadow="rgba(124,58,237,0.3)" $delay={0.28} $clickable onClick={() => goToReport('not_sold')}>
                    <div className="label"><Boxes size={13} /> Zero Available Stock</div>
                    <div className="value"><AnimCounter value={loading ? 0 : zeroStock} /></div>
                    <div className="sub">batches fully depleted</div>
                    <div className="bg-icon"><Boxes /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View</div>
                </KpiCard>
                <KpiCard $gradient="linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)" $shadow="rgba(14,165,233,0.3)" $delay={0.35} $clickable onClick={() => goToReport('fast_moving')}>
                    <div className="label"><TrendingUp size={13} /> Fast Moving Items</div>
                    <div className="value"><AnimCounter value={loading ? 0 : allTimeData.filter(i => (i.sold_quantity || 0) > 0).length} /></div>
                    <div className="sub">items with sales activity</div>
                    <div className="bg-icon"><TrendingUp /></div>
                    <div className="click-hint"><ArrowRight size={11} /> View</div>
                </KpiCard>
            </KpiGrid>

            {/* ── CHARTS ROW 1 ── */}
            <ChartsGrid>
                {/* Stock Health Donut */}
                <GlassCard $delay={0.4}>
                    <div className="card-header">
                        <h3><Activity size={18} style={{ color: '#0d9488' }} /> Stock Health Overview</h3>
                        <span className="card-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                            {totalBatches} batches
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="260px" /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={stockStatusData}
                                    cx="50%" cy="50%"
                                    innerRadius={75} outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {stockStatusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Category Breakdown */}
                <GlassCard $delay={0.45}>
                    <div className="card-header">
                        <h3><Pill size={18} style={{ color: '#8b5cf6' }} /> Items by Category</h3>
                    </div>
                    {loading ? <LoadingSkeleton $h="260px" /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={categoryData} layout="vertical" barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} width={110} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Items" radius={[0, 8, 8, 0]} maxBarSize={18}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
            </ChartsGrid>

            {/* ── CHARTS ROW 2 ── */}
            <ChartsGrid>
                {/* Expiry Timeline */}
                <GlassCard $delay={0.5}>
                    <div className="card-header">
                        <h3><AlertTriangle size={18} style={{ color: '#f97316' }} /> Expiry Timeline (12 Months)</h3>
                        <span className="card-badge" style={{ background: '#fff7ed', color: '#f97316' }}>
                            {expiringSoon} upcoming
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="260px" /> : expiryTimeline.length === 0 ? (
                        <EmptyNotice><AlertTriangle /><p>No expiry data available</p></EmptyNotice>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={expiryTimeline} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={10} />
                                <Bar dataKey="expiring" name="Expiring" fill="#f97316" radius={[5, 5, 0, 0]} maxBarSize={22} />
                                <Bar dataKey="expired" name="Already Expired" fill="#ef4444" radius={[5, 5, 0, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Top Fast Moving */}
                <GlassCard $delay={0.55}>
                    <div className="card-header">
                        <h3><TrendingUp size={18} style={{ color: '#0ea5e9' }} /> Top Fast Moving Items</h3>
                        <span className="card-badge" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                            by sold qty
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="260px" /> : fastMovingTop.length === 0 ? (
                        <EmptyNotice><TrendingUp /><p>No sales data yet</p></EmptyNotice>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={fastMovingTop} layout="vertical" barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} width={120} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="sold" name="Sold Qty" fill="#0ea5e9" radius={[0, 8, 8, 0]} maxBarSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
            </ChartsGrid>

            {/* ── CRITICAL LISTS ROW ── */}
            <TriGrid>
                {/* Critical Reorder */}
                <GlassCard $delay={0.6}>
                    <div className="card-header">
                        <h3><TrendingDown size={17} style={{ color: '#b45309' }} /> Critical Reorder</h3>
                        <span className="card-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                            {belowReorder} items
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="200px" /> : criticalReorder.length === 0 ? (
                        <EmptyNotice><TrendingDown /><p>All stock above reorder level ✓</p></EmptyNotice>
                    ) : (
                        <>
                            {criticalReorder.map((item, i) => (
                                <CriticalItem key={i} $bg="#fffbeb" $border="#fde68a" onClick={() => goToReport('reorder_level')}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TrendingDown size={16} color="white" />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div className="item-name">{item.item_name}</div>
                                        <div className="item-meta">Reorder: {item.reorder_level ?? 0}</div>
                                    </div>
                                    <span className="item-badge" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                        Stock: {item.available_stock ?? 0}
                                    </span>
                                </CriticalItem>
                            ))}
                            {belowReorder > 5 && (
                                <div onClick={() => goToReport('reorder_level')} style={{ textAlign: 'center', fontSize: '0.78rem', color: '#b45309', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                                    +{belowReorder - 5} more items → View All
                                </div>
                            )}
                        </>
                    )}
                </GlassCard>

                {/* Nearest Expiry */}
                <GlassCard $delay={0.65}>
                    <div className="card-header">
                        <h3><Clock size={17} style={{ color: '#f97316' }} /> Nearest Expiry</h3>
                        <span className="card-badge" style={{ background: '#fff7ed', color: '#f97316' }}>
                            {expiringSoon} total
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="200px" /> : criticalExpiry.length === 0 ? (
                        <EmptyNotice><Clock /><p>No items expiring in 6 months ✓</p></EmptyNotice>
                    ) : (
                        <>
                            {criticalExpiry.map((item, i) => {
                                const daysLeft = dayjs(item.expiry_date).diff(today, 'day');
                                const isUrgent = daysLeft <= 30;
                                return (
                                    <CriticalItem key={i} $bg={isUrgent ? "#fff1f2" : "#fff7ed"} $border={isUrgent ? "#fecdd3" : "#fed7aa"} onClick={() => goToReport('6months')}>
                                        <div style={{ width: 32, height: 32, borderRadius: 10, background: isUrgent ? '#ef4444' : '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <AlertTriangle size={16} color="white" />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div className="item-name">{item.item_name}</div>
                                            <div className="item-meta">Batch: {item.batch_number}</div>
                                        </div>
                                        <span className="item-badge" style={{ background: isUrgent ? '#fef2f2' : '#fff7ed', color: isUrgent ? '#ef4444' : '#f97316' }}>
                                            {daysLeft}d left
                                        </span>
                                    </CriticalItem>
                                );
                            })}
                            {expiringSoon > 5 && (
                                <div onClick={() => goToReport('6months')} style={{ textAlign: 'center', fontSize: '0.78rem', color: '#f97316', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                                    +{expiringSoon - 5} more → View All
                                </div>
                            )}
                        </>
                    )}
                </GlassCard>

                {/* Stock Transfers */}
                <GlassCard $delay={0.7}>
                    <div className="card-header">
                        <h3><Truck size={17} style={{ color: '#8b5cf6' }} /> Transfer Activity</h3>
                        <span className="card-badge" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                            {allTimeData.filter(i => (i.transferred_out_quantity || 0) > 0).length} items
                        </span>
                    </div>
                    {loading ? <LoadingSkeleton $h="200px" /> : (
                        (() => {
                            const transfers = [...allTimeData]
                                .filter(i => (i.transferred_out_quantity || 0) > 0)
                                .sort((a, b) => (b.transferred_out_quantity || 0) - (a.transferred_out_quantity || 0))
                                .slice(0, 5);
                            return transfers.length === 0 ? (
                                <EmptyNotice><Truck /><p>No stock transfers recorded</p></EmptyNotice>
                            ) : (
                                <>
                                    {transfers.map((item, i) => (
                                        <CriticalItem key={i} $bg="#f5f3ff" $border="#ddd6fe" onClick={() => goToReport('stock_transfer')}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Truck size={16} color="white" />
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div className="item-name">{item.item_name}</div>
                                                <div className="item-meta">Avail: {item.available_stock}</div>
                                            </div>
                                            <span className="item-badge" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                                                Out: {item.transferred_out_quantity}
                                            </span>
                                        </CriticalItem>
                                    ))}
                                    {allTimeData.filter(i => (i.transferred_out_quantity || 0) > 0).length > 5 && (
                                        <div onClick={() => goToReport('stock_transfer')} style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                                            View Full Transfer Report →
                                        </div>
                                    )}
                                </>
                            );
                        })()
                    )}
                </GlassCard>
            </TriGrid>
        </Container>
    );
};

export default PharmacyStockDashboard;
