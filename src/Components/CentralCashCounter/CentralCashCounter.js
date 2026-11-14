import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, RotateCcw, CreditCard, Hash, Plus, Minus, Eye } from "lucide-react";
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
  padding: 16px 20px;
  max-width: 1600px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02);
  padding: 12px 20px;
  margin-bottom: 20px;
  transition: all 0.25s ease;
`;

const ShiftSummaryBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ShiftSummaryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
`;

const ShiftItemBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ShiftItemLabel = styled.span`
  color: #64748b;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const ShiftItemRef = styled.span`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #38bdf8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13.5px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  letter-spacing: 0.04em;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
`;

const ShiftCollectedAmount = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #0d9488;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
`;

const ShiftItemDivider = styled.div`
  width: 1px;
  height: 32px;
  background: #e2e8f0;
  margin: 0 4px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${(props) => (props.$active ? "#d1fae5" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#065f46" : "#64748b")};
  border: 1px solid ${(props) => (props.$active ? "#a7f3d0" : "#e2e8f0")};
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.08);
`;

const ShiftSummaryRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  color: white;
  padding: 9px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 10px rgba(13, 148, 136, 0.25);
  width: fit-content;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(13, 148, 136, 0.35);
    filter: brightness(1.04);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModuleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
`;

const ModuleTabBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 12px 20px 0;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  box-shadow: 0 2px 12px rgba(15, 118, 110, 0.25);
  flex-wrap: wrap;
`;

const ModuleTabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  font-size: 0.88rem;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  position: relative;
  letter-spacing: 0.01em;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255, 255, 255, 0.14)")};
  color: ${({ $active }) => ($active ? "#0f766e" : "rgba(255, 255, 255, 0.92)")};
  box-shadow: ${({ $active }) =>
    $active ? "0 -2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(15,118,110,0.10)" : "none"};

  &:hover {
    background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255, 255, 255, 0.24)")};
    color: ${({ $active }) => ($active ? "#0f766e" : "#ffffff")};
  }

  svg {
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  ${({ $active }) =>
    $active &&
    `&::before {
      content: '';
      position: absolute;
      top: 0; left: 12px; right: 12px;
      height: 3px;
      background: linear-gradient(90deg, #0f766e, #14b8a6);
      border-radius: 0 0 4px 4px;
    }`}
`;

const MainPanel = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 0;
  border: none;
  overflow: hidden;
`;

const PanelContent = styled.div`
  padding: 22px 26px;
`;

const Title = styled.h2`
  font-size: 21px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
`;

const ControlsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  padding: 14px 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Select = styled.select`
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 110px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  background-color: #ffffff;
  outline: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
`;

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

  &:hover {
    border-color: #0d9488;
    background: #f0fdfa;
    color: #0f766e;
  }

  &:has(input:checked) {
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
    border-color: #0f766e;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(13, 148, 136, 0.28);
    font-weight: 700;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  accent-color: #0d9488;
  cursor: pointer;
  width: 15px;
  height: 15px;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13.5px;
  color: #64748b;
  font-weight: 600;
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
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 9px 40px 9px 38px;
  min-width: 320px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);

  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
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
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4px 18px -4px rgba(15, 23, 42, 0.04);
`;

const TableHeader = styled.th`
  border: none;
  border-bottom: 2px solid #e2e8f0;
  padding: 10px 10px;
  text-align: ${(props) => (props.align ? props.align : props.center ? "center" : props.right ? "right" : "left")};
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 700;
  font-size: 11px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  vertical-align: middle;
`;

const TableCell = styled.td`
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 9px 10px;
  text-align: ${(props) => (props.align ? props.align : props.center ? "center" : props.right ? "right" : "left")};
  color: ${(props) => (props.muted ? "#64748b" : "#1e293b")};
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  vertical-align: middle;
  transition: background-color 0.15s ease;

  tr:last-child & {
    border-bottom: none;
  }

  tr:hover & {
    background-color: #f0fdfa;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 13.5px;
  color: #64748b;
  font-weight: 600;
`;

const PaginationButton = styled.button`
  padding: 8px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  color: #334155;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);

  &:hover:not(:disabled) {
    border-color: #0d9488;
    color: #0d9488;
    background-color: #f0fdfa;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(13, 148, 136, 0.15);
  }

  &:disabled {
    opacity: 0.45;
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
  max-width: 620px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
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
  flex: 1;
  overflow-y: auto;
  padding: 14px 20px;
`;

const BillInfoCard = styled.div`
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 8px;
  padding: 8px 14px;
  margin-bottom: 10px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const BillInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const BillInfoLabel = styled.span`
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  font-weight: 600;
`;

const BillInfoValue = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: #0d9488;
`;

const NetAmountBanner = styled.div`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-radius: 8px;
  padding: 9px 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
`;

const PaymentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
`;

const PaymentMethodLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 4px;
  padding-left: 2px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;

const FormLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  padding: 6px 12px;
  font-size: 13.5px;
  width: 100%;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fafafa;

  /* Hide number input spinners and avoid accidental wheel changes */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }

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
  font-size: 12.5px;
`;

const SummaryCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 14px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: ${(props) =>
    props.highlight ? "#0d9488" : props.danger ? "#dc2626" : "#374151"};
  font-weight: ${(props) => (props.bold ? "700" : "500")};
  ${(props) =>
    props.separator &&
    `
    border-top: 1px solid #e5e7eb;
    padding-top: 5px;
    margin-top: 2px;
  `}
`;

const ModalFooterBar = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 7px;
  font-size: 14px;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1.5px solid #a7f3d0;
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #047857;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);

  span.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 1.6s ease-in-out infinite;
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
      opacity: 0.45;
      transform: scale(1.35);
    }
  }
`;

export default function CentralCashCounter() {
  const navigate = useNavigate();
  const [billType, setBillType] = useState("ALL");
  const [showEntries, setShowEntries] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("pending");
  const [activeMenuItem, setActiveMenuItem] = useState("Pending Bills");
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [pendingBills, setPendingBills] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [receivedBills, setReceivedBills] = useState([]);
  const [ipAdvancePendingBills, setIpAdvancePendingBills] = useState([]);
  const [ipAdvanceUnpaidBills, setIpAdvanceUnpaidBills] = useState([]);
  const [ipAdvanceReceivedBills, setIpAdvanceReceivedBills] = useState([]);
  const [opPharmacyBills, setOpPharmacyBills] = useState([]);
  const [opPharmacyUnpaidBills, setOpPharmacyUnpaidBills] = useState([]);
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
      toast.success(text, { autoClose: 2000, pauseOnHover: false });
    } else {
      toast.error(text, { autoClose: 2500, pauseOnHover: false });
    }
    setToastState({ visible: true, type, message: text });
    setTimeout(() => setToastState({ visible: false, type: "", message: "" }), 2000);
  };

  const [filteredBills, setFilteredBills] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [selectedMethods, setSelectedMethods] = useState({
    cash: false,
    card: false,
    cheque: false,
    credit: false,
  });
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [payments, setPayments] = useState({
    cash: "",
    cheque: "",
    chequeNo: "",
    card: "",
    cardNo: "",
    credit: "",
  });

  // ✅ NEW: Remarks state for OPPharmacy payment
  const [remarks, setRemarks] = useState("");

  const [activeShift, setActiveShift] = useState(null);

  // ── Helper to reliably parse UTC datetimes into local Indian Time (IST) Date objects
  const parseUtcDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    const str = String(val).trim();
    if (!str || str === "-" || str === "null" || str === "undefined") return null;
    // If ISO timestamp without explicit timezone indicator (no 'Z' and no offset like +05:30), append 'Z' so it treats as UTC
    if (str.includes("T") && !str.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      return new Date(str + "Z");
    }
    return new Date(str);
  };

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

  // ── In-flight request lock refs (prevent duplicate concurrent requests) ──────
  const isFetchingIpAdvanceRef = useRef(false);
  const isPollingRef = useRef(false);

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
      else if (Array.isArray(res?.data)) list = res.data;
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

  const handleShiftChange = async (shiftData) => {
    if (!shiftData) {
      setActiveShift(null);
      setPendingBills([]);
      setOpPharmacyBills([]);
      setOpPharmacyUnpaidBills([]);
      setOpPharmacyReceivedBills([]);
      setFilteredBills([]);
      await refreshActiveShift();
      return;
    }
    const clean = shiftData?.data?.shiftno ? shiftData.data : (shiftData?.shiftno ? shiftData : null);
    if (clean && clean.shiftno && (clean.is_active === true || clean.is_active === "true") && clean.ShiftStatus === "active") {
      setActiveShift(clean);
      if (clean.CashCounter) {
        setCashCounterId(clean.CashCounter);
      }
      const outlet = clean.SelectedOutlet || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
      const isOp = clean.CashCounter === "CC0002" || outlet === "OLET002";
      if (isOp) {
        fetchOpPharmacyPendingBills();
      } else {
        fetchPendingBills();
      }
    } else if (shiftData?.is_active === false) {
      setActiveShift(null);
      setPendingBills([]);
      setOpPharmacyBills([]);
      setOpPharmacyUnpaidBills([]);
      setOpPharmacyReceivedBills([]);
      setFilteredBills([]);
    }
    await refreshActiveShift();
  };

  const shiftBelongsHere = !!(activeShift && (activeShift.is_active === true || activeShift.is_active === "true") && activeShift.ShiftStatus === "active");

  const sidebarItems = [
    { label: "Pending Bills", id: "pending-bills" },
    { label: "IP Advance", id: "ip-advance" },
    { label: "Returns Bills", id: "Returns Bills" },
    { label: "Receipt / Payment", id: "receipt-payment" },
  ];

  const refreshActiveShift = useCallback(async () => {
    try {
      const outletCode = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
      const userEmpId = localStorage.getItem("user_id") || localStorage.getItem("employee_id") || localStorage.getItem("employeeId") || "";
      const res = await apiRequest(
        `${HmsBaseUrl}get_active_shift/`,
        "POST",
        {
          CashCounter: cashCounterId || outletCode,
          "auth-user-id": userEmpId,
          "auth-outlet-code": outletCode,
        }
      );
      const resData = res?.data;
      if (res?.success && resData?.success && resData?.data && (resData.data.is_active === true || resData.data.is_active === "true") && resData.data.ShiftStatus === "active") {
        if (resData.cashcounter?.counter_id && resData.cashcounter.counter_id !== cashCounterId) {
          setCashCounterId(resData.cashcounter.counter_id);
        }
        if (resData.allowed_bill_type_details?.length) {
          setAllowedBillTypes(resData.allowed_bill_type_details);
        }
        setActiveShift(resData.data);
      } else if (res?.success && (resData?.shift_active === false || resData?.data?.is_active === false || resData?.data?.ShiftStatus === "closed")) {
        if (resData?.cashcounter?.counter_id && resData.cashcounter.counter_id !== cashCounterId) {
          setCashCounterId(resData.cashcounter.counter_id);
        }
        if (resData?.allowed_bill_type_details?.length) {
          setAllowedBillTypes(resData.allowed_bill_type_details);
        }
        setActiveShift(null);
        setPendingBills([]);
        setOpPharmacyBills([]);
        setOpPharmacyUnpaidBills([]);
        setOpPharmacyReceivedBills([]);
        setFilteredBills([]);
      }
    } catch (err) {
      console.error("Failed to refresh active shift:", err);
    }
  }, [cashCounterId]);

  useEffect(() => {
    refreshActiveShift();
  }, [refreshActiveShift]);



  const formatBillData = (billsArray) => {
    return billsArray.map((item, index) => {
      // unique fallback id
      const id = item.id ?? `temp-${index}-${Date.now()}`;

      // ✅ use bill_date only
      const billDateObj = parseUtcDate(item.bill_date);

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
    const isPaidFilter =
      statusFilter.toLowerCase() === "paid" || statusFilter.toLowerCase() === "received";

    admissionsArray.forEach((admission) => {
      const payments = admission.advance_payments || [];
      // Filter based on status (pending or paid)
      const filteredPayments = payments.filter((p) => {
        if (!p.is_advanceActive) return false;
        const pStatus = String(p.status || "").toLowerCase();
        if (isPaidFilter) {
          return pStatus === "paid" || pStatus === "received";
        }
        return pStatus === "pending";
      });
      if (filteredPayments.length === 0) return;

      filteredPayments.forEach((payment) => {
        const rawDate = isPaidFilter
          ? (payment.paid_datetime || payment.paid_date || payment.bill_date || payment.date)
          : (payment.bill_date || payment.date);
        const billDateObj = parseUtcDate(rawDate);

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
          date: billDateObj
            ? billDateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })
            : "-",
          time: billDateObj
            ? billDateObj.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              })
            : "-",
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
          doctor: admission.admittingDoctor || admission.consultingDoctor || "-",
          payment_method: payment.payment_details?.method || payment.payment_method || (payment.payment_details ? Object.keys(payment.payment_details).filter(k => payment.payment_details[k] > 0).join(", ") : "-"),
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
    (selectedMethods.card ? parseFloat(payments.card) || 0 : 0) +
    (selectedMethods.credit ? parseFloat(payments.credit) || 0 : 0);

  const balance = netAmount - paidAmount;

  // ✅ UPDATED: reset remarks and payment modes when opening the modal
  const openPaymentModal = (bill) => {
    // For return bills, ensure the source flag is set so submitPayment routes correctly
    const enrichedBill = activeMenuItem === "Returns Bills"
      ? { ...bill, source: "ReturnBill" }
      : bill;
    setSelectedBill(enrichedBill);
    const totalAmt = parseFloat(bill?.total || 0);
    setIsMultipleMode(false);
    setSelectedMethods({ cash: true, card: false, cheque: false, credit: false });
    setPayments({
      cash: totalAmt > 0 ? String(totalAmt) : "",
      cheque: "",
      chequeNo: "",
      card: "",
      cardNo: "",
      credit: "",
    });
    setRemarks(""); // ✅ reset remarks on open
    setModalError("");
    setIsSavingPayment(false);
    setShowPaymentModal(true);
  };

  // ── Select a SINGLE payment method (auto-fills 100% Net Amount) ─────────────
  const handleSelectSingleMethod = (method) => {
    setIsMultipleMode(false);
    setSelectedMethods({
      cash: method === "cash",
      card: method === "card",
      cheque: method === "cheque",
      credit: method === "credit",
    });
    setPayments((prev) => ({
      cash: method === "cash" ? (netAmount > 0 ? String(netAmount) : "") : "",
      card: method === "card" ? (netAmount > 0 ? String(netAmount) : "") : "",
      cardNo: prev.cardNo,
      cheque: method === "cheque" ? (netAmount > 0 ? String(netAmount) : "") : "",
      chequeNo: prev.chequeNo,
      credit: method === "credit" ? (netAmount > 0 ? String(netAmount) : "") : "",
    }));
  };

  // ── Toggle payment method in MULTIPLE payment mode ──────────────────────────
  const handleToggleMultipleMethod = (method, isChecked) => {
    const nextSelected = { ...selectedMethods, [method]: isChecked };
    const checkedKeys = Object.keys(nextSelected).filter((m) => nextSelected[m]);

    // Don't allow 0 methods
    if (checkedKeys.length === 0) {
      handleSelectSingleMethod(method);
      return;
    }

    // If exactly 1 method is left, revert to single method mode with 100% amount
    if (checkedKeys.length === 1) {
      handleSelectSingleMethod(checkedKeys[0]);
      return;
    }

    // 2 or more methods active: activate multiple mode
    setIsMultipleMode(true);
    setSelectedMethods(nextSelected);

    setPayments((prev) => {
      const nextPayments = { ...prev };
      if (!isChecked) {
        // Method was unchecked: clear its amount
        nextPayments[method] = "";
        if (method === "card") nextPayments.cardNo = "";
        if (method === "cheque") nextPayments.chequeNo = "";

        // Reallocate the cleared balance to the primary active method
        const primary = checkedKeys.includes("cash") ? "cash" : checkedKeys[0];
        const otherAllocated = checkedKeys
          .filter((m) => m !== primary)
          .reduce((sum, m) => sum + (parseFloat(nextPayments[m]) || 0), 0);
        nextPayments[primary] = String(Math.max(netAmount - otherAllocated, 0));
      } else {
        // Method was newly checked: calculate remaining unallocated balance
        const otherAllocated = checkedKeys
          .filter((m) => m !== method)
          .reduce((sum, m) => sum + (parseFloat(nextPayments[m]) || 0), 0);
        const remaining = Math.max(netAmount - otherAllocated, 0);
        nextPayments[method] = remaining > 0 ? String(remaining) : "";
      }
      return nextPayments;
    });
  };

  // ── Toggle Multiple Payment mode on/off ──────────────────────────────────────
  const handleToggleMultipleMode = (enabled) => {
    setIsMultipleMode(enabled);
    if (!enabled) {
      // Switching back to single: keep the first active method (or cash)
      const activeKeys = Object.keys(selectedMethods).filter((m) => selectedMethods[m]);
      const primary = activeKeys.includes("cash") ? "cash" : (activeKeys[0] || "cash");
      handleSelectSingleMethod(primary);
    }
  };

  // ── Smart amount change with 2-method auto-balancing ─────────────────────────
  const handlePaymentAmountChange = (method, rawValue) => {
    setPayments((prev) => {
      const next = { ...prev, [method]: rawValue };
      const checkedKeys = Object.keys(selectedMethods).filter((m) => selectedMethods[m]);

      // If exactly 2 methods are active and a valid number was typed:
      // auto-balance the other method so total = netAmount
      if (checkedKeys.length === 2 && rawValue !== "") {
        const otherMethod = checkedKeys.find((m) => m !== method);
        const enteredVal = parseFloat(rawValue) || 0;
        if (enteredVal <= netAmount) {
          const autoBalance = Math.max(netAmount - enteredVal, 0);
          next[otherMethod] = String(autoBalance);
        }
      }
      return next;
    });
  };

  // ── Helper: Apply remaining balance to a target method ───────────────────────
  const applyRemainingToMethod = (targetMethod) => {
    const checkedKeys = Object.keys(selectedMethods).filter((m) => selectedMethods[m]);
    const otherAllocated = checkedKeys
      .filter((m) => m !== targetMethod)
      .reduce((sum, m) => sum + (parseFloat(payments[m]) || 0), 0);
    const remaining = Math.max(netAmount - otherAllocated, 0);
    setPayments((prev) => ({
      ...prev,
      [targetMethod]: String(remaining),
    }));
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

      const billTypeDetails = Array.isArray(response?.data?.allowed_bill_type_details)
        ? response.data.allowed_bill_type_details
        : Array.isArray(response?.allowed_bill_type_details)
        ? response.allowed_bill_type_details
        : [];
      if (billTypeDetails.length > 0) {
        setAllowedBillTypes(billTypeDetails);
      }

      const formatted = billsArray.map((item, index) => {
        const rawDate = item.billed_date || item.raw?.billed_date || item.raw?.investBillDate || item.raw?.bill_date || item.date || item.raw?.created_date;
        const dateObj = parseUtcDate(rawDate);
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
          bill_type: item.bill_type || item.bill_type_name || item.type || "-",
          raw_bill_type: item.type || null,
          bill_type_id: item.bill_type_id || item.raw?.bill_type,
          uhid_no: item.uhid || item.raw?.uhid || "-",
          patient: item.patient_name || item.raw?.patient_name || item.raw?.patient || "-",
          amount: parseFloat(item.amount || 0),
          status: item.status || "-",
          doctor: item.doctor || item.doctor_name || item.raw?.doctor_name || item.raw?.doctor || "-",
          total: parseFloat(item.total || item.amount || 0),
          payment_method: item.payment_method || item.raw?.payment_method || item.raw?.payment_details?.method || "-",
          payment_breakdown: item.payment_breakdown || item.payment_details?.breakdown || item.raw?.payment_details?.breakdown || null,
          raw: item.raw || {},
          Bill_id: item.raw?.patient_id || null,
          uhid: item.uhid || item.raw?.uhid || "-",
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

  // ── Fetch unpaid bills ───────────────────────────────────────────────────────
  const fetchUnpaidBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}get_mainblock_pendingbills/?status=unpaid`, "GET");
      if (!response?.success) {
        if (!silent) {
          console.error("Unpaid bills error:", response);
          showToast("error", response?.error || "Unable to connect to HMS server. Please try again.");
        }
        return;
      }

      const billsArray = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const billTypeDetails = Array.isArray(response?.data?.allowed_bill_type_details)
        ? response.data.allowed_bill_type_details
        : Array.isArray(response?.allowed_bill_type_details)
        ? response.allowed_bill_type_details
        : [];
      if (billTypeDetails.length > 0) {
        setAllowedBillTypes(billTypeDetails);
      }

      const formatted = billsArray.map((item, index) => {
        const rawDate = item.billed_date || item.raw?.billed_date || item.raw?.investBillDate || item.raw?.bill_date || item.date || item.raw?.created_date;
        const dateObj = parseUtcDate(rawDate);
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
          bill_type: item.bill_type || item.bill_type_name || item.type || "-",
          raw_bill_type: item.type || null,
          bill_type_id: item.bill_type_id || item.raw?.bill_type,
          uhid_no: item.uhid || item.raw?.uhid || "-",
          patient: item.patient_name || item.raw?.patient_name || item.raw?.patient || "-",
          amount: parseFloat(item.amount || 0),
          status: item.status || "-",
          doctor: item.doctor || item.doctor_name || item.raw?.doctor_name || item.raw?.doctor || "-",
          total: parseFloat(item.total || item.amount || 0),
          payment_method: item.payment_method || item.raw?.payment_method || item.raw?.payment_details?.method || "-",
          payment_breakdown: item.payment_breakdown || item.payment_details?.breakdown || item.raw?.payment_details?.breakdown || null,
          raw: item.raw || {},
          Bill_id: item.raw?.patient_id || null,
          uhid: item.uhid || item.raw?.uhid || "-",
          source: item.type === "Discharge" ? "IP" : "OP",
        };
      });

      setUnpaidBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("Unpaid bills error:", err);
        showToast("error", "Unable to connect to HMS server. Please try again.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Fetch received bills ─────────────────────────────────────────────────────
  const fetchReceivedBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}get_mainblock_pendingbills/?status=paid`, "GET");
      if (response?.success && response?.data) {
        const billsArray = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        const billTypeDetails = Array.isArray(response?.data?.allowed_bill_type_details)
          ? response.data.allowed_bill_type_details
          : Array.isArray(response?.allowed_bill_type_details)
          ? response.allowed_bill_type_details
          : [];
        if (billTypeDetails.length > 0) {
          setAllowedBillTypes(billTypeDetails);
        }

        const formatted = billsArray.map((item, index) => {
          const rawDate = item.paid_date || item.raw?.paid_date || item.raw?.paid_at || item.date || item.billed_date || item.raw?.billed_date;
          const dateObj = parseUtcDate(rawDate);
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
            bill_type: item.bill_type || item.bill_type_name || item.type || "-",
            raw_bill_type: item.type || null,
            bill_type_id: item.bill_type_id || item.raw?.bill_type,
            uhid_no: item.uhid || item.raw?.uhid || "-",
            patient: item.patient_name || item.raw?.patient_name || item.raw?.patient || "-",
            amount: parseFloat(item.amount || 0),
            status: item.status || "-",
            doctor: item.doctor || item.doctor_name || item.raw?.doctor_name || item.raw?.doctor || "-",
            total: parseFloat(item.total || item.amount || 0),
            payment_method: item.payment_method || item.raw?.payment_method || item.raw?.payment_details?.method || "-",
            payment_breakdown: item.payment_breakdown || item.payment_details?.breakdown || item.raw?.payment_details?.breakdown || null,
            raw: item.raw || {},
            Bill_id: item.raw?.patient_id || null,
            uhid: item.uhid || item.raw?.uhid || "-",
            source: item.type === "Discharge" ? "IP" : "OP",
          };
        });

        setReceivedBills(formatted);
      } else {
        setReceivedBills([]);
      }
    } catch (err) {
      if (!silent) {
        console.error("Received bills error:", err);
        showToast("error", "Unable to load received bills.");
      }
    } finally {
      if (!silent) setLoading(false);
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
        const rawDate = item.billing_status === "Paid"
          ? (item.paid_date || item.paid_datetime || item.lastmodified_date || item.bill_date)
          : (item.bill_date || item.created_date);
        const billDateObj = parseUtcDate(rawDate);
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

      const isCurrentDate = (item) => {
        if (typeof item.is_current_date === "boolean") return item.is_current_date;
        const rawDate = item.billing_status === "Paid"
          ? (item.paid_date || item.paid_datetime || item.lastmodified_date || item.bill_date)
          : (item.bill_date || item.created_date);
        if (!rawDate) return false;
        const bDate = new Date(rawDate);
        if (isNaN(bDate.getTime())) return false;
        const todayStr = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
        const billStr = bDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
        return todayStr === billStr;
      };

      const isUnpaidStatus = (status) =>
        status === "Billed" || status === "Processing" || status === "Pending";

      const formattedPending = billsArray
        .filter((item) => item.is_pending === true || (isUnpaidStatus(item.billing_status) && isCurrentDate(item)))
        .map(formatPharmacyItem);

      const formattedUnpaid = billsArray
        .filter((item) => item.is_unpaid === true || (isUnpaidStatus(item.billing_status) && !isCurrentDate(item)))
        .map(formatPharmacyItem);

      const formattedReceived = billsArray
        .filter((item) => item.is_received === true || (item.billing_status === "Paid" && isCurrentDate(item)))
        .map(formatPharmacyItem);

      setOpPharmacyBills(formattedPending);
      setOpPharmacyUnpaidBills(formattedUnpaid);
      setOpPharmacyReceivedBills(formattedReceived);
    } catch (err) {
      if (!silent) {
        console.error("OP Pharmacy bills fetch error:", err);
        showToast("error", "Unable to load OP Pharmacy bills.");
      }
    }
  }, []);

  const fetchIpAdvancePendingBills = useCallback(async (silent = false) => {
    if (isFetchingIpAdvanceRef.current) return;
    isFetchingIpAdvanceRef.current = true;
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}ipadvance_bills/?status=pending`, "GET");
      const billsArray = Array.isArray(response?.data?.data) ? response.data.data : [];

      if (!billsArray.length && response?.data?.error) {
        if (!silent) showToast("error", "IP Advance API error: " + response.data.error);
        return;
      }

      const formatted = formatIpAdvanceData(billsArray, "pending");
      setIpAdvancePendingBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("IP Advance fetch error:", err?.message || err);
        showToast("error", "Failed to load IP Advance data. Please try again.");
      }
    } finally {
      isFetchingIpAdvanceRef.current = false;
      if (!silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIpAdvanceUnpaidBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}ipadvance_bills/?status=unpaid`, "GET");
      const billsArray = Array.isArray(response?.data?.data) ? response.data.data : [];

      if (!billsArray.length && response?.data?.error) {
        if (!silent) showToast("error", "IP Advance API error: " + response.data.error);
        return;
      }

      const formatted = formatIpAdvanceData(billsArray, "pending");
      setIpAdvanceUnpaidBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("IP Advance unpaid bills error:", err?.message || err);
        showToast("error", "Failed to load IP Advance unpaid bills.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch IP advance received bills ───────────────────────────────────────────
  const fetchIpAdvanceReceivedBills = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}ipadvance_bills/?status=paid`, "GET");
      const billsArray = Array.isArray(response?.data?.data) ? response.data.data : [];
      const formatted = formatIpAdvanceData(billsArray, "paid");
      setIpAdvanceReceivedBills(formatted);
    } catch (err) {
      if (!silent) {
        console.error("IP Advance received bills error:", err);
        showToast("error", "Unable to load IP Advance received bills.");
      }
    } finally {
      if (!silent) setLoading(false);
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

    // Exact amount validation: do not allow excess or low amount
    if (Math.abs(paidAmount - netAmount) > 0.01) {
      const msg = paidAmount < netAmount
        ? `Entered amount (₹${paidAmount.toLocaleString('en-IN')}) is less than Net Amount (₹${netAmount.toLocaleString('en-IN')}). Low amount / partial payment is not allowed.`
        : `Entered amount (₹${paidAmount.toLocaleString('en-IN')}) is greater than Net Amount (₹${netAmount.toLocaleString('en-IN')}). Excess payment is not allowed.`;
      setModalError(msg);
      showToast("error", msg);
      return;
    }

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
    if (selectedMethods.credit && parseFloat(payments.credit) > 0) {
      activeMethods.push({ method: "credit", Paid_amount: parseFloat(payments.credit) });
    }

    if (activeMethods.length === 0) {
      const msg = "Please enter at least one payment amount.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    // Validate ref numbers based on selected methods (Card/Ref No is not mandatory)
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

    const pendingAmount = 0;

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
          await fetchIpAdvancePendingBills();
          await fetchIpAdvanceUnpaidBills();
          await fetchIpAdvanceReceivedBills();
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
          // ✅ remarks: only sent if user typed something
          ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
        };
        const res = await apiRequest(`${HmsBaseUrl}collect_oppharmacy_payment/`, "POST", payload);
        const result = res?.data || res;
        if (result?.success || result?.status === "success") {
          setShowPaymentModal(false);
          await fetchOpPharmacyPendingBills();
          await fetchPendingBills();
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

    const billCategory = selectedBill.type || selectedBill.raw_bill_type || selectedBill.bill_type || "";
    let statusFields = {};
    if (billCategory === "Discharge") {
      statusFields = { status: "Paid" };
    } else if (billCategory === "Investigation") {
      statusFields = { paymentStatus: "Paid" };
    } else {
      statusFields = { payment_status: "Paid" };
    }

    const payload = {
      bill_no: selectedBill.raw_bill_no || selectedBill.bill_no,
      bill_id: selectedBill.raw?._id || selectedBill.raw?.id || selectedBill.id || selectedBill._id,
      bill_type: selectedBill.bill_type_id ?? selectedBill.raw?.bill_type,
      type: billCategory,
      bill_category: billCategory,
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
        setUnpaidBills((prev) => prev.filter((b) => (b.raw_bill_no || b.bill_no) !== paidBillNo));
        setOpPharmacyBills((prev) => prev.filter((b) => (b.raw_bill_no || b.bill_no) !== paidBillNo));
        setOpPharmacyUnpaidBills((prev) => prev.filter((b) => (b.raw_bill_no || b.bill_no) !== paidBillNo));
        await fetchPendingBills();
        await fetchUnpaidBills();
        await fetchOpPharmacyPendingBills();
        await fetchReceivedBills();
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

    // Exact refund amount validation
    if (Math.abs(paidAmount - netAmount) > 0.01) {
      const msg = paidAmount < netAmount
        ? `Refund amount (₹${paidAmount.toLocaleString('en-IN')}) is less than Return Amount (₹${netAmount.toLocaleString('en-IN')}). Low refund amount is not allowed.`
        : `Refund amount (₹${paidAmount.toLocaleString('en-IN')}) exceeds Return Amount (₹${netAmount.toLocaleString('en-IN')}). Excess refund amount is not allowed.`;
      setModalError(msg);
      showToast("error", msg);
      return;
    }

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
    if (selectedMethods.credit && parseFloat(payments.credit) > 0) {
      activeMethods.push({ method: "Credit", Paid_amount: parseFloat(payments.credit) });
    }

    if (activeMethods.length === 0) {
      const msg = "Please enter at least one payment amount.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    // Validate ref numbers based on selected methods (Card/Ref No is not mandatory)
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

    const pendingAmount = 0;

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
        await fetchReturnBills();
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

  const isShiftActive = Boolean(
    activeShift &&
    (activeShift.is_active === true || activeShift.is_active === "true") &&
    activeShift.ShiftStatus === "active"
  );

  // ── Filter bills ──────────────────────────────────────────────────────────────
  const filterBills = useCallback(() => {
    if (!isShiftActive) {
      setFilteredBills([]);
      return;
    }
    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";

    let bills = [];
    if (activeMenuItem === "Pending Bills") {
      if (isOp) {
        // Outlet 2 / CC0002: strictly OP Pharmacy bills only (bill type 42)
        bills = selectedType === "pending" ? opPharmacyBills : selectedType === "unpaid" ? opPharmacyUnpaidBills : opPharmacyReceivedBills;
      } else {
        // Main block front office (CC0001 / OLET003)
        bills = selectedType === "pending" ? pendingBills : selectedType === "unpaid" ? unpaidBills : receivedBills;
      }
    } else if (activeMenuItem === "IP Advance") {
      bills =
        selectedType === "pending"
          ? ipAdvancePendingBills
          : selectedType === "unpaid"
          ? ipAdvanceUnpaidBills
          : ipAdvanceReceivedBills;
    } else if (activeMenuItem === "Returns Bills") {
      bills =
        selectedType === "pending" ? returnPendingBills : selectedType === "unpaid" ? [] : returnReceivedBills;
    }

    let filtered = bills;
    if (billType !== "ALL") {
      const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const opt = allowedBillTypes.find(
        (o) => String(o.bill_type) === String(billType) || clean(o.bill_name) === clean(billType)
      );

      filtered = filtered.filter((bill) => {
        if (opt) {
          if (
            (bill.bill_type_id != null && String(bill.bill_type_id) === String(opt.bill_type)) ||
            (bill.raw?.bill_type != null && String(bill.raw?.bill_type) === String(opt.bill_type))
          ) {
            return true;
          }
          if (
            clean(bill.bill_type) === clean(opt.bill_name) ||
            clean(bill.bill_name) === clean(opt.bill_name) ||
            clean(bill.bill_type_name) === clean(opt.bill_name)
          ) {
            return true;
          }
        }
        const targetClean = clean(billType);
        return (
          clean(bill.bill_type).includes(targetClean) ||
          clean(bill.bill_name).includes(targetClean) ||
          clean(bill.bill_type_name).includes(targetClean) ||
          targetClean.includes(clean(bill.bill_type))
        );
      });
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
    isShiftActive,
    activeShift,
    cashCounterId,
    activeMenuItem,
    selectedType,
    pendingBills,
    unpaidBills,
    opPharmacyBills,
    opPharmacyUnpaidBills,
    opPharmacyReceivedBills,
    receivedBills,
    ipAdvancePendingBills,
    ipAdvanceUnpaidBills,
    ipAdvanceReceivedBills,
    returnPendingBills,
    returnReceivedBills,
    billType,
    allowedBillTypes,
    searchTerm,
  ]);

  const handleMenuItemClick = (itemLabel) => {
    setActiveMenuItem(itemLabel);
    setSearchTerm("");
    setSelectedType("pending");

    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";

    if (itemLabel === "Pending Bills") {
      if (isOp) {
        fetchOpPharmacyPendingBills();
      } else {
        fetchPendingBills();
      }
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
    refreshActiveShift();
    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";

    if (activeMenuItem === "Pending Bills") {
      if (isOp) {
        fetchOpPharmacyPendingBills();
      } else {
        if (selectedType === "pending") {
          fetchPendingBills();
        } else if (selectedType === "unpaid") {
          fetchUnpaidBills();
        } else {
          fetchReceivedBills();
        }
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills();
      } else if (selectedType === "unpaid") {
        fetchIpAdvanceUnpaidBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    } else if (activeMenuItem === "Returns Bills") {
      fetchReturnBills();
    } else if (activeMenuItem === "Receipt / Payment") {
      pvFetchVouchers(pvFromDate, pvToDate, pvVoucherType);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchTerm("");

    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";

    if (activeMenuItem === "Pending Bills") {
      if (isOp) {
        fetchOpPharmacyPendingBills();
      } else {
        if (type === "pending") {
          fetchPendingBills();
        } else if (type === "unpaid") {
          fetchUnpaidBills();
        } else {
          fetchReceivedBills();
        }
      }
    } else if (activeMenuItem === "IP Advance") {
      if (type === "pending") {
        fetchIpAdvancePendingBills();
      } else if (type === "unpaid") {
        fetchIpAdvanceUnpaidBills();
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
    if (!isShiftActive) {
      setPendingBills([]);
      setOpPharmacyBills([]);
      setOpPharmacyUnpaidBills([]);
      setOpPharmacyReceivedBills([]);
      setFilteredBills([]);
      return;
    }
    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";
    const silent = filteredBills.length > 0;

    if (activeMenuItem === "Pending Bills") {
      if (isOp) {
        fetchOpPharmacyPendingBills(silent);
      } else {
        if (selectedType === "pending") {
          fetchPendingBills(silent);
        } else if (selectedType === "unpaid") {
          fetchUnpaidBills(silent);
        } else {
          fetchReceivedBills(silent);
        }
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills(silent);
      } else if (selectedType === "unpaid") {
        fetchIpAdvanceUnpaidBills(silent);
      } else {
        fetchIpAdvanceReceivedBills(silent);
      }
    } else if (activeMenuItem === "Returns Bills") {
      fetchReturnBills(silent);
    }
  }, [
    isShiftActive,
    activeMenuItem,
    selectedType,
    activeShift?.shiftno,
    cashCounterId,
    fetchPendingBills,
    fetchUnpaidBills,
    fetchOpPharmacyPendingBills,
    fetchReceivedBills,
    fetchIpAdvancePendingBills,
    fetchIpAdvanceUnpaidBills,
    fetchIpAdvanceReceivedBills,
    fetchReturnBills,
  ]);

  // ── Continuous Live API Auto-Sync (No manual refresh needed) ──────────────────
  useEffect(() => {
    if (!isShiftActive || showPaymentModal || showShiftDetails) {
      return;
    }

    const outlet =
      activeShift?.SelectedOutlet ||
      localStorage.getItem("selected_outlet") ||
      localStorage.getItem("outlet_code") ||
      "";
    const counter = activeShift?.CashCounter || cashCounterId || "";
    const isOp = counter === "CC0002" || outlet === "OLET002";

    const syncLatestData = () => {
      // Don't sync if tab is hidden or user has an active transaction modal open
      if (document.hidden) return;
      if (showPaymentModal || showShiftDetails) return;

      if (activeMenuItem === "Pending Bills") {
        if (isOp) {
          fetchOpPharmacyPendingBills(true);
        } else {
          if (selectedType === "pending") {
            fetchPendingBills(true);
          } else if (selectedType === "unpaid") {
            fetchUnpaidBills(true);
          } else {
            fetchReceivedBills(true);
          }
        }
      } else if (activeMenuItem === "IP Advance") {
        if (selectedType === "pending") {
          fetchIpAdvancePendingBills(true);
        } else if (selectedType === "unpaid") {
          fetchIpAdvanceUnpaidBills(true);
        } else {
          fetchIpAdvanceReceivedBills(true);
        }
      } else if (activeMenuItem === "Returns Bills") {
        fetchReturnBills(true);
      }
    };

    // Live continuous background fetch every 6 seconds
    const intervalId = setInterval(syncLatestData, 6000);

    // Instant sync whenever cashier returns to the tab/window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncLatestData();
      }
    };
    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isShiftActive,
    activeMenuItem,
    selectedType,
    activeShift?.shiftno,
    cashCounterId,
    showPaymentModal,
    showShiftDetails,
    fetchPendingBills,
    fetchOpPharmacyPendingBills,
    fetchReceivedBills,
    fetchIpAdvancePendingBills,
    fetchIpAdvanceUnpaidBills,
    fetchIpAdvanceReceivedBills,
    fetchIpAdvanceReceivedBills,
    fetchReturnBills,
  ]);

  useEffect(() => {
    filterBills();
  }, [filterBills]);



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
          <ShiftSummaryBar>
            <ShiftSummaryLeft>
              <ShiftItemBox>
                <ShiftItemLabel><Hash size={13} color="#0d9488" /> Shift Number</ShiftItemLabel>
                <ShiftItemRef>{activeShift?.shiftno || "—"}</ShiftItemRef>
              </ShiftItemBox>

              <ShiftItemDivider />

              <ShiftItemBox>
                <ShiftItemLabel>Closing Balance</ShiftItemLabel>
                <ShiftCollectedAmount>
                  ₹ {parseFloat(
                    activeShift?.ClosingBalance !== undefined && activeShift?.ClosingBalance !== null
                      ? activeShift.ClosingBalance
                      : ((parseFloat(activeShift?.OpeningBalance) || 0) +
                         (parseFloat(activeShift?.collected_Amount ?? activeShift?.collected_amount ?? activeShift?.CollectedAmount) || 0) -
                         (parseFloat(activeShift?.SalesReturnAmount) || 0))
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </ShiftCollectedAmount>
              </ShiftItemBox>

              <ShiftItemDivider />

              <ShiftItemBox>
                <ShiftItemLabel>Credit (UPI / Card / Cheque / Credit)</ShiftItemLabel>
                <ShiftCollectedAmount style={{ color: "#2563eb" }}>
                  ₹ {parseFloat(activeShift?.CreditAmount ?? activeShift?.credit_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </ShiftCollectedAmount>
              </ShiftItemBox>

              <ShiftItemDivider />

              <div>
                {shiftBelongsHere ? (
                  <ShiftRunningBanner style={{ margin: 0, padding: "5px 12px", fontSize: "12px", borderRadius: "9999px" }}>
                    <span className="dot" />
                    Running: <strong>{activeShift.CashierID}</strong>
                  </ShiftRunningBanner>
                ) : (
                  <StatusChip $active={false} style={{ fontSize: "12px", padding: "5px 12px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
                    Inactive
                  </StatusChip>
                )}
              </div>
            </ShiftSummaryLeft>

            <ShiftSummaryRight>
              <Button
                style={{
                  background: "#f0fdfa",
                  color: "#0f766e",
                  border: "1px solid #99f6e4",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  padding: "8px 14px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={handleShiftDetailsClick}
                title="View shift details in modal"
              >
                <Eye size={14} /> Shift Details
              </Button>

              <Button
                style={{
                  background: "#ffffff",
                  color: "#0f766e",
                  border: "1px solid #ccfbf1",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  padding: "8px 14px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={() => navigate("/CashCounterShiftManagement")}
                title="Manage All Shifts"
              >
                🕒 Shift Manager
              </Button>

              {shiftBelongsHere ? (
                <Button
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                    padding: "8px 16px",
                    fontSize: "12.5px",
                    fontWeight: 700
                  }}
                  onClick={handleShiftDetailsClick}
                >
                  ⏹ Stop Counter
                </Button>
              ) : (
                <Button
                  style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 700 }}
                  onClick={handleShiftDetailsClick}
                >
                  ▶ Start Counter
                </Button>
              )}
            </ShiftSummaryRight>
          </ShiftSummaryBar>
        </TopSection>

        <ModuleWrapper>
          <ModuleTabBar>
            {sidebarItems.map((item, index) => {
              const iconMap = {
                "Pending Bills": <CreditCard size={15} />,
                "IP Advance": <CreditCard size={15} />,
                "Returns Bills": <RotateCcw size={15} />,
                "Receipt / Payment": <Search size={15} />,
              };
              return (
                <ModuleTabButton
                  key={index}
                  $active={activeMenuItem === item.label}
                  onClick={() => handleMenuItemClick(item.label)}
                >
                  {iconMap[item.label] || <Search size={15} />}
                  <span>{item.label}</span>
                </ModuleTabButton>
              );
            })}
          </ModuleTabBar>

          <MainPanel>
            <PanelContent>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20
              }}>
                <Title style={{ margin: 0 }}>{activeMenuItem}</Title>

                {activeMenuItem === "Receipt / Payment" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Button
                      type="button"
                      onClick={rpOpenVoucherModal}
                      style={{ gap: 6, padding: "8px 16px", fontSize: "13px" }}
                    >
                      <Search size={14} /> View Previous Vouchers
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setRpShowVoucherForm(prev => !prev)}
                      style={{
                        gap: 6,
                        padding: "8px 16px",
                        fontSize: "13px",
                        background: rpShowVoucherForm
                          ? "#475569"
                          : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                        boxShadow: rpShowVoucherForm
                          ? "0 2px 6px rgba(71, 85, 105, 0.25)"
                          : "0 2px 6px rgba(13, 148, 136, 0.25)",
                      }}
                    >
                      {rpShowVoucherForm ? <Minus size={14} /> : <Plus size={14} />}
                      {rpShowVoucherForm ? "— Voucher" : "+ Voucher"}
                    </Button>
                  </div>
                )}
              </div>

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
                        background:"#f0fdfa", border:"1px solid #ccfbf1",
                        borderRadius:12, padding:"16px 20px", marginBottom:20,
                      }}>
                        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", gap:16 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Receipt Type</label>
                            <div style={{ display:"flex", gap:14, alignItems:"center", height:38 }}>
                              {["Receipt","Payment"].map((t) => (
                                <label key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13.5, fontWeight:500, cursor:"pointer" }}>
                                  <input
                                    type="radio" name="rpReceiptType" value={t}
                                    checked={rpReceiptType === t}
                                    onChange={() => setRpReceiptType(t)}
                                    style={{ accentColor:"#0d9488", width:16, height:16 }}
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
                              style={{ minWidth:200, height:38 }}
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
                                  style={{ border:"1px solid #cbd5e1", borderRadius:8, padding:"8px 12px", fontSize:13.5, minWidth:180, height:38, background:"#ffffff", outline:"none" }}
                                />
                              </div>
                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Room No</label>
                                <input
                                  type="text" placeholder="Enter room no"
                                  value={rpDescFields.room_no || ""}
                                  onChange={(e) => setRpDescFields(p => ({ ...p, room_no: e.target.value }))}
                                  style={{ border:"1px solid #cbd5e1", borderRadius:8, padding:"8px 12px", fontSize:13.5, minWidth:120, height:38, background:"#ffffff", outline:"none" }}
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
                                style={{ border:"1px solid #cbd5e1", borderRadius:8, padding:"8px 12px", fontSize:13.5, minWidth:220, height:38, background:"#ffffff", outline:"none" }}
                              />
                            </div>
                          )}

                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Amount</label>
                            <input
                              type="number" placeholder="0.00" min="0" step="0.01"
                              value={rpAmount}
                              onChange={(e) => setRpAmount(e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              style={{ border:"1px solid #cbd5e1", borderRadius:8, padding:"8px 12px", fontSize:13.5, minWidth:130, height:38, background:"#ffffff", outline:"none" }}
                            />
                          </div>

                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <label style={{ fontSize:13 }}>&nbsp;</label>
                            <Button onClick={rpHandleSave} disabled={rpSaving} style={{ gap:6, height:38 }}>
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
                          value="unpaid"
                          checked={selectedType === "unpaid"}
                          onChange={(e) => handleTypeChange(e.target.value)}
                        />
                        Unpaid Bills
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

                      {/* ✅ Allowed Bill Types (bill_name) dropdown placed in the same row after Received Bills */}
                      {allowedBillTypes && allowedBillTypes.length > 0 && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginLeft: "14px" }}>
                          <Label style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#374151" }}>Bill Type</Label>
                          <Select
                            value={billType}
                            onChange={(e) => setBillType(e.target.value)}
                            style={{
                              minWidth: "160px",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "1.5px solid #cbd5e1",
                              background: "#ffffff",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#1e293b",
                              cursor: "pointer",
                            }}
                          >
                            <option value="ALL">All Bill Types</option>
                            {allowedBillTypes.map((item, idx) => {
                              const bName = item.bill_name || item.bill_type_name || `Bill Type ${item.bill_type}`;
                              return (
                                <option key={`${item.bill_type}-${idx}`} value={bName}>
                                  {bName}
                                </option>
                              );
                            })}
                          </Select>
                        </div>
                      )}
                    </ControlGroup>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                          color: "#15803d",
                          fontSize: "12px",
                          fontWeight: "650",
                          border: "1px solid #bbf7d0",
                          boxShadow: "0 1px 3px rgba(34, 197, 94, 0.12)",
                          userSelect: "none",
                        }}
                        title="Continuous live data sync active. New bills are fetched automatically via API call without needing manual refresh."
                      >
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#16a34a",
                            boxShadow: "0 0 6px rgba(22, 163, 74, 0.8)",
                            display: "inline-block",
                          }}
                        />
                        Live Auto-Sync
                      </div>
                      <Button onClick={handleRefresh} disabled={loading} title="Manual Refresh (optional)" style={{ padding: "8px 16px" }}>
                        {loading ? <LoadingSpinner /> : <RotateCcw size={15} />}
                        Refresh
                      </Button>
                    </div>
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

                  <div style={{ width: "100%", overflowX: "hidden" }}>
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
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Adv Bill No</TableHeader>
                            <TableHeader>UHID</TableHeader>
                            <TableHeader>Patient Name</TableHeader>
                            <TableHeader>Amount (₹)</TableHeader>
                            <TableHeader>IP No</TableHeader>
                            <TableHeader center>IP Sl</TableHeader>
                            <TableHeader center>Status</TableHeader>
                          </>
                        ) : activeMenuItem === "Returns Bills" ? (
                          <>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Time</TableHeader>
                            <TableHeader>Return No</TableHeader>
                            <TableHeader>Bill No</TableHeader>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>UHID</TableHeader>
                            <TableHeader>Patient</TableHeader>
                            <TableHeader>Amount (₹)</TableHeader>
                            <TableHeader center>Status</TableHeader>
                          </>
                        ) : (
                          <>
                            <TableHeader>Bill No</TableHeader>
                            <TableHeader>Bill Type</TableHeader>
                            <TableHeader>UHID</TableHeader>
                            <TableHeader>Patient</TableHeader>
                            <TableHeader>Amount (₹)</TableHeader>
                            <TableHeader center>Status</TableHeader>
                            {selectedType === "received" && (
                              <>
                                <TableHeader>Doctor</TableHeader>
                                <TableHeader>Total</TableHeader>
                                <TableHeader>Payment Method</TableHeader>
                              </>
                            )}
                          </>
                        )}
                        {(selectedType === "pending" || selectedType === "unpaid") && <TableHeader center>Action</TableHeader>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading && filteredBills.length === 0 ? (
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
                                <TableCell style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }} title={bill.patient}>
                                  {bill.patient}
                                </TableCell>
                                <TableCell style={{ fontWeight: 600 }}>₹{(bill.advance_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>{bill.ipNumber}</TableCell>
                                <TableCell center>{bill.ipserial_number}</TableCell>
                                <TableCell center>
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11.5px",
                                    fontWeight: 650,
                                    letterSpacing: "0.01em",
                                    background: bill.status?.toLowerCase() === "pending" ? "#fffbeb" : "#ecfdf5",
                                    color: bill.status?.toLowerCase() === "pending" ? "#b45309" : "#047857",
                                    border: `1px solid ${bill.status?.toLowerCase() === "pending" ? "#fde68a" : "#a7f3d0"}`
                                  }}>
                                    <span style={{
                                      width: "5px",
                                      height: "5px",
                                      borderRadius: "50%",
                                      background: bill.status?.toLowerCase() === "pending" ? "#f59e0b" : "#10b981"
                                    }} />
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
                                <TableCell style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }} title={bill.patient}>
                                  {bill.patient}
                                </TableCell>
                                <TableCell style={{ fontWeight: 600 }}>₹{(bill.return_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell center>
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11.5px",
                                    fontWeight: 650,
                                    letterSpacing: "0.01em",
                                    background: bill.document_status?.toLowerCase() === "pending" ? "#fffbeb" : "#ecfdf5",
                                    color: bill.document_status?.toLowerCase() === "pending" ? "#b45309" : "#047857",
                                    border: `1px solid ${bill.document_status?.toLowerCase() === "pending" ? "#fde68a" : "#a7f3d0"}`
                                  }}>
                                    <span style={{
                                      width: "5px",
                                      height: "5px",
                                      borderRadius: "50%",
                                      background: bill.document_status?.toLowerCase() === "pending" ? "#f59e0b" : "#10b981"
                                    }} />
                                    {bill.document_status}
                                  </span>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{bill.bill_no}</TableCell>
                                <TableCell>{bill.bill_type}</TableCell>
                                <TableCell>{bill.uhid_no}</TableCell>
                                <TableCell style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }} title={bill.patient}>
                                  {bill.patient}
                                </TableCell>
                                <TableCell style={{ fontWeight: 600 }}>₹{(bill.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell center>
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11.5px",
                                    fontWeight: 650,
                                    letterSpacing: "0.01em",
                                    background: bill.status?.toLowerCase() === "pending" ? "#fffbeb"
                                      : bill.status?.toLowerCase() === "billed" ? "#eff6ff"
                                      : "#ecfdf5",
                                    color: bill.status?.toLowerCase() === "pending" ? "#b45309"
                                      : bill.status?.toLowerCase() === "billed" ? "#1d4ed8"
                                      : "#047857",
                                    border: `1px solid ${bill.status?.toLowerCase() === "pending" ? "#fde68a"
                                      : bill.status?.toLowerCase() === "billed" ? "#bfdbfe"
                                      : "#a7f3d0"}`
                                  }}>
                                    <span style={{
                                      width: "5px",
                                      height: "5px",
                                      borderRadius: "50%",
                                      background: bill.status?.toLowerCase() === "pending" ? "#f59e0b"
                                        : bill.status?.toLowerCase() === "billed" ? "#3b82f6"
                                        : "#10b981"
                                    }} />
                                    {bill.status}
                                  </span>
                                </TableCell>
                                {selectedType === "received" && (
                                  <>
                                    <TableCell>{bill.doctor}</TableCell>
                                    <TableCell>
                                      {bill.payment_breakdown && bill.payment_breakdown.length > 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                          {bill.payment_breakdown.map((b, i) => {
                                            const method = b.method ? (b.method.charAt(0).toUpperCase() + b.method.slice(1).toLowerCase()) : "Payment";
                                            const bAmt = b.amount !== undefined ? b.amount : (b.Paid_amount !== undefined ? b.Paid_amount : (b.paid_amount !== undefined ? b.paid_amount : 0));
                                            return (
                                              <span key={i} style={{ fontSize: "11.5px", whiteSpace: "nowrap", fontWeight: 550 }}>
                                                {method} - ₹{Number(bAmt || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <span style={{ fontWeight: 600 }}>₹{(bill.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                      )}
                                    </TableCell>
                                    <TableCell center>
                                      <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "3px 10px",
                                        borderRadius: "12px",
                                        fontSize: "11.5px",
                                        fontWeight: 650,
                                        letterSpacing: "0.01em",
                                        background: bill.payment_method === "Multiple Payment" ? "#f5f3ff"
                                          : bill.payment_method === "Cash" ? "#ecfdf5"
                                          : bill.payment_method === "Card" ? "#eff6ff"
                                          : bill.payment_method === "Cheque" ? "#fffbeb"
                                          : "#f8fafc",
                                        color: bill.payment_method === "Multiple Payment" ? "#6d28d9"
                                          : bill.payment_method === "Cash" ? "#047857"
                                          : bill.payment_method === "Card" ? "#1d4ed8"
                                          : bill.payment_method === "Cheque" ? "#b45309"
                                          : "#475569",
                                        border: `1px solid ${
                                          bill.payment_method === "Multiple Payment" ? "#ddd6fe"
                                          : bill.payment_method === "Cash" ? "#a7f3d0"
                                          : bill.payment_method === "Card" ? "#bfdbfe"
                                          : bill.payment_method === "Cheque" ? "#fde68a"
                                          : "#e2e8f0"
                                        }`
                                      }}>
                                        {bill.payment_method}
                                      </span>
                                    </TableCell>
                                  </>
                                )}
                              </>
                            )}

                            <TableCell center>
                              {(selectedType === "pending" || selectedType === "unpaid") && (
                                <button
                                  title="Collect Payment"
                                  onClick={() => openPaymentModal(bill)}
                                  style={{
                                    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                                    color: "#ffffff",
                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                    padding: "5px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    boxShadow: "0 2px 6px rgba(15, 118, 110, 0.28)",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    whiteSpace: "nowrap"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(15, 118, 110, 0.35)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 118, 110, 0.28)";
                                  }}
                                >
                                  <CreditCard size={13} />
                                  <span style={{ fontSize: "11.5px", fontWeight: 650, letterSpacing: "0.01em" }}>Collect</span>
                                </button>
                              )}
                            </TableCell>
                          </tr>
                        ))
                      ) : !isShiftActive ? (
                        <tr>
                          <TableCell center muted colSpan={colSpan} style={{ padding: "40px 16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "28px" }}>⏱️</span>
                              <span style={{ fontSize: "15px", fontWeight: "700", color: "#b45309" }}>
                                Shift Not Started
                              </span>
                              <span style={{ fontSize: "13px", color: "#64748b" }}>
                                Bills are not displayed until a shift is started. Please start your shift in Shift Details.
                              </span>
                              <button
                                onClick={handleShiftDetailsClick}
                                style={{
                                  marginTop: "8px",
                                  background: "linear-gradient(135deg, #0d9488, #0f766e)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "7px 16px",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                Start Shift
                              </button>
                            </div>
                          </TableCell>
                        </tr>
                      ) : (
                        <tr>
                          <TableCell center muted colSpan={colSpan}>
                            {selectedType === "pending" ? "No pending bills found" : selectedType === "unpaid" ? "No unpaid bills found" : "No received bills found"}
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
        </ModuleWrapper>
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
          <ModalContainer style={{ maxWidth: 600 }}>
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

              {/* Payment Mode Selector: Single vs Multiple Payment */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Payment Method
                </span>
                <label
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    cursor: "pointer", fontSize: "12px", fontWeight: 600,
                    color: isMultipleMode ? "#0d9488" : "#6b7280",
                    background: isMultipleMode ? "#f0fdfa" : "#f3f4f6",
                    padding: "4px 10px", borderRadius: "6px",
                    border: `1px solid ${isMultipleMode ? "#99f6e4" : "#e5e7eb"}`,
                    transition: "all 0.2s"
                  }}
                  title="Enable to split payment across multiple methods (e.g. Cash + Card)"
                >
                  <input
                    type="checkbox"
                    checked={isMultipleMode}
                    onChange={(e) => handleToggleMultipleMode(e.target.checked)}
                    style={{ accentColor: "#0d9488", width: "14px", height: "14px", cursor: "pointer" }}
                  />
                  <span>🔀 Multiple Payment (Split)</span>
                </label>
              </div>

              {/* Payment Method Pills */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {[
                  { id: "cash", label: "Cash", icon: "💵" },
                  { id: "card", label: "Card", icon: "💳" },
                  { id: "cheque", label: "Cheque", icon: "🏦" },
                  { id: "credit", label: "Credit", icon: "📑" },
                ].map(({ id, label, icon }) => {
                  const isChecked = !!selectedMethods[id];
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        if (isMultipleMode) {
                          handleToggleMultipleMethod(id, !isChecked);
                        } else {
                          handleSelectSingleMethod(id);
                        }
                      }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        border: `2px solid ${isChecked ? "#0d9488" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        padding: "8px 10px",
                        cursor: "pointer",
                        background: isChecked ? "#f0fdfa" : "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: isChecked ? "#0d9488" : "#4b5563",
                        boxShadow: isChecked ? "0 2px 4px rgba(13, 148, 136, 0.12)" : "none",
                        transition: "all 0.15s ease",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (!isMultipleMode && e.target.checked) {
                            setIsMultipleMode(true);
                            handleToggleMultipleMethod(id, true);
                          } else {
                            handleToggleMultipleMethod(id, e.target.checked);
                          }
                        }}
                        style={{ accentColor: "#0d9488", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span>{icon} {label}</span>
                    </div>
                  );
                })}
              </div>

              {selectedMethods.cash && (
                <PaymentSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <PaymentMethodLabel>💵 Cash</PaymentMethodLabel>
                    {isMultipleMode && balance > 0 && (
                      <button
                        type="button"
                        onClick={() => applyRemainingToMethod("cash")}
                        style={{
                          fontSize: "11px", color: "#0d9488", background: "#f0fdfa",
                          border: "1px solid #99f6e4", borderRadius: "4px",
                          padding: "2px 8px", cursor: "pointer", fontWeight: 600
                        }}
                      >
                        + Use remaining ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </div>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.cash}
                      onChange={(e) => handlePaymentAmountChange("cash", e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {selectedMethods.card && (
                <PaymentSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <PaymentMethodLabel>💳 Card</PaymentMethodLabel>
                    {isMultipleMode && balance > 0 && (
                      <button
                        type="button"
                        onClick={() => applyRemainingToMethod("card")}
                        style={{
                          fontSize: "11px", color: "#0d9488", background: "#f0fdfa",
                          border: "1px solid #99f6e4", borderRadius: "4px",
                          padding: "2px 8px", cursor: "pointer", fontWeight: 600
                        }}
                      >
                        + Use remaining ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </div>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.card}
                      onChange={(e) => handlePaymentAmountChange("card", e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Card / Ref No (Optional)</FormLabel>
                    <SubInput
                      type="text" placeholder="Enter card / transaction ref no (optional)"
                      value={payments.cardNo}
                      onChange={(e) => setPayments({ ...payments, cardNo: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {selectedMethods.cheque && (
                <PaymentSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <PaymentMethodLabel>🏦 Cheque</PaymentMethodLabel>
                    {isMultipleMode && balance > 0 && (
                      <button
                        type="button"
                        onClick={() => applyRemainingToMethod("cheque")}
                        style={{
                          fontSize: "11px", color: "#0d9488", background: "#f0fdfa",
                          border: "1px solid #99f6e4", borderRadius: "4px",
                          padding: "2px 8px", cursor: "pointer", fontWeight: 600
                        }}
                      >
                        + Use remaining ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </div>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.cheque}
                      onChange={(e) => handlePaymentAmountChange("cheque", e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Cheque No <span style={{ color: "red" }}>*</span></FormLabel>
                    <SubInput
                      type="text" placeholder="Enter cheque number"
                      value={payments.chequeNo}
                      onChange={(e) => setPayments({ ...payments, chequeNo: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {selectedMethods.credit && (
                <PaymentSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <PaymentMethodLabel>📑 Credit</PaymentMethodLabel>
                    {isMultipleMode && balance > 0 && (
                      <button
                        type="button"
                        onClick={() => applyRemainingToMethod("credit")}
                        style={{
                          fontSize: "11px", color: "#0d9488", background: "#f0fdfa",
                          border: "1px solid #99f6e4", borderRadius: "4px",
                          padding: "2px 8px", cursor: "pointer", fontWeight: 600
                        }}
                      >
                        + Use remaining ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </div>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number" placeholder="0.00"
                      value={payments.credit}
                      onChange={(e) => handlePaymentAmountChange("credit", e.target.value)}
                      onWheel={(e) => e.target.blur()}
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
                <SummaryRow bold separator highlight={balance === 0} danger={balance !== 0}>
                  <span>{balance > 0 ? "Pending Amount" : balance < 0 ? "Excess Amount" : "Balance"}</span>
                  <span>₹ {Math.abs(balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </SummaryRow>
              </SummaryCard>

              {/* Excess or Low Amount Warning */}
              {paidAmount > 0 && Math.abs(paidAmount - netAmount) > 0.01 && (
                <div style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1.5px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span>
                    {paidAmount < netAmount
                      ? `Entered amount (₹${paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}) is lower than Net Amount (₹${netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}). Low amount / partial payment is not allowed.`
                      : `Entered amount (₹${paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}) exceeds Net Amount (₹${netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}). Excess payment is not allowed.`
                    }
                  </span>
                </div>
              )}

              {/* ✅ NEW: Remarks field — only shown for OPPharmacy bills */}
              {selectedBill?.source === "OPPharmacy" && (
                <PaymentSection style={{ marginTop: "8px" }}>
                  <PaymentMethodLabel>📝 Remarks (Optional)</PaymentMethodLabel>
                  <textarea
                    placeholder="Enter remarks if any..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={1}
                    style={{
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "7px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      width: "100%",
                      minHeight: "36px",
                      height: "36px",
                      boxSizing: "border-box",
                      resize: "none",
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
              <SaveButton
                disabled={paidAmount === 0 || Math.abs(paidAmount - netAmount) > 0.01 || isSavingPayment}
                onClick={selectedBill?.source === "ReturnBill" ? submitReturnPayment : submitPayment}
              >
                {isSavingPayment
                  ? "Saving Payment..."
                  : (selectedBill?.source === "ReturnBill" ? "Process Refund" : "Save Payment")
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