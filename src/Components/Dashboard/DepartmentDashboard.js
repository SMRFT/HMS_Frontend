import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  Building2, Users, UserCheck, DollarSign, Calendar, RefreshCw,
  TrendingUp, Award, Layers, ChevronRight, Stethoscope, ArrowUpRight
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── LAYOUT & STYLED COMPONENTS ──────────────────────────────────────────────
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 280px);
  padding: 28px 24px 60px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
`;

const HeroCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, #064e3b 0%, #047857 45%, #059669 100%);
  border-radius: 24px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: white;
  box-shadow: 0 20px 40px -12px rgba(4, 120, 87, 0.35);
  animation: ${fadeIn} 0.4s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 85% 20%, rgba(255,255,255,0.15), transparent 55%);
    pointer-events: none;
  }
`;

const HeroIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;

  .icon-box {
    width: 60px; height: 60px;
    border-radius: 16px;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
    flex-shrink: 0;
  }

  .meta {
    .eyebrow {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; opacity: 0.85; margin-bottom: 4px;
    }
    h1 {
      font-size: 1.6rem; font-weight: 800; margin: 0;
      letter-spacing: -0.02em;
    }
    .sub { font-size: 0.85rem; opacity: 0.85; margin-top: 4px; }
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const StyledSelect = styled.select`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.15);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  backdrop-filter: blur(4px);

  option { color: #0f172a; background: white; }
  &:focus { border-color: rgba(255,255,255,0.7); }
`;

const RefreshBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover { background: rgba(255,255,255,0.25); }
  svg { ${({ $spinning }) => $spinning && css`animation: ${rotate} 0.7s linear infinite;`} }
`;

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

const KPICard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08);
    border-color: #cbd5e1;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .icon {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: ${props => props.bg || '#ecfdf5'};
    color: ${props => props.color || '#059669'};
  }

  .title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .val {
    font-size: 1.65rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-top: 4px;
  }

  .sub {
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      font-weight: 700;
      color: #059669;
    }
  }
`;

// ─── CHARTS & TABLES GRID ───────────────────────────────────────────────────
const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px dashed #e2e8f0;

  &:last-child { border-bottom: none; }

  .source-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: ${props => props.color || '#059669'};
    }

    .name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #334155;
    }
  }

  .amount {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
  }
`;

// ─── TABLES ──────────────────────────────────────────────────────────────────
const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
  }

  tbody tr:hover {
    background: #f8fafc;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;

  .fill {
    height: 100%;
    background: #059669;
    border-radius: 3px;
    width: ${props => props.pct || 0}%;
  }
`;

const DepartmentDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        `${Hmsbaseurl}department-dashboard/stats/?department=${encodeURIComponent(selectedDept)}&month=${selectedMonth}&year=${selectedYear}`,
        "GET"
      );
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching department dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [Hmsbaseurl, selectedDept, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = data?.kpis || {};
  const departmentsList = data?.departments || ["All"];
  const deptBreakdown = data?.department_breakdown || [];
  const doctorPerf = data?.doctor_performance || [];
  const monthlyTrend = data?.monthly_trend || [];

  const maxRevenue = Math.max(...deptBreakdown.map(d => d.total_revenue), 1);

  return (
    <DashboardContainer>
      {/* Hero Card */}
      <HeroCard>
        <HeroIdentity>
          <div className="icon-box">
            <Building2 size={32} color="#ffffff" />
          </div>
          <div className="meta">
            <div className="eyebrow">
              <Building2 size={12} /> Hospital Analytics
            </div>
            <h1>Department Dashboard</h1>
            <div className="sub">
              Department-wise OP, IP, Pharmacy & Revenue Analytics
            </div>
          </div>
        </HeroIdentity>

        <ControlsGroup>
          <StyledSelect
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departmentsList.map((d, i) => (
              <option key={i} value={d}>{d === "All" ? "All Departments" : d}</option>
            ))}
          </StyledSelect>

          <StyledSelect
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </StyledSelect>

          <StyledSelect
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </StyledSelect>

          <RefreshBtn $spinning={loading} onClick={fetchDashboardData} title="Refresh Data">
            <RefreshCw size={18} />
          </RefreshBtn>
        </ControlsGroup>
      </HeroCard>

      {/* KPI Cards */}
      <KPIGrid>
        <KPICard bg="#ecfdf5" color="#059669">
          <div className="top">
            <span className="title">Total OP Patients</span>
            <div className="icon"><Users size={20} /></div>
          </div>
          <div className="val">{kpis.total_op || 0}</div>
          <div className="sub">Today: <span>+{kpis.today_op || 0} OP</span></div>
        </KPICard>

        <KPICard bg="#eff6ff" color="#2563eb">
          <div className="top">
            <span className="title">Total IP Admissions</span>
            <div className="icon"><UserCheck size={20} /></div>
          </div>
          <div className="val">{kpis.total_ip || 0}</div>
          <div className="sub">Today: <span>+{kpis.today_ip || 0} IP</span></div>
        </KPICard>

        <KPICard bg="#fef3c7" color="#d97706">
          <div className="top">
            <span className="title">Total Revenue</span>
            <div className="icon"><DollarSign size={20} /></div>
          </div>
          <div className="val">₹{(kpis.total_revenue || 0).toLocaleString('en-IN')}</div>
          <div className="sub">Monthly Aggregate</div>
        </KPICard>

        <KPICard bg="#f3e8ff" color="#7c3aed">
          <div className="top">
            <span className="title">Active Doctors</span>
            <div className="icon"><Stethoscope size={20} /></div>
          </div>
          <div className="val">{kpis.doctor_count || 0}</div>
          <div className="sub">Assigned in {selectedDept === "All" ? "Hospital" : selectedDept}</div>
        </KPICard>
      </KPIGrid>

      {/* Monthly Trend Chart & Income Breakdown */}
      <SectionGrid>
        <ContentCard>
          <div className="header">
            <h3><TrendingUp size={18} color="#059669" /> Daily OP / IP & Income Trend</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="OP" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOP)" name="OP Count" />
                <Area type="monotone" dataKey="IP" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIP)" name="IP Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="header">
            <h3><Layers size={18} color="#059669" /> Revenue Breakdown</h3>
          </div>
          <BreakdownItem color="#059669">
            <div className="source-info">
              <div className="dot"></div>
              <span className="name">OP Consultation Fees</span>
            </div>
            <div className="amount">₹{(kpis.op_income || 0).toLocaleString('en-IN')}</div>
          </BreakdownItem>

          <BreakdownItem color="#2563eb">
            <div className="source-info">
              <div className="dot" style={{ background: '#2563eb' }}></div>
              <span className="name">Pharmacy Billings</span>
            </div>
            <div className="amount">₹{(kpis.pharmacy_income || 0).toLocaleString('en-IN')}</div>
          </BreakdownItem>

          <BreakdownItem color="#7c3aed">
            <div className="source-info">
              <div className="dot" style={{ background: '#7c3aed' }}></div>
              <span className="name">Departmental Procedures</span>
            </div>
            <div className="amount">₹{(kpis.department_income || 0).toLocaleString('en-IN')}</div>
          </BreakdownItem>

          <div style={{ marginTop: '24px', padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>Total Department Revenue</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532d' }}>₹{(kpis.total_revenue || 0).toLocaleString('en-IN')}</span>
          </div>
        </ContentCard>
      </SectionGrid>

      {/* Department Comparison Table */}
      <ContentCard style={{ marginBottom: '24px' }}>
        <div className="header">
          <h3><Building2 size={18} color="#059669" /> Department Comparison Overview</h3>
        </div>
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <th>Department</th>
                <th>Doctors</th>
                <th>OP Count</th>
                <th>IP Count</th>
                <th>OP Fees (₹)</th>
                <th>Pharmacy (₹)</th>
                <th>Dept Fees (₹)</th>
                <th>Total Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {deptBreakdown.length > 0 ? (
                deptBreakdown.map((dept, idx) => {
                  const pct = Math.round((dept.total_revenue / maxRevenue) * 100);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{dept.department}</td>
                      <td>{dept.doctor_count}</td>
                      <td><span style={{ fontWeight: 700, color: '#059669' }}>{dept.total_op}</span> ({dept.today_op} today)</td>
                      <td><span style={{ fontWeight: 700, color: '#2563eb' }}>{dept.total_ip}</span> ({dept.today_ip} today)</td>
                      <td>₹{dept.op_income.toLocaleString('en-IN')}</td>
                      <td>₹{dept.pharmacy_income.toLocaleString('en-IN')}</td>
                      <td>₹{dept.department_income.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#047857' }}>₹{dept.total_revenue.toLocaleString('en-IN')}</div>
                        <ProgressBar pct={pct}><div className="fill" /></ProgressBar>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                    No department data available.
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </TableWrapper>
      </ContentCard>

      {/* Doctor Performance within Department Table */}
      <ContentCard>
        <div className="header">
          <h3><Award size={18} color="#059669" /> Doctor Performance Breakdown ({selectedDept === "All" ? "All Departments" : selectedDept})</h3>
        </div>
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Specialty</th>
                <th>OP Patients</th>
                <th>IP Admissions</th>
                <th>Consultation Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {doctorPerf.length > 0 ? (
                doctorPerf.map((doc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#047857' }}>{doc.employeeId}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{doc.doctorName}</td>
                    <td>{doc.department}</td>
                    <td>{doc.specialty}</td>
                    <td><span style={{ fontWeight: 700, color: '#059669' }}>{doc.op_count}</span></td>
                    <td><span style={{ fontWeight: 700, color: '#2563eb' }}>{doc.ip_count}</span></td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{doc.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                    No doctors found for this department filter.
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </TableWrapper>
      </ContentCard>
    </DashboardContainer>
  );
};

export default DepartmentDashboard;
