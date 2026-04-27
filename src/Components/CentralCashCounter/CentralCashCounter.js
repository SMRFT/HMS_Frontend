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

  const sidebarItems = [
    { label: "Pending Bills", id: "pending-bills" },
    { label: "IP Advance", id: "ip-advance" },
    { label: "OP Advance", id: "op-advance" },
    { label: "Patient Debit", id: "patient-debit" },
    { label: "Sales Returns", id: "sales-returns" },
    { label: "Co Payment", id: "co-payment" },
    { label: "Receipt / Payment", id: "receipt-payment" },
    { label: "Print Bills", id: "print-bills" },
    { label: "Patient Query", id: "patient-query" },
  ];

  // ── Fetch active shift for TopSection display ───────────────────────────────
  useEffect(() => {
    const fetchActiveShift = async () => {
      const employeeId = localStorage.getItem("employeeId");
      const branch_code = localStorage.getItem("selected_branch");
      if (!employeeId || !branch_code) return;
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}get_active_shift/?CashierID=${employeeId}&branch_code=${branch_code}`,
          "GET"
        );
        if (res?.success && res?.data) {
          setActiveShift(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch active shift:", err);
      }
    };
    fetchActiveShift();
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
  // ✅ FIXED: Consistent API calls using your backend URLs
  const fetchReceivedBills = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/received-bills/");
      const data = await response.json();

      if (data.success) {
        const formatted = formatBillData(data.data || []);
        setReceivedBills(formatted);
      } else {
        setError(data.message || "Failed to fetch received bills");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching received bills:", err);
    }
    setLoading(false);
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
                <Value>
                  {activeShift?.StartingTime
                    ? new Date(activeShift.StartingTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
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
                    ? "₹ " + parseFloat(activeShift.OpeningBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })
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
                <Value>{activeShift?.CashCounter || "Central Cash Counter"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>BRANCH</Label>
                <span>:</span>
                <Value>{activeShift?.branch_code || "—"}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Bill Date</Label>
                <span>:</span>
                <Value>{new Date().toLocaleDateString('en-IN')}</Value>
              </InfoRow>
              <div style={{ marginTop: "16px" }}>
                <Button onClick={handleShiftDetailsClick}>
                  📋 Shift Details
                </Button>
              </div>
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
            </PanelContent>
          </MainPanel>
        </ContentWrapper>
      </MainContent>

      <ShiftDetails
        isOpen={showShiftDetails}
        onClose={() => setShowShiftDetails(false)}
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
    </Container>
  );
}