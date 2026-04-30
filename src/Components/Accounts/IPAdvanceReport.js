import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "/api/admission-advance";

const AUTH_HEADERS = {
  "Content-Type": "application/json",
  "auth-hospital-code": "SH001",
  "auth-branch-code": "SHB001",
  "Outlet-Code": "OLET003",
  "auth-user-id": "50887",
};

// ─── DUMMY SEED DATA (used when API is unavailable / dev mode) ───────────────
const DUMMY_DATA = [
  {
    advance_id: "ADV1",
    bill_no: "2627/000001",
    date: "2026-04-28",
    bill_date: "2026-04-28T07:13:51.233436+00:00",
    advance_amount: 65000,
    ip_advance: 40000,
    billing_advance: 25000,
    is_advanceActive: true,
    status: "Paid",
    created_by: "50887",
    created_date: "2026-04-28T07:13:51.233436+00:00",
    payment_details: { method: "cash", Paid_amount: 65000 },
    cashier_id: "50886",
    paid_datetime: "2026-04-28T07:32:45.944Z",
    shiftno: "2627/000006",
    ip_number: "S026/500007",
    uhid: "S026/0006",
    patient_name: "Mr. Ravi Kumar",
    payment_mode: "cash",
    paid_date: "2026-04-28T07:32:45.944Z",
  },
  {
    advance_id: "ADV2",
    bill_no: "2627/000002",
    date: "2026-04-29",
    bill_date: "2026-04-29T09:00:00.000Z",
    advance_amount: 20000,
    ip_advance: 20000,
    billing_advance: 0,
    is_advanceActive: true,
    status: "Pending",
    created_by: "50887",
    created_date: "2026-04-29T09:00:00.000Z",
    payment_details: { method: "upi", Paid_amount: 20000 },
    cashier_id: null,
    paid_datetime: null,
    shiftno: "2627/000007",
    ip_number: "S026/500007",
    uhid: "S026/0006",
    patient_name: "Mr. Ravi Kumar",
    payment_mode: "upi",
    paid_date: null,
  },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n != null
    ? "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
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

const STATUS_STYLES = {
  Paid: {
    bg: "#e6f9f0",
    color: "#1a7a4a",
    border: "#b3e6cc",
  },
  Pending: {
    bg: "#fff8e6",
    color: "#8a5c00",
    border: "#ffd980",
  },
  Cancelled: {
    bg: "#fdecea",
    color: "#b71c1c",
    border: "#f5c6c6",
  },
  Edited: {
    bg: "#f0f0f0",
    color: "#555",
    border: "#ccc",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Edited;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "28px 32px",
          minWidth: 400,
          maxWidth: 520,
          width: "95%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a2340" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#888",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d4d8e2",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
  color: "#1a2340",
  background: "#f9fafc",
  boxSizing: "border-box",
  outline: "none",
};

// ─── ADVANCE FORM MODAL ───────────────────────────────────────────────────────
function AdvanceFormModal({ mode, entry, ipNumber, onClose, onSuccess }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    advance_amount: isEdit ? entry?.advance_amount ?? "" : "",
    ip_advance: isEdit ? entry?.ip_advance ?? "" : "",
    billing_advance: isEdit ? entry?.billing_advance ?? "" : "",
    payment_method: isEdit
      ? entry?.payment_details?.method ?? "cash"
      : "cash",
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.advance_amount) {
      setError("Advance amount is required.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        advance_amount: parseFloat(form.advance_amount),
        ip_advance: parseFloat(form.ip_advance || 0),
        billing_advance: parseFloat(form.billing_advance || 0),
        payment_method: form.payment_method,
        date: form.date,
      };
      if (isEdit) body.advance_id = entry.advance_id;

      const res = await fetch(`${API_BASE}/${ipNumber}/`, {
        method: isEdit ? "PUT" : "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Advance" : "New Advance"} onClose={onClose}>
      <Field label="Total Advance Amount (₹)">
        <input
          style={inputStyle}
          type="number"
          value={form.advance_amount}
          onChange={handleChange("advance_amount")}
          placeholder="e.g. 50000"
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="IP Advance (₹)">
          <input
            style={inputStyle}
            type="number"
            value={form.ip_advance}
            onChange={handleChange("ip_advance")}
            placeholder="0"
          />
        </Field>
        <Field label="Billing Advance (₹)">
          <input
            style={inputStyle}
            type="number"
            value={form.billing_advance}
            onChange={handleChange("billing_advance")}
            placeholder="0"
          />
        </Field>
      </div>
      <Field label="Payment Method">
        <select
          style={inputStyle}
          value={form.payment_method}
          onChange={handleChange("payment_method")}
        >
          {["cash", "upi", "card", "neft", "cheque"].map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input
          style={inputStyle}
          type="date"
          value={form.date}
          onChange={handleChange("date")}
        />
      </Field>
      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 20px",
            border: "1px solid #d4d8e2",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
            color: "#555",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "8px 22px",
            border: "none",
            borderRadius: 8,
            background: loading ? "#8ba3c7" : "#1a4fa8",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {loading ? "Saving…" : isEdit ? "Update" : "Save Advance"}
        </button>
      </div>
    </Modal>
  );
}

// ─── CANCEL CONFIRM MODAL ─────────────────────────────────────────────────────
function CancelModal({ entry, ipNumber, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/${ipNumber}/`, {
        method: "PATCH",
        headers: AUTH_HEADERS,
        body: JSON.stringify({ advance_id: entry.advance_id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Cancel Advance" onClose={onClose}>
      <p style={{ fontSize: 14, color: "#333", marginBottom: 8 }}>
        Are you sure you want to cancel advance{" "}
        <strong>{entry.advance_id}</strong> — Bill No.{" "}
        <strong>{entry.bill_no}</strong>?
      </p>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        Amount: <strong>{fmt(entry.advance_amount)}</strong>. This action cannot
        be undone.
      </p>
      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 20px",
            border: "1px solid #d4d8e2",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Go Back
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: "8px 22px",
            border: "none",
            borderRadius: 8,
            background: loading ? "#e8a0a0" : "#c0392b",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {loading ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </Modal>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IPAdvanceReport() {
  // Filter state
  const [filterMode, setFilterMode] = useState("ip"); // "ip" | "uhid" | "date"
  const [ipNumber, setIpNumber] = useState("S026/500007");
  const [uhid, setUhid] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Modal control
  const [modal, setModal] = useState(null); // null | { type, entry? }

  // Summary
  const total = data.reduce((s, p) => s + (p.advance_amount || 0), 0);
  const totalIP = data.reduce((s, p) => s + (p.ip_advance || 0), 0);
  const totalBilling = data.reduce((s, p) => s + (p.billing_advance || 0), 0);
  const paid = data.filter((p) => p.status === "Paid").length;
  const pending = data.filter((p) => p.status === "Pending").length;

  const activeIpNumber =
    data.length > 0 ? data[0].ip_number : ipNumber;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let params = new URLSearchParams();
      if (filterMode === "ip" && ipNumber) params.set("ip_number", ipNumber);
      else if (filterMode === "uhid" && uhid) params.set("uhid", uhid);
      else if (filterMode === "date" && fromDate && toDate) {
        params.set("from_date", fromDate);
        params.set("to_date", toDate);
      }

      const res = await fetch(`${API_BASE}/?${params}`, { headers: AUTH_HEADERS });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "API error");
      setData(json.data || []);
    } catch (e) {
      // Fallback to dummy data in dev
      console.warn("API unavailable, using dummy data:", e.message);
      setData(DUMMY_DATA);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [filterMode, ipNumber, uhid, fromDate, toDate]);

  // Auto-load on first render with default IP
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const closeModal = () => setModal(null);
  const handleSuccess = () => {
    closeModal();
    fetchData();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f3f9",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* ── Header bar ── */}
      <div
        style={{
          background: "#0f2557",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 58,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#1a4fa8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏥
          </span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            Shanmuga Hospital
          </span>
          <span
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.2)",
              margin: "0 4px",
            }}
          />
          <span style={{ color: "#93b4e0", fontSize: 13 }}>
            IP Advance Report
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#c8d8f0",
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            SH001 · SHB001 · OLET003
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
        {/* ── Search Panel ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "ip", label: "By IP Number" },
              { key: "uhid", label: "By UHID" },
              { key: "date", label: "By Date Range" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setFilterMode(m.key)}
                style={{
                  padding: "6px 16px",
                  border:
                    filterMode === m.key
                      ? "2px solid #1a4fa8"
                      : "1px solid #d4d8e2",
                  borderRadius: 8,
                  background: filterMode === m.key ? "#eaf0ff" : "#fff",
                  color: filterMode === m.key ? "#1a4fa8" : "#666",
                  fontWeight: filterMode === m.key ? 700 : 400,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            {filterMode === "ip" && (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  IP Number
                </label>
                <input
                  style={{ ...inputStyle, background: "#fff" }}
                  value={ipNumber}
                  onChange={(e) => setIpNumber(e.target.value)}
                  placeholder="e.g. S026/500007"
                />
              </div>
            )}
            {filterMode === "uhid" && (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  UHID
                </label>
                <input
                  style={{ ...inputStyle, background: "#fff" }}
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                  placeholder="e.g. S026/0006"
                />
              </div>
            )}
            {filterMode === "date" && (
              <>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    From Date
                  </label>
                  <input
                    style={{ ...inputStyle, background: "#fff" }}
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    To Date
                  </label>
                  <input
                    style={{ ...inputStyle, background: "#fff" }}
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <button
              onClick={fetchData}
              style={{
                padding: "9px 24px",
                background: "#1a4fa8",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                height: 38,
              }}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {error && (
            <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{error}</p>
          )}
        </div>

        {/* ── Summary Cards ── */}
        {searched && data.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { label: "Total Advance", value: fmt(total), accent: "#1a4fa8" },
                { label: "IP Advance", value: fmt(totalIP), accent: "#0f7d55" },
                { label: "Billing Advance", value: fmt(totalBilling), accent: "#7c3aed" },
                { label: "Paid", value: paid, accent: "#1a7a4a" },
                { label: "Pending", value: pending, accent: "#8a5c00" },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "14px 18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    borderLeft: `4px solid ${c.accent}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#888",
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                    }}
                  >
                    {c.label}
                  </p>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      margin: 0,
                      color: c.accent,
                    }}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Patient Info bar ── */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Patient</span>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#1a2340" }}>
                  {data[0]?.patient_name || "—"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>UHID</span>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "#1a4fa8" }}>{data[0]?.uhid || "—"}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>IP Number</span>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "#1a4fa8" }}>{data[0]?.ip_number || "—"}</p>
              </div>
              <button
                onClick={() => setModal({ type: "create" })}
                style={{
                  padding: "8px 18px",
                  background: "#0f7d55",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                + New Advance
              </button>
            </div>

            {/* ── Table ── */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f4f6fb" }}>
                      {[
                        "Advance ID",
                        "Bill No.",
                        "Date",
                        "Total Amount",
                        "IP Advance",
                        "Billing Advance",
                        "Method",
                        "Shift No.",
                        "Paid At",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 14px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "#4a5568",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            borderBottom: "1px solid #e8eaf2",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={row.advance_id + i}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#fafbfd",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#eef3ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0 ? "#fff" : "#fafbfd")
                        }
                      >
                        <td style={tdStyle}>{row.advance_id}</td>
                        <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>
                          {row.bill_no}
                        </td>
                        <td style={tdStyle}>
                          {row.date
                            ? new Date(row.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#1a2340" }}>
                          {fmt(row.advance_amount)}
                        </td>
                        <td style={tdStyle}>{fmt(row.ip_advance)}</td>
                        <td style={tdStyle}>{fmt(row.billing_advance)}</td>
                        <td style={{ ...tdStyle, textTransform: "uppercase" }}>
                          {row.payment_mode || "—"}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>
                          {row.shiftno || "—"}
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {fmtDate(row.paid_date)}
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {row.status === "Pending" && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() =>
                                  setModal({ type: "edit", entry: row })
                                }
                                style={actionBtn("#1a4fa8")}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setModal({ type: "cancel", entry: row })
                                }
                                style={actionBtn("#c0392b")}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {row.status !== "Pending" && (
                            <span style={{ color: "#aaa", fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid #e8eaf2",
                  fontSize: 12,
                  color: "#888",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{data.length} record{data.length !== 1 ? "s" : ""}</span>
                <span>
                  Last updated: {new Date().toLocaleTimeString("en-IN")}
                </span>
              </div>
            </div>
          </>
        )}

        {searched && data.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#888",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>
              No advance payments found
            </p>
            <p style={{ fontSize: 13 }}>Try a different IP number or date range.</p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === "create" && (
        <AdvanceFormModal
          mode="create"
          ipNumber={activeIpNumber}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modal?.type === "edit" && (
        <AdvanceFormModal
          mode="edit"
          entry={modal.entry}
          ipNumber={modal.entry.ip_number}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modal?.type === "cancel" && (
        <CancelModal
          entry={modal.entry}
          ipNumber={modal.entry.ip_number}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

const tdStyle = {
  padding: "10px 14px",
  borderBottom: "1px solid #f0f2f8",
  color: "#2d3a4e",
  verticalAlign: "middle",
};

const actionBtn = (bg) => ({
  padding: "4px 12px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
});