import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import {
  Stethoscope,
  Users,
  Bed,
  LogOut,
  FlaskConical,
  IndianRupee,
  RefreshCw,
  Search,
  ArrowUpDown,
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const currency = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdfa 0%, #f8fafc 240px);
  padding: 28px 24px 60px;
  font-family: "Inter", -apple-system, sans-serif;

  @media (max-width: 768px) {
    padding: 16px 12px 40px;
  }
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;

  .title-block {
    h1 {
      font-size: 1.7rem;
      font-weight: 850;
      color: #0f172a;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.02em;
    }
    p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PeriodTabs = styled.div`
  display: flex;
  background: white;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  button {
    border: none;
    background: transparent;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;

    &.active {
      background: #0d9488;
      color: white;
      box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
    }

    &:hover:not(.active) {
      color: #0f172a;
      background: #f1f5f9;
    }
  }
`;

const DateRangeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  input {
    border: none;
    outline: none;
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    background: transparent;
  }
`;

const RefreshBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #0d9488;
    border-color: #0d9488;
  }

  svg {
    ${({ $spinning }) =>
      $spinning &&
      css`
        animation: ${spin} 0.8s linear infinite;
      `}
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const KpiCard = styled.div`
  background: white;
  border-radius: 18px;
  padding: 18px 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  animation: ${fadeIn} 0.4s ease-out backwards;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    font-size: 0.74rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .icon-box {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $bg }) => $bg || "#f0fdfa"};
    color: ${({ $color }) => $color || "#0d9488"};
  }

  .val {
    font-size: 1.55rem;
    font-weight: 850;
    color: #0f172a;
    line-height: 1.1;
  }

  .sub {
    font-size: 0.74rem;
    color: #94a3b8;
    font-weight: 500;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);

  .card-title {
    font-size: 1rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 18px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const TableToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;

  .search-box {
    position: relative;
    flex: 1;
    max-width: 360px;

    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.85rem;
      outline: none;
      &:focus {
        background: white;
        border-color: #0d9488;
      }
    }
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid #e2e8f0;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      background: #f8fafc;
      padding: 13px 16px;
      text-align: left;
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;

      &:hover {
        color: #0f172a;
        background: #f1f5f9;
      }
    }

    td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.88rem;
      color: #334155;
      vertical-align: middle;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${({ $bg }) => $bg || "#f1f5f9"};
  color: ${({ $color }) => $color || "#334155"};
`;

const formatDateISO = (d) => d.toISOString().split("T")[0];

export default function DoctorDashboard() {
  const todayStr = formatDateISO(new Date());

  const [period, setPeriod] = useState("today");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_revenue");
  const [sortDir, setSortDir] = useState("desc");

  const [data, setData] = useState({
    summary: {},
    doctor_metrics: []
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
    if (p !== "all") {
      setFromDate(formatDateISO(start));
      setToDate(formatDateISO(end));
    }
  };

  const fetchDoctorStats = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (period !== "all") {
        params.from_date = fromDate;
        params.to_date = toDate;
      }
      const res = await axios.get(`${Hmsbaseurl}doctor-dashboard/stats/`, { params });
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch doctor analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
  }, [period, fromDate, toDate]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (data.doctor_metrics || []).filter((d) => {
      if (!q) return true;
      return (
        (d.doctor_name || "").toLowerCase().includes(q) ||
        (d.department || "").toLowerCase().includes(q) ||
        (d.doctor_id || "").toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      const valA = a[sortBy] ?? 0;
      const valB = b[sortBy] ?? 0;
      if (typeof valA === "string") {
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [data.doctor_metrics, search, sortBy, sortDir]);

  const topDoctorsByRevenue = useMemo(() => {
    return [...(data.doctor_metrics || [])]
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 8)
      .map((d) => ({
        name: d.doctor_name.length > 18 ? d.doctor_name.slice(0, 18) + "..." : d.doctor_name,
        "OP Fee": d.op_revenue,
        "Investigations": d.investigation_revenue,
        "IP Procedures": d.ip_revenue
      }));
  }, [data.doctor_metrics]);

  const topDoctorsByVolume = useMemo(() => {
    return [...(data.doctor_metrics || [])]
      .sort((a, b) => b.op_count + b.ip_count - (a.op_count + a.ip_count))
      .slice(0, 8)
      .map((d) => ({
        name: d.doctor_name.length > 18 ? d.doctor_name.slice(0, 18) + "..." : d.doctor_name,
        OP: d.op_count,
        IP: d.ip_count,
        Discharges: d.discharge_count,
        Investigations: d.investigation_count
      }));
  }, [data.doctor_metrics]);

  const summary = data.summary || {};

  return (
    <PageContainer>
      <HeaderBar>
        <div className="title-block">
          <h1>
            <Stethoscope size={28} color="#0d9488" />
            Doctor-Wise Analytics Dashboard
          </h1>
          <p>
            Track doctor-wise IP admissions, OP visits, discharges, investigations & attributed revenue
          </p>
        </div>

        <ControlsGroup>
          <PeriodTabs>
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "week", label: "7 Days" },
              { id: "month", label: "This Month" },
              { id: "all", label: "All Time" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={period === tab.id ? "active" : ""}
                onClick={() => handlePresetClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </PeriodTabs>

          {period !== "all" && (
            <DateRangeBox>
              <Calendar size={15} color="#0d9488" />
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => {
                  setPeriod("custom");
                  setFromDate(e.target.value);
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>to</span>
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
            </DateRangeBox>
          )}

          <RefreshBtn $spinning={loading} onClick={fetchDoctorStats} title="Refresh">
            <RefreshCw size={16} />
          </RefreshBtn>
        </ControlsGroup>
      </HeaderBar>

      {/* ─── SUMMARY KPI CARDS ──────────────────────────────────────────────── */}
      <KpiGrid>
        <KpiCard $bg="#f0fdfa" $color="#0d9488">
          <div className="top">
            <span className="label">Active Doctors</span>
            <div className="icon-box">
              <Stethoscope size={17} />
            </div>
          </div>
          <div className="val">{summary.active_doctors || 0}</div>
          <div className="sub">With activity in period</div>
        </KpiCard>

        <KpiCard $bg="#eff6ff" $color="#2563eb">
          <div className="top">
            <span className="label">Doctor OP Visits</span>
            <div className="icon-box">
              <Users size={17} />
            </div>
          </div>
          <div className="val">{(summary.total_op || 0).toLocaleString()}</div>
          <div className="sub">OP Revenue: {currency(summary.total_op_revenue)}</div>
        </KpiCard>

        <KpiCard $bg="#fef3c7" $color="#d97706">
          <div className="top">
            <span className="label">Doctor IP Admissions</span>
            <div className="icon-box">
              <Bed size={17} />
            </div>
          </div>
          <div className="val">{(summary.total_ip || 0).toLocaleString()}</div>
          <div className="sub">Inpatient admissions</div>
        </KpiCard>

        <KpiCard $bg="#f3e8ff" $color="#7c3aed">
          <div className="top">
            <span className="label">Discharges</span>
            <div className="icon-box">
              <LogOut size={17} />
            </div>
          </div>
          <div className="val">{(summary.total_discharges || 0).toLocaleString()}</div>
          <div className="sub">Completed IP discharges</div>
        </KpiCard>

        <KpiCard $bg="#ecfeff" $color="#0891b2">
          <div className="top">
            <span className="label">Investigations</span>
            <div className="icon-box">
              <FlaskConical size={17} />
            </div>
          </div>
          <div className="val">{(summary.total_investigations || 0).toLocaleString()}</div>
          <div className="sub">Value: {currency(summary.total_investigation_revenue)}</div>
        </KpiCard>

        <KpiCard $bg="#ecfdf5" $color="#059669">
          <div className="top">
            <span className="label">Total Doctor Revenue</span>
            <div className="icon-box">
              <IndianRupee size={17} />
            </div>
          </div>
          <div className="val">{currency(summary.total_revenue)}</div>
          <div className="sub">OP + IP Proc + Investigations</div>
        </KpiCard>
      </KpiGrid>

      {/* ─── CHARTS ─────────────────────────────────────────────────────────── */}
      <ChartsGrid>
        <Card>
          <div className="card-title">
            <span>Top Doctors by Revenue Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={topDoctorsByRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip formatter={(v) => currency(v)} />
              <Legend verticalAlign="top" height={32} />
              <Bar dataKey="OP Fee" stackId="rev" fill="#3b82f6" radius={[0, 0, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Investigations" stackId="rev" fill="#0d9488" radius={[0, 0, 0, 0]} maxBarSize={30} />
              <Bar dataKey="IP Procedures" stackId="rev" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="card-title">
            <span>Doctor Workload Comparison (OP / IP / Discharge / Inv)</span>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={topDoctorsByVolume} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={32} />
              <Bar dataKey="OP" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="IP" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="Discharges" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="Investigations" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </ChartsGrid>

      {/* ─── DOCTOR-WISE TABLE ──────────────────────────────────────────────── */}
      <Card>
        <TableToolbar>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1e293b" }}>
            Doctor-Wise Performance Breakdown ({filteredDoctors.length} Doctors)
          </h3>

          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search doctor name, ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </TableToolbar>

        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("doctor_name")}>
                  Doctor & Specialty <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
                <th onClick={() => handleSort("op_count")}>
                  OP Count <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
                <th onClick={() => handleSort("ip_count")}>
                  IP Admissions <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
                <th onClick={() => handleSort("discharge_count")}>
                  Discharges <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
                <th onClick={() => handleSort("investigation_count")}>
                  Investigations <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
                <th onClick={() => handleSort("total_revenue")}>
                  Total Revenue <ArrowUpDown size={12} style={{ verticalAlign: "middle" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading doctor analytics...
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No doctor records found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.doctor_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{doc.doctor_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                        {doc.department || "Specialist"} · ID: {doc.doctor_id}
                      </div>
                    </td>
                    <td>
                      <Pill $bg="#eff6ff" $color="#1d4ed8">
                        {doc.op_count} OP
                      </Pill>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                        Fee: {currency(doc.op_revenue)}
                      </div>
                    </td>
                    <td>
                      <Pill $bg="#fef3c7" $color="#b45309">
                        {doc.ip_count} IP
                      </Pill>
                      {doc.ip_revenue > 0 && (
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                          Proc: {currency(doc.ip_revenue)}
                        </div>
                      )}
                    </td>
                    <td>
                      <Pill $bg="#f3e8ff" $color="#6d28d9">
                        {doc.discharge_count} Disch
                      </Pill>
                    </td>
                    <td>
                      <Pill $bg="#ecfeff" $color="#0e7490">
                        {doc.investigation_count} Tests
                      </Pill>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                        Amt: {currency(doc.investigation_revenue)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#059669" }}>
                        {currency(doc.total_revenue)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </PageContainer>
  );
}
