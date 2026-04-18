import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Styled Components ───────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  background-color: #0d9488;
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  &:hover { background-color: rgba(255,255,255,0.1); }
`;

const ModalBody = styled.div`padding: 24px;`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const FormInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  background-color: ${(props) => (props.readOnly ? "#f3f4f6" : "white")};
  cursor: ${(props) => (props.readOnly ? "not-allowed" : "text")};
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  ${(props) =>
    props.variant === "start"
      ? `background-color: #0d9488; color: white; &:hover:not(:disabled) { background-color: #0f766e; }`
      : `background-color: #dc2626; color: white; &:hover:not(:disabled) { background-color: #b91c1c; }`}
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2; color: #dc2626;
  padding: 12px; border-radius: 4px;
  margin-bottom: 16px; font-size: 14px;
  display: flex; align-items: center; gap: 8px;
`;

const SuccessMessage = styled.div`
  background-color: #f0fdf4; color: #166534;
  padding: 12px; border-radius: 4px;
  margin-bottom: 16px; font-size: 14px;
  display: flex; align-items: center; gap: 8px;
`;

const WarningMessage = styled.div`
  background-color: #fffbeb; color: #92400e;
  padding: 12px; border-radius: 4px;
  margin-bottom: 16px; font-size: 14px;
  display: flex; align-items: center; gap: 8px;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitialFormData = () => ({
  shiftNo:        "",
  branchCode:     "",
  cashCounter:    "",
  cashCounterName: "",        // ← outlet_name from cashcounter_outlet API
  openingBalance: "0.00",
  shiftStatus:    "Shift Not Started",
  closingBalance: "0.00",
  cashierID:      localStorage.getItem("employeeId") || "",
  cashierName:    localStorage.getItem("name") || "",
  startingTime:   "",
  closingTime:    "",
  isActive:       false,
});

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return "";
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShiftDetails({ isOpen, onClose }) {

  const [formData, setFormData]               = useState(getInitialFormData);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [warning, setWarning]                 = useState("");
  const [currentShiftId, setCurrentShiftId]   = useState(null);
  const [shiftActive, setShiftActive]         = useState(false);

  // ── Clear all messages ────────────────────────────────────────────────────
  const clearMessages = () => {
    setError(""); setSuccess(""); setWarning("");
  };

  // ── Reset form to initial state ───────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    clearMessages();
    setShiftActive(false);
    setCurrentShiftId(null);
  }, []);

  const fetchCashCounterName = useCallback(async () => {
  try {
    const res = await apiRequest(
      `${HmsBaseUrl}cashcounter_outlet/`,
      "GET"
    );

    if (res?.status === true && res?.outlet_name) {
      setFormData((prev) => ({
        ...prev,
        cashCounterName: res.outlet_name,
        cashCounter: localStorage.getItem("outlet_code"),
      }));
    }
  } catch (err) {
    console.error("Fetch cash counter outlet error:", err);
  }
}, []);

  // ── Populate form from API response ──────────────────────────────────────
  const loadShiftData = useCallback((shiftData) => {
    const isActive = shiftData.ShiftStatus === "active";

    setCurrentShiftId(shiftData.shiftno || null);
    setShiftActive(isActive);

    setFormData((prev) => ({
      ...prev,
      shiftNo:        shiftData.shiftno        || "",
      branchCode:     shiftData.branch_code    || "",
      cashCounter:    shiftData.CashCounter    || "",
      openingBalance: shiftData.OpeningBalance != null ? shiftData.OpeningBalance : "0.00",
      closingBalance: shiftData.ClosingBalance != null ? shiftData.ClosingBalance : "0.00",
      shiftStatus:    isActive ? "Shift Active" : "Shift Completed",
      cashierID:      shiftData.CashierID      || localStorage.getItem("employeeId") || "",
      cashierName:    localStorage.getItem("name") || "",
      startingTime:   formatDateTime(shiftData.StartingTime),
      closingTime:    formatDateTime(shiftData.closingTime),
      isActive:       shiftData.is_active ?? false,
    }));
  }, []);

  // ── Fetch active shift + outlet name whenever modal opens ─────────────────
  useEffect(() => {
    if (!isOpen) return;

    const employeeId  = localStorage.getItem("employeeId");
    const branch_code = localStorage.getItem("selected_branch");

    // Always fetch outlet name on open
    fetchCashCounterName();

    if (!employeeId || !branch_code) {
      resetForm();
      return;
    }

    const fetchActiveShift = async () => {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}get_active_shift/?CashierID=${employeeId}&branch_code=${branch_code}`,
          "GET"
        );

        if (res?.success && res?.data) {
          loadShiftData(res.data.data);
          console.log("hhhh", res.data.data);
        } else {
          resetForm();
          // Re-fetch outlet name since resetForm clears it
          fetchCashCounterName();
        }
      } catch (err) {
        console.error("Fetch shift error:", err);
        resetForm();
        fetchCashCounterName();
      }
    };

    fetchActiveShift();
  }, [isOpen, loadShiftData, resetForm, fetchCashCounterName]);

  // ── Input change handler ──────────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearMessages();
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const employeeId = localStorage.getItem("employeeId");

    if (!formData.cashCounter) {
      setError("Cash counter not loaded. Please try reopening this dialog.");
      return false;
    }
    if (!employeeId) {
      setError("Cashier ID is missing. Please re-login.");
      return false;
    }
    if (shiftActive) {
      setError("A shift is already active. Please close the current shift first.");
      return false;
    }
    return true;
  };

  // ── Start Shift ───────────────────────────────────────────────────────────
  const handleStartCounter = async () => {
    if (!validateForm()) return;

    const employeeId  = localStorage.getItem("employeeId");
    const branch_code = localStorage.getItem("selected_branch");
    const startingTime = new Date().toISOString();

    setLoading(true);
    clearMessages();

    const payload = {
      CashierID:      employeeId,
      CashCounter:    formData.cashCounter,
      OpeningBalance: parseFloat(formData.openingBalance) || 0,
      ShiftStatus:    "active",
      StartingTime:   startingTime,
      branch_code:    branch_code,
    };

    try {
      const response = await apiRequest(
        `${HmsBaseUrl}cashcountershiftdetails/`,
        "POST",
        payload
      );

      if (response?.success) {
        const shiftno = response.data?.shiftno;
        setCurrentShiftId(shiftno);
        setShiftActive(true);
        setFormData((prev) => ({
          ...prev,
          shiftNo:      shiftno || "",
          shiftStatus:  "Shift Active",
          startingTime: formatDateTime(startingTime),
        }));
        setSuccess("Shift started successfully.");
      } else {
        setError(response?.message || "Something went wrong. Please try again.");
        if (response?.counter_active) {
          setWarning("This counter is already active. Please close it first.");
        }
      }
    } catch (err) {
      console.error("Start Shift Error:", err);
      setError("Failed to start shift. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Stop Shift ────────────────────────────────────────────────────────────
  const handleStopCounter = async () => {
    if (!currentShiftId) {
      setError("Shift not loaded properly. Please close and reopen this dialog.");
      return;
    }

    setLoading(true);
    clearMessages();

    const payload = {
      shiftno:        currentShiftId,
      ClosingBalance: parseFloat(formData.closingBalance) || 0,
      closingTime:    new Date().toISOString(),
    };

    try {
      const response = await apiRequest(
        `${HmsBaseUrl}cashcountershiftdetails/`,
        "PATCH",
        payload
      );

      if (response?.success) {
        const closingTime = payload.closingTime;
        setShiftActive(false);
        setFormData((prev) => ({
          ...prev,
          shiftStatus:  "Shift Completed",
          closingTime:  formatDateTime(closingTime),
        }));
        setSuccess("Shift closed successfully.");
      } else {
        setError(response?.message || "Failed to close shift.");
      }
    } catch (err) {
      console.error("Stop Shift Error:", err);
      setError("Failed to close shift. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <ModalHeader>
          <ModalTitle>Shift Details</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {error   && <ErrorMessage>⚠️ {error}</ErrorMessage>}
          {success && <SuccessMessage>✅ {success}</SuccessMessage>}
          {warning && <WarningMessage>⚠️ {warning}</WarningMessage>}

          <FormGrid>

            {/* Cash Counter — non-editable, displays outlet_name from API */}
            <FormGroup>
              <FormLabel>Cash Counter</FormLabel>
              <FormInput
                type="text"
                value={formData.cashCounterName}
                readOnly
                placeholder="Fetching cash counter..."
              />
            </FormGroup>

            {/* Opening Balance */}
            <FormGroup>
              <FormLabel>Opening Balance</FormLabel>
              <FormInput
                type="number"
                value={formData.openingBalance}
                onChange={(e) => handleInputChange("openingBalance", e.target.value)}
                readOnly={shiftActive}
                placeholder="0.00"
              />
            </FormGroup>

            {/* Shift Status */}
            <FormGroup>
              <FormLabel>Shift Status</FormLabel>
              <FormInput
                type="text"
                value={formData.shiftStatus}
                readOnly
              />
            </FormGroup>

            {/* Closing Balance */}
            <FormGroup>
              <FormLabel>Closing Balance</FormLabel>
              <FormInput
                type="number"
                value={formData.closingBalance}
                onChange={(e) => handleInputChange("closingBalance", e.target.value)}
                readOnly={!shiftActive}
                placeholder="0.00"
              />
            </FormGroup>

            {/* Cashier Name */}
            <FormGroup>
              <FormLabel>Cashier Name</FormLabel>
              <FormInput
                type="text"
                value={formData.cashierName}
                readOnly
              />
            </FormGroup>

            {/* Starting Time */}
            <FormGroup>
              <FormLabel>Starting Time</FormLabel>
              <FormInput
                type="text"
                value={formData.startingTime}
                readOnly
                placeholder="—"
              />
            </FormGroup>

          </FormGrid>

          {/* Action Buttons */}
          <ButtonGroup>
            <ActionButton
              variant="start"
              onClick={handleStartCounter}
              disabled={loading || shiftActive}
            >
              {loading && !shiftActive ? <LoadingSpinner /> : "⏰"}
              Start Counter
            </ActionButton>

            <ActionButton
              variant="stop"
              onClick={handleStopCounter}
              disabled={loading || !shiftActive}
            >
              {loading && shiftActive ? <LoadingSpinner /> : "⏹"}
              Stop Counter
            </ActionButton>
          </ButtonGroup>
        </ModalBody>

      </ModalContent>
    </ModalOverlay>
  );
}