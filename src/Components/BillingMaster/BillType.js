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
  amber: "#F59E0B",
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
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
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
    color: tokens.muted,
  },
  input: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  },
  select: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    width: "100%",
    cursor: "pointer",
    background: tokens.white,
    boxSizing: "border-box",
    outline: "none",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: "8px",
    borderRadius: 6,
    background: tokens.bg,
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
      whiteSpace: "nowrap",
    };
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
    width: "min(980px, 96vw)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHead: {
    padding: "18px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBody: { padding: "24px", overflowY: "auto" },
  statusBadge: (active) => ({
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: active ? `${tokens.green}18` : `${tokens.red}18`,
    color: active ? tokens.green : tokens.red,
    border: `1px solid ${active ? tokens.green : tokens.red}40`,
  }),
  priceInput: {
    height: 34,
    padding: "0 10px",
    fontSize: 13,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 7,
    width: "100%",
    boxSizing: "border-box",
    textAlign: "right",
    outline: "none",
  },
};

const Field = ({ label, children }) => (
  <div style={css.fieldWrap}>
    <span style={css.label}>{label}</span>
    {children}
  </div>
);

const EMPTY_FORM = {
  bill_name: "",

  payment_mode: "both",
  centralCash: false,
  is_allowAdvance: false,
  is_active: true,
  is_allowDiscount: false,
  sales_return: false,
  GST_export: false,
  IP_billType: false,
  ward_request: false,
  med_wise_discount: false,
  med_dispatch: false,
  department_code: "",
  billTypeNo: "",
};

const BillType = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  // All investigation categories with their items
  // [{ billTypeNo, BillType, Items: [{ itemName, "10": "1200", ... }] }]
  const [invCategories, setInvCategories] = useState([]);

  // Prices being set for this bill type: { "<invBillTypeNo>:<itemName>": "price" }
  const [itemPrices, setItemPrices] = useState({});

  // Which investigation category is selected in the dropdown
  const [selectedInvCat, setSelectedInvCat] = useState("");

  // Track original category when editing, so backend can remove old prices if category changed
  const [originalInvCat, setOriginalInvCat] = useState("");
  const [viewRec, setViewRec] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    const q = filters.search ? `?search=${filters.search}` : "";
    const result = await apiRequest(`${HMSURL}bill-types_get/${q}`, "GET");
    if (result.success) setRecords(result.data?.records || []);
    setLoading(false);
  };

  const fetchInvCategories = async () => {
    const result = await apiRequest(
      `${HMSURL}investigation-prices_get/`,
      "GET",
    );
    if (result.success) setInvCategories(result.data?.records || []);
  };

  const [departments, setDepartments] = useState([]);

  const fetchDepartments = async () => {
    const result = await apiRequest(`${HMSURL}departments/`, "GET");
    if (result.success) setDepartments(result.data?.departments || []);
  };

  useEffect(() => {
    fetchRecords();
    fetchInvCategories();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM });
    setItemPrices({});
    setSelectedInvCat("");
    setOriginalInvCat("");
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setFormData({ ...rec });

    const billTypeKey = String(rec.bill_type);
    const matchedCat = invCategories.find((cat) =>
      (cat.Items || []).some((item) => item[billTypeKey] !== undefined),
    );

    const prices = {};
    if (matchedCat) {
      (matchedCat.Items || []).forEach((item) => {
        const key = `${matchedCat.billTypeNo}:${item.itemName}`;
        prices[key] = item[billTypeKey] || "";
      });
      setSelectedInvCat(matchedCat.billTypeNo);
      setOriginalInvCat(matchedCat.billTypeNo);
    } else {
      setSelectedInvCat("");
      setOriginalInvCat("");
    }

    setItemPrices(prices);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handlePriceChange = (invBillTypeNo, itemName, value) => {
    const key = `${invBillTypeNo}:${itemName}`;
    setItemPrices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.bill_name) return alert("Bill Name is required.");
    if (!formData.billTypeNo)
      return alert("Please select an Investigation Category.");

    const method = isEditMode ? "PATCH" : "POST";
    // Use bill_type integer as the unique URL param on edit — billTypeNo can repeat
    const url = isEditMode
      ? `${HMSURL}bill-types/update/${formData.bill_type}/`
      : `${HMSURL}bill-types/create/`;

    const payload = { ...formData };
    if (!isEditMode) delete payload.bill_type;

    const result = await apiRequest(url, method, payload);
    if (!result.success)
      return alert(result.error || "Failed to save bill type.");

    const billTypeInt = isEditMode
      ? String(formData.bill_type)
      : String(result.data?.bill_type ?? "");

    if (billTypeInt) {
      await apiRequest(
        `${HMSURL}investigation-price/patch-bill-type/`,
        "PATCH",
        {
          bill_type: billTypeInt,
          prices: itemPrices,
          old_inv_billTypeNo:
            isEditMode && originalInvCat !== selectedInvCat
              ? originalInvCat
              : "",
        },
      );
    }

    alert(isEditMode ? "Updated!" : "Created!");
    setShowModal(false);
    fetchRecords();
    fetchInvCategories();
  };

  const handleDelete = async (billTypeInt) => {
    if (!window.confirm("Delete record?")) return;
    const result = await apiRequest(
      `${HMSURL}bill-types/delete/${billTypeInt}/`,
      "PATCH",
    );
    if (result.success) fetchRecords();
  };

  return (
    <PageWrapper>
      <Container>
        <div style={css.pageHeader}>
          <h1 style={css.pageTitle}>
            <span style={css.titleDot} /> Bill Type Configuration
          </h1>
          <button style={css.btn("primary")} onClick={openCreate}>
            + New Bill Type
          </button>
        </div>

        <TableWrapper>
          <div
            style={{
              padding: 15,
              borderBottom: `1px solid ${tokens.border}`,
              display: "flex",
              gap: 10,
            }}
          >
            <input
              style={css.input}
              placeholder="Search by name or code..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && fetchRecords()}
            />
            <button style={css.btn("ghost")} onClick={fetchRecords}>
              Search
            </button>
          </div>

          <Table>
            <thead>
              <Tr>
                <Th>Code</Th>
                <Th>Bill Name</Th>
                <Th>Bill Type ID</Th>
                <Th>Department</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td
                    colSpan={7}
                    style={{ textAlign: "center", color: tokens.muted }}
                  >
                    Loading...
                  </Td>
                </Tr>
              ) : records.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={7}
                    style={{ textAlign: "center", color: tokens.muted }}
                  >
                    No records found.
                  </Td>
                </Tr>
              ) : (
                records.map((rec) => (
                  <Tr key={rec.bill_type}>
                    <Td>
                      <strong>{rec.billTypeNo}</strong>
                    </Td>
                    <Td>{rec.bill_name}</Td>
                    <Td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: `${tokens.sky}18`,
                          color: tokens.sky,
                          border: `1px solid ${tokens.sky}30`,
                        }}
                      >
                        {rec.bill_type}
                      </span>
                    </Td>
                    <Td>
                      {departments.find(
                        (d) => d.department_code === rec.department_code,
                      )?.department_name ||
                        rec.department_code ||
                        "—"}
                    </Td>
                    <Td>
                      <span style={css.statusBadge(rec.is_active)}>
                        {rec.is_active ? "Active" : "Inactive"}
                      </span>
                    </Td>
                    <Td>
                      <button
                        style={{
                          ...css.btn("primary"),
                          padding: "4px 8px",
                          marginRight: 5,
                        }}
                        onClick={() => setViewRec(rec)}
                      >
                        View
                      </button>
                      <button
                        style={{
                          ...css.btn("ghost"),
                          padding: "4px 8px",
                          marginRight: 5,
                        }}
                        onClick={() => openEdit(rec)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...css.btn("danger"), padding: "4px 8px" }}
                        onClick={() => handleDelete(rec.bill_type)}
                      >
                        Delete
                      </button>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>

      {showModal && (
        <div style={css.modalOverlay}>
          <div style={css.modalBox}>
            <div style={css.modalHead}>
              <span style={{ color: "#fff", fontWeight: 700 }}>
                {isEditMode ? "Edit Bill Type" : "Create Bill Type"}
              </span>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            <div style={css.modalBody}>
              {/* Primary Info */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Primary Info
                </div>
                <div style={css.grid3}>
                  <Field label="Bill Name">
                    <input
                      style={css.input}
                      name="bill_name"
                      value={formData.bill_name}
                      onChange={handleInputChange}
                    />
                  </Field>
                  <Field label="Bill Type ID">
                    <input
                      style={{
                        ...css.input,
                        background: tokens.bg,
                        color: tokens.muted,
                      }}
                      value={isEditMode ? formData.bill_type : "Auto-generated"}
                      disabled
                    />
                  </Field>

                  <Field label="Payment Mode">
                    <select
                      style={css.select}
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleInputChange}
                    >
                      <option value="both">Both</option>
                      <option value="cash">Cash</option>
                      <option value="credit">Credit</option>
                    </select>
                  </Field>
                  <Field label="Department">
                    <select
                      style={css.select}
                      value={formData.department_code}
                      onChange={(e) => {
                        const selected = departments.find(
                          (d) => d.department_code === e.target.value,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          department_code: selected?.department_code || "",
                        }));
                      }}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_code}
                          value={dept.department_code}
                        >
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Permissions */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Permissions & Rules
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[
                    { id: "is_active", label: "Active" },
                    { id: "centralCash", label: "Central Cash" },
                    { id: "is_allowAdvance", label: "Allow Advance" },
                    { id: "is_allowDiscount", label: "Allow Discount" },
                    { id: "sales_return", label: "Sales Return" },
                    { id: "IP_billType", label: "IP Bill" },
                    { id: "GST_export", label: "GST Export" },
                    { id: "ward_request", label: "Ward Request" },
                    { id: "med_dispatch", label: "Med Dispatch" },
                    { id: "med_wise_discount", label: "Med-wise Disc" },
                  ].map((check) => (
                    <label key={check.id} style={css.checkboxLabel}>
                      <input
                        type="checkbox"
                        name={check.id}
                        checked={formData[check.id]}
                        onChange={handleInputChange}
                      />
                      {check.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Investigation Prices — select category first, then enter prices */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Investigation Prices
                </div>

                {/* Category dropdown */}
                <div style={{ marginBottom: 16 }}>
                  <Field label="Select Investigation Category">
                    <select
                      style={css.select}
                      value={selectedInvCat}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedInvCat(val);
                        // Always update billTypeNo from selected category (both create and edit)
                        setFormData((prev) => ({ ...prev, billTypeNo: val }));
                        // Clear prices when switching to a different category
                        setItemPrices({});
                      }}
                    >
                      <option value="">-- Select Category --</option>
                      {invCategories.map((cat) => (
                        <option key={cat.billTypeNo} value={cat.billTypeNo}>
                          {cat.BillType} ({cat.billTypeNo})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Items table — shown only after selecting a category */}
                {(() => {
                  if (!selectedInvCat)
                    return (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px 0",
                          color: tokens.muted,
                          fontSize: 13,
                        }}
                      >
                        Select a category above to enter prices.
                      </div>
                    );

                  const cat = invCategories.find(
                    (c) => c.billTypeNo === selectedInvCat,
                  );
                  if (!cat) return null;

                  return (
                    <>
                      {!cat.Items || cat.Items.length === 0 ? (
                        <div
                          style={{
                            padding: "12px",
                            color: tokens.muted,
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          No items in this category.
                        </div>
                      ) : (
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                          }}
                        >
                          <thead>
                            <tr style={{ background: tokens.bg }}>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  color: tokens.muted,
                                  borderBottom: `2px solid ${tokens.border}`,
                                }}
                              >
                                Item Name
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "right",
                                  fontWeight: 600,
                                  color: tokens.muted,
                                  borderBottom: `2px solid ${tokens.border}`,
                                  width: 160,
                                }}
                              >
                                Price (₹)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.Items.map((item, idx) => (
                              <tr
                                key={item.itemName}
                                style={{
                                  background:
                                    idx % 2 === 0 ? tokens.white : tokens.bg,
                                }}
                              >
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    color: tokens.text,
                                    borderBottom: `1px solid ${tokens.border}`,
                                  }}
                                >
                                  {item.itemName}
                                </td>
                                <td
                                  style={{
                                    padding: "5px 12px",
                                    borderBottom: `1px solid ${tokens.border}`,
                                  }}
                                >
                                  <input
                                    style={css.priceInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={
                                      itemPrices[
                                        `${cat.billTypeNo}:${item.itemName}`
                                      ] ?? ""
                                    }
                                    onChange={(e) =>
                                      handlePriceChange(
                                        cat.billTypeNo,
                                        item.itemName,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div
              style={{
                padding: 20,
                textAlign: "right",
                borderTop: `1px solid ${tokens.border}`,
              }}
            >
              <button
                style={{ ...css.btn("ghost"), marginRight: 10 }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button style={css.btn("primary")} onClick={handleSubmit}>
                {isEditMode ? "Update Changes" : "Save Bill Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ─────────────────────────────────────────────── */}
      {viewRec && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalBox, width: "min(620px, 96vw)" }}>
            <div style={css.modalHead}>
              <span style={{ color: "#fff", fontWeight: 700 }}>
                Bill Type Details
              </span>
              <button
                onClick={() => setViewRec(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            <div style={css.modalBody}>
              {/* Identity */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Identity
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "12px 18px",
                  }}
                >
                  {[
                    { label: "Bill Name", value: viewRec.bill_name },
                    { label: "Bill Type ID", value: viewRec.bill_type },
                    { label: "Bill Type No", value: viewRec.billTypeNo },
                    { label: "Payment Mode", value: viewRec.payment_mode },
                    {
                      label: "Department",
                      value: (() => {
                        const d = departments.find(
                          (x) => x.department_code === viewRec.department_code,
                        );
                        return d
                          ? `${d.department_name} (${d.department_code})`
                          : viewRec.department_code || "—";
                      })(),
                    },
                    {
                      label: "Status",
                      value: viewRec.is_active ? "Active" : "Inactive",
                      color: viewRec.is_active ? tokens.green : tokens.red,
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: tokens.muted,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: color || tokens.text,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div style={css.card}>
                <div style={css.cardTitle}>
                  <div style={css.sectionLine} /> Permissions & Rules
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[
                    { id: "centralCash", label: "Central Cash" },
                    { id: "is_allowAdvance", label: "Allow Advance" },
                    { id: "is_allowDiscount", label: "Allow Discount" },
                    { id: "sales_return", label: "Sales Return" },
                    { id: "IP_billType", label: "IP Bill" },
                    { id: "GST_export", label: "GST Export" },
                    { id: "ward_request", label: "Ward Request" },
                    { id: "med_dispatch", label: "Med Dispatch" },
                    { id: "med_wise_discount", label: "Med-wise Disc" },
                  ].map(({ id, label }) => (
                    <div
                      key={id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: viewRec[id]
                          ? `${tokens.green}12`
                          : tokens.bg,
                        border: `1px solid ${viewRec[id] ? tokens.green + "40" : tokens.border}`,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: viewRec[id] ? tokens.green : tokens.muted,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: viewRec[id] ? tokens.green : tokens.muted,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation prices for this bill_type */}
              {(() => {
                const billTypeKey = String(viewRec.bill_type);
                const cat = invCategories.find((c) =>
                  (c.Items || []).some(
                    (item) => item[billTypeKey] !== undefined,
                  ),
                );
                if (!cat) return null;
                const itemsWithPrice = (cat.Items || []).filter(
                  (item) => item[billTypeKey] !== undefined,
                );
                return (
                  <div style={css.card}>
                    <div style={css.cardTitle}>
                      <div style={css.sectionLine} /> Investigation Prices —{" "}
                      {cat.BillType}
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr style={{ background: tokens.bg }}>
                          <th
                            style={{
                              padding: "8px 12px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: tokens.muted,
                              borderBottom: `2px solid ${tokens.border}`,
                            }}
                          >
                            Item Name
                          </th>
                          <th
                            style={{
                              padding: "8px 12px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: tokens.muted,
                              borderBottom: `2px solid ${tokens.border}`,
                              width: 120,
                            }}
                          >
                            Price (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsWithPrice.map((item, idx) => (
                          <tr
                            key={item.itemName}
                            style={{
                              background:
                                idx % 2 === 0 ? tokens.white : tokens.bg,
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 12px",
                                color: tokens.text,
                                borderBottom: `1px solid ${tokens.border}`,
                              }}
                            >
                              {item.itemName}
                            </td>
                            <td
                              style={{
                                padding: "8px 12px",
                                textAlign: "right",
                                fontWeight: 600,
                                color: tokens.sky,
                                borderBottom: `1px solid ${tokens.border}`,
                              }}
                            >
                              ₹{item[billTypeKey]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div
              style={{
                padding: 16,
                textAlign: "right",
                borderTop: `1px solid ${tokens.border}`,
              }}
            >
              <button style={css.btn("ghost")} onClick={() => setViewRec(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default BillType;
