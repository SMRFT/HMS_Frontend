import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { Container } from "../GlobalStyles";
import { FiUsers, FiUserCheck, FiDollarSign, FiClock, FiActivity, FiUserPlus } from "react-icons/fi";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CARD_THEMES = [
    { gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', glow: 'rgba(15,23,42,0.3)', icon: 'rgba(255,255,255,0.1)' },
    { gradient: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)', glow: 'rgba(67,56,202,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', glow: 'rgba(5,150,105,0.35)', icon: 'rgba(255,255,255,0.2)' },
    { gradient: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)', glow: 'rgba(185,28,28,0.35)', icon: 'rgba(255,255,255,0.2)' },
];

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── WRAPPER ─────────────────────────────────────────────────────────────────
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: #f1f5f9;
  padding: 30px 0 60px;
  font-family: 'Inter', -apple-system, sans-serif;
`;

// ─── HEADER SECTION ──────────────────────────────────────────────────────────
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  animation: ${fadeInDown} 0.5s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.03em;
`;

const HeaderSubtitle = styled.p`
  color: #64748b;
  margin: 6px 0 0 0;
  font-size: 0.95rem;
  font-weight: 500;
`;

// ─── CONTROL PANEL ───────────────────────────────────────────────────────────
const ControlPanel = styled.div`
  display: flex;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  select {
    border: none;
    background: transparent;
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
    outline: none;
    cursor: pointer;
    padding: 4px 8px;
    
    &:focus {
      color: #4338ca;
    }
  }

  .divider {
    width: 1px;
    background: #e2e8f0;
    margin: 0 4px;
  }
`;

// ─── KPI GRID ────────────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`;

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCardWrapper = styled.div`
  background: ${({ theme }) => theme.gradient};
  border-radius: 20px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px ${({ theme }) => theme.glow};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px ${({ theme }) => theme.glow};
  }

  /* Abstract background decorations */
  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -10%;
    width: 150px;
    height: 150px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    filter: blur(20px);
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;

  span.currency {
    font-size: 1.2rem;
    opacity: 0.8;
  }
`;

const StatIconBox = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ theme }) => theme.icon};
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

// ─── CHARTS & PANELS LAYOUT ──────────────────────────────────────────────────
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// ─── CARDS & SURFACES ────────────────────────────────────────────────────────
const SurfaceDataCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
`;

const SurfaceTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #4338ca;
  }
`;

// ─── LIST ITEMS ──────────────────────────────────────────────────────────────
const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e0e7ff;
    color: #4338ca;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    
    strong {
      font-size: 0.9rem;
      color: #1e293b;
    }
    span {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 2px;
    }
  }
`;

const PatientFee = styled.div`
  font-weight: 700;
  color: #059669;
  font-size: 0.95rem;
  background: #d1fae5;
  padding: 4px 10px;
  border-radius: 20px;
`;

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
const PulseBox = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s infinite linear;
  border-radius: ${({ radius }) => radius || '8px'};
  height: ${({ h }) => h || '20px'};
  width: ${({ w }) => w || '100%'};
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// ─── ANIMATED COUNTER HOOK ───────────────────────────────────────────────────
function useCountUp(target) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === undefined || target === null) return;
        let start = 0;
        const duration = 800; // ms
        const tick = 16;
        const step = target / (duration / tick);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, tick);
        return () => clearInterval(timer);
    }, [target]);
    return count;
}

// ─── KPI COMPONENT ───────────────────────────────────────────────────────────
const DoctorKpiCard = ({ label, value, icon, themeIndex, currency = false }) => {
    const theme = CARD_THEMES[themeIndex % CARD_THEMES.length];
    const animatedValue = useCountUp(typeof value === 'number' ? value : Number(value) || 0);

    return (
        <StatCardWrapper theme={theme}>
            <StatLabel>{label}</StatLabel>
            <StatValue>
                {currency && <span className="currency">₹</span>}
                {currency ? animatedValue.toLocaleString() : animatedValue}
            </StatValue>
            <StatIconBox theme={theme}>{icon}</StatIconBox>
        </StatCardWrapper>
    );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const DoctorDashboard = () => {
    const [data, setData] = useState({
        doctors: [],
        selected_doctor: "",
        kpis: {},
        monthly_trend: [],
        recent_patients: []
    });

    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const baseUrl = Hmsbaseurl || "http://127.0.0.1:8000/hospital/";
                const params = { month: filterMonth, year: filterYear };
                if (selectedDoctor) params.doctor_name = selectedDoctor;

                const response = await axios.get(`${baseUrl}doctor-dashboard/stats/`, { params });
                setData(response.data);

                // Initialize selected doctor in select box
                if (!selectedDoctor && response.data.selected_doctor) {
                    setSelectedDoctor(response.data.selected_doctor);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Failed to load doctor dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [Hmsbaseurl, filterMonth, filterYear, selectedDoctor]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    const tooltipStyle = {
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        padding: '10px 14px',
        fontWeight: '500'
    };

    return (
        <DashboardWrapper>
            <Container style={{ maxWidth: '1400px', padding: '0 24px' }}>

                {/* ── HEADER & CONTROLS ── */}
                <HeaderContainer>
                    <div>
                        <HeaderTitle>Doctor Dashboard</HeaderTitle>
                        <HeaderSubtitle>Personalized performance & clinical insights</HeaderSubtitle>
                    </div>

                    <ControlPanel>
                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select Doctor...</option>
                            {data.doctors.map(doc => (
                                <option key={doc.id} value={doc.name}>Dr. {doc.name}</option>
                            ))}
                        </select>

                        <div className="divider" />

                        <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
                            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </select>

                        <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </ControlPanel>
                </HeaderContainer>

                {error && <ErrorAlert><span>⚠</span> {error}</ErrorAlert>}

                {loading ? (
                    <>
                        <KpiGrid>
                            {[...Array(4)].map((_, i) => <PulseBox key={i} h="136px" radius="20px" />)}
                        </KpiGrid>
                        <DashboardGrid>
                            <PulseBox h="400px" radius="20px" />
                            <PulseBox h="400px" radius="20px" />
                        </DashboardGrid>
                    </>
                ) : (
                    <>
                        {/* ── KPI METRICS ── */}
                        <KpiGrid>
                            <DoctorKpiCard
                                label="Today's OP Visits"
                                value={data.kpis?.today_op}
                                icon={<FiUsers />}
                                themeIndex={0}
                            />
                            <DoctorKpiCard
                                label="Today's IP Admissions"
                                value={data.kpis?.today_ip}
                                icon={<FiUserCheck />}
                                themeIndex={1}
                            />
                            <DoctorKpiCard
                                label="Total OP (Lifetime)"
                                value={data.kpis?.total_op}
                                icon={<FiActivity />}
                                themeIndex={2}
                            />
                            <DoctorKpiCard
                                label="Monthly Revenue"
                                value={data.kpis?.monthly_income}
                                icon={<FiDollarSign />}
                                themeIndex={3}
                                currency={true}
                            />
                        </KpiGrid>

                        <DashboardGrid>
                            {/* ── CHART: PATIENT TREND ── */}
                            <SurfaceDataCard>
                                <SurfaceTitle>
                                    <FiActivity /> Patient Flow Trend ({months[filterMonth - 1]} {filterYear})
                                </SurfaceTitle>
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4338ca" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorIP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" />
                                        <Area type="monotone" dataKey="OP" stroke="#4338ca" strokeWidth={3} fillOpacity={1} fill="url(#colorOP)" />
                                        <Area type="monotone" dataKey="IP" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorIP)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </SurfaceDataCard>

                            {/* ── RECENT PATIENTS LIST ── */}
                            <SurfaceDataCard>
                                <SurfaceTitle>
                                    <FiUserPlus /> Recent Consultations
                                </SurfaceTitle>

                                {data.recent_patients?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {data.recent_patients.map((pat, idx) => (
                                            <ListItem key={idx}>
                                                <PatientInfo>
                                                    <div className="avatar">
                                                        {pat.patient_name?.charAt(0) || 'P'}
                                                    </div>
                                                    <div className="details">
                                                        <strong>{pat.patient_name}</strong>
                                                        <span>{pat.uhid} • {pat.date}</span>
                                                    </div>
                                                </PatientInfo>
                                                <PatientFee>₹{pat.fee}</PatientFee>
                                            </ListItem>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                                        No recent consultations found for this month.
                                    </div>
                                )}
                            </SurfaceDataCard>
                        </DashboardGrid>
                    </>
                )}
            </Container>
        </DashboardWrapper>
    );
};

export default DoctorDashboard;
