import { useState } from "react";
import apiRequest from "../../Auth/apiRequest";
import { toast as rToast } from "react-toastify";
import {
  TODAY,
  buildDefaultBloodInvestigations,
  buildDefaultHdSessions,
  buildDefaultComplications,
  buildDefaultAdvice,
} from "./Dischargeconstants";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const initialFormState = () => ({
  name: "",
  age: "",
  gender: "",
  uhid: "",
  consultant: "",
  icd: "",
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
  advice_on_discharge: "",
  next_hd_session_on: TODAY,
});

export default function DialysisDischargeSummary() {
  const [form, setForm] = useState(initialFormState);
  const [customColumns, setCustomColumns] = useState([]);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [uhidLoading, setUhidLoading] = useState(false);
  const [uhidError, setUhidError] = useState(null);

  // ── Patient Selection Modal (Pharmacy billing style) ──
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientModalTitle, setPatientModalTitle] = useState("Select Patient");
  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientNamePhoneInput, setPatientNamePhoneInput] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);

  // ── Toast helper using react-toastify + local banner fallback ──
  const showToast = (message, type = "success") => {
    if (type === "error") {
      rToast.error(message);
    } else if (type === "warning") {
      rToast.warning(message);
    } else if (type === "info") {
      rToast.info(message);
    } else {
      rToast.success(message);
    }

    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const selectPatient = (patient, wasSavedToday = false) => {
    if (!patient) return;
    const fullName = [patient.salutation, patient.firstName, patient.lastName]
      .filter(Boolean)
      .join(" ");

    // Consultant from latest billing doctor or doctor field
    let consultantName = "";
    if (Array.isArray(patient.billing) && patient.billing.length > 0) {
      const withDoc = patient.billing.filter(b => b.doctor_name);
      if (withDoc.length > 0) {
        consultantName = withDoc[0].doctor_name;
      }
    }
    if (!consultantName) {
      consultantName = patient.consulting_doctor || patient.doctor_name || patient.consultant || "";
    }

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
      insurance: patient.company_name || patient.insurance || prev.insurance,
      address: addressParts.join(", "),
    }));

    if (wasSavedToday) {
      showToast("Note: A dialysis discharge summary has already been saved for this patient today.", "warning");
    }

    setUhidError(null);
    setShowPatientModal(false);
  };

  // Search patient by UHID (from form input or button)
  const handleSearchPatient = async (directUhidVal) => {
    const uhidVal = (directUhidVal !== undefined ? directUhidVal : form.uhid || "").trim();
    if (!uhidVal) {
      setPatientModalTitle("Search & Select Patient");
      setPatientSearchInput("");
      setPatientNamePhoneInput("");
      setPatientSearchResults([]);
      setShowPatientModal(true);
      return;
    }

    setUhidLoading(true);
    setUhidError(null);
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}dialysis_patient_details/?uhid=${encodeURIComponent(uhidVal)}`,
        "GET"
      );
      const resBody = res?.data || res;
      const list = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
        ? resBody
        : [];

      if (list.length === 0) {
        showToast(`No patient found for '${uhidVal}'.`, "warning");
        setPatientModalTitle(`Search Patient (No match for "${uhidVal}")`);
        setPatientSearchInput(uhidVal);
        setPatientNamePhoneInput("");
        setPatientSearchResults([]);
        setShowPatientModal(true);
      } else if (list.length === 1) {
        selectPatient(list[0], resBody?.already_saved_today);
        const pName = [list[0].salutation, list[0].firstName, list[0].lastName].filter(Boolean).join(" ");
        showToast(`Patient details loaded for ${pName || list[0].uhid}`, "success");
      } else {
        setPatientModalTitle(`Select Patient (${list.length} matches found)`);
        setPatientSearchInput(uhidVal);
        setPatientNamePhoneInput("");
        setPatientSearchResults(list);
        setShowPatientModal(true);
      }
    } catch (err) {
      console.error("Patient search failed:", err);
      showToast("Failed to search patient. Please try again.", "error");
      setUhidError(err?.message || "Failed to fetch patient details.");
    } finally {
      setUhidLoading(false);
    }
  };

  // Live search inside modal by UHID and/or Name/Phone
  const handleModalSearch = async (directUhid, directName) => {
    const uVal = (directUhid !== undefined ? directUhid : patientSearchInput).trim();
    const nVal = (directName !== undefined ? directName : patientNamePhoneInput).trim();

    if (!uVal && !nVal) {
      showToast("Please enter a UHID or name/phone to search.", "warning");
      return;
    }

    setPatientSearchLoading(true);
    try {
      const params = [];
      if (uVal) params.push(`uhid=${encodeURIComponent(uVal)}`);
      if (nVal) {
        params.push(`name=${encodeURIComponent(nVal)}`);
      }
      const url = `${Hmsbaseurl}dialysis_patient_details/?${params.join("&")}`;
      const res = await apiRequest(url, "GET");
      const resBody = res?.data || res;
      const list = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
        ? resBody
        : [];
      setPatientSearchResults(list);
      if (list.length === 0) {
        showToast("No patients found matching your search.", "info");
      }
    } catch (err) {
      console.error("Modal search failed:", err);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setPatientSearchLoading(false);
    }
  };

  // Backward compatibility wrapper
  const fetchPatientByUhid = (uhidVal) => handleSearchPatient(uhidVal);
 
  
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

  const addHdSession = () => {
    const romanNumerals = [
      "I", "II", "III", "IV", "V", "VI",
      "VII", "VIII", "IX", "X", "XI", "XII",
      "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
    ];
    const nextIndex = form.hd_sessions.length;
    const label = romanNumerals[nextIndex] || `S${nextIndex + 1}`;
    const newRow = {
      session_no: label,
      date: TODAY,
      bp_pre_hd: "",
      bp_post_hd: "",
      weight_gain: "",
      uf_removed: "",
      complications: "NIL",
      is_custom: true,
    };
    customColumns.forEach((col) => {
      newRow[col] = "";
    });
    setForm((prev) => ({
      ...prev,
      hd_sessions: [...prev.hd_sessions, newRow],
    }));
    showToast(`Session ${label} added.`, "info");
  };

  const removeHdSession = (idx) => {
    if (form.hd_sessions.length <= 1) {
      showToast("At least one session row is required.", "warning");
      return;
    }
    const label = form.hd_sessions[idx]?.session_no || `#${idx + 1}`;
    setForm((prev) => ({
      ...prev,
      hd_sessions: prev.hd_sessions.filter((_, i) => i !== idx),
    }));
    showToast(`Session ${label} removed.`, "info");
  };

  const addCustomColumn = (colName) => {
    const trimmed = (colName || "").trim();
    if (!trimmed) return;
    if (customColumns.includes(trimmed)) {
      showToast(`Field "${trimmed}" already exists.`, "warning");
      return;
    }
    setCustomColumns((prev) => [...prev, trimmed]);
    setForm((prev) => ({
      ...prev,
      hd_sessions: prev.hd_sessions.map((s) => ({
        ...s,
        [trimmed]: s[trimmed] !== undefined ? s[trimmed] : "",
      })),
    }));
    setNewColumnName("");
    setShowAddColumnModal(false);
    showToast(`Added field "${trimmed}" to HD Sessions.`, "success");
  };

  const removeCustomColumn = (colName) => {
    setCustomColumns((prev) => prev.filter((c) => c !== colName));
    setForm((prev) => ({
      ...prev,
      hd_sessions: prev.hd_sessions.map((s) => {
        const copy = { ...s };
        delete copy[colName];
        return copy;
      }),
    }));
    showToast(`Removed field "${colName}".`, "info");
  };

  const updateComplication = (idx, key, val) => {
    const arr = [...form.complications_during_hd];
    arr[idx] = { ...arr[idx], [key]: val };
    setField("complications_during_hd", arr);
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
        icd: form.icd || form.id_no || "",
        id_no: form.icd || form.id_no || "",
        // ── New date fields sent explicitly ──
        date_of_first_dialysis: form.date_of_first_dialysis || null,
        date_of_last_dialysis: form.date_of_last_dialysis || null,
        blood_investigations: form.blood_investigations.filter((b) => b.result.trim()),
        hd_sessions: form.hd_sessions.filter(
          (s) =>
            s.bp_pre_hd ||
            s.bp_post_hd ||
            s.weight_gain ||
            s.uf_removed ||
            (s.complications && s.complications !== "NIL") ||
            s.is_custom ||
            customColumns.some((col) => s[col])
        ),
        complications_during_hd: form.complications_during_hd.map((c) => ({
          type: c.type,
          date: c.date || TODAY,
          medication_type: c.medication_type || "NIL",
          medications: c.medications || "NIL",
        })),
        advice_on_discharge:
          typeof form.advice_on_discharge === "string"
            ? form.advice_on_discharge
            : Array.isArray(form.advice_on_discharge)
            ? form.advice_on_discharge
                .map((a) => (typeof a === "object" ? a.text : a))
                .filter(Boolean)
                .join("\n")
            : "",
      };

      const res = await apiRequest(`${Hmsbaseurl}create_dialysis_discharge_summary/`, "POST", payload);
      console.log("API RESPONSE:", res);

      const backendSuccess = Boolean(
        res?.data?.success !== undefined ? res.data.success : res?.success
      );
      const backendMessage =
        res?.data?.message ||
        res?.error ||
        res?.message ||
        (backendSuccess ? "Discharge summary saved successfully." : "Failed to save. Please try again.");

      if (!backendSuccess) {
        showToast(backendMessage, "error");
        setLoading(false);
        return;
      }

      showToast(backendMessage, "success");

      // Clear all fields on success
      setForm(initialFormState());
      setActiveSection(0);
      setUhidError(null);
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
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <input
                      className="dds-input"
                      placeholder="e.g. 6459 or S026/006459"
                      value={form.uhid}
                      onChange={(e) => { setField("uhid", e.target.value); setUhidError(null); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchPatient(form.uhid);
                        }
                      }}
                      style={{
                        borderRadius: "8px 0 0 8px",
                        borderRight: "none",
                        flex: 1
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchPatient(form.uhid)}
                      disabled={uhidLoading}
                      title="Search patient by UHID (Press Enter)"
                      style={{
                        padding: "0 14px",
                        background: "linear-gradient(135deg, #0f766e, #0d9488)",
                        color: "#fff",
                        border: "1.5px solid #0f766e",
                        borderRadius: "0 8px 8px 0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                        transition: "opacity 0.2s"
                      }}
                    >
                      {uhidLoading ? (
                        <span style={{
                          width: 14, height: 14, border: "2px solid #ffffff", borderTopColor: "transparent",
                          borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite"
                        }} />
                      ) : (
                        "🔍"
                      )}
                    </button>
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

              {/* Row 2: Consultant | ICD | Insurance */}
              <div className="grid-3">
                <div>
                  <label className="dds-label">Consultant</label>
                  <input className="dds-input" placeholder="Doctor name" value={form.consultant} onChange={(e) => setField("consultant", e.target.value)} />
                </div>
                <div>
                  <label className="dds-label">ICD</label>
                  <input
                    className="dds-input"
                    placeholder="ICD / Diagnosis Code"
                    value={form.icd || form.id_no}
                    onChange={(e) => {
                      setField("icd", e.target.value);
                      setField("id_no", e.target.value);
                    }}
                  />
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
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>💉</span> HD Sessions
                <span className="tag">Hemodialysis Log</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(true)}
                  style={{
                    background: "#0d9488",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  ➕ Add Column / Field
                </button>
                <button
                  type="button"
                  onClick={addHdSession}
                  style={{
                    background: "#0f766e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  ➕ Add Session Row
                </button>
              </div>
            </div>
            <div className="section-body" style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                All dates default to today. Complications default to NIL (editable). Click <strong>"Add Session Row"</strong> to add more sessions or <strong>"Add Column / Field"</strong> to add custom parameters.
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
                    {customColumns.map((col) => (
                      <th key={col}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <span>{col}</span>
                          <span
                            onClick={() => removeCustomColumn(col)}
                            style={{ cursor: "pointer", color: "#f87171", fontSize: 14, fontWeight: "bold" }}
                            title={`Remove ${col} column`}
                          >
                            ×
                          </span>
                        </div>
                      </th>
                    ))}
                    <th style={{ width: 44, textAlign: "center" }}>Act</th>
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
                      <td><input className="dds-input" placeholder="NIL" value={s.complications} onChange={(e) => updateHdSession(i, "complications", e.target.value)} style={{ minWidth: 110 }} /></td>
                      {customColumns.map((col) => (
                        <td key={col}>
                          <input
                            className="dds-input"
                            placeholder={col}
                            value={s[col] || ""}
                            onChange={(e) => updateHdSession(i, col, e.target.value)}
                            style={{ minWidth: 95 }}
                          />
                        </td>
                      ))}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => removeHdSession(i)}
                          title="Delete Session Row"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: "2px 6px"
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={addHdSession}
                  style={{
                    background: "#f1f5f9",
                    color: "#0f766e",
                    border: "1px dashed #0d9488",
                    borderRadius: 6,
                    padding: "8px 16px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  ➕ Add Another Session Row
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(true)}
                  style={{
                    background: "#f1f5f9",
                    color: "#0d9488",
                    border: "1px dashed #0d9488",
                    borderRadius: 6,
                    padding: "8px 16px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  ➕ Add Custom Column / Field
                </button>
              </div>

              {/* Inline Prompt for Add Column / Field */}
              {showAddColumnModal && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 16,
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    maxWidth: 520
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#166534" }}>
                    Add Dynamic Column to HD Sessions
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="dds-input"
                      placeholder="e.g. Duration, Heparin, Dialyzer, BFR..."
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomColumn(newColumnName);
                        }
                      }}
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => addCustomColumn(newColumnName)}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontWeight: 600,
                        fontSize: 12.5,
                        cursor: "pointer"
                      }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddColumnModal(false);
                        setNewColumnName("");
                      }}
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12.5,
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {/* Quick suggestion pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>Quick suggestions:</span>
                    {["Duration (hrs)", "Heparin", "Dialyzer", "BFR (ml/min)", "Dialysate Flow", "Access"].map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => addCustomColumn(sugg)}
                        style={{
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          borderRadius: 12,
                          padding: "2px 8px",
                          fontSize: 11,
                          color: "#0f766e",
                          cursor: "pointer"
                        }}
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="section-header"><span>📋</span> Advice on Discharge</div>
              <div className="section-body">
                <textarea
                  className="dds-input"
                  rows={3}
                  placeholder="Describe advice on discharge, medications, fluid restriction, follow-up, etc..."
                  value={form.advice_on_discharge}
                  onChange={(e) => setField("advice_on_discharge", e.target.value)}
                  style={{ resize: "vertical" }}
                />
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
 
      {/* ── Patient Selection Modal (Pharmacy billing style) ── */}
      {showPatientModal && (
        <div
          onClick={() => setShowPatientModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 12,
              width: "95%",
              maxWidth: 960,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>👤</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a", fontWeight: 700 }}>
                  {patientModalTitle || "Select Patient"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.4rem",
                  color: "#94a3b8",
                  cursor: "pointer",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {/* Search Bar inside Modal */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>UHID (Last numbers or /)</label>
                  <input
                    className="dds-input"
                    type="text"
                    placeholder="e.g. 6459 or /006459"
                    value={patientSearchInput}
                    onChange={(e) => setPatientSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleModalSearch()}
                    autoFocus
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Name / Phone</label>
                  <input
                    className="dds-input"
                    type="text"
                    placeholder="Name or phone"
                    value={patientNamePhoneInput}
                    onChange={(e) => setPatientNamePhoneInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleModalSearch()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleModalSearch()}
                  disabled={patientSearchLoading}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #0f766e, #0d9488)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  🔍 Search
                </button>
              </div>

              {/* Patient Results Table */}
              {patientSearchLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Searching patient records...
                </div>
              ) : patientSearchResults.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  No patients found. Try entering the last digits of UHID or patient name above.
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 10, fontWeight: 600 }}>
                    Showing {patientSearchResults.length} matching patient(s) — Click a row to select:
                  </div>
                  <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "10px 12px", width: 60, textAlign: "center", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Action</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>UHID</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Patient Name</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Age / Gender</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Mobile</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Doctor / Consultant</th>
                          <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientSearchResults.map((p, idx) => {
                          const fullName = [p.salutation, p.firstName, p.lastName].filter(Boolean).join(" ");
                          const mobile = p.mobilePhone || p.mobile || p.phone || "—";
                          const doc = p.billing?.find((b) => b.doctor_name)?.doctor_name || p.doctor_name || p.consultant || "—";
                          const ageDisplay = p.dob ? (() => {
                            const today = new Date();
                            const birth = new Date(p.dob);
                            let y = today.getFullYear() - birth.getFullYear();
                            const m = today.getMonth() - birth.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) y--;
                            return `${y} Y`;
                          })() : (p.age ? `${p.age} Y` : "—");

                          return (
                            <tr
                              key={p.id || idx}
                              onClick={() => selectPatient(p)}
                              style={{
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                transition: "background 0.15s"
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdfa")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectPatient(p);
                                  }}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "#0f766e",
                                    color: "#fff",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700
                                  }}
                                  title="Select Patient"
                                >
                                  ✓
                                </button>
                              </td>
                              <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0f766e" }}>{p.uhid}</td>
                              <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{fullName || "—"}</td>
                              <td style={{ padding: "10px 12px", color: "#475569" }}>{ageDisplay} / {p.gender || "—"}</td>
                              <td style={{ padding: "10px 12px", color: "#475569" }}>{mobile}</td>
                              <td style={{ padding: "10px 12px", color: "#475569" }}>{doc}</td>
                              <td style={{ padding: "10px 12px", color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {[p.area, p.city].filter(Boolean).join(", ") || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc"
              }}
            >
              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : toast.type === "warning" ? "#f59e0b" : "#22c55e" }}>
          {toast.type === "error" ? "❌ " : toast.type === "warning" ? "⚠️ " : "✅ "}{toast.message}
        </div>
      )}
    </div>
  );
}