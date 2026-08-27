import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { Search } from 'lucide-react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px 24px;
  background-color: transparent;
  height: calc(100vh - 65px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const PageHeader = styled.div`
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;

const ControlCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 480px;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 13.5px;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background: #ffffff;
    border-color: #133d34;
    box-shadow: 0 0 0 3px rgba(19, 61, 52, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${props => props.active ? '#133d34' : '#e2e8f0'};
  background: ${props => props.active ? '#133d34' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#475569'};
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? '#0f312a' : '#f1f5f9'};
  }
`;

const Divider = styled.div`
  height: 24px;
  width: 1px;
  background-color: #e2e8f0;
  margin: 0 4px;
`;

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  flex: 1;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const TableHead = styled.thead`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;

  th {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    background: #f8fafc;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 14px 16px;
  vertical-align: middle;
  font-size: 13.5px;
  color: #334155;
`;

const EmpIdText = styled.span`
  font-weight: 700;
  color: #133d34;
  font-family: inherit;
`;

const DoctorNameGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DoctorNameText = styled.span`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

const DesignationText = styled.span`
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
`;

const DayBadgesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

const DayBadge = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background-color: ${props => props.active ? '#133d34' : '#e2e8f0'};
  color: ${props => props.active ? '#ffffff' : '#94a3b8'};
`;

const ScheduleSubtext = styled.div`
  font-size: 12px;
  color: ${props => props.empty ? '#94a3b8' : '#64748b'};
`;

const FeeText = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  border: ${props => props.variant === 'solid' ? 'none' : '1px solid #133d34'};
  background: ${props => props.variant === 'solid' ? '#133d34' : '#ffffff'};
  color: ${props => props.variant === 'solid' ? '#ffffff' : '#133d34'};

  &:hover {
    background: ${props => props.variant === 'solid' ? '#0f312a' : '#f0fdf4'};
  }
`;

const DAYS_SHORT = [
  { full: 'Monday', label: 'M' },
  { full: 'Tuesday', label: 'T' },
  { full: 'Wednesday', label: 'W' },
  { full: 'Thursday', label: 'T' },
  { full: 'Friday', label: 'F' },
  { full: 'Saturday', label: 'S' },
  { full: 'Sunday', label: 'S' },
];

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchDoctors();
  }, [HMSURL]);

  const fetchDoctors = async () => {
    setLoading(true);
    const result = await apiRequest(`${HMSURL}doctor_schedule/`, 'GET');

    if (result.success) {
      setDoctors(result.data || []);
    } else {
      toast.error(result.error || 'Failed to fetch doctor schedule list');
    }
    setLoading(false);
  };

  const handleEditSchedule = (employeeId) => {
    navigate(`/DoctorSchedule/${employeeId}`);
  };

  // Filtered doctors logic
  const filteredDoctors = doctors.filter(doc => {
    const nameMatch = (doc.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (doc.employeeId || '').toString().toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'All' || 
                       (statusFilter === 'Scheduled' && doc.schedule_exists) ||
                       (statusFilter === 'Not set' && !doc.schedule_exists);
    return nameMatch && statusMatch;
  });

  const scheduledCount = doctors.filter(d => d.schedule_exists).length;

  if (loading) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          <div>Loading doctor schedule management...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>Doctor schedule management</Title>
        <Subtitle>{scheduledCount} of {doctors.length} doctors have a working schedule set</Subtitle>
      </PageHeader>

      <ControlCard>
        <SearchInputWrapper>
          <SearchIconWrapper>
            <Search size={16} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="Search doctor name or employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInputWrapper>

        <FilterGroup>
          <FilterPill
            active={statusFilter === 'All'}
            onClick={() => setStatusFilter('All')}
          >
            All
          </FilterPill>
          <FilterPill
            active={statusFilter === 'Scheduled'}
            onClick={() => setStatusFilter('Scheduled')}
          >
            Scheduled
          </FilterPill>
          <FilterPill
            active={statusFilter === 'Not set'}
            onClick={() => setStatusFilter('Not set')}
          >
            Not set
          </FilterPill>
        </FilterGroup>
      </ControlCard>

      <TableContainer>
        <StyledTable>
          <TableHead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>S.NO</th>
              <th style={{ width: '120px' }}>EMP ID</th>
              <th style={{ width: '220px' }}>DOCTOR NAME</th>
              <th style={{ width: '180px' }}>DEPARTMENT</th>
              <th>WORKING DAYS</th>
              <th style={{ width: '110px' }}>FEE</th>
              <th style={{ width: '150px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </TableHead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No doctors found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doctor, index) => {
                const daySchedule = doctor.day_schedule || [];
                const timeSchedule = doctor.time_schedule || [];
                const hasSchedule = doctor.schedule_exists;
                const formattedIndex = (index + 1).toString().padStart(2, '0');

                // Determine time range string
                let timeRangeStr = "";
                if (timeSchedule.length > 0) {
                  const slotsCount = timeSchedule.length;
                  const firstSlot = timeSchedule[0] ? timeSchedule[0].split('-')[0] : '09:00';
                  const lastSlot = timeSchedule[timeSchedule.length - 1] ? timeSchedule[timeSchedule.length - 1].split('-')[1] : '18:00';
                  timeRangeStr = `${slotsCount} slots · ${firstSlot} – ${lastSlot}`;
                }

                return (
                  <TableRow key={doctor.employeeId}>
                    <TableCell style={{ textAlign: 'center', fontWeight: '600', color: '#94a3b8' }}>
                      {formattedIndex}
                    </TableCell>

                    <TableCell>
                      <EmpIdText>{doctor.employeeId}</EmpIdText>
                    </TableCell>

                    <TableCell>
                      <DoctorNameGroup>
                        <DoctorNameText>{doctor.employeeName}</DoctorNameText>
                        <DesignationText>{doctor.designation || 'Doctor'}</DesignationText>
                      </DoctorNameGroup>
                    </TableCell>

                    <TableCell style={{ fontWeight: '500', color: '#475569' }}>
                      {doctor.department || 'N/A'}
                    </TableCell>

                    <TableCell>
                      <DayBadgesRow>
                        {DAYS_SHORT.map((d, i) => {
                          const isActive = daySchedule.includes(d.full);
                          return (
                            <DayBadge key={i} active={isActive}>
                              {d.label}
                            </DayBadge>
                          );
                        })}
                      </DayBadgesRow>
                      <ScheduleSubtext empty={!hasSchedule}>
                        {hasSchedule && timeRangeStr ? timeRangeStr : (hasSchedule ? 'Schedule set' : 'Schedule not set')}
                      </ScheduleSubtext>
                    </TableCell>

                    <TableCell>
                      <FeeText>
                        {doctor.consulting_fee ? `₹${doctor.consulting_fee}` : '–'}
                      </FeeText>
                    </TableCell>

                    <TableCell style={{ textAlign: 'right' }}>
                      <ActionButton
                        variant={hasSchedule ? 'outline' : 'solid'}
                        onClick={() => handleEditSchedule(doctor.employeeId)}
                      >
                        {hasSchedule ? 'Edit schedule' : 'Set schedule'}
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </StyledTable>
      </TableContainer>
    </PageContainer>
  );
}

export default DoctorList;