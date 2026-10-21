import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaFileInvoiceDollar,
  FaUndoAlt,
  FaUserInjured,
  FaBed,
  FaMoneyBillWave,
  FaPills,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaSyncAlt,
  FaDownload,
  FaPrint,
  FaEye,
  FaStore,
  FaHospitalUser,
  FaReceipt,
  FaArrowRight,
  FaInfoCircle,
} from "react-icons/fa";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────
const Container = styled.div`
  padding: 20px 24px;
  background: #f4f7fb;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;
  animation: ${fadeIn} 0.25s ease-out;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 2px 0 0;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;


// ─── Filter Bar ─────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
`;

const DateInput = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;

  svg {
    color: #64748b;
  }

  input[type="date"] {
    border: none;
    background: transparent;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    font-family: inherit;
    cursor: pointer;
  }
`;

const QuickDateButtons = styled.div`
  display: flex;
  gap: 6px;

  button {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    &.active {
      background: #2563eb;
      color: #fff;
      border-color: #2563eb;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;

  input {
    width: 100%;
    padding: 7px 12px 7px 34px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: #fff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
  }

  svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 13px;
  }
`;

const SelectBox = styled.select`
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  font-weight: 500;

  &:focus {
    background: #fff;
    border-color: #2563eb;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &.primary {
    background: #2563eb;
    color: #fff;
    &:hover { background: #1d4ed8; }
  }

  &.secondary {
    background: #fff;
    border-color: #cbd5e1;
    color: #334155;
    &:hover { background: #f1f5f9; }
  }

  &.refresh {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }

  svg {
    font-size: 13px;
  }
`;

// ─── Summary KPI Cards ───────────────────────────────────────────────────────
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ color }) => color || "#2563eb"};
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .stat-val {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }

  .stat-sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`;

// ─── Main Table Container ───────────────────────────────────────────────────
const TableWrapper = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  background: #fcfdfe;
  flex-wrap: wrap;
  gap: 10px;

  .left-info {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .view-toggles {
    display: inline-flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    gap: 4px;

    button {
      border: none;
      background: transparent;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;

      &.active {
        background: #fff;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }
    }
  }
`;

const TableScroll = styled.div`
  overflow-x: auto;
  max-width: 100%;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;

  thead {
    background: #f1f5f9;
    border-bottom: 2px solid #e2e8f0;

    th {
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
      user-select: none;

      &.sortable {
        cursor: pointer;
        &:hover {
          background: #e2e8f0;
        }
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;

      &:hover {
        background: #f8fafc;
      }

      &.highlighted {
        background: #eff6ff;
      }
    }

    td {
      padding: 12px 14px;
      color: #1e293b;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
`;

// ─── Status Badges (matching Screenshot 1 & 2) ──────────────────────────────
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case "Ip Credit Bills":
        return `
          background: #fff3e0;
          color: #d97706;
          border: 1px solid #fde68a;
        `;
      case "Cash Bill":
        return `
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        `;
      case "Cancelled":
        return `
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        `;
    }
  }}
`;

const IndicatorPill = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ val }) => (val === "Yes" ? "#e0f2fe" : "#f1f5f9")};
  color: ${({ val }) => (val === "Yes" ? "#0284c7" : "#94a3b8")};
  border: 1px solid ${({ val }) => (val === "Yes" ? "#bae6fd" : "#e2e8f0")};
`;

const ActionIconButton = styled.button`
  border: none;
  background: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;

  &:hover {
    background: #2563eb;
    color: #fff;
    transform: scale(1.05);
  }
`;

// ─── Pagination ─────────────────────────────────────────────────────────────
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fcfdfe;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;

  .entry-info {
    font-size: 13px;
    color: #64748b;
  }

  .page-controls {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      min-width: 32px;
      height: 32px;
      padding: 0 6px;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #334155;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      &.active {
        background: #0f766e;
        color: #fff;
        border-color: #0f766e;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
`;

// ─── Modal / Drawer for Bill Travel Details ──────────────────────────────────
const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DrawerContent = styled.div`
  background: #fff;
  width: 100%;
  max-width: 820px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.25s ease-out;
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  padding: 20px 24px;
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .title-group {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
  }

  button.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const DetailCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
  overflow: hidden;

  .card-header {
    background: #f8fafc;
    padding: 12px 18px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;

    svg {
      color: #2563eb;
    }
  }

  .card-body {
    padding: 16px 18px;
  }
`;

const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px 16px;

  .field-item {
    .label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }
  }
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead {
    background: #f1f5f9;
    th {
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      color: #475569;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      &:hover {
        background: #f8fafc;
      }
    }
    td {
      padding: 8px 12px;
      color: #1e293b;
    }
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #64748b;

  svg {
    font-size: 36px;
    color: #cbd5e1;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: ${spin} 0.8s ease-in-out infinite;
`;

const SpinIcon = styled(FaSyncAlt)`
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${spin} 1s linear infinite;
    `}
`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function PharmacyBillAnalysis() {
  // Default to today in IST
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filter states
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("standard"); // "standard" or "audit"

  // Authenticated outlet (automatically retrieved from auth/session)
  const [serverOutlet, setServerOutlet] = useState("");
  const outletCode = serverOutlet || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

  // Data states
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    total_bills: 0,
    total_gross: 0,
    total_discount: 0,
    total_advance: 0,
    total_ip_return: 0,
    total_sales_return: 0,
    total_net: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected Bill Travel Modal
  const [selectedBill, setSelectedBill] = useState(null);

  // Fetch Bills from backend
  const fetchBillAnalysis = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    const payload = {
      from_date: fromDate,
      to_date: toDate,
      search: searchTerm.trim(),
      status: statusFilter,
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}PharmacyBillanalysis/`, "POST", payload);

      if (res.success && res.data) {
        const body = res.data;
        if (body.success) {
          setBills(body.data || []);
          if (body.summary) {
            setSummary(body.summary);
          }
          if (body.filters?.outlet_code) {
            setServerOutlet(body.filters.outlet_code);
          }
          setCurrentPage(1);
        } else {
          setErrorMsg(body.error || "Failed to load bills.");
        }
      } else {
        setErrorMsg(res.error || "Server error while fetching pharmacy bill analysis.");
      }
    } catch (err) {
      console.error("fetchBillAnalysis error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchBillAnalysis();
  }, [fetchBillAnalysis]);

  // Handle Preset Quick Date Buttons
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().slice(0, 10);

    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      setFromDate(formatDate(y));
      setToDate(formatDate(y));
    } else if (preset === "last7") {
      const l7 = new Date();
      l7.setDate(today.getDate() - 7);
      setFromDate(formatDate(l7));
      setToDate(todayStr);
    } else if (preset === "thismonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDate(startOfMonth));
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("all");
      setToDate("all");
    }
  };

  // Filtered bills in memory (for immediate sub-filtering)
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (b.bill_number && b.bill_number.toLowerCase().includes(term)) ||
        (b.uhid && b.uhid.toLowerCase().includes(term)) ||
        (b.patient_name && b.patient_name.toLowerCase().includes(term)) ||
        (b.inpatient_number && b.inpatient_number.toLowerCase().includes(term))
      );
    });
  }, [bills, searchTerm]);

  // Paginated Bills
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredBills.length) return;
    const headers = [
      "Status",
      "Date & Time",
      "Bill Type",
      "Bill Number",
      "UHID No",
      "Patient Name",
      "Inpatient No",
      "Gross Amount",
      "Discount",
      "Advance",
      "IP Return",
      "Sales Return",
      "Net Amount",
      "Bill Cancelled",
      "Cash Bill",
      "Sales Return Entered",
      "IP Cleared",
    ];

    const rows = filteredBills.map((b) => [
      `"${b.status || ""}"`,
      `"${b.date_time || ""}"`,
      `"${b.bill_type || ""}"`,
      `"${b.bill_number || ""}"`,
      `"${b.uhid || ""}"`,
      `"${(b.patient_name || "").replace(/"/g, '""')}"`,
      `"${b.inpatient_number || ""}"`,
      b.gross_amount || 0,
      b.discount || 0,
      b.advance || 0,
      b.ip_return || 0,
      b.sales_return_amount || 0,
      b.net_amount || 0,
      `"${b.bill_cancelled || "No"}"`,
      `"${b.is_cash_bill || "No"}"`,
      `"${b.sales_return_entered || "No"}"`,
      `"${b.ip_cleared || "No"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pharmacy_Bill_Analysis_${outletCode}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      {/* ── Header ── */}
      <HeaderSection>
        <TitleArea>
          <div className="icon-wrapper">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h1>Pharmacy Bill Analysis</h1>
            <p>Comprehensive billing audit, returns tracking, inpatient travel, and advance reconciliation</p>
          </div>
        </TitleArea>

        <HeaderControls>
          <ActionBtn className="secondary" onClick={handleExportCSV} title="Export current list to CSV">
            <FaDownload /> Export CSV
          </ActionBtn>

          <ActionBtn className="refresh" onClick={fetchBillAnalysis} disabled={loading} title="Reload data">
            <SpinIcon $spinning={loading} /> Refresh
          </ActionBtn>
        </HeaderControls>
      </HeaderSection>

      {/* ── Filters Bar ── */}
      <FilterCard>
        <FilterGroup>
          <label>From:</label>
          <DateInput>
            <FaCalendarAlt />
            <input
              type={fromDate === "all" ? "text" : "date"}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActivePreset("custom");
              }}
            />
          </DateInput>
        </FilterGroup>

        <FilterGroup>
          <label>To:</label>
          <DateInput>
            <FaCalendarAlt />
            <input
              type={toDate === "all" ? "text" : "date"}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActivePreset("custom");
              }}
            />
          </DateInput>
        </FilterGroup>

        <QuickDateButtons>
          <button className={activePreset === "today" ? "active" : ""} onClick={() => applyPreset("today")}>
            Today
          </button>
          <button className={activePreset === "yesterday" ? "active" : ""} onClick={() => applyPreset("yesterday")}>
            Yesterday
          </button>
          <button className={activePreset === "last7" ? "active" : ""} onClick={() => applyPreset("last7")}>
            Last 7 Days
          </button>
          <button className={activePreset === "thismonth" ? "active" : ""} onClick={() => applyPreset("thismonth")}>
            This Month
          </button>
          <button className={activePreset === "all" ? "active" : ""} onClick={() => applyPreset("all")}>
            All Dates
          </button>
        </QuickDateButtons>

        <SelectBox value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="ip credit bills">IP Credit Bills</option>
          <option value="cash bill">Cash Bills</option>
          <option value="sales return">Has Sales Return</option>
          <option value="ip return">Has IP Return</option>
          <option value="cancelled">Cancelled</option>
        </SelectBox>

        <SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Search Bill No, UHID, Patient Name, IP No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ActionBtn className="primary" onClick={fetchBillAnalysis} disabled={loading}>
          {loading ? <LoadingSpinner /> : <FaFilter />} Apply Filter
        </ActionBtn>
      </FilterCard>

      {/* ── KPI Metric Summary Cards ── */}
      <StatsGrid>
        <StatCard color="#2563eb">
          <div className="stat-label">Total Bills</div>
          <div className="stat-val">{summary.total_bills || 0}</div>
          <div className="stat-sub">Billed in selected period</div>
        </StatCard>

        <StatCard color="#0284c7">
          <div className="stat-label">Gross Amount</div>
          <div className="stat-val">₹ {(summary.total_gross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Before discounts</div>
        </StatCard>

        <StatCard color="#dc2626">
          <div className="stat-label">Discount Given</div>
          <div className="stat-val">₹ {(summary.total_discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Overall savings</div>
        </StatCard>

        <StatCard color="#059669">
          <div className="stat-label">IP Advance Total</div>
          <div className="stat-val">₹ {(summary.total_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Hospital admission deposits</div>
        </StatCard>

        <StatCard color="#d97706">
          <div className="stat-label">IP / Ward Return</div>
          <div className="stat-val">₹ {(summary.total_ip_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Ward returns tracked</div>
        </StatCard>

        <StatCard color="#7c3aed">
          <div className="stat-label">Sales Return</div>
          <div className="stat-val">₹ {(summary.total_sales_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Returned medicines</div>
        </StatCard>

        <StatCard color="#0f766e">
          <div className="stat-label">Net Amount</div>
          <div className="stat-val">₹ {(summary.total_net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Net revenue realized</div>
        </StatCard>
      </StatsGrid>

      {/* ── Table Area ── */}
      <TableWrapper>
        <TableToolbar>
          <div className="left-info">
            Showing <strong>{filteredBills.length}</strong> bills
          </div>

          <div className="view-toggles">
            <button
              className={viewMode === "standard" ? "active" : ""}
              onClick={() => setViewMode("standard")}
              title="Screenshot 1: Financial view (Gross, Discount, Advance, IP Return, Net)"
            >
              Financial View
            </button>
            <button
              className={viewMode === "audit" ? "active" : ""}
              onClick={() => setViewMode("audit")}
              title="Screenshot 2: Audit Indicators (Bill Cancelled, Cash Bill, Sales Return, IP Cleared)"
            >
              Audit View
            </button>
            <button
              className={viewMode === "all" ? "active" : ""}
              onClick={() => setViewMode("all")}
              title="Show all columns"
            >
              Full Columns View
            </button>
          </div>
        </TableToolbar>

        {errorMsg && (
          <div style={{ padding: "16px 20px", background: "#fef2f2", color: "#b91c1c", fontSize: "13px", fontWeight: "600" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <EmptyState>
            <LoadingSpinner style={{ width: 36, height: 36, borderColor: "#2563eb", borderTopColor: "transparent" }} />
            <h3>Fetching bill travel records...</h3>
            <p>Correlating hospital billing, patient demographics, and inpatient admissions.</p>
          </EmptyState>
        ) : filteredBills.length === 0 ? (
          <EmptyState>
            <FaFileInvoiceDollar />
            <h3>No pharmacy bills found</h3>
            <p>Try expanding the date range (e.g. click "All Dates") or selecting a different outlet.</p>
          </EmptyState>
        ) : (
          <TableScroll>
            <StyledTable>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Bill Type</th>
                  <th>Bill Number</th>
                  <th>UHID No</th>
                  <th>Patient Name</th>

                  {(viewMode === "standard" || viewMode === "all") && (
                    <>
                      <th style={{ textAlign: "right" }}>Gross Amount</th>
                      <th style={{ textAlign: "right" }}>Discount</th>
                      <th style={{ textAlign: "right" }}>Advance</th>
                      <th style={{ textAlign: "right" }}>Ip Return</th>
                      <th style={{ textAlign: "right" }}>Net Amount</th>
                    </>
                  )}

                  {(viewMode === "audit" || viewMode === "all") && (
                    <>
                      <th style={{ textAlign: "center" }}>Bill Cancelled</th>
                      <th style={{ textAlign: "center" }}>Cash Bill</th>
                      <th style={{ textAlign: "center" }}>Sales Return Entered</th>
                      <th style={{ textAlign: "center" }}>IP Cleared</th>
                    </>
                  )}

                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((b) => (
                  <tr key={b.id || b.bill_number}>
                    <td>
                      <StatusBadge status={b.status}>{b.status}</StatusBadge>
                    </td>
                    <td>{b.date_time}</td>
                    <td>
                      <strong>{b.bill_type}</strong>
                    </td>
                    <td>
                      <span
                        style={{ color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                        onClick={() => setSelectedBill(b)}
                        title="Click to view complete bill travel journey"
                      >
                        {b.bill_number}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#475569", fontWeight: 600 }}>{b.uhid}</span>
                    </td>
                    <td>
                      <strong>{b.patient_name}</strong>
                    </td>

                    {(viewMode === "standard" || viewMode === "all") && (
                      <>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          ₹ {(b.gross_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b" }}>
                          ₹ {(b.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#059669", fontWeight: 600 }}>
                          ₹ {(b.advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", color: "#d97706" }}>
                          ₹ {(b.ip_return || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ₹ {(b.net_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </>
                    )}

                    {(viewMode === "audit" || viewMode === "all") && (
                      <>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.bill_cancelled}>{b.bill_cancelled}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.is_cash_bill}>{b.is_cash_bill}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.sales_return_entered}>{b.sales_return_entered}</IndicatorPill>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <IndicatorPill val={b.ip_cleared}>{b.ip_cleared}</IndicatorPill>
                        </td>
                      </>
                    )}

                    <td style={{ textAlign: "center" }}>
                      <ActionIconButton onClick={() => setSelectedBill(b)} title="View complete A-to-Z Bill Travel">
                        <FaEye />
                      </ActionIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableScroll>
        )}

        {/* ── Pagination Footer ── */}
        {!loading && filteredBills.length > 0 && (
          <PaginationContainer>
            <div className="entry-info">
              Showing{" "}
              <strong>
                {Math.min(filteredBills.length, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(filteredBills.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong>{filteredBills.length}</strong> entries
            </div>

            <div className="page-controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    className={currentPage === pageNum ? "active" : ""}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span>...</span>
                  <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                </>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </PaginationContainer>
        )}
      </TableWrapper>

      {/* ── Bill Travel Journey Modal / Drawer ── */}
      {selectedBill && (
        <DrawerOverlay onClick={() => setSelectedBill(null)}>
          <DrawerContent onClick={(e) => e.stopPropagation()}>
            <DrawerHeader>
              <div className="title-group">
                <h2>
                  <FaReceipt /> Bill Travel Analysis: {selectedBill.bill_number}
                </h2>
                <p>Complete A-to-Z audit trail, patient comparison, inpatient journey & return transactions</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedBill(null)} title="Close">
                <FaTimes />
              </button>
            </DrawerHeader>

            <DrawerBody>
              {/* 1. Bill Metadata */}
              <DetailCard>
                <div className="card-header">
                  <FaFileInvoiceDollar /> Billing Summary & Operational Details
                </div>
                <div className="card-body">
                  <GridList>
                    <div className="field-item">
                      <div className="label">Bill Number</div>
                      <div className="value">{selectedBill.bill_number}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Date & Time</div>
                      <div className="value">{selectedBill.date_time}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Bill Type</div>
                      <div className="value">{selectedBill.bill_type}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Billing Mode</div>
                      <div className="value">{selectedBill.travel?.bill_info?.billing_mode || "DIRECT"}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Status</div>
                      <div className="value">
                        <StatusBadge status={selectedBill.status}>{selectedBill.status}</StatusBadge>
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Outlet Code</div>
                      <div className="value">{selectedBill.travel?.bill_info?.outlet_code || outletCode}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Shift / Doctor</div>
                      <div className="value">
                        Shift: {selectedBill.travel?.bill_info?.shift_no || "—"} | Dr: {selectedBill.travel?.bill_info?.doctor_id || "—"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Net Amount</div>
                      <div className="value" style={{ color: "#0f766e", fontSize: 16 }}>
                        ₹ {(selectedBill.net_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </GridList>
                </div>
              </DetailCard>

              {/* 2. Patient Profile Comparison */}
              <DetailCard>
                <div className="card-header">
                  <FaHospitalUser /> Patient Profile (Linked via UHID {selectedBill.uhid})
                </div>
                <div className="card-body">
                  <GridList>
                    <div className="field-item">
                      <div className="label">UHID Number</div>
                      <div className="value">{selectedBill.uhid}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Full Name</div>
                      <div className="value">{selectedBill.patient_name}</div>
                    </div>
                    <div className="field-item">
                      <div className="label">Age & Gender</div>
                      <div className="value">
                        {selectedBill.patient_age ? `${selectedBill.patient_age} yrs` : "—"} / {selectedBill.patient_gender || "—"}
                      </div>
                    </div>
                    <div className="field-item">
                      <div className="label">Contact Mobile</div>
                      <div className="value">{selectedBill.patient_phone || "—"}</div>
                    </div>
                    <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="label">Address / Location</div>
                      <div className="value">{selectedBill.patient_address || "—"}</div>
                    </div>
                  </GridList>
                </div>
              </DetailCard>

              {/* 3. Inpatient Admission & Advance Paid */}
              <DetailCard>
                <div className="card-header">
                  <FaBed /> Inpatient Admission & IP Advance Journey
                </div>
                <div className="card-body">
                  {selectedBill.inpatient_number && selectedBill.inpatient_number !== "—" ? (
                    <>
                      <GridList style={{ marginBottom: 16 }}>
                        <div className="field-item">
                          <div className="label">IP Number</div>
                          <div className="value">{selectedBill.inpatient_number}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Total IP Advance Paid</div>
                          <div className="value" style={{ color: "#059669", fontSize: 15 }}>
                            ₹ {(selectedBill.advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="field-item">
                          <div className="label">Room / Bed Allocation</div>
                          <div className="value">{selectedBill.travel?.admission?.room_label || "—"}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Discharge / Clearance Status</div>
                          <div className="value">
                            <IndicatorPill val={selectedBill.ip_cleared}>
                              {selectedBill.ip_cleared === "Yes" ? "Discharged / Cleared" : "Currently Admitted"}
                            </IndicatorPill>
                          </div>
                        </div>
                        <div className="field-item">
                          <div className="label">Admitting Doctor</div>
                          <div className="value">{selectedBill.travel?.admission?.admittingDoctor || "—"}</div>
                        </div>
                        <div className="field-item">
                          <div className="label">Payer Category / Insurance</div>
                          <div className="value">
                            {selectedBill.travel?.admission?.customer_type || "Cash"}{" "}
                            {selectedBill.travel?.admission?.insurance_company ? `(${selectedBill.travel.admission.insurance_company})` : ""}
                          </div>
                        </div>
                      </GridList>

                      {/* Advance receipt items list if present */}
                      {selectedBill.travel?.admission?.advance_records?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
                            IP Advance Receipts Breakdown:
                          </div>
                          <SubTable>
                            <thead>
                              <tr>
                                <th>Receipt / Bill No</th>
                                <th>Payment Mode</th>
                                <th>Date</th>
                                <th style={{ textAlign: "right" }}>Advance Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedBill.travel.admission.advance_records.map((ar, idx) => (
                                <tr key={idx}>
                                  <td>{ar.bill_no || "—"}</td>
                                  <td>{ar.mode}</td>
                                  <td>{ar.date ? String(ar.date).slice(0, 10) : "—"}</td>
                                  <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                                    ₹ {(ar.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </SubTable>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                      This is an Outpatient (OP) direct pharmacy bill. No inpatient admission or IP advance records attached.
                    </div>
                  )}
                </div>
              </DetailCard>

              {/* 4. Medicine Particulars & Edit History */}
              <DetailCard>
                <div className="card-header">
                  <FaPills /> Billed Medicines & Item Edit History
                </div>
                <div className="card-body">
                  {selectedBill.travel?.medicines?.length > 0 ? (
                    <SubTable>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Batch No</th>
                          <th style={{ textAlign: "center" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Unit Price</th>
                          <th style={{ textAlign: "right" }}>Calculated Price</th>
                          <th>Edit History / Return Travel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.travel.medicines.map((m, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{m.item_name}</strong>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {m.item_id}</div>
                            </td>
                            <td>{m.batch_number}</td>
                            <td style={{ textAlign: "center", fontWeight: 600 }}>{m.qty}</td>
                            <td style={{ textAlign: "right" }}>
                              ₹ {(m.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              ₹ {(m.calculated_price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              {m.edit_history && m.edit_history.length > 0 ? (
                                m.edit_history.map((eh, eidx) => (
                                  <div
                                    key={eidx}
                                    style={{
                                      fontSize: 11,
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      padding: "3px 6px",
                                      borderRadius: 4,
                                      marginBottom: 2,
                                    }}
                                  >
                                    <strong>{eh.action}</strong>: Ret Qty {eh.return_qty} | Bill: {eh.return_bill_no} (
                                    {eh.return_date ? String(eh.return_date).slice(0, 10) : ""})
                                  </div>
                                ))
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: 11 }}>No edits</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </SubTable>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 13 }}>No medicines listed for this bill.</div>
                  )}
                </div>
              </DetailCard>

              {/* 5. Returns Breakdown (Sales Return + Ward IP Return) */}
              <DetailCard>
                <div className="card-header">
                  <FaUndoAlt /> Returns Travel (Sales Return & Ward Return)
                </div>
                <div className="card-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Sales Return Section */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Sales Return Records ({selectedBill.travel?.sales_returns?.length || 0}):
                      </div>
                      {selectedBill.travel?.sales_returns?.length > 0 ? (
                        <SubTable>
                          <thead>
                            <tr>
                              <th>Return Bill No</th>
                              <th>Date</th>
                              <th>Payment Type</th>
                              <th>Status</th>
                              <th style={{ textAlign: "right" }}>Return Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.travel.sales_returns.map((sr, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{sr.return_bill_no}</strong>
                                </td>
                                <td>{sr.return_date ? String(sr.return_date).slice(0, 19).replace("T", " ") : "—"}</td>
                                <td>{sr.payment_type}</td>
                                <td>
                                  <IndicatorPill val="Yes">{sr.status}</IndicatorPill>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                                  ₹ {(sr.return_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </SubTable>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                          No sales return recorded in hospital_salesreturn collection for this bill.
                        </div>
                      )}
                    </div>

                    {/* Ward Return Section */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        Ward / IP Return Records ({selectedBill.travel?.ward_returns?.length || 0}):
                      </div>
                      {selectedBill.travel?.ward_returns?.length > 0 ? (
                        <SubTable>
                          <thead>
                            <tr>
                              <th>Ward Return Bill No</th>
                              <th>Date</th>
                              <th>IP Number</th>
                              <th>Status</th>
                              <th style={{ textAlign: "right" }}>Return Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.travel.ward_returns.map((wr, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{wr.ward_return_bill_no}</strong>
                                </td>
                                <td>{wr.ward_return_date ? String(wr.ward_return_date).slice(0, 19).replace("T", " ") : "—"}</td>
                                <td>{wr.inpatient_number || "—"}</td>
                                <td>
                                  <IndicatorPill val="Yes">{wr.status}</IndicatorPill>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#d97706" }}>
                                  ₹ {(wr.return_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </SubTable>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                          No ward returns recorded in hospital_wardreturndetails collection.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DetailCard>

              {/* 6. Cash Counter Collections */}
              <DetailCard>
                <div className="card-header">
                  <FaMoneyBillWave /> Cash Counter Collections
                </div>
                <div className="card-body">
                  {selectedBill.travel?.cash_collections?.length > 0 ? (
                    <SubTable>
                      <thead>
                        <tr>
                          <th>Bill Number</th>
                          <th>Counter Code</th>
                          <th>Shift</th>
                          <th>Collection Date</th>
                          <th style={{ textAlign: "right" }}>Collected Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.travel.cash_collections.map((cc, idx) => (
                          <tr key={idx}>
                            <td>{cc.bill_number}</td>
                            <td>{cc.counter_code}</td>
                            <td>{cc.shift_no || "—"}</td>
                            <td>{cc.created_date ? String(cc.created_date).slice(0, 19).replace("T", " ") : "—"}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                              ₹ {(cc.collected_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </SubTable>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 12, fontStyle: "italic" }}>
                      Direct pharmacy counter payment or settled in credit billing.
                    </div>
                  )}
                </div>
              </DetailCard>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      )}
    </Container>
  );
}
