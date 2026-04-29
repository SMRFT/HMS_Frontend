import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { colors, fadeIn, Container } from "../GlobalStyles";
import { FiUsers, FiUserCheck, FiActivity, FiUserPlus, FiTrendingUp, FiCalendar, FiRefreshCw } from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const THEMES = {
    primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    secondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
};

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 30px 24px 60px;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
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
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    font-size: 0.75rem;
    font-weight: 700;
    color: #10b981;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);

    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  }
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
    color: #3b82f6; 
    border-color: #3b82f6;
    svg { animation: ${rotate} 0.5s linear; } 
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const PremiumCard = styled.div`
  background: ${({ theme }) => THEMES[theme] || THEMES.primary};
  padding: 26px;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: all 0.3s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ delay }) => delay}s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
  }

  .label {
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .value {
    font-size: 2.25rem;
    font-weight: 850;
    margin-bottom: 4px;
  }

  .trend {
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

  .icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 6rem;
    opacity: 0.12;
    transform: rotate(-15deg);
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  border: 1px solid #eef2f6;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h3 {
      margin: 0;
      color: #1e293b;
      font-weight: 800;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
`;

// ─── ANIMATED VALUE ──────────────────────────────────────────────────────────
const AnimatedValue = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const val = Number(value) || 0;
        let start = 0;
        const duration = 800;
        const step = val / (duration / 16);
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
const Dashboard = () => {
  const [stats, setStats] = useState({
    total_registered_patients: 0,
    today_new_patients: 0,
    today_renewals: 0,
    today_total_visits: 0,
    chart_data: []
  });
  const [loading, setLoading] = useState(true);

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${Hmsbaseurl}dashboard/stats/`);
      setStats(data);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <DashboardWrapper>
      <Container>
        <HeaderSection>
          <h1><FiActivity style={{color: '#10b981'}}/> Hospital Overview</h1>
          <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
            <div className="live-indicator"><div className="dot" /> Live Indicators</div>
            <RefreshBtn onClick={fetchStats}><FiRefreshCw /></RefreshBtn>
          </div>
        </HeaderSection>

        <Grid>
          <PremiumCard theme="primary" delay={0}>
            <div className="label">Total Registered</div>
            <div className="value"><AnimatedValue value={stats.total_registered_patients} /></div>
            <div className="trend"><FiUsers /> Lifetime Patients</div>
            <FiUsers className="icon" />
          </PremiumCard>

          <PremiumCard theme="secondary" delay={0.1}>
            <div className="label">Today's Visits</div>
            <div className="value"><AnimatedValue value={stats.today_total_visits} /></div>
            <div className="trend"><FiActivity /> Active Consultations</div>
            <FiActivity className="icon" />
          </PremiumCard>

          <PremiumCard theme="warning" delay={0.2}>
            <div className="label">New Registrations</div>
            <div className="value"><AnimatedValue value={stats.today_new_patients} /></div>
            <div className="trend"><FiUserPlus /> Onboarded Today</div>
            <FiUserPlus className="icon" />
          </PremiumCard>

          <PremiumCard theme="accent" delay={0.3}>
            <div className="label">Success Renewals</div>
            <div className="value"><AnimatedValue value={stats.today_renewals} /></div>
            <div className="trend"><FiUserCheck /> Returning Patients</div>
            <FiUserCheck className="icon" />
          </PremiumCard>
        </Grid>

        <ChartCard>
          <div className="header">
            <h3><FiCalendar /> Patient Volume Trends</h3>
            <div style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 600}}>Last 7 Days (Moving Average)</div>
          </div>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRenew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="New Patients" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
                <Area type="monotone" dataKey="Renewals" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRenew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </Container>
    </DashboardWrapper>
  );
};

export default Dashboard;
