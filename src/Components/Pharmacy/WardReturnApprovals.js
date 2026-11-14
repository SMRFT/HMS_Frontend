import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  CheckCircle2,
  XCircle,
  Printer,
  RefreshCw,
  Search,
  Calendar,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  UserCheck,
  AlertCircle
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import HospitalHeader from "../Images/Header.png";

const colors = {
  primary: "#136A63",
  primaryHover: "#0E524C",
  primaryLight: "#E6F4F2",
  accent: "#D97706",
  accentLight: "#FEF3C7",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
};

const PageContainer = styled.div`
  padding: 24px;
  background: ${colors.background};
  min-height: calc(100vh - 80px);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 1.55rem;
      color: ${colors.textPrimary};
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: ${colors.textSecondary};
      font-size: 0.88rem;
      margin: 4px 0 0 0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const RefreshBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  color: ${colors.primary};
  border: 1.5px solid ${colors.primary};
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NavTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid ${colors.border};
  padding-bottom: 2px;
`;

const NavTab = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? colors.primaryLight : "transparent"};
  color: ${props => props.$active ? colors.primary : colors.textSecondary};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? colors.primary : "transparent"};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? "700" : "500"};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    background: ${colors.primaryLight};
  }
`;

const Badge = styled.span`
  background: ${props => props.$variant === "primary" ? colors.primary : props.$variant === "accent" ? colors.accent : "#94A3B8"};
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
`;

const MetricCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .meta {
    .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 600;
      color: ${colors.textSecondary};
      letter-spacing: 0.04em;
    }
    .value {
      font-size: 1.45rem;
      font-weight: 700;
      color: ${props => props.$color || colors.textPrimary};
      margin-top: 4px;
    }
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: ${props => props.$bg || colors.primaryLight};
    color: ${props => props.$color || colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const FilterBar = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .search-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
    display: flex;
    align-items: center;

    svg {
      position: absolute;
      left: 12px;
      color: ${colors.textMuted};
    }

    input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1.5px solid ${colors.border};
      border-radius: 8px;
      font-size: 0.88rem;
      outline: none;
      transition: border 0.2s;

      &:focus {
        border-color: ${colors.primary};
      }
    }
  }

  .date-group {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: ${colors.textSecondary};
    }

    input[type="date"] {
      padding: 7px 10px;
      border: 1.5px solid ${colors.border};
      border-radius: 8px;
      font-size: 0.85rem;
      outline: none;
      color: ${colors.textPrimary};

      &:focus {
        border-color: ${colors.primary};
      }
    }
  }
`;

const TableCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: #F8FAFC;
    color: #475569;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 9px 12px;
    border-bottom: 2px solid ${colors.border};
    white-space: nowrap;
  }

  td {
    padding: 8px 12px;
    font-size: 0.78rem;
    color: ${colors.textPrimary};
    border-bottom: 1px solid ${colors.border};
    vertical-align: middle;
  }

  tr:hover td {
    background: #F9FAFB;
  }
`;

const PatientTag = styled.div`
  .name {
    font-weight: 700;
    font-size: 0.82rem;
    color: ${colors.textPrimary};
    line-height: 1.25;
  }
  .meta-grid {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 4px;
  }
  .meta-col {
    display: flex;
    flex-direction: column;
  }
  .meta-label {
    font-size: 0.62rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.1;
  }
  .meta-value {
    font-size: 0.75rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.2;
    margin-top: 1px;
  }
`;

const WardTag = styled.span`
  display: inline-block;
  background: #F1F5F9;
  color: #334155;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
  font-weight: 600;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${props => props.$type === "Approved" ? colors.successLight : props.$type === "Pending" ? colors.accentLight : colors.dangerLight};
  color: ${props => props.$type === "Approved" ? colors.success : props.$type === "Pending" ? colors.accent : colors.danger};
`;

const ActionRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const CardViewBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: #0f766e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  height: 28px;
  padding: 0 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #115e59;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.76rem;
  font-weight: 600;
  height: 28px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &.approve {
    background: ${colors.success};
    color: #ffffff;
    &:hover { background: #15803d; }
  }

  &.reject {
    background: ${colors.danger};
    color: #ffffff;
    &:hover { background: #b91c1c; }
  }

  &.print {
    background: #0284C7;
    color: #ffffff;
    &:hover { background: #0369A1; }
  }

  &.view {
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #CBD5E1;
    &:hover { background: #E2E8F0; }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 95%;
  max-width: ${props => props.$maxWidth || "750px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8FAFC;

  h3 {
    margin: 0;
    font-size: 1.15rem;
    color: ${colors.textPrimary};
    font-weight: 700;
  }

  button {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: ${colors.textMuted};
    cursor: pointer;
    &:hover { color: ${colors.danger}; }
  }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: 14px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #F8FAFC;
`;

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatBillNo = (val) => {
  if (!val && val !== 0) return "—";
  const str = String(val).trim();
  if (str.includes("/")) {
    const parts = str.split("/");
    return parts[parts.length - 1] || str;
  }
  return str;
};

export default function WardReturnApprovals() {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "report"
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState(getTodayDate);
  const [toDate, setToDate] = useState(getTodayDate);

  // Modals
  const [selectedPrintBill, setSelectedPrintBill] = useState(null);
  const [selectedViewItem, setSelectedViewItem] = useState(null);

  const fetchPendingReturns = async () => {
    try {
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
      const res = await apiRequest(`${HmsBaseUrl}get_pending_ward_returns/`, "GET");
      const backendResponse = res.data || {};
      if (res.success && backendResponse.success !== false) {
        setPendingList(backendResponse.data || []);
      } else {
        setPendingList([]);
      }
    } catch (e) {
      console.error("Failed to fetch pending ward returns:", e);
      setPendingList([]);
    }
  };

  const fetchApprovedReturns = async () => {
    try {
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
      let url = `${HmsBaseUrl}get_ward_return_details/`;
      const effFrom = fromDate || getTodayDate();
      const effTo = toDate || getTodayDate();
      const params = [];
      if (effFrom) params.push(`from_date=${effFrom}`);
      if (effTo) params.push(`to_date=${effTo}`);
      if (params.length) url += `?${params.join("&")}`;

      const res = await apiRequest(url, "GET");
      const backendResponse = res.data || {};
      if (res.success && backendResponse.success !== false) {
        setApprovedList(backendResponse.data || []);
      } else {
        setApprovedList([]);
      }
    } catch (e) {
      console.error("Failed to fetch approved returns:", e);
      setApprovedList([]);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPendingReturns(), fetchApprovedReturns()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [fromDate, toDate]);

  // Confirmation & Toast state
  const [confirmModal, setConfirmModal] = useState(null); // { billId, returnRequestId, action, patientName, itemCount, returnAmount }
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async (billId, returnRequestId, action) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const employeeId = localStorage.getItem("employee_id") || "50886";

    setActionLoading(returnRequestId);
    setConfirmModal(null);
    try {
      const payload = {
        Bill_id: billId,
        return_request_id: returnRequestId,
        action: action,
        "auth-user-id": employeeId
      };

      const res = await apiRequest(`${HmsBaseUrl}approve_ward_return/`, "POST", payload);
      const backendResponse = res.data || {};

      if (res.success && backendResponse.success !== false) {
        showToast(backendResponse.message || `Return ${action}d successfully`, "success");
        try {
          localStorage.setItem("hms_last_billing_update", Date.now().toString());
          if (typeof BroadcastChannel !== "undefined") {
            new BroadcastChannel("hms_billing_channel").postMessage({
              type: "WARD_RETURN_APPROVED",
              billId,
              returnRequestId,
              action,
              isWardRequest: true,
            });
          }
        } catch (e) {}
        await loadAll();
        if (action === "Approve" && backendResponse.ward_return_details) {
          setSelectedPrintBill(backendResponse.ward_return_details);
          setActiveTab("report");
        }
      } else {
        showToast(backendResponse.error || backendResponse.message || res.error || "Failed to process return", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error processing request", "error");
    } finally {
      setActionLoading(null);
    }
  };


  const executePrint = () => {
    const printContent = document.getElementById("ward-return-print-area");
    if (!printContent) return;
    const printWindow = window.open("", "", "width=960,height=720");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Ward Return Bill - ${formatBillNo(selectedPrintBill?.ward_return_bill_no) || "Print"}</title>
            <style>
              @page {
                size: A5 landscape;
                margin: 4mm 6mm;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 210mm;
                margin: 0;
                padding: 0;
                font-family: Arial, Helvetica, sans-serif;
                color: #111;
                background: #ffffff;
                font-size: 10.5px;
                line-height: 1.3;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .bill-wrapper {
                width: 100%;
                max-width: 198mm;
                margin: 0 auto;
                padding: 2mm 3mm;
                background: #ffffff;
                box-sizing: border-box;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 3px 5px !important;
                vertical-align: middle;
              }
              th {
                background: #edf2f7 !important;
                color: #111 !important;
                font-weight: 700;
                font-size: 10px !important;
                text-transform: uppercase;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              tr {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              @media print {
                body {
                  padding: 0;
                  background: #fff;
                }
                .bill-wrapper {
                  border: none;
                  padding: 0 !important;
                  margin: 0 auto !important;
                  width: 100% !important;
                  max-width: 198mm !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="bill-wrapper">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered lists with strict date range filtering
  const filterList = (list, type = "approved") => {
    return list.filter((item) => {
      let match = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const pName = (item.patient_name || "").toLowerCase();
        const uhid = (item.uhid || "").toLowerCase();
        const ip = (item.inpatient_number || item.ip_number || "").toLowerCase();
        const bNo = (item.bill_no || "").toLowerCase();
        const retNo = (item.ward_return_bill_no || "").toLowerCase();
        const bNoFmt = formatBillNo(item.bill_no).toLowerCase();
        const retNoFmt = formatBillNo(item.ward_return_bill_no).toLowerCase();
        const ward = (item.ward_name || item.room_no || "").toLowerCase();
        match =
          pName.includes(q) ||
          uhid.includes(q) ||
          ip.includes(q) ||
          bNo.includes(q) ||
          retNo.includes(q) ||
          bNoFmt.includes(q) ||
          retNoFmt.includes(q) ||
          ward.includes(q);
      }
      if (!match) return false;

      // Filter by date: strictly display records that fall within the selected date range
      const effFrom = fromDate || getTodayDate();
      const effTo = toDate || getTodayDate();

      let itemDateStr = "";
      if (type === "approved") {
        itemDateStr = (item.ward_return_bill_date || item.bill_date || "").slice(0, 10);
      } else {
        itemDateStr = (item.requested_at || item.bill_date || "").slice(0, 10);
      }

      if (itemDateStr) {
        if (effFrom && itemDateStr < effFrom) return false;
        if (effTo && itemDateStr > effTo) return false;
      }

      return true;
    });
  };

  const filteredPending = filterList(pendingList, "pending");
  const filteredApproved = filterList(approvedList, "approved");

  // Summary Metrics based on filtered records
  const totalPendingCount = filteredPending.length;
  const totalApprovedCount = filteredApproved.length;
  const totalApprovedReturnValue = filteredApproved.reduce((acc, curr) => acc + (parseFloat(curr.return_amount) || 0), 0);
  const totalOriginalBillValue = filteredApproved.reduce((acc, curr) => acc + (parseFloat(curr.original_bill_amount) || 0), 0);
  const totalNetRetainedValue = Math.max(0, totalOriginalBillValue - totalApprovedReturnValue);

  return (
    <PageContainer>
      {/* ── Header ── */}
      <HeaderSection>
        <div className="title-group">
          <h1>
            <FileText size={28} color={colors.primary} />
            Ward Returns Management
          </h1>
          <p>Review ward medicine returns, approve stock adjustments in blocked qty, and generate return credit bills.</p>
        </div>
        <div className="header-actions">
          <RefreshBtn onClick={loadAll} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </RefreshBtn>
        </div>
      </HeaderSection>

      {/* ── Metric Cards ── */}
      <MetricCardsGrid>
        <MetricCard $bg={colors.accentLight} $color={colors.accent}>
          <div className="meta">
            <div className="label">Pending Approvals</div>
            <div className="value">{totalPendingCount}</div>
          </div>
          <div className="icon-wrap">
            <Clock size={22} />
          </div>
        </MetricCard>

        <MetricCard $bg={colors.successLight} $color={colors.success}>
          <div className="meta">
            <div className="label">Approved Returns</div>
            <div className="value">{totalApprovedCount}</div>
          </div>
          <div className="icon-wrap">
            <UserCheck size={22} />
          </div>
        </MetricCard>
      </MetricCardsGrid>

      {/* ── Sub Tabs ── */}
      <NavTabs>
        <NavTab $active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>
          <Clock size={16} />
          Pending Approvals
          <Badge $variant="accent">{filteredPending.length}</Badge>
        </NavTab>
        <NavTab $active={activeTab === "report"} onClick={() => setActiveTab("report")}>
          <FileText size={16} />
          Approved Returns Report &amp; Print
          <Badge $variant="primary">{filteredApproved.length}</Badge>
        </NavTab>
      </NavTabs>

      {/* ── Search & Date Filter Bar ── */}
      <FilterBar>
        <div className="search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Patient Name, UHID, IP Number, Bill No, Return Bill No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="date-group">
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onBlur={(e) => { if (!e.target.value) setFromDate(getTodayDate()); }}
          />
        </div>

        <div className="date-group">
          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onBlur={(e) => { if (!e.target.value) setToDate(getTodayDate()); }}
          />
        </div>

        <button
          onClick={() => { setFromDate(getTodayDate()); setToDate(getTodayDate()); }}
          style={{
            padding: "8px 14px",
            border: `1.5px solid ${colors.primary}`,
            background: colors.primaryLight,
            color: colors.primary,
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}
          title="Reset to today's date"
        >
          Today
        </button>

        {(fromDate !== getTodayDate() || toDate !== getTodayDate() || searchQuery) && (
          <button
            onClick={() => { setFromDate(getTodayDate()); setToDate(getTodayDate()); setSearchQuery(""); }}
            style={{
              padding: "8px 14px",
              border: "1px solid #CBD5E1",
              background: "#F1F5F9",
              color: colors.textSecondary,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              whiteSpace: "nowrap"
            }}
            title="Reset filters to today's date"
          >
            Reset Filters
          </button>
        )}
      </FilterBar>

      {/* ── Main Tab Content ── */}
      <TableCard>
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px", display: "block", color: colors.primary }} />
            Loading ward returns data...
          </div>
        ) : activeTab === "pending" ? (
          // ── PENDING APPROVALS TABLE ──
          filteredPending.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
              <CheckCircle2 size={36} color={colors.success} style={{ margin: "0 auto 10px", display: "block" }} />
              <strong>No Pending Ward Returns</strong>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>All ward return requests have been processed.</div>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Ward / Room</th>
                  <th>Bill Details</th>
                  <th>Requested By &amp; Time</th>
                  <th>Returning Items</th>
                  <th>Amounts</th>
                  <th>Status</th>
                  <th style={{ whiteSpace: "nowrap", minWidth: "185px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((req, i) => (
                  <tr key={req.return_request_id || i}>
                    <td>
                      <PatientTag>
                        <div className="name">{req.patient_name || "—"}</div>
                        <div className="meta-grid">
                          <div className="meta-col">
                            <span className="meta-label">UHID</span>
                            <span className="meta-value">{req.uhid || "—"}</span>
                          </div>
                          {req.ip_number &&
                            req.ip_number !== "—" &&
                            !String(req.ip_number).trim().toUpperCase().startsWith("OP") && (
                              <div className="meta-col">
                                <span className="meta-label">IP NUMBER</span>
                                <span className="meta-value">{req.ip_number}</span>
                              </div>
                            )}
                        </div>
                      </PatientTag>
                    </td>

                    <td>
                      <WardTag>{req.ward_name || req.room_no || "General Ward"}</WardTag>
                      {req.doctor_name && (
                        <div style={{ fontSize: "0.72rem", color: colors.textSecondary, marginTop: 3 }}>
                          Doc: {req.doctor_name}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.78rem" }}>{formatBillNo(req.bill_no) || `Bill #${req.Bill_id}`}</div>
                      <div style={{ fontSize: "0.72rem", color: colors.textMuted, marginTop: 2 }}>
                        Date: {formatDate(req.bill_date)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.78rem", color: colors.textPrimary }}>
                        {req.requested_by_name || req.requested_by || "Ward Staff"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: colors.textMuted, marginTop: 2 }}>
                        {formatDateTime(req.requested_at)}
                      </div>
                    </td>

                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <CardViewBtn
                        type="button"
                        title="View Returned Items"
                        onClick={() => setSelectedViewItem({
                          patient_name: req.patient_name,
                          uhid: req.uhid,
                          inpatient_number: req.ip_number || req.inpatient_number,
                          ward_name: req.ward_name,
                          room_no: req.room_no,
                          doctor_name: req.doctor_name,
                          bill_no: req.bill_no,
                          ward_return_bill_no: req.return_request_id ? `REQ #${req.return_request_id}` : "Pending Return",
                          original_bill_amount: req.original_bill_amount,
                          return_amount: req.return_amount,
                          balance_amount: req.balance_amount ?? (Number(req.original_bill_amount || 0) - Number(req.return_amount || 0)),
                          medicine_particulars: req.items || [],
                          items: req.items || [],
                          Bill_id: req.Bill_id,
                          return_request_id: req.return_request_id,
                          is_pending: true,
                        })}
                      >
                        <Eye size={13} />
                        View Items ({(req.items || []).length})
                      </CardViewBtn>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.76rem", lineHeight: 1.35 }}>
                        <div>Orig Bill: <strong>₹{Number(req.original_bill_amount || 0).toFixed(2)}</strong></div>
                        <div style={{ color: colors.accent, fontWeight: 700, marginTop: 1 }}>
                          Return: -₹{Number(req.return_amount || 0).toFixed(2)}
                        </div>
                        <div style={{ color: colors.success, fontWeight: 700, marginTop: 1 }}>
                          Net: ₹{Math.max(0, Number(req.original_bill_amount || 0) - Number(req.return_amount || 0)).toFixed(2)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusPill $type="Pending">Pending Approval</StatusPill>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <ActionRow>
                        <ActionBtn
                          className="approve"
                          disabled={actionLoading === req.return_request_id}
                          onClick={() => setConfirmModal({
                            billId: req.Bill_id,
                            returnRequestId: req.return_request_id,
                            action: "Approve",
                            patientName: req.patient_name || req.uhid,
                            itemCount: (req.items || []).length,
                            returnAmount: req.return_amount
                          })}
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </ActionBtn>
                        <ActionBtn
                          className="reject"
                          disabled={actionLoading === req.return_request_id}
                          onClick={() => setConfirmModal({
                            billId: req.Bill_id,
                            returnRequestId: req.return_request_id,
                            action: "Reject",
                            patientName: req.patient_name || req.uhid,
                            itemCount: (req.items || []).length,
                            returnAmount: req.return_amount
                          })}
                        >
                          <XCircle size={13} />
                          Reject
                        </ActionBtn>
                      </ActionRow>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )
        ) : (
          // ── APPROVED RETURNS REPORT TABLE ──
          filteredApproved.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
              <FileText size={36} color={colors.textMuted} style={{ margin: "0 auto 10px", display: "block" }} />
              <strong>No Approved Ward Returns Found</strong>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>Approved return bills will be listed here with print capability.</div>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Return Bill No</th>
                  <th>Return Date &amp; Time</th>
                  <th>Original Bill No</th>
                  <th>Patient Details</th>
                  <th>Ward / Room</th>
                  <th style={{ textAlign: "right" }}>Original Bill (₹)</th>
                  <th style={{ textAlign: "right" }}>Return Amt (₹)</th>
                  <th style={{ textAlign: "right" }}>Net Amt (₹)</th>
                  <th>Approved By</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApproved.map((ret, i) => (
                  <tr key={ret.ward_return_bill_no || i}>
                    <td>
                      <strong style={{ color: colors.primary, fontSize: "0.78rem" }}>{formatBillNo(ret.ward_return_bill_no)}</strong>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.78rem" }}>{formatDate(ret.ward_return_bill_date)}</div>
                      <div style={{ fontSize: "0.72rem", color: colors.textMuted, marginTop: 2 }}>
                        {new Date(ret.ward_return_bill_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.78rem" }}>{formatBillNo(ret.bill_no)}</div>
                    </td>

                    <td>
                      <PatientTag>
                        <div className="name">{ret.patient_name || "—"}</div>
                        <div className="meta-grid">
                          <div className="meta-col">
                            <span className="meta-label">UHID</span>
                            <span className="meta-value">{ret.uhid || "—"}</span>
                          </div>
                          {ret.inpatient_number &&
                            ret.inpatient_number !== "—" &&
                            !String(ret.inpatient_number).trim().toUpperCase().startsWith("OP") && (
                              <div className="meta-col">
                                <span className="meta-label">IP NUMBER</span>
                                <span className="meta-value">{ret.inpatient_number}</span>
                              </div>
                            )}
                        </div>
                      </PatientTag>
                    </td>

                    <td>
                      <WardTag>{ret.room_no || "—"}</WardTag>
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 600, fontSize: "0.78rem" }}>
                      ₹{Number(ret.original_bill_amount || 0).toFixed(2)}
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: colors.accent, fontSize: "0.78rem" }}>
                      - ₹{Number(ret.return_amount || 0).toFixed(2)}
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: colors.success, fontSize: "0.78rem" }}>
                      ₹{Number(ret.balance_amount ?? (ret.original_bill_amount - ret.return_amount) ?? 0).toFixed(2)}
                    </td>

                    <td>
                      <div style={{ fontSize: "0.78rem" }}>{ret.pharmacist_name || ret.created_by || "Pharmacist"}</div>
                    </td>

                    <td>
                      <StatusPill $type="Approved">Approved</StatusPill>
                    </td>

                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <ActionRow style={{ justifyContent: "center" }}>
                        <ActionBtn
                          className="print"
                          title="Print Return Bill"
                          onClick={() => setSelectedPrintBill(ret)}
                        >
                          <Printer size={13} />
                          Print Bill
                        </ActionBtn>
                        <ActionBtn
                          className="view"
                          title="View Items"
                          onClick={() => setSelectedViewItem(ret)}
                        >
                          <Eye size={13} />
                          View Items
                        </ActionBtn>
                      </ActionRow>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )
        )}
      </TableCard>

      {/* ── PRINT BILL MODAL ── */}
      {selectedPrintBill && (
        <ModalBackdrop onClick={() => setSelectedPrintBill(null)}>
          <ModalContent $maxWidth="900px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Ward Return Bill Print Preview</h3>
              <button onClick={() => setSelectedPrintBill(null)}>✕</button>
            </ModalHeader>

            <ModalBody>
              <div id="ward-return-print-area" style={{ padding: "14px 18px", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "11px", color: "#111", background: "#fff", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box" }}>
                {/* Header with Hospital Logo and Info */}
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 2 }}>
                    <img
                      src={HospitalHeader}
                      alt="Shanmuga Hospital Limited"
                      style={{ height: 42, objectFit: "contain" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#005b8e", letterSpacing: 0.5 }}>
                        SHANMUGA HOSPITAL LIMITED
                      </div>
                      <div style={{ fontSize: 10.5, color: "#333", marginTop: 1 }}>
                        51/24, Saradha College Road, Salem - 636007
                      </div>
                      <div style={{ fontSize: 10.5, color: "#333" }}>
                        Ph No: 04272706666
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 4, fontWeight: 800, fontSize: 12.5, letterSpacing: 0.8, color: "#1e293b" }}>
                    PHARMACY WARD RETURN BILL / CREDIT NOTE
                  </div>
                  <div style={{ fontSize: 10, fontStyle: "italic", color: "#64748b", marginTop: 1 }}>
                    *** Duplicate / Return Voucher ***
                  </div>
                </div>

                {/* DL NO, CIN, GST NO */}
                <div style={{ borderTop: "1px solid #cbd5e0", paddingTop: 3, marginBottom: 2, display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "#111" }}>
                  <span>DL NO : TN-01-20-21-00202</span>
                  <span>PHARMACY IP WARD RETURN</span>
                </div>
                <div style={{ borderBottom: "1px solid #cbd5e0", paddingBottom: 3, marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "#111" }}>
                  <span>CIN : L85110TZ2020PLC033974</span>
                  <span>GST NO : 33ABDCS8326A1ZP</span>
                </div>

                {/* Patient & Bill Metadata */}
                <div style={{ display: "flex", gap: 20, marginBottom: 8, borderBottom: "1px solid #cbd5e0", paddingBottom: 6 }}>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "105px 1fr", rowGap: 2.5, fontSize: 11 }}>
                    <span style={{ color: "#555" }}>Patient</span>
                    <span style={{ fontWeight: 700 }}>: {selectedPrintBill.patient_name || "—"}</span>
                    <span style={{ color: "#555" }}>UHID No</span>
                    <span>: {selectedPrintBill.uhid || "—"}</span>
                    <span style={{ color: "#555" }}>IN Patient NO</span>
                    <span>: {selectedPrintBill.inpatient_number || selectedPrintBill.ip_number || "—"}</span>
                    <span style={{ color: "#555" }}>Ward / Room</span>
                    <span>: {selectedPrintBill.room_no || selectedPrintBill.ward_name || "—"}</span>
                    <span style={{ color: "#555" }}>Doctor</span>
                    <span>: {selectedPrintBill.doctor_name || "—"}</span>
                  </div>

                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "115px 1fr", rowGap: 2.5, fontSize: 11 }}>
                    <span style={{ color: "#555" }}>Return Bill No</span>
                    <span style={{ fontWeight: 700, color: colors.primary }}>: {formatBillNo(selectedPrintBill.ward_return_bill_no)}</span>
                    <span style={{ color: "#555" }}>Return Date</span>
                    <span>: {formatDateTime(selectedPrintBill.ward_return_bill_date)}</span>
                    <span style={{ color: "#555" }}>Original Bill No</span>
                    <span style={{ fontWeight: 700 }}>: {formatBillNo(selectedPrintBill.bill_no)}</span>
                    <span style={{ color: "#555" }}>Original Bill Date</span>
                    <span>: {formatDate(selectedPrintBill.bill_date)}</span>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
                  <thead>
                    <tr style={{ background: "#edf2f7", borderTop: "1px solid #cbd5e0", borderBottom: "1px solid #cbd5e0" }}>
                      <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 10 }}>S.No</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 10 }}>Particulars</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 10 }}>Batch</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10 }}>Expiry</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10 }}>Return Qty</th>
                      <th style={{ padding: "4px 6px", textAlign: "right", fontSize: 10 }}>Rate (₹)</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10 }}>CGST %</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10 }}>SGST %</th>
                      <th style={{ padding: "4px 6px", textAlign: "right", fontSize: 10 }}>Return Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPrintBill.medicine_particulars || []).map((med, idx) => {
                      const retQty = parseFloat(med.return_qty || med.qty || 0);
                      const rate = parseFloat(med.price || med.mrp || 0);
                      const amt = parseFloat(med.return_amount || (retQty * rate) || 0);
                      const cgst = parseFloat(med.CGST_Percentage || 2.5);
                      const sgst = parseFloat(med.SGST_Percentage || 2.5);

                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5 }}>{idx + 1}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, fontWeight: 600 }}>{med.item_name || `Item #${med.item_id}`}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5 }}>{med.batch_number || "—"}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "center" }}>{med.expiry_date || "—"}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "center", fontWeight: 700 }}>{retQty}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "right" }}>{rate.toFixed(2)}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "center" }}>{cgst}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "center" }}>{sgst}</td>
                          <td style={{ padding: "3.5px 6px", fontSize: 10.5, textAlign: "right", fontWeight: 700 }}>{amt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Amount Comparison Box */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6 }}>
                  <div style={{ fontSize: 10.5, color: "#475569", maxWidth: 350 }}>
                    <div style={{ fontWeight: 700, marginBottom: 1 }}>Ward Return Credit Note</div>
                    <div>Stock has been automatically restored/adjusted in IP Pharmacy blocked stock.</div>
                    <div style={{ marginTop: 4, fontStyle: "italic", fontSize: 9.5 }}>E &amp; OE. Verified and approved by Pharmacy Department.</div>
                  </div>

                  <div style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1", borderRadius: 6, padding: "6px 14px", minWidth: 300 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                      <span style={{ color: "#334155", fontWeight: 600 }}>Actual / Original Bill Amount:</span>
                      <span style={{ fontWeight: 700 }}>₹{Number(selectedPrintBill.original_bill_amount || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11, color: colors.danger }}>
                      <span style={{ fontWeight: 600 }}>Less: Ward Return Amount:</span>
                      <span style={{ fontWeight: 700 }}>- ₹{Number(selectedPrintBill.return_amount || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ borderTop: "1.5px solid #94A3B8", paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.success }}>
                      <span style={{ fontWeight: 800 }}>Net Adjusted Bill Amount:</span>
                      <span style={{ fontWeight: 800 }}>
                        ₹{Number(selectedPrintBill.balance_amount ?? (selectedPrintBill.original_bill_amount - selectedPrintBill.return_amount) ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#334155", paddingTop: 6, borderTop: "1px dashed #cbd5e0" }}>
                  <div>
                    <div>Prepared By: <strong>{selectedPrintBill.pharmacist_name || selectedPrintBill.created_by || "Pharmacist"}</strong></div>
                    <div style={{ fontSize: 9.5, color: "#64748b" }}>Date: {new Date().toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div>Ward Incharge / Sister Sign</div>
                    <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 12 }}>____________________</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>Authorised Pharmacist Sign</div>
                    <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 12 }}>____________________</div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <button
                onClick={() => setSelectedPrintBill(null)}
                style={{ padding: "8px 16px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
              <button
                onClick={executePrint}
                style={{ padding: "8px 20px", background: colors.primary, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Printer size={16} />
                Print Bill
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* ── VIEW ITEMS DETAIL MODAL ── */}
      {selectedViewItem && (
        <ModalBackdrop onClick={() => setSelectedViewItem(null)}>
          <ModalContent $maxWidth="980px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Returned Items Details ({formatBillNo(selectedViewItem.ward_return_bill_no) || "Return"})</h3>
              <button onClick={() => setSelectedViewItem(null)}>✕</button>
            </ModalHeader>

            <ModalBody>
              <div style={{
                marginBottom: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                background: "#f0fdfa",
                border: "1px solid #ccfbf1",
                padding: "10px 14px",
                borderRadius: 8
              }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 700, textTransform: "uppercase" }}>Patient</div>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{selectedViewItem.patient_name || "—"}</strong>
                  <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{selectedViewItem.uhid} {selectedViewItem.inpatient_number ? `| ${selectedViewItem.inpatient_number}` : ""}</div>
                </div>
                {(selectedViewItem.ward_name || selectedViewItem.room_no) && (
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 700, textTransform: "uppercase" }}>Ward / Room</div>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{selectedViewItem.ward_name || selectedViewItem.room_no}</strong>
                  </div>
                )}
                {selectedViewItem.doctor_name && (
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 700, textTransform: "uppercase" }}>Doctor</div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{selectedViewItem.doctor_name}</strong>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 700, textTransform: "uppercase" }}>Original Bill</div>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{formatBillNo(selectedViewItem.bill_no)}</strong>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 700, textTransform: "uppercase" }}>Return Amount</div>
                  <strong style={{ fontSize: "0.95rem", color: "#e11d48" }}>₹{Number(selectedViewItem.return_amount || 0).toFixed(2)}</strong>
                </div>
              </div>

              <StyledTable>
                <thead>
                  <tr>
                    <th style={{ width: 45 }}>S.No</th>
                    <th>Medicine / Item Name</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th style={{ textAlign: "center" }}>Return Qty</th>
                    <th style={{ textAlign: "right" }}>Rate</th>
                    <th style={{ textAlign: "right" }}>Return Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedViewItem.medicine_particulars || []).map((med, idx) => {
                    const retQty = med.return_qty || med.qty || 1;
                    const price = Number(med.price || med.mrp || 0);
                    const retAmt = Number(med.return_amount || (retQty * price) || 0);
                    const batchNum = med.batch_number || med.batch || "—";
                    const exp = med.expiry_date || med.expiry || "—";

                    return (
                      <tr key={idx}>
                        <td style={{ color: "#64748b", fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <strong style={{ color: "#0f172a" }}>{med.item_name || `Item #${med.item_id}`}</strong>
                          {med.reason && (
                            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                              Reason: {med.reason}
                            </div>
                          )}
                        </td>
                        <td>
                          {batchNum !== "—" ? (
                            <span style={{
                              background: "#f1f5f9",
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "1px solid #e2e8f0",
                              fontFamily: "'JetBrains Mono', monospace",
                              color: "#1e293b",
                              fontWeight: 700,
                              fontSize: "0.75rem"
                            }}>
                              {batchNum}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          {exp !== "—" ? (
                            <span style={{
                              background: "#f8fafc",
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "1px solid #e2e8f0",
                              fontFamily: "'JetBrains Mono', monospace",
                              color: "#475569",
                              fontSize: "0.75rem"
                            }}>
                              {exp}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: "#0f172a" }}>{retQty}</td>
                        <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>₹{price.toFixed(2)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                          ₹{retAmt.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </StyledTable>

              <div style={{ marginTop: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.88rem" }}>
                  <span>Original Bill Amount:</span>
                  <strong>₹{Number(selectedViewItem.original_bill_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.88rem", color: colors.danger }}>
                  <span>Return Amount:</span>
                  <strong>- ₹{Number(selectedViewItem.return_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ borderTop: "1px solid #CBD5E1", paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: colors.success }}>
                  <strong>Net Remaining Amount:</strong>
                  <strong>₹{Number(selectedViewItem.balance_amount ?? (selectedViewItem.original_bill_amount - selectedViewItem.return_amount) ?? 0).toFixed(2)}</strong>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <button
                onClick={() => setSelectedViewItem(null)}
                style={{ padding: "8px 18px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
              {selectedViewItem.is_pending && (
                <>
                  <ActionBtn
                    className="reject"
                    disabled={actionLoading === selectedViewItem.return_request_id}
                    onClick={() => {
                      const req = selectedViewItem;
                      setSelectedViewItem(null);
                      setConfirmModal({
                        billId: req.Bill_id,
                        returnRequestId: req.return_request_id,
                        action: "Reject",
                        patientName: req.patient_name || req.uhid,
                        itemCount: (req.medicine_particulars || []).length,
                        returnAmount: req.return_amount
                      });
                    }}
                  >
                    <XCircle size={14} />
                    Reject
                  </ActionBtn>
                  <ActionBtn
                    className="approve"
                    disabled={actionLoading === selectedViewItem.return_request_id}
                    onClick={() => {
                      const req = selectedViewItem;
                      setSelectedViewItem(null);
                      setConfirmModal({
                        billId: req.Bill_id,
                        returnRequestId: req.return_request_id,
                        action: "Approve",
                        patientName: req.patient_name || req.uhid,
                        itemCount: (req.medicine_particulars || []).length,
                        returnAmount: req.return_amount
                      });
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Approve Return
                  </ActionBtn>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
      {/* ── ACTION CONFIRMATION MODAL ── */}
      {confirmModal && (
        <ModalBackdrop onClick={() => setConfirmModal(null)}>
          <ModalContent $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Confirm {confirmModal.action === "Approve" ? "Return Approval" : "Rejection"}</h3>
              <button onClick={() => setConfirmModal(null)}>✕</button>
            </ModalHeader>
            <ModalBody>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                {confirmModal.action === "Approve" ? (
                  <CheckCircle2 size={44} color={colors.success} style={{ margin: "0 auto 12px" }} />
                ) : (
                  <XCircle size={44} color={colors.danger} style={{ margin: "0 auto 12px" }} />
                )}
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
                  {confirmModal.action === "Approve" ? "Approve Ward Medicine Return?" : "Reject Return Request?"}
                </div>
                <div style={{ fontSize: "0.88rem", color: colors.textSecondary, lineHeight: 1.5 }}>
                  {confirmModal.action === "Approve" ? (
                    <>
                      You are approving return of <strong>{confirmModal.itemCount} item(s)</strong> worth <strong>₹{Number(confirmModal.returnAmount || 0).toFixed(2)}</strong> for patient <strong>{confirmModal.patientName}</strong>.
                      <div style={{ marginTop: 10, fontSize: "0.82rem", color: colors.primary, background: colors.primaryLight, padding: "8px 12px", borderRadius: 6 }}>
                        Stock will be restored in blocked quantity, and a formal return bill will be generated.
                      </div>
                    </>
                  ) : (
                    <>Are you sure you want to reject this ward return request?</>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ padding: "8px 16px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading === confirmModal.returnRequestId}
                onClick={() => handleAction(confirmModal.billId, confirmModal.returnRequestId, confirmModal.action)}
                style={{
                  padding: "8px 20px",
                  background: confirmModal.action === "Approve" ? colors.success : colors.danger,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {confirmModal.action === "Approve" ? "Yes, Approve Return" : "Yes, Reject"}
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: toast.type === "success" ? "#166534" : "#991b1b",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 8,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 999999,
          fontSize: "0.9rem",
          fontWeight: 600
        }}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </PageContainer>
  );
}
