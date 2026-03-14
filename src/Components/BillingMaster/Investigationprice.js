import React, { useState, useEffect } from "react";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  Container,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";

/* ─── Design tokens ─────────────────────────────────────────────────── */
const tokens = {
  navy: "#0d9488",
  slate: "#1E2D45",
  sky: "#2563EB",
  teal: "#0EA5E9",
  green: "#10B981",
  red: "#EF4444",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F172A",
  textSm: "#475569",
  amber: "#F59E0B",
};

/* ─── Styles ─────────────────────────────────────────────────────────── */
const css = {
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: tokens.navy,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
    display: "inline-block",
  },
  dateBadge: {
    background: tokens.slate,
    color: tokens.white,
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
  },
  card: {
    background: tokens.card,
    borderRadius: 16,
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 4px 24px rgba(10,22,40,.07)",
    marginBottom: 24,
    padding: "24px 28px",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: tokens.sky,
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${tokens.sky}, ${tokens.teal})`,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px 18px",
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 5 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: tokens.muted,
  },
  input: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    transition: "border-color .2s",
  },
  select: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btn: (variant = "primary") => {
    const map = {
      primary: {
        bg: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
        color: tokens.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${tokens.red}, #F87171)`,
        color: tokens.white,
      },
      success: {
        bg: `linear-gradient(135deg, ${tokens.green}, #34D399)`,
        color: tokens.white,
      },
      ghost: { bg: tokens.slate, color: tokens.white },
      amber: {
        bg: `linear-gradient(135deg, ${tokens.amber}, #FCD34D)`,
        color: tokens.white,
      },
    };
    const v = map[variant] || map.primary;
    return {
      padding: "8px 18px",
      fontSize: 13,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: "none",
      borderRadius: 9,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,.12)",
      transition: "opacity .15s",
    };
  },
  smallBtn: (variant = "primary") => {
    const map = {
      primary: {
        bg: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
        color: tokens.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${tokens.red}, #F87171)`,
        color: tokens.white,
      },
      ghost: { bg: tokens.slate, color: tokens.white },
    };
    const v = map[variant] || map.primary;
    return {
      padding: "4px 12px",
      fontSize: 12,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
    };
  },
  tableHeader: {
    padding: "16px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    fontSize: 15,
    fontWeight: 700,
    color: tokens.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterBar: {
    padding: "14px 20px",
    background: tokens.bg,
    borderBottom: `1px solid ${tokens.border}`,
  },
  statusBadge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: active ? `${tokens.green}18` : `${tokens.red}18`,
    color: active ? tokens.green : tokens.red,
    border: `1px solid ${active ? tokens.green : tokens.red}40`,
  }),
  statusDot: (active) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: active ? tokens.green : tokens.red,
  }),
  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: `${tokens.sky}18`,
    color: tokens.sky,
    border: `1px solid ${tokens.sky}40`,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,22,40,.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    background: tokens.white,
    borderRadius: 16,
    width: "min(720px, 96vw)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(10,22,40,.25)",
    overflow: "hidden",
  },
  modalHead: {
    padding: "18px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: tokens.white },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,.15)",
    border: "none",
    color: tokens.white,
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { padding: "24px", overflowY: "auto", flexGrow: 1 },
  modalFoot: {
    padding: "14px 20px",
    borderTop: `1px solid ${tokens.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexShrink: 0,
  },

  // Items builder
  itemsArea: { marginTop: 16 },
  itemsLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: tokens.muted,
    marginBottom: 10,
    display: "block",
  },
  itemTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px 5px 12px",
    borderRadius: 20,
    background: `${tokens.sky}12`,
    border: `1px solid ${tokens.sky}30`,
    fontSize: 13,
    fontWeight: 500,
    color: tokens.sky,
    margin: "4px",
  },
  itemTagRemove: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: `${tokens.sky}20`,
    border: "none",
    color: tokens.sky,
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  itemAddRow: { display: "flex", gap: 8, marginTop: 10 },
  itemInput: {
    flex: 1,
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    fontFamily: "inherit",
  },
  addTagBtn: {
    padding: "0 16px",
    height: 36,
    fontSize: 13,
    fontWeight: 600,
    background: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
    color: tokens.white,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  tagsWrap: {
    display: "flex",
    flexWrap: "wrap",
    minHeight: 40,
    padding: "6px",
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 10,
    background: tokens.bg,
    marginTop: 6,
  },
  emptyTags: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    color: tokens.muted,
    padding: "8px 0",
  },

  // View modal items list
  itemListRow: {
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.border}`,
    fontSize: 13,
    color: tokens.text,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: tokens.sky,
    flexShrink: 0,
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={css.fieldWrap}>
    <span style={css.label}>{label}</span>
    {children}
  </div>
);

const Inp = ({ style, ...props }) => (
  <input
    style={{ ...css.input, ...style }}
    onFocus={(e) => (e.target.style.borderColor = tokens.sky)}
    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
    {...props}
  />
);

const EMPTY_FORM = { BillType: "", billTypeNo: "", is_active: true, Items: [] };

/* ════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════ */
const InvestigationPrice = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [filters, setFilters] = useState({ search: "", is_active: "" });

  /* ── Fetch ── */
  const fetchRecords = async (params = {}) => {
    setLoading(true);
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    if (params.is_active) q.append("is_active", params.is_active);
    const url = `${HMSURL}investigation-prices_get/${q.toString() ? "?" + q.toString() : ""}`;
    const result = await apiRequest(url, "GET");
    if (result.success) {
      const data = result.data;
      // Handle both { records: [] } and { billTypes: [] } response shapes
      const raw = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.billTypes)
          ? data.billTypes
          : Array.isArray(data)
            ? data
            : [];
      // Strip extraKeys wrapper — CRUD page only needs itemName
      const normalized = raw.map((rec) => ({
        ...rec,
        Items: Array.isArray(rec.Items)
          ? rec.Items.map((i) => ({ itemName: i.itemName || "" }))
          : [],
      }));
      setRecords(normalized);
    } else {
      console.error("Fetch failed:", result.error);
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ── Items tag management ── */
  const addItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    if (
      formData.Items.some(
        (i) => i.itemName.toLowerCase() === name.toLowerCase(),
      )
    ) {
      alert("Item already added.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      Items: [...prev.Items, { itemName: name }],
    }));
    setNewItemName("");
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      Items: prev.Items.filter((_, i) => i !== index),
    }));
  };

  /* ── Reset ── */
  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setIsEditMode(false);
    setEditingId(null);
    setNewItemName("");
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!formData.BillType.trim()) {
      alert("Bill Type is required.");
      return;
    }
    if (!formData.billTypeNo.trim()) {
      alert("Bill Type No is required.");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}investigation-prices/create/`,
      "POST",
      formData,
    );
    if (result.success) {
      alert("Created successfully!");
      setShowModal(false);
      fetchRecords(filters);
    } else alert(result.error || "Failed to create.");
  };

  /* ── Edit ── */
  const handleEdit = (rec) => {
    setFormData({
      BillType: rec.BillType || "",
      billTypeNo: rec.billTypeNo || "",
      is_active: rec.is_active !== false,
      Items: Array.isArray(rec.Items)
        ? rec.Items.map((i) => ({ itemName: i.itemName || "" }))
        : [],
    });
    setEditingId(rec.billTypeNo); // use billTypeNo as the URL param
    setIsEditMode(true);
    setNewItemName("");
    setShowModal(true);
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!formData.BillType.trim()) {
      alert("Bill Type is required.");
      return;
    }
    if (!formData.billTypeNo.trim()) {
      alert("Bill Type No is required.");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}investigation-prices/update/${editingId}/`,
      "PATCH",
      formData,
    );
    if (result.success) {
      alert("Updated successfully!");
      setShowModal(false);
      fetchRecords(filters);
    } else alert(result.error || "Failed to update.");
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    const result = await apiRequest(
      `${HMSURL}investigation-prices/delete/${id}/`,
      "PATCH",
    );
    if (result.success) {
      alert("Deleted successfully.");
      fetchRecords(filters);
    } else alert("Error: " + result.error);
  };

  /* ── Filters ── */
  const applyFilters = () => fetchRecords(filters);
  const clearFilters = () => {
    setFilters({ search: "", is_active: "" });
    fetchRecords();
  };

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <PageWrapper>
      <Container>
        {/* Page header */}
        <div style={css.pageHeader}>
          <h1 style={css.pageTitle}>
            <span style={css.titleDot} />
            Investigation Price Management
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={css.dateBadge}>📅 {currentDate}</div>
            <button style={css.btn("primary")} onClick={openCreate}>
              + New Bill Type
            </button>
          </div>
        </div>

        {/* Table */}
        <TableWrapper>
          <div style={css.tableHeader}>
            <span>🔬 Investigation Prices</span>
            <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filter bar */}
          <div style={css.filterBar}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr auto auto",
                gap: "10px 12px",
                alignItems: "end",
              }}
            >
              <div style={css.fieldWrap}>
                <span style={{ ...css.label, color: tokens.sky }}>
                  🔍 Search
                </span>
                <input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  placeholder="Bill Type or Bill Type No…"
                  style={{ ...css.input, height: 34, fontSize: 12 }}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div style={css.fieldWrap}>
                <span style={{ ...css.label, color: tokens.sky }}>Status</span>
                <select
                  value={filters.is_active}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, is_active: e.target.value }))
                  }
                  style={{ ...css.select, height: 34, fontSize: 12 }}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={applyFilters}
                  style={{
                    ...css.btn("primary"),
                    height: 34,
                    padding: "0 18px",
                    fontSize: 12,
                  }}
                >
                  🔍 Search
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={clearFilters}
                  style={{
                    height: 34,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1.5px solid ${tokens.border}`,
                    borderRadius: 8,
                    background: tokens.white,
                    color: tokens.muted,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = tokens.red;
                    e.target.style.color = tokens.red;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = tokens.border;
                    e.target.style.color = tokens.muted;
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p
              style={{ textAlign: "center", padding: 40, color: tokens.muted }}
            >
              Loading…
            </p>
          ) : records.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: 40, color: tokens.muted }}
            >
              No records found. Click <strong>+ New Bill Type</strong> to get
              started.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table>
                <thead>
                  <Tr>
                    {[
                      "#",
                      "Bill Type",
                      "Bill Type No",
                      "Items",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </Tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <Tr key={rec._id || i} isEven={i % 2 === 0}>
                      <Td
                        style={{
                          color: tokens.muted,
                          fontWeight: 600,
                          width: 40,
                        }}
                      >
                        {i + 1}
                      </Td>
                      <Td style={{ fontWeight: 600, color: tokens.navy }}>
                        {rec.BillType}
                      </Td>
                      <Td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: tokens.sky,
                            background: `${tokens.sky}10`,
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        >
                          {rec.billTypeNo}
                        </span>
                      </Td>
                      <Td>
                        <span style={css.countBadge}>
                          {Array.isArray(rec.Items) ? rec.Items.length : 0}{" "}
                          items
                        </span>
                      </Td>
                      <Td>
                        <span style={css.statusBadge(rec.is_active)}>
                          <span style={css.statusDot(rec.is_active)} />
                          {rec.is_active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            style={css.smallBtn("primary")}
                            onClick={() => setViewRecord(rec)}
                          >
                            View
                          </button>
                          <button
                            style={css.smallBtn("ghost")}
                            onClick={() => handleEdit(rec)}
                          >
                            Edit
                          </button>
                          <button
                            style={css.smallBtn("danger")}
                            onClick={() => handleDelete(rec.billTypeNo)}
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </TableWrapper>
      </Container>

      {/* ══════════ CREATE / EDIT MODAL ══════════ */}
      {showModal && (
        <div style={css.modalOverlay}>
          <div style={css.modalBox}>
            <div style={css.modalHead}>
              <span style={css.modalTitle}>
                {isEditMode
                  ? `✏️ Edit — ${formData.BillType}`
                  : "🔬 New Bill Type"}
              </span>
              <button
                style={css.modalClose}
                onClick={() => {
                  if (window.confirm("Discard changes?")) {
                    setShowModal(false);
                    resetForm();
                  }
                }}
              >
                ✕
              </button>
            </div>

            <div style={css.modalBody}>
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Bill Type Details
                </div>

                <div style={{ ...css.grid3, marginBottom: 0 }}>
                  <Field label="Bill Type *">
                    <Inp
                      value={formData.BillType}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, BillType: e.target.value }))
                      }
                      placeholder="e.g. USG Scan"
                    />
                  </Field>
                  <Field label="Bill Type No *">
                    <Inp
                      value={formData.billTypeNo}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          billTypeNo: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. USG01"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                      }}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={formData.is_active ? "true" : "false"}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          is_active: e.target.value === "true",
                        }))
                      }
                      style={css.select}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* ── Items builder ── */}
              <div style={{ ...css.card, marginBottom: 0 }}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Items
                </div>

                {/* Tags display */}
                <div style={css.tagsWrap}>
                  {formData.Items.length === 0 ? (
                    <span style={css.emptyTags}>
                      No items added yet. Type below and press Enter or click
                      Add.
                    </span>
                  ) : (
                    formData.Items.map((item, idx) => (
                      <span key={idx} style={css.itemTag}>
                        {item.itemName}
                        <button
                          style={css.itemTagRemove}
                          onClick={() => removeItem(idx)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add item input */}
                <div style={css.itemAddRow}>
                  <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                    placeholder="Type item name and press Enter or click Add…"
                    style={css.itemInput}
                    onFocus={(e) => (e.target.style.borderColor = tokens.sky)}
                    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
                  />
                  <button style={css.addTagBtn} onClick={addItem}>
                    + Add
                  </button>
                </div>

                <div
                  style={{ marginTop: 10, fontSize: 12, color: tokens.muted }}
                >
                  {formData.Items.length} item
                  {formData.Items.length !== 1 ? "s" : ""} added
                </div>
              </div>
            </div>

            <div style={css.modalFoot}>
              <button
                style={css.btn("danger")}
                onClick={() => {
                  if (window.confirm("Discard changes?")) {
                    setShowModal(false);
                    resetForm();
                  }
                }}
              >
                ✕ Cancel
              </button>
              <button
                style={css.btn("primary")}
                onClick={isEditMode ? handleUpdate : handleSubmit}
              >
                {isEditMode ? "💾 Update" : "⬆ Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ VIEW MODAL ══════════ */}
      {viewRecord && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalBox, width: "min(560px, 96vw)" }}>
            <div style={css.modalHead}>
              <span style={css.modalTitle}>🔬 {viewRecord.BillType}</span>
              <button
                style={css.modalClose}
                onClick={() => setViewRecord(null)}
              >
                ✕
              </button>
            </div>
            <div style={css.modalBody}>
              {/* Meta */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "Bill Type", val: viewRecord.BillType },
                  { label: "Bill Type No", val: viewRecord.billTypeNo },
                  {
                    label: "Status",
                    val: viewRecord.is_active ? "Active" : "Inactive",
                    isStatus: true,
                  },
                ].map(({ label, val, isStatus }) => (
                  <div
                    key={label}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: tokens.bg,
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <div style={{ ...css.label, marginBottom: 4 }}>{label}</div>
                    {isStatus ? (
                      <span style={css.statusBadge(viewRecord.is_active)}>
                        <span style={css.statusDot(viewRecord.is_active)} />
                        {val}
                      </span>
                    ) : (
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: tokens.text,
                        }}
                      >
                        {val}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Items list */}
              <div
                style={{ ...css.card, padding: "16px 18px", marginBottom: 0 }}
              >
                <div style={{ ...css.cardTitle, marginBottom: 10 }}>
                  <div style={css.sectionLine} /> Items (
                  {(viewRecord.Items || []).length})
                </div>
                {(viewRecord.Items || []).length === 0 ? (
                  <p
                    style={{
                      color: tokens.muted,
                      fontSize: 13,
                      textAlign: "center",
                      padding: "12px 0",
                    }}
                  >
                    No items.
                  </p>
                ) : (
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {(viewRecord.Items || []).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          ...css.itemListRow,
                          background: i % 2 === 0 ? tokens.white : tokens.bg,
                        }}
                      >
                        <span style={{ ...css.itemDot }} />
                        <span style={{ fontWeight: 500 }}>{item.itemName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={css.modalFoot}>
              <button
                style={css.btn("ghost")}
                onClick={() => {
                  handleEdit(viewRecord);
                  setViewRecord(null);
                }}
              >
                ✏️ Edit
              </button>
              <button
                style={css.btn("primary")}
                onClick={() => setViewRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default InvestigationPrice;
