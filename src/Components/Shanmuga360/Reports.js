import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "₹0.00";
  const num = parseFloat(amount);
  return isNaN(num) ? "₹0.00" : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Normalize arrays
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [val.trim()].filter(Boolean);
  }
  return [val];
};

export default function Reports360() {
  const navigate = useNavigate();

  // Date state default: 1st of current month to today
  const today = formatDate(new Date());
  const startOfMonth = (() => {
    const d = new Date();
    d.setDate(1);
    return formatDate(d);
  })();

  const [fromDate, setFromDate] = useState(startOfMonth);
  const [toDate, setToDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch report data from backend API
  const fetchReports = useCallback(async (fDate = fromDate, tDate = toDate) => {
    setLoading(true);
    try {
      let url = `${Hmsbaseurl}360_report/?from_date=${fDate}&to_date=${tDate}`;
      const res = await apiRequest(url, "GET");

      if (Array.isArray(res)) {
        setReports(res);
      } else if (res && Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Error fetching 360 reports:", err);
      toast.error("Failed to load 360 report data. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchReports(fromDate, toDate);
  }, [fetchReports, fromDate, toDate]);

  // Quick Date Range presets
  const handleQuickPreset = (type) => {
    const now = new Date();
    let start = "";
    let end = formatDate(now);

    if (type === "today") {
      start = formatDate(now);
      end = formatDate(now);
    } else if (type === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      start = formatDate(y);
      end = formatDate(y);
    } else if (type === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      start = formatDate(d);
      end = formatDate(now);
    } else if (type === "thisMonth") {
      const d = new Date();
      d.setDate(1);
      start = formatDate(d);
      end = formatDate(now);
    }

    setFromDate(start);
    setToDate(end);
    fetchReports(start, end);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      toast.warn("'From Date' cannot be later than 'To Date'");
      return;
    }
    fetchReports(fromDate, toDate);
  };

  // Filtered reports via search term
  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;
    const q = searchTerm.toLowerCase();

    return reports.filter((item) => {
      const patient = (item.patient_name || "").toLowerCase();
      const mobile = (item.mobile_number || "").toLowerCase();
      const bill = (item.bill_number || "").toLowerCase();
      const ref = (item.reference_id || "").toLowerCase();
      const order = (item.order_id || "").toLowerCase();
      const staff = (item.staff_name || "").toLowerCase();
      const transport = (item.transportation_mode || "").toLowerCase();

      const doctors = toArray(item.doctor_name).join(" ").toLowerCase();
      const medicines = toArray(item.medicine_name).join(" ").toLowerCase();
      const tests = toArray(item.test_name || item.test).join(" ").toLowerCase();
      const services = toArray(item.service_list).join(" ").toLowerCase();

      return (
        patient.includes(q) ||
        mobile.includes(q) ||
        bill.includes(q) ||
        ref.includes(q) ||
        order.includes(q) ||
        staff.includes(q) ||
        transport.includes(q) ||
        doctors.includes(q) ||
        medicines.includes(q) ||
        tests.includes(q) ||
        services.includes(q)
      );
    });
  }, [reports, searchTerm]);

  // Totals calculations for summary KPI cards
  const stats = useMemo(() => {
    let totalAmt = 0;
    let docFees = 0;
    let nurseFees = 0;
    let medCharges = 0;
    let hospAmt = 0;

    filteredReports.forEach((r) => {
      totalAmt += parseFloat(r.total_amount) || 0;
      docFees += parseFloat(r.doctor_fees) || 0;
      nurseFees += parseFloat(r.staff_nurse_fees) || 0;
      medCharges += parseFloat(r.medicine_charge) || 0;
      hospAmt += parseFloat(r.hospital_amount) || 0;
    });

    return {
      count: filteredReports.length,
      totalAmt,
      docFees,
      nurseFees,
      medCharges,
      hospAmt,
    };
  }, [filteredReports]);

  // CSV Export
  // Excel Export (without Created By)
  const exportToExcel = () => {
    if (filteredReports.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const headers = [
      "S.No",
      "Date",
      "Bill Number",
      "Patient Name",
      "Mobile Number",
      "Doctors",
      "Staff Name",
      "Services",
      "Medicines",
      "Tests",
      "Transportation Mode",
      "Total Amount",
      "Doctor Fees",
      "Staff Nurse Fees",
      "Doctor/Staff Fees Remaining",
      "Medicine Charge",
      "Hospital Amount",
      "Reference ID",
      "Order ID",
      "Created Date",
    ];

    const rows = filteredReports.map((r, i) => [
      i + 1,
      r.date ? String(r.date).slice(0, 10) : "",
      r.bill_number || "",
      r.patient_name || "",
      r.mobile_number || "",
      toArray(r.doctor_name).join("; "),
      r.staff_name || "",
      toArray(r.service_list).join("; "),
      toArray(r.medicine_name).join("; "),
      toArray(r.test_name || r.test).join("; "),
      r.transportation_mode || "",
      r.total_amount != null ? Number(r.total_amount) : "",
      r.doctor_fees != null ? Number(r.doctor_fees) : "",
      r.staff_nurse_fees != null ? Number(r.staff_nurse_fees) : "",
      r.doctor_staff_fees_remaining != null ? Number(r.doctor_staff_fees_remaining) : "",
      r.medicine_charge != null ? Number(r.medicine_charge) : "",
      r.hospital_amount != null ? Number(r.hospital_amount) : "",
      r.reference_id || "",
      r.order_id || "",
      r.created_date ? String(r.created_date).slice(0, 19).replace("T", " ") : "",
    ]);

    try {
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "360 Reports");
      XLSX.writeFile(wb, `360_Report_${fromDate}_to_${toDate}.xlsx`);
      toast.success("Report downloaded as Excel (.xlsx)!");
    } catch (err) {
      console.error("Error generating Excel file:", err);
      // CSV Fallback
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `360_Report_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded as CSV!");
    }
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 style={styles.headerTitle}>360° Registration Reports</h1>
            <p style={styles.headerSub}>Comprehensive view of registrations, services, fees, and medicine charges</p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => navigate("/360Registration")}
            style={styles.btnPrimary}
          >
            <span style={{ fontSize: 16 }}>➕</span> New Registration
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            style={styles.btnSecondary}
            title="Download Excel"
          >
            <span style={{ fontSize: 15 }}>📥</span> Export Excel
          </button>
          <button
            type="button"
            onClick={() => fetchReports(fromDate, toDate)}
            style={styles.btnRefresh}
            title="Reload Report"
          >
            <span style={{ fontSize: 15 }}>🔄</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
          {/* From Date */}
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {/* To Date */}
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {/* Submit button */}
          <button type="submit" style={styles.btnFilter}>
            🔍 Filter Data
          </button>

          {/* Presets */}
          <div style={styles.presetsWrap}>
            <span style={styles.presetsLabel}>Quick Select:</span>
            <button
              type="button"
              style={styles.presetBtn}
              onClick={() => handleQuickPreset("today")}
            >
              Today
            </button>
            <button
              type="button"
              style={styles.presetBtn}
              onClick={() => handleQuickPreset("yesterday")}
            >
              Yesterday
            </button>
            <button
              type="button"
              style={styles.presetBtn}
              onClick={() => handleQuickPreset("last7")}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              style={styles.presetBtn}
              onClick={() => handleQuickPreset("thisMonth")}
            >
              This Month
            </button>
          </div>
        </form>

        {/* Real-time search bar */}
        <div style={styles.searchWrap}>
          <div style={styles.searchIcon}>🔎</div>
          <input
            type="text"
            placeholder="Search patient, phone, bill number, doctor, test, medicine, reference ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={styles.clearSearchBtn}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="📋"
          title="Total Registrations"
          value={stats.count}
          color="#0d9488"
          bg="#ccfbf1"
        />
        <StatCard
          icon="💰"
          title="Total Billed"
          value={formatCurrency(stats.totalAmt)}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          icon="🧑‍⚕️"
          title="Doctor Fees"
          value={formatCurrency(stats.docFees)}
          color="#7c3aed"
          bg="#ede9fe"
        />
        <StatCard
          icon="💉"
          title="Staff Nurse Fees"
          value={formatCurrency(stats.nurseFees)}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatCard
          icon="💊"
          title="Medicine Charges"
          value={formatCurrency(stats.medCharges)}
          color="#ea580c"
          bg="#ffedd5"
        />
        <StatCard
          icon="🏥"
          title="Hospital Revenue"
          value={formatCurrency(stats.hospAmt)}
          color="#059669"
          bg="#d1fae5"
        />
      </div>

      {/* Table Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderBar}>
          <div>
            <span style={styles.tableTitle}>Stored Registrations</span>
            <span style={styles.recordCountBadge}>
              {filteredReports.length} {filteredReports.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          {loading && (
            <div style={styles.loadingIndicator}>
              <span style={styles.spinner} />
              <span>Fetching latest reports...</span>
            </div>
          )}
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Bill Number</th>
                <th style={styles.th}>Patient Details</th>
                <th style={styles.th}>Doctor(s)</th>
                <th style={styles.th}>Staff</th>
                <th style={styles.th}>Services</th>
                <th style={styles.th}>Medicines</th>
                <th style={styles.th}>Tests</th>
                <th style={styles.th}>Mode</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Total (₹)</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Dr Fees</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Nurse Fees</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Med Charge</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Hospital</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={16} style={styles.stateCell}>
                    <div style={styles.loadingState}>
                      <div style={styles.largeSpinner} />
                      <p style={{ marginTop: 12, color: "#64748b" }}>Loading registration data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={16} style={styles.stateCell}>
                    <div style={styles.emptyState}>
                      <div style={{ fontSize: 44, marginBottom: 8 }}>📑</div>
                      <h4 style={{ margin: "0 0 6px", color: "#334155" }}>No Registrations Found</h4>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                        No records match the selected date range ({fromDate} to {toDate})
                        {searchTerm ? ` and query "${searchTerm}"` : ""}.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((row, idx) => {
                  const doctors = toArray(row.doctor_name);
                  const medicines = toArray(row.medicine_name);
                  const tests = toArray(row.test_name || row.test);
                  const services = toArray(row.service_list);

                  return (
                    <tr
                      key={row.id || row._id || idx}
                      style={{
                        ...styles.tr,
                        background: idx % 2 === 0 ? "#ffffff" : "#fbfdfe",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf9")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#fbfdfe")
                      }
                    >
                      <td style={styles.tdSno}>{idx + 1}</td>
                      <td style={styles.tdDate}>
                        {row.date ? String(row.date).slice(0, 10) : "-"}
                      </td>
                      <td style={styles.tdBill}>
                        <span style={styles.billBadge}>
                          {row.bill_number || "—"}
                        </span>
                        {row.reference_id && (
                          <div style={styles.subMeta}>Ref: {row.reference_id}</div>
                        )}
                        {row.order_id && (
                          <div style={styles.subMeta}>Order: {row.order_id}</div>
                        )}
                      </td>
                      <td style={styles.tdPatient}>
                        <div style={styles.patientName}>{row.patient_name || "—"}</div>
                        {row.mobile_number && (
                          <div style={styles.patientMobile}>📞 {row.mobile_number}</div>
                        )}
                      </td>
                      <td style={styles.tdTags}>
                        {doctors.length > 0 ? (
                          <div style={styles.tagList}>
                            {doctors.map((doc, dIdx) => (
                              <span key={dIdx} style={styles.doctorChip}>
                                👨‍⚕️ {doc}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={styles.tdStaff}>
                        {row.staff_name ? (
                          <span style={styles.staffBadge}>👩‍⚕️ {row.staff_name}</span>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={styles.tdTags}>
                        {services.length > 0 ? (
                          <div style={styles.tagList}>
                            {services.map((srv, sIdx) => (
                              <span key={sIdx} style={styles.serviceChip}>
                                🔹 {srv}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={styles.tdTags}>
                        {medicines.length > 0 ? (
                          <div style={styles.tagList}>
                            {medicines.map((med, mIdx) => (
                              <span key={mIdx} style={styles.medicineChip}>
                                💊 {med}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={styles.tdTags}>
                        {tests.length > 0 ? (
                          <div style={styles.tagList}>
                            {tests.map((t, tIdx) => (
                              <span key={tIdx} style={styles.testChip}>
                                🔬 {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={styles.tdMode}>
                        {row.transportation_mode ? (
                          <span style={styles.modeBadge}>
                            {row.transportation_mode === "Bus" ? "🚌 " : "🚶 "}
                            {row.transportation_mode}
                          </span>
                        ) : (
                          <span style={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={{ ...styles.tdNum, fontWeight: 700, color: "#0f766e" }}>
                        {formatCurrency(row.total_amount)}
                      </td>
                      <td style={styles.tdNum}>{formatCurrency(row.doctor_fees)}</td>
                      <td style={styles.tdNum}>{formatCurrency(row.staff_nurse_fees)}</td>
                      <td style={styles.tdNum}>{formatCurrency(row.medicine_charge)}</td>
                      <td style={{ ...styles.tdNum, fontWeight: 600, color: "#0369a1" }}>
                        {formatCurrency(row.hospital_amount)}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(row)}
                          style={styles.viewBtn}
                          title="View Full Details"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div style={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>📑</span>
                <div>
                  <h3 style={styles.modalTitle}>
                    Registration Details — {selectedRecord.bill_number || "No Bill #"}
                  </h3>
                  <p style={styles.modalSub}>
                    Recorded on {selectedRecord.date ? String(selectedRecord.date).slice(0, 10) : "—"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Patient Info */}
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>👤 Patient Information</h4>
                <div style={styles.modalGrid}>
                  <ModalField label="Patient Name" value={selectedRecord.patient_name} />
                  <ModalField label="Mobile Number" value={selectedRecord.mobile_number} />
                  <ModalField label="Bill Number" value={selectedRecord.bill_number} />
                  <ModalField label="Date" value={selectedRecord.date ? String(selectedRecord.date).slice(0, 10) : "—"} />
                  <ModalField label="Reference ID" value={selectedRecord.reference_id} />
                  <ModalField label="Order ID" value={selectedRecord.order_id} />
                  <ModalField label="Transportation Mode" value={selectedRecord.transportation_mode} />
                  <ModalField label="Staff Name" value={selectedRecord.staff_name} />
                </div>
              </div>

              {/* Consultation & Doctors */}
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>👨‍⚕️ Assigned Doctors</h4>
                <div style={styles.modalChipsList}>
                  {toArray(selectedRecord.doctor_name).length > 0 ? (
                    toArray(selectedRecord.doctor_name).map((doc, idx) => (
                      <span key={idx} style={styles.doctorChip}>
                        👨‍⚕️ {doc}
                      </span>
                    ))
                  ) : (
                    <span style={styles.mutedText}>No doctor recorded</span>
                  )}
                </div>
              </div>

              {/* Services & Diagnostics */}
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>🏥 Services &amp; Diagnostics</h4>
                <div style={{ marginBottom: 10 }}>
                  <span style={styles.modalSubLabel}>Services:</span>
                  <div style={styles.modalChipsList}>
                    {toArray(selectedRecord.service_list).length > 0 ? (
                      toArray(selectedRecord.service_list).map((srv, idx) => (
                        <span key={idx} style={styles.serviceChip}>
                          🔹 {srv}
                        </span>
                      ))
                    ) : (
                      <span style={styles.mutedText}>No services recorded</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={styles.modalSubLabel}>Diagnostic Tests:</span>
                  <div style={styles.modalChipsList}>
                    {toArray(selectedRecord.test_name || selectedRecord.test).length > 0 ? (
                      toArray(selectedRecord.test_name || selectedRecord.test).map((t, idx) => (
                        <span key={idx} style={styles.testChip}>
                          🔬 {t}
                        </span>
                      ))
                    ) : (
                      <span style={styles.mutedText}>No tests recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Medicines */}
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>💊 Prescribed Medicines</h4>
                <div style={styles.modalChipsList}>
                  {toArray(selectedRecord.medicine_name).length > 0 ? (
                    toArray(selectedRecord.medicine_name).map((med, idx) => (
                      <span key={idx} style={styles.medicineChip}>
                        💊 {med}
                      </span>
                    ))
                  ) : (
                    <span style={styles.mutedText}>No medicines recorded</span>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>💵 Financial Breakdown</h4>
                <div style={styles.finGrid}>
                  <div style={styles.finBox}>
                    <div style={styles.finLabel}>Doctor Fees</div>
                    <div style={styles.finVal}>{formatCurrency(selectedRecord.doctor_fees)}</div>
                  </div>
                  <div style={styles.finBox}>
                    <div style={styles.finLabel}>Staff Nurse Fees</div>
                    <div style={styles.finVal}>{formatCurrency(selectedRecord.staff_nurse_fees)}</div>
                  </div>
                  <div style={styles.finBox}>
                    <div style={styles.finLabel}>Remaining Fees</div>
                    <div style={styles.finVal}>
                      {formatCurrency(selectedRecord.doctor_staff_fees_remaining)}
                    </div>
                  </div>
                  <div style={styles.finBox}>
                    <div style={styles.finLabel}>Medicine Charges</div>
                    <div style={styles.finVal}>{formatCurrency(selectedRecord.medicine_charge)}</div>
                  </div>
                  <div style={styles.finBox}>
                    <div style={styles.finLabel}>Hospital Amount</div>
                    <div style={styles.finVal}>{formatCurrency(selectedRecord.hospital_amount)}</div>
                  </div>
                  <div style={{ ...styles.finBox, background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                    <div style={{ ...styles.finLabel, color: "#065f46", fontWeight: 700 }}>
                      Total Billing Amount
                    </div>
                    <div style={{ ...styles.finVal, color: "#065f46", fontSize: 18, fontWeight: 800 }}>
                      {formatCurrency(selectedRecord.total_amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit info */}
              <div style={{ ...styles.modalSection, borderBottom: "none", paddingBottom: 0 }}>
                <div style={styles.auditRow}>
                  <span>
                    Created By: <strong>{selectedRecord.created_by || "—"}</strong>
                  </span>
                  <span>
                    Created Date:{" "}
                    <strong>
                      {selectedRecord.created_date
                        ? String(selectedRecord.created_date).slice(0, 19).replace("T", " ")
                        : "—"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                style={styles.btnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalField({ label, value }) {
  return (
    <div style={styles.modalField}>
      <span style={styles.modalFieldLabel}>{label}</span>
      <span style={styles.modalFieldVal}>{value || "—"}</span>
    </div>
  );
}

function StatCard({ icon, title, value, color, bg }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconBox, background: bg, color: color }}>
        {icon}
      </div>
      <div>
        <div style={styles.statTitle}>{title}</div>
        <div style={{ ...styles.statValue, color: color }}>{value}</div>
      </div>
    </div>
  );
}

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fafa 0%, #f8fffe 100%)",
    padding: "24px 20px 48px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#1e293b",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 14,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #0d9488, #0f766e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(13,148,136,0.30)",
  },
  headerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f3d3a",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
    transition: "transform 0.15s ease",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#ffffff",
    color: "#0f766e",
    border: "1.5px solid #0d9488",
    borderRadius: 9,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  btnRefresh: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  /* Filter Card */
  filterCard: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "16px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    marginBottom: 20,
  },
  filterForm: {
    display: "flex",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 14,
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  dateInput: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1.5px solid #cbd5e1",
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    background: "#f8fafc",
    fontFamily: "inherit",
    minWidth: 150,
  },
  btnFilter: {
    background: "#0d9488",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(13,148,136,0.25)",
  },
  presetsWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginLeft: "auto",
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    marginRight: 2,
  },
  presetBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
    color: "#334155",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },

  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 14,
    color: "#94a3b8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 38px 10px 38px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
  },
  clearSearchBtn: {
    position: "absolute",
    right: 12,
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: 14,
    cursor: "pointer",
  },

  /* Stats */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  statValue: {
    fontSize: 17,
    fontWeight: 700,
    marginTop: 2,
  },

  /* Table */
  tableCard: {
    background: "#ffffff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeaderBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#fafcfc",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f3d3a",
    marginRight: 10,
  },
  recordCountBadge: {
    background: "#ccfbf1",
    color: "#0f766e",
    fontSize: 12,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 12,
  },
  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#0d9488",
    fontWeight: 500,
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid #ccfbf1",
    borderTopColor: "#0d9488",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  largeSpinner: {
    width: 32,
    height: 32,
    border: "3px solid #ccfbf1",
    borderTopColor: "#0d9488",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  tableWrapper: {
    overflowX: "auto",
    width: "100%",
    maxHeight: "600px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    textAlign: "left",
  },
  thRow: {
    background: "#f1f5f9",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  th: {
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 11,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "2px solid #cbd5e1",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s ease",
  },
  td: {
    padding: "10px 14px",
    verticalAlign: "middle",
  },
  tdSno: {
    padding: "10px 14px",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    width: 36,
  },
  tdDate: {
    padding: "10px 14px",
    whiteSpace: "nowrap",
    fontWeight: 600,
    color: "#334155",
  },
  tdBill: {
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
  billBadge: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: 700,
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 6,
  },
  subMeta: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  tdPatient: {
    padding: "10px 14px",
    minWidth: 140,
  },
  patientName: {
    fontWeight: 600,
    color: "#0f172a",
  },
  patientMobile: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  tdStaff: {
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
  staffBadge: {
    fontSize: 12,
    color: "#475569",
    fontWeight: 500,
  },
  tdTags: {
    padding: "10px 14px",
    minWidth: 160,
    maxWidth: 240,
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  doctorChip: {
    background: "#f5f3ff",
    color: "#6d28d9",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 6,
    border: "1px solid #ddd6fe",
    whiteSpace: "nowrap",
  },
  serviceChip: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 6,
    border: "1px solid #bfdbfe",
    whiteSpace: "nowrap",
  },
  medicineChip: {
    background: "#fff7ed",
    color: "#c2410c",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 6,
    border: "1px solid #fed7aa",
    whiteSpace: "nowrap",
  },
  testChip: {
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 6,
    border: "1px solid #bbf7d0",
    whiteSpace: "nowrap",
  },
  tdMode: {
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
  modeBadge: {
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
  },
  tdNum: {
    padding: "10px 14px",
    textAlign: "right",
    whiteSpace: "nowrap",
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
  },
  viewBtn: {
    background: "#f0fdfa",
    color: "#0f766e",
    border: "1px solid #99f6e4",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  mutedText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  stateCell: {
    padding: "50px 20px",
    textAlign: "center",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Modal */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modalBox: {
    background: "#ffffff",
    borderRadius: 16,
    maxWidth: 680,
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#fafcfc",
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f3d3a",
  },
  modalSub: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#64748b",
  },
  modalCloseBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    cursor: "pointer",
    color: "#64748b",
  },
  modalBody: {
    padding: "20px 24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalSection: {
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 14,
  },
  modalSecTitle: {
    margin: "0 0 10px",
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
  },
  modalFieldVal: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
  },
  modalSubLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    marginBottom: 6,
  },
  modalChipsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  finGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  finBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "10px 12px",
  },
  finLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 600,
  },
  finVal: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    marginTop: 2,
  },
  auditRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#94a3b8",
  },
  modalFooter: {
    padding: "14px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    background: "#fafcfc",
  },
};
