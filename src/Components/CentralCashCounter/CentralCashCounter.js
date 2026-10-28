import React, { useState, useEffect, useCallback } from "react";
import { Search, Mic, RotateCcw, CreditCard, Clock, User, Hash, Layers } from "lucide-react";
import ShiftDetails from "./ShiftDetails";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  margin-top: 10px;
  font-family: inherit;
`;

const MainContent = styled.div`
  padding: 24px 32px;
  max-width: 1600px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  padding: 16px 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.2s ease;
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 1fr 1.15fr;
  gap: 16px;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ShiftCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
`;

const ShiftCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 1px solid #edf2f7;
`;

const ShiftRefBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #0f172a;
  color: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const ShiftDataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
`;

const ShiftDataLabel = styled.span`
  color: #64748b;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const ShiftDataValue = styled.span`
  color: #1e293b;
  font-weight: 600;
  font-size: 12.5px;
`;

const BalancesCard = styled.div`
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  border: 1px solid #ccfbf1;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

const BalancesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px dashed #99f6e4;
`;

const BalancesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const BalanceTile = styled.div`
  background: #ffffff;
  border: 1px solid ${(props) => (props.$highlight ? "#99f6e4" : "#e2e8f0")};
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
`;

const BalanceTileLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${(props) => (props.$highlight ? "#0f766e" : "#64748b")};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BalanceTileAmount = styled.span`
  font-size: 16.5px;
  font-weight: 800;
  color: ${(props) => (props.$highlight ? "#0f766e" : "#0f172a")};
  letter-spacing: -0.01em;
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${(props) => (props.$active ? "#d1fae5" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#065f46" : "#64748b")};
  border: 1px solid ${(props) => (props.$active ? "#a7f3d0" : "#e2e8f0")};
`;

const CounterCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
`;

// Legacy Label / Amount for backward compatibility if referenced elsewhere
const Label = styled.span`
  font-weight: 600;
  color: #64748b;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Amount = styled.span`
  font-weight: 800;
  font-size: 18px;
  color: #0f172a;
`;

const Value = styled.span`
  color: #1e293b;
  font-size: 13.5px;
  font-weight: 600;
  text-align: right;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  width: fit-content;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 250px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  padding: 12px;
`;

const SidebarButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 11px 16px;
  margin-bottom: 6px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s ease;

  ${(props) =>
    props.active
      ? `
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
  `
      : `
    background-color: transparent;
    color: #475569;
    
    &:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
  `}
`;

const MainPanel = styled.div`
  flex: 1;
  min-width: 0;
  background-color: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
`;

const PanelContent = styled.div`
  padding: 24px 28px;
`;

const Title = styled.h2`
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
`;

const ControlsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  padding: 14px 18px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Select = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  min-width: 128px;
  font-size: 13.5px;
  font-weight: 500;
  color: #1e293b;
  background-color: #ffffff;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  accent-color: #0d9488;
  cursor: pointer;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13.5px;
  color: #64748b;
  font-weight: 500;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px 8px 36px;
  min-width: 270px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  background: #ffffff;
  transition: all 0.2s;

  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const MicButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 6px;
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  border: none;
  border-bottom: 1px solid #e2e8f0;
  padding: 11px 12px;
  text-align: ${(props) => (props.align ? props.align : props.center ? "center" : props.right ? "right" : "left")};
  background-color: #f8fafc;
  font-weight: 700;
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  vertical-align: middle;
`;

const TableCell = styled.td`
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 10px 12px;
  text-align: ${(props) => (props.align ? props.align : props.center ? "center" : props.right ? "right" : "left")};
  color: ${(props) => (props.muted ? "#64748b" : "#1e293b")};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  vertical-align: middle;

  tr:last-child & {
    border-bottom: none;
  }

  tr:hover & {
    background-color: #fbfcfe;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const PaginationButton = styled.button`
  padding: 7px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #0d9488;
    color: #0d9488;
    background-color: #f0fdfa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0d9488;
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

const ToastWrapper = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`;

const ToastBox = styled.div`
  min-width: 320px;
  max-width: 460px;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
  pointer-events: all;
  background: ${({ type }) => type === "success" ? "#ecfdf5" : "#fef2f2"};
  color: ${({ type }) => type === "success" ? "#065f46" : "#991b1b"};
  border-left: 4px solid ${({ type }) => type === "success" ? "#10b981" : "#ef4444"};

  @keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
`;

const ToastIcon = styled.span`
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
`;

const ToastText = styled.span`
  flex: 1;
  line-height: 1.5;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

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
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #ffffff;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
`;

const BillInfoCard = styled.div`
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const BillInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BillInfoLabel = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  font-weight: 600;
`;

const BillInfoValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0d9488;
`;

const NetAmountBanner = styled.div`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
`;

const PaymentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
`;

const PaymentMethodLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  margin-bottom: 8px;
  padding-left: 2px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
    background: #fff;
  }

  &::placeholder {
    color: #b0bec5;
  }
`;

const SubInput = styled(Input)`
  border-style: dashed;
  background: #f8fafc;
  font-size: 13px;
`;

const SummaryCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: ${(props) =>
    props.highlight ? "#0d9488" : props.danger ? "#dc2626" : "#374151"};
  font-weight: ${(props) => (props.bold ? "700" : "500")};
  ${(props) =>
    props.separator &&
    `
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
    margin-top: 2px;
  `}
`;

const ModalFooterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
  }

  &:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const CancelButton = styled.button`
  background: white;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const ShiftRunningBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #166534;
  margin-top: 12px;

  span.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #16a34a;
    animation: pulse 1.5s ease-in-out infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.3);
    }
  }
`;

export default function CentralCashCounter() {
  const [billType, setBillType] = useState("ALL");
  const [showEntries, setShowEntries] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("pending");
  const [activeMenuItem, setActiveMenuItem] = useState("Pending Bills");
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [pendingBills, setPendingBills] = useState([]);
  const [receivedBills, setReceivedBills] = useState([]);
  const [ipAdvancePendingBills, setIpAdvancePendingBills] = useState([]);
  const [ipAdvanceReceivedBills, setIpAdvanceReceivedBills] = useState([]);
  const [opPharmacyBills, setOpPharmacyBills] = useState([]);
  const [opPharmacyReceivedBills, setOpPharmacyReceivedBills] = useState([]);
  const [allowedBillTypes, setAllowedBillTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cashCounterId, setCashCounterId] = useState("");
  const [toastState, setToastState] = useState({ visible: false, type: "", message: "" });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [modalError, setModalError] = useState("");

  const extractErrorMessage = (err) => {
    if (!err) return "Payment failed. Please try again.";
    if (typeof err === "string") return err;
    if (typeof err === "object") {
      if (err.message && typeof err.message === "string") return err.message;
      if (err.error && typeof err.error === "string") return err.error;
      const errors = [];
      for (const key of Object.keys(err)) {
        const val = err[key];
        if (Array.isArray(val)) {
          errors.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          errors.push(`${key}: ${val}`);
        }
      }
      if (errors.length > 0) return errors.join(" | ");
      return JSON.stringify(err);
    }
    return String(err);
  };

  const showToast = (type, message) => {
    const text = type === "error" ? extractErrorMessage(message) : (typeof message === "string" ? message : JSON.stringify(message));
    if (type === "success") {
      toast.success(text);
    } else {
      toast.error(text);
    }
    setToastState({ visible: true, type, message: text });
    setTimeout(() => setToastState({ visible: false, type: "", message: "" }), 4000);
  };

  const [filteredBills, setFilteredBills] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [selectedMethods, setSelectedMethods] = useState({
    cash: false,
    card: false,
    cheque: false,
  });
  const [payments, setPayments] = useState({
    cash: "",
    cheque: "",
    chequeNo: "",
    card: "",
    cardNo: "",
  });

  // ✅ NEW: Remarks state for OPPharmacy payment
  const [remarks, setRemarks] = useState("");

  const [activeShift, setActiveShift] = useState(null);

  // ── Receipt / Payment state ──────────────────────────────────────────────────
  const [rpReceiptType, setRpReceiptType] = useState("Receipt");
  const [rpAccountHeads, setRpAccountHeads] = useState([]);
  const [rpAccountHeadsLoading, setRpAccountHeadsLoading] = useState(false);
  const [rpSelectedSNo, setRpSelectedSNo] = useState("");
  const [rpAmount, setRpAmount] = useState("");
  const [rpDescFields, setRpDescFields] = useState({});
  const [rpRecords, setRpRecords] = useState([]);
  const [rpSearchTerm, setRpSearchTerm] = useState("");
  const [rpShowEntries, setRpShowEntries] = useState("10");
  const [rpAlert, setRpAlert] = useState(null);
  const [rpSaving, setRpSaving] = useState(false);
  const [rpLoading, setRpLoading] = useState(false);
  const [rpShowVoucherModal, setRpShowVoucherModal] = useState(false);
  const [rpShowVoucherForm, setRpShowVoucherForm]   = useState(false);
  const [rpVoucherLoading, setRpVoucherLoading] = useState(false);
  const [rpPrintVoucher, setRpPrintVoucher]     = useState(null);

  // ── Return Bills state ────────────────────────────────────────────────────────
  const [returnPendingBills, setReturnPendingBills] = useState([]);
  const [returnReceivedBills, setReturnReceivedBills] = useState([]);

  // ── Previous Vouchers Modal state ────────────────────────────────────────────
  const [pvFromDate, setPvFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [pvToDate, setPvToDate]         = useState(() => new Date().toISOString().split("T")[0]);
  const [pvVoucherType, setPvVoucherType] = useState("All");
  const [pvData, setPvData]             = useState([]);
  const [pvPage, setPvPage]             = useState(1);
  const [pvShowEntries, setPvShowEntries] = useState(10);
  const [pvTotalReceipt, setPvTotalReceipt] = useState(0);
  const [pvTotalPayment, setPvTotalPayment] = useState(0);

  // ── Receipt / Payment derived ────────────────────────────────────────────────
  const rpSelectedHead = Array.isArray(rpAccountHeads)
    ? rpAccountHeads.find((h) => h["S.No"] === rpSelectedSNo) || null
    : null;
  const rpSelectedHeadName = rpSelectedHead ? rpSelectedHead.account_head : "";

  const rpShowAlert = (type, msg) => {
    setRpAlert({ type, msg });
    setTimeout(() => setRpAlert(null), 4000);
  };

  const rpFetchAccountHeads = async () => {
    setRpAccountHeadsLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_active_account_heads/`, "GET");
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setRpAccountHeads(list);
      if (list.length > 0) setRpSelectedSNo(list[0]["S.No"]);
    } catch (err) {
      console.error("Failed to fetch account heads:", err);
      setRpAccountHeads([]);
    } finally {
      setRpAccountHeadsLoading(false);
    }
  };

  const rpFetchRecords = async () => {
    setRpLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_receipt_payments/`,
        "POST",
        {},
      );
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setRpRecords(list);
    } catch (err) {
      console.error("Failed to fetch receipt/payment records:", err);
      setRpRecords([]);
    } finally {
      setRpLoading(false);
    }
  };

  const rpHandleSave = async () => {
    if (!rpSelectedSNo)
      return rpShowAlert("error", "Please select an Account Head.");
    if (!rpAmount || isNaN(rpAmount) || parseFloat(rpAmount) <= 0)
      return rpShowAlert("error", "Please enter a valid Amount.");

    const CashCounter = cashCounterId || localStorage.getItem("selected_outlet") || "";
    let description = null;
    if (rpSelectedHeadName === "ROOM ACCESS CARD") {
      if (!rpDescFields.patient_name || !rpDescFields.room_no)
        return rpShowAlert("error", "Please fill in Patient Name and Room No.");
      description = {
        patient_name: rpDescFields.patient_name,
        room_no: rpDescFields.room_no,
      };
    } else if (rpSelectedHeadName === "MISCELLANEOUS INCOME") {
      description = { description: rpDescFields.description || "" };
    }

    const payload = {
      receipt_type: rpReceiptType,
      account_head: rpSelectedSNo,
      description,
      amount: parseFloat(rpAmount),
      CashCounter,
      shiftno: activeShift?.shiftno || "",
    };

    setRpSaving(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}post_receipt_payments/`,
        "POST",
        payload,
      );
      if (res?.success || res?.id || res?._id || res?.voucher_no) {
        rpShowAlert("success", "Payment collected successfully!");

        const newRecord = {
          _id:               res?._id        || res?.id        || `temp-${Date.now()}`,
          voucher_no:        res?.voucher_no || "—",
          voucher_date:      res?.voucher_date || new Date().toISOString(),
          receipt_type:      payload.receipt_type,
          account_head:      payload.account_head,
          account_head_details: {
            no: payload.account_head,
            name: rpSelectedHeadName,
          },
          description: payload.description,
          amount: payload.amount,
          shiftno: payload.shiftno,
          CashCounter: payload.CashCounter,
        };
        setRpRecords((prev) => [newRecord, ...prev]);

        setRpAmount("");
        setRpDescFields(
          rpSelectedHeadName === "ROOM ACCESS CARD"
            ? { patient_name: "", room_no: "" }
            : rpSelectedHeadName === "MISCELLANEOUS INCOME"
              ? { description: "" }
              : {},
        );

        rpFetchRecords();
      } else {
        rpShowAlert("error", res?.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      rpShowAlert("error", "Payment failed. Please check your connection.");
    } finally {
      setRpSaving(false);
    }
  };

  const rpOpenVoucherModal = () => {
    setRpShowVoucherModal(true);
    setPvPage(1);
    setPvData([]);
    pvFetchVouchers(pvFromDate, pvToDate, pvVoucherType);
  };

  const pvFetchVouchers = async (fromDate, toDate, vType) => {
    setRpVoucherLoading(true);
    try {
      const payload = {
        from_date: fromDate,
        to_date: toDate,
        voucher_type: vType === "All" ? "" : vType,
      };
      const res = await apiRequest(
        `${HmsBaseUrl}get_receipt_payments/`,
        "POST",
        payload,
      );
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setPvData(list);
      setPvPage(1);
      let totalR = 0,
        totalP = 0;
      list.forEach((r) => {
        const amt = parseFloat(r.amount || 0);
        if (r.receipt_type === "Receipt") totalR += amt;
        else if (r.receipt_type === "Payment") totalP += amt;
      });
      setPvTotalReceipt(totalR);
      setPvTotalPayment(totalP);
    } catch (err) {
      console.error("Failed to load previous vouchers:", err);
      setPvData([]);
    } finally {
      setRpVoucherLoading(false);
    }
  };

  const pvExportExcel = () => {
    const headers = [
      "Date",
      "Time",
      "Shift Reference",
      "Account Name",
      "Voucher No",
      "Receipt No",
      "Payment",
      "Description",
    ];
    const rows = pvData.map((r) => {
      const d = r.voucher_date ? new Date(r.voucher_date) : null;
      const dateStr = d
        ? d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      const timeStr = d
        ? d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "—";
      const desc = r.description
        ? typeof r.description === "object"
          ? Object.values(r.description).filter(Boolean).join(", ")
          : r.description
        : "—";
      return [
        dateStr,
        timeStr,
        r.shiftno || r.shift_reference || "—",
        r.account_head_details?.name ||
          r.account_head_name ||
          r.account_head ||
          "—",
        r.voucher_no || "—",
        r.receipt_type === "Receipt"
          ? parseFloat(r.amount || 0).toFixed(2)
          : "0.00",
        r.receipt_type === "Payment"
          ? parseFloat(r.amount || 0).toFixed(2)
          : "0.00",
        desc,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => '"' + c + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "previous_vouchers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatShiftDateTime = (raw) => {
    if (!raw) return "—";
    let s = String(raw).trim().replace(" ", "T");
    if (s && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatSessionDate = (raw) => {
    if (!raw) return new Date().toLocaleDateString("en-IN");
    const datePart = String(raw).split(" ")[0].split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return datePart;
  };

  const handleShiftChange = async (shiftData) => {
    if (!shiftData) {
      setActiveShift(null);
      await refreshActiveShift();
      return;
    }
    const clean = shiftData?.data?.shiftno ? shiftData.data : (shiftData?.shiftno ? shiftData : null);
    if (clean && clean.shiftno) {
      setActiveShift(clean);
      if (clean.CashCounter) {
        setCashCounterId(clean.CashCounter);
      }
    } else if (shiftData?.is_active === false) {
      setActiveShift(null);
    }
    await refreshActiveShift();
  };

  const shiftBelongsHere = !!(activeShift && activeShift.is_active === true && activeShift.ShiftStatus === "active");

  const sidebarItems = [
    { label: "Pending Bills", id: "pending-bills" },
    { label: "IP Advance", id: "ip-advance" },
    { label: "Returns Bills", id: "Returns Bills" },
    { label: "Receipt / Payment", id: "receipt-payment" },
  ];

  const refreshActiveShift = useCallback(async () => {
    try {
      const outletCode = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
      const res = await apiRequest(
        `${HmsBaseUrl}get_active_shift/`,
        "POST",
        { CashCounter: cashCounterId || outletCode }
      );
      if (res?.success && res?.data?.success && res?.data?.data) {
        if (res.data.cashcounter?.counter_id) {
          setCashCounterId(res.data.cashcounter.counter_id);
        }
        setActiveShift(res.data.data);
      } else if (res?.data?.success === false || (res && !res.success)) {
        if (res?.data?.cashcounter?.counter_id) {
          setCashCounterId(res.data.cashcounter.counter_id);
        }
        setActiveShift(null);
      }
    } catch (err) {
      console.error("Failed to refresh active shift:", err);
    }
  }, [cashCounterId]);

  useEffect(() => {
    refreshActiveShift();
    const interval = setInterval(() => {
      refreshActiveShift();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshActiveShift]);



  const formatBillData = (billsArray) => {
    return billsArray.map((item, index) => {
      // unique fallback id
      const id = item.id ?? `temp-${index}-${Date.now()}`;

      // ✅ use bill_date only
      const billDateObj = item.bill_date ? new Date(item.bill_date) : null;

      const billDate = billDateObj
        ? billDateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })
        : "-";

      const billTime = billDateObj
        ? billDateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // 👈 IMPORTANT
            timeZone: "Asia/Kolkata",
          })
        : "-";

      return {
        id,
        date: billDate,
        time: billTime,
        Bill_id: item.Bill_id,
        uhid: item.uhid,
        bill_no: item.bill_no || "-",
        bill_type: item.bill_type || item.type || "-",
        uhid_no: item.uhid || "-",
        patient: item.patient_name || "-",
        investigation: item.billing_status || "-",
        doctor: item.doctor_id || "-",
        total: item.net_amount || 0,
        payment_method: "-",
        source: "OP",
      };
    });
  };

  // ✅ IP Advance formatter — flattens each pending_payment into its own table row
  const formatIpAdvanceData = (admissionsArray, statusFilter = "pending") => {
    const rows = [];
    admissionsArray.forEach((admission) => {
      const payments = admission.advance_payments || [];
      // Filter based on status (pending or paid)
      const filteredPayments = payments.filter(
        (p) => p.is_advanceActive && String(p.status).toLowerCase() === statusFilter.toLowerCase()
      );
      if (filteredPayments.length === 0) return;

      filteredPayments.forEach((payment) => {
        const billDateObj = payment.bill_date ? new Date(payment.bill_date) : null;

        // ✅ Resolve raw integer bill_type (may have a space-prefixed key in some records)
        const rawBillType =
          payment.bill_type != null
            ? payment.bill_type
            : payment[" bill_type"] != null
              ? payment[" bill_type"]
              : null;

        rows.push({
          id: `${admission.ipNumber}-${payment.advance_id}`,
          // display fields
          bill_date: billDateObj
            ? billDateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })
            : "-",
          bill_no: payment.bill_no || "-",
          uhid_no: admission.uhid || "-",
          patient: admission.patient_name || "-",
          advance_amount: payment.advance_amount || 0,
          ipNumber: admission.ipNumber || "-",
          ipserial_number: admission.ipserial_number || "-",
          advance_id: payment.advance_id,
          status: payment.status || "-",
          total: payment.advance_amount || 0,
          source: "IP",
          bill_type: "IP Advance",       // display label (kept for UI)
          bill_type_id: rawBillType,     // ✅ raw integer — sent to backend for CashCounterCollection
        });
      });
    });
    return rows;
  };

  const netAmount = selectedBill?.total || 0;

  const paidAmount =
    (selectedMethods.cash ? parseFloat(payments.cash) || 0 : 0) +
    (selectedMethods.cheque ? parseFloat(payments.cheque) || 0 : 0) +
    (selectedMethods.card ? parseFloat(payments.card) || 0 : 0);

  const balance = netAmount - paidAmount;

  // ✅ UPDATED: reset remarks when opening the modal
  const openPaymentModal = (bill) => {
    // For return bills, ensure the source flag is set so submitPayment routes correctly
    const enrichedBill = activeMenuItem === "Returns Bills"
      ? { ...bill, source: "ReturnBill" }
      : bill;
    setSelectedBill(enrichedBill);
    const totalAmt = parseFloat(bill?.total || 0);
    setSelectedMethods({ cash: true, card: false, cheque: false });
    setPayments({ cash: totalAmt > 0 ? String(totalAmt) : "", cheque: "", chequeNo: "", card: "", cardNo: "" });
    setRemarks(""); // ✅ reset remarks on open
    setModalError("");
    setIsSavingPayment(false);
    setShowPaymentModal(true);
  };

  // ── Fetch pending bills ───────────────────────────────────────────────────────
  // ── Fetch pending bills ───────────────────────────────────────────────────────
  const fetchPendingBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}get_mainblock_pendingbills/`, "GET");
      if (!response?.success) {
        if (!silent) {
          console.error("Pending bills error:", response);
          showToast("error", response?.error || "Unable to connect to HMS server. Please try again.");
        }
        return;
      }

      const billsArray = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const formatted = billsArray.map((item, index) => {
        const dateObj = item.date ? new Date(item.date) : null;
        const billDate = dateObj
          ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" })
          : "-";
        const billTime = dateObj
          ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
          : "-";

        return {
          id: `${item.type}-${item.bill_no}-${index}`,
          date: billDate,
          time: billTime,
          bill_no: item.bill_no || "-",
          raw_bill_no: item.bill_no || null,
          bill_type: item.type || "-",
          raw_bill_type: item.type || null,
          uhid_no: item.uhid || "-",
          patient: item.patient_name || "-",
          amount: parseFloat(item.amount || 0),
          status: item.status || "-",
          raw: item.raw || {},
          Bill_id: item.raw?.patient_id || null,
          uhid: item.uhid || "-",
          total: parseFloat(item.amount || 0),
          source: item.type === "Discharge" ? "IP" : "OP",
        };
      });

      setPendingBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("Pending bills error:", err);
        showToast("error", "Unable to connect to HMS server. Please try again.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Fetch received bills (stub — implement when API is available) ─────────────
  const fetchReceivedBills = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: replace with actual received-bills endpoint when available
      setReceivedBills([]);
    } catch (err) {
      console.error("Received bills error:", err);
      showToast("error", "Unable to load received bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOpPharmacyPendingBills = useCallback(async (silent = false) => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}OPPharmacy_pending_bills/`, "GET");
      if (!response?.success) {
        if (!silent) {
          console.error("OP Pharmacy bills fetch error:", response);
        }
        return;
      }

      const billsArray = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      const billTypeDetails = Array.isArray(response?.data?.allowed_bill_type_details)
        ? response.data.allowed_bill_type_details
        : [];
      if (billTypeDetails.length > 0) {
        setAllowedBillTypes(billTypeDetails);
      }
      if (response?.data?.cashcounter?.counter_id || response?.cashcounter?.counter_id) {
        setCashCounterId(response?.data?.cashcounter?.counter_id || response?.cashcounter?.counter_id);
      }

      // Parse payment_details (JSON or Python OrderedDict string) into structured data
      const parsePaymentDetails = (raw) => {
        if (!raw) return { label: "-", breakdown: null };
        try {
          const parsed = typeof raw === "object" ? raw : JSON.parse(raw);
          const method = parsed?.method || "";
          if (method.toLowerCase().includes("multiple")) {
            const bd = parsed?.breakdown || [];
            return {
              label: "Multiple Payment",
              breakdown: bd.map((b) => ({ method: b.method, amount: b.Paid_amount })),
            };
          }
          const cap = method.charAt(0).toUpperCase() + method.slice(1);
          return { label: cap || "-", breakdown: null };
        } catch {
          // Python OrderedDict string fallback
          const outerMethod = raw.match(/'method',\s*'([^']+)'/)?.[1] || "";
          if (outerMethod.toLowerCase().includes("multiple")) {
            const pairs = [...raw.matchAll(/'method',\s*'([^']+)'[^O]*?'Paid_amount',\s*([\d.]+)/g)];
            // skip the first match (outer Multiple Payment entry), use rest as breakdown
            const bd = pairs.slice(1).map((m) => ({ method: m[1], amount: parseFloat(m[2]) }));
            return { label: "Multiple Payment", breakdown: bd.length ? bd : null };
          }
          const cap = outerMethod.charAt(0).toUpperCase() + outerMethod.slice(1);
          return { label: cap || "-", breakdown: null };
        }
      };

      const formatPharmacyItem = (item, index) => {
        const billDateObj = item.bill_date ? new Date(item.bill_date) : null;
        const billDate = billDateObj
          ? billDateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" })
          : "-";
        const billTime = billDateObj
          ? billDateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
          : "-";
        return {
          id: `pharmacy-${item.Bill_id}-${index}`,
          date: billDate,
          time: billTime,
          Bill_id: item.Bill_id,
          uhid: item.uhid || "-",
          bill_no: item.bill_no || "-",
          bill_type: "OP Pharmacy",
          raw_bill_type: "OPPharmacy",
          uhid_no: item.uhid || "-",
          patient: item.patient_name || "-",
          amount: parseFloat(item.net_amount || 0),
          total: parseFloat(item.net_amount || 0),
          status: item.billing_status || "-",
          doctor: item.doctor_name || "-",
          payment_method: parsePaymentDetails(item.payment_details).label,
          payment_breakdown: parsePaymentDetails(item.payment_details).breakdown,
          source: "OPPharmacy",
          raw_bill_no: item.bill_no || null,
          raw: item,
        };
      };

      const formatted = billsArray
        .filter((item) => item.billing_status === "Billed" || item.billing_status === "Processing")
        .map(formatPharmacyItem);

      const formattedReceived = billsArray
        .filter((item) => item.billing_status === "Paid")
        .map(formatPharmacyItem);

      setOpPharmacyBills(formatted);
      setOpPharmacyReceivedBills(formattedReceived);
    } catch (err) {
      if (!silent) {
        console.error("OP Pharmacy bills fetch error:", err);
        showToast("error", "Unable to load OP Pharmacy bills.");
      }
    }
  }, []);

  const fetchIpAdvancePendingBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}ipadvance_bills/`, "GET");
      const billsArray = Array.isArray(response?.data?.data) ? response.data.data : [];

      if (!billsArray.length && response?.data?.error) {
        if (!silent) showToast("error", "IP Advance API error: " + response.data.error);
        return;
      }

      const formatted = formatIpAdvanceData(billsArray);
      setIpAdvancePendingBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("IP Advance fetch error:", err?.message || err);
        showToast("error", "Failed to load IP Advance data. Please try again.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch IP advance received bills (stub) ────────────────────────────────────
  const fetchIpAdvanceReceivedBills = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: replace with actual IP advance received-bills endpoint when available
      setIpAdvanceReceivedBills([]);
    } catch (err) {
      console.error("IP Advance received bills error:", err);
      showToast("error", "Unable to load IP Advance received bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Return Bills ────────────────────────────────────────────────────────
  const fetchReturnBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_return_bills/`, "GET", {});
      // API returns { status, count, data: [...] }
      // res.data is the response body, so the array is at res.data.data
      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

      const formatDate = (raw) => {
        const d = raw ? new Date(raw) : null;
        return d ? d.toLocaleDateString("en-IN", {
          day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata",
        }) : "-";
      };

      const formatTime = (raw) => {
        const d = raw ? new Date(raw) : null;
        return d ? d.toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
        }) : "-";
      };

      const pending = [];
      const received = [];

      data.forEach((item, idx) => {
        // Use return_bill_date as primary date field
        // hospital_investrefund uses camelCase "refundBillDate" — add it to the fallback chain
        const dateRaw = item.return_bill_date || item.created_date || item.refund_date || item.refundBillDate || null;

        const row = {
          id: item._id || `ret-${idx}`,
          date: formatDate(dateRaw),
          time: formatTime(dateRaw),
          return_bill_no: item.return_bill_no || item.refund_bill_no || item.refundBillNo || "-",
          return_bill_date: formatDate(dateRaw),
          // hospital_investrefund uses "investBillNo" as the original bill number
          bill_no: item.bill_no || item.investBillNo || "-",
          bill_type_name: item.bill_type_name || item.collection_name || "-",
          uhid_no: item.uhid || item.UHID || "-",
          patient: item.patient_name || "-",
          // hospital_investrefund uses "refund_finalPrice" for the amount field
          return_amount: parseFloat(item.return_amount || item.refund_amount || item.refund_finalPrice || item.amount || 0),
          total: parseFloat(item.return_amount || item.refund_amount || item.refund_finalPrice || item.amount || 0),
          // hospital_investrefund uses "paymentStatus" instead of "status" — add it to the fallback chain
          document_status: item.document_status || item.status || item.paymentStatus || "-",
          counter_name: item.counter_name || "-",
          collection_name: item.collection_name || "-",
          raw: item,
        };

        const st = (row.document_status || "").toLowerCase();
        if (st === "pending") pending.push(row);
        else received.push(row);
      });

      setReturnPendingBills(pending);
      setReturnReceivedBills(received);
    } catch (err) {
      if (!silent) {
        console.error("Return bills fetch error:", err);
        showToast("error", "Unable to load Return Bills.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const submitPayment = async () => {
    // ── Return Bills: delegate to dedicated handler ───────────────────────────
    if (selectedBill?.source === "ReturnBill") {
      await submitReturnPayment();
      return;
    }

    setModalError("");

    const activeMethods = [];
    if (selectedMethods.cash && parseFloat(payments.cash) > 0) {
      activeMethods.push({ method: "cash", Paid_amount: parseFloat(payments.cash) });
    }
    if (selectedMethods.card && parseFloat(payments.card) > 0) {
      activeMethods.push({ method: "card", Paid_amount: parseFloat(payments.card), card_no: payments.cardNo });
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0) {
      activeMethods.push({ method: "cheque", Paid_amount: parseFloat(payments.cheque), cheque_no: payments.chequeNo });
    }

    if (activeMethods.length === 0) {
      const msg = "Please enter at least one payment amount.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    // Validate ref numbers based on selected methods
    if (selectedMethods.card && parseFloat(payments.card) > 0 && !payments.cardNo.trim()) {
      const msg = "Please enter the Card / Transaction Reference No to proceed.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0 && !payments.chequeNo.trim()) {
      const msg = "Please enter the Cheque Number to proceed.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    let payment_details;
    if (activeMethods.length === 1) {
      payment_details = activeMethods[0];
    } else {
      payment_details = { method: "Multiple Payment", Paid_amount: paidAmount, breakdown: activeMethods };
    }

    const pendingAmount = Math.max(netAmount - paidAmount, 0);

    if (activeMenuItem === "IP Advance") {
      setIsSavingPayment(true);
      try {
        const payload = {
          ipNumber: selectedBill.ipNumber,
          advance_id: selectedBill.advance_id || null,    // ✅ specific advance being paid
          bill_type: selectedBill.bill_type_id ?? null,  // ✅ raw integer bill_type for CashCounterCollection
          payment_details,
          shiftno: activeShift?.shiftno || "",
          counter_id: cashCounterId,
        };
        const res = await apiRequest(`${HmsBaseUrl}ipadvance_bills/`, "POST", payload);
        const ipRes = res?.data || res;
        if (ipRes?.status === "success" || ipRes?.success) {
          setShowPaymentModal(false);
          fetchIpAdvancePendingBills();
          refreshActiveShift();
          showToast("success", "Payment collected successfully!");
        } else {
          const errMsg = extractErrorMessage(ipRes?.message || ipRes?.error || "Payment failed. Please try again.");
          setModalError(errMsg);
          showToast("error", errMsg);
        }
      } catch (err) {
        console.error("IP Advance submitPayment error:", err);
        const errMsg = "Payment failed. Please check your connection.";
        setModalError(errMsg);
        showToast("error", errMsg);
      } finally {
        setIsSavingPayment(false);
      }
      return;
    }

    // ✅ UPDATED: OPPharmacy payment — now includes remarks if filled
    if (selectedBill.source === "OPPharmacy") {
      setIsSavingPayment(true);
      try {
        const payload = {
          Bill_id: selectedBill.Bill_id,
          uhid: selectedBill.uhid,
          payment_details,
          shiftno: activeShift?.shiftno || "",
          counter_id: cashCounterId,
          "auth-hospital-code": localStorage.getItem("hospital_code") || localStorage.getItem("hospitalId") || "SH001",
          "auth-branch-code": localStorage.getItem("selected_branch") || localStorage.getItem("branch_code") || "SHB001",
          "auth-outlet-code": localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "OLET001",
          "auth-user-id": localStorage.getItem("user_id") || localStorage.getItem("userId") || "",
          // ✅ remarks: only sent if user typed something
          ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
        };
        const res = await apiRequest(`${HmsBaseUrl}collect_oppharmacy_payment/`, "POST", payload);
        const result = res?.data || res;
        if (result?.success || result?.status === "success") {
          setShowPaymentModal(false);
          fetchOpPharmacyPendingBills();
          fetchPendingBills();
          refreshActiveShift();
          showToast("success", "Pharmacy payment collected successfully!");
        } else {
          const errMsg = extractErrorMessage(result?.error || result?.message || "Payment failed. Please try again.");
          setModalError(errMsg);
          showToast("error", errMsg);
        }
      } catch (err) {
        console.error("OPPharmacy submitPayment error:", err);
        const errMsg = "Payment failed. Please check your connection.";
        setModalError(errMsg);
        showToast("error", errMsg);
      } finally {
        setIsSavingPayment(false);
      }
      return;
    }

    const currentBillType = selectedBill.raw_bill_type || selectedBill.bill_type || selectedBill.type || "";
    let statusFields = {};
    if (currentBillType === "Discharge") {
      statusFields = { status: "Paid" };
    } else if (currentBillType === "Investigation") {
      statusFields = { paymentStatus: "Paid" };
    } else if (currentBillType === "Billing") {
      statusFields = { payment_status: "Paid" };
    } else {
      statusFields = { payment_status: "Paid" };
    }

    const payload = {
      bill_no: selectedBill.raw_bill_no || selectedBill.bill_no,
      type: currentBillType,
      bill_category: currentBillType,
      ...statusFields,
      payment_details,
      shiftno: activeShift?.shiftno || "",
      counter_id: cashCounterId,
      ...(pendingAmount > 0 ? { pendingAmount } : {}),
    };

    setIsSavingPayment(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}update_mainblock_pendingbills/`, "POST", payload);
      const billRes = res?.data || res;
      if (billRes?.success || billRes?.status === "success") {
        setShowPaymentModal(false);
        const paidBillNo = selectedBill.raw_bill_no || selectedBill.bill_no;
        // Immediate local state removal for instant UI feedback
        setPendingBills((prev) => prev.filter((b) => (b.raw_bill_no || b.bill_no) !== paidBillNo));
        setOpPharmacyBills((prev) => prev.filter((b) => (b.raw_bill_no || b.bill_no) !== paidBillNo));
        fetchPendingBills();
        fetchOpPharmacyPendingBills();
        refreshActiveShift();
        try {
          localStorage.setItem("hms_last_billing_update", Date.now().toString());
          if (typeof BroadcastChannel !== "undefined") {
            new BroadcastChannel("hms_billing_channel").postMessage({ type: "BILL_PAID", billNo: paidBillNo });
          }
        } catch (e) {}
        showToast("success", "Payment collected successfully!");
      } else {
        const errMsg = extractErrorMessage(billRes?.message || billRes?.error || "Payment failed. Please try again.");
        setModalError(errMsg);
        showToast("error", errMsg);
      }
    } catch (err) {
      console.error("submitPayment error:", err);
      const errMsg = "Payment failed. Please check your connection.";
      setModalError(errMsg);
      showToast("error", errMsg);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // ── Submit payment for Return Bills ──────────────────────────────────────────
  const submitReturnPayment = async () => {
    setModalError("");

    const activeMethods = [];
    if (selectedMethods.cash && parseFloat(payments.cash) > 0) {
      activeMethods.push({ method: "Cash", Paid_amount: parseFloat(payments.cash) });
    }
    if (selectedMethods.card && parseFloat(payments.card) > 0) {
      activeMethods.push({ method: "Card", Paid_amount: parseFloat(payments.card), card_no: payments.cardNo });
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0) {
      activeMethods.push({ method: "Cheque", Paid_amount: parseFloat(payments.cheque), cheque_no: payments.chequeNo });
    }

    if (activeMethods.length === 0) {
      const msg = "Please enter at least one payment amount.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    // Validate ref numbers based on selected methods
    if (selectedMethods.card && parseFloat(payments.card) > 0 && !payments.cardNo.trim()) {
      const msg = "Please enter the Card / Transaction Reference No to proceed.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0 && !payments.chequeNo.trim()) {
      const msg = "Please enter the Cheque Number to proceed.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    let payment_details;
    if (activeMethods.length === 1) {
      payment_details = activeMethods[0];
    } else {
      payment_details = { method: "Multiple Payment", Paid_amount: paidAmount, breakdown: activeMethods };
    }

    const pendingAmount = Math.max(netAmount - paidAmount, 0);

    const payload = {
      uhid: selectedBill.uhid_no,
      bill_no: selectedBill.bill_no,          // original bill_no  ← NEW
      return_bill_no: selectedBill.return_bill_no,
      bill_type: selectedBill.raw?.bill_type,   // integer bill_type from the raw document
      counter_id: cashCounterId,
      shiftno: activeShift?.shiftno || "",
      payment_details,
      ...(pendingAmount > 0 ? { pendingAmount } : {}),
      ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
    };

    setIsSavingPayment(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}collectpayment_return_bills/`, "POST", payload);
      const result = res?.data || res;
      if (result?.status === "success" || result?.success) {
        setShowPaymentModal(false);
        fetchReturnBills();
        refreshActiveShift();
        showToast("success", "Return bill payment processed successfully!");
      } else {
        const errMsg = extractErrorMessage(result?.message || result?.error || "Payment failed. Please try again.");
        setModalError(errMsg);
        showToast("error", errMsg);
      }
    } catch (err) {
      console.error("submitReturnPayment error:", err);
      const errMsg = "Payment failed. Please check your connection.";
      setModalError(errMsg);
      showToast("error", errMsg);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // ── Filter bills ──────────────────────────────────────────────────────────────
  const filterBills = useCallback(() => {
    let bills = [];
    if (activeMenuItem === "Pending Bills") {
      bills = selectedType === "pending" ? [...pendingBills, ...opPharmacyBills] : [...receivedBills, ...opPharmacyReceivedBills];
    } else if (activeMenuItem === "IP Advance") {
      bills =
        selectedType === "pending"
          ? ipAdvancePendingBills
          : ipAdvanceReceivedBills;
    } else if (activeMenuItem === "Returns Bills") {
      bills =
        selectedType === "pending" ? returnPendingBills : returnReceivedBills;
    }

    let filtered = bills;
    if (billType !== "ALL") {
      filtered = filtered.filter((bill) =>
        bill.bill_type
          .toString()
          .toLowerCase()
          .includes(billType.toLowerCase()),
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          (bill.patient || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bill.uhid_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bill.bill_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bill.return_bill_no || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredBills(filtered);
  }, [
    activeMenuItem, selectedType, pendingBills, opPharmacyBills, opPharmacyReceivedBills,
    receivedBills, ipAdvancePendingBills, ipAdvanceReceivedBills,
    returnPendingBills, returnReceivedBills,
    billType, searchTerm,
  ]);

  const handleMenuItemClick = (itemLabel) => {
    setActiveMenuItem(itemLabel);
    setSearchTerm("");
    setSelectedType("pending");

    if (itemLabel === "Pending Bills") {
      fetchPendingBills();
      fetchOpPharmacyPendingBills();
    } else if (itemLabel === "IP Advance") {
      fetchIpAdvancePendingBills();
    } else if (itemLabel === "Returns Bills") {
      fetchReturnBills();
    } else if (itemLabel === "Receipt / Payment") {
      rpFetchAccountHeads();
      rpFetchRecords();
    }
  };

  const handleRefresh = () => {
    if (activeMenuItem === "Pending Bills") {
      if (selectedType === "pending") {
        fetchPendingBills();
        fetchOpPharmacyPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    } else if (activeMenuItem === "Returns Bills") {
      fetchReturnBills();
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchTerm("");

    if (activeMenuItem === "Pending Bills") {
      if (type === "pending") {
        fetchPendingBills();
        fetchOpPharmacyPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (type === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    } else if (activeMenuItem === "Returns Bills") {
      fetchReturnBills();
    }
  };

  const handleShiftDetailsClick = () => {
    setShowShiftDetails(true);
  };

  // ── Load initial data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeMenuItem === "Pending Bills") {
      if (selectedType === "pending") {
        fetchPendingBills();
        fetchOpPharmacyPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    } else if (activeMenuItem === "Returns Bills") {
      fetchReturnBills();
    }
  }, [
    activeMenuItem, selectedType,
    fetchPendingBills, fetchOpPharmacyPendingBills,
    fetchReceivedBills, fetchIpAdvancePendingBills, fetchIpAdvanceReceivedBills,
    fetchReturnBills,
  ]);

  useEffect(() => {
    filterBills();
  }, [filterBills]);

  // ── Auto-refresh pending bills in real time (no manual page reload needed) ────
  useEffect(() => {
    if (selectedType !== "pending") return;

    const pollPendingData = () => {
      // Don't disturb active payment form modal
      if (showPaymentModal) return;

      if (activeMenuItem === "Pending Bills") {
        fetchPendingBills(true);
        fetchOpPharmacyPendingBills(true);
      } else if (activeMenuItem === "IP Advance") {
        fetchIpAdvancePendingBills(true);
      } else if (activeMenuItem === "Returns Bills") {
        fetchReturnBills(true);
      }
    };

    // Auto-poll silently every 3 seconds
    const intervalTimer = setInterval(pollPendingData, 3000);

    // Also auto-refresh whenever the tab or window becomes visible/focused
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        pollPendingData();
      }
    };

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e) => {
      if (e.key === "hms_last_billing_update") {
        pollPendingData();
      }
    };

    // Real-time broadcast channel across tabs/windows
    let channel = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("hms_billing_channel");
        channel.onmessage = () => {
          pollPendingData();
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        try {
          channel.close();
        } catch (e) {}
      }
    };
  }, [
    activeMenuItem,
    selectedType,
    showPaymentModal,
    fetchPendingBills,
    fetchOpPharmacyPendingBills,
    fetchIpAdvancePendingBills,
    fetchReturnBills,
  ]);

  const colSpan =
    activeMenuItem === "Returns Bills"
      ? 10
      : selectedType === "received"
        ? 10  // Doctor + Total + Payment Method, no Action column
        : 8;

  return (
    <Container>
      <MainContent>
        <TopSection>
          <TopGrid>
            {/* ── CARD 1: Shift Reference & Timings ── */}
            <ShiftCard>
              <ShiftCardHeader>
                <ShiftDataLabel><Hash size={13} color="#64748b" /> Shift Ref</ShiftDataLabel>
                <ShiftRefBadge>{activeShift?.shiftno || "—"}</ShiftRefBadge>
              </ShiftCardHeader>

              <ShiftDataRow>
                <ShiftDataLabel><Clock size={12} color="#64748b" /> Start Time</ShiftDataLabel>
                <ShiftDataValue style={shiftBelongsHere ? { color: "#0d9488", fontWeight: 700 } : {}}>
                  {formatShiftDateTime(activeShift?.StartingTime)}
                </ShiftDataValue>
              </ShiftDataRow>

              <ShiftDataRow>
                <ShiftDataLabel><Clock size={12} color="#64748b" /> Close Time</ShiftDataLabel>
                <ShiftDataValue style={!shiftBelongsHere && activeShift?.closingTime ? { color: "#dc2626", fontWeight: 700 } : {}}>
                  {activeShift?.closingTime
                    ? formatShiftDateTime(activeShift.closingTime)
                    : shiftBelongsHere
                      ? "Running…"
                      : "—"}
                </ShiftDataValue>
              </ShiftDataRow>

              <ShiftDataRow>
                <ShiftDataLabel><User size={12} color="#64748b" /> Cashier ID</ShiftDataLabel>
                <ShiftDataValue style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                  {activeShift?.CashierID || "—"}
                </ShiftDataValue>
              </ShiftDataRow>
            </ShiftCard>

            {/* ── CARD 2: Financial Balances & Shift Status ── */}
            <BalancesCard>
              <BalancesHeader>
                <ShiftDataLabel style={{ color: "#0f766e" }}>Cash Overview</ShiftDataLabel>
                <StatusChip $active={activeShift?.ShiftStatus === "active"}>
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: activeShift?.ShiftStatus === "active" ? "#10b981" : "#94a3b8",
                    display: "inline-block"
                  }} />
                  {activeShift?.ShiftStatus ? (activeShift.ShiftStatus.charAt(0).toUpperCase() + activeShift.ShiftStatus.slice(1)) : "Inactive"}
                </StatusChip>
              </BalancesHeader>

              <BalancesGrid>
                <BalanceTile>
                  <BalanceTileLabel>Opening Balance</BalanceTileLabel>
                  <BalanceTileAmount>
                    ₹ {parseFloat(activeShift?.OpeningBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </BalanceTileAmount>
                </BalanceTile>

                <BalanceTile $highlight style={{ background: "#f0fdf4" }}>
                  <BalanceTileLabel $highlight>Closing Balance</BalanceTileLabel>
                  <BalanceTileAmount $highlight>
                    ₹ {parseFloat(activeShift?.ClosingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </BalanceTileAmount>
                </BalanceTile>
              </BalancesGrid>
            </BalancesCard>

            {/* ── CARD 3: Counter Session & Actions ── */}
            <CounterCard>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <ShiftDataRow>
                  <ShiftDataLabel><Layers size={12} color="#64748b" /> Cash Counter</ShiftDataLabel>
                  <ShiftDataValue style={{ fontWeight: 700, color: "#0f172a" }}>
                    {activeShift?.CashCounter || "—"}
                  </ShiftDataValue>
                </ShiftDataRow>

                <ShiftDataRow>
                  <ShiftDataLabel>Branch Code</ShiftDataLabel>
                  <ShiftDataValue>{activeShift?.branch_code || "—"}</ShiftDataValue>
                </ShiftDataRow>

                <ShiftDataRow>
                  <ShiftDataLabel>Session Date</ShiftDataLabel>
                  <ShiftDataValue>{formatSessionDate(activeShift?.date)}</ShiftDataValue>
                </ShiftDataRow>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                {shiftBelongsHere ? (
                  <>
                    <ShiftRunningBanner style={{ margin: 0, padding: "6px 10px", fontSize: "12px", flex: 1 }}>
                      <span className="dot" />
                      Running: <strong>{activeShift.CashierID}</strong>
                    </ShiftRunningBanner>
                    <Button
                      style={{
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                        padding: "7px 14px",
                        fontSize: "12.5px"
                      }}
                      onClick={handleShiftDetailsClick}
                    >
                      ⏹ Stop Counter
                    </Button>
                  </>
                ) : (
                  <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      style={{ padding: "7px 16px", fontSize: "13px" }}
                      onClick={handleShiftDetailsClick}
                    >
                      ▶ Start Counter
                    </Button>
                  </div>
                )}
              </div>
            </CounterCard>
          </TopGrid>
        </TopSection>

        <ContentWrapper>
          <Sidebar>
            {sidebarItems.map((item, index) => {
              const iconMap = {
                "Pending Bills": <CreditCard size={16} />,
                "IP Advance": <CreditCard size={16} />,
                "Returns Bills": <RotateCcw size={16} />,
                "Receipt / Payment": <Search size={16} />,
              };
              return (
                <SidebarButton
                  key={index}
                  active={activeMenuItem === item.label}
                  onClick={() => handleMenuItemClick(item.label)}
                >
                  {iconMap[item.label] || <Search size={16} />}
                  <span>{item.label}</span>
                </SidebarButton>
              );
            })}
          </Sidebar>

          <MainPanel>
            <PanelContent>
              <Title>{activeMenuItem}</Title>

              {/* ══════════════ RECEIPT / PAYMENT PANEL ══════════════ */}
              {activeMenuItem === "Receipt / Payment" &&
                (() => {
                  const rpFilteredRecords = (
                    Array.isArray(rpRecords) ? rpRecords : []
                  ).filter((r) => {
                    const t = rpSearchTerm.toLowerCase();
                    if (!t) return true;
                    return (
                      (r.account_head_details?.name || r.account_head || "")
                        .toLowerCase()
                        .includes(t) ||
                      (r.voucher_no || "").toLowerCase().includes(t) ||
                      (
                        r.description?.patient_name ||
                        r.description?.description ||
                        ""
                      )
                        .toLowerCase()
                        .includes(t)
                    );
                  });
                  const rpDisplayed = rpFilteredRecords.slice(0, parseInt(rpShowEntries, 10));

                  return (
                  <>
                    <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginBottom:16 }}>
                      <Button onClick={rpOpenVoucherModal} style={{ gap:6 }}>
                        <Search size={14} /> View Previous Vouchers
                      </Button>
                      <button
                        onClick={() => setRpShowVoucherForm(prev => !prev)}
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        {rpShowVoucherForm ? "— Voucher" : "+ Voucher"}
                      </button>
                    </div>

                    {rpAlert && (
                      <div style={{
                        padding:"10px 14px", borderRadius:4, marginBottom:14, fontSize:14,
                        backgroundColor: rpAlert.type === "error" ? "#fef2f2" : "#f0fdf4",
                        color: rpAlert.type === "error" ? "#dc2626" : "#166534",
                        border: `1px solid ${rpAlert.type === "error" ? "#fecaca" : "#bbf7d0"}`,
                      }}>
                        {rpAlert.type === "error" ? "⚠️" : "✅"} {rpAlert.msg}
                      </div>
                    )}

                    {rpShowVoucherForm && (
                      <div style={{
                        background:"#f0fafa", border:"1px solid #e5e7eb",
                        borderRadius:6, padding:"14px 16px", marginBottom:16,
                      }}>
                        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", gap:16 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Receipt Type</label>
                            <div style={{ display:"flex", gap:14, alignItems:"center", padding:"7px 0" }}>
                              {["Receipt","Payment"].map((t) => (
                                <label key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, cursor:"pointer" }}>
                                  <input
                                    type="radio" name="rpReceiptType" value={t}
                                    checked={rpReceiptType === t}
                                    onChange={() => setRpReceiptType(t)}
                                    style={{ accentColor:"#0d9488", width:15, height:15 }}
                                  />
                                  {t}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Account Head</label>
                            <Select
                              value={rpSelectedSNo}
                              onChange={(e) => {
                                setRpSelectedSNo(e.target.value);
                                const head = Array.isArray(rpAccountHeads) ? rpAccountHeads.find(h => h["S.No"] === e.target.value) : null;
                                const name = head?.account_head || "";
                                setRpDescFields(
                                  name === "ROOM ACCESS CARD" ? { patient_name:"", room_no:"" }
                                  : name === "MISCELLANEOUS INCOME" ? { description:"" }
                                  : {}
                                );
                              }}
                              style={{ minWidth:200 }}
                            >
                              {rpAccountHeadsLoading && <option value="">Loading...</option>}
                              {!rpAccountHeadsLoading && (!Array.isArray(rpAccountHeads) || rpAccountHeads.length === 0) && (
                                <option value="">No Account Head Available</option>
                              )}
                              {Array.isArray(rpAccountHeads) && rpAccountHeads.map((h) => (
                                <option key={h["S.No"]} value={h["S.No"]}>{h.account_head}</option>
                              ))}
                            </Select>
                          </div>

                          {rpSelectedHeadName === "ROOM ACCESS CARD" && (
                            <>
                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Patient Name</label>
                                <input
                                  type="text" placeholder="Enter patient name"
                                  value={rpDescFields.patient_name || ""}
                                  onChange={(e) => setRpDescFields(p => ({ ...p, patient_name: e.target.value }))}
                                  style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"8px 12px", fontSize:14, minWidth:180 }}
                                />
                              </div>
                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Room No</label>
                                <input
                                  type="text" placeholder="Enter room no"
                                  value={rpDescFields.room_no || ""}
                                  onChange={(e) => setRpDescFields(p => ({ ...p, room_no: e.target.value }))}
                                  style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"8px 12px", fontSize:14, minWidth:120 }}
                                />
                              </div>
                            </>
                          )}

                          {rpSelectedHeadName === "MISCELLANEOUS INCOME" && (
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Description</label>
                              <input
                                type="text" placeholder="Enter description"
                                value={rpDescFields.description || ""}
                                onChange={(e) => setRpDescFields(p => ({ ...p, description: e.target.value }))}
                                style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"8px 12px", fontSize:14, minWidth:220 }}
                              />
                            </div>
                          )}

                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Amount</label>
                            <input
                              type="number" placeholder="0.00" min="0" step="0.01"
                              value={rpAmount}
                              onChange={(e) => setRpAmount(e.target.value)}
                              style={{ border:"1px solid #d1d5db", borderRadius:4, padding:"8px 12px", fontSize:14, minWidth:130 }}
                            />
                          </div>

                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13 }}>&nbsp;</label>
                            <Button onClick={rpHandleSave} disabled={rpSaving} style={{ gap:6 }}>
                              {rpSaving ? <LoadingSpinner /> : "💾"}
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <TableControls>
                      <ControlGroup>
                        <span>Show up to</span>
                        <Select value={rpShowEntries} onChange={(e) => setRpShowEntries(e.target.value)}>
                          {["10","25","50","100"].map(n => <option key={n} value={n}>{n}</option>)}
                        </Select>
                      </ControlGroup>
                      <SearchWrapper>
                        <span>Search:</span>
                        <SearchInputWrapper>
                          <SearchInput
                            type="text" placeholder="Patient Name"
                            value={rpSearchTerm}
                            onChange={(e) => setRpSearchTerm(e.target.value)}
                          />
                          <MicButton><Mic size={14} /></MicButton>
                        </SearchInputWrapper>
                      </SearchWrapper>
                    </TableControls>

                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Account Name ↕</TableHeader>
                          <TableHeader>Voucher ↕</TableHeader>
                          <TableHeader>Receipts ↕</TableHeader>
                          <TableHeader>Payments ↕</TableHeader>
                          <TableHeader>Description ↕</TableHeader>
                          <TableHeader>Action</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {rpLoading ? (
                          <tr><TableCell center muted colSpan={6}>Loading...</TableCell></tr>
                        ) : rpDisplayed.length === 0 ? (
                          <tr><TableCell center muted colSpan={6}>No data available in table</TableCell></tr>
                        ) : (
                          rpDisplayed.map((r, idx) => (
                            <tr key={r._id || r.voucher_no || idx}>
                              <TableCell>{r.account_head_details?.name || r.account_head_name || r.account_head || "—"}</TableCell>
                              <TableCell>{r.voucher_no || "—"}</TableCell>
                              <TableCell>
                                ₹{r.receipt_type === "Receipt"
                                  ? parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits:2 })
                                  : "0.00"}
                              </TableCell>
                              <TableCell>
                                ₹{r.receipt_type === "Payment"
                                  ? parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits:2 })
                                  : "0.00"}
                              </TableCell>
                              <TableCell>
                                {r.description
                                  ? typeof r.description === "object"
                                    ? Object.values(r.description).filter(Boolean).join(", ") || "—"
                                    : r.description
                                  : "—"}
                              </TableCell>
                              <TableCell center>
                                <div style={{ display:"flex", gap:6, justifyContent:"center", alignItems:"center" }}>
                                  <button
                                    title="Print"
                                    onClick={() => setRpPrintVoucher(r)}
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#374151",
                                    }}
                                  >
                                    🖨️
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() => {
                                      if (window.confirm(`Delete voucher ${r.voucher_no}?`)) {
                                        console.log("Delete voucher:", r.voucher_no);
                                      }
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "1.1rem"
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                  }}
                                >
                                  <label
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#374151",
                                    }}
                                  >
                                    Room No
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter room no"
                                    value={rpDescFields.room_no || ""}
                                    onChange={(e) =>
                                      setRpDescFields((p) => ({
                                        ...p,
                                        room_no: e.target.value,
                                      }))
                                    }
                                    style={{
                                      border: "1px solid #d1d5db",
                                      borderRadius: 4,
                                      padding: "8px 12px",
                                      fontSize: 14,
                                      minWidth: 120,
                                    }}
                                  />
                                </div>
                              </TableCell>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>

                    <Pagination>
                      <div>Showing {rpDisplayed.length} of {rpFilteredRecords.length} entries</div>
                      <div>
                        <PaginationButton style={{ marginRight:8 }}>Previous</PaginationButton>
                        <PaginationButton>Next</PaginationButton>
                      </div>
                    </Pagination>

                    {/* ══ Previous Vouchers Modal ══ */}
                    {rpShowVoucherModal && (
                      <ModalOverlay onClick={() => setRpShowVoucherModal(false)}>
                        <ModalContainer style={{ maxWidth: 1000, borderRadius: 8, maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
                          <ModalHeader style={{ background: "#0d6e6e", borderRadius: "8px 8px 0 0", padding: "14px 20px" }}>
                            <ModalTitle style={{ fontSize: 16 }}>Previous Vouchers</ModalTitle>
                            <CloseButton onClick={() => setRpShowVoucherModal(false)}>✕</CloseButton>
                          </ModalHeader>

                          <ModalBody style={{ padding: "0", overflowX: "hidden" }}>
                            {/* Filter Bar */}
                            <div style={{
                              padding: "14px 20px", background: "#f9fafb",
                              borderBottom: "1px solid #e5e7eb",
                              display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
                            }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>From Date</label>
                                <input
                                  type="date" value={pvFromDate}
                                  onChange={(e) => setPvFromDate(e.target.value)}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "7px 10px", fontSize: 13 }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>To Date</label>
                                <input
                                  type="date" value={pvToDate}
                                  onChange={(e) => setPvToDate(e.target.value)}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "7px 10px", fontSize: 13 }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Voucher Type</label>
                                <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "7px 0" }}>
                                  {["All", "Receipt", "Payment"].map((t) => (
                                    <label key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer" }}>
                                      <input
                                        type="radio" name="pvVoucherType" value={t}
                                        checked={pvVoucherType === t}
                                        onChange={() => setPvVoucherType(t)}
                                        style={{ accentColor: "#0d9488" }}
                                      />
                                      {t}
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 13 }}>&nbsp;</label>
                                <button
                                  onClick={() => pvFetchVouchers(pvFromDate, pvToDate, pvVoucherType)}
                                  disabled={rpVoucherLoading}
                                  style={{
                                    background: "#0d9488", color: "white", border: "none",
                                    borderRadius: 4, padding: "8px 18px", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                                  }}
                                >
                                  {rpVoucherLoading ? "⏳" : "🔍"} Fetch
                                </button>
                              </div>
                            </div>

                            {/* Table Area */}
                            <div style={{ padding: "14px 20px" }}>
                              {rpVoucherLoading ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                  <LoadingSpinner />
                                  <p style={{ marginTop: 10, color: "#6b7280" }}>Fetching vouchers...</p>
                                </div>
                              ) : (
                                <>
                                  <div style={{ overflowX: "auto", maxHeight: "45vh" }}>
                                    <Table>
                                      <thead>
                                        <tr>
                                          <TableHeader>Date</TableHeader>
                                          <TableHeader>Time</TableHeader>
                                          <TableHeader>Shift Ref</TableHeader>
                                          <TableHeader>Account Name</TableHeader>
                                          <TableHeader>Voucher No</TableHeader>
                                          <TableHeader>Receipts</TableHeader>
                                          <TableHeader>Payments</TableHeader>
                                          <TableHeader>Description</TableHeader>
                                          <TableHeader>Action</TableHeader>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {pvData.length === 0 ? (
                                          <tr>
                                            <TableCell center muted colSpan={9}>No vouchers found.</TableCell>
                                          </tr>
                                        ) : (
                                          pvData.slice((pvPage - 1) * pvShowEntries, pvPage * pvShowEntries).map((r, idx) => {
                                            const d = r.voucher_date ? new Date(r.voucher_date) : null;
                                            const dateStr = d ? d.toLocaleDateString("en-IN") : "—";
                                            const timeStr = d ? d.toLocaleTimeString("en-IN") : "—";
                                            const isReceipt = r.receipt_type === "Receipt";
                                            const amt = parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
                                            return (
                                              <tr key={r._id || idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                                <TableCell>{dateStr}</TableCell>
                                                <TableCell>{timeStr}</TableCell>
                                                <TableCell>{r.shiftno || "—"}</TableCell>
                                                <TableCell>{r.account_head_details?.name || r.account_head || "—"}</TableCell>
                                                <TableCell>{r.voucher_no || "—"}</TableCell>
                                                <TableCell>₹ {isReceipt ? amt : "0.00"}</TableCell>
                                                <TableCell>₹ {!isReceipt ? amt : "0.00"}</TableCell>
                                                <TableCell>{typeof r.description === 'object' ? Object.values(r.description).join(", ") : (r.description || "—")}</TableCell>
                                                <TableCell center>
                                                  <button
                                                    onClick={() => { setRpShowVoucherModal(false); setRpPrintVoucher(r); }}
                                                    style={{ background: "#0d9488", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
                                                  >
                                                    🖨️
                                                  </button>
                                                </TableCell>
                                              </tr>
                                            );
                                          })
                                        )}
                                      </tbody>
                                      {pvData.length > 0 && (
                                        <tfoot>
                                          <tr style={{ background: "#f3f4f6", fontWeight: 700 }}>
                                            <TableCell colSpan={5} style={{ textAlign: "right" }}>Total:</TableCell>
                                            <TableCell>₹ {pvTotalReceipt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell>₹ {pvTotalPayment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell colSpan={2} />
                                          </tr>
                                        </tfoot>
                                      )}
                                    </Table>
                                  </div>

                                  {/* Pagination & Excel */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                                    <button
                                      onClick={pvExportExcel}
                                      style={{ background: "#f97316", color: "white", border: "none", padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                                    >
                                      📊 Excel Export
                                    </button>

                                    {pvData.length > pvShowEntries && (
                                      <div style={{ display: "flex", gap: 5 }}>
                                        <button disabled={pvPage === 1} onClick={() => setPvPage(p => p - 1)}>Prev</button>
                                        <span>Page {pvPage}</span>
                                        <button disabled={pvPage * pvShowEntries >= pvData.length} onClick={() => setPvPage(p => p + 1)}>Next</button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </ModalBody>

                          <ModalFooterBar>
                            <CancelButton onClick={() => setRpShowVoucherModal(false)}>Close</CancelButton>
                          </ModalFooterBar>
                        </ModalContainer>
                      </ModalOverlay>
                    )}
                    </>
                  );
                })()}
              {/* ══════════════ END RECEIPT / PAYMENT PANEL ══════════════ */}

              {activeMenuItem !== "Receipt / Payment" && (
                <>
                  <ControlsWrapper>
                    <ControlGroup>
                      <Label>Type</Label>
                      <RadioLabel>
                        <RadioInput
                          type="radio"
                          name="billStatus"
                          value="pending"
                          checked={selectedType === "pending"}
                          onChange={(e) => handleTypeChange(e.target.value)}
                        />
                        Pending Bills
                      </RadioLabel>
                      <RadioLabel>
                        <RadioInput
                          type="radio"
                          name="billStatus"
                          value="received"
                          checked={selectedType === "received"}
                          onChange={(e) => handleTypeChange(e.target.value)}
                        />
                        Received Bills
                      </RadioLabel>
                    </ControlGroup>

                    <Button onClick={handleRefresh} disabled={loading}>
                      {loading ? <LoadingSpinner /> : <RotateCcw size={16} />}
                      Refresh
                    </Button>
                  </ControlsWrapper>

                  <TableControls>
                    <ControlGroup>
                      <span>Show up to</span>
                      <Select value={showEntries} onChange={(e) => setShowEntries(e.target.value)}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </Select>
                    </ControlGroup>

                    <SearchWrapper>
                      <span>Search:</span>
                      <SearchInputWrapper>
                        <Search size={15} style={{ position: "absolute", left: 12, color: "#94a3b8", pointerEvents: "none" }} />
                        <SearchInput
                          type="text"
                          placeholder="Patient Name, UHID, or Bill No"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MicButton>
                          <Mic size={14} />
                        </MicButton>
                      </SearchInputWrapper>
                    </SearchWrapper>
                  </TableControls>

                  <div style={{ width: "100%", overflowX: "auto" }}>
                  <Table>
                    <thead>
                      <tr>
                        {activeMenuItem !== "IP Advance" && activeMenuItem !== "Returns Bills" && (
                          <>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Time</TableHeader>
                          </>
                        )}
                        {activeMenuItem === "IP Advance" ? (
                          <>
                            <TableHeader>Bill Date</TableHeader>
                            <TableHeader>Advance Bill No</TableHeader>
                            <TableHeader>UHID No</TableHeader>
                            <TableHeader>Patient Name</TableHeader>
                            <TableHeader>Amount (₹)</TableHeader>
                            <TableHeader>IP Number</TableHeader>
                            <TableHeader>IP Serial</TableHeader>
                            <TableHeader>Status</TableHeader>
                          </>
                        ) : activeMenuItem === "Returns Bills" ? (
                          <>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Time</TableHeader>
                            <TableHeader>Return Bill No</TableHeader>
                            <TableHeader>Bill No</TableHeader>
                            <TableHeader>Bill Type</TableHeader>
                            <TableHeader>UHID</TableHeader>
                            <TableHeader>Patient Name</TableHeader>
                            <TableHeader>Return Amount (₹)</TableHeader>
                            <TableHeader>Status</TableHeader>
                          </>
                        ) : (
                          <>
                            <TableHeader>Bill No</TableHeader>
                            <TableHeader>Bill Type</TableHeader>
                            <TableHeader>UHID No</TableHeader>
                            <TableHeader>Patient</TableHeader>
                            <TableHeader>Amount (₹)</TableHeader>
                            <TableHeader>Status</TableHeader>
                            {selectedType === "received" && (
                              <>
                                <TableHeader>Doctor</TableHeader>
                                <TableHeader>Total</TableHeader>
                                <TableHeader>Payment Method</TableHeader>
                              </>
                            )}
                          </>
                        )}
                        {selectedType === "pending" && <TableHeader>Action</TableHeader>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <TableCell center muted colSpan={colSpan}>
                            <LoadingSpinner /> Loading {selectedType} bills...
                          </TableCell>
                        </tr>
                      ) : filteredBills.length > 0 ? (
                        filteredBills.slice(0, parseInt(showEntries)).map((bill) => (
                          <tr key={bill.id}>
                            {activeMenuItem !== "IP Advance" && activeMenuItem !== "Returns Bills" && (
                              <>
                                <TableCell>{bill.date}</TableCell>
                                <TableCell>{bill.time}</TableCell>
                              </>
                            )}

                            {activeMenuItem === "IP Advance" ? (
                              <>
                                <TableCell>{bill.bill_date}</TableCell>
                                <TableCell>{bill.bill_no}</TableCell>
                                <TableCell>{bill.uhid_no}</TableCell>
                                <TableCell>{bill.patient}</TableCell>
                                <TableCell>₹{(bill.advance_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>{bill.ipNumber}</TableCell>
                                <TableCell>{bill.ipserial_number}</TableCell>
                                <TableCell>
                                  <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    background: bill.status?.toLowerCase() === "pending" ? "#fef3c7" : "#d1fae5",
                                    color: bill.status?.toLowerCase() === "pending" ? "#b45309" : "#065f46",
                                  }}>
                                    {bill.status}
                                  </span>
                                </TableCell>
                              </>
                            ) : activeMenuItem === "Returns Bills" ? (
                              <>
                                <TableCell>{bill.date}</TableCell>
                                <TableCell>{bill.time}</TableCell>
                                <TableCell>{bill.return_bill_no}</TableCell>
                                <TableCell>{bill.bill_no}</TableCell>
                                <TableCell>{bill.bill_type_name}</TableCell>
                                <TableCell>{bill.uhid_no}</TableCell>
                                <TableCell>{bill.patient}</TableCell>
                                <TableCell>₹{(bill.return_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                  <span style={{
                                    padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600,
                                    background: bill.document_status?.toLowerCase() === "pending" ? "#fef3c7" : "#d1fae5",
                                    color: bill.document_status?.toLowerCase() === "pending" ? "#b45309" : "#065f46",
                                  }}>
                                    {bill.document_status}
                                  </span>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{bill.bill_no}</TableCell>
                                <TableCell>{bill.bill_type}</TableCell>
                                <TableCell>{bill.uhid_no}</TableCell>
                                <TableCell>{bill.patient}</TableCell>
                                <TableCell>₹{(bill.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                  <span style={{
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    background: bill.status?.toLowerCase() === "pending" ? "#fef3c7"
                                      : bill.status?.toLowerCase() === "billed" ? "#dbeafe"
                                      : "#d1fae5",
                                    color: bill.status?.toLowerCase() === "pending" ? "#b45309"
                                      : bill.status?.toLowerCase() === "billed" ? "#1d4ed8"
                                      : "#065f46",
                                  }}>
                                    {bill.status}
                                  </span>
                                </TableCell>
                                {selectedType === "received" && (
                                  <>
                                    <TableCell>{bill.doctor}</TableCell>
                                    <TableCell>
                                      {bill.payment_breakdown ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                          {bill.payment_breakdown.map((b, i) => (
                                            <span key={i} style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                                              {b.method.charAt(0).toUpperCase() + b.method.slice(1)}-{b.amount}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span>₹{(bill.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <span style={{
                                        padding: "2px 10px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: bill.payment_method === "Multiple Payment" ? "#ede9fe"
                                          : bill.payment_method === "Cash" ? "#d1fae5"
                                          : bill.payment_method === "Card" ? "#dbeafe"
                                          : bill.payment_method === "Cheque" ? "#fef3c7"
                                          : "#f3f4f6",
                                        color: bill.payment_method === "Multiple Payment" ? "#6d28d9"
                                          : bill.payment_method === "Cash" ? "#065f46"
                                          : bill.payment_method === "Card" ? "#1d4ed8"
                                          : bill.payment_method === "Cheque" ? "#b45309"
                                          : "#374151",
                                      }}>
                                        {bill.payment_method}
                                      </span>
                                    </TableCell>
                                  </>
                                )}
                              </>
                            )}

                            <TableCell>
                              {selectedType === "pending" && (
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <TableCell center style={{ border: "none", padding: 0 }}>
                                    <button
                                      title="Collect Payment"
                                      onClick={() => openPaymentModal(bill)}
                                      style={{
                                        background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                                        color: "white",
                                        border: "none",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        boxShadow: "0 2px 6px rgba(13, 148, 136, 0.25)",
                                        transition: "all 0.2s"
                                      }}
                                    >
                                      <CreditCard size={14} />
                                      <span style={{ fontSize: "12px", fontWeight: 600 }}>Collect</span>
                                    </button>
                                  </TableCell>
                                </div>
                              )}
                            </TableCell>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <TableCell center muted colSpan={colSpan}>
                            {selectedType === "pending" ? "No pending bills found" : "No received bills found"}
                          </TableCell>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  </div>

                  <Pagination>
                    <div>
                      Showing {Math.min(filteredBills.length, parseInt(showEntries))} of{" "}
                      {filteredBills.length} entries
                    </div>
                    <div>
                      <PaginationButton style={{ marginRight: "8px" }}>Previous</PaginationButton>
                      <PaginationButton>Next</PaginationButton>
                    </div>
                  </Pagination>
                </>
              )}
            </PanelContent>
          </MainPanel>
        </ContentWrapper>
      </MainContent>

      <ShiftDetails
        isOpen={showShiftDetails}
        onClose={() => {
          setShowShiftDetails(false);
          refreshActiveShift();
        }}
        outletCode={
          localStorage.getItem("selected_outlet") ||
          localStorage.getItem("outlet_code") ||
          ""
        }
        outletName={
          localStorage.getItem("selected_outlet_name") ||
          localStorage.getItem("selected_outlet") ||
          ""
        }
        onShiftChange={handleShiftChange}
        activeShiftData={activeShift}
        cashCounterId={cashCounterId}
      />

      {/* ══════════════ PAYMENT MODAL ══════════════ */}
      {showPaymentModal && (
        <ModalOverlay>
          <ModalContainer style={{ maxWidth: 560 }}>
            <ModalHeader>
              <ModalTitle>
                {selectedBill?.source === "ReturnBill" ? "💰 Process Refund" : "💳 Collect Payment"}
              </ModalTitle>
              <CloseButton onClick={() => setShowPaymentModal(false)}>✕</CloseButton>
            </ModalHeader>

            <ModalBody>
              <BillInfoCard>
                {activeMenuItem === "IP Advance" ? (
                  <>
                    <BillInfoItem>
                      <BillInfoLabel>Patient</BillInfoLabel>
                      <BillInfoValue>{selectedBill.patient}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>IP Number</BillInfoLabel>
                      <BillInfoValue>{selectedBill.ipNumber}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Bill No</BillInfoLabel>
                      <BillInfoValue>{selectedBill.bill_no}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>UHID</BillInfoLabel>
                      <BillInfoValue>{selectedBill.uhid_no}</BillInfoValue>
                    </BillInfoItem>
                  </>
                ) : selectedBill?.source === "ReturnBill" ? (
                  <>
                    <BillInfoItem>
                      <BillInfoLabel>Return Bill No</BillInfoLabel>
                      <BillInfoValue>{selectedBill.return_bill_no}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Original Bill No</BillInfoLabel>
                      <BillInfoValue>{selectedBill.bill_no}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Patient</BillInfoLabel>
                      <BillInfoValue>{selectedBill.patient}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>UHID</BillInfoLabel>
                      <BillInfoValue>{selectedBill.uhid_no}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Bill Type</BillInfoLabel>
                      <BillInfoValue>{selectedBill.bill_type_name}</BillInfoValue>
                    </BillInfoItem>
                  </>
                ) : (
                  <>
                    <BillInfoItem>
                      <BillInfoLabel>Bill No</BillInfoLabel>
                      <BillInfoValue>{selectedBill.bill_no}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Patient</BillInfoLabel>
                      <BillInfoValue>{selectedBill.patient}</BillInfoValue>
                    </BillInfoItem>
                    <BillInfoItem>
                      <BillInfoLabel>Bill Type</BillInfoLabel>
                      <BillInfoValue>{selectedBill.bill_type}</BillInfoValue>
                    </BillInfoItem>
                  </>
                )}
              </BillInfoCard>

              <NetAmountBanner>
                <span>{selectedBill?.source === "ReturnBill" ? "Return Amount" : "Net Amount"}</span>
                <span>₹ {netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </NetAmountBanner>

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                {["cash", "card", "cheque"].map((method) => (
                  <label
                    key={method}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "8px",
                      border: `2px solid ${selectedMethods[method] ? "#0d9488" : "#e5e7eb"}`,
                      borderRadius: "8px", padding: "10px 12px", cursor: "pointer",
                      background: selectedMethods[method] ? "#f0fdfa" : "#fafafa",
                      fontWeight: 600, fontSize: "14px",
                      color: selectedMethods[method] ? "#0d9488" : "#6b7280",
                      transition: "all 0.2s", userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods[method]}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectedMethods((prev) => ({ ...prev, [method]: isChecked }));

                        if (isChecked) {
                          // Auto-fill this method with the remaining unpaid amount
                          setPayments((prev) => {
                            const alreadyPaid =
                              (method !== "cash" && selectedMethods.cash ? parseFloat(prev.cash) || 0 : 0) +
                              (method !== "card" && selectedMethods.card ? parseFloat(prev.card) || 0 : 0) +
                              (method !== "cheque" && selectedMethods.cheque ? parseFloat(prev.cheque) || 0 : 0);
                            const remaining = Math.max(netAmount - alreadyPaid, 0);
                            return {
                              ...prev,
                              [method]: remaining > 0 ? String(remaining) : "",
                            };
                          });
                        } else {
                          // Clear this method's amount; redistribute remaining to cash if cash is still selected
                          setPayments((prev) => {
                            const clearedPayments = {
                              ...prev,
                              [method]: "",
                              ...(method === "card" ? { cardNo: "" } : {}),
                              ...(method === "cheque" ? { chequeNo: "" } : {}),
                            };
                            // If cash is still active, update cash to cover remaining balance
                            const otherPaid =
                              (method !== "card" && selectedMethods.card ? parseFloat(prev.card) || 0 : 0) +
                              (method !== "cheque" && selectedMethods.cheque ? parseFloat(prev.cheque) || 0 : 0);
                            if (selectedMethods.cash && method !== "cash") {
                              clearedPayments.cash = String(Math.max(netAmount - otherPaid, 0));
                            }
                            return clearedPayments;
                          });
                        }
                      }}
                      style={{ accentColor: "#0d9488", width: "16px", height: "16px" }}
                    />
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </label>
                ))}
              </div>

              {selectedMethods.cash && (
                <PaymentSection>
                  <PaymentMethodLabel>💵 Cash</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.cash}
                      onChange={(e) => setPayments({ ...payments, cash: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {selectedMethods.card && (
                <PaymentSection>
                  <PaymentMethodLabel>💳 Card</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.card}
                      onChange={(e) => {
                        const cardVal = parseFloat(e.target.value) || 0;
                        const chequeVal = selectedMethods.cheque ? parseFloat(payments.cheque) || 0 : 0;
                        const newCash = selectedMethods.cash
                          ? String(Math.max(netAmount - cardVal - chequeVal, 0))
                          : payments.cash;
                        setPayments({ ...payments, card: e.target.value, cash: newCash });
                      }}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Card / Ref No</FormLabel>
                    <SubInput
                      type="text" placeholder="Enter card / transaction ref no"
                      value={payments.cardNo}
                      onChange={(e) => setPayments({ ...payments, cardNo: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {selectedMethods.cheque && (
                <PaymentSection>
                  <PaymentMethodLabel>🏦 Cheque</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.cheque}
                      onChange={(e) => {
                        const chequeVal = parseFloat(e.target.value) || 0;
                        const cardVal = selectedMethods.card ? parseFloat(payments.card) || 0 : 0;
                        const newCash = selectedMethods.cash
                          ? String(Math.max(netAmount - chequeVal - cardVal, 0))
                          : payments.cash;
                        setPayments({ ...payments, cheque: e.target.value, cash: newCash });
                      }}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Cheque No</FormLabel>
                    <SubInput
                      type="text" placeholder="Enter cheque number"
                      value={payments.chequeNo}
                      onChange={(e) => setPayments({ ...payments, chequeNo: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              <SummaryCard>
                <SummaryRow>
                  <span>Net Amount</span>
                  <span>₹ {netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Paid Amount</span>
                  <span>₹ {paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </SummaryRow>
                <SummaryRow bold separator highlight={balance === 0} danger={balance > 0}>
                  <span>{balance > 0 ? "Pending Amount" : "Balance"}</span>
                  <span>₹ {Math.max(balance, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </SummaryRow>
              </SummaryCard>

              {/* ✅ NEW: Remarks field — only shown for OPPharmacy bills */}
              {selectedBill?.source === "OPPharmacy" && (
                <PaymentSection style={{ marginTop: "14px" }}>
                  <PaymentMethodLabel>📝 Remarks (Optional)</PaymentMethodLabel>
                  <textarea
                    placeholder="Enter remarks if any..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    style={{
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "9px 14px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                      fontFamily: "inherit",
                      background: "#fafafa",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0d9488";
                      e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.12)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#fafafa";
                    }}
                  />
                </PaymentSection>
              )}

              {/* In-Modal Error Message */}
              {modalError && (
                <div style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1.5px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>{modalError}</span>
                </div>
              )}
            </ModalBody>

            <ModalFooterBar>
              <CancelButton disabled={isSavingPayment} onClick={() => { setShowPaymentModal(false); setModalError(""); }}>Cancel</CancelButton>
              <SaveButton disabled={paidAmount === 0 || isSavingPayment} onClick={submitPayment}>
                {isSavingPayment
                  ? "Saving Payment..."
                  : (selectedBill?.source === "ReturnBill"
                      ? (balance > 0 ? `Process Refund (₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Pending)` : "Process Refund")
                      : (balance > 0 ? `Save (₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Pending)` : "Save Payment")
                    )
                }
              </SaveButton>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ══════════════ CENTRAL CASH VOUCHER PRINT MODAL ══════════════ */}
      {rpPrintVoucher && (() => {
        const v = rpPrintVoucher;
        const voucherDate = v.voucher_date
          ? new Date(v.voucher_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
          : "—";
        const accountName = v.account_head_details?.name || v.account_head_name || v.account_head || "—";
        const descText = v.description
          ? typeof v.description === "object"
            ? Object.values(v.description).filter(Boolean).join(", ") || "—"
            : v.description
          : "—";
        const amount = parseFloat(v.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
        const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";

        const printVoucher = () => {
          const printWin = window.open("", "_blank", "width=500,height=600");
          printWin.document.write(`
            <html><head><title>Central Cash Voucher</title>
            <style>
              body { font-family: 'Courier New', monospace; margin: 32px; color: #111; }
              h2 { text-align: center; font-size: 16px; letter-spacing: 1px; margin: 0 0 4px; }
              h3 { text-align: center; font-size: 13px; letter-spacing: 2px; margin: 0 0 14px; border-bottom: 1.5px solid #111; padding-bottom: 6px; }
              .row { display: flex; margin: 8px 0; font-size: 13px; }
              .lbl { width: 130px; font-weight: 600; }
              .sep { width: 16px; }
              .val { flex: 1; }
              hr { border: none; border-top: 1px solid #999; margin: 14px 0; }
            </style></head><body>
            <h2>${hospitalName}</h2>
            <h3>CENTRAL CASH VOUCHER</h3>
            <div class="row"><span class="lbl">Voucher No</span><span class="sep">:</span><span class="val">${v.voucher_no || "—"}</span></div>
            <div class="row"><span class="lbl">Voucher Date</span><span class="sep">:</span><span class="val">${voucherDate}</span></div>
            <hr/>
            <div class="row"><span class="lbl">Name</span><span class="sep">:</span><span class="val">${accountName}</span></div>
            <div class="row"><span class="lbl">Remarks</span><span class="sep">:</span><span class="val">${descText}</span></div>
            <hr/>
            <div class="row"><span class="lbl">Amount</span><span class="sep">:</span><span class="val">${amount}</span></div>
            </body></html>
          `);
          printWin.document.close();
          printWin.focus();
          printWin.print();
        };

        return (
          <ModalOverlay onClick={() => setRpPrintVoucher(null)}>
            <ModalContainer style={{ maxWidth: 480, borderRadius: 8 }} onClick={(e) => e.stopPropagation()}>
              <ModalHeader style={{ background: "#0d9488", borderRadius: "8px 8px 0 0" }}>
                <ModalTitle style={{ fontSize: 16 }}>🖨️ Central Cash Voucher</ModalTitle>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={printVoucher}
                    style={{
                      background: "rgba(255,255,255,0.2)", color: "white", border: "none",
                      borderRadius: 6, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    🖨️ Print
                  </button>
                  <CloseButton onClick={() => setRpPrintVoucher(null)}>✕</CloseButton>
                </div>
              </ModalHeader>

              <ModalBody style={{ padding: "28px 36px" }}>
                <div style={{ textAlign: "center", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 15, letterSpacing: 1, marginBottom: 4 }}>
                  {hospitalName}
                </div>
                <div style={{ textAlign: "center", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 2, borderBottom: "1.5px solid #222", paddingBottom: 8, marginBottom: 18 }}>
                  CENTRAL CASH VOUCHER
                </div>
                {[{ label: "Voucher No", value: v.voucher_no || "—" }, { label: "Voucher Date", value: voucherDate }].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", fontFamily: "'Courier New', monospace", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ width: 130, fontWeight: 600 }}>{label}</span>
                    <span style={{ width: 20 }}>:</span>
                    <span>{value}</span>
                  </div>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "12px 0" }} />
                <div style={{ display: "flex", fontFamily: "'Courier New', monospace", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Name</span>
                  <span style={{ width: 20 }}>:</span>
                  <span>{accountName}</span>
                </div>
                <div style={{ display: "flex", fontFamily: "'Courier New', monospace", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Remarks</span>
                  <span style={{ width: 20 }}>:</span>
                  <span>{descText}</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "12px 0" }} />
                <div style={{ display: "flex", fontFamily: "'Courier New', monospace", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Amount</span>
                  <span style={{ width: 20 }}>:</span>
                  <span>{amount}</span>
                </div>
              </ModalBody>

              <ModalFooterBar>
                <CancelButton onClick={() => setRpPrintVoucher(null)}>Close</CancelButton>
                <SaveButton onClick={printVoucher} style={{ background: "#0d9488" }}>🖨️ Print</SaveButton>
              </ModalFooterBar>
            </ModalContainer>
          </ModalOverlay>
        );
      })()}

      {toastState.visible && (
        <ToastWrapper>
          <ToastBox type={toastState.type}>
            <ToastIcon>{toastState.type === "success" ? "✅" : "❌"}</ToastIcon>
            <ToastText>{toastState.message}</ToastText>
          </ToastBox>
        </ToastWrapper>
      )}
    </Container>
  );
}