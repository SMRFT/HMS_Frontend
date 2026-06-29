import React, { useState, useEffect, useCallback } from "react";
import { Search, Mic, RotateCcw } from "lucide-react";
import ShiftDetails from "./ShiftDetails";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { CreditCard } from "lucide-react";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// Styled Components
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
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type: "", message: "" }), 4000);
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
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_active_account_heads/`, "GET");
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

    const CashCounter = localStorage.getItem("selected_outlet") || "";
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

  const handleShiftChange = async (shiftData) => {
    if (shiftData) setActiveShift(shiftData);
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
        setActiveShift(prev => (prev ? null : prev));
      }
    } catch (err) {
      console.error("Failed to refresh active shift:", err);
    }
  }, []);

  useEffect(() => {
    refreshActiveShift();
    const interval = setInterval(() => {
      refreshActiveShift();
    }, 5000);
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
    setShowPaymentModal(true);
  };

  // ── Fetch pending bills ───────────────────────────────────────────────────────
  const fetchPendingBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}get_mainblock_pendingbills/`, "GET");
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
      console.error("Pending bills error:", err);
      showToast("error", "Unable to connect to HMS server. Please try again.");
    } finally {
      setLoading(false);
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

  const fetchOpPharmacyPendingBills = useCallback(async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}OPPharmacy_pending_bills/`, "GET");
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
      setAllowedBillTypes(billTypeDetails);
      setCashCounterId(response?.data?.cashcounter?.counter_id || response?.cashcounter?.counter_id || "");
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
      console.error("OP Pharmacy bills fetch error:", err);
      showToast("error", "Unable to load OP Pharmacy bills.");
    }
  }, []);

  const fetchIpAdvancePendingBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}ipadvance_bills/`, "GET");
      const billsArray = Array.isArray(response?.data?.data) ? response.data.data : [];

      if (!billsArray.length && response?.data?.error) {
        showToast("error", "IP Advance API error: " + response.data.error);
        return;
      }

      const formatted = formatIpAdvanceData(billsArray);
      setIpAdvancePendingBills(formatted);
    } catch (err) {
      console.error("IP Advance fetch error:", err?.message || err);
      showToast("error", "Failed to load IP Advance data. Please try again.");
    } finally {
      setLoading(false);
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
  const fetchReturnBills = useCallback(async () => {
    setLoading(true);
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
      console.error("Return bills fetch error:", err);
      showToast("error", "Unable to load Return Bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPayment = async () => {
    // ── Return Bills: delegate to dedicated handler ───────────────────────────
    if (selectedBill?.source === "ReturnBill") {
      await submitReturnPayment();
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

    if (activeMethods.length === 0) {
      showToast("error", "Please enter at least one payment amount.");
      return;
    }

    // Validate ref numbers based on selected methods
    if (selectedMethods.card && parseFloat(payments.card) > 0 && !payments.cardNo.trim()) {
      showToast("error", "Please enter the Card / Transaction Reference No to proceed.");
      return;
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0 && !payments.chequeNo.trim()) {
      showToast("error", "Please enter the Cheque Number to proceed.");
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
      const payload = {
        ipNumber: selectedBill.ipNumber,
        advance_id: selectedBill.advance_id || null,    // ✅ specific advance being paid
        bill_type: selectedBill.bill_type_id ?? null,  // ✅ raw integer bill_type for CashCounterCollection
        payment_details,
        shiftno: activeShift?.shiftno || "",
      };
      const res = await apiRequest(`${HmsBaseUrl}ipadvance_bills/`, "POST", payload);
      const ipRes = res?.data || res;
      if (ipRes?.status === "success") {
        setShowPaymentModal(false);
        fetchIpAdvancePendingBills();
        showToast("success", "Payment collected successfully!");
      } else {
        showToast("error", ipRes?.message || ipRes?.error || "Payment failed. Please try again.");
      }
      return;
    }

    // ✅ UPDATED: OPPharmacy payment — now includes remarks if filled
    if (selectedBill.source === "OPPharmacy") {
      const payload = {
        Bill_id: selectedBill.Bill_id,
        uhid: selectedBill.uhid,
        payment_details,
        shiftno: activeShift?.shiftno || "",
        counter_id: cashCounterId,
        // ✅ remarks: only sent if user typed something
        ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
      };
      try {
        const res = await apiRequest(`${HmsBaseUrl}collect_oppharmacy_payment/`, "POST", payload);
        const result = res?.data || res;
        if (result?.success) {
          setShowPaymentModal(false);
          fetchOpPharmacyPendingBills();
          fetchPendingBills();
          showToast("success", "Pharmacy payment collected successfully!");
        } else {
          showToast("error", result?.error || "Payment failed. Please try again.");
        }
      } catch (err) {
        console.error("OPPharmacy submitPayment error:", err);
        showToast("error", "Payment failed. Please check your connection.");
      }
      return;
    }

    const currentBillType = selectedBill.raw_bill_type || selectedBill.bill_type || "";
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
      ...statusFields,
      payment_details,
      shiftno: activeShift?.shiftno || "",
      ...(pendingAmount > 0 ? { pendingAmount } : {}),
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}update_mainblock_pendingbills/`, "POST", payload);
      const billRes = res?.data || res;
      if (billRes?.success || billRes?.status === "success") {
        setShowPaymentModal(false);
        fetchPendingBills();
        showToast("success", "Payment collected successfully!");
      } else {
        showToast("error", billRes?.message || billRes?.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("submitPayment error:", err);
      showToast("error", "Payment failed. Please check your connection.");
    }
  };

  // ── Submit payment for Return Bills ──────────────────────────────────────────
  const submitReturnPayment = async () => {
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
      showToast("error", "Please enter at least one payment amount.");
      return;
    }

    // Validate ref numbers based on selected methods
    if (selectedMethods.card && parseFloat(payments.card) > 0 && !payments.cardNo.trim()) {
      showToast("error", "Please enter the Card / Transaction Reference No to proceed.");
      return;
    }
    if (selectedMethods.cheque && parseFloat(payments.cheque) > 0 && !payments.chequeNo.trim()) {
      showToast("error", "Please enter the Cheque Number to proceed.");
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

    try {
      const res = await apiRequest(`${HmsBaseUrl}collectpayment_return_bills/`, "POST", payload);
      const result = res?.data || res;
      if (result?.status === "success") {
        setShowPaymentModal(false);
        fetchReturnBills();
        showToast("success", "Return bill payment processed successfully!");
      } else {
        showToast("error", result?.message || result?.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("submitReturnPayment error:", err);
      showToast("error", "Payment failed. Please check your connection.");
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
            <InfoColumn>
              <InfoRow>
                <Label>SHIFT REFERENCE</Label>
                <span>:</span>
                <Value>{activeShift?.shiftno || "—"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>STARTING TIME</Label>
                <span>:</span>
                <Value
                  style={
                    shiftBelongsHere
                      ? { color: "#0d9488", fontWeight: 600 }
                      : {}
                  }
                >
                  {activeShift?.StartingTime
                    ? new Date(
                        String(activeShift.StartingTime).replace(" ", "T"),
                      ).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </Value>
              </InfoRow>
              <InfoRow>
                <Label>CLOSING TIME</Label>
                <span>:</span>
                <Value
                  style={
                    !shiftBelongsHere && activeShift?.closingTime
                      ? { color: "#dc2626", fontWeight: 600 }
                      : {}
                  }
                >
                  {activeShift?.closingTime
                    ? new Date(
                        String(activeShift.closingTime).replace(" ", "T"),
                      ).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : shiftBelongsHere
                      ? "Running…"
                      : "—"}
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
                    ? "₹ " +
                      parseFloat(
                        activeShift.OpeningBalance || 0,
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    : "₹ 0.00"}
                </Amount>
              </InfoRow>
              <InfoRow>
                <Label>CLOSING BALANCE</Label>
                <span>:</span>
                <Amount>
                  {activeShift?.ClosingBalance
                    ? "₹ " +
                      parseFloat(activeShift.ClosingBalance).toLocaleString(
                        "en-IN",
                        { minimumFractionDigits: 2 },
                      )
                    : "₹ 0.00"}
                </Amount>
              </InfoRow>
              <InfoRow>
                <Label>SHIFT STATUS</Label>
                <span>:</span>
                <Value
                  style={{
                    color:
                      activeShift?.ShiftStatus === "active"
                        ? "#10b981"
                        : "#6b7280",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
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
                <Value>
                  {activeShift?.date || new Date().toLocaleDateString("en-IN")}
                </Value>
              </InfoRow>

              {shiftBelongsHere && (
                <ShiftRunningBanner>
                  <span className="dot" />
                  Shift Running — Cashier&nbsp;
                  <strong>{activeShift.CashierID}</strong>
                </ShiftRunningBanner>
              )}

              {!shiftBelongsHere && (
                <div style={{ marginTop: "16px" }}>
                  <Button onClick={handleShiftDetailsClick}>
                    ▶ Start Counter
                  </Button>
                </div>
              )}

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
                              {(!Array.isArray(rpAccountHeads) || rpAccountHeads.length === 0) && <option value="">Loading...</option>}
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
                      <Label>Bill Type</Label>
                      <Select value={billType} onChange={(e) => setBillType(e.target.value)}>
                        <option value="ALL">ALL</option>
                        {allowedBillTypes.map((bt) => (
                          <option key={bt.bill_type} value={bt.bill_name}>
                            {bt.bill_name}
                          </option>
                        ))}
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
            </ModalBody>

            <ModalFooterBar>
              <CancelButton onClick={() => setShowPaymentModal(false)}>Cancel</CancelButton>
              <SaveButton disabled={paidAmount === 0} onClick={submitPayment}>
                {selectedBill?.source === "ReturnBill"
                  ? (balance > 0 ? `Process Refund (₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Pending)` : "Process Refund")
                  : (balance > 0 ? `Save (₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Pending)` : "Save Payment")
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

      {toast.visible && (
        <ToastWrapper>
          <ToastBox type={toast.type}>
            <ToastIcon>{toast.type === "success" ? "✅" : "❌"}</ToastIcon>
            <ToastText>{toast.message}</ToastText>
          </ToastBox>
        </ToastWrapper>
      )}
    </Container>
  );
}