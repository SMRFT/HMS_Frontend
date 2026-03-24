import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { colors, fadeIn, PageWrapper, Container, SectionTitle } from "../GlobalStyles";
import { FiUsers, FiUserCheck, FiActivity, FiUserPlus, FiDollarSign } from "react-icons/fi";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981'];

const CARD_THEMES = [
    { gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', glow: 'rgba(13,148,136,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', glow: 'rgba(245,158,11,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', glow: 'rgba(34,197,94,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', glow: 'rgba(59,130,246,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', glow: 'rgba(239,68,68,0.35)', icon: 'rgba(255,255,255,0.2)' },
];

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ─── WRAPPER ─────────────────────────────────────────────────────────────────
const ModernWrapper = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(13,148,136,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.08) 0%, transparent 50%),
    #f8fafc;
  padding: 24px 0 48px;
`;

// ─── HEADER SECTION ──────────────────────────────────────────────────────────
const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #0d9488, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 0.9rem;
  }
`;

// ─── FILTER STRIP ────────────────────────────────────────────────────────────
const FilterStrip = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 50px;
  padding: 6px 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);

  select {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    font-size: 0.85rem;
    font-weight: 500;
    color: #334155;
    background: white;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13,148,136,0.15);
    }
  }
`;

// ─── KPI GRID ────────────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
`;

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = styled.div`
  background: ${({ gradient }) => gradient};
  border-radius: 16px;
  padding: 22px 20px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: default;
  animation: ${fadeIn} 0.5s ease-out;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 40px ${({ glow }) => glow};
  }

  /* Decorative circle */
  &::before {
    content: '';
    position: absolute;
    top: -25px;
    right: -25px;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    right: 30px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
  display: block;
  margin-bottom: 10px;
`;

const StatValueRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const StatIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  backdrop-filter: blur(4px);
`;

// ─── CHARTS LAYOUT ───────────────────────────────────────────────────────────
const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr 1fr'};
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// ─── GLASS CHART CARD ────────────────────────────────────────────────────────
const GlassCard = styled.div`
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 22px 20px;
  box-shadow:
    0 4px 24px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  transition: box-shadow 0.25s, transform 0.25s;

  &:hover {
    box-shadow:
      0 8px 32px rgba(0,0,0,0.10),
      inset 0 1px 0 rgba(255,255,255,0.9);
    transform: translateY(-2px);
  }
`;

const ChartTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(135deg, #0d9488, #3b82f6);
  }
`;

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
const SkeletonPulse = styled.div`
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
  border-radius: ${({ radius }) => radius || '8px'};
  height: ${({ h }) => h || '20px'};
  width: ${({ w }) => w || '100%'};
`;

const SkeletonCard = styled.div`
  background: rgba(255,255,255,0.6);
  border-radius: 16px;
  padding: 22px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// ─── ERROR BOX ───────────────────────────────────────────────────────────────
const ErrorBox = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-left: 4px solid #ef4444;
  color: #b91c1c;
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// ─── ANIMATED COUNTER HOOK ───────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!target) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, themeIndex, prefix = '', suffix = '' }) => {
    const theme = CARD_THEMES[themeIndex % CARD_THEMES.length];
    const animated = useCountUp(Number(String(value).replace(/[^0-9]/g, '')) || 0);

    return (
        <StatCard gradient={theme.gradient} glow={theme.glow}>
            <StatLabel>{label}</StatLabel>
            <StatValueRow>
                <StatValue>
                    {prefix}{typeof value === 'string' && value.includes('/') ? value : animated.toLocaleString()}{suffix}
                </StatValue>
                <StatIcon>{icon}</StatIcon>
            </StatValueRow>
        </StatCard>
    );
};

// ─── SKELETON GRID ───────────────────────────────────────────────────────────
const SkeletonGrid = () => (
    <>
        <KpiGrid>
            {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i}>
                    <SkeletonPulse h="12px" w="60%" />
                    <SkeletonPulse h="36px" w="50%" />
                </SkeletonCard>
            ))}
        </KpiGrid>
        <ChartsRow>
            {[...Array(2)].map((_, i) => (
                <GlassCard key={i}>
                    <SkeletonPulse h="16px" w="45%" />
                    <div style={{ marginTop: 16 }}><SkeletonPulse h="280px" radius="10px" /></div>
                </GlassCard>
            ))}
        </ChartsRow>
    </>
);

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────
const tooltipStyle = {
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    fontSize: '0.85rem',
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
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true); setError(null);
            try {
                const baseUrl = Hmsbaseurl || "http://127.0.0.1:8000/hospital/";
                const { data } = await axios.get(`${baseUrl}advanced-dashboard/stats/`, {
                    params: { month: filterMonth, year: filterYear }
                });
                setStats(data);
            } catch (err) {
                setError("Failed to load dashboard statistics. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [Hmsbaseurl, filterMonth, filterYear]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2024, 2025, 2026, 2027];

    return (
        <ModernWrapper>
            <Container style={{ maxWidth: '1400px', padding: '0 24px' }}>

                {/* ── HEADER ── */}
                <DashboardHeader>
                    <div>
                        <h2>Advanced Dashboard</h2>
                        <p>Hospital performance overview · Real-time data</p>
                    </div>
                    <FilterStrip>
                        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
                            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </FilterStrip>
                </DashboardHeader>

                {error && (
                    <ErrorBox>
                        <span>⚠</span> {error}
                    </ErrorBox>
                )}

                {loading ? <SkeletonGrid /> : (
                    <>
                        {/* ── KPI ROW ── */}
                        <KpiGrid>
                            <KpiCard label="Total OP Patients" value={stats.kpis?.total_op || 0} icon={<FiUsers />} themeIndex={0} />
                            <KpiCard label="Total IP Admissions" value={stats.kpis?.total_ip || 0} icon={<FiUserCheck />} themeIndex={1} />
                            <KpiCard label="Total Income" value={(stats.kpis?.total_income || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} icon={<FiDollarSign />} themeIndex={2} prefix="₹" />
                            <KpiCard label="Today's IP / OP" value={`${stats.kpis?.today_ip || 0} / ${stats.kpis?.today_op || 0}`} icon={<FiUserPlus />} themeIndex={3} />
                            <KpiCard label="Today's Discharge" value={stats.kpis?.today_discharge || 0} icon={<FiActivity />} themeIndex={4} />
                        </KpiGrid>

                        {/* ── LINE + BAR ROW ── */}
                        <ChartsRow>
                            <GlassCard>
                                <ChartTitle>OP / IP Patients — {months[filterMonth - 1]} {filterYear}</ChartTitle>
                                <ResponsiveContainer width="100%" height={290}>
                                    <LineChart data={stats.monthly_op_ip} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" iconSize={8} />
                                        <Line type="monotone" dataKey="IP" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                        <Line type="monotone" dataKey="OP" stroke="#0d9488" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </GlassCard>

                            <GlassCard>
                                <ChartTitle>Income vs Expense — {months[filterMonth - 1]} {filterYear}</ChartTitle>
                                <ResponsiveContainer width="100%" height={290}>
                                    <BarChart data={stats.monthly_income_expense} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                                        <Legend iconType="circle" iconSize={8} />
                                        <Bar dataKey="Income" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                        <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </ChartsRow>

                        {/* ── BOTTOM ROW ── */}
                        <ChartsRow cols="2fr 1fr 1fr">
                            <GlassCard>
                                <ChartTitle>Doctor Wise OP / IP & Fees (Today)</ChartTitle>
                                <ResponsiveContainer width="100%" height={290}>
                                    <ComposedChart data={stats.doctor_wise} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-40} textAnchor="end" />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
                                        <Bar yAxisId="left" dataKey="OP" stackId="a" fill="#0d9488" maxBarSize={32} />
                                        <Bar yAxisId="left" dataKey="IP" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                        <Line yAxisId="right" type="monotone" dataKey="Amount" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </GlassCard>

                            <GlassCard>
                                <ChartTitle>Today's Income</ChartTitle>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={stats.todays_income_method}
                                            cx="50%" cy="45%"
                                            innerRadius={55} outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="amount" nameKey="method"
                                        >
                                            {stats.todays_income_method.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={v => [`₹${v}`, 'Amount']} contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" iconSize={8} verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </GlassCard>

                            <GlassCard>
                                <ChartTitle>Bed Occupancy</ChartTitle>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={stats.bed_occupancy}
                                            cx="50%" cy="45%"
                                            innerRadius={55} outerRadius={90}
                                            dataKey="value" nameKey="name"
                                        >
                                            {stats.bed_occupancy.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={entry.name === 'Occupied' ? '#0d9488' : '#e2e8f0'}
                                                    stroke={entry.name === 'Vacant' ? '#cbd5e1' : 'none'}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" iconSize={8} verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </ChartsRow>
                    </>
                )}
            </Container>
        </ModernWrapper>
    );
};

export default AdvancedDashboard;
