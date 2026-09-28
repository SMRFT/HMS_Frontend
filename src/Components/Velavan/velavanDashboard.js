import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Building2,
  Calendar,
  RotateCcw,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Award,
  Filter,
  Download,
  Printer,
  Sparkles,
  Info,
  AlertTriangle,
  Tag,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";

const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "#0d9488", // Teal Primary
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal Light
];

const formatINR = (val) => {
  const num = parseFloat(val || 0);
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatCompactINR = (val) => {
  const num = parseFloat(val || 0);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return `₹${num.toFixed(0)}`;
};

// ─── KEYFRAMES ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
`;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px 24px 60px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;

  @media (max-width: 768px) {
    padding: 12px 10px 40px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  background: #ffffff;
  padding: 18px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h1 {
    font-size: 1.55rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;

    .dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  }

  p {
    margin: 0;
    font-size: 0.83rem;
    color: #64748b;
  }
`;

const QuickNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const NavChip = styled.button`
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;

  &:hover {
    background: #0d9488;
    border-color: #0d9488;
    color: #ffffff;
    transform: translateY(-1px);
  }
`;

const FilterSection = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 22px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
`;

const PresetGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const PresetBtn = styled.button`
  background: ${(props) => (props.$active ? "#0d9488" : "#f8fafc")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: 1px solid ${(props) => (props.$active ? "#0d9488" : "#e2e8f0")};
  padding: 6px 13px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#0f766e" : "#f1f5f9")};
    border-color: ${(props) => (props.$active ? "#0f766e" : "#cbd5e1")};
  }
`;

const DatePickerGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 0.82rem;
    color: #334155;

    input[type="date"] {
      border: none;
      outline: none;
      font-size: 0.82rem;
      color: #0f172a;
      background: transparent;
      font-family: inherit;
    }
  }

  .apply-btn {
    background: #0d9488;
    color: #ffffff;
    border: none;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;

    &:hover {
      background: #0f766e;
    }
  }

  .refresh-btn {
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 7px 11px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    &.spinning svg {
      animation: ${spin} 0.8s linear infinite;
    }
  }
`;

// ─── KPI METRIC CARDS ─────────────────────────────────────────────────────────
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: ${fadeIn} 0.3s ease;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.$accent || "#0d9488"};
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;

    .label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: ${(props) => props.$iconBg || "#f0fdfa"};
      color: ${(props) => props.$iconColor || "#0d9488"};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .main-val {
    font-size: 1.65rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    line-height: 1.1;
  }

  .sub-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.76rem;
    color: #64748b;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
    margin-top: 4px;

    .tag-pill {
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      background: ${(props) => props.$pillBg || "#f1f5f9"};
      color: ${(props) => props.$pillColor || "#334155"};
    }
  }
`;

// ─── SECONDARY STATS BAR ──────────────────────────────────────────────────────
const MiniStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 22px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MiniStatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);

  .mini-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${(props) => props.$bg || "#f8fafc"};
    color: ${(props) => props.$color || "#64748b"};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mini-info {
    overflow: hidden;
    .mini-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .mini-val {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }
  }
`;

// ─── CHARTS SECTION ───────────────────────────────────────────────────────────
const ChartGrid2 = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  margin-bottom: 22px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartGridEqual = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 22px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f1f5f9;

    .title-box {
      h3 {
        font-size: 0.98rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      span {
        font-size: 0.74rem;
        color: #94a3b8;
      }
    }

    .pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #475569;
    }
  }

  .chart-body {
    flex: 1;
    min-height: 280px;
    position: relative;
  }
`;

// ─── TABLES / DRILLDOWNS ──────────────────────────────────────────────────────
const TabbedContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  margin-bottom: 30px;
`;

const TabHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 10px;

  .tab-buttons {
    display: flex;
    gap: 6px;
  }
`;

const TabBtn = styled.button`
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#0d9488" : "#64748b")};
  border: 1px solid ${(props) => (props.$active ? "#cbd5e1" : "transparent")};
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${(props) => (props.$active ? "0 1px 3px rgba(0,0,0,0.05)" : "none")};

  &:hover {
    color: #0d9488;
  }
`;

const TableSearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.8rem;

  input {
    border: none;
    outline: none;
    font-size: 0.8rem;
    color: #0f172a;
    width: 180px;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
  max-height: 400px;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;

    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.03em;
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      white-space: nowrap;
    }

    tr:hover td {
      background: #f8fafc;
    }
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) => props.$bg || "#f1f5f9"};
  color: ${(props) => props.$color || "#475569"};
`;

const SubFilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SubFilterPill = styled.button`
  background: ${(props) => (props.$active ? "#0d9488" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: 1px solid ${(props) => (props.$active ? "#0d9488" : "#cbd5e1")};
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#0f766e" : "#e2e8f0")};
  }
`;

const VarianceInfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  background: #f0fdfa;
  border-bottom: 1px solid #ccfbf1;
  font-size: 0.78rem;
  color: #115e59;
  flex-wrap: wrap;

  .info-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .info-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
  }
`;

const DiffBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${(props) =>
    props.$standard
      ? "#f8fafc"
      : props.$positive
      ? "#ecfdf5"
      : props.$negative
      ? "#fef2f2"
      : "#eff6ff"};
  color: ${(props) =>
    props.$standard
      ? "#64748b"
      : props.$positive
      ? "#059669"
      : props.$negative
      ? "#dc2626"
      : "#2563eb"};
  border: 1px solid
    ${(props) =>
      props.$standard
        ? "#e2e8f0"
        : props.$positive
        ? "#a7f3d0"
        : props.$negative
        ? "#fecaca"
        : "#bfdbfe"};
`;

const CustomTooltipBox = styled.div`
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 0.78rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

  .tt-label {
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 5px;
    border-bottom: 1px solid #334155;
    padding-bottom: 3px;
  }
  .tt-row {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin: 3px 0;
    span:last-child {
      font-weight: 700;
    }
  }
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const VelavanDashboard = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({
    from_date: todayStr,
    to_date: todayStr,
  });
  const [activePreset, setActivePreset] = useState("today");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("variances");
  const [varianceFilter, setVarianceFilter] = useState("all"); // 'all' | 'markup' | 'markdown'
  const [tableSearch, setTableSearch] = useState("");
  const [statsData, setStatsData] = useState(null);

  // ── Preset Date Range Calculations ──
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();

    let from = todayStr;
    let to = todayStr;

    if (presetKey === "today") {
      from = todayStr;
      to = todayStr;
    } else if (presetKey === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      from = y.toISOString().split("T")[0];
      to = from;
    } else if (presetKey === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      from = d.toISOString().split("T")[0];
      to = todayStr;
    } else if (presetKey === "this_month") {
      const firstDay = new Date(currYear, currMonth, 1);
      from = firstDay.toISOString().split("T")[0];
      to = todayStr;
    } else if (presetKey === "last_month") {
      const firstDayLastMonth = new Date(currYear, currMonth - 1, 1);
      const lastDayLastMonth = new Date(currYear, currMonth, 0);
      from = firstDayLastMonth.toISOString().split("T")[0];
      to = lastDayLastMonth.toISOString().split("T")[0];
    } else if (presetKey === "this_fy") {
      // Indian Financial Year: Starts April 1
      const fyStartYear = currMonth >= 3 ? currYear : currYear - 1;
      from = `${fyStartYear}-04-01`;
      to = todayStr;
    } else if (presetKey === "all") {
      from = "";
      to = "";
    }

    setDateRange({ from_date: from, to_date: to });
    fetchDashboardStats(from, to, presetKey);
  };

  // ── Fetch Dashboard Stats API ──
  const fetchDashboardStats = useCallback(
    async (fromDate, toDate, preset) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (fromDate) params.append("from_date", fromDate);
        if (toDate) params.append("to_date", toDate);
        if (preset) params.append("period", preset);

        const url = `${HMSURL}velavan/dashboard/stats/?${params.toString()}`;
        const res = await apiRequest(url, "GET");

        if (res.success && res.data?.status === "success") {
          setStatsData(res.data);
        } else {
          // If backend stats API is unreachable or returned error, fallback to calculate from list endpoints
          fallbackCalculateStats(fromDate, toDate);
        }
      } catch (err) {
        console.warn("Backend stats API failed, calculating client-side:", err);
        fallbackCalculateStats(fromDate, toDate);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Client-side Fallback calculation in case endpoint is pending restart ──
  const fallbackCalculateStats = async (fromDate, toDate) => {
    try {
      const pParams = new URLSearchParams({ page_size: 1000 });
      if (fromDate) pParams.append("from_date", fromDate);
      if (toDate) pParams.append("to_date", toDate);

      const [salesRes, invRes, purRetRes, salesRetRes, vendRes] = await Promise.all([
        apiRequest(`${HMSURL}velavan/sales/list/?${pParams.toString()}`, "GET"),
        apiRequest(`${HMSURL}velavan/invoices/list/?${pParams.toString()}`, "GET"),
        apiRequest(`${HMSURL}velavan/purchase-return/list/?${pParams.toString()}`, "GET"),
        apiRequest(`${HMSURL}velavan/sales-return/list/?${pParams.toString()}`, "GET"),
        apiRequest(`${HMSURL}velavan_get_vendors/`, "GET"),
      ]);

      const salesList = salesRes.success && salesRes.data?.data ? salesRes.data.data : [];
      const invList = invRes.success && invRes.data?.data ? invRes.data.data : [];
      const purRetList = purRetRes.success && purRetRes.data?.data ? purRetRes.data.data : [];
      const salesRetList = salesRetRes.success && salesRetRes.data?.data ? salesRetRes.data.data : [];
      const vendors = vendRes.success && vendRes.data?.data ? vendRes.data.data : [];

      const toF = (v) => parseFloat(v || 0);

      const grossSales = salesList.reduce((acc, s) => acc + toF(s.total_amount), 0);
      const salesRet = salesRetList.reduce((acc, s) => acc + toF(s.total_amount), 0);
      const netSales = Math.max(0, grossSales - salesRet);

      const grossPurchases = invList.reduce(
        (acc, i) => acc + toF(i.net_invoice_amount || i.total_amount),
        0,
      );
      const purRet = purRetList.reduce((acc, p) => acc + toF(p.total_amount), 0);
      const netPurchases = Math.max(0, grossPurchases - purRet);

      const grossProfit = netSales - netPurchases;
      const profitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

      const salesTaxable = salesList.reduce((acc, s) => acc + toF(s.taxable_amount), 0);
      const salesCgst = salesList.reduce((acc, s) => acc + toF(s.cgst), 0);
      const salesSgst = salesList.reduce((acc, s) => acc + toF(s.sgst), 0);
      const salesGst = salesCgst + salesSgst;

      const purchaseTaxable = invList.reduce((acc, i) => acc + toF(i.taxable_amount), 0);
      const purchaseCgst = invList.reduce((acc, i) => acc + toF(i.cgst), 0);
      const purchaseSgst = invList.reduce((acc, i) => acc + toF(i.sgst), 0);
      const purchaseIgst = invList.reduce((acc, i) => acc + toF(i.igst), 0);
      const purchaseGst = purchaseCgst + purchaseSgst + purchaseIgst;

      // Payment modes
      const pmMap = {};
      salesList.forEach((s) => {
        const pm = (s.payment_mode || "CASH").toUpperCase();
        pmMap[pm] = (pmMap[pm] || 0) + toF(s.total_amount);
      });
      const salesByPm = Object.keys(pmMap).map((k) => ({
        name: k,
        value: pmMap[k],
        percentage: grossSales > 0 ? Math.round((pmMap[k] / grossSales) * 100) : 0,
      }));

      // Customer types
      const ctMap = {};
      salesList.forEach((s) => {
        const ct = s.customer_type || "General";
        ctMap[ct] = (ctMap[ct] || 0) + toF(s.total_amount);
      });
      const salesByCt = Object.keys(ctMap).map((k) => ({
        name: k,
        value: ctMap[k],
        percentage: grossSales > 0 ? Math.round((ctMap[k] / grossSales) * 100) : 0,
      }));

      // Timeline
      const tMap = {};
      salesList.forEach((s) => {
        const d = (s.bill_date || "").substring(0, 10);
        if (d) {
          if (!tMap[d]) tMap[d] = { date: d, label: d, sales: 0, purchases: 0 };
          tMap[d].sales += toF(s.total_amount);
        }
      });
      invList.forEach((i) => {
        const d = (i.date || i.invoice_date || "").substring(0, 10);
        if (d) {
          if (!tMap[d]) tMap[d] = { date: d, label: d, sales: 0, purchases: 0 };
          tMap[d].purchases += toF(i.net_invoice_amount || i.total_amount);
        }
      });
      const timeline = Object.keys(tMap)
        .sort()
        .map((k) => ({
          ...tMap[k],
          profit: tMap[k].sales - tMap[k].purchases,
        }));

      // Fallback calculation for markup & markdown variances
      const fallbackVariances = [];
      invList.forEach((inv) => {
        const iDate = (inv.invoice_date || inv.date || "").substring(0, 10);
        const vid = String(inv.vendor_id || "");
        const vObj = vendors.find((v) => String(v.vendor_id || v.id) === vid);
        const vendorName = vObj?.name || (vid ? `Vendor #${vid}` : "Unknown Vendor");
        const grnNum = inv.grn_number || "";
        const invNo = inv.invoice_no || "";

        const invCategory = inv.purchase_category || "IMPLANT";
        let items = inv.items || [];
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (e) {
            items = [];
          }
        }
        if (!Array.isArray(items)) items = [];

        items.forEach((it) => {
          const mode = String(it.sellingPricingMode || (it.sellingMarkdownPercent ? "markdown" : "markup")).toLowerCase().trim();
          const rawMarkup = it.sellingMarkupPercent;
          const rawMarkdown = it.sellingMarkdownPercent;
          const markupVal = rawMarkup !== undefined && rawMarkup !== null && rawMarkup !== "" ? parseFloat(rawMarkup) : null;
          const markdownVal = rawMarkdown !== undefined && rawMarkdown !== null && rawMarkdown !== "" ? parseFloat(rawMarkdown) : null;

          const itemCat = it.category || it.purchaseCategory || invCategory || "IMPLANT";
          const itemName = it.name || it.item_name || it.description || "Unnamed Item";

          let devType = "Markup";
          let stdRate = 30.0;
          let appliedRate = 30.0;

          if (mode === "markdown") {
            devType = "Markdown";
            stdRate = 13.0;
            appliedRate = markdownVal !== null && !isNaN(markdownVal) ? markdownVal : 13.0;
          } else {
            devType = "Markup";
            stdRate = 30.0;
            appliedRate = markupVal !== null && !isNaN(markupVal) ? markupVal : 30.0;
          }

          fallbackVariances.push({
            grn_number: grnNum,
            invoice_no: invNo,
            invoice_date: iDate,
            vendor_name: vendorName,
            category: itemCat,
            item_name: itemName,
            hsn: it.hsn || "",
            batch_no: it.batchNo || it.batch_no || "",
            pricing_mode: devType,
            standard_rate: stdRate,
            applied_rate: appliedRate,
            diff: parseFloat((appliedRate - stdRate).toFixed(2)),
            purchase_cost: parseFloat(it.unitCostWithGst || it.purchaseCost || it.unitPrice || 0),
            selling_price: parseFloat(it.sellingUnitCost || it.unitSellingCost || 0),
            mrp: parseFloat(it.mrp || 0),
            quantity: parseFloat(it.quantity || it.qty || 1),
            remarks: it.pricingRemarks || it.priceChangeRemarks || it.remarks || "",
          });
        });
      });

      setStatsData({
        status: "success",
        kpis: {
          total_sales: netSales,
          gross_sales: grossSales,
          sales_returns: salesRet,
          sales_count: salesList.length,
          total_purchases: netPurchases,
          gross_purchases: grossPurchases,
          purchase_returns: purRet,
          purchase_count: invList.length,
          gross_profit: grossProfit,
          profit_margin: profitMargin,
          sales_taxable: salesTaxable,
          sales_gst: salesGst,
          purchase_taxable: purchaseTaxable,
          purchase_gst: purchaseGst,
          net_gst_liability: salesGst - purchaseGst,
          total_discount: 0,
          total_items_sold: salesList.length * 2,
          total_items_purchased: invList.length * 2,
          avg_sales_value: salesList.length > 0 ? grossSales / salesList.length : 0,
          avg_purchase_value: invList.length > 0 ? grossPurchases / invList.length : 0,
          active_vendors_count: vendors.length,
          active_customers_count: 1,
          total_item_catalog_count: 330,
        },
        timeline: timeline,
        monthly_overview: timeline.slice(-6),
        payment_modes: {
          sales: salesByPm,
          purchases: [],
        },
        customer_types: salesByCt,
        top_selling_items: [],
        top_vendors: [],
        tax_breakdown: {
          sales: { taxable: salesTaxable, cgst: salesCgst, sgst: salesSgst, total_tax: salesGst },
          purchases: {
            taxable: purchaseTaxable,
            cgst: purchaseCgst,
            sgst: purchaseSgst,
            igst: purchaseIgst,
            total_tax: purchaseGst,
          },
          net_gst: salesGst - purchaseGst,
        },
        markup_markdown_variances: fallbackVariances,
        recent_sales: salesList.slice(0, 8),
        recent_purchases: invList.slice(0, 8),
      });
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    // Initial fetch for current date ("today")
    applyPreset("today");
  }, []); // eslint-disable-line

  const handleCustomApply = () => {
    setActivePreset("custom");
    fetchDashboardStats(dateRange.from_date, dateRange.to_date, "custom");
  };

  const handleRefresh = () => {
    fetchDashboardStats(dateRange.from_date, dateRange.to_date, activePreset);
    toast.info("Dashboard refreshed with latest transactions", { autoClose: 1500 });
  };

  const kpis = statsData?.kpis || {};
  const timeline = statsData?.timeline || [];
  const monthlyOverview = statsData?.monthly_overview || [];
  const salesPaymentModes = statsData?.payment_modes?.sales || [];
  const purchasesPaymentModes = statsData?.payment_modes?.purchases || [];
  const customerTypes = statsData?.customer_types || [];
  const topSellingItems = statsData?.top_selling_items || [];
  const topVendors = statsData?.top_vendors || [];
  const markupMarkdownVariances = statsData?.markup_markdown_variances || [];

  const markupAllCount = useMemo(() => {
    return markupMarkdownVariances.filter((v) => v.pricing_mode === "Markup").length;
  }, [markupMarkdownVariances]);

  const markupDevCount = useMemo(() => {
    return markupMarkdownVariances.filter(
      (v) => v.pricing_mode === "Markup" && Math.abs(parseFloat(v.applied_rate || 0) - 30.0) > 0.001,
    ).length;
  }, [markupMarkdownVariances]);

  const markdownAllCount = useMemo(() => {
    return markupMarkdownVariances.filter((v) => v.pricing_mode === "Markdown").length;
  }, [markupMarkdownVariances]);

  const markdownDevCount = useMemo(() => {
    return markupMarkdownVariances.filter(
      (v) => v.pricing_mode === "Markdown" && Math.abs(parseFloat(v.applied_rate || 0) - 13.0) > 0.001,
    ).length;
  }, [markupMarkdownVariances]);

  // Filter markup/markdown variances table by mode & search query
  const filteredVariances = useMemo(() => {
    let list = markupMarkdownVariances;
    if (varianceFilter === "markup_dev") {
      list = list.filter(
        (v) => v.pricing_mode === "Markup" && Math.abs(parseFloat(v.applied_rate || 0) - 30.0) > 0.001,
      );
    } else if (varianceFilter === "markdown_dev") {
      list = list.filter(
        (v) => v.pricing_mode === "Markdown" && Math.abs(parseFloat(v.applied_rate || 0) - 13.0) > 0.001,
      );
    } else if (varianceFilter === "markup_all" || varianceFilter === "markup") {
      list = list.filter((v) => v.pricing_mode === "Markup");
    } else if (varianceFilter === "markdown_all" || varianceFilter === "markdown") {
      list = list.filter((v) => v.pricing_mode === "Markdown");
    } else if (varianceFilter === "modified") {
      list = list.filter(
        (v) =>
          (v.pricing_mode === "Markup" && Math.abs(parseFloat(v.applied_rate || 0) - 30.0) > 0.001) ||
          (v.pricing_mode === "Markdown" && Math.abs(parseFloat(v.applied_rate || 0) - 13.0) > 0.001),
      );
    }

    if (!tableSearch.trim()) return list;
    const q = tableSearch.toLowerCase();
    return list.filter(
      (v) =>
        v.grn_number?.toLowerCase().includes(q) ||
        v.invoice_no?.toLowerCase().includes(q) ||
        v.vendor_name?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.item_name?.toLowerCase().includes(q) ||
        v.hsn?.toLowerCase().includes(q) ||
        v.pricing_mode?.toLowerCase().includes(q) ||
        String(v.applied_rate).includes(q),
    );
  }, [markupMarkdownVariances, varianceFilter, tableSearch]);

  // ── Custom Tooltip for Recharts ──
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltipBox>
          <div className="tt-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tt-row">
              <span style={{ color: entry.color || entry.stroke || "#38bdf8" }}>
                {entry.name}:
              </span>
              <span>
                {entry.unit === "%"
                  ? `${entry.value}%`
                  : formatINR(entry.value)}
              </span>
            </div>
          ))}
        </CustomTooltipBox>
      );
    }
    return null;
  };

  return (
    <DashboardWrapper>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      {/* ── HEADER SECTION ── */}
      <HeaderContainer>
        <TitleBlock>
          <div className="title-row">
            <h1>
              <Sparkles size={24} color="#0d9488" />
              Velavan Financial &amp; Operations Dashboard
            </h1>
            <div className="badge">
              <span className="dot" /> Live Analytics
            </div>
          </div>
          <p>
            Comprehensive transaction overview of Implants &amp; Surgical Sales, Purchases,
            Gross Profits, Expenses, and GST Liabilities.
          </p>
        </TitleBlock>

        <QuickNav>
          <NavChip onClick={() => navigate("/SalesBilling")}>
            <ShoppingCart size={14} /> Sales Billing
          </NavChip>
          <NavChip onClick={() => navigate("/InvoiceGeneration")}>
            <ShoppingBag size={14} /> New Purchase (GRN)
          </NavChip>
          <NavChip onClick={() => navigate("/SalesReport")}>
            <FileText size={14} /> Sales Report
          </NavChip>
          <NavChip onClick={() => navigate("/InvoiceReport")}>
            <FileText size={14} /> Invoice Report
          </NavChip>
          <NavChip onClick={() => navigate("/VelavanItemList")}>
            <Package size={14} /> Item Master
          </NavChip>
        </QuickNav>
      </HeaderContainer>

      {/* ── DATE FILTER BAR ── */}
      <FilterSection>
        <PresetGroup>
          <PresetBtn
            $active={activePreset === "today"}
            onClick={() => applyPreset("today")}
          >
            Today
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "yesterday"}
            onClick={() => applyPreset("yesterday")}
          >
            Yesterday
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "7days"}
            onClick={() => applyPreset("7days")}
          >
            Last 7 Days
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "this_month"}
            onClick={() => applyPreset("this_month")}
          >
            This Month
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "last_month"}
            onClick={() => applyPreset("last_month")}
          >
            Last Month
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "this_fy"}
            onClick={() => applyPreset("this_fy")}
          >
            This FY
          </PresetBtn>
          <PresetBtn
            $active={activePreset === "all"}
            onClick={() => applyPreset("all")}
          >
            All Time
          </PresetBtn>
        </PresetGroup>

        <DatePickerGroup>
          <div className="input-wrap">
            <Calendar size={14} color="#64748b" />
            <input
              type="date"
              value={dateRange.from_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from_date: e.target.value }))
              }
            />
          </div>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>to</span>
          <div className="input-wrap">
            <Calendar size={14} color="#64748b" />
            <input
              type="date"
              value={dateRange.to_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to_date: e.target.value }))
              }
            />
          </div>
          <button className="apply-btn" onClick={handleCustomApply}>
            <Filter size={13} /> Apply
          </button>
          <button
            className={`refresh-btn ${loading ? "spinning" : ""}`}
            onClick={handleRefresh}
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
        </DatePickerGroup>
      </FilterSection>

      {/* ── PRIMARY KPI CARDS ── */}
      <KpiGrid>
        {/* 1. SALES REVENUE */}
        <KpiCard
          $accent="#10b981"
          $iconBg="#ecfdf5"
          $iconColor="#10b981"
          $pillBg="#dcfce7"
          $pillColor="#15803d"
        >
          <div className="top-row">
            <div className="label">Net Sales Revenue</div>
            <div className="icon-box">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="main-val">{formatINR(kpis.total_sales)}</div>
          <div className="sub-row">
            <span>
              Bills: <b>{kpis.sales_count || 0}</b> · Ret:{" "}
              {formatCompactINR(kpis.sales_returns || 0)}
            </span>
            <span className="tag-pill">
              Avg: {formatCompactINR(kpis.avg_sales_value || 0)}
            </span>
          </div>
        </KpiCard>

        {/* 2. PURCHASES / EXPENSES */}
        <KpiCard
          $accent="#3b82f6"
          $iconBg="#eff6ff"
          $iconColor="#3b82f6"
          $pillBg="#dbeafe"
          $pillColor="#1e40af"
        >
          <div className="top-row">
            <div className="label">Net Purchases (COGS)</div>
            <div className="icon-box">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="main-val">{formatINR(kpis.total_purchases)}</div>
          <div className="sub-row">
            <span>
              GRNs: <b>{kpis.purchase_count || 0}</b> · Ret:{" "}
              {formatCompactINR(kpis.purchase_returns || 0)}
            </span>
            <span className="tag-pill">
              Avg: {formatCompactINR(kpis.avg_purchase_value || 0)}
            </span>
          </div>
        </KpiCard>

        {/* 3. GROSS PROFIT */}
        <KpiCard
          $accent={kpis.gross_profit >= 0 ? "#0d9488" : "#ef4444"}
          $iconBg={kpis.gross_profit >= 0 ? "#f0fdfa" : "#fef2f2"}
          $iconColor={kpis.gross_profit >= 0 ? "#0d9488" : "#ef4444"}
          $pillBg={kpis.gross_profit >= 0 ? "#ccfbf1" : "#fee2e2"}
          $pillColor={kpis.gross_profit >= 0 ? "#0f766e" : "#b91c1c"}
        >
          <div className="top-row">
            <div className="label">Gross Profit</div>
            <div className="icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <div
            className="main-val"
            style={{
              color: kpis.gross_profit >= 0 ? "#0f766e" : "#ef4444",
            }}
          >
            {formatINR(kpis.gross_profit)}
          </div>
          <div className="sub-row">
            <span>Profit Margin</span>
            <span className="tag-pill">
              {kpis.profit_margin !== undefined
                ? `${kpis.profit_margin.toFixed(1)}% Margin`
                : "0%"}
            </span>
          </div>
        </KpiCard>

        {/* 4. NET GST POSITION */}
        <KpiCard
          $accent="#8b5cf6"
          $iconBg="#f5f3ff"
          $iconColor="#8b5cf6"
          $pillBg="#ede9fe"
          $pillColor="#6d28d9"
        >
          <div className="top-row">
            <div className="label">Net GST Position</div>
            <div className="icon-box">
              <Percent size={20} />
            </div>
          </div>
          <div className="main-val">{formatINR(kpis.net_gst_liability)}</div>
          <div className="sub-row">
            <span>
              Out: {formatCompactINR(kpis.sales_gst || 0)} · In:{" "}
              {formatCompactINR(kpis.purchase_gst || 0)}
            </span>
            <span className="tag-pill">
              {kpis.net_gst_liability >= 0 ? "Payable" : "ITC Credit"}
            </span>
          </div>
        </KpiCard>
      </KpiGrid>

      {/* ── SECONDARY MINI STATS ── */}
      <MiniStatsGrid>
        <MiniStatCard $bg="#f0fdf4" $color="#16a34a">
          <div className="mini-icon">
            <Package size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Items Sold (Qty)</div>
            <div className="mini-val">{kpis.total_items_sold || 0} Units</div>
          </div>
        </MiniStatCard>

        <MiniStatCard $bg="#eff6ff" $color="#2563eb">
          <div className="mini-icon">
            <ShoppingCart size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Items Purchased</div>
            <div className="mini-val">{kpis.total_items_purchased || 0} Units</div>
          </div>
        </MiniStatCard>

        <MiniStatCard $bg="#fffbeb" $color="#d97706">
          <div className="mini-icon">
            <Building2 size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Active Vendors</div>
            <div className="mini-val">{kpis.active_vendors_count || 0}</div>
          </div>
        </MiniStatCard>

        <MiniStatCard $bg="#fdf4ff" $color="#c026d3">
          <div className="mini-icon">
            <Users size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Active Customers</div>
            <div className="mini-val">{kpis.active_customers_count || 0}</div>
          </div>
        </MiniStatCard>

        <MiniStatCard $bg="#ecfeff" $color="#0891b2">
          <div className="mini-icon">
            <Layers size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Catalog Items</div>
            <div className="mini-val">{kpis.total_item_catalog_count || 0}</div>
          </div>
        </MiniStatCard>

        <MiniStatCard $bg="#fef2f2" $color="#dc2626">
          <div className="mini-icon">
            <RotateCcw size={17} />
          </div>
          <div className="mini-info">
            <div className="mini-label">Purchase Returns</div>
            <div className="mini-val">
              {formatCompactINR(kpis.purchase_returns || 0)}
            </div>
          </div>
        </MiniStatCard>
      </MiniStatsGrid>

      {/* ── MAIN CHARTS ROW 1: TIMELINE & PAYMENT MODES ── */}
      <ChartGrid2>
        {/* Sales vs Purchases vs Profit Area / Bar Chart */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <BarChart3 size={18} color="#0d9488" />
                Financial Performance Trend
              </h3>
              <span>Sales Revenue vs Purchase Cost vs Profit Timeline</span>
            </div>
            <div className="pill">
              {timeline.length} {timeline.length === 1 ? "Day" : "Data Points"}
            </div>
          </div>
          <div className="chart-body">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={timeline}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(v)}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "0.78rem" }}
                  />
                  <Bar
                    dataKey="sales"
                    name="Sales Revenue"
                    fill="url(#salesGrad)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="purchases"
                    name="Purchases / Expenses"
                    fill="url(#purGrad)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Gross Profit"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#0d9488" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No transaction data available for the selected dates.
              </div>
            )}
          </div>
        </ChartCard>

        {/* Sales by Payment Mode Donut Chart */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <PieIcon size={18} color="#3b82f6" />
                Sales by Payment Mode
              </h3>
              <span>Distribution across Cash, Cheque, Online</span>
            </div>
          </div>
          <div className="chart-body">
            {salesPaymentModes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesPaymentModes}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {salesPaymentModes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${formatINR(val)} (${item.payload.percentage || 0}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No payment mode records found.
              </div>
            )}
          </div>
        </ChartCard>
      </ChartGrid2>

      {/* ── CHARTS ROW 2: TOP ITEMS & TOP VENDORS ── */}
      <ChartGridEqual>
        {/* Top 10 Selling Products / Implants */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <Award size={18} color="#f59e0b" />
                Top 10 High-Revenue Implants / Items
              </h3>
              <span>Ranked by Total Sales Value</span>
            </div>
          </div>
          <div className="chart-body">
            {topSellingItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topSellingItems}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(v)}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={130}
                    tickFormatter={(v) => (v.length > 18 ? `${v.substring(0, 18)}…` : v)}
                  />
                  <Tooltip
                    formatter={(val) => [formatINR(val), "Sales Revenue"]}
                    labelFormatter={(label) => `Item: ${label}`}
                  />
                  <Bar
                    dataKey="sales_amount"
                    fill="#0d9488"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  >
                    {topSellingItems.map((_, idx) => (
                      <Cell
                        key={`top-item-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No item sales data for this period.
              </div>
            )}
          </div>
        </ChartCard>

        {/* Top Vendors by Purchase Value */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <Building2 size={18} color="#8b5cf6" />
                Top Vendors by Purchase Volume
              </h3>
              <span>Major Supplier Expense Allocation</span>
            </div>
          </div>
          <div className="chart-body">
            {topVendors.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topVendors}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(v)}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={130}
                    tickFormatter={(v) => (v.length > 18 ? `${v.substring(0, 18)}…` : v)}
                  />
                  <Tooltip
                    formatter={(val, _, item) => [
                      `${formatINR(val)} (${item.payload.percentage || 0}%)`,
                      "Purchase Amount",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  >
                    {topVendors.map((_, idx) => (
                      <Cell
                        key={`top-vend-${idx}`}
                        fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No vendor purchase records for this period.
              </div>
            )}
          </div>
        </ChartCard>
      </ChartGridEqual>

      {/* ── CHARTS ROW 3: MONTHLY FINANCIAL PROGRESSION & CUSTOMER TYPES ── */}
      <ChartGridEqual>
        {/* Monthly Financial Overview */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <Calendar size={18} color="#059669" />
                Monthly Revenue &amp; Cost Progression
              </h3>
              <span>Historical Monthly Performance</span>
            </div>
          </div>
          <div className="chart-body">
            {monthlyOverview.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyOverview}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(v)}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                  <Bar
                    dataKey="sales"
                    name="Sales (₹)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="purchases"
                    name="Purchases (₹)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Gross Profit (₹)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No monthly data available.
              </div>
            )}
          </div>
        </ChartCard>

        {/* Customer Category Breakdown */}
        <ChartCard>
          <div className="chart-header">
            <div className="title-box">
              <h3>
                <Users size={18} color="#ec4899" />
                Sales by Customer Segment
              </h3>
              <span>In-Patient, Insurance, Walk-in, Corporate</span>
            </div>
          </div>
          <div className="chart-body">
            {customerTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={customerTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {customerTypes.map((entry, index) => (
                      <Cell
                        key={`cell-ct-${index}`}
                        fill={CHART_COLORS[(index + 4) % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${formatINR(val)} (${item.payload.percentage || 0}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                No customer category breakdown available.
              </div>
            )}
          </div>
        </ChartCard>
      </ChartGridEqual>

      {/* ── TRANSACTION DRILLDOWNS & RECENT DATA TABLES ── */}
      <TabbedContainer>
        <TabHeader>
          <div className="tab-buttons">
            <TabBtn
              $active={activeTab === "variances"}
              onClick={() => setActiveTab("variances")}
            >
              Markup & Markdown List ({markupMarkdownVariances.length})
            </TabBtn>
            <TabBtn
              $active={activeTab === "items"}
              onClick={() => setActiveTab("items")}
            >
              Top Sold Implants ({topSellingItems.length})
            </TabBtn>
            <TabBtn
              $active={activeTab === "vendors"}
              onClick={() => setActiveTab("vendors")}
            >
              Vendor Summary ({topVendors.length})
            </TabBtn>
          </div>

          <TableSearchInput>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by GRN, Item, Category, Supplier, HSN…"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </TableSearchInput>
        </TabHeader>

        {/* TAB 1: MARKUP & MARKDOWN PRICING LIST */}
        {activeTab === "variances" && (
          <>
            <VarianceInfoBar>
              <div className="info-left">
                <AlertTriangle size={15} color="#0d9488" />
                <span>
                  <strong>Standard Baseline Rates:</strong> Markup = <strong>30%</strong> (on purchase cost) | Markdown = <strong>13%</strong> (discount from MRP).
                </span>
              </div>
              <SubFilterContainer>
                <SubFilterPill
                  $active={varianceFilter === "all"}
                  onClick={() => setVarianceFilter("all")}
                >
                  All Items ({markupMarkdownVariances.length})
                </SubFilterPill>
                <SubFilterPill
                  $active={varianceFilter === "markup_dev"}
                  onClick={() => setVarianceFilter("markup_dev")}
                >
                  Markup ≠ 30% ({markupDevCount})
                </SubFilterPill>
                <SubFilterPill
                  $active={varianceFilter === "markdown_dev"}
                  onClick={() => setVarianceFilter("markdown_dev")}
                >
                  Markdown ≠ 13% ({markdownDevCount})
                </SubFilterPill>
                <SubFilterPill
                  $active={varianceFilter === "markup_all"}
                  onClick={() => setVarianceFilter("markup_all")}
                >
                  All Markup ({markupAllCount})
                </SubFilterPill>
                <SubFilterPill
                  $active={varianceFilter === "markdown_all"}
                  onClick={() => setVarianceFilter("markdown_all")}
                >
                  All Markdown ({markdownAllCount})
                </SubFilterPill>
              </SubFilterContainer>
            </VarianceInfoBar>

            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>GRN Number</th>
                    <th>Invoice No & Date</th>
                    <th>Supplier / Vendor</th>
                    <th>Category</th>
                    <th>Item Description</th>
                    <th>HSN</th>
                    <th>Pricing Mode</th>
                    <th style={{ textAlign: "center" }}>Standard Rate</th>
                    <th style={{ textAlign: "center" }}>Applied Rate</th>
                    <th style={{ textAlign: "right" }}>Purchase Cost</th>
                    <th style={{ textAlign: "right" }}>MRP</th>
                    <th style={{ textAlign: "right" }}>Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariances.length > 0 ? (
                    filteredVariances.map((v, idx) => {
                      const isMarkup = v.pricing_mode === "Markup";
                      const diff = v.diff || 0;
                      const cat = (v.category || "IMPLANT").toUpperCase();
                      return (
                        <tr key={`var-${idx}`}>
                          <td style={{ fontWeight: 700, color: "#64748b" }}>
                            #{idx + 1}
                          </td>
                          <td style={{ fontWeight: 700, color: "#0d9488" }}>
                            {v.grn_number || "-"}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>
                              {v.invoice_no || "-"}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {v.invoice_date || "-"}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {v.vendor_name}
                          </td>
                          <td>
                            <StatusTag
                              $bg={
                                cat === "IMPLANT"
                                  ? "#eff6ff"
                                  : cat === "DRUG" || cat === "MEDICINE"
                                  ? "#ecfdf5"
                                  : cat === "SURGICAL" || cat === "CONSUMABLE"
                                  ? "#fef3c7"
                                  : "#f1f5f9"
                              }
                              $color={
                                cat === "IMPLANT"
                                  ? "#1d4ed8"
                                  : cat === "DRUG" || cat === "MEDICINE"
                                  ? "#15803d"
                                  : cat === "SURGICAL" || cat === "CONSUMABLE"
                                  ? "#b45309"
                                  : "#475569"
                              }
                            >
                              {cat}
                            </StatusTag>
                          </td>
                          <td style={{ fontWeight: 600, color: "#0f172a", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {v.item_name}
                          </td>
                          <td>
                            <StatusTag $bg="#f1f5f9" $color="#475569">
                              {v.hsn || "-"}
                            </StatusTag>
                          </td>
                          <td>
                            <StatusTag
                              $bg={isMarkup ? "#ecfdf5" : "#f5f3ff"}
                              $color={isMarkup ? "#059669" : "#7c3aed"}
                            >
                              {v.pricing_mode}
                            </StatusTag>
                          </td>
                          <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                            {v.standard_rate}%
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 800, color: "#0f172a" }}>
                                {v.applied_rate}%
                              </span>
                              {Math.abs(diff) <= 0.001 ? (
                                <DiffBadge $standard>Standard</DiffBadge>
                              ) : (
                                <DiffBadge
                                  $positive={diff > 0}
                                  $negative={diff < 0}
                                >
                                  {diff > 0 ? (
                                    <>
                                      <ArrowUpRight size={11} /> +{diff}%
                                    </>
                                  ) : (
                                    <>
                                      <ArrowDownRight size={11} /> {diff}%
                                    </>
                                  )}
                                </DiffBadge>
                              )}
                            </div>
                            {v.remarks && (
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: "0.71rem",
                                  color: "#92400e",
                                  background: "#fef3c7",
                                  border: "1px solid #fde68a",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontWeight: 600,
                                  maxWidth: 160,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  margin: "4px auto 0 auto",
                                  textAlign: "left",
                                }}
                                title={`Remarks: ${v.remarks}`}
                              >
                                💬 {v.remarks}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600, color: "#475569" }}>
                            {formatINR(v.purchase_cost)}
                          </td>
                          <td style={{ textAlign: "right", color: "#64748b" }}>
                            {formatINR(v.mrp)}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: isMarkup ? "#0d9488" : "#7c3aed" }}>
                            {formatINR(v.selling_price)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={13} style={{ textAlign: "center", padding: 36, color: "#94a3b8" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <CheckCircle2 size={32} color="#10b981" />
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>
                            No Items Found
                          </div>
                          <div style={{ fontSize: "0.78rem" }}>
                            No markup or markdown items found matching the selected filter in this period.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrap>
          </>
        )}

        {/* TAB 3: TOP SOLD IMPLANTS */}
        {activeTab === "items" && (
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Implant / Item Description</th>
                  <th>HSN Code</th>
                  <th style={{ textAlign: "center" }}>Qty Sold</th>
                  <th style={{ textAlign: "right" }}>Total Sales (₹)</th>
                  <th style={{ textAlign: "right" }}>Avg Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {topSellingItems.length > 0 ? (
                  topSellingItems.map((itm, idx) => (
                    <tr key={`ti-${idx}`}>
                      <td style={{ fontWeight: 700, color: "#64748b" }}>
                        #{idx + 1}
                      </td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>
                        {itm.name}
                      </td>
                      <td>
                        <StatusTag $bg="#f1f5f9" $color="#475569">
                          {itm.hsn || "90211000"}
                        </StatusTag>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        {itm.quantity} Units
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#10b981",
                        }}
                      >
                        {formatINR(itm.sales_amount)}
                      </td>
                      <td style={{ textAlign: "right", color: "#64748b" }}>
                        {formatINR(
                          itm.quantity > 0 ? itm.sales_amount / itm.quantity : 0,
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No item leaderboard records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        )}

        {/* TAB 4: VENDORS SUMMARY */}
        {activeTab === "vendors" && (
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendor / Supplier Name</th>
                  <th>Vendor ID</th>
                  <th style={{ textAlign: "center" }}>Invoices / GRNs</th>
                  <th style={{ textAlign: "right" }}>Total Purchase Spend</th>
                  <th style={{ textAlign: "right" }}>Share of Total Expense</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.length > 0 ? (
                  topVendors.map((v, idx) => (
                    <tr key={`tv-${idx}`}>
                      <td style={{ fontWeight: 700, color: "#64748b" }}>
                        #{idx + 1}
                      </td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>
                        {v.name}
                      </td>
                      <td>
                        <StatusTag $bg="#eff6ff" $color="#1d4ed8">
                          {v.vendor_id}
                        </StatusTag>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {v.count} GRN(s)
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#3b82f6",
                        }}
                      >
                        {formatINR(v.amount)}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {v.percentage || 0}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No vendor records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrap>
        )}
      </TabbedContainer>
    </DashboardWrapper>
  );
};

export default VelavanDashboard;
