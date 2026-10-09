import React, { useState } from "react";
import styled from "styled-components";
import {
  Stethoscope,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  UserPlus,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const ReferenceDoctorForm = ({ closeModal, setReferredBy, fetchReferenceDoctors, areaOptions = [] }) => {
  const [formData, setFormData] = useState({
    doctor: "",
    qualification: "",
    mobile1: "",
    area: "",
    clinic_name: "",
    email: "",
    clinic_address: ["", "", ""],
    clinic_phone: "",
  });

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "doctor" && nameError) {
      setNameError(false);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMobileChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      mobile1: val,
    }));
  };

  const handleAddressChange = (e, index) => {
    const newAddress = [...formData.clinic_address];
    newAddress[index] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      clinic_address: newAddress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.doctor || !formData.doctor.trim()) {
      setNameError(true);
      toast.error("Please enter the Doctor's name.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest(`${Hmsbaseurl}add-reference-doctor/`, "POST", formData);
      if (result.success) {
        toast.success(`Dr. ${formData.doctor.trim()} added successfully!`);
        if (typeof setReferredBy === "function") {
          setReferredBy(formData.doctor.trim());
        }
        if (typeof fetchReferenceDoctors === "function") {
          fetchReferenceDoctors();
        }
        closeModal();
      } else {
        toast.error(result.error || "Failed to save reference doctor.");
      }
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast.error("An error occurred while saving the reference doctor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClick={closeModal}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <HeaderLeft>
            <HeaderIconBadge>
              <Stethoscope size={20} color="#ffffff" />
            </HeaderIconBadge>
            <div>
              <ModalTitle>Add Reference Doctor</ModalTitle>
              <ModalSubtitle>Register an external consulting doctor or clinic for referrals</ModalSubtitle>
            </div>
          </HeaderLeft>
          <CloseButton onClick={closeModal} type="button" title="Close">
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        {/* Form Body */}
        <FormContent onSubmit={handleSubmit}>
          {/* Section 1: Doctor Profile */}
          <SectionCard>
            <SectionHeader>
              <SectionIconBadge color="#0f766e">
                <UserPlus size={14} />
              </SectionIconBadge>
              <SectionTitle>Doctor Details</SectionTitle>
            </SectionHeader>

            <FormGrid columns={2}>
              <FormGroup>
                <Label htmlFor="doctorName">
                  Doctor Name <ReqAsterisk>*</ReqAsterisk>
                </Label>
                <Input
                  id="doctorName"
                  type="text"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  $hasError={nameError}
                  autoFocus
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="qualification">
                  <Award size={13} style={{ marginRight: 4, color: "#64748b" }} />
                  Qualification
                </Label>
                <Input
                  id="qualification"
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD (General Medicine)"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="mobile1">
                  <Phone size={13} style={{ marginRight: 4, color: "#64748b" }} />
                  Mobile Number
                </Label>
                <PhoneInputWrapper>
                  <CountryCodePrefix>+91</CountryCodePrefix>
                  <InnerPhoneInput
                    id="mobile1"
                    type="text"
                    name="mobile1"
                    value={formData.mobile1}
                    onChange={handleMobileChange}
                    placeholder="10 digit mobile"
                    maxLength={10}
                  />
                </PhoneInputWrapper>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">
                  <Mail size={13} style={{ marginRight: 4, color: "#64748b" }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. doctor@gmail.com"
                />
              </FormGroup>
            </FormGrid>
          </SectionCard>

          {/* Section 2: Clinic & Location */}
          <SectionCard>
            <SectionHeader>
              <SectionIconBadge color="#0369a1">
                <Building2 size={14} />
              </SectionIconBadge>
              <SectionTitle>Clinic / Hospital Info</SectionTitle>
            </SectionHeader>

            <FormGrid columns={2}>
              <FormGroup>
                <Label htmlFor="clinic_name">Clinic / Hospital Name</Label>
                <Input
                  id="clinic_name"
                  type="text"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Health Clinic"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="clinic_phone">
                  <Phone size={13} style={{ marginRight: 4, color: "#64748b" }} />
                  Clinic Phone / Landline
                </Label>
                <Input
                  id="clinic_phone"
                  type="text"
                  name="clinic_phone"
                  value={formData.clinic_phone}
                  onChange={handleChange}
                  placeholder="e.g. 044-24567890"
                />
              </FormGroup>

              <FormGroup className="span-two">
                <Label htmlFor="area">
                  <MapPin size={13} style={{ marginRight: 4, color: "#64748b" }} />
                  Area / Locality
                </Label>
                <Input
                  id="area"
                  list="ref-doctor-area-options"
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Anna Nagar West"
                />
                {areaOptions && areaOptions.length > 0 && (
                  <datalist id="ref-doctor-area-options">
                    {areaOptions.map((areaName, idx) => (
                      <option key={idx} value={areaName} />
                    ))}
                  </datalist>
                )}
              </FormGroup>
            </FormGrid>
          </SectionCard>

          {/* Section 3: Clinic Address */}
          <SectionCard>
            <SectionHeader>
              <SectionIconBadge color="#d97706">
                <MapPin size={14} />
              </SectionIconBadge>
              <SectionTitle>Clinic Address</SectionTitle>
            </SectionHeader>

            <FormGrid columns={3}>
              <FormGroup>
                <Label>Street / Door No</Label>
                <Input
                  type="text"
                  value={formData.clinic_address[0] || ""}
                  onChange={(e) => handleAddressChange(e, 0)}
                  placeholder="No. 45, 1st Cross St"
                />
              </FormGroup>
              <FormGroup>
                <Label>Landmark / Locality</Label>
                <Input
                  type="text"
                  value={formData.clinic_address[1] || ""}
                  onChange={(e) => handleAddressChange(e, 1)}
                  placeholder="Near Post Office"
                />
              </FormGroup>
              <FormGroup>
                <Label>City / Pincode</Label>
                <Input
                  type="text"
                  value={formData.clinic_address[2] || ""}
                  onChange={(e) => handleAddressChange(e, 2)}
                  placeholder="Salem - 636001"
                />
              </FormGroup>
            </FormGrid>
          </SectionCard>

          {/* Footer Actions */}
          <ModalFooter>
            <CancelButton type="button" onClick={closeModal} disabled={saving}>
              Cancel
            </CancelButton>
            <SaveButton type="submit" disabled={saving}>
              <UserPlus size={15} />
              {saving ? "Saving Doctor..." : "Save Reference Doctor"}
            </SaveButton>
          </ModalFooter>
        </FormContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 16px;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  animation: slideUp 0.18s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(12px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIconBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.2px;
`;

const ModalSubtitle = styled.p`
  font-size: 11px;
  color: #ccfbf1;
  margin: 2px 0 0 0;
  font-weight: 400;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
`;

const FormContent = styled.form`
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

const SectionIconBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 5px;
  background: ${(props) => `${props.color}15`};
  color: ${(props) => props.color || "#0f766e"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns || 2}, 1fr);
  gap: 12px;

  .span-two {
    grid-column: span 2;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    .span-two {
      grid-column: span 1;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
`;

const ReqAsterisk = styled.span`
  color: #ef4444;
  font-weight: 700;
  margin-left: 3px;
  font-size: 13px;
`;

const Input = styled.input`
  height: 34px;
  padding: 0 10px;
  border: 1px solid ${(props) => (props.$hasError ? "#ef4444" : "#cbd5e1")};
  background-color: ${(props) => (props.$hasError ? "#fef2f2" : "#ffffff")};
  border-radius: 6px;
  font-size: 12px;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &::placeholder {
    color: #94a3b8;
    font-size: 12px;
  }

  &:focus {
    border-color: ${(props) => (props.$hasError ? "#ef4444" : "#004d40")};
    box-shadow: ${(props) =>
      props.$hasError
        ? "0 0 0 2px rgba(239, 68, 68, 0.25)"
        : "0 0 0 2px rgba(0, 77, 64, 0.15)"};
    background-color: #ffffff;
  }
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 6px;
  height: 34px;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: #004d40;
    box-shadow: 0 0 0 2px rgba(0, 77, 64, 0.15);
  }
`;

const CountryCodePrefix = styled.span`
  background-color: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: 1px solid #cbd5e1;
  user-select: none;
`;

const InnerPhoneInput = styled.input`
  height: 100%;
  padding: 0 10px;
  border: none;
  outline: none;
  font-size: 12px;
  color: #0f172a;
  flex: 1;

  &::placeholder {
    color: #94a3b8;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled.button`
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0 16px;
  height: 36px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
  color: white;
  border: none;
  padding: 0 18px;
  height: 36px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  box-shadow: 0 2px 4px rgba(0, 77, 64, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background: linear-gradient(135deg, #00382e 0%, #005046 100%);
    box-shadow: 0 4px 6px rgba(0, 77, 64, 0.25);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default ReferenceDoctorForm;
