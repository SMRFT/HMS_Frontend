import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  Label,
  Input,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Local Styled Components (page-specific) ──────────────────────────────────

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
    content: "📋";
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
`;

const DateTimeBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border-radius: 14px;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 137, 123, 0.3);
  flex-wrap: wrap;
`;

const DateTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.063rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  .icon {
    font-size: 1.25rem;
  }

  .value {
    font-size: 1.125rem;
    font-family: "Courier New", monospace;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columns || "1fr"};
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

// Extended Label with icon support on top of GlobalStyles Label
const IconLabel = styled(Label)`
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.938rem;
  gap: 0.5rem;

  &::before {
    content: "${(props) => props.icon || "📝"}";
    font-size: 1.125rem;
  }
`;

// Extended Input with disabled styling on top of GlobalStyles Input
const StyledInput = styled(Input)`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  background: ${(props) => (props.disabled ? "#f5f5f5" : "white")};
  color: ${(props) => (props.disabled ? "#888" : "#333")};

  &:hover:not(:disabled) {
    border-color: #00897b;
  }

  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

// Extended TextArea on top of GlobalStyles TextArea
const StyledTextArea = styled(TextArea)`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 150px;

  &:hover {
    border-color: #00897b;
  }

  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const StyledButtonContainer = styled(ButtonContainer)`
  border-top: none;
  padding-top: 0;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BaseActionButton = styled(Button)`
  padding: 1rem 3rem;
  border-radius: 12px;
  font-size: 1.063rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  flex: 1;

  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled(BaseActionButton)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 137, 123, 0.3);
  }

  &::before {
    content: "✓";
    font-size: 1.25rem;
    font-weight: bold;
  }
`;

const CancelButton = styled(BaseActionButton)`
  background: linear-gradient(135deg, #78909c 0%, #546e7a 100%);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 125, 139, 0.3);
  }

  &::before {
    content: "←";
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
    content: "ℹ️";
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
    content: "⚠️";
    font-size: 1.25rem;
  }
`;

const ErrorText = styled.p`
  color: #d32f2f;
  font-size: 0.938rem;
  margin: 0;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDisplayDate = (date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDisplayTime = (date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

// ─── Component ────────────────────────────────────────────────────────────────

const CTReportForm = () => {
  const { uhid, subUhid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [now, setNow] = useState(new Date());
  const timerRef = useRef(null);

  const [investBillNo, setInvestBillNo] = useState("");
  const [investBillDate, setInvestBillDate] = useState("");
  const [impression, setImpression] = useState("");
  const [billTypeNo, setBillTypeNo] = useState("");
  const [patientName, setPatientName] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [itemName, setItemName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!location.state) {
      toast.error(
        "No patient data found. Please navigate from the investigations list.",
      );
      navigate(-1);
      return;
    }

    const {
      itemName: stateItemName,
      ipNumber: stateIpNumber,
      investBillNo: stateInvestBillNo,
      billTypeNo: stateBillTypeNo,
      salutation,
      firstName,
      middleName,
      lastName,
      age: stateAge,
      gender: stateGender,
      investBillDate: stateInvestBillDate,
    } = location.state;

    const fullName =
      `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""}${lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();

    setPatientName(fullName);
    setIpNumber(stateIpNumber || "");
    setInvestBillNo(stateInvestBillNo || "");
    setBillTypeNo(stateBillTypeNo || "");
    setInvestBillDate(stateInvestBillDate || "");
    setAge(stateAge || "");
    setGender(stateGender || "");
    setItemName(stateItemName || "");
    setDataLoaded(true);
  }, [location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const reportData = {
      investBillDate,
      investBillNo,
      impression,
      billTypeNo,
      itemName,
    };

    const result = await apiRequest(
      `${HMSURL}scan-reports/`,
      "POST",
      reportData,
    );

    if (result.success) {
      toast.success("CT report submitted successfully! ✓");
      navigate(-1);
    } else {
      toast.error(result.error || "Error submitting CT report");
      console.error("Error:", result.error);
    }
  };

  const handleCancel = () => navigate(-1);

  if (!dataLoaded) {
    return (
      <PageWrapper>
        <Container>
          <FormCard>
            <PageTitle>CT Report Form</PageTitle>
            <ErrorMessage>
              <ErrorTitle>Error Loading Data</ErrorTitle>
              <ErrorText>
                Unable to load patient information. Please navigate from the
                investigations list.
              </ErrorText>
            </ErrorMessage>
            <StyledButtonContainer>
              <CancelButton type="button" onClick={handleCancel}>
                Go Back
              </CancelButton>
            </StyledButtonContainer>
          </FormCard>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <FormCard>
          <PageTitle>CT Report Form</PageTitle>
          <Subtitle>
            Complete the form below to submit a CT investigation report
          </Subtitle>

          <DateTimeBanner>
            <DateTimeItem>
              <span className="icon">📅</span>
              <span className="value">{formatDisplayDate(now)}</span>
            </DateTimeItem>
            <DateTimeItem>
              <span className="icon">⏱</span>
              <span className="value">{formatDisplayTime(now)}</span>
            </DateTimeItem>
          </DateTimeBanner>

          <InfoSection>
            <InfoTitle>Patient Information</InfoTitle>
            <InfoText>
              Filling report for <strong>{patientName}</strong> — UHID:{" "}
              <strong>
                {uhid}/{subUhid}
              </strong>{" "}
              | Bill No: <strong>{investBillNo}</strong>
              {itemName && (
                <>
                  {" "}
                  | Item: <strong>{itemName}</strong>
                </>
              )}
            </InfoText>
          </InfoSection>

          <Form onSubmit={handleSubmit}>
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <IconLabel icon="🆔">UHID</IconLabel>
                <StyledInput
                  type="text"
                  value={`${uhid}/${subUhid}`}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <IconLabel icon="🏥">IP Number</IconLabel>
                <StyledInput type="text" value={ipNumber} disabled />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <IconLabel icon="👤">Patient Name</IconLabel>
              <StyledInput type="text" value={patientName} disabled />
            </FormGroup>

            <FormRow columns="1fr 1fr">
              <FormGroup>
                <IconLabel icon="🎂">Age</IconLabel>
                <StyledInput type="text" value={age || "N/A"} disabled />
              </FormGroup>
              <FormGroup>
                <IconLabel icon="⚧">Gender</IconLabel>
                <StyledInput type="text" value={gender || "N/A"} disabled />
              </FormGroup>
            </FormRow>

            <FormRow columns="1fr 1fr">
              <FormGroup>
                <IconLabel icon="🧾">Bill No</IconLabel>
                <StyledInput type="text" value={investBillNo} disabled />
              </FormGroup>
              <FormGroup>
                <IconLabel icon="🔬">Item</IconLabel>
                <StyledInput type="text" value={itemName} disabled />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <IconLabel icon="📝">Impression / Findings</IconLabel>
              <StyledTextArea
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                placeholder="Enter detailed impression and findings..."
                required
              />
            </FormGroup>

            <StyledButtonContainer>
              <CancelButton type="button" onClick={handleCancel}>
                Cancel
              </CancelButton>
              <SubmitButton type="submit">Submit Report</SubmitButton>
            </StyledButtonContainer>
          </Form>
        </FormCard>
      </Container>
    </PageWrapper>
  );
};

export default CTReportForm;
