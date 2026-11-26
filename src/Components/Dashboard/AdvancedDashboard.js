import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiUserPlus,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiRefreshCw,
  FiExternalLink,
  FiInbox,
  FiLayers
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const currency = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDateISO = (d) => d.toISOString().split("T")[0];

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
  font-family: "Inter", -apple-system, sans-serif;

  @media (max-width: 768px) {
    padding: 15px 12px 40px;
  }
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

const PeriodTabs = styled.div`
  display: flex;
  background: white;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  button {
    border: none;
    background: transparent;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;

    &.active {
      background: #4f46e5;
      color: white;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
    }

    &:hover:not(.active) {
      color: #0f172a;
      background: #f1f5f9;
    }
  }
`;

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  input {
    border: none;
    outline: none;
    font-size: 0.82rem;
    font-weight: 600;
    color: #1e293b;
    background: transparent;
  }

  span {
    color: #94a3b8;
    font-size: 0.78rem;
    font-weight: 600;
  }
`;

const LifetimeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#4f46e5" : "#e2e8f0")};
  background: ${({ $active }) => ($active ? "#4f46e5" : "white")};
  color: ${({ $active }) => ($active ? "white" : "#334155")};
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  .switch-track {
    width: 30px;
    height: 16px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "rgba(255,255,255,0.3)" : "#cbd5e1")};
    position: relative;
    transition: background 0.2s;

    .switch-thumb {
      position: absolute;
      top: 2px;
      left: ${({ $active }) => ($active ? "16px" : "2px")};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      transition: left 0.2s;
    }
  }

  &:hover {
    border-color: #4f46e5;
  }
`;

const StyledSelect = styled.select`
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.83rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: #3b82f6;
  }
`;

const RefreshBtn = styled.button`
  width: 38px;
  height: 38px;
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
  &:hover {
    color: #3b82f6;
    border-color: #3b82f6;
  }
  svg {
    ${({ $spinning }) =>
      $spinning &&
      css`
        animation: ${rotate} 0.7s linear infinite;
      `}
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 26px 0 14px;
  gap: 12px;

  h2 {
    font-size: 0.95rem;
    font-weight: 800;
    color: #334155;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .line {
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  .pill {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    background: ${({ $pillBg }) => $pillBg || "#eef2ff"};
    color: ${({ $pillColor }) => $pillColor || "#4f46e5"};
  }
`;

// ─── REVENUE PANELS ──────────────────────────────────────────────────────────
const RevenueGrid = styled.div`
  display: grid;
  grid-template-columns: 1.35fr repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const HeroRevenueCard = styled.div`
  background: ${({ $bg }) => $bg || "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"};
  padding: 20px 22px;
  border-radius: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
  animation: ${fadeIn} 0.45s ease-out backwards;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(255, 255, 255, 0.16);
      padding: 4px 10px;
      border-radius: 20px;
    }
  }

  .value {
    font-size: 1.85rem;
    font-weight: 850;
    letter-spacing: -0.02em;
    margin: 4px 0;
  }

  .sub {
    font-size: 0.78rem;
    opacity: 0.85;
    font-weight: 500;
  }
`;

const KpiRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: all 0.2s;
  animation: ${fadeIn} 0.5s ease-out backwards;
  animation-delay: ${({ delay }) => delay || 0}s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.1);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon-chip {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    background: ${({ $tint }) => $tint || "#eef2ff"};
    color: ${({ $accent }) => $accent || "#4f46e5"};
  }

  .label {
    font-size: 0.74rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .value {
    font-size: 1.45rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .suffix {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }
`;

// ─── CHARTS ──────────────────────────────────────────────────────────────────
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 22px;
  padding: 24px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 8px;
  }
  h3 {
    margin: 0;
    color: #1e293b;
    font-weight: 800;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  h3 svg {
    color: #4f46e5;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartEmptyState = styled.div`
  height: ${({ $h }) => $h || 280}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
  svg {
    font-size: 1.8rem;
    margin-bottom: 10px;
    opacity: 0.6;
  }
  .title {
    font-weight: 700;
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }
  .sub {
    font-size: 0.78rem;
  }
`;

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
const AnimatedValue = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const val = Number(String(value).replace(/[^0-9.]/g, "")) || 0;
    let start = 0;
    const duration = 700;
    const step = val / (duration / 16) || val;
    const timer = setInterval(() => {
      start += step;
      if (start >= val) {
        setDisplay(Math.round(val));
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  if (typeof value === "string" && value.includes("/")) return <span>{value}</span>;
  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
};

// ─── EMPTY-DATA HELPER ───────────────────────────────────────────────────────
const isEmptySeries = (arr, keys) => {
  if (!arr || arr.length === 0) return true;
  return !arr.some((row) => keys.some((k) => Number(row[k]) > 0));
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const AdvancedDashboard = () => {
  const todayStr = formatDateISO(new Date());

  const [period, setPeriod] = useState("today");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [showLifetime, setShowLifetime] = useState(false); // Disabled by default per user request

  const [stats, setStats] = useState({
    kpis: {},
    revenue_breakdown: { lifetime_enabled: false, lifetime: null, today: {} },
    monthly_op_ip: [],
    monthly_income_expense: [],
    todays_income_method: [],
    doctor_wise: [],
    bed_occupancy: []
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const Hmsbaseurl =
    process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:8000/hospital/";

  const handlePreset = (p) => {
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
      const { data } = await axios.get(`${Hmsbaseurl}advanced-dashboard/stats/`, {
        params: {
          period,
          from_date: fromDate,
          to_date: toDate,
          month: filter.month,
          year: filter.year,
          include_lifetime: showLifetime
        }
      });
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [Hmsbaseurl, period, fromDate, toDate, filter, showLifetime]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const lifetimeRev = stats.revenue_breakdown?.lifetime || null;
  const periodRev = stats.revenue_breakdown?.today || {};

  const periodLabel =
    period === "today"
      ? "Today's"
      : period === "yesterday"
        ? "Yesterday's"
        : `${fromDate} to ${toDate}`;

  const trafficEmpty = isEmptySeries(stats.monthly_op_ip, ["OP", "IP"]);
  const incomeExpenseEmpty = isEmptySeries(stats.monthly_income_expense, ["Income", "Expense"]);
  const doctorWiseEmpty = !stats.doctor_wise || stats.doctor_wise.length === 0;
  const incomeMixEmpty = !stats.todays_income_method || stats.todays_income_method.length === 0;
  const occupancyEmpty = !stats.bed_occupancy || stats.bed_occupancy.every((b) => !b.value);

  return (
    <DashboardContainer>
      <HeaderSection>
        <h1>
          <FiActivity style={{ color: "#4f46e5" }} /> Health Analytics &amp; Revenue Command
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <ActionBar>
            <PeriodTabs>
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "week", label: "7 Days" },
                { id: "month", label: "Month" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={period === tab.id ? "active" : ""}
                  onClick={() => handlePreset(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </PeriodTabs>

            <DateRangeWrapper>
              <FiCalendar size={14} color="#4f46e5" />
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
            </DateRangeWrapper>

            {/* Lifetime Enable Toggle */}
            <LifetimeToggle
              $active={showLifetime}
              onClick={() => setShowLifetime((prev) => !prev)}
              title="Enable to view cumulative all-time lifetime revenues"
            >
              <FiLayers size={14} />
              <span>Lifetime Revenue</span>
              <div className="switch-track">
                <div className="switch-thumb" />
              </div>
            </LifetimeToggle>

            <StyledSelect
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: Number(e.target.value) })}
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </StyledSelect>
            <StyledSelect
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: Number(e.target.value) })}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </StyledSelect>
            <RefreshBtn $spinning={loading} onClick={fetchStats} title="Refresh">
              <FiRefreshCw />
            </RefreshBtn>
          </ActionBar>
        </div>
      </HeaderSection>

      {/* ─── SECTION 1 (OPTIONAL): LIFETIME REVENUES (ONLY WHEN ENABLED) ───── */}
      {showLifetime && lifetimeRev && (
        <>
          <SectionHeader $pillBg="#eef2ff" $pillColor="#4338ca">
            <h2>
              <FiLayers style={{ color: "#4f46e5" }} /> Overall Lifetime Revenues
            </h2>
            <div className="line" />
            <span className="pill">Cumulative All-Time Totals</span>
          </SectionHeader>

          <RevenueGrid>
            <HeroRevenueCard $bg="linear-gradient(135deg, #312e81 0%, #4338ca 100%)">
              <div className="top-row">
                <span className="tag">Total Lifetime Revenue</span>
                <FiTrendingUp size={20} style={{ opacity: 0.85 }} />
              </div>
              <div>
                <div className="value">
                  <AnimatedValue value={lifetimeRev.total || 0} prefix="₹" />
                </div>
                <div className="sub">All departments combined (OP + IP + Pharm + Inv)</div>
              </div>
            </HeroRevenueCard>

            <StatCard delay={0.05} $tint="#ecfdf5" $accent="#059669">
              <div className="top">
                <div className="label">OP Revenue</div>
                <div className="icon-chip">
                  <FiUsers />
                </div>
              </div>
              <div>
                <div className="value">
                  <AnimatedValue value={lifetimeRev.op || 0} prefix="₹" />
                </div>
                <div className="suffix">Outpatient consultations</div>
              </div>
            </StatCard>

            <StatCard delay={0.1} $tint="#eff6ff" $accent="#2563eb">
              <div className="top">
                <div className="label">IP &amp; Discharge</div>
                <div className="icon-chip">
                  <FiExternalLink />
                </div>
              </div>
              <div>
                <div className="value">
                  <AnimatedValue value={lifetimeRev.ip || 0} prefix="₹" />
                </div>
                <div className="suffix">Inpatient &amp; discharge bills</div>
              </div>
            </StatCard>

            <StatCard delay={0.15} $tint="#fff7ed" $accent="#d97706">
              <div className="top">
                <div className="label">Pharmacy</div>
                <div className="icon-chip">
                  <FiDollarSign />
                </div>
              </div>
              <div>
                <div className="value">
                  <AnimatedValue value={lifetimeRev.pharmacy || 0} prefix="₹" />
                </div>
                <div className="suffix">Paid medicine sales</div>
              </div>
            </StatCard>

            <StatCard delay={0.2} $tint="#f5f3ff" $accent="#7c3aed">
              <div className="top">
                <div className="label">Investigations</div>
                <div className="icon-chip">
                  <FiActivity />
                </div>
              </div>
              <div>
                <div className="value">
                  <AnimatedValue value={lifetimeRev.investigation || 0} prefix="₹" />
                </div>
                <div className="suffix">Lab &amp; Radiology billed</div>
              </div>
            </StatCard>
          </RevenueGrid>
        </>
      )}

      {/* ─── SECTION 2: FILTERED / TODAY REVENUE BREAKDOWN ───────────────────── */}
      <SectionHeader $pillBg="#ecfdf5" $pillColor="#047857">
        <h2>
          <FiDollarSign style={{ color: "#10b981" }} /> {periodLabel} Revenue Breakdown
        </h2>
        <div className="line" />
        <span className="pill">{period === "today" ? "Live Collections Today" : `${fromDate} → ${toDate}`}</span>
      </SectionHeader>

      <RevenueGrid>
        <HeroRevenueCard $bg="linear-gradient(135deg, #065f46 0%, #059669 100%)">
          <div className="top-row">
            <span className="tag">{period === "today" ? "Today's Total Revenue" : "Period Total Revenue"}</span>
            <FiDollarSign size={20} style={{ opacity: 0.85 }} />
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={periodRev.total || stats.kpis?.today_revenue || 0} prefix="₹" />
            </div>
            <div className="sub">Verified payments collected in selected dates</div>
          </div>
        </HeroRevenueCard>

        <StatCard delay={0.05} $tint="#ecfdf5" $accent="#059669">
          <div className="top">
            <div className="label">OP Revenue</div>
            <div className="icon-chip">
              <FiUsers />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={periodRev.op || 0} prefix="₹" />
            </div>
            <div className="suffix">OP billing paid</div>
          </div>
        </StatCard>

        <StatCard delay={0.1} $tint="#eff6ff" $accent="#2563eb">
          <div className="top">
            <div className="label">IP &amp; Advance</div>
            <div className="icon-chip">
              <FiUserCheck />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={periodRev.ip || 0} prefix="₹" />
            </div>
            <div className="suffix">
              Disch: {currency(periodRev.ip_discharge || 0)} · Adv: {currency(periodRev.ip_advance || 0)}
            </div>
          </div>
        </StatCard>

        <StatCard delay={0.15} $tint="#fff7ed" $accent="#d97706">
          <div className="top">
            <div className="label">Pharmacy</div>
            <div className="icon-chip">
              <FiDollarSign />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={periodRev.pharmacy || 0} prefix="₹" />
            </div>
            <div className="suffix">Pharmacy collected</div>
          </div>
        </StatCard>

        <StatCard delay={0.2} $tint="#f5f3ff" $accent="#7c3aed">
          <div className="top">
            <div className="label">Investigations</div>
            <div className="icon-chip">
              <FiActivity />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={periodRev.investigation || 0} prefix="₹" />
            </div>
            <div className="suffix">Lab &amp; Radiology paid</div>
          </div>
        </StatCard>
      </RevenueGrid>

      {/* ─── SECTION 3: PATIENT VOLUMES & OCCUPANCY ──────────────────────────── */}
      <SectionHeader $pillBg="#f1f5f9" $pillColor="#475569">
        <h2>
          <FiUsers style={{ color: "#3b82f6" }} /> Hospital Operations &amp; Volume KPIs
        </h2>
        <div className="line" />
        <span className="pill">{period === "today" ? "Today's Activity" : `${fromDate} → ${toDate}`}</span>
      </SectionHeader>

      <KpiRow>
        <StatCard delay={0} $tint="#ecfeff" $accent="#0891b2">
          <div className="top">
            <div className="label">IP / OP Volume</div>
            <div className="icon-chip">
              <FiTrendingUp />
            </div>
          </div>
          <div>
            <div className="value">
              {stats.kpis?.today_ip || 0} IP / {stats.kpis?.today_op || 0} OP
            </div>
            <div className="suffix">Admissions &amp; Outpatient visits in range</div>
          </div>
        </StatCard>

        <StatCard delay={0.05} $tint="#fff1f2" $accent="#e11d48">
          <div className="top">
            <div className="label">Discharges</div>
            <div className="icon-chip">
              <FiExternalLink />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={stats.kpis?.today_discharge || 0} />
            </div>
            <div className="suffix">Patients discharged in range</div>
          </div>
        </StatCard>

        <StatCard delay={0.1} $tint="#f5f3ff" $accent="#7c3aed">
          <div className="top">
            <div className="label">Current Occupancy</div>
            <div className="icon-chip">
              <FiUserPlus />
            </div>
          </div>
          <div>
            <div className="value">
              <AnimatedValue value={stats.kpis?.current_ip || 0} />
            </div>
            <div className="suffix">Active inpatients currently admitted</div>
          </div>
        </StatCard>

        {showLifetime && lifetimeRev && (
          <StatCard delay={0.15} $tint="#eff6ff" $accent="#2563eb">
            <div className="top">
              <div className="label">Lifetime OP / IP</div>
              <div className="icon-chip">
                <FiUsers />
              </div>
            </div>
            <div>
              <div className="value" style={{ fontSize: "1.25rem" }}>
                {(lifetimeRev.total_op_count || 0).toLocaleString()} / {(lifetimeRev.total_ip_count || 0).toLocaleString()}
              </div>
              <div className="suffix">
                Total discharges: {(lifetimeRev.total_discharge_count || 0).toLocaleString()}
              </div>
            </div>
          </StatCard>
        )}
      </KpiRow>

      {/* ─── SECTION 4: TRENDS & MIX ─────────────────────────────────────────── */}
      <SectionHeader $pillBg="#f1f5f9" $pillColor="#475569">
        <h2>
          <FiCalendar style={{ color: "#4f46e5" }} /> Monthly Trends
        </h2>
        <div className="line" />
        <span className="pill">
          {months[filter.month - 1]} {filter.year}
        </span>
      </SectionHeader>

      <MainGrid>
        <GlassCard>
          <div className="card-header">
            <h3>
              <FiActivity /> Patient Traffic Trends
            </h3>
          </div>
          {trafficEmpty ? (
            <ChartEmptyState $h={320}>
              <FiInbox />
              <div className="title">No patient traffic yet</div>
              <div className="sub">
                No OP/IP records for {months[filter.month - 1]} {filter.year}.
              </div>
            </ChartEmptyState>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={stats.monthly_op_ip}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="OP" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="IP" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <div className="card-header">
            <h3>
              <FiDollarSign /> Income vs Expense
            </h3>
          </div>
          {incomeExpenseEmpty ? (
            <ChartEmptyState $h={320}>
              <FiInbox />
              <div className="title">No income/expense data yet</div>
              <div className="sub">
                No billing or GRN records for {months[filter.month - 1]} {filter.year}.
              </div>
            </ChartEmptyState>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.monthly_income_expense}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(v) => currency(v)}
                  contentStyle={{ borderRadius: "16px", border: "1px solid #eef2f6" }}
                />
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
          <div className="card-header">
            <h3>
              <FiCalendar /> Doctor-wise Monthly Income
            </h3>
          </div>
          {doctorWiseEmpty ? (
            <ChartEmptyState>
              <FiInbox />
              <div className="title">No doctor billing yet</div>
              <div className="sub">
                No consultations recorded for {months[filter.month - 1]} {filter.year}.
              </div>
            </ChartEmptyState>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={stats.doctor_wise}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <RechartsTooltip formatter={(v, name) => (name === "Monthly Income" || name === "Amount" ? currency(v) : v)} />
                <Legend />
                <Bar yAxisId="left" dataKey="OP" name="OP Visits" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                <Bar yAxisId="left" dataKey="IP" name="IP Admissions" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Amount"
                  name="Monthly Income"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <div className="card-header">
            <h3>
              <FiClock /> Income Mix ({period === "today" ? "Today" : "Period"})
            </h3>
          </div>
          {incomeMixEmpty ? (
            <ChartEmptyState>
              <FiInbox />
              <div className="title">No payments in period</div>
              <div className="sub">Income methods will appear here once billed.</div>
            </ChartEmptyState>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.todays_income_method}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="method"
                >
                  {stats.todays_income_method.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v) => currency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <div className="card-header">
            <h3>
              <FiActivity /> Occupancy
            </h3>
          </div>
          {occupancyEmpty ? (
            <ChartEmptyState>
              <FiInbox />
              <div className="title">No bed data</div>
              <div className="sub">Room capacity or occupancy not recorded yet.</div>
            </ChartEmptyState>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.bed_occupancy}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell fill="#4f46e5" />
                  <Cell fill="#e2e8f0" />
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
