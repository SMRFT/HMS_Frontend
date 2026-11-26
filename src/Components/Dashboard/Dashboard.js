import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import { Container } from "../GlobalStyles";
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiUserPlus,
  FiCalendar,
  FiRefreshCw,
  FiLogOut,
  FiHeart,
  FiTrendingUp,
  FiPieChart
} from "react-icons/fi";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.65; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const formatDateISO = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdfa 0%, #f8fafc 260px);
  padding: 24px 20px 60px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #0ea5e9 100%);
  border-radius: 22px;
  padding: 24px 28px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  box-shadow: 0 14px 30px -10px rgba(13, 148, 136, 0.35);

  .left {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      width: fit-content;

      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #6ee7b7;
        animation: ${pulse} 2s infinite;
      }
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 850;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.9;
      font-weight: 500;
    }
  }
`;

const FilterToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.22);
`;

const PresetGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  button {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.88);
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &.active {
      background: white;
      color: #0f766e;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.16);
      color: white;
    }
  }
`;

const DateInputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 5px 10px;
  border-radius: 10px;
  color: #334155;

  input {
    border: none;
    outline: none;
    font-size: 0.8rem;
    font-weight: 600;
    color: #0f172a;
    background: transparent;
  }

  span {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
  }
`;

const RefreshBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: white;
  border: none;
  color: #0f766e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: scale(1.05);
  }

  svg {
    ${({ $spinning }) =>
      $spinning &&
      css`
        animation: ${rotate} 0.75s linear infinite;
      `}
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CleanKpiCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px 22px;
  border: 1px solid #e2e8f0;
  border-top: 4px solid ${({ $accent }) => $accent || "#0d9488"};
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
  animation: ${fadeIn} 0.45s ease-out backwards;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 26px -10px rgba(15, 23, 42, 0.12);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .icon-pill {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: ${({ $tint }) => $tint || "#f0fdfa"};
      color: ${({ $accent }) => $accent || "#0d9488"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
  }

  .value {
    font-size: 2.15rem;
    font-weight: 850;
    color: #0f172a;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.76rem;
    font-weight: 600;
    color: #64748b;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;

    .tag {
      padding: 2px 8px;
      border-radius: 999px;
      background: ${({ $tint }) => $tint || "#f0fdfa"};
      color: ${({ $accent }) => $accent || "#0d9488"};
      font-weight: 700;
      font-size: 0.72rem;
    }
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
    flex-wrap: wrap;
    gap: 10px;

    h3 {
      margin: 0;
      color: #0f172a;
      font-weight: 800;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sub {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 600;
    }
  }
`;

const RatioStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;

  .ratio-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #f1f5f9;

    .r-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #475569;
    }

    .r-val {
      font-size: 0.9rem;
      font-weight: 800;
      color: #0f172a;
    }
  }
`;

// ─── ANIMATED VALUE ──────────────────────────────────────────────────────────
const AnimatedValue = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const val = Number(value) || 0;
    let start = 0;
    const duration = 600;
    const step = val / (duration / 16) || val;
    const timer = setInterval(() => {
      start += step;
      if (start >= val) {
        setDisplay(val);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const todayStr = formatDateISO(new Date());

  const [period, setPeriod] = useState("today");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  const [stats, setStats] = useState({
    today_ip: 0,
    today_normal_ip: 0,
    today_daycare_ip: 0,
    today_op: 0,
    today_new_patients: 0,
    today_renewals: 0,
    today_discharge: 0,
    chart_data: []
  });
  const [loading, setLoading] = useState(true);

  const Hmsbaseurl =
    process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

  const handlePresetClick = (p) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (p === "yesterday") {
      start.setDate(now.getDate() - 1);
      end.setDate(now.getDate() - 1);
    } else if (p === "week") {
      start.setDate(now.getDate() - 6);
    } else if (p === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    setPeriod(p);
    setFromDate(formatDateISO(start));
    setToDate(formatDateISO(end));
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${Hmsbaseurl}dashboard/stats/`, {
        params: { period, from_date: fromDate, to_date: toDate }
      });
      setStats(data);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  }, [Hmsbaseurl, period, fromDate, toDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const opCount = Number(stats.today_op || 0);
  const newCount = Number(stats.today_new_patients || 0);
  const renewCount = Number(stats.today_renewals || 0);
  const ipCount = Number(stats.today_ip || 0);
  const disCount = Number(stats.today_discharge || 0);

  const renewPct = opCount > 0 ? Math.round((renewCount / opCount) * 100) : 0;
  const newPct = opCount > 0 ? 100 - renewPct : 0;

  const mixData = [
    { name: "New Patients", value: newCount, color: "#10b981" },
    { name: "Renewals", value: renewCount, color: "#f59e0b" },
    { name: "IP Admissions", value: ipCount, color: "#0d9488" }
  ].filter((d) => d.value > 0);

  const rangeSubtitle =
    period === "today"
      ? "Today's Live Metrics"
      : period === "yesterday"
        ? "Yesterday's Summary"
        : `${fromDate} to ${toDate}`;

  return (
    <DashboardWrapper>
      <Container>
        <HeroBanner>
          <div className="left">
            <div className="badge-live">
              <div className="dot" /> Live Hospital Overview
            </div>
            <h1>
              <FiActivity /> Hospital Activity Dashboard
            </h1>
            <p>
              Showing IP admissions, OP visits, new &amp; renewal registrations, and discharges ({rangeSubtitle})
            </p>
          </div>

          <FilterToolbar>
            <PresetGroup>
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "week", label: "7 Days" },
                { id: "month", label: "This Month" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  className={period === btn.id ? "active" : ""}
                  onClick={() => handlePresetClick(btn.id)}
                >
                  {btn.label}
                </button>
              ))}
            </PresetGroup>

            <DateInputBox>
              <FiCalendar size={14} color="#0d9488" />
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => {
                  setPeriod("custom");
                  setFromDate(e.target.value);
                }}
              />
              <span>to</span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={todayStr}
                onChange={(e) => {
                  setPeriod("custom");
                  setToDate(e.target.value);
                }}
              />
            </DateInputBox>

            <RefreshBtn $spinning={loading} onClick={fetchStats} title="Refresh Metrics">
              <FiRefreshCw size={16} />
            </RefreshBtn>
          </FilterToolbar>
        </HeroBanner>

        {/* ─── 5 MODERN KPI CARDS ──────────────────────────────────────────── */}
        <KpiGrid>
          <CleanKpiCard $accent="#0d9488" $tint="#f0fdfa" $delay={0}>
            <div className="card-top">
              <span className="label">{period === "today" ? "Today's IP" : "IP Admissions"}</span>
              <div className="icon-pill">
                <FiHeart />
              </div>
            </div>
            <div className="value">
              <AnimatedValue value={ipCount} />
            </div>
            <div className="footer-meta">
              <span>Normal: {stats.today_normal_ip || 0} · Day Care: {stats.today_daycare_ip || 0}</span>
              <span className="tag">Inpatient</span>
            </div>
          </CleanKpiCard>

          <CleanKpiCard $accent="#2563eb" $tint="#eff6ff" $delay={0.05}>
            <div className="card-top">
              <span className="label">{period === "today" ? "Today's OP" : "OP Visits"}</span>
              <div className="icon-pill">
                <FiUsers />
              </div>
            </div>
            <div className="value">
              <AnimatedValue value={opCount} />
            </div>
            <div className="footer-meta">
              <span>Total Consultations</span>
              <span className="tag">Outpatient</span>
            </div>
          </CleanKpiCard>

          <CleanKpiCard $accent="#10b981" $tint="#ecfdf5" $delay={0.1}>
            <div className="card-top">
              <span className="label">{period === "today" ? "Today's New" : "New Patients"}</span>
              <div className="icon-pill">
                <FiUserPlus />
              </div>
            </div>
            <div className="value">
              <AnimatedValue value={newCount} />
            </div>
            <div className="footer-meta">
              <span>First-time UHID</span>
              <span className="tag">{newPct}% of OP</span>
            </div>
          </CleanKpiCard>

          <CleanKpiCard $accent="#d97706" $tint="#fffbeb" $delay={0.15}>
            <div className="card-top">
              <span className="label">{period === "today" ? "Today's Renew" : "Renewals"}</span>
              <div className="icon-pill">
                <FiUserCheck />
              </div>
            </div>
            <div className="value">
              <AnimatedValue value={renewCount} />
            </div>
            <div className="footer-meta">
              <span>Follow-up Visits</span>
              <span className="tag">{renewPct}% of OP</span>
            </div>
          </CleanKpiCard>

          <CleanKpiCard $accent="#7c3aed" $tint="#f5f3ff" $delay={0.2}>
            <div className="card-top">
              <span className="label">{period === "today" ? "Today's Discharge" : "Discharges"}</span>
              <div className="icon-pill">
                <FiLogOut />
              </div>
            </div>
            <div className="value">
              <AnimatedValue value={disCount} />
            </div>
            <div className="footer-meta">
              <span>Completed Cases</span>
              <span className="tag">Discharged</span>
            </div>
          </CleanKpiCard>
        </KpiGrid>

        {/* ─── CHARTS ROW ──────────────────────────────────────────────────── */}
        <ChartsRow>
          <ChartCard>
            <div className="header">
              <h3>
                <FiTrendingUp color="#0d9488" /> Patient Flow Trends
              </h3>
              <span className="sub">OP, New, Renewals, IP &amp; Discharges</span>
            </div>
            <div style={{ width: "100%", height: 340, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cOP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cRenew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 10px 20px rgba(0,0,0,0.06)" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="OP Visits" stroke="#2563eb" strokeWidth={2.5} fill="url(#cOP)" />
                  <Area type="monotone" dataKey="New Patients" stroke="#10b981" strokeWidth={2.5} fill="url(#cNew)" />
                  <Area type="monotone" dataKey="Renewals" stroke="#d97706" strokeWidth={2} fill="url(#cRenew)" />
                  <Area type="monotone" dataKey="IP Admissions" stroke="#0d9488" strokeWidth={2.5} fillOpacity={0} />
                  <Area type="monotone" dataKey="Discharges" stroke="#7c3aed" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard>
            <div className="header">
              <h3>
                <FiPieChart color="#2563eb" /> Period Patient Mix
              </h3>
              <span className="sub">{rangeSubtitle}</span>
            </div>
            {mixData.length === 0 ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600 }}>
                No visits recorded for selected range
              </div>
            ) : (
              <div style={{ width: "100%", height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {mixData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <RatioStats>
              <div className="ratio-item">
                <span className="r-label">OP Renewal Rate</span>
                <span className="r-val" style={{ color: "#d97706" }}>{renewPct}%</span>
              </div>
              <div className="ratio-item">
                <span className="r-label">New Patient Share</span>
                <span className="r-val" style={{ color: "#10b981" }}>{newPct}%</span>
              </div>
              <div className="ratio-item">
                <span className="r-label">IP vs Discharge Ratio</span>
                <span className="r-val" style={{ color: "#0d9488" }}>
                  {ipCount} Admitted / {disCount} Discharged
                </span>
              </div>
            </RatioStats>
          </ChartCard>
        </ChartsRow>
      </Container>
    </DashboardWrapper>
  );
};

export default Dashboard;
