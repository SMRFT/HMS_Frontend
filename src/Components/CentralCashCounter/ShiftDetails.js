import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Modal Styles (keeping existing styles)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

const FormSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
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
      ? `
    background-color: #0d9488;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #0f766e;
    }
  `
      : `
    background-color: #dc2626;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
    }
  `}
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  ${(props) => {
    switch (props.status) {
      case "active":
        return `
          background-color: #d1fae5;
          color: #065f46;
        `;
      case "completed":
        return `
          background-color: #fef3c7;
          color: #92400e;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #4b5563;
        `;
    }
  }}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;

  ${(props) => {
    switch (props.status) {
      case "active":
        return "background-color: #10b981;";
      case "completed":
        return "background-color: #f59e0b;";
      default:
        return "background-color: #6b7280;";
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  color: #166534;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningMessage = styled.div`
  background-color: #fffbeb;
  color: #92400e;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function ShiftDetails({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    cashCounter: "",
    openingBalance: "₹ 0.00",
    shiftStatus: "Shift Not Started",
    closingBalance: "₹ 0.00",
    cashierName: "",
    cashierID: "",
    startingTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [shiftActive, setShiftActive] = useState(false);
  const [counterCheckLoading, setCounterCheckLoading] = useState(false);

  // Enhanced CSRF token getter with fallback
  const getCsrfToken = () => {
    // Try multiple methods to get CSRF token
    const cookieValue = getCookie("csrftoken");
    if (cookieValue) return cookieValue;

    // Try meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute("content");

    // Try hidden input
    const hiddenInput = document.querySelector(
      'input[name="csrfmiddlewaretoken"]'
    );
    if (hiddenInput) return hiddenInput.value;

    return null;
  };

  // Helper function to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Enhanced API request function
  const makeApiRequest = async (url, options = {}) => {
    const csrfToken = getCsrfToken();
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Add CSRF token if available
    if (csrfToken) {
      defaultHeaders["X-CSRFToken"] = csrfToken;
    }

    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log("Making API request:", {
      url,
      method: requestOptions.method || "GET",
      headers: requestOptions.headers,
      body: requestOptions.body,
    });

    const response = await fetch(url, requestOptions);
    return response;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      cashCounter: "",
      openingBalance: "₹ 0.00",
      shiftStatus: "Shift Not Started",
      closingBalance: "₹ 0.00",
      cashierName: "",
      cashierID: "",
      startingTime: "",
    });
    setError("");
    setSuccess("");
    setWarning("");
    setShiftActive(false);
    setCurrentShiftId(null);
  };

  // Check counter status when counter is selected
  const checkCounterStatus = async (counterName) => {
    if (!counterName) return;

    setCounterCheckLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    try {
      const response = await makeApiRequest(
        `http://127.0.0.1:8000/shifts/check-counter/${counterName}/`,
        { method: "GET" }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.counter_active && data.data) {
          // Counter is active, load existing shift data
          setWarning(
            `Already this counter is active. After closing the counter only you can activate this counter again.`
          );
          loadShiftData(data.data);
        } else {
          // Counter is available
          setShiftActive(false);
          setCurrentShiftId(null);
          setFormData((prev) => ({
            ...prev,
            shiftStatus: "Shift Not Started",
            startingTime: "",
            cashierName: "",
            cashierID: "",
            openingBalance: "₹ 0.00",
            closingBalance: "₹ 0.00",
          }));
        }
      } else {
        setError(data.message || "Failed to check counter status");
      }
    } catch (error) {
      console.error("Error checking counter status:", error);
      setError("Failed to check counter status");
    } finally {
      setCounterCheckLoading(false);
    }
  };

  // Load shift data into form
  const loadShiftData = (shiftData) => {
    const shiftId = shiftData.id || shiftData._id;
    console.log("Loading shift data:", shiftData, "ID:", shiftId);

    setCurrentShiftId(shiftId);
    setShiftActive(shiftData.shiftStatus === "active");
    setFormData((prev) => ({
      ...prev,
      cashCounter: shiftData.cashCounter,
      cashierName: shiftData.cashierName,
      cashierID: shiftData.cashierID,
      shiftStatus:
        shiftData.shiftStatus === "active" ? "Shift Active" : "Shift Completed",
      startingTime: new Date(shiftData.startingTime).toLocaleString(),
      openingBalance: `₹ ${shiftData.openingBalance}`,
      closingBalance: shiftData.closingBalance
        ? `₹ ${shiftData.closingBalance}`
        : "₹ 0.00",
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check counter status when counter is selected
    if (field === "cashCounter" && value) {
      checkCounterStatus(value);
    }

    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
    if (warning) setWarning("");
  };

  const validateForm = () => {
    if (!formData.cashCounter) {
      setError("Please select a cash counter");
      return false;
    }
    if (!formData.cashierName.trim()) {
      setError("Please enter cashier name");
      return false;
    }
    if (shiftActive) {
      setError(
        "This counter is already active. Please close the current shift first."
      );
      return false;
    }
    return true;
  };

  const handleStartCounter = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    try {
      const response = await makeApiRequest(
        "http://127.0.0.1:8000/shifts/start/",
        {
          method: "POST",
          body: JSON.stringify({
            cashCounter: formData.cashCounter,
            openingBalance:
              parseFloat(formData.openingBalance.replace(/[₹, ]/g, "")) || 0,
            cashierName: formData.cashierName.trim(),
            cashierID: formData.cashierID.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const shiftId = data.data.id || data.data._id;
        setCurrentShiftId(shiftId);
        setShiftActive(true);
        setFormData((prev) => ({
          ...prev,
          shiftStatus: "Shift Active",
          startingTime: new Date(data.data.startingTime).toLocaleString(),
        }));
        setSuccess("Shift started successfully.");
      } else {
        setError(data.message || "Something went wrong.");
        if (data.counter_active) {
          setWarning(
            "This counter is already active. Please close the current shift first."
          );
        }
      }
    } catch (error) {
      console.error("Start Shift Error:", error);
      setError("Failed to start shift.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCounter = async () => {
    if (!formData.cashierName || !formData.cashCounter || !shiftActive) {
      setError("No active shift to close.");
      return;
    }

    try {
      const rawClosing = formData.closingBalance?.replace(/[₹,\s]/g, "");
      const closingBalance =
        rawClosing && !isNaN(rawClosing)
          ? parseFloat(rawClosing).toFixed(2)
          : null;
      const cashierID = formData.cashierID; // 👈 get from formData
      if (!closingBalance) {
        setError("Invalid closing balance.");
        return;
      }

      if (!cashierID) {
        setError("Cashier ID not found in form data.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/shifts/close/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cashierID: formData.cashierID,
          closingBalance: parseFloat(closingBalance),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Shift closed successfully.");
        loadShiftData(data.data);
        setShiftActive(false);
      } else {
        setError(data.message || "Failed to close shift.");
      }
    } catch (err) {
      console.error("Error closing shift:", err);
      setError("An unexpected error occurred.");
    }
  };

  const getStatusType = () => {
    if (formData.shiftStatus === "Shift Active") return "active";
    if (formData.shiftStatus === "Shift Completed") return "completed";
    return "not_started";
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Shift Details</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}
          {success && <SuccessMessage>✅ {success}</SuccessMessage>}
          {warning && <WarningMessage>⚠️ {warning}</WarningMessage>}

          <FormGrid>
            <FormGroup>
              <FormLabel>Cash Counter</FormLabel>
              <FormSelect
                value={formData.cashCounter}
                onChange={(e) =>
                  handleInputChange("cashCounter", e.target.value)
                }
                disabled={shiftActive || counterCheckLoading}
              >
                <option value="">
                  {counterCheckLoading ? "Checking..." : "Select Counter"}
                </option>
                <option value="counter1">Counter 1</option>
                <option value="counter2">Counter 2</option>
                <option value="counter3">Counter 3</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Opening Balance</FormLabel>
              <FormInput
                type="text"
                value={formData.openingBalance}
                onChange={(e) =>
                  handleInputChange("openingBalance", e.target.value)
                }
                readOnly={shiftActive}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Shift Status</FormLabel>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <FormInput type="text" value={formData.shiftStatus} readOnly />
                <StatusIndicator status={getStatusType()}>
                  <StatusDot status={getStatusType()} />
                  {getStatusType() === "active"
                    ? "Active"
                    : getStatusType() === "completed"
                    ? "Completed"
                    : "Not Started"}
                </StatusIndicator>
              </div>
            </FormGroup>

            <FormGroup>
              <FormLabel>Closing Balance</FormLabel>
              <FormInput
                type="text"
                value={formData.closingBalance}
                onChange={(e) =>
                  handleInputChange("closingBalance", e.target.value)
                }
                readOnly={!shiftActive}
                placeholder="₹ 0.00"
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Cashier ID</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter cashier ID"
                value={formData.cashierID}
                onChange={(e) => handleInputChange("cashierID", e.target.value)}
                disabled={shiftActive}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Cashier Name</FormLabel>
              <FormInput
                type="text"
                placeholder="Enter cashier name"
                value={formData.cashierName}
                onChange={(e) =>
                  handleInputChange("cashierName", e.target.value)
                }
                disabled={shiftActive}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Starting Time</FormLabel>
              <FormInput
                type="text"
                value={formData.startingTime}
                placeholder="Will be set automatically when shift starts"
                readOnly
              />
            </FormGroup>
          </FormGrid>

          <ButtonGroup>
            <ActionButton
              variant="start"
              onClick={handleStartCounter}
              disabled={loading || shiftActive || counterCheckLoading}
            >
              {loading && !shiftActive ? <LoadingSpinner /> : "⏰"}
              Start Counter
            </ActionButton>

            <ActionButton
              variant="stop"
              onClick={handleCloseCounter}
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
