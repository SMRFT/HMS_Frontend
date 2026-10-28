import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Modal, Badge as AntBadge, Spin } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  Users,
  Search,
  Download,
  Printer,
  RefreshCw,
  Clock,
  Bed,
  UserCheck,
  RotateCcw,
  AlertCircle,
  Building,
  Info,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  X,
  Stethoscope
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import { colors, fadeIn, PageWrapper, TableWrapper, Table, Th, Td, Tr } from "../GlobalStyles";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── STYLED COMPONENTS ─────────────────────────────────────────────────────────

const Container = styled(PageWrapper)`
  animation: ${fadeIn} 0.35s ease-out;
  padding: 20px 24px 60px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #0f172a;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;

  .title-group {
    h1 {
      font-size: 1.6rem;
      font-weight: 850;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;

      .badge-tag {
        background: #ccfbf1;
        color: #0f766e;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        border: 1px solid #99f6e4;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 4px 0 0 0;
      font-weight: 500;
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    color: #ffffff;
    border: none;
    &:hover {
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }
  `
      : props.$variant === "success"
      ? `
    background: #10b981;
    color: #ffffff;
    border: none;
    &:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
  `
      : `
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    &:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }
  `}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

// ─── KPI METRIC CARDS (Matches Screenshot Header) ───────────────────────────

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
`;

const KpiCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px -4px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }

  .top-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${(props) => props.$labelColor || "#64748b"};
    margin-bottom: 8px;

    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${(props) => props.$bg || "#f0fdfa"};
      color: ${(props) => props.$iconColor || "#0d9488"};
    }
  }

  .main-val {
    font-size: 1.7rem;
    font-weight: 850;
    color: #0f172a;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .sub-note {
    font-size: 0.72rem;
    font-weight: 600;
    color: #64748b;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;

    span.hl {
      color: ${(props) => props.$iconColor || "#0d9488"};
      font-weight: 700;
    }
  }
`;

// ─── FILTER SECTION ──────────────────────────────────────────────────────────

const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  .filter-row {
    display: flex;
    align-items: flex-end;
    gap: 14px;
    flex-wrap: wrap;
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: ${(props) => props.$flex || "none"};
  min-width: ${(props) => props.$minWidth || "140px"};

  label {
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #475569;
  }

  input,
  select {
    height: 38px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 0 12px;
    font-size: 0.82rem;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
    }
  }

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    svg {
      position: absolute;
      left: 12px;
      color: #94a3b8;
    }

    input {
      padding-left: 36px;
      width: 100%;
    }
  }
`;

const DatePresetGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const DatePresetBtn = styled.button`
  border: none;
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#0d9488" : "#64748b")};
  font-weight: ${(props) => (props.$active ? "800" : "600")};
  font-size: 0.73rem;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: ${(props) => (props.$active ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none")};
  transition: all 0.15s ease;

  &:hover {
    color: #0d9488;
  }
`;

// ─── DATA TABLE & SCROLLER ───────────────────────────────────────────────────

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TableHeaderBar = styled.div`
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .left-count {
    font-size: 0.88rem;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;

    span.count-pill {
      background: #f0fdfa;
      color: #0d9488;
      border: 1px solid #99f6e4;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.74rem;
    }
  }

  .meta-right {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }
`;

const Scroller = styled.div`
  max-height: 64vh;
  overflow: auto;
  position: relative;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const ModernTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.78rem;
  color: #1e293b;

  thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #0f766e;
    color: #ffffff;
    font-weight: 700;
    padding: 10px 12px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 2px solid #0d5c56;
    letter-spacing: 0.02em;
    user-select: none;
  }

  thead th.date-header {
    background: #115e59;
    text-align: right;
    min-width: 110px;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }

  thead th.sticky-col,
  tbody td.sticky-col,
  tfoot td.sticky-col {
    position: sticky;
    background: inherit;
    z-index: 12;
  }

  tbody tr {
    transition: background-color 0.15s ease;
    background: #ffffff;

    &:nth-child(even) {
      background: #f8fafc;
    }

    &:hover {
      background: #f0fdfa !important;
    }
  }

  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    white-space: nowrap;
    vertical-align: middle;
  }

  tbody td.num-cell {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  tbody td.date-cell {
    text-align: right;
    font-variant-numeric: tabular-nums;
    border-left: 1px solid #f1f5f9;
  }

  tfoot {
    position: sticky;
    bottom: 0;
    z-index: 15;
    background: #f1f5f9;
    font-weight: 800;

    td {
      padding: 12px;
      border-top: 2px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      background: #f1f5f9;
      color: #0f172a;
      white-space: nowrap;
    }

    td.num-cell {
      text-align: right;
    }
  }

  thead th.action-sticky-col {
    position: sticky;
    right: 0;
    top: 0;
    z-index: 25;
    background: #005953;
    color: #ffffff;
    text-align: center;
    width: 65px;
    min-width: 65px;
    max-width: 65px;
    box-shadow: -4px 0 8px rgba(0, 0, 0, 0.08);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }

  tbody td.action-sticky-col {
    position: sticky;
    right: 0;
    z-index: 15;
    background: #ffffff;
    text-align: center;
    width: 65px;
    min-width: 65px;
    max-width: 65px;
    box-shadow: -4px 0 8px rgba(0, 0, 0, 0.06);
    border-left: 1px solid #e2e8f0;
    padding: 6px 8px;
  }

  tbody tr:nth-child(even) td.action-sticky-col {
    background: #f8fafc;
  }

  tbody tr:hover td.action-sticky-col {
    background: #f0fdfa !important;
  }

  tfoot td.action-sticky-col {
    position: sticky;
    right: 0;
    bottom: 0;
    z-index: 20;
    background: #f1f5f9;
    box-shadow: -4px 0 8px rgba(0, 0, 0, 0.06);
    border-left: 1px solid #cbd5e1;
    width: 65px;
    min-width: 65px;
    max-width: 65px;
  }

  .action-link-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #00796b;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #e0f2f1;
      color: #004d40;
      transform: scale(1.12);
    }
  }
`;

const IpBadge = styled.span`
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #99f6e4;
  font-size: 0.74rem;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const RoomBadge = styled.span`
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  font-size: 0.72rem;
`;

const StatusPill = styled.span`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${(props) => (props.$status === "Admitted" ? "#ecfdf5" : "#f1f5f9")};
  color: ${(props) => (props.$status === "Admitted" ? "#059669" : "#64748b")};
  border: 1px solid ${(props) => (props.$status === "Admitted" ? "#a7f3d0" : "#cbd5e1")};
`;

const CurrencyText = styled.span`
  font-family: inherit;
  font-weight: ${(props) => (props.$bold ? "800" : "600")};
  color: ${(props) =>
    props.$highlight === "danger"
      ? "#e11d48"
      : props.$highlight === "warning"
      ? "#d97706"
      : props.$highlight === "success"
      ? "#059669"
      : "inherit"};
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;

  svg {
    margin-bottom: 12px;
    opacity: 0.6;
  }

  h3 {
    color: #334155;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 0.82rem;
    margin: 0;
  }
`;

// ─── COMPONENT IMPLEMENTATION ────────────────────────────────────────────────

const IPPatientAnalysis = () => {
  // Date range defaults: Last 30 days up to today
  const defaultToDate = dayjs();
  const defaultFromDate = defaultToDate.subtract(30, "day");

  const [fromDate, setFromDate] = useState(defaultFromDate.format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(defaultToDate.format("YYYY-MM-DD"));
  const [datePreset, setDatePreset] = useState("30d");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFloor, setSelectedFloor] = useState("all");

  // State
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [dailyColumns, setDailyColumns] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [doctorList, setDoctorList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹ ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Quick date presets
  const applyPreset = (presetKey) => {
    setDatePreset(presetKey);
    const now = dayjs();
    let start = now;

    if (presetKey === "today") {
      start = now;
    } else if (presetKey === "7d") {
      start = now.subtract(7, "day");
    } else if (presetKey === "30d") {
      start = now.subtract(30, "day");
    } else if (presetKey === "month") {
      start = now.startOf("month");
    }

    setFromDate(start.format("YYYY-MM-DD"));
    setToDate(now.format("YYYY-MM-DD"));
  };

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
      });

      if (selectedDoctor && selectedDoctor !== "all") {
        params.set("admitting_doctor", selectedDoctor);
      }
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (selectedFloor && selectedFloor !== "all") {
        params.set("floor", selectedFloor);
      }
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const url = `${HmsBaseUrl}ip-patient-analysis/?${params.toString()}`;
      const response = await apiRequest(url, "GET");

      if (response && response.success) {
        // apiRequest wraps backend response body in response.data
        const resBody = response.data || {};
        const records = Array.isArray(resBody.data)
          ? resBody.data
          : Array.isArray(resBody)
          ? resBody
          : [];

        const columns = Array.isArray(resBody.daily_columns)
          ? resBody.daily_columns
          : Array.isArray(response.daily_columns)
          ? response.daily_columns
          : [];

        const summaryMetrics = resBody.metrics || response.metrics || {};

        setReportData(records);
        setDailyColumns(columns);
        setMetrics(summaryMetrics);

        // Populate doctors list if not yet populated
        if (records.length > 0) {
          const docs = Array.from(
            new Set(
              records
                .map((r) => r.admitting_doctor)
                .filter((d) => d && d !== "N/A")
            )
          ).sort();
          setDoctorList(docs);
        }
      } else {
        setReportData([]);
        setDailyColumns([]);
        setMetrics({});
        toast.error(response?.error || "Failed to fetch IP Patient Analysis report");
      }
    } catch (err) {
      console.error("Error fetching IP Patient Analysis:", err);
      toast.error("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedDoctor, statusFilter, selectedFloor, searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Client-side live search filter
  const filteredData = useMemo(() => {
    const list = Array.isArray(reportData) ? reportData : [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((r) => {
      return (
        String(r.ip_number || "").toLowerCase().includes(q) ||
        String(r.uhid || "").toLowerCase().includes(q) ||
        String(r.patient_name || "").toLowerCase().includes(q) ||
        String(r.room_number || "").toLowerCase().includes(q) ||
        String(r.admitting_doctor || "").toLowerCase().includes(q) ||
        String(r.address || "").toLowerCase().includes(q)
      );
    });
  }, [reportData, searchTerm]);

  // Dynamic totals for the bottom summary row
  const tableTotals = useMemo(() => {
    const totals = {
      advance_amount: 0,
      return_amount: 0,
      total_outstanding: 0,
      bill_amount: 0,
      daily_totals: {},
    };

    const cols = Array.isArray(dailyColumns) ? dailyColumns : [];
    cols.forEach((c) => {
      totals.daily_totals[c.key] = 0;
    });

    const rows = Array.isArray(filteredData) ? filteredData : [];
    rows.forEach((r) => {
      totals.advance_amount += Number(r.advance_amount || 0);
      totals.return_amount += Number(r.return_amount || 0);
      totals.total_outstanding += Number(r.total_outstanding || 0);
      totals.bill_amount += Number(r.bill_amount || 0);

      cols.forEach((c) => {
        totals.daily_totals[c.key] += Number(r[c.key] || 0);
      });
    });

    return totals;
  }, [filteredData, dailyColumns]);

  // Excel Export
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      const exportRows = filteredData.map((r, idx) => {
        const row = {
          "S.No": idx + 1,
          "IP Number": r.ip_number,
          "UHID": r.uhid,
          "Patient Name": r.patient_name,
          "Age": r.age,
          "Gender": r.gender,
          "Address": r.address,
          "Room Number": r.room_number,
          "Admitting Date": r.admitting_date,
          "Admitting Dr": r.admitting_doctor,
          "Advance Amount": Number(r.advance_amount || 0),
          "Return Amount": Number(r.return_amount || 0),
          "Total Days": r.total_days,
          "Total Outstanding": Number(r.total_outstanding || 0),
          "Bill Amount": Number(r.bill_amount || 0),
          "From Date": r.from_date,
          "To Date": r.to_date,
        };

        // Exact Month_D_YYYY daily date columns as user specified!
        dailyColumns.forEach((col) => {
          row[col.key] = Number(r[col.key] || 0);
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);

      // Auto-width columns
      const colWidths = Object.keys(exportRows[0] || {}).map((k) => ({
        wch: Math.max(k.length + 3, 14),
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "IP_Patient_Analysis");

      const fileName = `IP_Patient_Analysis_${fromDate}_to_${toDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Excel report exported successfully!");
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to generate Excel file");
    }
  };

  // Printable view
  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      {/* Header Section */}
      <PageHeader>
        <div className="title-group">
          <h1>
            IP Patient Analysis <span className="badge-tag">Dedicated View</span>
          </h1>
          <p>
            Comprehensive In-Patient census, admitting details, daily charge breakdown & financial outstanding tracking
          </p>
        </div>

        <div className="action-buttons">
          <ActionButton onClick={() => fetchReport()} title="Refresh Data">
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </ActionButton>

          <ActionButton $variant="success" onClick={handleExportExcel} disabled={filteredData.length === 0}>
            <Download size={14} /> Export Excel
          </ActionButton>

          <ActionButton onClick={handlePrint}>
            <Printer size={14} /> Print
          </ActionButton>
        </div>
      </PageHeader>

      {/* Hero KPI Cards (Matching User Screenshot) */}
      <KpiGrid>
        <KpiCard $iconColor="#0d9488" $bg="#f0fdfa">
          <div className="top-label">
            <span>Admitted Patients</span>
            <div className="icon-box">
              <Bed size={17} />
            </div>
          </div>
          <div className="main-val">{metrics.admitted_patients ?? "0"}</div>
          <div className="sub-note">
            Currently active beds <span className="hl">({metrics.occupied_beds || 0} Occupied)</span>
          </div>
        </KpiCard>

        <KpiCard $iconColor="#0284c7" $bg="#f0f9ff">
          <div className="top-label">
            <span>Avg. Length of Stay</span>
            <div className="icon-box">
              <Clock size={17} />
            </div>
          </div>
          <div className="main-val">{metrics.avg_length_of_stay ?? "0"} <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Days</span></div>
          <div className="sub-note">
            Across inpatient stays in period
          </div>
        </KpiCard>

        <KpiCard $iconColor="#059669" $bg="#ecfdf5">
          <div className="top-label">
            <span>New Admissions</span>
            <div className="icon-box">
              <UserCheck size={17} />
            </div>
          </div>
          <div className="main-val">{metrics.new_admissions ?? "0"}</div>
          <div className="sub-note">
            Admitted between selected dates
          </div>
        </KpiCard>

        <KpiCard $iconColor="#d97706" $bg="#fffbeb">
          <div className="top-label">
            <span>Re-Admission Rate</span>
            <div className="icon-box">
              <RotateCcw size={17} />
            </div>
          </div>
          <div className="main-val">{metrics.readmission_rate ?? "0.00"}%</div>
          <div className="sub-note">
            {metrics.readmission_count || 0} Re-admissions / {metrics.total_records || 0} Total
          </div>
        </KpiCard>

        <KpiCard $iconColor="#7c3aed" $bg="#faf5ff">
          <div className="top-label">
            <span>Bed Occupancy Rate</span>
            <div className="icon-box">
              <Building size={17} />
            </div>
          </div>
          <div className="main-val">{metrics.bed_occupancy_rate ?? "0"}%</div>
          <div className="sub-note">
            {metrics.occupied_beds || 0} Occupied / {metrics.total_beds || 569} Total
          </div>
        </KpiCard>

        <KpiCard $iconColor="#e11d48" $bg="#fff1f2">
          <div className="top-label">
            <span>Total Outstanding</span>
            <div className="icon-box">
              <AlertCircle size={17} />
            </div>
          </div>
          <div className="main-val" style={{ color: "#e11d48" }}>
            {formatCurrency(metrics.total_outstanding || 0)}
          </div>
          <div className="sub-note">
            Bill: {formatCurrency(metrics.total_bill || 0)} · Adv: {formatCurrency(metrics.total_advance || 0)}
          </div>
        </KpiCard>
      </KpiGrid>

      {/* Filter Card */}
      <FilterCard>
        <DatePresetGroup>
          <DatePresetBtn $active={datePreset === "today"} onClick={() => applyPreset("today")}>
            Today
          </DatePresetBtn>
          <DatePresetBtn $active={datePreset === "7d"} onClick={() => applyPreset("7d")}>
            Last 7 Days
          </DatePresetBtn>
          <DatePresetBtn $active={datePreset === "30d"} onClick={() => applyPreset("30d")}>
            Last 30 Days
          </DatePresetBtn>
          <DatePresetBtn $active={datePreset === "month"} onClick={() => applyPreset("month")}>
            This Month
          </DatePresetBtn>
        </DatePresetGroup>

        <div className="filter-row">
          <FilterField $minWidth="140px">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDatePreset("custom");
              }}
            />
          </FilterField>

          <FilterField $minWidth="140px">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setDatePreset("custom");
              }}
            />
          </FilterField>

          <FilterField $flex="1" $minWidth="240px">
            <label>Search Patient / IP / Room / Dr</label>
            <div className="search-wrapper">
              <Search size={15} />
              <input
                type="text"
                placeholder="Type IP Number, UHID, Patient Name, Room or Doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </FilterField>

          <FilterField $minWidth="170px">
            <label>Admitting Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {doctorList.map((doc, idx) => (
                <option key={idx} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField $minWidth="140px">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="admitted">Admitted Only</option>
              <option value="discharged">Discharged Only</option>
            </select>
          </FilterField>

          <FilterField $minWidth="130px">
            <label>Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="all">All Floors</option>
              <option value="1st">1st Floor</option>
              <option value="2nd">2nd Floor</option>
              <option value="3rd">3rd Floor</option>
              <option value="4th">4th Floor</option>
            </select>
          </FilterField>

          <ActionButton
            $variant="primary"
            style={{ height: "38px", padding: "0 20px" }}
            onClick={() => fetchReport()}
          >
            <Search size={14} /> Search
          </ActionButton>

          {(searchTerm || selectedDoctor !== "all" || statusFilter !== "all" || selectedFloor !== "all") && (
            <ActionButton
              style={{ height: "38px" }}
              onClick={() => {
                setSearchTerm("");
                setSelectedDoctor("all");
                setStatusFilter("all");
                setSelectedFloor("all");
              }}
            >
              <X size={14} /> Clear
            </ActionButton>
          )}
        </div>
      </FilterCard>

      {/* Main Table Container */}
      <TableContainer>
        <TableHeaderBar>
          <div className="left-count">
            IP Patients Found <span className="count-pill">{filteredData.length} Records</span>
          </div>

          <div className="meta-right">
            Showing columns from <strong>{fromDate}</strong> to <strong>{toDate}</strong> ({dailyColumns.length} daily date columns)
          </div>
        </TableHeaderBar>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "14px", color: "#64748b", fontWeight: 600 }}>
              Analyzing in-patient records and daily breakdowns...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyBox>
            <Users size={44} />
            <h3>No In-Patient Records Found</h3>
            <p>Try broadening your date range or adjusting your search filters.</p>
          </EmptyBox>
        ) : (
          <Scroller>
            <ModernTable>
              <thead>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>#</th>
                  <th>IP Number</th>
                  <th>UHID</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Address</th>
                  <th>Room Number</th>
                  <th>Admitting Date</th>
                  <th>Admitting Dr</th>
                  <th style={{ textAlign: "right" }}>Advance Amount</th>
                  <th style={{ textAlign: "right" }}>Return Amount</th>
                  <th style={{ textAlign: "center" }}>Total Days</th>
                  <th style={{ textAlign: "right" }}>Total Outstanding</th>
                  <th style={{ textAlign: "right" }}>Bill Amount</th>
                  <th>From Date</th>
                  <th>To Date</th>

                  {/* Dynamic Date Columns Requested by User (Month_D_YYYY) */}
                  {dailyColumns.map((col) => (
                    <th key={col.key} className="date-header" title={col.display}>
                      {col.day_label}
                    </th>
                  ))}
                  <th className="action-sticky-col">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>
                      {idx + 1}
                    </td>

                    <td>
                      <IpBadge
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedRow(row);
                          setDetailModalOpen(true);
                        }}
                        title="Click to view IP details"
                      >
                        {row.ip_number || "—"}
                      </IpBadge>
                    </td>

                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {row.uhid || "—"}
                    </td>

                    <td>
                      <strong style={{ color: "#0f172a" }}>{row.patient_name || "—"}</strong>
                      {row.gender && (
                        <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: "4px" }}>
                          ({row.gender.charAt(0)})
                        </span>
                      )}
                    </td>

                    <td style={{ color: "#475569" }}>{row.age || "—"}</td>

                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }} title={row.address}>
                      {row.address || "—"}
                    </td>

                    <td>
                      <RoomBadge>{row.room_number || "N/A"}</RoomBadge>
                    </td>

                    <td>{row.admitting_date || "—"}</td>

                    <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }} title={row.admitting_doctor}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Stethoscope size={12} color="#0d9488" />
                        {row.admitting_doctor || "—"}
                      </span>
                    </td>

                    {/* Advance Amount */}
                    <td className="num-cell">
                      <CurrencyText $bold={row.advance_amount > 0}>
                        {formatCurrency(row.advance_amount)}
                      </CurrencyText>
                    </td>

                    {/* Return Amount */}
                    <td className="num-cell">
                      <CurrencyText $bold={row.return_amount > 0}>
                        {formatCurrency(row.return_amount)}
                      </CurrencyText>
                    </td>

                    {/* Total Days */}
                    <td style={{ textAlign: "center" }}>
                      <AntBadge
                        count={row.total_days}
                        overflowCount={999}
                        style={{ backgroundColor: "#0f766e" }}
                      />
                    </td>

                    {/* Total Outstanding */}
                    <td className="num-cell">
                      <CurrencyText
                        $bold
                        $highlight={row.total_outstanding > 0 ? "danger" : "success"}
                      >
                        {formatCurrency(row.total_outstanding)}
                      </CurrencyText>
                    </td>

                    {/* Bill Amount */}
                    <td className="num-cell">
                      <CurrencyText $bold>
                        {formatCurrency(row.bill_amount)}
                      </CurrencyText>
                    </td>

                    <td>{row.from_date || "—"}</td>
                    <td>{row.to_date || "—"}</td>

                    {/* Dynamic Daily Date Columns */}
                    {dailyColumns.map((col) => {
                      const val = Number(row[col.key] || 0);
                      return (
                        <td key={col.key} className="date-cell">
                          {val > 0 ? (
                            <CurrencyText $bold $highlight="success">
                              {formatCurrency(val)}
                            </CurrencyText>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>0.00</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="action-sticky-col">
                      <button
                        className="action-link-btn"
                        title="View In-Patient Details"
                        onClick={() => {
                          setSelectedRow(row);
                          setDetailModalOpen(true);
                        }}
                      >
                        <ExternalLink size={16} strokeWidth={2.2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Table Summary Footer */}
              <tfoot>
                <tr>
                  <td colSpan={9} style={{ textAlign: "right", fontWeight: 800 }}>
                    TOTAL SUMMARY ({filteredData.length} Patients):
                  </td>

                  <td className="num-cell">
                    {formatCurrency(tableTotals.advance_amount)}
                  </td>

                  <td className="num-cell">
                    {formatCurrency(tableTotals.return_amount)}
                  </td>

                  <td style={{ textAlign: "center" }}>—</td>

                  <td className="num-cell" style={{ color: "#e11d48", fontWeight: 850 }}>
                    {formatCurrency(tableTotals.total_outstanding)}
                  </td>

                  <td className="num-cell" style={{ fontWeight: 850 }}>
                    {formatCurrency(tableTotals.bill_amount)}
                  </td>

                  <td colSpan={2} style={{ textAlign: "center" }}>—</td>

                  {/* Dynamic Column Totals */}
                  {dailyColumns.map((col) => (
                    <td key={col.key} className="num-cell" style={{ fontWeight: 700 }}>
                      {formatCurrency(tableTotals.daily_totals[col.key] || 0)}
                    </td>
                  ))}

                  <td className="action-sticky-col"></td>
                </tr>
              </tfoot>
            </ModernTable>
          </Scroller>
        )}
      </TableContainer>

      {/* Patient Detail Modal */}
      {detailModalOpen && selectedRow && (
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bed size={18} color="#0d9488" />
              <span>In-Patient Stay Details — {selectedRow.patient_name}</span>
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={640}
        >
          <div style={{ padding: "10px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>IP NUMBER</span>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0d9488" }}>
                  {selectedRow.ip_number}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>UHID</span>
                <div style={{ fontSize: "1rem", fontWeight: 700 }}>{selectedRow.uhid}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>ROOM / BED</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  {selectedRow.room_number} ({selectedRow.room_category})
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>BLOCK & FLOOR</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  {selectedRow.block} · {selectedRow.floor}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>ADMITTING DOCTOR</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{selectedRow.admitting_doctor}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>STATUS / DAYS</span>
                <div>
                  <StatusPill $status={selectedRow.status}>{selectedRow.status}</StatusPill> · {selectedRow.total_days} Days
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>PATIENT ADDRESS</span>
                <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "2px" }}>
                  {selectedRow.address || "N/A"}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.88rem", fontWeight: 800 }}>Financial Overview</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>BILL AMOUNT</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>{formatCurrency(selectedRow.bill_amount)}</div>
                </div>

                <div style={{ background: "#f0fdfa", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#0d9488", fontWeight: 700 }}>ADVANCE</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0d9488" }}>
                    {formatCurrency(selectedRow.advance_amount)}
                  </div>
                </div>

                <div style={{ background: "#fef3c7", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#d97706", fontWeight: 700 }}>RETURN</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#d97706" }}>
                    {formatCurrency(selectedRow.return_amount)}
                  </div>
                </div>

                <div style={{ background: "#fff1f2", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#e11d48", fontWeight: 700 }}>OUTSTANDING</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 850, color: "#e11d48" }}>
                    {formatCurrency(selectedRow.total_outstanding)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default IPPatientAnalysis;
