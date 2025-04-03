import React, { useState, useEffect } from 'react';
import { Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled Components
const MainContent = styled.div`
  margin-left: 250px;
  margin-top: 50px;
  padding: 20px;
  min-height: 100vh;
`;

const StyledContainer = styled(Container)`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TableWrapper = styled.div`
  margin-top: 20px;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
`;

const TableHeader = styled.thead`
  background-color: #004d46;
  color: #ffffff;

  tr {
    th {
      padding: 10px;
      text-align: left;
    }
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #e0f7fa;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dddddd;
  text-align: left;
`;

const ActionButton = styled(Button)`
  background-color: #006b63 !important;
  color: #ffffff !important;
  &:hover {
    background-color: #004d46 !important;
  }
`;

// Component
function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://hms.shinovadatabase.in/doctor_list/')
      .then((response) => setDoctors(response.data))
      .catch((error) => console.error('Error fetching doctors:', error));
  }, []);

  const handleShowDetails = (first_name) => {
    navigate(`/DoctorList/${first_name}`);
  };

  return (
    <MainContent>
      <StyledContainer>
        <Typography variant="h4" align="center" gutterBottom>
          Doctor List
        </Typography>
        <TableWrapper>
          <StyledTable>
            <TableHeader>
              <tr>
                <th>S.No</th>
                <th>Doctor Name</th>
                <th>department</th>
                <th>Designation</th>
                <th>Phone Number</th>
                <th>Action</th>
              </tr>
            </TableHeader>
            <tbody>
              {doctors.map((doctor, index) => (
                <TableRow key={doctor.first_name}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                  </TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>{doctor.designation}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell>
                    <ActionButton
                      variant="contained"
                      onClick={() => handleShowDetails(doctor.first_name)}
                    >
                      Show Details
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </StyledTable>
        </TableWrapper>
      </StyledContainer>
    </MainContent>
  );
}

export default DoctorList;
