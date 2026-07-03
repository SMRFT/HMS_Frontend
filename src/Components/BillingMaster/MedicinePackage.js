import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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

/* ─────────────────────────── design tokens ─────────────────────────── */
const tokens = {
  indigo: "#0d9488", // was #4F46E5
  indigoDk: "#1E2D45", // was #3730A3
  violet: "#2563EB", // was #7C3AED
  emerald: "#10B981", // was #059669
  rose: "#EF4444", // was #E11D48
  amber: "#F59E0B", // was #D97706
  slate: "#1E2D45",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F0F4F8", // was #F5F6FA
  white: "#FFFFFF",
  text: "#0F172A",
  textSm: "#475569",
};

/* ─────────────────────────── shared styles ─────────────────────────── */
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
    color: tokens.indigoDk,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${tokens.indigo}, ${tokens.violet})`,
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
    background: tokens.white,
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
    color: tokens.violet, // was tokens.indigo
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${tokens.indigo}, ${tokens.violet})`,
  },
  grid: (cols) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "14px 18px",
  }),
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
  },
  inputReadonly: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    color: tokens.muted,
    background: "#F8FAFC",
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    cursor: "not-allowed",
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
        bg: `linear-gradient(135deg, ${tokens.indigo}, ${tokens.violet})`,
        color: tokens.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${tokens.rose}, #FB7185)`,
        color: tokens.white,
      },
      success: {
        bg: `linear-gradient(135deg, ${tokens.emerald}, #34D399)`,
        color: tokens.white,
      },
      ghost: { bg: tokens.slate, color: tokens.white },
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
      letterSpacing: "0.2px",
    };
  },
  smallBtn: (variant = "primary") => {
    const map = {
      primary: {
        bg: `linear-gradient(135deg, ${tokens.indigo}, ${tokens.violet})`,
        color: tokens.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${tokens.rose}, #FB7185)`,
        color: tokens.white,
      },
      success: {
        bg: `linear-gradient(135deg, ${tokens.emerald}, #34D399)`,
        color: tokens.white,
      },
      ghost: { bg: tokens.slate, color: tokens.white },
    };
    const v = map[variant] || map.primary;
    return {
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,.10)",
    };
  },
  tableHeader: {
    padding: "16px 24px",
    background: `linear-gradient(135deg, ${tokens.indigo}, ${tokens.slate})`,
    fontSize: 15,
    fontWeight: 700,
    color: tokens.white,
    letterSpacing: "-0.2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterBar: {
    padding: "16px 20px",
    background: tokens.bg,
    borderBottom: `1px solid ${tokens.border}`,
  },
  itemsTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: `1px solid ${tokens.border}`,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
  },
  itemsTh: {
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: tokens.muted,
    background: tokens.bg,
    borderBottom: `2px solid ${tokens.border}`,
    textAlign: "left",
  },
  itemsTd: {
    padding: "7px 8px",
    fontSize: 13,
    color: tokens.text,
    borderBottom: `1px solid ${tokens.border}`,
    verticalAlign: "middle",
  },
  itemInput: {
    height: 32,
    padding: "0 8px",
    fontSize: 13,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 6,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  },
  statusBadge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: active ? `${tokens.emerald}18` : `${tokens.rose}18`,
    color: active ? tokens.emerald : tokens.rose,
    border: `1px solid ${active ? tokens.emerald : tokens.rose}40`,
  }),
  statusDot: (active) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: active ? tokens.emerald : tokens.rose,
  }),
  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: `${tokens.violet}18`,
    color: tokens.violet,
    border: `1px solid ${tokens.violet}40`,
  },
  totalRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 10,
    borderTop: `2px solid ${tokens.border}`,
    fontWeight: 700,
    fontSize: 15,
    color: tokens.indigoDk,
    gap: 8,
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
    width: "min(900px, 96vw)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(10,22,40,.25)",
    overflow: "hidden",
  },
  modalHead: {
    padding: "18px 24px",
    background: `linear-gradient(135deg, ${tokens.indigo}, ${tokens.slate})`,
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
  modalBody: { padding: "20px 24px", overflowY: "auto", flexGrow: 1 },
  modalFoot: {
    padding: "14px 20px",
    borderTop: `1px solid ${tokens.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexShrink: 0,
  },
  editBanner: {
    background: `linear-gradient(90deg, ${tokens.violet}18, ${tokens.indigo}18)`,
    border: `1px solid ${tokens.violet}40`,
    borderRadius: 10,
    padding: "10px 18px",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: tokens.slate,
    fontWeight: 500,
  },
  editBannerDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: tokens.violet,
    flexShrink: 0,
  },
  pickerPanel: {
    background: tokens.bg,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 12,
    padding: "16px",
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: tokens.violet, // was tokens.indigo
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  addSelectedBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    background: `linear-gradient(135deg, ${tokens.emerald}, #34D399)`,
    color: tokens.white,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
    whiteSpace: "nowrap",
  },
  emptyPicker: {
    textAlign: "center",
    padding: "24px 0",
    color: tokens.muted,
    fontSize: 13,
  },
  viewItemRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "8px 12px",
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.border}`,
    fontSize: 13,
    alignItems: "center",
  },
  pricePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: `${tokens.emerald}18`,
    color: tokens.emerald,
    border: `1px solid ${tokens.emerald}40`,
  },
  addRowBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px dashed ${tokens.violet}`,
    color: tokens.violet,
    background: `${tokens.violet}08`,
    borderRadius: 8,
    cursor: "pointer",
    width: "fit-content",
  },
};

/* ─────────────────────────── small helpers ─────────────────────────── */
const Field = ({ label, children }) => (
  <div style={css.fieldWrap}>
    <span style={css.label}>{label}</span>
    {children}
  </div>
);

const Inp = ({ style, ...props }) => (
  <input
    style={{ ...css.input, ...style }}
    onFocus={(e) => (e.target.style.borderColor = tokens.violet)}
    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
    {...props}
  />
);

const ItemInp = ({ style, ...props }) => (
  <input
    style={{ ...css.itemInput, ...style }}
    onFocus={(e) => (e.target.style.borderColor = tokens.violet)}
    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
    {...props}
  />
);
/* ─────────────────────────── constants ─────────────────────────── */
const TARGET_OUTLET_CODE = "OLET001";

const EMPTY_FORM = {
  medPackage_name: "",
  is_active: true,
  items: [],
};

/* ═══════════════════════════ COMPONENT ═══════════════════════════════ */
const MedicinePackage = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  /* ── state ── */
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewPkg, setViewPkg] = useState(null);
  const [filters, setFilters] = useState({ search: "" });

  /* pharmacy item picker */
  const [allItems, setAllItems] = useState([]); // full list from API
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedPickerIds, setSelectedPickerIds] = useState([]); // multi-select staging

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-P-MPKGE-RW");
  const canDelete = allowedActions.includes("HMS-P-MPKGD-RW");

  /* ── fetch packages ── */
  const fetchPackages = async (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    const url = `${HMSURL}medicine-packages/${q.toString() ? "?" + q : ""}`;
    const result = await apiRequest(url, "GET");
    if (result.success) {
      const d = result.data;
      setPackages(
        Array.isArray(d?.packages) ? d.packages : Array.isArray(d) ? d : [],
      );
    } else {
      console.error("Error fetching medicine packages:", result.error);
      setPackages([]);
    }
  };

  /* ── fetch pharmacy items (is_active=true, outlet OLET001) ── */
  const fetchPharmacyItems = async () => {
    const result = await apiRequest(
      `${HMSURL}pharmacy-items/?outlet_code=${TARGET_OUTLET_CODE}&is_active=true`,
      "GET",
    );
    if (result.success) {
      const d = result.data;
      setAllItems(
        Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [],
      );
    } else {
      console.error("Error fetching pharmacy items:", result.error);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchPharmacyItems();
  }, []);

  /* ── filtered picker list ── */
  const filteredPickerItems = allItems.filter((it) =>
    it.item_name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  /* ── toggle picker selection ── */
  const togglePickerItem = (item_id) => {
    setSelectedPickerIds((prev) =>
      prev.includes(item_id)
        ? prev.filter((id) => id !== item_id)
        : [...prev, item_id],
    );
  };

  /* ── add selected picker items to formData.items ── */
  const addSelectedToTable = () => {
    if (!selectedPickerIds.length) {
      alert("Please select at least one item.");
      return;
    }
    const toAdd = allItems
      .filter((it) => selectedPickerIds.includes(it.item_id))
      .map((it) => ({ item_id: it.item_id, item_name: it.item_name, qty: 1 }));

    setFormData((prev) => {
      const existingIds = new Set(prev.items.map((i) => i.item_id));
      const fresh = toAdd.filter((it) => !existingIds.has(it.item_id));
      return { ...prev, items: [...prev.items, ...fresh] };
    });
    setSelectedPickerIds([]);
    setPickerSearch("");
  };

  /* ── remove item row ── */
  const removeItem = (item_id) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.item_id !== item_id),
    }));
  };

  /* ── filter bar ── */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const applyFilters = () => fetchPackages(filters);
  const clearFilters = () => {
    setFilters({ search: "" });
    fetchPackages();
  };

  /* ── form field change ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ── reset ── */
  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setIsEditMode(false);
    setEditingId(null);
    setSelectedPickerIds([]);
    setPickerSearch("");
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  /* ── create ── */
  const handleSubmit = async () => {
    if (!formData.medPackage_name.trim()) {
      alert("Package name is required.");
      return;
    }
    if (!formData.items.length) {
      alert("Add at least one medicine item.");
      return;
    }

    const result = await apiRequest(
      `${HMSURL}medicine-packages/create/`,
      "POST",
      {
        ...formData,
        items: formData.items.map((i) => ({
          item_id: i.item_id,
          item_name: i.item_name,
          qty: i.qty ?? 1,
        })),
      },
    );
    if (result.success) {
      alert("Medicine package created successfully!");
      setShowModal(false);
      fetchPackages();
    } else alert(result.error || "Failed to create medicine package.");
  };

  /* ── load edit ── */
  const handleEdit = (pkg) => {
    setFormData({
      medPackage_name: pkg.medPackage_name || "",
      is_active: pkg.is_active !== false,
      items: Array.isArray(pkg.items)
        ? pkg.items.map((i) => ({
            item_id: i.item_id,
            item_name: i.item_name,
            qty: i.qty ?? 1,
          }))
        : [],
    });
    setEditingId(pkg.medPackage_id);
    setIsEditMode(true);
    setSelectedPickerIds([]);
    setPickerSearch("");
    setShowModal(true);
  };

  /* ── update ── */
  const handleUpdate = async () => {
    if (!formData.medPackage_name.trim()) {
      alert("Package name is required.");
      return;
    }
    if (!formData.items.length) {
      alert("Add at least one medicine item.");
      return;
    }

    const result = await apiRequest(
      `${HMSURL}medicine-packages/update/${editingId}/`,
      "PATCH",
      {
        ...formData,
        items: formData.items.map((i) => ({
          item_id: i.item_id,
          item_name: i.item_name,
          qty: i.qty ?? 1,
        })),
      },
    );
    if (result.success) {
      alert("Medicine package updated successfully!");
      setShowModal(false);
      fetchPackages(filters);
    } else alert(result.error || "Failed to update medicine package.");
  };

  /* ── delete ── */
  const handleDelete = async (medPackage_id) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    const result = await apiRequest(
      `${HMSURL}medicine-packages/delete/${medPackage_id}/`,
      "PATCH",
    );
    if (result.success) {
      alert("Medicine package deleted successfully.");
      setPackages((prev) =>
        prev.filter((p) => p.medPackage_id !== medPackage_id),
      );
    } else alert("Error deleting package: " + result.error);
  };

  /* ─── Print ──────────────────────────────────────────────────────── */
  const handlePrint = () => {
    if (!packages || packages.length === 0) {
      alert("No data to print.");
      return;
    }

    const blocksHtml = packages
      .map((pkg) => {
        const items = Array.isArray(pkg.items) ? pkg.items : [];
        const itemRows = items.length
          ? items
              .map(
                (it) => `<tr>
                <td>${it.item_id ?? ""}</td>
                <td>${it.item_name || ""}</td>
                <td style="text-align:center">${it.qty ?? 1}</td>
              </tr>`,
              )
              .join("")
          : `<tr><td colspan="3" style="text-align:center;color:#64748B;">No items added.</td></tr>`;

        return `
        <div class="block">
          <table class="main-table">
            <thead>
              <tr><th>Package ID</th><th>Package Name</th><th>Outlet Code</th><th>Branch</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${pkg.medPackage_id ?? ""}</td>
                <td>${pkg.medPackage_name || ""}</td>
                <td>${pkg.outlet_code || "—"}</td>
                <td>${pkg.branch_code || "—"}</td>
                <td>${pkg.is_active ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>
          </table>
          <div class="items-title">Items (${items.length})</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width:90px">Item ID</th>
                <th>Item Name</th>
                <th style="text-align:center;width:60px">Qty</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>`;
      })
      .join("");

    const html = `
    <html>
      <head>
        <title>Medicine Packages</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0F172A; }
          h2 { margin-bottom: 16px; }
          .block { margin-bottom: 28px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px; }
          th, td { border: 1px solid #E2E8F0; padding: 8px 10px; text-align: left; }
          th { background: #F0F4F8; }
          .main-table { page-break-inside: avoid; }
          .items-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #2563EB; margin: 10px 0 6px; page-break-after: avoid; }
          .items-table tr { page-break-inside: avoid; }
          .items-table thead { display: table-header-group; }
        </style>
      </head>
      <body>
        <h2>Medicine Package Configuration</h2>
        ${blocksHtml}
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  /* ─── Export CSV ─────────────────────────────────────────────────── */
  const handleExportCSV = () => {
    if (!packages || packages.length === 0) {
      alert("No data to export.");
      return;
    }

    const escapeCell = (val) => {
      const str = val === null || val === undefined ? "" : String(val);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const header = [
      "Package ID",
      "Package Name",
      "Outlet Code",
      "Branch Code",
      "Status",
      "Item ID",
      "Item Name",
      "Qty",
    ].join(",");

    const lines = [];
    packages.forEach((pkg) => {
      const baseCols = [
        pkg.medPackage_id,
        pkg.medPackage_name,
        pkg.outlet_code || "",
        pkg.branch_code || "",
        pkg.is_active ? "Active" : "Inactive",
      ];

      const items = Array.isArray(pkg.items) ? pkg.items : [];
      if (items.length === 0) {
        lines.push([...baseCols, "", "", ""].map(escapeCell).join(","));
      } else {
        items.forEach((it) => {
          lines.push(
            [...baseCols, it.item_id ?? "", it.item_name || "", it.qty ?? 1]
              .map(escapeCell)
              .join(","),
          );
        });
      }
    });

    const csvContent = `${header}\n${lines.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "medicine-packages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <PageWrapper>
      <Container>
        {/* ── page header ── */}
        <div style={css.pageHeader}>
          <h1 style={css.pageTitle}>
            <span style={css.titleDot} />
            Medicine Package Management
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={css.dateBadge}>📅 {currentDate}</div>
            <button style={css.smallBtn("ghost")} onClick={handlePrint}>
              🖨 Print
            </button>
            <button style={css.smallBtn("ghost")} onClick={handleExportCSV}>
              ⬇ Export CSV
            </button>
            <button style={css.btn("primary")} onClick={openCreate}>
              + New Med Package
            </button>
          </div>
        </div>

        {/* ── table card ── */}
        <TableWrapper>
          <div style={css.tableHeader}>
            <span>💊 Medicine Packages</span>
            <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
              {packages.length} record{packages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* filter bar */}
          <div style={css.filterBar}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr auto auto",
                gap: "10px 12px",
                alignItems: "end",
              }}
            >
              <div style={css.fieldWrap}>
                <span style={{ ...css.label, color: tokens.indigo }}>
                  🔍 Search
                </span>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Package name…"
                  style={{ ...css.input, height: 34, fontSize: 12 }}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
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
                    e.target.style.borderColor = tokens.rose;
                    e.target.style.color = tokens.rose;
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

          {/* table body */}
          {packages.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: 40, color: tokens.muted }}
            >
              No medicine packages found. Click{" "}
              <strong>+ New Med Package</strong> to get started.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table>
                <thead>
                  <Tr>
                    {[
                      "#",
                      "Package Name",
                      "Outlet Code",
                      "Branch",
                      "Items",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </Tr>
                </thead>
                <tbody>
                  {packages.map((pkg, i) => (
                    <Tr key={pkg.medPackage_id || i} isEven={i % 2 === 0}>
                      <Td style={{ color: tokens.muted, fontWeight: 600 }}>
                        {pkg.medPackage_id}
                      </Td>
                      <Td style={{ fontWeight: 600, color: tokens.indigoDk }}>
                        {pkg.medPackage_name}
                      </Td>
                      <Td>{pkg.outlet_code || "—"}</Td>
                      <Td>{pkg.branch_code || "—"}</Td>
                      <Td>
                        <span style={css.countBadge}>
                          {Array.isArray(pkg.items) ? pkg.items.length : 0}{" "}
                          items
                        </span>
                      </Td>
                      <Td>
                        <span style={css.statusBadge(pkg.is_active)}>
                          <span style={css.statusDot(pkg.is_active)} />
                          {pkg.is_active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          <button
                            style={css.smallBtn("primary")}
                            onClick={() => setViewPkg(pkg)}
                          >
                            View
                          </button>
                          {canEdit && (
                            <button
                              style={css.smallBtn("ghost")}
                              onClick={() => handleEdit(pkg)}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              style={css.smallBtn("danger")}
                              onClick={() => handleDelete(pkg.medPackage_id)}
                            >
                              Delete
                            </button>
                          )}
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

      {/* ══════════════════ CREATE / EDIT MODAL ══════════════════════════ */}
      {showModal && (
        <div style={css.modalOverlay}>
          <div style={css.modalBox}>
            {/* header */}
            <div style={css.modalHead}>
              <span style={css.modalTitle}>
                {isEditMode
                  ? `✏️ Edit Med Package — #${editingId}`
                  : "💊 New Medicine Package"}
              </span>
              <button
                style={css.modalClose}
                onClick={() => {
                  if (window.confirm("Discard unsaved changes?")) {
                    setShowModal(false);
                    resetForm();
                  }
                }}
              >
                ✕
              </button>
            </div>

            <div style={css.modalBody}>
              {isEditMode && (
                <div style={css.editBanner}>
                  <div style={css.editBannerDot} />
                  Editing:{" "}
                  <strong style={{ color: tokens.indigo }}>
                    {formData.medPackage_name}
                  </strong>
                </div>
              )}

              {/* ── Package Details card ── */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Package Details
                </div>
                <div style={{ ...css.grid(2), marginBottom: 14 }}>
                  <Field label="Package Name *">
                    <Inp
                      name="medPackage_name"
                      value={formData.medPackage_name}
                      onChange={handleChange}
                      placeholder="e.g. Cardiac Medicine Bundle"
                    />
                  </Field>

                  <Field label="Status">
                    <select
                      name="is_active"
                      value={formData.is_active ? "true" : "false"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
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

                {/* ── Item picker ── */}
                <div style={css.pickerPanel}>
                  <div style={css.pickerTitle}>
                    💊 Select Medicine Items (Outlet: {TARGET_OUTLET_CODE})
                  </div>

                  {/* search within picker */}
                  <input
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search medicine name…"
                    style={{ ...css.input, marginBottom: 10 }}
                  />

                  {allItems.length === 0 ? (
                    <p style={css.emptyPicker}>
                      No active medicine items found for {TARGET_OUTLET_CODE}.
                    </p>
                  ) : filteredPickerItems.length === 0 ? (
                    <p style={css.emptyPicker}>No items match your search.</p>
                  ) : (
                    <>
                      {/* scrollable checklist */}
                      <div
                        style={{
                          maxHeight: 200,
                          overflowY: "auto",
                          border: `1px solid ${tokens.border}`,
                          borderRadius: 8,
                          background: tokens.white,
                          marginBottom: 10,
                        }}
                      >
                        {filteredPickerItems.map((item) => {
                          const alreadyAdded = formData.items.some(
                            (i) => i.item_id === item.item_id,
                          );
                          const isSelected = selectedPickerIds.includes(
                            item.item_id,
                          );
                          return (
                            <label
                              key={item.item_id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "7px 12px",
                                cursor: alreadyAdded
                                  ? "not-allowed"
                                  : "pointer",
                                borderBottom: `1px solid ${tokens.border}`,
                                background: alreadyAdded
                                  ? `${tokens.emerald}08`
                                  : isSelected
                                    ? `${tokens.indigo}08`
                                    : "transparent",
                                opacity: alreadyAdded ? 0.6 : 1,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected || alreadyAdded}
                                disabled={alreadyAdded}
                                onChange={() =>
                                  !alreadyAdded &&
                                  togglePickerItem(item.item_id)
                                }
                                style={{ accentColor: tokens.indigo }}
                              />
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: tokens.text,
                                  flex: 1,
                                }}
                              >
                                {item.item_name}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: tokens.muted,
                                  fontFamily: "monospace",
                                }}
                              >
                                ID: {item.item_id}
                              </span>
                              {alreadyAdded && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: tokens.emerald,
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓ Added
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: 12, color: tokens.muted }}>
                          {selectedPickerIds.length} item
                          {selectedPickerIds.length !== 1 ? "s" : ""} selected
                        </span>
                        <button
                          style={css.addSelectedBtn}
                          onClick={addSelectedToTable}
                        >
                          ✚ Add to Package
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Items table ── */}
              <div style={{ ...css.card, marginBottom: 0 }}>
                <div style={{ ...css.cardTitle, marginBottom: 10 }}>
                  <div style={css.sectionLine} /> Package Items
                  <span style={{ ...css.countBadge, marginLeft: 8 }}>
                    {formData.items.length}
                  </span>
                </div>

                {formData.items.length === 0 ? (
                  <p style={{ ...css.emptyPicker, padding: "16px 0" }}>
                    No items added yet. Use the picker above to add medicines.
                  </p>
                ) : (
                  <table style={css.itemsTable}>
                    <thead>
                      <tr>
                        {["#", "Item ID", "Item Name", "Quantity", ""].map(
                          (h) => (
                            <th key={h} style={css.itemsTh}>
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr
                          key={item.item_id}
                          style={{
                            background:
                              idx % 2 === 0 ? tokens.white : "#F8FAFC",
                          }}
                        >
                          <td
                            style={{
                              ...css.itemsTd,
                              color: tokens.muted,
                              fontWeight: 600,
                              width: 36,
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td style={{ ...css.itemsTd, width: 100 }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 6,
                                background: `${tokens.indigo}10`,
                                color: tokens.indigoDk,
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "monospace",
                              }}
                            >
                              {item.item_id}
                            </span>
                          </td>
                          <td style={css.itemsTd}>
                            <span style={{ fontWeight: 500 }}>
                              {item.item_name}
                            </span>
                          </td>
                          <td style={{ ...css.itemsTd, width: 90 }}>
                            <ItemInp
                              type="number"
                              min={1}
                              value={item.qty ?? 1}
                              onChange={(e) => {
                                const val = Math.max(
                                  1,
                                  parseInt(e.target.value) || 1,
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  items: prev.items.map((i) =>
                                    i.item_id === item.item_id
                                      ? { ...i, qty: val }
                                      : i,
                                  ),
                                }));
                              }}
                              style={{ width: 70 }}
                            />
                          </td>
                          <td style={{ ...css.itemsTd, width: 40 }}>
                            <button
                              onClick={() => removeItem(item.item_id)}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: `${tokens.rose}18`,
                                border: `1px solid ${tokens.rose}40`,
                                color: tokens.rose,
                                cursor: "pointer",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Remove item"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* footer */}
            <div style={css.modalFoot}>
              <button
                style={css.btn("danger")}
                onClick={() => {
                  if (window.confirm("Discard unsaved changes?")) {
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
                {isEditMode ? "💾 Update Package" : "⬆ Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ VIEW MODAL ════════════════════════════════════ */}
      {viewPkg && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalBox, width: "min(640px, 96vw)" }}>
            <div style={css.modalHead}>
              <span style={css.modalTitle}>💊 {viewPkg.medPackage_name}</span>
              <button style={css.modalClose} onClick={() => setViewPkg(null)}>
                ✕
              </button>
            </div>

            <div style={css.modalBody}>
              {/* meta info */}
              <div style={{ ...css.grid(3), marginBottom: 20 }}>
                {[
                  { label: "Package ID", val: `#${viewPkg.medPackage_id}` },
                  { label: "Outlet Code", val: viewPkg.outlet_code || "—" },
                  { label: "Branch Code", val: viewPkg.branch_code || "—" },
                  { label: "Hospital Code", val: viewPkg.hospital_code || "—" },
                  {
                    label: "Status",
                    val: (
                      <span style={css.statusBadge(viewPkg.is_active)}>
                        <span style={css.statusDot(viewPkg.is_active)} />
                        {viewPkg.is_active ? "Active" : "Inactive"}
                      </span>
                    ),
                  },
                ].map(({ label, val }) => (
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
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: tokens.text,
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              {/* items list */}
              <div
                style={{ ...css.card, padding: "16px 18px", marginBottom: 0 }}
              >
                <div style={{ ...css.cardTitle, marginBottom: 10 }}>
                  <div style={css.sectionLine} />
                  Items ({(viewPkg.items || []).length})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: "4px 12px",
                    padding: "6px 4px",
                    borderBottom: `2px solid ${tokens.border}`,
                    marginBottom: 4,
                  }}
                >
                  {["Item Name", "Item ID", "Qty"].map((h) => (
                    <span key={h} style={css.label}>
                      {h}
                    </span>
                  ))}
                </div>
                {(viewPkg.items || []).map((item, i) => (
                  <div key={i} style={css.viewItemRow}>
                    <span style={{ fontWeight: 600, color: tokens.text }}>
                      {item.item_name}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: `${tokens.indigo}10`,
                        color: tokens.indigoDk,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.item_id}
                    </span>
                    <span style={css.pricePill}>{item.qty ?? 1}</span>
                  </div>
                ))}
                <div
                  style={{
                    ...css.totalRow,
                    justifyContent: "flex-start",
                    borderTop: "none",
                    marginTop: 8,
                    paddingTop: 0,
                  }}
                >
                  <span
                    style={{
                      color: tokens.muted,
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    Total items:{" "}
                    <strong style={{ color: tokens.indigoDk }}>
                      {(viewPkg.items || []).length}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={css.modalFoot}>
              {canEdit && (
                <button
                  style={css.btn("ghost")}
                  onClick={() => {
                    handleEdit(viewPkg);
                    setViewPkg(null);
                  }}
                >
                  ✏️ Edit
                </button>
              )}
              <button
                style={css.btn("primary")}
                onClick={() => setViewPkg(null)}
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

export default MedicinePackage;
