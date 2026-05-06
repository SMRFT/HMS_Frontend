import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { Container } from "../GlobalStyles";
import { 
    FiUsers, FiUserCheck, FiDollarSign, FiClock, FiActivity, 
    FiUserPlus, FiCalendar, FiRefreshCw, FiTrendingUp 
} from "react-icons/fi";
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const THEMES = {
    indigo: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    rose: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    slate: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
};

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
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
  font-family: 'Inter', sans-serif;
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
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6366f1;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);

    .dot {
      width: 8px;
      height: 8px;
      background: #6366f1;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  }
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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
  &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
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
  &:hover { 
    color: #6366f1; 
    border-color: #6366f1;
    svg { animation: ${rotate} 0.5s linear; } 
  }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => THEMES[theme] || THEMES.indigo};
  padding: 24px;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: all 0.3s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ index }) => index * 0.1}s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
  }

  .label { font-size: 0.85rem; font-weight: 600; opacity: 0.85; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 2.25rem; font-weight: 850; margin-bottom: 2px; }
  .prefix { font-size: 1.25rem; vertical-align: middle; margin-right: 4px; opacity: 0.9; }
  .trend {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    background: rgba(255,255,255,0.15);
    padding: 4px 10px;
    border-radius: 20px;
    width: fit-content;
  }
  .icon-bg { position: absolute; right: -15px; bottom: -15px; font-size: 6rem; opacity: 0.12; transform: rotate(-15deg); }
`;

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  border: 1px solid #eef2f6;

  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  h3 { margin: 0; color: #1e293b; font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 10px; }
`;

const PatientItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  transition: all 0.2s;
  &:hover { background: #f8fafc; }

  .info {
    display: flex;
    align-items: center;
    gap: 14px;
    .avatar {
      width: 42px; height: 42px; border-radius: 12px;
      background: #e0e7ff; color: #4f46e5;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
    }
    .text {
      display: flex; flex-direction: column;
      strong { font-size: 0.95rem; color: #1e293b; }
      span { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
    }
  }
  .fee {
    background: #dcfce7; color: #15803d;
    padding: 6px 12px; border-radius: 30px;
    font-weight: 700; font-size: 0.85rem;
  }
`;

// ─── ANIMATED VALUE ──────────────────────────────────────────────────────────
const AnimatedValue = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const val = Number(value) || 0;
        let start = 0; const duration = 800; const step = val / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= val) { setDisplay(val); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{display.toLocaleString()}</span>;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const DoctorDashboard = () => {
    const [data, setData] = useState({
        doctors: [], selected_doctor: "", kpis: {}, monthly_trend: [], recent_patients: []
    });
    const [filter, setFilter] = useState({ 
        name: "", 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear() 
    });
    const [loading, setLoading] = useState(true);

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = { month: filter.month, year: filter.year };
            if (filter.name) params.doctor_name = filter.name;
            const { data } = await axios.get(`${Hmsbaseurl}doctor-dashboard/stats/`, { params });
            setData(data);
            if (!filter.name && data.selected_doctor) setFilter(prev => ({ ...prev, name: data.selected_doctor }));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, [filter.month, filter.year, filter.name]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <DashboardContainer>
            <Container style={{maxWidth: 1400}}>
                <HeaderSection>
                    <h1><FiActivity style={{color: '#6366f1'}}/> Dr. Analytics</h1>
                    <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
                        <div className="live-indicator"><div className="dot" /> Performance Active</div>
                        <ControlsBar>
                            <StyledSelect value={filter.name} onChange={e => setFilter({...filter, name: e.target.value})}>
                                <option value="">Global View</option>
                                {data.doctors.map(d => <option key={d.id} value={d.name}>Dr. {d.name}</option>)}
                            </StyledSelect>
                            <StyledSelect value={filter.month} onChange={e => setFilter({...filter, month: Number(e.target.value)})}>
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </StyledSelect>
                            <StyledSelect value={filter.year} onChange={e => setFilter({...filter, year: Number(e.target.value)})}>
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </StyledSelect>
                            <RefreshBtn onClick={fetchStats}><FiRefreshCw /></RefreshBtn>
                        </ControlsBar>
                    </div>
                </HeaderSection>

                <KpiGrid>
                    <StatCard theme="indigo" index={0}>
                        <div className="label">Today's OP Visits</div>
                        <div className="value"><AnimatedValue value={data.kpis?.today_op || 0} /></div>
                        <div className="trend"><FiUsers /> Daily Consultations</div>
                        <FiUsers className="icon-bg" />
                    </StatCard>
                    <StatCard theme="emerald" index={1}>
                        <div className="label">Today's IP Admissions</div>
                        <div className="value"><AnimatedValue value={data.kpis?.today_ip || 0} /></div>
                        <div className="trend"><FiUserCheck /> Active Ward Entries</div>
                        <FiUserCheck className="icon-bg" />
                    </StatCard>
                    <StatCard theme="slate" index={2}>
                        <div className="label">Monthly Revenue</div>
                        <div className="value"><span className="prefix">₹</span><AnimatedValue value={data.kpis?.monthly_income || 0} /></div>
                        <div className="trend"><FiDollarSign /> Performance Index</div>
                        <FiDollarSign className="icon-bg" />
                    </StatCard>
                    <StatCard theme="amber" index={3}>
                        <div className="label">Total OP (Lifetime)</div>
                        <div className="value"><AnimatedValue value={data.kpis?.total_op || 0} /></div>
                        <div className="trend"><FiTrendingUp /> Cumulative Trust</div>
                        <FiActivity className="icon-bg" />
                    </StatCard>
                </KpiGrid>

                <DashboardGrid>
                    <GlassCard>
                        <div className="card-header">
                            <h3><FiCalendar /> Patient Volume Trend</h3>
                            <div style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 600}}>Moving Average Analysis</div>
                        </div>
                        <ResponsiveContainer width="100%" height={340}>
                            <AreaChart data={data.monthly_trend}>
                                <defs>
                                    <linearGradient id="colorOP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorIP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                                <Area type="monotone" dataKey="OP" stroke="#6366f1" strokeWidth={3} fill="url(#colorOP)" />
                                <Area type="monotone" dataKey="IP" stroke="#10b981" strokeWidth={3} fill="url(#colorIP)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <div className="card-header">
                            <h3><FiClock /> Recent Consultations</h3>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            {data.recent_patients?.length > 0 ? data.recent_patients.map((p, i) => (
                                <PatientItem key={i}>
                                    <div className="info">
                                        <div className="avatar">{p.patient_name?.charAt(0)}</div>
                                        <div className="text">
                                            <strong>{p.patient_name}</strong>
                                            <span>{p.uhid} • {p.date}</span>
                                        </div>
                                    </div>
                                    <div className="fee">₹{p.fee}</div>
                                </PatientItem>
                            )) : <div style={{textAlign: 'center', padding: '40px 0', color: '#94a3b8'}}>No recent data</div>}
                        </div>
                    </GlassCard>
                </DashboardGrid>
            </Container>
        </DashboardContainer>
    );
};

export default DoctorDashboard;
