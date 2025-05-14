import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background: #f1f9f9;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  padding: 20px;
`;

const Header = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background: #f0f0f0;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
`;

const DischargeReport = () => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      fetchDischargeDetails();
    }, []);
  
    const fetchDischargeDetails = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/discharge/");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch discharge details", error);
      }
    };
  
    return (
      <Container>
        <Header>Summary Report</Header>
  
        <FilterSection>
          <label>Filter by:</label>
          <Select>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </Select>
        </FilterSection>
  
        <Table>
          <thead>
            <Tr>
              <Th>Patient ID</Th>
              <Th>Name</Th>
              <Th>Procedure</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Status</Th>
            </Tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                <Td>{item.uhid_no}</Td>
                <Td>{item.ip_number}</Td>
                <Td>{item.discharge_date}</Td>
                <Td>₹{item.amount}</Td>
                <Td>{item.date}</Td>
                <Td>{item.status}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  };
  
  export default DischargeReport;