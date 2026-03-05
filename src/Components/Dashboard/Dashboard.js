
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { colors, fadeIn, PageWrapper, Container, SectionTitle } from "../GlobalStyles";
import { FiUsers, FiUserCheck, FiActivity, FiUserPlus } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardWrapper = styled(PageWrapper)`
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }
  
  .chart-section {
    margin-top: 40px;
    background: ${colors.surface};
    padding: 24px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const StatCard = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ${fadeIn} 0.4s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    border-color: ${colors.primary};
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  
  &.primary {
    background: rgba(13, 148, 136, 0.1);
    color: ${colors.primary};
  }
  
  &.secondary {
    background: rgba(245, 158, 11, 0.1);
    color: ${colors.secondary};
  }
  
  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6; 
  }
  
  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: ${colors.success};
  }
`;

const StatContent = styled.div`
  flex: 1;
  h4 {
    margin: 0 0 4px;
    font-size: 0.8rem;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  
  strong {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${colors.textMain};
    line-height: 1.2;
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(13, 148, 136, 0.1);
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: spinner 0.6s linear infinite;
  
  @keyframes spinner {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.danger};
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  color: ${colors.textMain};
  margin-bottom: 20px;
  font-weight: 600;
`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_registered_patients: 0,
    today_new_patients: 0,
    today_renewals: 0,
    today_total_visits: 0,
    chart_data: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // If base URL is not set, use a relative path or direct fallback
        const baseUrl = Hmsbaseurl || "http://127.0.0.1:8000/hospital/";
        const response = await axios.get(`${baseUrl}dashboard/stats/`);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
        setLoading(false);
      }
    };

    fetchStats();
  }, [Hmsbaseurl]);

  // Calculate dummy max domain for improved chart visual if needed, 
  // or let recharts handle auto scaling.

  return (
    <DashboardWrapper>
      <Container>
        <SectionTitle>
          <h3>Dashboard Overview</h3>
        </SectionTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="dashboard-grid">
          {/* Total Registered Patients (Lifetime) */}
          <StatCard>
            <IconWrapper className="primary">
              <FiUsers />
            </IconWrapper>
            <StatContent>
              <h4>Total Registered</h4>
              {loading ? <LoadingSpinner /> : <strong>{stats.total_registered_patients}</strong>}
            </StatContent>
          </StatCard>

          {/* Today's Total Visits */}
          <StatCard>
            <IconWrapper className="info">
              <FiActivity />
            </IconWrapper>
            <StatContent>
              <h4>Today's Visits</h4>
              {loading ? <LoadingSpinner /> : <strong>{stats.today_total_visits}</strong>}
            </StatContent>
          </StatCard>

          {/* Today's New Patients */}
          <StatCard>
            <IconWrapper className="success">
              <FiUserPlus />
            </IconWrapper>
            <StatContent>
              <h4>Today's New</h4>
              {loading ? <LoadingSpinner /> : <strong>{stats.today_new_patients}</strong>}
            </StatContent>
          </StatCard>

          {/* Today's Renewals */}
          <StatCard>
            <IconWrapper className="secondary">
              <FiUserCheck />
            </IconWrapper>
            <StatContent>
              <h4>Today's Renewals</h4>
              {loading ? <LoadingSpinner /> : <strong>{stats.today_renewals}</strong>}
            </StatContent>
          </StatCard>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <ChartTitle>Patient Trends (Last 7 Days)</ChartTitle>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart
                data={stats.chart_data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="New Patients" fill={colors.success} radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Renewals" fill={colors.secondary} radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </Container>
    </DashboardWrapper>
  );
};

export default Dashboard;
