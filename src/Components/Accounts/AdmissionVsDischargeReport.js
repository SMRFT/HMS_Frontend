import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DatePicker, Spin, Tooltip, message } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import {
    Calendar,
    Search,
    Printer,
    Download,
    RefreshCw,
    Users,
    BedDouble,
    Clock,
    DollarSign,
    Building2,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    TrendingUp,
    LogOut,
    UserCheck,
    RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";
import { colors, PageWrapper, fadeIn } from "../GlobalStyles";

const { RangePicker } = DatePicker;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: ${props => props.$isModal ? "8px" : "24px"};
  background: ${props => props.$isModal ? "transparent" : "#f8fafc"};

  @media print {
    padding: 0;
    background: #ffffff;
  }
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
    }

    .title-box {
      h1 {
        font-size: 1.45rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      p {
        font-size: 0.85rem;
        color: #64748b;
        margin: 3px 0 0 0;
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @media print {
    display: none;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: ${props => props.$primary ? "none" : "1px solid #cbd5e1"};
  background: ${props => props.$primary ? (colors.primary || "#0891b2") : "#ffffff"};
  color: ${props => props.$primary ? "#ffffff" : "#334155"};

  &:hover {
    background: ${props => props.$primary ? "#0e7490" : "#f1f5f9"};
    border-color: ${props => props.$primary ? "none" : "#94a3b8"};
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;

  @media print {
    display: none;
  }
`;

const KPICard = styled.div`
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .value {
    font-size: 1.35rem;
    font-weight: 800;
    color: ${props => props.$color || "#0f172a"};
    margin-top: 3px;
  }

  .icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || "#f1f5f9"};
    color: ${props => props.$color || "#475569"};
  }
`;

const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 18px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .left-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .status-pills {
    display: flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    gap: 3px;

    button {
      border: none;
      background: transparent;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }
    }
  }

  select {
    height: 38px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.84rem;
    font-weight: 500;
    color: #334155;
    background: #ffffff;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: #0891b2;
    }
  }

  .search-box {
    position: relative;
    width: 250px;

    svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    input {
      width: 100%;
      height: 38px;
      padding: 0 12px 0 34px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.84rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #0891b2;
        box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1);
      }
    }
  }

  @media print {
    display: none;
  }
`;

const PrintDocument = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  overflow: hidden;

  @media print {
    border: none;
    box-shadow: none;
    border-radius: 0;
  }
`;

const HospitalPrintHeader = styled.div`
  display: none;
  text-align: center;
  padding: 16px;
  border-bottom: 2px solid #0f172a;

  h2 {
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0;
    color: #0f172a;
    letter-spacing: 0.02em;
  }
  .sub {
    font-size: 0.82rem;
    color: #475569;
    margin: 3px 0;
  }
  .report-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
    margin-top: 6px;
  }

  @media print {
    display: block;
  }
`;

const TableResponsiveWrapper = styled.div`
  overflow-x: auto;
  width: 100%;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.80rem;
  color: #0f172a;

  thead th {
    background: #f1f5f9;
    color: #1e293b;
    font-weight: 700;
    padding: 10px 12px;
    border-top: 1px solid #cbd5e1;
    border-bottom: 2px solid #94a3b8;
    text-align: left;
    white-space: nowrap;
    user-select: none;

    &.text-right {
      text-align: right;
    }

    &.sortable {
      cursor: pointer;
      transition: background 0.15s;
      &:hover {
        background: #e2e8f0;
      }
    }
  }

  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
    background: #ffffff;
    transition: background 0.12s;

    &.text-right {
      text-align: right;
    }
    &.bold {
      font-weight: 700;
    }
  }

  tbody tr:hover td {
    background: #f8fafc;
  }

  .grand-total-row td {
    font-weight: 800;
    font-size: 0.88rem;
    padding: 12px;
    background: #f1f5f9;
    border-top: 2px solid #0f172a;
    border-bottom: 2px solid #0f172a;

    &.text-right {
      text-align: right;
    }
  }

  .badge-ip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 700;
    font-family: monospace;
    font-size: 0.82rem;
  }

  .badge-status-admitted {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #ecfdf5;
    color: #059669;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .badge-status-discharged {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #475569;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .badge-days {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 7px;
    border-radius: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-weight: 700;
    color: #0f172a;
  }

  @media print {
    font-size: 8pt;
    thead th {
      background: #f1f5f9 !important;
      -webkit-print-color-adjust: exact;
      padding: 5px 6px;
    }
    tbody td {
      padding: 4px 6px;
    }
  }
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  font-size: 0.82rem;
  color: #64748b;

  .controls {
    display: flex;
    gap: 6px;

    button {
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 0.80rem;
      font-weight: 600;
      cursor: pointer;

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
    }
  }

  @media print {
    display: none;
  }
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const AdmissionVsDischargeReport = ({
    isModalView = false,
    startDate,
    endDate
}) => {
    const navigate = useNavigate();
    const today = dayjs();
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf('month'),
        endDate ? dayjs(endDate) : today
    ]);
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'admitted' | 'discharged'
    const [companyFilter, setCompanyFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const [reportData, setReportData] = useState({
        data: [],
        summary: {},
        companies: [],
        date_range: {}
    });

    const printRef = useRef(null);

    // Fetch Report Data from Backend
    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const getBaseUrl = (process.env.REACT_APP_BACKEND_HMS_BASE_URL || "").replace(/\/$/, "");
            const startStr = dateRange && dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : "";
            const endStr = dateRange && dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : "";

            const url = `${getBaseUrl}/admission-vs-discharge-report/?start_date=${startStr}&end_date=${endStr}&status=${statusFilter}&company=${encodeURIComponent(companyFilter)}&search=${encodeURIComponent(searchQuery)}&sort_order=${sortOrder}`;
            const res = await apiRequest(url, "GET");

            if (res && res.success) {
                const payload = res.data || {};
                const list = Array.isArray(payload.data)
                    ? payload.data
                    : Array.isArray(payload)
                    ? payload
                    : Array.isArray(res.data)
                    ? res.data
                    : [];

                setReportData({
                    data: list,
                    summary: payload.summary || res.summary || {},
                    companies: Array.isArray(payload.companies)
                        ? payload.companies
                        : Array.isArray(res.companies)
                        ? res.companies
                        : [],
                    date_range: payload.date_range || res.date_range || {}
                });
            } else {
                setReportData({ data: [], summary: {}, companies: [], date_range: {} });
                message.error(res?.error || "Failed to load Admission vs Discharge Report");
            }
        } catch (err) {
            console.error("Error fetching admission vs discharge report:", err);
            message.error("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    }, [dateRange, statusFilter, companyFilter, searchQuery, sortOrder]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Client-side quick filter
    const filteredRecords = useMemo(() => {
        const raw = reportData?.data;
        const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : [];
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase().trim();
        return list.filter(r =>
            (r.ip_number || "").toLowerCase().includes(q) ||
            (r.uhid || "").toLowerCase().includes(q) ||
            (r.patient_name || "").toLowerCase().includes(q) ||
            (r.room || "").toLowerCase().includes(q) ||
            (r.company_name || "").toLowerCase().includes(q)
        );
    }, [reportData.data, searchQuery]);

    // Paginated list
    const paginatedRecords = useMemo(() => {
        if (!Array.isArray(filteredRecords)) return [];
        const start = (currentPage - 1) * pageSize;
        return filteredRecords.slice(start, start + pageSize);
    }, [filteredRecords, currentPage, pageSize]);

    const recordCount = Array.isArray(filteredRecords) ? filteredRecords.length : 0;
    const totalPages = Math.ceil(recordCount / pageSize) || 1;

    // Toggle IP Sorting Order
    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (!Array.isArray(filteredRecords) || filteredRecords.length === 0) {
            message.warning("No records to export");
            return;
        }
        try {
            const rows = filteredRecords.map((r, idx) => ({
                "Sl-No": idx + 1,
                "IPNUMBER": r.ip_number,
                "ROOM": r.room,
                "PATIENTNAME": r.patient_name,
                "ADMITTINGDATE": r.admitting_date,
                "DISCHARGEDATE": r.discharge_date,
                "No of days": r.no_of_days,
                "ADVANCE": r.advance,
                "COMPANY NAME": r.company_name
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Admission_vs_Discharge");
            const filename = `Admission_vs_Discharge_Report_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
            XLSX.writeFile(wb, filename);
            message.success("Excel report exported successfully");
        } catch (e) {
            console.error("Export error:", e);
            message.error("Failed to export Excel report");
        }
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    return (
        <Container $isModal={isModalView}>
            {/* Top Header Bar */}
            <HeaderBar>
                <div className="left">
                    {!isModalView && (
                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => navigate(-1)}
                            title="Go Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className="title-box">
                        <h1>
                            <BedDouble size={26} color="#0891b2" />
                            Admission vs Discharge Report
                        </h1>
                        <p>
                            Comprehensive tracking of inpatient admissions, bed occupancy, length of stay, advance collections, and discharge clearances.
                        </p>
                    </div>
                </div>

                <div className="actions">
                    <ActionBtn onClick={fetchReport} title="Refresh report">
                        <RefreshCw size={15} /> Refresh
                    </ActionBtn>
                    <ActionBtn onClick={handleExportExcel} title="Export to Excel">
                        <Download size={15} /> Export Excel
                    </ActionBtn>
                    <ActionBtn $primary onClick={handlePrint} title="Print Report">
                        <Printer size={15} /> Print
                    </ActionBtn>
                </div>
            </HeaderBar>

            {/* KPI Summary Cards */}
            <KPIGrid>
                <KPICard $color="#0284c7" $bg="#e0f2fe">
                    <div>
                        <div className="label">Total Inpatients</div>
                        <div className="value">{reportData.summary?.total_inpatients || 0}</div>
                    </div>
                    <div className="icon-wrap"><Users size={22} /></div>
                </KPICard>

                <KPICard $color="#059669" $bg="#ecfdf5">
                    <div>
                        <div className="label">Currently Admitted</div>
                        <div className="value">{reportData.summary?.active_admissions || 0}</div>
                    </div>
                    <div className="icon-wrap"><CheckCircle2 size={22} /></div>
                </KPICard>

                <KPICard $color="#ea580c" $bg="#fff7ed">
                    <div>
                        <div className="label">Discharged</div>
                        <div className="value">{reportData.summary?.discharged_count || 0}</div>
                    </div>
                    <div className="icon-wrap"><LogOut size={22} /></div>
                </KPICard>

                <KPICard $color="#16a34a" $bg="#f0fdf4">
                    <div>
                        <div className="label">Total Advance</div>
                        <div className="value">
                            ₹{Number(reportData.summary?.total_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="icon-wrap"><DollarSign size={22} /></div>
                </KPICard>

                <KPICard $color="#6366f1" $bg="#eef2ff">
                    <div>
                        <div className="label">Avg Length of Stay</div>
                        <div className="value">{reportData.summary?.avg_length_of_stay || 0} Days</div>
                    </div>
                    <div className="icon-wrap"><Clock size={22} /></div>
                </KPICard>
            </KPIGrid>

            {/* Filters Bar */}
            <FilterCard>
                <div className="left-filters">
                    {/* From Date to To Date RangePicker */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={17} color="#0891b2" />
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                setDateRange(dates);
                                setCurrentPage(1);
                            }}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ height: "38px", borderRadius: "8px" }}
                        />
                    </div>

                    {/* Status Pill Toggle */}
                    <div className="status-pills">
                        <button
                            type="button"
                            className={statusFilter === "all" ? "active" : ""}
                            onClick={() => {
                                setStatusFilter("all");
                                setCurrentPage(1);
                            }}
                        >
                            All ({reportData.summary?.total_inpatients || 0})
                        </button>
                        <button
                            type="button"
                            className={statusFilter === "admitted" ? "active" : ""}
                            onClick={() => {
                                setStatusFilter("admitted");
                                setCurrentPage(1);
                            }}
                        >
                            Admitted ({reportData.summary?.active_admissions || 0})
                        </button>
                        <button
                            type="button"
                            className={statusFilter === "discharged" ? "active" : ""}
                            onClick={() => {
                                setStatusFilter("discharged");
                                setCurrentPage(1);
                            }}
                        >
                            Discharged ({reportData.summary?.discharged_count || 0})
                        </button>
                    </div>

                    {/* Company Dropdown Filter */}
                    <select
                        value={companyFilter}
                        onChange={(e) => {
                            setCompanyFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All Companies / Schemes</option>
                        {(reportData.companies || []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Sort Order Toggle */}
                    <ActionBtn onClick={toggleSortOrder} title="Toggle IP Number Sort Order">
                        <ArrowUpDown size={14} /> Sort IP: {sortOrder.toUpperCase()}
                    </ActionBtn>

                    {/* Reset Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setStatusFilter("all");
                            setCompanyFilter("all");
                            setSearchQuery("");
                            setSortOrder("asc");
                            setCurrentPage(1);
                        }}
                        title="Reset Filters"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "0 10px",
                            height: "38px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#64748b",
                            fontSize: "0.80rem",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        <RotateCcw size={13} /> Reset
                    </button>
                </div>

                {/* Search Box */}
                <div className="search-box">
                    <Search size={15} />
                    <input
                        type="text"
                        placeholder="Search IP, patient, room, company..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </FilterCard>

            {/* Document / Table Container */}
            <PrintDocument ref={printRef}>
                <HospitalPrintHeader>
                    <h2>SHANMUGA HOSPITAL LIMITED</h2>
                    <div className="sub">51/24. Saradha College Road, Salem - 636007</div>
                    <div className="report-title">
                        Admission vs Discharge Report ({dateRange[0]?.format("DD/MM/YYYY")} - {dateRange[1]?.format("DD/MM/YYYY")})
                    </div>
                </HospitalPrintHeader>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                        <p style={{ marginTop: "12px", color: "#64748b", fontWeight: 600 }}>
                            Loading Admission vs Discharge Records...
                        </p>
                    </div>
                ) : (
                    <TableResponsiveWrapper>
                        <ReportTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>Sl-No</th>
                                    <th
                                        className="sortable"
                                        style={{ width: "130px" }}
                                        onClick={toggleSortOrder}
                                        title="Click to sort by IP Number"
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span>IPNUMBER</span>
                                            <ArrowUpDown size={13} color="#0891b2" />
                                        </div>
                                    </th>
                                    <th style={{ width: "120px" }}>ROOM</th>
                                    <th>PATIENTNAME</th>
                                    <th style={{ width: "160px" }}>ADMITTINGDATE</th>
                                    <th style={{ width: "160px" }}>DISCHARGEDATE</th>
                                    <th style={{ width: "100px" }}>No of days</th>
                                    <th className="text-right" style={{ width: "120px" }}>ADVANCE</th>
                                    <th style={{ width: "170px" }}>COMPANY NAME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordCount === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
                                            No admission or discharge records found matching the filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((row, idx) => {
                                        const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <tr key={`${row.ip_number}-${idx}`}>
                                                <td style={{ color: "#64748b", fontWeight: 600 }}>{globalIdx}</td>
                                                <td>
                                                    <span className="badge-ip">{row.ip_number}</span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{row.room}</td>
                                                <td className="bold">{row.patient_name}</td>
                                                <td>{row.admitting_date}</td>
                                                <td>
                                                    {row.is_discharged ? (
                                                        <span className="badge-status-discharged">
                                                            {row.discharge_date}
                                                        </span>
                                                    ) : (
                                                        <span className="badge-status-admitted">
                                                            ● Still Admitted
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="badge-days">
                                                        {row.no_of_days} {row.no_of_days === 1 ? "day" : "days"}
                                                    </span>
                                                </td>
                                                <td className="text-right bold" style={{ color: Number(row.advance) > 0 ? "#16a34a" : "#64748b" }}>
                                                    ₹{Number(row.advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        background: row.company_name === "Cash / Self" ? "#f1f5f9" : "#eff6ff",
                                                        color: row.company_name === "Cash / Self" ? "#475569" : "#1d4ed8"
                                                    }}>
                                                        {row.company_name}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                {/* Grand Totals Row */}
                                {recordCount > 0 && (
                                    <tr className="grand-total-row">
                                        <td colSpan="3">Total Records: {recordCount}</td>
                                        <td colSpan="3" style={{ color: "#64748b", fontSize: "0.82rem" }}>
                                            Admitted: <strong>{filteredRecords.filter(r => !r.is_discharged).length}</strong> | Discharged: <strong>{filteredRecords.filter(r => r.is_discharged).length}</strong>
                                        </td>
                                        <td style={{ color: "#6366f1" }}>
                                            Avg: {(filteredRecords.reduce((acc, r) => acc + (r.no_of_days || 0), 0) / (recordCount || 1)).toFixed(1)} d
                                        </td>
                                        <td className="text-right" style={{ color: "#16a34a" }}>
                                            ₹{filteredRecords.reduce((acc, r) => acc + (Number(r.advance) || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td></td>
                                    </tr>
                                )}
                            </tbody>
                        </ReportTable>
                    </TableResponsiveWrapper>
                )}

                {/* Pagination Controls */}
                {recordCount > pageSize && (
                    <PaginationBar>
                        <div>
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, recordCount)} of {recordCount} records
                        </div>
                        <div className="controls">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>
                            <span style={{ padding: "4px 8px", fontWeight: 700 }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </PaginationBar>
                )}
            </PrintDocument>
        </Container>
    );
};

export default AdmissionVsDischargeReport;

