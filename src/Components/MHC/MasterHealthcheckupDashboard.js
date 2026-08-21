import React, { useState, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFirstDayOfYear = () => `${new Date().getFullYear()}-01-01`;
const getToday          = () => new Date().toISOString().split("T")[0];

const inr = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

// ─── Styled ───────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 55%, #ecfdf5 100%);
  padding: 1.5rem 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #065f46 100%);
  border-radius: 20px;
  padding: 1.4rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(13,148,136,0.25);
  animation: ${fadeIn} 0.35s ease;
`;
const HeaderLeft  = styled.div`display:flex; align-items:center; gap:1rem;`;
const HeaderIcon  = styled.div`font-size:2.2rem;`;
const HeaderTitle = styled.h1`font-size:1.5rem; font-weight:800; color:#fff; margin:0;`;
const HeaderSub   = styled.p`font-size:0.82rem; color:rgba(255,255,255,0.78); margin:0.15rem 0 0;`;

/* Filter */
const FilterCard = styled.div`
  background:#fff; border-radius:16px; padding:1.1rem 1.5rem;
  margin-bottom:1.25rem; box-shadow:0 2px 16px rgba(0,0,0,0.06);
  animation:${fadeIn} 0.4s ease;
`;
const FilterRow = styled.div`display:flex; align-items:flex-end; gap:1rem; flex-wrap:wrap;`;
const FG        = styled.div`display:flex; flex-direction:column; gap:0.3rem; min-width:150px;`;
const Lbl       = styled.label`font-size:0.72rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.4px;`;
const DateInput = styled.input`
  padding:0.5rem 0.85rem; border:1.5px solid #e2e8f0; border-radius:10px;
  font-size:0.87rem; font-family:inherit; color:#1e293b; background:#f8fafc; outline:none;
  transition:border-color 0.2s,box-shadow 0.2s;
  &:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.12);background:#fff;}
`;
const SearchBtn = styled.button`
  padding:0.52rem 1.3rem; border-radius:10px; font-size:0.85rem; font-weight:700;
  font-family:inherit; cursor:pointer; border:none; background:linear-gradient(135deg,#0d9488,#0f766e);
  color:#fff; box-shadow:0 4px 12px rgba(13,148,136,0.28); transition:all 0.2s;
  display:flex; align-items:center; gap:0.4rem;
  &:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 18px rgba(13,148,136,0.38);}
  &:disabled{opacity:0.55;cursor:not-allowed;}
`;
const QuickRow = styled.div`display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.8rem; align-items:center;`;
const QuickLbl = styled.span`font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-right:0.25rem;`;
const QuickBtn = styled.button`
  padding:0.38rem 0.9rem; border-radius:20px; font-size:0.76rem; font-weight:700;
  font-family:inherit; cursor:pointer; border:1.5px solid ${p=>p.active?"#0d9488":"#e2e8f0"};
  background:${p=>p.active?"#0d9488":"#f8fafc"}; color:${p=>p.active?"#fff":"#475569"};
  transition:all 0.15s;
  &:hover:not(:disabled){background:${p=>p.active?"#0f766e":"#e2e8f0"};}
  &:disabled{opacity:0.55;cursor:not-allowed;}
`;

/* Stat Cards */
const StatsRow = styled.div`display:flex; gap:0.9rem; flex-wrap:wrap; margin-bottom:1.25rem;`;
const StatCard = styled.div`
  flex:1; min-width:130px;
  background:${p=>p.bg||"#fff"}; border:1.5px solid ${p=>p.border||"#e2e8f0"};
  border-radius:14px; padding:0.85rem 1.1rem; box-shadow:0 2px 10px rgba(0,0,0,0.04);
  animation:${fadeIn} 0.45s ease;
`;
const StatNum = styled.div`font-size:1.3rem; font-weight:800; color:${p=>p.color||"#0f766e"};`;
const StatLbl = styled.div`font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-top:0.1rem;`;

/* Graphs Section */
const GraphsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
`;

const GraphCard = styled.div`
  background: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 1.25rem 1rem 1rem 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.45s ease;
`;

const GraphTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 1.25rem 0;
  text-align: center;
  letter-spacing: -0.2px;
`;

/* Custom Tooltips */
const CustomTooltipPatients = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontWeight: "700", color: "#475569", fontSize: "12px" }}>{label}</p>
        <p style={{ margin: "2px 0 0 0", fontWeight: "800", color: "#3b82f6", fontSize: "14px" }}>
          {payload[0].value} Patients
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontWeight: "700", color: "#475569", fontSize: "12px" }}>{label}</p>
        <p style={{ margin: "2px 0 0 0", fontWeight: "800", color: "#3b82f6", fontSize: "14px" }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

/* Tables — stacked vertically */
const TablesStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TableCard = styled.div`
  background:#fff;
  border-radius:16px;
  box-shadow:0 4px 20px rgba(0,0,0,0.07);
  overflow:hidden;
  animation:${fadeIn} 0.5s ease;
  border: 1.5px solid #e2e8f0;
`;

const TableScroll = styled.div`overflow-x:auto;`;

/* Match Excel-like professional table styling */
const Tbl = styled.table`
  width:100%;
  border-collapse:collapse;
  font-size:0.82rem;
`;

/* Spanning professional section header row */
const RevenueHeaderTr = styled.tr`
  background:#daeaf2;
`;
const RevenueHeaderTd = styled.td`
  text-align:center;
  font-style:normal;
  font-weight:800;
  font-size:0.9rem;
  color:#0c4a6e;
  padding:0.5rem 0.75rem;
  border:1px solid #c8dce8;
  letter-spacing:0.3px;
  text-transform:uppercase;
`;

/* Column header row */
const Th = styled.th`
  background:#e8f4f8;
  color:#1e293b;
  padding:0.55rem 0.75rem;
  text-align:${p=>p.right?"right":p.center?"center":"left"};
  font-size:0.78rem;
  font-weight:700;
  white-space:nowrap;
  border:1px solid #c8dce8;
`;

const Tr = styled.tr`
  background:${p=>p.even?"#f4fafc":"#fff"};
  &:hover{background:#e0f2fe;}
`;

const Td = styled.td`
  padding:0.5rem 0.75rem;
  border:1px solid #d0e6f0;
  color:#1e293b;
  white-space:nowrap;
  text-align:${p=>p.right?"right":p.center?"center":"left"};
  font-weight:${p=>p.bold?"700":"400"};
`;

/* Grand total row */
const TotRow = styled.tr`background:#c8dce8 !important;`;
const TotTd  = styled.td`
  padding:0.55rem 0.75rem;
  border:1.5px solid #b0cede;
  color:#0c4a6e;
  font-weight:800;
  font-size:0.82rem;
  white-space:nowrap;
  text-align:${p=>p.right?"right":p.center?"center":"left"};
`;

/* Tabs Navigation */
const TabsBar = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  background: #fff;
  padding: 0.65rem 0.9rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  border: 1.5px solid #e2e8f0;
  animation: ${fadeIn} 0.45s ease;
`;

const TabNavBtn = styled.button`
  padding: 0.52rem 1.1rem;
  border-radius: 10px;
  font-size: 0.81rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: 1.5px solid ${p => p.active ? "#0d9488" : "transparent"};
  background: ${p => p.active ? "linear-gradient(135deg, #0d9488, #0f766e)" : "#f8fafc"};
  color: ${p => p.active ? "#fff" : "#475569"};
  box-shadow: ${p => p.active ? "0 4px 12px rgba(13,148,136,0.25)" : "none"};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background: ${p => p.active ? "#0f766e" : "#f1f5f9"};
    color: ${p => p.active ? "#fff" : "#0d9488"};
    border-color: ${p => p.active ? "#0f766e" : "#cbd5e1"};
  }
`;

const Spinner = styled.div`
  width:36px;height:36px;border:3.5px solid #e2e8f0;border-top-color:#0d9488;
  border-radius:50%;animation:${spin} 0.8s linear infinite;margin:4rem auto;
`;
const EmptyMsg = styled.div`
  text-align:center;padding:3rem 1rem;color:#94a3b8;font-size:0.9rem;font-weight:600;
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function MasterHealthcheckupDashboard() {
  const [fromDate, setFromDate]   = useState(getFirstDayOfYear);
  const [toDate,   setToDate]     = useState(getToday);
  const [data,     setData]       = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [quick,    setQuick]      = useState("year");
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchDashboard = useCallback(async (fd, td) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from_date: fd, to_date: td });
      const res = await apiRequest(`${Hmsbaseurl}mhc_dashboard/?${params}`, "GET");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.error || "Failed to load dashboard");
        setData(null);
      }
    } catch {
      toast.error("Network error loading dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(fromDate, toDate); }, []); // eslint-disable-line

  const applyQuick = (type) => {
    setQuick(type);
    const now = new Date();
    const iso = (d) => d.toISOString().split("T")[0];
    let fd, td = getToday();
    if (type === "year") {
      fd = `${now.getFullYear()}-01-01`;
    } else if (type === "month") {
      fd = iso(new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (type === "quarter") {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      fd = iso(new Date(now.getFullYear(), qStart, 1));
    }
    setFromDate(fd); setToDate(td);
    fetchDashboard(fd, td);
  };

  const handleSearch = () => { setQuick(""); fetchDashboard(fromDate, toDate); };

  const gt = data?.grand_totals || {};
  const monthsList = data?.months_list || [];

  // Chart Data combining category patients and category revenue for MHC
  const chartData = (data?.category_patients || []).map((cp) => {
    const cr = (data?.category_revenue || []).find((r) => r.month === cp.month) || {};
    return {
      month: cp.month,
      mhcPatients: cp.MHC || 0,
      mhcRevenue: cr.MHC || 0,
    };
  });

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIcon>📊</HeaderIcon>
          <div>
            <HeaderTitle>MHC Dashboard</HeaderTitle>
            <HeaderSub>Master Health Checkup — Executive Analytics &amp; Reports</HeaderSub>
          </div>
        </HeaderLeft>
      </HeaderCard>

      {/* Filter */}
      <FilterCard>
        <FilterRow>
          <FG>
            <Lbl>From Date</Lbl>
            <DateInput id="dash-from" type="date" value={fromDate}
              onChange={e => { setFromDate(e.target.value); setQuick(""); }} />
          </FG>
          <FG>
            <Lbl>To Date</Lbl>
            <DateInput id="dash-to" type="date" value={toDate}
              onChange={e => { setToDate(e.target.value); setQuick(""); }} />
          </FG>
          <SearchBtn onClick={handleSearch} disabled={loading}>
            {loading ? "⏳" : "🔍"} Search
          </SearchBtn>
        </FilterRow>
        <QuickRow>
          <QuickLbl>Quick:</QuickLbl>
          {[
            { key:"year",    label:"This Year"    },
            { key:"quarter", label:"This Quarter" },
            { key:"month",   label:"This Month"   },
          ].map(q => (
            <QuickBtn key={q.key} active={quick===q.key}
              onClick={() => applyQuick(q.key)} disabled={loading}>
              {q.label}
            </QuickBtn>
          ))}
        </QuickRow>
      </FilterCard>

      {/* Stat cards */}
      {data && !loading && (
        <StatsRow>
          <StatCard bg="#f0fdfa" border="#a7f3d0">
            <StatNum color="#0f766e">{gt.patient_count || 0}</StatNum>
            <StatLbl>Total Patients</StatLbl>
          </StatCard>
          <StatCard bg="#fff7ed" border="#fed7aa">
            <StatNum color="#b45309">{inr(gt.total_revenue)}</StatNum>
            <StatLbl>Total Revenue</StatLbl>
          </StatCard>
          <StatCard bg="#eff6ff" border="#bfdbfe">
            <StatNum color="#1d4ed8">{inr(gt.MHC)}</StatNum>
            <StatLbl>MHC Revenue</StatLbl>
          </StatCard>
          <StatCard bg="#fdf4ff" border="#e9d5ff">
            <StatNum color="#7c3aed">{inr(gt.Others)}</StatNum>
            <StatLbl>Others Revenue</StatLbl>
          </StatCard>
          <StatCard bg="#ecfdf5" border="#6ee7b7">
            <StatNum color="#065f46">{inr(gt.package_fee)}</StatNum>
            <StatLbl>Package Fees</StatLbl>
          </StatCard>
          <StatCard bg="#fef2f2" border="#fecaca">
            <StatNum color="#dc2626">{inr(gt.doctor_fee)}</StatNum>
            <StatLbl>Doctor Fees</StatLbl>
          </StatCard>
        </StatsRow>
      )}

      {/* ══ Navigation Tabs ══ */}
      {data && !loading && (
        <TabsBar>
          {[
            { key: "dashboard",        label: "📊 Dashboard" },
            { key: "patient_volume",   label: "👥 Patient Volume by Category" },
            { key: "category_revenue", label: "💰 Revenue by Category" },
            { key: "fee_breakdown",    label: "💳 Revenue by Fee Type" },
            { key: "package_summary",  label: "📦 Package Revenue Summary" },
            { key: "package_matrix",   label: "🗓️ Monthly Package Matrix" },
            { key: "all",              label: "📋 All Tables" },
          ].map(t => (
            <TabNavBtn
              key={t.key}
              active={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </TabNavBtn>
          ))}
        </TabsBar>
      )}

      {loading ? (
        <Spinner />
      ) : !data || data.monthly_summary.length === 0 ? (
        <EmptyMsg>📭 No data found for the selected period.</EmptyMsg>
      ) : (
        <>
          {/* Line Graphs Row (Shown in "dashboard" or "all" tabs) */}
          {(activeTab === "dashboard" || activeTab === "all") && chartData.length > 0 && (
            <GraphsRow>
              {/* Graph 1: Month wise MHC Patients */}
              <GraphCard>
                <GraphTitle>Month wise MHC Patients</GraphTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 25, right: 30, left: 10, bottom: 25 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fontWeight: 700, fill: "#111827" }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      dy={5}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#374151" }}
                      domain={[0, 'auto']}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltipPatients />} />
                    <Line
                      type="monotone"
                      dataKey="mhcPatients"
                      stroke="#3b82f6"
                      strokeWidth={2.2}
                      dot={{ fill: "#3b82f6", r: 5, strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    >
                      <LabelList
                        dataKey="mhcPatients"
                        position="top"
                        offset={10}
                        style={{ fontWeight: "800", fill: "#111827", fontSize: "14px" }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </GraphCard>

              {/* Graph 2: Month Wise MHC Revenue */}
              <GraphCard>
                <GraphTitle>Month Wise MHC Revenue</GraphTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 25, right: 40, left: 25, bottom: 25 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fontWeight: 700, fill: "#111827" }}
                      interval={0}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#374151" }}
                      tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      domain={[0, 'auto']}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltipRevenue />} />
                    <Line
                      type="monotone"
                      dataKey="mhcRevenue"
                      stroke="#3b82f6"
                      strokeWidth={2.2}
                      dot={{ fill: "#3b82f6", r: 5, strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    >
                      <LabelList
                        dataKey="mhcRevenue"
                        position="top"
                        offset={10}
                        formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                        style={{ fontWeight: "800", fill: "#111827", fontSize: "11px" }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </GraphCard>
            </GraphsRow>
          )}

          <TablesStack>

            {/* ══ Table 1: Executive Monthly Summary (Shown in "dashboard" or "all") ══ */}
            {(activeTab === "dashboard" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={3}>Executive Monthly Summary</RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"160px" }}>Date - Month</Th>
                        <Th right>No of Patients</Th>
                        <Th right>Total Revenue</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthly_summary.map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.month}</Td>
                          <Td right>{r.patient_count}</Td>
                          <Td right bold style={{ color:"#0c4a6e" }}>{inr(r.total_revenue)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Grand Total</TotTd>
                        <TotTd right>{gt.patient_count}</TotTd>
                        <TotTd right>{inr(gt.total_revenue)}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

            {/* ══ Table 2: Patient Volume by Category ══ */}
            {(activeTab === "patient_volume" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={4}>Patient Volume by Category</RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"140px" }}>Date</Th>
                        <Th right>MHC</Th>
                        <Th right>Others</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.category_patients || []).map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.month}</Td>
                          <Td right style={{ color:"#1d4ed8" }}>{r.MHC}</Td>
                          <Td right style={{ color:"#7c3aed" }}>{r.Others}</Td>
                          <Td right bold style={{ color:"#0c4a6e" }}>{r.total}</Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Grand Total</TotTd>
                        <TotTd right>{gt.patients_MHC || 0}</TotTd>
                        <TotTd right>{gt.patients_Others || 0}</TotTd>
                        <TotTd right>{gt.patients_total || 0}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

            {/* ══ Table 3: Revenue Breakdown by Category ══ */}
            {(activeTab === "category_revenue" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={4}>Revenue Breakdown by Category</RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"140px" }}>Date</Th>
                        <Th right>MHC</Th>
                        <Th right>Others</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.category_revenue.map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.month}</Td>
                          <Td right style={{ color:"#1d4ed8" }}>{inr(r.MHC)}</Td>
                          <Td right style={{ color:"#7c3aed" }}>{inr(r.Others)}</Td>
                          <Td right bold style={{ color:"#0c4a6e" }}>{inr(r.total)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Grand Total</TotTd>
                        <TotTd right>{inr(gt.MHC)}</TotTd>
                        <TotTd right>{inr(gt.Others)}</TotTd>
                        <TotTd right>{inr(gt.total_revenue)}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

            {/* ══ Table 4: Revenue Breakdown by Fee Type ══ */}
            {(activeTab === "fee_breakdown" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={7}>Revenue Breakdown by Fee Type</RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"130px" }}>Date</Th>
                        <Th right>Package Fee</Th>
                        <Th right>Doctor Fee</Th>
                        <Th right>Add. Tests</Th>
                        <Th right>Pharmacy</Th>
                        <Th right>IP</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fee_breakdown.map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.month}</Td>
                          <Td right>{inr(r.package_fee)}</Td>
                          <Td right>{inr(r.doctor_fee)}</Td>
                          <Td right>{inr(r.add_tests)}</Td>
                          <Td right>{inr(r.pharmacy)}</Td>
                          <Td right>{inr(r.ip)}</Td>
                          <Td right bold style={{ color:"#0c4a6e" }}>{inr(r.total)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Grand Total</TotTd>
                        <TotTd right>{inr(gt.package_fee)}</TotTd>
                        <TotTd right>{inr(gt.doctor_fee)}</TotTd>
                        <TotTd right>{inr(gt.add_tests)}</TotTd>
                        <TotTd right>{inr(gt.pharmacy)}</TotTd>
                        <TotTd right>{inr(gt.ip)}</TotTd>
                        <TotTd right>{inr(gt.total_revenue)}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

            {/* ══ Table 5: Package Revenue Summary ══ */}
            {(activeTab === "package_summary" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={3}>Package Revenue Summary</RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"200px" }}>Package Name</Th>
                        <Th right>Total Patients</Th>
                        <Th right>Total Revenue</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.package_summary || []).map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.package}</Td>
                          <Td right>{r.patient_count}</Td>
                          <Td right bold style={{ color:"#0c4a6e" }}>{inr(r.total_revenue)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Grand Total</TotTd>
                        <TotTd right>{gt.pkg_patients_total || 0}</TotTd>
                        <TotTd right>{inr(gt.pkg_revenue_total || 0)}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

            {/* ══ Table 6: Monthly Package Patient Distribution ══ */}
            {(activeTab === "package_matrix" || activeTab === "all") && (
              <TableCard>
                <TableScroll>
                  <Tbl>
                    <thead>
                      <RevenueHeaderTr>
                        <RevenueHeaderTd colSpan={monthsList.length + 3}>
                          Monthly Package Patient Distribution Matrix
                        </RevenueHeaderTd>
                      </RevenueHeaderTr>
                      <tr>
                        <Th style={{ width:"220px" }}>MHC Package</Th>
                        <Th center style={{ width:"100px" }}>Category</Th>
                        {monthsList.map((m, idx) => (
                          <Th key={idx} right>{m}</Th>
                        ))}
                        <Th right style={{ background:"#c8dce8", color:"#0c4a6e" }}>Total Patients</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.package_matrix || []).map((r, i) => (
                        <Tr key={i} even={i % 2 === 0}>
                          <Td bold>{r.package}</Td>
                          <Td center style={{ color: r.category === "MHC" ? "#1d4ed8" : "#7c3aed", fontWeight: 700 }}>
                            {r.category}
                          </Td>
                          {monthsList.map((m, idx) => (
                            <Td key={idx} right>{r.monthly_counts[m] || 0}</Td>
                          ))}
                          <Td right bold style={{ color:"#0c4a6e", background:"#f0fdfa" }}>
                            {r.total_patients}
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <TotRow>
                        <TotTd>Total</TotTd>
                        <TotTd center>-</TotTd>
                        {monthsList.map((m, idx) => (
                          <TotTd key={idx} right>
                            {(gt.monthly_patient_totals && gt.monthly_patient_totals[m]) || 0}
                          </TotTd>
                        ))}
                        <TotTd right>{gt.patient_count || 0}</TotTd>
                      </TotRow>
                    </tfoot>
                  </Tbl>
                </TableScroll>
              </TableCard>
            )}

          </TablesStack>
        </>
      )}
    </PageWrapper>
  );
}
