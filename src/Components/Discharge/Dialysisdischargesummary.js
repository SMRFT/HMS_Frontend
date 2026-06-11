import { useState } from "react";
import apiRequest from "../../Auth/apiRequest";
import {
  TODAY,
  buildDefaultBloodInvestigations,
  buildDefaultHdSessions,
  buildDefaultComplications,
  buildDefaultAdvice,
} from "./Dischargeconstants";


const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

export default function DialysisDischargeSummary() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    uhid: "",
    consultant: "",
    id_no: "",
    insurance: "",                    // ← after ID No
    address: "",
    diagnosis: "",
    date_of_first_dialysis: TODAY,    // ← after Diagnosis
    date_of_last_dialysis: TODAY,     // ← after Diagnosis
    blood_investigations: buildDefaultBloodInvestigations(),
    hd_sessions: buildDefaultHdSessions(),
    complications_during_hd: buildDefaultComplications(),
    condition_on_discharge: "",
    advice_on_discharge: buildDefaultAdvice(),
    next_hd_session_on: TODAY,
  });
 
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [uhidLoading, setUhidLoading] = useState(false);
  const [uhidError, setUhidError] = useState(null);

  // ── Toast helper defined first so all async functions can use it ──
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchPatientByUhid = async (uhidValue) => {
    if (!uhidValue.trim()) return;
    setUhidLoading(true);
    setUhidError(null);
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}dialysis_patient_details/?uhid=${encodeURIComponent(uhidValue.trim())}`,
        "GET"
      );
      // apiRequest wraps response: array lives at res.data.data  (same pattern as OPPharmacy)
      const resBody = res?.data || res;
      const list = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
        ? resBody
        : [];
      const patient = list[0] || null;
      if (!patient) {
        setUhidError("No patient found for this UHID.");
        return;
      }
      const fullName = [patient.salutation, patient.firstName, patient.lastName]
        .filter(Boolean)
        .join(" ");
      const consultantName =
        patient.billing?.find((b) => b.doctor_name)?.doctor_name || "";
      // Build address: deduplicate parts that repeat (e.g. permanent_address === city)
      const rawAddressParts = [
        patient.permanent_address,
        patient.area,
        patient.city,
        patient.state,
        patient.zipcode,
      ]
        .map((p) => (p ? String(p).trim() : ""))
        .filter(Boolean);

      // Drop a part if it is identical (case-insensitive) to the immediately preceding one
      const addressParts = rawAddressParts.filter(
        (part, idx, arr) =>
          idx === 0 || part.toLowerCase() !== arr[idx - 1].toLowerCase()
      );

      setForm((prev) => ({
        ...prev,
        name: fullName,
        age: (() => {
          if (patient.dob) {
            const today = new Date();
            const birth = new Date(patient.dob);
            let years = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
            return String(years);
          }
          return patient.age ? String(patient.age) : prev.age;
        })(),
        gender: patient.gender || prev.gender,
        uhid: patient.uhid || prev.uhid,
        consultant: consultantName || prev.consultant,
        insurance: patient.company_name || prev.insurance,
        address: addressParts.join(", "),
      }));
    } catch (err) {
      setUhidError(err?.message || "Failed to fetch patient details.");
    } finally {
      setUhidLoading(false);
    }
  };
 
  
  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));
 
  const updateBlood = (idx, val) => {
    const arr = [...form.blood_investigations];
    arr[idx] = { ...arr[idx], result: val };
    setField("blood_investigations", arr);
  };
 
  const updateHdSession = (idx, key, val) => {
    const arr = [...form.hd_sessions];
    arr[idx] = { ...arr[idx], [key]: val };
    setField("hd_sessions", arr);
  };
 
  const updateComplication = (idx, key, val) => {
    const arr = [...form.complications_during_hd];
    arr[idx] = { ...arr[idx], [key]: val };
    setField("complications_during_hd", arr);
  };
 
  const updateAdvice = (idx, val) => {
    const arr = [...form.advice_on_discharge];
    arr[idx] = { ...arr[idx], text: val };
    setField("advice_on_discharge", arr);
  };
 
  const handleSubmit = async () => {
    if (!form.name || !form.uhid || !form.next_hd_session_on) {
      showToast("Please fill in Name, UHID, and Next HD Session Date.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        // ── New date fields sent explicitly ──
        date_of_first_dialysis: form.date_of_first_dialysis || null,
        date_of_last_dialysis: form.date_of_last_dialysis || null,
        blood_investigations: form.blood_investigations.filter((b) => b.result.trim()),
        hd_sessions: form.hd_sessions.filter(
          (s) => s.bp_pre_hd || s.bp_post_hd || s.weight_gain || s.uf_removed || s.complications
        ),
        complications_during_hd: form.complications_during_hd.filter(
          (c) => c.medication_type || c.medications
        ),
        advice_on_discharge: form.advice_on_discharge.map((a) => a.text).filter(Boolean),
      };

      const res = await apiRequest(`${Hmsbaseurl}create_dialysis_discharge_summary/`, "POST", payload);

      // Show toast FIRST — before any state resets — so React doesn't
      // swallow the toast in the same batch as the form clear
      const successMsg =
        res?.data?.message ||
        res?.message ||
        "Discharge summary saved successfully.";

      showToast(successMsg, "success");

      // Reset form after toast is queued
      setTimeout(() => {
        setForm({
          name: "",
          age: "",
          gender: "",
          uhid: "",
          consultant: "",
          id_no: "",
          insurance: "",
          address: "",
          diagnosis: "",
          date_of_first_dialysis: TODAY,
          date_of_last_dialysis: TODAY,
          blood_investigations: buildDefaultBloodInvestigations(),
          hd_sessions: buildDefaultHdSessions(),
          complications_during_hd: buildDefaultComplications(),
          condition_on_discharge: "",
          advice_on_discharge: buildDefaultAdvice(),
          next_hd_session_on: TODAY,
        });
        setActiveSection(0);
      }, 300);
    } catch (err) {
      // Handle both Axios-style errors (err.response.data) and plain Error objects
      const errData = err?.response?.data || err?.data || {};
      const errMsg =
        errData?.message ||
        errData?.detail ||
        errData?.error ||
        err?.message ||
        "Failed to save. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };
 
  const sections = [
    "Patient Info",
    "Blood Investigations",
    "HD Sessions",
    "Complications",
    "Discharge",
  ];
 
  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f0f4f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dds-input {
          width: 100%;
          padding: 9px 12px;
          border: 1.5px solid #dde3ec;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: inherit;
          color: #1a2233;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .dds-input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.13);
        }
        .dds-input::placeholder { color: #aab4c4; }
        .dds-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7a99;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .section-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e4eaf4;
          box-shadow: 0 2px 12px rgba(30,60,120,0.05);
          overflow: hidden;
        }
        .section-header {
          background: linear-gradient(90deg, #0d5c56 0%, #0f766e 100%);
          color: #fff;
          padding: 16px 24px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-body { padding: 24px; }
        .nav-pill {
          padding: 7px 16px;
          border-radius: 20px;
          border: 1.5px solid #dde3ec;
          background: #fff;
          font-size: 12.5px;
          font-weight: 600;
          color: #6b7a99;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nav-pill.active {
          background: #0f766e;
          border-color: #0f766e;
          color: #fff;
          box-shadow: 0 2px 8px rgba(15,118,110,0.25);
        }
        .nav-pill:hover:not(.active) { border-color: #0f766e; color: #0f766e; }
        .hd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .hd-table th {
          background: #f0f4f8;
          color: #6b7a99;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 10px 8px;
          text-align: left;
          border-bottom: 2px solid #dde3ec;
        }
        .hd-table td { padding: 6px 4px; border-bottom: 1px solid #f0f4f8; vertical-align: middle; }
        .hd-table tr:last-child td { border-bottom: none; }
        .session-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f0fdfa;
          color: #0f766e;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          flex-shrink: 0;
        }
        .comp-row {
          display: grid;
          grid-template-columns: 190px 140px 96px 1fr;
          gap: 8px;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f5f7fb;
        }
        .comp-row:last-child { border-bottom: none; }
        .comp-type { font-size: 13px; font-weight: 500; color: #334155; }
        .blood-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 12px;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f5f7fb;
        }
        .blood-row:last-child { border-bottom: none; }
        .blood-name {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          font-family: 'DM Mono', monospace;
        }
        .advice-row {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: center;
          margin-bottom: 10px;
        }
        .advice-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f0fdfa;
          color: #0f766e;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .btn-submit {
          padding: 13px 32px;
          background: linear-gradient(90deg, #0d5c56, #0f766e);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.18s, transform 0.12s;
          box-shadow: 0 4px 14px rgba(15,118,110,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .toast {
          position: fixed;
          top: 28px;
          right: 28px;
          padding: 14px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: rgba(255,255,255,0.18);
        }
        .divider {
          border: none;
          border-top: 1.5px solid #f0f4f8;
          margin: 20px 0;
        }
        @media (max-width: 700px) {
          .grid-2, .grid-4 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr 1fr; }
          .comp-row { grid-template-columns: 1fr 1fr; }
          .blood-row { grid-template-columns: 1fr; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
 
      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #083830 0%, #0d5c56 50%, #0f766e 100%)", padding: "28px 32px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🩺</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>Nephrology Department</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>Dialysis Discharge Summary</h1>
            </div>
          </div>
        </div>
      </div>
 
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
 
        {/* ── Section Nav ── */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
          {sections.map((s, i) => (
            <button key={i} className={`nav-pill ${activeSection === i ? "active" : ""}`} onClick={() => setActiveSection(i)}>
              {i + 1}. {s}
            </button>
          ))}
        </div>
 
        {/* ══════════════════════════════════════════
            SECTION 0 — Patient Info
        ══════════════════════════════════════════ */}
        {activeSection === 0 && (
          <div className="section-card">
            <div className="section-header">
              <span>👤</span> Patient Information
              <span className="tag">Basic Details</span>
            </div>
            <div className="section-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
 
              {/* Row 1: UHID | Name | Age — all in one row */}
              <div className="grid-3">
                <div>
                  <label className="dds-label">UHID *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="dds-input"
                      placeholder="Type UHID and press Enter"
                      value={form.uhid}
                      onChange={(e) => { setField("uhid", e.target.value); setUhidError(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") fetchPatientByUhid(form.uhid); }}
                      style={{ paddingRight: uhidLoading ? 36 : 12 }}
                    />
                    {uhidLoading && (
                      <span style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        width: 14, height: 14, border: "2px solid #dde3ec", borderTopColor: "#0f766e",
                        borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite"
                      }} />
                    )}
                  </div>
                  {uhidError && (
                    <div style={{ marginTop: 5, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                      {uhidError}
                    </div>
                  )}
                  {!uhidError && !uhidLoading && form.name && (
                    <div style={{ marginTop: 5, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                      ✓ Patient loaded
                    </div>
                  )}
                </div>
                <div>
                  <label className="dds-label">Full Name *</label>
                  <input className="dds-input" placeholder="Patient full name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
                </div>
                <div>
                  <label className="dds-label">Age</label>
                  <input className="dds-input" type="number" min="0" max="150" placeholder="Auto from DOB" value={form.age} onChange={(e) => setField("age", e.target.value)} />
                </div>
              </div>

              {/* Row 2: Consultant | ID No | Insurance */}
              <div className="grid-3">
                <div>
                  <label className="dds-label">Consultant</label>
                  <input className="dds-input" placeholder="Doctor name" value={form.consultant} onChange={(e) => setField("consultant", e.target.value)} />
                </div>
                <div>
                  <label className="dds-label">ID No.</label>
                  <input className="dds-input" placeholder="ID number" value={form.id_no} onChange={(e) => setField("id_no", e.target.value)} />
                </div>
                <div>
                  <label className="dds-label">Insurance</label>
                  <input className="dds-input" placeholder="Insurance provider / policy" value={form.insurance} onChange={(e) => setField("insurance", e.target.value)} />
                </div>
              </div>
 
              {/* Row 3: Address */}
              <div>
                <label className="dds-label">Address</label>
                <textarea className="dds-input" rows={2} placeholder="Patient address" value={form.address} onChange={(e) => setField("address", e.target.value)} style={{ resize: "vertical" }} />
              </div>
 
              <hr className="divider" />
 
              {/* Row 4: Diagnosis */}
              <div>
                <label className="dds-label">Diagnosis</label>
                <textarea className="dds-input" rows={2} placeholder="Primary diagnosis" value={form.diagnosis} onChange={(e) => setField("diagnosis", e.target.value)} style={{ resize: "vertical" }} />
              </div>
 
              {/* Row 5: Date of First Dialysis | Date of Last Dialysis */}
              <div className="grid-2">
                <div>
                  <label className="dds-label">Date of First Dialysis</label>
                  <input
                    className="dds-input"
                    type="date"
                    value={form.date_of_first_dialysis}
                    onChange={(e) => setField("date_of_first_dialysis", e.target.value)}
                  />
                </div>
                <div>
                  <label className="dds-label">Date of Last Dialysis</label>
                  <input
                    className="dds-input"
                    type="date"
                    value={form.date_of_last_dialysis}
                    onChange={(e) => setField("date_of_last_dialysis", e.target.value)}
                  />
                </div>
              </div>
 
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════════
            SECTION 1 — Blood Investigations
        ══════════════════════════════════════════ */}
        {activeSection === 1 && (
          <div className="section-card">
            <div className="section-header">
              <span>🧪</span> Blood Investigations
              <span className="tag">Lab Results</span>
            </div>
            <div className="section-body">
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Enter result values for the following tests. Leave blank if not applicable.</p>
              {form.blood_investigations.map((b, i) => (
                <div className="blood-row" key={i}>
                  <div className="blood-name">{b.test_name}</div>
                  <input
                    className="dds-input"
                    placeholder="Enter result"
                    value={b.result}
                    onChange={(e) => updateBlood(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════════
            SECTION 2 — HD Sessions
        ══════════════════════════════════════════ */}
        {activeSection === 2 && (
          <div className="section-card">
            <div className="section-header">
              <span>💉</span> HD Sessions
              <span className="tag">Hemodialysis Log</span>
            </div>
            <div className="section-body" style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                All dates default to today. Rows with no clinical data will be excluded on submit.
              </p>
              <table className="hd-table">
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
                  {form.hd_sessions.map((s, i) => (
                    <tr key={i}>
                      <td><span className="session-badge">{s.session_no}</span></td>
                      <td>
                        <input
                          className="dds-input"
                          type="date"
                          value={s.date}
                          onChange={(e) => updateHdSession(i, "date", e.target.value)}
                          style={{ minWidth: 130 }}
                        />
                      </td>
                      <td><input className="dds-input" placeholder="140/90" value={s.bp_pre_hd} onChange={(e) => updateHdSession(i, "bp_pre_hd", e.target.value)} style={{ minWidth: 90 }} /></td>
                      <td><input className="dds-input" placeholder="130/80" value={s.bp_post_hd} onChange={(e) => updateHdSession(i, "bp_post_hd", e.target.value)} style={{ minWidth: 90 }} /></td>
                      <td><input className="dds-input" placeholder="2 kg" value={s.weight_gain} onChange={(e) => updateHdSession(i, "weight_gain", e.target.value)} style={{ minWidth: 80 }} /></td>
                      <td><input className="dds-input" placeholder="1.5 L" value={s.uf_removed} onChange={(e) => updateHdSession(i, "uf_removed", e.target.value)} style={{ minWidth: 80 }} /></td>
                      <td><input className="dds-input" placeholder="None" value={s.complications} onChange={(e) => updateHdSession(i, "complications", e.target.value)} style={{ minWidth: 110 }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════════
            SECTION 3 — Complications
        ══════════════════════════════════════════ */}
        {activeSection === 3 && (
          <div className="section-card">
            <div className="section-header">
              <span>⚠️</span> Complications During HD
              <span className="tag">If Any</span>
            </div>
            <div className="section-body">
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
                Dates default to today. Rows with no medication data will be excluded on submit.
              </p>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "190px 140px 96px 1fr", gap: 8, padding: "6px 0 10px", borderBottom: "2px solid #dde3ec", marginBottom: 6 }}>
                {["Complication", "Date", "IV / Oral", "Medications"].map((h) => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {form.complications_during_hd.map((c, i) => (
                <div className="comp-row" key={i}>
                  <div className="comp-type">
                    <span style={{ color: "#0f766e", marginRight: 6, fontFamily: "DM Mono", fontSize: 12 }}>{i + 1}.</span>
                    {c.type}
                  </div>
                  <input
                    className="dds-input"
                    type="date"
                    value={c.date}
                    onChange={(e) => updateComplication(i, "date", e.target.value)}
                  />
                  <input className="dds-input" placeholder="IV / Oral" value={c.medication_type} onChange={(e) => updateComplication(i, "medication_type", e.target.value)} />
                  <input className="dds-input" placeholder="Medication names" value={c.medications} onChange={(e) => updateComplication(i, "medications", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════════
            SECTION 4 — Discharge
        ══════════════════════════════════════════ */}
        {activeSection === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
 
            <div className="section-card">
              <div className="section-header"><span>🏥</span> Condition on Discharge</div>
              <div className="section-body">
                <textarea
                  className="dds-input"
                  rows={3}
                  placeholder="Describe patient's condition at the time of discharge..."
                  value={form.condition_on_discharge}
                  onChange={(e) => setField("condition_on_discharge", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
 
            <div className="section-card">
              <div className="section-header">
                <span>📋</span> Advice on Discharge
                <span className="tag">Up to 5 items</span>
              </div>
              <div className="section-body">
                {form.advice_on_discharge.map((a, i) => (
                  <div className="advice-row" key={i}>
                    <div className="advice-num">{i + 1}</div>
                    <input
                      className="dds-input"
                      placeholder={`Advice point ${i + 1}`}
                      value={a.text}
                      onChange={(e) => updateAdvice(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
 
            <div className="section-card">
              <div className="section-header"><span>📅</span> Next HD Session</div>
              <div className="section-body">
                <div style={{ maxWidth: 260 }}>
                  <label className="dds-label">Scheduled Date *</label>
                  <input
                    className="dds-input"
                    type="date"
                    value={form.next_hd_session_on}
                    onChange={(e) => setField("next_hd_session_on", e.target.value)}
                  />
                </div>
              </div>
            </div>
 
          </div>
        )}
 
        {/* ── Navigation + Submit ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, flexWrap: "wrap", gap: 12 }}>
          <button
            style={{ padding: "11px 22px", borderRadius: 9, border: "1.5px solid #dde3ec", background: "#fff", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "#6b7a99", cursor: activeSection === 0 ? "not-allowed" : "pointer", opacity: activeSection === 0 ? 0.4 : 1 }}
            onClick={() => setActiveSection((s) => Math.max(0, s - 1))}
            disabled={activeSection === 0}
          >
            ← Previous
          </button>
 
          <div style={{ display: "flex", gap: 10 }}>
            {activeSection < sections.length - 1 && (
              <button
                style={{ padding: "11px 22px", borderRadius: 9, border: "1.5px solid #0f766e", background: "#f0fdfa", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "#0f766e", cursor: "pointer" }}
                onClick={() => setActiveSection((s) => Math.min(sections.length - 1, s + 1))}
              >
                Next →
              </button>
            )}
            {activeSection === sections.length - 1 && (
              <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Saving...
                  </>
                ) : (
                  <> 💾 Save Summary</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
 
      {/* ── Toast ── */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : "#22c55e" }}>
          {toast.type === "error" ? "❌ " : "✅ "}{toast.message}
        </div>
      )}
    </div>
  );
}