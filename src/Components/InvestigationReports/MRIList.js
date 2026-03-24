import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Label,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Page Layout ──────────────────────────────────────────────────────────────

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🔬";
    font-size: 1.3rem;
  }
`;

// ─── Stat Cards ───────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1.1rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 90px;
  background: ${(p) => p.bg || "#f8f8f8"};
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-left: 3px solid ${(p) => p.accent || "#ccc"};
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
`;

const StatIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatCount = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${(p) => p.color || "#333"};
  line-height: 1.1;
`;

const StatLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

// ─── Date Filter Bar ──────────────────────────────────────────────────────────

const FilterContainer = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.1);
  }
`;

const ResetButton = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 0.4rem 1rem;
  font-size: 0.78rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-1px);
  }
`;

// ─── Column Search Row ────────────────────────────────────────────────────────

const SearchInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
  &::placeholder {
    color: #bbb;
    font-style: italic;
  }
`;

const SearchSelect = styled.select`
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
`;

const SearchTh = styled.th`
  padding: 0.4rem 0.5rem 0.6rem;
  background: #f8fffe;
  border-bottom: 2px solid #e0f2f1;
`;

// ─── Icon Action Buttons with CSS Tooltips ────────────────────────────────────

const IconBtn = styled.button`
  position: relative;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    filter 0.15s;
  flex-shrink: 0;
  background: ${(p) => p.bg || "#eee"};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    filter: brightness(1.1);
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }
  &:disabled {
    opacity: 0.28;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: none;
  }

  /* Tooltip bubble */
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.9);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
    letter-spacing: 0.3px;
  }
  /* Tooltip arrow */
  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20, 20, 20, 0.9);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
  }
  &:hover:not(:disabled)::after,
  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-wrap: nowrap;
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  white-space: nowrap;
  ${(props) => {
    if (!props.hasReport)
      return `
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1565c0;
    `;
    if (props.approved)
      return `
      background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
      color: #2e7d32;
    `;
    return `
      background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
      color: #f57f17;
    `;
  }}
`;

const SlotBadge = styled.span`
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  background: linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%);
  color: #4527a0;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  &::before {
    content: "📭";
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.125rem;
    font-weight: 500;
    color: #666;
  }
`;

// ─── Modal Base ───────────────────────────────────────────────────────────────

const StyledModalOverlay = styled(ModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(0, 137, 123, 0.9) 0%,
    rgba(0, 105, 92, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
`;

const StyledModalContent = styled(ModalContainer)`
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: auto;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const StyledModalHeader = styled(ModalHeader)`
  border-bottom: 2px solid #f0f0f0;
  background: transparent;
  padding: 0 0 1rem 0;
  margin-bottom: 2rem;
`;

const ModalIcon = styled.span`
  font-size: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 150px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: #555;
  font-size: 0.938rem;
  flex: 1;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ModalCloseButton = styled(CloseButton)`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.063rem;
  font-weight: 700;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4);
  height: auto;
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 137, 123, 0.5);
    color: white;
  }
`;

const EditModalContent = styled(StyledModalContent)`
  max-width: 600px;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  min-height: 200px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-sizing: border-box;
  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const ModalButtonGroup = styled(ButtonContainer)`
  gap: 1rem;
  margin-top: 2rem;
  border-top: 2px solid #f0f0f0;
  padding-top: 1.5rem;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const SaveButton = styled(ModalCloseButton)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  &:hover {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
`;

const CancelModalButton = styled(ModalCloseButton)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
  }
`;

// ─── Slot Modal Styles ────────────────────────────────────────────────────────

const SlotModalContent = styled(StyledModalContent)`
  max-width: 580px;
`;

const SlotModalOverlay = styled(StyledModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(124, 77, 255, 0.88) 0%,
    rgba(101, 31, 255, 0.88) 100%
  );
`;

const SlotFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SlotLabel = styled.label`
  color: #4527a0;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const SlotInput = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #d1c4e9;
  border-radius: 12px;
  font-size: 1rem;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.15);
  }
`;

const SlotDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 1rem 0 1.5rem 0;
`;

const SlotSectionTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 700;
  color: #7c4dff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ImpressionOptionalNote = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin: -0.75rem 0 1rem 0;
  font-style: italic;
`;

const SlotSaveButton = styled(ModalCloseButton)`
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
  &:hover {
    background: linear-gradient(135deg, #651fff 0%, #6200ea 100%);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.split("T")[0];
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return "";
};

const getToday = () => new Date().toISOString().split("T")[0];

const formatSlotDisplay = (slotDateTime) => {
  if (!slotDateTime) return null;
  try {
    const d = new Date(slotDateTime);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return slotDateTime;
  }
};

// ─── Preview Modal ────────────────────────────────────────────────────────────

const Modal = ({ row, onClose }) => {
  const report = row.report;
  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🏥</ModalIcon>
          <ModalTitle>MRI Report Details</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{row.investBillNo}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{row.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>UHID</InfoLabel>
            <InfoValue>{row.uhid}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>IP Number</InfoLabel>
            <InfoValue>{row.ipNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Age</InfoLabel>
            <InfoValue>{row.age || "N/A"}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>{row.gender || "N/A"}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Slot Date/Time</InfoLabel>
            <InfoValue>
              {report?.slot_DateTime
                ? formatSlotDisplay(report.slot_DateTime)
                : "Not scheduled"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Report Date</InfoLabel>
            <InfoValue>
              {report?.date ? formatDate(report.date) : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Impression</InfoLabel>
            <InfoValue>{report?.impression || "N/A"}</InfoValue>
          </InfoRow>
        </ModalBody>
        <ModalCloseButton onClick={onClose}>Close</ModalCloseButton>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ row, onClose, onSave }) => {
  const [impression, setImpression] = useState(row.report?.impression || "");
  return (
    <StyledModalOverlay onClick={onClose}>
      <EditModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>✏️</ModalIcon>
          <ModalTitle>Edit Impression</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{row.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{row.investBillNo}</InfoValue>
          </InfoRow>
          <div style={{ marginTop: "1.5rem" }}>
            <Label style={{ display: "block", marginBottom: "0.5rem" }}>
              Impression
            </Label>
            <StyledTextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter impression..."
            />
          </div>
        </ModalBody>
        <ModalButtonGroup>
          <SaveButton onClick={() => onSave(impression)}>
            Save Changes
          </SaveButton>
          <CancelModalButton onClick={onClose}>Cancel</CancelModalButton>
        </ModalButtonGroup>
      </EditModalContent>
    </StyledModalOverlay>
  );
};

// ─── Slot Modal ───────────────────────────────────────────────────────────────

const SlotModal = ({ row, onClose, onSaved, HMSURL }) => {
  const hasReport = row.hasReport;

  const initSlotDate = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toISOString().slice(0, 10);
      } catch {}
    }
    return getToday();
  };
  const initSlotTime = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toTimeString().slice(0, 5);
      } catch {}
    }
    return new Date().toTimeString().slice(0, 5);
  };

  const [slotDate, setSlotDate] = useState(initSlotDate);
  const [slotTime, setSlotTime] = useState(initSlotTime);
  const [impression, setImpression] = useState(row.report?.impression || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!slotDate || !slotTime) {
      toast.error("Please select both slot date and time.");
      return;
    }
    const slotDateTime = `${slotDate}T${slotTime}:00`;
    setSaving(true);
    try {
      const encodedBill = encodeURIComponent(row.investBillNo);
      const encodedItem = encodeURIComponent(row.itemName);
      let result;
      if (!hasReport) {
        result = await apiRequest(`${HMSURL}scan-reports/`, "POST", {
          investBillNo: row.investBillNo,
          investBillDate: row.investBillDate,
          billTypeNo: row.billTypeNo || "",
          itemName: row.itemName,
          slot_DateTime: slotDateTime,
          impression: impression || "",
        });
        if (!result.success) {
          toast.error(result.error || "Failed to create report");
          return;
        }
        toast.success("Slot scheduled and report created! ✓");
      } else {
        const patchData = { slot_DateTime: slotDateTime };
        if (impression && impression !== row.report?.impression)
          patchData.impression = impression;
        result = await apiRequest(
          `${HMSURL}scan-reports/slot/${encodedBill}/${encodedItem}/`,
          "PATCH",
          patchData,
        );
        if (!result.success) {
          toast.error(result.error || "Failed to update slot");
          return;
        }
        toast.success("Slot updated successfully! ✓");
      }
      onSaved({
        investBillNo: row.investBillNo,
        itemName: row.itemName,
        slot_DateTime: slotDateTime,
        impression: impression || row.report?.impression || "",
        is_approved: row.report?.is_approved || false,
        wasCreated: !hasReport,
      });
      onClose();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlotModalOverlay onClick={onClose}>
      <SlotModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🕐</ModalIcon>
          <ModalTitle>{hasReport ? "Update Slot" : "Schedule Slot"}</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoRow>
            <InfoLabel>Patient</InfoLabel>
            <InfoValue>{row.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{row.investBillNo}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>IP Number</InfoLabel>
            <InfoValue>{row.ipNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Item</InfoLabel>
            <InfoValue>{row.itemName || "—"}</InfoValue>
          </InfoRow>
          <div style={{ marginTop: "1.75rem" }}>
            <SlotSectionTitle>📅 Slot Date &amp; Time</SlotSectionTitle>
            <SlotFormGroup>
              <SlotLabel>📅 Slot Date</SlotLabel>
              <SlotInput
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </SlotFormGroup>
            <SlotFormGroup>
              <SlotLabel>⏰ Slot Time</SlotLabel>
              <SlotInput
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              />
            </SlotFormGroup>
            <SlotDivider />
            <SlotSectionTitle>📝 Impression</SlotSectionTitle>
            <ImpressionOptionalNote>
              {hasReport
                ? "Update impression (leave unchanged to keep existing)."
                : "Optional — can be added now or later."}
            </ImpressionOptionalNote>
            <StyledTextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter impression / findings (optional)..."
              style={{ minHeight: "120px", border: "2px solid #d1c4e9" }}
            />
          </div>
        </ModalBody>
        <ModalButtonGroup>
          <SlotSaveButton onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving…"
              : hasReport
                ? "Update Slot"
                : "Schedule & Create"}
          </SlotSaveButton>
          <CancelModalButton onClick={onClose} disabled={saving}>
            Cancel
          </CancelModalButton>
        </ModalButtonGroup>
      </SlotModalContent>
    </SlotModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MRIList = ({
  billTypeNo = "MRI01",
  investBillNo: investBillNoFilter,
}) => {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotRow, setSlotRow] = useState(null);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  // ── Column search state ────────────────────────────────────────────────────
  const [searchBillNo, setSearchBillNo] = useState("");
  const [searchUhid, setSearchUhid] = useState("");
  const [searchIpNumber, setSearchIpNumber] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        billTypeNo,
        from_date: fromDate,
        to_date: toDate,
      });
      if (investBillNoFilter) params.append("investBillNo", investBillNoFilter);
      const result = await apiRequest(
        `${HMSURL}investigations/?${params.toString()}`,
        "GET",
      );
      if (!result.success) {
        toast.error(result.error || "Failed to fetch data");
        return;
      }
      const merged = (result.data || []).map((row) => ({
        investBillNo: row.investBillNo,
        uhid: row.uhid,
        ipNumber: row.ipNumber,
        investBillDate: row.investBillDate,
        item: row.item,
        itemName: row.itemName || "",
        billTypeNo: row.billTypeNo || billTypeNo,
        patientName:
          `${row.salutation || ""} ${row.firstName || ""} ${row.lastName || ""}`.trim(),
        age: row.age,
        gender: row.gender,
        report: row.report || null,
        hasReport: !!row.hasReport,
      }));
      setRows(merged);
    } catch {
      toast.error("An unexpected error occurred");
    }
  }, [HMSURL, billTypeNo, investBillNoFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleResetFilter = () => {
    setFromDate(getToday());
    setToDate(getToday());
    setSearchBillNo("");
    setSearchUhid("");
    setSearchIpNumber("");
    setSearchPatient("");
    setSearchStatus("");
  };

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusLabel = !row.hasReport
        ? "pending"
        : row.report?.is_approved
          ? "approved"
          : "reported";
      return (
        (!searchBillNo ||
          (row.investBillNo || "")
            .toLowerCase()
            .includes(searchBillNo.toLowerCase())) &&
        (!searchUhid ||
          (row.uhid || "").toLowerCase().includes(searchUhid.toLowerCase())) &&
        (!searchIpNumber ||
          (row.ipNumber || "")
            .toLowerCase()
            .includes(searchIpNumber.toLowerCase())) &&
        (!searchPatient ||
          (row.patientName || "")
            .toLowerCase()
            .includes(searchPatient.toLowerCase())) &&
        (!searchStatus || statusLabel === searchStatus)
      );
    });
  }, [
    rows,
    searchBillNo,
    searchUhid,
    searchIpNumber,
    searchPatient,
    searchStatus,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGoToReport = (row) => {
    const parts = (row.uhid || "").split("/");
    const uhidBase = parts[0] || "";
    const subUhid = parts[1] || "";
    navigate(`/MRIReportForm/${uhidBase}/${subUhid}`, {
      state: {
        uhid: uhidBase,
        subUhid,
        itemName: row.itemName,
        ipNumber: row.ipNumber,
        investBillNo: row.investBillNo,
        salutation: "",
        firstName: row.patientName,
        middleName: "",
        lastName: "",
        age: row.age,
        gender: row.gender,
        investBillDate: row.investBillDate,
        billTypeNo,
      },
    });
  };

  const handleOpenSlot = (row) => {
    setSlotRow(row);
    setIsSlotModalOpen(true);
  };

  const handleSlotSaved = ({
    investBillNo,
    itemName,
    slot_DateTime,
    impression,
    wasCreated,
  }) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.investBillNo !== investBillNo || r.itemName !== itemName)
          return r;
        const updatedReport = wasCreated
          ? { slot_DateTime, impression, is_approved: false, is_active: true }
          : {
              ...r.report,
              slot_DateTime,
              ...(impression ? { impression } : {}),
            };
        return { ...r, report: updatedReport, hasReport: true };
      }),
    );
  };

  const handlePreview = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };
  const handleEdit = (row) => {
    setEditingRow(row);
    setIsEditModalOpen(true);
  };

  const handleApprove = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/approve/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.itemName)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report approved successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: { ...r.report, is_approved: true } }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while approving. Please try again.");
    }
  };

  const handleSaveEdit = async (newImpression) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/edit/${encodeURIComponent(editingRow.investBillNo)}/${encodeURIComponent(editingRow.itemName)}/`,
        "PATCH",
        { impression: newImpression },
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report updated successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === editingRow.investBillNo &&
          r.itemName === editingRow.itemName
            ? { ...r, report: { ...r.report, impression: newImpression } }
            : r,
        ),
      );
      setIsEditModalOpen(false);
      setEditingRow(null);
    } catch {
      toast.error("An error occurred while updating. Please try again.");
    }
  };

  const handleDelete = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/delete/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.itemName)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report deleted successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: null, hasReport: false }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while deleting. Please try again.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Stats derived from ALL rows (not filtered)
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => !r.hasReport).length;
    const reported = rows.filter(
      (r) => r.hasReport && !r.report?.is_approved,
    ).length;
    const approved = rows.filter((r) => r.report?.is_approved).length;
    // Item breakdown — count per unique itemName
    const itemMap = {};
    rows.forEach((r) => {
      const name = r.itemName || "Unknown";
      itemMap[name] = (itemMap[name] || 0) + 1;
    });
    return { total, pending, reported, approved, itemMap };
  }, [rows]);

  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          {/* ── Top bar: title + compact date filters ── */}
          <TopBar>
            <PageTitle>MRI Investigations</PageTitle>
            <FilterContainer>
              <FilterGroup>
                <FilterLabel>From</FilterLabel>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>To</FilterLabel>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FilterGroup>
              <ResetButton onClick={handleResetFilter}>↺ Reset</ResetButton>
            </FilterContainer>
          </TopBar>

          {/* ── Stat Cards ── */}
          <StatsRow>
            <StatCard bg="#f0faf8" accent="#00897b">
              <StatIcon>📋</StatIcon>
              <StatInfo>
                <StatCount color="#00695c">{stats.total}</StatCount>
                <StatLabel>Total</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e3f2fd" accent="#1e88e5">
              <StatIcon>⏳</StatIcon>
              <StatInfo>
                <StatCount color="#1565c0">{stats.pending}</StatCount>
                <StatLabel>Pending</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#fffde7" accent="#f9a825">
              <StatIcon>⏱</StatIcon>
              <StatInfo>
                <StatCount color="#f57f17">{stats.reported}</StatCount>
                <StatLabel>Reported</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e8f5e9" accent="#43a047">
              <StatIcon>✅</StatIcon>
              <StatInfo>
                <StatCount color="#2e7d32">{stats.approved}</StatCount>
                <StatLabel>Approved</StatLabel>
              </StatInfo>
            </StatCard>
            {/* Per-item breakdown */}
            {Object.entries(stats.itemMap).map(([itemName, count]) => (
              <StatCard key={itemName} bg="#f3e5f5" accent="#8e24aa">
                <StatIcon>🔬</StatIcon>
                <StatInfo>
                  <StatCount color="#6a1b9a">{count}</StatCount>
                  <StatLabel title={itemName}>
                    {itemName.length > 14
                      ? itemName.slice(0, 13) + "…"
                      : itemName}
                  </StatLabel>
                </StatInfo>
              </StatCard>
            ))}
          </StatsRow>

          <TableWrapper>
            <Table>
              <thead>
                {/* Column headers */}
                <tr>
                  <Th>Bill No</Th>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Item</Th>
                  <Th>Bill Date</Th>
                  <Th>Slot</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>

                {/* Per-column search row */}
                <tr>
                  <SearchTh>
                    <SearchInput
                      type="text"
                      placeholder="🔍 Bill No"
                      value={searchBillNo}
                      onChange={(e) => setSearchBillNo(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      type="text"
                      placeholder="🔍 UHID"
                      value={searchUhid}
                      onChange={(e) => setSearchUhid(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      type="text"
                      placeholder="🔍 IP No"
                      value={searchIpNumber}
                      onChange={(e) => setSearchIpNumber(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      type="text"
                      placeholder="🔍 Patient"
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </SearchTh>
                  {/* Age, Gender, Item, Bill Date, Slot — no search */}
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  {/* Status dropdown search */}
                  <SearchTh>
                    <SearchSelect
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="reported">⏱ Reported</option>
                      <option value="approved">✓ Approved</option>
                    </SearchSelect>
                  </SearchTh>
                  {/* Actions — no search */}
                  <SearchTh />
                </tr>
              </thead>

              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <Tr
                      key={`${row.investBillNo}-${row.itemName}-${index}`}
                      style={{
                        background: row.hasReport
                          ? "linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%)"
                          : "white",
                      }}
                    >
                      <Td>{row.investBillNo}</Td>
                      <Td>{row.uhid}</Td>
                      <Td>{row.ipNumber}</Td>
                      <Td>{row.patientName}</Td>
                      <Td>{row.age || "N/A"}</Td>
                      <Td>{row.gender || "N/A"}</Td>
                      <Td>{row.itemName || "—"}</Td>
                      <Td>{formatDate(row.investBillDate)}</Td>
                      <Td>
                        {row.report?.slot_DateTime ? (
                          <SlotBadge>
                            🕐 {formatSlotDisplay(row.report.slot_DateTime)}
                          </SlotBadge>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        {!row.hasReport ? (
                          <StatusBadge hasReport={false}>
                            ⏳ Pending
                          </StatusBadge>
                        ) : row.report?.is_approved ? (
                          <StatusBadge hasReport approved>
                            ✓ Approved
                          </StatusBadge>
                        ) : (
                          <StatusBadge hasReport>⏱ Reported</StatusBadge>
                        )}
                      </Td>

                      {/* Icon-only action buttons */}
                      <Td>
                        <ActionRow>
                          {/* Set / Update Slot — only if ipNumber exists */}
                          {row.ipNumber && (
                            <IconBtn
                              bg="linear-gradient(135deg,#7c4dff,#651fff)"
                              onClick={() => handleOpenSlot(row)}
                              disabled={row.report?.is_approved}
                              data-tip={
                                row.report?.is_approved
                                  ? "Slot locked (approved)"
                                  : row.hasReport
                                    ? "Update Slot"
                                    : "Set Slot"
                              }
                            >
                              🕐
                            </IconBtn>
                          )}

                          <IconBtn
                            bg="linear-gradient(135deg,#00897b,#00695c)"
                            onClick={() => handleGoToReport(row)}
                            disabled={row.hasReport}
                            data-tip={
                              row.hasReport
                                ? "Already Submitted"
                                : "Go to Report"
                            }
                          >
                            📋
                          </IconBtn>

                          <IconBtn
                            bg="linear-gradient(135deg,#26a69a,#00897b)"
                            onClick={() => handlePreview(row)}
                            disabled={!row.hasReport}
                            data-tip="Preview Report"
                          >
                            👁
                          </IconBtn>

                          <IconBtn
                            bg="linear-gradient(135deg,#66bb6a,#43a047)"
                            onClick={() => handleApprove(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            data-tip={
                              row.report?.is_approved
                                ? "Already Approved"
                                : "Approve Report"
                            }
                          >
                            ✅
                          </IconBtn>

                          <IconBtn
                            bg="linear-gradient(135deg,#42a5f5,#1e88e5)"
                            onClick={() => handleEdit(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            data-tip="Edit Impression"
                          >
                            ✏️
                          </IconBtn>

                          <IconBtn
                            bg="linear-gradient(135deg,#ef5350,#e53935)"
                            onClick={() => handleDelete(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            data-tip="Delete Report"
                          >
                            🗑️
                          </IconBtn>
                        </ActionRow>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="11">
                      <EmptyState>
                        <p>
                          {rows.length > 0
                            ? "No results match your search criteria"
                            : "No investigations found for selected date range"}
                        </p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </ContentCard>
      </Container>

      {isModalOpen && selectedRow && (
        <Modal
          row={selectedRow}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}

      {isEditModalOpen && editingRow && (
        <EditModal
          row={editingRow}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRow(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {isSlotModalOpen && slotRow && (
        <SlotModal
          row={slotRow}
          HMSURL={HMSURL}
          onClose={() => {
            setIsSlotModalOpen(false);
            setSlotRow(null);
          }}
          onSaved={handleSlotSaved}
        />
      )}
    </PageWrapper>
  );
};

export default MRIList;
