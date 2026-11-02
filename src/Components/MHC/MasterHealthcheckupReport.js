import React, { useState, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

const fmt = (v) => {
  if (v == null || v === "" || v === "null" || v === "None") return "—";
  const num = parseFloat(v);
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d || d === "—" || d === "null" || d === "None") return "—";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    const [y, m, day] = d.trim().split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day}-${months[parseInt(m, 10) - 1]}-${y}`;
  }
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

const formatDateTime = (d) => {
  if (!d || d === "—" || d === "null" || d === "None") return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return d;
  }
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%, #ecfdf5 100%);
  padding: 1.5rem 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #065f46 100%);
  border-radius: 20px;
  padding: 1.4rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.25);
  animation: ${fadeIn} 0.35s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderIcon = styled.div`font-size: 2.2rem;`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
`;

const HeaderSub = styled.p`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.78);
  margin: 0.15rem 0 0;
`;

const Badge = styled.span`
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 20px;
  padding: 0.35rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  animation: ${fadeIn} 0.4s ease;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 160px;
`;

const Label = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.52rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    background: #fff;
  }
`;

const SearchInput = styled(DateInput)`
  min-width: 260px;
  flex: 1;
`;

const Btn = styled.button`
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const SearchBtn = styled(Btn)`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13,148,136,0.28);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.38); }
`;

const ExcelBtn = styled(Btn)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16, 185, 129, 0.38); }
`;

const PdfBtn = styled(Btn)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.28);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(239, 68, 68, 0.38); }
`;

const QuickRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
  align-items: center;
`;

const QuickLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 0.25rem;
`;

const QuickBtn = styled(Btn)`
  background: ${p => p.active ? "#0d9488" : "#f1f5f9"};
  color: ${p => p.active ? "#fff" : "#475569"};
  border: 1.5px solid ${p => p.active ? "#0d9488" : "#e2e8f0"};
  padding: 0.42rem 0.9rem;
  font-size: 0.78rem;
  &:hover:not(:disabled) { background: ${p => p.active ? "#0f766e" : "#e2e8f0"}; }
`;

/* ── Stats ── */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.25rem;
`;

const StatCard = styled.div`
  background: ${p => p.bg || "#fff"};
  border: 1.5px solid ${p => p.border || "#e2e8f0"};
  border-radius: 14px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.45s ease;
`;

const StatNum = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${p => p.color || "#0f766e"};
  white-space: nowrap;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/* ── Table ── */
const TableCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease;
`;

const TableScroll = styled.div`
  overflow-x: auto;
  max-width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  padding: 0.75rem 0.85rem;
  text-align: ${p => p.$align || "left"};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background 0.15s;
  &:nth-child(even) { background: #f8fafc; }
  &:hover { background: #f0fdfa; }
`;

const Td = styled.td`
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
  vertical-align: middle;
  text-align: ${p => p.$align || "left"};
`;

const TdBold = styled(Td)`
  font-weight: 700;
  color: #0f766e;
`;

const TfootTd = styled.td`
  padding: 0.8rem 0.85rem;
  background: #f0fdfa;
  border-top: 2px solid #0d9488;
  font-weight: 800;
  font-size: 0.84rem;
  color: #0f766e;
  text-align: ${p => p.$align || "left"};
  white-space: nowrap;
`;

/* ── Badges & Chips ── */
const MhcBadge = styled.span`
  display: inline-block;
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  background: #ccfbf1;
  color: #0f766e;
  border: 1px solid #99f6e4;
`;

const OpBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
`;

const PkgBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SourceBadge = styled.span`
  display: inline-block;
  padding: 0.18rem 0.55rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
`;

const GenderChip = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${p => p.g === "Male" ? "#dbeafe" : p.g === "Female" ? "#fce7f3" : "#f3f4f6"};
  color: ${p => p.g === "Male" ? "#1d4ed8" : p.g === "Female" ? "#be185d" : "#6b7280"};
`;

const NotesCell = styled.div`
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #64748b;
  font-size: 0.78rem;
`;

const ActionBtn = styled.button`
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #16a34a;
    color: #fff;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3.5rem 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  width: 36px; height: 36px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 3rem auto;
`;

const TableFooter = styled.div`
  padding: 0.85rem 1.25rem;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
`;

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.25s ease;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const ModalClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.35); }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const DetailCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.2rem;
`;

const DetailSectionTitle = styled.h3`
  font-size: 0.78rem;
  font-weight: 800;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 0 0.85rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const InfoKey = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const InfoVal = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function MasterHealthcheckupReport() {
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate]     = useState(getToday);
  const [search, setSearch]     = useState("");
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);
  const [quickActive, setQuickActive] = useState("today");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ── Fetch Report ─────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async (fd, td) => {
    setLoading(true);
    setFetched(false);
    try {
      const params = new URLSearchParams({ from_date: fd, to_date: td });
      const res = await apiRequest(`${Hmsbaseurl}mhc_report/?${params}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        toast.error(res.error || "Failed to fetch report");
      }
    } catch {
      toast.error("Network error fetching report");
      setRows([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  // Auto-fetch on mount (today)
  useEffect(() => {
    fetchReport(fromDate, toDate);
  }, []); // eslint-disable-line

  // ── Quick date helpers ───────────────────────────────────────────────────────
  const applyQuick = (type) => {
    setQuickActive(type);
    const now = new Date();
    let fd, td;
    const iso = (d) => d.toISOString().split("T")[0];
    if (type === "today") {
      fd = td = getToday();
    } else if (type === "yesterday") {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      fd = td = iso(y);
    } else if (type === "week") {
      const w = new Date(now); w.setDate(w.getDate() - 6);
      fd = iso(w); td = getToday();
    } else if (type === "month") {
      const m = new Date(now); m.setDate(1);
      fd = iso(m); td = getToday();
    } else if (type === "all") {
      fd = "2026-01-01";
      td = getToday();
    }
    setFromDate(fd);
    setToDate(td);
    fetchReport(fd, td);
  };

  const handleSearch = () => {
    setQuickActive("");
    fetchReport(fromDate, toDate);
  };

  // ── Filtered rows ────────────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(r.mhc_no || "").toLowerCase().includes(q) ||
      (r.patient_name || "").toLowerCase().includes(q) ||
      (r.op_number || "").toLowerCase().includes(q) ||
      (r.package || "").toLowerCase().includes(q) ||
      (r.package_category || "").toLowerCase().includes(q) ||
      (r.source || "").toLowerCase().includes(q) ||
      (r.contact_number || "").includes(q) ||
      (r.registration_date || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      (r.follow_up || "").toLowerCase().includes(q) ||
      String(r.telecaller_id || "").toLowerCase().includes(q) ||
      String(r.created_by || "").toLowerCase().includes(q)
    );
  });

  // ── Totals computation ───────────────────────────────────────────────────────
  const pkgFees       = filtered.reduce((s, r) => s + (parseFloat(r.package_fee) || 0), 0);
  const docFees       = filtered.reduce((s, r) => s + (parseFloat(r.doctor_fee) || 0), 0);
  const addTestsTotal = filtered.reduce((s, r) => s + (parseFloat(r.add_tests) || 0), 0);
  const pharmacyTotal = filtered.reduce((s, r) => s + (parseFloat(r.pharmacy) || 0), 0);
  const ipTotal       = filtered.reduce((s, r) => s + (parseFloat(r.ip) || 0), 0);
  const totalFees     = filtered.reduce((s, r) => s + (parseFloat(r.total_fees) || 0), 0);

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.warning("No records to export.");
      return;
    }

    const headers = [
      "#",
      "MHC No",
      "Reg Date",
      "Created Date & Time",
      "Patient Name",
      "Age",
      "Gender",
      "Contact",
      "OP Number",
      "Package",
      "Category",
      "Source",
      "Pkg Fee (Rs.)",
      "Doctor Fee (Rs.)",
      "Add Tests (Rs.)",
      "Pharmacy (Rs.)",
      "IP (Rs.)",
      "Total Fees (Rs.)",
      "Follow Up",
      "Description / Notes",
      "Telecaller ID",
      "Telecaller Date",
      "Created By",
    ];

    const dataRows = filtered.map((r, i) => [
      i + 1,
      r.mhc_no ?? "—",
      formatDate(r.registration_date || r.created_date),
      formatDateTime(r.created_date),
      r.patient_name || "—",
      r.age ?? "—",
      r.gender || "—",
      r.contact_number || "—",
      r.op_number || "—",
      r.package || "—",
      r.package_category || "—",
      r.source || "—",
      parseFloat(r.package_fee) || 0,
      parseFloat(r.doctor_fee) || 0,
      parseFloat(r.add_tests) || 0,
      parseFloat(r.pharmacy) || 0,
      parseFloat(r.ip) || 0,
      parseFloat(r.total_fees) || 0,
      formatDate(r.follow_up),
      r.description || "—",
      r.telecaller_id || "—",
      formatDateTime(r.telecaller_date),
      r.created_by || "—",
    ]);

    const totalRow = [
      "",
      "",
      "",
      "",
      "Grand Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      pkgFees,
      docFees,
      addTestsTotal,
      pharmacyTotal,
      ipTotal,
      totalFees,
      "",
      "",
      "",
      "",
      "",
    ];

    const wsData = [
      ["Master Health Checkup (MHC) Report"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [
        `Total Patients: ${filtered.length}`,
        "",
        "",
        `Grand Total Collection: Rs. ${totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ],
      [],
      headers,
      ...dataRows,
      [],
      totalRow,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 6 },  // #
      { wch: 10 }, // MHC No
      { wch: 14 }, // Reg Date
      { wch: 20 }, // Created Date & Time
      { wch: 22 }, // Patient Name
      { wch: 8 },  // Age
      { wch: 10 }, // Gender
      { wch: 15 }, // Contact
      { wch: 15 }, // OP Number
      { wch: 22 }, // Package
      { wch: 14 }, // Category
      { wch: 14 }, // Source
      { wch: 15 }, // Pkg Fee
      { wch: 15 }, // Doctor Fee
      { wch: 15 }, // Add Tests
      { wch: 15 }, // Pharmacy
      { wch: 12 }, // IP
      { wch: 16 }, // Total Fees
      { wch: 14 }, // Follow Up
      { wch: 28 }, // Description / Notes
      { wch: 14 }, // Telecaller ID
      { wch: 18 }, // Telecaller Date
      { wch: 12 }, // Created By
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MHC Report");
    XLSX.writeFile(wb, `Master_Health_Checkup_Report_${fromDate}_to_${toDate}.xlsx`);
    toast.success("Excel report exported successfully!");
  };

  // ── PDF Export ───────────────────────────────────────────────────────────────
  const exportToPDF = () => {
    if (filtered.length === 0) {
      toast.warning("No records to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Header Title
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.text("Master Health Checkup (MHC) Report", 14, 14);

    // Subtitle
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date Range: ${fromDate} to ${toDate}   |   Total Records: ${filtered.length}   |   Generated: ${new Date().toLocaleString("en-IN")}`,
      14,
      20
    );

    // KPI Header Box
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, 23, 269, 10, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 118, 110);
    doc.text(`Total Patients: ${filtered.length}`, 18, 29.5);
    doc.text(`Pkg Fees: Rs. ${fmt(pkgFees)}`, 62, 29.5);
    doc.text(`Dr Fees: Rs. ${fmt(docFees)}`, 112, 29.5);
    doc.text(`Add Tests: Rs. ${fmt(addTestsTotal)}`, 155, 29.5);
    doc.text(`Pharmacy: Rs. ${fmt(pharmacyTotal)}`, 195, 29.5);
    doc.text(`Grand Total: Rs. ${fmt(totalFees)}`, 235, 29.5);

    const tableHeaders = [
      [
        "#",
        "MHC No",
        "Reg Date",
        "Patient Name",
        "Age/Gen",
        "Contact",
        "OP No.",
        "Package",
        "Source",
        "Pkg Fee",
        "Dr Fee",
        "Tests",
        "Pharm",
        "IP",
        "Total",
        "Follow Up",
      ],
    ];

    const tableData = filtered.map((r, i) => [
      i + 1,
      r.mhc_no != null ? `#${r.mhc_no}` : "—",
      formatDate(r.registration_date || r.created_date),
      r.patient_name || "—",
      `${r.age ?? "—"} / ${r.gender || "—"}`,
      r.contact_number || "—",
      r.op_number || "—",
      r.package || "—",
      r.source || "—",
      fmt(r.package_fee),
      fmt(r.doctor_fee),
      fmt(r.add_tests),
      fmt(r.pharmacy),
      fmt(r.ip),
      fmt(r.total_fees),
      formatDate(r.follow_up),
    ]);

    const tableFoot = [
      [
        "",
        "",
        "",
        "Grand Total",
        "",
        "",
        "",
        "",
        "",
        fmt(pkgFees),
        fmt(docFees),
        fmt(addTestsTotal),
        fmt(pharmacyTotal),
        fmt(ipTotal),
        `Rs. ${fmt(totalFees)}`,
        "",
      ],
    ];

    autoTable(doc, {
      startY: 36,
      head: tableHeaders,
      body: tableData,
      foot: tableFoot,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [13, 148, 136],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
      },
      footStyles: {
        fillColor: [15, 118, 110],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 7 },  // #
        1: { cellWidth: 14 }, // MHC No
        2: { cellWidth: 18 }, // Reg Date
        3: { cellWidth: 26 }, // Patient Name
        4: { cellWidth: 16 }, // Age/Gen
        5: { cellWidth: 18 }, // Contact
        6: { cellWidth: 18 }, // OP No
        7: { cellWidth: 26 }, // Package
        8: { cellWidth: 16 }, // Source
        9: { cellWidth: 15, halign: "right" }, // Pkg Fee
        10: { cellWidth: 14, halign: "right" }, // Dr Fee
        11: { cellWidth: 14, halign: "right" }, // Tests
        12: { cellWidth: 14, halign: "right" }, // Pharm
        13: { cellWidth: 12, halign: "right" }, // IP
        14: { cellWidth: 18, halign: "right" }, // Total
        15: { cellWidth: 17 }, // Follow Up
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 6
        );
      },
    });

    doc.save(`Master_Health_Checkup_Report_${fromDate}_to_${toDate}.pdf`);
    toast.success("PDF report exported successfully!");
  };

  return (
    <PageWrapper>
      {/* Header Card */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIcon>📋</HeaderIcon>
          <div>
            <HeaderTitle>Master Health Checkup (MHC) Report</HeaderTitle>
            <HeaderSub>Comprehensive date-wise registration, financial & telecaller follow-up report</HeaderSub>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <ExcelBtn onClick={exportToExcel} disabled={loading || filtered.length === 0} id="btn-header-export-excel">
            📊 Export Excel
          </ExcelBtn>
          <PdfBtn onClick={exportToPDF} disabled={loading || filtered.length === 0} id="btn-header-export-pdf">
            📄 Export PDF
          </PdfBtn>
          <Badge>🩺 {filtered.length} Patients</Badge>
        </HeaderRight>
      </HeaderCard>

      {/* Filter Card */}
      <FilterCard>
        <FilterRow>
          <FieldGroup>
            <Label>From Date (Reg / Created)</Label>
            <DateInput
              id="mhc-report-from"
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setQuickActive(""); }}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>To Date (Reg / Created)</Label>
            <DateInput
              id="mhc-report-to"
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setQuickActive(""); }}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            />
          </FieldGroup>

          <FieldGroup style={{ flex: 1 }}>
            <Label>Search Records</Label>
            <SearchInput
              id="mhc-report-search"
              type="text"
              placeholder="Search by MHC No, Name, OP No, Package, Source, Phone, Notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FieldGroup>

          <SearchBtn onClick={handleSearch} disabled={loading}>
            {loading ? "⏳" : "🔍"} Search
          </SearchBtn>
          <ExcelBtn onClick={exportToExcel} disabled={loading || filtered.length === 0} id="btn-filter-export-excel">
            📊 Excel
          </ExcelBtn>
          <PdfBtn onClick={exportToPDF} disabled={loading || filtered.length === 0} id="btn-filter-export-pdf">
            📄 PDF
          </PdfBtn>
        </FilterRow>

        <QuickRow>
          <QuickLabel>Quick Filters:</QuickLabel>
          {[
            { key: "today",     label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "week",      label: "Last 7 Days" },
            { key: "month",     label: "This Month" },
            { key: "all",       label: "All Records (YTD)" },
          ].map(q => (
            <QuickBtn
              key={q.key}
              active={quickActive === q.key}
              onClick={() => applyQuick(q.key)}
              disabled={loading}
            >
              {q.label}
            </QuickBtn>
          ))}
        </QuickRow>
      </FilterCard>

      {/* Summary KPI Stats Row */}
      {fetched && !loading && (
        <StatsRow>
          <StatCard bg="#f0fdfa" border="#a7f3d0">
            <StatNum color="#0f766e">{filtered.length}</StatNum>
            <StatLabel>Total Patients</StatLabel>
          </StatCard>
          <StatCard bg="#fff7ed" border="#fed7aa">
            <StatNum color="#b45309">₹ {fmt(pkgFees)}</StatNum>
            <StatLabel>Package Fees</StatLabel>
          </StatCard>
          <StatCard bg="#faf5ff" border="#e9d5ff">
            <StatNum color="#7c3aed">₹ {fmt(docFees)}</StatNum>
            <StatLabel>Doctor Fees</StatLabel>
          </StatCard>
          <StatCard bg="#eff6ff" border="#bfdbfe">
            <StatNum color="#1d4ed8">₹ {fmt(addTestsTotal)}</StatNum>
            <StatLabel>Add Tests</StatLabel>
          </StatCard>
          <StatCard bg="#fefce8" border="#fde047">
            <StatNum color="#a16207">₹ {fmt(pharmacyTotal)}</StatNum>
            <StatLabel>Pharmacy</StatLabel>
          </StatCard>
          <StatCard bg="#fdf2f8" border="#fbcfe8">
            <StatNum color="#be185d">₹ {fmt(ipTotal)}</StatNum>
            <StatLabel>IP Charges</StatLabel>
          </StatCard>
          <StatCard bg="#ecfdf5" border="#6ee7b7">
            <StatNum color="#065f46">₹ {fmt(totalFees)}</StatNum>
            <StatLabel>Grand Total</StatLabel>
          </StatCard>
        </StatsRow>
      )}

      {/* Report Table */}
      <TableCard>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState>
            {fetched
              ? "📭 No records found for the selected date range. Try switching to 'This Month' or 'All Records'."
              : "Select a date range and click Search."}
          </EmptyState>
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>MHC No</Th>
                    <Th>Reg Date</Th>
                    <Th>Patient Name</Th>
                    <Th>Age / Gender</Th>
                    <Th>Contact</Th>
                    <Th>OP Number</Th>
                    <Th>Package</Th>
                    <Th>Category</Th>
                    <Th>Source</Th>
                    <Th $align="right">Pkg Fee (₹)</Th>
                    <Th $align="right">Dr Fee (₹)</Th>
                    <Th $align="right">Add Tests (₹)</Th>
                    <Th $align="right">Pharmacy (₹)</Th>
                    <Th $align="right">IP (₹)</Th>
                    <Th $align="right">Total (₹)</Th>
                    <Th>Follow Up</Th>
                    <Th>Description / Notes</Th>
                    <Th>Telecaller</Th>
                    <Th $align="center">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <Tr key={r.mhc_no || r.id || i} onClick={() => setSelectedRecord(r)}>
                      <Td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</Td>
                      <Td>
                        <MhcBadge>#{r.mhc_no ?? "—"}</MhcBadge>
                      </Td>
                      <Td style={{ fontWeight: 700, color: "#0f766e" }}>
                        {formatDate(r.registration_date || r.created_date)}
                      </Td>
                      <Td style={{ fontWeight: 700, color: "#1e293b" }}>{r.patient_name || "—"}</Td>
                      <Td>
                        {r.age != null ? `${r.age} yrs` : "—"}{" "}
                        <GenderChip g={r.gender}>{r.gender || "—"}</GenderChip>
                      </Td>
                      <Td>{r.contact_number || "—"}</Td>
                      <Td>
                        <OpBadge>{r.op_number || "—"}</OpBadge>
                      </Td>
                      <Td>
                        <PkgBadge title={r.package}>{r.package || "—"}</PkgBadge>
                      </Td>
                      <Td style={{ color: "#64748b" }}>{r.package_category || "—"}</Td>
                      <Td>
                        <SourceBadge>{r.source || "—"}</SourceBadge>
                      </Td>
                      <Td $align="right">{fmt(r.package_fee)}</Td>
                      <Td $align="right">{fmt(r.doctor_fee)}</Td>
                      <Td $align="right">{fmt(r.add_tests)}</Td>
                      <Td $align="right">{fmt(r.pharmacy)}</Td>
                      <Td $align="right">{fmt(r.ip)}</Td>
                      <TdBold $align="right">₹ {fmt(r.total_fees)}</TdBold>
                      <Td style={{ color: "#2563eb", fontWeight: 600 }}>
                        {formatDate(r.follow_up)}
                      </Td>
                      <Td>
                        <NotesCell title={r.description}>
                          {r.description || "—"}
                        </NotesCell>
                      </Td>
                      <Td style={{ fontSize: "0.78rem", color: "#475569" }}>
                        {r.telecaller_id ? (
                          <div>
                            <div><strong>ID:</strong> {r.telecaller_id}</div>
                            {r.telecaller_date && (
                              <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                                {formatDateTime(r.telecaller_date)}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td $align="center" onClick={e => e.stopPropagation()}>
                        <ActionBtn onClick={() => setSelectedRecord(r)}>
                          👁️ View
                        </ActionBtn>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <TfootTd colSpan={10} style={{ textAlign: "right" }}>
                      GRAND TOTAL COLLECTION ({filtered.length} Patients):
                    </TfootTd>
                    <TfootTd $align="right">{fmt(pkgFees)}</TfootTd>
                    <TfootTd $align="right">{fmt(docFees)}</TfootTd>
                    <TfootTd $align="right">{fmt(addTestsTotal)}</TfootTd>
                    <TfootTd $align="right">{fmt(pharmacyTotal)}</TfootTd>
                    <TfootTd $align="right">{fmt(ipTotal)}</TfootTd>
                    <TfootTd $align="right" style={{ color: "#065f46", fontSize: "0.92rem" }}>
                      ₹ {fmt(totalFees)}
                    </TfootTd>
                    <TfootTd colSpan={4} />
                  </tr>
                </tfoot>
              </Table>
            </TableScroll>

            <TableFooter>
              <span>Showing {filtered.length} of {rows.length} records</span>
              <span style={{ color: "#0f766e", fontWeight: 800 }}>
                Total Collection: ₹ {totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </TableFooter>
          </>
        )}
      </TableCard>

      {/* Detail Modal */}
      {selectedRecord && (
        <ModalOverlay onClick={() => setSelectedRecord(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <span>🩺 MHC Record Details</span>
                <MhcBadge style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
                  #{selectedRecord.mhc_no ?? "—"}
                </MhcBadge>
              </ModalTitle>
              <ModalClose onClick={() => setSelectedRecord(null)}>✕</ModalClose>
            </ModalHeader>

            <ModalBody>
              {/* Patient & Registration Details */}
              <DetailCard>
                <DetailSectionTitle>Patient & Registration Details</DetailSectionTitle>
                <Grid>
                  <InfoItem>
                    <InfoKey>MHC Number</InfoKey>
                    <InfoVal><MhcBadge>#{selectedRecord.mhc_no ?? "—"}</MhcBadge></InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Patient Name</InfoKey>
                    <InfoVal style={{ color: "#0f766e", fontWeight: 800 }}>
                      {selectedRecord.patient_name || "—"}
                    </InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>OP Number</InfoKey>
                    <InfoVal><OpBadge>{selectedRecord.op_number || "—"}</OpBadge></InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Age / Gender</InfoKey>
                    <InfoVal>
                      {selectedRecord.age != null ? `${selectedRecord.age} yrs` : "—"} /{" "}
                      <GenderChip g={selectedRecord.gender}>{selectedRecord.gender || "—"}</GenderChip>
                    </InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Contact Number</InfoKey>
                    <InfoVal>{selectedRecord.contact_number || "—"}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Registration Date</InfoKey>
                    <InfoVal>{formatDate(selectedRecord.registration_date || selectedRecord.created_date)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Created Date & Time</InfoKey>
                    <InfoVal>{formatDateTime(selectedRecord.created_date)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Source</InfoKey>
                    <InfoVal><SourceBadge>{selectedRecord.source || "—"}</SourceBadge></InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Package Name</InfoKey>
                    <InfoVal><PkgBadge>{selectedRecord.package || "—"}</PkgBadge></InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Package Category</InfoKey>
                    <InfoVal>{selectedRecord.package_category || "—"}</InfoVal>
                  </InfoItem>
                </Grid>
              </DetailCard>

              {/* Financial Breakdown */}
              <DetailCard style={{ background: "#f0fdfa", borderColor: "#a7f3d0" }}>
                <DetailSectionTitle>Fees & Financial Breakdown</DetailSectionTitle>
                <Grid>
                  <InfoItem>
                    <InfoKey>Package Fee</InfoKey>
                    <InfoVal>₹ {fmt(selectedRecord.package_fee)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Doctor Fee</InfoKey>
                    <InfoVal>₹ {fmt(selectedRecord.doctor_fee)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Additional Tests</InfoKey>
                    <InfoVal>₹ {fmt(selectedRecord.add_tests)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Pharmacy</InfoKey>
                    <InfoVal>₹ {fmt(selectedRecord.pharmacy)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>In-Patient (IP)</InfoKey>
                    <InfoVal>₹ {fmt(selectedRecord.ip)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Total Fees</InfoKey>
                    <InfoVal style={{ color: "#065f46", fontSize: "1.1rem", fontWeight: 800 }}>
                      ₹ {fmt(selectedRecord.total_fees)}
                    </InfoVal>
                  </InfoItem>
                </Grid>
              </DetailCard>

              {/* Follow-up & Telecaller Notes */}
              <DetailCard>
                <DetailSectionTitle>Follow-Up & Telecaller Information</DetailSectionTitle>
                <Grid>
                  <InfoItem>
                    <InfoKey>Follow-up Date</InfoKey>
                    <InfoVal style={{ color: "#2563eb", fontWeight: 700 }}>
                      {formatDate(selectedRecord.follow_up)}
                    </InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Telecaller ID</InfoKey>
                    <InfoVal>{selectedRecord.telecaller_id || "—"}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Telecaller Contact Date</InfoKey>
                    <InfoVal>{formatDateTime(selectedRecord.telecaller_date)}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Created By / Staff ID</InfoKey>
                    <InfoVal>{selectedRecord.created_by || "—"}</InfoVal>
                  </InfoItem>
                  <InfoItem>
                    <InfoKey>Last Modified Date</InfoKey>
                    <InfoVal>{formatDateTime(selectedRecord.lastmodified_date)}</InfoVal>
                  </InfoItem>
                  <InfoItem style={{ gridColumn: "1 / -1" }}>
                    <InfoKey>Description / Follow-up Notes</InfoKey>
                    <InfoVal style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.6rem 0.8rem", marginTop: 4 }}>
                      {selectedRecord.description || "No notes recorded"}
                    </InfoVal>
                  </InfoItem>
                </Grid>
              </DetailCard>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}
