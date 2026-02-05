import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";

// Page Container
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
  padding: 2rem;
`;

const FormCard = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  &::before {
    content: '📋';
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.125rem;
  margin-bottom: 3rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.938rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '${props => props.icon || "📝"}';
    font-size: 1.125rem;
  }
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f5f5f5' : 'white'};
  color: ${props => props.disabled ? '#999' : '#333'};
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  
  &:hover:not(:disabled) {
    border-color: #00897b;
  }
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  
  &:hover {
    border-color: #00897b;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  
  &:hover {
    border-color: #00897b;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 1rem 3rem;
  border: none;
  border-radius: 12px;
  font-size: 1.063rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  
  &:active {
    transform: translateY(1px);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  flex: 1;
  
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 137, 123, 0.3);
  }
  
  &::before {
    content: '✓';
    font-size: 1.25rem;
    font-weight: bold;
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #78909c 0%, #546e7a 100%);
  color: white;
  flex: 1;
  
  &:hover {
    background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 125, 139, 0.3);
  }
  
  &::before {
    content: '←';
    font-size: 1.25rem;
  }
`;

const InfoSection = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  border-left: 5px solid #00897b;
`;

const InfoTitle = styled.h3`
  color: #00695c;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: 'ℹ️';
    font-size: 1.25rem;
  }
`;

const InfoText = styled.p`
  color: #555;
  font-size: 0.938rem;
  margin: 0;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  border-left: 5px solid #ef5350;
  text-align: center;
`;

const ErrorTitle = styled.h3`
  color: #c62828;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &::before {
    content: '⚠️';
    font-size: 1.25rem;
  }
`;

const ErrorText = styled.p`
  color: #d32f2f;
  font-size: 0.938rem;
  margin: 0;
`;

const XRayReportForm = () => {
  const { uhid, subUhid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // States
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [investBillNo, setInvestBillNo] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [impression, setImpression] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Check if navigation state exists
    if (!location.state) {
      toast.error("No patient data found. Please navigate from the investigations list.");
      navigate(-1);
      return;
    }

    const {
      itemName,
      ipNumber: stateIpNumber,
      investBillNo: stateInvestBillNo,
      salutation,
      firstName,
      middleName,
      lastName,
      age: stateAge,
      gender: stateGender,
      investBillDate,
    } = location.state;

    // Set current time as default
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    setTime(currentTime);

    // Populate form with data from navigation state
    setDate(investBillDate || "");

    const fullName = `${salutation || ''} ${firstName || ''} ${middleName ? middleName + ' ' : ''}${lastName || ''}`.replace(/\s+/g, ' ').trim();
    setPatientName(fullName);

    setIpNumber(stateIpNumber || "");
    setInvestBillNo(stateInvestBillNo || "");
    setAge(stateAge || "");
    setGender(stateGender || "");
    setInvestigation(itemName || "");

    setDataLoaded(true);
  }, [location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const patientId = `${uhid}/${subUhid}`;

    const reportData = {
      date,
      time,
      patientId,
      ipNumber,
      investBillNo,
      investigation,
      impression,
      approve: false,
    };

    const result = await apiRequest(
      `${HMSURL}x_ray-reports/`,
      'POST',
      reportData
    );

    if (result.success) {
      toast.success('X-Ray report submitted successfully! ✓');
      navigate(-1);
    } else {
      toast.error(`Error submitting X-Ray report: ${result.error}`);
      console.error('Error:', result.error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Show error if data wasn't loaded
  if (!dataLoaded) {
    return (
      <PageContainer>
        <FormCard>
          <PageTitle>X-Ray Report Form</PageTitle>
          <ErrorMessage>
            <ErrorTitle>Error Loading Data</ErrorTitle>
            <ErrorText>Unable to load patient information. Please navigate from the investigations list.</ErrorText>
          </ErrorMessage>
          <ButtonContainer>
            <CancelButton type="button" onClick={handleCancel}>
              Go Back
            </CancelButton>
          </ButtonContainer>
        </FormCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormCard>
        <PageTitle>X-Ray Report Form</PageTitle>
        <Subtitle>Complete the form below to submit a X-Ray investigation report</Subtitle>

        <InfoSection>
          <InfoTitle>Patient Information</InfoTitle>
          <InfoText>
            Filling report for <strong>{patientName}</strong> - UHID: <strong>{uhid}/{subUhid}</strong>
          </InfoText>
        </InfoSection>

        <Form onSubmit={handleSubmit}>
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label icon="📅">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label icon="⏰">Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label icon="🆔">UHID</Label>
              <Input
                type="text"
                value={`${uhid}/${subUhid}`}
                disabled
              />
            </FormGroup>

            <FormGroup>
              <Label icon="🏥">IP Number</Label>
              <Input
                type="text"
                value={ipNumber}
                disabled
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label icon="👤">Patient Name</Label>
            <Input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </FormGroup>

          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label icon="🎂">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                min="0"
                max="150"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label icon="⚧">Gender</Label>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label icon="🔬">Type of Investigation</Label>
            <Input
              type="text"
              value={investigation}
              onChange={(e) => setInvestigation(e.target.value)}
              placeholder="Enter investigation type"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label icon="📝">Impression / Findings</Label>
            <TextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter detailed impression and findings..."
              required
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCancel}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit">
              Submit Report
            </SubmitButton>
          </ButtonContainer>
        </Form>
      </FormCard>
    </PageContainer>
  );
};

export default XRayReportForm;