import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import { Container } from "../GlobalStyles";
import {
    FiUsers, FiUserCheck, FiDollarSign, FiClock, FiActivity,
    FiCalendar, FiRefreshCw, FiTrendingUp, FiUser, FiInbox
} from "react-icons/fi";
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, AreaChart, Area
} from "recharts";

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

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 260px);
  padding: 28px 24px 60px;
  font-family: 'Inter', sans-serif;
`;

// ─── HERO / DOCTOR HEADER ────────────────────────────────────────────────────
const HeroCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, #312e81 0%, #4338ca 45%, #4f46e5 100%);
  border-radius: 28px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: white;
  box-shadow: 0 20px 40px -12px rgba(67, 56, 202, 0.45);
  animation: ${fadeIn} 0.5s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 85% 20%, rgba(255,255,255,0.15), transparent 55%);
    pointer-events: none;
  }
`;

const DoctorIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;

  .avatar {
    width: 62px; height: 62px;
    border-radius: 18px;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; font-weight: 800;
    backdrop-filter: blur(4px);
    flex-shrink: 0;
  }

  .meta {
    .eyebrow {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; opacity: 0.75; margin-bottom: 4px;
    }
    h1 {
      font-size: 1.6rem; font-weight: 800; margin: 0;
      letter-spacing: -0.02em;
    }
    .sub { font-size: 0.85rem; opacity: 0.8; margin-top: 4px; }
  }

  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4ade80;
    animation: ${pulse} 2s infinite;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const StyledSelect = styled.select`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.12);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  backdrop-filter: blur(4px);

  option { color: #1e293b; }

  &:focus { border-color: rgba(255,255,255,0.6); }
`;

const RefreshBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover { background: rgba(255,255,255,0.22); }
  svg { ${({ $spinning }) => $spinning && css`animation: ${rotate} 0.7s linear infinite;`} }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 22px 24px;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: all 0.2s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ index }) => index * 0.07}s;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12);
  }

  .icon-chip {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    background: ${({ $tint }) => $tint || '#eef2ff'};
    color: ${({ $accent }) => $accent || '#4f46e5'};
  }

  .label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  .value { font-size: 1.9rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
  .prefix { font-size: 1.1rem; vertical-align: middle; margin-right: 2px; color: #64748b; }
  .trend {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; font-weight: 600;
    color: ${({ $accent }) => $accent || '#4f46e5'};
  }
`;

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 20px;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 22px;
  padding: 26px;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
  border: 1px solid #eef2f6;

  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
  h3 { margin: 0; color: #1e293b; font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 9px; }
  h3 svg { color: #4f46e5; }
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  & + & { border-top: 1px solid #f1f5f9; }

  .swatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: ${({ $color }) => $color}; }
  .name { flex: 1; font-size: 0.88rem; font-weight: 600; color: #334155; }
  .bar-track { width: 130px; height: 6px; border-radius: 6px; background: #f1f5f9; overflow: hidden; flex-shrink: 0; }
  .bar-fill { height: 100%; border-radius: 6px; background: ${({ $color }) => $color}; transition: width 0.4s ease; }
  .amount { font-size: 0.9rem; font-weight: 800; color: #0f172a; min-width: 90px; text-align: right; }

  @media (max-width: 560px) { .bar-track { display: none; } }
`;

const PatientItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  transition: all 0.2s;
  &:hover { background: #f8fafc; }

  .info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    .avatar {
      width: 38px; height: 38px; border-radius: 11px;
      background: #e0e7ff; color: #4338ca;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem;
      flex-shrink: 0;
    }
    .text {
      display: flex; flex-direction: column; min-width: 0;
      strong { font-size: 0.9rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      span { font-size: 0.76rem; color: #94a3b8; margin-top: 2px; }
    }
  }
  .fee {
    background: #ecfdf5; color: #059669;
    padding: 5px 11px; border-radius: 30px;
    font-weight: 700; font-size: 0.8rem;
    flex-shrink: 0; margin-left: 10px;
  }
`;

// ─── EMPTY / LOADING STATES ──────────────────────────────────────────────────
const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 20px; color: #94a3b8; text-align: center;
  svg { font-size: 2rem; margin-bottom: 12px; opacity: 0.6; }
  .title { font-weight: 700; color: #64748b; font-size: 0.95rem; margin-bottom: 4px; }
  .sub { font-size: 0.82rem; }
`;

const SkeletonBlock = styled.div`
  border-radius: ${({ $radius }) => $radius || '10px'};
  height: ${({ $h }) => $h || '20px'};
  width: ${({ $w }) => $w || '100%'};
  background: linear-gradient(90deg, #eef2f6 0px, #f8fafc 40px, #eef2f6 80px);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

// ─── ANIMATED VALUE ──────────────────────────────────────────────────────────
const AnimatedValue = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const val = Number(value) || 0;
        let start = 0; const duration = 800; const step = val / (duration / 16) || val;
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
        doctors: [], selected_doctor: "", selected_doctor_name: "",
        kpis: {}, income_breakdown: [], monthly_trend: [], recent_patients: []
    });
    const [filter, setFilter] = useState({
        doctorId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [loading, setLoading] = useState(true);

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = { month: filter.month, year: filter.year };
            if (filter.doctorId) params.doctor_id = filter.doctorId;
            const { data } = await axios.get(`${Hmsbaseurl}doctor-dashboard/stats/`, { params });
            setData(data);
            if (!filter.doctorId && data.selected_doctor) {
                setFilter(prev => ({ ...prev, doctorId: data.selected_doctor }));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, [filter.month, filter.year, filter.doctorId]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const doctorName = data.selected_doctor_name || data.selected_doctor || "Doctor";
    const initials = doctorName.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "DR";
    const hasDoctors = data.doctors?.length > 0 && data.doctors[0]?.id !== "Unknown";

    return (
        <DashboardContainer>
            <Container style={{ maxWidth: 1400 }}>
                <HeroCard>
                    <DoctorIdentity>
                        <div className="avatar">{initials}</div>
                        <div className="meta">
                            <div className="eyebrow"><span className="dot" /> Live Performance</div>
                            <h1>Dr. {doctorName}</h1>
                            <div className="sub">Consultation &amp; admission analytics overview</div>
                        </div>
                    </DoctorIdentity>

                    <ControlsBar>
                        <StyledSelect
                            value={filter.doctorId}
                            onChange={e => setFilter({ ...filter, doctorId: e.target.value })}
                        >
                            {!hasDoctors && <option value="">No doctors found</option>}
                            {data.doctors.map(d => (
                                <option key={d.id} value={d.id}>Dr. {d.name}</option>
                            ))}
                        </StyledSelect>
                        <StyledSelect value={filter.month} onChange={e => setFilter({ ...filter, month: Number(e.target.value) })}>
                            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </StyledSelect>
                        <StyledSelect value={filter.year} onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </StyledSelect>
                        <RefreshBtn $spinning={loading} onClick={fetchStats}><FiRefreshCw /></RefreshBtn>
                    </ControlsBar>
                </HeroCard>

                {!loading && !hasDoctors ? (
                    <GlassCard>
                        <EmptyState>
                            <FiInbox />
                            <div className="title">No doctor activity recorded yet</div>
                            <div className="sub">Billing and admission records will populate this dashboard once available.</div>
                        </EmptyState>
                    </GlassCard>
                ) : (
                    <>
                        <KpiGrid>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <StatCard key={i} index={i}>
                                        <SkeletonBlock $w="42px" $h="42px" $radius="12px" />
                                        <SkeletonBlock $w="70%" $h="12px" />
                                        <SkeletonBlock $w="50%" $h="26px" />
                                    </StatCard>
                                ))
                            ) : (
                                <>
                                    <StatCard index={0} $tint="#eef2ff" $accent="#4f46e5">
                                        <div className="icon-chip"><FiUsers /></div>
                                        <div className="label">Today's OP Visits</div>
                                        <div className="value"><AnimatedValue value={data.kpis?.today_op || 0} /></div>
                                        <div className="trend"><FiUsers /> Daily consultations</div>
                                    </StatCard>
                                    <StatCard index={1} $tint="#ecfdf5" $accent="#059669">
                                        <div className="icon-chip"><FiUserCheck /></div>
                                        <div className="label">Today's IP Admissions</div>
                                        <div className="value"><AnimatedValue value={data.kpis?.today_ip || 0} /></div>
                                        <div className="trend"><FiUserCheck /> Active ward entries</div>
                                    </StatCard>
                                    <StatCard index={2} $tint="#fef3c7" $accent="#d97706">
                                        <div className="icon-chip"><FiDollarSign /></div>
                                        <div className="label">Monthly Revenue</div>
                                        <div className="value"><span className="prefix">₹</span><AnimatedValue value={data.kpis?.monthly_income || 0} /></div>
                                        <div className="trend"><FiTrendingUp /> Consultation + Pharmacy + Dept.</div>
                                    </StatCard>
                                    <StatCard index={3} $tint="#fee2e2" $accent="#dc2626">
                                        <div className="icon-chip"><FiActivity /></div>
                                        <div className="label">Total OP (Lifetime)</div>
                                        <div className="value"><AnimatedValue value={data.kpis?.total_op || 0} /></div>
                                        <div className="trend"><FiTrendingUp /> Cumulative trust</div>
                                    </StatCard>
                                </>
                            )}
                        </KpiGrid>

                        <DashboardGrid>
                            <GlassCard>
                                <div className="card-header">
                                    <h3><FiCalendar /> Patient Volume Trend</h3>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                        {months[filter.month - 1]} {filter.year}
                                    </div>
                                </div>
                                {loading ? (
                                    <SkeletonBlock $h="340px" $radius="16px" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={340}>
                                        <AreaChart data={data.monthly_trend}>
                                            <defs>
                                                <linearGradient id="colorOP" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorIP" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #eef2f6', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                                            <Area type="monotone" dataKey="OP" name="OP Visits" stroke="#4f46e5" strokeWidth={3} fill="url(#colorOP)" />
                                            <Area type="monotone" dataKey="IP" name="IP Admissions" stroke="#10b981" strokeWidth={3} fill="url(#colorIP)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </GlassCard>

                            <GlassCard>
                                <div className="card-header">
                                    <h3><FiClock /> Recent Consultations</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                                                <SkeletonBlock $w="38px" $h="38px" $radius="11px" />
                                                <SkeletonBlock $h="14px" />
                                            </div>
                                        ))
                                    ) : data.recent_patients?.length > 0 ? data.recent_patients.map((p, i) => (
                                        <PatientItem key={i}>
                                            <div className="info">
                                                <div className="avatar">{p.patient_name?.charAt(0) || <FiUser />}</div>
                                                <div className="text">
                                                    <strong>{p.patient_name}</strong>
                                                    <span>{p.uhid} • {p.date}</span>
                                                </div>
                                            </div>
                                            <div className="fee">₹{p.fee}</div>
                                        </PatientItem>
                                    )) : (
                                        <EmptyState>
                                            <FiInbox />
                                            <div className="title">No consultations yet</div>
                                            <div className="sub">Nothing recorded for this period.</div>
                                        </EmptyState>
                                    )}
                                </div>
                            </GlassCard>
                        </DashboardGrid>

                        <GlassCard style={{ marginTop: 20 }}>
                            <div className="card-header">
                                <h3><FiDollarSign /> Revenue Breakdown</h3>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                    {months[filter.month - 1]} {filter.year}
                                </div>
                            </div>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ padding: '12px 0' }}><SkeletonBlock $h="14px" /></div>
                                ))
                            ) : data.income_breakdown?.some(b => b.amount > 0) ? (
                                data.income_breakdown.map((b, i) => {
                                    const colors = ['#4f46e5', '#10b981', '#f59e0b'];
                                    const total = data.income_breakdown.reduce((s, x) => s + (x.amount || 0), 0) || 1;
                                    const pct = Math.round(((b.amount || 0) / total) * 100);
                                    return (
                                        <BreakdownRow key={i} $color={colors[i % colors.length]}>
                                            <div className="swatch" />
                                            <div className="name">{b.source}</div>
                                            <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                                            <div className="amount">₹{(b.amount || 0).toLocaleString()}</div>
                                        </BreakdownRow>
                                    );
                                })
                            ) : (
                                <EmptyState>
                                    <FiInbox />
                                    <div className="title">No revenue recorded</div>
                                    <div className="sub">Nothing billed for this doctor in this period.</div>
                                </EmptyState>
                            )}
                        </GlassCard>
                    </>
                )}
            </Container>
        </DashboardContainer>
    );
};

export default DoctorDashboard;
