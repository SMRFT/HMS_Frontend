import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, Clock, Users, Calendar, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import apiRequest from '../../Auth/apiRequest';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const Container = styled.div`
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;

  input {
    border: none;
    outline: none;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    background: transparent;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$color || '#3b82f6'};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
`;

const StatSubtext = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$positive ? '#10b981' : '#f43f5e'};
  margin-top: 8px;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  border: 1px solid #f1f5f9;
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
`;

export default function Doctordashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`${Hmsbaseurl}OPEMR_doctordashboard/?date=${date}`, "GET");
      if (result && result.success) {
        setData(result.data);
      } else {
        console.error(result?.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !data) {
    return <Container><Title>Loading Dashboard...</Title></Container>;
  }

  const summary = data?.summary || {};
  const peakHourData = data?.peak_hour_data || [];

  const patientDiff = (summary.total_patients_today || 0) - (summary.total_patients_yesterday || 0);
  const patientDiffText = patientDiff >= 0 ? `+${patientDiff} from yesterday` : `${patientDiff} from yesterday`;
  const isPositive = patientDiff >= 0;

  return (
    <Container>
      <Header>
        <Title>
          <Stethoscope size={32} color="#0d9488" />
          Doctor Analytics Dashboard
        </Title>
        <DatePickerWrapper>
          <Calendar size={18} color="#64748b" />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </DatePickerWrapper>
      </Header>

      <SummaryGrid>
        <StatCard $color="#3b82f6">
          <StatHeader>
            TOTAL PATIENTS (TODAY)
            <Users size={20} />
          </StatHeader>
          <StatValue>{summary.total_patients_today || 0}</StatValue>
          <StatSubtext $positive={isPositive}>{patientDiffText}</StatSubtext>
        </StatCard>

        <StatCard $color="#10b981">
          <StatHeader>
            AVG CONSULTATION TIME
            <Clock size={20} />
          </StatHeader>
          <StatValue>{summary.avg_consult_time_mins || 0} <span style={{fontSize: '1rem', color: '#64748b'}}>mins</span></StatValue>
        </StatCard>

        <StatCard $color="#f59e0b">
          <StatHeader>
            COMPLETED CONSULTS
            <UserCheck size={20} />
          </StatHeader>
          <StatValue>{summary.completed_consults || 0}</StatValue>
        </StatCard>

        <StatCard $color="#8b5cf6">
          <StatHeader>
            CONSULT WINDOW
            <Activity size={20} />
          </StatHeader>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginTop: '12px' }}>
            {formatTime(summary.first_consult_time)} - {formatTime(summary.last_consult_time)}
          </div>
        </StatCard>
      </SummaryGrid>

      <ChartContainer>
        <ChartTitle>Peak Hour Analysis (Patient Load by Hour)</ChartTitle>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={peakHourData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Legend />
              <Bar dataKey="patients" name="Patients Registered" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </Container>
  );
}
