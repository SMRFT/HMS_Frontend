import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import ReactSelect from "react-select";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import PrintModal from "./PrintModal"; // ← fast in-page print modal (shared with InvestigationBilling)
import {
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  colors,
} from "../GlobalStyles";

// ─── Page Layout ──────────────────────────────────────────────────────────────

const PageContainer = styled(PageWrapper)`
  background: #f0f2f5;
  padding: 12px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PageTitle = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid ${colors.primary};
  padding-bottom: 6px;
`;

const BackButton = styled(Button)`
  background: ${colors.primary};
  font-size: 0.78rem;
  padding: 5px 12px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

// ─── Filters ──────────────────────────────────────────────────────────────────

const FilterGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  margin-bottom: 10px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 2px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.78rem;
  color: ${colors.textMain};
  input {
    cursor: pointer;
    width: 14px;
    height: 14px;
    accent-color: ${colors.primary};
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  height: 28px;
  .ant-picker-input input {
    font-size: 0.78rem;
    padding: 0 6px;
  }
  &.ant-picker {
    border: 1px solid ${colors.border};
    border-radius: 6px;
    padding: 0 6px;
    height: 28px;
    &:hover,
    &.ant-picker-focused {
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
    }
  }
`;

const searchableSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "28px",
    height: "28px",
    fontSize: "0.78rem",
    borderRadius: "6px",
    borderColor: state.isFocused ? colors.primary : colors.border,
    boxShadow: state.isFocused ? `0 0 0 2px rgba(13, 148, 136, 0.1)` : "none",
    "&:hover": {
      borderColor: colors.primary,
    },
    backgroundColor: "#ffffff",
    cursor: "pointer",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
    height: "28px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: "0.78rem",
    color: colors.textMain,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "28px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "2px 4px",
    svg: {
      width: "14px",
      height: "14px",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "2px 4px",
    svg: {
      width: "14px",
      height: "14px",
    },
  }),
  menu: (base) => ({
    ...base,
    fontSize: "0.78rem",
    zIndex: 99999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),
  option: (base, state) => ({
    ...base,
    padding: "5px 10px",
    backgroundColor: state.isSelected
      ? colors.primary
      : state.isFocused
        ? "#f0fdfa"
        : "transparent",
    color: state.isSelected ? "#ffffff" : colors.textMain,
    cursor: "pointer",
  }),
  placeholder: (base, state) => ({
    ...base,
    margin: 0,
    fontSize: "0.78rem",
    color: state.isFocused ? "#cbd5e1" : "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  singleValue: (base) => ({
    ...base,
    margin: 0,
    fontSize: "0.78rem",
    color: colors.textMain,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
};

// ─── Table extras ─────────────────────────────────────────────────────────────

const ActionGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ActionIcon = styled.span`
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  &:hover {
    transform: scale(1.15);
    background: #f0f0f0;
  }
`;

const PrintIconBtn = styled.span`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  color: ${colors.primary};
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.15);
    background: #f0f0f0;
  }
`;

const PrintSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const ViewIcon = styled(ActionIcon)`
  color: #7c3aed;
`;
const EditIcon = styled(ActionIcon)`
  color: ${({ $disabled }) => ($disabled ? "#ccc" : colors.secondary)};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  pointer-events: auto;
`;

const DeleteIcon = styled(ActionIcon)`
  color: ${({ $disabled }) => ($disabled ? "#ccc" : colors.danger)};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  pointer-events: auto;
`;
const RefundIcon = styled(ActionIcon)`
  color: ${({ $disabled }) => ($disabled ? "#ccc" : "#0891b2")};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  pointer-events: auto;
`;

const ItemCheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: 1px solid
    ${({ $checked }) => ($checked ? colors.primary : colors.border)};
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  background: ${({ $checked }) =>
    $checked ? "rgba(13,148,136,0.06)" : "white"};

  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: ${colors.primary};
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemName = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMain};
`;

const ItemMeta = styled.span`
  font-size: 0.72rem;
  color: ${colors.textMuted};
`;

const ItemPrice = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.primary};
  white-space: nowrap;
`;

const RefundSummaryBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  background: ${colors.primary}15;
  border: 1px solid ${colors.primary}40;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMain};
  margin-top: 2px;
`;

const RefundTotal = styled.span`
  font-size: 0.88rem;
  font-weight: 700;
  color: ${colors.primary};
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: ${colors.textMuted};
  padding-bottom: 4px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 2px;

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

const ConfirmRefundBtn = styled(Button)`
  background: #0891b2;
  font-size: 0.78rem;
  padding: 5px 14px;
  &:hover {
    background: #0e7490;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// ─── Frozen-column table ──────────────────────────────────────────────────────
// border-collapse:separate is required for position:sticky to work on td/th.

// Update FrozenTableWrapper — remove fixed min-width so scrollable cols shrink-wrap
const FrozenTableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 65vh;
  border-radius: 6px;
  border: 1px solid ${colors.border};

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: max-content; /* ← was min-width:1500px; now hugs content */
    min-width: 100%; /* ← still fills container when few columns */
  }
`;
// Frozen columns and their cumulative left offsets
//  Col 1  Sl.No        44px   left:   0
//  Col 2  Date/Time   150px   left:  44
//  Col 3  Bill No     130px   left: 194
//  Col 4  UHID No     100px   left: 324
//  Col 5  IP No        80px   left: 424
//  Col 6  Patient Name 160px  left: 504  ← last frozen (shadow here)

// Replace the COL object
const COL = {
  slNo: { width: 50, left: 0 },
  dateTime: { width: 170, left: 50 },
  billNo: { width: 145, left: 220 },
  uhid: { width: 115, left: 365 },
  ipNo: { width: 90, left: 480 },
  patientName: { width: 180, left: 570 },
};

const frozenShadow = `
  &::after {
    content: "";
    position: absolute;
    top: 0; right: -6px;
    width: 6px; height: 100%;
    background: linear-gradient(to right, rgba(0,0,0,0.09), transparent);
    pointer-events: none;
  }
`;

const StickyTh = styled(Th)`
  position: sticky;
  top: 0;
  left: ${({ $left }) => $left}px;
  min-width: ${({ $width }) => $width}px;
  z-index: 4;
  background: ${colors.tabBg || "#f1f5f9"};
  white-space: nowrap;
  border-right: 1px solid ${colors.border};
  ${({ $last }) => ($last ? frozenShadow : "")}
`;

const ScrollableTh = styled(Th)`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${colors.tabBg || "#f1f5f9"};
`;

const StickyTd = styled(Td)`
  position: sticky;
  left: ${({ $left }) => $left}px;
  min-width: ${({ $width }) => $width}px;
  z-index: 2;
  background: white;
  white-space: nowrap;
  border-right: 1px solid ${colors.border};
  ${({ $last }) => ($last ? frozenShadow : "")}
`;

// Sticky td background for striped/hover rows — match Tr background
const StickyTdAlt = styled(StickyTd)`
  tr:hover & {
    background: ${colors.rowHover || "#f8fafc"};
  }
`;

// Remarks — wide, wraps text, muted colour
const RemarksTh = styled(Th)`
  min-width: 240px;
`;

const RemarksTd = styled(Td)`
  min-width: 240px;
  max-width: 320px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  font-size: 0.76rem;
  color: ${colors.textMuted};
  vertical-align: top;
  padding-top: 6px;
`;

const RemarksScrollableTh = styled(RemarksTh)`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${colors.tabBg || "#f1f5f9"};
`;

// ─── Modals ───────────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 560px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: ${colors.primary};
  color: white;
`;

const ModalTitle = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  &:hover {
    opacity: 0.8;
  }
`;

const ModalBody = styled.div`
  padding: 12px;
  overflow-y: auto;
  flex: 1;
`;

const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
`;

const ModalTh = styled.th`
  background: ${colors.tabBg};
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: ${colors.textMain};
  border-bottom: 2px solid ${colors.border};
  font-size: 0.72rem;
  white-space: nowrap;
`;

const ModalTd = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.textMain};
`;

const ModalTotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 4px 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textMain};
  border-top: 1px solid ${colors.border};
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  &::before {
    content: "📭";
    font-size: 2.5rem;
    display: block;
    margin-bottom: 8px;
  }
`;

// ─── Remarks edit modal ───────────────────────────────────────────────────────

const RemarksModalBox = styled(ModalBox)`
  max-width: 420px;
  max-height: unset;
`;

const RemarksModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const RefundModalBox = styled(ModalBox)`
  // ← MOVE HERE (after ModalBox)
  max-width: 600px;
`;

const RefundModalBody = styled(ModalBody)`
  // ← MOVE HERE (after ModalBody)
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RemarksTextarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  resize: vertical;
  border: 1px solid ${({ $error }) => ($error ? colors.danger : colors.border)};
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.82rem;
  color: ${colors.textMain};
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${({ $error }) => ($error ? colors.danger : colors.primary)};
    box-shadow: 0 0 0 2px
      ${({ $error }) =>
    $error ? "rgba(239,68,68,0.12)" : "rgba(13,148,136,0.1)"};
  }
`;

const ErrorText = styled.span`
  font-size: 0.74rem;
  color: ${colors.danger};
  margin-top: -6px;
`;

const RemarksModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${colors.border};
`;

const CancelBtn = styled(Button)`
  background: ${colors.textMuted};
  font-size: 0.78rem;
  padding: 5px 14px;
  &:hover {
    background: #475569;
  }
`;

const ConfirmBtn = styled(Button)`
  background: ${colors.secondary};
  font-size: 0.78rem;
  padding: 5px 14px;
  &:hover {
    background: #d97706;
  }
`;
const RefundHistoryIconBtn = styled.span`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  color: #7c3aed;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.15);
    background: #f0f0f0;
  }
`;
const RefundHistorySVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);
// ─── Actions eye button + sticky Actions column ───────────────────────────────

const ActionsEyeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1.5px solid #99f6e4;
  background: rgba(13, 148, 136, 0.08);
  color: #0f766e;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  &:hover {
    transform: scale(1.1);
    background: rgba(13, 148, 136, 0.16);
  }
`;

const EyeSVG = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const StickyActionsTh = styled(ScrollableTh)`
  right: 0;
  z-index: 4;
  text-align: center;
  min-width: 80px;
  box-shadow: -4px 0 8px -4px rgba(15, 23, 42, 0.18);
`;

const StickyActionsTd = styled(Td)`
  position: sticky;
  right: 0;
  z-index: 2;
  background: white;
  text-align: center;
  min-width: 80px;
  box-shadow: -4px 0 8px -4px rgba(15, 23, 42, 0.18);
  tr:hover & {
    background: ${colors.rowHover || "#f8fafc"};
  }
`;

// ─── Actions modal ────────────────────────────────────────────────────────────

const ActionsInfoCard = styled.div`
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
`;

const ActionsInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px 14px;
  font-size: 0.76rem;
  margin-top: 8px;
`;

const InfoLabel = styled.span`
  display: block;
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${colors.textMuted};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ $ok }) => ($ok ? "#f0fdf4" : "#fffbeb")};
  color: ${({ $ok }) => ($ok ? "#15803d" : "#b45309")};
  border: 1.5px solid ${({ $ok }) => ($ok ? "#86efac" : "#fde68a")};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
`;

const ActionTile = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-align: left;
  border: 1.5px solid ${({ $border }) => $border};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: transform 0.15s;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const ActionTileIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;
// ─── Component ────────────────────────────────────────────────────────────────

const BillsReport = () => {
  const [estimateBills, setEstimateBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filters, setFilters] = useState({
    billType: "",
    doctor: "",
    patientType: "ALL",
    uhid: "",
  });
  const [billTypes, setBillTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const billTypeOptions = useMemo(() => {
    return billTypes.map((b) => ({
      value: String(b.bill_type),
      label: b.bill_name,
    }));
  }, [billTypes]);

  const doctorOptions = useMemo(() => {
    return [
      { value: "SELF", label: "SELF" },
      ...doctors.map((d) => ({
        value: String(d.employeeId),
        label: d.employeeName,
      })),
    ];
  }, [doctors]);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [viewBill, setViewBill] = useState(null);
  const [remarksBill, setRemarksBill] = useState(null);
  const [remarksValue, setRemarksValue] = useState("");
  const [remarksError, setRemarksError] = useState(false);

  // Delete remarks modal state
  const [deleteBill, setDeleteBill] = useState(null);
  const [deleteRemarks, setDeleteRemarks] = useState("");
  const [deleteRemarksErr, setDeleteRemarksErr] = useState(false);
  const [refundBill, setRefundBill] = useState(null);
  const [refundSelected, setRefundSelected] = useState([]);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundRemarks, setRefundRemarks] = useState("");
  const [refundRemarksErr, setRefundRemarksErr] = useState(false);
  const [viewRefundBill, setViewRefundBill] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [actionsBill, setActionsBill] = useState(null);

  // Print modal state — { bill, isEstimate }
  const [printJob, setPrintJob] = useState(null);

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-P-IBE-RW");
  const canDelete = allowedActions.includes("HMS-P-IBD-RW");

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const isBarcodeLocked = (bill) =>
    bill.is_barcode === true;

  const formatBillDate = (dateStr) => {
    if (!dateStr) return "";
    const normalized =
      dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
    return new Date(normalized)
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  };

  // ── Fetch bills ─────────────────────────────────────────────────────────────
  const fetchBills = async () => {
    try {
      const qp = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== "ALL") qp.append(k, v);
      });
      qp.append("start_date", fromDate.format("YYYY-MM-DD"));
      qp.append("end_date", toDate.format("YYYY-MM-DD"));

      const result = await apiRequest(
        `${HMSURL}investBillingGet/?${qp.toString()}`,
        "GET",
      );
      if (result.success) {
        setEstimateBills(result.data);
        setFilteredBills(result.data);
      } else {
        toast.error(result.error || "Failed to fetch bills");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filters, fromDate, toDate, HMSURL]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const btRes = await apiRequest(`${HMSURL}bill-types/`, "GET");
        if (btRes.success) setBillTypes(btRes.data.billTypes || []);
        const drRes = await apiRequest(
          `${HMSURL}doctor_list_diagnostics/`,
          "GET",
        );
        if (drRes.success) setDoctors(drRes.data);
      } catch {
        toast.error("An unexpected error occurred");
      }
    };
    fetchMeta();
  }, [HMSURL]);

  // belt-and-suspenders client side IP/OP filter
  // client-side IP/OP + patient name filter
  useEffect(() => {
    const tokens = nameSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);

    setFilteredBills(
      estimateBills.filter((bill) => {
        if (filters.patientType === "IP" && !(bill.uhid && bill.ipNumber))
          return false;
        if (filters.patientType === "OP" && !(bill.uhid && !bill.ipNumber))
          return false;

        if (tokens.length) {
          const fullName = [
            bill.salutation,
            bill.firstName,
            bill.middleName,
            bill.lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!tokens.every((t) => fullName.includes(t))) return false;
        }
        return true;
      }),
    );
  }, [estimateBills, filters.patientType, nameSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, dateType) => {
    if (!date) return;
    dateType === "from" ? setFromDate(date) : setToDate(date);
  };

  // ── Print ────────────────────────────────────────────────────────────────────
  // PrintModal/buildBillHtml expects the same shape InvestigationBilling.js
  // hands it (separate date + time strings, `ageType`, `billType`, an `item`
  // array). This report's rows use slightly different field names
  // (`age_type`, `bill_name`, a single combined datetime) — normalize here
  // instead of duplicating another print template.
  const toPrintBill = (bill) => {
    const raw = bill.investBillDate || bill.EstBillDate || "";
    const normalized = raw
      ? raw.endsWith("Z") || raw.includes("+")
        ? raw
        : raw + "Z"
      : "";
    const d = normalized ? new Date(normalized) : null;
    const pad = (n) => String(n).padStart(2, "0");
    const dateOnly = d
      ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      : "";
    const timeOnly = d
      ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      : "";

    return {
      ...bill,
      investBillDate: dateOnly,
      EstBillDate: dateOnly,
      time: timeOnly,
      firstName: [bill.firstName, bill.middleName].filter(Boolean).join(" "),
      ageType: bill.age_type || bill.ageType || "Y",
      billType: bill.bill_name || bill.billType || bill.billTypeNo || "",
      item: Array.isArray(bill.item) ? bill.item : [],
      isDuplicate: true,
    };
  };

  const handlePrint = (bill) => {
    const isEstimate = !bill.investBillNo && !!bill.EstBillNo;
    setPrintJob({ bill: toPrintBill(bill), isEstimate, isDuplicate: true });
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = (bill) => {
    setRemarksBill({ ...bill });
    setRemarksValue("");
    setRemarksError(false);
  };

  const handleRemarksCancel = () => {
    setRemarksBill(null);
    setRemarksValue("");
    setRemarksError(false);
  };

  const handleRemarksConfirm = () => {
    if (!remarksValue.trim()) {
      setRemarksError(true);
      return;
    }
    navigate("/InvestigationBilling", {
      state: {
        patientData: { ...remarksBill, editRemarks: remarksValue.trim() },
      },
    });
    setRemarksBill(null);
    setRemarksValue("");
    setRemarksError(false);
  };

  // ── Delete (remarks modal) ───────────────────────────────────────────────────
  const handleDelete = (bill) => {
    setDeleteBill({ ...bill });
    setDeleteRemarks("");
    setDeleteRemarksErr(false);
  };

  const handleDeleteCancel = () => {
    setDeleteBill(null);
    setDeleteRemarks("");
    setDeleteRemarksErr(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRemarks.trim()) {
      setDeleteRemarksErr(true);
      return;
    }
    try {
      const result = await apiRequest(`${HMSURL}delete-bill/`, "PATCH", {
        investBillNo: deleteBill.investBillNo || deleteBill.EstBillNo,
        deleteRemarks: deleteRemarks.trim(),
      });
      if (result.success) {
        toast.success("Bill deleted.");
        const billNo = deleteBill.investBillNo || deleteBill.EstBillNo;
        setEstimateBills((prev) =>
          prev.filter((b) => (b.investBillNo || b.EstBillNo) !== billNo),
        );
        handleDeleteCancel();
      } else {
        toast.error(result.error || "Failed to delete bill");
      }
    } catch {
      toast.error("An error occurred while deleting the bill.");
    }
  };
  const handleRefund = (bill) => {
    setRefundBill({ ...bill });
    setRefundSelected([]);
    setRefundRemarks(""); // ← ADD
    setRefundRemarksErr(false); // ← ADD
  };

  const handleRefundCancel = () => {
    setRefundBill(null);
    setRefundSelected([]);
    setRefundSubmitting(false);
    setRefundRemarks(""); // ← ADD
    setRefundRemarksErr(false); // ← ADD
  };

  const toggleRefundItem = (idx) => {
    setRefundSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const toggleSelectAll = () => {
    if (!refundBill) return;
    const allIdx = refundBill.item.map((_, i) => i);
    setRefundSelected(refundSelected.length === allIdx.length ? [] : allIdx);
  };

  const refundTotal = refundBill
    ? refundSelected.reduce((sum, idx) => {
      const it = refundBill.item[idx];
      return sum + parseFloat(it.price || 0) * parseInt(it.quantity || 1, 10);
    }, 0)
    : 0;

  const handleRefundConfirm = async () => {
    if (!refundSelected.length) return;

    // ← ADD validation
    if (!refundRemarks.trim()) {
      setRefundRemarksErr(true);
      return;
    }

    setRefundSubmitting(true);
    try {
      const selectedItems = refundSelected.map((idx) => refundBill.item[idx]);
      const payload = {
        investBillNo: refundBill.investBillNo || refundBill.EstBillNo,
        uhid: refundBill.uhid,
        ipNumber: refundBill.ipNumber || "",
        bill_type: refundBill.bill_type,
        billTypeNo: refundBill.billTypeNo || "",
        refund_finalPrice: refundTotal.toFixed(2),
        item: selectedItems,
        investBillDate: refundBill.investBillDate || refundBill.EstBillDate,
        refundRemarks: refundRemarks.trim(), // ← ADD
      };

      const result = await apiRequest(
        `${HMSURL}invest-refund/`,
        "POST",
        payload,
      );
      if (result.success) {
        toast.success(`Refund created — ${result.data?.refundBillNo || ""}`);
        await fetchBills();
        handleRefundCancel();
      } else {
        toast.error(result.error || "Failed to create refund");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const fmtName = (s, f, m, l) =>
    `${s || ""} ${f || ""} ${m ? m + " " : ""}${l || ""}`.trim();

  // ─── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>📄 Bills Report</PageTitle>
        <BackButton onClick={() => navigate(-1)}>← Back to Billing</BackButton>
      </HeaderContainer>
      <ContentCard>
        {/* Filters */}
        <FilterGrid>
          <InputWrapper>
            <Label>From Date</Label>
            <StyledDatePicker
              value={fromDate}
              onChange={(date) => handleDateChange(date, "from")}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>To Date</Label>
            <StyledDatePicker
              value={toDate}
              onChange={(date) => handleDateChange(date, "to")}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>Bill Type</Label>
            <ReactSelect
              isClearable
              isSearchable
              placeholder="Select Bill Type"
              options={billTypeOptions}
              value={
                filters.billType
                  ? billTypeOptions.find((o) => o.value === String(filters.billType)) || null
                  : null
              }
              onChange={(selected) => {
                setFilters((prev) => ({
                  ...prev,
                  billType: selected ? selected.value : "",
                }));
              }}
              styles={searchableSelectStyles}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>Doctor</Label>
            <ReactSelect
              isClearable
              isSearchable
              placeholder="Select Doctor"
              options={doctorOptions}
              value={
                filters.doctor
                  ? doctorOptions.find((o) => o.value === String(filters.doctor)) || null
                  : null
              }
              onChange={(selected) => {
                setFilters((prev) => ({
                  ...prev,
                  doctor: selected ? selected.value : "",
                }));
              }}
              styles={searchableSelectStyles}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>UHID</Label>
            <Input
              type="text"
              name="uhid"
              value={filters.uhid}
              onChange={handleFilterChange}
            />
          </InputWrapper>
          <InputWrapper>
            <Label>Patient Name</Label>
            <Input
              type="text"
              name="patientName"
              placeholder="Search by name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>Patient Type</Label>
            <RadioGroup>
              {["OP", "IP", "ALL"].map((type) => (
                <RadioLabel key={type}>
                  <input
                    type="radio"
                    name="patientType"
                    value={type}
                    checked={filters.patientType === type}
                    onChange={handleFilterChange}
                  />
                  {type}
                </RadioLabel>
              ))}
            </RadioGroup>
          </InputWrapper>
        </FilterGrid>

        {/* Table */}
        {filteredBills.length > 0 ? (
          <FrozenTableWrapper>
            <table>
              <thead>
                <tr>
                  {/* ── Frozen header cells ── */}
                  <StickyTh $left={COL.slNo.left} $width={COL.slNo.width}>
                    Sl.No
                  </StickyTh>
                  <StickyTh
                    $left={COL.dateTime.left}
                    $width={COL.dateTime.width}
                  >
                    Date / Time
                  </StickyTh>
                  <StickyTh $left={COL.billNo.left} $width={COL.billNo.width}>
                    Bill No
                  </StickyTh>
                  <StickyTh $left={COL.uhid.left} $width={COL.uhid.width}>
                    UHID No
                  </StickyTh>
                  <StickyTh $left={COL.ipNo.left} $width={COL.ipNo.width}>
                    IP No
                  </StickyTh>
                  <StickyTh
                    $left={COL.patientName.left}
                    $width={COL.patientName.width}
                    $last
                  >
                    Patient Name
                  </StickyTh>
                  {/* ── Scrollable header cells ── */}
                  <ScrollableTh>Age</ScrollableTh>
                  <ScrollableTh>Room No</ScrollableTh>
                  <ScrollableTh>Bill Type</ScrollableTh>
                  <ScrollableTh>Bill Amount</ScrollableTh>
                  <ScrollableTh>Payment Method</ScrollableTh>
                  <ScrollableTh>Doctor</ScrollableTh>
                  <ScrollableTh>Billed By</ScrollableTh>
                  <ScrollableTh>Edited By</ScrollableTh>
                  <RemarksScrollableTh>Remarks</RemarksScrollableTh>{" "}
                  {/* see below */}
                  <ScrollableTh>Status</ScrollableTh>
                  <StickyActionsTh>Actions</StickyActionsTh>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <Tr key={index}>
                    {/* ── Frozen body cells ── */}
                    <StickyTd $left={COL.slNo.left} $width={COL.slNo.width}>
                      {index + 1}
                    </StickyTd>
                    <StickyTd
                      $left={COL.dateTime.left}
                      $width={COL.dateTime.width}
                    >
                      {formatBillDate(bill.investBillDate || bill.EstBillDate)}
                    </StickyTd>
                    <StickyTd $left={COL.billNo.left} $width={COL.billNo.width}>
                      {bill.investBillNo || bill.EstBillNo}
                    </StickyTd>
                    <StickyTd $left={COL.uhid.left} $width={COL.uhid.width}>
                      {bill.uhid}
                    </StickyTd>
                    <StickyTd $left={COL.ipNo.left} $width={COL.ipNo.width}>
                      {bill.ipNumber}
                    </StickyTd>
                    <StickyTd
                      $left={COL.patientName.left}
                      $width={COL.patientName.width}
                      $last
                    >
                      {fmtName(
                        bill.salutation,
                        bill.firstName,
                        bill.middleName,
                        bill.lastName,
                      )}
                    </StickyTd>
                    {/* ── Scrollable body cells ── */}
                    <Td>
                      {bill.age && bill.age_type
                        ? `${bill.age}/${bill.age_type}`
                        : "-"}
                    </Td>
                    <Td>{bill.roomNo}</Td>
                    <Td>{bill.bill_name}</Td>
                    <Td>₹ {bill.finalPrice}</Td>
                    <Td>{bill.paymentMethod}</Td>
                    <Td>{bill.doctorName}</Td>
                    <Td>{bill.created_by}</Td>
                    <Td>
                      {bill.history && bill.history.length > 0
                        ? bill.history[bill.history.length - 1].modified_by ||
                        "—"
                        : "—"}
                    </Td>
                    <RemarksTd>
                      {bill.history && bill.history.length > 0
                        ? bill.history.map((h, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom:
                                i < bill.history.length - 1 ? 6 : 0,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                color: colors.textMain,
                              }}
                            >
                              {h.editRemarks || "—"}
                            </span>
                            {h.modified_by && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: colors.textMuted,
                                }}
                              >
                                by {h.modified_by} ·{" "}
                                {h.modified_date
                                  ? new Date(
                                    h.modified_date + "Z",
                                  ).toLocaleDateString("en-IN")
                                  : ""}
                              </span>
                            )}
                          </div>
                        ))
                        : "—"}
                    </RemarksTd>
                    <Td>{bill.paymentStatus}</Td>
                    <StickyActionsTd>
                      <ActionsEyeBtn
                        type="button"
                        title="View Actions"
                        onClick={() => setActionsBill(bill)}
                      >
                        <EyeSVG />
                      </ActionsEyeBtn>
                    </StickyActionsTd>
                  </Tr>
                ))}
              </tbody>
            </table>
          </FrozenTableWrapper>
        ) : (
          <EmptyState>
            <p>No matching records found</p>
          </EmptyState>
        )}
      </ContentCard>
      {/* ── Actions Modal (eye icon) ── */}
      {actionsBill && (() => {
        const b = actionsBill;
        const billNo = b.investBillNo || b.EstBillNo;
        const locked = isBarcodeLocked(b);
        const isPending = b.paymentStatus === "Pending";
        const close = () => setActionsBill(null);
        const run = (fn) => {
          close();
          fn(b);
        };

        const editDisabled = !isPending || locked;
        const deleteDisabled = !isPending || locked;
        const refundDisabled = isPending || locked;

        const tiles = [
          {
            key: "print",
            icon: <PrintSVG />,
            title: "Print Bill",
            sub: "Print or export PDF",
            theme: { bg: "#f0f9ff", border: "#bae6fd", color: "#0369a1", iconBg: "rgba(2,132,199,0.15)" },
            onClick: () => run(handlePrint),
          },
          {
            key: "items",
            icon: "👁",
            title: "View Items",
            sub: "See billed investigations",
            theme: { bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9", iconBg: "rgba(124,58,237,0.15)" },
            onClick: () => run(setViewBill),
          },
          canEdit && {
            key: "edit",
            icon: "✏️",
            title: "Edit Bill",
            sub: locked
              ? "Locked (Barcode generated)"
              : !isPending
                ? "Locked (Not pending)"
                : "Modify bill items",
            disabled: editDisabled,
            theme: { bg: "#fffbeb", border: "#fde68a", color: "#b45309", iconBg: "rgba(245,158,11,0.18)" },
            onClick: () => run(handleEdit),
          },
          canDelete && {
            key: "delete",
            icon: "🗑️",
            title: "Delete Bill",
            sub: locked
              ? "Locked (Barcode generated)"
              : !isPending
                ? "Locked (Not pending)"
                : "Permanently remove",
            disabled: deleteDisabled,
            theme: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", iconBg: "rgba(220,38,38,0.15)" },
            onClick: () => run(handleDelete),
          },
          {
            key: "refund",
            icon: "💸",
            title: "Refund",
            sub: locked
              ? "Locked (Barcode generated)"
              : isPending
                ? "Not available (Pending)"
                : "Refund selected items",
            disabled: refundDisabled,
            theme: { bg: "#ecfeff", border: "#a5f3fc", color: "#0e7490", iconBg: "rgba(8,145,178,0.15)" },
            onClick: () => run(handleRefund),
          },
          b.refunds && b.refunds.length > 0 && {
            key: "refund-history",
            icon: <RefundHistorySVG />,
            title: "View Refunds",
            sub: `${b.refunds.length} refund${b.refunds.length > 1 ? "s" : ""} on this bill`,
            theme: { bg: "#f0fdfa", border: "#99f6e4", color: "#0f766e", iconBg: "rgba(13,148,136,0.15)" },
            onClick: () => run(setViewRefundBill),
          },
        ].filter(Boolean);

        return (
          <ModalOverlay onClick={close}>
            <ModalBox style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>👁 Bill Actions — {billNo}</ModalTitle>
                <ModalClose onClick={close}>✕</ModalClose>
              </ModalHeader>

              <ModalBody>
                <ActionsInfoCard>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: "0.9rem", color: colors.textMain }}>
                      {fmtName(b.salutation, b.firstName, b.middleName, b.lastName) || "Patient"}
                    </strong>
                    <StatusBadge $ok={!isPending}>{b.paymentStatus || "—"}</StatusBadge>
                  </div>
                  <ActionsInfoGrid>
                    <div>
                      <InfoLabel>Bill No</InfoLabel>
                      <strong>{billNo}</strong>
                    </div>
                    <div>
                      <InfoLabel>UHID</InfoLabel>
                      <strong>{b.uhid || "—"}</strong>
                    </div>
                    <div>
                      <InfoLabel>IP No</InfoLabel>
                      <strong>{b.ipNumber || "—"}</strong>
                    </div>
                    <div>
                      <InfoLabel>Bill Type</InfoLabel>
                      <strong>{b.bill_name || "—"}</strong>
                    </div>
                    <div>
                      <InfoLabel>Amount</InfoLabel>
                      <strong style={{ color: colors.primary }}>₹ {b.finalPrice}</strong>
                    </div>
                    <div>
                      <InfoLabel>Date</InfoLabel>
                      <strong>{formatBillDate(b.investBillDate || b.EstBillDate)}</strong>
                    </div>
                  </ActionsInfoGrid>
                </ActionsInfoCard>

                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 10,
                  }}
                >
                  Available Actions
                </div>

                <ActionsGrid>
                  {tiles.map((t) => (
                    <ActionTile
                      key={t.key}
                      type="button"
                      disabled={t.disabled}
                      onClick={t.onClick}
                      $bg={t.disabled ? "#f8fafc" : t.theme.bg}
                      $border={t.disabled ? "#e2e8f0" : t.theme.border}
                      $color={t.disabled ? "#94a3b8" : t.theme.color}
                    >
                      <ActionTileIcon
                        $bg={t.disabled ? "#e2e8f0" : t.theme.iconBg}
                        $color={t.disabled ? "#94a3b8" : t.theme.color}
                      >
                        {t.icon}
                      </ActionTileIcon>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{t.title}</div>
                        <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 2 }}>
                          {t.sub}
                        </div>
                      </div>
                    </ActionTile>
                  ))}
                </ActionsGrid>
              </ModalBody>

              <RemarksModalFooter>
                <CancelBtn type="button" onClick={close}>
                  Close
                </CancelBtn>
              </RemarksModalFooter>
            </ModalBox>
          </ModalOverlay>
        );
      })()}
      {/* ── View Items Modal ── */}
      {viewBill && (
        <ModalOverlay onClick={() => setViewBill(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                🔬 Items — Bill No:{" "}
                {viewBill.investBillNo || viewBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={() => setViewBill(null)}>✕</ModalClose>
            </ModalHeader>
            <ModalBody>
              <ModalTable>
                <thead>
                  <tr>
                    <ModalTh>Sl.No</ModalTh>
                    <ModalTh>Item Name</ModalTh>
                    <ModalTh>Qty</ModalTh>
                    <ModalTh>Price</ModalTh>
                    <ModalTh>Amount</ModalTh>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(viewBill.item) && viewBill.item.length > 0 ? (
                    viewBill.item.map((item, idx) => (
                      <tr key={idx}>
                        <ModalTd>{idx + 1}</ModalTd>
                        <ModalTd>{item.itemName}</ModalTd>
                        <ModalTd>{item.quantity || 1}</ModalTd>
                        <ModalTd>₹ {parseFloat(item.price).toFixed(2)}</ModalTd>
                        <ModalTd>
                          ₹{" "}
                          {(
                            parseFloat(item.price) *
                            parseInt(item.quantity || 1)
                          ).toFixed(2)}
                        </ModalTd>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <ModalTd
                        colSpan={5}
                        style={{ textAlign: "center", color: colors.textMuted }}
                      >
                        No items found
                      </ModalTd>
                    </tr>
                  )}
                </tbody>
              </ModalTable>
              <ModalTotalRow>
                <span>Total:</span>
                <span>₹ {parseFloat(viewBill.total || 0).toFixed(2)}</span>
                <span style={{ marginLeft: 12 }}>
                  Discount: ₹ {viewBill.discount || "0.00"}
                </span>
                <span style={{ marginLeft: 12, color: colors.primary }}>
                  Net: ₹ {viewBill.finalPrice || "0.00"}
                </span>
              </ModalTotalRow>
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
      {/* ── Delete Remarks Modal ── */}
      {deleteBill && (
        <ModalOverlay onClick={handleDeleteCancel}>
          <RemarksModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader style={{ background: colors.danger }}>
              <ModalTitle>
                🗑️ Delete Remarks — Bill No:{" "}
                {deleteBill.investBillNo || deleteBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={handleDeleteCancel}>✕</ModalClose>
            </ModalHeader>
            <RemarksModalBody>
              <Label>
                Reason for Deletion{" "}
                <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>
              </Label>
              <RemarksTextarea
                $error={deleteRemarksErr}
                placeholder="Enter reason for deleting this bill..."
                value={deleteRemarks}
                onChange={(e) => {
                  setDeleteRemarks(e.target.value);
                  if (e.target.value.trim()) setDeleteRemarksErr(false);
                }}
                autoFocus
              />
              {deleteRemarksErr && (
                <ErrorText>
                  ⚠ Reason is required to proceed with deletion.
                </ErrorText>
              )}
            </RemarksModalBody>
            <RemarksModalFooter>
              <CancelBtn type="button" onClick={handleDeleteCancel}>
                Cancel
              </CancelBtn>
              <ConfirmBtn
                type="button"
                onClick={handleDeleteConfirm}
                style={{ background: colors.danger }}
              >
                🗑️ Confirm Delete
              </ConfirmBtn>
            </RemarksModalFooter>
          </RemarksModalBox>
        </ModalOverlay>
      )}
      {/* ── Edit Remarks Modal ── */}
      {remarksBill && (
        <ModalOverlay onClick={handleRemarksCancel}>
          <RemarksModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                ✏️ Edit Remarks — Bill No:{" "}
                {remarksBill.investBillNo || remarksBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={handleRemarksCancel}>✕</ModalClose>
            </ModalHeader>
            <RemarksModalBody>
              <Label>
                Remarks{" "}
                <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>
              </Label>
              <RemarksTextarea
                $error={remarksError}
                placeholder="Enter reason for editing this bill..."
                value={remarksValue}
                onChange={(e) => {
                  setRemarksValue(e.target.value);
                  if (e.target.value.trim()) setRemarksError(false);
                }}
                autoFocus
              />
              {remarksError && (
                <ErrorText>
                  ⚠ Remarks is required to proceed with edit.
                </ErrorText>
              )}
            </RemarksModalBody>
            <RemarksModalFooter>
              <CancelBtn type="button" onClick={handleRemarksCancel}>
                Cancel
              </CancelBtn>
              <ConfirmBtn type="button" onClick={handleRemarksConfirm}>
                ✏️ Proceed to Edit
              </ConfirmBtn>
            </RemarksModalFooter>
          </RemarksModalBox>
        </ModalOverlay>
      )}
      {/* ── Refund Items Modal ── */} {/* ← ADD FROM HERE */}
      {refundBill && (
        <ModalOverlay onClick={handleRefundCancel}>
          <RefundModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader style={{ background: "#0891b2" }}>
              <ModalTitle>
                💸 Refund — Bill No:{" "}
                {refundBill.investBillNo || refundBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={handleRefundCancel}>✕</ModalClose>
            </ModalHeader>

            <RefundModalBody>
              {Array.isArray(refundBill.item) && refundBill.item.length > 0 ? (
                <>
                  <SelectAllRow>
                    <input
                      type="checkbox"
                      id="refund-select-all"
                      checked={refundSelected.length === refundBill.item.length}
                      onChange={toggleSelectAll}
                    />
                    <label
                      htmlFor="refund-select-all"
                      style={{ cursor: "pointer" }}
                    >
                      Select All ({refundBill.item.length} items)
                    </label>
                  </SelectAllRow>

                  {refundBill.item.map((it, idx) => (
                    <ItemCheckRow
                      key={idx}
                      $checked={refundSelected.includes(idx)}
                    >
                      <input
                        type="checkbox"
                        checked={refundSelected.includes(idx)}
                        onChange={() => toggleRefundItem(idx)}
                      />
                      <ItemInfo>
                        <ItemName>{it.itemName}</ItemName>
                        <ItemMeta>
                          Qty: {it.quantity || 1}
                          {it.test_id ? `  ·  Test ID: ${it.test_id}` : ""}
                          {it.billTypeNo ? `  ·  ${it.billTypeNo}` : ""}
                        </ItemMeta>
                      </ItemInfo>
                      <ItemPrice>
                        ₹{" "}
                        {(
                          parseFloat(it.price || 0) *
                          parseInt(it.quantity || 1, 10)
                        ).toFixed(2)}
                      </ItemPrice>
                    </ItemCheckRow>
                  ))}

                  <div style={{ marginTop: 4 }}>
                    <Label>
                      Remarks{" "}
                      <span style={{ color: colors.danger, marginLeft: 2 }}>
                        *
                      </span>
                    </Label>
                    <RemarksTextarea
                      $error={refundRemarksErr}
                      placeholder="Enter reason for refund..."
                      value={refundRemarks}
                      onChange={(e) => {
                        setRefundRemarks(e.target.value);
                        if (e.target.value.trim()) setRefundRemarksErr(false);
                      }}
                    />
                    {refundRemarksErr && (
                      <ErrorText>
                        ⚠ Remarks is required to process refund.
                      </ErrorText>
                    )}
                  </div>

                  <RefundSummaryBar>
                    <span>
                      {refundSelected.length} item
                      {refundSelected.length !== 1 ? "s" : ""} selected
                    </span>
                    <RefundTotal>
                      Refund Total: ₹ {refundTotal.toFixed(2)}
                    </RefundTotal>
                  </RefundSummaryBar>
                </>
              ) : (
                <EmptyState>
                  <p>No items found for this bill</p>
                </EmptyState>
              )}
            </RefundModalBody>

            <RemarksModalFooter>
              <CancelBtn type="button" onClick={handleRefundCancel}>
                Cancel
              </CancelBtn>
              <ConfirmRefundBtn
                type="button"
                onClick={handleRefundConfirm}
                disabled={!refundSelected.length || refundSubmitting}
              >
                {refundSubmitting ? "Processing..." : "💸 Confirm Refund"}
              </ConfirmRefundBtn>
            </RemarksModalFooter>
          </RefundModalBox>
        </ModalOverlay>
      )}
      {/* ── Refund History Modal ── */}
      {viewRefundBill && (
        <ModalOverlay onClick={() => setViewRefundBill(null)}>
          <ModalBox
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader style={{ background: "#0f766e" }}>
              <ModalTitle>
                🔁 Refunds — Bill No:{" "}
                {viewRefundBill.investBillNo || viewRefundBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={() => setViewRefundBill(null)}>✕</ModalClose>
            </ModalHeader>

            <ModalBody>
              {viewRefundBill.refunds.map((r, ri) => (
                <div
                  key={ri}
                  style={{
                    marginBottom: 14,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  {/* Refund bill header */}
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "6px 10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: colors.textMain,
                    }}
                  >
                    <span>📄 {r.refundBillNo || `Refund #${ri + 1}`}</span>
                    <span style={{ fontWeight: 400, color: colors.textMuted }}>
                      {r.refundBillDate ? formatBillDate(r.refundBillDate) : ""}
                    </span>
                  </div>

                  {/* Remarks */}
                  {r.refundRemarks && (
                    <div
                      style={{
                        padding: "5px 10px",
                        fontSize: "0.76rem",
                        color: colors.textMuted,
                        borderBottom: `1px solid ${colors.border}`,
                        background: "#fffbeb",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: colors.textMain }}>
                        Remarks:{" "}
                      </span>
                      {r.refundRemarks}
                    </div>
                  )}

                  {/* Items table */}
                  <ModalTable>
                    <thead>
                      <tr>
                        <ModalTh>Sl.No</ModalTh>
                        <ModalTh>Item Name</ModalTh>
                        <ModalTh>Qty</ModalTh>
                        <ModalTh>Price</ModalTh>
                        <ModalTh>Amount</ModalTh>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(r.item) && r.item.length > 0 ? (
                        r.item.map((it, idx) => (
                          <tr key={idx}>
                            <ModalTd>{idx + 1}</ModalTd>
                            <ModalTd>{it.itemName}</ModalTd>
                            <ModalTd>{it.quantity || 1}</ModalTd>
                            <ModalTd>
                              ₹ {parseFloat(it.price || 0).toFixed(2)}
                            </ModalTd>
                            <ModalTd>
                              ₹{" "}
                              {(
                                parseFloat(it.price || 0) *
                                parseInt(it.quantity || 1, 10)
                              ).toFixed(2)}
                            </ModalTd>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <ModalTd
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              color: colors.textMuted,
                            }}
                          >
                            No items
                          </ModalTd>
                        </tr>
                      )}
                    </tbody>
                  </ModalTable>

                  {/* Refund subtotal */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "6px 10px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#0891b2",
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    Refund Total: ₹{" "}
                    {(Array.isArray(r.item) ? r.item : [])
                      .reduce(
                        (s, it) =>
                          s +
                          parseFloat(it.price || 0) *
                          parseInt(it.quantity || 1, 10),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </div>
              ))}
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
      {/* ── Print Modal (fast in-page preview, replaces window.open) ── */}
      {printJob && (
        <PrintModal
          bill={printJob.bill}
          doctors={doctors}
          isEstimate={printJob.isEstimate}
          isDuplicate={printJob.isDuplicate ?? true}
          onClose={() => setPrintJob(null)}
        />
      )}
    </PageContainer>
  );
};

export default BillsReport;
