import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { 
    FiUsers, FiUserCheck, FiActivity, FiUserPlus, FiDollarSign, 
    FiTrendingUp, FiClock, FiCalendar, FiRefreshCw, FiExternalLink
} from "react-icons/fi";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const THEMES = {
    emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    orange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    rose: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    violet: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    cyan: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    slate: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
};

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 30px 24px 60px;
  font-family: 'Inter', -apple-system, sans-serif;

  @media (max-width: 768px) { padding: 15px 12px 40px; }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;

  h1 {
    font-size: 1.85rem;
    font-weight: 850;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    font-size: 0.75rem;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StyledSelect = styled.select`
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  cursor: pointer;
  outline: none;
  &:focus { border-color: #3b82f6; }
`;

const RefreshBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover { color: #3b82f6; svg { animation: ${rotate} 0.5s linear; } }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const PremiumCard = styled.div`
  background: ${({ theme }) => THEMES[theme] || THEMES.emerald};
  padding: 22px;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: all 0.3s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ delay }) => delay}s;

  &:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); }

  .label { font-size: 0.8rem; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .value { font-size: 2rem; font-weight: 850; margin-bottom: 2px; }
  .suffix { font-size: 0.85rem; opacity: 0.8; font-weight: 500; }
  .icon-bg { position: absolute; right: -15px; bottom: -15px; font-size: 6rem; opacity: 0.15; transform: rotate(-15deg); }
`;

// ─── CHARTS ──────────────────────────────────────────────────────────────────
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);

  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  h3 { margin: 0; color: #1e293b; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
  @media (max-width: 1200px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
const AnimatedValue = ({ value, prefix = "", suffix = "" }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const val = Number(String(value).replace(/[^0-9.]/g, '')) || 0;
        let start = 0;
        const duration = 1000;
        const step = val / (duration / 16);
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

    return (
        <DashboardContainer>
            <HeaderSection>
                <h1><FiActivity style={{color: '#3b82f6'}}/> Health Analytics</h1>
                <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
                    <div className="live-indicator"><div className="dot" /> Live Data</div>
                    <ActionBar>
                        <StyledSelect value={filter.month} onChange={e => setFilter({...filter, month: Number(e.target.value)})}>
                            {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </StyledSelect>
                        <StyledSelect value={filter.year} onChange={e => setFilter({...filter, year: Number(e.target.value)})}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </StyledSelect>
                        <RefreshBtn onClick={fetchStats}><FiRefreshCw /></RefreshBtn>
                    </ActionBar>
                </div>
            </HeaderSection>

            {/* LIFETIME KPIs */}
            <KpiRow>
                <PremiumCard theme="emerald" delay={0}>
                    <div className="label">Total Patients (OP)</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_op || 0} /></div>
                    <div className="suffix">Lifetime Registered</div>
                    <FiUsers className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="blue" delay={0.1}>
                    <div className="label">Total Admissions (IP)</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_ip || 0} /></div>
                    <div className="suffix">Lifetime Records</div>
                    <FiUserCheck className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="rose" delay={0.2}>
                    <div className="label">Total Discharges</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_discharge || 0} /></div>
                    <div className="suffix">Completed Cases</div>
                    <FiExternalLink className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="violet" delay={0.3}>
                    <div className="label">Current Occupancy</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.current_ip || 0} /></div>
                    <div className="suffix">Patients in Hospital</div>
                    <FiUserPlus className="icon-bg" />
                </PremiumCard>
            </KpiRow>

            {/* DAILY SUMMARY */}
            <h2 style={{fontSize: '1.2rem', fontWeight: 800, marginBottom: 20, color: '#475569'}}>Today's Performance</h2>
            <KpiRow>
                <PremiumCard theme="slate" delay={0.4}>
                    <div className="label">Today's Revenue</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.today_revenue || 0} prefix="₹" /></div>
                    <div className="suffix">OP + Pharmacy + Lab</div>
                    <FiDollarSign className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="orange" delay={0.5}>
                    <div className="label">Today's Entries (IP / OP)</div>
                    <div className="value"><AnimatedValue value={`${stats.kpis?.today_ip || 0} / ${stats.kpis?.today_op || 0}`} /></div>
                    <div className="suffix">New Registrations Today</div>
                    <FiTrendingUp className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="cyan" delay={0.6}>
                    <div className="label">Today's Discharges</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.today_discharge || 0} /></div>
                    <div className="suffix">Patients going home</div>
                    <FiActivity className="icon-bg" />
                </PremiumCard>
                <PremiumCard theme="rose" delay={0.7}>
                    <div className="label">Lifetime Revenue</div>
                    <div className="value"><AnimatedValue value={stats.kpis?.total_income || 0} prefix="₹" /></div>
                    <div className="suffix">Verified Payments</div>
                    <FiDollarSign className="icon-bg" />
                </PremiumCard>
            </KpiRow>

            <MainGrid>
                <GlassCard>
                    <div className="card-header"><h3><FiActivity /> Patient Traffic Trends</h3></div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={stats.monthly_op_ip}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}} />
                            <Legend />
                            <Line type="monotone" dataKey="OP" stroke="#10b981" strokeWidth={4} dot={false} />
                            <Line type="monotone" dataKey="IP" stroke="#3b82f6" strokeWidth={4} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiDollarSign /> Income vs Expense</h3></div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats.monthly_income_expense}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <RechartsTooltip />
                            <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={20} />
                            <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </MainGrid>

            <BottomGrid>
                <GlassCard>
                    <div className="card-header"><h3><FiCalendar /> Doctor Performance (Today)</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={stats.doctor_wise}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} angle={-25} textAnchor="end" />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                            <RechartsTooltip />
                            <Bar yAxisId="left" dataKey="OP" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                            <Bar yAxisId="left" dataKey="IP" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} />
                            <Line yAxisId="right" type="step" dataKey="Amount" stroke="#8b5cf6" strokeWidth={3} dot={{fill: '#8b5cf6', r: 4}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiClock /> Income Mix</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={stats.todays_income_method} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="amount" nameKey="method">
                                {stats.todays_income_method.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard>
                    <div className="card-header"><h3><FiActivity /> Occupancy</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={stats.bed_occupancy} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" nameKey="name">
                                <Cell fill="#10b981" /><Cell fill="#e2e8f0" />
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </BottomGrid>
        </DashboardContainer>
    );
};

export default AdvancedDashboard;
