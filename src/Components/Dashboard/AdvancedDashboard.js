import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import {
    FiUsers, FiUserCheck, FiActivity, FiUserPlus, FiDollarSign,
    FiTrendingUp, FiClock, FiCalendar, FiRefreshCw, FiExternalLink, FiInbox
} from "react-icons/fi";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const currency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 260px);
  padding: 28px 24px 60px;
  font-family: 'Inter', -apple-system, sans-serif;

  @media (max-width: 768px) { padding: 15px 12px 40px; }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    font-size: 0.72rem;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    .dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const StyledSelect = styled.select`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  cursor: pointer;
  outline: none;
  &:focus { border-color: #3b82f6; }
`;

const RefreshBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  &:hover { color: #3b82f6; border-color: #3b82f6; }
  svg { ${({ $spinning }) => $spinning && css`animation: ${rotate} 0.7s linear infinite;`} }
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 800;
  margin: 28px 0 16px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
    margin-left: 6px;
  }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px 22px;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: all 0.2s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ delay }) => delay || 0}s;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12);
  }

  .icon-chip {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.05rem;
    background: ${({ $tint }) => $tint || '#eef2ff'};
    color: ${({ $accent }) => $accent || '#4f46e5'};
  }

  .label { font-size: 0.76rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  .value { font-size: 1.7rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
  .suffix { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }
`;

// ─── CHARTS ──────────────────────────────────────────────────────────────────
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 22px;
  padding: 24px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);

  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
  h3 { margin: 0; color: #1e293b; font-weight: 800; font-size: 1rem; display: flex; align-items: center; gap: 9px; }
  h3 svg { color: #4f46e5; }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  @media (max-width: 1200px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const ChartEmptyState = styled.div`
  height: ${({ $h }) => $h || 280}px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #94a3b8; text-align: center;
  svg { font-size: 1.8rem; margin-bottom: 10px; opacity: 0.6; }
  .title { font-weight: 700; color: #64748b; font-size: 0.9rem; margin-bottom: 4px; }
  .sub { font-size: 0.78rem; }
`;

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
const AnimatedValue = ({ value, prefix = "", suffix = "" }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const val = Number(String(value).replace(/[^0-9.]/g, '')) || 0;
        let start = 0;
        const duration = 900;
        const step = val / (duration / 16) || val;
        const timer = setInterval(() => {
            start += step;
            if (start >= val) { setDisplay(val); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [value]);

    if (typeof value === 'string' && value.includes('/')) return <span>{value}</span>;
    return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

// ─── EMPTY-DATA HELPER ───────────────────────────────────────────────────────
const isEmptySeries = (arr, keys) => {
    if (!arr || arr.length === 0) return true;
    return !arr.some(row => keys.some(k => Number(row[k]) > 0));
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const AdvancedDashboard = () => {
    const [stats, setStats] = useState({
        kpis: {},
        monthly_op_ip: [],
        monthly_income_expense: [],
        todays_income_method: [],
        doctor_wise: [],
        bed_occupancy: []
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${Hmsbaseurl}advanced-dashboard/stats/`, {
                params: { month: filter.month, year: filter.year }
            });
            setStats(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, [filter]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const trafficEmpty = isEmptySeries(stats.monthly_op_ip, ["OP", "IP"]);
    const incomeExpenseEmpty = isEmptySeries(stats.monthly_income_expense, ["Income", "Expense"]);
    const doctorWiseEmpty = !stats.doctor_wise || stats.doctor_wise.length === 0;
    const incomeMixEmpty = !stats.todays_income_method || stats.todays_income_method.length === 0;
    const occupancyEmpty = !stats.bed_occupancy || stats.bed_occupancy.every(b => !b.value);

    return (
        <DashboardContainer>
            <HeaderSection>
                <h1><FiActivity style={{ color: '#4f46e5' }} /> Health Analytics</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="live-indicator"><div className="dot" /> Live Data</div>
                    <ActionBar>
                        <StyledSelect value={filter.month} onChange={e => setFilter({ ...filter, month: Number(e.target.value) })}>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </StyledSelect>
                        <StyledSelect value={filter.year} onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </StyledSelect>
                        <RefreshBtn $spinning={loading} onClick={fetchStats}><FiRefreshCw /></RefreshBtn>
                    </ActionBar>
                </div>
            </HeaderSection>

            {/* LIFETIME KPIs */}
            <KpiRow>
                <StatCard delay={0} $tint="#ecfdf5" $accent="#059669">
                    <div className="icon-chip"><FiUsers /></div>
                    <div className="label">Total Patients (OP)</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_op || 0} /></div>
                    <div className="suffix">Lifetime registered</div>
                </StatCard>
                <StatCard delay={0.05} $tint="#eff6ff" $accent="#2563eb">
                    <div className="icon-chip"><FiUserCheck /></div>
                    <div className="label">Total Admissions (IP)</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_ip || 0} /></div>
                    <div className="suffix">Lifetime records</div>
                </StatCard>
                <StatCard delay={0.1} $tint="#fff1f2" $accent="#e11d48">
                    <div className="icon-chip"><FiExternalLink /></div>
                    <div className="label">Total Discharges</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_discharge || 0} /></div>
                    <div className="suffix">Completed cases</div>
                </StatCard>
                <StatCard delay={0.15} $tint="#f5f3ff" $accent="#7c3aed">
                    <div className="icon-chip"><FiUserPlus /></div>
                    <div className="label">Current Occupancy</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.current_ip || 0} /></div>
                    <div className="suffix">Patients in hospital</div>
                </StatCard>
            </KpiRow>

            <SectionTitle>Today's Performance</SectionTitle>
            <KpiRow>
                <StatCard delay={0} $tint="#f1f5f9" $accent="#475569">
                    <div className="icon-chip"><FiDollarSign /></div>
                    <div className="label">Today's Revenue</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.today_revenue || 0} prefix="₹" /></div>
                    <div className="suffix">OP + Pharmacy</div>
                </StatCard>
                <StatCard delay={0.05} $tint="#fff7ed" $accent="#d97706">
                    <div className="icon-chip"><FiTrendingUp /></div>
                    <div className="label">Today's Entries (IP / OP)</div>
                    <div className="value"><AnimatedValue value={`${stats.kpis?.today_ip || 0} / ${stats.kpis?.today_op || 0}`} /></div>
                    <div className="suffix">New registrations today</div>
                </StatCard>
                <StatCard delay={0.1} $tint="#ecfeff" $accent="#0891b2">
                    <div className="icon-chip"><FiActivity /></div>
                    <div className="label">Today's Discharges</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.today_discharge || 0} /></div>
                    <div className="suffix">Patients going home</div>
                </StatCard>
                <StatCard delay={0.15} $tint="#fff1f2" $accent="#e11d48">
                    <div className="icon-chip"><FiDollarSign /></div>
                    <div className="label">Lifetime Revenue</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_income || 0} prefix="₹" /></div>
                    <div className="suffix">Verified payments</div>
                </StatCard>
            </KpiRow>

            <SectionTitle>Trends This Month</SectionTitle>
            <MainGrid>
                <GlassCard>
                    <div className="card-header"><h3><FiActivity /> Patient Traffic Trends</h3></div>
                    {trafficEmpty ? (
                        <ChartEmptyState $h={320}>
                            <FiInbox />
                            <div className="title">No patient traffic yet</div>
                            <div className="sub">No OP/IP records for {months[filter.month - 1]} {filter.year}.</div>
                        </ChartEmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={stats.monthly_op_ip}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #eef2f6', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="OP" stroke="#10b981" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="IP" stroke="#3b82f6" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiDollarSign /> Income vs Expense</h3></div>
                    {incomeExpenseEmpty ? (
                        <ChartEmptyState $h={320}>
                            <FiInbox />
                            <div className="title">No income/expense data yet</div>
                            <div className="sub">No billing or GRN records for {months[filter.month - 1]} {filter.year}.</div>
                        </ChartEmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={stats.monthly_income_expense}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <RechartsTooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: '16px', border: '1px solid #eef2f6' }} />
                                <Legend />
                                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={20} />
                                <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
            </MainGrid>

            <BottomGrid>
                <GlassCard>
                    <div className="card-header"><h3><FiCalendar /> Doctor-wise Monthly Income</h3></div>
                    {doctorWiseEmpty ? (
                        <ChartEmptyState>
                            <FiInbox />
                            <div className="title">No doctor billing yet</div>
                            <div className="sub">No consultations recorded for {months[filter.month - 1]} {filter.year}.</div>
                        </ChartEmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={stats.doctor_wise}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <RechartsTooltip formatter={(v, name) => name === 'Amount' ? currency(v) : v} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="OP" name="OP Visits" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                                <Bar yAxisId="left" dataKey="IP" name="IP Admissions" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} />
                                <Line yAxisId="right" type="monotone" dataKey="Amount" name="Monthly Income" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiClock /> Income Mix (Today)</h3></div>
                    {incomeMixEmpty ? (
                        <ChartEmptyState>
                            <FiInbox />
                            <div className="title">No payments today</div>
                            <div className="sub">Income methods will appear here once billed.</div>
                        </ChartEmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={stats.todays_income_method} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="amount" nameKey="method">
                                    {stats.todays_income_method.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip formatter={(v) => currency(v)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiActivity /> Occupancy</h3></div>
                    {occupancyEmpty ? (
                        <ChartEmptyState>
                            <FiInbox />
                            <div className="title">No bed data</div>
                            <div className="sub">Room capacity or occupancy not recorded yet.</div>
                        </ChartEmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={stats.bed_occupancy} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" nameKey="name">
                                    <Cell fill="#4f46e5" /><Cell fill="#e2e8f0" />
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>
            </BottomGrid>
        </DashboardContainer>
    );
};

export default AdvancedDashboard;
