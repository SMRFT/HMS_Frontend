import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  margin-top: 60px;
  margin-left: 280px;
  max-width: 1200px;
  padding: 20px;
  background: #f1f9f9;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #0b6e75;
  font-size: 26px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #0b6e75;
  color: white;
  padding: 12px 15px;
  text-align: left;
  font-size: 15px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9f9f9;
  }
  &:hover {
    background: #e3f5f5;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  color: #333;
  font-size: 14px;
  text-align: left;
  position: relative;
`;

const ActionButton = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background: #0b6e75;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  position: relative;

  &:hover {
    background: #0c8d91;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: ${(props) => (props.visible ? 'block' : 'none')};
  min-width: 150px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #0b6e75;
  &:hover {
    background: #e3f5f5;
    color: #094f53;
  }
`;

const StockDisplay = () => {
  const [stockEntries, setStockEntries] = useState([]);

  useEffect(() => {
    fetchStockEntries();
  }, []);

  const fetchStockEntries = async () => {
    try {
      const response = await axios.get('https://hms.shinovadatabase.in/create-stock/');
      setStockEntries(response.data);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    }
  };

  return (
    <Container>
      <Title>Stock Entries</Title>
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>Invoice Number</TableHeader>
              <TableHeader>Supplier Name</TableHeader>
              <TableHeader>Medicine Name</TableHeader>
              <TableHeader>Batch Number</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Expiry Date</TableHeader>
              <TableHeader>Total Amount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.invoice_number}</TableCell>
                <TableCell>{entry.supplier_name}</TableCell>
                <TableCell>{entry.medicine_name}</TableCell>
                <TableCell>{entry.batch_number}</TableCell>
                <TableCell>{entry.quantity}</TableCell>
                <TableCell>{entry.expiry_date}</TableCell>
                <TableCell>{entry.total_amount}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default StockDisplay;
