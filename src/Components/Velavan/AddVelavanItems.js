import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  Button,
  Label,
  Input,
  Select,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
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

// ── Mini Modal overlay for embedded use ──────────────────────────────────────
const MiniOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
`;

const MiniBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 460px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const MiniHead = styled.div`
  background: ${colors.tabBg};
  padding: 12px 16px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MiniTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${colors.primary};
`;

const MiniBody = styled.div`
  padding: 20px 16px;
`;

const MiniFooter = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f8fafc;
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared form logic extracted so both modes use the same code
// ─────────────────────────────────────────────────────────────────────────────
const ItemForm = ({ onSuccess, onCancel, isModal = false }) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    hsn: "",
    category: "",
  });
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const missingFields = Object.entries({
      itemName: "Item Name",
      hsn: "HSN Code",
      category: "Category",
    })
      .filter(([field]) => !formData[field] || formData[field].trim() === "")
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const result = await apiRequest(
        `${HMSURL}velavan_create_item/`,
        "POST",
        formData,
      );
      if (result.success) {
        toast.success("Item added successfully!");
        setFormData({ itemName: "", hsn: "" }); // reset for next entry
        if (onSuccess) onSuccess(result.data); // pass new item back
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
      <FormGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
        <FormGroup>
          <Label>
            Item Name <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            placeholder="Enter item name"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            HSN <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="hsn"
            value={formData.hsn}
            onChange={handleInputChange}
            placeholder="Enter HSN code"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            Category <Required>*</Required>
          </Label>
          <Select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="">Select category</option>
            <option value="DRUG">DRUG</option>
            <option value="IMPLANT">IMPLANT</option>
          </Select>
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
          <Save size={16} /> Save Item
        </PrimaryButton>
      </ActionSection>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mini Modal — used from Invoice.js via: <AddItemMiniModal onClose={...} onSuccess={...} />
// ─────────────────────────────────────────────────────────────────────────────
export const AddItemMiniModal = ({ onClose, onSuccess }) => (
  <MiniOverlay onClick={onClose}>
    <MiniBox onClick={(e) => e.stopPropagation()}>
      <MiniHead>
        <MiniTitle>Add New Item</MiniTitle>
        <CloseBtn onClick={onClose}>
          <X size={18} />
        </CloseBtn>
      </MiniHead>
      <MiniBody>
        <ItemForm
          isModal
          onSuccess={(newItem) => {
            if (onSuccess) onSuccess(newItem); // refresh items list in parent
            // do NOT close — stay open for next entry
          }}
          onCancel={onClose}
        />
      </MiniBody>
    </MiniBox>
  </MiniOverlay>
);

// ─────────────────────────────────────────────────────────────────────────────
// Full page — used when navigating to /AddVelavanItems directly
// ─────────────────────────────────────────────────────────────────────────────
const AddVelavanItems = () => {
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
          <Title>Add New Item</Title>
        </Header>
        <Card>
          <ItemForm
            onSuccess={() => navigate(-1)}
            onCancel={() => navigate(-1)}
          />
        </Card>
      </MaxWidthContainer>
    </Container>
  );
};

export default AddVelavanItems;
