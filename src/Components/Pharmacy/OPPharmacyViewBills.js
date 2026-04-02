import React, { useState, useEffect, useCallback } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ────────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f0f4f8;
    color: #2d3748;
    font-size: 13px;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; }`;
const spin    = keyframes`to { transform:rotate(360deg); }`;

// ─── Layout ────────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 18px 24px;
  min-height: 100vh;
  background: #f0f4f8;
`;

const PageTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 14px;
  letter-spacing: 0.3px;
`;

// ─── Filter Bar ────────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const Select = styled.select`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 28px 0 9px;
  font-size: 13px;
  color: #2d3748;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23718096'/%3E%3C/svg%3E") no-repeat right 9px center;
  appearance: none;
  cursor: pointer;
  outline: none;
  &:focus { border-color:#3182ce; box-shadow:0 0 0 2px rgba(49,130,206,0.15); }
`;

const Input = styled.input`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 9px;
  font-size: 13px;
  color: #2d3748;
  outline: none;
  &:focus { border-color:#3182ce; box-shadow:0 0 0 2px rgba(49,130,206,0.15); }
`;

const SearchBtn = styled.button`
  height: 34px;
  padding: 0 20px;
  background: #2b6cb0;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.18s;
  &:hover  { background: #2c5282; }
  &:active { background: #1a365d; }
`;

// ─── Table Card ────────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
`;

const ShowEntries = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  select { width: 64px; }
`;

const SelectedBadge = styled.div`
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  color: #2b6cb0;
  font-size: 12px;
  font-weight: 600;
  border-radius: 5px;
  padding: 4px 12px;
`;

const TableSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  input { width: 180px; }
`;

const TableWrapper = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
`;

const Thead = styled.thead`background: #edf2f7;`;

const Th = styled.th`
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  &:hover { color: #2b6cb0; }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #edf2f7;
  transition: background 0.12s;
  &:hover { background: #f7fafc; }
  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 9px 12px;
  font-size: 13px;
  color: #2d3748;
  white-space: nowrap;
`;

// ─── Badges ────────────────────────────────────────────────────────────────────
const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  ${({ variant }) => {
    switch (variant) {
      case "cash":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "multiple": return "background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;";
      case "card":     return "background:#dbeafe; color:#1e40af; border:1px solid #93c5fd;";
      case "upi":      return "background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd;";
      case "ip":       return "background:#fef3c7; color:#92400e; border:1px solid #fcd34d;";
      case "notpaid":  return "background:#fff1f2; color:#9f1239; border:1px solid #fecdd3; font-style:italic;";
      case "paid":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "billed":   return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
      default:         return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
    }
  }}
`;

// ─── Action Buttons ────────────────────────────────────────────────────────────
const ActionGroup = styled.div`display:flex; gap:5px; align-items:center;`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  background: none;
  ${({ variant }) => {
    switch (variant) {
      case "edit":   return "background:#ebf8ff; border-color:#bee3f8; color:#2b6cb0; &:hover{background:#bee3f8;}";
      case "delete": return "background:#fff5f5; border-color:#fed7d7; color:#c53030; &:hover{background:#fed7d7;}";
      case "print":  return "background:#f0fff4; border-color:#c6f6d5; color:#276749; &:hover{background:#c6f6d5;}";
      case "copy":   return "background:#faf5ff; border-color:#e9d8fd; color:#6b46c1; &:hover{background:#e9d8fd;}";
      default:       return "background:#f7fafc; border-color:#e2e8f0; color:#4a5568;";
    }
  }}
`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-wrap: wrap;
  gap: 8px;
`;

const PaginationInfo = styled.span`font-size:12px; color:#718096;`;
const PaginationBtns = styled.div`display:flex; gap:4px;`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid ${({ active }) => (active ? "#2b6cb0" : "#e2e8f0")};
  background: ${({ active }) => (active ? "#2b6cb0" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#4a5568")};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "700" : "400")};
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { background:${({ active }) => (active ? "#2c5282" : "#edf2f7")}; }
  &:disabled { opacity:0.45; cursor:not-allowed; }
`;

// ─── Misc ──────────────────────────────────────────────────────────────────────
const Spinner = styled.div`
  width:32px; height:32px;
  border:3px solid #e2e8f0; border-top-color:#2b6cb0;
  border-radius:50%; animation:${spin} 0.7s linear infinite;
  margin:40px auto;
`;

const EmptyMsg = styled.div`
  text-align:center; padding:40px; color:#a0aec0; font-size:14px;
`;

const AmountCell = styled.span`font-variant-numeric:tabular-nums; font-weight:500;`;

const StatPill = styled.span`
  display:inline-flex; align-items:center;
  padding:4px 12px; border-radius:20px;
  font-size:12px; font-weight:700;
  background:${({ bg }) => bg};
  color:${({ color }) => color};
  border:1px solid ${({ border }) => border};
`;

// ─── Edit Confirmation Modal Styled Components ─────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  width: 90%;
  max-width: 440px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(15,118,110,0.08);
  overflow: hidden;
  animation: ${fadeIn} 0.25s cubic-bezier(0.22,1,0.36,1);
`;

const ModalTopBar = styled.div`
  padding: 18px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  ${({ variant }) => variant === "delete" ? `
    background: linear-gradient(130deg, #991b1b 0%, #dc2626 100%);
  ` : `
    background: linear-gradient(130deg, #1e40af 0%, #2563eb 100%);
  `}

  &::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    background: rgba(255,255,255,0.07);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const ModalIcon = styled.div`
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const ModalHeading = styled.div`
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const ModalSubHeading = styled.div`
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  margin-top: 2px;
`;

const ModalBody = styled.div`
  padding: 22px 24px 20px;
`;

const ConfirmText = styled.p`
  font-size: 13.5px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 6px;
`;

const BillRef = styled.span`
  font-weight: 700;
  color: #1e40af;
  font-family: monospace;
  background: #eff6ff;
  padding: 1px 7px;
  border-radius: 5px;
  border: 1px solid #bfdbfe;
`;

const ReasonSection = styled.div`
  margin-top: 16px;
  animation: ${fadeIn} 0.2s ease;
`;

const ReasonLabel = styled.label`
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 7px;

  span {
    color: #dc2626;
    margin-left: 2px;
  }
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #1f2937;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background: #f9fafb;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    background: #fff;
  }

  &::placeholder { color: #9ca3af; font-style: italic; }
`;

const ReasonError = styled.div`
  margin-top: 5px;
  font-size: 11.5px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ModalFooter = styled.div`
  padding: 14px 24px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ModalBtn = styled.button`
  height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ variant }) => variant === "cancel" ? `
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    &:hover { background: #e2e8f0; }
  ` : variant === "confirm" ? `
    background: linear-gradient(135deg, #1e40af, #2563eb);
    color: #fff;
    box-shadow: 0 2px 8px rgba(37,99,235,0.25);
    &:hover { background: linear-gradient(135deg, #1d3faa, #1e40af); }
    &:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  ` : variant === "danger" ? `
    background: linear-gradient(135deg, #991b1b, #dc2626);
    color: #fff;
    box-shadow: 0 2px 8px rgba(220,38,38,0.25);
    &:hover { background: linear-gradient(135deg, #7f1d1d, #991b1b); }
    &:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  ` : `
    background: #f1f5f9;
    color: #374151;
  `}
`;

const StepDots = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
`;

const StepDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: ${({ active }) => active ? "#2563eb" : "#e2e8f0"};
  transition: background 0.2s;
`;

const StepLine = styled.div`
  flex: 1;
  height: 2px;
  background: ${({ active }) => active ? "#2563eb" : "#e2e8f0"};
  transition: background 0.2s;
`;

// ─── Delete Modal specific styled components ───────────────────────────────────
const DeleteWarningBox = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 12px;
  font-size: 12.5px;
  color: #c53030;
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

// ─── Pure helpers (no state) ───────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const hours24 = d.getHours();
  const minutes  = d.getMinutes();
  const seconds  = d.getSeconds();
  const ampm     = hours24 >= 12 ? "PM" : "AM";
  const hours12  = hours24 % 12 || 12;
  return `${String(hours12).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")} ${ampm}`;
};

/**
 * payment_details arrives as a Python OrderedDict string, e.g.:
 *   "OrderedDict([('method', 'cash'), ('Paid_amount', 103)])"
 *   "OrderedDict([('method', 'Multiple Payment'), ...])"
 *
 * Handles both single-quoted and double-quoted variants robustly.
 * Returns null if not parseable — badge will show "—" in that case.
 */
const parsePaymentMethod = (raw) => {
  if (!raw) return null;

  // Standard Python OrderedDict single-quoted: ('method', 'Cash')
  const singleQ = raw.match(/\(\s*'method'\s*,\s*'([^']+)'\s*\)/i);
  if (singleQ) return singleQ[1];

  // Double-quoted variant: ("method", "Cash")
  const doubleQ = raw.match(/\(\s*"method"\s*,\s*"([^"]+)"\s*\)/i);
  if (doubleQ) return doubleQ[1];

  // JSON-style colon: 'method': 'Cash'
  const colonStyle = raw.match(/['"]method['"]\s*:\s*['"]([^'"]+)['"]/i);
  if (colonStyle) return colonStyle[1];

  return null;
};

const paymentVariant = (method) => {
  if (!method) return "default";
  const m = method.toLowerCase();
  if (m.includes("multiple")) return "multiple";
  if (m.includes("cash"))     return "cash";
  if (m.includes("card"))     return "card";
  if (m.includes("upi"))      return "upi";
  if (m.includes("ip") || m.includes("credit")) return "ip";
  return "default";
};

/**
 * Map bill_type numeric codes → readable labels.
 */
const BILL_TYPE_LABELS = {
  "42": "PHARMACY OP BILL",
  "43": "PHARMACY IP BILL",
  "44": "PHARMACY OTC BILL",
};

const billTypeLabel = (code) => BILL_TYPE_LABELS[code] || `Bill Type ${code}`;

// ─── Search-by options (label shown in UI, value sent to API) ─────────────────
const SEARCH_BY_OPTIONS = [
  { label: "Bill Date",    value: "bill_date"    },
  { label: "Patient Name", value: "patient_name" },
  { label: "UHID",         value: "uhid"         },
  { label: "Bill Number",  value: "bill_no"      },
];

const ENTRIES_OPTIONS = [10, 25, 50, 100];

// ─── formatBillData — maps exact API field names to internal shape ─────────────
const formatBillData = (bills) =>
  bills.map((b) => ({
    id:             b.Bill_id,
    Bill_id:        b.Bill_id,
    bill_date:      b.bill_date      || b.created_date || "",
    uhid:           b.uhid           || "",
    patient_name:   b.patient_name   || "",
    payment_method: parsePaymentMethod(b.payment_details) || null,
    payment_details: b.payment_details || null,
    billing_mode:   b.billing_mode    || "",
    billing_status: b.billing_status || "",
    bill_number:    b.bill_no        || "",
    bill_no:        b.bill_no        || "",
    bill_type:      b.bill_type      || "",
    estimate_no:    b.estimate_no    || null,
    total_amount:   parseFloat(b.total_amount ?? 0),
    net_amount:     parseFloat(b.net_amount   ?? 0),
    discount:       parseFloat(b.overall_discount_amount ?? 0),
    overall_discount_type:   b.overall_discount_type  || "percent",
    overall_discount_value:  b.overall_discount_value ?? 0,
    overall_discount_amount: parseFloat(b.overall_discount_amount ?? 0),
    doctor_id:      b.doctor_id      || "",
    inpatient_number: b.inpatient_number || "",
    room_no:        b.room_no        || "",
    medicine_particulars: b.medicine_particulars || [],
  }));

// ─── Component ────────────────────────────────────────────────────────────────
export default function OPPharmacyViewBills({ onEditBill, onSwitchToPharmacy }) {
  const [fromDate,       setFromDate]       = useState(today());
  const [toDate,         setToDate]         = useState(today());
  const [searchBy,       setSearchBy]       = useState(SEARCH_BY_OPTIONS[0].value);
  const [searchText,     setSearchText]     = useState("");

  const [billTypeFilter, setBillTypeFilter] = useState("ALL");
  const [billTypeCodes,  setBillTypeCodes]  = useState([]);

  const [allBills,       setAllBills]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");

  const [tableSearch,    setTableSearch]    = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [sortKey,        setSortKey]        = useState("bill_date");
  const [sortDir,        setSortDir]        = useState("desc");

  // ── Edit Confirmation Modal ───────────────────────────────────────────────
  const [editModalBill,  setEditModalBill]  = useState(null);
  const [editStep,       setEditStep]       = useState(1);
  const [editReason,     setEditReason]     = useState("");
  const [reasonError,    setReasonError]    = useState(false);

  // ── Delete Confirmation Modal ─────────────────────────────────────────────
  const [deleteModalBill,   setDeleteModalBill]   = useState(null);
  const [deleteReason,      setDeleteReason]      = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState(false);
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [deleteError,       setDeleteError]       = useState("");

  // ── Edit Modal Handlers ───────────────────────────────────────────────────

  const [printBill, setPrintBill] = useState(null);

  const handlePrint = (bill) => {
  setPrintBill(bill);
};
const handlePrintNow = () => {
  const content = document.getElementById("print-area").innerHTML;
  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #000; padding: 6px; font-size: 12px; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);

  win.document.close();
  win.print();
};
  const openEditModal = (bill) => {
    setEditModalBill(bill);
    setEditStep(1);
    setEditReason("");
    setReasonError(false);
  };

  const closeEditModal = () => {
    setEditModalBill(null);
    setEditStep(1);
    setEditReason("");
    setReasonError(false);
  };

  const handleEditConfirm = () => {
    setEditStep(2);
    setReasonError(false);
  };

  const handleEditProceed = () => {
    if (!editReason.trim()) {
      setReasonError(true);
      return;
    }
    if (onEditBill) onEditBill({ ...editModalBill, editReason: editReason.trim() });
    if (onSwitchToPharmacy) onSwitchToPharmacy();
    closeEditModal();
  };

  // ── Delete Modal Handlers ─────────────────────────────────────────────────
  const openDeleteModal = (bill) => {
    setDeleteModalBill(bill);
    setDeleteReason("");
    setDeleteReasonError(false);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteModalBill(null);
    setDeleteReason("");
    setDeleteReasonError(false);
    setDeleteError("");
  };

  /**
   * Calls the backend delete endpoint.
   * Backend will:
   *   1. Soft-delete the OPPharmacyBill (is_deleted = True)
   *   2. Decrease PharmacyStock.blocked_quantity for each medicine_particular
   *      matched by item_id + batch_number
   */
  const handleDeleteConfirm = async () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError(true);
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const response = await apiRequest(
        `${HmsBaseUrl}oppharmacy_deletebill/`,
        "POST",
        {
          bill_id: deleteModalBill.Bill_id,
          delete_reason: deleteReason.trim(),
        }
      );

      // ✅ SUCCESS
      if (response.status === "success") {
        // Remove from UI
        setAllBills((prev) =>
          prev.filter((b) => b.Bill_id !== deleteModalBill.Bill_id)
        );
        closeDeleteModal();
      } else {
        // ✅ BACKEND ERROR MESSAGE
        setDeleteError(response.message || "Delete failed. Please try again.");
      }
    } catch (err) {
      console.error("Delete API error:", err);
      setDeleteError(
        err?.response?.data?.message ||
        "Something went wrong while deleting. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}OPPharmacy_pending_bills/`,
        "GET"
      );

      const billsArray = Array.isArray(response?.data) ? response.data : [];
      console.log("Raw pending bills data:", response?.data);

     const formatted = formatBillData(
  billsArray.filter(b => !b.is_deleted)
);
      setAllBills(formatted);
      setCurrentPage(1);

      const codes = [...new Set(billsArray.map((b) => b.bill_type).filter(Boolean))];
      setBillTypeCodes(codes);

    } catch (err) {
      console.error("Pending bills error:", err);
      setError("Unable to connect to HMS server");
      setAllBills([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, searchBy, searchText]);

  useEffect(() => { fetchBills(); }, []); // eslint-disable-line

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = allBills.filter((b) => {
    // Bill type filter
    if (billTypeFilter !== "ALL" && b.bill_type !== billTypeFilter) return false;

    // Date range filter applied against bill_date
    if (fromDate || toDate) {
      const billDay = b.bill_date ? b.bill_date.split("T")[0] : null;
      if (billDay) {
        if (fromDate && billDay < fromDate) return false;
        if (toDate   && billDay > toDate)   return false;
      }
    }

    // Top-bar search: filter only by the selected "Search By" field
    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const fieldMap = {
        bill_date:    (b.bill_date    || "").slice(0, 10),
        patient_name: (b.patient_name || "").toLowerCase(),
        uhid:         (b.uhid         || "").toLowerCase(),
        bill_no:      (b.bill_number  || "").toLowerCase(),
      };
      const val = fieldMap[searchBy] ?? "";
      if (!val.includes(q)) return false;
    }

    // Table quick-search (searches all visible text columns)
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return (
        (b.patient_name   || "").toLowerCase().includes(q) ||
        (b.uhid           || "").toLowerCase().includes(q) ||
        (b.bill_number    || "").toLowerCase().includes(q) ||
        (b.payment_method || "").toLowerCase().includes(q) ||
        (b.billing_status || "").toLowerCase().includes(q)
      );
    }

    return true;
  });

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] ?? "";
    let bv = b[sortKey] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  // ── Paginate ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / entriesPerPage));
  const paginated  = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) =>
    sortKey !== col
      ? <span style={{ opacity:0.3 }}> ↕</span>
      : <span style={{ color:"#2b6cb0" }}>{sortDir === "asc" ? " ↑" : " ↓"}</span>;

  const paidCount   = allBills.filter((b) => b.billing_status === "Paid").length;
  const billedCount = allBills.filter((b) => b.billing_status === "Billed").length;

  const getPageNums = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta)
        pages.push(i);
      else if (pages[pages.length - 1] !== "...")
        pages.push("...");
    }
    return pages;
  };

  // ─── Helper: is this bill "Paid"? ─────────────────────────────────────────
  const isPaid = (bill) =>
    (bill.billing_status || "").toLowerCase() === "paid";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <PageTitle>Pharmacy OP Bills — View Bills</PageTitle>

        {/* ── Filter Bar ── */}
        <FilterCard>
          <FieldGroup>
            <Label>Bill Type</Label>
            <Select
              value={billTypeFilter}
              onChange={(e) => { setBillTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ minWidth: 200 }}
            >
              <option value="ALL">All Types</option>
              {billTypeCodes.map((code) => (
                <option key={code} value={code}>{billTypeLabel(code)}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label>Search By</Label>
            <Select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ minWidth: 150 }}
            >
              {SEARCH_BY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup style={{ flex:1, minWidth:180 }}>
            <Label>Search Value</Label>
            <Input
              type="text"
              placeholder={`Search by ${SEARCH_BY_OPTIONS.find(s => s.value === searchBy)?.label}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchBills()}
            />
          </FieldGroup>

          <SearchBtn onClick={fetchBills}>
            <span>🔍</span> Search
          </SearchBtn>
        </FilterCard>

        {/* ── Stats Row ── */}
        {!loading && allBills.length > 0 && (
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <StatPill color="#276749" bg="#c6f6d5" border="#9ae6b4">Paid: {paidCount}</StatPill>
            <StatPill color="#744210" bg="#fefcbf" border="#f6e05e">Billed: {billedCount}</StatPill>
            <StatPill color="#2b6cb0" bg="#ebf8ff" border="#bee3f8">Total: {allBills.length}</StatPill>
          </div>
        )}

        {/* ── Table ── */}
        <TableCard>
          <TableToolbar>
            <ShowEntries>
              Show
              <Select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ width:64 }}
              >
                {ENTRIES_OPTIONS.map((n) => <option key={n}>{n}</option>)}
              </Select>
              entries
            </ShowEntries>

            <SelectedBadge>{filtered.length} SELECTED</SelectedBadge>

            <TableSearch>
              Search:
              <Input
                type="text"
                value={tableSearch}
                onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Filter table..."
              />
            </TableSearch>
          </TableToolbar>

          {error && (
            <div style={{ padding:"12px 16px", background:"#fff5f5", color:"#c53030", fontSize:13 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyMsg>No bills found for the selected criteria.</EmptyMsg>
          ) : (
            <TableWrapper>
              <Table>
                <Thead>
                  <tr>
                    <Th onClick={() => handleSort("bill_date")}>Bill Date <SortIcon col="bill_date" /></Th>
                    <Th onClick={() => handleSort("bill_date")}>Bill Time <SortIcon col="bill_date" /></Th>
                    <Th onClick={() => handleSort("uhid")}>UHID No <SortIcon col="uhid" /></Th>
                    <Th onClick={() => handleSort("patient_name")}>Patient <SortIcon col="patient_name" /></Th>
                    <Th onClick={() => handleSort("payment_method")}>Payment Mode <SortIcon col="payment_method" /></Th>
                    <Th onClick={() => handleSort("billing_status")}>Status <SortIcon col="billing_status" /></Th>
                    <Th onClick={() => handleSort("bill_number")}>Bill Number <SortIcon col="bill_number" /></Th>
                    <Th onClick={() => handleSort("total_amount")}>Bill Amount <SortIcon col="total_amount" /></Th>
                    <Th onClick={() => handleSort("net_amount")}>Net Amount <SortIcon col="net_amount" /></Th>
                    <Th>Actions</Th>
                  </tr>
                </Thead>
                <tbody>
                  {paginated.map((bill, idx) => (
                    <Tr key={bill.id ?? idx}>
                      <Td>{formatDate(bill.bill_date)}</Td>
                      <Td>{formatTime(bill.bill_date)}</Td>

                      <Td style={{ color:"#2b6cb0", fontWeight:500 }}>
                        {bill.uhid || "—"}
                      </Td>

                      <Td style={{ fontWeight:500 }}>
                        {bill.patient_name || "—"}
                      </Td>

                      <Td>
                        {bill.payment_method ? (
                          <Badge variant={paymentVariant(bill.payment_method)}>
                            {bill.payment_method}
                          </Badge>
                        ) : (
                          <Badge variant="notpaid">⏳ Not Yet Paid</Badge>
                        )}
                      </Td>

                      <Td>
                        <Badge variant={isPaid(bill) ? "paid" : "billed"}>
                          {bill.billing_status || "—"}
                        </Badge>
                      </Td>

                      <Td style={{ fontFamily:"monospace", fontSize:12 }}>
                        {bill.bill_number || "—"}
                      </Td>

                      <Td><AmountCell>₹ {bill.total_amount.toFixed(2)}</AmountCell></Td>
                      <Td><AmountCell>₹ {bill.net_amount.toFixed(2)}</AmountCell></Td>

                      <Td>
                        <ActionGroup>
                          {/* ── REQUIREMENT 1: Hide Edit button for Paid bills ── */}
                          {!isPaid(bill) && (
                            <IconBtn
                              variant="edit"
                              title="Edit"
                              onClick={() => openEditModal(bill)}
                            >
                              ✏️
                            </IconBtn>
                          )}

                          {/* ── REQUIREMENT 2 & 3: Delete opens confirmation modal ── */}
                          <IconBtn
                            variant="delete"
                            title="Delete"
                            onClick={() => openDeleteModal(bill)}
                          >
                            🗑️
                          </IconBtn>

                          <IconBtn variant="print" title="Print" onClick={() => window.print()}>
                            🖨️
                          </IconBtn>
                          <IconBtn
                            variant="copy"
                            title="Duplicate"
                            onClick={() => alert(`Duplicate: ${bill.bill_number}`)}
                          >
                            📋
                          </IconBtn>
                        </ActionGroup>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}

          {/* ── Pagination ── */}
          {!loading && filtered.length > 0 && (
            <PaginationBar>
              <PaginationInfo>
                Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)} to{" "}
                {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
                {filtered.length < allBills.length && ` (filtered from ${allBills.length} total)`}
              </PaginationInfo>
              <PaginationBtns>
                <PageBtn
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PageBtn>
                {getPageNums().map((p, i) =>
                  p === "..." ? (
                    <PageBtn key={`e${i}`} disabled>…</PageBtn>
                  ) : (
                    <PageBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                      {p}
                    </PageBtn>
                  )
                )}
                <PageBtn
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageBtn>
              </PaginationBtns>
            </PaginationBar>
          )}
        </TableCard>
      </PageWrapper>

      {/* ── Edit Confirmation Modal ── */}
      {editModalBill && (
        <ModalOverlay onClick={closeEditModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>

            <ModalTopBar>
              <ModalIcon>✏️</ModalIcon>
              <div>
                <ModalHeading>Edit Bill</ModalHeading>
                <ModalSubHeading>
                  {editStep === 1 ? "Confirm your intent" : "Provide an edit reason"}
                </ModalSubHeading>
              </div>
            </ModalTopBar>

            <ModalBody>
              <StepDots>
                <StepDot active={true} />
                <StepLine active={editStep === 2} />
                <StepDot active={editStep === 2} />
              </StepDots>

              {editStep === 1 && (
                <>
                  <ConfirmText>
                    Are you sure you want to edit bill{" "}
                    <BillRef>{editModalBill.bill_number || editModalBill.bill_no || "—"}</BillRef>
                    {" "}for patient{" "}
                    <strong>{editModalBill.patient_name || "—"}</strong>?
                  </ConfirmText>
                  <ConfirmText style={{ color: "#6b7280", fontSize: 12.5, marginTop: 6 }}>
                    This will load the bill details into the billing form for modification.
                    All existing entries will be replaced.
                  </ConfirmText>
                </>
              )}

              {editStep === 2 && (
                <>
                  <ConfirmText>
                    Editing bill{" "}
                    <BillRef>{editModalBill.bill_number || editModalBill.bill_no || "—"}</BillRef>.
                    Please provide a reason for this edit.
                  </ConfirmText>
                  <ReasonSection>
                    <ReasonLabel>
                      Reason for Edit <span>*</span>
                    </ReasonLabel>
                    <ReasonTextarea
                      autoFocus
                      placeholder="e.g. Wrong quantity entered, incorrect medicine selected..."
                      value={editReason}
                      onChange={(e) => {
                        setEditReason(e.target.value);
                        if (e.target.value.trim()) setReasonError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) handleEditProceed();
                      }}
                    />
                    {reasonError && (
                      <ReasonError>
                        ⚠ Reason is required to proceed with the edit.
                      </ReasonError>
                    )}
                  </ReasonSection>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <ModalBtn variant="cancel" onClick={closeEditModal}>
                ✕ Cancel
              </ModalBtn>

              {editStep === 1 ? (
                <ModalBtn variant="confirm" onClick={handleEditConfirm}>
                  ✓ Yes, Edit
                </ModalBtn>
              ) : (
                <ModalBtn
                  variant="confirm"
                  onClick={handleEditProceed}
                  disabled={!editReason.trim()}
                >
                  → Proceed to Edit
                </ModalBtn>
              )}
            </ModalFooter>

          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalBill && (
        <ModalOverlay onClick={!deleteLoading ? closeDeleteModal : undefined}>
          <ModalBox onClick={(e) => e.stopPropagation()}>

            <ModalTopBar variant="delete">
              <ModalIcon>🗑️</ModalIcon>
              <div>
                <ModalHeading>Delete Bill</ModalHeading>
                <ModalSubHeading>This action cannot be undone</ModalSubHeading>
              </div>
            </ModalTopBar>

            <ModalBody>
              <ConfirmText>
                You are about to permanently delete bill{" "}
                <BillRef style={{ color:"#991b1b", background:"#fff5f5", borderColor:"#fecaca" }}>
                  {deleteModalBill.bill_number || deleteModalBill.bill_no || "—"}
                </BillRef>{" "}
                for patient <strong>{deleteModalBill.patient_name || "—"}</strong>.
              </ConfirmText>

              <DeleteWarningBox>
                ⚠️ Deleting this bill will also release the blocked stock quantities for all
                medicines in this bill back into available inventory.
              </DeleteWarningBox>

              <ReasonSection>
                <ReasonLabel>
                  Reason for Deletion <span>*</span>
                </ReasonLabel>
                <ReasonTextarea
                  autoFocus
                  placeholder="e.g. Bill created by mistake, patient cancelled order..."
                  value={deleteReason}
                  onChange={(e) => {
                    setDeleteReason(e.target.value);
                    if (e.target.value.trim()) setDeleteReasonError(false);
                    setDeleteError("");
                  }}
                  disabled={deleteLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleDeleteConfirm();
                  }}
                />
                {deleteReasonError && (
                  <ReasonError>
                    ⚠ Reason is required to proceed with the deletion.
                  </ReasonError>
                )}
                {deleteError && (
                  <ReasonError style={{ marginTop: 8, fontSize: 12.5 }}>
                    ⚠ {deleteError}
                  </ReasonError>
                )}
              </ReasonSection>
            </ModalBody>

            <ModalFooter>
              <ModalBtn variant="cancel" onClick={closeDeleteModal} disabled={deleteLoading}>
                ✕ Cancel
              </ModalBtn>
              <ModalBtn
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading || !deleteReason.trim()}
              >
                {deleteLoading ? "Deleting…" : "🗑️ Confirm Delete"}
              </ModalBtn>
            </ModalFooter>

          </ModalBox>
        </ModalOverlay>

        
      )}
      {printBill && (
  <ModalOverlay>
    <ModalBox style={{ maxWidth: "900px" }}>
      
      <ModalTopBar>
        <ModalHeading>Print Preview</ModalHeading>
      </ModalTopBar>

      <ModalBody>

        {/* 🔥 PRINT CONTENT */}
        <div id="print-area">

          <h2 style={{ textAlign: "center" }}>
            SHANMUGA HOSPITAL LIMITED
          </h2>

          <p><b>Patient:</b> {printBill.patient_name}</p>
          <p><b>UHID:</b> {printBill.uhid}</p>
          <p><b>Bill No:</b> {printBill.bill_no}</p>
          <p><b>Date:</b> {formatDate(printBill.bill_date)}</p>

          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {printBill.medicine_particulars?.map((med, i) => (
                <tr key={i}>
                  <td>{med.item_name}</td>
                  <td>{med.quantity}</td>
                  <td>{med.rate}</td>
                  <td>{med.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ textAlign: "right" }}>
            Total: ₹{printBill.net_amount}
          </h3>

        </div>

      </ModalBody>

      <ModalFooter>
        <ModalBtn variant="cancel" onClick={() => setPrintBill(null)}>
          Close
        </ModalBtn>

        <ModalBtn variant="confirm" onClick={handlePrintNow}>
          🖨️ Print
        </ModalBtn>
      </ModalFooter>

    </ModalBox>
  </ModalOverlay>
)}

    </>
  );
}