import React, { useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

const fmt = (v) =>
  v != null && v !== ""
    ? parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : "—";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
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
  padding: 0.3rem 0.9rem;
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

const SearchInput = styled(DateInput)`min-width: 200px;`;

const Btn = styled.button`
  padding: 0.55rem 1.3rem;
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

const QuickBtn = styled(Btn)`
  background: ${p => p.active ? "#0d9488" : "#f1f5f9"};
  color: ${p => p.active ? "#fff" : "#475569"};
  border: 1.5px solid ${p => p.active ? "#0d9488" : "#e2e8f0"};
  padding: 0.45rem 1rem;
  font-size: 0.78rem;
  &:hover:not(:disabled) { background: ${p => p.active ? "#0f766e" : "#e2e8f0"}; }
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

/* ── Stats ── */
const StatsRow = styled.div`
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  background: ${p => p.bg || "#fff"};
  border: 1.5px solid ${p => p.border || "#e2e8f0"};
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.45s ease;
`;

const StatNum = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${p => p.color || "#0f766e"};
`;

const StatLabel = styled.div`
  font-size: 0.72rem;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  padding: 0.75rem 0.9rem;
  text-align: left;
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
  &:nth-child(even) { background: #f8fafc; }
  &:hover { background: #f0fdfa; transition: background 0.15s; }
`;

const Td = styled.td`
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
  vertical-align: middle;
`;

const TdBold = styled(Td)`font-weight: 700; color: #0f766e;`;

const GenderChip = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${p => p.g === "Male" ? "#dbeafe" : p.g === "Female" ? "#fce7f3" : "#f3f4f6"};
  color: ${p => p.g === "Male" ? "#1d4ed8" : p.g === "Female" ? "#be185d" : "#6b7280"};
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
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
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

  // ── Fetch ────────────────────────────────────────────────────────────────
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

  // auto-fetch on mount (today)
  React.useEffect(() => { fetchReport(fromDate, toDate); }, []); // eslint-disable-line

  // ── Quick date helpers ───────────────────────────────────────────────────
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
    }
    setFromDate(fd); setToDate(td);
    fetchReport(fd, td);
  };

  const handleSearch = () => {
    setQuickActive("");
    fetchReport(fromDate, toDate);
  };

  // ── Filtered rows ────────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.patient_name || "").toLowerCase().includes(q) ||
      (r.op_number    || "").toLowerCase().includes(q) ||
      (r.package      || "").toLowerCase().includes(q) ||
      (r.contact_number || "").includes(q)
    );
  });

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalFees   = filtered.reduce((s, r) => s + (parseFloat(r.total_fees) || 0), 0);
  const pkgFees     = filtered.reduce((s, r) => s + (parseFloat(r.package_fee) || 0), 0);
  const docFees     = filtered.reduce((s, r) => s + (parseFloat(r.doctor_fee) || 0), 0);

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
    catch { return d; }
  };

  // ── Excel Export ────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.warning("No records to export.");
      return;
    }

    const headers = [
      "#",
      "Date",
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
      "Total (Rs.)",
      "Follow Up",
    ];

    const dataRows = filtered.map((r, i) => [
      i + 1,
      formatDate(r.created_date),
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
      r.follow_up || "—",
    ]);

    const addTestsTotal = filtered.reduce((s, r) => s + (parseFloat(r.add_tests) || 0), 0);
    const pharmacyTotal = filtered.reduce((s, r) => s + (parseFloat(r.pharmacy) || 0), 0);
    const ipTotal       = filtered.reduce((s, r) => s + (parseFloat(r.ip) || 0), 0);

    const totalRow = [
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
    ];

    const wsData = [
      ["Master Health Checkup (MHC) Report"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [`Total Patients: ${filtered.length}`, "", "", `Grand Total Collection: Rs. ${totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`],
      [],
      headers,
      ...dataRows,
      [],
      totalRow,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 22 },
      { wch: 8 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 16 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MHC Report");
    XLSX.writeFile(wb, `Master_Health_Checkup_Report_${fromDate}_to_${toDate}.xlsx`);
    toast.success("Excel report exported successfully!");
  };

  // ── PDF Export ──────────────────────────────────────────────────────────
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
    doc.text("Master Health Checkup (MHC) Report", 14, 15);

    // Subtitle info
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date Range: ${fromDate} to ${toDate}   |   Total Records: ${filtered.length}   |   Generated: ${new Date().toLocaleString("en-IN")}`,
      14,
      21
    );

    // KPI Summary Header Bar
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, 24, 269, 10, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 118, 110);
    doc.text(`Total Patients: ${filtered.length}`, 18, 30.5);
    doc.text(`Package Fees: Rs. ${pkgFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 75, 30.5);
    doc.text(`Doctor Fees: Rs. ${docFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 145, 30.5);
    doc.text(`Total Collection: Rs. ${totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 215, 30.5);

    const tableHeaders = [
      [
        "#",
        "Date",
        "Patient Name",
        "Age",
        "Gender",
        "Contact",
        "OP No.",
        "Package",
        "Category",
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
      formatDate(r.created_date),
      r.patient_name || "—",
      r.age ?? "—",
      r.gender || "—",
      r.contact_number || "—",
      r.op_number || "—",
      r.package || "—",
      r.package_category || "—",
      r.source || "—",
      fmt(r.package_fee),
      fmt(r.doctor_fee),
      fmt(r.add_tests),
      fmt(r.pharmacy),
      fmt(r.ip),
      fmt(r.total_fees),
      r.follow_up || "—",
    ]);

    const addTestsTotal = filtered.reduce((s, r) => s + (parseFloat(r.add_tests) || 0), 0);
    const pharmacyTotal = filtered.reduce((s, r) => s + (parseFloat(r.pharmacy) || 0), 0);
    const ipTotal       = filtered.reduce((s, r) => s + (parseFloat(r.ip) || 0), 0);

    const tableFoot = [
      [
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
      startY: 37,
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
        0: { cellWidth: 8 },  // #
        1: { cellWidth: 18 }, // Date
        2: { cellWidth: 28 }, // Patient Name
        3: { cellWidth: 10 }, // Age
        4: { cellWidth: 14 }, // Gender
        5: { cellWidth: 20 }, // Contact
        6: { cellWidth: 18 }, // OP No.
        7: { cellWidth: 26 }, // Package
        8: { cellWidth: 20 }, // Category
        9: { cellWidth: 16 }, // Source
        10: { cellWidth: 16, halign: "right" }, // Pkg Fee
        11: { cellWidth: 16, halign: "right" }, // Dr Fee
        12: { cellWidth: 14, halign: "right" }, // Tests
        13: { cellWidth: 14, halign: "right" }, // Pharm
        14: { cellWidth: 12, halign: "right" }, // IP
        15: { cellWidth: 18, halign: "right" }, // Total
        16: { cellWidth: 15 }, // Follow Up
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 8
        );
      },
    });

    doc.save(`Master_Health_Checkup_Report_${fromDate}_to_${toDate}.pdf`);
    toast.success("PDF report exported successfully!");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* Header */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIcon>📋</HeaderIcon>
          <div>
            <HeaderTitle>MHC Report</HeaderTitle>
            <HeaderSub>Master Health Checkup — date-wise patient report</HeaderSub>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <ExcelBtn onClick={exportToExcel} disabled={loading || filtered.length === 0} id="btn-header-export-excel">
            📊 Export Excel
          </ExcelBtn>
          <PdfBtn onClick={exportToPDF} disabled={loading || filtered.length === 0} id="btn-header-export-pdf">
            📄 Export PDF
          </PdfBtn>
          <Badge>🩺 {filtered.length} Records</Badge>
        </HeaderRight>
      </HeaderCard>

      {/* Filter Card */}
      <FilterCard>
        <FilterRow>
          <FieldGroup>
            <Label>From Date</Label>
            <DateInput
              id="mhc-report-from"
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setQuickActive(""); }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>To Date</Label>
            <DateInput
              id="mhc-report-to"
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setQuickActive(""); }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Search</Label>
            <SearchInput
              id="mhc-report-search"
              type="text"
              placeholder="Name / OP No / Package..."
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
          <QuickLabel>Quick:</QuickLabel>
          {[
            { key: "today",     label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "week",      label: "Last 7 Days" },
            { key: "month",     label: "This Month" },
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

      {/* Stats */}
      {fetched && !loading && (
        <StatsRow>
          <StatCard bg="#f0fdfa" border="#a7f3d0">
            <StatNum color="#0f766e">{filtered.length}</StatNum>
            <StatLabel>Total Patients</StatLabel>
          </StatCard>
          <StatCard bg="#fff7ed" border="#fed7aa">
            <StatNum color="#b45309">
              ₹ {pkgFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </StatNum>
            <StatLabel>Package Fees</StatLabel>
          </StatCard>
          <StatCard bg="#faf5ff" border="#e9d5ff">
            <StatNum color="#7c3aed">
              ₹ {docFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </StatNum>
            <StatLabel>Doctor Fees</StatLabel>
          </StatCard>
          <StatCard bg="#ecfdf5" border="#6ee7b7">
            <StatNum color="#065f46">
              ₹ {totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </StatNum>
            <StatLabel>Total Collection</StatLabel>
          </StatCard>
        </StatsRow>
      )}

      {/* Table */}
      <TableCard>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState>
            {fetched ? "📭 No records found for the selected date range." : "Select a date range and click Search."}
          </EmptyState>
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Reg Date</Th>
                    <Th>Patient Name</Th>
                    <Th>Age</Th>
                    <Th>Gender</Th>
                    <Th>Contact</Th>
                    <Th>OP Number</Th>
                    <Th>Package</Th>
                    <Th>Category</Th>
                    <Th>Source</Th>
                    <Th>Pkg Fee (₹)</Th>
                    <Th>Dr Fee (₹)</Th>
                    <Th>Add Tests (₹)</Th>
                    <Th>Pharmacy (₹)</Th>
                    <Th>IP (₹)</Th>
                    <Th>Total (₹)</Th>
                    <Th>Follow Up</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <Tr key={r.id || i}>
                      <Td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</Td>
                      <Td>{formatDate(r.created_date)}</Td>
                      <Td>{r.registration_date || "—"}</Td>
                      <Td style={{ fontWeight: 700, color: "#1e293b" }}>{r.patient_name || "—"}</Td>
                      <Td>{r.age ?? "—"}</Td>
                      <Td>
                        <GenderChip g={r.gender}>{r.gender || "—"}</GenderChip>
                      </Td>
                      <Td>{r.contact_number || "—"}</Td>
                      <Td style={{ fontWeight: 600, color: "#0d9488" }}>{r.op_number || "—"}</Td>
                      <Td style={{ fontWeight: 700 }}>{r.package || "—"}</Td>
                      <Td>{r.package_category || "—"}</Td>
                      <Td>{r.source || "—"}</Td>
                      <Td>{fmt(r.package_fee)}</Td>
                      <Td>{fmt(r.doctor_fee)}</Td>
                      <Td>{fmt(r.add_tests)}</Td>
                      <Td>{fmt(r.pharmacy)}</Td>
                      <Td>{fmt(r.ip)}</Td>
                      <TdBold>₹ {fmt(r.total_fees)}</TdBold>
                      <Td>{r.follow_up || "—"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <TableFooter>
              <span>Showing {filtered.length} of {rows.length} records</span>
              <span style={{ color: "#0f766e", fontWeight: 800 }}>
                Grand Total: ₹ {totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </TableFooter>
          </>
        )}
      </TableCard>
    </PageWrapper>
  );
}
