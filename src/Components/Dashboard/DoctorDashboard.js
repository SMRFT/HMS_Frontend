import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, Stethoscope } from 'lucide-react';
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
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
    background: transparent;
  }
  
  span {
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.9rem;
  }
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
    vertical-align: top;
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
  display: inline-block;
  margin-bottom: 4px;
  margin-right: 4px;
`;

export default function DoctorDashboard() {
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
      const result = await apiRequest(`${Hmsbaseurl}OPEMR_doctordashboard/?from_date=${fromDate}&to_date=${toDate}`, "GET");
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

  if (loading && !data) {
    return <Container><Title>Loading Dashboard...</Title></Container>;
  }

  const doctorMetrics = data?.doctor_metrics || [];

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
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <span>to</span>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            min={fromDate}
          />
        </DatePickerWrapper>
      </Header>

      <ChartTitle style={{marginBottom: '16px'}}>Doctor Performance Overview</ChartTitle>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>OP Count</th>
              <th>IP Count</th>
              <th>Total Consulting Time (mins)</th>
              <th style={{ width: '40%' }}>Patients Consulted</th>
            </tr>
          </thead>
          <tbody>
            {doctorMetrics.length > 0 ? doctorMetrics.map((doc, idx) => {
              const patientsArr = doc.patients_list ? doc.patients_list.split(', ') : [];
              return (
                <tr key={idx}>
                  <td>
                    <div style={{fontWeight: 600, color: '#0f172a'}}>{doc.doctor_name}</div>
                  </td>
                  <td>
                    <Badge $bg="#e0f2fe" $color="#075985">{doc.op_count} OP</Badge>
                  </td>
                  <td>
                    <Badge $bg="#fef3c7" $color="#92400e">{doc.ip_count} IP</Badge>
                  </td>
                  <td>
                    <div style={{fontWeight: 600}}>{doc.consult_mins} <span style={{fontSize: '0.8rem', color: '#64748b'}}>mins</span></div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {patientsArr.length > 0 ? patientsArr.map((p, i) => (
                        <span key={i} style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {p}
                        </span>
                      )) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                  No doctor metrics found for the selected date.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}
