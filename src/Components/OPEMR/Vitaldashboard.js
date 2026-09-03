import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, Clock, Users, Calendar, UserCheck } from 'lucide-react';
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f8fafc;
    padding: 16px;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.925rem;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: #f8fafc;
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$bg || '#e2e8f0'};
  color: ${props => props.$color || '#475569'};
`;

export default function VitalDashboard() {
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`${Hmsbaseurl}OPEMR_Vitaldashboard/?from_date=${fromDate}&to_date=${toDate}`, "GET");
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

  const getWaitBadge = (mins) => {
    if (mins === null || mins === undefined) return <Badge>N/A</Badge>;
    if (mins <= 15) return <Badge $bg="#dcfce7" $color="#166534">{mins} mins</Badge>;
    if (mins <= 30) return <Badge $bg="#fef3c7" $color="#92400e">{mins} mins</Badge>;
    return <Badge $bg="#fee2e2" $color="#991b1b">{mins} mins</Badge>;
  };

  const processChartData = () => {
    if (!data?.patients) return [];
    
    // Group by hour
    const hourly = {};
    data.patients.forEach(p => {
      if (p.billed_date) {
        const hour = new Date(p.billed_date).getHours();
        const label = `${hour}:00`;
        if (!hourly[label]) hourly[label] = { time: label, Billed: 0, Vitals: 0 };
        hourly[label].Billed += 1;
      }
      if (p.vital_date) {
        const hour = new Date(p.vital_date).getHours();
        const label = `${hour}:00`;
        if (!hourly[label]) hourly[label] = { time: label, Billed: 0, Vitals: 0 };
        hourly[label].Vitals += 1;
      }
    });

    return Object.values(hourly).sort((a, b) => parseInt(a.time) - parseInt(b.time));
  };

  if (loading && !data) {
    return <Container><Title>Loading Dashboard...</Title></Container>;
  }

  const summary = data?.summary || {};
  const patients = data?.patients || [];
  const chartData = processChartData();

  return (
    <Container>
      <Header>
        <Title>
          <Activity size={32} color="#0d9488" />
          OP Analytics & Flow Dashboard
        </Title>
        <DatePickerWrapper>
          <Calendar size={18} color="#64748b" />
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>From:</span>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ marginRight: '12px' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>To:</span>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </DatePickerWrapper>
      </Header>

      <SummaryGrid>
        <StatCard $color="#3b82f6">
          <StatHeader>
            TOTAL BILLED PATIENTS
            <Users size={20} />
          </StatHeader>
          <StatValue>{summary.total_billed || 0}</StatValue>
        </StatCard>

        <StatCard $color="#10b981">
          <StatHeader>
            VITALS COMPLETED
            <UserCheck size={20} />
          </StatHeader>
          <StatValue>{summary.vitals_completed || 0}</StatValue>
        </StatCard>

        <StatCard $color="#f59e0b">
          <StatHeader>
            AVG VITAL WAIT
            <Clock size={20} />
          </StatHeader>
          <StatValue>{summary.avg_vital_wait_mins || 0} <span style={{fontSize: '1rem', color: '#64748b'}}>mins</span></StatValue>
        </StatCard>

        <StatCard $color="#8b5cf6">
          <StatHeader>
            AVG DOCTOR WAIT
            <Clock size={20} />
          </StatHeader>
          <StatValue>{summary.avg_doc_wait_mins || 0} <span style={{fontSize: '1rem', color: '#64748b'}}>mins</span></StatValue>
        </StatCard>
      </SummaryGrid>

      <ChartContainer>
        <ChartTitle>Patient Flow by Hour</ChartTitle>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Billed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Vitals" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      <ChartTitle style={{marginBottom: '16px'}}>Detailed Patient Log</ChartTitle>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Billed Time</th>
              <th>Vitals Taken Time</th>
              <th>Vital Wait Time</th>
              <th>Consult Started</th>
              <th>Doctor Wait Time</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? patients.map((p, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{fontWeight: 600}}>{p.patient_name}</div>
                  <div style={{fontSize: '0.8rem', color: '#64748b'}}>{p.uhid}</div>
                </td>
                <td>{formatTime(p.billed_date)}</td>
                <td>{formatTime(p.vital_date)}</td>
                <td>{getWaitBadge(p.vital_wait_mins)}</td>
                <td>{formatTime(p.consultation_start)}</td>
                <td>{getWaitBadge(p.doc_wait_mins)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                  No patient records found for the selected date.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}
