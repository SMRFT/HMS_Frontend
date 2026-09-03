import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, Clock, Users, ArrowRight, UserCheck, Stethoscope, RefreshCw } from 'lucide-react';
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

const LastUpdated = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatusColumn = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
`;

const ColumnHeader = styled.div`
  padding: 16px 20px;
  font-weight: 600;
  font-size: 1.1rem;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$bg || '#f8fafc'};
`;

const BadgeCount = styled.div`
  background: white;
  color: #0f172a;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const ColumnBody = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
`;

const PatientCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.$color || '#cbd5e1'};
`;

const PatientName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 4px;
`;

const PatientDetail = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  margin-top: 24px;
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
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$bg || '#e2e8f0'};
  color: ${props => props.$color || '#475569'};
`;

export default function Patientlivetracking() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const result = await apiRequest(`${Hmsbaseurl}OPEMR_patientlivetracking/`, "GET");
      if (result && result.success) {
        setPatients(result.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && patients.length === 0) {
    return <Container><Title>Loading Live Tracker...</Title></Container>;
  }

  // Categorize patients
  const registered = patients.filter(p => p.status === 'Registered' || p.status === 'Waiting for Vitals');
  const waitingDoctor = patients.filter(p => p.status === 'Waiting for Doctor');
  const inConsultation = patients.filter(p => p.status === 'In Consultation');
  const completed = patients.filter(p => p.status === 'Completed');

  return (
    <Container>
      <Header>
        <Title>
          <Activity size={32} color="#0ea5e9" />
          Live Patient Tracker
        </Title>
        <LastUpdated>
          <RefreshCw size={14} />
          Auto-updated: {lastUpdated.toLocaleTimeString()}
        </LastUpdated>
      </Header>

      <StatusGrid>
        <StatusColumn>
          <ColumnHeader $bg="#f1f5f9">
            Registration / Vitals
            <BadgeCount>{registered.length}</BadgeCount>
          </ColumnHeader>
          <ColumnBody>
            {registered.map(p => (
              <PatientCard key={p.uhid} $color="#94a3b8">
                <PatientName>{p.patient_name}</PatientName>
                <PatientDetail>UHID: {p.uhid}</PatientDetail>
                <PatientDetail><Clock size={12} /> Billed: {formatTime(p.checkin_time)}</PatientDetail>
              </PatientCard>
            ))}
            {registered.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No patients</div>}
          </ColumnBody>
        </StatusColumn>

        <StatusColumn>
          <ColumnHeader $bg="#fef3c7">
            Waiting for Doctor
            <BadgeCount>{waitingDoctor.length}</BadgeCount>
          </ColumnHeader>
          <ColumnBody>
            {waitingDoctor.map(p => (
              <PatientCard key={p.uhid} $color="#f59e0b">
                <PatientName>{p.patient_name}</PatientName>
                <PatientDetail>UHID: {p.uhid}</PatientDetail>
                <PatientDetail><Clock size={12} /> Billed: {formatTime(p.checkin_time)}</PatientDetail>
              </PatientCard>
            ))}
            {waitingDoctor.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No patients</div>}
          </ColumnBody>
        </StatusColumn>

        <StatusColumn>
          <ColumnHeader $bg="#e0f2fe">
            In Consultation
            <BadgeCount>{inConsultation.length}</BadgeCount>
          </ColumnHeader>
          <ColumnBody>
            {inConsultation.map(p => (
              <PatientCard key={p.uhid} $color="#0ea5e9">
                <PatientName>{p.patient_name}</PatientName>
                <PatientDetail>UHID: {p.uhid}</PatientDetail>
                <PatientDetail><Clock size={12} /> Started: {formatTime(p.consult_start)}</PatientDetail>
              </PatientCard>
            ))}
            {inConsultation.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No patients</div>}
          </ColumnBody>
        </StatusColumn>

        <StatusColumn>
          <ColumnHeader $bg="#dcfce7">
            Completed
            <BadgeCount>{completed.length}</BadgeCount>
          </ColumnHeader>
          <ColumnBody>
            {completed.map(p => (
              <PatientCard key={p.uhid} $color="#10b981">
                <PatientName>{p.patient_name}</PatientName>
                <PatientDetail>UHID: {p.uhid}</PatientDetail>
                <PatientDetail><Clock size={12} /> Ended: {formatTime(p.consult_end)}</PatientDetail>
              </PatientCard>
            ))}
            {completed.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No patients</div>}
          </ColumnBody>
        </StatusColumn>
      </StatusGrid>

      <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '16px' }}>All Today's Patients</h2>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Status</th>
              <th>Billed / Reg Time</th>
              <th>Consult Started</th>
              <th>Consult Ended</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? patients.map((p, idx) => {
              let badgeBg = '#f1f5f9';
              let badgeColor = '#475569';
              if (p.status_color === 'green') { badgeBg = '#dcfce7'; badgeColor = '#166534'; }
              if (p.status_color === 'blue') { badgeBg = '#e0f2fe'; badgeColor = '#075985'; }
              if (p.status_color === 'orange') { badgeBg = '#fef3c7'; badgeColor = '#92400e'; }
              if (p.status_color === 'yellow') { badgeBg = '#fef9c3'; badgeColor = '#854d0e'; }

              return (
                <tr key={idx}>
                  <td>
                    <div style={{fontWeight: 600}}>{p.patient_name}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{p.uhid}</div>
                  </td>
                  <td>
                    <Badge $bg={badgeBg} $color={badgeColor}>{p.status}</Badge>
                  </td>
                  <td>{formatTime(p.checkin_time)}</td>
                  <td>{formatTime(p.consult_start)}</td>
                  <td>{formatTime(p.consult_end)}</td>
                  <td>{p.department || 'OPD'}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                  No active patients today.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}
