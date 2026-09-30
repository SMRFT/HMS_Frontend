import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  InvTheme,
  InvPageHeader,
  InvPageTitle,
  InvPageSubtitle,
  InvAddBtn,
  InvTopToolbar,
  InvPagination,
  InvTableWrapper,
  InvTable,
  InvTh,
  InvTd,
  InvTr,
  InvBadge,
  InvActionBtn,
  InvModalOverlay,
  InvModalContainer,
  InvModalHeader,
  InvModalTitle,
  InvModalCloseBtn,
  InvModalBody,
  InvModalFooter,
  InvFormGrid,
  InvFormField,
  InvFormLabel,
  InvFormError,
  InvInput,
  InvSelect,
  InvEmptyState,
  InvToast,
  getTodayDateString,
} from "./InventoryUIHelper";

const PageContainer = styled.div`
  padding: 18px 24px;
  background: ${InvTheme.background};
  min-height: calc(100vh - 70px);
  font-family: ${InvTheme.font};
`;

const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: ${InvTheme.shadowSm};
  overflow: hidden;
  border: 1px solid ${InvTheme.border};
`;

const FormSectionTitle = styled.h4`
  font-size: 0.84rem;
  font-weight: 700;
  color: ${InvTheme.primaryDark};
  margin: 14px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${InvTheme.border};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OutletGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const OutletCard = styled.div`
  background: #f8fafc;
  border: 1px solid ${InvTheme.border};
  border-radius: 6px;
  padding: 12px;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${InvTheme.textMain};
  cursor: pointer;
  input[type="checkbox"] {
    accent-color: ${InvTheme.primary};
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

// Searchable Composition Selector
const ComboWrapper = styled.div`
  position: relative;
`;

const ComboDropdown = styled.ul`
  position: absolute;
  z-index: 1050;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  max-height: 180px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid ${InvTheme.borderMedium};
  border-radius: 6px;
  box-shadow: ${InvTheme.shadowMd};
  list-style: none;
  margin: 0;
  padding: 4px 0;
`;

const ComboOption = styled.li`
  padding: 7px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  color: ${InvTheme.textMain};
  background: ${(p) => (p.highlighted ? InvTheme.primaryLight : "transparent")};
  &:hover {
    background: ${InvTheme.primaryLight};
    color: ${InvTheme.primaryDark};
  }
`;

const SearchableCompositionSelect = ({ compositions, value, onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedComp = compositions.find((c) => String(c.composition_id) === String(value));

  useEffect(() => {
    if (selectedComp) setQuery(selectedComp.composition_name);
    else if (!value) setQuery("");
  }, [value, selectedComp]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (selectedComp) setQuery(selectedComp.composition_name);
        else setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [selectedComp]);

  const filtered = compositions.filter((c) =>
    c.composition_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ComboWrapper ref={containerRef}>
      <InvInput
        style={{ width: "100%" }}
        value={query}
        placeholder="Type to search generic salt..."
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <ComboDropdown>
          {filtered.length === 0 ? (
            <li style={{ padding: "8px 12px", color: InvTheme.textMuted, fontSize: "0.8rem" }}>
              No matching composition
            </li>
          ) : (
            filtered.map((c) => (
              <ComboOption
                key={c.composition_id}
                highlighted={String(c.composition_id) === String(value)}
                onMouseDown={() => {
                  onChange(String(c.composition_id));
                  setQuery(c.composition_name);
                  setOpen(false);
                }}
              >
                {c.composition_name}
              </ComboOption>
            ))
          )}
        </ComboDropdown>
      )}
    </ComboWrapper>
  );
};

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  item_name: "",
  item_last_name: "",
  category: "",
  hsn: "",
  brand_name: "",
  chemical_composition: "",
  high_risk: false,
  look_alike: false,
  sound_alike: false,
  reorder_level: "",
  IP_available: true,
  IP_shelf_no: "",
  IP_rack_no: "",
  OP_available: true,
  OP_shelf_no: "",
  OP_rack_no: "",
  G_available: true,
  G_shelf_no: "",
  G_rack_no: "",
  is_blocked: false,
  blocked_reason: "",
};

const PharmacyItem = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  // Item Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingItemName, setTrackingItemName] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchItems = useCallback(
    async (p = currentPage, size = pageSize, q = search, cat = categoryFilter) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(p),
          page_size: String(size),
        });
        if (q && q.trim()) query.append("search", q.trim());
        if (cat && cat.trim()) query.append("category", cat.trim());

        const res = await apiRequest(`${baseUrl}pharmacy_items/?${query.toString()}`, "GET");
        if (res && res.success) {
          const payload = res.data;
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results)
            ? payload.results
            : [];
          const total =
            payload?.total_records ??
            payload?.count ??
            res?.count ??
            (Array.isArray(payload) ? payload.length : list.length);
          const pages = payload?.total_pages ?? res?.total_pages ?? Math.max(1, Math.ceil(total / size));

          setItems(list);
          setTotalCount(total);
          setTotalPages(pages);
          setCurrentPage(payload?.current_page || p);
        } else {
          setItems([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch pharmacy items:", err);
        showToast("Failed to fetch items", "error");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, categoryFilter]
  );

  const fetchCategories = async () => {
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-category/`, "GET");
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setCategories(list);
    } catch {
      console.error("Failed to load categories");
    }
  };

  const fetchCompositions = async () => {
    try {
      const res = await apiRequest(`${baseUrl}chemical-composition/`, "GET");
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setCompositions(list);
    } catch {
      console.error("Failed to load compositions");
    }
  };

  useEffect(() => {
    fetchItems(currentPage, pageSize, search, categoryFilter);
  }, [currentPage, pageSize, search, categoryFilter, fetchItems]);

  useEffect(() => {
    fetchCategories();
    fetchCompositions();
  }, []);

  const handleTrackItem = async (item) => {
    setTrackingItemName(item.item_name);
    setTrackingModalOpen(true);
    setTrackingData(null);
    setTrackingLoading(true);
    try {
      const res = await apiRequest(`${baseUrl}get_pharmacy_item_tracking/?item_id=${item.item_id}`, "GET");
      if (res && res.success) {
        setTrackingData(res.data);
      } else {
        showToast(res?.error || "Failed to fetch tracking data", "error");
      }
    } catch {
      showToast("Error fetching tracking data", "error");
    } finally {
      setTrackingLoading(false);
    }
  };

  const getCompositionName = (id) => {
    if (!id) return "—";
    const comp = compositions.find((c) => String(c.composition_id) === String(id));
    return comp ? comp.composition_name : String(id);
  };

  const getCategoryName = (id) => {
    if (!id) return "—";
    const cat = categories.find((c) => String(c.category_id) === String(id));
    return cat ? cat.category_name : String(id);
  };

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.item_name || "",
      item_last_name: item.item_last_name || "",
      category: item.category != null ? String(item.category) : "",
      hsn: item.hsn || "",
      brand_name: item.brand_name || "",
      chemical_composition: item.chemical_composition != null ? String(item.chemical_composition) : "",
      high_risk: !!item.high_risk,
      look_alike: !!item.look_alike,
      sound_alike: !!item.sound_alike,
      reorder_level: item.reorder_level ?? "",
      IP_available: item.IP_available !== false,
      IP_shelf_no: item.IP_shelf_no || "",
      IP_rack_no: item.IP_rack_no || "",
      OP_available: item.OP_available !== false,
      OP_shelf_no: item.OP_shelf_no || "",
      OP_rack_no: item.OP_rack_no || "",
      G_available: item.G_available !== false,
      G_shelf_no: item.G_shelf_no || "",
      G_rack_no: item.G_rack_no || "",
      is_blocked: !!item.is_blocked,
      blocked_reason: item.blocked_reason || "",
    });
    setEditId(item.item_id);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine / item?")) return;
    try {
      const response = await apiRequest(`${baseUrl}pharmacy_items/${id}/`, "DELETE");
      if (response && response.success) {
        showToast("Item deleted successfully");
        fetchItems();
      } else {
        showToast(response?.error || "Delete failed", "error");
      }
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.item_name.trim()) errs.item_name = "Item name is required";
    if (!form.category) errs.category = "Category is required";
    if (form.is_blocked && !form.blocked_reason.trim())
      errs.blocked_reason = "Reason required when item is blocked";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const url = editId ? `${baseUrl}pharmacy_items/${editId}/` : `${baseUrl}pharmacy_items/`;
      const method = editId ? "PUT" : "POST";

      const payload = {
        ...form,
        is_active: true,
        reorder_level: Number(form.reorder_level) || 0,
        category: form.category ? Number(form.category) : null,
        brand_name: form.brand_name,
        chemical_composition: form.chemical_composition || null,
        IP_shelf_no: form.IP_available ? form.IP_shelf_no : "",
        IP_rack_no: form.IP_available ? form.IP_rack_no : "",
        OP_shelf_no: form.OP_available ? form.OP_shelf_no : "",
        OP_rack_no: form.OP_available ? form.OP_rack_no : "",
        G_shelf_no: form.G_available ? form.G_shelf_no : "",
        G_rack_no: form.G_available ? form.G_rack_no : "",
        blocked_reason: form.is_blocked ? form.blocked_reason : "",
      };

      const res = await apiRequest(url, method, payload);
      if (res && res.success) {
        showToast(editId ? "Item updated successfully" : "Item added successfully");
        setShowModal(false);
        fetchItems();
      } else {
        showToast(JSON.stringify(res?.data || res?.error || "Save failed"), "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  return (
    <PageContainer>
      {toast && <InvToast error={toast.type === "error"}>{toast.msg}</InvToast>}

      <ContentCard>
        {/* ── Header ── */}
        <InvPageHeader>
          <div>
            <InvPageTitle>💊 Pharmacy Item Master</InvPageTitle>
            <InvPageSubtitle>Master catalogue for medicines, formulations, generic compositions, and outlets</InvPageSubtitle>
          </div>
          <InvAddBtn onClick={handleOpenAdd}>+ Add Pharmacy Item</InvAddBtn>
        </InvPageHeader>

        {/* ── Top Toolbar (Show Upto, Search, Category Filter) ── */}
        <InvTopToolbar
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search Item name, composition, brand, HSN..."
          totalRecords={totalCount}
          customFilters={
            <InvSelect
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </InvSelect>
          }
        />

        {/* ── Table ── */}
        <InvTableWrapper>
          <InvTable>
            <thead>
              <tr>
                <InvTh style={{ width: 50 }}>#</InvTh>
                <InvTh>Item Name</InvTh>
                <InvTh>Category</InvTh>
                <InvTh>Brand Name</InvTh>
                <InvTh>Chemical Composition</InvTh>
                <InvTh>HSN</InvTh>
                <InvTh>Reorder</InvTh>
                <InvTh>Outlet Avail.</InvTh>
                <InvTh>Flags</InvTh>
                <InvTh style={{ textAlign: "center", width: 170 }}>Actions</InvTh>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <InvTd colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                    Loading pharmacy items...
                  </InvTd>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <InvTd colSpan={10}>
                    <InvEmptyState>
                      No pharmacy items found for the selected filter.
                    </InvEmptyState>
                  </InvTd>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <InvTr key={item.item_id || item._id || idx}>
                    <InvTd>{startIdx + idx}</InvTd>
                    <InvTd style={{ fontWeight: 700, color: InvTheme.primaryDark }}>
                      {item.item_name}
                      {item.item_last_name && (
                        <span style={{ color: InvTheme.textMuted, fontWeight: 400, marginLeft: 4 }}>
                          ({item.item_last_name})
                        </span>
                      )}
                    </InvTd>
                    <InvTd>
                      <InvBadge bg="#f1f5f9" color="#334155" border="#cbd5e1">
                        {getCategoryName(item.category)}
                      </InvBadge>
                    </InvTd>
                    <InvTd>{item.brand_name || "—"}</InvTd>
                    <InvTd style={{ fontSize: "0.8rem", maxWidth: 180 }}>
                      {getCompositionName(item.chemical_composition)}
                    </InvTd>
                    <InvTd style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.hsn || "—"}</InvTd>
                    <InvTd style={{ fontWeight: 700, color: InvTheme.accent }}>
                      {item.reorder_level ?? "0"}
                    </InvTd>
                    <InvTd style={{ fontSize: "0.76rem" }}>
                      <span style={{ color: item.IP_available ? "#16a34a" : "#94a3b8" }}>IP</span>
                      {" · "}
                      <span style={{ color: item.OP_available ? "#16a34a" : "#94a3b8" }}>OP</span>
                      {" · "}
                      <span style={{ color: item.G_available ? "#16a34a" : "#94a3b8" }}>GEN</span>
                    </InvTd>
                    <InvTd>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {item.high_risk && <InvBadge bg="#fee2e2" color="#b91c1c" border="#fca5a5">HR</InvBadge>}
                        {item.look_alike && <InvBadge bg="#fef3c7" color="#92400e" border="#fde68a">LA</InvBadge>}
                        {item.sound_alike && <InvBadge bg="#fef3c7" color="#92400e" border="#fde68a">SA</InvBadge>}
                        {item.is_blocked && <InvBadge bg="#fee2e2" color="#b91c1c" border="#fca5a5">Blocked</InvBadge>}
                      </div>
                    </InvTd>
                    <InvTd style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: 4 }}>
                        <InvActionBtn onClick={() => handleTrackItem(item)} title="Track Batch & Stock">
                          🔍 Track
                        </InvActionBtn>
                        <InvActionBtn onClick={() => handleEdit(item)}>Edit</InvActionBtn>
                        <InvActionBtn danger onClick={() => handleDelete(item.item_id)}>
                          ✕
                        </InvActionBtn>
                      </div>
                    </InvTd>
                  </InvTr>
                ))
              )}
            </tbody>
          </InvTable>
        </InvTableWrapper>

        {/* ── Bottom Pagination ── */}
        <InvPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalCount}
          onPageChange={setCurrentPage}
        />
      </ContentCard>

      {/* ── Add / Edit Item Modal ── */}
      {showModal && (
        <InvModalOverlay onClick={() => setShowModal(false)}>
          <InvModalContainer maxWidth="900px" onClick={(e) => e.stopPropagation()}>
            <InvModalHeader>
              <InvModalTitle>💊 {editId ? "Edit Pharmacy Item" : "Add Pharmacy Item"}</InvModalTitle>
              <InvModalCloseBtn onClick={() => setShowModal(false)}>✕</InvModalCloseBtn>
            </InvModalHeader>

            <InvModalBody>
              <FormSectionTitle>📋 Basic Information</FormSectionTitle>
              <InvFormGrid minWidth="240px">
                <InvFormField>
                  <InvFormLabel required>Item Name</InvFormLabel>
                  <InvInput
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    placeholder="Brand / Trade Name"
                    style={errors.item_name ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.item_name && <InvFormError>{errors.item_name}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Item Extended / Last Name</InvFormLabel>
                  <InvInput
                    name="item_last_name"
                    value={form.item_last_name}
                    onChange={handleChange}
                    placeholder="e.g. 500mg Strip, 100ml Syrup"
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel required>Category</InvFormLabel>
                  <InvSelect
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={errors.category ? { borderColor: InvTheme.danger } : {}}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </InvSelect>
                  {errors.category && <InvFormError>{errors.category}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Chemical / Generic Composition</InvFormLabel>
                  <SearchableCompositionSelect
                    compositions={compositions}
                    value={form.chemical_composition}
                    onChange={(val) => setForm((p) => ({ ...p, chemical_composition: val }))}
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Brand / Manufacturer</InvFormLabel>
                  <InvInput
                    name="brand_name"
                    value={form.brand_name}
                    onChange={handleChange}
                    placeholder="e.g. Cipla, Sun Pharma, Abbott"
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>HSN Code</InvFormLabel>
                  <InvInput
                    name="hsn"
                    value={form.hsn}
                    onChange={handleChange}
                    placeholder="e.g. 3004"
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Reorder Level (Min Qty)</InvFormLabel>
                  <InvInput
                    type="number"
                    name="reorder_level"
                    value={form.reorder_level}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                  />
                </InvFormField>
              </InvFormGrid>

              <FormSectionTitle>🏬 Outlet Availability & Storage Location (Shelf / Rack)</FormSectionTitle>
              <OutletGrid>
                <OutletCard>
                  <div style={{ marginBottom: 8 }}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="IP_available"
                        checked={form.IP_available}
                        onChange={handleChange}
                      />
                      Available in IP Pharmacy
                    </CheckboxLabel>
                  </div>
                  {form.IP_available && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <InvFormField>
                        <InvFormLabel>Shelf No.</InvFormLabel>
                        <InvInput
                          name="IP_shelf_no"
                          value={form.IP_shelf_no}
                          onChange={handleChange}
                          placeholder="e.g. S-12"
                        />
                      </InvFormField>
                      <InvFormField>
                        <InvFormLabel>Rack No.</InvFormLabel>
                        <InvInput
                          name="IP_rack_no"
                          value={form.IP_rack_no}
                          onChange={handleChange}
                          placeholder="e.g. R-04"
                        />
                      </InvFormField>
                    </div>
                  )}
                </OutletCard>

                <OutletCard>
                  <div style={{ marginBottom: 8 }}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="OP_available"
                        checked={form.OP_available}
                        onChange={handleChange}
                      />
                      Available in OP Pharmacy
                    </CheckboxLabel>
                  </div>
                  {form.OP_available && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <InvFormField>
                        <InvFormLabel>Shelf No.</InvFormLabel>
                        <InvInput
                          name="OP_shelf_no"
                          value={form.OP_shelf_no}
                          onChange={handleChange}
                          placeholder="e.g. S-02"
                        />
                      </InvFormField>
                      <InvFormField>
                        <InvFormLabel>Rack No.</InvFormLabel>
                        <InvInput
                          name="OP_rack_no"
                          value={form.OP_rack_no}
                          onChange={handleChange}
                          placeholder="e.g. R-01"
                        />
                      </InvFormField>
                    </div>
                  )}
                </OutletCard>

                <OutletCard>
                  <div style={{ marginBottom: 8 }}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="G_available"
                        checked={form.G_available}
                        onChange={handleChange}
                      />
                      Available in General Store
                    </CheckboxLabel>
                  </div>
                  {form.G_available && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <InvFormField>
                        <InvFormLabel>Shelf No.</InvFormLabel>
                        <InvInput
                          name="G_shelf_no"
                          value={form.G_shelf_no}
                          onChange={handleChange}
                          placeholder="e.g. G-05"
                        />
                      </InvFormField>
                      <InvFormField>
                        <InvFormLabel>Rack No.</InvFormLabel>
                        <InvInput
                          name="G_rack_no"
                          value={form.G_rack_no}
                          onChange={handleChange}
                          placeholder="e.g. GR-02"
                        />
                      </InvFormField>
                    </div>
                  )}
                </OutletCard>
              </OutletGrid>

              <FormSectionTitle>⚠️ Safety & Compliance Flags</FormSectionTitle>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "10px 0" }}>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="high_risk"
                    checked={form.high_risk}
                    onChange={handleChange}
                  />
                  High Risk (High Alert Drug)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="look_alike"
                    checked={form.look_alike}
                    onChange={handleChange}
                  />
                  Look-Alike (LASA)
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="sound_alike"
                    checked={form.sound_alike}
                    onChange={handleChange}
                  />
                  Sound-Alike (LASA)
                </CheckboxLabel>
                <CheckboxLabel style={{ color: InvTheme.danger }}>
                  <input
                    type="checkbox"
                    name="is_blocked"
                    checked={form.is_blocked}
                    onChange={handleChange}
                  />
                  Block / Restrict Item
                </CheckboxLabel>
              </div>

              {form.is_blocked && (
                <InvFormField style={{ marginTop: 10 }}>
                  <InvFormLabel required>Blocked / Restriction Reason</InvFormLabel>
                  <InvInput
                    name="blocked_reason"
                    value={form.blocked_reason}
                    onChange={handleChange}
                    placeholder="Explain why this medicine is blocked / banned..."
                    style={errors.blocked_reason ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.blocked_reason && <InvFormError>{errors.blocked_reason}</InvFormError>}
                </InvFormField>
              )}
            </InvModalBody>

            <InvModalFooter>
              <InvAddBtn secondary onClick={() => setShowModal(false)}>
                Cancel
              </InvAddBtn>
              <InvAddBtn onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Item" : "Save Item"}
              </InvAddBtn>
            </InvModalFooter>
          </InvModalContainer>
        </InvModalOverlay>
      )}

      {/* ── Tracking Modal ── */}
      {trackingModalOpen && (
        <InvModalOverlay onClick={() => setTrackingModalOpen(false)}>
          <InvModalContainer maxWidth="800px" onClick={(e) => e.stopPropagation()}>
            <InvModalHeader>
              <InvModalTitle>🔍 Item Stock & Batch Tracking — {trackingItemName}</InvModalTitle>
              <InvModalCloseBtn onClick={() => setTrackingModalOpen(false)}>✕</InvModalCloseBtn>
            </InvModalHeader>

            <InvModalBody>
              {trackingLoading ? (
                <div style={{ textAlign: "center", padding: 30 }}>Loading tracking details...</div>
              ) : !trackingData ? (
                <InvEmptyState>No stock / batch data found for this item.</InvEmptyState>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                    <div style={{ background: "#f0fdfa", padding: "10px 16px", borderRadius: 6, border: `1px solid ${InvTheme.primaryBorder}` }}>
                      <div style={{ fontSize: "0.75rem", color: InvTheme.textMuted }}>Total Stock</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: InvTheme.primaryDark }}>
                        {trackingData.total_stock ?? 0}
                      </div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "10px 16px", borderRadius: 6, border: `1px solid ${InvTheme.border}` }}>
                      <div style={{ fontSize: "0.75rem", color: InvTheme.textMuted }}>Active Batches</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: InvTheme.textMain }}>
                        {trackingData.batches?.length ?? 0}
                      </div>
                    </div>
                  </div>

                  <FormSectionTitle>Batch Breakdown</FormSectionTitle>
                  <InvTableWrapper>
                    <InvTable>
                      <thead>
                        <tr>
                          <InvTh>Batch No.</InvTh>
                          <InvTh>Outlet</InvTh>
                          <InvTh>Available Qty</InvTh>
                          <InvTh>MRP</InvTh>
                          <InvTh>Expiry Date</InvTh>
                        </tr>
                      </thead>
                      <tbody>
                        {(trackingData.batches || []).length === 0 ? (
                          <tr>
                            <InvTd colSpan={5} style={{ textAlign: "center" }}>No active batches</InvTd>
                          </tr>
                        ) : (
                          trackingData.batches.map((b, i) => (
                            <InvTr key={i}>
                              <InvTd style={{ fontWeight: 600 }}>{b.batch_number || "—"}</InvTd>
                              <InvTd>{b.outlet_code || "Main Store"}</InvTd>
                              <InvTd style={{ fontWeight: 700, color: InvTheme.primary }}>{b.available_stock ?? b.quantity ?? 0}</InvTd>
                              <InvTd>₹{b.mrp ?? "0.00"}</InvTd>
                              <InvTd>{b.expiry_date || "—"}</InvTd>
                            </InvTr>
                          ))
                        )}
                      </tbody>
                    </InvTable>
                  </InvTableWrapper>
                </div>
              )}
            </InvModalBody>

            <InvModalFooter>
              <InvAddBtn secondary onClick={() => setTrackingModalOpen(false)}>
                Close
              </InvAddBtn>
            </InvModalFooter>
          </InvModalContainer>
        </InvModalOverlay>
      )}
    </PageContainer>
  );
};

export default PharmacyItem;