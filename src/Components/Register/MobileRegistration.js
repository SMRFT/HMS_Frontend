import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Building2, User, Phone, Mail, MapPin, Calendar, Droplet } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import smrftLogo from '../Images/smrft_logo.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #0d9488;
    --primary-dark: #0f766e;
    --primary-light: #ccfbf1;
    --secondary: #0f172a;
    --bg-gray: #f8fafc;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --border: #e2e8f0;
  }

  body {
    background-color: var(--bg-gray);
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
  justify-content: center;
  padding: 24px 16px;
  background: radial-gradient(circle at top right, #f0fdfa, transparent),
              radial-gradient(circle at bottom left, #f1f5f9, transparent);
  
  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  border: 1px solid var(--border);
  position: relative;
  animation: ${scaleIn} 0.5s ease-out;
  
  @media (max-width: 480px) {
    border-radius: 20px;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, var(--secondary) 0%, #1e293b 100%);
  padding: 32px 24px;
  text-align: center;
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.5), transparent);
  }
`;

const LogoWrapper = styled.div`
  background: white;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  padding: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const CompanyName = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
  color: white;
`;

const PageTitle = styled.h2`
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Form = styled.form`
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    gap: 20px;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: ${props => props.cols || '1fr 1fr'};
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  
  span {
    color: #ef4444;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-size: 15px;
  color: var(--text-main);
  background: #fdfdfd;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 4px var(--primary-light);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 480px) {
    padding: 16px;
    font-size: 16px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-size: 15px;
  color: var(--text-main);
  background: #fdfdfd;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    background-color: white;
    box-shadow: 0 0 0 4px var(--primary-light);
  }

  @media (max-width: 480px) {
    padding: 16px;
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-size: 15px;
  color: var(--text-main);
  background: #fdfdfd;
  min-height: 100px;
  resize: none;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 4px var(--primary-light);
  }

  @media (max-width: 480px) {
    padding: 16px;
    font-size: 16px;
  }
`;

const SubmitButton = styled.button`
  margin-top: 12px;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(13, 148, 136, 0.4);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 32px;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SuccessIcon = styled.div`
  background: #f0fdf4;
  width: 100px;
  height: 100px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.1);
  animation: ${float} 3s ease-in-out infinite;
`;

const SuccessTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #064e3b;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
`;

const SuccessText = styled.p`
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
`;

const MobileRegistration = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const initialCustomerType = searchParams.get('customerType') || "General";
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
    bloodGroup: "",
    occupation: "",
    annualIncome: "",
    customerType: initialCustomerType
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
            <SuccessTitle>Success!</SuccessTitle>
            <SuccessText>
              Your registration has been received at the reception.
              Please visit the counter to complete your check-in.
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
          <LogoWrapper>
            <img src={smrftLogo} alt="SMRFT Logo" />
          </LogoWrapper>
          <CompanyName>Shanmuga Hospital Limited</CompanyName>
          <PageTitle>Mobile Registration</PageTitle>
        </Header>

        <Form onSubmit={handleSubmit} noValidate>
          <SectionTitle>
            <h3><User size={18} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: '8px' }} /> Personal Details</h3>
          </SectionTitle>

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

          <Row>
            <FormGroup>
              <Label>Occupation (Optional)</Label>
              <SelectWrapper>
                <Select
                  name="occupation"
                  value={formData.occupation || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Occupation</option>
                  <option value="Government / Public Sector">Government / Public Sector</option>
                  <option value="Private Sector">Private Sector</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Professional">Professional (Doctor, Engineer, Lawyer, etc.)</option>
                  <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                  <option value="Daily Wage / Laborer">Daily Wage / Laborer</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired">Retired</option>
                  <option value="Others">Others</option>
                </Select>
              </SelectWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Yearly Income (Optional)</Label>
              <SelectWrapper>
                <Select
                  name="annualIncome"
                  value={formData.annualIncome || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Yearly Income</option>
                  <option value="Below ₹ 1 Lakh">Below ₹ 1 Lakh</option>
                  <option value="₹ 1 Lakh - ₹ 3 Lakhs">₹ 1 Lakh - ₹ 3 Lakhs</option>
                  <option value="₹ 3 Lakhs - ₹ 5 Lakhs">₹ 3 Lakhs - ₹ 5 Lakhs</option>
                  <option value="₹ 5 Lakhs - ₹ 10 Lakhs">₹ 5 Lakhs - ₹ 10 Lakhs</option>
                  <option value="Above ₹ 10 Lakhs">Above ₹ 10 Lakhs</option>
                </Select>
              </SelectWrapper>
            </FormGroup>
          </Row>

          <SectionTitle>
            <h3><Phone size={18} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: '8px' }} /> Contact Information</h3>
          </SectionTitle>

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
