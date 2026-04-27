import React, { useState, useEffect } from "react";
import { Search, Mic, RotateCcw } from "lucide-react";
import ShiftDetails from "./ShiftDetails";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { CreditCard } from "lucide-react";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// Styled Components (keeping all your existing styles unchanged)
const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  margin-top: 30px;
`;

const MainContent = styled.div`
  padding: 24px;
`;

const TopSection = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
`;

const Label = styled.span`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const Amount = styled.span`
  font-weight: bold;
  font-size: 18px;
  color: #333;
`;

const Value = styled.span`
  color: #333;
  font-size: 14px;
`;

const Button = styled.button`
  background-color: #0d9488;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  width: fit-content;

  &:hover {
    background-color: #0f766e;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 24px;
`;

const Sidebar = styled.div`
  width: 256px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
`;

const SidebarButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  margin-bottom: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;

  ${(props) =>
    props.active
      ? `
    background-color: #fb923c;
    color: white;
  `
      : `
    background-color: transparent;
    color: #0d9488;
    
    &:hover {
      background-color: #f9fafb;
    }
  `}
`;

const MainPanel = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PanelContent = styled.div`
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

const ControlsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 4px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  min-width: 128px;
  font-size: 14px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 12px;
  padding-right: 40px;
  font-size: 14px;
`;

const MicButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
`;

const TableHeader = styled.th`
  border: 1px solid #d1d5db;
  padding: 12px 16px;
  text-align: left;
  background-color: #f3f4f6;
  font-weight: 600;
  font-size: 14px;
`;

const TableCell = styled.td`
  border: 1px solid #d1d5db;
  padding: 12px 16px;
  text-align: ${(props) => (props.center ? "center" : "left")};
  color: ${(props) => (props.muted ? "#6b7280" : "#333")};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #6b7280;
  cursor: not-allowed;
  font-size: 14px;
`;

const MarkReceivedButton = styled.button`
  padding: 6px 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #059669;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const RevertButton = styled.button`
  padding: 6px 12px;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #d97706;
  }

  &:disabled {
    background-color: #9ca3af;
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

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  background-color: #d1fae5;
  color: #065f46;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #a7f3d0;
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
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from { transform: translateY(24px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
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
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #ffffff;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255,255,255,0.35);
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
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
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
  color: ${props => props.highlight ? '#0d9488' : props.danger ? '#dc2626' : '#374151'};
  font-weight: ${props => props.bold ? '700' : '500'};
  ${props => props.separator && `
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
  box-shadow: 0 2px 8px rgba(13,148,136,0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(13,148,136,0.35);
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
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredBills, setFilteredBills] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [selectedMethods, setSelectedMethods] = useState({ cash: false, card: false, cheque: false });
  const [payments, setPayments] = useState({ cash: "", cheque: "", chequeNo: "", card: "", cardNo: "" });
  const [activeShift, setActiveShift] = useState(null);

  // ── Receipt / Payment state ──────────────────────────────────────────────────
  const [rpReceiptType, setRpReceiptType] = useState("Receipt");
  const [rpAccountHeads, setRpAccountHeads] = useState([]);
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
  const [rpShowVoucherForm, setRpShowVoucherForm] = useState(false);
  const [rpVoucherSearch, setRpVoucherSearch] = useState("");
  const [rpVoucherList, setRpVoucherList] = useState([]);
  const [rpVoucherLoading, setRpVoucherLoading] = useState(false);
  const [rpPrintVoucher, setRpPrintVoucher] = useState(null); // record to print

  // ── Previous Vouchers Modal state ────────────────────────────────────────────
  const [pvFromDate, setPvFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // first of current month
    return d.toISOString().split("T")[0];
  });
  const [pvToDate, setPvToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [pvVoucherType, setPvVoucherType] = useState("All");
  const [pvData, setPvData] = useState([]);
  const [pvPage, setPvPage] = useState(1);
  const [pvShowEntries, setPvShowEntries] = useState(10);
  const [pvTotalReceipt, setPvTotalReceipt] = useState(0);
  const [pvTotalPayment, setPvTotalPayment] = useState(0);

  // ── Receipt / Payment derived ────────────────────────────────────────────────
  const rpSelectedHead = Array.isArray(rpAccountHeads)
    ? (rpAccountHeads.find((h) => h["S.No"] === rpSelectedSNo) || null)
    : null;
  const rpSelectedHeadName = rpSelectedHead ? rpSelectedHead.account_head : "";

  const rpShowAlert = (type, msg) => {
    setRpAlert({ type, msg });
    setTimeout(() => setRpAlert(null), 4000);
  };

  const rpFetchAccountHeads = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_active_account_heads/`, "GET");
      // API returns: { status: "success", count: N, data: [...] }
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setRpAccountHeads(list);
      if (list.length > 0) setRpSelectedSNo(list[0]["S.No"]);
    } catch (err) {
      console.error("Failed to fetch account heads:", err);
      setRpAccountHeads([]);
    }
  };

  const rpFetchRecords = async () => {
    setRpLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_receipt_payments/`, "POST", {});
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data.data)) list = res.data.data;
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
    if (!rpSelectedSNo) return rpShowAlert("error", "Please select an Account Head.");
    if (!rpAmount || isNaN(rpAmount) || parseFloat(rpAmount) <= 0)
      return rpShowAlert("error", "Please enter a valid Amount.");

    const CashCounter = localStorage.getItem("selected_outlet") || "";
    let description = null;
    if (rpSelectedHeadName === "ROOM ACCESS CARD") {
      if (!rpDescFields.patient_name || !rpDescFields.room_no)
        return rpShowAlert("error", "Please fill in Patient Name and Room No.");
      description = { patient_name: rpDescFields.patient_name, room_no: rpDescFields.room_no };
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
      const res = await apiRequest(`${HmsBaseUrl}post_receipt_payments/`, "POST", payload);
      if (res?.success || res?.id || res?._id || res?.voucher_no) {
        rpShowAlert("success", res?.message || "Saved successfully.");

        // ── Optimistic update: prepend the new record immediately ──────────────
        const newRecord = {
          // Use server-returned fields when available, fall back to payload values
          _id: res?._id || res?.id || `temp-${Date.now()}`,
          voucher_no: res?.voucher_no || "—",
          voucher_date: res?.voucher_date || new Date().toISOString(),
          receipt_type: payload.receipt_type,
          account_head: payload.account_head,
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
        // ──────────────────────────────────────────────────────────────────────

        // Reset form fields
        setRpAmount("");
        setRpDescFields(
          rpSelectedHeadName === "ROOM ACCESS CARD" ? { patient_name: "", room_no: "" }
            : rpSelectedHeadName === "MISCELLANEOUS INCOME" ? { description: "" }
              : {}
        );

        // Background sync to get the authoritative server record (replaces optimistic row)
        rpFetchRecords();
      } else {
        rpShowAlert("error", res?.message || "Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      rpShowAlert("error", "Server error. Please check your connection.");
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
      const res = await apiRequest(`${HmsBaseUrl}get_receipt_payments/`, "POST", payload);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setPvData(list);
      setPvPage(1);
      let totalR = 0, totalP = 0;
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
    const headers = ["Date", "Time", "Shift Reference", "Account Name", "Voucher No", "Receipt No", "Payment", "Description"];
    const rows = pvData.map((r) => {
      const d = r.voucher_date ? new Date(r.voucher_date) : null;
      const dateStr = d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
      const timeStr = d ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
      const desc = r.description
        ? typeof r.description === "object" ? Object.values(r.description).filter(Boolean).join(", ") : r.description
        : "—";
      return [
        dateStr, timeStr,
        r.shiftno || r.shift_reference || "—",
        r.account_head_details?.name || r.account_head_name || r.account_head || "—",
        r.voucher_no || "—",
        r.receipt_type === "Receipt" ? parseFloat(r.amount || 0).toFixed(2) : "0.00",
        r.receipt_type === "Payment" ? parseFloat(r.amount || 0).toFixed(2) : "0.00",
        desc,
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(c => '"' + c + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "previous_vouchers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Auth context values — used to match shift ownership for hide/show of Start button
  const currentOutletCode = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
  const currentHospitalCode = localStorage.getItem("hospital_code") || "";
  const currentBranchCode = localStorage.getItem("selected_branch") || localStorage.getItem("branch_code") || "";

  // Called by ShiftDetails when shift starts (passes data) or stops (passes null)
  // After every POST/PATCH in ShiftDetails, do an immediate GET to refresh top section
  const handleShiftChange = async (shiftData) => {
    // Optimistically update from the POST/PATCH response first
    if (shiftData) setActiveShift(shiftData);
    // Then immediately fetch latest from DB
    await refreshActiveShift();
  };

  // If the API returned an active shift it already belongs to this cashier/outlet
  const shiftBelongsHere = !!(activeShift && activeShift.is_active === true && activeShift.ShiftStatus === "active");

  const sidebarItems = [
    { label: "Pending Bills", id: "pending-bills" },
    { label: "IP Advance", id: "ip-advance" },
    { label: "Patient Debit", id: "patient-debit" },
    { label: "Sales Returns", id: "sales-returns" },
    { label: "Receipt / Payment", id: "receipt-payment" },

  ];

  // ── Fetch active shift on mount using the correct GET endpoint ─────────────
  const refreshActiveShift = async () => {
    try {
      const outletCode = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

      const res = await apiRequest(
        `${HmsBaseUrl}get_active_shift/`,
        "POST",
        { CashCounter: outletCode }
      );

      if (res?.success && res?.data) {
        setActiveShift(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
            return res.data.data;
          }
          return prev;
        });
      } else if (res && !res.success) {
        // No active shift — clear state so UI resets to "—"
        setActiveShift(prev => (prev ? null : prev));
      }

    } catch (err) {
      console.error("Failed to refresh active shift:", err);
    }
  };
  useEffect(() => {
    // ✅ call immediately when component loads
    refreshActiveShift();

    // ✅ keep checking every few seconds
    const interval = setInterval(() => {
      refreshActiveShift();
    }, 5000); // 5 sec (adjust if needed)

    // ✅ cleanup (important)
    return () => clearInterval(interval);

  }, []);


  const formatBillData = (billsArray) => {
    return billsArray.map((item, index) => {

      // unique fallback id
      const id = item.id ?? `temp-${index}-${Date.now()}`;

      // ✅ use bill_date only
      const billDateObj = item.bill_date
        ? new Date(item.bill_date)
        : null;

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
          hour12: true,          // 👈 IMPORTANT
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
  const formatIpAdvanceData = (admissionsArray) => {
    const rows = [];
    admissionsArray.forEach((admission) => {
      const payments = admission.advance_payments || [];
      // Only show admissions that have pending advance payments
      const pendingPayments = payments.filter(
        (p) => p.is_advanceActive && String(p.status).toLowerCase() === "pending"
      );
      if (pendingPayments.length === 0) return;

      pendingPayments.forEach((payment) => {
        const billDateObj = payment.bill_date ? new Date(payment.bill_date) : null;
        rows.push({
          id: `${admission.ipNumber}-${payment.advance_id}`,
          // display fields
          bill_date: billDateObj
            ? billDateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" })
            : "-",
          bill_no: payment.bill_no || "-",
          uhid_no: admission.uhid || "-",
          patient: admission.patient_name || "-",
          advance_amount: payment.advance_amount || 0,
          ipNumber: admission.ipNumber || "-",
          ipserial_number: admission.ipserial_number || "-",
          advance_id: payment.advance_id,
          status: payment.status || "-",
          // for payment modal
          total: payment.advance_amount || 0,
          source: "IP",
          bill_type: "IP Advance",
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

  const balance = Math.max(netAmount - paidAmount, 0);


  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setSelectedMethods({ cash: false, card: false, cheque: false });
    setPayments({ cash: "", cheque: "", chequeNo: "", card: "", cardNo: "" });
    setShowPaymentModal(true);
  };
  // ✅ FIXED: Updated fetchPendingBills to handle your actual data structure
  const fetchPendingBills = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(
        `${HmsBaseUrl}OPPharmacy_pending_bills/`,
        "GET"
      );

      const billsArray = Array.isArray(response?.data)
        ? response.data
        : [];

      console.log("Raw pending bills data:", response.data);

      const formatted = formatBillData(billsArray);
      setPendingBills(formatted);

    } catch (err) {
      console.error("Pending bills error:", err);
      setError("Unable to connect to HMS server");
    } finally {
      setLoading(false);
    }
  };


  const submitPayment = async () => {
    // Build list of active payment methods
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

    // Determine payment_details: single object if one method, method="multiple" if more
    let payment_details;
    if (activeMethods.length === 1) {
      payment_details = activeMethods[0];
    } else {
      payment_details = { method: "Multiple Payment", Paid_amount: paidAmount, breakdown: activeMethods };
    }

    // ✅ IP Advance: send ipNumber + payment_details
    if (activeMenuItem === "IP Advance") {
      const payload = {
        ipNumber: selectedBill.ipNumber,
        payment_details,
        shiftno: activeShift?.shiftno || "",
      };

      const res = await apiRequest(
        `${HmsBaseUrl}ipadvance_bills/`,
        "POST",
        payload
      );

      if (res?.status === "success") {
        setSuccess("IP Advance payment collected successfully!");
        setShowPaymentModal(false);
        fetchIpAdvancePendingBills();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res?.message || "Payment failed");
      }
      return;
    }

    // ✅ OP / Pending Bills flow (unchanged)
    const payload = {
      Bill_id: selectedBill.Bill_id,
      uhid: selectedBill.uhid_no,
      bill_no: selectedBill.bill_no,
      bill_date: selectedBill.raw_bill_date?.slice(0, 10),
      payment_details,
      shiftno: activeShift?.shiftno || "",
    };

    const res = await apiRequest(
      `${HmsBaseUrl}collect_oppharmacy_payment/`,
      "POST",
      payload
    );

    if (res.success) {
      setSuccess("Payment collected successfully!");
      setShowPaymentModal(false);
      fetchPendingBills();
    }
  };


  const fetchIpAdvancePendingBills = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(
        `${HmsBaseUrl}ipadvance_bills/`,
        "GET"
      );

      console.log("IP Advance raw response:", JSON.stringify(response));

      // apiRequest wraps the actual response under response.data
      // so the real array is at response.data.data
      const billsArray = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      if (!billsArray.length && response?.data?.error) {
        setError("IP Advance API error: " + response.data.error);
        return;
      }

      const formatted = formatIpAdvanceData(billsArray);
      setIpAdvancePendingBills(formatted);

    } catch (err) {
      console.error("IP Advance fetch error:", err?.message || err);
      setError("Failed to load IP Advance data: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };


  const payIpAdvance = async (ipNumber, amount) => {
    try {
      const payload = {
        ipNumber: ipNumber,
        payment_details: {
          method: "cash",
          Paid_amount: amount,
        },
        shiftno: activeShift?.shiftno || "",
      };

      const response = await apiRequest(
        `${HmsBaseUrl}ipadvance_bills/`,
        "POST",
        payload
      );

      if (response?.status === "success") {
        fetchIpAdvancePendingBills();
      }

    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed");
    }
  };

  // Filter bills based on search term and bill type
  const filterBills = () => {
    let bills = [];

    if (activeMenuItem === "Pending Bills") {
      // Both tabs use the same OPPharmacy_pending_bills API data
      // Pending Bills tab → show billing_status === "Billed"
      // Received Bills tab → show billing_status === "Paid"
      bills = pendingBills.filter((bill) =>
        selectedType === "pending"
          ? bill.investigation === "Billed"
          : bill.investigation === "Paid"
      );
    } else if (activeMenuItem === "IP Advance") {
      bills = selectedType === "pending" ? ipAdvancePendingBills : ipAdvanceReceivedBills;
    }

    let filtered = bills;

    if (billType !== "ALL") {
      filtered = filtered.filter((bill) =>
        bill.bill_type.toString().toLowerCase().includes(billType.toLowerCase())
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          bill.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.uhid_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBills(filtered);
  };

  // Mark bill as received
  const markBillReceived = async (billId, source) => {
    try {
      let endpoint = "";
      if (activeMenuItem === "Pending Bills") {
        endpoint = "http://127.0.0.1:8000/mark-bill-received/";
      } else if (activeMenuItem === "IP Advance") {
        endpoint = "http://127.0.0.1:8000/ip-advance/mark-received/";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: billId,
          source: source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Bill marked as received successfully`);
        // Refresh data
        if (activeMenuItem === "Pending Bills") {
          fetchPendingBills();
        } else if (activeMenuItem === "IP Advance") {
          fetchIpAdvancePendingBills();
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update bill");
      }
    } catch (err) {
      setError("Error updating bill");
      console.error("Error marking bill as received:", err);
    }
  };

  const markBillUnreceived = async (billId, source) => {
    try {
      let endpoint = "";
      if (activeMenuItem === "Pending Bills") {
        endpoint = "http://127.0.0.1:8000/mark-bill-unreceived/";
      } else if (activeMenuItem === "IP Advance") {
        endpoint = "http://127.0.0.1:8000/ip-advance/mark-unreceived/";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: billId,
          source: source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Bill marked as unreceived successfully`);
        if (activeMenuItem === "Pending Bills") {
          fetchReceivedBills();
        } else if (activeMenuItem === "IP Advance") {
          fetchIpAdvanceReceivedBills();
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update bill");
      }
    } catch (err) {
      setError("Error updating bill");
      console.error("Error marking bill as unreceived:", err);
    }
  };

  const handleMenuItemClick = (itemLabel) => {
    setActiveMenuItem(itemLabel);
    setSearchTerm("");
    setSelectedType("pending"); // Reset to pending when switching menus

    if (itemLabel === "Pending Bills") {
      fetchPendingBills();
    } else if (itemLabel === "IP Advance") {
      fetchIpAdvancePendingBills();
    } else if (itemLabel === "Receipt / Payment") {
      rpFetchAccountHeads();
      rpFetchRecords();
    }
  };

  const handleRefresh = () => {
    if (activeMenuItem === "Pending Bills") {
      if (selectedType === "pending") {
        fetchPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchTerm("");

    if (activeMenuItem === "Pending Bills") {
      if (type === "pending") {
        fetchPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (type === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    }
  };

  const handleShiftDetailsClick = () => {
    setShowShiftDetails(true);
  };

  // Load initial data
  useEffect(() => {
    if (activeMenuItem === "Pending Bills") {
      if (selectedType === "pending") {
        fetchPendingBills();
      } else {
        fetchReceivedBills();
      }
    } else if (activeMenuItem === "IP Advance") {
      if (selectedType === "pending") {
        fetchIpAdvancePendingBills();
      } else {
        fetchIpAdvanceReceivedBills();
      }
    }
  }, [activeMenuItem, selectedType]);

  useEffect(() => {
    filterBills();
  }, [billType, searchTerm, selectedType, pendingBills, receivedBills, ipAdvancePendingBills, ipAdvanceReceivedBills, activeMenuItem]);

  const getTableColumns = () => {
    const baseColumns = [
      "Date", "Time", "Bill No", "Bill Type", "UHID No", "Patient", "Investigation"
    ];

    if (activeMenuItem === "IP Advance") {
      baseColumns.splice(6, 0, "IP Number", "Age", "Gender"); // Add before Investigation
    }

    if (selectedType === "received") {
      baseColumns.push("Doctor", "Total", "Payment Method");
    }

    baseColumns.push("Action");
    return baseColumns;
  };

  const tableColumns = getTableColumns();
  const colSpan = selectedType === "received" ? 11 : 8;

  return (
    <Container>
      <MainContent>
        <TopSection>
          <TopGrid>
            <InfoColumn>
              <InfoRow>
                <Label>SHIFT REFERENCE</Label>
                <span>:</span>
                <Value>{activeShift?.shiftno || "—"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>STARTING TIME</Label>
                <span>:</span>
                <Value style={shiftBelongsHere ? { color: "#0d9488", fontWeight: 600 } : {}}>
                  {activeShift?.StartingTime
                    ? new Date(String(activeShift.StartingTime).replace(" ", "T")).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                      hour12: true,
                    })
                    : "—"}
                </Value>
              </InfoRow>
              <InfoRow>
                <Label>CLOSING TIME</Label>
                <span>:</span>
                <Value style={!shiftBelongsHere && activeShift?.closingTime ? { color: "#dc2626", fontWeight: 600 } : {}}>
                  {activeShift?.closingTime
                    ? new Date(String(activeShift.closingTime).replace(" ", "T")).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                      hour12: true,
                    })
                    : shiftBelongsHere ? "Running…" : "—"}
                </Value>
              </InfoRow>
              <InfoRow>
                <Label>CASHIER ID</Label>
                <span>:</span>
                <Value>{activeShift?.CashierID || "—"}</Value>
              </InfoRow>
            </InfoColumn>

            <InfoColumn>
              <InfoRow>
                <Label>OPENING BALANCE</Label>
                <span>:</span>
                <Amount>
                  {activeShift
                    ? "₹ " + parseFloat(activeShift.OpeningBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    : "₹ 0.00"}
                </Amount>
              </InfoRow>
              <InfoRow>
                <Label>CLOSING BALANCE</Label>
                <span>:</span>
                <Amount>
                  {activeShift?.ClosingBalance
                    ? "₹ " + parseFloat(activeShift.ClosingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    : "₹ 0.00"}
                </Amount>
              </InfoRow>
              <InfoRow>
                <Label>SHIFT STATUS</Label>
                <span>:</span>
                <Value style={{
                  color: activeShift?.ShiftStatus === "active" ? "#10b981" : "#6b7280",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}>
                  {activeShift?.ShiftStatus || "—"}
                </Value>
              </InfoRow>
            </InfoColumn>

            <InfoColumn>
              <InfoRow>
                <Label>CASH COUNTER</Label>
                <span>:</span>
                <Value>{activeShift?.CashCounter || "—"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>BRANCH</Label>
                <span>:</span>
                <Value>{activeShift?.branch_code || "—"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>DATE</Label>
                <span>:</span>
                <Value>{activeShift?.date || new Date().toLocaleDateString("en-IN")}</Value>
              </InfoRow>

              {/* Shift Running Banner */}
              {shiftBelongsHere && (
                <ShiftRunningBanner>
                  <span className="dot" />
                  Shift Running — Cashier&nbsp;<strong>{activeShift.CashierID}</strong>
                </ShiftRunningBanner>
              )}

              {/* Start Counter — shown when NO active shift */}
              {!shiftBelongsHere && (
                <div style={{ marginTop: "16px" }}>
                  <Button onClick={handleShiftDetailsClick}>
                    ▶ Start Counter
                  </Button>
                </div>
              )}

              {/* Stop Counter — shown when shift is active */}
              {shiftBelongsHere && (
                <div style={{ marginTop: "12px" }}>
                  <Button
                    style={{ backgroundColor: "#dc2626" }}
                    onClick={handleShiftDetailsClick}
                  >
                    ⏹ Stop Counter
                  </Button>
                </div>
              )}
            </InfoColumn>
          </TopGrid>
        </TopSection>

        <ContentWrapper>
          <Sidebar>
            {sidebarItems.map((item, index) => (
              <SidebarButton
                key={index}
                active={activeMenuItem === item.label}
                onClick={() => handleMenuItemClick(item.label)}
              >
                <Search size={16} />
                {item.label}
              </SidebarButton>
            ))}
          </Sidebar>

          <MainPanel>
            <PanelContent>
              <Title>{activeMenuItem}</Title>

              {/* ══════════════ RECEIPT / PAYMENT PANEL ══════════════ */}
              {activeMenuItem === "Receipt / Payment" && (() => {
                const rpFilteredRecords = (Array.isArray(rpRecords) ? rpRecords : []).filter((r) => {
                  const t = rpSearchTerm.toLowerCase();
                  if (!t) return true;
                  return (
                    (r.account_head_details?.name || r.account_head || "").toLowerCase().includes(t) ||
                    (r.voucher_no || "").toLowerCase().includes(t) ||
                    (r.description?.patient_name || r.description?.description || "").toLowerCase().includes(t)
                  );
                });
                const rpDisplayed = rpFilteredRecords.slice(0, parseInt(rpShowEntries, 10));
                const rpFilteredVouchers = rpVoucherList.filter((v) => {
                  const t = rpVoucherSearch.toLowerCase();
                  if (!t) return true;
                  return (
                    (v.account_head || "").toLowerCase().includes(t) ||
                    (v.voucher_no || "").toLowerCase().includes(t)
                  );
                });

                return (
                  <>
                    {/* Header buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 16 }}>
                      <Button onClick={rpOpenVoucherModal} style={{ gap: 6 }}>
                        <Search size={14} /> View Previous Vouchers
                      </Button>
                      <button
                        onClick={() => setRpShowVoucherForm(prev => !prev)}
                        style={{
                          background: "#f97316", color: "white", border: "none",
                          borderRadius: 4, padding: "8px 16px", fontSize: 14,
                          fontWeight: 500, cursor: "pointer",
                        }}
                      >
                        {rpShowVoucherForm ? "— Voucher" : "+ Voucher"}
                      </button>
                    </div>

                    {/* Alert */}
                    {rpAlert && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 4, marginBottom: 14, fontSize: 14,
                        backgroundColor: rpAlert.type === "error" ? "#fef2f2" : "#f0fdf4",
                        color: rpAlert.type === "error" ? "#dc2626" : "#166534",
                        border: `1px solid ${rpAlert.type === "error" ? "#fecaca" : "#bbf7d0"}`,
                      }}>
                        {rpAlert.type === "error" ? "⚠️" : "✅"} {rpAlert.msg}
                      </div>
                    )}

                    {/* Form row — only visible when Voucher is open */}
                    {rpShowVoucherForm && (
                      <div style={{
                        background: "#f0fafa", border: "1px solid #e5e7eb",
                        borderRadius: 6, padding: "14px 16px", marginBottom: 16,
                      }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16 }}>

                          {/* Receipt Type */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Receipt Type</label>
                            <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "7px 0" }}>
                              {["Receipt", "Payment"].map((t) => (
                                <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                                  <input
                                    type="radio" name="rpReceiptType" value={t}
                                    checked={rpReceiptType === t}
                                    onChange={() => setRpReceiptType(t)}
                                    style={{ accentColor: "#0d9488", width: 15, height: 15 }}
                                  />
                                  {t}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Account Head */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Account Head</label>
                            <Select
                              value={rpSelectedSNo}
                              onChange={(e) => {
                                setRpSelectedSNo(e.target.value);
                                const head = Array.isArray(rpAccountHeads) ? rpAccountHeads.find(h => h["S.No"] === e.target.value) : null;
                                const name = head?.account_head || "";
                                setRpDescFields(
                                  name === "ROOM ACCESS CARD" ? { patient_name: "", room_no: "" }
                                    : name === "MISCELLANEOUS INCOME" ? { description: "" }
                                      : {}
                                );
                              }}
                              style={{ minWidth: 200 }}
                            >
                              {(!Array.isArray(rpAccountHeads) || rpAccountHeads.length === 0) && <option value="">Loading...</option>}
                              {Array.isArray(rpAccountHeads) && rpAccountHeads.map((h) => (
                                <option key={h["S.No"]} value={h["S.No"]}>{h.account_head}</option>
                              ))}
                            </Select>
                          </div>

                          {/* ROOM ACCESS fields */}
                          {rpSelectedHeadName === "ROOM ACCESS CARD" && (
                            <>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Patient Name</label>
                                <input
                                  type="text" placeholder="Enter patient name"
                                  value={rpDescFields.patient_name || ""}
                                  onChange={(e) => setRpDescFields(p => ({ ...p, patient_name: e.target.value }))}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 12px", fontSize: 14, minWidth: 180 }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Room No</label>
                                <input
                                  type="text" placeholder="Enter room no"
                                  value={rpDescFields.room_no || ""}
                                  onChange={(e) => setRpDescFields(p => ({ ...p, room_no: e.target.value }))}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 12px", fontSize: 14, minWidth: 120 }}
                                />
                              </div>
                            </>
                          )}

                          {/* MISCELLANEOUS INCOME field */}
                          {rpSelectedHeadName === "MISCELLANEOUS INCOME" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Description</label>
                              <input
                                type="text" placeholder="Enter description"
                                value={rpDescFields.description || ""}
                                onChange={(e) => setRpDescFields(p => ({ ...p, description: e.target.value }))}
                                style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 12px", fontSize: 14, minWidth: 220 }}
                              />
                            </div>
                          )}

                          {/* Amount */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Amount</label>
                            <input
                              type="number" placeholder="0.00" min="0" step="0.01"
                              value={rpAmount}
                              onChange={(e) => setRpAmount(e.target.value)}
                              style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "8px 12px", fontSize: 14, minWidth: 130 }}
                            />
                          </div>

                          {/* Save */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ fontSize: 13 }}>&nbsp;</label>
                            <Button onClick={rpHandleSave} disabled={rpSaving} style={{ gap: 6 }}>
                              {rpSaving
                                ? <LoadingSpinner />
                                : "💾"}
                              Save
                            </Button>
                          </div>

                        </div>
                      </div>
                    )} {/* end rpShowVoucherForm */}

                    {/* Table controls */}
                    <TableControls>
                      <ControlGroup>
                        <span>Show up to</span>
                        <Select value={rpShowEntries} onChange={(e) => setRpShowEntries(e.target.value)}>
                          {["10", "25", "50", "100"].map(n => <option key={n} value={n}>{n}</option>)}
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

                    {/* Table */}
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
                                  ? parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                                  : "0.00"}
                              </TableCell>
                              <TableCell>
                                ₹{r.receipt_type === "Payment"
                                  ? parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })
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
                                <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    title="Print"
                                    onClick={() => setRpPrintVoucher(r)}
                                    style={{
                                      background: "#0d9488", color: "white", border: "none",
                                      padding: "5px 8px", borderRadius: 4, cursor: "pointer",
                                      display: "flex", alignItems: "center",
                                    }}
                                  >
                                    🖨️
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() => {
                                      if (window.confirm(`Delete voucher ${r.voucher_no}?`)) {
                                        // TODO: call delete API
                                        console.log("Delete voucher:", r.voucher_no);
                                      }
                                    }}
                                    style={{
                                      background: "#dc2626", color: "white", border: "none",
                                      padding: "5px 8px", borderRadius: 4, cursor: "pointer",
                                      display: "flex", alignItems: "center",
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
                        <PaginationButton style={{ marginRight: 8 }}>Previous</PaginationButton>
                        <PaginationButton>Next</PaginationButton>
                      </div>
                    </Pagination>

                    {/* ══ Previous Vouchers Modal ══ */}
                    {rpShowVoucherModal && (
                      <ModalOverlay onClick={() => setRpShowVoucherModal(false)}>
                        <ModalContainer
                          style={{ maxWidth: 1000, borderRadius: 8, maxHeight: "92vh" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Header */}
                          <ModalHeader style={{ background: "#0d6e6e", borderRadius: "8px 8px 0 0", padding: "14px 20px" }}>
                            <ModalTitle style={{ fontSize: 16 }}>Previous Vouchers</ModalTitle>
                            <CloseButton onClick={() => setRpShowVoucherModal(false)}>✕</CloseButton>
                          </ModalHeader>

                          {/* Filter bar */}
                          <div style={{
                            padding: "14px 20px", background: "#f9fafb",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
                          }}>
                            {/* From Date */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>From Date</label>
                              <input
                                type="date"
                                value={pvFromDate}
                                onChange={(e) => setPvFromDate(e.target.value)}
                                style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "7px 10px", fontSize: 13 }}
                              />
                            </div>
                            {/* To Date */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>To Date</label>
                              <input
                                type="date"
                                value={pvToDate}
                                onChange={(e) => setPvToDate(e.target.value)}
                                style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "7px 10px", fontSize: 13 }}
                              />
                            </div>
                            {/* Voucher Type */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Voucher Type</label>
                              <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "7px 0" }}>
                                {["All", "Receipt", "Payment"].map((t) => (
                                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer" }}>
                                    <input
                                      type="radio"
                                      name="pvVoucherType"
                                      value={t}
                                      checked={pvVoucherType === t}
                                      onChange={() => setPvVoucherType(t)}
                                      style={{ accentColor: "#0d9488" }}
                                    />
                                    {t}
                                  </label>
                                ))}
                              </div>
                            </div>
                            {/* Fetch button */}
                            <button
                              onClick={() => pvFetchVouchers(pvFromDate, pvToDate, pvVoucherType)}
                              disabled={rpVoucherLoading}
                              style={{
                                background: "#0d9488", color: "white", border: "none",
                                borderRadius: 4, padding: "8px 18px", fontSize: 13,
                                fontWeight: 600, cursor: "pointer", display: "flex",
                                alignItems: "center", gap: 6,
                              }}
                            >
                              {rpVoucherLoading ? "⏳" : "🔍"} Fetch
                            </button>
                          </div>

                          {/* Table area */}
                          <ModalBody style={{ padding: "14px 20px", overflowX: "auto" }}>
                            {/* Controls row: Show up to + Excel export */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                <span>Show up to</span>
                                <select
                                  value={pvShowEntries}
                                  onChange={(e) => { setPvShowEntries(Number(e.target.value)); setPvPage(1); }}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "5px 8px", fontSize: 13 }}
                                >
                                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                              </div>
                              <button
                                onClick={pvExportExcel}
                                style={{
                                  background: "#f97316", color: "white", border: "none",
                                  borderRadius: 4, padding: "7px 16px", fontSize: 13,
                                  fontWeight: 600, cursor: "pointer",
                                }}
                              >
                                📊 Excel export
                              </button>
                            </div>

                            {rpVoucherLoading ? (
                              <div style={{ textAlign: "center", padding: 32, color: "#6b7280" }}>
                                <LoadingSpinner /> &nbsp; Loading vouchers...
                              </div>
                            ) : (
                              <>
                                <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto" }}>
                                  <Table>
                                    <thead>
                                      <tr>
                                        <TableHeader>Date ↕</TableHeader>
                                        <TableHeader>Time ↕</TableHeader>
                                        <TableHeader>Shift Refernce ↕</TableHeader>
                                        <TableHeader>Account Name ↕</TableHeader>
                                        <TableHeader>Voucher No ↕</TableHeader>
                                        <TableHeader>Receipt No ↕</TableHeader>
                                        <TableHeader>Payment ↕</TableHeader>
                                        <TableHeader>Description ↑</TableHeader>
                                        <TableHeader>Action</TableHeader>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(() => {
                                        const totalPages = Math.ceil(pvData.length / pvShowEntries);
                                        const pageData = pvData.slice((pvPage - 1) * pvShowEntries, pvPage * pvShowEntries);
                                        if (pvData.length === 0) {
                                          return (
                                            <tr>
                                              <TableCell center muted colSpan={9}>No vouchers found. Adjust filters and click Fetch.</TableCell>
                                            </tr>
                                          );
                                        }
                                        return pageData.map((r, idx) => {
                                          const d = r.voucher_date ? new Date(r.voucher_date) : null;
                                          const dateStr = d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
                                          const timeStr = d ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
                                          const desc = r.description
                                            ? typeof r.description === "object"
                                              ? Object.values(r.description).filter(Boolean).join(", ") || "—"
                                              : r.description
                                            : "—";
                                          const isReceipt = r.receipt_type === "Receipt";
                                          const amt = parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
                                          return (
                                            <tr key={r._id || r.voucher_no || idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                              <TableCell>{dateStr}</TableCell>
                                              <TableCell>{timeStr}</TableCell>
                                              <TableCell>{r.shiftno || r.shift_reference || "—"}</TableCell>
                                              <TableCell>{r.account_head_details?.name || r.account_head_name || r.account_head || "REMOTE"}</TableCell>
                                              <TableCell>{r.voucher_no || "—"}</TableCell>
                                              <TableCell>₹ {isReceipt ? amt : "0.00"}</TableCell>
                                              <TableCell>₹ {!isReceipt ? amt : "0.00"}</TableCell>
                                              <TableCell>{desc}</TableCell>
                                              <TableCell center>
                                                <button
                                                  title="Print"
                                                  onClick={() => { setRpShowVoucherModal(false); setRpPrintVoucher(r); }}
                                                  style={{
                                                    background: "#0d9488", color: "white", border: "none",
                                                    padding: "5px 8px", borderRadius: 4, cursor: "pointer",
                                                  }}
                                                >
                                                  🖨️
                                                </button>
                                              </TableCell>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                    {/* Totals row */}
                                    {pvData.length > 0 && (
                                      <tfoot>
                                        <tr style={{ background: "#f3f4f6", fontWeight: 700 }}>
                                          <TableCell colSpan={5} style={{ textAlign: "right", fontWeight: 700 }}>Total:</TableCell>
                                          <TableCell style={{ fontWeight: 700 }}>
                                            ₹ {pvTotalReceipt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell style={{ fontWeight: 700 }}>
                                            ₹ {pvTotalPayment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell colSpan={2} />
                                        </tr>
                                      </tfoot>
                                    )}
                                  </Table>
                                </div>

                                {/* Pagination */}
                                {pvData.length > 0 && (() => {
                                  const totalPages = Math.ceil(pvData.length / pvShowEntries);
                                  const startEntry = (pvPage - 1) * pvShowEntries + 1;
                                  const endEntry = Math.min(pvPage * pvShowEntries, pvData.length);
                                  const pageNums = [];
                                  for (let i = 1; i <= totalPages; i++) pageNums.push(i);
                                  const visiblePages = pageNums.filter(p =>
                                    p === 1 || p === totalPages || Math.abs(p - pvPage) <= 1
                                  );
                                  const btnStyle = (active) => ({
                                    padding: "5px 10px", border: "1px solid #d1d5db",
                                    borderRadius: 4, fontSize: 13, cursor: "pointer",
                                    background: active ? "#0d9488" : "white",
                                    color: active ? "white" : "#374151",
                                    fontWeight: active ? 700 : 400,
                                  });
                                  return (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
                                      <span style={{ fontSize: 13, color: "#6b7280" }}>
                                        Showing {startEntry} to {endEntry} of {pvData.length} entries
                                      </span>
                                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                        <button style={btnStyle(false)} disabled={pvPage === 1} onClick={() => setPvPage(p => p - 1)}>Previous</button>
                                        {visiblePages.map((p, i) => {
                                          const prev = visiblePages[i - 1];
                                          return (
                                            <React.Fragment key={p}>
                                              {prev && p - prev > 1 && <span style={{ padding: "5px 4px", fontSize: 13 }}>...</span>}
                                              <button style={btnStyle(pvPage === p)} onClick={() => setPvPage(p)}>{p}</button>
                                            </React.Fragment>
                                          );
                                        })}
                                        <button style={btnStyle(false)} disabled={pvPage === totalPages} onClick={() => setPvPage(p => p + 1)}>Next</button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
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

              {activeMenuItem !== "Receipt / Payment" && <>
                <ControlsWrapper>
                  <ControlGroup>
                    <Label>Bill Type</Label>
                    <Select value={billType} onChange={(e) => setBillType(e.target.value)}>
                      <option value="ALL">ALL</option>
                      <option value="OP">OP</option>
                      <option value="IP">IP</option>
                      <option value="Discharge">Discharge</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="MRI Scan">MRI Scan</option>
                      <option value="Lab Test">Lab Test</option>
                      <option value="Scanning">Scanning</option>
                      <option value="X-Ray">X-Ray</option>
                    </Select>
                  </ControlGroup>

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

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <Table>
                  <thead>
                    <tr>
                      {activeMenuItem !== "IP Advance" && (
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
                      ) : (
                        <>
                          <TableHeader>Bill No</TableHeader>
                          <TableHeader>Bill Type</TableHeader>
                          <TableHeader>UHID No</TableHeader>
                          <TableHeader>Patient</TableHeader>
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
                      <TableHeader>Action</TableHeader>
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
                          {activeMenuItem !== "IP Advance" && (
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
                          ) : (
                            <>
                              <TableCell>{bill.bill_no}</TableCell>
                              <TableCell>{bill.bill_type}</TableCell>
                              <TableCell>{bill.uhid_no}</TableCell>
                              <TableCell>{bill.patient}</TableCell>
                              <TableCell>{bill.investigation}</TableCell>
                              {selectedType === "received" && (
                                <>
                                  <TableCell>{bill.doctor}</TableCell>
                                  <TableCell>₹{bill.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell>{bill.payment_method}</TableCell>
                                </>
                              )}
                            </>
                          )}

                          <TableCell>
                            {selectedType === "pending" ? (
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

                                <TableCell center style={{ border: "none", padding: 0 }}>
                                  <button
                                    title="Collect Payment"
                                    onClick={() => openPaymentModal(bill)}
                                    style={{
                                      background: "#0d9488",
                                      color: "white",
                                      border: "none",
                                      padding: "6px",
                                      borderRadius: "4px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <CreditCard size={16} />
                                  </button>
                                </TableCell>
                              </div>
                            ) : null}
                          </TableCell>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <TableCell center muted colSpan={colSpan}>
                          {selectedType === "pending"
                            ? "No pending bills found"
                            : "No received bills found"}
                        </TableCell>
                      </tr>

                    )}
                  </tbody>
                </Table>

                <Pagination>
                  <div>
                    Showing {Math.min(filteredBills.length, parseInt(showEntries))} of{" "}
                    {filteredBills.length} entries
                  </div>
                  <div>
                    <PaginationButton style={{ marginRight: "8px" }}>
                      Previous
                    </PaginationButton>
                    <PaginationButton>Next</PaginationButton>
                  </div>
                </Pagination>
              </>}
            </PanelContent>
          </MainPanel>
        </ContentWrapper>
      </MainContent>

      <ShiftDetails
        isOpen={showShiftDetails}
        onClose={() => setShowShiftDetails(false)}
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
      />


      {showPaymentModal && (
        <ModalOverlay>
          <ModalContainer style={{ maxWidth: 560 }}>
            <ModalHeader>
              <ModalTitle>💳 Collect Payment</ModalTitle>
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
                <span>Net Amount</span>
                <span>₹ {netAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </NetAmountBanner>

              {/* Payment method selector row */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                {["cash", "card", "cheque"].map((method) => (
                  <label
                    key={method}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: `2px solid ${selectedMethods[method] ? "#0d9488" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: selectedMethods[method] ? "#f0fdfa" : "#fafafa",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: selectedMethods[method] ? "#0d9488" : "#6b7280",
                      transition: "all 0.2s",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods[method]}
                      onChange={(e) => {
                        setSelectedMethods((prev) => ({ ...prev, [method]: e.target.checked }));
                        if (!e.target.checked) {
                          setPayments((prev) => ({
                            ...prev,
                            [method]: "",
                            ...(method === "card" ? { cardNo: "" } : {}),
                            ...(method === "cheque" ? { chequeNo: "" } : {}),
                          }));
                        }
                      }}
                      style={{ accentColor: "#0d9488", width: "16px", height: "16px" }}
                    />
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </label>
                ))}
              </div>

              {/* Cash */}
              {selectedMethods.cash && (
                <PaymentSection>
                  <PaymentMethodLabel>💵 Cash</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payments.cash}
                      onChange={(e) => setPayments({ ...payments, cash: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {/* Card */}
              {selectedMethods.card && (
                <PaymentSection>
                  <PaymentMethodLabel>💳 Card</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payments.card}
                      onChange={(e) => setPayments({ ...payments, card: e.target.value })}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Card / Ref No</FormLabel>
                    <SubInput
                      type="text"
                      placeholder="Enter card / transaction ref no"
                      value={payments.cardNo}
                      onChange={(e) => setPayments({ ...payments, cardNo: e.target.value })}
                    />
                  </FormRow>
                </PaymentSection>
              )}

              {/* Cheque */}
              {selectedMethods.cheque && (
                <PaymentSection>
                  <PaymentMethodLabel>🏦 Cheque</PaymentMethodLabel>
                  <FormRow>
                    <FormLabel>Amount (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payments.cheque}
                      onChange={(e) => setPayments({ ...payments, cheque: e.target.value })}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Cheque No</FormLabel>
                    <SubInput
                      type="text"
                      placeholder="Enter cheque number"
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
                  <span>Balance</span>
                  <span>₹ {balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </SummaryRow>
              </SummaryCard>
            </ModalBody>

            <ModalFooterBar>
              <CancelButton onClick={() => setShowPaymentModal(false)}>Cancel</CancelButton>
              <SaveButton
                disabled={paidAmount === 0 || paidAmount !== netAmount}
                onClick={submitPayment}
              >
                Save Payment
              </SaveButton>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}
      {/* ══════════════ CENTRAL CASH VOUCHER PRINT MODAL ══════════════ */}
      {rpPrintVoucher && (() => {
        const v = rpPrintVoucher;
        const voucherDate = v.voucher_date
          ? new Date(v.voucher_date).toLocaleDateString("en-IN", {
            day: "2-digit", month: "2-digit", year: "numeric",
          })
          : "—";
        const accountName =
          v.account_head_details?.name || v.account_head_name || v.account_head || "—";
        const descText = v.description
          ? typeof v.description === "object"
            ? Object.values(v.description).filter(Boolean).join(", ") || "—"
            : v.description
          : "—";
        const amount = parseFloat(v.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
        const hospitalName =
          localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";

        return (
          <ModalOverlay onClick={() => setRpPrintVoucher(null)}>
            <ModalContainer
              style={{ maxWidth: 480, borderRadius: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <ModalHeader style={{ background: "#0d9488", borderRadius: "8px 8px 0 0" }}>
                <ModalTitle style={{ fontSize: 16 }}>🖨️ Central Cash Voucher</ModalTitle>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
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
                    }}
                    style={{
                      background: "rgba(255,255,255,0.2)", color: "white", border: "none",
                      borderRadius: 6, padding: "5px 14px", fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🖨️ Print
                  </button>
                  <CloseButton onClick={() => setRpPrintVoucher(null)}>✕</CloseButton>
                </div>
              </ModalHeader>

              {/* Voucher Body — mirrors the screenshot layout */}
              <ModalBody style={{ padding: "28px 36px" }}>
                {/* Hospital Name */}
                <div style={{
                  textAlign: "center", fontFamily: "'Courier New', monospace",
                  fontWeight: 700, fontSize: 15, letterSpacing: 1, marginBottom: 4,
                }}>
                  {hospitalName}
                </div>

                {/* Voucher Title */}
                <div style={{
                  textAlign: "center", fontFamily: "'Courier New', monospace",
                  fontWeight: 700, fontSize: 13, letterSpacing: 2,
                  borderBottom: "1.5px solid #222", paddingBottom: 8, marginBottom: 18,
                }}>
                  CENTRAL CASH VOUCHER
                </div>

                {/* Voucher fields */}
                {[
                  { label: "Voucher No", value: v.voucher_no || "—" },
                  { label: "Voucher Date", value: voucherDate },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", fontFamily: "'Courier New', monospace",
                    fontSize: 13, marginBottom: 6,
                  }}>
                    <span style={{ width: 130, fontWeight: 600 }}>{label}</span>
                    <span style={{ width: 20 }}>:</span>
                    <span>{value}</span>
                  </div>
                ))}

                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "12px 0" }} />

                <div style={{
                  display: "flex", fontFamily: "'Courier New', monospace",
                  fontSize: 13, marginBottom: 6,
                }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Name</span>
                  <span style={{ width: 20 }}>:</span>
                  <span>{accountName}</span>
                </div>

                <div style={{
                  display: "flex", fontFamily: "'Courier New', monospace",
                  fontSize: 13, marginBottom: 6,
                }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Remarks</span>
                  <span style={{ width: 20 }}></span>
                  <span>{descText}</span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "12px 0" }} />

                <div style={{
                  display: "flex", fontFamily: "'Courier New', monospace",
                  fontSize: 13, marginBottom: 6,
                }}>
                  <span style={{ width: 130, fontWeight: 600 }}>Amount</span>
                  <span style={{ width: 20 }}>:</span>
                  <span>{amount}</span>
                </div>
              </ModalBody>

              <ModalFooterBar>
                <CancelButton onClick={() => setRpPrintVoucher(null)}>Close</CancelButton>
                <SaveButton
                  onClick={() => {
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
                  }}
                  style={{ background: "#0d9488" }}
                >
                  🖨️ Print
                </SaveButton>
              </ModalFooterBar>
            </ModalContainer>
          </ModalOverlay>
        );
      })()}
      {/* ══════════════ END PRINT MODAL ══════════════ */}

    </Container>
  );
}