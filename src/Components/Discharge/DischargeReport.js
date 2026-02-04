import React, { useState, useEffect } from 'react';
import apiRequest from '../../Auth/apiRequest';
import {
  Container,
  SectionTitle,
  Table,
  Th,
  Td,
  Tr,
  Select,
  Label,
} from '../GlobalStyles';
import styled from 'styled-components';

const FilterSection = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const DischargeReport = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDischargeDetails();
  }, []);

  const fetchDischargeDetails = async () => {
    try {
      const response = await apiRequest(
        `${process.env.REACT_APP_BACKEND_HMS_BASE_URL}discharge/`,
        "GET"
      );
      if (response.success) {
        setData(response.data);
      } else {
        console.error("Failed to fetch discharge details", response.error);
      }
    } catch (error) {
      console.error("Failed to fetch discharge details", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filterData = () => {
    if (filter === 'all') return data;

    const now = new Date();
    const filtered = data.filter(item => {
      if (!item.discharge_date?.$date) return false;
      const dischargeDate = new Date(item.discharge_date.$date);

      switch (filter) {
        case 'day':
          return dischargeDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return dischargeDate >= weekAgo && dischargeDate <= now;
        case 'month':
          return dischargeDate.getMonth() === now.getMonth() &&
            dischargeDate.getFullYear() === now.getFullYear();
        case 'year':
          return dischargeDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
    return filtered;
  };

  const displayData = filterData();

  return (
    <Container>
      <SectionTitle><h3>Discharge Summary Report</h3></SectionTitle>

      <FilterSection>
        <Label>Filter by:</Label>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </Select>
      </FilterSection>

      <Table>
        <thead>
          <Tr>
            <Th>UHID</Th>
            <Th>IP Number</Th>
            <Th>Discharge Date</Th>
            <Th>Status</Th>
          </Tr>
        </thead>
        <tbody>
          {displayData.length === 0 ? (
            <Tr>
              <Td colSpan="4" style={{ textAlign: 'center' }}>
                No discharge records found
              </Td>
            </Tr>
          ) : (
            displayData.map((item, index) => (
              <Tr key={item._id?.$oid || index}>
                <Td>{item.uhid_no || '-'}</Td>
                <Td>{item.ip_number || '-'}</Td>
                <Td>{formatDate(item.discharge_date?.$date)}</Td>
                <Td>{item.status || '-'}</Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default DischargeReport;