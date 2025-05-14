import React, { useState } from 'react';
import styled from 'styled-components';
// Removed the problematic import: import { Button } from '@/components/ui/button';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: #777;
`;

const FormSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ wide }) => (wide ? '32%' : '16%')};
  
  @media (max-width: 1024px) {
    width: ${({ wide }) => (wide ? '100%' : '48%')};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Label = styled.label`
  font-size: 12px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Switch = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  transform: scale(1.3);
`;

const ActionButtons = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
`;

// Custom Button component to replace the missing import
const Button = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant }) =>
    variant === 'outline'
      ? `
    background-color: transparent;
    color: #333;
    border: 1px solid #ccc;
    
    &:hover {
      background-color: #f0f0f0;
    }
  `
      : `
    background-color: #4a90e2;
    color: white;
    border: 1px solid #3a80d2;
    
    &:hover {
      background-color: #3a80d2;
    }
  `}
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const TableWrapper = styled.div`
  margin-top: 20px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f0f0f0;
  padding: 10px;
  text-align: left;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px;
  border-top: 1px solid #ccc;
`;

const ActionIcon = styled.span`
  cursor: pointer;
  color: #4a90e2;
  margin-right: 8px;
`;

const RoomShifting = () => {
  const [formData, setFormData] = useState({
    uhid: '',
    ipNo: '',
    slNo: '',
    name: '',
    age: '',
    gender: '',
    admittedOn: '',
    admittedTime: '',
    newRoom: '',
    newBedNumber: '',
    vacateOldRoom: false,
    patientAt: '',
    address: '',
    dateOfShifting: '',
    timeOfShifting: '',
    currentRoomNumber: '',
    currentBedNumber: '',
    currentDues: '',
    lastSettlementOn: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleReset = () => {
    setFormData({
      uhid: '',
      ipNo: '',
      slNo: '',
      name: '',
      age: '',
      gender: '',
      admittedOn: '',
      admittedTime: '',
      newRoom: '',
      newBedNumber: '',
      vacateOldRoom: false,
      patientAt: '',
      address: '',
      dateOfShifting: '',
      timeOfShifting: '',
      currentRoomNumber: '',
      currentBedNumber: '',
      currentDues: '',
      lastSettlementOn: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement save functionality here
    console.log('Form data submitted:', formData);
    // You would typically make an API call here
  };

  return (
    <Container>
      <Header>Home / Room Shifting</Header>

      <form onSubmit={handleSubmit}>
        <FormSection>
          <FormGroup>
            <Label htmlFor="uhid">UHID</Label>
            <Input
              type="text"
              id="uhid"
              name="uhid"
              value={formData.uhid}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="ipNo">IP No</Label>
            <Input
              type="text"
              id="ipNo"
              name="ipNo"
              value={formData.ipNo}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="slNo">SL No</Label>
            <Input
              type="text"
              id="slNo"
              name="slNo"
              value={formData.slNo}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup wide>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="age">Age</Label>
            <Input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="gender">Gender</Label>
            <Input
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="admittedOn">Admitted On</Label>
            <Input
              type="date"
              id="admittedOn"
              name="admittedOn"
              value={formData.admittedOn}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="admittedTime">Admitted Time</Label>
            <Input
              type="time"
              id="admittedTime"
              name="admittedTime"
              value={formData.admittedTime}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="newRoom">New Room</Label>
            <Input
              type="text"
              id="newRoom"
              name="newRoom"
              value={formData.newRoom}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="newBedNumber">New Bed Number</Label>
            <Input
              type="text"
              id="newBedNumber"
              name="newBedNumber"
              value={formData.newBedNumber}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="vacateOldRoom">Vacate Old Room</Label>
            <Switch>
              <Toggle
                id="vacateOldRoom"
                name="vacateOldRoom"
                checked={formData.vacateOldRoom}
                onChange={handleChange}
              />
            </Switch>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="patientAt">Patient At</Label>
            <Input
              type="text"
              id="patientAt"
              name="patientAt"
              value={formData.patientAt}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup wide>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="dateOfShifting">Date Of Shifting</Label>
            <Input
              type="date"
              id="dateOfShifting"
              name="dateOfShifting"
              value={formData.dateOfShifting}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="timeOfShifting">Time Of Shifting</Label>
            <Input
              type="time"
              id="timeOfShifting"
              name="timeOfShifting"
              value={formData.timeOfShifting}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="currentRoomNumber">Current Room Number</Label>
            <Input
              type="text"
              id="currentRoomNumber"
              name="currentRoomNumber"
              value={formData.currentRoomNumber}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="currentBedNumber">Current Bed Number</Label>
            <Input
              type="text"
              id="currentBedNumber"
              name="currentBedNumber"
              value={formData.currentBedNumber}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="currentDues">Current Dues</Label>
            <Input
              type="text"
              id="currentDues"
              name="currentDues"
              value={formData.currentDues}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="lastSettlementOn">Last Settlement On</Label>
            <Input
              type="date"
              id="lastSettlementOn"
              name="lastSettlementOn"
              value={formData.lastSettlementOn}
              onChange={handleChange}
            />
          </FormGroup>
        </FormSection>

        <ActionButtons>
          <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
          <Button type="submit">Save</Button>
        </ActionButtons>
      </form>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Actions</Th>
              <Th>Admission Date</Th>
              <Th>Room From Date</Th>
              <Th>Room To Date</Th>
              <Th>UHID</Th>
              <Th>Patient Name</Th>
              <Th>IP No / SL No</Th>
              <Th>Room No</Th>
              <Th>Bed No</Th>
              <Th>Room Occupant</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>
                <ActionIcon title="Edit">✏️</ActionIcon>
                <ActionIcon title="View">👁️</ActionIcon>
              </Td>
              <Td>13/05/2025</Td>
              <Td>13/05/2025 10:49:19</Td>
              <Td>-</Td>
              <Td>S025/002257</Td>
              <Td>SRIKANTH S</Td>
              <Td>S025/000427 / 1</Td>
              <Td>413</Td>
              <Td>1</Td>
              <Td>PATIENT</Td>
            </tr>
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default RoomShifting;