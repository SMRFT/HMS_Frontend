import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { Container, Button, Label, Input, Select } from "../GlobalStyles";
import styled from "styled-components";
import { colors } from "../GlobalStyles";

const MaxWidthContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
`;
const Title = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${colors.textMain};
`;
const Header = styled.div`
  margin-bottom: 20px;
`;
const Card = styled.div`
  background: ${colors.surface};
  border-radius: 10px;
  border: 1px solid ${colors.border};
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px 16px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Required = styled.span`
  color: ${colors.danger};
  margin-left: 2px;
`;
const ActionSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
`;
const SectionLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 10px 0 6px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
  grid-column: 1 / -1;
`;
const PrimaryButton = styled(Button)`
  background: ${colors.primary};
  &:hover {
    background: ${colors.primaryDark};
  }
`;
const SecondaryButton = styled(Button)`
  background: ${colors.textMuted};
  &:hover {
    background: #475569;
  }
`;
const MiniOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;
const MiniBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 720px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;
const MiniHead = styled.div`
  background: ${colors.tabBg};
  padding: 12px 16px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;
const MiniTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${colors.primary};
`;
const MiniBody = styled.div`
  padding: 20px 16px;
  overflow-y: auto;
  flex: 1;
`;
const MiniFooter = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f8fafc;
  flex-shrink: 0;
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  &:hover {
    background: ${colors.border};
    color: ${colors.textMain};
  }
`;

const EMPTY_CUSTOMER = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  gstin: "",
  customerType: "",
  companyName: "",
};

const CustomerForm = ({ onSuccess, onCancel, isModal = false }) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState(EMPTY_CUSTOMER);
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error("Customer Name is required");
      return;
    }
    try {
      const result = await apiRequest(
        `${HMSURL}velavan_create_customer/`,
        "POST",
        formData,
      );
      if (result.success) {
        toast.success("Customer added successfully!");
        setFormData(EMPTY_CUSTOMER);
        if (onSuccess) onSuccess(result.data);
      } else {
        setErrorMsg(result.error || result.message || "Unknown error occurred");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <FormGrid>
        <SectionLabel>Basic Information</SectionLabel>
        <FormGroup style={{ gridColumn: "span 2" }}>
          <Label>
            Customer Name <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter customer name"
          />
        </FormGroup>
        <FormGroup>
          <Label>Customer Type</Label>
          <Input
            type="text"
            name="customerType"
            value={formData.customerType}
            onChange={handleInputChange}
            placeholder="e.g. General, Insurance, Corporate"
          />
        </FormGroup>
        <FormGroup>
          <Label>Company Name</Label>
          <Input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="If billed to a company/insurer"
          />
        </FormGroup>
        <FormGroup>
          <Label>GSTIN</Label>
          <Input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleInputChange}
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </FormGroup>

        <SectionLabel>Address</SectionLabel>
        <FormGroup style={{ gridColumn: "span 2" }}>
          <Label>Address Line 1</Label>
          <Input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleInputChange}
            placeholder="Street / Building"
          />
        </FormGroup>
        <FormGroup style={{ gridColumn: "span 2" }}>
          <Label>Address Line 2</Label>
          <Input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleInputChange}
            placeholder="Area / Landmark"
          />
        </FormGroup>
        <FormGroup>
          <Label>City</Label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>State</Label>
          <Input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Pincode</Label>
          <Input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
          />
        </FormGroup>

        <SectionLabel>Contact Details</SectionLabel>
        <FormGroup>
          <Label>Phone</Label>
          <Input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone number"
          />
        </FormGroup>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
          />
        </FormGroup>
      </FormGrid>

      {errorMsg && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            borderRadius: "8px",
            padding: "10px 16px",
            marginTop: "12px",
            fontSize: "0.85rem",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      <ActionSection style={{ marginTop: 16 }}>
        <SecondaryButton onClick={onCancel}>
          <X size={16} /> {isModal ? "Close" : "Cancel"}
        </SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>
          <Save size={16} /> Save Customer
        </PrimaryButton>
      </ActionSection>
    </>
  );
};

export const AddCustomerMiniModal = ({ onClose, onSuccess }) => (
  <MiniOverlay onClick={onClose}>
    <MiniBox onClick={(e) => e.stopPropagation()}>
      <MiniHead>
        <MiniTitle>Add New Customer</MiniTitle>
        <CloseBtn onClick={onClose}>
          <X size={18} />
        </CloseBtn>
      </MiniHead>
      <MiniBody>
        <CustomerForm
          isModal
          onSuccess={(newCustomer) => {
            if (onSuccess) onSuccess(newCustomer);
          }}
          onCancel={onClose}
        />
      </MiniBody>
    </MiniBox>
  </MiniOverlay>
);

const AddVelavanCustomers = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <MaxWidthContainer>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <SecondaryButton
            onClick={() => navigate(-1)}
            style={{ marginRight: "16px", width: "auto" }}
          >
            <ArrowLeft size={16} /> Back
          </SecondaryButton>
        </div>
        <Header>
          <Title>Add New Customer</Title>
        </Header>
        <Card>
          <CustomerForm
            onSuccess={() => navigate(-1)}
            onCancel={() => navigate(-1)}
          />
        </Card>
      </MaxWidthContainer>
    </Container>
  );
};

export default AddVelavanCustomers;
