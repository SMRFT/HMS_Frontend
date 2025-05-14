import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import DischargeReport from './DischargeReport';

const Container = styled.div`
  margin-top: 60px;
  max-width: 1150px;
  padding: 20px;
  background: #d9e6e8;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ToggleButton = styled.button`
  padding: 8px 14px;
  background-color: #00796b;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 150px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 150px;
`;

const TextArea = styled.textarea`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  background-color: ${props => props.cancel ? '#2f3b4c' : '#00796b'};

  &:hover {
    opacity: 0.9;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 20px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.4s;
  }

  span:before {
    content: "";
    position: absolute;
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + span {
    background-color: #00796b;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

export default function DischargeForm() {
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    uhid_no: '',
    ip_number: '',
    discharge_date: '',
    discharge_time: '',
    free_visits: '',
    other_consultants: '',
    status: '',
    patient_expired: false,
    date_of_death: '',
    time_of_death: '',
    discharge_reason: '',
  });

  const [filters, setFilters] = useState({
    uhidFilter: '',
    ipFilter: '',
    dateFilter: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  const handleSubmit = async () => {
    try {
      const cleanedData = {
        ...formData,
        date_of_death: formData.date_of_death === '' ? null : formData.date_of_death,
        time_of_death: formData.time_of_death === '' ? null : formData.time_of_death,
      };
  
      await axios.post('http://127.0.0.1:8000/discharge/', cleanedData);
      alert('Discharge details saved!');
    } catch (err) {
      alert('Error saving data');
      console.error(err);
    }
  };
  


  return (
    <Container>
      {/* Filter + Toggle Header */}
      <Header>
        <FilterBar>
          <FilterInput
            name="uhidFilter"
            placeholder="Filter by UHID"
            value={filters.uhidFilter}
            onChange={handleFilterChange}
          />
          <FilterInput
            name="ipFilter"
            placeholder="Filter by IP"
            value={filters.ipFilter}
            onChange={handleFilterChange}
          />
          <FilterInput
            name="dateFilter"
            type="date"
            value={filters.dateFilter}
            onChange={handleFilterChange}
          />
        </FilterBar>
        <ToggleButton onClick={() => setFormVisible(!formVisible)}>
          {formVisible ? '-DischargeForm' : '+DischargeForm'}
        </ToggleButton>
      </Header>

      {/* Conditionally Render the Form */}
      {formVisible && (
        <>
          <FormGrid>
            <InputGroup>
              <Label>UHID No *</Label>
              <Input name="uhid_no" onChange={handleChange} value={formData.uhid_no} />
            </InputGroup>
            <InputGroup>
              <Label>IP number *</Label>
              <Input name="ip_number" onChange={handleChange} value={formData.ip_number} />
            </InputGroup>
            <InputGroup>
              <Label>Patient Name</Label>
              <Input type="text" />
            </InputGroup>
            <InputGroup>
              <Label>Address</Label>
              <Input type="text" />
            </InputGroup>
            <InputGroup>
              <Label>Guardian</Label>
              <Input type="text" disabled />
            </InputGroup>

            <InputGroup>
              <Label>Discharge Date</Label>
              <Input name="discharge_date" type="date" onChange={handleChange} value={formData.discharge_date} />
            </InputGroup>
            <InputGroup>
              <Label>Time</Label>
              <Input name="discharge_time" type="time" onChange={handleChange} value={formData.discharge_time} />
            </InputGroup>
            <InputGroup>
              <Label>Admn. Date</Label>
              <Input type="text" />
            </InputGroup>
            <InputGroup>
              <Label>Current Room</Label>
              <Input type="text" />
            </InputGroup>
            <InputGroup>
              <Label>Doctor</Label>
              <Input type="text" disabled />
            </InputGroup>

            <InputGroup>
              <Label>Free Visits</Label>
              <Input name="free_visits" onChange={handleChange} value={formData.free_visits} />
            </InputGroup>
            <InputGroup>
              <Label>Other Consultants</Label>
              <Input name="other_consultants" onChange={handleChange} value={formData.other_consultants} />
            </InputGroup>
            <InputGroup>
              <Label>Status *</Label>
              <Select name="status" onChange={handleChange} value={formData.status}>
                <option>Select</option>
                <option>Discharged</option>
                <option>Transferred</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Current Dues</Label>
              <Input type="text" disabled />
            </InputGroup>
            <InputGroup>
              <Label>Patient Expired</Label>
              <ToggleWrapper>
                <ToggleLabel>
                  <input type="checkbox" name="patient_expired" onChange={handleChange} checked={formData.patient_expired} />
                  <span></span>
                </ToggleLabel>
                <span>{formData.patient_expired ? 'YES' : 'NO'}</span>
              </ToggleWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Date of Death</Label>
              <Input name="date_of_death" type="date" onChange={handleChange} value={formData.date_of_death} />
            </InputGroup>
            <InputGroup>
              <Label>Time</Label>
              <Input name="time_of_death" type="time" onChange={handleChange} value={formData.time_of_death} />
            </InputGroup>
            <InputGroup style={{ gridColumn: 'span 3' }}>
              <Label>Discharge Reason *</Label>
              <Input name="discharge_reason" onChange={handleChange} value={formData.discharge_reason} />
            </InputGroup>
          </FormGrid>

          <Footer>
            <Button cancel>X Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </Footer>
        </>
      )}

      {/* Report - Pass Filters */}
      <DischargeReport filters={filters} />
    </Container>
  );
}