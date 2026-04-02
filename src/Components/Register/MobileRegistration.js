import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f8fafc;
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  
  * {
    box-sizing: border-box;
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  padding-bottom: env(safe-area-inset-bottom, 16px);
  
  @media (max-width: 480px) {
    padding: 12px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
  }
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 480px) {
    border-radius: 16px;
    max-width: 100%;
  }
`;

const Header = styled.div`
  background: #0f172a;
  padding: 24px 20px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 480px) {
    padding: 20px 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }
`;

const CompanyName = styled.h1`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 16px;
    gap: 6px;
  }
`;

const PageTitle = styled.h2`
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const Form = styled.form`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  
  @media (max-width: 480px) {
    padding: 20px 16px;
    gap: 16px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 6px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  @media (max-width: 480px) {
    gap: 5px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: ${props => props.cols || '1fr 1fr'};
  gap: 16px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-left: 1px;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 11.5px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s ease;
  background: #f8fafc;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 480px) {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 16px 16px;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  line-height: normal;
  color: #1e293b;
  background-color: #f8fafc;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 18px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 16px 44px 16px 16px;
    background-size: 20px;
    background-position: right 14px center;
  }
  
  &::-ms-expand {
    display: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  background: #f8fafc;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    min-height: 90px;
    padding: 16px 16px;
  }
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 16px 24px;
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  width: 100%;
  letter-spacing: 0.3px;
  
  &:hover:not(:disabled) {
    background: #0d9488;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 480px) {
    padding: 18px 24px;
    font-size: 16px;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  gap: 20px;
  
  @media (max-width: 480px) {
    padding: 48px 20px;
    gap: 16px;
  }
`;

const SuccessTitle = styled.h2`
  color: #166534;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const SuccessText = styled.p`
  color: #475569;
  line-height: 1.6;
  margin: 0;
  font-size: 15px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 20px;
  border-radius: 12px;
  margin: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    margin: 16px 12px;
    padding: 16px;
    font-size: 13px;
  }
`;

const SuccessIcon = styled.div`
  background: #dcfce7;
  padding: 20px;
  border-radius: 50%;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 480px) {
    padding: 18px;
    width: 72px;
    height: 72px;
  }
`;

const MobileRegistration = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    mobilePhone: "",
    emergencyContact: "",
    email: "",
    dob: "",
    gender: "",
    permanentAddress: "",
    city: "",
    zipcode: "",
    state: "",
    bloodGroup: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.salutation) {
      toast.error("Please select a salutation");
      return false;
    }
    if (!formData.firstName.trim()) {
      toast.error("First Name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last Name is required");
      return false;
    }
    if (!formData.dob) {
      toast.error("Date of Birth is required");
      return false;
    }
    if (!formData.gender) {
      toast.error("Gender is required");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.mobilePhone.trim()) {
      toast.error("Mobile Number is required");
      return false;
    }
    if (!phoneRegex.test(formData.mobilePhone)) {
      toast.error("Please enter a valid 10-digit Mobile Number");
      return false;
    }

    if (!formData.emergencyContact.trim()) {
      toast.error("Emergency Contact is required");
      return false;
    }
    if (!phoneRegex.test(formData.emergencyContact)) {
      toast.error("Please enter a valid 10-digit Emergency Contact Number");
      return false;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid Email Address");
        return false;
      }
    }

    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }

    if (!formData.zipcode.trim()) {
      toast.error("Postcode is required");
      return false;
    }
    if (!/^[0-9]{6}$/.test(formData.zipcode)) {
      toast.error("Please enter a valid 6-digit Postcode");
      return false;
    }

    if (!formData.permanentAddress.trim()) {
      toast.error("Address is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${Hmsbaseurl}submit-qr-registration/`, {
        session_id: sessionId || "static",
        data: formData
      });
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    } catch (error) {
      console.error("Error submitting form", error);
      toast.error("Submission failed. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // If no session ID is found in the URL, the backend will generate a new registration entry

  if (submitted) {
    return (
      <PageWrapper>
        <GlobalStyle />
        <Card>
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle size={48} strokeWidth={3} />
            </SuccessIcon>
            <SuccessTitle>Registration Received!</SuccessTitle>
            <SuccessText>
              Your details have been successfully sent to the reception desk.
              <br /><br />
              Please highlight your name to the staff to complete the process.
            </SuccessText>
          </SuccessContainer>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <GlobalStyle />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
        style={{ width: '90vw', maxWidth: '480px' }}
      />
      <Card>
        <Header>
          <CompanyName>
            <Building2 size={24} />
            Shanmuga Hospital Limited
          </CompanyName>
          <PageTitle>Mobile Registration</PageTitle>
        </Header>

        <Form onSubmit={handleSubmit} noValidate>
          <SectionTitle>Personal Details</SectionTitle>

          <FormGroup>
            <Label>Salutation *</Label>
            <SelectWrapper>
              <Select name="salutation" value={formData.salutation} onChange={handleChange} required>
                <option value="">Select Salutation</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Baby">Baby</option>
                <option value="Master">Master</option>
              </Select>
            </SelectWrapper>
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>First Name *</Label>
              <InputWrapper>
                <Input
                  name="firstName"
                  placeholder="Given Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Last Name *</Label>
              <InputWrapper>
                <Input
                  name="lastName"
                  placeholder="Surname"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </FormGroup>
          </Row>

          <Row cols="1.2fr 0.8fr">
            <FormGroup>
              <Label>Date of Birth *</Label>
              <InputWrapper>
                <Input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Gender *</Label>
              <SelectWrapper>
                <Select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </SelectWrapper>
            </FormGroup>
          </Row>

          <SectionTitle>Contact Information</SectionTitle>

          <FormGroup>
            <Label>Mobile Number *</Label>
            <InputWrapper>
              <Input
                type="tel"
                name="mobilePhone"
                placeholder="10-digit Mobile Number"
                value={formData.mobilePhone}
                onChange={handleChange}
                required
                maxLength="10"
                inputMode="numeric"
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label>Emergency Contact *</Label>
            <InputWrapper>
              <Input
                type="tel"
                name="emergencyContact"
                placeholder="Emergency Contact Number"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                maxLength="10"
                inputMode="numeric"
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label>Email (Optional)</Label>
            <InputWrapper>
              <Input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                inputMode="email"
              />
            </InputWrapper>
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>City *</Label>
              <InputWrapper>
                <Input name="city" placeholder="Current City" value={formData.city} onChange={handleChange} required />
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Postcode *</Label>
              <InputWrapper>
                <Input
                  type="text"
                  name="zipcode"
                  placeholder="6-digit Zip"
                  value={formData.zipcode}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  inputMode="numeric"
                />
              </InputWrapper>
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>Blood Group</Label>
            <SelectWrapper>
              <Select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </Select>
            </SelectWrapper>
          </FormGroup>

          <FormGroup>
            <Label>Full Address *</Label>
            <InputWrapper>
              <TextArea
                name="permanentAddress"
                placeholder="House No, Street, Landmark..."
                value={formData.permanentAddress}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Submitting Details..." : "Submit Registration"}
          </SubmitButton>
        </Form>
      </Card>
    </PageWrapper>
  );
};

export default MobileRegistration;
