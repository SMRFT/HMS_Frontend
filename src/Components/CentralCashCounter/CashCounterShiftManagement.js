import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { 
    Clock, 
    Calendar, 
    Search, 
    XCircle, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    ArrowRight,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    User, 
    Building2, 
    Layers, 
    TrendingUp, 
    DollarSign,
    Filter,
    ShieldAlert,
    ExternalLink,
    ChevronRight,
    PowerOff
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { printAccountsReport } from "../Accounts/printAccountsReport";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 24px;
  font-family: inherit;
  color: #0f172a;

  @media (max-width: 768px) {
    padding: 14px 12px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;

  .title-area {
    h1 {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;

      @media (max-width: 640px) {
        font-size: 1.35rem;
      }
    }
    p {
      margin: 4px 0 0;
      font-size: 0.875rem;
      color: #64748b;
    }
  }

  .actions-area {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      width: 100%;
      button {
        flex: 1;
        justify-content: center;
      }
    }
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #ffffff;
  color: #0f766e;
  border: 1.5px solid #ccfbf1;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #0f766e;
    color: #ffffff;
    border-color: #0f766e;
    transform: translateX(-2px);
  }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #ffffff;
  color: #0f766e;
  border: 1.5px solid #ccfbf1;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #f0fdfa;
    border-color: #0d9488;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  }

  .icon-box {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.bg || "#f0fdfa"};
    color: ${(p) => p.color || "#0d9488"};
    flex-shrink: 0;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    .val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      word-break: break-word;
    }
    .lbl {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 12px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  color: ${(p) => (p.$active ? "#0d9488" : "#64748b")};
  border-bottom: 3px solid ${(p) => (p.$active ? "#0d9488" : "transparent")};
  margin-bottom: -2px;
  transition: all 0.2s ease;

  .badge {
    background: ${(p) => (p.$active ? "#ccfbf1" : "#f1f5f9")};
    color: ${(p) => (p.$active ? "#0f766e" : "#475569")};
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 800;
  }

  &:hover {
    color: #0f766e;
  }
`;

const FilterCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 16px;
  align-items: flex-end;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 14px 16px;
    gap: 12px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;

    label {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  }

  select, input {
    height: 38px;
    width: 100%;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13.5px;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
    }
  }

  .filter-actions {
    display: flex;
    align-items: flex-end;
    width: 100%;
    button {
      width: 100%;
      height: 38px;
      justify-content: center;
    }
  }
`;

const ContentCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
`;

const TableScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* Custom modern scrollbar */
  &::-webkit-scrollbar {
    height: 7px;
    width: 7px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  thead tr {
    background: #f8fafc;
    border-bottom: 1.5px solid #e2e8f0;
  }

  th {
    padding: 13px 16px;
    font-size: 11.5px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    background: #f8fafc;
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s ease;
    &:hover {
      background: #f0fdfa;
    }
  }

  td {
    padding: 13px 16px;
    color: #1e293b;
    vertical-align: middle;
    white-space: nowrap;
  }
`;

const TableFooterMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  flex-wrap: wrap;
  gap: 8px;

  .scroll-hint {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #0d9488;
    font-size: 11.5px;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${(p) => (p.$active ? "#dcfce7" : "#f1f5f9")};
  color: ${(p) => (p.$active ? "#15803d" : "#64748b")};
  border: 1px solid ${(p) => (p.$active ? "#bbf7d0" : "#e2e8f0")};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => (p.$active ? "#16a34a" : "#94a3b8")};
  }
`;

const CloseShiftBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
  }
`;

// ─── CLOSE SHIFT MODAL ───────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
    opacity: 0.85;
    &:hover { opacity: 1; }
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 12.5px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .item {
    display: flex;
    flex-direction: column;
    .k {
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
    }
    .v {
      color: #0f172a;
      font-weight: 700;
      font-size: 13px;
      margin-top: 2px;
      word-break: break-word;
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 11.5px;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input {
    height: 38px;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13.5px;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s;
    &:focus {
      border-color: #0d9488;
    }
    &[readonly] {
      background: #f1f5f9;
      cursor: not-allowed;
    }
  }
`;

const ModalFooter = styled.div`
  padding: 16px 22px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    button {
      width: 100%;
      justify-content: center;
    }
  }

  button {
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: #ffffff;
    color: #475569;
    border: 1.5px solid #cbd5e1;
    &:hover { background: #f1f5f9; }
  }

  .confirm-btn {
    background: #dc2626;
    color: #ffffff;
    &:hover { background: #b91c1c; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
`;

const CashCounterShiftManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active_shifts"); // 'active_shifts' | 'date_shifts'
  const [loading, setLoading] = useState(false);
  const [activeShifts, setActiveShifts] = useState([]);
  const [dateShifts, setDateShifts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  
  // Date-wise filters
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [searchShiftNo, setSearchShiftNo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (high to low / latest) | 'asc' (low to high / earliest)

  // Close shift modal state
  const [selectedShiftToClose, setSelectedShiftToClose] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState("Closed by Administrator");
  const [isClosing, setIsClosing] = useState(false);

  const hospital_code = localStorage.getItem("hospital_code") || "SH001";
  const branch_code = localStorage.getItem("selected_branch") || "SHB001";
  const current_employee = localStorage.getItem("employeeId") || "STAFF";

  // Helper to extract array safely from apiRequest result
  const extractList = (res) => {
    if (!res) return [];
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.result)) return res.data.result;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.result)) return res.result;
    return [];
  };

  // Fetch Outlets
  const fetchOutlets = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
      const list = extractList(res);
      setOutlets(list);
    } catch (err) {
      console.error("Error fetching outlets:", err);
    }
  };

  // Fetch Active Shifts
  const fetchActiveShifts = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        status: "active",
        sort_by: "shiftno",
        sort_order: sortOrder,
        "auth-hospital-code": hospital_code,
        "auth-branch-code": branch_code
      };
      const res = await apiRequest(`${HmsBaseUrl}get_shift_summary_report/`, "POST", payload);
      const list = extractList(res);
      setActiveShifts(list);
    } catch (err) {
      console.error("Error fetching active shifts:", err);
      toast.error("Failed to load active shifts");
      setActiveShifts([]);
    } finally {
      setLoading(false);
    }
  }, [hospital_code, branch_code, sortOrder]);

  // Fetch Date-wise Shifts
  const fetchDateShifts = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        from_date: fromDate,
        to_date: toDate,
        outlet_code: selectedOutlet,
        shiftno: searchShiftNo,
        status: statusFilter,
        sort_by: "shiftno",
        sort_order: sortOrder,
        "auth-hospital-code": hospital_code,
        "auth-branch-code": branch_code
      };
      const res = await apiRequest(`${HmsBaseUrl}get_shift_summary_report/`, "POST", payload);
      const list = extractList(res);
      setDateShifts(list);
    } catch (err) {
      console.error("Error fetching date shifts:", err);
      toast.error("Failed to load date-wise shifts");
      setDateShifts([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedOutlet, searchShiftNo, statusFilter, sortOrder, hospital_code, branch_code]);

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (activeTab === "active_shifts") {
      fetchActiveShifts();
    } else {
      fetchDateShifts();
    }
  }, [activeTab, fetchActiveShifts, fetchDateShifts]);

  // Open Close Shift Modal
  const handleOpenCloseModal = (shift) => {
    setSelectedShiftToClose(shift);
    setAdminRemarks(`Closed by Admin (${current_employee})`);
  };

  // Dedicated Admin Close Shift API Handler
  const handleConfirmCloseShift = async () => {
    if (!selectedShiftToClose) return;
    setIsClosing(true);
    try {
      const payload = {
        _id: selectedShiftToClose._id || selectedShiftToClose.id,
        shiftno: selectedShiftToClose.shiftno,
        admin_id: current_employee,
        closingTime: new Date().toISOString(),
        remarks: adminRemarks || "Closed by Administrator",
        "auth-hospital-code": hospital_code,
        "auth-branch-code": branch_code,
        "auth-user-id": current_employee
      };

      const res = await apiRequest(`${HmsBaseUrl}admin_close_shift/`, "POST", payload);
      const isSuccess = res?.success && res?.data?.success !== false;
      if (isSuccess) {
        toast.success(res?.data?.message || res?.message || `Shift ${selectedShiftToClose.shiftno} closed successfully!`);
        setSelectedShiftToClose(null);
        // Refresh shift lists
        if (activeTab === "active_shifts") {
          fetchActiveShifts();
        } else {
          fetchDateShifts();
        }
      } else {
        toast.error(res?.data?.message || res?.message || "Failed to close shift");
      }
    } catch (err) {
      console.error("Error closing shift:", err);
      toast.error("An error occurred while closing the shift");
    } finally {
      setIsClosing(false);
    }
  };

  const getOutletName = (code) => {
    if (!code || code === "all") return "All Outlets";
    const found = outlets.find((o) => o.outlet_code === code || o.outlet_id === code);
    if (found) return found.outlet_name || found.name;
    const known = {
      "OLET001": "Main Reception",
      "OLET002": "OP Pharmacy",
      "OLET003": "IP Pharmacy",
      "OLET004": "Cancer Block",
      "OLET005": "Emergency",
      "OLET006": "Diagnostic"
    };
    return known[code] || code;
  };

  const formatINR = (val) => {
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format Date in Indian Standard Time (IST, DD/MM/YYYY)
  const formatISTDate = (shift) => {
    if (!shift) return "—";
    if (shift.date && /^\d{2}\/\d{2}\/\d{4}$/.test(String(shift.date).trim())) {
      return shift.date;
    }
    const val = shift.StartingTime || shift.date;
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    } catch (e) {}
    return dayjs(val).format("DD/MM/YYYY");
  };

  // Format Time in Indian Standard Time (IST, hh:mm A)
  const formatISTTime = (isoVal, fallbackDisp) => {
    if (isoVal) {
      try {
        const d = new Date(isoVal);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
      } catch (e) {}
    }
    if (fallbackDisp && fallbackDisp !== "—" && fallbackDisp.trim() !== "") {
      return fallbackDisp;
    }
    return "—";
  };

  // Only genuinely active shifts (ShiftStatus active and no closingTime) appear in the active tab
  const filteredActiveShifts = activeShifts.filter(
    (s) => (s.ShiftStatus || "").toLowerCase() === "active" && !s.closingTime
  );

  // Computed statistics
  const currentList = activeTab === "active_shifts" ? filteredActiveShifts : dateShifts;

  // Shifts sorted by Shift Number order (natural numeric comparison)
  const sortedList = useMemo(() => {
    return [...currentList].sort((a, b) => {
      const sA = (a.shiftno || "").trim();
      const sB = (b.shiftno || "").trim();
      const cmp = sA.localeCompare(sB, undefined, { numeric: true, sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [currentList, sortOrder]);
  const totalCollections = currentList.reduce((acc, s) => acc + (parseFloat(s.collected_Amount) || 0), 0);
  const totalCredits = currentList.reduce((acc, s) => acc + (parseFloat(s.CreditAmount ?? s.credit_amount ?? 0) || 0), 0);
  const totalOpenings = currentList.reduce((acc, s) => acc + (parseFloat(s.OpeningBalance) || 0), 0);
  const totalClosings = currentList.reduce((acc, s) => acc + (parseFloat(s.ClosingBalance) || 0), 0);

  return (
    <PageContainer>
      {/* HEADER */}
      <HeaderSection>
        <div className="title-area">
          <h1>
            <Clock size={28} color="#0d9488" /> Cash Counter Shift Management
          </h1>
          <p>Real-time active shift tracking, historical date-wise shift auditing, and counter closing controls.</p>
        </div>
        <div className="actions-area">
          <BackButton onClick={() => navigate("/CentralCashCounter")} title="Return to Central Cash Counter">
            <ArrowLeft size={16} /> Back to Central Cash Counter
          </BackButton>
          <RefreshButton onClick={activeTab === "active_shifts" ? fetchActiveShifts : fetchDateShifts} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Shifts
          </RefreshButton>
        </div>
      </HeaderSection>

      {/* STATS OVERVIEW */}
      <StatsGrid>
        <StatCard bg="#f0fdfa" color="#0d9488">
          <div className="icon-box">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="val">{filteredActiveShifts.length}</span>
            <span className="lbl">Currently Active Shifts</span>
          </div>
        </StatCard>

        <StatCard bg="#f0fdf4" color="#16a34a">
          <div className="icon-box">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="val">₹ {formatINR(totalCollections)}</span>
            <span className="lbl">Cash Collected ({activeTab === "active_shifts" ? "Active" : "Period"})</span>
          </div>
        </StatCard>

        <StatCard bg="#eff6ff" color="#2563eb">
          <div className="icon-box">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="val">₹ {formatINR(totalCredits)}</span>
            <span className="lbl">Credit (UPI / Card / Cheque / Credit)</span>
          </div>
        </StatCard>

        <StatCard bg="#faf5ff" color="#9333ea">
          <div className="icon-box">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="val">{outlets.length}</span>
            <span className="lbl">Hospital Outlets</span>
          </div>
        </StatCard>
      </StatsGrid>

      {/* TAB NAVIGATION */}
      <TabBar>
        <TabItem $active={activeTab === "active_shifts"} onClick={() => setActiveTab("active_shifts")}>
          <Clock size={16} /> All Active Shifts
          <span className="badge">{filteredActiveShifts.length}</span>
        </TabItem>
        <TabItem $active={activeTab === "date_shifts"} onClick={() => setActiveTab("date_shifts")}>
          <Calendar size={16} /> Date-Wise Shift Details
          <span className="badge">{dateShifts.length}</span>
        </TabItem>
      </TabBar>

      {/* FILTER SECTION (FOR DATE-WISE TAB) */}
      {activeTab === "date_shifts" && (
        <FilterCard>
          <div className="filter-group">
            <label>From Date</label>
            <DatePicker
              value={dayjs(fromDate)}
              onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
              format="DD/MM/YYYY"
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <DatePicker
              value={dayjs(toDate)}
              onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
              format="DD/MM/YYYY"
              style={{ width: "100%", height: "38px" }}
            />
          </div>

          <div className="filter-group">
            <label>Outlet / Counter</label>
            <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)}>
              <option value="all">All Outlets</option>
              {outlets.map((o) => (
                <option key={o.outlet_code || o.outlet_id} value={o.outlet_code || o.outlet_id}>
                  {o.outlet_name || o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Shift Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Closed / Inactive Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search Shift Number</label>
            <input
              type="text"
              placeholder="e.g. 2627/005742"
              value={searchShiftNo}
              onChange={(e) => setSearchShiftNo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Order Wise</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Shift No: High to Low (Latest First)</option>
              <option value="asc">Shift No: Low to High (Earliest First)</option>
            </select>
          </div>

          <div className="filter-actions">
            <RefreshButton onClick={fetchDateShifts} disabled={loading}>
              <Search size={14} /> Filter
            </RefreshButton>
          </div>
        </FilterCard>
      )}

      {/* SHIFTS TABLE */}
      <ContentCard>
        <TableScrollWrapper>
          <Table>
            <thead>
              <tr>
                <th
                  onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  title="Click to toggle Shift Number order (High to Low / Low to High)"
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>Shift No</span>
                    {sortOrder === "desc" ? (
                      <ArrowDown size={14} color="#0d9488" />
                    ) : (
                      <ArrowUp size={14} color="#0d9488" />
                    )}
                  </div>
                </th>
                <th>Date (IST)</th>
                <th>Outlet / Counter</th>
                <th>Cashier</th>
                <th>Start Time (IST)</th>
                <th>End Time (IST)</th>
                <th style={{ textAlign: "right" }}>Opening (₹)</th>
                <th style={{ textAlign: "right" }}>Cash Coll (₹)</th>
                <th style={{ textAlign: "right" }}>Credit Coll (₹)</th>
                <th style={{ textAlign: "right" }}>Closing (₹)</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.length > 0 ? (
                sortedList.map((shift, idx) => {
                  const isActive = shift.ShiftStatus === "active";
                  return (
                    <tr key={shift.shiftno || idx}>
                      <td style={{ fontWeight: "700", fontFamily: "monospace", color: "#0d9488" }}>
                        {shift.shiftno}
                      </td>
                      <td>{formatISTDate(shift)}</td>
                      <td>
                        <div style={{ fontWeight: "600" }}>
                          {shift.CashCounterName || getOutletName(shift.SelectedOutlet || shift.outlet_code) || "—"}
                        </div>
                        {shift.CashCounterName && getOutletName(shift.SelectedOutlet || shift.outlet_code) &&
                         shift.CashCounterName.trim().toLowerCase() !== getOutletName(shift.SelectedOutlet || shift.outlet_code).trim().toLowerCase() && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {getOutletName(shift.SelectedOutlet || shift.outlet_code)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{shift.User || shift.CashierID || "—"}</div>
                      </td>
                      <td style={{ fontWeight: "600", color: "#0f172a" }}>
                        {formatISTTime(shift.StartingTime, shift.StartTime)}
                      </td>
                      <td style={{ color: shift.closingTime || shift.EndTime ? "#0f172a" : "#94a3b8" }}>
                        {formatISTTime(shift.closingTime, shift.EndTime)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "600" }}>
                        {formatINR(shift.OpeningBalance)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "#16a34a" }}>
                        {formatINR(shift.collected_Amount)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "#2563eb" }}>
                        {formatINR(shift.CreditAmount ?? shift.credit_amount ?? 0)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "#0f172a" }}>
                        {formatINR(shift.ClosingBalance)}
                      </td>
                      <td>
                        <StatusPill $active={isActive}>
                          <span className="dot" />
                          {isActive ? "Active" : "Closed"}
                        </StatusPill>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {isActive ? (
                          <CloseShiftBtn onClick={() => handleOpenCloseModal(shift)} title="Close Shift">
                            <PowerOff size={13} /> Close Shift
                          </CloseShiftBtn>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    {loading ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <RefreshCw size={18} className="animate-spin text-teal-600" /> Loading shift records...
                      </div>
                    ) : activeTab === "active_shifts" ? (
                      "No active shifts currently running. All cash counters are closed."
                    ) : (
                      "No shift records found matching the selected date and filter criteria."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableScrollWrapper>
        <TableFooterMeta>
          <span>
            Showing <strong>{sortedList.length}</strong> shift records (Ordered by Shift Number: {sortOrder === "desc" ? "High to Low" : "Low to High"})
          </span>
          <span className="scroll-hint">← Scroll horizontally for more details →</span>
        </TableFooterMeta>
      </ContentCard>

      {/* CLOSE SHIFT CONFIRMATION MODAL */}
      {selectedShiftToClose && (
        <ModalOverlay onClick={() => setSelectedShiftToClose(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                <PowerOff size={18} /> Close Active Cash Counter Shift
              </h3>
              <button onClick={() => setSelectedShiftToClose(null)}>&times;</button>
            </ModalHeader>

            <ModalBody>
              <InfoCard>
                <div className="item">
                  <span className="k">Shift Number</span>
                  <span className="v" style={{ color: "#0d9488", fontFamily: "monospace" }}>
                    {selectedShiftToClose.shiftno}
                  </span>
                </div>
                <div className="item">
                  <span className="k">Cashier / Staff</span>
                  <span className="v">
                    {selectedShiftToClose.User || selectedShiftToClose.CashierID}
                  </span>
                </div>
                <div className="item">
                  <span className="k">Cash Counter</span>
                  <span className="v">{selectedShiftToClose.CashCounterName || selectedShiftToClose.CashCounter}</span>
                </div>
                <div className="item">
                  <span className="k">Outlet</span>
                  <span className="v">{getOutletName(selectedShiftToClose.SelectedOutlet || selectedShiftToClose.outlet_code)}</span>
                </div>
                <div className="item">
                  <span className="k">Started At (IST)</span>
                  <span className="v" style={{ fontWeight: "600" }}>
                    {formatISTDate(selectedShiftToClose)} &bull; {formatISTTime(selectedShiftToClose.StartingTime, selectedShiftToClose.StartTime)}
                  </span>
                </div>
                <div className="item">
                  <span className="k">Opening Balance</span>
                  <span className="v">₹ {formatINR(selectedShiftToClose.OpeningBalance)}</span>
                </div>
                <div className="item">
                  <span className="k">Cash Collected</span>
                  <span className="v" style={{ color: "#16a34a" }}>
                    ₹ {formatINR(selectedShiftToClose.collected_Amount)}
                  </span>
                </div>
                <div className="item">
                  <span className="k">Credit (UPI/Card/Cheque/Credit)</span>
                  <span className="v" style={{ color: "#2563eb" }}>
                    ₹ {formatINR(selectedShiftToClose.CreditAmount ?? selectedShiftToClose.credit_amount ?? 0)}
                  </span>
                </div>
                <div className="item">
                  <span className="k">Sales Return</span>
                  <span className="v" style={{ color: "#dc2626", fontWeight: "700" }}>
                    ₹ {formatINR(selectedShiftToClose.SalesReturnAmount || 0)}
                  </span>
                </div>
              </InfoCard>

              <FormGroup>
                <label>Admin Remarks / Reason for Closing</label>
                <input
                  type="text"
                  placeholder="e.g. Counter closed early, Cashier logged out"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                />
              </FormGroup>

              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "12px 14px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>Calculated Closing Balance:</div>
                  <div style={{ fontSize: "10.5px", color: "#15803d", marginTop: "2px" }}>Opening Balance + Cash Collected - Sales Return</div>
                </div>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#166534" }}>
                  ₹ {formatINR(
                    Math.max(
                      0,
                      (parseFloat(selectedShiftToClose.OpeningBalance) || 0) +
                      (parseFloat(selectedShiftToClose.collected_Amount) || 0) -
                      (parseFloat(selectedShiftToClose.SalesReturnAmount) || 0)
                    )
                  )}
                </span>
              </div>
            </ModalBody>

            <ModalFooter>
              <button className="cancel-btn" onClick={() => setSelectedShiftToClose(null)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmCloseShift} disabled={isClosing}>
                {isClosing ? "Closing Shift..." : "Confirm & Close Shift"}
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default CashCounterShiftManagement;

