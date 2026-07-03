import { useState, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── helpers ────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const today = () => new Date().toISOString().split("T")[0];
const monthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
};

// ─── Print stylesheet injected once ─────────────────────────
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #dds-print-area, #dds-print-area * { visibility: visible !important; }
    #dds-print-area {
      position: fixed !important;
      inset: 0 !important;
      z-index: 99999 !important;
      background: #fff !important;
      padding: 0 !important;
    }
    @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  }
`;

export default function PrintDialysisDischargeSummary() {
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toast, setToast] = useState(null);
  const printRef = useRef(null);

  // inject print styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = PRINT_STYLES;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // auto-fetch today's records on mount
  useEffect(() => {
    fetchRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRecords = async () => {
    if (!fromDate || !toDate) {
      showToast("Please select both From and To dates.", "error");
      return;
    }
    setLoading(true);
    setError(null);
    setRecords([]);
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}Print_dialysis_dischargesummary/?from_date=${fromDate}&to_date=${toDate}`,
        "GET"
      );
      const body = res?.data || res;
      const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      setRecords(list);
      if (list.length === 0) showToast("No records found for the selected date range.", "info");
    } catch (err) {
      setError(err?.message || "Failed to fetch records.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (record) => {
    setPrintRecord(record);
    setShowPrintModal(true);
  };

  const handleModalPrint = () => {
    window.print();
  };

  const handleCloseModal = () => {
    setShowPrintModal(false);
    setPrintRecord(null);
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#f0f4f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── inputs ── */
        .p-input {
          padding: 9px 12px;
          border: 1.5px solid #d1d9e6;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: inherit;
          color: #1a2233;
          background: #fff;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .p-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,.13); }
        .p-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: #6b7a99;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        /* ── search btn ── */
        .btn-search {
          padding: 10px 24px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity .18s, transform .12s;
          box-shadow: 0 4px 14px rgba(13,148,136,.3);
          align-self: flex-end;
        }
        .btn-search:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .btn-search:disabled { opacity: .6; cursor: not-allowed; }

        /* ── print btn ── */
        .btn-print {
          padding: 7px 16px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
          color: #fff;
          border: none;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity .15s;
          box-shadow: 0 2px 8px rgba(13,148,136,.28);
          white-space: nowrap;
        }
        .btn-print:hover { opacity: .88; }

        /* ── table ── */
        .rec-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .rec-table th {
          background: #f0f9f8;
          color: #0f766e;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          padding: 11px 14px;
          text-align: left;
          border-bottom: 2px solid #ccede9;
        }
        .rec-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f0f4f8;
          color: #334155;
          vertical-align: middle;
        }
        .rec-table tr:last-child td { border-bottom: none; }
        .rec-table tr:hover td { background: #f7fffe; }

        /* ── badge ── */
        .badge {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          background: #e0f7f5;
          color: #0f766e;
        }

        /* ── toast ── */
        .toast {
          position: fixed;
          top: 24px; right: 24px;
          padding: 13px 20px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(0,0,0,.15);
          animation: slideUp .22s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(-14px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }

        /* ── spinner ── */
        .spin {
          width: 16px; height: 16px;
          border: 2.5px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rotate .65s linear infinite;
          display: inline-block;
        }
        @keyframes rotate { to { transform: rotate(360deg); } }

        /* ─────────────────────────────────────────────
           PRINT REPORT STYLES
        ───────────────────────────────────────────── */
        .rpt-page {
          background: #fff;
          padding: 28px 32px;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          color: #0f172a;
          font-size: 12px;
          line-height: 1.55;
          max-width: 860px;
          margin: 0 auto;
        }

        /* header band */
        .rpt-header {
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
          border-radius: 12px;
          padding: 20px 26px;
          color: #fff;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .rpt-header-icon {
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
        }
        .rpt-dept {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.7);
          margin-bottom: 3px;
        }
        .rpt-title { font-size: 20px; font-weight: 700; }

        /* patient info card */
        .rpt-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .rpt-card-head {
          background: linear-gradient(90deg, #0f766e, #14b8a6);
          color: #fff;
          padding: 9px 16px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rpt-card-body { padding: 16px; }

        .rpt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 28px; }
        .rpt-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px 20px; }
        .rpt-field { margin-bottom: 4px; }
        .rpt-field-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .rpt-field-value { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 1px; }

        /* tables inside report */
        .rpt-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
        .rpt-table th {
          background: #f0f9f8;
          color: #0f766e;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .05em;
          padding: 8px 10px;
          text-align: left;
          border: 1px solid #ccede9;
        }
        .rpt-table td {
          padding: 7px 10px;
          border: 1px solid #e8f4f3;
          color: #1e293b;
          vertical-align: top;
        }
        .rpt-table tr:nth-child(even) td { background: #f7fffe; }

        /* advice list */
        .rpt-advice-list { padding-left: 0; list-style: none; margin-top: 4px; }
        .rpt-advice-list li {
          padding: 5px 0 5px 20px;
          position: relative;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 12.5px;
          color: #1e293b;
        }
        .rpt-advice-list li:last-child { border-bottom: none; }
        .rpt-advice-list li::before {
          content: "✦";
          position: absolute;
          left: 0;
          color: #0d9488;
          font-size: 10px;
          top: 7px;
        }

        /* footer */
        .rpt-footer {
          margin-top: 28px;
          padding-top: 16px;
          border-top: 1.5px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
        }
        .rpt-sig-line {
          border-top: 1.5px solid #334155;
          width: 160px;
          padding-top: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          text-align: center;
        }

        /* screen-only: hide print area from normal view until needed */
        #dds-print-area { display: none; }
        #dds-print-area.active { display: block; }

        @media (max-width: 700px) {
          .rpt-grid-2, .rpt-grid-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)", padding: "26px 32px 22px", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🖨️</div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.65)", marginBottom: 2 }}>Nephrology Department</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}>Dialysis Discharge — Print Records</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── Filter Bar ── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e4eaf4", boxShadow: "0 2px 12px rgba(30,60,120,.05)", padding: "22px 24px", marginBottom: 28, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="p-label">From Date</label>
            <input className="p-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="p-label">To Date</label>
            <input className="p-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button className="btn-search" onClick={fetchRecords} disabled={loading}>
            {loading ? <><span className="spin" /> Searching…</> : <><span>🔍</span> Search Records</>}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "14px 18px", color: "#dc2626", fontWeight: 600, fontSize: 13.5, marginBottom: 20 }}>
            ❌ {error}
          </div>
        )}

        {/* ── Records Table ── */}
        {records.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e4eaf4", boxShadow: "0 2px 12px rgba(30,60,120,.05)", overflow: "hidden" }}>
            {/* table header bar */}
            <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)", padding: "14px 20px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 14 }}>
                <span>📋</span> Discharge Records
              </div>
              <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                {records.length} record{records.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="rec-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient Name</th>
                    <th>UHID</th>
                    <th>IP / ID No.</th>
                    <th>Insurance</th>
                    <th>Next HD Date</th>
                    <th>Discharged On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id?.$oid || r.id || i}>
                      <td style={{ color: "#94a3b8", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{r.name || "—"}</div>
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{r.gender || ""}{r.age ? `, ${r.age}y` : ""}</div>
                      </td>
                      <td>
                        <span className="badge">{r.uhid || "—"}</span>
                      </td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12.5 }}>{r.id_no || "—"}</td>
                      <td>{r.insurance || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                      <td>{fmt(r.next_hd_session_on?.$date || r.next_hd_session_on)}</td>
                      <td>{fmt(r.created_date?.$date || r.created_date)}</td>
                      <td>
                        <button className="btn-print" onClick={() => handlePrint(r)}>
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && records.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>No records loaded yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Select a date range and click Search Records</div>
          </div>
        )}
      </div>

      {/* ── Print Modal ── */}
      {showPrintModal && printRecord && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          overflowY: "auto", padding: "32px 16px"
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 900,
            boxShadow: "0 24px 60px rgba(0,0,0,.22)",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)",
              borderRadius: "16px 16px 0 0", padding: "16px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 700, fontSize: 15 }}>
                🖨️ Discharge Summary Preview
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleModalPrint}
                  style={{
                    padding: "8px 20px", background: "#fff", color: "#0f766e",
                    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: "8px 16px", background: "rgba(255,255,255,.18)", color: "#fff",
                    border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, fontWeight: 700,
                    fontSize: 13.5, cursor: "pointer"
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div id="dds-print-area" className="active" ref={printRef} style={{ padding: "4px 0" }}>
              <PrintReport record={printRecord} />
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : toast.type === "info" ? "#6366f1" : "#22c55e" }}>
          {toast.type === "error" ? "❌ " : toast.type === "info" ? "ℹ️ " : "✅ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
// PrintReport — full A4-style discharge summary
// ════════════════════════════════════════════════════
function PrintReport({ record: r }) {
  const hdSessions = Array.isArray(r.hd_sessions) ? r.hd_sessions : [];
  const blood = Array.isArray(r.blood_investigations) ? r.blood_investigations : [];
  const complications = Array.isArray(r.complications_during_hd) ? r.complications_during_hd : [];
  const advice = Array.isArray(r.advice_on_discharge) ? r.advice_on_discharge : [];
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="rpt-page">

      {/* ── Header ── */}
      <div className="rpt-header">
        <div className="rpt-header-icon">🩺</div>
        <div style={{ flex: 1 }}>
          <div className="rpt-dept">Nephrology Department</div>
          <div className="rpt-title">Dialysis Discharge Summary</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "rgba(255,255,255,.75)", lineHeight: 1.6 }}>
          <div>Printed: {printDate}</div>
          <div>UHID: <strong style={{ color: "#fff" }}>{r.uhid}</strong></div>
        </div>
      </div>

      {/* ── Patient Information ── */}
      <div className="rpt-card">
        <div className="rpt-card-head">👤 Patient Information</div>
        <div className="rpt-card-body">
          <div className="rpt-grid-3" style={{ marginBottom: 12 }}>
            <Field label="Full Name" value={r.name} />
            <Field label="Age" value={r.age ? `${r.age} years` : "—"} />
            <Field label="Gender" value={r.gender} />
          </div>
          <div className="rpt-grid-3" style={{ marginBottom: 12 }}>
            <Field label="UHID" value={r.uhid} />
            <Field label="Consultant" value={r.consultant} />
            <Field label="ID No." value={r.id_no} />
          </div>
          <div className="rpt-grid-2" style={{ marginBottom: 12 }}>
            <Field label="Insurance" value={r.insurance || "—"} />
          </div>
          <Field label="Address" value={r.address} />
        </div>
      </div>

      {/* ── Diagnosis ── */}
      <div className="rpt-card">
        <div className="rpt-card-head">🏥 Diagnosis</div>
        <div className="rpt-card-body">
          <div className="rpt-grid-2" style={{ marginBottom: 10 }}>
            <Field label="Date of First Dialysis" value={fmt(r.date_of_first_dialysis)} />
            <Field label="Date of Last Dialysis" value={fmt(r.date_of_last_dialysis)} />
          </div>
          <Field label="Primary Diagnosis" value={r.diagnosis} />
        </div>
      </div>

      {/* ── Blood Investigations ── */}
      {blood.length > 0 && (
        <div className="rpt-card">
          <div className="rpt-card-head">🧪 Blood Investigations</div>
          <div className="rpt-card-body">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th style={{ width: "55%" }}>Investigation</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {blood.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.test_name}</td>
                    <td>{b.result || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HD Sessions ── */}
      {hdSessions.length > 0 && (
        <div className="rpt-card">
          <div className="rpt-card-head">💉 HD Sessions Log</div>
          <div className="rpt-card-body">
            <div style={{ overflowX: "auto" }}>
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Date</th>
                    <th>BP Pre-HD</th>
                    <th>BP Post-HD</th>
                    <th>Weight Gain</th>
                    <th>UF Removed</th>
                    <th>Complications</th>
                  </tr>
                </thead>
                <tbody>
                  {hdSessions.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: "#0f766e", fontFamily: "'DM Mono',monospace" }}>{s.session_no}</td>
                      <td>{fmt(s.date)}</td>
                      <td>{s.bp_pre_hd || "—"}</td>
                      <td>{s.bp_post_hd || "—"}</td>
                      <td>{s.weight_gain || "—"}</td>
                      <td>{s.uf_removed || "—"}</td>
                      <td>{s.complications || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Complications ── */}
      {complications.length > 0 && (
        <div className="rpt-card">
          <div className="rpt-card-head">⚠️ Complications During HD</div>
          <div className="rpt-card-body">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Complication</th>
                  <th>Date</th>
                  <th>IV / Oral</th>
                  <th>Medications</th>
                </tr>
              </thead>
              <tbody>
                {complications.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.type || "—"}</td>
                    <td>{fmt(c.date)}</td>
                    <td>{c.medication_type || "—"}</td>
                    <td>{c.medications || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Condition on Discharge ── */}
      <div className="rpt-card">
        <div className="rpt-card-head">📝 Condition on Discharge</div>
        <div className="rpt-card-body">
          <p style={{ fontSize: 12.5, color: "#1e293b", lineHeight: 1.6 }}>{r.condition_on_discharge || "—"}</p>
        </div>
      </div>

      {/* ── Advice on Discharge ── */}
      {advice.length > 0 && (
        <div className="rpt-card">
          <div className="rpt-card-head">📋 Advice on Discharge</div>
          <div className="rpt-card-body">
            <ul className="rpt-advice-list">
              {advice.map((a, i) => (
                <li key={i}>{typeof a === "string" ? a : a.text || "—"}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Next HD Session ── */}
      <div className="rpt-card">
        <div className="rpt-card-head">📅 Next HD Session</div>
        <div className="rpt-card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>📆</span>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em" }}>Scheduled On</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f766e", marginTop: 2 }}>
                {fmt(r.next_hd_session_on?.$date || r.next_hd_session_on)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="rpt-footer">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ height: 42 }} />
          <div className="rpt-sig-line">Consultant Signature</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.consultant || ""}</div>
        </div>
      </div>

    </div>
  );
}

// ── tiny helper ──────────────────────────────────────
function Field({ label, value }) {
  return (
    <div className="rpt-field">
      <div className="rpt-field-label">{label}</div>
      <div className="rpt-field-value">{value || "—"}</div>
    </div>
  );
}