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

const tokens = {
  navy: "#0d9488",
  slate: "#1E2D45",
  sky: "#2563EB",
  teal: "#0EA5E9",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F172A",
  textSm: "#475569",
};

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
  editBanner: {
    background: `linear-gradient(90deg, ${tokens.sky}18, ${tokens.teal}18)`,
    border: `1px solid ${tokens.sky}40`,
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
    background: tokens.sky,
    flexShrink: 0,
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
    transition: "border-color .2s",
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
      letterSpacing: "0.2px",
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
      success: {
        bg: `linear-gradient(135deg, ${tokens.green}, #34D399)`,
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
  addRowBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px dashed ${tokens.sky}`,
    color: tokens.sky,
    background: `${tokens.sky}08`,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all .15s",
    width: "fit-content",
  },
  tableHeader: {
    padding: "16px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    fontSize: 15,
    fontWeight: 700,
    color: tokens.white,
    letterSpacing: "-0.2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  pricePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: `${tokens.green}18`,
    color: tokens.green,
    border: `1px solid ${tokens.green}40`,
  },
  filterBar: {
    padding: "16px 20px",
    background: tokens.bg,
    borderBottom: `1px solid ${tokens.border}`,
  },
  totalRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 10,
    borderTop: `2px solid ${tokens.border}`,
    fontWeight: 700,
    fontSize: 15,
    color: tokens.navy,
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
  viewItemRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 50px 1fr",
    gap: "8px 12px",
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.border}`,
    fontSize: 13,
    alignItems: "center",
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
    color: tokens.sky,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  addSelectedBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 0,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    background: `linear-gradient(135deg, ${tokens.green}, #34D399)`,
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
};

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

const ItemInp = ({ style, ...props }) => (
  <input
    style={{ ...css.itemInput, ...style }}
    onFocus={(e) => (e.target.style.borderColor = tokens.sky)}
    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
    {...props}
  />
);

const EMPTY_FORM = {
  packageName: "",
  department: "",
  department_code: "",
  totalPrice: "",
  is_active: true,
  items: [
    { itemName: "", price: "", quantity: 1, billTypeNo: "", test_id: "" },
  ],
};

const Package = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNo, setEditingNo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewPkg, setViewPkg] = useState(null);
  const [filters, setFilters] = useState({ search: "", department: "" });

  // Department state
  const [departments, setDepartments] = useState([]);

  // Bill-type picker state
  const [billTypes, setBillTypes] = useState([]);
  const [selectedBillType, setSelectedBillType] = useState("");
  const [pickerItems, setPickerItems] = useState([]);
  const [selectedPickerItem, setSelectedPickerItem] = useState("");

  // Auto-calculate totalPrice
  useEffect(() => {
    const total = formData.items.reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0),
      0,
    );
    setFormData((prev) => ({ ...prev, totalPrice: total.toFixed(2) }));
  }, [formData.items]);

  // Fetch packages
  const fetchPackages = async (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    if (params.department) q.append("department", params.department);
    const url = `${HMSURL}packages_crud/${q.toString() ? "?" + q.toString() : ""}`;
    const result = await apiRequest(url, "GET");
    if (result.success) {
      const data = result.data;
      if (Array.isArray(data?.packages)) setPackages(data.packages);
      else if (Array.isArray(data)) setPackages(data);
      else setPackages([]);
    } else {
      console.error("Error fetching packages:", result.error);
      setPackages([]);
    }
  };

  // Fetch departments from backend
  const fetchDepartments = async () => {
    const result = await apiRequest(`${HMSURL}departments/`, "GET");
    if (result.success) {
      const data = result.data;
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
    } else {
      console.error("Error fetching departments:", result.error);
    }
  };

  // Fetch bill types
  const fetchBillTypes = async () => {
    const labEntry = {
      billTypeNo: "LAB01",
      BillType: "LABORATORY",
      Items: [],
      isLab: true,
    };
    const result = await apiRequest(`${HMSURL}investigation-prices/`, "GET");
    if (result.success) {
      const data = result.data;
      const fetched = Array.isArray(data?.billTypes)
        ? data.billTypes
        : Array.isArray(data)
          ? data
          : [];
      setBillTypes([
        labEntry,
        ...fetched.filter((b) => b.billTypeNo !== "LAB01"),
      ]);
    } else {
      console.error("Error fetching bill types:", result.error);
      setBillTypes([labEntry]);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchDepartments();
    fetchBillTypes();
  }, []);

  // When department dropdown changes — auto-fill department_code (read-only)
  const handleDepartmentChange = (departmentName) => {
    const found = departments.find((d) => d.department_name === departmentName);
    setFormData((prev) => ({
      ...prev,
      department: departmentName,
      department_code: found ? found.department_code : "",
    }));
  };

  // When bill type dropdown changes
  const handleBillTypeChange = async (billTypeNo) => {
    setSelectedBillType(billTypeNo);
    setSelectedPickerItem("");
    setPickerItems([]);
    if (!billTypeNo) return;

    const found = billTypes.find((b) => b.billTypeNo === billTypeNo);

    if (found?.isLab) {
      const result = await apiRequest(`${HMSURL}lab-items/`, "GET");
      if (result.success) {
        const data = result.data;
        const labItems = (Array.isArray(data?.items) ? data.items : []).map(
          (i) => ({
            itemName: i.itemName,
            price: i.price,
            test_id: i.test_id,
            isLab: true,
          }),
        );
        setPickerItems(labItems);
      } else {
        console.error("Failed to fetch lab items:", result.error);
      }
      return;
    }

    setPickerItems(found ? found.Items : []);
  };

  // Add selected picker item to items table
  const addSelectedToTable = () => {
    if (!selectedPickerItem) {
      alert("Please select an item.");
      return;
    }
    const selectedBT = billTypes.find((b) => b.billTypeNo === selectedBillType);
    const item = pickerItems.find((i) => i.itemName === selectedPickerItem);
    if (!item) return;

    let price, test_id;
    if (item.isLab) {
      price = item.price || "0";
      test_id = item.test_id || "";
    } else {
      const numericKeys = Object.keys(item.extraKeys || {}).filter((k) =>
        /^\d+$/.test(k),
      );
      price = numericKeys.length
        ? Math.max(
            ...numericKeys.map((k) => parseFloat(item.extraKeys[k]) || 0),
          ).toString()
        : "0";
      test_id = item.extraKeys?.hasOwnProperty("test_id")
        ? item.extraKeys["test_id"]
        : "";
    }

    const newRow = {
      itemName: item.itemName,
      price: price,
      quantity: 1,
      billTypeNo: selectedBT?.billTypeNo || "",
      test_id: test_id,
    };

    setFormData((prev) => {
      const existingItems = prev.items;
      const isOnlyBlank =
        existingItems.length === 1 &&
        !existingItems[0].itemName.trim() &&
        !existingItems[0].price;
      return {
        ...prev,
        items: isOnlyBlank ? [newRow] : [...existingItems, newRow],
      };
    });

    setSelectedPickerItem("");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const applyFilters = () => fetchPackages(filters);
  const clearFilters = () => {
    setFilters({ search: "", department: "" });
    fetchPackages();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };
  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemName: "", price: "", quantity: 1, billTypeNo: "", test_id: "" },
      ],
    }));
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM,
      items: [
        { itemName: "", price: "", quantity: 1, billTypeNo: "", test_id: "" },
      ],
    });
    setIsEditMode(false);
    setEditingNo(null);
    setSelectedBillType("");
    setPickerItems([]);
    setSelectedPickerItem("");
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.packageName.trim()) {
      alert("Package name is required.");
      return;
    }
    const filledItems = formData.items.filter((i) => i.itemName.trim());
    if (!filledItems.length) {
      alert("At least one item with a name is required.");
      return;
    }
    const result = await apiRequest(`${HMSURL}packages/create/`, "POST", {
      ...formData,
      items: filledItems,
    });
    if (result.success) {
      alert("Package created successfully!");
      setShowModal(false);
      fetchPackages();
    } else alert(result.error || "Failed to create package.");
  };

  const handleEdit = (pkg) => {
    setFormData({
      packageName: pkg.packageName || "",
      department: pkg.department || "",
      department_code: pkg.department_code || "",
      totalPrice: pkg.totalPrice || "",
      is_active: pkg.is_active !== false,
      items:
        Array.isArray(pkg.items) && pkg.items.length
          ? pkg.items.map((i) => ({
              itemName: i.itemName || "",
              price: i.price || "",
              quantity: i.quantity || 1,
              billTypeNo: i.billTypeNo || "",
              test_id: i.test_id || "",
            }))
          : [
              {
                itemName: "",
                price: "",
                quantity: 1,
                billTypeNo: "",
                test_id: "",
              },
            ],
    });
    setEditingNo(pkg.packageNo);
    setIsEditMode(true);
    setSelectedBillType("");
    setPickerItems([]);
    setSelectedPickerItem("");
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.packageName.trim()) {
      alert("Package name is required.");
      return;
    }
    const filledItems = formData.items.filter((i) => i.itemName.trim());
    if (!filledItems.length) {
      alert("At least one item with a name is required.");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}packages/update/${editingNo}/`,
      "PATCH",
      { ...formData, items: filledItems },
    );
    if (result.success) {
      alert("Package updated successfully!");
      setShowModal(false);
      fetchPackages(filters);
    } else alert(result.error || "Failed to update package.");
  };

  const handleDelete = async (packageNo) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    const result = await apiRequest(
      `${HMSURL}packages/delete/${packageNo}/`,
      "PATCH",
    );
    if (result.success) {
      alert("Package deleted successfully.");
      setPackages((prev) => prev.filter((p) => p.packageNo !== packageNo));
    } else alert("Error deleting package: " + result.error);
  };

  return (
    <PageWrapper>
      <Container>
        <div style={css.pageHeader}>
          <h1 style={css.pageTitle}>
            <span style={css.titleDot} />
            Package Management
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={css.dateBadge}>📅 {currentDate}</div>
            <button style={css.btn("primary")} onClick={openCreate}>
              + New Package
            </button>
          </div>
        </div>

        <TableWrapper>
          <div style={css.tableHeader}>
            <span>📦 Packages</span>
            <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
              {packages.length} record{packages.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={css.filterBar}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1.5fr auto auto",
                gap: "10px 12px",
                alignItems: "end",
              }}
            >
              <div style={css.fieldWrap}>
                <span style={{ ...css.label, color: tokens.sky }}>
                  🔍 Search
                </span>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Package name or department…"
                  style={{ ...css.input, height: 34, fontSize: 12 }}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div style={css.fieldWrap}>
                <span style={{ ...css.label, color: tokens.sky }}>
                  🏥 Department
                </span>
                <input
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  placeholder="Filter by department…"
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

          {packages.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: 40, color: tokens.muted }}
            >
              No packages found. Click <strong>+ New Package</strong> to get
              started.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table>
                <thead>
                  <Tr>
                    {[
                      "#",
                      "Package Name",
                      "Department",
                      "Items",
                      "Total Price",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </Tr>
                </thead>
                <tbody>
                  {packages.map((pkg, i) => (
                    <Tr key={pkg._id || i} isEven={i % 2 === 0}>
                      <Td style={{ color: tokens.muted, fontWeight: 600 }}>
                        {pkg.packageNo}
                      </Td>
                      <Td style={{ fontWeight: 600, color: tokens.navy }}>
                        {pkg.packageName}
                      </Td>
                      <Td>{pkg.department || "—"}</Td>
                      <Td>
                        <span style={css.countBadge}>
                          {Array.isArray(pkg.items) ? pkg.items.length : 0}{" "}
                          items
                        </span>
                      </Td>
                      <Td style={{ fontWeight: 700, color: tokens.green }}>
                        ₹{" "}
                        {parseFloat(pkg.totalPrice || 0).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 },
                        )}
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
                          <button
                            style={css.smallBtn("ghost")}
                            onClick={() => handleEdit(pkg)}
                          >
                            Edit
                          </button>
                          <button
                            style={css.smallBtn("danger")}
                            onClick={() => handleDelete(pkg.packageNo)}
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={css.modalOverlay}>
          <div style={css.modalBox}>
            <div style={css.modalHead}>
              <span style={css.modalTitle}>
                {isEditMode
                  ? `✏️ Edit Package — #${editingNo}`
                  : "📦 New Package"}
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
                  Editing package:{" "}
                  <strong style={{ color: tokens.sky }}>
                    {formData.packageName}
                  </strong>
                </div>
              )}

              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Package Details
                </div>
                <div style={{ ...css.grid(2), marginBottom: 14 }}>
                  <Field label="Package Name *">
                    <Inp
                      name="packageName"
                      value={formData.packageName}
                      onChange={handleChange}
                      placeholder="e.g. Comprehensive Health Checkup"
                    />
                  </Field>

                  {/* Department — dropdown from backend */}
                  <Field label="Department">
                    <select
                      value={formData.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      style={css.select}
                    >
                      <option value="">— Select Department —</option>
                      {departments.map((d) => (
                        <option
                          key={d.department_code}
                          value={d.department_name}
                        >
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Department Code — auto-filled, read-only */}
                  <Field label="Department Code">
                    <input
                      value={formData.department_code}
                      readOnly
                      style={css.inputReadonly}
                      placeholder="Auto-filled from department"
                    />
                  </Field>

                  {/* Bill Type dropdown */}
                  <Field label="Bill Type">
                    <select
                      value={selectedBillType}
                      onChange={(e) => handleBillTypeChange(e.target.value)}
                      style={css.select}
                    >
                      <option value="">— Select Bill Type —</option>
                      {billTypes.map((bt) => (
                        <option key={bt.billTypeNo} value={bt.billTypeNo}>
                          {bt.BillType} ({bt.billTypeNo})
                        </option>
                      ))}
                    </select>
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

                {/* Item picker panel */}
                {selectedBillType && (
                  <div style={css.pickerPanel}>
                    <div style={css.pickerTitle}>
                      🧪 Select Items from{" "}
                      <span style={{ color: tokens.navy }}>
                        {
                          billTypes.find(
                            (b) => b.billTypeNo === selectedBillType,
                          )?.BillType
                        }
                      </span>
                    </div>
                    {pickerItems.length === 0 ? (
                      <p style={css.emptyPicker}>
                        No items found for this bill type.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 4,
                        }}
                      >
                        <select
                          value={selectedPickerItem}
                          onChange={(e) =>
                            setSelectedPickerItem(e.target.value)
                          }
                          style={{ ...css.select, flex: 1 }}
                        >
                          <option value="">— Select Item —</option>
                          {pickerItems.map((item) => (
                            <option key={item.itemName} value={item.itemName}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                        <button
                          style={css.addSelectedBtn}
                          onClick={addSelectedToTable}
                        >
                          ✚ Add to Package
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items table */}
              <div style={{ ...css.card, marginBottom: 0 }}>
                <div style={{ ...css.cardTitle, marginBottom: 10 }}>
                  <div style={css.sectionLine} /> Package Items
                </div>
                <table style={css.itemsTable}>
                  <thead>
                    <tr>
                      {[
                        "#",
                        "Item Name *",
                        "Price (₹) *",
                        "Qty",
                        "Bill Type No",
                        "Test ID",
                        "",
                      ].map((h) => (
                        <th key={h} style={css.itemsTh}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: idx % 2 === 0 ? tokens.white : "#F8FAFC",
                        }}
                      >
                        <td
                          style={{
                            ...css.itemsTd,
                            color: tokens.muted,
                            fontWeight: 600,
                            width: 32,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={css.itemsTd}>
                          <ItemInp
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(idx, "itemName", e.target.value)
                            }
                            placeholder="Item name"
                          />
                        </td>
                        <td style={{ ...css.itemsTd, width: 110 }}>
                          <ItemInp
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(idx, "price", e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ ...css.itemsTd, width: 70 }}>
                          <ItemInp
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", e.target.value)
                            }
                            placeholder="1"
                          />
                        </td>
                        <td style={{ ...css.itemsTd, width: 120 }}>
                          <ItemInp
                            value={item.billTypeNo}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "billTypeNo",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. LAB01"
                          />
                        </td>
                        <td style={{ ...css.itemsTd, width: 90 }}>
                          <ItemInp
                            value={item.test_id}
                            onChange={(e) =>
                              handleItemChange(idx, "test_id", e.target.value)
                            }
                            placeholder="e.g. 506"
                          />
                        </td>
                        <td style={{ ...css.itemsTd, width: 40 }}>
                          <button
                            onClick={() => removeItem(idx)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: `${tokens.red}18`,
                              border: `1px solid ${tokens.red}40`,
                              color: tokens.red,
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
                <button
                  style={{ ...css.addRowBtn, marginTop: 12 }}
                  onClick={addItem}
                >
                  + Add Item Manually
                </button>
                <div style={css.totalRow}>
                  <span style={{ color: tokens.muted, fontWeight: 500 }}>
                    Total Price:
                  </span>
                  <span>
                    ₹{" "}
                    {parseFloat(formData.totalPrice || 0).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              </div>
            </div>

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

      {/* VIEW MODAL */}
      {viewPkg && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalBox, width: "min(680px, 96vw)" }}>
            <div style={css.modalHead}>
              <span style={css.modalTitle}>📦 {viewPkg.packageName}</span>
              <button style={css.modalClose} onClick={() => setViewPkg(null)}>
                ✕
              </button>
            </div>
            <div style={css.modalBody}>
              <div style={{ ...css.grid(3), marginBottom: 20 }}>
                {[
                  { label: "Package No", val: `#${viewPkg.packageNo}` },
                  { label: "Department", val: viewPkg.department || "—" },
                  { label: "Dept. Code", val: viewPkg.department_code || "—" },
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
              <div
                style={{ ...css.card, padding: "16px 18px", marginBottom: 0 }}
              >
                <div style={{ ...css.cardTitle, marginBottom: 10 }}>
                  <div style={css.sectionLine} /> Items (
                  {(viewPkg.items || []).length})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 50px 1fr",
                    gap: "4px 12px",
                    padding: "6px 4px",
                    borderBottom: `2px solid ${tokens.border}`,
                    marginBottom: 4,
                  }}
                >
                  {["Item Name", "Price", "Qty", "Bill Type"].map((h) => (
                    <span key={h} style={css.label}>
                      {h}
                    </span>
                  ))}
                </div>
                {(viewPkg.items || []).map((item, i) => (
                  <div key={i} style={css.viewItemRow}>
                    <span style={{ fontWeight: 600, color: tokens.text }}>
                      {item.itemName}
                    </span>
                    <span style={css.pricePill}>
                      ₹ {parseFloat(item.price || 0).toLocaleString("en-IN")}
                    </span>
                    <span style={{ color: tokens.muted }}>
                      ×{item.quantity}
                    </span>
                    <span style={{ color: tokens.textSm }}>
                      {item.billTypeNo || "—"}
                    </span>
                  </div>
                ))}
                <div style={css.totalRow}>
                  <span style={{ color: tokens.muted, fontWeight: 500 }}>
                    Total:
                  </span>
                  <span>
                    ₹{" "}
                    {parseFloat(viewPkg.totalPrice || 0).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div style={css.modalFoot}>
              <button
                style={css.btn("ghost")}
                onClick={() => {
                  handleEdit(viewPkg);
                  setViewPkg(null);
                }}
              >
                ✏️ Edit
              </button>
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

export default Package;
