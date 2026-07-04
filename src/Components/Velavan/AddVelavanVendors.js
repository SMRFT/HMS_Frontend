import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { Container, Button, Label, Input, Select } from "../GlobalStyles";
import styled from "styled-components";
import { colors } from "../GlobalStyles";

const MaxWidthContainer = styled.div`
  width: 100%;
  max-width: 1100px;
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

// ── Mini Modal overlay ────────────────────────────────────────────────────────
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
  width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

const EMPTY_VENDOR = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  contactPerson: "",
  phone: "",
  email: "",
  kgstTinNumber: "",
  msme: "",
  pan: "",
  gstin: "",
  payment: "",
  tdsPercent: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared form logic
// ─────────────────────────────────────────────────────────────────────────────
const VendorForm = ({ onSuccess, onCancel, isModal = false }) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState(EMPTY_VENDOR);
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── States / Cities (India) ──────────────────────────────────────────────
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "India" }),
          },
        );
        const data = await res.json();
        setStates(data.data.states);
      } catch {
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = async (e) => {
    const stateName = e.target.value;
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, state: stateName, city: "" }));
    setCities([]);
    if (!stateName) return;
    setLoadingCities(true);
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: "India", state: stateName }),
        },
      );
      const data = await res.json();
      setCities(data.data || []);
    } catch {
      toast.error("Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = (e) => {
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const required = { name: "Vendor Name", gstin: "GSTIN" };
    const missing = Object.entries(required)
      .filter(([field]) => !formData[field] || formData[field].trim() === "")
      .map(([_, label]) => label);

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    try {
      const result = await apiRequest(
        `${HMSURL}velavan_create_vendor/`,
        "POST",
        formData,
      );

      if (result.success) {
        toast.success("Vendor added successfully!");
        setFormData(EMPTY_VENDOR); // reset for next entry
        setCities([]);
        if (onSuccess) onSuccess(result.data);
      } else {
        setErrorMsg(result.error || result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <FormGrid>
        {/* ── Basic Info ── (unchanged) */}
        <SectionLabel>Basic Information</SectionLabel>

        <FormGroup style={{ gridColumn: "span 2" }}>
          <Label>
            Vendor Name <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter vendor name"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            GSTIN <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleInputChange}
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </FormGroup>

        <FormGroup>
          <Label>PAN</Label>
          <Input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleInputChange}
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </FormGroup>

        <FormGroup>
          <Label>MSME</Label>
          <Input
            type="text"
            name="msme"
            value={formData.msme}
            onChange={handleInputChange}
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </FormGroup>

        <FormGroup>
          <Label>KGST / TIN Number</Label>
          <Input
            type="text"
            name="kgstTinNumber"
            value={formData.kgstTinNumber}
            onChange={handleInputChange}
            placeholder="Enter KGST/TIN"
          />
        </FormGroup>

        <FormGroup>
          <Label>Payment Terms</Label>
          <Select
            name="payment"
            value={formData.payment}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option>CHEQUE</option>
            <option>CASH</option>
            <option>NEFT</option>
            <option>RTGS</option>
            <option>UPI</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>TDS %</Label>
          <Input
            type="number"
            step="0.01"
            name="tdsPercent"
            value={formData.tdsPercent}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </FormGroup>

        {/* ── Address ── */}
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
          <Label>State</Label>
          <Select
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            disabled={loadingStates}
          >
            <option value="">
              {loadingStates ? "Loading states..." : "Select State"}
            </option>
            {states.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>City</Label>
          <Select
            name="city"
            value={formData.city}
            onChange={handleCityChange}
            disabled={!formData.state || loadingCities}
          >
            <option value="">
              {loadingCities ? "Loading cities..." : "Select City"}
            </option>
            {cities.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Pincode</Label>
          <Input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="Pincode"
          />
        </FormGroup>

        {/* ── Contact ── (unchanged) */}
        <SectionLabel>Contact Details</SectionLabel>

        <FormGroup>
          <Label>Contact Person</Label>
          <Input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            placeholder="Contact person name"
          />
        </FormGroup>

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
          <Save size={16} /> Save Vendor
        </PrimaryButton>
      </ActionSection>
    </>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// Mini Modal — used from Invoice.js via:
// <AddVendorMiniModal onClose={...} onSuccess={...} />
// ─────────────────────────────────────────────────────────────────────────────
export const AddVendorMiniModal = ({ onClose, onSuccess }) => (
  <MiniOverlay onClick={onClose}>
    <MiniBox onClick={(e) => e.stopPropagation()}>
      <MiniHead>
        <MiniTitle>Add New Vendor</MiniTitle>
        <CloseBtn onClick={onClose}>
          <X size={18} />
        </CloseBtn>
      </MiniHead>
      <MiniBody>
        <VendorForm
          isModal
          onSuccess={(newVendor) => {
            if (onSuccess) onSuccess(newVendor); // refresh vendor list in parent
            // stay open for next entry
          }}
          onCancel={onClose}
        />
      </MiniBody>
    </MiniBox>
  </MiniOverlay>
);

// ─────────────────────────────────────────────────────────────────────────────
// Full page — used when navigating to /AddVelavanVendors directly
// ─────────────────────────────────────────────────────────────────────────────
const AddVelavanVendors = () => {
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
          <Title>Add New Vendor</Title>
        </Header>
        <Card>
          <VendorForm
            onSuccess={() => navigate(-1)}
            onCancel={() => navigate(-1)}
          />
        </Card>
      </MaxWidthContainer>
    </Container>
  );
};

export default AddVelavanVendors;
