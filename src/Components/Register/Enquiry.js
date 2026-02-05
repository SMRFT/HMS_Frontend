import React, { useState } from "react";
import axios from "axios";
import styled from 'styled-components';
import {
  PageWrapper,
  Title,
  Section,
  FormGrid,
  InputWrapper,
  Label,
  Input,
  PrimaryButton,
  Table,
  Th,
  Td,
  Tr,
  Header
} from '../GlobalStyledComponents';

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
  color: #1e293b;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
  }
`;

const Enquiry = () => {
  const [uhid, setUhid] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [patients, setPatients] = useState([]);

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchPatients = async () => {
    try {
      let query = "";
      if (uhid) {
        query = `uhid=${uhid}`;
      } else if (ipNumber) {
        query = `ip_number=${ipNumber}`;
      } else if (mobile) {
        query = `mobile=${mobile}`;
      }
      const response = await axios.get(`${HMSURL}create/?${query}`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Title>Patient Enquiry</Title>
      </Header>

      <Section>
        <FormGrid>
          <InputWrapper>
            <Label>UHID No</Label>
            <Input type="text" value={uhid} onChange={(e) => setUhid(e.target.value)} placeholder="Enter UHID No" />
          </InputWrapper>
          <InputWrapper>
            <Label>IP Number</Label>
            <Input type="text" value={ipNumber} onChange={(e) => setIpNumber(e.target.value)} placeholder="Enter IP Number" />
          </InputWrapper>
          <InputWrapper>
            <Label>Mobile</Label>
            <Input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter Mobile No" />
          </InputWrapper>
        </FormGrid>
        <ButtonContainer>
          <PrimaryButton onClick={fetchPatients}>Search</PrimaryButton>
        </ButtonContainer>
      </Section>

      <Section>
        <Title style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Patient Details</Title>
        <FormGrid>
          <InputWrapper>
            <Label>Name</Label>
            <Input type="text" placeholder="Enter Name" />
          </InputWrapper>
          <InputWrapper>
            <Label>Guardian</Label>
            <Input type="text" placeholder="Guardian Name" />
          </InputWrapper>
          <InputWrapper>
            <Label>Gender</Label>
            <Select>
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </Select>
          </InputWrapper>
          <InputWrapper>
            <Label>Area</Label>
            <Input type="text" placeholder="Enter Area" />
          </InputWrapper>
          <InputWrapper>
            <Label>Customer Type</Label>
            <Select>
              <option>Select Customer Type</option>
              <option>GENERAL</option>
              <option>INSURANCE</option>
              <option>CORPORATE</option>
              <option>CARD HOLDER</option>
              <option>EMPLOYEE</option>
            </Select>
          </InputWrapper>
          <InputWrapper>
            <Label>Insurance Company</Label>
            <Select>
              <option>Select Insurance Company</option>
              <option>Company A</option>
              <option>Company B</option>
            </Select>
          </InputWrapper>
        </FormGrid>
      </Section>

      <Table>
        <thead>
          <tr>
            <Th>UHID</Th>
            <Th>Name</Th>
            <Th>Gender</Th>
            <Th>Age</Th>
            <Th>Mobile</Th>
            <Th>Address</Th>
            <Th>Customer Type</Th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient, index) => (
              <Tr key={index}>
                <Td>{patient.uhid}</Td>
                <Td>{patient.name}</Td>
                <Td>{patient.gender}</Td>
                <Td>{patient.age}</Td>
                <Td>{patient.mobilePhone}</Td>
                <Td>{patient.area}, {patient.city}, {patient.state}</Td>
                <Td>{patient.customerType}</Td>
              </Tr>
            ))
          ) : (
            <tr>
              <Td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                No records found
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </PageWrapper>
  );
};

export default Enquiry;